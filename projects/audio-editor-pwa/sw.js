// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
/* ===================================================
   🎚 Audio Editor PWA — Service Worker
   Cache-first: l'app offline funziona su localhost/https;
   via file:// funziona comunque senza caching.
   =================================================== */
const CACHE = 'audio-editor-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './project.js',
  './wav.js',
  './mp3.js',
  './audio.js',
  './waveform.js',
  './store.js',
  './st-global.js',
  './vendor/lame.min.js',
  './vendor/soundtouch.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.replace(/-[^-]*$/, '') === CACHE.replace(/-[^-]*$/, '')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
