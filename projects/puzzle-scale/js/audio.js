/* Scale Puzzle — WebAudio synth */
let ctx = null, master = null, enabled = true;
export function init(sound = true) {
  enabled = !!sound;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = ctx || new AC();
    if (!master) { master = ctx.createGain(); master.gain.value = 0.3; master.connect(ctx.destination); }
    return true;
  } catch (e) { return false; }
}
export function resume() { if (ctx?.state === 'suspended') ctx.resume().catch(() => {}); }
export function setSound(v) {
  enabled = !!v;
  if (master && ctx) master.gain.setTargetAtTime(enabled ? 0.3 : 0, ctx.currentTime, 0.02);
}
function tone(freq, dur, type = 'sine', vol = 0.14, slide = 0, delay = 0) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
export const sfx = {
  hit: (combo = 1) => tone(520 + Math.min(combo, 12) * 55, 0.12, 'triangle', 0.13, 120),
  perfect: () => { tone(880, 0.1, 'sine', 0.15, 200); tone(1320, 0.12, 'sine', 0.1, 200, 0.08); },
  miss: () => tone(180, 0.2, 'sawtooth', 0.12, -90),
  hint: () => tone(660, 0.16, 'square', 0.08, 100),
  undo: () => tone(330, 0.1, 'triangle', 0.08, -80),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.13, 0, i * 0.1)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'sawtooth', 0.12, 0, i * 0.15)),
  click: () => tone(440, 0.05, 'square', 0.06)
};
