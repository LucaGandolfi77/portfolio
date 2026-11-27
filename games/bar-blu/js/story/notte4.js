/* Notte 4 — Giovedì. Casta diva. */
export default String.raw`
=== n4_inizio
@title "Notte 4 · Giovedì" "Casta diva"
@bg pomeriggio
@music giorno
@hide all
Giovedì c'è il vento. Spinge le foglie dei platani contro la vetrina, che sembrano mani che bussano.
@rush 2
@sfx porta
@show elvira center
Alle quattro Elvira. Il tavolino. Due caffè.
@sfx tazzina
* {trust.elvira >= 2} [Ti siedi sulla sedia di Teresa.]
  ~ trust.elvira += 2; elvira_seduta
  Elvira alza gli occhi. Per un momento hai paura di avere rotto qualcosa che non si può riparare.
  Poi lei spinge il macchiato freddo verso di te, con due dita.
  ELVIRA: Lo beva, prima che diventi più freddo di così.
  Lo bevi. È terribile: amaro, gelido, con il latte che sa di frigorifero.
  ELVIRA: Le faceva schifo anche a lei. Lo ordinava per farmi arrabbiare. Il primo giorno, nel 1981, le ho detto che il caffè freddo era una cosa da americani. Da allora l'ha bevuto freddo per quarantun anni. Per dispetto.
  ELVIRA: La sua famiglia mi ha chiesto di non venire al funerale. "Per rispetto." Io sono andata lo stesso. Sono stata dietro la quarta colonna di sinistra, a San Gioachimo.
  ELVIRA: Il padre di Luca è venuto con me. Non ha detto una parola. Mi ha tenuto il gomito per tutta la messa. Quando hanno detto "la cugina Elvira" non sono svenuta solo perché c'era quel gomito.
  * [Le prende la mano.]
    Ha la mano piccolissima e fredda. La lascia lì.
    ELVIRA: Grazie. Da tre anni nessuno mi tocca, se non per misurarmi la pressione.
  * [Teresa era fortunata.]
    ELVIRA: No. Fortunata ero io. Lei era coraggiosa. Sono due cose diverse, e io l'ho capito tardi.
  @memory elvira "Al funerale di Teresa è rimasta dietro la quarta colonna di sinistra. Il padre di Luca le teneva il gomito."
  @postcard elvira "Il macchiato freddo"
* [Porti i due caffè e torni al bancone.]
  Elvira beve il suo. Il macchiato si raffredda. Il mondo va avanti.
@hide elvira
-> n4_baldini

=== n4_baldini
@bg sera
@music sera
@sfx porta
@show baldini center
Baldini entra già ubriaco, il cappotto aperto, il Leopardi sotto il braccio senza copertina.
BALDINI: Grappa. Doppia. Anzi, tripla, che la filosofia è sempre una questione di quantità.
+ [🥃 Grappa]
  ~ baldini_alcol += 1; mance += 2
  @sfx tazzina
  Beve, e chiude gli occhi.
  {baldini_alcol >= 3} BALDINI: Lei è complice. Lo so che lo sa. Lo sappiamo tutti e due.
+ [☕ Caffè, forte, senza zucchero]
  ~ baldini_caffe += 1; trust.baldini += 1
  @sfx tazzina
  BALDINI: Ancora. Lei insiste.
  Lo beve. Le mani gli tremano un po' meno.
BALDINI: Oggi Matteo avrebbe compiuto trentun anni.
Lo dice a nessuno, al bancone, al libro.
* [Matteo?]
  BALDINI: Mio figlio. Diciannove anni, primo anno di Lettere. Diceva che la filosofia era una cosa per vecchi e voleva fare il poeta.
  BALDINI: Una sera di aprile, nel 2012. Una dose sbagliata, in un bagno dei Navigli. Lo hanno trovato con un taccuino in tasca. Dentro c'erano quattro versi. Brutti. Bruttissimi. Li so a memoria.
  {baldini_caffe >= 2} BALDINI: Dopo il funerale sono tornato in aula. Dovevo spiegare Epicuro: "Quando ci siamo noi, la morte non c'è; quando c'è la morte, non ci siamo più noi." Ho aperto la bocca, e non è uscito niente. Non sono più riuscito a spiegare il senso a nessuno. Neanche a me.
  {baldini_caffe >= 2} BALDINI: Lei mi porta il caffè da quattro giorni. Mi sta facendo ricordare. Non so se la ringrazio o la odio.
  {baldini_caffe >= 2} ~ trust.baldini += 2; baldini_matteo
  {baldini_caffe < 2} Si addormenta con la testa sul Leopardi prima di finire la frase.
* [Lo lasci parlare da solo.]
  Parla da solo. A un certo punto ride. Poi smette di ridere, ma la bocca resta nella forma della risata, come una casa vuota con le luci accese.
@memory baldini "Matteo aveva diciannove anni e voleva fare il poeta. Il professore conosce a memoria i suoi quattro versi brutti."
-> n4_buio

=== n4_buio
@show mirella left
@show rocco right
@show vera center
Alle dieci e mezza il bar è pieno. Mirella, Rocco, una donna con il chiodo di pelle e i capelli verdi sbiaditi che ordina una birra media e la chiama "la mia vitamina".
VERA: Vera. Vera Veleno, se avete più di quarant'anni. "Ruggine", 2003, numero quattro in classifica per undici settimane. Se avete meno di quarant'anni sono solo Vera.
@sfx tuono
@bg candele
@fx candele
@music stop
E poi salta la luce.
Tutta. Il frigorifero tace. Il neon dell'insegna fa un ultimo crepitio. E per la prima volta da quando lavori qui, da dietro la tenda non arriva nessuna musichetta.
Silenzio. Un silenzio enorme, come una stanza che non sapevi di avere.
@show luca center
LUCA: Le candele sono nel cassetto sotto la cassa. Mio padre le teneva per il capodanno cinese.
Accendi le candele, rosse, con i caratteri dorati. Il bar diventa una chiesa piccola e storta. Nessuno se ne va.
ROCCO: Allora. Adesso che non mi vedete in faccia, ve la racconto quella vera.
ROCCO: Mio figlio Gennaro ha ventidue anni. Non ride. Mai. Da piccolo neanche col solletico. Io ho fatto il comico per trent'anni per far ridere lui. Non ci sono mai riuscito. Ho fatto ridere tutta Napoli, tranne lui.
ROCCO: L'anno scorso mi ha scritto. "Papà, io non rido perché tu ridi per tutti e due." È la battuta più bella che ho mai sentito. Non fa ridere per niente.
~ trust.rocco += 1
@memory rocco "Gennaro non ride mai. 'Io non rido perché tu ridi per tutti e due.'"
* {trust.mirella >= 1} [Signora Mirella. Canti qualcosa, per noi. Al buio.]
  -> n4_casta
* [Non chiedi niente. Ascolti il silenzio.]
  Nel silenzio, Vera tira fuori dalla custodia una chitarra acustica con una corda sola che ancora suona. La pizzica piano, sempre la stessa nota.
  VERA: Questa è "Ruggine". La versione che nessuno ha mai sentito. Senza Tommi.
  VERA: Tommi suonava la batteria. È morto nel 2005, in autostrada, tornando da un concerto a Rimini. Il disco successivo non l'abbiamo mai fatto. Non si fa un disco senza il cuore che batte.
  ~ trust.vera += 1
  @memory vera "Tommi suonava la batteria. Senza di lui il secondo disco non è mai esistito."
  -> n4_dopo

=== n4_casta
Mirella si alza. Si toglie il cappello. Al buio, con le candele sotto il viso, sembra molto più giovane e molto più vecchia.
MIRELLA: Non canto da undici anni. Il medico dice che le corde vocali sono "affaticate". Io dico che sono offese.
@music casta
MIRELLA: Casta diva, che inargenti queste sacre antiche piante...
La voce esce sottile, poi si allarga. Non è più quella di una volta. È meglio: è quella di adesso.
Sulla nota alta si spezza. Tutti trattengono il respiro.
Lei continua lo stesso, rotta, fino in fondo.
@music stop
Silenzio. Poi Rocco applaude. Poi Luca. Poi tutti. Vera batte il pugno sul tavolo come a un concerto rock.
MIRELLA: Devo dirvi una cosa. Io Norma alla Scala non l'ho mai cantata.
MIRELLA: Ero la sostituta. Undici anni da sostituta. Ogni sera mi preparavo, mi truccavo, mi mettevo il costume in camerino. E ogni sera la prima donna stava benissimo.
MIRELLA: Questa sera è la prima volta. La prima volta, a settant'anni, in un bar di via Padova, senza luce.
MIRELLA: È stata la serata migliore della mia carriera.
~ trust.mirella += 2; mirella_cantato; trust.luca += 1
@memory mirella "Undici anni da sostituta. La prima Casta diva l'ha cantata al buio, al Bar Blu."
@postcard casta-diva "Casta diva, al buio"
-> n4_dopo

=== n4_dopo
@show luca center
Luca è appoggiato al bancone, con una candela in mano. Guarda la tenda: dietro, le tre sorelle sono buie e mute, tre bare in piedi.
LUCA: Senti?
LUCA: Senza le sorelle si sente la gente.
* [Si potrebbe sempre fare così. Il bar, la gente, e basta.]
  ~ trust.luca += 1; seme_spegnere
  LUCA: Con le candele e la gente non si paga l'affitto, Blu.
  LUCA: Però è bello. Dio, quanto è bello. Me l'ero scordato.
* [Domani torna la luce.]
  LUCA: Sì. Domani torna tutto.
@sfx jingle
@bg notte
@fx none
@music notte
Alle undici e cinquantadue la corrente ritorna. Il frigorifero riparte con un brontolio. L'insegna si riaccende: BAR BL. BAR BLU.
E da dietro la tenda, all'improvviso, la musichetta. Allegra. Identica. Come se niente fosse successo. Come se la gente non avesse mai parlato.
Qualcuno, nell'angolo, ride piano. Non è una bella risata.
-> n4_dario

=== n4_dario
@show dario right
@show vera left
Prima di chiudere entra un ragazzo magro, con il cappotto pieno di scontrini piegati. Si siede vicino a Vera come uno che ha già litigato con lei e ha intenzione di rifarlo.
DARIO: Dario. Poeta dei Navigli. Che è come dire poeta e basta, ma con l'umidità.
VERA: Scrive le poesie sugli scontrini. Dice che così almeno hanno un valore.
DARIO: Ne ho scritta una stasera, al buio, mentre cantava la signora. Gliela leggo?
* [Leggila.]
  ~ trust.dario += 2
  DARIO: "Al Bar Blu la luce è saltata / e per un'ora nessuno ha perso niente. / Le macchine stavano zitte / come cani che hanno capito."
  VERA: Non fa schifo.
  DARIO: Vera ha detto che non fa schifo. È la recensione più bella della mia vita.
  ~ trust.vera += 1
  @memory dario "Al Bar Blu la luce è saltata, e per un'ora nessuno ha perso niente."
* [Domani, Dario. È tardi.]
  DARIO: Domani la poesia scade. Gli scontrini sbiadiscono, lo sai? Tra un anno sarà un foglio bianco.
  DARIO: Forse è meglio così.
@hide all
-> n4_hub

=== n4_hub
* {mance >= 1} [Lascia un caffè sospeso (1 €).]
  ~ mance -= 1; sospesi += 1
  Un altro SOSPESO. Le previsioni dicono neve per domani. Non lo dici a nessuno, ma è per questo che lo lasci.
  -> n4_hub
* {mance >= 1} [Dietro la tenda. Hanno ripreso a cantare.]
  @bg saletta
  @saletta
  @bg notte
  -> n4_hub
* [Spegni le candele, una a una.]
  Spegni le candele soffiando piano. Il fumo sale dritto, come se qualcuno lo tirasse su con un filo.
  -> n5_inizio
`;
