/* Forza 4 — pure board rules */

export const ROWS = 6;
export const COLS = 7;
export const EMPTY = 0;
export const P1 = 1;
export const P2 = 2;

export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

export function cloneBoard(board) {
  return board.map(row => row.slice());
}

export function validColumns(board) {
  const columns = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === EMPTY) columns.push(c);
  return columns;
}

export function dropRow(board, col) {
  if (col < 0 || col >= COLS || board[0][col] !== EMPTY) return -1;
  for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] === EMPTY) return r;
  return -1;
}

export function applyMove(board, col, player) {
  const row = dropRow(board, col);
  if (row < 0) return null;
  const next = cloneBoard(board);
  next[row][col] = player;
  return { board: next, row, col };
}

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1]
];

export function findWin(board, player) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const cells = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) break;
          cells.push([nr, nc]);
        }
        if (cells.length === 4) return cells;
      }
    }
  }
  return null;
}

export function isDraw(board) {
  return validColumns(board).length === 0;
}

export function other(player) { return player === P1 ? P2 : P1; }
