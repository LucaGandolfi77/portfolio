/* Bootstrap: setup canvas, loop di gioco, service worker */

import { MODES } from './config.js';
import { resizeCanvas, draw } from './render.js';
import { state } from './state.js';
import { update, startNextWave, togglePause, startGame } from './engine.js';
import { initInput } from './input.js';
import { initUI, updateHUD } from './ui.js';

const canvas = document.getElementById('gameCanvas');
let ctx = resizeCanvas(canvas);

function onResize() {
  ctx = resizeCanvas(canvas);
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

initUI();
initInput(canvas);

/* Un solo loop di animazione per l'intera applicazione. */
let last = performance.now();
function frame(now) {
  const dt = now - last;
  last = now;
  update(dt);
  draw(ctx, now);
  updateHUD();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* Scorciatoie PWA: /index.html?mode=endless avvia direttamente quella modalità. */
try {
  const requestedMode = new URLSearchParams(location.search).get('mode');
  if (requestedMode && Object.prototype.hasOwnProperty.call(MODES, requestedMode)) {
    startGame(requestedMode);
  }
} catch (e) { /* ignore */ }

/* Prima onda automatica poco dopo l'inizio della partita. */
window.addEventListener('td:start', () => {
  setTimeout(() => {
    if (state.running && !state.paused && state.wave === 0 && !state.gameOver) startNextWave();
  }, 950);
});

/* Pausa automatica quando la scheda diventa invisibile. */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.running && !state.paused) togglePause(true);
});

/* Service Worker con controllo aggiornamenti */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then(registration => {
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('td:sw-update', { detail: { worker } }));
        }
      });
    });
  }).catch(() => {
    /* SW non disponibile: il gioco resta giocabile online */
  });
}
