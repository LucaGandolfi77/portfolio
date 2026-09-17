import { useCallback, useEffect, useState } from 'react';
import { safeReadString, safeWriteString } from '../utils/storage';
import { usePrefersReducedMotion } from './useMediaQuery';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'verso17.theme.v1';

function readInitialTheme(): ThemeMode {
  const stored = safeReadString(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // Nessuna scelta esplicita: si segue il sistema.
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Tema chiaro/scuro.
 * - al primo avvio segue `prefers-color-scheme`;
 * - una volta che l'utente tocca il toggle, la scelta ha la precedenza ed è persistita;
 * - il tema è applicato su <html data-theme> e su `color-scheme` per i controlli nativi.
 */
export function useTheme() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<ThemeMode>(readInitialTheme);
  const [followsSystem, setFollowsSystem] = useState<boolean>(
    () => safeReadString(STORAGE_KEY) === null,
  );

  // Reagisce ai cambi di tema di sistema finché l'utente non sceglie manualmente.
  // La preferenza salvata è la fonte di verità: senza questo controllo il primo
  // cambio di sistema sovrascriverebbe una scelta appena fatta a mano.
  useEffect(() => {
    if (!followsSystem) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (safeReadString(STORAGE_KEY) !== null) return;
      setMode(mql.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [followsSystem]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', mode === 'dark' ? '#171226' : '#fdf6f0');
    }
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setFollowsSystem(false);
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      safeWriteString(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { mode, isDark: mode === 'dark', toggleTheme, prefersReducedMotion, followsSystem };
}
