/* ============================================================
   Seba — the lighter against the wind
   ------------------------------------------------------------
   Shielding protects the flame but tires the paw. The flame
   makes progress while it is alive; three attempts.
   ============================================================ */
import { el } from './shell.js';

export const ATTEMPTS = 3;
export const newLight = () => ({ flame: 1, progress: 0, hand: 1, t: 0, wind: 0.2 });
export const windAt = (t, seed = 0) => {
  const gust = Math.max(0, Math.sin(t * 2.1 + seed) + Math.sin(t * 0.9 + seed * 2) * 0.7 - 0.35);
  return Math.min(1, 0.12 + gust * 0.75);
};
/** One simulation step; returns 'lit', 'out' or null. */
export function stepLight(s, dt, holding, seed = 0) {
  s.t += dt;
  s.wind = windAt(s.t, seed);
  const shield = holding && s.hand > 0.02;
  s.hand = Math.max(0, Math.min(1, s.hand + (shield ? -0.38 : 0.3) * dt));
  const hurt = s.wind > 0.35 ? (s.wind - 0.35) * (shield ? 0.12 : 3.4) : 0;
  s.flame = Math.max(0, Math.min(1, s.flame - hurt * dt + (hurt ? 0 : 0.25 * dt)));
  s.progress = Math.min(1, s.progress + s.flame * 0.12 * dt);
  if (s.progress >= 1) return 'lit';
  if (s.flame <= 0) return 'out';
  return null;
}
export const perfOf = (lit, attempt, progress) => (lit ? [1, 0.75, 0.55][attempt - 1] ?? 0.5 : progress * 0.4);

export const lighterGame = {
  id: 'lighter',
  start(api) {
    const { stage, hud, ctx } = api;
    const view = api.canvas();
    const hold = el('button', 'btn primary light-hold', ctx.t('game.lighter.hold')); hold.type = 'button';
    stage.appendChild(hold);
    let holding = false, attempt = 1, seed = Math.random() * 6, sim = newLight(), pause = 0, best = 0;
    const set = (v) => { holding = v; hold.classList.toggle('held', v); };
    api.on(hold, 'pointerdown', (e) => { e.preventDefault(); hold.setPointerCapture?.(e.pointerId); set(true); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((n) => api.on(hold, n, () => set(false)));
    api.on(window, 'keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); set(true); } });
    api.on(window, 'keyup', (e) => { if (e.code === 'Space') set(false); });
    ctx.audio.sfx('lighter');

    api.loop((dt) => {
      if (pause > 0) {
        pause -= dt;
        if (pause <= 0) { attempt++; sim = newLight(); seed = Math.random() * 6; ctx.audio.sfx('lighter'); }
        return;
      }
      const out = stepLight(sim, dt, holding, seed);
      best = Math.max(best, sim.progress);
      const { g, w, h } = view;
      g.fillStyle = '#10142c'; g.fillRect(0, 0, w, h);
      g.strokeStyle = `rgba(190,220,255,${sim.wind * 0.8})`; g.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        const y = 20 + ((i * 97) % (h - 140)), x = ((sim.t * (200 + sim.wind * 700) + i * 131) % (w + 120)) - 60;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14 - sim.wind * 60, y + 3); g.stroke();
      }
      const cx = w / 2, base = h * 0.5;
      g.fillStyle = '#c9ced8'; g.fillRect(cx - 26, base, 52, 100);
      g.fillStyle = '#e5384f'; g.fillRect(cx - 30, base + 28, 60, 90);
      const lean = sim.wind * (holding && sim.hand > 0.02 ? 10 : 60), tall = 30 + sim.flame * 90, flick = Math.sin(sim.t * 31) * 3;
      if (sim.flame > 0) {
        const glow = g.createRadialGradient(cx, base - 30, 4, cx, base - 30, 150 * sim.flame + 10);
        glow.addColorStop(0, 'rgba(255,170,60,.5)'); glow.addColorStop(1, 'rgba(255,170,60,0)');
        g.fillStyle = glow; g.fillRect(0, 0, w, h);
        for (const [color, k] of [['#ff7a1f', 1], ['#ffd23f', 0.65], ['#fff6d0', 0.32]]) {
          g.fillStyle = color; g.beginPath(); g.moveTo(cx - 24 * k, base);
          g.quadraticCurveTo(cx - 30 * k, base - tall * k * 0.6, cx + lean * k + flick, base - tall * k);
          g.quadraticCurveTo(cx + 30 * k, base - tall * k * 0.5, cx + 24 * k, base); g.fill();
        }
      }
      if (holding && sim.hand > 0.02) {
        g.fillStyle = '#ffa63d'; g.strokeStyle = '#2a1410'; g.lineWidth = 4;
        g.beginPath(); g.ellipse(cx - 66, base - 30, 30, 76, 0.25, 0, 6.283); g.fill(); g.stroke();
      }
      const meter = (y, label, v, color) => {
        g.fillStyle = '#ffffff22'; g.fillRect(24, y, w - 48, 12);
        g.fillStyle = color; g.fillRect(24, y, (w - 48) * v, 12);
        g.fillStyle = '#fff'; g.font = '700 12px Arial'; g.textAlign = 'left'; g.fillText(label, 24, y - 5);
      };
      meter(26, '🚬', sim.progress, '#ff9a2e');
      meter(62, ctx.t('game.lighter.wind'), sim.wind, '#8fd0ff');
      meter(98, ctx.t('game.lighter.hand'), sim.hand, '#2fd18a');
      hud.textContent = `${attempt}/${ATTEMPTS}`;
      if (out === 'lit') { ctx.audio.sfx('puff'); api.end(perfOf(true, attempt, 1), attempt === 1); }
      else if (out === 'out') {
        ctx.audio.sfx('bad');
        if (attempt >= ATTEMPTS) api.end(perfOf(false, attempt, best));
        else pause = 0.9;
      }
    });
  },
};
