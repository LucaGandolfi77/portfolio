"use strict";

var I18n = (function () {

  var current = localStorage.getItem("vite-lang") || detectLang();

  function detectLang() {
    var lang = (navigator.language || "").toLowerCase();
    return lang.startsWith("it") ? "it" : "en";
  }

  function get() { return current; }

  function set(lang) {
    current = lang;
    localStorage.setItem("vite-lang", lang);
    document.documentElement.setAttribute("lang", lang);
  }

  function t(key) {
    return (STRINGS[current] && STRINGS[current][key]) || STRINGS.en[key] || key;
  }

  function chapterLang() {
    return current === "it" ? DATA : DATA_EN;
  }

  var STRINGS = {
    it: {
      // Title screen
      titleSub: "Le molte vite di Emmanuel Carrère",
      titleDesc: "Un viaggio attraverso le sue opere,<br>le sue citazioni e una storia strappalacrime.",
      titleStart: "Apri il libro",

      // Map
      mapTitle: "Le opere",
      mapChapters: "capitoli",
      mapFinale: "📖 Apri il finale",
      mapQuaderno: "📓 Il Quaderno",

      // Chapter
      chBack: "← Mappa",
      chContinue: "Continua →",
      chSkip: "Salta →",
      chListenQuote: "Ascolta la citazione →",

      // Quote
      quoteContinue: "Prosegui al gioco →",
      quoteCollected: "📓 Citazione raccolta!",
      quoteBackMap: "Torna alla mappa →",

      // Quaderno
      quadernoTitle: "📓 Il Quaderno",
      quadernoLocked: "🔒 Citazione non ancora raccolta",
      quadernoMoral: "La letteratura non è dottrina. È narrazione.",
      quadernoMoralQuote: "La fede è un mistero della persona, la religione è una narrazione collettiva.",

      // Finale
      finaleShare: "📤 Condividi",
      finaleRestart: "📖 Ricomincia",
      shareTitle: "VITE — Emmanuel Carrère",
      shareText: "Ho attraversato le vite di Emmanuel Carrère. Ogni vita merita di essere raccontata. 📖",
      copied: "📋 Copiato negli appunti!",

      // Theme
      themeLabel: "Cambia tema",
      themeDark: "☽",
      themeLight: "☀",

      // Install
      installTitle: "Installa VITE",
      installDesc: "Gioca offline, sempre con te.",
      installBtn: "Installa",

      // Splash
      splashLoading: "Caricamento",

      // Language
      langLabel: "EN",

      // Listening game words
      listeningWords: ["Paure", "Fuga", "Crollo", "Sopravvivenza", "Fiducia", "Ascolto", "Racconto", "Memoria"],
      listeningQuestion: "Qual è la parola che ricordi di più?",
      listeningOptions: ["Paure", "Fiducia", "Racconto", "Memoria"],

      // Minigame instructions
      inst_puzzle: "Riordina le tessere toccandone una adiacente a quella vuota per spostarla. Completa la foto di famiglia quando i numeri sono in ordine.",
      inst_spotDiff: "Osserva ogni scena con attenzione: un oggetto è cambiato o è sparito. Toccarlo lo segna come trovato.",
      inst_swipe: "Leggi ogni affermazione e decidi se è vera (Realtà →) o inventata (← Finzione).",
      inst_tower: "La verità è sepolta sotto una pila di bugie. Toccale dall'alto verso il basso, nell'ordine in cui sono state costruite.",
      inst_fragments: "I frammenti del testo devono essere riordinati. Toccalli partendo da quello con cui inizia la frase.",
      inst_gentle: "Un gioco senza punteggio: parole di luce cadono lentamente, sfiorale per trattenerle un istante.",
      inst_breathing: "Segui il cerchio e armonizza il respiro: inspira, trattieni, espira. Cinque cicli.",
      inst_listing: "Le parole appaiono brevemente e svaniscono. Alla fine, scegli la parola che ti ha toccato di più.",

      // Puzzle minigame
      puzzleMoves: "Mosse:",

      // Spot diff
      diffRound: "Ronda",
      diffFound: "Trovati:",

      // Swipe
      swipeLeft: "← Finzione",
      swipeRight: "Realtà →",

      // Tower
      towerTitle: "La verità sotto le bugie",
      towerHint: "Rimuovi le bugie dall'alto in basso, nell'ordine in cui sono state costruite.",
      towerTruth: "Non era nient'altro.",
      towerRemoved: "— rimosso",

      // Fragments
      fragTitle: "Ricostruisci il testo",
      fragHint: "Tocca i frammenti nell'ordine giusto.",

      // Gentle
      gentleTitle: "Le piccole cose",
      gentleDesc: "Luci cadono lentamente. Sfiorale per trattenerle un istante. Non c'è niente da vincere. Solo da ricordare.",

      // Breathing
      breathPrep: "Preparati...",
      breathInhale: "Inspira...",
      breathHold: "Trattieni...",
      breathExhale: "Espira...",
      breathCycle: "Ciclo",
      breathDone: "Hai completato tutti i cicli.",

      // Listening
      listenTitle: "L'ascolto",
      listenDesc: "Le parole appaiono e svaniscono. Leggi con attenzione. Alla fine, rispondi: cosa hai ascoltato?",

      // Share
      shareBookTitle: "VITE — Emmanuel Carrère"
    },

    en: {
      // Title screen
      titleSub: "The Many Lives of Emmanuel Carrère",
      titleDesc: "A journey through his works,<br>his quotes, and a heartbreaking story.",
      titleStart: "Open the book",

      // Map
      mapTitle: "The Works",
      mapChapters: "chapters",
      mapFinale: "📖 Open the finale",
      mapQuaderno: "📓 The Notebook",

      // Chapter
      chBack: "← Map",
      chContinue: "Continue →",
      chSkip: "Skip →",
      chListenQuote: "Listen to the quote →",

      // Quote
      quoteContinue: "Proceed to the game →",
      quoteCollected: "📓 Quote collected!",
      quoteBackMap: "Back to map →",

      // Quaderno
      quadernoTitle: "📓 The Notebook",
      quadernoLocked: "🔒 Quote not yet collected",
      quadernoMoral: "Literature is not doctrine. It is narrative.",
      quadernoMoralQuote: "Faith is a mystery of the person, religion is a collective narrative.",

      // Finale
      finaleShare: "📤 Share",
      finaleRestart: "📖 Start Over",
      shareTitle: "VITE — Emmanuel Carrère",
      shareText: "I walked through the lives of Emmanuel Carrère. Every life deserves to be told. 📖",
      copied: "📋 Copied to clipboard!",

      // Theme
      themeLabel: "Toggle theme",
      themeDark: "☽",
      themeLight: "☀",

      // Install
      installTitle: "Install VITE",
      installDesc: "Play offline, always with you.",
      installBtn: "Install",

      // Splash
      splashLoading: "Loading",

      // Language
      langLabel: "IT",

      // Listening game words
      listeningWords: ["Fears", "Escape", "Collapse", "Survival", "Trust", "Listening", "Story", "Memory"],
      listeningQuestion: "Which word do you remember the most?",
      listeningOptions: ["Fears", "Trust", "Story", "Memory"],

      // Minigame instructions
      inst_puzzle: "Rearrange the tiles by tapping one adjacent to the empty space. Complete the family photo when the numbers are in order.",
      inst_spotDiff: "Observe each scene carefully: an object has changed or disappeared. Tap it to mark it as found.",
      inst_swipe: "Read each statement and decide if it's true (Reality →) or invented (← Fiction).",
      inst_tower: "Truth is buried under a pile of lies. Tap them from top to bottom, in the order they were built.",
      inst_fragments: "The text fragments must be reordered. Tap them starting from the one that begins the sentence.",
      inst_gentle: "A scoreless game: words of light fall gently, touch them to hold them for a moment.",
      inst_breathing: "Follow the circle and harmonize your breath: inhale, hold, exhale. Five cycles.",
      inst_listing: "Words appear briefly and fade. At the end, choose the word that touched you the most.",

      // Puzzle minigame
      puzzleMoves: "Moves:",

      // Spot diff
      diffRound: "Round",
      diffFound: "Found:",

      // Swipe
      swipeLeft: "← Fiction",
      swipeRight: "Reality →",

      // Tower
      towerTitle: "The truth beneath the lies",
      towerHint: "Remove the lies from top to bottom, in the order they were built.",
      towerTruth: "He was nothing else.",
      towerRemoved: "— removed",

      // Fragments
      fragTitle: "Reconstruct the text",
      fragHint: "Tap the fragments in the right order.",

      // Gentle
      gentleTitle: "The Small Things",
      gentleDesc: "Lights fall slowly. Touch them to hold them for a moment. There's nothing to win. Only to remember.",

      // Breathing
      breathPrep: "Get ready...",
      breathInhale: "Inhale...",
      breathHold: "Hold...",
      breathExhale: "Exhale...",
      breathCycle: "Cycle",
      breathDone: "You completed all cycles.",

      // Listening
      listenTitle: "The Listening",
      listenDesc: "Words appear and fade. Read carefully. At the end, answer: what did you hear?",

      // Share
      shareBookTitle: "VITE — Emmanuel Carrère"
    }
  };

  return { get: get, set: set, t: t, chapterLang: chapterLang };

})();
