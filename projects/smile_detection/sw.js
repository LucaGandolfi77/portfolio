/* Smile Detection — service worker */
var CACHE = 'pf-smile-detection-shell-v2';
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
  '../vision-lab/js/vendor/mediapipe/wasm/vision_wasm_internal.js',
  '../vision-lab/js/vendor/mediapipe/wasm/vision_wasm_internal.wasm',
  '../vision-lab/js/vendor/mediapipe/wasm/vision_wasm_nosimd_internal.js',
  '../vision-lab/js/vendor/mediapipe/wasm/vision_wasm_nosimd_internal.wasm',
  '../vision-lab/model/face_landmarker.task',
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

  // Network-first per le pagine: le correzioni devono raggiungere anche chi torna.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response.ok) {
            var copy = response.clone();
            caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (hit) {
            return hit || caches.match('./index.html');
          });
        })
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(function (hit) { return hit || fetch(event.request); }));
});
