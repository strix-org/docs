# Интерфейс и HUD

Интерфейс собирается из компонентов дизайн-системы Strix, поэтому выглядит как встроенный. Состояние хранит скрипт: управляемый компонент принимает значение и возвращает новое.

```lua
local m = strix.module("Panel", { category = "Misc" })
local on, volume = false, 5

local panel = strix.ui.window({
    id = "demo", title = "Настройки", width = 240, x = 60, y = 60,
    draw = function(ui)
        on = ui:switch(on)
        volume = ui:slider(volume, 0, 10, 1)
        if ui:button("Готово", { variant = "primary" }) then
            print(on, volume)
        end
    end,
})

m:on("key_press", function(key, action)
    if action == 1 and key == strix.keys.code("P") then panel:toggle() end
end)
```

## Компоненты

| Метод | Что делает | Возвращает |
|---|---|---|
| `ui:text(text, { size, weight, color })` | Текст | — |
| `ui:button(label, { variant, size, icon })` | Кнопка; `variant`: `primary`, `secondary`, `ghost`, `danger`; `size`: `sm`, `lg` | нажата ли |
| `ui:icon_button(icon, tooltip)` | Квадратная кнопка с иконкой | нажата ли |
| `ui:switch(on)` | Переключатель | новое значение |
| `ui:slider(value, min, max, step)` | Ползунок | новое значение |
| `ui:text_field(value, placeholder)` | Поле ввода | новое значение |
| `ui:select(index, options)` | Выпадающий список; индекс с единицы | новый индекс |
| `ui:pills(index, labels)` | Сегменты; индекс с единицы | новый индекс |
| `ui:badge(text, tone)` | Бейдж; `tone`: `neutral`, `accent`, `success`, `warning`, `danger` | — |
| `ui:status(tone, text)` | Строка статуса | — |
| `ui:section(text)` | Заголовок секции | — |
| `ui:icon(name, size, color)` | Иконка | — |
| `ui:item(stack, size)` | Иконка предмета | — |
| `ui:spinner()` | Индикатор загрузки | — |

Раскладка: `ui:horizontal(function(ui) ... end)`, `ui:vertical(function(ui) ... end)`, `ui:space(n)`, `ui:width()` — доступная ширина.

## Окна

`strix.ui.window({ id, title, width, x, y, open, draw })` объявляет окно при загрузке скрипта. Оно рисуется поверх меню, пока то открыто, и перетаскивается за шапку. `draw` получает `ui` и зовётся каждый кадр.

Методы окна: `open()`, `close()`, `toggle()`, `is_open()`. Ошибка в `draw` пишется в консоль и закрывает окно.

## Элементы HUD

`strix.hud({ key, title, icon, draw, update, visible, placement, enabled })` объявляет элемент: он появляется в редакторе HUD и сохраняет позицию, масштаб и включённость как встроенный. `placement = { x, y }` — место по умолчанию в долях экрана, `enabled = false` — выключен, пока игрок не включит.

```lua
local e = strix.hud({
    key = "Fps", title = "Кадры", icon = "gauge",
    update = function(preview) end,
    visible = function() return true end,
    draw = function(ui, editing)
        ui:pill(function(p) p:text("60 FPS") end)
    end,
})
local big = e:toggle("big", { default = false })
```

- `draw(ui, editing)` рисует каждый кадр; `editing` — открыт редактор HUD, можно показать пример данных;
- `update(preview)` обновляет данные перед `draw`;
- `visible()` — `false` скрывает элемент в игре;
- `e:is_enabled()` — включён ли элемент игроком.

У элемента те же настройки, что у модуля: `e:toggle`, `e:slider`, `e:range`, `e:mode`, `e:multi`, `e:text`, `e:color`, `e:bind`, `e:items`. Сбой рисования пишется в консоль, и элемент замолкает до перезапуска скрипта.

Примитивы HUD:

| Метод | Что делает |
|---|---|
| `ui:card(size, function(ui) ... end)` | Карточка; размер `s`, `m`, `l`, `xl` |
| `ui:pill(function(ui) ... end)` | Пилюля |
| `ui:header(title, meta, icon)` | Заголовок карточки |
| `ui:row(label, value, color)` | Строка `подпись — значение` |
| `ui:body(function(ui) ... end)` | Тело карточки со списком строк |
| `ui:block(top, bottom, function(ui) ... end)` | Блок со своими отступами сверху и снизу |
| `ui:row(label, value, color, lead)` | Строка: `value` — текст или `function(ui)` справа, `lead` — `function(ui)` слева |
| `ui:line(height, text, { weight, color }, lead, trailing)` | Строка своей высоты; `text` может быть `nil` |
| `ui:appear(id, function(ui) ... end)` | Появление новой строки списка; `id` — стабильный ключ строки |
| `ui:empty(text)` | Пустое состояние |
| `ui:divider()`, `ui:vdivider()` | Разделитель: горизонтальный и вертикальный |
| `ui:value(text, color)` | Значение справа в строке |
| `ui:unit(text)`, `ui:metric(value, unit)`, `ui:hero(value, unit)` | Единица, метрика, крупное значение |
| `ui:keycap(key)` | Клавиша бинда |
| `ui:chip(text, strong)` | Метка |
| `ui:phase(current, total)` | Фаза `1/3` |
| `ui:ready(text)` | «Готово» цветом успеха |
| `ui:glyph(icon, color)`, `ui:dot(color)` | Иконка и точка строки |
| `ui:icon_box(icon, color, side, size)` | Квадрат под иконку строки |
| `ui:progress({ { frac, color }, ... }, micro)` | Полоса из сегментов; `micro` — тонкая |
| `ui:segments({ { text, color }, ... }, max_width)` | Текст из цветных частей; тёмные цвета поднимаются до читаемых |
| `ui:cooldown_slot(left, timer, color, item)` | Слот предмета с маской кулдауна `left` 0..1 |
| `ui:timer_cell(text)` | Ячейка времени в начале строки шага |
| `ui:boss_head(item, title, { current, total }, sub, hp)` | Шапка карточки босса: плитка с предметом (`nil` — корона), имя и фаза, ниже подпись и HP |

`ui:item(stack, size)` принимает и `{ material = "potion", model = 3 }` — предмет по материалу и модели. `nil` — пустое место под иконку. Размеры строк HUD — `strix.ui.sizes.item` (иконка предмета), `strix.ui.sizes.icon` и `strix.ui.sizes.row` (высота строки). `ui:header(title, meta, icon)` принимает вместо имени иконки и `function(ui)` — например, `ui:item(...)`.

Цвета — `strix.ui.colors`: `text`, `text_muted`, `text_subtle`, `accent`, `success`, `warning`, `danger`, `trail`, `track`, `money`, `shards`, `level`, `blocks`. Форматы чисел HUD, как у встроенных элементов:

| Функция | Пример |
|---|---|
| `strix.format.decimal(v)` | `14.5`, `14` |
| `strix.format.compact(v)` | `157`, `1.2K`, `4.7T` |
| `strix.format.integer(v)` | `3 453 234` |
| `strix.format.duration(ms)` | `2:05`, `1:02:05`; `nil` — `∞` |
| `strix.format.percent(v)` | `1.05` → `105%` |

```lua
strix.hud({
    key = "Timers", title = "Таймеры", icon = "clock-3", placement = { x = 0.7, y = 0.55 },
    draw = function(ui)
        ui:card("s", function(ui)
            ui:header("Таймеры", nil, "clock-3")
            ui:divider()
            ui:body(function(ui)
                ui:row("Сила", function(ui) ui:value(strix.format.duration(125000), strix.ui.colors.warning) end, strix.ui.colors.text_muted,
                    function(ui) ui:icon_box("crown", strix.ui.colors.warning) end)
            end)
        end)
    end,
})
```

## Панель на контейнере

Событие `container_render` получает `screen, overlay, ui, unit`. Здесь `ui` — контекст экрана, у него есть `panel`: интерактивная панель поверх сундука или другого контейнера.

```lua
m:on("container_render", function(screen, overlay, ui)
    ui:panel("sort", 10, 10, function(p)
        if p:button("Сортировать") then print("sort") end
    end)
end)
```
