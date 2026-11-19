/* CDD RUN — bootstrap and orchestration */

import { meta, setHighScore, setMuted, setLang, saveSession } from './state.js';
import { World } from './world.js';
import { createRenderer } from './render.js';
import { initInput } from './input.js';
import { sfx, ensureAudio } from './audio.js';
import * as FX from './effects.js';
import { UI } from './ui.js';

let paused = false;
let last = 0;
let raf = 0;

const canvas = document.getElementById('game');
const world = new World(onEvent);
const renderer = createRenderer(canvas, world);

const ui = new UI({
  onStart: () => startGame(),
  onTutorial: () => ui.showScreen('tutorial'),
  onTutorialClose: () => ui.showScreen('start'),
  onResume: () => resumeGame(),
  onRestart: () => startGame(),
  onPause: () => togglePause(),
  onQuit: () => quit(),
  onMute: () => {
    setMuted(!meta.muted);
    ui.setMuted(meta.muted);
    if (!meta.muted) ensureAudio();
  },
  onLang: lang => {
    setLang(lang);
    ui.applyLang(lang);
    ui.setBest(meta.highScore);
  },
  onLangSaved: lang => setLang(lang)
});

ui.init();
ui.showScreen('start');

initInput({
  audio: ensureAudio,
  isRunning: () => world.running && !paused,
  lane: dir => world.lane(dir),
  jump: () => world.jump(),
  primary: () => {
    if (world.running) { if (paused) resumeGame(); return; }
    if (ui.el.overScreen.classList.contains('hidden') === false) startGame();
    else if (ui.el.tutorialScreen.classList.contains('hidden') === false) ui.showScreen('start');
    else startGame();
  },
  pause: () => togglePause(),
  restart: () => { if (world.running || !ui.el.overScreen.classList.contains('hidden')) startGame(); }
});

function startGame() {
  ensureAudio();
  paused = false;
  FX.clear();
  world.start();
  ui.setPaused(false);
  ui.showScreen(null);
  last = performance.now();
}

function togglePause() {
  if (!world.running) return;
  paused = !paused;
  ui.setPaused(paused);
  sfx('pause');
  ui.showScreen(paused ? 'pause' : null);
  last = performance.now();
}

function resumeGame() {
  if (!world.running || !paused) return;
  paused = false;
  ui.setPaused(false);
  ui.showScreen(null);
  last = performance.now();
}

function quit() {
  try { sessionStorage.setItem('index_scroll', String(window.scrollY || 0)); } catch (e) { /* ignore */ }
  try {
    if (window.history && window.history.length > 1) window.history.back();
    else if (document.referrer) window.location.href = document.referrer;
    else window.location.href = '../index.html';
  } catch (e) { window.location.href = '../index.html'; }
}

function onEvent(event) {
  const pos = world.project(world.player.lane, 0);
  switch (event.type) {
    case 'start':
      sfx('start');
      break;
    case 'lane':
      sfx('lane');
      break;
    case 'jump':
      sfx('jump');
      FX.burst(pos.x, pos.y + 6, '#a5b4fc', 5, 60);
      break;
    case 'coin':
      FX.burst(pos.x, pos.y - 40, '#ffd166', 9, 120);
      FX.floatText(pos.x, pos.y - 60, '+' + (100 * event.multiplier), '#ffd166');
      if (event.combo % 5 === 0) { sfx('combo'); FX.floatText(pos.x, pos.y - 88, '×' + event.multiplier, '#a98bff'); }
      else sfx('coin');
      break;
    case 'near':
      sfx('near');
      FX.floatText(pos.x, pos.y - 70, '+30 NEAR', '#6ee7ff');
      break;
    case 'powerup': {
      const colors = { shield: '#38bdf8', magnet: '#a855f7', turbo: '#f43f5e' };
      FX.burst(pos.x, pos.y - 40, colors[event.powerup] || '#fff', 24, 180);
      FX.flash(colors[event.powerup] || '#fff', 0.2);
      sfx('power');
      break;
    }
    case 'shieldBreak':
      FX.burst(pos.x, pos.y - 40, '#38bdf8', 28, 210);
      FX.flash('#38bdf8', 0.26);
      FX.shake(0.7);
      sfx('shield');
      break;
    case 'level':
      FX.floatText(world.dims.w / 2, world.dims.horizon + 40, 'LEVEL ' + event.level, '#5ef0a8');
      sfx('level');
      break;
    case 'gameover':
      saveSession(world.session());
      const record = setHighScore(world.score);
      ui.setBest(meta.highScore);
      FX.shake(1);
      FX.flash('#ff6b7d', 0.36);
      FX.burst(pos.x, pos.y - 40, '#f43f5e', 34, 230);
      sfx('over');
      ui.showOver(world.session(), record);
      break;
  }
}

function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
  last = now;
  if (world.running && !paused) world.update(dt);
  FX.update(dt);
  renderer.draw(FX);
  if (world.running) ui.updateHUD(world);
}

window.addEventListener('resize', () => renderer.resize());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && world.running && !paused) togglePause();
});

raf = requestAnimationFrame(loop);
