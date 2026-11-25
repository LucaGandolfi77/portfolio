/* ============================================================
   Faro Studio — Agent Dashboard (Hermes-desktop-style UI)
   Data: ../tracker/index.json (live, fetched) or the bundled
   snapshot in data/snapshot.js (file:// fallback).
   Vanilla JS, no dependencies.
   ============================================================ */

"use strict";

/* ---------------- state ---------------- */
const D = { data: null, source: "…", view: "overview", query: "", selection: null };

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------- helpers ---------------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function clsFor(s) {
  const v = String(s || "").toLowerCase();
  if (["complete", "ok", "live", "done", "approved", "go"].includes(v)) return "ok";
  if (["failed", "fail", "invalid", "no-go", "escalate"].includes(v)) return "fail";
  if (["blocked", "not-ready", "changes-requested"].includes(v)) return "blocked";
  if (["running", "in-progress", "go-with-conditions"].includes(v)) return v === "running" ? "run" : "warn";
  if (["partial", "warn", "conditional"].includes(v)) return "warn";
  if (["idle", "skipped", "unknown", "unrecorded", "na", "n/a"].includes(v)) return v === "skipped" ? "muted" : "idle";
  return "muted";
}

const badge = (label, kind = "muted", pulse = false) =>
  `<span class="badge ${clsFor(kind)}">${pulse ? '<span class="dot"></span>' : ""}${esc(label)}</span>`;

const modelChip = (m) =>
  `<span class="model-chip ${!m || m === "unrecorded" ? "unknown" : ""}">${esc(m || "unrecorded")}</span>`;

function shortTs(ts) {
  if (!ts) return "—";
  const m = /T(\d{2}):(\d{2})/.exec(ts);
  return m ? `${m[1]}:${m[2]}` : ts.slice(5, 16).replace("T", " ");
}
function dayOf(ts) {
  if (!ts) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ts);
  return m ? `${m[3]}/${m[2]}` : "";
}
function fmtFull(ts) {
  if (!ts) return "—";
  return ts.replace("T", " ").replace("Z", " UTC");
}
function minutesBetween(a, b) {
  if (!a || !b) return null;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 60000));
}
function durationLabel(a, b) {
  const min = minutesBetween(a, b);
  if (min === null) return "—";
  if (min < 1) return "<1m";
  if (min < 60) return `${min}m`;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}
function stepSummary(c) {
  return `ok ${c.complete} · fail ${c.failed} · blk ${c.blocked}${c.running ? ` · run ${c.running}` : ""}`;
}
function countSteps(steps) {
  const c = { total: 0, complete: 0, failed: 0, blocked: 0, running: 0, skipped: 0, unknown: 0 };
  (steps || []).forEach((s) => {
    c.total += 1;
    const k = s.status && s.status in c ? s.status : "unknown";
    c[k] += 1;
  });
  return c;
}
const graphLabel = (g) => (g || "").split("/").pop().replace(".json", "");
const ratePct = (c) => (c.total ? Math.round((100 * (c.complete + c.skipped)) / c.total) : 0);

const stageColor = { ideate: "#6ea8ff", sprint: "#ffd700", discovery: "#9ecbff",
  build: "#bc8cff", release: "#ff9f43", live: "#2ea043" };

/* ---------------- data loading ---------------- */
async function loadData() {
  const badgeEl = $("#dataBadge");
  const isHttp = location.protocol.startsWith("http");
  try {
    if (isHttp) {
      const res = await fetch("../tracker/index.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      D.data = await res.json();
      D.source = "live";
      badgeEl.textContent = "● live tracker data";
      badgeEl.className = "badge ok";
    } else {
      throw new Error("file://");
    }
  } catch (err) {
    if (window.PI_TRACKER_SNAPSHOT) {
      D.data = window.PI_TRACKER_SNAPSHOT;
      D.source = "snapshot";
      badgeEl.textContent = "● bundled snapshot (file://)";
      badgeEl.className = "badge warn";
      toast("Opened from file:// — showing bundled snapshot. Serve the folder (e.g. `python3 -m http.server`) for live tracker data.");
    } else {
      $("#view").innerHTML = `<div class="notice"><strong>No data.</strong> ` +
        `Could not fetch <code>tracker/index.json</code> and no snapshot is bundled. ` +
        `Run <code>bin/tracker.py build</code>, then serve this folder over HTTP.</div>`;
      badgeEl.textContent = "no data";
      return;
    }
  }
  const d = D.data;
  $("#genAt").textContent = `updated ${shortTs(d.generatedAt)}`;
  renderAll();
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.hidden = true; }, 6000);
}

/* ---------------- sidebar mini KPIs ---------------- */
function renderKpiMini() {
  const d = D.data, c = d.counts;
  $("#kpiMini").innerHTML = `
    <div class="kpi accent"><div class="kpi-n">${c.projects}</div><div class="kpi-l">projects</div></div>
    <div class="kpi"><div class="kpi-n">${c.inFlight}</div><div class="kpi-l">in flight</div></div>
    <div class="kpi ok"><div class="kpi-n">${c.live}</div><div class="kpi-l">live</div></div>
    <div class="kpi"><div class="kpi-n">${c.runs}</div><div class="kpi-l">runs</div></div>`;
  $("#shortcuts").innerHTML = d.projects.map((p) => `
    <button class="shortcut" data-go="project:${esc(p.slug)}">
      <span class="sc-emoji">${esc(p.emoji || "📦")}</span>
      <span>${esc(p.name)}<span class="sc-detail">${esc(p.slug)} · ${esc(p.stage)}</span></span>
    </button>`).join("") ||
    `<div class="notice">No projects tracked yet.</div>`;
  $$("#shortcuts .shortcut").forEach((b) => b.addEventListener("click", () => {
    goTo(b.dataset.go);
  }));
}

/* ---------------- render dispatch ---------------- */
function renderAll() {
  if (!D.data) return;
  renderKpiMini();
  renderView();
  renderInspector();
}

function renderView() {
  const v = D.view;
  const targets = { overview: renderOverview, projects: renderProjects,
    runs: renderRuns, models: renderModels, agents: renderAgents, timeline: renderTimeline };
  (targets[v] || renderOverview)();
}

function activateTab(name) {
  D.view = name;
  $$("#tabs .tab").forEach((t) => t.classList.toggle("is-active", t.dataset.view === name));
  renderView();
  renderInspector();
}

/* ---------------- overview ---------------- */
function renderOverview() {
  const d = D.data, c = d.counts;
  const errSteps = c.steps.failed + c.steps.blocked;
  const feed = [...d.timeline].sort((a, b) =>
    (b.startedAt || b.finishedAt || "").localeCompare(a.startedAt || a.finishedAt || "")).slice(0, 8);

  const funnelWidth = (n) => (c.projects ? Math.round((100 * n) / Math.max(1, c.projects)) : 0);
  const funnel = d.funnel.map((f) => {
    if (!f.projects.length) return `<div class="funnel-empty"></div>`;
    return `<div class="funnel-seg" style="width:${funnelWidth(f.projects.length)}%;background:${stageColor[f.stage]}"
              title="${f.projects.join(", ")}">${f.projects.length}</div>`;
  }).join("");

  $("#view").innerHTML = `
    <div class="view-title"><h2>Overview <span class="vsub">— Faro Studio multi-agent pipeline at a glance</span></h2></div>
    <div class="kpis">
      <div class="kpi-big"><div class="n">${c.projects}</div><div class="l">Projects</div><div class="d">${c.inFlight} in pipeline · ${c.live} live</div></div>
      <div class="kpi-big"><div class="n">${c.runs}</div><div class="l">Graph runs</div><div class="d">${d.timeline.length ? d.timeline[0].startedAt ? "since " + dayOf(d.timeline[0].startedAt) : "" : ""}</div></div>
      <div class="kpi-big"><div class="n">${c.steps.total}</div><div class="l">Step events</div><div class="d">${c.steps.complete} ok · ${errSteps} failed/blocked</div></div>
      <div class="kpi-big"><div class="n">${c.agentsSeen}</div><div class="l">Agents active</div><div class="d">distinct refs seen in runs</div></div>
      <div class="kpi-big"><div class="n">${c.modelsSeen}</div><div class="l">Models seen</div><div class="d">per-step telemetry</div></div>
    </div>
    <div class="grid-2">
      <div>
        <div class="panel">
          <div class="panel-head"><h3>Pipeline funnel</h3><span class="sub">projects by current stage</span></div>
          <div class="panel-body">
            <div class="funnel">
              ${d.funnel.map((f) => `<div class="funnel-row">
                <div class="funnel-stage"><span>${esc(f.emoji)}</span> ${esc(f.stage)}</div>
                <div class="funnel-track">${f.projects.length ? `<div class="funnel-seg" style="width:${funnelWidth(f.projects.length)}%;background:${stageColor[f.stage]}" title="${f.projects.join(", ")}">${f.projects.length}</div>` : ""}</div>
              </div>`).join("")}
            </div>
          </div>
        </div>
        <div class="panel mt16">
          <div class="panel-head"><h3>Model telemetry</h3><span class="sub">which LLM runs studio steps</span></div>
          <div class="panel-body">
            ${d.models.length === 0 ? `<div class="notice">No step records yet.</div>` : d.models.map((m) => {
              const ok = m.steps.complete + m.steps.skipped;
              const okp = m.steps.total ? (100 * ok / m.steps.total) : 0;
              return `<div class="mb12">
                <div class="flex wrap mb12">
                  ${modelChip(m.model)}
                  <span class="muted small">${m.runs} runs · ${m.steps.total} steps</span>
                  <span class="grow"></span>
                  <button class="badge muted" data-go="model:${esc(m.model)}">details →</button>
                </div>
                <div class="bar-track"><div class="bar-fill ok" style="width:${okp}%"></div></div>
                <div class="progress-label"><span>ok ${ok}/${m.steps.total}</span>
                  <span>fail ${m.steps.failed} · blocked ${m.steps.blocked}</span></div>
              </div>`;
            }).join("")}
            ${(d.models.length === 1 && d.models[0].model === "unrecorded") ?
              `<div class="notice mt16"><strong>Tip:</strong> all ${d.models[0].steps.total} historical steps are bucketed as
              <code>unrecorded</code> — no model was captured before the tracker existed.
              Record the <code>model</code> field per step from the next run onward
              (see <code>tracker/README.md</code>) to make failure-rate-per-model visible here.</div>` : ""}
          </div>
        </div>
      </div>
      <div>
        <div class="panel">
          <div class="panel-head"><h3>Recent activity</h3><span class="sub">latest run events, newest first</span></div>
          <div class="panel-body feed">
            ${feed.map((tl) => {
              const c2 = countSteps((D.data.runs.find((r) => r.id === tl.runId) || {}).steps);
              return `<div class="feed-item">
                <div class="feed-time">${shortTs(tl.startedAt)}<br>${dayOf(tl.startedAt)}</div>
                <div class="feed-line">
                  <div class="flex wrap">
                    <b>${esc(tl.project)}</b>
                    ${badge(graphLabel(tl.graph), tl.status === "complete" ? "ok" : tl.status)}
                    <span class="mono small faint">${esc(tl.runId)}</span>
                  </div>
                  <div class="mt8 muted small">${stepSummary(c2)} — ${esc(tl.summary || "")}</div>
                  <button class="badge muted mt8" data-go="run:${esc(tl.runId)}">inspect run →</button>
                </div>
              </div>`;
            }).join("") || `<div class="notice">No runs recorded yet.</div>`}
          </div>
        </div>
      </div>
    </div>`;
  bindGoButtons();
}

/* ---------------- projects ---------------- */
function renderProjects() {
  const q = D.query.toLowerCase();
  const list = D.data.projects.filter((p) =>
    !q || [p.slug, p.name, p.statusNote, p.blocker, p.nextStep, p.stage].join(" ").toLowerCase().includes(q));

  $("#view").innerHTML = `
    <div class="view-title">
      <h2>Projects <span class="vsub">— ${D.data.projects.length} under management</span></h2>
      <input class="search" id="searchBox" placeholder="filter projects…" value="${esc(D.query)}">
    </div>
    <div class="cards">
      ${list.map(projectCard).join("") || `<div class="notice">No projects match “${esc(D.query)}”.</div>`}
    </div>`;
  bindSearch();
  $$("#view .card").forEach((card) => card.addEventListener("click", () => {
    D.selection = "project:" + card.dataset.slug;
    renderProjects();
    renderInspector();
  }));
}

function projectCard(p) {
  const idx = p.stageIndex ?? D.data.funnel.findIndex((f) => f.stage === p.stage);
  const sel = D.selection === "project:" + p.slug;
  const isLive = p.stage === "live";
  const railColor = (i) => {
    if (isLive && i >= idx) return "done";
    if (i < idx) return "done";
    if (i === idx && (p.status === "blocked" || p.status === "partial")) return "warn";
    return "on";
  };
  const latest = p.latestRun || {};
  return `
  <div class="card ${sel ? "is-selected" : ""}" data-slug="${esc(p.slug)}">
    <div class="card-top">
      <span class="card-emoji">${esc(p.emoji || "📦")}</span>
      <div class="grow">
        <div class="card-name">${esc(p.name)}</div>
        <div class="card-slug">${esc(p.slug)}</div>
      </div>
      ${badge(p.status, p.status)}
    </div>
    <div class="stage-rail">${D.data.funnel.map((f, i) =>
      `<div class="rail ${i <= idx ? railColor(i) : ""}" title="${esc(f.stage)}"></div>`).join("")}</div>
    <div class="stage-label">${esc(p.stage)}${idx < 5 ? " · next: " + esc(D.data.funnel[idx + 1].stage) : " · shipped"}</div>
    <div class="card-note mt8">${esc(p.statusNote || "")}</div>
    ${p.blocker ? `<div class="mt8 small"><span class="badge blocked">blocker</span> <span class="muted">${esc(p.blocker)}</span></div>` : ""}
    <div class="card-foot">
      <span class="latest">↳ ${esc(latest.id || "no runs yet")}${latest.status ? " · " + latest.status : ""}</span>
      ${p.nextStep ? `<span class="small muted">${esc(p.nextStep)}</span>` : ""}
    </div>
  </div>`;
}

/* ---------------- runs ---------------- */
function renderRuns() {
  const q = D.query.toLowerCase();
  const runs = [...D.data.runs].reverse().filter((r) =>
    !q || [r.id, r.project, r.graph, r.summary, r.outcome].join(" ").toLowerCase().includes(q));
  $("#view").innerHTML = `
    <div class="view-title">
      <h2>Runs <span class="vsub">— every agent_team graph execution, newest first</span></h2>
      <div class="flex wrap">
        <div class="status-legend">
          ${badge("ok", "ok")} ${badge("partial", "partial")} ${badge("failed", "failed")}
          ${badge("blocked", "blocked")} ${badge("running", "running", true)}
        </div>
        <input class="search" id="searchBox" placeholder="filter runs…" value="${esc(D.query)}">
      </div>
    </div>
    <div class="panel"><div class="panel-body" style="padding:0">
      <table class="table">
        <thead><tr><th>Run</th><th>Project</th><th>Graph</th><th>Start</th><th>Dur.</th><th>Status</th><th>Steps</th><th>Verdict</th></tr></thead>
        <tbody>
          ${runs.map((r) => {
            const c = countSteps(r.steps);
            const sel = D.selection === "run:" + r.id;
            const okp = c.total ? (100 * (c.complete + c.skipped) / c.total) : 0;
            return `<tr class="${sel ? "is-selected" : ""}" data-go="run:${esc(r.id)}">
              <td class="mono">${esc(r.id)}</td>
              <td>${esc(r.project)}</td>
              <td class="mono small">${esc(graphLabel(r.graph))}</td>
              <td class="mono small muted">${shortTs(r.startedAt)} ${dayOf(r.startedAt)}</td>
              <td class="mono small">${durationLabel(r.startedAt, r.finishedAt)}</td>
              <td>${badge(r.status, r.status)}</td>
              <td style="min-width:150px">
                <div class="bar-track"><div class="bar-fill ok" style="width:${okp}%"></div></div>
                <div class="progress-label">${stepSummary(c)}</div>
              </td>
              <td class="small muted">${esc((r.outcome || r.summary || "").slice(0, 64))}</td>
            </tr>`;
          }).join("") || `<tr><td colspan="8"><div class="notice">No runs recorded yet.</div></td></tr>`}
        </tbody>
      </table>
    </div></div>`;
  bindSearch();
  bindGoButtons();
}

/* ---------------- models ---------------- */
function renderModels() {
  const q = D.query.toLowerCase();
  const list = D.data.models.filter((m) => !q || m.model.toLowerCase().includes(q));
  const unrec = D.data.models.filter((m) => m.model === "unrecorded")[0];
  $("#view").innerHTML = `
    <div class="view-title">
      <h2>Models <span class="vsub">— LLM telemetry across runs & step types</span></h2>
      <div class="flex wrap">
        <div class="status-legend">${badge("ok", "ok")} ${badge("failed", "failed")} ${badge("blocked", "blocked")}</div>
        <input class="search" id="searchBox" placeholder="filter models…" value="${esc(D.query)}">
      </div>
    </div>
    ${unrec && list.includes(unrec) ? `
    <div class="notice mb12"><strong>Historical gap:</strong> ${unrec.steps.total} step events (${unrec.runs} runs) predate model
      capture and are bucketed as <code>unrecorded</code>. Start recording the <code>model</code> field per step in
      <code>tracker/runs/*.json</code> (see <code>tracker/README.md</code>) to populate this view with real per-model data.</div>` : ""}
    <div class="matrix">
      ${list.map((m) => {
        const ok = m.steps.complete + m.steps.skipped;
        const okp = m.steps.total ? (100 * ok / m.steps.total) : 0;
        const sel = D.selection === "model:" + m.model;
        const types = Object.entries(m.stepTypes).sort((a, b) => b[1].total - a[1].total);
        return `<div class="matrix-cell ${sel ? "is-selected" : ""}" data-go="model:${esc(m.model)}" style="cursor:pointer">
          <div class="mc-title">${modelChip(m.model)}<span>${m.steps.total} steps</span></div>
          <div class="bar-track"><div class="bar-fill ok" style="width:${okp}%"></div></div>
          <div class="progress-label"><span>ok ${ok}</span><span>fail ${m.steps.failed} · blocked ${m.steps.blocked}</span></div>
          <div class="bars-mini mt12">
            ${types.slice(0, 4).map(([t, c2]) => miniBar(t, c2)).join("")}
          </div>
          <div class="mt8 small muted">${m.runs} runs · last ${shortTs(m.lastSeen)}</div>
        </div>`;
      }).join("") || `<div class="notice">No model records yet.</div>`}
    </div>`;
  bindGoButtons();
}

function miniBar(label, c2) {
  const tot = Math.max(1, c2.total);
  const okw = 100 * (c2.complete + c2.skipped) / tot;
  const failw = 100 * c2.failed / tot;
  return `<div class="bm">
    <span class="lbl mono" title="${esc(label)}">${esc(label).slice(0, 16)}</span>
    <span class="tr"><span class="fl" style="display:block;width:${okw}%;background:var(--ok)"></span></span>
    <span class="cnt">${c2.total}</span>
  </div>`;
}

/* ---------------- agents ---------------- */
function renderAgents() {
  const q = D.query.toLowerCase();
  const list = D.data.agents.filter((a) =>
    !q || [a.name, a.ref, a.role].join(" ").toLowerCase().includes(q));
  const group = (kind) => list.filter((a) => a.kind === kind);
  const section = (kind, title) => {
    const items = group(kind);
    if (!items.length) return "";
    return `<div class="view-title mt16" style="margin-bottom:10px"><h2 style="font-size:16px">${esc(title)} <span class="vsub">${items.length}</span></h2></div>
    <div class="roster">${items.map(agentCard).join("")}</div>`;
  };
  $("#view").innerHTML = `
    <div class="view-title">
      <h2>Agents <span class="vsub">— the studio team & packaged labor, with live step stats</span></h2>
      <input class="search" id="searchBox" placeholder="filter agents…" value="${esc(D.query)}">
    </div>
    ${section("project", "Studio agents (project:)")}
    ${section("package", "Packaged labor (package:)")}
    ${section("other", "Other")}`;
  bindSearch();
  $$("#view .agent-card").forEach((c) => c.addEventListener("click", () => {
    D.selection = "agent:" + c.dataset.ref;
    renderAgents();
    renderInspector();
  }));
}

function agentCard(a) {
  const c = a.steps || { total: 0, complete: 0, failed: 0, blocked: 0, running: 0, skipped: 0 };
  const okp = c.total ? Math.round(100 * (c.complete + c.skipped) / c.total) : 0;
  const models = Object.entries(a.models || {}).sort((x, y) => y[1] - x[1]);
  return `
  <div class="agent-card" data-ref="${esc(a.ref)}">
    <div class="agent-head">
      <span class="agent-emoji">${esc(a.emoji || "🤖")}</span>
      <div class="grow">
        <div class="agent-name">${esc(a.name)}</div>
        <div class="agent-ref">${esc(a.ref)}</div>
      </div>
      ${badge(a.kind, "muted")}
    </div>
    <div class="agent-role">${esc(a.role)}</div>
    <div class="agent-tools">${(a.tools || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    <div class="flex wrap mb12">
      <span class="muted small">${c.total} steps</span>
      <span class="muted small">· ${a.runs} runs</span>
      <span class="muted small">· ok ${okp}%</span>
      <span class="grow"></span>
      <span class="small faint">last ${shortTs(a.lastSeen)}</span>
    </div>
    <div class="bar-track"><div class="bar-fill ${okp >= 90 ? "ok" : okp >= 60 ? "blocked" : "fail"}" style="width:${okp}%"></div></div>
    <div class="mt8 flex wrap">${models.slice(0, 4).map(([m, n]) => modelChip(m)).join("") || ""}</div>
  </div>`;
}

/* ---------------- timeline / gantt ---------------- */
function renderTimeline() {
  const d = D.data;
  const runs = d.runs;
  const pairs = runs.filter((r) => r.startedAt && r.finishedAt);
  let min = Infinity, max = -Infinity;
  pairs.forEach((r) => {
    min = Math.min(min, new Date(r.startedAt).getTime());
    max = Math.max(max, new Date(r.finishedAt).getTime());
  });
  const hasScale = isFinite(min) && min < max;
  const span = hasScale ? max - min : 1;
  const ticks = hasScale ? 7 : 0;
  const tickHtml = [];
  for (let i = 0; i <= ticks; i++) {
    const t = min + (span * i) / ticks;
    tickHtml.push(`<span class="tk" style="left:${(100 * i) / ticks}%">${shortTs(new Date(t).toISOString())}</span>`);
  }
  $("#view").innerHTML = `
    <div class="view-title">
      <h2>Timeline <span class="vsub">— graph runs on a shared clock (GANTT)</span></h2>
      <div class="status-legend">
        ${badge("ok", "ok")} ${badge("partial", "partial")} ${badge("failed", "failed")}
        ${badge("blocked", "blocked")} ${badge("running", "running", true)}
      </div>
    </div>
    <div class="panel"><div class="panel-body gantt-wrap">
      ${!hasScale ? `<div class="notice">No timestamped runs yet.</div>` : `
      <div class="gantt" style="height:${pairs.length * 34 + 40}px">
        <div class="gantt-axis">${tickHtml.join("")}</div>
        ${pairs.map((r) => {
          const s = new Date(r.startedAt).getTime(), e = new Date(r.finishedAt).getTime();
          const left = ((s - min) / span) * 100;
          const width = Math.max(0.8, ((e - s) / span) * 100);
          return `<div class="gantt-row">
            <div class="glabel">${esc(r.project)}<span class="mono">${esc(r.id)}</span></div>
            <div class="gantt-lane">
              <div class="gantt-bar ${esc(r.status)}" style="left:${left}%;width:${width}%;"
                   title="${esc(r.id)} · ${esc(r.status)} · ${durationLabel(r.startedAt, r.finishedAt)}"
                   data-go="run:${esc(r.id)}">${esc(graphLabel(r.graph))}</div>
            </div>
          </div>`;
        }).join("")}
      </div>`}
    </div></div>
    <div class="panel mt16"><div class="panel-head"><h3>Per-run events</h3><span class="sub">vertical log</span></div>
      <div class="panel-body">
        ${d.timeline.length === 0 ? `<div class="notice">Nothing yet.</div>` : d.timeline.map((tl) => `
          <div class="mb12">
            <div class="flex wrap mb12">
              <b>${esc(tl.runId)}</b> ${badge(tl.status, tl.status)}
              <span class="mono small muted">${esc(graphLabel(tl.graph))} · ${esc(tl.project)}</span>
              <span class="grow"></span>
              <button class="badge muted" data-go="run:${esc(tl.runId)}">inspect →</button>
            </div>
            ${tl.events.filter((e) => e.kind === "step").map((e) => `
              <div class="step-row"><div class="step-head">
                <span class="step-id">${esc(e.step)}</span> ${badge(e.status, e.status)}
                <span class="feed-ag">via ${esc(e.agent || "")}</span>
                ${e.model && e.model !== "unrecorded" ? modelChip(e.model) : ""}
                <span class="grow"></span><span class="mono small faint">${shortTs(e.at)}</span>
              </div>
              ${e.note ? `<div class="step-note">${esc(e.note)}</div>` : ""}
              ${e.artifact ? `<div class="step-note mono small">art: ${esc(e.artifact)}</div>` : ""}
            </div>`).join("")}
          </div>`).join("")}
      </div>
    </div>`;
  bindGoButtons();
}

/* ---------------- inspector ---------------- */
function renderInspector() {
  const box = $("#inspector");
  const sel = D.selection;
  if (!sel) {
    box.innerHTML = `<div class="inspector-empty"><div class="empty-glyph">◈</div>
      <p>Select a project, run, model or agent to inspect it here.</p></div>`;
    return;
  }
  const [kind, id] = sel.split(":");
  const close = `<button class="ins-close" id="insClose" title="close">✕</button>`;
  let html = "";
  if (kind === "project") html = inspProject(D.data.projects.find((p) => p.slug === id));
  else if (kind === "run") html = inspRun(D.data.runs.find((r) => r.id === id));
  else if (kind === "model") html = inspModel(D.data.models.find((m) => m.model === id));
  else if (kind === "agent") html = inspAgent(D.data.agents.find((a) => a.ref === id));
  box.innerHTML = `<div class="inspector-inner" style="position:relative">${close}${html}</div>`;
  const cb = $("#insClose");
  if (cb) cb.addEventListener("click", () => { D.selection = null; renderView(); renderInspector(); });
}

function inspProject(p) {
  if (!p) return `<div class="notice">Project not found.</div>`;
  const runs = [...p.runs].reverse();
  return `
    <div class="ins-title"><span style="font-size:26px">${esc(p.emoji || "📦")}</span><h3>${esc(p.name)}</h3></div>
    <div class="ins-sub">${esc(p.slug)}</div>
    <div class="flex wrap mb12">${badge(p.status, p.status)} ${badge(p.stage, "accent")}</div>
    <div class="ins-section"><h5>Status</h5>
      <dl class="kv">
        <dt>Stage</dt><dd>${esc(p.stage)} (${D.data.funnel[Math.min(p.stageIndex ?? 0, 5)].emoji} ${esc(p.stage)})</dd>
        <dt>Runs</dt><dd>${p.runCount}</dd>
        <dt>Note</dt><dd>${esc(p.statusNote || "—")}</dd>
        ${p.blocker ? `<dt>Blocker</dt><dd style="color:var(--fail)">${esc(p.blocker)}</dd>` : ""}
        <dt>Next</dt><dd>${esc(p.nextStep || "—")}</dd>
        <dt>Brief</dt><dd class="mono small">${esc(p.brief || "—")}</dd>
        <dt>Source</dt><dd class="mono small">${esc(p.source || "—")}</dd>
        <dt>Updated</dt><dd class="mono small">${fmtFull(p.updatedAt)}</dd>
      </dl>
    </div>
    <div class="ins-section"><h5>Run history (${p.runCount})</h5>
      ${runs.map((r) => `<div class="step-row" data-go="run:${esc(r.id)}" style="cursor:pointer">
        <div class="step-head"><span class="step-id">${esc(r.id)}</span> ${badge(r.status, r.status)}
          <span class="mono small muted">${esc(graphLabel(r.graph))}</span>
          <span class="grow"></span><span class="small faint">${durationLabel(r.startedAt, r.finishedAt)}</span>
        </div>
        ${r.summary ? `<div class="step-note">${esc(r.summary)}</div>` : ""}
      </div>`).join("") || `<div class="muted small">No runs recorded yet.</div>`}
    </div>`;
}

function inspRun(r) {
  if (!r) return `<div class="notice">Run not found.</div>`;
  const c = countSteps(r.steps);
  const pr = D.data.projects.find((p) => p.slug === r.project);
  return `
    <div class="ins-title"><h3>${esc(r.id)}</h3></div>
    <div class="ins-sub">${esc(r.graph)}</div>
    <div class="flex wrap mb12">
      ${badge(r.status, r.status)}
      ${r.outcome ? badge(r.outcome, r.outcome) : ""}
      ${r.model ? modelChip(r.model) : ""}
    </div>
    ${r.summary ? `<div class="notice mb12">${esc(r.summary)}</div>` : ""}
    <div class="ins-section"><h5>Meta</h5>
      <dl class="kv">
        <dt>Project</dt><dd><a href="#" data-go="project:${esc(r.project)}">${esc(pr ? pr.name : r.project)}</a></dd>
        <dt>Started</dt><dd class="mono small">${fmtFull(r.startedAt)}</dd>
        <dt>Finished</dt><dd class="mono small">${fmtFull(r.finishedAt)}</dd>
        <dt>Duration</dt><dd>${durationLabel(r.startedAt, r.finishedAt)}</dd>
        <dt>Steps</dt><dd>${stepSummary(c)}</dd>
        <dt>Outcome</dt><dd>${esc(r.outcome || "—")}</dd>
      </dl>
    </div>
    <div class="ins-section"><h5>Steps (${c.total})</h5>
      ${r.steps.map((s) => `<div class="step-row">
        <div class="step-head">
          <span class="step-id">${esc(s.id)}</span> ${badge(s.status, s.status)}
          <span class="feed-ag">${esc(s.agent)}</span>
        </div>
        <div class="step-sub">
          ${s.model ? modelChip(s.model) : ""}
          ${s.artifact ? `<span class="tag">art: ${esc(s.artifact)}</span>` : ""}
          ${s.startedAt || s.finishedAt ? `<span class="mono small faint">${shortTs(s.finishedAt || s.startedAt)}</span>` : ""}
        </div>
        ${s.note ? `<div class="step-note">${esc(s.note)}</div>` : ""}
      </div>`).join("")}
    </div>`;
}

function inspModel(m) {
  if (!m) return `<div class="notice">Model not found.</div>`;
  const types = Object.entries(m.stepTypes).sort((a, b) => b[1].total - a[1].total);
  const agents = Object.entries(m.agents).sort((a, b) => b[1] - a[1]);
  return `
    <div class="ins-title"><h3>Model</h3></div>
    <div class="ins-sub">${modelChip(m.model)}</div>
    <div class="flex wrap mb12">${badge(`${m.runs} runs`, "accent")} ${badge(`${m.steps.total} steps`, "muted")}
      ${badge(`${m.steps.complete} ok`, "ok")} ${badge(`${m.steps.failed} failed`, "failed")}
      ${badge(`${m.steps.blocked} blocked`, "blocked")}</div>
    <div class="ins-section"><h5>Reliability by step type</h5>
      ${types.map(([t, c2]) => `<div class="step-row">
        <div class="step-head"><span class="step-id">${esc(t)}</span>
          <span class="grow"></span><span class="small faint">${c2.total} steps</span></div>
        <div class="bar-track mt8"><div class="bar-fill ok" style="width:${100 * (c2.complete + c2.skipped) / Math.max(1, c2.total)}%"></div></div>
        <div class="step-note">ok ${c2.complete} · failed ${c2.failed} · blocked ${c2.blocked}${c2.running ? ` · running ${c2.running}` : ""}</div>
      </div>`).join("")}
    </div>
    <div class="ins-section"><h5>Agents on this model</h5>
      ${agents.map(([ref, n]) => `<div class="step-row flex"><span class="step-id grow">${esc(ref)}</span><span class="small faint">${n} steps</span></div>`).join("")}
    </div>`;
}

function inspAgent(a) {
  if (!a) return `<div class="notice">Agent not found.</div>`;
  const c = a.steps || {};
  const okp = c.total ? Math.round(100 * (c.complete + c.skipped) / c.total) : 0;
  const models = Object.entries(a.models || {}).sort((x, y) => y[1] - x[1]);
  return `
    <div class="ins-title"><span style="font-size:26px">${esc(a.emoji || "🤖")}</span><h3>${esc(a.name)}</h3></div>
    <div class="ins-sub">${esc(a.ref)}</div>
    <div class="flex wrap mb12">${badge(a.kind, "muted")} ${badge(`${a.runs} runs`, "accent")}</div>
    <div class="ins-section"><h5>Role</h5><div class="muted">${esc(a.role || "—")}</div></div>
    <div class="ins-section"><h5>Stats</h5>
      <div class="flex wrap mb12">${badge(`${c.total} steps`, "muted")} ${badge(`${c.complete} ok`, "ok")}
        ${badge(`${c.failed} failed`, "failed")} ${badge(`${c.blocked} blocked`, "blocked")}</div>
      <div class="bar-track"><div class="bar-fill ${okp >= 90 ? "ok" : okp >= 60 ? "blocked" : "fail"}" style="width:${okp}%"></div></div>
      <div class="progress-label"><span>success ${okp}%</span><span>last ${shortTs(a.lastSeen)}</span></div>
    </div>
    ${models.length ? `<div class="ins-section"><h5>Models seen</h5><div class="flex wrap">${models.map(([m, n]) => `${modelChip(m)}<span class="small faint">&nbsp;×${n}</span>`).join("&nbsp; ")}</div></div>` : ""}
    <div class="ins-section"><h5>Tools</h5><div class="flex wrap">${(a.tools || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div></div>`;
}

/* ---------------- cross-view plumbing ---------------- */
function bindGoButtons() {
  $$("[data-go]").forEach((el) => {
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      goTo(el.dataset.go);
    });
  });
}

function goTo(target) {
  const [kind] = target.split(":");
  D.selection = target;
  const tabFor = { project: "projects", run: "runs", model: "models", agent: "agents" };
  const tab = tabFor[kind];
  if (tab) {
    D.view = tab;
    $$("#tabs .tab").forEach((t) => t.classList.toggle("is-active", t.dataset.view === tab));
    renderView();
  }
  renderInspector();
}

function bindSearch() {
  const box = $("#searchBox");
  if (!box) return;
  const apply = () => { D.query = box.value.trim(); renderView(); };
  box.addEventListener("input", apply);
}

/* ---------------- boot ---------------- */
function bindTabs() {
  $$("#tabs .tab").forEach((t) => t.addEventListener("click", () => {
    D.selection = null;
    activateTab(t.dataset.view);
  }));
}
document.addEventListener("DOMContentLoaded", () => { bindTabs(); loadData(); });
