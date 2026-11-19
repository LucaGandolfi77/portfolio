/* Offline Library — bootstrap, wiring and service worker registration */

import { LibraryDB } from './db.js';
import { Library } from './library.js';
import { Reader } from './reader.js';
import { UI } from './ui.js';
import { escapeHtml } from './markdown.js';

const SETTINGS_KEY = 'ol:settings';
function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
  return next;
}

const settings = loadSettings();
let pendingRenameId = null;
let fontSize = Number(settings.font) || 18;

const db = new LibraryDB();

const ui = new UI({
  onImport: files => library.import(files).then(refreshBookmarks),
  onSearch: value => library.setQuery(value),
  onOpen: id => openBook(id),
  onRename: id => askRename(id),
  onDelete: id => removeBook(id),
  onRenameConfirm: name => confirmRename(name),
  onBookmark: () => askBookmark(),
  onBookmarkConfirm: label => reader.addBookmark(label),
  onRemoveBookmark: id => removeBookmark(id),
  onJumpBookmark: (bookId, percent) => jumpToBookmark(bookId, percent),
  onFontDown: () => changeFont(-1),
  onFontUp: () => changeFont(1),
  onLang: () => toggleLang(),
  onTheme: () => toggleTheme()
});

const library = new Library({ db, ui, onOpen: book => reader.open(book) });
const reader = new Reader({ db, ui, onBookmarkAdded: refreshBookmarks });

ui.init();
ui.applyTheme(settings.theme === 'light' ? 'light' : 'dark');
ui.applyLang(settings.lang || ui.lang, true);
ui.setFont(fontSize);
library.refresh().then(refreshBookmarks);
registerServiceWorker();

function openBook(id) {
  const book = library.find(id);
  if (!book) return;
  reader.open(book);
  ui.toast(ui.t('opened') + ': ' + book.name);
}

function askRename(id) {
  const book = library.find(id);
  if (!book) return;
  pendingRenameId = id;
  ui.askRename(book.name);
}

async function confirmRename(name) {
  if (pendingRenameId == null) return;
  const id = pendingRenameId;
  pendingRenameId = null;
  await library.rename(id, name);
  const book = library.find(id);
  if (book) {
    if (reader.book && reader.book.id === id) {
      reader.book.name = book.name;
      ui.setReader(book.name, ui.el['read-meta'].textContent);
    }
    await refreshBookmarks();
  }
}

async function removeBook(id) {
  const removed = await library.remove(id);
  if (!removed) return;
  if (reader.book && reader.book.id === Number(id)) {
    reader.book = null;
    ui.el['read-body'].innerHTML = '';
    ui.setReader('—', '');
    ui.setProgress(0);
  }
  refreshBookmarks();
}

async function askBookmark() {
  if (!reader.book) return;
  ui.askBookmark(reader.book.name);
}

async function removeBookmark(id) {
  await db.deleteBookmark(Number(id));
  await refreshBookmarks();
  ui.toast(ui.t('bmRemoved'));
}

async function jumpToBookmark(bookId, percent) {
  let book = library.find(bookId);
  if (!book) {
    await library.refresh();
    book = library.find(bookId);
  }
  if (!book) return;
  reader.open(book);
  reader.jumpTo(percent);
}

function changeFont(delta) {
  fontSize = Math.max(14, Math.min(28, fontSize + delta));
  reader.setFont(fontSize);
}

function toggleLang() {
  const next = ui.lang === 'en' ? 'it' : 'en';
  saveSettings({ lang: next });
  ui.applyLang(next);
  library.render();
  refreshBookmarks();
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  saveSettings({ theme: next });
  ui.applyTheme(next);
}

async function refreshBookmarks() {
  const bookmarks = await db.getBookmarks();
  const list = ui.el['bm-list'];
  if (!bookmarks.length) {
    list.innerHTML = `<div class="empty-state small"><div class="empty-ico">🔖</div>
      <h3>${escapeHtml(ui.t('emptyBookmarks'))}</h3>
      <p>${escapeHtml(ui.t('emptyBookmarksHint'))}</p></div>`;
    return;
  }
  list.innerHTML = bookmarks.map(bm => `
    <li class="bm-item" data-id="${bm.id}" data-book-id="${bm.bookId}" data-percent="${bm.percent}" tabindex="0" role="button">
      <span class="bm-ico">🔖</span>
      <div class="bm-info"><b>${escapeHtml(bm.label || bm.bookName)}</b>
        <small>${escapeHtml(bm.bookName || '')} · ${Math.round(bm.percent)}%</small></div>
      <button class="bm-del" type="button" title="Delete" aria-label="Delete">×</button>
    </li>`).join('');
}

window.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  if (e.key.toLowerCase() === 'b' && reader.book) {
    e.preventDefault();
    ui.askBookmark(reader.book.name);
  }
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) { ui.setOfflineReady(false); return; }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => ui.setOfflineReady(true))
      .catch(err => { console.warn('[OL] SW registration failed', err); ui.setOfflineReady(false); });
  });
}
