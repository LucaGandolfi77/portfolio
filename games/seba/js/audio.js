/* ============================================================
   Seba — all sound is synthesised: mumbles, effects, music
   ------------------------------------------------------------
   No samples. The context starts on the first tap and the whole
   engine stays silent (never throws) where Web Audio is absent.
   ============================================================ */
export function createAudio() {
  let ac = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let soundOn = true, musicOn = true;
  let timer = null, track = null, step = 0, nextAt = 0;

  function ensure() {
    if (ac) { if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
      musicBus = ac.createGain(); musicBus.gain.value = musicOn ? 0.5 : 0; musicBus.connect(master);
      sfxBus = ac.createGain(); sfxBus.gain.value = soundOn ? 0.8 : 0; sfxBus.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
    return ac;
  }

  function tone(freq, { at = 0, dur = 0.15, type = 'sine', gain = 0.2, to = null, bus = sfxBus, filter = null } = {}) {
    if (!ac) return;
    const t = ac.currentTime + at;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = o;
    if (filter) { const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = filter; f.Q.value = 4; o.connect(f); node = f; }
    node.connect(g); g.connect(bus || sfxBus);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise({ at = 0, dur = 0.12, gain = 0.2, type = 'highpass', freq = 2000, bus = sfxBus, to = null } = {}) {
    if (!ac) return;
    const t = ac.currentTime + at;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; s.loop = true;
    f.type = type; f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus);
    s.start(t); s.stop(t + dur + 0.05);
  }

  const SFX = {
    tap: () => tone(520, { dur: 0.06, type: 'triangle', gain: 0.12 }),
    coin: () => { tone(988, { dur: 0.08, type: 'square', gain: 0.07 }); tone(1319, { at: 0.07, dur: 0.18, type: 'square', gain: 0.07 }); },
    gulp: () => [0, 0.16, 0.32].forEach((at) => tone(260, { at, dur: 0.12, to: 110, gain: 0.25 })),
    munch: () => [0, 0.17, 0.34].forEach((at) => noise({ at, dur: 0.09, type: 'bandpass', freq: 900, gain: 0.35 })),
    lighter: () => { noise({ dur: 0.04, freq: 5000, gain: 0.3 }); noise({ at: 0.09, dur: 0.35, type: 'lowpass', freq: 900, gain: 0.12 }); },
    puff: () => noise({ dur: 0.8, type: 'lowpass', freq: 1200, to: 300, gain: 0.16 }),
    cough: () => [0, 0.2].forEach((at) => noise({ at, dur: 0.13, type: 'bandpass', freq: 500, gain: 0.6 })),
    water: () => noise({ dur: 0.18, type: 'bandpass', freq: 1800, gain: 0.07 }),
    bucket: () => noise({ dur: 0.7, type: 'lowpass', freq: 3000, to: 200, gain: 0.5 }),
    snore: () => tone(90, { dur: 1.1, to: 60, type: 'sawtooth', gain: 0.08, filter: 220 }),
    shake: () => [0, 0.07, 0.14, 0.21].forEach((at) => noise({ at, dur: 0.05, freq: 3500, gain: 0.25 })),
    good: () => [523, 659, 784].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.18, type: 'triangle', gain: 0.16 })),
    bad: () => tone(200, { dur: 0.35, to: 90, type: 'sawtooth', gain: 0.12 }),
    level: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, { at: i * 0.1, dur: 0.3, type: 'square', gain: 0.08 })),
    jump: () => tone(300, { dur: 0.16, to: 640, type: 'square', gain: 0.07 }),
    hit: () => { noise({ dur: 0.18, type: 'lowpass', freq: 600, gain: 0.5 }); tone(110, { dur: 0.2, to: 50, gain: 0.3 }); },
    plane: () => noise({ dur: 1.6, type: 'lowpass', freq: 200, to: 2400, gain: 0.25 }),
    note: (n = 0) => tone(330 * 2 ** (n / 12), { dur: 0.14, type: 'square', gain: 0.08 }),
  };

  /* ---------------- Seba's voice ---------------- */
  function mumble(text, moodPitch = 1) {
    if (!soundOn || !ensure()) return;
    const n = Math.min(11, Math.max(2, Math.round((text || '').length / 7)));
    for (let i = 0; i < n; i++) {
      const base = (170 + Math.random() * 150) * moodPitch;
      tone(base, { at: i * 0.095, dur: 0.085, type: i % 3 ? 'square' : 'sawtooth', gain: 0.07, to: base * (0.8 + Math.random() * 0.5), filter: 600 + Math.random() * 900 });
    }
  }

  /* ---------------- music: a small groove box ---------------- */
  const midi = (m) => 440 * 2 ** ((m - 69) / 12);
  const SCALE = [0, 3, 5, 7, 10, 12, 15];

  function playStep(t, s) {
    const at = Math.max(0, t - ac.currentTime);
    const { kind, root } = track;
    const bar = Math.floor(s / 16), i = s % 16;
    if (kind === 'rave') {
      if (i % 4 === 0) tone(150, { at, dur: 0.17, to: 42, gain: 0.55, bus: musicBus });
      if (i % 4 === 2) noise({ at, dur: 0.07, freq: 7000, gain: 0.14, bus: musicBus });
      if (i === 4 || i === 12) noise({ at, dur: 0.12, type: 'bandpass', freq: 1600, gain: 0.25, bus: musicBus });
      if (i % 4 !== 0) tone(midi(root + SCALE[(i + bar * 2) % 4]), { at, dur: 0.11, type: 'sawtooth', gain: 0.1, bus: musicBus, filter: 300 + (s % 64) * 14 });
      if ((i === 3 || i === 10) && bar % 4 >= 2) [12, 15, 19].forEach((k) => tone(midi(root + k + 12), { at, dur: 0.13, type: 'square', gain: 0.025, bus: musicBus }));
    } else {
      // home: a lazy lo-fi loop
      const chord = [[0, 3, 7, 10], [5, 8, 12, 15], [3, 7, 10, 14], [-2, 2, 5, 9]][bar % 4];
      if (i === 0) chord.forEach((k, j) => tone(midi(root + 12 + k), { at: at + j * 0.03, dur: 1.5, type: 'triangle', gain: 0.045, bus: musicBus }));
      if (i === 0 || i === 10) tone(110, { at, dur: 0.2, to: 45, gain: 0.25, bus: musicBus });
      if (i === 4 || i === 12) noise({ at, dur: 0.1, type: 'bandpass', freq: 2200, gain: 0.08, bus: musicBus });
      if (i % 2 === 0) noise({ at, dur: 0.03, freq: 8000, gain: 0.04, bus: musicBus });
      if (i === 6 && bar % 2) tone(midi(root + 24 + SCALE[(bar * 3) % 7]), { at, dur: 0.5, gain: 0.05, bus: musicBus });
    }
  }

  function schedule() {
    if (!ac || !track) return;
    const dt = 60 / track.bpm / 4;
    if (nextAt < ac.currentTime) nextAt = ac.currentTime + 0.05;
    while (nextAt < ac.currentTime + 0.2) {
      if (musicOn) playStep(nextAt, step);
      step++;
      nextAt += dt;
    }
  }

  function music(next) {
    const key = next ? `${next.kind}-${next.bpm}-${next.root}` : '';
    if (track && track.key === key) return;
    track = next ? { ...next, key } : null;
    step = 0; nextAt = 0;
    if (track && !timer) timer = setInterval(schedule, 60);
    if (!track && timer) { clearInterval(timer); timer = null; }
  }

  return {
    unlock: ensure,
    sfx(name, arg) { if (soundOn && ensure() && SFX[name]) SFX[name](arg); },
    mumble,
    music,
    setSound(v) { soundOn = v; if (sfxBus) sfxBus.gain.value = v ? 0.8 : 0; },
    setMusic(v) { musicOn = v; if (musicBus) musicBus.gain.value = v ? 0.5 : 0; },
    pause() { if (ac && ac.state === 'running') ac.suspend().catch(() => {}); },
    resume() { if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); },
  };
}
