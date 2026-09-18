import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { DayCard, resolveCardState } from './DayCard';
import { getUnlockedCount, type CalendarDay } from '../utils/dates';

interface CalendarGridProps {
  days: CalendarDay[];
  openedKeys: string[];
  now: Date;
  hasHiddenStar: (dayIndex: number) => boolean;
  onOpen: (day: CalendarDay) => void;
  onLocked: (day: CalendarDay) => void;
  onHiddenStar: (day: CalendarDay) => void;
}

/**
 * Il calendario: 30 caselle che si aprono una al giorno.
 *
 * Non è una griglia rigida tipo calendario mensile, ma una collezione di
 * piccoli medaglioni che scendono lungo una traiettoria: la linea tratteggiata
 * dietro le card ricorda la curva lasciata dalle ruote sulla pista.
 */
export function CalendarGrid({
  days,
  openedKeys,
  now,
  hasHiddenStar,
  onOpen,
  onLocked,
  onHiddenStar,
}: CalendarGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const unlockedCount = getUnlockedCount(days, now);
  const readCount = openedKeys.length;
  const progress = Math.min(100, Math.round((readCount / days.length) * 100));

  return (
    <section className="calendar" aria-labelledby="calendar-title">
      <div className="calendar__intro">
        <h2 className="calendar__title" id="calendar-title">
          <CalendarDays size={17} aria-hidden="true" />
          Le tue caselle
        </h2>
        <p className="calendar__subtitle">
          Una al giorno, come si deve. Le caselle future restano lì a fare compagnia.
        </p>

        <div className="progress" role="group" aria-label="Progresso del diario">
          <div className="progress__bar">
            <motion.span
              className="progress__fill"
              initial={prefersReducedMotion ? { width: `${progress}%` } : { width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            />
          </div>
          <span className="progress__label">
            <strong>{readCount}</strong> di {days.length} lette
            {unlockedCount > readCount && (
              <em className="progress__left"> · {unlockedCount - readCount} da recuperare</em>
            )}
          </span>
        </div>
      </div>

      <div className="calendar__track" aria-hidden="true">
        <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="calendar__track-svg">
          <path
            d="M50 0 C 82 90, 18 170, 50 260 S 82 430, 50 520 S 18 690, 50 780 S 70 920, 50 1000"
            fill="none"
            stroke="var(--gold-soft)"
            strokeWidth={0.5}
            strokeDasharray="2 5"
            strokeLinecap="round"
            opacity={0.55}
          />
        </svg>
      </div>

      <div className="calendar__grid">
        {days.map((day, i) => (
          <DayCard
            key={day.key}
            day={day}
            order={i}
            totalDays={days.length}
            state={resolveCardState(day, openedKeys.includes(day.key), now)}
            hasHiddenStar={hasHiddenStar(day.index)}
            hiddenStarFound={openedKeys.includes(day.key)}
            onOpen={onOpen}
            onLocked={onLocked}
            onHiddenStar={onHiddenStar}
          />
        ))}
      </div>

      <p className="calendar__legend">
        <span className="calendar__legend-dot calendar__legend-dot--locked" aria-hidden="true" />
        da scoprire
        <span className="calendar__legend-dot calendar__legend-dot--today" aria-hidden="true" />
        oggi
        <span className="calendar__legend-dot calendar__legend-dot--opened" aria-hidden="true" />
        letta
      </p>
    </section>
  );
}
