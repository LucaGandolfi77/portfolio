/**
 * Test dell'identità di squadra e competizione.
 *
 * Esecuzione (Node 20+):
 *   node --experimental-strip-types --test src/data/event.test.ts
 *
 * Verificano che il Mondiale, la squadra e la nazione siano davvero presenti nei
 * contenuti e coerenti tra loro: sono informazioni importanti, non decorazione.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { AMBIENT_LINES, EVENT, EVENT_YEAR, FINALE_COPY, FOOTER_LINES, TEAM, TRICOLORE } from './event.ts';
import { EGG_LINES, INTRO_LINES, LOCKED_LINES, messages } from './messages.ts';

/** Il testo completo dei messaggi, per le ricerche. */
const allMessageText = messages.map((m) => `${m.title} ${m.message}`).join('\n');

test('la competizione è descritta con nome, luogo e specialità', () => {
  assert.equal(EVENT.name, 'Campionati del Mondo');
  assert.equal(EVENT.place, 'Paraguay');
  assert.match(EVENT.discipline, /sincronizzato/i);
  assert.match(EVENT.shortLabel, /Mondiale/);
  assert.match(EVENT.shortLabel, /Paraguay/);
  assert.equal(EVENT_YEAR, 2026);
});

test('la squadra è identificata con sigla, nome esteso e nazione', () => {
  assert.equal(TEAM.code, 'MPT');
  assert.equal(TEAM.name, 'Monza Precision Team');
  assert.equal(TEAM.country, 'Italia');
  assert.match(TEAM.full, /MPT|Monza Precision Team/);
});

test('il tricolore ha esattamente tre colori distinti', () => {
  assert.equal(TRICOLORE.length, 3);
  assert.equal(new Set(TRICOLORE).size, 3, 'i tre colori devono essere diversi');
  TRICOLORE.forEach((c) => assert.match(c, /^#[0-9a-f]{6}$/i, `colore non valido: ${c}`));
});

test('il gran finale dice dove si gareggia e per chi', () => {
  assert.equal(FINALE_COPY.event, EVENT.name);
  assert.equal(FINALE_COPY.place, EVENT.place);
  assert.equal(FINALE_COPY.team, TEAM.name);
  assert.equal(FINALE_COPY.date, '17 ottobre');
  assert.match(FINALE_COPY.cta, /pattinare/i);
});

test('il Monza Precision Team compare nei contenuti, non solo nei metadati', () => {
  const hits = (allMessageText.match(/Monza Precision Team/g) ?? []).length;
  assert.ok(hits >= 2, `attesi almeno 2 riferimenti al nome esteso, trovati ${hits}`);
  assert.match(allMessageText, /MPT|Monza Precision Team/);
});

test('il Paraguay compare nel percorso e nel gran finale', () => {
  const hits = (allMessageText.match(/Paraguay/g) ?? []).length;
  assert.ok(hits >= 3, `attesi almeno 3 riferimenti al Paraguay, trovati ${hits}`);
  assert.match(allMessageText, /Monza, l’Italia, il Paraguay/);
});

test('l’Italia e la rappresentanza nazionale sono dichiarate', () => {
  assert.match(allMessageText, /portare l’Italia in pista|rappresenta l’Italia|L’Italia arriva da Monza/);
});

test('il Mondiale è citato come traguardo, non come sfondo', () => {
  assert.match(allMessageText, /Campionati del Mondo/);
  assert.match(allMessageText, /un Mondiale/);
  assert.match(allMessageText, /palco più grande/);
});

test('il gran finale (ultima casella) riassume squadra, nazione e luogo', () => {
  const last = messages.find((m) => m.day === 31);
  assert.ok(last, 'la casella 31 deve esistere');
  assert.match(last.message, /Monza/);
  assert.match(last.message, /Paraguay/);
  assert.match(last.title, /Campionati del Mondo/);
});

test('la vigilia prepara al viaggio senza spoilerare il giorno della gara', () => {
  const vigilia = messages.find((m) => m.day === 30);
  assert.ok(vigilia);
  assert.match(vigilia.message, /compagne|squadra/);
  const poem = messages.find((m) => m.day === 29);
  assert.ok(poem);
  assert.match(poem.message, /Un’altra lingua/, 'la poesia della vigilia parla di gareggiare lontano');
});

test('le frasi decorative includono il viaggio e la squadra', () => {
  assert.ok(AMBIENT_LINES.some((l) => /Paraguay/.test(l)), 'una frase ambientale cita il Paraguay');
  assert.ok(AMBIENT_LINES.some((l) => /Monza/.test(l)), 'una frase ambientale cita Monza');
  assert.ok(FOOTER_LINES.some((l) => /MPT/.test(l)), 'il footer cita la sigla');
  assert.ok(
    FOOTER_LINES.some((l) => /Campionati del Mondo/.test(l) && /Paraguay/.test(l)),
    'il footer cita l’evento completo',
  );
  assert.ok(INTRO_LINES.some((l) => /Paraguay/.test(l)), 'una frase di caricamento cita il Paraguay');
  assert.ok(EGG_LINES.some((l) => /Monza Precision Team/.test(l)), 'un easter egg cita la squadra');
});

test('nessun testo promette una vittoria: si parla di gara, non di risultato', () => {
  const vietati = /\b(vincerete|vinceremo|sarete campionesse|campioni del mondo sicuri)\b/i;
  assert.doesNotMatch(allMessageText, vietati);
});

test('i messaggi restano coerenti: 31 caselle, testi tutti diversi', () => {
  assert.equal(messages.length, 31);
  const bodies = messages.map((m) => m.message.trim());
  assert.equal(new Set(bodies).size, bodies.length);
  const titles = messages.map((m) => m.title.trim());
  assert.equal(new Set(titles).size, titles.length);
});

test('la distribuzione dei tipi resta equilibrata', () => {
  const count = (type) => messages.filter((m) => m.type === type).length;
  const total = messages.length;
  const pct = (n) => (n / total) * 100;
  // ~50% motivazione, ~20% pensieri, ~15% poesie, ~15% ironia (con tolleranza).
  assert.ok(pct(count('motivation')) >= 35 && pct(count('motivation')) <= 60, `motivazione: ${pct(count('motivation')).toFixed(0)}%`);
  assert.ok(pct(count('thought')) >= 12 && pct(count('thought')) <= 30, `pensieri: ${pct(count('thought')).toFixed(0)}%`);
  assert.ok(pct(count('poem')) >= 8 && pct(count('poem')) <= 25, `poesie: ${pct(count('poem')).toFixed(0)}%`);
  assert.ok(pct(count('funny')) >= 8 && pct(count('funny')) <= 25, `ironia: ${pct(count('funny')).toFixed(0)}%`);
});
