window.ConceptsData = {
  esposizione: [
    {
      title:'Il Triangolo dell\'Esposizione',
      body:`L'<b>esposizione</b> è la quantità totale di luce che raggiunge il sensore/film. Il Triangolo della Fotografia è composto da tre variabili interdipendenti:
<br><br><span class="c-term">ISO</span> — Sensibilità del sensore alla luce. ISO 100 = poco sensibile (qualità massima), ISO 3200+ = molto sensibile (granuloso). Ogni stop raddoppia la sensibilità.
<br><br><span class="c-term">Diaframma (f/)</span> — Apertura del diaframma nell'obiettivo. f/1.4 = massima apertura (molta luce, poca profondità di campo). f/22 = minima apertura (poca luce, tutta la scena a fuoco). I valori standard formano una sequenza geometrica: ogni passo dimezza la luce.
<br><br><span class="c-term">Tempo (T)</span> — Durata di apertura dell'otturatore. 1/1000s = congelamento del movimento. 30s = scia di luce (light painting, stelle). Ogni stop raddoppia/dimezza il tempo.
<br><br><span class="c-formula">EV = log₂(N² / t) dove N = f-number, t = tempo in secondi</span>
<br><br>La <b>Legge di Reciprocità</b> dice: se raddoppi l'apertura (f/4 → f/2.8), puoi dimezzare il tempo mantenendo la stessa esposizione. Questo significa che ci sono molte combinazioni per la stessa esposizione — e OGNUNA produce un risultato diverso.
<br><br><span class="c-paper">Fonte: Ansel Adams, "The Camera" (1980), cap. III — System Approach to Exposure</span>`,
    },
    {
      title:'Diagramma di zone di Adams',
      body:`<b>Ansel Adams</b> sviluppò il <b>Zone System</b>: una scala di 11 zone (0 = nero puro, X = bianco puro) per controllare con precisione l'esposizione e la stampa.
<br><br>Zone V è il grigio al 18% — il punto medio che i lettrometri interni delle fotocamere usano come riferimento.
<br><br>Come usarlo: se il tuo soggetto è in Zone III (ombra dettagliata), puoi underesposizionare di 2 stop rispetto al grigio medio per mantenere il dettaglio nelle ombre.
<br><br>Il <b>ETTR</b> (Expose To The Right) è la tecnica digitale moderna: esporre il massimo senza bruciare i highlight, poi correggere in post. Maggiore il dettaglio nelle alte luci, minore il rumore.
<br><br><span class="c-paper">Fonte: Ansel Adams, "The Negative" (1981), Zone System</span>`,
    },
    {
      title:'Esposizione in digitale vs analogico',
      body:`<b>Reciprocità nell'analogico</b>: per esposizioni lunghe (>1s), il film perde sensibilità. Servono correzioni di +0.5/+1 stop.
<br><br><b>In digitale</b>: il sensore CCD/CMOS ha una risposta lineare. Non c'è perdità di reciprocità, ma c'è <b>clipping</b>: i pixel bruciati (255,255,255) NON si recuperano.
<br><br><b>Bracketing</b>: scattare 3-5 foto a esposizioni diverse (-2, -1, 0, +1, +2 EV) e unirle in <b>HDR</b> (High Dynamic Range). Il RAW è fondamentale: contiene 12-14 stop di range vs i 8 del JPEG.
<br><br><span class="c-paper">Fonte: Michael Freeman, "The Photographer's Eye" (2007), cap. Exposure</span>`,
    }
  ],
  composizione: [
    {
      title:'Regola dei Terzi e Sezione Aurea',
      body:`La <b>Regola dei Terzi</b> divide l'immagine in 9 riquadri con 2 linee orizzontali e 2 verticali. I 4 punti d'intersezione sono le <b>zone di massima attenzione visiva</b>.
<br><br>La <b>Sezione Aurea</b> (φ ≈ 1.618) è la proporzione che l'occhio umano trova naturalmente armoniosa. La <b>Spirale di Fibonacci</b> è la sua rappresentazione visiva: il soggetto si posiziona dove la spirale converge.
<br><br>Differenza pratica: i Terzi sono una semplificazione dell'Aurea. Per la maggior parte delle foto bastano i Terzi. Per composizioni più sofisticate (architettura, paesaggi), l'Aurea dà risultati più eleganti.
<br><br><span class="c-quote">"La composizione è la forma più continua dell'attenzione." — Henri Cartier-Bresson</span>
<br><br><span class="c-paper">Fonte: Michael Freeman, "The Photographer's Eye" (2007)</span>`,
    },
    {
      title:'Linee Guidida e Profondità',
      body:`Le <b>linee guida</b> sono elementi dell'immagine (strade, recinzioni, fiumi, edifici) che guidano l'occhio del guardante verso il soggetto.
<br><br>Linee <b>convergenti</b>: creano profondità prospettica (strade che si restringono). Linee <b>curve</b>: movimento fluido, naturalezza. Linee <b>diagonal</b>: energia, dinamismo.
<br><br>Il <b>layering</b> (sovrapposizione piani) crea profondità: primo piano (elemento vicino), piano medio (soggetto), sfondo (contesto).
<br><br><span class="c-paper">Fonte: Michael Freeman, "The Photographer's Composition" (2010)</span>`,
    },
    {
      title:'Spazio Negativo e Minimale',
      body:`Lo <b>spazio negativo</b> è l'area "vuota" attorno al soggetto. Non è sprecato: dà respiro all'immagine e isola il soggetto.
<br><br>Nei ritratti, lo spazio vuoto davanti al soggetto (lead room/nose room) crea un senso di direzione e movimento.
<br><br>La <b>fotografia minimale</b> usa lo spazio negativo come elemento protagonista: un uccello su un ramo vuoto, un'ombra su un muro bianco.
<br><br><span class="c-quote">"La perfezione non è quando non c'è più nulla da aggiungere, ma quando non c'è più nulla da togliere." — Antoine de Saint-Exupéry</span>`,
    }
  ],
  luce: [
    {
      title:'Temperatura Colore e Kelvin',
      body:`La <b>temperatura colore</b> si misura in Kelvin (K) e descrive il colore della luce:
<br><br><span class="c-formula">1800K → Candela (arancio intenso)
2700K → Alba/Tramonto (caldo)
3500K → Luce domestica (ambiente)
5500K → Sole diretto (neutra)
6500K → Giorno coperto (fredda)
7500K → Ombra (bluastro)
9000K → Cielo sereno in ombra (blu freddo)</span>
<br><br>Il <b>White Balance</b> (WB) della fotocamera compensa queste differenze. WB automatico funziona bene il 90% delle volte, ma per controllo creativo usa il WB manuale o scatta in RAW.
<br><br><span class="c-paper">Fonte: Ernst Haas, "Color Correction" (1971)</span>`,
    },
    {
      title:'Direzione della Luce',
      body:`<b>Frontale</b>: luce dritta sul soggetto. Piatta, poche ombre. Usata per beauty/fashion dove ilmakeup conta.
<br><br><b>Laterale (45°)</b>: crea volume e texture. La luce di Rembrandt: ombra a triangolo sotto l'occhio opposto. Ideale per ritratti drammatici.
<br><br><b>Controluce</b>: la luce viene da dietro il soggetto. Crea silhouette o effetto "backlit" con alone dorato. Attenzione al flare!
<br><br><b>Rim light</b>: luce da dietro che crea un contorno luminoso, separa il soggetto dallo sfondo. Fondamentale nei servizi professionali.
<br><br><b>Dura vs Morbida</b>: dipende dalla dimensione della fonte luminosa rispetto al soggetto. Sole = duro (ombre nette). Softbox/nuvole = morbido (ombre graduali).
<br><br><span class="c-paper">Fonte: John S. FREEDMAN, "Light: Science & Magic" (2020)</span>`,
    },
    {
      title:'La Golden Hour e la Blue Hour',
      body:`<b>Golden Hour</b>: i 30-40 minuti dopo l'alba o prima del tramonto. La luce è bassa, calda, morbida. Le ombre sono lunghe e creative.
<br><br><b>Blue Hour</b>: i 20-30 minuti prima dell'alba o dopo il tramonto. I toni sono freddi, blu, eterei. Ideale per architettura e paesaggi urbani.
<br><br>Perché funzionano: l'atmosfera filtra le lunghezze d'onda. A mezzogiorno luce bianca/asciutta. A tramonto il percorso attraverso l'atmosfera è più lungo → le frequenze blu si dissipano → resta l'arancio/rosso.
<br><br><span class="c-paper">Fonte: Ernst Haas, "Color Correction" (1971)</span>`,
    }
  ],
  momento: [
    {
      title:'Il Momento Decisivo',
      body:`<span class="c-quote">"La fotografia è la riconoscenza simultanea, in una frazione di secondo, dell' significato di un evento sia della precisa disposizione visiva che conferisce alle forme appropriate la loro espressione." — Henri Cartier-Bresson, "Il momento decisivo" (1952)</span>
<br><br>Cartier-Bresson vedeva la fotografia come un <b>atto di geometria istantanea</b>: la composizione e il momento si fondono in un istante irripetibile.
<br><br>La lezione: puoi preparare la composizione, la luce, l'attrezzatura. Ma il momento? Quello è un dono dell'universo. Ecco perché i grandi fotografi dedicano ORE all'attesa.
<br><br><span class="c-paper">Fonte: Henri Cartier-Bresson, "Images à la Sauvette" (1952)</span>`,
    },
    {
      title:'Punctum e Studium (Barthes)',
      body:`<span class="c-quote">"Lo Studium è sempre coperto dall'intenzione del fotografo... Il Punctum è: ciò che graffia, è un dettaglio che trafigge." — Roland Barthes, "La Camera Chiara" (1980)</span>
<br><br><b>Studium</b>: l'interesse culturale, la tecnica, il contesto. È ciò che "comprendi" della foto. Lo puoi spiegare.
<br><br><b>Punctum</b>: la ferita emotiva. Il dettaglio imprevisto che ti colpisce senza sapere perché. Non si può progettare — accade. Una scarpa sfilata, un granello di polvere sulla lente, un'espressione involontaria.
<br><br><span class="c-paper">Fonte: Roland Barthes, "La Chambre Claire" (1980)</span>`,
    },
    {
      title:'Fotografia e Potere (Sontag)',
      body:`<span class="c-quote">"Fotografare è appropriarsi della cosa fotografata. Significa stabilire con essa una relazione che assomiglia alla conoscenza — o all'amore." — Susan Sontag, "Sulla Fotografia" (1977)</span>
<br><br>Sontag vede la fotografia come un <b>atto di potere</b>: chi fotografa decide cosa viene visto, cosa viene ricordato, cosa viene dimenticato.
<br><br>Nell'era digitale questo concetto è amplificato: ogni selfie, ogni post, ogni story è un atto di appropriazione della realtà. Il <b>risvolto etico</b>: i diritti all'immagine, la privacy, l'uso delle foto altrui.
<br><br><span class="c-paper">Fonte: Susan Sontag, "On Photography" (1977)</span>`,
    }
  ],
  algoritmo: [
    {
      title:'Come funziona l\'Algoritmo del Feed',
      body:`Ogni piattaforma social usa un sistema di <b>ranking</b> per decidere cosa mostrare. Il modello semplificato:
<br><br><span class="c-formula">P(interazione) = w₁·like + w₂·commento + w₃·condivisione + w₄·salvataggio + w₅·tempo di permanenza</span>
<br><br><b>Fattori chiave nel 2025</b>:
<br>• <b>Salvataggi</b> ( saves ) e <b>condivisioni</b> ( shares ) pesano PIÙ dei likes
<br>• <b>Tempo di permanenza</b> ( dwell time ) è il segnale più forte per Reels
<br>• <b>Velocità iniziale</b>: i primi 30-60 minuti determinano la distribuzione
<br>• <b>Account "freschi"</b> spesso ricevono un boost iniziale
<br><br><span class="c-paper">Fonte: Instagram Engineering Blog (2023); TikTok Research (2024)</span>`,
    },
    {
      title:'Reach Organico vs Pagato',
      body:`<b>Reach organico</b>: quante persone raggiungi senza pagare. Instagram 2025: ~5-10% dei follower (era 26% nel 2016). TikTok: più alto, ~20-30%.
<br><br><b>Reach a pagamento</b>: ads, sponsored posts, partnerships. Si misura in <b>CPM</b> (costo per 1000 impressions). Instagram: ~€6-12 CPM. TikTok: ~€3-8 CPM.
<br><br><b>Shadowban</b>: penalizzazione dell'otturatore senza notifica. Causa: contenuti che violano le linee guida, hashtag bannati, comportamento spam. Dura da giorni a settimane.
<br><br><span class="c-paper">Fonte: Hootsuite Digital Trends Report (2025)</span>`,
    },
    {
      title:'Viralità e Coefficiente di Diffusione',
      body:`La <b>viralità</b> si misura con il <b>coefficiente K</b>:
<br><br><span class="c-formula">K = numero medio di inviti × tasso di conversione</span>
<br><br>Se K > 1, ogni persona condivide con più di una persona che converte → crescita esponenziale.
<br><br>Se K < 1, la diffusione si esaurisce → il contenuto muore.
<br><br><b>Perché一些 post diventano virali</b>: spesso è la combinazione di un contenuto emotivamente carico + timing perfetto + piattaforma giusta. Non esiste una formula universale, ma i pattern STEPPS (Berger) aumentano le probabilità.
<br><br><span class="c-paper">Fonte: Jonah Berger, "Contagious: Why Things Catch On" (2013)</span>`,
    }
  ],
  contenuto: [
    {
      title:'Content Pillars e Strategia Editoriale',
      body:`I <b>content pillars</b> sono le 3-5 categorie tematiche fisse che definiscono un account. Ogni post deve appartenere a un pilastro.
<br><br><b>Esempio per uno studio fotografico</b>:
<br>1. 📸 Ritratti (lavori completati)
<br>2. 🎬 Dietro le Quinte (making of)
<br>3. 📚 Tutorial (consigli tecnici)
<br>4. 💬 Storie dei Clienti (testimonianze)
<br>5. 🖼️ Retrospettive (archivio)
<br><br>Il <b>content calendar</b> programma: quando posta cosa, su quale piattaforma, con che formato. La coerenza batte la quantità.
<br><br><span class="c-paper">Fonte: Joe Pulizzi, "Epic Content Marketing" (2023)</span>`,
    },
    {
      title:'Hook e i Primissimi Secondi',
      body:`<b>Hook</b> = la gancio nei primi 3 secondi (Reels/TikTok) o nella prima riga (post/testo).
<br><br>Le 5 tecniche di hook:
<br>1. <b>Domanda provocatoria</b>: "Sapevi che il 90% delle foto è buttata?"
<br>2. <b>Affermazione shock</b>: "Ho perso €5000 in un mese di ads"
<br>3. <b>Visual hook</b>: qualcosa di visivamente insolito nel primo frame
<br>4. <b>Promise</b>: "In 60 secondi ti mostro come..."
<br>5. <b>Storytelling</b>: "Ieri è successo qualcosa di assurdo..."
<br><br><span class="c-quote">"Non scrivere mai un titolo che non prometta qualcosa di utile al lettore." — David Ogilvy</span>
<br><br><span class="c-paper">Fonte: David Ogilvy, "Confessions of an Advertising Man" (1963)</span>`,
    },
    {
      title:'STEPPS: Il Modello della Viralità',
      body:`Jonah Berger identifica 6 fattori che rendono i contenuti contagiosi:
<br><br><b>1. Social Currency</b>: condividere fa sembrare fighi. "Sapevi che..." dà conoscenza esclusiva.
<br><b>2. Triggers</b>: qualcosa che ricorda il prodotto. "Lunedì = caffè" (inglesi: Monday = Monday).
<br><b>3. Emotion</b>: meraviglia, rabbia, eccitazione. Le emozioni ad alta attivazione si condividono.
<br><b>4. Public</b>: se lo fanno tutti, lo fanno tutti (effetto bandwagon). Il comportamento visibile si imita.
<br><b>5. Practical Value</b>: consigli utili si condividono. "10 modi per..." funziona sempre.
<br><b>6. Stories</b>: il contenuto è inglobato in una storia. La storia è il veicolo, il messaggio è il passeggero.
<br><br><span class="c-paper">Fonte: Jonah Berger, "Contagious" (2013), Wharton School</span>`,
    }
  ],
  community: [
    {
      title:'Engagement Rate e Qualità',
      body:`<span class="c-formula">ER = (like + commenti + salvataggi + condivisioni) / reach × 100</span>
<br><br><b>Benchmark Instagram 2025</b>:
<br>• Micro-influencer (10K-50K): 3-6%
<br>• Mid-tier (50K-500K): 2-4%
<br>• Macro (500K+): 1-2%
<br><br><b>Qualità > Quantità</b>: 10 commenti con domande genuine valgono più di 1000 emoji. I commenti lunghe indicano coinvolgimento reale.
<br><br><span class="c-paper">Fonte: Sprout Social Index (2025)</span>`,
    },
    {
      title:'1000 True Fans e Fidelizzazione',
      body:`<span class="c-quote">"Non servono milioni di follower. Servono 1000 True Fans che comprano TUTTO ciò che produci." — Kevin Kelly (2008)</span>
<br><br>Il calcolo: 1000 fan × €100/anno di spesa media = €100.000/anno di reddito. Sufficiente per un piccolo business creativo.
<br><br>La <b>fidelizzazione</b> batte l'<b>acquisizione</b>: costare 5-25x di più acquisire un nuovo cliente che trattenerne uno esistente.
<br><br>Tattiche di fidelizzazione: email list, community esclusive, contenuti early access, programmi fedeltà.
<br><br><span class="c-paper">Fonte: Kevin Kelly, "1000 True Fans" (2008)</span>`,
    },
    {
      title:'UGC e Crisi di Community',
      body:`<b>UGC (User Generated Content)</b>: contenuti creati dai consumatori. È 6.9x più coinvolgente del contenuto del brand (Stackla, 2021).
<br><br>Ma: servono <b>permesso</b> e <b>credibilità</b>. Appropriarsi del lavoro altrui è un rischio legale e reputazionale.
<br><br><b>Gestione crisi</b>: le 3 regole d'oro:
<br>1. <b>Rispondi presto</b> (< 1 ora nelle prime 24h)
<br>2. <b>Empatia prima</b>, spiegazione dopo
<br>3. <b>Zero giri di parole</b>: ammetti, scusa, correggi
<br><br>Caso studio: Barilla 2013 (CEO anti-LGBTQ) → -22% fatturato in 24h. Poi 2 anni di campagne inclusiva per recuperare.
<br><br><span class="c-paper">Fonte: Stackla Consumer Content Report (2021)</span>`,
    }
  ],
  analytics: [
    {
      title:'KPI Digitali: il Dizionario',
      body:`<b>REACH</b> = persone uniche raggiunte
<br><b>IMPRESSIONS</b> = volte totali mostrate (1 persona può vedere lo stesso post 5 volte)
<br><b>Rapporto impression/reach</b> = frequenza media. Se >3, il contenuto è stato visto troppe volte (ad fatigue).
<br><br><b>CTR</b> = click / impressioni × 100
<br>• Ads: 2-5% è buono
<br>• Email: 15-25% è buono
<br><br><b>CPM</b> = costo / (impressioni / 1000) → costo per 1000 impressions
<br><b>CPC</b> = costo / click → costo per singolo click
<br><b>CPA</b> = costo / conversione → costo per azione (acquisto, iscrizione)
<br><br><span class="c-paper">Fonte: Google Analytics Documentation (2025)</span>`,
    },
    {
      title:'ROAS e Ritorno sugli Investimenti',
      body:`<span class="c-formula">ROAS = Ricavi dalla campagna / Spesa pubblicitaria</span>
<br><br>• ROAS < 1 = stai perdendo soldi
<br>• ROAS = 1 = stai tornando in pari
<br>• ROAS = 4 = per ogni €1 speso, tornano €4
<br>• ROAS > 5 = ottimo (dipende dal margine)
<br><br><b>ROAS vs ROI</b>: il ROAS misura solo la spesa pubblicitaria. L'ROI (Return on Investment) include TUTTI i costi (lavoro, attrezzatura, software, etc.).
<br><br><span class="c-formula">ROI = (Ricavo - Costo totale) / Costo totale × 100</span>
<br><br><span class="c-paper">Fonte: Kotler & Armstrong, "Principi di Marketing" (2021)</span>`,
    }
  ],
  marketing_mix: [
    {
      title:'Le 7P di Kotler',
      body:`<b>Philip Kotler</b> (2021) definisce il Marketing Mix come 7 variabili controllabili:
<br><br><b>1. Product</b>: cosa vendi? Non il prodotto fisico, ma la <b>trasformazione</b> che offre.
<br><b>2. Price</b>: quanto costa? Non solo il numero, ma il <b>segnale di valore</b>.
<br><b>3. Place</b>: dove lo trovi? Omnicanale: studio + sito + social + marketplace.
<br><b>4. Promotion</b>: come lo comunichi? Ads, social, PR, email, eventi.
<br><b>5. People</b>: chi lo vende? Il volto del brand è il prodotto.
<br><b>6. Process</b>: come viene consegnato? Prenotazione → consegna → follow-up.
<br><b>7. Physical Evidence</b>: evidenze tangibili del valore. Portfolio, recensioni, certificati, packaging.
<br><br><span class="c-paper">Fonte: Philip Kotler & Gary Armstrong, "Principi di Marketing" (17th ed., 2021)</span>`,
    },
    {
      title:'Prezzo come Segnale',
      body:`Il prezzo non è solo un numero. È un <b>segnale</b>:
<br><br>• <b>Prezzo alto</b> → qualità percepita, esclusività (Rolex, Leica)
<br>• <b>Prezzo basso</b> → volume, accessibilità (IKEA, Ryanair)
<br>• <b>Prezzo "charm"</b>: €99 invece di €100. Funziona ancora.
<br>• <b>Decoy effect</b>: 3 opzioni, la media è quella che vuoi vendere
<br><br>Lo <b>sweet spot</b>: dove il <b>valore percepito</b> supera il <b>prezzo pagato</b>. Se il cliente pensa che il servizio valga €500 e lo paghi €300, è contento.
<br><br><span class="c-paper">Fonte: Dan Ariely, "Predictably Irrational" (2008)</span>`,
    }
  ],
  funnel: [
    {
      title:'TOFU / MOFU / BOFU',
      body:`Il <b>funnel</b> (imbuto) descrive il percorso del cliente:
<br><br><b>TOFU (Top of Funnel)</b> = Awareness
<br>• Obiettivo: farti scoprire
<br>• Contenuti: blog, video educativi, social post, SEO
<br>• Metriche: reach, impressions, traffico
<br><br><b>MOFU (Middle of Funnel)</b> = Consideration
<br>• Obiettivo: farti valutare
<br>• Contenuti: case study, demo, webinar, email nurture
<br>• Metriche: iscrizioni newsletter, download, tempo sul sito
<br><br><b>BOFU (Bottom of Funnel)</b> = Decision
<br>• Obiettivo: farti comprare
<br>• Contenuti: offerte, testimonianze, confronti, call-to-action
<br>• Metriche: conversioni, vendite, ROAS
<br><br><span class="c-paper">Fonte: HubSpot Inbound Marketing (2024)</span>`,
    },
    {
      title:'AIDA: Il Modello Classico',
      body:`<b>AIDA</b> (Elias St. Elmo Lewis, 1898) — ancora fondamentale:
<br><br><b>A - ATTENTION</b>: cattura l'attenzione. Hook visivo, titolo forte, interrompi lo scroll.
<br><b>I - INTEREST</b>: suscita interesse. Parla del PROBLEMA del cliente, non del tuo prodotto.
<br><b>D - DESIRE</b>: crea desiderio. Mostra il futuro possibile, le trasformazioni, le testimonianze.
<br><b>A - ACTION</b>: spingi all'azione. CTA chiara, urgenza, facilità di accesso.
<br><br>Ogni contenuto del marketing dovrebbe coprire almeno uno di questi step.
<br><br><span class="c-paper">Fonte: E. St. Elmo Lewis, "Financial Advertising" (1898)</span>`,
    },
    {
      title:'Modelli di Attribuzione',
      body:`Quando un cliente compra, a chi dai il merito?
<br><br><b>Last-Click</b>: 100% al ultimo touchpoint. Semplice ma ingiusto (ignora awareness).
<br><b>Linear</b>: divide equamente tra tutti i touchpoint. Più equo, meno preciso.
<br><b>Time-Decay</b>: più peso agli ultimi touchpoint. Realistico per cicli brevi.
<br><b>Position-Based</b>: 40% primo, 40% ultimo, 20% mezzo. Buon compromesso.
<br><b>Data-Driven</b>: usa ML per assegnare il peso (Google Analytics 4). Il più preciso.
<br><br><span class="c-paper">Fonte: Google Analytics 4 Documentation (2025)</span>`,
    }
  ],
  brand: [
    {
      title:'Positioning: la Posizione nella Mente',
      body:`<b>Al Ries & Jack Trout</b> (1981): il positioning NON è cosa fai con il prodotto. È cosa fai con la <b>MENTE</b> del cliente.
<br><br>La mente ha spazio per circa <b>7 brand per categoria</b>. La prima scelta (top of mind) si prende il 30-40% del mercato.
<br><br><b>Strategie di positioning</b>:
<br>• <b>Benefit</b>: associa un vantaggio (Volvo = sicurezza)
<br>• <b>Classe</b>: leader di categoria (Ferrari = supercar)
<br>• <b>Uso</b>: un'occasione specifica (Gatorade = idratazione sportiva)
<br>• <b>Competitore</b>: contro un altro brand (Pepsi vs Coca-Cola)
<br><br><span class="c-paper">Fonte: Al Ries & Jack Trout, "Positioning: The Battle for Your Mind" (1981)</span>`,
    },
    {
      title:'USP e Tono di Voce',
      body:`<b>USP</b> (Unique Selling Proposition, Rosser Reeves 1961):
<br>• <b>Unico</b>: solo tu puoi dirlo
<br>• <b>Rilevante</b>: il cliente se ne importa
<br>• <b>Credibile</b>: puoi dimostrarlo
<br><br><b>Tono di voce</b>: la personalità del brand espressa con le parole. Non è "cosa dici" ma "come lo dici".
<br><br>Esempi:
<br>• Nike: ispirante, diretto, iconico ("Just Do It")
<br>• Innocent Drinks: giocoso, innocent, ironico
<br>• Studio Olga: caldo, tecnico, affettuoso ("le foto che diventano ricordi")
<br><br><span class="c-paper">Fonte: Rosser Reeves, "Reality in Advertising" (1961)</span>`,
    },
    {
      title:'Byron Sharp: La Crescita dei Brand',
      body:`<b>Byron Sharp</b> ("How Brands Grow", 2010) ha rivoluzionato il marketing con dati empirici:
<br><br><b>1. MENTAL AVAILABILITY</b>: un brand cresce se viene in mente spesso nella categoria.
<br><b>2. PHYSICAL AVAILABILITY</b>: un brand cresce se si trova facilmente (distribuzione).
<br><br>Paradigma shift: la <b>fedeltà</b> del brand conta meno della <b>familiarità</b>. I clienti "fedeli" spesso comprano anche altri brand nella stessa categoria.
<br><br>Per creare <b>assets memorabili</b>: nomi facili da ricordare, colori distintivi, jingle, mascot, slogan ripetuti. La ripetizione batte la creatività.
<br><br><span class="c-paper">Fonte: Byron Sharp, "How Brands Grow" (2010), Ehrenberg-Bass Institute</span>`,
    }
  ],
  persuasione: [
    {
      title:'Le 6 Armi della Persuasione',
      body:`<b>Robert Cialdini</b> (1984, aggiornato 2021 con la 7ª arma):
<br><br><b>1. Reciprocità</b>: dai prima, ricevi dopo. Un campione gratuito, un consiglio, un regalo.
<br><b>2. Commitment & Consistency</b>: impegnati piccolo, poi la coerenza ti porta avanti. (Disclaimer firmato → upsell facile)
<br><b>3. Prova Sociale</b>: "altri lo fanno". Recensioni, numeri, UGC.
<br><b>4. Autorità</b>: esperti, certificati, premi. "Il 92% dei fotografi professionisti consiglia..."
<br><b>5. Simpatia</b>: ci si fidano di più delle persone che ci piacciono. Il brand deve essere "simpatico".
<br><b>6. Scarsità</b>: "ultimi 3 posti", "offerta fino a venerdì". La paura di perdere (FOMO) è potente.
<br><b>7. Unità</b> (2021): "siamo della stessa tribù". Appartenenza, identità condivisa.
<br><br><span class="c-paper">Fonte: Robert Cialdini, "Influence: The Psychology of Persuasion" (1984, 2021 ed.)</span>`,
    },
    {
      title:'Copywriting: Ogni Parola Conta',
      body:`<b>David Ogilvy</b>: le regole del copywriting efficace:
<br><br>• "Non scrivere mai un titolo che non prometta qualcosa di utile al lettore"
<br>• Il titolo è il 80% del risultato. Se il titolo non funziona, il resto è buttato.
<br>• Lunghezza vs brevità: lungo vende (se è interessante), corto engage (se è d'impatto)
<br><br><b>Le 4 U di Michael Masterson</b>:
<br>• <b>Useful</b>: utile al lettore
<br>• <b>Urgent</b>: urgenza temporale
<br>• <b>Unique</b>: unico, diverso
<br>• <b>Ultra-specific</b>: specifico, non generico
<br><br><span class="c-quote">"Il cliente non è uno stupido. È tua moglie." — David Ogilvy</span>
<br><br><span class="c-paper">Fonte: David Ogilvy, "Confessions of an Advertising Man" (1963)</span>`,
    },
    {
      title:'I 5 Livelli di Consapevolezza',
      body:`<b>Eugene Schwartz</b> ("Breakthrough Advertising", 1966) identifica 5 livelli:
<br><br><b>1. Incosciente</b>: non sa di avere un problema. Copy: crea awareness del problema.
<br><b>2. Consapevole del problema</b>: sa che c'è un problema ma non conosce la soluzione. Copy: educa sulla soluzione.
<br><b>3. Consapevole della soluzione</b>: conosce la soluzione ma non il tuo prodotto. Copy: distinguiti dai concorrenti.
<br><b>4. Consapevole del prodotto</b>: conosce il tuo prodotto ma non è convinto. Copy: elimina obiezioni con prove.
<br><b>5. Più consapevole</b>: pronto a comprare. Copy: chiudi con CTA e urgenza.
<br><br>Lo stesso prodotto richiede copy DIVERSO per ogni livello.
<br><br><span class="c-paper">Fonte: Eugene Schwartz, "Breakthrough Advertising" (1966)</span>`,
    }
  ]
};
