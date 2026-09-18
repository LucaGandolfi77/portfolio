/**
 * percorso.js — il giro dei bar in bicicletta.
 *
 * Le tappe stanno in `data/event.js`: qui si costruisce solo la lista.
 * La numerazione è volutamente "da locandina": numero grande, nome, la riga
 * seria e la battuta.
 */
import { PERCORSO } from '../data/event.js';
import { qs } from '../utils/dom.js';
import { ICONS } from './icons.js';

export function initPercorso() {
  const list = qs('#route-list');
  if (!list) return;

  const frag = document.createDocumentFragment();

  PERCORSO.forEach((tappa, i) => {
    const primo = i === 0;
    const ultimo = i === PERCORSO.length - 1;

    const li = document.createElement('li');
    li.className = `route__stop${primo ? ' route__stop--start' : ''}${ultimo ? ' route__stop--end' : ''}`;
    li.style.setProperty('--in-delay', `${Math.min(i * 0.06, 0.6)}s`);

    const icona = primo ? ICONS.bike(15) : ultimo ? ICONS.church(15) : ICONS.beer(15);

    li.innerHTML = `
      <span class="route__marker" aria-hidden="true">${i + 1}</span>
      <div class="route__body">
        <div class="route__head">
          <span class="route__name">${tappa.nome}</span>
          <span class="route__role">${tappa.ruolo}</span>
        </div>
        <p class="route__nota">${icona}<span>${tappa.nota}</span></p>
        <p class="route__commento">${tappa.commento}</p>
      </div>
    `;

    frag.append(li);
  });

  list.replaceChildren(frag);

  const note = qs('#route-note');
  if (note) {
    note.textContent =
      'In bicicletta si pedala, si beve e si ride. Chi guida non beve: quella è l’unica regola che non si discute.';
  }
}
