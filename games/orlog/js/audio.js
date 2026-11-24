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

  function tone(frequency, duration, type = 'triangle', volume = 0.12, slide = 0) {
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

  return {
    unlock() { ensure(); },
    setSound(value) { enabled = !!value; if (bus) bus.gain.value = enabled ? 0.35 : 0; },
    setHaptics(value) { vibrate = !!value; },
    roll() { tone(280, 0.08, 'square', 0.06, 180); if (vibrate && navigator.vibrate) navigator.vibrate(6); },
    lock() { tone(660, 0.05, 'sine', 0.07); },
    hit() { tone(150, 0.16, 'sawtooth', 0.12, -60); if (vibrate && navigator.vibrate) navigator.vibrate(30); },
    heal() { tone(520, 0.18, 'sine', 0.1, 220); },
    favor() { tone(880, 0.12, 'triangle', 0.1, 300); if (vibrate && navigator.vibrate) navigator.vibrate(18); },
    win() { [523, 659, 784, 1047].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.2, 'triangle', 0.11), index * 100)); if (vibrate && navigator.vibrate) navigator.vibrate([20, 40, 20]); },
    lose() { [392, 330, 262].forEach((frequency, index) => setTimeout(() => tone(frequency, 0.3, 'sawtooth', 0.1), index * 150)); }
  };
}
