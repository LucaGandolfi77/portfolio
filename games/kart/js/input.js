/* Neon Kart — multi-touch, keyboard and gamepad input */
export class Input {
  constructor(handlers) {
    this.h = handlers;
    this.keys = new Set();
    this.touch = { left:false, right:false, drift:false, nitro:false, brake:false };
    this.bind();
  }
  bind() {
    addEventListener('keydown', e => {
      if ([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
      const k = e.key.toLowerCase();
      if (e.repeat) { this.keys.add(k); return; }
      this.keys.add(k);
      if (k === 'escape') this.h.pause?.();
      if (k === 'enter') this.h.confirm?.();
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => { this.keys.clear(); Object.keys(this.touch).forEach(k => this.touch[k] = false); });

    document.querySelectorAll('[data-act]').forEach(btn => {
      const act = btn.dataset.act;
      if (!(act in this.touch)) return;
      const on = e => { e.preventDefault(); this.touch[act] = true; btn.classList.add('on'); };
      const off = () => { this.touch[act] = false; btn.classList.remove('on'); };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('pointerleave', off);
    });
  }
  read() {
    const k = this.keys, t = this.touch;
    let steer = (t.left || k.has('a') || k.has('arrowleft') ? -1 : 0) +
      (t.right || k.has('d') || k.has('arrowright') ? 1 : 0);
    let drift = t.drift || k.has(' ');
    let nitro = t.nitro || k.has('shift');
    let brake = t.brake || k.has('s') || k.has('arrowdown');
    try {
      const gp = navigator.getGamepads?.()?.find(g => g);
      if (gp) {
        if (Math.abs(gp.axes[0]) > 0.18) steer += gp.axes[0];
        drift = drift || gp.buttons[0]?.pressed;
        brake = brake || gp.buttons[1]?.pressed;
        nitro = nitro || gp.buttons[2]?.pressed || gp.buttons[7]?.pressed;
      }
    } catch (e) {}
    return { steer:Math.max(-1, Math.min(1, steer)), throttle:1, drift, nitro, brake };
  }
}
