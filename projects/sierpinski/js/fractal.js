/* Fractal Observatory — pure geometry generators with creative transforms */
import { seeded } from './rng.js';

export function polyVerts(n, rotation = -Math.PI / 2) {
  const v = [];
  for (let i = 0; i < n; i++) {
    const a = rotation + i * 2 * Math.PI / n;
    v.push({ x: Math.cos(a), y: Math.sin(a) });
  }
  return v;
}

function jitterPoint(p, amount, rng) {
  if (!amount) return p;
  const a = rng() * Math.PI * 2, r = rng() * amount / 100 * 0.25;
  return { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r };
}

function skew(p, sx = 0, sy = 0) {
  const a = sx * Math.PI / 180, b = sy * Math.PI / 180;
  return { x: p.x + Math.tan(a) * p.y, y: p.y + Math.tan(b) * p.x };
}

export function trianglePath(depth, opts = {}) {
  const tris = [];
  const rng = seeded(opts.seed == null ? 12345 : opts.seed);
  const v = polyVerts(3).map(p => skew(jitterPoint(p, opts.jitter || 0, rng), opts.skewX, opts.skewY));
  function rec(a, b, c, d) {
    if (d <= 0) { tris.push([a, b, c]); return; }
    const ab = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const bc = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
    const ca = { x: (c.x + a.x) / 2, y: (c.y + a.y) / 2 };
    rec(a, ab, ca, d - 1); rec(ab, b, bc, d - 1); rec(ca, bc, c, d - 1);
  }
  rec(v[0], v[1], v[2], Math.max(0, depth | 0));
  return { type: 'tris', items: tris, count: tris.length };
}

const OFFS = {
  carpet: [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]],
  vicsek: [[0,0],[1,0],[-1,0],[0,1],[0,-1]],
  dust: [[-1,-1],[1,-1],[-1,1],[1,1]]
};

export function squares(kind, depth, opts = {}) {
  const out = [], offs = OFFS[kind] || OFFS.carpet;
  const tw = (opts.twist || 0) * Math.PI / 180;
  function rec(x, y, s, d, depthIdx) {
    if (d <= 0) { out.push({ x, y, s, level: depthIdx }); return; }
    const s3 = s / 3;
    const rot = tw * (depth - d);
    const c = Math.cos(rot), n = Math.sin(rot);
    for (const [ox, oy] of offs) {
      let dx = (ox + 1) * s3, dy = (oy + 1) * s3;
      rec(x + dx * c - dy * n, y + dx * n + dy * c, s3, d - 1, depthIdx + 1);
    }
  }
  rec(-1, -1, 2, Math.max(0, depth | 0), 0);
  return { type: 'squares', items: out, count: out.length };
}

export function tSquare(depth) {
  const out = [];
  function rec(cx, cy, s, d) {
    if (d <= 0) { out.push({ x: cx - s / 2, y: cy - s / 2, s, level: d }); return; }
    const o = s / 2, h = s / 4;
    rec(cx - o + h, cy - o + h, h, d - 1);
    rec(cx + o - h, cy - o + h, h, d - 1);
    rec(cx - o + h, cy + o - h, h, d - 1);
    rec(cx + o - h, cy + o - h, h, d - 1);
  }
  rec(0, 0, 2, Math.max(0, depth | 0));
  return { type: 'squares', items: out, count: out.length };
}

export function koch(iters, angle = 60) {
  const v = polyVerts(3);
  let segs = [[v[0], v[2]], [v[2], v[1]], [v[1], v[0]]];
  const rad = (angle || 60) * Math.PI / 180;
  for (let it = 0; it < (iters | 0); it++) {
    const ns = [];
    for (const [a, b] of segs) {
      const dx = (b.x - a.x) / 3, dy = (b.y - a.y) / 3;
      const len = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx) - (Math.PI - rad);
      const p1 = { x: a.x + dx, y: a.y + dy };
      const pk = { x: p1.x + Math.cos(ang) * len, y: p1.y + Math.sin(ang) * len };
      const p2 = { x: a.x + 2 * dx, y: a.y + 2 * dy };
      ns.push([a, p1], [p1, pk], [pk, p2], [p2, b]);
    }
    segs = ns;
  }
  const pts = segs.map(s => s[0]);
  pts.push({ x: segs[0][0].x, y: segs[0][0].y });
  return { type: 'path', points: pts, closed: true, count: pts.length };
}

export function hTree(depth, ratio = 63) {
  const segs = [], r = (ratio || 63) / 100;
  function rec(x, y, len, d) {
    if (d <= 0) return;
    const vy = len * 0.72;
    segs.push([{ x: x - len, y: y - vy }, { x: x + len, y: y - vy }]);
    segs.push([{ x: x - len, y: y + vy }, { x: x + len, y: y + vy }]);
    segs.push([{ x: x - len, y: y - vy }, { x: x - len, y: y + vy }]);
    segs.push([{ x: x + len, y: y - vy }, { x: x + len, y: y + vy }]);
    const nl = len * r;
    rec(x - len, y - vy, nl, d - 1); rec(x + len, y - vy, nl, d - 1);
    rec(x - len, y + vy, nl, d - 1); rec(x + len, y + vy, nl, d - 1);
  }
  rec(0, 0, 1, Math.max(0, depth | 0));
  return { type: 'segments', items: segs, count: segs.length };
}

export function tree(depth, spread = 26, ratio = 72, asym = 0) {
  const segs = [], sp = (spread || 26) * Math.PI / 180, r = (ratio || 72) / 100;
  const as = (asym || 0) * Math.PI / 180;
  function rec(x, y, ang, len, d) {
    if (d <= 0) return;
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    segs.push([{ x, y }, { x: ex, y: ey }, d]);
    rec(ex, ey, ang - sp + as, len * r, d - 1);
    rec(ex, ey, ang + sp - as, len * r, d - 1);
  }
  rec(0, 1, -Math.PI / 2, 1.05, Math.max(0, depth | 0));
  return { type: 'segments', items: segs, count: segs.length };
}

export function dragon(iters, turn = 90) {
  let turns = [];
  for (let i = 0; i < (iters | 0); i++) {
    const rev = turns.slice().reverse().map(x => -x);
    turns = turns.concat([1], rev);
  }
  const rad = (turn || 90) * Math.PI / 180;
  const pts = [{ x: 0, y: 0 }];
  let x = 0, y = 0, dir = 0;
  for (const t of turns) {
    dir += t * rad;
    x += Math.cos(dir) * 0.02; y += Math.sin(dir) * 0.02;
    pts.push({ x, y });
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, span = Math.max(maxX - minX, maxY - minY) || 1;
  const out = pts.map(p => ({ x: (p.x - cx) / span * 1.8, y: (p.y - cy) / span * 1.8 }));
  return { type: 'path', points: out, closed: false, count: out.length };
}

export function build(formId, params, seed = 12345) {
  const P = params || {};
  switch (formId) {
    case 'tri': return trianglePath(P.depth || 8, { ...P, seed });
    case 'carpet': return squares('carpet', P.depth || 5, P);
    case 'vicsek': return squares('vicsek', P.depth || 6, P);
    case 'dust': return squares('dust', P.depth || 6, P);
    case 'tsquare': return tSquare(P.depth || 7);
    case 'koch': return koch(P.depth || 4, P.angle || 60);
    case 'htree': return hTree(P.depth || 7, P.ratio || 63);
    case 'ftree': return tree(P.depth || 10, P.spread || 26, P.ratio || 72, P.asym || 0);
    case 'dragon': return dragon(P.iters || 12, P.turn || 90);
    default: return trianglePath(4, { seed });
  }
}

export function chaosStep(state, opts = {}) {
  const n = Math.max(3, opts.verts || 3);
  const q = Math.max(0.05, Math.min(0.95, (opts.pull || 50) / 100));
  const V = polyVerts(n);
  const rng = opts.rng || Math.random;
  const weights = V.map((_, i) => 1 + (opts.jitter ? rng() * (opts.jitter / 100) : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let idx = 0, r = rng() * total;
  for (let i = 0; i < n; i++) { r -= weights[i]; if (r <= 0) { idx = i; break; } }
  if (opts.noRepeat && idx === state.prev) idx = (idx + 1) % n;
  state.prev = idx;
  state.x = state.x + (V[idx].x - state.x) * q;
  state.y = state.y + (V[idx].y - state.y) * q;
  state.count++;
  state.vertices = V;
  return { x: state.x, y: state.y, index: idx };
}

export function newChaos(seed = 1) {
  const rng = seeded(seed);
  return { x: rng() * 0.6 - 0.3, y: rng() * 0.6 - 0.3, prev: -1, count: 0, vertices: [] };
}
