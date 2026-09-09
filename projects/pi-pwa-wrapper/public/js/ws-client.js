/* ws-client.js — resilient WebSocket client for the pi-pwa bridge. */
(function () {
  "use strict";

  const TOKEN_KEY = "pi-pwa:token";

  class PiWS {
    constructor() {
      this.ws = null;
      this.handlers = {}; // event name -> [fn]
      this.state = "idle"; // idle | connecting | open | closed
      this.reconnectDelay = 800;
      this.handlersMap = this.handlers;
    }

    url() {
      const proto = location.protocol === "https:" ? "wss://" : "ws://";
      const token = this.getToken();
      const q = token ? `?token=${encodeURIComponent(token)}` : "";
      return `${proto}${location.host}/ws${q}`;
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

    connect() {
      if (this.ws && (this.ws.readyState === 0 || this.ws.readyState === 1)) return;
      this.state = "connecting";
      this.emit("state", this.state);
      let ws;
      try {
        ws = new WebSocket(this.url());
      } catch (err) {
        this._scheduleReconnect();
        return;
      }
      this.ws = ws;

      ws.onopen = () => {
        this.state = "open";
        this.reconnectDelay = 800;
        this.openedOnce = true;
        this.failedOpens = 0;
        this.emit("state", this.state);
        this.emit("open");
      };

      ws.onmessage = (ev) => {
        let msg;
        try { msg = JSON.parse(ev.data); } catch (e) { return; }
        this.emit("message", msg);
        if (msg && typeof msg.kind === "string") this.emit(`kind:${msg.kind}`, msg);
      };

      ws.onerror = () => { /* close handler drives reconnect */ };

      ws.onclose = () => {
        const wasOpen = this.state === "open";
        this.state = "closed";
        this.emit("state", this.state);
        this.emit("close", { unexpected: wasOpen });
        if (!wasOpen) {
          this.failedOpens = (this.failedOpens || 0) + 1;
          // never managed to open after several tries: no bridge server here,
          // or an access token is required — stop hammering and tell the UI
          if (this.failedOpens >= 3) {
            this.emit("connect_failed", { attempts: this.failedOpens });
            return;
          }
        }
        this._scheduleReconnect();
      };
    }

    _scheduleReconnect() {
      const delay = this.reconnectDelay;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.7, 15000);
      setTimeout(() => {
        if (document.visibilityState !== "hidden") this.connect();
        else {
          const onVis = () => { document.removeEventListener("visibilitychange", onVis); this.connect(); };
          document.addEventListener("visibilitychange", onVis);
        }
      }, delay);
    }

    send(obj) {
      if (!this.ws || this.ws.readyState !== 1) return false;
      this.ws.send(JSON.stringify(obj));
      return true;
    }

    /** Send an RPC command to pi. Returns true when queued to the bridge. */
    rpc(msg) {
      return this.send({ kind: "rpc", msg });
    }

    /** Ask for a token and reconnect with it. Returns true if a connect was attempted. */
    promptForToken() {
      const token = window.prompt(
        "This server requires an access token (set via PI_PWA_TOKEN).\n\nEnter the token to connect:"
      );
      if (token === null) return false;
      this.setToken(token.trim());
      this.failedOpens = 0;
      this.connect();
      return true;
    }

    /** Manually retry connecting (used by the reconnect UI). */
    retry() {
      this.failedOpens = 0;
      this.connect();
    }

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
        try { fn(data); } catch (e) { console.error("handler error", e); }
      }
    }
  }

  window.PiWS = PiWS;
  window.piWS = new PiWS();
})();
