# NOTICE — Licenze delle dipendenze

## eSpeak NG (G2P / IPA)

Questo progetto carica a runtime `@spelling-creator/spellophone@0.2.1` e i dati
`espeak-ng-data` da jsDelivr.

- **eSpeak NG** — Copyright (C) 2006–2024 Jonathan Duddington e contributori.
  Licenza **GPL-3.0-or-later**.
- **@spelling-creator/spellophone** — licenza GPL-3.0-or-later (derivato di eSpeak NG).

Il codice della app non incorpora file di eSpeak nel repository: vengono scaricati
dal CDN al primo utilizzo. Il G2P euristico interno resta come fallback e non
è coperto da tali licenze.

Sorgenti: <https://github.com/espeak-ng/espeak-ng>, <https://www.npmjs.com/package/@spelling-creator/spellophone>

## Transformers.js e Whisper

- **@huggingface/transformers** — licenza MIT.
- **onnx-community/whisper-\*** e **Xenova/whisper-\*** — pesi ONNX derivati da
  OpenAI Whisper, licenza MIT.

## altri

Il resto del codice è quello del portfolio; nessuna ulteriore dipendenza runtime.
