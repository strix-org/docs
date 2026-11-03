(() => {
    const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

    // Лого и название в сайдбаре вместо заголовка по центру панели
    const sidebar = document.querySelector('.sidebar');
    const icon = document.querySelector('link[rel="icon"][href*="svg"], link[rel="shortcut icon"][href*="svg"]');
    if (sidebar) sidebar.prepend(el(`<a class="brand" href="${path_to_root || './'}"><img src="${icon ? icon.href : ''}" alt="">strix Lua API</a>`));

    // Поиск по search.json: подстрока находит и формы русских слов, и имена вроде ctx:cancel
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    const field = el(`<button type="button" class="search-field"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5"/></svg><span>Поиск</span><kbd>${mac ? '⌘K' : 'Ctrl K'}</kbd></button>`);
    const dialog = el(`<dialog class="search" aria-label="Поиск по документации"><input type="search" placeholder="Поиск по документации" aria-label="Что найти"><p class="search-status" role="status"></p><ul></ul></dialog>`);
    const input = dialog.querySelector('input');
    const list = dialog.querySelector('ul');
    const status = dialog.querySelector('.search-status');
    let docs;
    let active = -1;

    const open = async () => {
        if (dialog.open) return;
        dialog.showModal();
        input.select();
        try {
            docs ||= await (await fetch(path_to_root + 'search.json')).json();
            render();
        } catch {
            status.textContent = 'Поиск не загрузился. Обнови страницу и попробуй снова.';
        }
    };
    const find = (query) => {
        // shortcut: отсекаем два последних символа длинных русских слов вместо стемминга, настоящий нужен, если страниц станет сильно больше
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean).map((t) => (/^[а-яё]{5,}$/.test(t) ? t.slice(0, -2) : t));
        if (!terms.length) return [];
        const scored = [];
        for (const doc of docs) {
            const title = `${doc.p} ${doc.t}`.toLowerCase();
            const text = doc.x.toLowerCase();
            if (!terms.every((t) => title.includes(t) || text.includes(t))) continue;
            const score = terms.reduce((sum, t) => sum + (title.includes(t) ? 20 : 0) + Math.min(text.split(t).length - 1, 10), 0);
            scored.push({ doc, score, term: terms.find((t) => text.includes(t)) });
        }
        return scored.sort((a, b) => b.score - a.score).slice(0, 20);
    };
    const snippet = ({ doc, term }) => {
        const p = document.createElement('span');
        if (!term) { p.textContent = doc.x.slice(0, 110); return p; }
        const at = doc.x.toLowerCase().indexOf(term);
        const from = Math.max(0, at - 40);
        const mark = document.createElement('mark');
        mark.textContent = doc.x.slice(at, at + term.length);
        p.append((from ? '…' : '') + doc.x.slice(from, at), mark, doc.x.slice(at + term.length, at + 110) + '…');
        return p;
    };
    const select = (i) => {
        const links = list.querySelectorAll('a');
        links[active]?.classList.remove('active');
        active = links.length ? (i + links.length) % links.length : -1;
        links[active]?.classList.add('active');
        links[active]?.scrollIntoView({ block: 'nearest' });
    };
    const render = () => {
        const query = input.value.trim();
        const found = docs ? find(query) : [];
        list.replaceChildren(...found.map((hit) => {
            const a = document.createElement('a');
            a.href = path_to_root + hit.doc.u;
            const title = document.createElement('b');
            title.textContent = hit.doc.t === hit.doc.p ? hit.doc.p : `${hit.doc.p}: ${hit.doc.t}`;
            a.append(title, snippet(hit));
            const li = document.createElement('li');
            li.append(a);
            return li;
        }));
        status.textContent = query && !found.length ? `По запросу «${query}» ничего нет. Попробуй другое слово или имя метода.` : '';
        active = -1;
        select(0);
    };
    input.addEventListener('input', render);
    // Не отдаём клавиши наружу: стрелки влево и вправо у mdBook листают страницы
    dialog.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dialog.close(); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); select(active + (e.key === 'ArrowDown' ? 1 : -1)); }
        else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); list.querySelectorAll('a')[active].click(); }
        e.stopPropagation();
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.closest('a')) dialog.close(); });
    field.addEventListener('click', open);
    document.addEventListener('keydown', (e) => {
        const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
        if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); open(); }
    });
    document.querySelector('.left-buttons').append(field);
    document.body.append(dialog);

    // Подписи «Назад» и «Дальше» с названием страницы из оглавления
    const titleOf = (href) => {
        const a = [...document.querySelectorAll('.sidebar a[href]')].find((x) => x.pathname === new URL(href, location).pathname && !x.hash);
        return a ? a.textContent.trim() : '';
    };
    for (const [rel, label] of [['prev', 'Назад'], ['next', 'Дальше']]) {
        const a = document.querySelector(`.nav-wrapper a[rel~="${rel}"]`);
        if (a) a.append(el(`<small>${label}</small>`), document.createTextNode(titleOf(a.href) || label));
    }

    // Копирование страницы и ссылки для нейросетей. Нет Markdown-версии (print, 404) — нет и кнопок.
    const source = document.querySelector('link[rel="alternate"][type="text/markdown"]');
    const h1 = document.querySelector('.content main h1');
    if (!source || !h1) return;
    const md = source.href;
    const url = (name) => new URL(path_to_root + name, location).href;
    const prompt = encodeURIComponent(`Прочитай ${md} и отвечай на вопросы по этой странице strix Lua API. Индекс всей документации: ${url('llms.txt')}`);
    const item = (href, title, hint) => `<li><a href="${href}" target="_blank" rel="noopener">${title}<small>${hint}</small></a></li>`;
    const actions = el(`<div class="page-actions">
        <button type="button" aria-live="polite">Скопировать страницу</button>
        <details>
            <summary aria-label="Другие действия со страницей"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></summary>
            <ul>
                ${item(`https://chatgpt.com/?q=${prompt}`, 'Открыть в ChatGPT', 'Задать вопрос по этой странице')}
                ${item(`https://claude.ai/new?q=${prompt}`, 'Открыть в Claude', 'Задать вопрос по этой странице')}
                ${item(md, 'Открыть как Markdown', 'Текст страницы без оформления')}
                ${item(url('llms-full.txt'), 'Вся документация', 'Один файл llms-full.txt для нейросети')}
                ${item(url('llms.txt'), 'Индекс страниц', 'llms.txt со ссылками на все страницы')}
            </ul>
        </details>
    </div>`);
    h1.before(actions);

    const button = actions.querySelector('button');
    const details = actions.querySelector('details');
    let reset;
    button.addEventListener('click', async () => {
        const title = button.dataset.title ||= button.textContent;
        try {
            const res = await fetch(md);
            if (!res.ok) throw new Error(res.status);
            await navigator.clipboard.writeText(await res.text());
            button.textContent = 'Скопировано';
        } catch {
            button.textContent = 'Не скопировалось: открой Markdown в меню';
        }
        clearTimeout(reset);
        reset = setTimeout(() => { button.textContent = title; }, 2500);
    });
    document.addEventListener('click', (e) => { if (!details.contains(e.target)) details.open = false; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && details.open) { details.open = false; details.querySelector('summary').focus(); } });
})();
