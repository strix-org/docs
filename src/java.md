# Мост к игре

Любой объект игры в Lua ведёт себя как объект Java: методы и поля по настоящим именам из исходников Minecraft.
Какие классы и члены есть и как они называются — [справочник SDK](sdk.md) (поиск по версиям игры) и
`java.describe` прямо в скрипте.

```lua
local mc = strix.mc()              -- Minecraft.getInstance()
local player = mc.player           -- поле
if player then
    print(player:getYRot())        -- метод, через двоеточие
    player:setSprinting(true)
    local pos = player:position()
    print(pos:x(), pos:y(), pos:z())
end
```

`strix.mc()` → `any` возвращает `Minecraft.getInstance()`.

## Классы и объекты

| Функция | Что делает |
|---|---|
| `java.class(name)` | Класс; через него статические методы и поля |
| `java.new(class, ...)` | Новый объект, `new` |
| `java.get(obj, field)`, `java.set(obj, field, value)` | Поле, когда есть одноимённый метод |
| `java.instanceof(obj, name)` | Проверка типа |
| `java.describe(class)` | Справка о классе (имя или объект): `{ name, constructors, methods = { { name, params, returns, static } }, fields = { { name, type, static } } }`, типы — как в Java (`int`, `net.minecraft.world.phys.Vec3`), члены — с суперклассами и интерфейсами |

```lua
local Vec3 = java.class("net.minecraft.world.phys.Vec3")
local v = java.new(Vec3, 1, 2, 3)
print(v:length())
print(java.class("java.lang.Integer").MAX_VALUE)
```

Запись поля: `obj.field = value`. Если есть и метод, и поле с одним именем, `obj.name` даёт метод, а поле читает `java.get`. Приватные члены доступны. У массивов работают `#arr` и `arr[i]`, индекс с единицы.

## Преобразование значений

| Java | Lua |
|---|---|
| `null` | `nil` |
| `boolean`, `Boolean` | boolean |
| числа и их обёртки, `char` | число |
| `String` | строка |
| всё остальное | объект |

Объект можно хранить в переменной между обработчиками.

## Перегрузки

Метод выбирается по числу и типам аргументов. Целое число подходит к `int` и `long`, дробное к `double` и `float`, строка к `String`, таблица не передаётся.

## Ошибки

Исключение Java становится ошибкой Lua с его текстом и ловится `pcall`:

```lua
local ok, err = pcall(function() return list:get(99) end)
```

Вызов через точку вместо двоеточия даёт понятную ошибку: `зови через двоеточие`.

## Что важно

- Мост работает только внутри колбэка игры: при загрузке скрипта и в обработчиках.
- Он открывает всю JVM, включая файлы и процессы. Запускай только скрипты, которым доверяешь.
- Каждый вызов проходит через JNI: порядка микросекунды (метод с объектом в ответ — чуть больше; вернувший сам объект,
  как `pos:set(x, y, z)`, — без нового объекта). Тысячи вызовов в обработчике — уже миллисекунды: на горячих путях
  читай значения реже, держи метод в переменной (`local get = obj.get`), используй `inline`-хуки и [сервисы](services.md).
- Минимальный пример с хуком — на странице [Хуки](hooks.md).
