/* Notte 5 — Venerdì. La neve. */
export default String.raw`
=== n5_inizio
@title "Notte 5 · Venerdì" "La neve"
@bg esterno-notte
@fx neve
@music neve
@hide all
Venerdì nevica. A Milano non nevica quasi mai, e quando succede la città diventa silenziosa e un po' stupida, come una persona che si sveglia in un letto che non è il suo.
I tram vanno piano. Le macchine parcheggiate diventano panettoni. Sotto i portici della stazione qualcuno ha acceso un fuoco in un bidone.
@bg mattina
@fx fumo
@music giorno
@show assunta left
ASSUNTA: Meno sei, stanotte. Hanno aperto il dormitorio di viale Ortles, ma ci vanno in pochi. Dicono che lì ti rubano le scarpe.
ASSUNTA: Hai visto Ugo?
* {sospesi >= 1} [Gli ho lasciato dei caffè sospesi. Spero che li usi.]
  ~ trust.assunta += 1
  ASSUNTA: Sei tu, allora. Me lo immaginavo. Luca non ci arriva, a queste cose: lui i soldi li conta, non li lascia.
  ASSUNTA: Brava gente. In questo quartiere ce n'è più di quanta se ne vede. Sta tutta dietro le tende.
* [Non ancora. Lo cerco dopo.]
  ASSUNTA: Cercalo. Con questo freddo le persone diventano trasparenti.
@hide assunta
{sospesi >= 3} -> n5_ugo_dentro
{sospesi < 3} -> n5_ugo_fuori

=== n5_ugo_dentro
@sfx porta
@show ugo right
Ugo entra da solo. Batte i piedi sullo zerbino, si toglie il berretto, e va dritto alla zuccheriera.
UGO: C'è un sospeso per Ugo?
Sotto la zuccheriera ce ne sono {sospesi}. Lui li conta senza toccarli, come si contano le stelle.
UGO: Qualcuno li lascia tutte le sere. Non so chi. Non lo voglio sapere. Se lo sapessi dovrei dire grazie, e io sono un uomo che dice grazie molto male.
@sfx tazzina
~ trust.ugo += 1
-> n5_ugo_parla

=== n5_ugo_fuori
Fuori, sotto la pensilina del tram, c'è Ugo. Ha la neve sulle spalle e non se la scuote. Guarda il bar.
* [Esci a prenderlo.]
  @sfx porta
  @show ugo right
  UGO: Non ho i soldi, Blu.
  * {mance >= 1} [Paghi tu un caffè (1 €).]
    ~ mance -= 1; trust.ugo += 1
    UGO: Va bene. Ma lo scrivo. Ho un quaderno dove scrivo i debiti. È lunghissimo. È il libro più lungo che ho.
  * [Offre la casa.]
    UGO: La casa. Va bene. Stasera la casa la accetto. Stasera accetto anche le case.
  @sfx tazzina
  -> n5_ugo_parla
* [Lo saluti dalla vetrina.]
  Ugo alza la mano. Poi la rimette in tasca. La neve continua a posarsi su di lui come se fosse un monumento.
  -> n5_gigi

=== n5_ugo_parla
UGO: Lo sai cosa facevo, in tipografia? Le parole al rovescio. Ogni lettera si compone allo specchio, così quando la stampi viene dritta.
UGO: Quarantadue anni a leggere al rovescio. Ho imparato che le parole sono più belle viste da dietro.
- [Che parola ti manca?]
  UGO: Casa.
  UGO: L'ho persa nel 2011. Prima la tipografia, che ha chiuso perché adesso si stampa col computer. Poi la pensione che non bastava. Poi la casa, che era in affitto da un signore che voleva farci un bed and breakfast. Adesso è un bed and breakfast. Si chiama "Home Sweet Home". Lo giuro.
  UGO: Ogni tanto ci passo davanti. C'è scritto Home in inglese. Al rovescio fa EMOH. Sembra un lamento.
  ~ trust.ugo += 1
  @memory ugo "Ha perso la casa nel 2011. Ora è un bed and breakfast che si chiama Home Sweet Home."
- [Dove dormi stanotte, Ugo?]
  UGO: Sotto i portici della Centrale. C'è un bidone col fuoco. C'è Mustafà che racconta di Casablanca. Si sta bene. Si sta.
  UGO: Non ti preoccupare. Io e il freddo ci conosciamo da tanto. Lui è un cane che abbaia ma non morde.
  ~ ugo_dove
UGO: Grazie per il caffè, Blu. Eizarg.
@hide ugo
-> n5_gigi

=== n5_gigi
@bg sera
@fx none
@music sera
@sfx porta
@show gigi center
Gigi arriva alle otto. Ha la neve nei capelli e una busta gialla stretta al petto, come un neonato.
{gigi_truffato} GIGI: La Contessa è sparita. Il numero non risponde. Il notaio sardo non esiste. Mi restano mille euro. Mille.
{!gigi_truffato} GIGI: Tremila euro. Lo studio di Giulia. Li porto sempre con me, sai? A casa non mi fido. A casa ci sono io.
GIGI: Stasera me li raddoppio. Me lo sento. Stasera c'è la neve, e quando nevica le macchine sono più generose. Lo dicono tutti.
GIGI: Solo stasera. Poi smetto. Poi glielo dico, a Giulia. Con i soldi in mano, e il nome sulla targa.
Appoggia il telefono sul bancone, accanto alla tazzina. Si toglie la sciarpa.
* {trust.gigi >= 3} [Gigi. Dammi la busta. Te la tengo io fino a marzo.]
  Gigi ti guarda come se gli avessi chiesto un rene.
  GIGI: Perché dovrei?
  * [Perché è di Giulia. Non è tua.]
    Le mani di Gigi stringono la busta. Poi, piano, la mollano.
    GIGI: Hai ragione. Hai ragione, Dio santo. È di Giulia.
    Te la dà. Pesa pochissimo. Tutta una vita e pesa pochissimo.
    ~ busta_salva; trust.gigi += 1
    GIGI: Vado di là lo stesso. Con gli spiccioli. Solo per salutarle.
    @sfx jingle
    @hide gigi
    -> n5_telefono
  * [Perché stasera non è diverso dalle altre sere.]
    GIGI: Ti sbagli. Stasera nevica.
    @sfx jingle
    @hide gigi
    -> n5_telefono
* [Gigi, aspetta. Prendi almeno un caffè, prima.]
  @sfx tazzina
  GIGI: Il caffè dopo. Il caffè è per festeggiare.
  @sfx jingle
  @hide gigi
  -> n5_telefono
* [Non dici niente.]
  @sfx jingle
  @hide gigi
  -> n5_telefono

=== n5_telefono
Il telefono di Gigi è rimasto sul bancone. Lo schermo si accende da solo: una notifica di una banca. Lo sfondo è una foto di una bambina con un caschetto biondo, che tiene in mano una casa di cartone con le finestre grandissime.
* {giulia_nome} [Prendi il telefono. Cerchi "Giulia".]
  -> n5_giulia
* [Lo lasci dov'è. Non è affar tuo.]
  -> n5_crollo

=== n5_giulia
Il telefono non ha il codice. Gigi non ha niente da nascondere, o niente da proteggere, che a volte è la stessa cosa.
In rubrica c'è "Giulia ❤️". L'ultimo messaggio è di tre anni fa, ed è suo: "Sono fiero di te. Papà." Due spunte grigie. Nessuna risposta.
@sfx telefono
Chiami. Squilla sei volte.
GIULIA: Papà? Papà, sono le nove di sera, cosa...
GIULIA: Chi è? Chi parla?
* [Lavoro al bar dove viene tuo padre. Sta per giocarsi i soldi del tuo studio.]
  GIULIA: Quale studio?
  GIULIA: Non c'è nessuno studio. Mio padre mi ha già promesso tante cose. Una casa al mare. Il viaggio in Giappone. Mia madre in un altro modo. E poi entrava in un bar, come quello dove stai tu.
  GIULIA: Non chiamarmi più. Per favore. Per me mio padre è morto nel 2021.
  * {gigi_restato} [Ti ha letto tutto Pinocchio, una notte che avevi la febbre.] -> n5_giulia_si
  * [Va bene. Scusa.]
    ~ giulia_no
    Riattacca. Il telefono torna sullo sfondo della bambina con la casa di cartone.
    -> n5_crollo
* [Tuo padre parla di te tutte le sere. Ha la tua foto nel portafoglio.]
  GIULIA: Anche io avevo la sua foto nel portafoglio. Poi l'ho tolta, perché ogni volta che pagavo qualcosa la vedevo.
  GIULIA: Perché mi chiami tu e non lui?
  * [Perché lui non ha il coraggio. E tu sei l'unica cosa che lo può fermare.]
    -> n5_giulia_si
  * [Non lo so. Scusa.]
    ~ giulia_no
    GIULIA: Neanch'io lo so. Buonanotte.
    -> n5_crollo

=== n5_giulia_si
Silenzio, dall'altra parte. Un silenzio di tre anni.
GIULIA: Pinocchio. La balena. Lui faceva la voce di Geppetto dentro la balena, con le mani a coppa davanti alla bocca, per fare l'eco.
GIULIA: Dove siete? Qual è il bar?
GIULIA: Domani. Vengo domani. Stasera no: stasera non ce la faccio. Non dirglielo. Se glielo dici, domani non c'è più.
~ giulia_viene; trust.gigi += 1
@memory gigi "Leggeva Pinocchio a Giulia con la voce di Geppetto dentro la balena, con le mani a coppa per fare l'eco."
-> n5_crollo

=== n5_crollo
@bg notte
@music macchina
Alle undici e un quarto, da dietro la tenda, smette la musichetta. Poi un rumore di vetro. Poi un urlo che non è un urlo: è il suono che fa un uomo quando si accorge che è vero.
@sfx vetro
@bg saletta
@show luca left
@show gigi center
Gigi è in piedi davanti a Prosperità. Ha in mano uno sgabello. Lo schermo della macchina è una ragnatela di crepe, e dietro le crepe le luci continuano a girare. La macchina continua a dire, con la sua voce dolcissima: Ciao! Gioca con me!
{busta_salva} GIGI: Quaranta euro. Ho perso quaranta euro e ho rotto una macchina da diecimila. Che uomo. Che uomo sono.
{!busta_salva} GIGI: Tutto. Tutto. Alle dieci avevo vinto quattrocento euro. Alle dieci e mezza ne avevo tremilaquattrocento. Alle undici, zero. È tutto lì dentro. È di Giulia, ed è tutto lì dentro.
{!busta_salva} ~ gigi_rovinato
Luca gli toglie lo sgabello dalle mani. Non lo spinge, non urla. Lo abbraccia, da dietro, come si tiene qualcuno che sta per cadere in un fiume.
LUCA: Basta. Basta, Gigi. Lo so. Lo so.
Gigi si affloscia contro di lui e piange. Piange come piangono gli uomini di quella generazione, che non hanno mai imparato: a scatti, con vergogna, con la bocca chiusa.
MACCHINA: Ciao! Gioca con me! La fortuna è dietro l'angolo!
* [Stacchi la spina di Prosperità.]
  ~ trust.luca += 1; staccata_spina
  Ti inginocchi dietro la macchina e tiri il cavo. Prosperità si spegne con un sospiro elettrico, e le altre due sorelle continuano a cantare, più forte, come per compensare.
  LUCA (senza voltarsi): Grazie.
* [Non ti muovi. Hai ancora lo strofinaccio in mano.]
  Non ti muovi. A volte non c'è niente da fare, se non guardare bene, per ricordarsi dopo.
@hide gigi
{giulia_viene} Mentre Luca accompagna Gigi a casa, ti accorgi che stai sorridendo. Non è il momento. Ma domani viene Giulia, e tu sei l'unica persona al mondo che lo sa.
-> n5_ugo_notte

=== n5_ugo_notte
@bg esterno-notte
@fx neve
@music neve
@hide all
L'una e mezza. Chiudi la serranda. La neve è alta fino alla caviglia. Il termometro della farmacia di fronte dice meno sette.
@show ugo center
Sotto la pensilina c'è Ugo. Ha la barba bianca di neve. Trema, ma ti sorride.
UGO: Sto andando ai portici. Volevo solo salutare il bar. Gli voglio bene, a questo bar. È l'unico che mi guarda.
-> n5_ugo_scelta

=== n5_ugo_scelta
- [Chiedi a Luca la chiave della saletta. Ugo può dormire lì, al caldo.]
  @show luca left
  {trust.luca >= 3} -> n5_ugo_chiave
  LUCA: Lì dentro? Con le sorelle?
  LUCA: Non posso, Blu. Se succede qualcosa, se arriva un controllo, mi chiudono il bar. Non posso. Mi dispiace. Mi dispiace davvero.
  Ha gli occhi di uno che si odia per quello che ha appena detto. Ma l'ha detto.
  @hide luca
  -> n5_ugo_scelta
- [Ugo, ti accompagno al dormitorio di viale Ortles.]
  {trust.ugo >= 4} -> n5_ugo_dormitorio
  UGO: Ai dormitori ti rubano le scarpe, Blu. E ti chiamano per numero. Io mi chiamo Ugo. Ugo Testa. Non sono un numero.
  UGO: Grazie lo stesso. Davvero.
  -> n5_ugo_scelta
* [Gli dai la tua sciarpa e tutti i soldi che hai.]
  ~ mance = 0; ugo_sciarpa
  UGO: Ma che fai. Ma che fai, Blu.
  Si avvolge la sciarpa intorno al collo due volte. Ti stringe la mano, con tutte e due le mani.
  UGO: A domani. Domani ti porto un regalo. Una parola. Ne ho una bellissima, per te.
  Lo guardi andare via nella neve, verso la stazione, finché diventa un punto, e poi neanche quello.
  ~ ugo_morto
  -> n5_fine
* [Buonanotte, Ugo. Copriti bene.]
  UGO: Sempre. Buonanotte, Blu.
  Lo guardi andare via nella neve, verso la stazione, finché diventa un punto, e poi neanche quello.
  ~ ugo_morto
  -> n5_fine

=== n5_ugo_chiave
LUCA: Va bene.
LUCA: Va bene. Ugo, vieni. C'è la stufetta. C'è un divano, è brutto ma è un divano.
Luca riapre la serranda. Ugo entra, guarda la saletta, le tre sorelle che lampeggiano.
UGO: Dormire con tre signore. Alla mia età. Che scandalo.
LUCA: Ti stacco la musica. Almeno stanotte.
Luca stacca tutte e tre le spine. La saletta diventa buia e calda e silenziosa. Ugo si stende sul divano con il cappotto e la sciarpa, e si addormenta in tre respiri.
~ ugo_salvo; trust.luca += 1; trust.ugo += 1; sorelle_spente_una_notte
@postcard ugo-salvo "Ugo dorme con le tre sorelle"
-> n5_fine

=== n5_ugo_dormitorio
UGO: Con te? Va bene. Con te ci vengo. Ma se mi rubano le scarpe, me le ricompri tu.
Camminate nella neve per venti minuti, a braccetto, perché lui scivola e tu pure. Parla tutto il tempo: delle lettere, del piombo, di una donna di Testaccio che si chiamava Iole.
Al dormitorio una volontaria con il cappello di Babbo Natale scrive il suo nome sul registro. Non il numero: il nome. Ugo lo controlla, lettera per lettera.
UGO: Giusto. Testa con due T. Brava.
~ ugo_salvo; trust.ugo += 1
@postcard ugo-salvo "Ugo Testa, con due T"
-> n5_fine

=== n5_fine
@bg esterno-notte
@fx neve
Torni a casa a piedi. La neve copre le impronte quasi subito, come se la città volesse cancellare chi è passato.
-> n6_inizio
`;
