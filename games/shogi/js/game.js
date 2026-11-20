/* Stato di gioco, eventi, orologio, statistiche e sfida giornaliera */

import {
  SENTE, GOTE, STORAGE_KEY, TIME_CONTROLS, DAILY_PUZZLES, makeInitialBoard
} from './config.js';
import { legalMoves, applyMove, undoMove, isInCheck, positionHash, cloneBoard } from './rules.js';
import { chooseMove } from './ai.js';
import { encodeKifu, decodeKifu } from './notation.js';

const listeners = {};
export function on(event, fn) { (listeners[event] ||= []).push(fn); return () => {
  listeners[event] = (listeners[event] || []).filter(f => f !== fn);
}; }
function emit(event, detail) { (listeners[event] || []).forEach(fn => { try { fn(detail || {}); } catch (e) { console.error(e); } }); }

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
  catch (e) { return {}; }
}
function writeStore(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

const store = readStore();
const defaultStats = {
  games: 0, wins: 0, losses: 0, captures: 0, promotions: 0, drops: 0,
  streak: 0, bestStreak: 0, dailyStreak: 0, lastDaily: ''
};
const defaultAchievements = {
  firstWin: false, checkmate: false, dropMate: false,
  tenWins: false, dailyWeek: false, promoteTen: false
};

export const state = {
  mode: 'ai', level: 'club', timeControl: 'none',
  board: makeInitialBoard().board, hands: [[], []], turn: SENTE,
  selected: null, legalAll: [], legalForSelected: [],
  records: [], redoRecords: [], positionCounts: {},
  currentMove: null, pendingMove: null,
  gameOver: false, result: null, thinking: false, paused: false,
  flipped: false, replay: false,
  clocks: [0, 0], initialClock: 0, increment: 0, lowWarned: [false, false],
  dailyIndex: 0,
  hintMove: null,
  stats: Object.assign({}, defaultStats, store.stats || {}),
  achievements: Object.assign({}, defaultAchievements, store.achievements || {}),
  settings: Object.assign({ sound: true, haptics: true, theme: 'wood', level: 'club', timeControl: 'none' }, store.settings || {})
};

let clockTimer = null;
let aiTimer = null;

function other(side) { return side === SENTE ? GOTE : SENTE; }
function persist() {
  writeStore({ settings: state.settings, stats: state.stats, achievements: state.achievements, daily: store.daily || {} });
}

function refreshLegal() {
  state.legalAll = legalMoves(state.board, state.hands, state.turn);
  state.legalForSelected = [];
}

function countPositions() {
  const fresh = makeInitialBoard();
  state.positionCounts = {};
  for (const rec of state.records) {
    applyMove(fresh.board, fresh.hands, rec.move);
    const key = positionHash(fresh.board, fresh.hands, other(rec.move.turn));
    state.positionCounts[key] = (state.positionCounts[key] || 0) + 1;
  }
}

function dailyIndexForToday() {
  const day = Math.floor(Date.now() / 86400000);
  return ((day % DAILY_PUZZLES.length) + DAILY_PUZZLES.length) % DAILY_PUZZLES.length;
}

function buildDailyBoard(index) {
  const puzzle = DAILY_PUZZLES[index];
  const board = Array.from({ length: 9 }, () => Array(9).fill(null));
  puzzle.pieces.forEach(([x, y, type, owner]) => {
    board[y][x] = { type, owner, promoted: false };
  });
  return board;
}

export function startGame(options) {
  const opts = options || {};
  clearTimers();
  state.mode = opts.mode || 'ai';
  state.level = opts.level || state.settings.level;
  state.timeControl = opts.timeControl || state.settings.timeControl;
  const tc = TIME_CONTROLS.find(t => t.id === state.timeControl) || TIME_CONTROLS[0];
  state.initialClock = tc.initial;
  state.increment = tc.increment;
  state.clocks = [tc.initial, tc.initial];
  state.lowWarned = [false, false];

  if (state.mode === 'daily') {
    state.dailyIndex = dailyIndexForToday();
    state.board = buildDailyBoard(state.dailyIndex);
    state.hands = [[], []];
  } else {
    const fresh = makeInitialBoard();
    state.board = fresh.board;
    state.hands = fresh.hands;
  }
  state.turn = SENTE;
  state.selected = null;
  state.records = [];
  state.redoRecords = [];
  state.positionCounts = {};
  state.currentMove = null;
  state.pendingMove = null;
  state.gameOver = false;
  state.result = null;
  state.thinking = false;
  state.paused = false;
  state.replay = false;
  state.hintMove = null;
  state.flipped = state.mode === 'pvp' ? state.flipped : false;
  refreshLegal();
  startClock();
  emit('start', { mode: state.mode });
  emit('change');
}

function clearTimers() {
  if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
  if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
}

function startClock() {
  if (clockTimer) clearInterval(clockTimer);
  if (!state.initialClock) return;
  clockTimer = setInterval(() => {
    if (state.paused || state.thinking || state.gameOver || state.replay) return;
    state.clocks[state.turn] -= 100;
    if (state.clocks[state.turn] <= 0) {
      state.clocks[state.turn] = 0;
      emit('flag', { side: state.turn });
      endGame('flag', other(state.turn));
      return;
    }
    if (state.clocks[state.turn] < 15000 && !state.lowWarned[state.turn]) {
      state.lowWarned[state.turn] = true;
      emit('timeLow', { side: state.turn });
    }
    emit('clock');
  }, 100);
}

export function togglePause(force) {
  if (state.gameOver) return;
  state.paused = typeof force === 'boolean' ? force : !state.paused;
  emit('pause', { paused: state.paused });
  emit('change');
}

function canInteract() {
  if (state.gameOver || state.paused || state.thinking || state.replay) return false;
  if (state.mode === 'ai' && state.turn === GOTE) return false;
  return true;
}

export function selectCell(x, y) {
  if (!canInteract()) return;
  const piece = state.board[y][x];
  if (piece && piece.owner === state.turn) {
    state.selected = { x, y };
    state.legalForSelected = state.legalAll.filter(m => !m.drop && m.from.x === x && m.from.y === y);
    emit('select');
    emit('change');
    return;
  }
  if (state.selected && !state.selected.handPiece) {
    if (attemptMove(x, y)) return;
  }
  state.selected = null;
  state.legalForSelected = [];
  emit('change');
}

export function selectHand(type) {
  if (!canInteract()) return;
  state.selected = { handPiece: type };
  state.legalForSelected = state.legalAll.filter(m => m.drop && m.piece === type);
  emit('select');
  emit('change');
}

export function clearSelection() {
  state.selected = null;
  state.legalForSelected = [];
  state.pendingMove = null;
  emit('change');
}

export function attemptMove(x, y) {
  if (!canInteract()) return false;
  const candidates = state.legalForSelected.filter(m => m.to.x === x && m.to.y === y);
  if (!candidates.length) {
    emit('message', { key: 'msg.illegal' });
    return false;
  }
  if (candidates.length > 1) {
    state.pendingMove = candidates;
    emit('promotionRequired', { candidates });
    return true;
  }
  executeMove(candidates[0]);
  return true;
}

export function resolvePromotion(promote) {
  const list = state.pendingMove;
  if (!list) return;
  state.pendingMove = null;
  const move = list.find(m => m.promote === promote) || list[0];
  executeMove(move);
}

function executeMove(move) {
  const undo = applyMove(state.board, state.hands, move);
  const rec = { move, undo };
  state.records.push(rec);
  state.redoRecords = [];
  state.currentMove = move;
  state.selected = null;
  state.legalForSelected = [];
  state.hintMove = null;

  state.clocks[move.turn] += state.increment;
  state.lowWarned[move.turn] = false;

  if (move.captured) { state.stats.captures++; emit('capture', { move }); }
  if (move.promote) { state.stats.promotions++; emit('promote', { move }); }
  if (move.drop) { state.stats.drops++; emit('drop', { move }); }

  state.turn = other(move.turn);
  refreshLegal();
  emit('move', { move });

  if (state.mode === 'daily' && checkDailySolution(move)) return;

  if (state.legalAll.length === 0) {
    const inCheck = isInCheck(state.board, state.turn);
    endGame(inCheck ? 'mate' : 'stalemate', other(state.turn));
    return;
  }

  const hash = positionHash(state.board, state.hands, state.turn);
  state.positionCounts[hash] = (state.positionCounts[hash] || 0) + 1;
  if (state.positionCounts[hash] >= 4) {
    endGame('sennichite', null);
    return;
  }

  persist();
  emit('change');

  if (state.mode === 'ai' && state.turn === GOTE && !state.gameOver) scheduleAI();
}

function scheduleAI() {
  state.thinking = true;
  emit('thinking', { value: true });
  emit('change');
  aiTimer = setTimeout(() => {
    aiTimer = null;
    if (state.gameOver || state.paused || state.mode !== 'ai') {
      state.thinking = false;
      emit('thinking', { value: false });
      return;
    }
    const result = chooseMove(state.board, state.hands, GOTE, state.level);
    state.thinking = false;
    emit('thinking', { value: false });
    if (result.move) executeMove(result.move);
    else endGame('resign', SENTE);
  }, 320);
}

function checkDailySolution(move) {
  const puzzle = DAILY_PUZZLES[state.dailyIndex];
  const sol = puzzle.solution;
  const ok = !!move.from &&
    move.from.x === sol.from.x && move.from.y === sol.from.y &&
    move.to.x === sol.to.x && move.to.y === sol.to.y &&
    move.promote === sol.promote;
  if (!ok) {
    emit('message', { key: 'daily.wrong' });
    return true;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (store.daily && store.daily.last === today) {
    emit('message', { key: 'msg.dailyDone' });
  } else {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const streak = store.daily && store.daily.last === yesterday ? (store.daily.streak || 0) + 1 : 1;
    store.daily = { last: today, streak };
    state.stats.dailyStreak = streak;
    if (streak >= 7) state.achievements.dailyWeek = true;
    persist();
    emit('message', { key: 'daily.correct' });
  }
  endGame('daily', SENTE);
  return true;
}

function endGame(reason, winner) {
  if (state.gameOver) return;
  clearTimers();
  state.gameOver = true;
  state.result = { reason, winner };
  state.thinking = false;
  state.selected = null;

  const humanWon = winner === SENTE;
  state.stats.games++;
  if (winner === null) {
    // pareggio: nessuna modifica alla serie
  } else if (humanWon) {
    state.stats.wins++;
    state.stats.streak++;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
    state.achievements.firstWin = true;
    if (state.stats.wins >= 10) state.achievements.tenWins = true;
  } else {
    state.stats.losses++;
    state.stats.streak = 0;
  }
  if (reason === 'mate') state.achievements.checkmate = humanWon;
  if (reason === 'mate' && state.records.length && state.records[state.records.length - 1].move.drop) {
    state.achievements.dropMate = humanWon;
  }
  if (state.stats.promotions >= 10) state.achievements.promoteTen = true;
  persist();
  emit('end', { reason, winner });
  emit('change');
}

export function resign() {
  if (state.gameOver) return;
  endGame('resign', other(state.turn));
}

export function undo() {
  if (state.thinking || state.replay || !state.records.length) return;
  clearTimers();
  let steps = state.mode === 'ai' ? 2 : 1;
  while (steps > 0 && state.records.length) {
    const rec = state.records.pop();
    undoMove(state.board, state.hands, rec.move, rec.undo);
    state.redoRecords.push(rec);
    state.turn = rec.move.turn;
    steps--;
  }
  state.gameOver = false;
  state.result = null;
  state.selected = null;
  state.pendingMove = null;
  refreshLegal();
  countPositions();
  startClock();
  emit('change');
}

export function redo() {
  if (state.thinking || state.replay || !state.redoRecords.length) return;
  while (state.redoRecords.length) {
    const rec = state.redoRecords.pop();
    const undo = applyMove(state.board, state.hands, rec.move);
    rec.undo = undo;
    state.records.push(rec);
    state.turn = other(rec.move.turn);
  }
  state.gameOver = false;
  state.result = null;
  refreshLegal();
  countPositions();
  emit('change');
}

export function flip() {
  state.flipped = !state.flipped;
  emit('flip', { flipped: state.flipped });
  emit('change');
}

export function hint() {
  if (state.gameOver || state.thinking || state.replay) return;
  const result = chooseMove(state.board, state.hands, state.turn, 'master', { depth: 3, budget: 800 });
  if (result.move) {
    state.hintMove = result.move;
    emit('hint', { move: result.move, score: result.score });
    emit('change');
  }
}

export function getKifu() { return encodeKifu(state.records.map(r => r.move)); }

export function loadKifu(text, index) {
  const moves = decodeKifu(text);
  if (!moves.length) return false;
  clearTimers();
  const fresh = makeInitialBoard();
  state.board = fresh.board;
  state.hands = fresh.hands;
  state.records = [];
  state.redoRecords = [];
  state.positionCounts = {};
  state.mode = 'replay';
  state.replay = true;
  state.gameOver = true;
  state.result = { reason: 'replay', winner: null };
  state.selected = null;
  const limit = Math.min(typeof index === 'number' ? index : moves.length, moves.length);
  for (let i = 0; i < limit; i++) {
    const move = moves[i];
    const undo = applyMove(state.board, state.hands, move);
    state.records.push({ move, undo });
  }
  state.turn = limit % 2 ? GOTE : SENTE;
  state.currentMove = limit ? state.records[limit - 1].move : null;
  refreshLegal();
  emit('change');
  return true;
}

export function gotoMove(index) {
  const text = getKifu();
  if (!text) return;
  loadKifu(text, index);
}

export function setSetting(key, value) {
  state.settings[key] = value;
  persist();
  emit('settings', { key, value });
  emit('change');
}

export function getDailyInfo() {
  return {
    index: dailyIndexForToday(),
    puzzle: DAILY_PUZZLES[dailyIndexForToday()],
    streak: state.stats.dailyStreak,
    done: !!(store.daily && store.daily.last === new Date().toISOString().slice(0, 10))
  };
}

export function getStats() { return state.stats; }
export function getAchievements() { return state.achievements; }
