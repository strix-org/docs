# Strix Lua API

Документация по API скриптов Strix: https://strix-org.github.io/docs/

Страницы лежат в `src/`. Сайт собирается mdBook и выкладывается на GitHub Pages при пуше в `main`.

Тема — `theme/`, цвета и шрифт из дизайн-системы продукта (`strix-ui`). `scripts/postbuild.py` добавляет в сборку `llms.txt`, `llms-full.txt` и `.md` страниц для нейросетей, а также `search.json` для поиска: встроенный индекс mdBook не понимает кириллицу.

Локально: `mdbook build && python3 scripts/postbuild.py`, затем раздать `book/` любым статическим сервером.
