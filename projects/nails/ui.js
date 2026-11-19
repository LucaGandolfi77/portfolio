/* Nail Art AR — controls, status, errors and bilingual strings */

import { PRESETS } from './design.js';

const DICT = {
  en: {
    back: 'Portfolio', title: 'Nail Art AR', stop: 'Stop', eyebrow: 'VIRTUAL STUDIO', studio: 'Design Studio',
    previewTag: 'LIVE PREVIEW', presets: 'PRESETS', baseColor: 'Base color', mixColor: 'Tip / gradient',
    shape: 'Shape', shapeRound: 'Round', shapeSquare: 'Square', shapeStiletto: 'Stiletto',
    shapeAlmond: 'Almond', shapeCoffin: 'Coffin', length: 'Length', gloss: 'Gloss',
    lighting: 'Realistic lighting', sparkle: 'Glitter particles', start: 'START AR CAMERA',
    privacy: 'Video is processed locally. Nothing is uploaded.', readyTitle: 'Ready to try on?',
    readyText: 'Design your nails on the left, then start the camera to see them on your hands.',
    powered: 'Powered by MediaPipe Hand Landmarker',
    loadingModel: 'Loading AI model…', loadingCamera: 'Waiting for camera permission…',
    errorTitle: 'Something went wrong', retry: 'TRY AGAIN',
    errPermission: 'Camera access was denied. Allow it in your browser settings, then try again.',
    errInsecure: 'A secure connection (HTTPS) is required to use the camera.',
    errNotfound: 'No camera was found on this device.',
    errBusy: 'The camera is already in use by another app.',
    errModel: 'Could not load the AI model. Check your connection and try again.',
    errUnsupported: 'This browser does not support the camera or WebAssembly features needed here.',
    errGeneric: 'Something went wrong while starting the camera. Please try again.',
    noHands: 'Show your hands to the camera', handsFound: 'Hands tracked', handFound: 'Hand tracked',
    shotSaved: 'Screenshot saved', toastLang: 'Language updated', debugOn: 'Landmark debug on',
    debugOff: 'Landmark debug off', shotFail: 'Could not save screenshot'
  },
  it: {
    back: 'Portfolio', title: 'Nail Art AR', stop: 'Stop', eyebrow: 'STUDIO VIRTUALE', studio: 'Design Studio',
    previewTag: 'ANTEPRIMA LIVE', presets: 'PRESET', baseColor: 'Colore base', mixColor: 'Punta / gradiente',
    shape: 'Forma', shapeRound: 'Rotonda', shapeSquare: 'Quadrata', shapeStiletto: 'Stiletto',
    shapeAlmond: 'Mandorla', shapeCoffin: 'Coffin', length: 'Lunghezza', gloss: 'Lucentezza',
    lighting: 'Illuminazione realistica', sparkle: 'Particelle glitter', start: 'AVVIA FOTOCAMERA AR',
    privacy: 'Il video viene elaborato in locale. Nulla viene caricato.', readyTitle: 'Pronto a provarle?',
    readyText: 'Progetta le unghie a sinistra, poi avvia la fotocamera per vederle sulle tue mani.',
    powered: 'Con MediaPipe Hand Landmarker',
    loadingModel: 'Caricamento del modello IA…', loadingCamera: 'In attesa del permesso fotocamera…',
    errorTitle: 'Qualcosa è andato storto', retry: 'RIPROVA',
    errPermission: 'Accesso alla fotocamera negato. Abilitalo nelle impostazioni del browser, poi riprova.',
    errInsecure: 'Per usare la fotocamera serve una connessione sicura (HTTPS).',
    errNotfound: 'Nessuna fotocamera trovata su questo dispositivo.',
    errBusy: 'La fotocamera è già in uso da un\'altra app.',
    errModel: 'Impossibile caricare il modello IA. Controlla la connessione e riprova.',
    errUnsupported: 'Questo browser non supporta le funzioni di fotocamera o WebAssembly necessarie.',
    errGeneric: 'Si è verificato un errore durante l\'avvio della fotocamera. Riprova.',
    noHands: 'Mostra le mani alla fotocamera', handsFound: 'Mani tracciate', handFound: 'Mano tracciata',
    shotSaved: 'Screenshot salvato', toastLang: 'Lingua aggiornata', debugOn: 'Debug landmark attivo',
    debugOff: 'Debug landmark disattivato', shotFail: 'Impossibile salvare lo screenshot'
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
      'placeholder', 'loading', 'loading-text', 'error-card', 'error-msg', 'status-pill', 'status-text',
      'debug-badge', 'debug-btn', 'shot-btn', 'stop-btn', 'start-btn', 'retry-btn', 'toast',
      'color1', 'color2', 'shape', 'length', 'gloss', 'lighting', 'sparkle',
      'length-val', 'gloss-val', 'presets'
    ].forEach(id => { this.el[id] = document.getElementById(id); });
    this._toastTimer = 0;
  }

  t(key) { return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key; }

  init(design) {
    this.applyLang(this.lang, true);
    const h = this.handlers;
    this.el['start-btn'].addEventListener('click', h.onStart);
    this.el['retry-btn'].addEventListener('click', h.onRetry);
    this.el['stop-btn'].addEventListener('click', h.onStop);
    this.el['shot-btn'].addEventListener('click', h.onScreenshot);
    this.el['debug-btn'].addEventListener('click', h.onDebug);

    PRESETS.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'preset';
      b.dataset.id = p.id;
      b.dataset.name = p.name;
      b.style.setProperty('--a', p.c1);
      b.style.setProperty('--b', p.c2);
      b.setAttribute('aria-label', p.name);
      b.addEventListener('click', () => h.onPreset(p.id));
      this.el.presets.appendChild(b);
    });

    const emit = () => h.onDesign({
      c1: this.el.color1.value,
      c2: this.el.color2.value,
      shape: this.el.shape.value,
      length: parseFloat(this.el.length.value),
      gloss: parseFloat(this.el.gloss.value),
      lighting: this.el.lighting.checked,
      sparkle: this.el.sparkle.checked
    });
    Object.values(this.el).forEach(el => {
      if (el && ['color1', 'color2', 'shape', 'length', 'gloss', 'lighting', 'sparkle'].includes(el.id)) {
        el.addEventListener('input', emit);
      }
    });
    this.syncControls(design);

    document.addEventListener('change', e => {
      if (e.target && e.target.id === 'siteLangSelect') this.applyLang(e.target.value);
    });
    window.addEventListener('storage', e => {
      if (e.key === 'site_lang' || e.key === 'lang') this.applyLang(readLang(), true);
    });
  }

  syncControls(design) {
    const s = design.state;
    this.el.color1.value = s.c1;
    this.el.color2.value = s.c2;
    this.el.shape.value = s.shape;
    this.el.length.value = s.length;
    this.el.gloss.value = s.gloss;
    this.el.lighting.checked = s.lighting;
    this.el.sparkle.checked = s.sparkle;
    this.el['length-val'].textContent = Number(s.length).toFixed(2);
    this.el['gloss-val'].textContent = Math.round(s.gloss * 100) + '%';
    this.el.presets.querySelectorAll('.preset').forEach(b => {
      const p = PRESETS.find(x => x.id === b.dataset.id);
      b.classList.toggle('on', !!p && design.matchesPreset(p));
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
    if (!silent) this.toast(this.t('toastLang'));
  }

  showScreen(name) {
    this.el.placeholder.classList.toggle('is-hidden', name !== 'placeholder');
    this.el.loading.classList.toggle('is-hidden', name !== 'loading');
    this.el['error-card'].classList.toggle('is-hidden', name !== 'error');
  }

  setLoading(stage) {
    this.el['loading-text'].textContent = this.t(stage === 'camera' ? 'loadingCamera' : 'loadingModel');
  }

  setError(code) {
    this.el['error-msg'].textContent = this.t('err' + String(code).charAt(0).toUpperCase() + String(code).slice(1));
  }

  setStatus(count) {
    const pill = this.el['status-pill'];
    pill.classList.toggle('is-hidden', count === null);
    if (count === null) return;
    pill.classList.toggle('searching', count === 0);
    this.el['status-text'].textContent = count === 0
      ? this.t('noHands')
      : count === 1 ? this.t('handFound') : this.t('handsFound');
  }

  setRunning(running) {
    document.body.dataset.state = running ? 'running' : 'idle';
    this.el['start-btn'].classList.toggle('is-hidden', running);
    this.el['stop-btn'].classList.toggle('is-hidden', !running);
    this.el['shot-btn'].disabled = !running;
    if (!running) this.setStatus(null);
  }

  setDebug(on) {
    this.el['debug-btn'].classList.toggle('on', on);
    this.el['debug-badge'].classList.toggle('is-hidden', !on);
    this.toast(this.t(on ? 'debugOn' : 'debugOff'));
  }

  toast(msg) {
    const el = this.el.toast;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }
}
