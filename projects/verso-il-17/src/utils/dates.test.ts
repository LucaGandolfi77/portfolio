/**
 * Test della logica temporale e dei contenuti.
 *
 * Esecuzione (Node 22+):
 *   node --experimental-strip-types --test src/utils/dates.test.ts
 *
 * Oppure, se `node --experimental-strip-types` non è disponibile:
 *   npx tsx src/utils/dates.test.ts   (vedi README)
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CALENDAR_LENGTH,
  MAX_CALENDAR_LENGTH,
  addDays,
  dayKey,
  findToday,
  getCalendarDays,
  getCalendarWindow,
  getCountdownParts,
  getDayStatus,
  getTargetDate,
  isPastTarget,
  sameDay,
  startOfDay,
} from './dates.ts';
import { messages } from '../data/messages.ts';

const D = (y: number, m: number, d: number, h = 0, min = 0, s = 0) => new Date(y, m, d, h, min, s, 0);

test('il target è il 17 ottobre dello stesso anno se non è ancora passato', () => {
  const target = getTargetDate(D(2026, 8, 18));
  assert.ok(sameDay(target, D(2026, 9, 17)), `atteso 17/10/2026, ottenuto ${target.toString()}`);
});

test('il 17 ottobre stesso il target è oggi, non l’anno prossimo', () => {
  const target = getTargetDate(D(2026, 9, 17, 9, 30));
  assert.equal(target.getFullYear(), 2026);
  assert.ok(sameDay(target, D(2026, 9, 17)));
});

test('dopo il 17 ottobre il target slitta all’anno successivo', () => {
  const target = getTargetDate(D(2026, 9, 18));
  assert.equal(target.getFullYear(), 2027);
  assert.ok(sameDay(target, D(2027, 9, 17)));
});

test('la finestra prima del gran giorno finisce il 17 ottobre', () => {
  const { start, end } = getCalendarWindow(D(2026, 8, 18));
  assert.ok(sameDay(end, D(2026, 9, 17)), `fine attesa 17/10, ottenuta ${end.toDateString()}`);
  assert.equal(CALENDAR_LENGTH, 30);
  assert.ok(sameDay(start, D(2026, 8, 18)), `inizio atteso 18/09, ottenuto ${start.toDateString()}`);
});

test('anche a metà percorso la finestra resta di 30 caselle', () => {
  const days = getCalendarDays(D(2026, 9, 1));
  assert.equal(days.length, CALENDAR_LENGTH);
  assert.ok(sameDay(days[days.length - 1]!.startOfDay, D(2026, 9, 17)), 'finisce sempre il 17 ottobre');
});

test('aprendo il diario il 17 settembre la casella di oggi esiste (finestra di 31)', () => {
  const now = D(2026, 8, 17, 10, 30);
  const days = getCalendarDays(now);
  assert.equal(days.length, MAX_CALENDAR_LENGTH, 'si allunga di un giorno, non lascia buchi');
  const today = findToday(now);
  assert.ok(today, 'il 17 settembre deve esserci una casella apribile');
  assert.equal(today.index, 1);
  assert.ok(sameDay(days[days.length - 1]!.startOfDay, D(2026, 9, 17)), 'finisce sempre il 17 ottobre');
});

test('la casella di oggi esiste in ogni giorno del percorso', () => {
  // Dal 17 settembre al 17 ottobre incluso: mai una giornata scoperta.
  for (let offset = 0; offset <= MAX_CALENDAR_LENGTH - 1; offset += 1) {
    const now = D(2026, 8, 17 + offset, 12, 0);
    const days = getCalendarDays(now);
    const today = findToday(now);
    assert.ok(today, `nessuna casella apribile il ${dayKey(now)}`);
    assert.ok(
      days.some((d) => d.key === today.key),
      `la casella di oggi non è nel calendario il ${dayKey(now)}`,
    );
    assert.equal(getDayStatus(today, now), 'today');
    const locked = days.filter((d) => getDayStatus(d, now) === 'locked');
    assert.ok(locked.length > 0 || dayKey(now) === '2026-10-17', 'i giorni futuri restano bloccati');
  }
});

test('il 17 ottobre la finestra finisce oggi (non il 16 novembre)', () => {
  const { start, end } = getCalendarWindow(D(2026, 9, 17, 8, 0));
  assert.ok(sameDay(end, D(2026, 9, 17)));
  assert.ok(sameDay(start, D(2026, 8, 18)));
});

test('il 20 ottobre la finestra appena conclusa resta consultabile', () => {
  const days = getCalendarDays(D(2026, 9, 20));
  assert.equal(days.length, CALENDAR_LENGTH);
  assert.ok(sameDay(days[days.length - 1]!.startOfDay, D(2026, 9, 17)), 'ultima casella = 17 ottobre');
  assert.ok(sameDay(days[0]!.startOfDay, D(2026, 8, 18)), 'prima casella = 18 settembre');
  assert.equal(isPastTarget(D(2026, 9, 20)), true);
  assert.equal(isPastTarget(D(2026, 9, 16)), false);
});

test('le caselle sono consecutive e senza buchi', () => {
  const days = getCalendarDays(D(2026, 8, 18));
  assert.equal(days.length, CALENDAR_LENGTH);
  days.forEach((day, i) => {
    assert.equal(day.index, i + 1, `indice sbagliato alla posizione ${i}`);
    assert.ok(
      sameDay(day.startOfDay, addDays(days[0]!.startOfDay, i)),
      `casella ${i + 1} non consecutiva`,
    );
  });
});

test('l\'ultima casella è il gran finale e la penultima è la vigilia', () => {
  const days = getCalendarDays(D(2026, 8, 18));
  const last = days[days.length - 1]!;
  const penultimate = days[days.length - 2]!;
  assert.equal(last.isFinale, true);
  assert.equal(last.isVigilia, false);
  assert.equal(penultimate.isVigilia, true);
  assert.equal(penultimate.isFinale, false);
});

test('gli stati delle caselle rispettano la data reale', () => {
  const now = D(2026, 8, 18, 14, 0); // 18 settembre, pomeriggio
  const days = getCalendarDays(now);

  assert.equal(getDayStatus(days[0]!, now), 'today', 'la casella di oggi è apribile');
  assert.equal(getDayStatus(days[1]!, now), 'locked', 'domani è bloccata');
  assert.equal(getDayStatus(days[29]!, now), 'locked', 'il 17 ottobre è bloccato');
  assert.equal(getDayStatus(days[0]!, D(2026, 8, 19)), 'past', 'ieri è passata');
});

test('a mezzanotte la casella di ieri si chiude e quella di oggi si apre', () => {
  const days = getCalendarDays(D(2026, 8, 18));
  const justBefore = D(2026, 8, 19, 23, 59);
  const justAfter = D(2026, 8, 20, 0, 0);
  assert.equal(getDayStatus(days[2]!, justBefore), 'locked');
  assert.equal(getDayStatus(days[2]!, justAfter), 'today');
});

test('findToday individua la casella corrente dentro la finestra', () => {
  const today = findToday(D(2026, 9, 10, 12, 0));
  assert.ok(today, 'la casella di oggi deve esistere a metà finestra');
  assert.ok(sameDay(today.startOfDay, D(2026, 9, 10)));
  assert.equal(today.index, 23);
  assert.equal(findToday(D(2026, 0, 5)), undefined, 'a gennaio si è fuori finestra');
});

test('il 17 ottobre la casella finale è quella di oggi', () => {
  const now = D(2026, 9, 17, 9, 0);
  const days = getCalendarDays(now);
  const today = findToday(now);
  assert.ok(today);
  assert.equal(today.isFinale, true);
  assert.equal(today.index, days.length);
  assert.equal(getDayStatus(today, now), 'today');
});

test('il countdown conta i giorni reali e si azzera il 17 ottobre', () => {
  const from = D(2026, 8, 18, 9, 0); // 18 set 09:00 -> 17 ott 00:00 = 28g 15h
  const parts = getCountdownParts(from, getTargetDate(from));
  assert.equal(parts.days, 28);
  assert.equal(parts.hours, 15);
  assert.equal(parts.minutes, 0);
  assert.equal(parts.seconds, 0);
  assert.equal(parts.isTargetDay, false);
});

test('il countdown è a zero (con isTargetDay) il 17 ottobre', () => {
  const from = D(2026, 9, 17, 10, 0);
  const parts = getCountdownParts(from, getTargetDate(from));
  assert.equal(parts.totalMs, 0);
  assert.equal(parts.isTargetDay, true);
  assert.equal(parts.isAfterTarget, false);
});

test('il giorno dopo il 17 ottobre isAfterTarget è true', () => {
  const from = D(2026, 9, 18, 10, 0);
  const parts = getCountdownParts(from);
  // Con il target che slitta al 2027 il countdown riparte, ma isAfterTarget resta coerente.
  assert.equal(parts.isTargetDay, false);
  assert.ok(parts.days > 300, 'il countdown riparte verso l’anno prossimo');
});

test('dayKey e startOfDay sono stabili e locali', () => {
  assert.equal(dayKey(D(2026, 8, 18, 23, 59)), '2026-09-18');
  assert.equal(dayKey(D(2026, 0, 1)), '2026-01-01');
  const today = startOfDay(D(2026, 9, 17, 23, 59, 59));
  assert.equal(today.getHours(), 0);
  assert.equal(today.getMinutes(), 0);
});

test('addDays attraversa il cambio di mese e di ora legale', () => {
  assert.equal(dayKey(addDays(D(2026, 8, 30), 1)), '2026-10-01');
  // Ultima domenica di ottobre 2026 (ora legale): il giorno successivo deve restare mezzanotte.
  const afterDst = addDays(D(2026, 9, 25), 1);
  assert.equal(afterDst.getHours(), 0, 'nessuno slittamento di ora dopo il cambio di ora legale');
  assert.equal(dayKey(afterDst), '2026-10-26');
});

test('i contenuti coprono ogni casella possibile, uno per casella, tutti diversi', () => {
  assert.equal(
    messages.length,
    MAX_CALENDAR_LENGTH,
    `servono ${MAX_CALENDAR_LENGTH} messaggi (una casella in più per chi apre il 17 settembre)`,
  );
  // Le caselle iniziali usano posizioni assolute; le due finali sono ancorate
  // alla fine, così restano l'ultima e la penultima con 30 o con 31 caselle.
  const startAnchored = messages.filter((m) => (m.anchor ?? 'start') === 'start');
  const endAnchored = messages.filter((m) => m.anchor === 'end');
  assert.deepEqual(
    startAnchored.map((m) => m.day).sort((a, b) => a - b),
    Array.from({ length: startAnchored.length }, (_, i) => i + 1),
    'le caselle dall’inizio devono essere numerate 1..N senza buchi',
  );
  assert.deepEqual(
    endAnchored.map((m) => m.day).sort((a, b) => a - b),
    [1, 2, 3, 4],
    'devono esserci esattamente quattro caselle ancorate alla fine',
  );
  const bodies = messages.map((m) => m.message.trim());
  assert.equal(new Set(bodies).size, bodies.length, 'nessun testo duplicato');
  const titles = messages.map((m) => m.title.trim());
  assert.equal(new Set(titles).size, titles.length, 'nessun titolo duplicato');
  messages.forEach((m) => {
    assert.ok(m.message.trim().length > 20, `messaggio ${m.day} troppo corto`);
    assert.ok(m.title.trim().length > 0, `titolo mancante al giorno ${m.day}`);
    assert.ok(['motivation', 'poem', 'thought', 'funny'].includes(m.type), `tipo non valido al giorno ${m.day}`);
  });
});
