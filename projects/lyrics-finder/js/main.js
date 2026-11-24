/* Reverse Lyrics Finder — bootstrap and orchestration */
import { initLang, setLang, t, detect } from './i18n.js';
import { loadSettings, saveSettings, loadRecent, addRecent, loadCache, putCache,
  getCache, clearCache, toggleFavorite, loadFavorites, isFavorite } from './storage.js';
import { fetchTracks, fetchLyrics, searchTerms, ApiError } from './api.js';
import { rankTracks, highlightHtml } from './search.js';
import { createPlayer } from './audio.js';
import { ui } from './ui.js';

const settings = loadSettings();
let cache = loadCache();
let abort = null;
let showingFavorites = false;

const player = createPlayer({
  player: document.getElementById('player'),
  play: document.getElementById('pl-play'),
  title: document.getElementById('pl-title'),
  seek: document.getElementById('pl-seek'),
  time: document.getElementById('pl-time'),
  volume: document.getElementById('pl-vol'),
  close: document.getElementById('pl-close')
}, { onState: (on, track) => {
  document.querySelectorAll('.rcard').forEach((card, i) => {
    const btn = card.querySelector('[data-play]');
    if (btn) btn.textContent = on && track === displayed[i] ? '❚❚' : '▶';
  });
} });

let displayed = [];

function stop() { abort?.abort(); abort = null; player.stop(); ui.setSearching(false); }

async function search(raw, fill = false) {
  const query = String(raw || '').trim();
  if (!query) { ui.q.focus(); return; }
  if (fill) ui.q.value = query;
  stop();
  if (showingFavorites) { showingFavorites = false; document.getElementById('favFilterBtn').classList.remove('on'); }
  const controller = new AbortController();
  abort = controller;
  ui.setSearching(true);
  ui.skeleton();

  const key = 'search:' + settings.country + ':' + query.toLowerCase();
  const cached = getCache(cache, key, 10 * 60 * 1000);
  try {
    let tracks;
    if (cached && !cached.stale) {
      tracks = cached.data;
    } else {
      const terms = searchTerms(query);
      const batches = await Promise.all(terms.map(term => fetchTracks(term, settings, {
        signal: controller.signal, lang: detect()
      }).catch(e => { if (e.name === 'AbortError') throw e; return []; })));
      const merged = batches.flat();
      if (!merged.length && navigator.onLine === false && cached) tracks = cached.data;
      else {
        tracks = merged;
        cache = putCache(cache, key, tracks);
      }
    }
    if (abort !== controller) return;
    displayed = rankTracks(tracks, query);
    ui.renderResults(displayed, query);
    addRecent(query);
    ui.renderRecent(loadRecent());
    if (cached?.stale) ui.toast(t('offline'));
  } catch (e) {
    if (e.name === 'AbortError' || abort !== controller) return;
    ui.showState('😕', t('error') + '<br><button class="btn ghost small" id="retry">Genius ↗</button>');
    const retry = document.getElementById('retry');
    if (retry) retry.onclick = () => genius(query);
  } finally { if (abort === controller) { abort = null; ui.setSearching(false); } }
}

function genius(query) {
  const q = String(query || '').trim();
  window.open('https://genius.com/search?q=' + encodeURIComponent(q), '_blank', 'noopener');
}

function preview(track) { player.load(track); }
function favorite(track) { const added = toggleFavorite(track); ui.toast(t(added ? 'favorites' : 'clear')); return added; }

function showFavorites() {
  showingFavorites = !showingFavorites;
  document.getElementById('favFilterBtn').classList.toggle('on', showingFavorites);
  if (!showingFavorites) { ui.renderResults(displayed, ui.q.value); return; }
  const favs = loadFavorites();
  if (!favs.length) { ui.showState('♡', t('emptyFavs')); return; }
  const tracks = favs.map(f => ({ ...f, kind: 'song', trackName: f.name, artistName: f.artist,
    artworkUrl100: f.art, previewUrl: f.preview, trackViewUrl: f.url, matchScore: 100 }));
  displayed = tracks;
  ui.renderResults(tracks, '');
}

async function lyrics(song) {
  ui.openLyrics(song, `<div class="state">${t('loadingLyrics')}</div>`, '…');
  const key = 'lyr:' + (song.artistName || '') + '|' + (song.trackName || '');
  const cached = getCache(cache, key, 7 * 24 * 60 * 60 * 1000);
  let text = cached && !cached.stale ? cached.data : null;
  if (!text) {
    try {
      text = await fetchLyrics(song.artistName, song.trackName, { lang: detect() });
      cache = putCache(cache, key, text);
    } catch (e) {
      if (e instanceof ApiError && cached) text = cached.data;
    }
  }
  if (!text) { ui.setLyricsError(song); return; }
  ui.openLyrics(song, highlightHtml(text, ui.q.value, settings.exact), cached?.stale ? t('cached') : 'lyrics.ovh');
  lastLyrics = text;
}

let lastLyrics = '';
async function copyLyrics() {
  const text = lastLyrics;
  if (!text) return;
  try { await navigator.clipboard.writeText(text); ui.toast(t('copied')); }
  catch (e) { ui.toast(t('copyFail')); }
}
async function shareLyrics() {
  try {
    if (navigator.share) await navigator.share({ title: document.getElementById('lmTitle').textContent, text: lastLyrics });
    else await navigator.clipboard.writeText(lastLyrics);
  } catch (e) { if (e.name !== 'AbortError') ui.toast(t('shareFail')); }
}

function setSetting(patch) {
  Object.assign(settings, patch);
  saveSettings(settings);
  if (patch.theme) ui.applyTheme(patch.theme);
}
function clearCacheData() { cache = clearCache() || {}; ui.toast(t('clear')); }

initLang(detect());
ui.applyTheme(settings.theme || document.documentElement.dataset.theme || 'dark');
ui.initUI({
  search, genius, preview, favorite, stop, lyrics,
  favorites: showFavorites,
  recent: loadRecent,
  settings,
  setSetting,
  clearCache: clearCacheData
});
document.getElementById('lmCopy').onclick = copyLyrics;
document.getElementById('lmShare').hidden = !navigator.share;
document.getElementById('lmShare').onclick = shareLyrics;
ui.renderRecent(loadRecent());
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
