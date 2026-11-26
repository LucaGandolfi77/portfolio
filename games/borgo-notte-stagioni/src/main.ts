import './styles.css';
import { Game } from './app/game';
import { loadFidenza } from './data/fidenza';

function fail(error: unknown): void {
  console.error('[BORGO NOTTE]', error);
  const text = document.getElementById('load-text');
  if (text) text.textContent = 'Serve un browser con WebGL attivo per giocare.';
}

async function boot(): Promise<void> {
  try {
    const bar = document.getElementById('load-bar');
    const text = document.getElementById('load-text');
    if (text) text.textContent = 'Scarico la mappa di Fidenza…';
    await loadFidenza('./data/fidenza.json', (p) => {
      if (bar) bar.style.width = `${Math.round(p * 10)}%`;
    });
    /* Let the progress bar paint before the heavy build starts. */
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    new Game();
  } catch (error) {
    fail(error);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void boot(), { once: true });
else void boot();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(async () => {
        const registration = await navigator.serviceWorker.ready;
        const urls = new Set<string>([location.href]);
        for (const entry of performance.getEntriesByType('resource')) {
          try {
            const url = new URL(entry.name);
            if (url.origin === location.origin) urls.add(url.href);
          } catch {
            /* ignore */
          }
        }
        registration.active?.postMessage({ type: 'cache-assets', urls: [...urls] });
      })
      .catch((error) => console.warn('[BORGO NOTTE] offline cache unavailable', error));
  });
}
