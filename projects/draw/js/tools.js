/* Pixel Studio — drawing tools operating on the active layer */
import { doc, activeLayer, activeCtx, snapshot, requestRender } from './state.js';

let session = null;

function pt(ctx, x, y, color, size, erase = false) {
  ctx.save();
  ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.5, size / 2), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function stroke(ctx, x0, y0, x1, y1, color, size, erase) {
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(dist / Math.max(1, size / 3)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pt(ctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, color, size, erase);
  }
}

function hexToRgba(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function flood(ctx, x, y, color) {
  const w = ctx.canvas.width, h = ctx.canvas.height;
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  x = Math.floor(x); y = Math.floor(y);
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const start = (y * w + x) * 4;
  const target = [d[start], d[start + 1], d[start + 2], d[start + 3]];
  const fill = hexToRgba(color);
  if (target.every((v, i) => v === fill[i])) return;
  const stack = [[x, y]];
  const seen = new Uint8Array(w * h);
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
    const k = cy * w + cx;
    if (seen[k]) continue;
    seen[k] = 1;
    const i = k * 4;
    if (d[i] !== target[0] || d[i + 1] !== target[1] || d[i + 2] !== target[2] || d[i + 3] !== target[3]) continue;
    d[i] = fill[0]; d[i + 1] = fill[1]; d[i + 2] = fill[2]; d[i + 3] = fill[3];
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  ctx.putImageData(img, 0, 0);
}

export function begin(x, y, opts) {
  const layer = activeLayer();
  if (!layer || layer.locked) return null;
  const ctx = layer.ctx;
  const tool = opts.tool || doc.tool;
  const color = opts.color || doc.color;

  if (tool === 'pick') {
    const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    return { picked: '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''), done: true };
  }
  if (tool === 'fill') {
    snapshot('Riempimento');
    flood(ctx, x, y, color);
    requestRender();
    return { done: true };
  }
  if (tool === 'text' || tool === 'sticker') {
    snapshot(tool === 'text' ? 'Testo' : 'Adesivo');
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${opts.fontSize || 42}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    if (opts.stroke) { ctx.strokeStyle = opts.strokeColor || '#000'; ctx.lineWidth = 2; ctx.strokeText(opts.text || '✦', x, y); }
    ctx.fillText(opts.text || '✦', x, y);
    ctx.restore();
    requestRender();
    return { done: true };
  }

  snapshot(tool);
  const base = document.createElement('canvas');
  base.width = layer.canvas.width; base.height = layer.canvas.height;
  base.getContext('2d').drawImage(layer.canvas, 0, 0);
  session = { tool, color, size: opts.brush || doc.brush, erase: tool === 'eraser',
    x0: x, y0: y, base, layer };
  if (tool === 'brush' || tool === 'eraser') pt(ctx, x, y, color, session.size, session.erase);
  requestRender();
  return { session: true };
}

export function move(x, y) {
  if (!session) return;
  const ctx = session.layer.ctx;
  if (session.tool === 'brush' || session.tool === 'eraser') {
    stroke(ctx, session.x0, session.y0, x, y, session.color, session.size, session.erase);
  } else if (['line', 'rect', 'ellipse'].includes(session.tool)) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(session.base, 0, 0);
    ctx.save();
    ctx.strokeStyle = session.color; ctx.fillStyle = session.color;
    ctx.lineWidth = session.size;
    if (session.tool === 'line') {
      ctx.beginPath(); ctx.moveTo(session.x0, session.y0); ctx.lineTo(x, y); ctx.stroke();
    } else if (session.tool === 'rect') {
      const rx = Math.min(session.x0, x), ry = Math.min(session.y0, y);
      const rw = Math.abs(x - session.x0), rh = Math.abs(y - session.y0);
      if (doc.fillShapes) ctx.fillRect(rx, ry, rw, rh); else ctx.strokeRect(rx, ry, rw, rh);
    } else {
      const cx = (session.x0 + x) / 2, cy = (session.y0 + y) / 2;
      const rx = Math.abs(x - session.x0) / 2, ry = Math.abs(y - session.y0) / 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      if (doc.fillShapes) ctx.fill(); else ctx.stroke();
    }
    ctx.restore();
  } else if (session.tool === 'move') {
    const dx = x - session.x0, dy = y - session.y0;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save(); ctx.translate(dx, dy); ctx.drawImage(session.base, 0, 0); ctx.restore();
  }
  if (session.tool === 'brush' || session.tool === 'eraser') {
    session.x0 = x; session.y0 = y;
  }
  requestRender();
}

export function end() {
  session = null;
  requestRender();
}

export function clearActive() {
  const ctx = activeCtx(); if (!ctx) return;
  snapshot('Pulisci');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  requestRender();
}
