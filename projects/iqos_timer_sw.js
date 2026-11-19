/* IQOS Timer — service worker con scope /projects/.
   Intercetta SOLO le risorse del timer: le altre pagine del portfolio
   restano gestite dal service worker principale. */
"use strict";
const CACHE = "iqos-timer-v1";
const BASE = self.location.href.replace(/iqos_timer_sw\.js.*$/, "");
const STATIC = ["iqos_timer_manifest.json", "iqos_timer_icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC.map(f => new Request(BASE + f)))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && k.indexOf("iqos-timer-") === 0).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const name = url.pathname.split("/").pop();
  if (e.request.method !== "GET" || name !== "iqos_timer.html" && STATIC.indexOf(name) < 0) return;

  if (name === "iqos_timer.html") {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match(BASE + "iqos_timer.html")))
    );
    return;
  }

  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
    }
    return res;
  })));
});
