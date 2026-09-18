/**
 * festa.js — chi era San Donnino e cosa si festeggia il 9 ottobre.
 *
 * I testi stanno in `data/event.js` (fonti: Diocesi di Fidenza, Comune di Fidenza).
 */
import { FESTA, SANTO } from '../data/event.js';
import { qs } from '../utils/dom.js';

export function initFesta() {
  const host = qs('#festa-content');
  if (!host) return;

  const storia = SANTO.storia.map((paragrafo) => `<p>${paragrafo}</p>`).join('');

  host.innerHTML = `
    <ul class="festa__facts">
      <li><strong>${SANTO.epoca}</strong><span>quando è vissuto</span></li>
      <li><strong>${SANTO.morte}</strong><span>il giorno del martirio</span></li>
      <li><strong>${FESTA.città}</strong><span>${FESTA.provincia} · ${FESTA.regione}</span></li>
    </ul>
    <div class="festa__storia">${storia}</div>
    <p class="festa__perche"><strong>Perché il 9 ottobre.</strong> ${SANTO.perche}</p>
    <p class="festa__curiosita">${SANTO.curiosita}</p>
    <p class="festa__duomo">${SANTO.duomo}</p>
  `;
}
