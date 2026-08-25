# 🍸 SHOTMIND — il Mastermind Alcolico

Mastermind in versione da serata: una parola segreta, sei tentativi, e chi sbaglia beve.
La logica di gioco (parole, feedback, regole della bevuta) vive in `game.js` (modulo puro,
trasferibile su un backend), il client in `script.js` gestisce UI, bevute e scoreboard.
**PWA**: installabile sul telefono e giocabile offline.

## Come si gioca

1. **Cantiniere** (uno sceglie) o **Casuale** (decide il caso).
2. Con il Cantiniere: passa il telefono, tocca la parola segreta (dal pacchetto o una custom da 4-8 lettere).
3. Chi è di turno prova a indovinare; dopo ogni tentativo il feedback dice:

   - 🟢 **Verde** — lettera giusta al posto giusto. Merito, non si beve.
   - 🟡 **Gialla** — lettera giusta, posto sbagliato. **Il Cantiniere beve** 1 sorso × ogni gialla.
   - ⚫ **Nera** — lettera assente. **Chi indovina beve** 1 sorso × ogni nera.

4. Più lunga è la parola, più lo sorso pesa: 4-5 lettere = ×1, 6-7 = ×2, 8 = ×3.
5. 🏆 Chi indovina vince: il Cantiniere beve tanti sorsi quanti i tentativi usati.
6. 💀 Nessuno indovina in 6 tentativi: tutti (tranne il Cantiniere) bevono 1 sorso
   e il Cantiniere sceglie un **capro espiatorio** che beve uno SHOT intero (3 sorsi).
7. 🔁 Al giro dopo tocca al prossimo indovinare.

## Avvio (giocare)

```bash
cd games/shotmind
python3 -m http.server 8080
```

Apri `http://localhost:8080` dal telefono (stessa rete) o dal computer.
Servono un host `localhost`/https per il Service Worker; aprendo `index.html` via `file://`
il gioco funziona comunque, solo senza caching offline.

### GitHub Pages

Tutti i riferimenti sono relativi (`sw.js`, `manifest.json`, `icons/…`): la cartella
funziona così com'è su un subpath tipo `https://utente.github.io/repo/games/shotmind/`.
Il Service Worker si registra automaticamente con scope limitato alla cartella.
Dopo ogni modifica bumpare `CACHE` in `sw.js` (es. `shotmind-v2`) per invalidare
la cache dei giocatori.

### Installare come app (PWA)

Su Android/desktop Chrome: apri l'URL, poi menu → **Installa app**. Su iPhone Safari:
menu Condividi → **Aggiungi a Home**. L'interfaccia rispetta le safe-area
(notch e home indicator) sia in Safari che in modalità standalone.

## Test

```bash
cd games/shotmind
node tools/game.test.js     # test unitari del motore (nessuna dipendenza)
```

## Struttura

- `game.js` — motore puro: 4 pacchetti (bar, sobri, campioni, maledetto), feedback Mastermind con duplicati, `drinkRule`, `randomWord`
- `script.js` — client: setup, scelta parola, board, tastiera con stati lettera, banner bevuta, capro espiatorio, scoreboard, speech
- `index.html` / `style.css` — UI mobile-first con safe-area iOS, animazioni neon e `prefers-reduced-motion`
- `manifest.json` / `sw.js` / `icons/` — PWA offline (cache `shotmind-v2`)
- `tools/game.test.js` — test unitari del motore

## Note

- Dopo una modifica ai file, bumpa la versione della cache in `sw.js` (es. `shotmind-v2`) per non servire file vecchi.
- Il motore (`game.js`) non tocca il DOM: resta testabile in Node e trasferibile su un backend.
