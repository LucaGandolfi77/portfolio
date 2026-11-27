/* ============================================================
   Agente Zero — swipe, hold-and-release, keyboard
   ------------------------------------------------------------
   The controller only reports what the player does; whether a
   shot is allowed is decided by the game.
   ============================================================ */
import { fromSwipe, fromMeter, meterAt, swingAt } from './shot.js';

/**
 * hooks: {canShoot(), distance(), settings(), onGather(progress), onPreview(err|null),
 *         onShoot(err), onCancel()}
 */
export function createInput(el, hooks) {
  let drag = null;   // swipe in progress
  let hold = null;   // meter running
  let keyAim = 0;

  const point = (e) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp };
  };

  function startHold(source) {
    hold = { t: 0, source };
    hooks.onGather(0.6);
  }

  function releaseHold() {
    if (!hold) return;
    const h = hold;
    hold = null;
    // a quick tap is not a shot
    if (h.t < 0.18) { hooks.onCancel(); return; }
    const err = fromMeter(meterAt(h.t), h.source === 'key' ? 0 : swingAt(h.t), hooks.settings().diff);
    if (h.source === 'key') err.aim = keyAim;
    hooks.onShoot(err);
  }

  el.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || drag || hold || !hooks.canShoot()) return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* synthetic events */ }
    if (hooks.settings().control === 'hold') { startHold('pointer'); return; }
    drag = { id: e.pointerId, pts: [point(e)] };
    hooks.onGather(0);
  });

  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = point(e);
    // coming back down restarts the gesture from the lowest point
    if (p.y > drag.pts[0].y) drag.pts = [p];
    else drag.pts.push(p);
    const h = el.clientHeight;
    hooks.onGather(Math.min(1, (drag.pts[0].y - p.y) / (h * 0.18)));
    hooks.onPreview(fromSwipe(drag.pts, h, hooks.distance(), hooks.settings().diff));
  });

  const up = (e) => {
    if (hold && hold.source === 'pointer') { releaseHold(); return; }
    if (!drag || e.pointerId !== drag.id) return;
    drag.pts.push(point(e));
    const err = fromSwipe(drag.pts, el.clientHeight, hooks.distance(), hooks.settings().diff);
    drag = null;
    hooks.onPreview(null);
    if (err && hooks.canShoot()) hooks.onShoot(err);
    else hooks.onCancel();
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', () => { cancel(); hooks.onCancel(); });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest?.('button, input, select') && e.code === 'Space') return;
    if (!hooks.canShoot()) return;
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
      keyAim = Math.max(-0.14, Math.min(0.14, keyAim + (e.code === 'ArrowLeft' ? -0.007 : 0.007)));
      e.preventDefault();
    } else if (e.code === 'Space' && !e.repeat && !hold && !drag) {
      e.preventDefault();
      startHold('key');
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && hold?.source === 'key') { e.preventDefault(); releaseHold(); }
  });

  function cancel() { drag = null; hold = null; hooks.onPreview(null); }

  return {
    cancel,
    resetAim() { keyAim = 0; },
    step(dt) { if (hold) hold.t += dt; },
    /** For the on-screen meter and aim arrow. */
    meter() { return hold ? { power: meterAt(hold.t), aim: hold.source === 'key' ? keyAim : swingAt(hold.t) * 0.03 } : null; },
    keyAim: () => keyAim,
  };
}
