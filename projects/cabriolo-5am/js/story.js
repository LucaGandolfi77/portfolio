/* =============================================
   Cabriolo, 5:00 — story.js
   Capitoli · Dialoghi · Scelte · Finali
   Fidenza, estate 2021
   ============================================= */
"use strict";

const CABRIOLO_STORY = (() => {

  const endings = [
    {
      id: "orizzonte",
      name: "L'Orizzonte",
      label: "Finale 1 · L'Orizzonte",
      desc: "Restano. La collina diventa dentro di loro — un luogo che portano ovunque.",
      text: "Quell'autunno la collina si copre di rugiada ogni mattina. Nessuno dei tre smette di salire. Non è più un rituale: è un bisogno.\n\nLuca, Thomas e Valentina continuano a salire a Cabriolo anche quando piove, anche quando l'alba è grigia e l'orizzonte si confonde con la nebbia della Bassa. Hanno capito che l'alba non è un posto — è una decisione: ogni giorno scegliere di alzarsi e guardare avanti.\n\nLa collina è dentro di loro adesso. Ovunque vadano, sanno che alle 5 di mattina c'è un posto dove qualcuno li aspetta.\n\n«Non è il posto», dice Thomas una mattina. «È il fatto che ci andiamo.»\n\nE quel «ci andiamo» è tutto.\n\n* * *\n\nFidenza, 5:00 di un mattino qualunque. Il sole sale. I tre amici sono lì. Non si dicono niente. Non serve.\n\nIl mondo è nuovo.",
      req: { luce: 4, malinconia: 0, legame: 3 }
    },
    {
      id: "radio",
      name: "Radio Cabriolo",
      label: "Finale 2 · Radio Cabriolo",
      desc: "Creano qualcosa insieme: una radio pirata, una playlist infinita, un segnale.",
      text: "«E se facessimo una radio?»\n\nLa frase la dice Valentina una notte, quando la música di Thomas è ancora nelle orecchie e l'alba è ancora un'ora lontana. Una radio alle 5 del mattino. Per chi non riesce a dormire. Per chi ha bisogno di una voce prima che il mondo si svegli.\n\n«Radio Cabriolo», ride Thomas. «Frequenza zero.»\n\nMa non è una barzelletta. Thomas preparation una playlist di 47 brani — tutti i pezzi che hanno ascoltato sulla collina. Valentina scrive le note di copertina: le storie di ogni alba, i dialoghi, le pause. Luca registra i suoni della collina: grilli, vento, sassolini sullo Stirone, il respiro dei tre mentre guardano il sole.\n\nLa radio diventa un podcast. Il podcast diventa un archivio. L'archivio diventa un diario collettivo.\n\nLa prima puntata si chiama «Le 5:07 di Cabriolo». La ascoltano in tre, alle 5 di mattina, seduti sulla collina come sempre.\n\n«Funziona?» chiede Luca.\n\n«Funziona quando ci ascolti tu», risponde Valentina.\n\n* * *\n\nRadio Cabriolo trasmette ancora. Ogni mattina alle 5:07. Una canzone, una voce, un suono.\n\nNon è una radio pirata. È una radio privata: per tre persone che hanno scelto di non dimenticare.",
      req: { luce: 3, malinconia: 1, legame: 4 }
    },
    {
      id: "ogni5",
      name: "Ogni 5 del Mese",
      label: "Finale 3 · Ogni 5 del Mese",
      desc: "Uno parte, ma la promessa resta: il 5 di ogni mese, sulla collina, senza eccezioni.",
      text: "Thomas parte il 15 settembre. Aereo per Amsterdam. Le università olandesi hanno borse per chi vuole studiare design sonoro — e Thomas vuole, da sempre, ma non lo diceva perché non si dice certe cose quando gli amici stanno male.\n\nL'ultima sera sulla collina è silenziosa. Valentina piange piano. Luca guarda l'orizzonte e prova a ricordarsi ogni dettaglio: il profumo dell'erba bagnata, il rumore dello Stirone, la voce di Thomas che fa il DJ con il volume al minimo.\n\n«Il 5 di ogni mese», dice Thomas. «Alle 5 di mattina. Anche se siamo in tre posti diversi.»\n\n«E se non riusciamo?» chiede Luca.\n\n«Allora lo facciamo lo stesso. Chi può sale, gli altri si collegano. Ma il 5 è sacro.»\n\nIl 5 ottobre, alle 5:07, Luca e Valentina sono sulla collina. Lo smartphone è appoggiato su un sasso. Thomas è a Amsterdam, nella sua stanza, con le cuffie.\n\nThomas mette in play «Le 5:07» — il brano che hanno registrato insieme l'ultima sera.\n\nValentina sussurra: «Ci sei?»\n\n«Ci sono.»\n\nIl sole sorge a Fidenza. Il sole sorge a Amsterdam. Lo stesso sole.\n\n* * *\n\nIl 5 di ogni mese, senza eccezione. Anche a distanza. Anche quando fa male. Anche quando il mondo dice che non ha senso.\n\nPerché il 5 è sacro.",
      req: { luce: 2, malinconia: 3, legame: 2 }
    },
    {
      id: "mondo",
      name: "Le 5:00 del Mondo",
      label: "Finale Segreto · Le 5:00 del Mondo",
      desc: "Ogni alba è un punto sulla mappa. Il mondo intero è Cabriolo.",
      text: "Anni dopo — quanti? Non importa — Luca è in un treno che attraversa la Pianura Padana. Thomas è in una barca a Amsterdam. Valentina è su un tetto a Milano.\n\nAlle 5:00 del mattino, tutti e tre guardano il sole.\n\nLuca apre il phone. C'è un messaggio di Thomas: una foto dell'orizzonte olandese, arancione e pallido. Poi una di Valentina: il grattacielo Pirelli contro il cielo rosa.\n\nLuca fa una foto sua: il treno, la nebbia, le colline che si allontanano.\n\nLe tre foto, messeme in fila, formano un orizzonte unico. Un orizzonte che va da Fidenza a Milano a Amsterdam. Un orizzonte continuo.\n\n«Vi ricordate quando pensavamo di essere immortali?» scrive Luca.\n\nThomas risponde: «Lo siamo ancora. Solo che adesso lo sappiamo.»\n\nValentina non scrive niente. Manda una foto: il sole, grande, che esce da un cumulo di nuvole. Il sole di tutte le città. Il sole di tutti.\n\n* * *\n\nAlle 5 di mattina, ovunque nel mondo, qualcuno guarda il sole. Se sei di Cabriolo, lo guardi con noi.\n\nL'alba non ha confini.\n\nLe 5:00 del mondo sono sempre le stesse.",
      req: { luce: 5, malinconia: 0, legame: 5, secret: true }
    }
  ];

  const chapters = [
    // ===== CAPITOLO 1: LA PRIMA SALITA =====
    {
      id: 1,
      title: "La Prima Salita",
      subtitle: "Giugno 2021",
      month: "giugno",
      palette: "summer",
      song: "♪ In cima: Calcutta — Odiovecchi · Frah Quintale — Pacific231 · Mace — Il cielo nella torre",
      minigame: "salita",
      scenes: [
        { type: "narration", text: "Il telefono vibra alle 4:47. È Thomas. Un messaggio solo: «ci siamo?»\n\nLuca si alza dal letto senza svegliare nessuno. Si veste al buio. Scarpe, zaino, bottiglia d'acqua. La cassa bluetooth nello zaino." },
        { type: "dialogue", speaker: "Luca", text: "«Due anni. Due anni che non facciamo niente insieme. Oggi si ricomincia.»" },
        { type: "narration", text: "La strada per Cabriolo è una mulattiera sterrata che sale tra i campi. L'aria è ancora fresca, ma sa di grano e di caldo che arriva." },
        { type: "dialogue", speaker: "Thomas", text: "«Hai portato la cassa?»\n\n«Sempre.»\n\n«Allora siamo a posto.»" },
        { type: "narration", text: "Valentina è già lì, seduta sul muretto. Ha il maglione legato intorno ai fianchi e guarda verso est, dove il cielo sta virando dal nero al blu." },
        { type: "dialogue", speaker: "Valentina", text: "«Sapevo che saresti arrivato prima tu, Thomas. E tu dopo, Luca. È sempre così.»\n\n«È un segno?» chiede Luca.\n\n«È un rituale.»" },
        {
          type: "choice",
          text: "L'alba è ancora lontana. Cosa fai?",
          choices: [
            { text: "Accendi la cassa e metti qualcosa di dolce — un brano che ricordi da marzo", effect: { luce: 1, legame: 1 }, next: "c1_music" },
            { text: "Siediti in silenzio e aspetta. Guarda il cielo cambiare.", effect: { malinconia: 1 }, next: "c1_silence" }
          ]
        },
        { id: "c1_music", type: "narration", text: "La musica sale piano. «Pacific231» di Frah Quintale. Tre note che si disfano nel vento. Thomas annuisce. Valentina sorride. Il cielo è viola." },
        { id: "c1_silence", type: "narration", text: "Il silenzio della Bassa è totale. Solo i grilli e, lontano, il verso di un gallo che si è sbagliato orario. Il cielo passa dal viola al rosa." },
        { type: "dialogue", speaker: "Valentina", text: "«Vi ricordate quando eravamo piccoli e saltavamo la recita per venire qui?»\n\n«Non l'ho mai dimenticato», dice Luca. «La maestra ci ha odiato.»\n\n«Ci ha odiato perché avevamo ragione. La collina è meglio di qualsiasi recita.»" },
        { type: "narration", text: "Il sole spunta. Un filo d'oro sull'orizzonte. La collina si illumina. Thomas alza il volume." },
        { type: "dialogue", speaker: "Thomas", text: "«Ascoltate.»\n\nSilenzio. Solo la musica e il sole che sale.\n\nValentina dice piano: «Siamo vivi.»\n\n«Lo siamo da un pezzo», risponde Luca. «Solo che adesso lo sentiamo.»" },
        { type: "narration", text: "Restano lì fino alle 6:30, quando il sole è alto e il mondo si sveglia. Thomas mette «Odiovecchi» e i tre ballano senza coreografia, tra i sassi e l'erba alta.\n\nÈ la prima alba. La prima di tante.\n\nIl telefono di Luca registra un video: tre sagome contro il sole. Non lo guarderà mai più. Ma non lo cancellerà mai." },
      ]
    },

    // ===== CAPITOLO 2: LE 5:07 =====
    {
      id: 2,
      title: "Le 5:07",
      subtitle: "Luglio 2021",
      month: "luglio",
      palette: "summer",
      song: "♪ In cima: Mace — Il cielo nella torre · Calcutta — 200J · The Pills — Sotto casa",
      minigame: "playlist",
      scenes: [
        { type: "narration", text: "Luglio. Il rituale si è consolidato. Ogni mattina alle 5:07 — non le 5, non le 5:10, le 5:07, perché Thomas ha letto che il momento migliore per guardare il sole è esattamente 7 minuti dopo l'alba ufficiale — i tre sono sulla collina." },
        { type: "narration", text: "Hanno una playlist. La chiamano «Le 5:07». È lunga 4 ore e 12 minuti. È composta da canzoni vere, canzoni inventate, suoni registrati sulla collina e, una volta, il rumore di una moto che passava sulla statale." },
        { type: "dialogue", speaker: "Thomas", text: "«Oggi ho aggiunto Mace. Il cielo nella torre. È perfetta per le 5:12, quando il sole è alto e il cielo è tutto arancione.»\n\n«Ma il cielo qui non è mai arancione», dice Valentina.\n\n«Lo è se lo guardi con le cuffie giuste.»" },
        {
          type: "choice",
          text: "Thomas vuole aggiungere un brano nuovo alla playlist. Cosa suggerisci?",
          choices: [
            { text: "Qualcosa di energico — The Pills, Sotto casa, per quando ci si alza dal muretto", effect: { luce: 1, legame: 1 }, next: "c2_energy" },
            { text: "Qualcosa di lento — 200J di Calcutta, per quando il sole è ancora basso", effect: { malinconia: 1 }, next: "c2_slow" }
          ]
        },
        { id: "c2_energy", type: "narration", text: "Thomas mette The Pills. L'energia sale. Luca si alza e fa qualche passo di danza storto. Valentina ride. Il sole sale più veloce della musica." },
        { id: "c2_slow", type: "narration", text: "Le note di Calcutta si mescolano al vento. Il sole è una palla morbida sull'orizzonte. Valentina appoggia la testa sulla spalla di Luca. Nessuno parla per cinque minuti." },
        { type: "dialogue", speaker: "Valentina", text: "«Lo sapete che questa playlist è la cosa più vera che abbiamo? Più vera di Instagram, più vera di qualsiasi chat. È la nostra colonna sonora.»" },
        { type: "dialogue", speaker: "Luca", text: "«E se un giorno qualcuno la trova? Dopo mille anni, qualcuno apre il phone e dice: “Ehi, c'era un gruppo di amici a Fidenza che ascoltava queste canzoni alle 5 di mattina.”»" },
        { type: "dialogue", speaker: "Thomas", text: "«Allora saprà che siamo esistiti. E che eravamo felici.»" },
        { type: "narration", text: "Il sole è alto. La collina è calda. La playlist continua.\n\nLuglio. Le 5:07. Il mondo è ancora chiuso, ma loro no.\n\nHanno la collina, la musica e il tempo.\n\nNon serve nient'altro." },
      ]
    },

    // ===== CAPITOLO 3: IL GIURAMENTO DI FERRAGOSTO =====
    {
      id: 3,
      title: "Il Giuramento di Ferragosto",
      subtitle: "Agosto 2021",
      month: "agosto",
      palette: "summer",
      song: "♪ In cima: Frah Quintale — La paura · Mace — Blues di lazzaro · Calcutta — Ammazzare il tempo",
      minigame: "sassolini",
      scenes: [
        { type: "narration", text: "Ferragosto. Caldo afoso. La collina di Cabriolo è un forno, ma alle 5 è ancora respirabile. Oggi c'è anche Davide, il cane di Thomas, che sale tutto bavoso e si butta nell'erba." },
        { type: "dialogue", speaker: "Thomas", text: "«Ferragosto è l'unico giorno in cui l'Italia si ferma. Tipo il Covid, ma senza il terrore.»" },
        { type: "dialogue", speaker: "Valentina", text: "«Fermarsi non è lo stesso di essere chiusi. Fermarsi è una scelta.»" },
        { type: "narration", text: "Dopo l'alba, scendono allo Stirone. Il fiume è basso, l'acqua chiara. Thomas prende un sassolino piatto." },
        {
          type: "choice",
          text: "Thomas vuole fare il giuramento di Ferragosto. Cosa fai?",
          choices: [
            { text: "Raccogli un sassolino e lancialo — ogni rimbalzo è una promessa", effect: { legame: 2 }, next: "c3_throw" },
            { text: "Rimani sulla riva e guarda. Non tutti i momenti vanno vissuti, some vanno solo guardati", effect: { malinconia: 1, luce: 1 }, next: "c3_watch" }
          ]
        },
        { id: "c3_throw", type: "narration", text: "Il sassolino rimbalza tre volte sull'acqua. Ogni rimbalzo è una parola: «Non ci perdiamo. Non ci perdiamo. Non ci perdiamo.»" },
        { id: "c3_watch", type: "narration", text: "Valentina si siede sulla riva e guarda Thomas lanciare sassolini. Il fiume li porta via, uno a uno. Ogni sassolino è una parola che il fiume porta al mare." },
        { type: "dialogue", speaker: "Valentina", text: "«Io ho paura.»\n\nSilenzio. Davide abbai una volta.\n\n«Ho paura che finisca. Che un giorno ci svegliamo e non abbiamo più questo. La collina, la musica, noi tre.»" },
        { type: "dialogue", speaker: "Luca", text: "«Non finisce. Non può finire.»\n\n«Può», dice Thomas. «Ma solo se lo lasciamo fare.»" },
        { type: "narration", text: "Restano allo Stirone fino a quando il sole diventa insopportabile. Thomas fa un ultimo lancio: il sassolino rimbalza cinque volte — un record.\n\n«Cinque volte», dice. «Come le cinque di mattina.»\n\nIl fiume porta via il sassolino. Ma la promessa resta.\n\nNon ci perdiamo." },
      ]
    },

    // ===== CAPITOLO 4: SETTEMBRE PIOVE =====
    {
      id: 4,
      title: "Settembre Piove",
      subtitle: "Settembre 2021",
      month: "settembre",
      palette: "autumn",
      song: "♪ In cima: Frah Quintale — Vento caldo · Mace — Il cielo nella torre · Calcutta — Ammazzare il tempo",
      minigame: "lucciole",
      scenes: [
        { type: "narration", text: "Settembre. L'aria cambia. Il grano è stato tagliato. La collina è più arida, l'erba è gialla. E una mattina, per la prima volta, piove." },
        { type: "narration", text: "Luca e Thomas sono sotto l'ombrello. Valentina no. È lì, sotto la pioggia, con il maglione inzuppato e gli occhi lucidi." },
        { type: "dialogue", speaker: "Thomas", text: "«Val, vieni sotto.»\n\n«No.»\n\n«Perché?»\n\n«Perché la pioggia non fa male. Le cose che fanno male sono altre.»" },
        {
          type: "choice",
          text: "Thomas ha ricevuto una mail. La borsa di studio ad Amsterdam. Cosa fai?",
          choices: [
            { text: "Dille subito. Non ha senso nascondere le cose importanti", effect: { luce: 1, malinconia: 1 }, next: "c4_tell" },
            { text: "Aspetta. Oggi è Settembre Piove. Alcune notizie possono aspettare un giorno", effect: { malinconia: 2 }, next: "c4_wait" }
          ]
        },
        { id: "c4_tell", type: "narration", text: "Thomas guarda la mail. La borsa di studio è reale. Amsterdam. Design sonoro. Il suo sogno.\n\n«Non vado», dice.\n\n«Devi andare», dice Valentina.\n\n«Non vado senza di voi.»\n\n«Non puoi portarci nello zaino, Thomas.»" },
        { id: "c4_wait", type: "narration", text: "Thomas mette la mail in tasca. La pioggia continua. Il telefono vibra ancora, ma lui lo ignora.\n\nL'indomani, quando la pioggia finisce, apre la mail. La borsa di studio è ancora lì.\n\nNon la dice a nessuno. Per un giorno intero." },
        { type: "dialogue", speaker: "Luca", text: "«Lo sapete cosa mi spaventa? Non è che uno va via. È che uno va via e poi si abitua. E quando si abitua, non torna più davvero.»" },
        { type: "dialogue", speaker: "Valentina", text: "«Io non mi abituerò. Nemmeno se voi vi abituate. Io sarò sempre sulla collina alle 5. Anche da sola. Soprattutto da sola.»" },
        { type: "narration", text: "La pioggia smette alle 7. Il sole spunta, fiacco, dietro le nuvole. Thomas mette «Vento caldo» di Frah Quintale.\n\nLa musica suona diverso adesso. Più lenta. Più vera.\n\nSettembre. Le prime foglie cadono. Non dalla collina — dai platani della statale. Ma sono ugualmente belle.\n\nO sono tristi. Non si sa ancora." },
      ]
    },

    // ===== CAPITOLO 5: L'ULTIMA ALBICOCCA =====
    {
      id: 5,
      title: "L'Ultima Albicocca",
      subtitle: "Ottobre 2021",
      month: "ottobre",
      palette: "autumn",
      song: "♪ In cima: Mace — Il cielo nella torre · Frah Quintale — La paura · Calcutta — 200J",
      minigame: "parole",
      scenes: [
        { type: "narration", text: "Ottobre. La collina di Cabriolo è rossa e arancione. Le albicocche sono finite — ne resta una, appesa a un ramo basso, quasi dimenticata." },
        { type: "narration", text: "Thomas parte tra due settimane. L'aereo è il 15 ottobre. Amsterdam. Il suo sogno.\n\nValentina non ha ancora parlato dell'università. Luca ha mandato la candidatura per il tirocinio a Milano, ma non l'ha ancora detto a nessuno." },
        { type: "dialogue", speaker: "Valentina", text: "«Prendete l'ultima albicocca.»\n\nThomas la prende. La guarda come si guarda una cosa preziosa.\n\n«La dividiamo?» chiede.\n\n«No. La mangia tu. L'ultima è per chi va via.»" },
        {
          type: "choice",
          text: "È l'ultima alba insieme prima che Thomas parta. Cosa dici?",
          choices: [
            { text: "«Ti ricorderemo. Ogni mattina alle 5:07, anche da lontano.»", effect: { legame: 2 }, next: "c5_remember" },
            { text: "«Tornerai. E se non torni, andremo noi da te.»", effect: { luce: 1, legame: 1 }, next: "c5_return" },
            { text: "Niente. Guarda il sole e lascia che il silenzio dica tutto.", effect: { malinconia: 1, legame: 1 }, next: "c5_silence" }
          ]
        },
        { id: "c5_remember", type: "narration", text: "Thomas annuisce. Mangia l'albicocca. Il sapore è dolce e un po' amaro — come tutto a ottobre.\n\n«Ogni mattina alle 5:07. Promesso.»" },
        { id: "c5_return", type: "narration", text: "Thomas ride. «A Amsterdam non ci sono colline.»\n\n«Le costruiremo», dice Valentina.\n\n«Con cosa?»\n\n«Con le stesse canzoni. Le stesse storie. Le stesse 5:07.»" },
        { id: "c5_silence", type: "narration", text: "Nessuno parla. Il sole sale. L'albicocca è finita. Il ramo è vuoto.\n\nValentina prende il telefono e registra 10 secondi di silenzio. Solo il vento.\n\n«Per quando mi mancherà», dice." },
        { type: "narration", text: "L'ultima alba di ottobre è rossa e fredda. Thomas mette «Il cielo nella torre» di Mace. La musica è grande e piccola allo stesso tempo.\n\nValentina piange. Luca la tiene per mano. Thomas guarda avanti, verso ovest, dove Amsterdam non si vede ma esiste.\n\nSi abbracciano. Non dicono arrivederci.\n\nDicono: «Le 5:07.»\n\nE basta." },
      ]
    }
  ];

  return { chapters, endings };
})();
