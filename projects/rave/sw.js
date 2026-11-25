/* RAVE — service worker */
var CACHE = 'pf-rave-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './app.css',
  './style.css',
  './manifest.webmanifest',
  './icon.svg',
  './shaders.js',
  './js/main.js',
  './js/styles.js',
  './js/shader-engine.js',
  './js/camera.js',
  './js/recorder.js',
  './js/voice.js',
  './js/settings.js',
  './js/gallery.js',
  './js/i18n.js',
  '../../top_buttons.js'
];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE)
    .then(function (cache) { return Promise.allSettled(ASSETS.map(function (url) { return cache.add(url); })); })
    .then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.indexOf('pf-rave-') === 0 && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(function (hit) { return hit || fetch(event.request); }));
});
