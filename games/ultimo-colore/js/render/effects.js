/* ============================================================
   Ultimo Colore — the air and the water of the open lagoon
   ------------------------------------------------------------
   Everything drawn flat in 2D: glints, foam, lamplight, wakes,
   dust, sparks, leaves, mist. ground() goes under the figures,
   air() over them. With `calm` nothing drifts or flickers.
   ============================================================ */
import { WORLD, ISLANDS, PIERS, HOUSES, CAMPS, WILLOWS, LEAN } from '../world/layout.js';
import { kindAt } from '../world/terrain.js';
import { CHESTS } from '../data/places.js';

const TAU = Math.PI * 2;
const MAX_PARTICLES = 160;

/** A fixed sprinkle of numbers, so the lagoon looks the same each time. */
const seeded = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

function blot(colour, edge) {
  const c = document.createElement('canvas');
  c.width = c.height = 96;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(48, 48, 2, 48, 48, 48);
  grad.addColorStop(0, colour); grad.addColorStop(1, edge);
  g.fillStyle = grad; g.fillRect(0, 0, 96, 96);
  return c;
}

/** Open water, one spot for each patch of it. */
export function waterSpots(cell = 46) {
  const r = seeded(4099), out = [];
  for (let y = cell; y < WORLD.h - cell; y += cell) {
    for (let x = cell; x < WORLD.w - cell; x += cell) {
      const p = { x: x + (r() - 0.5) * cell, y: y + (r() - 0.5) * cell, phase: r() * TAU, long: 7 + r() * 15 };
      if ([-16, 0, 16].every((d) => kindAt(p.x + d, p.y) === 'water')) out.push(p);
    }
  }
  return out;
}

/** Lamps painted into the map: [x, y on screen, size]. */
export function lamps() {
  const out = [];
  const bridge = PIERS.find((p) => p.kind === 'bridge');
  for (const side of [0, 1]) for (let i = 0; i < 3; i++) out.push([bridge.x + side * bridge.w, bridge.y + 24 + (i * (bridge.h - 48)) / 2 - 55 * LEAN, 26]);
  for (const [ax, ay, bx, by] of [[590, 2858, 800, 2858], [1170, 2878, 1300, 2862], [880, 2470, 1160, 2470]]) {
    for (let i = 0; i < 4; i++) { const u = (i + 0.5) / 4; out.push([ax + (bx - ax) * u, ay + (by - ay) * u - (95 - Math.sin(u * Math.PI) * 15 - 8) * LEAN, 20]); }
  }
  return out;
}

export function createEffects() {
  const warm = blot('rgba(255,184,96,1)', 'rgba(255,150,60,0)');
  const pale = blot('rgba(214,232,226,1)', 'rgba(214,232,226,0)');
  const dark = blot('rgba(4,14,24,1)', 'rgba(4,14,24,0)');
  const green = blot('rgba(170,255,200,1)', 'rgba(60,220,130,0)');
  const spots = waterSpots();
  const lights = lamps();
  const r = seeded(977);
  const mist = Array.from({ length: 34 }, () => ({ x: r() * WORLD.w, y: r() * WORLD.h * 0.86, w: 220 + r() * 300, v: 4 + r() * 9, a: 0.05 + r() * 0.09 }));
  const clouds = Array.from({ length: 7 }, () => ({ x: r() * WORLD.w, y: r() * WORLD.h, w: 520 + r() * 420, v: 9 + r() * 8 }));
  const flies = [...CAMPS.map((c) => [c.x, c.y, 14]), ...WILLOWS.map(([x, y]) => [x, y, 3])]
    .flatMap(([x, y, n]) => Array.from({ length: n }, () => ({ x: x + (r() - 0.5) * 220, y: y + (r() - 0.5) * 150, phase: r() * TAU, v: 0.4 + r() * 0.7 })));
  const motes = Array.from({ length: 90 }, () => ({ x: r() * WORLD.w, y: 40 + r() * 560, phase: r(), v: 0.05 + r() * 0.08 }));
  let particles = [], wake = [], clock = new Map();

  const wrap = (v, span) => ((v % span) + span) % span;
  const seen = (view, x, y, m = 80) => x > view.x - m && x < view.x + view.w / view.zoom + m && y > view.y - m && y < view.y + view.h / view.zoom + m;
  const stamp = (ctx, img, x, y, w, h, a) => { ctx.globalAlpha = a; ctx.drawImage(img, x - w / 2, y - h / 2, w, h); ctx.globalAlpha = 1; };

  function emit(p) { if (particles.length < MAX_PARTICLES) particles.push({ age: 0, vx: 0, vy: 0, vz: 0, z: 0, grow: 0, fall: 0, ...p }); }

  /** Dust, splashes, sparks and the boat's wake, born from what moves. */
  function update(actors, dt, calm) {
    if (dt <= 0 || calm) { if (calm) { particles = []; wake = []; } return; }
    for (const p of particles) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vz -= p.fall * dt; p.z = Math.max(0, p.z + p.vz * dt); p.r += p.grow * dt; }
    particles = particles.filter((p) => p.age < p.life);
    for (const w of wake) w.age += dt;
    wake = wake.filter((w) => w.age < 1.8);
    for (const a of actors) {
      if (a.id === 'boat' && a.kind === 'boat') {
        const prev = clock.get('boat');
        if (prev && Math.hypot(a.x - prev.x, a.y - prev.y) > 16) {
          wake.push({ x: a.x - Math.sin(a.heading) * 52, y: a.y - Math.cos(a.heading) * 44, heading: a.heading, age: 0 });
          for (let i = 0; i < 3; i++) emit({ x: a.x + Math.sin(a.heading) * 54 + (Math.random() - 0.5) * 22, y: a.y + Math.cos(a.heading) * 44, vx: (Math.random() - 0.5) * 40, vz: 34 + Math.random() * 40, fall: 140, life: 0.6, r: 1.8, colour: '224,248,244', a: 0.9 });
          clock.set('boat', { x: a.x, y: a.y });
        } else if (!prev || Math.hypot(a.x - prev.x, a.y - prev.y) > 80) clock.set('boat', { x: a.x, y: a.y });
        continue;
      }
      if (!(a.speed > 0.4)) continue;
      const due = (clock.get(a.id) || 0) - dt;
      if (due > 0) { clock.set(a.id, due); continue; }
      clock.set(a.id, a.wet ? 0.13 : 0.2);
      if (a.wet) for (let i = 0; i < 4; i++) emit({ x: a.x + (Math.random() - 0.5) * 14, y: a.y, vx: (Math.random() - 0.5) * 60, vz: 40 + Math.random() * 50, fall: 200, life: 0.5, r: 1.7, colour: '216,244,236', a: 0.9 });
      else emit({ x: a.x + (Math.random() - 0.5) * 10, y: a.y + 2, vx: (Math.random() - 0.5) * 16, vy: -4, vz: 9, life: 0.55, r: 3, grow: 13, colour: '206,188,156', a: 0.34 });
    }
    for (const c of CAMPS) if (Math.random() < dt * 9) emit({ x: c.x + (Math.random() - 0.5) * 20, y: c.y, vx: (Math.random() - 0.3) * 18, vz: 34 + Math.random() * 40, z: 16, life: 1.4, r: 1.5, colour: '255,176,72', a: 1 });
  }

  /** Under the figures, in map units. */
  function ground(ctx, view, s, time, calm) {
    const t = calm ? 0 : time;
    // shadows of clouds passing
    for (const c of clouds) {
      const x = wrap(c.x + t * c.v, WORLD.w + c.w * 2) - c.w, y = c.y;
      if (seen(view, x, y, c.w)) stamp(ctx, dark, x, y, c.w, c.w * 0.62, 0.2);
    }
    // light on the water
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#d4f4ec';
    ctx.lineWidth = 2;
    for (const p of spots) {
      if (!seen(view, p.x, p.y, 20)) continue;
      const a = calm ? (p.phase < 1.6 ? 0.22 : 0) : Math.max(0, Math.sin(t * 0.9 + p.phase)) ** 5 * 0.5;
      if (a < 0.03) continue;
      const x = p.x + Math.sin(t * 0.5 + p.phase) * 7;
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(x - p.long, p.y); ctx.quadraticCurveTo(x, p.y - 2.6, x + p.long, p.y); ctx.stroke();
    }
    // water lapping at the shores
    ctx.setLineDash([16, 26]);
    for (const isle of ISLANDS) {
      const cx = isle.poly.reduce((n, p) => n + p[0], 0) / isle.poly.length, cy = isle.poly.reduce((n, p) => n + p[1], 0) / isle.poly.length;
      if (!seen(view, cx, cy, 720)) continue;
      for (let ring = 0; ring < 2; ring++) {
        const k = calm ? 0.4 + ring * 0.4 : (t * 0.22 + ring * 0.5) % 1;
        const out = (isle.ground === 'cobble' ? 4 : 8) + (1 - k) * 22;
        ctx.globalAlpha = Math.sin(k * Math.PI) * 0.34;
        ctx.lineDashOffset = ring * 19 + cx;
        ctx.beginPath();
        isle.poly.forEach(([x, y], i) => { const l = Math.hypot(x - cx, y - cy) || 1; ctx[i ? 'lineTo' : 'moveTo'](x + ((x - cx) / l) * out, y + ((y - cy) / l) * out); });
        ctx.closePath(); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    // the wake
    ctx.strokeStyle = '#dcf6f0';
    for (const w of wake) {
      const k = w.age / 1.8, wide = 12 + k * 46, sx = Math.cos(w.heading), sy = -Math.sin(w.heading), fx = Math.sin(w.heading), fy = Math.cos(w.heading);
      ctx.globalAlpha = (1 - k) * 0.55;
      ctx.lineWidth = 3.2 - k * 2;
      for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(w.x + sx * side * wide, w.y + sy * side * wide * 0.7); ctx.lineTo(w.x + sx * side * (wide + 9) - fx * 16, w.y + sy * side * (wide + 9) * 0.7 - fy * 12); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // lamplight spilling on the ground
    ctx.globalCompositeOperation = 'lighter';
    const flick = (n) => (calm ? 1 : 1 + Math.sin(time * 7 + n) * 0.07 + Math.sin(time * 13.7 + n * 3) * 0.05);
    for (const h of HOUSES) if (seen(view, h.x, h.y, 220)) stamp(ctx, warm, h.x + h.w / 2, h.y + h.d + 8, h.w * 1.25, 74, 0.13 * flick(h.x));
    for (const [x, y, size] of lights) if (seen(view, x, y)) stamp(ctx, warm, x, y + 36, size * 4.6, size * 2.6, 0.12 * flick(x));
    for (const c of CAMPS) if (seen(view, c.x, c.y, 220)) stamp(ctx, warm, c.x, c.y + 4, 360, 250, 0.3 * flick(c.x));
    for (const c of CHESTS) if (!s.opened.includes(c.id) && seen(view, c.x, c.y)) stamp(ctx, warm, c.x, c.y, 130, 80, 0.34 * flick(c.y));
    ctx.globalCompositeOperation = 'source-over';
  }

  /** Over the figures. lantern: {x, y} of the light Ilario carries. */
  function air(ctx, view, s, time, calm, lantern) {
    const t = calm ? 0 : time;
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, size] of lights) if (seen(view, x, y)) stamp(ctx, warm, x, y, size * 2, size * 2, calm ? 0.3 : 0.28 + Math.sin(time * 6 + x) * 0.05);
    if (lantern) { stamp(ctx, warm, lantern.x, lantern.y, 40, 40, 0.5); stamp(ctx, warm, lantern.x, lantern.y + 40, 220, 150, 0.07); }
    ctx.globalCompositeOperation = 'source-over';
    for (const p of particles) {
      const k = p.age / p.life;
      ctx.fillStyle = `rgba(${p.colour},${(p.a * (1 - k)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.z * 0.78, p.r, 0, TAU); ctx.fill();
    }
    if (!calm) {
      // willow leaves letting go
      ctx.fillStyle = s.actDone ? '#a8a8a0' : '#a8c458';
      WILLOWS.forEach(([x, y], i) => {
        if (!seen(view, x, y, 160)) return;
        for (let k = 0; k < 3; k++) {
          const u = (time * 0.11 + k * 0.37 + i * 0.21) % 1;
          ctx.globalAlpha = Math.sin(u * Math.PI);
          ctx.beginPath(); ctx.ellipse(x + Math.sin(u * 9 + k) * 22 + u * 70 - 24, y - 120 * (1 - u) + 6, 4.2, 1.8, Math.sin(time * 3 + k) * 1.4, 0, TAU); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const f of flies) {
      const x = f.x + Math.sin(t * f.v + f.phase) * 26, y = f.y + Math.cos(t * f.v * 1.3 + f.phase * 2) * 18 - 28;
      if (!seen(view, x, y, 20)) continue;
      const a = 0.25 + 0.75 * Math.max(0, Math.sin(t * 2 + f.phase * 3));
      stamp(ctx, warm, x, y, 17, 17, a * 0.8);
    }
    // the last of the green rising from the cut glass
    if (!s.actDone) {
      for (const m of motes) {
        const u = (t * m.v + m.phase) % 1, x = m.x + Math.sin(u * 8 + m.phase * 9) * 14, y = m.y - u * 90;
        if (seen(view, x, y, 20)) stamp(ctx, green, x, y, 13, 13, Math.sin(u * Math.PI) * 0.85);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const m of mist) {
      const x = wrap(m.x + t * m.v, WORLD.w + m.w * 2) - m.w;
      if (seen(view, x, m.y, m.w)) stamp(ctx, pale, x, m.y, m.w, m.w * 0.3, m.a);
    }
  }

  /** Passing birds, in screen pixels. (The evening light is a still layer in CSS.) */
  function sky(ctx, w, h, time, calm) {
    const u = (time % 23) / 7;
    if (calm || u >= 1) return;
    ctx.strokeStyle = 'rgba(14,12,16,.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = -60 + u * (w + 160) - i * 26 - (i % 2) * 8, y = h * 0.34 - u * h * 0.14 + (i % 2) * 18 + i * 7;
      const flap = Math.sin(time * 11 + i * 2) * 4;
      ctx.beginPath(); ctx.moveTo(x - 8, y - flap); ctx.quadraticCurveTo(x - 3, y - 2, x, y + 1); ctx.quadraticCurveTo(x + 3, y - 2, x + 8, y - flap); ctx.stroke();
    }
  }

  return { update, ground, air, sky, clear() { particles = []; wake = []; clock = new Map(); }, get count() { return particles.length; } };
}
