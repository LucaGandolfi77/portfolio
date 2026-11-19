/* Card Collector — versioned, validated persistent state */

import { CARDS } from './data.js';

export const SAVE_KEY = 'cardCollector';
export const SCHEMA = 2;

function defaults() {
  return {
    version: SCHEMA,
    gold: 1000,
    gems: 100,
    level: 1,
    xp: 0,
    collection: {},
    deck: [],
    scopaDeck: [],
    battlesWon: 0,
    boxesOpened: 0,
    slotBet: 100,
    stats: { spins: 0, slotWins: 0, boxes: 0, cardsWon: 0 },
    daily: { date: '', quests: [], streak: 0, lastLogin: '' },
    achievements: {},
    settings: { sound: true }
  };
}

const listeners = new Set();
export const state = { data: defaults(), migrated: false };

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() { listeners.forEach(fn => fn(state.data)); }

export function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.data)); }
  catch (e) { console.warn('[Cards] save failed', e); }
}

export function commit() { save(); notify(); }

function normalize(raw) {
  const base = defaults();
  if (!raw || typeof raw !== 'object') return base;
  const data = { ...base, ...raw };

  data.version = SCHEMA;
  const num = (value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  };
  data.gold = num(data.gold, base.gold, 0, 99999);
  data.gems = num(data.gems, base.gems, 0, 99999);
  data.level = num(data.level, 1, 1, 999);
  data.xp = num(data.xp, 0);
  data.battlesWon = num(data.battlesWon, 0);
  data.boxesOpened = num(data.boxesOpened, 0);
  data.slotBet = num(data.slotBet, 100, 100, 10000);

  if (!data.collection || typeof data.collection !== 'object' || Array.isArray(data.collection)) {
    data.collection = {};
  }
  for (const id of Object.keys(data.collection)) {
    const entry = data.collection[id];
    if (typeof entry === 'number') data.collection[id] = { count: Math.max(0, entry), level: 1 };
    else if (!entry || typeof entry !== 'object') delete data.collection[id];
    else {
      entry.count = num(entry.count, 0);
      entry.level = num(entry.level, 1, 1, 99);
    }
  }
  const cleanDeck = ids => (Array.isArray(ids) ? ids : []).map(Number).filter(n => Number.isFinite(n));
  const validIds = new Set(CARDS.map(c => c.id));
  data.deck = cleanDeck(data.deck).filter(id => validIds.has(id)).slice(0, 8);
  data.scopaDeck = cleanDeck(data.scopaDeck).filter(id => validIds.has(id)).slice(0, 12);

  data.stats = { ...base.stats, ...(data.stats && typeof data.stats === 'object' ? data.stats : {}) };
  data.daily = { ...base.daily, ...(data.daily && typeof data.daily === 'object' ? data.daily : {}) };
  data.achievements = data.achievements && typeof data.achievements === 'object' ? data.achievements : {};
  data.settings = { ...base.settings, ...(data.settings && typeof data.settings === 'object' ? data.settings : {}) };
  return data;
}

export function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); }
  catch (e) { console.warn('[Cards] corrupt save, resetting', e); }
  state.migrated = !!raw && (!raw.version || raw.version < SCHEMA);
  state.data = normalize(raw);
  if (raw) save();
  return state.data;
}

export function exportSave() {
  return JSON.stringify(state.data, null, 2);
}

export function importSave(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !parsed.collection) {
    throw new Error('Invalid save file');
  }
  state.data = normalize(parsed);
  commit();
  return state.data;
}

export function resetSave() {
  state.data = defaults();
  commit();
}

export function addCard(id, amount = 1) {
  const entry = state.data.collection[id] || { count: 0, level: 1 };
  entry.count += amount;
  state.data.collection[id] = entry;
  state.data.stats.cardsWon += amount;
}
