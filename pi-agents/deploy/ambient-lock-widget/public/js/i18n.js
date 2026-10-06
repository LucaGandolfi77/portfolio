const I18N = {
  it: {
    appTitle: 'SHHH',
    subtitle: 'Leggi in silenzio',
    library: 'Biblioteca',
    browser: 'Browser',
    stats: 'Statistiche',
    dropzone: "Trascina un file qui o ",
    browse: 'sfoglia',
    formats: 'PDF &middot; ePub &middot; TXT &middot; MD &middot; HTML',
    recentBooks: 'Aperti di recente',
    readerTitle: 'Titolo',
    prevPage: '←',
    nextPage: '→',
    backLibrary: '← Biblioteca',
    // stats
    secondsToday: 'secondi oggi',
    totalSeconds: 'totali',
    streak: 'streak',
    pagesRead: 'pagine lette',
    // mic
    micLabel: 'Soglia',
    micActive: 'Attivo',
    // settings
    settings: 'Cabina di regia',
    close: '✕',
    mode: 'Modalità',
    thresholdMode: '🚫 Soglia — tutto o niente',
    fadeMode: '🌫️ Dissolvenza — trasparenza progressiva',
    noiseLimit: 'Limite di rumore:',
    floorLabel: 'Opaco sotto:',
    ceilingLabel: 'Invisibile sopra:',
    graceLabel: 'Grace period:',
    resetStats: 'Reset statistiche',
    // permission
    permTitle: 'SHHH ha bisogno del tuo silenzio',
    permDesc: 'Per farti rispettare la concentrazione, SHHH monitora il rumore ambientale tramite il microfono. <strong>Nessun audio viene registrato o inviato</strong> — tutto viene elaborato solo sul tuo dispositivo.',
    permActivate: 'Attiva silenzio',
    permSkip: 'Saltare (solo statistiche)',
    // install
    installText: 'Installa SHHH per l\'accesso rapido',
    installBtn: 'Installa',
    installDismiss: 'No grazie',
    // offline
    offline: 'Offline',
    // focus mode
    focusActive: 'Focus attivo',
    focusDone: 'Focus completato!',
    focusMinutes: 'minuti di silenzio',
    focusStart: 'Inizia focus',
    focusStop: 'Termina',
    // share
    shareTitle: 'Condividi il tuo silenzio',
    // reader
    page: 'Pagina',
    of: 'di',
    // misc
    error: 'Errore',
    noMic: '🎤 no',
    tooLoud: 'Troppo rumore per leggere',
  },
  en: {
    appTitle: 'SHHH',
    subtitle: 'Read in silence',
    library: 'Library',
    browser: 'Browser',
    stats: 'Stats',
    dropzone: "Drag a file here or ",
    browse: 'browse',
    formats: 'PDF &middot; ePub &middot; TXT &middot; MD &middot; HTML',
    recentBooks: 'Recently opened',
    readerTitle: 'Title',
    prevPage: '←',
    nextPage: '→',
    backLibrary: '← Library',
    secondsToday: 'seconds today',
    totalSeconds: 'total',
    streak: 'streak',
    pagesRead: 'pages read',
    micLabel: 'Threshold',
    micActive: 'Active',
    settings: 'Settings',
    close: '✕',
    mode: 'Mode',
    thresholdMode: '🚫 Threshold — all or nothing',
    fadeMode: '🌫️ Fade — progressive transparency',
    noiseLimit: 'Noise limit:',
    floorLabel: 'Opaque below:',
    ceilingLabel: 'Invisible above:',
    graceLabel: 'Grace period:',
    resetStats: 'Reset stats',
    permTitle: 'SHHH needs your silence',
    permDesc: 'To respect your focus, SHHH monitors ambient noise through the microphone. <strong>No audio is recorded or sent</strong> — everything is processed only on your device.',
    permActivate: 'Activate silence',
    permSkip: 'Skip (stats only)',
    installText: 'Install SHHH for quick access',
    installBtn: 'Install',
    installDismiss: 'No thanks',
    offline: 'Offline',
    focusActive: 'Focus active',
    focusDone: 'Focus complete!',
    focusMinutes: 'minutes of silence',
    focusStart: 'Start focus',
    focusStop: 'Stop',
    shareTitle: 'Share your silence',
    page: 'Page',
    of: 'of',
    error: 'Error',
    noMic: '🎤 no',
    tooLoud: 'Too loud to read',
  }
}

let lang = 'it'

function getLang() {
  try { return localStorage.getItem('shhh_lang') || 'it' } catch { return 'it' }
}

function setLang(l) {
  lang = l
  try { localStorage.setItem('shhh_lang', l) } catch {}
  applyLang()
}

function applyLang() {
  const dict = I18N[lang] || I18N.it
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    const val = dict[key]
    if (val !== undefined) el.textContent = val
  })
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html')
    const val = dict[key]
    if (val !== undefined) el.innerHTML = val
  })
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const key = el.getAttribute('data-i18n-attr')
    const [attr, ...rest] = key.split(':')
    const val = dict[rest.join(':')] || dict[key]
    if (val !== undefined) el.setAttribute(attr, val)
  })
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title')
    const val = dict[key]
    if (val !== undefined) el.title = val
  })
}

function t(key) {
  return (I18N[lang] || I18N.it)[key] || key
}

window.t = t
window.I18N = I18N
window.setLang = setLang
window.getLang = getLang

document.addEventListener('DOMContentLoaded', () => {
  lang = getLang()
  applyLang()
  const langBtn = document.getElementById('lang-btn')
  if (langBtn) langBtn.textContent = lang === 'it' ? '🇮🇹' : '🇬🇧'
})
