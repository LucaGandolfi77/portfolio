/**
 * audio.js — effetti sonori sintetizzati (nessun file esterno).
 */

export function createAudio() {
  let ctx = null;
  let enabled = true;

  function ensure() {
    if (!enabled) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) { return null; }
  }
  function tone(freq, duration, type = 'sine', gain = 0.06, when = 0) {
    const context = ensure();
    if (!context) return;
    const osc = context.createOscillator(), volume = context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    volume.gain.setValueAtTime(gain, context.currentTime + when);
    volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + when + duration);
    osc.connect(volume); volume.connect(context.destination);
    osc.start(context.currentTime + when);
    osc.stop(context.currentTime + when + duration + 0.02);
  }
  return {
    unlock() { ensure(); },
    setEnabled(value) { enabled = !!value; if (!enabled && ctx) ctx.suspend(); },
    get enabled() { return enabled; },
    bell() { tone(880, 0.35, 'sine', 0.09); tone(1320, 0.25, 'sine', 0.05, 0.12); },
    go() { tone(523, 0.18, 'triangle', 0.08); tone(784, 0.3, 'triangle', 0.08, 0.16); },
    hoof(intensity = 0.5) { tone(150 + intensity * 60, 0.05, 'triangle', 0.025 + intensity * 0.02); },
    cheer(intensity = 1) {
      const context = ensure();
      if (!context) return;
      const length = Math.floor(context.sampleRate * 0.7);
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 1200;
      const volume = context.createGain(); volume.gain.value = 0.05 * intensity;
      source.buffer = buffer; source.connect(filter); filter.connect(volume); volume.connect(context.destination);
      source.start();
    },
    flash() { tone(2400, 0.06, 'square', 0.04); },
    error() { tone(180, 0.22, 'sawtooth', 0.05); }
  };
}
