/* Nail Art AR — canvas sizing, cover mapping, smoothing and hand orientation */

export function setupCanvas(canvas, w, h, dpr) {
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export class Viewport {
  constructor(canvas, video) {
    this.canvas = canvas;
    this.video = video;
    this.ctx = null;
    this.resize();
  }

  resize() {
    const box = this.canvas.parentElement;
    this.w = Math.max(1, box.clientWidth || 300);
    this.h = Math.max(1, box.clientHeight || 225);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.ctx = setupCanvas(this.canvas, this.w, this.h, this.dpr);
  }

  /* The video uses object-fit:cover and is mirrored with scaleX(-1).
     Landmarks are normalized in the unmirrored source frame. */
  get mapping() {
    const vw = this.video.videoWidth || 1280;
    const vh = this.video.videoHeight || 720;
    const vr = vw / vh;
    const sr = this.w / this.h;
    let drawWidth, drawHeight, startX, startY;
    if (sr > vr) {
      drawWidth = this.w;
      drawHeight = this.w / vr;
      startX = 0;
      startY = (this.h - drawHeight) / 2;
    } else {
      drawHeight = this.h;
      drawWidth = this.h * vr;
      startX = (this.w - drawWidth) / 2;
      startY = 0;
    }
    return { drawWidth, drawHeight, startX, startY };
  }

  toScreen(p, map = this.mapping) {
    return {
      x: (1 - p.x) * map.drawWidth + map.startX,
      y: p.y * map.drawHeight + map.startY,
      z: p.z * map.drawWidth
    };
  }
}

function lerpPoint(prev, next, alpha) {
  return {
    x: prev.x + (next.x - prev.x) * alpha,
    y: prev.y + (next.y - prev.y) * alpha,
    z: (prev.z || 0) + ((next.z || 0) - (prev.z || 0)) * alpha
  };
}

/* Keep a stable (handedness keyed) landmark buffer to reduce jitter. */
export function smoothHands(previous, current, keys, alpha = 0.5) {
  const next = new Map();
  current.forEach((hand, i) => {
    const key = keys[i] || ('hand' + i);
    const prev = previous.get(key);
    next.set(key, prev && prev.length === hand.length
      ? hand.map((p, j) => lerpPoint(prev[j], p, alpha))
      : hand);
  });
  return next;
}

/* Detect whether the dorsal (nail) side or the palm faces the camera.
   Handedness labels refer to the subject's hands. Uses unmirrored coords. */
export function handFacing(landmarks, handedness) {
  if (!landmarks || landmarks.length < 18) return 'back';
  const w = landmarks[0], a = landmarks[5], b = landmarks[17];
  const cross = (a.x - w.x) * (b.y - w.y) - (a.y - w.y) * (b.x - w.x);
  const label = handedness && handedness[0] && handedness[0].categoryName;
  const palmSign = label === 'Left' ? -1 : 1;
  return cross * palmSign > 0 ? 'palm' : 'back';
}
