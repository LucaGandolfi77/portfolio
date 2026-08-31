/* ZERO ASSOLUTO — audio WebAudio: colpi, carillon, scherzi. Zero file audio. */
'use strict';

const AudioSys = (() => {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur = 0.3, type = 'sine', vol = 0.12, delay = 0) {
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

  function hit() { tone(300, 0.15, 'sawtooth', 0.1); }
  function blocked() { tone(160, 0.25, 'square', 0.08); }
  function chime() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.6, 'sine', 0.1, i * 0.12)); }
  function zero() { [440, 554, 659, 880, 1108, 1320].forEach((f, i) => tone(f, 0.5, 'triangle', 0.12, i * 0.1)); }
  function click() { tone(700, 0.06, 'square', 0.04); }
  function wrong() { tone(180, 0.25, 'triangle', 0.1); }
  function meow() {
    if (muted) return;
    const c = ensure(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(500, t);
    o.frequency.linearRampToValueAtTime(800, t + 0.12);
    o.frequency.linearRampToValueAtTime(400, t + 0.25);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.1, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.35);
  }

  function setMuted(m) { muted = m; }
  function isMuted() { return muted; }
  function unlock() { ensure(); }

  return { tone, hit, blocked, chime, zero, click, wrong, meow, setMuted, isMuted, unlock };
})();
