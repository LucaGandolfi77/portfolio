import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import { OUTFITS } from '../data/heroes';
import { PLOT_THEMES } from '../data/hubPlots';
import type { BeastDef, HeroDef, HouseAddonId, OutfitId, PlotThemeId, WeakPointDef } from '../data/types';
import type { BrickEngine } from './BrickEngine';

export interface HeroRig {
  root: THREE.Group;
  headGroup: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  weaponGroup: THREE.Group;
  playerRing: THREE.Mesh;
}

export interface BeastRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  legs: THREE.Group[];
  weakPointMeshes: Map<string, THREE.Group>;
  visorHighlights: Map<string, THREE.Mesh>;
  telegraphRing: THREE.Mesh;
}

/**
 * Pure procedural toy-block blueprints for Heroes, 9 Synth-Beasts,
 * 10 Village Structures + House Addons, and Elemental Hazards.
 */
export class BrickBlueprints {
  private readonly engine: BrickEngine;

  constructor(engine: BrickEngine) {
    this.engine = engine;
  }

  buildHero(hero: HeroDef, outfitId: OutfitId, playerIndex: 0 | 1, bigHead: boolean): HeroRig {
    const outfit = OUTFITS.find((o) => o.id === outfitId) ?? OUTFITS[0];
    const torsoColor = outfit.bodyColor !== 0 ? outfit.bodyColor : hero.colorPrimary;
    const accentColor = outfit.id !== 'default' ? outfit.accentColor : hero.colorAccent;

    const root = new THREE.Group();

    const ringGeo = new THREE.RingGeometry(0.65, 0.88, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: playerIndex === 0 ? BRICK_PALETTE.visorCyan : BRICK_PALETTE.brightYellow,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
    });
    const playerRing = new THREE.Mesh(ringGeo, ringMat);
    playerRing.position.y = 0.04;
    root.add(playerRing);

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.22, 0.52, 0);
    const legLMesh = this.engine.createBrick(0.32, 0.56, 0.36, hero.colorSecondary, { studs: false });
    legLMesh.position.y = -0.24;
    leftLeg.add(legLMesh);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.22, 0.52, 0);
    const legRMesh = this.engine.createBrick(0.32, 0.56, 0.36, hero.colorSecondary, { studs: false });
    legRMesh.position.y = -0.24;
    rightLeg.add(legRMesh);
    root.add(rightLeg);

    const torso = this.engine.createBrick(0.76, 0.68, 0.44, torsoColor, { studs: false });
    torso.position.y = 0.88;
    root.add(torso);

    const badge = this.engine.createBrick(0.34, 0.22, 0.08, accentColor, { studs: false, emissive: outfit.id === 'cyber' });
    badge.position.set(0, 0.92, 0.24);
    root.add(badge);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.5, 1.12, 0);
    const armLMesh = this.engine.createBrick(0.22, 0.56, 0.26, torsoColor, { studs: false });
    armLMesh.position.y = -0.22;
    leftArm.add(armLMesh);
    const handL = this.engine.createBrick(0.2, 0.18, 0.2, BRICK_PALETTE.skinWarm, { studs: false, shape: 'cylinder' });
    handL.position.y = -0.52;
    leftArm.add(handL);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.5, 1.12, 0);
    const armRMesh = this.engine.createBrick(0.22, 0.56, 0.26, torsoColor, { studs: false });
    armRMesh.position.y = -0.22;
    rightArm.add(armRMesh);
    const handR = this.engine.createBrick(0.2, 0.18, 0.2, BRICK_PALETTE.skinWarm, { studs: false, shape: 'cylinder' });
    handR.position.y = -0.52;
    rightArm.add(handR);

    const weaponGroup = this.buildHeroWeapon(hero.id);
    weaponGroup.position.set(0, -0.5, 0.26);
    rightArm.add(weaponGroup);
    root.add(rightArm);

    const headGroup = new THREE.Group();
    headGroup.position.y = 1.48;
    headGroup.scale.setScalar(bigHead ? 1.55 : 1.0);

    const headCyl = this.engine.createBrick(0.52, 0.5, 0.52, BRICK_PALETTE.skinWarm, { studs: false, shape: 'cylinder' });
    headGroup.add(headCyl);

    const eyeL = this.engine.createBrick(0.08, 0.08, 0.05, BRICK_PALETTE.charcoal, { studs: false });
    eyeL.position.set(-0.11, 0.05, 0.25);
    const eyeR = this.engine.createBrick(0.08, 0.08, 0.05, BRICK_PALETTE.charcoal, { studs: false });
    eyeR.position.set(0.11, 0.05, 0.25);
    headGroup.add(eyeL, eyeR);

    if (outfit.headAccessory === 'none') {
      const hair = this.engine.createBrick(0.58, 0.22, 0.58, hero.colorHair, { studs: true });
      hair.position.set(0, 0.28, -0.04);
      headGroup.add(hair);
      if (hero.id === 'ayla') {
        const braid = this.engine.createBrick(0.2, 0.44, 0.2, hero.colorHair, { studs: false });
        braid.position.set(0, 0.05, -0.34);
        headGroup.add(braid);
      }
    } else if (outfit.headAccessory === 'visor') {
      const visor = this.engine.createBrick(0.58, 0.16, 0.22, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      visor.position.set(0, 0.08, 0.22);
      const helm = this.engine.createBrick(0.6, 0.24, 0.6, BRICK_PALETTE.charcoal, { studs: true });
      helm.position.set(0, 0.28, 0);
      headGroup.add(visor, helm);
    } else if (outfit.headAccessory === 'dino-crest') {
      const hood = this.engine.createBrick(0.64, 0.28, 0.68, BRICK_PALETTE.limeGreen, { studs: true });
      hood.position.set(0, 0.3, 0.04);
      const spike = this.engine.createBrick(0.16, 0.24, 0.44, BRICK_PALETTE.brightYellow, { studs: false });
      spike.position.set(0, 0.48, -0.05);
      headGroup.add(hood, spike);
    } else if (outfit.headAccessory === 'shark-fin') {
      const hood = this.engine.createBrick(0.64, 0.28, 0.64, BRICK_PALETTE.skyBlue, { studs: false });
      hood.position.set(0, 0.3, 0);
      const fin = this.engine.createBrick(0.14, 0.36, 0.38, BRICK_PALETTE.skyBlue, { studs: false, shape: 'slope' });
      fin.position.set(0, 0.56, -0.04);
      headGroup.add(hood, fin);
    } else if (outfit.headAccessory === 'plume') {
      const helm = this.engine.createBrick(0.62, 0.3, 0.62, BRICK_PALETTE.cobaltBlue, { studs: false });
      helm.position.set(0, 0.28, 0);
      const plume = this.engine.createBrick(0.16, 0.32, 0.48, BRICK_PALETTE.brightRed, { studs: false });
      plume.position.set(0, 0.54, -0.06);
      headGroup.add(helm, plume);
    } else if (outfit.headAccessory === 'crown') {
      const crown = this.engine.createBrick(0.58, 0.24, 0.58, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      crown.position.set(0, 0.32, 0);
      headGroup.add(crown);
    }

    root.add(headGroup);
    return { root, headGroup, leftLeg, rightLeg, leftArm, rightArm, weaponGroup, playerRing };
  }

  private buildHeroWeapon(heroId: HeroDef['id']): THREE.Group {
    const g = new THREE.Group();
    if (heroId === 'ayla') {
      const limbTop = this.engine.createBrick(0.1, 0.52, 0.14, BRICK_PALETTE.barkBrown, { studs: false });
      limbTop.position.set(0, 0.26, 0.1);
      limbTop.rotation.x = -0.35;
      const limbBot = this.engine.createBrick(0.1, 0.52, 0.14, BRICK_PALETTE.barkBrown, { studs: false });
      limbBot.position.set(0, -0.26, 0.1);
      limbBot.rotation.x = 0.35;
      const string = this.engine.createBrick(0.04, 0.88, 0.04, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      string.position.set(0, 0, -0.02);
      g.add(limbTop, limbBot, string);
    } else if (heroId === 'varn') {
      const shaft = this.engine.createBrick(0.1, 0.1, 1.5, BRICK_PALETTE.barkBrown, { studs: false });
      shaft.position.z = 0.45;
      const tip = this.engine.createBrick(0.24, 0.12, 0.42, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      tip.position.z = 1.25;
      g.add(shaft, tip);
    } else if (heroId === 'tessa') {
      const bomb = this.engine.createBrick(0.36, 0.36, 0.36, BRICK_PALETTE.brightRed, { studs: true, emissive: true });
      g.add(bomb);
    } else {
      const shaft = this.engine.createBrick(0.12, 0.12, 1.2, BRICK_PALETTE.darkGray, { studs: false });
      shaft.position.z = 0.4;
      const head = this.engine.createBrick(0.68, 0.42, 0.44, BRICK_PALETTE.sunsetOrange, { studs: true });
      head.position.z = 1.05;
      g.add(shaft, head);
    }
    return g;
  }

  buildSynthBeast(def: BeastDef): BeastRig {
    const root = new THREE.Group();
    const bodyGroup = new THREE.Group();
    root.add(bodyGroup);

    const legs: THREE.Group[] = [];

    const teleGeo = new THREE.RingGeometry(def.radius * 0.9, def.radius * 1.25, 28);
    teleGeo.rotateX(-Math.PI / 2);
    const teleMat = new THREE.MeshBasicMaterial({
      color: BRICK_PALETTE.brightRed,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const telegraphRing = new THREE.Mesh(teleGeo, teleMat);
    telegraphRing.position.y = 0.06;
    root.add(telegraphRing);

    if (def.id === 'opti-raptor') {
      const pelvis = this.engine.createBrick(0.95, 0.65, 1.1, def.chassisColor, { studs: true });
      pelvis.position.set(0, 1.05, 0);
      const armor = this.engine.createBrick(1.05, 0.42, 0.95, def.armorColor, { studs: true });
      armor.position.set(0, 1.48, 0.15);
      const tail = this.engine.createBrick(0.32, 0.28, 1.25, def.armorColor, { studs: true });
      tail.position.set(0, 1.08, -1.05);
      bodyGroup.add(pelvis, armor, tail);

      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.48, 0.9, 0);
        const mesh = this.engine.createBrick(0.32, 0.92, 0.44, def.chassisColor, { studs: false });
        mesh.position.y = -0.44;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'solar-stag') {
      const torso = this.engine.createBrick(1.05, 0.72, 1.85, def.armorColor, { studs: true });
      torso.position.set(0, 1.15, 0);
      const neck = this.engine.createBrick(0.45, 0.75, 0.55, def.chassisColor, { studs: false });
      neck.position.set(0, 1.55, 0.95);
      const hornL = this.engine.createBrick(0.14, 0.62, 0.18, BRICK_PALETTE.brightYellow, { studs: false });
      hornL.position.set(-0.28, 2.08, 1.05);
      hornL.rotation.z = 0.35;
      const hornR = this.engine.createBrick(0.14, 0.62, 0.18, BRICK_PALETTE.brightYellow, { studs: false });
      hornR.position.set(0.28, 2.08, 1.05);
      hornR.rotation.z = -0.35;
      bodyGroup.add(torso, neck, hornL, hornR);

      for (const [lx, lz] of [[-0.46, 0.65], [0.46, 0.65], [-0.46, -0.65], [0.46, -0.65]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.92, lz);
        const mesh = this.engine.createBrick(0.28, 0.92, 0.32, def.chassisColor, { studs: false });
        mesh.position.y = -0.46;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'volt-crab') {
      const shell = this.engine.createBrick(1.85, 0.82, 1.75, def.armorColor, { studs: true });
      shell.position.set(0, 1.08, 0);
      const shield = this.engine.createBrick(0.25, 1.15, 1.25, BRICK_PALETTE.shockGlow, {
        studs: false,
        emissive: true,
        transparent: true,
        opacity: 0.55,
      });
      shield.position.set(-1.15, 1.05, 0.55);
      shield.rotation.y = 0.35;
      bodyGroup.add(shell, shield);

      for (const [lx, lz] of [[-0.95, 0.55], [0.95, 0.55], [-0.95, 0], [0.95, 0], [-0.95, -0.55], [0.95, -0.55]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.78, lz);
        const mesh = this.engine.createBrick(0.32, 0.78, 0.32, def.chassisColor, { studs: false });
        mesh.position.y = -0.38;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'stalker-lynx') {
      const torso = this.engine.createBrick(0.92, 0.6, 1.95, def.armorColor, { studs: true });
      torso.position.set(0, 0.95, 0);
      const head = this.engine.createBrick(0.68, 0.5, 0.74, def.chassisColor, { studs: false });
      head.position.set(0, 1.2, 1.18);
      const eye = this.engine.createBrick(0.52, 0.14, 0.14, def.glowColor, { studs: false, emissive: true });
      eye.position.set(0, 1.24, 1.54);
      const tail = this.engine.createBrick(0.22, 0.22, 1.4, def.armorColor, { studs: false });
      tail.position.set(0, 1.15, -1.45);
      bodyGroup.add(torso, head, eye, tail);

      for (const [lx, lz] of [[-0.42, 0.7], [0.42, 0.7], [-0.42, -0.7], [0.42, -0.7]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.78, lz);
        const mesh = this.engine.createBrick(0.24, 0.78, 0.3, def.chassisColor, { studs: false });
        mesh.position.y = -0.38;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'cryo-mammoth') {
      const body = this.engine.createBrick(1.85, 1.25, 2.35, def.armorColor, { studs: true });
      body.position.set(0, 1.35, 0);
      const head = this.engine.createBrick(1.25, 1.0, 1.0, def.chassisColor, { studs: true });
      head.position.set(0, 1.55, 1.35);
      const trunk = this.engine.createBrick(0.35, 0.9, 0.4, def.chassisColor, { studs: false });
      trunk.position.set(0, 0.95, 1.85);
      const tuskL = this.engine.createBrick(0.22, 0.22, 1.05, BRICK_PALETTE.frostGlow, { studs: false, emissive: true });
      tuskL.position.set(-0.55, 1.25, 2.05);
      const tuskR = this.engine.createBrick(0.22, 0.22, 1.05, BRICK_PALETTE.frostGlow, { studs: false, emissive: true });
      tuskR.position.set(0.55, 1.25, 2.05);
      bodyGroup.add(body, head, trunk, tuskL, tuskR);

      for (const [lx, lz] of [[-0.75, 0.8], [0.75, 0.8], [-0.75, -0.8], [0.75, -0.8]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.85, lz);
        const mesh = this.engine.createBrick(0.45, 0.85, 0.48, def.chassisColor, { studs: false });
        mesh.position.y = -0.42;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'magma-beetle') {
      const shell = this.engine.createBrick(1.65, 0.9, 1.95, def.armorColor, { studs: true });
      shell.position.set(0, 0.92, 0);
      const pincerL = this.engine.createBrick(0.26, 0.24, 0.95, BRICK_PALETTE.fireGlow, { studs: false, emissive: true });
      pincerL.position.set(-0.55, 0.72, 1.32);
      const pincerR = this.engine.createBrick(0.26, 0.24, 0.95, BRICK_PALETTE.fireGlow, { studs: false, emissive: true });
      pincerR.position.set(0.55, 0.72, 1.32);
      bodyGroup.add(shell, pincerL, pincerR);

      for (const [lx, lz] of [[-0.88, 0.55], [0.88, 0.55], [-0.88, -0.55], [0.88, -0.55]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.58, lz);
        const mesh = this.engine.createBrick(0.3, 0.58, 0.34, def.chassisColor, { studs: false });
        mesh.position.y = -0.28;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'aero-hawk') {
      const fuselage = this.engine.createBrick(0.75, 0.55, 1.7, def.armorColor, { studs: true });
      fuselage.position.set(0, 1.9, 0);
      const beak = this.engine.createBrick(0.32, 0.28, 0.6, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      beak.position.set(0, 1.88, 1.1);
      bodyGroup.add(fuselage, beak);

      for (const side of [-1, 1]) {
        const wing = new THREE.Group();
        wing.position.set(side * 0.4, 2.0, 0);
        const blade = this.engine.createBrick(1.45, 0.16, 0.75, def.armorColor, { studs: true });
        blade.position.x = side * 0.72;
        wing.add(blade);
        bodyGroup.add(wing);
        legs.push(wing);
      }
    } else if (def.id === 'pyro-wyvern') {
      const torso = this.engine.createBrick(1.6, 1.15, 2.5, def.armorColor, { studs: true });
      torso.position.set(0, 2.0, 0);
      const head = this.engine.createBrick(0.95, 0.78, 1.25, def.chassisColor, { studs: true });
      head.position.set(0, 2.5, 1.75);
      const eyes = this.engine.createBrick(0.76, 0.22, 0.2, BRICK_PALETTE.fireGlow, { studs: false, emissive: true });
      eyes.position.set(0, 2.65, 2.32);
      const tail = this.engine.createBrick(0.55, 0.45, 2.1, def.armorColor, { studs: true });
      tail.position.set(0, 1.85, -2.0);
      bodyGroup.add(torso, head, eyes, tail);

      for (const side of [-1, 1]) {
        const wing = new THREE.Group();
        wing.position.set(side * 0.85, 2.35, 0.1);
        const blade = this.engine.createBrick(2.4, 0.22, 1.25, def.armorColor, { studs: true });
        blade.position.x = side * 1.2;
        const glowEdge = this.engine.createBrick(2.1, 0.12, 0.25, BRICK_PALETTE.fireGlow, { studs: false, emissive: true });
        glowEdge.position.set(side * 1.15, 0, 0.62);
        wing.add(blade, glowEdge);
        bodyGroup.add(wing);
        legs.push(wing);
      }
    } else if (def.id === 'venom-viper') {
      // Articulated marsh serpent
      for (let seg = 0; seg < 4; seg++) {
        const s = this.engine.createBrick(0.75 - seg * 0.1, 0.48, 0.72, seg % 2 === 0 ? def.armorColor : def.chassisColor, { studs: true });
        s.position.set(0, 0.45 + (seg === 0 ? 0.55 : 0), 0.7 - seg * 0.68);
        bodyGroup.add(s);
      }
      const hood = this.engine.createBrick(1.1, 0.62, 0.45, def.armorColor, { studs: true });
      hood.position.set(0, 1.2, 0.85);
      const fangs = this.engine.createBrick(0.45, 0.22, 0.25, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      fangs.position.set(0, 1.0, 1.2);
      bodyGroup.add(hood, fangs);
    } else if (def.id === 'frost-scorpion') {
      const body = this.engine.createBrick(1.4, 0.65, 1.8, def.armorColor, { studs: true });
      body.position.set(0, 0.72, 0);
      const tail1 = this.engine.createBrick(0.42, 1.25, 0.42, def.chassisColor, { studs: true });
      tail1.position.set(0, 1.45, -0.95);
      const tail2 = this.engine.createBrick(0.42, 0.42, 0.95, def.armorColor, { studs: true });
      tail2.position.set(0, 2.05, -0.55);
      const clawL = this.engine.createBrick(0.45, 0.35, 0.9, def.chassisColor, { studs: false });
      clawL.position.set(-0.85, 0.75, 1.15);
      const clawR = this.engine.createBrick(0.45, 0.35, 0.9, def.chassisColor, { studs: false });
      clawR.position.set(0.85, 0.75, 1.15);
      bodyGroup.add(body, tail1, tail2, clawL, clawR);
      for (const [lx, lz] of [[-0.85, 0.45], [0.85, 0.45], [-0.85, -0.45], [0.85, -0.45]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.6, lz);
        const mesh = this.engine.createBrick(0.28, 0.6, 0.28, def.chassisColor, { studs: false });
        mesh.position.y = -0.3;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'thunder-rhino') {
      const body = this.engine.createBrick(1.75, 1.15, 2.35, def.armorColor, { studs: true });
      body.position.set(0, 1.25, 0);
      const head = this.engine.createBrick(1.15, 0.85, 1.05, def.chassisColor, { studs: true });
      head.position.set(0, 1.25, 1.35);
      const backCoil = this.engine.createBrick(0.85, 0.45, 1.15, BRICK_PALETTE.shockGlow, { studs: true, emissive: true });
      backCoil.position.set(0, 2.0, -0.15);
      bodyGroup.add(body, head, backCoil);
      for (const [lx, lz] of [[-0.72, 0.78], [0.72, 0.78], [-0.72, -0.78], [0.72, -0.78]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.82, lz);
        const mesh = this.engine.createBrick(0.44, 0.82, 0.44, def.chassisColor, { studs: false });
        mesh.position.y = -0.4;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'leviathan-mech') {
      const torso = this.engine.createBrick(2.1, 1.35, 3.1, def.armorColor, { studs: true });
      torso.position.set(0, 1.4, 0);
      const head = this.engine.createBrick(1.4, 1.05, 1.6, def.chassisColor, { studs: true });
      head.position.set(0, 1.95, 1.85);
      const eyes = this.engine.createBrick(1.1, 0.25, 0.22, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      eyes.position.set(0, 2.1, 2.65);
      const tailFin = this.engine.createBrick(1.6, 0.3, 1.4, BRICK_PALETTE.visorCyan, { studs: true, emissive: true });
      tailFin.position.set(0, 1.3, -2.15);
      bodyGroup.add(torso, head, eyes, tailFin);
      for (const [lx, lz] of [[-1.15, 0.8], [1.15, 0.8], [-1.15, -0.8], [1.15, -0.8]]) {
        const fin = new THREE.Group();
        fin.position.set(lx, 0.9, lz);
        const mesh = this.engine.createBrick(0.65, 0.85, 0.75, def.chassisColor, { studs: false });
        mesh.position.y = -0.4;
        fin.add(mesh);
        bodyGroup.add(fin);
        legs.push(fin);
      }
    } else if (def.id === 'solar-colossus') {
      // Supreme Golden Titan Final Boss
      const torso = this.engine.createBrick(2.4, 1.85, 2.6, def.armorColor, { studs: true });
      torso.position.set(0, 2.25, 0);
      const shoulderL = this.engine.createBrick(1.1, 1.1, 1.3, BRICK_PALETTE.obsidian, { studs: true });
      shoulderL.position.set(-1.75, 2.8, 0);
      const shoulderR = this.engine.createBrick(1.1, 1.1, 1.3, BRICK_PALETTE.obsidian, { studs: true });
      shoulderR.position.set(1.75, 2.8, 0);
      const head = this.engine.createBrick(1.15, 1.0, 1.15, BRICK_PALETTE.obsidian, { studs: true });
      head.position.set(0, 3.55, 0.2);
      const visor = this.engine.createBrick(0.95, 0.28, 0.2, BRICK_PALETTE.fireGlow, { studs: false, emissive: true });
      visor.position.set(0, 3.6, 0.82);
      bodyGroup.add(torso, shoulderL, shoulderR, head, visor);
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 1.05, 1.45, 0);
        const mesh = this.engine.createBrick(0.75, 1.5, 0.95, BRICK_PALETTE.obsidian, { studs: true });
        mesh.position.y = -0.75;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'chrono-scarab') {
      const shell = this.engine.createBrick(1.5, 0.78, 1.85, def.armorColor, { studs: true });
      shell.position.set(0, 0.9, 0);
      const wingL = this.engine.createBrick(0.65, 0.16, 1.5, def.chassisColor, { studs: true });
      wingL.position.set(-0.65, 1.32, -0.1);
      const wingR = this.engine.createBrick(0.65, 0.16, 1.5, def.chassisColor, { studs: true });
      wingR.position.set(0.65, 1.32, -0.1);
      bodyGroup.add(shell, wingL, wingR);
      for (const [lx, lz] of [[-0.85, 0.55], [0.85, 0.55], [-0.85, -0.55], [0.85, -0.55]]) {
        const leg = new THREE.Group();
        leg.position.set(lx, 0.6, lz);
        const m = this.engine.createBrick(0.26, 0.6, 0.26, def.chassisColor, { studs: false });
        m.position.y = -0.3;
        leg.add(m);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'samurai-mantis') {
      const torso = this.engine.createBrick(1.0, 1.15, 1.1, def.chassisColor, { studs: true });
      torso.position.set(0, 1.35, 0);
      const armor = this.engine.createBrick(1.25, 0.65, 1.2, def.armorColor, { studs: true });
      armor.position.set(0, 1.65, 0);
      const bladeL = this.engine.createBrick(0.18, 0.28, 1.75, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      bladeL.position.set(-0.92, 1.35, 0.8);
      const bladeR = this.engine.createBrick(0.18, 0.28, 1.75, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      bladeR.position.set(0.92, 1.35, 0.8);
      bodyGroup.add(torso, armor, bladeL, bladeR);
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.45, 0.85, 0);
        const m = this.engine.createBrick(0.32, 0.85, 0.42, def.chassisColor, { studs: false });
        m.position.y = -0.42;
        leg.add(m);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'steam-golem') {
      const chest = this.engine.createBrick(1.9, 1.6, 1.5, def.armorColor, { studs: true });
      chest.position.set(0, 1.8, 0);
      const chimney = this.engine.createBrick(0.45, 1.2, 0.45, BRICK_PALETTE.charcoal, { studs: false, shape: 'cylinder' });
      chimney.position.set(0.55, 2.95, -0.35);
      const head = this.engine.createBrick(0.95, 0.75, 0.95, def.chassisColor, { studs: true });
      head.position.set(0, 2.85, 0.25);
      bodyGroup.add(chest, chimney, head);
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.72, 1.0, 0);
        const m = this.engine.createBrick(0.58, 1.0, 0.65, def.chassisColor, { studs: true });
        m.position.y = -0.5;
        leg.add(m);
        bodyGroup.add(leg);
        legs.push(leg);
      }
    } else if (def.id === 'pharaoh-sphinx') {
      const base = this.engine.createBrick(2.1, 1.35, 3.0, def.armorColor, { studs: true });
      base.position.set(0, 1.35, 0);
      const head = this.engine.createBrick(1.4, 1.4, 1.3, def.chassisColor, { studs: true });
      head.position.set(0, 2.55, 1.25);
      const nemes = this.engine.createBrick(2.1, 1.15, 0.55, def.armorColor, { studs: true });
      nemes.position.set(0, 2.55, 1.05);
      bodyGroup.add(base, head, nemes);
      for (const [lx, lz] of [[-0.9, 1.15], [0.9, 1.15], [-0.9, -1.1], [0.9, -1.1]]) {
        const paw = new THREE.Group();
        paw.position.set(lx, 0.75, lz);
        const m = this.engine.createBrick(0.55, 0.75, 0.85, def.armorColor, { studs: true });
        m.position.y = -0.36;
        paw.add(m);
        bodyGroup.add(paw);
        legs.push(paw);
      }
    } else if (def.id === 'void-kraken') {
      const dome = this.engine.createBrick(2.2, 1.9, 2.2, def.armorColor, { studs: true, shape: 'cylinder' });
      dome.position.set(0, 2.35, 0);
      bodyGroup.add(dome);
      for (let t = 0; t < 4; t++) {
        const ang = (t / 4) * Math.PI * 2 + Math.PI / 4;
        const tent = new THREE.Group();
        tent.position.set(Math.cos(ang) * 1.15, 1.5, Math.sin(ang) * 1.15);
        const m = this.engine.createBrick(0.42, 1.45, 0.42, def.chassisColor, { studs: false });
        m.position.y = -0.7;
        tent.add(m);
        bodyGroup.add(tent);
        legs.push(tent);
      }
    } else if (def.id === 'chronos-prime') {
      const core = this.engine.createBrick(2.3, 2.2, 2.0, def.armorColor, { studs: true });
      core.position.set(0, 2.65, 0);
      const halo = this.engine.createBrick(3.6, 0.32, 0.32, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      halo.position.set(0, 4.1, 0);
      const crown = this.engine.createBrick(1.3, 1.1, 1.3, BRICK_PALETTE.obsidian, { studs: true });
      crown.position.set(0, 4.0, 0);
      bodyGroup.add(core, halo, crown);
      for (const side of [-1, 1]) {
        const wing = new THREE.Group();
        wing.position.set(side * 1.45, 2.9, -0.2);
        const blade = this.engine.createBrick(2.1, 0.35, 1.1, BRICK_PALETTE.visorCyan, { studs: true, emissive: true });
        blade.position.x = side * 1.0;
        wing.add(blade);
        bodyGroup.add(wing);
        legs.push(wing);
      }
    } else {
      // Apex Rex (Boss Titan)
      const torso = this.engine.createBrick(1.9, 1.5, 2.8, def.armorColor, { studs: true });
      torso.position.set(0, 1.95, 0);
      const jaw = this.engine.createBrick(1.15, 0.95, 1.55, def.chassisColor, { studs: true });
      jaw.position.set(0, 2.75, 1.85);
      const visor = this.engine.createBrick(0.95, 0.26, 0.25, def.glowColor, { studs: false, emissive: true });
      visor.position.set(0, 2.95, 2.58);
      const tail = this.engine.createBrick(0.75, 0.65, 2.3, def.armorColor, { studs: true });
      tail.position.set(0, 1.65, -2.25);
      bodyGroup.add(torso, jaw, visor, tail);

      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * 0.95, 1.45, 0.15);
        const mesh = this.engine.createBrick(0.65, 1.45, 0.85, def.chassisColor, { studs: true });
        mesh.position.y = -0.72;
        leg.add(mesh);
        bodyGroup.add(leg);
        legs.push(leg);
      }
      bodyGroup.scale.setScalar(1.19);
    }

    const weakPointMeshes = new Map<string, THREE.Group>();
    const visorHighlights = new Map<string, THREE.Mesh>();

    for (const wp of def.weakPoints) {
      const wpGroup = this.buildWeakPointMesh(wp);
      wpGroup.position.set(wp.offset[0], wp.offset[1], wp.offset[2]);
      bodyGroup.add(wpGroup);
      weakPointMeshes.set(wp.id, wpGroup);

      const hlGeo = new THREE.BoxGeometry(wp.size[0] * 1.38, wp.size[1] * 1.38, wp.size[2] * 1.38);
      const hlMat = new THREE.MeshBasicMaterial({
        color: BRICK_PALETTE.weakPointAmber,
        wireframe: true,
        transparent: true,
        opacity: 0,
      });
      const hlMesh = new THREE.Mesh(hlGeo, hlMat);
      wpGroup.add(hlMesh);
      visorHighlights.set(wp.id, hlMesh);
    }

    return { root, bodyGroup, legs, weakPointMeshes, visorHighlights, telegraphRing };
  }

  private buildWeakPointMesh(wp: WeakPointDef): THREE.Group {
    return this.engine.createBrick(wp.size[0], wp.size[1], wp.size[2], wp.color, {
      studs: true,
      emissive: true,
    });
  }

  /**
   * Builds any of the 10 Hearth-Haven structures + optional mounted House Addon!
   */
  buildPlotBuilding(plotId: string, themeId: PlotThemeId, built: boolean, addon: HouseAddonId = 'none'): THREE.Group {
    const group = new THREE.Group();
    const theme = PLOT_THEMES[themeId];

    const base = this.engine.createBrick(4.4, 0.32, 4.4, built ? theme.trimColor : BRICK_PALETTE.lightGray, { studs: true });
    base.position.y = 0.16;
    group.add(base);

    if (!built) {
      const post = this.engine.createBrick(0.3, 1.2, 0.3, BRICK_PALETTE.barkBrown, { studs: false });
      post.position.set(0, 0.8, 0);
      const sign = this.engine.createBrick(1.4, 0.7, 0.2, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      sign.position.set(0, 1.5, 0);
      group.add(post, sign);
      return group;
    }

    // Specialized structure silhouettes for the new facilities & landmarks
    let roofTopY = 4.1;
    if (plotId === 'block-windmill') {
      const tower = this.engine.createBrick(2.4, 3.8, 2.4, theme.wallColor, { studs: true });
      tower.position.y = 2.2;
      const cap = this.engine.createBrick(2.8, 0.65, 2.8, theme.roofColor, { studs: true });
      cap.position.y = 4.4;
      const blade1 = this.engine.createBrick(3.8, 0.38, 0.18, BRICK_PALETTE.pureWhite, { studs: true });
      blade1.position.set(0, 3.2, 1.38);
      const blade2 = this.engine.createBrick(0.38, 3.8, 0.18, BRICK_PALETTE.pureWhite, { studs: true });
      blade2.position.set(0, 3.2, 1.38);
      group.add(tower, cap, blade1, blade2);
      roofTopY = 4.8;
    } else if (plotId === 'botanic-dome') {
      const planter = this.engine.createBrick(3.6, 1.1, 3.6, theme.wallColor, { studs: true });
      planter.position.y = 0.85;
      const glass = this.engine.createBrick(3.2, 2.2, 3.2, BRICK_PALETTE.iceCyan, {
        studs: true,
        transparent: true,
        opacity: 0.55,
      });
      glass.position.y = 2.4;
      const tree = this.engine.createBrick(1.2, 1.6, 1.2, BRICK_PALETTE.limeGreen, { studs: true });
      tree.position.y = 2.1;
      group.add(planter, tree, glass);
      roofTopY = 3.6;
    } else if (plotId === 'beacon-lighthouse') {
      const lower = this.engine.createBrick(2.4, 2.2, 2.4, BRICK_PALETTE.pureWhite, { studs: false });
      lower.position.y = 1.4;
      const stripe = this.engine.createBrick(2.1, 1.5, 2.1, theme.roofColor, { studs: false });
      stripe.position.y = 3.2;
      const lantern = this.engine.createBrick(1.6, 1.2, 1.6, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      lantern.position.y = 4.55;
      group.add(lower, stripe, lantern);
      roofTopY = 5.2;
    } else if (plotId === 'star-observatory') {
      const baseWall = this.engine.createBrick(3.4, 1.9, 3.4, theme.wallColor, { studs: false });
      baseWall.position.y = 1.25;
      const dome = this.engine.createBrick(2.8, 1.4, 2.8, theme.roofColor, { studs: true, shape: 'cylinder' });
      dome.position.y = 2.85;
      const scope = this.engine.createBrick(0.45, 0.45, 2.2, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
      scope.position.set(0, 3.2, 1.1);
      scope.rotation.x = -0.45;
      group.add(baseWall, dome, scope);
      roofTopY = 3.7;
    } else {
      // Classic customizable brick house
      const walls = this.engine.createBrick(3.4, 2.2, 3.2, theme.wallColor, { studs: false });
      walls.position.y = 1.42;
      const door = this.engine.createBrick(0.95, 1.45, 0.18, theme.trimColor, { studs: false });
      door.position.set(0, 1.04, 1.62);
      const winL = this.engine.createBrick(0.65, 0.65, 0.15, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      winL.position.set(-1.05, 1.55, 1.62);
      const winR = this.engine.createBrick(0.65, 0.65, 0.15, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      winR.position.set(1.05, 1.55, 1.62);
      const roof1 = this.engine.createBrick(3.9, 0.55, 3.7, theme.roofColor, { studs: true });
      roof1.position.y = 2.8;
      const roof2 = this.engine.createBrick(2.8, 0.55, 2.6, theme.roofColor, { studs: true });
      roof2.position.y = 3.35;
      const roof3 = this.engine.createBrick(1.6, 0.45, 1.5, theme.trimColor, { studs: true, emissive: themeId === 'cyber' });
      roof3.position.y = 3.85;
      group.add(walls, door, winL, winR, roof1, roof2, roof3);

      if (plotId === 'dino-coaster') {
        const arch = this.engine.createBrick(0.4, 1.6, 3.2, BRICK_PALETTE.brightYellow, { studs: true });
        arch.position.set(0, 4.4, 0);
        group.add(arch);
      } else if (plotId === 'sky-monument') {
        const spire = this.engine.createBrick(0.7, 2.4, 0.7, BRICK_PALETTE.visorCyan, { studs: true, emissive: true });
        spire.position.set(0, 5.0, 0);
        group.add(spire);
      }
    }

    // Optional House Addons mounted on roof or yard!
    if (addon === 'solar-array') {
      const panel = this.engine.createBrick(2.2, 0.16, 1.2, BRICK_PALETTE.cobaltBlue, { studs: false, emissive: true });
      panel.position.set(0, roofTopY + 0.35, 0);
      panel.rotation.x = 0.35;
      group.add(panel);
    } else if (addon === 'hero-banner') {
      const pole = this.engine.createBrick(0.16, 1.9, 0.16, BRICK_PALETTE.lightGray, { studs: false });
      pole.position.set(1.8, 1.1, 1.8);
      const flag = this.engine.createBrick(0.95, 0.65, 0.12, BRICK_PALETTE.sunsetOrange, { studs: true, emissive: true });
      flag.position.set(2.25, 1.75, 1.8);
      group.add(pole, flag);
    } else if (addon === 'firework-tower') {
      const rocket = this.engine.createBrick(0.45, 1.35, 0.45, BRICK_PALETTE.brightRed, { studs: true, emissive: true });
      rocket.position.set(0, roofTopY + 0.65, 0);
      const tip = this.engine.createBrick(0.55, 0.4, 0.55, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      tip.position.set(0, roofTopY + 1.45, 0);
      group.add(rocket, tip);
    } else if (addon === 'crystal-garden') {
      for (const [cx, cz] of [[-1.85, 1.85], [1.85, 1.85], [-1.85, -1.85]]) {
        const crystal = this.engine.createBrick(0.42, 0.95, 0.42, BRICK_PALETTE.visorCyan, { studs: false, emissive: true });
        crystal.position.set(cx, 0.72, cz);
        crystal.rotation.y = Math.PI / 4;
        group.add(crystal);
      }
    }

    return group;
  }

  buildElementalHazard(type: 'campfire' | 'shock-crystal' | 'cryo-vent' | 'blast-barrel'): THREE.Group {
    const g = new THREE.Group();
    if (type === 'campfire') {
      const logs = this.engine.createBrick(1.3, 0.34, 1.3, BRICK_PALETTE.barkBrown, { studs: true });
      logs.position.y = 0.17;
      const flame1 = this.engine.createBrick(0.75, 0.95, 0.75, BRICK_PALETTE.fireGlow, { studs: false, emissive: true });
      flame1.position.y = 0.8;
      const flame2 = this.engine.createBrick(0.42, 0.6, 0.42, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      flame2.position.y = 1.4;
      g.add(logs, flame1, flame2);
    } else if (type === 'shock-crystal') {
      const base = this.engine.createBrick(1.1, 0.35, 1.1, BRICK_PALETTE.darkGray, { studs: true });
      base.position.y = 0.18;
      const spire = this.engine.createBrick(0.55, 1.6, 0.55, BRICK_PALETTE.shockGlow, { studs: false, emissive: true });
      spire.position.y = 1.12;
      spire.rotation.y = Math.PI / 4;
      g.add(base, spire);
    } else if (type === 'cryo-vent') {
      const base = this.engine.createBrick(1.25, 0.45, 1.25, BRICK_PALETTE.iceCyan, { studs: true });
      base.position.y = 0.22;
      const mist = this.engine.createBrick(0.7, 1.05, 0.7, BRICK_PALETTE.frostGlow, {
        studs: false,
        emissive: true,
        transparent: true,
        opacity: 0.72,
      });
      mist.position.y = 0.95;
      g.add(base, mist);
    } else {
      const barrel = this.engine.createBrick(0.9, 1.2, 0.9, BRICK_PALETTE.brightRed, { studs: false, shape: 'cylinder' });
      barrel.position.y = 0.6;
      const band = this.engine.createBrick(0.96, 0.25, 0.96, BRICK_PALETTE.brightYellow, {
        studs: false,
        emissive: true,
        shape: 'cylinder',
      });
      band.position.y = 0.65;
      g.add(barrel, band);
    }
    return g;
  }
}
