/**
 * calendar.js — le 31 caselle, numerate da -30 a 0.
 *
 * Non è una griglia rigida: è una collezione di medaglioni che scendono lungo una
 * traiettoria, come una strada vista dall'alto. Il numero grande è l'offset:
 * -30 è il 9 settembre, 0 è il giorno della festa.
 *
 * Quattro stati: `locked` (misteriosa), `today` (protagonista), `past`
 * (disponibile ma non letta), `opened` (letta).
 */
import { FESTA, SANTO } from '../data/event.js';
import { MESSAGE_TYPE_LABEL, findMessage } from '../data/messages.js';
import { getDayStatus, getUnlockedCount, offsetLabel } from '../utils/dates.js';
import { qs } from '../utils/dom.js';
import { ICONS } from './icons.js';

/** Caselle che nascondono una stellina easter egg (indici di posizione). */
export const HIDDEN_STAR_OFFSETS = [-24, -13, -5];

const TYPE_ICON = {
  motivation: ICONS.sparkles,
  poem: ICONS.beer,
  thought: ICONS.smile,
  funny: ICONS.smile,
};

function stateOf(day, isOpened, now) {
  if (isOpened) return 'opened';
  return getDayStatus(day, now);
}

function ariaLabelFor(day, state) {
  const quando = `${day.dayOfMonth} ${day.monthLongLabel}`;
  const numero = day.offset === 0 ? 'casella della festa' : `casella ${offsetLabel(day.offset)}`;
  if (day.isFinale) {
    const fine = state === 'opened' ? ', già letta' : ', aprila';
    return `${numero}, ${quando}: ${SANTO.nome}, ${FESTA.giorno} a ${FESTA.città}${fine}`;
  }
  if (state === 'locked') return `${numero}, ${quando}: ancora chiusa, si apre quel giorno`;
  if (state === 'opened') return `${numero}, ${quando}: già letta, aprila di nuovo`;
  if (state === 'today') return `${numero} di oggi, ${quando}: aprila`;
  return `${numero}, ${quando}: non letta, aprila`;
}

/** Piccola scossa quando la casella è bloccata. */
function shake(node) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  node.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-4px) rotate(-1.2deg)' },
      { transform: 'translateX(4px) rotate(1.2deg)' },
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(0)' },
    ],
    { duration: 380, easing: 'ease-in-out' },
  );
}

export function createCalendar({ onOpen, onLocked, onHiddenStar, initialStars = [] }) {
  const grid = qs('#calendar-grid');
  const fill = qs('#progress-fill');
  const label = qs('#progress-label');

  const starFound = new Set(initialStars);
  let lastDays = [];
  let lastNow = new Date();
  let lastOpened = new Set();

  function card(day, state, total, index) {
    const message = findMessage(day.offset);
    const isLocked = state === 'locked';
    const isOpened = state === 'opened';
    const hasStar = HIDDEN_STAR_OFFSETS.includes(day.offset);
    const starIsFound = starFound.has(day.offset);

    const wrap = document.createElement('div');
    wrap.className = 'daycard-wrap';
    wrap.style.setProperty('--in-delay', `${Math.min(index * 0.03, 0.5)}s`);
    if (index % 4 === 1 || index % 4 === 2) wrap.style.setProperty('--offset', '10px');

    const classes = ['daycard', `daycard--${state}`];
    if (day.isFinale) classes.push('daycard--finale');
    if (day.isVigilia) classes.push('daycard--vigilia');
    if (hasStar && starIsFound) classes.push('daycard--starmarked');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = classes.join(' ');
    button.setAttribute('aria-label', ariaLabelFor(day, state));
    if (isLocked) button.setAttribute('aria-disabled', 'true');

    const TypeIcon = message ? TYPE_ICON[message.type] : ICONS.sparkles;
    const sealIcon = isLocked ? ICONS.lock() : isOpened ? ICONS.star() : TypeIcon();

    let hint;
    if (isLocked) hint = '<span class="daycard__hint">shhh…</span>';
    else if (isOpened) hint = `<span class="daycard__hint daycard__hint--done">${ICONS.check()} Letta</span>`;
    else hint = `<span class="daycard__hint daycard__hint--open">${ICONS.beer()} Apri</span>`;

    button.innerHTML = `
      ${state === 'today' ? '<span class="daycard__halo" aria-hidden="true"></span>' : ''}
      <span class="daycard__head">
        <span class="daycard__seal" aria-hidden="true">${sealIcon}</span>
        ${state === 'today' && !day.isFinale ? '<span class="daycard__today-tag">oggi</span>' : ''}
        ${day.isFinale ? `<span class="daycard__today-tag daycard__today-tag--finale">${FESTA.finaleLabel}</span>` : ''}
      </span>
      <span class="daycard__number daycard__number--offset" aria-hidden="true">${offsetLabel(day.offset)}</span>
      <span class="daycard__month" aria-hidden="true">${day.monthLabel}</span>
      ${day.isFinale ? `<span class="daycard__event" aria-hidden="true">${SANTO.nome}</span>` : ''}
      <span class="daycard__footer">${hint}</span>
      ${state === 'today' ? '<span class="daycard__shimmer" aria-hidden="true"></span>' : ''}
    `;

    button.addEventListener('click', () => {
      if (isLocked) {
        shake(button);
        onLocked(day);
      } else {
        onOpen(day);
      }
    });

    wrap.append(button);

    // La stellina nascosta è un bottone a sé, fuori dal bottone-casella:
    // niente elementi interattivi annidati e nessun doppio tocco.
    if (hasStar && !starIsFound) {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'daycard__hiddenstar';
      star.setAttribute('aria-label', `Stellina nascosta nella casella ${offsetLabel(day.offset)}: trovala`);
      star.innerHTML = ICONS.sparkle(13);
      star.addEventListener('pointerdown', (event) => event.stopPropagation());
      star.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        starFound.add(day.offset);
        onHiddenStar(day);
        render(lastDays, lastNow, lastOpened);
      });
      wrap.append(star);
    } else if (hasStar && starIsFound) {
      const found = document.createElement('span');
      found.className = 'daycard__found';
      found.setAttribute('aria-hidden', 'true');
      found.innerHTML = ICONS.sparkle(12);
      wrap.append(found);
    }

    const wrapLabel = document.createElement('span');
    wrapLabel.className = 'daycard-wrap__label';
    wrapLabel.setAttribute('aria-hidden', 'true');
    wrapLabel.textContent = isLocked
      ? 'da scoprire'
      : message
        ? MESSAGE_TYPE_LABEL[message.type]
        : '';

    wrap.append(wrapLabel);
    return wrap;
  }

  function render(days, now, opened) {
    lastDays = days;
    lastNow = now;
    lastOpened = opened;

    const frag = document.createDocumentFragment();
    days.forEach((day, i) => {
      frag.append(card(day, stateOf(day, opened.has(day.key), now), days.length, i));
    });
    grid.replaceChildren(frag);

    const readCount = opened.size;
    const unlocked = getUnlockedCount(days, now);
    const percent = Math.min(100, Math.round((readCount / days.length) * 100));
    if (fill) fill.style.width = `${percent}%`;
    if (label) {
      const daRecuperare =
        unlocked > readCount
          ? ` · <em class="progress__left">${unlocked - readCount} da recuperare</em>`
          : '';
      label.innerHTML = `<strong>${readCount}</strong> di ${days.length} lette${daRecuperare}`;
    }
  }

  return { render };
}
