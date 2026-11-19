/* Forza 4 — board rendering, HUD, dialogs and bilingual UI */

import { ROWS, COLS, EMPTY, P1, P2 } from './rules.js';
import { state, ACHIEVEMENTS } from './state.js';

const DICT = {
  it: {
    back: 'Portfolio', title: 'FORZA 4', subtitle: 'Un minimax con il sorriso — allena il tuo cervello',
    player: 'TU', ai: 'AVVERSARIO', draws: 'PAREGGI', mode: 'Modalità', difficulty: 'Difficoltà',
    modeAi: 'Contro IA', modeLocal: '2 giocatori', modeSpectator: 'IA vs IA',
    easy: 'Facile', medium: 'Medio', hard: 'Difficile',
    yourTurn: 'Tuo turno — giallo!', aiTurn: 'L’IA sta pensando…', player1Turn: 'Turno del giallo',
    player2Turn: 'Turno del rosso', winP1: '🎉 Giallo vince!', winP2: '🎉 Rosso vince!',
    winPlayer: '🎉 Hai vinto!', winAi: '🤖 L’IA ha vinto…', draw: '🤝 Pareggio!',
    newGame: 'Nuova partita', resetStats: 'Azzera statistiche', undo: 'Annulla', hint: 'Suggerimento',
    sound: 'Audio', aiName: 'Nome IA', skin: 'Pedine', streak: 'Serie', games: 'Partite',
    achievements: 'Obiettivi', resetConfirm: 'Azzera tutte le statistiche?', close: 'Chiudi',
    hintText: 'Prova la colonna', noUndo: 'Nessuna mossa da annullare', aiThinking: 'Ci penso…',
    yourMove: 'Scegli una colonna 👇', skinClassic: 'Classiche', skinNeon: 'Neon', skinCandy: 'Caramella',
    personality: 'Personalità', persSly: 'Furba', persSnarky: 'Sarcastiche', persChill: 'Rilassata',
    settings: 'Personalizza', turnOf: 'Turno di', moves: 'mosse'
  },
  en: {
    back: 'Portfolio', title: 'CONNECT FOUR', subtitle: 'A smiling minimax — train your brain',
    player: 'YOU', ai: 'OPPONENT', draws: 'DRAWS', mode: 'Mode', difficulty: 'Difficulty',
    modeAi: 'Vs AI', modeLocal: '2 players', modeSpectator: 'AI vs AI',
    easy: 'Easy', medium: 'Medium', hard: 'Hard',
    yourTurn: 'Your turn — yellow!', aiTurn: 'AI is thinking…', player1Turn: 'Yellow’s turn',
    player2Turn: 'Red’s turn', winP1: '🎉 Yellow wins!', winP2: '🎉 Red wins!',
    winPlayer: '🎉 You win!', winAi: '🤖 AI wins…', draw: '🤝 Draw!',
    newGame: 'New game', resetStats: 'Reset stats', undo: 'Undo', hint: 'Hint',
    sound: 'Sound', aiName: 'AI name', skin: 'Pieces', streak: 'Streak', games: 'Games',
    achievements: 'Achievements', resetConfirm: 'Reset all statistics?', close: 'Close',
    hintText: 'Try column', noUndo: 'Nothing to undo', aiThinking: 'Let me think…',
    yourMove: 'Pick a column 👇', skinClassic: 'Classic', skinNeon: 'Neon', skinCandy: 'Candy',
    personality: 'Personality', persSly: 'Sly', persSnarky: 'Snarky', persChill: 'Chill',
    settings: 'Customize', turnOf: 'Turn of', moves: 'moves'
  }
};

let lang = 'it';
try {
  const stored = localStorage.getItem('forza4_lang');
  const site = localStorage.getItem('site_lang') || localStorage.getItem('lang');
  lang = stored === 'en' || stored === 'it' ? stored : String(site).slice(0, 2) === 'en' ? 'en' : 'it';
} catch (e) { /* default */ }

export function t(key) { return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key; }
export function getLang() { return lang; }
export function setLang(value) {
  lang = value === 'en' ? 'en' : 'it';
  try { localStorage.setItem('forza4_lang', lang); } catch (e) { /* ignore */ }
}

const $ = id => document.getElementById(id);
let cells = [];
let rendered = new Set();
let toastTimer = 0;

export function initUI(callbacks) {
  applyLanguage();

  const boardEl = $('board');
  boardEl.innerHTML = '';
  cells = [];
  for (let r = 0; r < ROWS; r++) {
    cells[r] = [];
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.setAttribute('aria-label', `riga ${r + 1} colonna ${c + 1}`);
      cell.onclick = () => callbacks.onColumn?.(c);
      cell.onmouseenter = () => callbacks.onHover?.(c);
      boardEl.appendChild(cell);
      cells[r][c] = cell;
    }
  }

  const colEl = $('columnButtons');
  colEl.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'column-btn';
    button.dataset.col = c;
    button.innerHTML = `<span>▼</span><small>${c + 1}</small>`;
    button.onclick = () => callbacks.onColumn?.(c);
    button.onmouseenter = () => callbacks.onHover?.(c);
    colEl.appendChild(button);
  }

  const on = (id, fn) => { const el = $(id); if (el) el.onclick = fn; };
  on('newGameBtn', callbacks.onNewGame);
  on('resetStatsBtn', callbacks.onResetStats);
  on('undoBtn', callbacks.onUndo);
  on('hintBtn', callbacks.onHint);
  on('soundBtn', callbacks.onSound);
  on('langBtn', () => { setLang(lang === 'it' ? 'en' : 'it'); applyLanguage(); callbacks.onLang?.(); });

  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.onclick = () => callbacks.onMode?.(btn.dataset.mode);
  });
  document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.onclick = () => callbacks.onDifficulty?.(btn.dataset.difficulty);
  });
  document.querySelectorAll('[data-skin]').forEach(btn => {
    btn.onclick = () => callbacks.onSkin?.(btn.dataset.skin);
  });
  document.querySelectorAll('[data-personality]').forEach(btn => {
    btn.onclick = () => callbacks.onPersonality?.(btn.dataset.personality);
  });
  const nameInput = $('aiName');
  if (nameInput) nameInput.onchange = e => callbacks.onAiName?.(e.target.value.trim());

  updateHUD();
}

export function renderBoard(board, lastMove, winnerCells) {
  const nextRendered = new Set();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells[r][c];
      const value = board[r][c];
      const key = r + '-' + c;
      const existing = cell.querySelector('.piece');
      if (value === EMPTY) {
        if (existing) existing.remove();
        cell.classList.remove('winner');
        continue;
      }
      nextRendered.add(key);
      const owner = value === P1 ? 'p1' : 'p2';
      if (!existing) {
        const piece = document.createElement('span');
        piece.className = 'piece ' + owner;
        if (!rendered.size && lastMove && lastMove.row === r && lastMove.col === c) {
          piece.classList.add('dropping');
          setTimeout(() => piece.classList.remove('dropping'), 650);
        }
        cell.appendChild(piece);
      } else {
        existing.className = 'piece ' + owner;
      }
      cell.classList.toggle('winner', !!winnerCells?.some(([wr, wc]) => wr === r && wc === c));
    }
  }
  rendered = nextRendered;
}

export function highlightColumn(col) {
  document.querySelectorAll('.column-btn').forEach((btn, index) => btn.classList.toggle('hovered', index === col));
  document.querySelectorAll('.cell').forEach(cell => cell.classList.toggle('col-hover', Number(cell.dataset.col) === col));
}

export function setColumnsEnabled(columns) {
  document.querySelectorAll('.column-btn').forEach(btn => {
    btn.disabled = !columns.includes(Number(btn.dataset.col));
  });
}

export function setMessage(text, tone = '') {
  const el = $('gameMessage');
  if (!el) return;
  el.textContent = text;
  el.className = 'game-message' + (tone ? ' ' + tone : '');
}

export function setTurn(player, mode) {
  const el = $('turnBadge');
  if (!el) return;
  const label = mode === 'local'
    ? (player === P1 ? t('player1Turn') : t('player2Turn'))
    : (player === P1 ? t('yourTurn') : t('aiTurn'));
  el.textContent = label;
  el.className = 'turn-badge ' + (player === P1 ? 'yellow' : 'red');
  document.body.dataset.turn = player === P1 ? 'yellow' : 'red';
}

export function updateHUD() {
  const record = state.stats[state.settings.difficulty] || state.stats.medium;
  $('playerScore').textContent = record.win;
  $('aiScore').textContent = record.loss;
  $('draws').textContent = record.draw;
  $('streakVal').textContent = state.streak;
  $('gamesVal').textContent = state.games;
  const aiName = state.settings.aiName || (state.settings.personality === 'snarky' ? 'Sig. Sarcasmo' : state.settings.personality === 'chill' ? 'Nonna Zen' : 'Prof. Minimi');
  $('aiNameDisplay').textContent = aiName;
  const mood = $('aiMood');
  if (mood) mood.textContent = state.settings.personality === 'snarky' ? '😏' : state.settings.personality === 'chill' ? '😌' : '🤓';
  document.querySelectorAll('[data-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === state.settings.mode));
  document.querySelectorAll('[data-difficulty]').forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === state.settings.difficulty));
  document.querySelectorAll('[data-skin]').forEach(btn => btn.classList.toggle('active', btn.dataset.skin === state.settings.skin));
  document.querySelectorAll('[data-personality]').forEach(btn => btn.classList.toggle('active', btn.dataset.personality === state.settings.personality));
  document.body.dataset.skin = state.settings.skin;
  $('soundBtn').textContent = state.settings.sound ? '🔊' : '🔇';
  const nameInput = $('aiName');
  if (nameInput && document.activeElement !== nameInput) nameInput.value = state.settings.aiName || '';
}

export function setActionButtons(canUndo, canHint) {
  $('undoBtn').disabled = !canUndo;
  $('hintBtn').disabled = !canHint;
}

export function setTaunt(text) {
  const el = $('aiTaunt');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

export function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('on'), 1800);
}

export function applyLanguage() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  $('langBtn').textContent = lang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
}

export function tauntsFor(kind, win = false) {
  const sly = win
    ? ['Il minimax non fa errori. Di solito.', 'Hai giocato bene. Peccato.', 'Rivediamo la partita? No.']
    : ['Un errore statisticamente irrilevante.', 'Ho lasciato una colonna libera. Per educazione.', 'Il mio alpha-beta era in pausa caffè.'];
  const snarky = win
    ? ['Oh, finalmente. Posso smettere di fingere di impegnarmi?', 'Vinci e lo scrivi sui muri? Lo farei anch’io.', 'Non era nemmeno la mia partita migliore.']
    : ['Hai messo 4 pedine in fila. Wow. Mai visto prima.', 'Stavo pensando al cenone, scusa.', 'Il tuo cervello: modalità risparmio energetico.'];
  const chill = win
    ? ['Bravo! Respira, goditi il momento 🌿', 'Che bella partita, davvero.', 'Il tè è ancora caldo, se vuoi.']
    : ['Va bene, ho vinto io. Il prossimo è tuo 🌿', 'Nessuna fretta, hai tempo per rimediare.', 'Sorridi, è solo un gioco.'];
  const list = state.settings.personality === 'snarky' ? snarky : state.settings.personality === 'chill' ? chill : sly;
  return list[Math.floor(Math.random() * list.length)];
}

export function achievementList() { return ACHIEVEMENTS; }
