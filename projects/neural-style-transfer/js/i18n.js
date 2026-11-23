/* Neural Style Studio — EN/IT dictionary */

const DICT = {
  en: {
    title: 'Neural Style Studio', subtitle: 'Real-time GPU previews. Optional neural renders.',
    content: 'Photo', styles: 'Style', styleA: 'Style A', styleB: 'Style B', customStyle: 'Custom style',
    gpuMode: 'GPU preview', neuralMode: 'Neural render', strength: 'Strength', mix: 'Style mix',
    brush: 'Brush size', clearMask: 'Clear mask', camera: 'Camera', snapshot: 'Snapshot',
    enhance: 'Enhance with AI', timelapse: 'Timelapse', download: 'Download', randomize: 'Randomize',
    reset: 'Reset', beforeAfter: 'Before / after', settings: 'Settings', info: 'Info', close: 'Close',
    quality: 'Quality', high: 'High', low: 'Low', statusReady: 'Ready', statusLoading: 'Loading…',
    statusModel: 'Loading neural model…', statusError: 'Error', hintUpload: 'Upload your own photo or style',
    neuralHint: 'The neural render downloads a 6.6 MB model on first use and is then cached.',
    frames: 'frames', replay: 'Replay', stop: 'Stop', play: 'Play', pause: 'Pause',
    modelProgress: 'Model {percent}%', saved: 'Saved ✓', cameraOff: 'Camera off',
    howTitle: 'How it works',
    howText: 'GPU shaders stylize your photo instantly. For a higher-quality result, the neural render runs a Fast Neural Style Transfer ONNX model entirely on your device. Nothing is uploaded.'
  },
  it: {
    title: 'Neural Style Studio', subtitle: 'Anteprime GPU in tempo reale. Rendering neurale opzionale.',
    content: 'Foto', styles: 'Stile', styleA: 'Stile A', styleB: 'Stile B', customStyle: 'Stile personalizzato',
    gpuMode: 'Anteprima GPU', neuralMode: 'Rendering neurale', strength: 'Intensità', mix: 'Mix stili',
    brush: 'Dimensione pennello', clearMask: 'Cancella maschera', camera: 'Camera', snapshot: 'Istantanea',
    enhance: 'Migliora con AI', timelapse: 'Timelapse', download: 'Scarica', randomize: 'Casuale',
    reset: 'Reset', beforeAfter: 'Prima / dopo', settings: 'Impostazioni', info: 'Info', close: 'Chiudi',
    quality: 'Qualità', high: 'Alta', low: 'Bassa', statusReady: 'Pronto', statusLoading: 'Caricamento…',
    statusModel: 'Caricamento modello neurale…', statusError: 'Errore', hintUpload: 'Carica una foto o uno stile personalizzato',
    neuralHint: 'Il rendering neurale scarica un modello da 6,6 MB al primo utilizzo, poi lo memorizza nella cache.',
    frames: 'frame', replay: 'Riproduci', stop: 'Ferma', play: 'Riproduci', pause: 'Pausa',
    modelProgress: 'Modello {percent}%', saved: 'Salvato ✓', cameraOff: 'Camera disattivata',
    howTitle: 'Come funziona',
    howText: 'Gli shader GPU stylizzano la foto in tempo reale. Per un risultato di qualità superiore, il rendering neurale esegue un modello ONNX Fast Neural Style Transfer interamente sul tuo dispositivo. Nessun file viene caricato.'
  }
};

export class I18n {
  constructor() {
    let lang = 'en';
    try { lang = (localStorage.getItem('site_lang') || localStorage.getItem('lang') || 'en').slice(0, 2); }
    catch (e) { /* ignore */ }
    this.lang = lang === 'it' ? 'it' : 'en';
  }

  t(key, vars = {}) {
    let text = (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key;
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  }

  apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
    document.documentElement.lang = this.lang;
  }

  setLang(lang) {
    this.lang = lang === 'it' ? 'it' : 'en';
    return this;
  }
}
