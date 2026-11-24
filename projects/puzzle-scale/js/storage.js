/* Scale Puzzle — versioned persistence, records, stars and achievements */
const KEY = 'pf.puzzle-scale.save.v1';

function defaults() {
  return {
    settings: { mode: 'classic', difficulty: 'normal', sound: true },
    best: {}, stars: {}, unlocked: [1],
    stats: { score: 0, played: 0, wins: 0, moves: 0, hits: 0, misses: 0 },
    achievements: {}, lastLevel: 1
  };
}
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}, d = defaults();
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      best: p.best || {}, stars: p.stars || {},
      unlocked: Array.isArray(p.unlocked) && p.unlocked.length ? p.unlocked : [1],
      stats: { ...d.stats, ...(p.stats || {}) },
      achievements: p.achievements || {}, lastLevel: p.lastLevel || 1
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function unlock(level) {
  if (level > profile.unlocked.length + 1) return;
  while (profile.unlocked.length < level) profile.unlocked.push(profile.unlocked.length + 1);
  save();
}
export function setStars(level, stars) {
  if ((profile.stars[level] || 0) < stars) { profile.stars[level] = stars; unlock(level + 1); save(); }
}
export function setBest(mode, score) {
  if (score > (profile.best[mode] || 0)) { profile.best[mode] = score; save(); }
}
export function addStats(patch) {
  Object.entries(patch).forEach(([k, v]) => { profile.stats[k] = (profile.stats[k] || 0) + v; });
  save();
}
export function achievement(id) {
  if (profile.achievements[id]) return false;
  profile.achievements[id] = Date.now(); save(); return true;
}
export function resetAll() { profile = defaults(); save(); return profile; }
