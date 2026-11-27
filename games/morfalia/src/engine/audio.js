/* ===== MORFALIA · Cozy Procedural Web Audio Engine ===== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.stepIdx = 0;
    this.currentHarmony = 1;
  }

  unlock() {
    if (this.muted) return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.musicTimer) {
      this.startAmbience();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    } else if (!this.muted) {
      this.unlock();
    }
    return this.muted;
  }

  setHarmonyLevel(lv) {
    this.currentHarmony = Math.max(1, Math.min(5, lv));
  }

  tone(freq, dur = 0.14, type = 'sine', vol = 0.08, delay = 0, slideTo = null) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  startAmbience() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    // Warm cozy pentatonic kalimba arpeggio
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const pattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 4, 6, 5, 4, 3, 2, 1];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const idx = pattern[this.stepIdx % pattern.length];
      this.stepIdx++;
      const note = scale[idx];
      // Higher harmony adds warm shimmer octave
      this.tone(note, 0.85, 'sine', 0.026);
      if (this.currentHarmony >= 3 && this.stepIdx % 2 === 0) {
        this.tone(note * 1.5, 0.65, 'triangle', 0.012, 0.08);
      }
      if (this.currentHarmony >= 4 && this.stepIdx % 4 === 0) {
        this.tone(note * 2, 0.55, 'sine', 0.01, 0.16);
      }
    }, 1150);
  }

  playStep() {
    this.tone(140 + Math.random() * 40, 0.045, 'triangle', 0.022);
  }

  playGather() {
    this.tone(440, 0.08, 'sine', 0.07, 0, 580);
    this.tone(660, 0.1, 'triangle', 0.06, 0.05);
  }

  playPower(powerId) {
    switch (powerId) {
      case 'sprout':
        this.tone(330, 0.11, 'sine', 0.07, 0, 490);
        this.tone(523, 0.14, 'triangle', 0.06, 0.06, 659);
        break;
      case 'splash':
        this.tone(520, 0.09, 'sine', 0.06, 0, 320);
        this.tone(680, 0.11, 'sine', 0.05, 0.06, 460);
        break;
      case 'flame':
        this.tone(180, 0.14, 'sawtooth', 0.045, 0, 290);
        this.tone(260, 0.12, 'triangle', 0.04, 0.05, 160);
        break;
      case 'cut':
        this.tone(420, 0.07, 'square', 0.035, 0, 170);
        break;
      case 'smash':
        this.tone(130, 0.16, 'sawtooth', 0.06, 0, 65);
        break;
      case 'spark':
        this.tone(760, 0.06, 'square', 0.035, 0, 1120);
        this.tone(980, 0.09, 'sine', 0.05, 0.05, 620);
        break;
      case 'breeze':
        this.tone(390, 0.22, 'sine', 0.05, 0, 580);
        this.tone(520, 0.2, 'triangle', 0.035, 0.08, 690);
        break;
      case 'echo':
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.tone(f, 0.3, 'sine', 0.055, i * 0.06);
        });
        break;
      default:
        this.playGather();
    }
  }

  playPlace() {
    this.tone(280, 0.08, 'triangle', 0.07, 0, 360);
    this.tone(420, 0.08, 'sine', 0.05, 0.04);
  }

  playCraft() {
    this.tone(392, 0.09, 'triangle', 0.07, 0);
    this.tone(523.25, 0.11, 'triangle', 0.07, 0.08);
    this.tone(659.25, 0.18, 'sine', 0.08, 0.16);
  }

  playHabitat() {
    const notes = [392, 493.88, 587.33, 783.99, 987.77];
    notes.forEach((f, i) => this.tone(f, 0.35, 'sine', 0.075, i * 0.08));
  }

  playQuest() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.07, i * 0.09));
  }

  playDialog() {
    this.tone(460 + Math.random() * 80, 0.045, 'sine', 0.035);
  }

  playPet() {
    this.tone(587.33, 0.12, 'sine', 0.06, 0, 783.99);
    this.tone(880, 0.16, 'sine', 0.05, 0.09);
  }
}

export const sound = new SoundEngine();
