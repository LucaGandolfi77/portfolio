import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Feather,
  Heart,
  Lock,
  Music2,
  Smile,
  Sparkle,
  Sparkles as SparklesIcon,
  Star,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { EVENT, TEAM } from '../data/event';
import { MESSAGE_TYPE_LABEL, messages, type MessageType } from '../data/messages';
import { getDayStatus, type CalendarDay, type DayStatus } from '../utils/dates';

export type CardState = DayStatus | 'opened';

interface DayCardProps {
  day: CalendarDay;
  state: CardState;
  /** true se in questa casella è nascosta una stellina easter egg. */
  hasHiddenStar: boolean;
  hiddenStarFound: boolean;
  /** Referenza per portare il focus sulla card quando si apre la modale. */
  buttonRef?: (el: HTMLButtonElement | null) => void;
  onOpen: (day: CalendarDay) => void;
  onLocked: (day: CalendarDay) => void;
  onHiddenStar: (day: CalendarDay) => void;
  /** Indice progressivo usato per lo stagger dell'ingresso. */
  order: number;
}

const TYPE_ICON: Record<MessageType, typeof Heart> = {
  motivation: SparklesIcon,
  poem: Feather,
  thought: Heart,
  funny: Smile,
};

function messageFor(day: CalendarDay) {
  return messages.find((m) => m.day === day.index);
}

function ariaLabelFor(day: CalendarDay, state: CardState): string {
  if (day.isFinale) {
    return `Casella finale, ${day.dayOfMonth} ${day.monthLongLabel}: ${EVENT.name} in ${EVENT.place}, ${TEAM.name} rappresenta l’Italia${
      state === 'locked' ? ', ancora chiusa' : state === 'opened' ? ', già letta' : ', aprila'
    }`;
  }
  if (state === 'locked') {
    return `Casella ${day.index}, ${day.dayOfMonth} ${day.monthLongLabel}: ancora chiusa, si apre quel giorno`;
  }
  if (state === 'opened') {
    return `Casella ${day.index}, ${day.dayOfMonth} ${day.monthLongLabel}: già letta, aprila di nuovo`;
  }
  if (state === 'today') {
    return `Casella di oggi, ${day.index}, ${day.dayOfMonth} ${day.monthLongLabel}: aprila`;
  }
  return `Casella ${day.index}, ${day.dayOfMonth} ${day.monthLongLabel}: non letta, aprila`;
}

/**
 * Una singola casella del calendario.
 *
 * Quattro stati visivi ben distinti:
 *  - `locked`  misteriosa, sigillata, con effetto vetro smerigliato;
 *  - `today`   protagonista: glow, shimmer, pulsazione delicata;
 *  - `past`    disponibile ma non ancora letta (il diario è recuperabile);
 *  - `opened`  luminosa, con la stellina e la scritta "Letta".
 */
export function DayCard({
  day,
  state,
  hasHiddenStar,
  hiddenStarFound,
  buttonRef,
  onOpen,
  onLocked,
  onHiddenStar,
  order,
}: DayCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const shakeRef = useRef<HTMLButtonElement | null>(null);
  const message = messageFor(day);
  const TypeIcon = message ? TYPE_ICON[message.type] : SparklesIcon;
  const isToday = state === 'today';
  const isLocked = state === 'locked';
  const isOpened = state === 'opened';

  // Scuote la card quando è bloccata: feedback immediato e simpatico.
  // Lo stato di "shake" è gestito dal genitore tramite la classe, qui aggiungiamo
  // solo una piccola animazione imperativa per non ri-renderizzare il calendario.
  useEffect(() => {
    if (!isLocked) return;
    const el = shakeRef.current;
    if (!el) return;
    const onPointerDown = () => {
      if (prefersReducedMotion) return;
      el.animate(
        [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-4px) rotate(-1.2deg)' },
          { transform: 'translateX(4px) rotate(1.2deg)' },
          { transform: 'translateX(-2px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 380, easing: 'ease-in-out' },
      );
    };
    el.addEventListener('pointerdown', onPointerDown);
    return () => el.removeEventListener('pointerdown', onPointerDown);
  }, [isLocked, prefersReducedMotion]);

  const handleActivate = () => {
    if (isLocked) onLocked(day);
    else onOpen(day);
  };

  const setRef = (el: HTMLButtonElement | null) => {
    shakeRef.current = el;
    buttonRef?.(el);
  };

  const cardClasses = [
    'daycard',
    `daycard--${state}`,
    day.isFinale ? 'daycard--finale' : '',
    day.isVigilia ? 'daycard--vigilia' : '',
    hasHiddenStar && hiddenStarFound ? 'daycard--starmarked' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      className="daycard-wrap"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.5,
        delay: Math.min(order * 0.035, 0.5),
        ease: [0.22, 0.61, 0.36, 1],
      }}
    >
      <motion.button
        ref={setRef}
        type="button"
        className={cardClasses}
        onClick={handleActivate}
        aria-label={ariaLabelFor(day, state)}
        aria-disabled={isLocked}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.955 }}
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      >
        {/* alone della casella di oggi */}
        {isToday && <span className="daycard__halo" aria-hidden="true" />}

        <span className="daycard__head">
          <span className="daycard__seal" aria-hidden="true">
            {isLocked ? (
              <Lock size={12} />
            ) : isOpened ? (
              <Star size={12} strokeWidth={2.4} />
            ) : (
              <TypeIcon size={12} />
            )}
          </span>
          {isToday && !day.isFinale && <span className="daycard__today-tag">oggi</span>}
          {day.isFinale && (
            <span className="daycard__today-tag daycard__today-tag--finale">mondiale</span>
          )}
        </span>

        <span className="daycard__number" aria-hidden="true">
          {String(day.dayOfMonth).padStart(2, '0')}
        </span>
        <span className="daycard__month" aria-hidden="true">
          {day.monthLabel}
        </span>

        {day.isFinale && (
          <span className="daycard__event" aria-hidden="true">
            {EVENT.name}
          </span>
        )}

        <span className="daycard__footer">
          {isLocked ? (
            <span className="daycard__hint">shhh…</span>
          ) : isOpened ? (
            <span className="daycard__hint daycard__hint--done">
              <Check size={12} strokeWidth={3} aria-hidden="true" /> Letta
            </span>
          ) : (
            <span className="daycard__hint daycard__hint--open">
              <Music2 size={12} aria-hidden="true" /> Apri
            </span>
          )}
        </span>

        {isToday && !prefersReducedMotion && <span className="daycard__shimmer" aria-hidden="true" />}
      </motion.button>

      {/*
        La stellina nascosta è un bottone a sé, FUORI dal bottone-casella:
        niente elementi interattivi annidati (sarebbe invalido per l'accessibilità),
        e un tocco sulla stellina non fa scattare anche l'apertura della casella.
      */}
      {hasHiddenStar && !hiddenStarFound && (
        <button
          type="button"
          className="daycard__hiddenstar"
          aria-label={`Stellina nascosta nella casella ${day.index}: trovala`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onHiddenStar(day);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
          }}
        >
          <Sparkle size={13} aria-hidden="true" />
        </button>
      )}

      {hasHiddenStar && hiddenStarFound && (
        <span className="daycard__found" aria-hidden="true">
          <Sparkle size={12} />
        </span>
      )}

      <span className="daycard-wrap__label" aria-hidden="true">
        {isLocked ? 'da scoprire' : message ? MESSAGE_TYPE_LABEL[message.type] : ''}
      </span>
    </motion.div>
  );
}

/** Calcola, in modo stabile, quali caselle nascondono una stellina. */
export function pickHiddenStarDays(total: number): number[] {
  // Distribuzione fissa: 3 stelline nascoste, sempre nelle stesse posizioni.
  return [7, 16, 24].filter((n) => n >= 1 && n <= total);
}

/** Stato della casella a partire dalla data e dallo storico aperture. */
export function resolveCardState(day: CalendarDay, opened: boolean, now: Date): CardState {
  if (opened) return 'opened';
  return getDayStatus(day, now);
}
