/* Service Worker — Pokémon Adventure (Classic) */
const CACHE = 'pokemon-classic-pwa-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', '../../top_buttons.js',
  '../../assets/css/pokemon.css',
  '../../assets/js/pokemon/constants.js',
  '../../assets/js/pokemon/sprites.js',
  '../../assets/js/pokemon/state.js',
  '../../assets/js/pokemon/utils.js',
  '../../assets/js/pokemon/map.js',
  '../../assets/js/pokemon/render.js',
  '../../assets/js/pokemon/gameplay.js',
  '../../assets/js/pokemon/main.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pokemon-classic-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
