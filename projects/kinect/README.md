# Kinetic — Hand Tracking Arcade

Camera-controlled arcade: catch glowing orbs with your hands. Works with a camera (on-device ML) or with a touch fallback.

## Stack

- **Model**: MediaPipe `GestureRecognizer` (`@mediapipe/tasks-vision@0.10.18`, float16 gesture model), GPU delegate with automatic CPU fallback. One inference returns 21 landmarks per hand, handedness and the gesture label (Open_Palm, Closed_Fist, Pointing_Up, Victory, Thumb_Up/Down, ILoveYou).
- **Smoothing**: One Euro filter on all landmarks, gesture debouncing (3 consistent frames) and hand-loss grace (`filters.js`).
- **Graphics**: WebGL2 point-sprite renderer with additive glow (`renderer.js`); automatic Canvas2D fallback when WebGL2 is unavailable or lost. No Three.js dependency.
- **PWA**: full manifest with icons and shortcuts, versioned service worker with offline fallback, runtime cache for CDN model/WASM. First launch needs a network connection; afterwards the shell works offline.
- **i18n**: shared `kinect` namespace in `i18n/en.json` and `i18n/it.json`, consumed by `i18n.js` and the site top bar.

## Modes and controls

- **Classic** — catch orbs with index fingertip or wrist.
- **Time Attack** — 60 seconds, faster spawns, 1.4× score.
- **Gesture Combo** — each orb requires its matching gesture; 1.8× score.

Difficulty: relaxed / normal / chaotic. Settings: mirror, sensitivity, render quality, sound.

Keyboard: `Enter` start/retry, `Space` pause/resume, `R` restart, `M` mute, `Esc` close settings.

## Mobile

`viewport-fit=cover`, `100dvh` stage, safe-area insets, 44 px tap targets, adaptive DPR (1.5 on touch devices, 2 on desktop), 30 fps inference cap on mobile, camera released when the tab is hidden. Touch mode works without camera or WebAssembly.

## Tests

```bash
node --test projects/kinect/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```

The logic tests cover scoring, combo caps, misses, gesture matching, end-of-game summary, One Euro smoothing, gesture debouncing and pinch distance.
