/* Arena Royale 2 — settings and persistent stats with validation */

import { BOT_COUNT } from './config.js';

const STATS_KEY = 'ar2.stats.v1';
const SOUND_KEY = 'ar2.sound.v1';
const LANG_KEY = 'ar2.lang.v1';

function read(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
}
const num = (v, d, min = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, n) : d;
};

const rawStats = read(STATS_KEY, {});
export const stats = {
  matches: num(rawStats.matches, 0),
  wins: num(rawStats.wins, 0),
  kills: num(rawStats.kills, 0),
  bestPlace: num(rawStats.bestPlace, BOT_COUNT + 1, 1),
  maxStreak: num(rawStats.maxStreak, 0)
};

export function saveStats() { write(STATS_KEY, stats); }

export function recordMatch({ place, kills, won }) {
  stats.matches++;
  stats.kills += kills;
  if (won) stats.wins++;
  if (place < stats.bestPlace) stats.bestPlace = place;
  saveStats();
}

let soundOn = read(SOUND_KEY, true);
if (typeof soundOn !== 'boolean') soundOn = true;
let lang = read(LANG_KEY, 'it');
if (lang !== 'en' && lang !== 'it') {
  try { lang = (localStorage.getItem('site_lang') || 'it').slice(0, 2) === 'en' ? 'en' : 'it'; }
  catch (e) { lang = 'it'; }
}

export function getSound() { return soundOn; }
export function setSound(value) { soundOn = !!value; write(SOUND_KEY, soundOn); }
export function getLang() { return lang; }
export function setLang(value) { lang = value === 'en' ? 'en' : 'it'; write(LANG_KEY, lang); }
