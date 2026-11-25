const CACHE = 'pf-lyrics-shell-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  './icons/icon-192.png', './icons/icon-512.png',
  '../_shared/tokens.css', '../_shared/base.css', '../_shared/shell.css', '../../top_buttons.js',
  './css/app.css',
  './js/config.js', './js/i18n.js', './js/storage.js', './js/search.js',
  './js/api.js', './js/audio.js', './js/ui.js', './js/main.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('pf-lyrics-') === 0 && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
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
