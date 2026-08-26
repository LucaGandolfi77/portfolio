# KALAAZU · The Next Generation of DO Private Servers (Browser Edition)

A single-file, static, single-player homage to
[manulaiko/Kalaazu](https://github.com/manulaiko/Kalaazu) — a Java private
server for the classic browser MMO *DO*. This version has **0% Java,
0% MariaDB, 0% Netty**, and 100% JavaScript in one `index.html`. The server is
gone. It's just generation now.

## Run it

Open `index.html` in any modern browser (iPhone, Android, desktop — it adapts).
No build, no install, no network. Works from `file://`, from a static host, or
tucked behind a potato.

## What's in it

- **3 faction home maps** (MMO / EIC / VRU) plus the hub `1-2`, the mystery
  map `???`, and the **GG Alpha** galaxy-gate arena (5 waves, no refunds)
- **Click/tap to move, tap enemies/asteroids to target, WASD or a thumb
  joystick to fly, rockets for drama**
- **Mining** — shoot asteroids, collect prometium/endurium/terbium, sell ore
  at stations, respect the cargo hold
- **Combat** — pirates with authentic names and personalities
  (`-=[Streuner]=-` … `-=[Lordakium]=-`, boss variants, and Cubikon, who is
  mostly thinking about it), shields, absorption, drifting damage numbers
- **Progression** — XP, levels, credits, uridium, honor, rank titles, 11 ships
  (Phoenix → Goliath → Citadel), lasers, shields, generators, ammo, rockets,
  up to 3 Gearbox drones
- **Quests** from Commander Captain Obvious, **boxes** with names like
  `theItalianBox` and `pirateBootyBox`, **portals**, **stations**,
  **minimap**, **autopilot**, **export/import saves**, and an easter egg
- **Autosave** to `localStorage` (every 15s + on tab close)

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move / target | Click | Tap |
| Fly freely | WASD / arrows | Left-thumb joystick |
| Rocket | `Space` | 🚀 button |
| Repair | `E` near station / ⚕ button | ⚕ button |
| Minimap | `M` | 🗺 button |
| Quests / Hangar / Settings | `Q` / `H` / `S` | buttons |
| Autopilot | Double-click | Double-tap |

## Multiplayer?

Not yet — by design. See **[multiplayer.md](multiplayer.md)** for the full
roadmap: server-authoritative WebSocket, the JSON protocol, which functions
move server-side, and how your save file maps onto Kalaazu's real database
tables.

## Credits & disclaimers

- Original project: [manulaiko/Kalaazu](https://github.com/manulaiko/Kalaazu)
  (AGPL — the underlying DO gameplay ideas are from the classic
  browser MMO; this is a fan-made single-player tech demo).
- NPC stats, ship names, faction flavor, and item descriptions were lovingly
  lifted from Kalaazu's SQL dumps and then balanced for one human with one
  thumb.
- No Java was harmed (it was never present).
