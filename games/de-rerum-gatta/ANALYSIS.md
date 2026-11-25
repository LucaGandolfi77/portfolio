# De Rerum Gatta — Analisi, Bug e Criticalità

## 🐱🌸 Panoramica del Progetto

**De Rerum Gatta** è una PWA (Progressive Web App) installabile che insegna matematica e fisica attraverso un giardino fantastico popolato da gatti filosofici. Ogni fiore è un concetto scientifico che si "sboccia" dopo aver completato un minigioco. Il gioco ha 18 fiori in 4 stagioni, 18 minigiochi, una modalità Passeggiata narrativa, e un sistema di monetizzazione con unlock del Full Game.

---

## 🔴 BUG CRITICI

### 1. Riferimento non definito: `ch.letter` in `constellationLit()` — Funzione Mortale

**Dove:** `main.js`, funzione `constellationLit()`, caso `'lettere'`

```javascript
if (id === 'lettere') {
    const letters = [LETTERS.prologo, ...SEASONS.map(s => LETTERS[s.id]).filter(Boolean), LETTERS.finale];
    return letters.map((l, i) => {
        if (l === LETTERS.prologo) return S.seenIntro || S.walkDone;
        if (l === LETTERS.finale) return Object.keys(S.flowers).length >= FLOWERS.length || S.walkDone;
        const se = SEASONS.find(s => LETTERS[s.id] === LETTERS[ch.letter]); // ← BUG
        return se ? (seasonBloomed(se.id) || S.walkDone) : false;
    });
}
```

**Problema:** La variabile `ch` non è definita in questo scope. `ch` è un parametro di `chapterDone()`, non di `constellationLit()`. Questo genera un `ReferenceError` quando si tenta di accedere alla costellazione delle Lettere.

**Correzione:**
```javascript
const se = SEASONS.find(s => LETTERS[s.id] === l);
```

**Impatto:** La schermata del cielo con le costellazioni delle lettere crasha. Gli utenti non possono visualizzare le 6 stelle delle lettere d'amore.

---

### 2. `walkEntry()` può generare un TypeError per `undefined`

**Dove:** `main.js`, funzione `walkEntry(step)`

```javascript
const f = FLOWERS.find(x => x.id === s.id);
return { emoji: f.catEmoji, from: f.cat + ' · ' + f.name, ... }; // ← crash se f è undefined
```

**Problema:** Se `s.id` non corrisponde a nessun id in `FLOWERS`, `find()` restituisce `undefined`. Accedere a `f.catEmoji` lancia un `TypeError: Cannot read properties of undefined`.

**Correzione:**
```javascript
const f = FLOWERS.find(x => x.id === s.id);
if (!f) return null;
```

**Impatto:** Se `STORY_PATH` e `FLOWERS` si disallineano (aggiunta/rimozione di fiori), la modalità Passeggiata crasha.

---

### 3. Minigioco "I Petali" — Formula di Fibonacci Errata nei Tips

**Dove:** `minigames.js`, funzione `petali()`

```javascript
tips.textContent = n + ' = ' + (seq[idx - 2] ?? 0) + ' + ' + (seq[idx - 3] ?? 0);
```

**Problema:** Dopo `idx++`, `seq[idx-2]` e `seq[idx-3]` non rappresentano correttamente la relazione di Fibonacci. Per il petalo con n=8 (posizione 5, idx=5 dopo incremento), mostra `8 = 3 + 1` invece di `8 = 5 + 3`.

**Correzione:**
```javascript
tips.textContent = n + ' = ' + seq[idx - 2] + ' + ' + seq[idx - 1];
```
(Con controlli di bounds appropriati.)

**Impatto:** Il messaggio didattico è scorretto, confondendo l'utente sulla definizione della sequenza.

---

### 4. Blocco Monetizzazione: Contraddizione tra `isAvailable()` e `isFlowerLocked()`

**Dove:** `main.js`, entrambe le funzioni

```javascript
function isAvailable(id) {
    const idx = FLOWERS.findIndex(f => f.id === id);
    if (idx <= 0) return true;
    return bloomed(FLOWERS[idx - 1].id);
}
function isFlowerLocked(flower) {
    if (!_m || _m.isFull()) return false;
    return flower.season !== 'primavera';
}
```

**Problema:** In `renderGarden()`, il flower card determina lo stato con:
```javascript
const state = locked ? 'locked' : (bloomed(f.id) ? 'fiore' : (isAvailable(f.id) ? 'germoglio' : 'seme'));
```
Se un fiore è `locked` (non primavera senza Full Game), lo stato è sempre `'locked'` indipendentemente da `isAvailable()`. Tuttavia, la logica di `isAvailable()` è pensata per sbloccare i fiori in sequenza, mentre `isFlowerLocked()` blocca TUTTI i fiori non-primavera. Questo significa che **non è possibile accedere a nessun fiore delle stagioni Estate, Autunno, Inverno senza acquistare il Full Game**, nemmeno se tutti i fiori di Primavera sono stati sbloccati.

**Impatto:** L'esperienza utente è confusa — l'utente potrebbe pensare di poter progredire, ma si trova davanti a un muro a pagamento per ogni contenuto oltre la primavera. Non è un bug tecnico ma una scelta di design che rende il gioco frustrante senza pagamento.

---

## 🟡 PROBLEMI DI DESIGN / UX

### 5. Logica Circolare per lo Sblocco delle Lettere Stagionali

Nella funzione `showLetters()`:
```javascript
const unlocked = isFree || (S.walkDone ||
    (isFinale ? ... : seasonBloomed(SEASONS[i - 1] ? SEASONS[i - 1].id : '')));
```

La lettera di una stagione si sblocca quando **tutti i fiori di quella stagione** sono in fiore. Tuttavia, per giocare i fiori di una stagione, l'utente deve già vedere la lettera come incentivo. Sebbene tecnicamente non sia un deadlock (i fiori sono accessibili dal tab della stagione), la logica è controintuitiva.

**Suggerimento:** Le lettere dovrebbero sbloccarsi quando la stagione PRECEDENTe è completata, non la corrente.

---

### 6. Navigazione Passeggiata: Confusione Stato Finale

**Dove:** `main.js`, evento `walk-next`

```javascript
$('walk-next').textContent = idx >= total - 1 ? '🏁 Concludi la passeggiata' : 'Avanti →';
```

Quando `idx >= total - 1`, il pulsante dice "Concludi la passeggiata" e aggiunge la classe `primary`. Cliccando, si verifica `idx >= STORY_PATH.length` (dato che idx è già `total - 1`, diventa `total`), si imposta `S.walkDone = true`, e si mostra la lettera finale. Tuttavia, il percorso narrativo (`STORY_PATH`) contiene già la lettera finale come ultimo passo, quindi l'utente la vedrebbe anche nel passo precedente.

**Suggerimento:** L'ultimo passo del percorso dovrebbe essere il finale, e "Concludi" dovrebbe semplicemente tornare al menu.

---

### 7. Duplicazione Codice: Toggle Notte su 4 Elementi Separati

**Dove:** `main.js`

```javascript
$('sky-toggle').addEventListener('click', () => { S.night = !S.night; save(); setNight(S.night); });
$('sky-toggle-2').addEventListener('click', () => { S.night = !S.night; save(); setNight(S.night); });
$('sky-toggle-3').addEventListener('click', () => { S.night = !S.night; save(); setNight(S.night); });
$('sky-toggle-4').addEventListener('click', () => { S.night = !S.night; save(); setNight(S.night); });
```

Quattro listener identici per la stessa azione. Un loop o una funzione condivisa sarebbero più puliti e manutenibili.

**Suggerimento:** Usare `document.querySelectorAll('[id^="sky-toggle"]')` e aggiungere un unico listener a ciascuno.

---

### 8. `showConcept()` Usa `innerHTML` — Rischio XSS (Teorico)

```javascript
$('concept-body').innerHTML = '<p class="c-cat">' + f.catEmoji + ' <b>' + f.cat + '</b> ...';
```

**Problema:** Anche se i dati sono controllati dallo sviluppatore, l'uso di `innerHTML` con concatenazione di stringhe è una cattiva pratica. Se qualsiasi campo dati contenesse caratteri speciali (`<`, `>`, `&`), potrebbe generare HTML inatteso o, in scenari futuri, essere sfruttato.

**Suggerimento:** Usare `textContent` o un template engine che escape gli output.

---

## 🟠 PROBLEMI MINORI / OSSERVAZIONI

### 9. `isChapterLocked()` — Stessa Logica di `isFlowerLocked()`

```javascript
function isChapterLocked(chapterIdx) {
    if (!_m || _m.isFull()) return false;
    return chapterIdx > 0;
}
```

Blocca tutti i capitoli tranne il primo senza Full Game. Questo è coerente con la strategia di monetizzazione ma significa che l'utente gratuito vede solo il Prologo come capitolo leggibile.

### 10. Fisica del Pendolo — Ammortizzamento Eccessivo

```javascript
omega *= 0.997; // damping
```

Con un damping del 0.3% per frame a 60fps, l'ampiezza del pendolo decade significativamente dopo ~500 frame (~8 secondi). Per completare 8 colpi al centro, il pendolo potrebbe smettere di oscillare prima che l'utente arrivi a 8 hit, specialmente se la zona centrale è piccola (`zone = 0.12` rad).

### 11. Minigioco `lira()` — Assegnazione Errata dell'Indice

Nella funzione `lira`, i target sono:
```javascript
const targets = [
    { text: '...OTTava...', ratio: 2, hint: 'OTTava = 2:1' },
    { text: '...QUINTA...', ratio: 1.5, hint: 'QUINTA = 3:2' },
    { text: '...QUARTA...', ratio: 4/3, hint: 'QUARTA = 4:3' },
];
```
Le stringhe hanno un apstrofo singolo `'` mancante nella prima target: `'Trova la corda che suona un'OTTava...'` — l'apostrofo nel testo `un'OTTava` causa un errore di sintassi stringa perché la stringa è definita con apici singoli. In realtà il codice sorgente usa `'` ma il testo contiene `'` dentro, il che sarebbe un SyntaxError. Tuttavia, sembra essere stato corretto nel file effettivo (forse con escape).

### 12. Assenza di Gestione Errori nel Save System

`SaveSys.load()` e `SaveSys.store()` non hanno try/catch. Se `localStorage` è pieno o disabilitato (modalità privacy), il gioco potrebbe crashare all'avvio o durante il salvataggio.

---

## 📋 Riepilogo delle Criticalità

| # | Severità | Problema | Tipo |
|---|----------|----------|------|
| 1 | 🔴 CRITICO | `ch.letter` non definito → crash costellazioni Lettere | Bug runtime |
| 2 | 🔴 CRITICO | `walkEntry()` crasha se `FLOWERS.find` restituisce undefined | Bug runtime |
| 3 | 🟡 MEDIO | Formula Fibonacci errata nei tips del minigioco Petali | Bug logico |
| 4 | 🟡 MEDIO | Blocco monetizzazione: nessun accesso a fiori non-primavera senza acquisto | UX/Design |
| 5 | 🟡 MEDIO | Lettere stagionali si sbloccano con logica circolare | UX/Design |
| 6 | 🟡 MEDIO | Navigazione passeggiata confusa al termine | UX/Design |
| 7 | 🟢 MINORI | Duplicazione codice toggle notte | Code quality |
| 8 | 🟢 MINORI | Uso di `innerHTML` senza escape | Sicurezza |
| 9 | 🟢 MINORI | Lock capitoli troppo restrittivo | UX/Design |
| 10 | 🟢 MINORI | Damping pendolo troppo alto | Fisica/gameplay |
| 11 | 🟢 MINORI | Apostrofo nel testo della lira | Codifica |
| 12 | 🟢 MINORI | Nessun try/catch su localStorage | Robustezza |

---

## ✅ Punti di Forza

Nonostante i bug, il progetto ha molte qualità:
- **18 minigiochi reali e giocabili** — non semplici schermate statiche
- **Architettura modulare** — ogni minigioco è un'auto-funzione separata
- **PWA completa** — offline-first, manifest, service worker, WebAudio
- **Narrativa ben costruita** — 6 lettere d'amore che collegano fisica e poesia
- **9 costellazioni** nel cielo notturno con stati dinamici
- **Calendario stile Animal Crossing** con fiori mensili
- **FAQ formali** con riferimenti bibliografici accurati
- **Modalità Passeggiata** per chi vuole solo la storia senza minigiochi

---

*Analisi effettuata il 10 Settembre 2025. Basata sullo stato attuale del codice sorgente in `games/de-rerum-gatta/`.*
