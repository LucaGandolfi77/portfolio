/* Cockpit Arena — versioned local persistence */
import { BREEDS, START_WALLET } from './config.js';

const KEY = 'pf.cockpit.save.v1';

function defaults() {
  const base = BREEDS[0];
  return {
    wallet: START_WALLET,
    rooster: {
      name: 'Cometa', breed: base.id, level: 1, xp: 0,
      stats: { ...base.stats }, equipment: [], form: 1
    },
    wins: 0, losses: 0, round: 0, champion: false,
    bets: [], history: [], medals: [], daily: null
  };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    const d = defaults();
    return {
      ...d, ...parsed,
      rooster: { ...d.rooster, ...(parsed.rooster || {}),
        stats: { ...d.rooster.stats, ...(parsed.rooster?.stats || {}) } },
      bets: Array.isArray(parsed.bets) ? parsed.bets.slice(-60) : [],
      history: Array.isArray(parsed.history) ? parsed.history.slice(-60) : []
    };
  } catch (e) { return defaults(); }
}

export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function resetProfile() { profile = defaults(); save(); return profile; }
export function addMoney(amount) { profile.wallet = Math.max(0, profile.wallet + amount); save(); }
export function logResult(entry) {
  profile.history.unshift({ ...entry, t: Date.now() });
  if (profile.history.length > 60) profile.history.length = 60;
  save();
}
