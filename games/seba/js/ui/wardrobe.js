/* Seba — the wardrobe panel: try, buy, wear */
import { el } from '../games/shell.js';
import { button } from './sheet.js';
import { WARDROBE, SLOTS, COLORS } from '../wardrobe.js';
import { sebaSVG } from '../seba/rig.js';
import { buy, wear, levelOf } from '../state.js';

export function openWardrobe(app, done) {
  const { t, state: s } = app;
  const lang = app.lang();
  let slot = 'hat';
  app.sheet.open('wardrobe', t('wardrobe.title'), (body) => {
    const preview = el('div', 'preview');
    const money = el('p', 'money');
    const tabs = el('div', 'tabs');
    const grid = el('div', 'clothes');
    const draw = () => {
      preview.innerHTML = sebaSVG({ expr: 'happy', outfit: s.outfit, uid: 'wd' });
      money.textContent = `${t('hud.tips')}: ${s.tips} €`;
      for (const b of tabs.children) b.setAttribute('aria-selected', b.dataset.slot === slot);
      grid.innerHTML = '';
      for (const w of WARDROBE.filter((x) => x.slot === slot)) {
        const owned = s.owned.includes(w.id), worn = s.outfit[w.slot] === w.id, locked = !owned && levelOf(s.xp) < w.level;
        const note = worn ? `✔ ${t('wardrobe.worn')}` : owned ? t('wardrobe.wear') : locked ? `🔒 ${t('world.locked', { n: w.level })}` : t('wardrobe.buy', { n: w.price });
        const b = button('', () => {
          if (!owned) {
            const r = buy(s, w.id);
            if (!r.ok) { app.toast(t(`reason.${r.reason}`, { n: w.level })); app.audio.sfx('bad'); return; }
            app.audio.sfx('coin');
          }
          wear(s, w.id);
          if (s.outfit[w.slot]) app.speak('outfit', 'hype');
          app.changed();
          draw();
        }, `cloth${worn ? ' worn' : ''}${locked ? ' locked' : ''}`);
        b.dataset.id = w.id;
        const dot = el('i'); dot.style.background = COLORS[w.color].hex;
        b.append(dot, el('b', '', w.name[lang]), el('span', '', note));
        grid.appendChild(b);
      }
    };
    for (const name of SLOTS) {
      const b = button(t(`wardrobe.slot.${name}`), () => { slot = name; draw(); }, 'tab');
      b.dataset.slot = name;
      tabs.appendChild(b);
    }
    body.append(preview, money, tabs, grid);
    draw();
  }, done);
}
