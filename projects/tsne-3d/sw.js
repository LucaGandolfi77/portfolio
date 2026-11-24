const CACHE = 'pf-tsne-shell-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './icon.svg',
  './icons/icon-192.png', './icons/icon-512.png',
  '../_shared/tokens.css', '../_shared/base.css', '../_shared/shell.css', '../_shared/shell.js',
  './css/app.css',
  './vendor/three.module.js', './vendor/OrbitControls.js',
  './js/config.js', './js/i18n.js', './js/storage.js', './js/glass.js',
  './js/scene.js', './js/ui.js', './js/main.js',
  './js/core/csv.js', './js/core/datasets.js', './js/core/kmeans.js',
  './js/core/tsne.js', './js/core/share.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.indexOf('pf-tsne-') === 0 && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r && r.ok && new URL(e.request.url).origin === self.location.origin) {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c));
    }
    return r;
  })));
});
