/* ============================================================
   Seba — the counter shift: build the drinks, in order, shake
   ============================================================ */
import { el } from './shell.js';

export const INGREDIENTS = {
  ghiaccio: { icon: '🧊', color: '#bfe8ff', it: 'Ghiaccio', en: 'Ice' },
  rosso: { icon: '🔴', color: '#e5384f', it: 'Amaro Rosso', en: 'Red Bitter' },
  nebbia: { icon: '⚪', color: '#dfe8f4', it: 'Gin Nebbia', en: 'Fog Gin' },
  arancia: { icon: '🍊', color: '#ff9a2e', it: 'Arancia', en: 'Orange' },
  bolle: { icon: '🫧', color: '#8fe0d0', it: 'Bollicine', en: 'Bubbles' },
  limone: { icon: '🍋', color: '#ffe14d', it: 'Limone', en: 'Lemon' },
  menta: { icon: '🌿', color: '#4fd16f', it: 'Menta', en: 'Mint' },
  zucchero: { icon: '🍬', color: '#ffd0e8', it: 'Zucchero', en: 'Sugar' },
  caffe: { icon: '🫘', color: '#7a4a2a', it: 'Caffè', en: 'Coffee' },
};

const R = (id, level, it, en, parts) => ({ id, level, name: { it, en }, parts });
export const RECIPES = [
  R('spritz', 1, 'Spritz Atomico', 'Atomic Spritz', ['ghiaccio', 'rosso', 'bolle']),
  R('limonata', 1, 'Limonata Offesa', 'Offended Lemonade', ['limone', 'zucchero', 'bolle']),
  R('nebbiolino', 1, 'Nebbia Tonica', 'Foggy Tonic', ['ghiaccio', 'nebbia', 'bolle']),
  R('sbagliatissimo', 2, 'Sbagliatissimo', 'Very Wrong One', ['ghiaccio', 'nebbia', 'rosso', 'arancia']),
  R('mentuccia', 2, 'Mentuccia', 'Minty Thing', ['menta', 'zucchero', 'ghiaccio', 'bolle']),
  R('alba', 3, 'Alba di Gratosoglio', 'Suburb Sunrise', ['ghiaccio', 'arancia', 'nebbia', 'rosso']),
  R('espresso', 3, 'Espresso Impazzito', 'Mad Espresso', ['caffe', 'nebbia', 'zucchero', 'ghiaccio']),
  R('naviglio', 4, 'Naviglio Verde', 'Green Canal', ['menta', 'limone', 'nebbia', 'ghiaccio', 'bolle']),
  R('after', 5, 'After delle Sette', 'Seven A.M.', ['caffe', 'arancia', 'zucchero', 'ghiaccio', 'bolle']),
  R('leggenda', 6, 'La Leggenda di Seba', 'Seba’s Legend', ['ghiaccio', 'nebbia', 'rosso', 'limone', 'menta', 'bolle']),
];

export const CUSTOMERS = ['🧑‍🎤', '👵', '🧔', '👩‍🎨', '🕴️', '👨‍🍳', '🧕', '👴', '🧑‍🚀', '🦸'];
export const ORDERS = 5;
export const PATIENCE = 20;

export const recipesFor = (level) => RECIPES.filter((r) => r.level <= level);
export const isPrefix = (recipe, made) => made.every((p, i) => recipe.parts[i] === p);
export const isDone = (recipe, made) => made.length === recipe.parts.length && isPrefix(recipe, made);
/** One order: 0 if failed, otherwise 0.7 for a correct drink plus up to 0.3 for speed. */
export const orderScore = (correct, timeLeft, mistakes) =>
  (correct ? Math.max(0.3, 0.7 + 0.3 * Math.max(0, timeLeft / PATIENCE) - 0.1 * mistakes) : 0);

export const shiftGame = {
  id: 'shift',
  start(api) {
    const { stage, hud, ctx } = api;
    const lang = ctx.lang();
    const pool = recipesFor(ctx.level);
    const wrap = el('div', 'shift');
    const guest = el('div', 'shift-guest');
    const ticket = el('div', 'shift-ticket');
    const patience = el('div', 'bar'); const pFill = el('i'); patience.append(pFill);
    const glass = el('div', 'shift-glass');
    const row = el('div', 'shift-actions');
    const shake = el('button', 'btn primary', ctx.t('game.shift.shake')); shake.type = 'button'; shake.dataset.shake = '';
    const trash = el('button', 'btn', ctx.t('game.shift.trash')); trash.type = 'button';
    row.append(trash, shake);
    const bottles = el('div', 'shift-bottles');
    const used = new Set(pool.flatMap((r) => r.parts));
    for (const [key, ing] of Object.entries(INGREDIENTS)) {
      if (!used.has(key)) continue;
      const b = el('button', 'bottle'); b.type = 'button'; b.dataset.ing = key;
      b.style.setProperty('--c', ing.color);
      b.append(el('span', 'ico', ing.icon), el('span', '', ing[lang]));
      b.addEventListener('click', () => add(key));
      bottles.appendChild(b);
    }
    wrap.append(guest, ticket, patience, glass, row, bottles);
    stage.appendChild(wrap);

    let n = 0, recipe = null, made = [], left = PATIENCE, mistakes = 0, total = 0, perfect = true, locked = false, shakes = 0, last = null;

    function next() {
      if (n >= ORDERS) { api.end(total / ORDERS, perfect); return; }
      n++;
      do { recipe = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && recipe.id === last);
      last = recipe.id;
      made = []; left = PATIENCE; mistakes = 0; locked = false; shakes = 0;
      guest.textContent = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
      hud.textContent = `${n}/${ORDERS}`;
      draw();
    }
    function draw(message = '') {
      ticket.innerHTML = '';
      ticket.append(el('b', '', message || recipe.name[lang]));
      const ol = el('ol');
      recipe.parts.forEach((p, i) => {
        const li = el('li', i < made.length ? 'ok' : i === made.length ? 'next' : '', `${INGREDIENTS[p].icon} ${INGREDIENTS[p][lang]}`);
        li.dataset.part = p;
        ol.appendChild(li);
      });
      ticket.appendChild(ol);
      glass.innerHTML = '';
      made.forEach((p) => { const layer = el('i'); layer.style.background = INGREDIENTS[p].color; layer.style.height = `${100 / recipe.parts.length}%`; glass.appendChild(layer); });
      shake.disabled = !isDone(recipe, made);
      shake.textContent = ctx.t('game.shift.shake') + (shakes ? ` ${'•'.repeat(shakes)}` : '');
    }
    function add(key) {
      if (locked || made.length >= recipe.parts.length) return;
      if (recipe.parts[made.length] !== key) {
        mistakes++; perfect = false; left -= 2.5;
        ctx.audio.sfx('bad');
        ticket.classList.remove('wrong'); void ticket.offsetWidth; ticket.classList.add('wrong');
        return;
      }
      made.push(key);
      ctx.audio.sfx('note', made.length * 2);
      draw();
    }
    trash.addEventListener('click', () => { if (!locked) { made = []; shakes = 0; draw(); } });
    shake.addEventListener('click', () => {
      if (locked || !isDone(recipe, made)) return;
      ctx.audio.sfx('shake');
      glass.classList.remove('shaking'); void glass.offsetWidth; glass.classList.add('shaking');
      if (++shakes < 3) { draw(); return; }
      locked = true;
      total += orderScore(true, left, mistakes);
      ctx.audio.sfx('coin');
      draw('✔ ' + recipe.name[lang]);
      api.later(next, 700);
    });
    api.loop((dt) => {
      if (locked) return;
      left -= dt;
      pFill.style.width = `${Math.max(0, (left / PATIENCE) * 100)}%`;
      if (left <= 0) {
        locked = true; perfect = false;
        ctx.audio.sfx('bad');
        guest.textContent = '😤';
        api.later(next, 800);
      }
    });
    next();
  },
};
