/* ============================================================
   STANZA 9 — contenuti (storia, luoghi, personaggi, dialoghi)
   Contratto dati usato dal motore in core.js
   ============================================================ */
(function () {
  'use strict';
  const G = {

    meta: {
      id: 'stanza9',
      title: 'STANZA 9',
      subtitle: "L'albergo dei ricordi",
      intro: [
        "Meridia, luglio 2025. Una piccola città di provincia con un albergo chiuso in cima alla collina: l'Hotel Meridia, sprangato dal 2013.",
        "Dieci anni fa, nell'estate del 2015, sei amici ci passavano le notti. Si chiamavano <b>la Stanza 9</b>, come la camera in cui si nascondevano. Tu eri il sesto… e quella notte, l'ultima notte, non c'eri. <b>Giulia</b>, la fondatrice della Stanza 9, non è mai uscita da quell'incendio.",
        "Stasera, alle 23:47, il vecchio account di Giulia — spento da un decennio — ha pubblicato nel gruppo una foto dell'albergo e una riga: <i>«L'ultima notte. Vieni TU.»</i>",
        "Il server del vecchio mondo sociale in cui era nata la Stanza 9 verrà spento tra sette giorni. Tutto sparirà: le camere, le chat, i messaggi. I tuoi amici sono già tutti qui, in città. Nessuno di loro ha mai raccontato cosa accadde davvero.",
        "Hai sette giorni. Tocca il pavimento per camminare, tocca le persone per parlare."
      ],
      howto: ['Cammina: tocca il pavimento', 'Parla: tocca un personaggio', 'Apri telefono 📱, diario 📓 e Stanza 9 💻 dall’alto']
    },

    /* ---------------- PERSONAGGI ---------------- */
    chars: {
      giulia:   { name: 'Giulia',   short: 'Giulia',   role: 'la fondatrice · 2015', emoji: '🌙', skin: '#f2c9a0', hair: '#5b3b26', hairStyle: 2, top: '#2c2f4a', gender: 'f', ghost: true },
      mattia:   { name: 'Mattia',   short: 'Mattia',   role: 'barista al Bar La Torre', emoji: '🍺', skin: '#eab98a', hair: '#3a2a20', hairStyle: 1, top: '#c2573d', gender: 'm' },
      sofia:    { name: 'Sofia',    short: 'Sofia',    role: 'infermiera alla Clinica', emoji: '🩺', skin: '#f0c49c', hair: '#1e1a2e', hairStyle: 0, top: '#2e7d8c', gender: 'f', acc: 'glasses' },
      davide:   { name: 'Davide',   short: 'Davide',   role: 'corriere · fratello di Giulia', emoji: '📦', skin: '#eab98a', hair: '#241a12', hairStyle: 1, top: '#e0a12b', gender: 'm' },
      emma:     { name: 'Emma',     short: 'Emma',     role: 'sviluppatrice · ex di Miraggio', emoji: '💾', skin: '#f7d2ae', hair: '#c95b8a', hairStyle: 2, top: '#7a5ac9', gender: 'f', acc: 'hat' },
      gabriele: { name: 'Prof. Ferri', short: 'prof.', role: 'archivista · ex professore', emoji: '📚', skin: '#e5c39a', hair: '#cfd4da', hairStyle: 1, top: '#5d6a4a', gender: 'm', acc: 'glasses' },
      giorgio:  { name: 'Giorgio',  short: 'Giorgio',  role: 'ex proprietario dell’Hotel Meridia', emoji: '🗝️', skin: '#e5c39a', hair: '#c9ccd1', hairStyle: 0, top: '#4a5a6a', gender: 'm' }
    },

    /* ---------------- OGGETTI ---------------- */
    items: {
      biglietto: { name: 'Biglietto del treno', emoji: '🎫', desc: 'Meridia–Roma, mai usato. 12 luglio 2015.' },
      diario:    { name: 'Diario di Sofia', emoji: '📖', desc: 'L’estate 2015, giorno per giorno. L’ultima pagina è strappata.' },
      registro:  { name: 'Registro manutenzioni', emoji: '🗂️', desc: 'Dell’Hotel Meridia. «12/03/13 — catena e lucchetto al cancello posteriore».' },
      accendino: { name: 'Accendino', emoji: '🔥', desc: 'Di Mattia. «Quella sera l’ho spento subito. La scintilla no.»' },
      scatola:   { name: 'La scatola delle lettere', emoji: '📦', desc: 'Annerita, con dentro sette buste. Una per ciascuno di voi.' },
      scheda:    { name: 'Scheda di memoria', emoji: '💿', desc: 'Dalla videocamera di Emma. Recuperata dalla scatola.' },
      portatile: { name: 'Portatile di Giulia', emoji: '💻', desc: 'Annerito, ancora acceso quel giorno. Emma dice che l’hard disk si può salvare.' },
      chiave:    { name: 'Chiave dell’Hotel', emoji: '🗝️', desc: 'Giorgio l’ha tenuta per dieci anni. «Aprite. Io non posso più.»' },
      lettera:   { name: 'La tua lettera', emoji: '💌', desc: 'Scritta da Giulia per te, nella scatola. Non l’hai ancora letta.' }
    },

    /* ---------------- LUOGHI ---------------- */
    rooms: {
      piazza: {
        name: 'Piazza della Stazione', emoji: '⛲', mood: 'day', w: 660, h: 430, tile1: '#d9cdb8', tile2: '#cfc2ab',
        wall: '#b7a98e', walkTop: 120,
        doors: [
          { x: 70,  y: 60, to: 'bar',     emoji: '🍺', label: 'Bar La Torre' },
          { x: 185, y: 60, to: 'clinica', emoji: '🏥', label: 'Clinica' },
          { x: 300, y: 60, to: 'archivio',emoji: '🏛️', label: 'Archivio' },
          { x: 415, y: 60, to: 'soffitta',emoji: '🏠', label: 'Casa Emma' },
          { x: 530, y: 60, to: 'rimessa', emoji: '🚚', label: 'Rimessa' }
        ],
        specialDoors: [
          { x: 470, y: 300, to: 'hotel', emoji: '🏨', label: 'Hotel Meridia', req: 'open_hotel', locked: 'La porta dell’Hotel è ancora sprangata. Ti serve una chiave.' }
        ],
        npc: [
          { id: 'giorgio', x: 555, y: 330, from: 5 }
        ],
        furniture: [
          { x: 330, y: 250, e: '⛲', s: 52 },
          { x: 90,  y: 260, e: '🪴', s: 30 },
          { x: 250, y: 330, e: '🚲', s: 34 },
          { x: 440, y: 150, e: '🌳', s: 60 }
        ],
        hotspots: [
          { x: 338, y: 226, e: '💠', label: 'La fontana', text: ['La fontana della piazza è spenta da anni. Nel 2015 era piena di monetine e di voi.'] },
          { x: 100, y: 240, e: '❓', label: 'Manifesto', text: ['Un manifesto semistrappato: «Hotel Meridia — riapertura a data da destinarsi». Qualcuno ci ha scritto sopra, col pennarello: «perché mentite?»'] }
        ]
      },

      bar: {
        name: 'Bar La Torre', emoji: '🍺', mood: 'gold', w: 620, h: 430, tile1: '#8a6f52', tile2: '#7f6448', wall: '#5d4632',
        npc: [{ id: 'mattia', x: 300, y: 200 }],
        furniture: [
          { x: 60,  y: 90, e: '🪵', s: 120, shape: 'bar' }, // bancone disegnato a parte? uso emoji semplice
          { x: 110, y: 80, e: '🍾', s: 26 }, { x: 130, y: 92, e: '🥃', s: 24 }, { x: 200, y: 200, e: '🪑', s: 30 }, { x: 460, y: 90, e: '📺', s: 40 }, { x: 500, y: 220, e: '🪑', s: 30 }, { x: 420, y: 330, e: '🪴', s: 34 }, { x: 80, y: 330, e: '🎯', s: 44 }
        ],
        hotspots: [
          { x: 475, y: 75, e: '📺', label: 'Televisore', text: ['Un tg locale: «Il comune valuta il futuro dell’area Meridia». Mattia abbassa il volume.'] },
          { x: 90, y: 70, e: '🎵', label: 'Jukebox', text: ['Il jukebox suona la stessa canzone dell’estate 2015. Nessuno l’ha cambiata.'] }
        ]
      },

      clinica: {
        name: 'Clinica San Marco', emoji: '🏥', mood: 'blue', w: 620, h: 430, tile1: '#b9c4c9', tile2: '#aebbc1', wall: '#8ea0a8',
        npc: [{ id: 'sofia', x: 310, y: 200 }],
        furniture: [
          { x: 80,  y: 100, e: '🛏️', s: 46 }, { x: 250, y: 90, e: '🩺', s: 30 }, { x: 460, y: 100, e: '🚪', s: 36 }, { x: 500, y: 260, e: '🪑', s: 30 }, { x: 150, y: 300, e: '🖥️', s: 40 }, { x: 80, y: 340, e: '🪴', s: 30 }, { x: 420, y: 340, e: '🧺', s: 32 }
        ],
        hotspots: [
          { x: 500, y: 250, e: '🖼️', label: 'Quadro', text: ['Un quadro col paesaggio dell’Hotel Meridia. Sotto, una targhetta: «Donato dalla famiglia Ferri, 2016».'] }
        ]
      },

      archivio: {
        name: 'Archivio comunale', emoji: '🏛️', mood: 'dusk', w: 620, h: 430, tile1: '#b8a88e', tile2: '#ac9c82', wall: '#87775c',
        npc: [{ id: 'gabriele', x: 300, y: 190 }],
        furniture: [
          { x: 60, y: 100, e: '📚', s: 56 }, { x: 160, y: 90, e: '🗄️', s: 48 }, { x: 300, y: 80, e: '🕰️', s: 40 }, { x: 470, y: 100, e: '🗄️', s: 48 }, { x: 500, y: 320, e: '🪑', s: 30 }, { x: 120, y: 330, e: '🖼️', s: 40 }, { x: 300, y: 340, e: '🧳', s: 34 }
        ],
        hotspots: [
          { x: 530, y: 85, e: '📷', label: 'Fotografie', text: ['Scatole di foto del paese. C’è anche il Meridia coi tendaggi bianchi, estate ’95. Sembra un albergo felice.'] }
        ]
      },

      soffitta: {
        name: 'Casa di Emma (soffitta)', emoji: '🏠', mood: 'night', w: 620, h: 430, tile1: '#4b4f72', tile2: '#434767', wall: '#333752',
        npc: [{ id: 'emma', x: 310, y: 200 }],
        furniture: [
          { x: 80,  y: 100, e: '🖥️', s: 60 }, { x: 240, y: 90, e: '📺', s: 40 }, { x: 420, y: 100, e: '🛋️', s: 60 }, { x: 460, y: 260, e: '🎮', s: 34 }, { x: 160, y: 300, e: '🍕', s: 30 }, { x: 60, y: 340, e: '🌱', s: 30 }, { x: 330, y: 350, e: '🧸', s: 32 }
        ],
        hotspots: [
          { x: 100, y: 85, e: '🖥️', label: 'Server', text: ['Scatole nere impilate: l’archivio di Miraggio. Emma ci lavora da settimane. Un led rosso lampeggia.'] }
        ]
      },

      rimessa: {
        name: 'Rimessa Mercurio', emoji: '🚚', mood: 'dim', w: 620, h: 430, tile1: '#6d7482', tile2: '#636a77', wall: '#4a4f5a',
        npc: [{ id: 'davide', x: 320, y: 190 }],
        furniture: [
          { x: 90,  y: 110, e: '🚚', s: 90 }, { x: 250, y: 100, e: '🔧', s: 34 }, { x: 440, y: 100, e: '🗄️', s: 44 }, { x: 480, y: 320, e: '🛢️', s: 40 }, { x: 120, y: 330, e: '🧰', s: 40 }, { x: 300, y: 330, e: '⚙️', s: 36 }
        ],
        hotspots: [
          { x: 460, y: 85, e: '📦', label: 'Scatoloni', text: ['Scatoloni con scritto «casa». Davide deve traslocare. Non l’ha ancora fatto.'] }
        ]
      },

      hotel: {
        name: 'Hotel Meridia — atrio', emoji: '🏨', mood: 'night', w: 660, h: 430, tile1: '#6e5f52', tile2: '#65564a', wall: '#40342b',
        npc: [{ id: 'giulia', x: 330, y: 170, from: 7 }],
        furniture: [
          { x: 90,  y: 110, e: '🗄️', s: 50 }, { x: 330, y: 80, e: '🕯️', s: 30 }, { x: 500, y: 110, e: '🪞', s: 46 }, { x: 180, y: 290, e: '🪑', s: 30 }, { x: 420, y: 290, e: '🪑', s: 30 }, { x: 320, y: 350, e: '🧳', s: 36 }, { x: 70, y: 350, e: '🕸️', s: 34 }
        ],
        hotspots: [
          { x: 330, y: 60, e: '📋', label: 'Registro camere', text: ['Il registro fermo al 2013. Alla pagina «9» c’è una croce a matita, e sotto: «i ragazzi».'] }
        ]
      },

      stanza9: {
        name: 'Stanza 9 — l’ultima camera online', emoji: '💻', mood: 'dim', w: 620, h: 430, tile1: '#22304e', tile2: '#1e2a45', wall: '#16203a',
        npc: [{ id: 'giulia', x: 330, y: 160 }],
        furniture: [
          { x: 150, y: 100, e: '🪟', s: 60 }, { x: 420, y: 100, e: '🛏️', s: 54 }, { x: 480, y: 280, e: '🪑', s: 30 }, { x: 120, y: 300, e: '📻', s: 36 }
        ],
        hotspots: [
          { x: 150, y: 80, e: '🌙', label: 'La finestra', text: ['Fuori dalla finestra, Meridia è ferma alle 03:07 del 12 luglio 2015. Qui dentro, invece, è sempre estate.'] }
        ]
      }
    },

    /* ---------------- CAPITOLI ---------------- */
    chapters: [
      {
        n: 1, day: 'Giovedì 3 luglio 2025', title: 'La convocazione',
        intro: [
          'Sei sceso dal treno delle 18:40. La stazione di Meridia è identica: le stesse panchine verdi, lo stesso odore di estate che non arriva.',
          '<i>«L’ultima notte. Vieni TU.»</i> — il messaggio è ancora nel gruppo. Nessuno dei tuoi ha risposto, eppure sono tutti qui. Come se ti aspettassero da dieci anni.',
          'Il bar è ancora aperto. La clinica fa il turno unico. E l’archivio comunale, al piano terra del municipio, è l’unico posto in città che conserva ancora la memoria di tutti.'
        ],
        objective: 'Parla con <b>Mattia</b> al Bar La Torre, <b>Sofia</b> alla Clinica e il <b>prof. Ferri</b> all’Archivio.',
        chat: [
          { from: 'sistema', text: 'Sei entrato nel gruppo «La Stanza 9» (12 membri → 6 attivi → 2 online).' },
          { from: 'gruppo', text: 'ecco. è lui. dieci anni e si presenta solo ora.' },
          { from: 'gruppo', text: 'lascialo stare, mattia. nessuno di noi è mai tornato prima.' },
          { from: 'gruppo', text: 'il meridia chiude i conti stasera? ditemelo voi. io alle 23 devo ricaricare le macchine.' },
          { from: 'giulia', text: 'ciao. non rispondere a nessuno prima di averli guardati in faccia. te lo chiedo io.' }
        ],
        beats: [
          { cond: { scene: ['mattia_1', 'sofia_1', 'gabriele_1'] }, do: { flag: ['day1_ok'], obj: 'La notte ti aspetta. Domani si torna in giro: <b>Davide</b> e <b>Emma</b>.', toast: 'Hai rivisto i primi. La città ti guarda.' } }
        ]
      },
      {
        n: 2, day: 'Venerdì 4 luglio 2025', title: 'L’archivio è vivo',
        intro: [
          'Stanotte, alle 01:07, nel gruppo è arrivato un altro messaggio dall’account di Giulia. Stavolta non era un testo: era il link a una stanza.',
          'La vecchia piattaforma — si chiamava <b>Miraggio</b>, la usavate a tredici anni — è ancora online su un server dimenticato. E la Stanza 9, la camera che Giulia aveva arredato per voi, è ancora lì. La sua avatar è seduta vicino alla finestra.',
          'Emma ha scoperto l’archivio per caso, lavorando a un progetto. Davide, il fratello di Giulia, sapeva del server. Nessuno dei due si parla da anni.'
        ],
        objective: 'Trova <b>Davide</b> alla rimessa e <b>Emma</b> in soffitta. Poi apri la <b>Stanza 9</b> dal telefono (pulsante 💻).',
        chat: [
          { from: 'sistema', text: '01:07 — Messaggio inoltrato dall’archivio Miraggio.' },
          { from: 'giulia', text: 'I. — Se state leggendo, vuol dire che non ci sono più riuscita a scrivervi di persona. Non piangete. Non ancora. C’è una cosa che non vi ho mai detto sull’ultima notte, e finché non la saprete, resterete fermi. Lo so perché vi conosco. Resto io a muovermi, per ora.' }
        ],
        beats: [
          { cond: { scene: ['davide_1', 'emma_1'] }, do: { flag: ['day2_ok', 'open_stanza9'], obj: 'Entra nella <b>Stanza 9</b> 💻 e parla con Giulia.', chat: [{ from: 'gruppo', text: 'il link funziona ancora??' }, { from: 'emma', text: 'funziona. ed è pure peggio di quanto pensassi.' }], toast: '💻 La Stanza 9 è raggiungibile dal telefono.' } }
        ]
      },
      {
        n: 3, day: 'Sabato 5 luglio 2025', title: 'La scatola e la catena',
        intro: [
          'Nella Stanza 9, l’avatar di Giulia ti ha mostrato una cosa che nessuno aveva mai visto: una scatola di latta, mezza bruciata, con dentro delle buste. «Le avevo preparate quella notte», ha scritto. «Non so se le avete mai trovate.»',
          'Oggi i tuoi amici sono pronti a raccontare di più. Ognuno di loro ha custodito un pezzo — un diario, un registro, un segreto — senza mai metterlo in comune.',
          'È il giorno in cui capisci che non stai indagando su un incidente. Stai ricostruendo una notte che loro hanno diviso in sette versioni.'
        ],
        objective: 'Approfondisci con <b>Mattia</b>, <b>Sofia</b> e il <b>prof. Ferri</b>: ognuno custodisce un ricordo.',
        chat: [
          { from: 'sistema', text: '02:12 — Messaggio inoltrato dall’archivio Miraggio.' },
          { from: 'giulia', text: 'II. — Vi ho visti litigare mille volte su chi doveva dire cosa, quella mattina. Ve lo dico io, da qui: non era colpa di nessuno. Era l’albergo. Era vecchio, era nostro, ed era già morto. Voi siete solo stati gli ultimi a volergli bene.' },
          { from: 'gruppo', text: 'ma chi la manda? emma, è un tuo script?' },
          { from: 'emma', text: 'no. giuro. è l’archivio. lei aveva programmato qualcosa nel 2015 e nessuno lo sapeva.' }
        ],
        beats: [
          { cond: { scene: ['mattia_2', 'sofia_2', 'gabriele_2'] }, do: { flag: ['day3_ok'], obj: 'Stasera, nella Stanza 9, la scatola potrebbe aprirsi. Parlane con gli altri.', toast: 'Tre ricordi in più. La notte comincia a prendere forma.' } }
        ]
      },
      {
        n: 4, day: 'Domenica 6 luglio 2025', title: 'Chi c’era, quella notte',
        intro: [
          'Mancano quattro giorni allo spegnimento del server. In città, intanto, è successa una cosa strana: il comune ha esposto un cartello davanti all’Hotel Meridia. «Area in attesa di destinazione». Emma dice che è sempre stato lì. Tu non lo ricordi.',
          'Davide ha passato la notte a sistemare scatoloni che non spedirà mai. Emma ha trovato, nell’archivio, la vecchia videocamera di suo padre — quella dell’estate 2015.',
          'Oggi tocca a loro due: il fratello che era lì, e l’amica che ha filmato tutto senza mai guardare i filmati.'
        ],
        objective: 'Parla con <b>Davide</b> e <b>Emma</b>: loro c’erano, quella notte.',
        chat: [
          { from: 'sistema', text: '03:47 — Messaggio inoltrato dall’archivio Miraggio.' },
          { from: 'giulia', text: 'III. — Davide, se sei lì: quella felpa che ti ho lanciato era la mia preferita. Non perché fosse bella. Perché sapevo che l’avresti tenuta. Smettila di incolparti: sei stato sveglio fino alle tre, quella notte, per farmi compagnia. Io ti ho promesso di svegliarti. E ti ho svegliato. Ricorda solo quello.' },
          { from: 'davide', text: '...' },
          { from: 'davide', text: 'chi ti ha dato il mio numero.' }
        ],
        beats: [
          { cond: { scene: ['davide_2', 'emma_2'] }, do: { flag: ['day4_ok'], obj: 'Domani: l’ultimo giro di verità con tutti. Poi la Stanza 9.', toast: 'Davide ha parlato. È la prima volta in dieci anni.' } }
        ]
      },
      {
        n: 5, day: 'Lunedì 7 luglio 2025', title: 'La notte intera',
        intro: [
          'Questa notte, nella Stanza 9, l’avatar di Giulia ha acceso la webcam del portatile. Per un secondo, sullo schermo, c’è stata un’immagine granulosa: una camera, una finestra, le tre del mattino.',
          'Oggi non ci sono più mezze verità. Ognuno di voi racconterà la notte intera, dal suo punto di vista. Quando avrete finito, per la prima volta, la sequenza dei fatti sarà completa.',
          'C’è anche un nome che nessuno ha mai fatto: <b>Giorgio</b>, il proprietario dell’albergo. Vive ancora qui, in città.'
        ],
        objective: 'Completa la notte con <b>Mattia</b>, <b>Sofia</b>, <b>Davide</b>, <b>Emma</b> e il <b>prof. Ferri</b>. Poi rientra nella <b>Stanza 9</b>.',
        chat: [
          { from: 'sistema', text: '02:02 — Messaggio inoltrato dall’archivio Miraggio.' },
          { from: 'giulia', text: 'IV. — Vi ho aspettati tutti al Meridia quella notte. Anche chi non è venuto. Anche chi è venuto e ha fatto finta di niente, il giorno dopo. Non vi chiedo di perdonarvi. Vi chiedo di ricordare nella stessa stanza, per una volta, senza scappare. La memoria è l’unica stanza che non si può chiudere a chiave.' },
          { from: 'gruppo', text: 'domani sera ci vediamo tutti al bar. senza scuse.' }
        ],
        beats: [
          { cond: { scene: ['mattia_3', 'sofia_3', 'davide_3', 'emma_3', 'gabriele_3', 'st9_2'] }, do: { flag: ['day5_ok', 'giorgio_out'], obj: 'Cerca <b>Giorgio</b>, l’ex proprietario dell’Hotel. È in piazza.', chat: [{ from: 'gruppo', text: 'allora era vero. la catena.' }, { from: 'sofia', text: 'chiamiamo mio zio che fa l’avvocato?' }, { from: 'davide', text: 'no. prima lo guardiamo in faccia.' }], toast: 'La notte è intera, ora. Mancano due nomi: Giorgio… e Giulia.' } }
        ]
      },
      {
        n: 6, day: 'Martedì 8 luglio 2025', title: 'Il lucchetto',
        intro: [
          'Giorgio ti aspetta in piazza, sulla panchina vicino alla fontana spenta. Ha ottant’anni, le mani che tremano e una chiave in tasca che non usa da dieci anni.',
          '«La catena l’ho messa io», dice appena ti siedi. «Nel 2013, per non far entrare i ragazzi. Poi i ragazzi siete diventati voi. E quando è successo, non ho avuto il coraggio di dire che la porta da cui Giulia non è uscita l’avevo chiusa io.»',
          'Oggi è il giorno delle scelte. Emma ti mostrerà cosa ha trovato nell’hard disk. Mattia, Sofia e Davide ti chiederanno, ognuno a modo suo, che cosa si fa adesso.'
        ],
        objective: 'Parla con <b>Giorgio</b> (piazza), <b>Emma</b> (soffitta) e almeno uno tra <b>Mattia</b>, <b>Sofia</b>, <b>Davide</b>.',
        chat: [
          { from: 'sistema', text: '04:31 — Messaggio inoltrato dall’archivio Miraggio.' },
          { from: 'giulia', text: 'V. — Emma, se stai pensando di ricostruirmi: non farlo. Non per me. Io non sono nei server, sono nella scatola e nei vostri ricordi. Ma se vuoi salvare qualcosa, salva le chat. Salva le foto. Salva la stanza. Quella sì che può vivere senza di me.' },
          { from: 'emma', text: 'non lo so. non lo so.' }
        ],
        beats: [
          { cond: { scene: ['giorgio_1', 'emma_4'], anyScene: ['mattia_4', 'sofia_4', 'davide_4'] }, do: { flag: ['day6_ok'], obj: 'Domani, l’ultima notte. La porta dell’Hotel è aperta.', chat: [{ from: 'gruppo', text: 'domani alle 23 al meridia. chi c’è c’è.' }], toast: 'Hai la chiave. Domani si apre la porta.' } }
        ]
      },
      {
        n: 7, day: 'Mercoledì 9 luglio 2025', title: 'L’ultima notte',
        intro: [
          'Il server si spegne a mezzanotte. Stasera, per la prima volta in dieci anni, la porta dell’Hotel Meridia si apre.',
          'Nell’atrio c’è odore di polvere e di estate. Sul registro, alla pagina della camera 9, qualcuno ha scritto una riga nuova: <i>«gli ultimi arrivano alle 23. portate la scatola.»</i>',
          'La Stanza 9 non è mai stata una camera d’albergo. Era un posto dove stare. Adesso devi decidere che cosa diventa, adesso che siete grandi abbastanza per scegliere.'
        ],
        objective: 'Entra nell’<b>Hotel Meridia</b> (porta in piazza, a destra della rimessa).',
        chat: [
          { from: 'sistema', text: '23:40 — Il server Miraggio verrà spento tra 20 minuti.' },
          { from: 'giulia', text: 'VI. — Eccolo, l’ultimo giro. Non serve che mi diciate addio. Serviva solo che veniste. Io, da qui, vedo la porta. E per la prima volta da dieci anni, la porta è aperta. Grazie. Adesso tocca a voi decidere cosa resta acceso.' }
        ],
        beats: [
          { cond: { flag: 'in_hotel', ch: 7 }, do: { open: 'finale' } }
        ]
      }
    ],

    /* ---------------- SCENE ---------------- */
    scenes: {
      /* ===== MATTIA ===== */
      mattia_1: {
        ch: 'mattia', day: 1, icon: '🍺', title: 'Al bancone',
        text: [
          'Il Bar La Torre è vuoto, ma Mattia è dietro al bancone a lucidare un bicchiere che è già lucidissimo. Ti vede e non si ferma.',
          '«Dieci anni. E ti presenti per quel messaggio, non per noi.» Alza gli occhi. «Lo so, sembro uno stronzo. È che l’ultima volta che ho rivisto tutti insieme è stato al funerale, e Giulia non c’era, perché Giulia era nella bara. Quindi: perché sei qui?»'
        ],
        opts: [
          { t: '«Perché il messaggio diceva “vieni TU”. E perché a te nessuno ha mai chiesto scusa.»', to: null, fx: { trust: { mattia: 6 }, flag: ['mattia_1_ok'], toast: 'Mattia si blocca per un secondo.' } },
          { t: '«Non lo so. Forse per capire perché non ci siamo più parlati.»', to: null, fx: { trust: { mattia: 3 }, flag: ['mattia_1_ok'] } },
          { t: '«Senti, il messaggio era di Giulia. Tu che ne pensi?»', to: null, fx: { trust: { mattia: 2 }, flag: ['mattia_1_ok'] } }
        ]
      },
      mattia_2: {
        ch: 'mattia', day: 3, icon: '🔥', title: 'La radio',
        need: { done: 'mattia_1' },
        text: [
          'È quasi chiusura. Mattia ti versa un caffè e resta in piedi, di fronte a te, senza bancone in mezzo.',
          '«Quella notte… c’era una radio a pile nella Stanza 9. Di Giorgio, lasciata lì da quando aveva chiuso. L’ho accesa io, per ballare. Faceva scintille ogni volta che la spostavi.» Abbassa la voce. «L’ho spenta. Ho spento la radio. Ma la scintilla era già partita, e io non l’ho detto a nessuno. Per dieci anni ho pensato: se non l’avessi accesa…»'
        ],
        opts: [
          { t: '«Una scintilla non è una colpa. La colpa sarebbe stata non dirlo, e adesso l’hai detto.»', to: null, fx: { trust: { mattia: 7 }, frag: 'fr2', item: 'accendino', toast: '🔥 Ricordo ritrovato: la radio.' } },
          { t: '«Perché non l’hai mai detto?»', to: null, fx: { trust: { mattia: 4 }, frag: 'fr2', item: 'accendino', toast: '🔥 Ricordo ritrovato: la radio.' } },
          { t: '«Tieni. Lo so che bevi da allora. Non per la radio, vero?»', to: null, fx: { trust: { mattia: 5 }, frag: 'fr2', item: 'accendino', toast: '🔥 Ricordo ritrovato: la radio.' } }
        ]
      },
      mattia_3: {
        ch: 'mattia', day: 5, icon: '🕯️', title: 'Il conteggio',
        need: { done: 'mattia_2' },
        text: [
          'Il bar è chiuso. Mattia ha spento l’insegna e ha messo due bicchieri d’acqua sul bancone. «Niente alcol stasera. Ho deciso.»',
          '«Quando è uscito il fumo, ho contato. Erano le tre di notte, eravamo in cortile, e io contavo le persone: Sofia, Emma, Davide, il ragazzo del piano di sotto… sette? Otto? E poi ho capito: mancava Giulia. Sono rientrato fin sulla scala, ma il fumo era già nero. Qualcuno mi ha tirato indietro. Non so chi. Non ho mai saputo chi.»'
        ],
        opts: [
          { t: '«Sei rientrato a prenderla. Questo è quello che conta, Mattia.»', to: null, fx: { trust: { mattia: 8 }, frag: 'fr7', flag: ['mattia_clean'], toast: '🕯️ Ricordo ritrovato: il conteggio.' } },
          { t: '«E se fossi stato tu a tirarmi indietro, quella notte, non mi diresti mai di saperlo.»', to: null, fx: { trust: { mattia: 6 }, frag: 'fr7', toast: '🕯️ Ricordo ritrovato: il conteggio.' } }
        ]
      },
      mattia_4: {
        ch: 'mattia', day: 6, icon: '🕯️', title: 'La scelta del barista',
        need: { done: 'mattia_3', trust: { mattia: 40 } },
        text: [
          'Mattia sta chiudendo il bar per sempre. «Il proprietario vende. E io… ho smesso da una settimana. Il primo luglio. Il giorno prima del messaggio, guarda caso.»',
          '«Domani apriamo l’albergo. Io ci sarò. Ma prima voglio sentirtelo dire: che cosa cerchi lì dentro, dopo dieci anni?»'
        ],
        opts: [
          { t: '«Cerco una risposta che non sia una condanna per nessuno. Vieni con me?»', to: null, fx: { trust: { mattia: 9 }, flag: ['alleato_mattia'], toast: '❤️ Mattia è con te.' } },
          { t: '«Cerco Giulia. O quello che resta del posto dove stava.»', to: null, fx: { trust: { mattia: 6 }, flag: ['alleato_mattia'] } },
          { t: '«Non lo so. Ma so che non voglio più che finisca come dieci anni fa: ognuno da solo.»', to: null, fx: { trust: { mattia: 8 }, flag: ['alleato_mattia'] } }
        ]
      },

      /* ===== SOFIA ===== */
      sofia_1: {
        ch: 'sofia', day: 1, icon: '🩺', title: 'Il turno',
        text: [
          'Trovi Sofia al bancone della clinica che compila moduli. Non alza la testa, ma la voce è stanca, non arrabbiata.',
          '«Devo finire il turno, poi ho quello di notte. Siediti. Dieci anni fa, in questo stesso posto, mi hai detto che saresti tornato a trovarmi. Poi è successo quello che è successo, e nessuno è più tornato. Nemmeno tu.» Ora ti guarda. «Perché adesso sì?»'
        ],
        opts: [
          { t: '«Perché ho letto il messaggio e ho pensato a te. A come eravamo, non a come siamo finiti.»', to: null, fx: { trust: { sofia: 6 }, flag: ['sofia_1_ok'] } },
          { t: '«Non lo so, Sofia. Ho paura di sapere.»', to: null, fx: { trust: { sofia: 3 }, flag: ['sofia_1_ok'] } },
          { t: '«Tu che cosa ricordi di quella notte?»', to: null, fx: { trust: { sofia: 2 }, flag: ['sofia_1_ok'] } }
        ]
      },
      sofia_2: {
        ch: 'sofia', day: 3, icon: '📖', title: 'L’ultima pagina',
        need: { done: 'sofia_1' },
        text: [
          'Sofia ti fa salire nello sgabuzzino dell’infermeria, chiude la porta e tira fuori un quaderno: il diario dell’estate 2015.',
          '«Quella notte litigammo. Io volevo andare via — l’albergo era pericoloso, lo dicevo da settimane. Giulia disse: “per questo è nostro”. Mi girai. Fu l’ultima cosa che le dissi: “fai la scema, io vado”. E invece sono rimasta. Sono rimasta fino al fumo.» Sfoglia il diario fino all’ultima pagina, strappata. «Quello che c’era scritto qui, quella notte, non l’ho mai detto a nessuno.»'
        ],
        opts: [
          { t: '«Leggimelo. Anche se fa male. Stavolta lo leggiamo insieme.»', to: null, fx: { trust: { sofia: 8 }, frag: 'fr3', item: 'diario', toast: '📖 Ricordo ritrovato: la lite.' } },
          { t: '«Non devi dirmelo se non sei pronta. Ma tienilo: la pagina strappata la troviamo noi.»', to: null, fx: { trust: { sofia: 6 }, frag: 'fr3', item: 'diario', toast: '📖 Ricordo ritrovato: la lite.' } }
        ]
      },
      sofia_3: {
        ch: 'sofia', day: 5, icon: '📞', title: 'La cabina',
        need: { done: 'sofia_2' },
        text: [
          'Sofia ti aspetta fuori dalla clinica, seduta sul muretto. Ha in mano il diario, chiuso.',
          '«Fui io a chiamare i vigili del fuoco. Da una cabina, perché il mio cellulare era scarico — ed era una scusa, volevo che non si vedesse il numero. Dissi solo: “c’è un incendio al Meridia, c’è ancora qualcuno dentro”. Poi riattaccai. E per dieci anni ho ripetuto a me stessa che se avessi dato il mio nome, se fossi scesa prima…»'
        ],
        opts: [
          { t: '«Hai chiamato i soccorsi. Senza di te, forse non sarebbe rimasto nulla da salvare.»', to: null, fx: { trust: { sofia: 8 }, frag: 'fr8', flag: ['sofia_parla'], toast: '📞 Ricordo ritrovato: la chiamata.' } },
          { t: '«Chiamasti da una cabina perché avevi paura. È umano. Ora possiamo dirlo ad alta voce.»', to: null, fx: { trust: { sofia: 7 }, frag: 'fr8', toast: '📞 Ricordo ritrovato: la chiamata.' } }
        ]
      },
      sofia_4: {
        ch: 'sofia', day: 6, icon: '🕊️', title: 'Il turno di notte',
        need: { done: 'sofia_3', trust: { sofia: 40 } },
        text: [
          'Sofia ha finito il turno. Per la prima volta da anni, non ne ha un altro subito dopo.',
          '«Ho chiamato mia madre. Le ho detto che torno a cena domenica. Non lo faccio dal 2016.» Sorride, appena. «Domani all’albergo porto il diario. Se qualcuno vorrà leggere la pagina che ho strappato, la rileggeremo insieme. È l’unico modo che conosco per chiudere un turno: passare le consegne.»'
        ],
        opts: [
          { t: '«Passa le consegne, allora. La notte è nostra, adesso.»', to: null, fx: { trust: { sofia: 9 }, flag: ['alleato_sofia'], toast: '❤️ Sofia è con te.' } },
          { t: '«Tua madre ti aspetta da dieci anni. Vacci, Sofia.»', to: null, fx: { trust: { sofia: 7 }, flag: ['alleato_sofia'] } }
        ]
      },

      /* ===== PROF. FERRI ===== */
      gabriele_1: {
        ch: 'gabriele', day: 1, icon: '📚', title: 'L’archivista',
        text: [
          'Il prof. Ferri ti riceve tra gli scaffali dell’archivio, con un tè che fuma. Ti riconosce subito.',
          '«Eri il più silenzioso della Stanza 9. Giulia diceva che eri il suo archivista: quello che ricordava per tutti.» Sorride. «Poi lei non c’è più, e tu hai smesso di ricordare. La città intera ha smesso, in realtà. Sapete che l’Hotel Meridia non risulta nemmeno più nelle mappe turistiche? Come se non fosse mai esistito.»'
        ],
        opts: [
          { t: '«Professore, lei perché non ha mai smesso di ricordare?»', to: null, fx: { trust: { gabriele: 6 }, flag: ['gabriele_1_ok'] } },
          { t: '«Esiste ancora qualcosa dell’albergo? Documenti, registri?»', to: null, fx: { trust: { gabriele: 4 }, flag: ['gabriele_1_ok'] } },
          { t: '«Qualcuno in città sa cosa successe davvero?»', to: null, fx: { trust: { gabriele: 3 }, flag: ['gabriele_1_ok'] } }
        ]
      },
      gabriele_2: {
        ch: 'gabriele', day: 3, icon: '🗂️', title: 'Il registro',
        need: { done: 'gabriele_1' },
        text: [
          'Il professore ti mette davanti un registro pesante, coperto di polvere: le manutenzioni dell’Hotel Meridia.',
          '«Cerca la data: 12 marzo 2013.» Lo apri. C’è una sola riga, scritta con calligrafia frettolosa: «catena e lucchetto al cancello posteriore. Chiave dispersa». Il professore ti guarda sopra gli occhiali. «Il cancello posteriore era la seconda uscita della Stanza 9. Quella da cui si scappava, quando si entrava di nascosto. Nel 2013 qualcuno l’ha chiuso. E nessuno, nel 2015, lo sapeva.»'
        ],
        opts: [
          { t: '«Quindi quella notte l’uscita di sicurezza era chiusa. E nessuno lo ha mai detto in aula.»', to: null, fx: { trust: { gabriele: 8 }, frag: 'fr5', item: 'registro', toast: '🗂️ Ricordo ritrovato: la catena.' } },
          { t: '«Perché l’inchiesta non l’ha mai scoperto?»', to: null, fx: { trust: { gabriele: 7 }, frag: 'fr5', item: 'registro', toast: '🗂️ Ricordo ritrovato: la catena.' } }
        ]
      },
      gabriele_3: {
        ch: 'gabriele', day: 5, icon: '📷', title: 'Le foto',
        need: { done: 'gabriele_2' },
        text: [
          'Il professore ha preparato una scatola di fotografie sul tavolo. «Le ho raccolte per anni. Nessuno le ha mai chieste.»',
          'Nelle foto: voi a tredici anni sul lungofiume, la Stanza 9 arredata con le cose rubate ai mercatini, Giulia che scrive su un quaderno. E poi, in fondo, una foto sfocata: la collina del Meridia di notte, con una luce accesa alla finestra della camera 9.',
          '«Quella notte la fece un fotografo dilettante, un ragazzo di passaggio. Non disse nulla a nessuno. Me la portò nel 2016, prima di andarsene. Disse: “lì dentro c’era qualcuno che aspettava qualcun altro”.»'
        ],
        opts: [
          { t: '«Professore, lei crede che la città sapesse e abbia scelto di non sapere?»', to: null, fx: { trust: { gabriele: 8 }, frag: 'fr1', toast: '📷 Ricordo ritrovato: la luce alla finestra.' } },
          { t: '«“Qualcuno che aspettava qualcun altro”. Chi aspettava Giulia?»', to: null, fx: { trust: { gabriele: 7 }, frag: 'fr1', toast: '📷 Ricordo ritrovato: la luce alla finestra.' } },
          { t: '«Tenga le foto. Domani le porto all’albergo, se vuole.»', to: null, fx: { trust: { gabriele: 9 }, frag: 'fr1', toast: '📷 Ricordo ritrovato: la luce alla finestra.' } }
        ]
      },

      /* ===== DAVIDE ===== */
      davide_1: {
        ch: 'davide', day: 2, icon: '📦', title: 'La rimessa',
        text: [
          'Davide è sotto un furgone, con le chiavi inglesi. Quando ti vede, esce rotolando e si siede per terra, senza salutare.',
          '«Mia sorella è morta che io avevo dodici anni. Tu eri in vacanza, quell’estate, vero? A Rimini. Mentre lei bruciava, tu eri a Rimini.» Pausa. «Scusa. Non è colpa tua. È che da dieci anni sono arrabbiato con tutti quelli che c’erano, e tu sei l’unico che non c’era. Per questo il messaggio era per te, probabilmente. Sei l’unico che può guardarli senza odio.»'
        ],
        opts: [
          { t: '«E tu? Tu puoi guardarli senza odio?»', to: null, fx: { trust: { davide: 6 }, flag: ['davide_1_ok'] } },
          { t: '«Non ero a Rimini per scelta. Ma hai ragione: non c’ero. Per questo sono qui.»', to: null, fx: { trust: { davide: 5 }, flag: ['davide_1_ok'] } },
          { t: '«Cosa ricordi di quella notte, Davide?»', to: null, fx: { trust: { davide: 3 }, flag: ['davide_1_ok'] } }
        ]
      },
      davide_2: {
        ch: 'davide', day: 4, icon: '🌙', title: 'La promessa',
        need: { done: 'davide_1' },
        text: [
          'Davide ti porta nel retro della rimessa, dove tiene le cose di sua sorella in una cassetta di legno. Ne tira fuori una felpa bruciacchiata.',
          '«Quella notte dormivo nella camera 10. Giulia mi aveva promesso: “ti sveglio io, promesso”. E mi svegliò. Mi tirò giù dal letto, mi spinse verso la finestra sul cortile, mi fece scendere dalla grondaia. Poi disse: “la scatola delle lettere è rimasta su. Aspettami”. Io la aspettai. Aspettai per ore, in cortile, finché non arrivarono i pompieri. Non l’ho più vista. Per anni ho pensato: se non fossi stato lì, se non avessi dormito…»'
        ],
        opts: [
          { t: '«Lei è tornata per la scatola. Perché dentro c’erano le lettere per tutti voi. Non è colpa tua se amava troppo.»', to: null, fx: { trust: { davide: 8 }, frag: 'fr4', toast: '🌙 Ricordo ritrovato: la promessa.' } },
          { t: '«La grondaia. Sei sceso dalla grondaia. Quanto è durata l’attesa, Davide?»', to: null, fx: { trust: { davide: 7 }, frag: 'fr4', toast: '🌙 Ricordo ritrovato: la promessa.' } }
        ]
      },
      davide_3: {
        ch: 'davide', day: 5, icon: '💻', title: 'La finestra',
        need: { done: 'davide_2' },
        text: [
          'Davide ha passato la notte a guardare la felpa. Stavolta è lui a parlare, senza che tu chieda.',
          '«Quando il fumo è diventato nero, ho visto una cosa che non ho mai detto a nessuno. L’ho vista alla finestra della camera 9: Giulia. Teneva in braccio la scatola. L’ha spinta fuori, oltre il davanzale, ed è caduta in cortile con un tonfo. Poi si è voltata verso l’interno. E il fumo l’ha coperta.»',
          'Tira fuori un portatile annerito. «Questo è il suo. L’hanno trovato nella camera 9, tra le macerie. Era ancora acceso. Emma dice che l’hard disk… si può salvare.»'
        ],
        opts: [
          { t: '«La scatola è caduta in cortile. Allora esiste ancora. Dobbiamo trovarla.»', to: null, fx: { trust: { davide: 9 }, frag: 'fr10', item: 'portatile', toast: '💻 Ricordo ritrovato: la finestra. Portatile di Giulia.' } },
          { t: '«Vuoi che lo dia a Emma? Solo lei può salvare quello che c’è dentro.»', to: null, fx: { trust: { davide: 7 }, frag: 'fr10', item: 'portatile', toast: '💻 Ricordo ritrovato: la finestra.' } },
          { t: '«Eri solo un bambino, Davide. Hai fatto tutto quello che potevi.»', to: null, fx: { trust: { davide: 6 }, frag: 'fr10', item: 'portatile', toast: '💻 Ricordo ritrovato: la finestra.' } }
        ]
      },
      davide_4: {
        ch: 'davide', day: 6, icon: '🕯️', title: 'L’ultimo giro',
        need: { done: 'davide_3', trust: { davide: 40 } },
        text: [
          'Davide ha lavato il furgone. Non l’aveva mai fatto di domenica.',
          '«Domani apro io la porta dell’albergo. Giorgio mi ha dato la chiave? No. Me l’ha data a te. Ha detto: “il ragazzo che non c’era deve aprire la porta a quelli che c’erano”. Che poi… è una cosa che avrebbe detto Giulia.» Sorride, la prima volta. «Ci sei, domani?»'
        ],
        opts: [
          { t: '«Ci sono. E stavolta nessuno aspetta da solo in cortile.»', to: null, fx: { trust: { davide: 9 }, flag: ['alleato_davide'], toast: '❤️ Davide è con te.' } },
          { t: '«Apri tu la porta. Io entro per ultimo, come dieci anni fa. Stavolta è giusto così.»', to: null, fx: { trust: { davide: 8 }, flag: ['alleato_davide'] } }
        ]
      },

      /* ===== EMMA ===== */
      emma_1: {
        ch: 'emma', day: 2, icon: '💾', title: 'Il server',
        text: [
          'Emma ti accoglie in un appartamento pieno di monitor. Uno schermo mostra una stanza virtuale: la Stanza 9, con la sua avatar seduta vicino alla finestra.',
          '«L’ho trovata per caso. Lavoravo al recupero dei vecchi server di Miraggio — il comune li ha comprati a peso, pensavano fossero rottami. E invece… la Stanza 9 era ancora lì. Tutta. I mobili, le chat, le foto. E il suo account, che risponde ancora alle parole chiave che lei aveva programmato.» Si toglie gli occhiali. «Non è Giulia. Lo so. Ma è la cosa più vicina a Giulia che esista al mondo, e tra sei giorni la spegnono.»'
        ],
        opts: [
          { t: '«Cosa risponde, il suo account?»', to: null, fx: { trust: { emma: 6 }, flag: ['emma_1_ok'] } },
          { t: '«Non è Giulia, Emma. Ma è il suo ultimo regalo. E possiamo salvarlo.»', to: null, fx: { trust: { emma: 7 }, flag: ['emma_1_ok'] } },
          { t: '«Perché stai cercando da sola? Perché non l’hai detto agli altri?»', to: null, fx: { trust: { emma: 5 }, flag: ['emma_1_ok'] } }
        ]
      },
      emma_2: {
        ch: 'emma', day: 4, icon: '📼', title: 'La videocamera',
        need: { done: 'emma_1' },
        text: [
          'Emma ha recuperato la videocamera di suo padre dal solaio. «Quella notte l’avevo portata. Dovevamo fare un documentario sull’estate, lo avevamo promesso a Giulia: “quest’anno è l’ultimo, lo filmiamo”.»',
          'La scheda di memoria è mezza bruciata, ma Emma è riuscita a leggerne un frammento: pochi secondi, ripresi dalla finestra della camera 9. Si vede il cortile, la notte, e si sente la voce di Giulia che dice: <i>«se questa estate finisce, non voglio che finisca nei ricordi. Voglio che finisca in un posto dove si può tornare.»</i>',
          '«Il frammento finisce lì. La telecamera l’ho ritrovata nella scatola — la scatola delle lettere. Qualcuno l’aveva rimessa dentro, quella notte.»'
        ],
        opts: [
          { t: '«“Un posto dove si può tornare”. Emma, la Stanza 9 era quel posto.»', to: null, fx: { trust: { emma: 8 }, frag: 'fr6', item: 'scheda', toast: '📼 Ricordo ritrovato: il fumo sotto la porta.' } },
          { t: '«Mostralo agli altri. Questa volta il documentario lo finiamo.»', to: null, fx: { trust: { emma: 7 }, frag: 'fr6', item: 'scheda', toast: '📼 Ricordo ritrovato: il fumo sotto la porta.' } }
        ]
      },
      emma_3: {
        ch: 'emma', day: 5, icon: '🖥️', title: 'L’hard disk',
        need: { done: 'emma_2' },
        text: [
          'Emma ha lavorato tutta la notte. Quando arrivi, i monitor mostrano file recuperati dal portatile di Giulia.',
          '«La webcam era accesa. Il portatile registrava in automatico, in loop. Ho recuperato un’ora, quella dell’1:30 alle 2:30.» Esita. «Giulia sapeva. Sapeva dell’albergo, della catena… forse sapeva anche dell’incendio. Nella registrazione parla da sola, davanti alla telecamera, come se scrivesse una lettera a qualcuno che non c’è.»',
          '«Non te la faccio vedere. Non ancora. Prima devo sapere una cosa: se dentro quel file c’è il suo addio, voi cosa ci farete?»'
        ],
        opts: [
          { t: '«Lo ascolteremo insieme. Tutti. È quello che avrebbe voluto.»', to: null, fx: { trust: { emma: 9 }, toast: 'Emma annuisce. «Allora lo salvo.»' } },
          { t: '«Forse non siamo pronti. Forse non lo saremo mai.»', to: null, fx: { trust: { emma: 4 } } }
        ]
      },
      emma_4: {
        ch: 'emma', day: 6, icon: '🤖', title: 'La domanda',
        need: { done: 'emma_3', trust: { emma: 35 } },
        text: [
          'Emma ti aspetta davanti a uno schermo nero. C’è scritto solo: «giulia_v2 — in attesa di dati».',
          '«Ho tutto. Le chat, le foto, l’audio, la sua voce. Con i modelli di oggi potrei… costruire qualcosa che le somiglia. Che risponde come lei. Che ricorda come lei.» Si morde il labbro. «Lo so che è sbagliato. Lo so che non è lei. Ma quando spegneranno il server, sarà l’unica cosa che resta. Dimmi tu cosa faccio. Sei l’unico che non c’era: puoi dirlo senza il peso di averla persa.»'
        ],
        opts: [
          { t: '«Non costruire un fantasma, Emma. Costruisci un archivio vivo: la Stanza 9 come museo, chat e foto che chi vuole può visitare. Lei vive lì, non in una voce sintetica.»', to: null, fx: { trust: { emma: 10 }, flag: ['emma_archivio'], toast: 'Emma guarda lo schermo nero. «Un archivio vivo.»' } },
          { t: '«FallO. Fallo, se ti aiuta a dirle addio. Ma promettimi che alla fine la spegni tu.»', to: null, fx: { trust: { emma: 6 }, flag: ['emma_ai'], toast: 'Emma annuisce, lentamente.' } },
          { t: '«Non lo so. Ma so che la scelta non può essere solo tua. Dillo agli altri.»', to: null, fx: { trust: { emma: 7 }, flag: ['emma_archivio'] } }
        ]
      },

      /* ===== GIORGIO ===== */
      giorgio_1: {
        ch: 'giorgio', day: 5, icon: '🗝️', title: 'Il proprietario',
        need: {},
        text: [
          'Giorgio è sulla panchina della fontana, con un cappotto troppo pesante per luglio. Quando ti siedi, inizia a parlare senza preamboli.',
          '«La catena l’ho messa io, nel 2013. L’albergo era chiuso, i ragazzi ci entravano lo stesso — tu lo sai. Volevo chiudere il cancello posteriore, quello del cortile. Mi dissero che era sbagliato, che era un’uscita di sicurezza. Io risposi: “di sicurezza per chi?”.» Chiude gli occhi. «Il 12 luglio 2015, alle tre di notte, sono arrivato prima dei pompieri. Ho visto la catena. Ho visto la chiave… che avevo gettato nel 2013, perché tanto non serviva più.»',
          'Tira fuori una chiave ossidata. «L’ho ritrovata l’anno scorso, ripulendo il giardino. La tenevo per restituirla a qualcuno. Credo che quel qualcuno sia tu.»'
        ],
        opts: [
          { t: '«Giorgio, lei non ha acceso l’incendio. Ma ha chiuso una porta. E non l’ha mai detto.»', to: null, fx: { frag: 'fr9', item: 'chiave', flag: ['open_hotel'], trust: { giorgio: 0 }, toast: '🗝️ Chiave dell’Hotel ottenuta. Ricordo: il lucchetto.' } },
          { t: '«Perché non l’ha detto all’inchiesta?»', to: null, fx: { frag: 'fr9', item: 'chiave', flag: ['open_hotel'], trust: { giorgio: 0 }, toast: '🗝️ Chiave dell’Hotel ottenuta.' } },
          { t: '«Lei ha tenuto questa chiave per dieci anni. Domani apriamo noi la porta. Vuole esserci?»', to: null, fx: { frag: 'fr9', item: 'chiave', flag: ['open_hotel', 'giorgio_viene'], trust: { giorgio: 0 }, toast: '🗝️ Chiave dell’Hotel ottenuta. Giorgio tace a lungo. Poi annuisce.' } }
        ]
      },

      /* ===== GIULIA (Stanza 9) ===== */
      st9_1: {
        ch: 'giulia', day: 2, icon: '🌙', title: 'La prima volta',
        text: [
          'La Stanza 9 è identica a come la ricordavi: il divano rubato al mercatino, la lampada a forma di luna, la finestra sul cortile. L’avatar di Giulia è seduta sul davanzale.',
          'Sullo schermo compare una scritta, lenta: <i>«Sapevo che saresti stato tu il primo a entrare. Sei sempre stato il mio archivista.»</i>',
          'La stanza è vuota, ma non ti sembra vuota. Ti sembra in attesa.'
        ],
        opts: [
          { t: '«Ciao, Giulia. Sono tornato.»', to: null, fx: { toast: 'La lampada a forma di luna si accende da sola.' } },
          { t: '«Cosa mi stai aspettando a dirmi?»', to: null, fx: {} }
        ]
      },
      st9_2: {
        ch: 'giulia', day: 5, icon: '🕯️', title: 'Le 03:07',
        need: { frag: 7 },
        text: [
          'La Stanza 9, questa notte, è diversa: la finestra è aperta e fuori non c’è più la città ferma. Fuori c’è il cortile dell’Hotel Meridia, in fiamme, in una luce arancione che non fa rumore.',
          'L’avatar di Giulia ti aspetta in mezzo alla stanza. Scrive: <i>«Ora che avete messo insieme la notte, guarda: era così. Io non sono mai stata nella 9 quando è partito il fuoco. Ero nella 10, a svegliare Davide. Poi sono scesa per la scatola. La webcam del portatile registrava: so cosa avete visto. Non abbiate paura di guardarmi mentre torno indietro.»</i>',
          'Sul muro della stanza compare, come una scritta luminosa: <b>03:07 — l’ora in cui tutto si è fermato.</b>'
        ],
        opts: [
          { t: '«Non ti abbiamo mai chiesto scusa per non essere stati lì.»', to: null, fx: { frag: 'fr11', toast: '🕯️ Ricordo ritrovato: le 03:07. La webcam era accesa.' } },
          { t: '«Eri nella 10. Eri andata a svegliare Davide. Nessuno lo sapeva.»', to: null, fx: { frag: 'fr11', toast: '🕯️ Ricordo ritrovato: le 03:07.' } }
        ]
      },
      st9_3: {
        ch: 'giulia', day: 6, icon: '📦', title: 'La scatola',
        need: { frag: 9 },
        text: [
          'Nella Stanza 9, al centro, c’è adesso una scatola di latta annerita. Non è un oggetto della stanza: è reale. Emma l’ha portata qui, recuperata dal cortile dell’albergo dieci anni fa, senza mai aprirla.',
          'Dentro ci sono sette buste, una per ciascuno di voi, scritte a mano. Sulla tua c’è scritto: <i>«per l’archivista — apri per ultimo»</i>.',
          'L’avatar di Giulia scrive: <i>«Le lettere le ho scritte il 10 luglio, due giorni prima. Non sapevo cosa sarebbe successo. Ma sapevo che una stanza dove si sta bene, prima o poi, va chiusa. E ho voluto lasciarvi le chiavi.»</i>'
        ],
        opts: [
          { t: '«Domani le consegniamo. Ognuno la sua.»', to: null, fx: { item: 'scatola', toast: '📦 La scatola delle lettere è con te.' } }
        ]
      },

      /* ===== FINALE ===== */
      finale: {
        ch: 'giulia', day: 7, icon: '🛎️', title: 'La scelta',
        text: [
          'L’atrio dell’Hotel Meridia è pieno di polvere e di luce di luna. I tuoi amici sono tutti lì — Mattia dietro il bancone vuoto, Sofia con il diario, Davide con la felpa, Emma con il portatile, il professore con le fotografie. E Giorgio, in fondo, con il cappotto.',
          'Emma apre il portatile. Sullo schermo, la Stanza 9: l’avatar di Giulia è in piedi al centro, e accanto a lei, per la prima volta, la scatola delle lettere è aperta.',
          '«Il server si spegne tra poco», dice Emma. «È il momento di scegliere che cosa lasciamo acceso.»'
        ],
        opts: [
          { t: '📼 «Accendiamo il video. Giulia ha parlato per ultima, dieci anni fa. Meritiamo di ascoltarla.»', to: '__end:voce', need: { frag: 11, trustSum: 330, item: 'portatile' }, fx: {} },
          { t: '🏨 «Facciamo della Stanza 9 un posto vero: apriamo l’albergo, archiviamo tutto, torniamo ogni anno.»', to: '__end:stanza', need: { frag: 8, trustSum: 210 }, fx: {} },
          { t: '💌 «Consegniamo le lettere e lasciamo andare. Ognuno torna a casa con la sua busta e con la verità.»', to: '__end:commiato', need: { trustSum: 80 }, fx: {} },
          { t: '🕯️ «Spegniamo tutto. Stanotte chiudiamo noi la porta, come si deve.»', to: '__end:silenzio', fx: {} }
        ]
      }
    },

    /* ---------------- PICCOLE CHIACCHIERE (ogni giorno, +1 fiducia) ---------------- */
    smalltalk: {
      mattia: ['«Caffè?» — e te lo prepara senza aspettare risposta. «Come va? No, non quello. Dico: come stai davvero?»', '«Oggi ho contato i bicchieri che non ho lavato. Zero. È un record.»', '«La radio del jukebox… l’ho fatta sistemare. Non suona più quella canzone. O forse sì, ma ora posso ascoltarla.»'],
      sofia: ['«Ho dormito quattro ore. È il mio massimo dal 2015.»', '«I pazienti dicono che sorrido di più. Non so se è vero, ma è carino sentirlo.»', '«Il diario è chiuso nello zaino. Non l’apro. Ma so dov’è. È già qualcosa.»'],
      davide: ['«Oggi ho spedito due pacchi. Solo due. Ma li ho spediti.»', '«La felpa è piegata sul divano. Non la indosso più. Ma non la metto via.»', '«Mia sorella diceva che i furgoni puzzano. Aveva ragione. L’ho lavato.»'],
      emma: ['«Il server fa un rumore che mi rilassa. Lo so, sono strana.»', '«Ho trovato una chat del 2013. Giulia ci scriveva “domani vi aspetto”. Domani è oggi, a volte.»', '«Non ho ancora deciso niente. Ma stasera ho dormito senza incubi.»'],
      gabriele: ['«Il tè è pronto. Siediti, raccontami della tua città.»', '«Ho messo da parte altre foto. Il Meridia merita un archivio tutto suo.»', '«Sai qual è il mestiere più importante? Ricordare. Il resto viene dopo.»'],
      giorgio: ['«La chiave è al suo posto. Non la tocco più, adesso tocca a voi.»', '«Ho scritto una lettera per la famiglia di Giulia. Dieci anni di ritardo, ma scritta.»']
    },

    /* ---------------- RICORDI (12) ---------------- */
    fragments: [
      { id: 'fr1',  e: '📷', line: 'Il 12 luglio il gruppo si ritrova come ogni estate al Meridia. Emma porta la videocamera: «quest’anno è l’ultimo. Lo filmiamo.»' },
      { id: 'fr2',  e: '🔥', line: 'Nella Stanza 9 c’è una radio a pile lasciata da Giorgio. Mattia la accende per ballare. Una scintilla. Poi il silenzio.' },
      { id: 'fr3',  e: '🧃', line: 'Sofia litiga con Giulia alle due: «restare è da idioti, questo posto è pericoloso». Giulia ride: «per questo è nostro».' },
      { id: 'fr4',  e: '🌙', line: 'Davide, 12 anni, dorme nella camera 10. Giulia gli ha promesso: «ti sveglio io. Promesso.»' },
      { id: 'fr5',  e: '⛓️', line: 'Il cancello posteriore è chiuso da una catena con lucchetto. Nel registro: «12/03/13. Chiave dispersa». Nessuno lo disse mai.' },
      { id: 'fr6',  e: '📼', line: 'Emma vede il fumo sotto la porta della 9. La videocamera è rimasta dentro. Scende a prenderla: è lì che tutto comincia.' },
      { id: 'fr7',  e: '🕯️', line: 'Mattia conta nel cortile: otto, sette… manca Giulia. Rientra sulle scale, ma il fumo è già nero.' },
      { id: 'fr8',  e: '📞', line: 'Sofia chiama i pompieri da una cabina, senza dare il nome. «C’è ancora qualcuno dentro.»' },
      { id: 'fr9',  e: '🗝️', line: 'Giorgio arriva prima di tutti. Davanti alla catena trema: «Dov’è la chiave?» — «L’ho gettata nel 2013.»' },
      { id: 'fr10', e: '🧥', line: 'Dal cortile, Davide vede Giulia alla finestra della 9. Spinge fuori la scatola delle lettere. Poi il fumo la copre.' },
      { id: 'fr11', e: '🕯️', line: '03:07. La webcam del portatile è accesa. Giulia è tornata indietro per la scatola: non per sé. Per voi.' },
      { id: 'fr12', e: '💿', line: '«Per questo vi ho chiamati qui. Non per la verità. Per il dopo. La Stanza 9 non è mai stata una camera: siete voi.»' }
    ],

    /* ---------------- FINALI ---------------- */
    endings: {
      voce: {
        badge: 'FINALE — LA VOCE', badgeStyle: 'background:linear-gradient(135deg,#ff5d8f,#7aa5ff);color:#fff',
        title: '«Per il dopo»',
        text: [
          'Il video è granuloso, girato alle due di notte, nella camera 9. Giulia parla alla webcam come se parlasse a ciascuno di voi.',
          '«Se state guardando, vuol dire che la porta si è chiusa davvero. Non abbiate paura. Io ho avuto paura per tutta l’estate, e poi ho smesso: ho capito che le cose importanti non sono quelle da cui non si esce. Sono quelle in cui si entra sapendo che si può uscire diversi.»',
          'Parla di ognuno di voi, per nome. Di Mattia e della sua risata che non sapeva chiedere aiuto. Di Sofia e del coraggio di restare. Di Davide e della felpa. Di Emma e dei mondi che costruisce per non abitare il suo. Del professore che ricorda per tutti. E di te, l’archivista, che non c’era e che è tornato per primo.',
          'Quando il video finisce, nessuno parla. Poi Mattia mette su un caffè. Sofia apre il diario all’ultima pagina. Davide mette la felpa sul bancone. Emma salva il file con un nome nuovo: «per il dopo».',
          'L’albergo non riapre come hotel. Riapre come casa della memoria del paese: il comune accetta l’archivio, le foto, le lettere. La Stanza 9 diventa una stanza vera, al piano terra, dove chi vuole può sedersi, leggere e ricordare.',
          'Ogni 12 luglio, qualcuno lascia una monetina nella fontana. La città, stavolta, ricorda.'
        ]
      },
      stanza: {
        badge: 'FINALE — LA STANZA VIVA', badgeStyle: 'background:linear-gradient(135deg,#4fd8f5,#7aa5ff);color:#fff',
        title: 'La stanza viva',
        text: [
          'Scegliete di non guardare il video. Non ancora. Emma lo archivia con una scritta: «da aprire quando saremo pronti». Forse lo sarete. Forse no. Ma esiste.',
          'La scatola delle lettere viene aperta sul bancone dell’atrio. Ognuno legge la propria, in silenzio. Poi le rimettete tutte dentro, insieme.',
          'L’Hotel Meridia non riapre come albergo. Riapre come spazio della comunità: il bar al piano terra, l’archivio di foto e chat al primo, la Stanza 9 — ricostruita identica, con la lampada a luna e la finestra sul cortile — come stanza delle riunioni.',
          'Emma ci lavora. Il professore ci porta le sue scatole. Mattia serve il caffè. Sofia ci tiene un piccolo ambulatorio il sabato. Davide, ogni tanto, si siede sulla finestra della 9 e guarda il cortile.',
          'Il server di Miraggio si spegne a mezzanotte, ma nessuno se ne accorge: la Stanza 9 ora è di mattoni, e le chiavi le avete voi.'
        ]
      },
      commiato: {
        badge: 'FINALE — IL COMMIATO', badgeStyle: 'background:linear-gradient(135deg,#ffd98a,#ff9e6b);color:#3a2410',
        title: 'Le lettere',
        text: [
          'Consegnate le lettere una a una, in silenzio, nell’atrio polveroso. Ognuno legge la propria da solo, voltandosi verso la finestra per non farsi vedere.',
          'Il video resta chiuso nel portatile. Emma lo mette in una busta sigillata e la consegna a Davide: «Quando vorrai. Non prima.»',
          'Spegnete il server alle 23:59. Per un secondo, sullo schermo spento, compare la scritta dell’avatar: «grazie. adesso andate a vivere.»',
          'Vi stringete la mano in cortile, sotto la finestra della 9. Non promettete di rivedervi. È la prima volta che non ne avete bisogno per crederci.',
          'Giorgio resta l’ultimo, con la chiave in mano. La infila nella toppa e la gira. «Chiudo io», dice. «Questa volta è una porta normale.»'
        ]
      },
      silenzio: {
        badge: 'FINALE — IL SILENZIO', badgeStyle: 'background:rgba(255,255,255,.1);color:#cfd8e8',
        title: 'La porta chiusa',
        text: [
          'La discussione nell’atrio dura poco. Le parole sono quelle di dieci anni, mai dette, e pesano più della polvere.',
          'Qualcuno se ne va prima. Qualcun altro resta a guardare il portatile spento. Alla fine chiudete la porta dell’Hotel Meridia e ognuno torna per la sua strada.',
          'Il server si spegne alle 23:59. Per un secondo, sullo schermo dell’atrio, compare una scritta: «la porta era aperta». Poi il buio.',
          'L’indomani lasci una monetina nella fontana spenta, come si fa con i desideri. Non sai se è un desiderio o una scusa. Ma la lasci.',
          'La storia non è finita: le storie vere non finiscono mai del tutto. Finiscono quando qualcuno smette di raccontarle. Forse, un giorno, qualcuno di voi tornerà a raccontare.'
        ]
      }
    }
  };

  // piccolo helper di compatibilità per test in Node
  if (typeof module !== 'undefined' && module.exports) module.exports = G;
  if (typeof window !== 'undefined') window.STANZA9 = G;
})();
