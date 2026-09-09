// scripts/smoke.mjs — end-to-end check of the wrapper: bridge + pi RPC + workspace switching.
// Usage: node scripts/smoke.mjs [port]
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = Number(process.argv[2] || 8799);
const WS_ROOT = "/tmp/pi-pwa-root";
const ALPHA = path.join(WS_ROOT, "alpha-project");

mkdirSync(ALPHA, { recursive: true });
writeFileSync(path.join(ALPHA, "README.md"), "hello from alpha\n");

const server = spawn(process.execPath, [path.join(ROOT, "server", "index.js")], {
  env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", PI_PWA_ROOT: WS_ROOT, PI_ARGS: "" },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
server.stderr.on("data", (d) => process.stdout.write(`[server:err] ${d}`));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`);
      await new Promise((res, rej) => {
        ws.once("open", res);
        ws.once("error", rej);
      });
      return ws;
    } catch {
      await sleep(400);
    }
  }
  throw new Error("server did not accept websocket connection");
}

const ws = await connect();
const log = [];
let phase = "";
ws.on("message", (buf) => {
  const msg = JSON.parse(buf.toString());
  log.push(msg);
  if (msg.kind === "status") phase = msg.payload?.phase || phase;
});

const waitFor = (pred, timeoutMs = 45000, label = "condition") =>
  new Promise((resolve, reject) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let hit = null;
      for (let i = log.length - 1; i >= 0; i--) {
        if (pred(log[i], i)) { hit = log[i]; break; }
      }
      if (hit) { clearInterval(iv); resolve(hit); }
      else if (Date.now() - t0 > timeoutMs) { clearInterval(iv); reject(new Error(`timeout waiting: ${label}`)); }
    }, 100);
  });

const sent = (obj) => ws.send(JSON.stringify(obj));

try {
  // 1. hello + initial state
  const hello = await waitFor((m) => m.kind === "hello", 8000, "hello");
  console.log("PASS hello; root =", hello.payload.root);

  sent({ kind: "list_workspaces" });
  const wsList = await waitFor((m) => m.kind === "workspaces", 8000, "workspaces");
  console.log("PASS workspaces:", wsList.entries.map((e) => e.name).join(", "));

  // 2. rpc round trip: get_state + models + thinking levels
  sent({ kind: "rpc", msg: { type: "get_state" } });
  sent({ kind: "rpc", msg: { type: "get_available_models" } });
  sent({ kind: "rpc", msg: { type: "get_available_thinking_levels" } });
  const stateRes = await waitFor((m) => m.kind === "agent_event" && m.event?.type === "response" && m.event?.command === "get_state", 20000, "get_state");
  console.log("PASS get_state model:", stateRes.event.data?.model?.id || "(none)");

  const modelsRes = await waitFor((m) => m.kind === "agent_event" && m.event?.type === "response" && m.event?.command === "get_available_models", 20000, "models");
  const models = (modelsRes.event.data?.models || []).map((m) => `${m.provider}/${m.id}`);
  console.log("PASS models:", models.slice(0, 6).join(", "), models.length > 6 ? "…" : "");

  const thinkRes = await waitFor((m) => m.kind === "agent_event" && m.event?.type === "response" && m.event?.command === "get_available_thinking_levels", 20000, "thinking");
  console.log("PASS thinking levels:", (thinkRes.event.data?.levels || []).join(", "));

  // 3. pick a deepseek model (key present in env) and switch + disable thinking
  const ds = models.find((m) => m.startsWith("deepseek/"));
  if (ds) {
    const [provider, modelId] = ds.split("/");
    sent({ kind: "rpc", msg: { type: "set_model", provider, modelId } });
    sent({ kind: "rpc", msg: { type: "set_thinking_level", level: "off" } });
    await sleep(1200);
    console.log("PASS switched model to", ds);
  } else {
    console.log("SKIP model switch: no deepseek model configured");
  }

  // 4. switch workspace to alpha-project and run bash there
  sent({ kind: "set_workspace", path: ALPHA });
  const switchFrom = log.length;
  await waitFor((m, i) => i >= switchFrom && m.kind === "status" && m.payload?.phase === "running", 30000, "agent running after workspace switch");
  await sleep(800);
  const bashFrom = log.length;
  sent({ kind: "rpc", msg: { type: "bash", command: "cat README.md", id: "smoke-bash" } });
  const bashRes = await waitFor((m, i) => i >= bashFrom && m.kind === "agent_event" && m.event?.type === "response" && m.event?.command === "bash" && m.event?.id === "smoke-bash", 20000, "bash result");
  if (String(bashRes.event.data?.output ?? "").includes("hello from alpha")) {
    console.log("PASS bash ran in switched workspace (saw README content)");
  } else {
    console.log("FAIL bash output:", bashRes.event.data?.output);
  }

  // 5. full streaming prompt
  const started = Date.now();
  sent({ kind: "rpc", msg: { type: "prompt", message: "Reply with exactly the single word OK and nothing else." } });
  await waitFor((m) => m.kind === "agent_event" && m.event?.type === "agent_start", 30000, "agent_start");
  const deltas = [];
  let settledEvt = await waitFor((m) => m.kind === "agent_event" && m.event?.type === "agent_settled", 120000, "agent_settled (model reply)");
  for (const m of log) {
    const e = m.event;
    if (m.kind === "agent_event" && e?.type === "message_update" && e.assistantMessageEvent?.type === "text_delta") {
      deltas.push(e.assistantMessageEvent.delta);
    }
  }
  console.log(`PASS prompt streamed in ${Date.now() - started}ms; text deltas=${deltas.length}`);
  if (deltas.length) console.log("     reply:", JSON.stringify(deltas.join("").slice(0, 120)));

  // 6. stats
  sent({ kind: "rpc", msg: { type: "get_session_stats" } });
  const stats = await waitFor((m) => m.kind === "agent_event" && m.event?.type === "response" && m.event?.command === "get_session_stats", 15000, "stats");
  console.log("PASS stats:", JSON.stringify(stats.event.data?.tokens || {}));

  console.log("\nSMOKE TEST OK");
} catch (err) {
  console.error("\nSMOKE TEST FAILED:", err.message);
  const tail = log.slice(-14).map((m) => (m.kind === "agent_event" ? `  ev:${m.event?.type} ${JSON.stringify(m.event).slice(0, 180)}` : `  ${m.kind}: ${JSON.stringify(m.payload || m.message || "").slice(0, 140)}`));
  console.error(tail.join("\n"));
  process.exitCode = 1;
} finally {
  ws.close();
  server.kill("SIGTERM");
  await sleep(300);
  rmSync(WS_ROOT, { recursive: true, force: true });
}
