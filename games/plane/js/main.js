/* Sky Ace — bootstrap, fixed-step loop and orchestration */

import { LEVELS, STR, DIFFICULTY } from './config.js';
import { state, save, recordRun } from './state.js';
import { Engine } from './engine.js';
import { Renderer } from './render.js';
import { Effects } from './effects.js';
import { Input } from './input.js';
import { UI } from './ui.js';
import * as AUDIO from './audio.js';

const STEP = 1 / 60;
const MAX_STEPS = 6;

const canvas = document.getElementById('game');
const renderer = new Renderer(canvas);
const effects = new Effects();
const input = new Input(canvas);
const ui = new UI();

let pendingLevel = 0;
let levelStartScore = 0;
let campaignScore = 0;
let runTotals = { kills: 0, shots: 0, hits: 0 };
let levelStartTotals = { ...runTotals };
let last = 0;
let accumulator = 0;

const engine = new Engine({ onEvent, onStatus });
engine.setInput(input);
const view = renderer.resize();
engine.setViewport(view.w, view.h);

function t(key) { return ui.t(key); }

function onEvent(type, data) {
  switch (type) {
    case 'shot': AUDIO.sfx.shoot(); break;
    case 'bossshot': AUDIO.sfx.enemyshot(); break;
    case 'explosion':
      if (data.count >= 18) effects.addShake(Math.min(9, data.count * 0.18));
      break;
    case 'bombexplode':
      effects.addShake(16); effects.addFlash(0.4, '#ff9f68'); AUDIO.sfx.explosion();
      break;
    case 'damage':
      effects.addShake(8); effects.addFlash(0.22, '#ff4d6d'); AUDIO.sfx.damage();
      break;
    case 'shieldblock':
      effects.addFlash(0.16, '#4de8ff'); AUDIO.sfx.shield();
      break;
    case 'bossHit': AUDIO.sfx.hit(); break;
    case 'bossdown':
      effects.addShake(22); effects.addFlash(0.55, data.color || '#ff6b9d');
      AUDIO.sfx.boss(); ui.toast(t('bossDown'), '#ffd166');
      break;
    case 'combo':
      AUDIO.sfx.combo(); ui.toast(`${t('comboMsg')} ×${data.value}`, '#ffd166');
      break;
    case 'flip':
      AUDIO.sfx.flip(); ui.toast(t('flipMsg'), '#4de8ff');
      break;
    case 'nobombs': ui.toast(t('noBombs'), '#ff6b9d'); break;
    case 'float': effects.floatText(data.x, data.y, data.text, data.color); break;
    case 'pickup': {
      const names = { repair: 'repaired', shield: 'shieldUp', bomb: 'bombUp', rapid: 'rapidUp' };
      AUDIO.sfx.pickup();
      effects.floatText(data.x, data.y, t(names[data.type]), data.color);
      ui.toast(t(names[data.type]), data.color);
      break;
    }
    case 'levelstart': {
      const name = LEVELS[data.level - 1]
        ? (state.lang === 'it' ? STR.it.levelNamesIt[data.level - 1] : STR.en.levelNames[data.level - 1])
        : '';
      ui.toast(`${t('mission')} ${data.level} · ${name}`, '#4de8ff');
      break;
    }
  }
}

function bankStats() {
  runTotals.kills += engine.kills;
  runTotals.shots += engine.shots;
  runTotals.hits += engine.hits;
}

function resetRun() {
  runTotals = { kills: 0, shots: 0, hits: 0 };
  levelStartTotals = { ...runTotals };
  campaignScore = 0;
}

function record(won) {
  const totals = {
    kills: runTotals.kills + engine.kills,
    shots: runTotals.shots + engine.shots,
    hits: runTotals.hits + engine.hits
  };
  const isRecord = recordRun({
    score: engine.score, difficulty: state.difficulty,
    level: engine.levelIndex + 1, ...totals, won
  });
  runTotals = { kills: 0, shots: 0, hits: 0 };
  return isRecord;
}

function onStatus(status) {
  if (status === 'levelcomplete') {
    campaignScore = engine.score;
    AUDIO.stopMusic();
    AUDIO.sfx.levelclear();
    effects.addFlash(0.28, '#5ef0a8');
    ui.showLevelComplete(engine);
  } else if (status === 'gameover') {
    const isRecord = record(false);
    AUDIO.stopMusic(); AUDIO.sfx.gameover();
    effects.addFlash(0.4, '#ff4d6d'); effects.addShake(18);
    ui.showGameOver(engine, isRecord);
  } else if (status === 'victory') {
    const isRecord = record(true);
    AUDIO.stopMusic(); AUDIO.sfx.victory();
    effects.addFlash(0.6, '#ffd166');
    ui.showVictory(engine, isRecord);
  }
}

function startLevel(index, carryScore) {
  pendingLevel = index;
  levelStartScore = carryScore;
  campaignScore = carryScore;
  levelStartTotals = { ...runTotals };
  input.clear();
  effects.shake = 0; effects.flash = 0; effects.floaters.length = 0;
  engine.start(index, state.difficulty, carryScore);
  AUDIO.resume();
  AUDIO.startMusic();
  ui.hideOverlays();
  accumulator = 0;
}

function togglePause() {
  if (engine.status === 'playing') {
    engine.status = 'paused';
    input.clear();
    AUDIO.stopMusic();
    ui.showPause();
  } else if (engine.status === 'paused') {
    engine.status = 'playing';
    AUDIO.resume(); AUDIO.startMusic();
    ui.hideOverlays();
    last = 0;
    accumulator = 0;
  }
}

function quitToMenu() {
  if (engine.status === 'playing' || engine.status === 'paused' || engine.status === 'levelcomplete') {
    if (engine.score > 0) record(false);
  }
  engine.status = 'menu';
  input.clear();
  AUDIO.stopMusic();
  ui.renderRecords();
  ui.showOverlay('menuOverlay');
}

const callbacks = {
  onCampaign: () => { resetRun(); ui.showBrief(0); },
  onLaunch: () => startLevel(pendingLevel, campaignScore),
  onResume: () => { if (engine.status === 'paused') togglePause(); },
  onRestart: () => { runTotals = { ...levelStartTotals }; startLevel(engine.levelIndex, levelStartScore); },
  onRetry: () => { runTotals = { ...levelStartTotals }; startLevel(engine.levelIndex, levelStartScore); },
  onNext: () => {
    bankStats();
    const next = Math.min(LEVELS.length - 1, engine.levelIndex + 1);
    pendingLevel = next;
    ui.showBrief(next);
  },
  onAgain: () => { resetRun(); ui.showBrief(0); },
  onQuit: quitToMenu,
  onLanguage: () => { /* HUD strings refresh in the next frame */ }
};

function frame(now) {
  requestAnimationFrame(frame);
  if (!last) last = now;
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.1) dt = 0.1;

  if (input.consume('pause')) togglePause();

  if (engine.status === 'playing') {
    accumulator += dt;
    let steps = 0;
    while (accumulator >= STEP && steps < MAX_STEPS) {
      engine.update();
      effects.update();
      accumulator -= STEP;
      steps++;
      if (engine.status !== 'playing') break;
    }
  } else {
    effects.update();
    accumulator = 0;
  }

  renderer.draw(engine, effects);
  ui.updateHUD(engine);
}

window.addEventListener('resize', () => {
  const v = renderer.resize();
  engine.resize(v.w, v.h);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && engine.status === 'playing') togglePause();
});

function boot() {
  ui.init(callbacks);
  AUDIO.setSound(state.sound);
  ui.showOverlay('menuOverlay');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }
  requestAnimationFrame(frame);
}

boot();
