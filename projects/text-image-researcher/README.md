# 🔍 Web Content Researcher

Cerca parole chiave su un sito web e, opzionalmente, sulle sue sottopagine. Raccoglie link, immagini, testo, titoli, meta e sorgente, li ordina per rilevanza e li esporta in più formati. Tutto in un'app statica con interfaccia liquid glass bilingue.

**Live:** <https://lucagandolfi77.github.io/portfolio/projects/text-image-researcher/>

## Funzionalità

- **Keyword**: frasi tra virgolette, parole da escludere con `-`, modalità **AND/OR**, case sensitive e regex.
- **Ranking**: punteggio basato su frequenza, posizione del primo match e presenza di frasi esatte; snippet con evidenziazione.
- **Deep scan** same-domain con concorrenza 3, numero di pagine configurabile e stop immediato.
- **Filtri locali** per testo e dominio, sei tab categoria con conteggi.
- **Export** JSON, CSV, Markdown e HTML.
- **Cronologia** riutilizzabile (URL, keyword e opzioni) con replay e rimozione.
- **Tema** dark/light e interfaccia **IT/EN**, PWA installabile, layout mobile/safe-area.

## Strategia di recupero

`gateway.js` prova in ordine:

1. **fetch diretto** all'URL;
2. **r.jina.ai** reader (`https://r.jina.ai/<url>`);
3. proxy CORS selezionati (AllOrigins, CodeTabs, CorsProxy).

Ogni strategia ha timeout, `AbortController`, fallback e cache in memoria; la UI mostra quale fonte ha risposto. I vecchi proxy thingproxy/cors-anywhere non sono più usati. I contenuti passano da servizi pubblici: **non inserire dati sensibili**.

## Architettura

```text
projects/text-image-researcher/
├─ index.html              # shell moduli ES
├─ README.md
├─ css/app.css             # liquid glass dark/light
├─ js/
│  ├─ url.js / parser.js / search.js / results.js / exporter.js  # PURI
│  ├─ gateway.js           # strategie di fetch
│  ├─ history.js / storage.js / i18n.js / ui.js / main.js
├─ tests/core.test.mjs
└─ manifest.webmanifest / icon.svg / sw.js
```

Le funzioni pure sono testate in Node senza browser.

## Sviluppo e test

```bash
python3 -m http.server 8080
# http://localhost:8080/projects/text-image-researcher/

node --test projects/text-image-researcher/tests/*.test.mjs
node --check projects/text-image-researcher/js/main.js
```
