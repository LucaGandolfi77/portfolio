/** ui.js — costruzione dei controlli e feedback. */

import { CHARACTERS, SCENES, PROPS, PARTICLES } from './config.js';

const $ = (id) => document.getElementById(id);

export function toast(message, ms = 2400) {
  const node = $('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.classList.remove('show'), ms);
}

export function setStatus(mode, label) {
  const chip = $('status-chip');
  if (!chip) return;
  chip.className = 'glass-pill ' + mode;
  $('chip-label').textContent = label;
}

export function setProgress(value) {
  const bar = $('progress-bar');
  if (bar) bar.style.width = Math.round(Math.max(0, Math.min(1, value)) * 100) + '%';
}

export function logLine(message) {
  const holder = $('loader-log');
  if (!holder) return;
  const line = document.createElement('div');
  line.textContent = message;
  holder.appendChild(line);
  while (holder.childNodes.length > 80) holder.removeChild(holder.firstChild);
  holder.scrollTop = holder.scrollHeight;
}

export function showOverlay(id, visible) {
  const node = $(id);
  if (node) node.classList.toggle('hidden', !visible);
}

export function renderCharacters(activeId, onSelect) {
  const holder = $('charRow');
  if (!holder) return;
  holder.innerHTML = CHARACTERS.map((character) => `<button class="char-card ${character.id === activeId ? 'on' : ''}" data-character="${character.id}" title="${character.name}">
    <span class="emoji">${character.emoji}</span><span class="name">${character.name}</span></button>`).join('');
  holder.querySelectorAll('[data-character]').forEach((button) => button.addEventListener('click', () => onSelect(button.dataset.character)));
}

export function renderChips(holderId, items, activeId, onSelect) {
  const holder = $(holderId);
  if (!holder) return;
  holder.innerHTML = items.map((item) => `<button class="chip ${item.id === activeId ? 'on' : ''}" data-value="${item.id}">${item.emoji ? item.emoji + ' ' : ''}${item.name}</button>`).join('');
  holder.querySelectorAll('[data-value]').forEach((button) => button.addEventListener('click', () => onSelect(button.dataset.value)));
}

export function renderAll(settings, handlers) {
  renderCharacters(settings.character, handlers.onCharacter);
  renderChips('sceneRow', SCENES, settings.scene, handlers.onScene);
  renderChips('propRow', PROPS.map((item) => ({ ...item, name: item.name })), null, handlers.onProp);
  renderChips('particleRow', PARTICLES, settings.particles, handlers.onParticles);
  document.querySelectorAll('.chip[data-value]').forEach((button) => {
    if (button.closest('#propRow') && (settings.props || []).includes(button.dataset.value)) button.classList.add('on');
  });
  $('sfxBtn')?.classList.toggle('on', !!settings.sfx);
  $('speechBtn')?.classList.toggle('on', !!settings.speech);
  $('directorBtn')?.classList.toggle('on', !!settings.director);
}
