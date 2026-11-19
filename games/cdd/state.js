/* CDD RUN — persistent record, settings and session stats */

const KEYS = {
  score: 'cddHighScore',
  muted: 'cddMuted',
  lang: 'cddLang',
  stats: 'cddStats'
};

function read(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; }
  catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, String(value)); } catch (e) { /* ignore */ }
}
function readJson(key, fallback) {
  try { return JSON.parse(read(key, 'null')) || fallback; }
  catch (e) { return fallback; }
}
function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const storedStats = readJson(KEYS.stats, {});

export const meta = {
  highScore: num(read(KEYS.score, 0)),
  muted: read(KEYS.muted, '0') === '1',
  lang: read(KEYS.lang, 'it') === 'en' ? 'en' : 'it',
  stats: {
    runs: num(storedStats.runs),
    totalCoins: num(storedStats.totalCoins),
    totalDistance: num(storedStats.totalDistance),
    bestCombo: num(storedStats.bestCombo),
    nearMisses: num(storedStats.nearMisses)
  }
};

export function setHighScore(score) {
  if (score <= meta.highScore) return false;
  meta.highScore = Math.floor(score);
  write(KEYS.score, meta.highScore);
  return true;
}

export function setMuted(muted) {
  meta.muted = !!muted;
  write(KEYS.muted, meta.muted ? '1' : '0');
}

export function setLang(lang) {
  meta.lang = lang === 'en' ? 'en' : 'it';
  write(KEYS.lang, meta.lang);
}

export function saveSession(session) {
  const s = meta.stats;
  s.runs++;
  s.totalCoins += session.coins;
  s.totalDistance += session.distance;
  s.nearMisses += session.nearMisses;
  s.bestCombo = Math.max(s.bestCombo, session.maxCombo);
  write(KEYS.stats, JSON.stringify(s));
}
