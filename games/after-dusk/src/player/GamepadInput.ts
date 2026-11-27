export interface GamepadActions {
  interact: () => void;
  light: () => void;
  phone: () => void;
  pause: () => void;
}

/** Standard Gamepad API polling with deadzones and rising-edge button triggers. */
export class GamepadInput {
  move = { x: 0, y: 0 };
  look = { x: 0, y: 0 };
  sprint = false;
  breathe = false;
  connected = false;
  private prev = new Map<number, boolean>();

  constructor(private actions: GamepadActions) {}

  private dz(v: number, threshold = 0.14): number {
    return Math.abs(v) < threshold ? 0 : (v - Math.sign(v) * threshold) / (1 - threshold);
  }

  private edge(idx: number, pressed: boolean): boolean {
    const was = this.prev.get(idx) ?? false;
    this.prev.set(idx, pressed);
    return pressed && !was;
  }

  update() {
    const pads = navigator.getGamepads?.();
    const gp = pads ? [...pads].find((p) => p && p.connected) : null;
    if (!gp) {
      this.connected = false;
      this.move.x = this.move.y = this.look.x = this.look.y = 0;
      this.sprint = this.breathe = false;
      return;
    }
    this.connected = true;
    this.move.x = this.dz(gp.axes[0] ?? 0);
    this.move.y = this.dz(gp.axes[1] ?? 0);
    this.look.x = this.dz(gp.axes[2] ?? 0);
    this.look.y = this.dz(gp.axes[3] ?? 0);
    this.sprint = !!(gp.buttons[10]?.pressed || gp.buttons[4]?.pressed);
    this.breathe = !!gp.buttons[5]?.pressed;

    if (this.edge(0, !!gp.buttons[0]?.pressed)) this.actions.interact();
    if (this.edge(2, !!gp.buttons[2]?.pressed)) this.actions.light();
    if (this.edge(3, !!gp.buttons[3]?.pressed)) this.actions.phone();
    if (this.edge(9, !!gp.buttons[9]?.pressed)) this.actions.pause();
  }
}
