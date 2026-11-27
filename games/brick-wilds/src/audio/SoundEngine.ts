export type MusicMood = 'off' | 'hub' | 'combat' | 'boss';

/**
 * 100% Procedural Web Audio API Sound Engine + Dynamic Adaptive Soundtrack.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  muted = false;
  musicEnabled = true;
  private mood: MusicMood = 'off';
  private stepIdx = 0;
  private musicTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.ensure();
      };
      window.addEventListener('pointerdown', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }
  }

  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private tone(freq: number, endFreq: number, duration: number, type: OscillatorType, gainPeak = 0.12): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  setMusicMood(mood: MusicMood): void {
    if (this.mood === mood) return;
    this.mood = mood;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (mood === 'off' || typeof window === 'undefined') return;

    const tempoMs = mood === 'boss' ? 190 : mood === 'combat' ? 240 : 340;
    const hubNotes = [261.6, 329.6, 392.0, 523.3, 392.0, 329.6, 293.7, 392.0];
    const combatNotes = [220.0, 261.6, 329.6, 293.7, 220.0, 349.2, 329.6, 261.6];
    const bossNotes = [146.8, 174.6, 220.0, 207.7, 146.8, 233.1, 220.0, 174.6];

    this.musicTimer = window.setInterval(() => {
      if (this.muted || !this.musicEnabled || !this.ctx || this.ctx.state !== 'running') return;
      const scale = this.mood === 'boss' ? bossNotes : this.mood === 'combat' ? combatNotes : hubNotes;
      const note = scale[this.stepIdx % scale.length];
      if (this.mood === 'hub') {
        this.tone(note * 2, note * 2, 0.16, 'triangle', 0.032);
      } else if (this.mood === 'combat') {
        this.tone(note, note * 0.99, 0.14, 'triangle', 0.042);
        if (this.stepIdx % 2 === 0) this.tone(110, 55, 0.08, 'sine', 0.04);
      } else {
        this.tone(note, note * 0.98, 0.15, 'sawtooth', 0.035);
        this.tone(95, 42, 0.09, 'square', 0.045);
      }
      this.stepIdx++;
    }, tempoMs);
  }

  playPip(value: number): void {
    const base = value >= 500 ? 1120 : value >= 100 ? 880 : 660;
    this.tone(base, base * 1.45, 0.09, 'triangle', 0.1);
  }

  playBrickSnap(): void {
    this.tone(420, 190, 0.06, 'square', 0.08);
    setTimeout(() => this.tone(680, 480, 0.05, 'triangle', 0.07), 35);
  }

  playBuild(): void {
    this.tone(320, 520, 0.07, 'square', 0.08);
    setTimeout(() => this.tone(520, 780, 0.08, 'triangle', 0.09), 50);
  }

  playDash(): void {
    this.tone(620, 210, 0.14, 'sine', 0.11);
    this.tone(920, 440, 0.1, 'triangle', 0.07);
  }

  playPerfectDodge(): void {
    this.tone(880, 1760, 0.22, 'sine', 0.13);
    setTimeout(() => this.tone(1320, 1760, 0.18, 'triangle', 0.1), 65);
  }

  playCombo(): void {
    this.tone(520, 1040, 0.14, 'sawtooth', 0.13);
    setTimeout(() => this.tone(780, 1560, 0.22, 'triangle', 0.13), 60);
  }

  playWeaponSwitch(): void {
    this.tone(480, 740, 0.08, 'triangle', 0.09);
  }

  playSpecial(): void {
    this.tone(320, 980, 0.22, 'sawtooth', 0.13);
    setTimeout(() => this.tone(640, 1280, 0.2, 'triangle', 0.12), 70);
  }

  playSuperEffective(): void {
    this.tone(740, 1180, 0.11, 'triangle', 0.1);
  }

  playShoot(kind: 'arrow' | 'spear' | 'bomb' | 'hammer' | 'disc'): void {
    if (kind === 'arrow') this.tone(540, 260, 0.09, 'triangle', 0.1);
    else if (kind === 'spear') this.tone(360, 620, 0.12, 'sawtooth', 0.08);
    else if (kind === 'bomb') this.tone(240, 140, 0.14, 'sine', 0.11);
    else if (kind === 'disc') this.tone(720, 220, 0.16, 'sawtooth', 0.12);
    else this.tone(180, 70, 0.16, 'square', 0.14);
  }

  playInfuse(): void {
    this.tone(520, 1280, 0.18, 'sine', 0.11);
  }

  playWeakPointBreak(): void {
    this.tone(860, 1420, 0.12, 'triangle', 0.13);
    setTimeout(() => this.tone(320, 90, 0.24, 'sawtooth', 0.13), 50);
  }

  playExplosion(): void {
    this.tone(170, 42, 0.3, 'sawtooth', 0.16);
    this.tone(110, 38, 0.28, 'square', 0.11);
  }

  playVisorScan(): void {
    this.tone(440, 980, 0.22, 'sine', 0.09);
  }

  playHurt(): void {
    this.tone(240, 95, 0.18, 'sawtooth', 0.13);
  }

  playVictory(): void {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, n * 1.02, 0.2, 'triangle', 0.11), idx * 95);
    });
  }
}
