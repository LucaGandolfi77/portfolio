/* Italy 3D Flight Sim — attitude indicator with approach guidance (2D canvas) */

const DEG = 180 / Math.PI;
/* Pixels per degree of pitch on the 232 px instrument. */
const PITCH_SCALE = 3.2;

export function drawAttitude(ctx, { pitch, roll, guidance }) {
  const size = ctx.canvas.width, c = size / 2, radius = c - 4;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, radius, 0, Math.PI * 2);
  ctx.clip();

  /* Sky, ground and pitch ladder turn against the aircraft's bank. */
  ctx.translate(c, c);
  ctx.rotate(-roll);
  const horizon = pitch * DEG * PITCH_SCALE;
  ctx.fillStyle = '#3d8fd1';
  ctx.fillRect(-size, -size * 4 + horizon, size * 2, size * 4);
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(-size, horizon, size * 2, size * 4);
  ctx.strokeStyle = ctx.fillStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-size, horizon); ctx.lineTo(size, horizon); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.font = '700 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let d = -60; d <= 60; d += 10) {
    if (!d) continue;
    const y = horizon - d * PITCH_SCALE;
    ctx.beginPath(); ctx.moveTo(-28, y); ctx.lineTo(28, y); ctx.stroke();
    ctx.fillText(String(Math.abs(d)), 46, y);
  }
  ctx.restore();

  /* Bank scale and pointer. */
  ctx.save();
  ctx.translate(c, c);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (const mark of [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]) {
    const a = mark / DEG - Math.PI / 2;
    const inner = radius - (mark % 30 ? 7 : 12);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    ctx.stroke();
  }
  ctx.rotate(-roll);
  ctx.fillStyle = '#ffd86b';
  ctx.beginPath(); ctx.moveTo(0, -radius + 13); ctx.lineTo(-8, -radius + 28); ctx.lineTo(8, -radius + 28); ctx.fill();
  ctx.restore();

  /* Fixed aircraft symbol. */
  ctx.strokeStyle = '#ffd86b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(c - 58, c); ctx.lineTo(c - 22, c); ctx.lineTo(c - 22, c + 10);
  ctx.moveTo(c + 58, c); ctx.lineTo(c + 22, c); ctx.lineTo(c + 22, c + 10);
  ctx.moveTo(c - 3, c); ctx.lineTo(c + 3, c);
  ctx.stroke();

  if (!guidance) return;
  /* Needles point to where the runway centreline and glide path are. */
  const x = c - guidance.lateral * 60;
  const y = c + guidance.vertical * 60;
  ctx.strokeStyle = '#ff4fd8';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, c - 62); ctx.lineTo(x, c + 62); ctx.moveTo(c - 62, y); ctx.lineTo(c + 62, y); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  ctx.fillRect(c - 52, size - 40, 104, 24);
  ctx.fillStyle = '#ff9ce9';
  ctx.font = '700 17px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`ILS ${guidance.code}`, c, size - 28);
}
