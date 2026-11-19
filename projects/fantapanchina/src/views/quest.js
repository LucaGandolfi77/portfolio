import { esc } from './util.js';
import { QUESTS, ACHIEVEMENTS } from '../config.js';

export function html(state) {
  return `
  <div class="section-head"><div><h2>Obiettivi</h2><p>Piccole sfide, ricompense sane</p></div></div>
  <div class="quest-grid">
    ${QUESTS.map(q => {
      const done = !!state.quests[q.id];
      const cur = Math.min(q.target, state.stats[q.stat] || 0);
      return `<div class="quest ${done ? 'done' : ''}">
        <div class="q-top"><span>${done ? '✅' : '🎯'} ${esc(q.name)}</span><span class="q-rew">+${q.reward} FC</span></div>
        <div class="q-desc">${esc(q.desc)}</div>
        <div class="q-bar"><i style="width:${cur / q.target * 100}%"></i></div>
        <div class="q-count">${cur}/${q.target}</div>
      </div>`;
    }).join('')}
  </div>
  <div class="section-head"><div><h2>Traguardi</h2><p>${state.achievements.length}/${ACHIEVEMENTS.length} sbloccati</p></div></div>
  <div class="ach-grid">
    ${ACHIEVEMENTS.map(a => `<div class="ach ${state.achievements.includes(a.id) ? 'got' : ''}">
      <span>${a.icon}</span><div><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></div></div>`).join('')}
  </div>`;
}
