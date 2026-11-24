/* Neon Kart — performant Canvas 2D renderer with pre-rendered assets */
import { WORLD, POWERUPS } from './config.js';

const QUALITY_SCALE = { low:0.4, high:0.65 };

function makeKartSprite(color) {
  const c = document.createElement('canvas'); c.width = 44; c.height = 60;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(0,0,0,.35)';
  x.beginPath(); x.ellipse(22, 50, 16, 5, 0, 0, 7); x.fill();
  x.fillStyle = '#151b2b';
  x.fillRect(6, 14, 8, 18); x.fillRect(30, 14, 8, 18);
  x.fillRect(5, 38, 9, 16); x.fillRect(30, 38, 9, 16);
  const g = x.createLinearGradient(0, 8, 0, 52);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, color); g.addColorStop(1, '#101828');
  x.fillStyle = g;
  x.beginPath(); x.moveTo(22, 5); x.lineTo(34, 18); x.lineTo(32, 48);
  x.lineTo(12, 48); x.lineTo(10, 18); x.closePath(); x.fill();
  x.fillStyle = '#0b1224'; x.fillRect(14, 20, 16, 12);
  x.fillStyle = '#ffffff'; x.fillRect(13, 8, 6, 4); x.fillRect(25, 8, 6, 4);
  x.fillStyle = '#ff4d5e'; x.fillRect(13, 45, 5, 3); x.fillRect(26, 45, 5, 3);
  return c;
}

export class Renderer {
  constructor(canvas, quality = 'high') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha:false });
    this.quality = quality;
    this.dpr = 1;
    this.camera = { x:800, y:600, zoom:0.62 };
    this.sprites = new Map();
    this.trackCanvas = null;
    this.trackKey = null;
    this.miniCanvas = null;
    this.particles = Array.from({ length:140 }, () => ({ active:false, x:0, y:0, vx:0, vy:0, life:0, max:1, size:3, color:'#fff' }));
    this.pIndex = 0;
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  resize() {
    this.dpr = Math.min(devicePixelRatio || 1, this.quality === 'low' ? 1.25 : 2);
    const r = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(1, Math.round(r.width * this.dpr));
    this.canvas.height = Math.max(1, Math.round(r.height * this.dpr));
  }
  sprite(color) {
    if (!this.sprites.has(color)) this.sprites.set(color, makeKartSprite(color));
    return this.sprites.get(color);
  }
  buildTrack(track) {
    if (this.trackKey === track.def.id) return;
    this.trackKey = track.def.id;
    const scale = QUALITY_SCALE[this.quality] || 0.65;
    const c = document.createElement('canvas');
    c.width = Math.round(WORLD.w * scale); c.height = Math.round(WORLD.h * scale);
    const x = c.getContext('2d');
    x.scale(scale, scale);
    x.fillStyle = track.def.ground; x.fillRect(0, 0, WORLD.w, WORLD.h);
    /* subtle texture */
    x.globalAlpha = 0.06; x.fillStyle = '#ffffff';
    for (let i = 0; i < 140; i++) {
      const px = (i * 137) % WORLD.w, py = (i * 311) % WORLD.h;
      x.fillRect(px, py, 12, 3);
    }
    x.globalAlpha = 1;
    x.lineCap = 'round'; x.lineJoin = 'round';
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = track.width + 26;
    x.beginPath();
    track.points.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y));
    x.closePath(); x.stroke();
    x.strokeStyle = track.def.road; x.lineWidth = track.width;
    x.stroke();
    x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = 3;
    x.setLineDash([26, 30]); x.stroke(); x.setLineDash([]);
    const s = track.pointAt(0);
    x.save(); x.translate(s.x, s.y); x.rotate(s.angle);
    for (let i = -4; i < 4; i++) {
      x.fillStyle = i % 2 ? '#0d1220' : '#ffffff';
      x.fillRect(i * 13, -track.width / 2, 13, 12);
      x.fillRect(i * 13, track.width / 2 - 12, 13, 12);
    }
    x.restore();
    this.trackCanvas = c;

    const m = document.createElement('canvas'); m.width = 150; m.height = 112;
    const mx = m.getContext('2d');
    mx.scale(150 / WORLD.w, 112 / WORLD.h);
    mx.strokeStyle = 'rgba(255,255,255,.55)'; mx.lineWidth = 34;
    mx.beginPath();
    track.points.forEach((p, i) => i ? mx.lineTo(p.x, p.y) : mx.moveTo(p.x, p.y));
    mx.closePath(); mx.stroke();
    this.miniCanvas = m;
  }
  emit(x, y, color, count = 4, power = 1) {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.pIndex++ % this.particles.length];
      const a = Math.random() * 7;
      p.active = true; p.x = x; p.y = y;
      p.vx = Math.cos(a) * (20 + Math.random() * 60) * power;
      p.vy = Math.sin(a) * (20 + Math.random() * 60) * power;
      p.max = p.life = 0.28 + Math.random() * 0.35;
      p.size = 2 + Math.random() * 3; p.color = color;
    }
  }
  drawRace(race, player, dt) {
    const track = race.track;
    this.buildTrack(track);
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = track.def.ground; ctx.fillRect(0, 0, w, h);

    const cam = this.camera;
    const targetZoom = 0.54 + Math.min(0.12, player.speed * 0.006);
    cam.x += (player.x - cam.x) * Math.min(1, dt * 7);
    cam.y += (player.y - cam.y) * Math.min(1, dt * 7);
    cam.zoom += (targetZoom - cam.zoom) * Math.min(1, dt * 3);
    const scale = cam.zoom * this.dpr;

    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-player.angle - Math.PI / 2);
    ctx.scale(scale, scale);
    ctx.translate(-cam.x, -cam.y);

    if (this.trackCanvas) ctx.drawImage(this.trackCanvas, 0, 0, WORLD.w, WORLD.h);

    race.oils.forEach(o => { ctx.fillStyle = 'rgba(10,10,16,.75)'; ctx.beginPath(); ctx.arc(o.x, o.y, 18, 0, 7); ctx.fill(); });
    race.powerups.forEach(p => {
      const def = POWERUPS.find(x => x.id === p.type);
      ctx.fillStyle = def?.color || '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, 7); ctx.fill();
      ctx.fillStyle = '#0a1020'; ctx.font = '16px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(def?.icon || '?', p.x, p.y + 5);
    });

    const ghost = race.currentGhost;
    if (ghost) {
      ctx.globalAlpha = 0.35;
      ctx.drawImage(this.sprite('#ffffff'), ghost.x - 22, ghost.y - 30, 44, 60);
      ctx.globalAlpha = 1;
    }

    race.racers.forEach(r => {
      if (r.eliminated) return;
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.angle + Math.PI / 2);
      if (r.shield > 0) {
        ctx.strokeStyle = 'rgba(90,169,255,.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.stroke();
      }
      if (r.boost > 0 || r.nitroOn) {
        ctx.fillStyle = r.nitroOn ? '#ff9d3d' : '#5ef0a8';
        ctx.beginPath(); ctx.moveTo(-7, 24); ctx.lineTo(0, 46 + Math.random() * 12); ctx.lineTo(7, 24); ctx.fill();
      }
      if (r.freeze > 0) ctx.globalAlpha = 0.65;
      ctx.drawImage(this.sprite(r.kart.color), -22, -30, 44, 60);
      ctx.globalAlpha = 1;
      ctx.restore();
    });

    this.particles.forEach(p => {
      if (!p.active) return;
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
    ctx.restore();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) p.active = false;
    }
  }
  drawMini(ctx, x, y, w, h, race) {
    if (!this.miniCanvas) return;
    ctx.drawImage(this.miniCanvas, x, y, w, h);
    const s = w / WORLD.w;
    race.racers.forEach(r => {
      if (r.eliminated) return;
      ctx.fillStyle = r.id === 'player' ? '#ffffff' : r.kart.color;
      ctx.beginPath(); ctx.arc(x + r.x * s, y + r.y * (h / WORLD.h), r.id === 'player' ? 4 : 2.5, 0, 7); ctx.fill();
    });
  }
}
