# Сервисы клиента

Логика, общая со встроенными модулями. Пользуйся ей вместо своих реализаций через мост: так быстрее и поведение совпадает со встроенными модулями. Все функции работают только внутри колбэка игры и только на основном потоке. Исключения: `strix.net.send`, `strix.net.send_bypassing`, `strix.net.latency_ms` и `strix.net.measured_ms` работают с любого.

## Журнал и уведомления

| Функция | Что делает |
|---|---|
| `print(...)`, `strix.log.info(...)` | Запись в консоль |
| `strix.log.warn(...)`, `strix.log.error(...)` | Предупреждение, ошибка |
| `strix.toast(title, spec)` | Тост. `spec`: `tone` (`message`, `info`, `success`, `warning`, `error`, `loading`), `description`, `icon`, `id`, `duration` в секундах, `sticky`, `important` |
| `strix.chat.message(text)` | Сообщение Strix пользователю; `§c` делает его ошибкой |

`strix.chat.COMMAND_PREFIX` — префикс клиентских команд (`*`).

## Команды

`strix.command(spec)` добавляет подсказки команды в чат. Исполнение — событие `command`.

```lua
strix.command({ name = "gg", children = {
    { name = "player", kind = "word", suggest = function() return strix.friends.list() end },
    { name = "count", kind = "int" },
    { name = "text", kind = "greedy" },
} })
m:on("command", function(line)
    if line:sub(1, 2) == "gg" then print(line) return true end
end)
```

`kind`: `literal` (по умолчанию), `word`, `int`, `greedy`.

## `strix.inventory`

Диапазоны слотов — как у `Inventory`: хотбар 0..8, основной 9..35. Поиск возвращает слот или `-1`.

| Функция | Что делает |
|---|---|
| `strix.inventory.click_slot(container, slot, button, input)` | Клик; `input`: `PICKUP`, `QUICK_MOVE`, `SWAP`, … |
| `strix.inventory.pickup_slot(container, slot)` | Взять или положить |
| `strix.inventory.index_to_slot(index)` | Индекс `Inventory` → слот меню |
| `strix.inventory.switch(slot, mode)` → `StrixSlotSwitch` | Сменить слот хотбара; `mode`: `normal` (по умолчанию), `silent`, `alternative`, `none`. `switch:back()` вернёт прежний слот (второй вызов ничего не делает) |
| `strix.inventory.swap(mode, slot, target)` | Обмен; `mode`: `pickup`, `swap` |
| `strix.inventory.swap_inventory(slot, target)` | Обмен в инвентаре |
| `strix.inventory.swing(mode)` | Взмах; `main_hand`, `off_hand`, `packet`, `none` |
| `strix.inventory.using_main_hand(player)` → `boolean` | Предмет используется основной рукой |
| `strix.inventory.enchant_level(stack, id)` → `number` | Уровень чара |
| `strix.inventory.find_best(kind, first, last)` → `(number, number?)` | Лучший предмет вида `kind`: `sword`, `axe`, `chestplate`, `knockback`, `pickaxe`; диапазон по умолчанию — хотбар 0..8. У `knockback` второе значение — уровень чар, `pickaxe` ищет только в хотбаре (мультитул по имени первым). Взять найденное — `switch(slot)` |
| `strix.inventory.find_fast_item(state, first, last)` → `number` | Быстрее всего ломает блок |
| `strix.inventory.find(item, first, last)` → `number` | По объекту `Item` |
| `strix.inventory.find_name(name, first, last)` → `number` | По имени |
| `strix.inventory.count_name(name, first, last)` → `number` | Сколько предметов с именем |
| `strix.inventory.find_empty_slot(first, last)` → `number` | Пустой слот |

## `strix.rotations`

Общий координатор поворотов. Запрос с большим приоритетом побеждает.

```lua
local r = strix.rotations.request(10, yaw, pitch)
r:set(yaw2, pitch2)   -- новое значение
r:aim(true)           -- влиять и на прицел
r:release()           -- снять запрос
```

| Функция | Что делает |
|---|---|
| `strix.rotations.request(priority, yaw, pitch)` → `StrixRotation` | Новый запрос |
| `strix.rotations.current()` → `(number?, number?)` | Текущая ротация: `yaw, pitch` или `nil` |
| `strix.rotations.for_pick()` → `(number?, number?)` | Ротация для поиска цели |
| `strix.rotations.with_move_fix()` → `(number?, number?)` | Ротация с коррекцией движения |
| `strix.rotations.set_move_fix(on)` | Коррекция движения |
| `strix.rotations.cancel_return()` | Не возвращать плавно к камере |
| `strix.rotations.send_packet(yaw, pitch)` | Отправить поворот пакетом |
| `strix.rotations.step(current, target, step)` → `number` | Шаг к углу |
| `strix.rotations.correct(yaw, pitch)` → `(number, number)` | Поворот, который может дать мышь при текущей чувствительности (шаг — по настройкам игры) |

## `strix.agent`

Агент ведёт игрока к точке: путь ищет по блокам вокруг, а идёт манерой игрока из включённых записей Nuker (клавиши и
мышь — из похожих моментов записи, не по правилам). Атаки нет. Поход один: новый `go_to` заменяет прежний. Держи
ручку, пока идёшь: собранная сборщиком мусора ручка (скрипт выгружен или забыл её) останавливает поход. Не включай
вместе с Nuker — оба жмут клавиши.

```lua
local m = strix.module("WalkDemo")
local walk = nil
m:on("enable", function() walk = strix.agent.go_to(120, 64, -35, { records = "Ходьба" }) end)
m:on("disable", function() if walk then walk:stop() end end)
m:on("tick", function()
    if walk == nil then return end
    local status, why = walk:status()
    if status == "arrived" then strix.log.info("дошли") end
    if status == "failed" then strix.log.warn("не дошли: " .. tostring(why)) end
end)
```

| Функция | Что делает |
|---|---|
| `strix.agent.go_to(x, y, z, spec)` → `StrixAgent` | Идти к блоку `x, y, z` (цель — ближайшее место, где можно стоять). `spec.records` (необязательно) — вид записей: только включённые записи с этим именем (`{ records = "Ходьба" }`), без него — все включённые |

У `StrixAgent`: `status()` → `(string, string?)` — `"walking"`, `"arrived"`, `"stopped"` (остановлен или заменён
новым `go_to`), `"failed"` и причина: `"no_world"`, `"no_records"` (нет включённых записей), `"no_path"` (пути нет или
цель дальше ~200 блоков), `"stuck"`, `"no_match"`; `stop()` — остановить и отпустить клавиши.

Пока: ходьба — только из записей копания, без плавания; полублоки и ступени — как целые блоки (вверх — прыжком), путь
считается по снимку на старте и заново, когда игрок сбился или застрял.

## `strix.records`

Записи, по которым играют Nuker и агент: скрипт может писать их сам. Запись — текст по строкам (его читает и `upload`):

| Строка | Что |
|---|---|
| `# strix-mine v2 min=x,y,z max=x,y,z` и ряды `m,y,z,клетки` | Карта региона на старте — её даёт `map` |
| `t,мс,yaw,pitch,x,y,z,клавиши` | Начало тика: взгляд, ноги, клавиши (`keys()`) |
| `b,x,y,z` | Блок сломан в этом тике |
| `f,мс,yaw,pitch` | Камера на кадре рендера (событие `scene_frame`) |
| `e,x1,y1,z1,x2,y2,z2` | Хитбокс сущности-цели (моб, NPC) на начале тика — их даёт `entities`; для лучей записи это цель, как `d` |

Мс — от начала записи. Клетки карты: `.` — воздух и проходимое (трава), `d` — цель (блоки из `targets`), `#` — прочее
твёрдое и жидкость; вне карты — воздух, поэтому регион должен накрывать всё, где будет игрок. Клавиши — биты:
вперёд 1, назад 2, влево 4, вправо 8, прыжок 16, присед 32, спринт 64, атака 128, ПКМ 256.

```lua
local m = strix.module("RecorderDemo")
local text, t0 = {}, 0
local function ms() return math.floor((os.clock() - t0) * 1000) end
m:on("enable", function()
    local me = strix.mc().player
    local x, y, z = math.floor(me:getX()), math.floor(me:getY()), math.floor(me:getZ())
    text, t0 = { strix.records.map(x - 48, y - 16, z - 48, x + 48, y + 16, z + 48) }, os.clock()
end)
m:on("tick", function(mc)
    local me = mc.player
    if me == nil then return end
    table.insert(text, string.format("t,%d,%.4f,%.4f,%.4f,%.4f,%.4f,%d", ms(), me:getYRot(), me:getXRot(), me:getX(), me:getY(), me:getZ(), strix.records.keys()))
end)
m:on("disable", function()
    local ok, why = strix.records.upload("Ходьба", table.concat(text, "\n"))
    if not ok then strix.log.warn("не загружено: " .. tostring(why)) end
end)
```

| Функция | Что делает |
|---|---|
| `strix.records.keys()` → `number` | Клавиши этого тика (биты выше) и прыжок авто-прыжка игры; нет игрока — 0 |
| `strix.records.map(x1, y1, z1, x2, y2, z2, targets)` → `string` | Карта бокса блоков: заголовок и ряды `m`; `targets` (`{ "minecraft:stone" }`, необязательно) — цели `d`. Не больше ~4 млн клеток |
| `strix.records.entities(types, radius)` → `string` | Строки `e` этого тика: хитбоксы сущностей видов `types` (`{ "minecraft:zombie" }`) не дальше `radius` от ног, кроме самого игрока; нет — `""` |
| `strix.records.upload(name, data)` → `(boolean, string?)` | Запись в облако (упаковывается в `v3`); `false` и причина: `"offline"`, `"loading"`, `"full"` (нет слота), `"bad_format"`, `"empty"` |

Загруженная запись появляется в списке записей Nuker и включается там же. Имя записи — её вид: агент берёт записи
одного вида (`go_to(…, { records = "Ходьба" })`). Готовый рекордер — `scripts/Recorder.luau` (`*rec [имя]`).

## `strix.combat`

| Функция | Что делает |
|---|---|
| `strix.combat.attack_ready(player)` → `boolean` | Удар восстановился |
| `strix.combat.crits(player)` → `boolean` | Этот удар будет критом |
| `strix.combat.can_critical(player)` → `boolean` | Условия крита выполнены |
| `strix.combat.find_fall(player, fall)` → `boolean` | Падение на нужную высоту |
| `strix.combat.hit_delay_ms()` → `number` | Задержка подтверждения удара |
| `strix.combat.expected_hurt_ticks()` → `number` | Ожидаемая неуязвимость |
| `strix.combat.lands(hurt_time)` → `boolean` | Удар пройдёт |
| `strix.combat.totem_pops(entity_id)` → `number` | Сколько тотемов сгорело у сущности с её появления |

## `strix.net`

| Функция | Что делает |
|---|---|
| `strix.net.send(packet)` | Отправить пакет |
| `strix.net.send_bypassing(packet)` | Отправить мимо перехвата `packet_send` |
| `strix.net.latency_ms()` → `number?` | Задержка: замер или таблица игроков |
| `strix.net.measured_ms()` → `number?` | Только свой замер; `nil`, пока его нет |
| `strix.net.capture(fn)` → `(any, { any })` | Пакеты, отправленные внутри `fn`, не уходят: возвращает результат `fn` и их список. Свой клик своим же `packet_send` не поймать — так его можно придержать и отправить позже `send_bypassing` |

## `strix.channel`

Plugin-канал сервера по id `namespace:path`, например протокол сервера поверх `minecraft:custom_payload`. Тело — строка байт; читать её удобно через `buffer.fromstring`.

```lua
strix.channel.listen("dw:evoplus", function(data, age)
    local b = buffer.fromstring(data)
    print(#data, buffer.readu8(b, 0), age)
end)
strix.main(function() strix.channel.send("dw:handshake", string.char(0)) end)
```

| Функция | Что делает |
|---|---|
| `strix.channel.listen(id, handler)` | Принимать канал: `handler(data, age)` — тело и сколько секунд назад оно пришло. Основной поток, раз в тик на каждое тело; снимается вместе со скриптом, можно из [библиотеки](modules.md#библиотеки) |
| `strix.channel.send(id, data)` | Отправить тело в канал; только основной поток |

## `strix.json` и `strix.every_tick`

| Функция | Что делает |
|---|---|
| `strix.json.decode(text)` | JSON → таблица; `null` становится `nil`. Ошибка разбора — ошибка Lua |
| `strix.json.encode(value)` | Таблица → JSON |
| `strix.hash.sha256(data)` → `string` | SHA-256 строки байт, hex строчными |
| `strix.every_tick(f)` | Звать `f` раз в тик на основном потоке, даже без включённого модуля; снимается вместе со скриптом. Для [библиотек](modules.md#библиотеки), которым нужен тик (протокол сервера) |

```lua
local pets = strix.json.decode('[{"pet":"owl","level":3}]')
print(pets[1].pet, strix.json.encode({ a = 1 }))
```

## `strix.server`

Что видит сервер, а не клиент.

| Функция | Что делает |
|---|---|
| `strix.server.state()` → `{ [string]: any }` | `{ slot, yaw, pitch, x, y, z, on_ground, sprinting, sneaking, moving_keys, horizontal_collision }` |
| `strix.server.is_npc(player)` → `boolean` | Игрок похож на NPC |
| `strix.server.health(entity, absorption)` → `number` | Здоровье, с поглощением по запросу |
| `strix.server.is_valid(entity)` → `boolean` | Подходит как цель |

## `strix.world`

Поиск блоков идёт в Rust, поэтому чанк целиком стоит один вызов.

```lua
local stone = strix.world.block_state_id(stoneState)
local chunk = strix.world.chunk(level, cx, cz)
if chunk then
    for _, hit in chunk:find({ stone }, 100) do
        print(hit[1], hit[2], hit[3], hit[4]) -- x, y, z, id состояния
    end
end
```

`strix.world.chunk(level, x, z)` → `StrixChunk?` читает снимок чанка, `strix.world.block_state_id(state)` даёт id состояния. У снимка: `state(x, y, z)`, `find(ids, limit)`.

## Списки

| Функция | Что делает |
|---|---|
| `strix.friends.add(name)`, `strix.friends.remove(name)`, `strix.friends.clear()` | Друзья |
| `strix.friends.is_friend(name)` → `boolean`, `strix.friends.list()` | Проверка, список |
| `strix.macros.add(name, command, key, mouse)`, `strix.macros.remove(name)` → `boolean`, `strix.macros.list()` | Макросы |
| `strix.waypoints.add(name, x, z)`, `strix.waypoints.remove(name)` → `boolean`, `strix.waypoints.list()` | Вейпоинты |

## Клавиши и предметы

| Функция | Что делает |
|---|---|
| `strix.keys.code(field)` → `number?` | Код GLFW по имени: `SPACE`, `G`, `LEFT_SHIFT` |
| `strix.keys.name(code)` → `string` | Имя клавиши |
| `strix.keys.label(code, mouse)` → `string` | Подпись бинда |
| `strix.keys.fields()` → `{ [string]: number }` | Все имена и коды |
| `strix.items.blocks()` → `{ { id: string, name: string } }` | Блоки: `{ { id, name } }`, пусто до загрузки реестра |

## Прочее

| Функция | Что делает |
|---|---|
| `strix.bossbars.read()` → `{ { id: string, text: string, progress: number } }` | Боссбары: `{ { id, text, progress } }` |
| `strix.bossbars.hide(ids)` | Не рисовать бары с этими id; список скрипта заменяется целиком, `{}` — вернуть все. Снимаются при выгрузке скрипта |
| `strix.explosion.damage(entity, power, dist, seen, difficulty)` → `number` | Урон взрыва с учётом защиты; `difficulty`: `peaceful`, `easy`, `normal`, `hard` |
| `strix.explosion.raw(power, dist, seen, difficulty)` → `number` | Урон до защиты |
| `strix.explosion.CRYSTAL_POWER` | Сила взрыва кристалла |
| `strix.account()` → `string?` | Имя аккаунта Strix или `nil` |
| `strix.i18n.t(key)` → `string`, `strix.i18n.set(key, translations)` | Перевод, свой перевод (`translations` — `{ en, ru }`) |
| `strix.shared.set(key, value)` | Данные для встроенных элементов, `nil` — снять. `hud.effects` — свои строки Эффектов (`{ { id, name, modifier, left_ms, frac, color, kind, icon } }`, `kind`: `potion`/`booster`/`effect`, `icon`: `{ item, model }`, `{ pixel }`, `{ sprite }` или `{ letter }`), `hud.combo` — комбо в BPS (`{ booster, next_booster, blocks, required_blocks }`). Значения скрипта снимаются при его выгрузке |

## Что недоступно из скрипта

- Облако конфигов, обновление клиента и токены: это управление аккаунтом.
- Safe Mode и прокси.
- Запись копания Nuker: она принадлежит модулю Nuker.
