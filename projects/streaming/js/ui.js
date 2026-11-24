/* Streaming — liquid-glass interface, cards, queue and dialogs */
import { CATEGORIES, SORTS, FLAG_NAMES } from './config.js';
import { t, getLang, applyStatic } from './i18n.js';
import { profile } from './storage.js';
import { detailsUrl } from './api.js';

const $ = id => document.getElementById(id);
let H = {};

export function toast(msg) {
  const el = $('toast'); el.textContent = msg;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2200);
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
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);
}

export function renderCategories(active) {
  const box = $('catChips'); if (!box) return;
  const lang = getLang();
  box.innerHTML = CATEGORIES.map(c =>
    `<button class="chip ${c.id === active ? 'active' : ''}" data-cat="${c.id}" aria-pressed="${c.id === active}">
      ${c.icon} ${c[lang]}</button>`).join('');
  box.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => H.selectCategory(b.dataset.cat));
}

export function renderSort(active) {
  const box = $('sortSel'); if (!box) return;
  const lang = getLang();
  box.innerHTML = SORTS.map(s => `<option value="${s.id}" ${s.id === active ? 'selected' : ''}>${s[lang]}</option>`).join('');
}

export function renderPublicDomain(on) {
  const el = $('pdToggle'); if (!el) return;
  el.checked = !!on;
  const lab = $('pdLabel'); if (lab) lab.textContent = FLAG_NAMES[getLang()];
  const hint = $('licenseHint'); if (hint) hint.textContent = t('licenseHint');
}

export function skeleton() {
  $('results').innerHTML = '<div class="grid">' + Array.from({ length: 8 }, () =>
    '<div class="card sk"><div class="sk-thumb"></div><div class="sk-line"></div><div class="sk-line short"></div></div>').join('') + '</div>';
  $('resCount').textContent = t('loading');
}

export function setStatus(msg, err = false) {
  $('results').innerHTML = `<div class="status ${err ? 'err' : ''}">${esc(msg)}</div>`;
}

export function renderResults(items, opts = {}) {
  $('resCount').textContent = `${t('showing')} ${items.length}${opts.total ? ' / ' + opts.total : ''}`;
  if (!items.length) { setStatus(t('noResults')); return; }
  const grid = document.createElement('div');
  grid.className = 'grid';
  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card result-card glass';
    card.innerHTML = `
      <div class="thumb">
        <img loading="lazy" src="${esc(item.thumb)}" alt="" onerror="this.remove()">
        <span class="ph">🎬</span>
        ${item.publicDomain ? `<span class="pd">PD</span>` : ''}
      </div>
      <div class="rbody">
        <h3>${esc(item.title)}</h3>
        <p class="meta">${esc(item.creator || item.year || item.source)} · ${item.downloads ? esc(String(item.downloads)) + ' ' + t('downloads') : ''}</p>
        <p class="desc">${esc(item.description || '')}</p>
        <div class="row">
          <button class="btn primary" data-play>${t('play')}</button>
          <button class="btn ico" data-fav title="${t('favorites')}">${profile.favorites.some(f => f.id === item.id) ? '♥' : '♡'}</button>
          <button class="btn ico" data-queue title="${t('addToQueue')}">＋</button>
          <a class="btn ico" href="${esc(detailsUrl(item.id))}" target="_blank" rel="noopener" title="${t('openArchive')}">↗</a>
        </div>
      </div>`;
    card.querySelector('[data-play]').onclick = () => H.play(item);
    card.querySelector('[data-fav]').onclick = e => {
      const on = H.favorite(item);
      e.currentTarget.textContent = on ? '♥' : '♡';
      toast(on ? t('saved') : t('removed'));
    };
    card.querySelector('[data-queue]').onclick = () => {
      const ok = H.queueAdd(item);
      toast(ok ? t('addedQueue') : t('queue'));
    };
    grid.appendChild(card);
  });
  $('results').innerHTML = '';
  $('results').appendChild(grid);
  const more = $('loadMore');
  more?.classList.toggle('hidden', !opts.hasMore);
}

export function renderQueue(items) {
  const box = $('queueList'); if (!box) return;
  box.innerHTML = items.length ? items.map((it, i) => `
    <div class="queue-row" data-i="${i}">
      <span>${i + 1}</span><b>${esc(it.title)}</b>
      <button data-play="${i}" class="btn">▶</button>
      <button data-remove="${i}" class="btn ico">✕</button>
    </div>`).join('') : `<p class="hint">${t('emptyQueue')}</p>`;
  box.querySelectorAll('[data-play]').forEach(b => b.onclick = () => H.playQueue(+b.dataset.play));
  box.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => H.queueRemove(+b.dataset.remove));
  const badge = $('queueBadge');
  if (badge) { badge.textContent = items.length; badge.classList.toggle('hidden', !items.length); }
}

export function renderLibrary(kind, items) {
  const box = $(kind === 'favorites' ? 'favList' : 'historyList'); if (!box) return;
  box.innerHTML = items.length ? items.map(it => `
    <button class="lib-row" data-id="${esc(it.id)}"><span>🎬</span><b>${esc(it.title)}</b><small>${esc(it.creator || '')}</small></button>`).join('')
    : `<p class="hint">${kind === 'favorites' ? t('emptyFavorites') : t('emptyHistory')}</p>`;
  box.querySelectorAll('[data-id]').forEach(b => b.onclick = () => H.playId(b.dataset.id));
}

export function showPanel(name) {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.toggle('open', p.id === 'panel-' + name));
  document.querySelectorAll('.stab').forEach(b => b.classList.toggle('on', b.dataset.panel === name));
}

export function initUI(handlers) {
  H = handlers;
  applyStatic(document);
  $('searchForm').onsubmit = e => { e.preventDefault(); H.search($('q').value.trim()); };
  $('urlForm').onsubmit = e => { e.preventDefault(); H.customUrl($('urlInput').value.trim()); };
  $('langBtn').onclick = H.lang;
  $('themeBtn').onclick = H.theme;
  $('pdToggle').onchange = e => H.publicDomain(e.target.checked);
  $('sortSel').onchange = e => H.sort(e.target.value);
  $('yearFrom').onchange = () => H.filters();
  $('yearTo').onchange = () => H.filters();
  $('loadMore').onclick = H.loadMore;
  $('closePlayer').onclick = H.closePlayer;
  $('pipBtn').onclick = H.pip;
  $('fsBtn').onclick = H.fullscreen;
  $('nextBtn').onclick = H.next;
  $('prevBtn').onclick = H.prev;
  $('shareBtn').onclick = H.share;
  document.querySelectorAll('.stab').forEach(b => b.onclick = () => showPanel(b.dataset.panel));
  $('clearHistory').onclick = H.clearHistory;
  $('clearFav').onclick = H.clearFavorites;
  $('clearQueue').onclick = H.clearQueue;
  $('modal').addEventListener('click', e => { if (e.target === $('modal')) $('modal').classList.add('hidden'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('modal').classList.add('hidden'); H.closePlayer(); }
    if (e.key === ' ' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName) && !$('player').classList.contains('hidden')) {
      e.preventDefault(); H.togglePlay();
    }
    if (e.code === 'KeyN') H.next();
    if (e.code === 'KeyP') H.prev();
  });
  window.addEventListener('streaming:langchange', () => { applyStatic(document); H.renderAll(); });
}

export const ui = { initUI, toast, modal, esc, renderCategories, renderSort, renderPublicDomain,
  skeleton, setStatus, renderResults, renderQueue, renderLibrary, showPanel };
