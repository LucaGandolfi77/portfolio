/* Fractal Observatory — canvas renderer with glow, blend, symmetry and FX */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.dpr = 1; this.w = 0; this.h = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
  }

  draw(scene) {
    const ctx = this.ctx, { w, h, dpr, camera } = scene;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // background
    if (scene.bg === 'stars') {
      ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.4)';
      for (let i = 0; i < 90; i++) {
        const x = (i * 137.5) % w, y = (i * 71.3) % h;
        const a = 0.2 + ((i * 17) % 8) / 12;
        ctx.globalAlpha = a;
        ctx.fillRect(x, y, i % 9 === 0 ? 2 : 1, i % 9 === 0 ? 2 : 1);
      }
      ctx.globalAlpha = 1;
    } else if (scene.bg === 'grid') {
      ctx.fillStyle = '#04060e'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(120,180,255,.08)'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    } else {
      ctx.fillStyle = '#05060d'; ctx.fillRect(0, 0, w, h);
    }

    camera.apply(ctx, dpr, w, h);
    const glow = scene.glow || 0;
    ctx.shadowBlur = glow / (camera.zoom * camera.fit);
    ctx.globalCompositeOperation = scene.blend || 'lighter';
    const geometry = scene.geometry;
    if (!geometry) { ctx.setTransform(1, 0, 0, 1, 0, 0); return; }

    const sym = Math.max(1, scene.symmetry || 1);
    for (let s = 0; s < sym; s++) {
      ctx.save();
      if (sym > 1) ctx.rotate(s * Math.PI * 2 / sym);
      this.geometry(ctx, geometry, scene, camera);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  geometry(ctx, g, scene, camera) {
    const pal = scene.palette;
    const pixel = Math.max(1.4 / (camera.zoom * camera.fit), 0.003);
    if (g.type === 'tris') {
      g.items.forEach((tri, i) => {
        const level = g.items.length > 1 ? i / (g.items.length - 1) : 0;
        ctx.fillStyle = pal(level * 8, 8);
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.moveTo(tri[0].x, tri[0].y);
        ctx.lineTo(tri[1].x, tri[1].y);
        ctx.lineTo(tri[2].x, tri[2].y);
        ctx.closePath(); ctx.fill();
      });
    } else if (g.type === 'squares') {
      g.items.forEach((sq, i) => {
        ctx.fillStyle = pal((i / Math.max(1, g.items.length)) * 8, 8);
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(sq.x, sq.y, sq.s, sq.s);
      });
    } else if (g.type === 'segments') {
      g.items.forEach((seg, i) => {
        const level = seg[2] == null ? i / Math.max(1, g.items.length) : seg[2] / Math.max(1, g.maxDepth || 10);
        ctx.strokeStyle = pal(level * 8, 8);
        ctx.shadowColor = ctx.fillStyle || ctx.strokeStyle;
        ctx.lineWidth = Math.max(pixel * 1.5, (1 - level) * pixel * 4);
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(seg[0].x, seg[0].y); ctx.lineTo(seg[1].x, seg[1].y); ctx.stroke();
      });
    } else if (g.type === 'path') {
      ctx.strokeStyle = pal(4, 8); ctx.shadowColor = ctx.strokeStyle;
      ctx.lineWidth = Math.max(pixel * 1.6, 0.004);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      g.points.forEach((p, i) => { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      if (g.closed) ctx.closePath();
      ctx.stroke();
    }
    if (scene.chaosPoints && scene.chaosPoints.length) {
      const ps = pixel * 1.4;
      scene.chaosPoints.forEach(pt => {
        ctx.fillStyle = pal(pt.index / Math.max(1, scene.chaosVerts) * 8, 8);
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(pt.x - ps / 2, pt.y - ps / 2, ps, ps);
      });
      scene.chaosVertices?.forEach(v => {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(v.x, v.y, ps * 2, 0, Math.PI * 2); ctx.fill();
      });
    }
  }
}
