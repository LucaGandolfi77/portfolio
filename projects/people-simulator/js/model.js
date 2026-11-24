/* People Simulator — pure cohort/Markov model */
import { STATES, ACTIVITIES, COHORTS, TIMEZONES, EVENTS } from './config.js';

export const ACT_IDS = ACTIVITIES.map(a => a.id);

export const DB = {};
STATES.forEach(s => {
  DB[s[0]] = { name: s[0], abbr: s[1], pop: s[2], capital: s[3], largest: s[4],
    nick: s[5], since: s[6], gdpB: s[7], income: s[8], area: s[9], tz: TIMEZONES[s[0]] || 0 };
});
export const USA = STATES.reduce((acc, s) => {
  acc.pop += s[2]; acc.gdpB += s[7]; acc.area += s[9]; return acc;
}, { pop: 0, gdpB: 0, area: 0 });
USA.density = USA.pop / USA.area;
export const POP_RANK = [...STATES].sort((a, b) => b[2] - a[2]).map(s => s[0]);

const BASE = {
  young: {
    night: { sleep: 92, home: 4, personal: 2, leisure: 2 },
    morning: { sleep: 20, personal: 18, eating: 15, travel: 20, school: 25 },
    day: { school: 62, eating: 8, travel: 5, sport: 8, leisure: 10, home: 7 },
    evening: { home: 35, leisure: 30, eating: 15, chores: 8, personal: 7, sleep: 5 },
    late: { sleep: 70, leisure: 15, home: 10, personal: 5 }
  },
  adult: {
    night: { sleep: 90, home: 3, work: 2, personal: 3, travel: 2 },
    morning: { sleep: 20, personal: 22, eating: 14, travel: 22, work: 12, school: 5 },
    day: { work: 60, travel: 8, eating: 10, home: 8, shopping: 3, chores: 3, civic: 3, sport: 3 },
    evening: { home: 34, leisure: 27, eating: 16, chores: 10, shopping: 5, travel: 5, sport: 3 },
    late: { sleep: 45, leisure: 30, personal: 10, home: 10, work: 5 }
  },
  senior: {
    night: { sleep: 82, home: 8, personal: 6, leisure: 4 },
    morning: { sleep: 35, personal: 25, eating: 18, home: 12, leisure: 8, chores: 2 },
    day: { home: 30, leisure: 22, retirement: 18, chores: 10, eating: 8, shopping: 5, civic: 5, health: 2 },
    evening: { home: 45, leisure: 30, eating: 15, personal: 6, sleep: 4 },
    late: { sleep: 70, home: 12, leisure: 10, personal: 8 }
  }
};

function phaseOf(hour, dayIndex) {
  const weekend = dayIndex === 0 || dayIndex === 6;
  if (hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 17) return weekend ? 'leisure' : 'day';
  if (hour < 19) return 'evening';
  return 'late';
}

function weekendMix(profile) {
  // shift work/school into leisure/home on weekends
  const out = { ...profile };
  const move = (out.work || 0) + (out.school || 0);
  if (move) {
    out.work = Math.round((out.work || 0) * 0.12);
    out.school = Math.round((out.school || 0) * 0.05);
    out.leisure = (out.leisure || 0) + Math.round(move * 0.55);
    out.home = (out.home || 0) + Math.round(move * 0.33);
  }
  return out;
}

function eventMultipliers(eventId) {
  const def = EVENTS.find(e => e.id === eventId);
  if (!def) return {};
  const out = {};
  Object.entries(def.effect || {}).forEach(([k, v]) => { out[k] = 1 + v / 100; });
  return out;
}

export function cohortProfile(cohort, hour, dayIndex, eventId = 'none') {
  const phase = phaseOf(hour, dayIndex);
  let base = { ...(BASE[cohort] || BASE.adult)[phase] || BASE.adult.day };
  const weekend = dayIndex === 0 || dayIndex === 6;
  if (weekend) base = weekendMix(base);
  if (cohort !== 'senior' && hour >= 12 && hour < 13) {
    base.eating = (base.eating || 0) + 18;
    base.work = Math.max(0, (base.work || 0) - 12);
    base.school = Math.max(0, (base.school || 0) - 10);
  }
  const mult = eventMultipliers(eventId);
  Object.keys(base).forEach(k => { if (mult[k]) base[k] = Math.round(base[k] * mult[k]); });
  return normalize(base);
}

export function normalize(values) {
  const out = {};
  let total = 0;
  ACT_IDS.forEach(k => { const v = Math.max(0, Number(values[k]) || 0); out[k] = v; total += v; });
  if (!total) { out.home = 100; return out; }
  ACT_IDS.forEach(k => { out[k] = Math.round(out[k] * 100 / total); });
  const drift = 100 - ACT_IDS.reduce((s, k) => s + out[k], 0);
  out.home = Math.max(0, out.home + drift);
  return out;
}

export function blend(profiles, shares = [0.22, 0.63, 0.15]) {
  const out = {};
  ACT_IDS.forEach(k => { out[k] = profiles.reduce((sum, p, i) => sum + (p[k] || 0) * shares[i], 0); });
  return normalize(out);
}

export function stateProfile(name, date, eventId = 'none') {
  const d = name && DB[name] ? DB[name] : null;
  const offset = d ? d.tz : 0;
  const local = new Date(date.getTime() + offset * 3600000);
  const hour = local.getHours(), day = local.getDay();
  const profiles = COHORTS.map(c => cohortProfile(c.id, hour, day, eventId));
  return { hour, day, local, mix: blend(profiles) };
}

export function counts(mix, population) {
  const out = {};
  ACT_IDS.forEach(k => { out[k] = Math.round(population * (mix[k] || 0) / 100); });
  return out;
}

export function dominant(mix) {
  return ACT_IDS.reduce((best, k) => (mix[k] || 0) > (mix[best] || 0) ? k : best, ACT_IDS[0]);
}

export function metrics(mix) {
  const m = {
    happiness: Math.round(58 + (mix.leisure || 0) * 0.4 + (mix.sport || 0) * 0.3 - (mix.work || 0) * 0.18 - (mix.sleep || 0) * 0.05),
    traffic: Math.min(100, Math.round((mix.travel || 0) * 2.2)),
    energy: Math.min(100, Math.round(28 + (mix.home || 0) * 0.55 + (mix.work || 0) * 0.4 + (mix.leisure || 0) * 0.3)),
    productivity: Math.min(100, Math.round((mix.work || 0) * 1.35 + (mix.school || 0) * 0.8)),
    sleepDebt: Math.max(0, Math.round((20 - (mix.sleep || 0)) * 1.4))
  };
  for (const k in m) m[k] = Math.max(0, Math.min(100, m[k]));
  return m;
}

export function hourlySeries(name, date, eventId = 'none', hours = 24) {
  const out = [];
  for (let i = 0; i < hours; i++) {
    const d = new Date(date.getTime() + i * 3600000);
    const p = stateProfile(name, d, eventId);
    out.push({ hour: d.getHours(), mix: p.mix, metrics: metrics(p.mix), dominant: dominant(p.mix) });
  }
  return out;
}
