import * as THREE from 'three';
import type { CollisionWorld } from '../data/colliders';
import type { RoadGraph } from '../data/roads';
import { nearestOnGraph, shortestPath } from '../data/roads';
import type { Vehicle } from './vehicle';

/*
 * A driver for story cars: follows a list of street points, slows for
 * bends, unsticks itself. Modes: 'race' (fast, on the race route), 'cruise'
 * (normal pace, for tailing) and 'flee' (picks streets away from the player
 * at every junction).
 */

export type Pt = { x: number; z: number };

/** Dense street points along the shortest routes through the given stops. */
export function routeThrough(graph: RoadGraph, stops: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let s = 0; s + 1 < stops.length; s++) {
    const a = nearestOnGraph(graph, stops[s].x, stops[s].z, true);
    const b = nearestOnGraph(graph, stops[s + 1].x, stops[s + 1].z, true);
    const start = a.d < a.edge.length / 2 ? a.edge.a : a.edge.b;
    const end = b.d < b.edge.length / 2 ? b.edge.a : b.edge.b;
    let node = start;
    out.push({ x: a.x, z: a.z });
    for (const id of shortestPath(graph, start, end)) {
      const e = graph.edges[id];
      const forward = e.a === node;
      for (let i = 0; i < e.pts.length; i += 2) {
        const k = forward ? i : e.pts.length - 2 - i;
        const p = { x: e.pts[k], z: e.pts[k + 1] };
        const last = out[out.length - 1];
        if (!last || Math.hypot(last.x - p.x, last.z - p.z) > 2) out.push(p);
      }
      node = forward ? e.b : e.a;
    }
    out.push({ x: b.x, z: b.z });
  }
  return out;
}

export class Autopilot {
  index = 0;
  private stuck = 0;
  private reverse = 0;
  /** Cruise speed (m/s) for 'cruise'; top speed scale for 'race'. */
  pace: number;

  constructor(
    public vehicle: Vehicle,
    public path: Pt[],
    public mode: 'race' | 'cruise' | 'flee',
    pace = 1,
    private graph: RoadGraph | null = null
  ) {
    this.pace = pace;
  }

  get done(): boolean {
    return this.index >= this.path.length;
  }

  /** Fraction of the route completed (0..1). */
  get progress(): number {
    return this.path.length ? this.index / this.path.length : 1;
  }

  update(dt: number, world: CollisionWorld, threat?: Pt): void {
    const v = this.vehicle;
    if (this.mode === 'flee' && this.graph && threat && this.path.length - this.index < 4) this.extendAway(threat);
    while (this.index < this.path.length && Math.hypot(this.path[this.index].x - v.x, this.path[this.index].z - v.z) < 7) this.index++;
    const aim = this.path[Math.min(this.index, this.path.length - 1)];
    if (!aim) return;
    const want = Math.atan2(aim.x - v.x, aim.z - v.z);
    let delta = want - v.heading;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    let steer = THREE.MathUtils.clamp(delta * 2.3, -1, 1);
    /* Look one more point ahead for the bend. */
    const next = this.path[Math.min(this.index + 1, this.path.length - 1)];
    const bend = next ? Math.abs(Math.atan2(Math.sin(Math.atan2(next.x - aim.x, next.z - aim.z) - want), Math.cos(Math.atan2(next.x - aim.x, next.z - aim.z) - want))) : 0;
    const top = this.mode === 'cruise' ? this.pace : v.spec.maxSpeed * 0.8 * this.pace;
    const desired = THREE.MathUtils.clamp(top - Math.max(Math.abs(delta), bend * 0.6) * 26, 5, top);
    let throttle = v.speed < desired ? 1 : 0;
    let brake = v.speed > desired + 1.5 ? 1 : 0;
    if (this.done) {
      throttle = 0;
      brake = 1;
    }
    if (Math.abs(v.speed) < 1 && throttle > 0) this.stuck += dt;
    else this.stuck = Math.max(0, this.stuck - dt);
    if (this.stuck > 1.2) {
      this.reverse = 1;
      this.stuck = 0;
    }
    if (this.reverse > 0) {
      this.reverse -= dt;
      throttle = 0;
      brake = 1;
      steer = -steer;
    }
    v.update({ throttle, brake, steer, handbrake: false }, dt, world);
    v.sync();
  }

  /** Flee: append the street that leads away from the threat. */
  private extendAway(threat: Pt): void {
    const g = this.graph!;
    const last = this.path[this.path.length - 1] ?? { x: this.vehicle.x, z: this.vehicle.z };
    const here = nearestOnGraph(g, last.x, last.z, true);
    const node = Math.hypot(g.nodes[here.edge.a].x - last.x, g.nodes[here.edge.a].z - last.z) < Math.hypot(g.nodes[here.edge.b].x - last.x, g.nodes[here.edge.b].z - last.z) ? here.edge.a : here.edge.b;
    let best = g.nodes[node].edges[0];
    let bestScore = -Infinity;
    for (const id of g.nodes[node].edges) {
      const e = g.edges[id];
      if (!e.main) continue;
      const other = g.nodes[e.a === node ? e.b : e.a];
      const score = Math.hypot(other.x - threat.x, other.z - threat.z) + Math.random() * 40;
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    }
    const e = g.edges[best];
    const forward = e.a === node;
    for (let i = 0; i < e.pts.length; i += 2) {
      const k = forward ? i : e.pts.length - 2 - i;
      this.path.push({ x: e.pts[k], z: e.pts[k + 1] });
    }
  }
}
