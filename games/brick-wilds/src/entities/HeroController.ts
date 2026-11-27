import * as THREE from 'three';
import { HEROES, WEAPON_MODES, WEAPON_MODE_LIST } from '../data/heroes';
import type { ElementType, HeroDef, HeroId, OutfitId, WeaponModeId } from '../data/types';
import type { PlayerInputState } from '../input/InputManager';
import type { BrickBlueprints, HeroRig } from '../renderer/BrickBlueprints';

export class HeroController {
  readonly playerIndex: 0 | 1;
  heroId: HeroId;
  def: HeroDef;
  rig: HeroRig;
  readonly pos: THREE.Vector3;
  velY = 0;
  facing = 0;
  walkPhase = 0;
  attackCooldown = 0;
  invulnTimer = 0;
  inStealthGrass = false;
  isSwimming = false;
  groundY = 0;
  swimSplashTimer = 0;

  // Dodge Dash with i-frames
  dashTimer = 0;
  dashCooldown = 0;
  readonly dashDir = new THREE.Vector3(0, 0, 1);
  readonly dashDuration = 0.2;
  readonly dashCooldownMax = 0.78;
  readonly dashSpeed = 23;

  // Signature Special Skill (E) cooldown
  specialCooldown = 0;

  // Elemental Weapon Mode (Standard / Fire / Frost / Shock)
  weaponMode: WeaponModeId = 'standard';

  // Beast Riding (Hacking / Override) & Perfect Dodge buff
  mountTimer = 0;
  mountName: string | null = null;
  perfectDodgeBuff = false;

  hearts: number;
  maxHearts: number;
  downed = false;
  heavyWeaponAmmo = 0;

  private readonly scene: THREE.Scene;
  private readonly blueprints: BrickBlueprints;

  constructor(
    playerIndex: 0 | 1,
    heroId: HeroId,
    outfit: OutfitId,
    maxHearts: number,
    bigHead: boolean,
    spawnPos: THREE.Vector3,
    blueprints: BrickBlueprints,
    scene: THREE.Scene,
  ) {
    this.playerIndex = playerIndex;
    this.heroId = heroId;
    this.def = HEROES[heroId];
    this.maxHearts = maxHearts;
    this.hearts = maxHearts;
    this.pos = spawnPos.clone();
    this.scene = scene;
    this.blueprints = blueprints;

    this.rig = blueprints.buildHero(this.def, outfit, playerIndex, bigHead);
    this.rig.root.position.copy(this.pos);
    scene.add(this.rig.root);
  }

  get activeElement(): ElementType {
    return WEAPON_MODES[this.weaponMode].element;
  }

  get isDashing(): boolean {
    return this.dashTimer > 0;
  }

  setWeaponMode(mode: WeaponModeId): void {
    this.weaponMode = mode;
    const ringMat = this.rig.playerRing.material as THREE.MeshBasicMaterial;
    ringMat.color.setHex(WEAPON_MODES[mode].color);
  }

  cycleWeaponMode(): WeaponModeId {
    const idx = WEAPON_MODE_LIST.findIndex((w) => w.id === this.weaponMode);
    const next = WEAPON_MODE_LIST[(idx + 1) % WEAPON_MODE_LIST.length].id;
    this.setWeaponMode(next);
    return next;
  }

  rebuildVisual(heroId: HeroId, outfit: OutfitId, maxHearts: number, bigHead: boolean): void {
    this.scene.remove(this.rig.root);
    this.heroId = heroId;
    this.def = HEROES[heroId];
    this.maxHearts = maxHearts;
    this.hearts = Math.min(this.maxHearts, Math.max(1, this.hearts));
    this.rig = this.blueprints.buildHero(this.def, outfit, this.playerIndex, bigHead);
    this.rig.root.position.copy(this.pos);
    this.setWeaponMode(this.weaponMode);
    this.scene.add(this.rig.root);
  }

  rechargeSpecial(): void {
    this.specialCooldown = 0;
  }

  heal(amount: number): void {
    this.downed = false;
    this.hearts = Math.min(this.maxHearts, this.hearts + amount);
  }

  takeDamage(amount: number): boolean {
    // Invulnerable while dashing (i-frames) or during brief post-hit flicker
    if (this.dashTimer > 0 || this.invulnTimer > 0 || this.downed) return false;
    this.hearts = Math.max(0, this.hearts - amount);
    this.invulnTimer = 1.15;
    if (this.hearts <= 0) {
      this.downed = true;
    }
    return true;
  }

  update(
    dt: number,
    input: PlayerInputState,
    arenaRadius: number,
    inGrass: boolean,
    callbacks: {
      onAttack: (hero: HeroController, aimDir: THREE.Vector3) => void;
      onDash: (hero: HeroController, dashDir: THREE.Vector3) => void;
      onSpecial: (hero: HeroController, aimDir: THREE.Vector3) => void;
      onWeaponSwitch: (hero: HeroController, mode: WeaponModeId) => void;
      onVisor: (hero: HeroController) => void;
      onInteract: (hero: HeroController) => void;
      onQuickBuild: (hero: HeroController, buildId: NonNullable<PlayerInputState['quickBuild']>, aimDir: THREE.Vector3) => void;
    },
  ): void {
    this.inStealthGrass = inGrass && !this.downed && this.pos.y < 0.2;
    if (this.attackCooldown > 0) this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    if (this.specialCooldown > 0) this.specialCooldown = Math.max(0, this.specialCooldown - dt);
    if (this.mountTimer > 0) {
      this.mountTimer = Math.max(0, this.mountTimer - dt);
      if (this.mountTimer === 0) this.mountName = null;
    }

    if (this.downed) {
      this.rig.root.rotation.x = Math.PI / 2;
      this.rig.root.position.set(this.pos.x, 0.35, this.pos.z);
      return;
    }
    this.rig.root.rotation.x = 0;

    // Weapon Mode Switching (1-4 or Tab / R / Wheel / Button)
    if (input.weaponModeSelect && input.weaponModeSelect !== this.weaponMode) {
      this.setWeaponMode(input.weaponModeSelect);
      callbacks.onWeaponSwitch(this, this.weaponMode);
    } else if (input.cycleWeaponJustPressed) {
      const next = this.cycleWeaponMode();
      callbacks.onWeaponSwitch(this, next);
    }

    const moveMag = Math.hypot(input.moveX, input.moveZ);

    // Dodge Dash initiation (with i-frames)
    if (input.dashJustPressed && this.dashCooldown <= 0 && this.dashTimer <= 0) {
      if (moveMag > 0.08) {
        this.dashDir.set(input.moveX / moveMag, 0, input.moveZ / moveMag);
      } else {
        this.dashDir.set(Math.sin(this.facing), 0, Math.cos(this.facing));
      }
      this.facing = Math.atan2(this.dashDir.x, this.dashDir.z);
      this.dashTimer = this.dashDuration;
      this.dashCooldown = this.dashCooldownMax;
      callbacks.onDash(this, this.dashDir);
    }

    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - dt);
      this.pos.x += this.dashDir.x * this.dashSpeed * dt;
      this.pos.z += this.dashDir.z * this.dashSpeed * dt;
    } else if (moveMag > 0.05) {
      const spd = this.mountTimer > 0 ? this.def.speed * 1.55 : this.def.speed;
      this.pos.x += input.moveX * spd * dt;
      this.pos.z += input.moveZ * spd * dt;
      this.walkPhase += dt * 12;
      if (!input.hasExplicitAim) {
        this.facing = Math.atan2(input.moveX, input.moveZ);
      }
    }

    if (input.hasExplicitAim && this.dashTimer <= 0) {
      this.facing = Math.atan2(input.aimX, input.aimZ);
    }

    // Jump & gravity (respects 3D terrain elevation groundY; floats when swimming!)
    if (this.isSwimming) {
      this.pos.y = 0;
      this.velY = 0;
    } else {
      if (input.jumpJustPressed && this.pos.y <= this.groundY + 0.08) {
        this.velY = 8.6;
      }
      this.velY -= 24 * dt;
      this.pos.y = Math.max(this.groundY, this.pos.y + this.velY * dt);
      if (this.pos.y <= this.groundY + 0.01) {
        this.pos.y = this.groundY;
        this.velY = 0;
      }
    }

    // Clamp to arena bounds
    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > arenaRadius) {
      this.pos.x = (this.pos.x / r) * arenaRadius;
      this.pos.z = (this.pos.z / r) * arenaRadius;
    }

    const aimDir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
    const modeDef = WEAPON_MODES[this.weaponMode];

    if ((input.attackHeld || input.attackJustPressed) && this.attackCooldown <= 0 && this.dashTimer <= 0) {
      this.attackCooldown = this.heavyWeaponAmmo > 0 ? 0.25 : this.def.attackCooldown * modeDef.cooldownMult;
      this.rig.rightArm.rotation.x = -1.2;
      callbacks.onAttack(this, aimDir);
    }

    if (input.specialJustPressed && this.specialCooldown <= 0) {
      this.specialCooldown = this.def.special.cooldown;
      this.rig.rightArm.rotation.x = -1.6;
      callbacks.onSpecial(this, aimDir);
    }

    if (input.visorJustPressed) {
      callbacks.onVisor(this);
    }

    if (input.interactJustPressed) {
      callbacks.onInteract(this);
    }

    if (input.quickBuild) {
      callbacks.onQuickBuild(this, input.quickBuild, aimDir);
    }

    // Animate toy-figure limbs, forward dash tilt, or freestyle swimming!
    const mountLift = this.mountTimer > 0 ? 0.95 : 0;
    const swimDrop = this.isSwimming ? -0.42 : 0;
    const crouchY = this.inStealthGrass ? -0.22 : 0;
    this.rig.root.position.set(this.pos.x, this.pos.y + crouchY + mountLift + swimDrop, this.pos.z);
    this.rig.root.rotation.y = this.facing;
    this.rig.root.rotation.x = this.isSwimming ? 1.05 : this.dashTimer > 0 ? 0.42 : 0;
    this.rig.root.visible =
      this.dashTimer > 0 || this.invulnTimer <= 0 || Math.floor(this.invulnTimer * 18) % 2 === 0;

    const swing =
      (moveMag > 0.05 || this.isSwimming) && this.pos.y < 0.1 && this.dashTimer <= 0
        ? Math.sin(this.walkPhase) * (this.isSwimming ? 0.9 : 0.65)
        : 0;
    this.rig.leftLeg.rotation.x = swing;
    this.rig.rightLeg.rotation.x = -swing;
    this.rig.leftArm.rotation.x = this.isSwimming ? -1.4 + swing : -swing * 0.6;
    this.rig.rightArm.rotation.x = this.isSwimming
      ? -1.4 - swing
      : THREE.MathUtils.lerp(this.rig.rightArm.rotation.x, swing * 0.5, Math.min(1, dt * 12));
  }

  dispose(): void {
    this.scene.remove(this.rig.root);
  }
}
