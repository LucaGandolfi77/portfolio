/* Arena Royale 2 — twin-stick input, keyboard, mouse and secrets */

import { G } from './state.js';
import { showToast } from './ui.js';
import { sfx, buzz } from './audio.js';
import { startConfetti } from './effects.js';
import { toggleMelee } from './entities.js';
import { t } from './i18n.js';

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
let secretKeys = [];
let lastKeys = [];

function showJoy(j, base, knob) {
  if (!base || !knob) return;
  base.style.left = j.bx + 'px';
  base.style.top = j.by + 'px';
  base.classList.remove('hidden');
  knob.style.left = '50%';
  knob.style.top = '50%';
}
function updateJoy(j, base, knob) {
  if (!knob) return;
  knob.style.left = (50 + j.dx * 50) + '%';
  knob.style.top = (50 + j.dy * 50) + '%';
}
function hideJoy(j, base) {
  j.active = false;
  j.id = null;
  j.dx = 0;
  j.dy = 0;
  base?.classList.add('hidden');
}

function handleSecretKeys(e) {
  const key = e.key.toLowerCase();
  secretKeys.push(key);
  if (secretKeys.length > KONAMI.length) secretKeys.shift();
  if (secretKeys.join(',') === KONAMI.join(',')) {
    secretKeys = [];
    activateLegend();
    return;
  }
  lastKeys.push(key);
  if (lastKeys.length > 2) lastKeys.shift();
  if (lastKeys.join(',') === 'g,g') {
    lastKeys = [];
    showToast('GG! 🎉', 1500);
    startConfetti();
  }
}

function activateLegend() {
  if (G.phase !== 'playing') return;
  G.legendT = 20;
  document.getElementById('hud')?.classList.add('legend');
  document.getElementById('weaponBox')?.classList.add('legend-mode');
  showToast(t('legendOn'), 2200);
  sfx(880, 0.6, 'sawtooth', 0.08);
  buzz([60, 40, 60]);
}

export function initInput(callbacks) {
  const { onPause, onAudio } = callbacks;
  const { joyMove, joyAim, keys } = G.input;

  window.addEventListener('pointerdown', e => {
    if (G.phase !== 'playing') return;
    onAudio?.();
    const target = e.target;
    if (target && typeof target.closest === 'function' && target.closest('#hud, #toast')) return;
    const touch = e.pointerType === 'touch';
    if (touch) {
      if (e.clientX < window.innerWidth * 0.5) {
        if (joyMove.active) return;
        Object.assign(joyMove, { active: true, id: e.pointerId, bx: e.clientX, by: e.clientY });
        showJoy(joyMove, document.getElementById('joyBase'), document.getElementById('joyKnob'));
      } else {
        if (joyAim.active) return;
        Object.assign(joyAim, { active: true, id: e.pointerId, bx: e.clientX, by: e.clientY });
        showJoy(joyAim, document.getElementById('joyBase2'), document.getElementById('joyKnob2'));
      }
    } else {
      G.input.mouseUsed = true;
      G.input.mouseDown = true;
      G.input.mouseX = e.clientX;
      G.input.mouseY = e.clientY;
      const cross = document.getElementById('crosshair');
      cross?.classList.remove('hidden');
      if (cross) { cross.style.left = e.clientX + 'px'; cross.style.top = e.clientY + 'px'; }
    }
  });

  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') {
      if (joyMove.active && e.pointerId === joyMove.id) {
        const dx = e.clientX - joyMove.bx, dy = e.clientY - joyMove.by;
        const d = Math.hypot(dx, dy);
        const m = Math.min(d, joyMove.rad);
        joyMove.dx = d > 1 ? (dx / d) * (m / joyMove.rad) : 0;
        joyMove.dy = d > 1 ? (dy / d) * (m / joyMove.rad) : 0;
        updateJoy(joyMove, document.getElementById('joyBase'), document.getElementById('joyKnob'));
      } else if (joyAim.active && e.pointerId === joyAim.id) {
        const dx = e.clientX - joyAim.bx, dy = e.clientY - joyAim.by;
        const d = Math.hypot(dx, dy);
        const m = Math.min(d, joyAim.rad);
        joyAim.dx = d > 1 ? (dx / d) * (m / joyAim.rad) : 0;
        joyAim.dy = d > 1 ? (dy / d) * (m / joyAim.rad) : 0;
        updateJoy(joyAim, document.getElementById('joyBase2'), document.getElementById('joyKnob2'));
      }
    } else {
      G.input.mouseX = e.clientX;
      G.input.mouseY = e.clientY;
      if (G.input.mouseUsed) {
        const cross = document.getElementById('crosshair');
        cross?.classList.remove('hidden');
        if (cross) { cross.style.left = e.clientX + 'px'; cross.style.top = e.clientY + 'px'; }
      }
    }
  });

  const release = e => {
    if (e.pointerType === 'touch') {
      if (joyMove.active && e.pointerId === joyMove.id) hideJoy(joyMove, document.getElementById('joyBase'));
      if (joyAim.active && e.pointerId === joyAim.id) hideJoy(joyAim, document.getElementById('joyBase2'));
    } else G.input.mouseDown = false;
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (e.key === 'q' || e.key === 'Q' || e.key === 'e' || e.key === 'E') toggleMelee();
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') onPause?.();
    handleSecretKeys(e);
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') keys.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  });

  document.getElementById('switchBtn')?.addEventListener('click', toggleMelee);
}

export function resetInputVisuals() {
  document.getElementById('joyBase')?.classList.add('hidden');
  document.getElementById('joyBase2')?.classList.add('hidden');
  document.getElementById('crosshair')?.classList.add('hidden');
}
