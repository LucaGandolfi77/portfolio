/* Pure persistent progression — unlocks, stars and records */
import { VERSION, KARTS, TRACKS, MODES } from '../config.js';

export function initialProfile() {
  return {
    version:VERSION, stars:0, races:0, wins:0,
    records:{}, unlockedKarts:['spark','comet'], unlockedTracks:['meadow','desert'], unlockedModes:['grandprix','time'],
    lastKart:'spark', lastTrack:'meadow', lastMode:'grandprix',
    settings:{ sound:true, vibration:true, quality:'high', reducedMotion:false, theme:'dark' }
  };
}
export function normalizeProfile(raw) {
  const base = initialProfile();
  if (!raw || raw.version !== VERSION) return base;
  const p = { ...base, ...raw };
  p.records = raw.records && typeof raw.records === 'object' ? raw.records : {};
  ['unlockedKarts','unlockedTracks','unlockedModes'].forEach(key => {
    p[key] = Array.isArray(raw[key]) && raw[key].length ? raw[key] : base[key];
  });
  p.settings = { ...base.settings, ...(raw.settings || {}) };
  p.stars = Math.max(0, Number(p.stars) || 0);
  return p;
}
export function isUnlocked(profile, type, id) {
  const key = { kart:'unlockedKarts', track:'unlockedTracks', mode:'unlockedModes' }[type];
  return !!profile[key]?.includes(id);
}
export function available(profile, type) {
  const list = { kart:KARTS, track:TRACKS, mode:MODES }[type];
  return list.filter(item => isUnlocked(profile, type, item.id));
}
export function recordRace(profile, result) {
  const p = JSON.parse(JSON.stringify(profile));
  p.races++;
  let gained = 0;
  if (result.won) { p.wins++; gained = 3; }
  else if (result.place <= 3) gained = 2;
  else gained = 1;
  if (result.isBest) gained += 2;
  p.stars += gained;

  const key = result.trackId + ':' + result.modeId;
  if (result.time && (!p.records[key] || result.time < p.records[key])) p.records[key] = result.time;

  const unlocked = [];
  KARTS.forEach(k => {
    if (!p.unlockedKarts.includes(k.id) && p.stars >= k.stars) { p.unlockedKarts.push(k.id); unlocked.push(k.en); }
  });
  TRACKS.forEach(t => {
    if (!p.unlockedTracks.includes(t.id) && p.stars >= t.stars) { p.unlockedTracks.push(t.id); unlocked.push(t.en); }
  });
  MODES.forEach(m => {
    if (!p.unlockedModes.includes(m.id) && p.stars >= m.stars) { p.unlockedModes.push(m.id); unlocked.push(m.en); }
  });
  return { profile:p, gained, unlocked };
}
export function bestTime(profile, trackId, modeId) { return profile.records[trackId + ':' + modeId] || null; }
