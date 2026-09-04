import type { Server, Socket } from "socket.io";
import type { PrismaClient } from "@prisma/client";

interface PlayerEntry {
  socketId: string;
  userId: string;
  username: string;
}

export function setupInventory(
  socket: Socket,
  io: Server,
  onlinePlayers: Map<string, PlayerEntry>,
  prisma: PrismaClient
) {
  // Load inventory on char select
  socket.on("inv:load", async (_: unknown, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const items = await prisma.itemInstance.findMany({
      where: { ownerId: character.id },
      include: { def: true },
    });

    const inventory = items
      .filter((i) => i.location === "inventory")
      .map((i) => ({
        id: i.id,
        defId: i.defId,
        name: i.def.name,
        type: i.def.type,
        rarity: i.def.rarity,
        levelReq: i.def.levelReq,
        classReq: i.def.classReq,
        baseStats: i.def.baseStats,
        description: i.def.description,
        sellValue: i.def.sellValue,
        slotIdx: i.slotIdx,
        upgradeLvl: i.upgradeLvl,
        affixes: i.affixes,
      }));

    const equipment = items
      .filter((i) => i.location === "equipment")
      .map((i) => ({
        id: i.id,
        defId: i.defId,
        name: i.def.name,
        type: i.def.type,
        rarity: i.def.rarity,
        baseStats: i.def.baseStats,
        description: i.def.description,
        upgradeLvl: i.upgradeLvl,
      }));

    cb?.({ ok: true, inventory, equipment });
  });

  // Equip item
  socket.on("inv:equip", async (data: { itemId: string }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const item = await prisma.itemInstance.findFirst({
      where: { id: data.itemId, ownerId: character.id, location: "inventory" },
      include: { def: true },
    });
    if (!item) return cb?.({ error: "Item not found" });

    // Check level/class requirements
    if (item.def.levelReq > character.level) {
      return cb?.({ error: `Requires level ${item.def.levelReq}` });
    }
    if (item.def.classReq && item.def.classReq !== character.classType) {
      return cb?.({ error: `Requires class: ${item.def.classReq}` });
    }

    // Map item type to slot index
    const slotMap: Record<string, number> = {
      weapon: 0, helmet: 1, armor: 2, gloves: 3, boots: 4,
      belt: 5, ring: 6, necklace: 7, bracelet: 8, charm: 9,
    };
    const slotIdx = slotMap[item.def.type] ?? -1;
    if (slotIdx === -1) return cb?.({ error: "Cannot equip this item type" });

    // Unequip existing item in that slot
    const current = await prisma.itemInstance.findFirst({
      where: { ownerId: character.id, location: "equipment", slotIdx },
    });
    if (current) {
      await prisma.itemInstance.update({
        where: { id: current.id },
        data: { location: "inventory", slotIdx: null },
      });
    }

    // Equip new item
    await prisma.itemInstance.update({
      where: { id: item.id },
      data: { location: "equipment", slotIdx },
    });

    cb?.({ ok: true, slotIdx, itemId: item.id });
    io.emit("inv:updated", { characterId: character.id });
  });

  // Unequip item
  socket.on("inv:unequip", async (data: { itemId: string }, cb?: (res: any) => void) => {
    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return cb?.({ error: "Not authenticated" });

    const character = await prisma.character.findFirst({
      where: { userId: playerEntry.userId },
    });
    if (!character) return cb?.({ error: "No character" });

    const item = await prisma.itemInstance.findFirst({
      where: { id: data.itemId, ownerId: character.id, location: "equipment" },
    });
    if (!item) return cb?.({ error: "Item not equipped" });

    await prisma.itemInstance.update({
      where: { id: item.id },
      data: { location: "inventory", slotIdx: null },
    });

    cb?.({ ok: true });
    io.emit("inv:updated", { characterId: character.id });
  });

  // Give item (server-side, called after loot)
  socket.on("inv:giveItem", async (data: { characterId: string; defId: string }, cb?: (res: any) => void) => {
    const item = await prisma.itemInstance.create({
      data: {
        defId: data.defId,
        ownerId: data.characterId,
        location: "inventory",
      },
      include: { def: true },
    });

    cb?.({
      ok: true,
      item: {
        id: item.id,
        defId: item.defId,
        name: item.def.name,
        type: item.def.type,
        rarity: item.def.rarity,
        baseStats: item.def.baseStats,
        description: item.def.description,
      },
    });
  });
}

function findBySocket(onlinePlayers: Map<string, PlayerEntry>, socketId: string): PlayerEntry | undefined {
  for (const entry of onlinePlayers.values()) {
    if (entry.socketId === socketId) return entry;
  }
  return undefined;
}
