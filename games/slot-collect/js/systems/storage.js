/* Slot Collect — versioned, validated save with migration */

const KEY = 'slotcollect.save.v2';
const VERSION = 2;

export function defaults() {
  return {
    v: VERSION,
    best: {}, mode: 'classic', difficulty: 'normal', sound: true,
    xp: 0, level: 1, spins: 0, wins: 0,
    achievements: {}, streak: { count: 0, last: '' },
    upgrades: { reel: 0, energy: 0, luck: 0, multiplier: 0, autospin: 0 },
    collection: {}, daily: {}, lastRun: null
  };
}

function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

export function migrate(raw) {
  const out = defaults();
  if (!isObj(raw)) return out;
  // v1 (old arcade-kit save) only had best/runs/sound/difficulty/unlocked
  if (raw.best && isObj(raw.best)) out.best = { ...raw.best };
  if (raw.difficulty in { easy: 1, normal: 1, hard: 1 }) out.difficulty = raw.difficulty;
  if (typeof raw.sound === 'boolean') out.sound = raw.sound;
  if (typeof raw.runs === 'number') out.spins = raw.runs;
  const copy = (key, fn) => { if (isObj(raw[key])) out[key] = fn(raw[key]); };
  copy('best', v => ({ ...v }));
  copy('upgrades', v => ({ ...out.upgrades, ...v }));
  copy('collection', v => ({ ...v }));
  copy('achievements', v => ({ ...v }));
  copy('daily', v => ({ ...v }));
  copy('streak', v => ({ ...out.streak, ...v }));
  for (const k of ['xp', 'level', 'spins', 'wins']) if (typeof raw[k] === 'number') out[k] = raw[k];
  if (typeof raw.mode === 'string') out.mode = raw.mode;
  out.v = VERSION;
  return out;
}

export function load(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : defaults();
  } catch (e) { return defaults(); }
}

export function save(state, storage = globalThis.localStorage) {
  try { storage?.setItem(KEY, JSON.stringify({ ...state, v: VERSION })); } catch (e) { /* quota */ }
  return state;
}

export function clear(storage = globalThis.localStorage) {
  try { storage?.removeItem(KEY); } catch (e) { /* noop */ }
}

export const SAVE_KEY = KEY;
export const SAVE_VERSION = VERSION;
