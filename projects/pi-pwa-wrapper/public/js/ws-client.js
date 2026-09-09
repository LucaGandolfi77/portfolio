/* ws-client.js — resilient WebSocket client for the pi-pwa bridge.
   Talks to <server>/ws. The server origin can be overridden (the app may be
   hosted statically while the pi bridge runs on another host/port):
     - URL param      ?server=http://host:8787   (or ws(s)://…)
     - localStorage   pi-pwa:server
     - otherwise      same origin as the page
*/
(function () {
  "use strict";

  const TOKEN_KEY = "pi-pwa:token";
  const SERVER_KEY = "pi-pwa:server";
  const D = window.Dbg;

  class PiWS {
    constructor() {
      this.ws = null;
      this.handlers = {}; // event name -> [fn]
      this.state = "idle"; // idle | connecting | open | closed
      this.reconnectDelay = 800;
      this.failedOpens = 0;
      this.openedOnce = false;
    }

    /* ---------------- server base helpers ---------------- */

    storedServer() {
      try { return localStorage.getItem(SERVER_KEY) || ""; } catch (e) { return ""; }
    }

    queryServer() {
      const params = new URLSearchParams(location.search);
      const s = params.get("server");
      if (s) {
        try { localStorage.setItem(SERVER_KEY, s); } catch (e) {}
      }
      return s || "";
    }

    getServerBase() {
      return this.queryServer() || this.storedServer();
    }

    setServerBase(base) {
      const b = String(base || "").trim().replace(/\/+$/, "");
      try {
        if (b) localStorage.setItem(SERVER_KEY, b);
        else localStorage.removeItem(SERVER_KEY);
      } catch (e) {}
      D.log("server", b ? `bridge server override → ${b}` : "bridge server = same origin");
    }

    getToken() {
      const params = new URLSearchParams(location.search);
      if (params.get("token")) {
        try { localStorage.setItem(TOKEN_KEY, params.get("token")); } catch (e) {}
        return params.get("token");
      }
      try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; }
    }

    setToken(token) {
      try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
      } catch (e) {}
    }

    /** Full ws:// URL of the bridge, honoring overrides. */
    wsUrl() {
      const base = this.getServerBase();
      let origin;
      if (base) {
        // accept http(s)://… or ws(s)://…
        origin = /^wss?:/i.test(base) ? base : base.replace(/^http/i, "ws");
      } else {
        const proto = location.protocol === "https:" ? "wss://" : "ws://";
        origin = `${proto}${location.host}`;
      }
      const token = this.getToken();
      const q = token ? `?token=${encodeURIComponent(token)}` : "";
      return `${origin.replace(/\/+$/, "")}/ws${q}`;
    }

    /** Same origin as wsUrl but for http fetches (logs etc.), "" if unknown. */
    httpBase() {
      const base = this.getServerBase();
      if (!base) return location.origin;
      return /^wss?:/i.test(base) ? base.replace(/^ws/, "http").replace(/^wss/, "https") : base.replace(/\/+$/, "");
    }

    /* ---------------- connection lifecycle ---------------- */

    connect() {
      if (this.ws && (this.ws.readyState === 0 || this.ws.readyState === 1)) return;
      this.state = "connecting";
      this.emit("state", this.state);
      D.log("ws", `connecting ${this.wsUrl().split("?")[0]}`);
      let ws;
      try {
        ws = new WebSocket(this.wsUrl());
      } catch (err) {
        D.error("ws", `WebSocket construction failed: ${err}`);
        this._scheduleReconnect();
        return;
      }
      this.ws = ws;

      ws.onopen = () => {
        this.state = "open";
        this.reconnectDelay = 800;
        this.openedOnce = true;
        this.failedOpens = 0;
        D.log("ws", "open");
        this.emit("state", this.state);
        this.emit("open");
      };

      ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) {
          D.error("ws", `unparseable message: ${String(ev.data).slice(0, 120)}`);
          return;
        }
        this.emit("message", msg);
        if (msg && typeof msg.kind === "string") this.emit(`kind:${msg.kind}`, msg);
      };

      ws.onerror = (err) => {
        D.warn("ws", `socket error: ${err && err.message ? err.message : "see close event"}`);
      };

      ws.onclose = (ev) => {
        const wasOpen = this.state === "open";
        this.state = "closed";
        D.warn("ws", `closed code=${ev.code} reason="${ev.reason || ""}" wasOpen=${wasOpen}`);
        this.emit("state", this.state);
        this.emit("close", { unexpected: wasOpen, code: ev.code });
        if (!wasOpen) {
          this.failedOpens = (this.failedOpens || 0) + 1;
          if (this.failedOpens >= 3) {
            D.error("ws", `gave up after ${this.failedOpens} failed attempts (no bridge server? token needed?)`);
            this.emit("connect_failed", { attempts: this.failedOpens, code: ev.code });
            return;
          }
        }
        this._scheduleReconnect();
      };
    }

    _scheduleReconnect() {
      const delay = this.reconnectDelay;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.7, 15000);
      D.log("ws", `reconnect in ${Math.round(delay)}ms`);
      setTimeout(() => {
        if (document.visibilityState !== "hidden") this.connect();
        else {
          const onVis = () => { document.removeEventListener("visibilitychange", onVis); this.connect(); };
          document.addEventListener("visibilitychange", onVis);
        }
      }, delay);
    }

    send(obj) {
      if (!this.ws || this.ws.readyState !== 1) {
        D.warn("ws", `drop send while ${this.state}: ${obj.kind}`);
        return false;
      }
      this.ws.send(JSON.stringify(obj));
      return true;
    }

    /** Send an RPC command to pi. Returns true when queued to the bridge. */
    rpc(msg) {
      D.log("rpc→", msg.type);
      return this.send({ kind: "rpc", msg });
    }

    retry() {
      D.log("ws", "manual retry");
      // close any live socket first so a new server override can take effect
      const w = this.ws;
      if (w) {
        try { w.onclose = null; w.close(); } catch (e) {}
      }
      this.ws = null;
      this.failedOpens = 0;
      this.connect();
    }

    /* ---------------- events ---------------- */

    on(name, fn) {
      (this.handlers[name] = this.handlers[name] || []).push(fn);
      return () => this.off(name, fn);
    }

    off(name, fn) {
      const arr = this.handlers[name];
      if (!arr) return;
      const i = arr.indexOf(fn);
      if (i !== -1) arr.splice(i, 1);
    }

    emit(name, data) {
      const arr = this.handlers[name];
      if (!arr) return;
      for (const fn of arr.slice()) {
        try { fn(data); } catch (e) { D.error("ws", `handler[${name}] threw: ${e}`); }
      }
    }
  }

  window.PiWS = PiWS;
  window.piWS = new PiWS();
})();
