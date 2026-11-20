/* Math Duel — question generation, AI rival and scoring */

import { CONFIG, ROUNDS } from './config.js';

export function generateQuestion(difficulty = 'normal', rng = Math.random) {
  const cfg = CONFIG[difficulty] || CONFIG.normal;
  const op = cfg.ops[Math.floor(rng() * cfg.ops.length)];
  let a = 1 + Math.floor(rng() * cfg.max);
  let b = 1 + Math.floor(rng() * cfg.max);
  let answer, text;
  if (op === '+') { answer = a + b; text = `${a} + ${b}`; }
  else if (op === '-') { if (b > a) [a, b] = [b, a]; answer = a - b; text = `${a} − ${b}`; }
  else if (op === '×') { answer = a * b; text = `${a} × ${b}`; }
  else { b = Math.max(1, b); answer = a; a = answer * b; text = `${a} ÷ ${b}`; }
  return { text, answer, op };
}

export function setup(game) {
  const cfg = CONFIG[game.difficulty] || CONFIG.normal;
  game.data = {
    question: generateQuestion(game.difficulty),
    time: cfg.seconds, maxTime: cfg.seconds,
    round: 1, target: ROUNDS[game.mode] || 10,
    rivalScore: 0, rivalTime: cfg.seconds * (1.3 - cfg.rival * 0.6),
    rivalClock: 0, correct: 0, wrong: 0, bestStreak: 0
  };
  game.combo = 0;
}

export function answer(game, value) {
  const d = game.data;
  if (game.status !== 'playing') return false;
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return false;
  const right = numeric === d.question.answer;
  if (right) {
    d.correct++;
    game.combo++;
    d.bestStreak = Math.max(d.bestStreak, game.combo);
    game.addScore(100 * game.combo);
    game.fx.float(game.view.w / 2, 120, '+' + 100 * game.combo, '#5ef0a8');
    game.fx.burst(game.view.w / 2, game.view.h / 2, '#5ef0a8', 12);
  } else {
    d.wrong++;
    game.combo = 0;
    game.fx.hit(8);
    game.fx.blink(0.2, '#ff6b9d');
  }
  nextQuestion(game);
  return right;
}

export function nextQuestion(game) {
  const d = game.data;
  d.round++;
  d.question = generateQuestion(game.difficulty);
  const cfg = CONFIG[game.difficulty] || CONFIG.normal;
  d.time = d.maxTime = cfg.seconds;
  d.rivalClock = 0;
  if (d.round > d.target) {
    if (game.mode === 'duel' && d.rivalScore > game.score) game.end('gameover');
    else game.end('victory');
  }
}

export function update(dt, game) {
  const d = game.data;
  if (game.status !== 'playing') return;
  d.time -= dt;
  d.rivalClock += dt;
  if (d.rivalClock >= d.rivalTime) {
    d.rivalClock = 0;
    d.rivalScore += 100;
    if (game.mode === 'duel' && d.rivalScore >= d.target * 100) { game.end('gameover'); return; }
  }
  if (d.time <= 0) {
    d.wrong++;
    game.combo = 0;
    game.fx.hit(6);
    nextQuestion(game);
  }
}

export function draw(ctx, game, view) {
  const { w, h } = view;
  ctx.fillStyle = '#080e26'; ctx.fillRect(0, 0, w, h);
  const d = game.data;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2f5ff';
  ctx.font = '900 46px ui-monospace, monospace';
  ctx.fillText(d.question.text, w / 2, h * 0.32);
  ctx.fillStyle = '#ffd166';
  ctx.font = '900 28px ui-monospace, monospace';
  ctx.fillText(d.input || '', w / 2, h * 0.42);
  ctx.font = '800 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#9fb3d9';
  ctx.fillText(`${game.t('round')} ${d.round}/${d.target} · ${game.t('rival')} ${d.rivalScore}`, w / 2, h * 0.42);
  const pct = Math.max(0, d.time / d.maxTime);
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.fillRect(w * 0.2, h * 0.5, w * 0.6, 10);
  ctx.fillStyle = pct > 0.4 ? '#5ef0a8' : '#ff6b9d';
  ctx.fillRect(w * 0.2, h * 0.5, w * 0.6 * pct, 10);
  ctx.font = '800 12px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(159,179,217,.8)';
  ctx.fillText('1 2 3 4 5 6 7 8 9 0 · BACKSPACE', w / 2, h - 18);
}

export function onKey(game, code) {
  const d = game.data;
  if (!d) return;
  if (/^Digit\d$/.test(code) || /^Numpad\d$/.test(code)) {
    d.input = (d.input || '') + code.slice(-1);
  } else if (code === 'Backspace') d.input = (d.input || '').slice(0, -1);
  else if (code === 'Enter' || code === 'Space') { answer(game, d.input || 0); d.input = ''; }
}

export function onTap(game, x, y) {
  const { w, h } = game.view;
  if (y > h * 0.75) {
    const d = game.data;
    d.input = (d.input || '').slice(0, -1);
  } else answer(game, Math.max(1, Math.round((x / w) * 20)));
}

export const api = { setup, update, draw, onTap, onKey, generateQuestion, answer, nextQuestion };
