# 🧬 GENETIC ART — Evoluzione Artistica Interattiva

> Disegna creature bioluminescenti, selezionale come genitori, premi **EVOLVI** e guarda generazioni di forme organiche nascere, mutare e ramificarsi. Ogni segmento della creatura è un **neurone** il cui colore è il valore di un **gene**.

**Progetto #2 del portfolio** — diverso da tutto il resto: creativo/evolutivo, non "intelligenza artificiale" classica. Three.js (già usato in neural-vision e audio-editor-pwa) + **algoritmi genetici puri** (nessun TensorFlow richiesto).

---

## ✨ Concetto

- **Genoma** (ibrido strutturale + parametrico): ogni creatura è un vettore di segmenti-neuroni (max 24). Ogni segmento ha tipo (orbita / stelo / nastro), genitore, angolo, distanza, dimensione, curvatura, tinta, saturazione, luminosità, pulsazione, fase, opacità. Le mutazioni toccano sia i parametri (piccole variazioni gaussiane) sia la struttura (aggiunta/rimozione di segmenti, cambio di tipo, ri-aggancio del parent).
- **Crossover**: a righe uniforme tra i due genitori, con riparazione automatica dei riferimenti parent→child.
- **Fitness neurale ibrida**: 6 euristiche (simmetria, equilibrio, organicità, armonia, complessità, vitalità) pesate da un **modello che impara il tuo gusto**: i click ❤️/👎 aggiornano i pesi in tempo reale (percettrone minimale, nessuna libreria).
- **Scossa visiva delle mutazioni**: alla nascita i neuroni mutati **lampeggiano**, un'**onda d'urto** si espande dal punto della mutazione e la creatura **trema** un istante, mentre cresce con un'ease elastica.
- **Nomi latini**: ogni individuo riceve un nome scientifico deterministico (genere dalla struttura, specie dalla tinta dominante, es. *Corallus Cyanis f.42*).

## 🎮 Modalità

| Modalità | Cosa fa |
| --- | --- |
| 🌊 **Evoluzione** | Griglia 3D della generazione corrente: clicca le creature (max 2 genitori) e premi EVOLVI. Barra sotto ogni piastra = fitness. |
| 🌳 **Genealogia** | Albero genealogico 3D con nodi-neuroni colorati e archi a gradiente parent→child: clicca un nodo per ispezionarlo e mostrarlo in 3D. |
| 👨‍👧 **Confronta** | Figlio e genitori affiancati su piastre, con legami luminosi: i segmenti **mutati** del figlio pulsano in **ambra** (confronto gene-per-gene con i genitori) e sotto compare lo **spettrogramma genico** — 12 geni × neuroni per ciascun individuo, con le celle mutate del figlio che pulsano in tempo reale. |
| 🫧 **Diorama** | Le creature evolute vivono insieme in un acquario bioluminescente, fluttuando e pulsando; suonano un sottofondo generato dai loro geni. |
| 🔍 **Vedi in 3D** | Dettaglio a schermo intero di un singolo individuo. |

## 🎛️ Controlli

- **Clic** su una creatura → la seleziona come genitore (e mostra i dettagli)
- **Drag** → orbita la camera · **Scroll/pinch** → zoom
- **✏️ Disegna un seme**: cerchi, steli e nastri su canvas 2D vengono tradotti in geni reali
- **▶️ Autopilota**: l'evoluzione procede da sola (top-2 per fitness + crossover + immigrazione selvatica)
- **Sliders**: tasso di mutazione, dimensione della popolazione

## 🧬 Genoma

- **6 primitive**: cerchio (orbita), stelo, nastro, **anello** (toro), **cristallo** (piramide), **ameba** (icosaedro deformato deterministicamente).
- Genoma ibrido strutturale + parametrico: ogni segmento-neurone (max 24) ha tipo, genitore, angolo, distanza, dimensione, curvatura, tinta, saturazione, luminosità, pulsazione, fase, opacità.

## 🧩 Feature extra

- **🖼️ PNG / 📐 SVG**: esporta la creatura selezionata (il PNG è reso con il renderer, l'SVG è vettoriale ricostruito dai geni)
- **💾 Genoma in file**: esporta/importa la creatura in un file JSON (`*.ga.json`, versione 2 con genoma completo)
- **🔗 Condivisione URL**: il genoma è codificato nell'hash del link (tinta bit-exact, features identiche dopo il roundtrip) — apri il link e la creatura viene importata (e salvata nei preferiti)
- **🔊 Suono**: Web Audio puro — ogni creatura "canta" una scala pentatonica derivata dalla sua tinta; più è armoniosa, più suona consonante
- **❤️/👎**: preferiti + addestramento del gusto della fitness
- **♻️ Nuovo mondo**: azzera l'evoluzione

## 💾 Persistenza (localStorage)

| Chiave | Contenuto |
| --- | --- |
| `ga_lineage` | Tutti gli individui (genoma, genitori, generazione, nome, fitness, feature) |
| `ga_taste` | Pesi della fitness appresi dal tuo gusto |
| `ga_favs` / `ga_diorama` | Liste preferiti e abitanti del diorama |
| `ga_settings` | Mutazione, popolazione, suono |

## 🛠️ Architettura

- **Single-file** `projects/genetic-art/index.html` (~48 KB JS): nessun build step, nessun server.
- **Three.js r170** via importmap da unpkg (`three.module.js` + addons: OrbitControls, EffectComposer, UnrealBloomPass, OutputPass) — stesso setup di `neural-vision`.
- Fenotipo: gerarchia di `THREE.Group` annidata per segmento con materiali `MeshBasicMaterial` luminosi + **UnrealBloomPass** per il glow bioluminescente; fit automatico (`Box3`) per normalizzare le dimensioni.
- La logica pura (genoma/crossover/mutazione/fitness/roundtrip URL) è isolata e testabile in Node (invarianti: parent<child, genoma mai vuoto, features in [0,1], roundtrip URL stabile).

## 🧪 Test

La sezione core è verificata con uno smoke test in Node (400+ iterazioni): invarianti di struttura, roundtrip encode/decode, mutazioni strutturali, fitness nel range.

## 🔗 Link

- Wrapper: `projects/genetic-art.html`
- App: `projects/genetic-art/index.html`
