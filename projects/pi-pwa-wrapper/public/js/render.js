/* render.js — DOM builders + a small safe markdown renderer for the transcript. */
(function () {
  "use strict";

  const R = {};

  /* ---------- element helpers ---------- */

  R.el = function (tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "dataset") Object.assign(node.dataset, v);
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (k === "value") node.value = v;
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    if (children !== undefined && children !== null) R.append(node, children);
    return node;
  };

  R.append = function (node, children) {
    const list = Array.isArray(children) ? children : [children];
    for (const c of list) {
      if (c === null || c === undefined || c === false) continue;
      if (typeof c === "string" || typeof c === "number") node.append(document.createTextNode(String(c)));
      else node.append(c);
    }
  };

  R.esc = function (s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  };

  /* ---------- markdown-lite ---------- */

  // turn *already HTML-escaped* text into markdown-ish HTML
  R.md = function (escapedText) {
    const lines = String(escapedText).split("\n");
    const out = [];
    let i = 0;

    const inline = (s) => {
      let t = s;
      t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
      t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
      // italic: *x* or _x_ but not inside words when wrapped by * _
      t = t.replace(/(^|[^*])\*([^*\n]+)\*(?![^*])/g, "$1<em>$2</em>");
      t = t.replace(/(^|[^_])_([^_\n]+)_(?![^_])/g, "$1<em>$2</em>");
      t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");
      t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      t = t.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" referrerpolicy="no-referrer" />');
      return t;
    };

    const open = (tag, cls) => out.push(`<${tag}${cls ? ` class="${cls}"` : ""}>`);
    const close = (tag) => out.push(`</${tag}>`);

    while (i < lines.length) {
      const line = lines[i];

      // fenced code — md() input is pre-escaped, so emit lines as-is
      const fence = line.match(/^```(.*)$/);
      if (fence) {
        const lang = fence[1].trim();
        i++;
        const buf = [];
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // skip closing fence
        out.push(`<pre><code${lang ? ` class="lang-${lang}"` : ""}>${buf.join("\n")}</code></pre>`);
        continue;
      }

      if (/^\s*$/.test(line)) { i++; continue; } // blank

      // headings
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        const level = h[1].length;
        out.push(`<h${level}>${inline(h[2])}</h${level}>`);
        i++;
        continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { out.push("<hr />"); i++; continue; }

      // blockquote
      if (/^\s*&gt;\s?/.test(line) || /^\s*>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && (/^\s*(&gt;|>)\s?/.test(lines[i]) || lines[i].trim() === "")) {
          if (lines[i].trim() !== "") buf.push(lines[i].replace(/^\s*(&gt;|>)\s?/, ""));
          else if (buf.length && buf[buf.length - 1] !== "") buf.push("");
          i++;
        }
        out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
        continue;
      }

      // lists
      const ul = line.match(/^\s*[-*+]\s+(.*)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        const ordered = !!ol;
        open(ordered ? "ol" : "ul");
        while (i < lines.length) {
          const m = lines[i].match(ordered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*+]\s+(.*)$/);
          if (!m) break;
          out.push(`<li>${inline(m[1])}</li>`);
          i++;
        }
        close(ordered ? "ol" : "ul");
        continue;
      }

      // paragraph: gather until blank / special
      open("p");
      let para = [];
      while (i < lines.length) {
        const l = lines[i];
        if (/^\s*$/.test(l)) break;
        if (/^```/.test(l)) break;
        if (/^(#{1,4})\s+/.test(l)) break;
        if (/^\s*[-*+]\s+/.test(l)) break;
        if (/^\s*\d+[.)]\s+/.test(l)) break;
        para.push(l);
        i++;
      }
      out.push(inline(para.join("<br />")));
      close("p");
    }
    return out.join("");
  };

  /* ---------- block model -> DOM ---------- */

  R.summarizeArgs = function (toolName, args) {
    if (!args) return "";
    const short = (s, n) => (s.length > n ? s.slice(0, n) + "…" : s);
    if (toolName === "bash" && args.command) return short(String(args.command).replace(/\s+/g, " "), 160);
    if (["read", "write", "edit", "grep", "ls"].includes(toolName) && args.file_path) return short(args.file_path, 140);
    if (toolName === "bash" && args.commands) return short(String(args.commands).replace(/\s+/g, " "), 160);
    try {
      return short(JSON.stringify(args), 160);
    } catch {
      return "";
    }
  };

  R.resultText = function (result) {
    if (!result) return "";
    const parts = [];
    const content = result.content;
    if (Array.isArray(content)) {
      for (const c of content) {
        if (c && c.type === "text" && c.text) parts.push(c.text);
      }
    } else if (typeof content === "string") parts.push(content);
    let txt = parts.join("\n");
    const det = result.details || {};
    if (det.truncation && det.fullOutputPath) txt += `\n… (output truncated — full result: ${det.fullOutputPath})`;
    return txt;
  };

  function toolCard(block) {
    const head = R.el("div", { class: "tool-head" }, [
      R.el("span", { class: "tool-name" }, block.name),
      R.el("span", { class: "tool-args" }, block.argsSummary || R.summarizeArgs(block.name, block.args)),
      R.el("span", { class: "caret" }, "▶"),
    ]);
    const resultEl = R.el("div", {
      class: "tool-result" + (block.isError ? " err" : ""),
      textContent: block.resultText || "(no output)",
    });
    const card = R.el("div", { class: "tool-card" }, [head, resultEl]);
    head.addEventListener("click", () => card.classList.toggle("open"));
    if (block.isError) card.classList.add("open");
    return card;
  }

  /** blocks: [{type:'thinking'|'text'|'tool', ...}] -> DocumentFragment */
  R.blocksToDom = function (blocks, opts = {}) {
    const frag = document.createDocumentFragment();
    const thinkEls = [];
    for (const b of blocks) {
      if (b.type === "text") {
        if (!b.text) continue;
        const div = R.el("div", { class: "md" });
        div.innerHTML = R.md(R.esc(b.text));
        frag.append(div);
      } else if (b.type === "thinking") {
        if (!b.text) continue;
        const btn = R.el("button", { class: "think-toggle" }, ["▶ Thinking"]);
        const body = R.el("div", { class: "think-body hidden", textContent: b.text });
        btn.addEventListener("click", () => {
          const closed = body.classList.toggle("hidden");
          btn.firstChild.textContent = closed ? "▶ Thinking" : "▼ Thinking";
        });
        const wrap = R.el("div", {}, [btn, body]);
        thinkEls.push(wrap);
        frag.append(wrap);
      } else if (b.type === "tool") {
        frag.append(toolCard(b));
      }
    }
    // thinking blocks first if requested (they usually precede text anyway)
    if (opts.thinkingFirst && thinkEls.length) {
      for (const t of thinkEls) frag.prepend(t);
    }
    return frag;
  };

  R.userBubble = function (text, images) {
    const imgs = (images || []).filter((im) => im && im.dataUrl);
    const children = [];
    if (text) children.push(document.createTextNode(text));
    if (imgs.length) {
      const wrap = R.el("div", { class: "imgs" });
      for (const im of imgs) wrap.append(R.el("img", { src: im.dataUrl, alt: im.name || "attachment", title: im.name || "" }));
      children.push(wrap);
    }
    const bubble = R.el("div", { class: "bubble" }, children);
    return R.el("div", { class: "msg msg-user" }, [bubble]);
  };

  R.agentBubble = function () {
    const bubble = R.el("div", { class: "bubble agent-running" });
    const msg = R.el("div", { class: "msg msg-agent", dataset: { running: "1" } }, [bubble]);
    return { root: msg, bubble };
  };

  R.sysBubble = function (text, kind) {
    return R.el("div", { class: `msg msg-sys ${kind || ""}` }, [R.el("div", { class: "bubble" }, text)]);
  };

  R.liveTextEl = function () {
    return R.el("div", { class: "md live", style: "white-space:pre-wrap" });
  };

  window.Render = R;
})();
