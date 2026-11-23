# Court Clash — NBA Chest Collector

A small **single-player, offline-first** card game inspired by Clash Royale's chest loop. You bet virtual coins on quick NBA match simulations, win chests, collect 300 player cards and upgrade them with duplicates.

- **Live:** https://lucagandolfi77.github.io/portfolio/games/court-clash/
- **No real money. No server. No PvP.**

## Loop

1. Pick an NBA matchup from the Play tab.
2. Choose a team and a stake (50 / 100 / 250 coins).
3. The quick match simulates instantly, with a short score reveal.
4. Correct pick → coins + chest. Wrong pick → lose the stake.
5. Open the chest from the Chests tab (one chest unlocks at a time).
6. Collect 3–5 cards, get duplicates as copies, and upgrade cards with copies + coins.

## Hybrid collection boost

The team you back receives a small support boost from your collection:

```
collectionPower = sum of owned card power
boost = min(5, floor(collectionPower / 1500))
```

The boost is applied to the top eight players of your pick for the simulation. Displayed odds remain based on the base team strength, so the boost is a real progression advantage.

## Chests

| Chest | Timer | Cards | Guarantee |
|---|---:|---:|---|
| Wood | 30 s | 3 | common/rare |
| Silver | 2 min | 3 | at least 1 rare |
| Gold | 10 min | 4 | at least 1 epic |
| Legendary | 30 min | 5 | at least 1 legendary |

- Stake 50/100/250 → Wood/Silver/Gold.
- Underdog win (odds ≥ 1.80) or 3-win streak → +1 tier, up to Legendary.
- 4 slots, one active unlock, speed-up with coins.
- Pity: a legendary is guaranteed within 40 chests.
- Chests are earned only by winning bets; a single tutorial Wood chest is the exception.

## Cards

- 300 NBA players, 4 rarities and 5 sets.
- Levels 1–5; copies required: 2 / 4 / 8 / 16.
- Coin upgrade costs: 100 / 250 / 500 / 1000.
- Duplicates add copies; extra copies at max level become coins.
- Set completion grants a one-time coin reward.

## Economy

- Start: 1,000 coins + tutorial chest.
- Daily: 500 coins.
- Comeback bonus: 100 coins when the balance drops below 50 (once per day).
- All coins are virtual and only exist in local storage (`pf.courtclash.v1`).

## Tech

- Static ES modules, no build step.
- Reuses the NBA simulation engine and static rosters, the mini avatar renderer and the Three.js chest model.
- Multi-card chest reveal with a 3D chest, confetti and reduced-motion fallback.
- PWA: manifest, versioned service worker, offline page and generated icons.
- EN/IT interface.

## Test

```bash
node games/court-clash/test/logic-test.mjs
```

17 tests cover odds, payouts, chest tiers, boost, card draws, rarity floors, pity, upgrades, set rewards, slots, timers, speed-up and formatting.

## PWA

The app precaches its shell, modules, Three.js, data and icons. Reload once after a deploy to pick up a new service-worker cache version.
