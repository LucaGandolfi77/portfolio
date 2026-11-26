/* Silent Voice Reader — lettura vocale con la sintesi del dispositivo.
   Nessun microfono, nessun server: testo, libreria e impostazioni restano nel browser. */
const $ = id => document.getElementById(id);
const LIB_KEY = 'svr_library_v1';
const SET_KEY = 'svr_settings_v1';
const CHUNK = 220; // caratteri per frase: pause naturali e niente testi enormi in un solo utterance

const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } }
};

const Reader = {
  chunks: [],
  index: 0,
  playing: false,
  paused: false,
  settings: { rate: 1, volume: 80, lang: 'it-IT' },

  init() {
    Object.assign(this.settings, store.get(SET_KEY, {}));
    this.bindUi();
    this.applySettingsUi();
    this.renderLibrary();
    if (!('speechSynthesis' in window)) this.status('Questo browser non supporta la sintesi vocale.');
  },

  status(msg) { $('voice-status').textContent = msg; },

  bindUi() {
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      $('tab-' + t.dataset.tab).classList.add('active');
      if (t.dataset.tab === 'library') this.renderLibrary();
    }));
    $('file').addEventListener('change', async e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.setText(file.name.replace(/\.txt$/i, ''), await file.text());
    });
    $('btn-use-paste').addEventListener('click', () => {
      const text = $('paste').value.trim();
      if (!text) { this.status('Incolla un testo prima.'); return; }
      this.setText('Testo incollato', text);
    });
    $('btn-save-lib').addEventListener('click', () => this.saveToLibrary());
    $('btn-play').addEventListener('click', () => this.play());
    $('btn-pause').addEventListener('click', () => this.pause());
    $('btn-stop').addEventListener('click', () => this.stop());
    $('rate').addEventListener('input', e => { this.settings.rate = Number(e.target.value); this.saveSettings(); });
    $('volume').addEventListener('input', e => { this.settings.volume = Number(e.target.value); this.saveSettings(); });
    $('lang').addEventListener('change', e => { this.settings.lang = e.target.value; this.saveSettings(); });
  },

  applySettingsUi() {
    $('rate').value = this.settings.rate;
    $('rate-value').textContent = Number(this.settings.rate).toFixed(1);
    $('volume').value = this.settings.volume;
    $('volume-value').textContent = this.settings.volume;
    $('lang').value = this.settings.lang;
  },

  saveSettings() {
    this.applySettingsUi();
    store.set(SET_KEY, this.settings);
  },

  // Spezza il testo in frasi di circa CHUNK caratteri, senza tagliare le parole.
  split(text) {
    const sentences = text.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]*/g) || [text];
    const out = [];
    let cur = '';
    for (const s of sentences) {
      if ((cur + s).length > CHUNK && cur) { out.push(cur.trim()); cur = ''; }
      cur += s;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  },

  setText(title, text) {
    this.stop();
    this.title = title;
    this.text = text;
    this.chunks = this.split(text);
    this.index = 0;
    $('book-title').textContent = title;
    $('text-preview').textContent = text.slice(0, 280) + (text.length > 280 ? '…' : '');
    $('progress').value = 0;
    this.status(`Pronto: ${this.chunks.length} passaggi.`);
  },

  speakCurrent() {
    if (this.index >= this.chunks.length) {
      this.playing = false;
      this.status('Lettura completata.');
      $('progress').value = 1;
      return;
    }
    const u = new SpeechSynthesisUtterance(this.chunks[this.index]);
    u.lang = this.settings.lang;
    u.rate = this.settings.rate;
    u.volume = this.settings.volume / 100;
    u.onend = () => {
      if (!this.playing) return;
      this.index++;
      $('progress').value = this.chunks.length ? this.index / this.chunks.length : 0;
      this.speakCurrent();
    };
    u.onerror = e => {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      this.playing = false;
      this.status('Errore della sintesi vocale: ' + e.error);
    };
    speechSynthesis.speak(u);
  },

  play() {
    if (!this.chunks.length) { this.status('Carica prima un testo.'); return; }
    if (!('speechSynthesis' in window)) return;
    if (this.paused) { speechSynthesis.resume(); this.paused = false; this.playing = true; this.status('Lettura in corso…'); return; }
    if (this.playing) return;
    this.playing = true;
    this.status('Lettura in corso…');
    speechSynthesis.cancel();
    this.speakCurrent();
  },

  pause() {
    if (!this.playing || !('speechSynthesis' in window)) return;
    speechSynthesis.pause();
    this.paused = true;
    this.playing = false;
    this.status('In pausa.');
  },

  stop() {
    this.playing = false;
    this.paused = false;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    this.index = 0;
    $('progress').value = 0;
    if (this.chunks.length) this.status('Fermato.');
  },

  saveToLibrary() {
    if (!this.text) { this.status('Carica prima un testo da salvare.'); return; }
    const lib = store.get(LIB_KEY, []);
    if (lib.some(b => b.title === this.title && b.text === this.text)) { this.status('Già in libreria.'); return; }
    lib.push({ title: this.title, text: this.text, saved: new Date().toISOString() });
    if (!store.set(LIB_KEY, lib)) { this.status('Spazio di archiviazione pieno: il testo è troppo grande.'); return; }
    this.status('Salvato in libreria.');
  },

  renderLibrary() {
    const lib = store.get(LIB_KEY, []);
    const list = $('book-list');
    list.innerHTML = '';
    $('library-empty').hidden = lib.length > 0;
    lib.forEach((book, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = book.title + ' — ' + book.text.length + ' caratteri';
      btn.addEventListener('click', () => {
        this.setText(book.title, book.text);
        document.querySelector('.tab[data-tab=read]').click();
      });
      const del = document.createElement('button');
      del.type = 'button';
      del.textContent = 'Elimina';
      del.addEventListener('click', () => {
        const next = store.get(LIB_KEY, []).filter((_, j) => j !== i);
        store.set(LIB_KEY, next);
        this.renderLibrary();
      });
      li.append(btn, del);
      list.appendChild(li);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Reader.init());
