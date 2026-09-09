// server/pi.js — locate and spawn a `pi --mode rpc` process
import { spawn, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";

/**
 * Resolve how to launch the pi CLI.
 * Priority:
 *   1. PI_BINARY env var.
 *      - a path ending in .js/.cjs/.mjs is run with the current node binary
 *      - otherwise it is treated as an executable name or path
 *   2. `pi` found on PATH
 *   3. The globally installed package entry point:
 *      $(npm root -g)/@earendil-works/pi-coding-agent/dist/bundle/cli.js (run with node)
 * Returns { command, argsPrefix } where spawning is spawn(command, [...argsPrefix, ...cliArgs]).
 */
export function resolvePi() {
  const override = process.env.PI_BINARY?.trim();
  if (override) {
    if (/\.(js|cjs|mjs)$/i.test(override)) {
      return { command: process.execPath, argsPrefix: [override] };
    }
    return { command: override, argsPrefix: [] };
  }

  // pi on PATH
  try {
    execFileSync("which", ["pi"], { stdio: "ignore" });
    return { command: "pi", argsPrefix: [] };
  } catch {
    /* not on PATH */
  }

  // global npm package
  try {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    const candidates = [
      path.join(root, "@earendil-works", "pi-coding-agent", "dist", "bundle", "cli.js"),
      path.join(root, "@earendil-works", "pi-coding-agent", "dist", "cli.js"),
    ];
    const cli = candidates.find((c) => existsSync(c));
    if (cli) return { command: process.execPath, argsPrefix: [cli] };
  } catch {
    /* npm unavailable */
  }

  // ~/.pi fallback scan (pnpm/yarn installs, bun, etc.)
  const home = homedir();
  const scans = [
    path.join(home, ".pi", "dist", "bundle", "cli.js"),
    path.join(home, ".local", "share", "pi", "dist", "bundle", "cli.js"),
  ];
  for (const c of scans) {
    if (existsSync(c)) return { command: process.execPath, argsPrefix: [c] };
  }

  return null;
}

/**
 * Launch a pi rpc subprocess in `cwd`.
 * Returns the ChildProcess. Resolves/rejects asynchronously: if the process
 * exits before the first stdout line (common failure when pi can't start),
 * the promise rejects with whatever stderr said.
 */
export function spawnPiRpc({ cwd, env = {}, onLine, onStderr, name = "pi-pwa" }) {
  return new Promise((resolve, reject) => {
    const resolved = resolvePi();
    if (!resolved) {
      reject(new Error("Could not locate a pi installation. Set PI_BINARY or install pi (see README)."));
      return;
    }

    // optional extra CLI args, e.g. PI_ARGS='--extension /path/demo.ts --no-approve'
    const extra = tokenize(process.env.PI_ARGS || "");
    const args = [...resolved.argsPrefix, "--mode", "rpc", "--no-session", "--name", name, ...extra];
    let child;
    try {
      child = spawn(resolved.command, args, {
        cwd,
        env: { ...process.env, ...env },
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch (err) {
      reject(err);
      return;
    }

    let stderr = "";
    let settled = false;
    let stdoutBuffer = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      onStderr?.(chunk.toString());
    });

    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(child);
    };

    child.on("error", (err) => finish(err));

    // JSONL framing: split strictly on \n, tolerate trailing \r.
    child.stdout.on("data", (chunk) => {
      stdoutBuffer += chunk.toString("utf8");
      let idx;
      while ((idx = stdoutBuffer.indexOf("\n")) !== -1) {
        let line = stdoutBuffer.slice(0, idx);
        stdoutBuffer = stdoutBuffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.trim()) continue;
        let parsed;
        try {
          parsed = JSON.parse(line);
        } catch {
          onStderr?.(`[pi non-JSON output] ${line}\n`);
          continue;
        }
        onLine(parsed);
        finish(null); // pi is alive and talking
      }
    });

    // If the process dies before talking, surface stderr as the error.
    child.on("exit", (code) => {
      if (!settled) {
        const detail = stderr.trim() ? `: ${stderr.trim().split("\n").slice(-4).join(" | ")}` : "";
        finish(new Error(`pi exited before starting (code ${code})${detail}`));
      }
    });

    // Give it a bounded amount of time to say anything before failing fast.
    const startupTimer = setTimeout(() => finish(null), 4000);
    child.once("exit", () => clearTimeout(startupTimer));
  });
}

/** Split a shell-ish arg string honoring single/double quotes. */
function tokenize(s) {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}
