import { esc } from './util.js';
import { ROLE_NAMES, ROLE_EMOJI, formatNum } from '../config.js';

export function html(state) {
  const list = state.mercato.length ? state.mercato : [];
  return `
  <div class="section-head">
    <div><h2>Calciomercato</h2><p>${list.length ? 'Offerte fresche, ma occhio ai bidoni' : 'Il mercato si apre a ogni giornata'}</p></div>
    <button class="chip-btn" data-action="refresh-market">🔄 Aggiorna</button>
  </div>
  ${!list.length ? '<div class="empty">Nessuna offerta disponibile. Premi aggiorna.</div>' : `
  <div class="market-grid">
    ${list.map(p => {
      const affordable = state.fc >= p.cost;
      const risk = p.revealed ? (p.isBidone ? '🪣 BIDONE' : '✅ AFFIDABILE') : '❔ SCONOSCIUTO';
      return `<article class="market-card ${p.isBidone && p.revealed ? 'risky' : ''}">
        <div class="mc-head"><span class="pc-role r-${p.role}">${ROLE_EMOJI[p.role]} ${esc(ROLE_NAMES[p.role].slice(0,3))}</span>
          <span class="mc-risk ${p.isBidone && p.revealed ? 'bad' : p.revealed ? 'good' : ''}">${risk}</span></div>
        <div class="mc-name">${esc(p.name)}</div>
        <div class="mc-stats"><span>★ ${p.skill.toFixed(1)}</span><span>Q${p.quotazione}</span>
          <span>${p.revealed ? 'Costanza ' + Math.round(p.costanza * 100) + '%' : 'Costanza ?'}</span></div>
        <div class="mc-foot"><span class="mc-cost ${affordable ? '' : 'poor'}">💸 ${formatNum(p.cost)}</span>
          <button class="buy-btn" data-action="buy" data-id="${p.id}" ${affordable ? '' : 'disabled'}>Acquista</button></div>
      </article>`;
    }).join('')}
  </div>`}`;
}
