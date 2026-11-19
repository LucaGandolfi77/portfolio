/* Card Collector — lightweight visual effects and notifications */

let toastTimer = 0;
let toastEl = null;
let translator = value => value;
let fxCanvas = null;
let fxCtx = null;
let fxParticles = [];
let fxRaf = 0;
let fxLast = 0;

export function initEffects() {
  toastEl = document.getElementById('toast');
  fxCanvas = document.getElementById('fxCanvas');
  if (fxCanvas) {
    fxCtx = fxCanvas.getContext('2d');
    resizeFx();
    window.addEventListener('resize', resizeFx);
  }
}

export function resizeFx() {
  if (!fxCanvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  fxCanvas.width = Math.round(w * dpr);
  fxCanvas.height = Math.round(h * dpr);
  fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fxCanvas.style.width = w + 'px';
  fxCanvas.style.height = h + 'px';
}

export function setTranslator(fn) { translator = typeof fn === 'function' ? fn : value => value; }

export function toast(message, type = 'info') {
  if (!toastEl) return;
  toastEl.textContent = translator(message);
  toastEl.className = 'toast on ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.className = 'toast'; }, 2400);
}

function burst(x, y, color) {
  for (let i = 0; i < 36; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 90 + Math.random() * 260;
    fxParticles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.7 + Math.random() * 0.6,
      maxLife: 1.3,
      color,
      size: 2 + Math.random() * 3
    });
  }
}

function fxLoop(now) {
  const dt = Math.min(0.05, (now - fxLast) / 1000);
  fxLast = now;
  fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  fxParticles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt;
    p.life -= dt;
  });
  fxParticles = fxParticles.filter(p => p.life > 0);
  fxCtx.globalCompositeOperation = 'lighter';
  fxParticles.forEach(p => {
    fxCtx.globalAlpha = Math.max(0, p.life / p.maxLife);
    fxCtx.fillStyle = p.color;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fxCtx.fill();
  });
  fxCtx.globalAlpha = 1;
  fxCtx.globalCompositeOperation = 'source-over';
  if (fxParticles.length) fxRaf = requestAnimationFrame(fxLoop);
  else fxRaf = 0;
}

export function celebrate(colors = ['#ffd166', '#4aa8ff', '#b478ff', '#5ef0a8']) {
  if (!fxCtx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      burst(window.innerWidth * (0.2 + Math.random() * 0.6), window.innerHeight * (0.15 + Math.random() * 0.35), colors[i % colors.length]);
      if (!fxRaf) { fxLast = performance.now(); fxRaf = requestAnimationFrame(fxLoop); }
    }, i * 180);
  }
}

export function floatText(text, x, y, color = '#5ef0a8') {
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}
