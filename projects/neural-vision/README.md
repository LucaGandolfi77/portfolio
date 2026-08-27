# NEURAL VISION 🧠

Scrivi un **numero** (0–9), premi **🕸 CALCOLA**, e **guarda la rete
neurale pensare davvero** in 3D. Non è una simulazione: è un **forward pass
reale** eseguito da una *convolutional neural network* MNIST dentro il tuo
browser (TensorFlow.js), mentre Three.js renderizza ogni strato: i neuroni
**si illuminano in proporzione alla loro attivazione**, le sinapsi scelgono il
percorso, e la softmax finale **indovinaya la cifra**.

---

## Come funziona

```
numero scritto ──► immagine 28×28 (come MNIST) ──► CNN ──► predizione
                                              │
                                 attivazioni intermedie (reali)
                                              ▼
                        visualizzazione 3D interattiva (Three.js + Bloom)
```

1. Scrivi una cifra nel campo **NUMERO** → **🕸 CALCOLA**.
2. La rete gira davvero: Conv2D 5×5 (8 filtri) → MaxPool → Conv2D (8 filtri)
   → MaxPool → Dense → **Softmax (10)**.
3. In 3D vedi, **strato dopo strato**, quali neuroni "si accendono".
4. Le **previsioni** (0–9 con %) compaiono in alto; il vincitore pulsa.
5. Usa i controlli: **passo** (input → conv1 → pool1 → conv2 → pool2 →
   dense → softmax), **↯ sinapsi** (particelle che scorrono verso l'output),
   **vel**, **⏵ auto** (replay da solo).

### Modello

- **Primario**: modello MNIST ufficiale TF.js (`learnjs/mnist`) scaricato al
  primo uso (~900KB, cachato) — pesi **veri**, predizioni di una rete
  addestrata.
- **Fallback (se offline)**: il modello viene **addestrato dentro il browser**
  su **MNIST sintetico** (cifre generate via canvas con rotazioni/traslazioni
  casuali): vedi la loss scendere in diretta (~3–8s, richiede WebGL).

---

## Architettura (mostrata)

| Layer | Forma | Note |
|---|---|---|
| Input | 28 × 28 | il numero renderizzato, pixel reali |
| Conv2D (5×5, 8 filtri, ReLU) | 24 × 24 × 8 | rileva bordi e tratti |
| MaxPool 2×2 | 12 × 12 × 8 | riduce, migliora robustezza |
| Conv2D (5×5, 8 filtri, ReLU) | 8 × 8 × 8 | feature di livello superiore |
| MaxPool 2×2 | 4 × 4 × 8 | compressione finale |
| Dense (softmax) | 10 | probabilità per cifra 0–9 |

---

## Controlli

| Cosa | Come |
|---|---|
| Digitare il numero | campo **NUMERO** (0–9) |
| Far pensare la rete | **🕸 CALCOLA** |
| Scorrere il calcolo layer per layer | slider **passo** |
| Rivedere dall'inizio | **▶ Replay** |
| Autoplay continuo | **⏵ auto** |
| Mostra/nascondi flussi sinaptici | **↯ sinapsi** |
| Velocità del replay | slider **vel** |
| Ruota / zoom / pan | drag + scroll sulla scena 3D |

---

## Note tecniche e limiti

- **Librerie**: TensorFlow.js `4.22` (WebGL/WebGPU) + Three.js `0.170`
  (Effetto Bloom). Tutto gira **nel browser** — nessun server.
- **La visualizzazione è reale**: ogni cubo/sfera si illumina in base al valore
  **effettivo** del neurone nel forward pass. Le sinapsi sono campionate (sono
  centinaia di migliaia) ma l'intensità è quella vera.
- **Prima esecuzione**: scarica TF.js (~1.5MB) + modello MNIST (~900KB).
  Senza rete, si attiva il **training in-browser** (fallback).
- Serve **WebGL** (o WebGPU) e browser moderno. Su mobile la scena si degrada
  automaticamente (`devicePixelRatio` ridotto).
- L'IPA/chiave fonetica non c'entrano nulla: qui è visione, non audio.

---

## File

```
projects/neural-vision.html        → intro animata (wrapper)
projects/neural-vision/index.html → l'app (TF.js + Three.js, tutto in un file)
projects/neural-vision/README.md → questo
```

*La rete non ti sta guardando. Ma puoi guardarla pensare.* 🧠
