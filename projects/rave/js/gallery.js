/**
 * gallery.js — galleria snapshot in localStorage.
 */

const KEY = 'rave.gallery_v1';
const MAX = 12;

export function loadGallery() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value.slice(0, MAX) : [];
  } catch (e) { return []; }
}

function persist(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); return true; }
  catch (e) { return false; }
}

export function addSnapshot(dataUrl, style = 'none') {
  const list = loadGallery();
  list.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), dataUrl, style, ts: Date.now() });
  persist(list);
  return list;
}

export function removeSnapshot(id) {
  const list = loadGallery().filter((item) => item.id !== id);
  persist(list);
  return list;
}

export function clearGallery() { persist([]); return []; }

export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);
}
