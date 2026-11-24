/* Reverse Lyrics Finder — DOM rendering, sheets and focus management */
import { DEMOS, COUNTRIES, GENIUS } from './config.js';
import { t, applyStatic, getLang } from './i18n.js';
import { escapeHtml } from './search.js';

const $ = id => document.getElementById(id);
const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const HEART = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-8-4.9-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 3.5C20 16.1 12 21 12 21z"/></svg>';
const shared = { handlers: null, focusRestore: null, activeSheet: null };

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('on'), 2400);
}

function trapFocus(sheet, e) {
  if (e.key !== 'Tab') return;
  const nodes = [...sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(n => !n.disabled && n.offsetParent !== null);
  if (!nodes.length) return;
  const first = nodes[0], last = nodes[nodes.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function openSheet(id, focusId) {
  shared.focusRestore = document.activeElement;
  const backdrop = $(id), sheet = backdrop.querySelector('.sheet');
  backdrop.hidden = false;
  document.body.classList.add('sheet-open');
  shared.activeSheet = { backdrop, sheet };
  setTimeout(() => ($(focusId) || sheet).focus?.(), 40);
}
function closeSheet() {
  if (!shared.activeSheet) return;
  shared.activeSheet.backdrop.hidden = true;
  document.body.classList.remove('sheet-open');
  shared.activeSheet = null;
  if (shared.focusRestore) shared.focusRestore.focus?.({ preventScroll: true });
}

function renderDemos() {
  const row = $('demos');
  row.innerHTML = `<span class="lbl">${t('tryLine')}</span>` + DEMOS.map(q =>
    `<button class="chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('');
  row.querySelectorAll('[data-q]').forEach(b => b.onclick = () => shared.handlers?.search(b.dataset.q, true));
}

function renderRecent(list) {
  const row = $('recentRow');
  if (!list.length) { row.hidden = true; return; }
  row.hidden = false;
  row.innerHTML = `<span class="lbl">${t('recent')}</span>` + list.slice(0, 8).map(q =>
    `<button class="chip" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join('');
  row.querySelectorAll('[data-q]').forEach(b => b.onclick = () => shared.handlers?.search(b.dataset.q, true));
}

function renderCountries(current) {
  const sel = $('country');
  sel.innerHTML = COUNTRIES.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c.toUpperCase()}</option>`).join('');
  const setSel = $('setCountry');
  if (setSel) setSel.innerHTML = sel.innerHTML;
}

function setSearching(on) {
  $('searchBtn').disabled = on;
  $('searchBtn').querySelector('span').textContent = on ? t('searching') : t('find');
}

function setOffline(on) { $('offlineNote').hidden = !on; }

function skeleton() {
  $('results').innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  $('resultsHead').hidden = false;
  $('resultsMeta').textContent = t('loading');
}

function showState(icon, html) {
  $('results').innerHTML = `<div class="state"><span class="big">${icon}</span><div>${html}</div></div>`;
}

function renderResults(list, query) {
  const res = $('results');
  if (!list.length) {
    $('resultsHead').hidden = true;
    showState('🎶', t('noResults', { q: escapeHtml(query) }));
    return;
  }
  $('resultsHead').hidden = false;
  $('resultsMeta').textContent = t('results', { n: list.length });
  res.innerHTML = '';
  list.forEach((s, i) => {
    const art = (s.artworkUrl100 || '').replace('100x100bb', '300x300bb');
    const year = (s.releaseDate || '').slice(0, 4);
    const meta = [year, s.primaryGenreName, s.trackTimeMillis ? Math.round(s.trackTimeMillis / 60000) + ' min' : '']
      .filter(Boolean).map(x => `<b>${escapeHtml(x)}</b>`).join(' · ');
    const pct = s.matchScore || 0;
    const card = document.createElement('div');
    card.className = 'rcard';
    card.innerHTML =
      (art ? `<img class="cover" loading="lazy" src="${escapeHtml(art)}" alt="">`
           : '<div class="cover placeholder">🎵</div>') +
      `<div class="rbody"><div class="rtitle">${escapeHtml(s.trackName)}</div>
        <div class="rartist">${escapeHtml(s.artistName || '')}${s.collectionName ? ' — ' + escapeHtml(s.collectionName) : ''}</div>
        <div class="rmeta"><span class="match ${pct < 60 ? 'low' : ''}">${t('match', { n: pct })}</span>${meta}</div></div>
      <div class="ractions">
        ${s.previewUrl ? `<button class="icon-btn" data-i="${i}" data-play aria-label="${t('play')}" title="${t('play')}">${PLAY}</button>` : ''}
        <button class="lyrbtn" data-i="${i}" data-lyr>${t('text')}</button>
        <button class="icon-btn" data-i="${i}" data-fav aria-label="${t('favorite')}">${HEART}</button>
        ${s.trackViewUrl ? `<a class="icon-btn" href="${escapeHtml(s.trackViewUrl)}" target="_blank" rel="noopener" aria-label="${t('openApple')}" title="${t('openApple')}">↗</a>` : ''}
      </div>`;
    const play = card.querySelector('[data-play]');
    if (play) play.onclick = () => shared.handlers?.preview(s);
    card.querySelector('[data-lyr]').onclick = () => shared.handlers?.lyrics(s);
    card.querySelector('[data-fav]').onclick = e => {
      const added = shared.handlers?.favorite(s);
      e.currentTarget.classList.toggle('on', !!added);
      toast(added ? t('favorites') : t('clear'));
    };
    res.appendChild(card);
  });
}

function openLyrics(song, html, source) {
  const art = (song.artworkUrl100 || '').replace('100x100bb', '300x300bb');
  $('lmArt').src = art || '';
  $('lmTitle').textContent = song.trackName || '';
  $('lmArtist').textContent = song.artistName || '';
  $('lmBody').innerHTML = html || '';
  $('lmSrc').textContent = source || '—';
  $('lmGenius').href = GENIUS + encodeURIComponent((song.artistName || '') + ' ' + (song.trackName || ''));
  openSheet('lyrModal', 'lmClose');
}
function setLyricsLoading() { $('lmBody').innerHTML = `<div class="state">${t('loadingLyrics')}</div>`; }
function setLyricsError(song) {
  $('lmBody').innerHTML = `<div class="state"><span class="big">📭</span><div>${t('noLyrics')}<br>
    <a class="btn ghost small" style="margin-top:10px;text-decoration:none" href="${GENIUS + encodeURIComponent((song.artistName || '') + ' ' + (song.trackName || ''))}" target="_blank" rel="noopener">Genius ↗</a>
    <a class="btn ghost small" style="margin-top:10px;text-decoration:none" href="https://www.google.com/search?q=${encodeURIComponent('"' + (song.artistName || '') + ' ' + (song.trackName || '') + '" lyrics')}" target="_blank" rel="noopener">Google ↗</a></div></div>`;
  $('lmSrc').textContent = '—';
}

function openSettings() { openSheet('settingsModal', 'setClose'); }
function applyTheme(theme) { document.documentElement.dataset.theme = theme; }

function initUI(handlers) {
  shared.handlers = handlers;
  applyStatic(document);
  renderDemos();
  renderCountries(handlers.settings.country);
  $('setTheme').value = handlers.settings.theme || 'dark';

  $('searchBtn').onclick = () => handlers.search($('q').value);
  $('q').addEventListener('keydown', e => { if (e.key === 'Enter') handlers.search($('q').value); });
  $('q').addEventListener('input', () => { $('clearBtn').hidden = !$('q').value; });
  $('clearBtn').onclick = () => { $('q').value = ''; $('clearBtn').hidden = true; handlers.stop(); $('q').focus(); };
  $('lyricSearchBtn').onclick = () => handlers.genius($('q').value);
  $('favFilterBtn').onclick = () => handlers.favorites();
  $('strictCheck').checked = !!handlers.settings.exact;
  $('strictCheck').onchange = e => handlers.setSetting({ exact: e.target.checked });
  $('country').onchange = e => { handlers.setSetting({ country: e.target.value }); $('setCountry').value = e.target.value; };
  $('settingsBtn').onclick = openSettings;
  $('setClose').onclick = closeSheet;
  $('setCountry').onchange = e => { handlers.setSetting({ country: e.target.value }); $('country').value = e.target.value; };
  $('setTheme').onchange = e => { handlers.setSetting({ theme: e.target.value }); applyTheme(e.target.value); };
  $('setClearCache').onclick = () => { handlers.clearCache(); toast(t('clear')); };
  $('lmClose').onclick = closeSheet;
  document.querySelectorAll('.sheet-backdrop').forEach(b => b.addEventListener('click', e => { if (e.target === b) closeSheet(); }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSheet();
    if (shared.activeSheet) trapFocus(shared.activeSheet.sheet, e);
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('q').focus(); }
  });

  window.addEventListener('lyrics:langchange', () => {
    applyStatic(document); renderDemos(); renderRecent(handlers.recent());
    $('resultsMeta').textContent = $('resultsHead').hidden ? '' : t('matches');
  });
  window.addEventListener('offline', () => setOffline(true));
  window.addEventListener('online', () => setOffline(false));
  if (!navigator.onLine) setOffline(true);
}

export const ui = {
  toast, renderRecent, renderCountries, setSearching, setOffline, skeleton, showState,
  renderResults, openLyrics, setLyricsLoading, setLyricsError, openSettings, closeSheet,
  initUI, applyTheme, get q() { return $('q'); }
};
