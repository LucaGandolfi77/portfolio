/* Notte 7 — Domenica. L'alba blu. Finali ed epilogo. */
export default String.raw`
=== n7_inizio
@title "Notte 7 · Domenica" "L'alba blu"
@bg mattina
@fx fumo
@music giorno
@hide all
Domenica il cielo è di un azzurro così pulito che sembra finto, come quello dei presepi.
Alle sei di sera arriverà il signor Ferri, il padrone dei muri, per l'affitto. Duemilaquattrocento euro.
~ colletta = 0; soglia = 2
{colletta_assunta} ~ soglia = 1
{piano_spegnere} -> n7_colletta
-> n7_giornata

=== n7_giornata
@rush 3
La domenica passa come passano le domeniche nei bar: lenta, piena di giornali spiegazzati e di bambini che vogliono le caramelle gommose del vaso sulla cassa.
-> n7_ferri

=== n7_colletta
@bg pomeriggio
@music colletta
{colletta_assunta} Assunta ha fatto il giro. Ha suonato a tutti i campanelli da via Padova a viale Monza, con il cappotto viola e una scatola da scarpe con scritto sopra, a pennarello: PER IL BAR.
{!colletta_assunta} Nessuno ha organizzato niente. Ma la voce gira, nei quartieri, più veloce del gas.
Per tutto il pomeriggio la porta si apre e si chiude.
{trust.assunta >= soglia} @show assunta center
{trust.assunta >= soglia} ASSUNTA: Trecento. I soldi del mio funerale. Tanto io muoio tardi, che ho ancora troppe cose da sapere.
{trust.assunta >= soglia} ~ colletta += 300
{trust.elvira >= soglia + 1} @show elvira center
{trust.elvira >= soglia + 1} ELVIRA: Quattrocento. E questa.
{trust.elvira >= soglia + 1} Posa sul bancone una radio a valvole, color crema, con la manopola d'osso.
{trust.elvira >= soglia + 1} ELVIRA: Era di Teresa. Ascoltava la musica leggera mentre io leggevo. Io la odiavo, la musica leggera. Adesso è l'unica cosa che ascolto.
{trust.elvira >= soglia + 1} ~ colletta += 400; radio_teresa
{trust.mirella >= soglia && mirella_cantato} @show mirella center
{trust.mirella >= soglia && mirella_cantato} MIRELLA: Duecentocinquanta. La diaria della sostituta, che ho messo da parte nel 1988, la sera in cui ho capito che non sarei mai andata in scena. Non l'ho mai spesa. Aspettavo un'occasione. È questa.
{trust.mirella >= soglia && mirella_cantato} ~ colletta += 250
{trust.nando >= soglia} @show nando center
{trust.nando >= soglia} NANDO: Trecento. Ho venduto un brevetto. Il tostapane che dice buongiorno. A una ditta di Treviso. Lo faranno in Cina, pensa te.
{trust.nando >= soglia} ~ colletta += 300
{trust.baldini >= soglia + 1} @show baldini center
{trust.baldini >= soglia + 1} BALDINI: Duecento. Ho venduto il Leopardi. La prima edizione, quella buona. Mi tengo quello sottolineato: è più mio.
{trust.baldini >= soglia + 1} ~ colletta += 200
{trust.maresciallo >= soglia} @show maresciallo center
{trust.maresciallo >= soglia} MARESCIALLO: Duecento. Non chiedete da dove vengono. Sono puliti. Sono miei. Sono di un uomo solo che non sa cosa farsene.
{trust.maresciallo >= soglia} ~ colletta += 200
{trust.rocco >= soglia} @show rocco center
{trust.rocco >= soglia} ROCCO: Centocinquanta. Una serata a Pozzuoli. Mi hanno fischiato. Ma hanno pagato.
{trust.rocco >= soglia} ~ colletta += 150
{trust.vera >= soglia} @show vera center
{trust.vera >= soglia} VERA: Trecento. I diritti di "Ruggine" di quest'anno. Tommi sarebbe d'accordo. Tommi era d'accordo su tutto, tranne che sui piatti della batteria.
{trust.vera >= soglia} ~ colletta += 300
{trust.dario >= soglia} @show dario center
{trust.dario >= soglia} DARIO: Quaranta euro. E uno scontrino. Sopra c'è una poesia. Vale di più dei quaranta euro, ma non ve lo posso dimostrare.
{trust.dario >= soglia} ~ colletta += 40
{trust.anna >= soglia} @show anna center
{trust.anna >= soglia} ANNA: Centosessanta! Ho venduto tre disegni ai turisti in Brera. Le vostre facce. Un giapponese ha comprato Rocco. Gli ho detto che era un attore famoso.
{trust.anna >= soglia} ~ colletta += 160
{trust.contessa >= soglia} @show contessa center
{trust.contessa >= soglia} CONTESSA: Cinquecento. Ho venduto la pelliccia. La volpe era finta, ma il compratore no.
{trust.contessa >= soglia} ~ colletta += 500
{ugo_salvo} @show ugo center
{ugo_salvo} UGO: Sette euro e quaranta. È tutto. Non contarli davanti a me, che mi vergogno.
{ugo_salvo} ~ colletta += 7.4
{gigi_salvo && busta_salva} @show gigi center
{gigi_salvo && busta_salva} GIGI: Giulia i soldi non li ha voluti. Mille sono vostri. Il resto lo tengo per il mio affitto. Sto imparando.
{gigi_salvo && busta_salva} ~ colletta += 1000
{gigi_salvo && !busta_salva} @show gigi center
{gigi_salvo && !busta_salva} GIGI: Io non ho niente. Ma lavoro gratis al bancone, il sabato, per un anno. E non vado mai di là. Mai più.
@hide all
Alla fine Luca conta. Non sul tovagliolo, stavolta: sul bancone, in piena luce, davanti a tutti.
LUCA: {colletta} euro.
* {mance >= 1} [Aggiungi le tue mance: {mance} euro.]
  ~ colletta += mance; mance = 0
  LUCA: Anche tu. Anche tu, Blu.
  LUCA: {colletta}.
* [Non aggiungi niente.]
  Le tue mance restano in tasca. Pesano più di quanto dovrebbero.
-> n7_ferri

=== n7_ferri
@bg sera
@music sera
@show luca center
Alle sei e cinque il signor Ferri entra senza togliersi il cappello. Ha un ombrello chiuso anche se non piove.
Luca gli dà l'affitto. Duemilaquattrocento. Contati. Poi Ferri se ne va, e il bar resta lì, con la gente dentro, a guardare Luca.
{!piano_spegnere} -> n7_senza_piano
{trust.luca < 2} -> n7_paura
{colletta >= 2400 && trust.luca >= 3} -> n7_scelta_luce
{trust.luca >= 3} -> n7_scelta_quasi
-> n7_paura

=== n7_senza_piano
{quarta} Nel pomeriggio sono arrivati due uomini con un carrello. Nella saletta adesso ci sono quattro sorelle. Fortuna Gold ha i led che fanno l'arcobaleno. Fa una musichetta diversa, più veloce.
{trust.luca <= 1} -> fine_buio
{quarta && (spins >= 25 || (ugo_morto && gigi_perso))} -> fine_buio
-> fine_ronzio

=== n7_paura
LUCA: Non ce la faccio, Blu. Ho paura. Se le spengo e poi tra due mesi chiudiamo? Chi paga allora? Chi paga mio padre, i suoi debiti, i miei?
LUCA: Le tengo. Ancora un po'. Solo un po'.
{trust.luca <= 1} -> fine_buio
-> fine_ronzio

=== n7_scelta_luce
LUCA: L'affitto di questo mese l'ha pagato la colletta. Le sorelle hanno incassato trecentoquaranta euro questa settimana. Senza Prosperità, rotta.
LUCA: Se le spengo, il mese prossimo ricomincia tutto da capo. Ma senza di loro.
Ti guarda. Ti guardano tutti.
LUCA: Dillo tu, Blu. Io non ci riesco.
* [Spegnile.]
  -> fine_luce
* [Tienile. Solo per sicurezza.]
  Luca chiude gli occhi. Quando li riapre, ha di nuovo la faccia di quindici anni di conti.
  LUCA: Già. Per sicurezza.
  -> fine_ronzio

=== n7_scelta_quasi
LUCA: Mancano soldi, comunque. Questo mese ce l'abbiamo fatta, ma il prossimo? Senza le sorelle il bar perde quattrocento euro a settimana.
LUCA: Se le spengo, vuol dire che a primavera, forse, chiudiamo. Ma chiudiamo puliti.
* [Spegnile lo stesso. Il resto lo troviamo.]
  -> fine_tramonto
* [Tienile ancora un po'.]
  LUCA: Ancora un po'. È quello che diceva mio padre.
  -> fine_ronzio

=== fine_luce
@bg saletta
@music stop
@hide all
@show luca center
Luca scosta la tenda. Entra nella saletta. Tutti lo seguono, stretti, in silenzio, come in una sacrestia.
Si inginocchia dietro Fortuna. Tira il cavo. Poi dietro Lunga vita. Poi Prosperità, che ha ancora lo schermo crepato.
Le sorelle si spengono una dopo l'altra, con un piccolo sospiro elettrico. L'ultima a spegnersi dice "Ciao! Gioca con..." e non finisce la frase.
Silenzio. Lo stesso silenzio della notte del blackout. Ma stavolta non torna la corrente: non c'è niente che deve tornare.
{nando_gina} NANDO: Il cavo. Quello di Prosperità. Me lo dai?
{nando_gina} Luca glielo dà. Nando lo rigira tra le mani come un serpente addomesticato.
{nando_gina} NANDO: È il pezzo che mi mancava. Era qui. Era qui da quindici anni.
~ trust.luca += 1; finale = 'luce'
@postcard spente "Fu, Lu, Shou, spente"
-> fine_luce_alba

=== fine_luce_alba
@bg palco
@music finale
Il mese dopo, nella saletta, al posto delle tre sorelle, ci sono le tele blu di Luca. Il porto di Wenzhou. Il neon sulla neve. Il blu che copre, adesso appeso a un muro dove si vede.
{nando_gina} Il venerdì sera Nando accende la sua macchina. Il soffitto si riempie di stelle che girano piano, e una musica di carillon suona un valzer che la Gina canticchiava stirando.
{mirella_cantato} Il sabato canta Mirella. Casta diva, sempre rotta sulla nota alta. Nessuno, mai, le chiede di non romperla.
{radio_teresa} Sul bancone c'è la radio di Teresa. Trasmette musica leggera. Elvira finge di odiarla.
Le pareti sono coperte dai disegni di Anna: facce che si vedono.
@bg esterno-alba
@fx none
L'alba di lunedì. Sei l'ultima persona a uscire, perché adesso hai le chiavi anche tu.
Ti giri a guardare l'insegna. La U non sfarfalla più. Luca l'ha fatta riparare con i soldi delle mance di Mirella.
BAR BLU. Dritta, accesa, ferma. Come se il bar avesse finalmente deciso di esistere.
-> epilogo

=== fine_tramonto
@bg saletta
@music stop
@hide all
@show luca center
Luca stacca le tre sorelle, una dopo l'altra. Non c'è nessuna cerimonia. Lo fa come si chiude il gas prima di partire.
~ finale = 'tramonto'
@bg palco
@music finale
Il Bar Blu resta aperto fino al due aprile. Quattro mesi. Quattro mesi senza musichetta.
Sono i quattro mesi più belli della sua storia. Mirella canta il sabato. Baldini parla di Epicuro il martedì, a chi vuole. Anna appende i disegni dappertutto, anche in bagno.
L'ultima sera viene tutto il quartiere. Si beve tutto quello che c'è, si mangiano i mandarini di Assunta, si canta fino alle quattro.
{nando_gina} Nando accende la sua macchina, con il cavo di Prosperità. Le stelle girano sul soffitto della saletta vuota. Nessuno parla.
@bg esterno-alba
@fx none
Luca abbassa la serranda per l'ultima volta all'alba. Stacca l'insegna. La U, finalmente, non sfarfalla più: è spenta, come tutte le altre lettere.
LUCA: Ho preso in affitto un garage in via Arquà. Ci metto le tele. Lo chiamo Studio Blu. Ci farò anche il caffè, per chi passa. Senza saletta.
LUCA: Vieni a trovarmi, qualche volta. Porta qualcuno.
-> epilogo

=== fine_ronzio
@bg notte
@music macchina
@hide all
~ finale = 'ronzio'
Le tre sorelle restano accese.
{quarta} Le quattro sorelle restano accese.
Il bar sopravvive. L'affitto si paga da solo, come aveva promesso il signore in giacca nel 2009. I clienti vanno e vengono. Qualcuno non torna più.
Luca ridipinge il muro dietro la macchina del caffè, una notte sì e una no. Il blu copre.
@bg esterno-alba
@music pioggia
La mattina dopo esci all'alba. L'insegna sfarfalla: BAR BL. BAR BLU. BAR BL.
Da dentro, attraverso la serranda abbassata, si sente ancora la musichetta. Allegra. Identica. Infinita.
-> epilogo

=== fine_buio
@bg esterno-chiuso
@fx pioggia
@music pioggia
@hide all
~ finale = 'buio'
A gennaio Luca vende la licenza alla ditta delle macchinette. Non ti dice niente. Te lo dice Assunta, sulla porta della merceria, con la faccia di chi ha perso un parente.
Luca è partito per Wenzhou, la città di sua madre. Non ha lasciato un indirizzo. Le tele blu le ha lasciate in cantina.
A marzo riapre il locale. Si chiama LUCKY STAR. Non c'è più il bancone. Ci sono quattordici macchine, una accanto all'altra, che respirano luci di tutti i colori. Non c'è nessuno che fa il caffè.
Passi davanti una sera. Dietro la vetrina oscurata, di spalle, c'è un uomo in giacca, senza cravatta, che gioca.
Potrebbe essere Gigi. Potrebbe essere chiunque. È questa la cosa crudele: che potrebbe essere chiunque.
-> epilogo

=== epilogo
@title "Epilogo" "Quello che è stato di loro"
@hide all
@fx none
@music epilogo
{ugo_salvo && finale == 'luce'} Ugo apre la serranda ogni mattina alle sei e mezza. Ha una chiave, la porta al collo con uno spago. Il menù del bar l'ha composto lui, a mano, con i suoi caratteri di piombo.
{ugo_salvo && finale != 'luce'} Ugo ha trovato posto in una casa famiglia in viale Ortles. Ha una stanza con una finestra. Sul davanzale ha messo tre caratteri di piombo, in fila.
{ugo_morto} Sotto la zuccheriera, da quell'inverno, c'è sempre uno scontrino con scritto SOSPESO. Nessuno lo usa. Nessuno lo toglie.
{gigi_salvo} Il ventidue marzo, alle undici, Gigi era seduto in fondo all'aula magna del Politecnico. Non ha fatto niente di speciale. Ha solo applaudito, per primo e per ultimo.
{gigi_perso} Gigi non è tornato da Genova. Luca ha messo via la sua tazzina capovolta solo a febbraio.
{baldini_matteo} Il professor Baldini ha ricominciato a insegnare: il martedì sera, gratis, a chi capita. Il corso si chiama "Il senso, per chi l'ha perso". Alla fine di ogni lezione legge quattro versi brutti, bruttissimi. Nessuno ride.
{!baldini_matteo} Il professor Baldini beve ancora, ma meno. Qualcuno dice che di notte, sui tovaglioli, scrive versi brutti. Non sono suoi.
{elvira_seduta} Elvira viene ancora alle quattro. Ordina due caffè. Uno normale e uno macchiato freddo. Adesso, il secondo, lo beve qualcuno.
{mirella_cantato} Mirella ha ricominciato a fare vocalizzi la mattina. I vicini si lamentano. Lei dice che sono invidiosi.
{nando_gina && finale == 'luce'} La macchina che allunga la vita funziona. Nando dice che la notte, adesso, dura il giusto.
{trust.contessa >= 2} Adelaide fa gli orli ai pantaloni a mezzo quartiere, a cinque euro l'uno. Dice che è un'attività di copertura.
{trust.vera >= 2 && trust.dario >= 2} Vera e Dario hanno scritto una canzone insieme. Si chiama "Scontrini". Non è entrata in classifica. Al Bar Blu la sanno tutti a memoria.
{trust.maresciallo >= 2} Il Maresciallo Cazzaniga è andato in pensione a febbraio. Adesso attraversa la strada. Lui e Assunta prendono il caffè insieme, alle sette. Lei dice che è una coincidenza urbanistica.
{trust.anna >= 2} Anna ha fatto la sua prima mostra. Si chiamava "Facce che si vedono". Nella sala più grande c'era un ritratto di una persona dietro un bancone, con lo strofinaccio sulla spalla.
{finale == 'luce' || finale == 'tramonto'} -> epilogo_nome
-> epilogo_fine

=== epilogo_nome
@bg esterno-alba
@show luca center
Un mattino di primavera, mentre asciughi un bicchiere già asciutto, Luca ti guarda come la prima sera.
LUCA: Sai che non ti ho mai chiesto come ti chiami davvero?
LUCA: Te lo sei meritato, un nome. Da un pezzo.
@input nome
LUCA: {nome}.
LUCA: Bel nome. Però per noi resti Blu. Va bene lo stesso?
@credits
@end luce

=== epilogo_fine
@bg esterno-alba
Una mattina, molto tempo dopo, passi per via Padova. Ti fermi all'angolo. Ti viene in mente un caffè fortissimo e un po' bruciato, come quelli delle quattro di mattina negli ospedali.
Qualcuno, da qualche parte, ti chiama ancora Blu.
@credits
@end ombra
`;
