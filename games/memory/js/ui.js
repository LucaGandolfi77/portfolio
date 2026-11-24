/** ui.js — rendering dell'interfaccia di Memory Garden. */

import { MODES, DIFFICULTIES, DECKS, THEMES, POWERS, QUESTS } from './config.js';
import { questStats, isQuestUnlocked } from './quest.js';
import { collectionSummary } from './collection.js';

const $ = (id) => document.getElementById(id);

export function tr(key, fallback) {
  const dict = window.translations && window.translations.games && window.translations.games.memory;
  return (dict && dict[key]) || fallback || key;
}

export function toast(message) {
  const node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('show'), 2200);
}

export function showOverlay(id, visible) {
  const node = $(id);
  if (node) node.classList.toggle('hidden', !visible);
}

export function renderSelectors(state, handlers) {
  const modes = $('modePills');
  modes.innerHTML = MODES.map((mode) => `<button class="pill ${mode.id === state.mode ? 'on' : ''}" data-mode="${mode.id}">${mode.emoji} ${mode.name}</button>`).join('');
  modes.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => handlers.onMode(button.dataset.mode)));

  const diffs = $('diffPills');
  diffs.innerHTML = DIFFICULTIES.map((diff) => `<button class="pill ${diff.id === state.diff ? 'on' : ''}" data-diff="${diff.id}">${diff.name}</button>`).join('');
  diffs.querySelectorAll('[data-diff]').forEach((button) => button.addEventListener('click', () => handlers.onDiff(button.dataset.diff)));

  const deck = $('deckSel');
  deck.innerHTML = Object.entries(DECKS).map(([id, item]) => `<option value="${id}">${item.emoji} ${item.name}</option>`).join('');
  deck.value = state.deck;
  deck.onchange = () => handlers.onDeck(deck.value);

  const theme = $('themeSel');
  theme.innerHTML = THEMES.map((item) => `<option value="${item.id}">${item.emoji} ${item.name}</option>`).join('');
  theme.value = state.theme;
  theme.onchange = () => handlers.onTheme(theme.value);
}

export function renderPowers(powers, onUse) {
  const holder = $('powers');
  holder.innerHTML = POWERS.map((power) => `<button class="pw" data-power="${power.id}" ${powers[power.id] ? '' : 'disabled'}>${power.emoji} ${power.name} <b>${powers[power.id]}</b></button>`).join('');
  holder.querySelectorAll('[data-power]').forEach((button) => button.addEventListener('click', () => onUse(button.dataset.power)));
}

export function renderHUD(game, meta) {
  $('hPairs').textContent = String(game.matched);
  $('hMoves').textContent = String(game.moves);
  $('hScore').textContent = String(game.score);
  $('hCombo').textContent = '×' + (1 + Math.min(9, Math.floor(game.combo / 2)));
  $('hTime').textContent = meta.time ? Math.max(0, Math.ceil(game.time)) : (game.freeze > 0 ? '❄' + Math.ceil(game.freeze) : '∞');
  $('hLevel').textContent = String(meta.level || 1);
}

export function renderGrid(game, columns, onFlip) {
  const holder = $('grid');
  holder.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  holder.innerHTML = game.cards.map((card) => `
    <button class="card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''} ${card.gold ? 'gold' : ''}" data-card="${card.id}" aria-label="Card ${card.id + 1}">
      <span class="card-inner"><span class="card-face card-back"></span><span class="card-face card-front">${card.flipped || card.matched ? card.value : ''}</span></span>
    </button>`).join('');
  holder.querySelectorAll('[data-card]').forEach((button) => button.addEventListener('click', () => onFlip(Number(button.dataset.card))));
}

export function updateCard(index, card) {
  const element = $('grid').children[index];
  if (!element) return;
  element.classList.toggle('flipped', card.flipped || card.matched);
  element.classList.toggle('matched', card.matched);
  element.classList.toggle('gold', card.gold);
  element.querySelector('.card-front').textContent = card.flipped || card.matched ? card.value : '';
}

export function renderQuests(save, handlers) {
  const holder = $('questList');
  holder.innerHTML = '';
  const stats = questStats(save);
  const header = document.createElement('div');
  header.innerHTML = `<b>Quest progress</b> — ${stats.completed}/20 · ${stats.total}/${stats.max} ★`;
  holder.appendChild(header);
  QUESTS.forEach((quest) => {
    const unlocked = isQuestUnlocked(quest.id, save);
    const stars = (save.stars && save.stars[quest.id]) || 0;
    const row = document.createElement('div');
    row.className = unlocked ? '' : 'locked';
    row.innerHTML = `<span>${quest.emoji} ${quest.name}</span><span class="stars">${unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒'}</span>`;
    if (unlocked) row.addEventListener('click', () => handlers.onQuest(quest.id));
    holder.appendChild(row);
  });
}

export function renderCollection(collection, handler) {
  const state = collectionSummary(collection);
  const holder = $('collectionList');
  holder.innerHTML = `<div><b>Level ${state.level}</b> · ${state.xp} XP · ${state.count} cards · ${state.rare} rare</div>` +
    (collection.cards || []).slice(-36).reverse().map((card) => `<div>${card.rare ? '🌟' : '·'} ${card.value} <small>${card.theme}</small></div>`).join('');
}

export function renderAwards(achievements) {
  $('achList').innerHTML = achievements.map((item) => `<div class="${item.done ? 'stars' : ''}">${item.emoji} <b>${item.name}</b><br><small>${item.desc}</small></div>`).join('');
}

export function renderLeaderboard(entries) {
  $('lbList').innerHTML = Object.entries(entries || {}).map(([key, rows]) =>
    `<div><b>${key}</b></div>` + rows.slice(0, 5).map((row, index) => `<div>${index + 1}. ${row.score} pts <small>${row.date || ''}</small></div>`).join('')
  ).join('') || '<div>No scores yet.</div>';
}
