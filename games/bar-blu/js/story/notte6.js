/* Notte 6 — Sabato. Quello che resta. */
export default String.raw`
=== n6_inizio
@title "Notte 6 · Sabato" "Quello che resta"
@hide all
{ugo_morto} -> n6_lutto
-> n6_ugo_vivo

=== n6_lutto
@bg mattina
@fx none
@music stop
Sabato mattina la neve è già grigia. Alle sette e dieci entra Assunta, e non ha la borsa con i mandarini.
@show assunta center
ASSUNTA: L'hanno trovato all'alba. Sotto i portici, vicino al bidone. Il fuoco si era spento verso le tre.
ASSUNTA: Ugo. Il nostro Ugo.
Il bar resta zitto. Anche la macchina del caffè, per una volta, non sbuffa.
{ugo_sciarpa} ASSUNTA: Aveva una sciarpa che non era sua. Blu. Era avvolta due volte. Non è bastata.
{sospesi >= 1} ASSUNTA: In tasca aveva uno scontrino piegato in quattro. C'era scritto SOSPESO. Non l'aveva usato. Se lo teneva. Come una cosa preziosa. Come un documento.
@sfx jingle
Da dietro la tenda arriva la musichetta. Allegra. Identica.
@show luca left
Luca attraversa la sala, scosta la tenda, e strappa le spine dal muro, una dopo l'altra, così forte che una presa si stacca con un pezzo d'intonaco.
Silenzio.
Poi si siede per terra, nella saletta, con le spine in mano.
Dopo un minuto, le rimette. Una dopo l'altra. Le sorelle si riaccendono, contente, come cani che rivedono il padrone.
LUCA: Non posso. Non posso, capisci? Lunedì c'è l'affitto. Non posso neanche piangere senza fare i conti.
* [Ti siedi per terra accanto a lui.]
  ~ trust.luca += 1
  Ti siedi per terra accanto a lui. La moquette puzza di fumo vecchio. Le luci delle sorelle vi colorano la faccia di rosso, di verde, di giallo.
  Non parlate. Restate lì finché Assunta non vi chiama, perché sono arrivati i clienti, e i clienti non sanno niente, e vogliono il caffè.
* [Torni al bancone. Qualcuno deve fare i caffè.]
  Fai i caffè. Le mani si muovono da sole. È una cosa che le mani sanno fare: andare avanti, anche quando il resto no.
-> n6_veglia

=== n6_veglia
@bg candele
@fx candele
@music notte
@hide all
La sera, senza che nessuno l'abbia organizzato, vengono tutti. Accendono le candele rosse del capodanno cinese. Assunta porta i mandarini. Nessuno ordina niente.
ASSUNTA: Ugo raccoglieva le parole. Le trovava sui manifesti, sui giornali vecchi, sui muri. Le scriveva su un quaderno.
ASSUNTA: Facciamo così. Ognuno dice una parola per lui. Una sola.
MIRELLA: Fermata. Come la fermata del tram. E come quando si ferma il cuore. E come quando, in musica, una nota si tiene più a lungo di quanto è scritto.
BALDINI: Requie. Non riposo: requie. È una parola che non usa più nessuno. Gli sarebbe piaciuta proprio per questo.
ROCCO: Caffè. Non sono un poeta. Per me Ugo era il caffè.
ELVIRA: Eizarg. Me lo diceva sempre, quando gli lasciavo il resto. Grazie, al rovescio.
Tocca a te.
* [Casa.]
  La parola che gli mancava. La dici piano. Assunta si copre la bocca con la mano.
  ~ parola_ugo = 'casa'
* [Blu.]
  Il nome che ti ha dato il bar. Il nome con cui lui ti chiamava.
  ~ parola_ugo = 'blu'
* [Sospeso.]
  Come un caffè. Come una vita. Come la neve, prima di toccare terra.
  ~ parola_ugo = 'sospeso'
Anna disegna tutti, alla luce delle candele, senza alzare la testa dal foglio. Le lacrime le cadono sulla carta e il carboncino si allarga in piccole nuvole nere.
@postcard veglia "Una parola per Ugo"
@memory ugo "È morto sotto i portici della Centrale, la notte della neve. Ognuno gli ha portato una parola."
~ lutto_ugo; trust.luca += 1; trust.assunta += 1
-> n6_gigi

=== n6_ugo_vivo
@bg mattina
@fx fumo
@music giorno
@sfx porta
@show ugo center
Sabato mattina, alle sette e mezza, entra Ugo. Ha la barba fatta. Qualcuno, al dormitorio o nella saletta, gli ha prestato un rasoio.
{ugo_sciarpa} Ha ancora la tua sciarpa. Non te la restituisce. Fa bene.
UGO: Ti avevo promesso un regalo.
Apre una scatola di fiammiferi. Dentro ci sono tre caratteri di piombo, piccoli, consumati, che brillano come argento sporco: U, L, B.
UGO: Al rovescio. Come si compongono. Quando li stampi, viene dritto: BLU.
UGO: Li ho tenuti per quarantatré anni. Erano della mia prima cassetta. Adesso sono tuoi. Una parola dev'essere di qualcuno, se no si perde.
{sorelle_spente_una_notte} UGO: E di' a Luca che stanotte, senza musica, il bar respirava. L'ho sentito. Fa un rumore come il mare a Ostia, d'inverno.
* [Grazie, Ugo.]
  UGO: Eizarg, si dice. Impara.
* [Eizarg.]
  ~ trust.ugo += 1
  Ugo ride. Ride con tutta la faccia, con le rughe e con la barba appena fatta. Non l'hai mai visto ridere.
  UGO: Ecco. Adesso sei del bar.
@postcard piombo "U, L, B, al rovescio"
@memory ugo "Ti ha regalato tre caratteri di piombo della sua prima cassetta: U, L, B. Al rovescio fa BLU."
~ trust.luca += 1
@hide ugo
-> n6_gigi

=== n6_gigi
@bg sera
@fx none
@music sera
@hide all
{giulia_viene} -> n6_giulia
@show luca center
Il posto di Gigi al bancone resta vuoto. Luca ci ha messo una tazzina capovolta, per abitudine o per scaramanzia.
LUCA: Mi ha mandato un messaggio. Va da sua sorella a Genova. "Per un po'." Dice di salutarti.
LUCA: Le persone che dicono "per un po'" di solito intendono "per sempre", ma in modo più educato.
~ gigi_perso
-> n6_contessa

=== n6_giulia
@sfx porta
@show giulia right
Alle sette entra una ragazza alta, con un cappotto verde e un tubo porta-disegni a tracolla. Ha gli occhi di Gigi, ma messi meglio.
GIULIA: Sei tu? Quello del telefono?
GIULIA: È qui? No? Meglio. Ho tempo di scappare.
Non scappa. Si siede al bancone. Ordina un caffè e non lo beve. Ogni volta che si apre la porta, smette di respirare.
@sfx porta
@show gigi left
Alle sette e venti entra Gigi. Ha la barba di due giorni, la stessa giacca, nessuna cravatta. La vede. Si ferma in mezzo alla sala come se il pavimento finisse lì.
GIGI: Giulia.
GIULIA: Ciao, papà.
Nessuno dei due si muove. Il bar intero finge di leggere il giornale.
* {busta_salva} [Prendi la busta gialla da sotto la cassa e la dai a Gigi.] -> n6_busta
* [Non fai niente. Lasci che succeda.]
  -> n6_giulia_parla

=== n6_busta
Gigi guarda la busta. Poi guarda te. Poi la porge a Giulia, con le mani che tremano.
GIGI: È per te. Tremila euro. Per lo studio. Lo studio con il tuo nome sulla targa.
GIULIA: Papà. Io non voglio uno studio.
GIULIA: Voglio che tu venga alla laurea. Il ventidue marzo. Alle undici. Seduto, in fondo, senza fare niente di speciale. Solo seduto.
Gigi annuisce. Annuisce tante volte, come se la testa non riuscisse a smettere.
~ trust.gigi += 1
-> n6_giulia_parla

=== n6_giulia_parla
GIULIA: Mi ricordo Pinocchio. La balena. La voce di Geppetto con le mani così.
Fa le mani a coppa davanti alla bocca.
GIGI: "Pinocchio mio... sei tu?"
La voce gli esce rotta, con l'eco. Giulia ride e piange insieme, il modo più difficile.
GIULIA: Sì, papà. Sono io.
{!busta_salva} GIGI: Non ho più niente da darti. Neanche i soldi dello studio. Ho perso tutto, Giulia. Ancora.
{!busta_salva} GIULIA: Meglio. Così vieni tu, e basta. Senza regali. I regali li hai sempre usati per non esserci.
~ gigi_salvo
@postcard giulia "Pinocchio, dentro la balena"
@memory gigi "Giulia si laurea il ventidue marzo alle undici. Lui sarà seduto in fondo, senza fare niente di speciale."
@hide giulia
@hide gigi
-> n6_contessa

=== n6_contessa
@sfx porta
@show contessa center
Alle nove entra la Contessa. Senza veletta. Senza pelliccia. Ha un cappotto grigio da mercato e i capelli raccolti male. Sembra un'altra donna, ma è sempre stata quella.
{gigi_truffato} CONTESSA: Il signor Ferrante. Gli dica che... no. Non gli dica niente.
{gigi_truffato} Tira fuori dalla borsa una busta e la posa sul bancone. Dentro ci sono duemila euro, meno trecento.
{gigi_truffato} CONTESSA: Trecento li ho già spesi. Bollette. Non sono una contessa, sono una pensionata con la minima e un talento per le bugie. Il talento non paga il gas.
{!gigi_truffato} CONTESSA: Un caffè. Senza Martini. Stasera sono in borghese.
* [Si sieda, Adelaide. Il caffè lo offro io.]
  ~ trust.contessa += 2
  La chiami per nome, senza titolo. Lei resta un attimo immobile, come se avesse sentito suonare un telefono di trent'anni fa.
  CONTESSA: Adelaide. Nessuno mi chiama più così. Mio padre mi chiamava Adelaide quando mi ero comportata bene. Succedeva poco.
  @memory contessa "Suo padre faceva il sarto a Lambrate. La chiamava Adelaide quando si comportava bene."
* [Lei fa schifo, Contessa.]
  ~ trust.contessa -= 1
  CONTESSA: Lo so, caro. Lo so da più tempo di lei.
  Beve il caffè in piedi ed esce senza pagare. Per abitudine, più che per cattiveria.
@hide contessa
-> n6_luca

=== n6_luca
@bg notte
@music notte
@show luca center
Mezzanotte. Luca abbassa la serranda a metà e versa due bicchieri di baijiu, la grappa cinese, da una bottiglia che suo padre teneva nascosta dietro le confezioni di zucchero.
LUCA: Lunedì scade l'affitto. Duemilaquattrocento, con gli arretrati. E la ditta delle macchinette vuole i danni per Prosperità.
LUCA: Oggi è passato il rappresentante. Gentilissimo. Mi ha detto che i danni me li abbuona, se metto una quarta macchina. Una sorella in più. Si chiama Fortuna Gold. Ha i led che fanno l'arcobaleno.
LUCA: Con quattro sorelle l'affitto si paga da solo per sempre. Me l'ha detto proprio così. "Per sempre."
{trust.luca >= 3} -> n6_cantina
-> n6_consiglio

=== n6_cantina
@bg cantina
@music cantina
LUCA: Vieni. Ti faccio vedere una cosa che non ho mai fatto vedere a nessuno.
Scendete una scala ripida. In cantina, tra le casse di acqua minerale e le sedie rotte, ci sono decine di tele appoggiate al muro. Tutte blu.
Il blu delle sei di sera d'inverno. Il blu del neon sulla neve. Il blu di un mare che non hai mai visto, con una città lontana sulla riva.
LUCA: Wenzhou. Il porto di mia madre. Non ci sono mai stato. Lei me lo raccontava così bene che lo dipingo a memoria. A memoria sua.
LUCA: Mio padre è morto qui sopra, nel 2019. Nella saletta. L'ho trovato io, alle sei di mattina, con la testa appoggiata su Prosperità. Lo schermo suonava ancora. Aveva un gettone in mano.
LUCA: Da quel giorno, ogni notte, scendo e dipingo. Il blu copre tutto. È per questo che sciur Brambilla aveva scelto il blu, secondo me. Non per il saldo. Perché copre.
* [Le devi appendere di sopra. Nella saletta. Al posto delle sorelle.]
  ~ trust.luca += 1; seme_quadri
  Luca ride, ma non è una risata cattiva.
  LUCA: Una mostra in un bar di via Padova. Chi la viene a vedere? Assunta e il Maresciallo.
  LUCA: Però. Però, Blu.
* [Tuo padre sarebbe orgoglioso.]
  LUCA: Mio padre voleva che facessi il commercialista. Diceva che i pittori muoiono poveri.
  LUCA: Lui è morto povero lo stesso. Senza neanche aver dipinto niente.
@memory luca "Suo padre è morto nella saletta, nel 2019, con un gettone in mano. Luca dipinge di notte il porto di Wenzhou, a memoria di sua madre."
@postcard cantina "Il blu che copre"
-> n6_consiglio

=== n6_consiglio
@bg notte
@music notte
LUCA: Allora, Blu. Tu che dici? Tu che non paghi l'affitto, e hai visto tutto.
* [Spegnile. Tutte e tre. Il quartiere ti aiuterà.]
  ~ piano_spegnere
  LUCA: Il quartiere ha i suoi guai. La gente qui conta i centesimi.
  {trust.assunta >= 2} @show assunta left
  {trust.assunta >= 2} Dalla porta socchiusa entra Assunta, che ha la chiave dal 1998 e non bussa mai.
  {trust.assunta >= 2} ASSUNTA: Il quartiere conta i centesimi, sì. Ma li conta per chi vuole lui. Domani faccio un giro. Tu stai zitto e prepara i caffè.
  {trust.assunta >= 2} ~ colletta_assunta
  {trust.assunta < 2} LUCA: Va bene. Ci penso. Domani vediamo chi viene.
* [Prendi la quarta. Salva il bar. Il resto si vedrà.]
  ~ quarta; trust.luca -= 1
  LUCA: Sì. Il resto si vedrà. Si vede sempre, il resto. Di solito alle sei di mattina.
  Beve il baijiu tutto d'un fiato e tossisce.
* [Non lo so, Luca. Davvero.]
  LUCA: Grazie. Almeno sei l'unica persona che non mi dà consigli.
  ~ trust.luca += 1
@hide all
-> n6_hub

=== n6_hub
* {mance >= 1 && ugo_salvo} [Lascia un caffè sospeso (1 €).]
  ~ mance -= 1; sospesi += 1
  SOSPESO. Domani Ugo lo troverà. Lo sai, adesso, che lo troverà.
  -> n6_hub
* {mance >= 1 && ugo_morto} [Lasci lo stesso un sospeso. Per nessuno. Per lui.]
  ~ mance -= 1; sospesi += 1
  Lo scontrino resta sotto la zuccheriera. Nessuno lo userà. Domattina Assunta lo vede, e non lo toglie.
  -> n6_hub
* {mance >= 1} [Dietro la tenda.]
  @bg saletta
  @saletta
  @bg notte
  -> n6_hub
* [Chiudi.]
  -> n7_inizio
`;
