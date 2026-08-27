# 🌌 T-SNE 3D — Dispiegamento dei Dati

> Carica un CSV (o scegli un dataset di esempio) e guarda i tuoi dati **dispiegarsi nello spazio**: una proiezione 3D ottimizzata in-browser dove i punti simili si raggruppano in tempo reale. Porta lo slider da *casuale* a *t-SNE ottimizzato* e osserva la **coerenza del clustering** salire.

**Progetto #3 del portfolio** — dimostra competenza matematica/ML che nessun altro progetto mostra e si collega al filone "dati" del sito (world_weather, seriea_simulator).

---

## ✨ Cosa fa

- **Input dati**: file CSV (drag & drop, upload, incolla), 5 dataset di esempio (Iris sintetico, meteo città italiane, calcio a 5 campionati, MNIST ridotto 8×8, blobs generati). Separatori: virgola, punto e virgola, tab. Header opzionale.
- **Classificazione automatica delle colonne**: le colonne numeriche diventano dimensioni (z-score), quelle categoriche (o con pochi valori, tipo id/classe) diventano etichette. Colonna etichetta selezionabile dal pannello.
- **t-SNE leggero in Web Worker**: affinità perplexity (binary search su σ), early exaggeration ×12, momentum (0.5→0.8), inizializzazione casuale → l'ottimizzazione scorre in background senza bloccare la UI (su iPhone compreso). Zero dipendenze, Float32Array.
- **Slider "Dispiegamento" 0–100%**: 0 = posizioni casuali, 100 = convergenza. Avanti = continua, indietro = riparte da zero. **▶️ Dispiega** anima la transizione da solo.
- **Coerenza del clustering (silhouette)**: misurata live sull'embedding 3D rispetto alle etichette (o ai cluster k-means) — il pannello mostra il valore animato + una **sparkline** che sale mentre i gruppi si separano (Iris: −0.04 → 0.74).
- **K-means overlay**: clustering senza etichette (k regolabile), centroidi come stelle grandi che seguono il campo; colora i punti per cluster.
- **🎯 Focus sul cluster**: clicca una voce della legenda → la camera **vola sul gruppo** (tween eased) e gli altri punti si **attenuano** (shader con attributo per-punto); clic sullo spazio vuoto o ✕ per uscire.
- **🪐 Pianeta dei dati / 📐 Vista 2D / 🗺️ Mappa**: toggle per punti su una sfera (globo 3D con anello), proiezione planare in 2D, oppure **mappa stereografica del pianeta** (polo sud al centro, polo nord al bordo del disco, con meridiani e cerchio equatoriale).
- **👻 Confronto prima/dopo**: la disposizione casuale iniziale (iter 0) resta **congelata come fantasma** attenuato mentre il t-SNE si dispiega — vedi a colpo d'occhio il passaggio dal caos alla struttura, in tutte le viste (nuvola, pianeta, 2D, mappa).
- **⏪ Time-lapse**: lo dispiegamento viene **registrato** automaticamente (snapshot delle posizioni + coerenza per iterazione, fino a ~260 frame con decimazione) e riprodotto con **play/pausa, scrub e velocità 1×/2×/4×** — la coerenza e la sparkline seguono la posizione del replay. La registrazione riparte a ogni nuovo run (slider a 0% o nuovo dataset).
- **🔗 Condivisione via URL**: il link incorpora dataset e parametri nell'hash — `#s=iris&p=30&l=4&v=0.5` per i dataset di esempio, `#d=…` (base64) per i CSV personalizzati. Aprendo il link la proiezione si ricostruisce identica. Bottone 🔗 copia il link corrente.
- **Ispezione**: tap/clic su un punto → riga originale del CSV nel pannello; tooltip al passaggio.
- **Export**: PNG della proiezione, JSON (embedding + metadati), CSV (x,y,z + classe).

## 🎨 Scelte stilistiche (come da decisioni)

- Tema **cosmo dei dati**: spazio profondo, nebulose cyan/viola/magenta, campo stellare.
- Punti come **sfere luminose morbide**: shader custom (falloff radiale, core bianco, additive blending) — migliaia di punti in un solo draw call.
- **Responsive iPhone**: pannello controlli come bottom-sheet collassabile su mobile, laterale su desktop; safe-area; touch nativo (orbit + pinch).

## 🛠️ Architettura

- Single-file `projects/tsne-3d/index.html`: **zero build, zero server**.
- **Web Worker** (inline via Blob, con fallback main-thread automatico se i Worker non sono disponibili): `computeP` (perplexity), `step` (gradiente t-SNE simmetrico i<j), `coherence` (silhouette campionata), `normalizeY` (bounding-box −1.5…1.5).
- Three.js r170 via importmap (stesso setup di neural-vision e genetic-art).
- La logica pura (CSV, classificazione, k-means, t-SNE) è isolata e testata in Node: purezza k-means 0.99 sui blobs, silhouette Iris 0.74, MNIST 0.63 (solo dai pixel), roundtrip completo worker.

## 🧪 Test (Node)

- Parser CSV (virgola/; /tab, virgolette, header opzionale)
- Classificazione colonne (feature vs idLike vs etichette — nessun "trucco" sul MNIST: la colonna digit è esclusa dalle feature)
- k-means purity > 0.9 sui blobs (30 run stabili)
- Worker t-SNE end-to-end su Iris e MNIST: coerenza che sale, convergenza in secondi
- Roundtrip condivisione URL: base64 CSV UTF-8 + parametri, hash compatto per i campioni

## 🔗 Link

- Wrapper: `projects/tsne-3d.html`
- App: `projects/tsne-3d/index.html`
