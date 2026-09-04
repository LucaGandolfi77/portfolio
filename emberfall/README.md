# Emberfall Online

Browser-based 3D MMORPG. Dark fantasy, action combat, server-authoritative multiplayer.

## Quick Start

```bash
# Start Docker (Postgres + Redis)
docker compose up -d

# Install dependencies
npm install

# Run database migration
npm run db:migrate

# Seed content (items, quests)
npm run db:seed

# Start server (port 3001)
npm run dev:server

# Start client (port 5173, separate terminal)
npm run dev:client
```

Open http://localhost:5173

## Architecture

- **Client:** React 19 + Babylon.js 7 + Zustand + Socket.IO
- **Server:** Node.js 22 + TypeScript strict + Socket.IO + Prisma 6
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Monorepo:** npm workspaces (`client/`, `server/`, `shared/`)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| 3D Rendering | Babylon.js |
| UI | React 19 |
| State | Zustand |
| Networking | Socket.IO (WebSocket) |
| ORM | Prisma |
| Database | PostgreSQL |
| Language | TypeScript (strict) |
| Runtime | Node.js 22 |
| Bundler | Vite 6 |

## Project Structure

```
emberfall/
├── client/              # React + Babylon.js frontend
│   ├── src/
│   │   ├── game/        # Babylon scene, camera, input, mob rendering
│   │   ├── ui/          # React: HUD, inventory, login, quests
│   │   ├── network/     # Socket.IO client, connection
│   │   └── state/       # Zustand stores
├── server/              # Node.js authoritative server
│   ├── src/
│   │   ├── auth/        # Login, register, character creation
│   │   ├── world/       # Zone manager, mob AI, player state
│   │   ├── combat/      # Damage formulas, skills, cooldowns
│   │   ├── items/       # Inventory, equipment, loot
│   │   ├── quests/      # Quest tracking, completion
│   │   └── chat/        # Chat channels
│   └── prisma/          # Database schema, migrations
├── shared/              # Types, protocol, constants, mob definitions
└── infrastructure/      # Docker, database seed
```

## Game Content (MVP)

- **5 Classes:** Vanguard, Ranger, Arcanist, Mystic, Feral
- **5 Mob Types:** Ember Rat, Cinderbound Scout, Thornback Beetle, Ash Hound, Cinder Warden (boss)
- **20 Items:** Weapons, armor, rings, consumables, gems
- **5 Quests:** First Steps, Pest Control, Gathering Embers, The Lost Patrol, The Cinder Warden
- **3 Skills (Vanguard):** Shield Bash, Whirlwind, Iron Bulwark
- **Inventory:** Grid UI with equip/unequip
- **Loot:** Server-side drop tables with rarity rolls
- **Combat:** Server-authoritative damage, crits, defense mitigation

## Environment Variables

See `.env.example` for all required variables.

## API Protocol

All messages are typed via shared Zod schemas. Key events:

| Event | Direction | Description |
|-------|-----------|-------------|
| `login` | C→S | Authenticate |
| `char:create` | C→S | Create character |
| `char:select` | C→S | Enter world |
| `move` | C→S | Player movement |
| `combat:attack` | C→S | Auto-attack target |
| `combat:cast` | C→S | Use skill |
| `mobs:sync` | S→C | Mob positions (20Hz) |
| `combat:damage` | S→C | Damage event |
| `mob:kill` | S→C | Mob killed + loot |
| `inv:equip` | C→S | Equip item |
| `quest:accept` | C→S | Accept quest |
| `chat:send` | C→S | Chat message |

## Status

MVP Phase 1 — Complete

- [x] Monorepo scaffold + Docker Compose
- [x] Prisma schema + migrations + seed
- [x] Auth (register/login/character creation)
- [x] Babylon.js 3D scene (Greenvale)
- [x] WASD movement with camera
- [x] Mob AI (idle/chase/attack states)
- [x] 25 mobs spawned across Greenvale
- [x] Combat: auto-attack + 3 Vanguard skills
- [x] Server-authoritative damage + crits
- [x] XP/leveling system
- [x] Loot tables + item drops
- [x] Inventory grid UI
- [x] Equipment system (10 slots)
- [x] Quest tracking (kill objectives)
- [x] Quest UI tracker
- [x] Chat system
- [x] Floating damage numbers
- [x] Mob health bars
- [x] TypeScript strict — compiles clean
- [x] Vite build — production ready
