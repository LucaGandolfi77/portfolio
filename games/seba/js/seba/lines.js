/* ============================================================
   Seba — what he says, Italian and English
   ------------------------------------------------------------
   Pools by context. say() never repeats the last few lines.
   ============================================================ */
const it = {
  greet: ['Bella lì! Rieccoti, ti stavo per sostituire con un ficus.', 'Eccoti! Il bancone senza di te è solo un tavolo alto.', 'Ciao fratèl. Ho tenuto il posto caldo, letteralmente: ci ho dormito sopra.', 'Oh! La mia persona preferita dopo il corriere del ghiaccio.'],
  happy: ['Che bàgolo di giornata. Sto benone.', 'Sai fare lo spritz a occhi chiusi? Io sì. Non chiedermi com’è venuto.', 'Ho la cresta in forma. Oggi succede qualcosa.', 'Un barista felice è un barista che non ha ancora lavato i bicchieri.', 'Pensavo di aprire un bar sulla Luna. Zero atmosfera, ma parcheggio facile.', 'Ho un cliente che ordina “il solito” da tre anni. Non gli ho mai chiesto cos’è.'],
  hype: ['SBERLUCCICOOO! Chi mette la cassa?', 'Mi sento al duemila per cento. Anche di più, la matematica è chiusa.', 'Oggi si fa mattina. La mattina non lo sa ancora.', 'Dammi uno shaker e un motivo. Anzi, solo lo shaker.'],
  bored: ['Sto contando le piastrelle. Sono sempre quelle.', 'Mi annoio così tanto che ho ordinato per alfabeto le noccioline.', 'Portami fuori. O dentro. O ovunque ci sia una cassa dritta.', 'Il muro e io abbiamo esaurito gli argomenti.'],
  thirsty: ['Ho la gola come la sabbia di Rimini a mezzogiorno.', 'Un barista che muore di sete: ironico, no? Aiuto.', 'Se non bevo parlo come un modem: kkkrrr.', 'Anche acqua. Soprattutto acqua. Va bene, quasi soprattutto.'],
  smoke: ['Mi trema il baffo. Serve una pausa balcone.', 'Se non esco a fumare divento sindacalista.', 'Dov’è il pacchetto? Tasca sinistra? Quella non ce l’ho.', 'Sono nervoso come un cameriere il 31 dicembre.'],
  hungry: ['Il mio stomaco sta mixando, e mixa male.', 'Mangerei un toast, il piatto del toast e il tostapane.', 'A stomaco vuoto un drink vale doppio. Te lo dico da scienziato.', 'Kebab. Pasta. Una nonna. Qualunque cosa.'],
  sleepy: ['Chiudo solo un occhio. Poi l’altro, per par condicio.', 'Ho sonno anche nei peli.', 'Se mi parli piano mi addormento. Se mi parli forte pure.', 'Il divano mi guarda in un modo. Io ricambio.'],
  dirty: ['Il buttafuori non mi guarda: mi annusa. Brutto segno.', 'Profumo di lime, fumo e martedì.', 'Le mosche mi chiedono l’autografo.', 'Doccia? Parola forte. Però sì.'],
  tipsy: ['Ti voglio bene. Voglio bene anche a quella sedia.', 'Ho un’idea imprenditoriale: ghiaccio caldo.', 'Non sono brillo, sono luminoso.', 'Scusa, due domande: dove siamo e perché sono così bello?'],
  drunk: ['Il pavimento oggi è… molto interpretativo.', 'Chiamo la mia ex? No. Il mio ex bar.', 'Gnàc. Gnàc gnàc. Era una frase importantissima.', 'Ci sono due di te. Uno dei due mi deve dieci mance.'],
  hangover: ['Parla pianissimo. Anche i colori fanno rumore.', 'Giuro che è l’ultima volta. Fino a venerdì.', 'Ho un martello pneumatico dietro la cresta.', 'Acqua, buio, silenzio. E qualcosa di unto.'],
  cough: ['COFF. Era una risata. COFF. No, non lo era.', 'I polmoni mandano una raccomandata.', 'Magari la prossima la salto. Passami la menta.'],
  after: ['È l’alba o il tramonto? Votiamo.', 'Ho ancora la cassa nelle orecchie: tum, tum, ti voglio bene, tum.', 'Che after, zio. Ho conosciuto un pappagallo che fa il PR.', 'Non dormo. Sto solo appoggiando le palpebre.'],
  love: ['Smettila che mi sciolgo come il ghiaccio in agosto.', 'Questa è la cosa più bella dopo il turno pagato.', 'Ancora grattino. Più a sinistra. Lì. Ti assumo.'],
  poke: ['Ehi! La cresta non si tocca senza prenotazione.', 'Bip. Hai attivato il barista.', 'Solletico! Fermo! No, continua.', 'Toc toc. Chi è? Sono io, mi stai toccando.', 'Se mi tocchi ancora ti faccio pagare il coperto.'],
  acqua: ['Acqua! Il cocktail con un ingrediente solo.', 'Ahh. Il fegato manda un cuoricino.', 'Idratazione: la vera trasgressione.'],
  drink: ['Cin! Alla tua, alla mia e a quella del ficus.', 'Buono. Chi l’ha fatto? Ah, io.', 'Questo scende che è una meraviglia.', 'Ottimo. Poi un’acqua, che sono un professionista.'],
  caffe: ['Caffè! Mi si è riacceso il neon in testa.', 'Ristretto come il mio monolocale.'],
  smoked: ['Aaah. Il balcone è il mio ufficio.', 'Una e basta. È quello che dico sempre alla prima.', 'Guarda che anello di fumo. No, era una nuvola. No, un pesce.'],
  mint: ['Menta. Sa di dentista, ma ti ringrazio.', 'Mastico forte per sentirmi cattivo.', 'Se continuo così finisco per fare yoga.'],
  food: ['Mmmh. Questo toglie tre tasti alla sbornia.', 'Delizioso. Lo sposo.', 'Non parlo con la bocca piena. Mi correggo: parlo.', 'Cibo! Il grande assente di giovedì.'],
  full: ['Basta, scoppio. Il gilet chiede pietà.'],
  deo: ['Ora so di pino. Un pino molto sicuro di sé.'],
  shower: ['Schiuma! Sono un cappuccino.', 'L’acqua è calda? L’acqua è calda! Miracolo.', 'Canto sotto la doccia: tum, tum, tum.'],
  clean: ['Splendo. I buttafuori piangeranno.', 'Sono pulito come un bicchiere appena lucidato. Quasi.'],
  sleep: ['Notte. Se chiama il DJ, sveglia.', 'Cinque minuti. Cinque ore. Cinque giorni.', 'Spegni, che mi sogno il bancone infinito.'],
  wake: ['Che anno è?', 'Sono sveglio! Ho sognato che le mance crescevano sugli alberi.', 'Buongiorno. O buonasera. O buon quello che è.'],
  bucket: ['AAAH! Fredda! Ok, ok, sono vivo!'],
  passout: ['Zzz… non sono svenuto… è meditazione orizzontale…'],
  revived: ['Ho fatto un viaggio. Sul pavimento. Da domani acqua.'],
  hangoverHit: ['Ecco il conto della serata. È salato.'],
  dozed: ['Mi sono appoggiato un attimo al bancone. Era ieri.'],
  figuraccia: ['Ho appena abbracciato un attaccapanni chiamandolo capo.', 'Ho ordinato un drink a un semaforo. Era verde, ha detto sì.', 'Ho fatto un discorso. In piedi sul divano. Sulle olive.', 'Ho mandato un vocale di sette minuti al commercialista.'],
  emptyStomach: ['A stomaco vuoto vale doppio, fratèl.'],
  broke: ['Niente mance, niente festa. Facciamo un turno?', 'Il portafoglio fa eco.', 'Sono al verde. E non è la cresta.'],
  asleep: ['Zzz… torna dopo…'],
  stinky: ['Così non mi fanno entrare. Doccia prima.'],
  tired: ['Crollo. Prima si dorme.'],
  thirstyNo: ['Con la gola secca non si fa festa. Acqua.'],
  shiftGood: ['Turno da manuale! Il capo ha quasi sorriso.', 'Mance a pioggia. Sono un artista dello shaker.', 'Hai visto che polso? Brevettato.'],
  shiftBad: ['Ho messo il basilico nel caffè. Sperimentazione.', 'Il cliente ha bevuto il cocktail e poi mi ha abbracciato per compassione.', 'Domani meglio. Oggi: peggio.'],
  gameGood: ['Leggenda! Chiamate i giornali.', 'Visto? Sono nato per questo.', 'Più bello di così si muore. Non lo faccio, ma si muore.'],
  gameBad: ['Colpa delle scarpe. Non porto scarpe.', 'Era un riscaldamento. Lunghissimo.', 'Facciamo finta di niente e rifacciamo.'],
  raveStart: ['La cassa! La sento nel baffo!', 'Siamo in lista. Credo. Ho detto che sono il nipote del DJ.'],
  raveEnd: ['È finito? Ma io avevo appena iniziato da sei ore.', 'Non sento più niente. Bellissimo.'],
  flight: ['Decollo! Ho portato lo shaker nel bagaglio a mano.', 'Posto finestrino, peli sul sedile, partiamo.'],
  home: ['Casa. Il mio frigorifero mi è mancato più delle persone.'],
  outfit: ['Mamma mia che figurino.', 'Con questo entro ovunque. Tranne in banca.', 'Mi guardo allo specchio e mi chiedo il numero.'],
  level: ['Sono salito di livello! Ora so fare due cose insieme.'],
  achievement: ['Medaglia! La metto sul gilet.'],
};

const en = {
  greet: ['Yo! You’re back, I was about to replace you with a rubber plant.', 'There you are! Without you the counter is just a tall table.', 'Hi, mate. I kept your seat warm: I slept on it.', 'Oh! My favourite human after the ice delivery guy.'],
  happy: ['What a cracking day. I’m grand.', 'Can you make a spritz blindfolded? I can. Don’t ask how it came out.', 'My crest is in shape. Something’s happening today.', 'A happy bartender is one who hasn’t washed the glasses yet.', 'I might open a bar on the Moon. No atmosphere, easy parking.', 'A regular has ordered “the usual” for three years. I never asked what it is.'],
  hype: ['SPARKLEEE! Who’s on the decks?', 'I’m at two thousand percent. More, maths is closed.', 'We’re seeing the morning. The morning doesn’t know yet.', 'Give me a shaker and a reason. Actually, just the shaker.'],
  bored: ['I’m counting tiles. Same ones as before.', 'I’m so bored I alphabetised the peanuts.', 'Take me out. Or in. Anywhere with a kick drum.', 'The wall and I have run out of topics.'],
  thirsty: ['My throat is Rimini sand at noon.', 'A bartender dying of thirst: ironic, no? Help.', 'No drink and I talk like a modem: kkkrrr.', 'Even water. Especially water. Fine, nearly especially.'],
  smoke: ['My moustache is twitching. Balcony break.', 'If I don’t step out for a smoke I’ll join a union.', 'Where’s the packet? Left pocket? I don’t have one.', 'I’m as twitchy as a waiter on New Year’s Eve.'],
  hungry: ['My stomach is mixing, and badly.', 'I’d eat a toastie, its plate and the toaster.', 'On an empty stomach a drink counts double. Science.', 'Kebab. Pasta. A grandmother. Anything.'],
  sleepy: ['Closing just one eye. Then the other, to be fair.', 'Even my fur is sleepy.', 'Talk softly and I’ll nod off. Talk loudly, same.', 'The sofa is looking at me. I’m looking back.'],
  dirty: ['The bouncer isn’t looking at me, he’s sniffing. Bad sign.', 'Eau de lime, smoke and Tuesday.', 'Flies ask for my autograph.', 'Shower? Strong word. But yes.'],
  tipsy: ['I love you. I also love that chair.', 'Business idea: warm ice.', 'I’m not tipsy, I’m luminous.', 'Two questions: where are we and why am I this handsome?'],
  drunk: ['The floor is very… open to interpretation today.', 'Should I call my ex? No. My ex bar.', 'Gnack. Gnack gnack. That was a crucial sentence.', 'There are two of you. One owes me ten tips.'],
  hangover: ['Whisper. Even colours are loud.', 'Never again. Until Friday.', 'There’s a jackhammer behind my crest.', 'Water, dark, silence. And something greasy.'],
  cough: ['COFF. That was a laugh. COFF. It was not.', 'My lungs are sending a registered letter.', 'Maybe I’ll skip the next one. Pass the mint.'],
  after: ['Dawn or dusk? Let’s vote.', 'The kick is still in my ears: boom, boom, love you, boom.', 'What an after. I met a parrot who does PR.', 'I’m not sleeping. I’m resting my eyelids.'],
  love: ['Stop, I’m melting like August ice.', 'Best thing since a paid shift.', 'More scratches. Left a bit. There. You’re hired.'],
  poke: ['Oi! The crest is by appointment only.', 'Beep. You have activated the bartender.', 'Tickles! Stop! No, carry on.', 'Knock knock. Who’s there? Me, you’re poking me.', 'Poke me again and there’s a cover charge.'],
  acqua: ['Water! The one-ingredient cocktail.', 'Ahh. My liver sends a heart.', 'Hydration: the real rebellion.'],
  drink: ['Cheers! To you, me and the rubber plant.', 'Lovely. Who made this? Oh, me.', 'That one goes down a treat.', 'Great. Then a water, I’m a professional.'],
  caffe: ['Coffee! My head neon is back on.', 'As short as my studio flat.'],
  smoked: ['Aaah. The balcony is my office.', 'Just the one. I always say that to the first.', 'Look at that smoke ring. No, a cloud. No, a fish.'],
  mint: ['Mint. Tastes of dentist, but cheers.', 'Chewing hard to feel dangerous.', 'At this rate I’ll take up yoga.'],
  food: ['Mmm. That knocks three notches off the hangover.', 'Delicious. I’ll marry it.', 'I don’t talk with my mouth full. Correction: I do.', 'Food! Thursday’s great absentee.'],
  full: ['Enough, I’ll burst. The vest begs for mercy.'],
  deo: ['Now I smell of pine. A very confident pine.'],
  shower: ['Foam! I’m a cappuccino.', 'Is the water hot? It’s hot! Miracle.', 'Shower singing: boom, boom, boom.'],
  clean: ['I shine. Bouncers will weep.', 'Clean as a freshly polished glass. Nearly.'],
  sleep: ['Night. If the DJ calls, wake me.', 'Five minutes. Five hours. Five days.', 'Lights off, I’m off to dream of the endless counter.'],
  wake: ['What year is it?', 'I’m up! I dreamt tips grew on trees.', 'Good morning. Or evening. Or good whatever.'],
  bucket: ['AAAH! Cold! OK, OK, I’m alive!'],
  passout: ['Zzz… not passed out… horizontal meditation…'],
  revived: ['I went on a journey. On the floor. Water from tomorrow.'],
  hangoverHit: ['Here’s the bill for last night. Steep.'],
  dozed: ['I leaned on the counter for a second. That was yesterday.'],
  figuraccia: ['I just hugged a coat stand and called it boss.', 'I ordered a drink from a traffic light. It was green, it said yes.', 'I gave a speech. Standing on the sofa. About olives.', 'I sent my accountant a seven-minute voice note.'],
  emptyStomach: ['Empty stomach: counts double, mate.'],
  broke: ['No tips, no party. Shall we do a shift?', 'My wallet echoes.', 'I’m skint. Even the crest dye is gone.'],
  asleep: ['Zzz… come back later…'],
  stinky: ['They won’t let me in like this. Shower first.'],
  tired: ['I’m crashing. Sleep first.'],
  thirstyNo: ['No party on a dry throat. Water.'],
  shiftGood: ['Textbook shift! The boss almost smiled.', 'It’s raining tips. I’m a shaker artist.', 'See that wrist? Patented.'],
  shiftBad: ['I put basil in a coffee. Experimental.', 'The customer drank it and hugged me out of pity.', 'Better tomorrow. Today: worse.'],
  gameGood: ['Legend! Call the papers.', 'See? Born for this.', 'It doesn’t get better. Honestly.'],
  gameBad: ['Blame my shoes. I don’t wear shoes.', 'That was a warm-up. A very long one.', 'Let’s pretend nothing happened and go again.'],
  raveStart: ['The kick! I feel it in my moustache!', 'We’re on the list. I think. I said I’m the DJ’s nephew.'],
  raveEnd: ['Over? I only started six hours ago.', 'Can’t hear a thing. Beautiful.'],
  flight: ['Take-off! The shaker is in my hand luggage.', 'Window seat, fur on the cushion, off we go.'],
  home: ['Home. I missed my fridge more than people.'],
  outfit: ['Goodness, what a dish.', 'In this I get in anywhere. Except a bank.', 'I look in the mirror and ask for my number.'],
  level: ['Levelled up! I can now do two things at once.'],
  achievement: ['A medal! It goes on the vest.'],
};

/** Things Seba got up to while the app was closed. */
const awayIt = ['Ho insegnato al ficus a dire “offro io”. Non ha imparato.', 'Ho riordinato le bottiglie per simpatia.', 'È passato un signore a chiedere indicazioni. È rimasto tre ore.', 'Ho provato un cocktail nuovo. La ricetta è andata persa, per fortuna.', 'Ho ballato da solo davanti al frigorifero. Lui faceva le luci.', 'Ho fatto la conta delle mance quattro volte. Quattro risultati.', 'Ho litigato col piccione del balcone. Ha vinto ai punti.', 'Ho scritto un singolo: si chiama “Ghiaccio”. È tutto silenzio.'];
const awayEn = ['I taught the rubber plant to say “my round”. It didn’t learn.', 'I sorted the bottles by personality.', 'A man stopped to ask directions. He stayed three hours.', 'I invented a cocktail. The recipe is lost, luckily.', 'I danced alone in front of the fridge. It did the lights.', 'I counted the tips four times. Four results.', 'I argued with the balcony pigeon. He won on points.', 'I wrote a single called “Ice”. It’s all silence.'];

export const LINES = { it: { ...it, away: awayIt }, en: { ...en, away: awayEn } };

const recent = [];
export function say(lang, key, rnd = Math.random) {
  const pool = (LINES[lang] || LINES.en)[key];
  if (!pool || !pool.length) return '';
  const free = pool.filter((l) => !recent.includes(l));
  const from = free.length ? free : pool;
  const line = from[Math.floor(rnd() * from.length)];
  recent.push(line);
  if (recent.length > 12) recent.shift();
  return line;
}
