/* Court Clash — arenas, trophies, trophy road and achievements */

import { setProgress } from './collection.js';

export const ARENAS = [
  { key: 'rookie', min: 0, slots: 3, tournament: false, daily: false, color: '#9fb3c7' },
  { key: 'pro', min: 400, slots: 4, tournament: true, daily: false, color: '#4de8ff' },
  { key: 'allstar', min: 900, slots: 5, tournament: true, daily: true, color: '#a78bfa' },
  { key: 'elite', min: 1600, slots: 5, tournament: true, daily: true, color: '#ffd166' },
  { key: 'legend', min: 2500, slots: 5, tournament: true, daily: true, color: '#ff9f1c' }
];

export const TROPHY_ROAD = [
  { at: 100, coins: 100, wildcards: { common: 1 } },
  { at: 200, coins: 150, wildcards: {} },
  { at: 400, coins: 250, wildcards: { rare: 1 } },
  { at: 600, coins: 300, wildcards: {} },
  { at: 900, coins: 400, wildcards: { epic: 1 } },
  { at: 1200, coins: 500, wildcards: {} },
  { at: 1600, coins: 700, wildcards: { epic: 2 } },
  { at: 2000, coins: 900, wildcards: {} },
  { at: 2500, coins: 1200, wildcards: { legendary: 1 } }
];

export const ACHIEVEMENTS = [
  { id: 'firstWin', titleKey: 'achFirstWin', descKey: 'achFirstWinDesc', reward: { coins: 100 }, check: s => s.wins >= 1 },
  { id: 'wins10', titleKey: 'achWins10', descKey: 'achWins10Desc', reward: { coins: 250 }, check: s => s.wins >= 10 },
  { id: 'wins50', titleKey: 'achWins50', descKey: 'achWins50Desc', reward: { coins: 750, wildcards: { rare: 2 } }, check: s => s.wins >= 50 },
  { id: 'streak5', titleKey: 'achStreak5', descKey: 'achStreak5Desc', reward: { coins: 300, wildcards: { rare: 1 } }, check: s => s.bestStreak >= 5 },
  { id: 'streak10', titleKey: 'achStreak10', descKey: 'achStreak10Desc', reward: { coins: 700, wildcards: { epic: 1 } }, check: s => s.bestStreak >= 10 },
  { id: 'cards100', titleKey: 'achCards100', descKey: 'achCards100Desc', reward: { coins: 400, wildcards: { rare: 2 } }, check: s => s.owned >= 100 },
  { id: 'cards200', titleKey: 'achCards200', descKey: 'achCards200Desc', reward: { coins: 900, wildcards: { epic: 1 } }, check: s => s.owned >= 200 },
  { id: 'cards300', titleKey: 'achCards300', descKey: 'achCards300Desc', reward: { coins: 2000, wildcards: { legendary: 1 } }, check: s => s.owned >= 300 },
  { id: 'legendary1', titleKey: 'achLegendary1', descKey: 'achLegendary1Desc', reward: { coins: 250 }, check: s => s.legendaryOwned >= 1 },
  { id: 'maxCard', titleKey: 'achMaxCard', descKey: 'achMaxCardDesc', reward: { coins: 1000, wildcards: { epic: 2 } }, check: s => s.maxLevel >= 5 },
  { id: 'chests10', titleKey: 'achChests10', descKey: 'achChests10Desc', reward: { coins: 150 }, check: s => s.chestsOpened >= 10 },
  { id: 'chests50', titleKey: 'achChests50', descKey: 'achChests50Desc', reward: { coins: 500, wildcards: { rare: 2 } }, check: s => s.chestsOpened >= 50 },
  { id: 'chests100', titleKey: 'achChests100', descKey: 'achChests100Desc', reward: { coins: 1000, wildcards: { epic: 1 } }, check: s => s.chestsOpened >= 100 },
  { id: 'set1', titleKey: 'achSet1', descKey: 'achSet1Desc', reward: { coins: 500, wildcards: { rare: 2 } }, check: s => s.completeSets >= 1 },
  { id: 'setAll', titleKey: 'achSetAll', descKey: 'achSetAllDesc', reward: { coins: 5000, wildcards: { legendary: 2 } }, check: s => s.completeSets >= 5 },
  { id: 'arenaAllStar', titleKey: 'achArenaAllStar', descKey: 'achArenaAllStarDesc', reward: { coins: 500, wildcards: { epic: 1 } }, check: s => s.trophies >= 900 },
  { id: 'arenaLegend', titleKey: 'achArenaLegend', descKey: 'achArenaLegendDesc', reward: { coins: 1500, wildcards: { legendary: 1 } }, check: s => s.trophies >= 2500 },
  { id: 'cashout1', titleKey: 'achCashout1', descKey: 'achCashout1Desc', reward: { coins: 100 }, check: s => s.cashOuts >= 1 },
  { id: 'cashout10', titleKey: 'achCashout10', descKey: 'achCashout10Desc', reward: { coins: 400 }, check: s => s.cashOuts >= 10 },
  { id: 'tournament1', titleKey: 'achTournament1', descKey: 'achTournament1Desc', reward: { coins: 750, wildcards: { epic: 1 } }, check: s => s.tournamentsWon >= 1 },
  { id: 'underdog3', titleKey: 'achUnderdog3', descKey: 'achUnderdog3Desc', reward: { coins: 400, wildcards: { rare: 1 } }, check: s => s.underdogWins >= 3 }
];

export function arenaFor(trophies = 0) {
  let current = ARENAS[0];
  for (const arena of ARENAS) if (trophies >= arena.min) current = arena;
  return current;
}

export function nextArena(trophies = 0) {
  return ARENAS.find(arena => arena.min > trophies) || null;
}

export function trophyDelta(odds = 1.5, won) {
  if (won) return 25 + Math.round(Math.max(0, odds - 1.5) * 10);
  return -(15 + (odds < 1.5 ? 10 : 0));
}

export function claimTrophyRoad(data) {
  data.trophyRoadClaimed = Array.isArray(data.trophyRoadClaimed) ? data.trophyRoadClaimed : [];
  let coins = 0;
  const wildcards = {};
  const claimed = [];
  for (const milestone of TROPHY_ROAD) {
    if (data.trophies < milestone.at || data.trophyRoadClaimed.includes(milestone.at)) continue;
    data.trophyRoadClaimed.push(milestone.at);
    coins += milestone.coins || 0;
    for (const [rarity, amount] of Object.entries(milestone.wildcards || {})) {
      wildcards[rarity] = (wildcards[rarity] || 0) + amount;
    }
    claimed.push(milestone.at);
  }
  return { coins, wildcards, claimed };
}

export function achievementStats(data, cards) {
  const owned = Object.keys(data.collection || {}).length;
  const maxLevel = Object.values(data.collection || {}).reduce((max, entry) => Math.max(max, entry.level || 1), 0);
  const legendaryOwned = Object.keys(data.collection || {}).filter(id => {
    const card = cards.find(c => c.id === id);
    return card && card.rarity === 'legendary';
  }).length;
  const completeSets = Object.values(setProgress(data.collection || {}, cards)).filter(p => p.total > 0 && p.owned >= p.total).length;
  const stats = data.stats || {};
  return {
    wins: stats.wins || 0,
    losses: stats.losses || 0,
    bestStreak: stats.bestStreak || 0,
    chestsOpened: data.chests?.opened || 0,
    owned,
    legendaryOwned,
    maxLevel,
    completeSets,
    trophies: data.trophies || 0,
    cashOuts: stats.cashOuts || 0,
    tournamentsWon: stats.tournamentsWon || 0,
    underdogWins: stats.underdogWins || 0
  };
}

export function grantAchievements(data, cards) {
  data.achievements = data.achievements || { unlocked: [] };
  const stats = achievementStats(data, cards);
  const unlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (data.achievements.unlocked.includes(achievement.id)) continue;
    if (!achievement.check(stats)) continue;
    data.achievements.unlocked.push(achievement.id);
    data.wallet.coins = (data.wallet.coins || 0) + (achievement.reward.coins || 0);
    for (const [rarity, amount] of Object.entries(achievement.reward.wildcards || {})) {
      data.wildcards[rarity] = (data.wildcards[rarity] || 0) + amount;
    }
    unlocked.push(achievement);
  }
  return unlocked;
}

export function arenaProgress(trophies = 0) {
  const current = arenaFor(trophies);
  const next = nextArena(trophies);
  if (!next) return { current, next: null, ratio: 1 };
  const span = next.min - current.min;
  const ratio = span ? Math.max(0, Math.min(1, (trophies - current.min) / span)) : 1;
  return { current, next, ratio };
}
