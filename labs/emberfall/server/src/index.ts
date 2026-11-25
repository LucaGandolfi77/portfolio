import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { setupAuth } from "./auth/index.js";
import { setupWorld } from "./world/index.js";
import { setupCombat } from "./combat/index.js";
import { setupChat } from "./chat/index.js";
import { setupInventory } from "./items/index.js";
import { setupQuests } from "./quests/index.js";
import { MobManager } from "./world/MobManager.js";
import { PlayerManager } from "./world/PlayerManager.js";
import { PrismaClient } from "@prisma/client";

const PORT = parseInt(process.env.PORT || "3001", 10);
const TICK_RATE = parseInt(process.env.TICK_RATE || "20", 10);
const TICK_MS = 1000 / TICK_RATE;

const prisma = new PrismaClient();
const mobManager = new MobManager();
const playerManager = new PlayerManager();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), mobs: mobManager.mobs.size, players: playerManager.players.size });
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["websocket"],
});

// Track connected players
const onlinePlayers = new Map<string, { socketId: string; userId: string; username: string }>();

io.on("connection", (socket) => {
  console.log(`[server] socket connected: ${socket.id}`);

  setupAuth(socket, io, onlinePlayers, playerManager);
  setupWorld(socket, io, onlinePlayers);
  setupCombat(socket, io, onlinePlayers, mobManager, playerManager, prisma);
  setupChat(socket, io, onlinePlayers);
  setupInventory(socket, io, onlinePlayers, prisma);
  setupQuests(socket, io, onlinePlayers, prisma);

  socket.on("disconnect", (reason) => {
    console.log(`[server] socket disconnected: ${socket.id} (${reason})`);
    for (const [userId, data] of onlinePlayers) {
      if (data.socketId === socket.id) {
        onlinePlayers.delete(userId);
        playerManager.delete(userId);
        io.emit("entity:destroy", { id: userId });
        break;
      }
    }
  });
});

// Game tick
let lastTick = Date.now();

setInterval(() => {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  lastTick = now;

  // Mob AI tick
  const result = mobManager.tick(dt, playerManager.getPositions());

  for (const evt of result.events) {
    switch (evt.type) {
      case "mob:aggro":
        io.emit("mob:aggro", { mobId: evt.mobId, targetId: evt.targetId });
        break;
      case "mob:move":
        io.emit("mob:move", { mobId: evt.mobId, pos: evt.pos });
        break;
      case "mob:attack": {
        const target = playerManager.get(evt.targetId!);
        if (target) {
          const dmg = Math.max(1, evt.damage! - Math.round(target.defense * 0.5));
          target.hp = Math.max(0, target.hp - dmg);
          io.to(onlinePlayers.get(evt.targetId!)?.socketId ?? "").emit("combat:damage", {
            sourceId: evt.mobId,
            targetId: evt.targetId,
            amount: dmg,
            isCrit: false,
            sourceType: "mob",
          });
          if (target.hp <= 0) {
            io.to(onlinePlayers.get(evt.targetId!)?.socketId ?? "").emit("player:death", {
              id: evt.targetId,
            });
          }
        }
        break;
      }
    }
  }

  // Broadcast mob positions (batched)
  if (mobManager.mobs.size > 0) {
    const mobPositions: Record<string, any> = {};
    for (const [id, mob] of mobManager.mobs) {
      if (mob.state !== "dead") {
        mobPositions[id] = {
          defId: mob.defId,
          name: mob.name,
          level: mob.level,
          hp: mob.hp,
          maxHp: mob.maxHp,
          pos: mob.pos,
          state: mob.state,
          type: mob.type,
        };
      }
    }
    io.emit("mobs:sync", mobPositions);
  }
}, TICK_MS);

httpServer.listen(PORT, () => {
  console.log(`[emberfall] Server listening on :${PORT} (${TICK_RATE}Hz)`);
  console.log(`[emberfall] Mobs loaded: ${mobManager.mobs.size}`);
});
