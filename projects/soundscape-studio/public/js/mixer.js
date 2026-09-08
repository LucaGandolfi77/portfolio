/**
 * Soundscape Studio — Mixer (Web Audio API, zero server, zero CDN)
 */
const Mixer = {
  ctx: null, master: null, bass: null, treble: null, pan: null,
  source: null, noiseBuffer: null,
  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.bass = this.ctx.createBiquadFilter(); this.bass.type = 'lowshelf'; this.bass.frequency.value = 300; this.bass.gain.value = 0;
    this.treble = this.ctx.createBiquadFilter(); this.treble.type = 'highshelf'; this.treble.frequency.value = 3000; this.treble.gain.value = 0;
    this.pan = this.ctx.createStereoPanner(); this.pan.pan.value = 0;
    this.bass.connect(this.treble); this.treble.connect(this.pan); this.pan.connect(this.master); this.master.connect(this.ctx.destination);
    this.setupUI();
  },
  setupUI() {
    document.getElementById('vol-master').addEventListener('input', e => this.master.gain.setValueAtTime(e.target.value, this.ctx.currentTime));
    document.getElementById('eq-bass').addEventListener('input', e => this.bass.gain.setValueAtTime(e.target.value, this.ctx.currentTime));
    document.getElementById('eq-treble').addEventListener('input', e => this.treble.gain.setValueAtTime(e.target.value, this.ctx.currentTime));
    document.getElementById('pan-master').addEventListener('input', e => this.pan.pan.setValueAtTime(e.target.value, this.ctx.currentTime));
  },
  startAmbient(type) {
    if (this.source) try { this.source.stop(); } catch(e){}
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.connect(g); g.connect(this.master);
    if (type === 'rain') { osc.type = 'sine'; osc.frequency.value = 200 + Math.random()*400; g.gain.value = 0.15; }
    else if (type === 'forest') { osc.type = 'triangle'; osc.frequency.value = 80 + Math.random()*120; g.gain.value = 0.1; }
    else if (type === 'ocean') { osc.type = 'sine'; osc.frequency.value = 60; g.gain.value = 0.12; }
    else if (type === 'fire') { osc.type = 'sawtooth'; osc.frequency.value = 150 + Math.random()*200; g.gain.value = 0.08; }
    else { osc.type = 'sine'; osc.frequency.value = 440; g.gain.value = 0.05; }
    osc.start();
    this.source = osc;
  },
  stop() { if (this.source) { this.source.stop(); this.source = null; } }
};
