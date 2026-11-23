# NBA Broadcast Simulator / Simulatore NBA

**Live / Online:** https://lucagandolfi77.github.io/portfolio/projects/nba_simulator/index.html

---

## Italiano

### Panoramica
Simulatore di basket NBA interamente **on-device**: 30 franchigie, 300 giocatori, tattiche, stagione, playoff, carriera, carte collezionabili e scommesse con crediti virtuali. Nessun dato personale viene inviato a un server; solo i moduli statici e il Three.js vendored vengono scaricati dal sito.

### Interfaccia (5 schede)

La barra in alto contiene solo **Come giocare** e **Impostazioni**. Crediti, livello e bauli vivono nella scheda **Carte**, così la simulazione resta separata dalla modalità carte opzionale. Al primo avvio compare un breve benvenuto con un tour di 5 passi, riapribile da Aiuto o Impostazioni.

| Scheda | Cosa contiene |
|---|---|
| **Gioca** | Selezione squadre, pronostico bonus opzionale, scorebug, campo 3D, controlli (pausa, velocità 1×/4×/12×, camera, salta alla fine), feed azione per azione, box score completo e riepilogo finale. |
| **Stagione** | Sotto-schede `Stagione` e `Playoff`: calendario 29 settimane, classifiche East/West, simulazione settimana o stagione, bracket a 16 squadre. |
| **Squadra** | Sotto-schede `Roster` e `Carriera`: tabella modificabile, tattica, free agent, costruttore di scambi con conferma, draft e progressione di carriera. |
| **Esplora** | Sotto-schede `Statistiche` e `Giocatori`: metriche avanzate, quattro grafici leggibili (quarti, andamento, tiri, confronto), simulazioni rapide e database di 300 card. |
| **Carte** | Modalità opzionale: collezione, bauli, sfida pronostico, crafting, jolly/sfide, mazzo, rosa, lega e coppa. Crediti solo virtuali. |

### Avvio rapido e aiuto

- **Play** porta subito a una partita: scegli casa e ospiti, premi TIP OFF, poi guarda o salta alla fine.
- Il **pronostico bonus** è opzionale, dà XP/frammenti se corretto e non cambia la simulazione.
- I link "Oltre la singola partita" spiegano Stagione, Squadra, Esplora e Carte direttamente dalla schermata iniziale.
- **Come giocare** include avvio rapido, descrizione delle modalità, glossario (OVR, TS%, eFG%, EFF, pity, frammenti, jolly, chimica) e scorciatoie da tastiera.
- **Impostazioni** contiene lingua, grafica, audio, tour, reset progressi carte e reset totale con conferma.


### Funzionalità

**Gameplay** — 6 playbook (Pick & Roll, Horns, Iso, Fast Break, Zone Buster, Bully), 4 schemi difensivi (man, zone, press, switch), stanchezza, infortuni, morale, sostituzioni, aggiustamenti a quarto, clutch time e overtime. Motore deterministico con seed condivisibile.

**Lega** — 30 squadre reali in due conference, round-robin di 29 settimane, classifiche con tie-break, playoff a 16 squadre con serie best-of-7 e home court.

**Carriera** — Roster editor, contratti, trade, free agency, draft, progressione multi-anno, XP, livelli e badge. Rarità in base alla forza: Comune <80, Raro 80+, Epico 88+, Leggendario 95+.

**Carte** — Set (Rookie Class, All-Star, Champions, Legends, Base), duplicati che diventano copie, upgrade fino al livello 5 con 2/4/8/16 copie + crediti (foil e firmata), frammenti per il crafting mirato, pity trasparente con leggendario garantito al 40° pull, storico ultimi 12 pull, baule giornaliero e offerte AI per i duplicati. La carta si apre con flip 3D e retro con carriera/curiosità.

**Bauli a tempo** — Negozio con Argento (250 crediti, 30 s), Oro (700, 3 min) e Leggendario (1800, 10 min), coda di 4 bauli, countdown nella scheda Carte, apertura manuale e velocizzazione con crediti. Le soglie minime di rarità crescono col tipo di baule.

**Scommesse (solo crediti virtuali)** — Saldo con 250 crediti giornalieri, posta 10/25/50, quote calcolate dalla forza squadra (underdog pagano di più), streak bonus, bonus set, prop bets (over/under, margine, quarto migliore), parlay a 3 partite. Nessun denaro reale.

**Apertura bauli** — Baule 3D procedurale: scossa, coperchio a molla, trave luminosa, particelle, carta olografica, confetti. Effetti, suoni e haptic variano per rarità; skip sempre disponibile e fallback istantaneo con `prefers-reduced-motion`.

**Grafica** — Arena 3D Three.js r160 con telecamere Broadcast/Overhead/Baseline, folla animata, LED, luci squadra, giocatori e pallone animati; fallback Canvas2D/WebGL2. Avatar 3D rifinito con maglia, numero, corporatura, capelli e viso parametrizzati. Player card con anelli TS%/eFG%, barre attributi e immagine condivisibile.

**Carte** — Mazzo Clash-Royale da 8 carte con bonus XP/quote, rosa basket da 5 titolari e 7 panchinari con chimica e template, **Legend League** contro 30 squadre reali con divisioni Bronze→Silver→Gold→Legend e promozioni, **Coppa** a eliminazione, wildcard universali e sfide giocatore con premi.

**Replay** — Log eventi, rilevamento highlight, replay scrubbabile con cambio camera ed export WebM via MediaRecorder (fallback PNG).

**PWA** — Manifest con icone e scorciatoie, service worker versionato (`nba-v11`), offline.html, precache di tutti i moduli e del Three.js vendored.

### Tasti e gesture
`Spazio` pausa · `R` nuovo incontro · `M` audio · `Esc` chiude le finestre · trascina sul campo per ruotare la camera/avatar · tocca una riga giocatore per aprire la card · `Altre azioni` per replay e condivisione.

### Dati e limiti noti
Roster e statistiche sono approssimativi (non collegati ad API esterne); alcune citazioni sono verificate, le curiosità sono fattuali; WebM non è supportato ovunque; il primo avvio richiede rete per i moduli CDN; i crediti sono virtuali e non hanno valore reale.

### Salvataggio
Chiave `pf.nba.v3`, versione 3, con migrazione automatica da `pf.nba.v2` e `nba.sim.v1`. Contiene impostazioni, lega, playoff, cronologia, statistiche giocatore, replay, previsioni, carriera, collezione, crediti, pity, duplicati, copie, livelli carta, coda bauli, scommesse, mazzo, rosa, lega, coppa e wildcard.

### Test
```bash
node --test projects/nba_simulator/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```
32 test coprono determinismo, roster, stagione, playoff, statistiche, carriera, medie reali, avatar, citazioni, storage, rarity, tema, replay, carte, quote, prop/parlay, pity, mercato AI, effetti bauli, negozio a tempo, potenziamento con copie+crediti, mazzo, rosa, lega, coppa e wildcard.

---

## English

### Overview
A fully **on-device** NBA basketball simulator: 30 franchises, 300 players, tactics, season, playoffs, franchise mode, collectible cards and virtual-credit betting. No personal data leaves the device; only static modules and the vendored Three.js are downloaded from the site.

### Interface (5 tabs)

The top bar only contains **How to play** and **Settings**. Credits, level and chests live inside the **Cards** tab, keeping the simulation separate from the optional card mode. A short welcome and 5-step tour appear on first launch and can be replayed from Help or Settings.

| Tab | Contents |
|---|---|
| **Play** | Team selection, optional bonus pick, scorebug, 3D court, controls (pause, 1×/4×/12× speed, camera, skip to final), play-by-play feed, full box score and final summary. |
| **Season** | `Season` / `Playoffs` sub-tabs: 29-week calendar, East/West standings, week/full-season simulation, 16-team bracket. |
| **Team** | `Roster` / `Career` sub-tabs: editable table, tactics, free agents, a trade builder with confirmation, draft and career progression. |
| **Explore** | `Statistics` / `Players` sub-tabs: advanced metrics, four readable charts (quarters, progression, shots, comparison), quick simulations and the 300-card database. |
| **Cards** | Optional mode: collection, chests, prediction challenge, crafting, wildcards/challenges, deck, squad, league and cup. Virtual credits only. |

### Quick start and help

- **Play** gets you into a game immediately: pick home and away, press TIP OFF, then watch or skip to the final.
- The **bonus pick** is optional, awards XP/fragments when correct and never changes the simulation.
- The "Beyond a single game" cards explain Season, Team, Explore and Cards right from the start screen.
- **How to play** includes a quick start, mode descriptions, a glossary (OVR, TS%, eFG%, EFF, pity, fragments, wildcards, chemistry) and keyboard shortcuts.
- **Settings** holds language, graphics, sound, the tour, card-progress reset and a full reset, both with confirmation.


### Features

**Gameplay** — 6 playbooks (Pick & Roll, Horns, Iso, Fast Break, Zone Buster, Bully), 4 defensive schemes (man, zone, press, switch), fatigue, injuries, morale, substitutions, quarter adjustments, clutch time and overtime. Deterministic engine with shareable seed.

**League** — 30 real teams in two conferences, 29-week round robin, standings with tie-breakers, 16-team playoffs with best-of-7 series and home court.

**Career** — Roster editor, contracts, trades, free agency, draft, multi-year progression, XP, levels and badges. Rarity by rating: Common <80, Rare 80+, Epic 88+, Legendary 95+.

**Cards** — Sets (Rookie Class, All-Star, Champions, Legends, Base), duplicates become copies, upgrades to level 5 with 2/4/8/16 copies + credits (foil and signed), fragments for targeted crafting, transparent pity with guaranteed legendary at pull 40, last-12 pull history, daily chest and AI offers for duplicates. Cards flip in 3D with career/trivia on the back.

**Timed chests** — Shop with Silver (250 credits, 30 s), Gold (700, 3 min) and Legendary (1800, 10 min), a 4-chest queue, countdown inside the Cards tab, manual opening and credit-based speed-up. Minimum rarity rises with chest type.

**Betting (virtual credits only)** — Daily 250 credits, 10/25/50 stakes, strength-based odds (underdogs pay more), streak and set bonuses, prop bets (over/under, margin, top quarter), 3-game parlays. No real money involved.

**Chest opening** — Procedural 3D chest: shake, spring lid, rarity beam, particles, holo card flip and confetti. Effects, sounds and haptics scale with rarity; always skippable, with an instant fallback for `prefers-reduced-motion`.

**Graphics** — Three.js r160 arena with Broadcast/Overhead/Baseline cameras, animated crowd, LED ribbon, team-colored lights, animated players and ball; Canvas2D/WebGL2 fallback. Refined 3D avatar with jersey, number, body type, hair and face parameters. Player card with TS%/eFG% rings, attribute bars and shareable image.

**Cards** — Clash-Royale-style 8-card deck with XP/odds bonuses, basketball squad with 5 starters + 7 bench, chemistry and templates, **Legend League** against 30 real teams with Bronze→Silver→Gold→Legend divisions and promotions, knockout **Cup**, universal wildcards and player challenges.

**Replay** — Event log, highlight detection, scrubbable replay with camera switching and WebM export via MediaRecorder (PNG fallback).

**PWA** — Manifest with icons and shortcuts, versioned service worker (`nba-v11`), offline page, precache of every module and the vendored Three.js.

### Controls
`Space` pause · `R` new matchup · `M` sound · `Esc` closes dialogs · drag on the court/avatar to rotate · tap a player row to open the card · `More actions` for replay and sharing.

### Data and known limits
Rosters and stats are approximate (no external APIs); a few quotes are verified and trivia is factual; WebM is not universally supported; first launch needs network access for CDN modules; credits are virtual with no real-world value.

### Storage
Key `pf.nba.v3`, version 3, with automatic migration from `pf.nba.v2` and `nba.sim.v1`. Holds settings, league, playoffs, history, player stats, replays, predictions, career, collection, credits, pity, duplicates, copies, card levels, chest queue, bets, deck, squad, club league, cup and wildcards.

### Tests
```bash
node --test projects/nba_simulator/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```
32 tests cover determinism, rosters, season, playoffs, stats, career, real averages, avatars, trivia, storage, rarity, theme, replays, cards, odds, props/parlays, pity, AI market, chest effects, timed shop, copy/credit upgrades, deck, squad, league, cup and wildcards.

> Legacy top-level JS files (`data.js`, `engine.js`, `ui.js`, …) are kept from the earlier build for compatibility; they are not loaded by the current `index.html`.
