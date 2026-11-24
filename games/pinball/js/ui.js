/* Pinball — glass stats, challenge, settings and dialogs */
import { TABLES } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { objectives, loadPrefs } from './storage.js';
import { formatScore } from './engine/scoring.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, 2400);
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
export function showModal(id) { $(id).classList.add('on'); }
export function closeModal(id) { $(id).classList.remove('on'); }
export function anyModalOpen() { return !!document.querySelector('.modal.on'); }

export function renderStats(profile) {
  const lang = getLang();
  const lines = [
    [t('games'), profile.games],
    [t('best'), formatScore(profile.bestOverall)],
    ['TOTAL', formatScore(profile.totalScore)]
  ];
  $('statsBody').innerHTML =
    lines.map(([k, v]) => `<div class="stat-line"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('') +
    `<h3>${t('records')}</h3>` +
    TABLES.map(tb => {
      const top = profile.scores[tb.id]?.[0];
      return `<div class="stat-line"><span>${tb.icon} ${esc(tb.name)} · ${esc(tb.tag)}</span><b>${top ? formatScore(top.score) : t('empty')}</b></div>`;
    }).join('') +
    `<h3>${t('achievements')}</h3>` +
    objectives(profile).map(o => `<div class="stat-line"><span>${esc(o[lang])}</span><b>${o.current}/${o.goal}</b></div>`).join('');
}

export function renderChallenge(profile, seed, target) {
  const lang = getLang();
  const best = profile.challenges.filter(c => c.seed === seed).sort((a, b) => b.score - a.score)[0];
  const table = TABLES[profile.tableIdx || 0];
  $('challengeBody').innerHTML =
    `<div class="stat-line"><span>${t('table')}</span><b>${esc(table.name)}</b></div>
     <div class="stat-line"><span>SEED</span><b>${seed}</b></div>
     <div class="stat-line"><span>TARGET</span><b>${formatScore(target)}</b></div>
     <div class="stat-line"><span>${t('best')}</span><b>${best ? formatScore(best.score) : t('empty')}</b></div>`;
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('helpText').textContent = t('helpText');
  $('btnStats').onclick = () => { renderStats(H.profile()); showModal('statsModal'); };
  $('btnChallenge').onclick = () => { renderChallenge(H.profile(), H.seed(), H.target()); showModal('challengeModal'); };
  $('btnChallengeStart').onclick = () => { closeModal('challengeModal'); H.challenge(); };
  $('btnSettings').onclick = () => showModal('settingsModal');
  $('btnHelp').onclick = () => showModal('helpModal');
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  const prefs = loadPrefs();
  $('soundCheck').checked = !!prefs.sound;
  $('vibrateCheck').checked = !!prefs.vibration;
  $('motionCheck').checked = !!prefs.reducedMotion;
  document.querySelectorAll('[data-quality]').forEach(b => b.classList.toggle('on', b.dataset.quality === prefs.quality));
  $('soundCheck').onchange = e => H.prefs({ sound:e.target.checked });
  $('vibrateCheck').onchange = e => H.prefs({ vibration:e.target.checked });
  $('motionCheck').onchange = e => H.prefs({ reducedMotion:e.target.checked });
  document.querySelectorAll('[data-quality]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-quality]').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); H.prefs({ quality:b.dataset.quality });
  });
  $('btnDeleteSave').onclick = H.deleteSave;
  document.querySelectorAll('[data-close]').forEach(b => {
    b.onclick = () => {
      closeModal(b.dataset.close);
      if (b.dataset.close === 'challengeModal') H.cancelChallenge();
    };
  });
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));
  window.addEventListener('pinball:langchange', () => {
    applyStatic(document);
    $('helpText').textContent = t('helpText');
    H.renderAll();
  });
}

export const ui = { initUI, toast, esc, showModal, closeModal, anyModalOpen, renderStats, renderChallenge };
