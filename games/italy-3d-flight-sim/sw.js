const CACHE = 'italy-3d-flight-sim-v2';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png',
  './data/italy-height.bin', './data/italy-meta.json', './data/italy-vector.json',
  './data/imagery-manifest.json', './data/imagery-list.json', './data/buildings.json',
  './js/config.js', './js/geo.js', './js/flight.js', './js/terrain.js', './js/planes.js',
  './js/render.js', './js/traffic.js', './js/game.js', './js/main.js',
  './js/imagery.js', './js/buildings.js',
  '../_vendor/three.module.js', '../../top_buttons.js',
  '../_kit/core.js', '../_kit/storage.js', '../_kit/i18n.js', '../_kit/audio.js', '../_kit/pwa.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(ASSETS);
    try {
      const res = await fetch('./data/imagery-list.json');
      const list = await res.json();
      await Promise.all(list.map(url => c.add(url).catch(() => {})));
    } catch (err) { /* imagery list is optional */ }
    await self.skipWaiting();
  }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return r;
  })));
});
