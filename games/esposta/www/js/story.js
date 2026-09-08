window.StoryData = {
  chapters: [
    // === ATTO I — L'ARTE DELLA LUCE (FOTOGRAFIA) ===
    { id:'esposizione', title:'Il Triangolo dell\'Esposizione', icon:'🎞️',
      concept:'ISO, apertura f/, tempi, legge di reciprocità, EV',
      dialogue:[
        { who:'narratore', text:'Lo Studio Olga è freddo. Le pareti sono coperte di fotografie in bianco e nero. Un negativo giallastro giace sul tavolo della camera oscura.' },
        { who:'zio', text:'Ehi ragazzuola, vedi quella busta? Il negativo è esposto male: o troppa luce o troppo poca. Ma non è colpa del negativo — è colpa di chi ha scattato.' },
        { who:'nonna', text:'"L\'esposizione è il fondamento. Ogni scatto è un triangolo: ISO (sensibilità del sensore), Apertura (quanto si apre il diaframma f/) e Tempo (quanto resta aperto). La legge di reciprocità li lega: EV = log₂(N²/t)." — Note di Nonna Olga, 1987.' },
        { who:'zio', text:'Senti, pensa al triangolo come al volume di una radio: ISO è il rumore di fondo, diaframma è il rubinetto della luce, tempo è quanto tieni il rubinetto aperto. Troppo aperto = foto bruciata. Troppo chiuso = foto scura.' },
        { who:'nonna', text:'"Il diaframma: f/1.4 = massima apertura (bokeh, poca profondità), f/22 = minima apertura (tutto a fuoco). I valori standard: f/1.4, f/2, f/2.8, f/4, f/5.6, f/8, f/11, f/16, f/22. Ogni stop raddoppia o dimezza la luce." — Note di Nonna Olga.' },
        { who:'zio', text:'Ora prova tu: regola i tre sliders per ottenere un\'esposizione perfetta! Il negativo non aspetta!' }
      ],
      lesson:'IL TRIANGOLO: ISO × Apertura (f/) × Tempo = ESPOSIZIONE\nf/1.4 = luce tanta, poca profondità | f/22 = poca luce, tutto a fuoco\nISO 100 = pulito | ISO 3200 = granuloso\nTempo: 1/1000 = fermo | 30s = scia di luce\nReciprocità: raddoppiando l\'ISO puoi dimezzare il tempo!',
      minigame:'esposizione'
    },
    { id:'composizione', title:'La Composizione', icon:'📐',
      concept:'Regola dei terzi, sezione aurea, linee guida, spazio negativo',
      dialogue:[
        { who:'narratore', text:'Sviluppato il primo negativo, un\'altra busta attende. Questa contiene una foto di Parigi, 1962. Nonna Olga catturò un momento perfetto.' },
        { who:'zio', text:'Guarda come ha inquadrato: il soggetto non è al centro, ma sulla linea destra. C\'è spazio davanti a lui, come se guardasse verso qualcosa. È la composizione che fa la differenza.' },
        { who:'nonna', text:'"La regola dei terzi: dividere l\'inquadratura in 9 riquadri con 2 linee orizzontali e 2 verticali. I punti di intersezione sono le zone di massima attenzione visiva. Cartier-Bresson: \'La composizione è la forma più continua dell\'attenzione.\'"' },
        { who:'nonna', text:'"La sezione aurea (φ ≈ 1.618) è la proporzione che l\'occhio umano trova naturalmente armoniosa. È alla base della spirale di Fibonacci, usata da Leonardo e dai fotografi del MoMA."' },
        { who:'zio', text:'Pensa così: le linee guida portano l\'occhio del guardante verso il soggetto. Un vialetto, una recinzione, un fiume... sono frecce invisibili nella foto!' }
      ],
      lesson:'REGOLA DEI TERZI: il soggetto sui punti d\'intersezione (non al centro!)\nSEZIONE AUREA (φ=1.618): la proporzione più armoniosa\nLINEE GUIDA: portano l\'occhio verso il soggetto\nSPAZIO NEGATIVO: il "vuoto" racconta quanto il "pieno"\nSimmetria: crea ordine, ma anche noia. Asimmetria = energia.',
      minigame:'composizione'
    },
    { id:'luce', title:'La Luce', icon:'☀️',
      concept:'Golden hour, blue hour, luce dura/morbida, temperatura colore Kelvin, direzione della luce',
      dialogue:[
        { who:'narratore', text:'La terza busta contiene una foto di una piazza al tramonto. La luce avvolge tutto in oro.' },
        { who:'zio', text:'La luce cambia TUTTO. A mezzogiorno il sole picchia dritto: ombre dure, pelle/graziosa. Al tramonto (golden hour) la luce si fa calda, morbida, quasi magica.' },
        { who:'nonna', text:'"La temperatura colore si misura in Kelvin (K): candela 1800K (arancio), tramonto 3500K (caldo), luce diurna 5500K (neutra), cielo coperto 7000K (freddo), ombra 9000K (blu). Il WB (White Balance) della macchina determina come interpreta questi valori."' },
        { who:'nonna', text:'"Direzioni della luce: frontale (piatta, poco drama), laterale (texture, volume), controluce (silhouette, backlit), rim light (alone, separazione dallo sfondo). La luce laterale a 45° è quella dei ritratti classici di Rembrandt."' },
        { who:'zio', text:'Prossima foto: "Matrimonio, ore 18:30, giardino". Scegli la luce giusta e vedi se sai leggere il Kelvin!' }
      ],
      lesson:'TEMPERATURA COLORE: 1800K (candela) → 5500K (sole) → 9000K (ombra blu)\nGOLDEN HOUR: 30 min prima del tramonto, luce calda e morbida\nBLUE HOUR: 20 min prima dell\'alba, toni freddi e sognanti\nDIREZIONE: laterale = drama, controluce = magia, frontale = piattezza\nDura vs Morbida: ombre nette vs ombre graduali',
      minigame:'luce'
    },
    { id:'momento', title:'Il Momento Decisivo', icon:'⚡',
      concept:'Storytelling visivo, punctum/studium (Barthes), Sontag, "decisive moment" (Cartier-Bresson)',
      dialogue:[
        { who:'narratore', text:'L\'ultima busta del primo atto contiene una foto iconica: un bambino che salta una pozzanghera, con l\'ombra perfetta proiettata sul muro.' },
        { who:'zio', text:'Questa l\'ha scattata Nonna a Napoli, 1968. Un solo scatto, uno solo. Il bambino in aria, l\'ombra che tocca il muro, la luce laterale perfetta. Ha aspettato ORE per quel momento.' },
        { who:'nonna', text:'"Il momento decisivo (l\'instant décisif) di Cartier-Bresson: la simultaneità della riconoscenza dell\'occhio e della precisa disposizione dei muscoli." — Henri Cartier-Bresson, "Il momento decisivo" (1952).' },
        { who:'nonna', text:'"Roland Barthes distingue lo Studium (l\'interesse culturale, il contesto, la技术ica) dal Punctum (la ferita, il dettaglio che ti trafigge). Il punctum non si può progettare: accade." — "La camera chiara" (1980).' },
        { who:'nonna', text:'"Susan Sontag: \'Fotografare è appropriarsi della cosa fotografata. Significa stabilire con essa una relazione di intimità che assomiglia alla conoscenza — o all\'amore.\'" — "Sulla Fotografia" (1977).' }
      ],
      lesson:'MOMENTO DECISIVO (Cartier-Bresson 1952): la congiunzione perfetta di istante + composizione\nPUNCTUM vs STUDIUM (Barthes): il dettaglio che trafigge vs il contesto culturale\nLa fotografia è APPROPRIAZIONE (Sontag): ogni scatto è un atto di potere\nAspettare è parte del mestiere: 99% pazienza, 1% ispirazione',
      minigame:'momento'
    },
    // === ATTO II — LA PIAZZA DIGITALE (SOCIAL MEDIA) ===
    { id:'algoritmo', title:'L\'Algoritmo', icon:'🧠',
      concept:'Feed ranking, engagement signals, reach organica, shadowban, viralità',
      dialogue:[
        { who:'narratore', text:'Il negativo è sviluppato. Ma nel 2025 le foto non vivono più nel fotoalbum. Vivono nel FEED. E il feed ha un padrone invisibile: l\'algoritmo.' },
        { who:'filtro', text:'Uh, lo studio del nonno? Che vintage! Ma sai cosa conta davvero? I NUMERI. Io ho 50K follower e il mio post ha raggiunto 200K persone! Tu quante?' },
        { who:'nonna', text:'"L\'algoritmo non è una cosa cattiva: è un sistema di ordinamento. Ogni piattaforma (Instagram, TikTok, YouTube) Classifica i contenuti in base a un punteggio predittivo: P(interazione) = w₁·like + w₂·commento + w₃·condivisione + w₄·salvataggio + w₅·dwell time." — Note di Nonna Olga, 2024.' },
        { who:'zio', text:'In parole semplici: l\'algoritmo vuole che la gente resti nell\'app. Se il tuo post fa restare la gente, l\'algoritmo lo mostra a più persone. Se la gente scrolla via, lo seppellisce.' },
        { who:'nonna', text:'"Reach organica vs reach a pagamento: l\'organica è gratuita ma limitata. Shadowban: quando l\'algoritmo penalizza contenuti senza avviso (spam, off-topic). Viralità: K > 1 significa che ogni persona condivide con più di una persona."' }
      ],
      lesson:'L\'ALGORITMO Classifica per P(interazione) = pesi su like/commenti/salvataggi/dwell time\nREACH ORGANICA: limitata, dipende dall\'engagement iniziale\nSHADOWBAN: penalizzazione senza avviso\nVIRALITÀ: coefficiente K = inviti × conversione. K>1 = crescita esponenziale\nI saves e shares pesano PIÙ dei likes nel 2025',
      minigame:'algoritmo'
    },
    { id:'contenuto', title:'Il Contenuto', icon:'🪝',
      concept:'Content pillars, format nativi, hook nei primi 3 secondi, STEPPS di Berger',
      dialogue:[
        { who:'filtro', text:'Ma se io posto il mio caffè la mattina e la gente lo ama, perché devo pensare a "content pillars"?' },
        { who:'nonna', text:'"I content pillars sono le 3-5 categorie tematiche che definiscono il tuo account. Ogni post deve appartenere a un pilastro. Esempio per uno studio fotografico: Ritratti, Dietro le Quinte, Tutorial, Storie dei Clienti, Retrospettive."' },
        { who:'zio', text:'E la cosa più importante: i PRIMI 3 SECONDI. Se non agganci subito, la gente scrolla via. Come un titolo di giornale: deve essere magnetico!' },
        { who:'nonna', text:'"Jonah Berger, Contagious (2013): i contenuti che si diffondono condividono STEPPS — Social Currency (sembri figo), Triggers (ti ricorda qualcosa), Emotion (emozione forte), Public (visibile), Practical Value (utile), Stories (storia)."' }
      ],
      lesson:'CONTENT PILLARS: 3-5 categorie fisse (es. Ritratti, Tutorial, Dietro le Quinte)\nHOOK: nei primi 3 secondi devi agganciare. Punto.\nSTEPPS (Berger): Social Currency + Triggers + Emotion + Public + Practical Value + Stories\nFORMAT NATIVI: Reels per Instagram, Shorts per YouTube, Video per TikTok\nOgni piattaforma ha un linguaggio diverso: non cross-postare identico!',
      minigame:'contenuto'
    },
    { id:'community', title:'La Community', icon:'💬',
      concept:'Engagement rate, UGC, crisi, 1000 true fans (Kevin Kelly), etica',
      dialogue:[
        { who:'filtro', text:'Ehi, ho 10K commenti! ...aspetta, sono tutti "🔥🔥🔥" e "DM me". È engagement questo?' },
        { who:'nonna', text:'"L\'engagement rate = (interazioni totali / reach) × 100. Un ER del 3-6% su Instagram è buono. Ma qualità > quantità: 10 commenti significativi valgono più di 1000 emoji."' },
        { who:'zio', text:'E quando le cose vanno male? Ti ricordi il caso Barilla del 2013? Il CEO disse che non avrebbe mai fatto pubblicità con coppie omosessuali. Il web esplose. Barilla perse il 22% del fatturato in 24 ore.' },
        { who:'nonna', text:'"Kevin Kelly, 1000 True Fans (2008): non servono milioni di follower. Servono 1000 persone che comprano TUTTO ciò che produci. La fidelizzazione batte l\'acquisizione."' },
        { who:'nonna', text:'"UGC (User Generated Content): il contenuto creato dagli utenti è 6.9x più coinvolgente del contenuto del brand. Ma richiede permesso e credibilità. Etica: non appropriarsi del lavoro altrui."' }
      ],
      lesson:'ENGAGEMENT RATE = interazioni/reach × 100 (3-6% = buono)\nUGC = contenuti degli utenti: 6.9x più coinvolgenti\n1000 TRUE FANS (Kelly 2008): basta una base fedele, non serve la massa\nCRISI: rispondi presto, con empatia, senza giri di parole\nETICA: credibilità > viralità. Una crisi può distruggere un brand in ore.',
      minigame:'community'
    },
    { id:'analytics', title:'Le Analytics', icon:'📊',
      concept:'KPI: reach vs impressions, CTR, conversion rate, CPM, CPC, ROAS',
      dialogue:[
        { who:'zio', text:'Il dashboard dell\'agenzia di Filtro Verde è aperto. Guarda le sue metriche... sono gonfiate come un pallone.' },
        { who:'nonna', text:'"REACH = persone uniche raggiunte. IMPRESSIONS = volte totali mostrate (una persona può vedere lo stesso post 5 volte). Una foto con 10K reach e 50K impressions ha un rapporto impression/reach di 5: il contenuto è stato visto mediamente 5 volte."' },
        { who:'nonna', text:'"CTR (Click-Through Rate) = click / impressioni × 100. CPM (Cost Per Mille) = costo / impressioni × 1000. CPC (Cost Per Click) = costo / click. ROAS (Return On Ad Spend) = ricavo / spesa pubblicitaria. Un ROAS di 4:1 significa €4 di ricavo per €1 speso."' },
        { who:'zio', text:'In pratica: il reach ti dice QUANTE persone hai toccato. Il CTR ti dice QUANTE hanno agito. Il ROAS ti dice SE ne è valsa la pena.' }
      ],
      lesson:'REACH = persone uniche | IMPRESSIONS = visualizzazioni totali\nCTR = click/impressioni × 100 (2-5% è buono per ads)\nCPM = costo per 1000 impressions\nCPC = costo per click\nROAS = ricavo / spesa pubblicitaria (>4:1 = ottimo)\nFunnel: awareness → consideration → conversion → retention',
      minigame:'analytics'
    },
    // === ATTO III — LA MACCHINA DEL VALORE (MARKETING) ===
    { id:'marketing_mix', title:'Il Marketing Mix', icon:'🎯',
      concept:'Le 7P di Kotler (Product, Price, Place, Promotion, People, Process, Physical evidence)',
      dialogue:[
        { who:'narratore', text:'Il secondo atto è concluso. Studio Olga ha una presenza digitale. Ma per sopravvivere serve una STRATEGIA. È qui che entra Philip Kotler.' },
        { who:'nonna', text:'"Il Marketing Mix delle 7P (Booms & Bitner, 1981, estensione delle 4P di McCarthy 1960): Product (cosa vendi), Price (quanto costa), Place (dove lo trovi), Promotion (come lo comunichi), People (chi lo vende), Process (come viene consegnato), Physical evidence (evidenze tangibili)."' },
        { who:'zio', text:'Per lo Studio Olga: Product = pacchetti fotografia; Price = €200/€500/€1000; Place = studio + online; Promotion = social + passaparola; People = noi; Process = prenotazione→scatto→editing→consegna; Evidence = portfolio, recensioni, certificati.' },
        { who:'nonna', text:'"Il prezzo non è mai solo un numero: è un SEGNALE. Prezzo alto = qualità percepita. Prezzo basso = volume. Il sweet spot è dove il valore percepito supera il prezzo pagato." — Kotler & Armstrong, "Principi di Marketing" (2021).' }
      ],
      lesson:'7P DI KOTLER: Product · Price · Place · Promotion · People · Process · Physical Evidence\nProduct: non vendi un servizio, vendi una TRANSFORMAZIONE\nPrice: è un segnale. Non è mai solo "costo".\nPlace: dove il cliente ti incontra (online + offline)\nPeople: il volto del brand conta quanto il prodotto',
      minigame:'marketing_mix'
    },
    { id:'funnel', title:'Il Funnel', icon:'🌪️',
      concept:'TOFU/MOFU/BOFU, AIDA (Lewis 1898), customer journey, attribution',
      dialogue:[
        { who:'nonna', text:'"Il funnel (imbuto) del marketing: TOFU (Top of Funnel) = Awareness — il cliente scopre che esisti. MOFU (Middle) = Consideration — valuta le opzioni. BOFU (Bottom) = Decision — sceglie te."' },
        { who:'zio', text:'Pensa alla galleria dello studio: entrano 100 persone (TOFU), 30 chiedono info (MOFU), 10 prenotano (BOFU), 5 diventano clienti fissi (retention).' },
        { who:'nonna', text:'"AIDA: Attention, Interest, Desire, Action — il modello di Elias St. Elmo Lewis (1898). Ancora valido. Ogni contenuto deve catturare ATTENZIONE, suscitare INTERESSE, creare DESIDERIO, e spingere all\'AZIONE."' },
        { who:'nonna', text:'"Modelli di attribuzione: last-click (chiude il 100% al punto finale), linear (diviso equamente), time-decay (più peso agli ultimi touch). Il giusto dipende dal business."' }
      ],
      lesson:'TOFU (Awareness) → MOFU (Consideration) → BOFU (Decision) → Retention\nAIDA (Lewis 1898): Attention → Interest → Desire → Action\nOgni stage richiede contenuti diversi: TOFU=educa, MOFU=confronta, BOFU=chiudi\nATTRIBUTION: last-click vs linear vs time-decay\nIl customer journey NON è lineare nel 2025',
      minigame:'funnel'
    },
    { id:'brand', title:'Il Brand', icon:'🏷️',
      concept:'Positioning (Ries & Trout), USP (Rosser Reeves), brand identity, tono di voce, Byron Sharp',
      dialogue:[
        { who:'filtro', text:'Il mio brand è: yo sono figo e la gente mi segue. Basta, no?' },
        { who:'nonna', text:'"Il POSITIONING (Ries & Trout, 1981) è la posizione che occupi nella MENTE del cliente. Non è cosa sei, è cosa RAPPRESENTI nella testa della gente rispetto ai concorrenti."' },
        { who:'nonna', text:'"USP (Unique Selling Proposition, Rosser Reeves 1961): qual è il VANTAGGIO UNICO che solo TU puoi offrire? Deve essere: 1) unico, 2) rilevante, 3) credibile."' },
        { who:'zio', text:'Per lo Studio Olga la USP potrebbe essere: "Ritratti che diventano ricordi che diventano famiglia." Non vendiamo foto, vendiamo memoria.' },
        { who:'nonna', text:'"Byron Sharp, "How Brands Grow" (2010): i brand crescono con MENTAL AVAILABILITY (vengono in mente) e PHYSICAL AVAILABILITY (si trovano facilmente). La familiarità batte la fedeltà." — Paradigma shifts nel marketing moderno.' },
        { who:'nonna', text:'"Il tono di voce è la personalità del brand scritta. Non è solo "che cosa dici" ma "come lo dici". Deve essere coerente in ogni tocco: post, email, risposte ai commenti, biglietto di consegna."' }
      ],
      lesson:'POSITIONING (Ries & Trout): la posizione nella MENTE del cliente\nUSP (Reeves): il vantaggio unico, credibile, rilevante\nBYRON SHARP: Mental + Physical Availability > fedeltà del brand\nTONO DI VOCE: la personalità scritta. Deve essere coerente ovunque\nIDENTITÀ DEL BRAND: nome, logo, colori, voce, valori = esperienza totale',
      minigame:'brand'
    },
    { id:'persuasione', title:'La Persuasione', icon:'✍️',
      concept:'6 principi di Cialdini, copywriting (Ogilvy), A/B test, CTA, 5 livelli di consapevolezza (Schwartz)',
      dialogue:[
        { who:'narratore', text:'L\'ultimo capitolo. L\'archivio è quasi completo. Nonna Olga aveva un\'ultima nota sulla persuasione.' },
        { who:'nonna', text:'"Robert Cialdini, Le armi della persuasione (1984): RECIPROCITÀ (dai prima), COMMITMENT (impegna gradualmente), PROOF SOCIALE (altri lo fanno), AUTORITÀ (esperto), SIMPATIA (mi piaci), SCARSITÀ (pochi rimasti). Nel 2025: + CONSAPEVOLEZZA."' },
        { who:'nonna', text:'"David Ogilvy: \'Non scrivere mai un titolo che non prometta qualcosa di utile al lettore.\' Il copywriting è vendere con le parole. Ogni parola deve guadagnarsi il suo posto."' },
        { who:'nonna', text:'"Eugene Schwartz, 5 livelli di consapevolezza: 1) Incosciente (non sa di avere un problema), 2) Consapevole del problema, 3) Consapevole della soluzione, 4) Consapevole del prodotto, 5) Più consapevole (pronto a comprare). Il copy deve adattarsi al livello."' },
        { who:'zio', text:'A/B test: pubblica DUE versioni dello stesso post con un variabile diversa (titolo, immagine, CTA). Quella che performa meglio vince. Niente supposizioni: solo dati!' }
      ],
      lesson:'6+1 PRINCIPIDI CIALDINI: Reciprocità · Commitment · Prova Sociale · Autorità · Simpatia · Scarsità + Consapevolezza\nCOPY (Ogilvy): ogni parola deve guadagnarsi il suo posto\n5 LIVELLI DI CONSAPEVOLEZZA (Schwartz): adatta il copy al livello del lettore\nA/B TEST: due versioni, una vince. Mai supporre, sempre testare\nCTA (Call To Action): "Scatta la tua foto" > "Clicca qui"',
      minigame:'persuasione'
    },
    // === FINALE ===
    { id:'esame', title:'L\'Esame del Feed', icon:'⚔️',
      concept:'Sintesi di tutti i concetti + casi reali',
      dialogue:[
        { who:'narratore', text:'L\'archivio è completo. Ma Nonna Olga aveva preparato un\'ultima prova: L\'Esame del Feed. Diciotto domande su tutto ciò che hai imparato. Dai fotografia ai social al marketing, con casi reali.' },
        { who:'zio', text:'Questo è il momento della verità, ragazzuola. Tutti gli strumenti che hai ricevuto... ora usali. Nonna voleva che tu fossi pronta.' },
        { who:'nonna', text:'"La conoscenza senza applicazione è solo enciclopedia. L\'esame verifica che sai USARE ciò che hai imparato. In bocca al lupo." — Ultima nota di Nonna Olga.' },
        { who:'filtro', text:'...in bocca al lupo davvero. Sei diventata brava. Anche io ho imparato qualcosa guardandoti.' }
      ],
      lesson:'Sei arrivata/o all\'ultimo examen.\nFotografia + Social Media + Marketing.\nTutto connesso: la luce che cattura → l\'algoritmo che distribuisce → la persuasione che converte.\nIn bocca al lupo! 📸',
      minigame:'esame'
    }
  ]
};
