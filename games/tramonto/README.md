# 🌅 Sunset Compass

PWA installabile · GPS + Bussola + Camera AR · EN/IT · iPhone-optimized

Scopri quando il sole scende sotto l'orizzonte, segui il suo percorso in realtà aumentata e segna gli ostacoli che lo nascondono.

## Come installare

1. Apri `index.html` nel browser (Safari su iPhone)
2. Safari → Condividi → "Aggiungi a schermata Home"
3. Funziona offline dopo il primo caricamento

## Funzionalità

### 🧭 Compass
- Bussola vettoriale con ghiera luminosa, tacche, rosa dei venti e ago di prua
- Sole posizionato in tempo reale (azimut + altitudine) con alone e bagliore
- Countdown al prossimo tramonto con anello di progresso
- Ostacoli segnalati con marcatore pulsante

### 📷 Camera AR
- Camera posteriore con overlay del percorso solare (da −30 a +120 minuti)
- Tocca l'orizzonte per segnare un ostacolo (azimut + altitudine)
- Gli ostacoli salvati vengono **ridisegnati** ogni volta che entra la modalità
- Pulsante per cancellare tutti gli ostacoli

### 👻 Timeline
- Prossime 12 ore con altitudine del sole, azimut e punto cardinale
- Eventi evidenziati: tramonto, golden hour, blue hour
- Indicazione quando il sole passa sotto un ostacolo salvato

### 🎨 Tema dinamico
La palette dell'interfaccia cambia con l'altitudine reale del sole:
**giorno → luce dorata → blue hour → notte**, con cielo, alone, sagoma dell'orizzonte e stelle.

## Calcolo astronomico

Algoritmo **NOAA Solar Calculator** (Julian Day, declinazione, Equation of Time, Hour Angle).
I bug storici sono stati corretti:
- azimut non più sbagliato di 180°
- latitudine non più convertita due volte radianti
- countdown calcolato su **timestamp reali**, corretto anche a cavallo di mezzanotte

## Tecnologia

- ES modules, nessuna dipendenza esterna
- CSS separato con design system "golden hour"
- Geolocation API, DeviceOrientationEvent, getUserMedia
- LocalStorage per ostacoli e lingua
- Service worker con navigazione network-first e precache completo
- i18n EN/IT sincronizzata con la barra del sito

## Struttura

```
tramonto/
├── index.html              # shell
├── styles.css              # design system
├── manifest.webmanifest
├── sw.js                   # offline
├── icons/                  # icone PNG
└── js/
    ├── config.js           # palette, stringhe EN/IT
    ├── i18n.js             # lingua + sync top bar
    ├── sun.js              # NOAA + timestamp events
    ├── compass.js          # GPS + orientamento
    ├── camera.js           # camera + ostacoli + geometria AR
    ├── tracker.js          # timeline 12h
    ├── render.js           # strumenti vettoriali e tema
    └── main.js             # bootstrap, router, loop
```
