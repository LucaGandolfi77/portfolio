/* Royal Derby — service worker */
var CACHE = 'pf-royal-derby-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/app.css',
  './js/sim.js',
  './js/track.js',
  './js/finish3d.js',
  './js/audio.js',
  './js/i18n.js',
  './js/storage.js',
  './js/ui.js',
  './js/main.js',
  '../_shared/top_buttons.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return Promise.allSettled(ASSETS.map(function (url) { return cache.add(url); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) { return key.indexOf('pf-royal-derby-') === 0 && key !== CACHE; })
        .map(function (key) { return caches.delete(key); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function (hit) { return hit || fetch(event.request); })
  );
});
