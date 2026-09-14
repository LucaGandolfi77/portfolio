const CACHE_VERSION = 'arcade-lab-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png',
  './src/particles.js',
  './src/audio.js',
  './src/i18n.js',
  './src/save.js',
  './src/analytics.js',
  './src/touch.js',
  './src/ads.js',
  './src/session.js',
  './src/translations.js',
  './games/tap.js',
  './games/memory.js',
  './games/sequence.js',
  './games/route.js',
  './games/trivia.js',
  './games/rogue.js',
  './games/physics.js',
  './games/rhythm.js',
  './games/escape.js',
  './games/football.js',
  './games/typing.js',
  './games/pattern.js',
  './games/wordlock.js',
  './games/simon.js',
  './games/colormix.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('./offline.html'))
    );
  } else {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          return response;
        });
      }).catch(() => {
        if (request.destination === 'image') return caches.match('./icons/icon-192.png');
        return new Response('Offline', { status: 503 });
      })
    );
  }
});
