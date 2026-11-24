/* Battleship Commander — service worker (PWA completa offline) */
var CACHE = 'pf-battleship-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/main.js',
  './js/config.js',
  './js/sim.js',
  './js/missions.js',
  './js/economy.js',
  './js/render.js',
  './js/input.js',
  './js/ui.js',
  '../../top_buttons.js',
  '../_kit/storage.js',
  '../_kit/progression.js',
  '../_kit/meta-layer.js',
  '../_kit/campaign.js',
  '../_kit/pwa.js',
  '../_kit/audio.js',
  '../_kit/fx.js',
  '../_kit/a11y.css'
];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE)
    .then(function (cache) { return Promise.allSettled(ASSETS.map(function (url) { return cache.add(url); })); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.indexOf('pf-battleship-') === 0 && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
      return response;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }
  event.respondWith(caches.match(event.request).then(function (hit) { return hit || fetch(event.request); }));
});
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
