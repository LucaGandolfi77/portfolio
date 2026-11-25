/* Slot Collect — betting, banking and upgrade economy (pure) */

import { MAX_BET, CASH_OUT_FEE, UPGRADES, DIFFICULTY } from '../config.js';

export function changeBet(bet, delta) { return Math.max(1, Math.min(MAX_BET, bet + delta)); }

export function cashOut(runPoints, banked = 0) {
  const net = Math.max(0, Math.round(runPoints * (1 - CASH_OUT_FEE)));
  return { net, banked: banked + net };
}

export function upgradeCost(id, level) {
  const def = UPGRADES.find(u => u.id === id);
  return def ? def.cost(level || 0) : Infinity;
}

export function canUpgrade(save, id) {
  const def = UPGRADES.find(u => u.id === id);
  if (!def) return false;
  const level = save.upgrades?.[id] || 0;
  return level < def.max && save.score >= upgradeCost(id, level);
}

export function buyUpgrade(save, id, scoreField = 'score') {
  if (!canUpgrade(save, id)) return false;
  const level = save.upgrades[id] || 0;
  save[scoreField] = Math.max(0, save[scoreField] - upgradeCost(id, level));
  save.upgrades[id] = level + 1;
  return true;
}

export function energyFor(difficulty, upgrades = {}) {
  return (DIFFICULTY[difficulty] || DIFFICULTY.normal).energy + (upgrades.energy || 0) * 8;
}
