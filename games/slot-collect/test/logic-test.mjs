/* Slot Collect — pure-core test suite (no DOM required) */
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

const { SYMBOLS, PAYLINES, DIFFICULTY, COLLECTIBLE, STR, UPGRADES } = await import(join(ROOT, 'js/config.js'));
const { seededRandom, dailySeed, mixSeed, pickWeighted } = await import(join(ROOT, 'js/rng.js'));
const { drawSymbol, generateGrid, evaluate, WILD, SCATTER } = await import(join(ROOT, 'js/systems/reels.js'));
const { changeBet, cashOut, upgradeCost, buyUpgrade, energyFor } = await import(join(ROOT, 'js/systems/economy.js'));
const { grantXP, xpForLevel, touchStreak, unlock, progressAchievements, addCollection, summary: prof } = await import(join(ROOT, 'js/systems/progression.js'));
const { defaults, migrate, load, save, SAVE_VERSION } = await import(join(ROOT, 'js/systems/storage.js'));
const { initialState, reduce, createStore, runSummary } = await import(join(ROOT, 'js/state.js'));

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

// ---- RNG ----
run('seeded RNG is reproducible', () => {
  const a = seededRandom(123), b = seededRandom(123);
  eq([a(),a(),a()].join(','), [b(),b(),b()].join(','));
  ok(seededRandom(1)() !== seededRandom(2)());
});
run('daily seed is date-stable and mixed', () => {
  eq(dailySeed(new Date(2026,0,15)), dailySeed(new Date(2026,0,15)));
  ok(dailySeed(new Date(2026,0,15)) !== dailySeed(new Date(2026,0,16)));
  ok(mixSeed(1,2) !== mixSeed(2,1));
});
run('weighted pick honours weights', () => {
  eq(pickWeighted(['a','b'], () => 0, x => x === 'a' ? 3 : 1), 'a');
  eq(pickWeighted(['a','b'], () => 0.99, x => x === 'a' ? 3 : 1), 'b');
});

// ---- reels ----
run('symbol draw stays in range and respects luck', () => {
  const rng = seededRandom(7);
  for (let i = 0; i < 200; i++) ok(drawSymbol(rng, 4, 0.8) >= 0 && drawSymbol(rng, 4, 0.8) < SYMBOLS.length);
});
run('grid has requested reels and 3 rows', () => {
  const g = generateGrid({ reels: 6, rng: seededRandom(3) });
  eq(g.length, 6); ok(g.every(c => c.length === 3));
});
run('paylines cover every reel', () => ok(PAYLINES.every(l => l.length === 5)));
run('two of a kind pays via pay table', () => {
  const grid = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
  grid[0][1] = 1;
  const r = evaluate(grid, { reels:5, bet:1 });
  ok(r.total > 0); ok(r.lines.length >= 1);
});
run('wild substitutes and flags wild line', () => {
  const grid = [[2,0,0],[2,0,0],[WILD,0,0],[2,0,0],[2,0,0]];
  const r = evaluate(grid, { reels:5, bet:1 });
  ok(r.lines.some(l => l.wildUsed));
});
run('scatters trigger free spins', () => {
  const grid = [[SCATTER,0,0],[SCATTER,0,0],[SCATTER,0,0],[0,0,0],[0,0,0]];
  const r = evaluate(grid, { reels:5, bet:1 });
  ok(r.freeSpins > 0); eq(r.scatters, 3);
});
run('higher bet multiplies payout', () => {
  const grid = [[2,0,0],[2,0,0],[2,0,0],[2,0,0],[2,0,0]];
  ok(evaluate(grid, { bet:3 }).total > evaluate(grid, { bet:1 }).total);
});

// ---- economy ----
run('bet clamps between 1 and 5', () => {
  eq(changeBet(1,-1), 1); eq(changeBet(5,1), 5); eq(changeBet(2,2), 4);
});
run('cash out applies fee', () => {
  const c = cashOut(100, 40); eq(c.net, 85); eq(c.banked, 125);
});
run('upgrade cost grows and purchase spends score', () => {
  ok(upgradeCost('energy',1) > upgradeCost('energy',0));
  const w = { score: 1000, upgrades: {} };
  eq(buyUpgrade(w, 'energy', 'score'), true);
  eq(w.upgrades.energy, 1); ok(w.score < 1000);
  eq(buyUpgrade({ score:0, upgrades:{} }, 'reel', 'score'), false);
});
run('energy scales with upgrades and difficulty', () => {
  ok(energyFor('hard') < energyFor('easy'));
  ok(energyFor('normal', { energy:2 }) > energyFor('normal'));
});

// ---- progression ----
run('XP levels grow monotonically', () => {
  ok(xpForLevel(2) > xpForLevel(1));
  const s = { xp:0, level:1 };
  grantXP(s, 500); ok(s.level > 1);
});
run('streak tracks consecutive days', () => {
  const s = { streak:{ count:0, last:'' } };
  touchStreak(s, new Date(2026,0,1)); eq(s.streak.count, 1);
  touchStreak(s, new Date(2026,0,2)); eq(s.streak.count, 2);
  touchStreak(s, new Date(2026,0,9)); eq(s.streak.count, 1);
});
run('achievements and collection persist', () => {
  const s = { achievements:{}, collection:{}, xp:0, level:1 };
  eq(unlock(s,'first-win'), true); eq(unlock(s,'first-win'), false);
  ok(prof(s).achievements.length === 1);
  addCollection(s, ['cherry','cherry','waterfall']);
  eq(s.collection.cherry, 2); eq(s.collection.waterfall, undefined);
});

// ---- storage ----
run('save defaults are versioned', () => eq(defaults().v, SAVE_VERSION));
run('v1 save migrates without losing best or sound', () => {
  const m = migrate({ best:{ classic:1200 }, sound:false, difficulty:'hard', runs:9 });
  eq(m.best.classic, 1200); eq(m.sound, false); eq(m.difficulty, 'hard'); eq(m.spins, 9);
  eq(m.v, SAVE_VERSION);
});
run('load/save roundtrip', () => {
  const s = defaults(); s.score = 5; save(s);
  eq(load().v, SAVE_VERSION);
});

// ---- state machine ----
function playing(mode = 'classic') {
  let s = initialState();
  s = reduce(s, { type:'START', mode, difficulty:'normal' });
  s.rng = seededRandom(42);
  return s;
}
run('START initialises run and meta state', () => {
  const s = playing();
  eq(s.phase, 'idle'); ok(s.run.energy > 0); eq(s.run.bet, 1); ok(s.save.streak.count >= 1);
});
run('SPIN spends energy and generates a grid', () => {
  const s = reduce(playing(), { type:'SPIN' });
  eq(s.phase, 'spinning'); eq(s.grid.length, s.run.reelCount); ok(s.run.energy < s.run.maxEnergy);
});
run('TICK resolves spin then returns to idle', () => {
  let s = reduce(playing(), { type:'SPIN' });
  for (let i=0;i<160;i++) s = reduce(s, { type:'TICK', dt:1/60 });
  eq(s.phase, 'idle'); ok(s.result); ok(s.run.spins === 1);
});
run('free spins do not consume energy', () => {
  let s = playing(); s.run.freeSpins = 2;
  const before = s.run.energy;
  s = reduce(s, { type:'SPIN' });
  eq(s.run.energy, before); eq(s.run.freeSpins, 1);
});
run('BET only changes while idle', () => {
  const s = playing();
  eq(reduce(s,{type:'BET',delta:2}).run.bet, 3);
  eq(reduce(reduce(s,{type:'SPIN'}),{type:'BET',delta:1}).run.bet, 1);
});
run('CASH banks points and ends the run', () => {
  let s = playing(); s.run.points = 100;
  s = reduce(s, { type:'CASH' });
  eq(s.phase, 'result'); ok(s.run.banked >= 85);
});
run('UPGRADE changes save, not the live wallet', () => {
  let s = playing(); s.score = 1000;
  s = reduce(s, { type:'UPGRADE', id:'reel' });
  eq(s.save.upgrades.reel, 1); eq(s.score, 0);
});
run('MENU clears the run', () => {
  const s = reduce(playing(), { type:'MENU' });
  eq(s.phase, 'menu'); eq(s.run, null);
});
run('runSummary reports sets and progress', () => {
  let s = playing(); s.run.collected = ['cherry','lemon'];
  const r = runSummary(s); eq(r.sets, 2); ok(r.progress > 0);
});
run('store subscribers receive actions', () => {
  const st = createStore(); let seen = 0;
  st.subscribe(() => seen++);
  st.dispatch({ type:'START' }); st.dispatch({ type:'SPIN' });
  ok(seen >= 2); eq(st.get().phase, 'spinning');
});
run('daily mode uses a deterministic RNG', () => {
  const a = playing('daily'), b = playing('daily');
  const ra = Array.from({length:5}, () => a.rng());
  const rb = Array.from({length:5}, () => b.rng());
  eq(ra.join(','), rb.join(','));
});

// ---- structure & content ----
run('all modules and new assets exist', () => {
  const files = ['config','rng','state','ui','audio','main','game'];
  files.forEach(n => ok(existsSync(join(ROOT,'js',n+'.js')), 'js/'+n+'.js'));
  ['systems/reels','systems/economy','systems/progression','systems/storage',
   'render/symbols','render/particles','render/renderer'].forEach(n =>
    ok(existsSync(join(ROOT,'js',n+'.js')), 'js/'+n+'.js'));
  const sw = readFileSync(join(ROOT,'sw.js'),'utf8');
  ok(sw.includes('slot-collect-v2'));
  ['js/state.js','js/systems/reels.js','js/render/renderer.js'].forEach(n => ok(sw.includes(n)));
});
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(STR.en.modes.daily && STR.it.modes.daily);
});
run('config has 8 symbols, 5 paylines and 5 upgrades', () => {
  eq(SYMBOLS.length, 8); eq(PAYLINES.length, 5); eq(UPGRADES.length, 5);
  eq(COLLECTIBLE.length, 6); ok(Object.keys(DIFFICULTY).length === 3);
});
run('HTML wires the custom shell', () => {
  const html = readFileSync(join(ROOT,'index.html'),'utf8');
  ok(html.includes('id="app"')); ok(html.includes('js/main.js'));
  ok(html.includes('manifest.webmanifest'));
});

summary(passed, total);
