// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
const CACHE = 'friends-tycoon-pwa-v2';
const ASSETS = [
  './index.html',
  '../../top_buttons.js',
  '../_kit/a11y.css',
  '../_kit/storage.js',
  '../_kit/progression.js',
  '../_kit/meta-layer.js',
  '../miraggio-pass/js/bridge.js',
  './data/activities.js',
  './data/balance.js',
  './data/characters.js',
  './data/houses.js',
  './data/minigames.js',
  './data/missions.js',
  './data/randomevents.js',
  './data/scenes.js',
  './data/vehicles.js',
  './js/audio.js',
  './js/characters.js',
  './js/charscene.js',
  './js/economy.js',
  './js/idle.js',
  './js/main.js',
  './js/minigame.js',
  './js/render3d.js',
  './js/save.js',
  './js/sim.js',
  './js/state.js',
  './js/time.js',
  './js/ui.js',
  './style.css'
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
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});
