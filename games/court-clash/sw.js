/* Court Clash — offline cache */
const CACHE = 'court-clash-v2';
const CORE = [
  './', './index.html', './offline.html', './manifest.webmanifest', './style.css',
  './js/app.js', './js/i18n.js', './js/audio.js',
  './js/core/rng.js', './js/core/theme.js', './js/core/storage.js',
  './js/data/teams.js', './js/data/player-stats.js', './js/data/player-profile.js', './js/data/chest-fx.js',
  './js/game/economy.js', './js/game/collection.js', './js/game/chests.js',
  './js/game/lineup.js', './js/game/markets.js', './js/game/progression.js', './js/game/missions.js', './js/game/lab.js', './js/game/events.js',
  './js/sim/engine.js', './js/sim/ai.js', './js/sim/commentary.js', './js/sim/stats.js', './js/sim/career-mode.js',
  './js/render/chest.js', './js/render/mini-avatar.js',
  './js/ui/chest-opening.js',
  '../../games/_vendor/three.module.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png', './icons/apple-touch-icon.png', './icons/icon.svg', './icons/icon-maskable.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => Promise.allSettled(CORE.map(url => cache.add(url))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('court-clash-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('./index.html')) || (await caches.match('./offline.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
    return response;
  }).catch(() => caches.match('./offline.html'))));
});
