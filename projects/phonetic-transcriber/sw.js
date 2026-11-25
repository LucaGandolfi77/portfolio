/* Phonetic Transcriber — service worker */
var CACHE = 'pf-phonetic-transcriber-shell-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/app.css',
  './js/main.js',
  './js/g2p.js',
  './js/asr.js',
  './js/audio.js',
  './js/phonetics.js',
  './js/language.js',
  './js/compare.js',
  './js/history.js',
  './js/i18n.js',
  './js/ui.js',
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
      return key.indexOf('pf-phonetic-transcriber-') === 0 && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(function (hit) { return hit || fetch(event.request); }));
});
