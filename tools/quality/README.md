# Quality tooling

Strumenti di verifica che non fanno parte del sito pubblicato. La CI li esegue
nel workflow **Quality gate** (`.github/workflows/quality.yml`), richiamato dal
deploy: se un test fallisce, GitHub Pages non viene aggiornato.

## Contenuto

| File | Scopo |
| --- | --- |
| `package.json` / `package-lock.json` | Playwright 1.65.1, versione fissata |
| `playwright.config.mjs` | Chromium desktop + iPhone 13 emulato, camera finta |
| `e2e/qr-studio.spec.mjs` | creazione, decode, lingua, camera, upload, layout, offline |
| `e2e/atlas.spec.mjs` | meteo, ricerca, distanze, unità, geo, redirect, offline |
| `e2e/vision-lab.spec.mjs` | camera, modello, mesh, smile, snapshot, lingua, offline |
| `e2e/text-lab.spec.mjs` | OCR reale, rotazione, download, cronologia, lingua, offline |
| `serve.mjs` | server statico locale con MIME corretti e `Permissions-Policy` |
| `make-fake-camera.mjs` | genera `fixtures/qr-camera.y4m` con un QR |
| `make-face-camera.mjs` | genera `fixtures/face-camera.y4m` da un volto reale |
| `audit-baseline.json` | fotografia dei problemi esistenti in `/projects` |
| `generate-qr-icons.mjs` | rigenera le icone PNG di QR Studio |
| `generate-atlas-icons.mjs` | rigenera le icone PNG di Atlas |
| `generate-vision-icons.mjs` | rigenera le icone PNG di Vision Lab |
| `generate-text-icons.mjs` | rigenera le icone PNG di Text Lab |

## Comandi

```bash
cd tools/quality
npm ci
npx playwright install --with-deps chromium
npm test                 # genera i video e lancia i 56 E2E (1 skip mobile)
npx playwright test --headed
```

Test Node (senza browser), dalla radice:

```bash
node --test projects/qr-studio/tests/*.test.mjs projects/atlas/tests/*.test.mjs projects/vision-lab/tests/*.test.mjs projects/text-lab/tests/*.test.mjs
```

## Audit con baseline

`scripts/audit-projects.mjs` analizza tutti i file in `/projects` e scrive
`reports/projects-health.{json,md}`. La baseline evita che il debito storico
blocchi ogni modifica, ma fa fallire la CI su **nuovi** problemi:

```bash
node scripts/audit-projects.mjs --baseline=tools/quality/audit-baseline.json
```

Dopo aver risolto problemi o averne accettati di nuovi consapevolmente:

```bash
node scripts/audit-projects.mjs --update-baseline
```

La fingerprint è `file::codice::messaggio`, senza numero di riga: spostare una
riga non invalida la baseline. I problemi risolti vengono conteggiati e possono
essere rimossi con il prossimo aggiornamento.

## Camera finta

I test camera usano Chromium con:

```text
--use-fake-ui-for-media-stream
--use-fake-device-for-media-stream
--use-file-for-fake-video-capture=tools/quality/fixtures/qr-camera.y4m
```

`make-fake-camera.mjs` costruisce un QR con la stessa matrice usata dall'app e
lo rasterizza in Y4M. `make-face-camera.mjs` usa Chromium per convertire il
ritratto pubblico del portfolio in un video faccia 640×480. Le fixture sono
generate al volo e ignorate da git.

## Perché non ci sono screenshot di riferimento

I test E2E verificano comportamento e accessibilità (decode reale con jsQR,
overflow orizzontale, target da 44 px, input da 16 px, cache offline). Gli
screenshot sono allegati solo in caso di fallimento, insieme a trace e video.
