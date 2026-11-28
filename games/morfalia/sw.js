/* ===== MORFALIA · Offline Service Worker ===== */
const CACHE_PREFIX = 'morfalia-pwa-';
const CACHE_NAME = `${CACHE_PREFIX}v2.1.0-3d-xl`;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './vendor/three.module.js',
  './src/main.js',
  './src/data/config.js',
  './src/data/items.js',
  './src/data/biomini.js',
  './src/data/habitats.js',
  './src/data/story.js',
  './src/engine/audio.js',
  './src/engine/storage.js',
  './src/engine/worldgen.js',
  './src/engine/simulation.js',
  './src/engine/models3d.js',
  './src/engine/renderer3d.js',
  './src/ui/input.js',
  './src/ui/hud.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('Morfalia SW skipped:', url, err);
          })
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
