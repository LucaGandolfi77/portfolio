/* app.js — Pi Agent PWA: UI state, streaming transcript, dialogs, controls. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const LS_TRANSCRIPT = "pi-pwa:transcript:v1";
  const LS_WS = "pi-pwa:workspace";
  const MAX_ENTRIES = 60;
  const MAX_IMG_BYTES = 6 * 1024 * 1024; // refuse giant attachments
  const THUMB = 380; // px, history thumbnail side

  /* ============================================================ state */
  const state = {
    connected: false,
    agentPhase: "starting", // starting | running | exited | failed
    busy: false,            // agent currently streaming
    models: [],
    activeModel: null,
    thinkingLevels: [],
    thinking: null,
    currentUserTurn: 0,
    pendingMsgs: [],        // messages accumulated from agent_end for the live turn
    live: null,             // { root, bubble }
    lastUsage: null,
    queue: { steering: 0, followUp: 0 },
    widgetTexts: {},        // widgetKey -> lines
    deferredInstall: null,
    tokenPromptOpen: false,
    connectFailHandled: false,
    commands: [],           // commands registered with the agent (get_commands)
    cmdSel: -1,             // highlighted suggestion index
  };

  const transcript = loadTranscript();

  /* ============================================================ DOM refs */
  const els = {
    connPill: $("conn-pill"), connDot: $("conn-dot"), connLabel: $("conn-label"),
    phasePill: $("phase-pill"), phaseDot: $("phase-dot"), phaseLabel: $("phase-label"),
    modelChip: $("model-chip"),
    wsSelect: $("ws-select"), modelSelect: $("model-select"), thinkSelect: $("think-select"),
    btnStats: $("btn-stats"), btnNew: $("btn-new"), btnClear: $("btn-clear"),
    btnLogs: $("btn-logs"), btnSettings: $("btn-settings"), btnHelp: $("btn-help"),
    transcript: $("transcript"),
    composerText: $("composer-text"), attachBtn: $("attach-btn"), sendBtn: $("send-btn"),
    steerBtn: $("steer-btn"), stopBtn: $("stop-btn"), liveActions: $("live-actions"),
    attachments: $("attachments"), fileInput: $("file-input"), cmdSuggest: $("cmd-suggest"),
    queueInfo: $("queue-info"), usageInfo: $("usage-info"), cwdLabel: $("cwd-label"),
    toasts: $("toasts"), dlgHost: $("dlg-host"),
  };

  const D = window.Dbg || { log(){}, warn(){}, error(){}, info(){}, all(){ return []; }, clear(){} };

  /* local commands that run in the wrapper itself (the pi RPC agent only knows
     extension/skill/template commands; built-in TUI ones like /compact are
     separate RPC commands, so we surface them here) */
  const LOCAL_COMMANDS = {
    help:     { desc: "About this wrapper, shortcuts, security", run: () => openHelp() },
    compact:  { desc: "Compact the agent conversation context", run: () => { piWS.rpc({ type: "compact" }); } },
    stats:    { desc: "Session token / cost statistics", run: () => fetchStats() },
    new:      { desc: "Start a fresh agent session", run: () => confirmDialog("New session", "Restart the agent with a fresh session in this workspace? (The on-screen history is kept.)", () => { piWS.send({ kind: "restart" }); addSys("Starting a fresh agent session…", "warn"); }) },
    clear:    { desc: "Clear the on-screen transcript (local only)", run: () => confirmDialog("Clear chat", "Remove the on-screen transcript (local history only — does not affect the agent session).", () => { transcript.length = 0; saveTranscript(); rerenderAll(); els.usageInfo.textContent = ""; }) },
    logs:     { desc: "Open the diagnostic log", run: () => openLogsDialog() },
    server:   { desc: "Server / token / reconnect settings", run: () => openSettingsDialog() },
    reconnect:{ desc: "Reconnect to the bridge server", run: () => { state.connectFailHandled = false; piWS.retry(); } },
  };
  const LOCAL_HELP = Object.entries(LOCAL_COMMANDS).map(([n, c]) => ({ name: n, description: c.desc, source: "local" }));

  /* ============================================================ transcript persistence */
  function loadTranscript() {
    try {
      const raw = localStorage.getItem(LS_TRANSCRIPT);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function saveTranscript() {
    try {
      const keep = transcript.slice(-MAX_ENTRIES);
      localStorage.setItem(LS_TRANSCRIPT, JSON.stringify(keep));
    } catch {
      // quota exceeded — drop images, keep text only
      try {
        const lean = transcript.slice(-40).map((e) =>
          e.kind === "user" ? { ...e, images: [] } : e
        );
        localStorage.setItem(LS_TRANSCRIPT, JSON.stringify(lean));
      } catch {}
    }
  }

  function pushEntry(entry) {
    transcript.push(entry);
    if (transcript.length > MAX_ENTRIES) transcript.splice(0, transcript.length - MAX_ENTRIES);
    saveTranscript();
  }

  /* ============================================================ rendering helpers */
  function rerenderAll() {
    els.transcript.innerHTML = "";
    for (const e of transcript) renderEntry(e);
    document.body.classList.toggle("has-transcript", transcript.length > 0);
    scrollToBottom();
  }

  function renderEntry(entry) {
    let node = null;
    if (entry.kind === "user") {
      node = Render.userBubble(entry.text, entry.images || []);
    } else if (entry.kind === "agent") {
      const holder = Render.agentBubble();
      holder.bubble.classList.remove("agent-running");
      holder.bubble.append(Render.blocksToDom(entry.blocks || []));
      node = holder.root;
    } else {
      node = Render.sysBubble(entry.text, entry.kind === "sys-error" ? "error" : "");
    }
    if (node) els.transcript.append(node);
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      els.transcript.scrollTop = els.transcript.scrollHeight;
    });
  }

  function addSys(text, kind) {
    pushEntry({ kind: "sys", text, ts: Date.now() });
    els.transcript.append(Render.sysBubble(text, kind === "error" ? "error" : kind === "warn" ? "warn" : ""));
    scrollToBottom();
  }

  /* ============================================================ connection UI */
  function setConn(connected) {
    state.connected = connected;
    els.connPill.classList.toggle("ok", connected);
    els.connPill.classList.toggle("bad", !connected);
    els.connLabel.textContent = connected ? "connected" : "offline";
  }

  function setPhase(phase, label) {
    state.agentPhase = phase;
    els.phasePill.classList.remove("ok", "bad", "busy");
    if (phase === "running") { els.phasePill.classList.add("ok"); els.phaseLabel.textContent = "agent ready"; }
    else if (phase === "starting") { els.phasePill.classList.add("busy"); els.phaseLabel.textContent = "agent…"; }
    else if (phase === "exited") { els.phasePill.classList.add("bad"); els.phaseLabel.textContent = label || "agent exited"; }
    else if (phase === "failed") { els.phasePill.classList.add("bad"); els.phaseLabel.textContent = label || "agent error"; }
  }

  function setBusy(busy) {
    state.busy = busy;
    els.sendBtn.classList.toggle("hidden", busy);
    els.liveActions.classList.toggle("hidden", !busy);
    els.composerText.placeholder = busy
      ? "Message while busy is queued as a steer…"
      : "Message the agent…  (Enter to send, Shift+Enter for newline, Esc to stop)";
    if (!busy) {
      state.pendingMsgs = [];
      state.live = null;
    }
    document.body.classList.toggle("agent-busy", busy);
  }

  /* ============================================================ toasts */
  function toast(title, body, kind = "info", ttl = 6000) {
    const el = Render.el("div", { class: `toast ${kind}` }, [
      Render.el("div", { class: "toast-title" }, title),
      body ? Render.el("div", {}, body) : null,
    ]);
    els.toasts.append(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity .3s";
      setTimeout(() => el.remove(), 320);
    }, ttl);
  }

  /* ============================================================ dialogs */
  function openDialog(node, { onCancel } = {}) {
    els.dlgHost.innerHTML = "";
    els.dlgHost.classList.remove("hidden");
    const wrap = Render.el("div", { class: "dialog" }, node);
    els.dlgHost.append(wrap);
    return {
      close() {
        els.dlgHost.classList.add("hidden");
        els.dlgHost.innerHTML = "";
      },
      onCancel,
    };
  }

  function dialogShell(title, body, actions) {
    return [
      Render.el("div", { class: "dialog-body" }, [
        Render.el("h3", {}, title),
        ...(Array.isArray(body) ? body : [body]),
      ]),
      actions && actions.length ? Render.el("div", { class: "dialog-actions" }, actions) : null,
    ];
  }

  function confirmDialog(title, message, onYes) {
    const yes = Render.el("button", { class: "btn danger", textContent: "Confirm" });
    const no = Render.el("button", { class: "btn", textContent: "Cancel" });
    const dlg = openDialog(dialogShell(title, Render.el("p", {}, message), [no, yes]));
    const done = (v) => { dlg.close(); if (v) onYes(); };
    no.addEventListener("click", () => done(false));
    yes.addEventListener("click", () => done(true));
  }

  /* ---------- extension UI dialogs (select / confirm / input / editor) ---------- */
  const extReqQueue = [];
  let extDialog = null;
  let extRespond = null;

  function handleExtensionRequest(req) {
    if (extDialog) { extReqQueue.push(req); return; } // one dialog at a time
    showExtDialog(req);
  }

  function showExtDialog(req) {
    const respond = (payload) => {
      extDialog = null;
      extRespond = null;
      const queued = extReqQueue.shift();
      piWS.rpc({ type: "extension_ui_response", id: req.id, ...payload });
      if (queued) setTimeout(() => showExtDialog(queued), 30);
    };
    extRespond = respond;

    if (req.method === "select") {
      const opts = req.options || [];
      const list = Render.el("div", { class: "opt-list" });
      for (const o of opts) {
        const b = Render.el("button", { textContent: o });
        b.addEventListener("click", () => { dlg.close(); respond({ value: o }); });
        list.append(b);
      }
      const cancel = Render.el("button", { class: "btn", textContent: "Cancel" });
      const dlg = openDialog(dialogShell(req.title || "Select an option", [
        req.message ? Render.el("p", {}, req.message) : null,
        list,
      ], [cancel]));
      cancel.addEventListener("click", () => { dlg.close(); respond({ cancelled: true }); });
      extDialog = dlg;
      return;
    }

    if (req.method === "confirm") {
      const ok = Render.el("button", { class: "btn primary", textContent: "Yes" });
      const no = Render.el("button", { class: "btn", textContent: "No" });
      const dlg = openDialog(dialogShell(req.title || "Confirm", [
        req.message ? Render.el("p", {}, req.message) : null,
      ], [no, ok]));
      ok.addEventListener("click", () => { dlg.close(); respond({ confirmed: true }); });
      no.addEventListener("click", () => { dlg.close(); respond({ confirmed: false }); });
      extDialog = dlg;
      return;
    }

    if (req.method === "input" || req.method === "editor") {
      const ta = Render.el("textarea", {
        placeholder: req.placeholder || "",
        rows: req.method === "editor" ? 10 : 3,
        textContent: req.prefill || "",
      });
      const ok = Render.el("button", { class: "btn primary", textContent: "OK" });
      const cancel = Render.el("button", { class: "btn", textContent: "Cancel" });
      const dlg = openDialog(dialogShell(req.title || (req.method === "editor" ? "Edit text" : "Input"), [
        ta,
      ], [cancel, ok]));
      ok.addEventListener("click", () => { dlg.close(); respond({ value: ta.value }); });
      cancel.addEventListener("click", () => { dlg.close(); respond({ cancelled: true }); });
      setTimeout(() => ta.focus(), 0);
      extDialog = dlg;
      return;
    }

    // fire-and-forget methods -------------------------------------------
    if (req.method === "notify") {
      const k = req.notifyType === "error" ? "error" : req.notifyType === "warning" ? "warn" : "info";
      toast("Extension", req.message, k);
      return;
    }
    if (req.method === "setTitle") {
      document.title = req.title ? `${req.title} — Pi Agent` : "Pi Agent";
      return;
    }
    if (req.method === "setStatus") {
      toast("Extension status", req.statusText ? `${req.statusKey}: ${req.statusText}` : `cleared ${req.statusKey}`, "info", 2500);
      return;
    }
    if (req.method === "set_editor_text") {
      els.composerText.value = req.text || "";
      autosize();
      return;
    }
    if (req.method === "setWidget") {
      state.widgetTexts[req.widgetKey] = req.widgetLines || null;
      renderWidgets();
      return;
    }
    // unknown methods — ignore
  }

  function renderWidgets() {
    const host = $("widget-bar");
    if (!host) return;
    host.innerHTML = "";
    for (const key of Object.keys(state.widgetTexts)) {
      const lines = state.widgetTexts[key];
      if (!lines || !lines.length) continue;
      host.append(Render.el("div", { class: "widget" }, [
        Render.el("div", { class: "widget-title" }, key),
        ...lines.map((l) => Render.el("div", { class: "widget-line", textContent: l })),
      ]));
    }
  }

  /* ============================================================ usage & stats */
  function fmtTokens(n) {
    if (n === null || n === undefined) return "—";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
    return String(n);
  }

  function showUsage(usage) {
    if (!usage) return;
    state.lastUsage = usage;
    const cost = usage.cost && typeof usage.cost === "object" ? usage.cost.total : usage.cost;
    const parts = [`in ${fmtTokens(usage.input)}`, `out ${fmtTokens(usage.output)}`];
    if (usage.cacheRead) parts.push(`cache ${fmtTokens(usage.cacheRead)}`);
    if (typeof cost === "number" && cost > 0) parts.push(`$${cost.toFixed(4)}`);
    els.usageInfo.textContent = parts.join(" · ");
  }

  async function fetchStats() {
    piWS.rpc({ type: "get_session_stats" });
  }

  /* ============================================================ model / thinking */
  function populateModels() {
    const sel = els.modelSelect;
    sel.innerHTML = "";
    for (const m of state.models) {
      const opt = Render.el("option", { value: `${m.provider}/${m.id}`, textContent: `${m.name || m.id} (${m.provider})` });
      sel.append(opt);
    }
    sel.disabled = state.models.length === 0;
    if (state.activeModel) {
      const val = `${state.activeModel.provider}/${state.activeModel.id}`;
      if ([...sel.options].some((o) => o.value === val)) sel.value = val;
      else sel.value = "";
      updateModelChip(state.activeModel);
    }
  }

  function updateModelChip(model) {
    els.modelChip.classList.toggle("hidden", !model);
    if (model) els.modelChip.textContent = `${model.name || model.id} · ${model.thinkingLevel || ""}`.trim();
  }

  function handleGetState(data) {
    if (data.model) {
      state.activeModel = { ...data.model, thinkingLevel: data.thinkingLevel };
      state.thinking = data.thinkingLevel || state.thinking;
    }
    populateModels();
    populateThinking();
    updateModelChip(state.activeModel);
  }

  /* ============================================================ agent event handling */
  function handleAgentEvent(ev) {
    switch (ev.type) {
      case "agent_start":
        setBusy(true);
        D.log("agent", "turn start");
        startLiveBubble();
        break;

      case "message_update":
        if (ev.usage) showUsage(ev.usage);
        applyStreamDelta(ev.assistantMessageEvent);
        break;

      case "tool_execution_start":
        liveToolRun(ev.toolName, ev.args, "run");
        break;

      case "tool_execution_end":
        if (!ev.isError) liveToolRun(ev.toolName, null, "done");
        break;

      case "agent_end":
        if (Array.isArray(ev.messages)) state.pendingMsgs.push(...ev.messages);
        break;

      case "agent_settled":
        finalizeLiveTurn();
        setBusy(false);
        D.log("agent", "turn settled (idle)");
        piWS.rpc({ type: "get_session_stats" });
        break;

      case "turn_start":
      case "turn_end":
      case "message_start":
      case "message_end":
      case "thinking_level_changed":
      case "bash_execution_update":
      case "tool_execution_update":
      case "summarization_retry_scheduled":
      case "summarization_retry_attempt_start":
      case "summarization_retry_finished":
        break;

      case "compaction_start":
        addSys(`Compacting context (${ev.reason})…`, "warn");
        break;

      case "compaction_end":
        if (ev.result) {
          const est = ev.result.estimatedTokensAfter;
          addSys(`Context compacted — ${est ? "~" + fmtTokens(est) + " tokens after" : "done"}`, "warn");
        }
        break;

      case "auto_retry_start":
        addSys(`Transient error — retry ${ev.attempt}/${ev.maxAttempts} in ${Math.round((ev.delayMs || 0) / 1000)}s`, "warn");
        break;
      case "auto_retry_end":
        if (!ev.success) addSys(`Retry failed: ${ev.finalError}`, "error");
        break;

      case "extension_error":
        addSys(`Extension error: ${ev.error}`, "error");
        break;

      case "extension_ui_request":
        handleExtensionRequest(ev);
        break;

      case "queue_update":
        state.queue.steering = (ev.steering || []).length;
        state.queue.followUp = (ev.followUp || []).length;
        renderQueue();
        break;

      case "response":
        handleRpcResponse(ev);
        break;
      default:
        // keep an eye out for event types this UI does not yet handle
        D.log(`ev:${ev.type}`, "(unhandled event type)");
        break;
    }
  }

  function handleRpcResponse(res) {
    if (res.success === false) {
      // command-level failures (e.g. prompt rejected while streaming)
      if (res.command === "prompt" || res.command === "steer") {
        toast("Not accepted", res.error || "message rejected", "warn");
      } else {
        toast("Command failed", `${res.command}: ${res.error}`, "error");
      }
      return;
    }
    if (res.command === "get_state") handleGetState(res.data);
    if (res.command === "get_available_models") {
      state.models = (res.data && res.data.models) || [];
      populateModels();
    }
    if (res.command === "get_available_thinking_levels") {
      state.thinkingLevels = (res.data && res.data.levels) || [];
      populateThinking();
    }
    if (res.command === "get_commands") {
      state.commands = (res.data && res.data.commands) || [];
      D.log("cmd", `agent exposes ${state.commands.length} slash commands: ${state.commands.map((c) => c.name).slice(0, 20).join(", ")}`);
    }
    if (res.command === "set_model") {
      state.activeModel = res.data || state.activeModel;
      handleGetState(res.data);
    }
    if (res.command === "get_session_stats" && res.data) {
      const u = res.data.tokens || {};
      const cost = res.data.cost;
      const ctx = res.data.contextUsage;
      const line = [
        `msgs ${res.data.totalMessages ?? "—"}`,
        `in ${fmtTokens(u.input)} · out ${fmtTokens(u.output)}`,
        typeof cost === "number" ? `$${cost.toFixed(4)}` : null,
        ctx && ctx.percent != null ? `${ctx.percent}% ctx` : null,
      ].filter(Boolean).join("  ");
      els.usageInfo.textContent = line || "";
    }
  }

  function populateThinking() {
    const sel = els.thinkSelect;
    sel.innerHTML = "";
    for (const lv of state.thinkingLevels) {
      sel.append(Render.el("option", { value: lv, textContent: lv }));
    }
    sel.disabled = state.thinkingLevels.length === 0;
    if (state.thinking && state.thinkingLevels.includes(state.thinking)) sel.value = state.thinking;
  }

  /* ============================================================ live streaming bubble */
  function startLiveBubble() {
    const holder = Render.agentBubble();
    els.transcript.append(holder.root);
    state.live = { root: holder.root, bubble: holder.bubble, slots: new Map(), runs: [] };
    scrollToBottom();
  }

  function liveSlot(idx, type) {
    const live = state.live;
    if (!live) return null;
    if (!live.slots.has(idx)) {
      const el = type === "thinking" ? Render.el("div", { class: "think-body-live", style: "color:var(--text-faint);white-space:pre-wrap;font-size:13px" })
        : Render.liveTextEl();
      live.slots.set(idx, { type, el, text: "" });
      // keep children ordered by contentIndex
      const entries = [...live.slots.entries()].sort((a, b) => a[0] - b[0]);
      live.bubble.innerHTML = "";
      for (const [, s] of entries) live.bubble.append(s.el);
      if (!live.slots.get(idx).type.includes("think")) el.classList.add("typing-dots");
      else el.classList.add("typing-dots");
    }
    return live.slots.get(idx);
  }

  function applyStreamDelta(delta) {
    if (!delta) return;
    const live = state.live;
    if (!live) return;
    const idx = delta.contentIndex ?? 0;
    if (delta.type === "text_start" || delta.type === "thinking_start") {
      const slot = liveSlot(idx, delta.type === "thinking_start" ? "thinking" : "text");
      if (slot) slot.el.classList.remove("typing-dots");
    } else if (delta.type === "text_delta" || delta.type === "thinking_delta") {
      const type = delta.type === "thinking_delta" ? "thinking" : "text";
      const slot = liveSlot(idx, type);
      if (slot) { slot.text += delta.delta; slot.el.textContent = slot.text; }
      scrollToBottom();
    }
    // toolcall_* events inside message_update are covered by tool_execution_*,
    // which carry richer status — we render chips from those instead.
  }

  function liveToolRun(name, args, kind) {
    const live = state.live;
    if (!live) return;
    if (kind === "done") {
      // mark the running chip as finished; the authoritative result card
      // replaces the whole live bubble at agent_settled anyway
      const chips = [...live.bubble.querySelectorAll(".tool-run.running")];
      const chip = chips.find((c) => c.dataset.name === name);
      if (chip) {
        chip.classList.remove("running");
        chip.style.opacity = ".55";
        chip.textContent = `✔ ${name}`;
        setTimeout(() => chip.remove(), 1600);
      }
      return;
    }
    const summary = Render.summarizeArgs(name, args);
    const chip = Render.el("div", { class: "tool-run running", dataset: { name } }, [
      Render.el("span", { class: "spinner" }, "◌"),
      ` ${name}${summary ? " " + summary : ""}`,
    ]);
    live.bubble.append(chip);
    scrollToBottom();
  }

  function finalizeLiveTurn() {
    const live = state.live;
    if (!live) return;
    const blocks = msgsToBlocks(state.pendingMsgs);
    if (!blocks.length && !state.pendingMsgs.length) {
      // nothing new (e.g. abort before any message)
      live.root.remove();
      state.live = null;
      return;
    }
    live.bubble.innerHTML = "";
    live.bubble.classList.remove("agent-running");
    live.bubble.append(Render.blocksToDom(blocks));
    pushEntry({ kind: "agent", blocks, ts: Date.now() });
    state.pendingMsgs = [];
    state.live = null;
    scrollToBottom();
  }

  function msgsToBlocks(messages) {
    const blocks = [];
    const results = {};
    for (const m of messages) {
      if (!m) continue;
      if (m.role === "toolResult") {
        results[m.toolCallId] = {
          text: Render.resultText(m.content),
          isError: !!m.isError,
        };
      }
    }
    let prevText = null;
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      const content = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
      if (!Array.isArray(content)) continue;
      for (const c of content) {
        if (!c) continue;
        if (c.type === "text") {
          if (c.text && c.text.trim()) {
            // guard against a retried/duplicated turn being committed twice
            if (c.text === prevText && blocks.length && blocks[blocks.length - 1].type === "text") continue;
            blocks.push({ type: "text", text: c.text });
            prevText = c.text;
          }
        } else if (c.type === "thinking") {
          if (c.thinking && c.thinking.trim()) blocks.push({ type: "thinking", text: c.thinking });
        } else if (c.type === "toolCall") {
          const id = c.id || c.toolCallId;
          blocks.push({
            type: "tool",
            name: c.name || c.toolName || "tool",
            args: c.arguments || {},
            argsSummary: Render.summarizeArgs(c.name || c.toolName, c.arguments || {}),
            ...(id && results[id] ? results[id] : {}),
          });
        }
      }
    }
    return blocks;
  }

  /* ============================================================ composer */
  const attachments = []; // {name, dataUrl(thumb), mimeType, base64(full)}

  function renderAttachments() {
    els.attachments.classList.toggle("hidden", attachments.length === 0);
    els.attachments.innerHTML = "";
    attachments.forEach((a, i) => {
      const rm = Render.el("button", { class: "rm", textContent: "✕" });
      rm.addEventListener("click", () => { attachments.splice(i, 1); renderAttachments(); });
      els.attachments.append(Render.el("div", { class: "att" }, [
        Render.el("img", { src: a.dataUrl, alt: "" }),
        Render.el("span", { textContent: a.name }),
        rm,
      ]));
    });
  }

  function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  function downscale(dataUrl, maxSide) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        if (scale >= 1) { res(dataUrl); return; }
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => res(dataUrl);
      img.src = dataUrl;
    });
  }

  els.attachBtn.addEventListener("click", () => els.fileInput.click());
  els.fileInput.addEventListener("change", async () => {
    const files = [...els.fileInput.files];
    els.fileInput.value = "";
    for (const f of files) {
      if (!f.type.startsWith("image/")) { toast("Attachment", "Only images are supported.", "warn"); continue; }
      if (f.size > MAX_IMG_BYTES) { toast("Attachment", `${f.name} is too large (max ${MAX_IMG_BYTES / 1048576} MB).`, "warn"); continue; }
      try {
        const full = await readFileAsDataURL(f);
        const thumb = await downscale(full, THUMB);
        attachments.push({
          name: f.name, mimeType: f.type,
          dataUrl: thumb, base64: full.split(",")[1],
        });
      } catch {
        toast("Attachment", `Could not read ${f.name}`, "error");
      }
    }
    renderAttachments();
  });

  function submitComposer() {
    const text = els.composerText.value.trim();
    if (!text && !attachments.length) return;

    // ---- local slash commands run in the wrapper, even when busy/offline ----
    if (text.startsWith("/")) {
      const m = text.slice(1).trim().split(/\s+/);
      const name = (m[0] || "").toLowerCase();
      const local = LOCAL_COMMANDS[name];
      if (local) {
        echoUserCommand(text);
        els.composerText.value = "";
        attachments.length = 0;
        renderAttachments();
        autosize();
        hideSuggestions();
        D.log("cmd", `local /${name}`);
        try { local.run(); } catch (err) { D.error("cmd", `/${name} failed: ${err}`); toast("Command", String(err), "error"); }
        return;
      }
      if (!state.connected) {
        toast("Not connected", "The agent is not reachable. Use /server to configure the bridge, or click the status pill to retry.", "warn");
        return;
      }
    }

    if (state.busy) {
      // queue as a steer so it interrupts after the current tool batch
      if (text) {
        els.composerText.value = "";
        autosize();
        addQueued("steer", text);
        addSys(`Steer queued: “${text.length > 140 ? text.slice(0, 140) + "…" : text}”`, "warn");
        D.log("cmd", `steer → ${text.slice(0, 80)}`);
        piWS.rpc({ type: "steer", message: text });
      } else {
        toast("Busy", "The agent is working — type text to steer it.", "warn");
      }
      return;
    }
    const images = attachments.map((a) => ({ type: "image", data: a.base64, mimeType: a.mimeType }));
    const imagesForHistory = attachments.map((a) => ({ name: a.name, dataUrl: a.dataUrl }));
    els.composerText.value = "";
    attachments.length = 0;
    renderAttachments();
    autosize();
    hideSuggestions();

    const msg = text || (imagesForHistory.length ? `Analyze the attached image${imagesForHistory.length > 1 ? "s" : ""}.` : "");
    pushEntry({ kind: "user", text: msg, images: imagesForHistory, ts: Date.now() });
    els.transcript.append(Render.userBubble(msg, imagesForHistory));
    document.body.classList.add("has-transcript");
    scrollToBottom();
    D.log("cmd", `prompt → ${msg.slice(0, 80)}${images.length ? ` (+${images.length} image)` : ""}`);

    if (!piWS.rpc({ type: "prompt", message: msg, images: images.length ? images : undefined })) {
      addSys("Cannot reach the agent process — is it running?", "error");
    }
  }

  function echoUserCommand(text) {
    pushEntry({ kind: "user", text, ts: Date.now() });
    els.transcript.append(Render.userBubble(text, []));
    document.body.classList.add("has-transcript");
    scrollToBottom();
  }

  els.sendBtn.addEventListener("click", submitComposer);

  function autosize() {
    els.composerText.style.height = "auto";
    els.composerText.style.height = Math.min(els.composerText.scrollHeight, 180) + "px";
  }
  els.composerText.addEventListener("input", () => { autosize(); updateSuggestions(); });

  function commandItems() {
    // union: local commands first, then commands the agent registered
    const seen = new Set();
    const items = [];
    for (const c of LOCAL_HELP) {
      if (seen.has(c.name)) continue;
      seen.add(c.name);
      items.push(c);
    }
    for (const c of state.commands) {
      if (seen.has(c.name)) continue;
      seen.add(c.name);
      items.push(c);
    }
    return items;
  }

  function updateSuggestions() {
    const raw = els.composerText.value;
    if (!raw.startsWith("/") || raw.includes("\n")) { hideSuggestions(); return; }
    const q = raw.slice(1).toLowerCase();
    const list = commandItems()
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice(0, 8);
    if (!list.length) { hideSuggestions(); return; }
    state.cmdSel = 0;
    state.suggestList = list;
    els.cmdSuggest.classList.remove("hidden");
    els.cmdSuggest.innerHTML = "";
    list.forEach((c, i) => {
      const row = Render.el("div", { class: "sugg-row" + (i === state.cmdSel ? " sel" : ""), dataset: { i } }, [
        Render.el("span", { class: "sugg-name" }, "/" + c.name),
        Render.el("span", { class: "sugg-desc" }, `${c.description || ""}`),
        Render.el("span", { class: "sugg-src" }, c.source || ""),
      ]);
      row.addEventListener("mousedown", (e) => {
        e.preventDefault(); // keep focus in the textarea
        setComposerCommand(c.name);
      });
      els.cmdSuggest.append(row);
    });
  }

  function setComposerCommand(name) {
    els.composerText.value = `/${name} `;
    els.composerText.focus();
    autosize();
    updateSuggestions();
  }

  function hideSuggestions() {
    els.cmdSuggest.classList.add("hidden");
    els.cmdSuggest.innerHTML = "";
    state.cmdSel = -1;
    state.suggestList = [];
  }

  els.composerText.addEventListener("keydown", (e) => {
    const suggOpen = !els.cmdSuggest.classList.contains("hidden");
    if (suggOpen && e.key === "Tab") {
      e.preventDefault();
      const top = state.suggestList && state.suggestList[Math.max(0, state.cmdSel)];
      if (top) setComposerCommand(top.name);
      return;
    }
    if (suggOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      const n = state.suggestList.length;
      state.cmdSel = e.key === "ArrowDown" ? (state.cmdSel + 1) % n : (state.cmdSel - 1 + n) % n;
      [...els.cmdSuggest.children].forEach((el, i) => el.classList.toggle("sel", i === state.cmdSel));
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      hideSuggestions();
      submitComposer();
    }
    if (e.key === "Escape" && suggOpen) {
      e.preventDefault();
      e.stopPropagation(); // don't let the global Esc handler stop the agent
      hideSuggestions();
    }
  });

  document.addEventListener("keydown", (e) => {
    const typingInField = ["TEXTAREA", "INPUT"].includes(document.activeElement?.tagName);
    if (e.key === "Escape") {
      if (!els.dlgHost.classList.contains("hidden")) {
        if (extDialog && extRespond) { extRespond({ cancelled: true }); }
        els.dlgHost.classList.add("hidden");
        els.dlgHost.innerHTML = "";
        extDialog = null;
        return;
      }
      if (state.busy && !typingInField) { stopAgent(); return; }
      if (typingInField && state.busy) { e.preventDefault(); stopAgent(); return; }
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submitComposer(); }
  });

  function stopAgent() {
    // terminal-style: clear queued messages, then abort
    piWS.rpc({ type: "clear_queue" });
    piWS.rpc({ type: "abort" });
    toast("Stopped", "Aborting current run…", "warn", 3000);
  }

  els.stopBtn.addEventListener("click", stopAgent);
  els.steerBtn.addEventListener("click", () => {
    openQueuedModal("steer");
  });

  let queuedDrafts = { steer: "", followUp: "" };
  function addQueued(kind, text) {
    queuedDrafts[kind] = text;
    renderQueue();
  }
  function renderQueue() {
    const parts = [];
    if (state.queue.steering) parts.push(`${state.queue.steering} steer`);
    if (state.queue.followUp) parts.push(`${state.queue.followUp} follow-up`);
    els.queueInfo.textContent = parts.length ? "queued: " + parts.join(", ") : "";
  }

  function openQueuedModal(kind) {
    const ta = Render.el("textarea", { rows: 4, textContent: queuedDrafts[kind] || "" });
    const ok = Render.el("button", { class: "btn primary", textContent: "Queue" });
    const cancel = Render.el("button", { class: "btn", textContent: "Cancel" });
    const dlg = openDialog(dialogShell(
      kind === "steer" ? "Steer (delivered when the current turn ends)" : "Follow-up (delivered when the agent settles)",
      ta, [cancel, ok]));
    ok.addEventListener("click", () => {
      const v = ta.value.trim();
      dlg.close();
      if (!v) return;
      addQueued(kind, v);
      piWS.rpc({ type: kind === "steer" ? "steer" : "follow_up", message: v });
    });
    cancel.addEventListener("click", () => dlg.close());
    setTimeout(() => ta.focus(), 0);
  }

  /* ============================================================ toolbar actions */
  els.btnStats.addEventListener("click", fetchStats);

  els.btnNew.addEventListener("click", () => {
    confirmDialog("New session", "Restart the agent with a fresh session in this workspace? (The on-screen history is kept.)", () => {
      piWS.send({ kind: "restart" });
      addSys("Starting a fresh agent session…", "warn");
    });
  });

  els.btnClear.addEventListener("click", () => {
    confirmDialog("Clear chat", "Remove the on-screen transcript (local history only — does not affect the agent session).", () => {
      transcript.length = 0;
      saveTranscript();
      rerenderAll();
      els.usageInfo.textContent = "";
    });
  });

  els.btnHelp.addEventListener("click", openHelp);
  els.btnLogs.addEventListener("click", openLogsDialog);
  els.btnSettings.addEventListener("click", openSettingsDialog);

  /* ============================================================ Logs dialog */
  function openLogsDialog() {
    const pre = Render.el("pre", { class: "logs-pre" });
    const refresh = () => {
      const client = D.all();
      pre.textContent = client.map((e) => `[${e.ts}] [${e.level}/${e.tag}] ${e.msg}`).join("\n") || "(no client log entries yet)";
    };
    refresh();

    const copy = Render.el("button", { class: "btn", textContent: "Copy" });
    const fetchSrv = Render.el("button", { class: "btn", textContent: "+ server log" });
    const clear = Render.el("button", { class: "btn", textContent: "Clear" });
    const close = Render.el("button", { class: "btn primary", textContent: "Close" });

    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent);
        toast("Logs", "Copied to clipboard", "success", 2000);
      } catch (e) {
        D.warn("logs", `clipboard: ${e}`);
      }
    });
    clear.addEventListener("click", () => { D.clear(); refresh(); });
    fetchSrv.addEventListener("click", async () => {
      try {
        const res = await fetch(`${piWS.httpBase()}/api/logs`, { cache: "no-store" });
        const data = await res.json();
        const srv = (data.entries || []).map((e) => `[${e.ts}] [srv/${e.tag}] ${e.msg}`).join("\n");
        pre.textContent = (pre.textContent ? pre.textContent + "\n\n——— server ———\n" : "") + (srv || "(server returned no entries)");
        toast("Logs", "Server log appended", "success", 2000);
      } catch (err) {
        toast("Logs", `Cannot fetch server log: ${err}. Server is on another origin?`, "warn", 5000);
      }
    });
    close.addEventListener("click", () => dlg.close());

    const body = Render.el("div", {}, [
      Render.el("p", { class: "small muted" }, "Client events (connection, commands, errors) — click “+ server log” to also pull the bridge server’s ring buffer from /api/logs."),
      pre,
    ]);
    const dlg = openDialog(dialogShell("Diagnostic log", body, [copy, fetchSrv, clear, close]));
    dlg.onCancel = () => {};
  }

  /* ============================================================ Server settings dialog */
  function openSettingsDialog() {
    const srvInput = Render.el("input", { type: "text", class: "txt", placeholder: "e.g. http://localhost:8787  (empty = this page)", value: piWS.getServerBase() });
    const tokInput = Render.el("input", { type: "password", class: "txt", placeholder: "access token (PI_PWA_TOKEN), if required", value: piWS.getToken() });
    const health = Render.el("div", { class: "small muted" });

    const save = Render.el("button", { class: "btn primary", textContent: "Save & reconnect" });
    const cancel = Render.el("button", { class: "btn", textContent: "Cancel" });
    const dlg = openDialog(dialogShell("Server connection", [
      Render.el("p", { class: "small muted" }, "Where is the pi-pwa-wrapper bridge server running? Useful when this page is hosted statically (e.g. on the portfolio) while the agent server runs elsewhere. Leave empty to use this page’s origin."),
      Render.el("label", { class: "lbl" }, ["Bridge server URL", srvInput]),
      Render.el("label", { class: "lbl" }, ["Token", tokInput]),
      Render.el("div", { class: "row-actions" }, [
        Render.el("button", { class: "btn ghost", textContent: "Check health" }),
        health,
      ]),
    ], [save, cancel]));

    const checkBtn = els.dlgHost.querySelector(".row-actions .btn");
    const check = async () => {
      const base = srvInput.value.trim();
      const target = (base ? base.replace(/^ws/i, "http") : location.origin).replace(/\/+$/, "");
      health.textContent = "checking " + target + "/healthz …";
      health.style.color = "";
      try {
        const res = await fetch(`${target}/healthz`, { cache: "no-store" });
        const j = await res.json();
        const piInfo = j.pi && (j.pi.command || "?");
        health.textContent = `✓ server ok — ${j.clients} client(s), pi=${piInfo}, root=${j.root}`;
        health.style.color = "var(--ok)";
      } catch (err) {
        health.textContent = `✗ no healthz reply from ${target} (${err}). Is the pi-pwa-wrapper server running there?`;
        health.style.color = "var(--err)";
      }
    };
    checkBtn.addEventListener("click", check);

    save.addEventListener("click", () => {
      piWS.setServerBase(srvInput.value.trim());
      piWS.setToken(tokInput.value.trim());
      dlg.close();
      state.connectFailHandled = false;
      piWS.retry();
    });
    cancel.addEventListener("click", () => dlg.close());
  }

  function openHelp() {
    const body = Render.el("div", {}, [
      Render.el("p", {}, "This PWA shells the Pi coding agent: the server spawns `pi --mode rpc` per browser and streams events over WebSocket. The agent can read files, run bash, and edit files — inside the selected workspace, on this machine."),
      Render.el("h3", { style: "margin-top:12px" }, "Tips"),
      Render.el("ul", {}, [
        Render.el("li", {}, "Choose a workspace to scope where the agent works."),
        Render.el("li", {}, "While the agent is busy, Enter queues a steer; Esc stops it."),
        Render.el("li", {}, "Attach images with 🖼️ — they are sent to the model."),
        Render.el("li", {}, "Extensions can ask for input: select / confirm / input / editor appear as dialogs; notify / status / widgets appear as toasts and widgets."),
        Render.el("li", {}, "Install as an app from the browser menu for a standalone window."),
      ]),
      Render.el("h3", { style: "margin-top:12px" }, "Keyboard"),
      Render.el("ul", {}, [
        Render.el("li", {}, "Enter — send · Shift+Enter — newline · Esc — stop / close dialog · ⌘/Ctrl+Enter — send"),
      ]),
      Render.el("h3", { style: "margin-top:12px" }, "Security"),
      Render.el("p", {}, "The agent executes shell commands with your user account inside the selected workspace. Run the server on a trusted machine and set PI_PWA_TOKEN when exposing it to a network."),
    ]);
    const close = Render.el("button", { class: "btn", textContent: "Close" });
    const dlg = openDialog(dialogShell("About Pi Agent PWA", body, [close]));
    close.addEventListener("click", () => dlg.close());
  }

  /* ============================================================ workspaces */
  function populateWorkspaces(entries) {
    const sel = els.wsSelect;
    const prev = sel.value || localStorage.getItem(LS_WS) || "";
    sel.innerHTML = "";
    for (const e of entries) {
      sel.append(Render.el("option", { value: e.path, textContent: (e.isRoot ? "⌂ " : "") + e.name + "  ·  " + e.path }));
    }
    if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
    else if (sel.options.length) sel.value = sel.options[0].value;
    updateCwdLabel();
  }

  function updateCwdLabel() {
    const v = els.wsSelect.value;
    if (!v) { els.cwdLabel.textContent = ""; return; }
    const name = els.wsSelect.selectedOptions[0]?.textContent.split("  ·  ")[0] || "";
    els.cwdLabel.textContent = `agent runs in: ${name}`;
  }

  els.wsSelect.addEventListener("change", () => {
    const path = els.wsSelect.value;
    if (!path) return;
    try { localStorage.setItem(LS_WS, path); } catch {}
    piWS.send({ kind: "set_workspace", path });
    updateCwdLabel();
    setPhase("starting", "switching workspace…");
  });

  /* ============================================================ wire server messages */
  function wireServer() {
    piWS.on("state", (s) => {
      if (s === "open") { setConn(true); D.log("conn", "ws open"); }
      if (s === "closed") { setConn(false); D.log("conn", "ws closed"); }
    });

    piWS.on("kind:hello", () => {
      setConn(true);
      D.log("conn", "hello from bridge server");
      piWS.rpc({ type: "get_state" });
      piWS.rpc({ type: "get_available_models" });
      piWS.rpc({ type: "get_available_thinking_levels" });
      piWS.rpc({ type: "get_commands" });
    });

    piWS.on("kind:agent_event", (m) => handleAgentEvent(m.event));

    piWS.on("kind:agent_stderr", (m) => {
      console.warn("[pi stderr]", m.text);
    });

    piWS.on("kind:status", (m) => {
      const p = m.payload || {};
      if (p.phase === "running") {
        setPhase("running");
        D.log("agent", `ready (cwd ${p.cwd})`);
        // refresh session state after any restart
        piWS.rpc({ type: "get_state" });
        piWS.rpc({ type: "get_available_models" });
        piWS.rpc({ type: "get_available_thinking_levels" });
        piWS.rpc({ type: "get_commands" });
        els.usageInfo.textContent = "";
      } else if (p.phase === "starting") { setPhase("starting"); D.log("agent", "starting…"); }
      else if (p.phase === "exited") setPhase("exited", p.code != null ? `exited (${p.code})` : "exited");
      else if (p.phase === "failed") { setPhase("failed", "start failed"); addSys(`Agent failed to start: ${p.error || ""}`, "error"); }
    });

    piWS.on("kind:workspaces", (m) => populateWorkspaces(m.entries || []));

    piWS.on("kind:error", (m) => {
      if (/Outside workspace root/.test(m.message)) {
        addSys(m.message, "error");
      } else if (/not running/.test(m.message)) {
        addSys(m.message, "error");
      } else {
        toast("Server", m.message, "error");
      }
    });

    piWS.on("connect_failed", (info) => {
      if (state.connectFailHandled) return;
      state.connectFailHandled = true;
      setConn(false);
      D.error("conn", `connect failed after retries code=${info && info.code}`);
      toast("Not connected", "No pi-pwa bridge server reachable at this address.", "error", 9000);
      addSys("Could not connect to the bridge server. If this page is hosted statically, point the wrapper at the running server with the “Server” button or /server (e.g. http://localhost:8787). Start it with npm install && npm start in the pi-pwa-wrapper folder. Logs: /logs.", "error");
    });

    // clicking the connection pill retries the WebSocket
    els.connPill.classList.add("clickable");
    els.connPill.title = "Reconnect to the bridge server";
    els.connPill.addEventListener("click", () => {
      state.connectFailHandled = false;
      D.log("conn", "manual reconnect (pill click)");
      piWS.retry();
    });
  }

  /* ============================================================ extension UI glue */
  // (handled inside handleAgentEvent via extension_ui_request)

  /* ============================================================ model/thinking wiring */
  els.modelSelect.addEventListener("change", () => {
    const v = els.modelSelect.value;
    if (!v) return;
    const i = v.lastIndexOf("/");
    const provider = v.slice(0, i), modelId = v.slice(i + 1);
    if (state.busy) {
      toast("Model", "Agent is busy — switch will apply to the next turn.", "warn");
    }
    piWS.rpc({ type: "set_model", provider, modelId });
    piWS.rpc({ type: "set_thinking_level", level: state.thinking || "medium" });
  });

  els.thinkSelect.addEventListener("change", () => {
    const v = els.thinkSelect.value;
    if (!v) return;
    state.thinking = v;
    piWS.rpc({ type: "set_thinking_level", level: v });
  });

  /* ============================================================ PWA extras */
  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => console.warn("SW register failed", err));
    });
  }

  function wireInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      state.deferredInstall = e;
      const banner = Render.el("div", { class: "toast install-toast" }, [
        Render.el("span", {}, "Install Pi Agent PWA for a standalone window"),
        Render.el("button", { class: "btn primary small-btn", textContent: "Install" }),
      ]);
      els.toasts.append(banner);
      banner.querySelector("button").addEventListener("click", async () => {
        state.deferredInstall.prompt();
        await state.deferredInstall.userChoice;
        state.deferredInstall = null;
        banner.remove();
      });
    });
  }

  /* ============================================================ init */
  function boot() {
    // token from query string
    wireInstallPrompt();
    registerSW();
    wireServer();

    // persist workspace selection across reloads
    rerenderAll();

    piWS.on("open", () => {
      state.connectFailHandled = false;
      // server starts the agent automatically on connect; if we reconnected
      // mid-run, clean up the stale live bubble (the agent restarted fresh)
      if (state.live) {
        state.live.root?.remove();
        state.live = null;
        state.pendingMsgs = [];
        setBusy(false);
        addSys("Connection restored — the agent restarted with a fresh session.", "warn");
      }
    });

    // server tells us hello/status/workspaces right after connect
    piWS.connect();

    // autosize placeholder
    autosize();
    els.composerText.focus();
  }

  // light: keep default select values if nothing configured
  document.addEventListener("DOMContentLoaded", boot);
})();
