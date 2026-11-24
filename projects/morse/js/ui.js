/* Morse Studio — panels, reference chart, training and dialogs */
import { MORSE } from './config.js';
import { t, applyStatic, getLang } from './i18n.js';
import { profile } from './storage.js';

const $ = id => document.getElementById(id);
let H = {};
let trainTab = 'flashcards';

export function toast(msg) {
  const el = $('toast');
  el.textContent = msg; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2200);
}
export function modal(title, html, actions) {
  $('modalTitle').textContent = title;
  $('modalBody').innerHTML = html;
  const bar = $('modalActions'); bar.innerHTML = '';
  (actions || [{ label: t('ok') }]).forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.primary ? 'primary' : 'ghost');
    b.textContent = a.label;
    b.onclick = () => { $('modal').classList.add('hidden'); a.fn?.(); };
    bar.appendChild(b);
  });
  $('modal').classList.remove('hidden');
}
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
export { esc };

export function counts(inputLen, outputLen) {
  $('inputCount').textContent = inputLen + ' ' + t('chars');
  $('outputCount').textContent = outputLen + ' ' + t('chars');
}
export function status(text) { $('statusLabel').textContent = text; }
export function unknownNote(chars) {
  const el = $('unknownNote');
  if (!chars || !chars.length) { el.classList.add('hidden'); return; }
  el.textContent = t('unknown') + ': ' + chars.map(esc).join(' · ');
  el.classList.remove('hidden');
}

export function renderReference(filter = '') {
  const grid = $('refGrid');
  const q = filter.trim().toUpperCase();
  const items = Object.keys(MORSE).filter(k => !q || k === q || MORSE[k].includes(q));
  grid.innerHTML = items.map(ch => `<div class="ref-item" data-ch="${esc(ch)}" title="${t('clickToPlay')}">
    <div class="ref-char">${esc(ch)}</div><div class="ref-morse">${MORSE[ch]}</div></div>`).join('');
  $('refCount').textContent = items.length;
  grid.querySelectorAll('[data-ch]').forEach(el => el.onclick = () => H.refPlay(el.dataset.ch));
}

export function renderHistory() {
  const list = profile.history;
  $('historyPanel').innerHTML = list.length ? list.map((h, i) =>
    `<div class="hist-row" data-i="${i}"><span>${esc(h.input.slice(0, 60))}</span>
      <span>${esc(h.output.slice(0, 60))}</span><span class="act">↩</span></div>`).join('')
    : `<div class="hint">${t('empty')}</div>`;
  $('historyPanel').querySelectorAll('[data-i]').forEach(el => el.onclick = () => H.restore(+el.dataset.i));
}

export function renderTrain(data = {}) {
  const body = $('trainBody');
  document.querySelectorAll('[data-train]').forEach(b => b.classList.toggle('on', b.dataset.train === trainTab));
  if (trainTab === 'flashcards') {
    body.innerHTML = `<div class="train-content">
      <div class="train-prompt">${esc(data.code || '··')}</div>
      <input class="train-input" id="trainGuess" maxlength="1" autocomplete="off">
      <button class="btn primary" id="trainCheck" data-i18n="check">Verifica</button>
      <div class="train-feedback ${data.feedbackClass || ''}" id="trainFeedback">${esc(data.feedback || '')}</div>
      <div class="train-stats"><span>${t('score')} <b>${data.score || 0}</b></span>
        <span>${t('streak')} <b>${data.streak || 0}</b></span>
        <span>${t('best')} <b>${profile.records.flashcards || 0}</b></span></div></div>`;
    $('trainCheck').onclick = () => H.checkFlash($('trainGuess').value);
    $('trainGuess').onkeydown = e => { if (e.key === 'Enter') H.checkFlash($('trainGuess').value); };
  } else if (trainTab === 'dictation') {
    body.innerHTML = `<div class="train-content">
      <div class="train-prompt">${esc(data.expected ? '•••••' : '🎧')}</div>
      <button class="btn primary" id="dictPlay" data-i18n="play">Riproduci</button>
      <input class="train-input" id="dictGuess" autocomplete="off">
      <button class="btn" id="dictCheck" data-i18n="check">Verifica</button>
      <div class="train-feedback ${data.feedbackClass || ''}" id="trainFeedback">${esc(data.feedback || '')}</div>
      <div class="train-stats"><span>${t('score')} <b>${data.score || 0}</b></span>
        <span>${t('best')} <b>${profile.records.dictation || 0}</b></span></div></div>`;
    $('dictPlay').onclick = H.playDictation;
    $('dictCheck').onclick = () => H.checkDict($('dictGuess').value);
  } else {
    body.innerHTML = `<div class="train-content">
      <div class="train-prompt" id="speedPrompt">${esc(data.prompt || '—')}</div>
      <input class="train-input" id="speedGuess" autocomplete="off">
      <div class="train-stats"><span>${t('timeLeft')} <b id="speedTime">${data.seconds || 60}s</b></span>
        <span>${t('score')} <b id="speedScore">${data.score || 0}</b></span>
        <span>${t('best')} <b>${profile.records.speed || 0}</b></span></div>
      <button class="btn primary" id="speedStart" data-i18n="start">Inizia</button></div>`;
    $('speedStart').onclick = H.startSpeed;
  }
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  const s = profile.settings;
  $('wpm').value = s.wpm; $('wpmVal').textContent = s.wpm;
  $('freq').value = s.freq; $('freqVal').textContent = s.freq;
  $('volume').value = Math.round(s.volume * 100); $('volumeVal').textContent = Math.round(s.volume * 100);
  $('strict').checked = !!s.strict;

  $('toMorse').onclick = H.toMorse;
  $('toText').onclick = H.toText;
  $('swapBtn').onclick = H.swap;
  $('clearBtn').onclick = H.clear;
  $('copyInput').onclick = () => H.copy($('inputText').value);
  $('copyOutput').onclick = () => H.copy($('outputText').value);
  $('importBtn').onclick = () => $('importFile').click();
  $('importFile').onchange = e => H.file(e.target.files?.[0]);
  $('dropZone').addEventListener('click', () => $('importFile').click());
  ['dragover','dragenter'].forEach(ev => $('dropZone').addEventListener(ev, e => { e.preventDefault(); $('dropZone').classList.add('dragover'); }));
  ['dragleave','drop'].forEach(ev => $('dropZone').addEventListener(ev, e => { e.preventDefault(); $('dropZone').classList.remove('dragover'); }));
  $('dropZone').addEventListener('drop', e => H.file(e.dataTransfer?.files?.[0]));

  $('favBtn').onclick = H.favorite;
  $('exportTxt').onclick = H.exportTxt;
  $('exportWav').onclick = H.exportWav;
  $('shareBtn').onclick = H.share;
  $('playBtn').onclick = H.play;
  $('pauseBtn').onclick = H.pause;
  $('stopBtn').onclick = H.stop;

  $('wpm').oninput = e => { $('wpmVal').textContent = e.target.value; H.setting({ wpm: +e.target.value }); };
  $('freq').oninput = e => { $('freqVal').textContent = e.target.value; H.setting({ freq: +e.target.value }); };
  $('volume').oninput = e => { $('volumeVal').textContent = e.target.value; H.setting({ volume: +e.target.value / 100 }); };
  $('strict').onchange = e => { H.setting({ strict: e.target.checked }); H.autoDecode(); };

  $('refToggle').onclick = () => { $('refTools').classList.toggle('hidden'); $('refGrid').classList.toggle('hidden'); };
  $('refSearch').oninput = e => renderReference(e.target.value);
  $('histToggle').onclick = () => $('historyPanel').classList.toggle('hidden');
  $('trainToggle').onclick = () => $('trainPanel').classList.toggle('hidden');
  document.querySelectorAll('[data-train]').forEach(b => b.onclick = () => { trainTab = b.dataset.train; renderTrain(H.trainData()); });
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $('modal').classList.add('hidden');
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); H.toMorse(); }
    if (e.code === 'Space' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); H.play(); }
  });
  window.addEventListener('morse:langchange', () => { applyStatic(document); renderReference($('refSearch').value); renderHistory(); renderTrain(H.trainData()); });
  renderReference(); renderHistory(); renderTrain(H.trainData());
  counts($('inputText').value.length, $('outputText').value.length);
}

export const ui = { initUI, toast, modal, counts, status, unknownNote, renderReference,
  renderHistory, renderTrain, get trainTab() { return trainTab; } };
