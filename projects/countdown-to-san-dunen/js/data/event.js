/**
 * event.js — TUTTO QUELLO CHE RIGUARDA SAN DUNÉN, IN UN UNICO POSTO.
 *
 * Storia, percorso dei bar, testi del gran finale: modifica qui e si aggiorna
 * tutta l'app (intestazione, countdown, caselle, celebrazione, footer).
 *
 * Fonti delle informazioni sul Santo: Diocesi di Fidenza
 * (https://www.diocesifidenza.it/cattedrale/s-donnino-martire/) e Comune di Fidenza.
 */

/** Anno della festa. Serve solo per le etichette. */
export const EVENT_YEAR = 2026;

/** Il nome dell'app. */
export const APP_NAME = 'Countdown to San Dunén';

/** La data della festa: 9 ottobre. */
export const FESTA = {
  giorno: '9 ottobre',
  santo: 'San Donnino',
  /** Come lo chiamano tutti a Fidenza. */
  nomignolo: 'San Dunén',
  città: 'Fidenza',
  provincia: 'Parma',
  regione: 'Emilia-Romagna',
  /** L'etichetta della casella finale. */
  finaleLabel: 'SI BEVE',
};

/**
 * Chi era San Donnino, in breve.
 * Le date e i fatti vengono dalla tradizione riportata dalla Diocesi di Fidenza.
 */
export const SANTO = {
  nome: 'San Donnino martire',
  epoca: 'III secolo d.C.',
  morte: '9 ottobre 293 d.C.',
  luogo: 'sulle rive del torrente Stirone, presso un ponte romano',
  /** Perché si festeggia proprio il 9 ottobre. */
  perche: 'Il 9 ottobre è il dies natalis del patrono: la città lo ricorda con un solenne Pontificale in Cattedrale e, tradizionalmente, con una grande fiera con attrazioni.',
  /** Tre righe di storia, per chi non lo sapesse. */
  storia: [
    'Donnino nacque a Roma da famiglia nobile e arrivò a un incarico di tutto rispetto: primus cubicularium dell’imperatore Massimiano, cioè il custode della corona imperiale, quello che la posava sul capo del sovrano nelle occasioni solenni.',
    'Entrato in contatto con i cristiani e convertitosi, fu destituito e tentò la fuga verso Roma. Raggiunto dalle truppe imperiali presso l’antico vicus Fidentia, fu decapitato il 9 ottobre del 293 sulle rive dello Stirone.',
    'La tradizione racconta il miracolo: il corpo si alzò, attraversò il torrente con la propria testa in mano e si coricò sull’altra riva. Oggi riposa in un’urna di vetro e argento sotto l’altare della cripta del Duomo di Fidenza, la parte più antica della chiesa.',
  ],
  /** Il dettaglio che piace a tutti. */
  curiosita:
    'Era invocato come taumaturgo: guariva dal morso degli animali rabbiosi e velenosi. Un Santo che ti rimette in piedi, insomma. Esattamente quello che serve il 10 ottobre mattina.',
  duomo: 'Il Duomo di Fidenza è a lui dedicato: sulla facciata, i bassorilievi raccontano la sua storia scolpita nella pietra.',
};

export const TEAM = {
  code: 'SANDUNÉN',
  name: 'La Compagnia del Tendone',
  country: 'Fidenza',
};

/**
 * IL PERCORSO: il giro dei bar in bicicletta.
 * Le tappe sono in ordine. `nota` è la riga seria, `commento` quella goliardica.
 */
export const PERCORSO = [
  {
    nome: 'Zheng',
    ruolo: 'Partenza',
    nota: 'Ritrovo, bici in fila, controllo gomme e fegati. Si parte da qui.',
    commento: 'Chi arriva in ritardo offre il primo giro. Regola non scritta ma ferrea.',
  },
  {
    nome: 'Bar Raffa',
    ruolo: 'Tappa 1',
    nota: 'Prima sosta, si scalda il motore.',
    commento: 'Tecnicamente è ancora aperitivo. Tecnicamente.',
  },
  {
    nome: 'La Palta',
    ruolo: 'Tappa 2',
    nota: 'Seconda tappa, il gruppo comincia a compattarsi.',
    commento: 'Qui qualcuno tira fuori la teoria che “in bici si smaltisce”. Nessuno controlla.',
  },
  {
    nome: 'Nuovo',
    ruolo: 'Tappa 3',
    nota: 'Terza tappa, metà del percorso.',
    commento: 'Il punto in cui le bici iniziano a essere parcheggiate con una certa creatività.',
  },
  {
    nome: 'La Strega',
    ruolo: 'Tappa 4',
    nota: 'Quarta tappa. Da qui in poi si canta.',
    commento: 'Nessuno ricorda cosa si canta, ma si canta benissimo.',
  },
  {
    nome: 'Scarlet',
    ruolo: 'Tappa 5',
    nota: 'Ultima tappa dei bar, in Piazza Duomo. Si arriva nel posto giusto.',
    commento: 'Il Duomo lì davanti fa il suo effetto: tutti zitti per tre secondi, poi si riprende.',
  },
  {
    nome: 'Tendone di San Donnino',
    ruolo: 'Rifocillamento',
    nota: 'Si mangia, si beve, si balla sotto il tendone della festa.',
    commento: 'Il tendone è casa. Il tendone non giudica.',
  },
  {
    nome: 'Davanti al Duomo',
    ruolo: 'Gran finale',
    nota: 'Ultima tappa: davanti al Duomo, per il Santo che si festeggia.',
    commento: 'Un pensiero a San Donnino, uno alla batteria della bici, e tutti a casa interi.',
  },
];

/** Frasi che compaiono sotto l'intestazione. */
export const AMBIENT_LINES = [
  'Fidenza si prepara. Il fegato pure.',
  'Da qui al 9 ottobre è tutto in discesa. In teoria.',
  'Le bici sono in fila. Le idee meno.',
  'Otto tappe, una sola dignità, nessuna certezza.',
  'Il tendone non si apre da solo. Qualcuno deve pur iniziare.',
  'San Donnino guariva dal morso degli animali rabbiosi. Tu prova a non esagerare.',
  'Conta le tappe. Respira. Idratati.',
  'A Fidenza il 9 ottobre si festeggia il Santo. E anche un po’ noi.',
  'La bici è il mezzo più onesto: non giudica e non ha il volante.',
  'Chi pedala, torna. Chi guida, non beve. Questa è l’unica regola seria.',
  'Il Duomo è lì da secoli. Il tendone invece è temporaneo: sfruttalo.',
];

/** Riga del footer: ruota in base al giorno. */
export const FOOTER_LINES = [
  'Fatto con amore, bici e birra media ♡',
  '8 tappe · 2 ruote · 1 fegato 🚲',
  `${SANTO.nome} · ${FESTA.giorno}`,
  'In bici si torna sempre. In macchina no: se guidi, non bevi.',
  'Il tendone è casa 🍻',
];

/** Il gran finale. */
export const FINALE_COPY = {
  eyebrow: 'È arrivato il giorno',
  date: '9 ottobre',
  event: 'San Donnino',
  place: 'Fidenza',
  team: 'La Compagnia del Tendone',
  lines: ['Hai aperto tutte le caselle.', 'Hai attraversato tutta l’attesa.'],
  cta: 'Adesso si pedala e si beve.',
};

/** Il tricolore, in versione da osteria. */
export const TRICOLORE = ['#0e8a52', '#f6f2ec', '#d0455a'];
