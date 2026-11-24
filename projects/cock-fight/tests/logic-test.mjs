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

const engine = await import(join(ROOT, 'js/engine.js'));
const { seeded, dailySeed, pickWeighted } = await import(join(ROOT, 'js/rng.js'));
const storage = await import(join(ROOT, 'js/storage.js'));
const { STR, BREEDS, CHAMPIONSHIP, EQUIPMENT, STATS } = await import(join(ROOT, 'js/config.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, f) => cases.push([n, f]);

const bird = (o = {}) => ({ name: 'A', breed: 'rosso', level: 1, xp: 0, form: 1,
  stats: { attack: 10, defense: 10, speed: 10, stamina: 10, luck: 10 }, equipment: [], ...o });

// ---- engine ----
run('power grows with stats, level and equipment', () => {
  const base = engine.power(bird());
  ok(engine.power(bird({ level: 3 })) > base);
  ok(engine.power(bird({ equipment: ['spurs'] })) > base);
  ok(engine.power(bird({ stats: { attack: 20, defense: 20, speed: 20, stamina: 20, luck: 20 } })) > base);
});
run('stronger rooster has better win odds', () => {
  const weak = bird({ stats: { attack: 4, defense: 4, speed: 4, stamina: 4, luck: 4 } });
  const strong = bird({ stats: { attack: 18, defense: 18, speed: 18, stamina: 18, luck: 18 } });
  const o = engine.odds(strong, weak);
  ok(o.pA > o.pB); ok(o.oddsA < o.oddsB);
});
run('odds include house edge and stay in range', () => {
  const o = engine.odds(bird(), bird());
  ok(o.oddsA > 1 && o.oddsA < 2.1);
  ok(Math.abs(o.pA + o.pB - 1) < 1e-9);
});
run('opponent scales with championship round', () => {
  const a = engine.makeOpponent(0, seeded(1));
  const b = engine.makeOpponent(4, seeded(1));
  ok(engine.power(b) > engine.power(a));
  ok(CHAMPIONSHIP.length === 5);
});
run('simulateFight is deterministic with a seed', () => {
  const a = bird(), b = bird();
  const r1 = engine.deterministicFight(a, b, 12345);
  const r2 = engine.deterministicFight(a, b, 12345);
  eq(r1.winner, r2.winner);
  eq(r1.rounds, r2.rounds);
  eq(JSON.stringify(r1.log), JSON.stringify(r2.log));
});
run('simulateFight produces a winner and bounded rounds', () => {
  const r = engine.deterministicFight(bird(), bird(), 7);
  ok(r.winner === 'a' || r.winner === 'b');
  ok(r.rounds > 0 && r.rounds <= 12);
  ok(r.hpA === 0 || r.hpB === 0 || r.rounds === 12);
});
run('stepFight yields a result', () => {
  const s = engine.newFightState();
  const step = engine.stepFight(s, bird(), bird(), 'attack', 'good', seeded(3));
  ok(step.round === 1); ok(s.log.length === 1);
  ok(step.dmgA >= 0 && step.dmgB >= 0);
});
run('perfect quality deals more damage than miss', () => {
  let good = 0, miss = 0;
  for (let i = 0; i < 20; i++) {
    const s1 = engine.newFightState();
    good += engine.stepFight(s1, bird(), bird(), 'attack', 'perfect', seeded(i + 100)).dmgA;
    const s2 = engine.newFightState();
    miss += engine.stepFight(s2, bird(), bird(), 'attack', 'miss', seeded(i + 100)).dmgA;
  }
  ok(good > miss * 2);
});
run('settleBet pays only on correct outcome', () => {
  const quote = { oddsA: 1.8, oddsB: 2.2 };
  const win = engine.settleBet({ type: 'win', stake: 100 }, { winner: 'a', rounds: 5, perfects: 2 }, quote);
  ok(win.won); eq(win.payout, 180); eq(win.net, 80);
  const lose = engine.settleBet({ type: 'win', stake: 100 }, { winner: 'b', rounds: 5, perfects: 2 }, quote);
  ok(!lose.won); eq(lose.payout, 0); eq(lose.net, -100);
});
run('round and perfect markets settle', () => {
  const q = { oddsA: 1.8, oddsB: 2 };
  ok(engine.settleBet({ type: 'rounds', stake: 50, value: 4 }, { winner: 'a', rounds: 4, perfects: 1 }, q).won);
  ok(engine.settleBet({ type: 'perfect', stake: 50, value: 3 }, { winner: 'a', rounds: 6, perfects: 3 }, q).won);
});
run('train raises a stat and caps at 20', () => {
  const b = bird({ stats: { ...bird().stats, attack: 19 } });
  const t = engine.train(b, 'attack', () => 0.1);
  eq(t.stats.attack, 20);
  eq(engine.train(t, 'attack', () => 0.1).stats.attack, 20);
});
run('level curve increases', () => {
  ok(engine.levelInfo(100) > engine.levelInfo(0));
  ok(engine.xpNeeded(3) > engine.xpNeeded(1));
});

// ---- rng ----
run('RNG is deterministic and in range', () => {
  const a = seeded(42), b = seeded(42);
  for (let i = 0; i < 10; i++) { const x = a(), y = b(); eq(x, y); ok(x >= 0 && x < 1); }
});
run('daily seed is stable per date', () => {
  const d = new Date(2026, 0, 15);
  eq(dailySeed(d), dailySeed(new Date(2026, 0, 15)));
  ok(dailySeed(d) !== dailySeed(new Date(2026, 0, 16)));
});
run('weighted pick respects zero weights', () => {
  eq(pickWeighted([0, 1, 0], () => 0.5), 1);
});

// ---- storage ----
run('storage defaults and persistence', () => {
  store.clear();
  const p = storage.profile;
  eq(p.wallet, 500);
  p.wallet = 321;
  storage.save();
  storage.resetProfile();
  eq(storage.profile.wallet, 500);
});
run('addMoney never goes negative', () => {
  storage.resetProfile();
  storage.addMoney(-99999);
  eq(storage.profile.wallet, 0);
});

// ---- structure ----
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('game data is coherent', () => {
  eq(BREEDS.length, 5); eq(STATS.length, 5); eq(Object.keys(EQUIPMENT).length, 4);
  BREEDS.forEach(b => STATS.forEach(s => ok(b.stats[s] > 0)));
});
run('all modules and SW assets exist', () => {
  ['config','i18n','storage','rng','engine','render','audio','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  const listed = [...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]);
  ['index.html','manifest.webmanifest','css/app.css'].forEach(f => ok(listed.includes(f), f));
  ['config','i18n','storage','rng','engine','render','audio','ui','main'].forEach(n =>
    ok(listed.includes('js/' + n + '.js'), 'js/' + n + '.js'));
});
run('HTML has canonical, canvas and i18n shell attrs', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('id="arena"'));
  ok(html.includes('data-project-shell'));
  ok(html.includes('data-languages="en,it"'));
});
run('manifest icons are present', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(m.icons.length >= 2);
  ok(existsSync(join(ROOT, 'icons/icon-192.png')));
  ok(existsSync(join(ROOT, 'icons/icon-512.png')));
});

for (const [name, fn] of cases) { total++; if (test(name, fn)) passed++; }
summary(passed, total);
