/* GEOM DASH — persistent progression, settings and ghost runs */

import { CHAPTERS, ACHIEVEMENTS } from './config.js';

const KEY = 'geom_dash_v2';

function defaults() {
  return {
    v: 2,
    best: { endless: 0, daily: 0, levels: CHAPTERS.map(() => 0) },
    attempts: { endless: 0, daily: 0, levels:CHAPTERS.map(() => 0) },
    wins: CHAPTERS.map(() => false),
    totalNear: 0,
    settings: { sound: true, skin: 'neon', difficulty: 'normal', reduceMotion: false, chapter: 0 },
    achievements: {},
    ghost: { endless: null, daily: null, levels: CHAPTERS.map(() => null) }
  };
}

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : d;
};

function normalize(raw) {
  const base = defaults();
  if (!raw || typeof raw !== 'object') return base;
  const data = { ...base, ...raw };
  data.v = 2;
  data.best = { ...base.best, ...(data.best || {}) };
  data.best.endless = num(data.best.endless);
  data.best.daily = num(data.best.daily);
  data.best.levels = CHAPTERS.map((_, i) => num(data.best.levels?.[i]));
  data.attempts = { ...base.attempts, ...(data.attempts || {}) };
  data.attempts.endless = num(data.attempts.endless);
  data.attempts.daily = num(data.attempts.daily);
  data.attempts.levels = CHAPTERS.map((_, i) => num(data.attempts.levels?.[i]));
  data.wins = CHAPTERS.map((_, i) => !!data.wins?.[i]);
  data.totalNear = num(data.totalNear);
  data.settings = { ...base.settings, ...(data.settings || {}) };
  data.settings.sound = !!data.settings.sound;
  data.settings.reduceMotion = !!data.settings.reduceMotion;
  data.settings.chapter = Math.max(0, Math.min(CHAPTERS.length - 1, num(data.settings.chapter)));
  data.achievements = data.achievements && typeof data.achievements === 'object' ? data.achievements : {};
  data.ghost = { ...base.ghost, ...(data.ghost || {}) };
  data.ghost.levels = CHAPTERS.map((_, i) => data.ghost.levels?.[i] || null);
  return data;
}

let loaded = null;
try {
  const raw = localStorage.getItem(KEY);
  loaded = raw ? JSON.parse(raw) : null;
} catch (e) { loaded = null; }

if (!loaded) {
  try {
    const best = Number(localStorage.getItem('geom_dash_bestScore')) || 0;
    if (best) {
      const fresh = defaults();
      fresh.best.endless = best;
      loaded = fresh;
    }
  } catch (e) { /* ignore */ }
}

export const state = normalize(loaded);

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full */ }
}

export function setSetting(key, value) {
  state.settings[key] = value;
  save();
}

export function getBest(mode, chapter = 0) {
  if (mode === 'level') return state.best.levels[chapter] || 0;
  return state.best[mode] || 0;
}

export function recordRun(mode, chapter, { score, won, near, flow }) {
  if (mode === 'level') {
    state.attempts.levels[chapter]++;
    if (score > state.best.levels[chapter]) state.best.levels[chapter] = score;
    if (won) state.wins[chapter] = true;
  } else {
    state.attempts[mode]++;
    if (score > state.best[mode]) state.best[mode] = score;
  }
  state.totalNear += near || 0;
  unlock('near10', state.totalNear >= 10);
  unlock('firstJump', true);
  unlock('flow50', (flow || 0) >= 50);
  unlock('flowFull', (flow || 0) >= 100);
  unlock('winLevel', mode === 'level' && won);
  unlock('daily', mode === 'daily');
  if (state.wins.every(Boolean)) unlock('allChapters', true);
  save();
}

export function unlock(id, condition) {
  if (!condition || state.achievements[id]) return false;
  state.achievements[id] = Date.now();
  save();
  return true;
}

export function getGhost(mode, chapter = 0) {
  if (mode === 'level') return state.ghost.levels[chapter];
  return state.ghost[mode];
}

export function saveGhost(mode, chapter, frames) {
  if (!frames || frames.length < 2) return;
  if (mode === 'level') state.ghost.levels[chapter] = frames;
  else state.ghost[mode] = frames;
  save();
}

export function resetAll() {
  const settings = state.settings;
  Object.assign(state, defaults());
  state.settings = settings;
  save();
}

export function achievementList() { return ACHIEVEMENTS; }
