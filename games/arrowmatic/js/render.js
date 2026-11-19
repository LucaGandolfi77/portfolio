/* Arrowmatic — canvas renderer with juicy arcade visuals */

import { G, chapterOf } from './state.js';
import { CHAPTERS } from './data.js';
import { rnd } from './util.js';

export function initCanvas(canvas) {
  G.cv = canvas;
  G.ctx = canvas.getContext('2d');
  resize();
}

export function resize() {
  if (!G.cv) return;
  G.DPR = Math.min(window.devicePixelRatio || 1, 2);
  G.W = window.innerWidth;
  G.H = window.innerHeight;
  G.cv.width = Math.round(G.W * G.DPR);
  G.cv.height = Math.round(G.H * G.DPR);
  G.cv.style.width = G.W + 'px';
  G.cv.style.height = G.H + 'px';
  G.ctx.setTransform(G.DPR, 0, 0, G.DPR, 0, 0);
}

function circle(x, y, r) { const c = G.ctx; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); }
function circleStroke(x, y, r) { const c = G.ctx; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.stroke(); }
function ellipse(x, y, rx, ry) { const c = G.ctx; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.2832); c.fill(); }
function diamond(x, y, r) {
  const c = G.ctx;
  c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.fill();
}
function line(a, b, c, d) { const ctx = G.ctx; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
function rr(x, y, w, h, r) { const c = G.ctx; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }

function drawBlob(x, y, r, col, face, boss) {
  const c = G.ctx;
  const sq = 1 + Math.sin(performance.now() / 130 + x * 0.05) * 0.06;
  c.save();
  c.shadowColor = col;
  c.shadowBlur = boss ? 26 : 12;
  c.fillStyle = col;
  c.beginPath();
  c.ellipse(x, y, r / sq, r * sq, 0, 0, 6.2832);
  c.fill();
  c.restore();
  c.fillStyle = 'rgba(255,255,255,.35)';
  c.beginPath();
  c.ellipse(x - r * 0.3, y - r * 0.35, r * 0.26, r * 0.16, -0.5, 0, 6.2832);
  c.fill();
  const ex = r * 0.32, ey = -r * 0.1, er = Math.max(2.4, r * 0.14);
  c.fillStyle = '#fff'; circle(x - ex, y + ey, er); circle(x + ex, y + ey, er);
  c.fillStyle = '#111'; circle(x - ex + er * 0.3, y + ey, er * 0.5); circle(x + ex + er * 0.3, y + ey, er * 0.5);
  if (face === 3) {
    c.strokeStyle = '#111'; c.lineWidth = 2;
    line(x - ex - er, y + ey - er * 1.6, x - ex + er, y + ey - er * 1.1);
    line(x + ex + er, y + ey - er * 1.6, x + ex - er, y + ey - er * 1.1);
  }
  if (face === 4 || boss) {
    c.fillStyle = '#fff';
    c.fillRect(x - r * 0.25, y + r * 0.28, r * 0.5, r * 0.16);
  }
}

function drawHero() {
  const P = G.P;
  if (!P) return;
  const c = G.ctx;
  const bob = P.moving ? Math.sin(performance.now() / 70) * 2.4 : 0;
  c.save();
  c.translate(P.x, P.y + bob);
  if (P.inv > 0 && Math.floor(performance.now() / 70) % 2) c.globalAlpha = 0.45;
  c.rotate(P.angle + Math.PI / 2);
  c.shadowColor = '#a78bfa';
  c.shadowBlur = 18;
  c.fillStyle = '#7c3aed';
  rr(-11, -6, 22, 16, 6);
  c.shadowBlur = 0;
  c.fillStyle = '#fef3c7';
  rr(-10, -13, 20, 22, 9);
  c.fillStyle = '#fbbf24';
  rr(-10, -2, 20, 4, 2);
  c.fillStyle = '#1b1440';
  circle(-4, -6, 2.1); circle(4, -6, 2.1);
  c.fillStyle = '#78350f';
  rr(7, -16, 4, 14, 2);
  c.fillStyle = '#e5e7eb';
  rr(7, -19, 4, 5, 2);
  c.restore();
  c.globalAlpha = 1;
  if (P.waveShield && !P._wsUsed) {
    c.strokeStyle = 'rgba(125,211,252,.75)';
    c.lineWidth = 2.5;
    c.setLineDash([6, 6]);
    circleStroke(P.x, P.y, 24);
    c.setLineDash([]);
  }
  if (P.moveFire) {
    c.font = '10px sans-serif';
    c.textAlign = 'center';
    c.fillText('🦵', P.x, P.y - 24);
  }
}

function drawDrops() {
  const c = G.ctx;
  for (const d of G.drops) {
    const pulse = 1 + 0.18 * Math.sin(performance.now() / 160 + d.ph);
    c.save();
    c.translate(d.x, d.y + Math.sin(performance.now() / 300 + d.ph) * 3);
    c.scale(pulse, pulse);
    c.shadowColor = d.type === 'coin' ? '#fbbf24' : '#22d3ee';
    c.shadowBlur = 12;
    if (d.type === 'coin') {
      c.fillStyle = '#fbbf24'; circle(0, 0, 7);
      c.fillStyle = '#b45309'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.fillText('$', 0, 3);
    } else if (d.type === 'gem') { c.fillStyle = '#22d3ee'; diamond(0, 0, 7); }
    else {
      const icons = { heart: '❤️', magnet: '🧲', bomb: '💣', chest: '🎁' };
      c.font = '15px serif'; c.textAlign = 'center'; c.fillText(icons[d.type] || '⭐', 0, 5);
    }
    c.restore();
  }
}

export function render() {
  const c = G.ctx;
  if (!c || !G.P) return;
  const ch = CHAPTERS[chapterOf(G.run.level)] || CHAPTERS[0];
  c.save();
  if (G.shake > 0) c.translate(rnd(-G.shake, G.shake) * 0.5, rnd(-G.shake, G.shake) * 0.5);

  const g = c.createLinearGradient(0, 0, 0, G.H);
  g.addColorStop(0, ch.c1);
  g.addColorStop(1, ch.c2);
  c.fillStyle = g;
  c.fillRect(-20, -20, G.W + 40, G.H + 40);

  c.fillStyle = 'rgba(255,255,255,.14)';
  const off = (performance.now() / 60) % 48;
  for (let x = -48; x < G.W + 48; x += 48) {
    for (let y = ((x / 48) % 2) * 24 - 48; y < G.H + 48; y += 48) {
      c.beginPath(); c.arc(x + ((y + off) % 96) / 2, y, 2.2, 0, 6.2832); c.fill();
    }
  }
  c.fillStyle = 'rgba(0,0,0,.07)';
  c.fillRect(0, 0, G.W, 14);
  c.fillRect(0, G.H - 14, G.W, 14);

  drawDrops();

  c.fillStyle = 'rgba(0,0,0,.14)';
  for (const en of G.enemies) if (!en.dead) ellipse(en.x, en.y + en.r * 0.85, en.r * 0.8, en.r * 0.3);
  ellipse(G.P.x, G.P.y + 13, 11, 4);

  for (const en of G.enemies) {
    if (en.dead) continue;
    drawBlob(en.x, en.y, en.r, en.flash > 0 ? '#ffffff' : en.col, en.face || 1, en.boss);
    if (en.elite) { c.strokeStyle = '#fbbf24'; c.lineWidth = 2.5; circleStroke(en.x, en.y, en.r + 5); }
    if (!en.boss && en.hp < en.maxHp) {
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(en.x - en.r, en.y - en.r - 9, en.r * 2, 4);
      c.fillStyle = '#84cc16'; c.fillRect(en.x - en.r, en.y - en.r - 9, en.r * 2 * (en.hp / en.maxHp), 4);
    }
  }

  for (const en of G.enemies) {
    if (en.dead || !en.boss || en.state !== 'charge') continue;
    if (en.pt > 0.8) {
      c.strokeStyle = 'rgba(255,45,77,.7)'; c.lineWidth = 3; c.setLineDash([8, 7]);
      line(en.x, en.y, en.x + Math.cos(en.chargeA || 0) * 999, en.y + Math.sin(en.chargeA || 0) * 999);
      c.setLineDash([]);
    }
  }

  drawHero();

  for (const b of G.bullets) {
    c.save();
    c.translate(b.x, b.y);
    c.rotate(Math.atan2(b.vy, b.vx));
    c.shadowColor = b.col;
    c.shadowBlur = 12;
    c.fillStyle = b.col;
    rr(-9, -2.6, 18, 5.2, 2.6);
    c.restore();
  }
  for (const b of G.ebullets) {
    c.fillStyle = b.col; circle(b.x, b.y, b.r);
    c.fillStyle = 'rgba(255,255,255,.55)'; circle(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.4);
  }

  for (const p of G.parts) {
    c.globalAlpha = Math.max(0, p.life / p.maxLife);
    c.fillStyle = p.col;
    circle(p.x, p.y, 2.4);
  }
  c.globalAlpha = 1;

  c.textAlign = 'center';
  for (const f of G.floats) {
    c.globalAlpha = Math.max(0, Math.min(1, f.life / 0.4));
    c.font = '900 13px -apple-system, system-ui, sans-serif';
    c.fillStyle = f.col;
    c.strokeStyle = 'rgba(0,0,0,.45)';
    c.lineWidth = 3;
    c.strokeText(f.txt, f.x, f.y);
    c.fillText(f.txt, f.x, f.y);
  }
  c.globalAlpha = 1;

  if (G.joy.on) {
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3; circleStroke(G.joy.ox, G.joy.oy, 52);
    c.fillStyle = 'rgba(255,255,255,.85)'; circle(G.joy.ox + G.joy.dx * 52, G.joy.oy + G.joy.dy * 52, 24);
  }
  c.restore();
}
