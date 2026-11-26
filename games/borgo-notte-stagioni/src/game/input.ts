/*
 * Keyboard, touch buttons and camera drag folded into one state. The touch
 * layer (ui/touch.ts) writes into the same fields as the keyboard.
 */

export type Action = 'enter' | 'horn' | 'radio' | 'camera' | 'pause' | 'map' | 'job' | 'jetpack';

export class Controls {
  /** On foot: x right, y forward. In a car: steer, throttle/brake. */
  stickX = 0;
  stickY = 0;
  touchGas = false;
  touchBrake = false;
  touchHandbrake = false;
  touchRun = false;
  touchUp = false;
  touchDown = false;
  /** Camera orbit offset from dragging (radians), eased back to zero. */
  orbit = 0;
  pitch = 0;
  dragging = false;
  private keys = new Set<string>();
  private listeners = new Set<(a: Action) => void>();
  private drag: { id: number; x: number; y: number } | null = null;

  constructor(surface: HTMLElement) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
    surface.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  on(listener: (a: Action) => void): void {
    this.listeners.add(listener);
  }

  emit(action: Action): void {
    for (const l of this.listeners) l(action);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) {
      this.keys.add(e.code);
      return;
    }
    this.keys.add(e.code);
    const map: Record<string, Action> = {
      KeyE: 'enter',
      KeyF: 'enter',
      Enter: 'enter',
      KeyH: 'horn',
      KeyR: 'radio',
      KeyC: 'camera',
      Escape: 'pause',
      KeyP: 'pause',
      KeyM: 'map',
      KeyJ: 'job',
      KeyG: 'jetpack'
    };
    const action = map[e.code];
    if (action) {
      e.preventDefault();
      this.emit(action);
    }
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  };

  private onPointerDown = (e: PointerEvent): void => {
    if (this.drag) return;
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    this.dragging = true;
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    const dx = e.clientX - this.drag.x;
    const dy = e.clientY - this.drag.y;
    this.drag.x = e.clientX;
    this.drag.y = e.clientY;
    this.orbit -= dx * 0.008;
    this.pitch = Math.max(-0.35, Math.min(0.5, this.pitch + dy * 0.004));
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (this.drag && e.pointerId === this.drag.id) {
      this.drag = null;
      this.dragging = false;
    }
  };

  private key(...codes: string[]): boolean {
    return codes.some((c) => this.keys.has(c));
  }

  get forward(): number {
    const k = (this.key('KeyW', 'ArrowUp') ? 1 : 0) - (this.key('KeyS', 'ArrowDown') ? 1 : 0);
    return k !== 0 ? k : this.stickY;
  }

  get side(): number {
    const k = (this.key('KeyD', 'ArrowRight') ? 1 : 0) - (this.key('KeyA', 'ArrowLeft') ? 1 : 0);
    return k !== 0 ? k : this.stickX;
  }

  get run(): boolean {
    return this.key('ShiftLeft', 'ShiftRight') || this.touchRun;
  }

  get throttle(): number {
    if (this.key('KeyW', 'ArrowUp') || this.touchGas) return 1;
    return 0;
  }

  get brake(): number {
    if (this.key('KeyS', 'ArrowDown') || this.touchBrake) return 1;
    return 0;
  }

  get steer(): number {
    /* Positive steer turns left (heading increases). */
    const k = (this.key('KeyA', 'ArrowLeft') ? 1 : 0) - (this.key('KeyD', 'ArrowRight') ? 1 : 0);
    if (k !== 0) return k;
    return -this.stickX;
  }

  /** Jetpack: climb (Space, SU) and descend (Q or Ctrl, GIÙ). */
  get ascend(): boolean {
    return this.key('Space') || this.touchUp;
  }

  get descend(): boolean {
    return this.key('KeyQ', 'ControlLeft', 'ControlRight') || this.touchDown;
  }

  get handbrake(): boolean {
    return this.key('Space') || this.touchHandbrake;
  }

  /** Eases the drag orbit back behind the target when not dragging. */
  relax(dt: number): void {
    if (this.dragging) return;
    this.orbit *= Math.exp(-dt * 0.9);
    this.pitch *= Math.exp(-dt * 0.9);
  }
}
