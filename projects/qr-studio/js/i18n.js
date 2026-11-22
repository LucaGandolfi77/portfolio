/**
 * i18n.js — inglese e italiano, senza dipendenze.
 * La lingua arriva dalla Project Shell (`project:langchange`) o da `pf.lang`.
 */

const DICT = {
  en: {
    skip: 'Skip to content',
    heroKicker: 'Offline · on-device',
    heroTitle: 'Scan. Create. Keep it local.',
    heroText:
      'A QR reader and designer that runs entirely in your browser. No uploads, no accounts, no tracking.',
    tabsLabel: 'QR Studio sections',
    tabCreate: 'Create',
    tabScan: 'Scan',
    tabHistory: 'History',
    contentTitle: 'Content',
    typeLabel: 'Content type',
    formHint: 'Fill in the fields to generate a QR code. Everything stays on this device.',
    formEmpty: 'Add some content to see the preview.',
    styleTitle: 'Style',
    reset: 'Reset',
    resetStyle: 'Reset style',
    errorCorrection: 'Error correction',
    pattern: 'Pattern',
    colors: 'Colors',
    foreground: 'Foreground',
    background: 'Background',
    transparent: 'Transparent background',
    exportSize: 'Export size',
    preview: 'Preview',
    previewEmpty: 'Your QR code will appear here.',
    previewAlt: 'QR code preview',
    saveToHistory: 'Save',
    copyImage: 'Copy image',
    share: 'Share',
    open: 'Open',
    tipsTitle: 'Good to know',
    privacyTitle: 'Privacy',
    palettesLabel: 'Palettes',
    tip1: 'Higher error correction makes the code more robust, but denser.',
    tip2: 'Keep a quiet zone around the code and test it with your phone.',
    tip3: 'Dark foreground on a light background scans best.',
    tip4: 'Scans and creations stay in local storage, on this device only.',
    privacyNote: 'Images are processed locally. Nothing is uploaded.',
    scannerTitle: 'Camera',
    scanPlaceholder: 'Camera is off',
    scanIdle: 'Idle',
    scanStarting: 'Starting…',
    scanRunning: 'Scanning',
    scanError: 'Error',
    startCamera: 'Start camera',
    stopCamera: 'Stop',
    torch: 'Torch',
    uploadImage: 'Upload image',
    scanHint:
      'Point the camera at a QR code, or upload a screenshot. Decoding happens on-device.',
    resultTitle: 'Result',
    copyResult: 'Copy',
    openResult: 'Open',
    createFromResult: 'Create QR',
    scanAgain: 'Scan again',
    cameraLabel: 'Camera',
    zoomLabel: 'Zoom',
    scanAnalyzing: 'Analysing image…',
    historyTitle: 'Recent QR codes',
    clearHistory: 'Clear',
    historyEmpty: 'Nothing here yet',
    historyEmptyHint: 'Saved codes and scans will appear in this list.',
    created: 'Created',
    scanned: 'Scanned',
    reuse: 'Reuse',
    download: 'Download',
    delete: 'Delete',
    saved: 'Saved to history',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    exported: 'Download started',
    shareUnavailable: 'Sharing is not available',
    historyCleared: 'History cleared',
    deleted: 'Deleted',
    resetDone: 'Style reset',
    errorTooLong:
      'This content is too long for the selected error correction. Try a lower level.',
    errorGeneric: 'Could not generate the QR code.',
    notOpenable: 'This content cannot be opened directly. Copy it instead.',
    scanNoCode: 'No QR code found in this image.',
    scanDecodeError: 'Could not read this image.',
    scanSuccess: 'QR code scanned',
    scanImageError: 'Please choose an image file.',
    cameraDenied: 'Camera permission denied. You can still upload an image.',
    cameraNotFound: 'No camera found on this device.',
    cameraBusy: 'The camera is busy in another app.',
    cameraInsecure: 'Camera access requires HTTPS.',
    cameraUnsupported: 'This browser does not support camera access.',
    cameraError: 'Could not start the camera.',
    typeLink: 'Link',
    typeText: 'Text',
    typeWifi: 'Wi-Fi',
    typeContact: 'Contact',
    typeEmail: 'Email',
    typeSms: 'SMS',
    typePhone: 'Phone',
    typeGeo: 'Place',
    typeEvent: 'Event',
    typeUrl: 'Link',
    typeVcard: 'Contact',
    typeTel: 'Phone',
    fieldUrl: 'URL',
    fieldText: 'Text',
    fieldSsid: 'Network name (SSID)',
    fieldSecurity: 'Security',
    fieldPassword: 'Password',
    fieldHidden: 'Hidden network',
    fieldFirstName: 'First name',
    fieldLastName: 'Last name',
    fieldOrg: 'Organisation',
    fieldPhone: 'Phone',
    fieldEmail: 'Email',
    fieldSubject: 'Subject',
    fieldBody: 'Message',
    fieldLat: 'Latitude',
    fieldLng: 'Longitude',
    fieldLabel: 'Label (optional)',
    fieldEventTitle: 'Title',
    fieldStart: 'Starts',
    fieldEnd: 'Ends (optional)',
    fieldLocation: 'Location',
    fieldDescription: 'Description',
    phUrl: 'example.com or https://…',
    phText: 'Write anything…',
    phSsid: 'Home Wi-Fi',
    phPassword: 'Network password',
    phFirstName: 'Luca',
    phLastName: 'Gandolfi',
    phOrg: 'Studio, company…',
    phPhone: '+39 333 123 4567',
    phEmail: 'name@example.com',
    phSubject: 'Hello',
    phBody: 'Write a message…',
    phLat: '45.4642',
    phLng: '9.1900',
    phLabel: 'Milan',
    phEventTitle: 'Birthday party',
    phLocation: 'Home',
    phDescription: 'Bring the cake',
    securityWpa: 'WPA/WPA2',
    securityWep: 'WEP',
    securityOpen: 'Open',
    useLocation: 'Use my position',
    locationDenied: 'Location permission denied.',
    locationUnsupported: 'Geolocation is not available.',
    locationSet: 'Position added',
    ecL: 'Low (7%)',
    ecM: 'Medium (15%)',
    ecQ: 'Quartile (25%)',
    ecH: 'High (30%)',
    patternSquare: 'Square',
    patternRound: 'Soft',
    patternDot: 'Dots',
    presetName: 'Palette {n}',
    confirmDeleteTitle: 'Delete this QR code?',
    confirmDeleteText: 'It will be removed from local history.',
    confirmClearTitle: 'Clear all history?',
    confirmClearText: 'This cannot be undone.',
    cancel: 'Cancel',
    confirmDelete: 'Delete',
    confirmClear: 'Clear all',
    footer: 'A Project Kit 2026 app · static, local-first, no tracking',
    footerProjects: 'All projects'
  },
  it: {
    skip: 'Vai al contenuto',
    heroKicker: 'Offline · sul dispositivo',
    heroTitle: 'Scansiona. Crea. Resta in locale.',
    heroText:
      'Un lettore e designer di QR che gira interamente nel browser. Nessun upload, nessun account, nessun tracciamento.',
    tabsLabel: 'Sezioni di QR Studio',
    tabCreate: 'Crea',
    tabScan: 'Scansiona',
    tabHistory: 'Cronologia',
    contentTitle: 'Contenuto',
    typeLabel: 'Tipo di contenuto',
    formHint: 'Compila i campi per generare un QR. Tutto resta su questo dispositivo.',
    formEmpty: 'Aggiungi contenuto per vedere l’anteprima.',
    styleTitle: 'Stile',
    reset: 'Reimposta',
    resetStyle: 'Reimposta stile',
    errorCorrection: 'Correzione errori',
    pattern: 'Motivo',
    colors: 'Colori',
    foreground: 'Primo piano',
    background: 'Sfondo',
    transparent: 'Sfondo trasparente',
    exportSize: 'Dimensione export',
    preview: 'Anteprima',
    previewEmpty: 'Il tuo QR apparirà qui.',
    previewAlt: 'Anteprima del codice QR',
    saveToHistory: 'Salva',
    copyImage: 'Copia immagine',
    share: 'Condividi',
    open: 'Apri',
    tipsTitle: 'Da sapere',
    privacyTitle: 'Privacy',
    palettesLabel: 'Palette',
    tip1: 'Una correzione errori più alta rende il codice più robusto, ma più denso.',
    tip2: 'Lascia un margine bianco attorno al codice e provalo con il telefono.',
    tip3: 'Primo piano scuro su sfondo chiaro si scansiona meglio.',
    tip4: 'Scansioni e creazioni restano nella memoria locale, solo su questo dispositivo.',
    privacyNote: 'Le immagini sono elaborate in locale. Nulla viene caricato.',
    scannerTitle: 'Fotocamera',
    scanPlaceholder: 'Fotocamera spenta',
    scanIdle: 'In attesa',
    scanStarting: 'Avvio…',
    scanRunning: 'Scansione',
    scanError: 'Errore',
    startCamera: 'Attiva fotocamera',
    stopCamera: 'Ferma',
    torch: 'Torcia',
    uploadImage: 'Carica immagine',
    scanHint:
      'Inquadra un QR oppure carica uno screenshot. La decodifica avviene sul dispositivo.',
    resultTitle: 'Risultato',
    copyResult: 'Copia',
    openResult: 'Apri',
    createFromResult: 'Crea QR',
    scanAgain: 'Scansiona ancora',
    cameraLabel: 'Fotocamera',
    zoomLabel: 'Zoom',
    scanAnalyzing: 'Analisi immagine…',
    historyTitle: 'QR recenti',
    clearHistory: 'Svuota',
    historyEmpty: 'Ancora niente qui',
    historyEmptyHint: 'Codici salvati e scansioni appariranno in questa lista.',
    created: 'Creato',
    scanned: 'Scansionato',
    reuse: 'Riusa',
    download: 'Scarica',
    delete: 'Elimina',
    saved: 'Salvato in cronologia',
    copied: 'Copiato',
    copyFailed: 'Copia non riuscita',
    exported: 'Download avviato',
    shareUnavailable: 'Condivisione non disponibile',
    historyCleared: 'Cronologia svuotata',
    deleted: 'Eliminato',
    resetDone: 'Stile reimpostato',
    errorTooLong:
      'Contenuto troppo lungo per il livello di correzione scelto. Prova un livello più basso.',
    errorGeneric: 'Impossibile generare il QR.',
    notOpenable: 'Questo contenuto non si può aprire direttamente. Copialo.',
    scanNoCode: 'Nessun QR trovato nell’immagine.',
    scanDecodeError: 'Impossibile leggere questa immagine.',
    scanSuccess: 'QR scansionato',
    scanImageError: 'Scegli un file immagine.',
    cameraDenied: 'Permesso fotocamera negato. Puoi comunque caricare un’immagine.',
    cameraNotFound: 'Nessuna fotocamera trovata su questo dispositivo.',
    cameraBusy: 'La fotocamera è occupata da un’altra app.',
    cameraInsecure: 'La fotocamera richiede HTTPS.',
    cameraUnsupported: 'Questo browser non supporta l’accesso alla fotocamera.',
    cameraError: 'Impossibile avviare la fotocamera.',
    typeLink: 'Link',
    typeText: 'Testo',
    typeWifi: 'Wi-Fi',
    typeContact: 'Contatto',
    typeEmail: 'Email',
    typeSms: 'SMS',
    typePhone: 'Telefono',
    typeGeo: 'Luogo',
    typeEvent: 'Evento',
    typeUrl: 'Link',
    typeVcard: 'Contatto',
    typeTel: 'Telefono',
    fieldUrl: 'URL',
    fieldText: 'Testo',
    fieldSsid: 'Nome rete (SSID)',
    fieldSecurity: 'Sicurezza',
    fieldPassword: 'Password',
    fieldHidden: 'Rete nascosta',
    fieldFirstName: 'Nome',
    fieldLastName: 'Cognome',
    fieldOrg: 'Organizzazione',
    fieldPhone: 'Telefono',
    fieldEmail: 'Email',
    fieldSubject: 'Oggetto',
    fieldBody: 'Messaggio',
    fieldLat: 'Latitudine',
    fieldLng: 'Longitudine',
    fieldLabel: 'Etichetta (opzionale)',
    fieldEventTitle: 'Titolo',
    fieldStart: 'Inizio',
    fieldEnd: 'Fine (opzionale)',
    fieldLocation: 'Luogo',
    fieldDescription: 'Descrizione',
    phUrl: 'example.com oppure https://…',
    phText: 'Scrivi qualcosa…',
    phSsid: 'Wi-Fi di casa',
    phPassword: 'Password rete',
    phFirstName: 'Luca',
    phLastName: 'Gandolfi',
    phOrg: 'Studio, azienda…',
    phPhone: '+39 333 123 4567',
    phEmail: 'nome@example.com',
    phSubject: 'Ciao',
    phBody: 'Scrivi un messaggio…',
    phLat: '45.4642',
    phLng: '9.1900',
    phLabel: 'Milano',
    phEventTitle: 'Festa di compleanno',
    phLocation: 'Casa',
    phDescription: 'Porta la torta',
    securityWpa: 'WPA/WPA2',
    securityWep: 'WEP',
    securityOpen: 'Aperta',
    useLocation: 'Usa la mia posizione',
    locationDenied: 'Permesso posizione negato.',
    locationUnsupported: 'Geolocalizzazione non disponibile.',
    locationSet: 'Posizione aggiunta',
    ecL: 'Bassa (7%)',
    ecM: 'Media (15%)',
    ecQ: 'Quartile (25%)',
    ecH: 'Alta (30%)',
    patternSquare: 'Quadrato',
    patternRound: 'Morbido',
    patternDot: 'Punti',
    presetName: 'Palette {n}',
    confirmDeleteTitle: 'Eliminare questo QR?',
    confirmDeleteText: 'Verrà rimosso dalla cronologia locale.',
    confirmClearTitle: 'Svuotare tutta la cronologia?',
    confirmClearText: 'L’operazione non può essere annullata.',
    cancel: 'Annulla',
    confirmDelete: 'Elimina',
    confirmClear: 'Svuota tutto',
    footer: 'Un’app Project Kit 2026 · statica, locale, senza tracciamento',
    footerProjects: 'Tutti i progetti'
  }
};

const TYPE_KEYS = {
  link: 'typeLink',
  text: 'typeText',
  wifi: 'typeWifi',
  contact: 'typeContact',
  email: 'typeEmail',
  sms: 'typeSms',
  phone: 'typePhone',
  geo: 'typeGeo',
  event: 'typeEvent',
  url: 'typeUrl',
  vcard: 'typeVcard',
  tel: 'typeTel'
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

export function typeName(type) {
  return t(TYPE_KEYS[type] || 'typeText');
}

/** Elenco delle chiavi disponibili, usato dai test di completezza. */
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
