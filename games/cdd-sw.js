const CACHE = 'cdd-v2';
const ASSETS = [
  './cdd.html', './cdd/manifest.webmanifest',
  './cdd/icons/icon-192.png', './cdd/icons/icon-512.png', './cdd/icons/icon-maskable.png', './cdd/icons/icon.svg', './cdd/styles.css',
  './cdd/app.js', './cdd/audio.js', './cdd/effects.js', './cdd/input.js',
  './cdd/render.js', './cdd/state.js', './cdd/ui.js', './cdd/world.js',
  './_kit/storage.js', './_kit/progression.js', './_kit/meta-layer.js'
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
    event.respondWith(
      fetch(event.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
        return r;
      }).catch(() => caches.match('./cdd.html'))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
