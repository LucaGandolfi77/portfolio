import { useSyncExternalStore } from 'react';

/** Media query reattiva. Usata per reduced-motion, dark mode di sistema e breakpoint. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** true se l'utente ha chiesto meno animazioni a livello di sistema. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
