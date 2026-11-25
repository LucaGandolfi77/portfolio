# Faro Studio — Pi Multiagent

> **Faro Studio** — Italian software foundry. We design, build, and ship mobile apps, games, and tools on Google Play and the Apple App Store.
> *Guidance from Italy. Shipped worldwide.*

---

## 🚀 Quick Start

```bash
cd /workspaces/portfolio/pi-agents
pi                              # enter the pi session (auto-loads AGENTS.md)
```

Inside the session, the Studio Director orchestrates 18 specialized agents via `agent_team`.

### Verify everything is ready

```text
agent_team catalog
# Returns all 18 project agents: aurelio, bianca, carla, creativo, dario,
# elena, enzo, fabio, greta, innovatore, irene, leo, marta, nico,
# trend-hunter, plus packaged: scout, planner, critic, reviewer, validator, worker, synthesizer, docs-auditor, web-researcher
```

Progress & models are tracked in machine-readable records:

```bash
python3 bin/tracker.py check      # validate tracker/ records
python3 bin/tracker.py build      # regenerate index.json + TRACEABILITY.md + dashboard snapshot
python3 bin/tracker.py template   # skeleton for a new run record
```

Open the visual dashboard (`pi-agents/dashboard/index.html`) in a browser —
either served (recommended, live data) or straight from `file://` (bundled
snapshot). See [📈 Progress & Model Tracking](#-progress--model-tracking).

---

## 🎯 Three Ways to Start a Project

### Way 1: You already have an idea

You know what to build. Feed the Discovery playbook with the brief:

```text
agent_team start graphFile graphs/01-discovery.json
Product: shhh-reader. Brief: products/shhh-reader/BRIEF.md.
```

**Flow:** Market scan → PRD → UX sketch → Financials → Synthesis → Go/No-Go memo.

### Way 2: You have a vague direction — agents invent the idea

You say: *"We need a new app idea for the US market."* Agents discover it themselves:

```text
agent_team start graphFile graphs/06-ideate.json
Market gap: US/global, mobile apps, privacy-first. Scan everything: trends, competitor reviews, app store gaps, emerging tech.
```

**Flow:** Trend-Hunter scans the web for opportunities → Creativo brainstorms 5+ concepts → Dario checks game mechanics → Innovatore scores each → Synthesis produces a ranked shortlist.

The Director picks one → proceed to `graphs/07-innovation-sprint.json` → `graphs/01-discovery.json` → build.

### Way 3: You want to add a new product from scratch

```text
# Step 1: Ideation — agents find the gap and invent the concept
agent_team start graphFile graphs/06-ideate.json
Ask: What new mobile app could we build for US/global market with zero backend? Scan trends, competitor gaps, emerging platform features.

# Step 2: Innovation Sprint — deep-dive the winning concept
agent_team start graphFile graphs/07-innovation-sprint.json
Concept: <name from step 1>. Deep-dive.

# Step 3: Full Discovery — validate the concept
agent_team start graphFile graphs/01-discovery.json
Product: <slug>. Brief: products/<slug>/BRIEF.md.

# Step 4: Build
agent_team start graphFile graphs/02-build.json
Product: <slug>. Owned files: <list>. Validation commands: <commands>.

# Step 5: Release gate
agent_team start graphFile graphs/03-release.json
Product: <slug>.
```

---

## 📖 Example: Starting a New App from Scratch

Here's a complete example session where agents discover, invent, and validate a new product autonomously:

### The Director says:

```text
We need a new app idea for busy parents. Nothing with accounts or servers.
Something they'd pay for. US market.
```

### Step 1 — Ideation (`graphs/06-ideate.json`)

**Trend-Hunter** searches for:
- App Store categories where parents spend time
- "Mom apps" with high ratings but low feature depth
- New iOS/Android features parents could leverage
- Cultural moment: post-pandemic parenting fatigue, screen time guilt

**Trend table returned:**
| Trend | Source | Confidence | Implication |
|-------|--------|------------|-------------|
| Screen time guilt is rising | App Store reviews, parenting blogs | high | Parents want tools that help kids self-regulate, not just block |
| iOS 18 widget improvements | Apple developer blog, Sep 2025 | high | Home screen widgets could gamify daily habits |
| Local-first is expected | App reviews, privacy blogs | high | Parents reject cloud storage for kids' data |
| Micro-habits trend | Health app charts | medium | 2-minute habit streaks could work as core mechanic |

**Creativo generates 5 concepts:**

1. **HabitGarden** — Grow a virtual garden by completing 2-minute daily habits. Family garden shared on home screen widget.
2. **FocusKids** — Ambient noise gate for kids' study time (like SHHH for children).
3. **StoryClock** — Bedtime story timer that gradually dims the screen and plays ambient sounds.
4. **ChoreRush** — Chore management gamified as a team quest for the family.
5. **MemoryBox** — Digital scrapbook that grows with the child's age milestones.

**Innovatore scores each:**

| Concept | Novelty | Feasibility | Market | Diff. | Store-Risk | Effort | Score |
|---------|---------|-------------|--------|-------|-----------|--------|-------|
| HabitGarden | 4 | 5 | 4 | 4 | 1 | 3 | **4.2** |
| FocusKids | 3 | 5 | 3 | 3 | 1 | 4 | **3.6** |
| StoryClock | 2 | 5 | 3 | 2 | 1 | 5 | **3.0** |
| ChoreRush | 3 | 4 | 4 | 3 | 1 | 3 | **3.4** |
| MemoryBox | 2 | 5 | 3 | 2 | 1 | 4 | **3.0** |

**Winner: HabitGarden** — unique angle (widget-first gamification), fully on-device, clear monetization (one-time unlock + optional premium plant packs).

### Step 2 — Innovation Sprint (`graphs/07-innovation-sprint.json`)

**Creativo** produces detailed creative brief:
- **Target user:** Busy parents, ages 28-42, kids 3-10
- **Core mechanic:** 2-minute daily habits grow virtual garden plants
- **Widget integration:** Home screen shows garden progress
- **Emotional arc:** Hope (plant seed) → Discipline (water daily) → Pride (garden blooms) → Joy (share)
- **Scope boundaries:** V1.0 = 12 habits, 5 plant types, widget. No accounts, no server.
- **Stretch goals v1.1:** Seasonal garden themes, family sharing (local only)

**Dario** checks game mechanics: core loop (habit → growth → reward) is engaging for kids. Session length: 2 minutes. Retention hooks: daily streak, seasonal events.

**Innovatore** assesses feasibility: fully on-device, zero backend, PWA-compatible. Store risk: low (no accounts, no data collection). Effort: medium (3-week sprint).

**Aurelio** produces proto-PRD → **Recommendation: PROCEED TO DISCOVERY**

### Step 3 — Discovery (`graphs/01-discovery.json`)

Market sizing, competitor analysis, financial projections, risk assessment → **Go/No-Go memo: GO**

### Step 4 — Build → Release → Grow

---

## 📚 Agent Catalog

### Studio Agents (`project:<name>`)

| Ref | Name | Role | Tools | When to Use |
|---|---|---|---|---|
| `project:aurelio` | Aurelio | Chief Product Officer | read | PRDs, scope, go/no-go criteria |
| `project:bianca` | Bianca | Market Intelligence | read (+web) | Competitor scans, market sizing |
| `project:carla` | Carla | ASO & Storefront | read | Store listings, keywords, screenshots |
| `project:creativo` | Creativo | Creative Director | read | Brainstorming, concept design, narrative |
| `project:dario` | Dario | Game Design | read | Core loops, mechanics, economy |
| `project:elena` | Elena | UX | read | Journeys, onboarding, accessibility |
| `project:fabio` | Fabio | Lead Engineer | read, edit, write, bash | **Implementing** authorized code |
| `project:greta` | Greta | QA | read, bash | **Validating** builds, running tests |
| `project:enzo` | Enzo | Release Manager | read, bash | Store compliance, release gates |
| `project:innovatore` | Innovatore | Innovation Strategist | read | Scoring ideas, feasibility, go/no-go |
| `project:irene` | Irene | Localization | read, edit, write | EN audits, Italian translations |
| `project:leo` | Leo | Privacy & Legal | read | GDPR, Data Safety, permissions |
| `project:marta` | Marta | Growth | read (+web) | Launch plans, social copy, PR |
| `project:nico` | Nico | Financial Analyst | read | Monetization, pricing, projections |
| `project:trend-hunter` | Trend-Hunter | Emerging Tech Scout | read (+web) | Platform trends, cultural moments, opportunities |

### Packaged Agents (`package:<name>`)

| Ref | Name | Role | When to Use |
|---|---|---|---|
| `package:scout` | Scout | Local evidence mapper | Find files, configs, source facts |
| `package:planner` | Planner | Implementation contracts | Design contracts, option planning |
| `package:critic` | Critic | Adversarial critique | Challenge assumptions, stress-test plans |
| `package:reviewer` | Reviewer | Artifact reviewer | Review completed code/docs |
| `package:validator` | Validator | Command proof | Verify test/build/syntax results |
| `package:worker` | Worker | Authorized implementer | Edit/write files with authorization |
| `package:synthesizer` | Synthesizer | Fan-in decision | Reduce multiple lanes into one memo |
| `package:docs-auditor` | Docs Auditor | Documentation reviewer | Audit docs, model copy clarity |
| `package:web-researcher` | Web Researcher | External facts | Current web research (needs extension tools) |

---

## 📊 Playbook Catalog

| Graph | Purpose | Authority | Steps | When to Use |
|---|---|---|---|---|
| `01-discovery.json` | Brief → Go/No-Go memo | read-only | 5 | Approved idea → validation |
| `02-build.json` | Approved PRD → built + QA-proven | read + shell + mutation | 4 | **Only after human approval** |
| `03-release.json` | Product → store submission verdict | read + shell | 5 | Ready to ship |
| `04-aso-audit.json` | Listing → ASO action list | read-only | 3 | Improve store presence |
| `05-localize-it.json` | EN product → Italian bundle | read + mutation | 3 | Italian market entry |
| `06-ideate.json` | **Market gap → ranked concepts** | read-only | 5 | **Starting new project from scratch** |
| `07-innovation-sprint.json` | **Concept → proto-PRD** | read-only | 5 | **After selecting a winning idea** |

---

## 🔑 Example Commands

### Discover what apps to build (autonomous)

```text
agent_team start graphFile graphs/06-ideate.json
Scan the US mobile app market for gaps. Focus on: parenting, productivity, health, education. No accounts, no servers. Budget-friendly to build.
```

### Deep-dive one concept

```text
agent_team start graphFile graphs/07-innovation-sprint.json
Concept: HabitGarden — produce a full creative brief and proto-PRD.
```

### Validate an idea

```text
agent_team start graphFile graphs/01-discovery.json
Product: habit-garden. Brief: products/habit-garden/BRIEF.md.
```

### Build it

```text
agent_team start graphFile graphs/02-build.json
Product: habit-garden. Owned files: src/, package.json, manifest.json, sw.js. Exclusions: node_modules/. Validation commands: npm run build, npm test, npm run lint.
```

### Audit store listing

```text
agent_team start graphFile graphs/04-aso-audit.json
Product: habit-garden. List: products/habit-garden/BRIEF.md.
```

### Check release readiness

```text
agent_team start graphFile graphs/03-release.json
Product: habit-garden.
```

### Localize to Italian

```text
agent_team start graphFile graphs/05-localize-it.json
Product: habit-garden. Files: products/habit-garden/i18n/en.json.
```

---

## 🧠 How Agents Self-Discover Ideas

The `graphs/06-ideate.json` playbook is designed for autonomous idea generation. Here's how each agent contributes:

### Trend-Hunter (`project:trend-hunter`)
- If web research tools granted (`exa_search`, `exa_fetch`): searches app stores, tech blogs, Reddit, Hacker News for emerging gaps
- Without web tools: analyzes local evidence from `products/ideas/trends/` and product briefs
- Output: **Trend table** with sources, confidence levels, and product implications

### Creativo (`project:creativo`)
- Takes trend evidence and generates 5+ distinct product concepts
- Each concept must pass the **zero-backend test**: can it be built as an offline-first PWA?
- Output: **Concept briefs** with name, pitch, target user fantasy, core mechanic, emotional arc, visual mood, "why now"

### Dario (`project:dario`)
- Reviews concepts from a game-design perspective
- Even for non-game apps, evaluates engagement mechanics and retention hooks
- Output: **Game-design verdict** per concept (GAME-VIABLE / GAME-REQUIRES-WORK / NOT-A-GAME)

### Innovatore (`project:innovatore`)
- Scores every concept 1-5 across 6 dimensions
- Kills concepts that fail the zero-backend test, violate store policies, or clone existing products
- Output: **Scoring matrix** + ranked shortlist + kill list

### Synthesizer (`package:synthesizer`)
- Reduces all lanes into the Director's memo
- Output: **Ranked concepts** with recommendations and next steps

---

## 📁 Project Structure

```
/workspaces/portfolio/pi-agents/
├── AGENTS.md                    # Studio operating manual (auto-loaded by pi)
├── TRACEABILITY.md              # GENERATED project/run trace (bin/tracker.py)
├── bin/
│   ├── studio.sh                # Studio launcher
│   └── tracker.py               # Tracker builder (check | build | template)
├── dashboard/                   # Hermes-desktop-style visual GUI
│   ├── index.html               #   open in a browser (serve for live data)
│   ├── styles.css
│   ├── app.js
│   └── data/snapshot.js         #   GENERATED file:// fallback dataset
├── tracker/                     # Progress & model registry (single source)
│   ├── README.md                # Data model + workflow spec
│   ├── agents.json              # Agent identity catalog (24 refs)
│   ├── index.json               # GENERATED aggregate consumed by dashboard
│   ├── projects/<slug>.json     # Pipeline stage/status per product
│   └── runs/<runId>.json        # One record per graph run (+ _template.json)
├── .pi/
│   └── agents/
│       ├── aurelio.md           # Agent definitions (18 total)
│       ├── bianca.md
│       ├── carla.md
│       ├── creativo.md
│       ├── dario.md
│       ├── elena.md
│       ├── enzo.md
│       ├── fabio.md
│       ├── greta.md
│       ├── innovatore.md
│       ├── irene.md
│       ├── leo.md
│       ├── marta.md
│       ├── nico.md
│       ├── trend-hunter.md
│       └── logs/                # Activity logs (one per agent)
│           ├── aurelio.md
│           ├── bianca.md
│           └── ...
├── graphs/                      # Playbook definitions (7 total)
│   ├── 01-discovery.json
│   ├── 02-build.json
│   ├── 03-release.json
│   ├── 04-aso-audit.json
│   ├── 05-localize-it.json
│   ├── 06-ideate.json
│   └── 07-innovation-sprint.json
├── products/
│   ├── _template/BRIEF.md       # Template for new product briefs
│   ├── ideas/                   # Ideation pipeline
│   │   ├── README.md
│   │   ├── CHANGELOG.md
│   │   ├── concepts/_template.md
│   │   ├── trends/
│   │   ├── scores/
│   │   └── funded/
│   ├── shhh-reader/
│   │   ├── BRIEF.md
│   │   └── CHANGELOG.md
│   ├── pixel-stretch/
│   │   ├── BRIEF.md
│   │   └── CHANGELOG.md
│   ├── vite-carrere/
│   │   ├── BRIEF.md
│   │   └── CHANGELOG.md
│   └── wikithriving/
│       ├── BRIEF.md
│       └── CHANGELOG.md
└── README.md                    # This file
```

---

## 📈 Progress & Model Tracking

Every graph run is recorded once, in `tracker/runs/<runId>.json` — graph,
project, timestamps, and per-step **agent**, **status** and **LLM model**.
Products carry a living status in `tracker/projects/<slug>.json`. All
human-facing views are generated, never hand-edited:

| Source (edit me) | Generated (never edit) |
|---|---|
| `tracker/runs/*.json` | `tracker/index.json` (dashboard data) |
| `tracker/projects/*.json` | `TRACEABILITY.md` |
| `tracker/agents.json` | `dashboard/data/snapshot.js` |

**Mandatory loop after every terminal run** (also in `AGENTS.md`):

```bash
python3 bin/tracker.py template --run-id r10-<slug> --graph graphs/NN-….json --project <slug>
# fill tracker/runs/r10-<slug>.json with observed steps (status + model per step)
# refresh tracker/projects/<slug>.json (stage / status / blocker / nextStep)
python3 bin/tracker.py build
```

The **dashboard** (`dashboard/`) is a Hermes-desktop-style visual GUI with six
views — **Overview**, **Projects** (pipeline board), **Runs** (activity log),
**Models** (LLM telemetry: steps, success rates, failure per step type),
**Agents** (roster with live stats) and **Timeline** (GANTT of runs). It reads
`tracker/index.json` when served over HTTP and falls back to the bundled
snapshot when opened from `file://`. Full schema and workflow: `tracker/README.md`.

> Model telemetry is the new signal: recording which LLM executed `market-scan`
> turns TRACEABILITY's anecdotal *"Subagent RPC ended with stopReason length"*
> notes into a queryable failure-rate per model and step type. Historical runs
> predating the tracker are bucketed as `unrecorded` — attribution starts with
> the next run.

---

## 🛡️ Iron Rules

1. **Never create `.pi/settings.json`** in this workspace — bash-capable children are refused in trees containing one. pi-multiagent is installed globally for this reason.
2. **Every agent maintains an activity log** at `.pi/agents/logs/<name>.md`. Append after every graph run.
3. **Every project maintains a changelog** at `products/<slug>/CHANGELOG.md`. Append after every release, feature, or fix.
4. **Mutation only with explicit authorization**: owned files, exclusions, validation commands, stop condition.
5. **Discovery before Build**. Build before Release. No shortcuts.
6. **Agents return evidence, not instructions.** The Director decides.
7. **Web research** (trend-hunter, marta) requires extension tools with live catalog provenance. Without them, agents work on local evidence only.
8. **Every run gets a tracker record** (`tracker/runs/`) + a project status refresh, then `bin/tracker.py build`. Never hand-edit generated views (`TRACEABILITY.md`, `tracker/index.json`).
9. **Attribute the LLM model per step** when observable (`null` if unknown — aggregates as `unrecorded`). Never invent model names.

---

## 🔄 Full Pipeline Example

The complete lifecycle from idea to store:

```
[Director says: "We need a new app"]
        │
        ▼
┌─── graphs/06-ideate.json ───┐
│  trend-hunter → creativo    │
│  → dario → innovatore       │
│  → synthesizer              │
└─── Ranked concepts ─────────┘
        │ (Director picks #1)
        ▼
┌─── graphs/07-innovation-sprint.json ───┐
│  creativo deep-dive → dario game-design │
│  → innovatore feasibility → aurelio PRD │
│  → synthesizer                          │
└─── Proto-PRD ──────────────────────────┘
        │ (Director approves)
        ▼
┌─── graphs/01-discovery.json ───┐
│  market-scan → PRD → UX → Fin │
│  → synthesizer                 │
└─── Go/No-Go memo ──────────────┘
        │ (GO)
        ▼
┌─── graphs/02-build.json ───┐
│  fabio implements → greta QA │
│  → reviewer → enzo release   │
│  → gate                      │
└─── Built + tested ───────────┘
        │
        ▼
┌─── graphs/03-release.json ─┐
│  greta validate → leo      │
│  privacy → carla storefront│
│  → enzo verdict            │
└─── GO/NO-GO release ───────┘
        │
        ▼
  [Ship to Google Play / App Store]
```

---

## 📖 Further Reading

- **pi-multiagent skill**: `~/.pi/agent/npm/node_modules/pi-multiagent/skills/pi-multiagent/SKILL.md`
- **Graph cookbook**: `/tmp/opencode/package/references/graph-cookbook.md`
- **Agent file format**: See any `.pi/agents/*.md` for frontmatter structure
- **Graph format**: See any `graphs/*.json` for step/authority/limits structure
