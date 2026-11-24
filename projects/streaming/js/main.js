/* Streaming — bootstrap, search, player orchestration */
import { CATEGORIES } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, save, setSettings, isFavorite, toggleFavorite, addHistory, clearHistory,
  clearFavorites, queueAdd, queueRemove, queueClear, setPosition, getPosition, cacheGet, cachePut } from './storage.js';
import { search as apiSearch, getVideo, ytIdOf, isYoutube, isDirectVideo, detailsUrl } from './api.js';
import { Player } from './player.js';
import * as glass from './glass.js';
import { ui } from './ui.js';

const $ = id => document.getElementById(id);
const player = new Player(
  { player: $('player'), area: $('playerArea'), title: $('playerTitle') },
  {
    onOpen: item => { addHistory(item); ui.renderLibrary('history', profile.history); },
    onTime: (id, sec) => { if (Math.floor(sec) % 5 === 0) setPosition(id, sec); },
    onEnded: () => next(),
    onNext: () => next(),
    onPrev: () => prev(),
    volume: () => profile.settings.volume,
    speed: () => profile.settings.speed,
    position: id => getPosition(id)
  }
);

let currentCategory = CATEGORIES[0].id;
let currentQuery = '';
let page = 1;
let allItems = [];
let abort = null;
let queueIndex = -1;

function filters() {
  return {
    category: CATEGORIES.find(c => c.id === currentCategory)?.query || '',
    sort: profile.settings.sort || 'week desc',
    publicDomain: !!profile.settings.publicDomain,
    yearFrom: $('yearFrom').value || '',
    yearTo: $('yearTo').value || '',
    page,
    rows: 24
  };
}

async function doSearch(append = false) {
  abort?.abort();
  abort = new AbortController();
  if (!append) { page = 1; allItems = []; ui.skeleton(); }
  const key = JSON.stringify({ query: currentQuery, ...filters(), page });
  let data = cacheGet(key);
  try {
    if (!data) {
      const q = currentQuery || (CATEGORIES.find(c => c.id === currentCategory)?.query || '');
      data = await apiSearch(q, { ...filters(), signal: abort.signal });
      cachePut(key, data);
    }
    if (append) allItems.push(...data.items); else allItems = data.items.slice();
    const total = data.total || 0;
    ui.renderResults(allItems, { total, hasMore: allItems.length < total && allItems.length < 200 });
    $('loadMore').classList.toggle('hidden', allItems.length >= total || allItems.length >= 200);
    ui.renderCategories(currentCategory);
  } catch (e) {
    if (e.name !== 'AbortError') ui.setStatus(t('error'), true);
  }
}

function selectCategory(id) {
  currentCategory = id;
  currentQuery = '';
  $('q').value = '';
  setSettings({ sort: CATEGORIES.find(c => c.id === id)?.sort || 'week desc' });
  ui.renderSort(profile.settings.sort);
  doSearch();
}

function search(q) {
  currentQuery = q;
  currentCategory = '';
  doSearch();
}

function loadMore() { page++; doSearch(true); }

async function play(item) {
  let full = item;
  if (item.source === 'archive' && !item.url) {
    try {
      const v = await getVideo(item.id);
      if (!v) { ui.toast(t('noResults')); return; }
      full = { ...item, ...v, source: 'archive' };
    } catch (e) { ui.toast(t('error')); return; }
  }
  player.open(full);
  ui.showPanel('results');
}

function playId(id) {
  const item = allItems.find(x => x.id === id) || profile.favorites.find(x => x.id === id) || profile.history.find(x => x.id === id);
  if (item) play(item);
}

function customUrl(u) {
  if (!u) return;
  if (isYoutube(u) || isDirectVideo(u)) {
    play({ id: ytIdOf(u) || 'custom-' + Date.now(), title: u.replace(/^https?:\/\//, '').split('/')[0],
      url: u, source: isYoutube(u) ? 'youtube' : 'direct' });
  } else ui.toast(t('urlPlaceholder'));
}

function next() {
  if (!profile.queue.length) return;
  queueIndex = (queueIndex + 1) % profile.queue.length;
  play(profile.queue[queueIndex]);
}
function prev() {
  if (!profile.queue.length) return;
  queueIndex = (queueIndex - 1 + profile.queue.length) % profile.queue.length;
  play(profile.queue[queueIndex]);
}

function renderAll() {
  ui.renderCategories(currentCategory);
  ui.renderSort(profile.settings.sort);
  ui.renderPublicDomain(profile.settings.publicDomain);
  ui.renderQueue(profile.queue);
  ui.renderLibrary('favorites', profile.favorites);
  ui.renderLibrary('history', profile.history);
  applyTheme();
}
function applyTheme() { document.body.dataset.theme = profile.settings.theme || 'dark'; }

function share() {
  const item = player.current;
  const u = new URL(location.href);
  if (item) u.searchParams.set('id', item.id);
  if (currentQuery) u.searchParams.set('q', currentQuery);
  navigator.clipboard?.writeText(u.toString()).then(() => ui.toast(t('copied'))).catch(() => {});
}

initLang(detect());
ui.initUI({
  search: runSearch, selectCategory, loadMore, play, playId, customUrl,
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => { setSettings({ theme: (profile.settings.theme === 'dark' ? 'light' : 'dark') }); applyTheme(); },
  publicDomain: v => { setSettings({ publicDomain: v }); doSearch(); },
  sort: v => { setSettings({ sort: v }); doSearch(); },
  filters: () => doSearch(),
  favorite: item => toggleFavorite(item),
  queueAdd: item => queueAdd(item),
  queueRemove: i => { queueRemove(profile.queue[i]?.id); ui.renderQueue(profile.queue); },
  playQueue: i => { queueIndex = i; play(profile.queue[i]); },
  clearQueue: () => { queueClear(); ui.renderQueue(profile.queue); },
  clearHistory: () => { clearHistory(); ui.renderLibrary('history', profile.history); },
  clearFavorites: () => { clearFavorites(); ui.renderLibrary('favorites', profile.favorites); },
  closePlayer: () => { player.close(); queueIndex = -1; },
  pip: () => player.pip(), fullscreen: () => player.fullscreen(),
  next, prev, share,
  togglePlay: () => { if (player.video) player.video.paused ? player.video.play() : player.video.pause(); },
  renderAll
});

renderAll();
glass.enableRefraction(document.querySelector('.hero'), 32, 26);
glass.enableRefraction(document.querySelector('.search-card'), 26, 20);

/* deep link */
try {
  const u = new URL(location.href);
  const id = u.searchParams.get('id'), q = u.searchParams.get('q');
  if (q) { currentQuery = q; $('q').value = q; doSearch(); }
  if (id) play({ id, title: id, source: 'archive' });
  if (!q && !id) doSearch();
} catch (e) { doSearch(); }

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
