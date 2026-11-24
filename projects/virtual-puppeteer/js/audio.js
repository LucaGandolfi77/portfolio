/** audio.js — effetti sonori sintetizzati. */

export function createAudio({ enabled = true } = {}) {
  let context = null, bus = null, on = enabled;

  function ensure() {
    if (!on) return null;
    try {
      if (!context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return null;
        context = new Context();
        bus = context.createGain();
        bus.gain.value = 0.9;
        bus.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume();
      return context;
    } catch (e) { return null; }
  }

  function tone(frequency, duration, type = 'sine', volume = 0.1, end = null) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      const start = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, start);
      if (end) osc.frequency.exponentialRampToValueAtTime(Math.max(1, end), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain); gain.connect(bus);
      osc.start(start); osc.stop(start + duration + 0.04);
    } catch (e) {}
  }

  return {
    unlock() { ensure(); },
    setEnabled(value) { on = !!value; if (bus) bus.gain.value = on ? 0.9 : 0; },
    get enabled() { return on; },
    blip(character) {
      const frequency = character.voice.base * (0.86 + Math.random() * 0.35);
      tone(frequency, 0.075, character.voice.wave, 0.11, frequency * (0.8 + Math.random() * 0.4));
    },
    pop() { tone(900, 0.07, 'sine', 0.1, 1600); },
    boing() { tone(190, 0.22, 'triangle', 0.14, 420); },
    shutter() { tone(1400, 0.04, 'square', 0.09); tone(900, 0.06, 'square', 0.07); }
  };
}
