/* Slot Collect — accessible DOM shell: HUD, menu, result, shop and gallery */

import { MODES, DIFFICULTY, UPGRADES, SYMBOLS, COLLECTIBLE, ACHIEVEMENTS, MAX_BET } from './config.js';
import { createI18n } from '../../_kit/i18n.js';
import { upgradeCost } from './systems/economy.js';
import { summary as progressionSummary, xpForLevel } from './systems/progression.js';

const $ = (root, id) => root.querySelector('#' + id);

export function createUI(root, { str, dispatch }) {
  const i18n = createI18n(str, 'en');
  const t = i18n.t;
  root.innerHTML = `
    <canvas id="slot-canvas" aria-label="Slot machine reels"></canvas>
    <div id="slot-ui">
      <div class="slot-hud" id="slot-hud" hidden>
        <span class="chip cyan"><small data-k="score"></small><b id="hud-score">0</b></span>
        <span class="chip gold"><small data-k="best"></small><b id="hud-best">0</b></span>
        <span class="chip pink"><small data-k="combo"></small><b id="hud-combo">×0</b></span>
        <span class="chip green"><small data-k="energy"></small><b id="hud-energy">0</b></span>
        <span class="chip violet"><small id="hud-lvl-label"></small><b id="hud-level">1</b></span>
        <span class="chip"><small data-k="streak"></small><b id="hud-streak">0</b></span>
      </div>

      <div class="slot-menu" id="slot-menu">
        <div class="logo">🎰 <span data-k="title"></span></div>
        <p class="tagline" data-k="subtitle"></p>
        <div class="menu-group" id="slot-modes"></div>
        <div class="menu-group" id="slot-diff"></div>
        <button class="btn big" id="slot-play" data-k="play"></button>
        <div class="menu-row">
          <button class="btn ghost" id="slot-help" data-k="help"></button>
          <button class="btn ghost" id="slot-shop" data-k="shop"></button>
          <button class="btn ghost" id="slot-gallery" data-k="gallery"></button>
          <button class="btn ghost" id="slot-ach" data-k="achievements"></button>
        </div>
        <div class="menu-foot">
          <span id="slot-bestline"></span>
          <button class="btn tiny" id="slot-sound">♪</button>
          <button class="btn tiny" id="slot-lang">IT / EN</button>
        </div>
      </div>

      <div class="slot-result" id="slot-result" hidden>
        <h2 id="result-title"></h2>
        <p id="result-score"></p>
        <p id="result-extra"></p>
        <div class="menu-row">
          <button class="btn big" id="result-retry" data-k="retry"></button>
          <button class="btn ghost" id="result-menu" data-k="menu"></button>
          <button class="btn ghost" id="result-shop" data-k="shop"></button>
        </div>
      </div>

      <div class="slot-controls" id="slot-controls" hidden>
        <button class="btn bet" id="bet-down" aria-label="decrease bet">−</button>
        <span class="bet-label"><small data-k="bet"></small> <b id="bet-val">1</b></span>
        <button class="btn bet" id="bet-up" aria-label="increase bet">+</button>
        <button class="btn primary" id="spin-btn" data-k="spin"></button>
        <button class="btn ghost" id="cash-btn" data-k="cash"></button>
        <button class="btn ghost" id="auto-btn" data-k="auto"></button>
      </div>

      <div class="slot-info" id="slot-info" hidden>
        <span id="run-progress"></span>
        <span id="free-spins"></span>
      </div>
      <div class="slot-message" id="slot-message" role="status" aria-live="polite"></div>
      <div id="slot-modal" class="slot-modal" hidden>
        <div class="modal-box">
          <h3 id="modal-title"></h3>
          <div id="modal-body"></div>
          <button class="btn ghost" id="modal-close">✕</button>
        </div>
      </div>
    </div>`;

  const canvas = $(root, 'slot-canvas');
  const el = id => $(root, id);

  function applyLabels() {
    root.querySelectorAll('[data-k]').forEach(node => { node.textContent = t(node.dataset.k); });
    el('slot-lang').textContent = t('lang');
    el('slot-sound').textContent = stateSave()?.sound === false ? '✕' : '♪';
  }
  let lastState = null;
  function stateSave() { return lastState?.save; }

  function renderModes(state) {
    el('slot-modes').innerHTML = MODES.map(m =>
      `<button class="btn ghost ${state.mode === m.id ? 'on' : ''}" data-mode="${m.id}">${m.icon} ${t(m.label)}</button>`).join('');
    el('slot-modes').querySelectorAll('button').forEach(b => b.onclick = () => {
      dispatch({ type:'START', mode:b.dataset.mode, difficulty:state.difficulty });
    });
    el('slot-diff').innerHTML = Object.keys(DIFFICULTY).map(k =>
      `<button class="btn ghost ${state.difficulty === k ? 'on' : ''}" data-diff="${k}">${t(k)}</button>`).join('');
    el('slot-diff').querySelectorAll('button').forEach(b => b.onclick = () => {
      dispatch({ type:'START', mode:state.mode, difficulty:b.dataset.diff });
    });
  }

  function renderMenu(state) {
    const save = state.save;
    el('slot-bestline').textContent = `${t('best')}: ${save.best?.[state.mode] || 0} · ${t('total')}: ${save.spins || 0}`;
    el('slot-play').textContent = t('play');
  }

  function renderHud(state) {
    const r = state.run;
    el('hud-score').textContent = (state.score + (r?.banked || 0)).toLocaleString();
    el('hud-best').textContent = (state.best || 0).toLocaleString();
    el('hud-combo').textContent = `×${state.combo}`;
    el('hud-energy').textContent = r ? `${r.energy}/${r.maxEnergy}` : '—';
    el('hud-level').textContent = String(state.save.level || 1);
    el('hud-lvl-label').textContent = t('level');
    el('hud-streak').textContent = String(state.save.streak?.count || 0);
    el('bet-val').textContent = String(r?.bet || 1);
    el('spin-btn').disabled = !r || (state.phase !== 'idle' && state.phase !== 'resolving');
    el('cash-btn').disabled = !r || r.points <= 0;
    el('auto-btn').classList.toggle('on', !!r?.auto);
    el('auto-btn').disabled = !state.save.upgrades?.autospin;
    const summary = progressionSummary(state.save);
    const pct = Math.min(100, Math.round((summary.xp / Math.max(1, summary.next)) * 100));
    el('run-progress').innerHTML = `XP ${summary.xp} / ${summary.next} <span class="xpbar"><i style="width:${pct}%"></i></span>`;
    el('free-spins').textContent = r?.freeSpins ? `🌟 ${r.freeSpins}` : '';
  }

  function renderResult(state) {
    el('result-title').textContent = state.message === 'bank' ? t('bank') : t(state.message === 'win' ? 'win' : 'lose');
    el('result-score').textContent = `${t('score')}: ${state.score.toLocaleString()}`;
    el('result-extra').textContent = `${state.isBest ? t('newBest') + ' · ' : ''}${t('total')}: ${state.run?.spins || 0} · ${t('best')}: ${state.best}`;
  }

  function openModal(title, html) {
    el('modal-title').textContent = title;
    el('modal-body').innerHTML = html;
    el('slot-modal').hidden = false;
  }
  function closeModal() { el('slot-modal').hidden = true; }

  function shop(state) {
    const cards = UPGRADES.map(u => {
      const lvl = state.save.upgrades?.[u.id] || 0;
      const cost = upgradeCost(u.id, lvl);
      const maxed = lvl >= u.max;
      return `<button class="shop-card ${maxed ? 'maxed' : ''}" data-buy="${u.id}" ${maxed || state.score + (state.run?.banked || 0) < cost ? 'disabled' : ''}>
        <span class="shop-ico">${u.icon}</span><b>${t('upgrade')} ${u.id}</b>
        <small>${'◆'.repeat(lvl)}${'◇'.repeat(Math.max(0, u.max - lvl))}</small>
        <em>${maxed ? 'MAX' : cost}</em></button>`;
    }).join('');
    openModal(t('shop'), `<div class="shop-grid">${cards}</div><p class="modal-note">${t('score')}: ${(state.score + (state.run?.banked || 0)).toLocaleString()}</p>`);
    el('modal-body').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => dispatch({ type:'UPGRADE', id:b.dataset.buy }));
  }
  function gallery(state) {
    const items = SYMBOLS.map(s => {
      const n = state.save.collection?.[s.id] || 0;
      return `<div class="gal-card ${n ? '' : 'locked'}" style="--c:${s.color}"><span>${n ? s.glyph : '❔'}</span><b>${n ? s.id : t('locked')}</b><small>×${n}</small></div>`;
    }).join('');
    openModal(t('gallery'), `<div class="gal-grid">${items}</div>`);
  }
  function achievements(state) {
    const items = ACHIEVEMENTS.map(a => {
      const done = !!state.save.achievements?.[a.id];
      return `<div class="ach-card ${done ? 'done' : ''}"><span>${a.icon}</span><b>${a.label}</b><small>${done ? '✓' : '—'}</small></div>`;
    }).join('');
    openModal(t('achievements'), `<div class="ach-grid">${items}</div>`);
  }

  el('slot-play').onclick = () => dispatch({ type:'START' });
  el('result-retry').onclick = () => dispatch({ type:'START', again:true });
  el('result-menu').onclick = () => dispatch({ type:'MENU' });
  el('result-shop').onclick = () => shop(lastState);
  el('slot-help').onclick = () => openModal(t('help'), `<p class="modal-note">${t('helpText')}</p>`);
  el('slot-shop').onclick = () => shop(lastState);
  el('slot-gallery').onclick = () => gallery(lastState);
  el('slot-ach').onclick = () => achievements(lastState);
  el('modal-close').onclick = closeModal;
  el('slot-modal').onclick = e => { if (e.target === el('slot-modal')) closeModal(); };
  el('slot-sound').onclick = () => root.dispatchEvent(new CustomEvent('slot:sound'));
  el('slot-lang').onclick = () => i18n.setLang(i18n.getLang() === 'it' ? 'en' : 'it');
  el('spin-btn').onclick = () => dispatch({ type:'SPIN' });
  el('bet-down').onclick = () => dispatch({ type:'BET', delta:-1 });
  el('bet-up').onclick = () => dispatch({ type:'BET', delta:1 });
  el('cash-btn').onclick = () => dispatch({ type:'CASH' });
  el('auto-btn').onclick = () => dispatch({ type:'AUTO' });
  canvas.addEventListener('pointerdown', () => dispatch({ type:'SPIN' }));

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'Enter') {
      if (!el('slot-modal').hidden) return;
      e.preventDefault(); dispatch({ type:'SPIN' });
    }
    if (e.code === 'ArrowUp') dispatch({ type:'BET', delta:1 });
    if (e.code === 'ArrowDown') dispatch({ type:'BET', delta:-1 });
    if (e.code === 'KeyC') dispatch({ type:'CASH' });
    if (e.code === 'Escape') closeModal();
  });

  i18n.onChange(() => {
    applyLabels(); renderModes(lastState); renderMenu(lastState);
    document.documentElement.lang = i18n.getLang();
    root.dispatchEvent(new CustomEvent('slot:lang'));
  });
  applyLabels();

  function render(state, action) {
    lastState = state;
    const menu = state.phase === 'menu';
    el('slot-menu').hidden = !menu;
    el('slot-result').hidden = state.phase !== 'result';
    el('slot-hud').hidden = menu;
    el('slot-controls').hidden = menu;
    el('slot-info').hidden = menu;
    renderModes(state); renderMenu(state); renderHud(state);
    if (state.phase === 'result') renderResult(state);
    if (state.message === 'need') toast(t('need'));
    if (state.message === 'bought') toast(t('bought'));
  }

  let toastTimer = null;
  function toast(msg) {
    const n = el('slot-message');
    n.textContent = msg; n.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => n.classList.remove('on'), 1600);
  }

  return { canvas, i18n, t, render, toast, openModal };
}
