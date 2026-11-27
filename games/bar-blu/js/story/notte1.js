/* Prologo e Notte 1 — Lunedì. Il primo caffè. */
export default String.raw`
=== start
~ mance = 0; sospesi = 0; spins = 0; colletta = 0
@title "Bar Blu" "Sette notti in via Padova"
@bg esterno-notte
@fx pioggia
@music pioggia
Milano, fine novembre. Piove da tre giorni, come se la città avesse deciso di lavarsi da sola.
All'angolo tra via Padova e una via di cui nessuno ricorda il nome c'è un bar con l'insegna al neon. Dice BAR BLU, ma la U sfarfalla, e per metà del tempo dice BAR BL.
Sulla vetrina c'è un cartello scritto a mano in due alfabeti: CERCASI BARISTA. 招聘.
Entri perché piove. Resti per un'altra ragione, ma ancora non lo sai.
@sfx porta
@bg notte
@fx none
@music sera
@show luca center
Dietro il bancone un uomo sui trentacinque asciuga un bicchiere già asciutto. Ha le maniche arrotolate e due macchie di vernice blu sul polso.
LUCA: Siamo chiusi. Però se sei qui per il cartello, siamo aperti.
* [Sono qui per il cartello.]
  LUCA: Bene. Nessuno è mai qui per il cartello.
* [Cercavo solo un posto asciutto.]
  LUCA: Allora sei qui per il cartello. Lo dicono tutti, all'inizio, che cercavano un posto asciutto.
LUCA: Luca. Luca Zheng. Il bar era di mio padre. Prima ancora era di un certo sciur Brambilla, che l'ha dipinto di blu perché la vernice era in saldo.
LUCA: Una domanda sola, poi il caffè te lo faccio io. Perché Milano?
* [Ho seppellito qualcuno. Non volevo più vedere la sua città.]
  ~ origin = 'lutto'
  Luca annuisce piano, come chi riconosce una lingua straniera che parla anche lui.
  LUCA: Qui di morti ne abbiamo tanti. Stanno seduti ai tavoli e ordinano.
* [Avevo una cosa mia. L'ho persa. Tutta.]
  ~ origin = 'fallimento'
  LUCA: Tutta tutta, o tutta come si dice?
  LUCA: Lascia stare. Si vede dalle scarpe. Sono belle, ma hanno camminato troppo.
* [Sono scappato. Non chiedermi da cosa.]
  ~ origin = 'fuga'
  LUCA: Non te lo chiedo. In questo bar nessuno chiede. È l'unica regola che funziona.
@sfx tazzina
Ti mette davanti una tazzina. Il caffè è fortissimo e un po' bruciato, come quello che si beve alle quattro di mattina negli ospedali.
LUCA: Domani alle sei e mezza. Il nome non me lo dire: qui ti chiamiamo Blu, come il bar, finché non te ne meriti uno.
Ti mette in mano una banconota da cinque euro, piegata in quattro.
LUCA: Anticipo. Il primo giorno si paga prima, così torni.
~ mance = 5
LUCA: Tre regole. Uno: il caffè non si sbaglia. Due: nessuno esce di qui più ubriaco di come è entrato, se puoi evitarlo.
Luca indica con il mento una tenda di velluto rosso, in fondo alla sala. Da dietro arriva una musichetta allegra, sempre la stessa, che finisce e ricomincia.
LUCA: Tre. La tenda non è affar tuo.
~ trust.luca = 1
-> n1_mattina

=== n1_mattina
@title "Notte 1 · Lunedì" "Il primo caffè"
@bg mattina
@fx fumo
@music giorno
@hide all
Le sei e trentotto. Il quartiere si sveglia un pezzo alla volta: una serranda, un tram, un cane che litiga con la propria ombra.
@sfx porta
@show assunta center
Entra per prima una donna con un cappotto viola e una borsa della spesa piena di mandarini.
ASSUNTA: E tu chi sei? Ah, il cartello. Finalmente. Luca da solo stava diventando trasparente.
ASSUNTA: Io sono Assunta. Lavoro alla merceria di fronte da quarantun anni e so tutto di tutti. Non vi piace, ma funziona.
ASSUNTA: Fammi il solito, va'. Vediamo come te la cavi.
+ [☕ Caffè]
  ~ trust.assunta += 1; mance += 1
  @sfx tazzina
  ASSUNTA: Ristretto, in tazza calda. Come lo sapevi?
  ASSUNTA: Ah, non lo sapevi. Hai tirato a indovinare. Mi piaci: a Milano chi tira a indovinare è già mezzo milanese.
+ [🍵 Camomilla]
  ASSUNTA: Alle sei e mezza? Mi vuoi rimandare a letto? Caffè, tesoro. Il caffè.
  @sfx tazzina
+ [🥃 Grappa]
  ASSUNTA: Madonna santa. Se mi vede il prete. Dammi un caffè, e la grappa mettila nel caffè di Luca, che ne ha bisogno.
  ~ trust.luca += 1
  @sfx tazzina
Fuori dalla vetrina un uomo anziano con un cappotto troppo grande si è fermato. Guarda dentro, ma non entra.
ASSUNTA: Quello è Ugo. Sor Ugo, perché è romano. Non entra se non ha i soldi per pagare. Ha la dignità, che è la cosa più cara che ci sia.
ASSUNTA: Una volta a Napoli si usava il caffè sospeso. Chi poteva, pagava due caffè e ne beveva uno. L'altro restava lì, per chi sarebbe venuto dopo.
* [Fallo entrare. Il primo caffè lo offro io.]
  @sfx porta
  @show ugo left
  Esci sotto la pioggia fine. Ugo ti guarda come si guarda una moneta trovata per terra: con sospetto, poi con tenerezza.
  UGO: Offre la casa o offri tu?
  * [Offro io.]
    ~ trust.ugo += 2; mance -= 1
    UGO: Allora va bene. Dalla casa non accetto. Le case non mi hanno mai trattato bene.
  * [Offre la casa.]
    ~ trust.ugo += 1
    UGO: Hm. Va bene. Ma solo perché piove, e la pioggia rende tutti un po' parenti.
  @sfx tazzina
  Beve in piedi, con il cappotto addosso, tenendo la tazzina con due mani come una cosa viva.
  UGO: Facevo il tipografo. Quarantadue anni di piombo. So com'è fatta ogni lettera dell'alfabeto, dal di dentro.
  UGO: Grazie, Blu. Te lo dico al rovescio, come si compongono i caratteri: eizarg.
  @hide ugo
  @memory ugo "Faceva il tipografo. Quarantadue anni di piombo: conosce ogni lettera dal di dentro."
* [Lascia stare. Non è affar mio.]
  ASSUNTA: Già. Non è mai affare di nessuno. È per questo che Milano è così ordinata.
  Ugo resta un altro minuto, poi se ne va sotto la pioggia, con le mani in tasca.
@hide assunta
-> n1_giorno

=== n1_giorno
@bg pomeriggio
@fx none
Verso mezzogiorno arriva la gente che lavora: muratori, infermiere del turno di notte, ragazzi con il casco ancora in testa.
@rush 3
LUCA: Non male. Hai le mani di qualcuno che ha già lavorato. E gli occhi di qualcuno che non voleva più farlo.
* [Grazie. Credo.]
  LUCA: Era un complimento. Da noi i complimenti si fanno così, in diagonale.
* [Tu invece hai le mani sporche di blu.]
  ~ trust.luca += 1
  Luca si guarda il polso, sorpreso, e si sfrega la vernice con il pollice.
  LUCA: Il muro dietro la macchina del caffè. Si scrosta. Lo ridipingo di notte.
  LUCA: Ogni tanto.
  Lo dice in un modo che ti fa capire che non sono solo i muri.
-> n1_sera

=== n1_sera
@bg sera
@music sera
@sfx porta
@show baldini right
Alle sette entra un uomo con un cappotto di cammello consumato ai gomiti e un libro sotto il braccio: Leopardi, edizione economica, sottolineato fino a sembrare un altro libro.
BALDINI: Buonasera, giovane. Ettore Baldini, professore. Ex professore. Sono passato al lato più onesto della filosofia: quello che si beve.
BALDINI: Una grappa, se il dottore non ha niente in contrario. Il dottore sono io, e non ho niente in contrario.
+ [🥃 Grappa]
  ~ trust.baldini += 1; baldini_alcol += 1; mance += 2
  @sfx tazzina
  BALDINI: "Ad ogni costo, il tempo passa." No, non è Leopardi. L'ho scritta io, sul tovagliolo. Non tutti i filosofi muoiono famosi.
+ [☕ Caffè]
  ~ baldini_caffe += 1; mance += 1
  @sfx tazzina
  BALDINI: Mi ha portato un caffè. Ho ordinato una grappa e lei mi ha portato un caffè.
  Lo guarda a lungo. Poi lo beve, tutto, senza zucchero.
  BALDINI: Lei mi offende con la sua gentilezza. Non lo rifaccia. Oppure lo rifaccia, ma non me lo dica.
  ~ trust.baldini += 1
+ [💧 Acqua]
  BALDINI: L'acqua. Talete diceva che tutto è acqua. Talete non ha mai passato un novembre a Milano.
  @sfx tazzina
  ~ baldini_alcol += 1
  Luca, senza dire niente, gli versa la grappa.
@sfx porta
@show gigi left
Alle otto e un quarto entra un uomo in giacca e cravatta. La giacca è buona, ma ha dormito su una sedia. La cravatta è annodata con cura, come una cosa che si fa per non pensare.
GIGI: Buonasera a tutti. Luca, il solito. Faccia nuova, eh? Luigi Ferrante. Gigi. Ex direttore commerciale, oggi consulente indipendente.
LUCA (piano): Gigi prende un amaro. Poi va di là.
+ [🍂 Amaro]
  ~ mance += 2
  @sfx tazzina
  Gigi beve l'amaro in un sorso. Lascia due euro di mancia, piegati, come si lascia un biglietto da visita.
+ [☕ Caffè]
  ~ trust.gigi += 1
  @sfx tazzina
  GIGI: Un caffè. Va bene, un caffè. Hai ragione tu: stasera ci vuole la testa lucida.
  GIGI: Le macchine sentono quando hai la testa lucida. Te lo giuro.
GIGI: Bene. Vado a vedere come stanno le signore.
@hide gigi
@sfx jingle
Scosta la tenda rossa ed entra. Per un istante vedi tre luci colorate, come un altare. Poi la tenda ricade, e torna la musichetta: allegra, identica, infinita.
* [Luca, cosa c'è dietro la tenda?]
  LUCA: Le tre sorelle.
  LUCA: Pagano l'affitto. Pagano la luce. Pagavano le medicine di mio padre.
  LUCA: Non parlarmene più, Blu. Te lo chiedo per favore, che è peggio di un ordine.
  ~ chiesto_tenda
* [Non dici niente. Lavi le tazzine.]
  ~ trust.luca += 1
  Luca ti guarda lavare le tazzine. Dopo un po' te ne passa una che hai già lavato, e tu la rilavi lo stesso. È una specie di conversazione.
BALDINI: Sa cosa diceva Seneca, giovane? Che non è che abbiamo poco tempo. È che ne perdiamo molto.
BALDINI: Lì dietro il tempo si perde a monetine da un euro. È più democratico.
@hide baldini
-> n1_chiusura

=== n1_chiusura
@bg notte
@music notte
@hide all
L'una e venti. Gigi è uscito dalla tenda alle dodici e cinquanta, con il nodo della cravatta allentato e lo sguardo di chi ha visto una cosa che non vuole raccontare.
@show luca center
LUCA: Vai pure. Io conto la cassa.
Non conta la cassa. Conta le monete delle tre sorelle, una per una, su un tovagliolo, come si contano i grani di un rosario.
@postcard primo-caffe "Il primo caffè"
-> n1_hub

=== n1_hub
* {mance >= 1} [Lascia un caffè sospeso sul bancone (1 €).]
  ~ mance -= 1; sospesi += 1
  Scrivi su uno scontrino: SOSPESO. Lo infili sotto la zuccheriera. Luca lo vede, e non dice niente, che è il suo modo di dire grazie.
  -> n1_hub
* {!chiesto_tenda} [Chiedi a Luca se la musichetta smette mai.]
  ~ chiesto_tenda
  LUCA: Smette quando stacchi la spina. Mio padre la sentiva anche nel sonno.
  LUCA: Buonanotte, Blu.
  -> n1_hub
* [Spegni le luci ed esci nella pioggia.]
  @sfx porta
  Fuori, la U dell'insegna sfarfalla. BAR BL. BAR BLU. BAR BL.
  Sembra che il bar non riesca a decidere se esistere.
  -> n2_inizio
`;
