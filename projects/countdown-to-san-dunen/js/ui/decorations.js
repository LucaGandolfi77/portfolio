/**
 * decorations.js — stelline decorative e posizionamento del fondale.
 *
 * Le posizioni nascono da un generatore pseudo-casuale con seme fisso: sono
 * sempre le stesse, così il fondale non "salta" a ogni caricamento.
 */
import { mulberry32, qs } from '../utils/dom.js';

const GLITTER_CHARS = ['✦', '✧', '·', '✩', '˚'];

function fill(container, count, seed, variant) {
  const rand = mulberry32(seed * 9973 + count);
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    const size = 6 + rand() * (variant === 'glitter' ? 16 : 11);
    const opacity = 0.18 + rand() * (variant === 'glitter' ? 0.6 : 0.4);
    const duration = 3.4 + rand() * 4;

    star.className = 'sparkle';
    star.textContent = GLITTER_CHARS[Math.floor(rand() * GLITTER_CHARS.length)];
    star.style.left = `${rand() * 100}%`;
    star.style.top = `${rand() * 100}%`;
    star.style.fontSize = `${size}px`;
    star.style.setProperty('--star-opacity', String(opacity));
    star.style.setProperty('--star-delay', `${rand() * 6}s`);
    star.style.setProperty('--star-duration', `${duration}s`);
    frag.append(star);
  }

  container.replaceChildren(frag);
}

/** Riempie tutti i contenitori marcati con data-sparkles. */
export function initDecorations() {
  for (const container of document.querySelectorAll('[data-sparkles]')) {
    const count = Number(container.dataset.sparkles) || 12;
    const seed = Number(container.dataset.seed) || 7;
    const variant = container.classList.contains('sparkles--glitter') ? 'glitter' : 'screen';
    fill(container, count, seed, variant);
  }
}

/** Stelline extra della modalità glitter (easter egg). */
export function mountGlitter() {
  const host = document.createElement('div');
  host.className = 'sparkles sparkles--glitter';
  qs('.app')?.append(host);
  fill(host, 26, 97, 'glitter');
  return host;
}
