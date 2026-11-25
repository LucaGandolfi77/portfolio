// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
const CACHE = 'cdd-v2';
const ASSETS = [
  './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable.png', './icons/icon.svg', './styles.css',
  './app.js', './audio.js', './effects.js', './input.js',
  './render.js', './state.js', './ui.js', './world.js',
  '../_kit/storage.js', '../_kit/progression.js', '../_kit/meta-layer.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.replace(/-[^-]*$/, '') === CACHE.replace(/-[^-]*$/, '')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
        return r;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
