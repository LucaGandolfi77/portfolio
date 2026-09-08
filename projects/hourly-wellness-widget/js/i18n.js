const I18N = {
  it: {
    appTitle: 'Hourly Wellness',
    subtitle: '60 secondi di respiro',
    home: 'Home',
    stats: 'Statistiche',
    settings: 'Impostazioni',
    dailyStreak: 'Serie giornaliera',
    totalBreaks: 'Pause totali',
    lastBreak: 'Ultima pausa',
    minutesSaved: 'Minuti risparmiati',
    weeklyView: 'Visualizzazione settimanale',
    weekHint: '● = pausa completata  ·  · = nessun dato',
    notifFrequency: 'Frequenza notifiche',
    theme: 'Tema',
    sound: 'Suoni',
    resetStats: 'Reset statistiche',
    permTitle: 'Accesso al microfono',
    permDesc: 'Il widget può programmare notifiche locali orarie. Il microfono è necessario solo per il suono di guida opzionale.',
    permAllow: 'Consenti',
    permSkip: 'Non ora',
    installText: 'Installa Hourly Wellness',
    installBtn: 'Installa',
    installDismiss: 'No grazie',
  },
  en: {
    appTitle: 'Hourly Wellness',
    subtitle: '60-second breathing break',
    home: 'Home',
    stats: 'Stats',
    settings: 'Settings',
    dailyStreak: 'Daily streak',
    totalBreaks: 'Total breaks',
    lastBreak: 'Last break',
    minutesSaved: 'Minutes saved',
    weeklyView: 'Weekly view',
    weekHint: '● = break completed  ·  · = no data',
    notifFrequency: 'Notification frequency',
    theme: 'Theme',
    sound: 'Sounds',
    resetStats: 'Reset stats',
    permTitle: 'Microphone access',
    permDesc: 'The widget can schedule hourly local notifications. The microphone is only needed for optional guided sound.',
    permAllow: 'Allow',
    permSkip: 'Not now',
    installText: 'Install Hourly Wellness',
    installBtn: 'Install',
    installDismiss: 'No thanks',
  }
};

function applyLang() {
  const lang = (localStorage.getItem('hww_lang') || 'it');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = (I18N[lang] || I18N.it)[key];
    if (val !== undefined) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = (I18N[lang] || I18N.it)[key];
    if (val !== undefined) el.innerHTML = val;
  });
}

document.addEventListener('DOMContentLoaded', applyLang);
