/* ============================================================
   Bar Blu — the stage: background renders, silhouettes, weather
   ============================================================ */
import { CAST, silhouette } from '../cast.js';

/* Painted fallbacks if a render is missing (offline first visit, slow network). */
const FALLBACK = {
  mattina: 'linear-gradient(180deg,#9fb8d8,#3a5f8f 55%,#2b2219)',
  pomeriggio: 'linear-gradient(180deg,#e7b27a,#7a4f3a 55%,#2b1d14)',
  sera: 'linear-gradient(180deg,#3a3f73,#1b2b55 55%,#1a120d)',
  notte: 'linear-gradient(180deg,#0a1230,#10224a 55%,#0b0a10)',
  candele: 'radial-gradient(circle at 50% 70%,#7a3a12,#1a0c06 60%,#050304)',
  saletta: 'radial-gradient(circle at 50% 45%,#6b1030,#210610 60%,#07020a)',
  palco: 'radial-gradient(circle at 50% 40%,#284a86,#0b1530 65%,#04060d)',
  cantina: 'radial-gradient(circle at 50% 30%,#4a4236,#15120f 65%,#050404)',
  'esterno-notte': 'linear-gradient(180deg,#0b1430,#1d2a4f 60%,#08080c)',
  'esterno-alba': 'linear-gradient(180deg,#3b5fa8,#ffb38a 60%,#2a2230)',
  'esterno-chiuso': 'linear-gradient(180deg,#1a2238,#2a2f3a 60%,#0a0a0d)',
};

export const POS = { left: 22, center: 50, right: 78, farleft: 10, farright: 90 };

export function createStage(root) {
  const layers = [root.querySelector('.bg-a'), root.querySelector('.bg-b')];
  const actorsEl = root.querySelector('#actors');
  const canvas = root.querySelector('#fx');
  const ctx = canvas.getContext('2d');
  let front = 0;
  let bgName = null;
  const actors = new Map();
  let fxMode = 'none';
  let parts = [];
  let reduced = false;

  function setBackground(name, instant = false) {
    if (name === bgName) return;
    bgName = name;
    const next = layers[1 - front];
    const cur = layers[front];
    next.style.backgroundImage = `url("art/${name}.webp"), ${FALLBACK[name] || FALLBACK.notte}`;
    next.style.transition = instant || reduced ? 'none' : '';
    cur.style.transition = instant || reduced ? 'none' : '';
    next.classList.add('on');
    cur.classList.remove('on');
    front = 1 - front;
    root.dataset.bg = name;
  }

  function layout() {
    const list = [...actors.values()];
    for (const a of list) {
      a.el.style.left = POS[a.pos] + '%';
    }
  }

  function show(id, pos = 'center') {
    const c = CAST[id];
    if (!c || !c.look) return;
    let a = actors.get(id);
    if (!a) {
      const el = document.createElement('div');
      el.className = 'actor';
      el.dataset.id = id;
      el.innerHTML = silhouette(c.look, c.color, id);
      el.style.setProperty('--s', c.look.scale || 1);
      actorsEl.appendChild(el);
      a = { el, pos };
      actors.set(id, a);
      requestAnimationFrame(() => el.classList.add('in'));
    }
    a.pos = POS[pos] !== undefined ? pos : 'center';
    // two actors on the same spot: move the older one to the first free place
    for (const [other, b] of actors) {
      if (other === id || b.pos !== a.pos) continue;
      const taken = new Set([...actors.values()].map((x) => x.pos));
      b.pos = ['left', 'right', 'farleft', 'farright'].find((p) => !taken.has(p)) || 'farright';
    }
    layout();
  }

  function showLook(key, look, color) {
    hide('_guest');
    const el = document.createElement('div');
    el.className = 'actor';
    el.dataset.id = '_guest';
    el.innerHTML = silhouette(look, color, 'guest' + key);
    actorsEl.appendChild(el);
    actors.set('_guest', { el, pos: 'center' });
    layout();
    requestAnimationFrame(() => el.classList.add('in'));
  }

  function hide(id) {
    const ids = id === 'all' ? [...actors.keys()] : [id];
    for (const k of ids) {
      const a = actors.get(k);
      if (!a) continue;
      actors.delete(k);
      a.el.classList.remove('in');
      a.el.classList.add('out');
      setTimeout(() => a.el.remove(), reduced ? 0 : 600);
    }
  }

  function speaking(id) {
    for (const [k, a] of actors) a.el.classList.toggle('talk', k === id);
  }

  function snapshot() {
    return { bg: bgName, fx: fxMode, actors: [...actors].filter(([k]) => k !== '_guest').map(([k, a]) => [k, a.pos]) };
  }

  function restore(snap) {
    hide('all');
    if (snap.bg) setBackground(snap.bg, true);
    setFx(snap.fx || 'none');
    for (const [k, p] of snap.actors || []) show(k, p);
  }

  /* ---------------- weather & light ---------------- */

  function setFx(mode) {
    fxMode = mode || 'none';
    parts = [];
    root.dataset.fx = fxMode;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame(dt) {
    const W = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
    const H = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
    ctx.clearRect(0, 0, W, H);
    if (fxMode === 'none' || reduced) return;
    const want = { pioggia: 140, neve: 110, candele: 26, fumo: 14 }[fxMode] || 0;
    while (parts.length < want) parts.push(spawn(W, H, true));
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (fxMode === 'neve') p.x += Math.sin(p.y * 0.02 + p.seed) * 12 * dt;
      if (p.y > H + 10 || p.x < -20 || p.x > W + 20 || p.life <= 0) { parts[i] = spawn(W, H, false); continue; }
      if (fxMode === 'pioggia') {
        ctx.strokeStyle = `rgba(170,200,255,${p.a})`;
        ctx.lineWidth = p.w;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); ctx.stroke();
      } else if (fxMode === 'neve') {
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      } else if (fxMode === 'candele') {
        const a = p.a * Math.max(0, Math.min(1, p.life / 2));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(255,170,80,${a})`);
        g.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      } else if (fxMode === 'fumo') {
        const a = p.a * Math.sin(Math.min(1, p.life / p.max) * Math.PI);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        p.r += dt * 6;
      }
    }
  }

  function spawn(W, H, anywhere) {
    const r = Math.random;
    if (fxMode === 'pioggia') return { x: r() * W * 1.2, y: anywhere ? r() * H : -20, vx: -60, vy: 700 + r() * 300, w: 0.6 + r(), a: 0.15 + r() * 0.25, life: 9 };
    if (fxMode === 'neve') return { x: r() * W, y: anywhere ? r() * H : -10, vx: -10 + r() * 20, vy: 30 + r() * 50, r: 0.8 + r() * 2.4, a: 0.4 + r() * 0.5, seed: r() * 9, life: 60 };
    if (fxMode === 'candele') return { x: r() * W, y: H * (0.35 + r() * 0.5), vx: 0, vy: -6 - r() * 8, r: 30 + r() * 70, a: 0.06 + r() * 0.08, life: 2 + r() * 4 };
    return { x: W * (0.3 + r() * 0.4), y: H * (0.62 + r() * 0.1), vx: -4 + r() * 8, vy: -14 - r() * 10, r: 4 + r() * 6, a: 0.05 + r() * 0.05, life: 3 + r() * 3, max: 6 };
  }

  return {
    setBackground, show, showLook, hide, speaking, setFx, resize, frame, snapshot, restore,
    get bg() { return bgName; },
    set reduced(v) { reduced = v; },
    actorIds: () => [...actors.keys()],
  };
}
