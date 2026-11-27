/* Italy 3D Flight Sim — engine drone and cockpit warnings (WebAudio) */

let ctx = null, gain = null, filter = null, oscillators = [], nextBeep = 0;

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    ctx = new AC();
    gain = ctx.createGain();
    gain.gain.value = 0;
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.connect(gain);
    gain.connect(ctx.destination);
    oscillators = [['sawtooth', 1], ['triangle', 1.51]].map(([type, ratio]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = 50 * ratio;
      osc.connect(filter);
      osc.start();
      return { osc, ratio };
    });
    return true;
  } catch (e) { ctx = null; return false; }
}

/* Call once from a user gesture so browsers allow sound. */
export function unlock() { if (ensure() && ctx.state === 'suspended') ctx.resume().catch(() => {}); }

function beep(frequency, length) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0.06, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + length);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + length);
}

/* `sound` is null when the engine should be silent (menus, pause, sound off). */
export function update(sound) {
  if (!ctx) return;
  const now = ctx.currentTime;
  if (!sound) { gain.gain.setTargetAtTime(0, now, 0.08); return; }
  const base = sound.jet ? 70 + sound.power * 150 : 38 + sound.power * 62;
  for (const { osc, ratio } of oscillators) osc.frequency.setTargetAtTime(base * ratio, now, 0.1);
  filter.frequency.setTargetAtTime((sound.jet ? 700 : 260) + sound.power * 600 + sound.speed * 3, now, 0.1);
  gain.gain.setTargetAtTime(0.025 + sound.power * 0.05, now, 0.1);
  if (now < nextBeep) return;
  if (sound.stall) { beep(880, 0.18); nextBeep = now + 0.3; }
  else if (sound.gear) { beep(520, 0.25); nextBeep = now + 0.8; }
}
