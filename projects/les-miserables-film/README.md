# LES MISÉRABLES — LE FIL D'OR

An animated film of about 28 minutes, drawn live in the browser after Victor
Hugo's novel (1862). Illustrated paper characters, painted skies, candlelight,
and one golden thread from the first night to the last dawn.

**Watch:** <https://lucagandolfi77.github.io/portfolio/projects/les-miserables-film/>

Original script and score. No images, footage, video files or recorded music:
every frame is canvas and every note is Web Audio.

## The film

Prologue · I. The Convict · II. The Candlesticks · III. Fantine · IV. A Tempest
in a Mind · V. Cosette · VI. The Wall · VII. Marius · VIII. The Garden ·
IX. The Barricade · X. The Sewer · XI. Javert · XII. Forgiveness · Epilogue.

- 68 shots, 224 lines of narration and dialogue, in English and Italian.
- Some lines are Hugo's own words, shown in French with a translation.
- Characters with faces, costumes, moods and moving mouths.
- A camera that moves, closes in and follows whoever is speaking on narrow screens.
- Transitions: dissolve, iris, golden-thread wipe, fade through light or black.
- Portrait and landscape, from a phone to a desktop.

## Player

- Tap the title page to begin with sound, or watch in silence.
- Optional **narrator voice**, read by the speech voices of your device.
- `Space` play/pause · `←`/`→` 10 seconds · `C` captions · `M` mute · `F` fullscreen.
- Chapters, deep links (`?t=600&lang=it`), save a frame, installable and offline.

## Development

```bash
npm install
npm run dev        # Vite dev server
npm test           # script, timing and picture integrity
npm run build      # type check and production build in dist/
```

The portfolio build (`scripts/build-site.mjs`) publishes `dist/` at
`projects/les-miserables-film/`. End-to-end checks live in
`tools/quality/e2e/les-miserables.spec.mjs`.

### How it is put together

| File | What it holds |
|---|---|
| `src/film/script.ts` | The screenplay: chapters, shots, lines. Timing is derived from it. |
| `src/film/timeline.ts` | The clock: when every shot and line happens. |
| `src/film/shots/` | One picture per shot: camera, light, actors, scenery, sound. |
| `src/film/draw/` | The puppet rig, the cast, painted scenery and weather. |
| `src/film/stage.ts` | Camera, parallax, actor animation, transitions, captions. |
| `src/film/audio.ts` | Score, sound beds and effects. |
| `src/film/voice.ts` | Optional spoken narration. |

To change a scene, edit its lines in `script.ts` and its picture under the same
id in `shots/`. Moves and gestures are tied to line numbers, so they stay in
step when the wording changes. Every frame is a function of time: seeking is
exact.

### Accessibility and content

Captions are on by default and mirrored for screen readers. No rapid flashing;
`prefers-reduced-motion` stills the camera. Content note: poverty, child labour,
war, death and suicide; nothing graphic.

## Credits

After *Les Misérables* by Victor Hugo (public domain). Nothing from any musical
or film adaptation is used. Typefaces: Cormorant Garamond and Inter (SIL OFL).
