/* Face Compare — service worker.
   La shell è versionata; modello e WASM di MediaPipe vengono cachati al primo uso. */
var CACHE = 'pf-face-compare-shell-v2';

var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/app.css',
  './js/app.js',
  './js/metrics.js',
  './js/face-engine.js',
  './js/i18n.js',
  './js/storage.js',
  '../_shared/top_buttons.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE)
      .then(function (cache) { return Promise.allSettled(CORE.map(function (u) { return cache.add(u); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) { return key.indexOf('pf-face-compare-') === 0 && key !== CACHE; })
        .map(function (key) { return caches.delete(key); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isModelAsset(url) {
  return url.indexOf('face_landmarker.task') !== -1 ||
    url.indexOf('vision_bundle.js') !== -1 ||
    url.indexOf('/wasm/') !== -1;
}

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = event.request.url;
  event.respondWith(
    caches.match(event.request).then(function (hit) {
      if (hit) return hit;
      return fetch(event.request).then(function (response) {
        if (response && response.ok && isModelAsset(url)) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return response;
      });
    })
  );
});
