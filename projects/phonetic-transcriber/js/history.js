/**
 * history.js — storico trascrizioni con persistenza e import/export.
 */

const KEY = 'phon_trans_hist_v2';
const MAX = 60;

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, MAX) : [];
  } catch (e) { return []; }
}
function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); return true; } catch (e) { return false; }
}

export function loadHistory() { return read(); }

export function addEntry(entry) {
  const list = read();
  list.unshift({
    ortho: String(entry.ortho || ''),
    ipa: String(entry.ipa || ''),
    key: String(entry.key || ''),
    engine: String(entry.engine || 'heuristic'),
    voice: String(entry.voice || 'it'),
    whisperLang: entry.whisperLang || 'manuale',
    source: String(entry.source || 'manuale'),
    ts: Date.now()
  });
  write(list);
  return list;
}

export function removeEntry(index) {
  const list = read();
  if (index < 0 || index >= list.length) return list;
  list.splice(index, 1);
  write(list);
  return list;
}

export function clearHistory() { write([]); return []; }

export function searchHistory(list, query) {
  const needle = String(query || '').toLowerCase().trim();
  if (!needle) return list;
  return list.filter((item) => (item.ortho + ' ' + item.ipa + ' ' + item.key + ' ' + item.voice).toLowerCase().includes(needle));
}

export function toJSON(list) { return JSON.stringify(list, null, 2); }

export function fromJSON(text) {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Formato non valido');
  const list = parsed.slice(0, MAX).map((item) => ({
    ortho: String(item.ortho || ''), ipa: String(item.ipa || ''), key: String(item.key || ''),
    engine: String(item.engine || 'heuristic'), voice: String(item.voice || 'it'),
    whisperLang: item.whisperLang || 'import', source: String(item.source || 'import'), ts: Number(item.ts) || Date.now()
  }));
  write(list);
  return list;
}
