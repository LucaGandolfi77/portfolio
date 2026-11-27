import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { CaveDef } from '../data/openWorldContent';
import type { BrickEngine, BrickInstanceSpec } from '../renderer/BrickEngine';

export interface CaveChest {
  pos: THREE.Vector3;
  mesh: THREE.Group;
  opened: boolean;
}

/**
 * Underground Brick Cavern Interior:
 * Glowing crystal stalagmites, dark stone brick floor, treasure chests, and Exit Portal!
 */
export class CaveStage {
  readonly group = new THREE.Group();
  readonly arenaRadius = 15.5;
  readonly exitPortalPos = new THREE.Vector3(0, 0, 12.5);
  readonly chests: CaveChest[] = [];
  readonly def: CaveDef;
  private readonly exitRing: THREE.Mesh;
  private time = 0;

  constructor(def: CaveDef, engine: BrickEngine) {
    this.def = def;
    const specs: BrickInstanceSpec[] = [];

    for (let x = -16; x <= 16; x += 2) {
      for (let z = -16; z <= 16; z += 2) {
        if (Math.hypot(x, z) > 17.5) continue;
        const alt = (Math.abs(x + z) / 2) % 2 === 0;
        specs.push({ x, y: -0.5, z, sx: 2, sy: 1, sz: 2, color: alt ? def.floorColor : BRICK_PALETTE.obsidian });
      }
    }

    // Cavern rock walls + glowing crystals
    for (let i = 0; i < 24; i++) {
      const ang = (i / 24) * Math.PI * 2;
      const rx = Math.cos(ang) * 16.5;
      const rz = Math.sin(ang) * 16.5;
      const h = 3.2 + (i % 3) * 1.4;
      specs.push({ x: rx, y: h / 2, z: rz, sx: 2.8, sy: h, sz: 2.8, color: BRICK_PALETTE.charcoal });
      if (i % 3 === 0) {
        specs.push({ x: rx * 0.85, y: 1.4, z: rz * 0.85, sx: 0.9, sy: 2.8, sz: 0.9, color: def.crystalColor });
      }
    }
    this.group.add(engine.createInstancedBatch(specs, { includeStuds: true }));

    // Exit portal back to Open-World surface
    this.exitRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.2, 10, 24),
      new THREE.MeshBasicMaterial({ color: BRICK_PALETTE.limeGreen }),
    );
    this.exitRing.position.set(this.exitPortalPos.x, 1.8, this.exitPortalPos.z);
    this.group.add(this.exitRing);

    // 2 Cave Treasure Chests
    for (const [cx, cz] of [[-9, -8], [9, -8]]) {
      const mesh = engine.createBrick(1.3, 0.9, 0.95, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      mesh.position.set(cx, 0.45, cz);
      this.group.add(mesh);
      this.chests.push({ pos: new THREE.Vector3(cx, 0, cz), mesh, opened: false });
    }
  }

  isNearExit(pos: THREE.Vector3): boolean {
    return Math.hypot(pos.x - this.exitPortalPos.x, pos.z - this.exitPortalPos.z) < 3.4;
  }

  update(dt: number): void {
    this.time += dt;
    this.exitRing.rotation.z = this.time * 1.6;
  }
}
