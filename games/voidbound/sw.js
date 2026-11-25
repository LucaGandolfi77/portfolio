// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
const CACHE = 'voidbound-v2';
const URLS = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './js/data.js', './js/sprites.js', './js/game.js', './js/ai.js', './js/render.js', './js/main.js',
  './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE && x.replace(/-[^-]*$/, '') === CACHE.replace(/-[^-]*$/, '')).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => { if (!resp || resp.status !== 200) return resp; const cl = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, cl)); return resp; }).catch(() => caches.match('./index.html')))); });