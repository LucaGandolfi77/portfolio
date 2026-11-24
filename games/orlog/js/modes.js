/** modes.js — configurazioni delle modalità (puro). */

import { BOSSES, MUTATORS, findBoss, findMode } from './config.js';
import { dailySeed, mulberry32 } from './engine.js';

export function dailyBoss(date = new Date()) {
  return BOSSES[dailySeed(date) % BOSSES.length];
}

export function isBossUnlocked(bossId, save = {}) {
  const index = BOSSES.findIndex((boss) => boss.id === bossId);
  if (index <= 0) return true;
  const previous = BOSSES[index - 1];
  return (save.stars && save.stars[previous.id] || 0) > 0;
}

export function nextBoss(bossId) {
  const index = BOSSES.findIndex((boss) => boss.id === bossId);
  return index >= 0 && index < BOSSES.length - 1 ? BOSSES[index + 1].id : null;
}

export function campaignStars(save = {}) {
  return Object.values(save.stars || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

export function tournamentOpponents() {
  return BOSSES.slice(0, 3).map((boss, index) => ({ ...boss, hp: boss.hp - index * 2 }));
}

export function endlessOpponent(wave, rng = Math.random) {
  const base = BOSSES[Math.min(BOSSES.length - 1, Math.floor(wave / 3))];
  return { ...base, name: `Wave ${wave} · ${base.name}`, hp: base.hp + wave, tokens: base.tokens + Math.floor(wave / 2) };
}

export function chaosMutators(rng = Math.random) {
  const pool = MUTATORS.map((item) => item.id);
  const first = pool[Math.floor(rng() * pool.length)];
  const second = pool[Math.floor(rng() * pool.length)];
  return second === first ? [first] : [first, second];
}

export function modeSetup(modeId, save = {}, date = new Date()) {
  const mode = findMode(modeId);
  if (modeId === 'campaign') {
    const bossId = save.lastBoss || BOSSES[0].id;
    const boss = isBossUnlocked(bossId, save) ? findBoss(bossId) : BOSSES[0];
    return { mode, bossId: boss.id, hp: boss.hp, tokens: boss.tokens, seed: null, rounds: 1, mutators: [] };
  }
  if (modeId === 'daily') {
    const boss = dailyBoss(date);
    return { mode, bossId: boss.id, hp: boss.hp, tokens: boss.tokens, seed: dailySeed(date), rounds: 1, mutators: [] };
  }
  if (modeId === 'tournament') return { mode, bossId: 'b1', hp: 12, tokens: 2, seed: null, rounds: 3, mutators: [] };
  if (modeId === 'endless') return { mode, bossId: 'b1', hp: 15, tokens: 3, seed: null, rounds: Infinity, mutators: [] };
  if (modeId === 'chaos') return { mode, bossId: null, hp: 15, tokens: 3, seed: null, rounds: 1, mutators: chaosMutators() };
  return { mode, bossId: null, hp: 15, tokens: 3, seed: null, rounds: 1, mutators: [] };
}

export function modeLabel(modeId) { return findMode(modeId).name; }
