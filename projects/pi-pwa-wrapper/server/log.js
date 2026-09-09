// server/log.js — tiny ring-buffer logger shared by server endpoints.
// Every entry is pushed to an in-memory ring (visible at GET /api/logs) and
// printed to stdout with a timestamped prefix.

const MAX = 500;

class Ring {
  constructor(limit = MAX) {
    this.limit = limit;
    this.entries = [];
  }
  push(entry) {
    this.entries.push(entry);
    if (this.entries.length > this.limit) this.entries.splice(0, this.entries.length - this.limit);
  }
  all() {
    return this.entries.slice();
  }
  clear() {
    this.entries = [];
  }
}

export const ring = new Ring();

function safeString(v) {
  if (typeof v === "string") return v;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Log one structured entry. Returns the entry. */
export function log(tag, details) {
  const entry = { ts: new Date().toISOString(), tag, msg: safeString(details) };
  ring.push(entry);
  const line = `[${entry.ts.slice(11, 23)}] [${tag}] ${entry.msg}`;
  console.log(line);
  return entry;
}

/** Log and truncate a possibly-long string for console sanity. */
export function logShort(tag, details, maxLen = 300) {
  let s = safeString(details);
  if (s.length > maxLen) s = s.slice(0, maxLen) + `… (${details.length} chars)`;
  return log(tag, s);
}
