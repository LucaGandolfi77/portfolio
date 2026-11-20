import { test, eq, ok, summary } from '../../test-harness.js';
import { Engine } from '../js/engine.js';
import { RULES } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

globalThis.window = { addEventListener() {} };

run('start resets and plays', () => {
  const e = new Engine();
  e.start();
  eq(e.status, 'playing');
  eq(e.score, 0);
  eq(e.lives, RULES.startLives);
});

run('hit adds points', () => {
  const e = new Engine();
  e.start();
  e.hit();
  eq(e.score, RULES.pointsPerHit);
});

run('damage ends game', () => {
  const e = new Engine();
  e.start();
  for (let i = 0; i < RULES.startLives; i++) e.damage();
  eq(e.status, 'gameover');
  ok(e.lives <= 0);
});

summary(passed, total);
