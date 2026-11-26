import * as THREE from 'three';
import type { RoadGraph } from '../data/roads';
import { pointOnEdge } from '../data/roads';

/*
 * Traffic lights at the junctions of the main streets. Two phases per
 * junction (the two axes of the crossing): green 11 s, amber 3 s, one
 * second of all red. Traffic stops at the line; running a red in front of
 * a patrol raises the alert.
 */

export type Light = 'green' | 'amber' | 'red';

const MAIN = new Set(['primary', 'secondary', 'tertiary', 'primary_link']);
const GREEN = 11;
const AMBER = 3;
const ALL_RED = 1;
const CYCLE = (GREEN + AMBER + ALL_RED) * 2;

interface Approach {
  edge: number;
  phase: 0 | 1;
  /** Unit vector from the junction along the approaching street. */
  dx: number;
  dz: number;
  /** Signal head position and facing. */
  hx: number;
  hz: number;
  heading: number;
}

export interface Junction {
  node: number;
  x: number;
  z: number;
  offset: number;
  approaches: Approach[];
}

export function lightAt(t: number, phase: 0 | 1, offset: number): Light {
  const c = (((t + offset) % CYCLE) + CYCLE) % CYCLE;
  const half = GREEN + AMBER + ALL_RED;
  const local = phase === 0 ? c : (c + half) % CYCLE;
  if (local < GREEN) return 'green';
  if (local < GREEN + AMBER) return 'amber';
  return 'red';
}

export function planJunctions(graph: RoadGraph): Junction[] {
  const out: Junction[] = [];
  let seed = 77;
  const rand = (): number => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const node of graph.nodes) {
    if (node.edges.length < 3) continue;
    const edges = node.edges.map((id) => graph.edges[id]);
    if (!edges.every((e) => e.main)) continue;
    if (edges.filter((e) => MAIN.has(e.kind)).length < 2) continue;
    if (out.some((j) => Math.hypot(j.x - node.x, j.z - node.z) < 40)) continue;
    const approaches: Approach[] = [];
    let axis: number | null = null;
    for (const e of edges) {
      if (e.length < 14) continue;
      const fromA = e.a === node.id;
      const p = pointOnEdge(e, 10, fromA);
      const dx = p.x - node.x, dz = p.z - node.z;
      const l = Math.hypot(dx, dz) || 1;
      const angle = Math.atan2(dx / l, dz / l);
      axis ??= angle;
      let diff = Math.abs(angle - axis) % Math.PI;
      if (diff > Math.PI / 2) diff = Math.PI - diff;
      const phase: 0 | 1 = diff < Math.PI / 4 ? 0 : 1;
      /* The head stands on the right of a car driving towards the junction. */
      const off = e.width / 2 + 0.9;
      const hx = p.x - (dz / l) * off * -1;
      const hz = p.z + (dx / l) * off * -1;
      approaches.push({ edge: e.id, phase, dx: dx / l, dz: dz / l, hx, hz, heading: angle });
    }
    if (approaches.length >= 3 && approaches.some((a) => a.phase === 1)) {
      out.push({ node: node.id, x: node.x, z: node.z, offset: rand() * CYCLE, approaches });
    }
  }
  return out;
}

export class TrafficSignals {
  readonly junctions: Junction[];
  private byApproach = new Map<string, { j: Junction; a: Approach }>();
  private t = 0;
  private lamps: Record<Light, THREE.InstancedMesh>;
  private index: Array<{ j: Junction; a: Approach }> = [];
  private shown: Light[] = [];

  constructor(scene: THREE.Scene, graph: RoadGraph) {
    this.junctions = planJunctions(graph);
    for (const j of this.junctions) for (const a of j.approaches) {
      this.byApproach.set(`${j.node}:${a.edge}`, { j, a });
      this.index.push({ j, a });
    }
    const n = this.index.length;
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x2c2e30 });
    const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.08, 3.4, 6).translate(0, 1.7, 0), poleMat, n);
    const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.95, 0.24).translate(0, 3.6, 0), poleMat, n);
    const lamp = (y: number): THREE.InstancedMesh => {
      const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, 0.2, 0.06).translate(0, y, 0.13), new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
      return m;
    };
    this.lamps = { red: lamp(3.9), amber: lamp(3.6), green: lamp(3.3) };
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const one = new THREE.Vector3(1, 1, 1);
    this.index.forEach(({ a }, i) => {
      /* Lamps face away from the junction, towards the incoming cars. */
      q.setFromAxisAngle(up, a.heading);
      m.compose(new THREE.Vector3(a.hx, 0, a.hz), q, one);
      poles.setMatrixAt(i, m);
      boxes.setMatrixAt(i, m);
      for (const l of Object.values(this.lamps)) l.setMatrixAt(i, m);
      this.shown.push('green');
    });
    for (const mesh of [poles, boxes, ...Object.values(this.lamps)]) {
      mesh.computeBoundingSphere();
      scene.add(mesh);
    }
    this.paint(true);
  }

  /** Light for a car on `edge` driving towards `node`, or null if no signal. */
  state(node: number, edge: number): Light | null {
    const hit = this.byApproach.get(`${node}:${edge}`);
    return hit ? lightAt(this.t, hit.a.phase, hit.j.offset) : null;
  }

  update(dt: number): void {
    this.t += dt;
    this.paint(false);
  }

  private paint(force: boolean): void {
    const on = { red: new THREE.Color(0xff2a1a), amber: new THREE.Color(0xffb020), green: new THREE.Color(0x30ff70) };
    const off = new THREE.Color(0x1a1a1a);
    let changed = force;
    this.index.forEach(({ j, a }, i) => {
      const light = lightAt(this.t, a.phase, j.offset);
      if (!force && light === this.shown[i]) return;
      this.shown[i] = light;
      changed = true;
      for (const k of ['red', 'amber', 'green'] as Light[]) this.lamps[k].setColorAt(i, k === light ? on[k] : off);
    });
    if (changed) for (const l of Object.values(this.lamps)) if (l.instanceColor) l.instanceColor.needsUpdate = true;
  }

  /**
   * Did a car going from `from` to `to` cross a junction against the red?
   * The approach is the one whose street points back towards `from`.
   */
  ranRed(from: { x: number; z: number }, to: { x: number; z: number }): boolean {
    for (const j of this.junctions) {
      const before = Math.hypot(from.x - j.x, from.z - j.z);
      const after = Math.hypot(to.x - j.x, to.z - j.z);
      if (!(before > 6 && after <= 6 && before < 20)) continue;
      const vx = (from.x - j.x) / before, vz = (from.z - j.z) / before;
      let best: Approach | null = null;
      let bestDot = 0.7;
      for (const a of j.approaches) {
        const dot = a.dx * vx + a.dz * vz;
        if (dot > bestDot) {
          best = a;
          bestDot = dot;
        }
      }
      if (best && lightAt(this.t, best.phase, j.offset) === 'red') return true;
    }
    return false;
  }
}
