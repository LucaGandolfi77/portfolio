/* Sky Ace — WebAudio synthesized sound effects and music */

let ctx = null;
let master = null;
let musicGain = null;
let musicTimer = null;
let musicStep = 0;
let enabled = true;
const SCALE = [110, 130.81, 164.81, 196, 220, 261.63, 329.63, 392];

function ensure() {
  if (ctx) return true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.12;
    musicGain.connect(master);
    return true;
  } catch (e) { return false; }
}

export function resume() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

export function setSound(value) {
  enabled = !!value;
  if (master && ctx) master.gain.setTargetAtTime(enabled ? 0.5 : 0, ctx.currentTime, 0.02);
}

export function isSound() { return enabled; }

function tone(freq, duration, type = 'square', volume = 0.2, slide = 0, dest = null) {
  if (!enabled || !ensure()) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(dest || master);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  } catch (e) { /* ignore */ }
}

function noise(duration, volume = 0.25, filterFreq = 800) {
  if (!enabled || !ensure()) return;
  try {
    const len = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(filter); filter.connect(gain); gain.connect(master);
    src.start();
  } catch (e) { /* ignore */ }
}

export const sfx = {
  shoot() { tone(880, 0.06, 'square', 0.07, -520); },
  enemyshot() { tone(320, 0.09, 'sawtooth', 0.05, -160); },
  explosion() { noise(0.32, 0.28, 900); tone(90, 0.28, 'sawtooth', 0.16, -50); },
  bomb() { tone(180, 0.18, 'triangle', 0.16, -110); },
  hit() { tone(140, 0.12, 'square', 0.14, -70); },
  damage() { noise(0.2, 0.3, 500); tone(110, 0.22, 'sawtooth', 0.2, -60); },
  shield() { tone(680, 0.2, 'sine', 0.18, 420); },
  pickup() { tone(620, 0.1, 'sine', 0.16, 260); setTimeout(() => tone(920, 0.14, 'sine', 0.14, 180), 70); },
  flip() { tone(420, 0.14, 'triangle', 0.14, 360); },
  combo() { tone(760, 0.08, 'square', 0.1, 180); },
  boss() { tone(70, 0.5, 'sawtooth', 0.22, -20); noise(0.5, 0.18, 500); },
  levelclear() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.16), i * 110)); },
  victory() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => tone(f, 0.34, 'triangle', 0.17), i * 130)); },
  gameover() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.42, 'sawtooth', 0.16), i * 170)); }
};

export function startMusic() {
  if (!enabled || !ensure() || musicTimer) return;
  const patterns = [
    [0, 2, 4, 2], [0, 3, 5, 3], [1, 3, 6, 3], [0, 2, 5, 4]
  ];
  musicTimer = setInterval(() => {
    if (!enabled || ctx.state !== 'running') return;
    const bar = patterns[Math.floor(musicStep / 4) % patterns.length];
    const note = bar[musicStep % 4];
    tone(SCALE[note], 0.16, 'triangle', 0.1, 0, musicGain);
    if (musicStep % 4 === 0) tone(SCALE[0] / 2, 0.28, 'sine', 0.16, 0, musicGain);
    musicStep++;
  }, 220);
}

export function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  musicStep = 0;
}
