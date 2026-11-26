import * as THREE from 'three';
import type { Season } from '../game/calendar';

/*
 * Weather by season: clear, cloudy, rain, the Po valley fog, snow. It
 * changes every few in-game hours; rain and snow are particles in a box
 * that follows the camera. Grip, fog and cloud cover are exposed for the
 * cars and the sky.
 */

export type WeatherKind = 'sereno' | 'nuvoloso' | 'pioggia' | 'nebbia' | 'neve';

export const WEATHER_LABEL: Record<WeatherKind, string> = {
  sereno: 'Sereno',
  nuvoloso: 'Nuvoloso',
  pioggia: 'Pioggia',
  nebbia: 'Nebbia',
  neve: 'Neve'
};

const CHANCES: Record<Season, Array<[WeatherKind, number]>> = {
  primavera: [['sereno', 0.45], ['nuvoloso', 0.3], ['pioggia', 0.25]],
  estate: [['sereno', 0.75], ['nuvoloso', 0.15], ['pioggia', 0.1]],
  autunno: [['sereno', 0.25], ['nuvoloso', 0.25], ['pioggia', 0.3], ['nebbia', 0.2]],
  inverno: [['sereno', 0.2], ['nuvoloso', 0.2], ['nebbia', 0.3], ['neve', 0.3]]
};

export function pickWeather(season: Season, r: number): WeatherKind {
  let acc = 0;
  for (const [kind, p] of CHANCES[season]) {
    acc += p;
    if (r < acc) return kind;
  }
  return CHANCES[season][0][0];
}

/** Tyre grip multiplier for each weather. */
export function gripOf(kind: WeatherKind): number {
  return kind === 'pioggia' ? 0.75 : kind === 'neve' ? 0.55 : 1;
}

export class Weather {
  kind: WeatherKind = 'sereno';
  /** 0..1, eased towards the target of the current kind. */
  cloud = 0;
  fog = 0;
  wet = 0;
  /** Snow lying on the town, 0..1: builds while it snows, melts otherwise. */
  snow = 0;
  /** Hours (game) until the next change. */
  private left = 6;
  /** Forced kind (story missions: fog for the finale). */
  forced: WeatherKind | null = null;
  private rain: THREE.LineSegments;
  private flakes: THREE.Points;
  private count: number;
  private box = 70;

  constructor(scene: THREE.Scene, mobile: boolean) {
    this.count = mobile ? 700 : 1600;
    const rainPos = new Float32Array(this.count * 6);
    const snowPos = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      const x = (Math.random() - 0.5) * this.box, y = Math.random() * 30, z = (Math.random() - 0.5) * this.box;
      rainPos.set([x, y, z, x + 0.05, y - 0.9, z], i * 6);
      snowPos.set([x, y, z], i * 3);
    }
    const rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    this.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaab8c8, transparent: true, opacity: 0.45, depthWrite: false }));
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    this.flakes = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.9, depthWrite: false }));
    for (const o of [this.rain, this.flakes]) {
      o.frustumCulled = false;
      o.visible = false;
      scene.add(o);
    }
  }

  get grip(): number {
    return gripOf(this.kind) * (1 - this.snow * 0.15);
  }

  /** dtHours: game hours elapsed this frame. */
  update(dt: number, dtHours: number, season: Season, centre: THREE.Vector3): void {
    this.left -= dtHours;
    if (this.forced) this.kind = this.forced;
    else if (this.left <= 0) {
      let next = pickWeather(season, Math.random());
      if (next === 'neve' && season !== 'inverno') next = 'pioggia';
      this.kind = next;
      this.left = 4 + Math.random() * 6;
    }
    if (season !== 'inverno' && this.kind === 'neve') this.kind = 'pioggia';
    const k = this.kind;
    const target = {
      cloud: k === 'sereno' ? 0 : k === 'nuvoloso' ? 0.55 : k === 'nebbia' ? 0.6 : 0.85,
      fog: k === 'nebbia' ? 1 : k === 'pioggia' ? 0.35 : k === 'neve' ? 0.45 : 0,
      wet: k === 'pioggia' ? 1 : 0
    };
    const ease = Math.min(1, dt * 0.7);
    this.cloud += (target.cloud - this.cloud) * ease;
    this.fog += (target.fog - this.fog) * ease;
    this.wet += (target.wet - this.wet) * ease;
    if (k === 'neve') this.snow = Math.min(1, this.snow + dtHours * 0.35);
    else this.snow = Math.max(0, this.snow - dtHours * (season === 'inverno' ? 0.05 : 0.6));

    this.rain.visible = k === 'pioggia';
    this.flakes.visible = k === 'neve';
    const half = this.box / 2;
    if (this.rain.visible) {
      const a = this.rain.geometry.getAttribute('position') as THREE.BufferAttribute;
      const p = a.array as Float32Array;
      for (let i = 0; i < this.count; i++) {
        const o = i * 6;
        let y = p[o + 1] - dt * 28;
        if (y < 0) y += 30;
        p[o + 1] = y;
        p[o + 4] = y - 0.9;
      }
      a.needsUpdate = true;
      this.rain.position.set(centre.x - 0, 0, centre.z);
    }
    if (this.flakes.visible) {
      const a = this.flakes.geometry.getAttribute('position') as THREE.BufferAttribute;
      const p = a.array as Float32Array;
      const t = performance.now() / 1000;
      for (let i = 0; i < this.count; i++) {
        const o = i * 3;
        p[o + 1] -= dt * 1.6;
        p[o] += Math.sin(t + i) * dt * 0.4;
        if (p[o + 1] < 0) {
          p[o + 1] += 30;
          p[o] = (Math.random() - 0.5) * this.box;
        }
        if (p[o] > half) p[o] -= this.box;
        if (p[o] < -half) p[o] += this.box;
      }
      a.needsUpdate = true;
      this.flakes.position.set(centre.x, 0, centre.z);
    }
  }
}
