/* ===== DIAMOND & OVAL POLY '99 · WebAudio Stadium Sound Engine ===== */
let ac = null;
let soundEnabled = true;

export function setSoundEnabled(flag) {
  soundEnabled = !!flag;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function haptic(pattern = 20) {
  try {
    if (navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

function ctx() {
  if (!soundEnabled) return null;
  try {
    if (window.R2 && window.R2.getSettings && !window.R2.getSettings().sound) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ac) ac = new AC();
    if (ac.state === "suspended") ac.resume();
    return ac;
  } catch (e) {
    return null;
  }
}

export function sfxPitchWhoosh() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(290, now);
    o.frequency.exponentialRampToValueAtTime(105, now + 0.22);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    o.connect(g);
    g.connect(c.destination);
    o.start(now);
    o.stop(now + 0.22);
  } catch (e) {}
}

export function sfxPitchBounce() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(160, now);
    o.frequency.exponentialRampToValueAtTime(62, now + 0.08);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    o.connect(g);
    g.connect(c.destination);
    o.start(now);
    o.stop(now + 0.08);
  } catch (e) {}
}

export function sfxSwingMiss() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(195, now);
    o.frequency.exponentialRampToValueAtTime(65, now + 0.16);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    o.connect(g);
    g.connect(c.destination);
    o.start(now);
    o.stop(now + 0.16);
  } catch (e) {}
}

export function sfxBatCrack(power = 1.0, alloy = false) {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = alloy ? "sine" : "square";
    o.frequency.setValueAtTime(alloy ? 1120 : 520 * power, now);
    o.frequency.exponentialRampToValueAtTime(alloy ? 680 : 120, now + (alloy ? 0.28 : 0.11));
    g.gain.setValueAtTime(Math.min(0.32, 0.22 * power), now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (alloy ? 0.28 : 0.12));
    o.connect(g);
    g.connect(c.destination);
    o.start(now);
    o.stop(now + (alloy ? 0.28 : 0.12));
    haptic(power > 1.1 ? [30, 25, 55] : 22);
  } catch (e) {}
}

/* Crisp willow-on-leather cricket knock */
export function sfxCricketKnock(power = 1.0) {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    // Hollow willow knock + high woody transient
    const o1 = c.createOscillator();
    const g1 = c.createGain();
    o1.type = "triangle";
    o1.frequency.setValueAtTime(640 * (0.9 + power * 0.18), now);
    o1.frequency.exponentialRampToValueAtTime(190, now + 0.09);
    g1.gain.setValueAtTime(Math.min(0.34, 0.24 * power), now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    o1.connect(g1);
    g1.connect(c.destination);
    o1.start(now);
    o1.stop(now + 0.10);

    const o2 = c.createOscillator();
    const g2 = c.createGain();
    o2.type = "sine";
    o2.frequency.setValueAtTime(1450, now);
    o2.frequency.exponentialRampToValueAtTime(420, now + 0.045);
    g2.gain.setValueAtTime(0.14 * power, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    o2.connect(g2);
    g2.connect(c.destination);
    o2.start(now);
    o2.stop(now + 0.05);

    haptic(power > 1.1 ? [25, 20, 50] : 20);
  } catch (e) {}
}

/* Wooden stumps & bails clattering on BOWLED / RUN OUT */
export function sfxStumpsShatter() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const freqs = [920, 740, 1180, 610];
    freqs.forEach((f, idx) => {
      const t = now + idx * 0.032;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.48, t + 0.075);
      g.gain.setValueAtTime(0.13, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + 0.08);
    });
    haptic([45, 30, 45]);
  } catch (e) {}
}

export function sfxMittPop() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, now);
    o.frequency.exponentialRampToValueAtTime(48, now + 0.09);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    o.connect(g);
    g.connect(c.destination);
    o.start(now);
    o.stop(now + 0.09);
  } catch (e) {}
}

export function sfxStep() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(115, now);
    o.frequency.exponentialRampToValueAtTime(55, now + 0.05);
    g.gain.setValueAtTime(0.07, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    o.connect(g);
    g.connect(c.destination);
    o.start(now);
    o.stop(now + 0.05);
  } catch (e) {}
}

export function sfxSlide() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const bufSize = Math.floor(c.sampleRate * 0.22);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    const g = c.createGain();
    g.gain.setValueAtTime(0.16, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start(now);
    haptic(28);
  } catch (e) {}
}

export function sfxOrganCharge() {
  const c = ctx();
  if (!c) return;
  const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
  const durs  = [0.11,   0.11,   0.11,   0.22,   0.11,   0.38];
  let t = c.currentTime;
  notes.forEach((f, idx) => {
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.05, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + durs[idx]);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + durs[idx]);
      t += durs[idx] * 1.05;
    } catch (e) {}
  });
}

export function sfxCricketFanfare() {
  const c = ctx();
  if (!c) return;
  const notes = [329.63, 392.00, 493.88, 659.25];
  const durs  = [0.10,   0.10,   0.12,   0.36];
  let t = c.currentTime;
  notes.forEach((f, idx) => {
    try {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + durs[idx]);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + durs[idx]);
      t += durs[idx] * 0.98;
    } catch (e) {}
  });
}

export function sfxCrowdCheer() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const dur = 0.95;
    const bufSize = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const env = Math.sin((i / bufSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.5;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1150;
    const g = c.createGain();
    g.gain.setValueAtTime(0.14, now);
    src.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    src.start(now);

    [261.63, 329.63, 392.0, 523.25].forEach((freq) => {
      const o = c.createOscillator();
      const og = c.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(freq, now);
      og.gain.setValueAtTime(0.05, now);
      og.gain.exponentialRampToValueAtTime(0.001, now + 0.78);
      o.connect(og);
      og.connect(c.destination);
      o.start(now);
      o.stop(now + 0.78);
    });
  } catch (e) {}
}

export function sfxUmpireOut() {
  const c = ctx();
  if (!c) return;
  try {
    const now = c.currentTime;
    [220, 164.81].forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(freq, now + i * 0.12);
      g.gain.setValueAtTime(0.08, now + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.18);
      o.connect(g);
      g.connect(c.destination);
      o.start(now + i * 0.12);
      o.stop(now + i * 0.12 + 0.18);
    });
    haptic([35, 25, 35]);
  } catch (e) {}
}
