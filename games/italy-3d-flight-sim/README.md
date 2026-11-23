# Italy 3D Flight Sim

A large, offline-capable 3D flight simulator over Italy. Terrain, lakes, rivers, coastline, towns and city labels come from public-domain real-world data, not from procedurally invented maps.

## Play on a phone

Open <https://lucagandolfi77.github.io/portfolio/games/italy-3d-flight-sim/> and choose **Add to Home Screen**. WebGL and HTTPS are required; after the first load the game works offline. Use LOW graphics on older phones.

## What's inside

- **Real terrain**: SRTM-derived elevation grid (512×512, ~0.12 world units per metre) with Alpine and Apennine heights up to ~4600 m, vertex-coloured by altitude with snow caps.
- **Real water**: Natural Earth coastline, lakes and rivers.
- **Real imagery**: EOX Sentinel‑2 cloudless 2016 tiles (CC BY 4.0) are bundled offline and draped over the terrain; toggle SATELLITE on/off in the pause menu.
- **Real places**: OSM building footprints for 12 major Italian cities are extruded into 3D; other urban areas use instanced buildings from Natural Earth polygons.
- **Real airports**: 15 Italian airports at their actual coordinates with oriented runways.
- **Flight simulation**: 6DoF-lite physics with pitch/roll/yaw, speed, stall, fuel, boost, ground collision, chase/cockpit/overview cameras, artificial-horizon HUD, day/night lighting, clouds and AI traffic.
- **11 craft**, free flight and six missions with landing checkpoints.

## Data sources

- Natural Earth 50m vectors — public domain: <https://www.naturalearthdata.com/>
- Mapzen Terrarium tiles (SRTM elevation) — public domain: <https://registry.opendata.aws/terrain-tiles/>
- EOxCloudless Sentinel‑2 2016, CC BY 4.0: <https://cloudless.eox.at/> — *EOxCloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016)*.
- OpenStreetMap building footprints, ODbL: <https://www.openstreetmap.org/copyright> — © OpenStreetMap contributors.

Regenerate with `npm run data`, `npm run data:imagery` and `npm run data:buildings`. Generated files in `data/` are committed so CI/deploy never need network access. The full offline cache is roughly 20–30 MB.

## Build and test

```bash
npm run check
npm test
npm run build      # standalone dist/, ~1.5 MB (includes Three.js and geodata)
npm run preview    # http://localhost:8000/
```

`build.mjs` copies the app, the vendored Three.js module, the shared kit modules it uses and the geodata into `dist/`, rewrites relative imports, and stamps the service-worker cache with `BUILD_ID`. `dist/` is gitignored.
