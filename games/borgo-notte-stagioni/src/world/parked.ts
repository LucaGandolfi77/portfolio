import * as THREE from 'three';
import { FIDENZA } from '../data/fidenza';
import type { Collider, CollisionWorld, PolygonCollider } from '../data/colliders';
import { buildCarModel, SPECS, type VehicleType } from '../game/vehicle';
import { staticMaterial } from './batch';

/*
 * Cars parked along the kerbs of the wider streets. They are placed by a
 * seeded generator (always the same spots), drawn as one merged mesh per
 * 320 m cell, solid for the physics, and can be stolen: the parked copy
 * disappears and a drivable car takes its place.
 */

const CHUNK = 320;
const KINDS = new Set(['residential', 'tertiary', 'secondary', 'unclassified', 'living_street']);
const MIX: VehicleType[] = ['utilitaria', 'utilitaria', 'utilitaria', 'berlina', 'berlina', 'familiare', 'familiare', 'furgone', 'sportiva', 'motocarro'];

export interface ParkedCar {
  id: number;
  type: VehicleType;
  color: number;
  x: number;
  z: number;
  heading: number;
  collider: PolygonCollider;
  taken: boolean;
  cell: string;
  /** Vertex range in the cell mesh while built. */
  start: number;
  count: number;
}

interface Cell {
  cars: ParkedCar[];
  mesh: THREE.Mesh | null;
  cx: number;
  cz: number;
}

/** Car body + wheels as one geometry, cached per type and colour. */
const templates = new Map<string, THREE.BufferGeometry>();
function template(type: VehicleType, color: number): THREE.BufferGeometry {
  const key = `${type}:${color}`;
  const cached = templates.get(key);
  if (cached) return cached;
  const model = buildCarModel(type, color, null);
  model.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  model.traverse((o) => {
    if (!(o instanceof THREE.Mesh) || !o.geometry.getAttribute('color')) return;
    const g = o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    parts.push(g.index ? g.toNonIndexed() : g);
  });
  const positions: number[] = [];
  const colors: number[] = [];
  for (const g of parts) {
    positions.push(...(g.getAttribute('position').array as Float32Array));
    colors.push(...(g.getAttribute('color').array as Float32Array));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  templates.set(key, out);
  return out;
}

function rectangle(x: number, z: number, heading: number, length: number, width: number): PolygonCollider {
  const fx = Math.sin(heading), fz = Math.cos(heading);
  const rx = -fz, rz = fx;
  const hl = length / 2, hw = width / 2;
  const pts = [
    x + fx * hl + rx * hw, z + fz * hl + rz * hw,
    x + fx * hl - rx * hw, z + fz * hl - rz * hw,
    x - fx * hl - rx * hw, z - fz * hl - rz * hw,
    x - fx * hl + rx * hw, z - fz * hl + rz * hw
  ];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  let area = 0;
  for (let i = 0; i < 4; i++) {
    const ax = pts[i * 2], az = pts[i * 2 + 1];
    const bx = pts[((i + 1) % 4) * 2], bz = pts[((i + 1) % 4) * 2 + 1];
    area += ax * bz - bx * az;
    minX = Math.min(minX, ax);
    maxX = Math.max(maxX, ax);
    minZ = Math.min(minZ, az);
    maxZ = Math.max(maxZ, az);
  }
  return { kind: 'polygon', x, z, pts, minX, maxX, minZ, maxZ, ccw: area > 0 };
}

function insidePoly(x: number, z: number, poly: number[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 2; i < poly.length; j = i, i += 2) {
    const zi = poly[i + 1], zj = poly[j + 1];
    if (zi > z !== zj > z && x < ((poly[j] - poly[i]) * (z - zi)) / (zj - zi) + poly[i]) hit = !hit;
  }
  return hit;
}

/** Seeded kerbside spots on both sides of the wider streets. */
export function planParking(): ParkedCar[] {
  /* Buildings in 50 m buckets: a street under an arcade is not a car park. */
  const buckets = new Map<string, number[][]>();
  for (const b of FIDENZA.buildings) {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < b.poly.length; i += 2) {
      minX = Math.min(minX, b.poly[i]);
      maxX = Math.max(maxX, b.poly[i]);
      minZ = Math.min(minZ, b.poly[i + 1]);
      maxZ = Math.max(maxZ, b.poly[i + 1]);
    }
    for (let x = Math.floor(minX / 50); x <= Math.floor(maxX / 50); x++) {
      for (let z = Math.floor(minZ / 50); z <= Math.floor(maxZ / 50); z++) {
        const k = `${x},${z}`;
        if (!buckets.has(k)) buckets.set(k, []);
        buckets.get(k)!.push(b.poly);
      }
    }
  }
  const blocked = (x: number, z: number): boolean => (buckets.get(`${Math.floor(x / 50)},${Math.floor(z / 50)}`) ?? []).some((poly) => insidePoly(x, z, poly));
  let seed = 4242;
  const rand = (): number => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cars: ParkedCar[] = [];
  let id = 0;
  for (const road of FIDENZA.roads) {
    if (!KINDS.has(road.kind) || road.w < 7.5) continue;
    const p = road.pts;
    for (let i = 0; i + 3 < p.length; i += 2) {
      const ax = p[i], az = p[i + 1], bx = p[i + 2], bz = p[i + 3];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 30) continue;
      const fx = (bx - ax) / len, fz = (bz - az) / len;
      for (const side of [-1, 1]) {
        const off = road.w / 2 - 1.05;
        for (let d = 12; d < len - 12; d += 6.2) {
          if (rand() > 0.24) continue;
          const type = MIX[Math.floor(rand() * MIX.length)];
          const colors = SPECS[type].colors;
          const x = ax + fx * d + -fz * off * side;
          const z = az + fz * d + fx * off * side;
          const heading = Math.atan2(fx, fz) + (rand() < 0.5 ? Math.PI : 0);
          const s = SPECS[type];
          const box = rectangle(x, z, heading, s.length + 0.4, s.width + 0.2);
          if (blocked(x, z) || [0, 1, 2, 3].some((k) => blocked(box.pts[k * 2], box.pts[k * 2 + 1]))) continue;
          cars.push({
            id: id++,
            type,
            color: colors[Math.floor(rand() * colors.length)],
            x,
            z,
            heading,
            collider: rectangle(x, z, heading, s.length, s.width),
            taken: false,
            cell: `${Math.floor(x / CHUNK)},${Math.floor(z / CHUNK)}`,
            start: 0,
            count: 0
          });
        }
      }
    }
  }
  return cars;
}

export class ParkedCars {
  private cells = new Map<string, Cell>();
  private material = staticMaterial();
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private up = new THREE.Vector3(0, 1, 0);

  constructor(private scene: THREE.Scene, readonly cars: ParkedCar[]) {
    for (const c of cars) {
      let cell = this.cells.get(c.cell);
      if (!cell) {
        const [cx, cz] = c.cell.split(',').map(Number);
        cell = { cars: [], mesh: null, cx, cz };
        this.cells.set(c.cell, cell);
      }
      cell.cars.push(c);
    }
  }

  get colliders(): Collider[] {
    return this.cars.map((c) => c.collider);
  }

  update(x: number, z: number, radius: number): void {
    for (const cell of this.cells.values()) {
      const dx = Math.max(0, Math.abs(x - (cell.cx + 0.5) * CHUNK) - CHUNK / 2);
      const dz = Math.max(0, Math.abs(z - (cell.cz + 0.5) * CHUNK) - CHUNK / 2);
      const d = Math.hypot(dx, dz);
      if (!cell.mesh && d <= radius) this.build(cell);
      else if (cell.mesh && d > radius + CHUNK * 0.75) this.release(cell);
    }
  }

  private build(cell: Cell): void {
    const positions: number[] = [];
    const colors: number[] = [];
    const v = new THREE.Vector3();
    for (const c of cell.cars) {
      const g = template(c.type, c.color);
      const pos = g.getAttribute('position') as THREE.BufferAttribute;
      const col = g.getAttribute('color') as THREE.BufferAttribute;
      c.start = positions.length / 3;
      c.count = c.taken ? 0 : pos.count;
      if (c.taken) continue;
      this.q.setFromAxisAngle(this.up, c.heading);
      this.m.compose(new THREE.Vector3(c.x, 0, c.z), this.q, new THREE.Vector3(1, 1, 1));
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(this.m);
        positions.push(v.x, v.y, v.z);
        colors.push(col.getX(i), col.getY(i), col.getZ(i));
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    cell.mesh = new THREE.Mesh(geo, this.material);
    cell.mesh.matrixAutoUpdate = false;
    this.scene.add(cell.mesh);
  }

  private release(cell: Cell): void {
    if (!cell.mesh) return;
    this.scene.remove(cell.mesh);
    cell.mesh.geometry.dispose();
    cell.mesh = null;
  }

  /** The closest parked car within `r` metres, if any. */
  nearest(x: number, z: number, r: number): ParkedCar | null {
    let best: ParkedCar | null = null;
    let bestD = r;
    for (const c of this.cars) {
      if (c.taken || Math.abs(c.x - x) > r || Math.abs(c.z - z) > r) continue;
      const d = Math.hypot(c.x - x, c.z - z);
      if (d < bestD) {
        best = c;
        bestD = d;
      }
    }
    return best;
  }

  /** Takes a parked car off the kerb: hidden in its mesh, collider removed. */
  take(car: ParkedCar, world: CollisionWorld): void {
    car.taken = true;
    world.remove(car.collider);
    const cell = this.cells.get(car.cell);
    const mesh = cell?.mesh;
    if (!mesh || car.count === 0) return;
    const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = car.start; i < car.start + car.count; i++) pos.setXYZ(i, car.x, -20, car.z);
    pos.needsUpdate = true;
    car.count = 0;
  }
}
