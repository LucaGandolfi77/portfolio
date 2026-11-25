# Court Clash — NBA Chest Collector

A **single-player, offline-first** collectible card game inspired by Clash Royale's chest loop. Bet virtual coins on simulated NBA matchups, earn XP and levels, build a 5-card lineup, win chests, collect 300 cards and climb the arenas.

- **Live:** https://lucagandolfi77.github.io/portfolio/games/court-clash/
- **No real money. No server. No PvP.**

## Core loop

1. Pick 1 of 3 quick-match offers.
2. Choose a market: **Winner**, **Margin** (10+ or under 10) or **Total** (over/under).
3. Pick a stake: 50 / 100 / 250 coins.
4. On Winner bets you can **cash out at half-time or Q3**. Cash-out pays coins but no chest.
5. A full win pays coins and awards a chest.
6. Open chests, collect cards, use duplicates as copies and upgrade cards.
7. Build a 5-card lineup. Its power and chemistry boost Winner and Margin picks.
8. Earn XP from every match, chest and mission. Levels never go down and grant coins or wildcards.
9. Climb Rookie → Pro → All-Star → Elite → Legend.

## Match 2.0

- Three matchup offers with different odds and underdog opportunities.
- Winner, margin and total markets with calculated odds.
- Live quarter-by-quarter reveal.
- Cash-out offer based on live win probability; no chest if you take it.
- Final result with score, quarters, top performer, payout and chest.
- Winner / margin picks get the lineup boost; close/total picks do not.

## Lineup

- 5 slots; 3 unlocked at Rookie, 4 at Pro (400 trophies), 5 at All-Star (900).
- Chemistry:
  - +1 per extra position represented;
  - +1 per pair from the same NBA team (max 3);
  - +1 per pair from the same set (max 2).
- `lineupPower = sum of card power + chemistry × 25`
- `boost = min(5, floor(lineupPower / 120))`
- Auto-fill picks the strongest legal lineup.
- The boost applies to the top eight players of the backed team in the simulation.

## Player levels

- 20 permanent levels. XP never decreases, so every match and chest moves you forward.
- XP sources: match played +20, win +30, cash-out +10, chest opened +15, mission claimed +20, daily bonus +50, Daily Challenge +50, tournament win step +40, tournament complete +100.
- Every level grants coins; levels 5, 10 and 15 also grant rare/epic wildcards, and level 20 grants a legendary wildcard.
- Level 1 → 2 needs 80 XP; each following level needs 20 more XP than the previous one.
- Existing v1/v2 saves get a level derived from their match, chest, cash-out and tournament history.
- No level reward grants a chest.

## Arenas and trophies

| Arena | Trophies | Unlocks |
|---|---:|---|
| Rookie | 0 | 3 lineup slots |
| Pro | 400 | 4th slot, Tournament |
| All-Star | 900 | 5th slot |
| Elite | 1600 | Elite badge |
| Legend | 2500 | Legend badge |

- Wins award trophies; losses remove them.
- Underdog wins award more.
- Trophy Road milestones grant coins and wildcards.

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
- Pity: legendary guaranteed within 40 chests.
- Every 10 chests opened grants a wildcard milestone bonus.
- Chests are earned only by winning bets or the tournament. The tutorial chest is the only free one.

## Cards and economy

- 300 NBA players, 4 rarities, 5 sets.
- Levels 1–5; copies required 2 / 4 / 8 / 16; coin costs 100 / 250 / 500 / 1000.
- Duplicates add copies; extra copies at max level become coins.
- Set completion grants a one-time coin reward.
- **Card Lab**: 3 rotating cards per day, purchasable with coins.
- **Wildcards**: add a copy to an owned card of the same rarity.
- **Daily login**: 7-day coin/wildcard track. No free chests.
- Start: 1,000 coins, daily 500 coins, comeback bonus below 50 coins once/day.

## Missions and achievements

- Daily: play 2 matches, win 1, open 1 chest, win a 2.00+ bet. All 4 → bonus.
- Weekly: win 10, open 10 chests, upgrade 3 cards.
- 21 permanent achievements with coin/wildcard rewards.
- **Progress** tab with level, XP, arena, next rewards, trophy road, missions, achievements and stats.
- Guided Play: suggested next goal, one primary Quick Match card, Winner + 50 coins by default, and advanced markets behind "More markets".
- Compact Today strip for Daily Challenge, Tournament and next chest; recent matches collapse.
- Fast match reveal option in Settings.

## Special goals

- **Daily Challenge**: win a Winner bet at odds ≥ 2.00 for +100 coins and +1 chest tier.
- **Tournament**: unlock at Pro, pay 250 coins, win 3 consecutive matches for a Gold chest and 500 coins. A loss ends the run.

## Tech

- Static ES modules, no build step.
- Reuses the NBA simulation engine, rosters, mini avatars and Three.js chest model.
- Versioned storage: `pf.courtclash.v3`, with automatic migration from v1 and v2.
- PWA: manifest, service worker (`court-clash-v3`), offline page and generated icons.
- EN/IT interface, reduced-motion fallback and mobile-first layout.

## Tests

```bash
node games/court-clash/test/logic-test.mjs
node games/court-clash/test/v1-features-test.mjs
node games/court-clash/test/levels-test.mjs
```

- 17 core tests: odds, payouts, chest tiers, draws, pity, upgrades, slots, timers.
- 20 v1.0/v1.1 tests: lineup chemistry/boost, markets/cash-out, arenas/trophy road, achievements, missions, Card Lab, wildcards, login, challenge, tournament and v1/v2 storage migration.
- 10 level tests: XP curve, level derivation, rewards, multi-level ups, migration and sanitisation.
- Playwright smoke tests cover the guided Play flow, next goal, cash-out, chest opening, lineups, filters, Progress tab, level-up modal, mobile/desktop and offline.
