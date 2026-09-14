var CACHE_NAME = 'scalpel2-v1';
var URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icon.svg',
  './css/main.css',
  './css/menu.css',
  './css/surgery.css',
  './css/effects.css',
  './js/save.js',
  './js/data/instruments.js',
  './js/data/patients.js',
  './js/data/chapters.js',
  './js/data/procedures.js',
  './js/data/organs.js',
  './js/data/difficulty.js',
  './js/data/sounds.js',
  './js/engine/state.js',
  './js/engine/renderer.js',
  './js/engine/input.js',
  './js/engine/audio.js',
  './js/engine/timer.js',
  './js/engine/particles.js',
  './js/gameplay/steps.js',
  './js/gameplay/scoring.js',
  './js/gameplay/complications.js',
  './js/gameplay/powerups.js',
  './js/gameplay/progression.js',
  './js/ui/overlay.js',
  './js/ui/hud.js',
  './js/ui/dialogue.js',
  './js/ui/menu.js',
  './js/ui/toast.js',
  './js/modes/story.js',
  './js/modes/sandbox.js',
  './js/modes/daily.js',
  './js/app.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
