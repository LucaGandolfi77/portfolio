/** ui.js — rendering dell'interfaccia di Orto Magico. */

import { SEEDS, UPGRADES, ACHIEVEMENTS, MODES, SEASONS, WEATHER, SPIRITS, findSeed } from './config.js';
import { albumEntries } from './progress.js';

const $ = (id) => document.getElementById(id);
const fmt = (number) => (Number(number) || 0).toLocaleString('it-IT');

export function toast(message, ms = 2200) {
  const node = $('toasts');
  if (!node) return;
  const item = document.createElement('div');
  item.className = 'toast show';
  item.textContent = message;
  node.appendChild(item);
  setTimeout(() => { item.classList.remove('show'); setTimeout(() => item.remove(), 300); }, ms);
}

export function showOverlay(id, visible) {
  const node = $(id);
  if (node) node.classList.toggle('hidden', !visible);
}

export function showTab(name) {
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('on', tab.dataset.tab === name));
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.toggle('on', panel.id === 'panel-' + name));
}

export function renderHeader(state, env) {
  $('hudCoins').textContent = fmt(state.coins);
  $('hudGems').textContent = fmt(state.gems);
  $('hudLevel').textContent = String(state.level);
  $('hudSeason').textContent = env.season.emoji + ' ' + env.season.name;
  $('hudWeather').textContent = env.weather.emoji;
  $('hudMode').textContent = MODES.find((mode) => mode.id === state.mode).name;
  $('hudXpBar').style.width = Math.min(100, (state.xp / state.xpNext) * 100) + '%';
  $('hudStreak').textContent = '🔥 ' + (state.streak?.count || 0);
  $('soundToggle').textContent = state.sound === false ? '🔇' : '🔊';
  $('hapticsBtn').textContent = state.haptics === false ? '📴' : '📳';
}

export function renderSelectors(state, env, handlers) {
  const modeHolder = $('modeRow');
  modeHolder.innerHTML = MODES.map((mode) => `<button class="pill ${mode.id === state.mode ? 'on' : ''}" data-mode="${mode.id}">${mode.emoji} ${mode.name}</button>`).join('');
  modeHolder.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => handlers.onMode(button.dataset.mode)));

  const seasonHolder = $('seasonRow');
  seasonHolder.innerHTML = SEASONS.map((season) => `<button class="pill ${season.id === env.seasonId ? 'on' : ''}" data-season="${season.id}">${season.emoji} ${season.name}</button>`).join('');
  seasonHolder.querySelectorAll('[data-season]').forEach((button) => button.addEventListener('click', () => handlers.onSeason(button.dataset.season)));

  const weatherHolder = $('weatherRow');
  weatherHolder.innerHTML = WEATHER.map((weather) => `<button class="pill ${weather.id === env.weatherId ? 'on' : ''}" data-weather="${weather.id}">${weather.emoji} ${weather.name}</button>`).join('');
  weatherHolder.querySelectorAll('[data-weather]').forEach((button) => button.addEventListener('click', () => handlers.onWeather(button.dataset.weather)));

  const spiritHolder = $('spiritRow');
  spiritHolder.innerHTML = SPIRITS.map((spirit) => `<button class="pill ${(state.spirits || []).includes(spirit.id) ? 'on' : ''}" data-spirit="${spirit.id}">${spirit.emoji} ${spirit.name}</button>`).join('');
  spiritHolder.querySelectorAll('[data-spirit]').forEach((button) => button.addEventListener('click', () => handlers.onSpirit(button.dataset.spirit)));
  $('timePanel').classList.toggle('hidden', state.mode !== 'time');
}

export function renderGarden(state, env, handlers) {
  const holder = $('gardenGrid');
  holder.innerHTML = state.plots.map((plot, index) => {
    if (!plot.seedId) {
      const options = Object.values(SEEDS).map((seed) => `<option value="${seed.id}">${seed.emoji} ${seed.name} · ${seed.cost}🪙</option>`).join('');
      return `<div class="plot empty"><div><div class="plot-emoji">🕳️</div><div class="plot-name">Campo vuoto</div>
        <select class="seed-select" data-seed="${index}">${options}</select>
        <div class="plot-actions" style="margin-top:7px"><button class="btn primary" data-plant="${index}">🌱 Piantа</button></div></div></div>`;
    }
    const seed = findSeed(plot.seedId);
    const percent = Math.min(100, (plot.progress / seed.growTime) * 100);
    const ready = plot.progress >= seed.growTime;
    return `<div class="plot ${ready ? 'pop' : ''}"><div class="plot-emoji">${seed.emoji}</div>
      <div class="plot-name">${seed.name}</div>
      <div class="progress"><i style="width:${percent}%"></i></div>
      <div class="water">💧 ${Math.round(plot.water)} / ${plot.maxWater}${plot.water < seed.minWater ? ' · sete!' : ''}</div>
      ${ready ? '<div class="ready">✨ Pronta!</div>' : ''}
      <div class="plot-actions"><button class="btn" data-water="${index}">💧 Annaffia</button><button class="btn primary" data-harvest="${index}">🧺 Raccogli</button></div></div>`;
  }).join('');
  holder.querySelectorAll('[data-plant]').forEach((button) => button.addEventListener('click', () => handlers.onPlant(Number(button.dataset.plant), holder.querySelector(`[data-seed="${button.dataset.plant}"]`).value)));
  holder.querySelectorAll('[data-water]').forEach((button) => button.addEventListener('click', () => handlers.onWater(Number(button.dataset.water))));
  holder.querySelectorAll('[data-harvest]').forEach((button) => button.addEventListener('click', () => handlers.onHarvest(Number(button.dataset.harvest))));
  $('newPlotBtn').disabled = state.plots.length >= state.maxPlots || state.coins < state.nextPlotCost;
  $('newPlotBtn').textContent = `➕ Nuovo campo · ${fmt(state.nextPlotCost)}🪙`;
}

export function renderShop(state, handlers) {
  const holder = $('shopSection');
  holder.innerHTML = '<div class="shop-section"><h2>🛒 Potenziamenti</h2>' +
    [1, 2, 3].map((tier) => `<div class="tier"><h3>Livello ${tier}</h3><div class="card-list">` +
      UPGRADES.filter((item) => item.tier === tier).map((item) => {
        const owned = state.upgrades.includes(item.id);
        const locked = tier > 1 && state.level < tier * 3;
        const affordable = state.coins >= item.cost && state.gems >= item.gems;
        return `<button class="card ${owned ? 'owned' : ''} ${locked || (!affordable && !owned) ? 'locked' : ''}" data-upgrade="${item.id}" ${owned || locked ? 'disabled' : ''}>
          ${item.emoji}<b>${item.name}</b><small>${item.desc}</small><small>${item.cost}🪙 ${item.gems ? '· ' + item.gems + '💎' : ''}</small></button>`;
      }).join('') + '</div></div>').join('') + '</div>';
  holder.querySelectorAll('[data-upgrade]:not(:disabled)').forEach((button) => button.addEventListener('click', () => handlers.onUpgrade(button.dataset.upgrade)));
}

export function renderGoals(state, handlers) {
  $('goalsSection').innerHTML = '<div class="goals-section"><h2>🏅 Obiettivi</h2>' + ACHIEVEMENTS.map((achievement) => {
    const value = state[achievement.field] || 0;
    const percent = Math.min(100, (value / achievement.goal) * 100);
    const claimed = !!state.achievements[achievement.id];
    return `<div class="goal"><b>${achievement.emoji} ${achievement.name}</b> — ${achievement.desc}
      <div>${fmt(value)} / ${fmt(achievement.goal)} · +${fmt(achievement.coins)}🪙 ${achievement.gems ? '+ ' + achievement.gems + '💎' : ''}</div>
      <div class="bar"><i style="width:${percent}%"></i></div>
      ${value >= achievement.goal && !claimed ? `<button class="btn small" data-claim="${achievement.id}">Riscatta</button>` : ''}
      ${claimed ? '<small>✓ ottenuto</small>' : ''}</div>`;
  }).join('') + '</div>';
  $('goalsSection').querySelectorAll('[data-claim]').forEach((button) => button.addEventListener('click', () => handlers.onClaim(button.dataset.claim)));
}

export function renderAlbum(state) {
  $('albumSection').innerHTML = '<div class="album-section"><h2>📖 Album botanico</h2><div class="album-grid">' +
    albumEntries(state).map((entry) => `<div class="album-item ${entry.count ? '' : 'locked'}"><span class="emoji">${entry.emoji}</span>
      <b>${entry.name}</b><small>${entry.count ? entry.count + ' raccolti' : 'non scoperto'}</small><small>${entry.story}</small></div>`).join('') +
    '</div></div>';
}

export function renderAll(state, env, handlers) {
  renderHeader(state, env);
  renderSelectors(state, env, handlers);
  renderGarden(state, env, handlers);
  renderShop(state, handlers);
  renderGoals(state, handlers);
  renderAlbum(state);
}
