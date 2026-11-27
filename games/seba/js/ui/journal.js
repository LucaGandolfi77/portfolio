/* ============================================================
   Seba — the Book of Nights: postcards, medals and stories
   ============================================================ */
import { el } from '../games/shell.js';
import { button } from './sheet.js';
import { cityById } from '../places/cities.js';
import { cityScene } from '../places/scenery.js';
import { sebaSVG } from '../seba/rig.js';
import { LINES } from '../seba/lines.js';
import { ACHIEVEMENTS } from '../achievements.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function wrapText(text, max = 44, lines = 2) {
  const out = [''];
  for (const word of String(text).split(/\s+/)) {
    const last = out[out.length - 1];
    if (!last) out[out.length - 1] = word;
    else if (`${last} ${word}`.length <= max) out[out.length - 1] = `${last} ${word}`;
    else out.push(word);
  }
  if (out.length > lines) { out.length = lines; out[lines - 1] += '…'; }
  return out;
}

/** A self-contained 600×500 picture of one night. */
export function postcardSVG(card, lang) {
  const c = cityById(card.city), txt = c[lang];
  const scene = cityScene(card.city, card.kind === 'after' ? 'dawn' : 'dusk')
    .replace('<svg ', '<svg x="16" y="16" width="568" height="384" ').replace('viewBox="0 0 400 700"', 'viewBox="0 250 400 270"');
  const seba = sebaSVG({ expr: card.expr, outfit: card.outfit || {}, uid: 'pc' })
    .replace('<svg ', '<svg x="196" y="172" width="208" height="226" ');
  const date = new Date(card.t).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const rave = card.kind === 'rave';
  const font = 'font-family="Bradley Hand, Segoe Print, Comic Sans MS, cursive"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500"><rect width="600" height="500" fill="#f6eeda"/>${scene}${seba}
<text x="34" y="66" font-family="Arial Black, Arial, sans-serif" font-size="34" fill="#fff" stroke="#1a1030" stroke-width="6" paint-order="stroke">${esc(txt.name.toUpperCase())}</text>
<text x="36" y="92" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="#fff" stroke="#1a1030" stroke-width="4" paint-order="stroke">${rave ? 'RAVE' : 'AFTER'} · ${esc(rave ? txt.rave : txt.after)}</text>
${wrapText(card.line || '').map((l, i) => `<text x="26" y="${434 + i * 28}" ${font} font-size="22" fill="#2b2118">${esc(l)}</text>`).join('')}
<text x="578" y="488" text-anchor="end" ${font} font-size="16" fill="#8a6a50">${esc(date)} — Seba</text></svg>`;
}

const dataURL = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

function share(card, lang) {
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas');
    cv.width = 1200; cv.height = 1000;
    cv.getContext('2d').drawImage(img, 0, 0, 1200, 1000);
    cv.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `seba-${card.city}.png`, { type: 'image/png' });
      try {
        if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Seba' }); return; }
      } catch (e) { if (e?.name === 'AbortError') return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, 'image/png');
  };
  img.src = dataURL(postcardSVG(card, lang));
}

export function storyText(s, lang, t) {
  const city = cityById(s.city || 'milano')[lang].name;
  if (s.key === 'figuraccia') {
    const pool = LINES[lang].figuraccia;
    return `${t('journal.figuraccia', { c: city })} ${pool[(s.n || 0) % pool.length]}`;
  }
  return t(`journal.${s.key}`, { c: city });
}

export function openJournal(app, tab = 'cards') {
  const { t, state: s } = app;
  const lang = app.lang();
  app.sheet.open('journal', t('journal.title'), (body) => {
    const tabs = el('div', 'tabs');
    const pane = el('div', 'pane');
    const show = (name) => {
      for (const b of tabs.children) b.setAttribute('aria-selected', b.dataset.tab === name);
      pane.innerHTML = '';
      if (name === 'cards') {
        if (!s.postcards.length) pane.appendChild(el('p', 'empty', t('journal.empty')));
        for (const card of s.postcards) {
          const fig = el('figure', 'postcard');
          const img = el('img'); img.src = dataURL(postcardSVG(card, lang)); img.alt = `${cityById(card.city)[lang].name}: ${card.line}`; img.loading = 'lazy';
          fig.append(img, button(`⤴ ${t('act.share')}`, () => share(card, lang)));
          pane.appendChild(fig);
        }
      } else if (name === 'medals') {
        pane.appendChild(el('p', 'count', `${s.achievements.length}/${ACHIEVEMENTS.length}`));
        const grid = el('div', 'medals');
        for (const a of ACHIEVEMENTS) {
          const got = s.achievements.includes(a.id);
          const m = el('div', `medal${got ? '' : ' locked'}`);
          m.append(el('span', 'ico', got ? a.icon : '❔'), el('b', '', a.name[lang]), el('small', '', got ? a.text[lang] : t('journal.locked')));
          grid.appendChild(m);
        }
        pane.appendChild(grid);
      } else {
        if (!s.stories.length) pane.appendChild(el('p', 'empty', t('journal.noStories')));
        const ul = el('ul', 'stories');
        for (const st of s.stories) {
          const li = el('li');
          li.append(el('time', '', new Date(st.t).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short' })), el('span', '', storyText(st, lang, t)));
          ul.appendChild(li);
        }
        pane.appendChild(ul);
      }
    };
    for (const [name, key] of [['cards', 'cards'], ['medals', 'medals'], ['stories', 'stories']]) {
      const b = button(t(`journal.${key}`), () => show(name), 'tab');
      b.dataset.tab = name;
      tabs.appendChild(b);
    }
    body.append(tabs, pane);
    show(tab);
  });
}
