/* Tokyo Dice — game logic + render hooks */

import { TARGET, STR } from './config.js';
import { clamp } from '../../_kit/core.js';

const label = key => STR.en[key] || key;

export function rollDice(rng = Math.random) {
  return [1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 6)];
}

export function scoreRoll(a, b) {
  const sum = a + b;
  if (sum === 7) return { points: 0, bust: true };
  if (sum === 2 || sum === 12) return { points: 10, big: true };
  if (a === b) return { points: sum * 2, double: true };
  return { points: sum };
}

export function setup(game) {
  const diff = TARGET[game.difficulty] || TARGET.normal;
  game.data = {
    phase: 'roll', turnScore: 0, score: 0, rival: 0, turn: 1,
    target: game.mode === 'survival' ? 100 : diff,
    rolls: 0, doubles: 0, banks: 0, maxBank: 0, survived: 0,
    last: null, message: '', missions: [false, false, false],
    rolling: 0
  };
  game.combo = 0;
}

export function roll(game) {
  const d = game.data;
  if (game.status !== 'playing' || d.phase !== 'roll') return;
  const dice = rollDice();
  const result = scoreRoll(dice[0], dice[1]);
  d.rolling = 1;
  d.last = { dice, ...result };
  d.rolls++;
  if (result.double) { d.doubles++; d.missions[0] = true; }

  if (result.bust) {
    d.turnScore = 0;
    d.message = game.t('bust');
    game.combo = 0;
    game.fx.burst(200, 160, '#ff6b9d', 18, 5);
    game.fx.hit(8);
    d.phase = 'bank';
    return;
  }
  d.turnScore += result.points;
  game.combo++;
  game.addScore(result.points);
  game.fx.float(220, 150, '+' + result.points, '#ffd166');
  game.fx.burst(220, 160, result.double ? '#ffd166' : '#4de8ff', 10);
  d.message = result.double ? game.t('double') : `${dice[0]} + ${dice[1]} = ${result.points}`;
  d.phase = 'roll';
  if (game.mode === 'streak' && d.turnScore >= d.target) bank(game);
}

export function bank(game) {
  const d = game.data;
  if (game.status !== 'playing' || d.turnScore <= 0) return;
  d.score += d.turnScore;
  d.banks++;
  d.maxBank = Math.max(d.maxBank, d.turnScore);
  if (d.turnScore >= 15) d.missions[1] = true;
  d.survived++;
  if (d.survived >= 3) d.missions[2] = true;
  d.message = game.t('bank') + ' +' + d.turnScore;
  game.fx.float(220, 110, '+' + d.turnScore, '#5ef0a8');
  d.turnScore = 0;
  d.turn++;
  if (d.survived >= 3 && game.mode === 'survival') {
    game.end('victory');
    return;
  }
  if (game.mode === 'classic') {
    const aggression = { easy: 0.3, normal: 0.55, hard: 0.8 }[game.difficulty] || 0.55;
    const aiGain = Math.round((6 + Math.random() * 12) * aggression);
    d.rival += aiGain;
    if (d.rival >= d.target) { game.end('gameover'); return; }
    if (d.score >= d.target) { game.end('victory'); return; }
  }
  if (game.mode === 'streak' && d.score >= d.target) game.end('victory');
}

export function update(dt, game) {
  const d = game.data;
  if (d.rolling > 0) d.rolling = Math.max(0, d.rolling - dt * 5);
}

export function draw(ctx, game, view, t) {
  const { w, h } = view;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0a0b2e'); g.addColorStop(1, '#2a1040');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = '900 30px Inter, system-ui, sans-serif';
  ctx.fillText(game.data.last?.dice?.join(' + ') || '· ·', w / 2, h * 0.32);
  ctx.fillStyle = '#f2f5ff';
  ctx.font = '800 15px Inter, system-ui, sans-serif';
  ctx.fillText(game.data.message || game.t('roll'), w / 2, h * 0.42);

  const d = game.data;
  ctx.font = '800 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#4de8ff';
  ctx.fillText(`${game.t('turn')} ${d.turn} · ${game.t('roll')} ${d.turnScore}`, w / 2, h * 0.56);
  ctx.fillStyle = '#9fb3d9';
  ctx.fillText(`${game.t('target')} ${d.target}${game.mode === 'classic' ? ` · ${game.t('rival')} ${d.rival}` : ''}`, w / 2, h * 0.63);

  // missions
  ctx.font = '700 11px Inter, system-ui, sans-serif';
  (STR.en.missions || []).forEach((m, i) => {
    ctx.fillStyle = d.missions[i] ? '#5ef0a8' : 'rgba(159,179,217,.6)';
    ctx.fillText(`${d.missions[i] ? '✓' : '○'} ${game.t('missions')[i]}`, w / 2, h * 0.74 + i * 18);
  });

  // control zones
  ctx.fillStyle = 'rgba(77,232,255,.06)';
  ctx.fillRect(0, h - 52, w / 2, 52);
  ctx.fillStyle = 'rgba(255,107,157,.07)';
  ctx.fillRect(w / 2, h - 52, w / 2, 52);
  ctx.font = '900 12px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#4de8ff'; ctx.fillText(game.t('roll'), w / 4, h - 20);
  ctx.fillStyle = '#ff6b9d'; ctx.fillText(game.t('bank'), w * 0.75, h - 20);
}

export function onTap(game, x, y) {
  const w = game.view.w;
  if (game.status !== 'playing') return;
  if (x < w / 2) roll(game); else bank(game);
}

export function onKey(game, code) {
  if (code === 'Space' || code === 'ArrowUp') roll(game);
  if (code === 'KeyB' || code === 'Enter') bank(game);
}

export const api = { setup, update, draw, onTap, onKey, rollDice, scoreRoll };
