import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";
import type { MobManager } from "../world/MobManager.js";
import type { PlayerManager } from "../world/PlayerManager.js";
import { calculateDamage, xpForLevel, VANGUARD_SKILLS, type SkillDef } from "./formulas.js";

interface PlayerEntry {
  socketId: string;
  userId: string;
  username: string;
}

export function setupCombat(
  socket: Socket,
  io: Server,
  onlinePlayers: Map<string, PlayerEntry>,
  mobManager: MobManager,
  playerManager: PlayerManager,
  prisma: PrismaClient
) {
  // Auto-attack on a mob (called repeatedly by client while in range)
  socket.on("combat:attack", async (data: { targetId: string }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const player = playerManager.get(playerEntry.userId);
    if (!player) return cb?.({ error: "No character" });

    const mob = mobManager.mobs.get(data.targetId);
    if (!mob || mob.hp <= 0) return cb?.({ error: "Invalid target" });

    // Cooldown check (auto-attack every 1.5s)
    const now = Date.now();
    if (now - player.autoAttackCooldown < 1500) {
      return cb?.({ error: "Too fast" });
    }
    player.autoAttackCooldown = now;

    const result = calculateDamage({
      attackerLevel: player.level,
      attackerAttack: player.attack,
      targetDefense: mob.defense,
      targetLevel: mob.level,
    });

    const killedMob = mobManager.damage(data.targetId, result.final);
    if (!killedMob) return cb?.({ error: "Target dead" });

    cb?.({
      ok: true,
      damage: result.final,
      isCrit: result.isCrit,
      mobHp: killedMob.hp,
      mobMaxHp: killedMob.maxHp,
      killed: killedMob.hp <= 0,
    });

    io.emit("combat:damage", {
      sourceId: player.id,
      targetId: data.targetId,
      amount: result.final,
      isCrit: result.isCrit,
      sourceType: "player",
    });

    // If killed — award XP, coins, loot
    if (killedMob.hp <= 0) {
      const mobDef = killedMob.def;
      player.xp += mobDef.xpReward;

      // Check level up
      const xpNeeded = xpForLevel(player.level);
      if (player.xp >= xpNeeded) {
        player.level++;
        player.xp -= xpNeeded;
        socket.emit("player:levelup", { level: player.level, xp: player.xp, xpNext: xpForLevel(player.level) });

        // Update DB
        prisma.character.update({
          where: { id: player.id },
          data: { level: player.level, xp: player.xp },
        }).catch(() => {});
      }

      // Loot
      const loot = mobManager.getLoot(mobDef.id);
      const grantedItems: any[] = [];

      for (const drop of loot) {
        for (let i = 0; i < drop.qty; i++) {
          const item = await prisma.itemInstance.create({
            data: { defId: drop.itemId, ownerId: player.id, location: "inventory" },
            include: { def: true },
          });
          grantedItems.push({
            id: item.id,
            defId: item.defId,
            name: item.def.name,
            type: item.def.type,
            rarity: item.def.rarity,
            baseStats: item.def.baseStats,
            description: item.def.description,
          });
        }
      }

      io.emit("mob:kill", {
        mobId: data.targetId,
        mobDefId: mobDef.id,
        killerId: player.id,
        xp: mobDef.xpReward,
        coins: mobDef.coinDrop,
        loot: grantedItems,
      });

      // Track quest progress for kill objectives
      const activeQuests = await prisma.questProgress.findMany({
        where: { charId: player.id, state: "active" },
        include: { quest: true },
      });
      for (const qp of activeQuests) {
        const objectives = JSON.parse(qp.quest.objectives as string) as Array<{ type: string; target: string; count: number }>;
        for (const obj of objectives) {
          if (obj.type === "kill" && obj.target === mobDef.id) {
            const counters = JSON.parse(qp.counters as string) as Record<string, number>;
            const key = `kill:${mobDef.id}`;
            counters[key] = (counters[key] ?? 0) + 1;
            await prisma.questProgress.update({
              where: { charId_questId: { charId: player.id, questId: qp.questId } },
              data: { counters: JSON.stringify(counters) },
            });
            socket.emit("quest:progress:update", { questId: qp.questId, counters });
          }
        }
      }

      // Update DB
      prisma.character.update({
        where: { id: player.id },
        data: { xp: player.xp },
      }).catch(() => {});
    }
  });

  // Skill cast
  socket.on("combat:cast", (data: { skillId: string; targetId?: string }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const player = playerManager.get(playerEntry.userId);
    if (!player) return cb?.({ error: "No character" });

    const skill: SkillDef | undefined = VANGUARD_SKILLS.find((s) => s.id === data.skillId);
    if (!skill) return cb?.({ error: "Unknown skill" });

    const now = Date.now();
    if (now - (player.lastSkillUse[skill.id] ?? 0) < skill.cooldown) {
      return cb?.({ error: "Cooldown" });
    }
    if (player.mana < skill.manaCost) {
      return cb?.({ error: "Not enough mana" });
    }

    player.mana -= skill.manaCost;
    player.lastSkillUse[skill.id] = now;

    // Shield Bash — single target stun
    if (skill.id === "shield_bash" && data.targetId) {
      const mob = mobManager.mobs.get(data.targetId);
      if (mob && mob.hp > 0) {
        const result = calculateDamage({
          attackerLevel: player.level,
          attackerAttack: player.attack,
          targetDefense: mob.defense,
          targetLevel: mob.level,
          skillPower: skill.power,
        });
        mobManager.damage(data.targetId, result.final);
        io.emit("combat:damage", { sourceId: player.id, targetId: data.targetId, amount: result.final, isCrit: result.isCrit, sourceType: "player" });
        io.emit("combat:status", { targetId: data.targetId, status: "stun", duration: 1000 });
      }
    }

    // Whirlwind — AoE
    if (skill.id === "whirlwind") {
      for (const mob of mobManager.mobs.values()) {
        if (mob.hp <= 0) continue;
        const dx = mob.pos.x - player.pos.x;
        const dz = mob.pos.z - player.pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist <= skill.aoe) {
          const result = calculateDamage({
            attackerLevel: player.level,
            attackerAttack: player.attack,
            targetDefense: mob.defense,
            targetLevel: mob.level,
            skillPower: skill.power,
          });
          mobManager.damage(mob.id, result.final);
          io.emit("combat:damage", { sourceId: player.id, targetId: mob.id, amount: result.final, isCrit: result.isCrit, sourceType: "player" });
        }
      }
    }

    // Iron Bulwark — shield
    if (skill.id === "iron_bulwark") {
      player.shieldAbsorb = 30;
    }

    cb?.({ ok: true, mana: player.mana });
  });
}

function findBySocket(onlinePlayers: Map<string, PlayerEntry>, socketId: string): PlayerEntry | undefined {
  for (const entry of onlinePlayers.values()) {
    if (entry.socketId === socketId) return entry;
  }
  return undefined;
}
