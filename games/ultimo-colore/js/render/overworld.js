/* ============================================================
   Ultimo Colore — drawing the open lagoon
   ------------------------------------------------------------
   The painted map from Blender, with everything that moves or
   changes drawn on top: the party, the Faded, closed passages,
   markers and the compass.
   ============================================================ */
import { WORLD, GATES, BOAT_AT } from '../world/layout.js';
import { kindAt, gateOpen } from '../world/terrain.js';
import { CHESTS, STATUES } from '../data/places.js';
import { NODE } from '../data/map.js';
import * as P from '../world/progress.js';
import { heroSVG, dogSVG, foeSVG, SPRITE_SCALE } from './sprites.js';

const TAU = Math.PI * 2;

/** An SVG string as an image the canvas can draw. */
function sprite(svg, w, h) {
  const img = new Image();
  const body = svg.replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(body)}`;
  return img;
}

const ready = (img) => img && img.complete && img.naturalWidth > 0;

export function createOverworld(canvas) {
  const ctx = canvas.getContext('2d');
  const world = new Image();
  let artSrc = '';
  const heroes = {}, foes = {};
  const dog = sprite(dogSVG(), 200, 160);
  const hero = (id) => (heroes[id] = heroes[id] || sprite(heroSVG(id), 208, 300));
  const foe = (type) => (foes[type] = foes[type] || sprite(foeSVG(type), 240, 260));
  let w = 1, h = 1, dpr = 1;
  let view = { x: 0, y: 0, zoom: 1 };

  function setArt(url) {
    if (url !== artSrc) { artSrc = url; world.src = url; }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  const shadow = (x, y, rx) => {
    ctx.fillStyle = 'rgba(0,0,0,.34)';
    ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.36, 0, 0, TAU); ctx.fill();
  };

  function ripple(x, y, r, time) {
    ctx.strokeStyle = 'rgba(210,245,240,.55)';
    for (let i = 0; i < 3; i++) {
      const k = (time * 0.7 + i / 3) % 1;
      ctx.globalAlpha = 1 - k;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y, r * (0.6 + k), r * (0.24 + k * 0.4), 0, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function picture(img, x, y, hh, flip = 1, aspect = 104 / 150) {
    if (!ready(img)) return;
    const ww = hh * aspect;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.drawImage(img, -ww / 2, -hh, ww, hh);
    ctx.restore();
  }

  function mark(x, y, text, color, time, r = 15) {
    const yy = y + Math.sin(time * 4) * 4;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, yy, r, 0, TAU); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#1a1210'; ctx.stroke();
    ctx.fillStyle = '#1a1210';
    ctx.font = `900 ${r * 1.25}px Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, yy + 1);
  }

  function boatHull(x, y, flip, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.fillStyle = '#5a2e1c'; ctx.strokeStyle = '#1a100a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-58, -8); ctx.quadraticCurveTo(-40, 24, 0, 24); ctx.quadraticCurveTo(44, 24, 66, -14); ctx.quadraticCurveTo(0, 6, -58, -8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c9a070'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-54, -6); ctx.quadraticCurveTo(0, 8, 62, -12); ctx.stroke();
    ctx.restore();
  }

  function sail(x, y, flip, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flip, 1);
    ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-24, -4); ctx.lineTo(-24, -92); ctx.stroke();
    ctx.fillStyle = 'rgba(222,208,176,.95)'; ctx.strokeStyle = '#5a4a34'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-22, -90); ctx.quadraticCurveTo(-72 - Math.sin(time * 2) * 4, -60, -48, -26); ctx.lineTo(-22, -32); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function party(field, s) {
    const { x, y } = field.pos;
    const afloat = kindAt(x, y, s.done) === 'water';
    const bob = field.moving ? Math.abs(Math.sin(field.time * 11)) * 4 : Math.sin(field.time * 2) * 1;
    if (afloat) {
      const by = y + Math.sin(field.time * 2.4) * 2.5;
      ripple(x, by + 14, 56, field.time);
      sail(x, by, field.facing, field.time);
      s.party.slice().reverse().forEach((id, i, list) => picture(hero(id), x + field.facing * (34 - (list.length - 1 - i) * 21), by + 8, 62, field.facing));
      picture(dog, x + field.facing * 52, by, 26, field.facing, 100 / 80);
      boatHull(x, by + 2, field.facing, field.time);
      return;
    }
    // followers walk in the leader's footsteps
    const trail = field.trail;
    const at = (back) => trail[Math.max(0, trail.length - 1 - back)];
    const walkers = [...s.party.slice(1).map((id, i) => ({ id, p: at((i + 1) * 6) })), { id: 'ombra', p: at((s.party.length) * 6) }, { id: s.party[0], p: field.pos, lead: true }];
    walkers.sort((a, b) => a.p.y - b.p.y);
    const wet = (p) => kindAt(p.x, p.y, s.done) === 'shallow';
    for (const wk of walkers) {
      const px = wk.p.x, py = wk.p.y;
      const sunk = wet(wk.p) ? 9 : 0;
      if (sunk) ripple(px, py, 18, field.time + px * 0.01); else shadow(px, py + 2, wk.id === 'ombra' ? 16 : 18);
      ctx.save();
      if (sunk) { ctx.beginPath(); ctx.rect(px - 60, py - 140, 120, 140 + 1); ctx.clip(); }
      if (wk.id === 'ombra') picture(dog, px, py + sunk * 0.6 - bob * 0.5, 34, field.facing, 100 / 80);
      else picture(hero(wk.id), px, py + sunk - bob, wk.lead ? 78 : 69, field.facing);
      ctx.restore();
    }
  }

  function enemy(g, s, time) {
    const size = (g.boss ? 112 : 80) * SPRITE_SCALE[g.enemies[0]];
    const spread = g.boss ? 82 : 44;
    const wet = ['water', 'shallow'].includes(kindAt(g.x, g.y, s.done));
    g.enemies.slice().reverse().forEach((type, ri) => {
      const i = g.enemies.length - 1 - ri;
      const x = g.x + (i ? (i % 2 ? 1 : -1) * spread * Math.ceil(i / 2) : 0);
      const y = g.y - (i ? 14 : 0);
      const hh = (g.boss && i === 0 ? size : 80 * SPRITE_SCALE[type]) * (i ? 0.85 : 1);
      if (wet) ripple(x, y, hh * 0.36, time + i); else shadow(x, y + 3, hh * 0.32);
      picture(foe(type), x, y + Math.sin(time * 2.6 + i * 2 + g.home.x) * 4, hh, 1, 12 / 13);
    });
    if (g.state === 'alert' || g.state === 'chase') mark(g.x, g.y - size - 20, '!', '#ff5a5a', time);
    else if (g.node) mark(g.x, g.y - size - 20, '⚔', '#f0a850', time, 17);
  }

  /** Where an unaware enemy is looking: walk round it to strike first. */
  function sight(g) {
    const a = Math.atan2(g.dir.y, g.dir.x);
    const grad = ctx.createRadialGradient(g.x, g.y, 10, g.x, g.y, 200);
    grad.addColorStop(0, 'rgba(255,240,180,.3)'); grad.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.arc(g.x, g.y, 200, a - 1.2, a + 1.2); ctx.closePath(); ctx.fill();
  }

  function gates(s, time) {
    for (const gate of GATES) {
      if (gateOpen(gate, s.done)) continue;
      if (gate.id === 'ponte') { barricade(gate); continue; }
      // a curtain of reeds across the passage
      for (let x = gate.x + 6; x < gate.x + gate.w; x += 11) {
        for (let k = 0; k < 3; k++) {
          const bx = x + ((x * 7 + k * 11) % 9) - 4;
          const by = gate.y + gate.h - k * (gate.h / 3);
          const tall = 32 + ((x * 5 + k * 17) % 22);
          const sway = Math.sin(time * 1.6 + x * 0.05 + k) * 3;
          ctx.strokeStyle = k === 1 ? '#8aa640' : '#5c7830'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sway * 0.4, by - tall * 0.6, bx + sway, by - tall); ctx.stroke();
        }
      }
    }
  }

  /** Crates and a rope across the bridge. */
  function barricade(g) {
    const y = g.y + g.h;
    ctx.strokeStyle = '#241408'; ctx.lineWidth = 3;
    for (let x = g.x + 14, i = 0; x < g.x + g.w - 20; x += 34, i++) {
      const s = 28 + (i % 2) * 6;
      ctx.fillStyle = i % 2 ? '#8a6234' : '#6e4a26';
      ctx.fillRect(x, y - s, s, s); ctx.strokeRect(x, y - s, s, s);
      ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.stroke();
    }
    ctx.strokeStyle = '#d8c090'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(g.x + 4, y - 36); ctx.quadraticCurveTo(g.x + g.w / 2, y - 24, g.x + g.w - 4, y - 36); ctx.stroke();
  }

  function chest(c, time) {
    const g = ctx.createRadialGradient(c.x, c.y - 12, 2, c.x, c.y - 12, 34);
    g.addColorStop(0, 'rgba(255,200,90,.75)'); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y - 12, 34, 0, TAU); ctx.fill();
    const y = c.y - 12 + Math.sin(time * 3 + c.x) * 3;
    ctx.fillStyle = '#f0a23a'; ctx.strokeStyle = '#241408'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(c.x, y, 10, 13, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#241408'; ctx.fillRect(c.x - 7, y - 17, 14, 5); ctx.fillRect(c.x - 6, y + 12, 12, 4);
  }

  function compass(target, field, time) {
    const sx = (target.x - view.x) * view.zoom, sy = (target.y - view.y) * view.zoom;
    const m = 34;
    if (sx > m && sx < w - m && sy > m + 80 && sy < h - m) return;
    const cx = (field.pos.x - view.x) * view.zoom, cy = (field.pos.y - view.y) * view.zoom;
    const a = Math.atan2(sy - cy, sx - cx);
    const ex = Math.max(m, Math.min(w - m, sx)), ey = Math.max(m + 120, Math.min(h - m - 96, sy));
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(ex, ey); ctx.rotate(a);
    const p = 1 + Math.sin(time * 5) * 0.1;
    ctx.scale(p, p);
    ctx.fillStyle = '#ffd24a'; ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-12, -14); ctx.lineTo(-5, 0); ctx.lineTo(-12, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  function draw(field, s, goal) {
    if (!field) return;
    const zoom = Math.max(w / 900, Math.min(w / 470, h / 700));
    const vw = w / zoom, vh = h / zoom;
    const x = vw >= WORLD.w ? (WORLD.w - vw) / 2 : Math.max(0, Math.min(WORLD.w - vw, field.pos.x - vw / 2));
    // a little more of what lies ahead, to the north
    const y = vh >= WORLD.h ? (WORLD.h - vh) / 2 : Math.max(0, Math.min(WORLD.h - vh, field.pos.y - vh * 0.56));
    view = { x, y, zoom };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1f4a52';
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, -x * dpr * zoom, -y * dpr * zoom);
    if (ready(world)) {
      const k = world.naturalWidth / WORLD.w;
      const cx = Math.max(0, x), cy = Math.max(0, y), cw = Math.min(vw, WORLD.w - cx), ch = Math.min(vh, WORLD.h - cy);
      ctx.drawImage(world, cx * k, cy * k, cw * k, ch * k, cx, cy, cw, ch);
    }
    const time = field.time;
    const seen = (p, r = 140) => p.x > x - r && p.x < x + vw + r && p.y > y - r && p.y < y + vh + r * 1.6;
    gates(s, time);
    if (!s.done.includes('stiva')) { ripple(BOAT_AT.x, BOAT_AT.y + 12, 54, time * 0.5); sail(BOAT_AT.x, BOAT_AT.y, 1, time); boatHull(BOAT_AT.x, BOAT_AT.y + 2, 1, time); }

    for (const c of CHESTS) if (!s.opened.includes(c.id) && seen(c)) chest(c, time);
    for (const g of field.groups) if (g.state === 'idle' && seen(g, 240)) sight(g);
    const things = field.groups.filter((g) => seen(g, 220)).map((g) => ({ y: g.y, draw: () => enemy(g, s, time) }));
    things.push({ y: field.pos.y, draw: () => party(field, s) });
    things.sort((a, b) => a.y - b.y).forEach((t) => t.draw());

    for (const st of STATUES) {
      if (s.read.includes(st.id) || !seen(st) || Math.hypot(st.x - field.pos.x, st.y - field.pos.y) > 260) continue;
      mark(st.x, st.y - 58, '…', '#efe9dc', time, 11);
    }
    for (const id of P.available(s)) {
      const n = NODE[id];
      if (n.enemies || n.auto) continue;
      const at = id === 'stiva' ? BOAT_AT : n.at;
      mark(at.x, at.y - (id === 'stiva' ? 120 : 92), n.type === 'camp' ? '⌂' : '!', '#ffd24a', time, 18);
    }
    if (goal) {
      const at = goal.id === 'stiva' ? BOAT_AT : goal.at;
      ctx.strokeStyle = 'rgba(255,214,90,.8)'; ctx.lineWidth = 3; ctx.setLineDash([9, 9]); ctx.lineDashOffset = -time * 20;
      ctx.beginPath(); ctx.ellipse(at.x, at.y + 4, 52, 22, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    const near = field.near;
    if (near?.kind === 'strike') {
      const g = field.groups.find((q) => q.id === near.id);
      if (g) { ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(g.x, g.y + 4, 46, 18, 0, 0, TAU); ctx.stroke(); }
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,10,14,.42)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    if (goal) compass(goal.id === 'stiva' ? BOAT_AT : goal.at, field, time);
  }

  /** The little map in the corner. */
  function minimap(target, field, s, goal) {
    const c = target.getContext('2d');
    const mw = target.width, mh = target.height;
    c.clearRect(0, 0, mw, mh);
    if (ready(world)) c.drawImage(world, 0, 0, mw, mh);
    c.fillStyle = 'rgba(6,10,14,.18)'; c.fillRect(0, 0, mw, mh);
    const dot = (p, color, r) => { c.fillStyle = color; c.beginPath(); c.arc((p.x / WORLD.w) * mw, (p.y / WORLD.h) * mh, r, 0, TAU); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#000'; c.stroke(); };
    for (const g of field?.groups || []) if (g.node) dot(g, '#ff7a5a', 3.5);
    if (goal) dot(goal.id === 'stiva' ? BOAT_AT : goal.at, '#ffd24a', 5);
    dot(field ? field.pos : s.pos, '#ffffff', 4);
  }

  resize();
  return { draw, minimap, resize, setArt, get view() { return view; } };
}
