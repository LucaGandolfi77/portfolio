/* =============================================
   Cabriolo, 5:00 — audio.js
   Lo-fi generativo WebAudio · cozy vibes
   ============================================= */
"use strict";

const CabrioloAudio = (() => {
  let ctx = null;
  let master = null;
  let isPlaying = false;
  let muted = false;
  let loops = [];

  // pad chords: each is [freq, freq, freq] — summer/autumn voicings
  const CHORDS = [
    [261.63, 329.63, 392.00], // Cmaj
    [220.00, 277.18, 329.63], // Am
    [246.94, 311.13, 369.99], // Bm (Gmaj/B)
    [293.66, 349.23, 440.00], // Dmaj
    [196.00, 246.94, 293.66], // Gmaj
    [220.00, 277.18, 329.63], // Am
    [261.63, 311.13, 392.00], // Cm (moody)
    [174.61, 220.00, 261.63], // Fmaj low
  ];

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.3;
    master.connect(ctx.destination);
  }

  // soft noise buffer (vinyl crackle)
  function createNoiseBuffer(dur) {
    const len = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      // sparse crackle: mostly silence, occasional pops
      data[i] = Math.random() < 0.002 ? (Math.random() - 0.5) * 0.6 :
                Math.random() < 0.01 ? (Math.random() - 0.5) * 0.15 : 0;
    }
    return buf;
  }

  // soft pad (filtered saw, gentle)
  function createPad(freq, time, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.value = freq * 0.5; // octave down, softer
    filter.type = "lowpass";
    filter.frequency.value = 600 + Math.random() * 200;
    filter.Q.value = 0.7;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 1.5);
    gain.gain.setValueAtTime(0.06, time + dur - 2);
    gain.gain.linearRampToValueAtTime(0, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(time);
    osc.stop(time + dur);
    return osc;
  }

  // vinyl crackle loop
  function startCrackle() {
    const buf = createNoiseBuffer(4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 2000;

    const gain = ctx.createGain();
    gain.gain.value = 0.08;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start();

    loops.push(src);
    return src;
  }

  // simple melody (pentatonic, very sparse)
  function playMelodyNote(time) {
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);

    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 2);
  }

  // main loop: schedule chords + melody
  let loopTimer = null;
  let chordIdx = 0;

  function scheduleLoop() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const dur = 6; // seconds per chord

    // current chord
    const chord = CHORDS[chordIdx % CHORDS.length];
    chord.forEach((f) => createPad(f, now + 0.05, dur));

    // sparse melody: 2-4 notes per chord
    const nNotes = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < nNotes; i++) {
      playMelodyNote(now + 0.5 + Math.random() * (dur - 1.5));
    }

    chordIdx++;
    loopTimer = setTimeout(scheduleLoop, dur * 1000 - 500);
  }

  function start() {
    init();
    if (isPlaying) return;
    if (ctx.state === "suspended") ctx.resume();
    isPlaying = true;
    muted = false;
    startCrackle();
    scheduleLoop();
  }

  function toggleMute() {
    if (!ctx) return;
    muted = !muted;
    if (muted) {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      clearTimeout(loopTimer);
    } else {
      master.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
      scheduleLoop();
    }
    return muted;
  }

  function isMuted() { return muted; }

  function setMood(chapter) {
    // summer (ch 1-3): brighter, autumn (ch 4-5): more melancholic
    if (!ctx) return;
    if (chapter <= 3) {
      master.gain.linearRampToValueAtTime(muted ? 0 : 0.35, ctx.currentTime + 1);
    } else {
      master.gain.linearRampToValueAtTime(muted ? 0 : 0.2, ctx.currentTime + 1);
    }
  }

  // play a short "ding" for minigames / stat pop
  function ding() {
    if (!ctx || muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  return { start, toggleMute, isMuted, setMood, ding };
})();
