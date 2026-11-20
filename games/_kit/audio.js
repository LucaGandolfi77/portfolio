/* Game Kit — tiny WebAudio synth (no assets) */

let ctx = null, master = null, enabled = true;

export function init(sound = true) {
  enabled = !!sound;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = ctx || new AC();
    if (!master) {
      master = ctx.createGain();
      master.gain.value = enabled ? 0.4 : 0;
      master.connect(ctx.destination);
    }
    return true;
  } catch (e) { return false; }
}
export function resume() { if (ctx?.state === 'suspended') ctx.resume().catch(() => {}); }
export function setSound(v) {
  enabled = !!v;
  if (master && ctx) master.gain.setTargetAtTime(enabled ? 0.4 : 0, ctx.currentTime, 0.02);
}
export function tone(freq, dur = 0.1, type = 'square', vol = 0.16, slide = 0) {
  if (!enabled || !ctx) return;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(master); o.start(); o.stop(ctx.currentTime + dur + 0.02);
  } catch (e) { /* ignore */ }
}
export function noise(dur = 0.2, vol = 0.2) {
  if (!enabled || !ctx) return;
  try {
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(master); src.start();
  } catch (e) { /* ignore */ }
}
export const sfx = {
  tap: () => tone(660, 0.06, 'square', 0.1),
  good: () => { tone(520, 0.1, 'triangle', 0.14, 180); },
  bad: () => { tone(180, 0.18, 'sawtooth', 0.16, -90); noise(0.12, 0.12); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.14), i * 100)),
  lose: () => [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'sawtooth', 0.14), i * 150)),
  coin: () => { tone(880, 0.08, 'sine', 0.12, 220); setTimeout(() => tone(1320, 0.1, 'sine', 0.1), 60); }
};
