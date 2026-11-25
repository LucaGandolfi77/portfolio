/* Court Clash — player XP, levels and level rewards */

export const MAX_LEVEL = 20;

export const XP_MATCH = 20;
export const XP_WIN = 30;
export const XP_CASHOUT = 10;
export const XP_CHEST = 15;
export const XP_MISSION = 20;
export const XP_DAILY_BONUS = 50;
export const XP_DAILY_CHALLENGE = 50;
export const XP_TOURNAMENT_STEP = 40;
export const XP_TOURNAMENT_COMPLETE = 100;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function xpToNext(level) {
  if (level >= MAX_LEVEL) return 0;
  return 80 + (Math.max(1, level) - 1) * 20;
}

export function totalXpForLevel(level) {
  let total = 0;
  for (let current = 1; current < Math.min(level, MAX_LEVEL); current += 1) {
    total += xpToNext(current);
  }
  return total;
}

export function levelFromXp(xp) {
  let level = 1;
  let remaining = Math.max(0, Number(xp) || 0);
  while (level < MAX_LEVEL && remaining >= xpToNext(level)) {
    remaining -= xpToNext(level);
    level += 1;
  }
  return level;
}

export function levelInfo(progress) {
  const xp = Math.max(0, Number(progress?.xp) || 0);
  const level = levelFromXp(xp);
  const base = totalXpForLevel(level);
  const next = xpToNext(level);
  const current = Math.max(0, xp - base);
  return {
    xp,
    level,
    current,
    next,
    ratio: next ? clamp(current / next, 0, 1) : 1,
    max: level >= MAX_LEVEL,
    nextLevel: level < MAX_LEVEL ? level + 1 : null
  };
}

export function levelReward(level) {
  if (level <= 1) return null;
  const reward = { coins: 100 };
  if (level === 5) reward.wildcards = { rare: 1 };
  if (level === 10) reward.wildcards = { epic: 1 };
  if (level === 15) reward.wildcards = { epic: 1 };
  if (level === 20) {
    reward.coins = 500;
    reward.wildcards = { legendary: 1 };
  }
  return reward;
}

export function xpFromStats(stats) {
  const s = stats || {};
  const matches = Math.max(0, Number(s.matches) || 0);
  const wins = Math.max(0, Number(s.wins) || 0);
  const chests = Math.max(0, Number(s.chestsOpened) || 0);
  const cashouts = Math.max(0, Number(s.cashOuts) || 0);
  const tournaments = Math.max(0, Number(s.tournamentsWon) || 0);
  return matches * XP_MATCH
    + wins * XP_WIN
    + chests * XP_CHEST
    + cashouts * XP_CASHOUT
    + tournaments * (XP_TOURNAMENT_STEP * 3 + XP_TOURNAMENT_COMPLETE);
}

export function migratedProgress(stats) {
  const xp = Math.min(totalXpForLevel(MAX_LEVEL), xpFromStats(stats));
  const level = levelFromXp(xp);
  return { xp, level, rewardsLevel: level };
}

export function sanitizeProgress(progress) {
  const xp = Math.max(0, Number(progress?.xp) || 0);
  const level = levelFromXp(xp);
  const rewardsLevel = clamp(Number(progress?.rewardsLevel) || level, 1, level);
  return { xp, level, rewardsLevel };
}

export function addXp(progress, amount) {
  const p = progress || {};
  p.xp = Math.max(0, Number(p.xp) || 0) + Math.max(0, Number(amount) || 0);
  p.level = clamp(Number(p.level) || 1, 1, MAX_LEVEL);
  p.rewardsLevel = clamp(Number(p.rewardsLevel) || 1, 1, MAX_LEVEL);
  const reached = levelFromXp(p.xp);
  if (reached > p.level) p.level = reached;
  const gained = [];
  while (p.rewardsLevel < p.level) {
    p.rewardsLevel += 1;
    gained.push({ level: p.rewardsLevel, reward: levelReward(p.rewardsLevel) });
  }
  return { gained, level: p.level, xp: p.xp };
}

export function nextLevels(progress, count = 5) {
  const info = levelInfo(progress);
  const levels = [];
  for (let level = info.level + 1; level <= Math.min(MAX_LEVEL, info.level + count); level += 1) {
    levels.push({ level, reward: levelReward(level) });
  }
  return levels;
}
