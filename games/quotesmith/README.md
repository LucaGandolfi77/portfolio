# QuoteSmith 💬❓

## Chi l'ha detto? Il quiz di citazioni offline

> *«Io so che nessuno sa, ma tutti noi sappiamo di non sapere.»*
> — Socrate (attribuito), reinterpretato da QuoteSmith

---

## 1. L'idea in una frase

**Una PWA installabile sul telefono e giocabile offline in cui devi indovinare chi ha pronunciato una citazione famosa** — dieci citazioni per round, quattro nomi tra cui scegliere, un punteggio da battere. Un archivio di oltre **1000 citazioni reali**, bilanciato tra inglese e italiano, in 32 categorie.

## 2. Perché un quiz di citazioni?

Perché una citazione è una **capsula di memoria condivisa**: riconoscere *«To be, or not to be»* o *«L'amor che move il sole e l'altre stelle»* non è cultura da ripetere a memoria, è il riconoscimento di qualcosa che ci lega — al cinema, alla letteratura, alla storia, alla musica, ai meme.

QuoteSmith trasforma quel riconoscimento in un gioco:

- **nessuna registrazione, nessuna connessione**: tutto è offline, tutto è locale;
- **round brevi**: 10 citazioni, 4 nomi, un minuto scarso;
- **memoria che si allena**: a ogni risposta giusta il gioco ti dice chi l'ha detto — impari giocando.

## 3. Come si gioca

1. **Scegli la lingua** del quiz: English 🇬🇧 o Italiano 🇮🇹 (le citazioni sono tradotte in entrambe).
2. **Scegli la categoria**: 32 mondi, da Film a Letteratura, da Scienza a Saggezza, fino all'Umorismo. **Selezione multipla**: combina più mondi nello stesso round.
3. **Scegli la difficoltà**:
   - **Facile** — frasi iconiche che tutti conoscono;
   - **Medio** — serve un po' di memoria;
   - **Difficile** — per intenditori.
4. **Gioca**: leggi la citazione, scegli tra 4 autori possibili. Risposta giusta = +1 e streak che cresce; sbagliata = la streak si azzera ma la risposta giusta ti viene mostrata (così impari).
5. **Rivedi il round**: alla fine puoi rileggere tutte le domande con le risposte, e se hai fatto 8+ su 10 parte una pioggia di coriandoli. 🎉

Ogni citazione ha anche un pulsante **🔊 Ascolta** che la legge ad alta voce (sintesi vocale del dispositivo, nessuna rete necessaria).

## 4. Le 32 categorie

| Categoria | Icona | Esempi |
|---|---|---|
| Film | ▣ | Terminator, Il Joker, Dorothy Gale |
| Serie TV | ▤ | Ned Stark, Walter White, Spock |
| Animazione | ✦ | Homer Simpson, Buzz Lightyear, Dory |
| Canzoni | ♫ | Queen, John Lennon, The Beatles |
| Libri | ▥ | Shakespeare, Orwell, Tolkien, Melville |
| Storia | ◇ | Giulio Cesare, Martin Luther King, Churchill |
| Videogiochi | ⌘ | Zelda, Diablo, Portal, Fallout |
| Proverbi | ↔ | proverbi inglesi, italiani, latini |
| Anime | ◎ | Naruto, One Piece, Dragon Ball |
| Scienza | ∑ | Galileo, Einstein, Marie Curie, Sagan |
| Sport | △ | Muhammad Ali, Gretzky, Pele |
| Internet | # | Doge, Boromir meme, «This is fine» |
| Filosofia | ? | Socrate, Nietzsche, Eraclito, Rousseau |
| Cucina | ◇ | Julia Child, Brillat-Savarin, Escoffier |
| **Letteratura** | ▦ | Dante, Manzoni, Calvino, Tolstoj, Austen |
| **Poesia** | ✎ | Leopardi, Ungaretti, Dickinson, Frost, Neruda |
| **Arte** | ◈ | Van Gogh, Picasso, Dalí, Frida Kahlo |
| **Amore** | ♥ | Tagore, Emily Brontë, Pascal |
| **Saggezza** | ❖ | Lao Tzu, Confucio, Seneca, Marco Aurelio |
| **Tecnologia** | ⚙ | Turing, Jobs, Lovelace, Clarke |
| **Natura** | ☘ | John Muir, Thoreau, Rachel Carson |
| **Motivazione** | ▲ | Mandela, Eleanor Roosevelt, Maya Angelou |
| **Umorismo** | ☺ | Oscar Wilde, Groucho Marx, Steven Wright |
| **Supereroi** | ★ | Spider-Man, Iron Man, Batman, Thor |
| **Gatti** | ฅ | Freud, Terry Pratchett, Mark Twain |
| **Caffè** | ☕ | T.S. Eliot, Jackie Chan, David Letterman |
| **Giochi di parole** | ✱ | bisticci, colmi, battute intelligenti |
| **Bibbia** | ✝ | Genesi, Salmi, Matteo, Giovanni |
| **Moda** | ✂ | Coco Chanel, Oscar Wilde, Armani |
| **Viaggi** | ✈ | Mark Twain, Amelia Earhart, Dalai Lama |
| **Soldi** | $ | Woody Allen, Bob Hope, Dickens |
| **Infanzia** | ☼ | Dr. Seuss, Mark Twain, Tom Robbins |

## 5. Dove vivono le citazioni: `quotes.json`

Tutte le citazioni stanno in **un unico file JSON** (`quotes.json`), separato dal codice:

```json
{
  "version": 4,
  "quotes": [
    { "text": "L'amor che move il sole e l'altre stelle.", "author": "Dante Alighieri",
      "category": "literature", "lang": "it", "difficulty": "medium" }
  ]
}
```

**Perché JSON e non codice?**
- **Dati separati dalla logica**: il motore del gioco (`engine.js`) non cambia mai quando si aggiunge una citazione;
- **Editabile da chiunque**: un file JSON si può modificare, tradurre, ordinare e validare con qualsiasi strumento (o a mano);
- **Controllo di qualità**: lo script di merge applica deduplicazione per testo+lingua e validazione di categoria/lingua/difficoltà;
- **PWA-friendly**: il file è piccolo (decine di KB), viene precache dal service worker e funziona offline; il caricamento asincrono è gestito con un fallback che tiene il gioco sempre avviabile.

**Come si carica**: `data.js` è un loader minimale — in Node legge il JSON dal disco (per i test), nel browser lo scarica con `fetch('quotes.json')` esponendo `window.QUOTESMITH_READY`. Se la rete fallisce, ripiega sulla cache del service worker e, in ultima istanza, su un **seed incorporato di 64 citazioni** (una per categoria in EN e IT) così il gioco funziona anche come `file://` senza service worker.

**Come si aggiunge una citazione**: apri `quotes.json`, aggiungi un oggetto alla lista `quotes` (rispettando le chiavi qui sopra) e alza `version` di un'unità. La cache del service worker viene invalidata a ogni cambio di versione (`sw.js` usa `quotesmith-v4`).

## 6. Struttura della cartella

```
games/quotesmith/
├── index.html            ← una sola pagina: setup, gioco, risultati
├── style.css             ← estetica scura, mobile-first, safe-area
├── quotes.json           ← TUTTE le citazioni (dati puri)
├── data.js               ← loader JSON (Node: disco; browser: fetch + cache + seed)
├── engine.js             ← motore: round, distrattori, categorie, difficoltà
├── script.js             ← UI: setup, domande, feedback, risultati, confetti
├── sw.js                 ← offline-first (cache v4, quotes.json precached)
├── manifest.webmanifest  ← installazione PWA
├── icons/icon.svg        ← icona
└── README.md
```

## 7. Specifica tecnica

- **Stack**: HTML/CSS/vanilla JavaScript, zero dipendenze, zero build — come gli altri giochi del catalogo;
- **Installabile**: `manifest.webmanifest` (`display: standalone`, tema scuro) + icona SVG;
- **Offline totale**: `sw.js` cache-first su tutti gli asset, incluso `quotes.json`; nessuna risorsa esterna, nessun font CDN;
- **Persistenza**: `localStorage` (lingua scelta, punteggio migliore, streak migliore);
- **Mobile-first**: touch, `100dvh`, safe-area, testi grandi, vibrate su risposta;
- **Accessibilità**: `aria-live` sui feedback, pulsanti con etichette, contrasto alto, sintesi vocale.

### Stato attuale: ✅ costruito e giocabile

- **Oltre 1000 citazioni reali** (1284) in 32 categorie, bilanciate EN/IT (~50/50), senza duplicati (dedup per testo+lingua)
- **Selezione multipla delle categorie**: tocca più mondi per mescolarli in un round (o usa Tutti/Nessuno); l'anteprima mostra quanti mondi e quante citazioni hai selezionato
- **Round di 10** con 4 autori a scelta (3 distrattori intelligenti: stessi mondi prima, poi stessa lingua)
- **3 difficoltà** e **2 lingue**, combinabili con ogni categoria
- **Recensione finale** del round + **punteggio migliore** e **streak migliore** salvati
- **Sintesi vocale** della citazione (SpeechSynthesis, offline)
- **Confetti** da 8/10 in su, **vibrazione** tattile sulle risposte
- **Fallback resiliente**: anche senza rete e senza service worker il gioco parte (seed incorporato)

### Verifiche eseguite

- `quotes.json` valido, nessuna voce malformata, nessun duplicato (script di merge + validatore)
- Motore: round completi da 10 domande × 4 opzioni su tutte le 32 categorie, in entrambe le lingue e tutte le difficoltà
- Browser simulato (mock DOM): fetch del JSON → 32 bottoni categoria → selezione multipla → avvio round → risposta → feedback → avanzamento → quit
- Fallback offline: fetch fallita → seed incorporato (64 citazioni, 32 categorie) → gioco avviabile
- Tutti gli asset di `sw.js` esistono (l'installazione della cache non fallisce)
