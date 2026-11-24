/** audio.js — WebAudio, haptics e feedback. */

export function createAudio({ sound = true, haptics = true } = {}) {
  let context = null, bus = null, enabled = sound, vibrate = haptics;

  function ensure() {
    if (!enabled) return null;
    try {
      if (!context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) return null;
        context = new Context();
        bus = context.createGain();
        bus.gain.value = 0.35;
        bus.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume();
      return context;
    } catch (e) { return null; }
  }

  function tone(frequency, duration, type = 'sine', volume = 0.12, slide = 0) {
    const ctx = ensure();
    if (!ctx) return;
    try {
      const oscillator = ctx.createOscillator(), gain = ctx.createGain();
      const start = ctx.currentTime;
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency + slide), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain); gain.connect(bus);
      oscillator.start(start); oscillator.stop(start + duration + 0.03);
    } catch (e) {}
  }

  function buzz(pattern = 12) {
    if (vibrate && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }

  return {
    unlock() { ensure(); },
    setSound(value) { enabled = !!value; if (bus) bus.gain.value = enabled ? 0.35 : 0; },
    setHaptics(value) { vibrate = !!value; },
    flip() { tone(520, 0.07, 'triangle', 0.08, 120); buzz(8); },
    match(combo = 0) {
      const frequency = 440 + Math.min(8, combo) * 60;
      tone(frequency, 0.12, 'sine', 0.12, 160);
      setTimeout(() => tone(frequency * 1.5, 0.1, 'sine', 0.08), 60);
      buzz(14);
    },
    miss() { tone(180, 0.16, 'sawtooth', 0.09, -60); },
    power() { tone(880, 0.1, 'triangle', 0.1, 300); buzz(20); },
    win() { [523, 659, 784, 1047].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.2, 'triangle', 0.1), index * 90)); buzz([20, 40, 20]); }
  };
}
