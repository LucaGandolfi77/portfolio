# 🔤 PHONETIC TRANSCRIBER

Trascrive **suoni che non si capiscono**: parole inventate, pseudo-lingue, alfabeti sconosciuti. Registra dal microfono o carica un file audio, poi ottieni ortografia, **IPA vero**, chiave fonetica, pannello fonemico, lingue simili e confronto tra chiavi. Tutto nel browser.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/phonetic-transcriber/>

## Cosa fa

- **ASR** con Whisper tiny / base / small (Transformers.js, q8), device WebGPU con fallback WASM e barra di progresso reale.
- **G2P** con **eSpeak NG in WASM** (`@spelling-creator/spellophone@0.2.1` da jsDelivr): IPA per `it, en, es, fr, de, pt` con source-map graphema→parola→IPA. Se il WASM non carica, usa automaticamente le regole euristiche storiche (dichiarato nell'UI).
- **Pannello fonemico**: sillabe, vocali, consonanti, accenti, griglia dei fonemi colorata.
- **Stima lingua**: prior della lingua rilevata da Whisper + profili fonotattici estesi a 8 lingue (IT, EN, ES, FR, DE, PT, NL, PL).
- **Confronta chiavi**: distanza di Levenshtein, similarità percentuale e heatmap dell'allineamento.
- **VAD** a energia: taglia il silenzio ai margini delle registrazioni.
- **Storico** con ricerca, copia, export/import JSON ed **export PNG** della result card.
- **Bilingue IT/EN**, mobile-first, `prefers-reduced-motion`, PWA installabile.

## Architettura

```text
projects/phonetic-transcriber/
├─ index.html              # shell
├─ css/app.css             # design system sonic lab
├─ js/
│  ├─ phonetics.js         # PURO: G2P fallback, chiave, sillabe, fonemi
│  ├─ language.js          # PURO: profili e guess
│  ├─ compare.js           # PURO: Levenshtein e allineamento
│  ├─ g2p.js               # adattatore eSpeak WASM + source-map
│  ├─ asr.js               # catalogo modelli Whisper + progress
│  ├─ audio.js             # decode/resample, VAD, waveform/spettro, recorder
│  ├─ history.js, i18n.js, ui.js, main.js
├─ tests/phonetics.test.mjs
└─ icon.svg / manifest / sw.js / NOTICE.md
```

Le funzioni pure sono testate in Node; il modulo G2P e l'ASR caricano le dipendenze da CDN solo al primo utilizzo.

## Privacy e licenze

Audio, trascrizioni e storico restano nel dispositivo (`phon_trans_hist_v2`, `phontrans.lang`). Nessun upload. Il primo avvio richiede rete per Whisper e per i dati eSpeak; poi la cache del browser/service worker li riusa.

eSpeak NG è distribuito con licenza **GPL-3.0-or-later**; il wrapper `@spelling-creator/spellophone` e i suoi dati seguono la stessa licenza. Vedi `NOTICE.md`. Transformers.js è MIT, i modelli Whisper sono MIT/OpenAI.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/phonetic-transcriber/

node --test projects/phonetic-transcriber/tests/*.test.mjs
node --check projects/phonetic-transcriber/js/main.js
```

Microfono richiede HTTPS o localhost. Browser moderni con WebAssembly e `AudioContext`.
