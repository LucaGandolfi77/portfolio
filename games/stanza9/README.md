# STANZA 9 — L'albergo dei ricordi

RPG narrativo ambientato ai giorni nostri (luglio 2025): un incrocio tra i dialoghi profondi
di *Baldur's Gate* e la semplicità sociale di *Habbo Hotel* — una storia su memoria, gruppi
chat e ciò che facciamo quando le piattaforme muoiono.

## La storia
Dieci anni fa, in una piccola città di provincia, sei amici passavano le notti in un albergo
abbandonato: la **Stanza 9**. Una notte d'estate, **Giulia**, la fondatrice della Stanza 9,
non ne è mai uscita. Ora il vecchio server del mondo sociale in cui era nata la stanza verrà
spento tra sette giorni — e l'account di Giulia, spento da un decennio, ha pubblicato nel
gruppo: *«L'ultima notte. Vieni TU.»*

Tu eri l'unico che quella notte non c'era. Per questo ti hanno chiamato.

## Meccaniche
- **Esplorazione tap-to-move**: cammini per la piazza e le stanze, parli con i personaggi.
- **Dialoghi ramificati**: ogni scelta cambia la fiducia dei personaggi e la storia.
- **7 giorni / 7 capitoli**: ogni sera il telefono riceve una lettera dal server.
- **12 ricordi da ricostruire**: i frammenti riempiono la Stanza 9 (che si arreda mentre ricordi).
- **Sistema di fiducia**: Freddo → Cauto → Aperto → Fiducia → Alleato.
- **4 finali** (uno segreto) che dipendono da ricordi, fiducia e scelte.
- **Auto-save** locale, ottimizzato per iPhone (safe-area, niente hover, touch).

## Personaggi
Giulia · Mattia (il barista) · Sofia (l'infermiera) · Davide (il fratello) · Emma (la sviluppatrice)
· il prof. Ferri (l'archivista) · Giorgio (il proprietario dell'albergo).

## File
- `index.html` — UI e stili (mobile-first)
- `js/data.js` — contenuti: luoghi, personaggi, dialoghi, finali
- `js/core.js` — motore: movimento, rendering, dialoghi, chat, diario, salvataggi

## Test automatico
Apri `index.html?test=1` (o dal menu console): verifica l'integrità dei contenuti e che
tutti i finali siano raggiungibili. In Node: `node -e "require('./js/data.js')"`.
