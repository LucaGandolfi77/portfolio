/* ============================================================
   Ultimo Colore — walking the lagoon (pure)
   ------------------------------------------------------------
   The field holds the party's position and the Faded that can be
   seen. update() moves everyone and reports what happened:
   an encounter, a story point reached, something to act on.
   ============================================================ */
import { NODE } from '../data/map.js';
import { WILD, CHESTS, STATUES } from '../data/places.js';
import { BOAT_AT, SPAWN, GATES } from './layout.js';
import { move, canStand, kindAt, gateOpen } from './terrain.js';
import * as P from './progress.js';

export const SPEED = { foot: 190, boat: 235 };
export const AGGRO = 200;       // how far they see, looking ahead
export const HEAR = 74;         // how close before they notice from behind
export const LEASH = 400;
export const CHASE_SPEED = 150;
export const CONTACT = 46;
export const STRIKE_RANGE = 125;
export const REACH = 78;
export const GRACE = 1.6;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const ctxOf = (s) => ({ boat: s.done.includes('stiva'), done: s.done });

/** Story fights show their guardians where the story happens. */
function guardians(s) {
  return P.available(s).map((id) => NODE[id]).filter((n) => n.enemies).map((n) => ({
    id: n.id, node: n.id, enemies: n.enemies, art: n.art, x: n.at.x, y: n.at.y, home: { ...n.at }, roam: n.type === 'boss' ? 0 : 14, boss: n.type === 'boss',
    state: 'guard', phase: n.at.x % 7,
  }));
}

function wanderers(s) {
  return WILD.filter((w) => !s.cleared.includes(w.id) && (!w.after || s.done.includes(w.after)) && s.done.includes('stiva')).map((w) => ({
    id: w.id, wild: w.id, enemies: w.enemies, art: w.art, x: w.x, y: w.y, home: { x: w.x, y: w.y }, roam: w.roam, state: 'idle', phase: (w.x + w.y) % 6, dir: { x: 0, y: 1 },
  }));
}

export function createField(s) {
  const field = { pos: { ...s.pos }, facing: 1, moving: false, trail: [], time: 0, grace: GRACE, groups: [...guardians(s), ...wanderers(s)], near: null, done: false };
  // never start inside a wall, whatever the save says
  if (!canStand(field.pos.x, field.pos.y, ctxOf(s))) field.pos = { ...SPAWN };
  field.trail = [{ ...field.pos }];
  return field;
}

/** What can be acted on from here: {kind, id, node?} or null. */
export function nearby(s, field) {
  const open = P.available(s);
  const options = [];
  const add = (kind, id, at, reach = REACH, extra = {}) => { const d = dist(field.pos, at); if (d <= reach) options.push({ kind, id, d, ...extra }); };
  for (const id of open) {
    const n = NODE[id];
    if (n.enemies) continue;
    if (n.type === 'camp') add('camp', id, n.at, 110);
    else if (id === 'stiva') add('board', id, BOAT_AT, 90);
    else if (!n.auto) add('story', id, n.at, 90);
  }
  // camps already used stay open for resting
  for (const id of s.done) if (NODE[id]?.type === 'camp') add('camp', id, NODE[id].at, 110);
  for (const c of CHESTS) if (!s.opened.includes(c.id)) add('chest', c.id, c, REACH);
  for (const st of STATUES) add('statue', st.id, st, 70, { read: s.read.includes(st.id) });
  for (const g of field.groups) if (g.state === 'idle' || g.state === 'alert') add('strike', g.id, g, STRIKE_RANGE);
  // pushing against a closed passage tells you so
  for (const g of GATES) if (!gateOpen(g, s.done)) add('gate', g.id, { x: Math.max(g.x, Math.min(g.x + g.w, field.pos.x)), y: Math.max(g.y, Math.min(g.y + g.h, field.pos.y)) }, 42);
  const rank = { strike: 0, board: 1, story: 2, camp: 3, chest: 4, statue: 5, gate: 6 };
  return options.sort((a, b) => rank[a.kind] - rank[b.kind] || a.d - b.d)[0] || null;
}

/** Whether an idle enemy notices the party: ahead of it, or very close. */
export function notices(g, pos) {
  const dx = pos.x - g.x, dy = pos.y - g.y, d = Math.hypot(dx, dy);
  if (d < HEAR) return true;
  return d < AGGRO && (dx * g.dir.x + dy * g.dir.y) / d > 0.35;
}

const toward = (from, to, step) => {
  const dx = to.x - from.x, dy = to.y - from.y, d = Math.hypot(dx, dy);
  return d < 1e-6 ? { dx: 0, dy: 0, d } : { dx: (dx / d) * Math.min(step, d), dy: (dy / d) * Math.min(step, d), d };
};

/** The Faded can swim and wade, but never cross walls or closed gates. */
function drift(g, dx, dy, done) {
  const next = move(g, dx, dy, { boat: true, done });
  g.x = next.x; g.y = next.y;
}

/**
 * input: {x, y} in −1…1. Returns an event or null:
 * {type: 'encounter', group, advantage} · {type: 'auto', node}
 */
export function update(s, field, dt, input = { x: 0, y: 0 }) {
  const face = (g, m) => { const l = Math.hypot(m.dx, m.dy); if (l > 0.05) g.dir = { x: m.dx / l, y: m.dy / l }; };
  field.time += dt;
  field.grace = Math.max(0, field.grace - dt);
  const ctx = ctxOf(s);
  const len = Math.hypot(input.x, input.y);
  field.moving = false;
  if (len > 0.08) {
    const k = Math.min(1, len) / len;
    const afloat = kindAt(field.pos.x, field.pos.y, s.done) === 'water';
    const step = SPEED[afloat ? 'boat' : 'foot'] * dt;
    const next = move(field.pos, input.x * k * step, input.y * k * step, ctx);
    field.moving = Math.hypot(next.x - field.pos.x, next.y - field.pos.y) > 0.2;
    if (Math.abs(input.x) > 0.15) field.facing = input.x < 0 ? -1 : 1;
    field.pos = next;
    s.pos = { x: Math.round(next.x), y: Math.round(next.y) };
    const last = field.trail[field.trail.length - 1];
    if (dist(last, next) >= 6) { field.trail.push({ ...next }); if (field.trail.length > 60) field.trail.shift(); }
  }

  for (const g of field.groups) {
    const d = dist(g, field.pos);
    // walked into before it turned round: the party starts
    if (g.state === 'idle' && !field.grace && d < CONTACT) return { type: 'encounter', group: g, advantage: 'party' };
    if (g.state === 'guard') {
      g.y = g.home.y + Math.sin(field.time * 1.4 + g.phase) * (g.roam ? 3 : 5);
    } else {
      if (g.state === 'idle') {
        const aim = { x: g.home.x + Math.cos(field.time * 0.45 + g.phase) * g.roam, y: g.home.y + Math.sin(field.time * 0.7 + g.phase * 2) * g.roam * 0.6 };
        const m = toward(g, aim, 40 * dt);
        drift(g, m.dx, m.dy, s.done);
        face(g, m);
        if (!field.grace && notices(g, field.pos)) { g.state = 'alert'; g.timer = 0.65; }
      } else if (g.state === 'alert') {
        face(g, toward(g, field.pos, 1));
        g.timer -= dt;
        if (g.timer <= 0) g.state = 'chase';
      } else if (g.state === 'chase') {
        const m = toward(g, field.pos, CHASE_SPEED * dt);
        drift(g, m.dx, m.dy, s.done);
        face(g, m);
        if (dist(g, g.home) > LEASH || d > AGGRO * 1.8) g.state = 'return';
      } else if (g.state === 'return') {
        const m = toward(g, g.home, CHASE_SPEED * dt);
        drift(g, m.dx, m.dy, s.done);
        face(g, m);
        if (m.d < 12 || dist(g, g.home) < 14) g.state = 'idle';
      }
    }
    const contact = g.boss ? CONTACT * 2 : g.node ? CONTACT * 1.5 : CONTACT;
    if (!field.grace && dist(g, field.pos) < contact) {
      // caught in a chase: they start; a story guardian or a startled one: nobody
      const advantage = g.state === 'idle' ? 'party' : g.state === 'chase' ? 'enemy' : null;
      return { type: 'encounter', group: g, advantage };
    }
  }

  const auto = P.available(s).find((id) => NODE[id].auto);
  if (auto) return { type: 'auto', node: auto };
  field.near = nearby(s, field);
  return null;
}

/** After a flight or a defeat: step back and give the party a moment. */
export function retreat(s, field, group) {
  const away = toward(group, field.pos, 1);
  const next = move(field.pos, away.dx * 150, away.dy * 150, ctxOf(s));
  field.pos = next;
  s.pos = { x: Math.round(next.x), y: Math.round(next.y) };
  field.grace = GRACE * 1.5;
  for (const g of field.groups) if (g.state === 'chase' || g.state === 'alert') g.state = 'return';
}

/** Where the compass points: the first story point that moves things on. */
export function objective(s) {
  const open = P.available(s).map((id) => NODE[id]);
  return open.find((n) => !n.optional && !n.auto) || open.find((n) => !n.auto) || null;
}

export function openChest(s, id) {
  const c = CHESTS.find((x) => x.id === id);
  if (!c || s.opened.includes(id)) return null;
  s.opened.push(id);
  s.items.olio += c.olio;
  s.items.cera += c.cera;
  s.light += c.light;
  return c;
}

export function readStatue(s, id) {
  const st = STATUES.find((x) => x.id === id);
  if (st && !s.read.includes(id)) s.read.push(id);
  return st || null;
}
