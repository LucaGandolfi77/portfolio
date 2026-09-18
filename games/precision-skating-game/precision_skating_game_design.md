# Precision Skating Game — Blueprint

## Core fantasy
You are the choreographer/coach of a 16-skater precision team. Build a routine, pick formations and features, then perform it to music while correcting individual skaters who drift.

## Modes
1. **Choreographer** — drag/arrange 16 skaters, choose elements, variants, holds, features, timing and routes.
2. **Live Performance** — rhythm gameplay: tap/hold/swipe on musical markers; tap drifting skaters for quick corrections.
3. **Crisis Mode** — multiple simultaneous mistakes force fast prioritization.
4. **Competition** — teams perform comparable routines and receive a game-specific technical/artistic score.
5. **Career** — recruit/train skaters, unlock harder elements, costumes, music and arenas.

## Core interaction
Do not make the player steer all 16 skaters continuously. The formation engine keeps the team moving; the player intervenes at high-value moments.
- Tap on beat = timing input
- Hold = sustained action
- Swipe = direction/rotation
- Tap skater = corrective impulse
- Drag skater = stronger/manual correction
- Tap formation = choose the next formation

## Formation engine
Parametric templates for line, block, circle, wheel, pivot, intersection, traveling and no-hold. Each skater receives a target position, velocity and heading.

## Error system
At musical checkpoints generate position drift, timing error, spacing error, wrong direction, hold break or transition error. Error probability depends on skater stats and routine difficulty.

## Skater stats
Precision, Timing, Speed, Flow, Balance, Synchronization, Stamina, Recovery.

## Game scoring (NOT official World Skate scoring)
Technical 0–50; Execution 0–25; Artistic 0–20; Penalties 0 to -10; Combo bonus 0–5. Track formation integrity, synchronization, timing, flow, transitions and successful interventions.

## Visual design
Top-down 2D rink first. 16 distinct skater sprites with colored target rings, trails for movement, warning halo for drift, beat line/timeline and a compact HUD. iPhone-first touch targets.

## Prototype order
Start with LINE, BLOCK, CIRCLE, WHEEL, INTERSECTION and TRAVELING. Make a 60–120 second routine. Validate whether tapping/correcting skaters is fun before building the full 4:30 competition mode.

## Data architecture
SQLite can be the authoring database; export JSON for the browser/PWA. Each element variant references features; program sequences reference variants; skater stats modify error probability.

## Rule-versioning
The catalog is based on the detailed World Skate Precision 2025 document. World Skate Europe publishes a 2026 Artistic Rulebook, and some required element shapes are set yearly, so keep `source_rule_version` and update the database for the competition year you target.
