/*
 * Weather and particles around the camera: rain, dust in the light, embers,
 * mist, fireflies, snow and the golden motes of the miracle. All of them move
 * in the vertex shader as a function of film time, so they are seekable too.
 */
import * as THREE from 'three';
import { hash } from '../util';
import { spotTexture } from './mats';
import type { Fx } from '../shots/types';

type Kind = keyof Fx;

interface Spec {
  count: number;
  color: string;
  size: number;
  /** Box around the camera the particles live in. */
  box: [number, number, number];
  /** Velocity (m/s) and how much they wander. */
  vel: [number, number, number];
  wander: number;
  additive: boolean;
  streak?: boolean;
  twinkle?: number;
}

const SPECS: Record<Kind, Spec> = {
  rain: { count: 2200, color: '#b8c8e8', size: 0.5, box: [24, 14, 24], vel: [-0.8, -15, 0.4], wander: 0, additive: true, streak: true },
  dust: { count: 500, color: '#ffe8c0', size: 0.05, box: [10, 6, 10], vel: [0.04, 0.02, 0.02], wander: 0.25, additive: true, twinkle: 0.5 },
  embers: { count: 220, color: '#ff8a30', size: 0.06, box: [8, 7, 8], vel: [0.1, 0.7, 0], wander: 0.4, additive: true, twinkle: 0.8 },
  mist: { count: 46, color: '#e8e0e8', size: 7, box: [50, 2.2, 50], vel: [0.25, 0, 0.05], wander: 0.6, additive: false },
  fireflies: { count: 120, color: '#d8ff90', size: 0.09, box: [24, 3, 24], vel: [0, 0, 0], wander: 0.9, additive: true, twinkle: 1 },
  snow: { count: 1600, color: '#ffffff', size: 0.07, box: [24, 12, 24], vel: [0.2, -0.9, 0], wander: 0.5, additive: false },
  grace: { count: 300, color: '#ffe6a0', size: 0.06, box: [10, 6, 10], vel: [0, 0.35, 0], wander: 0.5, additive: true, twinkle: 1 },
};

export class Particles {
  readonly object: THREE.Points;
  private material: THREE.ShaderMaterial;
  constructor(readonly kind: Kind) {
    const s = SPECS[kind];
    const seeds = new Float32Array(s.count * 3);
    for (let i = 0; i < s.count; i++) {
      seeds[i * 3] = hash(i * 3.1 + kind.length);
      seeds[i * 3 + 1] = hash(i * 7.7 + 1);
      seeds[i * 3 + 2] = hash(i * 1.9 + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(seeds, 3));
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: s.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      fog: false,
      uniforms: {
        time: { value: 0 },
        center: { value: new THREE.Vector3() },
        box: { value: new THREE.Vector3(...s.box) },
        vel: { value: new THREE.Vector3(...s.vel) },
        wander: { value: s.wander },
        size: { value: s.size },
        color: { value: new THREE.Color(s.color) },
        amount: { value: 1 },
        twinkle: { value: s.twinkle ?? 0 },
        streak: { value: s.streak ? 1 : kind === 'mist' ? -1 : 0 },
        scale: { value: 600 },
        map: { value: spotTexture() },
      },
      vertexShader: /* glsl */ `
        uniform float time; uniform vec3 center; uniform vec3 box; uniform vec3 vel; uniform float wander;
        uniform float size; uniform float scale; uniform float amount; uniform float twinkle;
        varying float vA;
        void main() {
          vec3 seed = position;
          vec3 p = seed * box + vel * time + wander * vec3(sin(time * 0.7 + seed.y * 40.0), sin(time * 0.5 + seed.z * 30.0), cos(time * 0.6 + seed.x * 50.0));
          /* Wrap the particle into the box around the camera. */
          vec3 rel = mod(p - center + box * 0.5, box) - box * 0.5;
          vec3 world = center + rel;
          vec4 mv = modelViewMatrix * vec4(world, 1.0);
          gl_Position = projectionMatrix * mv;
          float edge = 1.0 - smoothstep(0.35, 0.5, max(abs(rel.x) / box.x, max(abs(rel.y) / box.y, abs(rel.z) / box.z)));
          float tw = mix(1.0, 0.5 + 0.5 * sin(time * 3.0 + seed.x * 80.0), twinkle);
          vA = edge * tw * step(seed.z, amount);
          gl_PointSize = size * scale / max(0.1, -mv.z);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 color; uniform sampler2D map; uniform float streak;
        varying float vA;
        void main() {
          vec2 uv = gl_PointCoord;
          float a;
          if (streak > 0.5) {
            /* A thin falling streak, brighter at its head. */
            a = (1.0 - smoothstep(0.0, 0.05, abs(uv.x - 0.5))) * smoothstep(0.0, 0.9, uv.y) * 0.55;
          } else {
            a = texture2D(map, uv).a * (streak < -0.5 ? 0.32 : 1.0);
          }
          a *= vA;
          if (a < 0.01) discard;
          gl_FragColor = vec4(color, a);
        }`,
    });
    this.object = new THREE.Points(geo, this.material);
    this.object.frustumCulled = false;
    this.object.renderOrder = 5;
  }

  update(time: number, camera: THREE.Camera, amount: number, heightPx: number, around?: THREE.Vector3): void {
    const u = this.material.uniforms;
    u.time.value = time;
    u.amount.value = amount;
    u.scale.value = heightPx * 0.9;
    const s = SPECS[this.kind];
    const c = around ?? camera.position;
    u.center.value.set(c.x, this.kind === 'mist' ? s.box[1] / 2 - 0.2 : c.y, c.z);
    if (this.kind === 'mist') u.center.value.y = 0.9;
  }
}

const pool = new Map<Kind, Particles>();
export function particles(kind: Kind): Particles {
  let p = pool.get(kind);
  if (!p) {
    p = new Particles(kind);
    pool.set(kind, p);
  }
  return p;
}
