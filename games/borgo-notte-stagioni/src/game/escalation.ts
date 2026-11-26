import * as THREE from 'three';
import type { RoadGraph } from '../data/roads';
import { pointOnEdge } from '../data/roads';
import type { CollisionWorld } from '../data/colliders';
import { SPECS, Vehicle } from './vehicle';
import { animateIdle, animateWalk, createBlobShadow, createPerson, type PersonRig } from '../world/person';

/*
 * What the police add at higher alert levels:
 *   3: a roadblock (two cars across the street ahead, an officer beside them)
 *   4: officers on foot running at you
 *   5: a helicopter with a searchlight that keeps you in sight
 */

interface Roadblock {
  cars: Vehicle[];
  officer: PersonRig;
  x: number;
  z: number;
}

interface Officer {
  rig: PersonRig;
  shadow: THREE.Mesh;
  x: number;
  z: number;
  heading: number;
  phase: number;
}

export const HELI_SIGHT = 120;

function buildHelicopter(): { group: THREE.Group; rotor: THREE.Object3D; tail: THREE.Object3D; light: THREE.Mesh; pool: THREE.Mesh } {
  const group = new THREE.Group();
  const navy = new THREE.MeshLambertMaterial({ color: 0x1f3a68, flatShading: true });
  const white = new THREE.MeshLambertMaterial({ color: 0xe8e8e4, flatShading: true });
  const dark = new THREE.MeshLambertMaterial({ color: 0x1a1a1c });
  const glass = new THREE.MeshLambertMaterial({ color: 0x2a3a44 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), navy);
  body.scale.set(1, 0.85, 1.7);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(1.05, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), glass);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.1, 1.5);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.3, 3.2), white);
  stripe.position.y = -0.2;
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 4.6, 8), navy);
  boom.rotation.x = Math.PI / 2;
  boom.position.set(0, 0.25, -3.6);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.8), white);
  fin.position.set(0, 0.7, -5.7);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.18), dark);
  tail.position.set(0.18, 0.6, -5.8);
  const rotor = new THREE.Group();
  for (let k = 0; k < 2; k++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(9, 0.05, 0.32), dark);
    blade.rotation.y = (k * Math.PI) / 2;
    rotor.add(blade);
  }
  rotor.position.y = 1.35;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 6), dark);
  mast.position.y = 1.1;
  for (const side of [-1, 1]) {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 3.2), dark);
    skid.position.set(0.95 * side, -1.35, 0);
    group.add(skid);
  }
  /* Searchlight: a soft cone down to the ground and a pool of light. */
  const light = new THREE.Mesh(
    new THREE.ConeGeometry(7, 1, 18, 1, true).translate(0, -0.5, 0),
    new THREE.MeshBasicMaterial({ color: 0xfff3c8, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(7, 24).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  pool.renderOrder = 4;
  group.add(body, nose, stripe, boom, fin, tail, rotor, mast);
  return { group, rotor, tail, light, pool };
}

export class Escalation {
  private block: Roadblock | null = null;
  readonly officers: Officer[] = [];
  private heli: ReturnType<typeof buildHelicopter> | null = null;
  private heliPos = new THREE.Vector3();
  private t = 0;

  constructor(private scene: THREE.Scene, private graph: RoadGraph, private world: CollisionWorld, private beam: THREE.Texture | null) {}

  get vehicles(): Vehicle[] {
    return this.block ? this.block.cars : [];
  }

  /** Is the target lit by the helicopter? */
  sees(x: number, z: number): boolean {
    return !!this.heli && Math.hypot(this.heliPos.x - x, this.heliPos.z - z) < HELI_SIGHT;
  }

  get helicopter(): THREE.Vector3 | null {
    return this.heli ? this.heliPos : null;
  }

  clear(): void {
    this.dropBlock();
    for (const o of this.officers) this.scene.remove(o.rig.group, o.shadow);
    this.officers.length = 0;
    if (this.heli) {
      this.scene.remove(this.heli.group, this.heli.light, this.heli.pool);
      this.heli = null;
    }
  }

  /** A roadblock car the player drives off with is no longer ours. */
  release(v: Vehicle): void {
    if (!this.block) return;
    const i = this.block.cars.indexOf(v);
    if (i >= 0) this.block.cars.splice(i, 1);
  }

  private dropBlock(): void {
    if (!this.block) return;
    for (const c of this.block.cars) this.scene.remove(c.model);
    this.scene.remove(this.block.officer.group);
    this.block = null;
  }

  /** Two cars across a street 110-170 m ahead of where the target is heading. */
  private placeBlock(target: { x: number; z: number; vx: number; vz: number }): void {
    const sp = Math.hypot(target.vx, target.vz);
    if (sp < 4) return;
    const hx = target.vx / sp, hz = target.vz / sp;
    let best: { x: number; z: number; dx: number; dz: number; w: number } | null = null;
    let bestScore = -Infinity;
    for (const e of this.graph.mainEdges) {
      if (e.width < 5) continue;
      const p = pointOnEdge(e, e.length / 2, true);
      const rx = p.x - target.x, rz = p.z - target.z;
      const d = Math.hypot(rx, rz);
      if (d < 110 || d > 170) continue;
      const ahead = (rx * hx + rz * hz) / d;
      if (ahead < 0.8) continue;
      const score = ahead - Math.abs(d - 140) / 200;
      if (score > bestScore) {
        bestScore = score;
        best = { x: p.x, z: p.z, dx: p.dx, dz: p.dz, w: e.width };
      }
    }
    if (!best) return;
    const across = Math.atan2(best.dz, -best.dx);
    const cars: Vehicle[] = [];
    for (const side of [-1, 1]) {
      const off = Math.min(best.w / 2 - 1, 2.4) * side;
      const v = new Vehicle('polizia', best.x - best.dz * off, best.z + best.dx * off, across, SPECS.polizia.colors[0], this.beam);
      v.driver = 'police';
      v.toughness = 0.15;
      this.scene.add(v.model);
      cars.push(v);
    }
    const officer = createPerson('agente');
    officer.group.position.set(best.x + best.dx * 4, 0, best.z + best.dz * 4);
    officer.group.rotation.y = Math.atan2(-best.dx, -best.dz);
    this.scene.add(officer.group);
    this.block = { cars, officer, x: best.x, z: best.z };
  }

  update(dt: number, level: number, target: { x: number; z: number; vx: number; vz: number; onFoot: boolean }, spawnFrom: Array<{ x: number; z: number }>): void {
    this.t += dt;
    /* 3+: roadblock ahead; gone when far behind or the alert drops. */
    if (level >= 3) {
      if (!this.block) this.placeBlock(target);
      else if (Math.hypot(this.block.x - target.x, this.block.z - target.z) > 260) this.dropBlock();
      if (this.block) animateIdle(this.block.officer, this.t, 0.6);
    } else this.dropBlock();

    /* 4+: up to three officers on foot, out of the nearest patrol cars. */
    if (level >= 4) {
      while (this.officers.length < 3 && spawnFrom.length) {
        const from = spawnFrom[this.officers.length % spawnFrom.length];
        if (Math.hypot(from.x - target.x, from.z - target.z) > 90) break;
        const rig = createPerson('agente');
        const shadow = createBlobShadow(0.8);
        this.scene.add(rig.group, shadow);
        this.officers.push({ rig, shadow, x: from.x + 2, z: from.z + 2, heading: 0, phase: Math.random() * 6 });
      }
    }
    for (const o of [...this.officers]) {
      const dx = target.x - o.x, dz = target.z - o.z;
      const d = Math.hypot(dx, dz);
      if (level < 4 || d > 140) {
        this.scene.remove(o.rig.group, o.shadow);
        this.officers.splice(this.officers.indexOf(o), 1);
        continue;
      }
      if (d > 1.1) {
        const speed = target.onFoot ? 5.4 : 6.2;
        const r = this.world.resolve({ x: o.x + (dx / d) * speed * dt, z: o.z + (dz / d) * speed * dt }, 0.35);
        o.x = r.x;
        o.z = r.z;
        o.heading = Math.atan2(dx, dz);
        o.phase += dt * 11;
        animateWalk(o.rig, o.phase, 1.25);
      } else animateIdle(o.rig, this.t);
      o.rig.group.position.set(o.x, 0, o.z);
      o.rig.group.rotation.y = o.heading;
      o.shadow.position.set(o.x, 0.08, o.z);
    }

    /* 5: the helicopter follows with some lag at 45 m, light on the target. */
    if (level >= 5 && !this.heli) {
      this.heli = buildHelicopter();
      this.heliPos.set(target.x - 150, 60, target.z - 150);
      this.scene.add(this.heli.group, this.heli.light, this.heli.pool);
    } else if (level < 5 && this.heli) {
      this.scene.remove(this.heli.group, this.heli.light, this.heli.pool);
      this.heli = null;
    }
    if (this.heli) {
      const h = this.heli;
      const want = new THREE.Vector3(target.x - target.vx * 0.8, 45, target.z - target.vz * 0.8);
      const step = want.sub(this.heliPos);
      const len = step.length();
      const max = 24 * dt;
      if (len > max) step.multiplyScalar(max / len);
      this.heliPos.add(step);
      h.group.position.copy(this.heliPos);
      h.group.rotation.y = Math.atan2(target.x - this.heliPos.x, target.z - this.heliPos.z);
      h.group.rotation.z = Math.sin(this.t * 0.7) * 0.05;
      h.rotor.rotation.y += dt * 28;
      /* The light swings a little around the target. */
      const lx = target.x + Math.sin(this.t * 0.9) * 3, lz = target.z + Math.cos(this.t * 0.7) * 3;
      const lit = Math.hypot(this.heliPos.x - lx, this.heliPos.z - lz) < HELI_SIGHT;
      h.pool.visible = h.light.visible = lit;
      h.pool.position.set(lx, 0.12, lz);
      const from = this.heliPos.clone().add(new THREE.Vector3(0, -1.2, 0));
      const to = new THREE.Vector3(lx, 0, lz);
      const dir = to.clone().sub(from);
      h.light.position.copy(from);
      h.light.scale.set(1, dir.length(), 1);
      h.light.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
    }
  }
}
