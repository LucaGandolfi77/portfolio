/* Court Clash — versioned local storage */

const KEY = 'pf.courtclash.v1';
const VERSION = 1;

export function defaults() {
  return {
    version: VERSION,
    wallet: {
      coins: 1000,
      dailyClaimed: '',
      comebackClaimed: ''
    },
    collection: {},
    chests: {
      slots: [],
      pity: 0,
      opened: 0,
      tutorialGiven: false
    },
    setsClaimed: {},
    streak: 0,
    bestStreak: 0,
    wins: 0,
    losses: 0,
    history: [],
    settings: {
      lang: 'en',
      sound: true,
      onboarded: false
    },
    matchup: null
  };
}

function merge(base, saved) {
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    wallet: { ...base.wallet, ...(saved.wallet || {}) },
    chests: { ...base.chests, ...(saved.chests || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
    collection: saved.collection && typeof saved.collection === 'object' ? saved.collection : {},
    setsClaimed: saved.setsClaimed && typeof saved.setsClaimed === 'object' ? saved.setsClaimed : {},
    history: Array.isArray(saved.history) ? saved.history.slice(0, 30) : []
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== VERSION) return defaults();
    return merge(defaults(), parsed);
  } catch (e) {
    return defaults();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    return false;
  }
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch (e) { /* ignore */ }
  return defaults();
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function recordHistory(state, entry) {
  state.history = state.history || [];
  state.history.unshift({ t: Date.now(), ...entry });
  if (state.history.length > 20) state.history.length = 20;
}
