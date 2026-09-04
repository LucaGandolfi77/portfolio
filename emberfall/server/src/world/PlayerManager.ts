// In-memory player state — server authoritative

export interface PlayerCombatState {
  id: string;
  name: string;
  classType: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  pos: { x: number; y: number; z: number };
  // Combat
  inCombatWith: string | null; // mob id
  lastSkillUse: Record<string, number>; // skillId -> timestamp
  shieldAbsorb: number; // Iron Bulwark remaining
  // Cooldowns
  autoAttackCooldown: number;
}

export class PlayerManager {
  players = new Map<string, PlayerCombatState>();

  set(id: string, state: PlayerCombatState) {
    this.players.set(id, state);
  }

  get(id: string): PlayerCombatState | undefined {
    return this.players.get(id);
  }

  delete(id: string) {
    this.players.delete(id);
  }

  getPositions(): Map<string, { x: number; y: number; z: number }> {
    const out = new Map();
    for (const [id, p] of this.players) {
      out.set(id, p.pos);
    }
    return out;
  }
}
