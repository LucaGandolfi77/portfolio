/* Service Worker — tsne-3d-legacy-v1 */
const CACHE = './';
const ASSETS = [
  './legacy-tsne-3d.html',
  './legacy-tsne-3d.webmanifest'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE.split('-').slice(0, -1).join('-') + '-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method === 'GET') e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request))); });
