/** input.js — tastiera, mouse, stick touch, auto-fire e haptics. */

import { clamp } from './sim.js';
import { angleTo, angleDiff } from './sim.js';

export function createInput({ canvas, stick, fireButton, settings, onPause = () => {} }) {
  const keys = Object.create(null);
  const pointer = { x: 0, y: 0, down: false };
  const pad = { active: false, dx: 0, dy: 0, fire: false };

  function haptic(pattern = 12) {
    if (settings && settings.haptics && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === 'Escape' || event.key === 'p' || event.key === 'P') onPause();
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => { keys[event.key] = false; });
  window.addEventListener('mousemove', (event) => { pointer.x = event.clientX; pointer.y = event.clientY; });
  window.addEventListener('mousedown', () => { pointer.down = true; });
  window.addEventListener('mouseup', () => { pointer.down = false; });

  if (stick) {
    const update = (touch) => {
      const rect = stick.getBoundingClientRect();
      const dx = touch.clientX - (rect.left + rect.width / 2);
      const dy = touch.clientY - (rect.top + rect.height / 2);
      const max = rect.width / 2;
      const length = Math.max(1, Math.hypot(dx, dy));
      pad.dx = length > max ? (dx / length) : (dx / max);
      pad.dy = length > max ? (dy / length) : (dy / max);
    };
    stick.addEventListener('touchstart', (event) => {
      event.preventDefault();
      pad.active = true;
      update(event.touches[0]);
      haptic(8);
    }, { passive: false });
    stick.addEventListener('touchmove', (event) => {
      event.preventDefault();
      if (pad.active) update(event.touches[0]);
    }, { passive: false });
    const release = (event) => {
      event.preventDefault();
      pad.active = false; pad.dx = 0; pad.dy = 0;
    };
    stick.addEventListener('touchend', release, { passive: false });
    stick.addEventListener('touchcancel', release, { passive: false });
  }

  if (fireButton) {
    fireButton.addEventListener('touchstart', (event) => { event.preventDefault(); pad.fire = true; haptic(14); }, { passive: false });
    fireButton.addEventListener('touchend', (event) => { event.preventDefault(); pad.fire = false; }, { passive: false });
    fireButton.addEventListener('mousedown', () => { pad.fire = true; });
    window.addEventListener('mouseup', () => { pad.fire = false; });
  }

  return {
    haptic,
    input(world) {
      const forward = keys.w || keys.W || keys.ArrowUp ? 1 : 0;
      const back = keys.s || keys.S || keys.ArrowDown ? 1 : 0;
      const left = keys.a || keys.A || keys.ArrowLeft ? 1 : 0;
      const right = keys.d || keys.D || keys.ArrowRight ? 1 : 0;
      let throttle = forward - back + pad.dy * -1;
      let turn = right - left + pad.dx;
      if (settings && settings.aimAssist && world && world.enemies.length) {
        const nearest = world.enemies.reduce((best, enemy) => {
          const d = Math.hypot(enemy.x - world.player.x, enemy.y - world.player.y);
          return !best || d < best.d ? { enemy, d } : best;
        }, null).enemy;
        const desired = angleTo(world.player, nearest);
        const diff = angleDiff(desired, world.player.angle);
        turn = clamp(turn + clamp(diff * 2, -1, 1) * 0.55, -1, 1);
      }
      return {
        throttle: clamp(throttle, -1, 1),
        turn: clamp(turn, -1, 1),
        fire: !!(keys[' '] || pointer.down || pad.fire || (settings && settings.autoFire))
      };
    }
  };
}
