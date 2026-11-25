// Rinomina il prefisso 'template-' con lo slug del gioco.
// __BUILD_ID__ viene sostituito con lo SHA del commit da scripts/build-site.mjs,
// quindi ogni deploy crea una cache nuova senza bump manuali di versione.
// In activate si cancellano SOLO le cache con il proprio prefisso: tutte le
// PWA condividono l'origin lucagandolfi77.github.io.
const PREFIX = 'template-';
const CACHE = PREFIX + '__BUILD_ID__';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './js/config.js', './js/state.js', './js/engine.js', './js/main.js',
  '../../../top_buttons.js',
  '../../_kit/core.js', '../../_kit/storage.js', '../../_kit/i18n.js',
  '../../_kit/audio.js', '../../_kit/fx.js', '../../_kit/pwa.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k.startsWith(PREFIX)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => {
      const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
