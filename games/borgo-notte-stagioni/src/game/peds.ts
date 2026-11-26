import * as THREE from 'three';
import type { RoadEdge, RoadGraph } from '../data/roads';
import { nearestOnGraph, nextEdge, pointOnEdge } from '../data/roads';
import { addFarMesh, animateIdle, animateWalk, createBlobShadow, createPerson, setFar, type PersonLook, type PersonRig } from '../world/person';
import type { Vehicle } from './vehicle';

/*
 * Pedestrians on the pavements: they walk beside the streets of the road
 * graph, step away from fast cars, and if a car knocks them they fall over,
 * stay down a few seconds, get up and walk off. Nothing more graphic.
 */

const LOOKS: PersonLook[] = ['citizen1', 'citizen2', 'citizen3', 'ada', 'elio', 'marta', 'nino', 'beppe', 'lidia', 'sara', 'pilgrim'];

export interface Ped {
  rig: PersonRig;
  shadow: THREE.Mesh;
  edge: RoadEdge;
  fromA: boolean;
  d: number;
  side: number;
  speed: number;
  phase: number;
  /** 'walk' on the pavement, 'flee' away from a car, 'down' after a knock, 'leave' a car. */
  state: 'walk' | 'flee' | 'down' | 'leave';
  timer: number;
  x: number;
  z: number;
  heading: number;
  fleeX: number;
  fleeZ: number;
}

export class Pedestrians {
  readonly peds: Ped[] = [];
  target: number;
  private rand: () => number;

  constructor(private scene: THREE.Scene, private graph: RoadGraph, target: number) {
    this.target = target;
    let s = 99;
    this.rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  private create(look: PersonLook, edge: RoadEdge, d: number, fromA: boolean, side: number): Ped {
    const rig = createPerson(look);
    addFarMesh(rig);
    const shadow = createBlobShadow(0.8);
    this.scene.add(rig.group, shadow);
    const ped: Ped = {
      rig, shadow, edge, fromA, d, side,
      speed: 1.1 + this.rand() * 0.5,
      phase: this.rand() * 6,
      state: 'walk', timer: 0,
      x: 0, z: 0, heading: 0, fleeX: 0, fleeZ: 0
    };
    this.place(ped);
    return ped;
  }

  private place(ped: Ped): void {
    const p = pointOnEdge(ped.edge, ped.d, ped.fromA);
    const off = ped.edge.width / 2 + 1.3;
    ped.x = p.x - p.dz * off * ped.side;
    ped.z = p.z + p.dx * off * ped.side;
    ped.heading = Math.atan2(p.dx, p.dz);
  }

  /** A driver who leaves a car (carjacked): walks away fast from (x, z). */
  spawnLeaving(x: number, z: number, awayX: number, awayZ: number): void {
    const ped = this.create(LOOKS[Math.floor(this.rand() * LOOKS.length)], this.graph.edges[0], 0, true, 1);
    ped.x = x;
    ped.z = z;
    ped.state = 'leave';
    ped.timer = 6;
    ped.fleeX = awayX;
    ped.fleeZ = awayZ;
    this.peds.push(ped);
  }

  private remove(ped: Ped): void {
    this.scene.remove(ped.rig.group, ped.shadow);
    this.peds.splice(this.peds.indexOf(ped), 1);
  }

  update(dt: number, player: { x: number; z: number }, cars: Vehicle[], onKnock: (ped: Ped, car: Vehicle) => void): void {
    for (const ped of [...this.peds]) {
      if (Math.hypot(ped.x - player.x, ped.z - player.z) > 110 && ped.state !== 'down') this.remove(ped);
    }
    let spawned = 0;
    while (this.peds.length < this.target && spawned < 2) {
      spawned++;
      const edge = this.graph.mainEdges[Math.floor(this.rand() * this.graph.mainEdges.length)];
      const d = this.rand() * edge.length;
      const p = pointOnEdge(edge, d, true);
      const dist = Math.hypot(p.x - player.x, p.z - player.z);
      if (dist < 30 || dist > 95) continue;
      this.peds.push(this.create(LOOKS[Math.floor(this.rand() * LOOKS.length)], edge, d, this.rand() < 0.5, this.rand() < 0.5 ? 1 : -1));
    }

    for (const ped of this.peds) {
      const rig = ped.rig;
      /* Far walkers become one static mesh (a fallen one stays detailed). */
      setFar(rig, ped.state === 'walk' && Math.hypot(ped.x - player.x, ped.z - player.z) > 35);
      if (ped.state === 'down') {
        ped.timer -= dt;
        rig.group.rotation.x = THREE.MathUtils.lerp(rig.group.rotation.x, -Math.PI / 2, Math.min(1, dt * 8));
        if (ped.timer <= 0) {
          rig.group.rotation.x = 0;
          ped.state = 'flee';
          ped.timer = 4;
        }
      } else {
        /* Danger: a car coming fast within a few metres. */
        for (const car of cars) {
          const dx = ped.x - car.x, dz = ped.z - car.z;
          const dist = Math.hypot(dx, dz);
          const speed = Math.hypot(car.vx, car.vz);
          if (dist < car.spec.length / 2 + 0.45 && speed > 3) {
            ped.state = 'down';
            ped.timer = 5;
            onKnock(ped, car);
            break;
          }
          if (speed > 6 && dist < 12 && (car.vx * dx + car.vz * dz) / (dist * speed) > 0.6 && ped.state === 'walk') {
            ped.state = 'flee';
            ped.timer = 3;
            /* Step sideways out of the car's path. */
            const side = Math.sign(car.vx * dz - car.vz * dx) || 1;
            ped.fleeX = ped.x + (-car.vz / speed) * side * 10;
            ped.fleeZ = ped.z + (car.vx / speed) * side * 10;
          }
        }
        if (ped.state === 'walk') {
          ped.d += ped.speed * dt;
          if (ped.d >= ped.edge.length) {
            const node = ped.fromA ? ped.edge.b : ped.edge.a;
            ped.d -= ped.edge.length;
            const next = nextEdge(this.graph, node, ped.edge.id, this.rand);
            ped.fromA = next.a === node;
            ped.edge = next;
          }
          this.place(ped);
          ped.phase += dt * 6;
          animateWalk(rig, ped.phase, 0.7);
        } else if (ped.state === 'flee' || ped.state === 'leave') {
          ped.timer -= dt;
          let tx = ped.fleeX, tz = ped.fleeZ;
          if (ped.state === 'flee' && ped.fleeX === 0 && ped.fleeZ === 0) {
            tx = ped.x + Math.sin(ped.heading) * 10;
            tz = ped.z + Math.cos(ped.heading) * 10;
          }
          const dx = tx - ped.x, dz = tz - ped.z;
          const l = Math.hypot(dx, dz);
          if (l > 0.3) {
            ped.x += (dx / l) * 3.6 * dt;
            ped.z += (dz / l) * 3.6 * dt;
            ped.heading = Math.atan2(dx, dz);
          }
          ped.phase += dt * 10;
          animateWalk(rig, ped.phase, 1.2);
          if (ped.timer <= 0) {
            if (ped.state === 'leave') ped.timer = 0;
            ped.state = 'walk';
            ped.fleeX = ped.fleeZ = 0;
            /* Rejoin the pavement of the nearest street. */
            const near = nearestOnGraph(this.graph, ped.x, ped.z);
            ped.edge = near.edge;
            ped.d = near.d;
            ped.fromA = true;
            const p = pointOnEdge(near.edge, near.d, true);
            ped.side = (ped.x - p.x) * -p.dz + (ped.z - p.z) * p.dx >= 0 ? 1 : -1;
            this.place(ped);
          }
        } else {
          animateIdle(rig, ped.phase);
        }
      }
      rig.group.position.set(ped.x, 0, ped.z);
      rig.group.rotation.y = ped.heading;
      ped.shadow.position.set(ped.x, 0.08, ped.z);
    }
  }
}
