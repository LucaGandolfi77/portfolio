/*
 * All sound is synthesised live with the Web Audio API: four original radio
 * stations (generative, never the same twice), the engine, horn, siren,
 * crashes and mission jingles. No audio files to download.
 */

export interface Station {
  name: string;
  freq: string;
  genre: string;
}

export const STATIONS: Station[] = [
  { name: 'Radio Stirone', freq: '88.4', genre: 'lo-fi' },
  { name: 'Onda Padana', freq: '101.2', genre: 'italo disco' },
  { name: 'Liscio Notte', freq: '94.6', genre: 'valzer e mazurche' },
  { name: 'Via Emilia FM', freq: '105.7', genre: 'synthwave' }
];

const NOTE = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

type Progression = number[][];

const PROGRESSIONS: Progression[] = [
  [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [52, 56, 59, 62]],
  [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]],
  [[48, 52, 55], [53, 57, 60], [55, 59, 62], [48, 52, 55]],
  [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 48, 52]]
];

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private music!: GainNode;
  private sfx!: GainNode;
  private noise!: AudioBuffer;
  station = 0;
  radioOn = true;
  private nextTime = 0;
  private step = 0;
  private bar = 0;
  timer: number | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain!: GainNode;
  private engineFilter!: BiquadFilterNode;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain!: GainNode;
  private rand = Math.random;

  /** Must run inside a user gesture (browsers block audio otherwise). */
  unlock(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);
    this.music = ctx.createGain();
    this.music.gain.value = 0.42;
    this.music.connect(this.master);
    this.sfx = ctx.createGain();
    this.sfx.gain.value = 0.7;
    this.sfx.connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    /* Engine: two detuned oscillators through a low-pass that opens with revs. */
    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 400;
    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineFilter.connect(this.engineGain).connect(this.sfx);
    this.engineOsc = ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc2 = ctx.createOscillator();
    this.engineOsc2.type = 'square';
    this.engineOsc.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineOsc.start();
    this.engineOsc2.start();

    this.sirenGain = ctx.createGain();
    this.sirenGain.gain.value = 0;
    this.sirenGain.connect(this.sfx);
    this.sirenOsc = ctx.createOscillator();
    this.sirenOsc.type = 'triangle';
    this.sirenOsc.connect(this.sirenGain);
    this.sirenOsc.start();

    this.nextTime = ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 40);
  }

  suspend(paused: boolean): void {
    if (!this.ctx) return;
    if (paused) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  /* ---------- effects ---------- */

  /** rpm 0..1, load 0..1; gain 0 when on foot. */
  setEngine(rpm: number, load: number, on: boolean): void {
    if (!this.ctx || !this.engineOsc || !this.engineOsc2) return;
    const t = this.ctx.currentTime;
    const f = 38 + rpm * 120;
    this.engineOsc.frequency.setTargetAtTime(f, t, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(f * 0.5 + 3, t, 0.05);
    this.engineFilter.frequency.setTargetAtTime(250 + rpm * 900 + load * 600, t, 0.08);
    this.engineGain.gain.setTargetAtTime(on ? 0.07 + load * 0.08 : 0, t, 0.1);
  }

  setSiren(level: number): void {
    if (!this.ctx || !this.sirenOsc) return;
    const t = this.ctx.currentTime;
    this.sirenGain.gain.setTargetAtTime(level * 0.08, t, 0.2);
    /* Two-tone: alternate every half second. */
    const hi = Math.floor(t * 2) % 2 === 0;
    this.sirenOsc.frequency.setTargetAtTime(hi ? 960 : 720, t, 0.02);
  }

  horn(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (const f of [392, 494]) this.tone(f, t, 0.35, 0.08, 'square', this.sfx);
  }

  crash(strength: number): void {
    if (!this.ctx) return;
    this.noiseHit(this.ctx.currentTime, Math.min(1, strength / 15) * 0.6, 0.35, 900, this.sfx);
    this.tone(70, this.ctx.currentTime, 0.25, Math.min(0.4, strength / 30), 'sine', this.sfx);
  }

  jingle(good: boolean): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = good ? [72, 76, 79, 84] : [67, 63, 60];
    notes.forEach((n, i) => this.tone(NOTE(n), t + i * 0.12, 0.22, 0.12, 'square', this.sfx));
  }

  checkpoint(): void {
    if (!this.ctx) return;
    this.tone(NOTE(84), this.ctx.currentTime, 0.12, 0.1, 'triangle', this.sfx);
  }

  /* ---------- radio ---------- */

  setStation(index: number): void {
    this.station = ((index % STATIONS.length) + STATIONS.length) % STATIONS.length;
    this.bar = 0;
    this.step = 0;
    if (this.ctx) this.nextTime = this.ctx.currentTime + 0.05;
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const station = this.station;
    const bpm = [84, 118, 150, 100][station];
    const stepsPerBar = station === 2 ? 12 : 16;
    const stepDur = station === 2 ? 60 / bpm / 4 : 60 / bpm / 4;
    while (this.nextTime < ctx.currentTime + 0.25) {
      if (this.radioOn) this.playStep(station, this.step, this.bar, this.nextTime, stepDur, stepsPerBar);
      let dur = stepDur;
      if (station === 0) dur *= this.step % 2 === 0 ? 1.18 : 0.82;
      this.nextTime += dur;
      this.step++;
      if (this.step >= stepsPerBar) {
        this.step = 0;
        this.bar++;
      }
    }
  }

  private playStep(station: number, step: number, bar: number, t: number, dur: number, steps: number): void {
    const prog = PROGRESSIONS[station];
    const chord = prog[Math.floor(bar / (station === 2 ? 2 : 1)) % prog.length];
    const root = chord[0] - 12;
    const out = this.music;
    const r = this.rand;
    if (station === 0) {
      /* Lo-fi: lazy kick/snare, soft hats, electric-piano chords. */
      if (step === 0 || step === 10) this.kick(t, 0.7);
      if (step === 4 || step === 12) this.snare(t, 0.35, 2200);
      if (step % 2 === 0) this.hat(t, step % 4 === 2 ? 0.1 : 0.05);
      if (step === 0) chord.forEach((n) => this.tone(NOTE(n), t, dur * 14, 0.05, 'triangle', out, 0.02));
      if (step === 0 || step === 7 || (step === 11 && r() < 0.6)) this.bass(NOTE(root - 12), t, dur * 3, 0.22, 500);
      if (step % 4 === 2 && r() < 0.35) this.tone(NOTE(chord[Math.floor(r() * chord.length)] + 12), t, dur * 3, 0.035, 'sine', out);
    } else if (station === 1) {
      /* Italo disco: four on the floor, octave bass, arpeggio. */
      if (step % 4 === 0) this.kick(t, 0.85);
      if (step === 4 || step === 12) this.snare(t, 0.3, 3000);
      if (step % 4 === 2) this.hat(t, 0.12);
      this.bass(NOTE(root - 12 + (step % 2 ? 12 : 0)), t, dur * 0.9, 0.2, 900);
      const arp = chord[step % chord.length] + 12 + (Math.floor(step / 4) % 2) * 12;
      this.tone(NOTE(arp), t, dur * 0.8, 0.045, 'square', out);
      if (step === 0 && bar % 2 === 0) chord.forEach((n) => this.tone(NOTE(n), t, dur * 30, 0.025, 'sawtooth', out, 0.3));
    } else if (station === 2) {
      /* Liscio: oom-pah-pah and an accordion melody (two detuned reeds). */
      if (step % 4 === 0) {
        const beat = step / 4;
        if (beat === 0) this.bass(NOTE(root - 12), t, dur * 3, 0.24, 700);
        else chord.forEach((n) => this.tone(NOTE(n), t, dur * 2, 0.04, 'square', out));
      }
      if (step % 2 === 0 && r() < 0.8) {
        const scale = [0, 2, 4, 5, 7, 9, 11, 12];
        const note = chord[0] + 12 + scale[Math.floor(r() * scale.length)];
        this.tone(NOTE(note), t, dur * 2, 0.05, 'square', out, 0, 1.006);
      }
    } else {
      /* Synthwave: gated pad, big snare, driving eighth-note bass. */
      if (step % 8 === 0) this.kick(t, 0.8);
      if (step % 8 === 4) this.snare(t, 0.45, 1800);
      if (step % 2 === 0) this.bass(NOTE(root - 12), t, dur * 1.6, 0.18, 650);
      if (step % 2 === 0) chord.forEach((n) => this.tone(NOTE(n), t, dur * 1.7, 0.02, 'sawtooth', out));
      if (step % 4 === 0 && r() < 0.5) this.tone(NOTE(chord[Math.floor(r() * chord.length)] + 24), t, dur * 4, 0.04, 'triangle', out);
    }
    void steps;
  }

  /* ---------- instruments ---------- */

  private tone(freq: number, t: number, dur: number, gain: number, type: OscillatorType, out: AudioNode, attack = 0.005, detune = 0): void {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + Math.max(0.003, attack));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(out);
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.05);
    if (detune) {
      const o2 = ctx.createOscillator();
      o2.type = type;
      o2.frequency.value = freq * detune;
      o2.connect(g);
      o2.start(t);
      o2.stop(t + dur + 0.05);
    }
  }

  private bass(freq: number, t: number, dur: number, gain: number, cutoff: number): void {
    const ctx = this.ctx!;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    f.connect(this.music);
    this.tone(freq, t, dur, gain, 'sawtooth', f);
  }

  private kick(t: number, gain: number): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g).connect(this.music);
    o.start(t);
    o.stop(t + 0.32);
  }

  private snare(t: number, gain: number, tone: number): void {
    this.noiseHit(t, gain, 0.18, tone, this.music);
  }

  private hat(t: number, gain: number): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(f).connect(g).connect(this.music);
    src.start(t, Math.random() * 0.5);
    src.stop(t + 0.06);
  }

  private noiseHit(t: number, gain: number, dur: number, freq: number, out: AudioNode): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.02);
  }
}
