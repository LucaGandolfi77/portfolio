/* Scale Puzzle — bootstrap and orchestration */
import { MODES, MAX_LEVEL } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, save, setSettings, setStars, setBest, addStats, achievement, resetAll } from './storage.js';
import { Game } from './engine.js';
import { solutionMap, keyOf } from './generator.js';
import { seeded, dailySeed } from './rng.js';
import { Board } from './render.js';
import * as AUDIO from './audio.js';
import { FX } from './fx.js';
import { ui } from './ui.js';

const $ = id => document.getElementById(id);
const board = new Board($('board'));
const fx = new FX();
const game = new Game();
let sound = profile.settings.sound !== false;
let time = 0, previewT = 0, last = 0;
let hintCell = null, boardMessageTimer = null;

game.hooks = {
  onStart: s => {
    ui.renderHUD(s);
    previewT = 0; hintCell = null;
    if (s.status === 'preview') showMessage(t('watch'), s.length);
  },
  onPlay: s => { showMessage(t('go')); setTimeout(() => hideMessage(), 900); },
  onHit: d => {
    const p = board.center(d.cell.r, d.cell.c, d.size);
    fx.burst(p.x, p.y, d.quality === 'perfect' ? '#ffd166' : '#4de8ff', d.quality === 'perfect' ? 22 : 12);
    fx.ripple(p.x, p.y);
    fx.hit(d.quality === 'perfect' ? 5 : 2);
    AUDIO.init(sound); AUDIO.resume();
    (d.quality === 'perfect' ? AUDIO.sfx.perfect : AUDIO.sfx.hit)(d.combo);
    ui.renderHUD(game.snapshot());
  },
  onMiss: d => {
    const p = board.center(d.cell.r, d.cell.c, d.size);
    fx.burst(p.x, p.y, '#ff5470', 14); fx.hit(8); fx.blink(0.25);
    AUDIO.sfx.miss();
    showMessage(t('wrong')); setTimeout(hideMessage, 700);
    ui.renderHUD(game.snapshot());
  },
  onHint: d => {
    hintCell = d.cell;
    AUDIO.sfx.hint();
    setTimeout(() => { hintCell = null; }, 1500);
    ui.renderHUD(game.snapshot());
  },
  onUndo: () => { AUDIO.sfx.undo(); ui.renderHUD(game.snapshot()); },
  onWin: s => {
    setStars(s.level, s.stars);
    setBest(s.mode, s.score);
    addStats({ wins: 1, score: s.score, moves: s.moves, hits: s.hits });
    if (s.stars === 3) achievement('perfect-level');
    if (s.combo >= 10) achievement('combo-10');
    if (s.level >= 20) achievement('level-20');
    AUDIO.sfx.win(); fx.blink(0.4);
    ui.renderStats(); ui.renderLevels();
    ui.showResult(s, 'win');
  },
  onEnd: (s, reason) => {
    addStats({ played: 1, misses: s.misses });
    AUDIO.sfx.lose();
    ui.showResult(s, reason);
  }
};

function showMessage(text) {
  const el = $('boardMessage');
  el.textContent = text; el.classList.remove('hidden');
  clearTimeout(boardMessageTimer);
}
function hideMessage() { $('boardMessage').classList.add('hidden'); }

function playLevel(level, mode = profile.settings.mode, diff = profile.settings.difficulty) {
  const seed = mode === 'daily' ? dailySeed() : null;
  game.start(level, mode, diff, seed);
  profile.lastLevel = level; save();
  ui.renderLevels();
}
function next() {
  const s = game.snapshot();
  if (s.status === 'complete') playLevel(s.level + 1);
  else if (s.status === 'gameover') playLevel(s.level);
  else ui.toast(t('continue'));
}
function setMode(mode) { setSettings({ mode }); playLevel(game.level || 1, mode); ui.renderHUD(game.snapshot()); }
function setDifficulty(diff) { setSettings({ difficulty: diff }); playLevel(game.level || 1, game.mode, diff); ui.renderHUD(game.snapshot()); }
function toMenu() {
  game.status = 'menu';
  ui.renderHUD(game.snapshot());
}

$('board').addEventListener('pointerdown', e => {
  AUDIO.resume();
  const r = board.canvas.getBoundingClientRect();
  const cell = board.hitTest(e.clientX - r.left, e.clientY - r.top, game.snapshot().size);
  if (cell) game.tap(cell);
});

initLang(detect());
ui.initUI({
  undo: () => game.undo(),
  hint: () => game.hint(),
  next, playLevel, setMode, setDifficulty, toMenu,
  currentLevel: () => game.level,
  sound: () => {
    sound = !sound; setSettings({ sound }); AUDIO.setSound(sound);
    $('soundBtn').textContent = sound ? '♪' : '✕';
  },
  lang: () => setLang(getLang() === 'it' ? 'en' : 'it'),
  reset: () => { resetAll(); playLevel(1); ui.renderLevels(); ui.renderStats(); ui.renderModePicker(); ui.renderDifficulty(); }
});
AUDIO.init(sound);
$('soundBtn').textContent = sound ? '♪' : '✕';
playLevel(profile.lastLevel || 1);
ui.renderHUD(game.snapshot());

function frame(now) {
  requestAnimationFrame(frame);
  if (!last) last = now;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;
  game.tick(dt);
  if (game.status === 'preview') {
    previewT += dt / (MODES.find(m => m.id === game.mode) ? (game.difficulty === 'hard' ? 2 : game.difficulty === 'easy' ? 4 : 3) : 3);
    if (previewT >= 1) game.beginPlay();
  }
  fx.update(dt);
  const s = game.snapshot();
  board.draw({
    size: s.size, status: s.status, sequence: s.sequence,
    showPattern: game.mode === 'classic' || game.mode === 'speed',
    completed: s.sequence.slice(0, s.progress).map(keyOf),
    solution: solutionMap({ sequence: s.sequence }),
    previewProgress: previewT, hint: hintCell, time
  }, fx);
  if (game.status !== 'menu') ui.renderHUD(s);
}
requestAnimationFrame(frame);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
