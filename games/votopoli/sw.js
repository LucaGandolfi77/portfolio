const CACHE = 'votopoli-v1';
const ASSETS = [
  './',
  './index.html',
  './js/save.js',
  './js/world.js',
  './js/politicians.js',
  './js/bots.js',
  './js/economy.js',
  './js/housing.js',
  './js/elections.js',
  './js/events.js',
  './js/room.js',
  './js/minigames.js',
  './js/sounds.js',
  './js/monetization.js',
  './js/main.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('peerjs') || e.request.url.includes('unpkg')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
