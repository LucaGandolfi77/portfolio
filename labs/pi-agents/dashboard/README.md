# Faro Studio — Agent Dashboard (Hermes-desktop-style GUI)

Visual, desktop-app-style dashboard for the Faro Studio multi-agent pipeline.
Dark, three-panel layout (catalog rail · main view · detail inspector), vanilla
HTML/CSS/JS — no build step, no dependencies, works offline.

## Open it

Served (recommended — live data):

```bash
cd /workspaces/portfolio          # or wherever this repo lives
python3 -m http.server 8000
# then open http://localhost:8000/pi-agents/dashboard/
```

From `file://` (offline): open `dashboard/index.html` directly. Browsers block
`fetch()` on local files, so the page automatically falls back to the bundled
snapshot in `data/snapshot.js` and shows an amber `● bundled snapshot` badge.

## Where the data comes from

| Badge | Data |
|---|---|
| `● live tracker data` (green) | `../tracker/index.json` fetched over HTTP |
| `● bundled snapshot` (amber) | `dashboard/data/snapshot.js` (file:// fallback) |

`tracker/index.json` and `data/snapshot.js` are **generated** by
`../bin/tracker.py build` from the records in `../tracker/` — do not edit them
by hand. See [`../tracker/README.md`](../tracker/README.md) for the record
schema and the post-run workflow.

## Views

- **Overview** — KPI row, pipeline funnel by stage, model-telemetry summary and
  a Hermes-style recent-activity feed.
- **Projects** — pipeline board: one card per product with stage rail
  (ideate → sprint → discovery → build → release → live), status badge,
  blocker and next step. Click a card for the full record + run history.
- **Runs** — every `agent_team` graph run, newest first: graph, duration,
  status, step health bar and verdict.
- **Models** — LLM telemetry per model: runs, step outcomes, reliability by
  step type (e.g. RPC-failure rate on `market-scan`). Runs recorded before the
  tracker existed show as `unrecorded` with a hint to start attributing.
- **Agents** — the studio team and packaged labor with live step statistics,
  success rate, last seen and the models each agent ran on.
- **Timeline** — GANTT of runs on a shared clock plus the per-step event log.

Right-hand inspector shows details for whatever is selected; badges, buttons
and rows deep-link between views (e.g. Run → Project).

## Rebuild after new runs

```bash
cd /workspaces/portfolio/pi-agents
python3 bin/tracker.py build     # refresh index.json, TRACEABILITY.md, snapshot.js
python3 bin/tracker.py check     # validate tracker records (no writes)
```
