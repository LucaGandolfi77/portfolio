/* Court Clash — versioned local storage with v1 → v2 migration */

const KEY = 'pf.courtclash.v2';
const PREVIOUS = 'pf.courtclash.v1';
const VERSION = 2;

export function defaults() {
  return {
    version: VERSION,
    wallet: {
      coins: 1000,
      dailyClaimed: '',
      comebackClaimed: ''
    },
    login: { day: 0, last: '' },
    collection: {},
    chests: {
      slots: [],
      pity: 0,
      opened: 0,
      tutorialGiven: false
    },
    lineup: { slots: [null, null, null, null, null] },
    setsClaimed: {},
    trophies: 0,
    wildcards: { common: 0, rare: 0, epic: 0, legendary: 0 },
    missions: { daily: null, weekly: null },
    achievements: { unlocked: [] },
    trophyRoadClaimed: [],
    lab: { date: '', offers: [] },
    dailyChallenge: { date: '', done: false },
    tournament: { active: false, step: 0 },
    stats: {
      matches: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      bestStreak: 0,
      chestsOpened: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      cashOuts: 0,
      tournamentsWon: 0,
      underdogWins: 0,
      upgrades: 0,
      bestChest: null,
      favoriteTeam: null,
      teamCounts: {}
    },
    history: [],
    settings: {
      lang: 'en',
      sound: true,
      onboarded: false,
      tutorialDismissed: false
    },
    matchup: null
  };
}

function migrateV1(old) {
  const base = defaults();
  if (!old || typeof old !== 'object') return base;
  const wins = old.wins || old.stats?.wins || 0;
  const losses = old.losses || old.stats?.losses || 0;
  return {
    ...base,
    wallet: {
      ...base.wallet,
      coins: old.wallet?.coins ?? 1000,
      dailyClaimed: old.wallet?.dailyClaimed || '',
      comebackClaimed: old.wallet?.comebackClaimed || ''
    },
    collection: old.collection && typeof old.collection === 'object' ? old.collection : {},
    chests: { ...base.chests, ...(old.chests || {}) },
    setsClaimed: old.setsClaimed || {},
    lineup: base.lineup,
    stats: {
      ...base.stats,
      matches: wins + losses,
      wins,
      losses,
      streak: old.streak || 0,
      bestStreak: old.bestStreak || 0,
      chestsOpened: old.chests?.opened || 0
    },
    history: Array.isArray(old.history) ? old.history.slice(0, 30) : [],
    settings: { ...base.settings, ...(old.settings || {}) },
    matchup: old.matchup || null
  };
}

function merge(base, saved) {
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    wallet: { ...base.wallet, ...(saved.wallet || {}) },
    login: { ...base.login, ...(saved.login || {}) },
    chests: { ...base.chests, ...(saved.chests || {}) },
    lineup: { ...base.lineup, ...(saved.lineup || {}) },
    wildcards: { ...base.wildcards, ...(saved.wildcards || {}) },
    missions: { ...base.missions, ...(saved.missions || {}) },
    achievements: { ...base.achievements, ...(saved.achievements || {}) },
    lab: { ...base.lab, ...(saved.lab || {}) },
    dailyChallenge: { ...base.dailyChallenge, ...(saved.dailyChallenge || {}) },
    tournament: { ...base.tournament, ...(saved.tournament || {}) },
    stats: { ...base.stats, ...(saved.stats || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
    collection: saved.collection && typeof saved.collection === 'object' ? saved.collection : {},
    setsClaimed: saved.setsClaimed && typeof saved.setsClaimed === 'object' ? saved.setsClaimed : {},
    trophyRoadClaimed: Array.isArray(saved.trophyRoadClaimed) ? saved.trophyRoadClaimed : [],
    history: Array.isArray(saved.history) ? saved.history.slice(0, 30) : []
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === VERSION) return merge(defaults(), parsed);
    }
    const oldRaw = localStorage.getItem(PREVIOUS);
    if (oldRaw) {
      const old = JSON.parse(oldRaw);
      const migrated = migrateV1(old);
      save(migrated);
      return migrated;
    }
  } catch (e) {
    return defaults();
  }
  return defaults();
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
    localStorage.removeItem(PREVIOUS);
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
  if (state.history.length > 30) state.history.length = 30;
}
