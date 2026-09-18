/**
 * countdown.js — il countdown live verso il 17 ottobre.
 *
 * Il numero di giorni è grande e protagonista; sotto, ore/minuti/secondi
 * scorrono in tempo reale. Il giorno del gran finale il blocco lascia il posto
 * a un messaggio celebrativo.
 *
 * Le cifre cambiano con un'animazione di sola TRASFORMAZIONE: l'opacità resta 1,
 * così un numero non può mai sparire se l'animazione non parte.
 */
import { EVENT, TEAM } from '../data/event.js';
import {
  formatDayFull,
  getCountdownParts,
  getTargetDate,
} from '../utils/dates.js';
import { qs, tricolore } from '../utils/dom.js';

const pad = (value) => String(value).padStart(2, '0');

/** Riavvia una piccola animazione CSS sull'elemento. */
function replay(node, cls) {
  if (!node) return;
  node.classList.remove(cls);
  void node.offsetWidth; // forza il reflow: senza questo l'animazione non riparte
  node.classList.add(cls);
}

export function createCountdown({ TRICOLORE }) {
  const root = qs('#countdown');
  let cells = null;

  function renderClock() {
    root.replaceChildren();
    root.className = 'countdown';
    root.setAttribute('aria-live', 'off');
    root.setAttribute(
      'aria-label',
      `Countdown verso il 17 ottobre, ${EVENT.name} in ${EVENT.place}`,
    );

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
        textContent: `${EVENT.name} · ${EVENT.place}`,
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
    date.textContent = '17 ottobre';
    root.append(date);

    const event = document.createElement('p');
    event.className = 'countdown__arrived-event';
    event.append(
      tricolore(TRICOLORE),
      Object.assign(document.createElement('span'), {
        innerHTML: `<strong>${EVENT.name}</strong> · ${EVENT.place}`,
      }),
    );
    root.append(event);

    const sub = document.createElement('p');
    sub.className = 'countdown__arrived-sub';
    sub.textContent = `${TEAM.name} rappresenta l’Italia. Oggi si pattina. ✨`;
    root.append(sub);

    cells = null;
  }

  function renderArchived(nextLabel) {
    root.replaceChildren();
    root.className = 'countdown';
    root.setAttribute('aria-live', 'off');

    const eyebrow = document.createElement('div');
    eyebrow.className = 'countdown__eyebrow';
    eyebrow.textContent = 'Il diario è completo';
    root.append(eyebrow);

    const text = document.createElement('p');
    text.className = 'countdown__archived';
    text.textContent = 'Il 17 ottobre è passato.';
    root.append(text);

    const sub = document.createElement('p');
    sub.className = 'countdown__archived-sub';
    sub.innerHTML = `Il prossimo appuntamento è il <strong>${nextLabel}</strong>.`;
    root.append(sub);

    cells = null;
  }

  /** Aggiorna la parte numerica. `isTargetDay` e `archived` cambiano lo stato. */
  function update(parts, { today, archived, nextLabel }) {
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

    const units = [
      [cells.hours, pad(parts.hours)],
      [cells.minutes, pad(parts.minutes)],
      [cells.seconds, pad(parts.seconds)],
    ];
    for (const [node, value] of units) {
      if (node.textContent !== value) {
        node.textContent = value;
        replay(node, 'is-changing');
      }
    }

    if (today) {
      cells.today.hidden = false;
      cells.today.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14.5c-.9-1.2-2.6-1-2.6.5 0 1.1 1.4 2 2.6 2.9 1.2-.9 2.6-1.8 2.6-2.9 0-1.5-1.7-1.7-2.6-.5z"/></svg><span>Oggi ti aspetta la casella <strong>${String(today.index).padStart(2, '0')}</strong> · ${formatDayFull(today)}</span>`;
    } else if (cells.today) {
      cells.today.hidden = true;
    }
  }

  /** Il tick: allineato al confine del secondo per evitare sfarfallii. */
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
