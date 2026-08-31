# ZERO ASSOLUTO ⚔️🔢

## Il duello dei numeri che tendono a zero

> *«Il grande libro dell'universo è scritto in lingua matematica.»*
> — Galileo Galilei

---

## 1. L'idea in una frase

**Una PWA installabile sul telefono e giocabile offline in cui ogni carta è una funzione matematica o un'abilità speciale** — dalle semplici (`x−7`, `x/2`) alle più difficili (limiti, integrali, esponenziali, logaritmi, fattoriali, numeri complessi, infinito, valori assoluti) — che trasforma la vita dell'avversario. **Vince chi porta la vita del rivale ESATTAMENTE a 0; andare in negativo non vince: il colpo viene bloccato.** Ogni giocatore sceglie i propri punti vita da 0 a 10000.

## 2. Il titolo: «ZERO ASSOLUTO»

Tripla risonanza, pensata per un pubblico italiano:
- **Matematica**: portare la vita a zero;
- **Fisica**: lo zero assoluto (−273,15 °C), la temperatura del nulla;
- **Musica pop italiana**: il duo Zero Assoluto — un sorriso per chi riconosce il riferimento.

## 3. Regole del duello

### Scelta della vita
- **Ogni giocatore sceglie i propri punti vita da 0 a 10000** (slider + valori rapidi: 1, 10, 50, 100, 500, 1000, 4096, 10000).
- **Vs IA**: scegli la TUA vita; la vita del boss è la sua firma (modificabile: «firma del boss / scegli tu»).
- **Duello locale 2P** (pass-and-play sullo stesso telefono): entrambi scelgono la propria vita.

### Vittoria e sconfitta
- **Vittoria**: vita avversaria **= 0 esatto** → «Colpo Perfetto» (3 stelle).
- **Niente vittoria in negativo**: la mossa che porterebbe la vita sotto 0 è **bloccata** con messaggio «⚠️ Trabocco bloccato: devi atterrare ESATTAMENTE su 0!». Il turno non si consuma: puoi scegliere un'altra carta.
- **Sconfitta**: la TUA vita arriva a 0 o meno.

### Turno
- **Energia**: parti da 3, +1 a turno, max 10.
- **Mano**: max 6 carte, peschi 1 a turno.
- **Catena**: puoi giocare più carte nello stesso turno, applicate in sequenza `f(g(h(x)))`.
- **Anti-boomerang**: la vita può salire (carte «trappola») ma mai sopra il massimo scelto all'inizio.

## 4. Le carte

### Funzioni numeriche (semplici)
| Carta | Effetto | Costo |
|---|---|---|
| Sottrai 1 / 7 / 50 / 250 / 1000 / 2500 | x → x−n | 1–5 |
| Dividi per 2 / 3 / 5 / 10 (floor) | x → floor(x/n) | 3–4 |
| Modulo 7 / 13 / 100 | x → x mod n | 3–4 |
| Radice quadrata | x → floor(√x) | 3 |
| Riflessione 100−x / 1000−x / 10000−x | x → N−x | 2–4 |
| Valore assoluto | x → |x−50| o |x−100| | 3 |
| Quadrato (trappola) | x → min(10000, x²/100) | 2 |

### Funzioni avanzate (le «difficili»)
| Carta | Effetto reale | Concetto |
|---|---|---|
| **Limite di Zenone** (½+¼+⅛+…) | x → max(1, floor(x/2)) | la serie converge a 1: non arriva mai a 0 da sola |
| **Limite all'infinito** (1/∞) | x → floor(x/1000) | 1/∞ = 0: la vita crolla verso lo zero |
| **Derivata** (d/dx x = 1) | x → 1 | la derivata dell'identità è la costante 1 |
| **Integrale (accumulo)** | x → min(10000, x + floor(x/4)) | l'integrale accumula area (trappola) |
| **Esponenziale eˣ** | x → min(10000, floor(x²/100)) | crescita esplosiva (trappola) |
| **Logaritmo naturale ln** | x → max(1, floor(10·ln x)) | 10000 → 92: riduzione potentissima |
| **Fattoriale !** | se x ≤ 6 → min(10000, x!) altrimenti bloccato | il fattoriale esplode: 5! = 120 |
| **Unità immaginaria i** | nessun effetto, pesca 1 | √(−1) non è reale |
| **i² = −1** | x → x−1 | due rotazioni di 90° = segno ribaltato |
| **Coniugato complesso** | Scudo (annulla il prossimo colpo) | moltiplicare per il coniugato elimina la parte immaginaria |
| **Modulo complesso** | x → floor(√(x²+100)) | |z| = √(a²+b²) |
| **Infinito ∞** | nessun effetto, pesca 1 | ∞ non è un numero: ci si tende |
| **Ramanujan** (1+2+3+… = −1/12) | x → x−1 | la celebre identità come colpo −1 |

### Abilità speciali
| Carta | Effetto | Costo |
|---|---|---|
| **Colpo del Primo** | se x è primo → 0 (vittoria) | 6 |
| **Colpo del Quadrato Perfetto** | se x è quadrato → 0 (vittoria) | 6 |
| **Doppia Applicazione** | la prossima carta si applica 2 volte | 4 |
| **Congelamento** | l'avversario salta il prossimo turno | 5 |
| **Furto di Energia** | +3 a te, −3 all'avversario | 3 |
| **Rubacarta** | peschi 2 carte | 2 |
| **Scudo** | dimezza la prossima riduzione subita | 3 |
| **Specchio** | l'ultima carta avversaria si applica a lui | 5 |
| **Scambio di Vita** | scambia la tua vita con quella avversaria | 6 |
| **Cura** | +50 alla tua vita (max iniziale) | 2 |
| **Terremoto** | dimezza la vita di entrambi | 4 |

**Ogni carta avanzata apre una scheda-spiegazione**: definizione accessibile, formula, esempio numerico giocato e nota formale in stile manuale universitario.

## 5. I 5 boss

| Boss | Vita-firma | Carta regalo |
|---|---|---|
| **Micio Numerino** (tutorial) | 30 | Sottrai 7 |
| **Il Conte alla Rovescia** | 4096 = 2¹² | Modulo 13 |
| **La Dama dei Primi** | 97 (primo!) | Colpo del Primo |
| **Il Mago dei Moduli** | 10000 | Limite all'infinito |
| **Il Grande Zero** | 1 | Scambio di Vita |

Citazioni: Leopardi (*A Silvia*), Hardy («I numeri primi sono gli atomi dell'aritmetica»), Nietzsche («Tutto ritorna»), Lucrezio (*De rerum natura*: «ex nihilo nihil»).

## 6. Risvolto pratico e filosofico

- **Nella vita vera**: orologio come modulo 12, divisibilità in cucina, sconti percentuali, crittografia coi primi, logaritmi nella scala Richter.
- **Il Diario dello Zero** (6 domande, risposte salvate ed esportabili): «Che cos'è lo zero?», «Il nulla esiste?», «La matematica si scopre o si inventa?», «Perché i primi sono infiniti?», «I numeri immaginari esistono?», «Cosa significa tendere a un limite?».

## 7. Struttura della cartella

```
games/zero-assoluto/
├── index.html
├── style.css
├── manifest.webmanifest
├── sw.js
├── make_icons.py
├── icons/ (icon-192, icon-512, icon-maskable, apple-touch-icon)
├── README.md
└── js/
    ├── data.js    (carte, schede, boss, dialoghi, domande)
    ├── cards.js   (motore funzioni, blocco negativo, zero esatto)
    ├── ai.js      (3 difficoltà)
    ├── main.js    (menu, scelta vita, deck, duello, 2P, diario)
    ├── save.js    (localStorage)
    └── audio.js   (WebAudio)
```

## 8. Test

Smoke test in Node con mock DOM: ogni carta calcola il valore giusto; zero esatto = vittoria; negativo = bloccato; carte no-op pescano; AI Difficile trova lo zero; flusso completo menu → scelta vita → duello → vittoria → sblocco → salvataggio; PWA servita via HTTP.

### Stato attuale: ✅ costruito e giocabile

- **130 carte** (79 funzioni, 26 abilità speciali, **25 carte campo permanenti**), ognuna con scheda-spiegazione accessibile + nota formale
- **Carte campo** che restano in gioco e si attivano a ogni inizio del tuo turno:
  - Deterministiche: **Goccia Cinese** (−1), **Doppia Goccia** (−2), **Conto alla Rovescia** (−1, −2, −3…), **Interesse Composto** (−5%), **Interesse Esponenziale** (−5%, −6%, −7%…), **Ragnatela di Fibonacci** (−1, 1, 2, 3, 5, 8…), **Erosione Modulare** (x mod 5), **Veleno del Primo** (−7 se primo), **Limite di Zenone in campo** (dimezza, converge a 1), **Radice in campo** (⌊√x⌋), **Parità in campo** (pari→x/2, dispari→x−1), **Risonanza** (−1 per ogni carta campo in gioco), **Economia di Scala** (+1 energia per ogni tua carta campo), **Scudo Rigenerante** (+5 vita), **Ricarica** (+1 energia), **Torre di Guardia** (dimezza ogni danno, passiva)
  - **Probabilistiche e statistiche**: **Moneta del Destino** (testa −5 / croce +3), **Dado del Fato** (−1d6), **Legge dei Grandi Numeri** (danno = teste di 3 monete), **Passeggiata del Gatto** (50% −3 / 50% +2 cura), **Distribuzione Normale** (N(5,2)), **Entropia di Shannon** (danno casuale 1..campi+1), **Sabotaggio** (50% rimuove una carta campo avversaria), **Distribuzione di Poisson** (λ=2: eventi rari, spesso 0–2, a volte colpi grossi)
- **Funzioni aleatorie**: Lancia la Moneta (50% dimezza), Dado del Duello (−1d6), Media dei Dadi (−⌊media 2d6⌋), Variabile Casuale (−U(1..10)), Mediana (clamp a [10,100]), Regola 68-95-99,7 (N(5,2))
- **Abilità probabilistiche**: **Paradosso di Monty Hall** (mini-gioco a 3 porte: cambiare vince 2/3!), **Scommessa di Pascal** (testa dimezza la vita avversaria), **Casino Reale** (danno casuale 0–10, E=5), **Teorema di Bayes** (rivela la prossima carta avversaria: scartala o lasciala), **Valore Atteso** (media di 3 dadi come danno), **Scommessa Raddoppio** (paga 3, testa → +6: gioco equo)
- **Altre funzioni difficili**: Logaritmo in base 2, Radice quarta, **Congettura di Collatz**, **φ di Eulero**, **σ (somma divisori)**, **MCM con 12**; abilità Riciclo e Trasferimento
- **Nuovi ambiti colmati**: **Algebra** (Isola l'incognita, Fattorizza), **Geometria** (Pitagora, Area del Cerchio, Angoli Supplementari), **Trigonometria** (Seno, Coseno), **Logica** (AND, OR, Appartenenza), **Combinatoria** (C(n,2), D(n,2)), **Grafi** (Grado del Vertice, Rete Avversaria), **Algebra lineare** (Vettore (3,4), Determinante 2×2), **EDO** (Equazione Logistica), **Frazioni** (Percentuale, Sezione Aurea), **Crittografia** (RSA, Hash), **Informatica** (Bubble Sort, if/else, Hash)
- **AI Difficile gioca carte campo**
- **Scelta vita 0–10000** per entrambi i giocatori (vs IA con 3 difficoltà + duello locale 2P pass-and-play)
- **Zero esatto = vittoria** (colpo perfetto, 3 stelle); **negativo = mossa bloccata** con messaggio, senza consumare carta né energia (vale anche per le carte aleatorie)
- **5 boss** con vita-firma (30, 4096, 97, 10000, 1), citazioni letterarie (Leopardi, Hardy, Nietzsche, Lucrezio), meditazioni filosofiche e **due carte-premio** ciascuno; sconfiggere un boss sblocca **tutte** le carte del suo set
- **Deck builder**, **Diario dello Zero** esportabile, modalità notturna, salvataggi persistenti
- **PWA completa**: manifest, service worker offline, icone generate, WebAudio, italiano

### Verifiche eseguite

- Motore: tutte le 107 carte (incluse le 24 carte campo e le carte aleatorie, testate con 30 iterazioni casuali ciascuna) calcolano senza eccezioni
- Carte aleatorie con Math.random forzato: moneta (0.1→dimezza, 0.9→niente), dado (0.0→−1, 0.99→−6), variabile (−1/−10), regola 68 (−3/−7), moneta del destino (testa −5 / croce +3 con cap), dado del fato, legge dei grandi numeri (3 teste), passeggiata (avanti −3 / indietro +2), normale, entropia, sabotaggio (0.1→successo), **Poisson** (distribuzione empirica su 5000 tick: media 1,98 ≈ λ=2)
- **Poisson**: media empirica 1,98 ≈ λ=2, 0 eventi ~13% (e⁻²≈0,135), code lunghe corrette
- **Monty Hall via UI**: 3 porte, l'host rivela una capra, cambiare porta applica il premio (−10, vita 20→10)
- **Bayes via UI**: rivela la prossima carta avversaria, scelta di scartarla, log aggiornato
- Nessuna funzione restituisce mai un valore negativo come "ok" (blocco dello zero esatto garantito anche per le aleatorie)
- Blocco del negativo, zero esatto, AI mai negativa: invariati
- PWA servita via HTTP 200; voce nel catalogo `games`

## 9. Ambiti della matematica e STEM: copertura del gioco

Questa tabella mostra quali rami della matematica (e dello STEM) sono **già implementati** in Zero Assoluto e quali **non ancora** — con idee concrete per il futuro.

| Ambito | Implementato? | Esempi nel gioco | Idee per il futuro |
|---|---|---|---|
| Aritmetica | ✅ | sottrazioni, divisioni, modulo | operazioni miste in catena |
| Numeri interi, parità | ✅ | Modulo 2, Parità in campo | — |
| Numeri primi e divisibilità | ✅ | Colpo del Primo, MCD, MCM, φ di Eulero, Veleno del Primo | teorema dei numeri primi |
| Teoria dei numeri | ✅ | φ, σ, Collatz, primi, crittografia (cenno) | ipotesi di Riemann |
| Sequenze e serie | ✅ | Fibonacci, Zenone, limite | serie geometriche esplicite |
| Calcolo (derivate, integrali) | ✅ | Derivata, Integrale, Limiti | teorema fondamentale |
| Funzioni | ✅ | esponenziali, logaritmi, radici, fattoriale, |x| | funzioni composte |
| Numeri complessi | ✅ | i, i²=−1, coniugato, modulo | piano complesso, rotazioni |
| Infinito | ✅ | ∞, Ramanujan, Limite all'infinito | cardinalità di Cantor |
| Probabilità | ✅ | moneta, dado, Bernoulli, Poisson, variabili | catene di Markov |
| Statistica | ✅ | media, mediana, normale, regola 68-95-99,7 | varianza, deviazione std |
| Teoria dell'informazione | ✅ (cenno) | Entropia di Shannon | codici, bit |
| Probabilità condizionata | ✅ | Bayes, Monty Hall | alberi di probabilità |
| Teoria dei giochi | ✅ (cenno) | Scommessa di Pascal, gioco equo | equilibrio di Nash |
| **Algebra** | ✅ | Isola l'incognita (equazioni lineari), Fattorizza | sistemi, polinomi, disequazioni |
| **Geometria** | ✅ | Teorema di Pitagora (cateto), Area del Cerchio (π), Angoli Supplementari | aree, volumi, teoremi |
| **Trigonometria** | ✅ | Seno, Coseno (oscillazioni) | tangente, identità, gradi/radianti |
| **Logica e insiemi** | ✅ | AND, OR (tavole di verità), Appartenenza | NOT, De Morgan, quantificatori |
| **Combinatoria** | ✅ | Coefficiente Binomiale C(n,2), Disposizioni D(n,2) | permutazioni, triangolo di Pascal |
| **Grafi e reti** | ✅ | Grado del Vertice (τ(n)), Rete Avversaria (campo) | percorsi euleriani, alberi, Dijkstra |
| **Algebra lineare** | ✅ | Vettore (3,4) con modulo 5, Determinante 2×2 | matrici, trasformazioni, autovalori |
| **Equazioni differenziali** | ✅ | Equazione Logistica (Verhulst) | oscillatore, decadimento |
| **Frazioni e rapporti** | ✅ | Percentuale (37%), Sezione Aurea (φ) | proporzioni, rapporti |
| **Crittografia** | ✅ | RSA (fattorizzazione), hash modulare | chiavi, firme digitali |
| **Informatica / algoritmi** | ✅ | Bubble Sort (cifre), if/else, Funzione Hash | ricerca binaria, complessità O() |
| **Fisica** | ❌ (in De Rerum Gatta) | — | pendoli, orbite, relatività → altro gioco |
| **Chimica / Biologia** | ❌ | — | reazioni, DNA, Fibonacci in natura |
| **Frattali / caos** | ✅ (cenno) | Collatz, entropia | Mandelbrot, attrattori |
| **Geometria analitica** | ❌ | — | rette, parabole, coniche |

**Riepilogo**: Zero Assoluto ora copre **teoria dei numeri, calcolo, probabilità, statistica, algebra, geometria, trigonometria, logica, combinatoria, grafi, algebra lineare, equazioni differenziali, frazioni, crittografia e informatica**. Mancano all'appello la **geometria analitica** e il resto dello STEM non matematico (**fisica** — già in De Rerum Gatta —, **chimica**, **biologia**, **ingegneria**).
