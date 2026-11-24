/**
 * main.js — Orto Magico: loop idle, modalità, PWA e UI.
 */

import { STORAGE_KEY, SEEDS, ACHIEVEMENTS, findSeed } from './config.js';
import {
  defaultState, normalizeState, createPlot, plant, water, harvest, tick,
  buyPlot, buyUpgrade, claimAchievement, offlineReport
} from './garden.js';
import { modeEnv, dailySeed, seasonForDate, weatherForDate, timeAttackConfig, modeGoal } from './modes.js';
import { updateStreak, shareText } from './progress.js';
import { share } from './share.js';
import { createAudio } from './audio.js';
import { renderAll, toast, showOverlay, showTab } from './ui.js';

const $ = (id) => document.getElementById(id);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    return normalizeState({ ...defaultState(), ...saved });
  } catch (e) { return defaultState(); }
}

let state = loadState();
let env = modeEnv(state);
const audio = createAudio({ enabled: state.sound !== false, haptics: state.haptics !== false });
let lastTick = Date.now();
let timeLeft = 60, timeRunning = false, sessionHarvests = 0;

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) {}
}

function refresh() {
  env = modeEnv(state);
  renderAll(state, env, handlers);
}

function updateEnv(partial) {
  state = { ...state, ...partial };
  refresh();
  persist();
}

const handlers = {
  onMode(id) { updateEnv({ mode: id }); toast('Modalità: ' + id.toUpperCase()); if (id === 'daily') handleDaily(); },
  onSeason(id) { updateEnv({ season: id, mode: 'seasons' }); audio.plant(); },
  onWeather(id) { updateEnv({ weather: id }); audio.water(); },
  onSpirit(id) {
    const list = state.spirits || [];
    updateEnv({ spirits: list.includes(id) ? list.filter((item) => item !== id) : [...list, id].slice(-2) });
    audio.achieve();
  },
  onPlant(index, seedId) {
    if (!plant(state, index, seedId)) { toast('Non puoi piantare questa varietà'); return; }
    audio.plant();
    refresh(); persist();
  },
  onWater(index) {
    if (!water(state, index)) { toast('Acqua già piena'); return; }
    audio.water();
    refresh(); persist();
  },
  onHarvest(index) {
    const result = harvest(state, index, env);
    if (!result) { toast('Non è ancora pronta'); return; }
    sessionHarvests += 1;
    audio.harvest();
    toast(`+${result.coins} 🪙 · +${result.gems} 💎`);
    checkGoals();
    checkModeGoal();
    refresh(); persist();
  },
  onUpgrade(id) {
    if (!buyUpgrade(state, id)) { toast('Risorse insufficienti'); return; }
    audio.buy();
    toast('Potenziamento attivato!');
    refresh(); persist();
  },
  onClaim(id) {
    if (!claimAchievement(state, id)) return;
    audio.achieve();
    toast('Obiettivo riscattato!');
    refresh(); persist();
  }
};

function checkGoals() {
  ACHIEVEMENTS.forEach((achievement) => {
    if (state.achievements[achievement.id]) return;
    if ((state[achievement.field] || 0) >= achievement.goal) {
      claimAchievement(state, achievement.id);
      toast(achievement.emoji + ' ' + achievement.name);
      audio.achieve();
    }
  });
}

function checkModeGoal() {
  const goal = modeGoal(state.mode);
  if (!goal) return;
  if (state.mode === 'time') {
    $('timeLabel').textContent = `${sessionHarvests}/${goal} raccolti · ${Math.max(0, Math.ceil(timeLeft))}s`;
    if (sessionHarvests >= goal) endChallenge(true);
  } else if (sessionHarvests >= goal) {
    endChallenge(true);
  }
}

function handleDaily() {
  const today = dailySeed();
  if (state.streak.last === today) return;
  state = updateStreak(state, today);
  toast('🔥 Serie giornaliera: ' + state.streak.count);
  persist();
}

function endChallenge(won) {
  timeRunning = false;
  $('endTitle').textContent = won ? 'Sfida completata!' : 'Tempo scaduto!';
  $('endText').textContent = `${sessionHarvests} raccolti · ${state.totalHarvests} totali · ${state.coins} monete`;
  showOverlay('endOverlay', true);
  if (won) audio.achieve();
}

function gameLoop() {
  const now = Date.now();
  const elapsed = Math.min(5, (now - lastTick) / 1000);
  lastTick = now;
  const events = tick(state, elapsed, env);
  events.forEach((event) => {
    if (event.type === 'harvest') {
      sessionHarvests += 1;
      audio.harvest();
      toast(`🤖 +${event.coins} 🪙`);
    } else if (event.type === 'ready') toast('✨ Una pianta è pronta!', 1200);
  });
  if (events.length) { checkGoals(); checkModeGoal(); }
  if (timeRunning) {
    timeLeft -= elapsed;
    $('timeBar').style.width = Math.max(0, (timeLeft / 60) * 100) + '%';
    $('timeLabel').textContent = `${sessionHarvests}/${timeAttackConfig().goal} raccolti · ${Math.max(0, Math.ceil(timeLeft))}s`;
    if (timeLeft <= 0) endChallenge(false);
  }
  renderAll(state, env, handlers);
  if (events.length) persist();
}

function showWelcome() {
  const now = Date.now();
  const elapsed = now - (state.lastTick || now);
  if (elapsed < 20000 || !state.plots.some((plot) => plot.seedId)) return;
  const report = offlineReport(state, elapsed, env);
  if (!report.coins && !report.cycles) return;
  state.coins += report.coins;
  state.gems += report.gems;
  state.totalCoinsEarned += report.coins;
  state.plots.forEach((plot) => {
    if (!plot.seedId) return;
    const seed = findSeed(plot.seedId);
    plot.progress = (plot.progress + report.seconds * 1) % seed.growTime;
  });
  $('welcomeText').textContent = `${report.cycles} cicli · +${report.coins} monete · +${report.gems} gemme (fino a ${report.capHours}h)`;
  showOverlay('welcomeOverlay', true);
  persist();
}

function bindUI() {
  document.querySelectorAll('.tab').forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  $('newPlotBtn').addEventListener('click', () => {
    if (!buyPlot(state)) { toast('Campi o monete insufficienti'); return; }
    audio.buy(); refresh(); persist();
  });
  $('timeStartBtn').addEventListener('click', () => {
    timeLeft = timeAttackConfig().duration;
    sessionHarvests = 0;
    timeRunning = true;
    $('timePanel').classList.remove('hidden');
    $('timeStartBtn').disabled = true;
    toast('⏱️ Sfida avviata!');
  });
  $('soundToggle').addEventListener('click', () => {
    state.sound = state.sound === false;
    audio.setEnabled(state.sound);
    $('soundToggle').textContent = state.sound ? '🔊' : '🔇';
    persist();
  });
  $('hapticsBtn').addEventListener('click', () => {
    state.haptics = state.haptics === false;
    audio.setHaptics(state.haptics);
    $('hapticsBtn').textContent = state.haptics ? '📳' : '📴';
    persist();
  });
  $('shareBtn').addEventListener('click', async () => {
    toast(await share(state) === 'shared' ? 'Condiviso!' : 'PNG salvato e testo copiato');
  });
  $('welcomeClose').addEventListener('click', () => showOverlay('welcomeOverlay', false));
  $('endClose').addEventListener('click', () => { showOverlay('endOverlay', false); timeRunning = false; });
  document.addEventListener('pointerdown', () => audio.unlock(), { once: true });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) $('updateBar').classList.remove('hidden');
        });
      });
      registration.addEventListener('activate', () => location.reload());
    }).catch(() => {});
  }
  $('updateBtn').addEventListener('click', () => {
    navigator.serviceWorker.getRegistration().then((registration) => { if (registration && registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' }); });
    location.reload();
  });
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    $('installBtn').classList.remove('hidden');
    $('installBtn').onclick = async () => { await event.prompt(); $('installBtn').classList.add('hidden'); };
  });
  window.addEventListener('beforeunload', persist);
}

function init() {
  if (!state.plots.length) {
    for (let i = 0; i < 4; i += 1) state.plots.push(createPlot(i));
    state.season = seasonForDate().id;
    state.weather = weatherForDate().id;
    persist();
  }
  bindUI();
  refresh();
  showWelcome();
  setInterval(gameLoop, 1000);
}

init();
window.__ORTO__ = { get state() { return state; }, get env() { return env; }, handlers, refresh, gameLoop };
