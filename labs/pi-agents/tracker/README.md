# Faro Studio — Tracker (projects · runs · models)

Structured telemetry for the Faro Studio multi-agent pipeline. One source of
truth that feeds `TRACEABILITY.md` and the **dashboard** (`../dashboard/`).

```
pi-agents/
├── bin/tracker.py          # aggregate + generate (stdlib only)
├── tracker/
│   ├── README.md           # this file
│   ├── agents.json         # static catalog of the 24 studio + packaged agents
│   ├── index.json          # GENERATED aggregate consumed by the dashboard
│   ├── projects/<slug>.json   # one status file per product under management
│   └── runs/<runId>.json      # one record per agent_team graph run
└── dashboard/              # Hermes-desktop-style visual GUI (reads index.json)
```

## Why

The studio previously tracked progress by hand-editing `TRACEABILITY.md`.
That file drifted, produced inconsistent verdicts (e.g. the r9 synthesis memo
for the wrong product) and recorded **no model telemetry**. This tracker makes
the Director append a machine-readable record after *every* run, captures which
agent + which LLM did which step and with what outcome, and regenerates every
human-readable view from one place.

## Iron rule (Director)

> **After every `agent_team start` run that reaches a terminal state, the
> Director appends one record to `tracker/runs/` and refreshes the product's
> status in `tracker/projects/`, then runs `bin/tracker.py build`.**

Never hand-edit `TRACEABILITY.md` or `tracker/index.json` — `build` overwrites
both.

## Record format — `tracker/runs/<runId>.json`

Run id convention: `r<number>-<slug>` (e.g. `r10-mindful-break`). Create from
the template:

```bash
python3 bin/tracker.py template \
  --run-id r10-mindful-break \
  --graph graphs/03-release.json \
  --project mindful-break
```

```jsonc
{
  "schema": 1,
  "id": "r10-mindful-break",
  "graph": "graphs/03-release.json",
  "project": "mindful-break",          // primary slug
  "startedAt": "2026-09-09T12:00:00Z", // ISO-8601 UTC (or local; normalized)
  "finishedAt": "2026-09-09T12:40:00Z",
  "status": "partial",                 // running|complete|partial|failed|blocked
  "model": null,                       // optional default LLM for the whole run
  "outcome": "GO-WITH-CONDITIONS",     // memo verdict when one exists
  "summary": "One line for the leader: what happened and what it means.",
  "steps": [
    {
      "id": "qa-validate",             // step id from the graph file
      "agent": "package:validator",    // project:<name> or package:<name>
      "status": "complete",            // complete|failed|blocked|running|skipped
      "model": "deepseek-v4-flash",    // the LLM that actually ran this step
      "startedAt": null,
      "finishedAt": "2026-09-09T12:31:00Z",
      "artifact": "qa-proof-final.md",
      "note": "lint 0, manifest OK"
    }
  ]
}
```

Notes
- `model` is per step when the Director can see which LLM executed the child
  (e.g. from `run_status` / `step_result` metadata or the child's own report).
  When a step omits it, the run-level `model` applies; when both are empty the
  step is bucketed as `unrecorded` so aggregates stay honest.
- Status vocabulary is fixed (`complete|failed|blocked|running|skipped`) — the
  dashboard color-codes exactly those.

## Status file — `tracker/projects/<slug>.json`

```jsonc
{
  "schema": 1,
  "slug": "mindful-break",
  "name": "Mindful Break",
  "emoji": "🧘",
  "category": "Wellness widget / PWA",
  "brief": "products/mindful-break/BRIEF.md",
  "source": "deploy/mindful-break/",
  "stage": "release",        // ideate|sprint|discovery|build|release|live
  "status": "partial",       // idle|ok|partial|blocked|live
  "statusNote": "r9 evidence incomplete — wrong-product synthesis",
  "blocker": "Final synthesis produced for WikiThriving (r9)",
  "nextStep": "Re-run graphs/03-release.json final-synthesis",
  "updatedAt": "2026-09-09T10:00:00Z"
}
```

`stage` is the pipeline phase the product is *currently in*; `status` is the
health of that phase. The Dashboard derives pipeline position, latest run and
activity history automatically from `runs/`.

## Generate

```bash
cd /workspaces/portfolio/pi-agents
python3 bin/tracker.py check     # validate records (no writes)
python3 bin/tracker.py build     # -> tracker/index.json
                                 #    TRACEABILITY.md
                                 #    dashboard/data/snapshot.js
```

`index.json` is the single aggregate file the dashboard fetches. The snapshot is
an embedded copy used when `dashboard/index.html` is opened from `file://`
(browsers block `fetch()` of local files).

## Model telemetry ("l'andamento dei modelli")

The **Models** tab of the dashboard and the `models` section of `index.json`
answer: which LLMs are doing the studio's work, per step-type success/failure
(e.g. `market-scan` RPC failures under a specific model), spread across agents,
and trend over time. Recording the `model` field after each run is what turns
TRACEABILITY's anecdotal *"Subagent RPC ended with stopReason length"* notes into
a queryable failure-rate signal per model and per step type.
