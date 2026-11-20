/* Shogi — costanti, pezzi, temi e impostazioni */

export const BOARD = 9;
export const SENTE = 0;
export const GOTE = 1;

/* Il kanji "成" indica un pezzo promosso che non ha un glifo dedicato. */
export const PIECES = {
  K: { kanji: '王', name: 'Re', promotedKanji: '' },
  R: { kanji: '飛', name: 'Torre', promotedKanji: '龍' },
  B: { kanji: '角', name: 'Alfiere', promotedKanji: '馬' },
  G: { kanji: '金', name: 'Generale d’oro', promotedKanji: '' },
  S: { kanji: '銀', name: 'Generale d’argento', promotedKanji: '全' },
  N: { kanji: '桂', name: 'Cavallo', promotedKanji: '圭' },
  L: { kanji: '香', name: 'Lancia', promotedKanji: '杏' },
  P: { kanji: '歩', name: 'Pedone', promotedKanji: 'と' }
};

export const HAND_ORDER = ['R', 'B', 'G', 'S', 'N', 'L', 'P'];

export const PIECE_VALUES = {
  P: 90, L: 315, N: 405, S: 495, G: 540, B: 855, R: 990, K: 15000,
  Pp: 540, Lp: 540, Np: 540, Sp: 540, Bp: 1030, Rp: 1150
};

export const INITIAL_BOARD = [
  ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'],
  [' ', 'R', ' ', ' ', ' ', ' ', ' ', 'B', ' '],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  [' ', 'B', ' ', ' ', ' ', ' ', ' ', 'R', ' '],
  ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L']
];

export const LEVELS = [
  { id: 'beginner', depth: 1, labelKey: 'level.beginner', descKey: 'level.beginner.desc' },
  { id: 'club', depth: 2, labelKey: 'level.club', descKey: 'level.club.desc' },
  { id: 'master', depth: 3, labelKey: 'level.master', descKey: 'level.master.desc' },
  { id: 'expert', depth: 4, labelKey: 'level.expert', descKey: 'level.expert.desc' }
];

export const TIME_CONTROLS = [
  { id: 'none', labelKey: 'time.none', initial: 0, increment: 0 },
  { id: 'blitz', labelKey: 'time.blitz', initial: 180000, increment: 10000 },
  { id: 'rapid', labelKey: 'time.rapid', initial: 600000, increment: 30000 },
  { id: 'byoyomi', labelKey: 'time.byoyomi', initial: 300000, increment: 0 }
];

export const THEMES = [
  { id: 'wood', labelKey: 'theme.wood' },
  { id: 'neon', labelKey: 'theme.neon' },
  { id: 'ink', labelKey: 'theme.ink' }
];

export const STORAGE_KEY = 'shogi_pwa_v1';

/* Posizioni della sfida giornaliera: motivi tattici semplici e verificabili. */
export const DAILY_PUZZLES = [
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [2, 4, 'R', 0], [2, 2, 'G', 1], [6, 6, 'B', 0]],
    solution: { from: { x: 2, y: 4 }, to: { x: 2, y: 2 }, promote: false },
    hint: 'La torre può catturare l’oro sorvegliato da nessuno.'
  },
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [5, 5, 'B', 0], [7, 3, 'N', 1], [1, 7, 'P', 0]],
    solution: { from: { x: 5, y: 5 }, to: { x: 7, y: 3 }, promote: false },
    hint: 'L’alfiere attacca in diagonale.'
  },
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [3, 3, 'P', 0], [3, 1, 'G', 1], [6, 5, 'R', 0]],
    solution: { from: { x: 3, y: 3 }, to: { x: 3, y: 2 }, promote: true },
    hint: 'Il pedone entra in zona di promozione.'
  },
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [6, 6, 'N', 0], [5, 4, 'S', 1], [2, 6, 'L', 0]],
    solution: { from: { x: 6, y: 6 }, to: { x: 5, y: 4 }, promote: false },
    hint: 'Il cavallo salta in avanti a L.'
  },
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [1, 4, 'R', 0], [7, 4, 'B', 1], [1, 2, 'P', 1]],
    solution: { from: { x: 1, y: 4 }, to: { x: 1, y: 2 }, promote: false },
    hint: 'La torre scorre lungo la colonna.'
  },
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [4, 5, 'S', 0], [4, 3, 'N', 1], [2, 2, 'G', 0]],
    solution: { from: { x: 4, y: 5 }, to: { x: 4, y: 4 }, promote: false },
    hint: 'L’argento avanza di una casa.'
  },
  {
    pieces: [[4, 8, 'K', 0], [4, 0, 'K', 1], [7, 5, 'L', 0], [7, 2, 'P', 1], [2, 6, 'G', 0]],
    solution: { from: { x: 7, y: 5 }, to: { x: 7, y: 2 }, promote: false },
    hint: 'La lancia scorre in avanti.'
  }
];

export function makeInitialBoard() {
  const board = Array.from({ length: BOARD }, () => Array(BOARD).fill(null));
  for (let y = 0; y < BOARD; y++) {
    for (let x = 0; x < BOARD; x++) {
      const ch = INITIAL_BOARD[y][x];
      if (ch !== ' ') board[y][x] = { type: ch, owner: y < 3 ? GOTE : SENTE, promoted: false };
    }
  }
  return { board, hands: [[], []], turn: SENTE };
}

export const makeInitialState = makeInitialBoard;
