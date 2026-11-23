/* Italy Glight Sim — 2.5D isometric Canvas 2D renderer */

import { WORLD } from './config.js';
import { CLOUDS, LAND, AIRPORTS_W } from './map.js';
import { runwayVector } from './flight.js';
import { ISO_Y, LAND_SPAN, TERRAIN, isoProject, screenAngle } from './iso.js';

function tracePoly(ctx, pts, P) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const s = P(p.x, p.y, 0);
    if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
  });
  ctx.closePath();
}

function drawSea(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#161a3a');
  g.addColorStop(1, '#080f26');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawGrid(ctx, P) {
  ctx.strokeStyle = 'rgba(160, 200, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.w; x += 200) {
    const a = P(x, 0, 0), b = P(x, WORLD.h, 0);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  for (let y = 0; y <= WORLD.h; y += 200) {
    const a = P(0, y, 0), b = P(WORLD.w, y, 0);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
}

function drawClouds(ctx, P, zoom) {
  ctx.fillStyle = '#ffffff';
  for (const c of CLOUDS) {
    const s = P(c.x, c.y, 240);
    const r = c.r * zoom;
    if (s.x < -80 || s.x > 5000 || s.y < -80 || s.y > 5000) continue;
    ctx.globalAlpha = c.a;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, r, r * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(s.x - r * 0.5, s.y + r * 0.1, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(s.x + r * 0.5, s.y + r * 0.1, r * 0.6, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawLand(ctx, P, zoom) {
  for (const poly of LAND) {
    tracePoly(ctx, poly, P);
    ctx.save(); ctx.translate(0, 7 * zoom);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); ctx.restore();
    tracePoly(ctx, poly, P);
    ctx.fillStyle = '#3d7a5c'; ctx.fill();
    ctx.strokeStyle = '#a9e3b8';
    ctx.lineWidth = Math.max(1, 1.6 * zoom);
    ctx.stroke();
  }
}

function drawTerrain(ctx, P, zoom) {
  for (const peak of TERRAIN) {
    const b = P(peak.x, peak.y, 0);
    const t = P(peak.x, peak.y, peak.h);
    const rx = peak.r * zoom, ry = peak.r * ISO_Y * zoom;
    ctx.beginPath();
    ctx.moveTo(b.x - rx, b.y); ctx.lineTo(b.x, b.y + ry);
    ctx.lineTo(t.x, t.y + ry); ctx.lineTo(t.x - rx, t.y);
    ctx.closePath(); ctx.fillStyle = '#2b5a45'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(b.x, b.y + ry); ctx.lineTo(b.x + rx, b.y);
    ctx.lineTo(t.x + rx, t.y); ctx.lineTo(t.x, t.y + ry);
    ctx.closePath(); ctx.fillStyle = '#356b50'; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - ry); ctx.lineTo(t.x + rx, t.y);
    ctx.lineTo(t.x, t.y + ry); ctx.lineTo(t.x - rx, t.y);
    ctx.closePath(); ctx.fillStyle = '#6aa884'; ctx.fill();
  }
}

function drawRoute(ctx, game, P) {
  if (!game.mission) return;
  const stops = game.mission.stops.map(code => AIRPORTS_W.find(a => a.code === code)).filter(Boolean);
  if (stops.length < 2) return;
  ctx.save();
  ctx.setLineDash([6, 7]);
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.7)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  stops.forEach((a, i) => {
    const s = P(a.x, a.y, 4);
    if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
  });
  ctx.stroke();
  ctx.restore();
}

function drawRunway(ctx, a, P, zoom, isTarget, time) {
  const v = runwayVector(a);
  const px = -v.y, py = v.x;
  const L = 34, W = 6;
  const pts = [[1, 1], [1, -1], [-1, -1], [-1, 1]]
    .map(([s, t]) => P(a.x + v.x * L * s + px * W * t, a.y + v.y * L * s + py * W * t, 0));
  ctx.beginPath();
  pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
  ctx.closePath();
  ctx.fillStyle = isTarget ? '#f6d365' : 'rgba(225,235,240,0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,35,55,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const a1 = P(a.x - v.x * L, a.y - v.y * L, 0.5);
  const a2 = P(a.x + v.x * L, a.y + v.y * L, 0.5);
  ctx.strokeStyle = 'rgba(10,25,40,0.6)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
  ctx.setLineDash([]);

  if (isTarget) {
    const s = P(a.x, a.y, 0);
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    ctx.strokeStyle = `rgba(255, 209, 102, ${0.35 + pulse * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, (24 + pulse * 8) * zoom, (12 + pulse * 4) * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (zoom > 0.35) {
    const label = P(a.x, a.y, 34);
    ctx.font = `700 ${Math.max(9, 11 * Math.min(zoom, 1.2))}px ui-monospace, monospace`;
    ctx.fillStyle = isTarget ? '#ffd166' : 'rgba(233, 245, 255, 0.82)';
    ctx.textAlign = 'center';
    ctx.fillText(a.code, label.x, label.y);
  }
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
    ctx.lineTo(size * span, size * 0.8); ctx.lineTo(size * 0.45, size * 0.5);
    ctx.lineTo(size * 0.34, size); ctx.lineTo(-size * 0.34, size);
    ctx.lineTo(-size * 0.45, size * 0.5); ctx.lineTo(-size * span, size * 0.8);
    ctx.lineTo(-size * 0.18, -size * 0.4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e7f5ff';
    ctx.fillRect(-size * 0.1, -size * 0.75, size * 0.2, size * 0.55);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.5 + 0.35 * Math.sin(time * 9);
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
  } else if (kind === 'heli') {
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.42, size * 0.62, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 0.1, size * 0.3, size * 0.2, size * 0.95);
    ctx.save(); ctx.rotate(time * 7);
    ctx.fillRect(-size * 1.5, -size * 0.75, size * 3, size * 0.12);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.25); ctx.lineTo(size * 0.24, size * 0.1);
    ctx.lineTo(size * 0.2, size * 0.85); ctx.lineTo(-size * 0.2, size * 0.85);
    ctx.lineTo(-size * 0.24, size * 0.1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 1.05, -size * 0.18, size * 2.1, size * 0.3);
    ctx.fillRect(-size * 0.6, size * 0.65, size * 1.2, size * 0.2);
  }
}

function drawPlane(ctx, game, P, zoom, time) {
  const s = game.state;
  if (!s) return;
  const shadow = P(s.x, s.y, 0);
  const p = P(s.x, s.y, s.alt);
  const size = Math.max(8, Math.min(24, 13 * zoom * (game.plane.starship ? 1.15 : 1)));
  const lift = Math.min(0.5, s.alt / 1200);
  ctx.save();
  ctx.globalAlpha = 0.3 - lift * 0.15;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(shadow.x, shadow.y, size * (0.9 + lift), size * (0.45 + lift * 0.3), 0, 0, Math.PI * 2);
  ctx.fill();
  if (s.alt > 30) {
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(shadow.x, shadow.y); ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(screenAngle(s.heading));
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

function drawJoystick(ctx, joy, active, h) {
  if (!active) return;
  const bx = 78, by = h - 96, r = 44;
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(bx + joy.x * 28, by + joy.y * 28, 17, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,209,102,0.55)'; ctx.fill(); ctx.stroke();
  ctx.restore();
}

export function drawScene(ctx, view) {
  const { w, h, game, time, joy, joyActive } = view;
  const cam = game.cam;
  const P = (x, y, z = 0) => isoProject(x, y, z, cam, w, h);
  ctx.clearRect(0, 0, w, h);
  drawSea(ctx, w, h);
  drawGrid(ctx, P);
  drawClouds(ctx, P, cam.zoom);
  drawLand(ctx, P, cam.zoom);
  drawTerrain(ctx, P, cam.zoom);
  drawRoute(ctx, game, P);
  const target = game.targetAirport();
  const items = AIRPORTS_W.map(a => ({
    depth: a.x + a.y,
    draw: () => drawRunway(ctx, a, P, cam.zoom, !!target && a.code === target.code, time)
  }));
  if (game.state) items.push({
    depth: game.state.x + game.state.y + 0.5,
    draw: () => drawPlane(ctx, game, P, cam.zoom, time)
  });
  items.sort((a, b) => a.depth - b.depth).forEach(item => item.draw());
  drawJoystick(ctx, joy, joyActive, h);
}

export function drawMinimap(ctx, w, h, game) {
  ctx.clearRect(0, 0, w, h);
  const cam = {
    x: WORLD.w / 2, y: WORLD.h / 2,
    zoom: Math.min((w - 8) / (LAND_SPAN.u + 40), (h - 8) / (LAND_SPAN.v + 60)) * 0.9
  };
  const P = (x, y, z = 0) => isoProject(x, y, z, cam, w, h);
  ctx.fillStyle = 'rgba(8, 15, 38, 0.92)';
  ctx.fillRect(0, 0, w, h);
  for (const poly of LAND) {
    tracePoly(ctx, poly, P);
    ctx.fillStyle = '#3d7a5c'; ctx.fill();
    ctx.strokeStyle = '#a9e3b8'; ctx.lineWidth = 0.7; ctx.stroke();
  }
  const target = game.targetAirport();
  if (game.mission && game.mission.stops.length > 1) {
    ctx.strokeStyle = 'rgba(255,209,102,0.8)'; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    game.mission.stops.forEach((code, i) => {
      const a = AIRPORTS_W.find(x => x.code === code);
      if (!a) return;
      const s = P(a.x, a.y);
      if (i === 0) ctx.moveTo(s.x, s.y); else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke(); ctx.setLineDash([]);
  }
  for (const a of AIRPORTS_W) {
    const s = P(a.x, a.y);
    ctx.fillStyle = target && a.code === target.code ? '#ffd166' : 'rgba(230,245,255,0.75)';
    ctx.fillRect(s.x - 1, s.y - 1, 2, 2);
  }
  if (game.state) {
    const s = P(game.state.x, game.state.y, game.state.alt);
    ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(screenAngle(game.state.heading));
    ctx.fillStyle = game.plane.color;
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(2.6, 3); ctx.lineTo(-2.6, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
