import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { setup, jump, dash, attack, update } from '../js/game.js';
import { STAGES } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

const fake = (mode = 'classic', difficulty = 'normal') => ({
  status: 'playing', mode, difficulty, score: 0, combo: 0,
  view: { w: 400, h: 600 },
  fx: { burst() {}, hit() {}, blink() {}, float() {} },
  t: k => k, addScore(n) { this.score += n; }, end(s) { this.status = s; }
});

run('five stages with rising speed', () => {
  eq(STAGES.length, 5);
  ok(STAGES[4].speed > STAGES[0].speed);
});
run('setup starts grounded at stage 0', () => {
  const g = fake(); setup(g);
  eq(g.data.stage, 0); ok(g.data.grounded); eq(g.data.y, 0);
});
run('jump sets upward velocity', () => {
  const g = fake(); setup(g); jump(g);
  ok(g.data.vy < 0); ok(!g.data.grounded);
});
run('cannot double jump', () => {
  const g = fake(); setup(g); jump(g);
  const v = g.data.vy; jump(g);
  eq(g.data.vy, v);
});
run('dash has cooldown', () => {
  const g = fake(); setup(g); dash(g);
  ok(g.data.dashCooldown > 0);
  const c = g.data.dashCooldown; dash(g);
  eq(g.data.dashCooldown, c);
});
run('update moves runner and accumulates distance', () => {
  const g = fake(); setup(g);
  update(0.2, g);
  ok(g.data.distance > 0);
  ok(g.score > 0);
});
run('attack damages boss', () => {
  const g = fake(); setup(g);
  g.data.boss = { hp: 3, maxHp: 3, x: 300 };
  attack(g);
  eq(g.data.boss.hp, 2);
});
run('gravity brings runner back to floor', () => {
  const g = fake(); setup(g); jump(g);
  for (let i = 0; i < 120; i++) update(0.01, g);
  eq(g.data.y, 0); ok(g.data.grounded);
});

summary(passed, total);
