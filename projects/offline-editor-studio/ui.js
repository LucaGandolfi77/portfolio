/* Offline Editor Studio — interface, themes, i18n and toasts */

const DICT = {
  en: {
    back: 'Portfolio', tagline: 'Local code editor · zero server', documents: 'DOCUMENTS',
    bookmarks: 'BOOKMARKS', offlineReady: 'Offline ready', open: 'Open', save: 'Save',
    saved: 'Saved', saving: 'Saving…', unsaved: 'Unsaved changes', newDoc: 'New document',
    rename: 'Rename', renameTitle: 'Rename document', cancel: 'Cancel', delete: 'Delete',
    line: 'Ln', col: 'Col', chars: 'chars', char: 'char', lines: 'lines', line1: 'line',
    theme: 'Theme', language: 'Language', bookmarkAdded: 'Bookmark added',
    bookmarkRemoved: 'Bookmark removed', docDeleted: 'Document deleted',
    docCantDelete: 'The last document cannot be deleted', imported: 'File imported',
    noName: 'Please enter a name', confirmDelete: 'Delete this document?',
    shortcuts: 'Ctrl+S save · Ctrl+O open · Ctrl+B bookmark', savedFile: 'File saved'
  },
  it: {
    back: 'Portfolio', tagline: 'Editor di codice locale · zero server', documents: 'DOCUMENTI',
    bookmarks: 'SEGNALIBRI', offlineReady: 'Pronto offline', open: 'Apri', save: 'Salva',
    saved: 'Salvato', saving: 'Salvataggio…', unsaved: 'Modifiche non salvate', newDoc: 'Nuovo documento',
    rename: 'Rinomina', renameTitle: 'Rinomina documento', cancel: 'Annulla', delete: 'Elimina',
    line: 'Riga', col: 'Col', chars: 'caratteri', char: 'carattere', lines: 'righe', line1: 'riga',
    theme: 'Tema', language: 'Lingua', bookmarkAdded: 'Segnalibro aggiunto',
    bookmarkRemoved: 'Segnalibro rimosso', docDeleted: 'Documento eliminato',
    docCantDelete: 'L\'ultimo documento non può essere eliminato', imported: 'File importato',
    noName: 'Inserisci un nome', confirmDelete: 'Eliminare questo documento?',
    shortcuts: 'Ctrl+S salva · Ctrl+O apri · Ctrl+B segnalibro', savedFile: 'File salvato'
  }
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function readLang() {
  try { return localStorage.getItem('site_lang') || localStorage.getItem('lang') || 'en'; }
  catch (e) { return 'en'; }
}

export class UI {
  constructor(handlers) {
    this.handlers = handlers;
    this.lang = readLang().slice(0, 2) === 'it' ? 'it' : 'en';
    this.el = {};
    [
      'doc-list', 'bookmark-list', 'bm-count', 'doc-name', 'stat-lang', 'stat-line',
      'stat-chars', 'stat-lines', 'save-state', 'toast', 'theme-btn', 'lang-btn',
      'new-doc', 'btn-open', 'btn-save', 'btn-bm', 'file-in', 'rename-dialog',
      'rename-input', 'offline-state'
    ].forEach(id => { this.el[id] = document.getElementById(id); });
    this._toastTimer = 0;
  }

  t(key) { return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key; }

  init() {
    this.applyLang(this.lang, true);
    const h = this.handlers;
    this.el['new-doc'].addEventListener('click', h.onNew);
    this.el['btn-open'].addEventListener('click', () => this.el['file-in'].click());
    this.el['file-in'].addEventListener('change', async e => {
      const file = e.target.files[0];
      if (file) await h.onImport(file);
      e.target.value = '';
    });
    this.el['btn-save'].addEventListener('click', h.onSave);
    this.el['btn-bm'].addEventListener('click', h.onBookmark);
    this.el['theme-btn'].addEventListener('click', h.onTheme);
    this.el['lang-btn'].addEventListener('click', h.onLang);
    this.el['doc-name'].addEventListener('change', e => h.onRename(e.target.value.trim()));

    this.el['doc-list'].addEventListener('click', e => {
      const del = e.target.closest('.doc-del');
      if (del) { h.onDelete(del.closest('li').dataset.id); return; }
      const sel = e.target.closest('.doc-select');
      if (sel) h.onSelect(sel.closest('li').dataset.id);
    });
    this.el['bookmark-list'].addEventListener('click', e => {
      const del = e.target.closest('.bm-del');
      if (del) { h.onRemoveBookmark(del.closest('li').dataset.id); return; }
      const jump = e.target.closest('.bm-jump');
      if (jump) {
        const li = jump.closest('li');
        h.onJump(li.dataset.docId, Number(li.dataset.line), Number(li.dataset.col));
      }
    });

    const dialog = this.el['rename-dialog'];
    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'ok') h.onRename(this.el['rename-input'].value.trim());
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
    this.el['lang-btn'].textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
    if (!silent) this.toast(this.t('language') + ': ' + lang.toUpperCase());
  }

  applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#f4f1ea' : '#0b1020';
    this.el['theme-btn'].textContent = theme === 'light' ? '🌙' : '☀️';
    this.el['theme-btn'].setAttribute('aria-label', this.t('theme'));
  }

  setOfflineReady(ready) {
    this.el['offline-state'].classList.toggle('ready', ready);
  }

  renderDocs(storage) {
    const active = storage.data.activeId;
    this.el['doc-list'].innerHTML = storage.data.docs.map(doc => `
      <li class="doc-item ${doc.id === active ? 'active' : ''}" data-id="${esc(doc.id)}">
        <button class="doc-select" type="button" title="${esc(doc.name)}">
          <span class="doc-ico">📄</span>
          <span class="doc-text"><b>${esc(doc.name)}</b><small>${doc.content.split('\n').length} ${this.t('lines')}</small></span>
        </button>
        <button class="doc-del" type="button" title="${this.t('delete')}" aria-label="${this.t('delete')}">×</button>
      </li>`).join('');
  }

  renderBookmarks(storage) {
    const bms = storage.data.bookmarks;
    this.el['bm-count'].textContent = bms.length;
    this.el['bookmark-list'].innerHTML = bms.map(bm => `
      <li class="bm-item" data-id="${esc(bm.id)}" data-doc-id="${esc(bm.docId)}" data-line="${bm.line}" data-col="${bm.col}">
        <button class="bm-jump" type="button" title="${esc(bm.preview)}">
          <span class="bm-line">L${bm.line}</span>
          <span class="bm-text"><b>${esc(bm.preview)}</b><small>${esc(bm.docName || '')}</small></span>
        </button>
        <button class="bm-del" type="button" title="${this.t('delete')}" aria-label="${this.t('delete')}">×</button>
      </li>`).join('') || `<li class="empty">—</li>`;
  }

  setActiveDoc(name) { this.el['doc-name'].value = name; }

  setSaveState(state) {
    const el = this.el['save-state'];
    el.classList.toggle('dirty', state === 'dirty');
    el.classList.toggle('busy', state === 'saving');
    el.innerHTML = `<span class="save-dot"></span>${this.t(state === 'dirty' ? 'unsaved' : state === 'saving' ? 'saving' : 'saved')}`;
  }

  setStats({ lang, line, col, chars, lines }) {
    this.el['stat-lang'].textContent = lang;
    this.el['stat-line'].textContent = `${this.t('line')} ${line}, ${this.t('col')} ${col}`;
    this.el['stat-chars'].textContent = `${chars} ${chars === 1 ? this.t('char') : this.t('chars')}`;
    this.el['stat-lines'].textContent = `${lines} ${lines === 1 ? this.t('line1') : this.t('lines')}`;
  }

  askRename(current) {
    this.el['rename-input'].value = current;
    this.el['rename-dialog'].showModal();
    setTimeout(() => this.el['rename-input'].select(), 0);
  }

  toast(msg) {
    const el = this.el.toast;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }
}
