// Ultimo Colore service worker. __BUILD_ID__ becomes the commit SHA at deploy
// (scripts/build-site.mjs); only caches with our own prefix are removed,
// because every PWA of the portfolio shares one origin.
const PREFIX = 'ultimo-colore-';
// The number goes up when the files change shape: the new worker then fills a
// cache of its own, straight from the network, so a page never mixes old and
// new modules.
const CACHE = PREFIX + '3-__BUILD_ID__';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './art/campanile.webp',
  './art/campo.webp',
  './art/canale.webp',
  './art/cervo.webp',
  './art/darsena.webp',
  './art/forno.webp',
  './art/ponte.webp',
  './art/secche.webp',
  './art/stiva.webp',
  './art/titolo.webp',
  './art/world-0.webp',
  './art/world-1.webp',
  './art/world-2.webp',
  './art/world-3.webp',
  './art/world-4.webp',
  './art/world-5.webp',
  './art/world.webp',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon.svg',
  './js/audio.js',
  './js/battle/engine.js',
  './js/battle/timing.js',
  './js/data/enemies.js',
  './js/data/map.js',
  './js/data/memories.js',
  './js/data/party.js',
  './js/data/places.js',
  './js/data/story.js',
  './js/main.js',
  './js/render/effects.js',
  './js/render/fade.js',
  './js/render/overworld.js',
  './js/render/sprites.js',
  './js/render3d/boat.js',
  './js/render3d/creatures.js',
  './js/render3d/geom.js',
  './js/render3d/gl.js',
  './js/render3d/heroes.js',
  './js/render3d/props.js',
  './js/render3d/rig.js',
  './js/render3d/scene.js',
  './js/strings.js',
  './js/ui/battle.js',
  './js/ui/screens.js',
  './js/ui/world.js',
  './js/world/field.js',
  './js/world/layout.js',
  './js/world/progress.js',
  './js/world/terrain.js',
  '../_kit/i18n.js', '../_kit/storage.js', '../_kit/pwa.js', '../_kit/a11y.css'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith(PREFIX)).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => {
      const copy = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Stale-while-revalidate: answer from the cache at once, refresh it in the
  // background, so a new deploy reaches players on their next visit even if
  // the cache name did not change.
  e.respondWith(caches.open(CACHE).then((c) => c.match(e.request).then((hit) => {
    const fresh = fetch(e.request).then((r) => {
      if (r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone());
      return r;
    }).catch(() => hit);
    return hit || fresh;
  })));
});
