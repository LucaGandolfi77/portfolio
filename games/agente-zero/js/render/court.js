/* ============================================================
   Agente Zero — the six places: sky, walls, crowd, floor, lines
   ------------------------------------------------------------
   Everything here is still, so the scene is drawn once for each
   camera position and kept on an off-screen canvas.
   ============================================================ */
import { fillPoly, line3, project } from './camera.js';
import { THREE_R, CORNER_X } from '../court-data.js';

export const PLACES = {
  bunker: { sky: ['#7fa6c9', '#d9e3e8'], floor: '#4c6154', floor2: '#46594d', key: '#8f3b34', apron: '#5d5f66', line: '#eef0ea', outdoor: true, ambient: 0 },
  gym: { sky: ['#cdbb98', '#e8dcc0'], floor: '#c8904f', floor2: '#bd8546', key: '#9c3a2c', apron: '#a97338', line: '#fff7e6', wood: true, ambient: 0 },
  roof: { sky: ['#2b2a63', '#f08a5d'], floor: '#6e6b73', floor2: '#68656d', key: '#7d2f3a', apron: '#55525b', line: '#f2ead8', outdoor: true, ambient: 0.1 },
  beach: { sky: ['#5b3f86', '#ffb26b'], floor: '#c8735a', floor2: '#bf6c54', key: '#2f7f86', apron: '#e1c48f', line: '#fff4de', outdoor: true, ambient: 0.05 },
  hall: { sky: ['#14223c', '#263b5e'], floor: '#cf9a57', floor2: '#c48f4e', key: '#1f4f8f', apron: '#8d6233', line: '#ffffff', wood: true, ambient: 0.05 },
  arena: { sky: ['#05050d', '#171228'], floor: '#d6a461', floor2: '#cb9856', key: '#a3162a', apron: '#2a1f2e', line: '#ffffff', wood: true, ambient: 0.1 },
};

const BASE_Y = 1.575;
const HALF_Y = BASE_Y - 14;
const WALL_Y = 5.2;
const SIDE_X = 13;
const FRONT_Y = -24;

/** Repeatable pseudo-random numbers for scenery. */
const seeded = (seed) => { let s = seed * 7919 + 13; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

/** The three standing walls as maps from (u along the wall, z) to the world. */
const WALLS = [
  { id: 'back', from: -SIDE_X, to: SIDE_X, at: (u, z) => [u, WALL_Y, z] },
  { id: 'left', from: FRONT_Y, to: WALL_Y, at: (u, z) => [-SIDE_X, u, z] },
  { id: 'right', from: WALL_Y, to: FRONT_Y, at: (u, z) => [SIDE_X, WALL_Y + FRONT_Y - u, z] },
];

function rect(ctx, cam, wall, u0, u1, z0, z1, color) {
  fillPoly(ctx, cam, [wall.at(u0, z0), wall.at(u1, z0), wall.at(u1, z1), wall.at(u0, z1)], color);
}

/** Splits a wall into pieces of about `step` metres. */
function pieces(wall, step) {
  const lo = Math.min(wall.from, wall.to), hi = Math.max(wall.from, wall.to);
  const n = Math.max(1, Math.round((hi - lo) / step));
  return Array.from({ length: n }, (_, i) => [lo + ((hi - lo) * i) / n, lo + ((hi - lo) * (i + 1)) / n, i]);
}

function dot(ctx, cam, p, r, color) {
  const s = project(cam, p);
  if (!s || s.x < -20 || s.x > cam.w + 20 || s.y < -20 || s.y > cam.h + 20) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(s.x, s.y, Math.max(0.6, r * s.s), 0, Math.PI * 2);
  ctx.fill();
}

function crowd(ctx, cam, wall, { rows, z0, dz, density, dim, seed }) {
  const r = seeded(seed + wall.id.length);
  const colors = ['#e9c4a0', '#b9825b', '#7a4f35', '#f0d3b8'];
  const shirts = ['#d3263a', '#f4f4f4', '#2f5fb3', '#f2b431', '#2c2c34', '#3a9b6a', '#d3263a'];
  for (let row = rows - 1; row >= 0; row--) {
    const z = z0 + row * dz;
    rect(ctx, cam, wall, Math.min(wall.from, wall.to), Math.max(wall.from, wall.to), z - dz * 0.6, z + dz * 0.4, row % 2 ? '#1b1a2a' : '#22203a');
    for (let u = Math.min(wall.from, wall.to) + 0.3; u < Math.max(wall.from, wall.to); u += 0.62) {
      if (r() > density) continue;
      const uu = u + (r() - 0.5) * 0.25, zz = z + (r() - 0.5) * 0.12;
      ctx.globalAlpha = dim;
      dot(ctx, cam, wall.at(uu, zz - 0.12), 0.25, shirts[Math.floor(r() * shirts.length)]);
      dot(ctx, cam, wall.at(uu, zz + 0.2), 0.13, colors[Math.floor(r() * colors.length)]);
      ctx.globalAlpha = 1;
    }
  }
}

function fence(ctx, cam, wall, h) {
  const lo = Math.min(wall.from, wall.to), hi = Math.max(wall.from, wall.to);
  for (let u = lo - h; u < hi; u += 0.45) {
    const a = Math.max(lo, u), b = Math.min(hi, u + h);
    if (b <= a) continue;
    line3(ctx, cam, wall.at(a, a - u), wall.at(b, b - u), 0.012, 'rgba(60,68,76,.45)');
    line3(ctx, cam, wall.at(a, h - (a - u)), wall.at(b, h - (b - u)), 0.012, 'rgba(60,68,76,.45)');
  }
  for (let u = lo; u <= hi; u += 2.6) line3(ctx, cam, wall.at(u, 0), wall.at(u, h + 0.1), 0.09, '#4a525b');
  line3(ctx, cam, wall.at(lo, h), wall.at(hi, h), 0.09, '#4a525b');
}

/** A skyline or other far things, placed by compass angle around the court. */
function panorama(ctx, cam, items) {
  const yaw = Math.atan2(cam.fx, cam.fy);
  for (const it of items) {
    let a = it.az - yaw;
    a = Math.atan2(Math.sin(a), Math.cos(a));
    if (Math.abs(a) > 1.25) continue;
    it.draw(ctx, cam.cx + cam.f * Math.tan(a), cam.cy, cam.f);
  }
}

function skyline(seed, { color, win, minH, maxH, gap = 0.13 }) {
  const r = seeded(seed);
  const out = [];
  for (let az = -Math.PI; az < Math.PI; az += gap * (0.7 + r() * 0.6)) {
    const w = 0.07 + r() * 0.1, h = minH + r() * (maxH - minH);
    const lights = Array.from({ length: 14 }, () => [r(), r(), r()]);
    out.push({
      az,
      draw(ctx, x, y, f) {
        ctx.fillStyle = color;
        ctx.fillRect(x - (w * f) / 2, y - h * f, w * f, h * f + 4);
        ctx.fillStyle = win;
        for (const [a, b, c] of lights) if (c > 0.35) ctx.fillRect(x - (w * f) / 2 + 3 + a * (w * f - 9), y - h * f + 4 + b * Math.max(1, h * f - 14), 3, 4);
      },
    });
  }
  return out;
}

const palm = (az, k) => ({
  az,
  draw(ctx, x, y, f) {
    const h = 0.34 * k * f, top = y - h;
    ctx.strokeStyle = '#2a1c2e'; ctx.lineCap = 'round'; ctx.lineWidth = 0.012 * f;
    ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.quadraticCurveTo(x + h * 0.15, y - h * 0.5, x + h * 0.05, top); ctx.stroke();
    ctx.lineWidth = 0.008 * f;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      ctx.beginPath(); ctx.moveTo(x + h * 0.05, top);
      ctx.quadraticCurveTo(x + h * 0.05 + Math.cos(a) * h * 0.25, top + Math.sin(a) * h * 0.3, x + h * 0.05 + Math.cos(a) * h * 0.45, top + Math.sin(a) * h * 0.05 + h * 0.08);
      ctx.stroke();
    }
  },
});

function text(ctx, cam, wall, u, z, label, height, color) {
  const p = project(cam, wall.at(u, z)), q = project(cam, wall.at(u + 1, z));
  if (!p || !q) return;
  const along = (q.x - p.x) / p.s;       // how squarely we see the wall
  if (Math.abs(along) < 0.35) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(Math.min(1, Math.abs(along)), 1);
  ctx.fillStyle = color;
  ctx.font = `900 ${Math.max(6, height * p.s)}px "Arial Black", Impact, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

const SCENES = {
  bunker(ctx, cam) {
    panorama(ctx, cam, skyline(3, { color: '#8b93a3', win: '#c9d3dc', minH: 0.09, maxH: 0.34 }));
    for (const w of WALLS) {
      rect(ctx, cam, w, Math.min(w.from, w.to), Math.max(w.from, w.to), 0, 1.15, '#8d8a86');
      rect(ctx, cam, w, Math.min(w.from, w.to), Math.max(w.from, w.to), 1.05, 1.18, '#6f6c68');
    }
    const [back, left, right] = WALLS;
    text(ctx, cam, back, -4.6, 0.6, 'BUNKER', 0.72, '#c62839');
    text(ctx, cam, back, 4.8, 0.58, 'ZERO SCUSE', 0.46, '#f4f1e8');
    text(ctx, cam, left, -3, 0.6, '0', 0.9, '#c62839');
    text(ctx, cam, right, -8, 0.6, 'NIVES ♥', 0.4, '#2f5fb3');
    for (const w of WALLS) fence(ctx, cam, w, 3.6);
  },
  gym(ctx, cam) {
    for (const w of WALLS) {
      const lo = Math.min(w.from, w.to), hi = Math.max(w.from, w.to);
      rect(ctx, cam, w, lo, hi, 0, 7.5, '#e4d5b2');
      rect(ctx, cam, w, lo, hi, 0, 1.5, '#8a5a33');
      for (const [a, b, i] of pieces(w, 3.2)) {
        rect(ctx, cam, w, a + 0.5, b - 0.5, 3.9, 5.8, '#fdf6dd');
        rect(ctx, cam, w, (a + b) / 2 - 0.04, (a + b) / 2 + 0.04, 3.9, 5.8, '#9b8a66');
        if (w.id !== 'back' && i % 2 === 0) {
          for (let u = a + 0.4; u < b - 0.4; u += 0.5) line3(ctx, cam, w.at(u, 0), w.at(u, 3), 0.07, '#b9803f');
          for (let z = 0.4; z < 3; z += 0.3) line3(ctx, cam, w.at(a + 0.4, z), w.at(b - 0.4, z), 0.05, '#a46d33');
        }
      }
    }
    text(ctx, cam, WALLS[0], -4.4, 2.4, 'PALESTRA NIVES', 0.5, '#7c2f26');
    for (let u = -8; u <= 8; u += 8) rect(ctx, cam, WALLS[0], u - 0.9, u + 0.9, 0.02, 0.55, '#6b3a52');
  },
  roof(ctx, cam) {
    panorama(ctx, cam, [{ az: -0.55, draw(c, x, y, f) { c.fillStyle = '#ffd9a0'; c.beginPath(); c.arc(x, y - 0.08 * f, 0.055 * f, 0, 7); c.fill(); } }]);
    panorama(ctx, cam, skyline(11, { color: '#32264a', win: '#ffd779', minH: 0.02, maxH: 0.17, gap: 0.1 }));
    for (const w of WALLS) {
      const lo = Math.min(w.from, w.to), hi = Math.max(w.from, w.to);
      rect(ctx, cam, w, lo, hi, 0, 0.85, '#7b5b57');
      rect(ctx, cam, w, lo, hi, 0.8, 0.95, '#a57f74');
    }
    const [back, left, right] = WALLS;
    for (const [w, u] of [[back, -9], [back, 7.5], [left, -2], [right, -12]]) {
      line3(ctx, cam, w.at(u, 0.9), w.at(u, 3.4), 0.05, '#1c1630');
      for (const z of [2.5, 2.9, 3.3]) line3(ctx, cam, w.at(u - 0.5, z), w.at(u + 0.5, z), 0.035, '#1c1630');
    }
    rect(ctx, cam, back, 3.6, 6, 0, 2.1, '#5e4652');
    rect(ctx, cam, back, 4.4, 5.2, 0, 1.6, '#2c2038');
  },
  beach(ctx, cam) {
    const g = ctx.createLinearGradient(0, cam.cy - 0.01 * cam.f, 0, cam.cy + 0.14 * cam.f);
    g.addColorStop(0, '#6b5a9c'); g.addColorStop(1, '#2f7f95');
    ctx.fillStyle = g;
    ctx.fillRect(0, cam.cy - 1, cam.w, cam.h);
    panorama(ctx, cam, [{ az: 0.2, draw(c, x, y, f) { c.fillStyle = '#ffd08a'; c.beginPath(); c.arc(x, y, 0.075 * f, Math.PI, 0); c.fill(); c.fillStyle = 'rgba(255,208,138,.45)'; for (let i = 1; i < 6; i++) c.fillRect(x - (0.07 - i * 0.009) * f, y + i * 0.016 * f, (0.14 - i * 0.018) * f, 2); } }]);
    fillPoly(ctx, cam, [[-60, 14, 0], [60, 14, 0], [60, -40, 0], [-60, -40, 0]], '#d9b985');
    panorama(ctx, cam, [palm(-0.34, 0.68), palm(0.44, 0.55), palm(-1.3, 0.7), palm(1.2, 0.8), palm(2.2, 0.8), palm(-2.4, 1)]);
    for (const w of WALLS) {
      const lo = Math.min(w.from, w.to), hi = Math.max(w.from, w.to);
      for (let u = lo; u <= hi; u += 1.3) line3(ctx, cam, w.at(u, 0), w.at(u, 1), 0.07, '#f3e8d8');
      line3(ctx, cam, w.at(lo, 1), w.at(hi, 1), 0.09, '#f3e8d8');
      line3(ctx, cam, w.at(lo, 0.55), w.at(hi, 0.55), 0.04, '#f3e8d8');
    }
    text(ctx, cam, WALLS[0], -5.4, 1.5, 'GELATI KAPPA', 0.42, '#fff4de');
  },
  hall(ctx, cam) {
    for (const w of WALLS) {
      const lo = Math.min(w.from, w.to), hi = Math.max(w.from, w.to);
      rect(ctx, cam, w, lo, hi, 0, 9, '#22355a');
      crowd(ctx, cam, w, { rows: 4, z0: 1.35, dz: 0.55, density: 0.6, dim: 0.85, seed: 21 });
      rect(ctx, cam, w, lo, hi, 0, 0.95, '#16264a');
      for (const [a, b, i] of pieces(w, 4.2)) rect(ctx, cam, w, a + 0.15, b - 0.15, 0.2, 0.75, i % 2 ? '#c62839' : '#f4f1e8');
      for (const [a, b] of pieces(w, 5)) rect(ctx, cam, w, a + 1.4, b - 1.4, 4.6, 5.4, '#dfe9ff');
    }
    text(ctx, cam, WALLS[0], -5.2, 3.9, 'TORNEO REGIONALE', 0.44, '#ffd24a');
  },
  arena(ctx, cam) {
    for (const w of WALLS) {
      const lo = Math.min(w.from, w.to), hi = Math.max(w.from, w.to);
      rect(ctx, cam, w, lo, hi, 0, 11, '#0d0b19');
      crowd(ctx, cam, w, { rows: 9, z0: 1.25, dz: 0.5, density: 0.88, dim: 0.65, seed: 57 });
      rect(ctx, cam, w, lo, hi, 0, 0.9, '#1a1030');
      for (const [a, b, i] of pieces(w, 3.4)) rect(ctx, cam, w, a + 0.1, b - 0.1, 0.18, 0.72, ['#a3162a', '#f4f1e8', '#5a2a86'][i % 3]);
    }
    text(ctx, cam, WALLS[0], -4.8, 0.45, 'VOLTA SNEAKERS', 0.32, '#fff');
    panorama(ctx, cam, [-1.9, -1.1, -0.38, 0.38, 1.1, 1.9].map((az) => ({
      az,
      draw(c, x, y, f) {
        const top = y - 0.48 * f;
        const g = c.createRadialGradient(x, top, 1, x, top, 0.09 * f);
        g.addColorStop(0, 'rgba(255,248,220,.95)'); g.addColorStop(1, 'rgba(255,248,220,0)');
        c.fillStyle = g; c.fillRect(x - 0.09 * f, top - 0.09 * f, 0.18 * f, 0.18 * f);
      },
    })));
  },
};

const arc = (cx, cy, r, a0, a1, n = 48) => Array.from({ length: n + 1 }, (_, i) => {
  const a = a0 + ((a1 - a0) * i) / n;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0.005];
});

function path(ctx, cam, pts, color, width = 0.06) {
  for (let i = 0; i + 1 < pts.length; i++) line3(ctx, cam, pts[i], pts[i + 1], width, color);
}

function floor(ctx, cam, place) {
  const quad = (x0, x1, y0, y1, c) => fillPoly(ctx, cam, [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]], c);
  quad(-SIDE_X, SIDE_X, FRONT_Y, WALL_Y, place.apron);
  quad(-7.5, 7.5, FRONT_Y, BASE_Y, place.floor);
  if (place.wood) {
    // planks running toward the hoop
    for (let x = -7.5, i = 0; x < 7.5; x += 0.75, i++) {
      if (i % 2) quad(x, Math.min(7.5, x + 0.75), FRONT_Y, BASE_Y, place.floor2);
      for (let y = BASE_Y - ((i * 1.7) % 3.1); y > -18; y -= 3.1) line3(ctx, cam, [x, y, 0], [x + 0.75, y, 0], 0.012, 'rgba(80,45,15,.28)');
      line3(ctx, cam, [x, BASE_Y, 0], [x, -20, 0], 0.012, 'rgba(80,45,15,.22)');
    }
  } else {
    const r = seeded(5);
    for (let i = 0; i < 380; i++) dot(ctx, cam, [(r() - 0.5) * 15, BASE_Y - r() * 17, 0], 0.025 + r() * 0.03, place.floor2);
  }
  quad(-2.45, 2.45, -4.225, BASE_Y, place.key);
  const L = place.line;
  path(ctx, cam, [[-7.5, HALF_Y, 0.005], [-7.5, BASE_Y, 0.005], [7.5, BASE_Y, 0.005], [7.5, HALF_Y, 0.005], [-7.5, HALF_Y, 0.005]], L, 0.07);
  path(ctx, cam, [[-2.45, BASE_Y, 0.005], [-2.45, -4.225, 0.005], [2.45, -4.225, 0.005], [2.45, BASE_Y, 0.005]], L);
  path(ctx, cam, arc(0, -4.225, 1.8, 0, Math.PI * 2), L);
  path(ctx, cam, arc(0, 0, 1.25, Math.PI, Math.PI * 2, 24), L, 0.045);
  const yc = -Math.sqrt(THREE_R ** 2 - CORNER_X ** 2);
  const a0 = Math.atan2(yc, -CORNER_X) + Math.PI * 2, a1 = Math.atan2(yc, CORNER_X) + Math.PI * 2;
  path(ctx, cam, [[-CORNER_X, BASE_Y, 0.005], ...arc(0, 0, THREE_R, a0, a1, 64), [CORNER_X, BASE_Y, 0.005]], L, 0.07);
  path(ctx, cam, arc(0, HALF_Y, 1.8, 0, Math.PI * 2), L);
  // a giant zero painted at half court
  path(ctx, cam, arc(0, HALF_Y, 0.85, 0, Math.PI * 2, 32), place.key, 0.28);
}

/** Draws the whole still scene for a camera. */
export function drawScene(ctx, cam, id) {
  const place = PLACES[id] || PLACES.bunker;
  const sky = ctx.createLinearGradient(0, 0, 0, Math.max(40, cam.cy + 20));
  sky.addColorStop(0, place.sky[0]);
  sky.addColorStop(1, place.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cam.w, cam.h);
  ctx.lineCap = 'butt';
  if (id === 'beach') {
    SCENES.beach(ctx, cam);
  } else {
    if (place.outdoor) fillPoly(ctx, cam, [[-60, 40, 0], [60, 40, 0], [60, -40, 0], [-60, -40, 0]], place.apron);
    (SCENES[id] || SCENES.bunker)(ctx, cam);
  }
  floor(ctx, cam, place);
  if (place.ambient) {
    ctx.fillStyle = `rgba(20,8,40,${place.ambient})`;
    ctx.fillRect(0, 0, cam.w, cam.h);
  }
  // soft vignette
  const v = ctx.createRadialGradient(cam.w / 2, cam.h * 0.5, cam.h * 0.25, cam.w / 2, cam.h * 0.5, cam.h * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.34)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, cam.w, cam.h);
}
