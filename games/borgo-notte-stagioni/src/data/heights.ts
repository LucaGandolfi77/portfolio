import type { FidenzaBuilding } from './fidenza';
import type { WorldBounds } from './types';

/*
 * Roof heights on a 2 m grid (from the measured building heights), so the
 * jetpack can fly over the town, land on roofs and walk on them.
 */
export class HeightField {
  private cell = 2;
  private w: number;
  private h: number;
  private data: Uint8Array;

  constructor(private view: WorldBounds, buildings: FidenzaBuilding[]) {
    this.w = Math.ceil((view.maxX - view.minX) / this.cell);
    this.h = Math.ceil((view.maxZ - view.minZ) / this.cell);
    /* Quarter-metre steps up to 63 m. */
    this.data = new Uint8Array(this.w * this.h);
    for (const b of buildings) this.fill(b.poly, Math.min(63, b.h));
  }

  private fill(poly: number[], height: number): void {
    const n = poly.length / 2;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < n; i++) {
      minZ = Math.min(minZ, poly[i * 2 + 1]);
      maxZ = Math.max(maxZ, poly[i * 2 + 1]);
    }
    const v = Math.round(height * 4);
    const z0 = Math.max(0, Math.floor((minZ - this.view.minZ) / this.cell));
    const z1 = Math.min(this.h - 1, Math.floor((maxZ - this.view.minZ) / this.cell));
    for (let gz = z0; gz <= z1; gz++) {
      const z = this.view.minZ + (gz + 0.5) * this.cell;
      const xs: number[] = [];
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const zi = poly[i * 2 + 1], zj = poly[j * 2 + 1];
        if (zi > z !== zj > z) xs.push(poly[i * 2] + ((z - zi) / (zj - zi)) * (poly[j * 2] - poly[i * 2]));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.max(0, Math.ceil((xs[k] - this.view.minX) / this.cell - 0.5));
        const b = Math.min(this.w - 1, Math.floor((xs[k + 1] - this.view.minX) / this.cell - 0.5));
        for (let gx = a; gx <= b; gx++) {
          const o = gz * this.w + gx;
          if (this.data[o] < v) this.data[o] = v;
        }
      }
    }
  }

  /** Roof height at (x, z), 0 on open ground. */
  at(x: number, z: number): number {
    const gx = Math.floor((x - this.view.minX) / this.cell);
    const gz = Math.floor((z - this.view.minZ) / this.cell);
    if (gx < 0 || gz < 0 || gx >= this.w || gz >= this.h) return 0;
    return this.data[gz * this.w + gx] / 4;
  }

  /** Highest roof within `r` metres (for a body of some width). */
  around(x: number, z: number, r: number): number {
    return Math.max(this.at(x, z), this.at(x + r, z), this.at(x - r, z), this.at(x, z + r), this.at(x, z - r));
  }
}
