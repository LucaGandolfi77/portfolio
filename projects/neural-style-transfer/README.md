# Neural Style Transfer — Artistic AI

> Transform your photos into artwork in your browser. Choose one of **5 artistic styles** and one of **3 built-in example photos** (or upload your own), and watch the blend animate live from 0 → 100%. Everything runs on-device — nothing leaves your device.

**Portfolio project** — a lightweight, dependency-free homage to *A Neural Algorithm of Artistic Style* (Gatys, Ecker & Bethge). It demonstrates a real, visible artistic-transfer pipeline without shipping hundreds of MB of VGG-19 weights.

## How it works

1. **Pick a photo** — 3 built-in examples (landscape, portrait, city skyline) or 📁 upload your own (square-cropped, cover-fit to 512×512 desktop / 360×360 mobile).
2. **Pick a style** — 5 procedurally-generated example images, each visually distinct:
   - **Starry Night** — swirling skies, luminous oranges and yellows
   - **Cubismo** — geometric fragments, overlapping planes
   - **Pixel Art** — mosaic blocks, crisp edges, retro gaming aesthetic
   - **Abstract Expressionist** — gestural brushstrokes, emotional color fields
   - **Ukiyo-e** — japanese woodblock waves, elegant linework
3. **Watch the transfer** — 50 frames (desktop) / 20 (mobile), blend eased 0→100%:
   - **Perceptual color transfer** (Reinhard-style in YCbCr): the photo's luminance/chroma means & deviations are matched to the style's, so the content keeps its structure while adopting the style's palette.
   - **Per-style artistic filter**: swirling displacement + vibrance + warm/cool split (Starry Night), translucent geometric planes (Cubismo), posterize + true pixelation with big blocks (Pixel Art), gestural brush dabs (Abstract), sine-wave warp + posterize + indigo tint + woodblock outlines (Ukiyo-e).
4. **🧠 Live network panel**: a mini network (photo → style match → output) with neurons and a traveling pulse synced to the blend — the "brain" of the transfer, always visible.
5. **⏪ Timelapse**: every run is recorded frame-by-frame; replay it with play/pause, scrub and 1×/2×/4× speed.
6. **Download** the result as PNG.

HUD shows **ITER / BLEND / TIME** live; 🎲 RANDOM picks a random style + photo; STOP freezes the current frame.

## Technical details

- Color statistics in YCbCr (`Y=0.299R+0.587G+0.114B`), Reinhard-style matching: `y' = (y−μc)/σc·σs + μs`.
- 512×512 px (~262k px/frame) single-pass blend + filters — smooth on iPhone (360×360 there).
- Pure vanilla JS + Canvas 2D, zero dependencies, no server.

## Why "neural"?

The original Gatys et al. algorithm optimizes a generated image against VGG-19 content and style features. Shipping that in-browser needs hundreds of MB of weights; this project instead implements the *perceptible essence* — palette transfer + signature brushwork filters — in ~300 lines, running instantly on any device. The README and UI say so explicitly: an honest, fast, in-browser homage.

## Files

```
projects/neural-style-transfer.html          → intro screen (wrapper)
projects/neural-style-transfer/index.html    → the app (engine + example pickers)
projects/neural-style-transfer/examples/     → 5 style + 3 content example SVGs (real files)
projects/neural-style-transfer/README.md     → this file
```

> The example images ship as real `.svg` files with relative URLs — no inline data-URLs, so they work on any host (GitHub Pages, Codespaces preview, local).

*“Don't just admire art — understand how it's made.”*

---

*Inspired by [A Neural Algorithm of Artistic Style](https://arxiv.org/abs/1508.06576) — Gatys, Ecker & Bethge.*
