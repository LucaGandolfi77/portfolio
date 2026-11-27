/* ===== MORFALIA · Bootstrap & Main Game Loop ===== */
import { createInitialState, GameSimulation } from './engine/simulation.js';
import { WorldRenderer } from './engine/renderer.js';
import { InputController } from './ui/input.js';
import { HudController } from './ui/hud.js';
import { hasSave, getSaveSummary, loadGame, clearSave, saveGame } from './engine/storage.js';
import { sound } from './engine/audio.js';
import { REGIONS } from './data/config.js';

let sim = null;
let renderer = null;
let input = null;
let hud = null;
let running = false;
let lastTs = 0;
let hudTickTimer = 0;
let deferredPrompt = null;

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Morfalia SW register skipped:', err);
    });
  }
}

function setupInstallPrompt() {
  const btnInstall = document.getElementById('btn-install');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btnInstall.classList.remove('hidden');
  });
  btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    btnInstall.classList.add('hidden');
  });
}

function startSession(loadedState = null) {
  const state = loadedState || createInitialState();
  const canvas = document.getElementById('game-canvas');
  if (!renderer) renderer = new WorldRenderer(canvas);

  sim = new GameSimulation(state, {
    onToast: (msg, gold) => hud && hud.toast(msg, gold),
    onDialog: (entries, onDone) => hud && hud.openDialog(entries, onDone),
    onHudDirty: () => hud && hud.refreshHud(),
    onOpenPanel: (panel, tab) => hud && hud.openPanel(panel, tab)
  });

  const onReset = () => {
    running = false;
    document.getElementById('title-screen').classList.remove('hidden');
    refreshTitleScreen();
  };

  if (!hud) {
    hud = new HudController(sim, onReset);
  } else {
    hud.setSim(sim, onReset);
  }

  if (!input) {
    input = new InputController(canvas, renderer, sim, () => !running || hud.isModalOpen());
  } else {
    input.sim = sim;
    input.renderer = renderer;
  }

  document.getElementById('title-screen').classList.add('hidden');
  hud.showHud();
  sound.unlock();

  // Trigger Chapter 1 opening story on fresh game
  if (!state.seenChapters.includes(1)) {
    sim.triggerChapterIntro(1);
    saveGame(state);
  }

  running = true;
  lastTs = performance.now();
  requestAnimationFrame(loop);
}

function loop(ts) {
  if (!running) return;
  const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
  lastTs = ts;

  if (!hud.isModalOpen()) {
    const mv = input.getMoveVector();
    if (mv.dx !== 0 || mv.dy !== 0) {
      sim.movePlayerBy(mv.dx, mv.dy, dt);
    }
    sim.update(dt);
  }

  renderer.render(sim, dt, input.joystick);

  hudTickTimer += dt;
  if (hudTickTimer >= 0.45) {
    hudTickTimer = 0;
    hud.refreshHud();
  }

  requestAnimationFrame(loop);
}

function refreshTitleScreen() {
  const btnContinue = document.getElementById('btn-continue');
  const btnNew = document.getElementById('btn-new-game');
  const metaEl = document.getElementById('continue-meta');

  if (hasSave()) {
    const info = getSaveSummary();
    const reg = REGIONS.find((r) => r.id === info?.regionId);
    btnContinue.classList.remove('hidden');
    btnNew.classList.add('secondary-style');
    metaEl.textContent = info
      ? `Cap. ${info.chapter} · Giorno ${info.day} · ${reg ? reg.name : 'Landa'} · ${info.befriended} Biomini`
      : '';
  } else {
    btnContinue.classList.add('hidden');
    btnNew.classList.remove('secondary-style');
  }
}

function init() {
  registerServiceWorker();
  setupInstallPrompt();
  refreshTitleScreen();

  // Preview animated canvas gently behind title screen
  const canvas = document.getElementById('game-canvas');
  const previewRenderer = new WorldRenderer(canvas);
  const previewSim = new GameSimulation(createInitialState());
  previewRenderer.render(previewSim, 0.016);

  window.addEventListener('resize', () => {
    if (renderer) renderer.resize();
    else previewRenderer.resize();
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    const saved = loadGame();
    startSession(saved || createInitialState());
  });

  document.getElementById('btn-new-game').addEventListener('click', () => {
    if (hasSave() && !confirm('Iniziare una nuova avventura sovrascriverà il salvataggio attuale. Procedere?')) {
      return;
    }
    clearSave();
    startSession(createInitialState());
  });

  document.getElementById('btn-how-to').addEventListener('click', () => {
    if (!hud) hud = new HudController(previewSim, null);
    hud.openPanel('help');
  });
}

document.addEventListener('DOMContentLoaded', init);
