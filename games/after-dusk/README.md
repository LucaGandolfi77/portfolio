# After Dusk — Keep the Line Open

A first-person 3D psychological thriller PWA for mobile and desktop browsers, focused on Emma's struggle with nyctophobia as dusk falls and dark shadows gather outside.

## Commands

```bash
npm install
npm run icons     # generate PWA icons & screenshots
npm run dev       # http://localhost:5173
npm test          # Vitest unit tests
npm run build     # TypeScript check + production PWA bundle in dist/
npm run preview   # serve production build at http://localhost:4173
```

Optional Blender 4.2+ GLB kit pipeline (`public/models/kit-*.glb`):

```bash
npm run kit       # headless Blender Cycles AO bake + gltfpack compression
```
