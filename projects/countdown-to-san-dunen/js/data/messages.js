/**
 * messages.js — TUTTI I TESTI DELLE CASELLE.
 *
 * Questo è l'unico file da toccare per cambiare i contenuti: nessuna logica qui dentro.
 *
 * Ogni messaggio è agganciato a `offset`, cioè al numero che vedi sulla casella:
 *
 *   offset: -30  ->  9 settembre, il primo giorno di countdown
 *   offset: -15  ->  24 settembre, metà strada
 *   offset:   -1  ->  8 ottobre, la vigilia
 *   offset:    0  ->  9 ottobre, SAN DUNÉN
 *
 * Il calendario parte dal 9 settembre e finisce il 9 ottobre: 31 caselle.
 *
 * Ogni casella ha anche un `ritual`: la frase breve che compare per pochi secondi
 * alla prima apertura, prima del messaggio. Sono tutti diversi, uno per giorno.
 * Devono restare CORTI (sotto i ~90 caratteri): stanno a schermo 3,4 secondi.
 */

export const MESSAGE_TYPE_LABEL = {
  motivation: 'Ordine del giorno',
  poem: 'Poesia da osteria',
  thought: 'Pensiero torbido',
  funny: 'Referto',
};

export const messages = [
  {
    offset: -30,
    type: 'funny',
    title: 'Si comincia',
    message:
      'Da oggi parte il conto alla rovescia. Trenta giorni per preparare il fegato, la bici e le scuse da presentare a casa. Cominciamo con calma: è l’unica cosa che faremo con calma.',
    emoji: '🚲',
    ritual: 'Respira. Controlla le gomme. Ricorda dove hai messo il casco.',
  },
  {
    offset: -29,
    type: 'thought',
    title: 'Il gruppo',
    message:
      'Il gruppo si chiama ancora “San Dunén 2019”. Nessuno lo rinomina. Portare sfiga è l’unica tradizione che rispettiamo davvero.',
    emoji: '💬',
    ritual: 'Apri il gruppo. Leggi tutto. Non rispondere: ci pensi domani.',
  },
  {
    offset: -28,
    type: 'motivation',
    title: 'Revisione della bici',
    message:
      'Controlla freni, gomme e luci. Soprattutto le luci: al ritorno è notte fonda e la notte non perdona chi non si fa vedere. La bici è l’unico mezzo onesto che ci resta.',
    emoji: '🔧',
    ritual: 'Gonfia le gomme. Anche quelle del morale.',
  },
  {
    offset: -27,
    type: 'funny',
    title: 'Il giuramento',
    message:
      'Solennemente promettiamo che quest’anno si torna a casa presto. Solennemente. Come l’anno scorso. Come due anni fa. Come sempre.',
    emoji: '🤞',
    ritual: 'Alza la mano e giura. Poi fai finta di niente.',
  },
  {
    offset: -26,
    type: 'thought',
    title: 'La strategia',
    message:
      'Otto tappe in bicicletta non sono una bevuta: sono una disciplina sportiva. Con i suoi tempi, i suoi ritmi e i suoi infortuni.',
    emoji: '🧠',
    ritual: 'Allaccia le scarpe. Al resto pensa la compagnia.',
  },
  {
    offset: -25,
    type: 'poem',
    title: 'Poesia da osteria',
    message:
      'Otto tappe,\nun campanello scordato,\nsei amici in fila indiana\ne un Santo che ci guarda\nda lassù, perplesso.',
    emoji: '🎵',
    ritual: 'Conta le tappe sulle dita. Ti servono tutte e due le mani.',
  },
  {
    offset: -24,
    type: 'motivation',
    title: 'Idratazione',
    message:
      'Un bicchiere d’acqua ogni due birre. Non è un consiglio del medico: è geometria. Lo spazio è quello, e va amministrato con intelligenza.',
    emoji: '🚰',
    ritual: 'Bevi un bicchiere d’acqua. Seriamente. Adesso.',
  },
  {
    offset: -23,
    type: 'funny',
    title: 'Previsioni',
    message:
      'Meteo del 9 ottobre: sereno con probabilità di cori stonati al 100%, precipitazioni alcoliche intermittenti e un lieve vento di scuse verso sera.',
    emoji: '🌤️',
    ritual: 'Guarda fuori. Annusa l’aria. È quasi ottobre.',
  },
  {
    offset: -22,
    type: 'thought',
    title: 'La bici di Marco',
    message:
      'Ha i freni che fischiano, la sella che traballa e il campanello fuori tono. È la più bella di tutte, e nessuno glielo dice mai.',
    emoji: '🚲',
    ritual: 'Dai una pacca sulla sella. Presentati alla bici.',
  },
  {
    offset: -21,
    type: 'motivation',
    title: 'Regolamento',
    message:
      'In ordine: si pedala, si beve, si ride. Chi guida non beve, chi beve non guida. Il resto è folklore, e il folklore ci riesce benissimo.',
    emoji: '📋',
    ritual: 'Dillo ad alta voce, che si senta: chi guida non beve.',
  },
  {
    offset: -20,
    type: 'funny',
    title: 'La piadina di mezzanotte',
    message:
      'Tappa ufficiale non prevista ma storicamente obbligatoria. Nessuno sa chi l’ha ordinata. Nessuno ammetterà di averla mangiata. Le prove sono sul maglione.',
    emoji: '🥙',
    ritual: 'Pensa alla piadina di mezzanotte. Solo per tre secondi.',
  },
  {
    offset: -19,
    type: 'thought',
    title: 'Il tendone',
    message:
      'Il tendone è l’unico posto al mondo dove si sta bene a tutte le ore. Ci si entra per un panino e si esce quando cambia la musica.',
    emoji: '🎪',
    ritual: 'Chiudi gli occhi. Senti l’odore del fritto del tendone.',
  },
  {
    offset: -18,
    type: 'poem',
    title: 'Ottobre a Fidenza',
    message:
      'Odore di fritto e di foglie,\nle luci della fiera accese,\nun Duomo che non dice niente\ne sa tutto.',
    emoji: '🍂',
    ritual: 'Respira l’autunno. Piano, che poi arriva davvero.',
  },
  {
    offset: -17,
    type: 'motivation',
    title: 'Si parte insieme',
    message:
      'Si parte insieme e si torna insieme. Chi resta indietro viene aspettato. Chi prova ad andare avanti paga il giro dopo. Sono le leggi non scritte della Compagnia.',
    emoji: '🚴',
    ritual: 'Guardati intorno. Sei in buona compagnia.',
  },
  {
    offset: -16,
    type: 'funny',
    title: 'La mamma',
    message:
      'Ti chiama alle 22 per sapere se stai tornando. Tu sei alla tappa tre. Le dici che stai arrivando. È la bugia più antica e più nobile del mondo.',
    emoji: '📞',
    ritual: 'Prepara la scusa per tua madre. Con affetto, però.',
  },
  {
    offset: -15,
    type: 'thought',
    title: 'Metà strada',
    message:
      'Siamo a metà del countdown. Il momento esatto in cui il giro smette di essere una passeggiata e comincia a essere una leggenda che racconteremo male per anni.',
    emoji: '🍻',
    ritual: 'Siamo a metà. Tirati su e fai un respiro lungo.',
  },
  {
    offset: -14,
    type: 'motivation',
    title: 'Il percorso',
    message:
      'Zheng, Raffa, La Palta, Nuovo, La Strega, Scarlet, tendone, Duomo. Imparalo a memoria adesso: dopo la tappa quattro non lo ricorderai più.',
    emoji: '🧭',
    ritual: 'Ripeti il percorso: Zheng, Raffa, La Palta, Nuovo…',
  },
  {
    offset: -13,
    type: 'funny',
    title: 'Il coro',
    message:
      'Nessuno sa chi parte. Nessuno sa il testo. Tutti cantano. La perfezione esiste solo in questi tre secondi.',
    emoji: '🎤',
    ritual: 'Apri la gola. Ma non ancora: mancano tredici giorni.',
  },
  {
    offset: -12,
    type: 'thought',
    title: 'Il ritorno',
    message:
      'Il ritorno in bici è sempre più silenzioso dell’andata. Non perché siamo stanchi: perché stiamo tutti pensando alla stessa cosa. Cioè al letto.',
    emoji: '🌙',
    ritual: 'Spegni il telefono per un minuto. Silenzio.',
  },
  {
    offset: -11,
    type: 'funny',
    title: 'San Donnino e i cani',
    message:
      'Il Santo guariva dal morso degli animali rabbiosi. A Fidenza non è mai stato chiaro se fosse un avvertimento sui cani del quartiere o sui compagni di bevuta.',
    emoji: '🐕',
    ritual: 'Fai un pensiero a San Donnino. Poi si torna a noi.',
  },
  {
    offset: -10,
    type: 'poem',
    title: 'Dieci giorni',
    message:
      'Dieci giorni al Santo,\nsei buche per strada,\nun campanello\nche suona da solo\nquando prendiamo i sampietrini.',
    emoji: '🔔',
    ritual: 'Dieci. Respira come negli ultimi metri in salita.',
  },
  {
    offset: -9,
    type: 'motivation',
    title: 'La banda',
    message:
      'Il 9 ottobre la città si riempie, la fiera apre, la banda suona e noi passiamo in mezzo in bicicletta come se fosse normale. Non lo è. Goditelo.',
    emoji: '🎺',
    ritual: 'Ascolta. Da qualche parte suona già una banda.',
  },
  {
    offset: -8,
    type: 'funny',
    title: 'Inventario',
    message:
      'Zaino: portafoglio, chiavi, maglia in più, cerotti, e quella cosa lì che serve sempre e non c’è mai. Controllato due volte. Dimenticato comunque.',
    emoji: '🎒',
    ritual: 'Prepara lo zaino. Poi svuotalo e rifallo.',
  },
  {
    offset: -7,
    type: 'thought',
    title: 'Il Duomo',
    message:
      'È lì da secoli, con la storia di Donnino scolpita sulla facciata. Il 9 ottobre ci passiamo davanti una decina di volte. Almeno una, alziamo la testa e guardiamola.',
    emoji: '🏛️',
    ritual: 'Alza la testa e cerca il Duomo. Anche da lontano.',
  },
  {
    offset: -6,
    type: 'funny',
    title: 'L’ultimo giro',
    message:
      'L’ultimo giro è un concetto filosofico: non esiste, ma tutti ci credono. La sua caratteristica principale è che ne segue sempre un altro.',
    emoji: '🍺',
    ritual: 'Bevi l’ultimo bicchiere d’acqua della settimana. Forse.',
  },
  {
    offset: -5,
    type: 'motivation',
    title: 'Obiettivo',
    message:
      'Otto tappe. Non nove. Otto. Il tendone è la nona e non conta, perché al tendone si mangia, e mangiare non è bere. Questa è la nostra dottrina.',
    emoji: '🎯',
    ritual: 'Otto tappe. Dillo forte. Sentiti pronto.',
  },
  {
    offset: -4,
    type: 'poem',
    title: 'Quattro giorni',
    message:
      'Quattro giorni e poi si pedala.\nQuattro giorni e poi si brinda.\nIl fegato ha già capito\ne sta prendendo fiato.',
    emoji: '💛',
    ritual: 'Brinda con chi hai accanto. Anche se sei da solo.',
  },
  {
    offset: -3,
    type: 'thought',
    title: 'Il giorno prima del giorno prima',
    message:
      'Oggi si riposa. Domani si prepara. Dopodomani si fa quello che si fa. Il calendario è chiaro, il resto è carattere.',
    emoji: '😴',
    ritual: 'Oggi il rituale è non fare niente. Fallo bene.',
  },
  {
    offset: -2,
    type: 'funny',
    title: 'Comunicazione di servizio',
    message:
      'Si comunica che la lavatrice è già prenotata per il 10 ottobre mattina. Si comunica anche che nessuno ricorderà di averla prenotata.',
    emoji: '📢',
    ritual: 'Metti in carica il telefono. E la pazienza.',
  },
  {
    offset: -1,
    type: 'motivation',
    title: 'Domani',
    message:
      'Domani si pedala. Stanotte si dorme. Chi dice che non dormirà, mente sapendo di mentire. Ci vediamo a Zheng, con la bici in ordine e la faccia sveglia.',
    emoji: '🔥',
    ritual: 'Un respiro. Le gomme a posto. Domani si fa.',
  },
  {
    offset: 0,
    type: 'motivation',
    title: 'SAN DUNÉN',
    message:
      'Ci siamo. Zheng, Raffa, La Palta, Nuovo, La Strega, Scarlet, il tendone e il Duomo: otto tappe, una città, una compagnia. Pedala piano, bevi con giudizio, ridi forte, e alza la testa davanti al Duomo. Buon San Donnino a tutti. 🚲🍻',
    emoji: '🏆',
    ritual: 'Respira. Guarda la compagnia. Sorridi. È il vostro giorno.',
  },
];

/**
 * Trova il messaggio da un offset (0 = il giorno della festa).
 * @param {number} offset
 */
export function findMessage(offset) {
  return messages.find((m) => m.offset === offset);
}

/**
 * Rituale di riserva.
 *
 * Tutte e 31 le caselle hanno il LORO rituale: questa frase non dovrebbe mai
 * comparire. Resta come rete di sicurezza nel caso si aggiunga una casella
 * nuova dimenticandosi di scriverne uno — così non si vede mai un riquadro vuoto.
 */
export const FALLBACK_RITUAL = 'Respira. Metti giù le spalle. Ricorda perché sei qui.';

/** Frasi simpatiche quando si prova ad aprire una casella futura. */
export const LOCKED_LINES = [
  'Ehi, piano! Questa non si apre ancora. L’attesa è parte del gioco. ⏳',
  'Ancora un pochino… il fegato deve arrivarci da solo. 🍺',
  'Questa casella è in fermentazione. Torna domani. 🫧',
  'Il tendone non ha ancora montato il banco. 🎪',
  'Non barare: il bello è arrivarci un giorno alla volta. 🚲',
  'Shhh. Sta ancora riposando dalla sera prima. 😴',
];

/** Frasi di apertura dell'app. */
export const INTRO_LINES = [
  'Sto gonfiando le gomme…',
  'Sto contando le tappe…',
  'Sto cercando il casco…',
  'Sto avvisando San Donnino…',
  'Sto mettendo la birra in fresco…',
];

/** Piccole confessioni degli easter egg. */
export const EGG_LINES = [
  'Il campanello ha suonato da solo. Primo segreto trovato. 🔔',
  'Ok, hai vinto: modalità glitter attiva. Non chiedere perché. ✨',
  'San Donnino ti ha visto. Non è contento, ma nemmeno sorpreso. 👀',
  'Il pattino… ehm, la bici ti sussurra: «continua così». 💬',
];
