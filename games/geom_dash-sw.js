const CACHE = 'geom_dash-pwa-v1';
const ASSETS = [
  './geom_dash.html',
  './geom_dash.webmanifest',
  '../top_buttons.js',
  './_kit/a11y.css',
  './_kit/storage.js',
  './_kit/progression.js',
  './_kit/meta-layer.js',
  './_kit/campaign.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy));
      return r;
    }).catch(() => caches.match('./geom_dash.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
