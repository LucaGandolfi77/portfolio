# 👁️ FACE LAB — Distortion Mirror

> Look into the camera: **68 AI landmarks** trace your face in 3D in real time, a holographic wireframe wraps around you, live telemetry reads your expressions — then flip to **Fun mode** and bend reality: giant eyes, funhouse stretch, emoji swap, fish-eye, expressive squash, cartoon.

**Portfolio project #4** — adds visual AI to the existing camera family (kinect_2, shhh-reader) without overlapping neural-vision (which is a pure forward pass on handwritten numbers).

---

## 🛰️ Tech mode

- **MediaPipe FaceLandmarker** (478-point mesh + 52 blendshapes, GPU delegate, WASM) — the classic **68-key subset** is highlighted on top of the mesh.
- **Three.js holographic overlay**: glowing points + curated wireframe (jaw, brows, nose, eyes, lips, connectors), additive glow shader, **pulse synced to your expressions** — points flare on blink, smile and brow raise.
- **Head-pose axes** (yaw/pitch/roll) projected from the nose tip.
- **Side telemetry panel**: blink (Eye Aspect Ratio) + live blink counter, smile, brow raise, mouth–nose distance, head pose in degrees with a **gyroscope widget**, and a playful **emotion guess** (happy / surprised / angry / sad / winking / neutral).
- **Multi-face**: up to 4 faces detected; secondary faces get dotted outlines, primary face (largest) drives the effects and metrics.

## 🎈 Fun mode — Distortion Lab

| Mode | Effect |
| --- | --- |
| 👁️ **Giant eyes** | Eye cutouts from the original frame scaled ~2× — anime mode |
| ↔️ **Funhouse** | Horizontal stretch of the face region (the "orizzontali allungate") |
| 😳 **Emoji swap** | Eyes and mouth replaced by rotating emojis that track the face |
| 🔮 **Fish-eye** | Real radial bulge via inverse-mapping pixel warp of the face region |
| 🫠 **Squash** | Expressive: mouth opens → face squashes vertically, smile → stretches |
| 🎨 **Cartoon** | Saturated video + bold comic contour outlines of the features |
| 🌀 **Swirl** | Rotational twist of the face region, stronger near the core |
| 🌈 **Chromatic** | RGB channel split (chromatic aberration) on the face region |
| 🧊 **Pixelate** | Blocky mosaic on the face region |
| ⚡ **Neon** | Inverted, saturated, hue-shifted video — cyber glow |
| 👓👑🥸🎩😊🧔😇 **Props** | Vector glasses, crown, mustache, top hat, blush, beard and halo tracking the face |

## ✨ Extra

- **📸 Photo snapshot** — composites the live video + effects + 3D overlay into a PNG download.
- **✏️ Sketch** — a line-art "portrait" of your 68 landmarks (neon on dark), saved to **localStorage** gallery (last 12) + downloadable PNG.
- **🪞 Mirror toggle**, **📷 camera flip** (front/back where available).
- **🔒 On-device**: video never leaves the device.

## 🍎 iPhone-optimized

`playsinline` + muted + autoplay, camera permission on user gesture, `facingMode: 'user'`, safe-area insets, portrait layout with collapsible metrics bottom-sheet and full-width fun bar, DPR-capped canvases, adaptive detection (30 fps), GPU delegate with CPU fallback.

## 🛠️ Architecture

- Single-file `projects/face-lab/index.html` (zero build): 2D canvas pipeline for video + warps + props, transparent Three.js overlay on top (Tech mode only).
- MediaPipe `tasks-vision@0.10.14` (vision_bundle.mjs + WASM from jsDelivr) + the official `face_landmarker.task` model; Three.js r170 via importmap.
- Pure logic (68-map, chains, EAR/blink, head pose, emotion rules) isolated and unit-tested in Node.

## 🧪 Test (Node)

- 68-point mapping: unique, all within the 478-mesh range; chains within 0..67.
- EAR/blink: synthetic open eye → blink 0.00, closed eye → 0.75.
- Head pose: roll/yaw detected from synthetic landmark geometry.
- Emotion rules: smile → happy, brow+jaw → surprised, single-eye blink → wink.

## 🔗 Links

- Wrapper: `projects/face-lab.html`
- App: `projects/face-lab/index.html`
