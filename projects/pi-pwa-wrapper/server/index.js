#!/usr/bin/env node
/**
 * pi-pwa-wrapper — WebSocket bridge + static server for a PWA shell around pi.
 *
 *  Browser (PWA)
 *      │  WebSocket  ws://host:8787/ws
 *      ▼
 *  server/index.js  (one AgentBridge per connection)
 *      │  JSONL over stdin/stdout
 *      ▼
 *  pi --mode rpc --no-session  (working dir = selected workspace)
 *
 * Env:
 *   PORT            default 8787
 *   HOST            default 0.0.0.0
 *   PI_PWA_ROOT     root directory for workspace browsing (default: server cwd)
 *   PI_PWA_TOKEN    if set, WebSocket clients must pass ?token= to connect
 *   PI_BINARY       override pi launch (executable path/name, or a .js path run with node)
 */
import http from "node:http";
import { promises as fs, existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

import { AgentBridge } from "./agent-bridge.js";
import { listWorkspaces, resolveInsideRoot, workspaceRoot } from "./workspaces.js";
import { resolvePi } from "./pi.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const TOKEN = process.env.PI_PWA_TOKEN?.trim() || null;

// ---------------------------------------------------------------------------
// Static file serving (dependency-free, dev-friendly)
// ---------------------------------------------------------------------------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function sendFile(res, absPath) {
  const ext = path.extname(absPath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(absPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  const absPath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!absPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const st = await fs.stat(absPath);
    if (st.isFile()) {
      sendFile(res, absPath);
      return;
    }
  } catch {
    /* fallthrough to 404 */
  }
  res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
});

// ---------------------------------------------------------------------------
// WebSocket bridge
// ---------------------------------------------------------------------------
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 * 1024 });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }
  if (TOKEN && url.searchParams.get("token") !== TOKEN) {
    socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

const ROOT = workspaceRoot();
console.log(`[pi-pwa] static  http://127.0.0.1:${PORT}/`);
console.log(`[pi-pwa] ws      ws://127.0.0.1:${PORT}/ws`);
console.log(`[pi-pwa] root    ${ROOT}`);
console.log(`[pi-pwa] pi      ${JSON.stringify(resolvePi())}`);
if (TOKEN) console.log("[pi-pwa] token   required (PI_PWA_TOKEN)");

wss.on("connection", async (ws) => {
  const cwd = ROOT;
  const bridge = new AgentBridge({
    cwd,
    onEvent: (event) => wsSend({ kind: "agent_event", event }),
    onStderr: (text) => wsSend({ kind: "agent_stderr", text }),
    onState: (state) => wsSend({ kind: "status", payload: state }),
  });

  function wsSend(obj) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
  }

  const sendError = (message) => wsSend({ kind: "error", message: String(message) });

  wsSend({ kind: "hello", payload: { root: ROOT, pi: resolvePi(), time: Date.now() } });

  const failGuard = async (fn) => {
    try {
      await fn();
    } catch (err) {
      sendError(err?.message || err);
    }
  };

  // handshake helpers -------------------------------------------------------
  const handleListWorkspaces = () =>
    failGuard(async () => {
      const entries = await listWorkspaces(ROOT);
      wsSend({ kind: "workspaces", entries });
    });

  const handleSetWorkspace = (p) =>
    failGuard(async () => {
      const next = resolveInsideRoot(ROOT, p);
      if (!existsSync(next)) throw new Error(`No such directory: ${next}`);
      await bridge.restart(next);
      wsSend({ kind: "workspaces", entries: await listWorkspaces(ROOT) });
    });

  const handleRestart = () => failGuard(() => bridge.restart(bridge.cwd));

  // Start the agent
  await failGuard(async () => {
    await bridge.start();
  });
  await handleListWorkspaces();

  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      sendError("Invalid JSON message");
      return;
    }
    if (!msg || typeof msg !== "object") return;

    switch (msg.kind) {
      case "rpc": {
        const ok = bridge.send(msg.msg);
        if (!ok) sendError("Agent is not running — try restart, or check the status pill.");
        break;
      }
      case "list_workspaces":
        handleListWorkspaces();
        break;
      case "set_workspace":
        handleSetWorkspace(msg.path);
        break;
      case "restart":
        handleRestart();
        break;
      case "status":
        wsSend({ kind: "status", payload: { phase: bridge.alive ? "running" : "starting", cwd: bridge.cwd } });
        break;
      default:
        sendError(`Unknown message kind: ${msg.kind}`);
    }
  });

  ws.on("close", () => {
    bridge.stop().catch(() => {});
  });

  ws.on("error", () => {
    bridge.stop().catch(() => {});
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[pi-pwa] listening on ${HOST}:${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("[pi-pwa] uncaught", err);
});
