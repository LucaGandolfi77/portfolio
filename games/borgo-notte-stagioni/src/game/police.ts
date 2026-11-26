import * as THREE from 'three';
import type { RoadGraph } from '../data/roads';
import { nearestOnGraph, pointOnEdge, shortestPath } from '../data/roads';
import type { CollisionWorld } from '../data/colliders';
import { SPECS, Vehicle } from './vehicle';

/* ---------------- alert level (pure logic) ---------------- */

export type Offence = 'carjack' | 'knock' | 'ram' | 'speeding' | 'police-car';

const OFFENCE_HEAT: Record<Offence, number> = {
  carjack: 1,
  knock: 1,
  ram: 1,
  speeding: 1,
  'police-car': 2
};

export class Alert {
  level = 0;
  /** Seconds spent out of sight of every patrol. */
  hidden = 0;
  private recent = new Map<Offence, number>();

  /** Seconds out of sight needed to drop one level. */
  static cooldown(level: number): number {
    return 7 + level * 4;
  }

  add(offence: Offence, now: number): boolean {
    /* The same kind of offence counts once every few seconds. */
    const last = this.recent.get(offence) ?? -Infinity;
    if (now - last < (offence === 'speeding' ? 20 : 3)) return false;
    this.recent.set(offence, now);
    const before = this.level;
    this.level = Math.min(5, this.level + OFFENCE_HEAT[offence]);
    this.hidden = 0;
    return this.level !== before;
  }

  update(dt: number, seen: boolean): boolean {
    if (this.level === 0) return false;
    if (seen) {
      this.hidden = 0;
      return false;
    }
    this.hidden += dt;
    if (this.hidden >= Alert.cooldown(this.level)) {
      this.level--;
      this.hidden = 0;
      return true;
    }
    return false;
  }

  clear(): void {
    this.level = 0;
    this.hidden = 0;
  }

  /** Patrol cars chasing at a given level. */
  static units(level: number): number {
    return [0, 1, 2, 3, 4, 5][Math.max(0, Math.min(5, level))];
  }
}

/* ---------------- patrol cars ---------------- */

export interface Patrol {
  vehicle: Vehicle;
  path: Array<{ x: number; z: number }>;
  repath: number;
  stuck: number;
  reverse: number;
  /** Closest distance reached and the time since it improved. */
  best: number;
  since: number;
}

export const SIGHT = 75;

export class PoliceForce {
  readonly patrols: Patrol[] = [];
  private flash = 0;

  constructor(
    private scene: THREE.Scene,
    private graph: RoadGraph,
    private world: CollisionWorld,
    private beam: THREE.Texture | null
  ) {}

  /** Is the target within sight of any patrol? */
  sees(x: number, z: number): boolean {
    return this.patrols.some((p) => Math.hypot(p.vehicle.x - x, p.vehicle.z - z) < SIGHT && !p.vehicle.wrecked);
  }

  private spawn(target: { x: number; z: number }, view: { x: number; z: number }): void {
    /* Street points 60-170 m away, preferably behind the camera. */
    const behind: Array<{ x: number; z: number; dx: number; dz: number }> = [];
    const any: typeof behind = [];
    for (const edge of this.graph.mainEdges) {
      for (let d = 0; d < edge.length; d += 25) {
        const p = pointOnEdge(edge, d, true);
        const dx = p.x - target.x, dz = p.z - target.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 60 || dist > 170) continue;
        any.push({ x: p.x, z: p.z, dx, dz });
        if ((dx * view.x + dz * view.z) / dist < 0.3) behind.push({ x: p.x, z: p.z, dx, dz });
      }
    }
    const pool = behind.length ? behind : any;
    if (pool.length === 0) return;
    {
      const p = pool[Math.floor(Math.random() * pool.length)];
      const dx = p.dx, dz = p.dz;
      const vehicle = new Vehicle('polizia', p.x, p.z, Math.atan2(-dx, -dz), SPECS.polizia.colors[0], this.beam);
      vehicle.driver = 'police';
      vehicle.toughness = 0.25;
      this.scene.add(vehicle.model);
      this.patrols.push({ vehicle, path: [], repath: 0, stuck: 0, reverse: 0, best: Infinity, since: 0 });
    }
  }

  dismissAll(): void {
    for (const p of this.patrols) this.scene.remove(p.vehicle.model);
    this.patrols.length = 0;
  }

  update(dt: number, level: number, target: { x: number; z: number; vx: number; vz: number }, view: { x: number; z: number }): void {
    const wanted = Alert.units(level);
    /* Leave when the alert drops: drive off-screen first. */
    while (this.patrols.length > wanted) {
      const far = this.patrols.reduce((a, b) =>
        Math.hypot(a.vehicle.x - target.x, a.vehicle.z - target.z) > Math.hypot(b.vehicle.x - target.x, b.vehicle.z - target.z) ? a : b
      );
      this.scene.remove(far.vehicle.model);
      this.patrols.splice(this.patrols.indexOf(far), 1);
    }
    if (this.patrols.length < wanted && Math.random() < dt * 0.8) this.spawn(target, view);

    this.flash += dt;
    const on = Math.floor(this.flash * 5) % 2 === 0;
    /* A wrecked patrol is towed away once it is out of the way; one that
       makes no progress for 12 s while far away is replaced. */
    for (const p of [...this.patrols]) {
      const d = Math.hypot(p.vehicle.x - target.x, p.vehicle.z - target.z);
      if (d < p.best - 10) {
        p.best = d;
        p.since = 0;
      } else {
        p.since += dt;
      }
      if ((p.vehicle.wrecked && d > 40) || (p.since > 12 && d > 50)) {
        this.scene.remove(p.vehicle.model);
        this.patrols.splice(this.patrols.indexOf(p), 1);
      }
    }
    for (const p of this.patrols) {
      const v = p.vehicle;
      if (v.wrecked) continue;
      const dist = Math.hypot(target.x - v.x, target.z - v.z);
      /* Aim: straight at the target when close, else along the road graph. */
      let aimX = target.x + target.vx * 0.6;
      let aimZ = target.z + target.vz * 0.6;
      /* Straight at the target only with a clear line; otherwise by road. */
      const clear = dist < 12 || (dist < 60 && this.lineOfSight(v.x, v.z, target.x, target.z));
      if (!clear) {
        p.repath -= dt * (dist < 60 ? 2 : 1);
        if (p.repath <= 0 || p.path.length === 0) {
          p.repath = 4;
          const from = nearestOnGraph(this.graph, v.x, v.z);
          const to = nearestOnGraph(this.graph, target.x, target.z);
          /* Start from the end of the street the patrol is facing: no U-turns. */
          const na = this.graph.nodes[from.edge.a];
          const nb = this.graph.nodes[from.edge.b];
          const ahead = (n: { x: number; z: number }): number => (n.x - v.x) * v.forwardX + (n.z - v.z) * v.forwardZ;
          const startNode = ahead(na) > ahead(nb) ? from.edge.a : from.edge.b;
          const endNode = to.d < to.edge.length / 2 ? to.edge.a : to.edge.b;
          const edges = shortestPath(this.graph, startNode, endNode);
          const path: Array<{ x: number; z: number }> = [];
          let node = startNode;
          for (const id of edges) {
            const e = this.graph.edges[id];
            const forward = e.a === node;
            for (let i = 0; i < e.pts.length; i += 2) {
              const k = forward ? i : e.pts.length - 2 - i;
              path.push({ x: e.pts[k], z: e.pts[k + 1] });
            }
            node = forward ? e.b : e.a;
          }
          path.push({ x: target.x, z: target.z });
          p.path = path;
        }
        while (p.path.length > 1 && Math.hypot(p.path[0].x - v.x, p.path[0].z - v.z) < 9) p.path.shift();
        if (p.path.length) {
          aimX = p.path[0].x;
          aimZ = p.path[0].z;
        }
      }
      const want = Math.atan2(aimX - v.x, aimZ - v.z);
      let delta = want - v.heading;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      let steer = THREE.MathUtils.clamp(delta * 2.2, -1, 1);
      /* Speed for the bend ahead: slow into corners, fast on the straight. */
      let desired = THREE.MathUtils.clamp(28 - Math.abs(delta) * 30, 6, 28);
      if (dist < 45) desired = Math.min(desired, dist * 0.5 + 3);
      let throttle = v.speed < desired ? 1 : 0;
      let brake = v.speed > desired + 2 || dist < 5 ? 1 : 0;
      /* Unstick: if pushing but not moving, back up with opposite lock. */
      if (Math.abs(v.speed) < 1 && throttle > 0.4) p.stuck += dt;
      else p.stuck = Math.max(0, p.stuck - dt);
      if (p.stuck > 1.2) {
        p.reverse = 1.1;
        p.stuck = 0;
      }
      if (p.reverse > 0) {
        p.reverse -= dt;
        throttle = 0;
        brake = 1;
        steer = -steer;
      }
      v.update({ throttle, brake, steer, handbrake: false }, dt, this.world);
      v.sync();
    }
    /* Shared light-bar materials flash for every patrol. */
    void on;
  }

  private lineOfSight(ax: number, az: number, bx: number, bz: number): boolean {
    const len = Math.hypot(bx - ax, bz - az);
    for (let s = 3; s < len - 2; s += 2) {
      const t = s / len;
      if (!this.world.isFree(ax + (bx - ax) * t, az + (bz - az) * t, 0.9)) return false;
    }
    return true;
  }

  get flashOn(): boolean {
    return Math.floor(this.flash * 5) % 2 === 0;
  }
}
