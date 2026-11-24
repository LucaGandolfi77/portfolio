/** ui.js — rendering dell'interfaccia. */

import { t } from './i18n.js';
import { escapeHtml } from './parser.js';
import { highlight, snippet } from './search.js';
import { displayUrl } from './url.js';

const $ = (id) => document.getElementById(id);

let toastTimer = null;
export function toast(message, kind = '') {
  const holder = $('toast');
  const node = document.createElement('div');
  node.className = 'toast ' + kind;
  node.textContent = message;
  holder.appendChild(node);
  clearTimeout(toastTimer);
  setTimeout(() => node.remove(), 3000);
}

export function setStatus(text, kind = '') {
  $('statusText').textContent = text;
  $('statusBar').className = 'status-bar ' + kind;
}

export function setProgress(percent) {
  $('progressFill').style.width = Math.max(0, Math.min(100, percent)) + '%';
}

export function setDeepProgress(active, scanned = 0, total = 0) {
  $('deepProgress').classList.toggle('on', active);
  $('deepBar').style.width = total ? Math.round((scanned / total) * 100) + '%' : '0%';
  $('deepText').textContent = t('msg.scanProgress', { current: scanned, total });
}

export function renderKeywords(positive, negative) {
  const holder = $('keywordsContainer');
  holder.innerHTML = [...positive.map((value) => ({ value, negative: false })), ...negative.map((value) => ({ value, negative: true }))]
    .map(({ value, negative: isNegative }) => `<span class="keyword-chip ${isNegative ? 'negative' : ''}">${isNegative ? '−' : ''}${escapeHtml(value)}<button data-remove="${escapeHtml(value)}" aria-label="Remove ${escapeHtml(value)}">×</button></span>`).join('');
}

export function renderTabs(counts, active) {
  document.querySelectorAll('.tab-btn[data-tab]').forEach((button) => {
    const tab = button.dataset.tab;
    button.classList.toggle('on', tab === active);
    const count = button.querySelector('.tab-count');
    if (count) count.textContent = String(counts[tab] || 0);
  });
}

export function renderSource(label, cached = false) {
  const el = $('sourcePill');
  el.textContent = (cached ? '⚡ ' : '● ') + t('status.source', { name: label });
  el.classList.add('on');
}

export function renderItems(items, keywords = []) {
  const holder = $('resultsList');
  if (!items.length) {
    holder.innerHTML = `<p class="empty-note">${escapeHtml(t('status.empty'))}</p>`;
    return;
  }
  holder.innerHTML = items.slice(0, 120).map((item) => {
    const title = escapeHtml(item.text || item.name || displayUrl(item.url));
    const url = item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(displayUrl(item.url))}</a>` : '';
    const contextRaw = snippet(item.context || '', keywords, 180);
    return `<article class="result-card">
      <div class="result-top"><strong>${title}</strong>${item.relevance ? `<span class="relevance">★ ${item.relevance}</span>` : ''}</div>
      ${url ? `<div class="result-url">${url}</div>` : ''}
      ${contextRaw ? `<p class="result-context">${highlight(contextRaw, keywords)}</p>` : ''}
      ${item.sourceUrl ? `<small class="result-source">${escapeHtml(displayUrl(item.sourceUrl, 60))}</small>` : ''}
    </article>`;
  }).join('');
}

export function renderHistory(list) {
  const holder = $('historyList');
  if (!list.length) { holder.innerHTML = `<p class="empty-note">${escapeHtml(t('msg.historyEmpty'))}</p>`; return; }
  holder.innerHTML = list.map((entry) => `<div class="history-row">
    <div><strong>${escapeHtml(entry.url)}</strong><small>${escapeHtml((entry.keywords || []).join(', '))}</small></div>
    <div class="history-actions"><button data-replay="${escapeHtml(entry.id)}">↺</button><button data-remove="${escapeHtml(entry.id)}">×</button></div>
  </div>`).join('');
}
