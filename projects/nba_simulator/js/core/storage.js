/* Versioned, crash-proof storage with migration from legacy NBA keys */

const KEY = 'pf.nba.v3';
const PREVIOUS = 'pf.nba.v2';
const LEGACY = 'nba.sim.v1';

export function defaults() {
  return {
    version: 3,
    settings: { lang: 'en', sound: true, quality: 'high', reducedFx: false, onboarded: false },
    league: null,
    playoffs: null,
    history: [],
    replays: [],
    playerStats: {},
    predictions: { total: 0, correct: 0, points: 0 },
    customTeams: [],
    matchup: { home: 'BOS', away: 'LAL', prediction: 'home' },
    career: {
      year: 2026, xp: 0, level: 1, badges: [], role: 'GM', record: { w: 0, l: 0 },
      collection: [], chests: 0, streak: 0, wins: 0, guesses: 0, lastChest: null,
      fragments: 0, upgrades: {}, dailyChest: null,
      credits: 1000, bets: [], pity: 0, pullHistory: [], duplicates: {}, dailyCredits: null,
      chestQueue: [], copies: {}, cards: {},
      deck: [], squad: { template: 'balanced', starters: [], bench: [] },
      clubLeague: null, clubCup: null, wildcards: {}, cardStats: {}, challengesDone: []
    },
    daily: { last: '', wins: 0, games: 0, correct: 0 }
  };
}

function migrate(raw, version) {
  const d = defaults();
  try {
    const old = JSON.parse(raw);
    if (!old || typeof old !== 'object') return d;
    const merged = { ...d, ...old, version: 3 };
    merged.settings = { ...d.settings, ...(old.settings || {}) };
    merged.matchup = { ...d.matchup, ...(old.matchup || {}) };
    merged.career = { ...d.career, ...(old.career || {}) };
    merged.predictions = { ...d.predictions, ...(old.predictions || {}) };
    merged.playerStats = version === 1 ? {} : (old.playerStats || {});
    merged.history = (old.history || []).slice(0, version === 1 ? 20 : 40);
    if (version === 1) {
      merged.settings.lang = old.settings && old.settings.lang === 'it' ? 'it' : 'en';
    }
    return merged;
  } catch (e) { return d; }
}

export function load() {
  try {
    for (const [key, version] of [[KEY, 3], [PREVIOUS, 2], [LEGACY, 1]]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      if (version === 3) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 3) {
          const base = defaults();
          return { ...base, ...parsed, career: { ...base.career, ...(parsed.career || {}) } };
        }
      }
      const migrated = migrate(raw, version);
      save(migrated);
      return migrated;
    }
  } catch (e) { /* ignore */ }
  return defaults();
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { return false; }
}

export function appendHistory(state, entry) {
  state.history.unshift({ t: Date.now(), ...entry });
  if (state.history.length > 40) state.history.length = 40;
}

export function recordPrediction(state, pick, winner) {
  state.predictions.total += 1;
  if (pick === winner) {
    state.predictions.correct += 1;
    state.predictions.points += 10;
    return true;
  }
  return false;
}

export function grantXP(state, amount, reason) {
  state.career.xp += amount;
  state.career.level = 1 + Math.floor(Math.sqrt(state.career.xp / 120));
  return reason;
}

const TOTALS = ['pts', 'reb', 'ast', 'stl', 'blk', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'to', 'pf', 'minutes'];

export function recordPlayerStats(state, players) {
  const store = state.playerStats || (state.playerStats = {});
  for (const p of players || []) {
    if (!p.id) continue;
    const row = store[p.id] || (store[p.id] = { games: 0 });
    row.games += 1;
    for (const key of TOTALS) {
      const value = key === 'reb' ? (p.orb || 0) + (p.drb || 0) : (p[key] || 0);
      row[key] = Math.round(((row[key] || 0) + value) * 10) / 10;
    }
  }
  return store;
}
