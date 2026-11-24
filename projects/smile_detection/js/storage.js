/** storage.js — record personale e impostazioni. */

const KEY = 'smiledet.v1';
const DEFAULTS = { best: null, snapshots: 0 };

export function loadState() {
  try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || '{}') || {}) }; }
  catch (e) { return { ...DEFAULTS }; }
}
export function saveState(patch) {
  const next = { ...loadState(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
  return next;
}
export function updateBest(score, details) {
  const state = loadState();
  if (state.best && state.best.score >= score) return state;
  return saveState({ best: { score: Math.round(score), ...details, ts: Date.now() } });
}
