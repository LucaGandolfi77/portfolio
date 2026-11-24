/* Mystic Quest — tap-to-move, keyboard, gamepad and lantern hold */
export class Input {
  constructor(handlers) {
    this.h = handlers;
    this.keys = new Set();
    this.lantern = false;
    this.bind();
  }
  bind() {
    const canvas = document.getElementById('gameCanvas');
    canvas?.addEventListener('pointerdown', e => {
      e.preventDefault();
      this.h.tap?.(e.clientX, e.clientY);
    });
    addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(k);
      if (k === 'escape') this.h.pause?.();
      if (k === ' ') this.setLantern(true);
      if (k === 'w' || k === 'arrowup') this.h.move?.(0, -1);
      if (k === 's' || k === 'arrowdown') this.h.move?.(0, 1);
      if (k === 'a' || k === 'arrowleft') this.h.move?.(-1, 0);
      if (k === 'd' || k === 'arrowright') this.h.move?.(1, 0);
    });
    addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      this.keys.delete(k);
      if (k === ' ') this.setLantern(false);
    });
    addEventListener('blur', () => { this.keys.clear(); this.setLantern(false); });

    const btn = document.querySelector('[data-act="lantern"]');
    if (btn) {
      const on = e => { e.preventDefault(); this.setLantern(true); };
      const off = () => this.setLantern(false);
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('pointerleave', off);
    }
  }
  setLantern(on) {
    this.lantern = !!on;
    document.querySelector('[data-act="lantern"]')?.classList.toggle('on', this.lantern);
  }
  vector() {
    let x = 0, y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    try {
      const gp = navigator.getGamepads?.()?.find(g => g);
      if (gp) {
        if (Math.abs(gp.axes[0]) > 0.18) x += gp.axes[0];
        if (Math.abs(gp.axes[1]) > 0.18) y += gp.axes[1];
        if (gp.buttons[0]?.pressed) this.setLantern(true);
      }
    } catch (e) {}
    const len = Math.hypot(x, y);
    return len > 1 ? { x:x / len, y:y / len } : { x, y };
  }
}
