/* ============================================================
   Ultimo Colore — music and sound, all synthesised
   ------------------------------------------------------------
   The score is built in layers; when a colour dies one layer
   falls silent. Enemy attacks have a rising cue that peaks at
   the moment of the blow, so they can be parried by ear.
   ============================================================ */

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

/* chords as MIDI notes: each mode loops its own progression */
const SCORES = {
  title: { bpm: 54, chords: [[57, 60, 64, 71], [53, 57, 60, 64], [48, 55, 60, 64], [52, 56, 59, 64]], arp: [0, 2, 3, 2, 1, 2], drum: false, bell: true },
  explore: { bpm: 66, chords: [[50, 57, 62, 65], [46, 53, 58, 62], [53, 57, 60, 65], [48, 55, 60, 64]], arp: [0, 1, 2, 3, 2, 1], drum: false, bell: false },
  camp: { bpm: 52, chords: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], arp: [0, 2, 1, 3], drum: false, bell: false },
  battle: { bpm: 104, chords: [[45, 52, 57, 60], [45, 53, 57, 60], [43, 50, 55, 59], [40, 52, 56, 59]], arp: [0, 3, 2, 3, 1, 3, 2, 3], drum: true, bell: false },
  boss: { bpm: 116, chords: [[38, 50, 53, 57], [37, 49, 52, 56], [38, 50, 55, 58], [33, 45, 49, 52]], arp: [0, 1, 2, 3, 3, 2, 1, 2], drum: true, bell: true },
};

export function createAudio() {
  let ctx = null, master = null, fxBus = null, musicBus = null, strings = null, noiseBuf = null;
  let soundOn = true, musicOn = true, timer = 0, step = 0, nextAt = 0, mode = null, faded = false;
  const cues = new Set();

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      fxBus = ctx.createGain(); fxBus.gain.value = soundOn ? 1 : 0; fxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.26 : 0; musicBus.connect(master);
      strings = ctx.createBiquadFilter(); strings.type = 'lowpass'; strings.frequency.value = 900; strings.connect(musicBus);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      if (mode) run();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return true;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.2, to = freq, at = 0, bus = fxBus, attack = 0.008 } = {}) {
    if (!ctx) return null;
    const t = ctx.currentTime + Math.max(0, at);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  }

  function noise(dur, { freq = 2000, to = freq, q = 1, type = 'bandpass', vol = 0.2, at = 0, bus = fxBus, attack = 0.01 } = {}) {
    if (!ctx) return null;
    const t = ctx.currentTime + Math.max(0, at);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random()); s.stop(t + dur + 0.02);
    return s;
  }

  const bell = (f, at = 0, vol = 0.12, bus = fxBus) => [1, 2.76, 5.4].forEach((m, i) => tone(f * m, 1.6 - i * 0.4, { vol: vol / (i + 1), at, bus, attack: 0.004 }));

  const sfx = {
    tap() { tone(520, 0.05, { type: 'triangle', vol: 0.05 }); },
    parry() { bell(1320, 0, 0.16); noise(0.07, { freq: 5000, vol: 0.14 }); },
    dodge() { noise(0.22, { freq: 600, to: 2600, vol: 0.14, attack: 0.05 }); },
    jump() { tone(220, 0.2, { type: 'triangle', vol: 0.14, to: 560 }); },
    hurt() { tone(130, 0.24, { vol: 0.34, to: 52 }); noise(0.14, { freq: 400, type: 'lowpass', vol: 0.24 }); },
    hit() { tone(190, 0.12, { type: 'triangle', vol: 0.2, to: 90 }); noise(0.08, { freq: 1500, vol: 0.18 }); },
    perfect() { tone(990, 0.12, { type: 'triangle', vol: 0.12 }); tone(1480, 0.16, { type: 'triangle', vol: 0.09, at: 0.06 }); },
    miss() { tone(180, 0.12, { type: 'square', vol: 0.04 }); },
    heal() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, { vol: 0.07, at: i * 0.07 })); },
    shatter() { for (let i = 0; i < 9; i++) tone(1800 + Math.random() * 2600, 0.16, { type: 'triangle', vol: 0.06, at: i * 0.025 }); noise(0.35, { freq: 4000, to: 900, vol: 0.18 }); },
    counter() { bell(880, 0, 0.14); tone(220, 0.2, { type: 'sawtooth', vol: 0.08, to: 880 }); },
    win() { [60, 64, 67, 72].forEach((n, i) => bell(NOTE(n), i * 0.18, 0.1)); },
    lose() { [57, 53, 50, 45].forEach((n, i) => tone(NOTE(n), 0.7, { type: 'triangle', vol: 0.12, at: i * 0.35 })); },
    toll() { bell(196, 0, 0.22); },
    bark() { tone(420, 0.08, { type: 'sawtooth', vol: 0.1, to: 260 }); tone(380, 0.1, { type: 'sawtooth', vol: 0.09, to: 220, at: 0.13 }); },
    page() { noise(0.18, { freq: 3000, to: 1200, vol: 0.07, attack: 0.05 }); },
  };

  /** The wind-up of a blow that lands in `ms` milliseconds. */
  function cue(kind, ms, feintMs = null) {
    if (!ctx) return;
    const at = ms / 1000, lead = Math.min(0.55, at);
    const add = (n) => { if (n) { cues.add(n); n.onended = () => cues.delete(n); } };
    if (kind === 'low') add(tone(55, lead, { type: 'sawtooth', vol: 0.16, to: 150, at: at - lead, attack: lead * 0.9 }));
    else add(tone(330, lead, { type: 'sine', vol: 0.14, to: 1180, at: at - lead, attack: lead * 0.9 }));
    add(noise(0.07, { freq: kind === 'low' ? 300 : 3200, vol: 0.2, at }));
    if (feintMs !== null) add(tone(300, 0.18, { type: 'triangle', vol: 0.08, to: 520, at: feintMs / 1000 - 0.18 }));
  }
  function stopCues() { for (const n of cues) { try { n.stop(); } catch (e) { /* done */ } } cues.clear(); }

  function beat(i, at) {
    const s = SCORES[mode];
    const bar = Math.floor(i / 8) % s.chords.length, k = i % 8;
    const chord = s.chords[bar];
    const d = at - ctx.currentTime;
    const len = 60 / s.bpm / 2;
    // the piano: a broken chord
    const n = chord[s.arp[i % s.arp.length]] + 12;
    tone(NOTE(n), len * 3.2, { type: 'triangle', vol: s.drum ? 0.14 : 0.2, at: d, bus: musicBus });
    tone(NOTE(n) * 2, len * 1.2, { vol: 0.035, at: d, bus: musicBus });
    if (k === 0) {
      tone(NOTE(chord[0] - 12), len * 7.5, { type: 'sine', vol: 0.28, at: d, bus: musicBus, attack: 0.1 });
      // the strings are the green of the score: they fall silent with it
      if (!faded) for (const m of chord.slice(1)) { tone(NOTE(m) * 1.003, len * 8, { type: 'sawtooth', vol: 0.05, at: d, bus: strings, attack: len * 3 }); tone(NOTE(m) * 0.997, len * 8, { type: 'sawtooth', vol: 0.05, at: d, bus: strings, attack: len * 3 }); }
    }
    if (s.bell && k === 4 && bar % 2 === 0) bell(NOTE(chord[2] + 24), d, 0.05, musicBus);
    if (s.drum) {
      if (k === 0 || k === 3 || k === 6) tone(90, 0.18, { vol: 0.3, to: 40, at: d, bus: musicBus });
      if (k === 4) noise(0.1, { freq: 1600, vol: 0.12, at: d, bus: musicBus });
      if (k % 2 === 1) noise(0.03, { freq: 7000, type: 'highpass', vol: 0.05, at: d, bus: musicBus });
    }
  }

  function run() {
    clearInterval(timer);
    if (!ctx || !mode) return;
    nextAt = ctx.currentTime + 0.08; step = 0;
    timer = setInterval(() => {
      if (ctx.state !== 'running' || !musicOn) return;
      if (nextAt < ctx.currentTime) nextAt = ctx.currentTime + 0.05;
      while (nextAt < ctx.currentTime + 0.2) { beat(step, nextAt); nextAt += 60 / SCORES[mode].bpm / 2; step++; }
    }, 60);
  }

  return {
    unlock, sfx, cue, stopCues,
    music(next) { if (next === mode) return; mode = next; run(); },
    setFaded(v) { faded = v; },
    setSound(v) { soundOn = v; if (fxBus) fxBus.gain.value = v ? 1 : 0; },
    setMusic(v) { musicOn = v; if (musicBus) musicBus.gain.value = v ? 0.26 : 0; },
    pause() { stopCues(); ctx?.suspend().catch(() => {}); },
    resume() { ctx?.resume().catch(() => {}); },
  };
}
