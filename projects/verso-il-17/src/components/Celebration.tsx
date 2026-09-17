import { motion, useReducedMotion } from 'framer-motion';
import { Heart, PartyPopper, Sparkles as SparklesIcon, Star, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { EVENT_YEAR, FINALE_COPY, TEAM } from '../data/event';
import { EXIT_MS, useAnimatedExit } from '../hooks/useAnimatedExit';
import { Tricolore } from './Tricolore';

interface CelebrationProps {
  open: boolean;
  onClose: () => void;
  /** Numero di caselle lette, mostrato come piccola statistica affettuosa. */
  readCount: number;
  totalCount: number;
}

const CONFETTI_COLORS = [
  'var(--ribbon)',
  'var(--gold-soft)',
  'var(--lavender)',
  'var(--ice)',
  'var(--blush-deep)',
];

/**
 * Il gran finale del 17 ottobre.
 *
 * Coriandoli, stelle e cuori che salgono: tutti animati con `transform` e
 * `opacity` su pochi nodi (nessun canvas), e completamente disattivati quando
 * l'utente ha chiesto meno animazioni.
 */
export function Celebration({ open, onClose, readCount, totalCount }: CelebrationProps) {
  const prefersReducedMotion = useReducedMotion();
  // Uscita gestita da noi: i coriandoli girano all'infinito e bloccherebbero
  // per sempre l'unmount di AnimatePresence.
  const { leaving, requestExit } = useAnimatedExit(onClose, EXIT_MS);

  const pieces = useMemo(() => {
    const rand = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 34 }, (_, i) => {
      const kind = i % 4;
      return {
        id: i,
        left: rand(i + 1) * 100,
        delay: rand(i + 21) * 2.4,
        duration: 4.5 + rand(i + 41) * 3.5,
        drift: (rand(i + 61) - 0.5) * 90,
        rotate: 180 + rand(i + 81) * 540,
        size: 10 + rand(i + 101) * 14,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? 'var(--gold-soft)',
        kind,
      };
    });
  }, []);

  // Blocca lo scroll mentre la celebrazione è a schermo.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('is-locked');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestExit();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {open && (
        <motion.div
          className="celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: leaving ? EXIT_MS / 1000 : 0.5 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="celebration-title"
        >
          <span className="celebration__wash" aria-hidden="true" />
          <Tricolore variant="stripe" className="celebration__tricolore" />

          {!prefersReducedMotion && !leaving && (
            <div className="celebration__fall" aria-hidden="true">
              {pieces.map((piece) => (
                <motion.span
                  key={piece.id}
                  className={`confetti confetti--${piece.kind}`}
                  style={{
                    left: `${piece.left}%`,
                    width: piece.size,
                    height: piece.kind === 1 ? piece.size : piece.size * 0.42,
                    background: piece.kind === 2 ? 'transparent' : piece.color,
                    color: piece.color,
                    fontSize: piece.size,
                  }}
                  initial={{ y: '-12vh', opacity: 0, rotate: 0 }}
                  animate={{ y: '108vh', opacity: [0, 1, 1, 0.9], rotate: piece.rotate, x: piece.drift }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  {piece.kind === 2 ? '★' : piece.kind === 3 ? '♥' : ''}
                </motion.span>
              ))}
            </div>
          )}

          <motion.div
            className="celebration__card"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 26 }}
            animate={
              leaving
                ? { opacity: 0, scale: 0.95, y: 12 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={
              leaving
                ? { duration: EXIT_MS / 1000, ease: 'easeIn' }
                : { type: 'spring', stiffness: 210, damping: 22 }
            }
          >
            <motion.span
              className="celebration__burst"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.9, 0], scale: [0.3, 1.6, 2.2] }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
            />

            <div className="celebration__icons" aria-hidden="true">
              <motion.span
                animate={prefersReducedMotion ? undefined : { rotate: [0, -12, 12, 0], y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <PartyPopper size={26} />
              </motion.span>
              <motion.span
                animate={prefersReducedMotion ? undefined : { scale: [1, 1.18, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Star size={30} />
              </motion.span>
              <motion.span
                animate={prefersReducedMotion ? undefined : { rotate: [0, 12, -12, 0], y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                <Heart size={26} />
              </motion.span>
            </div>

            <p className="celebration__eyebrow">
              <SparklesIcon size={14} aria-hidden="true" />
              {FINALE_COPY.eyebrow}
              <SparklesIcon size={14} aria-hidden="true" />
            </p>
            <h2 className="celebration__title" id="celebration-title">
              {FINALE_COPY.date}
            </h2>

            <div className="celebration__lines">
              {FINALE_COPY.lines.map((line, i) => (
                <motion.p
                  key={line}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 + i * 0.25, ease: 'easeOut' }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <p className="celebration__event">
              <Tricolore />
              <span>
                <strong>{FINALE_COPY.event}</strong> · {FINALE_COPY.place} {EVENT_YEAR}
              </span>
            </p>

            <p className="celebration__team">
              <strong>{FINALE_COPY.team}</strong>
              <span className="celebration__country">rappresenta l’{TEAM.country}</span>
            </p>

            <p className="celebration__cta">{FINALE_COPY.cta}</p>

            <div className="celebration__stats">
              <span>
                <strong>{readCount}</strong> caselle lette
              </span>
              <span aria-hidden="true">·</span>
              <span>
                su <strong>{totalCount}</strong>
              </span>
            </div>

            <motion.button
              type="button"
              className="btn btn--primary btn--wide"
              onClick={requestExit}
              whileTap={{ scale: 0.96 }}
            >
              <X size={16} aria-hidden="true" />
              Chiudi e vai a pattinare
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
