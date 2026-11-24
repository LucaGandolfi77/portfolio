/* Scale Puzzle — configuration and bilingual strings */

export const MODES = [
  { id: 'classic', en: 'Classic', it: 'Classica', icon: '🎯', desc: { en: 'Pattern visible · build it in order', it: 'Pattern visibile · ricostruisci in ordine' } },
  { id: 'memory', en: 'Memory', it: 'Memoria', icon: '🧠', desc: { en: 'Watch the path, then recall it', it: 'Guarda il percorso, poi ricordalo' } },
  { id: 'speed', en: 'Speed', it: 'Velocità', icon: '⚡', desc: { en: '60 seconds · clear as many as you can', it: '60 secondi · completa più pattern possibili' } },
  { id: 'zen', en: 'Zen', it: 'Zen', icon: '🧘', desc: { en: 'No timer, no pressure', it: 'Senza timer, senza pressione' } },
  { id: 'daily', en: 'Daily', it: 'Giornaliera', icon: '📅', desc: { en: "Today's seed for everyone", it: 'Seed di oggi per tutti' } }
];

export const DIFFICULTY = {
  easy: { preview: 4, penalty: 0.7, hintCost: 30 },
  normal: { preview: 3, penalty: 1, hintCost: 60 },
  hard: { preview: 2, penalty: 1.5, hintCost: 100 }
};

export const PALETTE = {
  bg: '#0a0718', surface: '#14102a', cyan: '#4de8ff', violet: '#a98bff',
  gold: '#ffd166', pink: '#ff6b9d', green: '#5ef0a8', red: '#ff5470'
};

export const MAX_LEVEL = 200;
export const BASE_GRID = 3;
export const MAX_GRID = 9;
export const LIVES = 3;

export const STR = {
  it: {
    title: 'SCALE PUZZLE', tagline: 'Ricostruisci il pattern. Allena la memoria. Scala i livelli.', skip: 'Vai al contenuto', wins: 'Vittorie',
    game: 'Gioco', levels: 'Livelli', stats: 'Statistiche', mode: 'Modalità',
    objective: 'Obiettivo', targetPattern: 'pattern', undo: 'Annulla', hint: 'Suggerimento',
    next: 'Prossimo', moves: 'Mosse', time: 'Tempo', sequence: 'Sequenza', level: 'Livello',
    lives: 'Vite', combo: 'Combo', score: 'Punteggio', stars: 'Stelle', best: 'Record',
    watch: 'Guarda il percorso…', go: 'Ora tocca le celle!', correct: 'Corretto!', wrong: 'Sbagliato',
    levelComplete: 'Livello completato', gameOver: 'Fine partita', retry: 'Riprova',
    menu: 'Menu', how: 'Come giocare', howText: 'All’inizio viene mostrato un percorso luminoso: memorizzalo e riproducilo toccando le celle nell’ordine giusto. In Modalità Classica il percorso resta visibile; in Memoria scompare.',
    perfect: 'PERFETTO', great: 'OTTIMO', good: 'BUONO', hintUsed: 'Suggerimento usato',
    totalScore: 'Punteggio totale', levelsDone: 'Livelli completati', accuracy: 'Precisione',
    played: 'Partite', unlocked: 'Sbloccati', achievements: 'Traguardi', daily: 'Sfida giornaliera',
    difficulty: 'Difficoltà', easy: 'Facile', normal: 'Normale', hard: 'Difficile',
    lang: 'IT / EN', sound: 'Audio', reset: 'Azzera progressi', close: 'Chiudi',
    continue: 'Continua', newGame: 'Nuova partita', tapToStart: 'Tocca per iniziare',
    noLives: 'Hai esaurito le vite', hintLeft: 'Suggerimenti rimasti', ok: 'OK'
  },
  en: {
    title: 'SCALE PUZZLE', tagline: 'Rebuild the pattern. Train memory. Climb the levels.', skip: 'Skip to content', wins: 'Wins',
    game: 'Game', levels: 'Levels', stats: 'Stats', mode: 'Mode',
    objective: 'Objective', targetPattern: 'pattern', undo: 'Undo', hint: 'Hint',
    next: 'Next', moves: 'Moves', time: 'Time', sequence: 'Sequence', level: 'Level',
    lives: 'Lives', combo: 'Combo', score: 'Score', stars: 'Stars', best: 'Best',
    watch: 'Watch the path…', go: 'Now tap the cells!', correct: 'Correct!', wrong: 'Wrong',
    levelComplete: 'Level complete', gameOver: 'Game over', retry: 'Retry',
    menu: 'Menu', how: 'How to play', howText: 'A glowing path appears at the start: memorize it and reproduce it by tapping cells in the right order. In Classic mode the path stays visible; in Memory mode it disappears.',
    perfect: 'PERFECT', great: 'GREAT', good: 'GOOD', hintUsed: 'Hint used',
    totalScore: 'Total score', levelsDone: 'Levels cleared', accuracy: 'Accuracy',
    played: 'Runs', unlocked: 'Unlocked', achievements: 'Achievements', daily: 'Daily challenge',
    difficulty: 'Difficulty', easy: 'Easy', normal: 'Normal', hard: 'Hard',
    lang: 'IT / EN', sound: 'Sound', reset: 'Reset progress', close: 'Close',
    continue: 'Continue', newGame: 'New game', tapToStart: 'Tap to start',
    noLives: 'Out of lives', hintLeft: 'Hints left', ok: 'OK'
  }
};
