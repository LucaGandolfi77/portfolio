import { motion, useReducedMotion } from 'framer-motion';
import { Feather, Heart, RotateCcw, Smile, Sparkles as SparklesIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FALLBACK_RITUAL, MESSAGE_TYPE_LABEL, findMessage, type MessageType } from '../data/messages';
import { formatDayFull, type CalendarDay } from '../utils/dates';
import { Sparkles as SparkleField } from './Sparkles';
import { EXIT_MS, useAnimatedExit } from '../hooks/useAnimatedExit';

interface MessageModalProps {
  /** La casella da mostrare, o null quando la modale è chiusa. */
  day: CalendarDay | null;
  /** true se questa casella era già stata letta in passato. */
  isAlreadyRead: boolean;
  /** Numero totale di caselle del calendario: serve a riconoscere vigilia e finale. */
  totalDays: number;
  onClose: () => void;
  /** Al termine della lettura: marca la casella come aperta. */
  onRead: (day: CalendarDay) => void;
}

const TYPE_ICON: Record<MessageType, typeof Heart> = {
  motivation: SparklesIcon,
  poem: Feather,
  thought: Heart,
  funny: Smile,
};

/** Il micro-rituale dura pochi secondi, poi lascia spazio al messaggio. */
const RITUAL_MS = 3400;

/**
 * Giornate che meritano sempre il micro-rituale, anche se la casella era già
 * stata aperta: la vigilia e il gran finale (e la loro "coda" di un giorno).
 * Sono gli ultimi tre giorni del calendario, qualunque sia la sua lunghezza.
 */
function isSpecialDay(index: number, total: number): boolean {
  return index >= total - 2;
}

/** Il rituale da mostrare: quello scritto apposta, altrimenti quello di riserva. */
function ritualFor(day: CalendarDay, isAlreadyRead: boolean, total: number): string | null {
  // Le caselle già lette non si ripetono, tranne negli ultimi giorni (vigilia e finale),
  // dove il rituale fa parte del momento.
  if (isAlreadyRead && !isSpecialDay(day.index, total)) return null;
  return findMessage(day.index, total)?.ritual ?? FALLBACK_RITUAL;
}

/**
 * La card centrale con il messaggio del giorno.
 *
 * Sequenza di apertura:
 *  1. il fondale si scurisce e sfoca;
 *  2. la card entra con una leggera rotazione 3D e un lampo di luce;
 *  3. alla primissima apertura di quella casella compare il micro-rituale;
 *  4. il testo appare riga per riga, con un ritardo morbido.
 *
 * Il rituale può essere rivisto in qualsiasi momento dal pulsante in fondo.
 */
export function MessageModal({ day, isAlreadyRead, totalDays, onClose, onRead }: MessageModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [stage, setStage] = useState<'ritual' | 'message'>('message');
  const [wordsVisible, setWordsVisible] = useState(false);
  const [ritualText, setRitualText] = useState<string>(FALLBACK_RITUAL);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  /** Se questa apertura è la prima in assoluto per la casella. */
  const showRitualOnEnter = useRef(false);

  /**
   * `onClose` e `onRead` arrivano dal genitore: le teniamo in ref aggiornate.
   *
   * È importante: l'app si ri-renderizza ogni secondo per il countdown, quindi un
   * callback inline cambierebbe identità in continuazione. Se l'effetto di focus
   * (che registra anche il tasto Esc) dipendesse da loro, verrebbe smontato e
   * rimontato ogni secondo, e il listener di tastiera non sarebbe affidabile.
   */
  const onCloseRef = useRef(onClose);
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onCloseRef.current = onClose;
    onReadRef.current = onRead;
  }, [onClose, onRead]);

  /**
   * "Già letta" e il totale delle caselle vengono fotografati UNA volta per apertura,
   * non letti a ogni render.
   *
   * È importante: pochi istanti dopo l'apertura la casella viene marcata come letta,
   * quindi `isAlreadyRead` passa da false a true. Se l'effetto di reset dipendesse da
   * quel valore, si riavvierebbe subito e il micro-rituale non finirebbe mai.
   *
   * Devono stare PRIMA del calcolo del messaggio: `findMessage` ha bisogno del totale.
   */
  const alreadyReadSnapshot = useRef(isAlreadyRead);
  const totalDaysSnapshot = useRef(totalDays);
  const wasOpen = useRef(false);
  if (day && !wasOpen.current) {
    // Prima render con questa casella aperta: congela i valori di ingresso.
    alreadyReadSnapshot.current = isAlreadyRead;
    totalDaysSnapshot.current = totalDays;
    wasOpen.current = true;
  }
  if (!day && wasOpen.current) {
    wasOpen.current = false;
  }

  const message = useMemo(
    () => (day ? findMessage(day.index, totalDaysSnapshot.current) : undefined),
    [day],
  );

  /**
   * L'uscita è gestita da noi (vedi useAnimatedExit): dentro la card ci sono
   * stelline animate all'infinito, e con AnimatePresence l'albero non verrebbe
   * mai rimosso.
   */
  const { leaving, requestExit, reset } = useAnimatedExit(() => onCloseRef.current());
  // Ogni nuova casella apre una modale pulita, mai gia in uscita.
  useEffect(() => {
    if (day) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.key, reset]);

  // Reset dello stato a ogni apertura + decisione sul rituale.
  useEffect(() => {
    if (!day) return;
    const ritual = ritualFor(day, alreadyReadSnapshot.current, totalDaysSnapshot.current);
    setRitualText(ritual ?? FALLBACK_RITUAL);
    showRitualOnEnter.current = Boolean(ritual);
    setWordsVisible(false);
    setStage(ritual ? 'ritual' : 'message');

    if (!ritual) return;
    const timer = window.setTimeout(() => setStage('message'), RITUAL_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.key]);

  // Il messaggio viene marcato come letto non appena appare: l'utente lo ha visto.
  useEffect(() => {
    if (day && stage === 'message') onReadRef.current(day);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.key, stage]);

  useEffect(() => {
    if (stage !== 'message') return;
    // Piccola pausa: il testo arriva dopo la card, non insieme.
    const timer = window.setTimeout(() => setWordsVisible(true), prefersReducedMotion ? 0 : 420);
    return () => window.clearTimeout(timer);
  }, [stage, prefersReducedMotion]);

  // Focus, blocco dello scroll e chiusura con Esc.
  useEffect(() => {
    if (!day) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add('is-locked');

    const timer = window.setTimeout(() => closeRef.current?.focus(), 260);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestExit();
        return;
      }
      if (event.key !== 'Tab') return;
      // Focus trap semplice e robusto.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('is-locked');
      window.clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.key]);

  const words = message?.message.split('\n') ?? [];
  const TypeIcon = message ? TYPE_ICON[message.type] : SparklesIcon;

  return (
    <>
      {day && message && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: leaving ? EXIT_MS / 1000 : 0.28 }}
          role="presentation"
          onClick={(event) => {
            // Solo il velo chiude: la card ferma la propagazione.
            if (event.target === event.currentTarget) requestExit();
          }}
        >
          <motion.div
            className="modal__backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={
              leaving
                ? { opacity: 0, backdropFilter: 'blur(0px)' }
                : { opacity: 1, backdropFilter: 'blur(7px)' }
            }
            transition={{ duration: leaving ? EXIT_MS / 1000 : 0.34 }}
            aria-hidden="true"
            onClick={requestExit}
          />

          <motion.div
            ref={dialogRef}
            className="modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-body"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.82, rotateX: -16, y: 34 }
            }
            animate={
              leaving
                ? prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.92, y: 16 }
                : { opacity: 1, scale: 1, rotateX: 0, y: 0 }
            }
            transition={
              leaving
                ? { duration: EXIT_MS / 1000, ease: 'easeIn' }
                : { type: 'spring', stiffness: 240, damping: 24, mass: 0.9 }
            }
            style={{ transformPerspective: 1100 }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Lampo di luce all'apertura */}
            {!prefersReducedMotion && (
              <motion.span
                className="modal__flash"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 0.85, 0], scale: [0.4, 1.5, 1.9] }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            )}
            <SparkleField count={12} seed={day.index * 5 + 1} variant="local" className="modal__sparkles" />

            <button
              ref={closeRef}
              type="button"
              className="modal__close"
              onClick={requestExit}
              aria-label="Chiudi il messaggio"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {/*
              Il passaggio rituale -> messaggio è volutamente SENZA AnimatePresence:
              qui dentro un exit-animation che non si completa terrebbe bloccata la
              scena. Il cambio è quindi immediato e affidabile, e le due scene
              entrano con la propria animazione di ingresso.
            */}
            {stage === 'ritual' ? (
              <motion.div
                className="ritual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.span
                  className="ritual__ring"
                  aria-hidden="true"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { scale: [0.85, 1.12, 0.85], opacity: [0.5, 0.95, 0.5] }
                  }
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <p className="ritual__text">{ritualText}</p>
                <span className="ritual__hint">respira…</span>
              </motion.div>
            ) : (
              <motion.div
                className="modal__content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                  <div className="modal__meta">
                    <span className="modal__chip">
                      <TypeIcon size={13} aria-hidden="true" />
                      {MESSAGE_TYPE_LABEL[message.type]}
                    </span>
                    <span className="modal__date">
                      casella {String(day.index).padStart(2, '0')} · {formatDayFull(day)}
                    </span>
                  </div>

                  <h3 className="modal__title" id="modal-title">
                    {message.title}
                  </h3>

                  <div className={`modal__body ${wordsVisible ? 'is-visible' : ''}`} id="modal-body">
                    {words.map((line, lineIndex) => (
                      <p
                        key={`${line}-${lineIndex}`}
                        className="modal__line"
                        style={{ animationDelay: prefersReducedMotion ? '0ms' : `${lineIndex * 160}ms` }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="modal__emoji" aria-hidden="true">
                    <motion.span
                      animate={prefersReducedMotion ? undefined : { y: [0, -6, 0], rotate: [0, 6, 0] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {message.emoji ?? '✨'}
                    </motion.span>
                  </div>

                  <div className="modal__actions">
                    <motion.button
                      type="button"
                      className="btn btn--primary"
                      onClick={requestExit}
                      whileTap={{ scale: 0.95 }}
                    >
                      Chiudi
                    </motion.button>
                    <motion.button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setStage('ritual')}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw size={15} aria-hidden="true" />
                      {showRitualOnEnter.current ? 'Rivedi il rituale' : 'Il rituale'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
