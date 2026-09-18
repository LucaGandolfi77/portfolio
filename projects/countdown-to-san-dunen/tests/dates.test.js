/**
 * Test della logica temporale del countdown.
 *
 * Esecuzione (Node 20+, senza dipendenze):
 *   npm test
 *   node --test tests/dates.test.js
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CALENDAR_LENGTH,
  addDays,
  dayKey,
  findToday,
  getCalendarDays,
  getCalendarWindow,
  getCountdownParts,
  getDayStatus,
  getTargetDate,
  isBeforeWindow,
  isPastTarget,
  offsetLabel,
  startOfDay,
} from '../js/utils/dates.js';
import { messages, findMessage } from '../js/data/messages.js';

const D = (y, m, d, h = 0, min = 0, s = 0) => new Date(y, m, d, h, min, s, 0);

test('il target è il 9 ottobre dello stesso anno se non è ancora passato', () => {
  const target = getTargetDate(D(2026, 8, 9));
  assert.ok(target.getMonth() === 9 && target.getDate() === 9, `atteso 9/10/2026, ottenuto ${target}`);
  assert.equal(target.getFullYear(), 2026);
});

test('il 9 ottobre stesso il target è oggi, non l’anno prossimo', () => {
  const target = getTargetDate(D(2026, 9, 9, 18, 30));
  assert.equal(target.getFullYear(), 2026);
  assert.equal(target.getDate(), 9);
});

test('dopo il 9 ottobre il target slitta all’anno successivo', () => {
  const target = getTargetDate(D(2026, 9, 10));
  assert.equal(target.getFullYear(), 2027);
});

test('la finestra va dal 9 settembre al 9 ottobre: 31 caselle', () => {
  const { start, end } = getCalendarWindow(D(2026, 8, 20));
  assert.ok(start.getMonth() === 8 && start.getDate() === 9, `inizio atteso 9/9, ottenuto ${start}`);
  assert.ok(end.getMonth() === 9 && end.getDate() === 9, `fine attesa 9/10, ottenuta ${end}`);
  assert.equal(CALENDAR_LENGTH, 31);
  assert.equal(getCalendarDays(D(2026, 8, 20)).length, 31);
});

test('le caselle sono numerate da -30 a 0, consecutive e senza buchi', () => {
  const days = getCalendarDays(D(2026, 8, 20));
  assert.equal(days[0].offset, -30, 'la prima casella è -30');
  assert.equal(days[days.length - 1].offset, 0, 'l’ultima casella è 0');
  days.forEach((day, i) => {
    assert.equal(day.offset, i - 30, `offset sbagliato alla posizione ${i}: ${day.offset}`);
    assert.equal(day.index, i + 1);
  });
  const offsets = days.map((d) => d.offset);
  assert.equal(new Set(offsets).size, 31, 'nessun offset ripetuto');
});

test('l’ultima casella è sempre il giorno della festa', () => {
  for (const giorno of [D(2026, 8, 20), D(2026, 9, 5), D(2026, 9, 9)]) {
    const days = getCalendarDays(giorno);
    const ultima = days[days.length - 1];
    assert.equal(ultima.isFinale, true, `con oggi=${giorno.toDateString()} l’ultima non è la festa`);
    assert.equal(ultima.offset, 0);
    assert.equal(ultima.dayOfMonth, 9);
    assert.equal(ultima.month, 9);
  }
});

test('la penultima casella è la vigilia (-1)', () => {
  const days = getCalendarDays(D(2026, 8, 20));
  const penultima = days[days.length - 2];
  assert.equal(penultima.offset, -1);
  assert.equal(penultima.isVigilia, true);
  assert.equal(penultima.isFinale, false);
});

test('gli stati delle caselle rispettano la data reale', () => {
  const now = D(2026, 8, 20, 14, 0); // 20 settembre
  const days = getCalendarDays(now);
  const oggi = findToday(now);
  assert.ok(oggi, 'il 20 settembre deve esserci una casella apribile');
  assert.equal(oggi.offset, -19, 'il 20 settembre è la casella -19');
  assert.equal(getDayStatus(oggi, now), 'today');

  const ieri = days.find((d) => d.offset === -20);
  assert.equal(getDayStatus(ieri, now), 'past', 'il 19 settembre è passato');
  const domani = days.find((d) => d.offset === -18);
  assert.equal(getDayStatus(domani, now), 'locked', 'il 21 settembre è ancora chiuso');
});

test('la casella di oggi esiste in ogni giorno del countdown', () => {
  for (let i = 0; i < 31; i += 1) {
    const now = D(2026, 8, 9 + i, 12, 0);
    const oggi = findToday(now);
    assert.ok(oggi, `nessuna casella apribile il ${dayKey(now)}`);
    assert.equal(oggi.offset, -30 + i, `offset sbagliato il ${dayKey(now)}`);
  }
});

test('a mezzanotte la casella di ieri si chiude e quella di oggi si apre', () => {
  const days = getCalendarDays(D(2026, 8, 9));
  // la casella -10 cade il 29 settembre (9 settembre + 20 giorni)
  const casella = days.find((d) => d.offset === -10);
  assert.equal(casella.dayOfMonth, 29, 'la casella -10 deve essere il 29 settembre');
  assert.equal(getDayStatus(casella, D(2026, 8, 28, 23, 59)), 'locked');
  assert.equal(getDayStatus(casella, D(2026, 8, 29, 0, 0)), 'today');
});

test('il countdown conta i giorni reali e si azzera il 9 ottobre', () => {
  const from = D(2026, 8, 9, 9, 0); // 9 set 09:00 -> 9 ott 00:00 = 29g 15h
  const parts = getCountdownParts(from, getTargetDate(from));
  assert.equal(parts.days, 29);
  assert.equal(parts.hours, 15);
  assert.equal(parts.isTargetDay, false);

  const ilGiorno = D(2026, 9, 9, 10, 0);
  const zero = getCountdownParts(ilGiorno, getTargetDate(ilGiorno));
  assert.equal(zero.totalMs, 0);
  assert.equal(zero.isTargetDay, true);
});

test('prima del 9 settembre il countdown non è ancora iniziato', () => {
  assert.equal(isBeforeWindow(D(2026, 8, 1)), true, 'il 1 settembre si è prima');
  assert.equal(isBeforeWindow(D(2026, 8, 9)), false, 'il 9 settembre si è dentro');
  assert.equal(isBeforeWindow(D(2026, 9, 9)), false, 'il 9 ottobre si è dentro');
});

test('dopo il 9 ottobre il countdown risulta archiviato', () => {
  assert.equal(isPastTarget(D(2026, 9, 10)), true);
  assert.equal(isPastTarget(D(2026, 9, 9)), false);
  assert.equal(isPastTarget(D(2026, 9, 8)), false);
});

test('offsetLabel scrive i numeri come sulla casella', () => {
  assert.equal(offsetLabel(-30), '-30');
  assert.equal(offsetLabel(-1), '-1');
  assert.equal(offsetLabel(0), '0');
});

test('startOfDay e addDays sono stabili, anche con l’ora legale', () => {
  const oggi = startOfDay(D(2026, 9, 9, 23, 59));
  assert.equal(oggi.getHours(), 0);
  assert.equal(dayKey(addDays(D(2026, 8, 30), 1)), '2026-10-01');
  // ultima domenica di ottobre 2026: il giorno dopo resta a mezzanotte
  const dopoCambioOra = addDays(D(2026, 9, 25), 1);
  assert.equal(dopoCambioOra.getHours(), 0);
  assert.equal(dayKey(dopoCambioOra), '2026-10-26');
});

test('ogni casella del countdown ha il suo messaggio, senza buchi né doppioni', () => {
  assert.equal(messages.length, 31, 'servono 31 messaggi, uno per casella');
  const offsets = messages.map((m) => m.offset).sort((a, b) => a - b);
  assert.deepEqual(
    offsets,
    Array.from({ length: 31 }, (_, i) => i - 30),
    'gli offset devono coprire -30..0',
  );
  for (const day of getCalendarDays(D(2026, 8, 20))) {
    assert.ok(findMessage(day.offset), `manca il messaggio per la casella ${day.offset}`);
  }
});

test('i contenuti sono tutti diversi e ben formati', () => {
  const testi = messages.map((m) => m.message.trim());
  assert.equal(new Set(testi).size, testi.length, 'nessun testo ripetuto');
  const titoli = messages.map((m) => m.title.trim());
  assert.equal(new Set(titoli).size, titoli.length, 'nessun titolo ripetuto');
  const tipi = ['motivation', 'poem', 'thought', 'funny'];
  messages.forEach((m) => {
    assert.ok(tipi.includes(m.type), `tipo non valido per la casella ${m.offset}`);
    assert.ok(m.message.trim().length > 20, `messaggio troppo corto per la casella ${m.offset}`);
    assert.ok(m.title.trim().length > 0, `titolo mancante per la casella ${m.offset}`);
  });
});

test('il messaggio della festa è quello della casella 0', () => {
  const finale = findMessage(0);
  assert.ok(finale, 'la casella 0 deve esistere');
  assert.match(finale.title, /SAN DUNÉN/i);
  assert.match(finale.message, /Zheng/);
  assert.match(finale.message, /Duomo/);
});
