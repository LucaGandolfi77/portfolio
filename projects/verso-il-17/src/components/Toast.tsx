import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';
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
 * L'uscita è gestita internamente (useAnimatedExit) invece che con
 * AnimatePresence, così la smontatura è sempre garantita.
 */
export function Toast({ message, onDismiss, duration = 2600 }: ToastProps) {
  const prefersReducedMotion = useReducedMotion();
  const { leaving, requestExit } = useAnimatedExit(onDismiss, EXIT_MS);

  useEffect(() => {
    if (!message) return;
    // Un messaggio nuovo fa ripartire il conto alla rovescia.
    const timer = window.setTimeout(requestExit, duration);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, duration]);

  return (
    <div className="toast-host" role="status" aria-live="polite">
      {message && (
        <motion.div
          className="toast"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.94 }}
          animate={
            leaving
              ? { opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: 0.97 }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={
            leaving
              ? { duration: EXIT_MS / 1000, ease: 'easeIn' }
              : { type: 'spring', stiffness: 340, damping: 28 }
          }
          onClick={requestExit}
        >
          <Sparkles size={15} aria-hidden="true" />
          <span>{message}</span>
        </motion.div>
      )}
    </div>
  );
}
