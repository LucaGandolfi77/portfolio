# ⚔️ RPG Adventure: Realm Quest

Action RPG **mobile-first** e **senza build**, pubblicabile direttamente su GitHub Pages. Nessun CDN, nessuna dipendenza npm: solo ES module, Canvas 2D e WebAudio.

## Quickstart

```bash
# dalla root del portfolio
python3 -m http.server 8000
# apri http://localhost:8000/games/rpg-game/index.html
```

Su GitHub Pages l'URL è `https://lucagandolfi77.github.io/portfolio/games/rpg-game/index.html`. Tutti i percorsi sono relativi, quindi funziona anche in sottocartella e offline dopo il primo caricamento.

## Controlli

| Azione | Desktop | Mobile / gamepad |
|---|---|---|
| Movimento | WASD / frecce | joystick sinistro / stick sinistro |
| Attacco (combo 3 colpi) | Spazio | pulsante ⚔️ / A |
| Interagisci / parla | E | 💬 / X |
| Schiva | Tab | 💨 / B |
| Skill 1–4 | 1, 2, 3, 4 | barra skill in basso |
| Pausa | Esc / P | pulsante ⏸ |

Tre colpi ravvicinati formano una combo con danni crescenti (10 → 16 → 26) più l'attacco dell'equipaggiamento.

## Funzionalità

- **3 zone** collegate da portali: Bosco Smeraldo, Dune Assolate, Cripta Antica. Ognuna con palette, nemici, NPC e ondate di respawn proprie.
- **Combattimento**: 4 skill con mana e cooldown (palla di fuoco, scudo, scatto, curazione), invulnerabilità dopo il danno, dodge, numeri di danno e particelle.
- **Progressione**: XP, level up con aumento di vita/mana/attacco, 3 quest con ricompense, oro e drop.
- **Inventario**: 8 oggetti, equipaggiamento in 4 slot, pozioni, negozio NPC, drop e swap automatico dell'oggetto sostituito.
- **Salvataggio versionato** in `localStorage`, validato e normalizzato all'avvio; salvataggio automatico ogni 5 secondi e su `pagehide`.
- **Mobile**: joystick virtuale con pointer capture, pulsanti touch ≥44px, DPR limitato a 2, layout a una colonna, safe-area, pausa automatica quando la pagina è nascosta.
- **Liquid glass**: layer CSS universale + rifrazione SVG solo Chromium (feature detection), EN/IT, tema chiaro/scuro, reduced motion, FPS opzionale.
- **PWA offline**: manifest con icone e service worker versionato `pf-rpg-game-shell-v1` con precache completo.

## Architettura

```
games/rpg-game/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js       zone, nemici, item, skill, quest, stringhe EN/IT
│   ├── i18n.js · storage.js · audio.js · glass.js
│   ├── core/
│   │   ├── entities.js     RNG deterministico, spawn, movement, clamp
│   │   ├── combat.js       combo, danni, skill, projectile, dodge
│   │   └── progression.js  XP, inventario, quest, cooldown, validazione save
│   ├── input.js        tastiera + joystick touch + gamepad
│   ├── render.js       Canvas 2D procedurale (nessuna immagine esterna)
│   ├── ui.js           HUD, inventario, quest, negozio, modali, toast
│   └── main.js         loop, worker-free, orchestrazione
└── test/logic-test.mjs
```

I moduli in `js/core/` sono puri e testabili in Node.

## Test

```bash
node games/rpg-game/test/logic-test.mjs
```

Copre progressione, inventario, quest, combat math, spawn deterministico, normalizzazione save, struttura PWA e assenza di CDN.

## Note

- La vecchia versione React/TypeScript/Phaser (`rpg_game/` a root) è stata spostata qui e riscritta senza build per GitHub Pages. `games/rpg/` (l'altro RPG del portfolio) resta invariato.
- Gli effetti sonori sono generati via WebAudio: nessun file audio da scaricare e nessun autoplay prima dell'interazione.
- Il mondo è 820×560 unità; il canvas usa un layout "contain" con DPR limitato per mantenere 60 fps su smartphone.
