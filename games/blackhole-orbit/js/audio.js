// ═══════════════════════════════════════════════════════════════
// BLACKHOLE ORBIT — Audio procedurale (WebAudio, zero asset)
// Sintetizza laser, esplosioni, pickup e l'hum del buco nero.
// ═══════════════════════════════════════════════════════════════

var AUDIO = {};

AUDIO.ctx = null;
AUDIO.master = null;
AUDIO.muted = false;
AUDIO.humNodes = null;

AUDIO.ensure = function () {
  if (AUDIO.ctx) return true;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    AUDIO.ctx = new AC();
    AUDIO.master = AUDIO.ctx.createGain();
    AUDIO.master.gain.value = 0.5;
    AUDIO.master.connect(AUDIO.ctx.destination);
    return true;
  } catch (e) { return false; }
};

AUDIO.resume = function () {
  if (!AUDIO.ensure()) return;
  if (AUDIO.ctx.state === 'suspended') AUDIO.ctx.resume();
};

AUDIO.setMuted = function (m) {
  AUDIO.muted = m;
  if (AUDIO.master) AUDIO.master.gain.value = m ? 0 : 0.5;
  try { localStorage.setItem('bho_muted', m ? '1' : '0'); } catch (e) {}
};

AUDIO.init = function () {
  try { AUDIO.muted = localStorage.getItem('bho_muted') === '1'; } catch (e) {}
};

// --- Primitiva: blip con envelope ------------------------------------------
AUDIO.blip = function (type, freq, freqEnd, dur, vol, when) {
  if (AUDIO.muted || !AUDIO.ensure()) return;
  var t = AUDIO.ctx.currentTime + (when || 0);
  var o = AUDIO.ctx.createOscillator();
  var g = AUDIO.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(AUDIO.master);
  o.start(t); o.stop(t + dur + 0.02);
};

// Rumore bianco filtrato (esplosioni / impatti)
AUDIO.noise = function (dur, vol, filterFreq, when) {
  if (AUDIO.muted || !AUDIO.ensure()) return;
  var t = AUDIO.ctx.currentTime + (when || 0);
  var len = Math.max(1, Math.floor(AUDIO.ctx.sampleRate * dur));
  var buf = AUDIO.ctx.createBuffer(1, len, AUDIO.ctx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var src = AUDIO.ctx.createBufferSource();
  src.buffer = buf;
  var f = AUDIO.ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = filterFreq || 900;
  var g = AUDIO.ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(AUDIO.master);
  src.start(t);
};

// --- SFX di gioco ------------------------------------------------------------
AUDIO.laser = function (pitch) {
  AUDIO.blip('sawtooth', pitch || 720, 140, 0.12, 0.16);
};

AUDIO.enemyLaser = function () {
  AUDIO.blip('square', 320, 90, 0.14, 0.10);
};

AUDIO.explosion = function (big) {
  AUDIO.noise(big ? 0.7 : 0.35, big ? 0.55 : 0.3, big ? 600 : 1000);
  if (big) AUDIO.blip('sine', 120, 30, 0.6, 0.4);
};

AUDIO.pickup = function () {
  AUDIO.blip('sine', 880, 1320, 0.09, 0.12);
  AUDIO.blip('sine', 1320, 1760, 0.09, 0.10, 0.06);
};

AUDIO.hit = function () {
  AUDIO.noise(0.08, 0.18, 2400);
};

AUDIO.select = function () {
  AUDIO.blip('triangle', 520, 700, 0.07, 0.10);
};

AUDIO.levelUp = function () {
  AUDIO.blip('sine', 440, 440, 0.1, 0.2);
  AUDIO.blip('sine', 550, 550, 0.1, 0.2, 0.1);
  AUDIO.blip('sine', 660, 660, 0.14, 0.22, 0.2);
  AUDIO.blip('sine', 880, 880, 0.2, 0.25, 0.32);
};

AUDIO.death = function () {
  AUDIO.blip('sawtooth', 300, 40, 0.9, 0.35);
  AUDIO.noise(0.9, 0.5, 500);
};

AUDIO.bossAlert = function () {
  AUDIO.blip('square', 220, 220, 0.18, 0.22);
  AUDIO.blip('square', 174, 174, 0.28, 0.24, 0.2);
};

AUDIO.warp = function () {
  AUDIO.blip('sine', 200, 1200, 0.45, 0.22);
  AUDIO.noise(0.4, 0.15, 1800, 0.05);
};

// Hum ambientale del buco nero: oscillatori sub gravi con LFO sul volume.
// Si avvia al primo ingresso in gioco; il volume dipende dalla distanza dal BH.
AUDIO.startHum = function () {
  if (AUDIO.humNodes || !AUDIO.ensure()) return;
  var c = AUDIO.ctx;
  var g = c.createGain();
  g.gain.value = 0.0;
  g.connect(AUDIO.master);

  var o1 = c.createOscillator(); o1.type = 'sine';     o1.frequency.value = 42;
  var o2 = c.createOscillator(); o2.type = 'sine';     o2.frequency.value = 57.3;
  var o3 = c.createOscillator(); o3.type = 'triangle'; o3.frequency.value = 84;

  var lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.13;
  var lfoG = c.createGain(); lfoG.gain.value = 0.05;
  lfo.connect(lfoG); lfoG.connect(g.gain);

  [o1, o2, o3].forEach(function (o) { var og = c.createGain(); og.gain.value = 0.33; o.connect(og); og.connect(g); o.start(); });
  lfo.start();

  AUDIO.humNodes = { gain: g, lfo: lfo };
};

// Aggiorna l'intensità dell'hum in base alla vicinanza al buco nero (0..1)
AUDIO.setHumIntensity = function (v) {
  if (!AUDIO.humNodes) return;
  v = Math.max(0, Math.min(1, v));
  AUDIO.humNodes.gain.gain.setTargetAtTime(v * 0.34, AUDIO.ctx.currentTime, 0.4);
};
