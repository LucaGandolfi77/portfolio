/* Scale Puzzle — panels, HUD, dialogs and stats */
import { MODES, DIFFICULTY, MAX_LEVEL } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { profile } from './storage.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = $('toast'); el.textContent = msg;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2000);
}
export function modal(title, html, actions) {
  $('modalTitle').textContent = title; $('modalBody').innerHTML = html;
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

export function renderHUD(s) {
  $('levelLabel').textContent = t('level') + ' ' + s.level;
  $('movesCount').textContent = t('moves') + ': ' + s.moves;
  $('sequenceOk').textContent = t('sequence') + ': ' + s.progress + ' / ' + s.length;
  $('comboVal').textContent = '×' + s.combo;
  $('scoreVal').textContent = s.score.toLocaleString();
  $('livesVal').textContent = '♥'.repeat(s.lives) + '♡'.repeat(Math.max(0, 3 - s.lives));
  $('hintCount').textContent = s.hints;
  $('hintBtn').disabled = s.hints <= 0 || s.status !== 'playing';
  $('undoBtn').disabled = s.status !== 'playing' || s.progress <= 0;
  $('timer').textContent = s.mode === 'speed'
    ? Math.max(0, 60 - Math.floor(s.elapsed)) + 's'
    : Math.floor(s.elapsed / 60).toString().padStart(2, '0') + ':' + Math.floor(s.elapsed % 60).toString().padStart(2, '0');
  const bar = $('progressFill');
  if (bar) bar.style.width = Math.round(s.progress / Math.max(1, s.length) * 100) + '%';
  const chip = $('modeChip');
  if (chip) chip.textContent = MODES.find(m => m.id === s.mode)?.[getLang()] || s.mode;
}

export function renderLevels() {
  const grid = $('levelGrid'); if (!grid) return;
  let html = '';
  for (let i = 1; i <= 40; i++) {
    const open = profile.unlocked.includes(i);
    const stars = profile.stars[i] || 0;
    html += `<button class="level-btn ${open ? '' : 'locked'} ${i === H.currentLevel() ? 'current' : ''}"
      data-level="${i}" ${open ? '' : 'disabled'}><b>${i}</b><small>${open ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒'}</small></button>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll('[data-level]').forEach(b => b.onclick = () => H.playLevel(+b.dataset.level));
}

export function renderStats() {
  const box = $('statsGrid'); if (!box) return;
  const s = profile.stats;
  const acc = s.moves ? Math.round(s.hits / s.moves * 100) : 0;
  const cards = [
    [t('totalScore'), s.score], [t('levelsDone'), Object.keys(profile.stars).length],
    [t('accuracy'), acc + '%'], [t('played'), s.played],
    [t('wins'), s.wins], [t('unlocked'), profile.unlocked.length]
  ];
  box.innerHTML = cards.map(([k, v]) => `<div class="stat-card"><b>${v}</b><span>${k}</span></div>`).join('');
}

export function renderModePicker() {
  const box = $('modePicker'); if (!box) return;
  box.innerHTML = MODES.map(m => `<button class="mode-btn ${profile.settings.mode === m.id ? 'active' : ''}" data-mode="${m.id}">
    <span>${m.icon}</span><b>${m[getLang()]}</b><small>${m.desc[getLang()]}</small></button>`).join('');
  box.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
    H.setMode(b.dataset.mode); renderModePicker();
  });
}

export function renderDifficulty() {
  const box = $('diffPicker'); if (!box) return;
  box.innerHTML = Object.keys(DIFFICULTY).map(k =>
    `<button data-diff="${k}" class="${profile.settings.difficulty === k ? 'active' : ''}">${t(k)}</button>`).join('');
  box.querySelectorAll('[data-diff]').forEach(b => b.onclick = () => { H.setDifficulty(b.dataset.diff); renderDifficulty(); });
}

export function showResult(s, reason) {
  const win = s.status === 'complete';
  modal(win ? t('levelComplete') : t('gameOver'), `
    <div class="result-stars">${win ? '★'.repeat(s.stars) + '☆'.repeat(3 - s.stars) : '—'}</div>
    <p>${t('moves')}: ${s.moves} · ${t('score')}: ${s.score} · ${t('combo')}: ×${s.maxCombo}</p>
    ${reason === 'lives' ? `<p>${t('noLives')}</p>` : ''}`, [
    { label: t('retry'), fn: () => H.playLevel(s.level) },
    { label: win ? t('next') : t('menu'), primary: true, fn: () => win ? H.playLevel(s.level + 1) : H.toMenu() }
  ]);
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  document.querySelectorAll('.tab').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    $('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'levels') renderLevels();
    if (btn.dataset.tab === 'stats') renderStats();
  });
  $('undoBtn').onclick = H.undo;
  $('hintBtn').onclick = H.hint;
  $('nextBtn').onclick = H.next;
  $('soundBtn').onclick = H.sound;
  $('langBtn').onclick = H.lang;
  $('resetBtn').onclick = () => modal(t('reset'), `<p>${t('reset')}?</p>`, [
    { label: t('cancel') }, { label: t('ok'), primary: true, fn: H.reset }
  ]);
  $('howBtn').onclick = () => modal(t('how'), `<p>${t('howText')}</p>`, [{ label: t('ok'), primary: true }]);
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $('modal').classList.add('hidden');
    if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); H.undo(); }
    if (e.key.toLowerCase() === 'h') H.hint();
  });
  window.addEventListener('puzzle:langchange', () => {
    applyStatic(document); renderModePicker(); renderDifficulty(); renderLevels(); renderStats();
  });
  renderModePicker(); renderDifficulty(); renderLevels(); renderStats();
}

export const ui = { initUI, toast, modal, renderHUD, renderLevels, renderStats,
  renderModePicker, renderDifficulty, showResult, esc };
