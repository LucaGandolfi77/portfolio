# 🏙️ RIVINCITA — GTA 2D top-down

Un piccolo **GTA in 2D con visuale dall'alto** (stile Game Boy, ma con palette flat moderna)
che racconta una storia su **ansia, depressione, duro lavoro e rivincita**.

Apri `index.html` — funziona su **iPhone** (joystick virtuale) e **desktop** (WASD).

## 🧪 Motore di test automatico

Il gioco include un **motore di test che gioca da solo** e verifica le caratteristiche
che potrebbero andare in fail: lo trovi nel menu (**🧪 Test automatico**) o apri
`index.html?test=1`. Esegue 17 scenari (mappa, movimenti e collisioni, storia e dialoghi,
cassa, moto, pizza, taxi, ansia/panico, armi, auto e polizia, le 3 side quest, arcade,
corsa, pausa, finale) e stampa un report **PASS/FAIL** a schermo.

## 🗺️ Mappa

Città **4800×4800** con griglia **10×10**: **17 edifici** (casa, minimarket, pizzeria, taxi,
bar, posta, sede Merloni, parco, discoteca, banca, palestra, biblioteca, **autofficina,
ospedale, stazione, cinema, serra**), strade, cartelloni satirici, **16 auto rubabili**,
**26 passanti** e 3 personaggi con nome.

## 🚗 Auto: 7 modelli, 16 colori

Ogni auto ha un **modello** (disegnato diversamente: dimensioni, tettuccio, alettone,
portellone, insegna TAXI, lampeggianti della polizia) e un **colore** dalla palette estesa:
utilitaria, berlina, SUV, sportiva, furgone, taxi e polizia. Le auto sono assegnate
casualmente in città: rubarle è sempre una sorpresa (a volte un taxi, a volte una sportiva).

## 🎮 Come si gioca

| Azione | Desktop | iPhone/tablet |
|---|---|---|
| Muoversi / guidare | WASD o frecce | Joystick in basso a sinistra |
| Interagisci (porte, lavori, auto, caffè) | `E` | Pulsante ✋ |
| Spara (arma equipaggiata) | `Spazio` | Pulsante 💥 |
| Cambia arma | `Q` | Pulsante 🔁 |
| Fotocamera (prove) | `V` | Pulsante 📸 |
| Musica interna (rilassa) | `M` | Pulsante 🎵 |
| Arcade / corsa | Pulsanti | Pulsanti 🎮 / 🏁 |
| Menu / pausa | `ESC` | — |

In auto: joystick avanti/indietro per accelerare/frenare, sinistra/destra per sterzare.

---

## 📖 La storia (10 capitoli)

Sei **Marco**, 27 anni, cassiere in un minimarket per un capo orribile. Tra attacchi d'ansia,
l'affitto e il diario sul comodino, una notte trova una moto abbandonata: inizia la rivincita.
Consegne di pizze, corse in taxi, l'amicizia con Giulia, la scoperta della frode del capo
e, alla fine, la pizzeria **"La Svolta"** e la consegna numero 1000. Il finale è narrato.

## ⚙️ Meccaniche

- **😰 Misuratore d'ansia**: sale con lavoro, polizia, affitto e capo; scende con caffè, panchina al parco, musica, amici e... un bel **urlo liberatorio**. Sopra il 90% entri in panico (ti muovi più lento, lo schermo trema).
- **🚗 Furto d'auto + polizia**: rubi un'auto → stelle di ricercato → la polizia ti insegue. Preso? Multa €100 e ansia su.
- **💼 Lavori veri**: consegne di pizze (3), corse in taxi (2), turno alla cassa (minigame).
- **🔫 Armi satiriche (mai letali)**: 🪀 Fionda (stordisce i passanti), 💦 Pistola ad acqua (€10 al bar: rallenta la polizia e calma l'ansia), 😤 Urlo liberatorio (sbloccato al capitolo 6: spinge via i passanti, -15 ansia).
- **📋 Side quest** (personaggi con nome): ☕ Rosa la barista (4 caffè ai passanti), 💍 Il Senzanome (l'anello perduto nel parco), 📦 Agente Conti (smista 5 pacchi).
- **🎮 Minigiochi**: l'arcade "Serpe Velenosa" al bar (€2) e la corsa clandestina (5 checkpoint, 2 giri).
- **💬 Satira sociale**: cartelloni, passanti, l'affitto che arriva sempre, la fila alla posta.
- **📜 Dialoghi**: avanza con tocco / Invio / Spazio.

---

## 🗂️ Struttura

```
rivincita/
├── index.html     # shell + UI (HUD, dialoghi, menu, minigiochi, finale)
├── js/data.js     # città (8x8), storia, satira, lavori, armi, side quest
├── js/game.js     # engine: movimento, auto/polizia, ansia, armi, lavori, minigiochi
└── js/test.js     # motore di test automatico (gioca al gioco, report PASS/FAIL)
```

## 📝 Note

- Zero librerie esterne: HTML/CSS/JS vanilla + Canvas 2D.
- Il tema è una satira sociale con empatia: ansia e depressione sono trattate come
  condizioni reali da attraversare, non come battute. Il gioco non è una diagnosi:
  se ne hai bisogno, parlane con qualcuno. ❤️
