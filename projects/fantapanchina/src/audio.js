/* WebAudio leggero: suoni sintetici + haptic. Nessun asset esterno. */
let ac = null;

function ensure() {
  if (!ac) {
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function tone(freq, dur, type, vol, delay, slideTo) {
  const ctx = ensure();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol || 0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0); o.stop(t0 + dur + 0.03);
  } catch (e) { /* audio non disponibile */ }
}

export function play(name, enabled) {
  if (enabled === false) return;
  switch (name) {
    case 'tap': tone(520, 0.05, 'triangle', 0.05, 0, 720); break;
    case 'combo': tone(880, 0.07, 'square', 0.04, 0, 1200); break;
    case 'buy': tone(440, 0.08, 'sine', 0.07); tone(660, 0.12, 'sine', 0.07, 0.08); break;
    case 'upgrade': tone(330, 0.09, 'triangle', 0.07); tone(495, 0.14, 'triangle', 0.07, 0.09); break;
    case 'goal': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, 'triangle', 0.1, i * 0.09)); break;
    case 'whistle': tone(1400, 0.16, 'square', 0.05, 0, 1800); break;
    case 'prestige': [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'sine', 0.1, i * 0.1)); break;
    case 'error': tone(180, 0.16, 'sawtooth', 0.06, 0, 120); break;
    default: break;
  }
}

export function vibrate(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
}

export function unlock() { ensure(); }
