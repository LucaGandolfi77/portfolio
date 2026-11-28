/* ===== MORFALIA · 6-Chapter Story Campaign, Quests & 10 Custodian Diaries ===== */

export const CHAPTERS = [
  {
    id: 1,
    title: 'Il Risveglio nella Landa',
    region: 'landa',
    introDialog: [
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Oh! Oh, cielo! La teca di vetro si è schiusa... e tu sei un Mimo! Dopo tutti questi secoli di silenzio, non sono più solo!'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Hai assunto una silhouette così tenera e somigliante agli antichi Custodi umani. Io sono il Professor Intreccio: da quando la Valle si è addormentata, aspetto qualcuno con il dono di ricreare la vita.'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Vedi quel grande edificio in rovina più a nord? È il Santuario del Seme. Per risvegliare la Landa, raccogli risorse, costruisci Habitat accoglienti e stringi amicizia con i Biomini!'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Un segreto: i Biomini che vengono a vivere nei tuoi Habitat ti insegneranno le loro Morfomimosi! Comincia raccogliendo rami, pietre e argilla, poi crea un Banco da Lavoro o parla con me quando vuoi un consiglio.'
      }
    ]
  },
  {
    id: 2,
    title: 'Le Maree di Cenere',
    region: 'costa',
    introDialog: [
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Incredibile! Il Santuario del Seme pulsa di nuovo e la brezza ha aperto il passaggio verso la Costa di Cenere! Usa la Mappa per viaggiare laggiù.'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Un tempo quella baia era azzurra e piena di vele. Usa Zampillo per lavare via la cenere grigia e trasformarla in sabbia dorata, e attira Ramosauro per imparare il potere Taglio!'
      }
    ]
  },
  {
    id: 3,
    title: 'Scintille sul Basalto',
    region: 'creste',
    introDialog: [
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Il Faro delle Maree splende sull\'oceano! Le sue lenti hanno indicato il sentiero per le Creste di Basalto.'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Lassù i Custodi costruirono la loro Centrale Eolica. Fai amicizia con Ciotolino e Voltacchio per imparare Spacca e Scintilla: ti serviranno per estrarre ferro e riaccendere i generatori!'
      }
    ]
  },
  {
    id: 4,
    title: 'Il Respiro della Foresta',
    region: 'foresta',
    introDialog: [
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Le turbine delle Creste girano di nuovo! Ora possiamo addentrarci nella Foresta di Nebbia, dove l\'antico Albero Madre dorme sotto una coltre di spore viola.'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Attira Zefirino costruendo una Radura della Brezza: il suo potere Brezza purificherà le spore e farà emergere i sentieri nascosti del bosco.'
      }
    ]
  },
  {
    id: 5,
    title: 'Sopra le Nuvole',
    region: 'isole',
    introDialog: [
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'L\'Albero Madre ha dispiegato i suoi rami fino al cielo e ha risvegliato l\'ascensore eolico verso le Isole Sospese!'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Quello era l\'ultimo rifugio dei Custodi umani. Raggiungi le Isole sulla Mappa, scopri gli ultimi Diari, impara l\'Eco Armonico da Luminella e riaccendi il Faro di Risonanza!'
      }
    ]
  },
  {
    id: 6,
    title: 'La Serra dei Tesori',
    region: 'landa',
    introDialog: [
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Mimo... abbiamo letto tutti i messaggi dei Custodi. Non ci hanno abbandonati: hanno seminato il tuo risveglio affinché Morfalia rinascesse con gentilezza, pronta per un nuovo incontro.'
      },
      {
        speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿',
        text: 'Ho un ultimo, piccolo sogno personale: costruire la Serra dei Tesori del Professore — una Serra di vetro circondata da Scaffale Botanico, Fontana e Vaso di Fiori. Se realizzerai questo Habitat, persino il leggendario Astralio scenderà a celebrare con noi!'
      }
    ]
  }
];

export const QUESTS = [
  // Chapter 1
  {
    id: 'q1_gather', chapter: 1,
    title: 'Primi Passi nella Landa',
    desc: 'Raccogli almeno 4 Rami di Legno e 3 Pietre Grezze toccando le risorse nella Landa.',
    check: (s) => (s.stats.gathered.wood || 0) >= 4 && (s.stats.gathered.stone || 0) >= 3,
    progress: (s) => `Rami ${Math.min(4, s.stats.gathered.wood || 0)}/4 · Pietre ${Math.min(3, s.stats.gathered.stone || 0)}/3`,
    reward: { seed_turnip: 3, berry: 3 },
    onCompleteDialog: [
      { speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿', text: 'Ben fatto! Ora guarda vicino allo stagno o tra i cespugli: costruisci un Focolare (1 Falò + 1 Panchina di Tronco dal menu Crea) oppure attira Fogliolo e Gocciolino!' }
    ]
  },
  {
    id: 'q1_first_friend', chapter: 1,
    title: 'I Primi Vicini',
    desc: 'Attira e stringi amicizia con almeno 2 Biomini creando Habitat nella Landa (es. Stagno Vivo, Focolare Accogliente o Prato di Rugiada).',
    check: (s) => s.befriended.length >= 2,
    progress: (s) => `Biomini amici: ${Math.min(2, s.befriended.length)}/2`,
    reward: { wood: 4, clay: 3, seed_berry: 2 },
    onCompleteDialog: [
      { speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿', text: 'Meraviglioso! Vedi i nuovi poteri nella barra in basso? Parla con ogni nuovo Biomino per ricevere doni e imparare le sue Morfomimosi!' }
    ]
  },
  {
    id: 'q1_sanctuary', chapter: 1,
    title: 'Ripara il Santuario del Seme',
    desc: 'Avvicinati al Santuario del Seme (a nord della Landa) e riparalo con 6 Rami, 4 Pietre e 3 Argilla.',
    check: (s) => !!s.regions.landa.sanctuaryRepaired,
    progress: (s) => s.regions.landa.sanctuaryRepaired ? 'Riparato!' : 'Serve: 6 Rami, 4 Pietre, 3 Argilla al Santuario',
    reward: { lumber: 3, berry_soup: 2 },
    onCompleteDialog: [
      { speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿', text: 'Il Santuario del Seme brilla di nuovo! Porta l\'Armonia della Landa al Livello 2 costruendo Habitat o piantando fiori, e si aprirà la Costa di Cenere!' }
    ]
  },
  {
    id: 'q1_harmony', chapter: 1,
    title: 'Risveglio della Landa',
    desc: 'Porta la Landa Inaridita al Livello Armonia 2 (80 punti Armonia) creando Habitat e abbellendo il terreno.',
    check: (s) => s.regions.landa.harmony >= 80,
    progress: (s) => `Armonia Landa: ${Math.min(80, Math.floor(s.regions.landa.harmony))}/80`,
    unlockRegion: 'costa',
    advanceChapter: 2,
    reward: { wood: 5, stone: 5 }
  },

  // Chapter 2
  {
    id: 'q2_visit_costa', chapter: 2,
    title: 'Sulla Costa di Cenere',
    desc: 'Apri la Mappa (🗺️) e viaggia verso la Costa di Cenere.',
    check: (s) => s.visitedRegions.includes('costa'),
    progress: (s) => s.visitedRegions.includes('costa') ? 'Arrivato!' : 'Apri la Mappa e seleziona Costa di Cenere',
    reward: { sand_ore: 3, seed_wheat: 3 }
  },
  {
    id: 'q2_costa_hab', chapter: 2,
    title: 'Pulizia della Baia',
    desc: 'Crea almeno 2 Habitat nella Costa di Cenere (es. Spiaggia Dorata lavando la cenere con Zampillo, e Siepe Costiera con un Banco da Lavoro su prato).',
    check: (s) => s.regions.costa.habitatsFound.length >= 2,
    progress: (s) => `Habitat sulla Costa: ${Math.min(2, s.regions.costa.habitatsFound.length)}/2`,
    reward: { glass: 2, lumber: 3 }
  },
  {
    id: 'q2_sanctuary', chapter: 2,
    title: 'Riaccendi il Faro delle Maree',
    desc: 'Ripara il Faro delle Maree a nord-est della Costa (5 Assi di Legno, 4 Vetro, 6 Pietre) e porta la Costa a 90 Armonia.',
    check: (s) => !!s.regions.costa.sanctuaryRepaired && s.regions.costa.harmony >= 90,
    progress: (s) => `${s.regions.costa.sanctuaryRepaired ? 'Faro OK' : 'Ripara Faro'} · Armonia ${Math.min(90, Math.floor(s.regions.costa.harmony))}/90`,
    unlockRegion: 'creste',
    advanceChapter: 3,
    reward: { golden_bread: 2, iron_ore: 3 }
  },

  // Chapter 3
  {
    id: 'q3_visit_creste', chapter: 3,
    title: 'Verso le Creste di Basalto',
    desc: 'Viaggia alle Creste di Basalto usando la Mappa.',
    check: (s) => s.visitedRegions.includes('creste'),
    progress: (s) => s.visitedRegions.includes('creste') ? 'Arrivato!' : 'Viaggia alle Creste dalla Mappa',
    reward: { iron_ore: 3, spark_core: 2 }
  },
  {
    id: 'q3_powers', chapter: 3,
    title: 'Pietra e Scintilla',
    desc: 'Stringi amicizia con Ciotolino o Voltacchio creando Habitat sulle Creste (Terrazza di Basalto o Officina Elettrica).',
    check: (s) => s.befriended.includes('ciotolino') || s.befriended.includes('voltacchio'),
    progress: (s) => (s.befriended.includes('ciotolino') || s.befriended.includes('voltacchio')) ? 'Amicizia stretta!' : 'Attira Ciotolino o Voltacchio',
    reward: { iron_bar: 2, brick: 3 }
  },
  {
    id: 'q3_sanctuary', chapter: 3,
    title: 'Riattiva la Centrale Eolica',
    desc: 'Ripara la Centrale Eolica sulle Creste (5 Lingotti Ferro, 5 Mattoni, 3 Nuclei Scintilla) e raggiungi 100 Armonia sulle Creste.',
    check: (s) => !!s.regions.creste.sanctuaryRepaired && s.regions.creste.harmony >= 100,
    progress: (s) => `${s.regions.creste.sanctuaryRepaired ? 'Centrale OK' : 'Ripara Centrale'} · Armonia ${Math.min(100, Math.floor(s.regions.creste.harmony))}/100`,
    unlockRegion: 'foresta',
    advanceChapter: 4,
    reward: { strawberry_cake: 2, glow_mushroom: 3 }
  },

  // Chapter 4
  {
    id: 'q4_visit_foresta', chapter: 4,
    title: 'Nella Foresta di Nebbia',
    desc: 'Raggiungi la Foresta di Nebbia dalla Mappa.',
    check: (s) => s.visitedRegions.includes('foresta'),
    progress: (s) => s.visitedRegions.includes('foresta') ? 'Arrivato!' : 'Viaggia alla Foresta dalla Mappa',
    reward: { pollen: 3, seed_moon: 2 }
  },
  {
    id: 'q4_zefirino', chapter: 4,
    title: 'Il Soffio che Purifica',
    desc: 'Attira Zefirino (Radura della Brezza: 1 Mulino a Vento + 2 Prati Fioriti nella Foresta) o scopri 2 Habitat nella Foresta.',
    check: (s) => s.befriended.includes('zefirino') || s.regions.foresta.habitatsFound.length >= 2,
    progress: (s) => `Habitat Foresta: ${Math.min(2, s.regions.foresta.habitatsFound.length)}/2`,
    reward: { lumber: 4, glow_mushroom: 3 }
  },
  {
    id: 'q4_sanctuary', chapter: 4,
    title: 'Risveglia l\'Albero Madre',
    desc: 'Ripara l\'Albero Madre nella Foresta (6 Assi, 6 Funghi Luminosi, 5 Polline) e raggiungi 110 Armonia nella Foresta.',
    check: (s) => !!s.regions.foresta.sanctuaryRepaired && s.regions.foresta.harmony >= 110,
    progress: (s) => `${s.regions.foresta.sanctuaryRepaired ? 'Albero OK' : 'Ripara Albero'} · Armonia ${Math.min(110, Math.floor(s.regions.foresta.harmony))}/110`,
    unlockRegion: 'isole',
    advanceChapter: 5,
    reward: { mushroom_broth: 2, crystal: 3 }
  },

  // Chapter 5
  {
    id: 'q5_visit_isole', chapter: 5,
    title: 'Ascesa alle Isole Sospese',
    desc: 'Usa l\'ascensore eolico sulla Mappa per raggiungere le Isole Sospese.',
    check: (s) => s.visitedRegions.includes('isole'),
    progress: (s) => s.visitedRegions.includes('isole') ? 'Arrivato!' : 'Viaggia alle Isole Sospese',
    reward: { crystal: 3, glass: 3 }
  },
  {
    id: 'q5_sanctuary', chapter: 5,
    title: 'Il Faro di Risonanza',
    desc: 'Ripara il Faro di Risonanza sulle Isole Sospese (8 Cristalli, 6 Lingotti Ferro, 6 Vetro, 4 Nuclei Scintilla) e scopri almeno 8 Habitat totali.',
    check: (s) => !!s.regions.isole.sanctuaryRepaired && s.discoveredHabitats.length >= 8,
    progress: (s) => `${s.regions.isole.sanctuaryRepaired ? 'Faro OK' : 'Ripara Faro'} · Habitat totali ${Math.min(8, s.discoveredHabitats.length)}/8`,
    advanceChapter: 6,
    reward: { harmony_elixir: 2, crystal: 4, glass: 4 }
  },

  // Chapter 6 (Finale)
  {
    id: 'q6_greenhouse', chapter: 6,
    title: 'La Serra del Prof. Intreccio',
    desc: 'Costruisci l\'Habitat finale "Serra dei Tesori del Professore" (Serra del Professore + Scaffale Botanico + Fontana + Vaso di Fiori) in qualsiasi regione!',
    check: (s) => s.discoveredHabitats.includes('hab_serra_professore'),
    progress: (s) => s.discoveredHabitats.includes('hab_serra_professore') ? 'Completata!' : 'Crea Serra + Scaffale Botanico + Fontana + Vaso di Fiori',
    reward: { harmony_elixir: 3 },
    isFinale: true,
    onCompleteDialog: [
      { speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿', text: 'Oh... Mimo! Le mie radici tremano di commozione! È più bella di quanto avessi osato sognare nei miei secoli d\'attesa.' },
      { speaker: 'Astralio', role: 'Cervo Stellare', portrait: '🦌', text: 'La Sinfonia di Morfalia risuona di nuovo dalla costa fino alle nuvole. I semi piantati con cura non muoiono mai.' },
      { speaker: 'Prof. Intreccio', role: 'Custode Botanico', portrait: '🌿', text: 'I cinque Santuari brillano come stelle sulla valle. Se i Custodi umani guardano da lontano, oggi vedranno il mondo fiorire ancora... grazie a un piccolo Mimo dal cuore immenso.' },
      { speaker: 'Cronaca di Morfalia', role: 'Epilogo Sbloccato', portrait: '✨', text: 'Hai completato la storia principale di MORFALIA! Continua liberamente in modalità Epilogo per scoprire tutti i 40 Habitat, fare amicizia con tutti i 40 Biomini, raccogliere i 10 Diari e portare ogni regione al Livello Armonia 5!' }
    ]
  }
];

export const LORE_LOGS = [
  {
    id: 'log_1', region: 'landa', pos: { x: 8, y: 7 },
    title: 'Diario #1 — Il Giorno del Silenzio',
    author: 'Dott.ssa Elena, Archivio della Valle',
    text: '«Il vento si è fermato tre settimane fa. Non è stata una guerra: la Terra aveva semplicemente finito il fiato dopo troppo rumore. Abbiamo deciso di lasciare le città e concedere alla valle un lungo sonno rigenerante.»'
  },
  {
    id: 'log_2', region: 'landa', pos: { x: 34, y: 24 },
    title: 'Diario #2 — Progetto Mimo',
    author: 'Ingegnere Marco',
    text: '«Abbiamo sigillato una piccola creatura polimorfa nel terrario del Santuario. Non sa combattere, sa solo imitare con empatia ciò che ama. Quando il suolo sarà pronto, si sveglierà per imparare di nuovo il linguaggio dei Biomini.»'
  },
  {
    id: 'log_3', region: 'costa', pos: { x: 11, y: 23 },
    title: 'Diario #3 — L\'Ultima Marea',
    author: 'Guardiana del Faro',
    text: '«Prima di imbarcarci sulle chiatte solari, ho lasciato le chiavi del Faro delle Maree tra le conchiglie. Il Prof. Intreccio ha promesso di restare sveglio finché il piccolo Mimo non avrebbe aperto gli occhi.»'
  },
  {
    id: 'log_4', region: 'costa', pos: { x: 34, y: 20 },
    title: 'Diario #4 — Arca di Clorofilla',
    author: 'Botanica Chiara',
    text: '«Ogni specie di Biomino torna spontaneamente non appena ritrova l\'equilibrio del proprio Habitat. Non servono gabbie né sfere: basta costruire un luogo dove qualcuno si senta atteso.»'
  },
  {
    id: 'log_5', region: 'creste', pos: { x: 7, y: 9 },
    title: 'Diario #5 — Le Turbine Addormentate',
    author: 'Capo Tecnico Leo',
    text: '«Abbiamo spento la Centrale Eolica in modalità riposo. Basterà una sola Scintilla gentile — non la forza bruta — per far ripartire i condensatori senza spaventare gli uccelli del vento.»'
  },
  {
    id: 'log_6', region: 'creste', pos: { x: 35, y: 18 },
    title: 'Diario #6 — Il Giuramento d\'Acciaio',
    author: 'Ingegnere Marco',
    text: '«Sulle Creste abbiamo imparato che pietra e fiori non sono nemici: una fornace calda e un giardino fiorito possono dividere lo stesso sentiero.»'
  },
  {
    id: 'log_7', region: 'foresta', pos: { x: 9, y: 6 },
    title: 'Diario #7 — Il Velo di Spore',
    author: 'Guardaboschi Silvia',
    text: '«L\'Albero Madre ha avvolto il bosco in spore soporifere per proteggere i semi più rari. Solo una brezza amica potrà sollevare il velo senza spezzare un solo ramo.»'
  },
  {
    id: 'log_8', region: 'foresta', pos: { x: 34, y: 25 },
    title: 'Diario #8 — Luci nel Crepuscolo',
    author: 'Botanica Chiara',
    text: '«Di notte i Lumifunghi illuminano i sentieri meglio di qualsiasi lampione. Ho disegnato il progetto di una grande Serra per il Prof. Intreccio: spero che un giorno qualcuno la costruisca per lui.»'
  },
  {
    id: 'log_9', region: 'isole', pos: { x: 8, y: 17 },
    title: 'Diario #9 — L\'Osservatorio tra le Nuvole',
    author: 'Dott.ssa Elena',
    text: '«Dalle Isole Sospese abbiamo lanciato le navi-nido verso l\'orizzonte lontano. Il Faro di Risonanza è la nostra promessa: quando tornerà a cantare, sapremo che casa nostra ci sta chiamando.»'
  },
  {
    id: 'log_10', region: 'isole', pos: { x: 34, y: 11 },
    title: 'Diario #10 — Lettera al Piccolo Mimo',
    author: 'I Custodi di Morfalia',
    text: '«Se stai leggendo queste righe, significa che ce l\'hai fatta. Non importa quale forma tu scelga di avere: sei il cuore di questo mondo. Tieni accesa la Serra... stiamo già volgendo le vele verso casa.»'
  }
];
