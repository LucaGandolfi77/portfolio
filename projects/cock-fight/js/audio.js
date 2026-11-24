/* Cockpit Arena — WebAudio synth */
let ctx = null, master = null, enabled = true;

export function init(sound = true) {
  enabled = !!sound;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = ctx || new AC();
    if (!master) { master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination); }
    return true;
  } catch (e) { return false; }
}
export function resume() { if (ctx?.state === 'suspended') ctx.resume().catch(() => {}); }
export function setSound(v) {
  enabled = !!v;
  if (master && ctx) master.gain.setTargetAtTime(enabled ? 0.35 : 0, ctx.currentTime, 0.02);
}
function tone(freq, dur, type = 'square', vol = 0.16, slide = 0) {
  if (!enabled || !ctx) return;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.02);
  } catch (e) {}
}
export function noise(dur = 0.16, vol = 0.16) {
  if (!enabled || !ctx) return;
  try {
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ctx.createBufferSource(), g = ctx.createGain();
    s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(master); s.start();
  } catch (e) {}
}
export const sfx = {
  hit: () => { tone(220, 0.09, 'square', 0.14, -120); noise(0.09, 0.1); },
  perfect: () => { tone(880, 0.1, 'sine', 0.16, 320); setTimeout(() => tone(1320, 0.12, 'sine', 0.12), 70); },
  miss: () => tone(140, 0.16, 'sawtooth', 0.14, -70),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.14), i * 110)),
  lose: () => [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, 0.28, 'sawtooth', 0.13), i * 150)),
  coin: () => { tone(740, 0.08, 'sine', 0.12, 180); setTimeout(() => tone(1100, 0.1, 'sine', 0.1), 60); },
  click: () => tone(520, 0.05, 'triangle', 0.08)
};
