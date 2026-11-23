/* Service Worker — Neural Style Studio v1 */
const CACHE = 'nst-studio-v1';
const CORE = [
  './', './index.html', './offline.html', './manifest.webmanifest',
  './styles.css', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './js/app.js', './js/preview.js', './js/neural.js', './js/pipeline.js',
  './js/styles.js', './js/history.js', './js/i18n.js',
  './examples/content-0.svg', './examples/content-1.svg', './examples/content-2.svg',
  './examples/style-0.svg', './examples/style-1.svg', './examples/style-2.svg',
  './examples/style-3.svg', './examples/style-4.svg',
  '../_shared/tokens.css', '../_shared/base.css', '../_shared/shell.css', '../_shared/shell.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(CORE.map(u => c.add(u))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('nst-') && k !== CACHE).map(k => caches.delete(k))))
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
