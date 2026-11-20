/* RPG Adventure — canvas battle renderer */

import { ZONES } from './config.js';

const SKY = [
  ['#071a2e', '#123d4f', '#2e6b58'],
  ['#1a0a1e', '#48203a', '#7a3b3b'],
  ['#050914', '#1a1440', '#4a1d5c']
];

export function drawBattle(view, engine, fx, t) {
  const { ctx, w, h } = view;
  const sky = SKY[engine.zone] || SKY[0];
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, sky[0]); g.addColorStop(0.6, sky[1]); g.addColorStop(1, sky[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

  // ground
  ctx.fillStyle = 'rgba(3,6,16,.7)';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.strokeStyle = 'rgba(120,200,255,.14)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, h * 0.78); ctx.lineTo(x - 20, h); ctx.stroke();
  }

  const baseY = h * 0.72;
  // hero
  const hx = w * 0.28;
  ctx.save();
  ctx.shadowColor = '#4de8ff'; ctx.shadowBlur = 22;
  ctx.fillStyle = '#dff7ff';
  ctx.beginPath(); ctx.arc(hx, baseY - 34, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0b1530';
  ctx.fillRect(hx - 16, baseY - 14, 32, 16);
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx + 18, baseY - 26);
  ctx.lineTo(hx + 42, baseY - 50 + Math.sin(t * 3) * 5);
  ctx.stroke();
  ctx.restore();

  // enemy
  if (engine.enemy) {
    const ex = w * 0.72;
    const e = engine.enemy;
    const bob = Math.sin(t * 2.4 + engine.encounter) * 6;
    ctx.save();
    ctx.shadowColor = e.color; ctx.shadowBlur = 26;
    ctx.fillStyle = e.color;
    const r = e.isBoss ? 38 : 26;
    ctx.beginPath();
    ctx.moveTo(ex, baseY - r * 2 + bob);
    ctx.lineTo(ex + r, baseY - r + bob);
    ctx.lineTo(ex + r * 0.6, baseY + bob);
    ctx.lineTo(ex - r * 0.6, baseY + bob);
    ctx.lineTo(ex - r, baseY - r + bob);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(8,12,28,.85)';
    ctx.beginPath(); ctx.arc(ex - r * 0.3, baseY - r + bob, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex + r * 0.3, baseY - r + bob, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // hp bar
    const bw = e.isBoss ? 180 : 130;
    ctx.fillStyle = 'rgba(4,8,20,.8)';
    ctx.fillRect(ex - bw / 2, 14, bw, 10);
    ctx.fillStyle = e.isBoss ? '#ff6b9d' : '#ff9f68';
    ctx.fillRect(ex - bw / 2 + 2, 16, (bw - 4) * Math.max(0, e.hp / e.maxHp), 6);
    ctx.fillStyle = '#fff';
    ctx.font = '800 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${e.name} ${Math.max(0, e.hp)}/${e.maxHp}`, ex, 8);
  }

  fx.update();
  fx.draw(ctx);
}

export function zoneColor(zone) {
  return (ZONES[zone] && SKY[zone]) ? SKY[zone][2] : '#0a1030';
}
