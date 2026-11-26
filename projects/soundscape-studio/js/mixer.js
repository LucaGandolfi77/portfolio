/**
 * Soundscape Studio — Mixer (Web Audio API, zero server, zero CDN)
 *
 * Catena: sorgente (rumore filtrato + LFO) -> filtro del preset -> guadagno
 *         -> basso -> treble -> pan -> master -> uscita.
 * Il contesto audio parte sospeso: viene ripreso al primo clic dell'utente.
 */
const AMBIENTS = {
  rain:   { filter: 'lowpass',  freq: 1400, q: 0.5, gain: 0.35, lfo: null },
  forest: { filter: 'bandpass', freq: 900,  q: 0.7, gain: 0.25, lfo: { rate: 0.12, depth: 0.12 } },
  ocean:  { filter: 'lowpass',  freq: 500,  q: 0.4, gain: 0.45, lfo: { rate: 0.09, depth: 0.3 } },
  fire:   { filter: 'bandpass', freq: 2600, q: 1.2, gain: 0.18, lfo: { rate: 7.5,  depth: 0.06 } }
};

const Mixer = {
  ctx: null, master: null, bass: null, treble: null, pan: null,
  noiseBuffer: null, nodes: [], current: null,

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.bass = this.ctx.createBiquadFilter(); this.bass.type = 'lowshelf'; this.bass.frequency.value = 300; this.bass.gain.value = 0;
    this.treble = this.ctx.createBiquadFilter(); this.treble.type = 'highshelf'; this.treble.frequency.value = 3000; this.treble.gain.value = 0;
    this.pan = this.ctx.createStereoPanner(); this.pan.pan.value = 0;
    this.bass.connect(this.treble); this.treble.connect(this.pan); this.pan.connect(this.master); this.master.connect(this.ctx.destination);
    this.master.gain.value = 0.8;
    this.noiseBuffer = this.makeNoise(4);
    this.setupUI();
  },

  // Rumore bianco di 4 secondi, riusato in loop da tutti gli ambienti.
  makeNoise(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return buf;
  },

  setupUI() {
    const at = (node, value) => node.setTargetAtTime(Number(value), this.ctx.currentTime, 0.02);
    document.getElementById('vol-master').addEventListener('input', e => at(this.master.gain, e.target.value));
    document.getElementById('eq-bass').addEventListener('input', e => at(this.bass.gain, e.target.value));
    document.getElementById('eq-treble').addEventListener('input', e => at(this.treble.gain, e.target.value));
    document.getElementById('pan-master').addEventListener('input', e => at(this.pan.pan, e.target.value));
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') return this.ctx.resume();
    return Promise.resolve();
  },

  startAmbient(type) {
    const cfg = AMBIENTS[type] || AMBIENTS.rain;
    this.stop();
    this.resume();

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer; src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = cfg.filter; filter.frequency.value = cfg.freq; filter.Q.value = cfg.q;
    const gain = this.ctx.createGain();
    gain.gain.value = cfg.gain;
    src.connect(filter); filter.connect(gain); gain.connect(this.bass);
    src.start();
    this.nodes = [src, filter, gain];

    // Modulazione lenta (onde, vento) o rapida (fruscio del fuoco).
    if (cfg.lfo) {
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = cfg.lfo.rate;
      const depth = this.ctx.createGain();
      depth.gain.value = cfg.lfo.depth * cfg.gain;
      lfo.connect(depth); depth.connect(gain.gain);
      lfo.start();
      this.nodes.push(lfo, depth);
    }
    this.current = type;
  },

  stop() {
    this.nodes.forEach(n => { try { if (n.stop) n.stop(); } catch (e) { /* già fermato */ } try { n.disconnect(); } catch (e) { /* già scollegato */ } });
    this.nodes = [];
    this.current = null;
  }
};
