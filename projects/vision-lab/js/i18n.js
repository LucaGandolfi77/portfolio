/**
 * i18n.js — inglese e italiano per Vision Lab.
 */

const DICT = {
  en: {
    skip: 'Skip to content',
    kicker: 'Face tracking · Smile lab',
    title: 'Your face, in real time',
    subtitle: 'A private computer-vision mirror: live face mesh, expressions and a playful smile analysis. Everything runs on this device.',
    modeLabel: 'Vision Lab mode',
    meshMode: 'Mesh',
    smileMode: 'Smile',
    cameraStart: 'Start camera',
    cameraStarting: 'Starting…',
    cameraStop: 'Stop',
    cameraSwitch: 'Switch camera',
    mirror: 'Mirror',
    mirrorOn: 'Mirror on',
    mirrorOff: 'Mirror off',
    capture: 'Snapshot',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    cameraIdle: 'Camera off',
    cameraReady: 'Camera on',
    cameraError: 'Camera error',
    cameraDenied: 'Camera permission denied. Allow access in your browser settings and try again.',
    cameraNotFound: 'No camera found on this device.',
    cameraBusy: 'The camera is busy in another app.',
    cameraInsecure: 'Camera access requires HTTPS.',
    cameraUnsupported: 'This browser does not support camera access.',
    cameraRetry: 'Retry camera',
    cameraOffHint: 'Start the camera to see the mesh. Nothing leaves this device.',
    loadingCamera: 'Starting camera…',
    modelLoading: 'Loading face model…',
    modelReady: 'AI on-device',
    modelError: 'Could not load the face model. Check your connection and retry.',
    modelRetry: 'Retry model',
    onDevice: 'On-device',
    meshTitle: 'Face mesh',
    meshHint: '478 landmarks and 52 blendshapes track your expressions locally.',
    meshDensity: 'Mesh density',
    meshOff: 'Off',
    meshSoft: 'Soft',
    meshFull: 'Full',
    faceStatus: 'Face tracking',
    facesCount: '{n} faces',
    faceCountOne: '1 face',
    noFace: 'No face detected',
    faceHint: 'Look at the camera, with your face inside the frame.',
    tracking: 'Tracking',
    fps: 'FPS',
    blink: 'Blink',
    blinkCount: 'Blinks',
    smile: 'Smile',
    brow: 'Brow',
    headPose: 'Head pose',
    yaw: 'Yaw',
    pitch: 'Pitch',
    roll: 'Roll',
    emotion: 'Emotion',
    emotionNeutral: 'Neutral',
    emotionHappy: 'Happy',
    emotionSurprised: 'Surprised',
    emotionAngry: 'Angry',
    emotionSad: 'Sad',
    emotionWink: 'Wink',
    smileTitle: 'Smile lab',
    smileIntro: 'Smile at the camera. Open your mouth to measure teeth whiteness and alignment.',
    scoreSmile: 'Smile',
    scoreWhiteness: 'Whiteness',
    scoreAlignment: 'Alignment',
    overall: 'Overall',
    stars: 'Stars',
    best: 'Personal best',
    noBest: 'No record yet — smile to set one.',
    bestAt: 'Set {date}',
    newRecord: 'New personal best!',
    resetBest: 'Reset',
    bestReset: 'Best score reset',
    openMouth: 'Open your mouth to measure teeth.',
    smileEmpty: 'Look at the camera and smile.',
    smileProcessing: 'Reading your smile…',
    teethHint: 'Whiteness and alignment require an open mouth and good light.',
    smileDisclaimer: 'A playful estimate, not a dental diagnosis.',
    snapshotSaved: 'Snapshot downloaded',
    snapshotError: 'Could not create the snapshot.',
    privacyTitle: 'Privacy',
    privacyText: 'The camera feed and the MediaPipe model run entirely in your browser. No frames are uploaded, no account is created and nothing is sent to a server. Settings and your best score stay in local storage.',
    footer: 'A Project Kit 2026 app · camera stays on-device',
    footerProjects: 'All projects',
    errorGeneric: 'Something went wrong. Try again.',
    modelSizeNotice: 'The face model is about 4 MB and is cached after the first run.'
  },
  it: {
    skip: 'Vai al contenuto',
    kicker: 'Face tracking · Smile lab',
    title: 'Il tuo viso, in tempo reale',
    subtitle: 'Uno specchio di computer vision privato: mesh facciale, espressioni e un’analisi divertente del sorriso. Tutto gira su questo dispositivo.',
    modeLabel: 'Modalità di Vision Lab',
    meshMode: 'Mesh',
    smileMode: 'Sorriso',
    cameraStart: 'Attiva fotocamera',
    cameraStarting: 'Avvio…',
    cameraStop: 'Ferma',
    cameraSwitch: 'Cambia fotocamera',
    mirror: 'Specchio',
    mirrorOn: 'Specchio attivo',
    mirrorOff: 'Specchio spento',
    capture: 'Istantanea',
    fullscreen: 'Schermo intero',
    exitFullscreen: 'Esci da schermo intero',
    cameraIdle: 'Fotocamera spenta',
    cameraReady: 'Fotocamera attiva',
    cameraError: 'Errore fotocamera',
    cameraDenied: 'Permesso fotocamera negato. Abilitalo nelle impostazioni del browser e riprova.',
    cameraNotFound: 'Nessuna fotocamera trovata su questo dispositivo.',
    cameraBusy: 'La fotocamera è occupata da un’altra app.',
    cameraInsecure: 'La fotocamera richiede HTTPS.',
    cameraUnsupported: 'Questo browser non supporta l’accesso alla fotocamera.',
    cameraRetry: 'Riprova fotocamera',
    cameraOffHint: 'Attiva la fotocamera per vedere la mesh. Nulla lascia questo dispositivo.',
    loadingCamera: 'Avvio fotocamera…',
    modelLoading: 'Caricamento modello facciale…',
    modelReady: 'AI sul dispositivo',
    modelError: 'Impossibile caricare il modello facciale. Controlla la connessione e riprova.',
    modelRetry: 'Riprova modello',
    onDevice: 'Sul dispositivo',
    meshTitle: 'Mesh facciale',
    meshHint: '478 landmark e 52 blendshape tracciano le tue espressioni in locale.',
    meshDensity: 'Densità mesh',
    meshOff: 'Spenta',
    meshSoft: 'Morbida',
    meshFull: 'Completa',
    faceStatus: 'Face tracking',
    facesCount: '{n} volti',
    faceCountOne: '1 volto',
    noFace: 'Nessun volto rilevato',
    faceHint: 'Guarda la fotocamera, con il viso dentro l’inquadratura.',
    tracking: 'Tracciamento',
    fps: 'FPS',
    blink: 'Battito',
    blinkCount: 'Battiti',
    smile: 'Sorriso',
    brow: 'Sopracciglia',
    headPose: 'Inclinazione testa',
    yaw: 'Yaw',
    pitch: 'Pitch',
    roll: 'Roll',
    emotion: 'Emozione',
    emotionNeutral: 'Neutro',
    emotionHappy: 'Felice',
    emotionSurprised: 'Sorpreso',
    emotionAngry: 'Arrabbiato',
    emotionSad: 'Triste',
    emotionWink: 'Occhiolino',
    smileTitle: 'Smile lab',
    smileIntro: 'Sorridi alla fotocamera. Apri la bocca per misurare bianchezza e allineamento dei denti.',
    scoreSmile: 'Sorriso',
    scoreWhiteness: 'Bianchezza',
    scoreAlignment: 'Allineamento',
    overall: 'Totale',
    stars: 'Stelle',
    best: 'Record personale',
    noBest: 'Nessun record — sorridi per stabilirne uno.',
    bestAt: 'Impostato {date}',
    newRecord: 'Nuovo record personale!',
    resetBest: 'Azzera',
    bestReset: 'Record azzerato',
    openMouth: 'Apri la bocca per misurare i denti.',
    smileEmpty: 'Guarda la fotocamera e sorridi.',
    smileProcessing: 'Lettura del sorriso…',
    teethHint: 'Bianchezza e allineamento richiedono bocca aperta e buona luce.',
    smileDisclaimer: 'Una stima divertente, non una diagnosi dentistica.',
    snapshotSaved: 'Istantanea scaricata',
    snapshotError: 'Impossibile creare l’istantanea.',
    privacyTitle: 'Privacy',
    privacyText: 'Il flusso della fotocamera e il modello MediaPipe girano interamente nel browser. Nessun frame viene caricato, nessun account viene creato e nulla viene inviato a un server. Impostazioni e record restano nella memoria locale.',
    footer: 'Un’app Project Kit 2026 · la fotocamera resta sul dispositivo',
    footerProjects: 'Tutti i progetti',
    errorGeneric: 'Qualcosa è andato storto. Riprova.',
    modelSizeNotice: 'Il modello facciale pesa circa 4 MB e viene messo in cache dopo il primo avvio.'
  }
};

const EMOTION_KEYS = {
  neutral: 'emotionNeutral',
  happy: 'emotionHappy',
  surprised: 'emotionSurprised',
  angry: 'emotionAngry',
  sad: 'emotionSad',
  wink: 'emotionWink'
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

export function emotionLabel(key) {
  return t(EMOTION_KEYS[key] || 'emotionNeutral');
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
