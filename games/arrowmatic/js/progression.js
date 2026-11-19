/* Arrowmatic — daily rewards, missions and achievements */

import { SV, save } from './state.js';
import { DAILY_REWARDS, MISSION_POOL, ACHIEVEMENTS } from './data.js';

function dayKey(date = new Date()) { return date.toISOString().slice(0, 10); }

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

export function refreshDaily() {
  const today = dayKey();
  if (SV.missions.date !== today) {
    SV.missions = { date: today, progress: {}, claimed: [] };
    if (SV.daily.last !== today && SV.daily.last !== yesterdayKey()) SV.daily.streak = 0;
    save();
  }
  return SV.daily;
}

export function dailyState() {
  const today = dayKey();
  const canClaim = SV.daily.claimed !== today;
  const index = Math.min(6, Math.max(0, SV.daily.streak));
  return {
    canClaim,
    streak: SV.daily.streak || 0,
    index,
    reward: DAILY_REWARDS[index],
    rewards: DAILY_REWARDS
  };
}

export function claimDaily() {
  const today = dayKey();
  if (SV.daily.claimed === today) return null;
  SV.daily.streak = SV.daily.last === yesterdayKey() ? (SV.daily.streak || 0) + 1 : 1;
  SV.daily.last = today;
  SV.daily.claimed = today;
  const reward = DAILY_REWARDS[Math.min(6, SV.daily.streak - 1)];
  SV.coins += reward;
  save();
  return reward;
}

export function missionProgress(event, amount = 1) {
  const today = dayKey();
  if (SV.missions.date !== today) refreshDaily();
  for (const m of MISSION_POOL) {
    if (m.event !== event || SV.missions.claimed.includes(m.id)) continue;
    SV.missions.progress[m.id] = Math.min(m.target, (SV.missions.progress[m.id] || 0) + amount);
  }
  save();
}

export function missionList() {
  return MISSION_POOL.map(m => ({
    ...m,
    progress: Math.min(m.target, SV.missions.progress[m.id] || 0),
    claimed: SV.missions.claimed.includes(m.id),
    done: (SV.missions.progress[m.id] || 0) >= m.target
  }));
}

export function claimMission(id) {
  const mission = MISSION_POOL.find(m => m.id === id);
  if (!mission || SV.missions.claimed.includes(id)) return null;
  if ((SV.missions.progress[id] || 0) < mission.target) return null;
  SV.missions.claimed.push(id);
  SV.coins += mission.reward;
  save();
  return mission.reward;
}

export function achievementList() {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: !!SV.achievements[a.id]
  }));
}

export function checkAchievements() {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (SV.achievements[a.id]) continue;
    try {
      if (a.test(SV)) {
        SV.achievements[a.id] = Date.now();
        SV.coins += a.reward;
        unlocked.push(a);
      }
    } catch (e) { /* ignore */ }
  }
  if (unlocked.length) save();
  return unlocked;
}

export function countBoss() {
  SV.achCounters.bosses = (SV.achCounters.bosses || 0) + 1;
  save();
}
