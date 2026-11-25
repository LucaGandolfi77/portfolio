/* Service Worker — birds-pwa-v2 */
const CACHE_PREFIX = 'birds-';
const CACHE = CACHE_PREFIX + 'v2';
const LEGACY_CACHES = ['./'];
const ASSETS = [
  './index.html',
  './manifest.webmanifest',
  '../../top_buttons.js'
];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE)
    .then(c => Promise.allSettled(ASSETS.map(u => c.add(u))))
    .then(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys
      .filter(k => LEGACY_CACHES.includes(k) || (k.startsWith(CACHE_PREFIX) && k !== CACHE))
      .map(k => caches.delete(k))
    ))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Fetch pages from the network first so engine fixes reach returning visitors.
  // Keep the cached page as an offline fallback.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
