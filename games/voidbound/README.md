# VOIDBOUND — Rites of the Rift

MOBA arena 5v5 ambientato in un universo grimdark spaziale. Clone fedele delle dinamiche di Pokémon Unite, con universo originale senza marchi registrati. PWA offline, giocabile su iPhone e desktop. Grafica pixel art generata proceduralmente.

## Come giocare

5 minuti di partita, due squadre da 5 (tu + 4 bot vs 5 bot). L'obiettivo è **consacrare** i santuari nemici depositando Frammenti d'Ætere raccogliendo creep e sconfiggiando nemici. La squadra con più punti alla fine vince.

### Mappa

```
[Santuario Blu] ─── Corsia Superiore ─── [Santuario Rosso]
      │                                        │
  Corsia Inferiore         Giungla         Corsia Inferiore
      │                                        │
[Santuario Blu] ─── Corsia Inferiore ── [Santuario Rosso]
```

- **2 corsie** (superiore e inferiore) con 2 santuari per squadra ciascuna
- **Giungla centrale** con creep neutri che danno XP e frammenti
- **Boss** "Fauci dell'Ætere" appare a 2' dalla fine al centro della mappa
- **Boost di velocità** e **jump pad** sparsi sulla mappa
- **Erba alta** che rende invisibili

### Santuari

Ogni santuario ha una barra HP. Per distruggerlo devi **canalizzare** i tuoi frammenti al suo interno:
- Santuari esterni: si distruggono dopo ~80 punti
- Santuari interni: dopo ~100 punti (sbloccabili solo dopo la distruzione di quelli esterni)
- Santuario base: 150 punti (sbloccabile solo dopo tutti gli altri, oppure se il boss è stato ucciso)

### Punteggio

- Ogni frammento depositato = 1 punto (x2 negli ultimi 60 secondi)
- Uccidere un campione nemico: raccogli metà dei suoi frammenti
- Il boss rilascia 50 frammenti + espone i santuari per 30 secondi

### Progressione

- Livelli 1→15, guadagni XP uccidendo creep e campioni nemici
- Al **lv5** e **lv10** le abilità si potenziano automaticamente
- Al **lv8** si sblocca la **Mossa Rituale** (ultimate)
- Alla morte perdi il 50% dei frammenti trasportati e respawn in base

---

## Comandi

### iPhone (landscape)

Il gioco è ottimizzato per iPhone in orientamento orizzontale. Ruotando il telefono appare un overlay che chiede di ruotare.

| Azione | Controllo |
|--------|-----------|
| **Muoversi** | Joystick virtuale (touch e trascina nella zona sinistra dello schermo, ~40% della larghezza) |
| **Attacco base** | Pulsante rosso "⚔" (angolo basso-destra) |
| **Abilità 1** | Pulsante blu "Q" (sopra l'attacco) |
| **Abilità 2** | Pulsante verde "W" (a sinistra dell'abilità 1) |
| **Mossa Rituale** | Pulsante giallo "R" (sotto l'abilità 1, sbloccata al lv8) |
| **Consacra** | Pulsante viola "✦" (sotto l'attacco, appare quando sei vicino a un santuario nemico con frammenti) |

**Joystick**: tocca e tieni nella metà sinistra dello schermo, poi trascina nella direzione desiderata. Iljoystick appare dove tocchi e il cursore si muove proporzionalmente allo spostamento. Rilasciando il dito il personaggio si ferma.

**Bottoni abilità**: tocca una volta per usare. Hanno un breve cooldown visibile come indicatore.

### Desktop (tastiera + mouse)

| Azione | Tasto |
|--------|-------|
| **Muoversi** | `W` `A` `S` `D` oppure frecce `↑` `←` `↓` `→` |
| **Attacco base** | `J` oppure `Spazio` |
| **Abilità 1** | `K` |
| **Abilità 2** | `L` |
| **Mossa Rituale** | `U` |
| **Consacra** | `E` |

**Note desktop**: il mouse non è usato per muovere. Il personaggio si muove con la tastiera e attacca automaticamente il nemico/creep più vicino quando premi attacco. Le abilità si puntano automaticamente verso il bersaglio più vicino (come nella versione mobile di Pokémon Unite).

---

## Campioni (17)

### Originali
| Nome | Ruolo | Stile |
|------|-------|-------|
| Ser Galdric, Lama Giurata | Tuttotfare | Melee, bilanciato |
| Warden Lysa, Occhio di Stella | Attaccante | DPS a distanza con lancia fotonica |
| Kragg l'Inamovibile | Difensore | Tank, scudo e area |
| Sorella Mera, Chirurgo del Coro | Supporto | Cure e purificazione |
| Vexa, Lama Cava | Velocista | Assassina, dash e backstab |
| Magister Vorn, Ætermante | Mago | AoE e controllo di folla |
| Krog il Senzafreno | Tuttotfare | Melee con rigenerazione |
| Sorella Elara, Vegliante della Fede | Difensore | Aura e protezione di squadra |
| Grul il Bruto | Velocista | Carica e area di fuoco |

### Nuovi
| Nome | Ruolo | Arma | Abilità Speciale |
|------|-------|------|----------------|
| Ilyr, Cacciatrice del Vuoto | Velocista | Falce curva | Ombra residual dash |
| Magister Xan, Artefice | Mago | Mano meccanica | Torretta automatica |
| Seraphina, Custode del Sogno | Supporto | Campana sonica | Speed + atk boost ad area |
| Grim, il Collezionista | Difensore | Catena + ancore | Tira nemico verso sé (hook) |
| Vex, Ingegnere Esiliato | Attacker | Pistola a raggi | Burst + disarm |
| Nyx, Predatrice Ombra | Velocista | Artigli | Invisibilità + backstab |
| Chirurgo Voss, Mastro Meccanico | Supporto | Trapano medico | Ripara + armor break |
| Zara, Esploratrice Void | Attacker | Doppia pistola | Burst di 5 colpi rapidi |

---

## Struttura tecnica

```
voidbound/
├── index.html          # Shell PWA, menu selezione campione
├── style.css           # HUD touch, joystick, safe-area, overlay rotazione
├── manifest.webmanifest # PWA standalone, orientation: landscape
├── sw.js               # Service worker, cache-first offline
├── icons/              # Icone PNG (192, 512, maskable, apple-touch)
└── js/
    ├── data.js         # Dati di gioco: mappa, 17 roster, abilità, bilanciamento
    ├── sprites.js      # Generatore sprite pixel art procedurale (17 campioni, 3 creep, boss)
    ├── game.js         # Stato partita, fisica, combattimento, scoring, nuove abilità
    ├── ai.js           # Intelligenza artificiale bot (FSM 8 stati)
    ├── render.js       # Rendering Canvas 2D con sprite pixel art, particelle, animazioni
    └── main.js         # Game loop, input touch/tastiera, menu, SW registration
```

- **Zero dipendenze**: vanilla JS + Canvas 2D, nessuna libreria esterna
- **Offline totale**: dopo il primo caricamento il gioco funziona senza connessione
- **60fps** su iPhone recenti, 30fps con fallback
- **Bot AI** con FSM che gestisce: farm, push, fight, retreat, score, defend, boss
- **Pixel art procedurale**: sprite generati a runtime con palette percorso, armi animabili
- **17 campioni** con 8 tipos di abilità uniche: melee, projectile, dash, aoe, shield, heal, buff, hook, stealth, turret, burst

---

## Per sviluppatori

Apri `index.html` direttamente nel browser (o usa `python3 -m http.server` dalla cartella). Il gioco funziona anche aprendo il file direttamente (`file://`) dato che non usa moduli ES.

Il catalogo del portfolio lo registra automaticamente in `assets/js/catalog-data.js`.
