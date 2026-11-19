/* Card Collector — 5x5 slot machine with persistent bets and payouts */

import { SLOT_SYMBOLS, CARDS } from './data.js';
import { state, commit, addCard } from './state.js';
import { spend, addXP, progressQuest } from './economy.js';
import { toast, celebrate } from './effects.js';

let gridEl = null;
let spinning = false;

function randomSymbol() {
  const total = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * total;
  for (const sym of SLOT_SYMBOLS) {
    roll -= sym.weight;
    if (roll <= 0) return sym;
  }
  return SLOT_SYMBOLS[0];
}

export function initSlot(container) {
  gridEl = container;
  if (!gridEl) return;
  gridEl.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const cell = document.createElement('div');
    cell.className = 'slot-cell';
    cell.textContent = '❓';
    gridEl.appendChild(cell);
  }
}

export function adjustBet(delta) {
  if (spinning) return state.data.slotBet;
  state.data.slotBet = Math.max(100, Math.min(10000, state.data.slotBet + delta));
  commit();
  return state.data.slotBet;
}

export function evaluate(grid, bet) {
  let totalWin = 0;
  let lines = 0;
  const winCells = new Set();
  for (let row = 0; row < 5; row++) {
    let chain = 1;
    let match = grid[row * 5];
    for (let col = 1; col < 5; col++) {
      const sym = grid[row * 5 + col];
      if (match.id === 'wild') {
        if (sym.id !== 'wild') match = sym;
        chain++;
      } else if (sym.id === match.id || sym.id === 'wild') {
        chain++;
      } else break;
    }
    if (chain >= 3) {
      const payout = chain === 3 ? bet * match.value * 0.5 : chain === 4 ? bet * match.value * 2 : bet * match.value * 10;
      totalWin += payout;
      lines++;
      for (let i = 0; i < chain; i++) winCells.add(row * 5 + i);
    }
  }
  return { totalWin: Math.floor(totalWin), lines, winCells };
}

export async function spin(onResult = () => {}) {
  if (spinning) return;
  const bet = state.data.slotBet;
  if (!spend('gold', bet)) { onResult({ error: 'notEnough' }); return; }
  commit();

  spinning = true;
  const cells = gridEl ? Array.from(gridEl.children) : [];
  cells.forEach(c => c.classList.remove('win', 'spinning'));

  const resultGrid = Array.from({ length: 25 }, randomSymbol);
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) cells[row * 5 + col]?.classList.add('spinning');
    await new Promise(r => setTimeout(r, 180));
    for (let row = 0; row < 5; row++) {
      const cell = cells[row * 5 + col];
      if (!cell) continue;
      cell.classList.remove('spinning');
      cell.textContent = resultGrid[row * 5 + col].char;
    }
  }

  const outcome = evaluate(resultGrid, bet);
  state.data.stats.spins++;
  progressQuest('spins', 1);

  let card = null;
  if (outcome.totalWin > 0) {
    state.data.gold = Math.min(99999, state.data.gold + outcome.totalWin);
    state.data.stats.slotWins++;
    addXP(Math.floor(outcome.totalWin / 10), true);
    outcome.winCells.forEach(i => cells[i]?.classList.add('win'));
    if (outcome.totalWin >= bet * 10 && Math.random() < 0.12) {
      card = CARDS[Math.floor(Math.random() * CARDS.length)];
      addCard(card.id);
      progressQuest('cards', 1);
    }
    celebrate(['#ffd166', '#5ef0a8']);
    toast('slotWin');
  } else {
    toast('slotLose');
  }
  commit();
  spinning = false;
  onResult({ ...outcome, card, bet });
}
