import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { BrickEngine } from './BrickEngine';

interface BrickParticle {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
  age: number;
  life: number;
  color: THREE.Color;
}

const MAX_PARTICLES = 220;
const STOP_MOTION_STEP = 1 / 15; // 15 FPS stylized brick stop-motion feel

/**
 * Stylized 15 FPS stop-motion brick bursts, elemental explosions,
 * confetti detonations, and Holo-Visor expanding scan rings.
 */
export class StopMotionFX {
  private readonly instanced: THREE.InstancedMesh;
  private readonly particles: BrickParticle[] = [];
  private readonly dummy = new THREE.Object3D();
  private readonly visorRing: THREE.Mesh;
  private visorPulse = 0;
  private stopMotionAccum = 0;

  constructor(scene: THREE.Scene, engine: BrickEngine) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.22,
      clearcoat: 0.6,
    });
    this.instanced = new THREE.InstancedMesh(engine.getBoxGeo(), mat, MAX_PARTICLES);
    this.instanced.castShadow = false;
    this.instanced.frustumCulled = false;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        rot: new THREE.Euler(),
        rotVel: new THREE.Vector3(),
        scale: 0,
        age: 0,
        life: 0.5,
        color: new THREE.Color(0xffffff),
      });
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.instanced.setMatrixAt(i, this.dummy.matrix);
      this.instanced.setColorAt(i, new THREE.Color(0xffffff));
    }
    this.instanced.instanceMatrix.needsUpdate = true;
    scene.add(this.instanced);

    // Holo-Visor expanding pulse ring
    const ringGeo = new THREE.RingGeometry(0.85, 1.0, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: BRICK_PALETTE.visorCyan,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    this.visorRing = new THREE.Mesh(ringGeo, ringMat);
    this.visorRing.position.y = 0.14;
    scene.add(this.visorRing);
  }

  spawnBrickBurst(origin: THREE.Vector3, colors: number[], count = 16, speed = 7.5, scale = 0.34): void {
    let spawned = 0;
    for (let i = 0; i < MAX_PARTICLES && spawned < count; i++) {
      const p = this.particles[i];
      if (p.active) continue;
      p.active = true;
      p.pos.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 0.5, (Math.random() - 0.5) * 0.6));
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.45 + Math.random() * 0.75);
      p.vel.set(Math.cos(angle) * spd, 3.8 + Math.random() * 5.2, Math.sin(angle) * spd);
      p.rot.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      p.rotVel.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
      p.scale = scale * (0.7 + Math.random() * 0.6);
      p.age = 0;
      p.life = 0.45 + Math.random() * 0.45;
      p.color.setHex(colors[spawned % colors.length]);
      spawned++;
    }
  }

  triggerVisorPulse(origin: THREE.Vector3): void {
    this.visorRing.position.set(origin.x, 0.15, origin.z);
    this.visorPulse = 0.001;
  }

  update(dt: number): void {
    // Update Holo-Visor ring smoothly
    if (this.visorPulse > 0) {
      this.visorPulse += dt * 2.2;
      const mat = this.visorRing.material as THREE.MeshBasicMaterial;
      if (this.visorPulse >= 1) {
        this.visorPulse = 0;
        mat.opacity = 0;
      } else {
        const radius = 1 + this.visorPulse * 22;
        this.visorRing.scale.setScalar(radius);
        mat.opacity = (1 - this.visorPulse) * 0.75;
      }
    }

    // Advance brick particles smoothly in physics, but push transforms at 15 FPS for stop-motion charm
    let anyActive = false;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      anyActive = true;
      p.age += dt;
      if (p.age >= p.life) {
        p.active = false;
        p.scale = 0;
        continue;
      }
      p.vel.y -= 18 * dt;
      p.pos.addScaledVector(p.vel, dt);
      if (p.pos.y < 0.16) {
        p.pos.y = 0.16;
        p.vel.y = Math.abs(p.vel.y) * 0.35;
        p.vel.x *= 0.75;
        p.vel.z *= 0.75;
      }
      p.rot.x += p.rotVel.x * dt;
      p.rot.y += p.rotVel.y * dt;
      p.rot.z += p.rotVel.z * dt;
    }

    this.stopMotionAccum += dt;
    if (this.stopMotionAccum < STOP_MOTION_STEP && anyActive) return;
    this.stopMotionAccum = 0;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) {
        this.dummy.position.set(0, -100, 0);
        this.dummy.scale.setScalar(0);
      } else {
        const shrink = Math.max(0, 1 - p.age / p.life);
        this.dummy.position.copy(p.pos);
        this.dummy.rotation.copy(p.rot);
        this.dummy.scale.setScalar(p.scale * shrink);
      }
      this.dummy.updateMatrix();
      this.instanced.setMatrixAt(i, this.dummy.matrix);
      this.instanced.setColorAt(i, p.color);
    }
    this.instanced.instanceMatrix.needsUpdate = true;
    if (this.instanced.instanceColor) this.instanced.instanceColor.needsUpdate = true;
  }
}
