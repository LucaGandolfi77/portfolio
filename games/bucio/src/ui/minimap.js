import * as THREE from 'three';
import { MAP, isSea } from '../world/layout.js';
import { currentTheme } from '../world/themes.js';

/**
 * Minimappa: la città vista dall'alto (nord in alto, come la camera), i
 * buchi come pallini grandi quanto sono e l'Oro che lampeggia quando c'è.
 * Lo sfondo si disegna una volta per mondo, il resto ~12 volte al secondo.
 */
export class Minimap {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bg = document.createElement('canvas');
    this._acc = 0;
    this._themeKey = '';
  }

  _paintBackground(size) {
    const theme = currentTheme();
    const key = `${theme.id}:${MAP.half}:${size}`;
    if (key === this._themeKey) return;
    this._themeKey = key;
    const n = 48; // celle per lato: abbastanza per riva, strade e piazza
    this.bg.width = this.bg.height = size;
    const g = this.bg.getContext('2d');
    const col = new THREE.Color();
    const cell = size / n;
    const h = MAP.half;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = -h + ((i + 0.5) / n) * 2 * h;
        const z = -h + ((j + 0.5) / n) * 2 * h;
        if (MAP.water && isSea(x, z)) col.set(0x1b7fa4);
        else theme.ground(x, z, () => 0.5, col);
        g.fillStyle = col.getStyle();
        g.fillRect(Math.floor(i * cell), Math.floor(j * cell), Math.ceil(cell), Math.ceil(cell));
      }
    }
  }

  /** world.golds: [{ active, mesh }]; holes: i buchi in partita. */
  update(dt, holes, golds, t) {
    this._acc += dt;
    if (this._acc < 1 / 12) return;
    this._acc = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const css = this.canvas.clientWidth || 110;
    const size = Math.round(css * dpr);
    if (this.canvas.width !== size) this.canvas.width = this.canvas.height = size;
    this._paintBackground(size);

    const ctx = this.ctx;
    const h = MAP.half;
    const px = (v) => ((v + h) / (2 * h)) * size;
    ctx.clearRect(0, 0, size, size);
    ctx.globalAlpha = 0.92;
    ctx.drawImage(this.bg, 0, 0);
    ctx.globalAlpha = 1;

    // l'Oro: un rombo dorato che pulsa
    for (const g of golds) {
      if (!g.active) continue;
      const x = px(g.mesh.position.x);
      const z = px(g.mesh.position.z);
      const s = (4 + Math.sin(t * 8) * 1.5) * dpr;
      ctx.fillStyle = '#ffc93c';
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = dpr;
      ctx.beginPath();
      ctx.moveTo(x, z - s);
      ctx.lineTo(x + s, z);
      ctx.lineTo(x, z + s);
      ctx.lineTo(x - s, z);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // i buchi: prima i rivali, poi il giocatore sopra a tutti
    const ordered = [...holes].filter((o) => !o.out).sort((a, b) => a.isPlayer - b.isPlayer);
    for (const o of ordered) {
      const r = Math.max(2.2 * dpr, (o.r / (2 * h)) * size * 1.6);
      ctx.beginPath();
      ctx.arc(px(o.x), px(o.z), r, 0, Math.PI * 2);
      ctx.fillStyle = o.isPlayer ? '#0a0710' : `#${new THREE.Color(o.color).getHexString()}`;
      ctx.fill();
      ctx.lineWidth = (o.isPlayer ? 2 : 1) * dpr;
      ctx.strokeStyle = o.isPlayer ? '#ffffff' : 'rgba(0,0,0,0.55)';
      ctx.stroke();
    }
  }
}
