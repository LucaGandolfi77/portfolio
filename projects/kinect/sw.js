/* Service Worker — Kinetic v2 */
const CACHE = 'kinect-v2';
const CORE = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './kinect.css', './app.js', './tracker.js', './renderer.js', './game.js',
  './geometry.js', './filters.js', './i18n.js', './ui.js', './audio.js',
  './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  '../../top_buttons.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(CORE.map(u => c.add(u))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('kinect-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const external = url.origin !== self.location.origin;

  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(async () => (await caches.match(req)) || (await caches.match('./index.html')) || (await caches.match('./offline.html'))));
    return;
  }

  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
    return res;
  }).catch(() => caches.match('./offline.html'))));
});
