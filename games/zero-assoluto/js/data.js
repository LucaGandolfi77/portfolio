/* ZERO ASSOLUTO — dati del gioco: carte, schede, boss, dialoghi, domande */
'use strict';

/* Ogni carta:
   id, name, emoji, cost, type: 'fn'|'ability',
   desc (effetto), lesson (spiegazione accessibile), formal (nota universitaria)
   fn: (x) => numero (nuova vita)  — per le fn
   ability: effetto speciale (gestito in cards.js/main.js)
   unlock: boss id che la sblocca, o null per le base
*/
const CARDS = [
  /* ---- base (sbloccate da subito) ---- */
  { id: 'sub1',    name: 'Sottrai 1',    emoji: '➖', cost: 1, type: 'fn',   fn: x => x - 1,
    desc: 'x → x−1', lesson: 'Il colpo più piccolo e più preciso: l\'unico che porta 1 a 0.',
    formal: 'Funzione lineare affine f(x)=x−1: trasla il valore di una unità verso il basso.', unlock: null },
  { id: 'sub7',    name: 'Sottrai 7',    emoji: '➖', cost: 1, type: 'fn',   fn: x => x - 7,
    desc: 'x → x−7', lesson: 'Il 7 è primo: sottrarlo non tocca la divisibilità per altri numeri.',
    formal: 'f(x)=x−7: traslazione verso il basso di un numero primo.', unlock: null },
  { id: 'sub50',   name: 'Sottrai 50',   emoji: '➖', cost: 2, type: 'fn',   fn: x => x - 50,
    desc: 'x → x−50', lesson: 'Mezzo centinaio: utile per sistemare i resti dei moduli.',
    formal: 'f(x)=x−50: traslazione lineare.', unlock: null },
  { id: 'sub250',  name: 'Sottrai 250',  emoji: '➖', cost: 3, type: 'fn',   fn: x => x - 250,
    desc: 'x → x−250', lesson: 'Un quarto di mille: colpo medio.',
    formal: 'f(x)=x−250: traslazione lineare.', unlock: null },
  { id: 'sub1000', name: 'Sottrai 1000', emoji: '➖', cost: 4, type: 'fn',   fn: x => x - 1000,
    desc: 'x → x−1000', lesson: 'Un migliaio via: si lavora sulle migliaia.',
    formal: 'f(x)=x−1000: traslazione di un ordine di grandezza.', unlock: null },
  { id: 'sub2500', name: 'Sottrai 2500', emoji: '➖', cost: 5, type: 'fn',   fn: x => x - 2500,
    desc: 'x → x−2500', lesson: 'Un quarto di diecimila: colpo pesante.',
    formal: 'f(x)=x−2500: traslazione lineare di grande ampiezza.', unlock: null },

  { id: 'sub13', name: 'Sottrai 13', emoji: '➖', cost: 2, type: 'fn',   fn: x => x - 13,
    desc: 'x → x−13', lesson: 'Il tredici è primo e porta sfortuna… al nemico. Colpo di precisione.',
    formal: 'f(x)=x−13: traslazione di un numero primo.', unlock: 'micio' },

  { id: 'div2', name: 'Dividi per 2', emoji: '➗', cost: 3, type: 'fn', fn: x => Math.floor(x / 2),
    desc: 'x → ⌊x/2⌋', lesson: 'La metà esatta: dimezza sempre, ma per numeri dispari arrotonda in giù.',
    formal: 'f(x)=⌊x/2⌋: partizione intera; preserva la parità solo per x pari.', unlock: null },
  { id: 'div3', name: 'Dividi per 3', emoji: '➗', cost: 3, type: 'fn', fn: x => Math.floor(x / 3),
    desc: 'x → ⌊x/3⌋', lesson: 'Un terzo: funziona meglio sui multipli di 3.',
    formal: 'f(x)=⌊x/3⌋: divisione intera.', unlock: null },
  { id: 'div5', name: 'Dividi per 5', emoji: '➗', cost: 4, type: 'fn', fn: x => Math.floor(x / 5),
    desc: 'x → ⌊x/5⌋', lesson: 'Un quinto: i numeri che finiscono per 0 o 5 si dividono puliti.',
    formal: 'f(x)=⌊x/5⌋: divisione intera; criterio di divisibilità per 5.', unlock: null },
  { id: 'div10', name: 'Dividi per 10', emoji: '➗', cost: 4, type: 'fn', fn: x => Math.floor(x / 10),
    desc: 'x → ⌊x/10⌋', lesson: 'Toglie l\'ultima cifra: potente sulle decine.',
    formal: 'f(x)=⌊x/10⌋: shift decimale verso destra.', unlock: null },

  { id: 'mod7',  name: 'Modulo 7',  emoji: '🔄', cost: 3, type: 'fn', fn: x => x % 7,
    desc: 'x → x mod 7', lesson: 'Il resto della divisione per 7: 64 mod 7 = 1. Salto improvviso verso il basso!',
    formal: 'Congruenza modulo 7: x mod 7 ∈ {0,…,6}. L\'orologio del lunedì.', unlock: null },
  { id: 'mod13', name: 'Modulo 13', emoji: '🔄', cost: 4, type: 'fn', fn: x => x % 13,
    desc: 'x → x mod 13', lesson: 'Il resto per 13: un primo che fa cadere la vita sotto le 13 unità.',
    formal: 'Congruenza modulo 13; 13 è primo, l\'anello Z/13Z è un campo.', unlock: null },
  { id: 'mod100', name: 'Modulo 100', emoji: '🔄', cost: 3, type: 'fn', fn: x => x % 100,
    desc: 'x → x mod 100', lesson: 'Restano solo le ultime due cifre.',
    formal: 'Congruenza modulo 100: proiezione sull\'anello delle centinaia.', unlock: null },

  { id: 'sqrt', name: 'Radice quadrata', emoji: '√', cost: 3, type: 'fn', fn: x => Math.floor(Math.sqrt(x)),
    desc: 'x → ⌊√x⌋', lesson: 'La radice è l\'inversa del quadrato: 10000 → 100 → 10 → 3.',
    formal: 'f(x)=⌊√x⌋: radice quadrata intera; inversa parziale di x².', unlock: null },
  { id: 'quad', name: 'Quadrato', emoji: '⬜', cost: 2, type: 'fn', fn: x => Math.min(10000, Math.floor(x * x / 100)),
    desc: 'x → ⌊x²/100⌋ (max 10000)', lesson: 'TRAPPOLA: il quadrato cresce. Ma su vite piccole, x²/100 può scendere…',
    formal: 'f(x)=⌊x²/100⌋ con cap: funzione quadratica, non monotona sul dominio gioco.', unlock: null },

  { id: 'rif100',   name: 'Riflessione 100',   emoji: '🪞', cost: 2, type: 'fn', fn: x => 100 - x,
    desc: 'x → 100−x', lesson: 'Il complemento a 100: una vita a 64 diventa 36. Cambia tutto il panorama.',
    formal: 'f(x)=100−x: involuzione (f(f(x))=x), simmetria rispetto a 50.', unlock: null },
  { id: 'rif1000',  name: 'Riflessione 1000',  emoji: '🪞', cost: 3, type: 'fn', fn: x => 1000 - x,
    desc: 'x → 1000−x', lesson: 'Complemento a mille: ribalta le migliaia.',
    formal: 'f(x)=1000−x: involuzione, simmetria rispetto a 500.', unlock: null },
  { id: 'rif10000', name: 'Riflessione 10000', emoji: '🪞', cost: 4, type: 'fn', fn: x => 10000 - x,
    desc: 'x → 10000−x', lesson: 'Il complemento a diecimila: enorme ribaltone.',
    formal: 'f(x)=10000−x: involuzione sul massimo del gioco.', unlock: null },

  { id: 'abs50',  name: 'Valore assoluto |x−50|',  emoji: '🧲', cost: 3, type: 'fn', fn: x => Math.abs(x - 50),
    desc: 'x → |x−50|', lesson: 'La distanza dal 50: avvicinarsi o allontanarsi, comunque la vita diventa una distanza.',
    formal: 'f(x)=|x−50|: distanza euclidea unidimensionale dal punto 50.', unlock: null },
  { id: 'abs100', name: 'Valore assoluto |x−100|', emoji: '🧲', cost: 3, type: 'fn', fn: x => Math.abs(x - 100),
    desc: 'x → |x−100|', lesson: 'La distanza dal 100: 0 → 100, 100 → 0, 64 → 36.',
    formal: 'f(x)=|x−100|: distanza dal punto 100.', unlock: null },

  /* ---- avanzate (sbloccate dai boss) ---- */
  { id: 'zenone', name: 'Limite di Zenone', emoji: '🐢', cost: 3, type: 'fn', fn: x => Math.max(1, Math.floor(x / 2)),
    desc: 'x → max(1, ⌊x/2⌋)', lesson: '½+¼+⅛+… converge a 1, non a 0! Il gatto dimezza, la farfalla resta: per arrivare a 0 serve un colpo esatto.',
    formal: 'Serie geometrica Σ(1/2)ⁿ = 1: il limite della somma è 1, mai 0. (Paradosso di Zenone: Achille e la tartaruga.)',
    unlock: 'mago' },

  { id: 'infinito', name: 'Limite all\'infinito', emoji: '♾️', cost: 5, type: 'fn', fn: x => Math.floor(x / 1000),
    desc: 'x → ⌊x/1000⌋', lesson: '1/∞ = 0: dividere per l\'infinito fa crollare la vita verso lo zero. 10000 → 10 → 0!',
    formal: 'lim_{x→∞} 1/x = 0: la funzione tende a zero, e ⌊x/1000⌋ la approssima sul gioco.',
    unlock: 'mago' },

  { id: 'derivata', name: 'Derivata', emoji: '📈', cost: 5, type: 'fn', fn: x => (x > 0 ? 1 : 0),
    desc: 'x → 1 (se x>0)', lesson: 'd/dx [x] = 1! La derivata dell\'identità è la costante 1: qualsiasi vita diventa 1. Poi serve il colpo finale.',
    formal: 'd/dx x = 1: la derivata della funzione identità è la funzione costante 1.',
    unlock: 'dama' },

  { id: 'integrale', name: 'Integrale (accumulo)', emoji: '∫', cost: 2, type: 'fn', fn: x => Math.min(10000, x + Math.floor(x / 4)),
    desc: 'x → x + ⌊x/4⌋ (max 10000)', lesson: 'TRAPPOLA: l\'integrale accumula area sotto la curva — la vita RISALE del 25%.',
    formal: '∫₀ˣ t dt = x²/2: l\'integrazione accumula; qui simulata come crescita del 25%.',
    unlock: 'conte' },

  { id: 'esponenziale', name: 'Esponenziale eˣ', emoji: '🚀', cost: 2, type: 'fn', fn: x => Math.min(10000, Math.floor(x * x / 100)),
    desc: 'x → ⌊x²/100⌋ (max 10000)', lesson: 'TRAPPOLA: la crescita esponenziale esplode. Su vite piccole può però aiutare…',
    formal: 'eˣ cresce più di ogni potenza: la crescita esponenziale supera ogni soglia.',
    unlock: 'conte' },

  { id: 'logaritmo', name: 'Logaritmo naturale', emoji: '📉', cost: 5, type: 'fn', fn: x => Math.max(1, Math.floor(10 * Math.log(x))),
    desc: 'x → ⌊10·ln x⌋', lesson: 'ln(10000) ≈ 9,2 → la vita diventa 92! Il logaritmo schiaccia i numeri enormi.',
    formal: 'ln(x): inversa dell\'esponenziale; ln(10000)≈9,21. La scala Richter è logaritmica.',
    unlock: 'mago' },

  { id: 'fattoriale', name: 'Fattoriale !', emoji: '❗', cost: 4, type: 'fn', fn: x => (x <= 6 ? Math.min(10000, fact(x)) : null),
    desc: 'se x ≤ 6 → x! (max 10000), altrimenti bloccato', lesson: '5! = 120: il fattoriale esplode. Su vite piccole è una trappola, ma 2! = 2 non cambia nulla.',
    formal: 'n! = Πₖ₌₁ⁿ k: funzione che cresce più velocemente di ogni esponenziale (per n grande).',
    unlock: 'grandezero' },

  { id: 'i', name: 'Unità immaginaria i', emoji: '🌀', cost: 0, type: 'fn', fn: x => x,
    desc: 'x → x (nessun effetto), pesca 1', lesson: '√(−1) = i non è un numero reale: non puoi applicarlo alla vita. Ma ora credi nell\'impossibile — e peschi una carta.',
    formal: 'i² = −1: estensione dei reali ai complessi; i ∉ ℝ.',
    unlock: 'dama' },

  { id: 'iquadro', name: 'i² = −1', emoji: '🌀', cost: 1, type: 'fn', fn: x => x - 1,
    desc: 'x → x−1 (i² = −1)', lesson: 'Due rotazioni di 90° (i·i) ribaltano il segno: i² = −1. E −1 sulla vita è un colpo da 1.',
    formal: 'i² = −1: la moltiplicazione per i è una rotazione di 90° nel piano complesso; applicata due volte = rotazione di 180° = segno opposto.',
    unlock: 'dama' },

  { id: 'coniugato', name: 'Coniugato complesso', emoji: '🛡️', cost: 3, type: 'ability',
    desc: 'Scudo: annulla il prossimo colpo avversario', lesson: 'Moltiplicare per il coniugato (a−bi) elimina la parte immaginaria: |z|² = a²+b². Un muro reale.',
    formal: 'z·z̄ = |z|² ∈ ℝ: il prodotto di un complesso per il suo coniugato è reale (modulo al quadrato).',
    unlock: 'dama' },

  { id: 'modcomplesso', name: 'Modulo complesso', emoji: '🎯', cost: 2, type: 'fn', fn: x => Math.floor(Math.sqrt(x * x + 100)),
    desc: 'x → ⌊√(x²+100)⌋', lesson: '|z| = √(a²+b²): aggiunge una piccola parte immaginaria (100) e la vita cresce di poco. Quasi sempre una trappola.',
    formal: '|z| = √(a²+b²): norma euclidea del complesso z = a+bi.',
    unlock: 'dama' },

  { id: 'infinito2', name: 'Infinito ∞', emoji: '∞', cost: 0, type: 'fn', fn: x => x,
    desc: 'x → x (nessun effetto), pesca 1', lesson: '∞ non è un numero: non si gioca, ci si tende. Ma credere nell\'infinito pesca una carta.',
    formal: '∞ non è un elemento di ℝ: è un punto all\'infinito (compatificazione di Alexandrov) o un cardinale transfinito (Cantor).',
    unlock: 'grandezero' },

  { id: 'ramanujan', name: 'Ramanujan', emoji: '✨', cost: 1, type: 'fn', fn: x => x - 1,
    desc: 'x → x−1 (1+2+3+… = −1/12)', lesson: 'La celebre identità sommativa: 1+2+3+… = −1/12. Nel nostro duello vale un colpo da 1. Magia (regolarizzata).',
    formal: 'ζ(−1) = −1/12: prolungamento analitico della funzione zeta di Riemann; la «somma» diverge, la regolarizzazione no.',
    unlock: 'grandezero' },

  /* ---- abilità speciali ---- */
  { id: 'primo', name: 'Colpo del Primo', emoji: '🏆', cost: 6, type: 'ability',
    desc: 'se x è primo → 0 (vittoria immediata)', lesson: 'Un numero primo ha solo due divisori: se la vita è 2, 3, 5, 7, 97… il colpo la azzera.',
    formal: 'n primo ⇔ divisori {1, n}. Teorema fondamentale dell\'aritmetica: fattorizzazione unica.',
    unlock: 'dama' },

  { id: 'quadperf', name: 'Colpo del Quadrato Perfetto', emoji: '🏆', cost: 6, type: 'ability',
    desc: 'se x è quadrato perfetto → 0 (vittoria)', lesson: '1, 4, 9, 16, 25…: se la vita è un quadrato perfetto, il colpo la azzera.',
    formal: 'n = k² per qualche k ∈ ℕ: quadrato perfetto.', unlock: 'mago' },

  { id: 'doppia', name: 'Doppia Applicazione', emoji: '×2', cost: 4, type: 'ability',
    desc: 'la prossima carta si applica 2 volte', lesson: 'Composizione f(f(x)): applicare due volte la stessa funzione. f² ≠ f in generale!',
    formal: 'Composizione di funzioni: (f∘f)(x) = f(f(x)).', unlock: 'conte' },

  { id: 'congela', name: 'Congelamento', emoji: '❄️', cost: 5, type: 'ability',
    desc: 'l\'avversario salta il prossimo turno', lesson: 'Il tempo si ferma: l\'avversario non pesca né gioca.',
    formal: 'Il congelamento sospende la sequenza di turni: un\'azione fuori dalla dinamica standard.', unlock: 'conte' },

  { id: 'furto', name: 'Furto di Energia', emoji: '⚡', cost: 3, type: 'ability',
    desc: '+3 energia a te, −3 all\'avversario', lesson: 'L\'energia è il carburante delle funzioni: rubarla è strategia.',
    formal: 'Risorse: trasferimento di 3 unità di energia tra i giocatori.', unlock: null },

  { id: 'rubacarta', name: 'Rubacarta', emoji: '🃏', cost: 2, type: 'ability',
    desc: 'peschi 2 carte extra', lesson: 'Più carte, più funzioni tra cui scegliere: la mano è la tua libertà.',
    formal: 'Estrazione di carte dal mazzo: incremento della dimensione della mano.', unlock: null },

  { id: 'scudo', name: 'Scudo', emoji: '🛡️', cost: 3, type: 'ability',
    desc: 'dimezza la prossima riduzione che subisci', lesson: 'Un muro: il prossimo colpo avversario fa metà danno.',
    formal: 'Trasformazione del danno: D → ⌊D/2⌋ per la prossima applicazione subita.', unlock: null },

  { id: 'specchio', name: 'Specchio', emoji: '🪞', cost: 5, type: 'ability',
    desc: 'l\'ultima carta avversaria si applica a lui', lesson: 'Rifletti l\'ultima funzione: il nemico assaggia la sua stessa medicina.',
    formal: 'Simmetria: applicazione dell\'ultima funzione avversaria al suo stesso dominio.', unlock: 'grandezero' },

  { id: 'scambio', name: 'Scambio di Vita', emoji: '🔁', cost: 6, type: 'ability',
    desc: 'scambia la tua vita con quella avversaria', lesson: 'RISCHIOSA: se dopo lo scambio la tua vita è 0, perdi tu!',
    formal: 'Permutazione dei valori di vita tra i due giocatori.', unlock: 'grandezero' },

  { id: 'cura', name: 'Cura', emoji: '💚', cost: 2, type: 'ability',
    desc: '+50 alla tua vita (max iniziale)', lesson: 'A volte la funzione giusta è prendersi cura di sé.',
    formal: 'Incremento della vita del giocatore, con cap al valore iniziale.', unlock: null },

  { id: 'terremoto', name: 'Terremoto', emoji: '🌋', cost: 4, type: 'ability',
    desc: 'dimezza la vita di entrambi', lesson: 'Il caos non risparmia nessuno: entrambe le vite si dimezzano.',
    formal: 'Applicazione simultanea di f(x)=⌊x/2⌋ a entrambi i valori.', unlock: 'conte' },

  /* ============ NUOVE FUNZIONI (base) ============ */
  { id: 'sub2', name: 'Sottrai 2', emoji: '➖', cost: 1, type: 'fn', fn: x => x - 2,
    desc: 'x → x−2', lesson: 'Il 2 è il primo dei numeri pari: sottrarlo a un pari conserva la parità.',
    formal: 'f(x)=x−2: traslazione; x pari → x−2 pari.', unlock: null },
  { id: 'sub20', name: 'Sottrai 20', emoji: '➖', cost: 2, type: 'fn', fn: x => x - 20,
    desc: 'x → x−20', lesson: 'Due decine: utile per rifinire i resti dei moduli.',
    formal: 'f(x)=x−20: traslazione lineare.', unlock: null },
  { id: 'sub100', name: 'Sottrai 100', emoji: '➖', cost: 3, type: 'fn', fn: x => x - 100,
    desc: 'x → x−100', lesson: 'Un centinaio: il colpo giusto dopo un modulo.',
    formal: 'f(x)=x−100: traslazione.', unlock: null },
  { id: 'sub500', name: 'Sottrai 500', emoji: '➖', cost: 4, type: 'fn', fn: x => x - 500,
    desc: 'x → x−500', lesson: 'Mezzo migliaio: pesante e preciso.',
    formal: 'f(x)=x−500: traslazione.', unlock: null },
  { id: 'div4', name: 'Dividi per 4', emoji: '➗', cost: 3, type: 'fn', fn: x => Math.floor(x / 4),
    desc: 'x → ⌊x/4⌋', lesson: 'Un quarto: dimezza due volte. Ottimo sulle potenze di 2.',
    formal: 'f(x)=⌊x/4⌋: divisione intera; x=4096 → 1024.', unlock: null },
  { id: 'div7', name: 'Dividi per 7', emoji: '➗', cost: 4, type: 'fn', fn: x => Math.floor(x / 7),
    desc: 'x → ⌊x/7⌋', lesson: 'Un settimo: spacca i numeri grandi in fretta.',
    formal: 'f(x)=⌊x/7⌋: divisione intera.', unlock: null },
  { id: 'mod2', name: 'Modulo 2 (parità)', emoji: '🔄', cost: 2, type: 'fn', fn: x => x % 2,
    desc: 'x → x mod 2', lesson: 'La parità: resta solo 0 o 1. Se la vita è pari, è già a metà strada dallo zero!',
    formal: 'Congruenza modulo 2: la parità dell\'intero.', unlock: null },
  { id: 'mod10', name: 'Modulo 10', emoji: '🔄', cost: 2, type: 'fn', fn: x => x % 10,
    desc: 'x → x mod 10', lesson: 'Restano solo le unità: 97 → 7, 10000 → 0 (vittoria!).',
    formal: 'Congruenza modulo 10: proiezione sulle unità.', unlock: null },
  { id: 'log10', name: 'Logaritmo decimale', emoji: '📉', cost: 4, type: 'fn', fn: x => Math.max(1, Math.floor(Math.log10(x))),
    desc: 'x → ⌊log₁₀ x⌋', lesson: 'log₁₀(10000) = 4: conta le cifre! Da 10000 a 4 in un colpo.',
    formal: 'log₁₀(x): numero di cifre − 1; log₁₀(10000)=4.', unlock: null },
  { id: 'cubica', name: 'Radice cubica', emoji: '√', cost: 4, type: 'fn', fn: x => Math.floor(Math.cbrt(x)),
    desc: 'x → ⌊∛x⌋', lesson: 'La radice cubica: 10000 → 21, 64 → 4. L\'inversa del cubo.',
    formal: 'f(x)=⌊∛x⌋: radice cubica intera.', unlock: null },
  { id: 'media', name: 'Media con 50', emoji: '⚖️', cost: 3, type: 'fn', fn: x => Math.floor((x + 50) / 2),
    desc: 'x → ⌊(x+50)/2⌋', lesson: 'La media col 50: avvicina sempre al 50. Sopra il 50 scende, sotto sale: una trappola sottile.',
    formal: 'Media aritmetica (x+50)/2: punto fisso x=50.', unlock: null },
  { id: 'mcd12', name: 'MCD con 12', emoji: '🔗', cost: 4, type: 'fn', fn: x => mcd(x, 12),
    desc: 'x → MCD(x, 12)', lesson: 'Il massimo comun divisore con 12: 64 → 4, 97 → 1, 90 → 6, 24 → 12 (trappola!).',
    formal: 'MCD(x,12): massimo comun divisore; divide x e 12.', unlock: null },

  /* ============ CARTE CAMPO (restano in gioco, effetto a ogni inizio turno) ============ */
  { id: 'goccia', name: 'Goccia Cinese', emoji: '💧', cost: 3, type: 'field',
    field: { kind: 'sub', n: 1 },
    desc: 'campo: −1 alla vita avversaria a ogni inizio del tuo turno',
    lesson: 'La goccia scava la pietra: un colpo da 1 che non smette mai. Con la pazienza si arriva allo zero.',
    formal: 'Successione aritmetica di ragione 1: riduzione costante per turno.', unlock: 'micio' },
  { id: 'conto', name: 'Conto alla Rovescia', emoji: '⏳', cost: 4, type: 'field',
    field: { kind: 'sub', n: 1, inc: 1 },
    desc: 'campo: −1, poi −2, poi −3… (incrementale) a ogni inizio del tuo turno',
    lesson: 'Il conto accelera: 1, 2, 3, 4… ogni turno il colpo cresce. La fretta è matematica.',
    formal: 'Successione aritmetica di ragione crescente: riduzione n al turno n.', unlock: 'conte' },
  { id: 'interesse', name: 'Interesse Composto', emoji: '📈', cost: 5, type: 'field',
    field: { kind: 'pct', pct: 5 },
    desc: 'campo: −5% della vita avversaria a ogni inizio del tuo turno',
    lesson: 'L\'interesse composto: ogni turno toglie il 5% di quel che resta. Parte lento, ma schiaccia i numeri enormi.',
    formal: 'Decadimento esponenziale: xₙ₊₁ = ⌊0,95·xₙ⌋.', unlock: null },
  { id: 'ragnafib', name: 'Ragnatela di Fibonacci', emoji: '🕸️', cost: 5, type: 'field',
    field: { kind: 'seq', seq: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89] },
    desc: 'campo: sottrae 1, 1, 2, 3, 5, 8… (Fibonacci) a ogni inizio del tuo turno',
    lesson: 'La sequenza di Fibonacci in campo: 1, 1, 2, 3, 5… ogni turno un colpo più grande, e nessuno lo ferma.',
    formal: 'Sequenza di Fibonacci: Fₙ=Fₙ₋₁+Fₙ₋₂, applicata come riduzione progressiva.', unlock: 'dama' },
  { id: 'erosione', name: 'Erosione Modulare', emoji: '🌀', cost: 4, type: 'field',
    field: { kind: 'mod', m: 5 },
    desc: 'campo: x → x mod 5 a ogni inizio del tuo turno',
    lesson: 'Il modulo 5 erode: 97 → 2, 100 → 0 (vittoria!). Se la vita è già sotto 5, si ferma.',
    formal: 'Congruenza modulo 5 applicata a ogni turno: punto fisso per x<5.', unlock: 'mago' },
  { id: 'velenoprimo', name: 'Veleno del Primo', emoji: '☠️', cost: 4, type: 'field',
    field: { kind: 'primeSub', n: 7 },
    desc: 'campo: se la vita avversaria è un numero primo, −7 a ogni inizio del tuo turno',
    lesson: 'Il veleno colpisce solo i primi: 97 → 90 → 83 → 76… ogni primo è un bersaglio.',
    formal: 'Predicato di primalità applicato a ogni turno; riduzione di 7 sui primi.', unlock: null },
  { id: 'scudorig', name: 'Scudo Rigenerante', emoji: '🔰', cost: 3, type: 'field',
    field: { kind: 'heal', n: 5 },
    desc: 'campo: +5 alla TUA vita a ogni inizio del tuo turno (max iniziale)',
    lesson: 'Uno scudo che si ripara da solo: 5 punti vita a turno, come un gatto che fa le fusa.',
    formal: 'Recupero lineare con cap al valore iniziale.', unlock: null },
  { id: 'ricarica', name: 'Ricarica', emoji: '🔋', cost: 3, type: 'field',
    field: { kind: 'energy', n: 1 },
    desc: 'campo: +1 energia a ogni inizio del tuo turno',
    lesson: 'Una batteria sul campo: più energia ogni turno, più funzioni da giocare.',
    formal: 'Incremento di risorsa per turno, con cap.', unlock: null },
  { id: 'torre', name: 'Torre di Guardia', emoji: '🏰', cost: 5, type: 'field',
    field: { kind: 'passive', passive: 'halve' },
    desc: 'campo: ogni riduzione che subisci è dimezzata (passiva)',
    lesson: 'La torre dimezza ogni colpo che ti raggiunge: 20 diventa 10. Un muro che resta.',
    formal: 'Trasformazione del danno subito: D → ⌊D/2⌋ per tutta la durata.', unlock: 'grandezero' },

  /* ============ NUOVE ABILITÀ ============ */
  { id: 'rinforzo', name: 'Rinforzo', emoji: '🃏', cost: 3, type: 'ability',
    desc: 'peschi finché hai 6 carte in mano', lesson: 'Rinforza la mano: più carte, più strade verso lo zero.',
    formal: 'Estrazione fino a saturare la mano (6).', unlock: null },
  { id: 'disarmo', name: 'Disarmo', emoji: '🤚', cost: 3, type: 'ability',
    desc: 'l\'avversario scarta una carta a caso', lesson: 'Senza carte, il nemico ha meno funzioni. La matematica disarmata non colpisce.',
    formal: 'Rimozione casuale di un elemento dalla mano avversaria.', unlock: null },
  { id: 'contrattacco', name: 'Contrattacco', emoji: '🪃', cost: 4, type: 'ability',
    desc: 'se hai subito danni in questo turno, rifletti metà della riduzione subita',
    lesson: 'La simmetria della vendetta: metà del danno subito torna al nemico.',
    formal: 'Riflessione parziale: D_subito/2 applicata alla vita avversaria.', unlock: null },
  { id: 'vampirismo', name: 'Vampirismo', emoji: '🧛', cost: 4, type: 'ability',
    desc: 'per questo turno, ogni riduzione che infliggi ti cura di metà',
    lesson: 'Il vampiro matematico: sottrai al nemico, e metà del colpo diventa la tua cura.',
    formal: 'Conversione D → ⌊D/2⌋ in vita per il giocatore, per un turno.', unlock: null },
  { id: 'cancellazione', name: 'Cancellazione', emoji: '🧹', cost: 4, type: 'ability',
    desc: 'rimuovi dal campo una carta avversaria a tua scelta',
    lesson: 'Il contro-campo: spazza via la goccia, l\'interesse, la torre. Ogni regola ha la sua eccezione.',
    formal: 'Rimozione di un elemento dall\'insieme campo avversario.', unlock: null },
  { id: 'clonazione', name: 'Clonazione', emoji: '🧬', cost: 4, type: 'ability',
    desc: 'aggiungi alla tua mano una copia dell\'ultima carta avversaria',
    lesson: 'Copiare è imparare: l\'ultima funzione del nemico diventa tua.',
    formal: 'Duplicazione dell\'ultima carta-funzione avversaria nella mano.', unlock: null },

  /* ============ NUOVE FUNZIONI (difficili) ============ */
  { id: 'log2', name: 'Logaritmo in base 2', emoji: '📉', cost: 4, type: 'fn', fn: x => Math.max(1, Math.floor(Math.log2(x))),
    desc: 'x → ⌊log₂ x⌋', lesson: 'log₂ conta i dimezzamenti: 4096 → 12, 97 → 6. Il linguaggio dei bit.',
    formal: 'log₂(x): logaritmo in base 2, inverso di 2ˣ; log₂(4096)=12.', unlock: null },
  { id: 'radice4', name: 'Radice quarta', emoji: '√', cost: 4, type: 'fn', fn: x => Math.floor(Math.pow(x, 0.25)),
    desc: 'x → ⌊⁴√x⌋', lesson: 'La radice quarta: 10000 → 10, 4096 → 8. Dimezza le radici due volte.',
    formal: 'f(x)=⌊x^¼⌋: radice quarta intera, inversa di x⁴.', unlock: null },
  { id: 'collatz', name: 'Congettura di Collatz', emoji: '🌀', cost: 4, type: 'fn', fn: x => (x % 2 === 0 ? x / 2 : 3 * x + 1),
    desc: 'se pari → x/2; se dispari → 3x+1 (max 10000)', lesson: 'La congettura più famosa: ogni numero, applicando sempre 3n+1 sui dispari e n/2 sui pari, arriva a 1. Ma nessuno ha mai dimostrato perché!',
    formal: 'Funzione di Collatz T(n): n/2 se pari, 3n+1 se dispari; congettura aperta (non dimostrata).', unlock: 'mago' },
  { id: 'eulero', name: 'Funzione φ di Eulero', emoji: 'φ', cost: 4, type: 'fn', fn: x => phi(x),
    desc: 'x → φ(x)', lesson: 'φ conta i numeri < x coprimi con x: φ(97)=96, φ(10000)=4000, φ(64)=32. Il cuore della crittografia.',
    formal: 'φ(n) = n·Π(1−1/p) sui primi distinti p|n; teorema di Eulero: a^φ(n) ≡ 1 (mod n).', unlock: 'dama' },
  { id: 'sigma', name: 'Somma dei Divisori σ', emoji: '∑', cost: 4, type: 'fn', fn: x => Math.min(10000, sigma(x)),
    desc: 'x → σ(x) (max 10000)', lesson: 'σ somma tutti i divisori: σ(97)=98, σ(64)=127. Spesso una trappola che fa risalire la vita!',
    formal: 'σ(n) = Σ_{d|n} d: funzione somma dei divisori; σ(p)=p+1 per p primo.', unlock: 'grandezero' },
  { id: 'mcm12', name: 'MCM con 12', emoji: '🔗', cost: 4, type: 'fn', fn: x => Math.min(10000, mcm(x, 12)),
    desc: 'x → MCM(x, 12) (max 10000)', lesson: 'Il minimo comune multiplo con 12: 97 → 1164, 64 → 192. Quasi sempre una trappola.',
    formal: 'MCM(a,b) = a·b/MCD(a,b): minimo comune multiplo.', unlock: null },

  /* ============ NUOVE CARTE CAMPO ============ */
  { id: 'doppiagoccia', name: 'Doppia Goccia', emoji: '💧', cost: 4, type: 'field',
    field: { kind: 'sub', n: 2 },
    desc: 'campo: −2 alla vita avversaria a ogni inizio del tuo turno',
    lesson: 'Due gocce per volta: la pazienza raddoppiata scava il doppio.',
    formal: 'Successione aritmetica di ragione 2: riduzione costante per turno.', unlock: null },
  { id: 'interesse2', name: 'Interesse Esponenziale', emoji: '🚀', cost: 5, type: 'field',
    field: { kind: 'pctInc', pct: 5 },
    desc: 'campo: −5%, poi −6%, −7%… (tasso crescente) a ogni inizio del tuo turno',
    lesson: 'L\'interesse che accelera: ogni turno il tasso sale di un punto. La crescita esponenziale non aspetta.',
    formal: 'Decadimento con tasso crescente: xₙ₊₁ = ⌊(1 − pctₙ/100)·xₙ⌋, pctₙ = 5+n.', unlock: null },
  { id: 'zenocampo', name: 'Limite di Zenone in campo', emoji: '🐢', cost: 4, type: 'field',
    field: { kind: 'zeno' },
    desc: 'campo: x → max(1, ⌊x/2⌋) a ogni inizio del tuo turno',
    lesson: 'Dimezza ogni turno… ma converge a 1, mai a 0! La tartaruga di Zenone ti ricorda che per vincere serve un colpo esatto.',
    formal: 'Iterazione di f(x)=max(1,⌊x/2⌋): converge a 1, punto fisso; mai 0.', unlock: 'mago' },
  { id: 'radicecampo', name: 'Radice in campo', emoji: '🌱', cost: 4, type: 'field',
    field: { kind: 'sqrt' },
    desc: 'campo: x → ⌊√x⌋ a ogni inizio del tuo turno',
    lesson: 'La radice che non smette: ogni turno la vita si schiaccia verso il basso. 10000 → 100 → 10 → 3.',
    formal: 'Iterazione di f(x)=⌊√x⌋: convergenza rapida verso i quadrati.', unlock: null },
  { id: 'paritacampo', name: 'Parità in campo', emoji: '⚖️', cost: 4, type: 'field',
    field: { kind: 'parity' },
    desc: 'campo: se pari → x/2; se dispari → x−1 a ogni inizio del tuo turno',
    lesson: 'La parità decide: i pari dimezzano, i dispari perdono un punto. Ogni numero ha il suo destino.',
    formal: 'Iterazione per parità: x/2 se pari, x−1 se dispari (converge a 0).', unlock: null },
  { id: 'risonanza', name: 'Risonanza', emoji: '🎵', cost: 5, type: 'field',
    field: { kind: 'resonance' },
    desc: 'campo: −1 alla vita avversaria per OGNI carta campo in gioco, a ogni inizio del tuo turno',
    lesson: 'Più campi in gioco, più forte la risonanza: ogni carta campo (tua e avversaria) amplifica il danno.',
    formal: 'Danno proporzionale alla cardinalità dell\'insieme dei campi: D = |Campi|.', unlock: null },
  { id: 'eco', name: 'Economia di Scala', emoji: '🏭', cost: 4, type: 'field',
    field: { kind: 'energyScaled', n: 1 },
    desc: 'campo: +1 energia per OGNI carta campo TUA, a ogni inizio del tuo turno',
    lesson: 'Ogni tua carta campo è una fabbrica di energia: più costruisci, più funzioni puoi giocare.',
    formal: 'Guadagno di risorsa proporzionale al numero di carte campo del proprietario.', unlock: null },

  /* ============ NUOVE ABILITÀ ============ */
  { id: 'riciclo', name: 'Riciclo', emoji: '♻️', cost: 2, type: 'ability',
    desc: 'rimuovi dal tuo campo una carta campo e ottieni +3 energia',
    lesson: 'Smantella una tua carta campo per recuperare energia: la matematica si ricicla.',
    formal: 'Conversione di una carta campo in 3 unità di risorsa.', unlock: null },
  { id: 'trasferimento', name: 'Trasferimento', emoji: '📦', cost: 5, type: 'ability',
    desc: 'sposta nel tuo campo l\'ultima carta campo avversaria',
    lesson: 'Il campo è tuo: ruba la torre, la goccia, l\'interesse. La legge del più matematico.',
    formal: 'Trasferimento di un elemento dall\'insieme campo avversario al proprio.', unlock: null },

  /* ============ FUNZIONI ALEATORIE (probabilità e statistica) ============ */
  { id: 'moneta', name: 'Lancia la Moneta', emoji: '🪙', cost: 2, type: 'fn', fn: x => (Math.random() < 0.5 ? Math.floor(x / 2) : x),
    desc: '50%: x → ⌊x/2⌋ · 50%: nessun effetto', lesson: 'La moneta: metà delle volte dimezzi, metà delle volte niente. La probabilità non promette, ma in media dimezza.',
    formal: 'Variabile aleatoria di Bernoulli: P(dimezza)=1/2; valore atteso del fattore = 0,75.', unlock: null },
  { id: 'dado', name: 'Dado del Duello', emoji: '🎲', cost: 2, type: 'fn', fn: x => x - (1 + Math.floor(Math.random() * 6)),
    desc: 'x → x − 1d6 (1–6)', lesson: 'Lancia un dado: sottrai 1, 2, 3, 4, 5 o 6. Il valore atteso è 3,5: in media perdi 3 o 4.',
    formal: 'X ~ Uniforme{1,…,6}: E[X]=3,5; Var[X]=35/12≈2,92.', unlock: null },
  { id: 'mediadadi', name: 'Media dei Dadi', emoji: '🎲', cost: 3, type: 'fn', fn: x => x - Math.floor((2 + Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6)) / 2),
    desc: 'x → x − ⌊media di 2d6⌋ (1–6)', lesson: 'Due dadi, media: i risultati estremi (1 e 6) diventano rari, i centrali frequenti. È la legge dei grandi numeri in miniatura.',
    formal: 'Media di due uniformi discrete: tende alla distribuzione triangolare; E≈3,5, varianza minore.', unlock: null },
  { id: 'variabile', name: 'Variabile Casuale', emoji: '🎰', cost: 3, type: 'fn', fn: x => x - (1 + Math.floor(Math.random() * 10)),
    desc: 'x → x − U(1…10)', lesson: 'Una variabile casuale uniforme tra 1 e 10: ogni colpo è una sorpresa tra −1 e −10.',
    formal: 'X ~ U{1,…,10}: E[X]=5,5; distribuzione uniforme discreta.', unlock: 'mago' },
  { id: 'mediana', name: 'Mediana', emoji: '📊', cost: 3, type: 'fn', fn: x => Math.max(10, Math.min(100, x)),
    desc: 'x → mediana(x, 10, 100)', lesson: 'La mediana dei tre valori {x, 10, 100}: sotto 10 sale a 10, sopra 100 scende a 100. Tutto torna verso il centro.',
    formal: 'Mediana campionaria di {x,10,100}: robusta agli estremi (a differenza della media).', unlock: null },
  { id: 'regola68', name: 'Regola 68-95-99,7', emoji: '🔔', cost: 4, type: 'fn', fn: x => x - (3 + Math.floor(Math.random() * 5)),
    desc: 'x → x − N(5, σ=2) ≈ 3–7', lesson: 'La regola empirica: il 68% dei valori di una normale sta entro una deviazione standard. Il tuo colpo: tra 3 e 7, quasi sempre vicino a 5.',
    formal: 'X ~ N(5,4): P(3≤X≤7)≈0,68; approssimata da U{3,…,7}.', unlock: null },

  /* ============ CARTE CAMPO ALEATORIE (probabilità e statistica) ============ */
  { id: 'monetacampo', name: 'Moneta del Destino', emoji: '🪙', cost: 4, type: 'field',
    field: { kind: 'coin', heads: { sub: 5 }, tails: { add: 3 } },
    desc: 'campo: a ogni tuo turno lancia la moneta — testa: −5 al nemico · croce: +3 al nemico (rischio!)',
    lesson: 'La moneta non dimentica: metà delle volte colpisce, metà delle volte aiuta il nemico. Il rischio è matematico.',
    formal: 'Processo di Bernoulli: danno D = −5 con p=1/2, D = +3 con p=1/2; E[D]=−1.', unlock: 'mago' },
  { id: 'dadocampo', name: 'Dado del Fato', emoji: '🎲', cost: 4, type: 'field',
    field: { kind: 'dice' },
    desc: 'campo: a ogni tuo turno lancia 1d6 e sottrai il risultato',
    lesson: 'Ogni turno un dado: −1, −2… −6. In media −3,5 a turno: il fato ha un valore atteso.',
    formal: 'Tick con X ~ U{1,…,6}: E[X]=3,5 per turno.', unlock: 'conte' },
  { id: 'legge', name: 'Legge dei Grandi Numeri', emoji: '📈', cost: 5, type: 'field',
    field: { kind: 'coins', n: 3 },
    desc: 'campo: a ogni tuo turno lancia 3 monete, danno = numero di teste (0–3)',
    lesson: 'Tre monete, tre teste: in media 1,5. Ma con più monete, la media si avvicina sempre di più al valore atteso: la legge dei grandi numeri.',
    formal: 'Somma di n Bernoulli(p=1/2): E=1,5; la frequenza empirica converge a p (Bernoulli, 1713).', unlock: 'mago' },
  { id: 'passeggiata', name: 'Passeggiata del Gatto', emoji: '🐾', cost: 4, type: 'field',
    field: { kind: 'walk', step: 3 },
    desc: 'campo: a ogni tuo turno, 50%: −3 al nemico · 50%: +2 alla TUA vita',
    lesson: 'La passeggiata aleatoria: il gatto va avanti o indietro. In media, un passo netto verso la vittoria.',
    formal: 'Random walk: incrementi indipendenti ±; E[Δ] = ½(−3) + ½(+2) = −0,5 per il nemico.', unlock: 'conte' },
  { id: 'normale', name: 'Distribuzione Normale', emoji: '🔔', cost: 5, type: 'field',
    field: { kind: 'normal', mu: 5, sigma: 2 },
    desc: 'campo: a ogni tuo turno danno ≈ N(5, σ=2) (tra 3 e 7, quasi sempre vicino a 5)',
    lesson: 'La campana di Gauss: i colpi estremi sono rari, quelli centrali frequenti. La natura tende alla media.',
    formal: 'Tick con X ≈ N(5,4): il 68% dei colpi in [3,7]; approssimazione discreta U{3,…,7}.', unlock: null },
  { id: 'entropia', name: 'Entropia di Shannon', emoji: '🎲', cost: 4, type: 'field',
    field: { kind: 'entropy' },
    desc: 'campo: a ogni tuo turno danno casuale da 1 a (carte in campo + 1)',
    lesson: 'Più carte in campo, più disordine, più entropia: il danno casuale cresce col caos. H = −Σ p log p.',
    formal: 'Entropia come misura del disordine: il range del danno cresce con il numero di stati (carte in campo).', unlock: null },
  { id: 'sabotaggio', name: 'Sabotaggio', emoji: '💣', cost: 5, type: 'field',
    field: { kind: 'sabotage', p: 0.5 },
    desc: 'campo: a ogni tuo turno, 50%: rimuovi l\'ultima carta campo avversaria',
    lesson: 'La probabilità al servizio del caos: metà delle volte il campo nemico perde una pedina.',
    formal: 'Evento di probabilità p=1/2: rimozione dell\'ultimo elemento dell\'insieme campo avversario.', unlock: 'grandezero' },

  /* ============ ABILITÀ ALEATORIE (probabilità e statistica) ============ */
  { id: 'monty', name: 'Paradosso di Monty Hall', emoji: '🚪', cost: 4, type: 'ability',
    desc: 'scegli 1 di 3 porte: se trovi il premio, −10 al nemico (o vittoria). Cambiare porta vince 2 volte su 3!',
    lesson: 'Tre porte, un premio: dopo che l\'host apre una porta vuota, CAMBIARE vince nel 2/3 dei casi. La probabilità controintuitiva più famosa.',
    formal: 'Probabilità condizionata: P(vincere cambiando) = 2/3, P(vincere tenendo) = 1/3 (Monty Hall, 1975).', unlock: null },
  { id: 'pascalbet', name: 'Scommessa di Pascal', emoji: '⚖️', cost: 3, type: 'ability',
    desc: 'lancia la moneta: testa → dimezza la vita avversaria · croce → niente',
    lesson: 'Pascal scommetteva sull\'esistenza di Dio con il valore atteso: qui scommetti metà della vita nemica su una testa.',
    formal: 'Valore atteso della scommessa: E = ½·(−x/2) + ½·0; la scommessa di Pascal (Pensées, 1670).', unlock: 'conte' },
  { id: 'casino', name: 'Casino Reale', emoji: '🎰', cost: 4, type: 'ability',
    desc: 'danno casuale 0–10 alla vita avversaria (valore atteso 5)',
    lesson: 'Il banco vince sempre… in media: un danno uniforme tra 0 e 10 ha valore atteso 5.',
    formal: 'X ~ U{0,…,10}: E[X]=5; il valore atteso è il banco.', unlock: 'mago' },

  /* ============ STATISTICA AVANZATA E TEORIA DELL\'INFORMAZIONE ============ */
  { id: 'poisson', name: 'Distribuzione di Poisson', emoji: '📭', cost: 5, type: 'field',
    field: { kind: 'poisson', lambda: 2 },
    desc: 'campo: a ogni tuo turno danno ~ Poisson(λ=2): spesso 0–2, raramente grosso',
    lesson: 'Gli eventi rari: lo 0 è frequente, ma qualche volta il colpo è grande. La distribuzione delle code, delle chiamate, dei terremoti.',
    formal: 'X ~ Poisson(λ=2): P(X=k)=e⁻λ·λᵏ/k!; E[X]=λ=2, Var[X]=λ.', unlock: 'mago' },
  { id: 'bayes', name: 'Teorema di Bayes', emoji: '🔬', cost: 4, type: 'ability',
    desc: 'rivela la prossima carta del mazzo avversario: scegli se scartarla',
    lesson: 'P(A|B) = P(B|A)·P(A)/P(B): conoscere l\'informazione cambia la probabilità. Vedere la prossima carta del nemico ti fa decidere meglio.',
    formal: 'Teorema di Bayes (1763): P(A|B) = P(B|A)·P(A)/P(B); aggiornamento bayesiano delle credenze.', unlock: 'mago' },
  { id: 'valoreatteso', name: 'Valore Atteso', emoji: '📐', cost: 3, type: 'ability',
    desc: 'lancia 3 dadi e infliggi la loro media (arrotondata)',
    lesson: 'E[X] = Σ x·P(x): il valore atteso di un dado è 3,5. Con 3 dadi la media si avvicina a 3,5: la legge dei grandi numeri in azione.',
    formal: 'E[X]=3,5 per 1d6; la media campionaria di n lanci converge a E[X] (Bernoulli).', unlock: null },
  { id: 'raddoppio', name: 'Scommessa Raddoppio', emoji: '💰', cost: 3, type: 'ability',
    desc: 'paga 3 energia, lancia la moneta: testa → +6 energia · croce → niente',
    lesson: 'Un gioco equo: E = ½·6 − 3 = 0. Il valore atteso di una scommessa equa è zero: né regalo, né truffa.',
    formal: 'Gioco equo: E[guadagno] = p·vincita − costo = ½·6 − 3 = 0.', unlock: 'conte' },

  /* ============ ALGEBRA ============ */
  { id: 'isola', name: 'Isola l\'incognita', emoji: '🧮', cost: 3, type: 'fn', fn: x => Math.floor((x - 50) / 2),
    desc: 'x → ⌊(x−50)/2⌋', lesson: 'Per risolvere x + 50 = 2y si applicano le operazioni inverse nell\'ordine inverso: prima −50, poi ÷2. L\'algebra è ordine.',
    formal: 'Risoluzione di un\'equazione lineare: y = (x−50)/2; applicazione di trasformazioni inverse.', unlock: null },
  { id: 'fattorizza', name: 'Fattorizza', emoji: '🧩', cost: 3, type: 'fn', fn: x => { if (x < 2) return x; for (let d = 2; d * d <= x; d++) if (x % d === 0) return d; return x; },
    desc: 'x → il più piccolo divisore proprio (se composto)', lesson: 'I numeri composti si rompono nel loro fattore più piccolo: 100 → 2, 49 → 7. I primi resistono.',
    formal: 'Fattorizzazione: il più piccolo divisore proprio di n; i primi non hanno divisori propri.', unlock: null },

  /* ============ GEOMETRIA ============ */
  { id: 'pitagora', name: 'Teorema di Pitagora', emoji: '📐', cost: 4, type: 'fn', fn: x => (x < 50 ? null : Math.floor(Math.sqrt(x * x - 2500))),
    desc: 'se x ≥ 50 → ⌊√(x²−50²)⌋ (cateto)', lesson: 'Se l\'ipotenusa è x e un cateto è 50, l\'altro cateto è √(x²−50²): riduce, e a x=50 dà 0!',
    formal: 'Pitagora: c² = a² + b²; cateto = √(ip² − 50²), definito solo se ip ≥ 50.', unlock: null },
  { id: 'cerchio', name: 'Area del Cerchio', emoji: '⭕', cost: 4, type: 'fn', fn: x => Math.floor(Math.PI * Math.pow(x / 100, 2)),
    desc: 'x → ⌊π·(x/100)²⌋', lesson: 'A = πr²: con r = x/100, l\'area di un cerchio piccolo è minuscola. I numeri piccoli collassano a zero.',
    formal: 'Area del cerchio: A = πr²; r = x/100 → A = πx²/10000.', unlock: null },
  { id: 'angoli', name: 'Angoli Supplementari', emoji: '📏', cost: 3, type: 'fn', fn: x => 180 - (x % 180),
    desc: 'x → 180 − (x mod 180)', lesson: 'Due angoli supplementari sommano a 180°: il complemento ribalta la vita verso un angolo minore.',
    formal: 'Angoli supplementari: α + β = 180°; β = 180° − (α mod 180°).', unlock: null },

  /* ============ TRIGONOMETRIA ============ */
  { id: 'seno', name: 'Seno', emoji: '🌊', cost: 3, type: 'fn', fn: x => Math.floor(x * Math.abs(Math.sin(x / 100))),
    desc: 'x → ⌊x·|sin(x/100)|⌋', lesson: 'Il seno oscilla tra −1 e 1: a volte il colpo è forte, a volte quasi nullo. Le onde non promettono nulla.',
    formal: 'sin(θ) ∈ [−1,1]; la funzione oscilla con periodo 2π (qui θ = x/100 radianti).', unlock: null },
  { id: 'coseno', name: 'Coseno', emoji: '🌊', cost: 3, type: 'fn', fn: x => Math.floor(x * Math.abs(Math.cos(x / 100))),
    desc: 'x → ⌊x·|cos(x/100)|⌋', lesson: 'Il coseno è il seno sfasato: quando il seno è massimo, il coseno è zero. L\'armonia delle onde.',
    formal: 'cos(θ) ∈ [−1,1]; cos(θ) = sin(θ + π/2).', unlock: null },

  /* ============ LOGICA E INSIEMI ============ */
  { id: 'and', name: 'AND Logico', emoji: '🧠', cost: 3, type: 'fn', fn: x => (x % 6 === 0) ? Math.floor(x / 6) : x - 1,
    desc: 'se x è multiplo di 2 E di 3 → x/6, altrimenti x−1', lesson: 'L\'AND richiede ENTRAMBE le condizioni: un multiplo di 6 è pari E divisibile per 3. La tavola di verità non perdona.',
    formal: 'AND: (x pari) ∧ (x multiplo di 3) ⇔ x multiplo di 6 (MCM).', unlock: null },
  { id: 'or', name: 'OR Logico', emoji: '🧠', cost: 3, type: 'fn', fn: x => (x % 2 === 0 || x % 5 === 0) ? Math.floor(x / 5) : x - 1,
    desc: 'se x è pari O multiplo di 5 → x/5, altrimenti x−1', lesson: 'L\'OR basta UNA condizione: 100 è pari e finisce per 0. Le porte logiche sono il cervello dei computer.',
    formal: 'OR: (x pari) ∨ (x multiplo di 5).', unlock: null },
  { id: 'insiemi', name: 'Appartenenza', emoji: '⊂', cost: 3, type: 'fn', fn: x => (x % 7 === 0) ? Math.floor(x / 7) : x - 1,
    desc: 'se x ∈ {multipli di 7} → x/7, altrimenti x−1', lesson: 'L\'appartenenza a un insieme: 49 è nell\'insieme dei multipli di 7, 50 no. Gli insiemi classificano il mondo.',
    formal: 'Appartenenza: x ∈ 7ℤ ⇔ 7 | x.', unlock: null },

  /* ============ COMBINATORIA ============ */
  { id: 'binomiale', name: 'Coefficiente Binomiale', emoji: '🔢', cost: 4, type: 'fn', fn: x => Math.min(10000, Math.floor(x * (x - 1) / 2)),
    desc: 'x → ⌊x(x−1)/2⌋ (C(x,2))', lesson: 'In quanti modi scegli 2 elementi da x? C(x,2) = x(x−1)/2. Quasi sempre una trappola che fa crescere: 100 → 4950!',
    formal: 'Coefficiente binomiale C(n,2) = n(n−1)/2; numero di coppie non ordinate.', unlock: null },
  { id: 'disposizioni', name: 'Disposizioni', emoji: '🔢', cost: 4, type: 'fn', fn: x => Math.min(10000, x * (x - 1)),
    desc: 'x → ⌊x(x−1)⌋ (D(x,2))', lesson: 'Le disposizioni contano anche l\'ordine: D(x,2) = x(x−1), il doppio delle combinazioni. La trappola più insidiosa.',
    formal: 'Disposizioni D(n,2) = n(n−1) = 2·C(n,2); l\'ordine conta.', unlock: null },

  /* ============ GRAFI E RETI ============ */
  { id: 'grado', name: 'Grado del Vertice', emoji: '🕸️', cost: 3, type: 'fn', fn: x => { let c = 0; for (let i = 1; i <= x; i++) if (x % i === 0) c++; return c; },
    desc: 'x → numero di divisori di x', lesson: 'Nel grafo dei divisori, il "grado" di un vertice è il numero di archi che lo toccano: 12 ha 6 divisori, 97 solo 2.',
    formal: 'Grado di un vertice = numero di divisori (funzione τ(n)); τ(p)=2 per p primo.', unlock: null },
  { id: 'rete', name: 'Rete Avversaria', emoji: '🌐', cost: 4, type: 'field',
    field: { kind: 'energyOpp', n: 1 },
    desc: 'campo: +1 energia per OGNI carta campo AVVERSARIA, a ogni inizio del tuo turno',
    lesson: 'In una rete, i nodi vicini contano: ogni carta campo del nemico è un collegamento che puoi sfruttare.',
    formal: 'Influenza di rete: guadagno di risorsa proporzionale al grado della rete avversaria.', unlock: null },

  /* ============ ALGEBRA LINEARE ============ */
  { id: 'vettore', name: 'Vettore (3,4)', emoji: '➡️', cost: 3, type: 'fn', fn: x => Math.floor(x / 5),
    desc: 'x → ⌊x/5⌋ (modulo = 5)', lesson: 'Il modulo del vettore (3,4) è √(3²+4²) = 5: una terna pitagorica. Proiettare la vita lungo il vettore la divide per 5.',
    formal: '|(3,4)| = √(3²+4²) = 5; proiezione: x/|v|.', unlock: null },
  { id: 'determinante', name: 'Determinante 2×2', emoji: '🔲', cost: 4, type: 'fn', fn: x => Math.min(10000, 7 * x - 6),
    desc: 'x → 7x − 6 (det [[x,3],[2,7]])', lesson: 'det([[a,b],[c,d]]) = ad − bc: con a=x, b=3, c=2, d=7 → 7x − 6. Quasi sempre cresce: una trappola matriciale.',
    formal: 'Determinante di una matrice 2×2: ad − bc.', unlock: 'grandezero' },

  /* ============ EQUAZIONI DIFFERENZIALI ============ */
  { id: 'logistica', name: 'Equazione Logistica', emoji: '🐌', cost: 4, type: 'fn', fn: x => Math.floor(x * (1 - x / 10000)),
    desc: 'x → ⌊x·(1 − x/10000)⌋', lesson: 'dP/dt = rP(1−P/K): la crescita logistica rallenta vicino alla capacità K=10000 e collassa a zero: 10000 → 0!',
    formal: 'Equazione logistica di Verhulst: dP/dt = rP(1−P/K); punti fissi 0 e K.', unlock: null },

  /* ============ FRAZIONI E RAPPORTI ============ */
  { id: 'aureo', name: 'Sezione Aurea', emoji: '🌀', cost: 3, type: 'fn', fn: x => Math.floor(x / 1.6180339887),
    desc: 'x → ⌊x/φ⌋', lesson: 'φ = (1+√5)/2 ≈ 1,618: dividere per la sezione aurea riduce del 38%. La proporzione che la natura ama.',
    formal: 'Sezione aurea φ = (1+√5)/2; φ² = φ + 1.', unlock: null },
  { id: 'percentuale', name: 'Percentuale (37%)', emoji: '💯', cost: 3, type: 'fn', fn: x => Math.floor(x * 0.37),
    desc: 'x → ⌊0,37·x⌋', lesson: 'Il 37% di qualcosa: un rapporto in percentuale applicato alla vita. Le percentuali sono rapporti con denominatore 100.',
    formal: 'Percentuale: x·37/100; rapporto normalizzato.', unlock: null },

  /* ============ CRITTOGRAFIA ============ */
  { id: 'rsa', name: 'RSA', emoji: '🔐', cost: 4, type: 'fn', fn: x => { if (x < 2) return x - 1; for (let d = Math.floor(x / 2); d >= 2; d--) if (x % d === 0) return d; return x - 1; },
    desc: 'x → il più grande divisore proprio (se composto), altrimenti x−1', lesson: 'Spezzare RSA significa fattorizzare n = p·q: qui il più grande fattore cade subito. 100 → 50, 97 → 96.',
    formal: 'RSA: la sicurezza dipende dalla difficoltà di fattorizzare n = pq; qui la fattorizzazione è immediata.', unlock: 'dama' },

  /* ============ INFORMATICA E ALGORITMI ============ */
  { id: 'sortcifre', name: 'Bubble Sort (cifre)', emoji: '📊', cost: 3, type: 'fn', fn: x => parseInt(String(x).split('').sort().join(''), 10) || 0,
    desc: 'x → cifre ordinate in modo crescente', lesson: 'L\'ordinamento riordina: 97 → 79 (trappola!), 10000 → 1, 4096 → 469. Bubble sort scambia finché non è in ordine.',
    formal: 'Ordinamento crescente delle cifre (bubble sort); complessità O(d²) con d = numero di cifre.', unlock: null },
  { id: 'if', name: 'Istruzione if/else', emoji: '💻', cost: 2, type: 'fn', fn: x => x > 100 ? x - 50 : x - 1,
    desc: 'se x > 100 → x−50, altrimenti x−1', lesson: 'La logica dei programmi: if (condizione) { azione } else { altra }. La scelta dipende dal valore della vita.',
    formal: 'Selezione condizionale: rami if/else; ramo preso in base alla condizione x > 100.', unlock: null },
  { id: 'hash', name: 'Funzione Hash', emoji: '🔀', cost: 4, type: 'fn', fn: x => (x * 31) % 10000,
    desc: 'x → (31·x) mod 10000', lesson: 'L\'hash sparpaglia i valori: 3226 → 6 (crollo!), 10000 → 0 (vittoria!), 100 → 3100 (trappola). Imprevedibile come un buon hash.',
    formal: 'Funzione hash modulare: h(x) = (ax + b) mod m con a=31, m=10000; distribuzione pseudo-uniforme.', unlock: 'mago' },
];

function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function mcd(a, b) { while (b) { const t = b; b = a % b; a = t; } return a; }
function mcm(a, b) { return a === 0 || b === 0 ? 0 : (a / mcd(a, b)) * b; }
function phi(n) {
  if (n < 1) return 0;
  let result = n, x = n;
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      while (x % p === 0) x = Math.floor(x / p);
      result -= Math.floor(result / p);
    }
  }
  if (x > 1) result -= Math.floor(result / x);
  return result;
}
function sigma(n) {
  if (n < 1) return 0;
  let sum = 0;
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      sum += i;
      if (i !== n / i) sum += n / i;
    }
  }
  return sum;
}

/* Boss: vita-firma, difficoltà AI, citazione, carta regalo */
const BOSSES = [
  { id: 'micio', name: 'Micio Numerino', emoji: '🐱', life: 30, diff: 'facile',
    quote: '«Conta con me: ogni numero è un passo verso lo zero.»',
    reward: 'sub13', reward2: 'goccia', meditazione: 'Lo zero non è il nulla: è un posto dove arrivare con precisione.' },
  { id: 'conte', name: 'Il Conte alla Rovescia', emoji: '🧛', life: 4096, diff: 'medio',
    quote: '«Il tempo, che tutto toglie… e il mio conto scende, scende.» — da Leopardi, A Silvia',
    reward: 'congela', reward2: 'conto', meditazione: 'Il tempo fugge come i numeri: ma si può contare all\'indietro con grazia.' },
  { id: 'dama', name: 'La Dama dei Primi', emoji: '👑', life: 97, diff: 'medio',
    quote: '«I numeri primi sono gli atomi dell\'aritmetica.» — G.H. Hardy',
    reward: 'primo', reward2: 'ragnafib', meditazione: 'I primi sono indistruttibili: 97 non si divide, si ammira — e poi si azzera con un colpo degno.' },
  { id: 'mago', name: 'Il Mago dei Moduli', emoji: '🧙', life: 10000, diff: 'difficile',
    quote: '«Tutto ritorna: 10000 mod 7 = 4, e il ciclo ricomincia.» — dall\'eterno ritorno di Nietzsche',
    reward: 'infinito', reward2: 'erosione', meditazione: 'Il modulo è l\'orologio dell\'universo: tutto torna, nulla si perde, lo zero è l\'inizio.' },
  { id: 'grandezero', name: 'Il Grande Zero', emoji: '🕳️', life: 1, diff: 'difficile',
    quote: '«Ex nihilo nihil: dal nulla nulla. Ma io sono il nulla che vale.» — da Lucrezio, De rerum natura',
    reward: 'scambio', reward2: 'torre', meditazione: 'Lo zero non è il nulla: è un numero, un\'invenzione geniale, il vuoto che vale. Ora lo sai.' },
];

/* Dialoghi iniziali dei boss */
const BOSS_INTRO = {
  micio: 'Benvenuto, Duellante. Io sono Micio Numerino e ti insegno la regola d\'oro: per vincere devi portare la mia vita ESATTAMENTE a 0. Se un colpo la porterebbe sotto, viene bloccato. Scegli la tua vita e inizia!',
  conte: 'Ah, un nuovo numero da contare all\'indietro… La mia vita è 4096, una potenza di 2. Riuscirai a dimezzarla fino a zero?',
  dama: 'La mia vita è 97: un numero primo. Nessun divisore, solo il colpo del Primo o la tua astuzia potranno azzerarmi.',
  mago: 'Diecimila vite, e tutte tornano: i moduli girano come le stagioni. Trovami lo zero, se puoi.',
  grandezero: 'Io sono lo Zero. La mia vita è 1: un solo passo mi separa dal nulla. Ma attenzione: chi tocca lo zero senza precisione, perde.',
};

const BOSS_WIN = {
  micio: 'Colpo perfetto! Hai capito la regola dello zero esatto. Ecco la tua ricompensa.',
  conte: 'Il Conte ha finito di contare. Il tempo, per lui, si è fermato a zero.',
  dama: 'La Dama si inchina: anche un primo può cadere, se il colpo è matematicamente perfetto.',
  mago: 'Il ciclo si è chiuso: diecimila vite ridotte a zero. Il Mago applaude.',
  grandezero: 'Hai azzerato lo Zero. E ora sai la verità: lo zero non è il nulla. È il punto da cui tutto ricomincia.',
};

/* Domande del Diario dello Zero */
const DIARY_QUESTIONS = [
  { q: 'Che cos\'è lo zero?', hint: 'Un numero? Un\'invenzione indiana? Il vuoto che vale? E perché senza di lui i numeri non starebbero in piedi?' },
  { q: 'Il nulla esiste?', hint: 'Lucrezio: «ex nihilo nihil». Ma se il nulla non è nulla… cosa c\'è dove non c\'è nulla?' },
  { q: 'La matematica si scopre o si inventa?', hint: 'Il 7 esisteva prima che qualcuno lo contasse? E i numeri immaginari, dove vivono?' },
  { q: 'Perché i numeri primi sono infiniti?', hint: 'Euclide lo dimostrò per assurdo: supponi di averli tutti… e costruiscine uno nuovo. (Elementi, IX.20)' },
  { q: 'I numeri immaginari esistono?', hint: 'i² = −1: nessun numero reale lo fa. Eppure i complessi fanno funzionare elettricità, onde e quantistica.' },
  { q: 'Cosa significa tendere a un limite?', hint: 'Zenone diceva che Achille non raggiunge mai la tartaruga. La somma ½+¼+⅛+… tende a 1. E il naufragar m\'è dolce in questo mare.' },
];

/* Citazioni di chiusura del Diario */
const DIARY_FOOTER = '«E il naufragar m\'è dolce in questo mare.» — Giacomo Leopardi, L\'infinito';
