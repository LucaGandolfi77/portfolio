/* Sky Ace — persistent pilot record */

const KEY = 'skyace.save.v1';

const defaults = {
  lang: (() => { try { return localStorage.getItem('lang') || 'en'; } catch (e) { return 'en'; } })(),
  difficulty: 'medium',
  sound: true,
  best: 0,
  bestByDifficulty: { easy: 0, medium: 0, hard: 0 },
  highLevel: 1,
  runs: 0,
  wins: 0,
  totalKills: 0,
  totalShots: 0,
  totalHits: 0,
  lastPlayed: 0
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    return {
      ...defaults,
      ...parsed,
      bestByDifficulty: { ...defaults.bestByDifficulty, ...(parsed.bestByDifficulty || {}) }
    };
  } catch (e) {
    return { ...defaults };
  }
}

export const state = read();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
}

export function setLang(lang) {
  state.lang = lang === 'it' ? 'it' : 'en';
  try {
    localStorage.setItem('lang', state.lang);
    localStorage.setItem('site_lang', state.lang);
  } catch (e) { /* ignore */ }
  save();
}

export function recordRun({ score, difficulty, level, kills, shots, hits, won }) {
  state.runs += 1;
  state.totalKills += kills;
  state.totalShots += shots;
  state.totalHits += hits;
  state.highLevel = Math.max(state.highLevel, level);
  if (won) state.wins += 1;
  const isRecord = score > (state.bestByDifficulty[difficulty] || 0);
  if (isRecord) state.bestByDifficulty[difficulty] = score;
  if (score > state.best) state.best = score;
  state.lastPlayed = Date.now();
  save();
  return isRecord;
}

export function accuracy() {
  return state.totalShots ? Math.round((state.totalHits / state.totalShots) * 100) : 0;
}
