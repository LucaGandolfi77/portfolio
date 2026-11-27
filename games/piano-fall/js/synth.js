/* ============================================================
   Piano Fall — synth (WebAudio, no samples)
   ------------------------------------------------------------
   · piano voice: stretched partials, a filter that darkens as the
     note rings, a hammer tick, longer decay in the bass, and a
     real release when the key comes up
   · backing band: bass, 808, log drum, e-piano, pads, strings,
     organ, plucks, guitars, square wave, soft piano
   · drum kit: kick, snare, clap, hats, shaker, rim, ride
   · one shared AudioContext, unlocked from a user gesture (iOS)
   ============================================================ */

let AC = null;
let master, leadBus, backBus, reverb, revSend, noise;
let broken = false;
let primed = false;

export const audioState = { enabled: true, backing: 0.75 };

export function context() { return AC; }

function create() {
  if (AC || broken) return AC;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) { broken = true; return null; }
  try {
    try { AC = new Ctor({ latencyHint: 'interactive' }); } catch (e) { AC = new Ctor(); }
  } catch (e) {
    AC = null;   // some WebKit builds only allow this inside a gesture: retry on the next one
    return null;
  }
  const comp = AC.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 3.5;
  comp.attack.value = 0.004;
  comp.release.value = 0.2;
  master = AC.createGain();
  master.gain.value = 0.8;
  master.connect(comp);
  comp.connect(AC.destination);

  reverb = AC.createConvolver();
  reverb.buffer = impulse(2.4, 2.8);
  revSend = AC.createGain();
  revSend.gain.value = 0.32;
  revSend.connect(reverb);
  reverb.connect(master);

  leadBus = AC.createGain();
  leadBus.gain.value = 0.9;
  leadBus.connect(master);
  const leadRev = AC.createGain();
  leadRev.gain.value = 0.55;
  leadBus.connect(leadRev);
  leadRev.connect(revSend);

  backBus = AC.createGain();
  setBackingVolume(audioState.backing);
  backBus.connect(master);
  const backRev = AC.createGain();
  backRev.gain.value = 0.35;
  backBus.connect(backRev);
  backRev.connect(revSend);

  noise = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AC.addEventListener('statechange', () => { if (AC.state !== 'running') primed = false; });
  return AC;
}

function impulse(seconds, decay) {
  const rate = AC.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = AC.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

/* iOS: a silent one-sample buffer, started inside the same gesture that resumed the context. */
function prime() {
  if (!AC || primed || AC.state !== 'running') return;
  try {
    const src = AC.createBufferSource();
    src.buffer = AC.createBuffer(1, 1, 22050);
    src.connect(AC.destination);
    src.start(0);
    primed = true;
  } catch (e) { /* next gesture */ }
}

/** Call from every pointer/key gesture. Returns the context (maybe still starting). */
export function unlock() {
  if (!audioState.enabled) return AC;
  const ac = create();
  if (!ac) return null;
  if (ac.state === 'running') { prime(); return ac; }
  if (ac.state !== 'closed') {
    try {
      const p = ac.resume();
      if (p && p.then) p.then(prime).catch(() => {});
    } catch (e) { /* retry */ }
  }
  return ac;
}

export function running() { return !!AC && AC.state === 'running'; }
export function suspend() { if (AC && AC.state === 'running') AC.suspend().catch(() => {}); }
export function now() { return AC ? AC.currentTime : 0; }

export function setBackingVolume(v) {
  audioState.backing = v;
  if (backBus) backBus.gain.value = 0.62 * v;
}

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function ready() {
  return audioState.enabled && AC && AC.state !== 'closed' ? AC : null;
}

/* ---------------- piano ---------------- */

/**
 * Plays a piano note now (or at `when`). Returns { release(at) } so a key
 * coming up damps the string; untouched it rings out naturally.
 */
export function piano(midi, vel = 0.6, when, bus = 'lead') {
  const ac = ready();
  if (!ac) return NOOP;
  const t = Math.max(when ?? ac.currentTime, ac.currentTime);
  const f = mtof(midi);
  const decay = Math.min(3.4, Math.max(0.9, 3.4 - (midi - 40) * 0.045));
  const out = ac.createGain();
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.Q.value = 0.5;
  filt.frequency.setValueAtTime(Math.min(15000, f * 7 + 2600 * vel), t);
  filt.frequency.exponentialRampToValueAtTime(Math.max(500, f * 2.4), t + 1.1);
  out.connect(filt);
  filt.connect(bus === 'lead' ? leadBus : backBus);

  const peak = 0.34 * vel;
  out.gain.setValueAtTime(0.0001, t);
  out.gain.linearRampToValueAtTime(peak, t + 0.005);
  out.gain.setTargetAtTime(peak * 0.42, t + 0.006, 0.18);
  out.gain.setTargetAtTime(0.0001, t + 0.35, decay / 3.2);

  const oscs = [];
  const partials = [[1, 1, 'triangle'], [2, 0.5, 'sine'], [3, 0.2, 'sine'], [4, 0.09, 'sine'], [5.02, 0.04, 'sine']];
  for (const [mul, amp, type] of partials) {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.value = f * mul * (1 + 0.00035 * mul * mul);
    o.detune.value = (Math.random() - 0.5) * 4;
    const g = ac.createGain();
    g.gain.value = amp * (mul > 1 ? Math.max(0.3, 1 - (midi - 60) / 48) : 1);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + decay * 2.6);
    oscs.push(o);
  }
  if (bus === 'lead') hammer(t, f, vel);
  let released = false;
  return {
    release(at) {
      if (released) return;
      released = true;
      const r = Math.max(at ?? ac.currentTime, t + 0.03);
      try {
        if (out.gain.cancelAndHoldAtTime) out.gain.cancelAndHoldAtTime(r);
        else { out.gain.cancelScheduledValues(r); out.gain.setValueAtTime(peak * 0.3, r); }
        out.gain.setTargetAtTime(0.0001, r, 0.07);
        for (const o of oscs) o.stop(r + 0.6);
      } catch (e) { /* already stopped */ }
    },
  };
}

const NOOP = { release() {} };

function hammer(t, f, vel) {
  const src = AC.createBufferSource();
  src.buffer = noise;
  const bp = AC.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = Math.min(9000, f * 4);
  bp.Q.value = 1.2;
  const g = AC.createGain();
  g.gain.setValueAtTime(0.05 * vel, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  src.connect(bp); bp.connect(g); g.connect(leadBus);
  src.start(t, Math.random() * 0.5);
  src.stop(t + 0.04);
}

/* ---------------- backing instruments ---------------- */

function osc(type, freq, t, end, dest, detune = 0) {
  const o = AC.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  o.connect(dest);
  o.start(t);
  o.stop(end);
  return o;
}

function envGain(t, attack, peak, hold, release) {
  const g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + Math.max(attack, hold));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack, hold) + release);
  return g;
}

function lowpass(freq, q = 0.7) {
  const f = AC.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

let shaper;
function drive() {
  if (!shaper) {
    shaper = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; shaper[i] = Math.tanh(x * 4); }
  }
  const w = AC.createWaveShaper();
  w.curve = shaper;
  return w;
}

/** One note of a backing instrument, scheduled at `when` for `dur` seconds. */
export function instrument(name, midi, when, dur, vel = 1) {
  const ac = ready();
  if (!ac) return;
  const t = Math.max(when, ac.currentTime);
  const f = mtof(midi);
  const end = t + dur;
  switch (name) {
    case 'keys': {
      piano(midi, 0.42 * vel, t, 'back').release(end);
      break;
    }
    case 'bass': {
      const g = envGain(t, 0.006, 0.42 * vel, dur * 0.7, 0.12);
      const lp = lowpass(Math.min(1800, f * 6), 2);
      lp.frequency.setValueAtTime(f * 10, t);
      lp.frequency.exponentialRampToValueAtTime(f * 3, t + 0.2);
      lp.connect(g); g.connect(backBus);
      osc('sawtooth', f, t, end + 0.2, lp);
      const sub = AC.createGain(); sub.gain.value = 0.6; sub.connect(g);
      osc('sine', f, t, end + 0.2, sub);
      break;
    }
    case 'sub': {
      const g = envGain(t, 0.005, 0.6 * vel, dur * 0.8, 0.25);
      const w = drive(); const pre = AC.createGain(); pre.gain.value = 0.6;
      pre.connect(w); w.connect(g); g.connect(backBus);
      const o = osc('sine', f * 2, t, end + 0.3, pre);
      o.frequency.setValueAtTime(f * 1.5, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
      break;
    }
    case 'log': {
      const g = envGain(t, 0.003, 0.55 * vel, 0.02, Math.min(0.5, dur + 0.15));
      g.connect(backBus);
      const o = osc('sine', f, t, end + 0.5, g);
      o.frequency.setValueAtTime(f * 1.9, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      break;
    }
    case 'ep': {
      const g = envGain(t, 0.004, 0.2 * vel, 0.02, Math.max(0.4, dur));
      g.connect(backBus);
      const car = osc('sine', f, t, end + 0.6, g);
      const mod = AC.createOscillator(); mod.frequency.value = f * 2;
      const mg = AC.createGain();
      mg.gain.setValueAtTime(f * 1.4, t);
      mg.gain.exponentialRampToValueAtTime(f * 0.1, t + 0.6);
      mod.connect(mg); mg.connect(car.frequency);
      mod.start(t); mod.stop(end + 0.6);
      break;
    }
    case 'pad':
    case 'str':
    case 'saw': {
      const bright = name === 'saw';
      const attack = name === 'pad' ? 0.25 : name === 'str' ? 0.14 : 0.01;
      const g = envGain(t, attack, (bright ? 0.1 : 0.075) * vel, dur, name === 'saw' ? 0.12 : 0.35);
      const lp = lowpass(bright ? 4200 : name === 'str' ? 2400 : 1400, 0.8);
      lp.connect(g); g.connect(backBus);
      for (const d of bright ? [-14, 0, 14] : [-8, 8]) osc('sawtooth', f, t, end + 0.5, lp, d);
      break;
    }
    case 'organ': {
      const g = envGain(t, 0.03, 0.09 * vel, dur, 0.15);
      g.connect(backBus);
      for (const [mul, amp] of [[1, 1], [2, 0.6], [3, 0.3], [4, 0.2]]) {
        const a = AC.createGain(); a.gain.value = amp; a.connect(g);
        osc('sine', f * mul, t, end + 0.2, a);
      }
      break;
    }
    case 'pluck':
    case 'gtrc': {
      const g = envGain(t, 0.003, 0.2 * vel, 0.01, name === 'gtrc' ? 0.55 : 0.28);
      const lp = lowpass(f * 6, 1);
      lp.frequency.setValueAtTime(f * 9, t);
      lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.3);
      lp.connect(g); g.connect(backBus);
      osc(name === 'gtrc' ? 'triangle' : 'sawtooth', f, t, t + 0.7, lp);
      break;
    }
    case 'gtr': {
      const g = envGain(t, 0.004, 0.1 * vel, dur * 0.8, 0.08);
      const w = drive(); const lp = lowpass(2600, 0.9);
      w.connect(lp); lp.connect(g); g.connect(backBus);
      osc('sawtooth', f, t, end + 0.1, w, -6); osc('sawtooth', f, t, end + 0.1, w, 6);
      break;
    }
    case 'sq': {
      const g = envGain(t, 0.002, 0.08 * vel, dur * 0.6, 0.06);
      g.connect(backBus);
      osc('square', f, t, end + 0.1, g);
      break;
    }
    case 'bell': {
      const g = envGain(t, 0.002, 0.12 * vel, 0.01, 1.2);
      g.connect(backBus);
      osc('sine', f * 2, t, t + 1.3, g);
      const h = AC.createGain(); h.gain.value = 0.3; h.connect(g);
      osc('sine', f * 5.4, t, t + 1.3, h);
      break;
    }
    default:
      piano(midi, 0.4 * vel, t, 'back').release(end);
  }
}

/* ---------------- drums ---------------- */

function noiseHit(t, dur, type, freq, gain, q = 0.8) {
  const src = AC.createBufferSource();
  src.buffer = noise;
  const filt = AC.createBiquadFilter();
  filt.type = type;
  filt.frequency.value = freq;
  filt.Q.value = q;
  const g = AC.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt); filt.connect(g); g.connect(backBus);
  src.start(t, Math.random() * 0.6);
  src.stop(t + dur + 0.02);
}

export function drum(kind, when, vel = 1) {
  const ac = ready();
  if (!ac) return;
  const t = Math.max(when, ac.currentTime);
  switch (kind) {
    case 'k': {
      const g = AC.createGain();
      g.gain.setValueAtTime(0.9 * vel, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      g.connect(backBus);
      const o = osc('sine', 150, t, t + 0.4, g);
      o.frequency.setValueAtTime(155, t);
      o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
      break;
    }
    case 's':
      noiseHit(t, 0.17, 'highpass', 1400, 0.35 * vel);
      { const g = envGain(t, 0.001, 0.25 * vel, 0.01, 0.1); g.connect(backBus); osc('triangle', 190, t, t + 0.15, g); }
      break;
    case 'c':
      for (const d of [0, 0.011, 0.022]) noiseHit(t + d, d === 0.022 ? 0.16 : 0.03, 'bandpass', 1300, 0.4 * vel, 1.4);
      break;
    case 'h': noiseHit(t, 0.045, 'highpass', 7500, 0.2 * vel); break;
    case 'oh': noiseHit(t, 0.24, 'highpass', 6800, 0.16 * vel); break;
    case 'sh': noiseHit(t, 0.05, 'bandpass', 6200, 0.16 * vel, 1.5); break;
    case 'rim': {
      const g = envGain(t, 0.001, 0.16 * vel, 0.002, 0.04);
      g.connect(backBus); osc('square', 820, t, t + 0.06, g);
      break;
    }
    case 'ride':
      noiseHit(t, 0.35, 'highpass', 5200, 0.09 * vel);
      { const g = envGain(t, 0.001, 0.03 * vel, 0.005, 0.4); g.connect(backBus); osc('square', 465, t, t + 0.45, g); }
      break;
    default: break;
  }
}

/* ---------------- UI blips ---------------- */

export function blip(freq = 660, dur = 0.06, type = 'triangle', peak = 0.05) {
  const ac = ready();
  if (!ac) return;
  const t = ac.currentTime;
  const g = AC.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(master);
  osc(type, freq, t, t + dur + 0.02, g);
}
