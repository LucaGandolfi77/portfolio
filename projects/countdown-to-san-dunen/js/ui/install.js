/**
 * install.js — suggerimento di installazione, non invadente.
 *
 * Su iOS spiega il percorso Condividi -> "Aggiungi a Home" (Safari non ha un
 * prompt nativo); su Chromium usa l'evento `beforeinstallprompt` con un vero
 * pulsante. Se l'app è già installata o l'utente lo ha chiuso, non compare più.
 */
import { qs } from '../utils/dom.js';
import { readString, writeString } from '../utils/storage.js';

const DISMISS_KEY = 'sd.installHintDismissed.v1';
const EXIT_MS = 240;

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  const ua = window.navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ si presenta come Mac: lo distinguiamo dal touch.
  const iPadOs = ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOs;
}

export function createInstallHint() {
  const root = qs('#install-root');
  let deferredPrompt = null;
  let node = null;
  let exitTimer = 0;

  const platform = isStandalone() ? 'none' : isIos() ? 'ios' : 'chromium';
  const dismissed = readString(DISMISS_KEY) === '1';

  if (platform === 'chromium') {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      if (!node) mount();
    });
  }

  function remove() {
    const current = node;
    node = null;
    if (!current) return;
    current.classList.add('installhint--leaving');
    window.clearTimeout(exitTimer);
    exitTimer = window.setTimeout(() => current.remove(), EXIT_MS);
  }

  function dismiss() {
    writeString(DISMISS_KEY, '1');
    remove();
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') dismiss();
    deferredPrompt = null;
  }

  function mount() {
    if (dismissed || platform === 'none' || node) return;

    node = document.createElement('aside');
    node.className = 'installhint';
    node.setAttribute('aria-label', "Installa l'app sulla schermata Home");
    node.innerHTML = `
      <button type="button" class="installhint__close" data-close aria-label="Chiudi il suggerimento di installazione">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <p class="installhint__title">Portala con te 🚲</p>
      ${
        platform === 'ios'
          ? `<p class="installhint__text">
               Tocca <svg class="installhint__inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Condividi"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v13M8 7l4-4 4 4"/></svg> in Safari,
               poi <svg class="installhint__inline" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Aggiungi a Home"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 9v6M9 12h6"/></svg>
               <strong>Aggiungi a Home</strong>. Si aprirà come una vera app, anche senza rete.
             </p>`
          : `<p class="installhint__text">Installala come app: si apre a tutto schermo e funziona anche offline.</p>
             <button type="button" class="btn btn--primary btn--small" data-install>
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 11l5 5 5-5M5 21h14"/></svg>
               Installa l’app
             </button>`
      }
    `;
    node.querySelector('[data-close]').addEventListener('click', dismiss);
    node.querySelector('[data-install]')?.addEventListener('click', install);
    root.append(node);
  }

  return {
    platform,
    /** Mostra il banner dopo l'intro, se ha senso. */
    show: mount,
    hide: remove,
  };
}
