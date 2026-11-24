# 🌌 T-SNE 3D

Osservatorio interattivo per il dispiegamento di dataset in 3D. Carichi un CSV (o scegli uno dei 7 dataset inclusi) e guardi i punti separarsi con **t-SNE eseguito in un Web Worker**, mentre le metriche di clustering si aggiornano in tempo reale.

## Quickstart

```bash
# dall'root del portfolio
python3 -m http.server 8000
# apri http://localhost:8000/projects/tsne-3d/index.html
```

Non serve build, npm o rete: Three.js è vendoriato in `vendor/` e l'app funziona offline dopo il primo caricamento (PWA).

## Funzionalità

- **t-SNE 3D in Web Worker** con perplexity ed early exaggeration regolabili, 240 iterazioni e fallback main-thread se i Worker non sono disponibili.
- **Controllo continuo del dispiegamento** con slider, play/pausa e **time-lapse** dei frame salvati (1×/2×/4×).
- **K-means** con K manuale o **K ottimale** automatico; evidenzia i cluster e permette il focus su uno con fly-to della camera.
- **Metriche live**: silhouette, Davies–Bouldin, Calinski–Harabasz, explained variance, plus sparkline della coerenza.
- **7 dataset**: Iris, meteo italiana, calcio (5 campionati), MNIST ridotto 8×8, blobs, wine quality, cluster annidati.
- **Viste**: nuvola di punti, pianeta, mappa, proiezione 2D; rotazione automatica e ghost prima/dopo.
- **Ispezione**: click su un punto apre la tabella riga; hover mostra tooltip.
- **Condivisione** via URL hash (serializza dataset, parametri, vista e iterazione) ed **export** PNG / JSON / CSV.
- **Liquid glass**: layer CSS universale + rifrazione SVG solo Chromium (feature detection), EN/IT, design responsive con bottom sheet mobile.

## Architettura

```
tsne-3d/
├── index.html            shell + importmap (Three.js locale)
├── css/app.css           sistema liquid glass
├── manifest · icon.svg · icons/ · sw.js     PWA offline (pf-tsne-shell-v1)
├── vendor/
│   ├── three.module.js   Three.js r170 vendoriato
│   └── OrbitControls.js
├── js/
│   ├── config.js         palette, dataset, stringhe EN/IT, default
│   ├── i18n.js · storage.js · glass.js
│   ├── core/
│   │   ├── csv.js        parser CSV + classificazione colonne + z-score
│   │   ├── datasets.js   generatori puri dei 7 dataset
│   │   ├── kmeans.js     k-means, silhouette, metriche, K ottimale
│   │   ├── tsne.js       P, gradiente, step, normalizzazione
│   │   └── share.js      codec URL hash
│   ├── scene.js          Three.js: shader points, stelle, viste, picking
│   ├── ui.js             pannelli, tab, inspector, modali, toast
│   └── main.js           worker, orchestrazione, replay, export
├── docs/API.md · docs/ALGORITHM.md
├── tests/logic-test.mjs
└── legacy-tsne-3d.html   redirect di compatibilità
```

I moduli in `js/core/` sono **puri** (nessun DOM, nessuna rete) e quindi testabili in Node.

## Test

```bash
node projects/tsne-3d/tests/logic-test.mjs
```

Copre parsing CSV, normalizzazione, generatori, k-means, metriche, t-SNE, share codec e struttura del progetto.

## Limiti

- t-SNE è O(N²) in memoria/tempo: oltre ~1.500 punti l'esperienza degrada; per dataset più grandi serve Barnes–Hut.
- Il CSV condiviso via hash è incluso solo sotto i 4 KB; oltre quella soglia il link contiene solo l'ID del dataset campione.
- La rifrazione SVG richiede Chromium; altrove resta attivo il solo layer CSS.

## Documentazione

- [API dei moduli](docs/API.md)
- [Dettagli algoritmici](docs/ALGORITHM.md)
