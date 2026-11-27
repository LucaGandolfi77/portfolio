import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { BiomeDef } from '../data/types';
import type { ActiveHazardZone } from '../entities/ProjectileManager';
import type { BrickBlueprints } from '../renderer/BrickBlueprints';
import type { BrickEngine, BrickInstanceSpec } from '../renderer/BrickEngine';

export interface StealthGrassPatch {
  pos: THREE.Vector3;
  radius: number;
  mesh: THREE.Group;
}

export interface StageChest {
  pos: THREE.Vector3;
  mesh: THREE.Group;
  opened: boolean;
}

/**
 * Generates an entire biome diorama stage using batched InstancedMesh bricks:
 * stepped ground plates, perimeter brick cliffs, 15 FPS animated water tiles,
 * tall rustling stealth grass patches, destructible Pip chests, and elemental hazards.
 */
export class ExpeditionStage {
  readonly group = new THREE.Group();
  readonly arenaRadius = 17.5;
  readonly hazards: ActiveHazardZone[] = [];
  readonly grassPatches: StealthGrassPatch[] = [];
  readonly chests: StageChest[] = [];
  private readonly waterTiles: THREE.Mesh[] = [];
  private stopMotionTimer = 0;
  private waveStep = 0;

  constructor(biome: BiomeDef, engine: BrickEngine, blueprints: BrickBlueprints) {
    const specs: BrickInstanceSpec[] = [];

    // Stepped toy-block arena floor with subtle micro-elevation & biome details
    for (let x = -18; x <= 18; x += 2) {
      for (let z = -18; z <= 18; z += 2) {
        const dist = Math.hypot(x, z);
        if (dist > 20.5) continue;
        const checker = (Math.abs(x + z) / 2) % 2 === 0;
        const hash = Math.abs(Math.sin(x * 19.1 + z * 41.7) * 9123.4) % 1;
        const edgeLift = dist > 15.5 ? 0.35 : 0;
        const color = checker ? biome.groundColor : biome.accentGroundColor;
        specs.push({ x, y: -0.5 + edgeLift / 2, z, sx: 2, sy: 1 + edgeLift, sz: 2, color });
        if (hash > 0.92 && dist > 6 && dist < 14.5) {
          specs.push({ x, y: 0.16, z, sx: 0.55, sy: 0.32, sz: 0.55, color: biome.foliageColor });
        }
      }
    }

    // Perimeter stepped brick cliffs & biome trees
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2;
      const rx = Math.cos(ang) * 19.2;
      const rz = Math.sin(ang) * 19.2;
      const h = 1.6 + (i % 3) * 1.05;
      specs.push({ x: rx, y: h / 2, z: rz, sx: 2.6, sy: h, sz: 2.6, color: biome.rockColor });
      if (i % 2 === 0) {
        specs.push({ x: rx * 0.94, y: h + 0.7, z: rz * 0.94, sx: 1.9, sy: 1.1, sz: 1.9, color: biome.foliageColor });
      }
    }

    this.group.add(engine.createInstancedBatch(specs, { includeStuds: true }));

    // Decorative 15 FPS stop-motion translucent water tiles on the edge
    const waterMat = engine.getMaterial(biome.waterColor, { transparent: true, opacity: 0.78 });
    for (let i = -3; i <= 3; i++) {
      const tile = new THREE.Mesh(engine.getBoxGeo(), waterMat);
      tile.scale.set(1.8, 0.24, 1.8);
      tile.position.set(i * 2, 0.06, 16.2);
      this.group.add(tile);
      this.waterTiles.push(tile);
    }

    // Tall rustling stealth grass patches (break enemy line-of-sight!)
    const grassCoords: [number, number][] = [
      [-9, -1],
      [9, 1],
      [0, 9.5],
      [0, -10.5],
    ];
    for (const [gx, gz] of grassCoords) {
      const patch = new THREE.Group();
      patch.position.set(gx, 0, gz);
      const bladeSpecs: BrickInstanceSpec[] = [];
      for (let b = 0; b < 9; b++) {
        const bx = ((b % 3) - 1) * 0.85;
        const bz = (Math.floor(b / 3) - 1) * 0.85;
        bladeSpecs.push({
          x: bx,
          y: 0.65,
          z: bz,
          sx: 0.28,
          sy: 1.3,
          sz: 0.28,
          color: biome.foliageColor,
        });
      }
      patch.add(engine.createInstancedBatch(bladeSpecs, { includeStuds: false, castShadow: false }));
      this.group.add(patch);
      this.grassPatches.push({ pos: new THREE.Vector3(gx, 0, gz), radius: 2.1, mesh: patch });
    }

    // Elemental Hazards (campfires, shock crystals, cryo-vents, blast barrels)
    biome.hazards.forEach((h, idx) => {
      const mesh = blueprints.buildElementalHazard(h.type);
      mesh.position.set(h.x, 0, h.z);
      this.group.add(mesh);
      this.hazards.push({
        id: `haz-${idx}`,
        type: h.type,
        pos: new THREE.Vector3(h.x, 0.8, h.z),
        radius: 1.35,
        mesh,
        destroyed: false,
      });
    });

    // Destructible Pip Chests in corners
    for (const [cx, cz] of [[-12, -10], [12, 10]]) {
      const chest = engine.createBrick(1.3, 0.9, 0.95, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      chest.position.set(cx, 0.45, cz);
      this.group.add(chest);
      this.chests.push({ pos: new THREE.Vector3(cx, 0, cz), mesh: chest, opened: false });
    }
  }

  isInsideStealthGrass(pos: THREE.Vector3): boolean {
    for (const g of this.grassPatches) {
      if (Math.hypot(pos.x - g.pos.x, pos.z - g.pos.z) < g.radius) {
        return true;
      }
    }
    return false;
  }

  update(dt: number, heroPositions: THREE.Vector3[]): void {
    // 15 FPS stop-motion water ripple & campfire flicker
    this.stopMotionTimer += dt;
    if (this.stopMotionTimer >= 1 / 15) {
      this.stopMotionTimer = 0;
      this.waveStep++;
      for (let i = 0; i < this.waterTiles.length; i++) {
        this.waterTiles[i].position.y = 0.06 + Math.sin(this.waveStep * 0.55 + i * 0.9) * 0.08;
      }
      for (const h of this.hazards) {
        if (h.destroyed) continue;
        if (h.type === 'campfire') {
          h.mesh.scale.y = 0.92 + ((this.waveStep + h.pos.x) % 3) * 0.09;
        } else if (h.type === 'shock-crystal') {
          h.mesh.rotation.y += 0.14;
        }
      }
    }

    // Rustle tall grass when a hero walks through it
    for (const g of this.grassPatches) {
      const occupied = heroPositions.some((p) => Math.hypot(p.x - g.pos.x, p.z - g.pos.z) < g.radius);
      g.mesh.rotation.z = THREE.MathUtils.lerp(g.mesh.rotation.z, occupied ? 0.18 : 0, Math.min(1, dt * 10));
    }
  }
}
