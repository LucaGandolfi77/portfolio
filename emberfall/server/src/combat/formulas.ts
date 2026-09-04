// Centralized combat formulas — server authoritative

export interface DamageInput {
  attackerLevel: number;
  attackerAttack: number;
  attackerMagicAttack?: number;
  targetDefense: number;
  targetLevel: number;
  skillPower?: number;  // multiplier from skill
  isCrit?: boolean;
  critChance?: number;
  critDamage?: number;
}

export interface DamageResult {
  raw: number;
  mitigated: number;
  isCrit: boolean;
  final: number;
}

export function calculateDamage(input: DamageInput): DamageResult {
  const base = input.attackerAttack + (input.skillPower ?? 0);
  const levelDiff = Math.max(0, input.attackerLevel - input.targetLevel);
  const levelBonus = 1 + levelDiff * 0.03;

  const raw = base * levelBonus;

  // Defense mitigation:  reduces by a %, capped at 80%
  const defMitigation = Math.min(0.8, input.targetDefense / (input.targetDefense + 100 + input.targetLevel * 5));
  const mitigated = raw * (1 - defMitigation);

  // Crit check
  const critChance = input.critChance ?? 0.05;
  const critDamage = input.critDamage ?? 1.5;
  const isCrit = input.isCrit ?? (Math.random() < critChance);

  const final = Math.max(1, Math.round(isCrit ? mitigated * critDamage : mitigated));

  return { raw: Math.round(raw), mitigated: Math.round(mitigated), isCrit, final };
}

// XP required for level
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.5, level - 1));
}

// Stats per level for each class
export function statsForLevel(classType: string, level: number): {
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
} {
interface ClassStats {
  maxHp: number;
  maxMana: number;
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
}

const BASE_STATS: Record<string, ClassStats> = {
  vanguard: { maxHp: 120, maxMana: 30, attack: 12, defense: 10, magicAttack: 2, magicDefense: 5 },
  ranger:   { maxHp: 90,  maxMana: 40, attack: 14, defense: 6,  magicAttack: 3, magicDefense: 6 },
  arcanist: { maxHp: 70,  maxMana: 80, attack: 4,  defense: 4,  magicAttack: 16, magicDefense: 10 },
  mystic:   { maxHp: 80,  maxMana: 70, attack: 5,  defense: 5,  magicAttack: 12, magicDefense: 12 },
  feral:    { maxHp: 100, maxMana: 40, attack: 13, defense: 7,  magicAttack: 5, magicDefense: 5 },
};

  const b = (BASE_STATS[classType] ?? BASE_STATS.vanguard) as ClassStats;
  const growth = 1 + (level - 1) * 0.12;

  return {
    maxHp: Math.round(b.maxHp * growth),
    maxMana: Math.round(b.maxMana * growth),
    attack: Math.round(b.attack * (1 + (level - 1) * 0.08)),
    defense: Math.round(b.defense * (1 + (level - 1) * 0.06)),
    magicAttack: Math.round(b.magicAttack * (1 + (level - 1) * 0.08)),
    magicDefense: Math.round(b.magicDefense * (1 + (level - 1) * 0.06)),
  };
}

// Skill definitions for Vanguard (MVP)
export interface SkillDef {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number; // ms
  power: number;    // extra damage
  range: number;
  aoe: number;      // 0 = single target
  description: string;
}

export const VANGUARD_SKILLS: SkillDef[] = [
  { id: "shield_bash", name: "Shield Bash", manaCost: 10, cooldown: 3000, power: 5, range: 2, aoe: 0, description: "Slam your shield. Stuns for 1s." },
  { id: "whirlwind", name: "Whirlwind", manaCost: 20, cooldown: 6000, power: 12, range: 0, aoe: 4, description: "Spin attack hitting all nearby enemies." },
  { id: "iron_bulwark", name: "Iron Bulwark", manaCost: 15, cooldown: 10000, power: 0, range: 0, aoe: 0, description: "Shield yourself, absorbing next 30 damage." },
];
