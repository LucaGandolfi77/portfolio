import { esc, sparkline, voteColor } from './util.js';
import { ROLE_NAMES, ROLE_EMOJI, formatNum } from '../config.js';

export function html(state) {
  const ordered = state.players.slice().sort((a, b) => {
    const order = { P:0, D:1, C:2, A:3 };
    return order[a.role] - order[b.role] || b.skill - a.skill;
  });
  const last = state.giornata > 0;
  return `
  <div class="section-head">
    <div><h2>La tua rosa</h2><p>${state.players.length} giocatori · moduli ${esc(state.formation)}</p></div>
    <button class="chip-btn" data-action="formation">🔄 Cambia modulo</button>
  </div>
  <div class="pitch-mini"><div class="pitch-line"></div><div class="pitch-circle"></div>
    ${ordered.filter(p => p.titolare).slice(0, 11).map((p, i) => `
      <span class="pitch-dot r-${p.role}" style="left:${8 + (i % 6) * 16}%;top:${18 + Math.floor(i / 6) * 52}%" title="${esc(p.name)}">${ROLE_EMOJI[p.role]}</span>`).join('')}
  </div>
  <div class="card-grid">
    ${ordered.map(p => {
      const voto = last && p.votoStorico.length ? p.votoStorico[p.votoStorico.length - 1] : null;
      return `<article class="player-card ${p.titolare ? 'starter' : 'bench'} ${p.infortunio > 0 ? 'hurt' : ''} ${p.rarity ? 'rarity-' + p.rarity : ''}"
          ${p.cardId ? `data-action="card-detail" data-id="${p.cardId}" role="button" tabindex="0" title="Apri la carta"` : ''}>
        <div class="pc-top">
          <span class="pc-role r-${p.role}">${ROLE_EMOJI[p.role]} ${esc(ROLE_NAMES[p.role].slice(0, 3))}</span>
          <span class="pc-state">${p.infortunio > 0 ? '🏥 ' + p.infortunio + 'g' : p.titolare ? 'TITOLARE' : 'PANCHINA'}</span>
        </div>
        <div class="pc-name">${esc(p.name)}</div>
        <div class="pc-row">
          <span class="pc-skill">★ ${p.skill.toFixed(1)}</span>
          <span class="pc-quot">Q${p.quotazione}</span>
          ${p.cardLevel ? `<span class="pc-level">Lv.${p.cardLevel}</span>` : ''}
          ${voto != null ? `<span class="pc-vote" style="color:${voteColor(voto)}">${voto.toFixed(1)}</span>` : '<span class="pc-vote dim">—</span>'}
        </div>
        <div class="pc-spark">${sparkline(p.votoStorico)}</div>
        <button class="pc-toggle" data-action="toggle-player" data-id="${p.id}">${p.titolare ? 'Panchina' : 'Titolare'}</button>
      </article>`;
    }).join('')}
  </div>`;
}
