/* Aviator Pro — crash timing, missions and survival */

import { CRASH_RATE, GROWTH, TARGET } from './config.js';

export function crashMultiplier(rate, rng = Math.random) {
  return 1.15 + Math.pow(rng(), 1.6) * (1 / rate) * 0.16;
}

export function setup(game) {
  game.data = {
    multiplier: 1, crashAt: crashMultiplier(CRASH_RATE[game.difficulty] || CRASH_RATE.normal),
    round: 1, banked: 0, outcome: '', flying: true,
    target: TARGET[game.difficulty] || TARGET.normal,
    missions: [false, false, false], survived: 0
  };
  game.combo = 0;
}

export function tick(dt, game) {
  const d = game.data;
  if (game.status !== 'playing' || !d.flying) return;
  d.multiplier += GROWTH * dt;
  if (d.multiplier >= d.crashAt) crash(game);
}

export function cashout(game) {
  const d = game.data;
  if (game.status !== 'playing' || !d.flying) return;
  d.flying = false;
  const gain = Math.round(d.multiplier * 10);
  d.banked += gain;
  game.addScore(gain);
  game.combo++;
  d.outcome = `CASH ×${d.multiplier.toFixed(2)}`;
  game.fx.float(game.view.w / 2, 140, '+' + gain, '#5ef0a8');
  game.fx.burst(game.view.w / 2, game.view.h / 2, '#5ef0a8', 16);
  if (d.multiplier >= 2) d.missions[0] = true;
  if (d.multiplier >= 5) d.missions[1] = true;
  nextRound(game);
}

export function crash(game) {
  const d = game.data;
  if (!d.flying) return;
  d.flying = false;
  d.outcome = 'CRASH ×' + d.multiplier.toFixed(2);
  game.combo = 0;
  game.fx.hit(16);
  game.fx.blink(0.4, '#ff6b9d');
  game.fx.burst(game.view.w / 2, game.view.h / 2, '#ff6b9d', 24, 6);
  if (game.mode === 'survival') game.end('gameover');
  else nextRound(game);
}

export function nextRound(game) {
  const d = game.data;
  d.round++;
  d.survived++;
  if (d.survived >= 5) d.missions[2] = true;
  if (game.mode === 'classic' && d.banked >= d.target * 100) { game.end('victory'); return; }
  if (game.mode === 'mission' && d.missions.every(Boolean)) { game.end('victory'); return; }
  if (game.mode === 'survival' && d.round > 8) { game.end('victory'); return; }
  d.multiplier = 1;
  d.crashAt = crashMultiplier(CRASH_RATE[game.difficulty] || CRASH_RATE.normal);
  d.flying = true;
  d.outcome = '';
}

export function update(dt, game) { tick(dt, game); }

export function draw(ctx, game, view, t) {
  const { w, h } = view;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0a1740'); g.addColorStop(1, '#3a1238');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const d = game.data;
  const m = d.multiplier;
  ctx.textAlign = 'center';
  ctx.fillStyle = d.flying ? '#5ef0a8' : '#ff6b9d';
  ctx.font = '900 52px ui-monospace, monospace';
  ctx.fillText('×' + m.toFixed(2), w / 2, h * 0.3);
  ctx.font = '800 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#9fb3d9';
  ctx.fillText(d.outcome || `${game.t('round')} ${d.round}`, w / 2, h * 0.39);

  // plane
  const px = w / 2 + Math.sin(t * 2) * 8;
  const py = h * 0.55 - Math.min(60, m * 6);
  ctx.fillStyle = '#dff7ff';
  ctx.shadowColor = '#4de8ff'; ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(px + 24, py); ctx.lineTo(px - 16, py - 10); ctx.lineTo(px - 16, py + 10);
  ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,209,102,.35)';
  ctx.setLineDash([5, 6]);
  ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '700 11px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(159,179,217,.8)';
  ctx.fillText('TAP / SPACE = ' + game.t('cashout'), w / 2, h - 20);
}
export function onTap(game) { cashout(game); }
export function onKey(game, code) { if (code === 'Space' || code === 'Enter') cashout(game); }
export const api = { setup, update, draw, onTap, onKey, crashMultiplier, cashout, crash, nextRound, tick };
