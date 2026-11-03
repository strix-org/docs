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

`strix.hud({ key, title, icon, draw, update, visible })` объявляет элемент: он появляется в редакторе HUD и сохраняет позицию, масштаб и включённость как встроенный.

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
- `visible()` — `false` скрывает элемент в игре.

У элемента те же настройки, что у модуля: `e:toggle`, `e:slider`, `e:range`, `e:mode`, `e:multi`, `e:text`, `e:color`, `e:bind`, `e:items`. Сбой рисования пишется в консоль, и элемент замолкает до перезапуска скрипта.

Примитивы HUD:

| Метод | Что делает |
|---|---|
| `ui:card(size, function(ui) ... end)` | Карточка; размер `s`, `m`, `l`, `xl` |
| `ui:pill(function(ui) ... end)` | Пилюля |
| `ui:header(title, meta, icon)` | Заголовок карточки |
| `ui:row(label, value, color)` | Строка `подпись — значение` |
| `ui:empty(text)` | Пустое состояние |
| `ui:divider()` | Разделитель |

## Панель на контейнере

Событие `container_render` получает `screen, overlay, ui, unit`. Здесь `ui` — контекст экрана, у него есть `panel`: интерактивная панель поверх сундука или другого контейнера.

```lua
m:on("container_render", function(screen, overlay, ui)
    ui:panel("sort", 10, 10, function(p)
        if p:button("Сортировать") then print("sort") end
    end)
end)
```
