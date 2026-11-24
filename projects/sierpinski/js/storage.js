/* Fractal Observatory — versioned persistence, favorites and custom presets */
import { DEFAULT_SETTINGS, FORMS } from './config.js';

const KEY = 'pf.fractal.save.v2';
function defaults() {
  return { settings: { ...DEFAULT_SETTINGS }, params: {}, favorites: [], custom: [], lastForm: 'tri' };
}
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}, d = defaults();
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      params: p.params || {},
      favorites: Array.isArray(p.favorites) ? p.favorites.slice(0, 30) : [],
      custom: Array.isArray(p.custom) ? p.custom.slice(0, 20) : [],
      lastForm: FORMS.some(f => f.id === p.lastForm) ? p.lastForm : 'tri'
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function setParams(form, params) { profile.params[form] = { ...(profile.params[form] || {}), ...params }; save(); }
export function toggleFavorite(id) {
  const i = profile.favorites.indexOf(id);
  if (i >= 0) profile.favorites.splice(i, 1); else profile.favorites.unshift(id);
  save(); return i < 0;
}
export function addCustom(preset) {
  profile.custom.unshift({ ...preset, t: Date.now() });
  profile.custom = profile.custom.slice(0, 20); save();
}
export function resetAll() { profile = defaults(); save(); return profile; }
