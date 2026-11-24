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

const model = await import(join(ROOT, 'js/model.js'));
const { Simulator } = await import(join(ROOT, 'js/engine.js'));
const { seeded, dailySeed } = await import(join(ROOT, 'js/rng.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const charts = await import(join(ROOT, 'js/charts.js'));
const { STR, STATES, ACTIVITIES, EVENTS } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, f) => cases.push([n, f]);

// ---- model ----
run('51 states/regions with coherent data', () => {
  eq(STATES.length, 51);
  ok(model.USA.pop > 300e6);
  ok(Object.keys(model.DB).length === 51);
  STATES.forEach(s => ok(s[2] > 0 && s[7] > 0 && s[9] > 0));
});
run('activity mix sums to 100', () => {
  const p = model.stateProfile('California', new Date('2026-01-15T12:00:00Z'));
  const sum = Object.values(p.mix).reduce((a, b) => a + b, 0);
  eq(sum, 100);
});
run('night is sleep dominated, noon is work dominated', () => {
  const night = model.stateProfile('New York', new Date('2026-01-15T09:00:00Z')); // 04:00 ET
  const noon = model.stateProfile('New York', new Date('2026-01-15T16:00:00Z')); // 11:00 ET
  eq(model.dominant(night.mix), 'sleep');
  eq(model.dominant(noon.mix), 'work');
});
run('weekend reduces work', () => {
  const weekday = model.stateProfile('Texas', new Date('2026-01-14T17:00:00Z'));
  const weekend = model.stateProfile('Texas', new Date('2026-01-18T17:00:00Z'));
  ok(weekend.mix.work < weekday.mix.work);
});
run('holiday event reduces work and raises leisure', () => {
  const normal = model.stateProfile('Florida', new Date('2026-01-15T16:00:00Z'), 'none');
  const holiday = model.stateProfile('Florida', new Date('2026-01-15T16:00:00Z'), 'holiday');
  ok(holiday.mix.work < normal.mix.work);
  ok(holiday.mix.leisure > normal.mix.leisure);
});
run('counts scale with population', () => {
  const small = model.counts({ home: 50, sleep: 50, work: 0 }, 1000);
  eq(small.home, 500);
});
run('metrics are bounded 0..100', () => {
  const m = model.metrics({ work: 90, sleep: 0, leisure: 0, travel: 0, home: 10 });
  Object.values(m).forEach(v => ok(v >= 0 && v <= 100));
});
run('hourly series has 24 entries', () => {
  const s = model.hourlySeries('Ohio', new Date('2026-01-15T00:00:00Z'), 'none', 24);
  eq(s.length, 24);
  ok(s.every(x => x.dominant && x.metrics));
});
run('population ranking is descending', () => {
  eq(model.POP_RANK[0], 'California');
  for (let i = 1; i < model.POP_RANK.length; i++) {
    ok(model.DB[model.POP_RANK[i - 1]].pop >= model.DB[model.POP_RANK[i]].pop);
  }
});

// ---- engine ----
run('simulator steps one hour', () => {
  const sim = new Simulator();
  const before = new Date(sim.time);
  sim.step();
  eq(sim.time.getTime() - before.getTime(), 3600000);
});
run('stepDay advances 24 hours', () => {
  const sim = new Simulator();
  const before = new Date(sim.time);
  sim.stepDay();
  eq(sim.time.getTime() - before.getTime(), 24 * 3600000);
});
run('pause stops updates', () => {
  const sim = new Simulator();
  sim.toggle();
  const before = sim.time.getTime();
  sim.update(100);
  eq(sim.time.getTime(), before);
});
run('jumpTo sets the hour', () => {
  const sim = new Simulator();
  sim.jumpTo(17);
  eq(sim.time.getHours(), 17);
});
run('deterministic RNG with seed', () => {
  const a = seeded(777), b = seeded(777);
  for (let i = 0; i < 5; i++) eq(a(), b());
  ok(dailySeed(new Date(2026, 0, 15)) !== dailySeed(new Date(2026, 0, 16)));
});

// ---- storage ----
run('settings and favorites persist', () => {
  store.clear();
  storage.setSetting({ speed: 20 });
  eq(storage.profile.settings.speed, 20);
  eq(storage.profile.settings.theme, 'dark');
  ok(storage.toggleFavorite('Nevada'));
  ok(storage.profile.favorites.includes('Nevada'));
});

// ---- charts / structure ----
run('chart renderers return SVG markup', () => {
  const mix = model.stateProfile('Utah', new Date('2026-01-15T17:00:00Z')).mix;
  ok(charts.donut(mix).includes('<svg'));
  ok(charts.activityBars(mix, 'en').includes('bar-row'));
  ok(charts.dayStrip(model.hourlySeries('Utah', new Date('2026-01-15T00:00:00Z'))).includes('day-cell'));
});
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('events cover normal day plus five scenarios', () => {
  eq(EVENTS.length, 6);
  ok(EVENTS.some(e => e.id === 'snow'));
  ok(ACTIVITIES.length === 13);
});
run('vendored assets and modules exist', () => {
  ['vendor/d3.min.js','vendor/topojson.min.js','data/us-states-10m.json','css/app.css'].forEach(f =>
    ok(existsSync(join(ROOT, f)), f));
  ['config','i18n','storage','rng','model','engine','geo','charts','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ['vendor/d3.min.js','data/us-states-10m.json','js/model.js','js/engine.js'].forEach(f =>
    ok(sw.includes(f), f));
});
run('HTML has canonical, shell and no CDN scripts', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(!html.includes('https://d3js.org'));
  ok(!html.includes('cdn.jsdelivr.net'));
});
run('manifest has real icons', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(m.icons.length >= 2);
  ok(existsSync(join(ROOT, 'icons/icon-192.png')));
});

for (const [name, fn] of cases) { total++; if (test(name, fn)) passed++; }
summary(passed, total);
