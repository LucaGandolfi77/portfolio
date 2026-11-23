# Italy 3D Flight Sim

A large, offline-capable 3D flight simulator over Italy. Terrain, lakes, rivers, coastline, towns and city labels come from public-domain real-world data, not from procedurally invented maps.

## Play on a phone

Open <https://lucagandolfi77.github.io/portfolio/games/italy-3d-flight-sim/> and choose **Add to Home Screen**. WebGL and HTTPS are required; after the first load the game works offline. Use LOW graphics on older phones.

## What's inside

- **Real terrain**: SRTM-derived elevation grid (512×512, ~0.12 world units per metre) with Alpine and Apennine heights up to ~4600 m, vertex-coloured by altitude with snow caps.
- **Real water**: Natural Earth coastline, lakes and rivers.
- **Real places**: 77 urban polygons generate instanced 3D buildings; major cities get labels from Natural Earth populated places.
- **Real airports**: 15 Italian airports at their actual coordinates with oriented runways.
- **Flight simulation**: 6DoF-lite physics with pitch/roll/yaw, speed, stall, fuel, boost, ground collision, chase/cockpit/overview cameras, artificial-horizon HUD, day/night lighting, clouds and AI traffic.
- **11 craft**, free flight and six missions with landing checkpoints.

## Data sources

- Natural Earth 50m vectors — public domain: <https://www.naturalearthdata.com/>
- Mapzen Terrarium tiles (SRTM elevation) — public domain: <https://registry.opendata.aws/terrain-tiles/>

Regenerate with `npm run data`. Generated files in `data/` are committed so CI/deploy never need network access.

## Build and test

```bash
npm run check
npm test
npm run build      # standalone dist/, ~1.5 MB (includes Three.js and geodata)
npm run preview    # http://localhost:8000/
```

`build.mjs` copies the app, the vendored Three.js module, the shared kit modules it uses and the geodata into `dist/`, rewrites relative imports, and stamps the service-worker cache with `BUILD_ID`. `dist/` is gitignored.
