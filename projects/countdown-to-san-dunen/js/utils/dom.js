/**
 * dom.js — piccoli aiutanti per lavorare con il DOM.
 *
 * Nessun framework: solo funzioni di comodo, così il codice dell'interfaccia
 * resta leggibile senza dipendenze.
 */

/** Scorciatoia per querySelector. */
export function qs(selector, root = document) {
  return root.querySelector(selector);
}

/** Scorciatoia per querySelectorAll, che restituisce un array normale. */
export function qsa(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/** Crea un elemento con attributi e figli. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('data-') || key === 'role' || key.startsWith('aria-')) {
      node.setAttribute(key, String(value));
    } else if (key in node) node[key] = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Sostituisce il contenuto di un elemento. */
export function render(target, content) {
  if (!target) return;
  target.replaceChildren(
    ...[].concat(content).filter((c) => c !== null && c !== undefined && c !== false),
  );
}

export function on(target, event, handler, options) {
  target?.addEventListener(event, handler, options);
}

/**
 * Generatore pseudo-casuale deterministico.
 * Serve a posizionare le stelline decorative sempre negli stessi punti.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** true se l'utente ha chiesto meno animazioni a livello di sistema. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Esegue `callback` quando l'utente riduce le animazioni (e a ogni cambio). */
export function onReducedMotionChange(callback) {
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/** Costruisce una bandierina tricolore (o una striscia, con `stripe`). */
export function tricolore(colors, variant = 'chip') {
  const node = el('span', {
    class: `tricolore tricolore--${variant}`,
    role: variant === 'chip' ? 'img' : null,
    'aria-label': variant === 'chip' ? 'Bandiera italiana' : null,
    'aria-hidden': variant === 'chip' ? null : 'true',
  });
  for (const color of colors) {
    node.append(el('span', { style: `background:${color}` }));
  }
  return node;
}
