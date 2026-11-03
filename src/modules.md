# Модули и настройки

## `strix.module`

```lua
local m = strix.module("AutoGG", { category = "Misc" })
```

`strix.module(name, spec)` объявляет модуль: имя из букв, цифр и `_`, категория — `Combat`, `Movement`, `Misc`, `Render` или `Client` (по умолчанию `Misc`). Ключ модуля в конфиге — `script:AutoGG`. Модуль появляется в меню, биндится и сохраняется как встроенный.

Обработчики вешаются через `m:on(событие, функция)`, см. [События](events.md), а хуки через `m:hook`, см. [Хуки](hooks.md). Они работают, пока модуль включён.

## Настройки

Каждый метод возвращает настройку: `s:get()` читает значение, `s:set(v)` меняет его. Запись применяется при выходе из обработчика, а неверное значение пишется в консоль и не меняет настройку.

| Метод | Значение | Описание |
|---|---|---|
| `m:toggle(key, { default })` | boolean | Переключатель |
| `m:slider(key, { min, max, step, default, integer })` | число | Ползунок; `integer` — целый |
| `m:range(key, { min, max, step, from, to, integer })` | `{ from, to }` | Отрезок |
| `m:mode(key, { options, default })` | строка | Один из вариантов |
| `m:multi(key, { options, default })` | `{ [вариант] = true }` | Несколько вариантов; `default` — список |
| `m:text(key, { default })` | строка | Текст |
| `m:color(key, { default, alpha })` | `{ r, g, b, a }` | Цвет; `alpha` — с прозрачностью |
| `m:bind(key, { default, mouse })` | `{ key, mouse }` | Клавиша GLFW или кнопка мыши |
| `m:items(key, { default, colors })` | список id | Предметы; `colors` — свой цвет у пункта |

Общие поля описания:

- `group = "имя"` кладёт настройку в секцию панели;
- `visible = function() return ... end` прячет настройку по условию. Функция зовётся каждый кадр панели, поэтому держи её дешёвой.

```lua
local mode = m:mode("mode", { options = { "fast", "legit" }, default = "legit" })
local speed = m:slider("speed", { min = 0, max = 10, default = 5,
    visible = function() return mode:get() == "fast" end })
```

Ключ настройки одновременно и ID в конфиге, и подпись в меню. Человеческие подписи задаёт `strix.i18n.set`:

```lua
strix.i18n.set("speed", { en = "Speed", ru = "Скорость" })
```

## Чужие модули

`strix.modules.list()` возвращает ключи всех модулей, встроенных и из скриптов. `strix.modules.get(key)` даёт доступ к модулю или `nil`:

```lua
local aura = strix.modules.get("Aura")
if aura and aura:is_enabled() then
    print(aura:settings())
    print(aura:get("settings.aura.range"))
    aura:set("settings.aura.range", 3.5)
    aura:set_enabled(false)
end
```

Методы: `key()`, `is_enabled()`, `set_enabled(on)`, `get(setting)`, `set(setting, value)`, `settings()`. Модуль, который сейчас исполняется выше по стеку, недоступен: `get` вернёт `nil`, вызовы дадут ошибку.

Чтобы следить за изменениями чужих модулей, подпишись на событие `module_changed`.
