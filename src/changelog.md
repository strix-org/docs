# Версии API

Скрипт в каталоге объявляет `api_version` — под какую версию написан; клиент со старшей версией его не запустит.
Пока API молодое, функции могут сниматься: здесь написано, что снято и чем заменить.

## 15

- `strix.agent.look_at(yaw, pitch, spec)` → `StrixAgent`: поворот взгляда путём мыши из записи (`spec.records` — вид).

## 14

- Категория модуля `Hidden` — без карточки в меню (обработчики `always`, `strix.hook`).
- Запись из нескольких кусков карты (рекордер в реальном мире: карта идёт за игроком).

## 13

- `m:on(event, handler, { always = true })` — событие и выключенному модулю (команды, запись в фоне).
- Сторож скрипта — 2 с на вход (было 100 мс).

## 12

- `strix.agent.mind(spec)` → `StrixMind` (`step`, `set`, `reset`): мозг бота по записям — тело ведёт скрипт.
- `strix.records.breaks(kind)` — свои сломы записей (покрытие).

## 11

- `strix.agent.go_to(x, y, z, spec)`: `spec.records` — вид записей (имя), агент идёт манерой только этих записей.
- `strix.records.entities(types, radius)` — хитбоксы сущностей-целей строками `e`; строка `e` в формате записи.

## 10

- `strix.records`: `keys()` (клавиши тика в формате записи, с ПКМ), `map(x1, y1, z1, x2, y2, z2, targets)` (карта
  региона), `upload(name, data)` (запись в облако) — рекордер можно написать скриптом.

## 9

- `strix.agent.go_to(x, y, z)` → `StrixAgent` (`status()`, `stop()`): поход к точке манерой игрока из записей.

## 8

- `strix.inventory.switch(slot, mode)` → объект со `:back()`; `strix.inventory.find_best(kind, first, last)`.
- `strix.rotations.correct(yaw, pitch)` сам берёт шаг мыши из настроек игры.
- `strix.bossbars.hide(ids)` — список скрипта, бары снимает и возвращает Strix.
- `java.describe(class)` — справка о классе из рефлексии; справочник SDK на сайте (страница «Справочник SDK»).
- Проход «трёх групп» силуэтов: `scene:groups`, `strix.render.key_group(i)`, аргумент `groups` у `entity_outline`.
- **Снято:** `inventory.switch_slot`/`switch_back` → `switch(slot, mode)` и `:back()`; `inventory.find_best_sword/axe/chestplate/
  knockback/pickaxe` → `find_best(kind, …)`; `inventory.equip_best_pickaxe()` → `switch(find_best("pickaxe"))`;
  `rotations.gcd(options)` и третий аргумент `correct`; `bossbars.hide(overlay, ids)`/`restore(overlay)` → `hide(ids)`;
  `scene:runes`/`render.key_rune` → `scene:groups`/`render.key_group`; `ui.colors.money/shards/level/blocks` → свои
  цвета через `strix.color`.

## 7

- Экспорт модулей: `ref:state()`, `ref:actions()`, `ref:call(name, ...)`; у своего модуля — `m:expose`, `m:action`.
  Встроенные: AutoTotem (`busy`, `main_hand_busy`), Hide (`hidden`).
- `strix.combat.totem_pops(entity_id)`.
- **Снято:** `strix.client.totem()` → `strix.modules.get("AutoTotem"):state()`; `strix.client.is_hidden(id)` →
  `strix.modules.get("Hide"):state().hidden`; `strix.client.totem_pops(id)` → `strix.combat.totem_pops(id)`.

## 6

- `strix.module(name, { category, description })`: своя категория — своя вкладка меню; описание карточки.
- `strix.shared.set(key, value)` — данные для встроенных элементов (Эффекты, BPS).
- `strix.net.capture(fn)` — придержать пакеты, отправленные внутри `fn`.
