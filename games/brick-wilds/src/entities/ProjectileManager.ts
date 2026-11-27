import * as THREE from 'three';
import { BRICK_PALETTE, ELEMENT_COLORS } from '../data/brickPalette';
import type { ElementType } from '../data/types';
import type { BrickEngine } from '../renderer/BrickEngine';

export interface ActiveHazardZone {
  id: string;
  type: 'campfire' | 'shock-crystal' | 'cryo-vent' | 'blast-barrel';
  pos: THREE.Vector3;
  radius: number;
  mesh: THREE.Group;
  destroyed: boolean;
}

export interface Projectile {
  id: number;
  owner: 'player' | 'enemy';
  playerIndex: number;
  kind: 'arrow' | 'spear' | 'bomb' | 'disc' | 'turret-pip' | 'enemy-bolt';
  element: ElementType;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  damage: number;
  radius: number;
  age: number;
  maxAge: number;
  pierce: boolean;
  returning: boolean;
  mesh: THREE.Group;
}

/**
 * Pure helper tested by Vitest: determines if a projectile passing near
 * an environmental hazard infuses into Fire, Shock, or Frost in mid-air.
 */
export function resolveMidAirInfusion(
  currentElement: ElementType,
  hazardType: ActiveHazardZone['type'],
): ElementType {
  if (currentElement !== 'none') return currentElement;
  if (hazardType === 'campfire') return 'fire';
  if (hazardType === 'shock-crystal') return 'shock';
  if (hazardType === 'cryo-vent') return 'frost';
  return 'none';
}

export class ProjectileManager {
  private readonly scene: THREE.Scene;
  private readonly engine: BrickEngine;
  readonly projectiles: Projectile[] = [];
  private nextId = 1;

  constructor(scene: THREE.Scene, engine: BrickEngine) {
    this.scene = scene;
    this.engine = engine;
  }

  clear(): void {
    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
    }
    this.projectiles.length = 0;
  }

  spawn(params: {
    owner: 'player' | 'enemy';
    playerIndex?: number;
    kind: Projectile['kind'];
    element?: ElementType;
    origin: THREE.Vector3;
    dir: THREE.Vector3;
    speed: number;
    damage: number;
    maxAge?: number;
    pierce?: boolean;
  }): Projectile {
    const element = params.element ?? 'none';
    const mesh = this.buildMesh(params.kind, element, params.owner);
    mesh.position.copy(params.origin);
    mesh.rotation.y = Math.atan2(params.dir.x, params.dir.z);
    this.scene.add(mesh);

    const vel = params.dir.clone().normalize().multiplyScalar(params.speed);
    if (params.kind === 'bomb') {
      vel.y = 7.2;
    }

    const proj: Projectile = {
      id: this.nextId++,
      owner: params.owner,
      playerIndex: params.playerIndex ?? 0,
      kind: params.kind,
      element,
      pos: params.origin.clone(),
      vel,
      damage: params.damage,
      radius: params.kind === 'disc' || params.kind === 'bomb' ? 0.65 : 0.4,
      age: 0,
      maxAge: params.maxAge ?? (params.kind === 'spear' ? 0.72 : 1.3),
      pierce: params.pierce ?? params.kind === 'spear',
      returning: false,
      mesh,
    };
    this.projectiles.push(proj);
    return proj;
  }

  private buildMesh(kind: Projectile['kind'], element: ElementType, owner: 'player' | 'enemy'): THREE.Group {
    const color =
      element !== 'none'
        ? ELEMENT_COLORS[element]
        : owner === 'enemy'
          ? BRICK_PALETTE.brightRed
          : kind === 'disc'
            ? BRICK_PALETTE.sunsetOrange
            : kind === 'bomb'
              ? BRICK_PALETTE.royalPurple
              : BRICK_PALETTE.visorCyan;

    if (kind === 'arrow' || kind === 'spear') {
      return this.engine.createBrick(0.18, 0.18, kind === 'spear' ? 1.25 : 0.85, color, {
        studs: false,
        emissive: true,
      });
    }
    if (kind === 'disc') {
      return this.engine.createBrick(0.75, 0.24, 0.75, color, {
        studs: false,
        emissive: true,
        shape: 'cylinder',
      });
    }
    return this.engine.createBrick(0.42, 0.42, 0.42, color, { studs: true, emissive: true });
  }

  private recolorMesh(proj: Projectile, element: ElementType): void {
    const mat = this.engine.getMaterial(ELEMENT_COLORS[element], { emissive: true });
    proj.mesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = mat;
      }
    });
  }

  removeAt(index: number): void {
    const p = this.projectiles[index];
    if (!p) return;
    this.scene.remove(p.mesh);
    this.projectiles.splice(index, 1);
  }

  update(
    dt: number,
    hazards: ActiveHazardZone[],
    onInfused: (proj: Projectile) => void,
    onBombLand: (proj: Projectile) => void,
    onBarrelHit: (hazard: ActiveHazardZone, proj: Projectile) => void,
  ): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      if (p.age >= p.maxAge) {
        if (p.kind === 'bomb') onBombLand(p);
        this.removeAt(i);
        continue;
      }

      if (p.kind === 'bomb') {
        p.vel.y -= 18 * dt;
      }
      if (p.kind === 'spear' && !p.returning && p.age > p.maxAge * 0.5) {
        p.returning = true;
        p.vel.negate();
      }

      p.pos.addScaledVector(p.vel, dt);
      p.mesh.position.copy(p.pos);
      if (p.kind === 'disc' || p.kind === 'bomb') {
        p.mesh.rotation.y += dt * 12;
      }

      if (p.kind === 'bomb' && p.pos.y <= 0.35) {
        onBombLand(p);
        this.removeAt(i);
        continue;
      }

      // Check mid-air elemental infusion or Blast-Barrel detonation
      if (p.owner === 'player') {
        for (const h of hazards) {
          if (h.destroyed) continue;
          const d = Math.hypot(p.pos.x - h.pos.x, p.pos.z - h.pos.z);
          if (d < h.radius + p.radius) {
            if (h.type === 'blast-barrel') {
              onBarrelHit(h, p);
              this.removeAt(i);
              break;
            }
            const nextEl = resolveMidAirInfusion(p.element, h.type);
            if (nextEl !== p.element) {
              p.element = nextEl;
              p.damage = Math.round(p.damage * 1.45);
              this.recolorMesh(p, nextEl);
              onInfused(p);
            }
          }
        }
      }
    }
  }
}
