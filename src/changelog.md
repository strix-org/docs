# Версии API

Скрипт в каталоге объявляет `api_version` — под какую версию написан; клиент со старшей версией его не запустит.
Пока API молодое, функции могут сниматься: здесь написано, что снято и чем заменить.

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
