/**
 * storage.js — preferenze e record di Vision Lab.
 * Chiavi: pf.vision.settings, pf.vision.best.
 */

import { clamp } from './vision.js';

export const SETTINGS_KEY = 'pf.vision.settings';
export const BEST_KEY = 'pf.vision.best';

export const DEFAULT_SETTINGS = Object.freeze({
  mode: 'mesh',
  mesh: 'soft',
  mirror: true,
  facing: 'user'
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

export function loadSettings() {
  const raw = readJSON(SETTINGS_KEY, {});
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    mode: source.mode === 'smile' ? 'smile' : 'mesh',
    mesh: ['off', 'soft', 'full'].includes(source.mesh) ? source.mesh : DEFAULT_SETTINGS.mesh,
    mirror: source.mirror === undefined ? true : Boolean(source.mirror),
    facing: source.facing === 'environment' ? 'environment' : 'user'
  };
}

export function saveSettings(settings) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...(settings && typeof settings === 'object' ? settings : {})
  };
  return writeJSON(SETTINGS_KEY, merged);
}

function normalizeBest(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const score = Number(raw.score);
  if (!Number.isFinite(score) || score <= 0) return null;
  return {
    score: clamp(Math.round(score), 0, 100),
    smile: clamp(Math.round(Number(raw.smile) || 0), 0, 100),
    whiteness: clamp(Math.round(Number(raw.whiteness) || 0), 0, 100),
    alignment: clamp(Math.round(Number(raw.alignment) || 0), 0, 100),
    at: Number.isFinite(raw.at) ? raw.at : Date.now()
  };
}

export function loadBest() {
  return normalizeBest(readJSON(BEST_KEY, null));
}

export function saveBest(candidate) {
  const next = normalizeBest(candidate);
  if (!next) return { best: loadBest(), record: false };
  const current = loadBest();
  if (current && current.score >= next.score) return { best: current, record: false };
  writeJSON(BEST_KEY, next);
  return { best: next, record: true };
}

export function clearBest() {
  try {
    localStorage.removeItem(BEST_KEY);
  } catch {
    /* ignore */
  }
  return null;
}
