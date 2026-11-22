/**
 * i18n.js — inglese e italiano per Text Lab.
 */

const DICT = {
  en: {
    skip: 'Skip to content',
    kicker: 'Camera · OCR · Local',
    title: 'Turn images into text',
    subtitle: 'Scan a page or drop a photo. Tesseract reads it on this device; nothing is uploaded.',
    modeLabel: 'Text Lab source',
    modeCamera: 'Camera',
    modeImage: 'Image',
    cameraStart: 'Start camera',
    cameraStop: 'Stop camera',
    cameraStarting: 'Starting…',
    cameraSwitch: 'Switch camera',
    cameraReady: 'Camera on',
    cameraIdle: 'Camera off',
    cameraOffHint: 'Point the camera at a page, then capture. Text stays on this device.',
    cameraDenied: 'Camera permission denied. Allow access in your browser settings and try again.',
    cameraNotFound: 'No camera found on this device.',
    cameraBusy: 'The camera is busy in another app.',
    cameraInsecure: 'Camera access requires HTTPS.',
    cameraUnsupported: 'This browser does not support camera access.',
    cameraError: 'Could not start the camera.',
    capture: 'Capture',
    retake: 'Retake',
    newImage: 'New image',
    capturing: 'Capturing…',
    uploadTitle: 'Drop an image here',
    uploadHint: 'PNG, JPEG or WebP · max 25 MB',
    chooseImage: 'Choose image',
    pasteImage: 'Paste image',
    dropActive: 'Release to read the image',
    imageReady: 'Image ready',
    imageType: 'Choose an image file (PNG, JPEG or WebP).',
    imageSize: 'This image is larger than 25 MB.',
    imageEmpty: 'The selected file is empty.',
    previewAlt: 'Image to recognise',
    languageLabel: 'OCR languages',
    langEnglish: 'English',
    langItalian: 'Italian',
    langBoth: 'English + Italian',
    languageHint: 'Choose one or both. More languages take longer on the first run.',
    preprocessTitle: 'Image preparation',
    grayscale: 'Grayscale',
    contrast: 'High contrast',
    rotateLeft: 'Rotate left',
    rotateRight: 'Rotate right',
    resetImage: 'Reset image',
    extract: 'Extract text',
    extracting: 'Reading…',
    cancel: 'Cancel',
    retry: 'Retry',
    progressCore: 'Loading OCR engine…',
    progressInit: 'Starting OCR engine…',
    progressLang: 'Loading language data…',
    progressApi: 'Preparing recognizer…',
    progressRecognize: 'Recognising text…',
    ocrError: 'Could not read this image. Try a sharper photo or better light.',
    noText: 'No readable text found. Try a clearer image.',
    engineNotice: 'The OCR engine and language data are served locally. The first run downloads about 10 MB, then works offline.',
    engineReady: 'OCR ready',
    engineLoading: 'Loading OCR…',
    engineError: 'OCR error',
    resultTitle: 'Text',
    resultEmptyTitle: 'No text yet',
    resultEmptyText: 'Capture a page or upload an image. The recognised text will appear here, editable.',
    resultPlaceholder: 'Recognised text…',
    copy: 'Copy',
    copied: 'Text copied',
    copyFailed: 'Could not copy',
    download: 'Download .txt',
    downloaded: 'Download started',
    share: 'Share',
    shareUnavailable: 'Sharing is not available',
    readAloud: 'Read aloud',
    stopReading: 'Stop reading',
    speechUnsupported: 'Speech synthesis is not available in this browser.',
    clean: 'Clean text',
    cleaned: 'Text cleaned',
    clear: 'Clear',
    cleared: 'Cleared',
    statsWords: 'Words',
    statsChars: 'Characters',
    statsLines: 'Lines',
    statsConfidence: 'Confidence',
    statsReading: 'Reading',
    statsTime: 'Time',
    minutes: '{n} min',
    seconds: '{n} s',
    languageStat: 'Language',
    historyTitle: 'Recent scans',
    historyEmpty: 'No scans yet',
    historyHint: 'The last 20 results stay on this device.',
    clearHistory: 'Clear history',
    confirmClearTitle: 'Clear all recent scans?',
    confirmClearText: 'The text history on this device will be removed. This cannot be undone.',
    confirmClear: 'Clear all',
    cancelDialog: 'Cancel',
    historyRestored: 'Text restored',
    delete: 'Delete',
    deleted: 'Deleted',
    privacyTitle: 'Privacy',
    privacyText: 'Tesseract.js runs in a Web Worker in your browser. Images are processed locally, never uploaded. Settings and the last 20 results stay in local storage on this device.',
    footer: 'A Project Kit 2026 app · OCR stays on-device',
    footerProjects: 'All projects',
    errorGeneric: 'Something went wrong. Try again.',
    fileTooLarge: 'The file is too large.',
    confidenceHigh: 'High confidence',
    confidenceMedium: 'Medium confidence',
    confidenceLow: 'Low confidence'
  },
  it: {
    skip: 'Vai al contenuto',
    kicker: 'Fotocamera · OCR · Locale',
    title: 'Trasforma le immagini in testo',
    subtitle: 'Scansiona una pagina o trascina una foto. Tesseract legge sul dispositivo; nulla viene caricato.',
    modeLabel: 'Sorgente di Text Lab',
    modeCamera: 'Fotocamera',
    modeImage: 'Immagine',
    cameraStart: 'Attiva fotocamera',
    cameraStop: 'Ferma fotocamera',
    cameraStarting: 'Avvio…',
    cameraSwitch: 'Cambia fotocamera',
    cameraReady: 'Fotocamera attiva',
    cameraIdle: 'Fotocamera spenta',
    cameraOffHint: 'Inquadra una pagina, poi scatta. Il testo resta su questo dispositivo.',
    cameraDenied: 'Permesso fotocamera negato. Abilitalo nelle impostazioni del browser e riprova.',
    cameraNotFound: 'Nessuna fotocamera trovata su questo dispositivo.',
    cameraBusy: 'La fotocamera è occupata da un’altra app.',
    cameraInsecure: 'La fotocamera richiede HTTPS.',
    cameraUnsupported: 'Questo browser non supporta l’accesso alla fotocamera.',
    cameraError: 'Impossibile avviare la fotocamera.',
    capture: 'Scatta',
    retake: 'Riprendi',
    newImage: 'Nuova immagine',
    capturing: 'Scatto…',
    uploadTitle: 'Trascina un’immagine qui',
    uploadHint: 'PNG, JPEG o WebP · max 25 MB',
    chooseImage: 'Scegli immagine',
    pasteImage: 'Incolla immagine',
    dropActive: 'Rilascia per leggere l’immagine',
    imageReady: 'Immagine pronta',
    imageType: 'Scegli un file immagine (PNG, JPEG o WebP).',
    imageSize: 'Questa immagine supera i 25 MB.',
    imageEmpty: 'Il file selezionato è vuoto.',
    previewAlt: 'Immagine da riconoscere',
    languageLabel: 'Lingue OCR',
    langEnglish: 'Inglese',
    langItalian: 'Italiano',
    langBoth: 'Inglese + Italiano',
    languageHint: 'Scegli una o entrambe. Più lingue richiedono più tempo al primo avvio.',
    preprocessTitle: 'Preparazione immagine',
    grayscale: 'Scala di grigi',
    contrast: 'Contrasto alto',
    rotateLeft: 'Ruota a sinistra',
    rotateRight: 'Ruota a destra',
    resetImage: 'Reimposta immagine',
    extract: 'Estrai testo',
    extracting: 'Lettura…',
    cancel: 'Annulla',
    retry: 'Riprova',
    progressCore: 'Caricamento motore OCR…',
    progressInit: 'Avvio motore OCR…',
    progressLang: 'Caricamento lingua…',
    progressApi: 'Preparazione riconoscitore…',
    progressRecognize: 'Riconoscimento testo…',
    ocrError: 'Impossibile leggere questa immagine. Prova una foto più nitida o con più luce.',
    noText: 'Nessun testo leggibile. Prova un’immagine più chiara.',
    engineNotice: 'Motore OCR e lingue sono serviti localmente. Il primo avvio scarica circa 10 MB, poi funziona offline.',
    engineReady: 'OCR pronto',
    engineLoading: 'Caricamento OCR…',
    engineError: 'Errore OCR',
    resultTitle: 'Testo',
    resultEmptyTitle: 'Ancora nessun testo',
    resultEmptyText: 'Scatta una pagina o carica un’immagine. Il testo riconosciuto apparirà qui, modificabile.',
    resultPlaceholder: 'Testo riconosciuto…',
    copy: 'Copia',
    copied: 'Testo copiato',
    copyFailed: 'Copia non riuscita',
    download: 'Scarica .txt',
    downloaded: 'Download avviato',
    share: 'Condividi',
    shareUnavailable: 'Condivisione non disponibile',
    readAloud: 'Leggi ad alta voce',
    stopReading: 'Interrompi lettura',
    speechUnsupported: 'La sintesi vocale non è disponibile in questo browser.',
    clean: 'Pulisci testo',
    cleaned: 'Testo pulito',
    clear: 'Svuota',
    cleared: 'Svuotato',
    statsWords: 'Parole',
    statsChars: 'Caratteri',
    statsLines: 'Righe',
    statsConfidence: 'Affidabilità',
    statsReading: 'Lettura',
    statsTime: 'Tempo',
    minutes: '{n} min',
    seconds: '{n} s',
    languageStat: 'Lingua',
    historyTitle: 'Scansioni recenti',
    historyEmpty: 'Ancora nessuna scansione',
    historyHint: 'Gli ultimi 20 risultati restano su questo dispositivo.',
    clearHistory: 'Svuota cronologia',
    confirmClearTitle: 'Svuotare tutte le scansioni recenti?',
    confirmClearText: 'La cronologia testi su questo dispositivo verrà rimossa. L’operazione non può essere annullata.',
    confirmClear: 'Svuota tutto',
    cancelDialog: 'Annulla',
    historyRestored: 'Testo ripristinato',
    delete: 'Elimina',
    deleted: 'Eliminato',
    privacyTitle: 'Privacy',
    privacyText: 'Tesseract.js gira in un Web Worker nel browser. Le immagini sono elaborate in locale, mai caricate. Impostazioni e ultimi 20 risultati restano nella memoria locale del dispositivo.',
    footer: 'Un’app Project Kit 2026 · OCR sul dispositivo',
    footerProjects: 'Tutti i progetti',
    errorGeneric: 'Qualcosa è andato storto. Riprova.',
    fileTooLarge: 'Il file è troppo grande.',
    confidenceHigh: 'Affidabilità alta',
    confidenceMedium: 'Affidabilità media',
    confidenceLow: 'Affidabilità bassa'
  }
};

const LANGUAGE_KEYS = {
  eng: 'langEnglish',
  ita: 'langItalian',
  'eng+ita': 'langBoth'
};

let current = 'en';

function normalize(value) {
  return String(value || '').toLowerCase().slice(0, 2) === 'it' ? 'it' : 'en';
}

export function initLang(value) {
  current = normalize(value);
  return current;
}

export function getLang() {
  return current;
}

export function setLang(value) {
  current = normalize(value);
  return current;
}

export function t(key, vars) {
  const dict = DICT[current] || DICT.en;
  let text = dict[key] ?? DICT.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function languageName(code) {
  return t(LANGUAGE_KEYS[code] || LANGUAGE_KEYS['eng+ita']);
}

export function dictKeys(lang = current) {
  return Object.keys(DICT[normalize(lang)] || DICT.en);
}

export function applyStatic(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
}

export function formatDateTime(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(current === 'it' ? 'it-IT' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}
