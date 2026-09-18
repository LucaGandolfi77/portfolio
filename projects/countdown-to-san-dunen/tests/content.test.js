/**
 * Test dei contenuti: il percorso, il Santo, i testi.
 *
 * Esecuzione (Node 20+, senza dipendenze):
 *   npm test
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AMBIENT_LINES,
  APP_NAME,
  EVENT_YEAR,
  FESTA,
  FINALE_COPY,
  FOOTER_LINES,
  PERCORSO,
  SANTO,
  TEAM,
  TRICOLORE,
} from '../js/data/event.js';
import {
  EGG_LINES,
  FALLBACK_RITUAL,
  INTRO_LINES,
  LOCKED_LINES,
  messages,
} from '../js/data/messages.js';

const testiDeiMessaggi = messages.map((m) => `${m.title} ${m.message}`).join('\n');

/* --------------------------------------------------------------- la festa */

test('la festa è quella giusta: San Donnino, 9 ottobre, Fidenza', () => {
  assert.equal(FESTA.giorno, '9 ottobre');
  assert.equal(FESTA.città, 'Fidenza');
  assert.equal(FESTA.provincia, 'Parma');
  assert.equal(EVENT_YEAR, 2026);
  assert.match(FESTA.nomignolo, /San Dunén/);
  assert.match(APP_NAME, /San Dunén/);
});

test('il Santo è raccontato con i fatti giusti', () => {
  assert.equal(SANTO.nome, 'San Donnino martire');
  assert.match(SANTO.epoca, /III secolo/);
  assert.match(SANTO.morte, /9 ottobre 293/);
  assert.match(SANTO.luogo, /Stirone/);
  assert.ok(SANTO.storia.length >= 3, 'servono almeno tre paragrafi di storia');
  // i dettagli che rendono il racconto preciso
  assert.match(SANTO.storia[0], /Massimiano|cubicularium/);
  assert.match(SANTO.storia[1], /decapitato/);
  assert.match(SANTO.storia[2], /urna|cripta|Duomo/);
  assert.match(SANTO.curiosita, /morso|rabbiosi/i);
  assert.match(SANTO.duomo, /Duomo|cattedrale/i);
});

test('si spiega perché si festeggia proprio il 9 ottobre', () => {
  assert.match(SANTO.perche, /dies natalis|patrono/);
  assert.match(SANTO.perche, /fiera|Pontificale/);
});

/* ------------------------------------------------------------- il percorso */

test('il percorso ha otto tappe, in ordine, da Zheng al Duomo', () => {
  assert.equal(PERCORSO.length, 8, 'le tappe devono essere otto');
  assert.match(PERCORSO[0].nome, /Zheng/, 'si parte da Zheng');
  assert.match(PERCORSO[PERCORSO.length - 1].nome, /Duomo/, 'si finisce davanti al Duomo');
});

test('i bar del giro sono tutti presenti, nell’ordine giusto', () => {
  const nomi = PERCORSO.map((t) => t.nome);
  const attesi = ['Zheng', 'Bar Raffa', 'La Palta', 'Nuovo', 'La Strega', 'Scarlet'];
  attesi.forEach((bar, i) => {
    assert.equal(nomi[i], bar, `alla posizione ${i} ci deve essere ${bar}, non ${nomi[i]}`);
  });
});

test('dopo i bar si passa dal tendone e si finisce davanti al Duomo', () => {
  const nomi = PERCORSO.map((t) => t.nome);
  assert.match(nomi[6], /Tendone/i, 'il tendone è la settima tappa');
  assert.match(nomi[7], /Duomo/i, 'il Duomo è l’ultima tappa');
});

test('si dice che il giro si fa in bicicletta', () => {
  const insieme = PERCORSO.map((t) => `${t.nota} ${t.commento}`).join(' ');
  assert.match(insieme, /bici|pedal|gomme/i, 'la bicicletta deve essere esplicita');
  assert.match(testiDeiMessaggi, /bicicletta|in bici/i);
});

test('ogni tappa ha un ruolo, una nota e una battuta', () => {
  PERCORSO.forEach((t) => {
    assert.ok(t.nome && t.nome.length > 0, 'nome tappa mancante');
    assert.ok(t.ruolo && t.ruolo.length > 0, `ruolo mancante per ${t.nome}`);
    assert.ok(t.nota && t.nota.length > 15, `nota troppo corta per ${t.nome}`);
    assert.ok(t.commento && t.commento.length > 15, `commento troppo corto per ${t.nome}`);
  });
});

/* ------------------------------------------------------------------ tono */

test('il tono è goliardico ma non idiota: si parla di bere, non di sbronze', () => {
  assert.match(testiDeiMessaggi, /birra|bere|brinda|fegato|bevuta/i);
  // niente invite a esagerare o a guidare bevuti
  assert.doesNotMatch(testiDeiMessaggi, /guidare (?:ubriac|brill)/i);
  assert.doesNotMatch(testiDeiMessaggi, /sbronz|coma etilico|ubriacarsi/i);
});

test('c’è la regola seria: chi guida non beve', () => {
  assert.match(FOOTER_LINES.join(' '), /se guidi, non bevi/i);
  assert.match(testiDeiMessaggi, /[Cc]hi guida non beve|[Cc]hi beve non guida/);
  assert.match(testiDeiMessaggi, /luci/i, 'si ricorda di accendere le luci in bici');
});

test('le frasi decorative parlano di Fidenza, bici e tendone', () => {
  assert.ok(AMBIENT_LINES.some((l) => /Fidenza/.test(l)));
  assert.ok(AMBIENT_LINES.some((l) => /bici|bicicletta/i.test(l)));
  assert.ok(AMBIENT_LINES.some((l) => /tendone/i.test(l)));
  assert.ok(FOOTER_LINES.some((l) => /tendone|bici/i.test(l)));
  assert.ok(INTRO_LINES.some((l) => /gomme|tappe|San Donnino/i.test(l)));
  assert.ok(EGG_LINES.length >= 3, 'servono almeno tre frasi per gli easter egg');
  assert.ok(LOCKED_LINES.length >= 4, 'servono più frasi per le caselle chiuse');
});

test('il gran finale nomina il Santo, la città e la compagnia', () => {
  assert.equal(FINALE_COPY.event, 'San Donnino');
  assert.equal(FINALE_COPY.place, 'Fidenza');
  assert.equal(FINALE_COPY.date, '9 ottobre');
  assert.equal(FINALE_COPY.team, TEAM.name);
  assert.match(FINALE_COPY.cta, /pedala|beve/i);
});

test('il tricolore ha tre colori distinti e validi', () => {
  assert.equal(TRICOLORE.length, 3);
  TRICOLORE.forEach((c) => assert.match(c, /^#[0-9a-f]{6}$/i, `colore non valido: ${c}`));
});


/* ------------------------------------------------------------- i rituali */

test('OGNI casella ha il suo rituale: nessuna usa quello di riserva', () => {
  const senza = messages.filter((m) => !m.ritual || !m.ritual.trim());
  assert.deepEqual(senza.map((m) => m.offset), [], 'caselle senza rituale');
  const conRiserva = messages.filter((m) => m.ritual.trim() === FALLBACK_RITUAL);
  assert.deepEqual(
    conRiserva.map((m) => m.offset),
    [],
    'nessuna casella deve mostrare il rituale di riserva',
  );
});

test('i 31 rituali sono tutti diversi', () => {
  const rituali = messages.map((m) => m.ritual.trim());
  assert.equal(rituali.length, 31);
  assert.equal(new Set(rituali).size, 31, 'ci sono rituali ripetuti');
});

test('i rituali sono brevi: stanno a schermo 3,4 secondi', () => {
  messages.forEach((m) => {
    const testo = m.ritual.trim();
    assert.ok(testo.length <= 95, `rituale della casella ${m.offset} troppo lungo (${testo.length})`);
    assert.ok(testo.length >= 20, `rituale della casella ${m.offset} troppo corto`);
    // una frase, non un paragrafo
    assert.ok(!testo.includes('\n'), `il rituale della casella ${m.offset} va a capo`);
  });
});

test('i rituali si rivolgono a chi legge, non sono massime generiche', () => {
  // Il rituale è un piccolo gesto da fare: deve parlare a "te", con un verbo
  // rivolto a chi legge. Le forme usate sono tante, quindi il controllo è
  // volutamente generoso: serve a evitare che entri una frase impersonale.
  const rivolto = new RegExp(
    [
      'Respira', 'Controlla', 'Ricorda', 'Apri', 'Leggi', 'rispondere', 'Gonfia',
      'Alza', 'giura', 'fai', 'Fallo', 'Allaccia', 'Conta', 'servono', 'Bevi',
      'Guarda', 'Guardati', 'Annusa', 'Dai', 'Presentati', 'Dillo', 'senta',
      'Pensa', 'Chiudi', 'Senti', 'Prepara', 'Tirati', 'Ripeti', 'Spegni',
      'Ascolta', 'cerca', 'Brinda', 'Metti', 'Sentiti', 'Sorridi', 'respiro',
    ].join('|'),
    'i', // senza distinzione fra maiuscole e minuscole
  );
  messages.forEach((m) => {
    assert.match(m.ritual, rivolto, `il rituale della casella ${m.offset} non parla a chi legge: "${m.ritual}"`);
  });
});

test('i rituali degli ultimi giorni sono i più sentiti', () => {
  const vigilia = messages.find((m) => m.offset === -1);
  const festa = messages.find((m) => m.offset === 0);
  assert.match(vigilia.ritual, /Domani/i);
  assert.match(festa.ritual, /compagnia|Sorridi|vostro/i);
});
