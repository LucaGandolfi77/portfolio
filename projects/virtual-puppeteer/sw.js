/* Virtual Puppeteer — service worker */
var CACHE = 'pf-puppeteer-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './js/main.js',
  './js/config.js',
  './js/rig.js',
  './js/tracking.js',
  './js/scene.js',
  './js/render.js',
  './js/audio.js',
  './js/speech.js',
  './js/recorder.js',
  './js/ui.js',
  '../vision-lab/js/vendor/mediapipe/vision_bundle.js',
  '../tracker/model/hand_landmarker.task',
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
      return key.indexOf('pf-puppeteer-') === 0 && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(function (hit) { return hit || fetch(event.request); }));
});
