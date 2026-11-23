# NBA Broadcast Simulator

A fully on-device basketball simulator with 30 franchises, tactics, franchise mode and advanced analytics.

## Stack

- **ES modules**, pure simulation core (`js/sim/`) separated from DOM/render code.
- Deterministic RNG (`js/core/rng.js`) and seeded daily challenges; Web Worker for batch what-if simulations.
- WebGL2 court renderer with procedural hardwood, lines, glow and point-sprite players (`js/render/court-gl.js`); Canvas2D fallback (`court-2d.js`).
- Versioned storage `pf.nba.v2` with automatic migration from the old `nba.sim.v1` blob.
- Installable PWA: manifest with icons/shortcuts, versioned service worker, offline fallback.
- EN/IT interface using the shared Project Shell.

## Features

- **Game**: playbooks (Pick & Roll, Horns, Iso, Fast Break, Zone Buster, Bully), defensive schemes, fatigue, injuries, morale, substitutions, adjustments, clutch time and overtime.
- **Season**: 30 teams, two conferences, 29-week round robin, standings, weekly or full simulation.
- **Playoffs**: 16-team field, best-of-7 series, home court, conference finals and NBA Finals.
- **Career**: roster editing, contracts, trades, free agency, draft, multi-year progression, XP, levels and badges.
- **Analytics**: box score, TS%, eFG%, EFF, leaders, shot zones, quick batch simulations.
- **Social**: bilingual play-by-play, highlight replay, Web Share and local history.

## Mobile

`viewport-fit=cover`, `100dvh`, safe-area insets, 44 px tap targets, adaptive DPR, bottom tab navigation, reduced-motion support.

## Tests

```bash
node --test projects/nba_simulator/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```

11 tests cover determinism, rosters, season, playoffs, advanced stats and franchise actions.
