/**
 * storage.js — wallet, carriera, jockey, stagione, impostazioni.
 */

const KEY = 'royalderby_v1';

const DEFAULTS = {
  wallet: 500,
  names: {},
  colors: {},
  jockeys: {},
  career: {},
  standings: {},
  sound: true
};

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    return raw && typeof raw === 'object' ? raw : {};
  } catch (e) { return {}; }
}

export function loadProfile() {
  const raw = read();
  const profile = {};
  for (const key of Object.keys(DEFAULTS)) {
    profile[key] = key in raw ? raw[key] : DEFAULTS[key];
  }
  if (typeof profile.wallet !== 'number' || !Number.isFinite(profile.wallet)) profile.wallet = 500;
  return profile;
}

export function saveProfile(patch) {
  const next = { ...loadProfile(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
  return next;
}

export function careerOf(profile, id) {
  return profile.career[id] || (profile.career[id] = { races: 0, wins: 0, places: 0, best: null, earned: 0 });
}
