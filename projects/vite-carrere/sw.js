/* VITE — service worker: app shell offline */
"use strict";

const CACHE_NAME = "vite-carrere-v2";
const CACHE_VERSION = 2;

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./js/data.js",
  "./js/engine.js",
  "./js/minigames.js",
  "./js/ui.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon.svg",
  "./privacy.html",
  "./robots.txt"
];

const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VITE — Offline</title>
  <style>
    body { font-family: Georgia, serif; background: #f7f2e7; color: #1f2430;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .box { max-width: 380px; border: 2px solid #b8923e; padding: 48px 32px; }
    h1 { font-size: 48px; letter-spacing: 12px; margin-bottom: 12px; font-weight: 400; }
    p { font-style: italic; color: #5c5a52; margin-bottom: 24px; line-height: 1.6; }
    button { border: 1px solid #1f2430; background: transparent; color: #1f2430;
      font-family: Georgia, serif; font-size: 14px; letter-spacing: 2px;
      padding: 12px 28px; cursor: pointer; }
    button:hover { background: #1f2430; color: #f7f2e7; }
  </style>
</head>
<body>
  <div class="box">
    <h1>VITE</h1>
    <p>Sei offline. L'app è stata già scaricata sul tuo dispositivo — prova a ricaricare la pagina.</p>
    <button onclick="location.reload()">Riprova</button>
  </div>
</body>
</html>`;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((c) => {
        return c.addAll(ASSETS).then(() => {
          return c.put("./offline.html", new Response(OFFLINE_PAGE, {
            headers: { "Content-Type": "text/html; charset=utf-8" }
          }));
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (url.origin !== self.location.origin) return;

  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;

      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((c) => {
          c.put(e.request, responseToCache);
        });

        return response;
      }).catch(() => {
        if (e.request.destination === "document") {
          return caches.match("./offline.html");
        }
        return new Response("Offline", { status: 503 });
      });
    })
  );
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
