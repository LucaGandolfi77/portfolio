/**
 * messages.ts — TUTTI I TESTI DELL'APP.
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

export type MessageType = 'motivation' | 'poem' | 'thought' | 'funny';

export interface DailyMessage {
  /**
   * Posizione nel calendario: 1..31.
   *
   * Nella maggior parte dei casi è una posizione assoluta (dall'inizio del
   * percorso). Le due caselle finali usano invece `anchor: 'end'`, così restano
   * l'ultima e la penultima qualunque sia la lunghezza del calendario.
   */
  day: number;
  /**
   * 'start' (predefinito): la casella numero `day` dall'inizio.
   * 'end': la casella a `day` posizioni dalla fine (1 = ultima).
   *
   * Serve perché il calendario ha 30 caselle nel percorso classico e 31 se si
   * apre il diario il 17 settembre: il gran finale deve essere sempre l'ultimo.
   */
  anchor?: 'start' | 'end';
  type: MessageType;
  /** Riga breve in maiuscoletto sopra il testo. */
  title: string;
  /** Il contenuto vero e proprio. Per le poesie usa \n per andare a capo. */
  message: string;
  emoji?: string;
  /**
   * Micro-rituale mostrato solo la primissima volta che si apre questa casella,
   * prima del messaggio. Pochi secondi, poi lascia spazio al testo.
   */
  ritual?: string;
}

export const MESSAGE_TYPE_LABEL: Record<MessageType, string> = {
  motivation: 'Per te',
  poem: 'Poesia breve',
  thought: 'Un pensiero',
  funny: 'Livello di oggi',
};

export const messages: DailyMessage[] = [
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
  },
  {
    day: 3,
    type: 'thought',
    title: 'Le quattro ruote',
    message:
      'Quattro ruote per piede, otto in tutto per una sola persona. Eppure la cosa più difficile non è tenerle in equilibrio: è fidarsi di chi ti sta accanto.',
    emoji: '🛼',
  },
  {
    day: 4,
    type: 'motivation',
    title: 'Il primo giro',
    message:
      'I primi minuti in pista sono sempre i più duri: le gambe rigide, la musica che sembra troppo veloce. Poi il corpo si ricorda cosa fare. Dagli tempo.',
    emoji: '🎧',
  },
  {
    day: 5,
    type: 'funny',
    title: 'Referto di oggi',
    message:
      'Stato attuale: gambe ufficialmente non mie, ma sorriso ancora in funzione. Le ruote hanno vinto, noi abbiamo fatto finta di niente. 🛼',
    emoji: '😅',
  },
  {
    day: 6,
    type: 'thought',
    title: 'La caduta utile',
    message:
      'Cadi sempre nello stesso punto della coreografia? Quel punto ti sta dicendo qualcosa. Ascoltalo invece di odiarlo.',
    emoji: '💭',
  },
  {
    day: 7,
    type: 'poem',
    title: 'Otto ruote',
    message: 'Otto ruote,\nuna musica,\nmille respiri,\nun solo cuore:\nda Monza al mondo.',
    emoji: '💗',
  },
  {
    day: 8,
    type: 'motivation',
    title: 'La parte invisibile',
    message:
      'La pista ricorderà tutti gli allenamenti che nessuno ha visto. Anche quelli di martedì, quando eri stanca e sei venuta lo stesso.',
    emoji: '🌙',
  },
  {
    day: 9,
    type: 'thought',
    title: 'Sincronizzare',
    message:
      'Sincronizzarsi non significa muoversi nello stesso momento. Significa imparare a sentirsi, anche a occhi chiusi, anche quando la musica va veloce. Ed è quello che ci porterà in Paraguay.',
    emoji: '🎶',
  },
  {
    day: 10,
    type: 'motivation',
    title: 'Il costume',
    message:
      'Il costume non è un vestito: è la promessa che quello che provi in allenamento vale la pena di essere visto. Indossalo come una dichiarazione.',
    emoji: '🎀',
  },
  {
    day: 11,
    type: 'funny',
    title: 'Statistica seria',
    message:
      'Ricerca scientifica condotta su di me: il 90% delle mie cadute avviene davanti a qualcuno. Il restante 10% davanti alla persona che volevo impressionare.',
    emoji: '🙃',
  },
  {
    day: 12,
    type: 'motivation',
    title: 'Le mani',
    message:
      'C’è un momento, prima che parta la musica, in cui vi prendete per mano. È lì che la squadra smette di essere un elenco di nomi.',
    emoji: '🤝',
  },
  {
    day: 13,
    type: 'thought',
    title: 'Prima di entrare',
    message:
      'Quell’ansia nello stomaco prima di esibirsi non è il tuo nemico. È il tuo corpo che ti dice che tieni davvero a questa cosa.',
    emoji: '🫧',
  },
  {
    day: 14,
    type: 'motivation',
    title: 'Il dettaglio',
    message:
      'Un braccio più alto di due centimetri. Uno sguardo tre secondi prima. Sono i dettagli che nessuno nota e che fanno sembrare tutto facile.',
    emoji: '🪞',
  },
  {
    day: 15,
    type: 'poem',
    title: 'Prove',
    message: 'La pista è vuota,\nla musica no.\nContiamo otto,\npoi ancora, poi ancora —\nfinché non diventa respiro.',
    emoji: '🎵',
  },
  {
    day: 16,
    type: 'motivation',
    title: 'Rialzarsi',
    message:
      'Ogni caduta che hai preso è diventata parte della persona che oggi sa rialzarsi senza pensarci. Non è un dettaglio da poco.',
    emoji: '🌱',
  },
  {
    day: 17,
    type: 'thought',
    title: 'Il rumore delle ruote',
    message:
      'C’è un suono che riconosceresti ovunque, anche a occhi chiusi, anche in mezzo alla strada: quello delle ruote che girano tutte insieme.',
    emoji: '🌀',
  },
  {
    day: 18,
    type: 'funny',
    title: 'Comunicazione ufficiale',
    message:
      'Comunico ufficialmente che le mie gambe hanno presentato ricorso contro l’allenamento di oggi. Il ricorso è stato respinto per motivi di coreografia.',
    emoji: '📋',
  },
  {
    day: 19,
    type: 'motivation',
    title: 'La compagna',
    message:
      'Prima o poi troverai qualcuno che ti guarda mentre provi e ti dice la verità. Tienitela stretta: vale più di cento complimenti.',
    emoji: '💫',
  },
  {
    day: 20,
    type: 'thought',
    title: 'Sbagliare insieme',
    message:
      'Sbagliare insieme è meno grave che sbagliare da soli. Si ride, si rifà, e alla fine viene meglio di come l’avevate immaginata.',
    emoji: '🌷',
  },
  {
    day: 21,
    type: 'motivation',
    title: 'Disciplina',
    message:
      'La disciplina non è rigidità. È la forma d’amore più concreta che puoi dare a un sogno che non sa ancora di riuscire. Il nostro sogno, quest’anno, ha una data e un posto sulla mappa.',
    emoji: '🕰️',
  },
  {
    day: 22,
    type: 'poem',
    title: 'Traiettorie',
    message: 'Le ruote disegnano\ncurve che nessuno conserva.\nSolo la pista\nsa quante volte\nhai ricominciato.',
    emoji: '🌙',
  },
  {
    day: 23,
    type: 'motivation',
    title: 'Il fischio',
    message:
      'Quando il fischio interrompe la musica non è un giudizio. È solo la possibilità di rifarlo meglio, e le seconde possibilità sono un regalo.',
    emoji: '📣',
  },
  {
    day: 24,
    type: 'thought',
    title: 'Il dietro le quinte',
    message:
      'Nessuno fotografa il corridoio, i capelli da rifare, le scarpe slacciate, le risate nervose. Eppure è lì che succede la parte più bella.',
    emoji: '🎭',
  },
  {
    day: 25,
    type: 'funny',
    title: 'Diagnosi',
    message:
      'Sintomi rilevati: canticchio la coreografia sotto la doccia e conto gli otto mentre mi lavo i denti. Prognosi: irreversibile. 🛼',
    emoji: '🪥',
  },
  {
    day: 26,
    type: 'motivation',
    title: 'Il palco più grande',
    message:
      'Il palco non è il posto dove ti giudicano. È il posto dove per tre minuti tutto quello che hai provato diventa visibile. E stavolta quel palco è un Mondiale.',
    emoji: '⭐',
  },
  {
    day: 27,
    type: 'thought',
    title: 'Applausi',
    message:
      'Gli applausi durano pochi secondi. Il modo in cui ti sei sentita mentre li ricevevi, invece, te lo porti dietro per anni. Chissà che effetto fa sentirli in un’altra lingua.',
    emoji: '👏',
  },
  {
    day: 4,
    anchor: 'end',
    type: 'motivation',
    title: 'La valigia',
    message:
      'Nel bagaglio ci finiranno il costume, le ruote di scorta e un po’ di casa. Nell’ultimo giro di una prova si vede chi sei davvero: quando le gambe non ci sono più e decidi comunque di finire con eleganza.',
    emoji: '🔥',
  },
  {
    day: 3,
    anchor: 'end',
    type: 'poem',
    title: 'Vigilia',
    message: 'Domani\nla musica sarà più forte,\nle mani più sudate,\nil cuore più veloce.\nUn’altra lingua\nper dire il nostro nome.\nE andrà bene così.',
    emoji: '🕯️',
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
export function findMessage(index: number, total: number): DailyMessage | undefined {
  return messages.find((m) =>
    (m.anchor ?? 'start') === 'end' ? total - m.day + 1 === index : m.day === index,
  );
}

/**
 * Rituale di riserva, usato come micro-rituale per le caselle che non ne hanno
 * uno scritto apposta: così ogni prima apertura ha comunque il suo momento lento.
 */
export const FALLBACK_RITUAL = 'Respira. Metti giù le spalle. Ricorda perché hai iniziato.';

/** Frasi simpatiche quando si prova ad aprire una casella futura. */
export const LOCKED_LINES: string[] = [
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
 * `src/data/event.ts`, insieme a tutto ciò che riguarda la competizione
 * (nome dell'evento, squadra, nazione, luogo).
 */

/** Frasi che compaiono per un attimo durante il loading iniziale. */
export const INTRO_LINES: string[] = [
  'Sto allacciando le ruote…',
  'Conto gli otto…',
  'Accendo le lucine…',
  'Sto preparando la pista…',
  'Sto cercando il Paraguay sulla mappa…',
];

/** Piccole confessioni mostrate quando si scopre un easter egg. */
export const EGG_LINES: string[] = [
  'Le ruote scricchiolano: hai trovato il primo segreto. 🛼',
  'Il nastro si è sciolto e ha lasciato cadere un po’ di glitter. 🎀',
  'Ok, hai vinto. Solo per oggi: modalità glitter attiva. ✨',
  'Il pattino ti ha sussurrato una cosa: «continua così». 💬',
  'Stellina trovata. Nessuno lo saprà mai. ⭐',
  'Il Monza Precision Team approva questo segreto. 🇮🇹',
];
