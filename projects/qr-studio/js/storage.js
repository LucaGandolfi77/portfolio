/**
 * storage.js — persistenza locale di QR Studio.
 * Chiavi: pf.qr.history, pf.qr.settings.
 */

export const HISTORY_KEY = 'pf.qr.history';
export const SETTINGS_KEY = 'pf.qr.settings';
export const HISTORY_LIMIT = 50;

export const DEFAULT_SETTINGS = Object.freeze({
  ec: 'M',
  moduleStyle: 'square',
  fg: '#0a0d16',
  bg: '#ffffff',
  transparent: false,
  size: 1024
});

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function makeId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fallthrough */
  }
  return 'qr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const data = typeof raw.data === 'string' ? raw.data : '';
  if (!data) return null;
  const type = typeof raw.type === 'string' ? raw.type : 'text';
  const label = typeof raw.label === 'string' && raw.label ? raw.label : data.slice(0, 48);
  const createdAt = Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now();
  const values = raw.values && typeof raw.values === 'object' ? raw.values : {};
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    type,
    label,
    data,
    values,
    createdAt
  };
}

export function loadHistory() {
  const raw = readJSON(HISTORY_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeItem).filter(Boolean).slice(0, HISTORY_LIMIT);
}

export function saveHistory(items) {
  const clean = (Array.isArray(items) ? items : [])
    .map(normalizeItem)
    .filter(Boolean)
    .slice(0, HISTORY_LIMIT);
  writeJSON(HISTORY_KEY, clean);
  return clean;
}

export function addHistoryItem(item) {
  const clean = normalizeItem(item);
  if (!clean) return { items: loadHistory(), item: null, existed: false };
  const items = loadHistory();
  const existingIndex = items.findIndex((x) => x.data === clean.data);
  const existed = existingIndex >= 0;
  if (existed) {
    const existing = items.splice(existingIndex, 1)[0];
    clean.id = existing.id;
    clean.createdAt = Date.now();
  }
  items.unshift(clean);
  return { items: saveHistory(items), item: clean, existed };
}

export function removeHistoryItem(id) {
  const items = loadHistory().filter((item) => item.id !== id);
  return saveHistory(items);
}

export function clearHistory() {
  writeJSON(HISTORY_KEY, []);
  return [];
}

export function loadSettings() {
  const raw = readJSON(SETTINGS_KEY, {});
  const merged = { ...DEFAULT_SETTINGS, ...(raw && typeof raw === 'object' ? raw : {}) };
  if (!['L', 'M', 'Q', 'H'].includes(merged.ec)) merged.ec = DEFAULT_SETTINGS.ec;
  if (!['square', 'round', 'dot'].includes(merged.moduleStyle)) merged.moduleStyle = DEFAULT_SETTINGS.moduleStyle;
  if (typeof merged.fg !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(merged.fg)) merged.fg = DEFAULT_SETTINGS.fg;
  if (typeof merged.bg !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(merged.bg)) merged.bg = DEFAULT_SETTINGS.bg;
  merged.transparent = Boolean(merged.transparent);
  merged.size = [512, 1024, 2048].includes(Number(merged.size)) ? Number(merged.size) : DEFAULT_SETTINGS.size;
  return merged;
}

export function saveSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  return writeJSON(SETTINGS_KEY, merged);
}
