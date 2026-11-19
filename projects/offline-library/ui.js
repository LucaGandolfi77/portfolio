/* Offline Library — tabs, dialogs, themes, i18n and toasts */

const DICT = {
  en: {
    back: 'Portfolio', tagline: 'Your books stay on this device',
    tabLibrary: 'Library', tabRead: 'Read', tabBookmarks: 'Bookmarks',
    addBook: 'Add book', dropTitle: 'Drop .txt or .md files here',
    dropHint: 'or click to browse · nothing is uploaded', searchPh: 'Search your library…',
    bookmark: 'Bookmark', bookmarksTitle: 'Bookmarks', renameTitle: 'Rename book',
    bookmarkDialogTitle: 'Add bookmark', bookmarkLabel: 'Label', cancel: 'Cancel',
    rename: 'Rename', save: 'Save', noName: 'Please enter a name',
    confirmDelete: 'Delete this book?', bookDeleted: 'Book deleted',
    bmAdded: 'Bookmark added', bmRemoved: 'Bookmark removed', imported: 'File imported',
    language: 'Language', theme: 'Theme', emptyLibrary: 'Your library is empty',
    emptyLibraryHint: 'Add a .txt or .md file to start reading offline.',
    emptyBookmarks: 'No bookmarks yet', emptyBookmarksHint: 'Use ★ while reading to save your place.',
    noResults: 'No books match your search', dropError: 'Unsupported file. Use .txt or .md.',
    opened: 'Opened', progressSaved: 'Reading position saved',
    words: 'words', pages: 'pages', deleted: 'deleted', delete: 'Delete', offlineReady: 'Offline ready'
  },
  it: {
    back: 'Portfolio', tagline: 'I tuoi libri restano su questo dispositivo',
    tabLibrary: 'Libreria', tabRead: 'Leggi', tabBookmarks: 'Segnalibri',
    addBook: 'Aggiungi libro', dropTitle: 'Trascina qui file .txt o .md',
    dropHint: 'o clicca per sfogliare · nulla viene caricato', searchPh: 'Cerca nella libreria…',
    bookmark: 'Segnalibro', bookmarksTitle: 'Segnalibri', renameTitle: 'Rinomina libro',
    bookmarkDialogTitle: 'Aggiungi segnalibro', bookmarkLabel: 'Etichetta', cancel: 'Annulla',
    rename: 'Rinomina', save: 'Salva', noName: 'Inserisci un nome',
    confirmDelete: 'Eliminare questo libro?', bookDeleted: 'Libro eliminato',
    bmAdded: 'Segnalibro aggiunto', bmRemoved: 'Segnalibro rimosso', imported: 'File importato',
    language: 'Lingua', theme: 'Tema', emptyLibrary: 'La libreria è vuota',
    emptyLibraryHint: 'Aggiungi un file .txt o .md per iniziare a leggere offline.',
    emptyBookmarks: 'Nessun segnalibro', emptyBookmarksHint: 'Usa ★ durante la lettura per salvare la posizione.',
    noResults: 'Nessun libro corrisponde alla ricerca', dropError: 'File non supportato. Usa .txt o .md.',
    opened: 'Aperto', progressSaved: 'Posizione di lettura salvata',
    words: 'parole', pages: 'pagine', deleted: 'eliminato', delete: 'Elimina', offlineReady: 'Pronto offline'
  }
};

function readLang() {
  try { return localStorage.getItem('site_lang') || localStorage.getItem('lang') || 'en'; }
  catch (e) { return 'en'; }
}

export class UI {
  constructor(handlers = {}) {
    this.handlers = handlers;
    this.lang = readLang().slice(0, 2) === 'it' ? 'it' : 'en';
    this.el = {};
    [
      'lang-btn', 'theme-btn', 'search', 'btn-file', 'file-picker', 'dropzone',
      'book-list', 'bm-list', 'read-title', 'read-meta', 'read-body', 'read-progress',
      'btn-bm', 'font-down', 'font-up', 'toast', 'rename-dialog', 'rename-input',
      'bookmark-dialog', 'bookmark-input', 'offline-state'
    ].forEach(id => { this.el[id] = document.getElementById(id); });
    this._toastTimer = 0;
  }

  t(key) { return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key; }

  init() {
    this.applyLang(this.lang, true);
    const h = this.handlers;

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    this.el['btn-file'].addEventListener('click', () => this.el['file-picker'].click());
    this.el['dropzone'].addEventListener('click', () => this.el['file-picker'].click());
    this.el['dropzone'].addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.el['file-picker'].click(); }
    });
    this.el['file-picker'].addEventListener('change', async e => {
      const files = Array.from(e.target.files || []);
      if (files.length) await h.onImport(files);
      e.target.value = '';
    });
    ['dragenter', 'dragover'].forEach(evt => this.el.dropzone.addEventListener(evt, e => {
      e.preventDefault(); this.el.dropzone.classList.add('over');
    }));
    ['dragleave', 'drop'].forEach(evt => this.el.dropzone.addEventListener(evt, e => {
      e.preventDefault(); this.el.dropzone.classList.remove('over');
    }));
    this.el.dropzone.addEventListener('drop', e => {
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) h.onImport(files);
    });

    this.el.search.addEventListener('input', e => h.onSearch(e.target.value));
    this.el['btn-bm'].addEventListener('click', h.onBookmark);
    this.el['font-down'].addEventListener('click', h.onFontDown);
    this.el['font-up'].addEventListener('click', h.onFontUp);
    this.el['lang-btn'].addEventListener('click', h.onLang);
    this.el['theme-btn'].addEventListener('click', h.onTheme);

    this.el['book-list'].addEventListener('click', e => {
      const del = e.target.closest('.book-del');
      if (del) { h.onDelete(Number(del.closest('li').dataset.id)); return; }
      const ren = e.target.closest('.book-rename');
      if (ren) { h.onRename(Number(ren.closest('li').dataset.id)); return; }
      const item = e.target.closest('.book-item');
      if (item) h.onOpen(Number(item.dataset.id));
    });
    this.el['bm-list'].addEventListener('click', e => {
      const del = e.target.closest('.bm-del');
      if (del) { h.onRemoveBookmark(Number(del.closest('li').dataset.id)); return; }
      const item = e.target.closest('.bm-item');
      if (item) h.onJumpBookmark(Number(item.dataset.bookId), Number(item.dataset.percent));
    });

    const rename = this.el['rename-dialog'];
    rename.addEventListener('close', () => {
      if (rename.returnValue === 'ok') h.onRenameConfirm(this.el['rename-input'].value.trim());
    });
    const bookmark = this.el['bookmark-dialog'];
    bookmark.addEventListener('close', () => {
      if (bookmark.returnValue === 'ok') h.onBookmarkConfirm(this.el['bookmark-input'].value.trim());
    });

    document.addEventListener('change', e => {
      if (e.target && e.target.id === 'siteLangSelect') this.applyLang(e.target.value);
    });
    window.addEventListener('storage', e => {
      if (e.key === 'site_lang' || e.key === 'lang') this.applyLang(readLang(), true);
    });
  }

  applyLang(value, silent = false) {
    const lang = String(value || 'en').slice(0, 2) === 'it' ? 'it' : 'en';
    if (lang === this.lang && !silent) return;
    this.lang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      node.textContent = this.t(node.getAttribute('data-i18n'));
    });
    this.el.search.placeholder = this.t('searchPh');
    this.el['lang-btn'].textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
    this.el['theme-btn'].setAttribute('aria-label', this.t('theme'));
    if (!silent) this.toast(this.t('language') + ': ' + lang.toUpperCase());
  }

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f6f2e9' : '#141024';
    this.el['theme-btn'].textContent = theme === 'light' ? '🌙' : '☀️';
  }

  switchTab(name) {
    document.querySelectorAll('.tab').forEach(t => {
      const on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + name));
  }

  setOfflineReady(ready) { this.el['offline-state'].classList.toggle('ready', ready); }

  setReader(title, meta) {
    this.el['read-title'].textContent = title;
    this.el['read-meta'].textContent = meta;
  }

  setProgress(percent) {
    this.el['read-progress'].style.width = Math.max(0, Math.min(100, percent)) + '%';
  }

  setFont(size) {
    this.el['read-body'].style.fontSize = size + 'px';
  }

  askRename(current) {
    this.el['rename-input'].value = current;
    this.el['rename-dialog'].showModal();
    setTimeout(() => this.el['rename-input'].select(), 0);
  }

  askBookmark(current) {
    this.el['bookmark-input'].value = current || '';
    this.el['bookmark-dialog'].showModal();
    setTimeout(() => this.el['bookmark-input'].select(), 0);
  }

  toast(msg) {
    const el = this.el.toast;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }
}
