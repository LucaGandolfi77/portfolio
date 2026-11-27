import * as THREE from 'three';
import { CONFIG } from '../game/GameConfig';
import type { GameState } from '../game/GameState';
import type { World } from '../world/Interactable';
import type { GamepadInput } from './GamepadInput';
import type { MobileInput } from './MobileInput';

export class FirstPersonController {
  readonly position = new THREE.Vector3(0, CONFIG.eyeHeight, 0);
  readonly velocity = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  private keys = new Set<string>();
  private pointerLocked = false;
  private bob = 0;
  private stepDist = 0;
  private dragging = false;
  private lastDrag = { x: 0, y: 0 };
  private gyroDelta = { x: 0, y: 0 };
  private lastGyro: { beta: number; gamma: number } | null = null;
  onStep?: () => void;

  constructor(
    private camera: THREE.PerspectiveCamera,
    public world: World,
    private dom: HTMLElement,
    public mobile: MobileInput | null,
    public gamepad: GamepadInput | null = null
  ) {
    this.bind();
  }

  get locked() { return this.pointerLocked; }
  get isCrouching() { return this.keys.has('ControlLeft') || this.keys.has('KeyC') || !!this.mobile?.crouching; }
  get isSprinting() { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || !!this.mobile?.sprinting || !!this.gamepad?.sprint; }
  get isGrounding() { return this.keys.has('KeyB') || !!this.mobile?.grounding || !!this.gamepad?.breathe; }

  private bind() {
    window.addEventListener('keydown', (e) => { this.keys.add(e.code); });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); });
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.dom;
    });

    this.dom.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked && !this.dragging) return;
      const dx = this.pointerLocked ? e.movementX : e.clientX - this.lastDrag.x;
      const dy = this.pointerLocked ? e.movementY : e.clientY - this.lastDrag.y;
      this.lastDrag = { x: e.clientX, y: e.clientY };
      this.yaw -= dx * CONFIG.mouseSensitivity;
      this.pitch -= dy * CONFIG.mouseSensitivity;
      this.pitch = Math.max(-1.42, Math.min(1.42, this.pitch));
    });

    this.dom.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.lastDrag = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { this.dragging = false; });

    window.addEventListener('deviceorientation', (e) => {
      if (e.beta == null || e.gamma == null) return;
      if (this.lastGyro) {
        const db = e.beta - this.lastGyro.beta;
        const dg = e.gamma - this.lastGyro.gamma;
        if (Math.abs(db) < 15 && Math.abs(dg) < 15) {
          this.gyroDelta.x += dg * 0.008;
          this.gyroDelta.y += db * 0.008;
        }
      }
      this.lastGyro = { beta: e.beta, gamma: e.gamma };
    });
  }

  lock() {
    if (this.dom.requestPointerLock && !this.mobile) {
      try { this.dom.requestPointerLock(); } catch { /* ignored */ }
    }
  }

  unlock() {
    if (document.pointerLockElement) document.exitPointerLock();
  }

  syncFrom(state: GameState) {
    this.position.set(state.position[0], state.position[1], state.position[2]);
    this.yaw = state.yaw;
    this.pitch = state.pitch;
  }

  syncTo(state: GameState) {
    state.position = [this.position.x, this.position.y, this.position.z];
    state.yaw = this.yaw;
    state.pitch = this.pitch;
  }

  update(dt: number, state: GameState, canMove = true) {
    const inv = state.invertY ? -1 : 1;

    if (this.mobile) {
      this.yaw -= this.mobile.lookDelta.x;
      this.pitch -= this.mobile.lookDelta.y * inv;
      this.mobile.lookDelta.x = 0;
      this.mobile.lookDelta.y = 0;
    }

    if (state.gyroAim) {
      this.yaw -= this.gyroDelta.x;
      this.pitch -= this.gyroDelta.y * inv;
    }
    this.gyroDelta.x = 0;
    this.gyroDelta.y = 0;

    if (this.gamepad) {
      this.yaw -= this.gamepad.look.x * dt * 2.2;
      this.pitch -= this.gamepad.look.y * dt * 1.8 * inv;
    }
    this.pitch = Math.max(-1.42, Math.min(1.42, this.pitch));

    let mx = 0, mz = 0;
    if (canMove) {
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) mz -= 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) mz += 1;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) mx -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) mx += 1;
      if (this.mobile) {
        mx += this.mobile.move.x;
        mz -= this.mobile.move.y;
      }
      if (this.gamepad) {
        mx += this.gamepad.move.x;
        mz += this.gamepad.move.y;
      }
    }

    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }

    let speed = this.isCrouching ? CONFIG.crouchSpeed : this.isSprinting ? CONFIG.sprintSpeed : CONFIG.walkSpeed;
    if (this.isGrounding) speed *= 0.25;

    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const wx = mx * cos + mz * sin;
    const wz = -mx * sin + mz * cos;

    const targetVx = wx * speed;
    const targetVz = wz * speed;
    const accel = Math.min(1, dt * (len > 0.05 ? CONFIG.acceleration : CONFIG.damping));
    this.velocity.x += (targetVx - this.velocity.x) * accel;
    this.velocity.z += (targetVz - this.velocity.z) * accel;

    const prevX = this.position.x, prevZ = this.position.z;
    this.position.x += this.velocity.x * dt;
    this.resolveCollisions('x');
    this.position.z += this.velocity.z * dt;
    this.resolveCollisions('z');

    const b = this.world.bounds;
    this.position.x = Math.max(b.min.x + 0.35, Math.min(b.max.x - 0.35, this.position.x));
    this.position.z = Math.max(b.min.z + 0.35, Math.min(b.max.z - 0.35, this.position.z));

    const targetY = this.isCrouching ? CONFIG.crouchHeight : CONFIG.eyeHeight;
    this.position.y += (targetY - this.position.y) * Math.min(1, dt * 10);

    const moved = Math.hypot(this.position.x - prevX, this.position.z - prevZ);
    if (moved > 0.002) {
      this.bob += moved * 2.5;
      this.stepDist += moved;
      if (this.stepDist >= (this.isSprinting ? 1.35 : 1.75)) {
        this.stepDist = 0;
        this.onStep?.();
      }
    }

    const panicSway = Math.sin(performance.now() * 0.006) * (state.panic / 100) * 0.009;
    this.camera.position.set(
      this.position.x,
      this.position.y + Math.sin(this.bob) * 0.032 + panicSway,
      this.position.z
    );
    this.camera.rotation.set(this.pitch + panicSway * 0.4, this.yaw, 0);
    this.syncTo(state);
  }

  private resolveCollisions(axis: 'x' | 'z') {
    const r = 0.28;
    for (const box of this.world.colliders) {
      if (this.position.y < box.min.y - 0.1 || this.position.y - 1.4 > box.max.y) continue;
      if (
        this.position.x + r > box.min.x && this.position.x - r < box.max.x &&
        this.position.z + r > box.min.z && this.position.z - r < box.max.z
      ) {
        const cx = (box.min.x + box.max.x) / 2;
        const cz = (box.min.z + box.max.z) / 2;
        if (axis === 'x') {
          this.position.x = this.position.x < cx ? box.min.x - r : box.max.x + r;
          this.velocity.x = 0;
        } else {
          this.position.z = this.position.z < cz ? box.min.z - r : box.max.z + r;
          this.velocity.z = 0;
        }
      }
    }
  }
}
