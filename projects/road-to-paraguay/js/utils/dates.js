/**
 * dates.js — tutta la logica temporale dell'app.
 *
 * Regole chiave:
 *  - La data finale è il 17 ottobre (ora locale del dispositivo).
 *  - Se il 17 ottobre di quest'anno è già passato, il countdown punta al 17 ottobre dell'anno prossimo.
 *  - Il calendario ha 30 caselle nel percorso classico (31 se si apre il diario il 17 settembre):
 *    l'ultima è sempre il gran giorno.
 *
 * Nessun testo in questo file: solo date.
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

const MONTHS_SHORT = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
];

const MONTHS_LONG = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

/** Mezzanotte locale di una data. Usa il costruttore locale: nessun bug da UTC. */
export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/** Aggiunge n giorni "da calendario" restando a mezzanotte locale (gestisce l'ora legale). */
export function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 0, 0, 0, 0);
}

export function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Chiave stabile e ordinabile: "2026-09-18". */
export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Il prossimo 17 ottobre rispetto alla data passata.
 * Se oggi *è* il 17 ottobre, restituisce oggi (non l'anno prossimo).
 */
export function getTargetDate(from = new Date()) {
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
export function getReferenceTarget(from = new Date()) {
  return new Date(from.getFullYear(), TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
}

/** true se il 17 ottobre di quest'anno è già passato (il diario è "archiviato"). */
export function isPastTarget(now = new Date()) {
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
export function getCalendarWindow(now = new Date()) {
  const target = getReferenceTarget(now);
  const today = startOfDay(now);
  const end = target; // l'ultima casella è sempre il gran giorno
  const classicStart = addDays(end, -(CALENDAR_LENGTH - 1));
  // Se oggi precede l'inizio "classico" si parte da oggi, senza superare il tetto massimo.
  const start =
    today.getTime() < classicStart.getTime()
      ? addDays(target, -(MAX_CALENDAR_LENGTH - 1))
      : classicStart;
  return { start, end };
}

/** Le caselle del calendario, in ordine cronologico. */
export function getCalendarDays(now = new Date()) {
  const { start, end } = getCalendarWindow(now);
  const target = getReferenceTarget(now);
  const total = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const days = [];

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

/**
 * Stato di una casella rispetto a oggi.
 * @returns {'locked' | 'today' | 'past'}
 */
export function getDayStatus(day, now = new Date()) {
  const t = startOfDay(now).getTime();
  if (t < day.startOfDay.getTime()) return 'locked';
  if (t >= day.endOfDay.getTime()) return 'past';
  return 'today';
}

/** La casella di oggi, se siamo dentro la finestra del calendario. */
export function findToday(now = new Date()) {
  return getCalendarDays(now).find((d) => getDayStatus(d, now) === 'today');
}

/**
 * Scompone la distanza tra `now` e il 17 ottobre in giorni/ore/minuti/secondi.
 * @returns {{days:number,hours:number,minutes:number,seconds:number,totalMs:number,isTargetDay:boolean,isAfterTarget:boolean}}
 */
export function getCountdownParts(now = new Date(), target = getTargetDate(now)) {
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
function formatDayLong(day) {
  return `${day.dayOfMonth} ${day.monthLongLabel}`;
}

/** "giovedì 18 settembre" */
export function formatDayFull(day) {
  const full = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  return `${full[day.startOfDay.getDay()] ?? ''} ${formatDayLong(day)}`.trim();
}

/** Numero di caselle già sbloccate fino a oggi (incluse quelle passate senza apertura). */
export function getUnlockedCount(days, now = new Date()) {
  return days.filter((d) => getDayStatus(d, now) !== 'locked').length;
}
