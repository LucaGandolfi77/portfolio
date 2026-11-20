/* Bootstrap Shogi PWA */

import { initUI } from './ui.js';
import { state, togglePause, loadKifu, startGame } from './game.js';

initUI();

/* Scorciatoie PWA: index.html?mode=ai|pvp|daily */
try {
  const requestedMode = new URLSearchParams(location.search).get('mode');
  if (requestedMode && ['ai', 'pvp', 'daily'].includes(requestedMode)) {
    startGame({ mode: requestedMode });
  }
} catch (e) { /* ignore */ }

/* Kifu condiviso via URL: #kifu=... */
try {
  const match = location.hash.match(/kifu=([^&]+)/);
  if (match) loadKifu(decodeURIComponent(match[1]));
} catch (e) { /* hash non valido: ignora */ }

/* Stato connessione */
const offlineChip = document.getElementById('offlineChip');
function updateConnection() {
  offlineChip.classList.toggle('hidden', navigator.onLine !== false);
}
window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
updateConnection();

/* Installazione */
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.classList.remove('hidden');
});
window.addEventListener('appinstalled', () => installBtn.classList.add('hidden'));
installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  try { await deferredPrompt.userChoice; } catch (e) { /* ignore */ }
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

/* Pausa automatica quando la pagina è nascosta */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !state.gameOver && !state.paused && !state.replay && state.records.length) {
    togglePause(true);
  }
});

/* Service worker con flusso di aggiornamento */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then(registration => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          window.__shogiWaitingWorker = worker;
          document.getElementById('updateBar').classList.remove('hidden');
        }
      });
    });
  }).catch(() => {
    /* il gioco resta giocabile online senza service worker */
  });
}
