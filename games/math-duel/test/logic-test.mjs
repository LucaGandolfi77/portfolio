import { test, eq, ok, summary } from '../../_kit/test-harness.js';
import { generateQuestion, setup, answer, update, nextQuestion } from '../js/game.js';
import { CONFIG, ROUNDS } from '../js/config.js';

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

const fake = (mode = 'sprint', difficulty = 'normal') => ({
  status: 'playing', mode, difficulty, score: 0, combo: 0,
  view: { w: 400, h: 600 },
  fx: { float() {}, burst() {}, hit() {}, blink() {} },
  t: k => k, addScore(n) { this.score += n; }, end(s) { this.status = s; }
});

run('question has text and integer answer', () => {
  for (let i = 0; i < 100; i++) {
    const q = generateQuestion('hard');
    ok(q.text && Number.isFinite(q.answer));
  }
});
run('easy mode uses only + and -', () => {
  for (let i = 0; i < 100; i++) ok(['+', '-'].includes(generateQuestion('easy').op));
});
run('hard mode includes all operations', () => {
  const ops = new Set();
  for (let i = 0; i < 300; i++) ops.add(generateQuestion('hard').op);
  eq(ops.size, 4);
});
run('correct answer increases score and combo', () => {
  const g = fake(); setup(g);
  const a = g.data.question.answer;
  eq(answer(g, a), true);
  ok(g.score > 0); eq(g.combo, 1);
});
run('wrong answer resets combo', () => {
  const g = fake(); setup(g);
  answer(g, g.data.question.answer);
  answer(g, g.data.question.answer + 7);
  eq(g.combo, 0);
});
run('timer expiry advances round', () => {
  const g = fake(); setup(g);
  const r = g.data.round;
  update(99, g);
  ok(g.data.round > r);
});
run('duel AI accumulates rival score', () => {
  const g = fake('duel', 'hard'); setup(g);
  update(g.data.rivalTime + 0.1, g);
  ok(g.data.rivalScore > 0);
});
run('round limits are configured', () => {
  ok(ROUNDS.sprint < ROUNDS.survival);
  ok(CONFIG.hard.rival > CONFIG.easy.rival);
});
run('finishing sprint wins', () => {
  const g = fake('sprint'); setup(g);
  g.data.round = g.data.target + 1;
  nextQuestion(g);
  eq(g.status, 'victory');
});

summary(passed, total);
