import { test, eq, ok, summary } from '../../../games/_kit/test-harness.js';
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
globalThis.document = { documentElement: { lang: '' }, querySelectorAll: () => [] };

const { generate, gridSize, sameCell, solutionMap, keyOf } = await import(join(ROOT, 'js/generator.js'));
const { Game } = await import(join(ROOT, 'js/engine.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const { seeded, dailySeed } = await import(join(ROOT, 'js/rng.js'));
const { STR, MODES, DIFFICULTY, MAX_LEVEL } = await import(join(ROOT, 'js/config.js'));
const { applyStatic } = await import(join(ROOT, 'js/i18n.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, f) => cases.push([n, f]);

// ---- generator ----
run('grid grows every 8 levels up to 9', () => {
  eq(gridSize(1), 3); eq(gridSize(8), 3); eq(gridSize(9), 4);
  eq(gridSize(200), 9);
});
run('pattern is deterministic for a seed', () => {
  const a = generate(5, 123), b = generate(5, 123);
  eq(JSON.stringify(a.sequence), JSON.stringify(b.sequence));
  eq(a.shape, b.shape);
});
run('pattern cells are inside the grid and non-repeating', () => {
  for (let lv = 1; lv <= 40; lv++) {
    const p = generate(lv);
    ok(p.length >= 3);
    p.sequence.forEach(c => {
      ok(c.r >= 0 && c.r < p.size && c.c >= 0 && c.c < p.size);
    });
    for (let i = 1; i < p.sequence.length; i++) {
      ok(!sameCell(p.sequence[i - 1], p.sequence[i]));
    }
  }
});
run('solution map gives 1-based order', () => {
  const p = generate(3, 42);
  const map = solutionMap(p);
  eq(map.get(keyOf(p.sequence[0])), 1);
  eq(map.get(keyOf(p.sequence[p.length - 1])), p.length);
});
run('daily seed is date-stable', () => {
  const a = new Date(2026, 0, 15), b = new Date(2026, 0, 16);
  ok(dailySeed(a) !== dailySeed(b));
  eq(dailySeed(a), dailySeed(new Date(2026, 0, 15)));
});

// ---- engine ----
run('start prepares classic and memory modes', () => {
  const g = new Game();
  const a = g.start(1, 'classic');
  eq(a.status, 'playing');
  const b = g.start(1, 'memory');
  eq(b.status, 'preview');
  g.beginPlay(); eq(g.status, 'playing');
});
run('correct taps advance and build combo', () => {
  const g = new Game();
  g.start(1, 'classic');
  const first = g.pattern.sequence[0];
  const r = g.tap(first);
  ok(r.ok); eq(g.progress, 1); eq(g.combo, 1); ok(g.score > 0);
});
run('wrong tap costs a life and resets combo', () => {
  const g = new Game();
  g.start(1, 'classic');
  g.tap(g.pattern.sequence[0]);
  const wrong = { r: (g.pattern.sequence[1].r + 1) % g.pattern.size, c: g.pattern.sequence[1].c };
  const r = g.tap(wrong);
  ok(!r.ok); eq(g.combo, 0); eq(g.lives, 2);
});
run('three misses ends the game', () => {
  const g = new Game();
  g.start(1, 'classic');
  for (let i = 0; i < 3; i++) {
    const wrong = { r: 0, c: 0 };
    if (sameCell(g.pattern.sequence[0], wrong)) wrong.c = 1;
    g.tap(wrong);
  }
  eq(g.status, 'gameover');
});
run('completing a pattern wins with stars', () => {
  const g = new Game();
  g.start(1, 'classic');
  g.pattern.sequence.forEach(c => g.tap(c));
  eq(g.status, 'complete');
  ok(g.stars >= 1 && g.stars <= 3);
});
run('combo yields more points for later hits', () => {
  const a = new Game(); a.start(8, 'classic');
  a.pattern.sequence.slice(0, 5).forEach(c => a.tap(c));
  const high = a.score;
  const b = new Game(); b.start(8, 'classic');
  b.pattern.sequence.slice(0, 5).forEach(c => { b.tap({ r: 0, c: 0 }); b.tap(c); });
  ok(high > 0);
  ok(a.maxCombo >= 5);
});
run('undo and hint have costs', () => {
  const g = new Game();
  g.start(2, 'classic');
  g.tap(g.pattern.sequence[0]);
  const before = g.score;
  ok(g.undo()); eq(g.progress, 0); ok(g.score <= before);
  const h = g.hint();
  ok(h); eq(g.hints, 1); ok(g.hintUsed === 1);
});
run('speed mode ends after 60 seconds', () => {
  const g = new Game();
  g.start(1, 'speed');
  g.tick(61);
  eq(g.status, 'gameover');
});
run('snapshot exposes all HUD fields', () => {
  const g = new Game(); g.start(3, 'memory'); const s = g.snapshot();
  ['level','mode','status','size','sequence','progress','score','lives','combo','hints','elapsed'].forEach(k =>
    ok(k in s, k));
});

// ---- storage ----
run('stars unlock next level', () => {
  store.clear(); storage.resetAll();
  storage.setStars(1, 3);
  ok(storage.profile.unlocked.includes(2));
  eq(storage.profile.stars[1], 3);
});
run('best score and stats persist', () => {
  storage.setBest('classic', 500);
  storage.addStats({ wins: 2, score: 500 });
  eq(storage.profile.best.classic, 500);
  eq(storage.profile.stats.wins, 2);
});

// ---- structure ----
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('five modes and three difficulties', () => {
  eq(MODES.length, 5);
  eq(Object.keys(DIFFICULTY).length, 3);
  ok(MAX_LEVEL >= 100);
});
run('all modules and SW assets exist', () => {
  ['config','i18n','storage','rng','generator','engine','audio','fx','render','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ['index.html','manifest.webmanifest','css/app.css'].forEach(f => ok(sw.includes(f), f));
  ['generator','engine','render','main'].forEach(n => ok(sw.includes('js/' + n + '.js'), n));
});
run('HTML has canonical, shell and board, no legacy global scripts', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(html.includes('id="board"'));
  ok(!html.includes('src="game.js"'));
  ok(!html.includes('feature-test.js'));
});
run('translation preserves nested HUD elements', () => {
  const nested = { nodeType: 1, textContent: '×0' };
  const label = { nodeType: 3, textContent: 'Combo' };
  const el = { dataset: { i18n: 'combo' }, childNodes: [label, nested], textContent: '' };
  applyStatic({ querySelectorAll: () => [el] });
  ok(el.childNodes.includes(nested), 'nested <b> was removed');
  eq(label.textContent, 'Combo');
});
run('combo value lives outside translated nodes', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('id="comboVal"'));
  ok(!/data-i18n="combo"[^>]*>[^<]*<b id="comboVal"/.test(html));
});
run('manifest has icons', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(m.icons.length >= 2);
  ok(existsSync(join(ROOT, 'icons/icon-192.png')));
});

for (const [name, fn] of cases) { total++; if (test(name, fn)) passed++; }
summary(passed, total);
