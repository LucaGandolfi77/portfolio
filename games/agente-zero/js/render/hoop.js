/* ============================================================
   Agente Zero — hoop, net, ball and the defender's glove
   ============================================================ */
import { project, fillPoly, line3 } from './camera.js';
import { RIM, BOARD, BOARD_Y, BALL_R } from '../physics.js';

const STRANDS = 12;
const LEVELS = 5;
const DROP = 0.1;

/** The net: points in world space moved by Verlet integration. */
export function makeNet() {
  const nodes = [];
  for (let l = 0; l < LEVELS; l++) {
    for (let s = 0; s < STRANDS; s++) {
      const a = ((s + (l % 2) * 0.5) / STRANDS) * Math.PI * 2;
      const r = RIM.r * (1 - 0.42 * (l / (LEVELS - 1)));
      const rest = [Math.cos(a) * r, Math.sin(a) * r, RIM.z - l * DROP];
      nodes.push({ rest, p: [...rest], q: [...rest] });
    }
  }
  const links = [];
  const at = (l, s) => l * STRANDS + ((s + STRANDS) % STRANDS);
  const dist = (a, b) => Math.hypot(...a.rest.map((v, i) => v - b.rest[i]));
  for (let l = 0; l + 1 < LEVELS; l++) {
    for (let s = 0; s < STRANDS; s++) {
      const o = l % 2 ? 1 : -1;
      for (const [i, j] of [[at(l, s), at(l + 1, s)], [at(l, s), at(l + 1, s + o)]]) links.push([i, j, dist(nodes[i], nodes[j])]);
    }
  }
  return { nodes, links, hx: 0 };
}

/** Advances the net by dt seconds; `ball` is [x,y,z] or null. */
export function stepNet(net, dt, hx, ball) {
  const shift = hx - net.hx;
  net.hx = hx;
  const h = Math.min(1 / 60, dt);
  for (let i = 0; i < net.nodes.length; i++) {
    const n = net.nodes[i];
    if (i < STRANDS) {
      n.p = [n.rest[0] + hx, n.rest[1], n.rest[2]];
      n.q = [...n.p];
      continue;
    }
    n.p[0] += shift * 0.5; n.q[0] += shift * 0.5;
    const v = [n.p[0] - n.q[0], n.p[1] - n.q[1], n.p[2] - n.q[2]];
    n.q = [...n.p];
    // a weak pull back to the rest shape stands in for the knots
    const target = [n.rest[0] + hx, n.rest[1], n.rest[2]];
    for (let k = 0; k < 3; k++) n.p[k] += v[k] * 0.9 + (target[k] - n.p[k]) * 0.08;
    n.p[2] -= 3 * h * h;
    if (ball) {
      const d = [n.p[0] - ball[0], n.p[1] - ball[1], n.p[2] - ball[2]];
      const l = Math.hypot(...d);
      if (l < BALL_R * 1.08 && l > 1e-6) for (let k = 0; k < 3; k++) n.p[k] = ball[k] + (d[k] / l) * BALL_R * 1.08;
    }
  }
  for (let it = 0; it < 2; it++) {
    for (const [i, j, len] of net.links) {
      const a = net.nodes[i].p, b = net.nodes[j].p;
      const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const l = Math.hypot(...d) || 1;
      const k = ((l - len) / l) * 0.5;
      for (let c = 0; c < 3; c++) {
        if (i >= STRANDS) a[c] += d[c] * k;
        b[c] -= d[c] * k;
      }
    }
  }
}

export function drawNet(ctx, cam, net, front) {
  const mid = Math.atan2(-cam.fy, -cam.fx);
  for (const [i, j] of net.links) {
    const a = net.nodes[i].p, b = net.nodes[j].p;
    const ang = Math.atan2((a[1] + b[1]) / 2, (a[0] + b[0]) / 2 - net.hx);
    if ((Math.cos(ang - mid) >= 0) !== front) continue;
    line3(ctx, cam, a, b, 0.011, front ? 'rgba(255,255,255,.95)' : 'rgba(225,230,240,.7)');
  }
}

export function drawRim(ctx, cam, hx, front, contrast) {
  const mid = Math.atan2(-cam.fy, -cam.fx);
  const n = 36;
  const pt = (i) => { const a = (i / n) * Math.PI * 2; return [hx + Math.cos(a) * RIM.r, Math.sin(a) * RIM.r, RIM.z]; };
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2;
    if ((Math.cos(a - mid) >= 0) !== front) continue;
    if (contrast) line3(ctx, cam, pt(i), pt(i + 1), 0.065, '#000');
    line3(ctx, cam, pt(i), pt(i + 1), contrast ? 0.042 : 0.032, contrast ? '#ffe600' : front ? '#ff5a1f' : '#d94512');
  }
}

/** Post, arm and backboard. */
export function drawBoard(ctx, cam, hx, place) {
  const y = BOARD_Y;
  const dark = place === 'arena' || place === 'hall' ? '#20202c' : '#3d434d';
  if (place === 'beach') {
    // the ice-cream cart under the hoop
    fillPoly(ctx, cam, [[hx - 0.7, 1.2, 0.35], [hx + 0.7, 1.2, 0.35], [hx + 0.7, 1.2, 1.25], [hx - 0.7, 1.2, 1.25]], '#fff1dc');
    fillPoly(ctx, cam, [[hx - 0.7, 1.19, 0.95], [hx + 0.7, 1.19, 0.95], [hx + 0.7, 1.19, 1.25], [hx - 0.7, 1.19, 1.25]], '#e0526a');
    for (const x of [-0.5, 0.5]) line3(ctx, cam, [hx + x, 1.18, 0.02], [hx + x, 1.18, 0.4], 0.2, '#2b2230');
  }
  line3(ctx, cam, [hx, 1.45, 0], [hx, 1.45, 2.7], 0.16, dark);
  line3(ctx, cam, [hx, 1.45, 2.7], [hx, y + 0.04, 3.2], 0.12, dark);
  line3(ctx, cam, [hx, 1.45, 0], [hx, 1.45, 1.7], 0.3, '#c62839');
  const q = (x0, x1, z0, z1, dy = 0) => [[hx + x0, y - dy, z0], [hx + x1, y - dy, z0], [hx + x1, y - dy, z1], [hx + x0, y - dy, z1]];
  fillPoly(ctx, cam, q(-BOARD.half, BOARD.half, BOARD.bottom, BOARD.top), 'rgba(222,238,250,.82)');
  fillPoly(ctx, cam, q(-0.72, -0.42, BOARD.bottom + 0.05, BOARD.top - 0.05, 0.001), 'rgba(255,255,255,.28)');
  const edge = (pts, w, c) => { for (let i = 0; i < 4; i++) line3(ctx, cam, pts[i], pts[(i + 1) % 4], w, c); };
  edge(q(-BOARD.half, BOARD.half, BOARD.bottom, BOARD.top, 0.002), 0.05, '#f7f7f7');
  edge(q(-BOARD.half, BOARD.half, BOARD.bottom, BOARD.top, 0.004), 0.014, '#30343c');
  edge(q(-0.295, 0.295, RIM.z - 0.02, RIM.z + 0.43, 0.006), 0.045, '#c62839');
  line3(ctx, cam, [hx - 0.45, y - 0.01, BOARD.bottom], [hx + 0.45, y - 0.01, BOARD.bottom], 0.08, '#c62839');
  line3(ctx, cam, [hx, y, RIM.z], [hx, RIM.r, RIM.z], 0.09, '#b93a10');
}

export const BALLS = {
  classic: { a: '#ff9a3c', b: '#c4520f', seam: '#3b1b08' },
  street: { a: '#e9f0e2', b: '#2e8f8a', seam: '#17272b' },
  flame: { a: '#ffe36b', b: '#d3141f', seam: '#42070a' },
  gold: { a: '#fff3b0', b: '#c18a12', seam: '#5a3a04' },
};

/** Ball at a screen position; radius in pixels, spin angle in radians. */
export function drawBallAt(ctx, x, y, r, angle, style = 'classic', glow = false) {
  const s = BALLS[style] || BALLS.classic;
  if (glow) {
    const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.4);
    g.addColorStop(0, 'rgba(255,170,30,.75)'); g.addColorStop(1, 'rgba(255,60,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 7); ctx.fill();
  }
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  g.addColorStop(0, s.a); g.addColorStop(1, s.b);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
  ctx.strokeStyle = s.seam;
  ctx.lineWidth = Math.max(0.8, r * 0.09);
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
  // the cross seams roll with the backspin
  for (const off of [-1.15, 0, 1.15]) {
    const a = angle + off;
    if (Math.cos(a) < -0.1) continue;
    const k = Math.sin(a);
    ctx.beginPath();
    ctx.ellipse(x, y + k * r * 0.95, r * 1.05, Math.max(0.5, r * 0.3 * Math.abs(k)), 0, k < 0 ? Math.PI : 0, k < 0 ? Math.PI * 2 : Math.PI);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(30,10,0,.55)';
  ctx.lineWidth = Math.max(0.6, r * 0.05);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
}

export function drawBallShadow(ctx, cam, p) {
  const s = project(cam, [p[0], p[1], 0]);
  if (!s) return;
  const fade = Math.max(0.08, 0.42 - p[2] * 0.08);
  const r = BALL_R * s.s * (1 + p[2] * 0.12);
  ctx.fillStyle = `rgba(0,0,0,${fade})`;
  ctx.beginPath(); ctx.ellipse(s.x, s.y, r, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
}

/** The defender: a tall shape behind a big glove that rises and falls. */
export function drawDefender(ctx, cam, hand) {
  const base = project(cam, [hand[0], hand[1], 0]);
  const top = project(cam, hand);
  if (!base || !top) return;
  const lift = Math.max(0, hand[2] - 2.25);
  const hip = project(cam, [hand[0], hand[1], 0.95 + lift * 0.5]);
  const neck = project(cam, [hand[0] - 0.12, hand[1], 1.6 + lift * 0.6]);
  const s = base.s;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(0,0,0,.3)';
  ctx.beginPath(); ctx.ellipse(base.x, base.y, 0.4 * s, 0.11 * s, 0, 0, 7); ctx.fill();
  const limb = (x0, y0, x1, y1, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w * s; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
  limb(base.x - 0.22 * s, base.y - lift * 0.4 * s, hip.x - 0.1 * s, hip.y, 0.14, '#23243a');
  limb(base.x + 0.18 * s, base.y - lift * 0.4 * s, hip.x + 0.1 * s, hip.y, 0.14, '#23243a');
  limb(hip.x, hip.y, neck.x, neck.y, 0.44, '#2f3a8f');
  limb(neck.x + 0.12 * s, neck.y + 0.08 * s, top.x, top.y + 0.1 * s, 0.12, '#8a5a40');
  ctx.fillStyle = '#8a5a40'; ctx.beginPath(); ctx.arc(neck.x, neck.y - 0.22 * s, 0.15 * s, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffd24a'; ctx.strokeStyle = '#7a4a00'; ctx.lineWidth = Math.max(1, 0.015 * s);
  ctx.beginPath(); ctx.ellipse(top.x, top.y, 0.12 * s, 0.14 * s, 0, 0, 7); ctx.fill(); ctx.stroke();
  for (let i = -1; i <= 1; i++) limb(top.x + i * 0.07 * s, top.y - 0.08 * s, top.x + i * 0.1 * s, top.y - 0.19 * s, 0.045, '#ffd24a');
  ctx.restore();
}
