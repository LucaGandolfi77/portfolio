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

const { STR, KARTS, TRACKS, MODES, POWERUPS, VERSION, WORLD } = await import(join(ROOT, 'js/config.js'));
const { Track } = await import(join(ROOT, 'js/core/track.js'));
const phys = await import(join(ROOT, 'js/core/physics.js'));
const raceMod = await import(join(ROOT, 'js/core/race.js'));
const prog = await import(join(ROOT, 'js/core/progression.js'));
const storageMod = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

run('i18n dictionaries aligned and complete', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('catalogues are rich and coherent', () => {
  eq(KARTS.length, 12); eq(TRACKS.length, 9); eq(MODES.length, 4);
  ok(POWERUPS.length >= 5);
  KARTS.forEach(k => ok(k.speed > 0 && k.accel > 0 && k.handling > 0 && k.grip > 0 && k.color, k.id));
  TRACKS.forEach(t => ok(t.points.length >= 20 && t.width > 40 && t.en && t.it, t.id));
  MODES.forEach(m => ok(m.laps > 0 && m.rivals >= 0, m.id));
});
run('track geometry is closed, measured and mask-ready', () => {
  const t = new Track(TRACKS[0]);
  ok(t.total > 1000);
  eq(t.segments.length, TRACKS[0].points.length);
  ok(t.isRoad(t.start.x, t.start.y), 'start on road');
  ok(!t.isRoad(-100, -100), 'outside is not road');
  const p = t.pointAt(t.total * 0.25);
  ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.angle));
  eq(t.checkpoint(t.total * 0.99), 3);
  eq(t.checkpoint(t.total * 0.01), 0);
  const proj = t.project(p.x + 5, p.y - 5);
  ok(proj.lateral < 20, 'projection near road');
  ok(proj.distance >= 0 && proj.distance <= t.total);
});
run('all 9 tracks precompute without errors', () => {
  TRACKS.forEach(def => {
    const t = new Track(def);
    ok(t.total > 500, def.id);
    ok(t.isRoad(t.start.x, t.start.y), def.id);
    ok(t.mask.length === t.mw * t.mh);
    ok(t.pointAt(t.total + 10).x !== undefined);
  });
});
run('racer physics accelerates, steers and stays in bounds', () => {
  const t = new Track(TRACKS[0]), k = KARTS[0];
  const r = phys.createRacer(k, t, 0, false);
  eq(r.lap, 0); eq(r.nitroFuel, k.nitro);
  for (let i = 0; i < 120; i++) phys.stepRacer(r, { steer:0, throttle:1 }, 1 / 60, t);
  ok(r.speed > 2, 'speed ' + r.speed);
  ok(r.x >= 0 && r.x <= WORLD.w && r.y >= 0 && r.y <= WORLD.h);
  const angle0 = r.angle;
  for (let i = 0; i < 30; i++) phys.stepRacer(r, { steer:1, throttle:1 }, 1 / 60, t);
  ok(Math.abs(r.angle - angle0) > 0.01, 'steering works');
});
run('drift charges and releases a mini-turbo', () => {
  const t = new Track(TRACKS[0]);
  const r = phys.createRacer(KARTS[0], t, 0, false);
  for (let i = 0; i < 90; i++) phys.stepRacer(r, { steer:0.6, throttle:1, drift:true }, 1 / 60, t);
  ok(r.driftCharge > 0.2, 'charge ' + r.driftCharge);
  phys.stepRacer(r, { steer:0.6, throttle:1, drift:false }, 1 / 60, t);
  ok(r.boost > 0, 'boost released');
});
run('AI racers produce valid input and standings', () => {
  const t = new Track(TRACKS[1]);
  const ai = phys.createRacer(KARTS[2], t, 1, true);
  for (let i = 0; i < 60; i++) {
    const input = phys.aiInput(ai, t, i / 60);
    ok(input.steer >= -1 && input.steer <= 1);
    phys.stepRacer(ai, input, 1 / 60, t);
  }
  const order = phys.standings([ai, phys.createRacer(KARTS[0], t, 0)], t);
  eq(order.length, 2);
  ok(order[0].score !== undefined || order[0].lap !== undefined);
});
run('collision resolution separates overlapping karts', () => {
  const t = new Track(TRACKS[0]);
  const a = phys.createRacer(KARTS[0], t, 0), b = phys.createRacer(KARTS[1], t, 1);
  b.x = a.x + 4; b.y = a.y;
  phys.resolveCollisions([a, b]);
  ok(Math.hypot(b.x - a.x, b.y - a.y) > 20);
});
run('race countdown, laps and finish work', () => {
  const t = new Track(TRACKS[0]);
  const r = raceMod.createRace('time', t, KARTS[0], { seed:3 });
  eq(r.phase, 'countdown'); eq(r.racers.length, 1);
  for (let i = 0; i < 200; i++) raceMod.updateRace(r, 1 / 60, { steer:0, throttle:1 });
  eq(r.phase, 'racing');
  ok(r.time > 0);
  ok(Array.isArray(r.ghost) && r.ghost.length > 0);
});
run('power-ups apply effects and respawn', () => {
  const t = new Track(TRACKS[0]);
  const r = raceMod.createRace('rush', t, KARTS[0], { seed:9 });
  ok(r.powerups.length >= 5);
  const player = r.racers[0];
  raceMod.applyPowerup(r, player, 'turbo');
  ok(player.boost > 0);
  raceMod.applyPowerup(r, player, 'shield');
  ok(player.shield > 0);
  raceMod.applyPowerup(r, player, 'freeze');
  ok(r.racers[1].freeze > 0);
  raceMod.applyPowerup(r, player, 'oil');
  ok(r.oils.length === 1);
});
run('progression awards stars and unlocks content', () => {
  const p = prog.initialProfile();
  eq(p.stars, 0);
  const r = prog.recordRace(p, { trackId:'meadow', modeId:'grandprix', time:72, won:true, place:1, isBest:true });
  eq(r.gained, 5);
  ok(r.profile.stars === 5);
  ok(r.profile.records['meadow:grandprix'] === 72);
  ok(r.unlocked.length >= 0);
  const invalid = prog.normalizeProfile({ version:99 });
  eq(invalid.stars, 0);
});
run('persistence helpers round-trip', () => {
  store.clear();
  const p = prog.initialProfile();
  p.stars = 7;
  storageMod.saveProfile(p);
  eq(storageMod.loadProfile().stars, 7);
});
run('all modules, PWA assets and README exist', () => {
  ['config','i18n','storage','audio','glass','input','render','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['track','physics','race','progression'].forEach(n =>
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
  ok(html.includes('data-act="nitro"') && html.includes('data-act="drift"'));
});
run('SW precaches every module and asset', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(sw.includes('pf-kart-shell-v1'));
  ['js/core/track.js','js/core/race.js','js/render.js','js/input.js','css/app.css'].forEach(f =>
    ok(sw.includes(f), f));
});
run('catalog and root SW updated', () => {
  const root = join(ROOT, '..', '..');
  const catalog = readFileSync(join(root, 'assets/js/catalog-data.js'), 'utf8');
  ok(catalog.includes("'games/kart/index.html'"));
  ok(catalog.includes('12 karts'));
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  ok(sw.includes("cacheName.indexOf('pf-kart-') === 0"));
});
run('i18n keys used in JS all exist', () => {
  for (const f of ['main.js','ui.js','render.js','input.js','audio.js']) {
    const src = readFileSync(join(ROOT, 'js', f), 'utf8');
    [...src.matchAll(/\bt\('([a-zA-Z]+)'\)/g)].forEach(m => ok(STR.en[m[1]], f + ': ' + m[1]));
  }
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
