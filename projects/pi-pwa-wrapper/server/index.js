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
 *   PI_ARGS         extra CLI args passed to every agent (e.g. --extension …)
 *
 * Diagnostics:
 *   GET /healthz     basic health + pi resolution + client count
 *   GET /api/logs    last log entries from the in-memory ring buffer
 */
import http from "node:http";
import { promises as fs, existsSync, createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

import { AgentBridge } from "./agent-bridge.js";
import { listWorkspaces, resolveInsideRoot, workspaceRoot } from "./workspaces.js";
import { resolvePi } from "./pi.js";
import { log, logShort, ring } from "./log.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const TOKEN = process.env.PI_PWA_TOKEN?.trim() || null;
const STARTED_AT = Date.now();

log("boot", {
  static: `http://${HOST}:${PORT}/`,
  root: workspaceRoot(),
  pi: resolvePi(),
  tokenRequired: !!TOKEN,
  node: process.version,
});

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
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        uptimeSec: Math.round((Date.now() - STARTED_AT) / 1000),
        clients: wss.clients.size,
        root: workspaceRoot(),
        pi: resolvePi(),
        tokenRequired: !!TOKEN,
      })
    );
    return;
  }
  if (pathname === "/api/logs") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ entries: ring.all() }));
    return;
  }

  let rel = pathname === "/" ? "/index.html" : pathname;
  const absPath = path.normalize(path.join(PUBLIC_DIR, rel));
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
    log("ws:auth", `rejected connection from ${req.socket.remoteAddress} (bad/missing token)`);
    socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

const ROOT = workspaceRoot();

wss.on("connection", async (ws, req) => {
  const clientId = `c${Math.random().toString(36).slice(2, 8)}`;
  const remote = req.socket.remoteAddress || "unknown";
  const counters = new Map(); // event type -> count
  const cmdCount = new Map(); // rpc command -> count
  log("ws:connect", `${clientId} from ${remote}`);

  const cwd = ROOT;
  const bridge = new AgentBridge({
    cwd,
    onEvent: (event) => {
      const type = event?.type || "unknown";
      counters.set(type, (counters.get(type) || 0) + 1);
      // Log interesting events; count the rest silently.
      if (["response", "extension_ui_request", "extension_error", "agent_stderr"].includes(type) && event) {
        const tag = `ev:${type}`;
        if (type === "response") {
          const ok = event.success ? "ok" : `FAIL(${event.error || ""})`;
          logShort(tag, `[${clientId}] ${event.command} ${ok}${event.data ? " " + JSON.stringify(event.data).slice(0, 220) : ""}`, 420);
        } else if (type === "extension_ui_request") {
          const m = event.method;
          if (["select", "confirm", "input", "editor"].includes(m)) {
            logShort(tag, `[${clientId}] dialog ${m}: ${(event.title || "").slice(0, 120)}`, 240);
          } else {
            logShort(tag, `[${clientId}] fire-and-forget ${m}${event.message ? ": " + event.message.slice(0, 120) : ""}`, 260);
          }
        } else {
          logShort(tag, `[${clientId}] ${JSON.stringify(event).slice(0, 300)}`, 360);
        }
      }
      wsSend({ kind: "agent_event", event });
    },
    onStderr: (text) => {
      counters.set("agent_stderr", (counters.get("agent_stderr") || 0) + 1);
      logShort("ev:agent_stderr", `[${clientId}] ${text.trimEnd()}`, 400);
      wsSend({ kind: "agent_stderr", text });
    },
    onState: (state) => {
      log("ws:agent-state", `[${clientId}] phase=${state.phase} cwd=${state.cwd}${state.error ? " error=" + state.error : ""}`);
      wsSend({ kind: "status", payload: state });
    },
  });

  function wsSend(obj) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj));
    else log("ws:send", `[${clientId}] socket not open, dropping ${obj.kind}`);
  }

  const sendError = (message) => wsSend({ kind: "error", message: String(message) });

  wsSend({ kind: "hello", payload: { root: ROOT, pi: resolvePi(), time: Date.now() } });

  const failGuard = async (fn, label) => {
    try {
      await fn();
    } catch (err) {
      log("ws:error", `[${clientId}] ${label}: ${err?.message || err}`);
      sendError(err?.message || err);
    }
  };

  const handleListWorkspaces = () =>
    failGuard(async () => {
      const entries = await listWorkspaces(ROOT);
      wsSend({ kind: "workspaces", entries });
    }, "list_workspaces");

  const handleSetWorkspace = (p) =>
    failGuard(async () => {
      const next = resolveInsideRoot(ROOT, p);
      if (!existsSync(next)) throw new Error(`No such directory: ${next}`);
      log("ws:workspace", `[${clientId}] switching to ${next}`);
      await bridge.restart(next);
      wsSend({ kind: "workspaces", entries: await listWorkspaces(ROOT) });
    }, "set_workspace");

  const handleRestart = () =>
    failGuard(async () => {
      log("ws:restart", `[${clientId}] restarting agent (fresh session)`);
      await bridge.restart(bridge.cwd);
    }, "restart");

  await failGuard(() => bridge.start(), "agent start");
  await handleListWorkspaces();

  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      log("ws:message", `[${clientId}] invalid JSON from client`);
      sendError("Invalid JSON message");
      return;
    }
    if (!msg || typeof msg !== "object") return;

    if (msg.kind === "rpc") {
      const cmd = msg.msg?.type || "?";
      cmdCount.set(cmd, (cmdCount.get(cmd) || 0) + 1);
      logShort("ws:cmd", `[${clientId}] rpc:${cmd} ${JSON.stringify(msg.msg).slice(0, 200)}`, 320);
      const ok = bridge.send(msg.msg);
      if (!ok) sendError("Agent is not running — try restart, or check the status pill.");
      return;
    }

    log("ws:message", `[${clientId}] kind=${msg.kind}${msg.path ? " path=" + msg.path : ""}`);
    switch (msg.kind) {
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
    log("ws:close", `[${clientId}] events=${JSON.stringify(Object.fromEntries(counters))} cmds=${JSON.stringify(Object.fromEntries(cmdCount))}`);
    bridge.stop().catch((e) => log("ws:close", `[${clientId}] stop error ${e}`));
  });

  ws.on("error", (err) => {
    log("ws:error", `[${clientId}] socket error: ${err?.message || err}`);
    bridge.stop().catch(() => {});
  });
});

server.listen(PORT, HOST, () => {
  log("listen", `listening on ${HOST}:${PORT}`);
});

process.on("uncaughtException", (err) => {
  log("fatal", `uncaughtException: ${err?.stack || err}`);
});
process.on("unhandledRejection", (err) => {
  log("fatal", `unhandledRejection: ${err?.stack || err}`);
});
