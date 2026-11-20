/* Input unificato mouse/touch tramite Pointer Events + scorciatoie */

import { VIEW_W, VIEW_H, TOWER_ORDER } from './config.js';
import { state } from './state.js';
import {
  selectTowerType, clearSelection, placeTower, selectTowerAt,
  startNextWave, togglePause, setSpeed, upgradeTower, sellTower
} from './engine.js';
import { unlockAudio, toggleSound } from './audio.js';
import { t } from './i18n.js';

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
}

export function initInput(canvas) {
  const toLogical = event => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / Math.max(1, rect.width) * VIEW_W,
      y: (event.clientY - rect.top) / Math.max(1, rect.height) * VIEW_H
    };
  };

  canvas.addEventListener('pointermove', event => {
    const p = toLogical(event);
    state.hoverX = p.x;
    state.hoverY = p.y;
    state.hoverInside = true;
  });

  canvas.addEventListener('pointerleave', () => {
    state.hoverInside = false;
  });

  canvas.addEventListener('pointerdown', event => {
    unlockAudio();
    if (!state.running || state.paused || state.gameOver || state.victory) return;
    const p = toLogical(event);
    state.hoverX = p.x;
    state.hoverY = p.y;
    state.hoverInside = true;
    if (state.selectedTowerType) placeTower(p.x, p.y);
    else selectTowerAt(p.x, p.y);
  });

  canvas.addEventListener('contextmenu', event => {
    event.preventDefault();
    clearSelection();
  });

  window.addEventListener('keydown', event => {
    const tag = (event.target && event.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const key = event.key;

    if (key >= '1' && key <= '7') {
      const type = TOWER_ORDER[Number(key) - 1];
      if (type && state.running && !state.paused) selectTowerType(type);
      return;
    }
    if (key === ' ' || key === 'Spacebar') {
      event.preventDefault();
      if (state.running && !state.paused) startNextWave();
      return;
    }
    if (key === 'p' || key === 'P') {
      togglePause();
      return;
    }
    if (key === 'Escape') {
      if (state.paused) togglePause(false);
      else clearSelection();
      return;
    }
    if (key === '+' || key === '=') {
      setSpeed(Math.min(4, state.speed * 2));
      return;
    }
    if (key === '-' || key === '_') {
      setSpeed(Math.max(1, state.speed / 2));
      return;
    }
    if (key === 'u' || key === 'U') {
      if (state.running && !state.paused) upgradeTower();
      return;
    }
    if (key === 'x' || key === 'X') {
      if (state.running && !state.paused) sellTower();
      return;
    }
    if (key === 'm' || key === 'M') {
      const on = toggleSound();
      emit('td:sound', { on });
      emit('td:toast', { text: t(on ? 'hud.soundOn' : 'hud.soundOff'), kind: 'info' });
    }
  });
}
