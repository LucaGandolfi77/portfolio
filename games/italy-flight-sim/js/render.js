/* Italy Flight Sim — Canvas 2D renderer */

import { WORLD } from './config.js';
import { CLOUDS, LAND, AIRPORTS_W, worldToScreen } from './map.js';
import { runwayVector } from './flight.js';

const LAND_FILL = '#3e7d5f';
const LAND_EDGE = '#a7e0b4';
const SEA_TOP = '#0a2b46';
const SEA_BOTTOM = '#071c33';

function polygon(ctx, pts, wp) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const s = wp(p.x, p.y);
    if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
  });
  ctx.closePath();
}

function drawSea(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, SEA_TOP);
  g.addColorStop(1, SEA_BOTTOM);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(180, 225, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

function drawClouds(ctx, wp, zoom) {
  ctx.fillStyle = '#ffffff';
  for (const c of CLOUDS) {
    const s = wp(c.x, c.y);
    const r = c.r * zoom;
    if (s.x < -r || s.y < -r || s.x > 4000 || s.y > 4000) continue;
    ctx.globalAlpha = c.a;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.ellipse(s.x - r * 0.5, s.y + r * 0.12, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(s.x + r * 0.55, s.y + r * 0.1, r * 0.65, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLand(ctx, wp, zoom) {
  ctx.lineWidth = Math.max(1, 2 * zoom);
  for (const poly of LAND) {
    polygon(ctx, poly, wp);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.save(); ctx.translate(3, 5); ctx.fill(); ctx.restore();
    polygon(ctx, poly, wp);
    const g = ctx.createLinearGradient(0, 0, 0, WORLD.h * zoom);
    g.addColorStop(0, '#4a8a67');
    g.addColorStop(1, '#2f6b51');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = LAND_EDGE;
    ctx.lineWidth = Math.max(1.2, 2 * zoom);
    ctx.stroke();
  }
}

function drawRunway(ctx, a, wp, zoom, isTarget, time) {
  const s = wp(a.x, a.y);
  const v = runwayVector(a);
  const len = 34 * zoom, wid = 5 * zoom;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(Math.atan2(v.x, -v.y));
  ctx.fillStyle = isTarget ? '#f6d365' : 'rgba(225,235,240,0.85)';
  ctx.fillRect(-wid / 2, -len / 2, wid, len);
  ctx.fillStyle = 'rgba(10,25,40,0.55)';
  ctx.fillRect(-0.6 * zoom, -len / 2 + 5 * zoom, 1.2 * zoom, len - 10 * zoom);
  ctx.restore();

  if (isTarget) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    ctx.strokeStyle = `rgba(255, 209, 102, ${0.35 + pulse * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, (18 + pulse * 7) * zoom, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (zoom > 0.42) {
    ctx.font = `700 ${Math.max(9, 11 * Math.min(zoom, 1.2))}px ui-monospace, monospace`;
    ctx.fillStyle = isTarget ? '#ffd166' : 'rgba(233, 245, 255, 0.78)';
    ctx.textAlign = 'center';
    ctx.fillText(a.code, s.x, s.y - len / 2 - 6);
  }
}

function drawRoute(ctx, game, wp) {
  if (!game.mission) return;
  const stops = game.mission.stops.map(code => AIRPORTS_W.find(a => a.code === code)).filter(Boolean);
  if (stops.length < 2) return;
  ctx.save();
  ctx.setLineDash([6, 7]);
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  stops.forEach((a, i) => {
    const s = wp(a.x, a.y);
    if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
  });
  ctx.stroke();
  ctx.restore();
}

function planeShape(ctx, kind, color, size, time) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(8, 20, 34, 0.85)';
  ctx.lineWidth = 1.4;
  if (kind === 'starfighter' || kind === 'cruiser') {
    const wide = kind === 'cruiser';
    const span = wide ? 1.4 : 1.25;
    ctx.beginPath();
    ctx.moveTo(0, -size * (wide ? 1.5 : 1.7));
    ctx.lineTo(size * 0.18, -size * 0.4);
    ctx.lineTo(size * span, size * 0.8);
    ctx.lineTo(size * (wide ? 0.5 : 0.45), size * 0.5);
    ctx.lineTo(size * 0.34, size * 1.0);
    ctx.lineTo(-size * 0.34, size * 1.0);
    ctx.lineTo(-size * (wide ? 0.5 : 0.45), size * 0.5);
    ctx.lineTo(-size * span, size * 0.8);
    ctx.lineTo(-size * 0.18, -size * 0.4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e7f5ff';
    ctx.fillRect(-size * 0.1, -size * 0.75, size * 0.2, size * 0.55);
    ctx.fillStyle = '#ffffff';
    const glow = 0.5 + 0.35 * Math.sin(time * 9);
    ctx.globalAlpha = glow;
    ctx.fillRect(-size * 0.42, size * 0.85, size * 0.26, size * 0.22);
    ctx.fillRect(size * 0.16, size * 0.85, size * 0.26, size * 0.22);
    ctx.globalAlpha = 1;
  } else if (kind === 'jet') {
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.35); ctx.lineTo(size * 0.22, -size * 0.2);
    ctx.lineTo(size * 1.05, size * 0.72); ctx.lineTo(size * 0.35, size * 0.5);
    ctx.lineTo(size * 0.22, size); ctx.lineTo(-size * 0.22, size);
    ctx.lineTo(-size * 0.35, size * 0.5); ctx.lineTo(-size * 1.05, size * 0.72);
    ctx.lineTo(-size * 0.22, -size * 0.2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (kind === 'airliner') {
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.4); ctx.quadraticCurveTo(size * 0.3, 0, size * 0.24, size);
    ctx.lineTo(-size * 0.24, size); ctx.quadraticCurveTo(-size * 0.3, 0, 0, -size * 1.4);
    ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 1.15, -size * 0.1, size * 2.3, size * 0.24);
    ctx.fillRect(-size * 0.6, size * 0.72, size * 1.2, size * 0.2);
    ctx.fillStyle = '#dcefff';
    ctx.fillRect(-size * 0.7, -size * 0.12, size * 0.18, size * 0.28);
    ctx.fillRect(size * 0.52, -size * 0.12, size * 0.18, size * 0.28);
  } else if (kind === 'heli') {
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.42, size * 0.62, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 0.1, size * 0.3, size * 0.2, size * 0.95);
    ctx.save(); ctx.rotate(time * 7);
    ctx.fillRect(-size * 1.5, -size * 0.75, size * 3, size * 0.12);
    ctx.restore();
    ctx.fillRect(-size * 0.06, -size * 0.95, size * 0.12, size * 0.3);
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.25); ctx.lineTo(size * 0.24, size * 0.1);
    ctx.lineTo(size * 0.2, size * 0.85); ctx.lineTo(-size * 0.2, size * 0.85);
    ctx.lineTo(-size * 0.24, size * 0.1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 1.05, -size * 0.18, size * 2.1, size * 0.3);
    ctx.fillRect(-size * 0.6, size * 0.65, size * 1.2, size * 0.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(-size * 0.85, -size * 1.5); ctx.lineTo(size * 0.85, -size * 1.5); ctx.stroke();
  }
}

function drawPlane(ctx, game, wp, zoom, time) {
  const s = game.state;
  if (!s) return;
  const p = wp(s.x, s.y);
  const size = Math.max(7, Math.min(22, 12 * zoom * (game.plane.starship ? 1.15 : 1)));
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(p.x + s.alt * 0.012 * zoom, p.y + s.alt * 0.012 * zoom, size * 0.8, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(s.heading);
  const fast = Math.max(0, Math.min(1, (s.speed - 100) / 300));
  if (fast > 0 || s.boosting) {
    ctx.globalAlpha = Math.min(0.55, fast * 0.35 + (s.boosting ? 0.25 : 0));
    ctx.fillStyle = game.plane.starship ? '#66d9e8' : '#ffd166';
    for (const off of [-0.35, 0, 0.35]) {
      ctx.beginPath();
      ctx.moveTo(off * size, size * 0.5);
      ctx.lineTo(off * size * 0.6, size * (1.2 + fast * 1.6));
      ctx.lineTo(off * size + size * 0.13, size * 0.5);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  planeShape(ctx, game.plane.kind, game.plane.color, size, time);
  if (game.plane.starship) {
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(time * 9);
    ctx.fillStyle = game.plane.color;
    ctx.beginPath(); ctx.ellipse(-size * 0.3, size * 1.05, size * 0.18, size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(size * 0.3, size * 1.05, size * 0.18, size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawJoystick(ctx, joy, active, w, h) {
  if (!active) return;
  const bx = 78, by = h - 96, r = 44;
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.arc(bx + joy.x * 28, by + joy.y * 28, 17, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,209,102,0.55)'; ctx.fill(); ctx.stroke();
  ctx.restore();
}

export function drawScene(ctx, view) {
  const { w, h, game, time, joy, joyActive } = view;
  const cam = game.cam;
  const wp = (x, y) => worldToScreen(x, y, cam, w, h);
  ctx.clearRect(0, 0, w, h);
  drawSea(ctx, w, h);
  drawClouds(ctx, wp, cam.zoom);
  drawLand(ctx, wp, cam.zoom);
  drawRoute(ctx, game, wp);
  const target = game.targetAirport();
  for (const a of AIRPORTS_W) drawRunway(ctx, a, wp, cam.zoom, !!target && a.code === target.code, time);
  drawPlane(ctx, game, wp, cam.zoom, time);
  drawJoystick(ctx, joy, joyActive, w, h);
}

export function drawMinimap(ctx, w, h, game) {
  ctx.clearRect(0, 0, w, h);
  const pad = 6;
  const scale = Math.min((w - pad * 2) / WORLD.w, (h - pad * 2) / WORLD.h);
  const ox = (w - WORLD.w * scale) / 2, oy = (h - WORLD.h * scale) / 2;
  const wp = (x, y) => ({ x: ox + x * scale, y: oy + y * scale });
  ctx.fillStyle = 'rgba(7, 28, 51, 0.9)';
  ctx.fillRect(0, 0, w, h);
  for (const poly of LAND) {
    polygon(ctx, poly, wp);
    ctx.fillStyle = '#4a8a67'; ctx.fill();
    ctx.strokeStyle = '#a7e0b4'; ctx.lineWidth = 0.7; ctx.stroke();
  }
  const target = game.targetAirport();
  if (game.mission && game.mission.stops.length > 1) {
    ctx.strokeStyle = 'rgba(255,209,102,0.8)'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    game.mission.stops.forEach((code, i) => {
      const a = AIRPORTS_W.find(x => x.code === code);
      if (!a) return;
      const s = wp(a.x, a.y);
      if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (const a of AIRPORTS_W) {
    const s = wp(a.x, a.y);
    ctx.fillStyle = target && a.code === target.code ? '#ffd166' : 'rgba(230,245,255,0.75)';
    ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
  }
  if (game.state) {
    const s = wp(game.state.x, game.state.y);
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(game.state.heading);
    ctx.fillStyle = game.plane.color;
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(2.6, 3); ctx.lineTo(-2.6, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
