/* Smile Detection — service worker */
var CACHE = 'pf-smile-detection-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/app.css',
  './js/main.js',
  './js/face.js',
  './js/emotion.js',
  './js/emotion-worker.js',
  './js/fusion.js',
  './js/teeth.js',
  './js/ui.js',
  './js/storage.js',
  './js/i18n.js',
  '../vision-lab/js/vendor/mediapipe/vision_bundle.js',
  '../_shared/top_buttons.js'
];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE)
    .then(function (cache) { return Promise.allSettled(ASSETS.map(function (url) { return cache.add(url); })); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.indexOf('pf-smile-detection-') === 0 && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(function (hit) { return hit || fetch(event.request); }));
});
