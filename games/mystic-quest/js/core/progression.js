/* Pure progression, collection and save validation */
import { VERSION, REALMS, OBJECTIVES } from '../config.js';

export function initialState() {
  return {
    version:VERSION,
    realm:0,
    stars:REALMS.map(() => [false, false, false]),
    spirits:REALMS.map(() => false),
    unlocked:1,
    memories:[],
    completed:false
  };
}
export function normalize(raw) {
  const base = initialState();
  if (!raw || raw.version !== VERSION) return base;
  const s = { ...base, ...raw };
  s.realm = Math.max(0, Math.min(REALMS.length - 1, Number(s.realm) || 0));
  s.unlocked = Math.max(1, Math.min(REALMS.length, Number(s.unlocked) || 1));
  s.stars = REALMS.map((_, i) => Array.isArray(raw.stars?.[i])
    ? raw.stars[i].slice(0, 3).map(Boolean).concat([false, false, false]).slice(0, 3)
    : [false, false, false]);
  s.spirits = REALMS.map((_, i) => !!raw.spirits?.[i]);
  s.memories = Array.isArray(raw.memories) ? raw.memories.slice(-30) : [];
  s.completed = !!raw.completed;
  return s;
}
export const starCount = s => s.stars.reduce((n, r) => n + r.filter(Boolean).length, 0);
export const spiritCount = s => s.spirits.filter(Boolean).length;
export function addStar(s, realmIdx, starIdx) {
  const next = JSON.parse(JSON.stringify(s));
  if (next.stars[realmIdx]?.[starIdx]) return { state:s, complete:false, already:true };
  next.stars[realmIdx][starIdx] = true;
  return { state:next, complete:next.stars[realmIdx].every(Boolean), already:false };
}
export function rescueSpirit(s, realmIdx) {
  const next = JSON.parse(JSON.stringify(s));
  if (next.spirits[realmIdx]) return { state:s, unlocked:false, finished:false, already:true };
  next.spirits[realmIdx] = true;
  next.unlocked = Math.max(next.unlocked, Math.min(REALMS.length, realmIdx + 2));
  const finished = next.spirits.every(Boolean);
  if (finished) next.completed = true;
  return { state:next, unlocked:next.unlocked, finished, already:false };
}
export function addMemory(s, text) {
  const next = JSON.parse(JSON.stringify(s));
  next.memories = [...next.memories, { text, t:Date.now() }].slice(-30);
  return next;
}
export function objectiveProgress(s) {
  return {
    stars:starCount(s),
    spirits:spiritCount(s),
    realms:s.spirits.filter(Boolean).length
  };
}
export function objectiveList(s) {
  const p = objectiveProgress(s);
  return OBJECTIVES.map(o => ({ ...o, current:p[o.id] || 0, done:(p[o.id] || 0) >= o.goal }));
}
