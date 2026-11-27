/* ============================================================
   Seba — the pure state: needs, hidden states, economy, trips
   ------------------------------------------------------------
   No DOM, no clock of its own: every function receives the time.
   Actions return { ok, reason, events } and mutate the state.
   Nothing here can kill Seba: the worst night ends on the floor
   and then with a glass of water.
   ============================================================ */
import {
  NEEDS, DECAY, ASLEEP_DECAY, SLEEP_GAIN, OFFLINE_CAP_H, DRUNK, HANGOVER, PASS_OUT_MS,
  AFTERGLOW_MS, ITEMS, LOCAL_DRINK, GAMES, MIN_HYGIENE_FOR_RAVE, MIN_SLEEP_FOR_PLAY,
} from './rules.js';
import { cityById, CITIES } from './places/cities.js';
import { itemById, STARTER, DEFAULT_OUTFIT } from './wardrobe.js';

export const HOUR = 3600 * 1000;

export const clamp = (v, lo = 0, hi = 100) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

export function newState(now = Date.now()) {
  return {
    v: 1,
    needs: { thirst: 62, smoke: 55, food: 58, sleep: 72, fun: 50, hygiene: 74 },
    drunk: 0, peak: 0, hangover: 0, liver: 90, lungs: 90,
    tips: 30, xp: 0,
    asleep: false, passedOutUntil: 0, afterglowUntil: 0,
    city: 'milano', trip: null, visited: [],
    owned: [...STARTER], outfit: { ...DEFAULT_OUTFIT },
    postcards: [], stories: [], achievements: [],
    stats: {},
    born: now, last: now,
  };
}

/** Rebuilds a saved state on top of a fresh one, discarding anything broken. */
export function hydrate(raw, now = Date.now()) {
  const s = newState(now);
  if (!raw || typeof raw !== 'object' || raw.v !== 1) return s;
  for (const k of Object.keys(s)) {
    const v = raw[k];
    if (v === undefined) continue;
    if (Array.isArray(s[k])) { if (Array.isArray(v)) s[k] = v; }
    else if (s[k] && typeof s[k] === 'object') { if (v && typeof v === 'object') s[k] = { ...s[k], ...v }; }
    else if (k === 'trip') s[k] = v && typeof v === 'object' ? v : null;
    else if (typeof v === typeof s[k]) s[k] = v;
  }
  s.owned = [...new Set([...STARTER, ...s.owned.filter((id) => itemById(id))])];
  for (const [slot, id] of Object.entries(s.outfit)) if (id && !s.owned.includes(id)) s.outfit[slot] = null;
  if (s.trip && !CITIES.some((c) => c.id === s.trip.city)) s.trip = null;
  s.city = s.trip ? s.trip.city : 'milano';
  if (s.last > now) s.last = now;           // a clock moved backwards must not freeze Seba
  clampState(s);
  return s;
}

export function clampState(s) {
  for (const n of NEEDS) s.needs[n] = clamp(s.needs[n]);
  s.drunk = clamp(s.drunk);
  s.peak = clamp(s.peak);
  s.hangover = clamp(s.hangover, 0, HANGOVER.max);
  s.liver = clamp(s.liver, 5, 100);
  s.lungs = clamp(s.lungs, 5, 100);
  s.tips = Math.max(0, Math.floor(Number.isFinite(s.tips) ? s.tips : 0));
  s.xp = Math.max(0, Math.floor(Number.isFinite(s.xp) ? s.xp : 0));
  return s;
}

export const bump = (s, key, n = 1) => { s.stats[key] = (s.stats[key] || 0) + n; return s.stats[key]; };
const peakStat = (s, key, v) => { if (v > (s.stats[key] || 0)) s.stats[key] = v; };

export function story(s, key, now, data = {}) {
  s.stories.unshift({ t: now, key, ...data });
  if (s.stories.length > 40) s.stories.length = 40;
}

/* ---------------- levels ---------------- */
export const levelOf = (xp) => 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 45));
export const xpForLevel = (level) => 45 * (level - 1) ** 2;
export function levelProgress(xp) {
  const level = levelOf(xp);
  const a = xpForLevel(level), b = xpForLevel(level + 1);
  return { level, pct: (xp - a) / (b - a) };
}
function gainXp(s, xp, events) {
  const before = levelOf(s.xp);
  s.xp += Math.round(xp);
  const after = levelOf(s.xp);
  if (after > before) {
    const bonus = (after - before) * 10;
    s.tips += bonus;
    events.push({ type: 'level', level: after, bonus });
  }
}
function earn(s, n) { const v = Math.max(0, Math.round(n)); s.tips += v; bump(s, 'earned', v); return v; }

/* ---------------- time ---------------- */

export function hangoverFrom(peak, liver) {
  if (peak < DRUNK.tipsy) return 0;
  return clamp((peak - 45) * 1.4 * (liver < 40 ? 1.35 : 1), 0, HANGOVER.max);
}

function step(s, h, now, events) {
  const asleep = s.asleep;
  for (const n of NEEDS) {
    if (n === 'sleep' && asleep) s.needs.sleep += SLEEP_GAIN * h;
    else s.needs[n] -= DECAY[n] * h * (asleep ? ASLEEP_DECAY : 1);
  }
  s.drunk -= (asleep ? DRUNK.fadeAsleep : DRUNK.fadeAwake) * h;
  s.hangover -= (asleep ? HANGOVER.fadeAsleep : HANGOVER.fadeAwake) * h;
  s.liver += (asleep ? 3 : 1.2) * h;
  s.lungs += (asleep ? 2.5 : 1) * h;
  clampState(s);
  // the bill arrives when the party wears off
  if (s.peak >= DRUNK.tipsy && s.drunk < 20) {
    const bill = hangoverFrom(s.peak, s.liver);
    if (bill > s.hangover) { s.hangover = bill; events.push({ type: 'hangover', value: bill }); bump(s, 'hangovers'); }
    s.peak = s.drunk;
  }
  // too tired to stand: he falls asleep on the counter by himself
  if (!s.asleep && s.needs.sleep <= 3) {
    s.asleep = true;
    events.push({ type: 'dozed' });
    bump(s, 'dozed');
  }
}

/** Advances the clock to `now`; offline time counts for at most 12 hours. */
export function tick(s, now = Date.now()) {
  const events = [];
  const ms = Math.max(0, now - s.last);
  let hours = Math.min(ms / HOUR, OFFLINE_CAP_H);
  const total = hours;
  while (hours > 1e-9) {
    const h = Math.min(hours, 0.25);
    step(s, h, now, events);
    hours -= h;
  }
  s.last = now;
  if (s.passedOutUntil && now >= s.passedOutUntil) {
    s.passedOutUntil = 0;
    s.asleep = false;
    s.drunk = Math.min(s.drunk, 45);
    events.push({ type: 'revived' });
  }
  return { hours: total, events };
}

/** Same as tick, with a before/after report for the "while you were away" screen. */
export function catchUp(s, now = Date.now()) {
  const before = { ...s.needs };
  const awayMs = Math.max(0, now - s.last);
  const r = tick(s, now);
  return { awayMs, hours: r.hours, events: r.events, before, after: { ...s.needs } };
}

/* ---------------- mood & face ---------------- */

export function mood(s) {
  const w = { thirst: 1.2, smoke: 1, food: 1.1, sleep: 1.1, fun: 1.2, hygiene: 0.6 };
  let sum = 0, tot = 0;
  for (const n of NEEDS) { sum += s.needs[n] * w[n]; tot += w[n]; }
  const worst = Math.min(...NEEDS.map((n) => s.needs[n]));
  return clamp((sum / tot) * 0.75 + worst * 0.25 - s.hangover * 0.35);
}

export const isPassedOut = (s, now) => s.passedOutUntil > now;

/** The lasting face; short reactions (gulp, puff…) are layered on top by the UI. */
export function expression(s, now = Date.now()) {
  const n = s.needs;
  if (s.asleep) return 'sleeping';
  if (s.drunk >= DRUNK.wasted) return 'drunk';
  if (s.hangover >= 25) return 'hangover';
  if (s.drunk >= DRUNK.tipsy) return 'tipsy';
  if (n.sleep < 22) return 'sleepy';
  if (n.food < 22) return 'hungry';
  if (n.hygiene < 18) return 'disgusted';
  if (s.lungs < 30) return 'cough';
  if (s.afterglowUntil > now) return 'after';
  if (n.fun < 28 || n.thirst < 18 || n.smoke < 18) return 'bored';
  return mood(s) >= 72 ? 'hype' : 'happy';
}

/** Which need is asking loudest, if any. */
export function loudestNeed(s, under = 30) {
  let best = null;
  for (const n of NEEDS) if (s.needs[n] < under && (!best || s.needs[n] < s.needs[best])) best = n;
  return best;
}

/* ---------------- consumables ---------------- */

export function itemFor(s, id) {
  if (id === 'local') {
    const c = cityById(s.city);
    return { ...LOCAL_DRINK, price: Math.round(4 + c.tier * 3) };
  }
  return ITEMS[id];
}

export function canConsume(s, id, now = s.last) {
  const it = itemFor(s, id);
  if (!it) return { ok: false, reason: 'unknown' };
  if (s.asleep || isPassedOut(s, now)) return { ok: false, reason: 'asleep' };
  if (s.tips < it.price) return { ok: false, reason: 'broke' };
  if (it.kind === 'food' && s.needs.food > 94) return { ok: false, reason: 'full' };
  return { ok: true };
}

export function consume(s, id, now = s.last, rnd = Math.random) {
  const can = canConsume(s, id, now);
  if (!can.ok) return { ...can, events: [] };
  const it = itemFor(s, id);
  const events = [];
  const empty = s.needs.food < 18;
  s.tips -= it.price;
  bump(s, 'spent', it.price);
  for (const [k, v] of Object.entries(it.eff)) s.needs[k] += v;
  if (it.drunk) {
    const gain = it.drunk > 0 && empty ? it.drunk * 2 : it.drunk;
    s.drunk = clamp(s.drunk + gain);
    if (it.drunk > 0) {
      s.liver -= it.drunk * 0.12;
      s.peak = Math.max(s.peak, s.drunk);
      peakStat(s, 'maxDrunk', Math.round(s.drunk));
      if (empty) events.push({ type: 'emptyStomach' });
    }
  }
  if (it.hangover) s.hangover += it.hangover;
  if (it.liver) s.liver += it.liver;
  if (it.lungs) s.lungs += it.lungs;
  clampState(s);
  bump(s, `use.${id}`);
  bump(s, `kind.${it.kind}`);
  const hour = new Date(now).getHours();
  if (it.kind === 'food' && hour >= 3 && hour < 6) bump(s, 'nightBite');
  if (it.kind === 'smoke' && id !== 'menta' && s.lungs < 45 && rnd() < 0.5) { events.push({ type: 'cough' }); bump(s, 'coughs'); }
  if (s.drunk >= DRUNK.passOut) {
    s.asleep = true;
    s.passedOutUntil = now + PASS_OUT_MS;
    events.push({ type: 'passout' });
    bump(s, 'passouts');
    story(s, 'passout', now, { city: s.city });
  } else if (it.drunk > 0 && s.drunk >= DRUNK.wasted && rnd() < 0.35) {
    s.needs.fun += 10; s.needs.hygiene -= 12; clampState(s);
    events.push({ type: 'figuraccia' });
    bump(s, 'figuracce');
    story(s, 'figuraccia', now, { city: s.city, n: Math.floor(rnd() * 1000) });
  }
  gainXp(s, 2, events);
  return { ok: true, events };
}

/* ---------------- sleep & shower ---------------- */

export function setSleep(s, value, now = s.last) {
  const events = [];
  if (value) {
    if (s.asleep) return { ok: false, reason: 'asleep', events };
    s.asleep = true;
    bump(s, 'naps');
  } else {
    if (!s.asleep) return { ok: false, reason: 'awake', events };
    if (isPassedOut(s, now)) {
      // the bucket of water: always available, a little humiliating
      s.passedOutUntil = 0;
      s.drunk = Math.min(s.drunk, 55);
      s.needs.fun -= 10;
      s.needs.hygiene += 15;
      events.push({ type: 'bucket' });
      bump(s, 'buckets');
    }
    if (s.needs.sleep >= 90) { bump(s, 'fullNights'); gainXp(s, 12, events); }
    s.asleep = false;
    clampState(s);
  }
  return { ok: true, events };
}

export function wash(s, amount, now = s.last) {
  if (s.asleep || isPassedOut(s, now)) return { ok: false, reason: 'asleep', events: [] };
  const events = [];
  const before = s.needs.hygiene;
  s.needs.hygiene = clamp(before + amount);
  if (before < 100 && s.needs.hygiene >= 100) { bump(s, 'showers'); gainXp(s, 8, events); events.push({ type: 'clean' }); }
  return { ok: true, events };
}

export function pet(s) {
  if (s.asleep) return { ok: false, reason: 'asleep' };
  s.needs.fun = clamp(s.needs.fun + 0.6);
  return { ok: true, count: bump(s, 'pets') };
}

/* ---------------- minigames ---------------- */

export function canPlay(s, id, now = s.last) {
  if (!GAMES[id]) return { ok: false, reason: 'unknown' };
  if (s.asleep || isPassedOut(s, now)) return { ok: false, reason: 'asleep' };
  // Working the counter and the walk home are always possible: no dead ends.
  if (id === 'shift' || id === 'runner' || id === 'quiz') return { ok: true };
  if (s.needs.sleep < MIN_SLEEP_FOR_PLAY) return { ok: false, reason: 'tired' };
  if (GAMES[id].party && s.needs.thirst <= 0) return { ok: false, reason: 'thirsty' };
  if (id === 'lighter' && s.tips < ITEMS.sigaretta.price) return { ok: false, reason: 'broke' };
  return { ok: true };
}

/** perf is 0..1. `flawless` marks a round without a single mistake. */
export function applyGame(s, id, perf, { flawless = false, now = s.last } = {}) {
  const g = GAMES[id];
  const events = [];
  const p = clamp(perf, 0, 1);
  const tier = cityById(s.city).tier;
  const grumpy = s.needs.smoke <= 5 ? 0.7 : 1;
  const tips = earn(s, g.tips * p * tier * (id === 'shift' ? grumpy : 1));
  for (const [k, v] of Object.entries(g.eff)) s.needs[k] += v > 0 ? v * (0.4 + 0.6 * p) : v;
  if (id === 'shift') bump(s, 'shifts');
  if (id === 'lighter') {
    if (p >= 0.5) { s.tips = Math.max(0, s.tips - ITEMS.sigaretta.price); s.needs.smoke += ITEMS.sigaretta.eff.smoke; s.lungs -= 3; bump(s, 'use.sigaretta'); bump(s, 'kind.smoke'); }
  }
  bump(s, `game.${id}`);
  if (flawless) bump(s, `flawless.${id}`);
  const hour = new Date(now).getHours();
  if (hour >= 3 && hour < 5) bump(s, 'nightOwl');
  clampState(s);
  const xp = Math.round(g.xp * (0.3 + 0.7 * p));
  gainXp(s, xp, events);
  return { ok: true, tips, xp, events };
}

/* ---------------- wardrobe ---------------- */

export function buy(s, id) {
  const it = itemById(id);
  if (!it) return { ok: false, reason: 'unknown' };
  if (s.owned.includes(id)) return { ok: false, reason: 'owned' };
  if (levelOf(s.xp) < it.level) return { ok: false, reason: 'level' };
  if (s.tips < it.price) return { ok: false, reason: 'broke' };
  s.tips -= it.price;
  s.owned.push(id);
  bump(s, 'bought');
  return { ok: true };
}

export function wear(s, id) {
  const it = itemById(id);
  if (!it || !s.owned.includes(id)) return { ok: false, reason: 'not-owned' };
  s.outfit[it.slot] = s.outfit[it.slot] === id ? null : id;
  bump(s, 'changes');
  return { ok: true };
}

/* ---------------- travel ---------------- */

export const nightBonus = (now) => { const h = new Date(now).getHours(); return h >= 23 || h < 5 ? 1.3 : 1; };

export function canFly(s, cityId, now = s.last) {
  const c = CITIES.find((x) => x.id === cityId);
  if (!c) return { ok: false, reason: 'unknown' };
  if (s.asleep || isPassedOut(s, now)) return { ok: false, reason: 'asleep' };
  if (levelOf(s.xp) < c.level) return { ok: false, reason: 'level' };
  if (s.city === cityId) return { ok: false, reason: 'here' };
  if (cityId !== 'milano' && s.tips < c.price) return { ok: false, reason: 'broke' };
  return { ok: true };
}

/** Going home is always free: the friends chip in for the night bus. */
export function fly(s, cityId, now = s.last) {
  const can = canFly(s, cityId, now);
  if (!can.ok) return { ...can, events: [] };
  const c = cityById(cityId);
  const events = [];
  if (cityId === 'milano') { s.city = 'milano'; s.trip = null; return { ok: true, events }; }
  s.tips -= c.price;
  bump(s, 'spent', c.price);
  s.city = cityId;
  s.trip = { city: cityId, stage: 'arrived', rave: 0 };
  s.needs.sleep -= 5;
  if (!s.visited.includes(cityId)) { s.visited.push(cityId); gainXp(s, 25, events); events.push({ type: 'newCity', city: cityId }); }
  bump(s, 'flights');
  clampState(s);
  return { ok: true, events };
}

export function canRave(s, now = s.last) {
  if (s.asleep || isPassedOut(s, now)) return { ok: false, reason: 'asleep' };
  if (s.needs.hygiene < MIN_HYGIENE_FOR_RAVE) return { ok: false, reason: 'stinky' };
  if (s.needs.sleep < MIN_SLEEP_FOR_PLAY) return { ok: false, reason: 'tired' };
  if (s.needs.thirst <= 0) return { ok: false, reason: 'thirsty' };
  return { ok: true };
}

/** The rave itself: both party games have been played, this pays the night. */
export function applyRave(s, perf, now = s.last) {
  const c = cityById(s.city);
  const events = [];
  const p = clamp(perf, 0, 1);
  const tips = earn(s, (8 + 18 * p) * c.tier * nightBonus(now));
  s.needs.smoke -= 12;
  if (!s.trip) s.trip = { city: s.city, stage: 'arrived', rave: 0 };   // the home rave in Milan
  s.trip.stage = 'raved';
  s.trip.rave = p;
  bump(s, 'raves');
  story(s, 'rave', now, { city: s.city });
  clampState(s);
  const xp = Math.round(25 + 35 * p);
  gainXp(s, xp, events);
  return { ok: true, tips, xp, events };
}

export function applyAfter(s, perf, now = s.last) {
  if (!s.trip || s.trip.stage !== 'raved') return { ok: false, reason: 'no-rave', events: [] };
  const c = cityById(s.city);
  const events = [];
  const p = clamp(perf, 0, 1);
  const tips = earn(s, (4 + 10 * p) * c.tier);
  s.needs.food -= 10;
  s.afterglowUntil = now + AFTERGLOW_MS;
  s.trip.stage = 'done';
  bump(s, 'afters');
  story(s, 'after', now, { city: s.city });
  if (s.city === 'milano') s.trip = null;
  clampState(s);
  const xp = Math.round(20 + 25 * p);
  gainXp(s, xp, events);
  return { ok: true, tips, xp, events };
}

export function addPostcard(s, card) {
  s.postcards.unshift({ id: `${card.t}-${s.postcards.length}`, ...card });
  if (s.postcards.length > 60) s.postcards.length = 60;
}
