/* Game Kit — versioned, crash-proof localStorage */

export function load(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...defaults };
    return { ...defaults, ...parsed };
  } catch (e) {
    return { ...defaults };
  }
}

export function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}

export function appendLog(state, entry, limit = 30) {
  state.log = state.log || [];
  state.log.unshift({ t: Date.now(), ...entry });
  if (state.log.length > limit) state.log.length = limit;
}

export function best(state, field, value) {
  if (value > (state[field] || 0)) { state[field] = value; return true; }
  return false;
}
