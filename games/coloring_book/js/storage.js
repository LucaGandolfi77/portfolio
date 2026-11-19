/* Cozy Coloring Book — autosave, gallery and favorites */

const KEY = 'cozy_coloring_v1';
const MAX_ITEMS = 16;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && Array.isArray(data.items) ? data : { items: [], current: null, favorites: [] };
  } catch (e) {
    return { items: [], current: null, favorites: [] };
  }
}

let data = read();

function write() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { /* storage full — drop oldest items and retry */ }
}

export function getState() { return data; }

export function autosave(artCanvas, figureId) {
  const thumb = document.createElement('canvas');
  thumb.width = 150;
  thumb.height = 100;
  thumb.getContext('2d').drawImage(artCanvas, 0, 0, 150, 100);
  data.current = {
    image: artCanvas.toDataURL('image/jpeg', 0.85),
    thumb: thumb.toDataURL('image/jpeg', 0.6),
    figureId,
    saved: Date.now()
  };
  write();
}

export function getCurrent() { return data.current; }

export function saveToGallery(artCanvas, figureId, title) {
  const thumb = document.createElement('canvas');
  thumb.width = 150;
  thumb.height = 100;
  thumb.getContext('2d').drawImage(artCanvas, 0, 0, 150, 100);
  data.items.unshift({
    id: 'art-' + Date.now(),
    image: artCanvas.toDataURL('image/jpeg', 0.88),
    thumb: thumb.toDataURL('image/jpeg', 0.6),
    figureId,
    title,
    saved: Date.now()
  });
  if (data.items.length > MAX_ITEMS) data.items.length = MAX_ITEMS;
  write();
  return data.items[0];
}

export function removeFromGallery(id) {
  data.items = data.items.filter(item => item.id !== id);
  write();
}

export function toggleFavorite(id) {
  const index = data.favorites.indexOf(id);
  if (index >= 0) data.favorites.splice(index, 1);
  else data.favorites.push(id);
  write();
  return data.favorites.includes(id);
}

export function isFavorite(id) { return data.favorites.includes(id); }

export function clearAll() {
  data = { items: [], current: null, favorites: [] };
  write();
}
