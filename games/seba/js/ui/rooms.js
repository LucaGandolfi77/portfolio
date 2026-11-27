/* ============================================================
   Seba — the rooms: background, big actions and the item tray
   ------------------------------------------------------------
   Away from home the counter tab becomes the city, and the
   other rooms play the part of the hostel.
   ============================================================ */
import { el } from '../games/shell.js';
import { button } from './sheet.js';
import { barScene, kitchenScene, bathScene, sofaScene, balconyScene, cityScene } from '../places/scenery.js';
import { cityById } from '../places/cities.js';
import { itemFor, isPassedOut } from '../state.js';

export const ROOMS = ['bar', 'kitchen', 'bath', 'sofa', 'balcony'];
export const ROOM_ICON = { bar: '🍸', kitchen: '🍳', bath: '🚿', sofa: '🛋️', balcony: '🌇', world: '🌍', journal: '📔' };

const TRAY = {
  bar: ['acqua', 'birra', 'spritz', 'negroni', 'shot'],
  city: ['local', 'acqua', 'birra', 'shot', 'kebab'],
  kitchen: ['frutta', 'cornetto', 'toast', 'pasta', 'kebab', 'acqua', 'caffe'],
  bath: ['deo'],
  sofa: ['acqua', 'caffe', 'cornetto'],
  balcony: ['menta', 'sigaretta', 'sigaro', 'acqua'],
};

export const isAway = (s) => s.city !== 'milano';

export function sceneFor(room, s, now) {
  if (room === 'bar') return isAway(s) ? cityScene(s.city, s.trip?.stage === 'arrived' ? 'dusk' : 'dawn') : barScene();
  if (room === 'kitchen') return kitchenScene();
  if (room === 'bath') return bathScene();
  if (room === 'sofa') return sofaScene(s.asleep);
  return balconyScene(s.city, new Date(now).getHours());
}

export function actionsFor(room, app) {
  const { t, state: s } = app;
  const out = [];
  const add = (key, icon, fn, primary = false) => {
    const b = button(`${icon} ${t(`act.${key}`)}`, fn, primary ? 'btn primary' : 'btn');
    b.dataset.act = key;
    out.push(b);
  };
  if (s.asleep) {
    add(isPassedOut(s, Date.now()) ? 'bucket' : 'wake', isPassedOut(s, Date.now()) ? '🪣' : '⏰', () => app.toggleSleep(), true);
    return out;
  }
  if (room === 'bar') {
    if (isAway(s)) {
      if (s.trip.stage === 'arrived') add('rave', '🔊', () => app.rave(), true);
      if (s.trip.stage === 'raved') add('after', '🌅', () => app.after(), true);
      add('home', '✈️', () => app.flyHome(), s.trip.stage === 'done');
    } else {
      add('shift', '🍸', () => app.game('shift'), true);
      if (s.trip?.stage === 'raved') add('after', '🌅', () => app.after(), true);
      else add('rave', '🔊', () => app.rave());
      add('dj', '🎛️', () => app.game('dj'));
    }
  }
  if (room === 'bath') { add('scrub', '🧽', () => app.scrub(18)); add('mirror', '🪞', () => app.wardrobe(), true); }
  if (room === 'sofa') { add('sleep', '🌙', () => app.toggleSleep(), true); add('quiz', '🙈', () => app.game('quiz')); add('stories', '💬', () => app.tellStory()); }
  if (room === 'balcony') add('lighter', '🔥', () => app.game('lighter'), true);
  return out;
}

export function trayFor(room, app) {
  const { t, state: s } = app;
  if (s.asleep) return [];
  const list = room === 'bar' && isAway(s) ? TRAY.city : TRAY[room] || [];
  return list.map((id) => {
    const it = itemFor(s, id);
    const name = id === 'local' ? cityById(s.city)[app.lang()].drink : t(`item.${id}`);
    const b = el('button', 'item' + (s.tips < it.price ? ' poor' : ''));
    b.type = 'button';
    b.dataset.item = id;
    b.append(el('span', 'ico', it.icon), el('span', 'name', name), el('span', 'price', it.price ? `${it.price} €` : t('free')));
    draggable(b, it.icon, app, () => app.consume(id));
    return b;
  });
}

/* Tap to use, or drag the thing to Seba's mouth. */
function draggable(btn, icon, app, use) {
  let start = null, ghost = null, dragged = false;
  const stop = () => { start = null; ghost?.remove(); ghost = null; };
  btn.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; dragged = false; });
  btn.addEventListener('pointermove', (e) => {
    if (!start) return;
    if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) {
      ghost = el('div', 'ghost', icon);
      document.body.appendChild(ghost);
      btn.setPointerCapture?.(e.pointerId);
      dragged = true;
    }
    if (ghost) ghost.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  btn.addEventListener('pointerup', (e) => {
    if (ghost && app.overSeba(e.clientX, e.clientY)) use();
    stop();
  });
  btn.addEventListener('pointercancel', stop);
  btn.addEventListener('click', () => { if (dragged) { dragged = false; return; } use(); });
}
