/**
 * dates.ts — tutta la logica temporale dell'app.
 *
 * Regole chiave:
 *  - La data finale è il 17 ottobre (ora locale del dispositivo).
 *  - Se il 17 ottobre di quest'anno è già passato, il countdown punta al 17 ottobre dell'anno prossimo.
 *  - Il calendario è composto da 30 caselle: i 29 giorni che precedono il gran giorno + il 17 ottobre.
 */

export const TARGET_MONTH = 9; // ottobre (0-indexed)
export const TARGET_DAY = 17;
/** Lunghezza "classica" del calendario: 29 giorni di attesa + il gran giorno. */
export const CALENDAR_LENGTH = 30;
/**
 * Tetto massimo di caselle. Serve solo a chi apre il diario molto in anticipo:
 * la finestra si allunga un po' invece di lasciare una giornata senza casella.
 * In pratica vale 30 (percorso classico) oppure 31 (apertura il 17 settembre).
 */
export const MAX_CALENDAR_LENGTH = 31;

/** Tipo di dato "solo giorno": nessuna ora, nessun fuso, nessuna ambiguità. */
export interface DayStamp {
  year: number;
  month: number; // 0-indexed
  day: number;
}

export interface CalendarDay extends DayStamp {
  /** 1-based: posizione della casella nel calendario. */
  index: number;
  /** Numero del giorno nel mese (1..31). */
  dayOfMonth: number;
  /** Nome del mese abbreviato in italiano, es. "set". */
  monthLabel: string;
  /** Nome esteso del mese in italiano, es. "settembre". */
  monthLongLabel: string;
  /** Stringa stabile usata come chiave e per localStorage: "2026-09-18". */
  key: string;
  /** Mezzanotte locale di quel giorno. */
  startOfDay: Date;
  /** Mezzanotte locale del giorno successivo (fine esclusiva). */
  endOfDay: Date;
  /** È il gran finale (17 ottobre)? */
  isFinale: boolean;
  /** È il giorno immediatamente precedente al gran finale? */
  isVigilia: boolean;
}

const MONTHS_SHORT = [
  'gen',
  'feb',
  'mar',
  'apr',
  'mag',
  'giu',
  'lug',
  'ago',
  'set',
  'ott',
  'nov',
  'dic',
];

const MONTHS_LONG = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
];

/** Mezzanotte locale di una data. Usa il costruttore locale: nessun bug da UTC. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/** Aggiunge n giorni "da calendario" restando a mezzanotte locale (gestisce l'ora legale). */
export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 0, 0, 0, 0);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Chiave stabile e ordinabile: "2026-09-18". */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Il prossimo 17 ottobre rispetto alla data passata.
 * Se oggi *è* il 17 ottobre, restituisce oggi (non l'anno prossimo).
 */
export function getTargetDate(from: Date = new Date()): Date {
  const today = startOfDay(from);
  const thisYear = new Date(today.getFullYear(), TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
  if (today.getTime() <= thisYear.getTime()) return thisYear;
  return new Date(today.getFullYear() + 1, TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
}

/**
 * Il 17 ottobre "di riferimento" per la finestra del calendario:
 * il gran giorno di quest'anno se non è ancora passato, altrimenti quello appena trascorso.
 * È diverso da `getTargetDate`, che invece guarda sempre avanti (serve al countdown).
 */
export function getReferenceTarget(from: Date = new Date()): Date {
  return new Date(from.getFullYear(), TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
}

/** true se il 17 ottobre di quest'anno è già passato (il diario è "archiviato"). */
export function isPastTarget(now: Date = new Date()): boolean {
  return startOfDay(now).getTime() > getReferenceTarget(now).getTime();
}

/**
 * Finestra del calendario.
 *
 * La regola d'oro: l'ultima casella è SEMPRE il 17 ottobre e la casella di oggi
 * deve essere sempre apribile. Per questo la finestra è centrata sull'oggi:
 *
 *  - da 30 giorni prima del gran giorno in poi -> 30 caselle, che finiscono il 17 ottobre
 *    (il percorso "classico": 29 giorni di attesa + il finale);
 *  - se si apre il diario ancora prima -> la finestra si allunga di poco (max 31 caselle)
 *    così nessuna giornata resta senza la sua casella;
 *  - dopo il 17 ottobre -> resta visibile la finestra appena conclusa, così il diario
 *    si può rileggere con calma.
 */
export function getCalendarWindow(now: Date = new Date()): { start: Date; end: Date } {
  const target = getReferenceTarget(now);
  const today = startOfDay(now);
  const end = target; // l'ultima casella è sempre il gran giorno
  const classicStart = addDays(end, -(CALENDAR_LENGTH - 1));
  // Se oggi precede l'inizio "classico" si parte da oggi, senza superare il tetto massimo.
  const start =
    today.getTime() < classicStart.getTime() ? addDays(target, -(MAX_CALENDAR_LENGTH - 1)) : classicStart;
  return { start, end };
}

/** Le caselle del calendario, in ordine cronologico. */
export function getCalendarDays(now: Date = new Date()): CalendarDay[] {
  const { start, end } = getCalendarWindow(now);
  const target = getReferenceTarget(now);
  const total = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const days: CalendarDay[] = [];

  for (let i = 0; i < total; i += 1) {
    const date = addDays(start, i);
    const isFinale = sameDay(date, target);
    days.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      index: i + 1,
      dayOfMonth: date.getDate(),
      monthLabel: MONTHS_SHORT[date.getMonth()] ?? '',
      monthLongLabel: MONTHS_LONG[date.getMonth()] ?? '',
      key: dayKey(date),
      startOfDay: date,
      endOfDay: addDays(date, 1),
      isFinale,
      isVigilia: i === total - 2,
    });
  }

  return days;
}

export type DayStatus = 'locked' | 'today' | 'past';

export function getDayStatus(day: CalendarDay, now: Date = new Date()): DayStatus {
  const t = startOfDay(now).getTime();
  if (t < day.startOfDay.getTime()) return 'locked';
  if (t >= day.endOfDay.getTime()) return 'past';
  return 'today';
}

/** La casella di oggi, se siamo dentro la finestra del calendario. */
export function findToday(now: Date = new Date()): CalendarDay | undefined {
  return getCalendarDays(now).find((d) => getDayStatus(d, now) === 'today');
}

export interface CountdownParts {
  /** Giorni interi rimanenti. 0 quando mancano meno di 24h. */
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Millisecondi totali mancanti (0 se il momento è arrivato). */
  totalMs: number;
  /** true dal 17 ottobre in poi. */
  isTargetDay: boolean;
  /** true se il 17 ottobre è già passato. */
  isAfterTarget: boolean;
}

/** Scompone la distanza tra `now` e il 17 ottobre in giorni/ore/minuti/secondi. */
export function getCountdownParts(now: Date = new Date(), target: Date = getTargetDate(now)): CountdownParts {
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isTargetDay: sameDay(now, target),
      isAfterTarget: !sameDay(now, target) && startOfDay(now).getTime() > target.getTime(),
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMs: diff,
    isTargetDay: false,
    isAfterTarget: false,
  };
}

/** "18 settembre" */
function formatDayLong(day: CalendarDay): string {
  return `${day.dayOfMonth} ${day.monthLongLabel}`;
}

/** "giovedì 18 settembre" */
export function formatDayFull(day: CalendarDay): string {
  const full = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  return `${full[day.startOfDay.getDay()] ?? ''} ${formatDayLong(day)}`.trim();
}

/** Numero di caselle già sbloccate fino ad oggi (incluse quelle passate senza apertura). */
export function getUnlockedCount(days: CalendarDay[], now: Date = new Date()): number {
  return days.filter((d) => getDayStatus(d, now) !== 'locked').length;
}
