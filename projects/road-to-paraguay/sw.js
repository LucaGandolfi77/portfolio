/**
 * sw.js — service worker scritto a mano, senza dipendenze.
 *
 * Fa due cose:
 *  1. precarica il guscio dell'app (HTML, CSS, JS, icone) per l'uso offline;
 *  2. serve le richieste con una strategia adatta a un'app che cambia raramente.
 *
 * ⚠️ IMPORTANTE: quando modifichi i file dell'app, cambia CACHE_VERSION.
 * È così che i dispositivi che hanno già installato la PWA scaricano la
 * versione nuova invece di restare sulla copia in cache.
 */

const CACHE_VERSION = 'rtp-v1';

/** Tutto ciò che serve per aprire l'app senza rete. Percorsi RELATIVI. */
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'styles/globals.css',
  'icons/favicon.svg',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'js/main.js',
  'js/data/event.js',
  'js/data/messages.js',
  'js/utils/dates.js',
  'js/utils/dom.js',
  'js/utils/storage.js',
  'js/ui/calendar.js',
  'js/ui/celebration.js',
  'js/ui/countdown.js',
  'js/ui/decorations.js',
  'js/ui/eggs.js',
  'js/ui/icons.js',
  'js/ui/install.js',
  'js/ui/intro.js',
  'js/ui/modal.js',
  'js/ui/music.js',
  'js/ui/theme.js',
  'js/ui/toast.js',
];

/** Costruisce un URL assoluto a partire dallo scope del service worker. */
const url = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // `addAll` fallisce se anche un solo file manca: meglio saperlo subito.
      cache.addAll(SHELL.map(url)),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo GET, e solo richieste del nostro sito.
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  // Navigazioni: rete prima, cache come rete di sicurezza.
  // Così una pagina già aperta funziona anche completamente offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(url('index.html')).then((cached) => cached ?? caches.match(url('./')))),
    );
    return;
  }

  // Risorse: cache prima (istantanee), con aggiornamento in sottofondo.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached ?? network;
    }),
  );
});
