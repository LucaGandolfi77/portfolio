/* RPG Adventure — keyboard, touch joystick and gamepad input */

export class Input {
  constructor(handlers) {
    this.h = handlers;
    this.keys = new Set();
    this.joy = { x: 0, y: 0, active: false };
    this.bind();
  }

  bind() {
    addEventListener('keydown', e => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) e.preventDefault();
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      const map = {
        ' ': 'attack', e: 'interact', tab: 'dodge', escape: 'menu', i: 'inventory',
        '1': 'skill0', '2': 'skill1', '3': 'skill2', '4': 'skill3', p: 'pause'
      };
      const act = map[k];
      if (act) this.h[act]?.();
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => { this.keys.clear(); this.joy.x = this.joy.y = 0; this.joy.active = false; });

    const pad = document.getElementById('joystick');
    const knob = document.getElementById('joystickKnob');
    if (pad && knob) {
      const update = e => {
        const r = pad.getBoundingClientRect();
        let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const max = r.width * 0.38, len = Math.hypot(dx, dy);
        if (len > max) { dx = dx / len * max; dy = dy / len * max; }
        this.joy.x = dx / max; this.joy.y = dy / max; this.joy.active = true;
        knob.style.transform = `translate(${dx}px, ${dy}px)`;
      };
      const reset = () => {
        this.joy.x = this.joy.y = 0; this.joy.active = false;
        knob.style.transform = 'translate(0,0)';
      };
      pad.addEventListener('pointerdown', e => { pad.setPointerCapture(e.pointerId); update(e); });
      pad.addEventListener('pointermove', e => { if (this.joy.active) update(e); });
      pad.addEventListener('pointerup', reset);
      pad.addEventListener('pointercancel', reset);
      pad.addEventListener('lostpointercapture', reset);
    }

    document.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        this.h[btn.dataset.act]?.();
        btn.classList.add('pressed');
      });
      const clear = () => btn.classList.remove('pressed');
      btn.addEventListener('pointerup', clear);
      btn.addEventListener('pointercancel', clear);
      btn.addEventListener('pointerleave', clear);
    });
  }

  vector() {
    let x = 0, y = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) x -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) x += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) y -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) y += 1;
    x += this.joy.x; y += this.joy.y;

    try {
      const gp = navigator.getGamepads?.()?.find(g => g);
      if (gp) {
        x += Math.abs(gp.axes[0]) > 0.15 ? gp.axes[0] : 0;
        y += Math.abs(gp.axes[1]) > 0.15 ? gp.axes[1] : 0;
        if (gp.buttons[0]?.pressed && !this._gpAttack) { this._gpAttack = true; this.h.attack?.(); }
        if (!gp.buttons[0]?.pressed) this._gpAttack = false;
        if (gp.buttons[1]?.pressed && !this._gpDodge) { this._gpDodge = true; this.h.dodge?.(); }
        if (!gp.buttons[1]?.pressed) this._gpDodge = false;
        if (gp.buttons[2]?.pressed && !this._gpInteract) { this._gpInteract = true; this.h.interact?.(); }
        if (!gp.buttons[2]?.pressed) this._gpInteract = false;
      }
    } catch (e) {}

    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }
}
