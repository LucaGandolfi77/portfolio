# Dettagli algoritmici

## t-SNE (van der Maaten & Hinton, 2008)

t-SNE converte similarità ad alta dimensione in probabilità e poi cerca una disposizione 3D che le riproduca.

### 1. Distanze e probabilità condizionali `P`

Per ogni coppia `(i, j)` si calcola la distanza euclidea quadrata nello spazio delle feature z-normalizzate. Per ogni punto `i` si cerca β tale che l'entropia della distribuzione

$$p_{j|i} = \frac{\exp(-\lVert x_i - x_j\rVert^2 \beta_i)}{\sum_{k\neq i}\exp(-\lVert x_i - x_k\rVert^2 \beta_i)}$$

sia `log(perplexity)`. La ricerca è una biseczione di 50–60 iterazioni. La `perplexity` (5–60) esprime il numero effettivo di vicini considerati: valori bassi evidenziano cluster locali, alti la struttura globale.

Infine si simmetrizza: `p_ij = (p_{j|i} + p_{i|j}) / (2N)`.

### 2. Similarità a bassa dimensione `Q`

Le coordinate `Y` (N×3) usano un kernel a code pesanti (Student t con 1 grado di libertà):

$$q_{ij} = \frac{1}{1+\lVert y_i-y_j\rVert^2}, \qquad q_{ij} = \frac{q_{ij}}{\sum_{k\neq l} q_{kl}}$$

La coda pesante evita che i punti lontani si comprimano tutti insieme ("crowding problem").

### 3. Gradiente e early exaggeration

L'obiettivo è minimizzare la KL divergence `KL(P‖Q)`. Il gradiente è:

$$\frac{\partial C}{\partial y_i} = 4\sum_j \big(\alpha\,p_{ij} - q_{ij}\big) q_{ij} (y_i - y_j)$$

dove `α` è il fattore di **early exaggeration** (default 12) applicato alle prime 100 iterazioni e poi portato a 1. Questo crea spazio tra i cluster prima che la disposizione finale si stabilizzi.

L'aggiornamento usa momentum 0.5 fino a 100 iterazioni, poi 0.8, con learning rate 200.

### 4. Complessità

- Memoria: `O(N²)` per P e Q (per N = 1500 ≈ 18 MB per matrice).
- Tempo: `O(N² · D)` per P e `O(N² · iterazioni · 3)` per il gradiente.

Per dataset più grandi servono approssimazioni Barnes–Hut o FFT (openTSNE, UMAP). Questa implementazione privilegia la chiarezza e usa un Web Worker per non bloccare l'UI.

## K-means e metriche

**K-means** assegna ogni punto al centroide più vicino e ricalcola i centri fino a convergenza (max 30 iterazioni). L'inertia (somma delle distanze quadratiche) guida la scelta di **K ottimale** con penalità lineare `0.01·k`.

Le metriche sono calcolate sullo spazio 3D proiettato:

| Metrica | Definizione | Interpretazione |
|---|---|---|
| **Silhouette** | media di `(b−a)/max(a,b)`, con `a` distanza media intra-cluster e `b` distanza al cluster più vicino | 1 = separazione ideale, <0 = sovrapposizione |
| **Davies–Bouldin** | media del worst-case `scatter_i / dist(i,j)` | più basso è meglio |
| **Calinski–Harabasz** | `(between/(k−1)) / (within/(N−k))` | più alto è meglio |
| **Explained variance** | `between / (between+within)` | frazione di struttura catturata |

La silhouette è campionata su al massimo 400 punti per mantenere il calcolo interattivo durante il dispiegamento.

## Time-lapse

Ogni 4 iterazioni viene salvato uno snapshot `Float32Array` di `Y` (al massimo ~60 frame). Il replay mostra i frame con intervallo regolabile (180 ms ÷ speed), permettendo di osservare come early exaggeration e convergenza modellino i cluster.
