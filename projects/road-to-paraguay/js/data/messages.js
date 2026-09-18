/**
 * messages.js — TUTTI I TESTI DELL'APP.
 *
 * Questo è l'unico file da toccare per cambiare i contenuti: nessuna logica qui dentro.
 *
 * Come è organizzato: ogni messaggio è agganciato a `day`, la POSIZIONE della casella
 * nel calendario. La posizione non è una data scritta a mano: le date le calcola il
 * dispositivo (src/utils/dates.ts) e l'ultima casella è sempre il 17 ottobre.
 *
 *   day 1  -> può essere il 17 settembre, se il diario viene aperto quel giorno
 *   day 2  -> 18 settembre (il percorso classico comincia qui)
 *   day 30 -> la vigilia, 16 ottobre
 *   day 31 -> il 17 ottobre, il gran finale
 *
 * Il calendario usa 30 caselle (2..31) nel percorso classico e 31 caselle (1..31)
 * se si apre il diario un giorno prima. Per questo i messaggi sono 31: nessuna
 * giornata resta senza il suo testo.
 */

export const MESSAGE_TYPE_LABEL = {
  motivation: 'Per te',
  poem: 'Poesia breve',
  thought: 'Un pensiero',
  funny: 'Livello di oggi',
};

export const messages = [
  {
    day: 1,
    type: 'motivation',
    title: 'Il diario si apre',
    message:
      'Questa è la prima pagina. Da qui al 17 ottobre troverai una casella al giorno: aprine una sola, con calma, come si sfoglia un quaderno che nessuno ha mai letto. In fondo a questo quaderno c’è il Paraguay.',
    emoji: '📖',
    ritual: 'Respira. Metti giù le spalle. Ricorda perché hai iniziato.',
  },
  {
    day: 2,
    type: 'motivation',
    title: 'Otto ruote, una squadra',
    message:
      'Siamo il Monza Precision Team, e quest’anno tocca a noi portare l’Italia in pista. Otto ruote, una musica, una traiettoria sola: non serve aprirle tutte di fila, le cose belle si gustano una alla volta.',
    emoji: '✨',
    ritual: 'Una mano sul petto. Otto respiri lenti, uno per ogni ruota.',
  },
  {
    day: 3,
    type: 'thought',
    title: 'Le quattro ruote',
    message:
      'Quattro ruote per piede, otto in tutto per una sola persona. Eppure la cosa più difficile non è tenerle in equilibrio: è fidarsi di chi ti sta accanto.',
    emoji: '🛼',
    ritual: 'Chiudi gli occhi e resta in equilibrio su una gamba. Fidati un secondo in più del solito.',
  },
  {
    day: 4,
    type: 'motivation',
    title: 'Il primo giro',
    message:
      'I primi minuti in pista sono sempre i più duri: le gambe rigide, la musica che sembra troppo veloce. Poi il corpo si ricorda cosa fare. Dagli tempo.',
    emoji: '🎧',
    ritual: 'Resisti dieci secondi in più. Poi il corpo sa già cosa fare.',
  },
  {
    day: 5,
    type: 'funny',
    title: 'Referto di oggi',
    message:
      'Stato attuale: gambe ufficialmente non mie, ma sorriso ancora in funzione. Le ruote hanno vinto, noi abbiamo fatto finta di niente. 🛼',
    emoji: '😅',
    ritual: 'Sorridi e mettiti in equilibrio. Se stai ridendo, il referto è positivo.',
  },
  {
    day: 6,
    type: 'thought',
    title: 'La caduta utile',
    message:
      'Cadi sempre nello stesso punto della coreografia? Quel punto ti sta dicendo qualcosa. Ascoltalo invece di odiarlo.',
    emoji: '💭',
    ritual: 'Torna col pensiero al punto esatto della caduta. Ringrazialo in silenzio, poi riparti.',
  },
  {
    day: 7,
    type: 'poem',
    title: 'Otto ruote',
    message: 'Otto ruote,\nuna musica,\nmille respiri,\nun solo cuore:\nda Monza al mondo.',
    emoji: '💗',
    ritual: 'Un respiro per ogni verso. Non avere fretta che la poesia finisca.',
  },
  {
    day: 8,
    type: 'motivation',
    title: 'La parte invisibile',
    message:
      'La pista ricorderà tutti gli allenamenti che nessuno ha visto. Anche quelli di martedì, quando eri stanca e sei venuta lo stesso.',
    emoji: '🌙',
    ritual: 'Un minuto a luci spente. Nel buio si vedono meglio le cose che nessuno ha guardato.',
  },
  {
    day: 9,
    type: 'thought',
    title: 'Sincronizzare',
    message:
      'Sincronizzarsi non significa muoversi nello stesso momento. Significa imparare a sentirsi, anche a occhi chiusi, anche quando la musica va veloce. Ed è quello che ci porterà in Paraguay.',
    emoji: '🎶',
    ritual: 'Appoggia una mano sulla spalla di chi hai accanto. Quel segnale vale più di mille parole.',
  },
  {
    day: 10,
    type: 'motivation',
    title: 'Il costume',
    message:
      'Il costume non è un vestito: è la promessa che quello che provi in allenamento vale la pena di essere visto. Indossalo come una dichiarazione.',
    emoji: '🎀',
    ritual: 'Raddrizza le spalle davanti allo specchio. Così sembri già in pista, in Paraguay.',
  },
  {
    day: 11,
    type: 'funny',
    title: 'Statistica seria',
    message:
      'Ricerca scientifica condotta su di me: il 90% delle mie cadute avviene davanti a qualcuno. Il restante 10% davanti alla persona che volevo impressionare.',
    emoji: '🙃',
    ritual: 'Fai un passo elegante, adesso che nessuno guarda. Conservalo per quando servirà.',
  },
  {
    day: 12,
    type: 'motivation',
    title: 'Le mani',
    message:
      'C’è un momento, prima che parta la musica, in cui vi prendete per mano. È lì che la squadra smette di essere un elenco di nomi.',
    emoji: '🤝',
    ritual: 'Stringi per un secondo la mano di chi hai accanto. La squadra comincia così.',
  },
  {
    day: 13,
    type: 'thought',
title: 'Prima di entrare',
    message:
      'Quell’ansia nello stomaco prima di esibirti non è il tuo nemico. È il tuo corpo che ti dice che tieni davvero a questa cosa.',
    emoji: '🫧',
    ritual: 'Mani sullo stomaco, un respiro profondo. L’ansia segue il respiro, non il contrario.',
  },
  {
    day: 14,
    type: 'motivation',
    title: 'Il dettaglio',
    message:
      'Un braccio più alto di due centimetri. Uno sguardo tre secondi prima. Sono i dettagli che nessuno nota e che fanno sembrare tutto facile.',
    emoji: '🪞',
    ritual: 'Alza le braccia di due centimetri. Ora che sai com’è fatto, portalo con te.',
  },
  {
    day: 15,
    type: 'poem',
    title: 'Prove',
    message: 'La pista è vuota,\nla musica no.\nContiamo otto,\npoi ancora, poi ancora —\nfinché non diventa respiro.',
    emoji: '🎵',
    ritual: 'Conta otto battiti in silenzio. Poi ricomincia da uno, più piano.',
  },
  {
    day: 16,
    type: 'motivation',
title: 'Rialzarsi',
    message:
      'Cadi, ti rialzi, continui. È la stessa storia di ogni pista. Non è la caduta che conta: è la velocità con cui decidi di ricominciare.',
    emoji: '🌱',
    ritual: 'Accovacciati e rialzati con calma. Pensa a quante volte l’hai già fatto senza pensarci.',
  },
  {
    day: 17,
    type: 'thought',
title: 'Il rumore delle ruote',
    message:
      'Il rumore delle ruote in pista ha un ritmo tutto suo. Occhi chiusi, puoi sentire dove sono tutti, senza guardare.',
    emoji: '🌀',
    ritual: 'Chiudi gli occhi e ascolta. Da qualche parte, delle ruote stanno girando.',
  },
  {
    day: 18,
    type: 'funny',
title: 'Comunicazione ufficiale',
    message:
      'Comunicato: dopo approfondita analisi, si è stabilito che la posizione corretta dei piedi è colei che al momento sembra la più sbagliata.',
    emoji: '📋',
    ritual: 'Fai dieci secondi di glissata sul pavimento di casa. Il ricorso è respinto: la glissata no.',
  },
  {
    day: 19,
    type: 'motivation',
title: 'La compagna',
    message:
      'C’è quella che ti aspetta quando sbagli, quella che corre a chiederti se stai bene quando cadi, quella che grida più forte di tutte. Ricordati di essere anche tu una di quelle.',
    emoji: '💫',
    ritual: 'Pensa a chi ti dice la verità. Domani, grazie senza spiegazioni.',
  },
  {
    day: 20,
    type: 'thought',
title: 'Sbagliare insieme',
    message:
      'La perfezione non è mai stata il punto. Succede di sbagliare, che si ricomincia, che insieme si va comunque avanti.',
    emoji: '🌷',
    ritual: 'Fai un errore di proposito e sorridi. Le ruote sono intatte: non è successo nulla.',
  },
  {
    day: 21,
    type: 'motivation',
title: 'Disciplina',
    message:
      'La disciplina non è chiederti di più ogni giorno. È mostrarti che le cose si costruiscono un piccolo gesto alla volta.',
    emoji: '🕰️',
    ritual: 'Un gesto piccolo, ripetuto, fatto bene. Le ruote si ricordano delle ripetizioni.',
  },
  {
    day: 22,
    type: 'poem',
    title: 'Traiettorie',
    message: 'Le ruote disegnano\ncurve che nessuno conserva.\nSolo la pista\nsa quante volte\nhai ricominciato.',
    emoji: '🌙',
    ritual: 'Traccia una curva nell’aria con un dito. È lì che si vede chi ha ricominciato.',
  },
  {
    day: 23,
    type: 'motivation',
    title: 'Il fischio',
    message:
      'Quando il fischio interrompe la musica non è un giudizio. È solo la possibilità di rifarlo meglio, e le seconde possibilità sono un regalo.',
    emoji: '📣',
    ritual: 'Ripeti una cosa che oggi è venuta male. Solo una volta, ma fatta bene.',
  },
  {
    day: 24,
    type: 'thought',
    title: 'Il dietro le quinte',
    message:
      'Nessuno fotografa il corridoio, i capelli da rifare, le scarpe slacciate, le risate nervose. Eppure è lì che succede la parte più bella.',
    emoji: '🎭',
    ritual: 'Guarda le tue mani, le scarpe, i capelli. C’è bellezza anche dietro le quinte.',
  },
  {
    day: 25,
    type: 'funny',
    title: 'Diagnosi',
    message:
      'Sintomi rilevati: canticchio la coreografia sotto la doccia e conto gli otto mentre mi lavo i denti. Prognosi: irreversibile. 🛼',
    emoji: '🪥',
    ritual: 'Canticchia la coreografia e conta gli otto. Diagnosi: non si torna più indietro.',
  },
  {
    day: 26,
    type: 'motivation',
    title: 'Il palco più grande',
    message:
      'Il palco non è il posto dove ti giudicano. È il posto dove per tre minuti tutto quello che hai provato diventa visibile. E stavolta quel palco è un Mondiale.',
    emoji: '⭐',
    ritual: 'Fermati un istante e fissa il punto del palco. È più grande di te, eppure lo riempi tu.',
  },
  {
    day: 27,
    type: 'thought',
    title: 'Applausi',
    message:
      'Gli applausi durano pochi secondi. Il modo in cui ti sei sentita mentre li ricevevi, invece, te lo porti dietro per anni. Chissà che effetto fa sentirli in un’altra lingua.',
    emoji: '👏',
    ritual: 'Batti le mani tre volte, da solo. Poi saprai che suono farà quando arriverà.',
  },
  {
    day: 4,
    anchor: 'end',
    type: 'motivation',
    title: 'La valigia',
    message:
      'Nel bagaglio ci finiranno il costume, le ruote di scorta e un po’ di casa. Nell’ultimo giro di una prova si vede chi sei davvero: quando le gambe non ci sono più e decidi comunque di finire con eleganza.',
    emoji: '🔥',
    ritual: 'Prepara una cosa sola, con calma. La valigia comincia dalla prima cosa.',
  },
  {
    day: 3,
    anchor: 'end',
    type: 'poem',
    title: 'Vigilia',
    message: 'Domani\nla musica sarà più forte,\nle mani più sudate,\nil cuore più veloce.\nUn’altra lingua\nper dire il nostro nome.\nE andrà bene così.',
    emoji: '🕯️',
    ritual: 'Soffia via l’aria di stasera. Domani se ne sarà già andata da sola.',
  },
  {
    day: 2,
    anchor: 'end',
    type: 'thought',
    title: 'La notte prima',
    message:
      'Stanotte dormi. Domani non dovrai essere perfetta: dovrai solo esserci, con tutto quello che hai imparato e con le tue compagne accanto. Il resto lo fa la squadra. Il resto lo siamo noi.',
    emoji: '🌠',
    ritual: 'Un respiro lungo. Le spalle giù. Le ruote sono già pronte.',
  },
  {
    day: 1,
    anchor: 'end',
    type: 'motivation',
    title: '17 ottobre · Campionati del Mondo',
    message:
      'Monza, l’Italia, il Paraguay. Il Monza Precision Team in pista. Tutti gli allenamenti, le cadute, le prove rifatte, le risate in corridoio: oggi diventano una sola cosa. Entra in pista con le tue compagne e goditela tutta. 🛼✨',
    emoji: '🏆',
    ritual: 'Respira. Guarda le tue compagne. Sorridi. È il vostro momento.',
  },
];

/**
 * Trova il messaggio di una casella. È l'unico modo corretto di leggerli:
 * il calendario può avere 30 o 31 caselle, e le due finali sono ancorate alla fine.
 *
 * @param index posizione della casella (1-based)
 * @param total numero totale di caselle del calendario visualizzato
 */
export function findMessage(index, total) {
  return messages.find((m) =>
    (m.anchor ?? 'start') === 'end' ? total - m.day + 1 === index : m.day === index,
  );
}

/**
 * Rituale di riserva, usato come micro-rituale per le caselle che non ne hanno
 * uno scritto apposta: così ogni prima apertura ha comunque il suo momento lento.
 */
export const FALLBACK_RITUAL = 'Fermati un istante. Un respiro profondo. Poi si riparte.';

/** Frasi simpatiche quando si prova ad aprire una casella futura. */
export const LOCKED_LINES = [
  'Ehi, piano! Questa sorpresa non è ancora pronta per te 🛼✨',
  'Ancora un pochino… lascia che l’attesa faccia il suo lavoro 💗',
  'Le ruote non girano avanti veloce. Nemmeno tu. ⏳',
  'Questa casella è ancora in prova generale. 🎭',
  'Il nastro è ancora da annodare. Torna domani. 🎀',
  'Shhh. Sta ancora scaldando la musica. 🎧',
  'Non barare: il bello è arrivarci un giorno alla volta. 🌙',
];

/**
 * NOTA: le frasi ambientali, il footer e i testi del gran finale stanno in
 * `js/data/event.js`, insieme a tutto ciò che riguarda la competizione
 * (nome dell'evento, squadra, nazione, luogo).
 */

/** Frasi che compaiono per un attimo durante il loading iniziale. */
export const INTRO_LINES = [
  'Sto allacciando le ruote…',
  'Conto gli otto…',
  'Accendo le lucine…',
  'Sto preparando la pista…',
  'Sto cercando il Paraguay sulla mappa…',
];

/** Piccole confessioni mostrate quando si scopre un easter egg. */
export const EGG_LINES = [
  'Le ruote scricchiolano: hai trovato il primo segreto. 🛼',
  'Il nastro si è sciolto e ha lasciato cadere un po’ di glitter. 🎀',
  'Ok, hai vinto. Solo per oggi: modalità glitter attiva. ✨',
  'Il pattino ti ha sussurrato una cosa: «continua così». 💬',
  'Stellina trovata. Nessuno lo saprà mai. ⭐',
  'Il Monza Precision Team approva questo segreto. 🇮🇹',
];
