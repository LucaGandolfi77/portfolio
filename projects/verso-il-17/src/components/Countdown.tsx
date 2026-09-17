import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarHeart, Sparkles as SparklesIcon } from 'lucide-react';
import { EVENT, TEAM } from '../data/event';
import type { CountdownParts } from '../utils/dates';
import { formatDayFull, type CalendarDay } from '../utils/dates';
import { Tricolore } from './Tricolore';

interface CountdownProps {
  parts: CountdownParts;
  /** La casella di oggi, se siamo dentro la finestra del calendario. */
  today?: CalendarDay | undefined;
  /** Il diario è archiviato (il 17 ottobre di quest'anno è passato). */
  isArchived: boolean;
  nextTargetLabel: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** Blocco numerico animato: la cifra cambia con un flip verticale corto. */
function TimeUnit({ value, label }: { value: string; label: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="timeunit">
      <div className="timeunit__value">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={prefersReducedMotion ? false : { y: '-0.7em', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { y: '0.7em', opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className="timeunit__digits"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="timeunit__label">{label}</span>
    </div>
  );
}

/**
 * Il countdown live verso il 17 ottobre.
 *
 * Il numero di giorni è grande e protagonista; sotto, ore/minuti/secondi
 * scorrono in tempo reale. Il giorno del gran finale il blocco lascia il posto
 * a un messaggio celebrativo.
 */
export function Countdown({ parts, today, isArchived, nextTargetLabel }: CountdownProps) {
  const prefersReducedMotion = useReducedMotion();
  const arrived = parts.isTargetDay;

  if (arrived) {
    return (
      <motion.section
        className="countdown countdown--arrived"
        aria-live="polite"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <motion.div
          className="countdown__badge"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.04, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SparklesIcon size={16} aria-hidden="true" />
          <span>È arrivato il giorno</span>
          <SparklesIcon size={16} aria-hidden="true" />
        </motion.div>
        <p className="countdown__arrived-date">17 ottobre</p>
        <p className="countdown__arrived-event">
          <Tricolore /> <strong>{EVENT.name}</strong> · {EVENT.place}
        </p>
        <p className="countdown__arrived-sub">
          {TEAM.name} rappresenta l’Italia. Oggi si pattina. ✨
        </p>
      </motion.section>
    );
  }

  return (
    <section className="countdown" aria-live="off" aria-label={`Countdown verso il 17 ottobre, ${EVENT.name} in ${EVENT.place}`}>
      <div className="countdown__eyebrow">
        {isArchived ? 'Il diario è completo' : 'Mancano ancora'}
      </div>

      {isArchived ? (
        <>
          <p className="countdown__archived">Il 17 ottobre è passato.</p>
          <p className="countdown__archived-sub">
            Il prossimo appuntamento è il <strong>{nextTargetLabel}</strong>.
          </p>
        </>
      ) : (
        <>
          <div className="countdown__days">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={parts.days}
                className="countdown__days-number"
                initial={prefersReducedMotion ? false : { opacity: 0, y: -18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 18, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {parts.days}
              </motion.span>
            </AnimatePresence>
            <span className="countdown__days-label">
              {parts.days === 1 ? 'giorno' : 'giorni'}
            </span>
          </div>

          <p className="countdown__event">
            <Tricolore />
            <span>
              {EVENT.name} · {EVENT.place}
            </span>
          </p>

          <div className="countdown__clock" role="timer">
            <TimeUnit value={pad(parts.hours)} label="ore" />
            <span className="countdown__colon" aria-hidden="true">
              :
            </span>
            <TimeUnit value={pad(parts.minutes)} label="min" />
            <span className="countdown__colon" aria-hidden="true">
              :
            </span>
            <TimeUnit value={pad(parts.seconds)} label="sec" />
          </div>
        </>
      )}

      {today && (
        <p className="countdown__today">
          <CalendarHeart size={15} aria-hidden="true" />
          <span>
            Oggi ti aspetta la casella <strong>{String(today.index).padStart(2, '0')}</strong> ·{' '}
            {formatDayFull(today)}
          </span>
        </p>
      )}
    </section>
  );
}
