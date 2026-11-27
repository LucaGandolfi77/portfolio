/*
 * The sets of the film, each a Three.js scene with its own sky, fog, light
 * and living details (fires, water, banners). Built on first use and kept.
 * Coordinates are documented per set: the shots in shots/ rely on them.
 */
import * as THREE from 'three';
import { hash } from '../util';
import { CAST } from './cast';
import {
  STUFF, add, amphora, archShape, archWall, barrel, bed, bench, box, brazier, cathedral, chest, column, cyl, flame, flicker,
  ground, house, milestone, poplar, rocks, romanBridge, roof, scaffold, shade, skyDome, sphere, stairs, statue, streetLamp,
  table, tree, wallTorch, water, type Flame, type SkyColors, type Water,
} from './kit';
import { kitMesh } from './assets';
import { glowMat, glowSprite, mat } from './mats';

export type SetName =
  | 'piazza' | 'milan' | 'treasury' | 'bedchamber' | 'hall' | 'prison' | 'postern' | 'road' | 'innExterior' | 'innInterior'
  | 'cellar' | 'crossroad' | 'plain' | 'farm' | 'farmRoom' | 'stirone' | 'medieval' | 'workshop';

export type Sky = 'day' | 'golden' | 'sunset' | 'dusk' | 'night' | 'dawn';

export interface SetOptions {
  sky?: Sky;
  /** The altar of Hercules in the hall. */
  altar?: boolean;
  /** The tomb by the river. */
  tomb?: boolean;
  /** Fewer courtiers (an empty hall). */
  empty?: boolean;
  /** 0..1 how much of the cathedral is built. */
  built?: number;
  /** A body under a red cloak on the river bank. */
  shroud?: boolean;
}

export interface SetInstance {
  scene: THREE.Scene;
  props: Record<string, THREE.Object3D>;
  update(time: number): void;
  bloom: number;
  exposure: number;
}

interface Preset {
  sky: SkyColors;
  fog: string;
  fogDensity: number;
  sunColor: string;
  sun: number;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  exposure: number;
  bloom: number;
}

const v = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z).normalize();

const PRESETS: Record<Sky, Preset> = {
  day: { sky: { top: '#3f6fb0', horizon: '#cfdcea', bottom: '#8a8878', sun: '#fff2d8', dir: v(0.5, 0.75, 0.3), stars: 0, sunSize: 1 }, fog: '#c4d0dc', fogDensity: 0.006, sunColor: '#fff0d8', sun: 3.2, hemiSky: '#b8d0f0', hemiGround: '#7a6a4a', hemi: 1.1, exposure: 0.95, bloom: 0.25 },
  golden: { sky: { top: '#4a64a0', horizon: '#f2c890', bottom: '#8a7058', sun: '#ffd8a0', dir: v(-0.6, 0.32, 0.4), stars: 0, sunSize: 1.4 }, fog: '#e0c8a8', fogDensity: 0.008, sunColor: '#ffd29a', sun: 3, hemiSky: '#c8c8e0', hemiGround: '#8a6a48', hemi: 0.9, exposure: 1, bloom: 0.35 },
  sunset: { sky: { top: '#2a2c5c', horizon: '#ff8a48', bottom: '#5a3428', sun: '#ffa060', dir: v(-0.85, 0.1, -0.5), stars: 0, sunSize: 2.4 }, fog: '#c07850', fogDensity: 0.012, sunColor: '#ff9a58', sun: 3.2, hemiSky: '#8a70a8', hemiGround: '#6a3a24', hemi: 0.7, exposure: 1.05, bloom: 0.55 },
  dusk: { sky: { top: '#141a3a', horizon: '#9a5a68', bottom: '#2a1e24', sun: '#d080a0', dir: v(-0.8, 0.05, -0.6), stars: 0.4, sunSize: 0 }, fog: '#4a3448', fogDensity: 0.014, sunColor: '#c890b8', sun: 0.8, hemiSky: '#5a5a90', hemiGround: '#2a1a1a', hemi: 0.55, exposure: 1.15, bloom: 0.6 },
  night: { sky: { top: '#03060f', horizon: '#18223a', bottom: '#06080c', sun: '#a0b8f0', dir: v(0.4, 0.55, -0.7), stars: 1, sunSize: 0.9 }, fog: '#0a1222', fogDensity: 0.022, sunColor: '#8aa8e8', sun: 0.9, hemiSky: '#3a4a7a', hemiGround: '#0a0a10', hemi: 0.4, exposure: 1.3, bloom: 0.8 },
  dawn: { sky: { top: '#2a3a6a', horizon: '#f4b8a0', bottom: '#5a5060', sun: '#ffd8b8', dir: v(0.9, 0.08, -0.4), stars: 0.15, sunSize: 1.6 }, fog: '#c8b0b8', fogDensity: 0.02, sunColor: '#ffc8a8', sun: 2.2, hemiSky: '#a8a8d0', hemiGround: '#5a4a48', hemi: 0.8, exposure: 1.05, bloom: 0.5 },
};

interface Ctx {
  scene: THREE.Scene;
  props: Record<string, THREE.Object3D>;
  flames: Flame[];
  waters: Water[];
  tickers: Array<(t: number) => void>;
  sky?: THREE.Mesh;
  bloom: number;
  exposure: number;
}

/** Sky, fog and the light of the sun (or the moon) with its shadows. */
function outdoors(c: Ctx, sky: Sky, shadow = 30, at = new THREE.Vector3()): THREE.DirectionalLight {
  const p = PRESETS[sky];
  const dome = skyDome(p.sky);
  c.scene.add(dome);
  c.sky = dome;
  c.scene.fog = new THREE.FogExp2(p.fog, p.fogDensity);
  c.scene.add(new THREE.HemisphereLight(p.hemiSky, p.hemiGround, p.hemi));
  const sun = new THREE.DirectionalLight(p.sunColor, p.sun);
  sun.position.copy(p.sky.dir).multiplyScalar(60).add(at);
  sun.target.position.copy(at);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = cam.bottom = -shadow;
  cam.right = cam.top = shadow;
  cam.near = 1;
  cam.far = 160;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  c.scene.add(sun, sun.target);
  c.bloom = p.bloom;
  c.exposure = p.exposure;
  return sun;
}

/** An interior: dark fog, a dim fill, and a key light through a window. */
function indoors(c: Ctx, fog: string, fill: [string, string, number], key?: { color: string; intensity: number; from: [number, number, number]; to?: [number, number, number]; size?: number }): void {
  c.scene.background = new THREE.Color(fog);
  c.scene.fog = new THREE.FogExp2(fog, 0.045);
  c.scene.add(new THREE.HemisphereLight(fill[0], fill[1], fill[2] * 2.2 + 0.25));
  c.scene.add(new THREE.AmbientLight(fill[0], 0.18));
  if (key) {
    const l = new THREE.DirectionalLight(key.color, key.intensity);
    l.position.set(...key.from);
    l.target.position.set(...(key.to ?? [0, 0, 0]));
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    const s = key.size ?? 10;
    Object.assign(l.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.5, far: 60 });
    l.shadow.bias = -0.0005;
    l.shadow.normalBias = 0.03;
    c.scene.add(l, l.target);
  }
  c.bloom = 0.42;
  c.exposure = 1.25;
}

/** A visible beam of light (dust in a sunbeam, moonlight through bars). */
function shaft(c: Ctx, from: [number, number, number], to: [number, number, number], width: number, color: string, opacity: number): THREE.Mesh {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(width * 0.5, width * 1.1, len, 16, 1, true);
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
    uniforms: { color: { value: new THREE.Color(color) }, opacity: { value: opacity }, time: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 color; uniform float opacity; uniform float time; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ float edge = pow(abs(dot(vN, vV)), 1.5); float fade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.6, vUv.y);
        float dust = 0.85 + 0.15 * sin(vUv.y * 40.0 + time * 0.7) * sin(vUv.x * 30.0 - time * 0.4);
        gl_FragColor = vec4(color * opacity * edge * fade * dust, 1.0); }`,
  });
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), b.clone().sub(a).normalize());
  c.scene.add(mesh);
  c.tickers.push((t) => (m.uniforms.time.value = t));
  return mesh;
}

/** Some faces in the background: courtiers, soldiers, townsfolk standing still. */
import { Figure } from './figure';
function extras(c: Ctx, who: Array<keyof typeof CAST>, spots: Array<[number, number, number]>, seed: number, pose: 'stand' | 'guard' | 'pray' = 'stand', item: 'spear' | null = null): void {
  spots.forEach(([x, z, rot], i) => {
    const id = who[i % who.length];
    const f = new Figure(CAST[id]);
    const s = seed + i * 7;
    f.apply({ pose, from: pose, blend: 1, walk: 0, phase: 0, speaking: false, time: s, mood: 'calm', lookYaw: (hash(s) - 0.5) * 0.6, lookPitch: 0, item, glow: 0, seed: s });
    f.root.position.set(x, 0, z);
    f.root.rotation.y = (rot * Math.PI) / 180;
    c.scene.add(f.root);
    c.tickers.push((t) => {
      f.apply({ pose, from: pose, blend: 1, walk: 0, phase: 0, speaking: false, time: t + s, mood: 'calm', lookYaw: Math.sin(t * 0.13 + s) * 0.3, lookPitch: 0, item, glow: 0, seed: s });
    });
  });
}

function banner(c: Ctx, color: string, pos: [number, number, number], w = 1.6, h = 4.5, rotY = 0): void {
  const geo = new THREE.PlaneGeometry(w, h, 6, 12);
  const m = mat({ color, rough: 0.9, bump: 'cloth', bumpScale: 0.5, repeat: 2, side: THREE.DoubleSide });
  const mesh = shade(new THREE.Mesh(geo, m));
  mesh.position.set(...pos);
  mesh.rotation.y = rotY;
  c.scene.add(mesh);
  /* A golden eagle-like emblem: a ring and a bar. */
  const emblem = new THREE.Mesh(new THREE.TorusGeometry(w * 0.22, w * 0.03, 8, 24), STUFF.gold());
  emblem.position.set(0, h * 0.18, 0.02);
  mesh.add(emblem);
  const base = geo.attributes.position.array.slice() as Float32Array;
  c.tickers.push((t) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const y = base[i * 3 + 1];
      const x = base[i * 3];
      const k = (h / 2 - y) / h;
      p.setZ(i, Math.sin(t * 1.3 + y * 1.2 + x * 2) * 0.06 * k);
    }
    p.needsUpdate = true;
  });
  const rod = cyl(0.03, 0.03, w + 0.3, STUFF.gold(), 8);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(pos[0], pos[1] + h / 2, pos[2]);
  rod.rotation.y = rotY;
  c.scene.add(rod);
}

/* ---------------- The sets ---------------- */

/**
 * The imperial hall in Milan. Long axis z; the throne at (0, -12) on steps
 * 1 m high (seat y ≈ 1.5), apse behind it. Columns at x = ±4.
 * The altar of Hercules (opt.altar) at (3.2, -6.5). Courtiers line the aisles.
 */
function hall(c: Ctx, o: SetOptions): void {
  const dusk = o.sky === 'dusk';
  indoors(c, dusk ? '#1a1018' : '#2a1e18', [dusk ? '#6a5a8a' : '#d8c0a0', '#3a2418', dusk ? 0.45 : 0.6], {
    color: dusk ? '#ff9a68' : '#ffe0b0', intensity: dusk ? 2.2 : 3.2, from: [-14, 16, 6], to: [0, 0, -4], size: 16,
  });
  c.bloom = 0.4;
  c.exposure = 1.2;
  const floor = ground(16, 40, STUFF.floorMosaic(), 4);
  add(c.scene, floor, [0, 0, -4]);
  /* Walls with high windows. */
  for (const s of [1, -1]) {
    add(c.scene, box(0.6, 12, 34, STUFF.marbleWarm(), 3), [s * 7.3, 6, -2]);
    for (let z = -10; z <= 8; z += 4.5) {
      const win = add(c.scene, archShape(1.4, 3, glowMat(dusk ? '#ffa070' : '#fff0d0', 0.9, false)), [s * 6.98, 6.5, z], [0, -s * Math.PI / 2, 0]);
      win.renderOrder = 1;
    }
  }
  add(c.scene, box(16, 12, 0.6, STUFF.marbleWarm(), 3), [0, 6, 15]);
  add(c.scene, box(16, 0.5, 34, STUFF.woodDark(), 2), [0, 12.2, -2]);
  /* Coffered ceiling beams. */
  for (let z = -18; z < 15; z += 2.5) add(c.scene, box(15, 0.5, 0.35, STUFF.gold(), 2), [0, 11.8, z]);
  /* Columns of porphyry with white capitals. */
  for (const s of [1, -1]) for (let z = -9; z <= 12; z += 3.5) add(c.scene, column(9, 0.42, STUFF.porphyry(), STUFF.marble()), [s * 4.2, 0, z]);
  for (const s of [1, -1]) add(c.scene, box(0.9, 1.0, 34, STUFF.marble(), 3), [s * 4.2, 9.4, -2]);
  /* Apse with a gold mosaic. */
  const apse = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 11, 32, 1, true, Math.PI / 2, Math.PI), STUFF.mosaicGold());
  (apse.material as THREE.Material).side = THREE.DoubleSide;
  apse.position.set(0, 5.5, -15.4);
  apse.receiveShadow = true;
  c.scene.add(apse);
  /* The back wall opens onto the apse. */
  for (const sx of [1, -1]) add(c.scene, box(2.2, 12, 0.6, STUFF.marbleWarm(), 3), [sx * 6.6, 6, -15.4]);
  add(c.scene, box(16, 1.2, 0.6, STUFF.marbleWarm(), 3), [0, 11.6, -15.4]);
  add(c.scene, archWall(11.4, 11, 0.8, 11, 5.5, STUFF.marble()), [0, 0, -15.3]);
  /* A Chi-less imperial sun disc in the apse. */
  add(c.scene, new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), STUFF.gold()), [0, 7.5, -20.7]);
  const sunHalo = glowSprite('#ffd890', 7, 0.35);
  add(c.scene, sunHalo, [0, 7.5, -20.4]);
  /* Steps and throne. */
  const steps = stairs(4, 7, 0.25, 0.6, STUFF.marble());
  add(c.scene, steps, [0, 0, -10.2]);
  add(c.scene, box(7, 1, 6, STUFF.marble()), [0, 0.5, -14.6]);
  const th = add(c.scene, shade(throneGroup()), [0, 1.0, -12.4]);
  c.props.throne = th;
  for (const s of [1, -1]) banner(c, '#6a1a6a', [s * 2.8, 6.2, -14.6], 1.6, 5);
  const brazierFlames: Flame[] = [];
  for (const s of [1, -1]) add(c.scene, brazier(brazierFlames, 7, s), [s * 2.6, 1.0, -11.6]);
  for (const s of [1, -1]) add(c.scene, brazier(brazierFlames, 4, s + 3), [s * 3.2, 0, 4]);
  c.flames.push(...brazierFlames);
  if (o.altar) {
    const altar = new THREE.Group();
    add(altar, box(1.4, 1.1, 0.9, STUFF.marble()), [0, 0.55, 0]);
    add(altar, box(1.6, 0.12, 1.1, STUFF.gold()), [0, 1.16, 0]);
    const f = flame(0.32, 4, '#ffb060', 9);
    add(altar, f.group, [0, 1.25, 0]);
    c.flames.push(f);
    const herc = statue('legionary', 'raise', { scale: 1.25 });
    add(altar, herc.group, [0, 0, -1.6]);
    add(altar, box(1.2, 0.6, 1.2, STUFF.marble()), [0, 0.3, -1.6]);
    herc.figure.root.position.y = 0.6;
    add(c.scene, altar, [3.2, 0, -6.5], [0, -0.5, 0]);
    c.props.altar = altar;
  }
  shaft(c, [-7, 8, -4], [-1, 0, -6], 1.8, dusk ? '#ffa070' : '#ffe8c0', dusk ? 0.12 : 0.1);
  shaft(c, [-7, 8, 2], [-1, 0, 0.5], 1.8, dusk ? '#ffa070' : '#ffe8c0', dusk ? 0.12 : 0.1);
  if (!o.empty) {
    extras(c, ['courtier', 'lady', 'courtier2', 'courtier'], [[-2.8, -4, 70], [-3.0, -1.6, 80], [-2.6, 1.0, 95], [2.9, -2.8, -80], [2.7, 0, -90], [3.0, 2.4, -100], [-2.6, 3.6, 110]], 11);
  }
  extras(c, ['guard'], [[-1.9, -10.6, 15], [1.9, -10.6, -15], [-3.6, 7, 180], [3.6, 7, 180]], 21, 'guard', 'spear');
}

function throneGroup(): THREE.Group {
  const g = new THREE.Group();
  const gold = STUFF.gold();
  const red = STUFF.cloth('#7a1028');
  const carved = kitMesh('throne_gold', gold);
  const cushions = kitMesh('throne_cloth', red);
  if (carved && cushions) {
    /* The carved throne from the Blender kit, a little grander than the treasury's. */
    g.add(carved, cushions);
    g.scale.setScalar(1.1);
    return g;
  }
  add(g, box(1.2, 0.55, 0.85, gold), [0, 0.27, 0]);
  add(g, box(1.05, 0.14, 0.75, red), [0, 0.6, 0.02]);
  add(g, box(1.2, 1.9, 0.16, gold), [0, 1.2, -0.38]);
  add(g, box(0.9, 1.45, 0.05, red), [0, 1.18, -0.29]);
  add(g, sphere(0.13, gold), [0, 2.25, -0.38]);
  for (const s of [1, -1]) {
    add(g, box(0.13, 0.38, 0.8, gold), [0.56 * s, 0.74, 0]);
    add(g, sphere(0.09, gold), [0.56 * s, 0.97, 0.36]);
  }
  return g;
}

/** The treasury: a small vaulted room. The crown on a cushion at (0, 1.05, 0). */
function treasury(c: Ctx): void {
  indoors(c, '#1a120c', ['#c8a070', '#2a1a10', 0.5], { color: '#ffd8a0', intensity: 2.6, from: [6, 9, -2], to: [0, 0, 0], size: 6 });
  add(c.scene, ground(10, 10, STUFF.floorMosaic(), 3));
  for (const [x, z, r] of [[0, -4, 0], [-4, 0, Math.PI / 2], [4, 0, -Math.PI / 2]] as const) add(c.scene, box(10, 6, 0.4, STUFF.marbleWarm(), 3), [x, 3, z], [0, r, 0]);
  add(c.scene, archShape(1.1, 2, glowMat('#fff0c8', 0.9, false)), [3.78, 2.6, -1.4], [0, -Math.PI / 2, 0]);
  shaft(c, [3.8, 3.2, -1.4], [0.2, 0, -0.2], 1.2, '#ffe0b0', 0.14);
  const ped = new THREE.Group();
  add(ped, column(0.9, 0.22, STUFF.porphyry(), STUFF.marble()));
  add(ped, box(0.7, 0.08, 0.7, STUFF.cloth('#7a1028')), [0, 0.95, 0]);
  add(c.scene, ped);
  const crown = add(c.scene, crownMesh(), [0, 1.03, 0]);
  c.props.crown = crown;
  for (let i = 0; i < 3; i++) add(c.scene, chest(), [-2.6 + i * 1.3, 0, -3.3]);
  for (let i = 0; i < 4; i++) add(c.scene, amphora(i % 2 ? STUFF.bronze() : undefined), [-3.4, 0, -1.6 + i * 0.7]);
  const lamps: Flame[] = [];
  for (const s of [1, -1]) {
    const f = flame(0.16, 2.5, '#ffb060', s * 4);
    add(c.scene, cyl(0.04, 0.12, 1.5, STUFF.bronze(), 10), [s * 1.6, 0.75, -2.4]);
    add(c.scene, f.group, [s * 1.6, 1.55, -2.4]);
    lamps.push(f);
  }
  c.flames.push(...lamps);
}

export function crownMesh(): THREE.Group {
  const g = new THREE.Group();
  const gold = STUFF.gold();
  add(g, cyl(0.12, 0.12, 0.07, gold, 32), [0, 0.035, 0]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    add(g, shade(new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 8), gold)), [Math.cos(a) * 0.115, 0.1, Math.sin(a) * 0.115]);
    add(g, sphere(0.014, mat({ color: i % 2 ? '#c81838' : '#1840c8', rough: 0.05, metal: 0.3, emissive: i % 2 ? '#400008' : '#000840' }), 8), [Math.cos(a) * 0.123, 0.035, Math.sin(a) * 0.123]);
  }
  const shine = glowSprite('#ffe8b0', 0.5, 0.35);
  add(g, shine, [0, 0.06, 0]);
  return g;
}

/** The emperor's bedroom at night: the bed at (-1.6, -2), the door at (3, 3), moon window on x = +4. */
function bedchamber(c: Ctx): void {
  indoors(c, '#06070e', ['#4a5a8a', '#120c10', 0.35], { color: '#8aa8e8', intensity: 1.8, from: [8, 7, -2], to: [-1.5, 0, -2], size: 7 });
  c.exposure = 1.25;
  add(c.scene, ground(10, 10, STUFF.floorMosaic(), 3));
  for (const [x, z, r] of [[0, -4.5, 0], [-4.5, 0, Math.PI / 2], [4.5, 0, -Math.PI / 2], [0, 4.5, Math.PI]] as const) add(c.scene, box(10, 6, 0.4, STUFF.plaster(), 3), [x, 3, z], [0, r, 0]);
  add(c.scene, archShape(1.2, 2.2, glowMat('#9ab8ff', 0.6, false)), [4.28, 2, -2], [0, -Math.PI / 2, 0]);
  shaft(c, [4.3, 2.8, -2], [-0.8, 0, -2], 1.3, '#8ab0ff', 0.16);
  const b = add(c.scene, bed(1.8, 2.4, '#e8e0d0', '#5a1a5a'), [-1.6, 0, -2]);
  /* Canopy. */
  for (const x of [-0.85, 0.85]) for (const z of [-1.15, 1.15]) add(b, cyl(0.04, 0.04, 2.4, STUFF.gold(), 8), [x, 1.2, z]);
  add(b, box(1.9, 0.08, 2.5, STUFF.cloth('#4a1450')), [0, 2.4, 0]);
  add(c.scene, archShape(1.1, 2.2, STUFF.dark()), [3, 0, 4.28], [0, Math.PI, 0]);
  const f = flame(0.12, 2.2, '#ffb060', 3);
  add(c.scene, cyl(0.03, 0.1, 1.2, STUFF.bronze(), 10), [0.4, 0.6, -3.4]);
  add(c.scene, f.group, [0.4, 1.25, -3.4]);
  c.flames.push(f);
  add(c.scene, chest(), [-3.6, 0, 1.5], [0, Math.PI / 2, 0]);
}

/** The prison: a vault, barred window on the back wall (z = -3), prisoners along it. */
function prison(c: Ctx, o: SetOptions): void {
  const dawn = o.sky === 'dawn';
  indoors(c, '#05060a', ['#40506a', '#0a0806', 0.3], { color: dawn ? '#ffc8a0' : '#9ab0e8', intensity: dawn ? 2.4 : 1.8, from: [1.5, 7, -9], to: [0.6, 0, 0], size: 6 });
  c.exposure = 1.3;
  add(c.scene, ground(10, 8, STUFF.earth(), 3));
  for (let i = 0; i < 14; i++) add(c.scene, box(0.5 + hash(i) * 0.5, 0.06, 0.4, STUFF.straw(), 1), [(hash(i * 3) - 0.5) * 6, 0.03, (hash(i * 5) - 0.5) * 3 - 0.8], [0, hash(i) * 3, 0]);
  add(c.scene, box(10, 5, 0.6, STUFF.stoneDark(), 2), [0, 2.5, -3.3]);
  for (const s of [1, -1]) add(c.scene, box(0.6, 5, 8, STUFF.stoneDark(), 2), [s * 4.6, 2.5, 0.5]);
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 8, 24, 1, true, -Math.PI / 2, Math.PI), STUFF.stoneDark());
  (vault.material as THREE.Material).side = THREE.DoubleSide;
  vault.rotation.set(Math.PI / 2, 0, 0);
  vault.position.set(0, 4.6, 0.5);
  vault.scale.set(1, 1, 0.45);
  vault.receiveShadow = true;
  c.scene.add(vault);
  /* The window: a hole of light with iron bars. */
  add(c.scene, box(1.1, 0.8, 0.1, glowMat(dawn ? '#ffd0b0' : '#a8c0ff', 0.75, false)), [1.2, 3.6, -2.98]);
  for (let i = -2; i <= 2; i++) add(c.scene, cyl(0.025, 0.025, 0.85, STUFF.iron(), 6), [1.2 + i * 0.2, 3.6, -2.92]);
  shaft(c, [1.2, 3.6, -2.9], [0.4, 0, 0.6], 1.0, dawn ? '#ffc8a0' : '#8aa8ff', 0.22);
  for (const x of [-3.2, 3.6]) {
    add(c.scene, sphere(0.06, STUFF.iron(), 8), [x, 1.6, -2.95]);
    for (let k = 0; k < 6; k++) add(c.scene, shade(new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), STUFF.iron())), [x, 1.5 - k * 0.08, -2.95], [0, k % 2 ? Math.PI / 2 : 0, 0]);
  }
  const torch = wallTorch(c.flames, 3.5, 5);
  add(c.scene, torch, [-4.25, 2, 1.5], [0, Math.PI / 2, 0]);
  extras(c, ['prisoner', 'faithfulA', 'faithfulB'], [[-2.4, -1.9, 20], [-1.3, -2.4, 10], [2.7, -2.0, -30]], 31, 'pray');
}

/** Behind the palace at night: the wall along z = -3 with a small door at x = 0, a torch, cypresses. */
function postern(c: Ctx): void {
  outdoors(c, 'night', 18);
  add(c.scene, ground(60, 60, STUFF.cobble(), 2));
  add(c.scene, box(30, 9, 1.2, STUFF.brick(), 3), [0, 4.5, -3.6]);
  add(c.scene, archShape(1.2, 2.3, mat({ color: '#2a1a10', rough: 0.8, map: 'wood' })), [0, 0, -2.98]);
  add(c.scene, archWall(1.8, 2.8, 0.3, 1.2, 1.7, STUFF.stone()), [0, 0, -2.9]);
  add(c.scene, wallTorch(c.flames, 5, 3), [1.3, 2.2, -3.0]);
  for (let i = 0; i < 5; i++) add(c.scene, poplar(7 + hash(i) * 2, i, '#1a2a1a'), [-12 + i * 6 + hash(i) * 2, 0, 8 + hash(i * 2) * 4]);
  add(c.scene, house(8, 6, 10, 2, 0.3), [-12, 0, -8]);
}

/** The road at night in the rain: along z towards the inn at (3, -45). */
function road(c: Ctx): void {
  outdoors(c, 'night', 30);
  c.scene.fog = new THREE.FogExp2('#0a1020', 0.04);
  add(c.scene, ground(80, 160, mat({ color: '#6a6a7a', rough: 0.6, map: 'earth' }), 3), [0, 0, -40]);
  add(c.scene, ground(4, 160, mat({ color: '#8a8a9a', rough: 0.25, metal: 0.1, map: 'cobble' }), 2), [0, 0.01, -40]);
  for (let z = 20; z > -100; z -= 9) for (const s of [1, -1]) add(c.scene, tree(1.4 + hash(z) * 0.6, z * s, '#141e18'), [s * (5 + hash(z * s) * 3), 0, z]);
  const inn = add(c.scene, house(7, 6, 4.5, 9, 1, STUFF.plaster()), [4, 0, -45]);
  inn.rotation.y = -0.4;
  const lamp = flame(0.15, 4, '#ffb060', 1);
  add(c.scene, lamp.group, [1.6, 2.2, -42]);
  c.flames.push(lamp);
}

/** The inn from outside: house at (0, -3) with its door at (0.8, 0); the road along x at z = 3. */
function innExterior(c: Ctx, o: SetOptions): void {
  const sky = o.sky ?? 'night';
  outdoors(c, sky, 20);
  if (sky === 'night') c.scene.fog = new THREE.FogExp2('#0a1020', 0.035);
  add(c.scene, ground(80, 80, STUFF.earth(), 3));
  add(c.scene, ground(80, 4, STUFF.cobble(), 2), [0, 0.01, 3.5]);
  const h = add(c.scene, house(8, 6, 4.4, 4, sky === 'night' ? 1 : 0, STUFF.plaster()), [0, 0, -3]);
  add(h, archShape(1.1, 2.1, sky === 'night' ? glowMat('#ffa850', 0.8, false) : STUFF.dark()), [0.8, 0, 3.02]);
  add(c.scene, box(3, 0.12, 1.4, STUFF.woodDark(), 1), [0.8, 2.5, 0.6]);
  const lamp = flame(0.15, 4.5, '#ffb060', 2);
  add(c.scene, lamp.group, [2.0, 2.2, 0.15]);
  c.flames.push(lamp);
  for (let i = 0; i < 6; i++) add(c.scene, tree(1.6 + hash(i) * 0.6, i, sky === 'night' ? '#141e18' : '#4a5a2a'), [-16 + i * 7, 0, -9 - hash(i) * 4]);
  add(c.scene, barrel(), [-3, 0, 0.6]);
  add(c.scene, barrel(), [-3.8, 0, 0.3]);
}

/**
 * Inside the inn: the hearth at (0, -3.2), the carved beam across at y = 2.6
 * with the fish at x = -1, two tables, the cellar trapdoor at (2.6, -1).
 */
function innInterior(c: Ctx, o: SetOptions): void {
  const dawn = o.sky === 'dawn';
  indoors(c, '#140c08', ['#c89060', '#2a1810', dawn ? 0.7 : 0.4], dawn ? { color: '#ffd8b0', intensity: 2.4, from: [8, 5, 4], to: [0, 0, 0], size: 6 } : undefined);
  add(c.scene, ground(10, 9, mat({ color: '#9a8070', rough: 0.9, map: 'stone' }), 2));
  for (const [x, z, r] of [[0, -4, 0], [-4.5, 0, Math.PI / 2], [4.5, 0, -Math.PI / 2], [0, 4.2, Math.PI]] as const) add(c.scene, box(10, 4, 0.4, STUFF.plaster(), 2), [x, 2, z], [0, r, 0]);
  add(c.scene, box(10, 0.3, 9, STUFF.woodDark(), 2), [0, 3.6, 0]);
  /* The hearth. */
  add(c.scene, box(2.4, 0.4, 1.2, STUFF.stoneDark()), [0, 0.2, -3.3]);
  add(c.scene, box(2.6, 2.2, 0.3, STUFF.stoneDark()), [0, 2.5, -3.6]);
  const fire = flame(0.5, 8, '#ff9a40', 7);
  add(c.scene, fire.group, [0, 0.4, -3.2]);
  c.flames.push(fire);
  for (let i = 0; i < 4; i++) add(c.scene, cyl(0.06, 0.06, 0.8, STUFF.woodDark(), 6), [(i - 1.5) * 0.25, 0.48, -3.2], [0, i, Math.PI / 2]);
  /* The beam with the carved fish. */
  add(c.scene, box(9, 0.3, 0.3, STUFF.woodDark(), 1), [0, 2.6, -0.6]);
  const fish = new THREE.Shape();
  fish.moveTo(-0.3, 0);
  fish.quadraticCurveTo(0, 0.17, 0.25, 0);
  fish.lineTo(0.38, 0.12);
  fish.lineTo(0.38, -0.12);
  fish.lineTo(0.25, 0);
  fish.quadraticCurveTo(0, -0.17, -0.3, 0);
  const fishMesh = add(c.scene, new THREE.Mesh(new THREE.ExtrudeGeometry(fish, { depth: 0.03, bevelEnabled: false }), mat({ color: '#d8b070', rough: 0.7 })), [-1, 2.6, -0.43]);
  c.props.fish = fishMesh;
  add(c.scene, table(1.8, 0.9), [-2, 0, 0.8]);
  add(c.scene, bench(1.6), [-2, 0, 1.6]);
  add(c.scene, table(1.4, 0.8), [2, 0, 1.5]);
  add(c.scene, bench(1.2), [2, 0, 2.3]);
  add(c.scene, amphora(), [-3.8, 0, -3.2]);
  add(c.scene, amphora(), [-3.4, 0, -3.5]);
  add(c.scene, box(1, 0.04, 1, STUFF.woodDark(), 1), [2.6, 0.02, -1]);
  const lamp = flame(0.1, 1.5, '#ffb060', 3);
  add(c.scene, lamp.group, [-2, 0.85, 0.8]);
  c.flames.push(lamp);
  add(c.scene, box(0.4, 0.04, 0.3, STUFF.wood()), [-1.6, 0.8, 0.6]);
  if (dawn) {
    add(c.scene, archShape(1, 1.4, glowMat('#ffe0c0', 0.9, false)), [4.28, 1.4, 0.5], [0, -Math.PI / 2, 0]);
    shaft(c, [4.3, 2.1, 0.5], [0.5, 0, 0.5], 1, '#ffd8b0', 0.16);
  }
}

/** The cellar: barrels along x = ±2.4, one lamp on a barrel at (0, 0.95, -1.8). */
function cellar(c: Ctx): void {
  indoors(c, '#060404', ['#8a6040', '#0a0604', 0.18]);
  c.exposure = 1.35;
  add(c.scene, ground(8, 10, STUFF.earth(), 2));
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 10, 24, 1, true, -Math.PI / 2, Math.PI), STUFF.brick());
  (vault.material as THREE.Material).side = THREE.DoubleSide;
  vault.rotation.set(Math.PI / 2, 0, 0);
  vault.position.set(0, 0.6, 0);
  vault.scale.set(1, 1, 0.85);
  vault.receiveShadow = true;
  c.scene.add(vault);
  add(c.scene, box(8, 4, 0.4, STUFF.brick(), 2), [0, 2, -3.2]);
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const b = add(c.scene, barrel(0.45, 1.1), [s * 2.4, 0.45, -2.4 + i * 1.3], [0, 0, Math.PI / 2]);
      b.position.x = s * 2.4 + (s > 0 ? -0.55 : 0.55);
    }
  add(c.scene, barrel(0.4, 0.9), [0, 0, -1.8]);
  const lamp = flame(0.12, 3.6, '#ffb060', 5);
  add(c.scene, sphere(0.07, mat({ color: '#a86a3a' }), 10), [0, 0.95, -1.8]).scale.set(1, 0.4, 0.7);
  add(c.scene, lamp.group, [0, 1.0, -1.7]);
  c.flames.push(lamp);
  lamp.light!.castShadow = true;
  lamp.light!.shadow.mapSize.set(1024, 1024);
  lamp.light!.shadow.bias = -0.002;
  add(c.scene, archShape(1, 2, STUFF.dark()), [0, 0, 4.2]);
  add(c.scene, stairs(6, 1.2, 0.3, 0.35, STUFF.woodDark()), [0, 0, 5], [0, Math.PI, 0]);
}

/** A fork of the road in the morning: the Via Emilia straight along -z, the other road to -x. Milestone at (1.6, 0.5). */
function crossroad(c: Ctx): void {
  outdoors(c, 'golden', 25);
  c.scene.fog = new THREE.FogExp2('#e0c8b0', 0.02);
  add(c.scene, ground(160, 160, STUFF.grass(), 3), [0, -0.01, 0]);
  add(c.scene, ground(3.6, 120, STUFF.cobble(), 2), [0, 0.01, -50]);
  const side = add(c.scene, ground(2.6, 60, STUFF.earth(), 2), [-30, 0.005, 0], [0, Math.PI / 2, 0]);
  side.rotation.y = Math.PI / 2;
  add(c.scene, milestone(), [1.6, 0, 0.5]);
  for (let z = 6; z > -100; z -= 8) for (const s of [1, -1]) add(c.scene, poplar(9 + hash(z * s) * 3, z * s, '#5a6a3a'), [s * 4.5, 0, z]);
  add(c.scene, house(6, 5, 3.6, 3, 0, STUFF.plaster()), [6, 0, 10]);
}

/**
 * The plain: the Via Emilia straight along z (x = 0), poplars every 8 m at
 * x = ±5.5, fields, a farm at (-22, -30). Good for long walks and riders.
 */
function plain(c: Ctx, o: SetOptions): void {
  const sky = o.sky ?? 'dawn';
  outdoors(c, sky, 40);
  if (sky === 'dawn') c.scene.fog = new THREE.FogExp2('#e0c0b8', 0.025);
  add(c.scene, ground(400, 400, STUFF.grass(), 3), [0, -0.01, -60]);
  add(c.scene, ground(3.6, 400, STUFF.cobble(), 2), [0, 0.01, -60]);
  /* Furrowed fields. */
  const furrow = mat({ color: '#8a7650', rough: 1, map: 'earth' });
  for (let i = 0; i < 18; i++) add(c.scene, box(30, 0.12, 0.7, furrow, 3), [-22, 0.04, 10 - i * 1.6]);
  for (let i = 0; i < 14; i++) add(c.scene, box(24, 0.12, 0.7, furrow, 3), [20, 0.04, -20 - i * 1.6]);
  for (let z = 30; z > -220; z -= 8) for (const s of [1, -1]) add(c.scene, poplar(9 + hash(z * s) * 3, z * s, sky === 'dawn' ? '#4a5a3a' : '#5a6a32'), [s * 5.5, 0, z]);
  add(c.scene, house(7, 6, 4, 8, 0, STUFF.plaster()), [-22, 0, -30]);
  add(c.scene, house(5, 4, 3, 11, 0, STUFF.brick()), [-27, 0, -26]);
  for (let i = 0; i < 4; i++) add(c.scene, milestone(), [2.2, 0, -i * 60]);
  /* Distant hills: the Apennines. */
  for (let i = 0; i < 9; i++) {
    const hill = add(c.scene, new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10), mat({ color: '#7a8aa0', rough: 1 })), [-160 + i * 45, -20, -230 - hash(i) * 40]);
    hill.scale.set(60 + hash(i) * 30, 38 + hash(i + 1) * 20, 30);
  }
}

/** The farm in daylight: the house at (-4, -5), its door at (-3, -1.9), haystack, well, the road along z at x = 7. */
function farm(c: Ctx, o: SetOptions): void {
  outdoors(c, o.sky ?? 'golden', 25);
  add(c.scene, ground(160, 160, STUFF.grass(), 3), [0, -0.01, 0]);
  add(c.scene, ground(16, 12, STUFF.earth(), 3), [-2, 0, -1]);
  add(c.scene, ground(3.6, 160, STUFF.cobble(), 2), [7, 0.01, 0]);
  const h = add(c.scene, house(7, 6, 4.2, 5, 0, STUFF.plaster()), [-4, 0, -5]);
  add(h, archShape(1, 2, mat({ color: '#4a3020', rough: 0.9, map: 'wood' })), [1, 0, 3.02]);
  const hay = add(c.scene, sphere(1.6, STUFF.straw(), 16), [-9, 0.6, -1]);
  hay.scale.set(1, 1.1, 1);
  add(c.scene, cyl(0.7, 0.75, 0.9, STUFF.stone(), 20), [2, 0.45, -3]);
  add(c.scene, box(0.1, 1.6, 0.1, STUFF.woodDark()), [1.4, 1.2, -3]);
  add(c.scene, box(0.1, 1.6, 0.1, STUFF.woodDark()), [2.6, 1.2, -3]);
  add(c.scene, box(1.4, 0.1, 0.1, STUFF.woodDark()), [2, 2, -3]);
  for (let i = 0; i < 12; i++) add(c.scene, box(0.08, 1, 0.08, STUFF.wood(), 1), [5.2, 0.5, -8 + i * 1.5]);
  add(c.scene, box(0.05, 0.08, 17, STUFF.wood(), 2), [5.2, 0.8, 0.2]);
  add(c.scene, tree(2.4, 3, '#4a6a2a'), [-11, 0, -7]);
  for (let z = 30; z > -120; z -= 8) add(c.scene, poplar(9 + hash(z) * 3, z, '#5a6a32'), [12, 0, z]);
}

/** The boy's room: the bed at (0, -1.2) along x, a stool with the candle at (1.4, -1.5), window at z = -2.5. */
function farmRoom(c: Ctx, o: SetOptions): void {
  const dawn = o.sky === 'dawn';
  indoors(c, '#080608', ['#8a7060', '#100a08', dawn ? 0.55 : 0.22], { color: dawn ? '#ffc8a0' : '#6a80c0', intensity: dawn ? 2.8 : 0.9, from: [1, 5, -9], to: [0, 0, -1], size: 5 });
  c.exposure = dawn ? 1.1 : 1.35;
  add(c.scene, ground(7, 6, mat({ color: '#9a8668', rough: 1, map: 'earth' }), 2));
  for (const [x, z, r] of [[0, -2.6, 0], [-3.3, 0, Math.PI / 2], [3.3, 0, -Math.PI / 2], [0, 3, Math.PI]] as const) add(c.scene, box(7, 3.2, 0.3, STUFF.plaster(), 2), [x, 1.6, z], [0, r, 0]);
  for (let x = -3; x <= 3; x += 1.2) add(c.scene, box(0.22, 0.22, 6, STUFF.woodDark(), 1), [x, 3.1, 0]);
  add(c.scene, archShape(0.8, 1, glowMat(dawn ? '#ffd8b0' : '#7a90d0', 0.75, false)), [-0.8, 1.5, -2.44]);
  shaft(c, [-0.8, 2, -2.4], [-0.2, 0, -0.6], 0.8, dawn ? '#ffd0a8' : '#7a90d0', dawn ? 0.2 : 0.08);
  add(c.scene, bed(1.0, 1.9, '#e0d4bc', '#7a5a3a'), [0, 0, -1.2], [0, Math.PI / 2, 0]);
  add(c.scene, cyl(0.2, 0.2, 0.45, STUFF.wood(), 12), [1.4, 0.22, -1.6]);
  if (!dawn) {
    const f = flame(0.08, 2.6, '#ffb060', 2);
    add(c.scene, cyl(0.025, 0.025, 0.18, mat({ color: '#f0e6d0' }), 8), [1.4, 0.54, -1.6]);
    add(c.scene, f.group, [1.4, 0.65, -1.6]);
    c.flames.push(f);
  }
  add(c.scene, box(0.5, 0.04, 0.4, STUFF.woodDark(), 1), [-2.6, 0.8, -1.8]);
  add(c.scene, amphora(), [-2.8, 0, 1.6]);
}

/**
 * The Stirone: the river runs along x between z = -7 and z = 5; the near
 * bank (z > 5) is where the scenes play, around (0, 8). A Roman bridge
 * crosses at x = -16. The far bank rises at z < -7; a ford at x = 6.
 * opt.tomb: a stone tomb at (1.5, -12) on the far bank.
 */
function stirone(c: Ctx, o: SetOptions): void {
  const sky = o.sky ?? 'sunset';
  outdoors(c, sky, 30, new THREE.Vector3(0, 0, 4));
  if (sky === 'dawn') c.scene.fog = new THREE.FogExp2('#d8c0c0', 0.03);
  const bank = mat({ color: '#ffffff', rough: 1, map: 'grass' });
  add(c.scene, ground(200, 80, bank, 3), [0, 0, 45]);
  add(c.scene, ground(200, 80, bank, 3), [0, 0, -47]);
  /* Muddy slopes into the river. */
  for (const [z, r] of [[5.8, -0.35], [-7.8, 0.35]] as const) {
    const slope = add(c.scene, ground(200, 3, STUFF.earth(), 2), [0, -0.45, z], [0, 0, 0]);
    slope.rotation.x = -Math.PI / 2 + r;
  }
  add(c.scene, ground(200, 16, mat({ color: '#4a3a28', rough: 1, map: 'earth' }), 3), [0, -1.1, -1]);
  const w = water(200, 15, sky === 'night' ? '#0a1830' : sky === 'dawn' ? '#6a7a98' : '#5a4a50');
  add(c.scene, w.mesh, [0, -0.6, -1]);
  c.waters.push(w);
  add(c.scene, romanBridge(4, 5, 3.2, 4), [-16, -1.1, -1]);
  add(c.scene, rocks(14, 20, 3), [2, -0.6, 4.2]);
  add(c.scene, rocks(10, 20, 9), [6, -0.7, -1]);
  add(c.scene, rocks(12, 24, 13), [-3, -0.6, -6.5]);
  /* Reeds along the banks. */
  const reed = mat({ color: sky === 'night' ? '#1a2418' : '#6a7040', rough: 1 });
  for (let i = 0; i < 160; i++) {
    const zSide = i % 2 ? 5.1 + hash(i) * 0.8 : -7.4 - hash(i) * 0.8;
    const r = add(c.scene, new THREE.Mesh(new THREE.ConeGeometry(0.03, 1 + hash(i * 3) * 0.8, 4), reed), [-30 + hash(i * 7) * 60, 0.2, zSide], [(hash(i) - 0.5) * 0.3, 0, (hash(i + 2) - 0.5) * 0.3]);
    r.castShadow = true;
  }
  const leaves = sky === 'night' ? '#121a14' : sky === 'dawn' ? '#4a5a44' : '#3a4428';
  for (let i = 0; i < 16; i++) add(c.scene, poplar(10 + hash(i) * 4, i, leaves), [-40 + i * 5.5 + hash(i) * 2, 0, -14 - hash(i * 2) * 8]);
  for (let i = 0; i < 8; i++) add(c.scene, tree(1.8 + hash(i) * 0.8, i + 30, leaves), [-30 + i * 9 + hash(i * 5) * 3, 0, 16 + hash(i * 3) * 8]);
  if (o.tomb) {
    const tomb = new THREE.Group();
    add(tomb, box(2.2, 0.8, 1.1, STUFF.stone()), [0, 0.4, 0]);
    add(tomb, box(2.4, 0.15, 1.3, STUFF.stone()), [0, 0.87, 0]);
    add(tomb, roof(1.3, 2.2, 0.35, STUFF.stone()), [0, 0.95, 0], [0, Math.PI / 2, 0]);
    const chi = new THREE.Group();
    add(chi, box(0.05, 0.5, 0.03, STUFF.gold()), [0, 0, 0], [0, 0, 0.6]);
    add(chi, box(0.05, 0.5, 0.03, STUFF.gold()), [0, 0, 0], [0, 0, -0.6]);
    add(chi, box(0.04, 0.55, 0.03, STUFF.gold()), [0, 0.02, 0]);
    add(chi, shade(new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 16, Math.PI * 1.5), STUFF.gold())), [0.04, 0.22, 0], [0, 0, -Math.PI / 2]);
    add(tomb, chi, [0, 0.45, 0.57]);
    add(c.scene, tomb, [1.5, 0, -12]);
    c.props.tomb = tomb;
    const candle = flame(0.08, 1.5, '#ffc070', 4);
    add(c.scene, candle.group, [2.2, 0.98, -11.5]);
    c.flames.push(candle);
  }
  if (o.shroud) {
    const cloak = new THREE.Group();
    add(cloak, shade(new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.3, 6, 16), mat({ color: '#7a1414', rough: 0.95, bump: 'cloth', bumpScale: 0.6, repeat: 2 }))), [0, 0.16, 0], [Math.PI / 2, 0, 0]);
    cloak.children[0].scale.set(1, 1, 0.55);
    add(c.scene, cloak, [0.6, 0, 6.8], [0, -0.5, 0]);
    c.props.shroud = cloak;
  }
  if (sky === 'night') {
    /* The moon on the water. */
    const moonGlow = glowSprite('#c8d8ff', 30, 0.5);
    add(c.scene, moonGlow, [24, 34, -42]);
  }
}

/** The medieval town: a square of houses, the cathedral rising at z = -16 with scaffolding. */
function medieval(c: Ctx, o: SetOptions): void {
  outdoors(c, o.sky ?? 'golden', 35, new THREE.Vector3(0, 0, -6));
  add(c.scene, ground(140, 140, STUFF.earth(), 3));
  add(c.scene, ground(26, 30, STUFF.cobble(), 2), [0, 0.01, -2]);
  const cat = cathedral(o.built ?? 0.72, 0, 'new');
  add(c.scene, cat.group, [0, 0, -16]);
  add(c.scene, scaffold(13, 13), [0, 0, -14.3]);
  for (let i = 0; i < 6; i++) {
    add(c.scene, house(5 + hash(i) * 2, 6, 6 + hash(i + 1) * 3, i + 40, 0), [-13, 0, 10 - i * 6.2], [0, Math.PI / 2, 0]);
    add(c.scene, house(5 + hash(i + 9) * 2, 6, 6 + hash(i + 3) * 3, i + 60, 0), [13, 0, 10 - i * 6.2], [0, -Math.PI / 2, 0]);
  }
  for (let i = 0; i < 6; i++) add(c.scene, box(1.2 + hash(i) * 0.6, 0.6, 0.8, STUFF.stone()), [-6 + i * 2.2, 0.3, -9 + hash(i) * 1.2]);
  extras(c, ['pilgrimMan', 'pilgrim', 'townsman', 'townswoman', 'apprentice', 'master'], [[-4, 2, 160], [-3.2, 2.6, 170], [4, -1, -120], [5, 3, -150], [-1, -10.5, 180], [2.4, -11, 200], [-7, -4, 120], [7.6, -6, -100]], 51);
}

/** The sculptor's yard: blocks and the carving at (0.4, 0, -1), the cathedral wall behind at z = -6. */
function workshop(c: Ctx, o: SetOptions): void {
  outdoors(c, o.sky ?? 'golden', 16, new THREE.Vector3(0, 0, -2));
  add(c.scene, ground(80, 80, STUFF.earth(), 3));
  const cat = cathedral(0.75, 0, 'new');
  add(c.scene, cat.group, [3, 0, -8.5]);
  add(c.scene, scaffold(12, 9), [3, 0, -6.6]);
  add(c.scene, table(2.4, 1.1, STUFF.woodDark()), [0.4, 0, -1]);
  const carving = statue('donSaint', 'hold', { headless: true, scale: 0.55 });
  add(c.scene, carving.group, [0.4, 0.79, -1.1]);
  c.props.carving = carving.group;
  for (let i = 0; i < 5; i++) add(c.scene, box(1 + hash(i) * 0.6, 0.7 + hash(i * 2) * 0.4, 0.8, STUFF.stone()), [-4 + i * 1.6, 0.4, -3.4 + hash(i) * 0.8], [0, hash(i) * 0.5, 0]);
  for (let i = 0; i < 40; i++) add(c.scene, box(0.08, 0.03, 0.06, STUFF.stone(), 1), [(hash(i) - 0.5) * 3, 0.015, -0.2 + (hash(i * 3) - 0.5) * 1.6], [0, hash(i * 5) * 3, 0]);
  add(c.scene, amphora(), [-2.6, 0, 0.4]);
  add(c.scene, house(6, 5, 5, 71, 0), [-10, 0, -4], [0, Math.PI / 2, 0]);
}

/**
 * The cathedral square of Fidenza today: paving, the cathedral at z = -14 (front
 * at z ≈ -12.5), street lamps and arcades. The saint's statue stands in the
 * niche (props.statue) at (-3, 5.2, -12.3).
 */
function piazza(c: Ctx, o: SetOptions): void {
  const sky = o.sky ?? 'night';
  outdoors(c, sky, 30, new THREE.Vector3(0, 0, -6));
  if (sky === 'night' || sky === 'dusk') c.exposure = 1.45;
  add(c.scene, ground(120, 120, STUFF.paving(), 3), [0, 0, -4]);
  const lit = sky === 'night' || sky === 'dusk' ? 1 : 0;
  const cat = cathedral(1, lit, 'old');
  add(c.scene, cat.group, [0, 0, -14]);
  const st = statue('donSaint', 'hold', { headless: true, scale: 1.0 });
  const niche = cat.niche.clone().add(new THREE.Vector3(0, 0, -14));
  add(c.scene, st.group, [niche.x, niche.y - 0.17, niche.z + 0.12]);
  c.props.statue = st.group;
  /* Floodlight on the façade at night. */
  if (lit) {
    for (const x of [-6, 6]) {
      const spot = new THREE.SpotLight('#ffd8a0', 60, 40, 0.6, 0.6, 1.4);
      spot.position.set(x, 0.3, -4);
      spot.target.position.set(x * 0.3, 8, -12.5);
      c.scene.add(spot, spot.target);
    }
    for (const x of [-11, 11]) add(c.scene, streetLamp(c.flames, x, 5), [x, 0, -2]);
    add(c.scene, streetLamp(c.flames, 9, 5), [-6, 0, 8]);
  }
  /* Arcades on both sides of the square. */
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const hh = add(c.scene, house(7, 6, 9, i * 3 + (s > 0 ? 80 : 90), lit ? 0.6 : 0, i % 2 ? STUFF.plaster() : mat({ color: '#e8b890', rough: 0.95, map: 'plaster' })), [s * 16, 0, 12 - i * 7.5], [0, -s * Math.PI / 2, 0]);
      for (let k = -1; k <= 1; k++) add(hh, archWall(2.2, 3, 0.5, 1.6, 1.8, STUFF.plaster()), [k * 2.2, 0, 3.2]);
    }
  for (const x of [-5, 5]) add(c.scene, bench(2, STUFF.woodDark()), [x, 0, 1], [0, 0, 0]);
  if (!lit) extras(c, ['passerA', 'passerB', 'townsman'], [[-7, 4, 30], [8, -2, -60], [3, 9, 200]], 81);
}

/**
 * Milan in 303, seen from the sky at dusk: the city walls, a grid of houses,
 * the circus, and the palace with its great hall at the centre (0, 0).
 */
function milan(c: Ctx): void {
  outdoors(c, 'dusk', 120);
  c.scene.fog = new THREE.FogExp2('#6a4a5a', 0.0035);
  c.exposure = 1.7;
  add(c.scene, ground(1400, 1400, STUFF.grass(), 8), [0, -0.05, 0]);
  add(c.scene, ground(300, 300, STUFF.earth(), 6));
  /* The houses: one instanced mesh for walls, one for roofs. */
  const N = 900;
  const walls = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat({ color: '#d8c0a0', rough: 1, map: 'plaster' }), N);
  const roofs = new THREE.InstancedMesh(new THREE.ConeGeometry(0.75, 1, 4), mat({ color: '#b05a38', rough: 0.9 }), N);
  const glows = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glowMat('#ffa050', 0.9, false), N);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let n = 0;
  for (let gx = -14; gx <= 14; gx++)
    for (let gz = -14; gz <= 14; gz++) {
      const x = gx * 9 + (hash(gx * 3 + gz) - 0.5) * 2;
      const z = gz * 9 + (hash(gz * 5 + gx) - 0.5) * 2;
      const r = Math.hypot(x, z);
      if (r > 125 || (Math.abs(x) < 26 && Math.abs(z) < 30) || (z > 40 && z < 60 && Math.abs(x) < 70) || n >= N) continue;
      const w = 5 + hash(gx + gz * 9) * 3;
      const d = 5 + hash(gx * 7 + gz) * 3;
      const h = 4 + hash(gx * 13 + gz * 3) * 6;
      m.compose(new THREE.Vector3(x, h / 2, z), q.setFromEuler(new THREE.Euler(0, 0, 0)), new THREE.Vector3(w, h, d));
      walls.setMatrixAt(n, m);
      m.compose(new THREE.Vector3(x, h + 1, z), q.setFromEuler(new THREE.Euler(0, Math.PI / 4, 0)), new THREE.Vector3(w * 0.95, 2, d * 0.95));
      roofs.setMatrixAt(n, m);
      const lit = hash(gx * 17 + gz * 29) < 0.55;
      m.compose(new THREE.Vector3(x, h * 0.45, z + d / 2 + 0.02), q.identity(), lit ? new THREE.Vector3(0.9, 1.2, 1) : new THREE.Vector3(0, 0, 0));
      glows.setMatrixAt(n, m);
      n++;
    }
  walls.count = roofs.count = glows.count = n;
  walls.castShadow = walls.receiveShadow = roofs.castShadow = true;
  c.scene.add(walls, roofs, glows);
  /* City walls with towers. */
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const seg = add(c.scene, box(20, 8, 2.5, STUFF.brick(), 4), [Math.cos(a) * 132, 4, Math.sin(a) * 132], [0, -a + Math.PI / 2, 0]);
    seg.castShadow = true;
    add(c.scene, box(5, 12, 5, STUFF.brick(), 4), [Math.cos(a) * 132, 6, Math.sin(a) * 132]);
  }
  /* The circus. */
  const circus = new THREE.Mesh(new THREE.CapsuleGeometry(10, 120, 4, 24), STUFF.earth());
  circus.rotation.z = Math.PI / 2;
  circus.scale.set(1, 1, 0.02);
  add(c.scene, box(140, 6, 3, STUFF.brick(), 4), [0, 3, 42]);
  add(c.scene, box(140, 6, 3, STUFF.brick(), 4), [0, 3, 58]);
  add(c.scene, box(100, 1.2, 1.5, STUFF.marble(), 4), [0, 0.6, 50]);
  /* The palace: a courtyard with porticoes and the great hall. */
  add(c.scene, box(16, 14, 36, STUFF.marbleWarm(), 4), [0, 7, -8]);
  add(c.scene, roof(16, 36, 5, STUFF.roof()), [0, 14, -8], [0, 0, 0]);
  for (const s of [1, -1]) {
    add(c.scene, box(8, 9, 50, STUFF.marbleWarm(), 4), [s * 20, 4.5, 0]);
    add(c.scene, roof(8, 50, 3, STUFF.roof()), [s * 20, 9, 0]);
  }
  add(c.scene, box(48, 9, 8, STUFF.marbleWarm(), 4), [0, 4.5, 24]);
  for (let i = -5; i <= 5; i++) add(c.scene, column(7, 0.5, STUFF.marble()), [i * 2.6, 0, 18.5]);
  const fires: Flame[] = [];
  for (let i = 0; i < 6; i++) {
    const f = flame(1.2, i < 2 ? 30 : 0, '#ffa040', i);
    add(c.scene, f.group, [(i % 3 - 1) * 10, 0.8, 8 + Math.floor(i / 3) * 6]);
    fires.push(f);
  }
  c.flames.push(...fires);
}

const BUILDERS: Record<SetName, (c: Ctx, o: SetOptions) => void> = {
  hall, treasury, bedchamber, prison, postern, road, innExterior, innInterior, cellar, crossroad, plain, farm, farmRoom, stirone, medieval, workshop, piazza, milan,
};

const cache = new Map<string, SetInstance>();

export function setKey(name: SetName, o: SetOptions = {}): string {
  return `${name}:${JSON.stringify(o)}`;
}

export function getSet(name: SetName, o: SetOptions = {}): SetInstance {
  const key = setKey(name, o);
  let set = cache.get(key);
  if (set) return set;
  const c: Ctx = { scene: new THREE.Scene(), props: {}, flames: [], waters: [], tickers: [], bloom: 0.5, exposure: 1 };
  BUILDERS[name](c, o);
  /* A soft light beside the camera, as on a film set, so faces always read. */
  const fill = new THREE.PointLight(c.scene.fog && (c.scene.fog as THREE.FogExp2).density > 0.03 ? '#ffe2c4' : '#fff0e0', 0, 7, 1.4);
  fill.name = 'fill';
  c.scene.add(fill);
  c.props.fill = fill;
  const skyMat = c.sky?.material as THREE.ShaderMaterial | undefined;
  set = {
    scene: c.scene,
    props: c.props,
    bloom: c.bloom,
    exposure: c.exposure,
    update(time: number) {
      for (const f of c.flames) flicker(f, time);
      for (const w of c.waters) {
        const n = w.material.normalMap!;
        n.offset.set(time * 0.012, time * 0.02);
      }
      if (skyMat) skyMat.uniforms.time.value = time;
      for (const t of c.tickers) t(time);
    },
  };
  cache.set(key, set);
  return set;
}

export { crownMesh as crown };
