/* Galleria foto locale con IndexedDB e Web Share */

const DB_NAME = 'camera_tracker_gallery';
const STORE = 'photos';
const MAX_PHOTOS = 40;

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB non disponibile')); return; }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction(mode, action) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    try { result = action(store); } catch (e) { reject(e); return; }
    tx.oncomplete = () => resolve(result && result.result !== undefined ? result.result : result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function savePhoto(dataUrl, filter) {
  const photo = { id: String(Date.now()), dataUrl, filter: filter || 'normal', createdAt: Date.now() };
  await transaction('readwrite', store => store.put(photo));
  const all = await listPhotos();
  if (all.length > MAX_PHOTOS) {
    const extra = all.slice(0, all.length - MAX_PHOTOS);
    for (const item of extra) await deletePhoto(item.id);
  }
  return photo;
}

export async function listPhotos() {
  const all = await transaction('readonly', store => store.getAll());
  return (all || []).slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function deletePhoto(id) {
  return transaction('readwrite', store => store.delete(id));
}

export async function clearPhotos() {
  return transaction('readwrite', store => store.clear());
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/jpeg';
  const binary = atob(parts[1]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function sharePhoto(photo) {
  const blob = dataUrlToBlob(photo.dataUrl);
  const file = new File([blob], 'camera-tracker-' + photo.id + '.jpg', { type: blob.type });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Camera Tracker' });
    return 'shared';
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'camera-tracker-' + photo.id + '.jpg';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}
