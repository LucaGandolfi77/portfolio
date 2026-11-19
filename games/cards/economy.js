/* Card Collector — economy, progression, quests, streaks and achievements */

import { state, commit } from './state.js';
import { toast, celebrate } from './effects.js';

export const QUEST_POOL = [
  { id: 'boxes', key: 'questBoxes', target: 1, reward: { gold: 150 } },
  { id: 'battles', key: 'questBattles', target: 1, reward: { gems: 10 } },
  { id: 'spins', key: 'questSpins', target: 3, reward: { gold: 200 } },
  { id: 'cards', key: 'questCards', target: 5, reward: { xp: 60 } }
];

export const ACHIEVEMENTS = [
  { id: 'firstCard', key: 'achFirstCard', reward: { gold: 100 }, test: d => Object.keys(d.collection).length >= 1 },
  { id: 'collector10', key: 'achCollector10', reward: { gems: 25 }, test: d => Object.keys(d.collection).length >= 10 },
  { id: 'collectorAll', key: 'achCollectorAll', reward: { gems: 200 }, test: d => Object.keys(d.collection).length >= 44 },
  { id: 'legendary', key: 'achLegendary', reward: { gold: 1000 }, test: d => Object.keys(d.collection).some(id => [20,21,22,23,24,33,34,43,44].includes(Number(id))) },
  { id: 'wins5', key: 'achWins5', reward: { gems: 50 }, test: d => d.battlesWon >= 5 },
  { id: 'boxes10', key: 'achBoxes10', reward: { gold: 800 }, test: d => d.boxesOpened >= 10 },
  { id: 'streak3', key: 'achStreak3', reward: { gems: 40 }, test: d => d.daily.streak >= 3 }
];

function today() { return new Date().toISOString().slice(0, 10); }

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function xpForLevel(level) { return 100 + (level - 1) * 50; }

function grant(reward) {
  const d = state.data;
  if (reward.gold) d.gold = Math.min(99999, d.gold + reward.gold);
  if (reward.gems) d.gems = Math.min(99999, d.gems + reward.gems);
  if (reward.xp) return addXP(reward.xp, true);
  return 0;
}

let checking = false;
export function checkAchievements() {
  if (checking) return;
  checking = true;
  const d = state.data;
  let unlocked = 0;
  ACHIEVEMENTS.forEach(a => {
    if (d.achievements[a.id]) return;
    try {
      if (a.test(d)) {
        d.achievements[a.id] = Date.now();
        grant(a.reward);
        toast('🏆 ' + a.key + '!');
        celebrate(['#ffd166', '#5ef0a8']);
        unlocked++;
      }
    } catch (e) { /* ignore bad achievement */ }
  });
  checking = false;
  if (unlocked) commit();
}

export function refreshDaily() {
  const d = state.data;
  const day = today();
  if (d.daily.date === day) return d.daily.quests;
  d.daily.streak = d.daily.lastLogin === yesterday() ? (d.daily.streak || 0) + 1 : 1;
  d.daily.lastLogin = day;
  d.daily.date = day;
  d.daily.quests = QUEST_POOL.slice(0, 3).map(q => ({ ...q, progress: 0, done: false }));
  commit();
  checkAchievements();
  return d.daily.quests;
}

export function progressQuest(id, amount = 1) {
  const quest = state.data.daily.quests.find(q => q.id === id);
  if (!quest || quest.done) return;
  quest.progress = Math.min(quest.target, quest.progress + amount);
  if (quest.progress >= quest.target) {
    quest.done = true;
    grant(quest.reward);
    toast('✅ ' + quest.key + '!');
    commit();
  }
}

export function addXP(amount, silent = false) {
  const d = state.data;
  d.xp += Math.max(0, amount);
  let ups = 0;
  while (d.xp >= xpForLevel(d.level) && d.level < 999) {
    d.xp -= xpForLevel(d.level);
    d.level++;
    ups++;
  }
  if (ups) {
    d.gold = Math.min(99999, d.gold + ups * 250);
    if (!silent) {
      toast('🎉 Level ' + d.level + '! +' + (ups * 250) + ' gold');
      celebrate();
    }
  }
  commit();
  checkAchievements();
  return ups;
}

export function addGold(amount) {
  state.data.gold = Math.max(0, Math.min(99999, state.data.gold + amount));
  commit();
  checkAchievements();
}

export function addGems(amount) {
  state.data.gems = Math.max(0, Math.min(99999, state.data.gems + amount));
  commit();
  checkAchievements();
}

export function spend(currency, amount) {
  const key = currency === 'gems' ? 'gems' : 'gold';
  if (state.data[key] < amount) {
    toast('notEnough', 'error');
    return false;
  }
  state.data[key] -= amount;
  return true;
}

export function grantReward(reward) {
  grant(reward);
  commit();
  checkAchievements();
}
