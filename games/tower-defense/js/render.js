/* Rendering Canvas: tutto in coordinate logiche 960x600 */

import { VIEW_W, VIEW_H, PATH, PATH_WIDTH, TOWERS } from './config.js';
import { state } from './state.js';
import { canPlace } from './entities.js';

let dpr = 1;

export function resizeCanvas(canvas) {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(VIEW_W * dpr);
  canvas.height = Math.round(VIEW_H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function rr(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, radius);
  else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

function drawBackground(ctx, time) {
  const g = ctx.createLinearGradient(0, 0, VIEW_W, VIEW_H);
  g.addColorStop(0, '#0a1220');
  g.addColorStop(0.55, '#0d1728');
  g.addColorStop(1, '#0a101c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.strokeStyle = 'rgba(125, 211, 252, 0.045)';
  ctx.lineWidth = 1;
  const step = 40;
  ctx.beginPath();
  for (let x = 0; x <= VIEW_W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, VIEW_H); }
  for (let y = 0; y <= VIEW_H; y += step) { ctx.moveTo(0, y); ctx.lineTo(VIEW_W, y); }
  ctx.stroke();

  /* Bagliori ambientali */
  const glow = ctx.createRadialGradient(VIEW_W * 0.5, VIEW_H * 0.45, 20, VIEW_W * 0.5, VIEW_H * 0.45, VIEW_W * 0.55);
  glow.addColorStop(0, 'rgba(56,189,248,0.055)');
  glow.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  /* Linea di scansione */
  const scanY = (time * 0.035) % (VIEW_H + 120) - 60;
  const scan = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
  scan.addColorStop(0, 'rgba(125,211,252,0)');
  scan.addColorStop(0.5, 'rgba(125,211,252,0.035)');
  scan.addColorStop(1, 'rgba(125,211,252,0)');
  ctx.fillStyle = scan;
  ctx.fillRect(0, scanY - 30, VIEW_W, 60);
}

function tracePath(ctx) {
  ctx.beginPath();
  ctx.moveTo(PATH[0].x, PATH[0].y);
  for (let i = 1; i < PATH.length; i++) ctx.lineTo(PATH[i].x, PATH[i].y);
}

function drawPath(ctx, time) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  tracePath(ctx);
  ctx.strokeStyle = 'rgba(56,189,248,0.10)';
  ctx.lineWidth = PATH_WIDTH + 18;
  ctx.stroke();

  tracePath(ctx);
  ctx.strokeStyle = '#1d2b40';
  ctx.lineWidth = PATH_WIDTH;
  ctx.stroke();

  tracePath(ctx);
  ctx.strokeStyle = 'rgba(148,163,184,0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  tracePath(ctx);
  ctx.strokeStyle = 'rgba(125,211,252,0.30)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([14, 26]);
  ctx.lineDashOffset = -(time * 0.045) % 40;
  ctx.stroke();
  ctx.setLineDash([]);

  /* Indicatori di ingresso / uscita */
  const start = PATH[0];
  const end = PATH[PATH.length - 1];
  ctx.fillStyle = 'rgba(248,113,113,0.9)';
  ctx.beginPath();
  ctx.arc(Math.max(14, start.x + 8), start.y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(74,222,128,0.9)';
  ctx.beginPath();
  ctx.arc(Math.min(VIEW_W - 14, end.x - 8), end.y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTower(ctx, tower, time) {
  const def = TOWERS[tower.type];
  const size = 17 + tower.level * 0.5;

  ctx.save();
  ctx.translate(tower.x, tower.y);

  /* Base */
  ctx.shadowColor = tower.color;
  ctx.shadowBlur = tower.flash > 0 ? 22 : 10;
  rr(ctx, -size, -size, size * 2, size * 2, 6);
  ctx.fillStyle = '#111c2e';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 2;
  ctx.strokeStyle = tower.color;
  ctx.stroke();

  /* Canne / indicatore direzione */
  ctx.rotate(tower.angle);
  ctx.fillStyle = tower.color;
  if (tower.kind === 'beam' || tower.kind === 'chain') {
    rr(ctx, 2, -3.5, size + 6, 7, 3);
  } else {
    rr(ctx, 2, -4, size + 9, 8, 2.5);
  }
  ctx.fill();
  ctx.rotate(-tower.angle);

  /* Glifo */
  ctx.fillStyle = tower.accent;
  ctx.font = 'bold 15px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.glyph, 0, 1);

  /* Livello */
  const pips = Math.min(tower.level, 8);
  for (let i = 0; i < pips; i++) {
    ctx.fillStyle = i < pips ? '#fde68a' : '#475569';
    ctx.fillRect(-size + 3 + i * 3.6, size - 5, 2.4, 2.4);
  }
  ctx.restore();
}

function drawEnemyShape(ctx, e) {
  const r = e.radius;
  ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
  ctx.shadowColor = e.color;
  ctx.shadowBlur = e.boss ? 22 : 10;
  ctx.beginPath();
  switch (e.shape) {
    case 'triangle': {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle);
      ctx.moveTo(r * 1.2, 0);
      ctx.lineTo(-r, r * 0.85);
      ctx.lineTo(-r, -r * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'square':
      ctx.rect(e.x - r, e.y - r, r * 2, r * 2);
      ctx.fill();
      break;
    case 'diamond':
      ctx.moveTo(e.x, e.y - r);
      ctx.lineTo(e.x + r, e.y);
      ctx.lineTo(e.x, e.y + r);
      ctx.lineTo(e.x - r, e.y);
      ctx.closePath();
      ctx.fill();
      break;
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        const px = e.x + Math.cos(a) * r;
        const py = e.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'cross': {
      const w = r * 0.62;
      ctx.rect(e.x - w, e.y - r, w * 2, r * 2);
      ctx.rect(e.x - r, e.y - w, r * 2, w * 2);
      ctx.fill();
      break;
    }
    default:
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function drawEnemy(ctx, e, time) {
  ctx.save();
  if (e.slowUntil > state.elapsed) {
    ctx.fillStyle = 'rgba(125,211,252,0.14)';
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.healPulse > 0) {
    ctx.strokeStyle = 'rgba(52,211,153,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawEnemyShape(ctx, e);

  if (e.shield > 0) {
    ctx.strokeStyle = 'rgba(147,197,253,0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (e.boss) {
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♛', e.x, e.y - e.radius - 16);
  }

  /* Barra HP */
  const w = Math.max(22, e.radius * 2.1);
  const x = e.x - w / 2;
  const y = e.y - e.radius - (e.boss ? 11 : 8);
  ctx.fillStyle = 'rgba(2,6,23,0.85)';
  rr(ctx, x - 1, y - 1, w + 2, 6, 2);
  ctx.fill();
  const pct = Math.max(0, Math.min(1, e.hp / e.maxHp));
  ctx.fillStyle = pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171';
  rr(ctx, x, y, w * pct, 4, 2);
  ctx.fill();

  if (e.maxShield > 0 && e.shield > 0) {
    ctx.fillStyle = '#60a5fa';
    rr(ctx, x, y + 7, w * (e.shield / e.maxShield), 2.5, 1.5);
    ctx.fill();
  }
  ctx.restore();
}

export function draw(ctx, time) {
  const s = state;
  ctx.save();
  if (s.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  }

  drawBackground(ctx, time);
  drawPath(ctx, time);

  /* Portata torre selezionata */
  if (s.selectedTower) {
    ctx.fillStyle = 'rgba(56,189,248,0.06)';
    ctx.strokeStyle = 'rgba(125,211,252,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.selectedTower.x, s.selectedTower.y, s.selectedTower.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    rr(ctx, s.selectedTower.x - 24, s.selectedTower.y - 24, 48, 48, 8);
    ctx.stroke();
  }

  for (const tower of s.towers) drawTower(ctx, tower, time);
  for (const e of s.enemies) drawEnemy(ctx, e, time);

  /* Proiettili */
  for (const p of s.projectiles) {
    for (let i = 0; i < p.trail.length; i++) {
      const pt = p.trail[i];
      ctx.globalAlpha = (i + 1) / (p.trail.length + 1) * 0.35;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.kind === 'splash' ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* Raggi */
  for (const b of s.beams) {
    const alpha = b.life / b.maxLife;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = b.width || 3;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  /* Particelle */
  for (const p of s.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  /* Numeri fluttuanti */
  for (const f of s.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life / f.maxLife));
    ctx.font = '800 ' + f.size + 'px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(2,6,23,0.85)';
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  /* Anteprima posizionamento */
  if (s.selectedTowerType && s.hoverInside) {
    const def = TOWERS[s.selectedTowerType];
    const ok = canPlace(s.hoverX, s.hoverY) &&
      (s.modeConfig.unlimitedMoney || s.money >= def.cost);
    const color = ok ? '#4ade80' : '#f87171';
    ctx.fillStyle = ok ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.arc(s.hoverX, s.hoverY, def.range, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = def.color;
    rr(ctx, s.hoverX - 16, s.hoverY - 16, 32, 32, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0b1220';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.glyph, s.hoverX, s.hoverY + 1);
  }

  /* Vignetta */
  const v = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  ctx.restore();
}
