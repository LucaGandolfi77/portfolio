/* Kinetic — canvas sizing, object-fit:cover mapping and hit testing */

export class Viewport {
  constructor(canvas, video, mirror = true) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.video = video;
    this.mirror = mirror;
    this.resize();
  }

  resize() {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /* The <video> uses object-fit:cover and is mirrored with scaleX(-1).
     Landmarks arrive in normalized, unmirrored video coordinates. */
  get mapping() {
    const vw = this.video.videoWidth || 640;
    const vh = this.video.videoHeight || 480;
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

  project(landmark, index, map = this.mapping) {
    const p = landmark[index];
    if (!p) return null;
    const xNorm = this.mirror ? 1 - p.x : p.x;
    return {
      x: xNorm * map.drawWidth + map.startX,
      y: p.y * map.drawHeight + map.startY,
      z: p.z || 0
    };
  }

  projectAll(landmarks, map = this.mapping) {
    if (!landmarks) return [];
    return landmarks.map(lm => ({
      points: lm.map(p => ({
        x: (this.mirror ? 1 - p.x : p.x) * map.drawWidth + map.startX,
        y: p.y * map.drawHeight + map.startY,
        z: p.z || 0
      }))
    }));
  }
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}
