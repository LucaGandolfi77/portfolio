import type { Action, Controls } from '../game/input';

/*
 * On-screen controls for phones: a joystick on the left, buttons on the
 * right. The buttons change between walking and driving.
 */
export class TouchControls {
  private stick: HTMLElement;
  private knob: HTMLElement;
  private stickId: number | null = null;
  private cx = 0;
  private cy = 0;

  constructor(private root: HTMLElement, private controls: Controls) {
    this.stick = root.querySelector('#stick')!;
    this.knob = root.querySelector('#stick-knob')!;
    this.stick.addEventListener('pointerdown', this.onStickDown);
    window.addEventListener('pointermove', this.onStickMove);
    window.addEventListener('pointerup', this.onStickUp);
    window.addEventListener('pointercancel', this.onStickUp);

    const hold = (id: string, set: (v: boolean) => void): void => {
      const el = root.querySelector<HTMLElement>(`#${id}`);
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-down');
        set(true);
      });
      const up = (): void => {
        el.classList.remove('is-down');
        set(false);
      };
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('lostpointercapture', up);
    };
    hold('t-gas', (v) => (controls.touchGas = v));
    hold('t-brake', (v) => (controls.touchBrake = v));
    hold('t-hand', (v) => (controls.touchHandbrake = v));
    hold('t-run', (v) => (controls.touchRun = v));

    const tap = (id: string, action: Action): void => {
      const el = root.querySelector<HTMLElement>(`#${id}`);
      el?.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        controls.emit(action);
      });
    };
    tap('t-enter', 'enter');
    tap('t-enter2', 'enter');
    tap('t-horn', 'horn');
    tap('t-radio', 'radio');
  }

  setMode(driving: boolean): void {
    this.root.dataset.mode = driving ? 'car' : 'foot';
  }

  private onStickDown = (e: PointerEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.stickId = e.pointerId;
    const r = this.stick.getBoundingClientRect();
    this.cx = r.left + r.width / 2;
    this.cy = r.top + r.height / 2;
    this.onStickMove(e);
  };

  private onStickMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.stickId) return;
    const max = this.stick.getBoundingClientRect().width / 2 - 10;
    let dx = e.clientX - this.cx;
    let dy = e.clientY - this.cy;
    const l = Math.hypot(dx, dy);
    if (l > max) {
      dx = (dx / l) * max;
      dy = (dy / l) * max;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.controls.stickX = dx / max;
    this.controls.stickY = -dy / max;
  };

  private onStickUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.stickId) return;
    this.stickId = null;
    this.knob.style.transform = '';
    this.controls.stickX = 0;
    this.controls.stickY = 0;
  };
}
