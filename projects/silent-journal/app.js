const gid = id => document.getElementById(id);

const DB = {
  db: null,
  name: 'SilentJournal',
  ver: 1,
  async open() {
    if (this.db) return this.db;
    this.db = await new Promise((res, rej) => {
      const req = indexedDB.open(this.name, this.ver);
      req.onerror = () => rej(req.error);
      req.onsuccess = () => res(req.result);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('entries')) db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
      };
    });
    return this.db;
  },
  async save(entry) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('entries', 'readwrite'); const store = tx.objectStore('entries'); const req = store.add(entry); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); },
  async list() { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('entries', 'readonly'); const store = tx.objectStore('entries'); const req = store.getAll(); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }) }
};

const App = {
  async init() {
    gid('btn-set-key').addEventListener('click', async () => {
      const pw = gid('passphrase').value;
      if (pw.length < 8) { alert('Passphrase minima 8 caratteri'); return; }
      await Crypto.setPassphrase(pw);
      gid('status').textContent = 'Chiave impostata — AES-256-GCM attivo';
    });
    gid('btn-save').addEventListener('click', async () => {
      if (!Crypto.key) { alert('Imposta prima la passphrase'); return; }
      const title = gid('entry-title').value || 'Voce senza titolo';
      const text = gid('editor').innerText || '';
      const encrypted = await Crypto.encrypt(title + '\n\n' + text);
      await DB.save({ title, encrypted, saved: new Date().toISOString() });
      gid('status').textContent = 'Salvata cifrata — solo locale';
      gid('entry-title').value = '';
      gid('editor').innerText = '';
      this.loadArchive();
    });
    this.setupTabs();
    this.setupPerm();
    this.loadArchive();
  },

  setupTabs() {
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      gid('tab-' + t.dataset.tab).classList.add('active');
    }));
  },

  setupPerm() {
    gid('perm-allow').addEventListener('click', () => gid('perm-screen').hidden = true);
    // Mostra pre-permission per trasparenza (anche se non serve mic per diario)
    setTimeout(() => gid('perm-screen').hidden = false, 300);
  },

  async loadArchive() {
    const list = gid('archive-list');
    list.innerHTML = '';
    try {
      const rows = await DB.list();
      if (!rows || !rows.length) { gid('archive-empty').hidden = false; return; }
      gid('archive-empty').hidden = true;
      rows.forEach(r => {
        const div = document.createElement('div');
        div.className = 'entry-card';
        div.innerHTML = `<strong>${r.title}</strong> <span class="date">${new Date(r.saved).toLocaleDateString('it-IT')}</span>`;
        list.appendChild(div);
      });
    } catch (e) { console.error('Archive load', e); }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
