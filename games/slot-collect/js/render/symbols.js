/* Slot Collect — cached procedural symbol art (canvas sprites) */

import { SYMBOLS } from '../config.js';

const cache = new Map();

function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  if (typeof g.roundRect === 'function') { g.roundRect(x, y, w, h, r); return; }
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function symbolSprite(index, size = 96) {
  const key = index + '@' + size;
  if (cache.has(key)) return cache.get(key);
  const def = SYMBOLS[index] || SYMBOLS[0];
  const c = makeCanvas(size, size);
  const g = c.getContext('2d');
  const s = size, pad = s * 0.06, w = s - pad * 2;

  const bg = g.createLinearGradient(pad, pad, pad + w, pad + w);
  bg.addColorStop(0, 'rgba(255,255,255,.16)');
  bg.addColorStop(0.45, 'rgba(255,255,255,.03)');
  bg.addColorStop(1, 'rgba(0,0,0,.35)');
  g.fillStyle = '#101536';
  roundRect(g, pad, pad, w, w, s * 0.18); g.fill();
  g.fillStyle = bg;
  roundRect(g, pad, pad, w, w, s * 0.18); g.fill();
  g.strokeStyle = def.color; g.lineWidth = Math.max(2, s * 0.035);
  g.shadowColor = def.color; g.shadowBlur = s * 0.22;
  roundRect(g, pad, pad, w, w, s * 0.18); g.stroke();
  g.shadowBlur = 0;

  // glossy top highlight
  const gloss = g.createLinearGradient(0, pad, 0, pad + w * 0.5);
  gloss.addColorStop(0, 'rgba(255,255,255,.2)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gloss;
  roundRect(g, pad + s * 0.03, pad + s * 0.03, w - s * 0.06, w * 0.4, s * 0.07); g.fill();

  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `${Math.round(s * 0.52)}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  g.fillText(def.glyph, s / 2, s / 2 + s * 0.03);

  if (def.wild || def.scatter) {
    g.fillStyle = def.color; g.globalAlpha = 0.9;
    g.font = `800 ${Math.round(s * 0.11)}px Inter,system-ui,sans-serif`;
    g.fillText(def.wild ? 'WILD' : 'SCAT', s / 2, s * 0.87);
    g.globalAlpha = 1;
  }
  cache.set(key, c);
  return c;
}

export function clearSpriteCache() { cache.clear(); }
