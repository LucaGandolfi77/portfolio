/* De Rerum Gatta — dati del gioco: fiori, gatti, stagioni, lettere, domande, capitoli, FAQ */
'use strict';

const SEASONS = [
  { id: 'primavera', name: 'Primavera', emoji: '🌷', sub: 'I fiori della matematica', color: '#e8a0b4' },
  { id: 'estate',    name: 'Estate',    emoji: '☀️', sub: 'La fisica del movimento',  color: '#d4a853' },
  { id: 'autunno',   name: 'Autunno',   emoji: '🍂', sub: 'I misteri del piccolo',    color: '#b8895b' },
  { id: 'inverno',   name: 'Inverno',   emoji: '❄️', sub: 'Il tempo e l\'infinito',    color: '#8fb3c9' },
];

const FLOWERS = [
  /* ================= PRIMAVERA — matematica ================= */
  {
    id: 'fibonacci', season: 'primavera',
    name: 'Il Girasole di Fibonacci', emoji: '🌻',
    cat: 'Felicetto Fibonacci', catEmoji: '🐱',
    concept: 'Sequenza di Fibonacci, sezione aurea, spirali in natura',
    formula: 'F₀=0, F₁=1, Fₙ=Fₙ₋₁+Fₙ₋₂ · 1, 1, 2, 3, 5, 8, 13, 21…',
    quote: 'Il grande libro dell\'universo è scritto in lingua matematica.',
    quoteSource: 'Galileo Galilei, Il Saggiatore',
    practical: 'Conta i petali di una margherita vera: quasi sempre 13, 21 o 34. I semi del girasole formano spirali di Fibonacci. Anche il tuo dito ha le falangi in proporzione aurea.',
    philosophy: 'La matematica si scopre o si inventa? La natura segue regole, o siamo noi che gliele leggiamo dentro?',
    deep: 'La sequenza {Fₙ} è definita dalla ricorrenza lineare F₀=0, F₁=1, Fₙ=Fₙ₋₁+Fₙ₋₂ per n≥2. Il rapporto Fₙ₊₁/Fₙ converge alla sezione aurea φ=(1+√5)/2≈1,61803, radice dell\'equazione φ²=φ+1. In botanica, la fillotassi dei girasoli e delle margherite dispone i semi secondo angoli legati a φ, ottimizzando l\'esposizione alla luce: un esempio di struttura matematica emergente da un processo fisico di crescita.',
    minigame: 'petali',
    story: '«Ogni fiore è un numero che ha imparato a fiorire», miagola Felicetto, contando i petali uno a uno. «Prima uno, poi ancora uno, poi due, tre, cinque… ogni numero è la somma dei due che lo hanno preceduto. È la sequenza più paziente del mondo.»'
  },
  {
    id: 'pitagora', season: 'primavera',
    name: 'La Rosa di Pitagora', emoji: '🌹',
    cat: 'Micetto Pitagora', catEmoji: '😸',
    concept: 'Rapporti musicali: ottava 2:1, quinta 3:2, l\'armonia delle sfere',
    formula: '2:1 ottava · 3:2 quinta · 4:3 quarta',
    quote: 'La matematica è la vita degli dèi.',
    quoteSource: 'Novalis (poeta e ingegnere minerario)',
    practical: 'Una corda lunga la metà suona un\'ottava sopra. È il segreto di ogni strumento musicale, dal violino al pianoforte.',
    philosophy: 'L\'armonia è matematica o la matematica è armonia? Perché certe melodie ci commuovono?',
    deep: 'Nella teoria musicale pitagorica, gli intervalli consonanti corrispondono a rapporti di frequenze razionali semplici: l\'ottava a 2:1, la quinta a 3:2, la quarta a 4:3. Il sistema temperato equabile moderno approssima questi rapporti con il semitono 2^(1/12), garantendo la trasposizione tra tonalità. L\'acustica musicale costituisce quindi un primo esempio storico di formalizzazione matematica di un\'esperienza estetica.',
    minigame: 'lira',
    story: 'Micetto Pitagora tende le sue corde invisibili e miagola in accordi perfetti. «Ascolta», fa, «una corda doppia è un\'ottava: lo stesso suono, più in alto, come un\'eco felice. Le stelle, si dice, cantano in questi rapporti.»'
  },
  {
    id: 'euclide', season: 'primavera',
    name: 'Il Giglio di Euclide', emoji: '⚜️',
    cat: 'Micio Euclide', catEmoji: '🐱',
    concept: 'Geometria euclidea, triangoli, dimostrazioni',
    formula: 'postulati · a² + b² = c² (Elementi, I.47)',
    quote: 'Non esiste una via regia verso la geometria.',
    quoteSource: 'Euclide, secondo la tradizione (ad Tolomeo)',
    practical: 'Architettura, mappe, design: il teorema dei tre piedi spiega perché un tavolo non traballa mai.',
    philosophy: 'La dimostrazione come forma suprema di certezza: ma è certezza umana o assoluta? (Gödel busserà alla porta…)',
    deep: 'Gli Elementi di Euclide (circa 300 a.C.) costituiscono il primo esempio di sistema assiomatico-deduttivo: da cinque postulati e nozioni comuni si derivano per dimostrazione tutti i teoremi. Il teorema di Pitagora (I.47) è dimostrato per costruzione geometrica. La questione del quinto postulato, indimostrabile dagli altri, condusse nel XIX secolo alle geometrie non euclidee di Bolyai, Lobačevskij e Riemann, mostrando che la geometria descrive modelli possibili, non verità necessarie.',
    minigame: 'forme',
    story: 'Micio Euclide traccia cerchi perfetti con la coda e triangoli con le orecchie. «Una figura si riconosce dalle sue proprietà», miagola, «come un amico dal suo carattere. Guarda le tre figure e dimmi quale è equilatera, quale rettangola, quale è un cerchio.»'
  },
  {
    id: 'calcolo', season: 'primavera',
    name: 'La Violetta del Calcolo', emoji: '🌿',
    cat: 'Micetto Leibniz', catEmoji: '😺',
    concept: 'Derivate e integrali: crescita e accumulo, il divenire in formula',
    formula: 'f′(x) = lim (f(x+h)−f(x))/h · ∫ = accumulo',
    quote: 'Natura non facit saltus.',
    quoteSource: 'Linneo / Leibniz — la natura non fa salti',
    practical: 'Velocità istantanea, crescita di un conto in banca, ottimizzazione di un percorso: il calcolo è la matematica del cambiamento.',
    philosophy: 'Il continuo e il discreto: la matematica del divenire ci riconcilia col tempo che passa.',
    deep: 'Il calcolo infinitesimale, sviluppato indipendentemente da Newton e Leibniz tra il 1665 e il 1680, formalizza i concetti di limite, derivata e integrale. La derivata f′(x)=lim_{h→0} (f(x+h)−f(x))/h misura la variazione istantanea; il teorema fondamentale del calcolo stabilisce che integrazione e derivazione sono operazioni inverse. È lo strumento matematico alla base della fisica classica: le leggi del moto sono equazioni differenziali.',
    minigame: 'crescita',
    story: 'Micetto Leibniz osserva una violetta crescere, giorno dopo giorno. «La velocità con cui cresce è la sua derivata; l\'acqua totale che ha bevuto è il suo integrale», miagola. «Due sguardi sulla stessa pianta: il momento e la somma dei momenti.»'
  },
  {
    id: 'statistica', season: 'primavera',
    name: 'La Margherita dei Dati', emoji: '🌼',
    cat: 'Micia Gauss', catEmoji: '🐱',
    concept: 'Statistica: media, moda, mediana — leggere i numeri del mondo',
    formula: 'x̄ = (x₁+x₂+…+xₙ)/n',
    quote: 'La statistica è la grammatica della scienza.',
    quoteSource: 'Karl Pearson',
    practical: 'La media dei voti, dei prezzi, della pioggia: i numeri raccontano storie se sai ascoltarli.',
    philosophy: 'Un numero medio nasconde tante storie diverse: cosa si perde riducendo il mondo a una media?',
    deep: 'La media aritmetica x̄=(1/n)Σxᵢ è un indice di tendenza centrale; la mediana è il valore centrale dell\'insieme ordinato e la moda il valore più frequente. La distribuzione normale di Gauss è caratterizzata da media e deviazione standard, ed emerge dal teorema del limite centrale: la somma di molte variabili indipendenti tende a distribuirsi normalmente. La statistica fornisce così gli strumenti per separare il segnale dal rumore nei dati.',
    minigame: 'media',
    story: 'Micia Gauss conta le margherite e annota tutto sul suo taccuino. «Tre petali in più, due in meno: guardando ogni singolo fiore vedi solo rumore. Ma se fai la media, senti la voce del giardino.»'
  },

  /* ================= ESTATE — fisica del movimento ================= */
  {
    id: 'galilea', season: 'estate',
    name: 'La Campanula di Galilea', emoji: '🔔',
    cat: 'Gatta Galilea', catEmoji: '🐈',
    concept: 'Il pendolo e l\'isocronismo: il periodo dipende solo dalla lunghezza',
    formula: 'T = 2π√(L/g)',
    quote: 'E pur si muove!',
    quoteSource: 'Galileo Galilei',
    practical: 'Gli orologi a pendolo, i metronomi, il battito del cuore. Il tempo che dondola è lo stesso che scandisce le tue giornate.',
    philosophy: 'Il metodo scientifico come atto di umiltà: dubitare per capire meglio.',
    deep: 'L\'isocronismo del pendolo, studiato da Galileo, vale rigorosamente per piccole oscillazioni: il periodo T=2π√(L/g) dipende solo dalla lunghezza L e dall\'accelerazione di gravità g, non dalla massa né dall\'ampiezza (nell\'approssimazione sin θ≈θ). Questa proprietà rese possibile la costruzione di orologi precisi e, nel 1673, la teoria completa di Huygens. È un esempio paradigmatico del metodo sperimentale: osservazione, misura, modello matematico, verifica.',
    minigame: 'pendolo',
    story: 'Gatta Galilea dondola su un filo e non smette di guardare. «Sei convinto che il pendolo vada più veloce se oscilla più lontano?» fa, con un sorriso. «Tocca a te scoprirlo: tocca quando passo dal centro. Il periodo non dipende dall\'ampiezza. Solo dalla lunghezza.»'
  },
  {
    id: 'newton', season: 'estate',
    name: 'L\'Albero di Newton', emoji: '🍎',
    cat: 'Micio Newton', catEmoji: '🐱',
    concept: 'Gravità, caduta dei gravi, leggi del moto',
    formula: 'F = m·a · g = 9,8 m/s² · F = G·m₁·m₂/r²',
    quote: 'L\'amor che move il sole e l\'altre stelle.',
    quoteSource: 'Dante Alighieri, Paradiso XXXIII',
    practical: 'La stessa forza che fa cadere la mela tiene la Luna in orbita: i satelliti, i razzi, il GPS del tuo telefono.',
    philosophy: 'L\'unità del cosmo: la stessa legge in cielo e in terra. La meraviglia che ha una formula.',
    deep: 'La legge di gravitazione universale di Newton (Principia, 1687) afferma che due corpi di massa m₁ e m₂ si attraggono con forza F=G·m₁·m₂/r², dove G=6,674×10⁻¹¹ N·m²/kg². Combinata con le leggi del moto, essa spiega sia la caduta dei gravi sulla superficie terrestre (g≈9,8 m/s²) sia il moto dei pianeti, da cui Newton dedusse le tre leggi di Keplero: unificazione della fisica celeste e terrestre.',
    minigame: 'mele',
    story: '«Ahi!» Micio Newton si massaggia la testa: un\'altra mela gli è caduta addosso, per l\'ennesima volta. «Forse non è un caso», miagola tra un boccone e l\'altro. «Forse la Luna cade verso la Terra proprio come questa mela. Catturale, e lo capirai.»'
  },
  {
    id: 'keplero', season: 'estate',
    name: 'Il Cespuglio delle Stelle', emoji: '🌟',
    cat: 'Micio Keplero', catEmoji: '🐈',
    concept: 'Orbite, ellissi, leggi di Keplero, velocità orbitale',
    formula: 'T² ∝ a³ · v = √(GM/r)',
    quote: 'Pensavo i pensieri di Dio dopo di Lui.',
    quoteSource: 'Johannes Kepler, secondo la tradizione',
    practical: 'Le stagioni, i calendari, i satelliti in orbita, l\'esplorazione spaziale: ogni orbita è un\'ellisse.',
    philosophy: 'Il nostro posto nell\'universo: polvere di stelle che osserva le stelle — la meraviglia come inizio della filosofia.',
    deep: 'Dall\'analisi delle osservazioni di Tycho Brahe, Keplero enunciò (Astronomia Nova, 1609; Harmonices Mundi, 1619) tre leggi: I) i pianeti percorrono orbite ellittiche con il Sole in un fuoco; II) il raggio vettore spazza aree uguali in tempi uguali; III) il quadrato del periodo è proporzionale al cubo del semiasse maggiore (T²∝a³). Per un\'orbita circolare di raggio r attorno a una massa M, la velocità è v=√(GM/r): è la condizione che il gioco ti chiede di trovare.',
    minigame: 'orbita',
    story: 'Micio Keplero insegue la sua palla di lana con un\'orbita perfetta. «Non corre via e non cade: è questione di velocità», miagola, con gli occhi sulla stella. «Troppo lenta, precipita. Troppo veloce, fugge per sempre. La velocità giusta è un bacio tra gravità e slancio.»'
  },
  {
    id: 'maxwell', season: 'estate',
    name: 'Il Girasole di Maxwell', emoji: '🌈',
    cat: 'Micio Maxwell', catEmoji: '🐈⬛',
    concept: 'Spettro elettromagnetico, onde, velocità della luce',
    formula: 'c = λ·f = 299 792 458 m/s',
    quote: 'La luce è il primo amore del mondo.',
    quoteSource: 'Emily Dickinson (in traduzione)',
    practical: 'Wi-Fi, radio, forno a microonde, perché il cielo è azzurro e i tramonti rossi: è tutta luce invisibile.',
    philosophy: 'I nostri occhi vedono solo una fetta dello spettro: la realtà è più vasta dei sensi — metafora di ogni conoscenza.',
    deep: 'Le equazioni di Maxwell (1865) unificarono elettricità, magnetismo e ottica: la luce visibile è un\'onda elettromagnetica, come le onde radio, le microonde, i raggi X, che differiscono solo per frequenza e lunghezza d\'onda, legate da c=λ·f. La velocità della luce nel vuoto è una costante universale c≈3×10⁸ m/s. La dispersione prismatica separa le componenti cromatiche della luce bianca: è il fenomeno dell\'arcobaleno.',
    minigame: 'prisma',
    story: 'Micio Maxwell fa brillare il pelo al buio e insegna all\'arcobaleno a stare in fila. «Il rosso ha la lunghezza d\'onda più lunga, il violetto la più corta», miagola, «e in mezzo c\'è tutto ciò che i tuoi occhi riescono a vedere. Oltre, il resto dell\'universo continua a brillare.»'
  },
  {
    id: 'faraday', season: 'estate',
    name: 'La Felce di Faraday', emoji: '🧲',
    cat: 'Micio Faraday', catEmoji: '🐱',
    concept: 'Elettromagnetismo, materiali ferromagnetici, campi magnetici',
    formula: 'Fe, Co, Ni — materiali ferromagnetici · campi di forza invisibili',
    quote: 'Nulla è troppo meraviglioso per essere vero.',
    quoteSource: 'Michael Faraday',
    practical: 'Frigoriferi, motori elettrici, treni a levitazione, la bussola del telefono: i magneti sono ovunque.',
    philosophy: 'Forze invisibili che agiscono a distanza: quanto del mondo ci sfugge perché non lo tocchiamo?',
    deep: 'Un magnete genera un campo magnetico descritto da linee di campo; i materiali ferromagnetici (ferro Fe, cobalto Co, nichel Ni) contengono domini magnetici che si allineano in presenza di un campo esterno. Faraday scoprì l\'induzione elettromagnetica (1831): un campo magnetico variabile genera corrente, principio di generatori e trasformatori. Le equazioni di Maxwell unificarono poi elettricità e magnetismo in un\'unica teoria dei campi.',
    minigame: 'calamita',
    story: 'Micio Faraday fa ballare la graffetta sul tavolo senza toccarla. «Non è magia», miagola, «è un campo: una forza invisibile che attraversa lo spazio. Guarda gli oggetti e dimmi quali sentono il richiamo del magnete.»'
  },

  /* ================= AUTUNNO — i misteri del piccolo ================= */
  {
    id: 'schrodinger', season: 'autunno',
    name: 'L\'Orchidea Quantica', emoji: '🎁',
    cat: 'Micia Schrödinger', catEmoji: '🐈‍⬛',
    concept: 'Sovrapposizione quantistica, il ruolo dell\'osservatore',
    formula: '|ψ⟩ = α|sveglia⟩ + β|addormentata⟩, |α|²+|β|²=1',
    quote: 'Siamo tutti matti qui.',
    quoteSource: 'Lo Stregatto, Alice nel Paese delle Meraviglie',
    practical: 'Laser, semiconduttori, il tuo telefono: la fisica quantistica vive nel palmo della tua mano.',
    philosophy: 'La realtà esiste prima di essere osservata? Cosa significa «essere»?',
    deep: 'In meccanica quantistica lo stato di un sistema è descritto da un vettore di stato |ψ⟩: se α e β sono ampiezze di probabilità, il sistema si trova in sovrapposizione degli stati |sveglia⟩ e |addormentata⟩ finché una misura non ne «collassa» la funzione d\'onda su uno dei due. Il paradosso del gatto di Schrödinger (1935) illustra l\'assurdità apparente di estendere la sovrapposizione al mondo macroscopico. La formalizzazione matematica è quella degli spazi di Hilbert e degli operatori autoaggiunti.',
    minigame: 'scatola',
    story: 'Micia Schrödinger dorme e gioca allo stesso tempo, finché qualcuno non apre la scatola. «Fino a quel momento», sussurra, «sono entrambe le cose. Guarda le carte, ricordale: solo l\'osservazione decide.»'
  },
  {
    id: 'eratostene', season: 'autunno',
    name: 'Il Cespuglio dei Primi', emoji: '🌾',
    cat: 'Gatta Eratostene', catEmoji: '🐈',
    concept: 'Numeri primi e il crivello di Eratostene',
    formula: '2, 3, 5, 7, 11, 13, 17, 19…',
    quote: 'I numeri primi sono gli atomi dell\'aritmetica.',
    quoteSource: 'dalla tradizione matematica',
    practical: 'La crittografia del tuo telefono protegge i messaggi d\'amore usando numeri primi enormi.',
    philosophy: 'L\'ordine nascosto nel caos apparente: il brivido di trovare una regola dove sembrava non essercene.',
    deep: 'Un numero primo è un intero n>1 divisibile solo per 1 e per sé stesso. Il teorema fondamentale dell\'aritmetica garantisce che ogni intero positivo si fattorizzi in modo unico in numeri primi; Euclide (Elementi, IX.20) dimostrò che i primi sono infiniti. Il crivello di Eratostene è un algoritmo deterministico per elencarli. La distribuzione asintotica π(x)~x/ln x (Hadamard e de la Vallée Poussin, 1896) rivela un ordine profondo dietro l\'apparente irregolarità.',
    minigame: 'crivello',
    story: 'Gatta Eratostene osserva un cespuglio di numeri. «I primi sono indistruttibili: nessun numero li divide se non loro stessi. Per trovarli, cancella i multipli: due, poi tre, poi cinque… Il crivello è pazienza che diventa verità.»'
  },
  {
    id: 'pascal', season: 'autunno',
    name: 'Il Loto della Probabilità', emoji: '🎲',
    cat: 'Gatta Pascal', catEmoji: '😺',
    concept: 'Probabilità, il problema dei punti, il valore atteso',
    formula: 'P(A) = casi favorevoli / casi possibili',
    quote: 'Il cuore ha le sue ragioni che la ragione non conosce.',
    quoteSource: 'Blaise Pascal, Pensées',
    practical: 'Assicurazioni, medie, decisioni sotto incertezza: «conviene o non conviene?» nella vita di tutti i giorni.',
    philosophy: 'Il caso è reale o è solo la nostra ignoranza? E il destino, la fortuna, la scommessa su ciò che non si può dimostrare?',
    deep: 'Nella corrispondenza tra Pascal e Fermat (1654) nasce il calcolo delle probabilità, motivato dal problema dei punti: come dividere la posta di un gioco interrotto. Formalmente, per uno spazio campionario finito ed equiprobabile, P(A)=|A|/|Ω|. La legge dei grandi numeri (Bernoulli, 1713) garantisce che la frequenza empirica converge alla probabilità teorica: è il ponte tra il singolo evento e la sua regolarità a lungo termine.',
    minigame: 'scommessa',
    story: 'Gatta Pascal scommette su tutto, anche sulle foglie che cadono. «Una moneta, un dado, un mazzo di carte: la fortuna non è cieca, è matematica», miagola. «Conta i casi favorevoli, dividi per i casi possibili, e la sorpresa diventa previsione.»'
  },
  {
    id: 'termodinamica', season: 'autunno',
    name: 'Il Fiore di Ghiaccio', emoji: '❄️',
    cat: 'Gatto Clausius', catEmoji: '🐱',
    concept: 'Termodinamica, entropia, la freccia del tempo',
    formula: 'ΔS ≥ 0 · S = k·ln Ω',
    quote: 'Spesso il male di vivere ho incontrato…',
    quoteSource: 'Eugenio Montale, Ossi di seppia',
    practical: 'Perché il caffè si raffredda, il rendimento dei motori, la bolletta dell\'energia: l\'entropia in cucina.',
    philosophy: 'Perché il tempo scorre in una sola direzione? La memoria, la nostalgia, il tempo perduto — fisica e letteratura sulla stessa domanda.',
    deep: 'Il secondo principio della termodinamica (Clausius, 1850) afferma che in un sistema isolato l\'entropia S non diminuisce: ΔS≥0. La formulazione statistica di Boltzmann, S=k·ln Ω, la interpreta come misura del numero di microstati compatibili con un macrostato: i processi spontanei vanno verso gli stati più probabili. Ne segue la freccia del tempo: processi come la fusione di un cubetto di ghiaccio o la rottura di un uovo sono irreversibili a livello macroscopico.',
    minigame: 'stati',
    story: 'Gatto Clausius guarda un ghiacciolo sciogliersi sul davanzale e sospira. «Non lo rivedrai più così com\'era», miagola. «L\'universo ha una direzione: dal ghiaccio all\'acqua, dall\'ordine al disordine, dal tempo che torna al tempo che non torna. È la nostalgia della materia.»'
  },
  {
    id: 'archimede', season: 'autunno',
    name: 'Il Fiore di Archimede', emoji: '🪷',
    cat: 'Gatto Archimede', catEmoji: '🐈',
    concept: 'Principio di Archimede, spinta di galleggiamento, densità',
    formula: 'F = ρ·V·g · densità = massa/volume',
    quote: 'Eureka! (L\'ho trovato!)',
    quoteSource: 'Archimede, secondo la tradizione',
    practical: 'Perché le navi d\'acciaio galleggiano, i palloncini salgono, il tuo corpo galleggia più nel mare salato che in piscina.',
    philosophy: 'Certe verità nascono in una vasca da bagno: l\'osservazione quotidiana come origine della scienza.',
    deep: 'Il principio di Archimede afferma che un corpo immerso in un fluido riceve una spinta verso l\'alto pari al peso del volume di fluido spostato: F = ρ_fluido·V·g. Il galleggiamento dipende dalla densità media del corpo rispetto al fluido. Archimede lo impiegò per verificare l\'autenticità della corona di Gerone, misurando il volume per immersione: un esempio paradigmatico di metodo sperimentale quantitativo.',
    minigame: 'vasca',
    story: '«Eureka!» Gatto Archimede saltella nella vasca e l\'acqua trabocca. «Il mio corpo sposta un volume d\'acqua: più spingo, più l\'acqua mi sostiene! Dimmi: il legno galleggia? La pietra affonda? E la nave d\'acciaio, piena d\'aria?»'
  },

  /* ================= INVERNO — tempo e infinito ================= */
  {
    id: 'leopardi', season: 'inverno',
    name: 'Il Fiore dell\'Infinito', emoji: '🌌',
    cat: 'La Gatta Filosofa', catEmoji: '🐱',
    concept: 'Limiti, serie convergenti, il paradosso di Zenone',
    formula: '½ + ¼ + ⅛ + … = 1',
    quote: 'Sempre caro mi fu quest\'ermo colle… e il naufragar m\'è dolce in questo mare.',
    quoteSource: 'Giacomo Leopardi, L\'infinito',
    practical: 'Le approssimazioni in ingegneria: ogni calcolo è un passo verso un limite. Il paradosso che si scioglie.',
    philosophy: 'L\'infinito esiste fuori di noi o dentro di noi? Il pensiero può contenere l\'infinito?',
    deep: 'La serie geometrica Σ_{k=1}^∞ (1/2)^k converge: la successione delle somme parziali sₙ=1−1/2ⁿ tende a 1. Il paradosso di Zenone di Elea (Achille e la tartaruga) si dissolve riconoscendo che una somma di infiniti termini può essere finita: l\'infinito dei passi è un infinito potenziale, non un\'estensione infinita. Cantor (1874) mostrò poi che esistono infiniti di cardinalità diversa: il pensiero umano può «contenere» l\'infinito, ma non senza sorprese.',
    minigame: 'collina',
    story: 'La Gatta Filosofa si siede sull\'ermo colle, con una farfalla davanti. «A ogni passo faccio metà strada. Poi metà di quel che resta. E ancora metà. Raggiungerò mai la farfalla? Guarda la collina riempirsi, e dimmi.»'
  },
  {
    id: 'einstein', season: 'inverno',
    name: 'Il Tulipano del Tempo', emoji: '⏳',
    cat: 'Gatto Einstein', catEmoji: '😼',
    concept: 'Relatività, dilatazione del tempo, E = mc²',
    formula: 'γ = 1/√(1−v²/c²) · Δt = γ·Δt₀',
    quote: 'Il tempo è ciò che impedisce che tutto accada insieme.',
    quoteSource: 'attribuita ad Albert Einstein',
    practical: 'I satelliti GPS correggono gli orologi usando la relatività: senza Einstein ti perderesti per strada.',
    philosophy: 'Il tempo è un fiume o un\'illusione? (Agostino: «Se nessuno me lo chiede, lo so; se voglio spiegarlo, non lo so.»)',
    deep: 'La relatività ristretta (Einstein, 1905) si fonda su due postulati: l\'invarianza delle leggi fisiche nei riferimenti inerziali e la costanza della velocità della luce c. Ne segue la dilatazione del tempo: un intervallo Δt₀ misurato nel sistema a riposo diventa Δt=γ·Δt₀ in un sistema in moto relativo, con γ=1/√(1−v²/c²). L\'equivalenza massa-energia E=mc² è una conseguenza diretta. I satelliti GPS compensano la dilatazione gravitazionale e cinematica degli orologi atomici.',
    minigame: 'viaggio',
    story: 'Gatto Einstein allunga la sua pennichella: per lui sono passati cinque minuti, per te un\'ora. «Il tempo non è uguale per tutti», sbadiglia. «Regola la velocità della mia navicella: quando la nave viaggia quasi alla velocità della luce, il tempo scorre più lento per chi viaggia.»'
  },
  {
    id: 'lorenz', season: 'inverno',
    name: 'Il Farfallone di Lorenz', emoji: '🦋',
    cat: 'Micio Lorenz', catEmoji: '🐱',
    concept: 'Caos deterministico, effetto farfalla, sensibilità alle condizioni iniziali',
    formula: 'piccole cause → effetti enormi · attrattore di Lorenz',
    quote: 'Il battito d\'ali di una farfalla in Brasile può provocare un tornado in Texas.',
    quoteSource: 'Edward Lorenz (parafrasi)',
    practical: 'Perché le previsioni del tempo falliscono oltre pochi giorni: non è colpa dei meteorologi, è matematica.',
    philosophy: 'Piccole cause, grandi effetti: quanto siamo davvero padroni delle conseguenze delle nostre azioni?',
    deep: 'Nel 1963 Edward Lorenz scoprì che il suo modello atmosferico, pur deterministico, mostrava dipendenza sensibile dalle condizioni iniziali: differenze infinitesime si amplificano esponenzialmente. Nasce la teoria del caos: sistemi deterministici, ma imprevedibili a lungo termine. L\'attrattore di Lorenz è una struttura frattale in R³. La previsione a lungo termine richiederebbe una precisione di misura infinita, impossibile per principio.',
    minigame: 'farfalla',
    story: 'Micio Lorenz insegue una farfalla che non sta mai ferma. «Ogni battito d\'ali cambia tutto», miagola, «non per magia: perché il futuro è sensibile al presente. Un soffio oggi, un tornado domani. Eppure tutto è scritto nelle equazioni.»'
  },
];

const LETTERS = {
  prologo: {
    emoji: '🐱', from: 'La Gatta Filosofa',
    text: 'Benvenuto, Giardiniere. Questo è il Giardino dell\'Universo: ogni fiore chiuso è una verità che aspetta di essere capita. Io lo custodisco per conto di Lui, che amava una fisica e le scriveva lettere che non ha mai spedito.\n\nCura i fiori, impara la loro lingua, e il giardino ti racconterà la loro storia. Tocca un fiore per cominciare.',
  },
  primavera: {
    emoji: '💌', from: 'La lettera di Lui — Primavera',
    text: 'Cara Lei,\n\noggi ho contato i petali della tua margherita. Tredici. Tredici, come se anche lei conoscesse la sequenza. Ogni petalo è la somma dei due che lo precedono: come noi, forse. Prima io, poi tu, poi noi.\n\nIl giardino sta imparando a fiorire. Anche io.\n\n— Lui',
  },
  estate: {
    emoji: '💌', from: 'La lettera di Lui — Estate',
    text: 'Cara Lei,\n\nil tuo orologio a pendolo continua a dondolare sul comò. Il periodo non dipende dall\'ampiezza, dicevi: dondoli più o meno forte, il tempo resta lo stesso. Io dondolo, e il tempo non passa.\n\nCadono le mele. E la Luna, dicevi, cade da sempre.\n\n— Lui',
  },
  autunno: {
    emoji: '💌', from: 'La lettera di Lui — Autunno',
    text: 'Cara Lei,\n\nstasera le foglie si chiudono come gatti nelle scatole: addormentati e svegli insieme, finché qualcuno non guarda. Tu dicevi che la realtà aspetta di essere osservata.\n\nAllora osserva, ti prego: io esisto davvero finché mi guardi?\n\n— Lui',
  },
  inverno: {
    emoji: '💌', from: 'La lettera di Lui — Inverno',
    text: 'Cara Lei,\n\nil tempo scorre più lento per chi viaggia veloce. Io sono fermo, eppure il tempo non mi aspetta. La collina è alta, la neve la copre, e la farfalla è sempre a metà strada.\n\nMa la somma, dicevi, converge. Ogni metà che percorro avvicina l\'infinito a uno.\n\nForse anche io, alla fine, arrivo.\n\n— Lui',
  },
  finale: {
    emoji: '💌', from: 'L\'ultima lettera — letta dalla Gatta Filosofa',
    text: 'Cara Lei,\n\nil giardino è in fiore. Ogni fiore che ho imparato a capire è un tuo verso che ho imparato a leggere. Le formule e le poesie sono lo stesso alfabeto: l\'ho capito solo adesso, che sei lontana.\n\nIl libro dell\'universo è scritto in lingua matematica, dicevi. Ma la lingua matematica, ho scoperto, si scrive con l\'amore che move il sole e l\'altre stelle.\n\nSe un giorno torni, il giardino ti riconoscerà.\n\n— Lui\n\nP.S. La Gatta Filosofa dice che eri tu a scrivere queste lettere, ogni notte, per Lui. Le ho solo custodite. Miagolio. — La Gatta',
  },
};

/* Percorso narrativo della Modalità Passeggiata (solo storia) */
const STORY_PATH = [
  { type: 'letter', key: 'prologo' },
  { type: 'flower', id: 'fibonacci' },
  { type: 'flower', id: 'pitagora' },
  { type: 'flower', id: 'euclide' },
  { type: 'flower', id: 'calcolo' },
  { type: 'flower', id: 'statistica' },
  { type: 'letter', key: 'primavera' },
  { type: 'flower', id: 'galilea' },
  { type: 'flower', id: 'newton' },
  { type: 'flower', id: 'keplero' },
  { type: 'flower', id: 'maxwell' },
  { type: 'flower', id: 'faraday' },
  { type: 'letter', key: 'estate' },
  { type: 'flower', id: 'schrodinger' },
  { type: 'flower', id: 'eratostene' },
  { type: 'flower', id: 'pascal' },
  { type: 'flower', id: 'termodinamica' },
  { type: 'flower', id: 'archimede' },
  { type: 'letter', key: 'autunno' },
  { type: 'flower', id: 'leopardi' },
  { type: 'flower', id: 'einstein' },
  { type: 'flower', id: 'lorenz' },
  { type: 'letter', key: 'inverno' },
  { type: 'letter', key: 'finale' },
];

/* Capitoli del giardino */
const CHAPTERS = [
  { num: 'Prologo', name: 'Il Giardino Addormentato', desc: 'L\'arrivo al giardino e l\'incontro con la Gatta Filosofa.', letter: 'prologo', emoji: '🐱' },
  { num: 'Capitolo I', name: 'La Primavera dei Numeri', desc: 'Fibonacci, Pitagora, Euclide, il calcolo e la statistica: la matematica che fiorisce.', letter: 'primavera', emoji: '🌷' },
  { num: 'Capitolo II', name: 'L\'Estate del Movimento', desc: 'Pendoli, mele, orbite, luce e calamite: la fisica che gioca.', letter: 'estate', emoji: '☀️' },
  { num: 'Capitolo III', name: 'L\'Autunno dei Misteri', desc: 'Scatole, crivelli, probabilità, entropia e galleggiamento: i segreti del molto piccolo.', letter: 'autunno', emoji: '🍂' },
  { num: 'Capitolo IV', name: 'L\'Inverno dell\'Infinito', desc: 'Limiti, serie, tempo relativo e caos: l\'infinito che fa le fusa.', letter: 'inverno', emoji: '❄️' },
  { num: 'Epilogo', name: 'La Lettera Mai Spedita', desc: 'L\'ultima lettera, letta dalla Gatta Filosofa.', letter: 'finale', emoji: '💖' },
];

const QUESTIONS = [
  { q: 'La matematica si scopre o si inventa?', hint: 'Platone credeva che i numeri esistessero prima di noi; altri dicono che li costruiamo noi. E tu?' },
  { q: 'La realtà esiste prima di essere osservata?', hint: 'Il gatto di Schrödinger è addormentato e sveglio insieme… finché qualcuno non apre la scatola.' },
  { q: 'Il tempo è un fiume o un\'illusione?', hint: 'Newton lo vedeva assoluto, Einstein relativo. E il tempo del cuore?' },
  { q: 'L\'infinito: può il pensiero contenerlo?', hint: 'Leopardi lo «finge col pensiero»; Cantor lo doma con gli insiemi. Tu, dove lo metti?' },
  { q: 'Il caso esiste o è solo ignoranza?', hint: 'Pascal fondò la probabilità per dividere una posta. Il destino, invece, chi lo divide?' },
  { q: 'La bellezza è un criterio di verità?', hint: 'Keats: «Beauty is truth, truth beauty». Dirac cercava equazioni belle. E tu, di cosa ti fidi?' },
  { q: 'Cosa significa «capire»?', hint: 'Capire non è ricordare: è far fiorire qualcosa dentro di sé. Il gioco stesso ne è la prova.' },
  { q: 'Siamo polvere di stelle che osserva le stelle?', hint: 'La meraviglia, diceva Aristotele, è l\'inizio della filosofia. E anche delle fusa.' },
];

const PURR_LEVELS = [
  { min: 0,  name: 'Fusa timide', emoji: '🐈' },
  { min: 4,  name: 'Fusa contente', emoji: '🐱' },
  { min: 8,  name: 'Motore acceso', emoji: '😸' },
  { min: 13, name: 'Sisma d\'amore', emoji: '😻' },
  { min: 18, name: 'Purrfection', emoji: '💖' },
];

/* Costellazioni del cielo notturno: stagioni + traguardi, coordinate sul canvas del cielo */
const SKY_CONSTELLATIONS = {
  primavera: {
    name: 'La Costellazione dei Numeri', emoji: '🌷', kind: 'season',
    pts: [[50, 152], [96, 130], [142, 118], [184, 128], [222, 150]],
  },
  estate: {
    name: 'La Costellazione del Movimento', emoji: '☀️', kind: 'season',
    pts: [[56, 44], [102, 40], [150, 44], [198, 52], [242, 64]],
  },
  autunno: {
    name: 'La Costellazione dei Misteri', emoji: '🍂', kind: 'season',
    pts: [[38, 176], [76, 150], [114, 124], [152, 98], [190, 72]],
  },
  inverno: {
    name: 'La Costellazione dell\'Infinito', emoji: '❄️', kind: 'season',
    pts: [[66, 96], [108, 80], [150, 72], [192, 80], [230, 94]],
  },
  gatta: {
    name: 'La Costellazione della Gatta', emoji: '🐱', kind: 'goal',
    pts: [[60, 64], [110, 42], [152, 62], [134, 112], [82, 112]],
  },
  lettere: {
    name: 'La Costellazione delle Lettere', emoji: '💌', kind: 'goal',
    pts: [[52, 126], [92, 84], [140, 62], [188, 84], [228, 126], [140, 156]],
  },
  pensieri: {
    name: 'La Costellazione dei Pensieri', emoji: '🪶', kind: 'goal',
    pts: [[40, 152], [80, 122], [120, 102], [160, 102], [200, 122], [240, 152], [140, 64], [140, 184]],
  },
};

/* Fiori del Calendario: uno al mese, si sbloccano dal giorno indicato (stile Animal Crossing).
   month: 0-11 · day: 1-31 · una volta sbocciati, restano nel calendario. */
const CALENDAR_FLOWERS = [
  {
    id: 'gennaio', month: 0, day: 6, emoji: '❄️',
    name: 'Il Bucaneve di Gennaio',
    blurb: 'Il primo fiore dell\'anno spunta dalla neve: il ghiaccio, che galleggia perché meno denso dell\'acqua.',
    quote: 'Spesso il male di vivere ho incontrato…', quoteSource: 'Eugenio Montale',
    q: 'A quale temperatura l\'acqua congela (a pressione atmosferica)?',
    opts: ['0 °C', '100 °C', '−50 °C'], correct: 0,
    expl: 'L\'acqua congela a 0 °C (273,15 K): il ghiaccio, meno denso, galleggia — per fortuna dei pesci e dei fiori.',
  },
  {
    id: 'febbraio', month: 1, day: 14, emoji: '💘',
    name: 'La Rosa di San Valentino',
    blurb: 'Il mese del cuore: e il cuore, diceva Pascal, ha le sue ragioni che la ragione non conosce.',
    quote: 'Il cuore ha le sue ragioni che la ragione non conosce.', quoteSource: 'Blaise Pascal, Pensées',
    q: 'Qual è il rapporto di frequenza dell\'ottava in musica?',
    opts: ['2:1', '3:2', '1:1'], correct: 0,
    expl: 'L\'ottava è 2:1: la corda lunga la metà suona il doppio. È l\'armonia che Pitagora regalò al cuore.',
  },
  {
    id: 'marzo', month: 2, day: 14, emoji: '🥧',
    name: 'Il Fiore di Pi Greco',
    blurb: 'Il 14 marzo (3/14) è il Pi Day: la festa della costante più famosa del mondo.',
    quote: 'Il grande libro dell\'universo è scritto in lingua matematica.', quoteSource: 'Galileo Galilei',
    q: 'π (pi greco) è il rapporto tra…',
    opts: ['circonferenza e diametro', 'area e perimetro', 'raggio e diametro'], correct: 0,
    expl: 'π = circonferenza / diametro ≈ 3,14159… Una costante che appare ovunque, anche dove non la cerchi.',
  },
  {
    id: 'aprile', month: 3, day: 22, emoji: '🌍',
    name: 'Il Fiore della Terra',
    blurb: 'La Giornata della Terra: il giorno in cui misuriamo il mondo, come faceva Eratostene con un bastone.',
    quote: 'E pur si muove!', quoteSource: 'Galileo Galilei',
    q: 'Chi misurò la circonferenza della Terra usando solo le ombre?',
    opts: ['Eratostene', 'Einstein', 'Newton'], correct: 0,
    expl: 'Eratostene (III sec. a.C.) confrontò le ombre di due città e ottenne un valore sorprendentemente vicino al vero.',
  },
  {
    id: 'maggio', month: 4, day: 1, emoji: '🌸',
    name: 'Il Fiore dei Petali',
    blurb: 'A maggio le margherite fioriscono: conta i petali, e la sequenza ti sorriderà.',
    quote: 'La matematica è la vita degli dèi.', quoteSource: 'Novalis',
    q: '13, 21, 34 sono numeri…',
    opts: ['di Fibonacci', 'primi', 'pari'], correct: 0,
    expl: 'Sono numeri di Fibonacci: 13+21=34. E i petali delle margherite, spesso, sono proprio 13, 21 o 34.',
  },
  {
    id: 'giugno', month: 5, day: 21, emoji: '☀️',
    name: 'Il Fiore del Solstizio',
    blurb: 'Il giorno più lungo dell\'anno: il Sole alto, i pendoli che dondolano, il tempo che si allunga.',
    quote: 'E pur si muove!', quoteSource: 'Galileo Galilei',
    q: 'Il periodo di un pendolo dipende da…',
    opts: ['la lunghezza', 'l\'ampiezza', 'il colore'], correct: 0,
    expl: 'Per piccole oscillazioni T = 2π√(L/g): dipende solo dalla lunghezza. Il solstizio è lungo, ma il pendolo resta puntuale.',
  },
  {
    id: 'luglio', month: 6, day: 4, emoji: '✨',
    name: 'Il Fiore delle Stelle',
    blurb: 'Le notti d\'estate sono piene di stelle: ogni punto di luce è un sole lontanissimo.',
    quote: 'M\'illumino d\'immenso.', quoteSource: 'Giuseppe Ungaretti',
    q: 'Le «stelle cadenti» sono in realtà…',
    opts: ['meteore', 'pianeti', 'galassie'], correct: 0,
    expl: 'Sono meteore: granelli di polvere che bruciano entrando nell\'atmosfera. Polvere di stelle che disegna desideri.',
  },
  {
    id: 'agosto', month: 7, day: 10, emoji: '🌙',
    name: 'Il Fiore di San Lorenzo',
    blurb: 'La notte delle stelle cadenti: alza gli occhi, e la costellazione ti risponde.',
    quote: 'E il naufragar m\'è dolce in questo mare.', quoteSource: 'Giacomo Leopardi, L\'infinito',
    q: 'Perché le costellazioni cambiano con le stagioni?',
    opts: ['la Terra orbita attorno al Sole', 'le stelle si muovono ogni notte', 'il cielo ruota solo d\'estate'], correct: 0,
    expl: 'È la Terra che si sposta nella sua orbita: di notte guardiamo direzioni diverse del cielo, stagione dopo stagione.',
  },
  {
    id: 'settembre', month: 8, day: 23, emoji: '🍂',
    name: 'Il Fiore dell\'Equinozio',
    blurb: 'L\'equinozio d\'autunno: il giorno e la notte si danno la mano, perfettamente uguali.',
    quote: 'Ognuno sta solo sul cuor della terra trafitto da un raggio di sole.', quoteSource: 'Salvatore Quasimodo',
    q: 'All\'equinozio, giorno e notte…',
    opts: ['durano all\'incirca uguali', 'la notte vince', 'il giorno vince'], correct: 0,
    expl: 'Agli equinozi il Sole è sull\'equatore celeste: giorno e notte durano quasi uguali in tutto il mondo.',
  },
  {
    id: 'ottobre', month: 9, day: 31, emoji: '🎃',
    name: 'Il Fiore di Halloween',
    blurb: 'La notte dei gatti neri: e il gatto più famoso della fisica sta in una scatola.',
    quote: 'Siamo tutti matti qui.', quoteSource: 'Lo Stregatto, Alice nel Paese delle Meraviglie',
    q: 'Il gatto di Schrödinger è…',
    opts: ['addormentato E sveglio insieme', 'solo sveglio', 'solo un mito senza senso'], correct: 0,
    expl: 'È in sovrapposizione: addormentato e sveglio insieme, finché una misura non lo «sceglie». La fisica più strana del calendario.',
  },
  {
    id: 'novembre', month: 10, day: 1, emoji: '🦋',
    name: 'Il Fiore del Caos',
    blurb: 'Novembre è imprevedibile: come il tempo, come ogni sistema caotico.',
    quote: 'Il battito d\'ali di una farfalla in Brasile può provocare un tornado in Texas.', quoteSource: 'Edward Lorenz',
    q: 'L\'effetto farfalla riguarda…',
    opts: ['la sensibilità alle condizioni iniziali', 'la migrazione delle farfalle', 'i colori delle ali'], correct: 0,
    expl: 'Nel caos deterministico, piccole differenze iniziali crescono esponenzialmente: il futuro è scritto, ma non si può leggere.',
  },
  {
    id: 'dicembre', month: 11, day: 21, emoji: '🎄',
    name: 'Il Fiore dell\'Infinito',
    blurb: 'Il solstizio d\'inverno, la notte più lunga: il momento perfetto per guardare l\'infinito.',
    quote: 'Sempre caro mi fu quest\'ermo colle…', quoteSource: 'Giacomo Leopardi, L\'infinito',
    q: 'La somma ½ + ¼ + ⅛ + 1/16 + … vale…',
    opts: ['1', '2', '∞'], correct: 0,
    expl: 'Converge a 1: infinite tappe, distanza finita. Il paradosso di Zenone si scioglie nel limite, come la neve al sole.',
  },
];

const MINIGAME_INFO = {
  petali:    { title: 'I Petali di Fibonacci',    sub: 'Tocca i petali in ordine di sequenza: ogni numero è la somma dei due precedenti.' },
  lira:      { title: 'La Lira del Gatto',        sub: 'Trova la corda che suona il rapporto giusto: ascoltale prima di scegliere.' },
  forme:     { title: 'Il Giardino Geometrico',   sub: 'Riconosci le figure: una figura si conosce dalle sue proprietà.' },
  crescita:  { title: 'La Crescita della Violetta', sub: 'Derivata e integrale: la velocità di crescita e l\'acqua totale bevuta.' },
  media:     { title: 'La Margherita dei Dati',   sub: 'Calcola la media: somma i valori e dividi per quanti sono.' },
  pendolo:   { title: 'L\'Altalena di Galilea',   sub: 'Tocca quando il gattino passa dal centro: il periodo non dipende dall\'ampiezza!' },
  mele:      { title: 'Le Mele di Newton',        sub: 'Trascina il cesto e cattura le mele che cadono. La parabola le porta da te.' },
  orbita:    { title: 'L\'Orbita di Keplero',     sub: 'Trascina per dare la spinta alla palla di lana: la velocità giusta la mette in orbita.' },
  prisma:    { title: 'Il Prisma Arcobaleno',     sub: 'Tocca i colori in ordine di lunghezza d\'onda: dal rosso (lunga) al violetto (corta).' },
  calamita:  { title: 'La Calamita di Faraday',   sub: 'Quale oggetto sente il richiamo del magnete? Il ferro sì, il legno no.' },
  scatola:   { title: 'La Scatola di Schrödinger', sub: 'Ricorda i gattini svegli: solo l\'osservazione li «congela» in uno stato.' },
  crivello:  { title: 'Il Crivello di Eratostene', sub: 'Tocca un numero primo e i suoi multipli cadranno. Restano solo i primi!' },
  scommessa: { title: 'La Scommessa di Pascal',   sub: 'Conta i casi favorevoli e dividi per i casi possibili: la fortuna è matematica.' },
  stati:     { title: 'Il Ghiacciolo di Clausius', sub: 'L\'entropia ha una direzione: ordina gli stati e scegli il processo giusto.' },
  vasca:     { title: 'La Vasca di Archimede',    sub: 'Galleggia o affonda? La spinta di Archimede decide per te.' },
  collina:   { title: 'La Collina di Leopardi',   sub: 'Ogni passo fa metà della strada che resta. Tocca per avanzare: dove si va a finire?' },
  viaggio:   { title: 'Il Viaggio di Einstein',   sub: 'Regola la velocità della navicella: quando γ = 10, un anno a bordo vale dieci sulla Terra.' },
  farfalla:  { title: 'La Farfalla di Lorenz',    sub: 'Piccole cause, grandi effetti: il caos deterministico in tre domande.' },
};

/* FAQ — stile manuale universitario */
const FAQ = [
  {
    q: 'Che cos\'è la sequenza di Fibonacci e qual è la sua definizione formale?',
    a: 'Si definisce sequenza di Fibonacci la successione {Fₙ} di numeri interi tale che F₀=0, F₁=1 e, per ogni n≥2, Fₙ=Fₙ₋₁+Fₙ₋₂. Si tratta di una ricorrenza lineare del secondo ordine, la cui soluzione chiusa è espressa dalla formula di Binet: Fₙ = (φⁿ − ψⁿ)/√5, dove φ=(1+√5)/2 è la sezione aurea e ψ=(1−√5)/2 il suo coniugato. Il rapporto Fₙ₊₁/Fₙ converge a φ. La sequenza è alla base dello studio delle strutture ricorsive e compare in combinatoria, in informatica (Knuth) e in modelli di crescita biologica.',
    ref: 'Riferimenti: R. Courant e H. Robbins, Che cos\'è la matematica; D. E. Knuth, The Art of Computer Programming, vol. 1.'
  },
  {
    q: 'Qual è il fondamento matematico degli intervalli musicali?',
    a: 'In acustica musicale, un intervallo è definito dal rapporto tra le frequenze fondamentali di due suoni. L\'ottava corrisponde al rapporto 2:1, la quinta giusta a 3:2, la quarta giusta a 4:3. Tali rapporti, già studiati dalla scuola pitagorica, producono consonanza perché le componenti armoniche coincidono parzialmente. Il sistema temperato equabile, oggi universale, approssima ogni intervallo con un multiplo del semitono 2^(1/12), sacrificando la purezza razionale in favore della trasposizione tonale.',
    ref: 'Riferimento: J. Jeans, Scienza e musica (Science and Music).'
  },
  {
    q: 'Perché il periodo di un pendolo non dipende dall\'ampiezza delle oscillazioni?',
    a: 'Per piccole oscillazioni, vale l\'approssimazione lineare sin θ ≈ θ, e l\'equazione del moto diventa θ″ + (g/L)·θ = 0, un oscillatore armonico di pulsazione ω=√(g/L). Il periodo T=2π√(L/g) risulta pertanto indipendente dall\'ampiezza e dalla massa del pendolo. L\'isocronismo fu osservato da Galileo e impiegato nella costruzione degli orologi a pendolo; una trattazione esatta richiede invece gli integrali ellittici e mostra una debole dipendenza dall\'ampiezza per oscillazioni ampie.',
    ref: 'Riferimento: D. Halliday, R. Resnick, J. Walker, Fondamenti di fisica, cap. «Oscillazioni».'
  },
  {
    q: 'Che cosa afferma la legge di gravitazione universale?',
    a: 'La legge di gravitazione universale di Newton stabilisce che due corpi puntiformi di massa m₁ e m₂ si attraggono con una forza direttamente proporzionale al prodotto delle masse e inversamente proporzionale al quadrato della distanza: F = G·m₁·m₂/r², con G=6,674×10⁻¹¹ N·m²·kg⁻². Dalla combinazione di questa legge con le leggi del moto si deducono le leggi di Keplero e si spiegano tanto la caduta dei gravi in superficie quanto il moto dei pianeti, unificando fisica terrestre e celeste.',
    ref: 'Riferimento: D. Halliday, R. Resnick, J. Walker, Fondamenti di fisica; I. Newton, Philosophiae Naturalis Principia Mathematica (1687).'
  },
  {
    q: 'Che cos\'è la sovrapposizione quantistica e cosa dice il paradosso del gatto di Schrödinger?',
    a: 'In meccanica quantistica, lo stato di un sistema è rappresentato da un vettore in uno spazio di Hilbert. Lo stato |ψ⟩ = α|0⟩ + β|1⟩, con |α|²+|β|²=1, descrive una sovrapposizione coerente degli stati |0⟩ e |1⟩: la misura della grandezza associata produce l\'esito |0⟩ con probabilità |α|² e |1⟩ con probabilità |β|², collassando la funzione d\'onda. Il paradosso del gatto di Schrödinger (1935) estende questo formalismo a un sistema macroscopico per evidenziarne le difficoltà interpretative, in particolare il ruolo dell\'osservatore e il problema della misura.',
    ref: 'Riferimento: D. J. Griffiths, Introduzione alla meccanica quantistica; E. Schrödinger, «Die gegenwärtige Situation in der Quantenmechanik» (1935).'
  },
  {
    q: 'Che cosa sono i numeri primi e perché sono rilevanti in matematica e crittografia?',
    a: 'Un numero primo è un intero n>1 i cui unici divisori positivi sono 1 e n stesso. Il teorema fondamentale dell\'aritmetica assicura che ogni intero positivo si decompone in modo unico in un prodotto di primi. Euclide dimostrò che i primi sono infiniti (Elementi, IX.20). Il crivello di Eratostene ne fornisce un elenco algoritmico. La loro distribuzione, descritta asintoticamente dal teorema dei numeri primi π(x) ~ x/ln x, è alla base della crittografia asimmetrica: la sicurezza dell\'RSA dipende dalla difficoltà computazionale della fattorizzazione di prodotti di primi molto grandi.',
    ref: 'Riferimento: G. H. Hardy e E. M. Wright, An Introduction to the Theory of Numbers; R. Courant e H. Robbins, Che cos\'è la matematica.'
  },
  {
    q: 'Che cos\'è una serie convergente e come si risolve il paradosso di Zenone?',
    a: 'Data una successione {aₖ}, la serie Σaₖ si definisce convergente se la successione delle somme parziali sₙ=Σ_{k=1}^n aₖ ammette limite finito. La serie geometrica di ragione 1/2 converge a 1, poiché sₙ=1−2⁻ⁿ → 1. Nel paradosso di Zenone, Achille percorre successivamente le metà della distanza restante: la somma infinita degli spostamenti è finita, quindi il moto si compie in tempo finito. La soluzione risiede nella distinzione tra processo infinito (numero di passi) e limite finito (distanza totale): l\'infinito è potenziale, non attuale.',
    ref: 'Riferimento: W. Rudin, Principles of Mathematical Analysis; T. M. Apostol, Mathematical Analysis.'
  },
  {
    q: 'Che cos\'è la dilatazione del tempo nella relatività ristretta?',
    a: 'La relatività ristretta (Einstein, 1905) postula la costanza della velocità della luce c in ogni riferimento inerziale. Ne consegue che un intervallo di tempo proprio Δt₀, misurato da un orologio in quiete rispetto all\'evento, appare dilatato a Δt = γ·Δt₀ in un riferimento in moto relativo, con γ=1/√(1−v²/c²) ≥ 1. La dilatazione è simmetrica tra i due riferimenti e diventa rilevante per velocità prossime a c. Il fenomeno ha applicazioni tecnologiche dirette: gli orologi atomici dei satelliti GPS richiedono correzioni relativistiche per garantire la precisione di posizionamento.',
    ref: 'Riferimento: A. Einstein, Zur Elektrodynamik bewegter Körper (1905); R. Resnick, Introduzione alla relatività ristretta.'
  },
  {
    q: 'Che cos\'è l\'entropia e perché definisce una freccia del tempo?',
    a: 'L\'entropia S è una funzione di stato che, nel secondo principio della termodinamica (Clausius), soddisfa ΔS ≥ 0 per trasformazioni adiabatiche di un sistema isolato. La formulazione statistica di Boltzmann, S = k·ln Ω, la identifica con il logaritmo del numero Ω di microstati compatibili con un dato macrostato. I processi spontanei procedono verso gli stati macroscopicamente più probabili, il che rende irreversibili fenomeni come la fusione del ghiaccio o la rottura di un uovo. Tale asimmetria temporale dei processi macroscopici definisce la freccia del tempo.',
    ref: 'Riferimento: E. Fermi, Termodinamica; D. Halliday, R. Resnick, J. Walker, Fondamenti di fisica; A. Eddington, The Nature of the Physical World (1928).'
  },
  {
    q: 'Che cos\'è una derivata e qual è la sua interpretazione?',
    a: 'Data f definita in un intorno di x₀, la derivata è f′(x₀) = lim_{h→0} (f(x₀+h) − f(x₀))/h, purché il limite esista finito. Geometricamente, f′(x₀) è il coefficiente angolare della retta tangente al grafico nel punto; cinematicamente, è la velocità istantanea di un moto rettilineo. Il teorema fondamentale del calcolo stabilisce che l\'integrazione è l\'operazione inversa della derivazione, collegando variazione locale e accumulo globale. Il calcolo differenziale è lo strumento costitutivo della fisica classica e dell\'ottimizzazione.',
    ref: 'Riferimento: R. Courant, Introduzione al calcolo infinitesimale; T. M. Apostol, Calculus.'
  },
  {
    q: 'Che cosa stabiliscono le leggi di Keplero?',
    a: 'Le tre leggi empiriche di Keplero descrivono il moto planetario: (I) i pianeti percorrono orbite ellittiche con il Sole in uno dei fuochi; (II) il raggio vettore Sole-pianeta spazza aree uguali in tempi uguali (conservazione del momento angolare); (III) il quadrato del periodo di rivoluzione è proporzionale al cubo del semiasse maggiore dell\'orbita, T² ∝ a³. Esse costituiscono il fondamento osservativo su cui Newton costruì la teoria della gravitazione universale, che le deduce come conseguenze delle leggi della dinamica.',
    ref: 'Riferimento: J. Kepler, Astronomia Nova (1609) e Harmonices Mundi (1619); D. Halliday, R. Resnick, J. Walker, Fondamenti di fisica.'
  },
  {
    q: 'La matematica è inventata o scoperta?',
    a: 'La questione è oggetto di un dibattito filosofico antico. Il platonismo sostiene che gli enti matematici esistano indipendentemente dalla mente umana e che il matematico li «scopra»; il formalismo hilbertiano li considera invece costruzioni sintattiche prive di contenuto semantico intrinseco; l\'intuizionismo di Brouwer li fonda su costruzioni mentali. L\'«efficacia irragionevole della matematica nelle scienze naturali» (Wigner, 1960) alimenta la tesi realista, mentre i teoremi di incompletezza di Gödel (1931) fissano limiti interni a ogni sistema formale ricorsivo. Il gioco lascia aperta la domanda, come il Diario della Gatta insegna.',
    ref: 'Riferimento: E. Wigner, «The Unreasonable Effectiveness of Mathematics in the Natural Sciences» (1960); R. Penrose, La mente nuova dell\'imperatore; B. Russell, Introduzione alla filosofia matematica.'
  },
];
