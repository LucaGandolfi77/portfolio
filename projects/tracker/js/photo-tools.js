/** photo-tools.js — griglia, livello, istogramma ed editing base. */

export function drawGrid(ctx, width, height) {
  if (!ctx) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i += 1) {
    ctx.beginPath(); ctx.moveTo((width / 3) * i, 0); ctx.lineTo((width / 3) * i, height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, (height / 3) * i); ctx.lineTo(width, (height / 3) * i); ctx.stroke();
  }
  ctx.restore();
}

export function drawLevel(ctx, width, height, tiltDeg = 0) {
  if (!ctx) return;
  const y = height / 2;
  ctx.save();
  ctx.strokeStyle = tiltDeg > 8 || tiltDeg < -8 ? 'rgba(255,143,180,.9)' : 'rgba(124,245,180,.85)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(width * 0.3, y + tiltDeg * 0.6); ctx.lineTo(width * 0.7, y + tiltDeg * 0.6); ctx.stroke();
  ctx.fillStyle = 'rgba(238,242,255,.9)';
  ctx.font = '11px ui-monospace, monospace';
  ctx.fillText(Math.round(tiltDeg) + '°', width * 0.72, y);
  ctx.restore();
}

export function drawHistogram(ctx, imageData, x, y, width, height) {
  if (!ctx || !imageData) return;
  const bins = new Array(64).fill(0);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 16) {
    const luma = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 4;
    bins[Math.min(63, Math.floor(luma))] += 1;
  }
  const peak = Math.max(1, ...bins);
  ctx.save();
  ctx.fillStyle = 'rgba(4,10,24,.62)';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = 'rgba(103,232,249,.75)';
  bins.forEach((value, index) => {
    const barHeight = (value / peak) * (height - 6);
    ctx.fillRect(x + (index / bins.length) * width, y + height - barHeight, width / bins.length - 1, barHeight);
  });
  ctx.restore();
}

export async function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

/** Applica un crop e/o filtro CSS a una foto, ritornando un data URL. */
export async function editPhoto(dataUrl, { crop = null, filter = 'none' } = {}) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const sx = crop ? Math.max(0, crop.x) : 0;
  const sy = crop ? Math.max(0, crop.y) : 0;
  const sw = crop && crop.w > 0 ? Math.min(crop.w, image.width - sx) : image.width;
  const sh = crop && crop.h > 0 ? Math.min(crop.h, image.height - sy) : image.height;
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));
  const ctx = canvas.getContext('2d');
  ctx.filter = filter || 'none';
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
}
