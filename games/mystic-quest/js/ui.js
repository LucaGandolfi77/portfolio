/* Mystic Quest — liquid glass HUD, dialogue, realm map and journal */
import { REALMS } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { starCount, spiritCount, objectiveList } from './core/progression.js';
import { typed } from './core/story.js';

const $ = id => document.getElementById(id);
let H = {};
let dialogue = null;

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg;
  $('toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2200);
}
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
export function showModal(id) { $(id).classList.add('on'); }
export function closeModal(id) { $(id).classList.remove('on'); }
export function anyModalOpen() { return !!document.querySelector('.modal.on'); }

export function updateHUD(state, realmIndex) {
  $('starCount').textContent = starCount(state) + '/15';
  $('spiritCount').textContent = spiritCount(state) + '/5';
  $('realmName').textContent = REALMS[realmIndex][getLang()];
}
export function setCharge(value, visible) {
  $('chargeWrap').classList.toggle('hidden', !visible);
  $('chargeFill').style.width = Math.round(Math.max(0, Math.min(1, value)) * 100) + '%';
}
export function dialogueActive() { return !!dialogue; }

export function startDialogue(lines, onComplete) {
  dialogue = { lines, index:0, time:0, onComplete };
  $('dialogueName').textContent = 'Luma';
  $('dialogue').classList.add('active');
  $('dialogueText').textContent = '';
}
export function tickDialogue(dt) {
  if (!dialogue) return;
  dialogue.time += dt;
  $('dialogueText').textContent = typed(dialogue.lines[dialogue.index], dialogue.time);
}
export function advanceDialogue() {
  if (!dialogue) return;
  const full = dialogue.lines[dialogue.index];
  if ($('dialogueText').textContent.length < full.length) {
    dialogue.time = full.length / 42;
    $('dialogueText').textContent = full;
    return;
  }
  dialogue.index++;
  if (dialogue.index >= dialogue.lines.length) {
    const cb = dialogue.onComplete;
    dialogue = null;
    $('dialogue').classList.remove('active');
    cb?.();
  } else {
    dialogue.time = 0;
    $('dialogueText').textContent = '';
  }
}

export function renderRealms(state) {
  const lang = getLang();
  $('realmsList').innerHTML = REALMS.map((r, i) => {
    const unlocked = i < state.unlocked;
    const stars = state.stars[i].filter(Boolean).length;
    return `<div class="realm-row">
      <span class="dot" style="background:${r.accent}"></span>
      <span>${esc(r[lang])}</span>
      <small>${unlocked ? '★ ' + stars + '/3' + (state.spirits[i] ? ' 👻' : '') : '🔒 ' + t('realmLocked')}</small>
      ${unlocked && i !== state.realm ? `<button data-travel="${i}">${t('travel')}</button>` : ''}
    </div>`;
  }).join('');
  $('realmsList').querySelectorAll('[data-travel]').forEach(b => b.onclick = () => H.travel(+b.dataset.travel));
}

export function renderJournal(state) {
  const lang = getLang();
  $('objectives').innerHTML = objectiveList(state).map(o =>
    `<div class="objective ${o.done ? 'done' : ''}"><span>${esc(o[lang])}</span><b>${o.current}/${o.goal}</b></div>`).join('');
  $('journalList').innerHTML = state.memories.length
    ? state.memories.slice().reverse().map(m => `<div class="memory">${esc(m.text)}</div>`).join('')
    : `<div class="memory">${t('empty')}</div>`;
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('helpText').textContent = t('helpText');
  $('btnContinue').onclick = H.continue;
  $('btnNew').onclick = H.newGame;
  $('btnRealms').onclick = () => { renderRealms(H.state()); showModal('realmsModal'); };
  $('btnJournal').onclick = () => { renderJournal(H.state()); showModal('journalModal'); };
  $('btnSettings').onclick = () => showModal('settingsModal');
  $('btnHelp').onclick = () => showModal('helpModal');
  $('btnLang').onclick = H.lang;
  $('btnTheme').onclick = H.theme;
  $('btnPause').onclick = () => H.pause(true);
  $('btnResume').onclick = () => H.pause(false);
  $('btnRestart').onclick = H.restart;
  $('btnQuit').onclick = H.quit;
  $('btnEnd').onclick = H.quit;
  $('btnDeleteSave').onclick = H.deleteSave;
  $('dialogue').addEventListener('pointerdown', e => { e.preventDefault(); advanceDialogue(); });
  $('soundCheck').onchange = e => H.prefs({ sound:e.target.checked });
  $('vibrateCheck').onchange = e => H.prefs({ vibration:e.target.checked });
  $('motionCheck').onchange = e => H.prefs({ reducedMotion:e.target.checked });
  document.querySelectorAll('[data-quality]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-quality]').forEach(x => x.classList.remove('on'));
    b.classList.add('on'); H.prefs({ quality:b.dataset.quality });
  });
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeModal(b.dataset.close));
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); }));
  window.addEventListener('mystic:langchange', () => { applyStatic(document); $('helpText').textContent = t('helpText'); H.renderAll(); });
}

export const ui = { initUI, toast, esc, showModal, closeModal, anyModalOpen, updateHUD, setCharge,
  startDialogue, tickDialogue, advanceDialogue, dialogueActive, renderRealms, renderJournal };
