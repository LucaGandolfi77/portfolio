/* GEOM DASH — bootstrap, fixed-timestep loop and run orchestration */

import { W, STEP, CHAPTERS, SKINS, getChapter } from './config.js';
import { state, setSetting, recordRun, getBest, getGhost, saveGhost, resetAll } from './state.js';
import { createPlayer, queueJump, releaseJump, updatePlayer } from './physics.js';
import { createLevel, updateLevel, resetLevel, progressOf, dailySeed } from './level.js';
import { createRenderer } from './render.js';
import { createEffects, burst, updateEffects, addShake, addFlash, resetEffects } from './effects.js';
import { sound } from './audio.js';
import * as UI from './ui.js';

let mode = state.settings.mode || 'endless';
let chapterIndex = state.settings.chapter || 0;
let difficulty = state.settings.difficulty || 'normal';

let level = createLevel({ mode, chapter: chapterIndex, difficulty, seed: 1 });
let player = createPlayer();
let effects = createEffects();
const renderer = createRenderer(document.getElementById('gameCanvas'));

let running = false;
let paused = false;
let last = performance.now();
let accumulator = 0;
let time = 0;
let score = 0;
let nearCount = 0;
let checkpoint = -1;
let usedCheckpoint = false;
let ghostFrames = [];
let ghostPlayback = null;
let ghostClock = 0;

function currentSpeed() {
  return level.diff.speed * level.chapterData.speed;
}

function startRun() {
  const seed = mode === 'daily' ? dailySeed() : Math.floor(Math.random() * 1000000000);
  level = createLevel({ mode, chapter: chapterIndex, difficulty, seed });
  player = createPlayer();
  resetEffects(effects);
  score = 0;
  nearCount = 0;
  checkpoint = -1;
  usedCheckpoint = false;
  ghostFrames = [];
  ghostPlayback = getGhost(mode, chapterIndex);
  ghostClock = 0;
  time = 0;
  accumulator = 0;
  running = true;
  paused = false;
  last = performance.now();
  UI.showScreen('game');
  UI.setMessage(UI.t('ready'));
  sound('click');
}

function finishRun(won) {
  if (!running) return;
  running = false;
  const isRecord = score > getBest(mode, chapterIndex);
  recordRun(mode, chapterIndex, { score, won, near: nearCount, flow: player.flow });
  if (isRecord && ghostFrames.length > 2) saveGhost(mode, chapterIndex, ghostFrames);
  addShake(effects, won ? 0.6 : 1);
  addFlash(effects, won ? '#5ef0a8' : '#ff5b78', 0.3);
  burst(effects, player.x + player.w / 2, player.y + player.h / 2, won ? '#5ef0a8' : '#ff5b78', won ? 60 : 36, 420);
  sound(won ? 'win' : 'hit');
  UI.renderSettings();
  UI.showResults({
    won, score, best: getBest(mode, chapterIndex),
    distance: level.distance, near: nearCount, isRecord, mode
  });
}

function die() {
  if (mode === 'level' && checkpoint >= 0 && !usedCheckpoint) {
    usedCheckpoint = true;
    resetLevel(level, checkpoint);
    player = createPlayer();
    player.doubleUnlocked = ghostFrames.length > 0;
    addShake(effects, 0.6);
    burst(effects, player.x + player.w / 2, player.y + player.h / 2, '#ffd166', 24, 300);
    sound('checkpoint');
    UI.setMessage(UI.t('checkpoint'));
    return;
  }
  finishRun(false);
}

function step(dt) {
  const events = updatePlayer(player, dt, level.diff.gravity, level.obstacles, {
    died: false, near: 0, landed: false, jumped: false, doubled: false, shield: false
  });

  if (events.jumped) { sound('jump'); burst(effects, player.x + player.w / 2, player.y + player.h, '#ffffff', 6, 130); }
  if (events.doubled) { sound('double'); burst(effects, player.x + player.w / 2, player.y + player.h, '#a98bff', 12, 200); }
  if (events.landed) sound('land');
  if (events.near) {
    nearCount += events.near;
    score += 25 * events.near;
    sound('near');
    burst(effects, player.x + player.w, player.y + player.h / 2, '#5ff5ff', 8, 160);
  }
  if (events.shield) {
    sound('shield');
    addFlash(effects, '#ffd166', 0.22);
    UI.toast(UI.t('shield'));
  }
  if (player.flow >= 100 && !player.doubleUnlocked) {
    player.doubleUnlocked = true;
    UI.toast(UI.t('flowFull'));
  }
  if (events.died) { die(); if (!running) return; }

  const result = updateLevel(level, dt, currentSpeed());
  score += result.passed * 10;
  if (result.checkpoint >= 0) {
    checkpoint = result.checkpoint;
    sound('checkpoint');
    UI.toast(UI.t('checkpoint'));
  }
  if (result.finished) { finishRun(true); return; }

  ghostClock += dt;
  if (ghostClock >= 0.05) {
    ghostClock = 0;
    ghostFrames.push({ x: player.x, y: Math.round(player.y * 10) / 10 });
  }

  updateEffects(effects, dt);
  time += dt;
}

function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = Math.min(0.1, (now - last) / 1000);
  last = now;

  if (running && !paused) {
    accumulator += rawDt;
    let steps = 0;
    while (accumulator >= STEP && steps < 8 && running) {
      step(STEP);
      accumulator -= STEP;
      steps++;
    }
  } else {
    updateEffects(effects, rawDt);
  }

  let ghost = null;
  if (ghostPlayback && ghostPlayback.length) {
    const index = Math.min(ghostPlayback.length - 1, Math.floor(time / 0.05));
    ghost = ghostPlayback[index];
  }

  renderer.draw({
    level, player, ghost, effects,
    chapter: level.chapterData,
    skin: state.settings.skin,
    time
  });

  UI.updateHUD({
    score, best: getBest(mode, chapterIndex), near: nearCount,
    flow: player.flow, chapterName: level.chapterData.name,
    progress: progressOf(level), hasProgress: isFinite(level.length) && mode !== 'endless'
  });
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) UI.showScreen('pause');
  else { UI.showScreen('game'); last = performance.now(); accumulator = 0; }
  sound('click');
}

function onKeyDown(e) {
  if (e.target && /INPUT|TEXTAREA|SELECT/i.test(e.target.tagName)) return;
  if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) {
    e.preventDefault();
    if (running && !paused) queueJump(player);
    else if (!running) startRun();
  } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
  else if (e.key === 'r' || e.key === 'R') startRun();
}
function onKeyUp(e) {
  if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key) && running) releaseJump(player);
}

function bindInput() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (running && !paused) queueJump(player);
  });
  window.addEventListener('pointerup', () => { if (running) releaseJump(player); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && !paused) togglePause();
  });
}

function boot() {
  UI.initUI({
    onStart: startRun,
    onPause: togglePause,
    onResume: togglePause,
    onRestart: startRun,
    onMenu: () => { running = false; UI.showScreen('menu'); UI.renderSettings(); },
    onSound: () => { setSetting('sound', !state.settings.sound); UI.renderSettings(); sound('click'); },
    onReset: () => {
      if (window.confirm(UI.t('resetConfirm'))) {
        resetAll();
        mode = state.settings.mode;
        chapterIndex = state.settings.chapter;
        difficulty = state.settings.difficulty;
        UI.renderSettings();
        UI.toast(UI.t('reset'));
      }
    },
    onMode: value => {
      mode = value;
      setSetting('mode', value);
      UI.renderSettings();
      UI.toast(UI.t('mode'));
    },
    onDifficulty: value => {
      difficulty = value;
      setSetting('difficulty', value);
      UI.renderSettings();
    },
    onSkin: value => { setSetting('skin', value); UI.renderSettings(); },
    onChapter: index => {
      chapterIndex = index;
      setSetting('chapter', index);
      UI.renderSettings();
    }
  });
  bindInput();
  UI.renderSettings();
  requestAnimationFrame(frame);
}

boot();
