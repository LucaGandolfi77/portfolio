/* DITTOPIA — persistent save with versioned schema */

const KEY = 'dittopia_v2';

export const state = {
  v: 2,
  time: 8 * 60,
  settings: { gb: false, sound: true, lang: 'it', quality: 'high' },
  quest: { current: 'q1', flags: {}, rewardGiven: {} },
  player: {
    x: 12, y: 14, dir: 'D', skin: [232,184,148], hair: [60,40,30], shirt: [60,90,150],
    inv: {}, moves: { base: true }, curMove: 'base', placeSel: null
  },
  dex: {},
  stats: { crafted: 0, caught: 0, steps: 0, photos: 0, playtime: 0 },
  achievements: {},
  checkpoint: null,
  frame: 0
};

export function freshState() {
  return {
    v: 2,
    time: 8 * 60,
    settings: { gb: false, sound: true, lang: 'it', quality: 'high' },
    quest: { current: 'q1', flags: {}, rewardGiven: {} },
    player: {
      x: 12, y: 14, dir: 'D', skin: [232,184,148], hair: [60,40,30], shirt: [60,90,150],
      inv: {}, moves: { base: true }, curMove: 'base', placeSel: null
    },
    dex: {},
    stats: { crafted: 0, caught: 0, steps: 0, photos: 0, playtime: 0 },
    achievements: {},
    checkpoint: null
  };
}

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

function normalize(raw) {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const data = { ...base, ...raw };
  data.v = 2;
  data.time = num(data.time, 480);
  data.settings = { ...base.settings, ...(data.settings || {}) };
  data.quest = { ...base.quest, ...(data.quest || {}) };
  data.player = { ...base.player, ...(data.player || {}) };
  data.player.inv = data.player.inv && typeof data.player.inv === 'object' ? data.player.inv : {};
  data.player.moves = data.player.moves && typeof data.player.moves === 'object' ? data.player.moves : { base: true };
  data.dex = data.dex && typeof data.dex === 'object' ? data.dex : {};
  data.stats = { ...base.stats, ...(data.stats || {}) };
  data.achievements = data.achievements && typeof data.achievements === 'object' ? data.achievements : {};
  return data;
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
}

export function saveState(state, world, pokemon) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      state: normalize(state),
      world: world ? world.serialize() : null,
      pokemon: pokemon ? pokemon.serialize() : null
    }));
  } catch (e) { /* storage full */ }
}

export function loadInto(state) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    Object.assign(state, normalize(parsed.state));
    return parsed;
  } catch (e) { return null; }
}

export function exportB64() {
  try { return btoa(unescape(encodeURIComponent(localStorage.getItem(KEY) || ''))); }
  catch (e) { return ''; }
}

export function importB64(value) {
  try {
    const decoded = decodeURIComponent(escape(atob(value)));
    JSON.parse(decoded);
    localStorage.setItem(KEY, decoded);
    return true;
  } catch (e) { return false; }
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}
