/* Pixel Runner — glass overlay: stats, stages, daily challenge, settings */
import { STAGES, OBJECTIVES, POWERUPS } from './config.js';
import { t, getLang, modeName, applyStatic } from './i18n.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, 2200);
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
export function showModal(id) { $(id).classList.add('on'); }
export function closeModal(id) { $(id).classList.remove('on'); }

export function buildOverlay(root) {
  root.insertAdjacentHTML('beforeend', `
    <div class="glass-ui">
      <div class="topbar glass">
        <div class="brand"><span>▸</span><div><b data-i18n="title">PIXEL RUNNER</b><small data-i18n="subtitle">Five stages, four bosses</small></div></div>
        <div class="top-actions">
          <button class="tbtn" id="btnStats" type="button">🏆 <span data-i18n="stats">Statistiche</span></button>
          <button class="tbtn" id="btnStages" type="button">🗺 <span data-i18n="stages">Stage</span></button>
          <button class="tbtn" id="btnDaily" type="button">🎯 <span data-i18n="daily">Sfida</span></button>
          <button class="tbtn" id="btnSettings" type="button">⚙</button>
          <button class="tbtn" id="btnHelp" type="button">?</button>
          <button class="tbtn" id="btnLang" type="button" data-i18n="lang">IT / EN</button>
          <button class="tbtn" id="btnTheme" type="button" data-i18n="theme">Tema</button>
        </div>
      </div>
      <div id="toasts" aria-live="polite"></div>
    </div>`);

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal" id="statsModal"><div class="glass modal-box wide-box">
      <h2>🏆 <span data-i18n="statsTitle">Statistiche</span></h2><div id="statsBody"></div>
      <button class="tbtn big wide" type="button" data-close="statsModal" data-i18n="close">Chiudi</button>
    </div></div>
    <div class="modal" id="stagesModal"><div class="glass modal-box">
      <h2>🗺 <span data-i18n="stages">Stage</span></h2><div id="stagesBody"></div>
      <button class="tbtn big wide" type="button" data-close="stagesModal" data-i18n="close">Chiudi</button>
    </div></div>
    <div class="modal" id="dailyModal"><div class="glass modal-box">
      <h2>🎯 <span data-i18n="daily">Sfida giornaliera</span></h2><p data-i18n="dailyDesc"></p>
      <div id="dailyBody"></div>
      <button class="tbtn big wide" id="btnDailyStart" type="button" data-i18n="start">Inizia</button>
      <button class="tbtn wide" type="button" data-close="dailyModal" data-i18n="close">Chiudi</button>
    </div></div>
    <div class="modal" id="settingsModal"><div class="glass modal-box">
      <h2>⚙ <span data-i18n="settingsTitle">Impostazioni</span></h2>
      <label class="check"><input type="checkbox" id="soundCheck" checked> <span data-i18n="sound">Suono</span></label>
      <label class="check"><input type="checkbox" id="vibrateCheck" checked> <span data-i18n="vibration">Vibrazione</span></label>
      <label class="check"><input type="checkbox" id="motionCheck"> <span data-i18n="motion">Effetti ridotti</span></label>
      <div class="fld"><span data-i18n="quality">Qualità</span><div class="chips">
        <button class="chip" data-quality="low" data-i18n="low">Bassa</button>
        <button class="chip on" data-quality="high" data-i18n="high">Alta</button></div></div>
      <button class="tbtn danger wide" id="btnDeleteSave" type="button" data-i18n="reset">Cancella dati</button>
      <button class="tbtn big wide" type="button" data-close="settingsModal" data-i18n="close">Chiudi</button>
    </div></div>
    <div class="modal" id="helpModal"><div class="glass modal-box">
      <h2>📖 <span data-i18n="help">Guida</span></h2><p id="helpText"></p>
      <button class="tbtn big wide" type="button" data-close="helpModal" data-i18n="close">Chiudi</button>
    </div></div>`);
  applyStatic(document);
}

export function renderStats(profile) {
  const lang = getLang();
  const lines = [
    [t('runs'), profile.runs], [t('win'), profile.wins],
    [t('total'), profile.totalScore.toLocaleString('en-US')],
    [t('best'), profile.bestOverall.toLocaleString('en-US')],
    [t('boss'), profile.bosses], [t('stages'), profile.stages + '/' + STAGES.length]
  ];
  const records = Object.entries(profile.best).length
    ? Object.entries(profile.best).map(([k, v]) =>
        `<div class="stat-line"><span>${esc(k)}</span><b>${Number(v).toLocaleString('en-US')}</b></div>`).join('')
    : `<p>${t('none')}</p>`;
  const goals = OBJECTIVES.map(o =>
    `<div class="stat-line"><span>${esc(o[lang])}</span><b>${profile.objectives[o.id] || 0}/${o.goal}</b></div>`).join('');
  const powers = POWERUPS.map(p => `<span>${p.icon} ${esc(p[lang])}</span>`).join('');
  $('statsBody').innerHTML =
    lines.map(([k, v]) => `<div class="stat-line"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('') +
    `<h3>${t('records')}</h3>${records}` +
    `<h3>${t('achievements')}</h3>${goals}` +
    `<h3>${t('powerups')}</h3><div class="power-grid">${powers}</div>`;
}

export function renderStages(profile) {
  $('stagesBody').innerHTML = STAGES.map((s, i) => {
    const unlocked = i < profile.stages;
    return `<div class="stage-row"><span class="dot" style="background:${s.color}"></span>
      <span>${i + 1}. ${esc(s.name)}</span>
      <small>${unlocked ? s.obstacles + ' obstacles · HP ' + s.bossHp : t('locked')}</small>
      ${unlocked ? `<button data-stage="${i}">${t('enter')}</button>` : ''}</div>`;
  }).join('');
  $('stagesBody').querySelectorAll('[data-stage]').forEach(b => b.onclick = () => H.stage(+b.dataset.stage));
}

export function renderDaily(profile, seed, target) {
  const best = profile.challenges.filter(c => c.seed === seed).sort((a, b) => b.score - a.score)[0];
  $('dailyBody').innerHTML =
    `<div class="stat-line"><span>${t('seed')}</span><b>${seed}</b></div>
     <div class="stat-line"><span>${t('target')}</span><b>${target.toLocaleString('en-US')}</b></div>
     <div class="stat-line"><span>${t('best')}</span><b>${best ? best.score.toLocaleString('en-US') : t('none')}</b></div>`;
}

export function initUI(handlers) {
  H = handlers;
  $('helpText').textContent = t('helpText');
  $('btnStats').onclick = () => { renderStats(H.profile()); showModal('statsModal'); };
  $('btnStages').onclick = () => { renderStages(H.profile()); showModal('stagesModal'); };
  $('btnDaily').onclick = () => { renderDaily(H.profile(), H.seed(), H.target()); showModal('dailyModal'); };
  $('btnDailyStart').onclick = () => { closeModal('dailyModal'); H.daily(); };
  $('btnSettings').onclick = () => showModal('settingsModal');
  $('btnHelp').onclick = () => showModal('helpModal');
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  const prefs = H.prefs();
  $('soundCheck').checked = !!prefs.sound;
  $('vibrateCheck').checked = !!prefs.vibration;
  $('motionCheck').checked = !!prefs.reducedMotion;
  document.querySelectorAll('[data-quality]').forEach(b => b.classList.toggle('on', b.dataset.quality === prefs.quality));
  $('soundCheck').onchange = e => H.setPrefs({ sound:e.target.checked });
  $('vibrateCheck').onchange = e => H.setPrefs({ vibration:e.target.checked });
  $('motionCheck').onchange = e => H.setPrefs({ reducedMotion:e.target.checked });
  document.querySelectorAll('[data-quality]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-quality]').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); H.setPrefs({ quality:b.dataset.quality });
  });
  $('btnDeleteSave').onclick = H.deleteSave;
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));
  window.addEventListener('pixelrunner:langchange', () => { applyStatic(document); $('helpText').textContent = t('helpText'); });
}

export const ui = { initUI, buildOverlay, toast, esc, showModal, closeModal, renderStats, renderStages, renderDaily };
