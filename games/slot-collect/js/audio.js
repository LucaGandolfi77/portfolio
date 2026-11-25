/* Slot Collect — WebAudio synth: reels, wins, free spins, ambient arpeggio */

import * as KIT from '../../_kit/audio.js';

let enabled = true, musicTimer = null, step = 0;
const SCALE = [262, 311, 392, 466, 523, 622, 784];

export function init(sound = true) { enabled = sound !== false; return KIT.init(enabled); }
export function resume() { KIT.resume(); }
export function setSound(v) { enabled = !!v; KIT.setSound(enabled); if (!enabled) stopMusic(); else startMusic(); }

export function startMusic() {
  if (musicTimer || !enabled) return;
  step = 0;
  musicTimer = setInterval(() => {
    if (!enabled) return;
    const n = SCALE[(step * 3 + (step >> 2)) % SCALE.length];
    KIT.tone(n, 0.22, 'triangle', 0.018);
    if (step % 4 === 0) KIT.tone(n / 2, 0.4, 'sine', 0.02);
    step++;
  }, 360);
}
export function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } }

export const sfx = {
  spin() { KIT.noise(0.18, 0.06); KIT.tone(220, 0.1, 'square', 0.06, 90); },
  stop(reel = 0) { KIT.tone(330 + reel * 80, 0.07, 'square', 0.08); },
  line() { KIT.tone(660, 0.1, 'triangle', 0.12, 180); },
  win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => KIT.tone(f, 0.22, 'triangle', 0.14), i * 90)); },
  jackpot() { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => KIT.tone(f, 0.28, 'sine', 0.16), i * 80)); KIT.noise(0.4, 0.08); },
  free() { [392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => KIT.tone(f, 0.25, 'triangle', 0.13), i * 100)); },
  miss() { KIT.tone(180, 0.16, 'sawtooth', 0.1, -60); },
  bank() { KIT.sfx.coin(); },
  buy() { KIT.tone(880, 0.1, 'sine', 0.12, 220); setTimeout(() => KIT.tone(1320, 0.14, 'sine', 0.1), 70); },
  lose() { KIT.sfx.lose(); },
  tap() { KIT.sfx.tap(); }
};
