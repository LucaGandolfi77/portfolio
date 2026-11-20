import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { spin, payout, setup, doSpin, buyUpgrade } from '../js/game.js';
import { SYMBOLS, PAYOUT, GOAL } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

const fake = (mode = 'classic', difficulty = 'normal') => ({
  status: 'playing', mode, difficulty, score: 0, combo: 0,
  view: { w: 400, h: 600 },
  fx: { float() {}, burst() {}, blink() {} },
  t: k => k, addScore(n) { this.score += n; }, end(s) { this.status = s; }
});

run('spin returns requested reel count in range', () => {
  const r = spin(5, () => 0.5);
  eq(r.length, 5);
  ok(r.every(v => v >= 0 && v < SYMBOLS.length));
});
run('three of a kind pays triple', () => {
  const p = payout([2, 2, 2]);
  eq(p.total, PAYOUT[2] * 2 * 3);
  eq(p.matches.length, 1);
});
run('no match pays nothing', () => { eq(payout([0, 1, 2]).total, 0); });
run('two of a kind pays', () => { ok(payout([4, 4, 0]).total > 0); });
run('setup initialises energy and collection', () => {
  const g = fake(); setup(g);
  eq(g.data.energy, 20);
  eq(g.data.collected.length, SYMBOLS.length);
  eq(g.data.goal, GOAL.normal);
});
run('spin spends energy and records symbols', () => {
  const g = fake(); setup(g);
  doSpin(g);
  eq(g.data.energy, 19);
  ok(g.data.collected.some(n => n > 0));
});
run('upgrade costs score and adds a reel', () => {
  const g = fake(); setup(g); g.score = 500;
  eq(buyUpgrade(g), true);
  eq(g.data.reels, 4);
  ok(g.score < 500);
});
run('game ends when energy is exhausted', () => {
  const g = fake(); setup(g); g.data.energy = 1;
  doSpin(g);
  eq(g.status, 'gameover');
});

summary(passed, total);
