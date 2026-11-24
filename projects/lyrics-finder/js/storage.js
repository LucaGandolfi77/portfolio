/* Reverse Lyrics Finder — versioned local storage, recents, favorites and API cache */
import { CACHE_LIMIT } from './config.js';

export const SETTINGS_KEY = 'pf.lyrics.settings';
export const RECENT_KEY = 'pf.lyrics.recent';
export const FAVS_KEY = 'pf.lyrics.favs';
export const CACHE_KEY = 'pf.lyrics.cache';

export const DEFAULT_SETTINGS = Object.freeze({ country: 'it', limit: 20, exact: false });
const recentLimit = 20;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value == null ? fallback : value;
  } catch (e) { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}

export function loadSettings() { return { ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) }; }
export function saveSettings(s) { return write(SETTINGS_KEY, { ...loadSettings(), ...s }); }

export function loadRecent() {
  const list = read(RECENT_KEY, []);
  return Array.isArray(list) ? list.slice(0, recentLimit) : [];
}
export function addRecent(query) {
  const q = String(query || '').trim();
  if (!q) return loadRecent();
  const list = loadRecent().filter(x => x.toLowerCase() !== q.toLowerCase());
  list.unshift(q);
  const out = list.slice(0, recentLimit);
  write(RECENT_KEY, out);
  return out;
}
export function clearRecent() { write(RECENT_KEY, []); }

export function loadFavorites() {
  const list = read(FAVS_KEY, []);
  return Array.isArray(list) ? list : [];
}
export function isFavorite(id) { return loadFavorites().some(f => f.trackId === id); }
export function toggleFavorite(track) {
  const list = loadFavorites();
  const idx = list.findIndex(f => f.trackId === track.trackId);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift({ trackId: track.trackId, name: track.trackName, artist: track.artistName,
    art: track.artworkUrl100, preview: track.previewUrl, url: track.trackViewUrl });
  write(FAVS_KEY, list.slice(0, 60));
  return idx < 0;
}

export function loadCache() { return read(CACHE_KEY, {}); }
export function saveCache(cache) { return write(CACHE_KEY, cache); }
export function putCache(cache, key, data, now = Date.now()) {
  const next = { ...cache, [key]: { data, fetchedAt: now } };
  const entries = Object.entries(next).sort((a, b) => b[1].fetchedAt - a[1].fetchedAt).slice(0, CACHE_LIMIT);
  const out = Object.fromEntries(entries);
  saveCache(out);
  return out;
}
export function getCache(cache, key, ttl, now = Date.now()) {
  const hit = cache[key];
  if (!hit) return null;
  if (now - hit.fetchedAt > ttl) return { data: hit.data, stale: true, fetchedAt: hit.fetchedAt };
  return { data: hit.data, stale: false, fetchedAt: hit.fetchedAt };
}
export function clearCache() { write(CACHE_KEY, {}); }
