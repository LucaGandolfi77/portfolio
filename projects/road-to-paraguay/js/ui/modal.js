/**
 * modal.js — la card centrale con il messaggio del giorno.
 *
 * Sequenza di apertura:
 *  1. il fondale si scurisce e sfoca;
 *  2. la card entra con un lampo di luce;
 *  3. alla primissima apertura di quella casella compare il micro-rituale;
 *  4. il testo appare riga per riga.
 *
 * L'uscita è gestita da noi con una durata nota: non dipendiamo dalla fine di
 * un'animazione, che potrebbe non arrivare mai (stelline e scintille interne
 * girano all'infinito).
 */
import { FALLBACK_RITUAL, MESSAGE_TYPE_LABEL, findMessage } from '../data/messages.js';
import { EVENT, TEAM } from '../data/event.js';
import { formatDayFull } from '../utils/dates.js';
import { qs } from '../utils/dom.js';
import { ICONS } from './icons.js';

const RITUAL_MS = 3400;
const WORD_DELAY_MS = 420;
const EXIT_MS = 240;

const TYPE_ICON = {
  motivation: ICONS.sparkles,
  poem: ICONS.feather,
  thought: ICONS.heart,
  funny: ICONS.smile,
};

/** Vigilia e gran finale hanno sempre il loro micro-rituale. */
const isSpecialDay = (index, total) => index >= total - 2;

function ritualFor(day, alreadyRead, total) {
  if (alreadyRead && !isSpecialDay(day.index, total)) return null;
  return findMessage(day.index, total)?.ritual ?? FALLBACK_RITUAL;
}

export function createModal({ onRead, onOpenChange }) {
  const root = qs('#modal-root');
  let node = null;
  let timers = [];
  let restoreFocus = null;

  const clearTimers = () => {
    timers.forEach(window.clearTimeout);
    timers = [];
  };

  function close() {
    if (!node) return;
    const current = node;
    node = null;
    clearTimers();
    current.classList.add('modal--leaving');
    document.removeEventListener('keydown', onKeyDown);
    document.body.classList.remove('is-locked');
    onOpenChange?.(false);
    window.setTimeout(() => {
      current.remove();
      restoreFocus?.focus?.();
      restoreFocus = null;
    }, EXIT_MS);
  }

  function onKeyDown(event) {
    if (!node) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

    // Focus trap semplice e robusto.
    const focusables = node.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * @param {object} day casella da mostrare
   * @param {number} total numero totale di caselle
   * @param {boolean} alreadyRead true se era già stata letta
   */
  function open(day, total, alreadyRead) {
    if (node) close();

    const message = findMessage(day.index, total);
    if (!message) return;

    restoreFocus = document.activeElement;
    const ritual = ritualFor(day, alreadyRead, total);

    node = document.createElement('div');
    node.className = 'modal';
    node.setAttribute('role', 'presentation');

    const TypeIcon = TYPE_ICON[message.type] ?? ICONS.sparkles;
    const words = message.message.split('\n');

    node.innerHTML = `
      <div class="modal__backdrop" aria-hidden="true"></div>
      <div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
        <span class="modal__flash" aria-hidden="true"></span>
        <div class="sparkles sparkles--local modal__sparkles" data-static-sparkles="12"></div>
        <button type="button" class="modal__close" data-close aria-label="Chiudi il messaggio">${ICONS.close(18)}</button>

        <div class="ritual" data-ritual hidden>
          <span class="ritual__ring" aria-hidden="true"></span>
          <p class="ritual__text"></p>
          <span class="ritual__hint">respira…</span>
        </div>

        <div class="modal__content" data-content hidden>
          <div class="modal__meta">
            <span class="modal__chip">${TypeIcon(13)}${MESSAGE_TYPE_LABEL[message.type]}</span>
            <span class="modal__date">casella ${String(day.index).padStart(2, '0')} · ${formatDayFull(day)}</span>
          </div>
          <h3 class="modal__title" id="modal-title">${message.title}</h3>
          <div class="modal__body" id="modal-body">
            ${words
              .map(
                (line, i) =>
                  `<p class="modal__line" style="animation-delay:${i * 160}ms">${line.replace(/</g, '&lt;')}</p>`,
              )
              .join('')}
          </div>
          <div class="modal__emoji" aria-hidden="true"><span>${message.emoji ?? '✨'}</span></div>
          <div class="modal__actions">
            <button type="button" class="btn btn--primary" data-close>Chiudi</button>
            <button type="button" class="btn btn--ghost" data-ritual-again ${ritual ? '' : 'disabled'}>${ICONS.rotate(15)} ${alreadyRead ? 'Il rituale' : 'Rivedi il rituale'}</button>
          </div>
        </div>
      </div>
    `;

    // Stelline della card (posizioni fisse, nessuna animazione JS)
    const sparkleHost = node.querySelector('.modal__sparkles');
    const rand = (() => {
      let a = (day.index * 97 + 13) >>> 0;
      return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
    for (let i = 0; i < 12; i += 1) {
      const star = document.createElement('span');
      star.className = 'sparkle';
      star.textContent = ['✦', '✧', '·', '✩'][i % 4];
      star.style.left = `${rand() * 100}%`;
      star.style.top = `${rand() * 100}%`;
      star.style.fontSize = `${6 + rand() * 10}px`;
      star.style.setProperty('--star-opacity', String(0.2 + rand() * 0.4));
      star.style.setProperty('--star-delay', `${rand() * 5}s`);
      star.style.setProperty('--star-duration', `${3.4 + rand() * 4}s`);
      sparkleHost.append(star);
    }

    const ritualBox = node.querySelector('[data-ritual]');
    const contentBox = node.querySelector('[data-content]');
    const bodyBox = node.querySelector('.modal__body');
    let contentShown = false;

    function showContent() {
      if (contentShown) return;
      contentShown = true;
      ritualBox.hidden = true;
      contentBox.hidden = false;
      // Rivelazione del testo: solo trasformazione, mai opacità.
      timers.push(window.setTimeout(() => bodyBox.classList.add('is-visible'), WORD_DELAY_MS));
      onRead(day);
      qs('.modal__close', node)?.focus();
    }

    function showRitual() {
      if (!ritual) return;
      contentShown = false;
      clearTimers();
      ritualBox.hidden = false;
      contentBox.hidden = true;
      bodyBox.classList.remove('is-visible');
      ritualBox.querySelector('.ritual__text').textContent = ritual;
      timers.push(window.setTimeout(showContent, RITUAL_MS));
    }

    node.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', close));
    node.querySelector('[data-ritual-again]')?.addEventListener('click', showRitual);
    node.querySelector('.modal__backdrop')?.addEventListener('click', close);
    node.querySelector('.modal__card')?.addEventListener('click', (event) => event.stopPropagation());
    node.addEventListener('click', (event) => {
      if (event.target === node) close();
    });

    root.append(node);
    document.body.classList.add('is-locked');
    document.addEventListener('keydown', onKeyDown);
    onOpenChange?.(true);

    // Forza un frame prima di aggiungere `is-open`, così la transizione parte.
    requestAnimationFrame(() => node?.classList.add('is-open'));

    if (ritual) showRitual();
    else showContent();

    timers.push(window.setTimeout(() => qs('.modal__close', node)?.focus(), 260));
  }

  return { open, close, isOpen: () => Boolean(node) };
}
