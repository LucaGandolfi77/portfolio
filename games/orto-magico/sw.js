/* Orto Magico — service worker (GitHub Pages / PWA completa) */
var CACHE = 'pf-orto-magico-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-512.png',
  './js/main.js',
  './js/config.js',
  './js/garden.js',
  './js/modes.js',
  './js/progress.js',
  './js/share.js',
  './js/audio.js',
  './js/ui.js'
];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE)
    .then(function (cache) { return Promise.allSettled(ASSETS.map(function (url) { return cache.add(url); })); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.indexOf('pf-orto-magico-') === 0 && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(function (hit) {
    if (hit) return hit;
    return fetch(event.request).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
      }
      return response;
    });
  }));
});
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
