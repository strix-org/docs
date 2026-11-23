# Strix Lua API

Документация по API скриптов Strix: https://strix-org.github.io/docs/

Страницы лежат в `src/`, оглавление — `src/SUMMARY.md`. Сайт собирается [Zensical](https://zensical.org) (`zensical.toml`) и выкладывается на GitHub Pages при пуше в `main`.

Тема — стандартная Zensical, `theme/strix.css` задаёт только шрифт и цвета из дизайн-системы продукта (`strix-ui`). `llms.txt`, `llms-full.txt` и `.md` страниц для нейросетей собирает встроенный плагин `llmstxt`; описания страниц для `llms.txt` — в `zensical.toml`.

Локально: `uvx zensical serve`, сайт на http://localhost:8000/docs/. Сборка в `book/` — `uvx zensical build`.
