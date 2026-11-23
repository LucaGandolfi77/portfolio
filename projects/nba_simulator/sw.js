/* Service Worker — NBA Broadcast Simulator v2 */
const CACHE = 'nba-v3';
const CORE = [
  './', './index.html', './offline.html', './manifest.webmanifest', './style.css',
  './js/app.js', './js/i18n.js', './js/audio.js',
  './js/core/rng.js', './js/core/storage.js',
  './js/data/teams.js', './js/data/player-stats.js', './js/data/player-profile.js', './js/data/player-notes.js',
  './js/sim/engine.js', './js/sim/ai.js', './js/sim/commentary.js',
  './js/sim/stats.js', './js/sim/season.js', './js/sim/playoffs.js', './js/sim/career.js',
  './js/render/court-gl.js', './js/render/court-2d.js', './js/render/avatar.js', '../../games/_vendor/three.module.js', './js/worker/sim.worker.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png', './icons/apple-touch-icon.png',
  '../_shared/tokens.css', '../_shared/base.css', '../_shared/shell.css', '../_shared/shell.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(CORE.map(u => c.add(u))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('nba-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(async () => (await caches.match(e.request)) || (await caches.match('./index.html')) || (await caches.match('./offline.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match('./offline.html'))));
});
