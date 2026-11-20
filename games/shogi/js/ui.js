/* UI: board, interazioni, modali, statistiche */

import { PIECES, HAND_ORDER, LEVELS, TIME_CONTROLS, THEMES, SENTE, GOTE } from './config.js';
import { isInCheck } from './rules.js';
import { formatMove } from './notation.js';
import { state, on, startGame, selectCell, selectHand, clearSelection, attemptMove,
  resolvePromotion, undo, redo, flip, hint, resign, togglePause, getKifu, loadKifu,
  gotoMove, setSetting, getDailyInfo, getStats, getAchievements } from './game.js';
import { t, getLang, setLang, onLangChange } from './i18n.js';
import { play, vibrate, unlockAudio, isSoundOn, isHapticsOn, toggleSound, toggleHaptics } from './audio.js';

const $ = id => document.getElementById(id);
const OVERLAYS = ['menuOverlay', 'promotionOverlay', 'rulesOverlay', 'tutorialOverlay', 'resultOverlay', 'settingsOverlay'];

let selected = { mode: 'ai', level: 'club', time: 'none', theme: 'wood' };
let tutorialStep = 0;
let drag = null;
let ghost = null;
let longPressTimer = null;
let keyboardCursor = { x: 4, y: 4 };

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function showOverlay(name) {
  OVERLAYS.forEach(id => $(id).classList.add('hidden'));
  if (name) $(name).classList.remove('hidden');
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.documentElement.lang = getLang();
  $('langBtn').textContent = getLang() === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';
  document.body.dataset.theme = state.settings.theme;
  renderMenu();
  renderRules();
  renderTutorial();
  renderAll();
}

/* ---------------- Menu e modali ---------------- */

function choiceCard(id, label, desc, active) {
  const el = document.createElement('div');
  el.className = 'choice' + (active ? ' active' : '');
  el.innerHTML = '<b>' + label + '</b>' + (desc ? '<small>' + desc + '</small>' : '');
  el.addEventListener('click', () => {
    unlockAudio();
    play('click');
    if (id) id();
  });
  return el;
}

function renderMenu() {
  const modeGrid = $('modeGrid');
  modeGrid.innerHTML = '';
  [['ai', 'menu.mode.ai', 'menu.mode.ai.desc'], ['pvp', 'menu.mode.pvp', 'menu.mode.pvp.desc'],
   ['daily', 'menu.mode.daily', 'menu.mode.daily.desc']].forEach(([id, name, desc]) => {
    modeGrid.appendChild(choiceCard(() => { selected.mode = id; renderMenu(); }, t(name), t(desc), selected.mode === id));
  });

  const levelGrid = $('levelGrid');
  levelGrid.innerHTML = '';
  LEVELS.forEach(level => {
    levelGrid.appendChild(choiceCard(() => { selected.level = level.id; renderMenu(); },
      t(level.labelKey), t(level.descKey), selected.level === level.id));
  });

  const timeGrid = $('timeGrid');
  timeGrid.innerHTML = '';
  TIME_CONTROLS.forEach(tc => {
    timeGrid.appendChild(choiceCard(() => { selected.time = tc.id; renderMenu(); },
      t(tc.labelKey), '', selected.time === tc.id));
  });

  const themeGrid = $('themeGrid');
  themeGrid.innerHTML = '';
  THEMES.forEach(theme => {
    themeGrid.appendChild(choiceCard(() => {
      selected.theme = theme.id;
      document.body.dataset.theme = theme.id;
      setSetting('theme', theme.id);
      renderMenu();
    }, t(theme.labelKey), '', selected.theme === theme.id));
  });

  $('menuBest').textContent = t('menu.best', { score: getStats().bestStreak || 0 });
}

function renderRules() {
  const keys = [
    ['rules.objective', 'rules.objective.text'], ['rules.pieces', null],
    [null, 'rules.p1'], [null, 'rules.p2'], [null, 'rules.p3'], [null, 'rules.p4'],
    [null, 'rules.p5'], [null, 'rules.p6'], [null, 'rules.p7'], [null, 'rules.p8'],
    ['rules.drops', 'rules.drops.text'], [null, 'rules.d1'], [null, 'rules.d2'], [null, 'rules.d3'],
    ['rules.promotion', 'rules.promotion.text'], ['rules.repetition', 'rules.repetition.text']
  ];
  $('rulesContent').innerHTML = '<h2>' + t('rules.title') + '</h2>' +
    keys.map(([heading, body]) => (heading ? '<h3>' + t(heading) + '</h3>' : '') +
      (body ? '<p>' + t(body) + '</p>' : '')).join('') +
    '<div class="row-btns"><button class="btn primary" id="closeRulesBtn">' + t('action.close') + '</button></div>';
  $('closeRulesBtn').addEventListener('click', () => showOverlay(null));
}

function renderTutorial() {
  const lessons = [1, 2, 3, 4, 5];
  $('tutorialTitle').textContent = t('tutorial.' + lessons[tutorialStep] + '.title');
  $('tutorialBody').textContent = t('tutorial.' + lessons[tutorialStep] + '.body');
  $('tutorialArt').textContent = ['將', '歩', '銀', '飛', '打'][tutorialStep];
  $('tutorialNext').textContent = t(tutorialStep === lessons.length - 1 ? 'tutorial.done' : 'tutorial.next');
  $('tutorialDots').innerHTML = lessons.map((_, i) => '<span class="dot' + (i === tutorialStep ? ' active' : '') + '"></span>').join('');
}

/* ---------------- Rendering board ---------------- */

function cellCoords(cell) {
  const dx = Number(cell.dataset.x);
  const dy = Number(cell.dataset.y);
  return state.flipped ? { x: 8 - dx, y: 8 - dy } : { x: dx, y: dy };
}

function pieceKanji(piece) {
  const def = PIECES[piece.type];
  if (!def) return piece.type;
  return piece.promoted ? (def.promotedKanji || def.kanji) : def.kanji;
}

function renderBoard() {
  const board = $('board');
  board.classList.toggle('flipped', false);
  const checkCell = findKingCell(state.board, state.turn);
  const last = state.currentMove;
  const hint = state.hintMove;
  let html = '';
  for (let dy = 0; dy < 9; dy++) {
    for (let dx = 0; dx < 9; dx++) {
      const { x, y } = state.flipped ? { x: 8 - dx, y: 8 - dy } : { x: dx, y: dy };
      const classes = ['cell'];
      if (state.selected && !state.selected.handPiece && state.selected.x === x && state.selected.y === y) classes.push('selected');
      if (state.legalForSelected.some(m => m.to.x === x && m.to.y === y)) classes.push('valid');
      if (last && last.to.x === x && last.to.y === y) classes.push('last');
      if (keyboardCursor.x === x && keyboardCursor.y === y) classes.push('hover');
      if (checkCell && checkCell.x === x && checkCell.y === y) classes.push('check');
      if (hint && hint.to.x === x && hint.to.y === y) classes.push('hint');
      const piece = state.board[y][x];
      let inner = '';
      if (piece) {
        const rotated = state.flipped ? piece.owner === SENTE : piece.owner === GOTE;
        inner = '<div class="piece' + (rotated ? ' opponent' : '') + (piece.promoted ? ' promoted' : '') +
          '" data-x="' + x + '" data-y="' + y + '">' + pieceKanji(piece) + '</div>';
      }
      html += '<div class="' + classes.join(' ') + '" data-x="' + dx + '" data-y="' + dy +
        '" role="gridcell">' + inner + '</div>';
    }
  }
  board.innerHTML = html;
}

function findKingCell(board, owner) {
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const p = board[y][x];
    if (p && p.type === 'K' && p.owner === owner) return { x, y };
  }
  return null;
}

function renderHands() {
  [[0, $('handSente')], [1, $('handGote')]].forEach(([owner, el]) => {
    const counts = {};
    state.hands[owner].forEach(type => { counts[type] = (counts[type] || 0) + 1; });
    el.innerHTML = HAND_ORDER.filter(type => counts[type]).map(type => {
      const selectedHand = state.selected && state.selected.handPiece === type;
      const rotated = state.flipped ? owner === SENTE : owner === GOTE;
      return '<div class="hand-piece' + (rotated ? ' opponent' : '') + (selectedHand ? ' selected' : '') +
        '" data-piece="' + type + '" title="' + t('piece.' + type) + '">' + PIECES[type].kanji +
        (counts[type] > 1 ? '<span class="count">' + counts[type] + '</span>' : '') + '</div>';
    }).join('');
  });
}

function formatClock(ms) {
  if (!ms && ms !== 0) return '--:--';
  const total = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

function renderPlayers() {
  const goteIsAI = state.mode === 'ai';
  $('playerGoteName').textContent = goteIsAI ? t('hud.ai') + ' · ' + t(levelLabelKey()) : t('hud.gote');
  $('playerSenteName').textContent = state.mode === 'daily' ? t('panel.daily') : t('hud.sente');
  $('playerGoteLevel').textContent = goteIsAI ? t('level.' + state.level) : '';
  $('playerSenteLevel').textContent = '';
  $('playerGoteClock').textContent = formatClock(state.clocks[GOTE]);
  $('playerSenteClock').textContent = formatClock(state.clocks[SENTE]);
  $('playerGoteClock').classList.toggle('low', state.clocks[GOTE] > 0 && state.clocks[GOTE] < 15000);
  $('playerSenteClock').classList.toggle('low', state.clocks[SENTE] > 0 && state.clocks[SENTE] < 15000);
  $('playerGote').classList.toggle('active', state.turn === GOTE);
  $('playerSente').classList.toggle('active', state.turn === SENTE);
}

function levelLabelKey() {
  const level = LEVELS.find(l => l.id === state.level) || LEVELS[1];
  return level.labelKey;
}

function renderStatus() {
  const el = $('status');
  el.classList.remove('check');
  if (state.gameOver && state.result) {
    const reason = state.result.reason;
    const key = reason === 'mate' || reason === 'stalemate' ? 'hud.mate'
      : reason === 'sennichite' ? 'hud.draw'
      : reason === 'daily' ? 'daily.correct'
      : reason === 'flag' ? 'msg.flag' : 'result.title';
    el.textContent = t(key);
    return;
  }
  if (state.thinking) { el.textContent = t('hud.thinking'); return; }
  if (state.paused) { el.textContent = t('hud.paused'); return; }
  if (isInCheck(state.board, state.turn)) {
    el.textContent = t('hud.check');
    el.classList.add('check');
    return;
  }
  el.textContent = state.turn === SENTE ? t('hud.yourTurn') : t('hud.goteTurn');
}

function renderKifu() {
  const list = $('kifuList');
  list.innerHTML = state.records.map((rec, i) =>
    '<li data-index="' + (i + 1) + '"><span>' + (i + 1) + '.</span><span>' + formatMove(rec.move) + '</span></li>'
  ).join('');
  list.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => { gotoMove(Number(li.dataset.index)); toast(t('action.replay')); });
  });
}

function renderStats() {
  const s = getStats();
  const items = [
    ['stats.games', s.games], ['stats.wins', s.wins], ['stats.losses', s.losses],
    ['stats.captures', s.captures], ['stats.promotions', s.promotions], ['stats.drops', s.drops],
    ['stats.streak', s.streak], ['stats.bestStreak', s.bestStreak]
  ];
  $('statsGrid').innerHTML = items.map(([key, value]) =>
    '<div class="stat-box"><b>' + value + '</b><span>' + t(key) + '</span></div>').join('');

  const ach = getAchievements();
  const achKeys = ['firstWin', 'checkmate', 'dropMate', 'tenWins', 'dailyWeek', 'promoteTen'];
  $('achievementsGrid').innerHTML = achKeys.map(key =>
    '<span class="ach' + (ach[key] ? ' unlocked' : '') + '">' + (ach[key] ? '★ ' : '☆ ') + t('ach.' + key) + '</span>').join('');

  const daily = getDailyInfo();
  $('dailyDesc').textContent = t('panel.daily.desc');
  $('dailyStreak').textContent = t('panel.daily.streak', { n: daily.streak }) + (daily.done ? ' ✓' : '');
  $('dailyBtn').disabled = daily.done;
}

function renderEval() {
  const score = state.hintMove ? 0 : 0;
  const pct = 50 + Math.max(-42, Math.min(42, score));
  $('evalFill').style.width = pct + '%';
}

function renderAll() {
  renderBoard();
  renderHands();
  renderPlayers();
  renderStatus();
  renderKifu();
  renderStats();
  renderEval();
  $('undoBtn').disabled = !state.records.length || state.thinking;
  $('redoBtn').disabled = !state.redoRecords.length || state.thinking;
  $('hintBtn').disabled = state.gameOver || state.thinking;
  $('resignBtn').disabled = state.gameOver;
  $('pauseBtn').disabled = state.gameOver;
  $('boardOverlay').classList.toggle('hidden', !state.gameOver && !state.paused);
  $('boardOverlayText').textContent = state.paused ? t('hud.paused') : '';
}

/* ---------------- Gesture ---------------- */

function createGhost(piece) {
  removeGhost();
  ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.textContent = pieceKanji(piece);
  document.body.appendChild(ghost);
}

function moveGhost(x, y) {
  if (ghost) { ghost.style.left = x + 'px'; ghost.style.top = y + 'px'; }
}

function removeGhost() {
  if (ghost) { ghost.remove(); ghost = null; }
}

function startLongPress(piece) {
  clearTimeout(longPressTimer);
  longPressTimer = setTimeout(() => {
    toast(t('piece.' + piece.type) + (piece.promoted ? ' ★' : ''));
    vibrate(25);
    longPressTimer = null;
  }, 520);
}

function attachGestures() {
  const board = $('board');

  board.addEventListener('pointerdown', event => {
    if (state.gameOver || state.thinking || state.paused) return;
    unlockAudio();
    const cell = event.target.closest('.cell');
    if (!cell) return;
    const { x, y } = cellCoords(cell);
    const piece = state.board[y][x];
    if (!piece || piece.owner !== state.turn) {
      selectCell(x, y);
      return;
    }
    drag = { kind: 'board', x, y, piece, sx: event.clientX, sy: event.clientY, moved: false };
    keyboardCursor = { x, y };
    startLongPress(piece);
  });

  document.addEventListener('pointermove', event => {
    if (!drag) return;
    if (Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) > 8) {
      if (!drag.moved) { drag.moved = true; clearTimeout(longPressTimer); createGhost(drag.piece); }
      moveGhost(event.clientX, event.clientY);
    }
  });

  document.addEventListener('pointerup', event => {
    if (!drag) return;
    clearTimeout(longPressTimer);
    if (drag.moved) {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const cell = target && target.closest('.cell');
      if (cell) {
        const to = cellCoords(cell);
        if (drag.kind === 'hand') selectHand(drag.piece);
        else selectCell(drag.x, drag.y);
        attemptMove(to.x, to.y);
      }
    } else if (drag.kind === 'hand') {
      selectHand(drag.piece);
    } else {
      selectCell(drag.x, drag.y);
    }
    removeGhost();
    drag = null;
  });

  [$('handSente'), $('handGote')].forEach(el => {
    el.addEventListener('pointerdown', event => {
      if (state.gameOver || state.thinking || state.paused) return;
      const hp = event.target.closest('.hand-piece');
      if (!hp) return;
      event.preventDefault();
      drag = { kind: 'hand', piece: hp.dataset.piece, sx: event.clientX, sy: event.clientY, moved: false };
    });
  });

  let swipeStart = null;
  board.addEventListener('pointerdown', event => {
    swipeStart = { x: event.clientX, y: event.clientY };
  });
  board.addEventListener('pointerup', event => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 35) { flip(); vibrate(20); }
    swipeStart = null;
  });

  window.addEventListener('keydown', event => {
    const overlayOpen = OVERLAYS.some(id => !$(id).classList.contains('hidden'));
    const key = event.key;
    if (overlayOpen && key !== 'Escape') return;
    if (key === 'Escape') {
      if (state.pendingMove) { state.pendingMove = null; renderAll(); }
      else { clearSelection(); showOverlay('menuOverlay'); }
      return;
    }
    const moves = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (moves[key]) {
      event.preventDefault();
      const [dx, dy] = moves[key];
      keyboardCursor.x = Math.max(0, Math.min(8, keyboardCursor.x + dx));
      keyboardCursor.y = Math.max(0, Math.min(8, keyboardCursor.y + dy));
      renderBoard();
    } else if (key === 'Enter') {
      selectCell(keyboardCursor.x, keyboardCursor.y);
    }
  });
}

/* ---------------- Eventi di gioco ---------------- */

function wireGameEvents() {
  on('start', () => showOverlay(null));
  on('change', renderAll);
  on('select', () => { vibrate(12); play('click'); });
  on('move', () => { play('move'); vibrate(18); });
  on('capture', () => { play('capture'); vibrate([25, 30, 25]); });
  on('drop', () => { play('drop'); vibrate(30); });
  on('promote', () => { play('promote'); vibrate([20, 40, 20]); });
  on('check', () => { play('check'); vibrate([40, 50, 40]); });
  on('timeLow', () => { play('lowTime'); toast(t('msg.timeLow')); });
  on('flag', () => toast(t('msg.flag')));
  on('thinking', ({ value }) => { if (value) renderAll(); });
  on('message', ({ key }) => toast(t(key)));
  on('promotionRequired', ({ candidates }) => {
    const promoting = candidates.find(c => c.promote);
    $('promotePiece').textContent = (PIECES[promoting.piece].kanji || promoting.piece) + ' → ' +
      (PIECES[promoting.piece].promotedKanji || '成');
    showOverlay('promotionOverlay');
    vibrate(35);
  });
  on('hint', ({ move }) => {
    play('hint');
    toast(t('hud.move') + ': ' + formatMove(move));
  });
  on('end', ({ reason, winner }) => {
    const win = winner === SENTE;
    $('resultIcon').textContent = reason === 'daily' ? '🧩' : win ? '🏆' : reason === 'sennichite' ? '🤝' : '💀';
    $('resultTitle').textContent = reason === 'daily' ? t('daily.correct')
      : reason === 'sennichite' ? t('hud.draw')
      : win ? t('result.win') : t('result.lose');
    $('resultReason').textContent = t('hud.move') + ': ' + state.records.length + ' · ' + t('result.moves');
    $('resultStats').innerHTML =
      '<div><b>' + state.records.length + '</b><span>' + t('result.moves') + '</span></div>' +
      '<div><b>' + getStats().wins + '</b><span>' + t('stats.wins') + '</span></div>' +
      '<div><b>' + getStats().streak + '</b><span>' + t('stats.streak') + '</span></div>';
    if (win) play('win'); else play('lose');
    vibrate(win ? [40, 60, 40] : [80, 60, 80]);
    setTimeout(() => showOverlay('resultOverlay'), 420);
  });
}

/* ---------------- Init ---------------- */

export function initUI() {
  selected.level = state.settings.level;
  selected.time = state.settings.timeControl;
  selected.theme = state.settings.theme;
  document.body.dataset.theme = selected.theme;

  applyTranslations();
  wireGameEvents();
  attachGestures();
  showOverlay('menuOverlay');

  onLangChange(applyTranslations);

  $('langBtn').addEventListener('click', () => setLang(getLang() === 'it' ? 'en' : 'it'));
  $('startBtn').addEventListener('click', () => {
    unlockAudio();
    setSetting('level', selected.level);
    setSetting('timeControl', selected.time);
    startGame({ mode: selected.mode, level: selected.level, timeControl: selected.time });
    showOverlay(null);
  });
  $('menuBtn').addEventListener('click', () => showOverlay('menuOverlay'));
  $('rulesBtn').addEventListener('click', () => showOverlay('rulesOverlay'));
  $('tutorialBtn').addEventListener('click', () => { tutorialStep = 0; renderTutorial(); showOverlay('tutorialOverlay'); });
  $('settingsBtn').addEventListener('click', () => {
    $('soundToggle').innerHTML = '🔊 ' + t('hud.mute') + ' <b>' + t(isSoundOn() ? 'common.on' : 'common.off') + '</b>';
    $('hapticToggle').innerHTML = '📳 Haptic <b>' + t(isHapticsOn() ? 'common.on' : 'common.off') + '</b>';
    showOverlay('settingsOverlay');
  });
  $('closeSettings').addEventListener('click', () => showOverlay(null));
  $('soundToggle').addEventListener('click', () => {
    setSetting('sound', toggleSound());
    $('settingsBtn').click();
  });
  $('hapticToggle').addEventListener('click', () => {
    setSetting('haptics', toggleHaptics());
    $('settingsBtn').click();
  });

  $('promoteYes').addEventListener('click', () => { resolvePromotion(true); showOverlay(null); });
  $('promoteNo').addEventListener('click', () => { resolvePromotion(false); showOverlay(null); });
  $('tutorialNext').addEventListener('click', () => {
    tutorialStep++;
    if (tutorialStep >= 5) { tutorialStep = 0; showOverlay(null); }
    renderTutorial();
  });
  $('tutorialSkip').addEventListener('click', () => showOverlay(null));
  $('resultAgain').addEventListener('click', () => {
    startGame({ mode: state.mode === 'daily' ? 'daily' : state.mode, level: state.level, timeControl: state.timeControl });
    showOverlay(null);
  });
  $('resultMenu').addEventListener('click', () => showOverlay('menuOverlay'));

  $('hintBtn').addEventListener('click', hint);
  $('undoBtn').addEventListener('click', undo);
  $('redoBtn').addEventListener('click', redo);
  $('flipBtn').addEventListener('click', flip);
  $('resignBtn').addEventListener('click', resign);
  $('pauseBtn').addEventListener('click', () => togglePause());
  $('dailyBtn').addEventListener('click', () => {
    startGame({ mode: 'daily' });
    showOverlay(null);
    toast(getDailyInfo().puzzle.hint);
  });
  $('copyKifuBtn').addEventListener('click', shareKifu);
  $('shareBtn').addEventListener('click', shareKifu);
  $('replayBtn').addEventListener('click', () => {
    const kifu = getKifu();
    if (kifu) { loadKifu(kifu); toast(t('action.replay')); }
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
      tab.classList.add('active');
      $('panel' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)).classList.add('active');
    });
  });

  $('updateBtn').addEventListener('click', () => {
    if (window.__shogiWaitingWorker) window.__shogiWaitingWorker.postMessage({ type: 'SKIP_WAITING' });
    $('updateBar').classList.add('hidden');
  });
}

async function shareKifu() {
  const kifu = getKifu();
  if (!kifu) return;
  const url = location.origin + location.pathname + '#kifu=' + encodeURIComponent(kifu);
  try {
    await navigator.clipboard.writeText(url);
    toast(t('msg.copied'));
  } catch (e) { toast(t('msg.shareUnsupported')); }
  if (navigator.share) {
    try { await navigator.share({ title: 'Shogi kifu', text: 'Shogi kifu', url }); } catch (e) { /* ignore */ }
  }
}

export { renderAll, toast };
