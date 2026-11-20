/* Dizionario bilingue autonomo del gioco (non dipende dai file i18n globali). */

const DICT = {
  it: {
    'app.title': 'Wikipedia Game',
    'app.subtitle': 'Quanto conosci davvero il mondo?',
    'nav.games': '🎮 Giochi',
    'nav.home': '← Home',

    'menu.title': 'WIKIPEDIA GAME',
    'menu.tagline': 'Dagli articoli più famosi ai più oscuri.',
    'menu.subtitle': 'La difficoltà cresce con la famosità: parti dalle icone globali e finisci nei meandri dell’enciclopedia.',
    'menu.mode': 'SCEGLI LA MODALITÀ',
    'menu.mode.quiz': 'Quiz',
    'menu.mode.quiz.desc': 'Leggi l’estratto e scegli il titolo corretto tra 4 opzioni della stessa fascia.',
    'menu.mode.classic': 'Classico',
    'menu.mode.classic.desc': 'Il vecchio “So / Non so”, ma ora con famosità, timer, vite e punteggio pesato.',
    'menu.preset': 'LIVELLO DI DIFFICOLTÀ',
    'preset.explorer.name': 'Esploratore',
    'preset.explorer.desc': '15 round · da Iconica a Nota · tempo extra',
    'preset.normal.name': 'Medio',
    'preset.normal.desc': '12 round · da Iconica a Oscura',
    'preset.expert.name': 'Esperto',
    'preset.expert.desc': '10 round · da Famosissima a Profonda',
    'preset.masochist.name': 'Mazochista',
    'preset.masochist.desc': '10 round · da Nicchia a Profonda · timer ridotto',
    'menu.start': 'INIZIA LA PARTITA',
    'menu.best': 'Miglior punteggio: {score}',
    'menu.noBest': 'Nessun record: gioca la tua prima partita!',
    'menu.lang': 'Lingua',
    'menu.loading': 'Caricamento articoli…',

    'hud.score': 'Punteggio',
    'hud.streak': 'Serie',
    'hud.lives': 'Vite',
    'hud.round': 'Round',
    'hud.time': 'Tempo',
    'hud.of': '/',
    'hud.fame': 'Indice di fama',

    'tier.iconic': 'Iconica',
    'tier.famous': 'Famosissima',
    'tier.known': 'Nota',
    'tier.niche': 'Nicchia',
    'tier.obscure': 'Oscura',
    'tier.deep': 'Profonda',

    'quiz.prompt': 'Di quale articolo parla questo estratto?',
    'classic.prompt': 'Conosci questo articolo?',
    'classic.know': '✅ So che cos’è',
    'classic.dontknow': '❌ Non lo so',
    'feedback.correct': 'Corretto!',
    'feedback.wrong': 'Sbagliato!',
    'feedback.timeout': 'Tempo scaduto!',
    'feedback.skipped': 'Onestà intellettuale',
    'feedback.next': 'Prossimo articolo…',

    'hint.title': 'INDIZI',
    'hint.first': 'Prima lettera',
    'hint.eliminate': 'Elimina una',
    'hint.cost': '−{n} punti',
    'hint.first.reveal': 'Inizia con: {letter}',
    'hint.eliminate.done': 'Opzione rimossa',
    'hint.disabled': 'Nessun indizio disponibile',

    'results.title': 'RISULTATI',
    'results.score': 'Punteggio finale',
    'results.best': 'Record',
    'results.newBest': 'NUOVO RECORD!',
    'results.rank': 'Il tuo livello',
    'results.rank.1': 'Enciclopedia vivente',
    'results.rank.2': 'Cultore illuminato',
    'results.rank.3': 'Esploratore curioso',
    'results.rank.4': 'Apprendista',
    'results.rank.5': 'Nuovo studente',
    'results.byTier': 'dettaglio per fascia',
    'results.correct': 'corrette',
    'results.wrong': 'sbagliate',
    'results.skipped': 'saltate',
    'results.playAgain': 'RIGIOCA',
    'results.menu': 'MENU',
    'results.open': 'Apri su Wikipedia ↗',

    'status.loading': 'Caricamento articoli…',
    'status.offlineNotice': 'API non raggiungibile: sto usando un pool locale di articoli.',
    'status.error': 'Si è verificato un problema. Riprova.',
    'common.seconds': '{s}s'
  },

  en: {
    'app.title': 'Wikipedia Game',
    'app.subtitle': 'How much do you really know about the world?',
    'nav.games': '🎮 Games',
    'nav.home': '← Home',

    'menu.title': 'WIKIPEDIA GAME',
    'menu.tagline': 'From the most famous articles to the obscure ones.',
    'menu.subtitle': 'Difficulty grows with fame: start from global icons and end up deep in the encyclopedia.',
    'menu.mode': 'CHOOSE A MODE',
    'menu.mode.quiz': 'Quiz',
    'menu.mode.quiz.desc': 'Read the extract and pick the right title among 4 options from the same tier.',
    'menu.mode.classic': 'Classic',
    'menu.mode.classic.desc': 'The old “Know / Don’t know”, now with fame, timer, lives and weighted score.',
    'menu.preset': 'DIFFICULTY LEVEL',
    'preset.explorer.name': 'Explorer',
    'preset.explorer.desc': '15 rounds · Iconic → Known · extra time',
    'preset.normal.name': 'Normal',
    'preset.normal.desc': '12 rounds · Iconic → Obscure',
    'preset.expert.name': 'Expert',
    'preset.expert.desc': '10 rounds · Famous → Deep',
    'preset.masochist.name': 'Masochist',
    'preset.masochist.desc': '10 rounds · Niche → Deep · shorter timer',
    'menu.start': 'START GAME',
    'menu.best': 'Best score: {score}',
    'menu.noBest': 'No record yet: play your first match!',
    'menu.lang': 'Language',
    'menu.loading': 'Loading articles…',

    'hud.score': 'Score',
    'hud.streak': 'Streak',
    'hud.lives': 'Lives',
    'hud.round': 'Round',
    'hud.time': 'Time',
    'hud.of': '/',
    'hud.fame': 'Fame index',

    'tier.iconic': 'Iconic',
    'tier.famous': 'Famous',
    'tier.known': 'Known',
    'tier.niche': 'Niche',
    'tier.obscure': 'Obscure',
    'tier.deep': 'Deep cut',

    'quiz.prompt': 'Which article is this extract about?',
    'classic.prompt': 'Do you know this article?',
    'classic.know': '✅ I know it',
    'classic.dontknow': '❌ I don’t know',
    'feedback.correct': 'Correct!',
    'feedback.wrong': 'Wrong!',
    'feedback.timeout': 'Time is up!',
    'feedback.skipped': 'Intellectual honesty',
    'feedback.next': 'Next article…',

    'hint.title': 'HINTS',
    'hint.first': 'First letter',
    'hint.eliminate': 'Remove one',
    'hint.cost': '−{n} pts',
    'hint.first.reveal': 'Starts with: {letter}',
    'hint.eliminate.done': 'Option removed',
    'hint.disabled': 'No hints left',

    'results.title': 'RESULTS',
    'results.score': 'Final score',
    'results.best': 'Best',
    'results.newBest': 'NEW RECORD!',
    'results.rank': 'Your level',
    'results.rank.1': 'Living encyclopedia',
    'results.rank.2': 'Enlightened scholar',
    'results.rank.3': 'Curious explorer',
    'results.rank.4': 'Apprentice',
    'results.rank.5': 'Freshman',
    'results.byTier': 'breakdown by tier',
    'results.correct': 'correct',
    'results.wrong': 'wrong',
    'results.skipped': 'skipped',
    'results.playAgain': 'PLAY AGAIN',
    'results.menu': 'MENU',
    'results.open': 'Open on Wikipedia ↗',

    'status.loading': 'Loading articles…',
    'status.offlineNotice': 'API unreachable: using a local pool of articles.',
    'status.error': 'Something went wrong. Please retry.',
    'common.seconds': '{s}s'
  }
};

const listeners = new Set();

function storedLang() {
  try {
    const v = localStorage.getItem('site_lang') || localStorage.getItem('lang');
    if (v === 'it' || v === 'en') return v;
  } catch (e) { /* ignore */ }
  try { return (navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en'; }
  catch (e) { return 'en'; }
}

let current = storedLang();

export function getLang() { return current; }

export function setLang(lang) {
  if (lang !== 'it' && lang !== 'en') return;
  current = lang;
  try {
    localStorage.setItem('site_lang', lang);
    localStorage.setItem('lang', lang);
  } catch (e) { /* ignore */ }
  listeners.forEach(fn => { try { fn(lang); } catch (e) { /* ignore */ } });
}

export function onLangChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function t(key, vars) {
  let value = (DICT[current] && DICT[current][key]) || DICT.en[key] || key;
  if (vars) Object.keys(vars).forEach(k => {
    value = value.replace(new RegExp('\\{' + k + '\\}', 'g'), String(vars[k]));
  });
  return value;
}
