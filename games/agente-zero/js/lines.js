/* Agente Zero — what he says (and what the others say). IT + EN, pure. */

export const LINES = {
  it: {
    hello: ['Agente Zero, in servizio.', 'Palla in mano, scuse a zero.', 'Missione: retina.', 'Oggi il ferro lo sa già.', 'Fascia stretta. Si comincia.'],
    swish: ['Zero errori.', 'Solo cotone.', 'Il ferro non è stato invitato.', 'Pulito come il parquet di lunedì.', 'Ciuff. Traduzione: scusate.', 'Neanche l’ho sentita.', 'Così si firma.', 'La retina ringrazia.'],
    rim: ['Il ferro ha detto sì, con calma.', 'Un giro di cortesia e dentro.', 'Era tutto calcolato. Quasi.', 'Vale uguale.', 'Brutta ma buona.', 'Il ferro mi vuole bene.'],
    bank: ['Tabella dichiarata. A bassa voce.', 'Di sponda, come nonna Nives.', 'La tabella è un’alleata.', 'Geometria, signori.', 'Chiedo scusa al vetro.'],
    miss: ['Il ferro era storto, giuro.', 'Quella era di prova.', 'Colpa delle scarpe.', 'Rimbalzo mio.', 'Quasi. Quasi non fa punti.', 'Riprendo il polso.', 'Troppa fretta.', 'Ricalibro.'],
    airball: ['Ho tirato all’aria. L’aria ha parato.', 'Nessuno ha visto niente.', 'Air ball: nome in codice “silenzio”.', 'Il canestro si è spostato. Sicuro.', 'Quella non esiste nei rapporti.'],
    blocked: ['Giù le mani dalla missione.', 'Ho tirato sul guanto.', 'Aspetto che scenda, la prossima.', 'Stoppata. Non lo diciamo a Nives.'],
    late: ['Troppo lento, Agente.', 'La sirena non aspetta.', 'Pensavo troppo.', 'Il tempo mi ha stoppato.'],
    fire: ['Sono in fiamme. Chiamate nessuno.', 'Zero freni.', 'Adesso vale doppio.', 'Il pallone scotta!', 'Non parlatemi.'],
    buzzer: ['Sulla sirena!', 'All’ultimo decimo. Come da manuale.', 'Il tempo era finito. La palla no.'],
    win: ['Missione compiuta.', 'Rapporto: eccellente.', 'Nives, segna questa.', 'Zero rimpianti.'],
    lose: ['Missione da rifare.', 'Torno domani più cattivo.', 'Ho imparato qualcosa. Credo.', 'Il Bunker mi aspetta.'],
    coach: ['Piega le gambe!', 'Il polso, Zero, il polso!', 'Respira e poi tira.', 'Non guardare la palla, guarda il ferro.', 'Così mi piaci.'],
    rival: ['Tutto qui, Zero?', 'Quel numero ti sta preciso.', 'Io quella la segno dormendo.', 'Fortuna.', 'Ok, questa era bella.'],
  },
  en: {
    hello: ['Agent Zero, on duty.', 'Ball in hand, zero excuses.', 'Mission: net.', 'The rim already knows.', 'Headband tight. Here we go.'],
    swish: ['Zero errors.', 'Nothing but cotton.', 'The rim was not invited.', 'Clean as a Monday floor.', 'Swish. Translation: sorry.', 'I did not even hear it.', 'That is how you sign.', 'The net says thanks.'],
    rim: ['The rim said yes, eventually.', 'One courtesy lap and in.', 'All calculated. Nearly.', 'Counts the same.', 'Ugly but good.', 'The rim likes me.'],
    bank: ['Called glass. Quietly.', 'Off the board, like Grandma Nives.', 'The backboard is a friend.', 'Geometry, people.', 'Apologies to the glass.'],
    miss: ['That rim is crooked, I swear.', 'That was a practice one.', 'Blame the shoes.', 'My rebound.', 'Almost. Almost scores nothing.', 'Resetting the wrist.', 'Rushed it.', 'Recalibrating.'],
    airball: ['I shot the air. The air saved it.', 'Nobody saw anything.', 'Airball: codename “silence”.', 'The hoop moved. Definitely.', 'That one is not in the report.'],
    blocked: ['Hands off the mission.', 'Shot it into the glove.', 'Next one waits until the hand drops.', 'Blocked. Do not tell Nives.'],
    late: ['Too slow, Agent.', 'The buzzer waits for nobody.', 'Overthought it.', 'Time blocked me.'],
    fire: ['I am on fire. Call nobody.', 'Zero brakes.', 'Counts double now.', 'The ball is hot!', 'Do not talk to me.'],
    buzzer: ['At the buzzer!', 'Last tenth. By the book.', 'Time ran out. The ball did not.'],
    win: ['Mission complete.', 'Report: excellent.', 'Nives, write that down.', 'Zero regrets.'],
    lose: ['Mission needs a retry.', 'Back tomorrow, meaner.', 'I learned something. I think.', 'The Bunker is waiting.'],
    coach: ['Bend your legs!', 'The wrist, Zero, the wrist!', 'Breathe, then shoot.', 'Watch the rim, not the ball.', 'Now we are talking.'],
    rival: ['Is that all, Zero?', 'That number suits you.', 'I make that one asleep.', 'Lucky.', 'Fine, that one was nice.'],
  },
};

export function say(lang, key, rng = Math.random, avoid = '') {
  const pool = (LINES[lang] || LINES.it)[key] || [];
  if (!pool.length) return '';
  const fresh = pool.filter((l) => l !== avoid);
  const from = fresh.length ? fresh : pool;
  return from[Math.floor(rng() * from.length)];
}

/** Which kind of line follows a shot. */
export function lineKey(out, buzzer = false) {
  if (out.made) {
    if (buzzer) return 'buzzer';
    if (out.ignited) return 'fire';
    return out.result === 'swish' ? 'swish' : out.result === 'bank' ? 'bank' : 'rim';
  }
  if (out.result === 'airball' || out.result === 'blocked' || out.result === 'late') return out.result;
  return 'miss';
}
