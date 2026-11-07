# Хуки

Хук встраивает код прямо в метод игры, как Mixin. Механизм тот же, что у встроенных модулей: точка появляется в уже загруженном классе в течение 500 мс, перезапуск игры не нужен.

```lua
local m = strix.module("NoSprintReset", { category = "Movement" })

m:hook{
    class = "net.minecraft.client.player.LocalPlayer",
    method = "aiStep",
    at = "head",
    handler = function(ctx)
        print(ctx.this:isSprinting())
    end,
}
```

`m:hook` работает, пока модуль включён, а выключенный модуль почти ничего не стоит. `strix.hook{...}` работает всегда. Объявляются только при загрузке скрипта. Опечатка в имени класса или метода сразу даёт ошибку.

## Описание

| Поле | Значение |
|---|---|
| `class` | Класс: `net.minecraft.client.Minecraft` |
| `method` | Метод |
| `desc` | Дескриптор JVM, если метод перегружен: `(I)V` |
| `kind` | `inject` (по умолчанию), `modify`, `wrap` |
| `at` | Якорь, см. ниже; по умолчанию `head` |
| `ordinal` | Номер совпадения якоря в методе, с нуля; без него — все |
| `shift` | `before` (по умолчанию) или `after` |
| `priority` | Порядок в одной точке: больше — раньше |
| `locals` | Локальные переменные для `ctx:get_local`: имена или `#слот` |
| `only` | `{ arg = 1, class = "..." }`: только если аргумент — экземпляр класса |
| `handler` | `function(ctx)` |
| `inline` | Действие без обработчика, см. ниже |

Нужен ровно один из `handler` и `inline`.

## Виды

| Вид | Что делает | Аналог Mixin |
|---|---|---|
| `inject` | Код в точке; `ctx:cancel()` — ранний выход из метода | `@Inject` |
| `modify` | Значение точки проходит через обработчик: `ctx:value()`, `ctx:set_value(v)` | `@ModifyExpressionValue`, `@ModifyReturnValue`, `@ModifyConstant` |
| `wrap` | Операция обёрнута: операнды меняются, `ctx:call_original()` вызывает оригинал | `@WrapOperation`, `@Redirect`, `@ModifyArg` |

## Якоря

Простые якоря задаются строкой: `head`, `return`, `tail`. Остальные таблицей:

```lua
at = { "invoke", owner = "net.minecraft.world.entity.Entity", name = "getYRot", desc = "()F" }
at = { "field", owner = "net.minecraft.client.Minecraft", name = "player", desc = "Lnet/minecraft/client/player/LocalPlayer;", access = "get" }
at = { "new", class = "net.minecraft.world.phys.Vec3", desc = "(DDD)V" }
at = { "constant", int = 5 }          -- или long, float, double, string
at = { "jump", opcode = 153 }         -- без opcode: любой переход
at = { "load", name = "speed" }       -- или store, name = "#3"
```

## `ctx`

Действителен только во время вызова: сохранённый `ctx` даёт ошибку.

| Поле или метод | Что делает |
|---|---|
| `ctx.this` | Объект метода, `nil` у static |
| `ctx.receiver` | Объект операции у `wrap` |
| `ctx.ordinal` | Номер совпадения якоря |
| `ctx:arg(i)`, `ctx:set_arg(i, v)` | Аргумент метода, с единицы |
| `ctx:get_local(i)`, `ctx:set_local(i, v)` | Переменная из `locals`, с единицы |
| `ctx:operand(i)`, `ctx:set_operand(i, v)` | Операнд `wrap`, с единицы |
| `ctx:value()`, `ctx:set_value(v)` | Значение точки; у `return` и `tail` — возвращаемое |
| `ctx:cancel(v)` | Выйти из метода; у не-void метода нужно значение |
| `ctx:call_original()` | Выполнить обёрнутую операцию |

```lua
-- Заменить возвращаемое значение
m:hook{ class = "net.minecraft.world.entity.Entity", method = "isInvisible", kind = "modify", at = "return",
    handler = function(ctx) ctx:set_value(false) end }

-- Удвоить результат вызова
m:hook{ class = "x.Y", method = "outer", kind = "wrap",
    at = { "invoke", owner = "x.Y", name = "inner", desc = "(I)I" },
    handler = function(ctx) ctx:set_value(ctx:call_original() * 2) end }
```

## Горячие точки: `inline`

Вход в обработчик стоит порядка 150 мкс. На методы, которые игра зовёт на каждую сущность или каждый кадр, ставь встроенное действие: его исполняет сам байткод, без входа в скрипт и почти бесплатно.

```lua
m:hook{ class = "x.Y", method = "shouldRender", inline = "cancel" }                     -- ранний выход
m:hook{ class = "x.Y", method = "getDistance", inline = { value = 1.5, type = "float" } } -- вернуть константу
m:hook{ class = "x.Y", method = "outer", kind = "wrap", at = { "invoke", owner = "x.Y", name = "inner", desc = "(I)I" },
    inline = { operand = 1, value = 10 } }                                               -- заменить операнд
```

`type`: `int`, `long`, `float`, `double`. Без него целое становится `int`, дробное `double`. `only` дополнительно ограничивает точку по типу аргумента.

## Что нужно помнить

- Обработчик идёт на том потоке, где игра вызвала метод, см. [Потоки](threads.md).
- Ошибка в обработчике: запись в консоль, исход отбрасывается, модуль выключается.
- Методы без кода (`abstract`, `native`) не хукаются: ставь точку на вызывающем.
- Байткод не откатывается. Точка прошлой версии скрипта остаётся выключенной до конца процесса и стоит около 1 мкс на вызов.
