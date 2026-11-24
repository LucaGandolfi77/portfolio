/* Walkie Talkie — versioned settings, recent channels and message history */
import { DEFAULT_SETTINGS } from './config.js';
const KEY = 'pf.walkie.save.v1';
function defaults() { return { settings: { ...DEFAULT_SETTINGS }, recent: [], messages: [] }; }
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}, d = defaults();
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      recent: Array.isArray(p.recent) ? p.recent.slice(0, 10) : [],
      messages: Array.isArray(p.messages) ? p.messages.slice(-60) : []
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function addRecent(id) {
  if (!id) return;
  profile.recent = [id, ...profile.recent.filter(x => x !== id)].slice(0, 10); save();
}
export function pushMessage(author, text) {
  profile.messages.push({ author, text, t: Date.now() });
  profile.messages = profile.messages.slice(-60); save();
}
export function clearMessages() { profile.messages = []; save(); }
