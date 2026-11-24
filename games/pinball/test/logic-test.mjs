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
globalThis.window = { addEventListener() {}, dispatchEvent() {}, devicePixelRatio:2 };

const { STR, TABLES, PHYSICS, VERSION, OBJECTIVES } = await import(join(ROOT, 'js/config.js'));
const scoring = await import(join(ROOT, 'js/engine/scoring.js'));
const physics = await import(join(ROOT, 'js/engine/physics.js'));
const tables = await import(join(ROOT, 'js/engine/tables.js'));
const storage = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

run('i18n dictionaries aligned and complete', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('four distinctive tables are configured', () => {
  eq(TABLES.length, 4);
  eq(tables.count(), 4);
  const ids = new Set(TABLES.map(t => t.id));
  eq(ids.size, 4);
  TABLES.forEach(t => {
    ok(t.name && t.tag && t.icon && t.features.length >= 4);
    ok(t.palette.bg.length === 3 && t.palette.accent);
    ok(t.bumpers.length >= 3 && t.targets.letters.length >= 3);
    ok(t.star && t.star.points > 0);
    ok(t.bankName && t.rageCount >= 0);
  });
  ok(tables.featuresOf(TABLES[0]).includes('SKILL SHOT'));
  ok(tables.paletteOf(TABLES[1]).accent);
  eq(scoring.tableById('dragon').id, 'dragon');
  eq(scoring.tableById('nope').id, TABLES[0].id);
});
run('physics constants are conservative and testable', () => {
  eq(PHYSICS.SUBSTEPS, 4);
  ok(PHYSICS.GRAVITY > 0 && PHYSICS.FRICTION < 1 && PHYSICS.WALL_REST < 1);
  eq(PHYSICS.MULT_STEPS[0], 1);
  eq(PHYSICS.MULT_STEPS.at(-1), 10);
});
run('scoring helpers clamp, format and rank', () => {
  eq(scoring.multiplier(-3), 1);
  eq(scoring.multiplier(99), 10);
  eq(scoring.formatScore(12345.9), '12,346');
  eq(scoring.formatScore(-4), '0');
  eq(scoring.highKey('space'), 'pb_high_space');
  const ranked = scoring.rankScores([{ score:12 }, { score:99 }, { score:5 }]);
  eq(ranked[0].score, 99);
  eq(ranked.length, 3);
});
run('records detect top-5 placement', () => {
  const empty = [];
  eq(scoring.isRecord({ space:empty }, 'space', 100), true);
  eq(scoring.isRecord({ space:empty }, 'space', 0), false);
  const full = Array.from({ length:5 }, (_, i) => ({ score:100 - i * 10 }));
  eq(scoring.isRecord({ space:full }, 'space', 105), true);
  eq(scoring.isRecord({ space:full }, 'space', 50), false);
});
run('daily challenge seed is deterministic', () => {
  const a = scoring.challengeSeed('2026-11-24'), b = scoring.challengeSeed('2026-11-24');
  eq(a, b);
  ok(scoring.challengeSeed('2026-11-25') !== a);
  const r1 = scoring.seededRandom(a), r2 = scoring.seededRandom(a);
  for (let i = 0; i < 12; i++) eq(r1(), r2());
});
run('pure physics helpers behave', () => {
  eq(physics.clamp(12, 0, 10), 10);
  eq(physics.dist({ x:0, y:0 }, { x:3, y:4 }), 5);
  const r = physics.reflect({ x:1, y:-1 }, 1, 0, 1);
  eq(r.x, -1);
  eq(physics.circleHit({ x:0, y:0 }, 5, { x:6, y:0 }, 2), true);
  eq(physics.lerp(0, 10, 0.25), 2.5);
});
run('profile starts empty and validates corrupt data', () => {
  const p = storage.initialProfile();
  eq(p.version, VERSION);
  eq(p.games, 0);
  eq(Object.keys(p.scores).length, 4);
  eq(storage.normalizeProfile(null).games, 0);
  eq(storage.normalizeProfile({ version:99 }).games, 0);
  const bad = storage.normalizeProfile({ ...p, scores:null, played:null });
  eq(Object.keys(bad.scores).length, 4);
});
run('scores, games and objectives update', () => {
  let p = storage.initialProfile();
  const r = storage.recordScore(p, 'space', 12345);
  p = r.profile;
  eq(r.record, true);
  eq(p.games, 1);
  eq(p.bestOverall, 12345);
  eq(p.scores.space[0].score, 12345);
  eq(storage.objectives(p)[0].current, 1);
  p = storage.recordChallenge(p, { seed:42, score:12345, target:10000, won:true });
  eq(p.challenges.length, 1);
  eq(OBJECTIVES.length, 3);
});
run('persistence helpers round-trip', () => {
  store.clear();
  let p = storage.initialProfile();
  p.games = 7;
  storage.saveProfile(p);
  eq(storage.loadProfile().games, 7);
  storage.savePrefs({ sound:false, theme:'light' });
  eq(storage.loadPrefs().sound, false);
});
run('all modules, PWA assets and README exist', () => {
  ['config','i18n','storage','glass','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['core.js','physics.js','tables.js','scoring.js'].forEach(n =>
    ok(existsSync(join(ROOT, 'js/engine', n)), 'engine/' + n));
  ['css/app.css','manifest.webmanifest','icon.svg','icons/icon-192.png','icons/icon-512.png','README.md'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
});
run('engine was extracted and keeps its debug hook', () => {
  const core = readFileSync(join(ROOT, 'js/engine/core.js'), 'utf8');
  ok(core.includes('export function bootPinball'));
  ok(core.includes('window.__pinDebug'));
  ok(core.includes("import { TABLES } from '../config.js'"));
  ok(!core.includes('<script'));
});
run('HTML is GitHub-Pages safe and keeps engine ids', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(!html.includes('../../top_buttons.js'));
  ok(!html.includes('unpkg.com') && !html.includes('jsdelivr'));
  ok(html.indexOf('<script src="../../projects/_shared/shell.js"') < html.indexOf('</body>'));
  ['pin','score','multVal','balls','bestVal','tableChip','startScreen','gameOverScreen',
   'pauseScreen','plungerBtn','leftZone','rightZone','autoBtn','muteBtn'].forEach(id =>
    ok(html.includes('id="' + id + '"'), id));
});
run('SW precaches every module and asset', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(sw.includes('pf-pinball-shell-v1'));
  ['js/engine/core.js','js/engine/scoring.js','js/main.js','css/app.css'].forEach(f =>
    ok(sw.includes(f), f));
});
run('catalog and root SW updated', () => {
  const root = join(ROOT, '..', '..');
  const catalog = readFileSync(join(root, 'assets/js/catalog-data.js'), 'utf8');
  ok(catalog.includes("'games/pinball/index.html'"));
  ok(catalog.includes('Daily challenge'));
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  ok(sw.includes("cacheName.indexOf('pf-pinball-') === 0"));
});
run('i18n keys used in JS all exist', () => {
  for (const f of ['main.js','ui.js']) {
    const src = readFileSync(join(ROOT, 'js', f), 'utf8');
    [...src.matchAll(/\bt\('([a-zA-Z]+)'\)/g)].forEach(m => ok(STR.en[m[1]], f + ': ' + m[1]));
  }
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
