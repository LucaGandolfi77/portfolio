import { esc } from './util.js';
import { UPGRADES, PRESTIGE_NAMES, formatNum } from '../config.js';
import { getUpgradeCost } from '../sim.js';

export function html(state) {
  return `
  <div class="section-head">
    <div><h2>Strutture</h2><p>Potenziamenti permanenti della tua squadra</p></div>
    <div class="scudetti">🏆 ${state.scudetti} <span class="sep">·</span> 💎 ${state.scudettiDoro}</div>
  </div>
  <div class="upgrade-grid">
    ${UPGRADES.map(u => {
      const lvl = state.upgrades[u.id] || 0;
      const cost = getUpgradeCost(state, u.id);
      const max = lvl >= u.maxLevel;
      return `<article class="upgrade-card ${max ? 'maxed' : ''}">
        <div class="uc-ico">${u.emoji}</div>
        <div class="uc-body"><div class="uc-name">${esc(u.name)} <span class="uc-lvl">Lv ${lvl}/${u.maxLevel}</span></div>
          <div class="uc-desc">${esc(u.desc)}</div>
          <div class="uc-bar"><i style="width:${Math.min(100, lvl / u.maxLevel * 100)}%"></i></div></div>
        <button class="up-btn" data-action="upgrade" data-id="${u.id}" ${max || state.fc < cost ? 'disabled' : ''}>
          ${max ? 'MAX' : '💸 ' + formatNum(cost)}</button>
      </article>`;
    }).join('')}
  </div>
  <div class="prestige-box">
    <div class="pb-icon">🏆</div>
    <div class="pb-body"><h3>Scudetto d’oro</h3>
      <p>Azzera la stagione ma dà +25% di introiti permanenti. Ne hai ${state.scudettiDoro} · prossimo: ${esc(PRESTIGE_NAMES[Math.min(state.scudettiDoro, PRESTIGE_NAMES.length - 1)])}</p></div>
    <button class="prestige-btn" data-action="prestige" ${state.scudetti < 1 ? 'disabled' : ''}>Nuova stagione</button>
  </div>`;
}
