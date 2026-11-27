/* Notte 3 — Mercoledì. Le tre sorelle. */
export default String.raw`
=== n3_inizio
@title "Notte 3 · Mercoledì" "Le tre sorelle"
@bg mattina
@fx fumo
@music giorno
@hide all
@sfx porta
@show maresciallo center
Alle sette arriva un carabiniere in divisa, cappello sotto il braccio, baffi grigi tagliati con il righello.
MARESCIALLO: Maresciallo Cazzaniga. Un caffè corretto. Corretto con niente: corretto nel senso che deve essere fatto correttamente.
+ [☕ Caffè]
  ~ trust.maresciallo += 1; mance += 1
  @sfx tazzina
  MARESCIALLO: Corretto. Bene. Rapporto: il bar è in ordine. Il maresciallo, meno.
+ [☕🥃 Caffè corretto alla grappa]
  MARESCIALLO: Ho detto corretto con niente.
  Lo beve lo stesso. Poi si guarda intorno per controllare che nessuno l'abbia visto.
  ~ trust.maresciallo += 1; maresciallo_segreto
  MARESCIALLO: Questo resta tra noi. È un ordine.
MARESCIALLO (abbassando la voce): Le dico una cosa, che è un consiglio e non un'ispezione. Le macchinette di là hanno il nulla osta scaduto da quattro mesi. Io non l'ho visto. Ma prima o poi lo vede qualcuno che non sono io.
Guarda verso la merceria di fronte, dove Assunta sta alzando la serranda. Si aggiusta i baffi, senza accorgersene.
* [Lei viene qui per il caffè o per la merceria, Maresciallo?]
  ~ trust.maresciallo += 1
  MARESCIALLO: Io vengo qui da trentun anni per il caffè.
  MARESCIALLO: E da trentun anni la merceria è di fronte. È una coincidenza urbanistica.
* [Grazie del consiglio.]
  MARESCIALLO: Non l'ho dato. Buona giornata.
@hide maresciallo
-> n3_tenda

=== n3_tenda
@bg saletta
@music macchina
@show luca center
Alle tre del pomeriggio arriva il tecnico per la manutenzione, e Luca per la prima volta apre la tenda davanti a te.
La saletta è piccola, senza finestre, con la moquette bordeaux bruciacchiata di sigarette. Ci sono tre macchine, una accanto all'altra. Hanno le luci che respirano, come animali che dormono.
Su ognuna, qualcuno ha incollato un carattere cinese ritagliato dalla carta rossa: 福 禄 寿.
LUCA: Mio padre le chiamava così. Fu, Lu, Shou. Fortuna, Prosperità, Lunga vita. I tre dèi delle stelle. In Cina li metti in casa, sopra la porta, per proteggerti.
LUCA: Lui li ha messi qui. Nel 2009. Il bar perdeva soldi, e un signore in giacca gli ha detto che con le macchinette l'affitto si pagava da solo.
LUCA: Aveva ragione. L'affitto si paga da solo. Da quindici anni. Lo pagano Gigi, e quelli come Gigi.
* [E tuo padre?]
  LUCA: Mio padre di notte veniva qui "per controllare che funzionassero".
  LUCA: Funzionavano benissimo.
  Non aggiunge altro. Ma il modo in cui guarda la macchina al centro, Prosperità, è il modo in cui si guarda una persona che ti ha fatto del male e che hai continuato a frequentare.
  ~ trust.luca += 1; padre_saletta
* [Spegnile.]
  LUCA: Facile, dirlo. Tu l'affitto non lo paghi.
  LUCA: Ottocento euro a settimana, Blu. Le tre sorelle fanno ottocento euro a settimana. Io con i caffè ne faccio quattrocento. La matematica è più crudele della gente.
  ~ detto_spegnile
* [Non dici niente.]
  Il tecnico fischietta. Apre la pancia di Fortuna, conta, richiude. Ti sembra di assistere a un'operazione chirurgica fatta a un'anima.
MACCHINA: (una voce registrata, dolcissima) Ciao! Gioca con me! La fortuna è dietro l'angolo!
LUCA: Ogni tanto parlano. Mio padre diceva che di notte dicevano anche altre cose.
LUCA: Vuoi provare? Tutti provano. Lui diceva che bisogna sapere cosa si vende.
* [Provo. Una volta.]
  ~ provato
  @saletta
  LUCA: Visto? Ti fanno vincere un po', all'inizio. Sono gentili, all'inizio. Come tutti.
* [No.]
  ~ trust.luca += 1
  Luca annuisce. Poi, quasi sottovoce:
  LUCA: Bene. Io a diciott'anni ho detto sì.
@hide luca
-> n3_nando

=== n3_nando
@bg pomeriggio
@music giorno
@sfx porta
@show nando left
Alle cinque entra un vecchio con la tuta blu da meccanico e un berretto di lana con il pon pon. Ha in tasca un cacciavite, un'agenda e mezzo panino.
NANDO: Nando Galimberti. Inventore. Brevetti in sospeso: sette. Funzionanti: quasi tutti. Un chinotto, grazie.
+ [🥤 Chinotto]
  ~ trust.nando += 1; mance += 1
  @sfx tazzina
+ [☕ Caffè]
  NANDO: Il caffè mi fa tremare le mani. Ma va bene, tremo. Gli inventori devono tremare un po'.
  @sfx tazzina
Spiega un tovagliolo sul bancone. C'è disegnata una scatola con delle manovelle, un cilindro pieno di buchi, e una lampadina.
NANDO: La macchina che allunga la vita. Mi manca un cavo. E un pezzo che non esiste ancora. E un'idea per il pezzo che non esiste.
- [Come fa ad allungare la vita?]
  NANDO: Allunga la notte. Mia moglie, la Gina, aveva paura del buio. Quando si spegneva la luce le sembrava che la notte non finisse più.
  NANDO: Allora le ho promesso una macchina che facesse le stelle sul soffitto, e una musica. Così la notte passa prima. La notte che passa prima è vita che si allunga, capisci? Per chi ha paura.
  NANDO: La Gina è morta nel 2016. La macchina non è ancora pronta. Ma io la finisco lo stesso. Le promesse non hanno la data di scadenza.
  ~ trust.nando += 1; nando_gina
- [Mi lascia il disegno?]
  ~ trust.nando += 1
  NANDO: Te lo lascio, ma è un prototipo. Non farlo vedere ai cinesi. No, scusa. Ai giapponesi. A nessuno.
@memory nando "La macchina che allunga la vita fa le stelle sul soffitto. Era per la Gina, che aveva paura del buio."
@hide nando
-> n3_truffa

=== n3_truffa
@bg sera
@music sera
@sfx porta
@show contessa left
@show gigi right
La sera la Contessa arriva prima di Gigi e lo aspetta. Quando lui entra, lei gli fa spazio sul divanetto, come una zia.
CONTESSA: Luigi caro. Le ho portato i documenti della tonnara. Guardi che carta intestata. Guardi lo stemma.
GIGI: Il trenta per cento... In un anno farei i tremila che mi mancano. E anche di più.
CONTESSA: Molto di più. Basta firmare qui, e domani mi porta la prima quota. Duemila. In contanti, per via delle tasse sarde.
Gigi tira fuori la penna. È una penna stilografica, d'argento: un regalo, si capisce, di quando qualcuno gli faceva regali.
* [Gigi. Le tonnare in Sardegna sono quasi tutte chiuse.]
  ~ trust.gigi += 1; trust.contessa -= 1; gigi_avvisato
  La Contessa ti guarda. Per un istante dietro la veletta non c'è una contessa: c'è una donna stanca di settant'anni che ha appena perso duemila euro.
  CONTESSA: Qui al bancone si legge molto, vedo. Su internet, immagino. Su internet c'è scritto di tutto, anche le cose false.
  GIGI: Forse... forse ci penso. Ci dormo sopra.
  Rimette la penna nel taschino.
* [Non è affar tuo. Lavi i bicchieri.]
  ~ gigi_truffato
  Gigi firma. La penna gratta sulla carta. La Contessa sorride, e il sorriso le arriva solo fino agli zigomi.
* [Contessa, posso parlarle un attimo, da sola?]
  ~ contessa_parlato
  Lei ti segue fino all'angolo delle bottiglie. Abbassi la voce.
  * [Lui quei soldi li tiene per sua figlia.]
    ~ trust.contessa += 1; gigi_avvisato
    La Contessa resta zitta. Poi si toglie un guanto, piano, dito per dito.
    CONTESSA: Mio padre faceva il sarto a Lambrate. Mi ha cucito questa pelliccia su un cappotto vecchio di mia madre. La volpe è finta. Anche la contessa.
    CONTESSA: Va bene. Stasera la tonnara non si fa. Ma lei non dica niente a nessuno. La reputazione è l'unica cosa vera che ho.
    Torna al divanetto e dice a Gigi che "il notaio sardo è in ferie". Gigi rimette la penna nel taschino.
  * [Se lo frega, la denuncio al Maresciallo.]
    ~ trust.contessa -= 1; gigi_avvisato
    CONTESSA: Che modi. Che modi.
    Torna da Gigi e gli dice che la tonnara "è sospesa per maltempo". Ti lancia uno sguardo che potrebbe congelare il Martini.
@hide contessa
GIGI: Vado di là. Solo un'oretta. Stasera mi sento fortunato.
@sfx jingle
@hide gigi
-> n3_cassa

=== n3_cassa
@bg notte
@music notte
@show luca center
All'una Luca svuota le tre sorelle in un secchio di plastica. Il rumore delle monete è quello di una grandine allegra.
LUCA: Ottocentoventi euro. Questa settimana l'affitto è salvo.
LUCA: Gigi ne ha lasciati duecentoquaranta. Li ho contati a parte. Non so perché lo faccio. Li conto a parte, e poi li metto con gli altri.
* [Potresti restituirglieli.]
  LUCA: E poi? Poi lui va in un'altra sala, in corso Buenos Aires, dove nessuno li conta a parte.
  LUCA: Almeno qui c'è qualcuno che lo guarda in faccia. È poco. Lo so che è poco.
  ~ trust.luca += 1
* [È solo il suo lavoro. Il nostro è il caffè.]
  LUCA: Già. Il nostro è il caffè.
  Lo dice come una persona che si ripete una cosa da quindici anni, e ogni anno ci crede un po' meno.
{provato} LUCA: E tu? Hai vinto o hai perso?
{provato} TU: Non lo so.
{provato} LUCA: Ecco. È così che cominciano. Nessuno sa mai se ha vinto o se ha perso.
@postcard tre-sorelle "Fu, Lu, Shou"
-> n3_hub

=== n3_hub
* {mance >= 1} [Lascia un caffè sospeso (1 €).]
  ~ mance -= 1; sospesi += 1
  SOSPESO. Ormai sotto la zuccheriera c'è una piccola pila. Sembra un mazzo di carte da gioco, ma con un solo seme: la speranza.
  -> n3_hub
* {mance >= 1} [Dietro la tenda. Solo un giro.]
  @bg saletta
  @saletta
  @bg notte
  -> n3_hub
* [Spegni le luci.]
  Mentre abbassi la serranda, da dietro la tenda arriva ancora la musichetta. Le tre sorelle restano accese tutta la notte. Non si spengono mai. Non dormono mai.
  -> n4_inizio
`;
