/* Offline Library — book import, management and list rendering */

import { escapeHtml, textStats } from './markdown.js';

function uniqueName(names, desired) {
  const name = String(desired || 'book.txt').trim().slice(0, 90) || 'book.txt';
  if (!names.includes(name)) return name;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (names.includes(`${stem} (${i})${ext}`)) i++;
  return `${stem} (${i})${ext}`;
}

export class Library {
  constructor({ db, ui, onOpen }) {
    this.db = db;
    this.ui = ui;
    this.onOpen = onOpen;
    this.books = [];
    this.query = '';
  }

  async refresh() {
    this.books = await this.db.getBooks();
    this.render();
    return this.books;
  }

  find(id) { return this.books.find(b => b.id === Number(id)) || null; }

  setQuery(value) {
    this.query = String(value || '').toLowerCase().trim();
    this.render();
  }

  render() {
    const list = this.ui.el['book-list'];
    if (!this.books.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-ico">📚</div>
        <h3>${escapeHtml(this.ui.t('emptyLibrary'))}</h3>
        <p>${escapeHtml(this.ui.t('emptyLibraryHint'))}</p></div>`;
      return;
    }
    const filtered = this.books.filter(b => !this.query || b.name.toLowerCase().includes(this.query));
    if (!filtered.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-ico">🔎</div>
        <h3>${escapeHtml(this.ui.t('noResults'))}</h3></div>`;
      return;
    }
    list.innerHTML = filtered.map(book => {
      const progress = Math.max(0, Math.min(100, Number(book.progress) || 0));
      const words = Number(book.words) || 0;
      const pages = Number(book.pages) || 1;
      return `<li class="book-item" data-id="${book.id}" tabindex="0" role="button">
        <span class="book-ico">📖</span>
        <div class="book-info">
          <b>${escapeHtml(book.name)}</b>
          <small>${words} ${escapeHtml(this.ui.t('words'))} · ${pages} ${escapeHtml(this.ui.t('pages'))}</small>
          <div class="mini-track"><div style="width:${progress}%"></div></div>
        </div>
        <div class="book-actions">
          <button class="book-rename" type="button" title="${escapeHtml(this.ui.t('rename'))}" aria-label="${escapeHtml(this.ui.t('rename'))}">✎</button>
          <button class="book-del" type="button" title="${escapeHtml(this.ui.t('delete') || 'Delete')}" aria-label="Delete">×</button>
        </div>
      </li>`;
    }).join('');
  }

  async import(files) {
    let added = 0;
    for (const file of files) {
      const ext = (file.name || '').split('.').pop().toLowerCase();
      if (!['txt', 'md', 'markdown', 'html'].includes(ext)) {
        this.ui.toast(this.ui.t('dropError'));
        continue;
      }
      const text = await file.text();
      const stats = textStats(text);
      const name = uniqueName(this.books.map(b => b.name), file.name || 'book.txt');
      const book = await this.db.addBook({
        name, text, progress: 0,
        words: stats.words, pages: stats.pages, lines: stats.lines, chars: stats.chars
      });
      this.books.push({ ...book, words: stats.words, pages: stats.pages, lines: stats.lines, chars: stats.chars, progress: 0 });
      added++;
      if (added === 1) this.onOpen(this.books[this.books.length - 1]);
    }
    this.render();
    if (added) this.ui.toast(this.ui.t('imported'));
  }

  async rename(id, name) {
    if (!name) { this.ui.toast(this.ui.t('noName')); return; }
    const unique = uniqueName(this.books.filter(b => b.id !== id).map(b => b.name), name);
    await this.db.updateBook(id, { name: unique });
    const book = this.find(id);
    if (book) book.name = unique;
    this.render();
  }

  async remove(id) {
    if (!window.confirm(this.ui.t('confirmDelete'))) return;
    await this.db.deleteBook(id);
    const bookmarks = await this.db.getBookmarks();
    for (const bm of bookmarks) {
      if (bm.bookId === Number(id)) await this.db.deleteBookmark(bm.id);
    }
    this.books = this.books.filter(b => b.id !== Number(id));
    this.render();
    this.ui.toast(this.ui.t('bookDeleted'));
    return true;
  }
}
