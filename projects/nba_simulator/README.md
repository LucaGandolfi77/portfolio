# NBA Broadcast Simulator

A fully on-device basketball simulator with 30 franchises, tactics, franchise mode and advanced analytics.

## Stack

- **ES modules**, pure simulation core (`js/sim/`) separated from DOM/render code.
- Deterministic RNG (`js/core/rng.js`) and seeded daily challenges; Web Worker for batch what-if simulations.
- WebGL2 court renderer with procedural hardwood, lines, glow and point-sprite players (`js/render/court-gl.js`); Canvas2D fallback (`court-2d.js`).
- Versioned storage `pf.nba.v2` with automatic migration from the old `nba.sim.v1` blob.
- Installable PWA: manifest with icons/shortcuts, versioned service worker, offline fallback. The Arena Broadcast UI uses team-colored gradients, animated scorebug, player card grid with procedural 2D portraits, refined 3D avatars with pedestal and lighting, stat rings/bars and a shareable card image.
- EN/IT interface using the shared Project Shell.

## Features

- **Game**: playbooks (Pick & Roll, Horns, Iso, Fast Break, Zone Buster, Bully), defensive schemes, fatigue, injuries, morale, substitutions, adjustments, clutch time and overtime.
- **Season**: 30 teams, two conferences, 29-week round robin, standings, weekly or full simulation.
- **Playoffs**: 16-team field, best-of-7 series, home court, conference finals and NBA Finals.
- **Career**: roster editing, contracts, trades, free agency, draft, multi-year progression, XP, levels and badges. In the **Chest challenge** you simulate a game, guess the winner and open chests: rarities are Common (&lt;80), Rare (80+), Epic (88+) and Legendary (95+), with better odds during win streaks; unlocked players go into your collection.
- **Players** tab: full 300-player list with search, team/position/rarity filters and sorting.
- **3D arena**: broadcast/overhead/baseline cameras, animated crowd, LED ribbon, team-colored lights, procedural player figures and ball trajectories (Canvas2D/WebGL2 fallback).
- **Replay & highlights**: automatic event log with highlight detection, scrubbable replay and WebM export via MediaRecorder (PNG snapshot fallback where unsupported).
- **Advanced collection**: card sets, fragments from duplicates, upgrades, transparent pity counter (legendary guaranteed at 40 pulls), daily chest, targeted crafting with fragments, AI offers for duplicates and flip cards with career info on the back.
- **Virtual betting**: credits with daily allowance, stake selector (10/25/50), odds derived from team strength, underdog payouts, streak bonuses, prop bets (over/under, margin, top quarter), 3-game parlays and set-completion odds bonuses. No real money involved.
- **Chest reveal**: animated 3D chest with shake → lid spring → rarity beam → holo card flip → confetti, rarity-specific colors/particles/sounds/haptics, skip button and reduced-motion fallback.
- **Analytics**: box score, TS%, eFG%, EFF, leaders, shot zones, quick batch simulations.
- **Player cards**: click any box score, roster or leader row to open a card with real season averages for star players, advanced metrics, verified quotes or factual trivia, and a procedural 3D avatar.
- **3D avatar**: Three.js r160 (vendored), no external models — jersey/team color, number, height/weight scaling, hair color/style, face shape and skin tone. Drag or use "Rotate" to spin it; a Canvas2D fallback is used if WebGL is unavailable.
- **Social**: bilingual play-by-play, highlight replay, Web Share and local history.

## Mobile

`viewport-fit=cover`, `100dvh`, safe-area insets, 44 px tap targets, adaptive DPR, bottom tab navigation, reduced-motion support.

## Tests

```bash
node --test projects/nba_simulator/test/logic-test.mjs
node games/_kit/test/run-all.mjs
```

19 tests cover determinism, rosters, season, playoffs, advanced stats, franchise actions, real season averages, avatar attributes, trivia, storage migration and chest/rarity logic.
