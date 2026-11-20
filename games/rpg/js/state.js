import { load, store } from '../../_kit/storage.js';
import { grantXP, unlock, hasUnlock, touchStreak } from '../../_kit/progression.js';

const KEY = 'rpg-adventure.save.v1';
const defaults = {
  difficulty: 'normal', zone: 0, level: 1, xp: 0, gold: 0,
  wins: 0, kills: 0, bosses: 0, bestStreak: 0, streak: 0,
  inventory: { potion: 2, sword: 0, shield: 0 },
  equipped: { sword: false, shield: false },
  log: [], sound: true
};

export const profile = load(KEY, defaults);
profile.inventory = { ...defaults.inventory, ...(profile.inventory || {}) };
profile.equipped = { ...defaults.equipped, ...(profile.equipped || {}) };

export function save() { store(KEY, profile); }
export function gainXP(amount) {
  const result = grantXP(profile, amount, 'battle');
  profile.streak = touchStreak(profile);
  profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
  save();
  return result;
}
export function completeQuest(id) {
  const done = unlock(profile, 'quest-' + id);
  if (done) save();
  return done;
}
export function questDone(id) { return hasUnlock(profile, 'quest-' + id); }
