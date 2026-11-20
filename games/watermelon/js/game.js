/* Watermelon Merge — pure grid merge logic */

import { COLS, ROWS, LEVELS, COLORS, FRUITS } from './config.js';
import { seededRandom, dailySeed } from '../../_kit/core.js';

export const emptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
export const value = level => level * level * 10;

export function resolve(grid) {
  let merges = 0, gained = 0;
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = ROWS - 1; r >= 0; r--) {
      for (let c = 0; c < COLS; c++) {
        const v = grid[r][c];
        if (!v) continue;
        const group = [[r, c]];
        const seen = new Set([`${r},${c}`]);
        for (let i = 0; i < group.length; i++) {
          const [gr, gc] = group[i];
          [[gr - 1, gc], [gr + 1, gc], [gr, gc - 1], [gr, gc + 1]].forEach(([nr, nc]) => {
            const k = `${nr},${nc}`;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !seen.has(k) && grid[nr][nc] === v) {
              seen.add(k); group.push([nr, nc]);
            }
          });
        }
        if (group.length >= 2) {
          const [br, bc] = group.reduce((a, b) => (a[0] >= b[0] ? a : b));
          group.forEach(([gr, gc]) => { grid[gr][gc] = 0; });
          grid[br][bc] = Math.min(FRUITS.length, v + 1);
          merges++;
          gained += value(v + 1);
          changed = true;
        }
      }
    }
  }
  // gravity
  for (let c = 0; c < COLS; c++) {
    const stack = [];
    for (let r = ROWS - 1; r >= 0; r--) if (grid[r][c]) stack.push(grid[r][c]);
    for (let r = ROWS - 1, i = 0; r >= 0; r--, i++) grid[r][c] = stack[i] || 0;
  }
  return { merges, gained };
}

export function drop(grid, col, level = 1) {
  if (col < 0 || col >= COLS) return null;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!grid[r][col]) {
      grid[r][col] = level;
      return r;
    }
  }
  return null;
}

export function setup(game) {
  const level = 0;
  const cfg = LEVELS[level];
  game.data = {
    grid: emptyGrid(), level, target: cfg.target,
    moves: game.mode === 'classic' ? 999 : cfg.moves,
    drops: 0, lastGain: 0,
    rng: game.mode === 'daily' ? seededRandom(dailySeed()) : Math.random
  };
  game.combo = 0;
}

export function playColumn(game, col) {
  const d = game.data;
  if (game.status !== 'playing' || d.moves <= 0) return;
  const row = drop(d.grid, col, 1 + (d.rng() < 0.12 ? 1 : 0));
  if (row === null) return;
  d.drops++;
  d.moves--;
  const result = resolve(d.grid);
  d.lastGain = result.gained;
  if (result.merges > 0) {
    game.combo += result.merges;
    game.addScore(result.gained * game.combo);
    game.fx.float(game.view.w / 2, 120, `+${result.gained * game.combo}`, '#ffd166');
    game.fx.burst(game.view.w / 2, game.view.h / 2, '#ffd166', 12 + result.merges * 4);
  } else {
    game.combo = 0;
  }
  if (game.score >= d.target) {
    if (d.level >= LEVELS.length - 1) game.end('victory');
    else {
      d.level++;
      const cfg = LEVELS[d.level];
      d.target = cfg.target;
      if (game.mode !== 'classic') d.moves += cfg.moves;
      game.data.grid = emptyGrid();
      game.fx.blink(0.3, '#5ef0a8');
    }
  } else if (d.moves <= 0) game.end('gameover');
}

export function update() {}
export function draw(ctx, game, view) {
  const { w, h } = view;
  ctx.fillStyle = '#0a0c22'; ctx.fillRect(0, 0, w, h);
  const cell = Math.min((w - 40) / COLS, (h - 130) / ROWS, 64);
  const gx = (w - cell * COLS) / 2, gy = 60;
  const d = game.data;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = gx + c * cell, y = gy + r * cell;
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
      const v = d.grid[r][c];
      if (v) {
        ctx.fillStyle = COLORS[Math.min(v - 1, COLORS.length - 1)];
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, cell * 0.36, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = `${cell * 0.36}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(FRUITS[Math.min(v - 1, FRUITS.length - 1)], x + cell / 2, y + cell / 2);
      }
    }
  }
  ctx.fillStyle = '#9fb3d9'; ctx.font = '800 12px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(`${game.t('level')} ${d.level + 1} · ${game.t('target')} ${d.target} · ${game.t('moves')} ${d.moves === 999 ? '∞' : d.moves}`, w / 2, 36);
}
export function onTap(game, x, y) {
  const cell = Math.min((game.view.w - 40) / COLS, (game.view.h - 130) / ROWS, 64);
  const gx = (game.view.w - cell * COLS) / 2;
  playColumn(game, Math.floor((x - gx) / cell));
}
export function onKey(game, code) {
  const n = Number(code.replace('Digit', ''));
  if (n >= 1 && n <= COLS) playColumn(game, n - 1);
}
export const api = { setup, update, draw, onTap, onKey, resolve, drop, emptyGrid, value, playColumn };
