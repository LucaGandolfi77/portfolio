/* Service Worker — kinect-pwa-v1 */
const CACHE = './';
const ASSETS = [
  './index.html',
  './manifest.webmanifest',
  '../_shared/top_buttons.js',
  './app.js'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE.split('-').slice(0, -1).join('-') + '-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method === 'GET') e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request))); });
