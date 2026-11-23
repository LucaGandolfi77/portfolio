# NBA Broadcast Simulator / Simulatore NBA

**Live / Online:** https://lucagandolfi77.github.io/portfolio/projects/nba_simulator/index.html

---

## Italiano

### Panoramica
Simulatore di basket NBA interamente **on-device**: 30 franchigie, 300 giocatori, tattiche, stagione, playoff, carriera, carte collezionabili e scommesse con crediti virtuali. Nessun dato personale viene inviato a un server; solo i moduli statici e il Three.js vendored vengono scaricati dal sito.

### Interfaccia (5 schede)
| Scheda | Cosa contiene |
|---|---|
| **Game** | Selezione squadre, scorebug, campo 3D, controlli (play/pausa, velocità, camera, sim-to-end), feed e box score. Il pulsante `•••` nasconde i controlli secondari. |
| **League** | Sotto-schede `Season` e `Playoff`: calendario 29 settimane, classifiche East/West, simulazione settimana o stagione, bracket a 16 squadre. |
| **Franchise** | Sotto-schede `Teams` e `Career`: roster, strategia, trade, draft, free agent; crediti, XP, livello, scommesse, collezione, crafting e baule giornaliero. |
| **Stats** | Box score avanzato, leader, grafici a barre e mappe tiri, simulazioni rapide in Web Worker. |
| **Players** | Griglia di 300 card con ricerca, filtri squadra/posizione/rarità, ordinamento e paginazione; cliccare una card apre la scheda giocatore. |

### Funzionalità

**Gameplay** — 6 playbook (Pick & Roll, Horns, Iso, Fast Break, Zone Buster, Bully), 4 schemi difensivi (man, zone, press, switch), stanchezza, infortuni, morale, sostituzioni, aggiustamenti a quarto, clutch time e overtime. Motore deterministico con seed condivisibile.

**Lega** — 30 squadre reali in due conference, round-robin di 29 settimane, classifiche con tie-break, playoff a 16 squadre con serie best-of-7 e home court.

**Carriera** — Roster editor, contratti, trade, free agency, draft, progressione multi-anno, XP, livelli e badge. Rarità in base alla forza: Comune <80, Raro 80+, Epico 88+, Leggendario 95+.

**Carte** — Set (Rookie Class, All-Star, Champions, Legends, Base), frammenti dai duplicati, upgrade fino al livello 5 (foil e firmata), crafting mirato, pity trasparente con leggendario garantito al 40° pull, storico ultimi 12 pull, baule giornaliero e offerte AI per i duplicati. La carta si apre con flip 3D e retro con carriera/curiosità.

**Scommesse (solo crediti virtuali)** — Saldo con 250 crediti giornalieri, posta 10/25/50, quote calcolate dalla forza squadra (underdog pagano di più), streak bonus, bonus set, prop bets (over/under, margine, quarto migliore), parlay a 3 partite. Nessun denaro reale.

**Apertura bauli** — Baule 3D procedurale: scossa, coperchio a molla, trave luminosa, particelle, carta olografica, confetti. Effetti, suoni e haptic variano per rarità; skip sempre disponibile e fallback istantaneo con `prefers-reduced-motion`.

**Grafica** — Arena 3D Three.js r160 con telecamere Broadcast/Overhead/Baseline, folla animata, LED, luci squadra, giocatori e pallone animati; fallback Canvas2D/WebGL2. Avatar 3D rifinito con maglia, numero, corporatura, capelli e viso parametrizzati. Player card con anelli TS%/eFG%, barre attributi e immagine condivisibile.

**Replay** — Log eventi, rilevamento highlight, replay scrubbabile con cambio camera ed export WebM via MediaRecorder (fallback PNG).

**PWA** — Manifest con icone e scorciatoie, service worker versionato (`nba-v8`), offline.html, precache di tutti i moduli e del Three.js vendored.

### Tasti e gesture
`Spazio` pausa · `R` riavvia · `M` audio · trascina sul campo per ruotare la camera/avatar · tocca una riga giocatore per aprire la card · `•••` per i controlli secondari.

### Dati e limiti noti
Roster e statistiche sono approssimativi (non collegati ad API esterne); alcune citazioni sono verificate, le curiosità sono fattuali; WebM non è supportato ovunque; il primo avvio richiede rete per i moduli CDN; i crediti sono virtuali e non hanno valore reale.

### Salvataggio
Chiave `pf.nba.v3`, versione 3, con migrazione automatica da `pf.nba.v2` e `nba.sim.v1`. Contiene impostazioni, lega, playoff, cronologia, statistiche giocatore, replay, previsioni, carriera, collezione, crediti, pity, duplicati e scommesse.

### Test
```bash
node --test projects/nba_simulator/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```
27 test coprono determinismo, roster, stagione, playoff, statistiche, carriera, medie reali, avatar, citazioni, storage, rarity, tema, replay, carte, quote, prop/parlay, pity, mercato AI ed effetti bauli.

---

## English

### Overview
A fully **on-device** NBA basketball simulator: 30 franchises, 300 players, tactics, season, playoffs, franchise mode, collectible cards and virtual-credit betting. No personal data leaves the device; only static modules and the vendored Three.js are downloaded from the site.

### Interface (5 tabs)
| Tab | Contents |
|---|---|
| **Game** | Team selection, scorebug, 3D court, controls (play/pause, speed, camera, sim-to-end), feed and box score. The `•••` button reveals secondary controls. |
| **League** | `Season` / `Playoffs` sub-tabs: 29-week calendar, East/West standings, week/full simulation, 16-team bracket. |
| **Franchise** | `Teams` / `Career` sub-tabs: roster, strategy, trades, draft, free agency; credits, XP, level, betting, collection, crafting, daily chest. |
| **Stats** | Advanced box score, leaders, bar charts and shot zones, quick Web Worker simulations. |
| **Players** | Grid of 300 cards with search, team/position/rarity filters, sorting and paging; clicking a card opens the player sheet. |

### Features

**Gameplay** — 6 playbooks (Pick & Roll, Horns, Iso, Fast Break, Zone Buster, Bully), 4 defensive schemes (man, zone, press, switch), fatigue, injuries, morale, substitutions, quarter adjustments, clutch time and overtime. Deterministic engine with shareable seed.

**League** — 30 real teams in two conferences, 29-week round robin, standings with tie-breakers, 16-team playoffs with best-of-7 series and home court.

**Career** — Roster editor, contracts, trades, free agency, draft, multi-year progression, XP, levels and badges. Rarity by rating: Common <80, Rare 80+, Epic 88+, Legendary 95+.

**Cards** — Sets (Rookie Class, All-Star, Champions, Legends, Base), fragments from duplicates, upgrades to level 5 (foil and signed), targeted crafting, transparent pity with guaranteed legendary at pull 40, last-12 pull history, daily chest and AI offers for duplicates. Cards flip in 3D with career/trivia on the back.

**Betting (virtual credits only)** — Daily 250 credits, 10/25/50 stakes, strength-based odds (underdogs pay more), streak and set bonuses, prop bets (over/under, margin, top quarter), 3-game parlays. No real money involved.

**Chest opening** — Procedural 3D chest: shake, spring lid, rarity beam, particles, holo card flip and confetti. Effects, sounds and haptics scale with rarity; always skippable, with an instant fallback for `prefers-reduced-motion`.

**Graphics** — Three.js r160 arena with Broadcast/Overhead/Baseline cameras, animated crowd, LED ribbon, team-colored lights, animated players and ball; Canvas2D/WebGL2 fallback. Refined 3D avatar with jersey, number, body type, hair and face parameters. Player card with TS%/eFG% rings, attribute bars and shareable image.

**Replay** — Event log, highlight detection, scrubbable replay with camera switching and WebM export via MediaRecorder (PNG fallback).

**PWA** — Manifest with icons and shortcuts, versioned service worker (`nba-v8`), offline page, precache of every module and the vendored Three.js.

### Controls
`Space` pause · `R` restart · `M` sound · drag on the court/avatar to rotate · tap a player row to open the card · `•••` for secondary controls.

### Data and known limits
Rosters and stats are approximate (no external APIs); a few quotes are verified and trivia is factual; WebM is not universally supported; first launch needs network access for CDN modules; credits are virtual with no real-world value.

### Storage
Key `pf.nba.v3`, version 3, with automatic migration from `pf.nba.v2` and `nba.sim.v1`. Holds settings, league, playoffs, history, player stats, replays, predictions, career, collection, credits, pity, duplicates and bets.

### Tests
```bash
node --test projects/nba_simulator/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```
27 tests cover determinism, rosters, season, playoffs, stats, career, real averages, avatars, trivia, storage, rarity, theme, replays, cards, odds, props/parlays, pity, AI market and chest effects.

> Legacy top-level JS files (`data.js`, `engine.js`, `ui.js`, …) are kept from the earlier build for compatibility; they are not loaded by the current `index.html`.
