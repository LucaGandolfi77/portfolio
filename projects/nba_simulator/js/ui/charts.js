/* Canvas charts for the Explore tab: labelled, readable at small sizes. */

function fit(canvas) {
  if (!canvas) return null;
  const width = Math.max(240, Math.round(canvas.clientWidth || canvas.parentElement?.clientWidth || 320));
  const height = Math.max(150, Math.round(canvas.clientHeight || 170));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function label(ctx, text, x, y, align = 'center', color = '#93aac9', size = 10) {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px Inter, -apple-system, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function emptyChart(canvas, text) {
  const s = fit(canvas);
  if (!s) return;
  const { ctx, width, height } = s;
  ctx.strokeStyle = 'rgba(140,190,255,.16)';
  ctx.setLineDash([5, 6]);
  ctx.strokeRect(10, 10, width - 20, height - 20);
  ctx.setLineDash([]);
  label(ctx, text, width / 2, height / 2, 'center', '#93aac9', 11);
}

export function quarterChart(canvas, quarters, homeColor, awayColor) {
  if (!Array.isArray(quarters) || !quarters.length) return emptyChart(canvas, 'Play a game to see quarter scoring.');
  const s = fit(canvas);
  if (!s) return;
  const { ctx, width, height } = s;
  const pad = 34;
  const max = Math.max(1, ...quarters.flatMap(q => [q.home, q.away]));
  const group = (width - pad * 2) / quarters.length;
  const bar = Math.max(6, group * 0.25);
  quarters.forEach((q, i) => {
    const base = pad + group * i + group / 2;
    [['home', homeColor, -1], ['away', awayColor, 1]].forEach(([side, color, dir]) => {
      const value = q[side] || 0;
      const h = (value / max) * (height - pad - 20);
      const x = base + (dir < 0 ? -bar - 2 : 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x, height - pad - h, bar, h);
      ctx.globalAlpha = 1;
      label(ctx, String(value), x + bar / 2, height - pad - h - 8, 'center', '#dce9fb', 9);
    });
    label(ctx, i < 4 ? `Q${i + 1}` : `OT${i - 3}`, base, height - 14, 'center', '#93aac9', 10);
  });
  // legend
  ctx.fillStyle = homeColor; ctx.fillRect(10, 8, 10, 10);
  label(ctx, 'Home', 24, 13, 'left', '#93aac9', 9);
  ctx.fillStyle = awayColor; ctx.fillRect(78, 8, 10, 10);
  label(ctx, 'Away', 92, 13, 'left', '#93aac9', 9);
}

export function progressionChart(canvas, quarters, homeColor, awayColor) {
  if (!Array.isArray(quarters) || !quarters.length) return emptyChart(canvas, 'Play a game to see the score progression.');
  const s = fit(canvas);
  if (!s) return;
  const { ctx, width, height } = s;
  const padX = 30;
  const padY = 30;
  const totals = [];
  let h = 0;
  let a = 0;
  quarters.forEach(q => {
    h += q.home || 0;
    a += q.away || 0;
    totals.push({ home: h, away: a });
  });
  const max = Math.max(1, h, a);
  const xFor = i => padX + (i / Math.max(1, totals.length - 1)) * (width - padX * 2);
  const yFor = v => height - padY - (v / max) * (height - padY * 2);
  ctx.strokeStyle = 'rgba(140,190,255,.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 2; i++) {
    const y = padY + (i / 2) * (height - padY * 2);
    ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(width - padX, y); ctx.stroke();
  }
  [['home', homeColor], ['away', awayColor]].forEach(([side, color]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    totals.forEach((t, i) => {
      const x = xFor(i);
      const y = yFor(t[side]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    totals.forEach((t, i) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(xFor(i), yFor(t[side]), 3, 0, Math.PI * 2); ctx.fill();
    });
  });
  totals.forEach((t, i) => label(ctx, i < 4 ? `Q${i + 1}` : `OT${i - 3}`, xFor(i), height - 14, 'center', '#93aac9', 10));
  label(ctx, `Home ${h}`, 10, 12, 'left', homeColor, 9);
  label(ctx, `Away ${a}`, width - 10, 12, 'right', awayColor, 9);
}

export function shotChart(canvas, shots, homeColor, awayColor) {
  if (!Array.isArray(shots) || !shots.length) return emptyChart(canvas, 'Play a game to see the shot chart.');
  const s = fit(canvas);
  if (!s) return;
  const { ctx, width, height } = s;
  const pad = 18;
  const w = width - pad * 2;
  const h = height - pad * 2;
  // Half court: hoop near the top, paint below it.
  const hoopX = width / 2;
  const hoopY = pad + 18;
  ctx.strokeStyle = 'rgba(140,190,255,.24)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad, pad, w, h);
  ctx.beginPath();
  ctx.arc(hoopX, hoopY, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(hoopX - w * 0.12, hoopY, w * 0.24, h * 0.42);
  ctx.beginPath();
  ctx.arc(hoopX, hoopY, h * 0.38, 0.12 * Math.PI, 0.88 * Math.PI);
  ctx.stroke();
  shots.forEach(shot => {
    const x = pad + (Math.max(0, Math.min(500, shot.x)) / 500) * w;
    const y = hoopY + (Math.max(0, Math.min(500, shot.y)) / 500) * (h - 18);
    ctx.fillStyle = shot.side === 'away' ? awayColor : homeColor;
    ctx.globalAlpha = shot.made ? 0.95 : 0.35;
    ctx.beginPath();
    ctx.arc(x, y, shot.value === 3 ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
    if (shot.made) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,.65)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;
  label(ctx, 'Filled = made · faded = missed', width / 2, height - 7, 'center', '#93aac9', 9);
}

export function comparisonChart(canvas, rows, homeColor, awayColor) {
  if (!Array.isArray(rows) || !rows.length) return emptyChart(canvas, 'Play a game to compare team totals.');
  const s = fit(canvas);
  if (!s) return;
  const { ctx, width, height } = s;
  const pad = 18;
  const rowH = (height - pad * 2) / rows.length;
  rows.forEach((row, i) => {
    const y = pad + i * rowH + rowH / 2;
    const max = Math.max(1, row.home, row.away);
    const half = (width - 80) / 2;
    label(ctx, row.label, width / 2, y - rowH * 0.24, 'center', '#93aac9', 9);
    ctx.fillStyle = homeColor;
    ctx.fillRect(width / 2 - 6 - (row.home / max) * half, y, (row.home / max) * half, 7);
    ctx.fillStyle = awayColor;
    ctx.fillRect(width / 2 + 6, y, (row.away / max) * half, 7);
    label(ctx, String(row.home), width / 2 - 10, y + 1, 'right', '#dce9fb', 9);
    label(ctx, String(row.away), width / 2 + 10, y + 1, 'left', '#dce9fb', 9);
  });
}
