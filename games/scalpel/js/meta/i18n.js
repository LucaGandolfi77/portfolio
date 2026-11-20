/* Scalpel Meta — dizionario IT/EN autonomo */
(function(){
'use strict';

var DICT = {
  it: {
    'menu.career': '🎖️ CARRIERA E MISSIONI',
    'menu.missions': '🎯 MISSIONI',
    'menu.profile': '👤 PROFILO CHIRURGO',
    'menu.contracts': '📋 MODALITÀ CONTRACT',
    'menu.stats': '📊 STATISTICHE',
    'menu.settings': '⚙️ IMPOSTAZIONI',

    'panel.missions': 'MISSIONI',
    'panel.profile': 'PROFILO CHIRURGO',
    'panel.stats': 'STATISTICHE DI CARRIERA',
    'panel.settings': 'IMPOSTAZIONI',
    'panel.contracts': 'MODALITÀ CONTRACT',
    'panel.daily': 'Giornaliere',
    'panel.weekly': 'Settimanali',
    'panel.permanent': 'Permanenti',
    'panel.chapters': 'Contratti capitolo',
    'panel.season': 'Battle Pass',

    'action.claim': 'Riscatta',
    'action.claimed': 'Riscattato ✓',
    'action.close': 'Chiudi',
    'action.share': 'Condividi risultato',
    'action.start': 'Avvia contratto',
    'action.clear': 'Nessun modificatore',
    'action.play': 'Scegli capitolo',
    'action.equip': 'Equipaggia',
    'action.reset': 'Ripristina impostazioni',

    'profile.level': 'Livello',
    'profile.xp': 'XP',
    'profile.credits': 'Crediti',
    'profile.title': 'Titolo',
    'profile.next': 'XP al prossimo livello',
    'profile.unlocks': 'Sblocchi',
    'profile.season': 'XP stagione',

    'stats.surgeries': 'Operazioni completate',
    'stats.steps': 'Passaggi eseguiti',
    'stats.perfect': 'Operazioni perfette',
    'stats.boss': 'Boss sconfitti',
    'stats.contracts': 'Contratti completati',
    'stats.best': 'Miglior punteggio',
    'stats.accuracy': 'Accuratezza media',
    'stats.modes': 'Partite per modalità',

    'setting.sound': 'Effetti sonori',
    'setting.haptics': 'Vibrazione aptica',
    'setting.reducedMotion': 'Riduci animazioni',
    'setting.contrast': 'Contrasto elevato',
    'setting.textSize': 'Dimensione testo',
    'setting.language': 'Lingua',
    'text.normal': 'Normale',
    'text.large': 'Grande',

    'contract.desc': 'Opera con modificatori casuali: completali per XP e crediti extra.',
    'contract.time': 'Tempo ridotto (−40%)',
    'contract.tremor': 'Tremore alle mani',
    'contract.vision': 'Visione ridotta',
    'contract.double': 'Punteggio doppio',
    'contract.active': 'Modificatori attivi',
    'contract.none': 'Nessuno — partita normale',

    'share.title': 'Scalpel — Risultato chirurgico',
    'share.text': 'Ho completato un intervento in Scalpel con {score} punti e accuratezza {acc}%.',
    'share.success': 'Risultato condiviso!',
    'share.fail': 'Condivisione non disponibile su questo browser.',

    'reward.xp': '+{n} XP',
    'reward.credits': '+{n} crediti',
    'common.progress': '{a}/{b}',
    'common.level': 'Lv {n}',
    'common.done': 'Completata',
    'common.locked': 'Bloccata',

    'm.daily.surgeries.name': 'Turno di guardia',
    'm.daily.surgeries.desc': 'Completa {n} operazioni oggi',
    'm.daily.steps.name': 'Man precise',
    'm.daily.steps.desc': 'Esegui {n} passaggi chirurgici',
    'm.daily.accuracy.name': 'Precisione quotidiana',
    'm.daily.accuracy.desc': 'Ottieni {n}% di accuratezza in un’operazione',
    'm.daily.boss.name': 'Boss del giorno',
    'm.daily.boss.desc': 'Completa una Boss Rush',
    'm.daily.endless.name': 'Maratona',
    'm.daily.endless.desc': 'Gioca {n} pazienti in Endless',
    'm.weekly.surgeries.name': 'Primario della settimana',
    'm.weekly.surgeries.desc': 'Completa {n} operazioni',
    'm.weekly.perfect.name': 'Manus Dei',
    'm.weekly.perfect.desc': 'Ottieni {n} operazioni perfette',
    'm.weekly.steps.name': 'Gymnaste',
    'm.weekly.steps.desc': 'Esegui {n} passaggi',
    'm.weekly.boss.name': 'Cacciatore di boss',
    'm.weekly.boss.desc': 'Completa {n} Boss Rush',
    'm.weekly.contracts.name': 'Contract killer',
    'm.weekly.contracts.desc': 'Completa {n} contratti',
    'm.perm.surgeries.name': 'Chirurgo esperto',
    'm.perm.surgeries.desc': 'Completa 25 operazioni',
    'm.perm.perfect.name': 'Precisione assoluta',
    'm.perm.perfect.desc': 'Ottieni 10 operazioni perfette',
    'm.perm.steps.name': 'Milestone chirurgica',
    'm.perm.steps.desc': 'Esegui 200 passaggi',
    'm.perm.boss.name': 'Sconfiggi il maestro',
    'm.perm.boss.desc': 'Completa una Boss Rush',
    'm.perm.endless.name': 'Infinito',
    'm.perm.endless.desc': 'Raggiungi 10 pazienti in Endless',
    'm.perm.zombie.name': 'Sopravvissuto',
    'm.perm.zombie.desc': 'Completa uno Zombie Outbreak',
    'm.perm.alien.name': 'Primo contatto',
    'm.perm.alien.desc': 'Opera su Xylar-7',
    'm.chapter.acc.name': 'Precisione',
    'm.chapter.acc.desc': 'Accuratezza ≥ {n}%',
    'm.chapter.time.name': 'Rapidità',
    'm.chapter.time.desc': 'Completa in meno di {n}s',
    'm.chapter.perfect.name': 'Perfetto',
    'm.chapter.perfect.desc': 'Nessun errore (accuracy 100%)'
  },

  en: {
    'menu.career': '🎖️ CAREER & MISSIONS',
    'menu.missions': '🎯 MISSIONS',
    'menu.profile': '👤 SURGEON PROFILE',
    'menu.contracts': '📋 CONTRACT MODE',
    'menu.stats': '📊 CAREER STATS',
    'menu.settings': '⚙️ SETTINGS',

    'panel.missions': 'MISSIONS',
    'panel.profile': 'SURGEON PROFILE',
    'panel.stats': 'CAREER STATISTICS',
    'panel.settings': 'SETTINGS',
    'panel.contracts': 'CONTRACT MODE',
    'panel.daily': 'Daily',
    'panel.weekly': 'Weekly',
    'panel.permanent': 'Permanent',
    'panel.chapters': 'Chapter contracts',
    'panel.season': 'Battle Pass',

    'action.claim': 'Claim',
    'action.claimed': 'Claimed ✓',
    'action.close': 'Close',
    'action.share': 'Share result',
    'action.start': 'Start contract',
    'action.clear': 'No modifiers',
    'action.play': 'Choose chapter',
    'action.equip': 'Equip',
    'action.reset': 'Reset settings',

    'profile.level': 'Level',
    'profile.xp': 'XP',
    'profile.credits': 'Credits',
    'profile.title': 'Title',
    'profile.next': 'XP to next level',
    'profile.unlocks': 'Unlocks',
    'profile.season': 'Season XP',

    'stats.surgeries': 'Surgeries completed',
    'stats.steps': 'Steps performed',
    'stats.perfect': 'Perfect surgeries',
    'stats.boss': 'Bosses defeated',
    'stats.contracts': 'Contracts completed',
    'stats.best': 'Best score',
    'stats.accuracy': 'Average accuracy',
    'stats.modes': 'Plays per mode',

    'setting.sound': 'Sound effects',
    'setting.haptics': 'Haptic feedback',
    'setting.reducedMotion': 'Reduce motion',
    'setting.contrast': 'High contrast',
    'setting.textSize': 'Text size',
    'setting.language': 'Language',
    'text.normal': 'Normal',
    'text.large': 'Large',

    'contract.desc': 'Operate with random modifiers: complete them for extra XP and credits.',
    'contract.time': 'Reduced time (−40%)',
    'contract.tremor': 'Shaky hands',
    'contract.vision': 'Reduced vision',
    'contract.double': 'Double score',
    'contract.active': 'Active modifiers',
    'contract.none': 'None — normal match',

    'share.title': 'Scalpel — Surgery result',
    'share.text': 'I completed a surgery in Scalpel with {score} points and {acc}% accuracy.',
    'share.success': 'Result shared!',
    'share.fail': 'Sharing is not available in this browser.',

    'reward.xp': '+{n} XP',
    'reward.credits': '+{n} credits',
    'common.progress': '{a}/{b}',
    'common.level': 'Lv {n}',
    'common.done': 'Completed',
    'common.locked': 'Locked',

    'm.daily.surgeries.name': 'On call',
    'm.daily.surgeries.desc': 'Complete {n} surgeries today',
    'm.daily.steps.name': 'Steady hands',
    'm.daily.steps.desc': 'Perform {n} surgical steps',
    'm.daily.accuracy.name': 'Daily precision',
    'm.daily.accuracy.desc': 'Reach {n}% accuracy in a surgery',
    'm.daily.boss.name': 'Boss of the day',
    'm.daily.boss.desc': 'Complete a Boss Rush',
    'm.daily.endless.name': 'Marathon',
    'm.daily.endless.desc': 'Play {n} patients in Endless',
    'm.weekly.surgeries.name': 'Attending of the week',
    'm.weekly.surgeries.desc': 'Complete {n} surgeries',
    'm.weekly.perfect.name': 'Manus Dei',
    'm.weekly.perfect.desc': 'Get {n} perfect surgeries',
    'm.weekly.steps.name': 'Gymnaste',
    'm.weekly.steps.desc': 'Perform {n} steps',
    'm.weekly.boss.name': 'Boss hunter',
    'm.weekly.boss.desc': 'Complete {n} Boss Rushes',
    'm.weekly.contracts.name': 'Contract killer',
    'm.weekly.contracts.desc': 'Complete {n} contracts',
    'm.perm.surgeries.name': 'Expert surgeon',
    'm.perm.surgeries.desc': 'Complete 25 surgeries',
    'm.perm.perfect.name': 'Absolute precision',
    'm.perm.perfect.desc': 'Get 10 perfect surgeries',
    'm.perm.steps.name': 'Surgical milestone',
    'm.perm.steps.desc': 'Perform 200 steps',
    'm.perm.boss.name': 'Defeat the master',
    'm.perm.boss.desc': 'Complete a Boss Rush',
    'm.perm.endless.name': 'Infinite',
    'm.perm.endless.desc': 'Reach 10 patients in Endless',
    'm.perm.zombie.name': 'Survivor',
    'm.perm.zombie.desc': 'Complete a Zombie Outbreak',
    'm.perm.alien.name': 'First contact',
    'm.perm.alien.desc': 'Operate on Xylar-7',
    'm.chapter.acc.name': 'Precision',
    'm.chapter.acc.desc': 'Accuracy ≥ {n}%',
    'm.chapter.time.name': 'Speed',
    'm.chapter.time.desc': 'Finish in under {n}s',
    'm.chapter.perfect.name': 'Perfect',
    'm.chapter.perfect.desc': 'No mistakes (100% accuracy)'
  }
};

var listeners = [];
var current = 'en';
try {
  var saved = JSON.parse(localStorage.getItem('scalpel_meta_v1') || '{}');
  if(saved && saved.settings && saved.settings.language) current = saved.settings.language;
} catch(e){}
try { if(current !== 'it' && current !== 'en') current = (navigator.language||'en').indexOf('it') === 0 ? 'it' : 'en'; } catch(e){}

function t(key, vars){
  var dict = DICT[current] || DICT.en;
  var value = dict[key] || DICT.en[key] || key;
  if(vars) Object.keys(vars).forEach(function(k){
    value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
  });
  return value;
}

window.SCALPEL_META_I18N = {
  t: t,
  getLang: function(){ return current; },
  setLang: function(lang){
    if(lang !== 'it' && lang !== 'en') return;
    current = lang;
    listeners.forEach(function(fn){ try{ fn(lang); }catch(e){} });
  },
  onLangChange: function(fn){ listeners.push(fn); }
};
})();
