/* ============================================================
   Ultimo Colore — low-poly shapes (pure)
   ------------------------------------------------------------
   x right, y up, z toward the viewer; a figure faces +z. Every
   shape is convex, so its triangles are wound to face away from
   its own middle. A second, averaged normal per corner lets the
   outline pass swell the shape without tearing it.
   ============================================================ */
import { MAX_BONES } from './rig.js';

export const STRIDE = 14;   // position 3, normal 3, swell 3, colour 3, bone, material
export const MAT = { paint: 0, glass: 1, glow: 2, metal: 3 };

export const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(...a); return l > 1e-9 ? mul(a, 1 / l) : [0, 1, 0]; };

function turn(p, [rx = 0, ry = 0, rz = 0]) {
  let [x, y, z] = p;
  [x, y] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz)];
  [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
  [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
  return [x, y, z];
}

/** bones: [name, parentName | null, pivot] in an order where parents come first. */
export function builder(bones) {
  const list = bones.map(([name, parent, pivot]) => ({ name, parent: parent === null ? -1 : bones.findIndex((b) => b[0] === parent), pivot }));
  if (list.length > MAX_BONES) throw new Error(`too many bones: ${list.length}`);
  list.forEach((b, i) => { if (b.parent >= i || (bones[i][1] !== null && b.parent < 0)) throw new Error(`bad parent for ${b.name}`); });
  const data = [];
  const indexOf = (name) => { const i = list.findIndex((b) => b.name === name); if (i < 0) throw new Error(`no bone ${name}`); return i; };

  /** One convex shape: triangles of corners, wound outward from `middle`. */
  function shape(bone, tris, color, { mat = MAT.paint, middle = null, smooth = null, flat = false } = {}) {
    const b = indexOf(bone), c = typeof color === 'string' ? rgb(color) : color;
    const all = tris.flat();
    const mid = middle || mul(all.reduce(add, [0, 0, 0]), 1 / all.length);
    const faces = [];
    for (let tri of tris) {
      let n = cross(sub(tri[1], tri[0]), sub(tri[2], tri[0]));
      if (Math.hypot(...n) < 1e-7) continue;
      const centre = mul(add(add(tri[0], tri[1]), tri[2]), 1 / 3);
      if (!flat && dot(n, sub(centre, mid)) < 0) { tri = [tri[0], tri[2], tri[1]]; n = mul(n, -1); }
      faces.push({ tri, n: unit(n) });
    }
    const swell = new Map();
    const key = (p) => p.map((v) => Math.round(v * 50)).join(',');
    for (const f of faces) {
      for (const p of f.tri) {
        const seen = swell.get(key(p)) || [];
        if (!seen.some((n) => dot(n, f.n) > 0.995)) seen.push(f.n);
        swell.set(key(p), seen);
      }
    }
    for (const f of faces) {
      for (const p of f.tri) {
        const s = unit(swell.get(key(p)).reduce(add, [0, 0, 0]));
        data.push(...p, ...(smooth ? smooth(p) : f.n), ...s, ...c, b, mat);
      }
    }
  }

  const api = {
    shape,
    box(bone, centre, size, color, opts = {}) {
      const corner = (i) => add(centre, turn([(i & 1 ? 0.5 : -0.5) * size[0], (i & 2 ? 0.5 : -0.5) * size[1], (i & 4 ? 0.5 : -0.5) * size[2]], opts.rot || []));
      const quads = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
      shape(bone, quads.flatMap(([a, b, c, d]) => [[corner(a), corner(b), corner(c)], [corner(a), corner(c), corner(d)]]), color, { ...opts, middle: centre });
      return api;
    },
    /** A rod, cone or flared coat from a to b. `squash` flattens it front to back. */
    tube(bone, a, b, ra, rb, color, opts = {}) {
      const { sides = 8, squash = 1, caps = true, spin = 0 } = opts;
      const axis = unit(sub(b, a));
      const side = unit(cross(Math.abs(axis[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0], axis));
      const other = cross(axis, side);
      const ring = (at, r) => Array.from({ length: sides }, (_, i) => {
        const q = ((i + spin) / sides) * Math.PI * 2;
        const off = add(mul(side, Math.cos(q) * r), mul(other, Math.sin(q) * r));
        return add(at, [off[0], off[1], off[2] * squash]);
      });
      const A = ring(a, ra), B = ring(b, rb), tris = [];
      for (let i = 0; i < sides; i++) {
        const j = (i + 1) % sides;
        if (ra > 0) tris.push([A[i], A[j], rb > 0 ? B[j] : b]);
        if (rb > 0) tris.push([ra > 0 ? A[i] : a, B[j], B[i]]);
        if (caps && ra > 0) tris.push([a, A[j], A[i]]);
        if (caps && rb > 0) tris.push([b, B[i], B[j]]);
      }
      shape(bone, tris, color, { ...opts, middle: mul(add(a, b), 0.5) });
      return api;
    },
    ball(bone, centre, radii, color, opts = {}) {
      const { rows = 6, cols = 10, round = false, rot = [] } = opts;
      const r = Array.isArray(radii) ? radii : [radii, radii, radii];
      const at = (i, j) => {
        const v = (i / rows) * Math.PI, u = (j / cols) * Math.PI * 2;
        return add(centre, turn([Math.sin(v) * Math.cos(u) * r[0], Math.cos(v) * r[1], Math.sin(v) * Math.sin(u) * r[2]], rot));
      };
      const tris = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (i > 0) tris.push([at(i, j), at(i, j + 1), at(i + 1, j + 1)]);
          if (i < rows - 1) tris.push([at(i, j), at(i + 1, j + 1), at(i + 1, j)]);
        }
      }
      const smooth = round && !rot.length ? (p) => unit([(p[0] - centre[0]) / r[0] ** 2, (p[1] - centre[1]) / r[1] ** 2, (p[2] - centre[2]) / r[2] ** 2]) : null;
      shape(bone, tris, color, { ...opts, middle: centre, smooth });
      return api;
    },
    /** A cut stone: two cones meeting at a waist. */
    crystal(bone, base, tip, radius, color, opts = {}) {
      const { sides = 5, waist = 0.35, mat = MAT.glass, spin = 0.2 } = opts;
      const axis = sub(tip, base), mid = add(base, mul(axis, waist));
      const a = unit(axis), s = unit(cross(Math.abs(a[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0], a)), o = cross(a, s);
      const ring = Array.from({ length: sides }, (_, i) => { const q = ((i + spin) / sides) * Math.PI * 2; return add(mid, add(mul(s, Math.cos(q) * radius), mul(o, Math.sin(q) * radius))); });
      shape(bone, ring.flatMap((p, i) => { const n = ring[(i + 1) % sides]; return [[base, n, p], [p, n, tip]]; }), color, { ...opts, mat, middle: mid });
      return api;
    },
    /** A flat sheet seen from both sides (cloth, sails): triangles as given. */
    sheet(bone, tris, color, opts = {}) {
      shape(bone, tris, color, { ...opts, flat: true });
      shape(bone, tris.map(([a, b, c]) => [a, c, b]), color, { ...opts, flat: true });
      return api;
    },
    build(extra = {}) {
      return { bones: list, data: new Float32Array(data), count: data.length / STRIDE, ...extra };
    },
  };
  return api;
}
