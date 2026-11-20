/* Slot Collect — spin, payout and collection logic */

import { SYMBOLS, SYMBOL_NAMES, PAYOUT, GOAL } from './config.js';
import { seededRandom, dailySeed } from '../../_kit/core.js';

export function spin(reels, rng = Math.random) {
  return Array.from({ length: reels }, () => Math.floor(rng() * SYMBOLS.length));
}

export function payout(result, bet = 1) {
  const counts = {};
  result.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  let total = 0;
  const matches = [];
  for (const [k, n] of Object.entries(counts)) {
    if (n >= 2) {
      total += PAYOUT[+k] * (n - 1) * bet;
      matches.push({ symbol: +k, count: n });
    }
  }
  if (result.length >= 3 && result.every(v => v === result[0])) total *= 3;
  return { total, matches };
}

export function setup(game) {
  const goal = GOAL[game.difficulty] || GOAL.normal;
  game.data = {
    reels: 3, energy: game.mode === 'endless' ? 999 : 20,
    collected: Array(SYMBOLS.length).fill(0), goal,
    bet: 1, last: [], message: '',
    rng: game.mode === 'collection' && game.difficulty === 'hard' ? seededRandom(dailySeed()) : Math.random
  };
  game.combo = 0;
}

export function doSpin(game) {
  const d = game.data;
  if (game.status !== 'playing' || d.energy <= 0) return;
  d.energy -= d.bet;
  d.last = spin(d.reels, d.rng);
  const res = payout(d.last, d.bet);
  d.message = res.matches.length ? res.matches.map(m => `${SYMBOLS[m.symbol]}×${m.count}`).join(' ') : '—';
  if (res.total > 0) {
    game.combo++;
    game.addScore(res.total * game.combo);
    game.fx.float(game.view.w / 2, 120, '+' + res.total * game.combo, '#ffd166');
    game.fx.burst(game.view.w / 2, game.view.h / 2, '#ffd166', 10 + res.total);
  } else {
    game.combo = 0;
  }
  d.last.forEach(v => { d.collected[v]++; });
  const sets = d.collected.filter(n => n >= 5).length;
  if (sets >= d.goal) game.end('victory');
  else if (d.energy <= 0) game.end('gameover');
}

export function buyUpgrade(game) {
  const d = game.data;
  if (game.score < 200 || d.reels >= 5) return false;
  game.score -= 200;
  d.reels++;
  d.bet = Math.min(3, d.bet + 1);
  return true;
}

export function update() {}
export function draw(ctx, game, view) {
  const { w, h } = view;
  ctx.fillStyle = '#0b0820'; ctx.fillRect(0, 0, w, h);
  const d = game.data;
  ctx.textAlign = 'center';
  ctx.font = '900 46px serif';
  d.last.forEach((v, i) => {
    const x = w / 2 + (i - (d.last.length - 1) / 2) * 76;
    ctx.fillStyle = i % 2 ? '#1a1640' : '#141034';
    ctx.fillRect(x - 34, h * 0.32, 68, 76);
    ctx.fillText(SYMBOLS[v], x, h * 0.32 + 56);
  });
  ctx.font = '800 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText(d.message || game.t('spin'), w / 2, h * 0.5);
  ctx.fillStyle = '#9fb3d9';
  ctx.fillText(`${game.t('energy')} ${d.energy} · ${game.t('sets')} ${d.collected.filter(n => n >= 5).length}/${d.goal}`, w / 2, h * 0.58);
  ctx.font = '24px serif';
  ctx.fillText(SYMBOL_NAMES.map((n, i) => `${SYMBOLS[i]}${d.collected[i]}`).join('  '), w / 2, h * 0.72);
  ctx.font = '700 11px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(159,179,217,.7)';
  ctx.fillText('SPACE / TAP = spin · U = upgrade', w / 2, h - 18);
}
export function onTap(game) { doSpin(game); }
export function onKey(game, code) {
  if (code === 'Space' || code === 'Enter') doSpin(game);
  if (code === 'KeyU') buyUpgrade(game);
}
export const api = { setup, update, draw, onTap, onKey, spin, payout, doSpin, buyUpgrade };
