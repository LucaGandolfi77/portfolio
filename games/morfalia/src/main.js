/* ===== MORFALIA 3D · Bootstrap & Main Game Loop ===== */
import { createInitialState, GameSimulation } from './engine/simulation.js';
import { WorldRenderer3D } from './engine/renderer3d.js';
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
let previewSim = null;
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
  const overlay = document.getElementById('overlay-canvas');
  if (!renderer) renderer = new WorldRenderer3D(canvas, overlay);
  renderer.camAngleIndex = 0;
  renderer.targetCamYaw = 0;

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

  if (!state.seenChapters.includes(1)) {
    sim.triggerChapterIntro(1);
    saveGame(state);
  }

  running = true;
}

function loop(ts) {
  const dt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
  lastTs = ts;

  if (running && sim && renderer && hud) {
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
  } else if (renderer && previewSim) {
    // Gentle orbiting 3D diorama preview behind the title screen!
    renderer.targetCamYaw += dt * 0.14;
    renderer.render(previewSim, dt, null);
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

  const canvas = document.getElementById('game-canvas');
  const overlay = document.getElementById('overlay-canvas');
  renderer = new WorldRenderer3D(canvas, overlay);
  previewSim = new GameSimulation(createInitialState());

  window.addEventListener('resize', () => {
    if (renderer) renderer.resize();
  });

  document.getElementById('btn-cam-rotate').addEventListener('click', () => {
    if (renderer) {
      renderer.rotateCamera();
      hud && hud.toast('🎥 Visuale 3D ruotata');
    }
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

  lastTs = performance.now();
  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', init);
