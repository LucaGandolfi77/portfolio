var CACHE = 'scarlius-v4';
var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './js/phaser.min.js',
  './js/audio.js',
  './js/data.js',
  './js/main.js',
  './js/dialogue.js',
  './js/minigames.js',
  './js/rooms.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(CORE);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || req.url.indexOf('http') !== 0) return;
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        var copy = res.clone();
        if (res && res.ok && req.url.indexOf(self.location.origin) === 0) {
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); }).catch(function () {});
        }
        return res;
      });
    }).catch(function () {
      if (req.mode === 'navigate') return caches.match('./index.html');
    })
  );
});
