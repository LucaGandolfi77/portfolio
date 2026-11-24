/* Dizionario autonomo IT/EN del Camera Tracker */

const DICT = {
  it: {
    'app.title': 'Camera Tracker',
    'app.subtitle': 'Fotocamera creativa con filtri e visione artificiale',
    'nav.projects': '← Progetti',

    'filter.normal': 'Normale',
    'filter.bw': 'B/N',
    'filter.contrast': 'Contrasto',
    'filter.edges': 'Contorni',
    'filter.sepia': 'Seppia',
    'filter.invert': 'Inverti',
    'filter.blur': 'Sfocatura',
    'filter.pixelate': 'Pixel',
    'filter.vignette': 'Vignetta',
    'filter.sketch': 'Schizzo',
    'filter.cartoon': 'Cartoon',
    'filter.thermal': 'Termico',
    'filter.colorsplash': 'Color splash',
    'filter.objects': 'Oggetti',
    'filter.face': 'Volto',
    'filter.hands': 'Mani',
    'filter.tracker': 'AI Tracker',
    'filter.segment': 'Segmenta',
    'filter.subtitles': 'Sottotitoli',
    'filter.ar': 'Sticker AR',
    'filter.pose': 'Posa',
    'filter.qr': 'QR / Codici',

    'action.settings': 'Impostazioni',
    'action.gallery': 'Galleria',
    'action.diagnostics': 'Diagnostica',
    'action.shutter': 'Scatta foto',
    'action.switch': 'Cambia camera',
    'action.flash': 'Torcia',
    'action.timer': 'Timer',
    'action.close': 'Chiudi',
    'action.clear': 'Svuota galleria',
    'action.download': 'Scarica',
    'action.share': 'Condividi',
    'action.retry': 'Riprova',
    'action.start': 'Avvia fotocamera',
    'action.cancel': 'Annulla',
    'action.delete': 'Elimina',

    'panel.settings': 'IMPOSTAZIONI',
    'panel.gallery': 'GALLERIA',
    'panel.diagnostics': 'DIAGNOSTICA',
    'setting.language': 'Lingua riconoscimento',
    'setting.resolution': 'Risoluzione',
    'setting.mirror': 'Specchia immagine',
    'setting.detectionFps': 'FPS rilevamento AI',
    'setting.sound': 'Suoni',
    'setting.timer': 'Self-timer',
    'setting.zoom': 'Zoom',
    'res.low': 'Bassa · 640×480',
    'res.medium': 'Media · 960×540',
    'res.high': 'Alta · 1280×720',

    'status.ready': 'Pronto',
    'status.loading': 'Caricamento…',
    'status.cameraError': 'Errore fotocamera',
    'status.permission': 'Consenso richiesto',
    'status.noCamera': 'Nessuna fotocamera disponibile',
    'status.offline': 'Offline — filtri base disponibili',
    'status.online': 'Online',
    'status.aiNeeded': 'Caricamento modello AI…',
    'status.aiReady': 'Modello pronto',
    'status.processing': 'Elaborazione…',
    'status.saving': 'Salvataggio…',
    'status.saved': 'Foto salvata',
    'status.noPhotos': 'Nessuna foto salvata',
    'status.copied': 'Link copiato',
    'status.shareFail': 'Condivisione non disponibile',
    'status.subtitleStart': 'Avvio riconoscimento…',
    'status.subtitleListening': 'In ascolto…',
    'status.subtitleError': 'Errore microfono',
    'status.subtitleStopped': 'Riconoscimento fermato',
    'msg.update': 'Nuova versione disponibile',

    'diag.fps': 'FPS',
    'diag.resolution': 'Risoluzione',
    'diag.model': 'Modello AI',
    'diag.detection': 'Rilevamento',
    'diag.network': 'Rete',
    'diag.filter': 'Filtro',
    'diag.none': 'Nessuno',

    'msg.cameraDenied': 'Accesso alla fotocamera negato. Abilita il permesso nelle impostazioni del browser.',
    'msg.cameraMissing': 'Nessuna fotocamera trovata su questo dispositivo.',
    'msg.loadFail': 'Impossibile caricare la libreria AI. Controlla la connessione e riprova.',
    'msg.offlineAI': 'Sei offline: i filtri AI richiedono una connessione. I filtri base funzionano comunque.',
    'msg.photoSaved': 'Foto salvata nella galleria',
    'msg.galleryEmpty': 'Scatta una foto per vederla qui',
    'msg.shareUnsupported': 'Condivisione file non supportata: uso il download.',
    'msg.timer': 'Scatto tra {n}s',
    'msg.zoom': 'Zoom {n}×',
    'common.on': 'Attivo',
    'common.off': 'Disattivato',
    'common.yes': 'Sì',
    'common.no': 'No'
  },

  en: {
    'app.title': 'Camera Tracker',
    'app.subtitle': 'Creative camera with filters and computer vision',
    'nav.projects': '← Projects',

    'filter.normal': 'Normal',
    'filter.bw': 'B&W',
    'filter.contrast': 'Contrast',
    'filter.edges': 'Edges',
    'filter.sepia': 'Sepia',
    'filter.invert': 'Invert',
    'filter.blur': 'Blur',
    'filter.pixelate': 'Pixelate',
    'filter.vignette': 'Vignette',
    'filter.sketch': 'Sketch',
    'filter.cartoon': 'Cartoon',
    'filter.thermal': 'Thermal',
    'filter.colorsplash': 'Color splash',
    'filter.objects': 'Objects',
    'filter.face': 'Face',
    'filter.hands': 'Hands',
    'filter.tracker': 'AI Tracker',
    'filter.segment': 'Segment',
    'filter.subtitles': 'Subtitles',
    'filter.ar': 'AR stickers',
    'filter.pose': 'Pose',
    'filter.qr': 'QR / Barcode',

    'action.settings': 'Settings',
    'action.gallery': 'Gallery',
    'action.diagnostics': 'Diagnostics',
    'action.shutter': 'Take photo',
    'action.switch': 'Switch camera',
    'action.flash': 'Torch',
    'action.timer': 'Timer',
    'action.close': 'Close',
    'action.clear': 'Clear gallery',
    'action.download': 'Download',
    'action.share': 'Share',
    'action.retry': 'Retry',
    'action.start': 'Start camera',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',

    'panel.settings': 'SETTINGS',
    'panel.gallery': 'GALLERY',
    'panel.diagnostics': 'DIAGNOSTICS',
    'setting.language': 'Recognition language',
    'setting.resolution': 'Resolution',
    'setting.mirror': 'Mirror image',
    'setting.detectionFps': 'AI detection FPS',
    'setting.sound': 'Sounds',
    'setting.timer': 'Self-timer',
    'setting.zoom': 'Zoom',
    'res.low': 'Low · 640×480',
    'res.medium': 'Medium · 960×540',
    'res.high': 'High · 1280×720',

    'status.ready': 'Ready',
    'status.loading': 'Loading…',
    'status.cameraError': 'Camera error',
    'status.permission': 'Permission required',
    'status.noCamera': 'No camera available',
    'status.offline': 'Offline — basic filters available',
    'status.online': 'Online',
    'status.aiNeeded': 'Loading AI model…',
    'status.aiReady': 'Model ready',
    'status.processing': 'Processing…',
    'status.saving': 'Saving…',
    'status.saved': 'Photo saved',
    'status.noPhotos': 'No photos saved',
    'status.copied': 'Link copied',
    'status.shareFail': 'Sharing unavailable',
    'status.subtitleStart': 'Starting recognition…',
    'status.subtitleListening': 'Listening…',
    'status.subtitleError': 'Microphone error',
    'status.subtitleStopped': 'Recognition stopped',
    'msg.update': 'New version available',

    'diag.fps': 'FPS',
    'diag.resolution': 'Resolution',
    'diag.model': 'AI model',
    'diag.detection': 'Detection',
    'diag.network': 'Network',
    'diag.filter': 'Filter',
    'diag.none': 'None',

    'msg.cameraDenied': 'Camera access denied. Enable the permission in your browser settings.',
    'msg.cameraMissing': 'No camera found on this device.',
    'msg.loadFail': 'Unable to load the AI library. Check your connection and retry.',
    'msg.offlineAI': 'You are offline: AI filters need a connection. Basic filters still work.',
    'msg.photoSaved': 'Photo saved to the gallery',
    'msg.galleryEmpty': 'Take a photo to see it here',
    'msg.shareUnsupported': 'File sharing unsupported: falling back to download.',
    'msg.timer': 'Shot in {n}s',
    'msg.zoom': 'Zoom {n}×',
    'common.on': 'On',
    'common.off': 'Off',
    'common.yes': 'Yes',
    'common.no': 'No'
  }
};

const listeners = new Set();
function stored() {
  try {
    const raw = localStorage.getItem('camera_tracker_v1');
    const lang = raw ? JSON.parse(raw).speechLanguage : null;
    if (lang === 'it-IT' || lang === 'en-US') return lang;
  } catch (e) { /* ignore */ }
  try { return (navigator.language || 'en').toLowerCase().startsWith('it') ? 'it-IT' : 'en-US'; }
  catch (e) { return 'en-US'; }
}
let current = stored();
export function getLang() { return current; }
export function setLang(l) {
  if (l !== 'it-IT' && l !== 'en-US') return;
  current = l;
  listeners.forEach(fn => { try { fn(l); } catch (e) { /* ignore */ } });
}
export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function uiLang() { return current.startsWith('it') ? 'it' : 'en'; }
export function t(key, vars) {
  const dict = DICT[uiLang()];
  let v = dict[key] || DICT.en[key] || key;
  if (vars) Object.keys(vars).forEach(k => { v = v.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k])); });
  return v;
}
