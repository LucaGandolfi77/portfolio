import * as THREE from 'three';
import type { RoadEdge, RoadGraph } from '../data/roads';
import { nextEdge, pointOnEdge } from '../data/roads';
import type { CollisionWorld } from '../data/colliders';
import { NO_INPUT, SPECS, Vehicle, type VehicleType } from './vehicle';
import type { TrafficSignals } from './signals';

/*
 * Civilian traffic. While calm, a car rides its lane along the road graph
 * (kinematic: cheap and stable). After a hard knock it switches to the
 * physics model, slides to a stop and is left there; the system keeps the
 * number of moving cars by spawning new ones out of sight.
 */

const SPEED: Record<string, number> = {
  primary: 16,
  primary_link: 13,
  secondary: 14.5,
  tertiary: 12.5,
  residential: 10,
  unclassified: 11,
  living_street: 6
};

/* A patrol now and then on its rounds: it can witness red lights and speeding. */
const MIX: VehicleType[] = ['utilitaria', 'utilitaria', 'utilitaria', 'berlina', 'berlina', 'familiare', 'familiare', 'furgone', 'taxi', 'sportiva', 'motocarro', 'polizia'];

export interface TrafficCar {
  vehicle: Vehicle;
  edge: RoadEdge;
  fromA: boolean;
  d: number;
  cruise: number;
  /** 'drive' follows the lane; 'loose' is physics only (knocked or abandoned). */
  mode: 'drive' | 'loose';
  hornCooldown: number;
}

export interface TrafficContext {
  player: { x: number; z: number };
  /** Camera forward on the ground plane, to spawn behind the view. */
  view: { x: number; z: number };
  obstacles: Array<{ x: number; z: number }>;
}

export class Traffic {
  readonly cars: TrafficCar[] = [];
  /** Cars that were taken out of traffic (parked, abandoned, the player's). */
  readonly loose: Vehicle[] = [];
  target: number;
  /** Traffic lights, if the town has them. */
  signals: TrafficSignals | null = null;
  private rand: () => number;

  constructor(
    private scene: THREE.Scene,
    private graph: RoadGraph,
    private world: CollisionWorld,
    private beam: THREE.Texture | null,
    target: number,
    seed = 7
  ) {
    this.target = target;
    let s = seed;
    this.rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  get vehicles(): Vehicle[] {
    return [...this.cars.map((c) => c.vehicle), ...this.loose];
  }

  /** Lane position: 1/4 of the width to the right of the travel direction. */
  private place(car: TrafficCar): void {
    const p = pointOnEdge(car.edge, car.d, car.fromA);
    const off = Math.min(2.2, Math.max(1.2, car.edge.width / 4));
    const v = car.vehicle;
    v.x = p.x - p.dz * off;
    v.z = p.z + p.dx * off;
    const target = Math.atan2(p.dx, p.dz);
    let delta = target - v.heading;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    v.heading += delta * 0.35;
  }

  spawn(ctx: TrafficContext, near = false): TrafficCar | null {
    for (let attempt = 0; attempt < 12; attempt++) {
      const edge = this.graph.mainEdges[Math.floor(this.rand() * this.graph.mainEdges.length)];
      const d = this.rand() * edge.length;
      const p = pointOnEdge(edge, d, true);
      const dx = p.x - ctx.player.x;
      const dz = p.z - ctx.player.z;
      const dist = Math.hypot(dx, dz);
      const min = near ? 25 : 90;
      if (dist < min || dist > 230) continue;
      /* Not in front of the camera unless far away. */
      if (!near && dist < 160 && (dx * ctx.view.x + dz * ctx.view.z) / dist > 0.2) continue;
      if (this.vehicles.some((v) => Math.hypot(v.x - p.x, v.z - p.z) < 10)) continue;
      const type = MIX[Math.floor(this.rand() * MIX.length)];
      const colors = SPECS[type].colors;
      const vehicle = new Vehicle(type, p.x, p.z, 0, colors[Math.floor(this.rand() * colors.length)], this.beam);
      vehicle.driver = 'ai';
      vehicle.toughness = 0.6;
      const fromA = this.rand() < 0.5;
      const car: TrafficCar = {
        vehicle,
        edge,
        fromA,
        d: fromA ? d : edge.length - d,
        cruise: (SPEED[edge.kind] ?? 11) * (0.85 + this.rand() * 0.3) * (type === 'motocarro' ? 0.55 : 1),
        mode: 'drive',
        hornCooldown: 0
      };
      const dir = pointOnEdge(edge, car.d, fromA);
      vehicle.heading = Math.atan2(dir.dx, dir.dz);
      this.place(car);
      vehicle.sync();
      this.scene.add(vehicle.model);
      this.cars.push(car);
      return car;
    }
    return null;
  }

  /** Removes a car from the lane system and keeps it as a loose vehicle. */
  release(vehicle: Vehicle): void {
    const i = this.cars.findIndex((c) => c.vehicle === vehicle);
    if (i >= 0) this.cars.splice(i, 1);
    if (!this.loose.includes(vehicle)) this.loose.push(vehicle);
  }

  remove(vehicle: Vehicle): void {
    const i = this.cars.findIndex((c) => c.vehicle === vehicle);
    if (i >= 0) this.cars.splice(i, 1);
    const j = this.loose.indexOf(vehicle);
    if (j >= 0) this.loose.splice(j, 1);
    this.scene.remove(vehicle.model);
  }

  update(dt: number, ctx: TrafficContext, keep: Set<Vehicle>, honk: (v: Vehicle) => void): void {
    /* Keep the population around the player. */
    for (const car of [...this.cars]) {
      const v = car.vehicle;
      if (Math.hypot(v.x - ctx.player.x, v.z - ctx.player.z) > 280 && !keep.has(v)) this.remove(v);
    }
    for (const v of [...this.loose]) {
      if (!keep.has(v) && Math.hypot(v.x - ctx.player.x, v.z - ctx.player.z) > 320) this.remove(v);
    }
    let spawned = 0;
    while (this.cars.length < this.target && spawned < 2) {
      if (!this.spawn(ctx, this.cars.length < this.target / 3)) break;
      spawned++;
    }

    for (const car of this.cars) {
      const v = car.vehicle;
      if (car.mode === 'loose') continue;
      car.hornCooldown = Math.max(0, car.hornCooldown - dt);
      /* Slow down for anything ahead in a narrow cone. */
      const fx = v.forwardX, fz = v.forwardZ;
      let limit = car.cruise;
      const check = (ox: number, oz: number, radius: number, isObstacle: boolean): void => {
        const dx = ox - v.x, dz = oz - v.z;
        const ahead = dx * fx + dz * fz;
        if (ahead < 0 || ahead > 16) return;
        const side = Math.abs(dx * fz - dz * fx);
        if (side > radius) return;
        const gap = ahead - v.spec.length / 2 - 2.5;
        limit = Math.min(limit, Math.max(0, gap * 1.2));
        if (isObstacle && gap < 6 && car.hornCooldown === 0) {
          car.hornCooldown = 4 + this.rand() * 3;
          honk(v);
        }
      };
      for (const other of this.vehicles) if (other !== v) check(other.x, other.z, 1.9, false);
      for (const o of ctx.obstacles) check(o.x, o.z, 1.6, true);
      /* Slower on bends: look at the heading change a few metres ahead. */
      const now = pointOnEdge(car.edge, car.d, car.fromA);
      const ahead = pointOnEdge(car.edge, Math.min(car.edge.length, car.d + 8), car.fromA);
      const turn = Math.abs(Math.atan2(now.dx * ahead.dz - now.dz * ahead.dx, now.dx * ahead.dx + now.dz * ahead.dz));
      if (car.edge.length - car.d < 10) limit = Math.min(limit, 7);
      /* Stop at the line on red, and on amber unless already close. */
      const toEnd = car.edge.length - car.d;
      /* Past the line (under 8 m) a car clears the junction instead of stopping in it. */
      if (this.signals && toEnd < 34 && toEnd > 8) {
        const light = this.signals.state(car.fromA ? car.edge.b : car.edge.a, car.edge.id);
        if (light === 'red' || (light === 'amber' && toEnd > 14)) limit = Math.min(limit, Math.max(0, (toEnd - 9) * 0.9));
      }
      limit = Math.min(limit, car.cruise * (1 - Math.min(0.6, turn)));
      const speed = THREE.MathUtils.lerp(v.speed, limit, Math.min(1, dt * (limit < v.speed ? 3 : 1)));
      car.d += speed * dt;
      while (car.d >= car.edge.length) {
        const node = car.fromA ? car.edge.b : car.edge.a;
        car.d -= car.edge.length;
        const next = nextEdge(this.graph, node, car.edge.id, this.rand);
        car.fromA = next.a === node;
        car.edge = next;
        car.cruise = (SPEED[next.kind] ?? 11) * (0.85 + this.rand() * 0.3) * (v.type === 'motocarro' ? 0.55 : 1);
      }
      const px = v.x, pz = v.z;
      this.place(car);
      v.vx = (v.x - px) / Math.max(dt, 1e-3);
      v.vz = (v.z - pz) / Math.max(dt, 1e-3);
      v.yawRate = 0;
      v.sync();
    }

    for (const v of this.loose) {
      if (v.driver === 'player') continue;
      if (v.driver === 'police') continue;
      if (Math.abs(v.vx) + Math.abs(v.vz) > 0.05) {
        v.update(NO_INPUT, dt, this.world);
        v.sync();
      }
    }
  }

  /** A calm car hit hard enough leaves its lane. */
  knock(vehicle: Vehicle): void {
    const car = this.cars.find((c) => c.vehicle === vehicle);
    if (!car) return;
    car.mode = 'loose';
    vehicle.driver = 'none';
    this.release(vehicle);
  }
}
