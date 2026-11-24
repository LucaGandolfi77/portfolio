/* Streaming — versioned preferences, favorites, history and queue */
const KEY = 'pf.streaming.save.v1';

function defaults() {
  return {
    settings: { lang: 'en', sort: 'week desc', publicDomain: false, theme: 'dark', volume: 0.8, speed: 1 },
    favorites: [], history: [], queue: [], positions: {}, cache: {}
  };
}
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}, d = defaults();
    const arr = (v, n) => Array.isArray(v) ? v.slice(0, n) : [];
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      favorites: arr(p.favorites, 60), history: arr(p.history, 60), queue: arr(p.queue, 30),
      positions: p.positions || {}, cache: p.cache || {}
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function isFavorite(id) { return profile.favorites.some(x => x.id === id); }
export function toggleFavorite(item) {
  const i = profile.favorites.findIndex(x => x.id === item.id);
  if (i >= 0) { profile.favorites.splice(i, 1); save(); return false; }
  profile.favorites.unshift({ ...item, t: Date.now() });
  profile.favorites = profile.favorites.slice(0, 60); save(); return true;
}
export function addHistory(item) {
  profile.history = profile.history.filter(x => x.id !== item.id);
  profile.history.unshift({ ...item, t: Date.now() });
  profile.history = profile.history.slice(0, 60); save();
}
export function clearHistory() { profile.history = []; save(); }
export function clearFavorites() { profile.favorites = []; save(); }
export function queueAdd(item) {
  if (profile.queue.some(x => x.id === item.id)) return false;
  profile.queue.push({ ...item }); save(); return true;
}
export function queueRemove(id) { profile.queue = profile.queue.filter(x => x.id !== id); save(); }
export function queueClear() { profile.queue = []; save(); }
export function setPosition(id, seconds) { profile.positions[id] = { seconds, t: Date.now() }; save(); }
export function getPosition(id) { return profile.positions[id]?.seconds || 0; }
export function cachePut(key, data, now = Date.now()) {
  profile.cache[key] = { data, at: now };
  save();
}
export function cacheGet(key, ttl = 10 * 60 * 1000, now = Date.now()) {
  const hit = profile.cache[key];
  if (!hit) return null;
  if (now - hit.at > ttl) return null;
  return hit.data;
}
