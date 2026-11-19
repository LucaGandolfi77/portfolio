/* Offline Editor Studio — bootstrap and wiring */

import { Storage } from './storage.js';
import { Editor } from './editor.js';
import { FileManager, inferLanguage } from './files.js';
import { UI } from './ui.js';

const storage = new Storage();
let saveTimer = 0;
let dirty = false;

const ui = new UI({
  onNew: () => newDoc(),
  onImport: file => importFile(file),
  onSave: () => saveFile(),
  onBookmark: () => addBookmark(),
  onSelect: id => selectDoc(id),
  onRename: name => renameDoc(name),
  onDelete: id => deleteDoc(id),
  onJump: (docId, line, col) => jumpTo(docId, line, col),
  onRemoveBookmark: id => removeBookmark(id),
  onTheme: () => toggleTheme(),
  onLang: () => toggleLang()
});

const editor = new Editor({
  textarea: document.getElementById('code'),
  pre: document.getElementById('highlight'),
  gutter: document.getElementById('gutter'),
  onChange: () => onInput(),
  onCaret: caret => updateStats(caret)
});

const files = new FileManager(storage);

ui.init();
ui.applyTheme(resolveTheme(storage.data.theme));
ui.applyLang(storage.data.lang, true);
loadActive();
refresh();
registerServiceWorker();

function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme === 'light' ? 'light' : 'dark';
}

function loadActive() {
  const doc = storage.activeDoc;
  editor.setLanguage(inferLanguage(doc.name));
  editor.setValue(doc.content);
  ui.setActiveDoc(doc.name);
}

function refresh() {
  ui.renderDocs(storage);
  ui.renderBookmarks(storage);
  ui.setSaveState(dirty ? 'dirty' : 'saved');
  updateStats(editor.caret());
}

function updateStats(caret) {
  const content = editor.getValue();
  ui.setStats({
    lang: editor.language,
    line: caret.line,
    col: caret.col,
    chars: content.length,
    lines: content.split('\n').length
  });
}

function persist() {
  clearTimeout(saveTimer);
  if (!dirty) return;
  storage.updateDoc(storage.data.activeId, { content: editor.getValue() });
  dirty = false;
  ui.setSaveState('saved');
  ui.renderDocs(storage);
}

function onInput() {
  dirty = true;
  ui.setSaveState('dirty');
  updateStats(editor.caret());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 500);
}

function newDoc() {
  persist();
  const doc = storage.addDoc('untitled.txt', '');
  loadActive();
  refresh();
  ui.toast(ui.t('newDoc'));
  editor.focus();
  return doc;
}

function importFile(file) {
  persist();
  return files.import(file).then(doc => {
    if (!doc) return;
    loadActive();
    refresh();
    ui.toast(ui.t('imported'));
  });
}

function selectDoc(id) {
  if (id === storage.data.activeId) return;
  persist();
  storage.setActive(id);
  loadActive();
  refresh();
  editor.focus();
}

function renameDoc(name) {
  if (!name) { ui.toast(ui.t('noName')); ui.setActiveDoc(storage.activeDoc.name); return; }
  storage.updateDoc(storage.data.activeId, { name });
  editor.setLanguage(inferLanguage(name));
  ui.setActiveDoc(name);
  refresh();
}

function deleteDoc(id) {
  if (storage.data.docs.length <= 1) { ui.toast(ui.t('docCantDelete')); return; }
  if (!window.confirm(ui.t('confirmDelete'))) return;
  storage.deleteDoc(id);
  loadActive();
  refresh();
  ui.toast(ui.t('docDeleted'));
}

function saveFile() {
  persist();
  files.download(storage.activeDoc);
  ui.toast(ui.t('savedFile'));
}

function addBookmark() {
  files.bookmarkFromEditor(editor);
  refresh();
  ui.toast(ui.t('bookmarkAdded'));
}

function removeBookmark(id) {
  storage.removeBookmark(id);
  refresh();
  ui.toast(ui.t('bookmarkRemoved'));
}

function jumpTo(docId, line, col) {
  if (docId !== storage.data.activeId) selectDoc(docId);
  editor.jumpToLine(line, col);
}

function toggleTheme() {
  const current = resolveTheme(storage.data.theme);
  const next = current === 'dark' ? 'light' : 'dark';
  storage.setTheme(next);
  ui.applyTheme(next);
}

function toggleLang() {
  const next = ui.lang === 'en' ? 'it' : 'en';
  storage.setLang(next);
  ui.applyLang(next);
  refresh();
}

window.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const key = e.key.toLowerCase();
  if (key === 's') { e.preventDefault(); saveFile(); }
  else if (key === 'o') { e.preventDefault(); document.getElementById('file-in').click(); }
  else if (key === 'b') { e.preventDefault(); addBookmark(); }
});

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) { ui.setOfflineReady(false); return; }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => ui.setOfflineReady(true))
      .catch(err => { console.warn('[OES] SW registration failed', err); ui.setOfflineReady(false); });
  });
}
