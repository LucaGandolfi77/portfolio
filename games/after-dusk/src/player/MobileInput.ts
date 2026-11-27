import { vibrate } from '../pwa';

export interface MobileActions {
  interact: () => void;
  light: () => void;
  phone: () => void;
  crouch: () => void;
  sprint: () => void;
  pause: () => void;
}

/** Floating dynamic left joystick + right look zone + curved thumb buttons. */
export class MobileInput {
  move = { x: 0, y: 0 };
  lookDelta = { x: 0, y: 0 };
  crouching = false;
  sprinting = false;
  grounding = false;
  private joyId: number | null = null;
  private joyOrigin = { x: 0, y: 0 };
  private lookId: number | null = null;
  private root: HTMLElement;

  constructor(container: HTMLElement, private actions: MobileActions) {
    this.root = document.createElement('div');
    this.root.className = 'mobile-controls hidden';
    this.root.innerHTML = `
      <div class="joystick-zone">
        <div class="joystick-base"><div class="joystick-knob"></div></div>
      </div>
      <div class="look-zone"></div>
      <div class="action-buttons">
        <button class="action-btn" data-a="sprint">Run</button>
        <button class="action-btn" data-a="interact">Use</button>
        <button class="action-btn" data-a="breathe">Breathe</button>
        <button class="action-btn phone-btn" data-a="phone">Phone</button>
        <button class="action-btn" data-a="light">Light</button>
        <button class="action-btn" data-a="crouch">Duck</button>
        <button class="action-btn" data-a="pause">Menu</button>
      </div>`;
    container.appendChild(this.root);
    this.bind();
  }

  get visible() { return !this.root.classList.contains('hidden'); }
  show() { this.root.classList.remove('hidden'); }
  hide() { this.root.classList.add('hidden'); }

  private bind() {
    const zone = this.root.querySelector('.joystick-zone') as HTMLElement;
    const base = this.root.querySelector('.joystick-base') as HTMLElement;
    const knob = this.root.querySelector('.joystick-knob') as HTMLElement;
    const look = this.root.querySelector('.look-zone') as HTMLElement;

    const maxR = 44;
    const updateJoy = (e: PointerEvent) => {
      let dx = e.clientX - this.joyOrigin.x;
      let dy = e.clientY - this.joyOrigin.y;
      const len = Math.hypot(dx, dy);
      if (len > maxR) { dx = (dx / len) * maxR; dy = (dy / len) * maxR; }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      this.move.x = dx / maxR;
      this.move.y = -dy / maxR;
    };

    zone.addEventListener('pointerdown', (e) => {
      this.joyId = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      const zr = zone.getBoundingClientRect();
      this.joyOrigin = { x: e.clientX, y: e.clientY };
      base.style.left = `${e.clientX - zr.left - base.offsetWidth / 2}px`;
      base.style.top = `${e.clientY - zr.top - base.offsetHeight / 2}px`;
      base.classList.add('active');
      updateJoy(e);
    });
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === this.joyId) updateJoy(e); });
    const endJoy = (e: PointerEvent) => {
      if (e.pointerId !== this.joyId) return;
      this.joyId = null;
      this.move.x = this.move.y = 0;
      knob.style.transform = 'translate(0,0)';
      base.classList.remove('active');
    };
    zone.addEventListener('pointerup', endJoy);
    zone.addEventListener('pointercancel', endJoy);

    let lx = 0, ly = 0;
    look.addEventListener('pointerdown', (e) => {
      this.lookId = e.pointerId;
      lx = e.clientX; ly = e.clientY;
      look.setPointerCapture(e.pointerId);
    });
    look.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.lookId) return;
      this.lookDelta.x += (e.clientX - lx) * 0.0042;
      this.lookDelta.y += (e.clientY - ly) * 0.0042;
      lx = e.clientX; ly = e.clientY;
    });
    const endLook = (e: PointerEvent) => { if (e.pointerId === this.lookId) this.lookId = null; };
    look.addEventListener('pointerup', endLook);
    look.addEventListener('pointercancel', endLook);

    this.root.querySelectorAll<HTMLButtonElement>('.action-btn').forEach((btn) => {
      const action = btn.dataset.a!;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation();
        vibrate(10);
        if (action === 'crouch') { this.crouching = !this.crouching; btn.classList.toggle('on', this.crouching); }
        if (action === 'sprint') { this.sprinting = true; btn.classList.add('on'); }
        if (action === 'breathe') { this.grounding = true; btn.classList.add('on'); return; }
        (this.actions[action as keyof MobileActions] as (() => void) | undefined)?.();
      });
      const release = () => {
        if (action === 'sprint') { this.sprinting = false; btn.classList.remove('on'); }
        if (action === 'breathe') { this.grounding = false; btn.classList.remove('on'); }
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
    });
  }
}
