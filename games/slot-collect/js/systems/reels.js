/* Slot Collect — reel generation and payline evaluation (pure) */

import { SYMBOLS, COLLECTIBLE, PAYLINES, MAX_BET, FREE_SPINS, SCATTER_MIN } from '../config.js';
import { pickWeighted } from '../rng.js';

export const WILD = SYMBOLS.findIndex(s => s.wild);
export const SCATTER = SYMBOLS.findIndex(s => s.scatter);

export function symbolWeights(luck = 0, odds = 1) {
  return SYMBOLS.map((s, i) => {
    if (s.wild || s.scatter) return s.weight;
    const rare = i >= 4 ? 1 + luck * 0.18 : 1;
    const common = i <= 1 ? 1 + Math.max(0, 1 - odds) * 0.25 : 1;
    return Math.max(1, Math.round(s.weight * rare * common * odds));
  });
}

export function drawSymbol(rng, luck = 0, odds = 1) {
  const weights = symbolWeights(luck, odds);
  let r = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r < 0) return i;
  }
  return 0;
}

/* colonna = array di righe; la griglia è [reel][row] */
export function generateGrid({ reels, rng, luck = 0, odds = 1 }) {
  return Array.from({ length: reels }, () =>
    Array.from({ length: 3 }, () => drawSymbol(rng, luck, odds)));
}

export function evaluate(grid, { reels = grid.length, bet = 1, luck = 0 } = {}) {
  const lines = [];
  const clampedBet = Math.min(MAX_BET, Math.max(1, bet));
  for (let li = 0; li < PAYLINES.length; li++) {
    const rows = PAYLINES[li].slice(0, reels);
    let target = null, count = 0, wildUsed = false;
    for (let j = 0; j < rows.length; j++) {
      const idx = grid[j]?.[rows[j]];
      if (idx === undefined || idx === SCATTER) break;
      if (idx === WILD) { count++; wildUsed = true; continue; }
      if (target === null) target = idx;
      if (idx !== target) break;
      count++;
    }
    if (target === null || count < 2) continue;
    const base = SYMBOLS[target]?.pay?.[Math.min(count, 6)] || 0;
    const win = Math.round(base * clampedBet * (1 + luck * 0.05));
    if (win > 0) lines.push({ line: li, symbol: target, count, win, wildUsed,
      cells: rows.slice(0, count).map((row, j) => ({ reel: j, row })) });
  }
  const scatters = grid.flat().filter(v => v === SCATTER).length;
  return {
    lines,
    total: lines.reduce((n, l) => n + l.win, 0),
    scatters,
    freeSpins: scatters >= SCATTER_MIN ? FREE_SPINS : 0,
    collected: grid.flat().filter(v => COLLECTIBLE.includes(SYMBOLS[v]?.id)),
    bestSymbol: lines.reduce((best, l) => l.win > (best?.win || 0) ? l : best, null)
  };
}

export function gridSymbols(grid) {
  return grid.map(col => col.map(i => SYMBOLS[i]?.glyph || '?'));
}
