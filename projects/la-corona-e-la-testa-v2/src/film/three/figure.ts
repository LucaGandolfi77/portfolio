/*
 * The actors: articulated figures built from soft primitives, with a face
 * that blinks, speaks and changes mood, robes, cloaks, armour, hats and the
 * things they hold. Poses are joint angles blended over time; walking,
 * breathing and gestures while speaking are added on top.
 */
import * as THREE from 'three';
import { clamp, ease, hash, lerp } from '../util';
import { STONE, glowMat, glowSprite, mat } from './mats';

export type PoseName =
  | 'stand' | 'talk' | 'kneel' | 'pray' | 'offer' | 'point' | 'raise' | 'bow' | 'sit' | 'lie' | 'hold'
  | 'ride' | 'grieve' | 'guard' | 'arms' | 'reach' | 'sleep' | 'carve' | 'beg' | 'lookup' | 'pour' | 'bless';

export type Mood = 'calm' | 'sad' | 'stern' | 'joy' | 'fear' | 'anger';

export type Item =
  | 'crown' | 'scroll' | 'spear' | 'standard' | 'jug' | 'censer' | 'staff' | 'chisel' | 'hammer'
  | 'oillamp' | 'ring' | 'bowl' | 'bread' | 'sword' | 'candle' | 'cloth';

export interface Look {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'curly' | 'bald' | 'bun' | 'none';
  beard?: 'full' | 'short';
  robe: string;
  /** 1 = to the ankles, 0.45 = a short tunic. */
  robeLen: number;
  robe2?: string;
  trim?: string;
  sleeves?: string;
  legs?: string;
  shoes?: string;
  cape?: string;
  armor?: string;
  toga?: string;
  belt?: string;
  hat?: 'galea' | 'laurel' | 'diadem' | 'veil' | 'coif' | 'hood' | 'beanie';
  hatColor?: string;
  size?: number;
  /** Width of the body, 1 = average. */
  build?: number;
  /** 0..1: lines of age around eyes, greyer brows. */
  age?: number;
  halo?: boolean;
}

interface Joints {
  hip: number;
  lean: number;
  twist: number;
  head: [number, number];
  l: [number, number, number];
  r: [number, number, number];
  ll: [number, number];
  rl: [number, number];
  lie: number;
  skirt: number;
}

const P = (j: Partial<Joints>): Joints => ({
  hip: 0.95, lean: 0, twist: 0, head: [0, 0], l: [0.05, 0.1, -0.15], r: [0.05, 0.1, -0.15], ll: [0, 0], rl: [0, 0], lie: 0, skirt: 1, ...j,
});

/* Arm: [forward swing (negative = forward), out to the side, elbow bend (negative = forward)]. */
export const POSES: Record<PoseName, Joints> = {
  stand: P({}),
  talk: P({ r: [-0.5, 0.25, -1.2], l: [0.05, 0.1, -0.3] }),
  kneel: P({ hip: 0.52, lean: 0.12, l: [-0.7, -0.25, -1.5], r: [-0.7, -0.25, -1.5], ll: [0, 1.55], rl: [0, 1.55], skirt: 0.5, head: [0.15, 0] }),
  pray: P({ l: [-0.75, -0.28, -1.45], r: [-0.75, -0.28, -1.45], head: [0.18, 0] }),
  offer: P({ l: [-1.05, 0.05, -0.55], r: [-1.05, 0.05, -0.55], lean: 0.08 }),
  point: P({ r: [-1.45, 0.15, -0.05], l: [0.1, 0.12, -0.2] }),
  raise: P({ l: [-2.7, 0.35, -0.2], r: [-2.7, 0.35, -0.2], head: [-0.35, 0], lean: -0.08 }),
  bow: P({ lean: 0.42, head: [0.35, 0], l: [-0.35, 0.05, -0.4], r: [-0.35, 0.05, -0.4] }),
  sit: P({ hip: 0.5, ll: [-1.5, 1.5], rl: [-1.5, 1.5], l: [-0.45, 0.1, -0.9], r: [-0.45, 0.1, -0.9], skirt: 0.62 }),
  lie: P({ hip: 0.16, lie: 1, l: [0.05, 0.12, -0.1], r: [0.05, 0.12, -0.1] }),
  sleep: P({ hip: 0.16, lie: 1, l: [-0.6, 0.1, -1.2], r: [-0.6, 0.1, -1.2], head: [0, 0.4] }),
  hold: P({ l: [-0.85, -0.12, -1.0], r: [-0.85, -0.12, -1.0] }),
  ride: P({ hip: 0.5, ll: [-1.25, 1.2], rl: [-1.25, 1.2], l: [-0.6, 0.15, -0.9], r: [-0.6, 0.15, -0.9], skirt: 0.6 }),
  grieve: P({ hip: 0.52, lean: 0.4, head: [0.5, 0], l: [-1.2, -0.4, -2.0], r: [-1.2, -0.4, -2.0], ll: [0, 1.55], rl: [0, 1.55], skirt: 0.5 }),
  guard: P({ r: [-0.35, 0.18, -1.35], l: [0.08, 0.1, -0.2] }),
  arms: P({ l: [-0.5, -0.3, -1.9], r: [-0.5, -0.3, -1.9] }),
  reach: P({ r: [-1.25, 0.05, -0.25], l: [-0.6, 0.1, -0.5], lean: 0.12 }),
  carve: P({ r: [-1.2, 0.1, -0.7], l: [-1.0, -0.1, -0.6], lean: 0.18, head: [0.25, 0] }),
  beg: P({ hip: 0.52, lean: 0.1, l: [-1.1, 0.1, -0.5], r: [-1.1, 0.1, -0.5], ll: [0, 1.55], rl: [0, 1.55], skirt: 0.5, head: [-0.15, 0] }),
  lookup: P({ head: [-0.5, 0], l: [0.05, 0.12, -0.2], r: [0.05, 0.12, -0.2] }),
  pour: P({ r: [-1.6, 0.1, -0.5], l: [-1.0, -0.1, -0.9], lean: 0.1, head: [0.3, 0] }),
  bless: P({ r: [-1.8, 0.2, -0.6], l: [0.05, 0.1, -0.2] }),
};

/* Shared unit geometries, scaled per part. */
const G = {
  sphere: new THREE.SphereGeometry(1, 28, 20),
  lowSphere: new THREE.SphereGeometry(1, 12, 8),
  cap: new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
  hood: new THREE.SphereGeometry(1, 24, 14, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI * 0.72),
  beard: new THREE.SphereGeometry(1, 20, 10, Math.PI * 0.12, Math.PI * 0.76, Math.PI * 0.64, Math.PI * 0.3),
  capsule: new THREE.CapsuleGeometry(1, 1, 6, 14),
  box: new THREE.BoxGeometry(1, 1, 1),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 18),
  cone: new THREE.ConeGeometry(1, 1, 16),
  torus: new THREE.TorusGeometry(1, 0.08, 8, 40),
  smile: new THREE.TorusGeometry(1, 0.22, 6, 14, Math.PI),
};

function lathe(points: Array<[number, number]>, segs = 28): THREE.LatheGeometry {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs);
}

const TORSO = lathe([[0.13, 0], [0.155, 0.08], [0.175, 0.2], [0.19, 0.33], [0.185, 0.43], [0.14, 0.5], [0.07, 0.545], [0.045, 0.56]]);
const skirtCache = new Map<number, THREE.LatheGeometry>();
function skirt(len: number): THREE.LatheGeometry {
  const k = Math.round(len * 20) / 20;
  let g = skirtCache.get(k);
  if (!g) {
    const h = 0.93 * k;
    g = lathe([[0.0, 0.12], [0.15, 0.12], [0.165, 0.02], [0.2, -h * 0.3], [0.245, -h * 0.7], [0.27 + k * 0.03, -h], [0.2, -h - 0.005]]);
    skirtCache.set(k, g);
  }
  return g;
}
const CAPE = new THREE.CylinderGeometry(0.2, 0.42, 1.25, 20, 6, true, Math.PI - 1.35, 2.7);
CAPE.translate(0, -0.62, -0.02);

function mesh(geo: THREE.BufferGeometry, m: THREE.Material, scale?: [number, number, number], pos?: [number, number, number]): THREE.Mesh {
  const o = new THREE.Mesh(geo, m);
  if (scale) o.scale.set(...scale);
  if (pos) o.position.set(...pos);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

const cloth = (color: string, rough = 0.92): THREE.MeshStandardMaterial => mat({ color, rough, bump: 'cloth', bumpScale: 0.6, repeat: 3 });
const skinMat = (color: string): THREE.MeshStandardMaterial => mat({ color, rough: 0.58, emissive: color, emissiveIntensity: 0.07 });
const metal = (color: string, rough = 0.32): THREE.MeshStandardMaterial => mat({ color, rough, metal: 0.95 });

export function makeItem(name: Item): THREE.Object3D {
  const g = new THREE.Group();
  const gold = metal('#e8b850', 0.25);
  const wood = mat({ color: '#6a4628', rough: 0.85, map: 'wood' });
  switch (name) {
    case 'crown': {
      g.add(mesh(G.cyl, gold, [0.11, 0.06, 0.11], [0, 0.03, 0]));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const tip = mesh(G.cone, gold, [0.022, 0.07, 0.022], [Math.cos(a) * 0.105, 0.09, Math.sin(a) * 0.105]);
        g.add(tip);
        g.add(mesh(G.lowSphere, mat({ color: i % 2 ? '#c02040' : '#2050c0', rough: 0.1, metal: 0.2 }), [0.012, 0.012, 0.012], [Math.cos(a) * 0.112, 0.03, Math.sin(a) * 0.112]));
      }
      g.position.set(0, -0.02, 0.08);
      break;
    }
    case 'scroll':
      g.add(mesh(G.cyl, mat({ color: '#e8dcb8', rough: 0.9 }), [0.03, 0.22, 0.03]));
      g.rotation.z = Math.PI / 2;
      break;
    case 'spear':
      g.add(mesh(G.cyl, wood, [0.016, 2.1, 0.016], [0, 0.45, 0]));
      g.add(mesh(G.cone, metal('#c8c8d0'), [0.03, 0.2, 0.012], [0, 1.58, 0]));
      break;
    case 'standard': {
      g.add(mesh(G.cyl, wood, [0.016, 2.4, 0.016], [0, 0.6, 0]));
      g.add(mesh(G.torus, gold, [0.09, 0.09, 0.09], [0, 1.85, 0]));
      const banner = mesh(G.box, cloth('#8a1820'), [0.36, 0.42, 0.01], [0, 1.5, 0.0]);
      g.add(banner);
      g.add(mesh(G.lowSphere, gold, [0.05, 0.05, 0.05], [0, 1.98, 0]));
      break;
    }
    case 'jug': {
      const clay = mat({ color: '#b06a40', rough: 0.8 });
      g.add(mesh(lathe([[0.0, 0], [0.06, 0], [0.085, 0.07], [0.07, 0.15], [0.035, 0.19], [0.045, 0.22], [0.0, 0.22]], 18), clay, [1, 1, 1], [0, -0.1, 0.05]));
      break;
    }
    case 'bowl':
      g.add(mesh(lathe([[0, 0], [0.06, 0.005], [0.1, 0.05], [0.09, 0.055], [0.05, 0.015], [0, 0.015]], 18), mat({ color: '#a8743c', rough: 0.7 }), [1, 1, 1], [0, -0.02, 0.06]));
      break;
    case 'bread':
      g.add(mesh(G.sphere, mat({ color: '#c89048', rough: 0.9 }), [0.08, 0.045, 0.07], [0, 0, 0.05]));
      break;
    case 'censer': {
      g.add(mesh(G.cyl, gold, [0.005, 0.3, 0.005], [0, -0.15, 0]));
      g.add(mesh(G.sphere, gold, [0.06, 0.05, 0.06], [0, -0.32, 0]));
      const ember = glowSprite('#ffb060', 0.16, 0.8);
      ember.position.set(0, -0.3, 0);
      g.add(ember);
      break;
    }
    case 'staff':
      g.add(mesh(G.cyl, wood, [0.018, 1.7, 0.018], [0, 0.35, 0]));
      break;
    case 'chisel':
      g.add(mesh(G.cyl, metal('#9098a0'), [0.008, 0.18, 0.008], [0, 0.05, 0.02]));
      g.rotation.x = 1.2;
      break;
    case 'hammer':
      g.add(mesh(G.cyl, wood, [0.012, 0.28, 0.012], [0, 0.08, 0]));
      g.add(mesh(G.box, metal('#7a7a80'), [0.05, 0.05, 0.12], [0, 0.22, 0]));
      break;
    case 'oillamp': {
      g.add(mesh(G.sphere, mat({ color: '#a86a3a', rough: 0.7 }), [0.07, 0.03, 0.05], [0, 0, 0.07]));
      const flame = glowSprite('#ffc070', 0.22, 1);
      flame.position.set(0, 0.05, 0.12);
      g.add(flame);
      g.add(mesh(G.sphere, glowMat('#ffd080'), [0.01, 0.025, 0.01], [0, 0.04, 0.12]));
      break;
    }
    case 'candle': {
      g.add(mesh(G.cyl, mat({ color: '#f0e6d0', rough: 0.6 }), [0.02, 0.16, 0.02], [0, 0.06, 0.04]));
      const flame = glowSprite('#ffc070', 0.2, 1);
      flame.position.set(0, 0.17, 0.04);
      g.add(flame);
      break;
    }
    case 'ring':
      g.add(mesh(G.torus, gold, [0.03, 0.03, 0.03], [0, 0, 0.04]));
      break;
    case 'sword':
      g.add(mesh(G.box, metal('#d0d4dc', 0.2), [0.04, 0.62, 0.008], [0, 0.36, 0]));
      g.add(mesh(G.box, gold, [0.14, 0.02, 0.03], [0, 0.04, 0]));
      g.add(mesh(G.cyl, mat({ color: '#3a2418' }), [0.015, 0.11, 0.015], [0, -0.03, 0]));
      break;
    case 'cloth':
      g.add(mesh(G.box, cloth('#e8e0cc'), [0.3, 0.02, 0.22], [0, -0.05, 0.12]));
      break;
  }
  return g;
}

/** A head, also carried by the saint once it is no longer on his shoulders. */
interface Face {
  group: THREE.Group;
  eyes: THREE.Group[];
  brows: THREE.Mesh[];
  mouth: THREE.Mesh;
  smile: THREE.Mesh;
}

function makeHead(look: Look): Face {
  const head = new THREE.Group();
  const skin = skinMat(look.skin);
  const hairM = cloth(look.hair, 0.8);
  head.add(mesh(G.sphere, skin, [0.108, 0.125, 0.112]));
  /* Jaw and cheeks, so the face is not a ball. */
  head.add(mesh(G.sphere, skin, [0.085, 0.07, 0.09], [0, -0.055, 0.02]));
  head.add(mesh(G.sphere, skin, [0.016, 0.03, 0.02], [0.108, 0, -0.005]));
  head.add(mesh(G.sphere, skin, [0.016, 0.03, 0.02], [-0.108, 0, -0.005]));
  head.add(mesh(G.sphere, skin, [0.014, 0.026, 0.022], [0, -0.012, 0.11]));

  const eyes: THREE.Group[] = [];
  const brows: THREE.Mesh[] = [];
  const white = mat({ color: '#f4efe6', rough: 0.3 });
  const iris = mat({ color: '#2a1c14', rough: 0.2 });
  for (const side of [1, -1]) {
    const eye = new THREE.Group();
    eye.position.set(0.038 * side, 0.02, 0.098);
    eye.add(mesh(G.sphere, white, [0.016, 0.0115, 0.01]));
    eye.add(mesh(G.sphere, iris, [0.0085, 0.0095, 0.006], [0, 0, 0.006]));
    head.add(eye);
    eyes.push(eye);
    const brow = mesh(G.box, mat({ color: (look.age ?? 0) > 0.6 ? '#c8c0b8' : look.hair, rough: 0.9 }), [0.032, 0.006, 0.008], [0.04 * side, 0.044, 0.105]);
    head.add(brow);
    brows.push(brow);
  }
  const lip = mat({ color: new THREE.Color(look.skin).multiplyScalar(0.62).getStyle(), rough: 0.6 });
  const mouth = mesh(G.sphere, mat({ color: '#3a1410', rough: 0.7 }), [0.024, 0.004, 0.01], [0, -0.058, 0.102]);
  head.add(mouth);
  const smile = mesh(G.smile, lip, [0.02, 0.012, 0.012], [0, -0.052, 0.104]);
  smile.rotation.z = Math.PI;
  head.add(smile);

  if (look.beard) {
    /* Beard on the jaw below the mouth, and a moustache above it: the mouth stays visible. */
    const tone = new THREE.Color(look.hair).lerp(new THREE.Color(look.skin), 0.18).getStyle();
    const bm = cloth(tone, 0.95);
    head.add(mesh(G.beard, bm, look.beard === 'full' ? [0.1, 0.15, 0.108] : [0.096, 0.1, 0.104], [0, look.beard === 'full' ? -0.02 : -0.012, 0.008]));
    for (const side of [1, -1]) {
      const m = mesh(G.capsule, bm, [0.008, 0.016, 0.008], [0.016 * side, -0.041, 0.109]);
      m.rotation.z = (Math.PI / 2) * side + 0.35 * side;
      head.add(m);
    }
  }
  switch (look.hairStyle) {
    case 'short':
      head.add(mesh(G.cap, hairM, [0.116, 0.13, 0.12], [0, 0.014, -0.016])).rotation.x = -0.38;
      break;
    case 'long':
      head.add(mesh(G.cap, hairM, [0.12, 0.134, 0.124], [0, 0.012, -0.016])).rotation.x = -0.32;
      head.add(mesh(G.capsule, hairM, [0.09, 0.08, 0.05], [0, -0.07, -0.06]));
      break;
    case 'curly':
      head.add(mesh(G.cap, hairM, [0.118, 0.132, 0.122], [0, 0.014, -0.016])).rotation.x = -0.34;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        head.add(mesh(G.lowSphere, hairM, [0.03, 0.03, 0.03], [Math.cos(a) * 0.09, 0.09 + Math.sin(i) * 0.015, Math.sin(a) * 0.09 - 0.02]));
      }
      break;
    case 'bald':
      /* A fringe of hair around the back of the head, from ear to ear. */
      head.add(mesh(new THREE.SphereGeometry(1, 20, 6, Math.PI * 1.04, Math.PI * 0.92, Math.PI * 0.3, Math.PI * 0.26), hairM, [0.118, 0.128, 0.122], [0, 0.005, -0.006]));
      break;
    case 'bun':
      head.add(mesh(G.cap, hairM, [0.118, 0.132, 0.122], [0, 0.014, -0.016])).rotation.x = -0.34;
      head.add(mesh(G.sphere, hairM, [0.05, 0.05, 0.05], [0, 0.05, -0.12]));
      break;
  }
  const hc = look.hatColor ?? '#888';
  switch (look.hat) {
    case 'galea': {
      const bronze = metal(hc, 0.3);
      head.add(mesh(G.cap, bronze, [0.128, 0.148, 0.132], [0, 0.012, -0.006]));
      head.add(mesh(G.box, bronze, [0.012, 0.08, 0.055], [0.12, -0.04, 0.04]));
      head.add(mesh(G.box, bronze, [0.012, 0.08, 0.055], [-0.12, -0.04, 0.04]));
      head.add(mesh(G.cyl, bronze, [0.13, 0.012, 0.14], [0, -0.0, -0.04]));
      const crest = mesh(new THREE.TorusGeometry(0.11, 0.028, 8, 20, Math.PI), cloth('#b01818'), [1, 1, 1], [0, 0.06, -0.01]);
      crest.rotation.y = Math.PI / 2;
      head.add(crest);
      break;
    }
    case 'laurel': {
      /* A wreath of golden leaves sitting on the hair, higher at the front. */
      const leaf = mat({ color: '#d8b040', rough: 0.35, metal: 0.85 });
      const ring = new THREE.Group();
      ring.position.set(0, 0.07, -0.012);
      ring.rotation.x = -0.32;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        if (Math.abs(Math.sin(a / 2)) < 0.12) continue;
        const l = mesh(G.lowSphere, leaf, [0.016, 0.008, 0.03], [Math.sin(a) * 0.112, 0, Math.cos(a) * 0.114]);
        l.rotation.set(0.5, a + 0.6, 0.3);
        ring.add(l);
      }
      head.add(ring);
      break;
    }
    case 'diadem': {
      const t = mesh(G.torus, metal('#f0c050', 0.2), [0.118, 0.118, 1.2], [0, 0.07, -0.01]);
      t.rotation.x = Math.PI / 2 - 0.3;
      head.add(t);
      for (let i = -2; i <= 2; i++) head.add(mesh(G.lowSphere, mat({ color: i ? '#f8f0e0' : '#c01830', rough: 0.1, metal: 0.3 }), [0.011, 0.011, 0.011], [i * 0.03, 0.1 - Math.abs(i) * 0.006, 0.1 - Math.abs(i) * 0.01]));
      break;
    }
    case 'veil':
      head.add(mesh(G.hood, cloth(hc), [0.135, 0.15, 0.14], [0, 0.012, -0.012]));
      head.add(mesh(G.capsule, cloth(hc), [0.11, 0.14, 0.05], [0, -0.13, -0.09]));
      break;
    case 'hood':
      head.add(mesh(G.hood, cloth(hc), [0.14, 0.155, 0.145], [0, 0.01, -0.016]));
      break;
    case 'coif':
      head.add(mesh(G.cap, cloth(hc), [0.12, 0.136, 0.125], [0, 0.012, -0.012]));
      break;
    case 'beanie':
      head.add(mesh(G.cap, cloth(hc), [0.12, 0.14, 0.125], [0, 0.02, -0.008]));
      head.add(mesh(G.sphere, cloth('#f0f0f0'), [0.03, 0.03, 0.03], [0, 0.155, -0.01]));
      break;
  }
  return { group: head, eyes, brows, mouth, smile };
}

export interface FigureState {
  pose: PoseName;
  from: PoseName;
  blend: number;
  /** 0..1, how much the figure is walking, and the phase of the step. */
  walk: number;
  phase: number;
  speaking: boolean;
  time: number;
  mood: Mood;
  /** Where the head looks, as yaw and pitch relative to the body. */
  lookYaw: number;
  lookPitch: number;
  item: Item | null;
  glow: number;
  seed: number;
}

export class Figure {
  readonly root = new THREE.Group();
  readonly look: Look;
  private pelvis = new THREE.Group();
  private spine = new THREE.Group();
  private neck = new THREE.Group();
  private face: Face;
  private arms: Array<{ shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group }> = [];
  private legs: Array<{ hip: THREE.Group; knee: THREE.Group }> = [];
  private skirtMesh: THREE.Mesh;
  private cape?: THREE.Mesh;
  private item: Item | null = null;
  private itemObj: THREE.Object3D | null = null;
  private halo?: THREE.Group;
  private aura?: THREE.Sprite;
  private neckLight?: THREE.Group;
  readonly headless: boolean;
  private headHome = new THREE.Vector3();

  constructor(look: Look, opts: { stone?: boolean; headless?: boolean } = {}) {
    this.look = look;
    this.headless = !!opts.headless;
    const size = look.size ?? 1;
    const build = look.build ?? 1;
    const robe = cloth(look.robe);
    const sleeves = cloth(look.sleeves ?? look.robe);
    const legs = cloth(look.legs ?? (look.robeLen > 0.8 ? look.robe : look.skin), look.legs || look.robeLen > 0.8 ? 0.9 : 0.62);
    const shoes = mat({ color: look.shoes ?? '#4a3020', rough: 0.7 });
    const skin = skinMat(look.skin);

    this.root.add(this.pelvis);
    this.pelvis.add(this.spine);
    /* Torso. */
    const torso = mesh(TORSO, robe, [build, 1, build * 0.74]);
    torso.position.y = 0.04;
    this.spine.add(torso);
    if (look.armor) {
      const a = mesh(TORSO, metal(look.armor, 0.35), [build * 1.07, 0.9, build * 0.8]);
      a.position.y = 0.1;
      this.spine.add(a);
      const leather = mat({ color: '#5a3a22', rough: 0.8 });
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const strip = mesh(G.box, leather, [0.05, 0.2, 0.012], [Math.sin(ang) * 0.17 * build, -0.03, Math.cos(ang) * 0.13 * build]);
        strip.rotation.y = ang;
        this.spine.add(strip);
      }
      for (const s of [1, -1]) this.spine.add(mesh(G.sphere, metal(look.armor, 0.35), [0.085, 0.05, 0.08], [0.17 * s * build, 0.47, 0]));
    }
    if (look.robe2) {
      /* Clavi: two coloured stripes down the tunic. */
      for (const s of [1, -1]) this.spine.add(mesh(G.box, cloth(look.robe2), [0.022, 0.46, 0.01], [0.06 * s, 0.27, 0.142 * build]));
    }
    if (look.belt) this.spine.add(mesh(G.torus, mat({ color: look.belt, rough: 0.5, metal: look.belt === '#d8a840' ? 0.9 : 0 }), [0.16 * build, 0.16 * build * 0.74, 0.25], [0, 0.07, 0])).rotation.x = Math.PI / 2;
    if (look.toga) {
      const sash = mesh(new THREE.TorusGeometry(0.21, 0.055, 10, 24, Math.PI * 1.15), cloth(look.toga), [build, 1, build * 0.8], [0.02, 0.27, 0]);
      sash.rotation.set(0.1, 0, 0.85);
      this.spine.add(sash);
      this.spine.add(mesh(G.capsule, cloth(look.toga), [0.07, 0.2, 0.05], [0.14, 0.32, -0.08]));
    }
    if (look.cape) {
      this.cape = mesh(CAPE, cloth(look.cape), [build, 1, build * 0.85]);
      (this.cape.material as THREE.Material).side = THREE.DoubleSide;
      this.cape.position.y = 0.52;
      this.spine.add(this.cape);
      this.spine.add(mesh(G.lowSphere, metal('#e0b048', 0.5), [0.016, 0.016, 0.01], [0.12, 0.47, 0.12]));
    }
    /* Skirt of the robe, hanging from the waist. */
    this.skirtMesh = mesh(skirt(look.robeLen), robe, [build, 1, build * 0.86]);
    this.pelvis.add(this.skirtMesh);
    if (look.trim) {
      const h = 0.93 * look.robeLen;
      const t = mesh(G.torus, metal(look.trim, 0.3), [0.27 + look.robeLen * 0.03, 0.27 + look.robeLen * 0.03, 0.3], [0, -h + 0.02, 0]);
      t.rotation.x = Math.PI / 2;
      t.scale.multiply(new THREE.Vector3(build, build * 0.86, 1));
      this.skirtMesh.add(t);
      t.position.set(0, -h + 0.02, 0);
      t.scale.set(0.275 + look.robeLen * 0.03, 0.275 + look.robeLen * 0.03, 0.3);
    }
    /* Neck and head. */
    this.neck.position.y = 0.57;
    this.spine.add(this.neck);
    this.neck.add(mesh(G.cyl, skin, [0.045, 0.09, 0.045], [0, 0.02, 0]));
    this.face = makeHead(look);
    this.face.group.position.y = 0.15;
    this.headHome.copy(this.face.group.position);
    this.neck.add(this.face.group);
    if (look.halo) {
      this.halo = new THREE.Group();
      const ring = mesh(G.torus, glowMat('#ffd88a', 0.9), [0.2, 0.2, 0.5]);
      ring.castShadow = false;
      this.halo.add(ring);
      const disc = glowSprite('#ffe0a0', 0.7, 0.55);
      this.halo.add(disc);
      this.halo.position.set(0, 0.17, -0.1);
      this.face.group.add(this.halo);
    }

    /* Arms. */
    for (const side of [1, -1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(0.2 * side * build, 0.46, 0);
      this.spine.add(shoulder);
      shoulder.add(mesh(G.sphere, sleeves, [0.062, 0.062, 0.062]));
      shoulder.add(mesh(G.capsule, sleeves, [0.052, 0.2, 0.052], [0, -0.14, 0]));
      const elbow = new THREE.Group();
      elbow.position.y = -0.29;
      shoulder.add(elbow);
      elbow.add(mesh(G.capsule, look.armor ? skin : sleeves, [0.044, 0.18, 0.044], [0, -0.12, 0]));
      const hand = new THREE.Group();
      hand.position.y = -0.27;
      elbow.add(hand);
      hand.add(mesh(G.sphere, skin, [0.042, 0.05, 0.03], [0, -0.01, 0]));
      this.arms.push({ shoulder, elbow, hand });
    }
    /* Legs (mostly under the robe; the feet always show). */
    for (const side of [1, -1]) {
      const hip = new THREE.Group();
      hip.position.set(0.09 * side * build, 0, 0);
      this.pelvis.add(hip);
      hip.add(mesh(G.capsule, legs, [0.07, 0.3, 0.07], [0, -0.22, 0]));
      const knee = new THREE.Group();
      knee.position.y = -0.45;
      hip.add(knee);
      knee.add(mesh(G.capsule, legs, [0.055, 0.32, 0.055], [0, -0.21, 0]));
      knee.add(mesh(G.box, shoes, [0.085, 0.06, 0.2], [0, -0.45, 0.045]));
      this.legs.push({ hip, knee });
    }

    if (this.headless) {
      /* The neck ends in light, and the head is carried in the hands. */
      this.face.group.removeFromParent();
      this.spine.add(this.face.group);
      this.face.group.position.set(0, 0.33, 0.27);
      this.face.group.rotation.set(-0.15, 0, 0);
      this.neckLight = new THREE.Group();
      const spot = glowSprite('#fff0c0', 0.55, 0.95);
      this.neckLight.add(spot);
      this.neckLight.add(mesh(G.sphere, glowMat('#fff6dc', 0.9), [0.05, 0.03, 0.05]));
      this.neckLight.position.y = 0.06;
      this.neck.add(this.neckLight);
      for (const e of this.face.eyes) e.scale.y = 0.12;
    }

    this.root.scale.setScalar(size);
    if (opts.stone) {
      const stone = STONE();
      this.root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && !((o as THREE.Mesh).material as THREE.Material).blending) (o as THREE.Mesh).material = stone;
        if ((o as THREE.Mesh).isMesh && ((o as THREE.Mesh).material as THREE.MeshBasicMaterial).isMeshBasicMaterial) o.visible = false;
      });
      this.root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = stone;
        if ((o as THREE.Sprite).isSprite) o.visible = false;
      });
    }
  }

  /** World position of the eyes, for the camera. */
  headWorld(target: THREE.Vector3): THREE.Vector3 {
    return this.face.group.getWorldPosition(target);
  }

  /** Which way the face looks, in the world (horizontal). */
  faceForward(target: THREE.Vector3): THREE.Vector3 {
    const q = new THREE.Quaternion();
    this.face.group.getWorldQuaternion(q);
    return target.set(0, 0, 1).applyQuaternion(q).setY(0).normalize();
  }

  setAura(amount: number): void {
    if (amount <= 0.01) {
      if (this.aura) this.aura.visible = false;
      return;
    }
    if (!this.aura) {
      this.aura = glowSprite('#ffe6b0', 2.2, 1);
      this.aura.position.y = 1.0;
      this.root.add(this.aura);
    }
    this.aura.visible = true;
    this.aura.material.opacity = amount * 0.38;
  }

  private setItem(item: Item | null): void {
    if (item === this.item) return;
    this.item = item;
    this.itemObj?.removeFromParent();
    this.itemObj = item ? makeItem(item) : null;
    if (this.itemObj) this.arms[1].hand.add(this.itemObj);
  }

  apply(s: FigureState): void {
    const a = POSES[s.from];
    const b = POSES[s.pose];
    const k = ease(s.blend);
    const J = (x: number, y: number): number => lerp(x, y, k);
    const seed = s.seed;
    const t = s.time;
    const breath = Math.sin(t * 1.6 + seed) * 0.012;
    const w = s.walk;
    const step = Math.sin(s.phase);
    const lie = J(a.lie, b.lie);

    /* Pelvis height, a gentle bob when walking, lying down by rotation. */
    this.pelvis.position.y = J(a.hip, b.hip) + w * Math.abs(Math.cos(s.phase)) * 0.035 - w * 0.02;
    this.root.rotation.x = 0;
    this.pelvis.rotation.set(-lie * Math.PI / 2, 0, 0);
    if (lie > 0) this.pelvis.position.z = -lie * 0.1;
    this.spine.rotation.set(J(a.lean, b.lean) + breath * 0.5 + w * 0.05, J(a.twist, b.twist) + w * step * 0.08, 0);
    this.skirtMesh.scale.y = J(a.skirt, b.skirt);
    if (this.cape) this.cape.rotation.x = -0.05 - w * 0.25 - Math.sin(t * 0.9 + seed) * 0.03 + J(a.lean, b.lean) * -0.6;

    /* Arms, with a swing when walking and a gesture when speaking. */
    const talking = s.speaking ? 1 : 0;
    this.arms.forEach((arm, i) => {
      const side = i === 0 ? 1 : -1;
      const pa = i === 0 ? a.l : a.r;
      const pb = i === 0 ? b.l : b.r;
      let fx = J(pa[0], pb[0]);
      let out = J(pa[1], pb[1]);
      let el = J(pa[2], pb[2]);
      const free = s.pose === 'stand' || s.pose === 'talk' || s.pose === 'guard' || s.pose === 'point';
      if (free) fx += w * step * 0.45 * side;
      if (talking && (s.pose === 'talk' || s.pose === 'stand') && i === 1) {
        const g = Math.sin(t * 2.1 + seed) * 0.5 + 0.5;
        fx += -0.35 * g - 0.15;
        el += -0.35 * g;
        out += 0.1 * Math.sin(t * 1.3);
      }
      arm.shoulder.rotation.set(fx, 0, out * side + breath);
      arm.elbow.rotation.set(el, 0, 0);
    });
    /* Legs. */
    this.legs.forEach((leg, i) => {
      const pa = i === 0 ? a.ll : a.rl;
      const pb = i === 0 ? b.ll : b.rl;
      const side = i === 0 ? 1 : -1;
      const swing = w * step * 0.5 * side;
      leg.hip.rotation.set(J(pa[0], pb[0]) + swing, 0, 0);
      leg.knee.rotation.set(J(pa[1], pb[1]) + w * Math.max(0, -Math.sin(s.phase + (side > 0 ? 0 : Math.PI))) * 0.7, 0, 0);
    });

    /* Head: the pose, plus where the eyes go, plus a nod while speaking. */
    if (!this.headless) {
      const nod = talking * Math.sin(t * 3.3 + seed) * 0.05;
      const ph = J(a.head[0], b.head[0]);
      this.neck.rotation.set(ph + s.lookPitch * (1 - Math.abs(ph)) + nod, clamp(s.lookYaw, -1.0, 1.0) + J(a.head[1], b.head[1]), 0);
    }

    /* Face. */
    const blinkCycle = (t + hash(seed) * 4) % (3.2 + hash(seed + 1) * 2);
    const blink = blinkCycle < 0.12 ? 0.1 : 1;
    if (!this.headless) for (const e of this.face.eyes) e.scale.y = blink;
    const open = s.speaking ? 0.25 + Math.abs(Math.sin(t * 11.3 + seed) * Math.sin(t * 6.7)) * 0.95 : 0;
    this.face.mouth.scale.y = 0.003 + open * 0.016;
    this.face.mouth.visible = open > 0.05;
    const mood = s.mood;
    const curve = mood === 'joy' ? 1 : mood === 'sad' || mood === 'fear' ? -1 : mood === 'stern' || mood === 'anger' ? -0.4 : this.headless ? 0.8 : 0.35;
    this.face.smile.visible = open < 0.3;
    this.face.smile.rotation.z = curve >= 0 ? Math.PI : 0;
    this.face.smile.scale.set(0.02, 0.003 + Math.abs(curve) * 0.01, 0.012);
    this.face.smile.position.y = curve >= 0 ? -0.05 : -0.062;
    const browTilt = mood === 'sad' || mood === 'fear' ? 0.3 : mood === 'stern' || mood === 'anger' ? -0.35 : mood === 'joy' ? 0.1 : 0;
    this.face.brows.forEach((b, i) => {
      b.rotation.z = browTilt * (i === 0 ? 1 : -1);
      b.position.y = 0.044 + (mood === 'fear' ? 0.007 : mood === 'anger' ? -0.004 : 0);
    });

    this.setItem(s.item);
    if (this.itemObj && s.item !== 'scroll' && s.item !== 'chisel') {
      /* Held things stay upright whatever the arm does. */
      const arm = this.arms[1];
      this.itemObj.rotation.x = -(arm.shoulder.rotation.x + arm.elbow.rotation.x + this.spine.rotation.x);
    }
    if (this.halo) this.halo.rotation.z = t * 0.2;
    if (this.neckLight) this.neckLight.scale.setScalar(0.9 + Math.sin(t * 2.3) * 0.1);
    this.setAura(s.glow);
  }
}
