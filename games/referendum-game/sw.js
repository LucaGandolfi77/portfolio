// sw.js — Referendum Rumble Service Worker
// Cache-first for static assets, background sync for offline votes

const CACHE_NAME = 'referendum-rumble-v1';
const STATIC_ASSETS = [
  '/games/referendum-game/',
  '/games/referendum-game/index.html',
  '/games/referendum-game/style.css',
  '/games/referendum-game/app.js',
  '/games/referendum-game/room.js',
  '/games/referendum-game/minigame.js',
  '/games/referendum-game/manifest.json',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js'
];

const VOTE_QUEUE_STORE = 'vote-queue';

// Install — pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache during install:', err);
        // Cache what we can individually
        return Promise.allSettled(
          STATIC_ASSETS.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip PeerJS signaling server requests (WebSocket upgrades, API calls)
  if (request.url.includes('peerjs.com') || request.url.includes('peer.')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Don't cache non-ok or opaque responses from CDNs we didn't pre-cache
          if (!response || response.status !== 200) {
            return response;
          }

          // Cache successful responses
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/games/referendum-game/index.html');
          }
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
    })
  );
});

// Background Sync — replay queued votes when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'vote-sync') {
    event.waitUntil(replayVoteQueue());
  }
});

/**
 * Replay queued votes stored in IndexedDB.
 * Votes are stored when offline and replayed when connectivity returns.
 */
async function replayVoteQueue() {
  try {
    const db = await openVoteDB();
    const tx = db.transaction(VOTE_QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(VOTE_QUEUE_STORE);
    const allVotes = await idbGetAll(store);

    if (!allVotes || allVotes.length === 0) return;

    // Notify clients to process queued votes
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.postMessage({
        type: 'replay-votes',
        votes: allVotes
      });
    }

    // Clear the queue
    const clearTx = db.transaction(VOTE_QUEUE_STORE, 'readwrite');
    clearTx.objectStore(VOTE_QUEUE_STORE).clear();
    await idbTxComplete(clearTx);

    db.close();
  } catch (err) {
    console.error('[SW] Failed to replay vote queue:', err);
  }
}

// Push notification template
self.addEventListener('push', (event) => {
  let data = { title: 'Referendum Rumble', body: 'Your faction needs you!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Referendum Rumble', {
      body: data.body || 'Your faction is losing! Come back and vote!',
      icon: '/games/referendum-game/manifest.json', // Will use manifest icon
      badge: '/games/referendum-game/manifest.json',
      tag: 'faction-alert',
      renotify: true,
      data: { url: '/games/referendum-game/' }
    })
  );
});

// Notification click — open app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/games/referendum-game/') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/games/referendum-game/');
    })
  );
});

// Message handler — queue votes from main app when offline
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'queue-vote') {
    queueVote(event.data.vote).catch((err) =>
      console.error('[SW] Failed to queue vote:', err)
    );
  }
});

/**
 * Store a vote in IndexedDB for later replay.
 * @param {Object} vote - The vote data to queue
 */
async function queueVote(vote) {
  const db = await openVoteDB();
  const tx = db.transaction(VOTE_QUEUE_STORE, 'readwrite');
  tx.objectStore(VOTE_QUEUE_STORE).add({
    ...vote,
    queuedAt: Date.now()
  });
  await idbTxComplete(tx);
  db.close();
}

// IndexedDB helpers
function openVoteDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('referendum-rumble-sw', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(VOTE_QUEUE_STORE)) {
        db.createObjectStore(VOTE_QUEUE_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbTxComplete(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
