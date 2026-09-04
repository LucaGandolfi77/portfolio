import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export function getSocket(): Socket {
  if (!socket) throw new Error("Socket not connected");
  return socket;
}

export function connectSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on("connect", () => {
      console.log("[network] connected", socket!.id);
      resolve();
    });

    socket.on("connect_error", (err) => {
      console.error("[network] connect_error", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[network] disconnected", reason);
    });

    setTimeout(() => reject(new Error("Connection timeout")), 10000);
  });
}
