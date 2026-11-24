/** economy.js — stelle, sblocchi e ricompense (puro). */

import { SHIPS, findShip } from './config.js';
import { clamp } from './sim.js';

export function emptySave() {
  return { version: 2, stars: {}, unlocked: ['scout'], ship: 'scout', xp: 0, best: {}, runs: 0, wins: 0 };
}

export function normalizeSave(value = {}) {
  const base = emptySave();
  return {
    ...base, ...value,
    version: 2,
    stars: { ...base.stars, ...(value.stars || {}) },
    unlocked: Array.isArray(value.unlocked) && value.unlocked.length ? value.unlocked : base.unlocked,
    best: { ...base.best, ...(value.best || {}) }
  };
}

export function totalStars(save) {
  return Object.values(normalizeSave(save).stars).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function isUnlocked(shipId, save) {
  const ship = findShip(shipId);
  return ship.unlock <= totalStars(save) || normalizeSave(save).unlocked.includes(shipId);
}

export function newUnlocks(save) {
  const stars = totalStars(save);
  return SHIPS.filter((ship) => ship.unlock > 0 && ship.unlock <= stars && !(save.unlocked || []).includes(ship.id));
}

export function rewardFor(stars) {
  return { xp: 20 + clamp(stars, 0, 3) * 15, coins: 10 + clamp(stars, 0, 3) * 10 };
}

export function applyMissionResult(save, missionId, stars, score) {
  const next = normalizeSave(save);
  next.stars[missionId] = Math.max(next.stars[missionId] || 0, stars);
  next.runs += 1;
  if (stars > 0) next.wins += 1;
  next.best[missionId] = Math.max(next.best[missionId] || 0, score || 0);
  const reward = rewardFor(stars);
  next.xp += reward.xp;
  const unlocked = newUnlocks(next);
  unlocked.forEach((ship) => { next.unlocked.push(ship.id); });
  return { save: next, reward, unlocked };
}
