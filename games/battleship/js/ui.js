/** ui.js — menu, HUD e risultati. */

import { MODES, MISSIONS, SHIPS, findMission } from './config.js';
import { totalStars, isUnlocked } from './economy.js';
import { objectiveProgress } from './missions.js';

const $ = (id) => document.getElementById(id);

export function showOverlay(id, visible) {
  const node = $(id);
  if (node) node.classList.toggle('hidden', !visible);
}

let toastTimer = null;
export function toast(message, ms = 2200) {
  const node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), ms);
}

export function renderMenu(state, save, handlers) {
  const modeRow = $('modeRow');
  modeRow.innerHTML = MODES.map((mode) => `<button class="mode-tab ${mode.id === state.mode ? 'on' : ''}" data-mode="${mode.id}">${mode.emoji} ${mode.name}</button>`).join('');
  modeRow.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => handlers.onMode(button.dataset.mode)));

  const stars = totalStars(save);
  const shipRow = $('shipRow');
  shipRow.innerHTML = SHIPS.map((ship) => {
    const unlocked = isUnlocked(ship.id, save);
    return `<button class="card-btn ${ship.id === state.ship ? 'on' : ''} ${unlocked ? '' : 'locked'}" data-ship="${ship.id}" ${unlocked ? '' : 'disabled'}>
      <span class="emoji">${ship.emoji}</span>${ship.name}<span class="stars">${unlocked ? '★'.repeat(Math.min(3, Math.floor(ship.hull / 60))) : '🔒 ' + ship.unlock + '★'}</span></button>`;
  }).join('');
  shipRow.querySelectorAll('[data-ship]:not(:disabled)').forEach((button) => button.addEventListener('click', () => handlers.onShip(button.dataset.ship)));

  const missionRow = $('missionRow');
  if (state.mode !== 'campaign') {
    missionRow.innerHTML = `<div class="glass-chip">${MODES.find((mode) => mode.id === state.mode).desc}</div>`;
    return;
  }
  missionRow.innerHTML = MISSIONS.map((mission, index) => {
    const unlocked = index === 0 || (save.stars && save.stars[MISSIONS[index - 1].id] > 0);
    const done = save.stars && save.stars[mission.id] || 0;
    return `<button class="card-btn ${mission.id === state.mission ? 'on' : ''} ${unlocked ? '' : 'locked'}" data-mission="${mission.id}" ${unlocked ? '' : 'disabled'}>
      <span class="emoji">${mission.mods?.includes('boss') ? '👹' : mission.mods?.includes('convoy') ? '🚢' : '⚔️'}</span>${mission.id.toUpperCase().slice(1)}
      <span class="stars">${unlocked ? '★'.repeat(done) + '☆'.repeat(3 - done) : '🔒'}</span></button>`;
  }).join('');
  missionRow.querySelectorAll('[data-mission]:not(:disabled)').forEach((button) => button.addEventListener('click', () => handlers.onMission(button.dataset.mission)));
}

export function renderHUD(world, config, settings) {
  const player = world.player;
  const hull = Math.max(0, Math.round((player.hp / player.maxHp) * 100));
  $('hudHealth').textContent = hull;
  $('hudHealthFill').style.width = hull + '%';
  $('hudScore').textContent = String(world.stats.score || world.stats.sunk * 100);
  const seconds = Math.floor(world.stats.time);
  $('hudTimer').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  $('hudWave').textContent = String(world.stats.waves || 1);
  $('hudShip').textContent = world.ship.emoji + ' ' + world.ship.name;
  $('hudMode').textContent = (config.emoji || '') + ' ' + (config.name || world.mission.name);
  $('hudObjective').textContent = world.mission.desc || '';
  $('hudObjectiveFill').style.width = Math.round(objectiveProgress(world.mission, world) * 100) + '%';
}

export function renderResult({ won, score, stars, reward, nextId, mission }, handlers) {
  $('resultTitle').textContent = won ? 'VICTORY' : 'DEFEAT';
  $('resultScore').textContent = String(score);
  $('resultStars').textContent = won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '—';
  $('resultReward').textContent = won ? `+${reward.xp} XP · +${reward.coins} supplies` : 'The sea claims another captain.';
  const next = $('resultNext');
  next.classList.toggle('hidden', !won || !nextId);
  next.onclick = () => handlers.onNext(nextId);
}
