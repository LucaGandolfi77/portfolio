import type { Server, Socket } from "socket.io";

interface PlayerEntry {
  socketId: string;
  userId: string;
  username: string;
}

export function setupChat(
  socket: Socket,
  io: Server,
  onlinePlayers: Map<string, PlayerEntry>
) {
  socket.on("chat:send", (data: { channel: string; message: string }) => {
    if (!data.message || typeof data.message !== "string") return;
    const msg = data.message.trim().slice(0, 500); // 500 char limit
    if (!msg) return;

    const playerEntry = findBySocket(onlinePlayers, socket.id);
    if (!playerEntry) return;

    const channel = data.channel || "local";

    io.emit("chat:message", {
      channel,
      sender: playerEntry.username,
      senderId: playerEntry.userId,
      message: msg,
      ts: Date.now(),
    });
  });
}

function findBySocket(onlinePlayers: Map<string, PlayerEntry>, socketId: string): PlayerEntry | undefined {
  for (const entry of onlinePlayers.values()) {
    if (entry.socketId === socketId) return entry;
  }
  return undefined;
}
