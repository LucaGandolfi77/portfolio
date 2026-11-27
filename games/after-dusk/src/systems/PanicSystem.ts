import { CONFIG } from '../game/GameConfig';
import type { GameState } from '../game/GameState';

/**
 * Manages Emma's nyctophobia anxiety (`panic` 0..100), LightPool relief,
 * Grounding/Deep Breath calming, and Composure resilience.
 */
export class PanicSystem {
  private wasHigh = false;

  update(
    dt: number,
    state: GameState,
    lightExposure: number,
    connected: boolean,
    groundingHeld: boolean,
    proximity = 0
  ): { grounded: boolean; highPanicEntered: boolean } {
    if (state.phase !== 'playing') return { grounded: false, highPanicEntered: false };

    state.lightExposure = Math.max(0, Math.min(1, lightExposure));
    const composureMitigation = 1 - (state.composure / 100) * 0.35;

    let delta = 0;
    if (lightExposure >= 0.4) {
      delta = -(4.5 + lightExposure * 3.0);
      if (connected) delta -= 3.5;
    } else {
      const darkness = 1 - lightExposure / 0.4;
      delta = 3.4 * darkness * state.difficultyFactor.panic * composureMitigation;
      if (state.flashlightOn) delta *= 0.45;
      if (connected) delta *= 0.32;
    }

    delta += proximity * 5.2;

    let grounded = false;
    if (groundingHeld) {
      state.groundingProgress = Math.min(1, state.groundingProgress + dt / CONFIG.groundingDuration);
      delta -= 4.0;
      if (state.groundingProgress >= 1) {
        state.groundingProgress = 0;
        state.panic = Math.max(0, state.panic - 28);
        state.addComposure(3);
        grounded = true;
      }
    } else {
      state.groundingProgress = Math.max(0, state.groundingProgress - dt * 1.5);
    }

    state.panic = Math.max(0, Math.min(CONFIG.panicMax, state.panic + delta * dt));
    const high = state.panic >= 75;
    const highPanicEntered = high && !this.wasHigh;
    this.wasHigh = high;

    return { grounded, highPanicEntered };
  }

  change(state: GameState, delta: number) {
    state.panic = Math.max(0, Math.min(CONFIG.panicMax, state.panic + delta));
  }
}
