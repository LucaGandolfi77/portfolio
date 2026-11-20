import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { rollDice, scoreRoll } from '../js/game.js';
import { TARGET, MODES } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

run('dice are always in 1..6', () => {
  for (let i = 0; i < 200; i++) {
    const [a, b] = rollDice();
    ok(a >= 1 && a <= 6 && b >= 1 && b <= 6);
  }
});
run('seven is a bust', () => { const r = scoreRoll(3, 4); eq(r.bust, true); eq(r.points, 0); });
run('doubles score double the sum', () => { eq(scoreRoll(5, 5).points, 20); ok(scoreRoll(2, 2).double); });
run('snake eyes and boxcars score 10', () => { eq(scoreRoll(1, 1).points, 10); eq(scoreRoll(6, 6).points, 10); });
run('normal sum scores the sum', () => { eq(scoreRoll(2, 3).points, 5); });
run('three modes exist', () => { eq(MODES.length, 3); });
run('difficulty targets increase', () => { ok(TARGET.hard > TARGET.normal && TARGET.normal > TARGET.easy); });

summary(passed, total);
