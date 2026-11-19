import { formatNum } from '../config.js';
import { esc } from './util.js';

export function html(state) {
  const teams = state.classifica.slice().sort((a, b) => b.fp - a.fp);
  return `
  <div class="section-head">
    <div><h2>Classifica fanta</h2><p>I tuoi rivali non dormono mai</p></div>
    <button class="chip-btn" data-action="share">📤 Condividi</button>
  </div>
  <div class="league">
    ${teams.map((t, i) => `<div class="league-row ${t.id === 'user' ? 'me' : ''}">
      <span class="lr-pos">${i + 1}</span>
      <span class="lr-badge" style="--tc:${t.color || '#8fa3c4'}">${t.emoji}</span>
      <span class="lr-name">${esc(t.name)}</span>
      <span class="lr-form">${(t.form || []).map(f => `<i class="f-${f}">${f}</i>`).join('')}</span>
      <span class="lr-fp">${formatNum(t.fp)} FP</span>
    </div>`).join('')}
  </div>`;
}
