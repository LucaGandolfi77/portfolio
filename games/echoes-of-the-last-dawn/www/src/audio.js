/* Echoes of the Last Dawn — Audio System
   Procedural Web Audio API synthesis. Zero audio files.
   Generates bell tolls, combat sounds, ambient, and music. */
'use strict';

const AudioSys = (() => {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let muted = false;
  let initialized = false;

  function ensure() {
    if (initialized) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.5;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.25;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);

    initialized = true;
    return true;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function setMuted(m) {
    muted = m;
    if (masterGain) masterGain.gain.value = m ? 0 : 0.5;
  }

  function isMuted() { return muted; }

  // ── Helpers ──

  function tone(type, f0, f1, dur, vol, delay) {
    if (muted || !ensure()) return;
    const t = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function noise(dur, vol, fq, delay) {
    if (muted || !ensure()) return;
    const t = ctx.currentTime + (delay || 0);
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = fq || 2000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(sfxGain);
    src.start(t);
  }

  // ── Sound Effects ──

  function bellToll(pitch) {
    // Deep resonant bell — the signature sound of the game
    const base = pitch || 220;
    if (muted || !ensure()) return;
    const t = ctx.currentTime;

    // Fundamental
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(base, t);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 3.0);
    osc1.connect(g1); g1.connect(sfxGain);
    osc1.start(t); osc1.stop(t + 3.02);

    // Overtone (minor third for eeriness)
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(base * 1.189, t);
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
    osc2.connect(g2); g2.connect(sfxGain);
    osc2.start(t); osc2.stop(t + 2.52);

    // Attack transient
    noise(0.08, 0.25, 3000);
  }

  function parry() {
    // Metallic clang — satisfying parry feedback
    tone('triangle', 1800, 900, 0.15, 0.35);
    tone('square', 2400, 1200, 0.08, 0.15, 0.01);
    noise(0.06, 0.2, 4000);
  }

  function parryPerfect() {
    // Enhanced parry — ascending chime
    tone('sine', 1200, 1800, 0.12, 0.3);
    tone('sine', 1800, 2400, 0.1, 0.25, 0.06);
    tone('sine', 2400, 3200, 0.08, 0.2, 0.12);
    noise(0.04, 0.15, 5000);
  }

  function hit() {
    // Physical hit impact
    noise(0.08, 0.3, 2500);
    tone('sawtooth', 200, 80, 0.1, 0.2);
  }

  function playerHit() {
    // Player taking damage — deeper, more alarming
    noise(0.12, 0.35, 1800);
    tone('sawtooth', 150, 60, 0.15, 0.25);
    tone('square', 300, 100, 0.08, 0.15, 0.03);
  }

  function heal() {
    // Gentle ascending chime
    tone('sine', 600, 800, 0.2, 0.2);
    tone('sine', 800, 1200, 0.15, 0.18, 0.1);
    tone('sine', 1200, 1600, 0.12, 0.15, 0.2);
  }

  function victory() {
    // Triumphant fanfare
    [523, 659, 784, 1047].forEach((f, i) => {
      tone('sine', f, f, 0.25, 0.25, i * 0.12);
      tone('triangle', f * 0.5, f * 0.5, 0.3, 0.1, i * 0.12);
    });
  }

  function defeat() {
    // Descending somber tones
    [440, 370, 311, 220].forEach((f, i) => {
      tone('sine', f, f * 0.7, 0.4, 0.2, i * 0.2);
    });
    noise(0.8, 0.15, 800, 0.5);
  }

  function menuClick() {
    tone('sine', 800, 1000, 0.06, 0.12);
  }

  function menuHover() {
    tone('sine', 600, 700, 0.04, 0.08);
  }

  function footstep() {
    noise(0.04, 0.08, 1500);
  }

  function ambientWind() {
    // Continuous wind — call repeatedly with long intervals
    if (muted || !ensure()) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 4);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin(Math.PI * i / len);
      d[i] = (Math.random() * 2 - 1) * env * 0.3;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 400;
    const g = ctx.createGain();
    g.gain.value = 0.08;
    src.connect(f);
    f.connect(g);
    g.connect(musicGain);
    src.start(t);
  }

  // ── Music Layer (generative) ──

  let musicInterval = null;
  let musicPlaying = false;

  const NOTES = {
    soglia:   [220, 261, 293, 329, 349],
    sala:     [196, 233, 261, 293, 329],
    galleria: [220, 277, 329, 370, 440],
    cripta:   [164, 196, 220, 261, 293],
    vetta:    [261, 329, 392, 440, 523]
  };

  function startMusic(theme) {
    if (musicPlaying) stopMusic();
    musicPlaying = true;
    const notes = NOTES[theme] || NOTES.soglia;

    function playNote() {
      if (!musicPlaying || muted) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      const dur = 1.5 + Math.random() * 2;
      tone('sine', note, note, dur, 0.06 + Math.random() * 0.04);
      // Occasionally add a harmony
      if (Math.random() < 0.3) {
        const harm = notes[Math.floor(Math.random() * notes.length)] * 1.5;
        tone('sine', harm, harm, dur * 0.7, 0.03, 0.2);
      }
    }

    playNote();
    musicInterval = setInterval(playNote, 2000 + Math.random() * 1500);
  }

  function stopMusic() {
    musicPlaying = false;
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
    }
  }

  function playTheme(theme) {
    stopMusic();
    startMusic(theme);
  }

  return {
    ensure,
    resume,
    setMuted,
    isMuted,
    bellToll,
    parry,
    parryPerfect,
    hit,
    playerHit,
    heal,
    victory,
    defeat,
    menuClick,
    menuHover,
    footstep,
    ambientWind,
    playTheme,
    stopMusic
  };
})();
