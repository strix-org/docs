# События

```lua
m:on("key_press", function(key, action, modifiers, scancode)
    if key == strix.keys.code("G") then
        print("G!")
        return true -- игра не получит нажатие
    end
end)
```

Обработчик работает, пока модуль включён. Модуль получает только те события, на которые подписан. Ошибка в обработчике выключает модуль.

Объекты игры в аргументах — это объекты [моста](java.md), у них можно звать любые методы.

## Жизненный цикл

| Событие | Аргументы | Когда |
|---|---|---|
| `enable` | — | Модуль включается. Ошибка отменяет включение |
| `disable` | — | Модуль выключается |

## Игра

| Событие | Аргументы | Когда |
|---|---|---|
| `tick` | `mc` | Начало тика клиента |
| `player_tick` | `player` | Тик локального игрока, до его движения |
| `post_motion` | — | Пакет движения за тик ушёл |
| `attack_entity` | `player, target` | Игрок бьёт сущность |
| `block_break` | `pos` | Ломается блок |
| `entity_add` | `entity` | Сущность появилась в мире |
| `disconnect` | — | Выход с сервера, кик, смена мира |

## Ввод

Обработчик, вернувший `true`, отменяет событие.

| Событие | Аргументы | Отмена |
|---|---|---|
| `key_press` | `key, action, modifiers, scancode` | Игра не получит нажатие. `action`: 0 отпускание, 1 нажатие, 2 повтор |
| `char_typed` | `codepoint` | Игра не получит символ |
| `mouse_button` | `button, pressed` | Игра не получит кнопку |
| `mouse_scroll` | `dx, dy` | Игра не получит прокрутку |
| `mouse_move` | `x, y` | — |
| `command` | `line` | Команда чата с префиксом `*`; `true` — взята, иначе «Unknown command» |

`movement_input` получает таблицу `{ forward, back, left, right, original_forward, original_back, original_left, original_right }`. Что останется в первых четырёх полях после обработчика, то и нажато.

`move_input` получает `fix_yaw`. Число в ответе задаёт новый `fix_yaw`, а `true` отменяет.

## Сеть

| Событие | Аргументы | Отмена |
|---|---|---|
| `packet_send` | `packet` | `true` — пакет не уйдёт |
| `packet_received` | `packet` | Отменить нельзя: пакет уже обработан сетевым потоком |
| `packet_cancelled` | `packet` | Входящий пакет отменён встроенной политикой |

Отмена входящих пакетов из скрипта недоступна: решение принимается на сетевом потоке, куда скрипт не попадает.

## Инвентарь и прицел

`inventory_click` получает `container_id, slot, button, input, player`, где `input` — имя вида клика (`PICKUP`, `QUICK_MOVE`, …). `true` отменяет клик.

`hitbox` получает `entity, box` и срабатывает на поиске цели прицелом. Верни объект `AABB`, и игра возьмёт его как хитбокс.

## Рисование

| Событие | Аргументы | Подробности |
|---|---|---|
| `render_2d` | `overlay, width, height, scale` | [Экран](render.md#экран) |
| `render_3d` | `world, silhouettes` | [Мир](render.md#мир) |
| `scene_frame` | `scene` | [Проходы кадра](render.md#проходы-кадра) |
| `entity_outline` | `entity, owner, runes` | Верни ключ силуэта, см. [проходы кадра](render.md#проходы-кадра) |
| `container_render` | `screen, overlay, ui, unit` | Поверх контейнерного экрана, см. [интерфейс](ui.md#панель-на-контейнере) |

`entity_outline` и `hitbox` срабатывают на каждую сущность, а `mouse_move`, `render_2d` и `render_3d` очень часто. Подписка на них стоит заметного времени кадра.

## Клиент

| Событие | Аргументы | Когда |
|---|---|---|
| `module_changed` | `key, change` | Модуль включился или изменилась настройка. `change`: `{ enabled, origin }` или `{ setting, origin }` |
| `toast_event` | `id, kind, button` | Тост: `kind` — `action`, `cancel`, `dismissed`, `expired`; `id` — заданный при показе |
