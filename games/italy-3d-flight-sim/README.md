# Italy 3D Flight Sim

A large, offline-capable 3D flight simulator over Italy. Terrain, lakes, rivers, coastline, towns and city labels come from public-domain real-world data, not from procedurally invented maps.

## Play on a phone

Open <https://lucagandolfi77.github.io/portfolio/games/italy-3d-flight-sim/> and choose **Add to Home Screen**. WebGL and HTTPS are required; after the first load the game works offline. Use LOW graphics on older phones.

## What's inside

- **Large map**: 17 600 × 14 300 world units, built from the SRTM-derived elevation grid (512×512). Relief is gentle by design: one unit of height per 60 m, so the highest peaks stand under 60 units.
- **Sea and beaches**: the shoreline comes from the elevation data, with shallows, surf, wet and dry sand, deep water and level lakes; Natural Earth rivers run across the land.
- **Streamed terrain**: the ground is built in chunks, fine near the aircraft and coarse far away, with trees (and flowers in happy mode) grown only nearby.
- **Happy mode by default**: sunny semi-real look with vivid green terrain, fields, flower meadows, pastel buildings, turquoise water with moving swell and surf, birds, a rainbow and boost confetti. Switch to SATELLITE or MAP MODE in the pause menu at any time.
- **Real imagery**: EOX Sentinel‑2 cloudless 2016 tiles (CC BY 4.0) are bundled offline and draped over the terrain.
- **Real places**: OSM building footprints for 12 major Italian cities are extruded into 3D; other urban areas use instanced buildings from Natural Earth polygons.
- **15 airfields** at their real positions, with level ground, numbered runways at approximate real headings, edge lights, tower and working PAPI lamps.
- **Two flight models**: *realistic* (default) for the seven fixed-wing aircraft, or *arcade*. Switch in the menu or while paused. The helicopter and starships are always arcade.
- **Realistic model**: lift, drag, thrust and weight; air that thins with height; bank-to-turn; angle-of-attack stalls (with alpha limiters on the A320 and fighters); g limits; elevator trim, rudder, airbrake and wheel brakes. HUD shows IAS, G, angle of attack and trim. Z/X rudder, R/F trim, Space brake.
- **Whole flights**: start on the runway, take off with flaps, fly, then land and brake to a stop. Landings are graded 0–100 on sink rate, centreline, alignment and touchdown zone.
- **Cockpit**: attitude indicator with localiser and glide-slope needles, flaps, retractable gear with warning, engine sound and stall horn.
- **Autopilot**: heading, altitude and speed hold, plus navigation to the next stop or the chosen free-flight destination.
- **Also**: fuel, boost, ground collision, chase/cockpit/overview cameras, day/night lighting, clouds and AI traffic.
- **11 craft**, free flight, six airport missions and five landmark tours over 12 real Italian monuments (Colosseum, Duomi, Leaning Tower, Vesuvius, Etna…).
- **Atmosphere**: day/dusk/night cycle with city lights after dark, and clear/cloudy/foggy weather presets. Satellite tiles are loaded lazily only when you switch to satellite mode.

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
npm run build      # standalone dist/, ~13 MB (includes Three.js, geodata and imagery)
npm run preview    # http://localhost:8000/
```

`build.mjs` copies the app, the vendored Three.js module, the shared kit modules it uses and the geodata into `dist/`, rewrites relative imports, and stamps the service-worker cache with `BUILD_ID`. `dist/` is gitignored.

## Controls (realistic model)

| Key | Action |
|---|---|
| W/S, A/D or left stick | Pitch and roll |
| Q/E | Throttle |
| Z/X | Rudder (also steers on the ground) |
| R/F | Elevator trim |
| Space | Airbrake and wheel brakes |
| C / G | Flaps / landing gear |
| H / N | Autopilot / navigation mode |
| I / K | Held altitude up / down |
| L | Line up on the nearest runway when stopped |
| V / P | Camera / pause |

Every switch also has an on-screen button.

## Flight model notes

`js/flight-model.js`, `js/airfields.js` and `js/autopilot.js` are pure logic; per-aircraft figures are the `aero` blocks in `js/config.js`. One world unit is one metre of height and airspeed, while on the ground plan a unit covers roughly 70–90 m: horizontal travel is halved in flight and slowed to a fifth near the ground (`motionFactor`), so turns and runway rolls fit. Air density uses `ATMOS_METRES_PER_UNIT`. Fuel burn is scaled by `FUEL_RATE` so a tank covers the long legs of the map. The coastline field lives in `js/coast.js`, terrain chunks in `js/terrain-grid.js` and the ground shader in `js/terrain-material.js`. The distance readout is in real kilometres, so it does not match the airspeed over time. The tests in `test/` check every aircraft headlessly, including a take-off, a flown approach and a graded landing.
