/**
 * props.js — sticker ancorati ai landmark, posizionabili con il dito.
 */

import { faceBox, boxToScreen, lmToScreen, clamp } from './metrics.js';
import { findSticker, clampOffset } from './lenses.js';

const ANCHORS = {
  glasses: 'eyes', shades3d: 'eyes', tears: 'eyes',
  crown: 'top', hat: 'top', halo: 'top', bow: 'topSide',
  moustache: 'mouth', beard: 'chin', bone: 'mouthSide',
  blush: 'cheekL', paws: 'cheekR', bolt: 'cheekL',
  cherries: 'mouthSide', flowers: 'topSide'
};

function anchorKind(id) { return ANCHORS[id] || 'eyes'; }

function anchorPoint(kind, lm, layout) {
  const point = (i) => lmToScreen(lm, i, layout);
  switch (kind) {
    case 'top': {
      const a = point(10), l = point(234), r = point(454);
      return { x: (l.x + r.x) / 2, y: a.y - Math.abs(r.x - l.x) * 0.12 };
    }
    case 'topSide': {
      const a = point(10), r = point(454);
      return { x: r.x + Math.abs(r.x - a.x) * 0.1, y: a.y - Math.abs(r.x - a.x) * 0.05 };
    }
    case 'mouth': {
      const a = point(0), b = point(13);
      return { x: a.x, y: (a.y + b.y) / 2 };
    }
    case 'mouthSide': {
      const a = point(0), r = point(454);
      return { x: a.x + Math.abs(r.x - a.x) * 0.22, y: a.y };
    }
    case 'chin': return point(152);
    case 'cheekL': return point(50);
    case 'cheekR': return point(280);
    case 'eyes': {
      const a = point(33), b = point(263);
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }
    default: return point(1);
  }
}

/** Posizione schermo di uno sticker, considerando l'offset personalizzato. */
export function stickerPosition(id, lm, layout, offset = { dx: 0, dy: 0 }) {
  if (!lm || !layout) return null;
  const box = boxToScreen(faceBox(lm), layout);
  const anchor = anchorPoint(anchorKind(id), lm, layout);
  const pos = clampOffset(offset.dx, offset.dy);
  return {
    x: anchor.x + pos.dx * box.w,
    y: anchor.y + pos.dy * box.h,
    size: Math.max(26, box.w * 0.26),
    box
  };
}

export function drawStickers(ctx, lm, layout, active, offsets = {}) {
  if (!lm || !active || !active.size) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = 8;
  for (const id of active) {
    const def = findSticker(id);
    if (!def) continue;
    const pos = stickerPosition(id, lm, layout, offsets[id]);
    if (!pos) continue;
    ctx.font = Math.round(pos.size) + 'px serif';
    ctx.fillText(def.emoji, pos.x, pos.y);
  }
  ctx.restore();
}

/** Restituisce lo sticker più vicino al punto (in coordinate CSS). */
export function hitSticker(x, y, lm, layout, active, offsets = {}) {
  let best = null, bestDistance = Infinity;
  for (const id of active) {
    const pos = stickerPosition(id, lm, layout, offsets[id]);
    if (!pos) continue;
    const distance = Math.hypot(x - pos.x, y - pos.y);
    if (distance < pos.size * 0.75 && distance < bestDistance) { best = id; bestDistance = distance; }
  }
  return best;
}

/** Aggiorna l'offset di uno sticker partendo dallo spostamento in pixel. */
export function dragSticker(offsets, id, dx, dy, box) {
  const current = offsets[id] || { dx: 0, dy: 0 };
  const next = clampOffset(
    current.dx + dx / Math.max(1, box.w),
    current.dy + dy / Math.max(1, box.h)
  );
  offsets[id] = next;
  return next;
}

export function defaultOffsets() {
  const offsets = {};
  for (const id of Object.keys(ANCHORS)) offsets[id] = { dx: 0, dy: 0 };
  return offsets;
}

export function normalizeOffsets(saved) {
  const out = defaultOffsets();
  if (!saved || typeof saved !== 'object') return out;
  for (const id of Object.keys(out)) {
    if (saved[id]) out[id] = clampOffset(saved[id].dx, saved[id].dy);
  }
  return out;
}
