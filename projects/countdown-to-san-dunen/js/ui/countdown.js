/**
 * countdown.js — il countdown live al 9 ottobre.
 *
 * Il numero di giorni è grande e protagonista; sotto, ore/minuti/secondi
 * scorrono in tempo reale. Il giorno della festa il blocco lascia il posto
 * al messaggio celebrativo.
 *
 * Le cifre si muovono con un'animazione di sola TRASFORMAZIONE: l'opacità resta 1,
 * così un numero non può mai sparire se l'animazione non parte.
 */
import { FESTA, SANTO, TEAM } from '../data/event.js';
import { formatDayFull, getCountdownParts, getTargetDate } from '../utils/dates.js';
import { qs, tricolore } from '../utils/dom.js';

const pad = (value) => String(value).padStart(2, '0');

const ICON_CAL = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;

/** Riavvia una piccola animazione CSS. */
function replay(node, cls) {
  if (!node) return;
  node.classList.remove(cls);
  void node.offsetWidth; // reflow: senza questo l'animazione non riparte
  node.classList.add(cls);
}

export function createCountdown({ TRICOLORE }) {
  const root = qs('#countdown');
  let cells = null;

  function renderClock() {
    root.replaceChildren();
    root.className = 'countdown';
    root.setAttribute('aria-live', 'off');
    root.setAttribute('aria-label', `Countdown al ${FESTA.giorno}, ${SANTO.nome} a ${FESTA.città}`);

    const eyebrow = document.createElement('div');
    eyebrow.className = 'countdown__eyebrow';
    eyebrow.textContent = 'Mancano ancora';
    root.append(eyebrow);

    const days = document.createElement('div');
    days.className = 'countdown__days';
    days.innerHTML =
      '<span class="countdown__days-number" id="cd-days">0</span><span class="countdown__days-label">giorni</span>';
    root.append(days);

    const event = document.createElement('p');
    event.className = 'countdown__event';
    event.append(
      tricolore(TRICOLORE),
      Object.assign(document.createElement('span'), {
        textContent: `${FESTA.nomignolo} · ${FESTA.città}`,
      }),
    );
    root.append(event);

    const clock = document.createElement('div');
    clock.className = 'countdown__clock';
    clock.setAttribute('role', 'timer');
    clock.innerHTML = `
      <div class="timeunit"><div class="timeunit__value"><span class="timeunit__digits" id="cd-hours">00</span></div><span class="timeunit__label">ore</span></div>
      <span class="countdown__colon" aria-hidden="true">:</span>
      <div class="timeunit"><div class="timeunit__value"><span class="timeunit__digits" id="cd-minutes">00</span></div><span class="timeunit__label">min</span></div>
      <span class="countdown__colon" aria-hidden="true">:</span>
      <div class="timeunit"><div class="timeunit__value"><span class="timeunit__digits" id="cd-seconds">00</span></div><span class="timeunit__label">sec</span></div>
    `;
    root.append(clock);

    const today = document.createElement('p');
    today.className = 'countdown__today';
    today.id = 'cd-today';
    today.hidden = true;
    root.append(today);

    cells = {
      days: qs('#cd-days'),
      hours: qs('#cd-hours'),
      minutes: qs('#cd-minutes'),
      seconds: qs('#cd-seconds'),
      today: qs('#cd-today'),
    };
  }

  function renderArrived() {
    root.replaceChildren();
    root.className = 'countdown countdown--arrived';
    root.setAttribute('aria-live', 'polite');
    root.removeAttribute('aria-label');

    const badge = document.createElement('div');
    badge.className = 'countdown__badge';
    badge.textContent = 'È arrivato il giorno';
    root.append(badge);

    const date = document.createElement('p');
    date.className = 'countdown__arrived-date';
    date.textContent = FESTA.giorno;
    root.append(date);

    const event = document.createElement('p');
    event.className = 'countdown__arrived-event';
    event.append(
      tricolore(TRICOLORE),
      Object.assign(document.createElement('span'), {
        innerHTML: `<strong>${SANTO.nome}</strong> · ${FESTA.città}`,
      }),
    );
    root.append(event);

    const sub = document.createElement('p');
    sub.className = 'countdown__arrived-sub';
    sub.textContent = `${TEAM.name} è pronta. Oggi si pedala. 🚲`;
    root.append(sub);

    cells = null;
  }

  function renderArchived(nextLabel) {
    root.replaceChildren();
    root.className = 'countdown';
    root.setAttribute('aria-live', 'off');

    const eyebrow = document.createElement('div');
    eyebrow.className = 'countdown__eyebrow';
    eyebrow.textContent = 'Il countdown è finito';
    root.append(eyebrow);

    const text = document.createElement('p');
    text.className = 'countdown__archived';
    text.textContent = 'Il 9 ottobre è passato.';
    root.append(text);

    const sub = document.createElement('p');
    sub.className = 'countdown__archived-sub';
    sub.innerHTML = `Il prossimo San Dunén è il <strong>${nextLabel}</strong>.`;
    root.append(sub);

    cells = null;
  }

  /** Il countdown non è ancora iniziato (siamo prima del 9 settembre). */
  function renderWaiting(startLabel) {
    root.replaceChildren();
    root.className = 'countdown';
    root.setAttribute('aria-live', 'off');

    const eyebrow = document.createElement('div');
    eyebrow.className = 'countdown__eyebrow';
    eyebrow.textContent = 'Il countdown comincia il';
    root.append(eyebrow);

    const text = document.createElement('p');
    text.className = 'countdown__archived';
    text.textContent = startLabel;
    root.append(text);

    const sub = document.createElement('p');
    sub.className = 'countdown__archived-sub';
    sub.textContent = 'Torna quel giorno: la prima casella ti aspetta.';
    root.append(sub);

    cells = null;
  }

  function update(parts, { today, archived, before, nextLabel, startLabel }) {
    if (before) {
      if (!qs('.countdown__archived', root)) renderWaiting(startLabel);
      return;
    }
    if (parts.isTargetDay) {
      if (!root.classList.contains('countdown--arrived')) renderArrived();
      return;
    }
    if (archived) {
      if (!qs('.countdown__archived', root)) renderArchived(nextLabel);
      return;
    }
    if (!cells) renderClock();

    const daysText = String(parts.days);
    if (cells.days.textContent !== daysText) {
      cells.days.textContent = daysText;
      replay(cells.days, 'is-changing');
    }
    const label = root.querySelector('.countdown__days-label');
    if (label) label.textContent = parts.days === 1 ? 'giorno' : 'giorni';

    for (const [node, value] of [
      [cells.hours, pad(parts.hours)],
      [cells.minutes, pad(parts.minutes)],
      [cells.seconds, pad(parts.seconds)],
    ]) {
      if (node.textContent !== value) {
        node.textContent = value;
        replay(node, 'is-changing');
      }
    }

    if (today) {
      cells.today.hidden = false;
      cells.today.innerHTML = `${ICON_CAL(15)}<span>Oggi ti aspetta la casella <strong>${
        today.offset === 0 ? '0' : today.offset
      }</strong> · ${formatDayFull(today)}</span>`;
    } else if (cells.today) {
      cells.today.hidden = true;
    }
  }

  /** Il tick, allineato al confine del secondo. */
  function start(onTick) {
    let timeoutId = 0;

    const tick = () => {
      const now = new Date();
      onTick(now);
      timeoutId = window.setTimeout(tick, 1000 - (now.getTime() % 1000));
    };

    tick();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timeoutId);
        tick();
      }
    });

    return () => window.clearTimeout(timeoutId);
  }

  return { update, start, getTarget: () => getTargetDate(new Date()) };
}
