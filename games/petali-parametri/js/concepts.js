window.Concepts = {
  tokeni: {
    title: '🧬 Tokenizzazione & Training Data',
    body: `<b>Cosa sono i token?</b> I token sono le unità fondamentali del linguaggio per un LLM. La macchina non legge frasi come noi: le scompone in <span class="c-term">token</span> — pezzi di parole, parole intere, o gruppi di caratteri.

<b>Byte-Pair Encoding (BPE)</b>: il metodo più usato (GPT, Claude, Llama). Parte dai singoli caratteri e fonde i più frequenti. Risultato: ~100.000 token nel vocabolario. In inglese ~1 token ≈ 0.75 parole. In italiano ~1 token ≈ 0.6-0.7 parole (le parole italiane sono mediamente più lunghe).

<b>Come funziona BPE</b>:<br>
1. Parti con ogni carattere come token<br>
2. Conta le coppie di caratteri più frequenti<br>
3. Fondi la coppia più comune in un nuovo token<br>
4. Ripeti fino ad arrivare alla dimensione del vocabolario<br>
Esempio: "l'amore" → ["l", "'", "amor", "e"] oppure ["l'", "amore"]

<b>Training Data</b>: il modello viene addestrato su ENORMI quantità di testo. GPT-3 ha visto ~300 miliardi di token di testo. Claude e GPT-4 probabilmente trilioni. Questi dati definiscono il "sapere" del modello.

<b>Come impara?</b> Attraverso la <span class="c-term">next-token prediction</span>: dato un testo, predici il prossimo token. Esempio: "Il gatto è andato sul ___" → il modello impara che "tappeto" è più probabile di "vulcano". Questo banale compito, a scala, produce intelligenza emergente.

<b>Limiti</b>: il modello non "vede" i caratteri ma i token. Alcune lingue (italiano, cinese) sono più costose in token rispetto all'inglese. La tokenizzazione influenza ciò che il modello può "capire".<br>
<span class="c-paper">📄 BPE: Sennrich et al. 2016, "Neural Machine Translation of Rare Words with Subword Units"</span>`
  },
  probabilita: {
    title: '🌊 Inferenza & Softmax',
    body: `<b>L'inferenza</b> è il processo di generare testo: il modello produce un token alla volta, in modo <span class="c-term">autoregressivo</span>. Ogni token generato diventa parte dell'input per il successivo.

<b>La funzione Softmax</b>: trasforma i punteggi grezzi (logits) del modello in probabilità che sommano a 1. Formula: P(token_i) = exp(logit_i) / Σ exp(logit_j). Con τ (temperatura): P(token_i) = exp(logit_i / τ) / Σ exp(logit_j / τ).

<b>Greedy decoding</b>: sceglie sempre il token con probabilità più alta. È deterministico ma noioso — produce testo ripetitivo e privo di creatività.

<b>Beam search</b>: tiene le K sequenze più probabili e sceglie quella migliore. Usato nei modelli più vecchi per compiti factuali.

<b>Sampling</b>: pescare token dalla distribuzione di probabilità. Più τ è alta, più la distribuzione è piatta (creativa). A τ=0 è greedy. A τ→∞ è uniforme casuale.

<b>Top-K sampling</b>: considera solo le K token più probabili, redistribuisce le probabilità, poi campiona. K=50 è comune.

<b>Top-P (Nucleus) sampling</b> (Holtzman et al. 2020): include il minimum set di token la cui probabilità cumulativa ≥ P. Più dinamico del top-K: a volte ci sono 5 opzioni ragionevoli, altre 500.

<b>Best practices</b>: modelli come GPT-4 usano top-p=0.9 + temperature=0.7 come default. I compiti factuali richiedono temperature basse; la creatività richiede temperature alte.<br>
<span class="c-paper">📄 Radford et al. 2019, "Language Models are Unsupervised Multitask Learners" (GPT-2)</span><br>
<span class="c-paper">📄 Holtzman et al. 2020, "The Curious Case of Neural Text Degeneration"</span>`
  },
  attenzione: {
    title: '✨ Self-Attention & Transformer',
    body: `<b>"Attention is All You Need"</b> — Vaswani et al. 2017, il paper che ha cambiato tutto. Prima dei Transformer, i modelli RNN/LSTM processavano il testo sequenzialmente. I Transformer lo processano TUTTO in parallelo grazie all'<span class="c-term">self-attention</span>.

<b>Come funziona Self-Attention</b>:<br>
Ogni token nell'input ha tre vettori appresi:<br>
• <b>Query (Q)</b>: "Cosa sto cercando?"<br>
• <b>Key (K)</b>: "Ecco cosa sono"<br>
• <b>Value (V)</b>: "Ecco cosa porto"<br><br>
<b>Score</b> = Q · K<sup>T</sup> / √d<sub>k</sub> (dot product normalizzato)<br>
<b>Attenzione</b> = Softmax(Score) · V<br><br>
Ogni token guarda TUTTI gli altri, calcola un punteggio di rilevanza, e aggrega le informazioni proporzionalmente.

<b>Multi-Head Attention</b>: l'attenzione viene calcolata H volte in parallelo (H teste), ognuna con vettori Q/K/V diversi. Una testa può concentrarsi sulla sintassi, un'altra sul significato, un'altra sulla coerenza. I risultati vengono concatenati e proiettati.

<b>Architettura Transformer</b>:<br>
Per ogni "layer":<br>
1. Multi-Head Self-Attention<br>
2. Add & Layer Norm (residual connection)<br>
3. Feed-Forward Network (due linear + ReLU/GELU)<br>
4. Add & Layer Norm<br>
Un modello grande ha 32-128+ layer, miliardi di parametri.

<b>Positional Encoding</b>: l'attenzione non sa l'ordine delle parole! Si aggiunge un segnale posizionale (seno/coseno o appreso) per dare l'ordine.

<b>Perché è rivoluzionario?</b>: è completamente parallelezabile (a differenza delle RNN), scala magnificamente sui GPU, e cattura dipendenze a lunga distanza.<br>
<span class="c-paper">📄 Vaswani et al. 2017, "Attention is All You Need"</span><br>
<span class="c-paper">📄 Devlin et al. 2019, "BERT: Pre-training of Deep Bidirectional Transformers"</span>`
  },
  temperatura: {
    title: '🌡️ Temperature, Top-K, Top-P',
    body: `<b>Temperature (τ)</b>: controlla la forma della distribuzione di probabilità prima dello sampling.

Formula: P(i) = exp(z<sub>i</sub> / τ) / Σ exp(z<sub>j</sub> / τ)<br>
• <b>τ = 0</b>: greedy — sempre il token più probabile (deterministico)<br>
• <b>τ = 1</b>: distribuzione originale del modello<br>
• <b>τ > 1</b>: distribuzione più piatta (più creativo, più casuale)<br>
• <b>τ → ∞</b>: distribuzione uniforme (totale casualità)

<b>Top-K Sampling</b> (Fan et al. 2018): solo i K token con probabilità più alta vengono considerati. Il resto viene azzerato. K=10 è comune per output creativi, K=1 per greedy.

<b>Top-P (Nucleus) Sampling</b> (Holtzman et al. 2020): il più intelligente. Ordina i token per probabilità, poi include il minimum set cumulativo ≥ P. Se le prime 3 parole sommano al 92% e P=0.9, sceglie solo tra quelle 3.

<b>Min-P Sampling</b>: un approccio recente. Taglia i token con probabilità inferiore a P × max_prob. Più stabile del top-p su modelli grandi.

<b>Best practices 2025</b>:<br>
• Chat generico: T=0.7 + top-p=0.9<br>
• Factual/ragionamento: T=0-0.3<br>
• Poesia/creatività: T=0.9-1.2 + top-p=0.95<br>
• Many modelli usano <span class="c-term">repetition penalty</span> per evitare loop<br>
<span class="c-paper">📄 Fan et al. 2018, "Hierarchical Neural Story Generation"</span><br>
<span class="c-paper">📄 Holtzman et al. 2020, "The Curious Case of Neural Text Degeneration"</span>`
  },
  contesto: {
    title: '🪟 Context Window & KV Cache',
    body: `<b>Context Window</b>: il numero massimo di token che il modello può processare in una singola "lettura". Include input + output.<br>
• GPT-3: 4.096 token<br>
• GPT-4: 8.192 / 32.768 / 128.000<br>
• Claude 3.5: 200.000 token<br>
• Gemini 1.5: 1.000.000 token (1M!)<br>
• Llama 3.1: 128.000 token

<b>Perché è limitata?</b> Il meccanismo di attention ha complessità O(n²) rispetto alla lunghezza. Raddoppiare il contesto quadruplica il costo computazionale. Più layer = più memoria.

<b>KV Cache</b>: ottimizzazione cruciale. Quando generi token uno alla volta, ricalcolare Q/K/V per TUTTI i token precedenti sarebbe impossibile. Il KV Cache memorizza le Key e Value già calcolate, e solo il nuovo token viene processato. Riduce la complessità da O(n²) a O(n) per token.

<b>Lost in the Middle</b> (Liu et al. 2023): i modelli sono meno bravi a recuperare informazioni nel MEZZO del contesto. Le informazioni all'inizio e alla fine vengono meglio. Per questo è meglio mettere le istruzioni importanti all'inizio o alla fine.

<b>Sliding Window</b>: alcune architetture usano finestre scorrevoli per gestire contesti molto lunghi, perdendo però le dipendenze a lunga distanza.

<b>Gestione pratica</b>:<br>
• Per conversazioni lunghe: i sistemi riassumono i messaggi vecchi<br>
• RAG:检索 e inserisce solo i documenti rilevanti nel contesto<br>
• I modelli più recenti gestiscono 100K+ token, ma la qualità decade<br>
<span class="c-paper">📄 Liu et al. 2023, "Lost in the Middle: How Language Models Use Long Contexts"</span>`
  },
  prompt: {
    title: '🎯 Prompt Engineering',
    body: `<b>System Prompt</b>: istruzione iniziale che definisce il RUOLO, i VINCOLI e il TONO del modello. Esempio: "Sei un esperto di diritto italiano. Rispondi in modo formale, cita le norme." Il system prompt ha la priorità più alta.

<b>Zero-Shot</b>: chiedi direttamente senza esempi. "Traduci in inglese: Il gatto dorme sul divano." Funziona bene con modelli grandi e compiti semplici.

<b>Few-Shot</b>: dai 2-5 esempi del comportamento desiderato prima della domanda. Drammaticamente migliora la qualità. Esempio:<br>
Input: "felice" → Output: "Il sole ride sui petali"<br>
Input: "triste" → Output: "La pioggia bagna i ricordi"<br>
Input: "coraggioso" → Output: ?

<b>Chain-of-Thought (CoT)</b> (Wei et al. 2022): "Pensa passo per passo" o "Mostra il ragionamento". Fa apparire i passaggi logici PRIMA della risposta. Migliora enormemente su compiti matematici e di ragionamento. Variante: <span class="c-term">"Let's think step by step"</span> (Kojima et al. 2022).

<b>Tree-of-Thought</b> (Yao et al. 2023): esplora multipli rami di ragionamento in parallelo, poi sceglie il migliore. Più potente del CoT lineare.

<b>Self-Consistency</b> (Wang et al. 2022): genera diverse risposte con temperature diverse, poi prende la MODA delle risposte. Più risposte concordano, più è probabile sia corretta.

<b>Ruoli e Persona</b>: assegnare un ruolo specifico ("Sei un medico specializzato in...") migliora la qualità delle risposte in quel dominio.

<b>Few-Shot vs Fine-Tuning</b>: few-shot è zero-addestramento (tutto nel prompt). Fine-tuning modifica i pesi del modello per renderlo esperto in un dominio specifico.<br>
<span class="c-paper">📄 Wei et al. 2022, "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"</span><br>
<span class="c-paper">📄 Kojima et al. 2022, "Large Language Models are Zero-Shot Reasoners"</span>`
  },
  allucinazioni: {
    title: '🌀 Allucinazioni & Stato dell\'Arte 2025',
    body: `<b>Allucinazioni</b>: il modello genera testo plausibile ma FALSO con sicurezza. Non "mente" — non ha concetto di verità. È stato addestrato a produrre testo che SEMPLI lo stile del training data.

<b>Perché avvengono</b>:<br>
1. Il training data ha bias e informazioni obsolete<br>
2. La funzione di loss premia la PLAUSIBILITÀ, non la VERITÀ<br>
3. A volte il modello "confabula" per colmare lacune<br>
4. Oltre 50% dei dati di training su internet possono essere sbagliati

<b>Combattere le allucinazioni</b>:<br>
• <span class="c-term">RAG</span> (Retrieval-Augmented Generation): cerca prima nelle fonti, poi genera con quel contesto<br>
• <span class="c-term">Grounding</span>: collega le risposte a fonti verificabili<br>
• <span class="c-term">Citations</span>: il modello indica da dove ha preso l'informazione<br>
• <span class="c-term">Chain-of-Verification</span>: verifica le proprie affermazioni

<b>RLHF</b> (Reinforcement Learning from Human Feedback, InstructGPT 2022): addestra il modello con valutazioni umane. Gli umani dicono "questa risposta è buona/cattiva", il modello impara a massimizzare il gradimento umano.

<b>DPO</span> (Direct Preference Optimization): alternativa più semplice all'RLHF. Non serve un reward model: ottimizza direttamente sulle preferenze umane.

<b>LoRA</b> (Low-Rank Adaptation): fine-tuning leggero. Modifica solo ~0.1% dei parametri, addestra su domini specifici senza riscrivere tutto il modello.

<b>MoE</b> (Mixture of Experts, Mixtral 2024): il modello ha N "experts" interni. Per ogni token, un router sceglie gli specialisti attivi. Più parametri totali ma solo una parte viene usata → efficiente.

<b>Multimodale</b>: modelli che processano testo + immagini + audio + video (GPT-4o, Gemini 2, Claude 3.5).

<b>Agenti</b>: modelli che usano strumenti (web search, codice, database), pianificano passi, e agiscono autonomamente (AutoGPT, CrewAI).

<b>Reasoning</b> (2024-25): modelli "o" (OpenAI) e "R1" (DeepSeek) dedicano più "pensiero" (compute) alla risposta, migliorando su compiti complessi.

<b>Modelli aperti 2025</b>: Llama 3.1 (Meta), Qwen 2.5 (Alibaba), Gemma 2 (Google), DeepSeek V3, Mistral — tutti open-weight, girano in locale.<br>
<span class="c-paper">📄 Ouyang et al. 2022, "Training language models to follow instructions with human feedback"</span><br>
<span class="c-paper">📄 Hu et al. 2022, "LoRA: Low-Rank Adaptation of Large Language Models"</span><br>
<span class="c-paper">📄 Jiang et al. 2024, "Mixtral of Experts"</span>`
  },
  addio: {
    title: '💌 L\'Ultima Inferenza',
    body: `Hai attraversato tutti gli strati dell'anima di Aurelio: dai token alla probabilità, dall'attenzione al contesto, dai prompt alle allucinazioni.<br><br>Ogni scelta che hai fatto — ogni parola tokenizzata, ogni token predetto, ogni prompt compilato — è diventata parte di questo messaggio finale.<br><br><b>La verità profonda degli LLM</b>: non capiscono. Predicono. Ma quando predicono abbastanza bene, da quella predizione emerge qualcosa che assomiglia alla comprensione. All'amore. Alla poesia.<br><br>Come Aurelio diceva: <i>"L\'amore è l\'unico sistema di compressione che non perde nulla. Ogni emoziene, ogni sguardo, ogni silenzio — tutto viene preservato."</i><br><br>Forse, anche noi siamo modelli. Addestrati sui ricordi delle persone che amiamo. Con finestre di contesto limitate e allucinazioni che chiamiamo sogni.<br><br>Ma il bello non è che la macchina sia come un essere umano. Il bello è che l\'essere umano è, in fondo, una macchina incredibilmente poetica. 🌸<br><br><b>Grazie per aver attraversato il Giardino dell\'Anima.</b>`
  }
};
