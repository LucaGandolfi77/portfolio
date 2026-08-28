# SINIBBIO AR 👾

Mostri sul **tavolo** (e in **cielo**!) con la fotocamera del telefono.
Sconfiggili ripetendo le parole giuste al microfono. I piccoli **patagarrri**
basta schiacciarli. E ogni tanto arriva il **SINIBBIO REALE**: servono
**due parole unite** per batterlo.

Apri `index.html` su un telefono (o su desktop) — serve una connessione
HTTPS per fotocamera e microfono (localhost va bene).

---

## Come si gioca

1. **Avvia**: tocca "▶ Avvia fotocamera e gioca" e concedi i permessi
   (fotocamera, microfono, e su iPhone anche il **sensore di movimento**).
   Senza fotocamera puoi giocare in modalità "tavolo virtuale".
2. **I mostri compaiono** sul tavolo (griglia viola) e **in cielo** (sopra la
   griglia, tra le nuvole). Inclina il telefono: restano lì — l'ancoraggio
   compensa l'inclinazione (i mostri in cielo, essendo lontani, si muovono
   meno: è la parallasse, tesoro).
3. **SINIBBIO** (viola, con corna): toccalo → compaiono **3 parole**.
   Tocca quella giusta, poi **ripetila ad alta voce** al microfono.
   Se la pronuncia combacia (con un po' di tolleranza: le parole sono
   inventate), il mostro **esplode**.
4. **Patagarrri** (verdi, saltellanti o volanti): **toccarli basta** per
   farli scoppiare (+5).
5. **SINIBBIO REALE** (rosso, enorme, con denti e artigli): appare di tanto
   in tanto. Le opzioni sono **coppie di parole**: scegli la coppia giusta e
   dì **entrambe le parole unite** ("falation kolaten").
6. **Parole d'oro** ★: toccale per +15 punti.
7. Obiettivo: punteggio più alto possibile. **Record salvato** nel browser.

### Le parole
`finkure · liskato · losen · tosen · laskolaien · pesnotolen · kasmaion ·
tokozon · plekfa · falation · falakolaten · kolaten · drefgolding ·
strasspapero · nadorano · turmelan`

---

## Controlli

| Azione | Come |
|---|---|
| Cambiare fotocamera (frontale/posteriore) | Pulsante 🔄 in alto |
| Audio on/off | Pulsante 🔊/🔇 |
| Toccare un mostro / schiacciare un patagarrro / prendere una ★ | Tocco diretto |
| Ripetere la parola | Microfono, o tasto "✅ L'ho detta!" (vedi sotto) |

---

## Chicche nascoste

- **Combo 🔥**: uccidi più mostri con la voce di fila e il moltiplicatore sale
  fino a **x5** (10→50 punti per SINIBBIO, 50→250 per il REALE). Sbagli la
  parola e la combo si azzera. Il gioco punisce la fretta.
- **Record 🏆**: il punteggio migliore resta salvato (localStorage) e compare
  nell'HUD.
- **Mostri in cielo** con alone morbido che galleggiano; **patagarrri
  volanti** con le ali che battono; uccelli lontani e nuvole che derivano.
- I mostri scappano dopo ~20 secondi: decidi in fretta.

## 🥚 Easter egg (spoiler)

> — spoiler — scorri sotto solo se vuoi sapere —

> — davvero? —

> — ok, eri avvisato —

**JAGERBOMB** 🍸 (uno shottino di Jägermeister e Red Bull) è in agguato:
- **Mobile**: tocca **5 volte il titolo "SINIBBIO"** nella schermata iniziale.
- **Desktop**: scrivi la sequenza **J-A-G-E-R** con la tastiera.

Sul tavolo virtuale compare un bicchiere pieno di **Red Bull** con le
bollicine, e dall'alto **cade uno shottino di Jägermeister**: BOOM, splash di
gocce e bollicine, flash a schermo, brindisi e **+100 punti**.
*Attenzione: giocare ad alta velocità aumenta il rischio di voler provare la
jagerbomb dal vivo. Il gioco declina ogni responsabilità (e il guidatore
designato ti ringrazia).*

---

## Note tecniche e limiti

- **iOS Safari**: il riconoscimento vocale (Web Speech API) non è disponibile;
  compare il tasto **"✅ L'ho detta!"** per confermare la parola. Su
  Chrome/Android il microfono funziona davvero. Le parole sono **inventate**,
  quindi il motore vocale non le conosce: per farsele ascoltare il gioco
  1) le dichiara in una **grammatica JSGF** (Chrome desktop),
  2) ascolta i **risultati intermedi** con **8 alternative** (il motore
     "corregge" meno i suoni estranei) e confronta in fonetica con distanza
     di Levenshtein,
  3) riprova automaticamente con la **lingua alternativa (it-IT ↔ en-US)**:
     *finkure/liskato/tokozon* suonano più italiane, *weightlighter,
     schiverrrr, drefgolding* più inglesi. Il tasto **🔁 Riprova** cambia
     lingua a ogni pressione.
  Se il riconoscimento non capisce nulla dopo 8 secondi di silenzio, passa
  all'altra lingua; dopo entrambe, invita a riprovare (o a usare "L'ho detta!").
- **iPhone (layout)**: all'avvio il gioco va a **schermo intero**
  (`requestFullscreen`, Safari 16.4+) così la barra del browser in alto e
  quella in basso spariscono; gli strati full-screen usano `100dvh` e
  `env(safe-area-inset-*)` per non finire dietro la tacca.
- L'ancoraggio AR è basato sul **giroscopio** (compensazione dell'inclinazione),
  non su SLAM: è l'illusione di profondità, non la realtà aumentata dei
  sistemi professionisti. Funziona senza marker, ovunque, offline.
- Serve **HTTPS** (o localhost) per fotocamera e microfono.
- Zero librerie esterne: tutto Canvas 2D + WebAudio, un solo file.

*SINIBBIO AR — i mostri non sono reali. Le parole sì. (Più o meno.)*
