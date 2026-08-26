# KALAAZU — How to Make It Multiplayer (Someday)

> **TL;DR:** today KALAAZU is a happy single-player sandbox: the entire game
> world lives in one browser tab, and your career lives in `localStorage`. To
> make it multiplayer you need one thing this page deliberately doesn't have:
> *someone to be the server*. This document explains, in plain words and
> concrete code, how to add that someone — without rewriting the game from
> scratch.

---

## 1. What the game is today (the part you keep)

Everything the player *sees and touches* is already client-side and
multiplayer-ready in spirit:

| System | Where it runs today | Multiplayer future |
|---|---|---|
| Rendering, camera, minimap, particles | client (Canvas) | **stays client** |
| Input (joystick, tap-to-move, WASD, rockets) | client | **stays client** |
| World layout (maps, stations, portals, asteroids) | `MAPS` + seeded RNG | becomes **server data** |
| Movement math (waypoint, velocities, clamping) | `updatePlayer()` | becomes a **server-authoritative tick**, client just predicts |
| Combat math (damage, shields, absorption, loot rolls) | `applyDamage()`, `killNpc()` | **moves to server** (it decides, clients render) |
| Economy (credits, uridium, honor, cargo) | `G.pilot` | **moves to server DB**, clients get read-only snapshots |
| Quests, XP, ranks | `checkQuests()`, `addXp()` | server validates + awards |
| Save/load | `localStorage` | becomes **accounts + sessions** on the server |

The golden rule: **the client proposes, the server disposes.** Everything that
*matters* (who died, who gets the loot, who bought what) must be decided by the
server. Everything that is *cosmetic* (sparks, damage numbers, engine flames)
can stay client-side forever.

---

## 2. The honest problem

The original **manulaiko/Kalaazu** repo solves this with a whole Java stack:
Netty (socket I/O), Artemis-ODB (entity-component-system game loops),
Spring JPA/Hibernate (MariaDB persistence), versioned binary packet protocols
(`v4`, `v10` — you can see the reverse-engineered Flash client scripts in its
`doc/reverseEngineering/swf_v10/`), and a Spring event bus to glue it together.
That's a great architecture and a terrible first step for a browser game.

You don't need Java. You need **three decisions**:

1. **Transport** — how clients talk to the server.
2. **Authority** — who computes the "truth" each tick.
3. **State** — where persistent player data lives.

Everything else is detail.

---

## 3. Option A — Server-authoritative WebSocket (recommended, the "real" way)

This is the closest spiritual match to Kalaazu: a single authoritative process,
a JSON (or binary) command protocol, and dumb-ish clients.

### 3.1 The stack (all boring, all free)

- **Server:** Node.js + `ws` (or Bun + `bun:websocket`). One process, one tick loop.
- **Persistence:** SQLite first (zero setup), MariaDB/Postgres later — map your
  existing save shape straight onto Kalaazu's own tables (`accounts`,
  `accounts_ships`, `accounts_items`, `accounts_drones`, `accounts_galaxygates`,
  `accounts_quests`, `clans`, …). The schema already exists in
  `Persistence/database/` — steal it.
- **Client:** the existing `index.html`, plus a thin `Net.js` that replaces
  `saveGame()`/`loadGame()` with `send('cmd', payload)`.

### 3.2 The protocol (JSON, command-name style — a nod to Kalaazu's packets)

Keep the names close to the original in/out commands so the nostalgia writes
itself. Two message envelopes:

```jsonc
// client → server
{ "c": "login", "d": { "token": "…", "version": 1 } }
{ "c": "shipSelect", "d": { "shipId": 4 } }
{ "c": "move",      "d": { "x": 12400, "y": 7800, "autopilot": false } }
{ "c": "attack",    "d": { "targetId": 4021 } }
{ "c": "rocket",    "d": { "targetId": 4021, "rocket": "PLT-2021" } }
{ "c": "collect",   "d": { "boxId": 9102 } }
{ "c": "portal",    "d": { "portalId": 3 } }
{ "c": "buy",       "d": { "item": "ship_goliath", "currency": "uridium" } }
{ "c": "chat",      "d": { "msg": "gg" } }
{ "c": "ping",      "d": {} }

// server → client
{ "c": "init",      "d": { "account": {…}, "mapId": "1-1", "entities": [ … ] } }
{ "c": "entity",    "d": { "op": "create", "e": { "id": 4021, "type": "npc", "npcType": "saimon", "x": …, "y": …, "hp": …, "shield": … } } }
{ "c": "move",      "d": { "id": 12, "x": …, "y": …, "angle": … } }        // broadcast position
{ "c": "hp",        "d": { "id": 12, "hp": 3400, "shield": 1200 } }
{ "c": "loot",      "d": { "boxId": 9102, "items": [ … ] } }
{ "c": "remove",    "d": { "id": 4021, "reason": "dead" } }
{ "c": "chat",      "d": { "from": "StreunerEnjoyer", "msg": "gg" } }
{ "c": "pong",      "d": {} }
```

Binary later if you care (Kalaazu uses versioned `PacketSerializer`s; you can
do the same with a simple `[commandId:u16][length:u16][payload]` frame). JSON is
fine for your first 1,000 players — and "fine for 1,000 players" is already
better than most MMO launches.

### 3.3 The server tick (Kalaazu's `GameLoop`, minus Artemis)

The repo runs one Artemis world per map with a fixed-rate `GameLoop`. You do
the same with plain arrays:

```js
// server.js — the entire MMO in miniature
const maps = new Map(); // mapId -> { entities: Map, players: Map, npcs: Map }

setInterval(() => {
  for (const map of maps.values()) {
    // 1. read movement intents, move entities (collision/clamping server-side)
    // 2. run NPC AI (port updateNpc() from the client, as-is)
    // 3. resolve combat (port applyDamage()/killNpc() as-is)
    // 4. respawns, boxes, galaxy-gate waves (port updateGate() as-is)
    // 5. broadcast diffs: moved entities, hp changes, spawns, deaths, loot
  }
}, 100); // 10 ticks/sec is plenty for this game (the client interpolates)
```

Here is the lovely secret: **almost the entire game logic already exists and is
already written in boring portable JavaScript.** `updatePlayer()`,
`updateNpc()`, `applyDamage()`, `killNpc()`, `updateGate()` — these are 100%
server-ready. You are not building a new game; you are *moving the brain into
the server and adding a socket*.

### 3.4 Client changes (small)

1. Delete `saveGame()`/`loadGame()` wiring (or keep it as an offline demo toggle).
2. Add `Net.js`: WebSocket connect → `send()`/`on('msg')` → feed server state
   into the existing entity list.
3. Replace `G.pilot` mutations with optimistic UI + server confirmation:
   - movement: send `move`, interpolate locally toward the last server ack
     (client-side prediction; the server position wins every tick).
   - combat: when you press fire, show the laser instantly (cosmetic), but let
     the server compute damage — it sends `hp` back. For a game this size,
     ~150ms of "server truth lag" is invisible if you interpolate.
4. **Interest management:** don't send every entity to every client. Send
   entities within ~1,200px of each player (Kalaazu's `VisibilitySystem` does
   exactly this via `VisibleByComponent`). Your maps are 20,800×12,800 — a full
   broadcast is wasteful, and sector-based streaming is the classic fix.

### 3.5 Persistence — your save file becomes tables

Current `localStorage` shape → future DB:

| Now (`kalaazu.save.v1`) | Later (Kalaazu's tables) |
|---|---|
| `pilot.name`, `pilot.faction` | `accounts` (+ `factions`) |
| `pilot.level`, `xp`, `credits`, `uridium`, `honor` | `accounts` columns |
| `pilot.ship`, `pilot.owned` | `accounts_ships`, `accounts_hangars` |
| `pilot.equip`, `pilot.inv` | `accounts_configurations`, `accounts_items` |
| `pilot.cargo` | `accounts_items` (ore rows) |
| `pilot.drones` | `accounts_drones` |
| `gate.cleared` | `accounts_galaxygates` |
| `quests`, `progress` | `accounts_quests` |
| (not built yet: clans, skylab, tech factory, pets, battlestations) | `clans_*`, `accounts_skylab`, `accounts_techfactories`, `accounts_pets`, `clans_battlestations` |

Session tokens, a login/register screen (the repo has a whole Vue.js **CMS**
module for this — you can borrow its register/login flow), and password
hashing. Congratulate yourself: you now have the exact feature set of the
original Kalaazu server, minus the JavaFX launcher.

---

## 4. Option B — P2P rooms (WebRTC / PeerJS) for quick co-op

If "multiplayer" means *"me and three friends, no server, static hosting"*:

- Use **PeerJS** (this portfolio already ships P2P games with it — same trick).
- One player is the **host** and runs `update()` locally (Option A's tick loop,
  in-browser). Others send intents over the data channel; the host broadcasts
  state.
- Works for co-op (quests, gate runs, trading), not for a persistent universe
  (host's browser closes → universe closes). Add "host migration" if you're
  feeling spicy.
- This is the fastest demo path: no backend, no deploy, no cost.

---

## 5. Option C — Hosted realtime platforms (fastest "real" path)

If you'd rather not run your own server:

- **Colyseus** — room-based, authoritative-ish, has matchmaking, JS-first, the
  least code between you and "5 friends in a sector".
- **PartyKit** or **Liveblocks** — great for shared state, better for
  cooperative play than for combat-heavy MMO ticks.
- **Supabase Realtime** — free tier, Postgres persistence for free, but its
  broadcast model is weak for 10Hz entity sync; use it for accounts/chat,
  not for combat ticks.

You can even mix: Colyseus for game rooms, Supabase for accounts/rankings.

---

## 6. Recommended roadmap (in dependency order)

1. **T1 — Shared space.** Accounts + login, one map, movement broadcast,
   chat. Server tick at 10Hz, client interpolation. *Ship floats with friends.*
2. **T2 — Combat.** Server-side damage/NPC AI (port the existing functions),
   interest management, death/respawn handled server-side. *Pirates die for
   everyone equally.*
3. **T3 — Economy.** Server-owned credits/uridium/ore, stations/shop
   transactions validated server-side. *No more console.log(credits).*
4. **T4 — Social.** Clans (Kalaazu's `clans_*` tables), friend/party, honor
   leaderboard (the `accounts_ranking` table exists for this).
5. **T5 — Galaxy gates as instances.** Each gate run spawns a private room —
   Kalaazu already models this with `galaxygates` + `GG Alpha/Beta/Gamma` maps.
6. **T6 — PvP maps & events.** The `4-x` maps in the DB are PvP (`is_pvp`),
   invasion events have maps (`MMO Invasion`, `EIC Invasion`…). Your future
   self will thank you for keeping map data data-driven (the `MAPS` object is
   already 90% of the way there).

---

## 7. Anti-cheat, briefly (don't skip, it's two paragraphs)

Client-authoritative anything is cheatable by anyone who opens DevTools. The
fix is structural, not technical: **never trust the client with numbers that
matter.** Server computes damage rolls, loot, and purchases; client only sends
intents (where to go, whom to attack). Add a cheap sanity check: if a client
claims to have moved 10,000px in one tick, the server quietly resets it to the
last valid position and logs "teleport detected" (Kalaazu's moderation tables
`moderators_logs` are exactly for this kind of thing).

---

## 8. What to delete from the client when you go live

- `SAVE_KEY`/`STORE` persistence (becomes the login screen)
- Client-side `addXp`, `sellAllOre`, quest reward application (become server
  RPCs)
- The "Wipe universe" button (becomes "delete account", with *many* more
  warnings)

Keep: everything under "stays client" in the table above. The game is
basically an MMO already — it just doesn't know it yet.

---

*KALAAZU — the next generation of DO private servers. First it was Java.
Now it's one HTML file. Tomorrow it's a WebSocket. The generation never ends.*
