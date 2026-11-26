import * as THREE from 'three';
import { FIDENZA, type FidenzaBuilding } from '../data/fidenza';
import { signedArea } from '../data/colliders';
import { VEHICULAR } from '../data/roads';
import type { TextureSet, FacadeStyle } from './textures';

/*
 * The town as textured, chunked meshes. Each 320 m chunk has at most one
 * mesh per surface (facade styles, shopfronts, tiles, flat roofs, asphalt,
 * pavers, grass, dirt, water), so the camera frustum drops whole chunks and
 * a phone draws a few dozen batches.
 */

const CHUNK = 320;
const FLOOR = 3;
const BAY = 4;
const GROUND = 3.6;

class MeshBuilder {
  pos: number[] = [];
  nor: number[] = [];
  uv: number[] = [];
  col: number[] = [];
  private c = new THREE.Color();

  get empty(): boolean {
    return this.pos.length === 0;
  }

  vert(x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number): void {
    this.pos.push(x, y, z);
    this.nor.push(nx, ny, nz);
    this.uv.push(u, v);
    this.col.push(this.c.r, this.c.g, this.c.b);
  }

  color(hex: number): this {
    this.c.set(hex);
    return this;
  }

  /** Quad a-b-c-d (counter-clockwise seen from the visible side). */
  quad(
    a: [number, number, number, number, number],
    b: [number, number, number, number, number],
    c: [number, number, number, number, number],
    d: [number, number, number, number, number],
    n: [number, number, number]
  ): void {
    for (const p of [a, b, c, a, c, d]) this.vert(p[0], p[1], p[2], n[0], n[1], n[2], p[3], p[4]);
  }

  tri(a: number[], b: number[], c: number[], n: [number, number, number]): void {
    for (const p of [a, b, c]) this.vert(p[0], p[1], p[2], n[0], n[1], n[2], p[3], p[4]);
  }

  build(material: THREE.Material): THREE.Mesh {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    const mesh = new THREE.Mesh(g, material);
    mesh.matrixAutoUpdate = false;
    return mesh;
  }
}

type Surface = FacadeStyle | 'shop' | 'tiles' | 'flat' | 'asphalt' | 'pavers' | 'grass' | 'dirt' | 'water' | 'gravel';

export interface CityMaterials {
  all: Record<Surface, THREE.MeshLambertMaterial>;
  /** Materials whose windows light up at night. */
  lit: THREE.MeshLambertMaterial[];
}

export function createMaterials(tex: TextureSet): CityMaterials {
  const facade = (s: FacadeStyle): THREE.MeshLambertMaterial =>
    new THREE.MeshLambertMaterial({
      map: tex.facades[s].map,
      vertexColors: true,
      emissive: 0xffffff,
      emissiveMap: tex.facades[s].emissive,
      emissiveIntensity: 0
    });
  const plain = (map: THREE.Texture | null, color = 0xffffff): THREE.MeshLambertMaterial =>
    new THREE.MeshLambertMaterial({ map, color, vertexColors: true });
  const all: Record<Surface, THREE.MeshLambertMaterial> = {
    historic: facade('historic'),
    block: facade('block'),
    modern: facade('modern'),
    shop: new THREE.MeshLambertMaterial({
      map: tex.shop.map,
      vertexColors: true,
      emissive: 0xffffff,
      emissiveMap: tex.shop.emissive,
      emissiveIntensity: 0
    }),
    tiles: plain(tex.tiles),
    flat: plain(tex.concrete),
    asphalt: plain(tex.asphalt),
    pavers: plain(tex.pavers),
    grass: plain(tex.grass),
    dirt: plain(tex.dirt),
    gravel: plain(tex.dirt, 0x77706a),
    water: new THREE.MeshLambertMaterial({ color: 0x4f6f78, vertexColors: true, emissive: 0x0b1a20 })
  };
  return { all, lit: [all.historic, all.block, all.modern, all.shop] };
}

const HISTORIC = [0xe6bf7a, 0xe2a585, 0xcf8463, 0xecd496, 0xf1e4c8, 0xe7c2ab, 0xdcc29a, 0xd99a6c, 0xefd9b0];
const PLAIN = [0xf1e6d0, 0xf8f2e2, 0xe9cdb4, 0xdbc08d, 0xefe0c5, 0xe3c8ac, 0xd8d2c6, 0xcfc7b8];
const ROOFS = [0xb15f42, 0xa9573e, 0x9e5b45, 0xb96845, 0x95503a, 0xc0714d];

const hash = (id: string, s = 0): number => {
  let h = s;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
};
const isCentral = (b: FidenzaBuilding): boolean =>
  Math.hypot(b.x + 280, b.z - 5) < 170 || Math.hypot(b.x - 15, b.z + 21) < 140;

function styleOf(b: FidenzaBuilding): FacadeStyle {
  if (['industrial', 'retail', 'commercial', 'warehouse', 'school', 'hospital'].includes(b.kind) || b.area > 1500) return 'modern';
  if (isCentral(b) || b.kind === 'church') return 'historic';
  if (b.h > 13 || b.kind === 'apartments') return 'block';
  return hash(b.id, 3) % 3 === 0 ? 'block' : 'historic';
}

const HSL = { h: 0, s: 0, l: 0 };
function roofColour(b: FidenzaBuilding): number {
  if (b.roof === undefined) return ROOFS[hash(b.id, 5) % ROOFS.length];
  const c = new THREE.Color(b.roof);
  c.getHSL(HSL);
  c.setHSL(HSL.h, Math.min(1, HSL.s * 1.7 + 0.08), THREE.MathUtils.clamp(HSL.l * 0.95, 0.2, 0.62));
  return c.getHex();
}

function wallColour(b: FidenzaBuilding): number {
  if (b.kind === 'church') return 0xf3ead8;
  if (b.kind === 'industrial') return 0xc9c1b0;
  const list = isCentral(b) ? HISTORIC : PLAIN;
  return list[hash(b.id) % list.length];
}

function centroid(pts: number[]): { x: number; z: number } {
  let x = 0, z = 0;
  const n = pts.length / 2;
  for (let i = 0; i < n; i++) {
    x += pts[i * 2];
    z += pts[i * 2 + 1];
  }
  return { x: x / n, z: z / n };
}

export interface TreeBatch {
  crowns: THREE.InstancedMesh;
  trees: Array<{ x: number; z: number; h: number }>;
}

export interface CityRender {
  group: THREE.Group;
  materials: CityMaterials;
  lampGlow: THREE.MeshBasicMaterial;
  lampBulb: THREE.MeshBasicMaterial;
  trees: TreeBatch[];
}

type Builder = (x: number, z: number, s: Surface) => MeshBuilder;

interface Cell {
  key: string;
  cx: number;
  cz: number;
  buildings: FidenzaBuilding[];
  areas: typeof FIDENZA.areas;
  roads: Array<{ road: (typeof FIDENZA.roads)[number]; index: number }>;
  rails: typeof FIDENZA.railways;
  waters: typeof FIDENZA.waterways;
  trees: typeof FIDENZA.trees;
  lamps: Array<[number, number]>;
  objects: THREE.Object3D[] | null;
  batch: TreeBatch | null;
}

/*
 * Streaming town: everything is sorted into 320 m cells once (cheap); a
 * cell's meshes are built when it comes within the view radius, a few
 * milliseconds per frame, and released when it leaves. Startup is faster
 * and a phone only keeps the neighbourhood in memory.
 */
export class CityStream implements CityRender {
  readonly group = new THREE.Group();
  readonly materials: CityMaterials;
  readonly lampGlow: THREE.MeshBasicMaterial;
  readonly lampBulb: THREE.MeshBasicMaterial;
  /** Tree batches of the cells currently built (SeasonLook recolours them). */
  readonly trees: TreeBatch[] = [];
  private cells = new Map<string, Cell>();
  private shared: SharedGeometry;

  constructor(tex: TextureSet) {
    this.group.name = 'city';
    this.materials = createMaterials(tex);
    this.lampGlow = new THREE.MeshBasicMaterial({
      map: tex.glow,
      color: 0xffb460,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.lampBulb = new THREE.MeshBasicMaterial({ color: 0x55504a });
    this.shared = sharedGeometry();
    const cell = (x: number, z: number): Cell => {
      const cx = Math.floor(x / CHUNK), cz = Math.floor(z / CHUNK);
      const key = `${cx},${cz}`;
      let c = this.cells.get(key);
      if (!c) {
        c = { key, cx, cz, buildings: [], areas: [], roads: [], rails: [], waters: [], trees: [], lamps: [], objects: null, batch: null };
        this.cells.set(key, c);
      }
      return c;
    };
    const v = FIDENZA.meta.view;
    for (let x = Math.floor(v.minX / CHUNK) * CHUNK; x < v.maxX; x += CHUNK) {
      for (let z = Math.floor(v.minZ / CHUNK) * CHUNK; z < v.maxZ; z += CHUNK) cell(x + 1, z + 1);
    }
    for (const b of FIDENZA.buildings) cell(b.x, b.z).buildings.push(b);
    for (const a of FIDENZA.areas) {
      const c = centroid(a.poly);
      cell(c.x, c.z).areas.push(a);
    }
    FIDENZA.roads.forEach((road, index) => cell(road.pts[0], road.pts[1]).roads.push({ road, index }));
    for (const r of FIDENZA.railways) cell(r.pts[0], r.pts[1]).rails.push(r);
    for (const w of FIDENZA.waterways) cell(w.pts[0], w.pts[1]).waters.push(w);
    for (const t of FIDENZA.trees) cell(t.x, t.z).trees.push(t);
    for (const l of lampSpots()) cell(l[0], l[1]).lamps.push(l);
  }

  get builtCells(): number {
    let n = 0;
    for (const c of this.cells.values()) if (c.objects) n++;
    return n;
  }

  /** Builds missing cells near (x, z), nearest first, within a time budget; drops far ones. */
  update(x: number, z: number, radius: number, budgetMs = 6): void {
    const start = performance.now();
    const distance = (c: Cell): number => {
      const dx = Math.max(0, Math.abs(x - (c.cx + 0.5) * CHUNK) - CHUNK / 2);
      const dz = Math.max(0, Math.abs(z - (c.cz + 0.5) * CHUNK) - CHUNK / 2);
      return Math.hypot(dx, dz);
    };
    const wanted: Cell[] = [];
    for (const c of this.cells.values()) {
      const d = distance(c);
      if (!c.objects && d <= radius) wanted.push(c);
      else if (c.objects && d > radius + CHUNK * 0.75) this.release(c);
    }
    wanted.sort((a, b) => distance(a) - distance(b));
    for (const c of wanted) {
      this.build(c);
      if (performance.now() - start > budgetMs) break;
    }
  }

  private build(c: Cell): void {
    const parts = new Map<Surface, MeshBuilder>();
    const builder: Builder = (_x, _z, s) => {
      let b = parts.get(s);
      if (!b) parts.set(s, (b = new MeshBuilder()));
      return b;
    };
    addBaseTile(c.cx * CHUNK, c.cz * CHUNK, builder);
    for (const a of c.areas) addArea(a, builder);
    for (const { road, index } of c.roads) addRoad(road, index, builder);
    for (const r of c.rails) ribbon(builder(0, 0, 'gravel').color(0xffffff), r.pts, 3.4, 0.04, 6);
    for (const w of c.waters) ribbon(builder(0, 0, 'water').color(0xffffff), w.pts, Math.max(3, w.w), 0.02, 10);
    for (const b of c.buildings) addBuilding(b, builder);
    const objects: THREE.Object3D[] = [];
    for (const [surface, mb] of parts) if (!mb.empty) objects.push(mb.build(this.materials.all[surface]));
    if (c.trees.length) {
      const t = treeMeshes(c.trees, this.shared);
      objects.push(t.crowns, t.trunks);
      c.batch = { crowns: t.crowns, trees: c.trees };
      this.trees.push(c.batch);
    }
    if (c.lamps.length) objects.push(...lampMeshes(c.lamps, this.shared, this.lampGlow, this.lampBulb));
    for (const o of objects) this.group.add(o);
    c.objects = objects;
  }

  private release(c: Cell): void {
    for (const o of c.objects ?? []) {
      this.group.remove(o);
      if (o instanceof THREE.InstancedMesh) o.dispose();
      else if (o instanceof THREE.Mesh) o.geometry.dispose();
    }
    c.objects = null;
    if (c.batch) {
      this.trees.splice(this.trees.indexOf(c.batch), 1);
      c.batch = null;
    }
  }

  /** Builds every cell now (tests, or a desktop that wants it all). */
  buildAll(): void {
    for (const c of this.cells.values()) if (!c.objects) this.build(c);
  }
}

/** Kept for callers that want the whole town at once. */
export function buildCity(tex: TextureSet): CityStream {
  const city = new CityStream(tex);
  city.buildAll();
  return city;
}

function addBuilding(b: FidenzaBuilding, builder: Builder): void {
  const pts = b.poly;
  const n = pts.length / 2;
  if (n < 3) return;
  const ccw = signedArea(pts) > 0;
  const style = styleOf(b);
  const wall = wallColour(b);
  const h = b.h;
  const central = isCentral(b);
  const walls = builder(b.x, b.z, style).color(wall);
  const shops = builder(b.x, b.z, 'shop').color(wall);
  /* Offset v so each building shows a different slice of the texture noise. */
  const v0 = (hash(b.id, 9) % 7) * 0.13;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const ax = pts[i * 2], az = pts[i * 2 + 1], bx = pts[j * 2], bz = pts[j * 2 + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.3) continue;
    let nx = (bz - az) / len;
    let nz = -(bx - ax) / len;
    if (!ccw) {
      nx = -nx;
      nz = -nz;
    }
    /* Vertex order must face outwards: swap ends when needed. */
    const outward = (bz - az) * nx - (bx - ax) * nz >= 0;
    const [x1, z1, x2, z2] = outward ? [bx, bz, ax, az] : [ax, az, bx, bz];
    const u = Math.max(1, Math.round(len / BAY));
    const shopFloor = central && len > 5 && h > 6 && style === 'historic' && hash(b.id, i) % 3 !== 0;
    const groundTop = Math.min(GROUND, h);
    if (shopFloor) {
      shops.quad([x1, 0, z1, 0, 0], [x2, 0, z2, u, 0], [x2, groundTop, z2, u, 1], [x1, groundTop, z1, 0, 1], [nx, 0, nz]);
    } else {
      const vt = groundTop / FLOOR;
      walls.quad([x1, 0, z1, 0, v0 - 0.18], [x2, 0, z2, u, v0 - 0.18], [x2, groundTop, z2, u, v0 + vt - 0.18], [x1, groundTop, z1, 0, v0 + vt - 0.18], [nx, 0, nz]);
    }
    if (h > groundTop + 0.2) {
      const floors = (h - groundTop) / FLOOR;
      walls.quad([x1, groundTop, z1, 0, v0], [x2, groundTop, z2, u, v0], [x2, h, z2, u, v0 + floors], [x1, h, z1, 0, v0 + floors], [nx, 0, nz]);
    }
  }
  addRoof(b, builder, ccw);
}

function addRoof(b: FidenzaBuilding, builder: Builder, ccw: boolean): void {
  const pts = b.poly;
  const n = pts.length / 2;
  const flat = b.h > 20 || n > 12 || b.area > 900 || b.kind === 'industrial';
  const roof = roofColour(b);
  if (flat) {
    const mb = builder(b.x, b.z, 'flat').color(roof);
    const contour: THREE.Vector2[] = [];
    for (let i = 0; i < n; i++) contour.push(new THREE.Vector2(pts[i * 2], pts[i * 2 + 1]));
    const tris = THREE.ShapeUtils.triangulateShape(contour, []);
    for (const [a, c, d] of tris) {
      const p = [a, c, d].map((k) => [pts[k * 2], b.h + 0.05, pts[k * 2 + 1], pts[k * 2] / 6, pts[k * 2 + 1] / 6]);
      upTri(mb, p[0], p[1], p[2]);
    }
    return;
  }
  const mb = builder(b.x, b.z, 'tiles').color(roof);
  const c = centroid(pts);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, pts[i * 2]);
    maxX = Math.max(maxX, pts[i * 2]);
    minZ = Math.min(minZ, pts[i * 2 + 1]);
    maxZ = Math.max(maxZ, pts[i * 2 + 1]);
  }
  const minDim = Math.min(maxX - minX, maxZ - minZ);
  const rise = Math.min(2.6, Math.max(1, minDim * 0.18));
  const factor = Math.max(0.3, 1 - 2.2 / Math.max(3, minDim));
  /* Overhang of 0.4 m outward from the centroid. */
  const eave = (i: number): [number, number] => {
    const dx = pts[i * 2] - c.x, dz = pts[i * 2 + 1] - c.z;
    const d = Math.hypot(dx, dz) || 1;
    return [pts[i * 2] + (dx / d) * 0.4, pts[i * 2 + 1] + (dz / d) * 0.4];
  };
  const inner = (i: number): [number, number] => [c.x + (pts[i * 2] - c.x) * factor, c.z + (pts[i * 2 + 1] - c.z) * factor];
  void ccw;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [ax, az] = eave(i), [bx, bz] = eave(j), [cx, cz] = inner(j), [dx, dz] = inner(i);
    const y = b.h - 0.1, top = b.h + rise;
    const along = Math.hypot(bx - ax, bz - az) / 3;
    upTri(mb, [ax, y, az, 0, 0], [bx, y, bz, along, 0], [cx, top, cz, along, 1]);
    upTri(mb, [ax, y, az, 0, 0], [cx, top, cz, along, 1], [dx, top, dz, 0, 1]);
  }
  const contour: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const [x, z] = inner(i);
    contour.push(new THREE.Vector2(x, z));
  }
  for (const [a, d, e] of THREE.ShapeUtils.triangulateShape(contour, [])) {
    const p = [a, d, e].map((k) => [contour[k].x, b.h + rise, contour[k].y, contour[k].x / 3, contour[k].y / 3]);
    upTri(mb, p[0], p[1], p[2]);
  }
}

/** Triangle facing up whatever the winding; flat normal from the geometry. */
function upTri(mb: MeshBuilder, a: number[], b: number[], c: number[]): void {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (ny < 0) {
    [b, c] = [c, b];
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  const l = Math.hypot(nx, ny, nz) || 1;
  mb.tri(a, b, c, [nx / l, ny / l, nz / l]);
}

/* ---------------- ground ---------------- */

function ribbon(mb: MeshBuilder, pts: number[], width: number, y: number, uScale: number, vAcross = true): void {
  const n = pts.length / 2;
  if (n < 2) return;
  const half = width / 2;
  const left: number[][] = [];
  const right: number[][] = [];
  let dist = 0;
  for (let i = 0; i < n; i++) {
    const px = pts[i * 2], pz = pts[i * 2 + 1];
    if (i > 0) dist += Math.hypot(px - pts[i * 2 - 2], pz - pts[i * 2 - 1]);
    /* Averaged normal at the vertex, so bends have no gaps. */
    let nx = 0, nz = 0;
    for (const [ia, ib] of [[i - 1, i], [i, i + 1]]) {
      if (ia < 0 || ib >= n) continue;
      const dx = pts[ib * 2] - pts[ia * 2], dz = pts[ib * 2 + 1] - pts[ia * 2 + 1];
      const l = Math.hypot(dx, dz) || 1;
      nx += -dz / l;
      nz += dx / l;
    }
    const l = Math.hypot(nx, nz) || 1;
    nx /= l;
    nz /= l;
    const u = dist / uScale;
    left.push([px + nx * half, y, pz + nz * half, u, vAcross ? 0 : (px + nx * half) / uScale]);
    right.push([px - nx * half, y, pz - nz * half, u, vAcross ? 1 : (px - nx * half) / uScale]);
  }
  for (let i = 0; i + 1 < n; i++) {
    upTri(mb, left[i], right[i], right[i + 1]);
    upTri(mb, left[i], right[i + 1], left[i + 1]);
  }
}

function polygonFill(mb: MeshBuilder, poly: number[], y: number, uv: number): void {
  const contour: THREE.Vector2[] = [];
  for (let i = 0; i < poly.length; i += 2) contour.push(new THREE.Vector2(poly[i], poly[i + 1]));
  for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(contour, [])) {
    const p = [a, b, c].map((k) => [contour[k].x, y, contour[k].y, contour[k].x / uv, contour[k].y / uv]);
    upTri(mb, p[0], p[1], p[2]);
  }
}

function addBaseTile(x: number, z: number, builder: Builder): void {
  const v = FIDENZA.meta.view;
  const x0 = Math.max(x, v.minX - 400), x1 = Math.min(x + CHUNK, v.maxX + 400);
  const z0 = Math.max(z, v.minZ - 400), z1 = Math.min(z + CHUNK, v.maxZ + 400);
  const mb = builder(x + 1, z + 1, 'dirt').color(0xb9b49a);
  upTri(mb, [x0, -0.02, z0, x0 / 12, z0 / 12], [x1, -0.02, z0, x1 / 12, z0 / 12], [x1, -0.02, z1, x1 / 12, z1 / 12]);
  upTri(mb, [x0, -0.02, z0, x0 / 12, z0 / 12], [x1, -0.02, z1, x1 / 12, z1 / 12], [x0, -0.02, z1, x0 / 12, z1 / 12]);
}

function addArea(a: (typeof FIDENZA.areas)[number], builder: Builder): void {
  const c = centroid(a.poly);
  let surface: Surface = 'pavers';
  let color = 0xffffff;
  let y = 0.005;
  if (['park', 'grass', 'forest', 'cemetery'].includes(a.kind)) surface = 'grass';
  else if (a.kind === 'sport') {
    surface = 'grass';
    color = 0xbfe0a0;
  } else if (a.kind === 'farmland') {
    surface = 'dirt';
    color = 0xd8d0a0;
  } else if (a.kind === 'parking') {
    surface = 'asphalt';
    color = 0xc8c8c8;
    y = 0.012;
  }
  polygonFill(builder(c.x, c.z, surface).color(color), a.poly, y, surface === 'asphalt' ? 30 : surface === 'pavers' ? 3 : 8);
}

function addRoad(road: (typeof FIDENZA.roads)[number], index: number, builder: Builder): void {
  const c = { x: road.pts[0], z: road.pts[1] };
  const lift = (index % 7) * 0.0015;
  if (VEHICULAR.has(road.kind) || road.kind === 'service') {
    if (road.kind !== 'service') ribbon(builder(c.x, c.z, 'pavers').color(0xd8cfbf), road.pts, road.w + 3.2, 0.03 + lift, 4);
    ribbon(builder(c.x, c.z, 'asphalt').color(road.kind === 'service' ? 0xc0c0c0 : 0xffffff), road.pts, road.w, 0.06 + lift, 8);
  } else {
    ribbon(builder(c.x, c.z, 'pavers').color(0xe6dccb), road.pts, Math.max(1.6, road.w), 0.045 + lift, 3);
  }
}

/* ---------------- trees and lamps (instanced per chunk) ---------------- */

interface SharedGeometry {
  crownGeo: THREE.BufferGeometry;
  trunkGeo: THREE.BufferGeometry;
  crownMat: THREE.MeshLambertMaterial;
  trunkMat: THREE.MeshLambertMaterial;
  poleGeo: THREE.BufferGeometry;
  headGeo: THREE.BufferGeometry;
  poolGeo: THREE.BufferGeometry;
  poleMat: THREE.MeshLambertMaterial;
}

function sharedGeometry(): SharedGeometry {
  return {
    crownGeo: new THREE.IcosahedronGeometry(1, 0),
    trunkGeo: new THREE.CylinderGeometry(0.16, 0.24, 1, 5).translate(0, 0.5, 0),
    crownMat: new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
    trunkMat: new THREE.MeshLambertMaterial({ color: 0x6b5a44 }),
    poleGeo: new THREE.BoxGeometry(0.14, 6, 0.14).translate(0, 3, 0),
    headGeo: new THREE.BoxGeometry(0.5, 0.18, 0.3).translate(0, 6, 0),
    poolGeo: new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2).translate(0, 0.09, 0),
    poleMat: new THREE.MeshLambertMaterial({ color: 0x3a3c3e })
  };
}

const GREENS = [0x5d7040, 0x6d7c48, 0x4f6538, 0x7a8a50, 0x66763f];

function treeMeshes(trees: typeof FIDENZA.trees, g: SharedGeometry): { crowns: THREE.InstancedMesh; trunks: THREE.InstancedMesh } {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const color = new THREE.Color();
  const up = new THREE.Vector3(0, 1, 0);
  const crowns = new THREE.InstancedMesh(g.crownGeo, g.crownMat, trees.length);
  const trunks = new THREE.InstancedMesh(g.trunkGeo, g.trunkMat, trees.length);
  trees.forEach((t, i) => {
    const h = Math.max(5, Math.min(14, t.h));
    const r = h * 0.3;
    q.setFromAxisAngle(up, (t.x * 7 + t.z * 3) % 6.28);
    m.compose(p.set(t.x, h * 0.62, t.z), q, s.set(r, r * 0.9, r));
    crowns.setMatrixAt(i, m);
    color.set(GREENS[Math.abs(Math.round(t.x * 3 + t.z)) % GREENS.length]);
    crowns.setColorAt(i, color);
    m.compose(p.set(t.x, 0, t.z), q, s.set(1, h * 0.5, 1));
    trunks.setMatrixAt(i, m);
  });
  crowns.computeBoundingSphere();
  trunks.computeBoundingSphere();
  return { crowns, trunks };
}

/** Street lamps every 34 m, alternating sides, along the vehicular streets. */
function lampSpots(): Array<[number, number]> {
  const spots: Array<[number, number]> = [];
  for (const road of FIDENZA.roads) {
    if (!VEHICULAR.has(road.kind)) continue;
    const pts = road.pts;
    let carry = 8;
    let side = 1;
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const ax = pts[i], az = pts[i + 1], bx = pts[i + 2], bz = pts[i + 3];
      const len = Math.hypot(bx - ax, bz - az);
      for (let d = carry; d < len; d += 34) {
        const t = d / len;
        const off = road.w / 2 + 1.1;
        const nx = (-(bz - az) / len) * off * side;
        const nz = ((bx - ax) / len) * off * side;
        spots.push([ax + (bx - ax) * t + nx, az + (bz - az) * t + nz]);
        side = -side;
      }
      carry = (carry - len) % 34;
      if (carry < 0) carry += 34;
    }
  }
  return spots;
}

function lampMeshes(list: Array<[number, number]>, g: SharedGeometry, glow: THREE.MeshBasicMaterial, bulb: THREE.MeshBasicMaterial): THREE.InstancedMesh[] {
  const m = new THREE.Matrix4();
  const poles = new THREE.InstancedMesh(g.poleGeo, g.poleMat, list.length);
  const heads = new THREE.InstancedMesh(g.headGeo, bulb, list.length);
  const pools = new THREE.InstancedMesh(g.poolGeo, glow, list.length);
  list.forEach(([x, z], i) => {
    m.makeTranslation(x, 0, z);
    poles.setMatrixAt(i, m);
    heads.setMatrixAt(i, m);
    pools.setMatrixAt(i, m);
  });
  for (const mesh of [poles, heads, pools]) mesh.computeBoundingSphere();
  pools.renderOrder = 3;
  return [poles, heads, pools];
}
