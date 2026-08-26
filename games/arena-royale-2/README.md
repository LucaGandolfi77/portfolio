# 🔥 Arena Royale 2+ — Twin Stick Royale

Twin-stick 3D battle royale: mappa enorme (260×260), **12 armi** e munizioni
da raccogliere, **9 bot** con munizioni limitate e la **tempesta** che si
restringe. PWA per **iPhone/Android**, funziona su **PC**.

> Rispetto all'originale: **AR2+** aggiunge un sacco di "juice" — risoluzione
> adattiva, screen shake, numeri danno, tracer, rinculo, poof di morte,
> confetti, kill streak, statistiche localStorage, pausa, suoni on/off,
> **KONAMI code = MODALITÀ LEGGENDA**, freccia tempesta e altro.

## 🎮 Controlli

| Dispositivo | Movimento | Mira / sparo | Cambio arma |
|---|---|---|---|
| 📱 iPhone/Android | joystick **sinistro** | joystick **destro** (tieni per sparare) | tasto **PUGNI/ARMA** |
| 🖥️ PC | WASD / frecce | **mouse** + click | **Q** |

Si gioca in **orizzontale** su mobile (avviso di rotazione incluso).

## 🕹️ Novità AR2+

- **Risoluzione adattiva**: se gli FPS calano sotto 40, il rendering scala
  automaticamente (ottimizzazione iPhone).
- **Juice**: screen shake, muzzle flash, proiettili-tracer, rinculo,
  numeri di danno fluttuanti (crit gialli), poof di morte, esplosioni.
- **Kill streak**: "⚡ DOPPIO!", "🔥 RAGE!", "👑 GODLIKE!".
- **Statistiche** (localStorage): partite, vittorie, eliminazioni, miglior
  piazzamento, streak max, precisione di tiro.
- **Pausa** (⏸ / Esc / P) + pausa automatica quando la tab è nascosta.
- **Suoni on/off** (persistito) + **haptics** (Android).
- **KONAMI code** (↑↑↓↓←→←→BA) → **👑 MODALITÀ LEGGENDA**: danno ×3 per 20s
  con aura dorata. Digitare **"gg"** → confetti. 🎉
- **Confetti + slow-mo** alla vittoria.
- **Freccia tempesta** quando sei fuori zona + **vignetta** HP basso.
- **Three.js locale** (niente CDN): primo caricamento più veloce e offline
  totale con il service worker.

## 📁 File

```
games/arena-royale-2/
├── index.html        # canvas + HUD + overlay + avviso rotazione
├── style.css         # stile dark mobile-first, safe-area
├── js/main.js        # tutto il gioco
├── js/vendor/three.module.js  # Three.js 0.160 locale
├── manifest.json     # PWA (landscape)
├── sw.js             # offline (app shell + three locale)
└── icons/            # icone 192/512 + apple-touch-icon
```

## ▶️ Esecuzione

```sh
python3 -m http.server 8080    # poi http://localhost:8080
```

Su iPhone serve HTTPS (GitHub Pages) → "Aggiungi a Home" per la PWA offline.
