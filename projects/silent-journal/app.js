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
  async run(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction('entries', mode);
      const req = fn(tx.objectStore('entries'));
      tx.oncomplete = () => res(req.result);
      tx.onerror = () => rej(tx.error);
    });
  },
  save(entry) { return this.run('readwrite', s => s.add(entry)); },
  list() { return this.run('readonly', s => s.getAll()); }
};

const App = {
  async init() {
    gid('btn-set-key').addEventListener('click', () => this.unlock());
    gid('btn-save').addEventListener('click', () => this.save());
    this.setupTabs();
    this.setupPrivacy();
    this.refreshKeyState();
    this.loadArchive();
  },

  say(id, msg) { gid(id).textContent = msg; },

  refreshKeyState() {
    const meta = Crypto.readMeta();
    const unlocked = !!Crypto.key;
    this.say('status', unlocked ? 'Diario sbloccato: puoi scrivere e salvare.'
      : meta ? 'Diario bloccato: inserisci la passphrase nella scheda Sicurezza.'
      : 'Primo avvio: imposta una passphrase nella scheda Sicurezza.');
    gid('key-state').textContent = unlocked ? 'Sbloccato' : meta ? 'Bloccato' : 'Non ancora impostato';
    gid('btn-set-key').textContent = meta ? 'Sblocca' : 'Imposta passphrase';
  },

  async unlock() {
    const pw = gid('passphrase').value;
    gid('passphrase').value = '';
    if (pw.length < 8) { this.say('key-msg', 'La passphrase deve avere almeno 8 caratteri.'); return; }
    try {
      const result = await Crypto.unlock(pw);
      this.say('key-msg', result === 'created'
        ? 'Passphrase impostata. Ricordala: senza di lei le voci non si possono leggere.'
        : 'Diario sbloccato.');
    } catch (e) {
      this.say('key-msg', e.message);
    }
    this.refreshKeyState();
    this.loadArchive();
  },

  async save() {
    if (!Crypto.key) { this.say('status', 'Prima sblocca il diario nella scheda Sicurezza.'); return; }
    const title = gid('entry-title').value.trim() || 'Voce senza titolo';
    const text = gid('editor').innerText.trim();
    if (!text) { this.say('status', 'Scrivi qualcosa prima di salvare.'); return; }
    const encrypted = await Crypto.encrypt(JSON.stringify({ title, text }));
    await DB.save({ encrypted, saved: new Date().toISOString() });
    this.say('status', 'Voce salvata cifrata. Resta solo su questo dispositivo.');
    gid('entry-title').value = '';
    gid('editor').innerText = '';
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

  // Schermata di privacy: solo al primo avvio, poi mai piu'.
  setupPrivacy() {
    const screen = gid('perm-screen');
    gid('perm-allow').addEventListener('click', () => {
      screen.hidden = true;
      try { localStorage.setItem('sj_privacy_ok', '1'); } catch (e) { /* storage bloccato */ }
    });
    let seen = false;
    try { seen = !!localStorage.getItem('sj_privacy_ok'); } catch (e) { seen = false; }
    screen.hidden = seen;
  },

  async loadArchive() {
    const list = gid('archive-list');
    list.innerHTML = '';
    let rows = [];
    try { rows = (await DB.list()) || []; } catch (e) { console.error('Archive load', e); }
    gid('archive-empty').hidden = rows.length > 0;
    rows.slice().reverse().forEach(r => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      const head = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = '🔒 Voce cifrata';
      const date = document.createElement('span');
      date.className = 'date';
      date.textContent = new Date(r.saved).toLocaleString('it-IT');
      head.append(label, date);
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'open-entry';
      open.textContent = 'Apri';
      open.addEventListener('click', () => this.openEntry(r));
      card.append(head, open);
      list.appendChild(card);
    });
  },

  async openEntry(row) {
    if (!Crypto.key) { this.say('status', 'Sblocca il diario nella scheda Sicurezza per leggere le voci.'); return; }
    let data;
    try {
      data = JSON.parse(await Crypto.decrypt(row.encrypted));
    } catch (e) {
      this.say('status', 'Questa voce non si può decifrare con la passphrase attuale.');
      return;
    }
    const reader = gid('reader');
    reader.hidden = false;
    reader.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = data.title;
    const body = document.createElement('div');
    body.className = 'reader-text';
    body.textContent = data.text;
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Chiudi';
    close.addEventListener('click', () => { reader.hidden = true; });
    reader.append(h, body, close);
    reader.scrollIntoView({ block: 'start' });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
