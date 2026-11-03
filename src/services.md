# Сервисы клиента

Логика, общая со встроенными модулями. Пользуйся ей вместо своих реализаций через мост: она сверена с античитами и быстрее. Все функции работают только внутри колбэка игры.

## Журнал и уведомления

| Функция | Что делает |
|---|---|
| `print(...)`, `strix.log.info(...)` | Запись в консоль |
| `strix.log.warn(...)`, `strix.log.error(...)` | Предупреждение, ошибка |
| `strix.toast(title, spec)` | Тост. `spec`: `tone` (`message`, `info`, `success`, `warning`, `error`, `loading`), `description`, `icon`, `id`, `duration` в секундах, `sticky`, `important` |
| `strix.chat.message(text)` | Сообщение Strix пользователю; `§c` делает его ошибкой |

`strix.chat.COMMAND_PREFIX` — префикс клиентских команд (`*`).

## Команды

`strix.command(tree)` добавляет подсказки команды в чат. Исполнение — событие `command`.

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
| `strix.inventory.switch_slot(server_slot, mode, slot, previous)` | Сменить слот; `mode`: `normal`, `silent`, `alternative`, `none` |
| `strix.inventory.switch_back(server_slot, mode, slot, previous)` | Вернуть слот |
| `strix.inventory.swap(mode, slot, target)` | Обмен; `mode`: `pickup`, `swap` |
| `strix.inventory.swap_inventory(slot, target)` | Обмен в инвентаре |
| `strix.inventory.swing(mode)` | Взмах; `main_hand`, `off_hand`, `packet`, `none` |
| `strix.inventory.using_main_hand(player)` | Предмет используется основной рукой |
| `strix.inventory.enchant_level(stack, id)` | Уровень чара |
| `strix.inventory.find_best_sword(first, last)` | Лучший меч |
| `strix.inventory.find_best_axe(first, last)` | Лучший топор |
| `strix.inventory.find_best_chestplate(first, last)` | Лучший нагрудник |
| `strix.inventory.find_best_knockback(first, last)` | Лучшая отдача: слот и уровень |
| `strix.inventory.find_best_pickaxe()` | Лучшая кирка |
| `strix.inventory.equip_best_pickaxe()` | Взять лучшую кирку |
| `strix.inventory.find_fast_item(state, first, last)` | Быстрее всего ломает блок |
| `strix.inventory.find(item, first, last)` | По объекту `Item` |
| `strix.inventory.find_name(name, first, last)` | По имени |
| `strix.inventory.count_name(name, first, last)` | Сколько предметов с именем |
| `strix.inventory.find_empty_slot(first, last)` | Пустой слот |

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
| `strix.rotations.request(priority, yaw, pitch)` | Новый запрос |
| `strix.rotations.current()` | Текущая ротация: `yaw, pitch` или `nil` |
| `strix.rotations.for_pick()` | Ротация для поиска цели |
| `strix.rotations.with_move_fix()` | Ротация с коррекцией движения |
| `strix.rotations.set_move_fix(on)` | Коррекция движения |
| `strix.rotations.cancel_return()` | Не возвращать плавно к камере |
| `strix.rotations.send_packet(yaw, pitch)` | Отправить поворот пакетом |
| `strix.rotations.step(current, target, step)` | Шаг к углу |
| `strix.rotations.gcd(options)` | GCD мыши |
| `strix.rotations.correct(yaw, pitch, gcd)` | Округлить под GCD |

## `strix.combat`

| Функция | Что делает |
|---|---|
| `strix.combat.attack_ready(player)` | Удар восстановился |
| `strix.combat.crits(player)` | Этот удар будет критом |
| `strix.combat.can_critical(player)` | Условия крита выполнены |
| `strix.combat.find_fall(player, fall)` | Падение на нужную высоту |
| `strix.combat.hit_delay_ms()` | Задержка подтверждения удара |
| `strix.combat.expected_hurt_ticks()` | Ожидаемая неуязвимость |
| `strix.combat.lands(hurt_time)` | Удар пройдёт |

## `strix.net`

| Функция | Что делает |
|---|---|
| `strix.net.send(packet)` | Отправить пакет |
| `strix.net.send_bypassing(packet)` | Отправить мимо перехвата `packet_send` |
| `strix.net.latency_ms()` | Задержка: замер или таблица игроков |
| `strix.net.measured_ms()` | Только свой замер; `nil`, пока его нет |

## `strix.server`

Что видит сервер, а не клиент.

| Функция | Что делает |
|---|---|
| `strix.server.state()` | `{ slot, yaw, pitch, x, y, z, on_ground, sprinting, sneaking, moving_keys, horizontal_collision }` |
| `strix.server.is_npc(player)` | Игрок похож на NPC |
| `strix.server.health(entity, absorption)` | Здоровье, с поглощением по запросу |
| `strix.server.is_valid(entity)` | Подходит как цель |

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

`strix.world.chunk(level, x, z)` читает снимок чанка, `strix.world.block_state_id(state)` даёт id состояния. У снимка: `state(x, y, z)`, `find(ids, limit)`.

## Списки

| Функция | Что делает |
|---|---|
| `strix.friends.add(name)`, `strix.friends.remove(name)`, `strix.friends.clear()` | Друзья |
| `strix.friends.is_friend(name)`, `strix.friends.list()` | Проверка, список |
| `strix.macros.add(name, command, key, mouse)`, `strix.macros.remove(name)`, `strix.macros.list()` | Макросы |
| `strix.waypoints.add(name, x, z)`, `strix.waypoints.remove(name)`, `strix.waypoints.list()` | Вейпоинты |

## Клавиши и предметы

| Функция | Что делает |
|---|---|
| `strix.keys.code(field)` | Код GLFW по имени: `SPACE`, `G`, `LEFT_SHIFT` |
| `strix.keys.name(code)` | Имя клавиши |
| `strix.keys.label(code, mouse)` | Подпись бинда |
| `strix.keys.fields()` | Все имена и коды |
| `strix.items.blocks()` | Блоки: `{ { id, name } }`, пусто до загрузки реестра |

## Прочее

| Функция | Что делает |
|---|---|
| `strix.bossbars.read()` | Боссбары: `{ { id, text, progress } }` |
| `strix.bossbars.hide(overlay, ids)`, `strix.bossbars.restore(overlay)` | Скрыть, вернуть |
| `strix.explosion.damage(entity, power, dist, seen, difficulty)` | Урон взрыва с учётом защиты; `difficulty`: `peaceful`, `easy`, `normal`, `hard` |
| `strix.explosion.raw(power, dist, seen, difficulty)` | Урон до защиты |
| `strix.explosion.CRYSTAL_POWER` | Сила взрыва кристалла |
| `strix.client.totem_pops(entity_id)` | Сгоревшие тотемы сущности |
| `strix.client.is_hidden(entity_id)` | Скрыт модулем Hide |
| `strix.client.totem()` | Состояние AutoTotem |
| `strix.account()` | Имя аккаунта Strix или `nil` |
| `strix.i18n.t(key)`, `strix.i18n.set(key, { en, ru })` | Перевод, свой перевод |

## Что недоступно из скрипта

- Отмена входящих пакетов и всё на сетевом потоке: скрипт исполняется только на основном.
- Облако конфигов, обновление клиента и токены: это управление аккаунтом.
- Safe Mode и прокси.
- Запись копания Nuker: она принадлежит модулю Nuker.
