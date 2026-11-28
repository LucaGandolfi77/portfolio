/* ============================================================
   Ultimo Colore — where feet and keels can go (pure)
   ============================================================ */
import { WORLD, LEAN, ISLANDS, SHALLOWS, PIERS, HOUSES, TOWER, WILLOWS, WALLS, BLOCKS, GATES } from './layout.js';

export const RADIUS = 11;

export function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
const box = (poly) => {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};
const LAND = ISLANDS.map((i) => ({ ...i, box: box(i.poly) }));
const SHOAL = SHALLOWS.map((i) => ({ ...i, box: box(i.poly) }));

/** A house blocks its footprint and a little behind it; further back one walks hidden by the roof. */
export const houseBlock = (h) => ({ x: h.x, y: h.y - h.h * LEAN * 0.3, w: h.w, h: h.d + h.h * LEAN * 0.3 });
const SOLID = [
  ...HOUSES.map(houseBlock),
  ...BLOCKS,
  { x: TOWER.x - TOWER.w / 2, y: TOWER.y - TOWER.h * LEAN * 0.3, w: TOWER.w, h: TOWER.h * LEAN * 0.3 + TOWER.w / 2 },
  ...WALLS.flatMap((w) => (w.gap
    ? [{ x: w.from, y: w.y, w: w.gap[0] - w.from, h: w.h }, { x: w.gap[1], y: w.y, w: w.to - w.gap[1], h: w.h }]
    : [{ x: w.from, y: w.y, w: w.to - w.from, h: w.h }])),
];
const TRUNKS = WILLOWS.map(([x, y, s]) => ({ x, y, r: 20 * s }));

export const gateOpen = (gate, done) => done.includes(gate.needs);

/** What is at a point: 'solid' | 'pier' | 'land' | 'shallow' | 'water'. */
export function kindAt(x, y, done = []) {
  const m = WORLD.margin;
  if (x < m || y < m || x > WORLD.w - m || y > WORLD.h - m) return 'solid';
  for (const g of GATES) if (!gateOpen(g, done) && inRect(x, y, g)) return 'solid';
  for (const p of PIERS) if (inRect(x, y, p)) return 'pier';
  for (const r of SOLID) if (inRect(x, y, r)) return 'solid';
  for (const t of TRUNKS) if ((x - t.x) ** 2 + (y - t.y) ** 2 < t.r ** 2) return 'solid';
  for (const l of LAND) if (inRect(x, y, l.box) && inPoly(x, y, l.poly)) return 'land';
  for (const s of SHOAL) if (inRect(x, y, s.box) && inPoly(x, y, s.poly)) return 'shallow';
  return 'water';
}

const passable = (kind, boat) => kind !== 'solid' && (kind !== 'water' || boat);

/** Can a body of the standard radius stand here? ctx: {boat, done} */
export function canStand(x, y, { boat = false, done = [] } = {}, r = RADIUS) {
  for (const [dx, dy] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) if (!passable(kindAt(x + dx, y + dy, done), boat)) return false;
  return true;
}

/** Moves by (dx, dy), sliding along whatever is in the way. */
export function move(pos, dx, dy, ctx) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 6));
  let { x, y } = pos;
  for (let i = 0; i < steps; i++) {
    const sx = dx / steps, sy = dy / steps;
    if (canStand(x + sx, y + sy, ctx)) { x += sx; y += sy; continue; }
    if (sx && canStand(x + sx, y, ctx)) x += sx;
    else if (sy && canStand(x, y + sy, ctx)) y += sy;
  }
  return { x, y };
}

/**
 * Shortest walk on a grid, for tests and for tapping on the map.
 * Returns a list of points ending near the goal, or null.
 */
export function findPath(from, to, ctx, reach = 60, cell = 16) {
  const cols = Math.ceil(WORLD.w / cell), rows = Math.ceil(WORLD.h / cell);
  const key = (c, r) => r * cols + c;
  const free = new Map();
  const ok = (c, r) => {
    const k = key(c, r);
    if (!free.has(k)) free.set(k, c >= 0 && r >= 0 && c < cols && r < rows && canStand((c + 0.5) * cell, (r + 0.5) * cell, ctx));
    return free.get(k);
  };
  const start = [Math.floor(from.x / cell), Math.floor(from.y / cell)];
  const prev = new Map([[key(...start), null]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const [c, r] = queue[head];
    const x = (c + 0.5) * cell, y = (r + 0.5) * cell;
    if (Math.hypot(x - to.x, y - to.y) <= reach) {
      const path = [];
      for (let k = key(c, r); k !== null; k = prev.get(k)) path.push({ x: ((k % cols) + 0.5) * cell, y: (Math.floor(k / cols) + 0.5) * cell });
      return path.reverse();
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nc = c + dc, nr = r + dr, k = key(nc, nr);
      if (prev.has(k) || !ok(nc, nr) || (dc && dr && (!ok(c, nr) || !ok(nc, r)))) continue;
      prev.set(k, key(c, r));
      queue.push([nc, nr]);
    }
  }
  return null;
}
