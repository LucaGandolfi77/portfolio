import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { BrickEngine } from './BrickEngine';
import type { SceneManager } from './SceneManager';

export type WeatherKind = 'clear' | 'rain' | 'snow' | 'embers';

interface WeatherDrop {
  x: number;
  y: number;
  z: number;
  speed: number;
  drift: number;
}

const DROP_COUNT = 96;

/**
 * 100% Brick-built weather particles (rain bricks, snow cubes, volcanic embers)
 * paired with a smooth Day / Sunset / Starry-Night lighting cycle.
 */
export class WeatherAndDayNight {
  private readonly instanced: THREE.InstancedMesh;
  private readonly drops: WeatherDrop[] = [];
  private readonly dummy = new THREE.Object3D();
  private weather: WeatherKind = 'clear';
  private timeOfDay = 0.22; // 0..1 (0.25 = noon, 0.52 = golden sunset, 0.78 = night)
  autoCycle = true;
  private baseSkyTop = new THREE.Color(0x3ba9d6);
  private baseSkyBottom = new THREE.Color(0xa8e6ff);
  private readonly nightColor = new THREE.Color(0x0b132b);
  private readonly sunsetColor = new THREE.Color(0xe76f51);
  private readonly tmpColor = new THREE.Color();

  constructor(scene: THREE.Scene, engine: BrickEngine) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    this.instanced = new THREE.InstancedMesh(engine.getBoxGeo(), mat, DROP_COUNT);
    this.instanced.frustumCulled = false;

    for (let i = 0; i < DROP_COUNT; i++) {
      this.drops.push({
        x: (Math.random() - 0.5) * 34,
        y: Math.random() * 18,
        z: (Math.random() - 0.5) * 34,
        speed: 6 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 1.4,
      });
    }
    scene.add(this.instanced);
  }

  setBiomeAtmosphere(weather: WeatherKind, skyTop: number, skyBottom: number): void {
    this.weather = weather;
    this.baseSkyTop.setHex(skyTop);
    this.baseSkyBottom.setHex(skyBottom);
    const col = new THREE.Color(
      weather === 'rain'
        ? BRICK_PALETTE.skyBlue
        : weather === 'snow'
          ? BRICK_PALETTE.snowWhite
          : weather === 'embers'
            ? BRICK_PALETTE.fireGlow
            : BRICK_PALETTE.brightYellow,
    );
    for (let i = 0; i < DROP_COUNT; i++) {
      this.instanced.setColorAt(i, col);
    }
    if (this.instanced.instanceColor) this.instanced.instanceColor.needsUpdate = true;
    this.instanced.visible = weather !== 'clear';
  }

  cycleTimePhase(): 'day' | 'sunset' | 'night' {
    this.autoCycle = false;
    if (this.timeOfDay < 0.4) {
      this.timeOfDay = 0.52;
      return 'sunset';
    }
    if (this.timeOfDay < 0.65) {
      this.timeOfDay = 0.82;
      return 'night';
    }
    this.timeOfDay = 0.22;
    this.autoCycle = true;
    return 'day';
  }

  getPhaseLabel(): '☀️' | '🌅' | '🌙' {
    if (this.timeOfDay >= 0.45 && this.timeOfDay < 0.66) return '🌅';
    if (this.timeOfDay >= 0.66 || this.timeOfDay < 0.08) return '🌙';
    return '☀️';
  }

  update(dt: number, sceneManager: SceneManager): void {
    if (this.autoCycle) {
      this.timeOfDay = (this.timeOfDay + dt * 0.008) % 1;
    }

    // Compute Day -> Sunset -> Night tint
    const sunAngle = this.timeOfDay * Math.PI * 2;
    const dayFactor = Math.max(0, Math.sin(sunAngle)); // 1 at noon, 0 at night
    const sunsetFactor = Math.max(0, 1 - Math.abs(this.timeOfDay - 0.5) * 9);

    sceneManager.sunLight.intensity = 0.45 + dayFactor * 1.65;
    sceneManager.hemiLight.intensity = 0.4 + dayFactor * 0.6;
    sceneManager.sunLight.position.set(Math.cos(sunAngle) * 22, 10 + dayFactor * 20, 14);

    this.tmpColor.copy(this.nightColor).lerp(this.baseSkyTop, dayFactor);
    if (sunsetFactor > 0.05) {
      this.tmpColor.lerp(this.sunsetColor, sunsetFactor * 0.65);
    }
    (sceneManager.scene.background as THREE.Color).copy(this.tmpColor);
    if (sceneManager.scene.fog instanceof THREE.FogExp2) {
      sceneManager.scene.fog.color.copy(this.tmpColor).lerp(this.baseSkyBottom, 0.25);
    }

    if (this.weather === 'clear') return;

    const isEmber = this.weather === 'embers';
    for (let i = 0; i < DROP_COUNT; i++) {
      const d = this.drops[i];
      if (isEmber) {
        d.y += d.speed * 0.35 * dt;
        d.x += Math.sin(d.y * 0.6) * dt * 1.2;
        if (d.y > 16) d.y = 0.3;
      } else {
        const speedMult = this.weather === 'rain' ? 1.8 : 0.42;
        d.y -= d.speed * speedMult * dt;
        d.x += d.drift * dt;
        if (d.y < 0.1) {
          d.y = 16 + Math.random() * 4;
          d.x = (Math.random() - 0.5) * 34;
          d.z = (Math.random() - 0.5) * 34;
        }
      }
      this.dummy.position.set(d.x, d.y, d.z);
      if (this.weather === 'rain') {
        this.dummy.scale.set(0.08, 0.55, 0.08);
      } else {
        this.dummy.scale.setScalar(0.18);
      }
      this.dummy.updateMatrix();
      this.instanced.setMatrixAt(i, this.dummy.matrix);
    }
    this.instanced.instanceMatrix.needsUpdate = true;
  }
}
