/**
 * track.js — vista 2D della corsa: prato texture, pista, folla, cavalli, effetti.
 */

const TAU = Math.PI * 2;

export function createTrack(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  const dust = new Map();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = Math.max(100, rect.width);
    h = Math.max(100, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function trackGeometry() {
    const cx = w / 2, cy = h / 2;
    const rX = Math.min(w * 0.43, h * 0.56);
    const rY = rX * (h / w) * 0.72;
    return { cx, cy, rX, rY };
  }

  function pointOn(angle, g, laneT) {
    const rx = g.rX * 0.55 + (g.rX - g.rX * 0.55) * laneT;
    const ry = g.rY * 0.42 + (g.rY - g.rY * 0.42) * laneT;
    return { x: g.cx + Math.cos(angle) * rx, y: g.cy + Math.sin(angle) * ry, rx, ry };
  }

  function drawSnapshots(now) {
    for (const [id, p] of dust) {
      p.x += p.vx; p.y += p.vy; p.life -= 1;
      p.vx *= 0.97; p.vy *= 0.97;
      if (p.life <= 0) dust.delete(id);
      ctx.globalAlpha = Math.max(0, p.life / p.max) * 0.4;
      ctx.fillStyle = '#d8c8a6';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHorse(horse, x, y, angle, isBet, isLeader, selected) {
    const s = Math.min(w, h) / 34;
    const scale = 0.85 + horse.progress * 0.1;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(scale, scale);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(0, s * 0.2, s * 1.5, s * 0.5, 0, 0, TAU); ctx.fill();

    if (isBet || selected) {
      ctx.strokeStyle = selected ? '#fff3c4' : 'rgba(212,175,55,.95)';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, 0, s * 1.9, s * 1.1, 0, 0, TAU); ctx.stroke();
    }

    // tail
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = s * 0.25; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s * 1.25, 0);
    ctx.quadraticCurveTo(-s * 1.95, -s * 0.5, -s * 1.7, Math.sin(horse.stride) * s * 0.35);
    ctx.stroke();

    // legs
    ctx.strokeStyle = '#4a3527'; ctx.lineWidth = s * 0.2;
    const legs = [[-0.85, -1.1], [-0.1, -1], [0.55, -1.1], [1.05, -0.65]];
    legs.forEach((leg, i) => {
      const swing = Math.sin(horse.stride + i * 1.7) * s * 0.55;
      ctx.beginPath();
      ctx.moveTo(leg[0] * s, leg[1] * s * 0.2);
      ctx.lineTo(leg[0] * s + swing * 0.45, leg[1] * s * 0.2 + s * 0.95);
      ctx.stroke();
    });

    // body with sheen
    const body = ctx.createLinearGradient(-s, -s, s, s);
    body.addColorStop(0, horse.color);
    body.addColorStop(1, '#2a1f1c');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0, 0, s * 1.35, s * 0.62, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();

    // neck + head
    ctx.beginPath(); ctx.ellipse(s * 1.05, -s * 0.4, s * 0.35, s * 0.65, -0.35, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(s * 1.3, -s * 0.75, s * 0.5, s * 0.34, 0.2, 0, TAU); ctx.fill();

    // saddle cloth + jockey silks
    ctx.fillStyle = '#f3ecd9';
    ctx.fillRect(-s * 0.5, -s * 0.55, s * 0.6, s * 0.55);
    ctx.fillStyle = horse.color;
    ctx.beginPath(); ctx.arc(s * 0.12, -s * 0.95, s * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-s * 0.15, -s * 1.15, s * 0.5, s * 0.18);
    ctx.restore();

    // label
    ctx.font = (isBet ? '700 10px' : '600 9px') + ' Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isBet ? '#ffe9a8' : 'rgba(255,250,235,.9)';
    ctx.fillText(horse.name.length > 13 ? horse.name.slice(0, 12) + '…' : horse.name, x, y - s * 2.5);
    if (isLeader) {
      ctx.fillStyle = '#d4af37'; ctx.font = '700 10px Georgia, serif';
      ctx.fillText('★ LEADER', x, y - s * 3.6);
    }
  }

  function draw(state, now = 0) {
    if (!w || !h) return;
    const { race, bets, timer, selectedId, weatherId } = state;
    ctx.clearRect(0, 0, w, h);
    const g = trackGeometry();

    // prato con grana
    const grass = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, Math.max(g.rX, g.rY) * 1.6);
    grass.addColorStop(0, '#3b6b3f');
    grass.addColorStop(1, '#1c3a24');
    ctx.fillStyle = grass;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    for (let i = 0; i < 90; i += 1) {
      const x = ((i * 97) % 1000) / 1000 * w;
      const y = ((i * 61) % 1000) / 1000 * h;
      ctx.fillRect(x, y, 2, 1);
    }

    // pista
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, g.rX, g.rY, 0, 0, TAU);
    ctx.ellipse(g.cx, g.cy, g.rX * 0.55, g.rY * 0.42, 0, 0, TAU);
    ctx.fillStyle = '#9a7355';
    ctx.fill('evenodd');
    const lanes = 8;
    for (let i = 0; i <= lanes; i += 1) {
      const t = i / lanes;
      const rx = g.rX * 0.55 + (g.rX - g.rX * 0.55) * t;
      const ry = g.rY * 0.42 + (g.rY - g.rY * 0.42) * t;
      ctx.beginPath(); ctx.ellipse(g.cx, g.cy, rx, ry, 0, 0, TAU);
      ctx.strokeStyle = 'rgba(255,246,224,.2)'; ctx.lineWidth = i === lanes ? 2 : 1; ctx.stroke();
    }

    // ringhiera esterna e tribune
    ctx.strokeStyle = 'rgba(246,238,216,.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(g.cx, g.cy, g.rX * 1.04, g.rY * 1.07, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(12,27,48,.55)';
    for (let i = 0; i < 26; i += 1) {
      const a = (i / 26) * TAU;
      const x = g.cx + Math.cos(a) * g.rX * 1.17;
      const y = g.cy + Math.sin(a) * g.rY * 1.25;
      ctx.fillRect(x - 5, y - 5, 10, 10);
    }

    // linea del traguardo a scacchi
    const finish = pointOn(0, g, 0.5);
    ctx.save();
    ctx.translate(finish.x, finish.y);
    ctx.rotate(Math.PI / 2);
    const size = Math.max(4, g.rY * 0.09);
    for (let row = 0; row < 2; row += 1) {
      for (let col = 0; col < 4; col += 1) {
        ctx.fillStyle = (row + col) % 2 ? '#1a1a1a' : '#fffaf0';
        ctx.fillRect(-size * 2 + col * size, -size + row * size, size, size);
      }
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,250,235,.85)';
    ctx.font = '700 9px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE WINNING POST', finish.x + 26, finish.y - 8);

    // marcatori di distanza
    for (let i = 1; i < 5; i += 1) {
      const a = (i / 5) * TAU;
      const p = pointOn(a, g, 0.5);
      ctx.fillStyle = 'rgba(255,250,235,.5)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, TAU); ctx.fill();
    }

    // cavalli
    if (race && race.horses.length) {
      const ordered = [...race.horses].sort((a, b) => b.progress - a.progress);
      const leader = ordered[0];
      ordered.forEach((horse) => {
        const laneT = (horse.lane + 0.5) / race.horses.length;
        const angle = ((horse.distance % race.distance) / race.distance) * TAU;
        const p = pointOn(angle, g, laneT);
        drawHorse(horse, p.x, p.y, angle, !!(bets && bets[horse.id]), horse === leader && race.timer > 0, selectedId === horse.id);
        if (race.timer > 0 && Math.random() < 0.12) {
          const key = horse.id + Math.floor(now / 120);
          if (!dust.has(key)) dust.set(key, {
            x: p.x, y: p.y, vx: -Math.cos(angle) * 0.5, vy: -Math.sin(angle) * 0.4,
            life: 20 + Math.random() * 12, max: 32, size: 1.5 + Math.random() * 2
          });
        }
      });
    }
    drawSnapshots(now);

    // clima
    if (weatherId === 'rain') {
      ctx.strokeStyle = 'rgba(190,215,235,.22)'; ctx.lineWidth = 1;
      for (let i = 0; i < 40; i += 1) {
        const x = (i * 137 + now * 0.4) % w;
        const y = (i * 89 + now * 0.8) % h;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 12); ctx.stroke();
      }
    }

    // orologio
    if (race && race.timer > 0) {
      ctx.fillStyle = 'rgba(12,27,48,.72)';
      ctx.fillRect(10, 10, 86, 26);
      ctx.fillStyle = '#f6efdd';
      ctx.font = '700 13px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⏱ ' + race.timer.toFixed(2) + 's', 18, 28);
    }
  }

  resize();
  return { resize, draw };
}
