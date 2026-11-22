# QR Studio

Lettore e designer di codici QR che gira interamente nel browser. Nessun upload,
nessun account, nessun tracciamento: immagini e contenuti restano sul dispositivo.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/qr-studio/>

## Cosa fa

- **Crea** QR per link, testo, Wi-Fi, contatti vCard, email, SMS, telefono,
  luoghi e eventi calendario.
- **Scansiona** con la fotocamera (torcia e zoom dove supportati) oppure
  caricando o trascinando un'immagine. La decodifica avviene in locale con jsQR.
- **Personalizza** correzione errori, motivo (quadrato, morbido, punti), colori,
  sfondo trasparente e dimensione di export.
- **Esporta** in PNG o SVG, copia negli appunti o condividi tramite il foglio
  di condivisione del sistema.
- **Cronologia** locale con riuso, download, copia ed eliminazione.
- Interfaccia **EN/IT**, tema chiaro/scuro/auto, layout mobile-first con safe area
  e target da 44 px.

## Struttura

```text
projects/qr-studio/
├─ index.html               # shell, tre pannelli (Crea / Scansiona / Cronologia)
├─ manifest.webmanifest     # PWA installabile
├─ sw.js                    # cache offline pf-qr-studio-v1
├─ icon.svg                 # icona vettoriale
├─ icons/                   # PNG 192/512, maskable, apple-touch
├─ css/app.css              # layout e componenti specifici
├─ js/
│  ├─ app.js                # controller UI
│  ├─ forms.js              # tipi di contenuto e mapping (dati puri)
│  ├─ i18n.js               # dizionari EN/IT
│  ├─ qr-logic.js           # costruzione e parsing dei payload
│  ├─ qr-render.js          # matrice, forme, canvas e SVG
│  ├─ scanner.js            # fotocamera, torcia, zoom, immagini
│  ├─ storage.js            # cronologia e impostazioni
│  └─ vendor/               # qrcode-generator, jsQR (versioni fissate)
└─ tests/                   # test Node (logica, raster, struttura)
```

I moduli `js/*.js` (escluso `app.js`) sono puri o ricevono il DOM dall'esterno,
così possono essere testati in Node senza browser.

## Dati locali

| Chiave              | Contenuto                                      |
| ------------------- | ---------------------------------------------- |
| `pf.qr.history`     | ultimi 50 QR creati o scansionati (dedupe per contenuto) |
| `pf.qr.settings`    | correzione errori, stile, colori, dimensione   |
| `pf.shell.favorites`| preferiti della Project Shell                   |
| `pf.theme`, `pf.lang` | tema e lingua condivisi con il sito           |

La cronologia non lascia mai il dispositivo. Il pulsante *Svuota* elimina solo
`pf.qr.history`.

## Sviluppo e test

Non ci sono dipendenze di build. Servi la cartella con un qualsiasi server statico
(la fotocamera richiede HTTPS o `localhost`):

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/qr-studio/
```

Test locali:

```bash
node --check projects/qr-studio/js/app.js
node --test projects/qr-studio/tests/*.test.mjs
node tools/quality/generate-qr-icons.mjs   # rigenera le icone PNG
```

I test raster costruiscono le forme QR, le disegnano in un buffer RGBA e le
decodificano con jsQR: verificano quindi che gli stili restino scansionabili
senza bisogno di un browser.

La verifica end-to-end (camera finta, click, download) gira in CI con Playwright
e può essere eseguita in locale:

```bash
cd tools/quality
npm ci
npx playwright install --with-deps chromium
npm test
```

## Privacy e accessibilità

- Tutte le immagini sono elaborate con Canvas/`createImageBitmap` in locale.
- Nessuna richiesta di rete dopo il caricamento degli asset.
- Nessun font o script da CDN: le librerie QR sono vendored e fissate.
- Focus visibile, ruoli ARIA per tab e dialoghi, testi ridimensionabili,
  `prefers-reduced-motion` gestito dalla Project Shell.
- La lingua segue `pf.lang` e l'evento `project:langchange`.

## Deploy

La pagina è statica e viene servita da GitHub Pages. Il service worker usa una
cache versionata (`pf-qr-studio-v1`): incrementare `CACHE` in `sw.js` quando
cambiano gli asset. La root del sito mantiene il proprio service worker; questo
scope è limitato a `projects/qr-studio/`.
