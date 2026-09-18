/**
 * intro.js — animazione di apertura.
 *
 * Resta a schermo poco più di un secondo e NON intercetta i tocchi
 * (`pointer-events: none` nel CSS): l'app è già viva dietro.
 */
import { INTRO_LINES } from '../data/messages.js';
import { qs, prefersReducedMotion } from '../utils/dom.js';

const INTRO_MS = 1450;
const EXIT_MS = 420;

export function initIntro() {
  const intro = qs('#intro');
  const line = qs('#intro-line');
  if (!intro) return;

  if (line) {
    line.textContent = INTRO_LINES[Math.floor(Math.random() * INTRO_LINES.length)] ?? '';
  }

  const reduced = prefersReducedMotion();
  const hold = reduced ? 350 : INTRO_MS;
  const exit = reduced ? 60 : EXIT_MS;

  window.setTimeout(() => {
    intro.classList.add('intro--leaving');
    window.setTimeout(() => intro.remove(), exit);
  }, hold);
}
