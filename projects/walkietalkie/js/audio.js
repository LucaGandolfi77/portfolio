/* Walkie Talkie — microphone, VU meter and radio effects */

export class AudioEngine {
  constructor(settings) {
    this.settings = settings;
    this.stream = null;
    this.ctx = null;
    this.analyser = null;
    this.data = null;
    this.source = null;
  }

  constraints(deviceId) {
    const s = this.settings;
    const audio = {
      echoCancellation: !!s.echoCancel,
      noiseSuppression: !!s.noiseSuppression,
      autoGainControl: !!s.autoGain
    };
    const id = deviceId ?? s.deviceId;
    if (id) audio.deviceId = { exact: id };
    return { audio };
  }

  async listDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      return all.filter(d => d.kind === 'audioinput');
    } catch (e) { return []; }
  }

  async init() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('getUserMedia unavailable');
    const stream = await navigator.mediaDevices.getUserMedia(this.constraints());
    this.stream = stream;
    stream.getAudioTracks().forEach(t => { t.enabled = false; });
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === 'suspended') await this.ctx.resume().catch(() => {});
      this.source = this.ctx.createMediaStreamSource(stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.75;
      this.data = new Uint8Array(this.analyser.fftSize);
      this.source.connect(this.analyser);
    }
    return stream;
  }

  async switchDevice(id) {
    const old = this.stream;
    this.settings.deviceId = id;
    await this.init();
    old?.getTracks().forEach(t => t.stop());
    this.source?.disconnect?.();
    return this.stream;
  }

  /* 0…1 RMS of the local mic while the PTT track is enabled. */
  level() {
    const track = this.stream?.getAudioTracks()[0];
    if (!this.analyser || !track?.enabled) return 0;
    this.analyser.getByteTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) {
      const v = (this.data[i] - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.data.length) * 4);
  }

  async playNoise(duration = 0.16, gain = 0.09) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume().catch(() => {});
    const n = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const out = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) out[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource();
    const vol = this.ctx.createGain();
    vol.gain.value = gain;
    src.buffer = buffer;
    src.connect(vol).connect(this.ctx.destination);
    src.start();
  }

  async beep(freq = 880, duration = 0.07, gain = 0.05) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume().catch(() => {});
    const osc = this.ctx.createOscillator();
    const vol = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(gain, this.ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(vol).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  applyVolume(container, value) {
    container.querySelectorAll('audio').forEach(el => { el.volume = Math.max(0, Math.min(1, value)); });
  }

  muteRemote(container, muted) {
    container.querySelectorAll('audio').forEach(el => { el.muted = !!muted; });
  }

  dispose() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.source?.disconnect?.();
    this.stream = null; this.source = null; this.analyser = null; this.data = null;
  }
}
