/* ============================================================
   Agente Zero — save game, statistics, unlocks, medals (pure)
   ============================================================ */
import { zoneOf, isThree, distanceOf } from './court-data.js';
import { missionId, totalStars, chapterStars, CHAPTERS } from './career.js';

export const SAVE_KEY = 'agente-zero-v1';
export const SETTINGS_KEY = 'agente-zero-settings';

/** Looks the player picks freely, and cosmetic items that must be earned. */
export const LOOKS = {
  skin: ['s1', 's2', 's3', 's4'],
  hair: ['short', 'afro', 'braids', 'buzz'],
  hairColor: ['black', 'brown', 'blond', 'ginger'],
};

export const ITEMS = {
  jersey: [
    { id: 'classic' }, { id: 'stripes', level: 3 }, { id: 'retro', level: 6 }, { id: 'night', medal: 'chapter3' },
  ],
  ball: [
    { id: 'classic' }, { id: 'street', level: 2 }, { id: 'flame', medal: 'streak10' }, { id: 'gold', medal: 'champion' },
  ],
  shoes: [
    { id: 'classic' }, { id: 'red', level: 4 }, { id: 'black', level: 7 }, { id: 'gold', medal: 'stars60' },
  ],
  band: [
    { id: 'red' }, { id: 'white', level: 2 }, { id: 'stripes', level: 5 }, { id: 'none' },
  ],
  celebration: [
    { id: 'fist' }, { id: 'zero', medal: 'swish1' }, { id: 'flex', level: 3 }, { id: 'dance', medal: 'timed40' }, { id: 'bow', medal: 'three20' },
  ],
};

export const SLOTS = Object.keys(ITEMS);

export const DEFAULT_LOOK = {
  skin: 's2', hair: 'short', hairColor: 'black',
  jersey: 'classic', ball: 'classic', shoes: 'classic', band: 'red', celebration: 'fist',
};

const emptyStats = () => ({
  shots: 0, makes: 0, swishes: 0, bank: 0, rim: 0, airballs: 0, blocked: 0,
  threes: 0, deep: 0, half: 0, bestStreak: 0, windMakes: 0, movingMakes: 0, overHand: 0, buzzers: 0,
  bombs: 0, bombRound: 0, bombWrecked: 0, bombStanding: 0, bombSteady: 0, bombWater: 0, zones: {},
});

export function newState() {
  return {
    v: 1, xp: 0, matches: 0, stats: emptyStats(), stars: {},
    best: { timed: 0, three: 0, zero: 0, bomb: 0 }, daily: {},
    zero: { won: 0, lost: 0, flawless: 0 },
    look: { ...DEFAULT_LOOK }, medals: [], seen: {},
  };
}

const num = (v, d = 0) => (Number.isFinite(v) && v >= 0 ? v : d);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

/** Accepts anything found in storage and returns a valid state. */
export function hydrate(raw) {
  const s = newState();
  if (!raw || typeof raw !== 'object') return s;
  s.xp = num(raw.xp);
  s.matches = num(raw.matches);
  const st = obj(raw.stats);
  for (const k of Object.keys(s.stats)) if (k !== 'zones') s.stats[k] = num(st[k]);
  for (const [k, v] of Object.entries(obj(st.zones))) if (Array.isArray(v)) s.stats.zones[k] = [num(v[0]), num(v[1])];
  for (const [k, v] of Object.entries(obj(raw.stars))) s.stars[k] = Math.min(3, num(v));
  for (const k of Object.keys(s.best)) s.best[k] = num(obj(raw.best)[k]);
  for (const [k, v] of Object.entries(obj(raw.daily))) s.daily[k] = num(v);
  for (const k of Object.keys(s.zero)) s.zero[k] = num(obj(raw.zero)[k]);
  s.medals = Array.isArray(raw.medals) ? raw.medals.filter((m) => MEDALS.some((x) => x.id === m)) : [];
  s.seen = { ...obj(raw.seen) };
  const look = obj(raw.look);
  for (const [slot, list] of Object.entries(LOOKS)) if (list.includes(look[slot])) s.look[slot] = look[slot];
  for (const slot of SLOTS) {
    const item = ITEMS[slot].find((i) => i.id === look[slot]);
    if (item && isUnlocked(s, item)) s.look[slot] = item.id;
  }
  return s;
}

export const levelOf = (xp) => 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 60));
export const xpForLevel = (level) => 60 * (level - 1) ** 2;

export function isUnlocked(state, item) {
  if (item.level) return levelOf(state.xp) >= item.level;
  if (item.medal) return state.medals.includes(item.medal);
  return true;
}

export function setLook(state, slot, id) {
  if (LOOKS[slot]) {
    if (!LOOKS[slot].includes(id)) return false;
  } else {
    const item = ITEMS[slot]?.find((i) => i.id === id);
    if (!item || !isUnlocked(state, item)) return false;
  }
  state.look[slot] = id;
  return true;
}

const medal = (id, test) => ({ id, test });
const chapterDone = (s, c) => CHAPTERS[c].missions.every((_, i) => s.stars[missionId(c, i)] > 0);
const chapterPerfect = (s) => CHAPTERS.some((_, c) => chapterStars(s.stars, c) === 18);

export const MEDALS = [
  medal('first', (s) => s.stats.makes >= 1),
  medal('swish1', (s) => s.stats.swishes >= 1),
  medal('swish50', (s) => s.stats.swishes >= 50),
  medal('make100', (s) => s.stats.makes >= 100),
  medal('make500', (s) => s.stats.makes >= 500),
  medal('shots1000', (s) => s.stats.shots >= 1000),
  medal('streak3', (s) => s.stats.bestStreak >= 3),
  medal('streak5', (s) => s.stats.bestStreak >= 5),
  medal('streak10', (s) => s.stats.bestStreak >= 10),
  medal('bank10', (s) => s.stats.bank >= 10),
  medal('three10', (s) => s.stats.threes >= 10),
  medal('three100', (s) => s.stats.threes >= 100),
  medal('deep', (s) => s.stats.deep >= 1),
  medal('half', (s) => s.stats.half >= 1),
  medal('wind10', (s) => s.stats.windMakes >= 10),
  medal('moving10', (s) => s.stats.movingMakes >= 10),
  medal('hands10', (s) => s.stats.overHand >= 10),
  medal('buzzer', (s) => s.stats.buzzers >= 1),
  medal('airball', (s) => s.stats.airballs >= 1),
  medal('timed20', (s) => s.best.timed >= 20),
  medal('timed40', (s) => s.best.timed >= 40),
  medal('three12', (s) => s.best.three >= 12),
  medal('three20', (s) => s.best.three >= 20),
  medal('daily', (s) => Object.keys(s.daily).length >= 1),
  medal('daily7', (s) => Object.keys(s.daily).length >= 7),
  medal('zeroWin', (s) => s.zero.won >= 1),
  medal('zeroClean', (s) => s.zero.flawless >= 1),
  medal('chapter1', (s) => chapterDone(s, 0)),
  medal('chapter3', (s) => chapterDone(s, 2)),
  medal('champion', (s) => chapterDone(s, 5)),
  medal('perfect', chapterPerfect),
  medal('stars60', (s) => totalStars(s.stars) >= 60),
  medal('bomb1', (s) => s.stats.bombs >= 1),
  medal('bomb6', (s) => s.stats.bombRound >= 6),
  medal('bombWrecked', (s) => s.stats.bombWrecked >= 1),
  medal('bombStanding', (s) => s.stats.bombStanding >= 1),
  medal('bombSteady', (s) => s.stats.bombSteady >= 1),
  medal('bombWater', (s) => s.stats.bombWater >= 1),
];

/** Adds the medals earned since the last call and returns their ids. */
export function checkMedals(state) {
  const fresh = [];
  for (const m of MEDALS) {
    if (!state.medals.includes(m.id) && m.test(state)) { state.medals.push(m.id); fresh.push(m.id); }
  }
  return fresh;
}

/** Ids of items that are open now, as "slot:id". */
export function unlockedItems(state) {
  return SLOTS.flatMap((slot) => ITEMS[slot].filter((i) => isUnlocked(state, i)).map((i) => `${slot}:${i.id}`));
}

/**
 * Records one of the player's shots.
 * info: {spot, env, buzzer, out (from applyShot)}
 */
export function recordShot(state, { spot, env = {}, buzzer = false, out }) {
  const st = state.stats;
  if (out.who !== 'you' || out.result === 'late') return;
  st.shots++;
  if (out.made && out.drunk >= 80) st.bombWrecked++;
  const z = zoneOf(spot);
  const zone = (st.zones[z] = st.zones[z] || [0, 0]);
  zone[0]++;
  if (out.result === 'airball') st.airballs++;
  if (out.result === 'blocked') st.blocked++;
  if (!out.made) return;
  zone[1]++;
  st.makes++;
  if (out.result === 'swish') st.swishes++;
  if (out.result === 'bank') st.bank++;
  if (out.result === 'rim') st.rim++;
  if (isThree(spot)) st.threes++;
  if (distanceOf(spot) > 8.8) st.deep++;
  if (distanceOf(spot) > 12) st.half++;
  if (env.wind) st.windMakes++;
  if (env.moving) st.movingMakes++;
  if (env.defender) st.overHand++;
  if (buzzer) st.buzzers++;
  state.xp += 8 + (out.result === 'swish' ? 4 : 0) + (isThree(spot) ? 3 : 0);
}

/** Remembers where the player stood, so the result screen can tell what changed. */
export function beginMatch(state, match) {
  match.xpStart = state.xp;
  match.itemsStart = unlockedItems(state);
  return match;
}

/** Records the end of a match. Returns what is new, for the result screen. */
export function finishMatch(state, match, summary) {
  const xpBefore = match.xpStart ?? state.xp;
  const levelBefore = levelOf(xpBefore);
  const itemsBefore = new Set(match.itemsStart ?? unlockedItems(state));
  let newBest = false, newStars = 0;
  state.matches++;
  state.stats.bestStreak = Math.max(state.stats.bestStreak, summary.bestStreak);
  if (summary.attempts > 0 && match.id !== 'training') state.xp += 15;
  if (match.id === 'bomb') {
    state.stats.bombs += summary.bombs;
    state.stats.bombRound = Math.max(state.stats.bombRound, summary.bombs);
    if (match.over && !summary.crashed) {
      if (summary.level >= 60) state.stats.bombStanding++;
      if (summary.bombs === 0) state.stats.bombWater++;
    }
    if (match.over && summary.bombs >= 3 && summary.cleanBombs === summary.bombs) state.stats.bombSteady++;
  }
  if (match.id === 'timed' || match.id === 'three' || match.id === 'bomb') {
    if (summary.score > state.best[match.id]) { state.best[match.id] = summary.score; newBest = true; }
  } else if (match.id === 'daily' && match.over) {
    const key = String(match.seed);
    if (!(key in state.daily) || summary.score > state.daily[key]) {
      newBest = key in state.daily;
      state.daily[key] = summary.score;
    }
  } else if (match.id === 'zero' && match.over) {
    if (summary.won) {
      state.zero.won++;
      state.xp += 60;
      if (summary.letters.you === 0) state.zero.flawless++;
    } else state.zero.lost++;
  } else if (match.id === 'career') {
    const id = missionId(match.chapter, match.mission);
    const old = state.stars[id] || 0;
    if (summary.stars > old) {
      state.stars[id] = summary.stars;
      newStars = summary.stars - old;
      state.xp += newStars * 40;
    }
  }
  const medals = checkMedals(state);
  return {
    newBest, newStars, medals,
    xp: state.xp - xpBefore,
    level: levelOf(state.xp),
    levelUp: levelOf(state.xp) > levelBefore,
    unlocked: unlockedItems(state).filter((i) => !itemsBefore.has(i)),
  };
}
