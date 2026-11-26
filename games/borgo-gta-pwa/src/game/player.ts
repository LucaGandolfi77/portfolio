import * as THREE from 'three';
import type { CollisionWorld } from '../data/colliders';
import { animateIdle, animateWalk, createBlobShadow, createPerson, setJoints, type PersonRig } from '../world/person';
import type { Controls } from './input';
import type { Vehicle } from './vehicle';

const WALK = 2.3;
const RUN = 5.6;
const RADIUS = 0.35;

export class Walker {
  readonly rig: PersonRig;
  readonly shadow: THREE.Mesh;
  x: number;
  z: number;
  heading: number;
  speed = 0;
  vx = 0;
  vz = 0;
  private phase = 0;
  private idle = 0;
  down = 0;

  constructor(scene: THREE.Scene, x: number, z: number, heading: number) {
    this.rig = createPerson('player');
    this.shadow = createBlobShadow(0.9);
    scene.add(this.rig.group, this.shadow);
    this.x = x;
    this.z = z;
    this.heading = heading;
    this.sync();
  }

  set visible(v: boolean) {
    this.rig.group.visible = v;
    this.shadow.visible = v;
  }

  get visible(): boolean {
    return this.rig.group.visible;
  }

  place(x: number, z: number, heading: number): void {
    this.x = x;
    this.z = z;
    this.heading = heading;
    this.speed = 0;
    this.sync();
  }

  /** A car hit the player: fall, get up after a moment. */
  knock(): void {
    if (this.down <= 0) this.down = 1.8;
  }

  update(dt: number, controls: Controls, view: { x: number; z: number }, world: CollisionWorld, vehicles: Vehicle[]): void {
    if (this.down > 0) {
      this.down -= dt;
      this.rig.group.rotation.x = THREE.MathUtils.lerp(this.rig.group.rotation.x, this.down > 0.4 ? -Math.PI / 2 : 0, Math.min(1, dt * 8));
      this.sync(false);
      return;
    }
    this.rig.group.rotation.x = 0;
    const f = controls.forward;
    const s = controls.side;
    const rx = -view.z;
    const rz = view.x;
    let mx = view.x * f + rx * s;
    let mz = view.z * f + rz * s;
    const len = Math.hypot(mx, mz);
    const target = len > 0.05 ? (controls.run ? RUN : WALK) * Math.min(1, len) : 0;
    if (len > 0.05) {
      mx /= len;
      mz /= len;
      const want = Math.atan2(mx, mz);
      let d = want - this.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.heading += d * Math.min(1, dt * 12);
    }
    this.speed += (target - this.speed) * Math.min(1, dt * 10);
    this.vx = Math.sin(this.heading) * this.speed;
    this.vz = Math.cos(this.heading) * this.speed;
    const r = world.resolve({ x: this.x + this.vx * dt, z: this.z + this.vz * dt }, RADIUS);
    this.x = r.x;
    this.z = r.z;
    /* Cars are solid too. */
    for (const v of vehicles) {
      for (const [cx, cz] of v.circles()) {
        const dx = this.x - cx, dz = this.z - cz;
        const min = v.radius + RADIUS;
        const d2 = dx * dx + dz * dz;
        if (d2 < min * min && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          this.x = cx + (dx / d) * min;
          this.z = cz + (dz / d) * min;
          if (Math.hypot(v.vx, v.vz) > 4) this.knock();
        }
      }
    }
    if (this.speed > 0.2) {
      this.phase += dt * (5 + this.speed * 1.3);
      animateWalk(this.rig, this.phase, Math.min(1.25, 0.4 + this.speed / RUN));
      this.idle = 0;
    } else {
      this.idle += dt;
      animateIdle(this.rig, this.idle);
      setJoints(this.rig, [0.02, 0.02], [-0.12, -0.12]);
    }
    this.sync();
  }

  sync(rotate = true): void {
    this.rig.group.position.set(this.x, 0, this.z);
    if (rotate) this.rig.group.rotation.y = this.heading;
    this.shadow.position.set(this.x, 0.08, this.z);
  }
}
