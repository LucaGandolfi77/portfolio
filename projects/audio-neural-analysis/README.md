# 🎧 AUDIO NEURAL — Genre Analyzer

> Capture your microphone (or play an audio file) and a **tiny neural network** classifies the genre in real time — **rock / classical / jazz / electronic** — while a neon "neural corona" visualizes the spectrum and the four genre confidences. Everything runs on-device.

**Portfolio project** — the full audio-AI pipeline (spectrum → features → network → live visualization) in a single file, zero dependencies.

## How it works

1. **Capture audio** — 🎙 **LIVE** (microphone, `getUserMedia`) or 📁 **FILE** (any audio file, played & analyzed through the same pipeline).
2. **FFT spectrum** — Web Audio `AnalyserNode` (FFT 512 desktop / 256 mobile).
3. **12 spectral features** per window (~250 ms): 5 band energies (bass → air), spectral centroid, rolloff, flux, zero-crossing rate, spread, high/low ratio, flatness.
4. **Tiny neural network 12→16→4** (tanh hidden + softmax), **trained in your browser** on synthetic genre profiles (cross-entropy + SGD momentum, ~250 epochs, live progress in the top bar).
5. **Neural corona** — the spectrum ring + 4 genre arcs whose glow tracks confidence, with the winning genre at the center. A **mini network panel** (12→16→4) lights up with each classification.

## Honest note

The network is trained on **synthetic GTZAN-inspired feature distributions**, not on real recordings — so on real music it responds to *actual spectral character* (bass-heavy → rock/electronic, bright & sparse → classical, syncopated → jazz…) rather than memorized songs. It's an honest, live demo of the complete browser audio-AI pipeline.

## Files

```
projects/audio-neural-analysis.html          → intro screen (wrapper)
projects/audio-neural-analysis/index.html    → the app
projects/audio-neural-analysis/examples/     → 4 genre example SVGs (real files)
projects/audio-neural-analysis/README.md     → this file
```

## Test (Node)

- Feature extraction: bass peak → bass energy 1.0 & centroid 0.01; high peak → air 1.0 & centroid 0.94; zero-crossing 0.95 (fast) vs 0.03 (slow); flux 0 (identical spectra) vs >0 (different).
- Network: 250 epochs on synthetic samples → held-out genre accuracy **1.000**.
