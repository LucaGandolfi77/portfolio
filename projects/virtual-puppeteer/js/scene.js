/**
 * scene.js — sfondi teatrali a strati con luce, ombre e parallasse.
 */

export function drawStage(ctx, scene, width, height, time = 0, parallax = { x: 0, y: 0 }) {
  if (!ctx) return;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, scene.sky[0]);
  sky.addColorStop(1, scene.sky[1]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // bokeh / stelle con parallasse
  ctx.save();
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 36; i += 1) {
    const x = ((i * 137 + parallax.x * 0.25) % (width + 40)) - 20;
    const y = (i * 61 + parallax.y * 0.12) % (height * 0.62);
    const radius = 1 + (i % 4);
    ctx.fillStyle = i % 3 === 0 ? scene.accent : 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // sipario con pieghe
  const curtainHeight = height * 0.24;
  for (const side of [0, 1]) {
    const gradient = ctx.createLinearGradient(side ? width : 0, 0, side ? width * 0.7 : width * 0.3, 0);
    gradient.addColorStop(0, scene.curtain);
    gradient.addColorStop(1, 'rgba(0,0,0,.25)');
    ctx.fillStyle = gradient;
    ctx.fillRect(side ? width * 0.86 : 0, 0, width * 0.14, curtainHeight);
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i += 1) {
      const x = (side ? width * 0.86 : 0) + (width * 0.14 / 4) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, curtainHeight); ctx.stroke();
    }
  }

  // palco prospettico
  const horizon = height * 0.62;
  ctx.fillStyle = scene.floor;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width, horizon);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.07)';
  ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(width / 2 + i * width * 0.08, horizon);
    ctx.lineTo(width / 2 + i * width * 0.26, height);
    ctx.stroke();
  }
  for (let i = 1; i < 5; i += 1) {
    const y = horizon + (height - horizon) * (i / 5) ** 1.6;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
  }

  // riflettori animati
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const side of [-1, 1]) {
    const x = width / 2 + side * width * 0.3 + Math.sin(time / 1600 + side) * width * 0.05;
    const beam = ctx.createRadialGradient(x, -height * 0.1, 10, x, height * 0.8, height * 0.9);
    beam.addColorStop(0, 'rgba(255,255,255,.18)');
    beam.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - width * 0.22, height);
    ctx.lineTo(x + width * 0.22, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawSpotlightFloor(ctx, puppet, width, height, color = 'rgba(0,0,0,.35)') {
  if (!ctx || !puppet) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(puppet.x, Math.min(height - 20, puppet.y + puppet.scale * 1.35), puppet.scale * 1.1, puppet.scale * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
