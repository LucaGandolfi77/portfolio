import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { BrickEngine, BrickInstanceSpec } from '../renderer/BrickEngine';

export interface GoldenBrickItem {
  pos: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
}

/**
 * Timed "Titan-Walker Hunt" Parkour & Treasure Mode:
 * Collect 6 Golden Bricks around a colossal brick-built Titan-Walker,
 * use jump-pads to scale its platforms, and hack its glowing Beacon Core!
 */
export class TitanHuntStage {
  readonly group = new THREE.Group();
  readonly arenaRadius = 17.5;
  readonly goldenBricks: GoldenBrickItem[] = [];
  readonly beaconPos = new THREE.Vector3(0, 0, -2);
  readonly jumpPads: THREE.Vector3[] = [
    new THREE.Vector3(-6, 0, 4),
    new THREE.Vector3(6, 0, 4),
    new THREE.Vector3(0, 0, -9),
  ];
  private readonly titanHead: THREE.Group;
  private time = 0;

  constructor(engine: BrickEngine) {
    const specs: BrickInstanceSpec[] = [];
    for (let x = -18; x <= 18; x += 2) {
      for (let z = -18; z <= 18; z += 2) {
        if (Math.hypot(x, z) > 20) continue;
        const c = (x + z) % 4 === 0 ? BRICK_PALETTE.warmSand : BRICK_PALETTE.limeGreen;
        specs.push({ x, y: -0.5, z, sx: 2, sy: 1, sz: 2, color: c });
      }
    }
    this.group.add(engine.createInstancedBatch(specs, { includeStuds: true }));

    // Colossal Titan-Walker (Long-Neck Dish Synth-Giant) in center!
    const titan = new THREE.Group();
    titan.position.copy(this.beaconPos);
    for (const [lx, lz] of [[-2.2, 1.8], [2.2, 1.8], [-2.2, -1.8], [2.2, -1.8]]) {
      const leg = engine.createBrick(1.0, 4.5, 1.0, BRICK_PALETTE.charcoal, { studs: true });
      leg.position.set(lx, 2.25, lz);
      titan.add(leg);
    }
    const body = engine.createBrick(5.2, 1.4, 4.4, BRICK_PALETTE.pureWhite, { studs: true });
    body.position.set(0, 4.8, 0);
    const neck = engine.createBrick(1.2, 4.2, 1.2, BRICK_PALETTE.sunsetOrange, { studs: true });
    neck.position.set(0, 7.2, 1.4);
    titan.add(body, neck);

    this.titanHead = new THREE.Group();
    this.titanHead.position.set(0, 9.6, 1.4);
    const dish = engine.createBrick(4.6, 0.55, 3.2, BRICK_PALETTE.pureWhite, { studs: true });
    const beacon = engine.createBrick(1.4, 0.9, 1.4, BRICK_PALETTE.visorCyan, { studs: true, emissive: true });
    beacon.position.y = 0.7;
    this.titanHead.add(dish, beacon);
    titan.add(this.titanHead);
    this.group.add(titan);

    // Glowing Jump-Pads around Titan
    for (const jp of this.jumpPads) {
      const pad = engine.createBrick(1.8, 0.35, 1.8, BRICK_PALETTE.limeGreen, { studs: true, emissive: true });
      pad.position.set(jp.x, 0.18, jp.z);
      this.group.add(pad);
    }

    // 6 Golden Bricks to collect before hacking the Titan
    const coords: [number, number][] = [
      [-11, -8],
      [11, -8],
      [-12, 6],
      [12, 6],
      [0, -13],
      [0, 11],
    ];
    for (const [gx, gz] of coords) {
      const mesh = engine.createBrick(1.0, 0.8, 1.0, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      mesh.position.set(gx, 0.8, gz);
      this.group.add(mesh);
      this.goldenBricks.push({ pos: new THREE.Vector3(gx, 0.8, gz), mesh, collected: false });
    }
  }

  get collectedCount(): number {
    return this.goldenBricks.filter((b) => b.collected).length;
  }

  get allCollected(): boolean {
    return this.goldenBricks.every((b) => b.collected);
  }

  update(dt: number): void {
    this.time += dt;
    this.titanHead.rotation.y = Math.sin(this.time * 0.9) * 0.45;
    for (const b of this.goldenBricks) {
      if (b.collected) continue;
      b.mesh.rotation.y += dt * 2.6;
      b.mesh.position.y = 0.85 + Math.sin(this.time * 4 + b.pos.x) * 0.2;
    }
  }
}
