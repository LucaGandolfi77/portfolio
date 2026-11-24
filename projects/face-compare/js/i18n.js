/**
 * i18n.js — dizionari IT/EN per Face Compare.
 * La lingua viene persistita in pf.face-compare.lang e sincronizzata
 * con site_lang (selettore globale del portfolio).
 */

const LANG_KEY = 'pf.face-compare.lang';

const IT = {
  'app.title': 'Face Compare',
  'app.tagline': 'Confronto volti sul dispositivo · nessun media caricato',
  'nav.home': 'Portfolio',
  'status.modelIdle': 'Modello non caricato',
  'status.modelLoading': 'Caricamento modello…',
  'status.modelReady': 'Modello pronto',
  'status.modelError': 'Errore modello',
  'status.cameraOff': 'Camera spenta',
  'status.cameraLive': 'Camera attiva',
  'status.offline': 'Offline',
  'status.online': 'Online',
  'status.lang': 'Lingua',
  'ref.title': 'Volto di riferimento',
  'ref.subtitle': 'Trascina un\'immagine, incollala o scegli un profilo salvato.',
  'live.title': 'Volto da confrontare',
  'live.subtitle': 'Usa la webcam o carica un\'immagine.',
  'actions.startCamera': 'Avvia webcam',
  'actions.stopCamera': 'Ferma webcam',
  'actions.capture': 'Cattura come riferimento',
  'actions.compare': 'Confronta',
  'actions.swap': 'Inverti A/B',
  'actions.saveProfile': 'Salva profilo',
  'actions.exportPng': 'Esporta PNG',
  'actions.clear': 'Cancella',
  'actions.chooseFile': 'Scegli immagine',
  'actions.useCamera': 'Usa webcam',
  'actions.useImage': 'Usa immagine',
  'actions.delete': 'Elimina',
  'actions.load': 'Carica',
  'actions.cancel': 'Annulla',
  'actions.save': 'Salva',
  'actions.close': 'Chiudi',
  'labels.reference': 'Riferimento',
  'labels.live': 'Live',
  'labels.similarity': 'Similarità',
  'labels.confidence': 'Confidenza',
  'labels.quality': 'Qualità',
  'labels.faces': 'Volti',
  'labels.pose': 'Posa',
  'labels.fps': 'FPS',
  'labels.trend': 'Andamento',
  'labels.overlay': 'Overlay landmark',
  'labels.mirror': 'Specchio webcam',
  'labels.geometryWeight': 'Peso geometria',
  'labels.aligned': 'Volto allineato',
  'labels.history': 'Storico confronti',
  'labels.profiles': 'Profili salvati',
  'labels.noProfiles': 'Nessun profilo salvato. Carica un volto e premi “Salva profilo”.',
  'labels.noHistory': 'Nessun confronto registrato.',
  'labels.savedAt': 'Salvato alle {time}',
  'labels.unnamed': 'Senza nome',
  'bands.low': 'Bassa',
  'bands.medium': 'Media',
  'bands.high': 'Alta',
  'bands.lowDesc': 'Serve un campione migliore o un altro riferimento.',
  'bands.mediumDesc': 'Somiglianza parziale: ripeti con posa e luce simili.',
  'bands.highDesc': 'Volti molto simili secondo il descrittore.',
  'warnings.noFace': 'Nessun volto rilevato',
  'warnings.multipleFaces': 'Più volti nell\'inquadratura',
  'warnings.tooSmall': 'Volto troppo piccolo',
  'warnings.blurry': 'Immagine sfocata',
  'warnings.dark': 'Luce insufficiente',
  'warnings.overexposed': 'Immagine sovraesposta',
  'warnings.profile': 'Volto troppo di profilo',
  'messages.dropHere': 'Rilascia qui',
  'messages.pasteHint': 'Puoi anche incollare un\'immagine con Ctrl+V',
  'messages.privacy': 'Tutto gira nel browser: immagini e biometrici non lasciano il dispositivo.',
  'messages.tip': 'Per un confronto affidabile usa luce frontale e posa simile.',
  'messages.loadingModel': 'Caricamento del modello face landmark locale…',
  'messages.modelFailed': 'Impossibile caricare il modello. Ricarica la pagina o controlla la connessione.',
  'messages.cameraDenied': 'Accesso alla webcam negato: {error}',
  'messages.needReference': 'Seleziona prima un volto di riferimento.',
  'messages.needLive': 'Seleziona un volto da confrontare o avvia la webcam.',
  'messages.profileSaved': 'Profilo “{name}” salvato.',
  'messages.profileDeleted': 'Profilo eliminato.',
  'messages.profileLoaded': 'Profilo “{name}” caricato.',
  'messages.snapshotSaved': 'Istantanea scaricata.',
  'messages.askName': 'Nome del profilo',
  'messages.askNameHelp': 'Scegli un nome per riconoscerlo in seguito.',
  'messages.noFaceDetected': 'Nessun volto: avvicinati alla camera.',
  'messages.clearAll': 'Cancella riferimento, immagine e storico?',
  'messages.descriptorNote': 'Punteggio calibrato euristicamente su descrittori di landmark e aspetto — non è un riconoscimento biometrico certificato.',
  'messages.overlayOn': 'Overlay landmark attivo',
  'messages.overlayOff': 'Overlay landmark disattivato',
  'messages.captureDone': 'Riferimento catturato dalla webcam.',
  'messages.referenceReady': 'Riferimento pronto.'
};

const EN = {
  'app.title': 'Face Compare',
  'app.tagline': 'On-device face comparison · no media uploaded',
  'nav.home': 'Portfolio',
  'status.modelIdle': 'Model not loaded',
  'status.modelLoading': 'Loading model…',
  'status.modelReady': 'Model ready',
  'status.modelError': 'Model error',
  'status.cameraOff': 'Camera off',
  'status.cameraLive': 'Camera live',
  'status.offline': 'Offline',
  'status.online': 'Online',
  'status.lang': 'Language',
  'ref.title': 'Reference face',
  'ref.subtitle': 'Drop an image, paste it, or load a saved profile.',
  'live.title': 'Face to compare',
  'live.subtitle': 'Use the webcam or upload an image.',
  'actions.startCamera': 'Start webcam',
  'actions.stopCamera': 'Stop webcam',
  'actions.capture': 'Capture as reference',
  'actions.compare': 'Compare',
  'actions.swap': 'Swap A/B',
  'actions.saveProfile': 'Save profile',
  'actions.exportPng': 'Export PNG',
  'actions.clear': 'Clear',
  'actions.chooseFile': 'Choose image',
  'actions.useCamera': 'Use webcam',
  'actions.useImage': 'Use image',
  'actions.delete': 'Delete',
  'actions.load': 'Load',
  'actions.cancel': 'Cancel',
  'actions.save': 'Save',
  'actions.close': 'Close',
  'labels.reference': 'Reference',
  'labels.live': 'Live',
  'labels.similarity': 'Similarity',
  'labels.confidence': 'Confidence',
  'labels.quality': 'Quality',
  'labels.faces': 'Faces',
  'labels.pose': 'Pose',
  'labels.fps': 'FPS',
  'labels.trend': 'Trend',
  'labels.overlay': 'Landmark overlay',
  'labels.mirror': 'Mirror webcam',
  'labels.geometryWeight': 'Geometry weight',
  'labels.aligned': 'Aligned face',
  'labels.history': 'Comparison history',
  'labels.profiles': 'Saved profiles',
  'labels.noProfiles': 'No saved profile. Load a face and press “Save profile”.',
  'labels.noHistory': 'No comparison recorded yet.',
  'labels.savedAt': 'Saved at {time}',
  'labels.unnamed': 'Untitled',
  'bands.low': 'Low',
  'bands.medium': 'Medium',
  'bands.high': 'High',
  'bands.lowDesc': 'Use a better sample or a different reference.',
  'bands.mediumDesc': 'Partial resemblance: retry with similar pose and lighting.',
  'bands.highDesc': 'Faces are very similar according to the descriptor.',
  'warnings.noFace': 'No face detected',
  'warnings.multipleFaces': 'More than one face in frame',
  'warnings.tooSmall': 'Face too small',
  'warnings.blurry': 'Blurry image',
  'warnings.dark': 'Low light',
  'warnings.overexposed': 'Overexposed image',
  'warnings.profile': 'Face turned too far sideways',
  'messages.dropHere': 'Drop here',
  'messages.pasteHint': 'You can also paste an image with Ctrl+V',
  'messages.privacy': 'Everything runs in the browser: images and biometrics never leave your device.',
  'messages.tip': 'For a reliable comparison use frontal light and a similar pose.',
  'messages.loadingModel': 'Loading the local face landmark model…',
  'messages.modelFailed': 'Could not load the model. Reload the page or check your connection.',
  'messages.cameraDenied': 'Webcam access denied: {error}',
  'messages.needReference': 'Select a reference face first.',
  'messages.needLive': 'Select a face to compare or start the webcam.',
  'messages.profileSaved': 'Profile “{name}” saved.',
  'messages.profileDeleted': 'Profile deleted.',
  'messages.profileLoaded': 'Profile “{name}” loaded.',
  'messages.snapshotSaved': 'Snapshot downloaded.',
  'messages.askName': 'Profile name',
  'messages.askNameHelp': 'Pick a name to recognize it later.',
  'messages.noFaceDetected': 'No face: move closer to the camera.',
  'messages.clearAll': 'Clear reference, image and history?',
  'messages.descriptorNote': 'Score is heuristically calibrated on landmark and appearance descriptors — not certified biometric recognition.',
  'messages.overlayOn': 'Landmark overlay on',
  'messages.overlayOff': 'Landmark overlay off',
  'messages.captureDone': 'Reference captured from webcam.',
  'messages.referenceReady': 'Reference ready.'
};

const DICTS = { it: IT, en: EN };
let current = 'it';
const listeners = [];

function supported(lang) {
  const value = String(lang || '').toLowerCase();
  if (value.startsWith('it')) return 'it';
  if (value.startsWith('en')) return 'en';
  return null;
}

export function getLang() { return current; }

export function initLang() {
  let stored = null;
  try { stored = localStorage.getItem(LANG_KEY) || localStorage.getItem('site_lang') || localStorage.getItem('lang'); } catch (e) {}
  current = supported(stored) || (navigator.language && supported(navigator.language)) || 'it';
  return current;
}

export function setLang(lang) {
  const next = supported(lang);
  if (!next) return current;
  current = next;
  try {
    localStorage.setItem(LANG_KEY, next);
    localStorage.setItem('site_lang', next);
    localStorage.setItem('lang', next);
  } catch (e) {}
  document.documentElement.lang = next;
  listeners.forEach((fn) => fn(next));
  return next;
}

export function t(key, vars) {
  let text = (DICTS[current] && DICTS[current][key]) || (EN[key]) || key;
  if (vars) {
    Object.keys(vars).forEach((name) => {
      text = text.replace(new RegExp('\\{' + name + '\\}', 'g'), String(vars[name]));
    });
  }
  return text;
}

/** Applica data-i18n / data-i18n-title / data-i18n-placeholder. */
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}

export function onLanguageChange(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.push(fn);
  return () => listeners.splice(listeners.indexOf(fn), 1);
}
