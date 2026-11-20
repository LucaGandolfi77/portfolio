/* Game Kit — fixed-step loop, clamp, RNG, rewards */

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function makeLoop(update, draw, step = 1 / 60) {
  let last = 0, acc = 0, raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.1) dt = 0.1;
    acc += dt;
    let n = 0;
    while (acc >= step && n < 6) { update(step); acc -= step; n++; }
    draw(acc / step);
  }
  return {
    start() { if (!raf) raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); raf = 0; last = 0; acc = 0; }
  };
}

export const DIFFICULTY = {
  easy:   { label: 'EASY',   speed: 0.8, damage: 0.7, reward: 0.8 },
  normal: { label: 'NORMAL', speed: 1.0, damage: 1.0, reward: 1.0 },
  hard:   { label: 'HARD',   speed: 1.25, damage: 1.5, reward: 1.5 }
};

export function dailySeed(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
