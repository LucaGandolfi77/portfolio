/* Sky Ace — unified keyboard, touch and on-screen input */

const DOWN_ACTIONS = new Set(['up', 'down', 'fire']);
const KEY_MAP = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ' ': 'fire', Spacebar: 'fire',
  b: 'bomb', B: 'bomb',
  f: 'flip', F: 'flip',
  p: 'pause', P: 'pause', Escape: 'pause'
};

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.down = { up: false, down: false, fire: false };
    this.pressed = { bomb: false, pause: false, flip: false };
    this.pointerPitch = null;  // -1 (climb) .. 1 (dive)
    this.pointerFire = false;
    this.pointers = new Map(); // id -> { role, x, y, pitch }
    this.longPress = null;
    this.enabled = true;
    this.bind();
  }

  isDown(action) {
    return this.down[action] || (action === 'fire' && this.pointerFire);
  }

  consume(action) {
    const value = !!this.pressed[action];
    this.pressed[action] = false;
    return value;
  }

  clear() {
    this.down.up = this.down.down = this.down.fire = false;
    this.pressed.bomb = this.pressed.pause = this.pressed.flip = false;
    this.pointerPitch = null;
    this.pointerFire = false;
    this.pointers.clear();
    this.clearLongPress();
  }

  clearLongPress() {
    if (this.longPress !== null) { clearTimeout(this.longPress); this.longPress = null; }
  }

  press(action) {
    if (DOWN_ACTIONS.has(action)) this.down[action] = true;
    else if (action in this.pressed) this.pressed[action] = true;
  }

  release(action) {
    if (DOWN_ACTIONS.has(action)) this.down[action] = false;
  }

  bind() {
    window.addEventListener('keydown', e => {
      const tag = (e.target && e.target.tagName) || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      const action = KEY_MAP[e.key];
      if (!action) return;
      e.preventDefault();
      if (e.repeat && !DOWN_ACTIONS.has(action)) return;
      this.press(action);
    });

    window.addEventListener('keyup', e => {
      const action = KEY_MAP[e.key];
      if (action && DOWN_ACTIONS.has(action)) { e.preventDefault(); this.release(action); }
    });

    window.addEventListener('blur', () => this.clear());

    // On-screen pads (UP / DOWN / FIRE / BOMB / FLIP / PAUSE)
    document.querySelectorAll('[data-action]').forEach(el => {
      const action = el.dataset.action;
      const start = e => {
        e.preventDefault();
        el.classList.add('pressed');
        this.press(action);
        if (action === 'bomb') this.release('bomb');
      };
      const end = e => {
        e.preventDefault();
        el.classList.remove('pressed');
        this.release(action);
      };
      el.addEventListener('pointerdown', start);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('pointerleave', () => { el.classList.remove('pressed'); this.release(action); });
      el.addEventListener('contextmenu', e => e.preventDefault());
    });

    // Direct canvas control: left half steers pitch, right half fires,
    // two-finger tap or long press drops a bomb.
    const c = this.canvas;
    c.addEventListener('contextmenu', e => e.preventDefault());

    const updateFireState = () => {
      this.pointerFire = [...this.pointers.values()].some(p => p.role === 'fire');
      if (!this.pointerFire) this.clearLongPress();
    };
    const updatePitchState = () => {
      const pitch = [...this.pointers.values()].find(p => p.role === 'pitch');
      this.pointerPitch = pitch ? pitch.pitch : null;
    };

    c.addEventListener('pointerdown', e => {
      e.preventDefault();
      c.setPointerCapture?.(e.pointerId);
      const rect = c.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let role;
      if (this.pointers.size === 0) role = x < rect.width / 2 ? 'pitch' : 'fire';
      else role = 'bomb';
      const pitch = role === 'pitch' ? Math.max(-1, Math.min(1, 1 - (y / rect.height) * 2)) : 0;
      this.pointers.set(e.pointerId, { role, x, y, pitch });
      if (role === 'bomb') this.pressed.bomb = true;
      if (role === 'pitch') updatePitchState();
      if (role === 'fire') {
        updateFireState();
        this.clearLongPress();
        this.longPress = setTimeout(() => {
          if (this.pointerFire) this.pressed.bomb = true;
          this.longPress = null;
        }, 600);
      }
    });

    c.addEventListener('pointermove', e => {
      if (!this.pointers.has(e.pointerId)) return;
      e.preventDefault();
      const rect = c.getBoundingClientRect();
      const p = this.pointers.get(e.pointerId);
      p.x = e.clientX - rect.left;
      p.y = e.clientY - rect.top;
      if (p.role === 'pitch') {
        p.pitch = Math.max(-1, Math.min(1, 1 - (p.y / rect.height) * 2));
        updatePitchState();
      }
    });

    const end = e => {
      if (!this.pointers.has(e.pointerId)) return;
      e.preventDefault();
      this.pointers.delete(e.pointerId);
      updateFireState();
      updatePitchState();
    };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }
}
