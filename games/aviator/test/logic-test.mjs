import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { crashMultiplier, setup, tick, cashout, crash, nextRound } from '../js/game.js';
import { CRASH_RATE, GROWTH, TARGET } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

const fake = (mode = 'classic', difficulty = 'normal') => ({
  status: 'playing', mode, difficulty, score: 0, combo: 0,
  view: { w: 400, h: 600 },
  fx: { float() {}, burst() {}, hit() {}, blink() {} },
  t: k => k, addScore(n) { this.score += n; }, end(s) { this.status = s; }
});

run('crash multiplier is always above 1', () => {
  for (let i = 0; i < 100; i++) ok(crashMultiplier(CRASH_RATE.normal, Math.random) > 1);
});
run('higher difficulty crashes earlier on average', () => {
  let easy = 0, hard = 0;
  for (let i = 0; i < 500; i++) { easy += crashMultiplier(CRASH_RATE.easy); hard += crashMultiplier(CRASH_RATE.hard); }
  ok(easy / 500 > hard / 500);
});
run('setup creates a fresh round', () => {
  const g = fake(); setup(g);
  eq(g.data.multiplier, 1); ok(g.data.flying);
  eq(g.data.round, 1);
});
run('tick grows multiplier', () => {
  const g = fake(); setup(g);
  g.data.crashAt = 99;
  const m = g.data.multiplier;
  tick(0.5, g);
  ok(g.data.multiplier > m);
});
run('cashout scores and advances round', () => {
  const g = fake(); setup(g);
  g.data.multiplier = 3;
  cashout(g);
  ok(g.score > 0);
  eq(g.data.round, 2);
  ok(g.data.flying);
});
run('crash resets combo and advances in classic', () => {
  const g = fake(); setup(g); g.combo = 4;
  g.data.multiplier = g.data.crashAt;
  crash(g);
  eq(g.combo, 0);
  eq(g.data.round, 2);
});
run('survival mode ends on crash', () => {
  const g = fake('survival'); setup(g);
  crash(g);
  eq(g.status, 'gameover');
});
run('mission mode ends when all missions complete', () => {
  const g = fake('mission'); setup(g);
  g.data.missions = [true, true, true];
  nextRound(g);
  eq(g.status, 'victory');
});
run('difficulty targets rise', () => { ok(TARGET.hard > TARGET.normal && TARGET.normal > TARGET.easy); });

summary(passed, total);
