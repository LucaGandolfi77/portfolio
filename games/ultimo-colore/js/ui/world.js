/* ============================================================
   Ultimo Colore — walking: joystick, keys, the little HUD
   ============================================================ */
import * as F from '../world/field.js';
import { createOverworld } from '../render/overworld.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const KEYS = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
const STICK = 56;   // pixels of drag for full speed

export function createWorld(root, deps) {
  const { t, lang, getSave, onEncounter, onAuto, onAct, onMenu, persist } = deps;
  root.innerHTML = `
    <canvas class="w-canvas" tabindex="0"></canvas>
    <div class="w-goal" role="status" aria-live="polite"><small></small><strong></strong></div>
    <button type="button" class="w-mini" data-w="atlas"><canvas width="100" height="150"></canvas></button>
    <nav class="w-nav">
      <button type="button" class="btn icon" data-w="title">⌂</button>
      <button type="button" class="btn icon" data-w="party">👥</button>
      <button type="button" class="btn icon" data-w="diary">📖</button>
      <button type="button" class="btn icon" data-w="settings">⚙</button>
    </nav>
    <p class="w-toast" role="status" hidden></p>
    <div class="w-stick" hidden aria-hidden="true"><i></i></div>
    <button type="button" class="w-act btn primary" hidden></button>`;
  const canvas = root.querySelector('.w-canvas');
  const mini = root.querySelector('.w-mini canvas');
  const stick = root.querySelector('.w-stick');
  const actBtn = root.querySelector('.w-act');
  const view = createOverworld(canvas);
  let field = null, drag = null, held = new Set(), hudKey = '', saveClock = 0, miniClock = 0, toastLeft = 0, active = false;

  function labels() {
    canvas.setAttribute('aria-label', t('world.canvas'));
    root.querySelector('.w-mini').setAttribute('aria-label', t('world.atlas'));
    const names = { title: t('menu'), party: t('map.party'), diary: t('map.diary'), settings: t('settings') };
    for (const [k, v] of Object.entries(names)) root.querySelector(`[data-w="${k}"]`).setAttribute('aria-label', v);
    hudKey = '';
  }

  function input() {
    if (drag) return { x: drag.x, y: drag.y };
    let x = 0, y = 0;
    for (const k of held) { x += KEYS[k][0]; y += KEYS[k][1]; }
    return { x: Math.sign(x), y: Math.sign(y) };
  }

  function release() {
    drag = null;
    stick.hidden = true;
  }

  function hud() {
    const s = getSave();
    const goal = F.objective(s);
    const near = field.near;
    const key = [goal?.id, near?.kind, near?.id, near?.read, lang()].join('|');
    if (key === hudKey) return;
    hudKey = key;
    const box = root.querySelector('.w-goal');
    box.querySelector('small').textContent = goal ? t('world.goal') : t('world.free');
    box.querySelector('strong').textContent = goal ? goal.goal[lang()] : t('world.freeText');
    actBtn.hidden = !near;
    if (near) actBtn.innerHTML = `${esc(t(`world.act.${near.kind}`))}<small>E</small>`;
  }

  function toast(text, seconds = 3) {
    const el = root.querySelector('.w-toast');
    el.textContent = text;
    el.hidden = false;
    toastLeft = seconds;
  }

  function act() {
    if (!active || !field?.near) return false;
    const near = field.near;
    release();
    held.clear();
    onAct(near, field);
    hudKey = '';
    return true;
  }

  function step(dt, dir = input()) {
    const s = getSave();
    if (!field || !s) return null;
    const ev = F.update(s, field, dt, dir);
    saveClock += dt;
    if (saveClock > 2) { saveClock = 0; persist(); }
    if (ev) {
      release();
      held.clear();
      if (ev.type === 'encounter') onEncounter(ev.group, ev.advantage);
      else onAuto(ev.node);
    }
    return ev;
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!active || e.button > 0 || drag) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* synthetic */ }
    const r = root.getBoundingClientRect();
    drag = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: 0, y: 0 };
    stick.hidden = false;
    stick.style.left = `${e.clientX - r.left}px`;
    stick.style.top = `${e.clientY - r.top}px`;
    stick.firstElementChild.style.transform = '';
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    let dx = e.clientX - drag.ox, dy = e.clientY - drag.oy;
    const d = Math.hypot(dx, dy);
    if (d > STICK) { dx *= STICK / d; dy *= STICK / d; }
    const dead = d < 8;
    drag.x = dead ? 0 : dx / STICK;
    drag.y = dead ? 0 : dy / STICK;
    stick.firstElementChild.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, (e) => { if (drag && e.pointerId === drag.id) release(); });

  actBtn.addEventListener('click', act);
  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-w]');
    if (el && active) { release(); held.clear(); onMenu(el.dataset.w); }
  });
  window.addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => { held.clear(); release(); });

  labels();

  return {
    /** Starts walking from where the save says. */
    show(art) {
      active = true;
      held = new Set();
      release();
      view.setArt(art);
      field = F.createField(getSave());
      view.resize();
      hudKey = '';
      miniClock = 1;
      root.querySelector('.w-toast').hidden = true;
      hud();
    },
    hide() { active = false; held.clear(); release(); },
    resize: () => view.resize(),
    labels, toast, act, step,
    /** One frame: move, then draw. */
    tick(dt) {
      if (!active) return;
      step(dt);
      if (!active) return;
      this.render(dt);
    },
    render(dt = 0) {
      if (!field) return;
      const s = getSave();
      hud();
      const goal = F.objective(s);
      view.draw(field, s, goal);
      miniClock += dt;
      if (miniClock > 0.2) { miniClock = 0; view.minimap(mini, field, s, goal); }
      if (toastLeft > 0) { toastLeft -= dt; if (toastLeft <= 0) root.querySelector('.w-toast').hidden = true; }
    },
    key(e) {
      const k = e.key.toLowerCase();
      if (KEYS[k]) { held.add(k); return true; }
      if (k === 'e' || ((k === ' ' || k === 'enter') && !e.target.closest?.('button'))) return act();
      return false;
    },
    get field() { return field; },
    get active() { return active; },
  };
}
