/* ===== MORFALIA · Unified Mobile Touch + Desktop Input ===== */
import { sound } from '../engine/audio.js';

export class InputController {
  constructor(canvas, renderer, sim, isBlockedFn) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.sim = sim;
    this.isBlocked = isBlockedFn;

    this.keys = new Set();
    this.joystick = {
      active: false,
      pointerId: null,
      originX: 0,
      originY: 0,
      curX: 0,
      curY: 0,
      dx: 0,
      dy: 0,
      moved: false
    };

    this.bindEvents();
  }

  bindEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.isBlocked()) return;
      sound.unlock();
      if (this.joystick.pointerId !== null) return;
      this.joystick.pointerId = e.pointerId;
      this.joystick.originX = e.clientX;
      this.joystick.originY = e.clientY;
      this.joystick.curX = e.clientX;
      this.joystick.curY = e.clientY;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.moved = false;
      this.joystick.active = false;
      this.canvas.setPointerCapture(e.pointerId);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.joystick.pointerId) return;
      const dx = e.clientX - this.joystick.originX;
      const dy = e.clientY - this.joystick.originY;
      const dist = Math.hypot(dx, dy);
      if (dist > 14) {
        this.joystick.moved = true;
        this.joystick.active = true;
      }
      const maxR = 44;
      const clamp = Math.min(dist, maxR);
      const ang = Math.atan2(dy, dx);
      this.joystick.curX = this.joystick.originX + Math.cos(ang) * clamp;
      this.joystick.curY = this.joystick.originY + Math.sin(ang) * clamp;
      this.joystick.dx = dist > 10 ? (dx / dist) * (clamp / maxR) : 0;
      this.joystick.dy = dist > 10 ? (dy / dist) * (clamp / maxR) : 0;
    });

    const endPointer = (e) => {
      if (e.pointerId !== this.joystick.pointerId) return;
      const wasTap = !this.joystick.moved;
      const x = e.clientX;
      const y = e.clientY;
      this.joystick.pointerId = null;
      this.joystick.active = false;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      if (wasTap && !this.isBlocked()) {
        const w = this.renderer.screenToWorld(x, y);
        this.sim.setTapTarget(w.x, w.y);
      }
    };
    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);

    // Keyboard controls for desktop
    window.addEventListener('keydown', (e) => {
      if (this.isBlocked()) return;
      sound.unlock();
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        this.keys.add(k);
        e.preventDefault();
      } else if (k === ' ' || k === 'e' || k === 'enter') {
        e.preventDefault();
        this.sim.triggerPrimaryAction();
      } else if (k >= '1' && k <= '9') {
        const idx = Number(k) - 1;
        const p = this.sim.state.unlockedPowers[idx];
        if (p) this.sim.setActivePower(p);
      } else if (k === 'escape') {
        this.sim.setBuildItem(null);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  getMoveVector() {
    let sx = 0;
    let sy = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) sy -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) sy += 1;
    if (this.keys.has('a') || this.keys.has('arrowleft')) sx -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) sx += 1;
    if (sx === 0 && sy === 0 && this.joystick.active) {
      sx = this.joystick.dx;
      sy = this.joystick.dy;
    }
    if (sx === 0 && sy === 0) return { dx: 0, dy: 0 };
    const yaw = this.renderer && this.renderer.getCameraYaw ? this.renderer.getCameraYaw() : 0;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    return {
      dx: sx * c + sy * s,
      dy: -sx * s + sy * c
    };
  }
}
