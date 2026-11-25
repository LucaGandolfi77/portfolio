// Cache cleanup: delete only older versions of THIS app's cache (same name
// stem, e.g. 'app-v1' -> 'app-v2'). Other PWAs share the origin
// (lucagandolfi77.github.io) and their caches must not be touched.
/* Cabriolo 5:00 — service worker: app shell offline */
"use strict";

const CACHE = "cabriolo-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./js/audio.js",
  "./js/story.js",
  "./js/minigames.js",
  "./js/game.js",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.replace(/-[^-]*$/, '') === CACHE.replace(/-[^-]*$/, '')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
