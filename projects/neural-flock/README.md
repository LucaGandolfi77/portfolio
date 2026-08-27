# 🕊️ NEURAL FLOCK — Smart Swarm

> A hypnotic 3D swarm of boids whose **every turn is decided by a tiny neural network** — 19 inputs → 28 hidden tanh neurons → 3 steering outputs — **trained live in your browser** on synthetic steering data. Pick a target shape (heart, arrow, spiral, text, your own drawing…) and watch the flock learn to form it.

**Portfolio project #5** — particle physics × AI, visually hypnotic, nothing like it in the archive.

---

## 🧠 The brain

- **Custom tiny network, pure JS** (no libraries): inputs are the boid's *state* + the *slider parameters*:
  `[target dir (3), alignment dir (3), separation dir (3), cohesion dir (3), obstacle dir (3), curiosity, alignment, separation, cohesion]` = **19 inputs → 28 hidden → 3 outputs** (steering vector).
- **Trained in-browser** (Web Worker, chunked): synthetic state/parameter samples with a *teacher* policy (weighted boids rules + noise), mini-batch SGD with momentum. Live **loss curve**; at startup the flock visibly *learns to fly together*; the **🧠 Train** button retrains from scratch (more epochs).
- Because the sliders are **network inputs**, dragging curiosity/alignment/separation/cohesion mutates behavior *through the brain* — no retrain needed.
- **Live brain panel**: the miniature network of the focus boid, with neuron activations lighting up (cyan + / magenta −) and the steering outputs — edges scaled by weight.
- **Boid inspector**: tap any boid to inspect its brain.

## 🌌 The flock

- Neon-cosmos scene: nebula sprites, starfield, additive glow shaders.
- Up to **2000 boids** as glowing particles with **motion trails** (per-boid velocity-stretched line segments, gradient fade), spatial-hash grid neighbor search (fast on iPhone).
- **Seven target shapes**: ⭕ Circle · ➡️ Arrow · ☁️ Cloud · ❤️ Heart · 🌀 Spiral · 🔤 Text (type up to 6 chars) · ✏️ Freehand drawing.
- **Formation score** (% of boids near their assigned target) + **🎆 fireworks** when the shape snaps into place.
- **Environment**: 🧱 tap to place obstacles (boids dodge them via the obstacle input), 🦅 **predator hawk** that dives into the flock and scatters it, 🖱️ cursor attractor.
- 🔊 **Density chirps**: subtle synthesized sounds whose pitch follows local flock density; fanfare on formation.
- 📸 Screenshot PNG.

## 🍎 iPhone-optimized

Spatial-hash grid + cheap shader rendering keep it smooth up to 2000 boids; training runs off-thread in a worker; portrait layout with collapsible bottom panel; touch-native (drag to orbit, tap to inspect, draw with the finger); DPR-capped canvases.

## 🛠️ Architecture

- Single-file `projects/neural-flock/index.html` (zero build): Three.js r170 via importmap; the neural net lives twice — a training copy in the inline **Web Worker** (blob, with main-thread fallback) and an inference copy on the main thread (identical math, verified in Node).
- Teacher policy: `steer = normalize(c·target + a·align + s·separate + h·cohere + 0.6·obstacle)` over random synthetic states — the net learns to approximate it (held-out cosine **0.96** after training).

## 🧪 Test (Node)

- Worker training: loss 0.24 → **0.074**, held-out cosine vs teacher **0.957**, curiosity-only input steers toward +x.
- All 5 procedural shapes fit the scene bounds (cloud bug found & fixed: gaussian normalization).
- Fallback classical steering keeps the flock coherent during the first training pass.

## 🔗 Links

- Wrapper: `projects/neural-flock.html`
- App: `projects/neural-flock/index.html`
