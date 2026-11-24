/* T-SNE 3D — versioned preferences and saved views */
import { DEFAULT_SETTINGS } from './config.js';
const KEY = 'pf.tsne.save.v1';
function defaults() { return { settings: { ...DEFAULT_SETTINGS }, recent: [], saved: [] }; }
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}, d = defaults();
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      recent: Array.isArray(p.recent) ? p.recent.slice(0, 12) : [],
      saved: Array.isArray(p.saved) ? p.saved.slice(0, 12) : []
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function addRecent(name) {
  profile.recent = [name, ...profile.recent.filter(x => x !== name)].slice(0, 12); save();
}
export function saveView(view) {
  profile.saved.unshift({ ...view, t: Date.now() });
  profile.saved = profile.saved.slice(0, 12); save();
}
