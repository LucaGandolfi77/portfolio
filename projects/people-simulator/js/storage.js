/* People Simulator — versioned local persistence */
import { DEFAULT_SETTINGS } from './config.js';

const KEY = 'pf.people.save.v1';
function defaults() {
  return { settings: { ...DEFAULT_SETTINGS }, favorites: [], scenarios: [], lastState: null };
}
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {};
    const d = defaults();
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      favorites: Array.isArray(p.favorites) ? p.favorites.slice(0, 20) : [],
      scenarios: Array.isArray(p.scenarios) ? p.scenarios.slice(0, 12) : [],
      lastState: p.lastState || null
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSetting(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function toggleFavorite(name) {
  const i = profile.favorites.indexOf(name);
  if (i >= 0) profile.favorites.splice(i, 1); else profile.favorites.unshift(name);
  profile.favorites = profile.favorites.slice(0, 20); save();
  return i < 0;
}
export function saveScenario(scenario) {
  profile.scenarios.unshift({ ...scenario, t: Date.now() });
  profile.scenarios = profile.scenarios.slice(0, 12); save();
}
