// server/agent-bridge.js — one pi RPC subprocess per browser client
import { spawnPiRpc } from "./pi.js";

/**
 * AgentBridge owns a single `pi --mode rpc` child for one WebSocket client.
 * Responsibilities:
 *   - spawn/restart the child in a given working directory
 *   - write RPC commands to stdin (JSONL)
 *   - parse stdout JSONL and forward every event via onEvent
 *   - surface stderr and exit/lifecycle changes via onState/onError
 */
export class AgentBridge {
  /**
   * @param {object} opts
   * @param {string} opts.cwd initial working directory for pi
   * @param {(event: object) => void} opts.onEvent parsed stdout JSON event
   * @param {(text: string) => void} opts.onStderr raw stderr text
   * @param {(state: object) => void} opts.onState lifecycle state updates
   */
  constructor({ cwd, onEvent, onStderr, onState }) {
    this.cwd = cwd;
    this.onEvent = onEvent;
    this.onStderr = onStderr;
    this.onState = onState;
    this.child = null;
    this.requestId = 0;
    this.starting = false;
    this._pendingWrite = false;
    this._writeQueue = [];
  }

  get alive() {
    return this.child !== null && this.child.exitCode === null && !this.starting;
  }

  _setState(patch) {
    this.onState?.({
      alive: this.alive,
      cwd: this.cwd,
      ...patch,
    });
  }

  async start() {
    if (this.child || this.starting) return;
    this.starting = true;
    this._setState({ phase: "starting" });
    try {
      const child = await spawnPiRpc({
        cwd: this.cwd,
        onLine: (ev) => {
          try {
            this.onEvent(ev);
          } catch (err) {
            console.error("[bridge] onEvent threw", err);
          }
        },
        onStderr: (text) => this.onStderr(text),
      });
      // Track unexpected exits so clients see the agent go offline.
      child.on("exit", (code) => {
        if (this.child !== child) return; // intentional stop handled elsewhere
        this.child = null;
        this._setState({ phase: "exited", code });
      });
      this.child = child;
      this._setState({ phase: "running" });
      // the child may have queued writes while starting
      this._drain();
    } catch (err) {
      this._setState({ phase: "failed", error: String(err?.message || err) });
      throw err;
    } finally {
      this.starting = false;
    }
  }

  /** Write one RPC command object. Returns false if the child is unavailable. */
  send(cmd) {
    if (!this.alive) return false;
    const line = JSON.stringify(cmd) + "\n";
    if (this._pendingWrite) {
      this._writeQueue.push(line);
      return true;
    }
    this._write(line);
    return true;
  }

  _write(line) {
    this._pendingWrite = true;
    const child = this.child;
    if (!child?.stdin?.writable) {
      this._pendingWrite = false;
      return;
    }
    child.stdin.write(line, () => {
      this._pendingWrite = false;
      this._drain();
    });
  }

  _drain() {
    if (this._pendingWrite || !this.alive) return;
    const next = this._writeQueue.shift();
    if (next) this._write(next);
  }

  /** Restart pi in the same (or new) directory. */
  async restart(cwd = this.cwd) {
    await this.stop();
    this.cwd = cwd;
    await this.start();
  }

  stop() {
    return new Promise((resolve) => {
      const child = this.child;
      if (!child) {
        this._writeQueue = [];
        resolve();
        return;
      }
      this.child = null;
      this._writeQueue = [];
      child.removeAllListeners("exit");
      child.once("exit", () => resolve());
      child.kill("SIGTERM");
      setTimeout(() => {
        if (child.exitCode === null) child.kill("SIGKILL");
        resolve();
      }, 1500);
    });
  }
}
