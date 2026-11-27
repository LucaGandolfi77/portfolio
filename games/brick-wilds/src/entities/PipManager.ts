import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { BrickEngine } from '../renderer/BrickEngine';

interface PipEntity {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  value: number;
  color: THREE.Color;
  age: number;
}

export interface WorldPickup {
  kind: 'heart' | 'special-orb' | 'heavy-weapon';
  pos: THREE.Vector3;
  mesh: THREE.Group;
  age: number;
}

const MAX_PIPS = 220;

/**
 * Instanced bouncing toy-block Pips (Silver=10, Gold=100, Cobalt=500),
 * Health Berries, Special Recharge Crystals, and dropped Apex Rex Disc-Launchers.
 */
export class PipManager {
  private readonly scene: THREE.Scene;
  private readonly engine: BrickEngine;
  private readonly instancedPips: THREE.InstancedMesh;
  private readonly pips: PipEntity[] = [];
  private readonly dummy = new THREE.Object3D();
  readonly pickups: WorldPickup[] = [];

  constructor(scene: THREE.Scene, engine: BrickEngine) {
    this.scene = scene;
    this.engine = engine;

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.16,
      metalness: 0.35,
      clearcoat: 0.9,
    });
    this.instancedPips = new THREE.InstancedMesh(engine.getCylGeo(), mat, MAX_PIPS);
    this.instancedPips.frustumCulled = false;

    for (let i = 0; i < MAX_PIPS; i++) {
      this.pips.push({
        active: false,
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        value: 10,
        color: new THREE.Color(BRICK_PALETTE.pipSilver),
        age: 0,
      });
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.instancedPips.setMatrixAt(i, this.dummy.matrix);
      this.instancedPips.setColorAt(i, new THREE.Color(BRICK_PALETTE.pipSilver));
    }
    this.instancedPips.instanceMatrix.needsUpdate = true;
    scene.add(this.instancedPips);
  }

  clear(): void {
    for (const p of this.pips) p.active = false;
    for (const item of this.pickups) {
      this.scene.remove(item.mesh);
    }
    this.pickups.length = 0;
  }

  spawnPipShower(origin: THREE.Vector3, totalValue: number): void {
    let remaining = Math.max(10, totalValue);
    let spawned = 0;
    while (remaining > 0 && spawned < 18) {
      let val = 10;
      let hex: number = BRICK_PALETTE.pipSilver;
      if (remaining >= 200) {
        val = 100;
        hex = BRICK_PALETTE.pipGold;
      }
      if (remaining >= 1000) {
        val = 500;
        hex = BRICK_PALETTE.pipCobalt;
      }
      remaining = Math.max(0, remaining - val);
      this.spawnSinglePip(origin, val, hex);
      spawned++;
    }
  }

  private spawnSinglePip(origin: THREE.Vector3, value: number, hex: number): void {
    for (const p of this.pips) {
      if (p.active) continue;
      p.active = true;
      p.pos.set(origin.x, Math.max(0.6, origin.y + 0.5), origin.z);
      const ang = Math.random() * Math.PI * 2;
      const spd = 2.5 + Math.random() * 4.5;
      p.vel.set(Math.cos(ang) * spd, 4.5 + Math.random() * 3.5, Math.sin(ang) * spd);
      p.value = value;
      p.color.setHex(hex);
      p.age = 0;
      return;
    }
  }

  spawnHeartBerry(origin: THREE.Vector3): void {
    const mesh = this.engine.createBrick(0.55, 0.55, 0.55, BRICK_PALETTE.brightRed, { studs: true, emissive: true });
    mesh.position.set(origin.x, 0.55, origin.z);
    this.scene.add(mesh);
    this.pickups.push({ kind: 'heart', pos: mesh.position.clone(), mesh, age: 0 });
  }

  spawnSpecialOrb(origin: THREE.Vector3): void {
    const mesh = this.engine.createBrick(0.68, 0.68, 0.68, BRICK_PALETTE.visorCyan, { studs: true, emissive: true });
    mesh.position.set(origin.x, 0.65, origin.z);
    this.scene.add(mesh);
    this.pickups.push({ kind: 'special-orb', pos: mesh.position.clone(), mesh, age: 0 });
  }

  spawnHeavyWeaponDrop(origin: THREE.Vector3): void {
    const mesh = new THREE.Group();
    const body = this.engine.createBrick(0.95, 0.55, 1.35, BRICK_PALETTE.sunsetOrange, { studs: true, emissive: true });
    const barrel = this.engine.createBrick(0.4, 0.4, 0.85, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
    barrel.position.set(0, 0.1, 0.75);
    mesh.add(body, barrel);
    mesh.position.set(origin.x, 0.65, origin.z);
    this.scene.add(mesh);
    this.pickups.push({ kind: 'heavy-weapon', pos: mesh.position.clone(), mesh, age: 0 });
  }

  update(
    dt: number,
    heroPositions: THREE.Vector3[],
    magnetRadius: number,
    onCollectPip: (value: number) => void,
    onCollectPickup: (heroIndex: number, pickup: WorldPickup) => void,
  ): void {
    for (let i = 0; i < MAX_PIPS; i++) {
      const p = this.pips[i];
      if (!p.active) {
        this.dummy.position.set(0, -100, 0);
        this.dummy.scale.setScalar(0);
        this.dummy.updateMatrix();
        this.instancedPips.setMatrixAt(i, this.dummy.matrix);
        continue;
      }

      p.age += dt;
      if (p.age > 24) {
        p.active = false;
        continue;
      }

      p.vel.y -= 17 * dt;
      p.pos.addScaledVector(p.vel, dt);
      if (p.pos.y < 0.22) {
        p.pos.y = 0.22;
        p.vel.y = Math.abs(p.vel.y) * 0.42;
        p.vel.x *= 0.82;
        p.vel.z *= 0.82;
      }

      let collected = false;
      for (const hp of heroPositions) {
        const dx = hp.x - p.pos.x;
        const dz = hp.z - p.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 1.05) {
          p.active = false;
          onCollectPip(p.value);
          collected = true;
          break;
        } else if (dist < magnetRadius && p.age > 0.25) {
          const pull = (1 - dist / magnetRadius) * 20 * dt;
          p.pos.x += (dx / dist) * pull;
          p.pos.z += (dz / dist) * pull;
        }
      }

      if (!collected && p.active) {
        this.dummy.position.copy(p.pos);
        this.dummy.rotation.set(0, p.age * 4.5, 0);
        this.dummy.scale.set(0.38, 0.2, 0.38);
      } else {
        this.dummy.position.set(0, -100, 0);
        this.dummy.scale.setScalar(0);
      }
      this.dummy.updateMatrix();
      this.instancedPips.setMatrixAt(i, this.dummy.matrix);
      this.instancedPips.setColorAt(i, p.color);
    }

    this.instancedPips.instanceMatrix.needsUpdate = true;
    if (this.instancedPips.instanceColor) this.instancedPips.instanceColor.needsUpdate = true;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const item = this.pickups[i];
      item.age += dt;
      item.mesh.rotation.y += dt * 2.2;
      item.mesh.position.y = 0.6 + Math.sin(item.age * 4) * 0.14;

      for (let hIdx = 0; hIdx < heroPositions.length; hIdx++) {
        const hp = heroPositions[hIdx];
        if (Math.hypot(hp.x - item.pos.x, hp.z - item.pos.z) < 1.35) {
          this.scene.remove(item.mesh);
          this.pickups.splice(i, 1);
          onCollectPickup(hIdx, item);
          break;
        }
      }
    }
  }
}
