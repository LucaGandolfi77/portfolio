/**
 * toast.js — messaggio temporaneo in fondo allo schermo.
 *
 * È una live region, quindi anche VoiceOver lo annuncia.
 *
 * Due scelte importanti, entrambe nate da bug reali:
 * 1. l'entrata è un'animazione CSS di SOLA trasformazione: il messaggio è
 *    leggibile di default, così non può restare invisibile se l'animazione
 *    non parte (animazioni ridotte, scheda in background, frame non prodotti);
 * 2. un messaggio nuovo azzera lo stato di uscita, altrimenti il secondo
 *    nascerebbe già "in uscita", cioè invisibile.
 */
import { qs } from '../utils/dom.js';

const VISIBLE_MS = 2600;
const EXIT_MS = 240;

export function createToast() {
  const host = qs('#toast-host');
  let node = null;
  let timer = 0;
  let exitTimer = 0;

  function clear() {
    window.clearTimeout(timer);
    window.clearTimeout(exitTimer);
    node?.remove();
    node = null;
  }

  function dismiss() {
    if (!node) return;
    const current = node;
    current.classList.add('toast--leaving');
    exitTimer = window.setTimeout(() => {
      current.remove();
      if (node === current) node = null;
    }, EXIT_MS);
  }

  /** @param {string} text @param {'normal'|'high'} [priority] */
  function show(text, priority = 'normal') {
    if (!text) return;
    // Un messaggio importante non viene sovrascritto da uno decorativo.
    if (node && node.dataset.priority === 'high' && priority === 'normal') return;

    clear();

    node = document.createElement('div');
    node.className = 'toast';
    node.dataset.priority = priority;
    node.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></svg><span></span>';
    node.querySelector('span').textContent = text;
    node.addEventListener('click', dismiss);
    host.append(node);

    timer = window.setTimeout(dismiss, VISIBLE_MS);
  }

  return { show, dismiss, clear };
}
