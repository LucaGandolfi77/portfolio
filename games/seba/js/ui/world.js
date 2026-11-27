/* ============================================================
   Seba — the postcard map and the card of each city
   ============================================================ */
import { el } from '../games/shell.js';
import { button } from './sheet.js';
import { CITIES, cityById } from '../places/cities.js';
import { cityScene } from '../places/scenery.js';
import { canFly, levelOf, nightBonus } from '../state.js';

/* Very rough coastlines as [lon, lat]: a drawing, not an atlas. */
const LAND = [
  [[-168, 66], [-140, 70], [-95, 72], [-60, 60], [-52, 47], [-75, 35], [-81, 25], [-97, 27], [-87, 15], [-78, 8], [-105, 20], [-123, 38], [-130, 55], [-165, 55]],
  [[-80, 8], [-60, 11], [-35, -6], [-40, -22], [-58, -38], [-68, -55], [-75, -45], [-70, -18], [-81, -4]],
  [[-17, 21], [-6, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -15], [27, -34], [18, -34], [12, -17], [8, 4], [-8, 5]],
  [[-10, 36], [-9, 44], [-1, 46], [-5, 48], [3, 51], [8, 54], [5, 62], [20, 70], [60, 69], [105, 77], [170, 68], [180, 65], [160, 60], [142, 52], [130, 42], [122, 30], [108, 20], [105, 9], [99, 8], [95, 17], [88, 22], [78, 8], [72, 20], [57, 25], [45, 13], [35, 28], [36, 36], [27, 37], [24, 40], [19, 40], [13, 45], [16, 39], [8, 44], [-2, 37]],
  [[-6, 50], [1, 51], [-2, 56], [-6, 58], [-4, 52]],
  [[-24, 65], [-18, 66.5], [-13, 65], [-19, 63.4]],
  [[114, -22], [131, -12], [142, -11], [153, -28], [146, -39], [130, -32], [115, -34]],
  [[130, 31], [136, 35], [142, 40], [141, 45], [138, 37], [132, 34]],
];
const px = (lon) => (lon + 180) * 2;
const py = (lat) => (84 - lat) * 2.2;

function mapSVG(app) {
  const s = app.state;
  const land = LAND.map((p) => `<path d="M${p.map(([a, b]) => `${px(a).toFixed(0)} ${py(b).toFixed(0)}`).join('L')}Z" fill="#6fbf8a" stroke="#2f6a58" stroke-width="2" stroke-linejoin="round"/>`).join('');
  const here = cityById(s.city);
  const pins = CITIES.map((c) => {
    const open = levelOf(s.xp) >= c.level;
    const color = c.id === s.city ? '#ff3f81' : s.visited.includes(c.id) ? '#ffe14d' : open ? '#fff' : '#5a6a7a';
    return `<g class="pin" data-city="${c.id}"><circle cx="${px(c.lon)}" cy="${py(c.lat)}" r="13" fill="transparent"/><circle cx="${px(c.lon)}" cy="${py(c.lat)}" r="${c.id === s.city ? 7 : 4.5}" fill="${color}" stroke="#1a1030" stroke-width="2"/></g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 10 660 290" role="img" aria-label="${app.t('world.title')}"><rect x="40" y="10" width="660" height="290" rx="16" fill="#1d4a73"/>${land}<circle cx="${px(here.lon)}" cy="${py(here.lat)}" r="16" fill="none" stroke="#ff3f81" stroke-width="2.5" class="pulse"/>${pins}</svg>`;
}

export function openCity(app, id) {
  const { t, state: s } = app;
  const c = cityById(id), txt = c[app.lang()];
  app.sheet.open('city', txt.name, (body) => {
    const pic = el('img', 'city-pic');
    pic.alt = '';
    pic.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cityScene(id));
    body.append(pic, el('p', 'city-hello', `“${txt.hello}”`));
    const ul = el('ul', 'city-facts');
    for (const [key, v] of [['drink', { d: txt.drink }], ['raveAt', { r: txt.rave }], ['afterAt', { a: txt.after }]]) ul.appendChild(el('li', '', t(`world.${key}`, v)));
    body.appendChild(ul);
    if (nightBonus(Date.now()) > 1) body.appendChild(el('p', 'night', t('world.night')));
    if (s.city === id) {
      body.appendChild(button(t('act.ok'), () => { app.sheet.close(); app.go('bar'); }, 'btn primary'));
      return;
    }
    const can = canFly(s, id, Date.now());
    body.appendChild(el('p', 'city-price', id === 'milano' ? t('world.home') : t('world.price', { n: c.price })));
    const fly = button(`✈️ ${t(id === 'milano' ? 'act.home' : 'act.fly')}`, () => app.fly(id), 'btn primary');
    fly.dataset.act = 'fly';
    if (!can.ok) { fly.disabled = true; body.appendChild(el('p', 'why', t(`reason.${can.reason}`, { n: c.level }))); }
    body.appendChild(fly);
  });
}

export function openWorld(app) {
  const { t, state: s } = app;
  app.sheet.open('world', t('world.title'), (body) => {
    const map = el('div', 'map');
    map.innerHTML = mapSVG(app);
    map.addEventListener('click', (e) => { const pin = e.target.closest('.pin'); if (pin) openCity(app, pin.dataset.city); });
    body.appendChild(map);
    const list = el('div', 'cities');
    for (const c of CITIES) {
      const open = levelOf(s.xp) >= c.level;
      const note = c.id === s.city ? t('world.here') : !open ? `🔒 ${t('world.locked', { n: c.level })}` : c.id === 'milano' ? t('free') : `${c.price} €${s.visited.includes(c.id) ? ' · ✔' : ''}`;
      const b = button('', () => openCity(app, c.id), `city${open ? '' : ' locked'}${c.id === s.city ? ' here' : ''}`);
      b.dataset.city = c.id;
      b.style.background = `linear-gradient(135deg, ${c.sky[0]}, ${c.sky[1]})`;
      b.append(el('b', '', c[app.lang()].name), el('span', '', note));
      list.appendChild(b);
    }
    body.appendChild(list);
  });
}
