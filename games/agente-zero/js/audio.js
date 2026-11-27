/* ============================================================
   Agente Zero — every sound is synthesised with Web Audio
   ============================================================ */

export function createAudio() {
  let ctx = null, master = null, fxBus = null, musicBus = null, crowdGain = null, noiseBuf = null;
  let soundOn = true, musicOn = true, timer = 0, step = 0, nextAt = 0, wantMusic = false, crowdLevel = 0;
  let muffle = null, drunk = 0;

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      fxBus = ctx.createGain(); fxBus.gain.value = soundOn ? 1 : 0; fxBus.connect(master);
      muffle = ctx.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = 18000; muffle.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.32 : 0; musicBus.connect(muffle);
      setDrunk(drunk);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // the crowd: filtered noise that swells with the streak
      const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 620; bp.Q.value = 0.7;
      crowdGain = ctx.createGain(); crowdGain.gain.value = 0;
      src.connect(bp).connect(crowdGain).connect(fxBus); src.start();
      crowd(crowdLevel);
      if (wantMusic) startMusic();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return true;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.2, to = freq, at = 0, bus = fxBus } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, { freq = 2000, to = freq, q = 1, type = 'bandpass', vol = 0.2, at = 0, bus = fxBus } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + at;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, to), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }

  const sfx = {
    bounce(speed = 4) { const v = Math.min(1, speed / 7); tone(150, 0.16, { vol: 0.35 * v + 0.03, to: 62 }); noise(0.05, { freq: 900, vol: 0.12 * v }); },
    rim(speed = 4) { const v = Math.min(1, speed / 7) * 0.2 + 0.03; for (const [f, d] of [[392, 0.34], [611, 0.28], [1046, 0.18]]) tone(f, d, { type: 'triangle', vol: v }); },
    board(speed = 4) { const v = Math.min(1, speed / 7); tone(220, 0.2, { type: 'square', vol: 0.07 * v + 0.02, to: 110 }); noise(0.09, { freq: 500, vol: 0.22 * v }); },
    swish() { noise(0.32, { freq: 5200, to: 1500, q: 0.8, vol: 0.32 }); },
    net() { noise(0.18, { freq: 3200, to: 1300, vol: 0.16 }); },
    shoot() { noise(0.14, { freq: 500, to: 1500, vol: 0.07 }); },
    block() { noise(0.12, { freq: 300, vol: 0.35, type: 'lowpass' }); },
    score(n = 2) { for (let i = 0; i < Math.min(4, n); i++) tone(520 * (1 + i * 0.25), 0.1, { type: 'square', vol: 0.05, at: i * 0.06 }); },
    fire() { noise(0.5, { freq: 300, to: 2600, vol: 0.18 }); tone(180, 0.4, { type: 'sawtooth', vol: 0.07, to: 720 }); },
    buzzer() { tone(233, 0.8, { type: 'sawtooth', vol: 0.18 }); tone(236, 0.8, { type: 'square', vol: 0.08 }); },
    tick() { tone(880, 0.06, { type: 'square', vol: 0.06 }); },
    whistle() { tone(2300, 0.18, { type: 'square', vol: 0.05 }); tone(2380, 0.28, { type: 'square', vol: 0.05, at: 0.2 }); },
    tap() { tone(660, 0.05, { type: 'triangle', vol: 0.07 }); },
    cheer(k = 1) { noise(0.9 * k, { freq: 800, to: 1400, q: 0.5, vol: 0.13 * k }); },
    win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { type: 'triangle', vol: 0.14, at: i * 0.12 })); },
    lose() { [330, 277, 233].forEach((f, i) => tone(f, 0.3, { type: 'triangle', vol: 0.12, at: i * 0.18 })); },
    plop() { tone(520, 0.16, { vol: 0.35, to: 130 }); noise(0.5, { freq: 6500, type: 'highpass', vol: 0.12, at: 0.08 }); },
    spill() { noise(0.35, { freq: 1900, to: 500, vol: 0.28 }); tone(1250, 0.12, { type: 'triangle', vol: 0.1, at: 0.05 }); },
    gulp() { tone(210, 0.11, { vol: 0.24, to: 95 }); tone(120, 0.07, { vol: 0.14, to: 260, at: 0.09 }); },
    burp() { for (let i = 0; i < 6; i++) tone(95 - i * 6 + (i % 2) * 22, 0.1, { type: 'sawtooth', vol: 0.2, at: i * 0.065, to: 70 }); },
    hiccup() { tone(260, 0.08, { type: 'square', vol: 0.1, to: 720 }); },
  };

  function crowd(level) {
    crowdLevel = level;
    if (crowdGain) crowdGain.gain.setTargetAtTime(Math.max(0, level) * 0.085, ctx.currentTime, 0.4);
  }

  // a four-bar boom-bap loop at 92 bpm
  const BASS = [55, 0, 0, 55, 0, 0, 65.4, 0, 49, 0, 0, 49, 0, 58.3, 0, 0];
  const CHORDS = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 196, 246.9]];
  function beat(i, at) {
    const s = i % 16, bar = Math.floor(i / 16) % 4;
    const delay = at - ctx.currentTime;
    if (s === 0 || s === 7 || s === 10) tone(120, 0.2, { vol: 0.5, to: 42, at: delay, bus: musicBus });
    if (s === 4 || s === 12) noise(0.16, { freq: 1800, q: 0.7, vol: 0.32, at: delay, bus: musicBus });
    if (s % 2 === 0) noise(0.035, { freq: 8000, type: 'highpass', vol: s % 4 ? 0.1 : 0.06, at: delay, bus: musicBus });
    const b = BASS[s] * (bar === 1 ? 0.8 : bar === 3 ? 0.75 : 1);
    if (BASS[s]) tone(b, 0.24, { type: 'triangle', vol: 0.34, at: delay, bus: musicBus });
    if (s === 2 || s === 11) for (const f of CHORDS[bar]) tone(f * 2, 0.22, { type: 'triangle', vol: 0.055, at: delay, bus: musicBus });
  }

  /** 0 sober … 1 wrecked: muffles and slows the music. */
  function setDrunk(k) {
    drunk = Math.max(0, Math.min(1, k));
    if (muffle) muffle.frequency.setTargetAtTime(18000 * Math.pow(0.05, drunk), ctx.currentTime, 0.5);
  }

  function startMusic() {
    wantMusic = true;
    if (!ctx || timer) return;
    nextAt = ctx.currentTime + 0.05; step = 0;
    timer = setInterval(() => {
      if (ctx.state !== 'running') return;
      if (nextAt < ctx.currentTime) nextAt = ctx.currentTime + 0.05;
      while (nextAt < ctx.currentTime + 0.18) {
        beat(step, nextAt);
        const swing = step % 2 ? 0.86 : 1.14;
        // the more he drinks, the slower and more uneven the beat
        nextAt += (60 / (92 * (1 - 0.22 * drunk)) / 4) * swing * (1 + Math.sin(step * 0.4) * 0.12 * drunk);
        step++;
      }
    }, 60);
  }

  function stopMusic() { wantMusic = false; clearInterval(timer); timer = 0; }

  return {
    unlock, sfx, crowd, startMusic, stopMusic, setDrunk,
    setSound(v) { soundOn = v; if (fxBus) fxBus.gain.value = v ? 1 : 0; },
    setMusic(v) { musicOn = v; if (musicBus) musicBus.gain.value = v ? 0.32 : 0; },
    pause() { ctx?.suspend().catch(() => {}); },
    resume() { ctx?.resume().catch(() => {}); },
  };
}
