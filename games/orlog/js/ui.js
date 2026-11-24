/** ui.js — interfaccia di Orlog. */

import { MODES, FACES, FAVORS, TALENTS, RELICS, BOSSES } from './config.js';
import { canBuyTalent } from './progression.js';

const $ = (id) => document.getElementById(id);
const faceIcon = (face) => (FACES.find((item) => item.id === face) || {}).icon || '🎲';

export function toast(message, ms = 2200) {
  const node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('show'), ms);
}

export function showScreen(name) {
  ['start', 'game', 'gameover'].forEach((screen) => {
    $(screen + 'Screen').classList.toggle('active', screen === name);
  });
}

export function showOverlay(id, visible) {
  const node = $(id);
  if (node) node.classList.toggle('hidden', !visible);
}

export function renderModes(active, onSelect) {
  const holder = $('modeRow');
  holder.innerHTML = MODES.map((mode) => `<button class="mode-card glass-card ${mode.id === active ? 'on' : ''}" data-mode="${mode.id}">
    <span class="emoji">${mode.emoji}</span>${mode.name}<small>${mode.desc}</small></button>`).join('');
  holder.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => onSelect(button.dataset.mode)));
}

export function renderDice(id, dice, locked, clickable, onToggle) {
  const holder = $(id);
  holder.innerHTML = dice.map((face, index) => `<button class="dice ${locked && locked[index] ? 'locked' : ''}" data-die="${index}" ${clickable ? '' : 'disabled'} title="${face}">${faceIcon(face)}</button>`).join('');
  if (clickable) holder.querySelectorAll('[data-die]').forEach((button) => button.addEventListener('click', () => onToggle(Number(button.dataset.die))));
}

export function rollAnimation(id) {
  const holder = $(id);
  if (!holder) return;
  holder.querySelectorAll('.dice').forEach((die) => {
    die.classList.add('rolling');
    setTimeout(() => die.classList.remove('rolling'), 320);
  });
}

export function hitAnimation(id, sides) {
  const holder = $(id);
  if (!holder) return;
  holder.querySelectorAll('.dice').forEach((die, index) => {
    const face = die.title;
    if ((sides === 'player' && (face === 'melee' || face === 'ranged')) || (sides === 'enemy' && face === 'steal')) {
      die.classList.add('hit');
      setTimeout(() => die.classList.remove('hit'), 320);
    }
  });
}

export function updateHUD(match, name = 'Challenger') {
  const player = match.player, enemy = match.enemy;
  $('roundBadge').textContent = match.rounds === Infinity ? `Wave ${match.round}` : `Round ${match.round}`;
  $('phaseBadge').textContent = match.phase.toUpperCase();
  $('comboBadge').textContent = '×' + (match.combo || 1);
  $('enemyName').textContent = name;
  $('enemyHpVal').textContent = String(enemy.hp);
  $('playerHpVal').textContent = String(player.hp);
  $('enemyTokens').textContent = String(enemy.tokens);
  $('playerTokens').textContent = String(player.tokens);
  $('enemyHpBar').style.width = Math.max(0, (enemy.hp / match.maxHp) * 100) + '%';
  $('playerHpBar').style.width = Math.max(0, (player.hp / match.maxHp) * 100) + '%';
  $('favorTokens').textContent = String(player.tokens);
  $('relicRow').innerHTML = player.relics.map((id) => {
    const relic = RELICS.find((item) => item.id === id);
    return relic ? `<span class="relic">${relic.emoji} ${relic.name}</span>` : '';
  }).join('');
}

export function renderFavors(match, onChoose) {
  const holder = $('favorGrid');
  const cost = (favor) => match.mutators.includes('free') ? 1 : (match.player.relics.includes('runes') ? Math.max(1, favor.cost - 1) : favor.cost);
  holder.innerHTML = FAVORS.map((favor) => {
    const price = cost(favor);
    return `<button class="favor-btn" data-favor="${favor.id}" ${match.player.tokens < price ? 'disabled' : ''}>${favor.icon} <b>${favor.name}</b> · ${price}⌘<br><small>${favor.desc}</small></button>`;
  }).join('');
  holder.querySelectorAll('[data-favor]').forEach((button) => button.addEventListener('click', () => onChoose(button.dataset.favor)));
}

export function renderLog(events, sideNames = {}) {
  const holder = $('resLog');
  holder.innerHTML = events.map((event) => {
    let text = '';
    if (event.type === 'favor') text = `${event.side === 'player' ? 'You' : (sideNames.enemy || 'Foe')} invoke ${event.name}`;
    if (event.type === 'damage') text = `${event.side === 'player' ? 'You deal' : (sideNames.enemy || 'Foe') + ' deals'} ${event.amount} damage`;
    if (event.type === 'heal') text = `${event.side === 'player' ? 'You heal' : 'Foe heals'} ${event.amount} HP`;
    if (event.type === 'steal') text = `${event.side === 'player' ? 'You steal' : 'Foe steals'} ${event.amount} tokens`;
    if (event.type === 'gain') text = `${event.side === 'player' ? 'You gain' : 'Foe gains'} ${event.amount} tokens`;
    if (event.type === 'swapHp') text = 'Fate swaps your health!';
    if (event.type === 'cancel') text = 'A favor was cancelled!';
    return text ? `<div class="entry ${event.type}">${text}</div>` : '';
  }).join('');
  holder.classList.remove('hidden');
}

export function renderLore() {
  $('loreList').innerHTML = BOSSES.map((boss) => `<div>${boss.emoji} <b>${boss.name}</b><small>${boss.lore}</small></div>`).join('');
}

export function renderTalents(progress, handlers) {
  const holder = $('talentList');
  const stars = Object.values(progress.stars || {}).reduce((sum, value) => sum + value, 0);
  holder.innerHTML = `<div><b>★ ${stars} stars</b> · ✨ ${progress.xp || 0} XP<small>Spend stars on permanent talents. Equip up to 2 relics.</small></div>` +
    TALENTS.map((talent) => {
      const owned = (progress.talents || []).includes(talent.id);
      const available = canBuyTalent(progress, talent.id);
      return `<div class="${owned ? 'owned' : available ? '' : 'locked'}" data-talent="${talent.id}">${talent.emoji} <b>${talent.name}</b> · ${talent.cost}★<small>${talent.desc}${owned ? ' ✓ owned' : ''}</small></div>`;
    }).join('') +
    '<div><b>Relics</b></div>' +
    RELICS.map((relic) => {
      const equipped = (progress.relics || []).includes(relic.id);
      return `<div class="${equipped ? 'owned' : ''} ${stars < RElicIndex(relic) * 3 ? 'locked' : ''}" data-relic="${relic.id}">${relic.emoji} <b>${relic.name}</b><small>${relic.desc}${equipped ? ' ✓ equipped' : ''}</small></div>`;
    }).join('');
  holder.querySelectorAll('[data-talent]').forEach((node) => node.addEventListener('click', () => handlers.onTalent(node.dataset.talent)));
  holder.querySelectorAll('[data-relic]').forEach((node) => node.addEventListener('click', () => handlers.onRelic(node.dataset.relic)));
}

function RElicIndex(relic) { return RELICS.indexOf(relic); }
