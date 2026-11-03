#!/usr/bin/env python3
"""Дополняет собранный book/: .md страниц, llms.txt и llms-full.txt (llmstxt.org) для нейросетей, search.json для поиска."""
import html
import json
import re
from pathlib import Path

BASE = "https://strix-org.github.io/docs/"
ROOT = Path(__file__).resolve().parent.parent
SRC, BOOK = ROOT / "src", ROOT / "book"
assert (BOOK / "index.html").exists(), "сначала mdbook build"


def lead(text):
    """Первое предложение абзаца после заголовка, без разметки ссылок."""
    para = re.search(r"^#[^\n]*\n+((?:[^\n#`|].*\n?)+)", text, re.M).group(1)
    plain = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", " ".join(para.split()))
    return re.split(r"(?<=[.!?])\s", plain)[0]


def absolute(text):
    return re.sub(r"\]\((?!https?:|#)([^)#]+\.md)", lambda m: f"]({BASE}{m[1]}", text)


def plain(fragment):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", fragment)).split())


def sections(file, page):
    """Секции страницы по заголовкам h1-h3 готового HTML: id в нём те, на которые можно сослаться."""
    main = re.search(r"<main>(.*)</main>", (BOOK / file).read_text(encoding="utf-8"), re.S)[1]
    parts = re.split(r'<h([1-3]) id="([^"]+)">(.*?)</h\1>', main, flags=re.S)
    found = [
        {"p": page, "t": plain(parts[i + 2]), "u": file if parts[i] == "1" else f"{file}#{parts[i + 1]}", "x": plain(parts[i + 3])}
        for i in range(1, len(parts), 4)
    ]
    assert found, f"нет заголовков в {file}"
    return found


pages = re.findall(r"\[(.+?)\]\((.+?\.md)\)", (SRC / "SUMMARY.md").read_text(encoding="utf-8"))
assert pages, "пустой SUMMARY.md"
home = (SRC / pages[0][1]).read_text(encoding="utf-8")
index = [f"# {pages[0][0]}", "", f"> {lead(home)}", "", "## Страницы", ""]
full = [f"# {pages[0][0]}: вся документация", "", f"Индекс страниц: {BASE}llms.txt"]
search = []

for title, path in pages:
    text = (SRC / path).read_text(encoding="utf-8")
    # mdBook публикует README как index: так же называем и его Markdown, на него ссылается head.hbs
    out = re.sub(r"README\.md$", "index.md", path)
    assert (BOOK / out).with_suffix(".html").exists(), f"нет страницы для {path}"
    note = f"> Markdown-версия {BASE}{out.removesuffix('.md')}.html. Индекс документации: {BASE}llms.txt\n\n"
    (BOOK / out).write_text(note + text, encoding="utf-8")
    index.append(f"- [{title}]({BASE}{out}): {lead(text)}")
    full += ["", "---", "", f"Источник: {BASE}{out}", "", absolute(text).strip()]
    search += sections(out.removesuffix(".md") + ".html", title)

(BOOK / "llms.txt").write_text("\n".join(index) + "\n", encoding="utf-8")
(BOOK / "llms-full.txt").write_text("\n".join(full) + "\n", encoding="utf-8")
(BOOK / "search.json").write_text(json.dumps(search, ensure_ascii=False), encoding="utf-8")
print(f"postbuild: {len(pages)} страниц, {len(search)} секций в поиске")
