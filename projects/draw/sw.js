// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
const CACHE = 'pixel-studio-v1';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest', './icon.svg',
  './icons/icon-192.png', './icons/icon-512.png',
  './js/config.js', './js/state.js', './js/filters.js', './js/tools.js', './js/ui.js', './js/main.js',
  '../../top_buttons.js'
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
    event.respondWith(fetch(event.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(r => {
    if (r && r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); }
    return r;
  })));
});
