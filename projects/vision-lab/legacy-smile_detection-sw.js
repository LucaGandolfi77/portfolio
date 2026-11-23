/* Service Worker — smile_detection-legacy-v1 */
const CACHE = './';
const ASSETS = [
  './legacy-smile_detection.html',
  './legacy-smile_detection.webmanifest'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE.split('-').slice(0, -1).join('-') + '-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method === 'GET') e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request))); });
