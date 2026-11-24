/**
 * storage.js — profili, storico e impostazioni persistenti.
 * Tutto in localStorage con prefisso pf.face-compare.
 */

const SETTINGS_KEY = 'pf.face-compare.settings';
const PROFILES_KEY = 'pf.face-compare.profiles';
const HISTORY_KEY = 'pf.face-compare.history';
const MAX_PROFILES = 12;
const MAX_HISTORY = 40;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function loadSettings() {
  const saved = read(SETTINGS_KEY, {}) || {};
  return {
    overlay: saved.overlay !== false,
    mirror: saved.mirror !== false,
    geometryWeight: typeof saved.geometryWeight === 'number' ? saved.geometryWeight : 0.55
  };
}
export function saveSettings(patch = {}) {
  const next = { ...loadSettings(), ...patch };
  write(SETTINGS_KEY, next);
  return next;
}

export function loadProfiles() {
  const list = read(PROFILES_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveProfile({ name, geometry, appearance }) {
  const profiles = loadProfiles();
  const profile = {
    id: uid(),
    name: String(name || 'Senza nome').slice(0, 60),
    createdAt: new Date().toISOString(),
    geometry: Array.from(geometry || []),
    appearance: Array.from(appearance || [])
  };
  profiles.unshift(profile);
  if (profiles.length > MAX_PROFILES) profiles.length = MAX_PROFILES;
  return write(PROFILES_KEY, profiles) ? profile : null;
}

export function deleteProfile(id) {
  const profiles = loadProfiles().filter((p) => p.id !== id);
  return write(PROFILES_KEY, profiles);
}

export function loadHistory() {
  const list = read(HISTORY_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function addHistory(entry) {
  const history = loadHistory();
  history.unshift({
    id: uid(),
    at: new Date().toISOString(),
    score: Math.round(Number(entry.score) || 0),
    reference: String(entry.reference || ''),
    source: String(entry.source || '')
  });
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  write(HISTORY_KEY, history);
  return history;
}

export function clearHistory() {
  return write(HISTORY_KEY, []);
}
