# ⚓ Battleship Commander

Sparatutto navale top-down trasformato in una PWA completa e profonda: 15 missioni, 7 modalità, AI adattiva, salvataggi e controlli mobile. Tutto offline, senza server.

**Live:** <https://lucagandolfi77.github.io/portfolio/games/battleship/>

## Modalità

- **Campaign**: 15 missioni progressive (affondamento, sopravvivenza, tempesta, notte, scorta convoglio, boss a fasi), 1–3 stelle e sblocco navi.
- **Endless**: onde infinite con difficoltà adattiva (DDA).
- **Survival**: resisti 120 secondi.
- **Time Attack**: 90 secondi per affondare 12 navi.
- **Boss Hunt**: duelli contro Ironclad, Leviathan e Dreadlord.
- **Daily Challenge**: seed giornaliero deterministico, stessa sfida per tutti.
- **Convoy Escort**: proteggi la flotta mercantile.

## Comandi

- **Desktop**: WASD/frecce per sterzare, SPACE o click per sparare, `P`/`Esc` per pausa.
- **Mobile**: stick virtuale a sinistra, pulsante FIRE a destra; auto-fire e aim assist opzionali, feedback aptico.

## Architettura

```text
games/battleship/
├─ index.html / README.md
├─ css/app.css                 # HUD glass, layout mobile
├─ js/
│  ├─ config.js                # registry navi, armi, missioni, boss, modalità
│  ├─ sim.js                   # PURO: timestep fisso, AI a stati, spatial hash, DDA
│  ├─ missions.js / economy.js # PURO: obiettivi, stelle, sblocchi, seed giornaliero
│  ├─ render.js / input.js / ui.js / main.js
├─ tests/sim.test.mjs
└─ manifest.webmanifest / icon.svg / sw.js
```

Il loop usa un **timestep fisso a 60 Hz** con accumulatore; le collisioni usano uno spatial hash; i proiettili e le particelle usano il layer FX del game kit. AI: `patrol / chase / flank / evade / retreat`, con aggiramento isole e difficoltà adattiva in base all'accuratezza.

## Progressi e PWA

`games/_kit/meta-layer.js` gestisce XP, missioni e achievement; `campaign.js` rating/streak; `pwa.js` registra il service worker. Il salvataggio include impostazioni, stelle, navi sbloccate e uno snapshot della partita riprendibile. La cache precarica shell, moduli e kit: dopo il primo avvio il gioco funziona offline e mostra il prompt di installazione/aggiornamento.

## Test

```bash
python3 -m http.server 8080
# http://localhost:8080/games/battleship/

node --test games/battleship/tests/*.test.mjs
node --check games/battleship/js/main.js
```
