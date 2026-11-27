/* Seba — the one bottom sheet used by every panel */
import { el } from '../games/shell.js';

export function createSheet(root, closeLabel) {
  const layer = root.querySelector('#sheet');
  const panel = layer.querySelector('.sheet-panel');
  const title = layer.querySelector('h2');
  const body = layer.querySelector('.sheet-body');
  const x = layer.querySelector('.sheet-close');
  let onClose = null, opener = null;

  function close() {
    if (layer.hidden) return;
    layer.hidden = true;
    body.innerHTML = '';
    const fn = onClose; onClose = null;
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    if (fn) fn();
  }
  x.addEventListener('click', close);
  layer.addEventListener('click', (e) => { if (e.target === layer) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  return {
    open(kind, heading, build, done = null) {
      close();
      opener = document.activeElement;
      layer.dataset.kind = kind;
      title.textContent = heading;
      x.setAttribute('aria-label', closeLabel());
      onClose = done;
      layer.hidden = false;
      build(body);
      panel.scrollTop = 0;
      x.focus({ preventScroll: true });
    },
    close,
    get kind() { return layer.hidden ? null : layer.dataset.kind; },
    body,
  };
}

export const button = (label, fn, cls = 'btn') => {
  const b = el('button', cls, label);
  b.type = 'button';
  b.addEventListener('click', fn);
  return b;
};
