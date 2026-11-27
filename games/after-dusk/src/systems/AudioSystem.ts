import * as THREE from 'three';
import type { GameState } from '../game/GameState';

/**
 * Procedural 3D Web Audio soundscape: panic-scaled heartbeat, surface-aware
 * footsteps, grounding chime, phone ring/connect/static, and Shadow stingers.
 */
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private beatTimer = 0;

  constructor(private state: GameState) {}

  private ensure(): AudioContext | null {
    if (this.state.muted) return null;
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.state.sfxVolume;
        this.master.connect(this.ctx.destination);

        // Subtle nocturnal sub-drone
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 54;
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.025 * this.state.musicVolume;
        osc.connect(this.droneGain);
        this.droneGain.connect(this.master);
        osc.start();
      } catch {
        return null;
      }
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  applyVolumes() {
    if (this.master) this.master.gain.value = this.state.muted ? 0 : this.state.sfxVolume;
    if (this.droneGain) this.droneGain.gain.value = this.state.muted ? 0 : 0.025 * this.state.musicVolume;
  }

  update(dt: number, panic: number, threat: number) {
    if (this.state.phase !== 'playing' || this.state.muted) return;
    const intensity = Math.max(panic, threat) / 100;
    if (intensity < 0.35) return;
    const interval = Math.max(0.36, 1.05 - intensity * 0.65);
    this.beatTimer -= dt;
    if (this.beatTimer <= 0) {
      this.beatTimer = interval;
      this.heartbeat(intensity);
    }
  }

  private heartbeat(intensity: number) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    for (const offset of [0, 0.16]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(62, now + offset);
      osc.frequency.exponentialRampToValueAtTime(34, now + offset + 0.12);
      g.gain.setValueAtTime(0.08 * intensity, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);
      osc.connect(g);
      g.connect(this.master);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    }
  }

  play(name: string, at?: THREE.Vector3, listener?: THREE.Vector3) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;

    let pan = 0;
    if (at && listener) {
      pan = Math.max(-0.9, Math.min(0.9, (at.x - listener.x) / 8));
    }
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(this.master);

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(panner);

    if (name === 'step') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110 + Math.random() * 25, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now); osc.stop(now + 0.08);
    } else if (name === 'ring') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(660, now + 0.14);
      g.gain.setValueAtTime(0.11, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.36);
    } else if (name === 'connect' || name === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.22);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.26);
    } else if (name === 'stinger' || name === 'capture') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(name === 'capture' ? 92 : 160, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.55);
      g.gain.setValueAtTime(name === 'capture' ? 0.22 : 0.12, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      osc.start(now); osc.stop(now + 0.6);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now); osc.stop(now + 0.1);
    }
  }
}
