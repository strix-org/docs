# Справочник SDK

Классы и члены Minecraft, которые знает Strix: имена — те, что зовёт [мост к игре](java.md) (`java.class(имя)`,
`obj:метод()`, `obj.поле`). Сигнатуры — Java, по версии игры. Справочник собирается из того же SDK, что и клиент
(`cargo x sdk-docs`), поэтому совпадает с ним.

Класса нет в списке — он всё равно доступен мосту, если есть в игре: посмотри его прямо в скрипте через
`java.describe`.

```lua
local d = java.describe("net.minecraft.world.entity.player.Player")
for _, m in d.methods do
    if m.name == "getX" then print(m.returns, table.concat(m.params, ", ")) end
end
```

Запрос: `Player` — классы с этим именем (точное совпадение первым), `Player.getX` — член класса, `getX` — члены
всех классов, если класса с таким именем нет. У класса показаны только его собственные члены: `getX` игрока объявлен
в `Entity`. Все члены с унаследованными — `java.describe`.

<div id="sdk-ref">
  <p>
    <select id="sdk-version" aria-label="Версия игры"></select>
    <input id="sdk-query" type="search" placeholder="Player.getX" aria-label="Поиск по SDK" autocomplete="off">
  </p>
  <p id="sdk-status">Загрузка…</p>
  <div id="sdk-results"></div>
</div>

<style>
#sdk-ref input, #sdk-ref select { font: inherit; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--table-border-color); background: var(--bg); color: var(--fg); }
#sdk-ref input { width: min(420px, 100%); }
#sdk-results details { border-bottom: 1px solid var(--table-border-color); padding: 6px 0; }
#sdk-results summary { cursor: pointer; font-family: var(--mono-font); overflow-wrap: anywhere; }
#sdk-results ul { margin: 6px 0 0; padding-left: 18px; }
#sdk-results li { font-family: var(--mono-font); font-size: 0.85em; overflow-wrap: anywhere; }
</style>

<script>
(() => {
  const LIMIT = 60, cache = {};
  const $ = id => document.getElementById(id);
  const esc = s => s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const short = name => name.slice(name.lastIndexOf(".") + 1);
  async function load(v) {
    if (!cache[v]) cache[v] = fetch(`sdk/${v}.json`).then(r => r.json());
    return cache[v];
  }
  async function search() {
    const v = $("sdk-version").value, q = $("sdk-query").value.trim().toLowerCase();
    const data = await load(v);
    const [cq, mq] = q.includes(".") ? q.split(/\.(?=[^.]*$)/) : [q, null];
    const cls = name => short(name).toLowerCase().replace(/\$/g, "");
    let found = [];
    if (mq !== null) {
      const c = cq.replace(/\$/g, "");
      for (const [name, members] of data.classes) {
        if (!cls(name).includes(c)) continue;
        const hits = members.filter(m => m.toLowerCase().includes(mq));
        if (hits.length) found.push([name, hits, true, cls(name) === c]);
      }
    } else if (q) {
      // Сначала классы с подходящим именем, точное совпадение первым; нет таких — члены всех классов.
      const want = q.replace(/\$/g, "");
      found = data.classes.filter(([name]) => cls(name).includes(want)).map(([name, ms]) => [name, ms, false, cls(name) === want]);
      if (!found.length) for (const [name, members] of data.classes) {
        const hits = members.filter(m => m.toLowerCase().includes(q));
        if (hits.length) found.push([name, hits, true, false]);
      }
    }
    found.sort((a, b) => b[3] - a[3]);
    const total = found.length, out = found.slice(0, LIMIT);
    $("sdk-status").textContent = q ? `Найдено классов: ${total}${total > LIMIT ? ` (показаны первые ${LIMIT} — уточни запрос)` : ""}` : `Версия ${v}: ${data.classes.length} классов. Введи запрос.`;
    $("sdk-results").innerHTML = q ? out.map(([name, ms, open]) =>
      `<details${open ? " open" : ""}><summary>${esc(name)} <small>(${ms.length})</small></summary><ul>${ms.map(m => `<li>${esc(m)}</li>`).join("")}</ul></details>`).join("") : "";
  }
  fetch("sdk/index.json").then(r => r.json()).then(({ versions }) => {
    $("sdk-version").innerHTML = versions.map(v => `<option>${esc(v)}</option>`).join("");
    $("sdk-version").value = versions[0];
    let t;
    $("sdk-query").addEventListener("input", () => { clearTimeout(t); t = setTimeout(search, 150); });
    $("sdk-version").addEventListener("change", search);
    search();
  }).catch(() => { $("sdk-status").textContent = "Справочник не загрузился."; });
})();
</script>
