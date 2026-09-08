# VITE — Le molte vite di Emmanuel Carrère

Un'esperienza interattiva letteraria che attraversa 8 opere di Emmanuel Carrère attraverso 8 minigiochi unici.

**Zero dipendenze. Offline-first. Solo lettura e meraviglia.**

## Gioca

Apri `index.html` nel browser, oppure visitalo online dopo il deploy.

## Come funziona

| Capitolo | Opera | Minigioco |
|----------|-------|-----------|
| 1. Il treno per Kotelnitch | La vita come un romanzo russo (2007) | Puzzle — riassembla la foto |
| 2. I baffi | I baffi (1986) | Spot the difference |
| 3. Io sono vivo, voi siete morti | Philip K. Dick (1993) | Swipe — realtà o finzione |
| 4. L'Avversario | L'Avversario (2000) | Tower — rimuovi le bugie |
| 5. Il Regno | Il Regno (2014) | Fragments — ricostruisci il testo |
| 6. Vite che non sono la mia | Vite che non sono la mia (2009) | Gentle — parole di luce |
| 7. Yoga | Yoga (2020) | Breathing — respiro guidato |
| 8. V13 | V13 (2022) | Listening — memoria |

## Tech Stack

- Vanilla JavaScript (IIFE modules)
- CSS custom properties, responsive
- Web Audio API (sintetizzata)
- localStorage per salvataggio
- Service Worker (offline-first)
- Web App Manifest (PWA)

**Zero dipendenze. Zero build step. Zero supply-chain risk.**

## Struttura

```
vite-carrere/
├── index.html          # Entry point
├── style.css           # 830 righe di design
├── sw.js               # Service Worker
├── manifest.json       # PWA manifest
├── privacy.html        # Privacy policy
├── js/
│   ├── data.js         # Contenuti (8 capitoli)
│   ├── engine.js       # State management
│   ├── minigames.js    # 8 minigiochi
│   └── ui.js           # Rendering + audio
└── icons/
    ├── icon.svg
    ├── icon-192.png
    ├── icon-512.png
    └── apple-touch-icon.png
```

## Pubblicazione

### Google Play Store (TWA)
```bash
npm install -g @aspect-build/rules_js
bubblewrap init --manifest=https://tu-dominio.com/manifest.json
bubblewrap build
# Upload il .aab su Google Play Console
```

### Web PWA
Deploy su Vercel/Netlify. Il service worker gestisce l'offline automaticamente.

## License

MIT
