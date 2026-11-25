import { v4 as uuid } from "uuid";
import { MOB_DEFS, GREENVALE_SPAWNS, LOOT_TABLES, type MobDefinition } from "@emberfall/shared/content/mobs";

export interface MobState {
  id: string;
  defId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  pos: { x: number; y: number; z: number };
  spawnPos: { x: number; y: number; z: number };
  state: "idle" | "chasing" | "attacking" | "dead";
  targetId: string | null;
  lastAttackTime: number;
  def: MobDefinition;
  aggroRange: number;
  deaggroRange: number;
  attackRange: number;
  attackCooldown: number;
  type: "normal" | "elite" | "boss";
}

export class MobManager {
  mobs = new Map<string, MobState>();

  constructor() {
    this.spawnAll();
  }

  spawnAll() {
    for (const sp of GREENVALE_SPAWNS) {
      const def = MOB_DEFS[sp.mobDefId];
      if (!def) continue;
      for (let i = 0; i < sp.count; i++) {
        this.spawnMob(def, sp);
      }
    }
  }

  private spawnMob(def: MobDefinition, sp: { x: number; z: number; radius: number }) {
    const id = uuid();
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * sp.radius;
    const mob: MobState = {
      id,
      defId: def.id,
      name: def.name,
      level: def.level,
      hp: def.hp,
      maxHp: def.hp,
      attack: def.attack,
      defense: def.defense,
      speed: def.speed,
      pos: { x: sp.x + Math.cos(angle) * dist, y: 0, z: sp.z + Math.sin(angle) * dist },
      spawnPos: { x: sp.x, y: 0, z: sp.z },
      state: "idle",
      targetId: null,
      lastAttackTime: 0,
      def,
      aggroRange: def.aggroRange,
      deaggroRange: def.deaggroRange,
      attackRange: def.attackRange,
      attackCooldown: def.attackCooldown,
      type: def.type,
    };
    this.mobs.set(id, mob);
  }

  // Called every tick — returns events to broadcast
  tick(dt: number, players: Map<string, { x: number; y: number; z: number }>): MobTickResult {
    const events: MobTickEvent[] = [];

    for (const mob of this.mobs.values()) {
      if (mob.state === "dead") continue;

      // Find closest player
      let closestId: string | null = null;
      let closestDist = Infinity;
      for (const [pid, pos] of players) {
        const dx = mob.pos.x - pos.x;
        const dz = mob.pos.z - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < closestDist) {
          closestDist = dist;
          closestId = pid;
        }
      }

      // State machine
      switch (mob.state) {
        case "idle": {
          if (closestId && closestDist <= mob.aggroRange) {
            mob.state = "chasing";
            mob.targetId = closestId;
            events.push({ type: "mob:aggro", mobId: mob.id, targetId: closestId });
          }
          break;
        }
        case "chasing": {
          if (!closestId || closestDist > mob.deaggroRange) {
            mob.state = "idle";
            mob.targetId = null;
            break;
          }
          if (closestDist <= mob.attackRange) {
            mob.state = "attacking";
            break;
          }
          // Move toward target
          const target = players.get(closestId);
          if (target) {
            const dx = target.x - mob.pos.x;
            const dz = target.z - mob.pos.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            if (len > 0.1) {
              mob.pos.x += (dx / len) * mob.speed * dt;
              mob.pos.z += (dz / len) * mob.speed * dt;
            }
          }
          events.push({ type: "mob:move", mobId: mob.id, pos: { ...mob.pos } });
          break;
        }
        case "attacking": {
          if (!closestId || closestDist > mob.deaggroRange) {
            mob.state = "idle";
            mob.targetId = null;
            break;
          }
          if (closestDist > mob.attackRange * 1.5) {
            mob.state = "chasing";
            break;
          }
          // Attack
          const now = Date.now();
          if (now - mob.lastAttackTime >= mob.attackCooldown) {
            mob.lastAttackTime = now;
            events.push({
              type: "mob:attack",
              mobId: mob.id,
              targetId: closestId,
              damage: mob.attack,
            });
          }
          break;
        }
      }
    }

    return { events };
  }

  damage(mobId: string, amount: number): MobState | null {
    const mob = this.mobs.get(mobId);
    if (!mob || mob.state === "dead") return null;

    const mitigated = Math.max(1, amount - mob.defense);
    mob.hp -= mitigated;

    if (mob.hp <= 0) {
      mob.hp = 0;
      mob.state = "dead";
      mob.targetId = null;

      // Schedule respawn
      const def = mob.def;
      const sp = GREENVALE_SPAWNS.find((s) => s.mobDefId === def.id);
      if (sp) {
        setTimeout(() => {
          this.mobs.delete(mobId);
          this.spawnMob(def, sp);
        }, def.respawnTime);
      }
    }

    return mob;
  }

  getLoot(defId: string): Array<{ itemId: string; qty: number }> {
    const table = LOOT_TABLES[MOB_DEFS[defId]?.lootTableId ?? ""];
    if (!table) return [];

    const drops: Array<{ itemId: string; qty: number }> = [];
    for (const entry of table) {
      if (Math.random() < entry.dropRate) {
        const qty = entry.minQty + Math.floor(Math.random() * (entry.maxQty - entry.minQty + 1));
        drops.push({ itemId: entry.itemId, qty });
      }
    }
    return drops;
  }
}

export interface MobTickEvent {
  type: "mob:aggro" | "mob:move" | "mob:attack";
  mobId: string;
  targetId?: string;
  pos?: { x: number; y: number; z: number };
  damage?: number;
}

export interface MobTickResult {
  events: MobTickEvent[];
}
