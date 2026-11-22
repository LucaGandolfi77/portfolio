# Tesseract.js

- API: `tesseract.js@5.1.1` — Apache-2.0 (see `LICENSE-tesseract.js.md`)
- Worker: `dist/worker.min.js` from the same package
- Core: `tesseract.js-core@5.1.0` LSTM builds, SIMD + no-SIMD fallback — Apache-2.0
  (see `LICENSE-tesseract-core`)
- Languages: `eng` and `ita` from
  https://github.com/tesseract-ocr/tessdata_fast (Apache-2.0), gzipped locally.
- Files are served locally; no CDN or remote language download at runtime.
