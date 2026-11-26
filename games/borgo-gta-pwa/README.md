# BORGO NOTTE

An original open-world driving game on the real streets of Fidenza, built on
the map of [BORGO SAN DONNINO](../borgo-pwa/). Take a car, run deliveries,
taxi fares and street races, shake off the police and switch between four
radio stations generated live in the browser. Mobile-first PWA.

It is a game in the open-world driving genre with its own name, characters,
interface and look; it is not affiliated with any other game or brand.

## Play

- Keyboard: `WASD` drive or walk, `Space` handbrake, `E` get in / out,
  `R` radio, `H` horn, `M` map, `C` camera, `Esc` pause.
- Touch: joystick on the left, buttons on the right (they change between
  walking and driving). Drag on the screen to look around.
- Jobs wait at the orange beacons: **C** consegna (delivery), **T** taxi,
  **R** corsa (race through checkpoints on real streets). When the alert
  reaches 3, a **fuga** (escape) job starts: lose the patrols in time.
- Taking a car with someone in it, knocking over pedestrians, ramming or
  speeding near a patrol raises the alert (0-5). Stay out of sight to bring
  it down. If the patrols box you in, you are stopped and fined.

## How it is built

- **Map:** `src/data/fidenza.json` from borgo-pwa (OpenStreetMap buildings and
  streets, DBTR heights and street widths, orthophoto roof colours and trees).
- **Look:** procedural canvas textures (facades with lit windows, shopfronts,
  tiles, asphalt with lane markings, pavers), a day-night cycle with sunset
  haze, street lamps and headlights at night, blob shadows. The town is
  chunked (320 m) with one mesh per surface, trees and lamps are instanced,
  and the renderer runs below native resolution on phones.
- **Quality presets:** `bassa` / `media` / `alta` (render scale, traffic,
  pedestrians, view distance); phones start on `bassa` or `media` from the
  device memory. Change it from the pause menu.
- **Traffic and police:** a road graph built from the vehicular streets;
  calm traffic rides its lane kinematically, knocked cars switch to physics;
  patrols chase by shortest path on the graph and straight at you only with
  a clear line of sight.
- **Sound:** Web Audio only, no files: engine, horn, two-tone siren, crashes
  and four generative stations (lo-fi, italo disco, liscio, synthwave).

```bash
npm install
npm run dev     # http://localhost:5175
npm test        # road graph, alert, jobs, save, car physics
npm run build
```

## Credits

Map © OpenStreetMap contributors (ODbL 1.0) · DBTR © Regione Emilia-Romagna
(CC BY 4.0) · AGEA 2023 orthophoto via Regione Emilia-Romagna.
