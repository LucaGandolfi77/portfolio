# 🌅 Sunset Compass

PWA installabile · GPS + Bussola + Camera AR · iPhone-optimized

## Come installare

1. Apri `index.html` nel browser (Safari su iPhone)
2. Safari → Condividi → "Aggiungi a schermata Home"
3. Funziona offline dopo il primo caricamento

## Funzionalità

### 🧭 Compass Mode
- Bussola con posizione del sole in tempo reale
- Countdown al tramonto
- Sole visibile sulla rosa dei venti
- Ostacoli segnati con ✕ arancione

### 📷 Camera AR
- Camera posteriore con overlay del percorso sole
- **Tap per segnale ostacoli** (montagne, edifici, alberi)
- Ogni ostacolo salva azimuth + altitudine
- Mostra quando il sole scende sotto l'ostacolo

### 👻 Ghost Tracker
- Timeline 12 ore: ora per ora
- Posizione sole (azimuth + altitudine)
- Golden hour, blue hour, tramonto evidenziati
- Barra visuale con posizione sole

### 🏔️ Ostacoli
- Segna dove il sole scompare
- Salva in LocalStorage (persiste)
- Tap ✕ per rimuovere

## Calcolo Astronomico

Algoritmo **NOAA Solar Calculator**:
- Julian Day → Solar Coordinates
- Declinazione, Equation of Time
- Hour Angle, Azimuth, Altitude
- Sunrise/Sunset, Golden Hour, Blue Hour

## Tech Stack

- Vanilla JavaScript (no dependencies)
- Geolocation API (GPS)
- DeviceOrientationEvent (bussola)
- getUserMedia (camera AR)
- LocalStorage (ostacoli salvati)
- Service Worker (offline)

## Struttura

```
tramonto/
├── index.html              # UI + CSS notturno
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # Service worker
├── icons/                  # Icone PIL
└── js/
    ├── sun.js              # NOAA solar calculator
    ├── compass.js          # Bussola + GPS
    ├── camera.js           # Camera AR + ostacoli
    ├── tracker.js          # Ghost tracker
    └── main.js             # Router + UI
```

## Palette: Notte Stellata

- Background: `#0a0a14` (nero stellato)
- Sun: `#f0a030` (oro tramonto)
- Horizon: `#3a2a1a` (terra scura)
- Text: `#e8d8c0` (crema)
- Accent: `#ff6b35` (arancione)
- Stars: animazione twinkle
