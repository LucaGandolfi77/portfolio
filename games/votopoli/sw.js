const CACHE = 'votopoli-v2';
const ASSETS = [
  './',
  './index.html',
  './js/save.js',
  './js/haptic.js',
  './js/world.js',
  './js/politicians.js',
  './js/bots.js',
  './js/economy.js',
  './js/cityservices.js',
  './js/housing.js',
  './js/elections.js',
  './js/party.js',
  './js/events.js',
  './js/seasons.js',
  './js/room.js',
  './js/minigames.js',
  './js/achievements.js',
  './js/challenges.js',
  './js/prestige.js',
  './js/share.js',
  './js/onboarding.js',
  './js/sounds.js',
  './js/monetization.js',
  './js/main.js'
];

const RUNTIME_CACHE = 'votopoli-runtime';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Runtime cache for CDN resources (PeerJS, etc.)
  if (url.hostname !== location.hostname) {
    e.respondWith(
      caches.open(RUNTIME_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetched = fetch(e.request).then(resp => {
            if (resp.ok) cache.put(e.request, resp.clone());
            return resp;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Cache-first for local assets
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => {
    // Offline fallback for navigation
    if (e.request.mode === 'navigate') return caches.match('./index.html');
    return new Response('Offline', { status: 503 });
  })));
});
