import * as THREE from 'three';
import type { QuickBuildId } from '../data/advanced';
import type { WeaponModeId } from '../data/types';

export interface PlayerInputState {
  moveX: number;
  moveZ: number;
  aimX: number;
  aimZ: number;
  hasExplicitAim: boolean;
  attackHeld: boolean;
  attackJustPressed: boolean;
  jumpJustPressed: boolean;
  dashJustPressed: boolean;
  specialJustPressed: boolean;
  visorJustPressed: boolean;
  interactJustPressed: boolean;
  weaponModeSelect: WeaponModeId | null;
  cycleWeaponJustPressed: boolean;
  quickBuild: QuickBuildId | null;
}

function emptyInput(): PlayerInputState {
  return {
    moveX: 0,
    moveZ: 0,
    aimX: 0,
    aimZ: 1,
    hasExplicitAim: false,
    attackHeld: false,
    attackJustPressed: false,
    jumpJustPressed: false,
    dashJustPressed: false,
    specialJustPressed: false,
    visorJustPressed: false,
    interactJustPressed: false,
    weaponModeSelect: null,
    cycleWeaponJustPressed: false,
    quickBuild: null,
  };
}

/**
 * Unified 2-Player Local Co-op Input Manager:
 * - P1: WASD + Mouse Aim/LClick (or J) · Shift/RClick Dash · Space Jump · E Special · 1-4/Tab/R/Wheel Weapon Mode · Q Holo-Visor · F Interact
 * - P2: Arrows + Enter/RShift Attack · RCtrl/Comma Dash · Period/Numpad0 Jump · Slash/Numpad2 Special · Backslash/Numpad4 Cycle Weapon · Gamepad 1
 */
export class InputManager {
  private readonly keys = new Set<string>();
  private readonly justPressed = new Set<string>();
  private mouseDown = false;
  private mouseJustPressed = false;
  private rightMouseJustPressed = false;
  private wheelCyclePulse = false;
  readonly mouseClient = { x: 0, y: 0, moved: false };
  private readonly prevPadButtons: [boolean[], boolean[]] = [[], []];

  // Touch & HUD button state for P1
  readonly touchState = {
    moveX: 0,
    moveZ: 0,
    aimX: 0,
    aimZ: 0,
    attackHeld: false,
    attackPulse: false,
    jumpPulse: false,
    dashPulse: false,
    specialPulse: false,
    visorPulse: false,
    interactPulse: false,
    cycleWeaponPulse: false,
    selectWeaponMode: null as WeaponModeId | null,
    quickBuildPulse: null as QuickBuildId | null,
  };

  private readonly targetEl: HTMLElement;
  private readonly onKeyDownBound: (e: KeyboardEvent) => void;
  private readonly onKeyUpBound: (e: KeyboardEvent) => void;
  private readonly onMouseMoveBound: (e: MouseEvent) => void;
  private readonly onMouseDownBound: (e: MouseEvent) => void;
  private readonly onMouseUpBound: () => void;
  private readonly onContextMenuBound: (e: MouseEvent) => void;
  private readonly onWheelBound: (e: WheelEvent) => void;

  constructor(targetEl: HTMLElement) {
    this.targetEl = targetEl;

    this.onKeyDownBound = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
    };
    this.onKeyUpBound = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };
    this.onMouseMoveBound = (e: MouseEvent) => {
      const rect = this.targetEl.getBoundingClientRect();
      this.mouseClient.x = e.clientX - rect.left;
      this.mouseClient.y = e.clientY - rect.top;
      this.mouseClient.moved = true;
    };
    this.onMouseDownBound = (e: MouseEvent) => {
      if (e.button === 0) {
        this.mouseDown = true;
        this.mouseJustPressed = true;
      } else if (e.button === 2) {
        this.rightMouseJustPressed = true;
      }
    };
    this.onMouseUpBound = () => {
      this.mouseDown = false;
    };
    this.onContextMenuBound = (e: MouseEvent) => {
      e.preventDefault();
    };
    this.onWheelBound = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 12) {
        this.wheelCyclePulse = true;
      }
    };

    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    this.targetEl.addEventListener('mousemove', this.onMouseMoveBound);
    this.targetEl.addEventListener('mousedown', this.onMouseDownBound);
    this.targetEl.addEventListener('contextmenu', this.onContextMenuBound);
    this.targetEl.addEventListener('wheel', this.onWheelBound, { passive: true });
    window.addEventListener('mouseup', this.onMouseUpBound);
  }

  pollPlayer(
    playerIndex: 0 | 1,
    heroPos: THREE.Vector3,
    mouseWorldPos: THREE.Vector3 | null,
  ): PlayerInputState {
    const out = emptyInput();

    if (playerIndex === 0) {
      if (this.keys.has('KeyA')) out.moveX -= 1;
      if (this.keys.has('KeyD')) out.moveX += 1;
      if (this.keys.has('KeyW')) out.moveZ -= 1;
      if (this.keys.has('KeyS')) out.moveZ += 1;

      if (Math.abs(this.touchState.moveX) > 0.08 || Math.abs(this.touchState.moveZ) > 0.08) {
        out.moveX = this.touchState.moveX;
        out.moveZ = this.touchState.moveZ;
      }

      if (this.mouseClient.moved && mouseWorldPos) {
        const dx = mouseWorldPos.x - heroPos.x;
        const dz = mouseWorldPos.z - heroPos.z;
        const len = Math.hypot(dx, dz);
        if (len > 0.25) {
          out.aimX = dx / len;
          out.aimZ = dz / len;
          out.hasExplicitAim = true;
        }
      }

      if (Math.hypot(this.touchState.aimX, this.touchState.aimZ) > 0.2) {
        out.aimX = this.touchState.aimX;
        out.aimZ = this.touchState.aimZ;
        out.hasExplicitAim = true;
      }

      out.attackHeld = this.mouseDown || this.keys.has('KeyJ') || this.touchState.attackHeld;
      out.attackJustPressed = this.mouseJustPressed || this.justPressed.has('KeyJ') || this.touchState.attackPulse;
      out.jumpJustPressed = this.justPressed.has('Space') || this.touchState.jumpPulse;
      out.dashJustPressed =
        this.justPressed.has('ShiftLeft') || this.rightMouseJustPressed || this.touchState.dashPulse;
      out.specialJustPressed =
        this.justPressed.has('KeyE') || this.justPressed.has('KeyK') || this.touchState.specialPulse;
      out.visorJustPressed = this.justPressed.has('KeyQ') || this.touchState.visorPulse;
      out.interactJustPressed = this.justPressed.has('KeyF') || this.touchState.interactPulse;
      out.cycleWeaponJustPressed =
        this.justPressed.has('Tab') ||
        this.justPressed.has('KeyR') ||
        this.wheelCyclePulse ||
        this.touchState.cycleWeaponPulse;

      if (this.justPressed.has('Digit1')) out.weaponModeSelect = 'standard';
      else if (this.justPressed.has('Digit2')) out.weaponModeSelect = 'fire';
      else if (this.justPressed.has('Digit3')) out.weaponModeSelect = 'frost';
      else if (this.justPressed.has('Digit4')) out.weaponModeSelect = 'shock';
      else if (this.touchState.selectWeaponMode) out.weaponModeSelect = this.touchState.selectWeaponMode;

      if (this.justPressed.has('KeyZ')) out.quickBuild = 'shield-wall';
      else if (this.justPressed.has('KeyX')) out.quickBuild = 'jump-pad';
      else if (this.justPressed.has('KeyC')) out.quickBuild = 'elem-turret';
      else if (this.touchState.quickBuildPulse) out.quickBuild = this.touchState.quickBuildPulse;
    } else {
      if (this.keys.has('ArrowLeft')) out.moveX -= 1;
      if (this.keys.has('ArrowRight')) out.moveX += 1;
      if (this.keys.has('ArrowUp')) out.moveZ -= 1;
      if (this.keys.has('ArrowDown')) out.moveZ += 1;

      out.attackHeld = this.keys.has('Enter') || this.keys.has('ShiftRight') || this.keys.has('Numpad1');
      out.attackJustPressed =
        this.justPressed.has('Enter') || this.justPressed.has('ShiftRight') || this.justPressed.has('Numpad1');
      out.jumpJustPressed = this.justPressed.has('Period') || this.justPressed.has('Numpad0');
      out.dashJustPressed =
        this.justPressed.has('ControlRight') || this.justPressed.has('Comma') || this.justPressed.has('Numpad3');
      out.specialJustPressed = this.justPressed.has('Slash') || this.justPressed.has('Numpad2');
      out.cycleWeaponJustPressed = this.justPressed.has('Backslash') || this.justPressed.has('Numpad4');
      out.visorJustPressed = this.justPressed.has('BracketRight');
      out.interactJustPressed = this.justPressed.has('Quote') || this.justPressed.has('Semicolon');
    }

    // Merge Gamepad API input
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads[playerIndex];
    if (pad) {
      const deadzone = 0.2;
      if (Math.abs(pad.axes[0] ?? 0) > deadzone) out.moveX = pad.axes[0];
      if (Math.abs(pad.axes[1] ?? 0) > deadzone) out.moveZ = pad.axes[1];
      if (Math.hypot(pad.axes[2] ?? 0, pad.axes[3] ?? 0) > 0.3) {
        out.aimX = pad.axes[2];
        out.aimZ = pad.axes[3];
        out.hasExplicitAim = true;
      }

      const prev = this.prevPadButtons[playerIndex];
      const isDown = (idx: number) => Boolean(pad.buttons[idx]?.pressed);
      const just = (idx: number) => isDown(idx) && !prev[idx];

      if (isDown(2) || isDown(7)) out.attackHeld = true;
      if (just(2) || just(7)) out.attackJustPressed = true;
      if (just(0)) out.jumpJustPressed = true;
      if (just(1) || just(4)) out.dashJustPressed = true;
      if (just(3) || just(6)) out.specialJustPressed = true;
      if (just(5)) out.cycleWeaponJustPressed = true;
      if (just(9)) out.interactJustPressed = true;

      this.prevPadButtons[playerIndex] = pad.buttons.map((b) => b.pressed);
    }

    const moveLen = Math.hypot(out.moveX, out.moveZ);
    if (moveLen > 1) {
      out.moveX /= moveLen;
      out.moveZ /= moveLen;
    }

    return out;
  }

  shouldAutoJoinP2(): boolean {
    if (
      this.justPressed.has('ArrowUp') ||
      this.justPressed.has('ArrowDown') ||
      this.justPressed.has('ArrowLeft') ||
      this.justPressed.has('ArrowRight') ||
      this.justPressed.has('Enter')
    ) {
      return true;
    }
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (pads[1]?.buttons.some((b) => b.pressed)) return true;
    return false;
  }

  wasKeyJustPressed(code: string): boolean {
    return this.justPressed.has(code);
  }

  endFrame(): void {
    this.justPressed.clear();
    this.mouseJustPressed = false;
    this.rightMouseJustPressed = false;
    this.wheelCyclePulse = false;
    this.touchState.attackPulse = false;
    this.touchState.jumpPulse = false;
    this.touchState.dashPulse = false;
    this.touchState.specialPulse = false;
    this.touchState.visorPulse = false;
    this.touchState.interactPulse = false;
    this.touchState.cycleWeaponPulse = false;
    this.touchState.selectWeaponMode = null;
    this.touchState.quickBuildPulse = null;
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    this.targetEl.removeEventListener('mousemove', this.onMouseMoveBound);
    this.targetEl.removeEventListener('mousedown', this.onMouseDownBound);
    this.targetEl.removeEventListener('contextmenu', this.onContextMenuBound);
    this.targetEl.removeEventListener('wheel', this.onWheelBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
  }
}
