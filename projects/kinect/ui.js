/* Kinetic — DOM HUD, overlays and bilingual strings */

const DICT = {
  en: {
    brand: 'KINETIC', score: 'SCORE', time: 'TIME', level: 'LEVEL', accuracy: 'ACCURACY',
    handHint: 'Show your hand to the camera',
    eyebrow: 'AI POWERED ARCADE', title: 'KINETIC',
    intro: 'Catch the falling orbs with your bare hands. No controller, no download — just you and your camera.',
    step1: 'Allow camera access', step2: 'Move your index finger into an orb', step3: 'Chain hits to build your combo',
    start: 'START GAME', privacy: 'Video is processed locally. Nothing is uploaded.', best: 'BEST {{score}}',
    toStart: 'to start', toPause: 'pause', toRestart: 'restart',
    loadingTitle: 'GETTING READY', loadingLead: 'Loading the hand-tracking model…',
    stepModel: 'AI model', stepCamera: 'Camera access', stepReady: 'Calibrating',
    errorTitle: 'SOMETHING WENT WRONG', retry: 'TRY AGAIN',
    pausedEyebrow: 'TAKE A BREATH', pauseTitle: 'PAUSED', timeLeft: 'TIME LEFT', resume: 'RESUME', restart: 'RESTART',
    overEyebrow: 'RUN COMPLETE', overTitle: 'NICE MOVES!', points: 'POINTS', maxCombo: 'MAX COMBO',
    bestScore: 'BEST SCORE', playAgain: 'PLAY AGAIN',
    combo: 'x{{n}} COMBO', comboUp: 'COMBO x{{n}}!', miss: 'MISS', timeUp: "TIME'S UP",
    newBest: 'NEW BEST SCORE!',
    errPermission: 'Camera access was denied. Allow it in your browser settings, then try again.',
    errInsecure: 'A secure connection (HTTPS) is required to use the camera.',
    errNotfound: 'No camera was found on this device.',
    errBusy: 'The camera is already in use by another app.',
    errModel: 'Could not load the AI model. Check your connection and try again.',
    errUnsupported: 'This browser does not support camera or WebAssembly features needed by the game.',
    errGeneric: 'Something went wrong while starting the game. Please try again.',
    toastLang: 'Language updated', toastMuted: 'Sound off', toastUnmuted: 'Sound on',
    toastPaused: 'Paused', toastResumed: 'Resumed'
  },
  it: {
    brand: 'KINETIC', score: 'PUNTI', time: 'TEMPO', level: 'LIVELLO', accuracy: 'PRECISIONE',
    handHint: 'Mostra la mano alla fotocamera',
    eyebrow: 'ARCADE CON IA', title: 'KINETIC',
    intro: 'Afferra le sfere che cadono con le mani. Nessun controller, nessun download — solo tu e la tua fotocamera.',
    step1: 'Consenti l\'accesso alla fotocamera', step2: 'Porta l\'indice dentro una sfera', step3: 'Colpisci in serie per il combo',
    start: 'INIZIA', privacy: 'Il video viene elaborato in locale. Nulla viene caricato.', best: 'RECORD {{score}}',
    toStart: 'per iniziare', toPause: 'pausa', toRestart: 'riavvia',
    loadingTitle: 'CI SIAMO QUASI', loadingLead: 'Caricamento del modello di tracciamento…',
    stepModel: 'Modello IA', stepCamera: 'Accesso fotocamera', stepReady: 'Calibrazione',
    errorTitle: 'QUALCOSA È ANDATO STORTO', retry: 'RIPROVA',
    pausedEyebrow: 'PRENDI FIATO', pauseTitle: 'IN PAUSA', timeLeft: 'TEMPO RIMASTO', resume: 'RIPRENDI', restart: 'RIAVVIA',
    overEyebrow: 'SESSIONE COMPLETATA', overTitle: 'OTTIMO LAVORO!', points: 'PUNTI', maxCombo: 'COMBO MAX',
    bestScore: 'MIGLIOR PUNTEGGIO', playAgain: 'GIOCA ANCORA',
    combo: 'x{{n}} COMBO', comboUp: 'COMBO x{{n}}!', miss: 'MANCATO', timeUp: 'TEMPO SCADUTO',
    newBest: 'NUOVO RECORD!',
    errPermission: 'Accesso alla fotocamera negato. Abilitalo nelle impostazioni del browser, poi riprova.',
    errInsecure: 'Per usare la fotocamera serve una connessione sicura (HTTPS).',
    errNotfound: 'Nessuna fotocamera trovata su questo dispositivo.',
    errBusy: 'La fotocamera è già in uso da un\'altra app.',
    errModel: 'Impossibile caricare il modello IA. Controlla la connessione e riprova.',
    errUnsupported: 'Questo browser non supporta le funzioni di fotocamera o WebAssembly necessarie.',
    errGeneric: 'Si è verificato un errore durante l\'avvio. Riprova.',
    toastLang: 'Lingua aggiornata', toastMuted: 'Audio disattivato', toastUnmuted: 'Audio attivato',
    toastPaused: 'In pausa', toastResumed: 'Ripreso'
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
      'hud', 'score', 'combo', 'time', 'level', 'accuracy', 'level-fill', 'hand-hint',
      'card-start', 'card-loading', 'card-error', 'card-pause', 'card-over',
      'error-msg', 'step-model', 'step-camera', 'step-ready',
      'pause-score', 'pause-time', 'pause-acc',
      'final-score', 'over-acc', 'over-combo', 'over-best', 'toast', 'hit-flash',
      'sound-btn', 'pause-btn'
    ].forEach(id => { this.el[id] = document.getElementById(id); });
    this.cards = ['start', 'loading', 'error', 'pause', 'over'];
    this.best = 0;
    this._toastTimer = 0;
  }

  t(key, vars = {}) {
    let s = (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key;
    for (const k in vars) s = s.replaceAll('{{' + k + '}}', String(vars[k]));
    return s;
  }

  init() {
    this.applyLang(this.lang, true);
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el && typeof fn === 'function') el.addEventListener('click', fn);
    };
    bind('start-btn', this.handlers.onStart);
    bind('retry-btn', this.handlers.onRetry);
    bind('resume-btn', this.handlers.onResume);
    bind('restart-btn-pause', this.handlers.onRestart);
    bind('restart-btn-over', this.handlers.onRestart);
    bind('pause-btn', this.handlers.onPause);
    bind('sound-btn', this.handlers.onSound);

    // The site-wide language selector is injected dynamically by top_buttons.js
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'siteLangSelect') this.applyLang(e.target.value);
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'site_lang' || e.key === 'lang') this.applyLang(readLang(), true);
    });
  }

  applyLang(value, silent = false) {
    const lang = String(value || 'en').slice(0, 2) === 'it' ? 'it' : 'en';
    if (lang === this.lang && !silent) return;
    this.lang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const key = node.getAttribute('data-i18n');
      let vars = {};
      try { vars = JSON.parse(node.getAttribute('data-vars') || '{}'); } catch (e) { /* ignore */ }
      const text = this.t(key, vars);
      if (node.tagName === 'INPUT') node.value = text;
      else node.textContent = text;
    });
    this.setBest(this.best);
    if (this.handlers.onLang) this.handlers.onLang(lang);
    if (!silent) this.toast(this.t('toastLang'));
  }

  showScreen(name) {
    this.cards.forEach(c => this.el['card-' + c].classList.toggle('is-hidden', c !== name));
    this.el.hud.classList.toggle('is-hidden', !['none', 'pause'].includes(name));
    if (name === 'start') this.setBest(this.best);
  }

  setBest(score) {
    this.best = score || 0;
    const node = document.querySelector('[data-i18n="best"]');
    if (node) node.textContent = this.t('best', { score: this.best });
  }

  setStep(name, state) {
    const el = this.el['step-' + name];
    if (!el) return;
    el.classList.remove('active', 'done', 'fail');
    if (state) el.classList.add(state);
  }

  resetSteps() { ['model', 'camera', 'ready'].forEach(s => this.setStep(s, '')); }

  setError(code) {
    this.el['error-msg'].textContent = this.t('err' + code.charAt(0).toUpperCase() + code.slice(1));
  }

  updateHUD(g) {
    this.el.score.textContent = g.score;
    this.el.time.textContent = Math.ceil(g.remaining);
    this.el.level.textContent = g.level;
    const acc = g.hits + g.misses ? Math.round(g.hits / (g.hits + g.misses) * 100) + '%' : '—';
    this.el.accuracy.textContent = acc;
    this.el.time.classList.toggle('urgent', g.remaining <= 10);
    this.el['level-fill'].style.width = (g.levelProgress * 100).toFixed(1) + '%';
    if (g.combo > 1) {
      this.el.combo.textContent = this.t('combo', { n: g.combo });
      this.el.combo.classList.remove('is-hidden');
    } else {
      this.el.combo.classList.add('is-hidden');
    }
  }

  bumpScore() {
    const el = this.el.score;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  flash() {
    const el = this.el['hit-flash'];
    el.classList.remove('on');
    void el.offsetWidth;
    el.classList.add('on');
  }

  setHandHint(visible) { this.el['hand-hint'].classList.toggle('is-hidden', !visible); }

  setSound(muted) {
    this.el['sound-btn'].textContent = muted ? '🔇' : '🔊';
    this.el['sound-btn'].setAttribute('aria-label', muted ? this.t('toastMuted') : this.t('toastUnmuted'));
  }

  setPaused(paused) {
    this.el['pause-btn'].textContent = paused ? '▶' : '⏸';
    this.el['pause-btn'].setAttribute('aria-label', paused ? this.t('resume') : this.t('pauseTitle'));
  }

  showPause(g) {
    this.el['pause-score'].textContent = g.score;
    this.el['pause-time'].textContent = Math.ceil(g.remaining);
    this.el['pause-acc'].textContent = g.hits + g.misses ? Math.round(g.hits / (g.hits + g.misses) * 100) + '%' : '—';
    this.showScreen('pause');
  }

  showResult(g, best) {
    this.el['final-score'].textContent = g.score;
    this.el['over-acc'].textContent = g.hits + g.misses ? Math.round(g.hits / (g.hits + g.misses) * 100) + '%' : '—';
    this.el['over-combo'].textContent = g.maxCombo;
    this.el['over-best'].textContent = best;
    this.showScreen('over');
  }

  toast(msg) {
    const el = this.el.toast;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('on'), 2000);
  }
}
