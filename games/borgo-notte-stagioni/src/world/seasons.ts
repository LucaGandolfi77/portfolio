import * as THREE from 'three';
import type { Season } from '../game/calendar';
import type { CityRender } from './city';

/*
 * The town through the year: crowns change colour and size (blossom in
 * spring, deep green in summer, orange and red in autumn, bare in winter);
 * snow whitens roofs, lawns and pavements as it settles.
 */

const PALETTES: Record<Season, number[]> = {
  primavera: [0x7fa14a, 0x8db455, 0x6e9440, 0xf2b8c6, 0xf7e3ea, 0x93b85a],
  estate: [0x4f6a34, 0x5d7740, 0x46612f, 0x66803f, 0x52703a],
  autunno: [0xc4672a, 0xd9922f, 0xa8452a, 0xe0b440, 0x8a6a2e, 0xb85a26],
  inverno: [0x6a5e52, 0x5e554c, 0x726a60]
};

export class SeasonLook {
  private current: Season | null = null;
  private snowApplied = -1;
  private base = new Map<THREE.Material, THREE.Color>();
  private snowy: THREE.MeshLambertMaterial[];

  constructor(private city: CityRender) {
    const m = city.materials.all;
    this.snowy = [m.tiles, m.flat, m.grass, m.dirt, m.pavers, m.asphalt];
    for (const mat of this.snowy) this.base.set(mat, mat.color.clone());
  }

  apply(season: Season, snow: number): void {
    if (season !== this.current) {
      this.current = season;
      const palette = PALETTES[season];
      const color = new THREE.Color();
      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3();
      const q = new THREE.Quaternion();
      const s = new THREE.Vector3();
      for (const batch of this.city.trees) {
        batch.trees.forEach((t, i) => {
          const pick = Math.abs(Math.round(t.x * 3 + t.z * 7)) % palette.length;
          color.set(palette[pick]);
          batch.crowns.setColorAt(i, color);
          /* Bare winter trees: a thin cage of branches instead of a crown. */
          batch.crowns.getMatrixAt(i, m);
          m.decompose(pos, q, s);
          const h = Math.max(5, Math.min(14, t.h));
          const r = h * 0.3 * (season === 'inverno' ? 0.55 : season === 'autunno' ? 0.92 : 1);
          s.set(r, r * (season === 'inverno' ? 1.2 : 0.9), r);
          m.compose(pos, q, s);
          batch.crowns.setMatrixAt(i, m);
        });
        batch.crowns.instanceMatrix.needsUpdate = true;
        if (batch.crowns.instanceColor) batch.crowns.instanceColor.needsUpdate = true;
      }
    }
    const level = Math.round(snow * 20) / 20;
    if (level !== this.snowApplied) {
      this.snowApplied = level;
      /* The colour multiplies the texture, so darker textures need a bigger
         lift to read as white (values above 1 are fine in linear space). */
      const m = this.city.materials.all;
      const lift = new Map<THREE.Material, number>([
        [m.tiles, 1.25], [m.flat, 1.35], [m.grass, 3.2], [m.dirt, 2.6], [m.pavers, 1.8], [m.asphalt, 2.2]
      ]);
      for (const mat of this.snowy) {
        const amount = mat === m.asphalt ? level * 0.35 : level * 0.85;
        const target = new THREE.Color(0.95, 0.97, 1).multiplyScalar(lift.get(mat) ?? 1);
        mat.color.copy(this.base.get(mat)!).lerp(target, amount);
        /* A faint glow of its own, so snow still reads at dusk and at night. */
        mat.emissive.setRGB(0.1, 0.11, 0.14).multiplyScalar(amount);
      }
    }
  }
}
