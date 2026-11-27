import * as THREE from 'three';
import type { SceneManager } from './SceneManager';
import type { GameState } from '../game/GameState';
import type { Materials } from './ProceduralAssets';
import type { ZoneLight } from '../data/zones';

export interface LightPool {
  center: THREE.Vector3;
  radius: number;
  strength: number;
  active: boolean;
}

interface RoomLight {
  light: THREE.PointLight;
  bulb: THREE.Mesh;
  halo: THREE.Mesh;
  cone: THREE.Mesh;
  pool: LightPool;
  base: number;
  on: boolean;
  phase: number;
}

const VOL_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewPos = -mv.xyz;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

const VOL_FRAG = /* glsl */ `
uniform float uAlpha;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec2 vUv;
void main() {
  vec3 viewDir = normalize(vViewPos);
  float fresnel = pow(abs(dot(normalize(vNormal), viewDir)), 1.7);
  float fade = smoothstep(0.0, 0.85, vUv.y);
  gl_FragColor = vec4(1.0, 0.94, 0.82, uAlpha * fresnel * fade);
}
`;

export class LightingManager {
  private ambient: THREE.AmbientLight;
  private hemi: THREE.HemisphereLight;
  private moon: THREE.DirectionalLight;
  private lights: RoomLight[] = [];
  private flashlight: THREE.SpotLight;
  private beamMesh: THREE.Mesh;
  private beamMat: THREE.ShaderMaterial;
  private materials: Materials;
  blackout = false;
  safeZone = false;

  constructor(private sm: SceneManager, materials: Materials) {
    this.materials = materials;
    this.ambient = new THREE.AmbientLight(0x5a6b83, 0.38);
    this.sm.scene.add(this.ambient);
    this.hemi = new THREE.HemisphereLight(0x88a0bf, 0x1a1412, 0.36);
    this.sm.scene.add(this.hemi);
    this.moon = new THREE.DirectionalLight(0x9fb7d8, 0.42);
    this.moon.position.set(-8, 12, -5);
    this.sm.scene.add(this.moon);

    this.flashlight = new THREE.SpotLight(0xfff2d5, 0, 24, Math.PI / 6.8, 0.48, 1.15);
    this.flashlight.position.set(0.18, -0.12, 0);
    this.flashlight.target.position.set(0, -0.02, -1);
    this.sm.camera.add(this.flashlight);
    this.sm.camera.add(this.flashlight.target);
    this.sm.scene.add(this.sm.camera);

    const coneGeo = new THREE.CylinderGeometry(0.05, 1.45, 7.5, 20, 1, true);
    coneGeo.translate(0, -3.75, 0);
    coneGeo.rotateX(Math.PI / 2);
    this.beamMat = new THREE.ShaderMaterial({
      vertexShader: VOL_VERT,
      fragmentShader: VOL_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uAlpha: { value: 0 } },
    });
    this.beamMesh = new THREE.Mesh(coneGeo, this.beamMat);
    this.beamMesh.position.set(0.18, -0.14, -0.2);
    this.sm.camera.add(this.beamMesh);

    this.rebuild();
  }

  rebuild(zoneLights?: ZoneLight[], safe = false) {
    this.safeZone = safe;
    for (const l of this.lights) {
      this.sm.scene.remove(l.light, l.bulb, l.halo, l.cone);
      l.bulb.geometry.dispose();
      l.halo.geometry.dispose();
      l.cone.geometry.dispose();
      (l.bulb.material as THREE.Material).dispose();
      (l.halo.material as THREE.Material).dispose();
      (l.cone.material as THREE.Material).dispose();
    }
    this.lights = [];
    const list: ZoneLight[] = zoneLights?.length ? zoneLights : [
      { at: [-4.5, 2.5, -3], color: 0xffcf94, power: 2.5, radius: 5.5 },
      { at: [4.5, 2.5, -3], color: 0xffd7a4, power: 2.2, radius: 5.5 },
      { at: [-4.5, 2.5, 3], color: 0xffc98a, power: 2.1, radius: 5.0 },
      { at: [0, 2.6, 0], color: 0xffd9a8, power: 1.8, radius: 5.0 },
    ];
    for (const l of list) this.addLight(l.at[0], l.at[1], l.at[2], l.color, l.power, l.radius ?? 5.5);
  }

  private addLight(x: number, y: number, z: number, color: number, power: number, radius: number) {
    if (this.lights.length >= this.sm.maxLights) return;
    const light = new THREE.PointLight(color, power, radius * 2.0, 1.45);
    light.position.set(x, y, z);
    if (this.sm.renderer.shadowMap.enabled && this.lights.length < 2) {
      light.castShadow = true;
      light.shadow.mapSize.set(this.sm.shadowSize, this.sm.shadowSize);
      light.shadow.bias = -0.003;
    }
    this.sm.scene.add(light);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), this.materials.bulb.clone());
    bulb.position.set(x, y + 0.04, z);
    this.sm.scene.add(bulb);

    const haloMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.72, 24), haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.set(x, 0.04, z);
    this.sm.scene.add(halo);

    // Subtle downward volumetric haze cone under tall streetlamps
    const coneMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: y > 2.9 ? 0.045 : 0.02,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.16, radius * 0.55, y, 16, 1, true), coneMat);
    cone.position.set(x, y / 2, z);
    this.sm.scene.add(cone);

    this.lights.push({
      light, bulb, halo, cone, base: power, on: true, phase: Math.random() * 10,
      pool: { center: new THREE.Vector3(x, 0, z), radius, strength: 1, active: true },
    });
  }

  toggleRoom(near: THREE.Vector3): boolean {
    let best: RoomLight | null = null;
    let dist = 4.8;
    for (const l of this.lights) {
      const d = l.light.position.distanceTo(near);
      if (d < dist) { dist = d; best = l; }
    }
    if (!best) return false;
    best.on = !best.on;
    return best.on;
  }

  setBlackout(on: boolean) { this.blackout = on; }

  hasLightNear(p: THREE.Vector3): boolean {
    return this.getLightExposure(p) >= 0.45;
  }

  getLightExposure(p: THREE.Vector3): number {
    if (this.safeZone) return 1;
    if (this.blackout) return 0;
    let maxExp = 0;
    for (const l of this.lights) {
      if (!l.pool.active) continue;
      const d = Math.hypot(p.x - l.pool.center.x, p.z - l.pool.center.z);
      if (d < l.pool.radius) {
        const exp = 1 - (d / l.pool.radius) ** 1.6;
        if (exp > maxExp) maxExp = exp;
      }
    }
    return maxExp;
  }

  get activePools(): LightPool[] {
    return this.lights.filter((l) => l.pool.active).map((l) => l.pool);
  }

  update(dt: number, time: number, state: GameState) {
    const danger = state.threat / 100;
    const h = state.hour < 12 ? state.hour + 24 : state.hour;
    const duskBoost = h < 21 ? (1 - (h - 19.5) / 1.5) * 0.25 : 0;
    const dawnBoost = h > 28.5 ? ((h - 28.5) / 1.5) * 0.35 : 0;

    this.ambient.intensity = (0.38 + duskBoost + dawnBoost - danger * 0.16) * (this.blackout ? 0.35 : 1);
    this.hemi.intensity = (0.36 + duskBoost + dawnBoost - danger * 0.14) * (this.blackout ? 0.3 : 1);
    this.moon.intensity = 0.42 - danger * 0.12 + dawnBoost * 0.4;

    for (const l of this.lights) {
      const flicker = danger > 0.35 && Math.sin(time * 13 + l.phase) * Math.sin(time * 4.7 + l.phase) > 0.87 - danger * 0.2;
      const on = l.on && !this.blackout && !flicker;
      l.pool.active = on;
      l.light.intensity += ((on ? l.base : 0) - l.light.intensity) * Math.min(1, dt * 12);
      l.bulb.visible = on;
      l.halo.visible = on;
      l.cone.visible = on;
    }

    const wantFlash = state.flashlightOn && state.battery > 0;
    this.flashlight.intensity += ((wantFlash ? 3.9 : 0) - this.flashlight.intensity) * Math.min(1, dt * 10);
    this.beamMat.uniforms.uAlpha.value += ((wantFlash ? 0.085 : 0) - this.beamMat.uniforms.uAlpha.value) * Math.min(1, dt * 10);
    this.beamMesh.visible = this.beamMat.uniforms.uAlpha.value > 0.004;
  }
}
