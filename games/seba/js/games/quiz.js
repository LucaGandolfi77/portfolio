/* ============================================================
   Seba — blunders: absurd situations, three ways out
   ------------------------------------------------------------
   Each option is [Italian, English, score 0..2, IT outcome, EN outcome].
   ============================================================ */
import { el } from './shell.js';

export const ROUNDS = 3;
export const TIME = 14;
const Q = (id, it, en, ...opts) => ({ id, q: { it, en }, opts: opts.map(([a, b, score, c, d]) => ({ label: { it: a, en: b }, score, out: { it: c, en: d } })) });

export const QUESTIONS = [
  Q('headphones', 'Il DJ ti passa le cuffie e va in bagno. Cosa fai?', 'The DJ hands you the headphones and leaves for the loo. What now?',
    ['Metto la sigla di un quiz', 'Play a quiz-show theme', 1, 'Metà pista ride, l’altra metà chiama la polizia.', 'Half the floor laughs, half calls the police.'],
    ['Abbasso i bassi, li rialzo piano, boato', 'Drop the bass, bring it back slowly, roar', 2, 'Boato. Ti chiedono il nome d’arte.', 'A roar. They ask for your stage name.'],
    ['Premo tutti i tasti', 'Press every button', 0, 'Silenzio totale. Poi un fischio lungo quaranta secondi.', 'Total silence. Then a forty-second whistle.']),
  Q('boss', 'Alle sei di mattina incontri il tuo capo in pista, in canotta a rete.', 'At six a.m. you meet your boss on the floor in a mesh top.',
    ['Un cenno e niente domande', 'A nod and no questions', 2, 'Patto di sangue. Domani turno corto.', 'A blood pact. Short shift tomorrow.'],
    ['Foto di gruppo!', 'Group photo!', 0, 'La foto esiste. La tua mancia no.', 'The photo exists. Your tips don’t.'],
    ['Chiedo l’aumento', 'Ask for a raise', 1, 'Dice sì. Non se lo ricorderà.', 'He says yes. He won’t remember.']),
  Q('queue', 'Il buttafuori chiede il nome del DJ. Non lo sai.', 'The bouncer asks the DJ’s name. You have no idea.',
    ['«Marco» con grande sicurezza', '“Marco”, very confidently', 1, 'Si chiama Ingrid. Ti fa entrare per pietà.', 'It’s Ingrid. You get in out of pity.'],
    ['Confesso e racconto la mia serata', 'Confess and tell him your night', 2, 'Si commuove. Salti la fila.', 'He is moved. You skip the queue.'],
    ['Indico il cielo', 'Point at the sky', 0, 'Resti fuori a parlare con un lampione.', 'You stay outside chatting to a lamp post.']),
  Q('parrot', 'Un pappagallo ripete davanti a tutti una cosa che hai detto in segreto.', 'A parrot repeats, in front of everyone, something you said in private.',
    ['Nego: è un pappagallo mitomane', 'Deny it: the parrot is a fantasist', 1, 'Il pappagallo si offende. Il dubbio resta.', 'The parrot is offended. Doubt remains.'],
    ['Gli offro un’alleanza (e un seme)', 'Offer an alliance (and a seed)', 2, 'Ora lavora per te. Ha ottimi contatti.', 'It works for you now. Great contacts.'],
    ['Piango', 'Cry', 0, 'Ripete anche il pianto. Benissimo.', 'It repeats the crying too. Splendid.']),
  Q('toast', 'Ti chiedono un brindisi a un matrimonio in cui sei entrato per sbaglio.', 'You’re asked to toast a wedding you wandered into by mistake.',
    ['«Agli sposi, chiunque siano!»', '“To the couple, whoever they are!”', 2, 'Standing ovation. La zia ti adotta.', 'Standing ovation. An aunt adopts you.'],
    ['Racconto la mia ex', 'Talk about my ex', 0, 'Cala il gelo. Letteralmente: ti tirano il ghiaccio.', 'A chill falls. Literally: they throw ice.'],
    ['Offro un cocktail a tutti', 'Cocktails for everyone', 1, 'Successo. Il conto è tuo.', 'A hit. The bill is yours.']),
  Q('boat', 'Sei su una barca di sconosciuti. Il capitano chiede se sai guidare.', 'You’re on a strangers’ boat. The captain asks if you can steer.',
    ['«Certo» (non è vero)', '“Of course” (a lie)', 0, 'Scoglio. Piccolo, ma convinto.', 'Rock. Small, but determined.'],
    ['«No, ma so fare i nodi ai gambi di ciliegia»', '“No, but I can knot cherry stems”', 2, 'Diventi mascotte di bordo.', 'You become the ship’s mascot.'],
    ['Fingo di dormire', 'Pretend to sleep', 1, 'Funziona. Ti svegli in un altro porto.', 'It works. You wake in another port.']),
  Q('grandma', 'Una nonna ti mette davanti il quarto piatto.', 'A grandmother puts the fourth plate in front of you.',
    ['Mangio con gratitudine', 'Eat with gratitude', 2, 'Sei di famiglia. Riparti con una teglia.', 'You’re family. You leave with a tray.'],
    ['«Sono a dieta»', '“I’m on a diet”', 0, 'Quinto piatto, per punizione.', 'A fifth plate, as punishment.'],
    ['Lo passo di nascosto al cane', 'Slip it to the dog', 1, 'Il cane ti denuncia con un rutto.', 'The dog reports you with a burp.']),
  Q('karaoke', 'Karaoke. Ti è capitata una ballata altissima.', 'Karaoke. You drew a very high ballad.',
    ['La canto con l’anima', 'Sing it with soul', 2, 'Stonato, ma piangono tutti.', 'Off key, but everyone cries.'],
    ['La parlo, tipo poesia', 'Speak it like a poem', 1, 'Applausi perplessi.', 'Puzzled applause.'],
    ['Scappo dal retro', 'Escape out the back', 0, 'Il retro era un armadio.', 'The back door was a cupboard.']),
  Q('phone', 'Hai il telefono in mano alle 5 e il numero della tua ex sullo schermo.', 'Phone in hand at 5 a.m., your ex’s number on screen.',
    ['Lo do a un amico fidato', 'Hand it to a trusted friend', 2, 'Salvo. L’amico ordina una pizza.', 'Saved. The friend orders pizza.'],
    ['Vocale di nove minuti', 'Nine-minute voice note', 0, 'Spunte blu. Nessuna risposta. Mai.', 'Read. No reply. Ever.'],
    ['Scrivo e cancello trenta volte', 'Type and delete thirty times', 1, 'Sul suo schermo: “sta scrivendo…” per un’ora.', 'On their screen: “typing…” for an hour.']),
  Q('dancefloor', 'In mezzo alla pista si apre un cerchio. Guardano te.', 'A circle opens on the floor. Everyone looks at you.',
    ['La mossa del ghiaccio nello shaker', 'The shaker-ice move', 2, 'Leggenda. La imitano in tre continenti.', 'Legend. Copied on three continents.'],
    ['Spaccata', 'Do the splits', 0, 'Strappo ai pantaloni e all’orgoglio.', 'You rip trousers and pride.'],
    ['Invito dentro il più timido', 'Pull the shyest one in', 2, 'Il cerchio esplode. Hai un amico nuovo.', 'The circle erupts. New friend.']),
  Q('wallet', 'Trovi un portafoglio pieno di scontrini e banconote.', 'You find a wallet stuffed with receipts and cash.',
    ['Lo porto al bar', 'Take it to the bar', 2, 'Il proprietario ti offre da bere per un mese.', 'The owner stands you drinks for a month.'],
    ['Offro un giro a tutti', 'Buy a round', 0, 'Il proprietario era in pista. Ahi.', 'The owner was on the floor. Ouch.'],
    ['Leggo gli scontrini ad alta voce', 'Read the receipts aloud', 1, 'Tre ananas e un tutù. Grande serata, la sua.', 'Three pineapples and a tutu. Quite a night.']),
  Q('police', 'Il vicino bussa: «Abbassate!». Sono le sette.', 'A neighbour knocks: “Turn it down!” It’s seven a.m.',
    ['Chiedo scusa e abbasso', 'Apologise and turn it down', 2, 'Torna in vestaglia con le brioche.', 'He returns in a dressing gown with pastries.'],
    ['«Quale musica?»', '“What music?”', 1, 'La domanda lo disarma per un minuto.', 'The question disarms him for a minute.'],
    ['Alzo', 'Turn it up', 0, 'Ora i vicini sono sei, in pigiama, armati di scope.', 'Now six neighbours, in pyjamas, with brooms.']),
  Q('mirror', 'In bagno attacchi bottone con uno simpaticissimo. È lo specchio.', 'In the loo you chat to a charming stranger. It’s the mirror.',
    ['Continuo: è un ottimo ascoltatore', 'Carry on: great listener', 2, 'Autostima ai massimi storici.', 'Self-esteem at record highs.'],
    ['Mi offendo', 'Take offence', 0, 'Se ne va nello stesso momento. Doloroso.', 'It leaves at the same moment. Painful.'],
    ['Gli chiedo in prestito il look', 'Ask to borrow the look', 1, 'Dice sì in sincrono.', 'It says yes in sync.']),
  Q('plane', 'In aereo ti chiedono se a bordo c’è un barman.', 'On the plane they ask if there’s a bartender aboard.',
    ['«Spostatevi, è il mio momento»', '“Stand aside, this is my moment”', 2, 'Salvi il carrello delle bibite. Applauso.', 'You save the drinks trolley. Applause.'],
    ['Fingo di essere un oboista', 'Pretend to be an oboist', 1, 'Chiedono un concerto.', 'They request a recital.'],
    ['Shakero il succo con la turbolenza', 'Shake juice with the turbulence', 0, 'Il comandante è arancione.', 'The captain is orange.']),
];

export const perfOf = (scores) => (scores.length ? scores.reduce((a, b) => a + b, 0) / (scores.length * 2) : 0);

export function pickQuestions(n = ROUNDS, rnd = Math.random) {
  const pool = [...QUESTIONS], out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  return out;
}

export const quizGame = {
  id: 'quiz',
  start(api) {
    const { stage, hud, ctx } = api;
    const lang = ctx.lang();
    const wrap = el('div', 'quiz');
    stage.appendChild(wrap);
    const list = pickQuestions();
    const scores = [];
    let i = 0, left = TIME, waiting = true, bar = null;
    function ask() {
      if (i >= list.length) { api.end(perfOf(scores), scores.every((s) => s === 2)); return; }
      const q = list[i];
      hud.textContent = `${i + 1}/${list.length}`;
      wrap.innerHTML = '';
      const face = el('div', 'quiz-seba'); face.innerHTML = ctx.seba('hype');
      const meter = el('div', 'bar'); bar = el('i'); meter.appendChild(bar);
      wrap.append(face, el('p', 'quiz-q', q.q[lang]), meter);
      const order = [...q.opts].sort(() => Math.random() - 0.5);
      for (const o of order) {
        const b = el('button', 'btn quiz-opt', o.label[lang]); b.type = 'button'; b.dataset.score = o.score;
        b.addEventListener('click', () => answer(o));
        wrap.appendChild(b);
      }
      left = TIME; waiting = false;
    }
    function answer(o) {
      if (waiting) return;
      waiting = true;
      scores.push(o ? o.score : 0);
      ctx.audio.sfx(o && o.score ? 'good' : 'bad');
      wrap.innerHTML = '';
      const face = el('div', 'quiz-seba'); face.innerHTML = ctx.seba(!o || !o.score ? 'disgusted' : o.score === 2 ? 'hype' : 'tipsy');
      const text = o ? o.out[lang] : { it: 'Rimani immobile finché non se ne vanno tutti.', en: 'You freeze until everyone has left.' }[lang];
      const next = el('button', 'btn primary quiz-next', ctx.t('act.done')); next.type = 'button';
      next.addEventListener('click', () => { i++; ask(); });
      wrap.append(face, el('p', 'quiz-q', text), next);
    }
    api.loop((dt) => {
      if (waiting) return;
      left -= dt;
      if (bar) bar.style.width = `${Math.max(0, (left / TIME) * 100)}%`;
      if (left <= 0) answer(null);
    });
    ask();
  },
};
