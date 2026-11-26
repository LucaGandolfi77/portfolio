import { FIDENZA } from '../data/fidenza';
import { VEHICULAR } from '../data/roads';

/*
 * Radar and full map. The streets are painted once on an offscreen canvas
 * (2 px per metre... halved on phones); every frame the radar crops and
 * rotates it around the player.
 */

export interface Blip {
  x: number;
  z: number;
  kind: 'target' | 'offer' | 'police' | 'car' | 'home';
  label?: string;
}

export class Radar {
  private base: HTMLCanvasElement;
  private scale: number;
  private minX: number;
  private minZ: number;
  private ctx: CanvasRenderingContext2D;
  private flash = 0;

  constructor(private canvas: HTMLCanvasElement, mobile: boolean) {
    const v = FIDENZA.meta.view;
    this.scale = mobile ? 0.6 : 1;
    this.minX = v.minX;
    this.minZ = v.minZ;
    this.base = document.createElement('canvas');
    this.base.width = Math.ceil((v.maxX - v.minX) * this.scale);
    this.base.height = Math.ceil((v.maxZ - v.minZ) * this.scale);
    const b = this.base.getContext('2d')!;
    b.fillStyle = '#1d2a22';
    b.fillRect(0, 0, this.base.width, this.base.height);
    const P = (x: number, z: number): [number, number] => [(x - this.minX) * this.scale, (z - this.minZ) * this.scale];
    const poly = (pts: number[], fill: string): void => {
      b.beginPath();
      for (let i = 0; i < pts.length; i += 2) {
        const [x, y] = P(pts[i], pts[i + 1]);
        if (i === 0) b.moveTo(x, y);
        else b.lineTo(x, y);
      }
      b.closePath();
      b.fillStyle = fill;
      b.fill();
    };
    for (const a of FIDENZA.areas) {
      const c = ['park', 'grass', 'forest', 'sport', 'cemetery'].includes(a.kind) ? '#2c4a2e' : a.kind === 'farmland' ? '#2a3324' : '#28302c';
      poly(a.poly, c);
    }
    for (const w of FIDENZA.waterways) this.line(b, w.pts, '#2f5f78', Math.max(3, w.w) * this.scale, P);
    for (const bld of FIDENZA.buildings) poly(bld.poly, '#3a423e');
    for (const r of FIDENZA.roads) {
      const veh = VEHICULAR.has(r.kind);
      this.line(b, r.pts, veh ? '#c9c2ae' : '#6d6a5e', Math.max(veh ? 2.2 : 1, r.w * this.scale * (veh ? 1 : 0.7)), P);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas unavailable');
    this.ctx = ctx;
  }

  private line(b: CanvasRenderingContext2D, pts: number[], color: string, width: number, P: (x: number, z: number) => [number, number]): void {
    b.beginPath();
    for (let i = 0; i < pts.length; i += 2) {
      const [x, y] = P(pts[i], pts[i + 1]);
      if (i === 0) b.moveTo(x, y);
      else b.lineTo(x, y);
    }
    b.strokeStyle = color;
    b.lineWidth = width;
    b.lineCap = 'round';
    b.lineJoin = 'round';
    b.stroke();
  }

  /** Rotating radar: `heading` is the view yaw (up = where the camera looks). */
  draw(x: number, z: number, viewYaw: number, playerHeading: number, blips: Blip[], dt: number, zoom = 1): void {
    this.flash += dt;
    const c = this.ctx;
    const S = this.canvas.width;
    const R = S / 2;
    const metres = 140 / zoom;
    const k = (S / (metres * 2)) / this.scale;
    c.clearRect(0, 0, S, S);
    c.save();
    c.beginPath();
    c.arc(R, R, R - 2, 0, Math.PI * 2);
    c.clip();
    c.fillStyle = '#16201a';
    c.fillRect(0, 0, S, S);
    c.translate(R, R);
    /* World up on screen = camera forward. */
    c.rotate(Math.PI + viewYaw);
    c.scale(k, k);
    c.translate(-(x - this.minX) * this.scale, -(z - this.minZ) * this.scale);
    c.imageSmoothingEnabled = true;
    c.drawImage(this.base, 0, 0);
    c.restore();

    const toScreen = (bx: number, bz: number): [number, number, boolean] => {
      const dx = bx - x, dz = bz - z;
      const a = Math.PI + viewYaw;
      const rx = dx * Math.cos(a) - dz * Math.sin(a);
      const rz = dx * Math.sin(a) + dz * Math.cos(a);
      let sx = (rx / metres) * R;
      let sy = (rz / metres) * R;
      const l = Math.hypot(sx, sy);
      const edge = R - 10;
      const outside = l > edge;
      if (outside) {
        sx = (sx / l) * edge;
        sy = (sy / l) * edge;
      }
      return [R + sx, R + sy, outside];
    };
    for (const b of blips) {
      const [sx, sy, outside] = toScreen(b.x, b.z);
      if (b.kind === 'police') {
        if (outside) continue;
        c.fillStyle = Math.floor(this.flash * 6) % 2 ? '#ff3b3b' : '#3b6bff';
        c.beginPath();
        c.arc(sx, sy, 4.5, 0, Math.PI * 2);
        c.fill();
        continue;
      }
      if (b.kind === 'car') {
        if (outside) continue;
        c.fillStyle = '#8fd0ff';
        c.fillRect(sx - 3, sy - 3, 6, 6);
        continue;
      }
      const color = b.kind === 'target' ? '#ffd23f' : b.kind === 'home' ? '#7bdc8a' : '#ff8a3d';
      c.fillStyle = color;
      c.strokeStyle = '#111';
      c.lineWidth = 2;
      if (outside && b.kind === 'target') {
        /* An arrow on the rim pointing to the target. */
        const ang = Math.atan2(sy - R, sx - R);
        c.save();
        c.translate(sx, sy);
        c.rotate(ang);
        c.beginPath();
        c.moveTo(8, 0);
        c.lineTo(-6, -6);
        c.lineTo(-6, 6);
        c.closePath();
        c.stroke();
        c.fill();
        c.restore();
      } else {
        c.beginPath();
        c.arc(sx, sy, b.kind === 'target' ? 7 : 6, 0, Math.PI * 2);
        c.stroke();
        c.fill();
        if (b.label) {
          c.fillStyle = '#111';
          c.font = 'bold 9px system-ui, sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(b.label, sx, sy + 0.5);
        }
      }
    }
    /* Player arrow, rotated relative to the view. */
    c.save();
    c.translate(R, R);
    c.rotate(-(playerHeading - viewYaw) + Math.PI);
    c.beginPath();
    c.moveTo(0, -9);
    c.lineTo(6.5, 7);
    c.lineTo(0, 3.5);
    c.lineTo(-6.5, 7);
    c.closePath();
    c.fillStyle = '#fff';
    c.strokeStyle = '#111';
    c.lineWidth = 2;
    c.stroke();
    c.fill();
    c.restore();
    /* North tick. */
    const [nx, ny] = toScreen(x, z - 1000);
    c.fillStyle = '#fff';
    c.font = 'bold 11px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('N', nx, ny);
  }

  /** Full map (north up) with the same blips. */
  drawMap(target: HTMLCanvasElement, x: number, z: number, blips: Blip[]): void {
    const c = target.getContext('2d')!;
    const W = target.width, H = target.height;
    const s = Math.min(W / this.base.width, H / this.base.height);
    const ox = (W - this.base.width * s) / 2;
    const oy = (H - this.base.height * s) / 2;
    c.fillStyle = '#101612';
    c.fillRect(0, 0, W, H);
    c.drawImage(this.base, ox, oy, this.base.width * s, this.base.height * s);
    const P = (bx: number, bz: number): [number, number] => [ox + (bx - this.minX) * this.scale * s, oy + (bz - this.minZ) * this.scale * s];
    for (const b of blips) {
      const [px, py] = P(b.x, b.z);
      c.fillStyle = b.kind === 'police' ? '#ff3b3b' : b.kind === 'target' ? '#ffd23f' : b.kind === 'home' ? '#7bdc8a' : '#ff8a3d';
      c.beginPath();
      c.arc(px, py, b.kind === 'police' ? 4 : 7, 0, Math.PI * 2);
      c.fill();
      if (b.label) {
        c.fillStyle = '#111';
        c.font = 'bold 10px system-ui, sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(b.label, px, py + 0.5);
      }
    }
    const [px, py] = P(x, z);
    c.fillStyle = '#fff';
    c.strokeStyle = '#000';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(px, py, 6, 0, Math.PI * 2);
    c.stroke();
    c.fill();
  }
}
