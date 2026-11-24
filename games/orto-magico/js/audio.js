/** audio.js — WebAudio, haptics e feedback. */

export function createAudio({ enabled = true, haptics = true } = {}) {
  let context = null, bus = null, on = enabled, vibrate = haptics;

  function ensure() {
    if (!on) return null;
    try {
      if (!context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return null;
        context = new Context();
        bus = context.createGain(); bus.gain.value = 0.3; bus.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume();
      return context;
    } catch (e) { return null; }
  }

  function tone(frequency, duration, type = 'sine', volume = 0.1, slide = 0) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      const start = ctx.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain); gain.connect(bus);
      oscillator.start(start); oscillator.stop(start + duration + 0.03);
    } catch (e) {}
  }

  function buzz(pattern = 10) {
    if (vibrate && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }

  return {
    unlock() { ensure(); },
    setEnabled(value) { on = !!value; if (bus) bus.gain.value = on ? 0.3 : 0; },
    setHaptics(value) { vibrate = !!value; },
    plant() { tone(320, 0.12, 'triangle', 0.09, 180); buzz(8); },
    water() { tone(620, 0.16, 'sine', 0.08, -180); buzz(6); },
    harvest() { [523, 659, 784].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.16, 'triangle', 0.1), index * 70)); buzz([12, 20]); },
    buy() { tone(880, 0.1, 'sine', 0.1, 220); },
    achieve() { [659, 880, 1047].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.2, 'triangle', 0.1), index * 90)); buzz(30); },
    coin() { tone(1200, 0.05, 'square', 0.06); }
  };
}
