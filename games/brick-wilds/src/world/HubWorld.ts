import * as THREE from 'three';
import type { SculptureVoxel } from '../data/advanced';
import { BRICK_PALETTE } from '../data/brickPalette';
import { HUB_PLOTS } from '../data/hubPlots';
import type { HouseAddonId, PlotDef, PlotState, PlotThemeId } from '../data/types';
import type { BrickBlueprints } from '../renderer/BrickBlueprints';
import type { BrickEngine, BrickInstanceSpec } from '../renderer/BrickEngine';

export interface HubDestructible {
  pos: THREE.Vector3;
  mesh: THREE.Group;
  smashed: boolean;
  respawnTimer: number;
}

interface VillagerNpc {
  mesh: THREE.Group;
  angle: number;
  radius: number;
  speed: number;
  hopPhase: number;
}

/**
 * Playable Hearth-Haven Sanctuary Hub with 10 customizable structures, house addons,
 * wandering brick Villagers, and a Brick-Lab Sculpture Display Pedestal!
 */
export class HubWorld {
  readonly group = new THREE.Group();
  readonly portalPos = new THREE.Vector3(0, 0, -15.5);
  readonly sculpturePedestalPos = new THREE.Vector3(0, 0, 8.2);
  readonly destructibles: HubDestructible[] = [];

  private readonly engine: BrickEngine;
  private readonly blueprints: BrickBlueprints;
  private readonly plotGroups = new Map<string, { group: THREE.Group; def: PlotDef; animScale: number }>();
  private readonly villagers: VillagerNpc[] = [];
  private sculptureGroup: THREE.Group | null = null;
  private readonly portalRing: THREE.Mesh;
  private time = 0;

  constructor(
    engine: BrickEngine,
    blueprints: BrickBlueprints,
    plotsState: Record<string, PlotState>,
    sculpture: SculptureVoxel[],
  ) {
    this.engine = engine;
    this.blueprints = blueprints;

    const specs: BrickInstanceSpec[] = [];
    for (let x = -18; x <= 18; x += 2) {
      for (let z = -18; z <= 18; z += 2) {
        const dist = Math.hypot(x, z);
        if (dist > 21.5) continue;
        const isPath = Math.abs(x) <= 2 || Math.abs(z) <= 2 || dist < 5.5;
        const color = isPath
          ? (x + z) % 4 === 0
            ? BRICK_PALETTE.warmSand
            : BRICK_PALETTE.lightGray
          : (x + z) % 4 === 0
            ? BRICK_PALETTE.limeGreen
            : BRICK_PALETTE.forestGreen;
        specs.push({ x, y: -0.5, z, sx: 2, sy: 1, sz: 2, color });
      }
    }

    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * Math.PI * 2;
      const rx = Math.cos(ang) * 19.2;
      const rz = Math.sin(ang) * 19.2;
      if (Math.abs(rx) < 3.5 && rz < -14) continue;
      specs.push({ x: rx, y: 0.9, z: rz, sx: 0.9, sy: 1.8, sz: 0.9, color: BRICK_PALETTE.barkBrown });
      specs.push({ x: rx, y: 2.2, z: rz, sx: 2.3, sy: 1.1, sz: 2.3, color: BRICK_PALETTE.forestGreen });
      specs.push({ x: rx, y: 3.1, z: rz, sx: 1.5, sy: 0.9, sz: 1.5, color: BRICK_PALETTE.limeGreen });
    }

    this.group.add(this.engine.createInstancedBatch(specs, { includeStuds: true }));

    const hearth = this.blueprints.buildElementalHazard('campfire');
    hearth.position.set(0, 0, 0);
    this.group.add(hearth);

    // Brick-Lab Sculpture Pedestal
    const pedestal = this.engine.createBrick(2.8, 0.45, 2.8, BRICK_PALETTE.pureWhite, { studs: true });
    pedestal.position.set(this.sculpturePedestalPos.x, 0.22, this.sculpturePedestalPos.z);
    this.group.add(pedestal);
    this.updateSculpture(sculpture);

    // Expedition Gate
    const gate = new THREE.Group();
    gate.position.copy(this.portalPos);
    const pillarL = this.engine.createBrick(1.1, 4.2, 1.1, BRICK_PALETTE.darkGray, { studs: true });
    pillarL.position.set(-2.3, 2.1, 0);
    const pillarR = this.engine.createBrick(1.1, 4.2, 1.1, BRICK_PALETTE.darkGray, { studs: true });
    pillarR.position.set(2.3, 2.1, 0);
    const lintel = this.engine.createBrick(6.0, 1.0, 1.3, BRICK_PALETTE.sunsetOrange, { studs: true });
    lintel.position.set(0, 4.5, 0);
    gate.add(pillarL, pillarR, lintel);

    const ringGeo = new THREE.TorusGeometry(1.75, 0.2, 10, 28);
    const ringMat = new THREE.MeshBasicMaterial({ color: BRICK_PALETTE.visorCyan });
    this.portalRing = new THREE.Mesh(ringGeo, ringMat);
    this.portalRing.position.set(0, 2.15, 0);
    gate.add(this.portalRing);
    this.group.add(gate);

    // 10 Customizable Plots
    for (const def of HUB_PLOTS) {
      const st = plotsState[def.id] ?? { built: false, theme: def.defaultTheme, addon: 'none' };
      const b = this.blueprints.buildPlotBuilding(def.id, st.theme, st.built, st.addon);
      b.position.set(def.position[0], def.position[1], def.position[2]);
      this.group.add(b);
      this.plotGroups.set(def.id, { group: b, def, animScale: 1 });
    }

    // 5 Wandering Mini-Villagers
    const villagerColors = [
      BRICK_PALETTE.brightRed,
      BRICK_PALETTE.skyBlue,
      BRICK_PALETTE.limeGreen,
      BRICK_PALETTE.royalPurple,
      BRICK_PALETTE.brightYellow,
    ];
    for (let i = 0; i < 5; i++) {
      const npc = new THREE.Group();
      const body = this.engine.createBrick(0.55, 0.65, 0.4, villagerColors[i], { studs: false });
      body.position.y = 0.55;
      const head = this.engine.createBrick(0.42, 0.42, 0.42, BRICK_PALETTE.skinWarm, { studs: true, shape: 'cylinder' });
      head.position.y = 1.1;
      npc.add(body, head);
      this.group.add(npc);
      this.villagers.push({
        mesh: npc,
        angle: (i / 5) * Math.PI * 2,
        radius: 4.0 + (i % 3) * 1.4,
        speed: 0.35 + (i % 2) * 0.16,
        hopPhase: i * 1.3,
      });
    }

    const propCoords: [number, number][] = [
      [-5, 4],
      [5, 4],
      [-5, -4],
      [5, -4],
      [-5, 11],
      [5, 11],
    ];
    for (const [px, pz] of propCoords) {
      const mesh = this.engine.createBrick(0.95, 0.95, 0.95, BRICK_PALETTE.brightYellow, { studs: true });
      mesh.position.set(px, 0.48, pz);
      this.group.add(mesh);
      this.destructibles.push({
        pos: new THREE.Vector3(px, 0, pz),
        mesh,
        smashed: false,
        respawnTimer: 0,
      });
    }
  }

  updateSculpture(voxels: SculptureVoxel[]): void {
    if (this.sculptureGroup) {
      this.group.remove(this.sculptureGroup);
      this.sculptureGroup = null;
    }
    if (voxels.length === 0) return;
    const specs: BrickInstanceSpec[] = voxels.map((v) => ({
      x: this.sculpturePedestalPos.x + v.x * 0.52,
      y: 0.72 + v.y * 0.52,
      z: this.sculpturePedestalPos.z + v.z * 0.52,
      sx: 0.5,
      sy: 0.5,
      sz: 0.5,
      color: v.color,
    }));
    this.sculptureGroup = this.engine.createInstancedBatch(specs, { includeStuds: true });
    this.group.add(this.sculptureGroup);
  }

  rebuildPlot(plotId: string, theme: PlotThemeId, built: boolean, addon: HouseAddonId = 'none'): void {
    const entry = this.plotGroups.get(plotId);
    if (!entry) return;
    this.group.remove(entry.group);
    const next = this.blueprints.buildPlotBuilding(plotId, theme, built, addon);
    next.position.set(entry.def.position[0], entry.def.position[1], entry.def.position[2]);
    next.scale.setScalar(0.15);
    this.group.add(next);
    entry.group = next;
    entry.animScale = 0.15;
  }

  findNearestPlot(pos: THREE.Vector3, maxDist = 4.6): PlotDef | null {
    let best: PlotDef | null = null;
    let bestD = maxDist;
    for (const { def } of this.plotGroups.values()) {
      const d = Math.hypot(pos.x - def.position[0], pos.z - def.position[2]);
      if (d < bestD) {
        bestD = d;
        best = def;
      }
    }
    return best;
  }

  isNearPortal(pos: THREE.Vector3): boolean {
    return Math.hypot(pos.x - this.portalPos.x, pos.z - this.portalPos.z) < 3.6;
  }

  isNearPedestal(pos: THREE.Vector3): boolean {
    return Math.hypot(pos.x - this.sculpturePedestalPos.x, pos.z - this.sculpturePedestalPos.z) < 3.0;
  }

  update(dt: number): void {
    this.time += dt;
    this.portalRing.rotation.z = this.time * 1.4;

    for (const v of this.villagers) {
      v.angle += v.speed * dt;
      v.hopPhase += dt * 7;
      const vx = Math.cos(v.angle) * v.radius;
      const vz = Math.sin(v.angle) * v.radius;
      v.mesh.position.set(vx, Math.abs(Math.sin(v.hopPhase)) * 0.22, vz);
      v.mesh.rotation.y = -v.angle;
    }

    for (const entry of this.plotGroups.values()) {
      if (entry.animScale < 1) {
        entry.animScale = Math.min(1, entry.animScale + dt * 3.8);
        const overshoot = entry.animScale < 0.85 ? entry.animScale * 1.15 : 1 + (1 - entry.animScale) * 0.4;
        entry.group.scale.setScalar(Math.min(1.12, overshoot));
        if (entry.animScale >= 1) entry.group.scale.setScalar(1);
      }
    }

    for (const d of this.destructibles) {
      if (d.smashed) {
        d.respawnTimer -= dt;
        if (d.respawnTimer <= 0) {
          d.smashed = false;
          d.mesh.visible = true;
        }
      }
    }
  }
}
