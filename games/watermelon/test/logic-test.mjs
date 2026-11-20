import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { resolve, drop, emptyGrid, value, playColumn, setup } from '../js/game.js';
import { COLS, ROWS, LEVELS } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

run('grid has correct dimensions', () => {
  const g = emptyGrid();
  eq(g.length, ROWS); eq(g[0].length, COLS);
});
run('drop places fruit and respects full column', () => {
  const g = emptyGrid();
  eq(drop(g, 0, 1), ROWS - 1);
  for (let i = 0; i < ROWS; i++) drop(g, 0, 1);
  eq(drop(g, 0, 1), null);
});
run('two matching fruits merge', () => {
  const g = emptyGrid();
  g[ROWS - 1][0] = 1; g[ROWS - 1][1] = 1;
  const r = resolve(g);
  ok(r.merges >= 1);
  ok(g[ROWS - 1][0] === 2 || g[ROWS - 1][1] === 2);
});
run('non-matching fruits do not merge', () => {
  const g = emptyGrid();
  g[ROWS - 1][0] = 1; g[ROWS - 1][1] = 2;
  const r = resolve(g);
  eq(r.merges, 0);
});
run('gravity settles floating fruits', () => {
  const g = emptyGrid();
  g[0][2] = 3;
  resolve(g);
  eq(g[ROWS - 1][2], 3);
  eq(g[0][2], 0);
});
run('score grows with fruit level', () => { ok(value(4) > value(2)); });
run('five levels exist with rising targets', () => {
  eq(LEVELS.length, 5);
  ok(LEVELS[4].target > LEVELS[0].target);
});
run('playColumn spends a move and scores', () => {
  const fake = {
    status: 'playing', mode: 'limited', score: 0, combo: 0,
    view: { w: 400, h: 600 }, fx: { float() {}, burst() {}, blink() {} },
    t: k => k, addScore(n) { this.score += n; }, end(s) { this.status = s; }
  };
  setup(fake);
  playColumn(fake, 2);
  eq(fake.data.drops, 1);
  ok(fake.data.moves < LEVELS[0].moves);
});

summary(passed, total);
