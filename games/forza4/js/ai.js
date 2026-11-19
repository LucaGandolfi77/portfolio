/* Forza 4 — alpha-beta AI with personality tiers */

import { ROWS, COLS, EMPTY, applyMove, validColumns, findWin, other } from './rules.js';

const WINDOWS = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (c + 3 < COLS) WINDOWS.push([[r, c], [r, c + 1], [r, c + 2], [r, c + 3]]);
    if (r + 3 < ROWS) WINDOWS.push([[r, c], [r + 1, c], [r + 2, c], [r + 3, c]]);
    if (r + 3 < ROWS && c + 3 < COLS) WINDOWS.push([[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]]);
    if (r + 3 < ROWS && c - 3 >= 0) WINDOWS.push([[r, c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]]);
  }
}

const ORDER = [3, 2, 4, 1, 5, 0, 6];

function orderedColumns(board) {
  return ORDER.filter(c => board[0][c] === EMPTY);
}

function scoreBoard(board, ai, opp) {
  let score = 0;
  for (const win of WINDOWS) {
    let mine = 0;
    let theirs = 0;
    for (const [r, c] of win) {
      const value = board[r][c];
      if (value === ai) mine++;
      else if (value === opp) theirs++;
    }
    if (mine === 4) return 100000;
    if (theirs === 4) return -100000;
    if (mine === 3 && theirs === 0) score += 120;
    else if (theirs === 3 && mine === 0) score -= 150;
    else if (mine === 2 && theirs === 0) score += 14;
    else if (theirs === 2 && mine === 0) score -= 18;
  }
  for (let r = 0; r < ROWS; r++) {
    if (board[r][3] === ai) score += 6;
    else if (board[r][3] === opp) score -= 6;
  }
  return score;
}

function minimax(board, depth, alpha, beta, maximizing, ai, opp) {
  const score = scoreBoard(board, ai, opp);
  if (depth === 0 || Math.abs(score) >= 100000) return score;
  const columns = orderedColumns(board);
  if (!columns.length) return 0;

  if (maximizing) {
    let best = -Infinity;
    for (const col of columns) {
      const move = applyMove(board, col, ai);
      if (!move) continue;
      const value = minimax(move.board, depth - 1, alpha, beta, false, ai, opp);
      if (value > best) best = value;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const col of columns) {
    const move = applyMove(board, col, opp);
    if (!move) continue;
    const value = minimax(move.board, depth - 1, alpha, beta, true, ai, opp);
    if (value < best) best = value;
    if (best < beta) beta = best;
    if (beta <= alpha) break;
  }
  return best;
}

function bestColumns(board, ai, depth) {
  const opp = other(ai);
  let bestScore = -Infinity;
  let columns = [];
  for (const col of orderedColumns(board)) {
    const move = applyMove(board, col, ai);
    if (!move) continue;
    const value = minimax(move.board, depth - 1, -Infinity, Infinity, false, ai, opp);
    if (value > bestScore) { bestScore = value; columns = [col]; }
    else if (value === bestScore) columns.push(col);
  }
  return columns.length ? columns : validColumns(board);
}

export function chooseMove(board, ai, level = 'medium') {
  const columns = validColumns(board);
  if (!columns.length) return null;
  const opp = other(ai);

  // win now
  for (const col of columns) {
    const move = applyMove(board, col, ai);
    if (move && findWin(move.board, ai)) return col;
  }
  // block imminent loss
  for (const col of columns) {
    const move = applyMove(board, col, opp);
    if (move && findWin(move.board, opp)) return col;
  }

  if (level === 'easy') {
    if (Math.random() < 0.35) {
      const choices = bestColumns(board, ai, 1);
      return choices[Math.floor(Math.random() * choices.length)];
    }
    return columns[Math.floor(Math.random() * columns.length)];
  }

  const depth = level === 'hard' ? 5 : 3;
  const choices = bestColumns(board, ai, depth);
  return choices[Math.floor(Math.random() * choices.length)];
}

export function hintMove(board, ai) {
  return chooseMove(board, ai, 'hard');
}
