const CACHE = 'forza4-v2';
const ASSETS = [
  './forza4.html', './forza4/styles.css',
  './forza4/js/ai.js', './forza4/js/effects.js', './forza4/js/main.js',
  './forza4/js/rules.js', './forza4/js/state.js', './forza4/js/ui.js',
  './_kit/storage.js', './_kit/progression.js', './_kit/meta-layer.js', './top_buttons.js'
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
      }).catch(() => caches.match('./forza4.html'))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
