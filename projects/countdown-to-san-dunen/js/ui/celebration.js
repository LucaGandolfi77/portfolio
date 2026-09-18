/**
 * celebration.js — il gran finale del 17 ottobre.
 *
 * Coriandoli, stelle e cuori che scendono: pochi nodi, animati solo con
 * `transform` e `opacity` (nessun canvas), e completamente disattivati quando
 * l'utente ha chiesto meno animazioni.
 */
import { EVENT_YEAR, FESTA, FINALE_COPY, SANTO, TEAM } from '../data/event.js';
import { qs, prefersReducedMotion, tricolore } from '../utils/dom.js';
import { ICONS } from './icons.js';

const EXIT_MS = 240;
const COLORS = ['var(--wine)', 'var(--amber)', 'var(--gold-soft)', 'var(--cream)', 'var(--wine-deep)'];

export function createCelebration({ TRICOLORE, onOpenChange }) {
  const root = qs('#celebration-root');
  let node = null;
  let onKeyDown = null;

  function close() {
    if (!node) return;
    const current = node;
    node = null;
    current.classList.add('celebration--leaving');
    document.removeEventListener('keydown', onKeyDown);
    document.body.classList.remove('is-locked');
    onOpenChange?.(false);
    window.setTimeout(() => current.remove(), EXIT_MS);
  }

  function open({ readCount, totalCount }) {
    if (node) return;

    onKeyDown = (event) => {
      if (event.key === 'Escape') close();
    };

    node = document.createElement('div');
    node.className = 'celebration';
    node.setAttribute('role', 'dialog');
    node.setAttribute('aria-modal', 'true');
    node.setAttribute('aria-labelledby', 'celebration-title');

    const confetti = prefersReducedMotion()
      ? ''
      : Array.from({ length: 34 }, (_, i) => {
          const rand = (seed) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          const kind = i % 4;
          const size = 10 + rand(i + 101) * 14;
          const left = rand(i + 1) * 100;
          const delay = rand(i + 21) * 2.4;
          const duration = 4.5 + rand(i + 41) * 3.5;
          const drift = (rand(i + 61) - 0.5) * 90;
          const rotate = 180 + rand(i + 81) * 540;
          const color = COLORS[i % COLORS.length];
          const char = kind === 2 ? '★' : kind === 3 ? '♥' : '';
          return `<span class="confetti confetti--${kind}" style="left:${left}%;width:${size}px;height:${
            kind === 1 ? size : size * 0.42
          }px;background:${kind === 2 ? 'transparent' : color};color:${color};font-size:${size}px;--d:${delay}s;--t:${duration}s;--x:${drift}px;--r:${rotate}deg">${char}</span>`;
        }).join('');

    node.innerHTML = `
      <span class="celebration__wash" aria-hidden="true"></span>
      ${confetti ? `<div class="celebration__fall" aria-hidden="true">${confetti}</div>` : ''}
      <div class="celebration__card">
        <span class="celebration__burst" aria-hidden="true"></span>
        <div class="celebration__icons" aria-hidden="true">
          <span>${ICONS.party()}</span>
          <span>${ICONS.star(30)}</span>
          <span>${ICONS.heart(26)}</span>
        </div>
        <p class="celebration__eyebrow">${ICONS.sparkles(14)}${FINALE_COPY.eyebrow}${ICONS.sparkles(14)}</p>
        <h2 class="celebration__title" id="celebration-title">${FINALE_COPY.date}</h2>
        <div class="celebration__lines">
          ${FINALE_COPY.lines.map((line) => `<p>${line}</p>`).join('')}
        </div>
        <p class="celebration__event"><span><strong>${FINALE_COPY.event}</strong> · ${FINALE_COPY.place} ${EVENT_YEAR}</span></p>
        <p class="celebration__team">
          <strong>${FINALE_COPY.team}</strong>
          <span class="celebration__country">rappresenta l’${TEAM.country}</span>
        </p>
        <p class="celebration__cta">${FINALE_COPY.cta}</p>
        <div class="celebration__stats">
          <span><strong>${readCount}</strong> caselle lette</span>
          <span aria-hidden="true">·</span>
          <span>su <strong>${totalCount}</strong></span>
        </div>
        <button type="button" class="btn btn--primary btn--wide" data-close>${ICONS.close(16)} Chiudi e vai a pattinare</button>
      </div>
    `;

    // La bandierina va inserita come elemento (ha tre strisce)
    const eventLine = node.querySelector('.celebration__event');
    eventLine.prepend(tricolore(TRICOLORE));

    node.querySelector('.celebration__tricolore-placeholder')?.remove();
    const stripe = tricolore(TRICOLORE, 'stripe');
    stripe.classList.add('celebration__tricolore');
    node.prepend(stripe);

    node.querySelector('[data-close]').addEventListener('click', close);

    root.append(node);
    document.body.classList.add('is-locked');
    document.addEventListener('keydown', onKeyDown);
    onOpenChange?.(true);

    requestAnimationFrame(() => node?.classList.add('is-open'));
  }

  return { open, close, isOpen: () => Boolean(node) };
}
