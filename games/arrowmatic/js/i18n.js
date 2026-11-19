/* Arrowmatic — bilingual interface */

const DICT = {
  it: {
    back: 'Indietro', play: 'GIOCA', upgrades: 'POTENZIAMENTI', weapons: 'ARMI INIZIALI',
    heroes: 'PERSONAGGI', accessories: 'ACCESSORI', auto: 'MODALITÀ AUTO', full: 'FULL GAME',
    runs: 'RUN FATTE', kills: 'NEMICI UCCISI', best: 'MIGLIOR LIVELLO',
    titleSub: 'l’eroe pigro che spara solo da fermo 🦥🏹',
    playSub: 'capitolo 1 · livello 1', spendCoins: 'spendi monete, diventi forte',
    chooseWeapon: 'scegli con cosa iniziare', heroPerk: 'ogni eroe, un difetto carino',
    trinkets: 'bomboniere da battaglia', autoSub: 'l’IA farma per te', autoLocked: 'sbloccala e rilassati',
    fullSub: 'sblocca tutto: armi, eroi, accessori, auto',
    daily: 'RICOMPENSA GIORNALIERA', missions: 'MISSIONI GIORNALIERE', achievements: 'OBIETTIVI',
    settings: 'IMPOSTAZIONI', sound: 'Audio', haptics: 'Vibrazioni', reduceMotion: 'Riduci animazioni',
    language: 'Lingua', exportSave: 'Esporta salvataggio', importSave: 'Importa salvataggio',
    reset: 'Azzera progressi', resetConfirm: 'Azzera TUTTI i progressi?', confirm: 'Conferma', cancel: 'Annulla',
    close: 'Chiudi', claim: 'RITIRA', claimed: 'RITIRATO', today: 'Oggi', streak: 'giorni di fila',
    onboard1Title: 'Benvenuto, pigro eroe!', onboard1Text: 'Il nostro eroe spara SOLO quando è fermo. Muoviti per schivare, fermati per colpire.',
    onboard2Title: 'Scegli come crescere', onboard2Text: 'A ogni livello scegli un potenziamento. Monete e missioni ti aiutano a diventare forte.',
    onboard3Title: 'Pronto a farmare?', onboard3Text: 'La Modalità Auto gioca al posto tuo. Tocca GIOCA per iniziare la prima run.',
    start: 'INIZIAMO!', skip: 'SALTA',
    missionKills: 'Uccidi 30 nemici', missionLevel: 'Raggiungi il livello 5',
    missionCoins: 'Raccogli 150 monete', missionBoss: 'Sconfiggi un boss', missionDraft: 'Scegli 3 potenziamenti',
    achFirstRun: 'Prima run', achKill100: '100 nemici', achLv10: 'Livello 10',
    achBoss: 'Ammazzaboss', achStreak: 'Costanza', achRich: 'Ricco sfondato',
    wave: 'ONDATA', level: 'LIVELLO', coins: 'MONETE', summaryTitle: 'FINE RUN',
    summaryFun: 'Anche oggi hai fatto del tuo meglio. Probabilmente.',
    again: 'RIGIOCA', home: 'BASE', unlocked: 'SBLOCCATO', equipped: 'EQUIPAGGIATO',
    fullOwned: 'Tutto sbloccato! ✅', autoOn: 'ATTIVA ✅', autoOff: 'SPENTA',
    needCoins: 'Ti servono 🪙', maxAccessories: 'Massimo 2 accessori equipaggiati!',
    saveImported: 'Salvataggio importato!', saveInvalid: 'File non valido',
    fullUnlocked: '🎉 FULL GAME SBLOCCATO!', autoUnlocked: '🤖 MODALITÀ AUTO SBLOCCATA!',
    rewardGot: 'Ricompensa ottenuta!', levelUp: 'LIVELLO SU! ✨', draftHint: 'scegli un potenziamento per questa run',
    reroll: 'REROLL', pause: 'PAUSA ☕', resume: 'CONTINUA', quit: 'MOLLA TUTTO',
    quitConfirm: 'Sicuro? Toca di nuovo per mollare', death: 'ARCIBALDO È CADUTO',
    legendary: 'SEI UNA LEGGENDA!'
  },
  en: {
    back: 'Back', play: 'PLAY', upgrades: 'UPGRADES', weapons: 'STARTING WEAPONS',
    heroes: 'HEROES', accessories: 'ACCESSORIES', auto: 'AUTO MODE', full: 'FULL GAME',
    runs: 'RUNS PLAYED', kills: 'ENEMIES KILLED', best: 'BEST LEVEL',
    titleSub: 'the lazy hero who only shoots while standing still 🦥🏹',
    playSub: 'chapter 1 · level 1', spendCoins: 'spend coins, get stronger',
    chooseWeapon: 'choose your starting gear', heroPerk: 'every hero, a cute flaw',
    trinkets: 'battle trinkets', autoSub: 'the AI farms for you', autoLocked: 'unlock it and relax',
    fullSub: 'unlock everything: weapons, heroes, accessories, auto',
    daily: 'DAILY REWARD', missions: 'DAILY MISSIONS', achievements: 'ACHIEVEMENTS',
    settings: 'SETTINGS', sound: 'Sound', haptics: 'Haptics', reduceMotion: 'Reduce motion',
    language: 'Language', exportSave: 'Export save', importSave: 'Import save',
    reset: 'Reset progress', resetConfirm: 'Reset ALL progress?', confirm: 'Confirm', cancel: 'Cancel',
    close: 'Close', claim: 'CLAIM', claimed: 'CLAIMED', today: 'Today', streak: 'day streak',
    onboard1Title: 'Welcome, lazy hero!', onboard1Text: 'Our hero only shoots while STILL. Move to dodge, stop to attack.',
    onboard2Title: 'Choose how to grow', onboard2Text: 'Pick an upgrade every level. Coins and missions help you get stronger.',
    onboard3Title: 'Ready to farm?', onboard3Text: 'Auto Mode plays for you. Tap PLAY to start your first run.',
    start: 'LET’S GO!', skip: 'SKIP',
    missionKills: 'Kill 30 enemies', missionLevel: 'Reach level 5',
    missionCoins: 'Collect 150 coins', missionBoss: 'Defeat a boss', missionDraft: 'Pick 3 upgrades',
    achFirstRun: 'First run', achKill100: '100 enemies', achLv10: 'Level 10',
    achBoss: 'Boss slayer', achStreak: 'Consistency', achRich: 'Filthy rich',
    wave: 'WAVE', level: 'LEVEL', coins: 'COINS', summaryTitle: 'RUN OVER',
    summaryFun: 'You did your best today. Probably.',
    again: 'PLAY AGAIN', home: 'HOME', unlocked: 'UNLOCKED', equipped: 'EQUIPPED',
    fullOwned: 'Everything unlocked! ✅', autoOn: 'ON ✅', autoOff: 'OFF',
    needCoins: 'You need 🪙', maxAccessories: 'Max 2 accessories equipped!',
    saveImported: 'Save imported!', saveInvalid: 'Invalid file',
    fullUnlocked: '🎉 FULL GAME UNLOCKED!', autoUnlocked: '🤖 AUTO MODE UNLOCKED!',
    rewardGot: 'Reward claimed!', levelUp: 'LEVEL UP! ✨', draftHint: 'choose an upgrade for this run',
    reroll: 'REROLL', pause: 'PAUSED ☕', resume: 'RESUME', quit: 'QUIT RUN',
    quitConfirm: 'Sure? Tap again to quit', death: 'ARCIBALDO HAS FALLEN',
    legendary: 'YOU ARE A LEGEND!'
  }
};

let lang = 'it';
try {
  const stored = localStorage.getItem('arrowmatic_lang');
  const site = localStorage.getItem('site_lang') || localStorage.getItem('lang');
  lang = stored === 'en' || stored === 'it' ? stored : (String(site).slice(0, 2) === 'en' ? 'en' : 'it');
} catch (e) { /* default it */ }

export function getLang() { return lang; }
export function setLang(value) {
  lang = value === 'en' ? 'en' : 'it';
  try { localStorage.setItem('arrowmatic_lang', lang); } catch (e) { /* ignore */ }
}
export function t(key) { return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key; }
export function applyI18n(root = document) {
  document.documentElement.lang = lang;
  root.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
}
