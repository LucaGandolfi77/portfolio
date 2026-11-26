import { test, eq, ok, near, summary } from '../../_kit/test-harness.js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
globalThis.window = { addEventListener() {}, dispatchEvent() {} };

const { STR, ZONES, ITEMS, SKILLS, QUESTS, LEVEL_XP, VERSION } = await import(join(ROOT, 'js/config.js'));
const prog = await import(join(ROOT, 'js/core/progression.js'));
const combat = await import(join(ROOT, 'js/core/combat.js'));
const ent = await import(join(ROOT, 'js/core/entities.js'));
const storage = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

run('i18n dictionaries aligned and complete', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('game data is coherent', () => {
  eq(ZONES.length, 3); eq(SKILLS.length, 4); eq(QUESTS.length, 3);
  ok(ITEMS.length >= 8);
  ZONES.forEach(z => {
    ok(z.en && z.it && z.enemies.length && z.grid && z.accent);
    ok(z.portals.length, z.id);
    z.portals.forEach(p => ok(ZONES.some(o => o.id === p.to), p.to));
  });
  SKILLS.forEach(s => ok(s.mana > 0 && s.cooldown > 0));
});
run('initial state is valid and equipment boosts stats', () => {
  const s = prog.initialState();
  eq(s.version, VERSION); eq(s.level, 1); eq(s.zone, 'grove');
  ok(s.inventory.length >= 3);
  const base = prog.stats(s).attack;
  const withSword = { ...s, inventory: [...s.inventory, { itemId: 'iron_sword', quantity: 1 }] };
  const s2 = prog.equipItem(withSword, withSword.inventory.findIndex(x => x.itemId === 'iron_sword'));
  ok(s2 && prog.stats(s2).attack > base);
});
run('XP and loot increase level and currency', () => {
  const r = prog.addXp(prog.initialState(), LEVEL_XP(1) + 5);
  eq(r.state.level, 2); eq(r.levels, 1);
  eq(r.state.maxHp, 118); eq(r.state.maxMana, 70);
  const l = prog.addLoot(prog.initialState(), 20, 12);
  eq(l.state.gold, 20); eq(l.state.kills, 1); eq(l.state.totalGold, 20);
});
run('inventory use, buy, equip swap and drop', () => {
  let s = prog.initialState();
  const healed = prog.useItem({ ...s, hp: 40 }, 0);
  eq(healed.hp, 70); eq(healed.inventory[0].quantity, 2);
  s = { ...s, gold: 100 };
  const bought = prog.buyItem(s, 'iron_sword');
  ok(bought && bought.gold === 45);
  const equipped = prog.equipItem(bought, bought.inventory.findIndex(x => x.itemId === 'iron_sword'));
  eq(equipped.equipment.weapon, 'iron_sword');
  ok(equipped.inventory.some(x => x.itemId === 'wooden_sword'));
  const dropped = prog.dropItem(equipped, 0);
  eq(dropped.inventory.length, equipped.inventory.length - 1);
});
run('quests become ready once and claim grants gold', () => {
  let s = prog.initialState();
  const r = prog.questProgress(s, 'kill', 5, 'grove');
  s = r.state;
  ok(r.ready.includes('first_blood'));
  const claimed = prog.claimQuest(s, 'first_blood');
  ok(claimed && claimed.gold === 40);
  eq(prog.claimQuest(claimed, 'first_blood'), null);
  const g = prog.questProgress(claimed, 'gold', 100);
  ok(g.ready.includes('treasure'));
});
run('cooldowns tick down and clamp to zero', () => {
  const s = prog.initialState();
  const started = combat.cast(s, SKILLS[0]);
  eq(started.cooldowns.fireball, 5);
  const ticked = prog.tickCooldowns(started, 2);
  eq(ticked.cooldowns.fireball, 3);
  eq(prog.tickCooldowns(ticked, 99).cooldowns.fireball, 0);
});
run('save normalisation repairs corrupted data', () => {
  eq(prog.normalize(null).level, 1);
  eq(prog.normalize({ version: 99, level: 50 }).level, 1);
  const bad = { ...prog.initialState(), hp: 9999, mana: -4, inventory: [{ itemId: 'nope', quantity: 2 }] };
  const n = prog.normalize(bad);
  eq(n.hp, n.maxHp); eq(n.mana, 0); eq(n.inventory.length, 0);
});
run('combo damage and casting rules', () => {
  const s = prog.initialState();
  const now = 10000;
  eq(combat.comboFor(2, now, now - 1000), 3);
  eq(combat.comboFor(2, now, now - 4000), 1);
  ok(combat.meleeDamage(s, 3) > combat.meleeDamage(s, 1));
  eq(combat.canCast(s, SKILLS[0]), null);
  eq(combat.canCast({ ...s, mana: 2 }, SKILLS[0]), 'mana');
  eq(combat.canCast({ ...s, cooldowns: { fireball: 2 } }, SKILLS[0]), 'cooldown');
  const c = combat.cast(s, SKILLS[0]);
  eq(c.mana, s.mana - SKILLS[0].mana);
  eq(combat.damageTaken(s, 10, true), 0);
  ok(combat.damageTaken(s, 10, false) > 0);
});
run('movement helpers are deterministic and bounded', () => {
  const a = ent.rng(42), b = ent.rng(42);
  for (let i = 0; i < 10; i++) eq(a(), b());
  const list = ent.spawnEnemies(ZONES[0], 8, 7);
  eq(list.length, 8);
  ok(list.every(e => e.hp > 0 && e.alive));
  ok(list.every(e => e.x >= 0 && e.x <= 820 && e.y >= 0 && e.y <= 560));
  const target = { x: 100, y: 100 };
  const e = { x: 200, y: 100 };
  ent.moveTowards(e, target, 1, 50);
  near(e.x, 150, 0.001);
  const clamped = ent.clamp({ x: -20, y: 999 });
  eq(clamped.x, 18); ok(clamped.y < 560);
  ok(combat.nearestEnemy({ x: 0, y: 0 }, [{ x: 5, y: 0, alive: true }], 10));
  ok(!combat.inRange({ x: 0, y: 0 }, { x: 100, y: 0 }, 10));
});
run('persistence helpers round-trip', () => {
  store.clear();
  storage.saveGame(prog.initialState());
  eq(storage.loadGame().level, 1);
  storage.savePrefs({ sound: false, theme: 'light' });
  eq(storage.loadPrefs().sound, false);
  storage.clearGame();
  eq(storage.loadGame().level, 1);
});
run('all modules, PWA assets and README exist', () => {
  ['config','i18n','storage','audio','glass','input','render','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['entities','progression','combat'].forEach(n =>
    ok(existsSync(join(ROOT, 'js/core', n + '.js')), 'core/' + n));
  ['css/app.css','manifest.webmanifest','icon.svg','icons/icon-192.png','icons/icon-512.png','README.md'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
});
run('HTML is GitHub-Pages safe and shell is inside body', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(!html.includes('unpkg.com') && !html.includes('jsdelivr') && !html.includes('cdn'));
  ok(!html.includes('fonts.googleapis.com'));
  ok(!html.includes('labs.phaser.io'));
  ok(html.indexOf('<script src="../../projects/_shared/shell.js"') < html.indexOf('</body>'));
  ok(html.includes('data-act="attack"'));
  ok(html.includes('id="joystick"'));
});
run('SW precaches every module and asset', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(/pf-rpg-game-shell-v\d+/.test(sw));
  ['js/core/progression.js','js/core/combat.js','js/render.js','js/input.js','css/app.css'].forEach(f =>
    ok(sw.includes(f), f));
});
run('catalog, SEO and root SW updated', () => {
  const root = join(ROOT, '..', '..');
  const catalog = readFileSync(join(root, 'assets/js/catalog-data.js'), 'utf8');
  ok(catalog.includes("'games/rpg-game/index.html'"));
  ok(catalog.includes("'games/rpg/index.html'"));
  const seo = readFileSync(join(root, 'config/seo.json'), 'utf8');
  ok(!seo.includes('rpg_game/**'));
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  ok((sw.includes("name.startsWith('portfolio-')") && sw.includes('isNestedApp')));
});
run('i18n keys used in JS all exist', () => {
  for (const f of ['main.js','ui.js','render.js','input.js','audio.js']) {
    const src = readFileSync(join(ROOT, 'js', f), 'utf8');
    [...src.matchAll(/\bt\('([a-zA-Z]+)'\)/g)].forEach(m => ok(STR.en[m[1]], f + ': ' + m[1]));
  }
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
