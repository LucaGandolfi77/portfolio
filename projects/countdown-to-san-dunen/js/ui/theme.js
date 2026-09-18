/**
 * theme.js — tema chiaro/scuro.
 *
 * Al primo avvio segue `prefers-color-scheme`; appena l'utente tocca il pulsante
 * la scelta ha la precedenza ed è ricordata. Il tema è applicato su <html data-theme>.
 */
import { qs } from '../utils/dom.js';
import { readString, writeString } from '../utils/storage.js';

const STORAGE_KEY = 'sd.theme.v1';

const ICON_MOON =
  '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />';
const ICON_SUN =
  '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />';

export function createTheme() {
  const button = qs('#theme-btn');
  const icon = qs('#theme-icon');
  const followsSystem = readString(STORAGE_KEY) === null;

  const apply = (mode) => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    const meta = qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#171226' : '#fdf6f0');
    if (icon) icon.innerHTML = mode === 'dark' ? ICON_SUN : ICON_MOON;
    button?.setAttribute('aria-label', mode === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema notte');
  };

  const current = () => document.documentElement.dataset.theme || 'light';

  // Segue il sistema finché l'utente non sceglie a mano.
  if (followsSystem) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      if (readString(STORAGE_KEY) !== null) return;
      apply(mql.matches ? 'dark' : 'light');
    });
  }

  button?.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    writeString(STORAGE_KEY, next);
    apply(next);
  });

  apply(current());

  return { isDark: () => current() === 'dark' };
}
