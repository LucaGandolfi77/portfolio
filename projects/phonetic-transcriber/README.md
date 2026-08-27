# PHONETIC TRANSCRIBER 🔤

Trascrive **suoni che non si capiscono**: parole inventate, pseudo-lingue,
alfabeti sconosciuti. Premi il microfono e parla — o carica un file audio —
e l'app estrae:

1. **Ortografia** — cosa "sentono" le orecchie umane (o Whisper).
2. **Chiave fonetica** — la trascrizione astratta, senza alfabeto (es.
   `finkure` → `finkure`, `schiverrrr` → `siver`).
3. **IPA approssimato** — la notazione fonetica internazionale (es. `ʃiverr`).
4. **Lingua più simile** — una stima euristica di che lingua somiglia (italiano,
   inglese, spagnolo, francese, tedesco) con percentuali.

Gira **interamente nel browser**: Whisper (Transformers.js) + una pipeline
fonetica fatta a mano. Niente server, niente cloud.

---

## Come si usa

1. **Intro** (`phonetic-transcriber.html`): schermata animata con
   waveform neon → bottone **APRI** → app.
2. Scegli un tab nell'app:
   - **🎙 Live / Microfono**: avvia, parla, premi Stop → Whisper trascrive ciò
     che hai detto → vedi ortografia, chiave fonetica, IPA e lingua più simile.
   - **📁 File audio**: trascina o seleziona un file (webm, wav, mp3, m4a…) →
     **🔥 Trascrivi**.
   - **🤔 Linguaggio**: incolla una o più parole/chiavi → barre con la
     stima di somiglianza per 5 lingue. Se non incolli nulla, usa lo
     **storico salvato**.
3. Ogni risultato viene **salvato nello storico** (localStorage, ultime 50) con
   bottoni **📋 Copia**. C'è anche **Copia tutto** e **🗑 Svuota**.

### Esempi reali

| Parola detta (inventata) | Chiave fonetica | IPA | Somiglia a |
|---|---|---|---|
| `finkure` | `finkure` | `finkure` | spagnolo ~29% |
| `laskolaien` | `laskolaien` | `laskolaien` | francese ~44% |
| `drefgolding` | `drefgolding` | `drefgolding` | **inglese** ~45% |
| `weightlighter` | `weaitlaiter` | `weaitlaiter` | **inglese** ~34% |
| `strasspaper` | `straspaper` | `straspaper` | **italiano** ~42% |
| `schiverrrr` | `siver` | `ʃiverr` | spagnolo ~43% |

Il guess della lingua è un **euristico fonotattico** (vocali finali, gruppi
consonantici tipici, doppie, consonanti finali dure): non è una lingua
"certificata", è una **somiglianza**.

---

## Note tecniche e limiti

- **Whisper `whisper-tiny`** (Transformers.js, `q8`, ~150MB) viene
  scaricato al primo uso e poi **cachato dal browser**. Serve connessione (e
  su mobile una rete decente) al primo avvio.
- **Non è IPA certificato**: è una **conversione ortografia→IPA approssimata**
  (regole G2P fatte a mano: `ch→k`, `sch→ʃ`, doppie→scempia, `s`→`s`…).
  Per IPA fonetico vero servirebbe un modello dedicato (Kaldi/ESPNET) —
  questo è un *proxy* leggero che gira nel browser.
- Trascrizioni e storico restano **nel browser** (localStorage). Dati mai inviati
  altrove.
- Serve **HTTPS** (o localhost) per il microfono.
- Browser moderni soltanto (il decoding audio e Whisper hanno bisogno di
  `AudioContext` e module import).

---

## File

```
projects/phonetic-transcriber.html        → intro animata (wrapper)
projects/phonetic-transcriber/index.html  → l'app (tutto in un file)
projects/phonetic-transcriber/README.md  → questo
```

*"Non è il suono che non esiste. È che non sappiamo come scriverlo."*
