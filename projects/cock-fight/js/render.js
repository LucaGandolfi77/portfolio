/* Cockpit Arena — canvas arena and stylized vector roosters */
import { BREEDS } from './config.js';

const TAU = Math.PI * 2;

export class Arena {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = 1; this.w = 0; this.h = 0;
    this.floaters = [];
    this.shake = 0; this.flash = 0;
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
  float(x, y, text, color = '#ffd166') { this.floaters.push({ x, y, text, color, life: 60 }); }
  hit(amount = 8) { this.shake = Math.min(20, this.shake + amount); this.flash = Math.max(this.flash, 0.4); }
  update() {
    this.shake *= 0.86; if (this.shake < 0.2) this.shake = 0;
    this.flash *= 0.85; if (this.flash < 0.01) this.flash = 0;
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      this.floaters[i].y -= 0.8; this.floaters[i].life--;
      if (this.floaters[i].life <= 0) this.floaters.splice(i, 1);
    }
  }

  rooster(x, y, scale, breed, t, flip, hp) {
    const ctx = this.ctx;
    const b = BREEDS.find(v => v.id === breed) || BREEDS[0];
    const bob = Math.sin(t * 3 + (flip ? 1.5 : 0)) * 3 * scale;
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale((flip ? -1 : 1) * scale, scale);
    ctx.shadowColor = b.color; ctx.shadowBlur = 18;
    // tail
    ctx.fillStyle = b.color;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(-34 - i * 5, -14 + i * 8, 20 - i * 2, 7, -0.5 + i * 0.28, 0, TAU);
      ctx.fill();
    }
    // body
    ctx.beginPath(); ctx.ellipse(0, 0, 32, 24, 0, 0, TAU); ctx.fill();
    // wing
    ctx.fillStyle = b.accent;
    ctx.beginPath(); ctx.ellipse(-4, 2, 18, 11, 0.2, 0, TAU); ctx.fill();
    // head
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(24, -20, 13, 0, TAU); ctx.fill();
    // comb
    ctx.fillStyle = '#ff5d8f';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(20 + i * 5, -33 - (i === 1 ? 3 : 0), 5, 0, TAU); ctx.fill(); }
    // beak
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.moveTo(36, -20); ctx.lineTo(48, -16); ctx.lineTo(36, -12); ctx.closePath(); ctx.fill();
    // eye
    ctx.shadowBlur = 0; ctx.fillStyle = '#0b1020';
    ctx.beginPath(); ctx.arc(29, -22, 2.5, 0, TAU); ctx.fill();
    // legs
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-6, 18); ctx.lineTo(-8, 34); ctx.moveTo(10, 18); ctx.lineTo(12, 34); ctx.stroke();
    // spurs
    ctx.strokeStyle = '#fff0b8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-8, 32); ctx.lineTo(-16, 36); ctx.moveTo(12, 32); ctx.lineTo(20, 36); ctx.stroke();
    ctx.restore();
  }

  hpBar(x, y, w, hp, color, label) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(4,8,20,.75)';
    ctx.fillRect(x - w / 2, y, w, 14);
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2 + 2, y + 2, (w - 4) * Math.max(0, hp / 100), 10);
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(x - w / 2, y, w, 14);
    ctx.fillStyle = '#fff'; ctx.font = '800 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${label} ${Math.round(hp)}%`, x, y - 5);
  }

  timing(phase) {
    const ctx = this.ctx;
    const w = Math.min(420, this.w - 40), x = (this.w - w) / 2, y = this.h - 58;
    ctx.fillStyle = 'rgba(8,12,28,.9)';
    ctx.fillRect(x, y, w, 34);
    const center = x + w / 2;
    const pw = w * 0.06, gw = w * 0.2;
    ctx.fillStyle = 'rgba(255,209,102,.35)'; ctx.fillRect(center - pw / 2, y + 3, pw, 28);
    ctx.fillStyle = 'rgba(94,240,168,.18)'; ctx.fillRect(center - gw / 2, y + 3, gw, 28);
    ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(center, y); ctx.lineTo(center, y + 34); ctx.stroke();
    if (phase != null) {
      const px = x + Math.max(0, Math.min(1, phase)) * w;
      ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(px, y + 17, 5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
    }
  }

  draw(scene) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const t = scene.time || 0;
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, '#160a20'); g.addColorStop(0.55, '#2a1038'); g.addColorStop(1, '#08060f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, this.w, this.h);

    // spotlights
    [0.25, 0.75].forEach((p, i) => {
      const grd = ctx.createRadialGradient(this.w * p, this.h * 0.2, 10, this.w * p, this.h * 0.2, this.h * 0.6);
      grd.addColorStop(0, i ? 'rgba(77,232,255,.14)' : 'rgba(255,107,157,.16)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, this.w, this.h);
    });
    // crowd
    ctx.fillStyle = 'rgba(255,255,255,.045)';
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % this.w, y = this.h * 0.22 + (i % 4) * 9;
      ctx.beginPath(); ctx.arc(x, y, 7 + (i % 3) * 2, 0, TAU); ctx.fill();
    }
    // ring
    ctx.fillStyle = '#3a1e2c';
    ctx.beginPath(); ctx.ellipse(this.w / 2, this.h * 0.78, this.w * 0.44, this.h * 0.16, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffb36b'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(this.w / 2, this.h * 0.78, this.w * 0.44, this.h * 0.16, 0, 0, TAU); ctx.stroke();

    const off = this.shake ? (Math.random() - 0.5) * this.shake : 0;
    ctx.save(); ctx.translate(off, 0);
    const scale = Math.min(this.w / 900, this.h / 620, 1.15);
    const y = this.h * 0.62;
    this.rooster(this.w * 0.28, y, scale, scene.a?.breed, t, false, scene.hpA);
    this.rooster(this.w * 0.72, y, scale, scene.b?.breed, t + 0.5, true, scene.hpB);
    ctx.restore();

    if (scene.fight) {
      const bw = Math.min(260, this.w * 0.32);
      this.hpBar(this.w * 0.28, 18, bw, scene.hpA, '#ff6b9d', scene.a?.name || 'A');
      this.hpBar(this.w * 0.72, 18, bw, scene.hpB, '#4de8ff', scene.b?.name || 'B');
      ctx.fillStyle = '#fff'; ctx.font = '900 13px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(`ROUND ${scene.fight.rounds || 1} · ${scene.fight.log?.length || 0}`, this.w / 2, 30);
      this.timing(scene.timing);
    }
    ctx.textAlign = 'center'; ctx.font = '800 13px Inter, sans-serif';
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.min(1, f.life / 25);
      ctx.fillStyle = f.color; ctx.shadowColor = f.color; ctx.shadowBlur = 10;
      ctx.fillText(f.text, f.x, f.y); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${Math.min(0.5, this.flash)})`;
      ctx.fillRect(0, 0, this.w, this.h);
    }
    this.update();
  }
}
