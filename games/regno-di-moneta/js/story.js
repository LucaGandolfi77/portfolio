// story.js — Dialoghi e dati capitoli
window.StoryData = {
  chapters: [
    {
      id: 'budget',
      title: 'Il Primo Soldo',
      icon: '🏦',
      concept: 'Entrate, uscite e budget',
      dialogue: [
        { who: 'lia', text: 'Finalmente ho abbastanza soldi per aprire la mia bancarella al mercato!' },
        { who: 'bartolo', text: 'Ah, Lia! Prima di spendere tutto, hai preparato un budget? Senza sapere quanto guadagni e quanto spendi, i soldi spariscono come neve al sole!' },
        { who: 'lia', text: 'Un budget? Ma sono solo monete...' },
        { who: 'bartolo', text: 'Ogni moneta conta! 🪙 Il budget è come una mappa: ti dice dove vanno i tuoi soldi. Le ENTRATE sono i soldi che guadagni, le USCITE sono quelli che spendi. La differenza è il tuo RISPARMIO.' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Regola d\'oro — spendi sempre MENO di quanto guadagni! Se entri €100 e ne spendi €80, hai €20 di risparmio. Quelli diventano la tua ricchezza!' },
        { who: 'bartolo', text: 'Ora prova: servi i clienti al mio banco e calcola il resto correttamente!' }
      ],
      lesson: 'ENTRATE > USCITE = RISPARMIO 💰\nTieni traccia di TUTTE le spese, anche le piccole!',
      minigame: 'banco'
    },
    {
      id: 'mercatto',
      title: 'Il Mercato',
      icon: '🏪',
      concept: 'Domanda, offerta e prezzi',
      dialogue: [
        { who: 'lia', text: 'Il mercato è pieno di merci! Ma perché le mele costano €2 oggi e ieri costavano €1?' },
        { who: 'bartolo', text: 'Benvenuta nella legge di DOMANDA e OFFERTA! 📊 Se tutti vogliono mele e ce ne sono poche, il prezzo sale. Se ce ne sono tante e nessuno le vuole, scende!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Compra quando il prezzo è BASSO (tanta offerta, poca domanda). Vendi quando è ALTO (tanta domanda, poca offerta). La differenza è il tuo GUADAGNO!' },
        { who: 'lia', text: 'Quindi devo comprare quando costa poco e vendere quando costa tanto!' },
        { who: 'tizio', text: 'Psst! Vuoi comprare mele a €5? Ne avrai solo perdere 💸' },
        { who: 'bartolo', text: 'ATTENZIONE! Tizio l\'Usuraio vende sempre caro. Non fidarti di chi promette guadagni facili!' }
      ],
      lesson: 'COMPRA BASSO, VENDI ALTO! 📈\nAttenzione a chi ti vende "opportunità" troppo vantaggiose.',
      minigame: 'mercato'
    },
    {
      id: 'interesse',
      title: 'Il Salvadanaio Magico',
      icon: '🌳',
      concept: 'Interesse semplice e composto',
      dialogue: [
        { who: 'lia', text: 'Ho €100 di risparmi! Ma se li metto sotto il materasso, tra un anno saranno sempre €100...' },
        { who: 'bartolo', text: 'Ecco perché esiste il RISPARMIO in banca! La banca ti PAGA per tenere i tuoi soldi. Si chiama INTERESSE. Se l\'interesse è 10%, dopo un anno hai €110!' },
        { who: 'lia', text: 'Bello! E se li lascio per due anni?' },
        { who: 'bartolo', text: 'Ecco la MAGIA! Con l\'interesse SEMPLICE prendi €10 ogni anno: €100→€110→€120. Ma con l\'interesse COMPOSTO, il secondo anno il 10% si calcola su €110: €100→€110→€121!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: L\'interesse composto è l\'8a meraviglia del mondo! (Einstein dixit). Il tempo è tuo alleato: prima inizi, più cresci!' },
        { who: 'lia', text: 'Possiamo piantare un albero per vedere come cresce?' },
        { who: 'bartolo', text: 'Ottima idea! Pianta le monete e guarda il tuo albero di ricchezza crescere!' }
      ],
      lesson: 'INTERESSE COMPOSTO = interesse su interessi! 🌳\n€100 al 10% diventano €110→€121→€133→€146→€161 in 5 anni. Il TEMPO è potenza!',
      minigame: 'albero'
    },
    {
      id: 'simulatore',
      title: 'Il Segreto del Compound Interest',
      icon: '🧮',
      concept: 'Simulatore completo di interesse composto',
      dialogue: [
        { who: 'lia', text: 'Bartolo, ho capito l\'interesse composto... ma voglio vedere CON ESATTEZZA come crescono i miei soldi!' },
        { who: 'bartolo', text: 'Allora ti presento il SIMULATORE MAGICO! 🧮 Puoi inserire tutto: quanto investi, per quanti anni, con che tasso, e anche quanto aggiungi ogni mese!' },
        { who: 'lia', text: 'Ogni mese? Posso aggiungere soldi regolarmente?' },
        { who: 'bartolo', text: 'CERTO! I contributi mensili sono il SEGRETO dei ricchi. Anche piccole somme regolari, investite costantemente, diventano una FORTUNA grazie all\'interesse composto!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: La formula magica:\nFV = PV × (1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]\n\nDove:\nPV = investimento iniziale\nPMT = contributo periodico\nr = tasso annuo\nt = anni\nn = volte che capita l\'interesse (12=mensile, 4=trimestrale, 1=annuale)\n\nPiù frequentemente capitalizza, meglio è!' },
        { who: 'bartolo', text: 'Prova il simulatore! Modifica i parametri e guarda il grafico crescere in tempo reale!' }
      ],
      lesson: 'IL SEGRETO: contributi regolari + tempo + compound interest = FORTUNA! 🧮\nCapitalizzazione mensile > annuale\nAnche €50/mese da giovani = cifre enormi da adulti!\nFormula: FV = PV(1+r/n)^(nt) + PMT×[((1+r/n)^(nt)-1)/(r/n)]',
      minigame: 'simulatore'
    },
    {
      id: 'debito',
      title: 'La Trappola dell\'Usuraio',
      icon: '⛓️',
      concept: 'Debito e interessi passivi',
      dialogue: [
        { who: 'lia', text: 'Oh no! Il mio carico di merce si è rovinato. Ho bisogno di €50 per ricomprare tutto...' },
        { who: 'tizio', text: 'Presto volentieri €50! Ma solo al 20% di interesse... al mese! 😈' },
        { who: 'lia', text: '20% al mese? Cosa significa?' },
        { who: 'bartolo', text: 'Significa che dopo un mese devi €60, dopo due mesi €72, poi €86,40... in 6 mesi più del doppio! Il DEBITO con interessi alti è una TRAPPOLA!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Il debito non è SEMPRE male. Un mutuo per una casa o un prestito per studiare possono essere buoni investimenti. Ma i debiti per comprare cose inutili a tassi alti sono PERICOLOSI!' },
        { who: 'bartolo', text: 'La regola: se il tasso d\'interesse è più alto di quanto guadagni, il debti ti mangia vivo! Schiva le cambiali e cerca modi onesti per guadagnare!' }
      ],
      lesson: 'IL DEBITO con tassi alti è una TRAPPOLA! ⛓️\nRegola: se il tasso è > del tuo guadagno, è pericoloso!\nDebiti buoni: mutuo casa, prestito studio.\nDebiti cattivi: prestiti a tassi usurai.',
      minigame: 'runner'
    },
    {
      id: 'diversificazione',
      title: 'Non Tutte le Uova...',
      icon: '🧺',
      concept: 'Diversificazione e rischio',
      dialogue: [
        { who: 'lia', text: 'Ho €200 di risparmi! Li metto tutti in una sola bottega di tessuti!' },
        { who: 'bartolo', text: 'FERMA! Se la bottega brucia, perdi TUTTO! Il saggio dice: "Non mettere tutte le uova in un solo paniere!" 🧺' },
        { who: 'lia', text: 'Cosa devo fare allora?' },
        { who: 'bartolo', text: 'DIVERSIFICA! Metti parte dei soldi nel tessuto, parte nell\'oro, parte in banca. Se un investimento fallisce, gli altri ti coprono!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Il RISCHIO è la possibilità di perdere. Il RENDIMENTO è quanto guadagni. Più alto è il rendimento, più alto è il rischio! Un portafoglio bilanciato mescola investimenti sicuri (basso rendimento) e più audaci (alto rendimento).' },
        { who: 'lia', text: 'Provo a mettere i miei soldi in tre cesti diversi!' }
      ],
      lesson: 'DIVERSIFICA = non mettere tutto in un posto! 🧺\nAlto rendimento = Alto rischio\nPortafoglio bilanciato = mix di sicuro + audace',
      minigame: 'cesti'
    },
    {
      id: 'inflazion',
      title: 'Battaglia Finale!',
      icon: '⚔️',
      concept: 'Inflazione e potere d\'acquisto',
      dialogue: [
        { who: 'inflazion', text: 'MUAHAHA! Sono il drago INFLAZION! 🐉 Il tuo denaro perde valore ogni giorno! €100 oggi valgono meno di €100 un anno fa!' },
        { who: 'lia', text: 'Il drago! È lui che sta rovinando il Regno!' },
        { who: 'bartolo', text: 'L\'INFLAZIONE è quando i prezzi salgono e il tuo denaro compra MENO cose. Se l\'inflazione è 5% e i tuoi soldi non crescono, perdi potere d\'acquisto!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Per VINCERE l\'inflazione, i tuoi investimenti devono rendere PIÙ dell\'inflazione! Se l\'inflazione è 3% e investi al 7%, guadagni il 4% "reale"! 🎯' },
        { who: 'inflazion', text: 'Non mi vincerai mai! Sono più potente di quanto pensi!' },
        { who: 'lia', text: 'Con tutto quello che ho imparato, ti sconfiggerò! Rispondi alle mie domande, drago!' }
      ],
      lesson: 'L\'INFLAZIONE mangia il valore del denaro! 🐉\nVinci se: rendimento > inflazione\nStrategia: investi, diversifica, risparmia!',
      minigame: 'boss'
    },
    {
      id: 'azioni',
      title: 'Le Azioni',
      icon: '📊',
      concept: 'Azioni e Borsa Valori',
      dialogue: [
        { who: 'lia', text: 'Voglio diventare proprietaria di un\'azienda! Ma come si fa?' },
        { who: 'bartolo', text: 'Comprando le AZIONI! 📊 Quando compri un\'azione, diventi PROPRIETARIO di una parte dell\'azienda. Se l\'azienda guadagna, guadagni anche tu!' },
        { who: 'lia', text: 'E se perde?' },
        { who: 'bartolo', text: 'Allora perdi anche tu! Il prezzo delle azioni sale e scende ogni giorno. Si chiama BORSA VALORI: è il mercato dove si comprano e vendono azioni.' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Le azioni ti danno due guadagni: 1) DIVIDENDI — parte dei profitti distribuita agli azionisti. 2) PLUSVALENZA — se compri a €10 e vendi a €15, guadagni €5! Ma attenzione: se scende a €5, perdi €5!' },
        { who: 'bartolo', text: 'La regola d\'oro:Compra azioni di aziende che conosci e di cui ti fidi. Non vendere nel panico! Il mercato sale e scende, ma nel lungo periodo tende a crescere.' }
      ],
      lesson: 'AZIONE = proprietà di un\'azienda! 📊\nGuadagni da: dividendi + plusvalenza\nRischio: il prezzo può scendere\nRegola: non vendere nel panico, pensa al lungo periodo!',
      minigame: 'azioni'
    },
    {
      id: 'etf',
      title: 'Gli ETF',
      icon: '🧩',
      concept: 'ETF e fondi indicizzati',
      dialogue: [
        { who: 'lia', text: 'Comprare azioni singole è rischioso... e se l\'azienda fallisce?' },
        { who: 'bartolo', text: 'Ecco la soluzione: gli ETF! 🧩 Un ETF è come un "CESTINO" che contiene MOLTE azioni insieme. Comprando un solo ETF, compri in realtà 100, 500, o anche 3000 azioni diverse!' },
        { who: 'lia', text: 'Un cestino di azioni? Come funziona?' },
        { who: 'bartolo', text: 'Un ETF跟踪 un INDICE. L\'indice S&P 500, per esempio, contiene le 500 aziende più grandi d\'America. Se compri un ETF S&P 500, investi in TUTTE quelle aziende con UN solo acquisto!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: I vantaggi degli ETF:\n✅ DIVERSIFICAZIONE automatica — non metti tutte le uova in un paniere\n✅ COSTI BASSI — commissione dello 0,03-0,20% annuo (vs 1-2% dei fondi tradizionali)\n✅ SEMPLICITÀ — compri una cosa sola e hai mille aziende\n✅ TRASPARENZA — sai esattamente cosa contiene' },
        { who: 'lia', text: 'Quindi è il modo migliore per iniziare ad investire!' },
        { who: 'bartolo', text: 'Per la maggior parte delle persone, SÌ! Anche Warren Buffett consiglia gli ETF a chi non ha tempo di studiare il mercato!' }
      ],
      lesson: 'ETF = Cestino di azioni! 🧩\nCompi UN acquisto → possiedi MOLTE aziende\nVantaggi: diversificazione + costi bassi + semplicità\nIdeale per principianti e investitori a lungo termine!',
      minigame: 'etf'
    },
    {
      id: 'obbligazioni',
      title: 'Le Obbligazioni',
      icon: '📜',
      concept: 'Obbligazioni e reddito fisso',
      dialogue: [
        { who: 'lia', text: 'Le azioni mi sembrano troppo nervose... voglio qualcosa di più tranquillo!' },
        { who: 'bartolo', text: 'Le OBBLIGAZIONI! 📜 Sono come ricevute di PRESTITO. Quando compri un\'obbligazione, presti soldi allo Stato o a un\'azienda. In cambio ti pagano un interesse fisso ogni anno e ti restituiscono i soldi alla fine!' },
        { who: 'lia', text: 'È come essere la banca!' },
        { who: 'bartolo', text: 'Esattamente! 💡 I tipi principali:\n🔹 OBBLIGAZIONI GOVERNATIVE — le più sicure (lo Stato non fallisce facilmente)\n🔹 OBLIGAZIONI CORPORATE — aziende, un po\' più rischiose ma pagano di più\n🔹 ZERO-COUPON — non pagano interessi ma costano meno e rendono tutto alla fine' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Il rapporto rischio-rendimento:\n🟢 Obbligazioni governative: basso rischio, 2-4% annuo\n🟡 Obbligazioni corporate: rischio medio, 3-6% annuo\n🔴 Azioni: alto rischio, 7-10% annuo medio\nUn portafoglio bilanciato ha sia AZIONI che OBBLIGAZIONI!' },
        { who: 'bartolo', text: 'Le obbligazioni sono il "fondo di sicurezza" del tuo portafoglio! Quando le azioni scendono, le obbligazioni spesso salgono.' }
      ],
      lesson: 'OBBLIGAZIONE = presti soldi e ricevi interessi! 📜\nSono più sicure delle azioni ma rendono meno\nUn portafoglio bilanciato = Azioni + Obbligazioni\nGovernative (sicure) vs Corporate (più rendimento)',
      minigame: 'cesti'
    },
    {
      id: 'tasse',
      title: 'Le Tasse',
      icon: '🏛️',
      concept: 'Tasse, servizi pubblici e fiscalità',
      dialogue: [
        { who: 'lia', text: 'Ho guadagnato €1000 al mercato! Finalmente posso tenerli tutti!' },
        { who: 'bartolo', text: 'Ehm... non proprio. Devi pagare le TASSE! 🏛️ Una parte dei tuoi guadagni va allo Stato per pagare strade, scuole, ospedali, polizia...' },
        { who: 'lia', text: 'Tutte?! Ma non è ingiusto?' },
        { who: 'bartolo', text: 'Lo Stato usa un sistema a SCAGLIONI: più guadagni, più paghi in percentuale. Ma c\'è una franchigia: i primi soldi NON vengono tassati!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Esempio di scaglioni:\n💚 Fino a €15.000: 23%\n💛 Da €15.001 a €28.000: 27%\n🧡 Da €28.001 a €50.000: 38%\n❤️ Oltre €50.000: 43%\n\nMa ci sono DETRAZIONI e DEDUZIONI che riducono le tasse! Esempio: chi ha figli paga meno, chi investe in pensione detrage parte dei soldi.' },
        { who: 'bartolo', text: 'Consiglio: tieni sempre documenti di tutte le spese. Le spese mediche, per la casa e per lo studio si possono detrarre!' }
      ],
      lesson: 'Le TASSE pagano i servizi pubblici! 🏛️\nSistema a scaglioni: più guadagni, più paghi\nDetrazioni = riduzioni legali sulle tasse\nTieni sempre le ricevute delle spese detraibili!',
      minigame: 'tasse'
    },
    {
      id: 'assicurazioni',
      title: 'Le Assicurazioni',
      icon: '🛡️',
      concept: 'Assicurazioni e gestione del rischio',
      dialogue: [
        { who: 'lia', text: 'Ho sentito che il vicino ha dovuto pagare €5000 per riparare il tetto! Che sfortuna...' },
        { who: 'bartolo', text: 'Ecco perché esistono le ASSICURAZIONI! 🛡️ Paghi una piccola quota ogni mese (PREMIO), e se succede qualcosa di grosso, paga l\'assicurazione!' },
        { who: 'lia', text: 'Ma io non ho bisogno di un\'assicurazione, vero?' },
        { who: 'bartolo', text: 'SBAGLIATO! Tutti hanno bisogno di almeno alcune assicurazioni. La regola è: assicurati contro i disastri che non puoi permetterti, NON per le piccole spese!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Le assicurazioni fondamentali:\n🏠 Casa — incendio, furto, danni idrici\n🏥 Salute — spese mediche gravi\n🚗 Auto — obbligatoria + copertura danni\n💰 Vita — protegge la tua famiglia\n\nNON assicurare: il telefono (risparmi il premio e mettili da parte)' },
        { who: 'bartolo', text: 'La formula magica: FRANCHIGIA alta = premio basso. Se riesci a pagare €500 di tasca tua in caso di sinistro, scegli una franchigia alta e risparmi sul premio!' }
      ],
      lesson: 'ASSICURAZIONE = paghi poco per evitare disastri! 🛡️\nAssicurati contro i danni grossi, non le piccole spese\nFranchigia alta = premio basso\nFondamentali: casa, salute, auto, vita',
      minigame: 'assicurazioni'
    },
    {
      id: 'pensioni',
      title: 'Pianifica la Pensione',
      icon: '🏖️',
      concept: 'Pensione, risparmio a lungo termine e compound interest',
      dialogue: [
        { who: 'lia', text: 'Sono giovane! La pensione è lontanissima, perché devo pensarci ora?' },
        { who: 'bartolo', text: 'PERCHÉ IL TEMPO È IL TUO MIGLIOR AMICO! 🕐 Se inizi a risparmiare a 25 anni invece che a 40, con l\'interesse composto avrai il DOPPIO dei soldi!' },
        { who: 'lia', text: 'Davvero? Ma quanto devo mettere da parte?' },
        { who: 'bartolo', text: 'La regola del 10-15%: metti da parte almeno il 10-15% di quello che guadagni, OGNI mese, fin da giovane. Investilo in un mix di azioni e obbligazioni!' },
        { who: 'contabilia', text: '📚 SCHEDA DELLA MAGA: Esempio reale:\n🧑 Marco inizia a 25 anni: €200/mese al 7% medio\n👴 A 65 anni ha: €525.000!\n\n🧑 Luca inizia a 35 anni: €200/mese al 7% medio\n👴 A 65 anni ha: €244.000!\n\n10 anni di ritardo = MENO la metà! Il compound interest premia chi inizia prima!' },
        { who: 'bartolo', text: 'Consiglio pratico: appena ricevi lo stipendio, TRASFERISCI il 10-15% sul conto risparmi/investimenti PRIMA di spendere. Paga prima te stesso!' },
        { who: 'lia', text: 'Pagare prima se stessi... è come mettere i soldi in salvo prima che il drago Inflazion li mangi!' }
      ],
      lesson: 'PAGA PRIMA TE STESSO! 🏖️\nMetti da parte il 10-15% OGNI mese\nIniziare a 25 anni ≠ iniziare a 40: il compound interest è potentissimo\nOggi: €200/mese → Pensione: €500.000+!',
      minigame: 'pensioni'
    }
  ]
};
