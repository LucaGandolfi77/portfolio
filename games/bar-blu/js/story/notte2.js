/* Notte 2 — Martedì. La pioggia. */
export default String.raw`
=== n2_inizio
@title "Notte 2 · Martedì" "Due caffè"
@bg mattina
@fx pioggia
@music pioggia
@hide all
Martedì piove in diagonale. La gente entra scuotendo gli ombrelli come cani bagnati, e il pavimento diventa una mappa di impronte che non portano da nessuna parte.
{sospesi >= 1} Lo scontrino del sospeso non c'è più. Sotto la zuccheriera, al suo posto, c'è un pezzetto di carta con una sola parola, scritta in stampatello perfetto: GRAZIE. Le lettere sono dritte come se fossero di piombo.
{sospesi >= 1} ~ trust.ugo += 1
@show assunta left
ASSUNTA: Hai visto il cielo? Il cielo di Milano a novembre è un soffitto. Ci abiti sotto, non lo guardi.
ASSUNTA: Ah, senti. Oggi alle quattro viene Elvira. Non chiederle niente. Fai quello che chiede, e basta.
@hide assunta
@rush 2
-> n2_elvira

=== n2_elvira
@bg pomeriggio
@sfx porta
@show elvira center
Alle quattro in punto entra una signora molto piccola, con un impermeabile color tortora e un fermaglio di tartaruga nei capelli bianchi. Si siede al tavolino vicino alla finestra. Sempre quello, capisci subito: il velluto della sedia ha preso la sua forma.
ELVIRA: Due caffè, per cortesia. Uno normale e uno macchiato freddo, con poco latte. Grazie.
+ [☕☕ Due caffè, uno macchiato freddo]
  ~ trust.elvira += 1; mance += 2
  @sfx tazzina
  ELVIRA: Perfetto. Proprio con poco latte. Lei ha una memoria gentile.
+ [☕ Un caffè solo]
  ELVIRA: Due, avevo detto. Ma non fa niente. Succede. Succede a tutti di dimenticarsi che si è in due.
  Ti alzi e porti anche il secondo. Lei sorride appena, senza guardarti.
  @sfx tazzina
Beve il suo caffè normale. Il macchiato freddo resta davanti alla sedia vuota, dall'altra parte del tavolino. Si raffredda ancora di più. Nessuno lo tocca.
- [Le chiedi per chi è il secondo caffè.]
  ELVIRA: Per Teresa. Era il suo posto, quello. Quarantun anni allo stesso tavolino.
  ELVIRA: Il macchiato freddo d'estate e d'inverno. Diceva che il caffè caldo la faceva arrabbiare.
  ~ elvira_teresa
- [Non chiedi niente. Le porti un bicchiere d'acqua.]
  ~ trust.elvira += 1
  @sfx tazzina
  ELVIRA: Grazie. Lei è una persona che sa stare zitta. Raro, alla sua età. Raro alla mia.
ELVIRA: Le lascio la tazzina sul tavolo, se non le dispiace. La porta via dopo. Quando sono uscita.
@hide elvira
Quando se ne va, sul bordo della tazzina del macchiato non c'è nessun segno di labbra. Ma tu, per un attimo, lo vedi lo stesso: un mezzo cerchio di rossetto rosa, come una piccola luna.
-> n2_anna

=== n2_anna
@bg sera
@music sera
@sfx porta
@show anna right
Entra una ragazza fradicia, con una cartella da disegno sotto il cappotto per salvarla dalla pioggia. Ha diciannove anni, gli occhiali appannati, e le dita nere di carboncino.
ANNA: Ciao! Sei il Blu? Luca mi ha scritto di te. Io sono Anna, studio a Brera. Cioè: studio a Brera, e disegno qui. Qui è meglio.
ANNA: Posso disegnarti? Non dire di no, l'ho già cominciato dalla vetrina.
Ti mostra il foglio. Sei tu, dietro il bancone, con lo strofinaccio sulla spalla. Ti ha disegnato con più stanchezza di quanta ne senti. Poi ti guardi nello specchio dietro le bottiglie, e capisci che ha ragione lei.
{origin == 'lutto'} ANNA: Hai la faccia di chi aspetta che squilli un telefono che non squillerà più. Scusa. Lo dico sempre, quello che vedo.
{origin == 'fallimento'} ANNA: Hai la faccia di chi rifà i conti la notte. Scusa. Lo dico sempre, quello che vedo.
{origin == 'fuga'} ANNA: Hai la faccia di chi si gira quando si apre la porta. Scusa. Lo dico sempre, quello che vedo.
* [Hai ragione. E mi va bene che si veda.]
  ~ trust.anna += 2
  ANNA: Allora lo tengo. Lo appendo da qualche parte. Un giorno questo posto sarà pieno di facce che si vedono.
* [Disegna i clienti, non me.]
  ~ trust.anna += 1
  ANNA: Va bene, va bene. Ma ti avviso: chi sta dietro il bancone fa parte del quadro anche se non vuole.
ANNA: Facciamo un patto. Ogni volta che succede una cosa che vale, io la disegno, e tu la tieni. Sono cartoline. Non si spediscono: si tengono.
@postcard due-caffe "Due caffè per Teresa"
@hide anna
-> n2_voce

=== n2_voce
@sfx porta
@show mirella left
@show rocco right
Entrano insieme due persone che non potrebbero essere più diverse. Lei: settant'anni, cappello a falda larga, un rossetto color ciliegia che ha visto teatri veri. Lui: cinquanta, giacca a quadri, la faccia di uno che ha già pronta la battuta.
MIRELLA: Una camomilla, caro. Con un goccio di Strega. La voce va trattata come un'amante: calda, e un pochino ubriaca.
ROCCO: E a me un bicchiere di vino rosso, che la voce non ce l'ho più ma la sete sì.
MIRELLA: Mirella Sanvito. Ho cantato alla Scala per undici anni. Ho cantato Norma, tesoro. Casta diva. Davanti a duemila persone.
ROCCO: Ogni sera ce lo racconta, e ogni sera le persone aumentano. L'anno scorso erano millecinquecento.
MIRELLA: Rocco, tu sei un comico. I comici non capiscono la matematica dell'emozione.
+ [🍵 Camomilla per lei, 🍷 vino per lui]
  ~ trust.mirella += 1; trust.rocco += 1; mance += 3
  @sfx tazzina
  MIRELLA: Che mani delicate. Lei avrebbe potuto lavorare in buca, a suggerire. Sono le persone più importanti del teatro, e nessuno le vede.
+ [🍷 Vino per tutti e due]
  ~ trust.rocco += 1; mance += 2
  MIRELLA: Ho detto camomilla, caro. Il vino rosso fa male al do di petto. Ma dato che c'è, lo bevo.
  @sfx tazzina
ROCCO: Lo sapete perché il caffè non va mai in prigione? Perché tutti lo trovano... ristretto.
Nessuno ride. Rocco ride da solo, forte, e poi più piano, e poi guarda il bicchiere.
ROCCO: Ridere per non piangere, dicevano a Napoli. Che di notte è la stessa cosa, solo con un'altra faccia.
* [Ridi anche tu. Per gentilezza.]
  ~ trust.rocco += 1
  ROCCO: Grazie. La risata di cortesia è la più nobile. È quella che si fa ai funerali.
* [Gli chiedi di raccontarne un'altra.]
  ~ trust.rocco += 2
  ROCCO: Un'altra? Nessuno me ne chiede mai un'altra. Mi hai commosso. Adesso non me ne viene nessuna.
  ROCCO: Me la tengo per un'altra sera. Prometto.
@hide mirella
@hide rocco
-> n2_gigi

=== n2_gigi
@bg notte
@music notte
@sfx porta
@show gigi center
Gigi arriva alle nove, più tardi del solito. Stasera la cravatta non ce l'ha. Si siede al bancone e, prima di ordinare, tira fuori il portafoglio e lo apre su una fotografia.
GIGI: Questa è Giulia. Mia figlia. Si laurea in architettura a marzo. Centodieci, vedrai. Ha sempre disegnato case, fin da piccola. Case con le finestre grandissime.
GIGI: Le sto mettendo da parte i soldi per uno studio. Uno vero, con il suo nome sulla targa. Tremila euro li ho già. Me ne servono altri tremila, e poi glielo dico.
GIGI: Non ci parliamo da tre anni. Ma quando le dirò dello studio... vedrai.
* [Le hai mai detto che sei fiero di lei?]
  ~ trust.gigi += 1; giulia_nome
  Gigi chiude il portafoglio piano, come si chiude una porta su una stanza dove dorme qualcuno.
  GIGI: Gliel'ho scritto. In un messaggio. Tre anni fa. Non ha risposto.
  GIGI: Giulia Ferrante. Il cognome è il mio. È l'unica cosa mia che si è tenuta.
* [Tremila euro sono già uno studio. Piccolo, ma vero.]
  ~ trust.gigi += 1
  GIGI: Piccolo non va bene. Io a lei le ho dato sempre cose piccole. Il tempo, soprattutto. Piccolissimo.
* [Prendi un amaro?]
  ~ mance += 2
  @sfx tazzina
  GIGI: Sì. Un amaro. E poi vado a vedere le signore.
GIGI: Mi raccomando, non dirlo a nessuno. Lo studio. È una sorpresa.
Si alza. Guarda la tenda rossa.
* {trust.gigi >= 2} [Gigi. Resta qui stasera. Parliamo un po'.]
  ~ trust.gigi += 1; gigi_restato
  Gigi si ferma con la mano sul velluto. Rimane così un tempo lunghissimo, che saranno cinque secondi.
  GIGI: Cinque minuti. Ti do cinque minuti, poi vado.
  Ne restano quaranta. Parla del suo primo lavoro, delle fiere a Francoforte, di una notte in cui Giulia aveva la febbre e lui le ha letto tutto Pinocchio. Poi guarda l'orologio e si spaventa di quanto è tardi, come se fosse tardi per qualcosa.
  GIGI: Domani. Domani ci vado.
* [Lo lasci andare.]
  @sfx jingle
  La tenda si scosta, e la musichetta lo accoglie come un cane che fa le feste.
@hide gigi
-> n2_contessa

=== n2_contessa
@sfx porta
@show contessa right
A mezzanotte meno dieci entra una signora con una pelliccia che una volta era di volpe e un cappello con la veletta.
CONTESSA: Adelaide Rigamonti di Valdossola. Contessa. Non si alzi, prego. Un Martini, e mi segni il conto: lo salderò con i proventi della tonnara.
* [Che tonnara?]
  CONTESSA: In Sardegna, caro. Capo Malfatano. Una tonnara del Seicento, quote a duemila euro. Rendimento del trenta per cento all'anno. Le interessa?
  * [Non ho duemila euro.]
    CONTESSA: Nessuno li ha, all'inizio. È questo il bello degli affari: si comincia sempre senza.
  * [I tonni del Seicento sono un po' vecchi.]
    ~ trust.contessa += 1
    La Contessa ride. Una risata vera, rauca, da fumatrice, che non c'entra niente con la pelliccia.
    CONTESSA: Lei ha dello spirito. Diffido di chi ha spirito. È l'unica gente che non si fa fregare.
* [Il Martini lo offre la casa, Contessa.]
  ~ trust.contessa += 1
  CONTESSA: La casa ha gusto. Lo dica alla casa.
@sfx tazzina
CONTESSA (guardando la tenda): E il signor Ferrante è già di là? Bene. Bene. È un uomo con dei risparmi. Gli uomini con dei risparmi sono così soli.
@hide contessa
-> n2_chiusura

=== n2_chiusura
@hide all
@show luca center
LUCA: Elvira ti ha lasciato la tazzina?
* [Sì. Il macchiato freddo, intatto.]
  LUCA: Allora le piaci. Agli altri lo beve lei, dopo. A te l'ha lasciato.
  ~ trust.luca += 1
* [Teresa. Chi era?]
  LUCA: La sua compagna. Quarantun anni. Il quartiere diceva "le cugine". La famiglia di Teresa le ha detto di non venire al funerale.
  LUCA: Elvira è venuta lo stesso. È stata dietro una colonna, in fondo alla chiesa, per tutta la messa. Mio padre l'ha accompagnata. È l'unica cosa per cui gli ho detto grazie, in vita mia.
  ~ elvira_teresa; trust.luca += 1
@memory elvira "Teresa beveva il macchiato freddo d'estate e d'inverno. Quarantun anni allo stesso tavolino."
-> n2_hub

=== n2_hub
* {mance >= 1} [Lascia un caffè sospeso (1 €).]
  ~ mance -= 1; sospesi += 1
  Un altro scontrino sotto la zuccheriera. SOSPESO. La parola sembra una persona appesa a un filo, in attesa.
  -> n2_hub
* [Chiudi. Ti tiri su il bavero e vai.]
  @sfx porta
  La pioggia ha smesso. Sui tetti c'è un odore di ferro e di ottobre, anche se è novembre.
  -> n3_inizio
`;
