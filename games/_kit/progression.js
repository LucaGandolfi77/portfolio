/* Game Kit — XP, levels, unlocks and daily streaks */

export function levelFor(xp) { return 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 80)); }
export function xpForLevel(level) { return Math.pow(Math.max(0, level - 1), 2) * 80; }

export function grantXP(profile, amount, reason) {
  profile.xp = (profile.xp || 0) + amount;
  profile.log = profile.log || [];
  profile.log.unshift({ amount, reason, t: Date.now() });
  if (profile.log.length > 30) profile.log.length = 30;
  const level = levelFor(profile.xp);
  const leveled = level > (profile.level || 1);
  profile.level = level;
  return { level, leveled };
}

export function unlock(profile, id) {
  profile.unlocks = profile.unlocks || [];
  if (profile.unlocks.includes(id)) return false;
  profile.unlocks.push(id);
  return true;
}

export function hasUnlock(profile, id) { return !!(profile.unlocks || []).includes(id); }

export function touchStreak(profile, date = new Date()) {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  profile.streak = profile.streak || { count: 0, last: '' };
  if (profile.streak.last === key) return profile.streak.count;
  const yesterday = new Date(date.getTime() - 86400000);
  const ykey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  profile.streak.count = profile.streak.last === ykey ? profile.streak.count + 1 : 1;
  profile.streak.last = key;
  return profile.streak.count;
}

export function achievements(profile, definitions) {
  return definitions.map(def => ({
    ...def,
    done: hasUnlock(profile, def.id),
    progress: Math.min(1, (def.value(profile) || 0) / def.goal)
  }));
}
