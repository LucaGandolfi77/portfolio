/* Morse Studio — versioned local persistence */
import { DEFAULT_SETTINGS } from './config.js';

const KEY = 'pf.morse.save.v1';
const LIMITS = { history: 40, favorites: 30 };

function defaults() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    history: [], favorites: [],
    records: { flashcards: 0, dictation: 0, speed: 0 },
    lastInput: '', lastOutput: ''
  };
}
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const p = JSON.parse(raw), d = defaults();
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      history: Array.isArray(p.history) ? p.history.slice(0, LIMITS.history) : [],
      favorites: Array.isArray(p.favorites) ? p.favorites.slice(0, LIMITS.favorites) : [],
      records: { ...d.records, ...(p.records || {}) },
      lastInput: p.lastInput || '', lastOutput: p.lastOutput || ''
    };
  } catch (e) { return defaults(); }
}

export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function pushHistory(input, output) {
  if (!input && !output) return;
  profile.history.unshift({ input, output, t: Date.now() });
  profile.history = profile.history.slice(0, LIMITS.history);
  save();
}
export function clearHistory() { profile.history = []; save(); }
export function toggleFavorite(item) {
  const key = item.input + '|' + item.output;
  const i = profile.favorites.findIndex(f => f.input === item.input && f.output === item.output);
  if (i >= 0) profile.favorites.splice(i, 1);
  else profile.favorites.unshift({ ...item, key, t: Date.now() });
  profile.favorites = profile.favorites.slice(0, LIMITS.favorites);
  save();
  return i < 0;
}
export function isFavorite(item) { return profile.favorites.some(f => f.input === item.input && f.output === item.output); }
export function setRecord(kind, value) {
  if (value > (profile.records[kind] || 0)) { profile.records[kind] = value; save(); }
}
export function resetAll() { profile = defaults(); save(); return profile; }
