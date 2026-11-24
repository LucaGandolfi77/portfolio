# API reference

I moduli in `js/core/` sono funzioni pure: importabili in Node o nel browser senza effetti collaterali.

## `core/csv.js`

| Funzione | Firma | Descrizione |
|---|---|---|
| `detectSep` | `(text: string) => ',' \| ';' \| '\t'` | Rileva il separatore delle prime 2000 righe. |
| `parseCSV` | `(text, sep?) => { header, rows, sep }` | Parser con supporto virgolette doppie; se la prima riga è numerica genera `col1…colN`. |
| `isNum` | `(value, sep=',') => boolean` | Controllo numerico con supporto virgola decimale. |
| `classifyColumns` | `(header, rows, sep?) => { features, labels, idLike }` | Classifica colonne per frazione numerica e cardinalità. |
| `toMatrix` | `(header, rows, featureIdx, labelIdx=-1, sep=',') => { X, N, D, labels, labelNames, rows }` | Converte in `Float32Array` z-normalizzata per feature. |

```js
import { parseCSV, classifyColumns, toMatrix } from './js/core/csv.js';
const { header, rows, sep } = parseCSV('a,b,c\n1,2,x\n3,4,y');
const { features, labels } = classifyColumns(header, rows, sep);
const m = toMatrix(header, rows, features, labels[0]); // X: Float32Array [N*D]
```

## `core/datasets.js`

`genIris`, `genMeteo`, `genCalcio`, `genMNIST`, `genBlobs`, `genWine`, `genNested` restituiscono **stringhe CSV deterministische** (seed fissi). `byId(id)` è il dispatch usato dall'UI.

## `core/kmeans.js`

| Funzione | Firma | Note |
|---|---|---|
| `kmeans` | `(X, N, D, k, iters=30, seed=42) => { labels, centers, inertia, k }` | Inizializzazione senza reset duplicati. |
| `silhouette` | `(Y, N, D, labels) => number` | Campionata a 400 punti per velocità. |
| `clusterMetrics` | `(Y, N, D, labels) => { silhouette, davies, calinski, variance, k }` | Calcolata nello spazio 3D della proiezione. |
| `optimalK` | `(X, N, D, maxK=8, seed=42) => number` | Penalizza K elevati via `-inertia/N - 0.01*k`. |

## `core/tsne.js`

| Funzione | Firma | Note |
|---|---|---|
| `computeP` | `(X, N, D, perplexity=30) => Float32Array(N*N)` | Ricerca binaria di β per ogni punto, poi simmetrizzazione. |
| `initY` | `(N, rng?) => Float32Array(N*3)` | Piccole coordinate casuali. |
| `gradient` | `(P, Y, N, exaggeration=12) => Float64Array(N*3)` | Q a code pesanti `1/(1+d)`. |
| `stepY` | `(P, Y, V, N, iter, exaggeration, gain, momentum) => Y` | Momentum 0.5 → 0.8 dopo 100 iterazioni. |
| `normalizeY` | `(Y, N) => Y` | Ricentra e porta lo span a 3 per asse. |
| `runChunk` | `(P, Y, V, N, iters, exaggeration, startIter=0) => Y` | Esegue più step e normalizza. |

## `core/share.js`

`encodeHash({ sample, data, perplexity, exaggeration, label, view, level, k }) => string` e `decodeHash(hash) => object | null`. I dati non-campione sono codificati in base64url.

## `scene.js`

`class Scene(canvas)` espone `buildStars(n)`, `buildPoints(Y, N, labels, focused)`, `updatePositions(Y)`, `buildGhost(Y, N)`, `setView(mode)`, `flyTo(x,y,z,duration)`, `resetCamera()`, `render()`, `project(x,y,z)`, `pick(px,py,Y,N,threshold)`.

## `ui.js`

`toast`, `dialog`, `closeDialog`, `renderSamples`, `renderLabels`, `renderLegend`, `renderMetrics`, `setCoherence`, `sparkline`, `inspector`, `hideInspector`, `focusTag`, `clearFocusTag`, `setProgress`, `hero`, `setTab`, `sheet`, `initUI(handlers)`.

Gli handler richiesti da `initUI`: `level`, `play`, `unfold`, `reset`, `replay`, `perplexity`, `exaggeration`, `k`, `autoK`, `view`, `orbit`, `ghost`, `sample`, `label`, `file`, `paste`, `focus`, `clearFocus`, `copy`, `png`, `json`, `csv`, `lang`, `theme`, `metric`, `renderAll`, `sampleId`.

## `main.js`

Non esporta API pubbliche: è il bootstrap. Mantiene `state` (dati, Y, P, iterazioni, metriche, timeline) e collega Worker → scena → UI.
