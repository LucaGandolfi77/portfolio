/* ============================================================
   Agente Zero — the camera behind the shooter (pure math)
   ------------------------------------------------------------
   A level pinhole camera with a shifted lens, so verticals stay
   vertical. A small shear lifts far things a little, as if seen
   from higher up: it keeps the rim readable on a phone without
   bending any straight line.
   ============================================================ */

export const BACK = 4;       // metres behind the shooter
export const EYE = 3.35;     // camera height
const SIDE = 0.42;           // sideways offset, so the player is not on the ball line
export const NEAR = 0.5;

/** Builds the camera for a floor spot and a screen of w × h CSS pixels. */
export function makeCamera(spot, w, h) {
  const d = Math.max(0.6, Math.hypot(spot.x, spot.y));
  const fx = -spot.x / d, fy = -spot.y / d;      // forward, toward the hoop
  const rx = fy, ry = -fx;                       // right
  const x = spot.x - fx * BACK + rx * SIDE;
  const y = spot.y - fy * BACK + ry * SIDE;
  const hoopDepth = d + BACK;
  const shear = Math.min(0.15, 0.75 / d);
  const feet = (EYE + shear * d) / BACK;
  let f = (0.67 * h) / (feet + (3.75 - EYE) / hoopDepth);
  // on narrow screens keep the whole backboard and the player inside
  f = Math.min(f, w * 2.05);
  const cy = 0.905 * h - f * feet;
  const cx = w / 2 + (f * SIDE) / hoopDepth;
  return { x, y, z: EYE, fx, fy, rx, ry, f, cx, cy, shear, hoopDepth, w, h };
}

/** World point to camera space: {r right, u up, d depth}. */
export function toView(cam, p) {
  const dx = p[0] - cam.x, dy = p[1] - cam.y;
  const d = dx * cam.fx + dy * cam.fy;
  return { r: dx * cam.rx + dy * cam.ry, u: p[2] - cam.z + cam.shear * (d - cam.hoopDepth), d };
}

export function viewToScreen(cam, v) {
  const s = cam.f / v.d;
  return { x: cam.cx + v.r * s, y: cam.cy - v.u * s, s, d: v.d };
}

/** Screen position of a world point; null when it is behind the camera. */
export function project(cam, p) {
  const v = toView(cam, p);
  return v.d < NEAR ? null : viewToScreen(cam, v);
}

/** Projects a polygon, cutting away what is behind the near plane. */
export function projectPoly(cam, pts) {
  const v = pts.map((p) => toView(cam, p));
  const out = [];
  for (let i = 0; i < v.length; i++) {
    const a = v[i], b = v[(i + 1) % v.length];
    const ina = a.d >= NEAR, inb = b.d >= NEAR;
    if (ina) out.push(viewToScreen(cam, a));
    if (ina !== inb) {
      const k = (NEAR - a.d) / (b.d - a.d);
      out.push(viewToScreen(cam, { r: a.r + (b.r - a.r) * k, u: a.u + (b.u - a.u) * k, d: NEAR }));
    }
  }
  return out;
}

export function fillPoly(ctx, cam, pts, fill) {
  const s = projectPoly(cam, pts);
  if (s.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(s[0].x, s[0].y);
  for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A world-space segment drawn with a width in metres. */
export function line3(ctx, cam, a, b, width, color) {
  let va = toView(cam, a), vb = toView(cam, b);
  if (va.d < NEAR && vb.d < NEAR) return;
  const clip = (p, q) => {
    const k = (NEAR - p.d) / (q.d - p.d);
    return { r: p.r + (q.r - p.r) * k, u: p.u + (q.u - p.u) * k, d: NEAR };
  };
  if (va.d < NEAR) va = clip(va, vb);
  if (vb.d < NEAR) vb = clip(vb, va);
  const p = viewToScreen(cam, va), q = viewToScreen(cam, vb);
  const wp = Math.max(0.6, width * p.s), wq = Math.max(0.6, width * q.s);
  const l = Math.hypot(q.x - p.x, q.y - p.y);
  ctx.beginPath();
  if (Math.abs(wp - wq) < 2 || l < 0.5) {
    ctx.strokeStyle = color;
    ctx.lineWidth = (wp + wq) / 2;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  } else {
    // long lines taper with distance
    const nx = -(q.y - p.y) / l / 2, ny = (q.x - p.x) / l / 2;
    ctx.fillStyle = color;
    ctx.moveTo(p.x + nx * wp, p.y + ny * wp);
    ctx.lineTo(q.x + nx * wq, q.y + ny * wq);
    ctx.lineTo(q.x - nx * wq, q.y - ny * wq);
    ctx.lineTo(p.x - nx * wp, p.y - ny * wp);
    ctx.closePath();
    ctx.fill();
  }
}
