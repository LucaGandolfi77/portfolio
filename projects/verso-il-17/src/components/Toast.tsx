import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EXIT_MS, useAnimatedExit } from '../hooks/useAnimatedExit';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  /** Millisecondi di permanenza. */
  duration?: number;
}

/**
 * Messaggio temporaneo in fondo allo schermo: usato per le caselle bloccate
 * e per gli easter egg. È una live region, quindi anche VoiceOver lo annuncia.
 *
 * Due scelte importanti, entrambe nate da bug reali:
 *
 * 1. L'entrata è un'animazione CSS, non di Framer Motion. Con Framer il toast
 *    restava bloccato sullo stato iniziale (`opacity: 0`) e non si vedeva mai:
 *    il messaggio esisteva nel DOM, ma era invisibile. Qui il toast è leggibile
 *    di default e l'animazione è solo un abbellimento: se non parte, si legge.
 *
 * 2. `leaving` viene azzerato quando arriva un messaggio nuovo. Prima non lo era,
 *    quindi dopo il primo toast tutti gli altri nascevano già "in uscita", cioè
 *    invisibili.
 */
export function Toast({ message, onDismiss, duration = 2600 }: ToastProps) {
  const { leaving, requestExit, reset } = useAnimatedExit(onDismiss, EXIT_MS);

  // Un messaggio nuovo riparte da capo. L'aggiornamento avviene durante il render
  // (pattern React per lo stato derivato da una prop): così non c'è nessun frame
  // in cui il toast appare già in uscita.
  const [shownMessage, setShownMessage] = useState(message);
  if (message !== shownMessage) {
    setShownMessage(message);
    reset();
  }

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(requestExit, duration);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, duration]);

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {message && (
        <div className={`toast ${leaving ? 'toast--leaving' : ''}`} onClick={requestExit}>
          <Sparkles size={15} aria-hidden="true" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
