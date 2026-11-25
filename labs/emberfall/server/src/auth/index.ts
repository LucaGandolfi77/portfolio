import type { Server, Socket } from "socket.io";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import type { PlayerManager } from "../world/PlayerManager.js";
import { statsForLevel } from "../combat/formulas.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "emberfall_dev_secret";

interface PlayerEntry {
  socketId: string;
  userId: string;
  username: string;
}

export function setupAuth(
  socket: Socket,
  _io: Server,
  onlinePlayers: Map<string, PlayerEntry>,
  playerManager: PlayerManager
) {
  socket.on("login", async (data: { username: string; password: string }, cb: (res: any) => void) => {
    try {
      const user = await prisma.user.findUnique({ where: { username: data.username } });
      if (!user) return cb({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (!valid) return cb({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });

      onlinePlayers.set(user.id, { socketId: socket.id, userId: user.id, username: user.username });

      cb({ token, userId: user.id, username: user.username });

      // Send existing characters
      const characters = await prisma.character.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, faction: true, classType: true, level: true },
      });
      socket.emit("characters:list", characters);
    } catch (err) {
      console.error("[auth] login error", err);
      cb({ error: "Server error" });
    }
  });

  socket.on("register", async (data: { username: string; password: string }, cb: (res: any) => void) => {
    try {
      if (!data.username || data.username.length < 3 || data.username.length > 20) {
        return cb({ error: "Username must be 3-20 characters" });
      }
      if (!data.password || data.password.length < 4) {
        return cb({ error: "Password must be at least 4 characters" });
      }

      const existing = await prisma.user.findUnique({ where: { username: data.username } });
      if (existing) return cb({ error: "Username already taken" });

      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await prisma.user.create({ data: { username: data.username, passwordHash } });

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "24h" });

      onlinePlayers.set(user.id, { socketId: socket.id, userId: user.id, username: user.username });

      cb({ token, userId: user.id, username: user.username });
    } catch (err) {
      console.error("[auth] register error", err);
      cb({ error: "Server error" });
    }
  });

  socket.on("char:create", async (data: { name: string; faction: string; classType: string }, cb: (res: any) => void) => {
    try {
      const playerEntry = findPlayerBySocket(onlinePlayers, socket.id);
      if (!playerEntry) return cb({ error: "Not authenticated" });

      if (!data.name || data.name.length < 2 || data.name.length > 16) {
        return cb({ error: "Name must be 2-16 characters" });
      }

      const existingName = await prisma.character.findUnique({ where: { name: data.name } });
      if (existingName) return cb({ error: "Name already taken" });

      const charCount = await prisma.character.count({ where: { userId: playerEntry.userId } });
      if (charCount >= 4) return cb({ error: "Max 4 characters per account" });

      const validFactions = ["dawn_covenant", "iron_dominion", "veiled_court"];
      const validClasses = ["vanguard", "ranger", "arcanist", "mystic", "feral"];
      if (!validFactions.includes(data.faction)) return cb({ error: "Invalid faction" });
      if (!validClasses.includes(data.classType)) return cb({ error: "Invalid class" });

      const character = await prisma.character.create({
        data: {
          userId: playerEntry.userId,
          name: data.name,
          faction: data.faction,
          classType: data.classType,
          level: 1,
          xp: 0,
          hp: 100,
          maxHp: 100,
          mana: 50,
          maxMana: 50,
          posX: 0,
          posY: 0,
          posZ: 0,
          stats: JSON.stringify({ might: 10, agility: 10, intellect: 10, vitality: 10, spirit: 10 }),
        },
      });

      cb({ ok: true, character: { id: character.id, name: character.name, faction: character.faction, classType: character.classType, level: character.level } });
    } catch (err) {
      console.error("[auth] char:create error", err);
      cb({ error: "Server error" });
    }
  });

  socket.on("char:select", async (data: { characterId: string }, cb: (res: any) => void) => {
    try {
      const playerEntry = findPlayerBySocket(onlinePlayers, socket.id);
      if (!playerEntry) return cb({ error: "Not authenticated" });

      const character = await prisma.character.findFirst({
        where: { id: data.characterId, userId: playerEntry.userId },
      });
      if (!character) return cb({ error: "Character not found" });

      const stats = statsForLevel(character.classType, character.level);

      cb({
        ok: true,
        character: {
          id: character.id,
          name: character.name,
          faction: character.faction,
          classType: character.classType,
          level: character.level,
          xp: character.xp,
          hp: character.hp,
          maxHp: stats.maxHp,
          mana: character.mana,
          maxMana: stats.maxMana,
          pos: { x: character.posX, y: character.posY, z: character.posZ },
        },
      });

      // Set up server-side player state
      playerManager.set(character.id, {
        id: character.id,
        name: character.name,
        classType: character.classType,
        level: character.level,
        xp: character.xp,
        hp: character.hp,
        maxHp: stats.maxHp,
        mana: character.mana,
        maxMana: stats.maxMana,
        attack: stats.attack,
        defense: stats.defense,
        pos: { x: character.posX, y: character.posY, z: character.posZ },
        inCombatWith: null,
        lastSkillUse: {},
        shieldAbsorb: 0,
        autoAttackCooldown: 0,
      });

      // Broadcast to other players
      socket.broadcast.emit("entity:spawn", {
        id: character.id,
        type: "player",
        name: character.name,
        faction: character.faction,
        classType: character.classType,
        level: character.level,
        pos: { x: character.posX, y: character.posY, z: character.posZ },
      });
    } catch (err) {
      console.error("[auth] char:select error", err);
      cb({ error: "Server error" });
    }
  });
}

function findPlayerBySocket(onlinePlayers: Map<string, PlayerEntry>, socketId: string): PlayerEntry | undefined {
  for (const entry of onlinePlayers.values()) {
    if (entry.socketId === socketId) return entry;
  }
  return undefined;
}
