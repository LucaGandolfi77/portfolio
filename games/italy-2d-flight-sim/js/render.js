/* Italy 2D Flight Sim — side-view Canvas 2D renderer */

import { WORLD } from './config.js';
import { AIRPORTS_W, CLOUDS, worldToScreen } from './map.js';

function fillPoly(ctx, pts, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
  ctx.closePath();
  ctx.fill();
}

function drawSky(ctx, w, h, groundY) {
  const g = ctx.createLinearGradient(0, 0, 0, Math.max(1, groundY));
  g.addColorStop(0, '#0b1f3d');
  g.addColorStop(0.55, '#20466f');
  g.addColorStop(1, '#e0a06a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255, 225, 170, 0.75)';
  ctx.beginPath(); ctx.arc(w * 0.78, groundY * 0.3, 26, 0, Math.PI * 2); ctx.fill();
}

function drawParallax(ctx, w, groundY, camX) {
  const layers = [
    { dx: 0.12, amp: 42, step: 130, color: 'rgba(60, 96, 128, 0.55)', base: 46 },
    { dx: 0.3, amp: 30, step: 92, color: 'rgba(46, 86, 92, 0.75)', base: 22 },
    { dx: 0.55, amp: 18, step: 64, color: 'rgba(34, 72, 60, 0.9)', base: 8 }
  ];
  for (const layer of layers) {
    const pts = [{ x: 0, y: groundY }];
    for (let x = 0; x <= w + layer.step; x += layer.step) {
      const t = (x + camX * layer.dx) / layer.step;
      const y = groundY - layer.base - Math.abs(Math.sin(t) * layer.amp) - Math.abs(Math.sin(t * 0.37) * layer.amp * 0.5);
      pts.push({ x, y });
    }
    pts.push({ x: w, y: groundY });
    fillPoly(ctx, pts, layer.color);
  }
}

function drawClouds(ctx, w, h, cam) {
  ctx.fillStyle = '#ffffff';
  for (const c of CLOUDS) {
    const factor = [0.2, 0.45, 0.75][c.layer];
    const sx = (c.x - cam.x * factor) * cam.zoom + w / 2;
    const sy = worldToScreen(0, c.alt, cam, w, h).y;
    const r = c.r * cam.zoom;
    if (sx < -100 || sx > w + 100 || sy < -60 || sy > h + 60) continue;
    ctx.globalAlpha = c.a;
    ctx.beginPath(); ctx.ellipse(sx, sy, r, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx - r * 0.6, sy + r * 0.1, r * 0.6, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(sx + r * 0.6, sy + r * 0.1, r * 0.6, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGround(ctx, w, h, groundY) {
  const g = ctx.createLinearGradient(0, groundY, 0, h);
  g.addColorStop(0, '#4c8a58');
  g.addColorStop(1, '#244c39');
  ctx.fillStyle = g;
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(0, groundY, w, 2);
}

function drawAirports(ctx, game, w, h, cam, groundY, time) {
  const target = game.targetAirport();
  ctx.textAlign = 'center';
  for (const a of AIRPORTS_W) {
    const s = worldToScreen(a.x, WORLD.ground, cam, w, h);
    if (s.x < -80 || s.x > w + 80) continue;
    const isTarget = !!target && a.code === target.code;
    const stripW = 26 * cam.zoom;
    ctx.fillStyle = isTarget ? '#ffd166' : 'rgba(228, 238, 245, 0.85)';
    ctx.fillRect(s.x - stripW / 2, groundY - 3, stripW, 5);
    ctx.fillStyle = 'rgba(30, 55, 45, 0.85)';
    const bw = 7 * cam.zoom;
    ctx.fillRect(s.x - bw * 1.6, groundY - 16 * cam.zoom, bw, 13 * cam.zoom);
    ctx.fillRect(s.x + bw * 0.6, groundY - 11 * cam.zoom, bw, 8 * cam.zoom);
    if (isTarget) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 4);
      ctx.strokeStyle = `rgba(255, 209, 102, ${0.4 + pulse * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(s.x, groundY - 6, (22 + pulse * 6) * cam.zoom, 8 * cam.zoom, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (cam.zoom > 0.35) {
      ctx.font = `700 ${Math.max(9, 11 * Math.min(cam.zoom, 1.2))}px ui-monospace, monospace`;
      ctx.fillStyle = isTarget ? '#ffd166' : 'rgba(240, 248, 255, 0.85)';
      ctx.fillText(a.code, s.x, groundY - 22 * cam.zoom);
    }
  }
}

function planeShape(ctx, kind, color, size, time, vz) {
  ctx.rotate(-vz * 0.28);
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(8, 20, 34, 0.85)';
  ctx.lineWidth = 1.4;
  if (kind === 'starfighter' || kind === 'cruiser') {
    const wide = kind === 'cruiser';
    ctx.beginPath();
    ctx.moveTo(size * 1.6, 0);
    ctx.lineTo(size * 0.2, -size * 0.32);
    ctx.lineTo(-size * 0.65, -size * 0.95);
    ctx.lineTo(-size * 0.3, -size * 0.1);
    ctx.lineTo(-size * 1.05, -size * 0.18);
    ctx.lineTo(-size * 1.05, size * 0.18);
    ctx.lineTo(-size * 0.3, size * 0.1);
    ctx.lineTo(-size * 0.65, size * 0.95);
    ctx.lineTo(size * 0.2, size * 0.32);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e7f5ff';
    ctx.beginPath(); ctx.ellipse(size * 0.35, 0, size * 0.3, size * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.45 + 0.35 * Math.sin(time * 9);
    ctx.fillRect(-size * 1.15, -size * 0.12, size * 0.2, size * 0.24);
    ctx.globalAlpha = 1;
  } else if (kind === 'jet') {
    ctx.beginPath();
    ctx.moveTo(size * 1.5, 0);
    ctx.lineTo(size * 0.2, -size * 0.28);
    ctx.lineTo(-size * 0.7, -size * 0.85);
    ctx.lineTo(-size * 0.4, -size * 0.1);
    ctx.lineTo(-size * 1.05, -size * 0.05);
    ctx.lineTo(-size * 0.8, 0);
    ctx.lineTo(-size * 1.05, size * 0.05);
    ctx.lineTo(-size * 0.4, size * 0.1);
    ctx.lineTo(-size * 0.7, size * 0.85);
    ctx.lineTo(size * 0.2, size * 0.28);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (kind === 'airliner') {
    ctx.beginPath(); ctx.ellipse(0, 0, size * 1.35, size * 0.32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.2, -size * 0.15); ctx.lineTo(-size * 0.4, -size * 1.05);
    ctx.lineTo(-size * 0.75, -size * 1.05); ctx.lineTo(-size * 0.3, -size * 0.1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.2, size * 0.15); ctx.lineTo(-size * 0.4, size * 1.05);
    ctx.lineTo(-size * 0.75, size * 1.05); ctx.lineTo(-size * 0.3, size * 0.1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (kind === 'heli') {
    ctx.beginPath(); ctx.ellipse(0, size * 0.1, size * 0.8, size * 0.4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 1.4, size * 0.02, size * 2.8, size * 0.12);
    ctx.save(); ctx.rotate(time * 6);
    ctx.fillRect(-size * 0.1, -size * 1.25, size * 0.2, size * 2.5);
    ctx.restore();
    ctx.fillRect(-size * 1.3, -size * 0.05, size * 0.35, size * 0.16);
  } else {
    ctx.beginPath(); ctx.ellipse(0, 0, size * 1.05, size * 0.34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(-size * 0.35, -size * 1.0, size * 1.6, size * 0.14);
    ctx.fillRect(-size * 0.35, size * 0.86, size * 1.6, size * 0.14);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.moveTo(-size * 1.35, -size * 0.75); ctx.lineTo(-size * 1.35, size * 0.75); ctx.stroke();
  }
}

function drawPlane(ctx, game, w, h, cam, groundY, time) {
  const s = game.state;
  if (!s) return;
  const p = worldToScreen(s.x, s.alt, cam, w, h);
  const size = Math.max(8, Math.min(25, 15 * cam.zoom * (game.plane.starship ? 1.12 : 1)));
  const lift = Math.min(0.5, s.alt / 1200);
  ctx.save();
  ctx.globalAlpha = 0.3 - lift * 0.14;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(p.x, groundY, size * (1 + lift), size * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  if (s.alt > 30) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, groundY); ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(p.x, p.y);
  if (Math.cos(s.heading) < 0) ctx.scale(-1, 1);
  const fast = Math.max(0, Math.min(1, (s.speed - 100) / 300));
  if (fast > 0 || s.boosting) {
    ctx.globalAlpha = Math.min(0.55, fast * 0.35 + (s.boosting ? 0.25 : 0));
    ctx.fillStyle = game.plane.starship ? '#66d9e8' : '#ffd166';
    for (const off of [-0.4, 0, 0.4]) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.9, off * size * 0.5);
      ctx.lineTo(-size * (1.6 + fast * 1.4), off * size * 0.35);
      ctx.lineTo(-size * 0.9, off * size * 0.5 + size * 0.16);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  planeShape(ctx, game.plane.kind, game.plane.color, size, time, s.vz || 0);
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
  ctx.clearRect(0, 0, w, h);
  const groundY = worldToScreen(0, WORLD.ground, cam, w, h).y;
  drawSky(ctx, w, h, groundY);
  drawParallax(ctx, w, groundY, cam.x);
  drawClouds(ctx, w, h, cam);
  drawGround(ctx, w, h, groundY);
  drawAirports(ctx, game, w, h, cam, groundY, time);
  drawPlane(ctx, game, w, h, cam, groundY, time);
  drawJoystick(ctx, joy, joyActive, h);
}

export function drawMinimap(ctx, w, h, game) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(7, 28, 51, 0.92)';
  ctx.fillRect(0, 0, w, h);
  const pad = 8, y = h * 0.62;
  const sx = x => pad + (x / WORLD.w) * (w - pad * 2);
  ctx.fillStyle = '#4a8a67';
  ctx.fillRect(pad, y + 8, w - pad * 2, h - y - 12);
  const target = game.targetAirport();
  for (const a of AIRPORTS_W) {
    ctx.fillStyle = target && a.code === target.code ? '#ffd166' : 'rgba(230,245,255,0.8)';
    ctx.fillRect(sx(a.x) - 1.5, y - 4, 3, 12);
  }
  if (game.state) {
    const px = sx(game.state.x);
    const py = y - Math.min(1, game.state.alt / 1600) * (y - 10);
    ctx.fillStyle = game.plane.color;
    ctx.beginPath(); ctx.moveTo(px + 4, py); ctx.lineTo(px - 4, py - 3); ctx.lineTo(px - 4, py + 3); ctx.closePath(); ctx.fill();
  }
}
