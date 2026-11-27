// Seba service worker. __BUILD_ID__ becomes the commit SHA at deploy
// (scripts/build-site.mjs); only caches with our own prefix are removed,
// because every PWA of the portfolio shares one origin.
const PREFIX = 'seba-';
const CACHE = PREFIX + '__BUILD_ID__';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './js/achievements.js',
  './js/audio.js',
  './js/games/dance.js',
  './js/games/dj.js',
  './js/games/index.js',
  './js/games/lighter.js',
  './js/games/quiz.js',
  './js/games/runner.js',
  './js/games/shell.js',
  './js/games/shift.js',
  './js/main.js',
  './js/places/cities.js',
  './js/places/scenery.js',
  './js/rules.js',
  './js/seba/lines.js',
  './js/seba/rig.js',
  './js/state.js',
  './js/strings.js',
  './js/ui/journal.js',
  './js/ui/rooms.js',
  './js/ui/sheet.js',
  './js/ui/wardrobe.js',
  './js/ui/world.js',
  './js/wardrobe.js',
  '../_kit/i18n.js', '../_kit/storage.js', '../_kit/pwa.js', '../_kit/a11y.css',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
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
