/**
 * ui.js — rendering dei risultati, pannelli e storico.
 */

import { LANGUAGES, languageLabel } from './language.js';
import { alignment, similarity, levenshtein } from './compare.js';

const $ = (id) => document.getElementById(id);
export const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (character) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

let toastTimer = null;
export function toast(message) {
  const node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('on'), 2600);
}

export function renderResult(element, data, t, { onCopy, onGuess, onExport } = {}) {
  if (!element) return;
  const guesses = data.guesses || [];
  const analysis = data.analysis || {};
  element.innerHTML = `
    <div class="result-card">
      <div class="row"><div class="ok">${esc(t('label.heard'))}</div><div class="ov cy">${esc(data.ortho || '—')}</div></div>
      <div class="row"><div class="ok">${esc(t('label.ipa'))}</div><div class="ov mono gr">${esc(data.ipa || '—')}</div></div>
      <div class="row"><div class="ok">${esc(t('label.key'))}</div><div class="ov mono am">${esc(data.key || '—')}</div></div>
      ${data.spans && data.spans.length ? '<div class="sourcemap">' + data.spans.map((span) =>
        `<span class="span"><b>${esc(span.text)}</b><i>→</i><em>${esc(span.ipa || '—')}</em></span>`).join('') + '</div>' : ''}
      <div class="phon-panel">
        <div class="ph"><span>${esc(t('label.syllables'))}</span><b>${analysis.syllables ?? 0}</b></div>
        <div class="ph"><span>${esc(t('label.vowels'))}</span><b>${analysis.vowels ?? 0}</b></div>
        <div class="ph"><span>${esc(t('label.consonants'))}</span><b>${analysis.consonants ?? 0}</b></div>
        <div class="ph"><span>${esc(t('label.stress'))}</span><b>${analysis.stressMarks ?? 0}</b></div>
      </div>
      ${analysis.phonemes && analysis.phonemes.length ? '<div class="phon-grid">' + analysis.phonemes.map((item) =>
        `<span class="phon ${item.type}">${esc(item.symbol)}</span>`).join('') + '</div>' : ''}
      <div class="tags">${guesses.slice(0, 3).map((guess) =>
        `<span class="tag cy">${esc(LANGUAGES[guess.lang]?.flag || '🌐')} ${esc(languageLabel(guess.lang))} ${guess.pct}%</span>`).join('')}</div>
      <div class="engine-note">${esc(t('label.engine'))}: <b>${esc(data.engine || 'heuristic')}</b>${data.voice ? ' · ' + esc(data.voice) : ''}</div>
      <div class="out-tools">
        <button class="btn ghost sm" data-act="copy">${esc(t('action.copy'))}</button>
        <button class="btn ghost sm" data-act="guess">${esc(t('action.guess'))}</button>
        <button class="btn ghost sm" data-act="png">${esc(t('action.exportPNG'))}</button>
      </div>
    </div>`;
  element.querySelector('[data-act=copy]')?.addEventListener('click', () => onCopy && onCopy(data));
  element.querySelector('[data-act=guess]')?.addEventListener('click', () => onGuess && onGuess(data));
  element.querySelector('[data-act=png]')?.addEventListener('click', () => onExport && onExport(data));
}

export function renderLanguageBars(element, guesses, t) {
  if (!element) return;
  if (!guesses.length) { element.innerHTML = `<p class="muted">${esc(t('hint.compareEmpty'))}</p>`; return; }
  element.innerHTML = guesses.map((guess) => `
    <div class="gbar"><span class="gl">${esc(LANGUAGES[guess.lang]?.flag || '🌐')} ${esc(languageLabel(guess.lang))}</span>
      <div class="gt"><div class="gf" style="width:${guess.pct}%"></div></div>
      <span class="gv">${guess.pct}%</span></div>`).join('');
}

export function renderCompare(element, first, second, t) {
  if (!element) return;
  const a = String(first || ''), b = String(second || '');
  if (!a || !b) { element.innerHTML = `<p class="muted">${esc(t('hint.compareEmpty'))}</p>`; return; }
  const score = similarity(a, b);
  const cells = alignment(a, b).map((item) => {
    const symbol = item.type === 'match' ? '=' : item.type === 'swap' ? '≈' : item.type === 'insert' ? '+' : '−';
    return `<span class="cell ${item.type}"><small>${esc(item.a || '·')}${symbol}${esc(item.b || '·')}</small></span>`;
  }).join('');
  element.innerHTML = `
    <div class="compare-head"><span>${esc(a)}</span><b>${score}%</b><span>${esc(b)}</span></div>
    <div class="compare-meta">${esc(t('label.distance'))}: ${levenshtein(a, b).distance}</div>
    <div class="heatmap">${cells}</div>`;
}

export function renderStats(element, history) {
  if (!element) return;
  const sources = { live: 0, file: 0, manuale: 0, import: 0 };
  const languages = {};
  history.forEach((item) => {
    sources[item.source] = (sources[item.source] || 0) + 1;
    const language = item.whisperLang || '?';
    languages[language] = (languages[language] || 0) + 1;
  });
  const top = Object.entries(languages).sort((a, b) => b[1] - a[1])[0];
  element.innerHTML = `
    <div><b>${history.length}</b><span>total</span></div>
    <div><b>${sources.live || 0}</b><span>live</span></div>
    <div><b>${sources.file || 0}</b><span>file</span></div>
    <div><b>${esc(top ? top[0] : '—')}</b><span>top</span></div>`;
}

export function renderHistory(element, list, t, { onCopy, onDelete }) {
  if (!element) return;
  if (!list.length) { element.innerHTML = `<p class="muted">${esc(t('hint.historyEmpty'))}</p>`; return; }
  element.innerHTML = list.map((item, index) => `
    <div class="hist-item"><div class="hh"><div class="hw">${esc(item.ortho || '—')}</div>
      <div class="row"><button class="btn ghost sm" data-copy="${index}">📋</button>
        <button class="btn ghost sm" data-del="${index}">✕</button></div></div>
      <div class="hi mono">${esc(item.ipa)}</div>
      <div class="hk mono">k: ${esc(item.key)} · ${esc(item.source)} · ${esc(item.engine || '')}</div></div>`).join('');
  element.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', () => onCopy && onCopy(list[Number(button.dataset.copy)])));
  element.querySelectorAll('[data-del]').forEach((button) => button.addEventListener('click', () => onDelete && onDelete(Number(button.dataset.del))));
}

export function setStatus(element, kind, message) {
  if (!element) return;
  element.className = 'status ' + (kind || '');
  const label = element.querySelector('span');
  if (label) label.textContent = message;
}

export function setProgress(wrap, fill, label, percent, visible) {
  if (!wrap || !fill || !label) return;
  wrap.classList.toggle('on', !!visible);
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  fill.style.width = value + '%';
  label.textContent = Math.round(value) + '%';
}
