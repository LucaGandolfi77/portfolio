import { BRICK_PALETTE } from './brickPalette';
import type { ElementType } from './types';

export type ElementalComboId = 'thermal-shatter' | 'superconductor' | 'overload';

export interface ElementalComboDef {
  id: ElementalComboId;
  nameEn: string;
  nameIt: string;
  icon: string;
  color: number;
  bonusDamage: number;
  aoeRadius: number;
}

export const ELEMENTAL_COMBOS: Record<ElementalComboId, ElementalComboDef> = {
  'thermal-shatter': {
    id: 'thermal-shatter',
    nameEn: 'THERMAL SHATTER!',
    nameIt: 'SHOCK TERMICO!',
    icon: '💥',
    color: BRICK_PALETTE.brightYellow,
    bonusDamage: 110,
    aoeRadius: 4.5,
  },
  superconductor: {
    id: 'superconductor',
    nameEn: 'SUPERCONDUCTOR!',
    nameIt: 'SUPERCONDUTTORE!',
    icon: '🧲',
    color: BRICK_PALETTE.visorCyan,
    bonusDamage: 75,
    aoeRadius: 7.5,
  },
  overload: {
    id: 'overload',
    nameEn: 'OVERLOAD BLAST!',
    nameIt: 'SOVRACCARICO!',
    icon: '🌋',
    color: BRICK_PALETTE.fireGlow,
    bonusDamage: 95,
    aoeRadius: 6.0,
  },
};

/**
 * Pure helper (tested in Vitest): detects Fire+Frost, Frost+Shock, or Fire+Shock
 * combined elemental reactions on a Synth-Beast.
 */
export function resolveElementalCombo(
  existingStatus: { burning: boolean; frosted: boolean; stunned: boolean },
  incoming: ElementType,
): ElementalComboId | null {
  if (incoming === 'none') return null;
  if ((incoming === 'fire' && existingStatus.frosted) || (incoming === 'frost' && existingStatus.burning)) {
    return 'thermal-shatter';
  }
  if ((incoming === 'shock' && existingStatus.frosted) || (incoming === 'frost' && existingStatus.stunned)) {
    return 'superconductor';
  }
  if ((incoming === 'shock' && existingStatus.burning) || (incoming === 'fire' && existingStatus.stunned)) {
    return 'overload';
  }
  return null;
}

export type QuickBuildId = 'shield-wall' | 'jump-pad' | 'elem-turret';

export interface QuickBuildDef {
  id: QuickBuildId;
  key: string;
  costPips: number;
  icon: string;
  nameEn: string;
  nameIt: string;
  color: number;
}

export const QUICK_BUILDS: Record<QuickBuildId, QuickBuildDef> = {
  'shield-wall': {
    id: 'shield-wall',
    key: 'Z',
    costPips: 40,
    icon: '🧱',
    nameEn: 'Shield Wall',
    nameIt: 'Muro Scudo',
    color: BRICK_PALETTE.skyBlue,
  },
  'jump-pad': {
    id: 'jump-pad',
    key: 'X',
    costPips: 50,
    icon: '🟢',
    nameEn: 'Jump-Pad',
    nameIt: 'Trampolino',
    color: BRICK_PALETTE.limeGreen,
  },
  'elem-turret': {
    id: 'elem-turret',
    key: 'C',
    costPips: 80,
    icon: '🔫',
    nameEn: 'Elem Turret',
    nameIt: 'Torretta',
    color: BRICK_PALETTE.sunsetOrange,
  },
};

export const QUICK_BUILD_LIST: QuickBuildDef[] = [
  QUICK_BUILDS['shield-wall'],
  QUICK_BUILDS['jump-pad'],
  QUICK_BUILDS['elem-turret'],
];

export type RoguelitePerkId =
  | 'multishot'
  | 'dash-fire'
  | 'ricochet'
  | 'elem-mastery'
  | 'vampiric-pips'
  | 'rapid-special';

export interface RoguelitePerkDef {
  id: RoguelitePerkId;
  icon: string;
  nameEn: string;
  nameIt: string;
  descEn: string;
  descIt: string;
}

export const ROGUELITE_PERKS: RoguelitePerkDef[] = [
  {
    id: 'multishot',
    icon: '🏹',
    nameEn: 'Twin-Brick Volley',
    nameIt: 'Doppio Colpo',
    descEn: 'Fire 2 extra angled projectiles on every attack.',
    descIt: 'Spara 2 proiettili extra angolati a ogni attacco.',
  },
  {
    id: 'dash-fire',
    icon: '🔥',
    nameEn: 'Blazing Dash',
    nameIt: 'Dash Infuocato',
    descEn: 'Dashing leaves an explosive fire blast behind you.',
    descIt: 'Il Dash lascia un’esplosione di fuoco alle tue spalle.',
  },
  {
    id: 'ricochet',
    icon: '🔁',
    nameEn: 'Bouncing Bricks',
    nameIt: 'Rimbalzo Cinetico',
    descEn: 'Projectiles pierce through Synth-Beasts.',
    descIt: 'I proiettili trapassano le Synth-Bestie colpendo più bersagli.',
  },
  {
    id: 'elem-mastery',
    icon: '⚡',
    nameEn: 'Alchemist Core',
    nameIt: 'Nucleo Alchimista',
    descEn: '+40% damage on all attacks and Elemental Combos.',
    descIt: '+40% danno su tutti gli attacchi e le Combo Elementali.',
  },
  {
    id: 'vampiric-pips',
    icon: '❤️',
    nameEn: 'Sanctuary Mender',
    nameIt: 'Riparazione Istantanea',
    descEn: 'Fully heal squad + gain +1 temporary heart.',
    descIt: 'Cura tutta la squadra e aggiunge +1 cuore massimo per la run.',
  },
  {
    id: 'rapid-special',
    icon: '🌀',
    nameEn: 'Overclocked [E]',
    nameIt: 'Speciale Overclock',
    descEn: 'Reduces [E] Ultimate cooldown by 45%.',
    descIt: 'Riduce del 45% il tempo di ricarica della Speciale [E].',
  },
];

export interface SculptureVoxel {
  x: number;
  y: number;
  z: number;
  color: number;
}
