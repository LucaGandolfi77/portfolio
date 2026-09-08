const gid = id => document.getElementById(id);
const DB = { db: null, open() { return new Promise((res, rej) => { const r = indexedDB.open('LibraryDB', 1); r.onerror = () => rej(r.error); r.onsuccess = () => res(r.result); r.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains('books')) db.createObjectStore('books', { keyPath: 'id', autoIncrement: true }); if (!db.objectStoreNames.contains('bm')) db.createObjectStore('bm', { keyPath: 'id', autoIncrement: true }); }; }); } };
const App = {
  async init() {
    const db = await DB.open();
    document.getElementById('btn-file').addEventListener('click', () => document.getElementById('file-picker').click());
    document.getElementById('file-picker').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const text = await f.text(); const html = window.Parser ? Parser.parse(text) : text.replace(/\n/g, '<br>'); gid('read-title').textContent = f.name; gid('read-body').innerHTML = html; gid('tab-read').click(); await this.saveBook(f.name, text); this.loadBooks(); });
    document.getElementById('dropzone').addEventListener('dragover', e => e.preventDefault());
    document.getElementById('dropzone').addEventListener('drop', async e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (!f) return; const text = await f.text(); const html = window.Parser ? Parser.parse(text) : text.replace(/\n/g, '<br>'); gid('read-title').textContent = f.name; gid('read-body').innerHTML = html; gid('tab-read').click(); await this.saveBook(f.name, text); this.loadBooks(); });
    this.setupTabs();
    this.loadBooks();
    this.loadBM();
  },
  setupTabs() { document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); gid('tab-' + t.dataset.tab).classList.add('active'); })); },
  async saveBook(name, text) { const db = await DB.open(); return new Promise((res, rej) => { const tx = db.transaction('books', 'readwrite'); const req = tx.objectStore('books').add({ name, text, saved: new Date().toISOString() }); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); },
  async loadBooks() { const db = await DB.open(); const rows = await new Promise((res, rej) => { const tx = db.transaction('books', 'readonly'); const req = tx.objectStore('books').getAll(); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); const list = gid('book-list'); list.innerHTML = ''; rows.forEach(r => { const li = document.createElement('li'); li.className = 'book-item'; li.textContent = r.name; li.addEventListener('click', async () => { gid('read-title').textContent = r.name; gid('read-body').innerHTML = window.Parser ? Parser.parse(r.text) : r.text.replace(/\n/g, '<br>'); gid('tab-read').click(); }); list.appendChild(li); }); },
  async loadBM() { const db = await DB.open(); const rows = await new Promise((res, rej) => { const tx = db.transaction('bm', 'readonly'); const req = tx.objectStore('bm').getAll(); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); const list = gid('bm-list'); list.innerHTML = ''; rows.forEach(r => { const li = document.createElement('li'); li.className = 'bm-item'; li.textContent = r.label || 'Segnalibro'; list.appendChild(li); }); }
};
document.addEventListener('DOMContentLoaded', () => App.init());
