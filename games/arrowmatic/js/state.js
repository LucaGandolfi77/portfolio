/* Arrowmatic — persisted save (v2), validation and shared runtime state */

import { WEAPONS, HEROES } from './data.js';

const SKEY = 'arrowmatic_save';
const VERSION = 2;

export function defaultSave() {
  return {
    v: VERSION, coins: 0, runs: 0, kills: 0, bestLv: 0,
    upg: { atk: 0, hp: 0, spd: 0, crit: 0, greed: 0 },
    heroes: { owned: ['arcibaldo'], sel: 'arcibaldo' },
    weapons: { owned: ['bow'], sel: 'bow' },
    accs: { owned: [], eq: [] },
    auto: { unlocked: false, on: false },
    mute: false,
    onboarded: false,
    settings: { reduceMotion: false, haptics: true },
    daily: { last: '', streak: 0, claimed: '' },
    missions: { date: '', progress: {}, claimed: [] },
    achievements: {},
    achCounters: { bosses: 0 }
  };
}

function num(value, fallback = 0, min = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, n) : fallback;
}

function normalize(raw) {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const data = { ...base, ...raw };
  data.v = VERSION;
  data.coins = num(data.coins);
  data.runs = num(data.runs);
  data.kills = num(data.kills);
  data.bestLv = num(data.bestLv);
  data.mute = !!data.mute;
  data.onboarded = !!data.onboarded;

  data.upg = { ...base.upg, ...(data.upg || {}) };
  Object.keys(data.upg).forEach(k => { data.upg[k] = num(data.upg[k], 0, 0); });

  const fixList = (list, fallback) => Array.isArray(list) ? list.filter(x => typeof x === 'string') : fallback;
  data.heroes = { ...base.heroes, ...(data.heroes || {}) };
  data.heroes.owned = fixList(data.heroes.owned, ['arcibaldo']);
  if (!HEROES[data.heroes.sel] || !data.heroes.owned.includes(data.heroes.sel)) data.heroes.sel = 'arcibaldo';

  data.weapons = { ...base.weapons, ...(data.weapons || {}) };
  data.weapons.owned = fixList(data.weapons.owned, ['bow']);
  if (!WEAPONS[data.weapons.sel] || !data.weapons.owned.includes(data.weapons.sel)) data.weapons.sel = 'bow';

  data.accs = { ...base.accs, ...(data.accs || {}) };
  data.accs.owned = fixList(data.accs.owned, []);
  data.accs.eq = fixList(data.accs.eq, []).filter(id => data.accs.owned.includes(id)).slice(0, 2);

  data.auto = { ...base.auto, ...(data.auto || {}) };
  data.auto.unlocked = !!data.auto.unlocked;
  data.auto.on = !!data.auto.on && data.auto.unlocked;

  data.settings = { ...base.settings, ...(data.settings || {}) };
  data.daily = { ...base.daily, ...(data.daily || {}) };
  data.missions = { ...base.missions, ...(data.missions || {}) };
  data.missions.progress = data.missions.progress && typeof data.missions.progress === 'object' ? data.missions.progress : {};
  data.missions.claimed = fixList(data.missions.claimed, []);
  data.achievements = data.achievements && typeof data.achievements === 'object' ? data.achievements : {};
  data.achCounters = { ...base.achCounters, ...(data.achCounters || {}) };
  return data;
}

let loaded = null;
try {
  const raw = localStorage.getItem(SKEY);
  loaded = raw ? JSON.parse(raw) : null;
} catch (e) { loaded = null; }

export const SV = normalize(loaded);

export function save() {
  try { localStorage.setItem(SKEY, JSON.stringify(SV)); } catch (e) { /* ignore */ }
}

export function exportSave() { return JSON.stringify(SV, null, 2); }

export function importSave(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid save');
  Object.assign(SV, normalize(parsed));
  save();
  return SV;
}

export function resetSave() {
  Object.assign(SV, defaultSave());
  save();
}

export function heroMods() {
  return (HEROES[SV.heroes.sel] || HEROES.arcibaldo).mods || {};
}

export function metaStats() {
  const hm = heroMods();
  return {
    dmg: 1 + 0.06 * (SV.upg.atk || 0),
    maxHp: Math.round(100 * (1 + 0.08 * (SV.upg.hp || 0)) * (hm.hp || 1)),
    speed: 150 * (1 + 0.03 * (SV.upg.spd || 0)) * (hm.speed || 1),
    critC: 0.05 + 0.03 * (SV.upg.crit || 0),
    greed: (1 + 0.08 * (SV.upg.greed || 0)) * (hm.greed || 1),
    luck: hm.luck || 1
  };
}

export const G = {
  cv: null, ctx: null, W: 0, H: 0, DPR: 1,
  SCR: 'title', paused: false,
  P: null,
  enemies: [], bullets: [], ebullets: [], drops: [], parts: [], floats: [],
  run: { level: 1, wave: 1, waves: 3, coins: 0, kills: 0, pendingNext: false },
  joy: { on: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 },
  keys: {}, shake: 0, autoT: 0,
  spawnQueue: [], bossRef: null
};

export function clearEntities() {
  G.enemies = [];
  G.bullets = [];
  G.ebullets = [];
  G.drops = [];
  G.parts = [];
  G.floats = [];
  G.spawnQueue = [];
  G.bossRef = null;
  G.P = null;
}

export function wavesFor(level) { return Math.min(6, 3 + Math.floor((level - 1) / 5)); }
export function chapterOf(level) { return Math.min(5, Math.floor((level - 1) / 5)); }
export function diffMul(level, wave) { return 1 + 0.16 * (level - 1) + 0.07 * wave; }
