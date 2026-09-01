"use strict";

const DATA = (function () {

  var CHAPTERS = [
    {
      id: "kotelnitch",
      title: "Il treno per Kotelnitch",
      book: "La vita come un romanzo russo",
      year: 2007,
      subtitle: "Le origini sepolte",
      color: "#8b5e3c",
      narrative: [
        "Parigi, 2001. Emmanuel Carrère prende un treno notturno in Russia, verso una cittadina dimenticata chiamata Kotelnitch. Dorme in una cuccetta, fa l'amore con sua moglie, osserva i paesaggi passare nel buio.",
        "Ma il vero viaggio non è geografico. È nel passato. La madre di Emmanuel, Hélène Carrère d'Encausse, è una delle più grandi storiche di Francia, perpetua segretaria dell'Académie française. Ha trascorso la vita a studiare l'Impero russo. Ma una cosa non ha mai raccontato: le proprie origini.",
        "Il nonno di Emmanuel era un principe georgiano. A Parigi negli anni Venti faceva il tassista, e sul suo taxi leggeva filosofia. Quando gli chiedevano se fosse libero, rispondeva di no, perché doveva finire il capitolo.",
        "Nel settembre del 1944, arrestato da uomini con le mitragliatrici, il nonno è salito su una Citroën e nessuno lo ha più rivisto. La famiglia ha cancellato tutto. Il cognome russo è stato francizzato. Le origini sono state sepolte sotto un silenzio di decenni.",
        "Emmanuel, da adulto, va a cercare quel che è stato nascosto. Cammina tra le felci di Kotelnitch, nella radura inondata di luce. Raccoglie una felce, la ripone nel cofanetto accanto alla foto della moglie a vent'anni. Lo lascio qui."
      ],
      quote: {
        text: "Mio nonno era un vero intellettuale russo, che si sentiva superbamente al di sopra delle realtà quotidiane. Per lui leggere un libro era come discutere con l'autore. Lo approvava o lo insultava, riempiva i margini di annotazioni febbrili.",
        source: "La vita come un romanzo russo",
        page: "p. 41"
      },
      minigame: {
        type: "puzzle",
        title: "La foto strappata",
        description: "Ricostruisci la foto di famiglia: tocca due tessere per scambiarle.",
        rows: 3,
        cols: 3
      }
    },
    {
      id: "baffi",
      title: "I baffi",
      book: "I baffi",
      year: 1986,
      subtitle: "L'identità che si dissolve",
      color: "#5c6b7a",
      narrative: [
        "Un uomo si rade i baffi. Una cosa semplice, quasi irrilevante. Ma quando torna a casa, la moglie gli dice una frase che lo sconvolge: non li hai mai avuti.",
        "Non è uno scherzo. Non è un equivoco. Agnès è sincera. I baffi non sono mai esistiti. Eppure lui ricorda perfettamente di averli. Li ha visti allo specchio ogni giorno per anni.",
        "Da quel momento, la realtà comincia a sgretolarsi. Agnès non è l'unica: nessuno ricorda i suoi baffi. Il barbiere nega. La madre nega. Le fotografie non li mostrano mai.",
        "L'uomo è prigioniero di una verità che solo lui conosce — o di una follia che solo lui ignora. La differenza tra le due cose è sottile come la lama di un rasoio.",
        "Carrère ha scritto questo romanzo a ventotto anni, e vi ha messo la paura più profonda di ogni scrittore: la possibilità che la propria percezione del mondo sia un'illusione."
      ],
      quote: {
        text: "«Che ne diresti se mi tagliassi i baffi?» Agnès, che sfogliava una rivista sul divano, diede in una risata leggera, poi rispose: «Sarebbe una buona idea».",
        source: "I baffi",
        page: "p. 11"
      },
      minigame: {
        type: "spotDiff",
        title: "Cosa è cambiato?",
        description: "Osserva la scena. Un dettaglio è sparito. Trovalo.",
        rounds: 5
      }
    },
    {
      id: "dick",
      title: "Io sono vivo, voi siete morti",
      book: "Io sono vivo, voi siete morti",
      year: 1993,
      subtitle: "Reality e finzione",
      color: "#4a3f6b",
      narrative: [
        "Nel 1993, Emmanuel Carrère pubblica una biografia di Philip K. Dick, lo scrittore di fantascienza paranoico e geniale che si credeva seguito dal FBI e che credeva che i suoi romanzi fossero documentari.",
        "Per un anno, Carrère ha vissuto nell'universo di Dick: le sue visioni, le sue ossessioni, la sua certezza di essere un uomo-computer in un mondo controllato da forze invisibili. Ha letto tutto, ha studiato tutto, ha respirato ogni pagina.",
        "Ma nel mezzo di quel lavoro, qualcosa di strano accade: la vita di Dick e quella di Carrère cominciano a sovrapporsi. Entrambi scrivono di verità nascoste. Entrambi cercano di capire cosa sia reale.",
        "La frase che apre il libro è un avvertimento: «Io sono vivo, voi siete morti». È ciò che Dick credeva di dire ai suoi lettori, ma potrebbe essere la voce di ogni scrittore che si avventura nei territori pericolosi della verità.",
        "Carrère ha detto di questo libro che è la porta attraverso cui è entrato nel modo di scrivere che lo avrebbe reso famoso: la zona grigia tra finzione e realtà."
      ],
      quote: {
        text: "Come lui, anche io o Philip Dick abbiamo aderito a una fede o avuto una crisi mistica. Il mistero è che il punto d'origine sia quello: testimoniare una fede e scriverne.",
        source: "Il Regno (intervista Repubblica)",
        page: "16 marzo 2015"
      },
      minigame: {
        type: "swipe",
        title: "Realtà o finzione?",
        description: "Sfoglia le carte: swipe a destra se è vero, a sinistra se è inventato.",
        cards: [
          { text: "Carrère ha vissuto con la famiglia Romand il giorno dell'omicidio", real: false },
          { text: "Philip K. Dick credeva di essere monitorato dal FBI", real: true },
          { text: "Carrère ha finito il libro su Dick il giorno prima di leggere del caso Romand", real: true },
          { text: "Il nonno di Carrère era un medico in Russia", real: false },
          { text: "La madre di Carrère è stata segretaria dell'Académie française", real: true },
          { text: "Dick ha scritto il Copia contrattuale ispirandosi a Carrère", real: false },
          { text: "Carrère ha scritto I baffi ispirandosi a Dick", real: false },
          { text: "Philip K. Dick è morto nel 1982", real: true }
        ]
      }
    },
    {
      id: "avversario",
      title: "L'Avversario",
      book: "L'Avversario",
      year: 2000,
      subtitle: "La menzogna e la compassione",
      color: "#6b3a3a",
      narrative: [
        "La mattina del 9 gennaio 1993, Jean-Claude Romand uccide sua moglie, i suoi figli, i suoi genitori, poi tenta di uccidersi. L'inchiesta rivela che non è mai stato medico. Non era niente. Mentiva da diciotto anni, e quella menzogna non copriva nulla.",
        "Carrère legge la notizia di mercoledì, su Libération. Il sabato prima era a una riunione all'asilo con suo figlio Gabriel, di cinque anni — la stessa età di Antoine Romand, il figlio che Romand ha ucciso prima di pranzo dai suoceri.",
        "Per anni, Carrère è ossessionato da questa storia. Va a Process, in Svizzera, dove Romand viveva. Si siede in tribunale. Gli scrive una lettera. Romand risponde.",
        "Nella lettera, Carrère scrive: «Desidero farle capire che a spingermi verso di lei non è una curiosità malsana o il gusto del sensazionale. Ai miei occhi, ciò che lei ha fatto non è il gesto di un comune criminale, né di un pazzo, ma di un uomo spinto agli estremi da forze che non controlla.»",
        "E poi la frase finale: «Ho pensato che scrivere questa storia non poteva essere altro che un crimine o una preghiera.» Perché raccontare una vita tanto terribile è un atto di compassione — o di violenza? Carrère sceglie la compassione."
      ],
      quote: {
        text: "Ho pensato che scrivere questa storia non poteva essere altro che un crimine o una preghiera.",
        source: "L'Avversario",
        page: "p. 168"
      },
      minigame: {
        type: "tower",
        title: "La torre delle bugie",
        description: "Rimuovi le bugie nell'ordine giusto. Ogni bugia rimossa rivela un frammento di verità.",
        lies: [
          "Sono medico all'OMS",
          "Studio alla facoltà di medicina di Lione",
          "I miei colleghi mi rispettano",
          "Ho una vita normale",
          "Le mie foto di famiglia sono quelle di tutti",
          "Non è colpa mia",
          "Non era nient'altro"
        ]
      }
    },
    {
      id: "regno",
      title: "Il Regno",
      book: "Il Regno",
      year: 2014,
      subtitle: "La fede come narrazione",
      color: "#5c7a5c",
      narrative: [
        "«In un certo periodo della mia vita sono stato cristiano.» Così Carrère apre Il Regno. Non è una dichiarazione di fede. È una dichiarazione di curiosità.",
        "Per anni, Carrère ha studiato le origini del cristianesimo. Non per convertire nessuno. Per capire come una piccola setta ebraica sia diventata la religione più grande del mondo.",
        "La risposta, secondo Carrère, è una sola: la letteratura. I Vangeli non sono documenti giuridici. Sono storie. Luca, il medico macedone, ha scritto non dottrina ma narrazione. Ha trasformato un'esperienza di fede in un racconto immortale.",
        "E poi c'è la madre di Emmanuel. Nell'intervista a Repubblica, Carrère ha detto: «Mia madre sapeva che questa dimensione esisteva. Questo regno interiore è l'unico veramente desiderabile, il tesoro per cui il Vangelo consiglia di rinunciare a tutte le ricchezze.»",
        "Il Regno non è un libro sulla Chiesa. È un libro sulla forza delle storie: come possiamo credere, o non credere, eppure essere trasformati da ciò che leggiamo."
      ],
      quote: {
        text: "La fede è un mistero della persona, la religione è una narrazione collettiva.",
        source: "Intervista Repubblica",
        page: "16 marzo 2015"
      },
      minigame: {
        type: "fragments",
        title: "I frammenti del Vangelo",
        description: "Trascina i frammenti nell'ordine giusto per ricostruire l'incipit di Luca.",
        fragments: [
          "Poiché molti hanno cercato di riordinare",
          "una narrazione degli avvenimenti",
          "che si sono compiuti tra di noi,",
          "come ce li hanno trasmessi coloro",
          "che ne furono testimoni oculari",
          "e ministeri della parola,",
          "ho deciso anch'io di annotare",
          "per te, illustre Teofilo,",
          "tutto accuratamente,",
          "affinché tu possa conoscere",
          "la solidità degli insegnamenti",
          "che hai ricevuto."
        ]
      }
    },
    {
      id: "vite",
      title: "Vite che non sono la mia",
      book: "Vite che non sono la mia",
      year: 2009,
      subtitle: "Il cuore emotivo",
      color: "#3a5c6b",
      narrative: [
        "La notte che precedette l'onda, Emmanuel e Hélène hanno parlato di separarsi. Non era complicato: non abitavano sotto lo stesso tetto, non avevano figli in comune, potevano persino immaginare di restare amici. Però era triste.",
        "Erano in Sri Lanka, in vacanza. Nei giorni prima, Emmanuel aveva scritto nel suo taccuino: «Mi è preziosa. Talmente preziosa. Vorrei che un giorno fosse vecchia, che la sua carne fosse vecchia e floscia, e continuare ad amarla.»",
        "Il 26 dicembre 2004, l'onda arriva. Emmanuel e Hélène sopravvivono. I loro amici Jérôme e Delphine perdono Juliette, la loro bambina di quattro anni.",
        "E poi c'è Étienne. Étienne era la sorella di Hélène. Aveva trentatré anni, era giudice, stava combattendo un caso contro la tratta degli esseri umani. Nello stesso periodo, le è stato diagnosticato un tumore. È morta qualche mese dopo l'onda.",
        "Carrère racconta queste vite che non sono la sua con una lentezza che lacrima. Non giudica, non spiega. Osserva. E nell'osservare, ama."
      ],
      quote: {
        text: "Mi è preziosa. Talmente preziosa. Vorrei che un giorno fosse vecchia, che la sua carne fosse vecchia e floscia, e continuare ad amarla.",
        source: "Vite che non sono la mia",
        page: "p. 12"
      },
      minigame: {
        type: "gentle",
        title: "Le piccole cose",
        description: "Luci cadono lentamente. Sfiorale per trattenerle un istante. Non c'è niente da vincere. Solo da ricordare.",
        roundDuration: 30
      }
    },
    {
      id: "yoga",
      title: "Yoga",
      book: "Yoga",
      year: 2020,
      subtitle: "Il crollo e il ritorno",
      color: "#6b5c3a",
      narrative: [
        "Dopo la fine di una storia d'amore, Emmanuel Carrère crolla. Non è un collasso normale: è un crollo totale, medico, chimico. Il cervello smette di funzionare come dovrebbe.",
        "Viene ricoverato all'ospedale Sainte-Anne a Parigi. Gli diagnosticano un disturbo bipolare. Per mesi, vive in una stanza bianca. Subisce elettroshock. Impara a respirare.",
        "Nelle pagine di Yoga, Carrère racconta la meditazione: non come fuga, ma come incontro. Non come cura miracolosa, ma come pratica che ti tiene ancorato quando tutto il resto crolla.",
        "Scrive della monotonia del respirare: inspirare, trattenere, espirare. Quattro secondi, quattro secondi, sei secondi. Il ritmo che tiene insieme i pezzi.",
        "E poi racconta l'uscita: graduale, imperfetta, senza trionfo. Come si torna al mondo dopo che il mondo è finito. Non con una grande rivelazione. Con un passo, poi un altro, poi un altro ancora."
      ],
      quote: {
        text: "Sono mutevole, siamo tutti mutevoli, il mondo è mutevole. L'unica cosa che non muterà mai è il fatto che tutto muta, in continuazione.",
        source: "Emmanuel Carrère",
        page: ""
      },
      minigame: {
        type: "breathing",
        title: "Il respiro",
        description: "Segui il cerchio. Inspira 4 secondi. Trattieni 4. Espira 6. Cinque cicli.",
        inhale: 4000,
        hold: 4000,
        exhale: 6000,
        cycles: 5
      }
    },
    {
      id: "v13",
      title: "V13",
      book: "V13",
      year: 2022,
      subtitle: "L'ascolto come civiltà",
      color: "#4a3a5c",
      narrative: [
        "L'8 settembre 2021, Carrère attraversa i metal detector del Palazzo di Giustizia di Parigi. Inizia il processo per gli attentati del 13 novembre 2015. Nei 149 giorni che seguono, ascolterà tutto.",
        "Ascolta le vittime: la ragazza del Bataclan che ha detto «è assurdo, morirò a un concerto di rednecks californiani che mi è costato trenta euro e settanta». L'avvocato che dice: «Dopo tutti questi anni ci siamo affezionati. È come una famiglia».",
        "Ascolta gli imputati: Salah Abdeslam che dice «Tutto quel che dite su noi jihadisti è come se leggeste l'ultima pagina di un libro. Il libro dovreste leggerlo dall'inizio.»",
        "Carrère ascolta per un anno. Non giudica — almeno non nel modo in cui ci si aspetta. Vuole capire come un essere umano possa diventare quello. Non è comprensione per il terrorismo. È comprensione per la storia che ha portato a quel punto.",
        "E alla fine, il superite del Bataclan Pierre-Sylvain dice la frase più bella: «Mi aspetto che quel che ci è accaduto diventi un racconto collettivo.» Scrivere, insieme, ciò che è successo. Per non dimenticare."
      ],
      quote: {
        text: "Mi aspetto che quel che ci è accaduto diventi un racconto collettivo.",
        source: "V13 (Pierre-Sylvain, superstite)",
        page: "p. 108"
      },
      minigame: {
        type: "listening",
        title: "L'ascolto",
        description: "Le parole appaiono e svaniscono. Leggi con attenzione. Alla fine, rispondi: cosa hai ascoltato?",
        testimonies: [
          { word: "Paure", duration: 2500 },
          { word: "Fuga", duration: 2500 },
          { word: "Crollo", duration: 2500 },
          { word: "Sopravvivenza", duration: 3000 },
          { word: "Fiducia", duration: 3000 },
          { word: "Ascolto", duration: 3500 },
          { word: "Racconto", duration: 3500 },
          { word: "Memoria", duration: 4000 }
        ],
        question: "Qual è la parola che ricordi di più?",
        options: ["Paure", "Fiducia", "Racconto", "Memoria"]
      }
    }
  ];

  var FINALE = {
    title: "Il libro è per te",
    lines: [
      "Continuerò a vivere e a combattere.",
      "Adesso il libro è finito.",
      "Accettalo.",
      "È per te."
    ],
    source: "La vita come un romanzo russo — Explicit",
    moral: "Ogni vita — anche la più spezzata, anche la più ordinaria — merita di essere guardata con amore e raccontata.",
    final: "Sono un uomo: nulla di ciò che è umano mi è estraneo. Nemmeno tu.",
    callToAction: "Ora tocca a te: racconta la tua.",
    shareText: "Ho attraversato le vite di Emmanuel Carrère. Ogni vita merita di essere raccontata. 📖"
  };

  var GENTLE_WORDS = [
    "Respiro", "Luce", "Sguardo", "Sorriso", "Mano", "Voce",
    "Tocco", "Bacio", "Abbraccio", "Pensiero", "Sogno", "Memoria",
    "Amore", "Dolce", "Tenerezza", "Silenzio", "Ora", "Mondo"
  ];

  var DIFF_ITEMS = [
    { name: "Baffi", element: "baffi", desc: "Un uomo avrebbe dovuto avere i baffi." },
    { name: "Ombrello", element: "ombrello", desc: "L'ombrello è sparito dalla scena." },
    { name: "Vaso", element: "vaso", desc: "Il vaso di fiori non è più sul tavolo." },
    { name: "Foto", element: "foto", desc: "La cornice vuota è cambiata." },
    { name: "Orologio", element: "orologio", desc: "L'orologio non segna più le stesse ore." }
  ];

  return {
    CHAPTERS: CHAPTERS,
    FINALE: FINALE,
    GENTLE_WORDS: GENTLE_WORDS,
    DIFF_ITEMS: DIFF_ITEMS
  };

})();
