import * as THREE from 'three';
import type { Vehicle } from './vehicle';

/*
 * Smoke from damaged engines, flames on burning cars, debris in hard
 * crashes. Fixed pools, no allocation per frame.
 */

const SMOKE = 260;
const FIRE = 160;
const DEBRIS = 90;

function softDot(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

class Puffs {
  readonly points: THREE.Points;
  private pos: Float32Array;
  private vel: Float32Array;
  private life: Float32Array;
  private next = 0;

  constructor(scene: THREE.Scene, private count: number, material: THREE.PointsMaterial) {
    this.pos = new Float32Array(count * 3).fill(-1000);
    this.vel = new Float32Array(count * 3);
    this.life = new Float32Array(count);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.points = new THREE.Points(g, material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  emit(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number): void {
    const i = this.next;
    this.next = (this.next + 1) % this.count;
    this.pos.set([x, y, z], i * 3);
    this.vel.set([vx, vy, vz], i * 3);
    this.life[i] = life;
  }

  update(dt: number, drag: number, lift: number): void {
    let any = false;
    for (let i = 0; i < this.count; i++) {
      if (this.life[i] <= 0) continue;
      any = true;
      this.life[i] -= dt;
      const o = i * 3;
      this.vel[o + 1] += lift * dt;
      for (let k = 0; k < 3; k++) {
        this.vel[o + k] *= 1 - drag * dt;
        this.pos[o + k] += this.vel[o + k] * dt;
      }
      if (this.life[i] <= 0) this.pos[o + 1] = -1000;
    }
    this.points.visible = any;
    (this.points.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  }
}

export class VehicleFx {
  private smoke: Puffs;
  private fire: Puffs;
  private debris: THREE.InstancedMesh;
  private dPos = new Float32Array(DEBRIS * 3);
  private dVel = new Float32Array(DEBRIS * 3);
  private dSpin = new Float32Array(DEBRIS);
  private dLife = new Float32Array(DEBRIS);
  private dNext = 0;
  private acc = 0;
  private m = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();
  private s = new THREE.Vector3();
  private p = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    const dot = softDot();
    this.smoke = new Puffs(scene, SMOKE, new THREE.PointsMaterial({ map: dot, color: 0x5a5a5e, size: 2.4, transparent: true, opacity: 0.55, depthWrite: false }));
    this.fire = new Puffs(
      scene,
      FIRE,
      new THREE.PointsMaterial({ map: dot, color: 0xff8a2a, size: 1.6, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.debris = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 0.06, 0.2), new THREE.MeshLambertMaterial({ color: 0xffffff }), DEBRIS);
    this.debris.frustumCulled = false;
    this.m.makeScale(0, 0, 0);
    for (let i = 0; i < DEBRIS; i++) this.debris.setMatrixAt(i, this.m);
    this.debris.setColorAt(0, new THREE.Color(0xffffff));
    scene.add(this.debris);
  }

  /** Bits of bodywork from a crash at (x, z). */
  crash(x: number, z: number, impact: number, color: number): void {
    const n = Math.min(10, Math.round(impact / 2));
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k++) {
      const i = this.dNext;
      this.dNext = (this.dNext + 1) % DEBRIS;
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * impact * 0.25;
      this.dPos.set([x, 0.7, z], i * 3);
      this.dVel.set([Math.cos(a) * sp, 3 + Math.random() * 3, Math.sin(a) * sp], i * 3);
      this.dSpin[i] = (Math.random() - 0.5) * 14;
      this.dLife[i] = 3 + Math.random();
      this.debris.setColorAt(i, Math.random() < 0.3 ? new THREE.Color(0x2a2a2c) : c);
    }
    if (this.debris.instanceColor) this.debris.instanceColor.needsUpdate = true;
  }

  update(dt: number, vehicles: Vehicle[], camera: THREE.Vector3): void {
    this.acc += dt;
    const step = this.acc > 0.05;
    if (step) this.acc = 0;
    for (const v of vehicles) {
      if (Math.abs(v.x - camera.x) > 130 || Math.abs(v.z - camera.z) > 130) continue;
      const hx = v.x + Math.sin(v.heading) * v.spec.length * 0.35;
      const hz = v.z + Math.cos(v.heading) * v.spec.length * 0.35;
      if (step && v.health < 35) {
        const dark = v.burnt ? 0.4 : 1;
        this.smoke.emit(hx + (Math.random() - 0.5) * 0.4, 1.2, hz, (Math.random() - 0.5) * 0.6, 1.2 + Math.random() * dark, (Math.random() - 0.5) * 0.6, 2.5 + Math.random() * 1.5);
      }
      if (v.burning > 0) {
        for (let k = 0; k < 3; k++) {
          this.fire.emit(hx + (Math.random() - 0.5) * 1.2, 1 + Math.random() * 0.4, hz + (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.5, 2 + Math.random() * 2, (Math.random() - 0.5) * 0.5, 0.45 + Math.random() * 0.4);
        }
        if (step) this.smoke.emit(hx, 2, hz, 0, 2.5, 0, 3.5);
      }
    }
    this.smoke.update(dt, 0.6, 0.4);
    this.fire.update(dt, 1.5, 1.5);
    for (let i = 0; i < DEBRIS; i++) {
      if (this.dLife[i] <= 0) continue;
      this.dLife[i] -= dt;
      const o = i * 3;
      this.dVel[o + 1] -= 14 * dt;
      for (let k = 0; k < 3; k++) this.dPos[o + k] += this.dVel[o + k] * dt;
      if (this.dPos[o + 1] < 0.04) {
        this.dPos[o + 1] = 0.04;
        this.dVel[o + 1] *= -0.3;
        this.dVel[o] *= 0.6;
        this.dVel[o + 2] *= 0.6;
        this.dSpin[i] *= 0.6;
      }
      const scale = this.dLife[i] > 0 ? Math.min(1, this.dLife[i]) : 0;
      this.e.set(this.dLife[i] * this.dSpin[i], this.dLife[i] * this.dSpin[i] * 0.7, 0);
      this.q.setFromEuler(this.e);
      this.m.compose(this.p.set(this.dPos[o], this.dPos[o + 1], this.dPos[o + 2]), this.q, this.s.setScalar(scale));
      this.debris.setMatrixAt(i, this.m);
    }
    this.debris.instanceMatrix.needsUpdate = true;
  }
}
