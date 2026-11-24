/**
 * main.js — Battleship Commander: state machine, fixed timestep, PWA e salvataggi.
 */

import { MODES, MISSIONS, SHIPS, DEFAULT_SETTINGS, STORAGE_KEY, FIXED_DT, findMission, findMode } from './config.js';
import { createWorld, stepWorld, adaptiveDifficulty, clamp, rngFromSeed } from './sim.js';
import { modeConfig, dailySeed, starsFor, nextMissionId, objectiveProgress } from './missions.js';
import { normalizeSave, applyMissionResult, totalStars, isUnlocked } from './economy.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { showOverlay, toast, renderMenu, renderHUD, renderResult } from './ui.js';
import { load, store } from '../../_kit/storage.js';
import { createMetaLayer } from '../../_kit/meta-layer.js';
import { createCampaign } from '../../_kit/campaign.js';
import * as audioKit from '../../_kit/audio.js';
import { FX } from '../../_kit/fx.js';
import { registerSW, setupCanvas } from '../../_kit/pwa.js';

const $ = (id) => document.getElementById(id);
const view = setupCanvas($('gameCanvas'));
const renderer = createRenderer(view.ctx);
const fx = new FX();

const saved = load(STORAGE_KEY, {});
const save = normalizeSave(saved.settings || {});
const settings = { ...DEFAULT_SETTINGS, ...(saved.settings2 || {}) };

const meta = createMetaLayer({
  key: 'battleship.meta.v1',
  missions: MISSIONS.map((mission) => ({ id: mission.id, event: 'sink', goal: mission.objective.target || 3, label: mission.name, reward: 40 })),
  achievements: [
    { id: 'wins10', event: 'win', goal: 10, label: '10 victories', reward: 200 },
    { id: 'runs25', event: 'game', goal: 25, label: '25 battles', reward: 150 }
  ]
});
const campaign = createCampaign({ key: 'battleship.campaign.v1' });

const state = {
  phase: 'menu',
  mode: 'campaign',
  mission: 'm01',
  ship: save.ship || 'scout',
  world: null,
  config: null,
  score: 0
};

const input = createInput({
  canvas: $('gameCanvas'),
  stick: $('stick-area'),
  fireButton: $('fire-btn'),
  settings,
  onPause: () => { if (state.phase === 'playing') pause(); }
});
const camera = { x: 0, y: 0 };
let accumulator = 0, lastFrame = performance.now(), saveTimer = 0, running = false;

function persist() {
  store(STORAGE_KEY, { ...load(STORAGE_KEY, {}), settings: save, settings2: settings, run: state.world ? snapshot(state.world) : null });
}

function snapshot(world) {
  return {
    mode: state.mode, mission: state.mission, ship: state.ship,
    seed: world.seed, time: world.time, difficulty: world.difficulty,
    stats: { ...world.stats },
    player: { x: world.player.x, y: world.player.y, angle: world.player.angle, hp: world.player.hp },
    enemies: world.enemies.map((enemy) => ({ id: enemy.id, x: enemy.x, y: enemy.y, angle: enemy.angle, hp: enemy.hp, boss: !!enemy.boss })),
    islands: world.islands
  };
}

function createMissionForMode() {
  if (state.mode === 'campaign') return findMission(state.mission);
  const config = modeConfig(state.mode);
  return {
    id: state.mode,
    name: config.name,
    desc: config.desc,
    objective: config.objective,
    mods: state.mode === 'bosshunt' ? ['boss', 'leviathan'] : [],
    stars: [20, 40, 60]
  };
}

function buildWorld(snapshotData = null) {
  const seed = snapshotData ? snapshotData.seed : (state.mode === 'daily' ? dailySeed() : Math.floor(Math.random() * 1e9));
  const world = createWorld({
    missionId: state.mission,
    mode: state.mode,
    seed,
    shipId: state.ship,
    difficulty: snapshotData ? snapshotData.difficulty : settings.difficulty
  });
  world.mission = createMissionForMode();
  if (snapshotData) {
    world.time = snapshotData.time;
    world.stats = { ...world.stats, ...snapshotData.stats };
    Object.assign(world.player, snapshotData.player);
    world.difficulty = snapshotData.difficulty;
    world.islands = snapshotData.islands || world.islands;
    world.enemies = snapshotData.enemies.map((enemy) => ({
      id: enemy.id, x: enemy.x, y: enemy.y, angle: enemy.angle, hp: enemy.hp, maxHp: enemy.hp,
      speed: 2.8, state: 'patrol', stateTimer: 1, cooldown: 1, boss: enemy.boss, phase: 1,
      damage: 1, reload: 0.8
    }));
  }
  return world;
}

function refreshMenu() {
  renderMenu(state, save, handlers);
  $('hudShip').textContent = (SHIPS.find((ship) => ship.id === state.ship) || SHIPS[0]).emoji + ' ' + (SHIPS.find((ship) => ship.id === state.ship) || SHIPS[0]).name;
}

const handlers = {
  onMode(mode) { state.mode = mode; refreshMenu(); audioKit.sfx.tap(); },
  onMission(id) { state.mission = id; refreshMenu(); audioKit.sfx.tap(); },
  onShip(id) { if (!isUnlocked(id, save)) return; state.ship = id; refreshMenu(); audioKit.sfx.tap(); }
};

function startRun(useSave = false) {
  const stored = useSave && saved.run ? saved.run : null;
  if (stored) { state.mode = stored.mode || state.mode; state.mission = stored.mission || state.mission; state.ship = stored.ship || state.ship; }
  state.world = buildWorld(stored);
  state.config = state.mode === 'campaign' ? state.world.mission : findMode(state.mode);
  state.score = state.world.stats.score || 0;
  state.phase = 'playing';
  showOverlay('menuOverlay', false);
  showOverlay('pauseOverlay', false);
  showOverlay('resultOverlay', false);
  camera.x = state.world.player.x;
  camera.y = state.world.player.y;
  accumulator = 0;
  lastFrame = performance.now();
  audioKit.resume();
  if (!running) { running = true; requestAnimationFrame(loop); }
  toast(useSave ? 'Battle resumed' : 'Set sail!');
}

function pause() {
  state.phase = 'paused';
  showOverlay('pauseOverlay', true);
  persist();
}

function resume() {
  state.phase = 'playing';
  showOverlay('pauseOverlay', false);
  lastFrame = performance.now();
}

function toMenu() {
  state.phase = 'menu';
  state.world = null;
  persist();
  refreshMenu();
  showOverlay('menuOverlay', true);
  showOverlay('pauseOverlay', false);
  showOverlay('resultOverlay', false);
}

function finish(won) {
  if (state.phase !== 'playing') return;
  state.phase = 'result';
  const world = state.world;
  const missionId = state.mode === 'campaign' ? state.mission : state.mode;
  const stars = won ? starsFor(world.mission, { score: state.score }) : 0;
  const outcome = applyMissionResult(save, missionId, stars, state.score);
  Object.assign(save, outcome.save);
  meta.record('game');
  if (won) meta.record('win');
  campaign.result(won ? 'win' : 'loss');
  persist();
  renderResult({
    won, score: state.score, stars, reward: outcome.reward,
    nextId: won && state.mode === 'campaign' ? nextMissionId(state.mission) : null,
    mission: state.world.mission
  }, { onNext: (id) => { state.mission = id; startRun(); } });
  showOverlay('resultOverlay', true);
  audioKit.sfx[won ? 'win' : 'lose']();
}

function handleEvents(events) {
  for (const event of events) {
    if (event.type === 'shoot') { audioKit.tone(320, 0.06, 'square', 0.08, -120); input.haptic(8); }
    if (event.type === 'sink') {
      fx.burst(event.enemy.x, event.enemy.y, '#ffd166', 18, 5);
      fx.float(event.enemy.x, event.enemy.y, '+100', '#ffd166');
      audioKit.sfx.good();
      meta.record('sink');
    }
    if (event.type === 'playerHit') { fx.hit(7); fx.blink(0.25, '#ff5f6d'); input.haptic(40); audioKit.noise(0.18, 0.22); }
    if (event.type === 'bossPhase') { toast('BOSS PHASE 2!'); fx.blink(0.35, '#ff6b9d'); }
    if (event.type === 'objective') finish(true);
    if (event.type === 'gameOver') finish(false);
    if (event.type === 'convoyLost') finish(false);
  }
}

function loop(now) {
  if (!running) return;
  requestAnimationFrame(loop);
  if (state.phase !== 'playing') { lastFrame = now; return; }
  const delta = Math.min(0.1, (now - lastFrame) / 1000);
  lastFrame = now;
  accumulator += delta;
  const world = state.world;
  let steps = 0;
  while (accumulator >= FIXED_DT && steps++ < 6) {
    const control = input.input(world);
    handleEvents(stepWorld(world, control, FIXED_DT));
    accumulator -= FIXED_DT;
    if (state.phase !== 'playing') break;
  }
  world.stats.score = Math.max(world.stats.score || 0, world.stats.sunk * 100 + world.stats.hits * 12 + Math.floor(world.stats.time * 2));
  state.score = world.stats.score;
  fx.update();
  adaptiveDifficulty(world, world.stats.shots ? clamp(world.stats.hits / world.stats.shots, 0, 1) : 0.5);

  camera.x += (world.player.x - camera.x) * 0.12;
  camera.y += (world.player.y - camera.y) * 0.12;
  const shake = fx.offset();
  view.ctx.save();
  view.ctx.translate(shake.x, shake.y);
  renderer.render(world, { x: camera.x + shake.x, y: camera.y + shake.y }, view.w, view.h, fx, { minimap: settings.minimap });
  view.ctx.restore();
  renderHUD(world, state.config, settings);

  saveTimer += delta;
  if (saveTimer > 3) { saveTimer = 0; persist(); }
}

function bindUI() {
  $('btnStart').addEventListener('click', () => startRun());
  $('btnPause').addEventListener('click', pause);
  $('btnResume').addEventListener('click', resume);
  $('btnRestart').addEventListener('click', () => startRun());
  $('btnMenu').addEventListener('click', toMenu);
  $('resultMenu').addEventListener('click', toMenu);
  $('btnSettings').addEventListener('click', () => $('settingsPanel').classList.toggle('hidden'));

  const toggles = [
    ['soundToggle', 'sound', (value) => audioKit.setSound(value)],
    ['hapticsToggle', 'haptics'], ['autoFireToggle', 'autoFire'],
    ['aimToggle', 'aimAssist'], ['minimapToggle', 'minimap']
  ];
  toggles.forEach(([id, key, apply]) => {
    const node = $(id);
    node.checked = !!settings[key];
    node.addEventListener('change', () => {
      settings[key] = node.checked;
      if (apply) apply(node.checked);
      persist();
    });
  });
  $('diffSelect').value = String(settings.difficulty);
  $('diffSelect').addEventListener('change', (event) => { settings.difficulty = Number(event.target.value); persist(); });

  let deferred = null;
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferred = event; $('installBtn').classList.remove('hidden'); });
  $('installBtn').addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    $('installBtn').classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => $('installBtn').classList.add('hidden'));

  onLanguageChangeBind();
}

function onLanguageChangeBind() { /* interfaccia in inglese, nessun toggle lingua */ }

function init() {
  audioKit.init(settings.sound);
  bindUI();
  refreshMenu();
  showOverlay('menuOverlay', true);
  if (saved.run && Object.keys(saved.run).length) toast('Save found — press SAIL OUT to resume');
  registerSW();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) $('updateBar').classList.remove('hidden');
        });
      });
    }).catch(() => {});
  }
  $('updateBtn').addEventListener('click', () => {
    navigator.serviceWorker.getRegistration().then((registration) => { if (registration && registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' }); });
    location.reload();
  });
  window.addEventListener('beforeunload', persist);
}

init();
window.__BATTLE__ = { state, save, settings, startRun, finish, persist, campaign, meta };
