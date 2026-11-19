/* Sky Ace — neon arcade renderer with parallax and vector sprites */

import { LEVELS, PICKUPS } from './config.js';

const TAU = Math.PI * 2;

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.DPR = 1;
    this.W = 0;
    this.H = 0;
    this.safeTop = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = Math.round(this.W * this.DPR);
    this.canvas.height = Math.round(this.H * this.DPR);
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    const top = typeof getComputedStyle !== 'undefined'
      ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--site-top-bar-height'), 10)
      : 0;
    this.safeTop = (Number.isFinite(top) ? top : 36) + 8;
    return { w: this.W, h: this.H };
  }

  glow(color, blur, fn) {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    fn();
    ctx.restore();
  }

  // ---- background & parallax ------------------------------------------------
  background(cfg, time, cam) {
    const ctx = this.ctx;
    const { W, H } = this;
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, cfg.sky[0]);
    sky.addColorStop(0.55, cfg.sky[1]);
    sky.addColorStop(1, cfg.sky[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // horizon haze
    const haze = ctx.createRadialGradient(W / 2, H * 0.82, 10, W / 2, H * 0.82, W * 0.7);
    haze.addColorStop(0, cfg.haze);
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);

    const theme = cfg.parallax;
    if (theme === 'city') this.parallaxCity(cfg, cam, time);
    else if (theme === 'storm') this.parallaxStorm(cfg, cam, time);
    else if (theme === 'orbit') this.parallaxOrbit(cfg, cam, time);
    else this.parallaxClouds(cfg, cam, time);

    // near haze band
    ctx.fillStyle = cfg.horizon;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, H - 120, W, 120);
    ctx.globalAlpha = 1;

    // speed lines
    ctx.save();
    ctx.strokeStyle = cfg.accent;
    ctx.globalAlpha = 0.10;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      const y = (i * 83 + time * 2.2) % H;
      const x = (i * 137 - cam * 0.05 - time * 6) % (W + 200);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40 + (i % 4) * 14, y - 1);
      ctx.stroke();
    }
    ctx.restore();
  }

  parallaxClouds(cfg, cam, time) {
    const ctx = this.ctx;
    const { W, H } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    for (let i = 0; i < 16; i++) {
      const base = i * 320;
      const x = ((base - cam * 0.16 + time * 0.35) % (W + 700) + W + 700) % (W + 700) - 300;
      const y = 40 + ((i * 97) % Math.max(100, H * 0.55));
      const r = 40 + (i % 4) * 14;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.arc(x + r * 0.8, y - r * 0.25, r * 0.8, 0, TAU);
      ctx.arc(x - r * 0.8, y - r * 0.15, r * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  parallaxCity(cfg, cam, time) {
    const ctx = this.ctx;
    const { W, H } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(10,6,32,.55)';
    const bw = 78;
    const start = Math.floor((cam * 0.34) / bw) - 1;
    for (let i = start; i < start + Math.ceil(W / bw) + 3; i++) {
      const h = 60 + ((i * 37) % 130);
      const x = i * bw - cam * 0.34;
      ctx.fillRect(x, H - 60 - h, bw - 8, h);
      ctx.fillStyle = cfg.accent;
      ctx.globalAlpha = 0.22;
      for (let wy = H - 60 - h + 12; wy < H - 80; wy += 22) {
        for (let wx = x + 10; wx < x + bw - 16; wx += 18) {
          if ((wx + wy + i) % 3 === 0) ctx.fillRect(wx, wy, 4, 6);
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(10,6,32,.55)';
    }
    ctx.restore();
  }

  parallaxStorm(cfg, cam, time) {
    const ctx = this.ctx;
    const { W, H } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(2,20,24,.5)';
    for (let i = 0; i < 13; i++) {
      const x = (((i * 310 - cam * 0.26 + time * 0.6) % (W + 600)) + W + 600) % (W + 600) - 260;
      const y = 20 + ((i * 71) % Math.max(90, H * 0.42));
      ctx.beginPath();
      ctx.ellipse(x, y, 110 + (i % 3) * 30, 26 + (i % 2) * 12, 0, 0, TAU);
      ctx.fill();
    }
    if (Math.floor(time / 95) % 7 === 0 && time % 95 < 3) {
      ctx.strokeStyle = cfg.accent;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 2;
      const x = 80 + ((time * 13) % W);
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x - 20, H * 0.3);
      ctx.lineTo(x + 12, H * 0.32); ctx.lineTo(x - 10, H * 0.6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  parallaxOrbit(cfg, cam, time) {
    const ctx = this.ctx;
    const { W, H } = this;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    for (let i = 0; i < 90; i++) {
      const x = ((i * 197 + 31) % (W + 400)) - cam * 0.08;
      const y = (i * 83 + 17) % H;
      const sx = ((x % (W + 400)) + W + 400) % (W + 400) - 200;
      ctx.globalAlpha = 0.2 + ((i * 17) % 8) / 10;
      ctx.fillRect(sx, y, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = cfg.accent;
    ctx.globalAlpha = 0.18;
    ctx.lineWidth = 2;
    const px = W * 0.74 - cam * 0.04;
    ctx.beginPath(); ctx.arc(px, H * 0.28, 150, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.1;
    ctx.beginPath(); ctx.arc(px, H * 0.28, 230, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  // ---- world ----------------------------------------------------------------
  ground(engine, cfg) {
    const ctx = this.ctx;
    const gy = this.H - 44;
    const w = engine.worldWidth;
    const g = ctx.createLinearGradient(0, gy, 0, this.H);
    g.addColorStop(0, cfg.ground);
    g.addColorStop(1, '#03060f');
    ctx.fillStyle = g;
    ctx.fillRect(0, gy, w, this.H - gy + 200);
    this.glow(cfg.grid, 14, () => {
      ctx.strokeStyle = cfg.grid;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    });
    ctx.strokeStyle = cfg.grid;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - 26, this.H + 40); ctx.stroke();
    }
    for (let y = gy + 16; y < this.H + 40; y += 18) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // world borders
    ctx.fillStyle = 'rgba(255,60,100,.28)';
    ctx.fillRect(-10, 0, 10, this.H);
    ctx.fillRect(w, 0, 10, this.H);
  }

  enemy(e, engine, cfg) {
    const ctx = this.ctx;
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    ctx.save();
    if (e.type === 'ground') {
      this.glow('#ffb26b', 10, () => {
        ctx.fillStyle = e.color;
        this.roundRect(e.x, e.y, e.w, e.h, 5);
        ctx.fill();
      });
      ctx.fillStyle = 'rgba(0,0,0,.5)';
      ctx.beginPath(); ctx.ellipse(cx, e.y + 2, 12, 6, 0, Math.PI, TAU); ctx.fill();
      const a = Math.atan2(engine.player.y - e.y, engine.player.x - cx);
      ctx.strokeStyle = '#0b0f1c';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, e.y + 2);
      ctx.lineTo(cx + Math.cos(a) * 24, e.y + 2 + Math.sin(a) * 24);
      ctx.stroke();
      if (e.launcher) {
        ctx.fillStyle = '#ff6b9d';
        ctx.shadowColor = '#ff6b9d'; ctx.shadowBlur = 10;
        ctx.fillRect(e.x + 8, e.y - 8, 14, 6);
        ctx.shadowBlur = 0;
      }
    } else {
      this.glow(cfg.enemyAccent, 14, () => {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.moveTo(e.x, cy);
        ctx.lineTo(e.x + e.w, e.y + e.h * 0.22);
        ctx.lineTo(e.x + e.w * 0.55, cy);
        ctx.lineTo(e.x + e.w, e.y + e.h * 0.78);
        ctx.lineTo(e.x, e.y + e.h);
        ctx.closePath();
        ctx.fill();
      });
      ctx.fillStyle = '#08101f';
      ctx.beginPath(); ctx.arc(e.x + e.w * 0.4, cy, 3.5, 0, TAU); ctx.fill();
    }
    if (e.hp < e.maxHp) {
      const pct = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(e.x, e.y - 9, e.w, 4);
      ctx.fillStyle = '#ff6b9d';
      ctx.fillRect(e.x, e.y - 9, e.w * pct, 4);
    }
    ctx.restore();
  }

  boss(b, cfg) {
    const ctx = this.ctx;
    ctx.save();
    const color = b.flash > 0 ? '#ffffff' : b.color;
    this.glow(color, 26, () => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(b.x - b.w / 2, b.y);
      ctx.lineTo(b.x - b.w * 0.28, b.y - b.h / 2);
      ctx.lineTo(b.x + b.w * 0.22, b.y - b.h * 0.42);
      ctx.lineTo(b.x + b.w / 2, b.y);
      ctx.lineTo(b.x + b.w * 0.22, b.y + b.h * 0.42);
      ctx.lineTo(b.x - b.w * 0.28, b.y + b.h / 2);
      ctx.closePath();
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(8,10,28,.85)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.h * 0.26, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.h * 0.26, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
    // hp bar
    const bw = b.w + 20;
    ctx.fillStyle = 'rgba(4,6,18,.8)';
    this.roundRect(b.x - bw / 2, b.y - b.h / 2 - 24, bw, 9, 4); ctx.fill();
    const pct = Math.max(0, b.hp / b.maxHp);
    const bar = ctx.createLinearGradient(b.x - bw / 2, 0, b.x + bw / 2, 0);
    bar.addColorStop(0, '#ff4d6d'); bar.addColorStop(1, color);
    ctx.fillStyle = bar;
    this.roundRect(b.x - bw / 2 + 2, b.y - b.h / 2 - 22, (bw - 4) * pct, 5, 3); ctx.fill();
    ctx.restore();
  }

  pickup(k) {
    const ctx = this.ctx;
    const info = PICKUPS[k.type];
    const pulse = 0.7 + 0.3 * Math.sin(k.phase);
    ctx.save();
    ctx.translate(k.x, k.y);
    this.glow(info.color, 18, () => {
      ctx.globalAlpha = Math.min(1, k.life / 60) * pulse;
      ctx.fillStyle = info.color;
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(11, 0); ctx.lineTo(0, 12); ctx.lineTo(-11, 0);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, 16 + Math.sin(k.phase * 1.4) * 2, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#08101f';
      ctx.font = '900 13px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(info.icon, 0, 1);
    });
    ctx.restore();
  }

  player(p, cfg, time) {
    const ctx = this.ctx;
    if (p.invuln > 0 && Math.floor(time / 4) % 2 === 0) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    if (p.flipped) ctx.scale(-1, 1);

    // engine flame
    const flame = 12 + Math.random() * 12;
    const fg = ctx.createLinearGradient(-18, 0, -18 - flame, 0);
    fg.addColorStop(0, '#fff3c4'); fg.addColorStop(0.4, '#ff9f68'); fg.addColorStop(1, 'rgba(255,80,120,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-18, -5); ctx.lineTo(-18 - flame, 0); ctx.lineTo(-18, 5);
    ctx.closePath(); ctx.fill();

    this.glow('#4de8ff', 18, () => {
      const body = ctx.createLinearGradient(-20, 0, 24, 0);
      body.addColorStop(0, '#1b3a6b'); body.addColorStop(0.6, '#dff7ff'); body.addColorStop(1, '#ffffff');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(24, 0); ctx.lineTo(-6, -7); ctx.lineTo(-20, -12);
      ctx.lineTo(-13, 0); ctx.lineTo(-20, 12); ctx.lineTo(-6, 7);
      ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = 'rgba(8,16,34,.9)';
    ctx.fillRect(-4, -19, 9, 38);
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath(); ctx.ellipse(4, 0, 6, 3.5, 0, 0, TAU); ctx.fill();
    ctx.restore();

    if (p.shield > 0) {
      ctx.save();
      ctx.strokeStyle = '#4de8ff';
      ctx.globalAlpha = 0.45 + 0.25 * Math.sin(time * 0.15);
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#4de8ff'; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(p.x, p.y, 32, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    if (p.rapid > 0) {
      ctx.fillStyle = '#ff6b9d';
      ctx.font = '900 10px Inter, sans-serif';
      ctx.fillText('»', p.x - 30, p.y + 4);
    }
  }

  projectiles(engine) {
    const ctx = this.ctx;
    ctx.save();
    for (const pr of engine.projectiles) {
      ctx.strokeStyle = pr.color;
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = pr.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pr.prevX, pr.prevY);
      ctx.lineTo(pr.x, pr.y);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(pr.x, pr.y, pr.size * 0.55, 0, TAU); ctx.fill();
    }
    for (const b of engine.bombs) {
      ctx.shadowColor = '#ff9f68'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#2b1020';
      ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(b.x - b.vx * 0.6, b.y - b.vy * 0.6, 3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  particles(items) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of items) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 26));
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  minimap(engine) {
    const ctx = this.ctx;
    const { W, H } = this;
    const mw = Math.min(220, W * 0.32);
    const mh = 82;
    const x0 = W - mw - 14;
    const y0 = this.safeTop;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = 'rgba(6,9,24,.78)';
    this.roundRect(x0, y0, mw, mh, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(160,200,255,.25)';
    ctx.lineWidth = 1; ctx.stroke();
    const ty = y0 + mh - 14;
    ctx.fillStyle = 'rgba(94,240,168,.3)';
    ctx.fillRect(x0 + 2, ty, mw - 4, 5);
    const sx = (mw - 6) / Math.max(1, engine.worldWidth);
    const sy = (mh - 24) / Math.max(1, H);
    const px = v => x0 + 3 + v * sx;
    const py = v => y0 + 4 + v * sy;
    for (const e of engine.enemies) {
      ctx.fillStyle = e.launcher ? '#ff9f68' : engine.level.enemyAccent;
      ctx.beginPath(); ctx.arc(px(e.x), py(e.y), 2.5, 0, TAU); ctx.fill();
    }
    if (engine.boss) {
      ctx.fillStyle = engine.boss.color;
      ctx.beginPath(); ctx.arc(px(engine.boss.x), py(engine.boss.y), 4.5, 0, TAU); ctx.fill();
    }
    if (engine.player) {
      ctx.fillStyle = '#4de8ff';
      ctx.beginPath(); ctx.arc(px(engine.player.x), py(engine.player.y), 3.5, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.strokeRect(x0 + 3 + engine.cameraX * sx, y0 + 4, W * sx, mh - 24);
    ctx.restore();
  }

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  draw(engine, effects) {
    const ctx = this.ctx;
    ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    ctx.clearRect(0, 0, this.W, this.H);
    const cfg = engine.level || LEVELS[0];
    const time = engine.time;
    const cam = engine.cameraX;
    this.background(cfg, time, cam);

    const shake = effects.offset();
    ctx.save();
    ctx.translate(-cam + shake.x, shake.y);
    this.ground(engine, cfg);
    for (const e of engine.enemies) this.enemy(e, engine, cfg);
    if (engine.boss) this.boss(engine.boss, cfg);
    for (const k of engine.pickups) this.pickup(k);
    this.projectiles(engine);
    if (engine.player) this.player(engine.player, cfg, time);
    this.particles(engine.particles);
    effects.drawFloaters(ctx);
    ctx.restore();

    // screen-space overlays
    this.minimap(engine);
    const vig = ctx.createRadialGradient(this.W / 2, this.H / 2, this.H * 0.32, this.W / 2, this.H / 2, this.H * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,.42)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.W, this.H);
    effects.drawFlash(ctx, this.W, this.H);
  }
}
