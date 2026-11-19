/* Precision Skating — persistent records, standings and settings */

const KEY = 'precision_skating_v2';

export function defaultState() {
  return {
    v: 2,
    lang: 'it',
    difficulty: 'medium',
    sound: true,
    reduceMotion: false,
    best: { practice: 0, championship: 0 },
    bestByDifficulty: { easy: 0, medium: 0, hard: 0 },
    stats: { routines: 0, perfects: 0, corrections: 0, drifts: 0, wins: 0 },
    championship: { round: 0, points: 0, history: [] },
    standings: []
  };
}

function num(v, d = 0) { const n = Number(v); return Number.isFinite(n) ? n : d; }

function normalize(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const data = { ...base, ...raw };
  data.v = 2;
  data.lang = data.lang === 'en' ? 'en' : 'it';
  data.difficulty = ['easy','medium','hard'].includes(data.difficulty) ? data.difficulty : 'medium';
  data.sound = !!data.sound;
  data.reduceMotion = !!data.reduceMotion;
  data.best = { ...base.best, ...(data.best || {}) };
  data.bestByDifficulty = { ...base.bestByDifficulty, ...(data.bestByDifficulty || {}) };
  ['practice','championship'].forEach(k => { data.best[k] = num(data.best[k]); });
  ['easy','medium','hard'].forEach(k => { data.bestByDifficulty[k] = num(data.bestByDifficulty[k]); });
  data.stats = { ...base.stats, ...(data.stats || {}) };
  Object.keys(base.stats).forEach(k => { data.stats[k] = num(data.stats[k]); });
  data.championship = { ...base.championship, ...(data.championship || {}) };
  data.championship.round = Math.max(0, Math.min(4, num(data.championship.round)));
  data.championship.points = num(data.championship.points);
  data.championship.history = Array.isArray(data.championship.history) ? data.championship.history : [];
  data.standings = Array.isArray(data.standings) ? data.standings : [];
  return data;
}

let loaded = null;
try {
  const raw = localStorage.getItem(KEY);
  loaded = raw ? JSON.parse(raw) : null;
} catch (e) { loaded = null; }

export const state = normalize(loaded);

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export function recordRoutine(mode, difficulty, total, details) {
  state.stats.routines++;
  state.stats.perfects += details.perfects || 0;
  state.stats.corrections += details.corrections || 0;
  state.stats.drifts += details.drifts || 0;
  const key = mode === 'championship' ? 'championship' : 'practice';
  state.best[key] = Math.max(state.best[key], total);
  state.bestByDifficulty[difficulty] = Math.max(state.bestByDifficulty[difficulty] || 0, total);
  save();
}

export function reset() {
  Object.assign(state, defaultState());
  save();
}
