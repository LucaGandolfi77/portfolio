/*
 * The score, written for Web Audio: a slow pad and bass that change with the
 * chapter, a plucked motif, a bowed solo line for the tender moments, sound
 * beds that follow each picture (rain, wind, fire, water, crowd, birds) and
 * short effects on cue. Original music; nothing is recorded or quoted.
 */
import type { Sfx, Sound } from './shots/types';

/* One entry per chapter, in semitones from D4. */
const CHORDS: number[][] = [
  [0, 7, 12, 15], // prologue
  [-5, 2, 7, 10], // the convict, G minor
  [-2, 5, 10, 14], // candlesticks, B flat
  [3, 10, 15, 19], // Fantine, F
  [0, 7, 12, 15], // tempest
  [5, 12, 17, 21], // Cosette
  [-4, 3, 8, 12], // the wall
  [3, 10, 15, 19], // Marius
  [-2, 5, 10, 14], // the garden
  [0, 6, 12, 15], // barricade, with a shadow
  [-6, 1, 6, 9], // sewer
  [-5, 2, 7, 10], // Javert
  [-2, 5, 10, 14], // forgiveness
  [0, 7, 14, 16], // epilogue, D major
];

const MOTIFS: number[][] = [
  [12, 15, 14, 19, 17], [12, 10, 7, 8, 7], [12, 16, 19, 17, 14], [19, 17, 15, 14, 12], [12, 13, 15, 12, 6],
  [19, 21, 24, 21, 17], [12, 15, 17, 15, 12], [15, 19, 22, 24, 22], [17, 19, 22, 26, 24], [12, 12, 15, 18, 19],
  [12, 11, 12, 9, 6], [19, 15, 14, 10, 7], [17, 19, 22, 17, 14], [14, 18, 21, 26, 28],
];

const hz = (semitone: number): number => 293.66 * Math.pow(2, semitone / 12);
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

interface Bed { gain: GainNode; level: number }
type BedName = 'rain' | 'wind' | 'fire' | 'water' | 'crowd';

export class FilmScore {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private ambience: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private pad: OscillatorNode[] = [];
  private bass: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private beds = {} as Record<BedName, Bed>;
  private scene: Sound = {};
  private timer: number | null = null;
  private nextPluck = 0;
  private nextBass = 0;
  private nextBird = 0;
  private nextCrackle = 0;
  private nextBow = 0;
  private step = 0;
  private bowStep = 0;
  private chapter = 0;
  private muted = false;
  private volume = 0.55;
  private started = false;
  private ducked = false;

  async start(): Promise<void> {
    if (!this.ctx) this.build();
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();
    if (this.started) return;
    this.started = true;
    this.master?.gain.setTargetAtTime(this.muted ? 0 : this.volume, ctx.currentTime, 0.4);
    this.nextBass = ctx.currentTime + 0.2;
    this.nextPluck = ctx.currentTime + 1.2;
    this.nextBow = ctx.currentTime + 2;
    this.applyChapter(true);
    this.setScene(this.scene);
    this.timer = window.setInterval(() => this.tick(), 160);
  }

  pause(): void {
    if (this.ctx?.state === 'running') void this.ctx.suspend();
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx) this.master?.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.12);
  }

  setVolume(volume: number): void {
    this.volume = clamp(volume, 0, 1) * 0.9;
    if (this.ctx && !this.muted) this.master?.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.12);
  }

  /** Lowers the music while the narrator's voice is speaking. */
  duck(on: boolean): void {
    if (on === this.ducked) return;
    this.ducked = on;
    if (!this.ctx) return;
    this.music?.gain.setTargetAtTime(on ? 0.42 : 1, this.ctx.currentTime, 0.25);
    this.ambience?.gain.setTargetAtTime(on ? 0.5 : 1, this.ctx.currentTime, 0.25);
  }

  setChapter(index: number, seek = false): void {
    if (index === this.chapter && !seek) return;
    this.chapter = clamp(index, 0, CHORDS.length - 1);
    this.applyChapter(seek);
    if (this.started && !seek) this.effect('chime');
  }

  /** Cross-fades the sound beds to those of the picture on screen. */
  setScene(sound: Sound): void {
    this.scene = sound;
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const name of Object.keys(this.beds) as BedName[]) {
      const bed = this.beds[name];
      bed.gain.gain.setTargetAtTime((sound[name] ?? 0) * bed.level, now, 0.9);
    }
    this.droneGain?.gain.setTargetAtTime((sound.drone ?? 0) * 0.05, now, 1.4);
  }

  private build(): void {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 4;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.master = master;
    this.music = ctx.createGain();
    this.ambience = ctx.createGain();
    this.music.connect(master);
    this.ambience.connect(master);

    const reverb = ctx.createConvolver();
    const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 3), ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        last = last * 0.9 + (Math.random() * 2 - 1) * 0.1;
        data[i] = last * Math.pow(1 - i / data.length, 2.4);
      }
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    reverb.connect(wet);
    wet.connect(this.music);
    this.reverb = reverb;

    const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3), ctx.sampleRate);
    const data = noise.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = last * 0.6 + (Math.random() * 2 - 1) * 0.4;
      data[i] = last * 0.55;
    }
    this.noise = noise;

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 760;
    padFilter.connect(this.music);
    padFilter.connect(reverb);
    this.padFilter = padFilter;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      osc.type = i % 3 === 0 ? 'sine' : 'triangle';
      osc.detune.value = (i % 2 ? 1 : -1) * (3 + i);
      const gain = ctx.createGain();
      gain.gain.value = i === 0 ? 0.03 : 0.011;
      osc.connect(gain);
      gain.connect(padFilter);
      osc.start();
      this.pad.push(osc);
    }
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.05;
    bass.connect(bassGain);
    bassGain.connect(this.music);
    bass.start();
    this.bass = bass;

    /* A low, uneasy drone for danger. */
    const drone = ctx.createGain();
    drone.gain.value = 0;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 210;
    drone.connect(droneFilter);
    droneFilter.connect(this.music);
    for (const f of [hz(-24), hz(-24) * 1.012, hz(-17)]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.connect(drone);
      o.start();
    }
    this.droneGain = drone;

    const bed = (type: BiquadFilterType, frequency: number, q: number, level: number, wobble = 0, rate = 0.1): Bed => {
      const source = ctx.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      filter.Q.value = q;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambience!);
      if (wobble) {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = rate;
        const depth = ctx.createGain();
        depth.gain.value = wobble;
        lfo.connect(depth);
        depth.connect(filter.frequency);
        lfo.start();
      }
      source.start(0, Math.random() * 2);
      return { gain, level };
    };
    this.beds = {
      rain: bed('highpass', 1700, 0.3, 0.085),
      wind: bed('bandpass', 420, 1.4, 0.12, 240, 0.09),
      fire: bed('lowpass', 320, 0.6, 0.07, 90, 0.7),
      water: bed('bandpass', 640, 1.1, 0.1, 260, 0.35),
      crowd: bed('bandpass', 480, 2.4, 0.13, 180, 2.3),
    };
  }

  private applyChapter(seek: boolean): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = CHORDS[this.chapter];
    const glide = seek ? 0.3 : 1.8;
    this.pad.forEach((osc, i) => {
      const semitone = chord[i % chord.length] + (i >= 4 ? 12 : 0);
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setTargetAtTime(hz(semitone) / 2, now, glide);
    });
    this.bass?.frequency.setTargetAtTime(hz(chord[0]) / 4, now, glide);
    const bright = this.chapter === 9 ? 1100 : this.chapter === 10 ? 420 : this.chapter === 13 ? 1700 : 780;
    this.padFilter?.frequency.setTargetAtTime(bright, now, 1);
  }

  private tone(type: OscillatorType, frequency: number, when: number, peak: number, attack: number, decay: number, out: AudioNode, echo = true): OscillatorNode {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.linearRampToValueAtTime(peak, when + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
    osc.connect(gain);
    gain.connect(out);
    if (echo && this.reverb) gain.connect(this.reverb);
    osc.start(when);
    osc.stop(when + attack + decay + 0.1);
    return osc;
  }

  private burst(frequency: number, q: number, when: number, peak: number, decay: number, type: BiquadFilterType = 'bandpass'): void {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peak, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + decay);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambience!);
    gain.connect(this.reverb!);
    source.start(when, Math.random() * 2);
    source.stop(when + decay + 0.05);
  }

  /** The bowed solo line: one long note with a slow vibrato. */
  private bow(semitone: number, when: number, level: number): void {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1250;
    filter.connect(this.music!);
    filter.connect(this.reverb!);
    const osc = this.tone('sawtooth', hz(semitone - 12), when, 0.017 * level, 0.7, 2.6, filter, false);
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 5.2;
    depth.gain.setValueAtTime(0, when);
    depth.gain.linearRampToValueAtTime(hz(semitone - 12) * 0.008, when + 1.3);
    lfo.connect(depth);
    depth.connect(osc.frequency);
    lfo.start(when);
    lfo.stop(when + 3.5);
  }

  effect(name: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + 0.02;
    const out = this.ambience!;
    switch (name) {
      case 'bell':
        for (const [m, v] of [[1, 0.05], [2.01, 0.028], [2.76, 0.018], [5.4, 0.007]]) this.tone('sine', 196 * m, t, v, 0.006, 3.6, out);
        break;
      case 'chime':
        [12, 19, 24, 28].forEach((n, i) => this.tone('sine', hz(n), t + i * 0.13, 0.028, 0.01, 2.2, out));
        break;
      case 'coin':
        for (const [f, d] of [[2640, 0], [3520, 0.07], [2960, 0.15]]) this.tone('triangle', f, t + d, 0.028, 0.002, 0.28, out);
        break;
      case 'glass':
        this.burst(5200, 3, t, 0.2, 0.35);
        [3100, 4300, 5700].forEach((f, i) => this.tone('sine', f, t + i * 0.05, 0.025, 0.002, 0.45, out));
        break;
      case 'chain':
        for (let i = 0; i < 7; i++) this.burst(2400 + Math.random() * 1800, 12, t + i * 0.09 + Math.random() * 0.04, 0.16, 0.09);
        break;
      case 'door':
        this.burst(190, 2, t, 0.35, 0.3, 'lowpass');
        this.tone('sine', 82, t + 0.02, 0.09, 0.005, 0.3, out);
        break;
      case 'wood':
        this.burst(520, 4, t, 0.32, 0.16);
        this.burst(310, 3, t + 0.11, 0.24, 0.2);
        break;
      case 'hit':
        this.burst(240, 1.2, t, 0.4, 0.22, 'lowpass');
        this.tone('sine', 60, t, 0.12, 0.004, 0.28, out);
        break;
      case 'shot':
        /* Muffled and distant: weight rather than violence. */
        this.burst(700, 0.7, t, 0.32, 0.6, 'lowpass');
        this.tone('sine', 52, t, 0.14, 0.004, 0.7, out);
        break;
      case 'thunder':
        this.burst(150, 0.5, t, 0.6, 2.8, 'lowpass');
        this.burst(90, 0.5, t + 0.4, 0.5, 3.2, 'lowpass');
        break;
      case 'splash':
        this.burst(900, 0.8, t, 0.3, 0.55);
        this.burst(2600, 1.4, t + 0.05, 0.14, 0.4);
        break;
    }
  }

  private tick(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const chord = CHORDS[this.chapter];
    const motif = MOTIFS[this.chapter];
    const quiet = this.chapter === 10 || this.chapter === 11;
    while (this.nextBass < now + 1.5) {
      const when = Math.max(now + 0.05, this.nextBass);
      this.tone('triangle', hz(chord[0] - 12), when, 0.03, 0.02, 3.2, this.music!);
      this.tone('triangle', hz(chord[1] - 12), when + 2, 0.014, 0.02, 2.4, this.music!);
      /* A heartbeat under the dangerous scenes. */
      if ((this.scene.drone ?? 0) > 0.6) for (const d of [0.1, 0.42, 2.1, 2.42]) this.tone('sine', 55, when + d, 0.07, 0.01, 0.2, this.music!, false);
      this.nextBass += 4;
    }
    while (this.nextPluck < now + 1.5) {
      const when = Math.max(now + 0.05, this.nextPluck);
      const note = motif[this.step % motif.length];
      this.tone('triangle', hz(note), when, quiet ? 0.016 : 0.027, 0.008, 1.9, this.music!);
      this.tone('sine', hz(note) * 2, when, 0.005, 0.008, 1.2, this.music!);
      this.step++;
      /* A breath between phrases. */
      this.nextPluck += this.step % motif.length === 0 ? 3.6 : 1.2;
    }
    while (this.nextBow < now + 1.5) {
      const level = this.scene.melody ?? 0;
      if (level > 0.2) this.bow(motif[(motif.length - 1 - (this.bowStep % motif.length) + motif.length) % motif.length] + (this.bowStep % 2 ? 0 : 12), Math.max(now + 0.05, this.nextBow), level);
      this.bowStep++;
      this.nextBow += 3;
    }
    if ((this.scene.birds ?? 0) > 0 && now > this.nextBird) {
      const base = 2400 + Math.random() * 1600;
      for (let i = 0; i < 2 + Math.floor(Math.random() * 4); i++) {
        const osc = this.tone('sine', base + Math.random() * 400, now + 0.1 + i * 0.11, 0.014 * this.scene.birds!, 0.01, 0.08, this.ambience!);
        osc.frequency.exponentialRampToValueAtTime(base * 1.35, now + 0.18 + i * 0.11);
      }
      this.nextBird = now + 0.8 + Math.random() * 3;
    }
    if ((this.scene.fire ?? 0) > 0 && now > this.nextCrackle) {
      this.burst(1800 + Math.random() * 2600, 6, now + 0.05, 0.1 * this.scene.fire!, 0.04);
      this.nextCrackle = now + 0.08 + Math.random() * 0.5;
    }
  }
}

export const score = new FilmScore();
