# 🛰️ WAR ORBIT

A 2D space arcade clone inspired by the **War Universe** wiki (Notion).
Everything in the game is in **English**. Open `index.html` — works on **iPhone**
(virtual joystick, safe-area aware) and **desktop** (WASD + mouse).

## 🎯 What it is

You are a pilot starting from a tiny shuttle with a cheap laser. Earn **BTC**
and **PLT**, collect and refine **resources**, buy ships, guns, ammo, shields,
speed generators and extensions, reach new **maps** through **portals**, and
take part in **events**. All the systems below mirror the War Universe wiki.

## 🧪 Automatic test engine

The game ships with a **self-playing test engine** that verifies the core
mechanics that could break: you can run it from the pause menu (**🧪 Test
automatico** button) or open `index.html?test=1`. It executes 34 scenarios
(start, movement and map bounds, combat and rewards, resources, ammo shop,
extensions, rockets, portals and level gates, base shop, equipment, squad,
Battle Royale, Convoy, death and respawn, save/load) and prints a **PASS/FAIL**
report on screen.

## 🚀 Features

### Factions
- **Solar Federation** — balanced starter faction.
- **Orion Imperium** — aggressive, high-damage builds.
- **Vega Concord** — fast and defensive builds.

### Ships (with passive abilities)
- **Shuttle** — the humble starter.
- **Veles** — balanced all-rounder.
- **Vostok** — fast, fragile.
- **Hecate** — tanky, reduces alien damage (-80%).
- **Hyperion** — high-end, +15% rewards.

### Combat
- Lasers **LG-1 … LG-4** with increasing damage and fire rate.
- Ammo types **RLX / GLX / BLX / WLX** with damage multipliers (buy boxes at base).
- **Rockets** for burst damage (cooldown).
- Extensions: **Nuclear bomb**, **Invulnerability**, **Repair**, **Invisibility**.

### Progression
- Resources: **Mercury, Erbium, Cerium** (mine from rocks), **Azurit, Uranit,
  Darkonit** (alien drops + refining), sell and refine at the base.
- Upgrades (Azurit/Uranit/Darkonit): **hull**, **shield**, **damage**.
- **Shield generators** (SG-1…3) and **speed generators** (ACC-1…3).
- **Ranks**: Private → Marshal (from Honor).
- **Maps X-1 … X-3** with portals gated by level.

### Events
- **Battle Royale**: a shrinking radiation zone, 20 AI bots, last one standing
  wins +500,000 PLT.
- **Convoy**: escort 4 freighters through hyper-jenta waves; bonus per freighter saved.

### Squad
- Recruit up to **3 wingmen** (they follow you, engage enemies, and give you a
  reduced reward split — like clan play).

### Quality of life
- **Minimap** (top-right) showing rocks, aliens, portals, base and you.
- Pause menu, save/load (auto-persisted in `localStorage`), free respawn.
- Desktop: WASD + mouse aim, E interact, Q extension, R rocket, 1-4 ammo,
  SPACE autofire, ESC menu. Mobile: virtual joystick + action buttons.

## 📁 Files

- `index.html` — shell + HUD + overlays (start, base shop, menu, death).
- `js/data.js` — all game data (factions, ships, guns, ammo, aliens, maps, ranks).
- `js/game.js` — engine (input, combat, AI, events, shop, save/load, rendering).
- `js/test.js` — the automatic test engine (`window.__TEST__`).

## ▶️ Test it headless

```bash
# node --check on every inline script is done via the project validation; the
# game itself can be driven headlessly with the harness used during development.
node /tmp/warorbit-testengine.js   # expects: RESULT: 34/34 PASS
```
