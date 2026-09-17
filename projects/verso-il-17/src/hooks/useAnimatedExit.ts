import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Gestisce la smontatura di un elemento dopo la sua animazione di uscita.
 *
 * Perché non basta `AnimatePresence`: la sua uscita si considera conclusa quando
 * *tutte* le animazioni dei discendenti sono finite, comprese quelle con
 * `repeat: Infinity`. Le nostre card contengono stelline e coriandoli che girano
 * all'infinito, quindi l'albero non veniva mai rimosso e la modale restava a
 * schermo (invisibile ma presente, e capace di intercettare i tocchi).
 *
 * Qui l'uscita è deterministica: si avvia l'animazione, si aspetta una durata
 * nota e poi si smonta davvero.
 */
export function useAnimatedExit(onExited: () => void, durationMs = 240) {
  const [leaving, setLeaving] = useState(false);
  const onExitedRef = useRef(onExited);

  useEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  const requestExit = useCallback(() => setLeaving(true), []);

  /**
   * Annulla un'uscita in corso. Serve quando l'elemento viene riaperto prima che
   * la smontatura sia avvenuta: senza questo reset resterebbe invisibile.
   */
  const reset = useCallback(() => setLeaving(false), []);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => onExitedRef.current(), durationMs);
    return () => window.clearTimeout(timer);
  }, [leaving, durationMs]);

  return { leaving, requestExit, reset };
}

/** Durata dell'animazione di uscita, condivisa tra CSS e componente. */
export const EXIT_MS = 240;
