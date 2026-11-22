# Atlas

Mappa meteo interattiva con previsioni a 7 giorni, luoghi salvati e calcolatore
di distanze great-circle. Gira interamente nel browser: nessun account, nessun
backend, nessun tracciamento.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/atlas/>

## Cosa fa

- **Meteo** per qualsiasi punto: condizioni attuali, percepita, umidità, vento,
  precipitazioni, alba/tramonto, prossime 12 ore e previsioni a 7 giorni.
- **Ricerca** di città, indirizzi e monumenti con risultati Nominatim.
- **Mappa Leaflet** con tile OpenStreetMap, marker meteo con temperatura,
  geolocalizzazione e reverse geocoding.
- **Distanze**: due punti sulla mappa o coordinate digitate, con distanza,
  direzione (bearing) e punto medio. Il punto medio può aprire il meteo.
- **Luoghi salvati** sul dispositivo, con cache meteo per la lettura offline.
- **Unità** °C/°F e EN/IT, tema chiaro/scuro, layout mobile-first con safe area.
- **PWA** installabile, service worker `pf-atlas-shell-v1` e cache tile separata.

## Struttura

```text
projects/atlas/
├─ index.html               # shell, ricerca, mappa, pannello meteo/distanze
├─ manifest.webmanifest
├─ sw.js                    # shell + tile cache (max 180 tile)
├─ icon.svg
├─ icons/                   # PNG 192/512, maskable, apple-touch
├─ css/app.css
├─ js/
│  ├─ app.js                # controller UI + Leaflet
│  ├─ geo.js                # haversine, bearing, unità, codici WMO (puro)
│  ├─ api.js                # Open-Meteo + Nominatim (fetch iniettabile)
│  ├─ storage.js            # settings, luoghi e cache meteo
│  ├─ i18n.js               # EN/IT
│  └─ vendor/leaflet/       # Leaflet 1.9.4, BSD-2-Clause
└─ tests/                   # Node + fixture condivise con Playwright
```

`geo.js`, `api.js` e `storage.js` non dipendono dal DOM e sono testati in Node.
`app.js` è l’unico modulo che parla con Leaflet e con la pagina.

## Dati e privacy

| Chiave | Contenuto |
| --- | --- |
| `pf.atlas.settings` | unità, modalità, centro/zoom, ultimo luogo |
| `pf.atlas.places` | massimo 12 luoghi salvati |
| `pf.atlas.weather` | cache delle ultime 20 letture (fresche per 45 minuti) |
| `pf.shell.favorites`, `pf.theme`, `pf.lang` | preferenze della shell |

Richieste di rete:

- `api.open-meteo.com` per i dati meteo;
- `nominatim.openstreetmap.org` per ricerca e reverse geocoding;
- `*.tile.openstreetmap.org` per le tile della mappa.

Coordinate, luoghi e cache restano in `localStorage`. Le tile visitate vengono
messe in una cache separata del service worker (non viene fatto prefetch di aree
non visitate). Nessun dato viene inviato a server propri.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/atlas/

node --test projects/atlas/tests/*.test.mjs
node --check projects/atlas/js/app.js
node tools/quality/generate-atlas-icons.mjs
```

E2E (Playwright, Chromium desktop + iPhone emulato, API mockate e geolocalizzazione):

```bash
cd tools/quality
npm ci
npx playwright install --with-deps chromium
npm test
```

I test E2E coprono ricerca, meteo, salvataggio luoghi, distanze da mappa e input,
unità, lingua, geolocalizzazione, redirect legacy, layout mobile e offline con
shell + meteo in cache.

## Note su Leaflet

Leaflet 1.9.4 è vendored in `js/vendor/leaflet/` con licenza BSD-2-Clause: nessuna
dipendenza da CDN. Le immagini dei marker sono incluse e servite localmente.
Le tile OSM sono l’unica risorsa cartografica esterna.

## Deploy

La pagina è statica e viene pubblicata da GitHub Pages. Se cambiano asset,
incrementare `SHELL_CACHE` in `sw.js`. La cache tile ha un limite di 180 voci ed
è indipendente dalla shell; il service worker root del portfolio preserva le
cache `pf-atlas-*`.
