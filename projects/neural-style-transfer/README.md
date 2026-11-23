# Neural Style Studio

Browser style-transfer studio with instant GPU previews and optional **real neural renders** that never leave the device.

## Stack

- **Preview**: WebGPU where supported, WebGL2 otherwise, Canvas2D as a last resort (`js/preview.js`). Fullscreen shaders do color transfer, style mixing, stroke displacement, masking, before/after split, vignette and grain.
- **Neural render**: ONNX Runtime Web 1.21.0 with the ONNX Model Zoo **Fast Neural Style Transfer** models (candy, mosaic, rain-princess, udnie, pointilism — 6.6 MB each). WebGPU execution provider with automatic WASM fallback; models are streamed into `CacheStorage` on first use (`js/neural.js`).
- **No uploads**: photos, styles and inference stay on the device. Only the model and runtime are downloaded from a CDN and cached.

## Features

- 3 built-in photos + photo upload; 5 built-in styles + custom style upload.
- GPU mode with two-style mixing slider, strength and before/after split.
- Touch/mouse **strength brush**: paint the effect only where you want it.
- **Live camera** stylization with snapshot capture.
- **Neural enhance** button for a high-quality ONNX render, with downloadable PNG.
- Timelapse of blend keyframes with replay, scrub and replay controls.
- EN/IT interface, installable PWA with icons, shortcuts and offline fallback.

## Mobile

`viewport-fit=cover`, `100dvh`, 44 px tap targets, adaptive DPR (1 on low quality, up to 2 otherwise), 30 fps camera preview, pointer/touch brush, reduced-motion support.

## Files

```
index.html                 app shell
styles.css                 studio UI
js/app.js                  controller
js/preview.js              WebGPU/WebGL2/Canvas2D pipeline
js/neural.js               ONNX engine + model cache
js/pipeline.js             pure image/tensor helpers
js/styles.js               style registry
js/history.js              timelapse keyframes
js/i18n.js                 EN/IT dictionary
test/logic-test.mjs        Node tests
examples/                  SVG presets
legacy-neural-style-transfer.*  legacy launcher (unchanged)
```

## Tests

```bash
node --test projects/neural-style-transfer/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```

The first neural render needs network access to download the runtime and one model; after that the app and model work offline.
