/* Service Worker — Radio PWA */
const CACHE_VERSION = 'radio-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './offline.html',
  './js/stations.js',
  './js/api.js',
  './js/storage.js',
  './js/player.js',
  './js/ui.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.allSettled(ASSETS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('radio-') === 0 && k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // API: network-first, ultima risposta riuscita in cache
  if (url.hostname.indexOf('radio-browser.info') >= 0) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then(cached => cached || new Response('[]', { headers: { 'Content-Type': 'application/json' } })))
    );
    return;
  }

  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then(cached => cached || caches.match('./index.html') || caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response && response.status === 200) {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(() => caches.match('./icons/icon-192.png')))
  );
});
