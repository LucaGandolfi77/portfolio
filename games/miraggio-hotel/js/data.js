/* ============================================================
   MIRAGGIO HOTEL — dati: stanze, ospiti, battute, storie,
   missioni, minigiochi e guardaroba
   ============================================================ */
(function () {
  "use strict";
  const G = {
    startCoins: 60,

    skins: ["#ffe0bd", "#f2c9a0", "#eab98a", "#c68b59", "#8d5a2b"],
    hairColors: ["#4a2a14", "#2b1b0e", "#d9a441", "#c0392b", "#8e44ad", "#2c3e50", "#7f8c8d", "#ecf0f1"],
    tops: ["#ff5d9e", "#5b3bd6", "#00c9b7", "#ff8f3c", "#3ddc97", "#e84f8a", "#4ea8ff", "#ffd166"],
    pants: ["#3a2a8f", "#1f3b73", "#7b2d8b", "#c2185b", "#0b7285", "#37474f"],

    rooms: {
      atrio: {
        name: "Atrio del Miraggio", emoji: "🏨", hint: "la reception · dove tutto comincia",
        w: 700, h: 440, walkTop: 96,
        floor1: "#ffe6cc", floor2: "#ffd9b3", wall: "#ff8fb0",
        bots: ["lola", "pino"],
        furniture: [
          { x: 90, y: 120, e: "🖥️", s: 46 },
          { x: 150, y: 130, e: "🛎️", s: 44 },
          { x: 250, y: 110, e: "🪴", s: 40 },
          { x: 430, y: 110, e: "🛋️", s: 78 },
          { x: 560, y: 130, e: "🪟", s: 60 },
          { x: 330, y: 330, e: "🧳", s: 42, xl: true },
          { x: 470, y: 320, e: "🌴", s: 74 },
          { x: 120, y: 340, e: "🗝️", s: 36, xl: true }
        ]
      },
      sala_giochi: {
        name: "Sala Giochi", emoji: "🕹️", hint: "retro e arcade, record da battere",
        w: 700, h: 440, walkTop: 96,
        floor1: "#d7f6ff", floor2: "#c2ecfa", wall: "#67d5f5",
        bots: ["leo", "guest2"],
        furniture: [
          { x: 100, y: 120, e: "🕹️", s: 52, xl: true },
          { x: 240, y: 120, e: "👾", s: 46, xl: true },
          { x: 430, y: 110, e: "📺", s: 54, xl: true },
          { x: 570, y: 130, e: "🎯", s: 46, xl: true },
          { x: 130, y: 330, e: "🧸", s: 46 },
          { x: 300, y: 340, e: "🪙", s: 34, xl: true },
          { x: 520, y: 330, e: "🛋️", s: 70 }
        ]
      },
      piscina: {
        name: "Piscina", emoji: "🏊", hint: "tuffi, galleggianti e succo di ananas",
        w: 700, h: 440, walkTop: 96,
        floor1: "#ccf3ff", floor2: "#b8e9ff", wall: "#40c4ff",
        bots: ["rigo"],
        furniture: [
          { x: 330, y: 240, e: "🏊", s: 150 },
          { x: 200, y: 120, e: "🌴", s: 64 },
          { x: 520, y: 130, e: "🛟", s: 50, xl: true },
          { x: 110, y: 320, e: "⛱️", s: 54 },
          { x: 260, y: 350, e: "🍹", s: 38, xl: true },
          { x: 470, y: 340, e: "🧴", s: 36, xl: true }
        ]
      },
      discoteca: {
        name: "Discoteca", emoji: "🪩", hint: "il sabato sera è ogni sera",
        w: 700, h: 440, walkTop: 96,
        floor1: "#e6d5ff", floor2: "#dcc6ff", wall: "#b06aff",
        bots: ["max"],
        furniture: [
          { x: 110, y: 120, e: "🎛️", s: 66, xl: true },
          { x: 300, y: 110, e: "🪩", s: 70 },
          { x: 520, y: 130, e: "🎤", s: 50, xl: true },
          { x: 170, y: 330, e: "🕺", s: 44 },
          { x: 360, y: 340, e: "✨", s: 36, xl: true },
          { x: 550, y: 330, e: "🍾", s: 42, xl: true }
        ]
      },
      giardino: {
        name: "Giardino", emoji: "🌷", hint: "fiori, api e pisolini al sole",
        w: 700, h: 440, walkTop: 96,
        floor1: "#dff5c9", floor2: "#d2efb8", wall: "#7ed957",
        bots: ["nina", "guest1"],
        furniture: [
          { x: 90, y: 120, e: "🌸", s: 46 },
          { x: 260, y: 110, e: "🌳", s: 86 },
          { x: 500, y: 120, e: "🌻", s: 48 },
          { x: 620, y: 150, e: "🦋", s: 40 },
          { x: 160, y: 330, e: "🧺", s: 46, xl: true },
          { x: 400, y: 350, e: "🪑", s: 40 },
          { x: 580, y: 330, e: "🪻", s: 40 }
        ]
      },
      bar: {
        name: "Bar dello Spritz", emoji: "🍹", hint: "spritz, patatine e pettegolezzi",
        w: 700, h: 440, walkTop: 96,
        floor1: "#ffe8cf", floor2: "#ffdcb8", wall: "#ff9f43",
        bots: ["gigi"],
        furniture: [
          { x: 100, y: 110, e: "🍕", s: 46 },
          { x: 210, y: 130, e: "🥤", s: 40 },
          { x: 330, y: 115, e: "🍹", s: 52, xl: true },
          { x: 470, y: 130, e: "🍩", s: 44 },
          { x: 150, y: 330, e: "🪑", s: 42 },
          { x: 340, y: 340, e: "🪑", s: 42 },
          { x: 540, y: 330, e: "🎰", s: 50, xl: true }
        ]
      },
      terrazza: {
        name: "Terrazza delle stelle", emoji: "🌌", hint: "la notte qui non finisce mai",
        w: 700, h: 440, walkTop: 96,
        floor1: "#2a2a5e", floor2: "#23234f", wall: "#4a3f9e",
        bots: ["stella", "tino"],
        furniture: [
          { x: 100, y: 120, e: "🔭", s: 54, xl: true },
          { x: 260, y: 110, e: "🌙", s: 60 },
          { x: 470, y: 115, e: "✨", s: 40 },
          { x: 590, y: 150, e: "🛋️", s: 70 },
          { x: 150, y: 330, e: "🧺", s: 44 },
          { x: 360, y: 340, e: "📷", s: 40, xl: true },
          { x: 540, y: 330, e: "🎇", s: 44, xl: true }
        ]
      },
      camera: {
        name: "La tua camera", emoji: "🛏️", hint: "il tuo angolo: metti i mobili e guadagna",
        w: 700, h: 440, walkTop: 96,
        floor1: "#e8e0ff", floor2: "#ded4ff", wall: "#9d8cff",
        bots: [],
        furniture: [
          { x: 620, y: 130, e: "🪟", s: 60 },
          { x: 120, y: 330, e: "🚪", s: 54 },
          { x: 340, y: 115, e: "💡", s: 34 }
        ],
        slots: [
          { x: 180, y: 200 }, { x: 330, y: 200 }, { x: 480, y: 200 },
          { x: 180, y: 300 }, { x: 330, y: 300 }, { x: 480, y: 300 }
        ]
      },
      cucina: {
        name: "Cucina del Miraggio", emoji: "🍳", hint: "qui le ricette sono segrete (tranne una)",
        w: 700, h: 440, walkTop: 96,
        floor1: "#fff2e0", floor2: "#ffe9cf", wall: "#ffb86c",
        bots: ["sergio"],
        furniture: [
          { x: 90, y: 115, e: "🍳", s: 50, xl: true },
          { x: 210, y: 120, e: "🥘", s: 54, xl: true },
          { x: 330, y: 110, e: "🔪", s: 40 },
          { x: 470, y: 130, e: "🥖", s: 46 },
          { x: 590, y: 130, e: "🧁", s: 42, xl: true },
          { x: 130, y: 330, e: "🧑‍🍳", s: 44 },
          { x: 300, y: 340, e: "🍝", s: 42, xl: true },
          { x: 500, y: 330, e: "🧺", s: 44 }
        ]
      }
    },

    bots: {
      lola: {
        name: "Lola", role: "receptionist", emoji: "💁‍♀️", skin: "#eab98a", hair: "#ff5d9e", hairStyle: 2, top: "#5b3bd6", pants: "#1f3b73", acc: null,
        greet: [
          "Benvenut* al Miraggio! Le chiavi della felicità sono al bancone 🗝️",
          "Nuovi arrivi! Avevo già preparato l’ombrello di confetti 🎊",
          "La tua stanza è la numero… una qualsiasi, sono tutte allegre qui!",
          "Qui il check-in è veloce: firmi col sorriso, paghi in risate 😄"
        ],
        ambient: [
          "📞 *squillo* … “Miraggio Hotel, dove ogni rumore è benvenuto!”",
          "Sto lucidando la targa “Hotel più colorato della rete”.",
          "Mi raccomando: niente scorciatoie, i corridoi sono un labirinto di gioia!"
        ]
      },
      pino: {
        name: "Pino", role: "ospite in attesa", emoji: "🧳", skin: "#f2c9a0", hair: "#7f8c8d", hairStyle: 1, top: "#37474f", pants: "#37474f", acc: "glasses",
        greet: [
          "Aspetto il mio trolley dal 2003. Il reception dice che è “in viaggio di formazione” 🧳",
          "Psst… qui le piante parlano. Quella in vaso mi ha già dato 3 consigli di vita.",
          "Io sono solo di passaggio. Come quel telefono che squilla e non c’è mai nessuno.",
          "Il wifi del Miraggio è così veloce che i messaggi arrivano prima che li scrivi."
        ],
        ambient: [
          "🧳 *apre la valigia* … c’è solo un costume da bagno e un dizionario di emoji.",
          "Dicono che al terzo giorno trovi la stanza segreta… io cerco dal 2003.",
          "Nota a me stesso: comprare un’altra valigia, questa ha nostalgia di casa."
        ]
      },
      leo: {
        name: "Leo", role: "game master", emoji: "🎮", skin: "#ffd9b3", hair: "#2c3e50", hairStyle: 0, top: "#3ddc97", pants: "#2c3e50", acc: "headphones",
        greet: [
          "Il record del Miraggio è 9.999 punti a Space Blaster. A te la sfida 🕹️",
          "Qui il livello più duro è “restare seri per 10 secondi”. Nessuno c’è mai riuscito.",
          "Ho nascosto un uovo di Pasqua in sala. No, non è quello del pavimento.",
          "Gamer da 20 anni: l’unico lag che temo è quello dell’ascensore del bar."
        ],
        ambient: [
          "🕹️ *tap tap tap* … nuovo record personale di sbadigli!",
          "Il joystick è caldo: segno che ci stiamo divertendo.",
          "Se senti 8-bit, sono io che ricarico il morale."
        ]
      },
      guest2: {
        name: "Bibi", role: "ospite da record", emoji: "🦄", skin: "#ffe0bd", hair: "#d9a441", hairStyle: 3, top: "#ff8f3c", pants: "#c2185b", acc: "crown",
        greet: [
          "Io sono entrata qui con 0 monete e ora sono una leggenda. La storia non lo conferma, ma vabbè 🦄",
          "Il mio record? 47 emote in un minuto. I polsi ne parlano ancora.",
          "Il segreto del Miraggio: ballare come se nessuno guardasse. Tutti guardano. Ballo.",
          "Ho finito le batterie del costume da unicorno. Questa è la versione risparmio."
        ],
        ambient: [
          "✨ *brilla* … oggi brillo anche senza lampadario.",
          "Sto collezionando sguardi confusi. Già 12.",
          "Unicorni veri non esistono… eccetto il lunedì."
        ]
      },
      rigo: {
        name: "Rigo", role: "bagnino", emoji: "🩳", skin: "#c68b59", hair: "#2b1b0e", hairStyle: 0, top: "#ff5d5d", pants: "#1f3b73", acc: "cap",
        greet: [
          "Acqua alta 120 cm di allegria. Tuffi consentiti solo col sorriso 🤿",
          "Regola n.1: niente corse. Regola n.2: i galleggianti a forma di fenicottero si rispettano.",
          "Non serve il fischietto: qui l’unico pericolo è la mancanza di patatine.",
          "Ho visto un tuffo da 10 punti… poi ho scoperto che era un gabbiano."
        ],
        ambient: [
          "🛟 *fischia* … qualcuno si è tuffato col telefono in mano. Coraggio.",
          "Conto i galleggianti: 1 fenicottero, 1 ciambella, 3 sospiri felici.",
          "L’acqua oggi è così limpida che si vede il fondo della gentilezza."
        ]
      },
      max: {
        name: "Max", role: "dj", emoji: "🎧", skin: "#f2c9a0", hair: "#8e44ad", hairStyle: 1, top: "#2c3e50", pants: "#7b2d8b", acc: "headphones",
        greet: [
          "Ciao! Preparati: qui il volume è al 100% di simpatia 🔊",
          "Stasera la playlist è “Balli improvvisi in corridoio” — tutto esaurito.",
          "Il mio mixer ha un tasto segreto che aggiunge confetti a ogni canzone. Non dirlo a nessuno.",
          "Balla come se fossi in un video musicale degli anni 80. Con i colori del 2025."
        ],
        ambient: [
          "🎧 *wobble wobble* … bassi di simpatia in arrivo.",
          "Mixaggio… 50% ritmo, 50% risate.",
          "Questa canzone l’ho composta con la tastiera della reception."
        ]
      },
      nina: {
        name: "Nina", role: "fioraia", emoji: "🌻", skin: "#ffe0bd", hair: "#ecf0f1", hairStyle: 2, top: "#7ed957", pants: "#0b7285", acc: null,
        greet: [
          "Ciao! Ogni fiore qui ha un nome. Quello in vaso si chiama Mario e ascolta 🌻",
          "Le api del giardino fanno il miele più dolce della rete: segreto dell’hotel.",
          "Se annusi bene, senti l’estate del 2019. È ancora qui, dietro il cespuglio.",
          "Regola del giardino: vietato essere tristi tra le margherite."
        ],
        ambient: [
          "🌸 *innaffia* … anche i cactus hanno bisogno di complimenti.",
          "Le farfalle oggi hanno fatto il giro delle 6 stanze. Turiste instancabili.",
          "Mario il fiore dice che gli piaci. Mario non dice mai una bugia."
        ]
      },
      guest1: {
        name: "Ugo", role: "ospite dormiente", emoji: "😴", skin: "#eab98a", hair: "#4a2a14", hairStyle: 1, top: "#ffd166", pants: "#6d4c41", acc: null,
        greet: [
          "Zzz… oh! Scusa, stavo sognando di essere al Miraggio. Sono già al Miraggio. Continuo a sognare 😴",
          "Il pisolino più lungo: 9 ore. Record, ma non ne sono fiero. Un po’ sì.",
          "Psst… non svegliare la coccinella sulla panchina, sta scrivendo un romanzo.",
          "La panchina del giardino ha il miglior riposino della rete."
        ],
        ambient: [
          "😴 *sbadiglia* … scusate, stavo ricaricando le batterie sociali.",
          "Un sogno: ero un galleggiante a forma di pizza. Bellissimo.",
          "Sole, fiori e silenzio… cioè, a parte il mio russare."
        ]
      },
      gigi: {
        name: "Gigi", role: "barman", emoji: "🍹", skin: "#c68b59", hair: "#4a2a14", hairStyle: 1, top: "#fff", pants: "#1f3b73", acc: "hat",
        greet: [
          "Ciao! Lo Spritz del Miraggio è una ricetta segreta: 2 parti allegria, 1 di sole 🍹",
          "Oggi il piatto del giorno sono patatine e chiacchiere. Doppia razione di entrambe.",
          "Posso prepararti un “Virgin Hotel”: succo, ghiaccio e una canzone anni 90.",
          "Il mio consiglio da barman: la felicità va servita fresca."
        ],
        ambient: [
          "🍹 *shaker* … aggiungo una spruzzata di buonumore.",
          "Le olive del Miraggio sanno già tutto. Sono informate.",
          "Chiudiamo alle 23. La simpatia invece non chiude mai."
        ]
      },
      stella: {
        name: "Stella", role: "astronoma della terrazza", emoji: "🔭", skin: "#ffe0bd", hair: "#ecf0f1", hairStyle: 2, top: "#4a3f9e", pants: "#2a2a5e", acc: "glasses",
        greet: [
          "Stasera il cielo è pieno di desideri… e di Wi-Fi gratis delle stelle 🌌",
          "Quella costellazione si chiama “Grande Cucchiaio”. L’ho chiamata io, e vabbè.",
          "Da qui si vede la Via Lattea e, nel weekend, anche la discoteca che fa rumore.",
          "Le stelle cadenti? Le intercetto con la rete. Servono per i desideri degli ospiti."
        ],
        ambient: [
          "🔭 *guarda il cielo* … una stella ha appena fatto l’occhiolino.",
          "Sto mappando la costellazione “Cuscino”. Promettente.",
          "Se vedi una cometa, corri: ha il gelato al limone."
        ]
      },
      tino: {
        name: "Tino", role: "gabbiano capo", emoji: "🕊️", skin: "#f7e7cf", hair: "#7f8c8d", hairStyle: 1, top: "#e8f1f5", pants: "#f2b632", acc: null,
        greet: [
          "Squaw! Io sono Tino, il gabbiano capo. Ho una laurea honoris causa in patatine 🍟",
          "Volo sopra le 6 stanze ogni mattina per il controllo qualità: tutto a posto!",
          "Non sono un gabbiano qualunque: sono il gabbiano che ha ispirato il nome della piscina.",
          "Se butti una mollica, ti seguo fino al Bar dello Spritz. È il protocollo."
        ],
        ambient: [
          "🕊️ *vola in cerchio* … punto strategico avvistato: la panchina del giardino.",
          "Squaw! Qualcuno ha lasciato il cappello. Era mio? Non lo so. Ora è mio.",
          "Oggi niente gabbiani competitivi: è il mio giorno libero… mentivo."
        ]
      },
      sergio: {
        name: "Sergio", role: "chef della cucina", emoji: "🍳", skin: "#c68b59", hair: "#7f8c8d", hairStyle: 0, top: "#fff", pants: "#37474f", acc: "hat",
        greet: [
          "Benvenuto nella cucina del Miraggio! Oggi il menu è: sorrisi al forno, patatine alla griglia.",
          "La ricetta segreta della carbonara? Un pizzico di coraggio e tanto burro di allegria 🍝",
          "Attenzione: il fornello a sinistra è a gas, quello a destra è a simpatia. Non confonderli.",
          "Assaggio tutto. È un lavoro duro, ma qualcuno deve pur farlo."
        ],
        ambient: [
          "🍳 *sibila la padella* … gli albumi cantano l’opera.",
          "Il profumo di pane arriva fino all’Atrio. È il mio biglietto da visita.",
          "La salsa segreta è finita. Prepara il piano B: la salsa molto segreta."
        ]
      }
    },

    chatTriggers: [
      { words: ["ciao", "salve", "hey", "hola", "buongiorno", "buonasera"], reply: "Salve! Alla reception dicono che qui i saluti tornano indietro con gli interessi 👋" },
      { words: ["come stai", "come va", "tutto bene"], reply: "Io? Sto benissimo: ho dormito su un letto di confetti e ho sognato il bancone." },
      { words: ["balla", "balliamo", "dance", "musica"], reply: "Il dj Max sta già mixando qualcosa per te 🪩 balla!" },
      { words: ["monete", "soldi", "ricco"], reply: "Vuoi monete? Parla con gli ospiti, tocca gli oggetti che luccicano e… sorridi, aiuta 😉" },
      { words: ["segreto", "nascondi", "stanza segreta"], reply: "La stanza segreta si trova… dove non la cerchi. Questo è il segreto 🗝️" },
      { words: ["pizza", "mangio", "fame"], reply: "Al Bar dello Spritz le patatine non finiscono mai. È un miracolo dell’hotel 🍕" },
      { words: ["triste", "male", "solo"], reply: "Ehi, qui nessuno è solo: ci sono io, i fiori e un gabbiano di nome Tino 🫂" },
      { words: ["grazie", "ti amo", "bello", "bravo"], reply: "Grazie a te! Il Miraggio ti appende alla bacheca dei ricordi felici 💖" }
    ],

    furnitureReplies: {
      "🖥️": "Il computer della reception mostra solo GIF di gatti. È così dal 2015.",
      "🛎️": "Ding! Il campanello dice: “sei già in vacanza, rilassati”.",
      "🪴": "La pianta sussurra: “annaffiami e ti do una moneta”. …ti dà una moneta.",
      "🛋️": "Il divano è così morbido che ti propone di adottarlo.",
      "🪟": "Fuori dalla finestra c’è un panorama di nuvolette di zucchero.",
      "🧳": "Una valigia piena di… monete! Qualcuno le ha dimenticate. Il tuo turno.",
      "🗝️": "Una chiave dorata! Apre il cassetto dei complimenti.",
      "🌴": "La palma ti fa l’occhiolino. O era un’ombra?",
      "🕹️": "Premi START… appare la scritta: “Hai già vinto il divertimento”.",
      "👾": "Il mostriciattolo ti sfida a morra cinese. Vinci per simpatia.",
      "📺": "Sul monitor: un tutorial su come fare amicizia. Sei già un esperto.",
      "🎯": "Bersaglio centrato! Monete bonus 🪙",
      "🧸": "L’orsacchiotto ti abbraccia. +1 moneta, +10 tenerezza.",
      "🪙": "Una moneta luminosa rotola verso di te!",
      "🏊": "Pluff! L’acqua è perfetta: 25° di divertimento.",
      "🛟": "Il salvagente ti salva da… zero pericoli, ma sei più figo con quello.",
      "⛱️": "L’ombrellone ti copre dai raggi… del pessimismo.",
      "🍹": "Un drink arcobaleno appare magicamente. Slurp!",
      "🧴": "Crema solare alla vaniglia: odora di vacanza.",
      "🎛️": "Il mixer di Max ha un pulsante arcobaleno. Lo premi. BOOM confetti!",
      "🪩": "La sfera a specchi si accende e la stanza diventa una festa!",
      "🎤": "Microfono acceso: “Grazie Miraggio, grazie a tutti!” 🎶",
      "🕺": "Una statua danzante? No, è Max in pausa. Riparte a ballare.",
      "✨": "Polvere di stelle: +2 monete di fortuna.",
      "🍾": "Spumante analcolico: il tappo è di simpatia.",
      "🌸": "Il fiore sboccia: “Era ora!”. Ti regala una moneta.",
      "🌳": "L’albero è un oracolo: “La tua giornata sarà… colorata”.",
      "🌻": "Il girasole si gira verso di te. Ti sta prendendo in simpatia.",
      "🦋": "La farfalla ti si posa sul naso un istante. Portafortuna!",
      "🧺": "Un cestino da picnic pieno di panini arcobaleno.",
      "🪑": "Ti siedi. Si alza una nuvola di polvere di stelle.",
      "🪻": "La viola ti dedica una canzone in silenzio.",
      "🍕": "Una fetta di pizza volante ti passa davanti. Non chiedere.",
      "🥤": "Il bicchiere è magico: si riempie da solo di allegria.",
      "🍩": "La ciambella ha un buco perfetto. Come la tua voglia di dolce.",
      "🎰": "Jackpot delle risate! Le monete piovono 🪙🪙",
      "🔭": "Il telescopio mostra una stella che… ti fa l’occhiolino. Moneta fortunata!",
      "🌙": "La luna piena del Miraggio è in realtà un lampione molto carismatico.",
      "📷": "Scatto una foto alla galassia… esce un selfie di Tino. Strano ma bello.",
      "🎇": "Fuochi d’artificio di simpatia: tutta la terrazza applaude!",
      "🍳": "La padella sfrigola una canzone. Il ritornello è “gira l’omelette”.",
      "🥘": "La pentola borbotta: “oggi si mangia col sorriso”. Menu confermato.",
      "🧁": "Un cupcake arcobaleno ti guarda. Ha paura che tu non lo mangi. Lo mangi.",
      "🍝": "Spaghetti al sugo della felicità. La ricetta esiste solo qui.",
      "🧑‍🍳": "Il cuoco di legno approva. Il suo pollice è sempre alzato.",
      "🔪": "Un coltello che affila… le battute di Sergio. Pericolosissimo.",
      "🥖": "La baguette è così fresca che fa “gnam” da sola."
    },

    charInfo: {
      lola: { likes: ["heart", "wave"], trophy: "🗝️ Chiave del sorriso", s1: "Lola custodisce il registro degli arrivi dal 2012: c’è scritto anche il tuo nome… di nascosto.", s2: "Il suo sogno è aprire un albergo per emoji stanche. “Le emoji non dormono mai, serve una struttura adatta.”" },
      pino: { likes: ["laugh", "wave"], trophy: "🧳 Trolley nostalgico", s1: "Pino non ha mai viaggiato: la sua valigia sì. Lui la guarda partire da sola, ogni tanto.", s2: "Ha scritto 3.000 messaggi di attesa alla valigia. Il capitolo 4 si intitola “Lei non risponde ma mi manca”." },
      leo: { likes: ["clap", "laugh"], trophy: "🕹️ Joystick d’oro", s1: "Leo sta sviluppando un gioco sul Miraggio. Il boss finale è… la sveglia del mattino.", s2: "Il suo record di 9.999 punti a Space Blaster lo ha fatto con gli occhi chiusi. Letteralmente: dormiva." },
      guest2: { likes: ["heart", "dance"], trophy: "🦄 Coriandoli magici", s1: "Bibi dice di avere un costume da unicorno. In realtà il corno è una lampada da scrivania: non chiedere.", s2: "Ha collezionato 47 “sguardi confusi”. È il suo Guinness personale e non ha intenzione di fermarsi." },
      rigo: { likes: ["wave", "laugh"], trophy: "🛟 Fenicottero galleggiante", s1: "Rigo una volta ha salvato un fenicottero gonfiabile dal bordo della piscina. Dice che fu “il giorno più eroico della mia vita”.", s2: "Sa nuotare solo a rana e a stile “galleggio e fingo”. Ha una medaglia di partecipazione alla vita." },
      max: { likes: ["dance", "clap"], trophy: "🎧 Mixer arcobaleno", s1: "Max ha composto la suoneria dell’hotel. È il jingle che ti entra in testa e non esce più (colpa sua).", s2: "Il suo tasto segreto dei confetti esiste davvero: lo preme ogni volta che qualcuno si iscrive alla vita." },
      nina: { likes: ["heart", "wave"], trophy: "🌻 Mario il fiore", s1: "Nina parla con le piante da 9 anni. Le piante non hanno mai risposto, ma lei dice che “ascoltano benissimo”.", s2: "Mario il fiore è in realtà un albero di pomodoro travestito. Nina lo sa. Mario no." },
      guest1: { likes: ["laugh"], trophy: "😴 Cuscino di nuvola", s1: "Ugo sogna di dormire in ogni stanza del Miraggio. Gli mancano solo 4 stanze e il tetto.", s2: "Una volta ha dormito 12 ore e ha sognato di dormire. Al risveglio era riposatissimo. Scienza." },
      gigi: { likes: ["clap", "heart"], trophy: "🍹 Shaker del sorriso", s1: "Gigi ha un cocktail chiamato “Hotel Colazione”: segreto assoluto, lo serve solo a chi sorride prima delle 9.", s2: "Una volta un ospite ha chiesto “lo Spritz più buono del mondo”. Gigi ha chiuso il bar e ha preparato la ricetta per 3 giorni." },
      stella: { likes: ["heart", "wave"], trophy: "🔭 Telescopio dei desideri", s1: "Stella ha chiamato una stella “Caffè”. Così, quando la vede, si sente meno in colpa a prenderne un altro.", s2: "Sostiene che l’universo sia una palla di gomma che rimbalza. “La prova? Il tempo vola.”" },
      tino: { likes: ["clap", "laugh"], trophy: "🕊️ Piuma di Tino", s1: "Tino una volta ha volato 40 km per una patatina. Dice che ne valeva la pena. La patatina conferma.", s2: "Il suo canto ufficiale è “Squaw-squaw, che bella la vita”. È in radio ogni mattina alle 6." },
      sergio: { likes: ["clap", "heart"], trophy: "🍳 Padella della felicità", s1: "Sergio ha una ricetta che non scrive da nessuna parte: “Paura in padella”. Il trucco è non averne.", s2: "Il suo assistente in cucina è una pentola che lui chiama “Vice Chef”. La pentola non si è ancora dimessa." }
    },

    missionPool: [
      { t: "talk", bot: "lola", n: 2, title: "Fai il check-in con Lola", desc: "Parla con Lola alla reception (2 volte)" },
      { t: "talk", bot: "pino", n: 2, title: "Intrattieni Pino", desc: "Parla 2 volte con Pino e la sua valigia" },
      { t: "talk", bot: "leo", n: 2, title: "Sfida Leo", desc: "Parla 2 volte con Leo, game master" },
      { t: "talk", bot: "rigo", n: 2, title: "Ascolta le regole di Rigo", desc: "Parla 2 volte con Rigo, il bagnino" },
      { t: "talk", bot: "max", n: 2, title: "Chiedi la playlist a Max", desc: "Parla 2 volte con Max in discoteca" },
      { t: "talk", bot: "nina", n: 2, title: "Annaffia le chiacchiere", desc: "Parla 2 volte con Nina nel giardino" },
      { t: "talk", bot: "gigi", n: 2, title: "Ordina un consiglio", desc: "Parla 2 volte con Gigi al bar" },
      { t: "talk", bot: "stella", n: 2, title: "Conta le stelle", desc: "Parla 2 volte con Stella sulla terrazza" },
      { t: "talk", bot: "tino", n: 2, title: "Da’ da mangiare a Tino", desc: "Parla 2 volte con Tino (con rispetto)" },
      { t: "talk", bot: "sergio", n: 2, title: "Assaggia le storie", desc: "Parla 2 volte con Sergio in cucina" },
      { t: "talk", bot: "guest1", n: 1, title: "Non svegliare Ugo", desc: "Sussurra a Ugo (parla 1 volta, piano)" },
      { t: "talk", bot: "guest2", n: 1, title: "Saluta Bibi", desc: "Saluta Bibi, la leggenda degli sguardi confusi" },
      { t: "chat", n: 1, title: "Scrivi in chat", desc: "Manda un messaggio nella chat dell’hotel" },
      { t: "emote", n: 3, title: "Movimenta la stanza", desc: "Fai 3 emote (balla, saluta, abbraccia…)" },
      { t: "emote", bot: "max", n: 1, title: "Balla per Max", desc: "Usa l’emote 🕺 vicino a Max" },
      { t: "furn", n: 2, title: "Tocca gli oggetti luccicanti", desc: "Interagisci con 2 oggetti ✨" },
      { t: "minigame", n: 1, title: "Gioca un minigioco", desc: "Completa un minigioco (Memoria, Gabbiano o Slot)" },
      { t: "chatWord", word: "ciao", n: 1, title: "Saluta in chat", desc: "Scrivi “ciao” (o simili) in chat" },
      { t: "room", room: "discoteca", n: 1, title: "Visita la discoteca", desc: "Entra nella discoteca" },
      { t: "room", room: "terrazza", n: 1, title: "Guarda le stelle", desc: "Entra nella terrazza delle stelle" }
    ],

    minigames: {
      memory: { name: "Memoria di coppie", emoji: "🧠", who: "leo", how: "Trova le coppie di emoji prima che scada il tempo", rewardBase: 5 },
      gabbiano: { name: "Whack-a-Tino!", emoji: "🕊️", who: "tino", how: "Tocca i gabbiani che spuntano. Quello dorato vale 3 punti!", rewardBase: 4 },
      slot: { name: "Jackpot delle risate", emoji: "🎰", who: "gigi", how: "Punta 5 monete e allinea le emoji", rewardBase: 0 },
      treasure: { name: "Caccia al tesoro", emoji: "🧭", who: "tino", how: "Trova il forziere in pochi tentativi. Ogni errore riduce il premio!", rewardBase: 6 }
    },

    story3: {
      lola: "Ha un archivio segreto di cravatte sorridenti. La prossima festa la inaugura lei.",
      pino: "Una volta la valigia è tornata con un souvenir di un posto che non esiste. Non ne parla volentieri.",
      leo: "Sta programmando un’IA che perde a scacchi apposta per far piacere agli umani.",
      guest2: "Il suo corno da unicorno funziona davvero… come lampada. Con 4 livelli di luce da festa.",
      rigo: "Sa il nome di ogni fenicottero gonfiabile della piscina. Tutti si chiamano Federico.",
      max: "Ha un remix della sveglia del Miraggio che fa dormire. Lo tiene per le emergenze.",
      nina: "Le margherite le confidano i segreti del giardino. Il cespuglio invece tace (è timido).",
      guest1: "Ha vinto un concorso di sonno nel 2019. Il premio era un altro pisolino.",
      gigi: "Tiene una collezione di olive famose. Quella che ha visto tutto è la sua preferita.",
      stella: "Ha dato un nome a tutte le stelle cadenti di quest’anno. La prossima si chiamerà come te.",
      tino: "Il suo nido segreto è sopra la cucina: lì custodisce patatine e ricordi. In quest’ordine.",
      sergio: "La sua ricetta più preziosa è quella delle patatine della nonna. La nonna non la svela nemmeno a lui."
    },
    furnitureShop: [
      { e: "🪴", name: "Pianta fortunata", cost: 20, prod: 1, desc: "produce 1 🪙 ogni 30s" },
      { e: "🛋️", name: "Divano delle idee", cost: 60, prod: 2, desc: "produce 2 🪙 ogni 30s" },
      { e: "🎹", name: "Pianola magica", cost: 120, prod: 3, desc: "produce 3 🪙 ogni 30s" },
      { e: "🖼️", name: "Quadro parlante", cost: 40, prod: 1, desc: "ogni tanto racconta una barzelletta" },
      { e: "⏰", name: "Sveglia gentile", cost: 35, prod: 1, desc: "non sveglia: accarezza" },
      { e: "🧸", name: "Orsetto coccole", cost: 25, prod: 1, desc: "produce coccole (e 1 🪙)" },
      { e: "🕹️", name: "Cabinet arcade", cost: 90, prod: 2, desc: "produce 2 🪙 ogni 30s" },
      { e: "🍩", name: "Ciambella infinita", cost: 30, prod: 1, desc: "si rigenera da sola" },
      { e: "💡", name: "Lampada dei sogni", cost: 55, prod: 2, desc: "illumina le idee (e le monete)" },
      { e: "🛁", name: "Vasca rilassante", cost: 80, prod: 2, desc: "bolle di sapone e monete" }
    ],
    events: [
      { h: 12, m: 0, emoji: "🍹", name: "Ora dello Spritz", msg: "🍹 È l’Ora dello Spritz: per 30 minuti tutte le monete varranno il doppio!", mult: 2, dur: 30 },
      { h: 21, m: 0, emoji: "🪩", name: "Festa a sorpresa", msg: "🪩 Festa a sorpresa! Tutti ballano e le monete valgono il doppio!", mult: 2, dur: 30 }
    ],
    dailyGuestMult: 2,
    emotes: [
      { id: "wave", e: "👋", label: "Ciao", txt: "Ciao a tutti!", anim: "wave", dur: 1600 },
      { id: "dance", e: "🕺", label: "Ballo", txt: "🎶 mi piace ballare!", anim: "dance", dur: 2600 },
      { id: "jump", e: "🤸", label: "Salto", txt: "Hop!", anim: "jump", dur: 1100 },
      { id: "clap", e: "👏", label: "Applausi", txt: "Bravi, bravi!", anim: "clap", dur: 1600 },
      { id: "heart", e: "💖", label: "Cuore", txt: "💖 per tutti voi!", anim: "heart", dur: 1800 },
      { id: "angry", e: "😠", label: "Rabbia", txt: "Oh, adesso basta!", anim: "angry", dur: 1500 },
      { id: "laugh", e: "😂", label: "Risata", txt: "Ahahah!", anim: "laugh", dur: 1500 },
      { id: "dive", e: "🤿", label: "Tuffo", txt: "Pluff!", anim: "dive", dur: 1600 }
    ],

    wardrobe: {
      hairStyle: [
        { id: "short", label: "Corto", cost: 0 },
        { id: "long", label: "Lungo", cost: 15 },
        { id: "curly", label: "Ricci", cost: 25 },
        { id: "puff", label: "Fiocco", cost: 40 },
        { id: "bald", label: "Palla di luce", cost: 12 }
      ],
      acc: [
        { id: "none", label: "Niente", cost: 0 },
        { id: "glasses", label: "Occhiali", cost: 20 },
        { id: "cap", label: "Cappellino", cost: 30 },
        { id: "headphones", label: "Cuffie", cost: 45 },
        { id: "crown", label: "Coroncina", cost: 90 }
      ],
      skin: ["#ffe0bd", "#f2c9a0", "#eab98a", "#c68b59", "#8d5a2b"],
      hairColor: ["#4a2a14", "#2b1b0e", "#d9a441", "#c0392b", "#8e44ad", "#2c3e50", "#7f8c8d", "#ecf0f1"],
      top: ["#ff5d9e", "#5b3bd6", "#00c9b7", "#ff8f3c", "#3ddc97", "#e84f8a", "#4ea8ff", "#ffd166"],
      pants: ["#3a2a8f", "#1f3b73", "#7b2d8b", "#c2185b", "#0b7285", "#37474f"]
    },

    badges: [
      { min: 0, title: "Neo-arrivato", icon: "🌱" },
      { min: 80, title: "Ospite allegro", icon: "😄" },
      { min: 160, title: "Chiacchierone", icon: "💬" },
      { min: 260, title: "Stella dell’hotel", icon: "⭐" },
      { min: 420, title: "Vip del Miraggio", icon: "👑" },
      { min: 700, title: "Leggenda vivente", icon: "🌟" }
    ],

    ambientInterval: 7000
  };

  if (typeof module !== "undefined" && module.exports) module.exports = G;
  if (typeof window !== "undefined") window.MIRAGGIO = G;
})();
