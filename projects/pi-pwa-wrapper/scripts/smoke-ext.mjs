// scripts/smoke-ext.mjs — verify the extension-UI round trip through the wrapper.
// Starts the server with the demo extension, drives dialogs, checks toasts/widgets.
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2] || 8798);
const WS_ROOT = "/tmp/pi-pwa-ext-root";
mkdirSync(WS_ROOT, { recursive: true });

const EXT = path.join(ROOT, "examples-extension", "pwa-demo.js");
const server = spawn(process.execPath, [path.join(ROOT, "server", "index.js")], {
  env: {
    ...process.env,
    PORT: String(PORT), HOST: "127.0.0.1", PI_PWA_ROOT: WS_ROOT,
    PI_ARGS: `--extension ${EXT}`,
  },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", () => {});
server.stderr.on("data", () => {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
      await new Promise((res, rej) => { ws.once("open", res); ws.once("error", rej); });
      return ws;
    } catch { await sleep(400); }
  }
  throw new Error("no ws");
}

const ws = await connect();
const log = [];
ws.on("message", (buf) => {
  const m = JSON.parse(buf.toString());
  log.push(m);
});

const waitFor = (pred, timeoutMs = 25000, label = "cond") =>
  new Promise((resolve, reject) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let hit = null;
      for (let i = log.length - 1; i >= 0; i--) if (pred(log[i], i)) { hit = log[i]; break; }
      if (hit) { clearInterval(iv); resolve(hit); }
      else if (Date.now() - t0 > timeoutMs) { clearInterval(iv); reject(new Error(`timeout: ${label}`)); }
    }, 80);
  });

const ev = (m) => (m.kind === "agent_event" ? m.event : null);
const uiReq = (method) => (m) => ev(m)?.type === "extension_ui_request" && ev(m)?.method === method;
const notifyText = (t) => (m) => ev(m)?.type === "extension_ui_request" && ev(m)?.method === "notify" && String(ev(m)?.message).includes(t);

// Auto-answer dialog requests as they arrive
ws.on("message", (buf) => {
  const m = JSON.parse(buf.toString());
  const e = ev(m);
  if (e?.type === "extension_ui_request" && ["select", "confirm", "input", "editor"].includes(e.method)) {
    const answer = e.method === "confirm" ? { confirmed: false }
      : e.method === "select" ? { value: "Red" }
      : e.method === "editor" ? { value: "edited text" }
      : { cancelled: true };
    setTimeout(() => ws.send(JSON.stringify({ kind: "rpc", msg: { type: "extension_ui_response", id: e.id, ...answer } })), 250);
  }
});

const sent = (o) => ws.send(JSON.stringify(o));
const command = (name) => sent({ kind: "rpc", msg: { type: "prompt", message: name } });

try {
  await waitFor((m) => m.kind === "hello", 8000, "hello");
  await sleep(1500); // let session_start extension events land

  // startup widget + status from session_start
  await waitFor(uiReq("setWidget"), 8000, "startup setWidget");
  console.log("PASS extension loaded; setWidget on session_start");

  command("/pwa-ping");
  await waitFor(notifyText("pwa-demo is loaded"), 10000, "notify ping");
  console.log("PASS /pwa-ping -> notify toast event");

  command("/pwa-confirm");
  await waitFor(uiReq("confirm"), 10000, "confirm dialog");
  await waitFor(notifyText("Declined"), 10000, "confirm declined notify");
  console.log("PASS /pwa-confirm dialog answered (cancelled) -> notify");

  command("/pwa-select");
  await waitFor(uiReq("select"), 10000, "select dialog");
  await waitFor(notifyText("You picked Red"), 10000, "select notify");
  console.log("PASS /pwa-select dialog answered (Red) -> notify");

  command("/pwa-input");
  await waitFor(uiReq("input"), 10000, "input dialog");
  await waitFor(notifyText("Input cancelled"), 10000, "input cancel notify");
  console.log("PASS /pwa-input dialog cancelled -> notify");

  command("/pwa-editor");
  await waitFor(uiReq("editor"), 10000, "editor dialog");
  await waitFor(notifyText("Editor submitted"), 10000, "editor submit notify");
  console.log("PASS /pwa-editor dialog answered -> notify");

  command("/pwa-widget");
  await waitFor(notifyText("Widget hidden"), 10000, "widget toggle notify");
  console.log("PASS /pwa-widget toggle -> widget cleared + notify");

  console.log("\nEXTENSION SMOKE TEST OK");
} catch (err) {
  console.error("\nEXTENSION SMOKE TEST FAILED:", err.message);
  const tail = log.slice(-16).map((m) => {
    const e = ev(m);
    return e ? `  ev:${e.type} ${JSON.stringify(e).slice(0, 170)}` : `  ${m.kind}`;
  });
  console.error(tail.join("\n"));
  process.exitCode = 1;
} finally {
  ws.close();
  server.kill("SIGTERM");
  await sleep(300);
  rmSync(WS_ROOT, { recursive: true, force: true });
}
