# Рисование

Объекты рисования приходят аргументами и действуют только в своём обработчике. Сохранённая ссылка даёт ошибку.

## Мир

Событие `render_3d` получает две очереди: `world` — боксы и линии в кадре, `silhouettes` — геометрия для силуэтов блоков. Координаты мировые. Бокс — `{ x1, y1, z1, x2, y2, z2 }`. `depth` — `through` (сквозь стены, по умолчанию) или `tested`.

| Метод | Что рисует |
|---|---|
| `q:filled_box(box, color, depth)` | Заливка |
| `q:outline(box, color, width, depth)` | Контур |
| `q:gradient_box(box, top, bottom, depth)` | Заливка градиентом |
| `q:gradient_outline(box, top, bottom, width, depth)` | Контур градиентом |
| `q:cube(box, fill, outline, depth)` | Заливка и контур; `nil` — без части |
| `q:quad(x, y, z, size, fill, outline, depth)` | Плоский квадрат |
| `q:line({x,y,z}, {x,y,z}, color, width, depth)` | Линия |

```lua
m:on("render_3d", function(world)
    local p = strix.mc().player
    if not p then return end
    local x, y, z = p:getX(), p:getY(), p:getZ()
    world:outline({ x - 1, y, z - 1, x + 1, y + 2, z + 1 }, strix.color(0, 200, 255), 2)
end)
```

## Экран

Событие `render_2d` получает `overlay, width, height, scale`. Все координаты, `width` и `height` — в единицах GUI: центр экрана, где прицел, это `width / 2, height / 2`. `scale` — масштаб GUI; курсор `mouseHandler:xpos()` отдаёт пиксели окна, их нужно делить на него. `container_render` получает такой же `overlay` поверх контейнерного экрана.

| Метод | Что рисует |
|---|---|
| `o:rect(x, y, w, h, radius, color)` | Прямоугольник |
| `o:stroke(x, y, w, h, radius, width, color)` | Рамка |
| `o:oval(x, y, w, h, color)` | Овал |
| `o:text(x, y, text, color, { size, weight, align })` | Текст; `weight`: `regular`, `medium`, `semibold`, `bold`; `align`: `left`, `center`, `right` |
| `o:icon(x, y, w, h, name, color)` | Иконка Lucide |
| `o:item(x, y, w, h, stack)` | Иконка предмета из объекта `ItemStack` |
| `o:name_tag(x, y, scale, bg, border, segments)` | Плашка над сущностью; `segments`: `{ { text, color, icon, icon_color } }` |

Проекция и состояние:

| Метод | Что делает |
|---|---|
| `o:project(x, y, z)` | Мир → экран: `sx, sy`; `nil` за камерой и дальше дальней плоскости |
| `o:project_box(box)` | Бокс → `x, y, w, h` или `nil` |
| `o:push_clip(x, y, w, h)`, `o:pop_clip()` | Обрезка |
| `o:push_rotate(x, y, degrees, scale)`, `o:pop_transform()` | Поворот вокруг точки |
| `o:push_depth(distance)`, `o:pop_depth()` | Порядок по дальности |

```lua
m:on("render_2d", function(o)
    local sx, sy = o:project(100, 70, 100)
    if sx then o:text(sx, sy, "База", 0xFFFFFFFF, { align = "center" }) end
end)
```

## Проходы кадра

`scene_frame` срабатывает в начале кадра и получает `scene`: заявки на проходы по готовому изображению.

| Метод | Что делает |
|---|---|
| `s:grade({ exposure, contrast, temperature, tint, saturation, vibrance, lift, gain, vignette })` | Цветокоррекция |
| `s:outline({ owner, targets, max_line_width, hide_hand })` | Силуэты сущностей: до 8 целей со своим видом |
| `s:blocks(target)` | Силуэты блоков: геометрию кладёт очередь `silhouettes` из `render_3d` |
| `s:groups({ { a, b }, { a, b }, { a, b } })` | Три группы силуэтов с градиентом; пара — `{ a = {r,g,b}, b = {r,g,b} }` или `{ {r,g,b}, {r,g,b} }`, доли 0..1 |
| `s:hand(on)` | Забрать руку первого лица в силуэт |

Настройка цели: `mode` — `default`, `gradient`, `rainbow_xy`, `rainbow_x`, `rainbow_y`, `glass`, `off`; цвета `fill`, `stroke` — `{ r, g, b, a }` и `color1`, `color2` — `{ r, g, b }` в долях 0..1; числа `scale`, `speed`, `fill_alpha`, `outline_alpha`, `brightness`, `saturation`, `line_width`; стекло `glass_blur_size`, `glass_quality`, `glass_directions`, `glass_refraction`, `glass_bg_blur`, `glass_chromatic`, `glass_distortion`.

Какой сущности какая цель, решает `entity_outline`. Обработчик возвращает ключ: `strix.render.key_target(index)` → `number` для цели 1..8 или `strix.render.key_group(index)` для группы 1..3 (её цвета задаёт `s:groups`). Третий аргумент `entity_outline` — `true`, если в кадре есть заявка групп.

```lua
m:on("scene_frame", function(s)
    s:outline({ owner = "Glow", targets = { { mode = "default", stroke = { 0, 1, 1, 1 }, line_width = 2 } } })
end)
m:on("entity_outline", function(entity, owner)
    if owner == "Glow" and java.instanceof(entity, "net.minecraft.world.entity.player.Player") then
        return strix.render.key_target(1)
    end
end)
```

В кадре силуэтами сущностей владеет один модуль: при нескольких заявках действует последняя. `entity_outline` зовётся на каждую сущность: держи обработчик коротким.

## Скрытые сущности

`strix.render.hide(ids)` — не рисовать сущности с этими id (`entity:getId()`). Список скрипта заменяется целиком, `{}` снимает всё; снимается и вместе со скриптом. Проверка идёт в Rust на каждую сущность в кадре без входа в скрипт, поэтому список считай редко, например раз в 10 тиков.

```lua
local stands = {}
m:on("tick", function(mc)
    -- собрать id и передать: strix.render.hide(stands)
end)
```

`strix.color(r, g, b, a)` → `number` собирает цвет `0xAARRGGBB`.
