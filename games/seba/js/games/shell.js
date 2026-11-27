/* ============================================================
   Seba — the common frame of the six minigames
   ------------------------------------------------------------
   play(root, spec, ctx) opens a full-screen layer with a title,
   a HUD and a stage, and resolves with { perf, flawless } when
   the game ends, or null if the player leaves.
   ============================================================ */
export const el = (tag, cls = '', text = '') => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
};

let active = null;
export const activeGame = () => active;

export function play(root, spec, ctx) {
  return new Promise((resolve) => {
    const layer = el('div', `game game-${spec.id}`);
    layer.setAttribute('role', 'dialog');
    const head = el('header', 'game-head');
    const title = el('h2', '', ctx.t(`game.${spec.id}.name`));
    const hud = el('div', 'game-hud');
    const quit = el('button', 'game-quit', '✕');
    quit.type = 'button';
    quit.setAttribute('aria-label', ctx.t('act.quit'));
    head.append(title, hud, quit);
    const intro = el('div', 'game-intro');
    const go = el('button', 'btn primary game-go', ctx.t('act.play'));
    go.type = 'button';
    intro.append(el('p', '', ctx.t(`game.${spec.id}.help`)), go);
    const stage = el('div', 'game-stage');
    layer.append(head, stage, intro);
    root.appendChild(layer);

    let raf = 0, over = false, dispose = null;
    const timers = new Set(), cleanups = [];
    const finish = (result) => {
      if (over) return;
      over = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
      if (dispose) dispose();
      layer.remove();
      active = null;
      resolve(result);
    };
    const api = {
      stage, hud, ctx,
      end: (perf, flawless = false) => finish({ perf: Math.max(0, Math.min(1, perf)), flawless }),
      later(fn, ms) { const id = setTimeout(() => { timers.delete(id); if (!over) fn(); }, ms); timers.add(id); return id; },
      cancel(id) { clearTimeout(id); timers.delete(id); },
      on(target, type, fn, opts) { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); },
      loop(fn) {
        let last = performance.now();
        const step = (now) => {
          if (over) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          fn(dt);
          if (!over) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      /** A canvas that fills the stage, in CSS pixels. */
      canvas() {
        const cv = el('canvas', 'game-canvas');
        stage.appendChild(cv);
        const g = cv.getContext('2d');
        const view = { cv, g, w: 0, h: 0 };
        const size = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          view.w = stage.clientWidth || 360;
          view.h = stage.clientHeight || 560;
          cv.width = Math.round(view.w * dpr);
          cv.height = Math.round(view.h * dpr);
          g.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        size();
        api.on(window, 'resize', size);
        return view;
      },
    };

    quit.addEventListener('click', () => finish(null));
    api.on(window, 'keydown', (e) => { if (e.key === 'Escape') finish(null); });
    const start = () => {
      if (!intro.isConnected) return;
      intro.remove();
      ctx.audio.unlock();
      dispose = spec.start(api) || null;
    };
    go.addEventListener('click', start);
    active = { id: spec.id, start, finish: (perf = 1, flawless = false) => api.end(perf, flawless), quit: () => finish(null) };
    go.focus({ preventScroll: true });
  });
}
