// breathing.js — Canvas animation for the Hourly Wellness Widget
// Provides: Breathing circle, timer overlay, visual inhale/exhale cycle

function gid(id) { return document.getElementById(id); }

var Breathing = {
  active: false,
  phase: 'inhale',  // 'inhale' | 'exhale'
  timer: null,
  interval: null,
  remaining: 60,

  init() {
    const canvas = gid('breath-canvas');
    if (!canvas) return;
    // Resize observer for responsive canvas
    window.addEventListener('resize', () => Breathing.resize());
    Breathing.resize();
  },

  resize() {
    const canvas = gid('breath-canvas');
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(window.innerWidth * 0.9, 360);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    Breathing.render(ctx, size / 2, size / 2, 85);
  },

  render(ctx, cx, cy, r) {
    const t = Date.now();
    const pulse = Math.sin(t / 600) * 8 + r;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, pulse * 1.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
    ctx.fill();

    // Main breathing circle
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.2)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e94560';
    ctx.stroke();

    // Inner glow pulse
    ctx.beginPath();
    const inner = Math.sin(t / 800) * 4 + r * 0.45;
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Respira', cx, cy - 10);
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText(Breathing.phase === 'inhale' ? 'Inspira...' : 'Espira...', cx, cy + 16);
  },

  start() {
    if (Breathing.active) return;
    Breathing.active = true;
    Breathing.phase = 'inhale';
    Breathing.remaining = 60;
    gid('focus-overlay').hidden = false;
    Breathing.interval = setInterval(() => Breathing.tick(), 1000);
    Breathing.tick();
  },

  tick() {
    Breathing.remaining--;
    if (Breathing.remaining <= 0) {
      Breathing.stop();
      Breathing.complete();
    } else {
      // Toggle phase every 4 seconds (inhale 4s, exhale 6s ~ 10s cycle)
      if (Breathing.remaining % 10 === 0) Breathing.phase = 'inhale';
      else if (Breathing.remaining % 10 === 4) Breathing.phase = 'exhale';
    }

    gid('focus-count').textContent = Breathing.phase === 'inhale' ? 'Inspira lentamente' : 'Espira lentamente';
    Breathing.render(gid('focus-canvas').getContext('2d'), 50, 50, 30);
  },

  complete() {
    if (window.Streak) { Streak.markBreak(); }
  },

  stop() {
    Breathing.active = false;
    clearInterval(Breathing.interval);
    gid('focus-overlay').hidden = true;
  }
};

// Minimal canvas for focus overlay
function initFocusCanvas() {
  const canvas = gid('focus-canvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = 100;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}
