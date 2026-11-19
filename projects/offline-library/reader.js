/* Offline Library — reading view, progress tracking and bookmarks */

import { renderMarkdown } from './markdown.js';

export class Reader {
  constructor({ db, ui, onBookmarkAdded }) {
    this.db = db;
    this.ui = ui;
    this.onBookmarkAdded = onBookmarkAdded;
    this.book = null;
    this._saveTimer = 0;
    this._restoring = false;
    this.body = this.ui.el['read-body'];
    this.body.addEventListener('scroll', () => this.onScroll());
  }

  open(book) {
    this.book = book;
    this.ui.setReader(
      book.name,
      `${book.words || 0} ${this.ui.t('words')} · ${book.pages || 1} ${this.ui.t('pages')}`
    );
    this.body.innerHTML = renderMarkdown(book.text);
    this.ui.setProgress(book.progress || 0);
    this.ui.switchTab('read');
    this._restoring = true;
    requestAnimationFrame(() => {
      const max = Math.max(0, this.body.scrollHeight - this.body.clientHeight);
      this.body.scrollTop = ((Number(book.progress) || 0) / 100) * max;
      setTimeout(() => { this._restoring = false; }, 60);
    });
  }

  onScroll() {
    if (!this.book || this._restoring) return;
    const max = Math.max(1, this.body.scrollHeight - this.body.clientHeight);
    const percent = Math.max(0, Math.min(100, Math.round(this.body.scrollTop / max * 100)));
    this.ui.setProgress(percent);
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(async () => {
      this.book.progress = percent;
      await this.db.updateBook(this.book.id, { progress: percent });
    }, 300);
  }

  jumpTo(percent) {
    if (!this.book) return;
    this.ui.switchTab('read');
    this._restoring = true;
    requestAnimationFrame(() => {
      const max = Math.max(0, this.body.scrollHeight - this.body.clientHeight);
      this.body.scrollTop = (Number(percent) / 100) * max;
      setTimeout(() => { this._restoring = false; }, 60);
    });
  }

  async addBookmark(label) {
    if (!this.book) return;
    const percent = Math.max(0, Math.min(100, Math.round(
      this.body.scrollTop / Math.max(1, this.body.scrollHeight - this.body.clientHeight) * 100
    )));
    const lines = String(this.book.text || '').split('\n');
    const line = Math.max(1, Math.round(percent / 100 * lines.length));
    const excerpt = (lines[line - 1] || '').trim().slice(0, 70) || this.book.name;
    await this.db.addBookmark({
      bookId: this.book.id,
      bookName: this.book.name,
      percent,
      line,
      label: (label || excerpt).slice(0, 90),
      excerpt
    });
    if (this.onBookmarkAdded) this.onBookmarkAdded();
    this.ui.toast(this.ui.t('bmAdded'));
  }

  setFont(size) {
    this.ui.setFont(size);
    try { localStorage.setItem('ol:font', String(size)); } catch (e) { /* ignore */ }
  }
}
