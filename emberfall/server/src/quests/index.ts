import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";

interface PlayerEntry {
  socketId: string;
  userId: string;
  username: string;
}

// Quest objective types: kill, collect, talk, interact
interface QuestObjective {
  type: string;
  target: string;
  count: number;
}

export function setupQuests(
  socket: Socket,
  io: Server,
  onlinePlayers: Map<string, PlayerEntry>,
  prisma: PrismaClient
) {
  // Load active quests
  socket.on("quest:load", async (_: unknown, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const progress = await prisma.questProgress.findMany({
      where: { charId: character.id },
      include: { quest: true },
    });

    const active = progress.filter((p) => p.state === "active").map((p) => ({
      id: p.questId,
      name: p.quest.name,
      description: p.quest.description,
      objectives: p.quest.objectives,
      rewards: p.quest.rewards,
      counters: p.counters,
      state: p.state,
    }));

    const completed = progress.filter((p) => p.state === "completed").map((p) => p.questId);

    cb?.({ ok: true, active, completed });
  });

  // Accept quest
  socket.on("quest:accept", async (data: { questId: string }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const quest = await prisma.questDefinition.findUnique({ where: { id: data.questId } });
    if (!quest) return cb?.({ error: "Quest not found" });
    if (quest.levelReq > character.level) return cb?.({ error: `Requires level ${quest.levelReq}` });

    const existing = await prisma.questProgress.findUnique({
      where: { charId_questId: { charId: character.id, questId: data.questId } },
    });
    if (existing && existing.state === "completed") return cb?.({ error: "Already completed" });
    if (existing && existing.state === "active") return cb?.({ error: "Already active" });

    await prisma.questProgress.upsert({
      where: { charId_questId: { charId: character.id, questId: data.questId } },
      create: { charId: character.id, questId: data.questId, state: "active", counters: "{}" },
      update: { state: "active", counters: "{}" },
    });

    cb?.({ ok: true, quest: { id: quest.id, name: quest.name, description: quest.description, objectives: quest.objectives, rewards: quest.rewards } });
  });

  // Progress quest (called by combat when killing mobs, etc.)
  socket.on("quest:progress", async (data: { questId: string; objectiveType: string; target: string; amount?: number }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const progress = await prisma.questProgress.findUnique({
      where: { charId_questId: { charId: character.id, questId: data.questId } },
      include: { quest: true },
    });
    if (!progress || progress.state !== "active") return cb?.({ error: "Quest not active" });

    const objectives = JSON.parse(progress.quest.objectives as string) as QuestObjective[];
    const counters = JSON.parse(progress.counters as string) as Record<string, number>;

    // Find matching objective
    for (const obj of objectives) {
      if (obj.type === data.objectiveType && obj.target === data.target) {
        const key = `${obj.type}:${obj.target}`;
        counters[key] = (counters[key] ?? 0) + (data.amount ?? 1);
      }
    }

    // Check if all objectives complete
    const allDone = objectives.every((obj) => {
      const key = `${obj.type}:${obj.target}`;
      return (counters[key] ?? 0) >= obj.count;
    });

    await prisma.questProgress.update({
      where: { charId_questId: { charId: character.id, questId: data.questId } },
      data: { counters: JSON.stringify(counters) },
    });

    cb?.({ ok: true, counters, allDone });
  });

  // Complete quest and claim rewards
  socket.on("quest:complete", async (data: { questId: string }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const progress = await prisma.questProgress.findUnique({
      where: { charId_questId: { charId: character.id, questId: data.questId } },
      include: { quest: true },
    });
    if (!progress || progress.state !== "active") return cb?.({ error: "Quest not active" });

    // Verify completion
    const objectives = JSON.parse(progress.quest.objectives as string) as QuestObjective[];
    const counters = JSON.parse(progress.counters as string) as Record<string, number>;
    const allDone = objectives.every((obj) => {
      const key = `${obj.type}:${obj.target}`;
      return (counters[key] ?? 0) >= obj.count;
    });
    if (!allDone) return cb?.({ error: "Objectives not complete" });

    // Mark completed
    await prisma.questProgress.update({
      where: { charId_questId: { charId: character.id, questId: data.questId } },
      data: { state: "completed" },
    });

    // Grant rewards
    const rewards = JSON.parse(progress.quest.rewards as string) as { xp?: number; coins?: number; items?: string[] };
    await prisma.character.update({
      where: { id: character.id },
      data: {
        xp: { increment: rewards.xp ?? 0 },
      },
    });

    // Give item rewards
    const grantedItems: any[] = [];
    if (rewards.items) {
      for (const itemId of rewards.items) {
        const item = await prisma.itemInstance.create({
          data: { defId: itemId, ownerId: character.id, location: "inventory" },
          include: { def: true },
        });
        grantedItems.push({ id: item.id, defId: item.defId, name: item.def.name, type: item.def.type, rarity: item.def.rarity });
      }
    }

    cb?.({ ok: true, xp: rewards.xp, coins: rewards.coins, items: grantedItems });

    io.emit("quest:completed", {
      characterId: character.id,
      questId: data.questId,
      questName: progress.quest.name,
    });
  });
}

function findBySocket(onlinePlayers: Map<string, PlayerEntry>, socketId: string): PlayerEntry | undefined {
  for (const entry of onlinePlayers.values()) {
    if (entry.socketId === socketId) return entry;
  }
  return undefined;
}
