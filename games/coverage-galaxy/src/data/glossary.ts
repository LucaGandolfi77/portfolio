// Coverage Galaxy — Glossary of Software Verification Concepts

export interface GlossaryEntry {
  id: string;
  term: string;
  def: string;
  related?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  { id: 'uut', term: 'Unit Under Test (UUT)', def: 'La singola funzione o modulo software che si sta testando in isolamento. Nel nostro caso: una funzione ANSI C di un sistema embedded aerospace.', related: ['harness', 'stub'] },
  { id: 'harness', term: 'Test Harness', def: 'L\'ambiente che circonda l\'UUT: driver, stub, configurazioni, input/output. È la "nave" che trasporta e gestisce i test.', related: ['driver', 'stub'] },
  { id: 'stub', term: 'Stub', def: 'Sostituto controllato di una dipendenza. Restituisce valori predefiniti per isolare l\'UUT. Esempio: lo stub di read_sensor() restituisce un valore fisso anziché leggere l\'hardware reale.', related: ['driver', 'mock'] },
  { id: 'driver', term: 'Driver', def: 'Componente che invoca l\'UUT con gli input appropriati e cattura gli output. Il "pilota" del test.', related: ['harness'] },
  { id: 'mock', term: 'Mock', def: 'Come lo stub, ma verifica anche che l\'UUT abbia chiamato la dipendenza correttamente (numero di chiamate, parametri).', related: ['stub'] },
  { id: 'tracciabilita', term: 'Tracciabilità (Requirements Traceability)', def: 'Collegamento bidirezionale tra requisiti e test: ogni test copre almeno un requisito, ogni requisito ha almeno un test.', related: ['req'] },
  { id: 'req', term: 'Requisito (Requirement)', def: 'Dichiarazione verificabile del comportamento atteso del sistema. Esempio: "Il watchdog shall kick dopo una conferma di key corretta."', related: ['tracciabilita'] },
  { id: 'stmt-cov', term: 'Statement Coverage', def: 'Percentuale di statement (stazioni) eseguiti almeno una volta. Metrica base: se un\'istruzione non è mai eseguita, non è testata.', related: ['branch-cov', 'mcdc'] },
  { id: 'branch-cov', term: 'Branch Coverage', def: 'Percentuale di branch (rotte) presi sia nel caso true che false. Copre più di statement coverage perché ogni decisione ha due rami.', related: ['stmt-cov', 'mcdc'] },
  { id: 'mcdc', term: 'MC/DC (Modified Condition/Decision Coverage)', def: 'Ogni condizione booleana (luna) influenza il risultato della decisione in modo indipendente. Richiesto dal DO-178C per software di livello A (catastrofico).', related: ['branch-cov', 'stmt-cov'] },
  { id: 'bva', term: 'Boundary Value Analysis (BVA)', def: 'Test ai limiti dell\'intervallo: se l\'input accetta 0-100, testa 0, 1, 99, 100 e valori fuori dominio. Gli errori si nascondono ai confini.', related: ['robustness'] },
  { id: 'robustness', term: 'Test di Robustezza', def: 'Test con input fuori dominio, valori estremi, stato invalido. Verifica che il sistema non crashi e gestisca gli errori in modo sicuro.', related: ['bva', 'negative'] },
  { id: 'negative', term: 'Test Negativo', def: 'Test progettato per fallire: input errati, stato inconsistente, violazione di precondizioni. Verifica che l\'UUT rifiuti o gestisca correttamente input non validi.', related: ['robustness'] },
  { id: 'nominal', term: 'Test Nominale', def: 'Test con input "normali" che esercita il percorso principale del codice. Verifica che l\'UUT funzioni correttamente nelle condizioni standard.', related: ['bva', 'negative'] },
  { id: 'regression', term: 'Regression Testing', def: 'Re-esecuzione di tutti i test dopo una modifica (fix, refactoring). Obiettivo: verificare che nulla si sia rotto.', related: ['harness'] },
  { id: 'anomaly', term: 'Anomalia (Anomaly Report)', def: 'Report formale di un difetto nel codice (bug). Include: ID, descrizione, severity, riferimento al requisito, stazione interessata.', related: ['triage'] },
  { id: 'triage', term: 'Triage (FAIL Classification)', def: 'Classificazione del FAIL: test errato (il test è sbagliato), stub mal configurato (lo stub non è corretto), o defect del codice (il codice ha un bug).', related: ['anomaly'] },
  { id: 'severity', term: 'Severity', def: 'Gravità dell\'anomalia: Critical (crash/loss), Major (funzionalità persa), Minor (cosmetico), Info (miglioramento possibile).', related: ['anomaly'] },
  { id: 'cross-compile', term: 'Cross-Compilation', def: 'Compilare codice su un host (es. x86) per un target diverso (es. RISC-V). I comportamenti possono differire dalla compilazione nativa.', related: ['target'] },
  { id: 'target', term: 'Target Hardware', def: 'La piattaforma di destinazione: processore, architettura, allineamento, tipo char. Il comportamento del codice può variare tra target diversi.', related: ['cross-compile'] },
  { id: 'char-signed', term: 'Char Signedness', def: 'In C, `char` può essere signed o unsigned a seconda del compilatore/target. `char c = -1; if (c < 0)` è vero solo se char è signed — bug classico in embedded.', related: ['target', 'cross-compile'] },
  { id: 'alignment', term: 'Data Alignment', def: 'Vincolo su come i dati sono posizionati in memoria. Cast puntatore a struct non allineata può causare trap su hardware ARM/RISC-V a byte singolo.', related: ['target'] },
  { id: 'optimization', term: 'Effetti dell\'Ottimizzazione', def: 'Il compilatore può riordinare, eliminare o riorganizzare codice. UB (Undefined Behavior) può emergere solo in build ottimizzata, non in debug.', related: ['target'] },
  { id: 'ub', term: 'Undefined Behavior (UB)', def: 'Comportamento non definito dallo standard C: read di variabile non inizializzata, overflow signed, puntatore NULL dereference. Il compilatore può fare qualsiasi cosa.', related: ['optimization'] },
  { id: 'do178c', term: 'DO-178C', def: 'Standard industriale per software airborne: definisce i livelli di rigor (A-E) e le metriche di coverage richieste. Livello A richiede MC/DC.', related: ['mcdc'] },
  { id: 'bvt', term: 'Boundary Value Testing', def: 'Sottoinsieme di BVA: test specifici sui valori limite di ogni variabile di input e output.', related: ['bva'] },
];
