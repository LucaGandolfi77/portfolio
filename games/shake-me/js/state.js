/* Shake Me — save game (pure) */

export const SAVE_KEY = 'shake-me-v1';
export const SETTINGS_KEY = 'shake-me-settings';

export function newState() {
  return {
    v: 1,
    nights: {},      // evening index → stars (0 = played, not passed)
    nightBest: {},   // evening index → best average
    best: {},        // recipe id → best score
    made: {},        // recipe id → times served
    daily: {},       // seed → best total
    memory: 0,       // best streak in "by heart"
    stats: { served: 0, perfect: 0 },
  };
}

const num = (v, d = 0) => (Number.isFinite(v) && v >= 0 ? v : d);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const copyNums = (from, max = Infinity) => Object.fromEntries(Object.entries(obj(from)).filter(([, v]) => Number.isFinite(v) && v >= 0).map(([k, v]) => [k, Math.min(max, v)]));

export function hydrate(raw) {
  const s = newState();
  if (!raw || typeof raw !== 'object') return s;
  s.nights = copyNums(raw.nights, 3);
  s.nightBest = copyNums(raw.nightBest, 100);
  s.best = copyNums(raw.best, 100);
  s.made = copyNums(raw.made);
  s.daily = copyNums(raw.daily, 300);
  s.memory = num(raw.memory);
  for (const k of Object.keys(s.stats)) s.stats[k] = num(obj(raw.stats)[k]);
  return s;
}

/** A drink was served. Returns what is new about it. */
export function recordServe(state, id, score) {
  const first = !state.made[id];
  const newBest = score > (state.best[id] ?? -1);
  state.made[id] = (state.made[id] || 0) + 1;
  if (newBest) state.best[id] = score;
  state.stats.served++;
  if (score === 100) state.stats.perfect++;
  return { first, newBest };
}

export function finishNight(state, night, result) {
  const before = state.nights[night] || 0;
  state.nights[night] = Math.max(before, result.stars);
  state.nightBest[night] = Math.max(state.nightBest[night] || 0, result.avg);
  return { improved: result.stars > before };
}

export function finishDaily(state, seed, total) {
  const key = String(seed);
  const better = total > (state.daily[key] ?? -1);
  if (better) state.daily[key] = total;
  return better;
}

export const madeIds = (state) => Object.keys(state.made);
export const totalStars = (state) => Object.values(state.nights).reduce((a, b) => a + b, 0);
