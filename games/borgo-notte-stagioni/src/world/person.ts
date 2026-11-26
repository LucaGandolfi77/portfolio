import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GeoBatch } from './batch';

export type PersonLook =
  | 'ada'
  | 'elio'
  | 'marta'
  | 'nino'
  | 'beppe'
  | 'lidia'
  | 'sara'
  | 'citizen1'
  | 'citizen2'
  | 'citizen3'
  | 'pilgrim'
  | 'player'
  | 'dario'
  | 'ottavio'
  | 'giulia'
  | 'tonino'
  | 'conte'
  | 'smilzo'
  | 'ferrante'
  | 'rina'
  | 'agente';

/* Every moving part is one merged mesh with vertex colours, so a detailed
   figure costs ten draw calls. The optional joints (knees, elbows, head) let
   the walk bend; older callers that only pose legs and arms keep working. */
export interface PersonRig {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  body: THREE.Group;
  leftShin?: THREE.Group;
  rightShin?: THREE.Group;
  leftForearm?: THREE.Group;
  rightForearm?: THREE.Group;
  head?: THREE.Group;
  /** One-mesh stand-in for far away (see setFar). */
  far?: THREE.Mesh;
}

interface Outfit {
  shirt: number;
  trousers: number;
  apron?: number;
  scarf?: number;
  hat: 'straw' | 'cap' | 'scarf' | 'none';
  hatColor: number;
  hair: number;
  satchel?: boolean;
  moustache?: boolean;
  beard?: boolean;
  staff?: boolean;
  vest?: number;
  rolledSleeves?: boolean;
  bun?: boolean;
  skin?: number;
  boots?: number;
}

const OUTFITS: Record<PersonLook, Outfit> = {
  ada: {
    shirt: 0xb25840,
    trousers: 0x6a4d3a,
    apron: 0xf0e6cf,
    scarf: 0xd9a441,
    hat: 'scarf',
    hatColor: 0xc99b52,
    hair: 0x8c8378,
    skin: 0xdcae88
  },
  elio: {
    shirt: 0x6e5a45,
    trousers: 0x4f5048,
    scarf: 0xe6d6b6,
    hat: 'cap',
    hatColor: 0x4b4036,
    hair: 0x8a8174,
    satchel: true,
    moustache: true,
    vest: 0x4a4038
  },
  marta: {
    shirt: 0x6f7f4f,
    trousers: 0x54483a,
    apron: 0xf5ecd9,
    scarf: 0xc2603f,
    hat: 'straw',
    hatColor: 0xd9b96a,
    hair: 0x5b412f,
    bun: true,
    rolledSleeves: true
  },
  nino: {
    shirt: 0xc2603f,
    trousers: 0x4b5563,
    scarf: 0xf0e6cf,
    hat: 'cap',
    hatColor: 0x3f4a3a,
    hair: 0x2f2823,
    skin: 0xe2b38c
  },
  beppe: {
    shirt: 0x8b6b45,
    trousers: 0x4c4b43,
    apron: 0xd9c39b,
    scarf: 0x3f5b63,
    hat: 'cap',
    hatColor: 0x3f4a3a,
    hair: 0x6a5a48,
    moustache: true,
    rolledSleeves: true,
    skin: 0xc9926a
  },
  lidia: {
    shirt: 0x5f6f52,
    trousers: 0x5a4a3c,
    apron: 0xe6d9bd,
    scarf: 0x8a4b3d,
    hat: 'none',
    hatColor: 0x5f6f52,
    hair: 0x4d3829,
    satchel: true,
    bun: true
  },
  sara: {
    shirt: 0xf0e6cf,
    trousers: 0x44565c,
    apron: 0xc2603f,
    scarf: 0xd9a441,
    hat: 'none',
    hatColor: 0xc2603f,
    hair: 0x3c2f26,
    bun: true,
    skin: 0xc99a74
  },
  citizen1: {
    shirt: 0x6d7f8e,
    trousers: 0x4f4a3d,
    scarf: 0xd9c39b,
    hat: 'cap',
    hatColor: 0x3f4a3a,
    hair: 0x4b3a2a
  },
  citizen2: {
    shirt: 0x9a6b52,
    trousers: 0x4e4650,
    apron: 0xe6d9bd,
    scarf: 0x6f7f4f,
    hat: 'none',
    hatColor: 0x9a6b52,
    hair: 0x6d5a45,
    bun: true
  },
  citizen3: {
    shirt: 0x7a8560,
    trousers: 0x3f4650,
    scarf: 0xd9a441,
    hat: 'straw',
    hatColor: 0xc7a55e,
    hair: 0x3c2f26,
    satchel: true,
    rolledSleeves: true
  },
  pilgrim: {
    shirt: 0x7b6a4f,
    trousers: 0x4b4338,
    apron: 0xb8a67f,
    scarf: 0x8a3b32,
    hat: 'straw',
    hatColor: 0xc7a55e,
    hair: 0x5a4a3a,
    satchel: true,
    staff: true,
    beard: true
  },
  /* The cast of the story. */
  dario: {
    shirt: 0xe8dcc4,
    trousers: 0x2f3f56,
    scarf: 0xc2553a,
    hat: 'none',
    hatColor: 0x2f3f56,
    hair: 0x2a1d16,
    vest: 0x5a6b3a,
    rolledSleeves: true,
    beard: true,
    boots: 0x4a3222
  },
  ottavio: {
    shirt: 0xb8a888,
    trousers: 0x4a4a46,
    hat: 'cap',
    hatColor: 0x3c3a36,
    hair: 0xb8b4aa,
    vest: 0x6a4a30,
    moustache: true,
    skin: 0xd6a07c
  },
  giulia: {
    shirt: 0x2f5a8a,
    trousers: 0x2f5a8a,
    scarf: 0xc2402f,
    hat: 'none',
    hatColor: 0x2f5a8a,
    hair: 0x6a3a22,
    bun: true,
    rolledSleeves: true,
    boots: 0x2a2420
  },
  tonino: {
    shirt: 0xf4f0e6,
    trousers: 0x2a2a2a,
    apron: 0x2a2a2a,
    hat: 'none',
    hatColor: 0x2a2a2a,
    hair: 0x1e1a18,
    moustache: true,
    rolledSleeves: true,
    skin: 0xc99a74
  },
  conte: {
    shirt: 0x24252b,
    trousers: 0x1e1f24,
    scarf: 0x7a1e2a,
    hat: 'none',
    hatColor: 0x1e1f24,
    hair: 0x8a8580,
    vest: 0x3a1418,
    beard: true,
    boots: 0x111111
  },
  smilzo: {
    shirt: 0x1a1a1c,
    trousers: 0x3a4250,
    hat: 'cap',
    hatColor: 0xc23b2e,
    hair: 0x2a2420,
    boots: 0x111111
  },
  ferrante: {
    shirt: 0x1c2638,
    trousers: 0x1c2638,
    scarf: 0xb02a2a,
    hat: 'cap',
    hatColor: 0x141a26,
    hair: 0x3a3430,
    moustache: true
  },
  rina: {
    shirt: 0x7a5a6a,
    trousers: 0x4a3a40,
    apron: 0xe8dcc8,
    hat: 'scarf',
    hatColor: 0x3f5b63,
    hair: 0xc8c4bc,
    skin: 0xdcae88
  },
  agente: {
    shirt: 0x1f2d4a,
    trousers: 0x182033,
    hat: 'cap',
    hatColor: 0x121a2c,
    hair: 0x2a2420,
    boots: 0x111111
  },
  /* The traveller: linen shirt with rolled sleeves, a rust waistcoat, the red
     scarf, a straw hat banded in the same red and a leather satchel. */
  player: {
    shirt: 0xf1e8d4,
    trousers: 0x3f5670,
    scarf: 0xc2553a,
    hat: 'straw',
    hatColor: 0xdcbc72,
    hair: 0x3a2a20,
    satchel: true,
    vest: 0x8a4f32,
    rolledSleeves: true,
    beard: true,
    boots: 0x5a3c26
  }
};

const SKIN = 0xd8a77d;
const SHOE = 0x3a3028;
const LEATHER = 0x5e4028;
const LEATHER_DARK = 0x3f2a1b;
const BRASS = 0xc9a64b;

/* Shared materials: flat facets for clothes, smooth shading for the head. */
let flatMaterial: THREE.MeshLambertMaterial | null = null;
let smoothMaterial: THREE.MeshLambertMaterial | null = null;
function materials(): { flat: THREE.MeshLambertMaterial; smooth: THREE.MeshLambertMaterial } {
  flatMaterial ??= new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  smoothMaterial ??= new THREE.MeshLambertMaterial({ vertexColors: true });
  return { flat: flatMaterial, smooth: smoothMaterial };
}

function shade(color: number, amount: number): number {
  const c = new THREE.Color(color);
  if (amount >= 0) c.lerp(new THREE.Color(0xffffff), amount);
  else c.multiplyScalar(1 + amount);
  return c.getHex();
}

function mix(a: number, b: number, t: number): number {
  return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
}

/* Small helpers on top of GeoBatch, with per-axis scale. */
class Part extends GeoBatch {
  ellipsoid(r: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number, w = 10, h = 8): void {
    const geometry = new THREE.SphereGeometry(r, w, h);
    this.add(geometry, color, this.matrix(x, y, z, 0, 0, 0, sx, sy, sz));
    geometry.dispose();
  }

  dome(r: number, x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number, theta: number, rx = 0): void {
    const geometry = new THREE.SphereGeometry(r, 12, 6, 0, Math.PI * 2, 0, theta);
    this.add(geometry, color, this.matrix(x, y, z, rx, 0, 0, sx, sy, sz));
    geometry.dispose();
  }

  taper(top: number, bottom: number, height: number, x: number, y: number, z: number, color: number, sz = 1, segments = 8, rx = 0, rz = 0): void {
    const geometry = new THREE.CylinderGeometry(top, bottom, height, segments);
    this.add(geometry, color, this.matrix(x, y, z, rx, 0, rz, 1, 1, sz));
    geometry.dispose();
  }

  mount(parent: THREE.Object3D, material: THREE.Material): void {
    const mesh = this.build(material);
    if (!mesh) return;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    parent.add(mesh);
  }
}

export function createPerson(look: PersonLook): PersonRig {
  const outfit = OUTFITS[look];
  const skin = outfit.skin ?? SKIN;
  const { flat, smooth } = materials();
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  /* Legs: thigh on the hip pivot, shin and boot on the knee. */
  const legs: THREE.Group[] = [];
  const shins: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(0.12 * side, 0.86, 0);
    body.add(hip);
    const thigh = new Part();
    thigh.taper(0.112, 0.092, 0.44, 0, -0.2, 0, outfit.trousers, 1.05);
    thigh.mount(hip, flat);

    const knee = new THREE.Group();
    knee.position.set(0, -0.42, 0);
    hip.add(knee);
    const shin = new Part();
    shin.taper(0.092, 0.082, 0.34, 0, -0.16, 0, outfit.trousers);
    shin.taper(0.096, 0.098, 0.05, 0, -0.31, 0, shade(outfit.trousers, -0.18));
    const boot = outfit.boots ?? SHOE;
    shin.box(0.16, 0.12, 0.2, 0, -0.38, 0.0, boot);
    shin.ellipsoid(0.085, 0, -0.395, 0.1, 1, 0.7, 1.25, boot, 8, 6);
    shin.box(0.17, 0.035, 0.32, 0, -0.437, 0.04, LEATHER_DARK);
    shin.mount(knee, flat);
    legs.push(hip);
    shins.push(knee);
  }

  const torso = new Part();
  /* Hips, belt and buckle. */
  torso.taper(0.205, 0.2, 0.18, 0, 0.92, 0, outfit.trousers, 0.68);
  torso.taper(0.21, 0.208, 0.07, 0, 1.03, 0, LEATHER_DARK, 0.7);
  torso.box(0.075, 0.06, 0.02, 0, 1.03, 0.145, BRASS);
  /* Chest: wider at the shoulders. */
  torso.taper(0.255, 0.2, 0.5, 0, 1.3, 0, outfit.shirt, 0.64, 10);
  torso.ellipsoid(0.095, -0.24, 1.49, 0, 1, 0.75, 1.05, outfit.shirt, 8, 6);
  torso.ellipsoid(0.095, 0.24, 1.49, 0, 1, 0.75, 1.05, outfit.shirt, 8, 6);
  torso.taper(0.18, 0.255, 0.06, 0, 1.575, 0, outfit.shirt, 0.64, 10);
  if (outfit.vest) {
    torso.taper(0.262, 0.21, 0.44, 0, 1.28, 0, outfit.vest, 0.68, 10);
    /* The open front shows the shirt; four small buttons on the edge. */
    torso.box(0.09, 0.4, 0.02, 0, 1.3, 0.168, outfit.shirt);
    for (let i = 0; i < 4; i++) torso.box(0.022, 0.022, 0.02, 0.055, 1.14 + i * 0.075, 0.176, BRASS);
    torso.box(0.12, 0.022, 0.02, 0.1, 1.3, 0.172, shade(outfit.vest, -0.25));
  }
  /* Open collar. */
  torso.box(0.07, 0.07, 0.02, 0, 1.52, 0.155, skin, 0, 0, Math.PI / 4);
  if (outfit.apron) {
    torso.box(0.36, 0.56, 0.025, 0, 1.06, 0.15, outfit.apron);
    torso.box(0.42, 0.045, 0.03, 0, 1.33, 0.14, shade(outfit.apron, -0.12));
  }
  if (outfit.scarf) {
    torso.taper(0.105, 0.125, 0.08, 0, 1.6, 0, outfit.scarf, 1, 10);
    torso.ellipsoid(0.035, 0.02, 1.565, 0.11, 1, 0.85, 0.8, shade(outfit.scarf, -0.08), 6, 5);
    torso.box(0.04, 0.16, 0.015, 0.045, 1.47, 0.172, outfit.scarf, 0.1, 0, -0.16);
    torso.box(0.036, 0.12, 0.015, 0.0, 1.48, 0.174, shade(outfit.scarf, -0.12), 0.1, 0, 0.2);
  }
  if (outfit.satchel) {
    /* Strap from the right shoulder to the left hip, front and back. */
    const strap = Math.atan2(0.46, 0.44);
    torso.box(0.05, 0.64, 0.015, 0.0, 1.28, 0.178, LEATHER, 0, 0, strap);
    torso.box(0.05, 0.64, 0.015, 0.0, 1.28, -0.172, LEATHER, 0, 0, -strap);
    torso.box(0.11, 0.24, 0.29, -0.27, 0.98, 0.02, LEATHER);
    torso.box(0.12, 0.12, 0.3, -0.272, 1.06, 0.02, shade(LEATHER, -0.2));
    torso.box(0.02, 0.05, 0.04, -0.335, 1.02, 0.02, BRASS);
  }
  if (outfit.staff) {
    torso.box(0.05, 1.8, 0.05, 0.47, 0.9, 0.16, 0x6a4a32);
    torso.ellipsoid(0.06, 0.47, 1.82, 0.16, 1, 1.2, 1, 0x8a6a42, 6, 5);
  }
  /* Neck. */
  torso.taper(0.062, 0.07, 0.12, 0, 1.64, 0, skin, 1, 8);
  torso.mount(body, flat);

  /* Arms: sleeve on the shoulder pivot, forearm and hand on the elbow. */
  const arms: THREE.Group[] = [];
  const forearms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.31 * side, 1.47, 0);
    body.add(shoulder);
    const upper = new Part();
    upper.taper(0.074, 0.064, 0.32, 0, -0.15, 0, outfit.shirt);
    upper.mount(shoulder, flat);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.3, 0);
    shoulder.add(elbow);
    const fore = new Part();
    if (outfit.rolledSleeves) {
      fore.taper(0.072, 0.072, 0.06, 0, -0.02, 0, shade(outfit.shirt, -0.08));
      fore.taper(0.056, 0.048, 0.24, 0, -0.15, 0, skin);
    } else {
      fore.taper(0.064, 0.056, 0.26, 0, -0.13, 0, outfit.shirt);
      fore.taper(0.058, 0.058, 0.035, 0, -0.255, 0, shade(outfit.shirt, -0.12));
    }
    fore.box(0.075, 0.1, 0.055, 0, -0.32, 0.008, skin);
    fore.box(0.03, 0.055, 0.03, -0.045 * side, -0.3, 0.025, skin, 0, 0, 0.35 * side);
    fore.mount(elbow, flat);
    arms.push(shoulder);
    forearms.push(elbow);
  }

  /* Head: smooth skull, ears, nose, eyes with whites and irises, brows,
     mouth, a touch of colour on the cheeks; hair and hat. */
  const head = new THREE.Group();
  head.position.set(0, 1.77, 0);
  head.scale.setScalar(1.13);
  body.add(head);
  const face = new Part();
  face.ellipsoid(0.165, 0, 0.03, 0, 1, 1.12, 1.04, skin, 16, 12);
  face.ellipsoid(0.09, 0, -0.06, 0.07, 1.15, 0.8, 1, skin, 10, 8);
  for (const side of [-1, 1]) {
    face.ellipsoid(0.04, 0.163 * side, 0.02, -0.005, 0.5, 1, 0.8, shade(skin, -0.08), 8, 6);
    face.box(0.05, 0.04, 0.012, 0.062 * side, 0.05, 0.158, 0xf4efe6);
    face.box(0.026, 0.036, 0.012, 0.06 * side, 0.048, 0.164, 0x3b2a1f);
    face.box(0.008, 0.008, 0.006, 0.066 * side, 0.058, 0.171, 0xffffff);
    face.box(0.06, 0.014, 0.016, 0.064 * side, 0.088, 0.158, shade(outfit.hair, -0.1), 0, 0, -0.12 * side);
    face.ellipsoid(0.022, 0.092 * side, -0.02, 0.138, 1, 0.55, 0.35, mix(skin, 0xd9826a, 0.22), 6, 5);
  }
  face.box(0.042, 0.075, 0.05, 0, 0.0, 0.17, shade(skin, -0.06), -0.2, 0, 0);
  if (!outfit.beard) face.box(0.06, 0.012, 0.01, 0, -0.07, 0.155, 0x8a4a3a);
  if (outfit.moustache) face.box(0.12, 0.026, 0.03, 0, -0.048, 0.162, shade(outfit.hair, 0.1));
  if (outfit.beard) {
    face.ellipsoid(0.105, 0, -0.088, 0.065, 1.1, 0.62, 0.9, shade(outfit.hair, 0.08), 10, 8);
    face.box(0.055, 0.014, 0.02, 0, -0.084, 0.172, 0x3a2219);
  }
  /* Hair: a cap of hair at the back and sides, sideburns and a fringe. */
  face.dome(0.175, 0, 0.045, -0.012, 1.02, 1.08, 1.06, outfit.hair, Math.PI * 0.55, -0.35);
  for (const side of [-1, 1]) face.box(0.02, 0.07, 0.04, 0.16 * side, 0.035, 0.065, outfit.hair);
  if (outfit.hat === 'none') {
    for (let i = -2; i <= 2; i++) face.box(0.06, 0.05, 0.05, i * 0.05, 0.16, 0.12 - Math.abs(i) * 0.015, outfit.hair, 0.3, 0, i * 0.12);
  }
  if (outfit.bun) face.ellipsoid(0.075, 0, 0.11, -0.16, 1, 0.9, 0.9, outfit.hair, 8, 6);

  switch (outfit.hat) {
    case 'straw': {
      const band = outfit.scarf ?? 0x7a5a3a;
      face.taper(0.29, 0.29, 0.02, 0, 0.15, 0.0, outfit.hatColor, 1, 18);
      face.taper(0.31, 0.29, 0.018, 0, 0.163, 0.0, shade(outfit.hatColor, 0.06), 1, 18);
      face.taper(0.165, 0.195, 0.16, 0, 0.245, 0, outfit.hatColor, 1, 14);
      face.taper(0.198, 0.198, 0.045, 0, 0.185, 0, band, 1, 14);
      face.dome(0.165, 0, 0.32, 0, 1, 0.25, 1, shade(outfit.hatColor, -0.05), Math.PI / 2);
      break;
    }
    case 'cap': {
      face.dome(0.18, 0, 0.13, 0, 1.06, 0.62, 1.08, outfit.hatColor, Math.PI / 2);
      face.taper(0.19, 0.19, 0.04, 0, 0.13, 0, shade(outfit.hatColor, -0.12), 1.08, 14);
      face.box(0.24, 0.025, 0.14, 0, 0.12, 0.2, shade(outfit.hatColor, -0.08), 0.12, 0, 0);
      break;
    }
    case 'scarf': {
      face.dome(0.185, 0, 0.06, -0.01, 1.04, 1.12, 1.08, outfit.hatColor, Math.PI * 0.5);
      face.taper(0.19, 0.195, 0.05, 0, 0.07, 0, shade(outfit.hatColor, -0.1), 1.06, 14);
      face.ellipsoid(0.07, 0.15, 0.04, -0.12, 1, 0.8, 1, outfit.hatColor, 8, 6);
      break;
    }
    default:
      break;
  }
  face.mount(head, smooth);

  return {
    group,
    body,
    leftLeg: legs[0],
    rightLeg: legs[1],
    leftShin: shins[0],
    rightShin: shins[1],
    leftArm: arms[0],
    rightArm: arms[1],
    leftForearm: forearms[0],
    rightForearm: forearms[1],
    head
  };
}

/*
 * Level of detail: the whole figure merged into one mesh in its rest pose.
 * Far away it replaces the ten animated parts (one draw call, no posing).
 */
export function addFarMesh(rig: PersonRig): void {
  rig.group.updateMatrixWorld(true);
  const inverse = new THREE.Matrix4().copy(rig.group.matrixWorld).invert();
  const parts: THREE.BufferGeometry[] = [];
  rig.body.traverse((o) => {
    if (!(o instanceof THREE.Mesh)) return;
    const g = o.geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, o.matrixWorld));
    parts.push(g);
  });
  const merged = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!merged) return;
  const far = new THREE.Mesh(merged, materials().flat);
  far.visible = false;
  rig.group.add(far);
  rig.far = far;
}

export function setFar(rig: PersonRig, far: boolean): void {
  if (!rig.far || rig.far.visible === far) return;
  rig.far.visible = far;
  rig.body.visible = !far;
}

let shadowTexture: THREE.CanvasTexture | null = null;

export function createBlobShadow(scale = 1): THREE.Mesh {
  /* No canvas outside the browser (unit tests): a plain dark disc. */
  if (!shadowTexture && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(48, 48, 4, 48, 48, 46);
      gradient.addColorStop(0, 'rgba(30,22,15,0.55)');
      gradient.addColorStop(0.55, 'rgba(30,22,15,0.28)');
      gradient.addColorStop(1, 'rgba(30,22,15,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 96, 96);
    }
    shadowTexture = new THREE.CanvasTexture(canvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
  }
  const material = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.85
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6 * scale, 1.6 * scale), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 2;
  return mesh;
}

/* Bends knees and elbows when the rig has them. */
export function setJoints(rig: PersonRig, knees: [number, number], elbows: [number, number]): void {
  if (rig.leftShin) rig.leftShin.rotation.x = knees[0];
  if (rig.rightShin) rig.rightShin.rotation.x = knees[1];
  if (rig.leftForearm) rig.leftForearm.rotation.x = elbows[0];
  if (rig.rightForearm) rig.rightForearm.rotation.x = elbows[1];
}

export function animateWalk(rig: PersonRig, phase: number, speedRatio: number): void {
  const swing = Math.sin(phase) * 0.55 * speedRatio;
  rig.leftLeg.rotation.x = swing;
  rig.rightLeg.rotation.x = -swing;
  rig.leftArm.rotation.x = -swing * 0.8;
  rig.rightArm.rotation.x = swing * 0.8;
  rig.body.position.y = Math.abs(Math.sin(phase)) * 0.035 * speedRatio;
  /* The knee folds while that leg swings forward; elbows bend more when running. */
  const c = Math.cos(phase);
  const bend = 0.95 * speedRatio;
  const elbow = -(0.22 + 0.45 * speedRatio);
  setJoints(rig, [0.06 + Math.max(0, -c) * bend, 0.06 + Math.max(0, c) * bend], [elbow, elbow]);
  if (rig.head) {
    rig.head.rotation.x = -Math.abs(Math.sin(phase)) * 0.04 * speedRatio;
    rig.head.rotation.y = 0;
  }
}

export function animateIdle(rig: PersonRig, time: number, amount = 1): void {
  rig.body.position.y = Math.sin(time * 1.6) * 0.012 * amount;
  rig.leftArm.rotation.x = Math.sin(time * 1.1) * 0.05 * amount;
  rig.rightArm.rotation.x = -Math.sin(time * 1.1) * 0.05 * amount;
  rig.leftLeg.rotation.x = 0;
  rig.rightLeg.rotation.x = 0;
  setJoints(rig, [0.02, 0.02], [-0.12, -0.12]);
  if (rig.head) {
    /* A slow look around the square. */
    rig.head.rotation.y = Math.sin(time * 0.37) * 0.22 * amount;
    rig.head.rotation.x = Math.sin(time * 0.53) * 0.03 * amount;
  }
}
