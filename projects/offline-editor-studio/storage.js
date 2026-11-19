/* Offline Editor Studio — localStorage persistence */

const KEY = 'oes:v2';

function uid(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function defaults() {
  const doc = {
    id: 'doc-welcome',
    name: 'welcome.js',
    content: [
      '// Offline Editor Studio',
      '// Everything stays in this browser — no server, no cloud.',
      '',
      'const greeting = "Hello, offline world!";',
      '',
      'function greet(name) {',
      '  return `${greeting} I am ${name}.`;',
      '}',
      '',
      'console.log(greet("Ada"));',
      '',
      '// Tips:',
      '//  Ctrl+S  save .txt    Ctrl+O  open file    Ctrl+B  bookmark',
      '//  Click a bookmark in the sidebar to jump to that line.'
    ].join('\n'),
    updated: Date.now()
  };
  return { docs: [doc], activeId: doc.id, bookmarks: [], theme: 'dark', lang: 'en' };
}

export class Storage {
  constructor() {
    this.listeners = [];
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.docs) || !parsed.docs.length) return defaults();
      return {
        docs: parsed.docs,
        activeId: parsed.activeId || parsed.docs[0].id,
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
        theme: parsed.theme || 'dark',
        lang: parsed.lang || 'en'
      };
    } catch (e) {
      console.warn('[OES] storage read failed, using defaults', e);
      return defaults();
    }
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[OES] storage write failed', e);
    }
    this.emit();
  }

  on(fn) { this.listeners.push(fn); }
  emit() { this.listeners.forEach(fn => fn(this.data)); }

  get activeDoc() {
    return this.data.docs.find(d => d.id === this.data.activeId) || this.data.docs[0];
  }

  addDoc(name, content = '') {
    const doc = { id: uid('doc'), name, content, updated: Date.now() };
    this.data.docs.push(doc);
    this.data.activeId = doc.id;
    this.save();
    return doc;
  }

  updateDoc(id, patch) {
    const doc = this.data.docs.find(d => d.id === id);
    if (!doc) return;
    Object.assign(doc, patch, { updated: Date.now() });
    this.save();
  }

  deleteDoc(id) {
    if (this.data.docs.length <= 1) return false;
    this.data.docs = this.data.docs.filter(d => d.id !== id);
    this.data.bookmarks = this.data.bookmarks.filter(b => b.docId !== id);
    if (this.data.activeId === id) this.data.activeId = this.data.docs[0].id;
    this.save();
    return true;
  }

  setActive(id) {
    this.data.activeId = id;
    this.save();
  }

  addBookmark(bookmark) {
    this.data.bookmarks.unshift({ id: uid('bm'), created: Date.now(), ...bookmark });
    this.save();
  }

  removeBookmark(id) {
    this.data.bookmarks = this.data.bookmarks.filter(b => b.id !== id);
    this.save();
  }

  setTheme(theme) {
    this.data.theme = theme;
    this.save();
  }

  setLang(lang) {
    this.data.lang = lang;
    this.save();
  }
}
