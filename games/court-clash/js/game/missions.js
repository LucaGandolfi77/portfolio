/* Court Clash — daily and weekly missions */

export const DAILY_MISSIONS = [
  { id: 'play', titleKey: 'missionPlay', descKey: 'missionPlayDesc', target: 2, progressKey: 'matches', reward: { coins: 50 } },
  { id: 'win', titleKey: 'missionWin', descKey: 'missionWinDesc', target: 1, progressKey: 'wins', reward: { coins: 75 } },
  { id: 'chest', titleKey: 'missionChest', descKey: 'missionChestDesc', target: 1, progressKey: 'chests', reward: { coins: 50 } },
  { id: 'underdog', titleKey: 'missionUnderdog', descKey: 'missionUnderdogDesc', target: 1, progressKey: 'underdogWins', reward: { wildcards: { rare: 1 } } }
];

export const WEEKLY_MISSIONS = [
  { id: 'wins10', titleKey: 'missionWins10', descKey: 'missionWins10Desc', target: 10, progressKey: 'wins', reward: { coins: 500 } },
  { id: 'chests10', titleKey: 'missionChests10', descKey: 'missionChests10Desc', target: 10, progressKey: 'chests', reward: { coins: 500 } },
  { id: 'upgrades3', titleKey: 'missionUpgrades3', descKey: 'missionUpgrades3Desc', target: 3, progressKey: 'upgrades', reward: { coins: 300, wildcards: { rare: 1 } } }
];

export const DAILY_BONUS = { coins: 100, wildcards: { rare: 1 } };

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function freshDaily(today) {
  return { date: today, progress: { matches: 0, wins: 0, chests: 0, underdogWins: 0 }, claimed: [], bonusClaimed: false };
}

function freshWeekly(week) {
  return { week, progress: { wins: 0, chests: 0, upgrades: 0 }, claimed: [] };
}

export function ensureMissions(data, today = dateKey(), week = weekKey()) {
  data.missions = data.missions || {};
  if (!data.missions.daily || data.missions.daily.date !== today) data.missions.daily = freshDaily(today);
  if (!data.missions.weekly || data.missions.weekly.week !== week) data.missions.weekly = freshWeekly(week);
  const daily = data.missions.daily;
  daily.progress = { matches: 0, wins: 0, chests: 0, underdogWins: 0, ...(daily.progress || {}) };
  daily.claimed = Array.isArray(daily.claimed) ? daily.claimed : [];
  const weekly = data.missions.weekly;
  weekly.progress = { wins: 0, chests: 0, upgrades: 0, ...(weekly.progress || {}) };
  weekly.claimed = Array.isArray(weekly.claimed) ? weekly.claimed : [];
  return data.missions;
}

export function recordMission(data, type, amount = 1) {
  ensureMissions(data);
  const daily = data.missions.daily.progress;
  const weekly = data.missions.weekly.progress;
  if (type === 'match') daily.matches += amount;
  else if (type === 'win') { daily.wins += amount; weekly.wins += amount; }
  else if (type === 'underdogWin') daily.underdogWins += amount;
  else if (type === 'chest') { daily.chests += amount; weekly.chests += amount; }
  else if (type === 'upgrade') weekly.upgrades += amount;
}

export function missionProgress(data, period, mission) {
  ensureMissions(data);
  const progress = data.missions[period].progress[mission.progressKey] || 0;
  return { value: Math.min(mission.target, progress), target: mission.target, ratio: Math.min(1, progress / mission.target) };
}

export function claimMission(data, period, id) {
  ensureMissions(data);
  const list = period === 'daily' ? DAILY_MISSIONS : WEEKLY_MISSIONS;
  const mission = list.find(item => item.id === id);
  if (!mission) return null;
  const bucket = data.missions[period];
  if (bucket.claimed.includes(id)) return null;
  const progress = bucket.progress[mission.progressKey] || 0;
  if (progress < mission.target) return null;
  bucket.claimed.push(id);
  return mission.reward;
}

export function dailyBonusAvailable(data) {
  ensureMissions(data);
  const claimed = data.missions.daily.claimed || [];
  return DAILY_MISSIONS.every(mission => claimed.includes(mission.id)) && !data.missions.daily.bonusClaimed;
}

export function claimDailyBonus(data) {
  ensureMissions(data);
  if (!dailyBonusAvailable(data)) return null;
  data.missions.daily.bonusClaimed = true;
  return DAILY_BONUS;
}

export function dailySummary(data) {
  ensureMissions(data);
  const claimed = data.missions.daily.claimed || [];
  return {
    total: DAILY_MISSIONS.length,
    claimed: claimed.length,
    bonusClaimed: !!data.missions.daily.bonusClaimed,
    bonusAvailable: dailyBonusAvailable(data)
  };
}
