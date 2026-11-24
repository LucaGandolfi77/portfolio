/** history.js — cronologia ricerche riutilizzabile. */

const KEY = 'tir.history_v1';
const MAX = 30;

export function loadHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, MAX) : [];
  } catch (e) { return []; }
}
export function addHistory(entry) {
  const list = loadHistory();
  list.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), ...entry });
  const next = list.slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
  return next;
}
export function removeHistory(id) {
  const list = loadHistory().filter((item) => item.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  return list;
}
export function clearHistory() {
  try { localStorage.setItem(KEY, '[]'); } catch (e) {}
  return [];
}
