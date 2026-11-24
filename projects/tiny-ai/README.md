# 🤖 Tiny AI

Chat con modelli linguistici piccoli che girano **davvero nel browser**: Transformers.js (ONNX, WebGPU → WASM), WebLLM, OpenRouter e backend avanzati. Interfaccia liquid glass, EN/IT, PWA offline, nessun dato inviato a terzi tranne le chiamate esplicite all'API cloud.

## Verifica modelli (2026-11-24)

Gli ID sono stati controllati contro Hugging Face API (`/api/models/{id}`, `config.json`, `/tree/main/onnx`) e contro `@mlc-ai/web-llm` `prebuiltAppConfig` 0.2.89:

- ✅ Tutti i modelli locali elencati esistono e hanno pesi ONNX `q4`/`q4f16`.
- ❌ Rimosso `SmolLM2-135M-Instruct-q4f16_1-MLC` (non registrato in WebLLM) → sostituito con `q0f16`.
- ❌ Rimossi i modelli base `SmolLM-135M-ONNX`, `SmolLM2-360M-ONNX` e `distilgpt2` → sostituiti con varianti Instruct.
- ✅ Aggiunti `TinyStories-1M/3M` (~15/22 MB), `LFM2.5-350M`, `Qwen3.5-0.8B-Text`, `gemma-3-1b-it`.
- Il pulsante **Verifica modelli** ricontrolla gli ID in tempo reale.

## Funzionalità SOTA
- **Capability detection**: WebGPU, WebNN, RAM, core → filtra i modelli incompatibili e ne consiglia uno.
- **Chat multiple** persistiti con titolo automatico, eliminazione e reset.
- **System prompt + preset** (Bilanciato/Creativo/Preciso/Codice), temperatura e max token.
- **Streaming token** per OpenRouter con indicatore tok/s; generazione progressiva per i modelli locali.
- **Markdown sicuro** con code block e copy, escape HTML, nessuna libreria esterna.
- **Liquid glass**: layer CSS universale + rifrazione SVG solo Chromium (feature detection).
- **Backend avanzati** (server Flask / WebSocket) spostati dietro checkbox "Avanzate".
- Gestione cache modelli con dialog accessibile (no `confirm()`).

## Architettura

```
tiny-ai/
├── index.html · css/app.css · manifest · icon.svg · icons/ · sw.js
├── js/
│   ├── config.js     modelli verificati, backend, preset, EN/IT
│   ├── i18n.js · storage.js · capabilities.js · verify.js · markdown.js · glass.js
│   ├── backends/{transformers,webllm,openrouter,local}.js
│   ├── ui.js · main.js
└── tests/logic-test.mjs
```

## Test

```bash
node projects/tiny-ai/tests/logic-test.mjs
```

19 test su catalogo modelli, capability, storage, markdown e struttura.

## Fonti
- [Hugging Face API](https://huggingface.co/docs/hub/api) · [Transformers.js](https://huggingface.co/docs/transformers.js)
- [WebLLM prebuiltAppConfig](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)
- [OpenRouter API](https://openrouter.ai/docs)

## Registro catalogo
`assets/js/projects-data.js` — id `tiny-local-ai`, badge "Local AI", icona 🤖.
