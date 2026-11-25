const CACHE = 'silent-canvas-v1';
const SHELL = ['/','/index.html','/styles.css','/app.js','/manifest.webmanifest','/icons/icon-192.svg','/icons/icon-512.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

/* Widget click: open the app when widget is tapped */
self.addEventListener('message', e => {
  if (e.data && (e.data.widget || e.data.action === 'open')) {
    e.waitUntil(clients.openWindow('/'));
  }
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(r => {
    if (r.ok) { const clone = r.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
    return r;
  }).catch(() => caches.match(e.request))));
});