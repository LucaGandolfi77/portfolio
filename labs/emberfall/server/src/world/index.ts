import type { Server, Socket } from "socket.io";

interface PlayerEntry {
  socketId: string;
  userId: string;
  username: string;
}

// In-memory world state
const worldState = {
  players: new Map<string, { x: number; y: number; z: number; ry: number; name: string }>(),
};

export function setupWorld(
  socket: Socket,
  _io: Server,
  onlinePlayers: Map<string, PlayerEntry>
) {
  socket.on("move", (data: { x: number; y: number; z: number; ry: number }) => {
    if (
      typeof data.x !== "number" || typeof data.y !== "number" || typeof data.z !== "number" ||
      Math.abs(data.x) > 500 || Math.abs(data.z) > 500 || data.y < -10 || data.y > 50
    ) {
      return;
    }

    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return;

    worldState.players.set(playerEntry.userId, {
      x: data.x,
      y: data.y,
      z: data.z,
      ry: data.ry,
      name: playerEntry.username,
    });

    socket.broadcast.emit("entity:update", {
      id: playerEntry.userId,
      pos: { x: data.x, y: data.y, z: data.z },
      ry: data.ry,
    });
  });

  // Request list of nearby players on join
  socket.on("world:query", (cb: (players: any[]) => void) => {
    const nearby: any[] = [];
    for (const [userId, data] of worldState.players) {
      if (userId !== findBySocket(onlinePlayers, socket.id)?.userId) {
        nearby.push({ id: userId, name: data.name, pos: { x: data.x, y: data.y, z: data.z } });
      }
    }
    cb(nearby);
  });
}

function findBySocket(onlinePlayers: Map<string, PlayerEntry>, socketId: string): PlayerEntry | undefined {
  for (const entry of onlinePlayers.values()) {
    if (entry.socketId === socketId) return entry;
  }
  return undefined;
}
