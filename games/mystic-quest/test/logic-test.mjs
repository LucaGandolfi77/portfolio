import { test, eq, ok, summary } from '../../_kit/test-harness.js';
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

const { STR, REALMS, OBJECTIVES, WORLD, VERSION } = await import(join(ROOT, 'js/config.js'));
const world = await import(join(ROOT, 'js/core/world.js'));
const prog = await import(join(ROOT, 'js/core/progression.js'));
const story = await import(join(ROOT, 'js/core/story.js'));
const storage = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

run('i18n dictionaries aligned and complete', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('five realms with distinct themes and stories', () => {
  eq(REALMS.length, 5);
  eq(OBJECTIVES.length, 3);
  const ids = new Set(REALMS.map(r => r.id));
  eq(ids.size, 5);
  REALMS.forEach(r => ok(r.en && r.it && r.sky.length === 2 && r.ground && r.accent && r.spirit, r.id));
});
run('world layout is deterministic and in bounds', () => {
  for (let i = 0; i < REALMS.length; i++) {
    const a = world.layout(i), b = world.layout(i);
    eq(JSON.stringify(a), JSON.stringify(b));
    eq(a.stars.length, 3);
    ok(a.stars.every(s => s.x > 0 && s.x < WORLD.w && s.y > 0 && s.y < WORLD.h));
    ok(a.stars.every((s, j) => a.stars.slice(j + 1).every(o => Math.hypot(s.x - o.x, s.y - o.y) > 50)));
    ok(a.spirit.x > 0 && a.spirit.x < WORLD.w);
    ok(a.portal.y < 100);
  }
});
run('RNG is deterministic and proximity helpers work', () => {
  const a = world.rng(7), b = world.rng(7);
  for (let i = 0; i < 20; i++) eq(a(), b());
  const hit = world.nearestWithin([{ x:10, y:10 }, { x:200, y:200 }], { x:12, y:12 }, 30);
  eq(hit.index, 0);
  eq(world.nearestWithin([{ x:10, y:10 }], { x:300, y:300 }, 30), null);
  const c = world.clampToWorld({ x:-50, y:999 });
  ok(c.x >= 14 && c.y <= WORLD.h);
});
run('initial progression is coherent', () => {
  const s = prog.initialState();
  eq(s.version, VERSION);
  eq(s.realm, 0); eq(s.unlocked, 1);
  eq(prog.starCount(s), 0); eq(prog.spiritCount(s), 0);
  eq(s.stars.length, 5);
  ok(s.stars.every(r => r.length === 3 && r.every(v => v === false)));
});
run('collecting stars completes a realm', () => {
  let s = prog.initialState();
  for (let i = 0; i < 3; i++) {
    const r = prog.addStar(s, 0, i);
    s = r.state;
    eq(r.complete, i === 2);
    if (i > 0) eq(r.already, false);
  }
  const dup = prog.addStar(s, 0, 0);
  eq(dup.already, true); eq(dup.state, s);
  eq(prog.starCount(s), 3);
});
run('rescuing spirits unlocks the next realm and finishes the game', () => {
  let s = prog.initialState();
  for (let i = 0; i < REALMS.length; i++) {
    const r = prog.rescueSpirit(s, i);
    s = r.state;
    eq(r.unlocked, Math.min(REALMS.length, i + 2));
    eq(r.finished, i === REALMS.length - 1);
  }
  eq(prog.spiritCount(s), 5);
  eq(s.completed, true);
  eq(prog.rescueSpirit(s, 0).already, true);
});
run('objectives and memories update', () => {
  let s = prog.initialState();
  s = prog.addMemory(s, 'Prima stella');
  eq(s.memories.length, 1);
  const list = prog.objectiveList(s);
  eq(list.length, 3);
  eq(list[0].current, 0);
  ok(list.every(o => o.goal > 0));
});
run('normalisation repairs corrupt saves', () => {
  eq(prog.normalize(null).realm, 0);
  eq(prog.normalize({ version:99, realm:4 }).realm, 0);
  const bad = { ...prog.initialState(), realm:99, unlocked:99, stars:null, spirits:null };
  const n = prog.normalize(bad);
  eq(n.realm, 4); eq(n.unlocked, 5); eq(n.stars.length, 5);
  eq(n.spirits.filter(Boolean).length, 0);
});
run('story helpers produce bilingual chapters and typewriter output', () => {
  for (let i = 0; i < REALMS.length; i++) {
    ok(story.chapterLines(i, 'en').length >= 2);
    ok(story.chapterLines(i, 'it')[0].startsWith('Capitolo'));
    ok(story.spiritLine(i, 'en').includes(REALMS[i].en));
  }
  eq(story.typed('abcdef', 0.5, 10), 'abcde');
  ok(story.finale('it').includes('cielo'));
});
run('persistence helpers round-trip', () => {
  store.clear();
  const s = prog.initialState();
  s.realm = 2;
  storage.saveGame(s);
  eq(storage.loadGame().realm, 2);
  storage.savePrefs({ sound:false, theme:'light' });
  eq(storage.loadPrefs().sound, false);
  storage.clearGame();
  eq(storage.loadGame().realm, 0);
});
run('all modules, PWA assets and README exist', () => {
  ['config','i18n','storage','audio','glass','input','render','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['world','progression','story'].forEach(n =>
    ok(existsSync(join(ROOT, 'js/core', n + '.js')), 'core/' + n));
  ['css/app.css','manifest.webmanifest','icon.svg','icons/icon-192.png','icons/icon-512.png','README.md'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
});
run('HTML is GitHub-Pages safe and shell is inside body', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(!html.includes('unpkg.com') && !html.includes('jsdelivr') && !html.includes('cdn'));
  ok(!html.includes('../../top_buttons.js'));
  ok(html.indexOf('<script src="../../projects/_shared/shell.js"') < html.indexOf('</body>'));
  ok(html.includes('data-act="lantern"'));
});
run('SW precaches every module and asset', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(/pf-mystic-shell-v\d+/.test(sw));
  ['js/core/world.js','js/core/story.js','js/render.js','js/input.js','css/app.css'].forEach(f =>
    ok(sw.includes(f), f));
});
run('catalog and root SW updated', () => {
  const root = join(ROOT, '..', '..');
  const catalog = readFileSync(join(root, 'assets/js/catalog-data.js'), 'utf8');
  ok(catalog.includes("'games/mystic-quest/index.html'"));
  ok(catalog.includes('15 real stars'));
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
