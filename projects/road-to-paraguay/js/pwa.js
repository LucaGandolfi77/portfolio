/**
 * pwa.js — registrazione del service worker.
 *
 * Registrato con percorso e scope RELATIVI, così funziona identico dalla radice
 * del sito o da una sottocartella (GitHub Pages: /portfolio/projects/road-to-paraguay/).
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return; // con file:// i service worker non esistono

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {
      /* offline non disponibile: l'app funziona comunque online */
    });
  });
}
