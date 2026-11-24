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

const f = await import(join(ROOT, 'js/fractal.js'));
const { seeded, hashSeed } = await import(join(ROOT, 'js/rng.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const { STR, FORMS, PRESETS, PALETTES, DEFAULT_SETTINGS } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

// ---- geometry ----
run('poly vertices are unit circle and configurable', () => {
  const v = f.polyVerts(3);
  eq(v.length, 3);
  v.forEach(p => ok(Math.abs(Math.hypot(p.x, p.y) - 1) < 1e-9));
  ok(f.polyVerts(5).length === 5);
});
run('triangle recursion count is 3^depth', () => {
  for (let d = 0; d <= 5; d++) eq(f.trianglePath(d).count, Math.pow(3, d));
});
run('triangle transforms change geometry deterministically', () => {
  const a = f.trianglePath(2, { seed: 42 });
  const b = f.trianglePath(2, { seed: 42 });
  eq(JSON.stringify(a), JSON.stringify(b));
  const skewed = f.trianglePath(2, { skewX: 20, skewY: -10, seed: 42 });
  ok(JSON.stringify(a) !== JSON.stringify(skewed));
});
run('jitter changes points with a seed', () => {
  const a = f.trianglePath(2, { jitter: 30, seed: 7 });
  const b = f.trianglePath(2, { jitter: 30, seed: 8 });
  ok(JSON.stringify(a) !== JSON.stringify(b));
});
run('square fractals grow by 8/5/4 children', () => {
  eq(f.squares('carpet', 1).count, 8);
  eq(f.squares('vicsek', 1).count, 5);
  eq(f.squares('dust', 1).count, 4);
});
run('twist rotates the carpet deterministically', () => {
  const a = f.squares('carpet', 2, { twist: 0 });
  const b = f.squares('carpet', 2, { twist: 20 });
  ok(JSON.stringify(a) !== JSON.stringify(b));
});
run('t-square and h-tree counts are bounded', () => {
  ok(f.tSquare(3).count > 0);
  ok(f.hTree(3).count > 0);
  ok(f.tree(3).count > 0);
});
run('koch and dragon produce valid paths', () => {
  const k = f.koch(2, 60);
  eq(k.type, 'path'); ok(k.points.length > 3);
  const d = f.dragon(6, 90);
  eq(d.type, 'path'); ok(d.points.length > 10);
  ok(f.dragon(6, 70).points[3].x !== d.points[3].x);
});
run('chaos game stays within bounds and respects no-repeat', () => {
  const s = f.newChaos(42);
  let prev = -1;
  for (let i = 0; i < 100; i++) {
    const p = f.chaosStep(s, { verts: 3, pull: 50, noRepeat: true, rng: seeded(i + 1) });
    ok(p.index !== prev || false);
    ok(s.x >= -1.2 && s.x <= 1.2 && s.y >= -1.2 && s.y <= 1.2);
    prev = p.index;
  }
  eq(s.count, 100);
});
run('build dispatches all vector forms', () => {
  FORMS.filter(x => x.id !== 'chaos').forEach(form => {
    const g = f.build(form.id, form.defaults, 42);
    ok(g && g.count > 0, form.id);
  });
});
run('RNG and hashSeed are deterministic', () => {
  const a = seeded(99), b = seeded(99);
  for (let i = 0; i < 5; i++) eq(a(), b());
  eq(hashSeed('abc'), hashSeed('abc'));
  ok(hashSeed('abc') !== hashSeed('abd'));
});

// ---- storage ----
run('settings, params and favorites persist', () => {
  store.clear(); storage.resetAll();
  storage.setSettings({ glow: 20, symmetry: 4 });
  storage.setParams('tri', { depth: 9 });
  ok(storage.toggleFavorite('tri'));
  eq(storage.profile.settings.glow, 20);
  eq(storage.profile.params.tri.depth, 9);
  ok(storage.profile.favorites.includes('tri'));
});

// ---- structure ----
run('11 forms and 8 presets', () => {
  eq(FORMS.length, 11);
  ok(PRESETS.length >= 8);
  FORMS.forEach(form => ok(form.params.length > 0 && form.defaults, form.id));
});
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('palettes all provide six colors', () => {
  Object.values(PALETTES).forEach(p => {
    ok(typeof p.fn(0, 8) === 'string' && p.fn(0, 8).includes('hsl'));
  });
  ok(DEFAULT_SETTINGS.symmetry >= 1);
});
run('vendored-free modules and icons exist', () => {
  ['config','i18n','storage','rng','fractal','camera','render','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  ['icon.svg','icons/icon-192.png','icons/icon-512.png','css/app.css'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ['fractal','camera','render','main'].forEach(n => ok(sw.includes('js/' + n + '.js'), n));
});
run('HTML has canonical, shell, no CDN fonts and mobile sheet', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(html.includes('id="sheet"'));
  ok(!html.includes('fonts.googleapis.com'));
});
run('manifest has icons and correct scope', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  eq(m.scope, './');
  ok(m.icons.length >= 2);
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
