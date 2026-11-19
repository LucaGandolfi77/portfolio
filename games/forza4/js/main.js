/* Forza 4 — bootstrap and game orchestration */

import { createBoard, applyMove, validColumns, findWin, isDraw, P1, P2, EMPTY } from './rules.js';
import { chooseMove, hintMove } from './ai.js';
import { state, save, setSetting, recordResult, resetStats } from './state.js';
import { initEffects, sfx, confetti, shake } from './effects.js';
import * as UI from './ui.js';

let board = createBoard();
let current = P1;
let history = [];
let lastMove = null;
let winnerCells = null;
let gameActive = true;
let thinking = false;
let aiTimer = 0;
let hoverCol = 3;
let hintCol = -1;

function place(col, byAI = false) {
  if (!gameActive || thinking) return;
  if (state.settings.mode === 'ai' && !byAI && current !== P1) return;
  if (state.settings.mode === 'spectator' && !byAI) return;

  const move = applyMove(board, col, current);
  if (!move) return;

  if (!byAI) {
    history.push({ board: board.map(row => row.slice()), current, lastMove });
  }
  board = move.board;
  lastMove = { row: move.row, col };
  hintCol = -1;
  sfx('drop');
  refresh();

  const win = findWin(board, current);
  if (win) { endGame(current); return; }
  if (isDraw(board)) { endGame(null); return; }

  current = current === P1 ? P2 : P1;
  refresh();
  if (state.settings.mode === 'spectator' || (state.settings.mode === 'ai' && current === P2)) scheduleAI();
}

function scheduleAI() {
  thinking = true;
  UI.setMessage(UI.t('aiThinking'));
  UI.setActionButtons(history.length > 0, false);
  clearTimeout(aiTimer);
  aiTimer = setTimeout(() => {
    if (!gameActive) return;
    thinking = false;
    const col = chooseMove(board, current, state.settings.difficulty);
    if (col !== null) place(col, true);
  }, 520);
}

function refresh() {
  UI.renderBoard(board, lastMove, winnerCells);
  UI.setColumnsEnabled(validColumns(board));
  UI.setTurn(current, state.settings.mode);
  UI.setActionButtons(history.length > 0, gameActive && !thinking);
  UI.updateHUD();
  if (hintCol >= 0) UI.highlightColumn(hintCol);
}

function endGame(winner) {
  gameActive = false;
  thinking = false;
  clearTimeout(aiTimer);
  winnerCells = winner ? findWin(board, winner) : null;

  const mode = state.settings.mode;
  if (mode === 'ai') {
    recordResult('ai', state.settings.difficulty, winner === P1 ? 'win' : winner === P2 ? 'loss' : 'draw');
    UI.setMessage(winner === P1 ? UI.t('winPlayer') : winner === P2 ? UI.t('winAi') : UI.t('draw'),
      winner === P1 ? 'win' : winner === P2 ? 'lose' : 'draw');
  } else if (mode === 'local') {
    recordResult('local', '', winner === P1 ? 'p1' : winner === P2 ? 'p2' : 'draw');
    UI.setMessage(winner === P1 ? UI.t('winP1') : winner === P2 ? UI.t('winP2') : UI.t('draw'),
      winner ? 'win' : 'draw');
  } else {
    UI.setMessage(winner === P1 ? UI.t('winP1') : winner === P2 ? UI.t('winP2') : UI.t('draw'), 'draw');
  }

  if (winner) {
    sfx('win');
    confetti(140);
    shake(document.getElementById('boardWrap'));
    UI.setTaunt(UI.tauntsFor(state.settings.personality, mode === 'ai' && winner === P2));
  } else sfx('draw');

  refresh();
}

function newGame(silent = false) {
  clearTimeout(aiTimer);
  board = createBoard();
  current = P1;
  history = [];
  lastMove = null;
  winnerCells = null;
  hintCol = -1;
  gameActive = true;
  thinking = false;
  refresh();
  UI.setMessage(state.settings.mode === 'spectator' ? UI.t('aiTurn') : UI.t('yourMove'));
  if (!silent) sfx('click');
  if (state.settings.mode === 'spectator') scheduleAI();
}

function undo() {
  if (!history.length) { UI.toast(UI.t('noUndo')); return; }
  const previous = history.pop();
  board = previous.board;
  current = previous.current;
  lastMove = previous.lastMove;
  winnerCells = null;
  gameActive = true;
  thinking = false;
  hintCol = -1;
  clearTimeout(aiTimer);
  refresh();
  UI.setMessage(state.settings.mode === 'ai' && current === P2 ? UI.t('aiTurn') : UI.t('yourMove'));
  sfx('undo');
}

function hint() {
  if (!gameActive || thinking) return;
  const col = hintMove(board, current === P1 ? P1 : P2);
  if (col === null) return;
  hintCol = col;
  UI.highlightColumn(col);
  UI.setMessage(`${UI.t('hintText')} ${col + 1} 👉`);
  sfx('hint');
}

function setMode(mode) {
  setSetting('mode', mode);
  if (mode === 'spectator') {
    current = Math.random() < 0.5 ? P1 : P2;
    newGame(true);
    scheduleAI();
  } else newGame(true);
}

function setDifficulty(level) {
  setSetting('difficulty', level);
  UI.updateHUD();
  UI.toast(UI.t(level));
}

function setSkin(skin) { setSetting('skin', skin); UI.updateHUD(); }
function setPersonality(personality) {
  setSetting('personality', personality);
  UI.updateHUD();
  UI.setTaunt(UI.tauntsFor(personality));
}

function hover(col) {
  hoverCol = col;
  UI.highlightColumn(col);
}

function onKey(e) {
  if (e.target && /INPUT|TEXTAREA/i.test(e.target.tagName)) return;
  if (/^[1-7]$/.test(e.key)) { place(Number(e.key) - 1); return; }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    hoverCol = Math.max(0, Math.min(6, hoverCol + (e.key === 'ArrowRight' ? 1 : -1)));
    UI.highlightColumn(hoverCol);
  } else if (e.key === 'Enter') place(hoverCol);
  else if (e.key.toLowerCase() === 'u') undo();
  else if (e.key.toLowerCase() === 'h') hint();
  else if (e.key.toLowerCase() === 'n') newGame();
}

function boot() {
  initEffects(document.getElementById('fx'));
  UI.initUI({
    onColumn: place,
    onHover: hover,
    onNewGame: () => newGame(),
    onResetStats: () => {
      if (window.confirm(UI.t('resetConfirm'))) { resetStats(); UI.updateHUD(); newGame(); }
    },
    onUndo: undo,
    onHint: hint,
    onMode: setMode,
    onDifficulty: setDifficulty,
    onSkin: setSkin,
    onPersonality: setPersonality,
    onAiName: name => { setSetting('aiName', name.slice(0, 18)); UI.updateHUD(); },
    onSound: () => { setSetting('sound', !state.settings.sound); UI.updateHUD(); sfx('click'); },
    onLang: () => UI.setMessage(UI.t('yourMove'))
  });
  window.addEventListener('keydown', onKey);
  newGame(true);
  UI.setTaunt(UI.tauntsFor(state.settings.personality));
}

boot();
