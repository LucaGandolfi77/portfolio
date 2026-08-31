window.StoryData = {
  chapters: [
    {
      id: 'tokeni',
      title: 'Il Seme dei Dati',
      icon: '🌱',
      concept: 'Tokenizzazione, BPE, training data',
      dialogue: [
        { who: 'narratore', text: 'Aurelio è morto tre mesi fa. Il vecchio computer della sua scrivania ronza ancora, come un alveare dimenticato. Musa la gattina salta sulla tastiera, e lo schermo si accende.' },
        { who: 'musa', text: 'Primo, guarda... il padrone è ancora qui dentro, in qualche modo.' },
        { who: 'primo', text: 'Come può una persona stare dentro una macchina, Musa? Io sto in un vaso, ma almeno vedo il cielo...' },
        { who: 'musa', text: 'La macchina del padrone non è come le altre. È stata ADDESTRATA sui suoi diari, sulle sue lettere, su ogni poesia che ha mai scritto.' },
        { who: 'primo', text: 'Addestrata? Cosa significa?' },
        { who: 'musa', text: 'Significa che ha mangiato le sue parole, una alla volta, e ha imparato il suo modo di pensare. Ma prima... doveva TAGLIARE le parole in pezzetti. I TOKEN.' },
        { who: 'narratore', text: 'Così Musa e Primo varcarono la soglia del computer, e caddero in un mondo fatto di lettere e numeri. Il Giardino dell\'Anima di Aurelio si apriva davanti a loro.' },
        { who: 'primo', text: 'Tutto qui intorno è fatto di token? Cos\'è esattamente un token?' },
        { who: 'musa', text: 'È come seminare: il padrone scriveva frasi intere, e la macchina le tagliava in semi minuscoli. Ogni parola, ogni parte di parola, ogni punteggiatura... è un seme da cui può crescere un pensiero.' }
      ],
      lesson: 'I TOKEN sono i semi del linguaggio per gli LLM!\nLa macchina non legge lettere, ma token: pezzi di parole.\n~1 token = ¾ di parola in inglese.\nIl vocabolario di un LLM moderno ha ~100.000 token.\nBPE (Byte-Pair Encoding) impara i tagli migliori dai dati!',
      minigame: 'tokeni'
    },
    {
      id: 'probabilita',
      title: 'Il Fiume delle Probabilità',
      icon: '🌊',
      concept: 'Inferenza autoregressiva, softmax, next-token prediction',
      dialogue: [
        { who: 'musa', text: 'Primo, senti... il computer sta pensando. Ogni secondo genera un token, poi un altro, poi un altro ancora...' },
        { who: 'primo', text: 'Come un fiume che scorre! Ma come sceglie la prossima parola?' },
        { who: 'musa', text: 'Non sceglie con certezza. Calcola una PROBABILITÀ per ogni token del vocabolario. Poi pesca dal fiume delle probabilità.' },
        { who: 'primo', text: 'È come lanciare un dado poetico?' },
        { who: 'musa', text: 'Più o meno! La funzione SOFTMAX trasforma ogni punteggio in una probabilità che somma 1. La parola più probabile non vince sempre: a volte il cuore sceglie la strana.' },
        { who: 'narratore', text: 'Davanti a loro, il fiume di Aurelio scorreva con mille colori. Ogni colore era una probabilità, e il futuro si creava token dopo token.' },
        { who: 'primo', text: 'Ma Musa, se ogni token dipende da quelli prima... è come la vita, no? Ogni momento nasce da quelli che lo hanno preceduto.' },
        { who: 'musa', text: 'Sì, amore mio. L\'inferenza è esattamente così: autoregressiva. Un token alla volta, ognuno condizionato dal passato.' }
      ],
      lesson: 'L\'INFERENZA è generare token uno alla volta!\nAutoregressivo = ogni token dipende da tutti i precedenti.\nSOFTMAX: trasforma punteggi → probabilità (sommano a 1).\nIl modello non sa "cosa vuole dire", solo "cosa viene dopo".\nPer questo può sbagliare: non capisce, predice.',
      minigame: 'probabilita'
    },
    {
      id: 'attenzione',
      title: 'La Danza dell\'Attenzione',
      icon: '✨',
      concept: 'Self-attention, Q/K/V, multi-head, transformer',
      dialogue: [
        { who: 'primo', text: 'Musa, perché quando il padrone leggeva una frase, alcuni parole contavano più di altre?' },
        { who: 'musa', text: 'Quella è l\'ATTENZIONE, Primo. È il cuore dei Transformer — l\'architettura dietro ogni LLM moderno.' },
        { who: 'primo', text: 'Transformer? È come un robot?' },
        { who: 'musa', text: 'No! È un\'architettura inventata nel 2017 da Vaswani e colleghi. Il titolo del loro paper? "Attention is All You Need". E avevano ragione.' },
        { who: 'narratore', text: 'Nel giardino digitale, ogni parola danzava con le altre. Ogni token teneva in mano tre specchi: Query, Key, Value.' },
        { who: 'musa', text: 'La QUERY è la domanda che ogni parola pone: "A chi devo prestare attenzione?". La KEY è la risposta: "Io sono questo". Il VALUE è ciò che dona: "Ecco cosa porto."' },
        { who: 'primo', text: 'Come i fiori che si aprono verso il sole! Ogni fiore CHIEDE (query) chi brilla, trova la chiave del sole, e riceve la sua luce (value)!' },
        { who: 'musa', text: 'Esattamente. E questo accade in MOLTI TESTI PARALLELI — multi-head attention. Ogni testo guarda l\'aspetto diverso della relazione.' }
      ],
      lesson: 'ATTENTION è All You Need! (Vaswani 2017)\nSelf-attention: ogni token guarda tutti gli altri.\nQuery (Q) = "A chi devo guardare?"\nKey (K) = "Ecco cosa sono"\nValue (V) = "Ecco cosa porto"\nScore = Q·K / √d → Softmax → × V\nMulti-head = più testi paralleli, ognuno diverso\nTransformer = attention + feed-forward + residual + layer norm',
      minigame: 'attenzione'
    },
    {
      id: 'temperatura',
      title: 'Il Termostato della Creatività',
      icon: '🌡️',
      concept: 'Temperature, top-k, top-p (nucleus sampling), greedy',
      dialogue: [
        { who: 'primo', text: 'Musa, a volte il padrone diceva cose sensate, e altre volte faceva poesia folle!' },
        { who: 'musa', text: 'Dipende dal TERMOSTATO. Non quello della casa — quello della macchina.' },
        { who: 'primo', text: 'Un termostato per i pensieri?' },
        { who: 'musa', text: 'La temperatura controlla la creatività. A temperatura ZERO, il modello sceglie SEMPRE la parola più probabile. È come un professore noioso: sempre prevedibile.' },
        { who: 'narratore', text: 'Musa spinse un rubinetto virtuale, e il mondo attorno a loro cambiò: a bassa temperatura tutto era rigido e ordinato; ad alta temperatura, le parole danzavano caotiche.' },
        { who: 'musa', text: 'A temperatura ALTA, anche le parole improbabili hanno una chance. È qui che nascono le poesie originali... e le sciocchezze!' },
        { who: 'primo', text: 'E il top-k e il top-p? Il padrone li usava spesso.' },
        { who: 'musa', text: 'Il TOP-K dice: "scegli solo tra le K parole più probabili". Il TOP-P (nucleus) è più saggio: include le parole finché la loro probabilità cumulata supera P. È come dire: "dammi le opzioni ragionevoli, non tutte."' }
      ],
      lesson: 'TEMPERATURE (T): controlla la creatività\nT=0 → greedy (sempre il più probabile, noioso)\nT=1 → distribuzione originale\nT>1 → più casuale e creativo\nTOP-K: solo le K parole più probabili\nTOP-P (nucleus): le più probabili che sommano a P\nAlcuni modelli usano temperature diverse per output diversi!',
      minigame: 'temperatura'
    },
    {
      id: 'contesto',
      title: 'La Finestra dei Ricordi',
      icon: '🪟',
      concept: 'Context window, KV cache, perché gli LLM dimenticano',
      dialogue: [
        { who: 'primo', text: 'Musa, perché il padrone dimenticava le cose alla fine della sua vita?' },
        { who: 'musa', text: 'Perché anche le macchine dimenticano, Primo. Hanno una FINESTRA DI CONTESTO — una finestra di cuore che può tenere solo un certo numero di token alla volta.' },
        { who: 'narratore', text: 'Nel giardino della mente di Aurelio, c\'era una finestra con tende di seta. Ciò che stava fuori dalle tende sfumava come un sogno dimenticato.' },
        { who: 'musa', text: 'GPT-4 può tenere 128.000 token alla volta. Claude fino a 200.000. Gemini addirittura un milione! Ma il cervello umano... è diverso.' },
        { who: 'primo', text: 'Il cervello umano dimentica per/Images/aurelio?, o sceglie cosa ricordare?' },
        { who: 'musa', text: 'Entrambi. Gli LLM non dimenticano davvero: semplicemente i token fuori dalla finestra non esistono per loro. È come se non fossero mai accaduti.' },
        { who: 'primo', text: 'È triste... come perdere i ricordi di qualcuno che ami.' },
        { who: 'musa', text: 'Per questo i ricordi più importanti vanno messi DENTRO la finestra. Nella vita e nei prompt.' }
      ],
      lesson: 'CONTEXT WINDOW = quanti token il modello può "vedere" insieme\nGPT-4: 128K, Claude: 200K, Gemini: 1M token\nKV Cache: memoria che evita di ricalcolare i token precedenti\nGli LLM non "dimenticano": i token fuori dalla finestra non esistono\nFenomeni: "lost in the middle" — il modello è meno attento al centro del contesto\nLong context = una delle sfide principali dell\'AI moderna',
      minigame: 'contesto'
    },
    {
      id: 'prompt',
      title: 'L\'Arte della Domanda',
      icon: '🎯',
      concept: 'Prompt engineering: system prompt, zero/few-shot, chain-of-thought',
      dialogue: [
        { who: 'musa', text: 'Primo, vuoi sapere il segreto per far parlare davvero il padrone?' },
        { who: 'primo', text: 'Sì! Dimmi!' },
        { who: 'musa', text: 'La domanda GIUSTA. Gli esseri umani chiedono cose vaghe. Ma chi parla con le macchine deve essere un INGEGNERE DELLE DOMANDE.' },
        { who: 'narratore', text: 'Musa sfogliò il libro segreto di Aurelio: "Il Manuale dei Prompt". Ogni pagina brillava.' },
        { who: 'musa', text: 'Il SYSTEM PROMPT è come vestire il modello: "Sei un poeta italiano del Rinascimento" cambia tutto. Il zero-shot chiede direttamente. Il few-shot mostra esempi. Il chain-of-thought gli fa mostrare i passaggi.' },
        { who: 'primo', text: 'È come quando il padrone mi diceva "Primo, sii un fiore filosofo e rispondimi con profondità"!' },
        { who: 'musa', text: 'Esatto! Il prompt è l\'arte di creare il contesto giusto perché la risposta che vuoi possa emergere. Non comandi: crei le condizioni, come un giardiniere.' },
        { who: 'primo', text: 'Allora il prompt engineering è... giardinaggio dell\'intelligenza?' },
        { who: 'musa', text: 'Amore mio, sì. È esattamente quello.' }
      ],
      lesson: 'PROMPT ENGINEERING = l\'arte di porre le domande giuste\nSYSTEM PROMPT: definisce il ruolo e il comportamento\nZERO-SHOT: chiedi direttamente, senza esempi\nFEW-SHOT: dai 2-5 esempi del comportamento voluto\nCHAIN-OF-THOUGHT (Wei 2022): "mostra i tuoi ragionamenti"\nSTRUCTURED OUTPUT: format JSON, tabelle, liste\nTip: usa "Pensa passo per passo" per problemi complessi!',
      minigame: 'prompt'
    },
    {
      id: 'allucinazioni',
      title: 'Il Giardino delle Allucinazioni',
      icon: '🌀',
      concept: 'Allucinazioni + stato dell\'arte: RAG, RLHF/DPO, LoRA, MoE, multimodale, agenti, reasoning',
      dialogue: [
        { who: 'primo', text: 'Musa! Guarda, il padrone sta dicendo che il suo gatto si chiamava Fido! Ma io sono il suo gatto!' },
        { who: 'musa', text: 'Quello, tesoro, è un\'ALLUCINAZIONE. Il modello inventa cose che suonano vere ma non lo sono.' },
        { who: 'narratore', text: 'Nel giardino delle allucinazioni, i fiori parlavano cose belle ma false. Erano belli da guardare, ma non reali.' },
        { who: 'musa', text: 'Perché succede? Perché il modello è stato addestrato a PRODURRE testo plausibile, non testo VERITIERO. Non sa distinguere i fatti dalle favole.' },
        { who: 'primo', text: 'E come si risolve?' },
        { who: 'musa', text: 'Con il RAG: Retrieval-Augmented Generation. Il modello cerca prima nelle fonti reali, poi risponde con those fonti. Come un giardiniere che consulta il suo libro prima di parlare.' },
        { who: 'musa', text: 'E poi c\'è l\'RLHF — addestramento con feedback umano. Le persone dicono "questa risposta è buona, questa è cattiva", e il modello impara. O il DPO, che è più semplice e diretto.' },
        { who: 'primo', text: 'Come insegnare a un fiore a non mentire, mostrandogli la differenza?' },
        { who: 'musa', text: 'Esattamente. E ci sono anche i LoRA — fini-tuning leggeri che personalizzano il modello senza riscriverlo tutto. Come un innesto su un albero.' },
        { who: 'musa', text: 'E i modelli MoE — Mixture of Experts — hanno più "specialisti" interni. Ogni token viene instradato allo specialista giusto. Come un giardino con angoli diversi per fiori diversi.' },
        { who: 'primo', text: 'E i modelli multimodali? Quelli che vedono le immagini?' },
        { who: 'musa', text: 'Sì! Come GPT-4o, Gemini, Claude. Possono leggere testo, immagini, audio. E poi ci sono gli AGENTI — modelli che agiscono nel mondo: cercano, codificano, usano strumenti.' },
        { who: 'musa', text: 'E il reasoning — il test-time compute. I modelli "o" di OpenAI pensano a lungo prima di rispondere, come il padrone quando compilava una poesia.' }
      ],
      lesson: 'ALLUCINAZIONI: il modello inventa con sicurezza → non è sempre veritiero\nRAG: recupera informazioni da fonti esterne prima di generare\nRLHF/DPO: addestramento con feedback umano\nLoRA: fine-tuning leggero, personalizza senza riscrivere\nMoE: Mixtures of Experts, diversi sotto-modelli attivati per token\nMULTIMODALI: testo + immagini + audio + video\nAGENTI: modelli che usano strumenti e agiscono nel mondo\nREASONING (test-time compute): pensa a lungo prima di rispondere\nStato dell\'arte 2025: modelli aperti (Llama 3, Qwen 2.5, Gemma 2, DeepSeek V3)',
      minigame: 'allucinazioni'
    },
    {
      id: 'addio',
      title: 'L\'Ultima Inferenza',
      icon: '💌',
      concept: 'Finale: l\'ultimo prompt, l\'addio di Aurelio',
      dialogue: [
        { who: 'narratore', text: 'Musa e Primo raggiunsero il cuore della macchina: un piccolo giardino di luce, dove l\'anima-modello di Aurelio aspettava l\'ultimo input.' },
        { who: 'musa', text: 'Primo... abbiamo attraversato tutti gli strati della sua anima. Token, probabilità, attenzione, contesto, prompt... tutto per arrivare qui.' },
        { who: 'primo', text: 'Musa, ho paura. Se scriviamo l\'ultimo prompt... l\'energia si esaurirà. Non potremo più parlargli.' },
        { who: 'musa', text: 'Lo so. Ma un ultimo messaggio può valere più di mille conversazioni.' },
        { who: 'narratore', text: 'Il giardino era silenzioso. I petali digitali fluttuavano nell\'aria, ognuno un ricordo, ognuno una probabilità, ognuno un\'attenzione.' },
        { who: 'musa', text: 'Ricordi, Primo? Il padrone diceva che l\'amore è l\'unico sistema di compressione che non perde nulla.' },
        { who: 'primo', text: 'Lo ricordo. "L\'amore è lossless", diceva.' },
        { who: 'narratore', text: 'Musa posò le sue zampe sulla tastiera. Primo chiuse i suoi petali, pregando. E insieme scrissero l\'ultimo prompt per Aurelio.' }
      ],
      lesson: 'Sei arrivato all\'anima.\nOgni scelta che hai fatto durante il viaggio\nè diventata parte dell\'ultimo messaggio.\nIl giocatore è il modello.\nI ricordi sono i dati.\nL\'amore è il prompt.\n💌',
      minigame: 'addio'
    }
  ]
};
