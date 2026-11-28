/* ============================================================
   Ultimo Colore — the journey: save game, map, camp (pure)
   ============================================================ */
import { NODES, NODE, FIRST } from '../data/map.js';
import { MEMORY, SLOTS, LEARN, TEACH_COST } from '../data/memories.js';
import { HERO_IDS, levelFor } from '../data/party.js';
import { TALKS } from '../data/story.js';
import { DIFFICULTY } from '../battle/timing.js';

export const SAVE_KEY = 'ultimo-colore-v1';
export const SETTINGS_KEY = 'ultimo-colore-settings';
export const TALKS_PER_CAMP = 2;
export const SUPPLY = { olio: 3, cera: 1 };

export function newGame(difficulty = 'normal') {
  return {
    v: 1, difficulty, party: ['ilario'], xp: 0, light: 0, items: { ...SUPPLY },
    owned: [], equipped: {}, known: {}, uses: {}, hp: {},
    done: [], flags: {}, bonds: {}, talks: [], diary: [], actDone: false, battles: 0,
  };
}

const num = (v, d = 0) => (Number.isFinite(v) && v >= 0 ? v : d);
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
const list = (v) => (Array.isArray(v) ? v : []);
const heroLists = (raw) => Object.fromEntries(Object.entries(obj(raw)).filter(([k]) => HERO_IDS.includes(k)).map(([k, v]) => [k, [...new Set(list(v).filter((m) => MEMORY[m]))]]));

/** Turns whatever is in storage into a valid save, or null if there is none. */
export function hydrate(raw) {
  if (!raw || typeof raw !== 'object' || raw.v !== 1) return null;
  const s = newGame(DIFFICULTY[raw.difficulty] ? raw.difficulty : 'normal');
  const party = list(raw.party).filter((h) => HERO_IDS.includes(h));
  if (party.length) s.party = [...new Set(party)];
  s.xp = num(raw.xp); s.light = num(raw.light); s.battles = num(raw.battles);
  s.items = { olio: num(obj(raw.items).olio), cera: num(obj(raw.items).cera) };
  s.owned = [...new Set(list(raw.owned).filter((m) => MEMORY[m]))];
  s.known = heroLists(raw.known);
  s.equipped = heroLists(raw.equipped);
  for (const k of Object.keys(s.equipped)) s.equipped[k] = s.equipped[k].filter((m) => s.owned.includes(m)).slice(0, SLOTS);
  for (const [h, u] of Object.entries(obj(raw.uses))) if (HERO_IDS.includes(h)) s.uses[h] = Object.fromEntries(Object.entries(obj(u)).filter(([m]) => MEMORY[m]).map(([m, n]) => [m, num(n)]));
  for (const [h, v] of Object.entries(obj(raw.hp))) if (HERO_IDS.includes(h) && Number.isFinite(v)) s.hp[h] = Math.max(0.01, Math.min(1, v));
  s.done = list(raw.done).filter((n) => NODE[n]);
  s.flags = { ...obj(raw.flags) };
  for (const [k, v] of Object.entries(obj(raw.bonds))) s.bonds[k] = num(v);
  s.talks = list(raw.talks).filter((x) => typeof x === 'string');
  s.diary = list(raw.diary).filter((x) => typeof x === 'string');
  s.actDone = !!raw.actDone;
  return s;
}

export const level = (s) => levelFor(s.xp);

/** Nodes that can be entered now. Camps already visited stay open. */
export function available(s) {
  if (!s.done.length) return [FIRST];
  const open = new Set();
  for (const id of s.done) for (const n of NODE[id].next) if (!s.done.includes(n)) open.add(n);
  return NODES.map((n) => n.id).filter((id) => open.has(id));
}

export function join(s, heroes = []) {
  for (const h of heroes) if (!s.party.includes(h)) s.party.push(h);
}

export function addBond(s, pair, n = 1) {
  if (!pair) return;
  s.bonds[pair] = (s.bonds[pair] || 0) + n;
}

/** Marks a node as finished and hands out what it holds. */
export function complete(s, id) {
  const node = NODE[id];
  const out = { memories: [], joined: [], diary: null };
  if (!node || s.done.includes(id)) return out;
  s.done.push(id);
  if (node.joinAfter) { out.joined = node.joinAfter.filter((h) => !s.party.includes(h)); join(s, node.joinAfter); }
  for (const m of node.reward || []) if (!s.owned.includes(m)) { s.owned.push(m); out.memories.push(m); }
  if (node.diary && !s.diary.includes(node.diary)) { s.diary.push(node.diary); out.diary = node.diary; }
  if (node.end) s.actDone = true;
  autoEquip(s);
  return out;
}

/** Free slots are filled with unused memories, so nobody forgets to. */
export function autoEquip(s) {
  for (const h of s.party) {
    s.equipped[h] = s.equipped[h] || [];
    for (const m of s.owned) {
      if (s.equipped[h].length >= SLOTS) break;
      if (!s.equipped[h].includes(m) && canEquip(s, h, m) && !holder(s, m)) s.equipped[h].push(m);
    }
  }
}

export const knows = (s, hero, mem) => (s.known[hero] || []).includes(mem);
/** Who wears a memory that they have not learned (the single copy). */
export const holder = (s, mem) => Object.keys(s.equipped).find((h) => s.equipped[h].includes(mem) && !knows(s, h, mem)) || null;

export function canEquip(s, hero, mem) {
  if (!s.owned.includes(mem) || !s.party.includes(hero)) return false;
  if (knows(s, hero, mem)) return true;
  const h = holder(s, mem);
  return !h || h === hero;
}

export function toggleMemory(s, hero, mem) {
  s.equipped[hero] = s.equipped[hero] || [];
  const i = s.equipped[hero].indexOf(mem);
  if (i >= 0) { s.equipped[hero].splice(i, 1); return null; }
  if (s.equipped[hero].length >= SLOTS) return 'full';
  if (!canEquip(s, hero, mem)) return 'taken';
  s.equipped[hero].push(mem);
  return null;
}

/** Some other hero already knows it: this one can be taught for light. */
export function canTeach(s, hero, mem) {
  return s.party.includes(hero) && !knows(s, hero, mem) && s.light >= TEACH_COST && s.party.some((h) => knows(s, h, mem));
}

export function teach(s, hero, mem) {
  if (!canTeach(s, hero, mem)) return false;
  s.light -= TEACH_COST;
  (s.known[hero] = s.known[hero] || []).push(mem);
  return true;
}

/**
 * After a won battle: experience, light, health, and the memories
 * carried through the fight come one step closer to being learned.
 */
export function afterBattle(s, battle, reward) {
  const before = level(s);
  s.xp += reward.xp;
  s.light += reward.light;
  s.battles++;
  s.items = { olio: battle.items.olio, cera: battle.items.cera };
  const learned = [];
  for (const h of battle.heroes) {
    // the fallen get up shaky; the others catch their breath
    const share = h.hp > 0 ? Math.min(1, h.hp / h.maxHp + 0.35) : 0.3;
    s.hp[h.id] = Math.round(share * 100) / 100;
    for (const m of s.equipped[h.id] || []) {
      if (knows(s, h.id, m)) continue;
      const u = (s.uses[h.id] = s.uses[h.id] || {});
      u[m] = (u[m] || 0) + 1;
      if (u[m] >= LEARN) { (s.known[h.id] = s.known[h.id] || []).push(m); learned.push({ hero: h.id, memory: m }); }
    }
  }
  return { learned, levelUp: level(s) > before ? level(s) : 0 };
}

export function rest(s) {
  s.hp = {};
  s.items = { olio: Math.max(s.items.olio, SUPPLY.olio), cera: Math.max(s.items.cera, SUPPLY.cera) };
}

export const talksLeft = (s, camp) => TALKS_PER_CAMP - (TALKS[camp] || []).filter((x) => s.talks.includes(x.id)).length;

/** Talks that can be had at a camp: both people must be travelling. */
export const talksAt = (s, camp) => (TALKS[camp] || []).filter((x) => x.who.every((h) => s.party.includes(h)));

export function hadTalk(s, id) {
  if (!s.talks.includes(id)) s.talks.push(id);
}

/** Done nodes over the road, for the title screen. */
export const progressOf = (s) => Math.round((s.done.length / NODES.length) * 100);
