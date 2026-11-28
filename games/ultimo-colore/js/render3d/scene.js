/* ============================================================
   Ultimo Colore — who stands where, and how they move (pure)
   ------------------------------------------------------------
   Turns the walking field into the list of figures to draw,
   remembering each one's heading and stride between frames.
   ============================================================ */
import { WORLD, LEAN, GATES, BOAT_AT, HOUSES, TOWER } from '../world/layout.js';
import { kindAt, gateOpen } from '../world/terrain.js';
import { CHESTS } from '../data/places.js';
import { heroModel, dogModel } from './heroes.js';
import { boatModel, SEATS, DOG_SEAT } from './boat.js';
import { creatureModel } from './creatures.js';
import { lanternModel, barricadeModel, reedsModel } from './props.js';
import { turnToward } from './rig.js';

export const SIZE = { leader: 1.24, follower: 1.1, dog: 1.08, boat: 0.96, aboard: 0.83 };
/** How far behind the leader each follower walks, and the dog last. */
export const GAP = 52;
const STRIDE_LENGTH = 17;   // map units for each radian of the walk

/** The point `back` units behind the head of a trail (oldest first, then `head`). */
export function followPoint(trail, head, back) {
  let from = head, left = back;
  for (let i = trail.length - 1; i >= 0; i--) {
    const to = trail[i], d = Math.hypot(to.x - from.x, to.y - from.y);
    if (d >= left && d > 0) return { x: from.x + ((to.x - from.x) * left) / d, y: from.y + ((to.y - from.y) * left) / d };
    left -= d;
    from = to;
  }
  return { x: from.x, y: from.y };
}

/** Silhouettes of the buildings as painted, for hiding who walks behind. */
export function occluders() {
  const houses = HOUSES.map((h) => {
    const wall = h.h * LEAN, ridge = h.h * 1.34 * LEAN;
    return {
      points: [[h.x, h.y + h.d], [h.x + h.w, h.y + h.d], [h.x + h.w + 8, h.y - wall - 6], [h.x + h.w - 12, Math.min(h.y - wall - 6, h.y + h.d / 2 - ridge)], [h.x + 12, Math.min(h.y - wall - 6, h.y + h.d / 2 - ridge)], [h.x - 8, h.y - wall - 6]],
      depthY: h.y + h.d * 0.55,
    };
  });
  const w = TOWER.w / 2, tall = TOWER.h * LEAN;
  houses.push({ points: [[TOWER.x - w, TOWER.y + w], [TOWER.x + w, TOWER.y + w], [TOWER.x + w + 6, TOWER.y - tall], [TOWER.x - w + 6, TOWER.y - tall]], depthY: TOWER.y });
  return houses;
}

export function createCast() {
  const memory = new Map();
  let last = null;

  /** Where a figure is heading and how far through its stride it is. */
  function motion(id, x, y, dt, face = null) {
    let m = memory.get(id);
    if (!m) memory.set(id, (m = { x, y, heading: face ?? 0.35, phase: 0, amp: 0 }));
    const dx = x - m.x, dy = y - m.y, d = Math.hypot(dx, dy);
    const jumped = d > 70 || dt <= 0;
    const want = face ?? (d > 0.4 ? Math.atan2(dx, dy) : null);
    if (want !== null) m.heading = jumped ? want : turnToward(m.heading, want, dt * 11);
    if (!jumped) {
      m.phase += d / STRIDE_LENGTH * Math.PI * 0.62;
      const speed = Math.min(1, d / dt / 130);
      m.amp += (speed - m.amp) * Math.min(1, dt * 12);
    } else if (dt > 0) m.amp = 0;
    m.x = x; m.y = y;
    return m;
  }

  return {
    /** actors for one frame; time = field.time */
    actors(field, s, seen) {
      const t = field.time;
      const dt = last === null || last.field !== field ? 0 : Math.max(0, Math.min(0.1, t - last.t));
      if (last && last.field !== field) memory.clear();
      last = { field, t };
      const out = [];
      const { x, y } = field.pos;
      const afloat = kindAt(x, y, s.done) === 'water';

      if (afloat) {
        const m = motion('boat', x, y, dt);
        const bob = Math.sin(t * 2.4) * 2;
        const boat = boatModel(), k = SIZE.boat;
        const common = { x, y, base: m.heading, xray: true };
        out.push({ ...common, model: boat, heading: m.heading, scale: k, lift: bob, pose: boat.pose({ t, amp: m.amp }), clip: 0, kind: 'boat', id: 'boat' });
        s.party.forEach((id, i) => {
          const model = heroModel(id), [sx, sy, sz] = SEATS[i];
          out.push({ ...common, model, heading: m.heading + (i % 2 ? -0.25 : 0.2), scale: SIZE.aboard, lift: bob, offset: [sx * k, sy * k, sz * k], pose: model.pose({ t: t + i * 1.7, sit: true }), shadow: false, id });
        });
        const dog = dogModel();
        out.push({ ...common, model: dog, heading: m.heading, scale: SIZE.aboard, lift: bob, offset: [DOG_SEAT[0] * k, DOG_SEAT[1] * k, DOG_SEAT[2] * k], pose: dog.pose({ t, sit: true }), shadow: false, id: 'ombra' });
        // so that stepping ashore starts from here
        for (const id of [...s.party, 'ombra']) memory.set(id, { x, y, heading: m.heading, phase: 0, amp: 0 });
      } else {
        memory.delete('boat');
        const walkers = [...s.party, 'ombra'];
        walkers.forEach((id, i) => {
          const p = i ? followPoint(field.trail, field.pos, i * GAP) : field.pos;
          const model = id === 'ombra' ? dogModel() : heroModel(id);
          const m = motion(id, p.x, p.y, dt);
          const wet = kindAt(p.x, p.y, s.done) === 'shallow';
          out.push({ model, id, x: p.x, y: p.y, heading: m.heading, scale: id === 'ombra' ? SIZE.dog : i ? SIZE.follower : SIZE.leader, lift: wet ? -7 : 0, clip: wet ? 0 : -1000, shadow: !wet, wet, xray: true, speed: m.amp, pose: model.pose({ t: t + i * 1.3, phase: m.phase, amp: m.amp }) });
        });
      }

      if (!s.done.includes('stiva')) {
        const boat = boatModel();
        out.push({ model: boat, id: 'moored', x: BOAT_AT.x, y: BOAT_AT.y, heading: 0.5, scale: SIZE.boat, lift: Math.sin(t * 1.4) * 1.5, clip: 0, pose: boat.pose({ t: t * 0.6 }), kind: 'boat' });
      }

      for (const g of field.groups) {
        if (!seen(g, 280)) continue;
        const anger = g.state === 'chase' ? 1 : g.state === 'alert' ? 0.7 : 0;
        const spread = g.boss ? 92 : 50;
        const wet = ['water', 'shallow'].includes(kindAt(g.x, g.y, s.done));
        const moving = g.state === 'chase' || g.state === 'return' ? 1 : g.state === 'idle' ? 0.3 : 0;
        // watchers face where they look; guardians turn to whoever comes near
        const near = Math.hypot(x - g.x, y - g.y) < 420;
        const face = g.dir ? Math.atan2(g.dir.x, g.dir.y) : near ? Math.atan2(x - g.x, y - g.y) : 0;
        g.enemies.forEach((type, i) => {
          const ex = g.x + (i ? (i % 2 ? 1 : -1) * spread * Math.ceil(i / 2) : 0), ey = g.y - (i ? 20 : 0);
          const model = creatureModel(type);
          const m = motion(`${g.id}:${i}`, ex, ey, dt, face);
          const boss = g.boss && i === 0;
          out.push({ model, id: g.id, x: ex, y: ey, heading: m.heading * (boss ? 0.8 : 1), scale: boss ? 1 : i ? 0.84 : 0.98, clip: wet ? 0 : -1000, shadow: !wet, wet, enemy: type, boss,
            tint: g.state === 'alert' ? [1, 0.3, 0.25, 0.18 + Math.sin(t * 22) * 0.14] : null, pose: model.pose({ t: t + i * 2.1 + g.home.x * 0.01, amp: moving, anger }) });
        });
      }

      const lantern = lanternModel();
      for (const c of CHESTS) if (!s.opened.includes(c.id) && seen(c)) out.push({ model: lantern, id: c.id, x: c.x, y: c.y, pose: lantern.pose({ t: t + c.x }), chest: true });

      for (const gate of GATES) {
        const cx = gate.x + gate.w / 2, cy = gate.y + gate.h / 2;
        if (gateOpen(gate, s.done) || !seen({ x: cx, y: cy }, 240)) continue;
        if (gate.id === 'ponte') out.push({ model: barricadeModel(gate.w), id: gate.id, x: cx, y: gate.y + gate.h - 10, pose: {}, gate: true });
        else { const model = reedsModel(gate.w, gate.h); out.push({ model, id: gate.id, x: cx, y: cy, pose: model.pose({ t }), shadow: false, gate: true }); }
      }
      return out;
    },
    /** The heading remembered for a figure (for wakes and lights). */
    heading: (id) => memory.get(id)?.heading ?? 0,
  };
}
