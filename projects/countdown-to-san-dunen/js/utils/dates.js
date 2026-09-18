/**
 * dates.js — tutta la logica temporale del countdown.
 *
 * Regole:
 *  - La data finale è il 9 ottobre (ora locale del dispositivo), giorno di San Donnino.
 *  - Il calendario parte dal 9 settembre: 31 caselle, numerate da -30 a 0.
 *  - Lo `offset` di una casella è il numero che si vede sopra: 0 è il giorno della festa,
 *    -30 è il primo giorno di countdown.
 *  - Il giorno della festa è sempre l'ultima casella, qualunque cosa succeda.
 *
 * Nessun testo in questo file: solo date.
 */

export const TARGET_MONTH = 9; // ottobre (0-indexed)
export const TARGET_DAY = 9;
/** 30 giorni di attesa + il giorno della festa. */
export const CALENDAR_LENGTH = 31;

const MONTHS_SHORT = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
];

const MONTHS_LONG = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

/** Mezzanotte locale di una data. Costruttore locale: nessun bug da fuso orario. */
export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

/** Aggiunge n giorni restando a mezzanotte locale (gestisce l'ora legale). */
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

/** Chiave stabile e ordinabile: "2026-09-09". */
export function dayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Il prossimo 9 ottobre. Se oggi *è* il 9 ottobre, restituisce oggi. */
export function getTargetDate(from = new Date()) {
  const today = startOfDay(from);
  const thisYear = new Date(today.getFullYear(), TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
  if (today.getTime() <= thisYear.getTime()) return thisYear;
  return new Date(today.getFullYear() + 1, TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
}

/**
 * Il 9 ottobre "di riferimento" per la finestra del calendario: quello di
 * quest'anno se non è ancora passato, altrimenti quello appena trascorso.
 * Diverso da `getTargetDate`, che guarda sempre avanti (serve al countdown).
 */
export function getReferenceTarget(from = new Date()) {
  return new Date(from.getFullYear(), TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0);
}

/** true se il 9 ottobre di quest'anno è già passato. */
export function isPastTarget(now = new Date()) {
  return startOfDay(now).getTime() > getReferenceTarget(now).getTime();
}

/**
 * Finestra del calendario: dal 9 settembre al 9 ottobre.
 *
 * L'ultima casella è SEMPRE il giorno della festa. Dopo il 9 ottobre resta
 * visibile la finestra appena conclusa, così il diario si può rileggere.
 */
export function getCalendarWindow(now = new Date()) {
  const end = getReferenceTarget(now);
  const start = addDays(end, -(CALENDAR_LENGTH - 1));
  return { start, end };
}

/** true se il countdown non è ancora iniziato (siamo prima del 9 settembre). */
export function isBeforeWindow(now = new Date()) {
  return startOfDay(now).getTime() < getCalendarWindow(now).start.getTime();
}

/** Le 31 caselle, in ordine cronologico, ciascuna con il suo `offset`. */
export function getCalendarDays(now = new Date()) {
  const { start, end } = getCalendarWindow(now);
  const target = getReferenceTarget(now);
  const total = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const days = [];

  for (let i = 0; i < total; i += 1) {
    const date = addDays(start, i);
    days.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      /** Posizione nella griglia, 1-based. */
      index: i + 1,
      /** Il numero mostrato sulla casella: 0 è il giorno della festa. */
      offset: i + 1 - total,
      dayOfMonth: date.getDate(),
      monthLabel: MONTHS_SHORT[date.getMonth()] ?? '',
      monthLongLabel: MONTHS_LONG[date.getMonth()] ?? '',
      key: dayKey(date),
      startOfDay: date,
      endOfDay: addDays(date, 1),
      isFinale: sameDay(date, target),
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

/** La casella di oggi, se siamo dentro la finestra. */
export function findToday(now = new Date()) {
  return getCalendarDays(now).find((d) => getDayStatus(d, now) === 'today');
}

/**
 * Scompone la distanza dal 9 ottobre in giorni/ore/minuti/secondi.
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

/** "9 ottobre" */
export function formatDayLong(day) {
  return `${day.dayOfMonth} ${day.monthLongLabel}`;
}

/** "venerdì 9 ottobre" */
export function formatDayFull(day) {
  const full = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  return `${full[day.startOfDay.getDay()] ?? ''} ${formatDayLong(day)}`.trim();
}

/** Il numero della casella come si legge: "-30", "-1", "0". */
export function offsetLabel(offset) {
  return offset > 0 ? `+${offset}` : String(offset);
}

/** Numero di caselle già sbloccate fino a oggi. */
export function getUnlockedCount(days, now = new Date()) {
  return days.filter((d) => getDayStatus(d, now) !== 'locked').length;
}
