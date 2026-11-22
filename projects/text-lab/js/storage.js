/**
 * storage.js — preferenze e cronologia OCR di Text Lab.
 * Chiavi: pf.text.settings, pf.text.history.
 */

import {
  DEFAULT_LANGUAGE,
  HISTORY_TEXT_LIMIT,
  confidenceBand,
  historyPreview,
  normalizeLanguage,
  normalizeOcrText,
  truncateText
} from './text.js';

export const SETTINGS_KEY = 'pf.text.settings';
export const HISTORY_KEY = 'pf.text.history';
export const HISTORY_LIMIT = 20;

export const DEFAULT_SETTINGS = Object.freeze({
  language: DEFAULT_LANGUAGE,
  grayscale: false,
  contrast: false,
  facing: 'environment'
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
    /* fallback */
  }
  return 'text-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function loadSettings() {
  const raw = readJSON(SETTINGS_KEY, {});
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    language: normalizeLanguage(source.language),
    grayscale: Boolean(source.grayscale),
    contrast: Boolean(source.contrast),
    facing: source.facing === 'user' ? 'user' : 'environment'
  };
}

export function saveSettings(settings) {
  const source = settings && typeof settings === 'object' ? settings : {};
  return writeJSON(SETTINGS_KEY, {
    language: normalizeLanguage(source.language),
    grayscale: Boolean(source.grayscale),
    contrast: Boolean(source.contrast),
    facing: source.facing === 'user' ? 'user' : 'environment'
  });
}

function normalizeHistoryItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const text = normalizeOcrText(truncateText(raw.text, HISTORY_TEXT_LIMIT));
  if (!text) return null;
  const confidence = Number(raw.confidence);
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : makeId(),
    text,
    language: normalizeLanguage(raw.language),
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(100, Math.round(confidence))) : 0,
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now()
  };
}

export function loadHistory() {
  const raw = readJSON(HISTORY_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeHistoryItem)
    .filter(Boolean)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, HISTORY_LIMIT);
}

export function saveHistory(items) {
  const clean = (Array.isArray(items) ? items : [])
    .map(normalizeHistoryItem)
    .filter(Boolean)
    .slice(0, HISTORY_LIMIT);
  writeJSON(HISTORY_KEY, clean);
  return clean;
}

export function addHistoryItem(item) {
  const clean = normalizeHistoryItem(item);
  if (!clean) return { items: loadHistory(), item: null, existed: false };
  const items = loadHistory();
  const index = items.findIndex((entry) => entry.text === clean.text);
  const existed = index >= 0;
  if (existed) {
    clean.id = items[index].id;
    items.splice(index, 1);
  }
  clean.createdAt = Date.now();
  items.unshift(clean);
  return { items: saveHistory(items), item: clean, existed };
}

export function removeHistoryItem(id) {
  return saveHistory(loadHistory().filter((item) => item.id !== id));
}

export function clearHistory() {
  writeJSON(HISTORY_KEY, []);
  return [];
}

export function historyMeta(item) {
  if (!item) return null;
  return {
    ...item,
    preview: historyPreview(item.text),
    band: confidenceBand(item.confidence)
  };
}
