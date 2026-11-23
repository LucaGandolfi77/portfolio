/* Versioned, crash-proof storage with migration from the legacy key */

const KEY = 'pf.nba.v2';
const LEGACY = 'nba.sim.v1';

export function defaults() {
  return {
    version: 2,
    settings: { lang: 'en', sound: true, quality: 'high', reducedFx: false },
    league: null,
    playoffs: null,
    history: [],
    predictions: { total: 0, correct: 0, points: 0 },
    customTeams: [],
    matchup: { home: 'BOS', away: 'LAL', prediction: 'home' },
    career: { year: 2026, xp: 0, level: 1, badges: [], role: 'GM', record: { w: 0, l: 0 } },
    daily: { last: '', wins: 0 }
  };
}

function legacyMigrate(raw) {
  try {
    const old = JSON.parse(raw);
    if (!old || old.version !== 1) return defaults();
    const d = defaults();
    d.settings.lang = old.settings && old.settings.lang === 'it' ? 'it' : 'en';
    d.settings.sound = old.settings ? !!old.settings.sound : true;
    d.predictions = old.predictions || d.predictions;
    d.customTeams = old.customTeams || [];
    d.history = (old.history || []).slice(0, 20);
    return d;
  } catch (e) { return defaults(); }
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 2) return { ...defaults(), ...parsed };
    }
    const legacy = localStorage.getItem(LEGACY);
    if (legacy) {
      const migrated = legacyMigrate(legacy);
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
