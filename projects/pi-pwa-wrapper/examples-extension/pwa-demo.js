/**
 * pwa-demo.js — example extension that exercises the PWA wrapper's UI surfaces.
 *
 * Load it by restarting the wrapper server with, e.g.:
 *
 *   PI_ARGS="--extension $(pwd)/examples-extension/pwa-demo.js" npm start
 *
 * Then send these messages in the chat:
 *   /pwa-ping  /pwa-select  /pwa-confirm  /pwa-input  /pwa-editor  /pwa-widget
 *
 * It also gates dangerous bash commands (`rm -rf`, `sudo`) behind a select dialog.
 * Plain JS on purpose: loads from any folder without ambient type resolution.
 *
 * @param {import("@earendil-works/pi-coding-agent").ExtensionAPI} pi
 */
export default function (pi) {
  // ---- on session start: widgets / status / title (all fire-and-forget) ----
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.setTitle("Pi PWA — demo extension");
    ctx.ui.setWidget("pwa-demo", ["--- pwa-demo extension ---", "Try /pwa-select, /pwa-confirm, /pwa-input, /pwa-editor, /pwa-widget"]);
    ctx.ui.setStatus("pwa-demo", "ready");
  });

  // ---- notify ----
  pi.registerCommand("pwa-ping", {
    description: "Show a notification toast",
    handler: async (_args, ctx) => {
      ctx.ui.notify("pwa-demo is loaded", "info");
    },
  });

  // ---- select ----
  pi.registerCommand("pwa-select", {
    description: "Ask the user to pick an option",
    handler: async (_args, ctx) => {
      const choice = await ctx.ui.select("Choose a color", ["Red", "Green", "Blue", "Yellow"]);
      if (choice) ctx.ui.notify(`You picked ${choice}`, "info");
      else ctx.ui.notify("Selection cancelled", "warning");
    },
  });

  // ---- confirm ----
  pi.registerCommand("pwa-confirm", {
    description: "Ask a yes/no question",
    handler: async (_args, ctx) => {
      const ok = await ctx.ui.confirm("Continue?", "This demonstrates a confirm dialog.");
      ctx.ui.notify(ok ? "Confirmed" : "Declined", ok ? "info" : "warning");
    },
  });

  // ---- input ----
  pi.registerCommand("pwa-input", {
    description: "Ask for free-form text",
    handler: async (_args, ctx) => {
      const value = await ctx.ui.input("Project name", "type something…");
      if (value) ctx.ui.notify(`You entered: ${value}`, "info");
      else ctx.ui.notify("Input cancelled", "warning");
    },
  });

  // ---- editor ----
  pi.registerCommand("pwa-editor", {
    description: "Open a multiline editor",
    handler: async (_args, ctx) => {
      const text = await ctx.ui.editor("Edit release notes", "## Release\n\n- [ ] changelog\n");
      if (text) ctx.ui.notify(`Editor submitted (${text.split("\n").length} lines)`, "info");
      else ctx.ui.notify("Editor cancelled", "warning");
    },
  });

  // ---- widget toggle ----
  let widgetOn = true;
  pi.registerCommand("pwa-widget", {
    description: "Toggle a persistent widget card",
    handler: async (_args, ctx) => {
      widgetOn = !widgetOn;
      ctx.ui.setWidget("pwa-demo", widgetOn ? ["--- pwa-demo extension ---", "Widget is ON — this card persists until cleared."] : undefined);
      ctx.ui.notify(widgetOn ? "Widget shown" : "Widget hidden", "info");
    },
  });

  // ---- dangerous bash gate (select) ----
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "bash") return undefined;
    const command = String(event.input && event.input.command ? event.input.command : "");
    const dangerous = /\brm\s+(-rf?|--recursive|-[a-z]*r[a-z]*f)/.test(command) || /\bsudo\b/.test(command);
    if (!dangerous) return undefined;
    if (!ctx.hasUI) return { block: true, reason: "Dangerous command blocked (no UI available)" };

    const choice = await ctx.ui.select(`Allow dangerous command?\n${command}`, ["Allow", "Block"]);
    if (choice !== "Allow") {
      ctx.ui.notify("Dangerous command blocked by user", "warning");
      return { block: true, reason: "Blocked by user" };
    }
    return undefined;
  });
}
