/**
 * effects.js — pipeline visiva di Face Lab.
 * Dishonestamente divertente: warp sui pixel della regione del volto e overlay vettoriali.
 */

import {
  M68, CHAINS, EYE_L, EYE_R, FACE_LEFT, FACE_RIGHT, clamp, clamp01,
  faceBox, boxToScreen, lmToScreen
} from './metrics.js';

const TAU = Math.PI * 2;

export function lensFilter(lens) {
  return (lens && lens.params && lens.params.filter) || 'none';
}

/** Disegna il video base (specchiato) applicando l'eventuale filtro CSS della lente. */
export function drawBase(ctx, video, layout, mirror, lens) {
  if (!video || !video.videoWidth) return;
  ctx.save();
  if (mirror) { ctx.translate(layout.w, 0); ctx.scale(-1, 1); }
  ctx.filter = lensFilter(lens);
  ctx.drawImage(video, layout.offX, layout.offY, layout.drawW, layout.drawH);
  ctx.restore();
}

function neededWarp(params) {
  return !!(params.fish || params.swirl || params.chroma || params.pixel || params.kaleido ||
    params.glitch || params.melt || params.xray || params.crt || params.polaroid ||
    params.bit8 || params.stretchX || params.squash);
}

/** Applica la lente principale: warp + eventuali copie + overlay. */
export function applyLens(ctx, orig, region, lm, layout, lens, metrics, time) {
  if (!lens || lens.kind === 'none' || lens.kind === 'reaction') return;
  const params = lens.params || {};
  const box = boxToScreen(faceBox(lm), layout);
  if (neededWarp(params)) {
    const R = Math.min(360, Math.max(80, box.w));
    region.width = R;
    region.height = Math.max(60, Math.round(R * box.h / Math.max(1, box.w)));
    const rctx = region.getContext('2d', { willReadFrequently: true });
    const sx = box.cx - box.w / 2, sy = box.cy - box.h / 2;
    rctx.clearRect(0, 0, region.width, region.height);
    rctx.drawImage(orig, sx, sy, box.w, box.h, 0, 0, region.width, region.height);
    const image = rctx.getImageData(0, 0, region.width, region.height);
    warpPixels(image, params, metrics, time);
    rctx.putImageData(image, 0, 0);

    let sx1 = sx, sy1 = sy, bw = box.w, bh = box.h;
    if (params.stretchX) { bw *= params.stretchX; sx1 -= (bw - box.w) / 2; }
    if (params.squash) {
      const jaw = metrics.jawOpen || 0;
      bh *= 1 - jaw * 0.18;
      bw *= 1 + (metrics.smile || 0) * 0.22;
      sx1 -= (bw - box.w) / 2;
    }
    ctx.drawImage(region, sx1, sy1, bw, bh);

    if (params.triple) {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.drawImage(region, sx1 - box.w * 0.82, sy1 + box.h * 0.06, bw, bh);
      ctx.drawImage(region, sx1 + box.w * 0.82, sy1 + box.h * 0.06, bw, bh);
      ctx.restore();
    }
  }
  drawExtras(ctx, orig, lm, layout, lens, metrics, time, box);
}

/** Trasformazione dei pixel della regione: tutti i warp condividono questo loop. */
function warpPixels(image, p, metrics, time) {
  const { data } = image;
  const w = image.width, h = image.height;
  const out = new Uint8ClampedArray(data.length);
  const cx = w / 2, cy = h / 2, Rmax = Math.hypot(cx, cy) || 1;
  const kaleidoSegments = p.kaleido || 0;
  const segmentAngle = kaleidoSegments ? TAU / kaleidoSegments : 0;
  const pixelSize = p.pixel || 0;
  const chroma = p.chroma || 0;
  const flicker = Math.floor(time / 90);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const dx = x - cx, dy = y - cy;
      const r = Math.hypot(dx, dy), t = r / Rmax;
      let sx = x, sy = y;

      if (p.fish || p.swirl || p.melt || kaleidoSegments) {
        let angle = Math.atan2(dy, dx);
        let radius = r;
        if (kaleidoSegments) {
          const a = ((angle % segmentAngle) + segmentAngle) % segmentAngle;
          angle = a > segmentAngle / 2 ? segmentAngle - a : a;
        }
        if (p.fish) radius = r / (1 + p.fish * t * t);
        sx = cx + Math.cos(angle) * radius;
        sy = cy + Math.sin(angle) * radius;
        if (p.swirl) {
          const a = p.swirl * (1 - t) * (1 - t) * 0.9;
          const rx = sx - cx, ry = sy - cy;
          const ca = Math.cos(a), sa = Math.sin(a);
          sx = cx + rx * ca - ry * sa;
          sy = cy + rx * sa + ry * ca;
        }
        if (p.melt) {
          sx += Math.sin(y / 9 + time / 400) * 6 * t;
          sy = cy + (sy - cy) * (1 + 0.32 * t);
        }
      }
      if (p.glitch) {
        const block = Math.floor(y / 7);
        const noise = Math.sin(block * 12.9898 + flicker * 0.7) * 43758.5453;
        const jump = ((noise - Math.floor(noise)) - 0.5) * w * 0.16;
        sx += jump;
      }
      if (pixelSize) {
        sx = Math.floor(sx / pixelSize) * pixelSize + pixelSize / 2;
        sy = Math.floor(sy / pixelSize) * pixelSize + pixelSize / 2;
      }
      const ix = clamp(Math.round(sx), 0, w - 1);
      const iy = clamp(Math.round(sy), 0, h - 1);
      const si = (iy * w + ix) * 4;
      const di = (y * w + x) * 4;
      let R = data[si], G = data[si + 1], B = data[si + 2];

      if (chroma) {
        const shift = Math.round(chroma * w);
        const sr = clamp(ix + shift, 0, w - 1), sb = clamp(ix - shift, 0, w - 1);
        R = data[(iy * w + sr) * 4];
        B = data[(iy * w + sb) * 4 + 2];
      }
      if (p.xray) {
        const lum = R * 0.3 + G * 0.59 + B * 0.11;
        const v = 255 - lum;
        R = v * 0.55; G = v * 0.85; B = v;
      }
      if (p.bit8) {
        R = Math.round(R / 32) * 32; G = Math.round(G / 32) * 32; B = Math.round(B / 32) * 32;
      }
      if (p.crt && y % 3 === 0) { R *= 0.72; G *= 0.82; B *= 0.72; }
      if (p.polaroid) { R = R * 0.9 + 22; G = G * 0.88 + 15; B = B * 0.82 + 10; }
      out[di] = R; out[di + 1] = G; out[di + 2] = B; out[di + 3] = 255;
    }
  }
  image.data.set(out);
}

function eyeCenter(lm, eye, layout) {
  const a = lmToScreen(lm, eye[0], layout);
  const b = lmToScreen(lm, eye[1], layout);
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r: Math.hypot(a.x - b.x, a.y - b.y) * 0.72 };
}

function drawExtras(ctx, orig, lm, layout, lens, metrics, time, box) {
  const p = lens.params || {};
  const scale = Math.max(1, layout.h / 700);
  const S = (v) => v * scale;

  if (lens.id === 'giant') {
    for (const eye of [EYE_L, EYE_R]) {
      const e = eyeCenter(lm, eye, layout);
      const r = e.r * (p.eyes || 2.1);
      ctx.save();
      ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, TAU); ctx.clip();
      ctx.drawImage(orig, e.x - r, e.y - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = S(2);
      ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, TAU); ctx.stroke();
    }
  }

  if (lens.id === 'emoji') {
    const es = S(layout.h * 0.16);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const eyes = ['😳', '👁️', '👀', '🔥', '✨'];
    for (const eye of [EYE_L, EYE_R]) {
      const e = eyeCenter(lm, eye, layout);
      ctx.font = es + 'px serif';
      ctx.fillText(eyes[Math.floor(time / 700) % eyes.length], e.x, e.y);
    }
    const mouth = lmToScreen(lm, 0, layout);
    ctx.font = es * 1.5 + 'px serif';
    ctx.fillText('😮', mouth.x, mouth.y);
  }

  if (lens.id === 'cartoon') {
    ctx.strokeStyle = 'rgba(12,12,30,.85)'; ctx.lineWidth = S(3.2); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const key of ['jaw', 'browL', 'browR', 'nose', 'noseL', 'eyeL', 'eyeR', 'mouthOuter', 'mouthInner']) {
      const chain = CHAINS[key];
      ctx.beginPath();
      chain.forEach((idx, i) => {
        const q = lmToScreen(lm, M68[idx], layout);
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      });
      ctx.stroke();
    }
  }

  if (p.animal) drawAnimal(ctx, lm, layout, p.animal, metrics, S);
  if (p.creature) drawCreature(ctx, lm, layout, p.creature, S);

  if (p.xray) {
    ctx.save();
    ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = S(18);
    ctx.strokeStyle = 'rgba(220,255,255,.9)'; ctx.lineWidth = S(2.4);
    for (const key of ['jaw', 'eyeL', 'eyeR', 'mouthOuter']) {
      const chain = CHAINS[key];
      ctx.beginPath();
      chain.forEach((idx, i) => {
        const q = lmToScreen(lm, M68[idx], layout);
        if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  if (p.crt) {
    ctx.fillStyle = 'rgba(52,255,160,.85)';
    ctx.font = '700 ' + S(14) + 'px ui-monospace,monospace';
    ctx.fillText('● REC  1994', box.x + S(10), box.y - S(10));
  }
  if (p.polaroid) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = S(12);
    ctx.strokeRect(box.x - S(8), box.y - S(8), box.w + S(16), box.h + S(16));
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = S(16) + 'px cursive';
    ctx.textAlign = 'center';
    ctx.fillText('✧ wish you were here ✧', box.cx, box.y + box.h + S(28));
    ctx.restore();
  }
}

function drawAnimal(ctx, lm, layout, kind, metrics, S) {
  const left = lmToScreen(lm, FACE_LEFT, layout);
  const right = lmToScreen(lm, FACE_RIGHT, layout);
  const top = lmToScreen(lm, 10, layout);
  const nose = lmToScreen(lm, 4, layout);
  const mouth = lmToScreen(lm, 0, layout);
  const headW = Math.abs(right.x - left.x);
  const jaw = metrics.jawOpen || 0;

  if (kind === 'dog') {
    ctx.fillStyle = '#8b5a2b'; ctx.strokeStyle = '#5a3518'; ctx.lineWidth = S(3);
    for (const side of [-1, 1]) {
      const x = top.x + side * headW * 0.42, y = top.y + S(8);
      ctx.save(); ctx.translate(x, y); ctx.rotate(side * 0.35);
      ctx.beginPath(); ctx.ellipse(0, 0, headW * 0.13, headW * 0.28, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#d9b08c';
    ctx.beginPath(); ctx.ellipse(nose.x, mouth.y + S(14), headW * 0.14, headW * 0.1, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#241a16';
    ctx.beginPath(); ctx.ellipse(nose.x, nose.y, headW * 0.055, headW * 0.04, 0, 0, TAU); ctx.fill();
    if (jaw > 0.15) {
      ctx.fillStyle = '#ff7a9c';
      ctx.beginPath(); ctx.ellipse(mouth.x, mouth.y + S(30), headW * 0.06, headW * 0.12 * jaw + S(6), 0, 0, TAU); ctx.fill();
    }
  }
  if (kind === 'cat') {
    ctx.fillStyle = '#f0a5c0'; ctx.strokeStyle = '#b85f82'; ctx.lineWidth = S(3);
    for (const side of [-1, 1]) {
      const x = top.x + side * headW * 0.34;
      ctx.beginPath();
      ctx.moveTo(x - headW * 0.12, top.y + S(20));
      ctx.lineTo(x, top.y - headW * 0.18);
      ctx.lineTo(x + headW * 0.12, top.y + S(20));
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = S(2);
    for (const side of [-1, 1]) for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(nose.x + side * headW * 0.06, nose.y + S(6));
      ctx.lineTo(nose.x + side * headW * 0.34, nose.y + S(6) + i * S(7));
      ctx.stroke();
    }
    ctx.fillStyle = '#ff7a9c';
    ctx.beginPath(); ctx.moveTo(nose.x, nose.y + S(10));
    ctx.lineTo(nose.x - S(9), nose.y + S(2)); ctx.lineTo(nose.x + S(9), nose.y + S(2)); ctx.closePath(); ctx.fill();
  }
  if (kind === 'bunny') {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#e6a9c4'; ctx.lineWidth = S(3);
    for (const side of [-1, 1]) {
      const x = top.x + side * headW * 0.25;
      ctx.save(); ctx.translate(x, top.y - headW * 0.24); ctx.rotate(side * 0.12);
      ctx.beginPath(); ctx.ellipse(0, 0, headW * 0.09, headW * 0.3, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffc7da';
      ctx.beginPath(); ctx.ellipse(0, 0, headW * 0.04, headW * 0.23, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.restore();
    }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ccc';
    ctx.fillRect(mouth.x - S(10), mouth.y + S(4), S(20), S(18));
    ctx.strokeRect(mouth.x - S(10), mouth.y + S(4), S(20), S(18));
    ctx.beginPath(); ctx.moveTo(mouth.x, mouth.y + S(4)); ctx.lineTo(mouth.x, mouth.y + S(22)); ctx.stroke();
  }
  if (kind === 'frog') {
    for (const eye of [EYE_L, EYE_R]) {
      const e = eyeCenter(lm, eye, layout);
      ctx.fillStyle = '#8ed34b';
      ctx.beginPath(); ctx.arc(e.x, e.y - S(12), e.r * 0.85, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(e.x, e.y - S(12), e.r * 0.55, 0, TAU); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(e.x, e.y - S(12), e.r * 0.25, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = '#2f6b20'; ctx.lineWidth = S(5); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(mouth.x, mouth.y - S(4), headW * 0.32, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

function drawCreature(ctx, lm, layout, kind, S) {
  for (const eye of [EYE_L, EYE_R]) {
    const e = eyeCenter(lm, eye, layout);
    if (kind === 'alien') {
      ctx.fillStyle = '#07070c';
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * 1.1, e.r * 0.65, (eye === EYE_L ? -1 : 1) * 0.25, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.beginPath(); ctx.arc(e.x - e.r * 0.3, e.y - e.r * 0.2, e.r * 0.16, 0, TAU); ctx.fill();
    } else if (kind === 'zombie') {
      ctx.fillStyle = 'rgba(10,20,10,.8)';
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.r * 1.15, e.r * 0.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff3b3b';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 0.22, 0, TAU); ctx.fill();
    } else if (kind === 'robot') {
      ctx.fillStyle = '#101820'; ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = S(2.5);
      const size = e.r * 1.5;
      ctx.fillRect(e.x - size / 2, e.y - size / 3, size, size * 0.66);
      ctx.strokeRect(e.x - size / 2, e.y - size / 3, size, size * 0.66);
      ctx.fillStyle = '#22d3ee';
      for (let i = 0; i < 4; i += 1) ctx.fillRect(e.x - size / 2 + S(4), e.y - size / 5 + i * S(6), size - S(8), S(2));
    }
  }
  if (kind === 'alien' || kind === 'robot') {
    const top = lmToScreen(lm, 10, layout);
    const left = lmToScreen(lm, FACE_LEFT, layout);
    const right = lmToScreen(lm, FACE_RIGHT, layout);
    const cx = (left.x + right.x) / 2;
    ctx.strokeStyle = kind === 'alien' ? '#8ef07a' : '#22d3ee';
    ctx.lineWidth = S(3);
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * Math.abs(right.x - left.x) * 0.2, top.y + S(6));
      ctx.lineTo(cx + side * Math.abs(right.x - left.x) * 0.32, top.y - Math.abs(right.x - left.x) * 0.18);
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(cx + side * Math.abs(right.x - left.x) * 0.32, top.y - Math.abs(right.x - left.x) * 0.18, S(8), 0, TAU);
      ctx.fill();
    }
  }
  if (kind === 'zombie') {
    const cheek = lmToScreen(lm, 50, layout);
    ctx.strokeStyle = '#5a1515'; ctx.lineWidth = S(2.5);
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cheek.x - S(16), cheek.y + i * S(8));
      ctx.lineTo(cheek.x + S(16), cheek.y + i * S(8) + S(4));
      ctx.stroke();
    }
  }
}

export function isWarpLens(lens) {
  return !!(lens && lens.kind === 'warp');
}

export function reactionOf(lens) {
  return (lens && lens.params && lens.params.reaction) || null;
}

export function clampBoxToScreen(box, layout) {
  return {
    x: clamp(box.x, 0, layout.w - box.w),
    y: clamp(box.y, 0, layout.h - box.h),
    w: clamp01(box.w / layout.w) * layout.w,
    h: clamp01(box.h / layout.h) * layout.h
  };
}
