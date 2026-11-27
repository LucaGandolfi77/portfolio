/* ============================================================
   Bar Blu — sound (WebAudio, nothing pre-recorded)
   ------------------------------------------------------------
   · generative music: each mood is a slow chord loop with an
     electric piano, a pad, a few wandering melody notes and an
     ambience layer (rain, wind, the hum of the fridge)
   · "macchina": the machines' jingle, cheerful and a bit out of tune
   · "casta": a bel canto phrase sung by a vibrato voice
   · small sounds: door bell, cups, coins, glass, thunder, phone,
     and a soft blip per character as words appear
   ============================================================ */

let AC = null, master, musicBus, sfxBus, reverb, noiseBuf;
const prefs = { music: 0.55, sfx: 0.8 };
let current = null;   // { name, stop() }

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export function unlock() {
  if (!AC) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    try { AC = new C({ latencyHint: 'playback' }); } catch (e) { AC = new C(); }
    master = AC.createGain();
    master.gain.value = 0.9;
    const comp = AC.createDynamicsCompressor();
    comp.threshold.value = -18;
    master.connect(comp);
    comp.connect(AC.destination);
    reverb = AC.createConvolver();
    const len = AC.sampleRate * 3;
    const ir = AC.createBuffer(2, len, AC.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    reverb.buffer = ir;
    const rv = AC.createGain();
    rv.gain.value = 0.45;
    reverb.connect(rv);
    rv.connect(master);
    musicBus = AC.createGain();
    musicBus.gain.value = prefs.music;
    musicBus.connect(master);
    musicBus.connect(reverb);
    sfxBus = AC.createGain();
    sfxBus.gain.value = prefs.sfx;
    sfxBus.connect(master);
    noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  if (AC.state !== 'running') AC.resume().catch(() => {});
  return AC;
}

export function setVolumes(music, sfx) {
  prefs.music = music;
  prefs.sfx = sfx;
  if (musicBus) musicBus.gain.setTargetAtTime(music, AC.currentTime, 0.2);
  if (sfxBus) sfxBus.gain.setTargetAtTime(sfx, AC.currentTime, 0.1);
}
export const volumes = () => ({ ...prefs });

/* ---------------- building blocks ---------------- */

function env(dest, t, a, peak, d, sustain = 0) {
  const g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t + a + d);
  g.connect(dest);
  return g;
}

function osc(type, f, t, end, dest, detune = 0) {
  const o = AC.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = detune;
  o.connect(dest);
  o.start(t);
  o.stop(end);
  return o;
}

function ep(m, t, dur, vel, dest) {
  const f = mtof(m);
  const g = env(dest, t, 0.006, 0.12 * vel, dur + 0.6);
  const car = osc('sine', f, t, t + dur + 0.8, g);
  const mod = AC.createOscillator();
  mod.frequency.value = f * 2;
  const mg = AC.createGain();
  mg.gain.setValueAtTime(f * 1.2, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.8);
  mod.connect(mg); mg.connect(car.frequency);
  mod.start(t); mod.stop(t + dur + 0.8);
}

function pad(m, t, dur, vel, dest, bright = 900) {
  const g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.035 * vel, t + dur * 0.4);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
  const lp = AC.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = bright;
  lp.connect(g);
  g.connect(dest);
  for (const d of [-7, 7]) osc('sawtooth', mtof(m), t, t + dur + 0.7, lp, d);
}

function bell(m, t, vel, dest) {
  const f = mtof(m);
  const g = env(dest, t, 0.003, 0.07 * vel, 2.2);
  osc('sine', f, t, t + 2.4, g);
  const h = AC.createGain(); h.gain.value = 0.25; h.connect(g);
  osc('sine', f * 2.76, t, t + 1.2, h);
}

function noiseLayer(dest, type, freq, gain, q = 0.7) {
  const src = AC.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = AC.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = AC.createGain();
  g.gain.value = 0;
  g.gain.setTargetAtTime(gain, AC.currentTime, 1.2);
  src.connect(f); f.connect(g); g.connect(dest);
  src.start();
  return { src, g };
}

/* ---------------- moods ---------------- */

const MOODS = {
  giorno: { bpm: 72, chords: [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]], inst: 'ep', melody: [72, 74, 76, 79, 81], amb: 'cafe' },
  sera: { bpm: 64, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [52, 56, 59, 62]], inst: 'ep', melody: [69, 72, 74, 76], amb: 'cafe' },
  notte: { bpm: 54, chords: [[52, 55, 59, 62], [48, 52, 55, 59], [45, 48, 52, 55], [47, 50, 54, 57]], inst: 'ep', melody: [64, 67, 71, 74], amb: 'hum' },
  pioggia: { bpm: 50, chords: [[50, 53, 57, 60], [46, 50, 53, 57], [43, 46, 50, 53], [45, 49, 52, 55]], inst: 'pad', melody: [62, 65, 69, 72], amb: 'rain' },
  neve: { bpm: 46, chords: [[57, 61, 64, 68], [54, 57, 61, 64], [50, 54, 57, 61], [52, 56, 59, 63]], inst: 'bell', melody: [76, 80, 81, 85, 88], amb: 'wind' },
  cantina: { bpm: 40, chords: [[43, 50, 55, 58], [41, 48, 53, 56], [39, 46, 51, 55], [38, 45, 50, 53]], inst: 'pad', melody: [], amb: 'hum' },
  colletta: { bpm: 66, chords: [[53, 57, 60, 64], [55, 59, 62, 65], [57, 60, 64, 67], [53, 57, 60, 65]], inst: 'ep', melody: [69, 72, 74, 77], amb: 'cafe' },
  finale: { bpm: 70, chords: [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]], inst: 'bell', melody: [72, 76, 79, 84], amb: null },
  epilogo: { bpm: 52, chords: [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 60], [55, 59, 62, 65]], inst: 'ep', melody: [69, 72, 76], amb: null },
};

function startMood(name) {
  const m = MOODS[name];
  const bus = AC.createGain();
  bus.gain.value = 0;
  bus.gain.setTargetAtTime(1, AC.currentTime, 1.5);
  bus.connect(musicBus);
  const layers = [];
  if (m.amb === 'rain') layers.push(noiseLayer(bus, 'bandpass', 1800, 0.18, 0.4), noiseLayer(bus, 'lowpass', 400, 0.12));
  if (m.amb === 'wind') layers.push(noiseLayer(bus, 'bandpass', 500, 0.08, 2));
  if (m.amb === 'hum') {
    const g = AC.createGain(); g.gain.value = 0.012; g.connect(bus);
    layers.push({ src: osc('sine', 50, AC.currentTime, AC.currentTime + 3600, g), g });
  }
  if (m.amb === 'cafe') layers.push(noiseLayer(bus, 'bandpass', 700, 0.03, 0.8));
  const spb = 60 / m.bpm;
  let next = AC.currentTime + 0.1;
  let bar = 0;
  const tick = () => {
    while (next < AC.currentTime + 1.5) {
      const ch = m.chords[bar % m.chords.length];
      const dur = spb * 4;
      if (m.inst === 'pad') ch.forEach((n) => pad(n, next, dur, 1, bus));
      else if (m.inst === 'bell') { ch.forEach((n, i) => bell(n + 12, next + i * spb * 0.5, 0.7, bus)); pad(ch[0], next, dur, 0.6, bus, 600); }
      else { ch.forEach((n, i) => ep(n, next + i * 0.02, dur * 0.9, 0.8, bus)); ep(ch[0] - 12, next, dur, 0.9, bus); }
      if (m.melody.length) {
        for (let b = 0; b < 4; b++) {
          if (Math.random() < 0.34) {
            const note = m.melody[Math.floor(Math.random() * m.melody.length)];
            const t = next + b * spb + (Math.random() < 0.5 ? 0 : spb / 2);
            if (m.inst === 'bell') bell(note, t, 0.5, bus); else ep(note, t, spb * 1.5, 0.45, bus);
          }
        }
      }
      next += dur;
      bar++;
    }
  };
  tick();
  const timer = setInterval(tick, 400);
  return {
    stop() {
      clearInterval(timer);
      bus.gain.setTargetAtTime(0, AC.currentTime, 0.8);
      setTimeout(() => { for (const l of layers) try { l.src.stop(); } catch (e) { /* stopped */ } bus.disconnect(); }, 4000);
    },
  };
}

/* The three sisters' jingle: a bright square-wave arpeggio, slightly detuned, forever. */
function startMachine() {
  const bus = AC.createGain();
  bus.gain.value = 0.0;
  bus.gain.setTargetAtTime(0.5, AC.currentTime, 0.5);
  bus.connect(musicBus);
  const notes = [72, 76, 79, 84, 79, 76, 74, 77, 81, 86, 81, 77, 76, 79, 84, 88];
  const step = 0.12;
  let next = AC.currentTime + 0.05;
  let i = 0;
  const tick = () => {
    while (next < AC.currentTime + 0.6) {
      const g = env(bus, next, 0.004, 0.035, 0.1);
      osc('square', mtof(notes[i % notes.length]), next, next + 0.12, g, 14);
      if (i % 4 === 0) { const b = env(bus, next, 0.004, 0.05, 0.18); osc('triangle', mtof(notes[i % notes.length] - 24), next, next + 0.2, b); }
      next += step;
      i++;
      if (i % 32 === 0) next += 1.6;   // the pause before it starts again, the same
    }
  };
  tick();
  const timer = setInterval(tick, 150);
  return { stop() { clearInterval(timer); bus.gain.setTargetAtTime(0, AC.currentTime, 0.3); setTimeout(() => bus.disconnect(), 2000); } };
}

/* A slow bel canto phrase in F major, sung by a vibrato voice over strings. */
function startCasta() {
  const bus = AC.createGain();
  bus.gain.value = 0;
  bus.gain.setTargetAtTime(1, AC.currentTime, 0.6);
  bus.connect(musicBus);
  const phrase = [[72, 3], [74, 1], [72, 1], [70, 1], [69, 2], [70, 1], [72, 1], [77, 3], [76, 1], [74, 1], [72, 1], [70, 2], [69, 2], [67, 2], [65, 4]];
  const chords = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]];
  const beat = 0.75;
  let t = AC.currentTime + 0.4;
  chords.forEach((c, k) => c.forEach((n) => pad(n, t + k * beat * 6, beat * 6.5, 1.2, bus, 1400)));
  for (const [m, d] of phrase) {
    const f = mtof(m);
    const g = AC.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.18);
    g.gain.setValueAtTime(0.085, t + d * beat - 0.12);
    g.gain.linearRampToValueAtTime(0.0001, t + d * beat + 0.08);
    const formant = AC.createBiquadFilter();
    formant.type = 'peaking';
    formant.frequency.value = 1100;
    formant.gain.value = 9;
    g.connect(formant);
    formant.connect(bus);
    const o = osc('sawtooth', f, t, t + d * beat + 0.15, g);
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    o.disconnect(); o.connect(lp); lp.connect(g);
    const vib = AC.createOscillator(); vib.frequency.value = 5.6;
    const vg = AC.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.012, t + 0.4);
    vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(t + d * beat + 0.15);
    t += d * beat;
  }
  return { stop() { bus.gain.setTargetAtTime(0, AC.currentTime, 0.5); setTimeout(() => bus.disconnect(), 3000); } };
}

export function music(name) {
  if (!unlock()) return;
  if (current && current.name === name) return;
  if (current) current.stop();
  current = null;
  if (!name || name === 'stop') return;
  const player = name === 'macchina' ? startMachine() : name === 'casta' ? startCasta() : MOODS[name] ? startMood(name) : null;
  if (player) current = { name, stop: player.stop };
}

/* ---------------- sounds ---------------- */

function noiseHit(t, dur, type, freq, gain, q = 0.8) {
  const src = AC.createBufferSource();
  src.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = AC.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(sfxBus);
  src.start(t, Math.random()); src.stop(t + dur + 0.05);
}

export function sfx(name) {
  if (!unlock()) return;
  const t = AC.currentTime + 0.01;
  switch (name) {
    case 'porta': bell(88, t, 1.4, sfxBus); bell(93, t + 0.12, 1.1, sfxBus); break;
    case 'tazzina': { const g = env(sfxBus, t, 0.002, 0.08, 0.25); osc('sine', 2350, t, t + 0.3, g); osc('sine', 3710, t, t + 0.2, g); noiseHit(t, 0.03, 'highpass', 5000, 0.05); break; }
    case 'moneta': for (let i = 0; i < 4; i++) { const g = env(sfxBus, t + i * 0.06, 0.002, 0.05, 0.2); osc('sine', 3000 + i * 260, t + i * 0.06, t + i * 0.06 + 0.25, g); } break;
    case 'jingle': [84, 88, 91, 96].forEach((m, i) => { const g = env(sfxBus, t + i * 0.09, 0.003, 0.06, 0.15); osc('square', mtof(m), t + i * 0.09, t + i * 0.09 + 0.2, g, 12); }); break;
    case 'vetro': noiseHit(t, 0.6, 'highpass', 3000, 0.5); for (let i = 0; i < 9; i++) { const tt = t + Math.random() * 0.5; const g = env(sfxBus, tt, 0.001, 0.04, 0.3); osc('sine', 3000 + Math.random() * 4000, tt, tt + 0.35, g); } break;
    case 'tuono': noiseHit(t, 3.2, 'lowpass', 160, 0.9); noiseHit(t + 0.1, 1.2, 'lowpass', 500, 0.3); break;
    case 'telefono': for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) { const tt = t + r * 1.2 + i * 0.05; const g = env(sfxBus, tt, 0.002, 0.04, 0.04); osc('sine', i % 2 ? 1300 : 1600, tt, tt + 0.05, g); } break;
    case 'vinci': [72, 76, 79, 84, 88].forEach((m, i) => { const g = env(sfxBus, t + i * 0.07, 0.003, 0.07, 0.3); osc('square', mtof(m), t + i * 0.07, t + i * 0.07 + 0.35, g, 10); }); break;
    case 'reel': for (let i = 0; i < 8; i++) { const g = env(sfxBus, t + i * 0.05, 0.001, 0.025, 0.03); osc('square', 900 + (i % 3) * 120, t + i * 0.05, t + i * 0.05 + 0.04, g); } break;
    case 'pagina': noiseHit(t, 0.18, 'bandpass', 2500, 0.12, 0.6); break;
    default: break;
  }
}

/** A tiny pitched blip per typed syllable: each character has their own pitch. */
export function blip(freq) {
  if (!AC || AC.state !== 'running' || prefs.sfx === 0) return;
  const t = AC.currentTime;
  const g = env(sfxBus, t, 0.003, 0.018, 0.05);
  osc('triangle', freq * (0.94 + Math.random() * 0.12), t, t + 0.07, g);
}
