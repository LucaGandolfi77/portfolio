/* Forza 4 — sound, confetti and juicy feedback */

import { state } from './state.js';

let ctx = null;
let canvas = null;
let particles = [];
let raf = 0;
let last = 0;
let audio = null;

export function initEffects(confettiCanvas) {
  canvas = confettiCanvas;
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
}

function ensureAudio() {
  if (audio || !state.settings.sound) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audio = new AC();
  } catch (e) { /* silent */ }
}

export function sfx(name) {
  if (!state.settings.sound) return;
  ensureAudio();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  const tone = (freq, end, duration, type = 'sine', gain = 0.08, delay = 0) => {
    try {
      const t = audio.currentTime + delay;
      const osc = audio.createOscillator();
      const amp = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(amp);
      amp.connect(audio.destination);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    } catch (e) { /* ignore */ }
  };
  switch (name) {
    case 'drop': tone(420, 180, 0.11, 'triangle', 0.06); break;
    case 'win': [523, 659, 784, 1046].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.09, i * 0.09)); break;
    case 'lose': [400, 330, 260].forEach((f, i) => tone(f, f * 0.8, 0.24, 'sawtooth', 0.06, i * 0.12)); break;
    case 'draw': tone(330, 330, 0.18, 'sine', 0.06); tone(330, 330, 0.18, 'sine', 0.05, 0.2); break;
    case 'undo': tone(500, 300, 0.12, 'sine', 0.05); break;
    case 'hint': tone(660, 990, 0.15, 'sine', 0.06); break;
    case 'click': tone(620, 760, 0.06, 'square', 0.03); break;
  }
}

const COLORS = ['#ffd166', '#ff6b6b', '#6ee7ff', '#a98bff', '#5ef0a8', '#ffffff'];

export function confetti(amount = 120) {
  if (!ctx || state.settings.reduceMotion) return;
  for (let i = 0; i < amount; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.5,
      vx: (Math.random() - 0.5) * 90,
      vy: 120 + Math.random() * 260,
      size: 5 + Math.random() * 7,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 8,
      color: COLORS[i % COLORS.length]
    });
  }
  if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
}

function step(now) {
  const dt = Math.min(0.04, (now - last) / 1000);
  last = now;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  let alive = 0;
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rotation += p.spin * dt;
    if (p.y < window.innerHeight + 30) alive++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    ctx.restore();
  }
  if (alive) raf = requestAnimationFrame(step);
  else { raf = 0; particles = []; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
}

export function shake(element) {
  if (!element || state.settings.reduceMotion) return;
  element.classList.remove('shake');
  void element.offsetWidth;
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 500);
}
