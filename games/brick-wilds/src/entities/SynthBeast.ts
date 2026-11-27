import * as THREE from 'three';
import { ELEMENTAL_COMBOS, resolveElementalCombo, type ElementalComboId } from '../data/advanced';
import { BEASTS } from '../data/beasts';
import { BRICK_PALETTE } from '../data/brickPalette';
import type { BeastDef, BeastId, ElementType, WeakPointDef } from '../data/types';
import type { BeastRig, BrickBlueprints } from '../renderer/BrickBlueprints';

export interface WeakPointState {
  def: WeakPointDef;
  hp: number;
  broken: boolean;
}

export interface DamageResult {
  hitWeakPoint: WeakPointDef | null;
  weakPointBroken: WeakPointDef | null;
  elementalReaction: boolean;
  superEffective: boolean;
  comboTriggered: ElementalComboId | null;
  damageApplied: number;
  killed: boolean;
}

/**
 * Pure weak-point & elemental effectiveness calculation helper (tested in Vitest).
 * - Matching enemy's weakElement deals 1.85x Super Effective damage on body hits.
 * - Hitting a Weak Point deals 2.2x damage, or 3.2x if the element matches!
 */
export function computeWeakPointHit(
  baseDamage: number,
  element: ElementType,
  wp: WeakPointDef | null,
  beastWeakElement: ElementType = 'none',
): { damage: number; elementalReaction: boolean; superEffective: boolean } {
  const matchesBeast = element !== 'none' && element === beastWeakElement;
  if (!wp) {
    return {
      damage: Math.round(baseDamage * (matchesBeast ? 1.85 : 1.0)),
      elementalReaction: matchesBeast,
      superEffective: matchesBeast,
    };
  }
  const matchesWp = element !== 'none' && (element === wp.weakTo || matchesBeast);
  const mult = matchesWp ? 3.2 : 2.2;
  return { damage: Math.round(baseDamage * mult), elementalReaction: matchesWp, superEffective: matchesWp };
}

export class SynthBeast {
  readonly def: BeastDef;
  readonly rig: BeastRig;
  readonly pos: THREE.Vector3;
  readonly weakPoints: WeakPointState[];
  hp: number;
  maxHp: number;
  dead = false;

  facing = 0;
  walkPhase = 0;
  attackTimer: number;
  telegraphTimer = 0;
  stunTimer = 0;
  blindTimer = 0;
  burnTimer = 0;
  frostTimer = 0;
  stealthed = false;
  visorTimer = 0;
  private hitFlash = 0;
  private hoverPhase = Math.random() * Math.PI * 2;

  constructor(beastId: BeastId, spawnPos: THREE.Vector3, blueprints: BrickBlueprints, scene: THREE.Scene) {
    this.def = BEASTS[beastId];
    this.rig = blueprints.buildSynthBeast(this.def);
    this.pos = spawnPos.clone();
    this.rig.root.position.copy(this.pos);
    this.hp = this.def.maxHp;
    this.maxHp = this.def.maxHp;
    this.attackTimer = 1.0 + Math.random() * 1.2;
    this.stealthed = Boolean(this.def.canStealth);

    this.weakPoints = this.def.weakPoints.map((wp) => ({
      def: wp,
      hp: wp.hp,
      broken: false,
    }));

    scene.add(this.rig.root);
  }

  getWeakPointWorldPos(wpId: string, out = new THREE.Vector3()): THREE.Vector3 {
    const mesh = this.rig.weakPointMeshes.get(wpId);
    if (mesh) {
      mesh.getWorldPosition(out);
      return out;
    }
    return out.copy(this.pos).setY(1.2);
  }

  applyVisorHighlight(duration = 5.5): void {
    this.visorTimer = Math.max(this.visorTimer, duration);
    if (this.stealthed) {
      this.stealthed = false;
    }
  }

  takeDamage(
    baseDamage: number,
    element: ElementType,
    hitPos?: THREE.Vector3,
    forceWeakPoint = false,
  ): DamageResult {
    if (this.dead) {
      return {
        hitWeakPoint: null,
        weakPointBroken: null,
        elementalReaction: false,
        superEffective: false,
        comboTriggered: null,
        damageApplied: 0,
        killed: false,
      };
    }

    const comboTriggered = resolveElementalCombo(
      { burning: this.burnTimer > 0, frosted: this.frostTimer > 0, stunned: this.stunTimer > 0 },
      element,
    );

    let matchedWp: WeakPointState | null = null;
    const wpWorld = new THREE.Vector3();
    for (const wp of this.weakPoints) {
      if (wp.broken) continue;
      if (forceWeakPoint || this.visorTimer > 0) {
        matchedWp = wp;
        break;
      }
      if (hitPos) {
        this.getWeakPointWorldPos(wp.def.id, wpWorld);
        if (wpWorld.distanceTo(hitPos) < Math.max(wp.def.size[0], wp.def.size[2]) + 0.95) {
          matchedWp = wp;
          break;
        }
      }
    }

    const { damage: rawDmg, elementalReaction, superEffective } = computeWeakPointHit(
      baseDamage,
      element,
      matchedWp?.def ?? null,
      this.def.weakElement,
    );
    const comboBonus = comboTriggered ? ELEMENTAL_COMBOS[comboTriggered].bonusDamage : 0;
    const damage = rawDmg + comboBonus;
    this.hp = Math.max(0, this.hp - damage);
    this.hitFlash = 0.16;

    if (comboTriggered) {
      // Consume old statuses after combo detonation
      this.burnTimer = 0;
      this.frostTimer = 0;
      if (comboTriggered === 'overload') this.stunTimer = Math.max(this.stunTimer, 2.2);
    } else {
      if (element === 'fire') this.burnTimer = Math.max(this.burnTimer, superEffective ? 4.5 : 3.0);
      if (element === 'shock') {
        this.stunTimer = Math.max(this.stunTimer, superEffective ? 2.4 : 0.85);
        this.stealthed = false;
      }
      if (element === 'frost') this.frostTimer = Math.max(this.frostTimer, superEffective ? 5.0 : 3.5);
    }

    let brokenDef: WeakPointDef | null = null;
    if (matchedWp) {
      matchedWp.hp -= damage;
      if (matchedWp.hp <= 0) {
        matchedWp.broken = true;
        brokenDef = matchedWp.def;
        const mesh = this.rig.weakPointMeshes.get(matchedWp.def.id);
        if (mesh) mesh.visible = false;

        if (brokenDef.onBreak === 'blind') this.blindTimer = 5.0;
        if (brokenDef.onBreak === 'stun') this.stunTimer = Math.max(this.stunTimer, 3.0);
        if (brokenDef.onBreak === 'reveal-stealth') this.stealthed = false;
        if (brokenDef.onBreak === 'fire-boom') {
          this.hp = Math.max(0, this.hp - 60);
          this.burnTimer = 4.5;
        }
        if (brokenDef.onBreak === 'frost-nova') {
          this.hp = Math.max(0, this.hp - 50);
          this.frostTimer = 5.0;
          this.stunTimer = Math.max(this.stunTimer, 2.2);
        }
      }
    }

    if (this.hp <= 0) {
      this.dead = true;
    }

    return {
      hitWeakPoint: matchedWp?.def ?? null,
      weakPointBroken: brokenDef,
      elementalReaction,
      superEffective,
      comboTriggered,
      damageApplied: damage,
      killed: this.dead,
    };
  }

  update(
    dt: number,
    targetPos: THREE.Vector3 | null,
    arenaRadius: number,
    onAttack: (beast: SynthBeast, target: THREE.Vector3) => void,
  ): void {
    if (this.dead) return;

    this.hoverPhase += dt * 4.5;
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.visorTimer > 0) this.visorTimer = Math.max(0, this.visorTimer - dt);
    if (this.blindTimer > 0) this.blindTimer = Math.max(0, this.blindTimer - dt);
    if (this.frostTimer > 0) this.frostTimer = Math.max(0, this.frostTimer - dt);
    if (this.burnTimer > 0) {
      this.burnTimer = Math.max(0, this.burnTimer - dt);
      this.hp = Math.max(1, this.hp - 9 * dt);
    }

    for (const wp of this.weakPoints) {
      const hl = this.rig.visorHighlights.get(wp.def.id);
      if (!hl) continue;
      const mat = hl.material as THREE.MeshBasicMaterial;
      mat.opacity = !wp.broken && this.visorTimer > 0 ? 0.65 + Math.sin(performance.now() * 0.01) * 0.3 : 0;
    }

    const stealthScale = this.stealthed ? 0.85 : 1.0;
    const baseYScale = this.def.id === 'apex-rex' ? 1.19 : 1;
    this.rig.bodyGroup.scale.y = baseYScale * (this.hitFlash > 0 ? 1.08 : stealthScale);

    if (this.def.flying) {
      this.rig.bodyGroup.position.y = this.stunTimer > 0 ? 0.1 : 0.75 + Math.sin(this.hoverPhase) * 0.25;
    }

    if (this.stunTimer > 0) {
      this.stunTimer = Math.max(0, this.stunTimer - dt);
      this.rig.bodyGroup.position.x = (Math.random() - 0.5) * 0.14;
      (this.rig.telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0;
      return;
    }
    this.rig.bodyGroup.position.x = 0;

    const speedMult = this.frostTimer > 0 ? 0.42 : 1.0;

    if (targetPos && this.blindTimer <= 0) {
      const dx = targetPos.x - this.pos.x;
      const dz = targetPos.z - this.pos.z;
      const dist = Math.hypot(dx, dz);
      this.facing = Math.atan2(dx, dz);

      if (this.telegraphTimer > 0) {
        this.telegraphTimer -= dt;
        const tMat = this.rig.telegraphRing.material as THREE.MeshBasicMaterial;
        tMat.opacity = 0.35 + Math.sin(this.telegraphTimer * 22) * 0.3;
        tMat.color.setHex(this.def.isBoss ? BRICK_PALETTE.fireGlow : BRICK_PALETTE.brightRed);
        if (this.telegraphTimer <= 0) {
          tMat.opacity = 0;
          this.attackTimer = this.def.attackCooldown;
          onAttack(this, targetPos);
        }
      } else {
        if (dist > this.def.attackRange * 0.82) {
          const step = this.def.speed * speedMult * dt;
          this.pos.x += (dx / Math.max(0.01, dist)) * step;
          this.pos.z += (dz / Math.max(0.01, dist)) * step;
          this.walkPhase += dt * 9 * speedMult;
        } else {
          this.attackTimer -= dt * speedMult;
          if (this.attackTimer <= 0) {
            this.telegraphTimer = this.def.isBoss ? 0.72 : 0.48;
          }
        }
      }
    } else {
      this.facing += Math.sin(performance.now() * 0.001) * dt * 1.1;
      this.pos.x += Math.sin(this.facing) * this.def.speed * 0.35 * dt;
      this.pos.z += Math.cos(this.facing) * this.def.speed * 0.35 * dt;
      this.walkPhase += dt * 4;
      (this.rig.telegraphRing.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > arenaRadius) {
      this.pos.x = (this.pos.x / r) * arenaRadius;
      this.pos.z = (this.pos.z / r) * arenaRadius;
    }

    this.rig.root.position.copy(this.pos);
    this.rig.bodyGroup.rotation.y = this.facing;
    for (let i = 0; i < this.rig.legs.length; i++) {
      if (this.def.flying) {
        this.rig.legs[i].rotation.z = (i % 2 === 0 ? 1 : -1) * (0.2 + Math.sin(this.hoverPhase * 2.2) * 0.35);
      } else {
        this.rig.legs[i].rotation.x = Math.sin(this.walkPhase + i * Math.PI) * 0.55;
      }
    }
  }

  dispose(scene: THREE.Scene): void {
    scene.remove(this.rig.root);
  }
}
