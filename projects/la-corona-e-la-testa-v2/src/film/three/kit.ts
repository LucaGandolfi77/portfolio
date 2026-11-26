/*
 * The prop shop: columns, arches, stairs, fires, furniture, houses, trees,
 * the Roman bridge and the cathedral of Fidenza, all built from primitives
 * with textures painted in mats.ts. Every builder returns a fresh Group.
 */
import * as THREE from 'three';
import { hash } from '../util';
import { Figure } from './figure';
import { CAST } from './cast';
import { glowMat, glowSprite, mat, type MatOpts } from './mats';

export type M = THREE.Material;

export function add<T extends THREE.Object3D>(parent: THREE.Object3D, o: T, pos?: [number, number, number], rot?: [number, number, number]): T {
  if (pos) o.position.set(...pos);
  if (rot) o.rotation.set(...rot);
  parent.add(o);
  return o;
}

export function shade<T extends THREE.Object3D>(o: T, cast = true, receive = true): T {
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) {
      c.castShadow = cast;
      c.receiveShadow = receive;
    }
  });
  return o;
}

/** A box whose texture keeps the same scale whatever its size (`unit` metres per tile). */
export function boxUV(w: number, h: number, d: number, unit = 2): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const sizes: Array<[number, number]> = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++)
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v;
      uv.setXY(i, uv.getX(i) * (sizes[f][0] / unit), uv.getY(i) * (sizes[f][1] / unit));
    }
  return g;
}

export function box(w: number, h: number, d: number, m: M, unit = 2): THREE.Mesh {
  return shade(new THREE.Mesh(boxUV(w, h, d, unit), m));
}

/** A ground plane, textured at `unit` metres per tile. */
export function ground(w: number, d: number, m: M, unit = 4): THREE.Mesh {
  const g = new THREE.PlaneGeometry(w, d, 1, 1);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / unit), uv.getY(i) * (d / unit));
  g.rotateX(-Math.PI / 2);
  const o = new THREE.Mesh(g, m);
  o.receiveShadow = true;
  return o;
}

export function cyl(rt: number, rb: number, h: number, m: M, seg = 20): THREE.Mesh {
  return shade(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m));
}

export function sphere(r: number, m: M, seg = 18): THREE.Mesh {
  return shade(new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.7)), m));
}

export function lathe(points: Array<[number, number]>, m: M, seg = 24): THREE.Mesh {
  return shade(new THREE.Mesh(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), seg), m));
}

/* ---------- Architecture ---------- */

export const STUFF = {
  marble: (): M => mat({ color: '#f2ece0', rough: 0.35, map: 'marble' }),
  marbleWarm: (): M => mat({ color: '#e8d8c0', rough: 0.4, map: 'marble' }),
  porphyry: (): M => mat({ color: '#ffffff', rough: 0.3, map: 'porphyry' }),
  gold: (): M => mat({ color: '#e8b850', rough: 0.28, metal: 1 }),
  bronze: (): M => mat({ color: '#b88a4a', rough: 0.4, metal: 0.9 }),
  stone: (): M => mat({ color: '#d0c4b0', rough: 0.92, map: 'stone' }),
  stoneDark: (): M => mat({ color: '#8a8278', rough: 0.95, map: 'stone' }),
  brick: (): M => mat({ color: '#ffffff', rough: 0.9, map: 'brick' }),
  plaster: (): M => mat({ color: '#f0e2c8', rough: 0.95, map: 'plaster' }),
  wood: (): M => mat({ color: '#a87a50', rough: 0.8, map: 'wood' }),
  woodDark: (): M => mat({ color: '#6a4a30', rough: 0.85, map: 'wood' }),
  earth: (): M => mat({ color: '#ffffff', rough: 1, map: 'earth' }),
  grass: (): M => mat({ color: '#ffffff', rough: 1, map: 'grass' }),
  roof: (): M => mat({ color: '#ffffff', rough: 0.85, map: 'roof' }),
  paving: (): M => mat({ color: '#ffffff', rough: 0.7, map: 'paving' }),
  cobble: (): M => mat({ color: '#ffffff', rough: 0.85, map: 'cobble' }),
  floorMosaic: (): M => mat({ color: '#ffffff', rough: 0.45, map: 'floorMosaic' }),
  mosaicGold: (): M => mat({ color: '#ffffff', rough: 0.3, metal: 0.6, map: 'mosaic', emissive: '#3a2408', emissiveIntensity: 0.6 }),
  cloth: (color: string): M => mat({ color, rough: 0.95, bump: 'cloth', bumpScale: 0.6, repeat: 2 }),
  straw: (): M => mat({ color: '#b8a060', rough: 1, bump: 'grain', bumpScale: 1 }),
  iron: (): M => mat({ color: '#3a3836', rough: 0.6, metal: 0.8 }),
  dark: (): M => mat({ color: '#0c0a0a', rough: 1 }),
};

/** A column with base and capital. */
export function column(h: number, r: number, shaft: M, trim: M = STUFF.marble()): THREE.Group {
  const g = new THREE.Group();
  add(g, box(r * 2.6, r * 0.5, r * 2.6, trim), [0, r * 0.25, 0]);
  add(g, shade(new THREE.Mesh(new THREE.TorusGeometry(r * 1.08, r * 0.18, 8, 24), trim)), [0, r * 0.6, 0], [Math.PI / 2, 0, 0]);
  add(g, cyl(r * 0.88, r, h - r * 1.6, shaft, 24), [0, r * 0.5 + (h - r * 1.6) / 2, 0]);
  add(g, cyl(r * 1.3, r * 0.9, r * 0.6, trim, 20), [0, h - r * 0.8, 0]);
  add(g, box(r * 2.8, r * 0.36, r * 2.8, trim), [0, h - r * 0.32, 0]);
  return g;
}

/** A round arch in a wall: a slab of width w and height h with an arched opening. */
export function archWall(w: number, h: number, depth: number, open: number, springAt: number, m: M): THREE.Mesh {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, h);
  s.lineTo(-w / 2, h);
  s.lineTo(-w / 2, 0);
  const hole = new THREE.Path();
  hole.moveTo(-open / 2, 0);
  hole.lineTo(-open / 2, springAt);
  hole.absarc(0, springAt, open / 2, Math.PI, 0, true);
  hole.lineTo(open / 2, 0);
  hole.lineTo(-open / 2, 0);
  s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 18 });
  geo.translate(0, 0, -depth / 2);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2, uv.getY(i) / 2);
  return shade(new THREE.Mesh(geo, m));
}

/** A flat arched shape, filled (a dark doorway, a window, a niche). */
export function archShape(w: number, h: number, m: M): THREE.Mesh {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h - w / 2);
  s.absarc(0, h - w / 2, w / 2, Math.PI, 0, true);
  s.lineTo(w / 2, 0);
  s.lineTo(-w / 2, 0);
  return new THREE.Mesh(new THREE.ShapeGeometry(s, 16), m);
}

export function stairs(n: number, w: number, rise: number, run: number, m: M): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) add(g, box(w - i * 0.3, rise * (i + 1), run, m), [0, (rise * (i + 1)) / 2, -i * run]);
  return g;
}

/** A gabled roof as a prism: width along x, depth along z. */
export function roof(w: number, d: number, h: number, m: M): THREE.Mesh {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 - 0.25, 0);
  s.lineTo(0, h);
  s.lineTo(w / 2 + 0.25, 0);
  s.lineTo(-w / 2 - 0.25, 0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: d + 0.4, bevelEnabled: false });
  geo.translate(0, 0, -(d + 0.4) / 2);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2.5, uv.getY(i) / 2.5);
  return shade(new THREE.Mesh(geo, m));
}

/* ---------- Light ---------- */

export interface Flame {
  group: THREE.Group;
  light?: THREE.PointLight;
  sprites: THREE.Sprite[];
  base: number;
  seed: number;
}

/** A living flame: glowing sprites and (optionally) a point light. */
export function flame(size: number, withLight = 0, color = '#ffa850', seed = 1): Flame {
  const group = new THREE.Group();
  const sprites = [glowSprite('#ff7a28', size * 1.5, 0.3), glowSprite(color, size * 0.8, 0.6), glowSprite('#fff0c0', size * 0.32, 0.9)];
  sprites.forEach((s, i) => add(group, s, [0, size * (0.2 + i * 0.15), 0]));
  const core = new THREE.Mesh(new THREE.ConeGeometry(size * 0.22, size * 0.8, 10), glowMat('#ffd890', 0.9));
  add(group, core, [0, size * 0.35, 0]);
  let light: THREE.PointLight | undefined;
  if (withLight > 0) {
    light = new THREE.PointLight(color, withLight, size * 30, 1.6);
    light.position.y = size * 0.5;
    group.add(light);
  }
  return { group, light, sprites, base: withLight, seed };
}

export function flicker(f: Flame, time: number): void {
  const k = 0.82 + Math.sin(time * 11 + f.seed) * 0.07 + Math.sin(time * 17.3 + f.seed * 2) * 0.06 + Math.sin(time * 4.1 + f.seed) * 0.05;
  if (f.light) f.light.intensity = f.base * k;
  f.sprites.forEach((s, i) => {
    const base = s.userData.base ?? (s.userData.base = s.scale.x);
    s.scale.setScalar(base * (0.9 + (k - 0.82) * (i + 1) * 0.8));
  });
}

export function brazier(flames: Flame[], light = 6, seed = 1): THREE.Group {
  const g = new THREE.Group();
  const bronze = STUFF.bronze();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = add(g, cyl(0.025, 0.03, 1.1, bronze, 8), [Math.cos(a) * 0.2, 0.52, Math.sin(a) * 0.2]);
    leg.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25);
  }
  add(g, lathe([[0.05, 0], [0.3, 0.12], [0.36, 0.22], [0.34, 0.24], [0.05, 0.08]], bronze), [0, 1.0, 0]);
  const f = flame(0.42, light, '#ffa040', seed);
  add(g, f.group, [0, 1.2, 0]);
  flames.push(f);
  return g;
}

export function wallTorch(flames: Flame[], light = 3, seed = 2): THREE.Group {
  const g = new THREE.Group();
  add(g, cyl(0.03, 0.02, 0.45, STUFF.woodDark(), 8), [0, 0, 0.12], [0.5, 0, 0]);
  add(g, cyl(0.05, 0.035, 0.1, STUFF.iron(), 10), [0, 0.2, 0.23]);
  const f = flame(0.2, light, '#ffa850', seed);
  add(g, f.group, [0, 0.25, 0.24]);
  flames.push(f);
  return g;
}

/* ---------- Furniture ---------- */

export function throne(): THREE.Group {
  const g = new THREE.Group();
  const gold = STUFF.gold();
  const red = STUFF.cloth('#7a1028');
  add(g, box(1.1, 0.5, 0.8, gold), [0, 0.25, 0]);
  add(g, box(0.95, 0.12, 0.7, red), [0, 0.56, 0.02]);
  add(g, box(1.1, 1.6, 0.14, gold), [0, 1.0, -0.36]);
  add(g, box(0.85, 1.25, 0.05, red), [0, 1.05, -0.28]);
  add(g, sphere(0.12, gold), [0, 1.86, -0.36]);
  for (const s of [1, -1]) {
    add(g, box(0.12, 0.35, 0.75, gold), [0.52 * s, 0.68, 0]);
    add(g, sphere(0.08, gold), [0.52 * s, 0.9, 0.34]);
  }
  return g;
}

export function table(w: number, d: number, m: M = STUFF.wood()): THREE.Group {
  const g = new THREE.Group();
  add(g, box(w, 0.07, d, m, 1), [0, 0.75, 0]);
  for (const x of [1, -1]) for (const z of [1, -1]) add(g, box(0.07, 0.72, 0.07, m, 1), [x * (w / 2 - 0.1), 0.36, z * (d / 2 - 0.1)]);
  return g;
}

export function bench(w: number, m: M = STUFF.wood()): THREE.Group {
  const g = new THREE.Group();
  add(g, box(w, 0.06, 0.32, m, 1), [0, 0.45, 0]);
  for (const x of [1, -1]) add(g, box(0.06, 0.43, 0.28, m, 1), [x * (w / 2 - 0.12), 0.215, 0]);
  return g;
}

export function bed(w: number, l: number, sheet = '#e8dcc4', blanket = '#7a3a2a'): THREE.Group {
  const g = new THREE.Group();
  const wood = STUFF.woodDark();
  add(g, box(w, 0.35, l, wood, 1), [0, 0.18, 0]);
  add(g, box(w - 0.06, 0.12, l - 0.06, STUFF.cloth(sheet)), [0, 0.41, 0]);
  add(g, box(w - 0.02, 0.08, l * 0.6, STUFF.cloth(blanket)), [0, 0.48, l * 0.18]);
  add(g, box(w * 0.6, 0.1, 0.32, STUFF.cloth('#f0e8d8')), [0, 0.52, -l / 2 + 0.25]);
  add(g, box(w, 0.8, 0.08, wood, 1), [0, 0.4, -l / 2]);
  return g;
}

export function barrel(r = 0.4, h = 0.95): THREE.Group {
  const g = new THREE.Group();
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= 10; i++) {
    const y = (i / 10) * h;
    pts.push([r * (0.84 + Math.sin((i / 10) * Math.PI) * 0.16), y]);
  }
  add(g, lathe(pts, STUFF.wood(), 20));
  for (const y of [0.12, 0.5, 0.88]) add(g, shade(new THREE.Mesh(new THREE.TorusGeometry(r * (0.86 + Math.sin(y * Math.PI) * 0.15), 0.012, 6, 28), STUFF.iron())), [0, y * h, 0], [Math.PI / 2, 0, 0]);
  add(g, cyl(r * 0.84, r * 0.84, 0.02, STUFF.woodDark()), [0, h, 0]);
  return g;
}

export function amphora(m: M = mat({ color: '#b0683a', rough: 0.8 })): THREE.Mesh {
  return lathe([[0, 0], [0.05, 0.02], [0.17, 0.25], [0.2, 0.45], [0.16, 0.62], [0.06, 0.72], [0.05, 0.85], [0.07, 0.88], [0, 0.88]], m, 18);
}

export function chest(m: M = STUFF.woodDark()): THREE.Group {
  const g = new THREE.Group();
  add(g, box(0.9, 0.5, 0.5, m, 1), [0, 0.25, 0]);
  add(g, box(0.92, 0.12, 0.52, STUFF.bronze()), [0, 0.52, 0]);
  return g;
}

/* ---------- Countryside ---------- */

export function poplar(h: number, seed: number, leaves = '#5a6a32'): THREE.Group {
  const g = new THREE.Group();
  add(g, cyl(0.08, 0.14, h * 0.35, STUFF.woodDark(), 8), [0, h * 0.17, 0]);
  const leaf = mat({ color: leaves, rough: 0.95, flat: true });
  for (let i = 0; i < 6; i++) {
    const y = h * (0.3 + i * 0.12);
    const r = (0.75 - Math.abs(i - 2.2) * 0.12) * (0.8 + hash(seed + i) * 0.3);
    const s = add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), leaf), [(hash(seed * 3 + i) - 0.5) * 0.2, y, (hash(seed * 7 + i) - 0.5) * 0.2]);
    s.scale.set(r, h * 0.11, r);
    s.castShadow = true;
  }
  return g;
}

export function tree(r: number, seed: number, leaves = '#4a5a2a'): THREE.Group {
  const g = new THREE.Group();
  add(g, cyl(r * 0.1, r * 0.16, r * 1.3, STUFF.woodDark(), 8), [0, r * 0.65, 0]);
  const leaf = mat({ color: leaves, rough: 0.95, flat: true });
  for (let i = 0; i < 5; i++) {
    const s = add(g, new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), leaf), [(hash(seed + i) - 0.5) * r, r * 1.5 + hash(seed * 2 + i) * r * 0.5, (hash(seed * 5 + i) - 0.5) * r]);
    s.scale.setScalar(r * (0.55 + hash(seed + i * 3) * 0.3));
    s.castShadow = true;
  }
  return g;
}

/** A house: plastered or brick walls, tiled roof, windows that glow at night. */
export function house(w: number, d: number, h: number, seed: number, lit = 0, wall?: M): THREE.Group {
  const g = new THREE.Group();
  const walls = wall ?? (hash(seed) > 0.5 ? STUFF.plaster() : STUFF.brick());
  add(g, box(w, h, d, walls, 2), [0, h / 2, 0]);
  add(g, roof(w, d, w * 0.32, STUFF.roof()), [0, h, 0]);
  const win = lit > 0 ? glowMat('#ffb050', 0.9, false) : STUFF.dark();
  const floors = Math.max(1, Math.floor(h / 2.6));
  for (let f = 0; f < floors; f++)
    for (let i = 0; i < Math.max(1, Math.floor(w / 2)); i++) {
      if (hash(seed + f * 7 + i) < 0.3) continue;
      const shine = lit > 0 && hash(seed * 3 + f + i * 5) < lit;
      const x = -w / 2 + (i + 0.5) * (w / Math.max(1, Math.floor(w / 2)));
      add(g, archShape(0.5, 0.9, shine ? win : STUFF.dark()), [x, 0.9 + f * 2.6, d / 2 + 0.01]);
    }
  if (h < 4) add(g, archShape(0.9, 1.9, STUFF.dark()), [w * 0.2, 0, d / 2 + 0.01]);
  return g;
}

/** A Roman bridge of stone arches over a river running along x. */
export function romanBridge(spans: number, span: number, h: number, width: number): THREE.Group {
  const g = new THREE.Group();
  const m = STUFF.stone();
  const len = spans * span;
  for (let i = 0; i < spans; i++) {
    const a = archWall(span, h, width, span * 0.72, h * 0.32, m);
    add(g, a, [-len / 2 + span / 2 + i * span, 0, 0], [0, Math.PI / 2, 0]);
    a.position.set(0, 0, -len / 2 + span / 2 + i * span);
  }
  add(g, box(width + 0.3, 0.3, len, m), [0, h + 0.15, 0]);
  for (const s of [1, -1]) add(g, box(0.25, 0.6, len, m), [s * (width / 2), h + 0.6, 0]);
  return g;
}

/* ---------- Statues and the cathedral ---------- */

/** A stone figure on a pedestal, built from the same puppets as the actors. */
export function statue(look: keyof typeof CAST, pose: Parameters<Figure['apply']>[0]['pose'], opts: { headless?: boolean; item?: Parameters<Figure['apply']>[0]['item']; scale?: number } = {}): { group: THREE.Group; figure: Figure } {
  const fig = new Figure(CAST[look], { stone: true, headless: opts.headless });
  fig.apply({ pose, from: pose, blend: 1, walk: 0, phase: 0, speaking: false, time: 2, mood: 'calm', lookYaw: 0, lookPitch: 0, item: opts.item ?? null, glow: 0, seed: 3 });
  fig.root.scale.multiplyScalar(opts.scale ?? 1);
  const g = new THREE.Group();
  g.add(fig.root);
  return { group: g, figure: fig };
}

export interface Cathedral {
  group: THREE.Group;
  /** Where the statue of the saint stands (world, set coordinates). */
  niche: THREE.Vector3;
  portalLights: THREE.Object3D[];
}

/**
 * The cathedral of Fidenza, as its Romanesque front: two square towers, a
 * central body with three portals, lions, a loggia and the niche of the saint.
 * `built` (0..1) raises it from its foundations; `lit` lights its portals.
 */
export function cathedral(built = 1, lit = 0, age: 'old' | 'new' = 'old'): Cathedral {
  const g = new THREE.Group();
  const stone = age === 'old' ? mat({ color: '#e6d2b0', rough: 0.9, map: 'stone' }) : mat({ color: '#f0e0c0', rough: 0.85, map: 'stone' });
  const trim = mat({ color: '#f4e8d4', rough: 0.6, map: 'marble' });
  const pink = mat({ color: '#d8a890', rough: 0.7, map: 'marble' });
  const dark = STUFF.dark();
  const H = 15 * built;
  const portalLights: THREE.Object3D[] = [];
  /* Central body. */
  add(g, box(13, H, 3, stone, 3), [0, H / 2, 0]);
  if (built > 0.9) {
    const gable = new THREE.Shape();
    gable.moveTo(-6.5, 0);
    gable.lineTo(0, 4.2);
    gable.lineTo(6.5, 0);
    gable.lineTo(-6.5, 0);
    const gg = new THREE.ExtrudeGeometry(gable, { depth: 3, bevelEnabled: false });
    gg.translate(0, 0, -1.5);
    add(g, shade(new THREE.Mesh(gg, stone)), [0, H, 0]);
    /* Loggia: a row of small arches under the gable. */
    for (let i = -5; i <= 5; i++) {
      add(g, column(1.6, 0.09, trim, trim), [i * 1.05, H - 2.6, 1.6]);
      add(g, archShape(0.85, 1.5, dark), [i * 1.05 + 0.52, H - 2.6, 1.52]);
    }
    add(g, box(13.2, 0.3, 0.5, trim), [0, H - 2.7, 1.6]);
    add(g, box(13.2, 0.3, 0.5, trim), [0, H - 0.95, 1.6]);
  }
  /* Towers. */
  for (const s of [1, -1]) {
    const th = Math.min(24, 24 * built * 1.05);
    add(g, box(5, th, 5, stone, 3), [s * 9, th / 2, -0.5]);
    if (built > 0.95) {
      add(g, roof(5, 5, 2.5, STUFF.roof()), [s * 9, th, -0.5]);
      for (let f = 0; f < 3; f++) add(g, archShape(0.9, 2 + f * 0.3, dark), [s * 9, 12 + f * 3.6, 2.02]);
      add(g, box(5.3, 0.3, 5.3, trim), [s * 9, th - 0.15, -0.5]);
    }
  }
  /* Portals: deep stepped arches, the middle one guarded by lions. */
  const portals: Array<[number, number, number]> = [[0, 2.8, 5.2], [-4.6, 1.8, 3.6], [4.6, 1.8, 3.6]];
  if (built > 0.35)
    for (const [x, w, h] of portals) {
      for (let k = 0; k < 3; k++) add(g, archShape(w + 0.6 - k * 0.3, h + 0.5 - k * 0.2, k % 2 ? pink : trim), [x, 0, 1.52 + k * 0.01]);
      const door = add(g, archShape(w - 0.4, h - 0.3, lit > 0 ? glowMat('#ffb860', 0.55 + lit * 0.35, false) : mat({ color: '#3a2214', rough: 0.8, map: 'wood' })), [x, 0, 1.56]);
      if (lit > 0) portalLights.push(door);
      if (w > 2.5) {
        /* The lions that carry the porch columns. */
        for (const s of [1, -1]) {
          const lion = new THREE.Group();
          add(lion, sphere(0.42, pink), [0, 0.45, 0]).scale.set(0.8, 0.8, 1.3);
          add(lion, sphere(0.3, pink), [0, 0.75, 0.45]);
          add(lion, sphere(0.36, pink), [0, 0.82, 0.38]).scale.set(1.1, 1, 0.7);
          add(g, lion, [s * 2.0, 0.6, 2.6]);
          add(g, box(1.1, 0.6, 1.4, trim), [s * 2.0, 0.3, 2.4]);
          add(g, column(3.2, 0.16, pink, trim), [s * 2.0, 1.4, 2.6]);
        }
        add(g, archWall(4.6, 1.3, 1.4, 4.0, 0, trim), [0, 4.55, 2.6]);
      }
    }
  /* The frieze band with the story of the saint, and his niche. */
  const niche = new THREE.Vector3(-3.0, 5.2, 1.7);
  if (built > 0.5) {
    add(g, box(13.2, 0.5, 0.35, trim), [0, 8.3, 1.6]);
    add(g, archShape(1.6, 2.7, mat({ color: '#3a2c20', rough: 1 })), [niche.x, niche.y - 0.2, 1.53]);
    add(g, archWall(2.1, 3.0, 0.3, 1.6, 1.9, trim), [niche.x, niche.y - 0.2, 1.68]);
    add(g, box(1.9, 0.18, 0.55, trim), [niche.x, niche.y - 0.27, 1.75]);
  }
  return { group: g, niche, portalLights };
}

export function streetLamp(flames: Flame[], seed: number, light = 4): THREE.Group {
  const g = new THREE.Group();
  const iron = STUFF.iron();
  add(g, cyl(0.06, 0.09, 4, iron, 10), [0, 2, 0]);
  add(g, cyl(0.25, 0.1, 0.4, iron, 8), [0, 4.2, 0]);
  const f = flame(0.0001, light, '#ffcf88', seed);
  f.sprites.forEach((s) => s.removeFromParent());
  const bulb = glowSprite('#ffd8a0', 1.4, 0.9);
  f.group.add(bulb);
  f.sprites.push(bulb);
  bulb.scale.setScalar(1.4);
  add(f.group, sphere(0.14, glowMat('#fff0d0', 1, false)), [0, 0, 0]);
  add(g, f.group, [0, 4.0, 0]);
  if (f.light) f.light.distance = 16;
  flames.push(f);
  return g;
}

export function scaffold(w: number, h: number): THREE.Group {
  const g = new THREE.Group();
  const wood = STUFF.wood();
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 2) for (const z of [0, 1.2]) add(g, cyl(0.06, 0.06, h, wood, 6), [x, h / 2, z]);
  for (let y = 2; y < h; y += 2.2) {
    add(g, box(w, 0.06, 1.4, wood, 1), [0, y, 0.6]);
    add(g, cyl(0.04, 0.04, w, wood, 6), [0, y + 0.9, 1.2], [0, 0, Math.PI / 2]);
  }
  return g;
}

export function milestone(): THREE.Group {
  const g = new THREE.Group();
  add(g, cyl(0.28, 0.32, 1.4, STUFF.stone(), 18), [0, 0.7, 0]);
  add(g, box(0.75, 0.15, 0.75, STUFF.stone()), [0, 0.07, 0]);
  return g;
}

export function rocks(n: number, spread: number, seed: number, m: M = STUFF.stoneDark()): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const r = 0.2 + hash(seed + i) * 0.6;
    const o = add(g, new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), m), [(hash(seed * 3 + i) - 0.5) * spread, r * 0.3, (hash(seed * 5 + i) - 0.5) * spread * 0.4]);
    o.rotation.set(hash(i) * 3, hash(i + 1) * 3, 0);
    o.scale.y = 0.6;
    shade(o);
  }
  return g;
}

/* ---------- Water and sky ---------- */

export interface Water {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
}

export function water(w: number, d: number, color: string): Water {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.92 });
  const n = new THREE.CanvasTexture(waterNormals());
  n.wrapS = n.wrapT = THREE.RepeatWrapping;
  n.repeat.set(w / 6, d / 6);
  material.normalMap = n;
  material.normalScale.set(0.6, 0.6);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return { mesh, material };
}

function waterNormals(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const u = (x / 256) * Math.PI * 2;
      const v = (y / 256) * Math.PI * 2;
      const dx = Math.cos(u * 3 + v * 2) * 0.5 + Math.cos(u * 7 - v * 3) * 0.3 + Math.cos(u * 13 + v * 11) * 0.15;
      const dy = Math.sin(v * 4 + u) * 0.5 + Math.sin(v * 9 - u * 5) * 0.3 + Math.sin(v * 15 + u * 7) * 0.15;
      const i = (y * 256 + x) * 4;
      img.data[i] = 128 + dx * 70;
      img.data[i + 1] = 128 + dy * 70;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  return c;
}

export interface SkyColors {
  top: string;
  horizon: string;
  bottom: string;
  sun: string;
  /** Direction towards the sun (or the moon). */
  dir: THREE.Vector3;
  stars: number;
  sunSize: number;
}

export function skyDome(c: SkyColors): THREE.Mesh {
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(c.top) },
      horizon: { value: new THREE.Color(c.horizon) },
      bottom: { value: new THREE.Color(c.bottom) },
      sun: { value: new THREE.Color(c.sun) },
      dir: { value: c.dir.clone().normalize() },
      stars: { value: c.stars },
      sunSize: { value: c.sunSize },
      time: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sun; uniform vec3 dir;
      uniform float stars; uniform float sunSize; uniform float time;
      varying vec3 vDir;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(horizon, bottom, clamp(-h * 4.0, 0.0, 1.0));
        float s = max(dot(d, normalize(dir)), 0.0);
        col += sun * (pow(s, 6.0) * 0.35 + pow(s, 60.0) * 0.6);
        col += sun * smoothstep(1.0 - sunSize * 0.0006, 1.0 - sunSize * 0.0004, s) * 2.5;
        if (stars > 0.0 && h > 0.0) {
          vec3 cell = floor(d * 260.0);
          float r = hash(cell);
          float tw = 0.7 + 0.3 * sin(time * 2.0 + r * 40.0);
          col += vec3(0.9, 0.92, 1.0) * step(0.9965, r) * stars * tw * smoothstep(0.0, 0.3, h);
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), m);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return mesh;
}

export { glowMat, glowSprite, mat };
export type { MatOpts };
