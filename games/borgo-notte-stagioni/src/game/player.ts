import * as THREE from 'three';
import type { CollisionWorld } from '../data/colliders';
import { animateIdle, animateWalk, createBlobShadow, createPerson, setJoints, type PersonRig } from '../world/person';
import type { Controls } from './input';
import type { Vehicle } from './vehicle';
import type { HeightField } from '../data/heights';

const WALK = 2.3;
const RUN = 5.6;
const RADIUS = 0.35;
/* Jetpack. */
const FLY = 15;
const BOOST = 32;
const CLIMB = 10;
const CEILING = 180;
const GRAVITY = 20;

/** Twin tanks with nozzles; the flames scale with thrust. */
function createJetpack(): { group: THREE.Group; flames: THREE.Mesh[] } {
  const group = new THREE.Group();
  const metal = new THREE.MeshLambertMaterial({ color: 0x9aa0a6 });
  const dark = new THREE.MeshLambertMaterial({ color: 0x3a3e44 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const flames: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.52, 10), metal);
    tank.position.set(0.12 * side, 1.27, -0.27);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), metal);
    cap.position.set(0.12 * side, 1.53, -0.27);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.12, 8), dark);
    nozzle.position.set(0.12 * side, 0.96, -0.27);
    /* Base at the nozzle, tip pointing down. */
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 8).rotateX(Math.PI).translate(0, -0.3, 0), flameMat);
    flame.position.set(0.12 * side, 0.9, -0.27);
    group.add(tank, cap, nozzle, flame);
    flames.push(flame);
  }
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.06), dark);
  strap.position.set(0, 1.32, -0.2);
  group.add(strap);
  group.visible = false;
  return { group, flames };
}

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
  /** Height above the street (roofs or flight). */
  y = 0;
  vy = 0;
  /** Jetpack on: thrust holds altitude; off in the air: free fall. */
  flying = false;
  private jet: { group: THREE.Group; flames: THREE.Mesh[] };
  private hover = 0;
  /** Roof (or street) height under the player, for the shadow. */
  private floorY = 0;

  constructor(scene: THREE.Scene, x: number, z: number, heading: number) {
    this.rig = createPerson('player');
    this.shadow = createBlobShadow(0.9);
    this.jet = createJetpack();
    this.rig.body.add(this.jet.group);
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
    this.y = 0;
    this.vy = 0;
    this.flying = false;
    this.jet.group.visible = false;
    this.heading = heading;
    this.speed = 0;
    this.sync();
  }

  /** In the air or on a roof: no cars to get into, no pickups from the street. */
  get airborne(): boolean {
    return this.y > 0.5;
  }

  /** Switches the jetpack: on lifts off; off lets you drop (safely). */
  toggleJet(): void {
    this.flying = !this.flying;
    this.jet.group.visible = true;
    if (this.flying) {
      this.down = 0;
      this.vy = Math.max(this.vy, 6);
    }
  }

  /** A car hit the player: fall, get up after a moment. */
  knock(): void {
    if (this.down <= 0) this.down = 1.8;
  }

  update(dt: number, controls: Controls, view: { x: number; z: number }, world: CollisionWorld, vehicles: Vehicle[], roofs: HeightField): void {
    if (this.flying || this.y > 0.01) {
      this.fly(dt, controls, view, world, roofs);
      return;
    }
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

  /** Flight, falls and walking on roofs. */
  private fly(dt: number, controls: Controls, view: { x: number; z: number }, world: CollisionWorld, roofs: HeightField): void {
    this.rig.group.rotation.x = 0;
    const f = controls.forward;
    const s = controls.side;
    let mx = view.x * f + -view.z * s;
    let mz = view.z * f + view.x * s;
    const len = Math.hypot(mx, mz);
    const ground = roofs.around(this.x, this.z, 0.4);
    const onRoof = !this.flying && this.y <= ground + 0.05 && ground > 0;
    const top = this.flying ? (controls.run ? BOOST : FLY) : onRoof ? (controls.run ? RUN : WALK) : this.speed;
    const target = len > 0.05 ? top * Math.min(1, len) : 0;
    if (len > 0.05) {
      mx /= len;
      mz /= len;
      const want = Math.atan2(mx, mz);
      let d = want - this.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.heading += d * Math.min(1, dt * (this.flying ? 5 : 12));
    }
    this.speed += (target - this.speed) * Math.min(1, dt * (this.flying ? 2.5 : onRoof ? 10 : 0.5));
    this.vx = Math.sin(this.heading) * this.speed;
    this.vz = Math.cos(this.heading) * this.speed;

    /* Vertical: thrust follows SU/GIÙ and hovers otherwise; off = gravity. */
    if (this.flying) {
      const want = controls.ascend ? CLIMB : controls.descend ? -CLIMB : 0;
      this.vy += (want - this.vy) * Math.min(1, dt * 3);
    } else {
      this.vy -= GRAVITY * dt;
    }
    let ny = Math.min(CEILING, this.y + this.vy * dt);

    /* Walls: a move is blocked where the roof is above the feet. */
    let nx = this.x + this.vx * dt;
    let nz = this.z + this.vz * dt;
    if (roofs.around(nx, nz, 0.4) > ny + 0.6) {
      nx = this.x;
      nz = this.z;
      this.speed *= 0.3;
    }
    if (ny < 1 && !this.flying) {
      /* Near the street the usual colliders apply (trees, fountains). */
      const r = world.resolve({ x: nx, z: nz }, RADIUS);
      nx = r.x;
      nz = r.z;
    }
    const floor = roofs.around(nx, nz, 0.4);
    this.floorY = floor;
    if (ny <= floor) {
      ny = floor;
      if (this.vy < 0) this.vy = 0;
      /* Coming down with the thrust pointed down: land and switch off. */
      if (this.flying && controls.descend) this.flying = false;
    }
    this.x = nx;
    this.z = nz;
    this.y = ny;
    if (!this.flying && this.y <= 0.01) {
      this.y = 0;
      this.jet.group.visible = false;
    }

    /* Pose: legs trailing, arms forward in flight; walk on roofs. */
    this.hover += dt;
    if (this.flying || this.y > floor + 0.05) {
      const lean = Math.min(1, this.speed / BOOST);
      this.rig.body.rotation.x = lean * 0.5;
      this.rig.leftLeg.rotation.x = 0.35 + Math.sin(this.hover * 6) * 0.05;
      this.rig.rightLeg.rotation.x = 0.2 - Math.sin(this.hover * 6) * 0.05;
      this.rig.leftArm.rotation.x = -0.4 - lean * 0.5;
      this.rig.rightArm.rotation.x = -0.4 - lean * 0.5;
      setJoints(this.rig, [0.5, 0.3], [-0.4, -0.4]);
    } else {
      this.rig.body.rotation.x = 0;
      if (this.speed > 0.2) {
        this.phase += dt * (5 + this.speed * 1.3);
        animateWalk(this.rig, this.phase, Math.min(1.25, 0.4 + this.speed / RUN));
      } else animateIdle(this.rig, this.hover);
    }
    const thrust = this.flying ? 0.7 + Math.max(0, this.vy) / CLIMB * 0.6 + Math.random() * 0.15 : 0;
    for (const flame of this.jet.flames) {
      flame.visible = thrust > 0;
      flame.scale.set(1, thrust, 1);
    }
    this.sync();
  }

  sync(rotate = true): void {
    this.rig.group.position.set(this.x, this.y, this.z);
    if (rotate) this.rig.group.rotation.y = this.heading;
    /* The shadow stays on the street (or the roof below), fading with height. */
    this.shadow.position.set(this.x, (this.y > 0.01 ? this.floorY : 0) + 0.08, this.z);
    const lift = Math.min(1, (this.y - (this.y > 0.01 ? this.floorY : 0)) / 40);
    this.shadow.scale.setScalar(1 + lift * 0.6);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - lift * 0.8);
  }
}
