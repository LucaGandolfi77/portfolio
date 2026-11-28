/* ============================================================
   Shake Me — every sound is synthesised with Web Audio
   ============================================================ */

export function createAudio() {
  let ctx = null, master = null, fxBus = null, musicBus = null, noiseBuf = null;
  let soundOn = true, musicOn = true, timer = 0, step = 0, nextAt = 0, wantMusic = false;
  const loops = {};

  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      fxBus = ctx.createGain(); fxBus.gain.value = soundOn ? 1 : 0; fxBus.connect(master);
      musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.22 : 0; musicBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      if (wantMusic) startMusic();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return true;
  }

  function tone(freq, dur, { type = 'sine', vol = 0.2, to = freq, at = 0, bus = fxBus, attack = 0.006 } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
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
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(bus);
    s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }

  const clink = (at = 0, v = 0.12) => { tone(2400 + Math.random() * 900, 0.12, { type: 'triangle', vol: v, at }); tone(3900 + Math.random() * 600, 0.08, { vol: v * 0.5, at }); };

  const sfx = {
    tap() { tone(700, 0.05, { type: 'triangle', vol: 0.06 }); },
    glass() { clink(0, 0.1); },
    ice() { for (let i = 0; i < 4; i++) clink(i * 0.05, 0.09); },
    add() { noise(0.18, { freq: 900, to: 500, vol: 0.12 }); },
    muddle() { tone(110, 0.09, { vol: 0.3, to: 60 }); noise(0.05, { freq: 300, vol: 0.1 }); },
    strain() { noise(0.6, { freq: 1300, to: 700, q: 0.6, vol: 0.18 }); },
    serve() { noise(0.5, { freq: 400, to: 200, type: 'lowpass', vol: 0.2 }); tone(1568, 0.5, { type: 'triangle', vol: 0.1, at: 0.45 }); },
    star(i = 0) { tone(880 * [1, 1.25, 1.5][i % 3], 0.25, { type: 'triangle', vol: 0.12, at: i * 0.16 }); },
    good() { [523, 659, 784].forEach((f, i) => tone(f, 0.2, { type: 'triangle', vol: 0.1, at: i * 0.1 })); },
    bad() { [392, 330].forEach((f, i) => tone(f, 0.25, { type: 'triangle', vol: 0.1, at: i * 0.15 })); },
    error() { tone(220, 0.12, { type: 'square', vol: 0.04 }); },
  };

  /** Sounds that last while the finger is down: pour, shake, stir, blend, swizzle. */
  function startLoop(kind) {
    if (!ctx || loops[kind]) return;
    const g = ctx.createGain(); g.gain.value = 0; g.connect(fxBus);
    g.gain.setTargetAtTime(1, ctx.currentTime, 0.04);
    const parts = [g];
    if (kind === 'pour') {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 7; lg.gain.value = 300;
      lfo.connect(lg).connect(f.frequency); lfo.start();
      const v = ctx.createGain(); v.gain.value = 0.16;
      s.connect(f).connect(v).connect(g); s.start();
      parts.push(s, lfo);
    } else if (kind === 'blend') {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 95;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
      const v = ctx.createGain(); v.gain.value = 0.08;
      o.connect(f).connect(v).connect(g); o.start();
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const v2 = ctx.createGain(); v2.gain.value = 0.05; s.connect(v2).connect(g); s.start();
      parts.push(o, s);
    }
    loops[kind] = { g, parts, tick: 0 };
    if (kind === 'shake' || kind === 'stir' || kind === 'swizzle') {
      // a rattle of ice made of short hits
      const every = kind === 'shake' ? 110 : 260;
      loops[kind].tick = setInterval(() => {
        if (kind === 'shake') { noise(0.06, { freq: 2600, vol: 0.14 }); clink(0.02, 0.05); } else clink(0, 0.06);
      }, every);
    }
  }

  function stopLoop(kind) {
    const l = loops[kind];
    if (!l) return;
    clearInterval(l.tick);
    l.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    setTimeout(() => { for (const p of l.parts.slice(1)) { try { p.stop(); } catch (e) { /* already stopped */ } } l.g.disconnect(); }, 300);
    delete loops[kind];
  }

  // slow lounge jazz: ii–V–I–VI in F with a walking bass, 84 bpm, swung
  const CH = [[196, 233.1, 293.7, 349.2], [174.6, 220, 261.6, 329.6], [174.6, 220, 261.6, 349.2], [146.8, 185, 220, 293.7]];
  const ROOTS = [98, 130.8, 87.3, 73.4];
  function beat(i, at) {
    const bar = Math.floor(i / 8) % 4, s = i % 8;
    const d = at - ctx.currentTime;
    const root = ROOTS[bar];
    if (s % 2 === 0) tone(root * [1, 1.25, 1.5, 1.68][s / 2], 0.32, { type: 'triangle', vol: 0.3, at: d, bus: musicBus });
    if (s === 0 || s === 5) for (const f of CH[bar]) tone(f * 2, 0.9, { type: 'sine', vol: 0.045, at: d, bus: musicBus, attack: 0.02 });
    if (s % 2 === 1) noise(0.05, { freq: 7000, type: 'highpass', vol: 0.05, at: d, bus: musicBus });
    if (s === 4) noise(0.12, { freq: 2500, q: 0.5, vol: 0.05, at: d, bus: musicBus });
  }

  function startMusic() {
    wantMusic = true;
    if (!ctx || timer) return;
    nextAt = ctx.currentTime + 0.05; step = 0;
    timer = setInterval(() => {
      if (ctx.state !== 'running') return;
      if (nextAt < ctx.currentTime) nextAt = ctx.currentTime + 0.05;
      while (nextAt < ctx.currentTime + 0.2) {
        beat(step, nextAt);
        nextAt += (60 / 84 / 2) * (step % 2 ? 0.8 : 1.2);
        step++;
      }
    }, 60);
  }

  return {
    unlock, sfx, startLoop, stopLoop, startMusic,
    stopAll() { for (const k of Object.keys(loops)) stopLoop(k); },
    setSound(v) { soundOn = v; if (fxBus) fxBus.gain.value = v ? 1 : 0; },
    setMusic(v) { musicOn = v; if (musicBus) musicBus.gain.value = v ? 0.22 : 0; },
    pause() { ctx?.suspend().catch(() => {}); },
    resume() { ctx?.resume().catch(() => {}); },
  };
}
