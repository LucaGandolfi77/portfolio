/* Slot Collect — XP, levels, achievements, streaks and collection (pure helpers) */

import { ACHIEVEMENTS, COLLECTIBLE } from '../config.js';

export function xpForLevel(level) { return Math.round(80 * Math.pow(Math.max(0, level - 1), 1.6)); }

export function grantXP(save, amount) {
  save.xp = (save.xp || 0) + Math.max(0, Math.round(amount));
  let leveled = false;
  while (save.xp >= xpForLevel((save.level || 1) + 1)) { save.level = (save.level || 1) + 1; leveled = true; }
  return leveled;
}

export function touchStreak(save, date = new Date()) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  if (!save.streak) save.streak = { count: 0, last: '' };
  if (save.streak.last === key) return save.streak.count;
  const y = new Date(date.getTime() - 86400000);
  const ykey = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
  save.streak.count = save.streak.last === ykey ? save.streak.count + 1 : 1;
  save.streak.last = key;
  return save.streak.count;
}

export function unlock(save, id) {
  save.achievements = save.achievements || {};
  if (save.achievements[id]) return false;
  save.achievements[id] = Date.now();
  grantXP(save, 60);
  return true;
}

export function progressAchievements(save, counters) {
  const unlocked = [];
  for (const def of ACHIEVEMENTS) {
    if (save.achievements?.[def.id]) continue;
    if ((counters[def.id] || 0) >= def.goal && unlock(save, def.id)) unlocked.push(def);
  }
  return unlocked;
}

export function addCollection(save, ids) {
  save.collection = save.collection || {};
  let added = 0;
  for (const id of ids) {
    if (!COLLECTIBLE.includes(id)) continue;
    save.collection[id] = (save.collection[id] || 0) + 1;
    added++;
  }
  return added;
}

export function summary(save) {
  return {
    level: save.level || 1,
    xp: save.xp || 0,
    next: xpForLevel((save.level || 1) + 1),
    streak: save.streak?.count || 0,
    achievements: ACHIEVEMENTS.filter(a => save.achievements?.[a.id]),
    collection: { ...(save.collection || {}) }
  };
}
