/* debug.js — tiny client log ring + global error capture for Pi Agent PWA.
   Exposes window.Dbg = { log, error, all, clear, setSink }.
   Entries are kept in memory (ring) and echoed to the console; the "Logs"
   dialog in app.js reads them via Dbg.all(). */
(function () {
  "use strict";

  const MAX = 400;
  const entries = [];
  let sink = null;

  function push(level, tag, message) {
    const entry = {
      ts: new Date().toISOString().slice(11, 23),
      level,
      tag,
      msg: typeof message === "string" ? message : safe(message),
    };
    entries.push(entry);
    if (entries.length > MAX) entries.splice(0, entries.length - MAX);
    const line = `[${entry.ts}] [${entry.level}/${tag}] ${entry.msg}`;
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
    if (sink) {
      try { sink(entry); } catch (e) { /* never let logging break the app */ }
    }
    return entry;
  }

  function safe(v) {
    if (v === null || v === undefined) return String(v);
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (typeof v === "object") {
      try { return JSON.stringify(v); } catch { return String(v); }
    }
    return String(v);
  }

  const Dbg = {
    log: (tag, msg) => push("log", tag, msg),
    info: (tag, msg) => push("info", tag, msg),
    warn: (tag, msg) => push("warn", tag, msg),
    error: (tag, msg) => push("error", tag, msg),
    all: () => entries.slice(),
    clear: () => { entries.length = 0; },
    setSink: (fn) => { sink = fn; },
  };

  window.Dbg = Dbg;

  // Global error capture — anything that throws is recorded.
  window.addEventListener("error", (e) => {
    Dbg.error("window", `${e.message || e.type} @ ${e.filename || ""}:${e.lineno || "?"}`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    Dbg.error("promise", e.reason);
  });
})();
