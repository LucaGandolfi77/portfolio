/* De Rerum Gatta — audio WebAudio: fusa, carillon, note. Zero file audio. */
'use strict';

const AudioSys = (() => {
  let ctx = null;
  let muted = false;
  let purrNodes = null;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Fusa: oscillatore basso (25-40 Hz) modulato + rumore filtrato
  function purrStart() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    purrStop();
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 32;
    const lfo = c.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 11;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const g = c.createGain();
    g.gain.value = 0.0;
    g.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.3);
    osc.connect(g);
    osc.start(); lfo.start();
    const noise = c.createBufferSource();
    const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    noise.buffer = buf; noise.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 140; bp.Q.value = 1.5;
    const ng = c.createGain(); ng.gain.value = 0.03;
    noise.connect(bp); bp.connect(ng); ng.connect(g);
    noise.start();
    g.connect(c.destination);
    purrNodes = { g, osc, lfo, noise, stopAt: c.currentTime };
  }

  function purrStop() {
    if (purrNodes) {
      const { g, osc, lfo, noise } = purrNodes;
      try {
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        setTimeout(() => { try { osc.stop(); lfo.stop(); noise.stop(); } catch (e) {} }, 250);
      } catch (e) {}
      purrNodes = null;
    }
  }

  function tone(freq, dur = 0.5, type = 'sine', vol = 0.12, delay = 0) {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // Carillon di vittoria
  function chime() {
    const base = 523.25; // C5
    [1, 1.25, 1.5, 2].forEach((r, i) => tone(base * r, 0.7, 'sine', 0.1, i * 0.14));
  }

  function meow() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(520, t);
    o.frequency.linearRampToValueAtTime(780, t + 0.12);
    o.frequency.linearRampToValueAtTime(420, t + 0.28);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.35);
  }

  function click() { tone(880, 0.06, 'square', 0.03); }
  function wrong() { tone(196, 0.25, 'triangle', 0.09); }

  function setMuted(m) { muted = m; if (m) purrStop(); }
  function isMuted() { return muted; }
  function unlock() { ensure(); }

  return { purrStart, purrStop, tone, chime, meow, click, wrong, setMuted, isMuted, unlock };
})();
