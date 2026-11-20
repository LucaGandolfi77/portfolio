export const STR = {
  en: {
    title: 'WATERMELON MERGE', subtitle: 'Tap a column to drop. Match fruits to evolve them.',
    play: 'PLAY', retry: 'RETRY', menu: 'MENU', score: 'SCORE', combo: 'COMBO',
    best: 'BEST', lang: 'IT / EN', win: 'LEVEL CLEAR', lose: 'OUT OF MOVES',
    easy: 'ROOKIE', normal: 'ACE', hard: 'LEGEND',
    modes: { classic: 'CLASSIC', limited: 'LIMITED', daily: 'DAILY' },
    moves: 'MOVES', level: 'LEVEL', target: 'TARGET'
  },
  it: {
    title: 'FUSIONE ANGURIA', subtitle: 'Tocca una colonna per cadere. Unisci i frutti per evolwerli.',
    play: 'GIOCA', retry: 'RIPROVA', menu: 'MENU', score: 'PUNTEGGIO', combo: 'COMBO',
    best: 'RECORD', lang: 'IT / EN', win: 'LIVELLO COMPLETATO', lose: 'MOSSE FINITE',
    easy: 'ESORDIENTE', normal: 'ASSO', hard: 'LEGGENDA',
    modes: { classic: 'CLASSICA', limited: 'LIMITATA', daily: 'GIORNALIERA' },
    moves: 'MOSSE', level: 'LIVELLO', target: 'OBIETTIVO'
  }
};

export const MODES = [
  { id: 'classic', label: 'modes.classic' },
  { id: 'limited', label: 'modes.limited' },
  { id: 'daily', label: 'modes.daily' }
];

export const FRUITS = ['🍒', '🍊', '🍋', '🍏', '🍑', '🍍', '🍉'];
export const COLORS = ['#ff6b9d', '#ff9f68', '#ffd166', '#5ef0a8', '#4de8ff', '#a98bff', '#7bd95b'];
export const COLS = 5, ROWS = 6;
export const LEVELS = [
  { target: 120, moves: 22 },
  { target: 260, moves: 20 },
  { target: 480, moves: 18 },
  { target: 800, moves: 16 },
  { target: 1300, moves: 14 }
];
