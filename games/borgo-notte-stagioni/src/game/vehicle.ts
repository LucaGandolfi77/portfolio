import * as THREE from 'three';
import { GeoBatch, staticMaterial } from '../world/batch';
import type { CollisionWorld } from '../data/colliders';

export type VehicleType = 'utilitaria' | 'berlina' | 'familiare' | 'furgone' | 'sportiva' | 'taxi' | 'polizia' | 'motocarro';

export interface VehicleSpec {
  length: number;
  width: number;
  height: number;
  maxSpeed: number;
  accel: number;
  grip: number;
  mass: number;
  colors: number[];
  label: string;
}

export const SPECS: Record<VehicleType, VehicleSpec> = {
  utilitaria: { length: 3.6, width: 1.65, height: 1.45, maxSpeed: 38, accel: 7.5, grip: 7, mass: 0.9, label: 'Utilitaria', colors: [0xc23b2e, 0xe8e2d4, 0x2f5d8a, 0xe0b040, 0x5d7a48, 0x9a9da0] },
  berlina: { length: 4.5, width: 1.8, height: 1.45, maxSpeed: 46, accel: 8, grip: 7.5, mass: 1.1, label: 'Berlina', colors: [0x2b2d30, 0x9aa0a6, 0x6a1f22, 0x1f3550, 0xd9d4c8] },
  familiare: { length: 4.7, width: 1.82, height: 1.55, maxSpeed: 43, accel: 7, grip: 7, mass: 1.2, label: 'Familiare', colors: [0x7c8478, 0x3c4c5e, 0xb8b0a0, 0x5a3a2a] },
  furgone: { length: 5.2, width: 2, height: 2.3, maxSpeed: 33, accel: 5.5, grip: 6, mass: 1.6, label: 'Furgone', colors: [0xf0f0ea, 0xd8d0b8, 0x4d6e8a] },
  sportiva: { length: 4.3, width: 1.9, height: 1.2, maxSpeed: 62, accel: 13, grip: 8.5, mass: 1.0, label: 'Sportiva', colors: [0xd62818, 0xf2c20c, 0x111111, 0xf4f4f0, 0x1c6e3c] },
  taxi: { length: 4.5, width: 1.8, height: 1.5, maxSpeed: 44, accel: 7.8, grip: 7.5, mass: 1.1, label: 'Taxi', colors: [0xf4f2ec] },
  polizia: { length: 4.6, width: 1.82, height: 1.5, maxSpeed: 54, accel: 11, grip: 8, mass: 1.25, label: 'Pattuglia', colors: [0x1f3a68] },
  motocarro: { length: 3.0, width: 1.4, height: 1.7, maxSpeed: 22, accel: 4, grip: 5, mass: 0.7, label: 'Motocarro', colors: [0x6f9ab8, 0xc8d2c0, 0xb05030] }
};

/* Shared light materials: one set for the whole traffic, driven by the clock. */
export const LIGHTS = {
  head: new THREE.MeshBasicMaterial({ color: 0xfff2c8 }),
  tail: new THREE.MeshBasicMaterial({ color: 0x701810 }),
  blue: new THREE.MeshBasicMaterial({ color: 0x2050ff }),
  red: new THREE.MeshBasicMaterial({ color: 0xff2020 }),
  beam: new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
};

let bodyMaterial: THREE.MeshLambertMaterial | null = null;

function shade(c: number, k: number): number {
  return new THREE.Color(c).multiplyScalar(k).getHex();
}

export function buildCarModel(type: VehicleType, color: number, beamTexture: THREE.Texture | null): THREE.Group {
  const s = SPECS[type];
  const L = s.length, W = s.width, H = s.height;
  const g = new THREE.Group();
  const body = new GeoBatch();
  /* Wheels stay on the road; the chassis above them pitches and rolls. */
  const wheels = new GeoBatch();
  const glass = 0x26333a;
  const dark = 0x1d1d1f;
  const wheelR = type === 'furgone' ? 0.38 : 0.33;
  const clear = wheelR * 0.75;

  if (type === 'motocarro') {
    body.box(W * 0.7, 1.0, 1.1, 0, clear + 0.55, L / 2 - 0.65, color);
    body.box(W * 0.68, 0.5, 0.06, 0, clear + 1.0, L / 2 - 0.1, glass);
    body.box(W, 0.45, L - 1.2, 0, clear + 0.3, -0.5, shade(color, 0.85));
    body.box(W, 0.35, 0.08, 0, clear + 0.6, -L / 2 + 0.1, shade(color, 0.7));
    for (const [x, z] of [[0, L / 2 - 0.45], [-W / 2 + 0.12, -L / 2 + 0.55], [W / 2 - 0.12, -L / 2 + 0.55]]) {
      wheels.cylinder(wheelR, wheelR, 0.18, 10, x, wheelR, z, dark, 0, 0, Math.PI / 2);
    }
  } else {
    const bodyH = type === 'furgone' ? H * 0.55 : H * 0.48;
    const y0 = clear;
    /* Lower body with bumpers. */
    body.box(W, bodyH, L - 0.2, 0, y0 + bodyH / 2, 0, color);
    body.box(W + 0.04, 0.16, 0.18, 0, y0 + 0.15, L / 2 - 0.1, shade(color, 0.55));
    body.box(W + 0.04, 0.16, 0.18, 0, y0 + 0.15, -L / 2 + 0.1, shade(color, 0.55));
    /* Side skirt line. */
    body.box(W + 0.02, 0.05, L * 0.7, 0, y0 + bodyH * 0.55, 0, shade(color, 0.8));
    /* Cabin. */
    const cabH = H - bodyH - clear;
    let cabL = L * 0.5, cabZ = -L * 0.05;
    if (type === 'furgone') {
      cabL = L * 0.95;
      cabZ = -0.05;
    } else if (type === 'familiare') {
      cabL = L * 0.62;
      cabZ = -L * 0.12;
    } else if (type === 'sportiva') {
      cabL = L * 0.4;
      cabZ = -L * 0.08;
    } else if (type === 'utilitaria') {
      cabL = L * 0.55;
      cabZ = -L * 0.1;
    }
    const cy = y0 + bodyH + cabH / 2;
    body.box(W * 0.86, cabH, cabL, 0, cy, cabZ, color);
    /* Windows as slightly larger dark panels. */
    body.box(W * 0.87, cabH * 0.62, cabL * 0.92, 0, cy + cabH * 0.08, cabZ, glass);
    body.box(W * 0.8, cabH * 0.6, 0.04, 0, cy + cabH * 0.05, cabZ + cabL / 2 + 0.01, glass);
    body.box(W * 0.8, cabH * 0.6, 0.04, 0, cy + cabH * 0.05, cabZ - cabL / 2 - 0.01, glass);
    /* Roof. */
    body.box(W * 0.84, 0.06, cabL * 0.9, 0, y0 + bodyH + cabH + 0.02, cabZ, shade(color, 1.05));
    if (type === 'taxi') {
      body.box(0.7, 0.18, 0.3, 0, y0 + bodyH + cabH + 0.14, cabZ, 0xf2c20c);
      body.box(W + 0.03, 0.12, L * 0.6, 0, y0 + bodyH * 0.55, 0, 0x202020);
    }
    if (type === 'polizia') {
      body.box(W + 0.03, 0.22, L * 0.75, 0, y0 + bodyH * 0.5, 0, 0xf2f2f2);
      body.box(W * 0.6, 0.06, 0.9, 0, y0 + bodyH + 0.01, L * 0.3, 0xf2f2f2);
    }
    if (type === 'sportiva') {
      body.box(W * 0.9, 0.06, 0.3, 0, y0 + bodyH + 0.25, -L / 2 + 0.2, shade(color, 0.6));
    }
    /* Mirrors and grille. */
    body.box(0.12, 0.08, 0.14, W / 2 + 0.05, y0 + bodyH + 0.1, cabZ + cabL / 2 - 0.1, shade(color, 0.8));
    body.box(0.12, 0.08, 0.14, -W / 2 - 0.05, y0 + bodyH + 0.1, cabZ + cabL / 2 - 0.1, shade(color, 0.8));
    body.box(W * 0.5, bodyH * 0.35, 0.03, 0, y0 + bodyH * 0.45, L / 2 - 0.09, dark);
    /* Wheels with hubcaps. */
    const wx = W / 2 - 0.12;
    for (const wz of [L / 2 - 0.75, -L / 2 + 0.75]) {
      for (const sx of [-1, 1]) {
        wheels.cylinder(wheelR, wheelR, 0.24, 10, sx * wx, wheelR, wz, dark, 0, 0, Math.PI / 2);
        wheels.cylinder(wheelR * 0.55, wheelR * 0.55, 0.25, 8, sx * wx, wheelR, wz, 0x8a8c8e, 0, 0, Math.PI / 2);
      }
    }
  }
  bodyMaterial ??= staticMaterial();
  const chassis = new THREE.Group();
  g.add(chassis);
  const mesh = body.build(bodyMaterial);
  if (mesh) chassis.add(mesh);
  const wheelMesh = wheels.build(bodyMaterial);
  if (wheelMesh) g.add(wheelMesh);
  g.userData.chassis = chassis;
  g.userData.body = mesh;

  /* Lights. */
  const lightY = clearY(type) + 0.45;
  const head = new GeoBatch();
  const tail = new GeoBatch();
  for (const sx of [-1, 1]) {
    head.box(0.32, 0.14, 0.05, sx * (W / 2 - 0.3), lightY, L / 2 - 0.05, 0xffffff);
    tail.box(0.3, 0.12, 0.05, sx * (W / 2 - 0.28), lightY, -L / 2 + 0.05, 0xffffff);
  }
  const headMesh = head.build(LIGHTS.head);
  const tailMesh = tail.build(LIGHTS.tail);
  if (headMesh) chassis.add(headMesh);
  if (tailMesh) chassis.add(tailMesh);
  if (type === 'polizia') {
    const blue = new GeoBatch();
    const red = new GeoBatch();
    const top = H + 0.08;
    blue.box(0.42, 0.14, 0.24, -0.25, top, -L * 0.05, 0xffffff);
    red.box(0.42, 0.14, 0.24, 0.25, top, -L * 0.05, 0xffffff);
    const b = blue.build(LIGHTS.blue);
    const r = red.build(LIGHTS.red);
    if (b) chassis.add(b);
    if (r) chassis.add(r);
  }
  /* Headlight beams on the road, faded in at night. */
  if (beamTexture) {
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(5, 9).rotateX(-Math.PI / 2), LIGHTS.beam);
    beam.position.set(0, 0.11, L / 2 + 4);
    beam.renderOrder = 3;
    g.add(beam);
  }
  return g;
}

function clearY(type: VehicleType): number {
  return type === 'furgone' ? 0.28 : 0.25;
}

let nextId = 1;

export type Driver = 'none' | 'player' | 'ai' | 'police';

export interface DriveInput {
  throttle: number;
  brake: number;
  steer: number;
  handbrake: boolean;
}

export const NO_INPUT: DriveInput = { throttle: 0, brake: 0, steer: 0, handbrake: false };

export class Vehicle {
  /** Ultra preset: cars cast the sun's shadows. */
  static castShadows = false;
  readonly id = nextId++;
  readonly type: VehicleType;
  readonly spec: VehicleSpec;
  readonly model: THREE.Group;
  x: number;
  z: number;
  heading: number;
  vx = 0;
  vz = 0;
  yawRate = 0;
  steerAngle = 0;
  health = 100;
  driver: Driver = 'none';
  /** Set when the car is wrecked: it smokes and stops responding. */
  wrecked = false;
  lastImpact = 0;
  /** Damage multiplier: patrols and traffic shrug off wall scrapes. */
  toughness = 1;
  /** Weather grip (rain, snow) for this frame. */
  gripScale = 1;
  /** Seconds left on fire (then burnt out), 0 when not burning. */
  burning = 0;
  burnt = false;
  private glassCracked = false;
  /* Suspension: pitch, roll, heave with their speeds (spring-damper). */
  private pitch = 0;
  private roll = 0;
  private heave = 0;
  private vPitch = 0;
  private vRoll = 0;
  private vHeave = 0;
  private prevSpeed = 0;
  private prevHeading = 0;
  private readonly chassis: THREE.Group;
  private readonly bodyMesh: THREE.Mesh | null;
  private rest: Float32Array | null = null;
  color: number;

  constructor(type: VehicleType, x: number, z: number, heading: number, color: number, beamTexture: THREE.Texture | null) {
    this.type = type;
    this.spec = SPECS[type];
    this.color = color;
    this.x = x;
    this.z = z;
    this.heading = heading;
    this.model = buildCarModel(type, color, beamTexture);
    if (Vehicle.castShadows) this.model.traverse((o) => {
      if (o instanceof THREE.Mesh && o.material !== LIGHTS.beam) o.castShadow = true;
    });
    this.chassis = this.model.userData.chassis as THREE.Group;
    this.bodyMesh = (this.model.userData.body as THREE.Mesh) ?? null;
    this.prevHeading = heading;
    this.sync();
  }

  get forwardX(): number {
    return Math.sin(this.heading);
  }

  get forwardZ(): number {
    return Math.cos(this.heading);
  }

  /** Signed speed along the car's heading (m/s). */
  get speed(): number {
    return this.vx * this.forwardX + this.vz * this.forwardZ;
  }

  get radius(): number {
    return this.spec.width / 2 + 0.05;
  }

  /** The two collision circle centres (front and rear). */
  circles(): Array<[number, number]> {
    const off = this.spec.length / 2 - this.spec.width / 2;
    return [
      [this.x + this.forwardX * off, this.z + this.forwardZ * off],
      [this.x - this.forwardX * off, this.z - this.forwardZ * off]
    ];
  }

  update(input: DriveInput, dt: number, world: CollisionWorld): number {
    const s = this.spec;
    const fx = this.forwardX;
    const fz = this.forwardZ;
    let speed = this.speed;
    let lateral = this.vx * fz - this.vz * fx;
    const control = this.wrecked ? NO_INPUT : input;

    /* Engine, brakes, reverse. */
    if (control.throttle > 0) {
      const room = Math.max(0, 1 - speed / s.maxSpeed);
      speed += s.accel * control.throttle * (0.35 + room * 0.85) * dt;
    }
    if (control.brake > 0) {
      if (speed > 0.6) speed -= 16 * control.brake * dt;
      else speed = Math.max(-s.maxSpeed * 0.3, speed - s.accel * 0.6 * control.brake * dt);
    }
    if (control.handbrake) speed -= Math.sign(speed) * Math.min(Math.abs(speed), 7 * dt);
    /* Rolling resistance and air drag. */
    speed -= speed * (0.12 + Math.abs(speed) * 0.0025) * dt;
    if (control.throttle === 0 && control.brake === 0 && Math.abs(speed) < 0.15) speed = 0;

    /* Steering: full lock at walking pace, much less at speed. */
    const lock = 0.62 / (1 + Math.abs(speed) * 0.06);
    this.steerAngle += (control.steer * lock - this.steerAngle) * Math.min(1, dt * 8);
    const wheelbase = s.length * 0.6;
    const targetYaw = (speed / wheelbase) * Math.tan(this.steerAngle);
    this.yawRate += (targetYaw - this.yawRate) * Math.min(1, dt * (control.handbrake ? 3 : 10));
    this.heading += this.yawRate * dt;

    /* Grip: the sideways slide decays; the handbrake lets the rear go. */
    /* Weight transfer: hard braking at speed lightens the rear (a little oversteer). */
    const transfer = control.brake > 0 && speed > 8 ? 0.75 : 1;
    const grip = control.handbrake ? 1.2 : s.grip * this.gripScale * transfer;
    lateral *= Math.exp(-grip * dt);
    const nfx = Math.sin(this.heading);
    const nfz = Math.cos(this.heading);
    this.vx = nfx * speed + nfz * lateral;
    this.vz = nfz * speed - nfx * lateral;

    this.x += this.vx * dt;
    this.z += this.vz * dt;
    return this.collide(world);
  }

  /** Pushes the car out of buildings; returns the impact speed (m/s). */
  collide(world: CollisionWorld): number {
    let impact = 0;
    for (const [cx, cz] of this.circles()) {
      const r = world.resolve({ x: cx, z: cz }, this.radius);
      if (!r.collided) continue;
      const nx = r.x - cx;
      const nz = r.z - cz;
      const l = Math.hypot(nx, nz);
      if (l < 1e-5) continue;
      this.x += nx;
      this.z += nz;
      const ux = nx / l, uz = nz / l;
      const into = this.vx * ux + this.vz * uz;
      if (into < 0) {
        this.vx -= ux * into * 1.35;
        this.vz -= uz * into * 1.35;
        impact = Math.max(impact, -into);
        if (-into > 3) this.dent(cx - ux * this.radius, cz - uz * this.radius, ux, uz, -into);
      }
    }
    if (impact > 4) this.damage(impact * 1.4);
    return impact;
  }

  damage(amount: number): void {
    this.health = Math.max(0, this.health - amount * this.toughness);
    if (this.health <= 0) this.wrecked = true;
    if (this.health < 12 && !this.burning && !this.burnt) this.burning = 9;
    if (this.health < 60) this.crackGlass();
  }

  /**
   * Dents the body where it was hit: vertices near the contact point move
   * inward (at most 35 cm from their original place) and get a little
   * darker. (x, z) is the contact in world space, (dx, dz) points into the car.
   */
  dent(x: number, z: number, dx: number, dz: number, impact: number): void {
    const mesh = this.bodyMesh;
    if (!mesh) return;
    const pos = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const col = mesh.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    const p = pos.array as Float32Array;
    this.rest ??= p.slice();
    const c = Math.cos(this.heading), s = Math.sin(this.heading);
    const wx = x - this.x, wz = z - this.z;
    const lx = wx * c - wz * s, lz = wx * s + wz * c;
    const ldx = dx * c - dz * s, ldz = dx * s + dz * c;
    const radius = 0.8 + Math.min(0.8, impact * 0.04);
    const depth = Math.min(0.22, impact * 0.014);
    for (let i = 0; i < p.length; i += 3) {
      const d = Math.hypot(p[i] - lx, p[i + 2] - lz);
      if (d >= radius || p[i + 1] < 0.15) continue;
      const f = 1 - d / radius;
      let nx = p[i] + ldx * depth * f;
      let nz = p[i + 2] + ldz * depth * f;
      const ox = nx - this.rest[i], oz = nz - this.rest[i + 2];
      const off = Math.hypot(ox, oz);
      if (off > 0.35) {
        nx = this.rest[i] + (ox / off) * 0.35;
        nz = this.rest[i + 2] + (oz / off) * 0.35;
      }
      p[i] = nx;
      p[i + 2] = nz;
      p[i + 1] -= depth * f * 0.25;
      if (col) {
        const k = 1 - f * 0.12;
        col.setXYZ(i / 3, col.getX(i / 3) * k, col.getY(i / 3) * k, col.getZ(i / 3) * k);
      }
    }
    pos.needsUpdate = true;
    if (col) col.needsUpdate = true;
    mesh.geometry.computeBoundingSphere();
    this.vHeave += Math.min(1.2, impact * 0.05);
  }

  /** Below 60% the windows turn milky with cracks. */
  private crackGlass(): void {
    if (this.glassCracked || !this.bodyMesh) return;
    this.glassCracked = true;
    const col = this.bodyMesh.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (!col) return;
    const glass = new THREE.Color(0x26333a);
    const cracked = new THREE.Color(0x8c999e);
    for (let i = 0; i < col.count; i++) {
      if (Math.abs(col.getX(i) - glass.r) + Math.abs(col.getY(i) - glass.g) + Math.abs(col.getZ(i) - glass.b) < 0.01) {
        col.setXYZ(i, cracked.r, cracked.g, cracked.b);
      }
    }
    col.needsUpdate = true;
  }

  /** The fire is out: a charred shell that does not drive. */
  burnOut(): void {
    this.burning = 0;
    this.burnt = true;
    this.wrecked = true;
    this.health = 0;
    const col = this.bodyMesh?.geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (!col) return;
    for (let i = 0; i < col.count; i++) col.setXYZ(i, col.getX(i) * 0.18 + 0.01, col.getY(i) * 0.16 + 0.01, col.getZ(i) * 0.15 + 0.01);
    col.needsUpdate = true;
  }

  /**
   * Suspension and fire timer, from how the velocity changed since the last
   * frame (works for physics cars and for lane-following traffic alike).
   */
  animate(dt: number): void {
    if (dt <= 0) return;
    const speed = this.speed;
    const longA = THREE.MathUtils.clamp((speed - this.prevSpeed) / dt, -40, 40);
    let dh = this.heading - this.prevHeading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    const latA = THREE.MathUtils.clamp((dh / dt) * speed, -30, 30);
    this.prevSpeed = speed;
    this.prevHeading = this.heading;
    /* Nose dives when braking, squats when accelerating; leans out of bends. */
    const tPitch = THREE.MathUtils.clamp(-longA * 0.011, -0.08, 0.08);
    const tRoll = THREE.MathUtils.clamp(latA * 0.0065, -0.09, 0.09);
    this.vPitch += ((tPitch - this.pitch) * 60 - this.vPitch * 9) * dt;
    this.vRoll += ((tRoll - this.roll) * 50 - this.vRoll * 8) * dt;
    this.vHeave += ((0 - this.heave) * 70 - this.vHeave * 7) * dt;
    this.pitch += this.vPitch * dt;
    this.roll += this.vRoll * dt;
    this.heave = THREE.MathUtils.clamp(this.heave + this.vHeave * dt, -0.15, 0.2);
    this.chassis.rotation.x = this.pitch;
    this.chassis.rotation.z = this.roll;
    this.chassis.position.y = this.heave;
    if (this.burning > 0) {
      this.burning -= dt;
      if (this.burning <= 0) this.burnOut();
    }
  }

  sync(): void {
    this.model.position.set(this.x, 0, this.z);
    this.model.rotation.y = this.heading;
  }
}

/** Separates two overlapping vehicles and trades momentum; returns impact speed. */
export function collideVehicles(a: Vehicle, b: Vehicle): number {
  let impact = 0;
  for (const [ax, az] of a.circles()) {
    for (const [bx, bz] of b.circles()) {
      const dx = bx - ax, dz = bz - az;
      const min = a.radius + b.radius;
      const d2 = dx * dx + dz * dz;
      if (d2 >= min * min || d2 < 1e-6) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d, nz = dz / d;
      const push = (min - d) / 2;
      a.x -= nx * push;
      a.z -= nz * push;
      b.x += nx * push;
      b.z += nz * push;
      const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (rel < 0) {
        const ma = a.spec.mass, mb = b.spec.mass;
        const j = (-1.3 * rel) / (1 / ma + 1 / mb);
        a.vx -= (j / ma) * nx;
        a.vz -= (j / ma) * nz;
        b.vx += (j / mb) * nx;
        b.vz += (j / mb) * nz;
        impact = Math.max(impact, -rel);
        if (-rel > 3) {
          const mx = (ax + bx) / 2, mz = (az + bz) / 2;
          a.dent(mx, mz, -nx, -nz, -rel);
          b.dent(mx, mz, nx, nz, -rel);
        }
      }
    }
  }
  if (impact > 5) {
    a.damage(impact);
    b.damage(impact);
  }
  return impact;
}
