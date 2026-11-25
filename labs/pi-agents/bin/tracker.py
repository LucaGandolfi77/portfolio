#!/usr/bin/env python3
"""
FARO STUDIO — Tracker builder.

Single source of truth for project / run / model telemetry under tracker/.
Every graph run produces one record file: tracker/runs/<runId>.json.
Every product under management has one status file: tracker/projects/<slug>.json.

Commands
--------
  build        (default) aggregate tracker/ -> tracker/index.json,
               TRACEABILITY.md and dashboard/data/snapshot.js
  check        validate all records without writing outputs
  template     print the JSON skeleton for a new run record

Run from anywhere; the studio root is auto-detected (parent of bin/).

Data flow:
  Director finishes a graph run -> writes tracker/runs/<runId>.json
  -> updates tracker/projects/<slug>.json stage/status/blocker
  -> runs `bin/tracker.py build`
  -> dashboard (pi-agents/dashboard/) renders tracker/index.json live,
     or falls back to the snapshot bundled in dashboard/data/snapshot.js.
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import sys
from pathlib import Path

SCHEMA = 1
STAGES = ["ideate", "sprint", "discovery", "build", "release", "live"]
STAGE_EMOJI = {"ideate": "💡", "sprint": "🚀", "discovery": "🔎",
               "build": "🛠️", "release": "🧪", "live": "🟢"}
RUN_STATUS_RANK = {"running": 0, "complete": 1, "partial": 2,
                   "blocked": 3, "failed": 4, "unknown": 5}
STEP_OK = {"complete"}
STEP_BAD = {"failed", "blocked"}

ROOT = Path(__file__).resolve().parent.parent
TRACKER = ROOT / "tracker"
RUNS_DIR = TRACKER / "runs"
PROJECTS_DIR = TRACKER / "projects"
GRAPHS_DIR = ROOT / "graphs"
INDEX_PATH = TRACKER / "index.json"
TRACE_PATH = ROOT / "TRACEABILITY.md"
SNAPSHOT_DIR = ROOT / "dashboard" / "data"
SNAPSHOT_PATH = SNAPSHOT_DIR / "snapshot.js"

NOW = _dt.datetime.now(_dt.timezone.utc).replace(microsecond=0)


def iso(ts: str | None) -> str | None:
    """Normalize a timestamp to ISO-8601 UTC ('Z'), pass None through."""
    if not ts:
        return None
    ts = str(ts).strip()
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    try:
        dt = _dt.datetime.fromisoformat(ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=_dt.timezone.utc)
        return dt.astimezone(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        return ts  # keep as-is; validation will flag it


def fmt_clock(ts: str | None) -> str:
    if not ts:
        return "—"
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})", ts)
    return f"{m.group(3)}/{m.group(2)} {m.group(4)}:{m.group(5)}" if m else ts


# ---------------------------------------------------------------- validation

def validate_run(run: dict, problems: list[str], fname: str) -> None:
    tag = f"runs/{fname}"
    if not isinstance(run, dict):
        problems.append(f"{tag}: record must be a JSON object")
        return
    if not run.get("id"):
        problems.append(f"{tag}: missing 'id'")
    run["project"] = run.get("project") or None
    projects = run.get("projects") or ([run["project"]] if run["project"] else [])
    run["projects"] = sorted({p for p in projects if p})
    if run["project"] is None and run["projects"]:
        run["project"] = run["projects"][0]
    if not run.get("graph"):
        problems.append(f"{tag}: missing 'graph'")
    run["startedAt"] = iso(run.get("startedAt"))
    run["finishedAt"] = iso(run.get("finishedAt"))
    run["model"] = run.get("model") or None
    steps = run.get("steps")
    if not isinstance(steps, list) or not steps:
        problems.append(f"{tag}: missing non-empty 'steps' list")
        run["steps"] = []
    for i, st in enumerate(run["steps"]):
        if not isinstance(st, dict) or not st.get("id"):
            problems.append(f"{tag}: step[{i}] missing 'id'")
            continue
        st.setdefault("agent", "unknown")
        st.setdefault("status", "unknown")
        st["model"] = st.get("model") or None
        st["startedAt"] = iso(st.get("startedAt"))
        st["finishedAt"] = iso(st.get("finishedAt"))
        st.setdefault("artifact", None)
        st.setdefault("note", None)
    run.setdefault("summary", None)
    run.setdefault("status", None)
    run.setdefault("outcome", None)  # optional memo-level verdict


def validate_project(pr: dict, problems: list[str], fname: str) -> None:
    tag = f"projects/{fname}"
    if not isinstance(pr, dict) or not pr.get("slug"):
        problems.append(f"{tag}: missing 'slug'")
        return
    if pr.get("stage") not in STAGES:
        problems.append(f"{tag}: stage must be one of {STAGES}")
    pr["updatedAt"] = iso(pr.get("updatedAt"))


def load_json(path: Path, problems: list[str], required=True):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        if required:
            problems.append(f"missing file: {path.relative_to(ROOT)}")
        return None
    except json.JSONDecodeError as exc:
        problems.append(f"invalid JSON in {path.relative_to(ROOT)}: {exc}")
        return None


# ------------------------------------------------------------------ loading

def load_runs(problems):
    runs = []
    if RUNS_DIR.is_dir():
        for path in sorted(RUNS_DIR.glob("*.json")):
            if path.name.startswith("_"):
                continue
            data = load_json(path, problems)
            if data is None:
                continue
            validate_run(data, problems, path.name)
            runs.append(data)
    return runs


def load_projects(problems):
    projects = []
    if PROJECTS_DIR.is_dir():
        for path in sorted(PROJECTS_DIR.glob("*.json")):
            data = load_json(path, problems)
            if data is None:
                continue
            validate_project(data, problems, path.name)
            projects.append(data)
    return projects


def load_agents():
    path = TRACKER / "agents.json"
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh).get("agents", [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def load_playbooks():
    out = []
    if GRAPHS_DIR.is_dir():
        for path in sorted(GRAPHS_DIR.glob("*.json")):
            try:
                with open(path, encoding="utf-8") as fh:
                    g = json.load(fh)
            except (OSError, json.JSONDecodeError):
                continue
            steps = [
                {"id": s.get("id"), "agent": (s.get("agent") or {}).get("ref")}
                for s in g.get("steps", []) if s.get("id")
            ]
            out.append({
                "file": path.name,
                "label": path.stem,
                "objective": (g.get("objective") or "").split("—")[-1].strip(),
                "steps": steps,
            })
    return out


# -------------------------------------------------------------- aggregation

def empty_counts():
    return {"total": 0, "complete": 0, "failed": 0, "blocked": 0,
            "running": 0, "skipped": 0, "unknown": 0}


def bump(counts: dict, status: str) -> None:
    counts["total"] += 1
    key = status if status in counts else "unknown"
    counts[key] += 1


def run_step_counts(run: dict) -> dict:
    counts = empty_counts()
    for st in run.get("steps", []):
        bump(counts, st.get("status", "unknown"))
    return counts


def summarize_run(run: dict) -> dict:
    counts = run_step_counts(run)
    done = counts["complete"] + counts["skipped"]
    total = counts["total"]
    return {
        "id": run["id"], "graph": run.get("graph"), "project": run.get("project"),
        "projects": run.get("projects", []),
        "status": run.get("status") or ("complete" if total and done == total else
                                        "failed" if total == counts["failed"] else "partial"),
        "startedAt": run.get("startedAt"), "finishedAt": run.get("finishedAt"),
        "model": run.get("model"), "steps": counts, "summary": run.get("summary"),
        "outcome": run.get("outcome"),
    }


def aggregate(runs, projects, problems) -> dict:
    catalog = {a["ref"]: a for a in load_agents()}
    playbooks = load_playbooks()
    by_slug = {p["slug"]: p for p in projects}

    agent_stats: dict[str, dict] = {}
    model_stats: dict[str, dict] = {}
    project_runs: dict[str, list] = {slug: [] for slug in by_slug}

    def agent_bucket(ref: str) -> dict:
        ref = ref or "unknown"
        if ref not in agent_stats:
            agent_stats[ref] = {"ref": ref, "steps": empty_counts(), "runIds": set(),
                                "lastSeen": None, "models": {}}
        return agent_stats[ref]

    def model_bucket(model: str | None) -> dict:
        key = model or "unrecorded"
        if key not in model_stats:
            model_stats[key] = {"model": key, "runIds": set(), "steps": empty_counts(),
                                "lastSeen": None, "agents": {}, "stepTypes": {}}
        return model_stats[key]

    for run in runs:
        run_meta = summarize_run(run)
        if run["project"] not in by_slug:
            problems.append(
                f"run {run['id']}: project '{run['project']}' has no "
                f"tracker/projects/{run['project']}.json")
            continue
        # per-run model default
        run_model = run.get("model") or "unrecorded"
        for slug in run.get("projects") or [run["project"]]:
            if slug in project_runs:
                project_runs[slug].append(run_meta)
        for st in run.get("steps", []):
            ref = st.get("agent") or "unknown"
            ab = agent_bucket(ref)
            bump(ab["steps"], st.get("status", "unknown"))
            ab["runIds"].add(run["id"])
            m = st.get("model") or run_model
            ab["models"][m] = ab["models"].get(m, 0) + 1
            if run.get("finishedAt") and (ab["lastSeen"] is None
                                          or run["finishedAt"] > ab["lastSeen"]):
                ab["lastSeen"] = run["finishedAt"]
            mb = model_bucket(m)
            bump(mb["steps"], st.get("status", "unknown"))
            mb["runIds"].add(run["id"])
            mb["agents"][ref] = mb["agents"].get(ref, 0) + 1
            step_type = mb["stepTypes"].setdefault(st["id"], empty_counts())
            bump(step_type, st.get("status", "unknown"))
            if run.get("finishedAt") and (mb["lastSeen"] is None
                                          or run["finishedAt"] > mb["lastSeen"]):
                mb["lastSeen"] = run["finishedAt"]

    # models with no step attribution still show via the "unrecorded" bucket
    # projects enriched with runs + funnel
    funnel = {s: [] for s in STAGES}
    enriched = []
    for pr in projects:
        slug = pr["slug"]
        pr_runs = project_runs.get(slug, [])
        pr_runs.sort(key=lambda r: (r.get("finishedAt") or r.get("startedAt") or ""))
        stage = pr.get("stage", "ideate")
        funnel[stage].append(slug)
        enriched.append({
            **pr,
            "stageIndex": STAGES.index(stage) if stage in STAGES else 0,
            "runs": pr_runs,
            "latestRun": pr_runs[-1] if pr_runs else None,
            "runCount": len(pr_runs),
        })

    agents_out = []
    for ref, stats in agent_stats.items():
        cat = catalog.get(ref, {})
        agents_out.append({
            "ref": ref,
            "name": cat.get("name") or ref.split(":")[-1].replace("-", " ").title(),
            "kind": cat.get("kind") or ("project" if ref.startswith("project:") else
                                        "package" if ref.startswith("package:") else "other"),
            "role": cat.get("role") or "",
            "emoji": cat.get("emoji") or "🤖",
            "tools": cat.get("tools", []),
            "steps": stats["steps"],
            "runs": len(stats["runIds"]),
            "lastSeen": stats["lastSeen"],
            "models": stats["models"],
        })
    agents_out.sort(key=lambda a: (-a["steps"]["total"], a["ref"]))

    models_out = []
    for model, stats in sorted(model_stats.items(),
                               key=lambda kv: (-kv[1]["steps"]["total"], kv[0])):
        models_out.append({
            "model": model,
            "runs": len(stats["runIds"]),
            "steps": stats["steps"],
            "lastSeen": stats["lastSeen"],
            "agents": dict(sorted(stats["agents"].items(),
                                  key=lambda kv: -kv[1])),
            "stepTypes": stats["stepTypes"],
        })

    total_counts = empty_counts()
    for run in runs:
        for st in run.get("steps", []):
            bump(total_counts, st.get("status", "unknown"))

    timeline = []
    for run in sorted(runs, key=lambda r: (r.get("startedAt") or r.get("finishedAt") or "")):
        events = [{"kind": "start", "at": run.get("startedAt"), "label": "graph started"}]
        for st in run.get("steps", []):
            events.append({
                "kind": "step", "step": st.get("id"),
                "status": st.get("status", "unknown"),
                "agent": st.get("agent"), "model": st.get("model") or run.get("model"),
                "at": st.get("finishedAt") or st.get("startedAt"),
                "artifact": st.get("artifact"), "note": st.get("note"),
            })
        timeline.append({
            "runId": run["id"], "project": run["project"],
            "graph": run.get("graph"), "status": summarize_run(run)["status"],
            "startedAt": run.get("startedAt"), "finishedAt": run.get("finishedAt"),
            "summary": run.get("summary"), "events": events,
        })

    run_out = sorted(runs, key=lambda r: (r.get("startedAt") or r.get("finishedAt") or ""))
    return {
        "schema": SCHEMA,
        "generatedAt": NOW.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "counts": {
            "projects": len(enriched),
            "runs": len(run_out),
            "agentsSeen": len(agents_out),
            "modelsSeen": len(models_out),
            "steps": total_counts,
            "live": len(funnel["live"]),
            "inFlight": sum(len(funnel[s]) for s in ("ideate", "sprint",
                                                     "discovery", "build", "release")),
        },
        "projects": enriched,
        "runs": run_out,
        "agents": agents_out,
        "models": models_out,
        "playbooks": playbooks,
        "funnel": [{"stage": s, "emoji": STAGE_EMOJI[s], "projects": funnel[s]}
                   for s in STAGES],
        "timeline": timeline,
        "warnings": problems,
    }


# ------------------------------------------------------------------- outputs

def write_json(data: dict) -> None:
    INDEX_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n",
                          encoding="utf-8")
    print(f"✔ wrote {INDEX_PATH.relative_to(ROOT)}")


def write_snapshot(data: dict) -> None:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(data, ensure_ascii=False)
    SNAPSHOT_PATH.write_text(
        "// Auto-generated by bin/tracker.py build — do not edit.\n"
        "// Fallback dataset for opening dashboard/index.html from file://.\n"
        f"window.PI_TRACKER_SNAPSHOT = {payload};\n",
        encoding="utf-8")
    print(f"✔ wrote {SNAPSHOT_PATH.relative_to(ROOT)}")


def write_traceability(data: dict) -> None:
    lines = [
        "# FARO STUDIO — Project Traceability",
        "",
        "> ⚠️ **Auto-generated file.** Do not edit by hand — edits are overwritten "
        "on the next `bin/tracker.py build`. Edit the source records under "
        "`tracker/runs/` and `tracker/projects/`, then rebuild.",
        "",
        f"*Generated {data['generatedAt']} · {data['counts']['projects']} projects · "
        f"{data['counts']['runs']} runs · {data['counts']['modelsSeen']} model(s) seen.*",
        "",
        "## Master status table",
        "",
        "| Project | Pipeline stage | Runs | Latest run | Status | Blocker / next step |",
        "|---|---|---|---|---|---|",
    ]
    for pr in data["projects"]:
        stage = pr.get("stage", "?")
        status = pr.get("status", "idle")
        badge = {"ok": "✅", "partial": "⚠️", "blocked": "⛔", "live": "🟢",
                 "idle": "⏸️"}.get(status, "—")
        latest = pr.get("latestRun") or {}
        lines.append(
            f"| `{pr['slug']}` | {STAGE_EMOJI.get(stage,'')} {stage} | "
            f"{pr.get('runCount', 0)} | "
            f"{latest.get('id') or '—'} ({latest.get('status') or '—'}) | "
            f"{badge} {status} | {pr.get('blocker') or pr.get('nextStep') or '—'} |")
    lines += [
        "",
        "## Runs",
        "",
        "| Run | Project(s) | Graph | Start | End | Status | Steps (ok/fail/blk) | Verdict |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for run in data["runs"]:
        c = run_step_counts(run)
        status = summarize_run(run)["status"]
        verdict = run.get("outcome") or run.get("summary") or ""
        verdict = (verdict[:70] + "…") if len(verdict) > 72 else verdict
        lines.append(
            f"| {run['id']} | {', '.join(run.get('projects') or [run.get('project') or '—'])} | "
            f"{Path(run.get('graph','')).name} | {fmt_clock(run.get('startedAt'))} | "
            f"{fmt_clock(run.get('finishedAt'))} | {status} | "
            f"{c['complete']}/{c['failed']}/{c['blocked']} | {verdict} |")
    lines += ["", "## Timeline (start → terminal per run)", "", "```"]
    for tl in data["timeline"]:
        clock = fmt_clock(tl.get("startedAt"))
        lines.append(
            f"{clock}  {tl['runId']} [{tl['graph'].split('/')[-1] if tl.get('graph') else ''}] "
            f"({tl['project']}) — {tl['status']}"
            f"{(' · ' + tl['summary']) if tl.get('summary') else ''}")
    lines += ["```", "", "## Per-step events", ""]
    for tl in data["timeline"]:
        lines.append(f"### {tl['runId']} — {tl['project']}")
        if not tl["events"]:
            lines.append("- (no step events recorded)")
        for ev in tl["events"]:
            if ev["kind"] == "start":
                lines.append(f"- ▶ start {fmt_clock(ev['at'])}")
                continue
            mod = f" · model {ev['model']}" if ev.get("model") and ev["model"] != "unrecorded" else ""
            note = f" — {ev['note']}" if ev.get("note") else ""
            art = f" · artifact {ev['artifact']}" if ev.get("artifact") else ""
            lines.append(
                f"- `{ev['step']}` [{ev['status']}] via {ev['agent']}{mod}{art}"
                f"{note} {fmt_clock(ev['at'])}")
    lines += ["", "---", "",
              "*Regenerated by `bin/tracker.py build` — data source under `tracker/`.*"]
    TRACE_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"✔ wrote {TRACE_PATH.relative_to(ROOT)}")


# --------------------------------------------------------------------- cli

def cmd_template(args) -> int:
    run_id = args.get("--run-id") or "r10-<slug>"
    graph = args.get("--graph") or "graphs/01-discovery.json"
    project = args.get("--project") or "<slug>"
    now = NOW.strftime("%Y-%m-%dT%H:%M:%SZ")
    print(json.dumps({
        "schema": SCHEMA,
        "id": run_id,
        "graph": graph,
        "project": project,
        "startedAt": now,
        "finishedAt": None,
        "status": "running",      # running | complete | partial | failed | blocked
        "model": None,            # default LLM for this run when steps omit it
        "outcome": None,          # memo verdict e.g. GO / GO-WITH-CONDITIONS / NO-GO
        "summary": "One line for the leader: what happened and what it means.",
        "steps": [
            {"id": "<step-id-from-graph>", "agent": "package:<ref>",
             "status": "complete", "model": None,
             "startedAt": None, "finishedAt": None,
             "artifact": "<path-or-filename>", "note": None}
        ],
    }, indent=2, ensure_ascii=False))
    print(f"\n# save to {RUNS_DIR.relative_to(ROOT)}/{run_id}.json, "
          f"then run: bin/tracker.py build", file=sys.stderr)
    return 0


def main(argv) -> int:
    argv = argv or ["build"]
    cmd = argv[0]
    if cmd == "template":
        args: dict[str, str] = {}
        i = 1
        while i < len(argv):
            tok = argv[i]
            if tok.startswith("--") and "=" in tok:
                key, val = tok.split("=", 1)
                args[key] = val
                i += 1
            elif tok.startswith("--") and i + 1 < len(argv):
                args[tok] = argv[i + 1]
                i += 2
            else:
                i += 1
        return cmd_template(args)
    problems: list[str] = []
    runs = load_runs(problems)
    projects = load_projects(problems)
    data = aggregate(runs, projects, problems)
    if problems:
        print("⚠️ validation problems:", file=sys.stderr)
        for p in problems:
            print(f"  - {p}", file=sys.stderr)
        if cmd == "check":
            return 1
        print("  → continuing anyway (warnings are embedded in index.json)",
              file=sys.stderr)
    if cmd == "check":
        print(f"✔ ok: {len(projects)} projects, {len(runs)} runs, no fatal errors")
        return 0
    write_json(data)
    write_traceability(data)
    write_snapshot(data)
    print(f"✔ build done: {data['counts']['projects']} projects, "
          f"{data['counts']['runs']} runs, "
          f"{data['counts']['steps']['total']} step events")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
