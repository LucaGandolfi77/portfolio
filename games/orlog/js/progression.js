/** progression.js — stelle, talenti e reliquie (puro). */

import { TALENTS, RELICS } from './config.js';
import { campaignStars } from './modes.js';

export function emptyProgress() {
  return { stars: {}, best: {}, talents: [], relics: [], streak: { count: 0, last: '' }, xp: 0, wins: 0, games: 0 };
}

export function normalizeProgress(value = {}) {
  const base = emptyProgress();
  return {
    ...base, ...value,
    stars: { ...base.stars, ...(value.stars || {}) },
    best: { ...base.best, ...(value.best || {}) },
    talents: Array.isArray(value.talents) ? value.talents : base.talents,
    relics: Array.isArray(value.relics) ? value.relics : base.relics,
    streak: { ...base.streak, ...(value.streak || {}) }
  };
}

export function totalStars(save) { return campaignStars(save); }

export function awardStars(save, bossId, stars, score) {
  const next = normalizeProgress(save);
  next.stars[bossId] = Math.max(next.stars[bossId] || 0, stars);
  next.best[bossId] = Math.max(next.best[bossId] || 0, score);
  next.games += 1;
  if (stars > 0) { next.wins += 1; next.xp += 40 + stars * 20; }
  return next;
}

export function unlockedTalentCount(save) { return normalizeProgress(save).talents.length; }

export function canBuyTalent(save, talentId) {
  const talent = TALENTS.find((item) => item.id === talentId);
  if (!talent) return false;
  const owned = unlockedTalentCount(save);
  return !normalizeProgress(save).talents.includes(talentId) && totalStars(save) >= talent.cost && owned < 4;
}

export function buyTalent(save, talentId) {
  if (!canBuyTalent(save, talentId)) return save;
  const next = normalizeProgress(save);
  next.talents.push(talentId);
  return next;
}

export function unlockedRelics(save) {
  const stars = totalStars(save);
  return RELICS.filter((relic, index) => stars >= index * 3);
}

export function toggleRelic(save, relicId) {
  const next = normalizeProgress(save);
  if (next.relics.includes(relicId)) next.relics = next.relics.filter((id) => id !== relicId);
  else if (unlockedRelics(save).some((relic) => relic.id === relicId) && next.relics.length < 2) next.relics.push(relicId);
  return next;
}

export function updateStreak(save, today) {
  const next = normalizeProgress(save);
  const last = next.streak.last;
  next.streak = { last: today, count: last === today ? next.streak.count : next.streak.count + 1 };
  return next;
}

export function talentSummary(save) {
  const state = normalizeProgress(save);
  return { stars: totalStars(state), xp: state.xp, wins: state.wins, games: state.games, talents: state.talents.length, relics: state.relics.length };
}
