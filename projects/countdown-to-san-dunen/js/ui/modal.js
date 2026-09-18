/**
 * modal.js — la card centrale con il messaggio del giorno.
 *
 * Sequenza: il fondale si scurisce, la card entra, alla prima apertura di quella
 * casella compare il micro-rituale, poi il messaggio riga per riga.
 *
 * Il rituale si può riascoltare SEMPRE dal pulsante in fondo, anche su una
 * casella già letta: il testo del rituale e la decisione di mostrarlo da solo
 * sono due cose diverse. (Prima erano la stessa variabile, e su una casella già
 * letta diventava `null`: il pulsante restava disabilitato e il rituale si
 * poteva vedere una volta sola.)
 */
import { FALLBACK_RITUAL, MESSAGE_TYPE_LABEL, findMessage } from '../data/messages.js';
import { formatDayFull, offsetLabel } from '../utils/dates.js';
import { qs } from '../utils/dom.js';
import { ICONS } from './icons.js';

const RITUAL_MS = 3400;
const WORD_DELAY_MS = 420;
const EXIT_MS = 240;
/** Finestra in cui un tocco sul velo viene ignorato: protegge dal doppio tap. */
const BACKDROP_GUARD_MS = 350;

const TYPE_ICON = {
  motivation: ICONS.sparkles,
  poem: ICONS.beer,
  thought: ICONS.smile,
  funny: ICONS.smile,
};

/** Il testo del rituale c'è sempre: quello scritto apposta, o quello di riserva. */
function ritualTextFor(day) {
  return findMessage(day.offset)?.ritual ?? FALLBACK_RITUAL;
}

/** Il rituale si mostra da solo alla prima apertura e negli ultimi giorni. */
function shouldShowRitualOnOpen(day, alreadyRead) {
  return !alreadyRead || day.offset >= -2;
}

/** Generatore pseudo-casuale deterministico per le stelline della card. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createModal({ onRead, onOpenChange }) {
  const root = qs('#modal-root');
  let node = null;
  let timers = [];
  let restoreFocus = null;
  let openedAt = 0;

  /** Orologio monotono: non risente di cambi d'ora o dell'orologio di sistema. */
  const adesso = () => performance.now();

  const clearTimers = () => {
    timers.forEach(window.clearTimeout);
    timers = [];
  };

  function onKeyDown(event) {
    if (!node) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;

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
      // `preventScroll` evita che il focus faccia saltare la pagina: un salto a
      // ridosso del tocco successivo manderebbe il dito altrove.
      try {
        restoreFocus?.focus?.({ preventScroll: true });
      } catch {
        restoreFocus?.focus?.();
      }
      restoreFocus = null;
    }, EXIT_MS);
  }

  /**
   * @param {object} day casella da mostrare
   * @param {boolean} alreadyRead true se era già stata letta
   */
  function open(day, alreadyRead) {
    if (node) close();

    const message = findMessage(day.offset);
    if (!message) return;

    restoreFocus = document.activeElement;
    const ritual = ritualTextFor(day);
    const mostraRituale = shouldShowRitualOnOpen(day, alreadyRead);

    node = document.createElement('div');
    node.className = 'modal';
    node.setAttribute('role', 'presentation');

    const TypeIcon = TYPE_ICON[message.type] ?? ICONS.sparkles;
    const words = message.message.split('\n');
    const numero = offsetLabel(day.offset);

    node.innerHTML = `
      <div class="modal__backdrop" aria-hidden="true"></div>
      <div class="modal__card" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
        <span class="modal__flash" aria-hidden="true"></span>
        <div class="sparkles sparkles--local modal__sparkles"></div>
        <button type="button" class="modal__close" data-close aria-label="Chiudi il messaggio">${ICONS.close(18)}</button>

        <div class="ritual" data-ritual hidden>
          <span class="ritual__ring" aria-hidden="true"></span>
          <p class="ritual__text">${ritual.replace(/</g, '&lt;')}</p>
          <span class="ritual__hint">respira…</span>
        </div>

        <div class="modal__content" data-content hidden>
          <div class="modal__meta">
            <span class="modal__chip">${TypeIcon(13)}${MESSAGE_TYPE_LABEL[message.type]}</span>
            <span class="modal__date">casella ${numero} · ${formatDayFull(day)}</span>
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
          <div class="modal__emoji" aria-hidden="true"><span>${message.emoji ?? '🍺'}</span></div>
          <div class="modal__actions">
            <button type="button" class="btn btn--primary" data-close>Chiudi</button>
            <button type="button" class="btn btn--ghost" data-ritual-again>${ICONS.rotate(15)} Rivedi il rituale</button>
          </div>
        </div>
      </div>
    `;

    // Stelline della card: posizioni fisse, nessuna animazione JS.
    const sparkleHost = node.querySelector('.modal__sparkles');
    const rand = seeded(Math.abs(day.offset) * 97 + 13);
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
      contentShown = false;
      clearTimers();
      ritualBox.hidden = false;
      contentBox.hidden = true;
      bodyBox.classList.remove('is-visible');
      ritualBox.querySelector('.ritual__text').textContent = ritual;
      timers.push(window.setTimeout(showContent, RITUAL_MS));
    }

    const closeFromBackdrop = () => {
      if (adesso() - openedAt < BACKDROP_GUARD_MS) return;
      close();
    };

    node.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', close));
    node.querySelector('[data-ritual-again]')?.addEventListener('click', showRitual);
    node.querySelector('.modal__backdrop')?.addEventListener('click', closeFromBackdrop);
    node.querySelector('.modal__card')?.addEventListener('click', (event) => event.stopPropagation());
    node.addEventListener('click', (event) => {
      if (event.target === node) closeFromBackdrop();
    });

    openedAt = adesso();
    root.append(node);
    document.body.classList.add('is-locked');
    document.addEventListener('keydown', onKeyDown);
    onOpenChange?.(true);

    // Un frame prima di `is-open`, così la transizione parte davvero.
    requestAnimationFrame(() => node?.classList.add('is-open'));

    if (mostraRituale) showRitual();
    else showContent();

    timers.push(window.setTimeout(() => qs('.modal__close', node)?.focus(), 260));
  }

  return { open, close, isOpen: () => Boolean(node) };
}
