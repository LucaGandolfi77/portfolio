(function () {
  "use strict";

  var BASE = "http://cello.94";
  var STORAGE_HISTORY = "cello.browser.history";
  var STORAGE_BOOKMARKS = "cello.browser.bookmarks";
  var STORAGE_COUNT = "cello.browser.pageCount";
  var SOUND_ENABLED_KEY = "cello.browser.sound";

  var $ = function (id) { return document.getElementById(id); };

  var elTitle = $("title-text");
  var elLocation = $("location-input");
  var elContent = $("page");
  var elStatusAddr = $("status-addr");
  var elStatusState = $("status-state");
  var elStatusProgressWrap = $("status-progress-wrap");
  var elStatusProgress = $("status-progress");
  var elStatusPagecount = $("status-pagecount");
  var elModal = $("modal-live");
  var elLiveUrl = $("live-url");
  var elLiveResult = $("live-result");
  var elToast = $("toast");
  var elBtnClose = $("btn-close");

  var history = [];
  var historyIdx = -1;
  var pageCount = 0;
  var loading = false;
  var soundEnabled = false;
  var audioCtx = null;

  function getBookmarks() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_BOOKMARKS) || "[]")); } catch (e) { return new Set(); }
  }
  function saveBookmarks(set) {
    try { localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify([...set])); } catch (e) {}
  }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "null") || []; } catch (e) { return []; }
  }
  function saveHistory() {
    try { localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history.slice(-50))); } catch (e) {}
  }

  function findPage(path) {
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].url === path) return PAGES[i];
    }
    return null;
  }

  function resolveHref(base, href) {
    if (!href) return base;
    var hash = "";
    var h = href.indexOf("#");
    if (h !== -1) { hash = href.slice(h); href = href.slice(0, h); }
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("cello://")) return href + hash;
    if (href.startsWith("/")) return href + hash;
    var baseDir = base.replace(/\/[^/]*$/, "") + "/";
    return baseDir + href + hash;
  }

  function safeAttr(val) {
    if (!val) return "";
    return String(val).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]); });
  }

  function renderNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();

    var tag = node.tagName.toLowerCase();
    var disallowed = ["script", "style", "iframe", "object", "embed", "applet", "form", "input", "textarea", "select", "button", "canvas", "svg", "math", "noscript", "template", "link", "meta", "base"];
    if (disallowed.indexOf(tag) !== -1) {
      var frag = document.createDocumentFragment();
      node.childNodes.forEach(function (c) { frag.appendChild(renderNode(c)); });
      return frag;
    }

    if (tag === "img") {
      var box = document.createElement("div");
      box.className = "broken-image";
      var alt = node.getAttribute("alt") || "";
      box.textContent = "[IMAGE: " + alt + "]";
      return box;
    }

    if (tag === "blink") {
      var span = document.createElement("span");
      span.className = "blink";
      node.childNodes.forEach(function (c) { span.appendChild(renderNode(c)); });
      return span;
    }

    var allowedTags = ["html", "head", "body", "title", "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "a", "b", "i", "em", "strong", "u", "s", "sub", "sup", "ul", "ol", "li", "pre", "blockquote", "div", "span", "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col", "dl", "dt", "dd", "abbr", "cite", "code", "q", "samp", "var", "figure", "figcaption", "details", "summary", "section", "article", "header", "footer", "nav", "main"];

    if (allowedTags.indexOf(tag) === -1) {
      var frag = document.createDocumentFragment();
      node.childNodes.forEach(function (c) { frag.appendChild(renderNode(c)); });
      return frag;
    }

    var el = document.createElement(tag);
    var attrs = node.attributes;
    for (var a = 0; a < attrs.length; a++) {
      var name = attrs[a].name.toLowerCase();
      var value = attrs[a].value;
      if (name === "href" && tag === "a") {
        el.setAttribute("href", resolveHref(history.length ? history[historyIdx].url : "/", value));
      } else if (name === "src") {
        /* ignore images — handled above */
      } else if (name === "alt" && tag === "img") {
        /* ignored, handled in img branch */
      } else if (name === "title" || name === "alt" || name === "border" || name === "cellpadding" || name === "cellspacing" || name === "colspan" || name === "rowspan" || name === "width" || name === "height" || name === "color" || name === "size" || name === "face" || name === "bgcolor" || name === "align" || name === "valign" || name === "nowrap" || name === "class" || name === "id") {
        el.setAttribute(name, safeAttr(value));
      } else if (/^on/.test(name)) {
        /* ignore events */
      }
    }
    if (tag === "a" && !el.hasAttribute("href")) el.setAttribute("href", "#");
    node.childNodes.forEach(function (c) { el.appendChild(renderNode(c)); });
    return el;
  }

  function renderPage(page) {
    elContent.innerHTML = "";
    var parser = new DOMParser();
    var doc = parser.parseFromString(page.html, "text/html");
    doc.body.childNodes.forEach(function (c) { elContent.appendChild(renderNode(c)); });
  }

  function setStatus(state, addr, mode) {
    elStatusState.textContent = state || "";
    if (mode === "set") { elStatusAddr.textContent = addr; }
    else if (mode === "live") { elStatusAddr.textContent = addr + " (Live)"; }
    else { /* keep */ }
    elStatusPagecount.textContent = pageCount + " pagine";
  }

  function setProgress(pct) {
    if (pct === null) { elStatusProgressWrap.classList.add("hidden"); return; }
    elStatusProgressWrap.classList.remove("hidden");
    elStatusProgress.style.width = pct + "%";
  }

  function showToast(msg) {
    elToast.textContent = msg;
    elToast.classList.remove("hidden");
    clearTimeout(elToast._t);
    elToast._t = setTimeout(function () { elToast.classList.add("hidden"); }, 2400);
  }

  function toggleFavorite() {
    var url = history.length ? history[historyIdx].url : "/";
    var set = getBookmarks();
    if (set.has(url)) { set.delete(url); saveBookmarks(set); showToast("Rimosso dai Preferiti"); }
    else { set.add(url); saveBookmarks(set); showToast("Aggiunto ai Preferiti"); }
    updateFavoriteBtn();
  }

  function updateFavoriteBtn() {
    var url = history.length ? history[historyIdx].url : "/";
    var set = getBookmarks();
    var btn = $("btn-fav");
    if (btn) btn.textContent = set.has(url) ? "★" : "☆";
  }

  function startLoading() {
    loading = true;
    elStatusProgressWrap.classList.remove("hidden");
    elStatusProgress.style.width = "0%";
    elStatusState.textContent = "Connessione…";
  }

  function setProgressValue(pct) {
    elStatusProgress.style.width = pct + "%";
  }

  function doneLoading() {
    loading = false;
    elStatusProgressWrap.classList.add("hidden");
    elStatusState.textContent = "Done";
  }

  function playModemSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "square";
      gain.gain.value = 0.08;
      osc.connect(gain); gain.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.setValueAtTime(2200, t + 0.1);
      osc.frequency.setValueAtTime(1200, t + 0.2);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    } catch (e) {}
  }

  function navigate(path, opts) {
    opts = opts || {};
    var page = findPage(path);
    if (!page) {
      var p404 = findPage("/404");
      if (!p404) return;
      page = p404;
    }
    if (!opts.replace) {
      if (historyIdx < history.length - 1) history = history.slice(0, historyIdx + 1);
      history.push({ url: path, title: page.title });
      historyIdx = history.length - 1;
      saveHistory();
      pageCount++;
      try { localStorage.setItem(STORAGE_COUNT, String(pageCount)); } catch (e) {}
    }
    elTitle.textContent = page.title;
    renderPage(page);
    setStatus("Done", page.url, "set");
    updateFavoriteBtn();
    playModemSound();
    if (opts.load) { startLoading(); var i = 0; var iv = setInterval(function () { i = Math.min(i + 8 + Math.floor(Math.random() * 12), 90); setProgressValue(i); }, 120); setTimeout(function () { clearInterval(iv); setProgressValue(100); setTimeout(doneLoading, 200); }, 300 + Math.random() * 400); }
    elLocation.value = page.url;
    elContent.scrollTop = 0;
  }

  function goBack() { if (historyIdx > 0) { historyIdx--; var p = findPage(history[historyIdx].url); if (p) { elTitle.textContent = p.title; renderPage(p); setStatus("Done", p.url, "set"); updateFavoriteBtn(); } elLocation.value = history[historyIdx].url; } }
  function goForward() { if (historyIdx < history.length - 1) { historyIdx++; var p = findPage(history[historyIdx].url); if (p) { elTitle.textContent = p.title; renderPage(p); setStatus("Done", p.url, "set"); updateFavoriteBtn(); } elLocation.value = history[historyIdx].url; } }

  function goToLocation() {
    var raw = elLocation.value.trim();
    if (!raw) return;
    var url = raw;
    if (!/^https?:\/\//i.test(raw) && !raw.includes(":")) url = "http://" + raw;
    var path = null;
    for (var i = 0; i < PAGES.length; i++) {
      if (PAGES[i].url === raw || PAGES[i].url === url.replace(/^https?:\/\/[^\/]+/, "").replace(/\/$/, "") || url.indexOf(PAGES[i].url) !== -1) { path = PAGES[i].url; break; }
    }
    if (path) { navigate(path, { load: true }); return; }
    modemLive(url);
  }

  function modemLive(url) {
    var result = elLiveResult;
    result.innerHTML = '<p>🛰️ Connessione in corso…</p>';
    elModal.classList.remove("hidden");
    elLiveUrl.value = url;
    startLoading();
    playModemSound();
    var t = setTimeout(function () {
      elStatusState.textContent = "Busy signal…";
      fetch("https://r.jina.ai/" + encodeURIComponent(url), { signal: AbortSignal && AbortSignal.timeout ? AbortSignal.timeout(8000) : void 0 }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (md) {
        setProgressValue(100);
        doneLoading();
        result.innerHTML = '<div class="page">' + mdToHtml(md) + '</div>';
        var title = "Live: " + url;
        if (historyIdx < history.length - 1) history = history.slice(0, historyIdx + 1);
        history.push({ url: url, title: title });
        historyIdx = history.length - 1;
        saveHistory();
        elTitle.textContent = title;
        elStatusAddr.textContent = url + " (Live)";
        elStatusState.textContent = "Done";
        elContent.scrollTop = 0;
        showToast("Connesso via modem!");
      }).catch(function (err) {
        setProgressValue(0);
        doneLoading();
        result.innerHTML = '<div class="page"><h1>No answer.</h1><p><b>Busy signal.</b> The line is engaged or the host is unreachable.</p><p>Your 28.8 kbps modem could not reach <code>' + safeAttr(url) + '</code>. Try again later, or stay in the 1994 web.</p><p><a href="/">Home</a></p></div>';
        showToast("Connessione fallita.");
      });
    }, 400 + Math.random() * 300);
  }

  function mdToHtml(md) {
    var s = safeAttr(md);
    var lines = s.split("\n");
    var out = [];
    var inList = false;
    function inline(str) {
      str = str.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      str = str.replace(/\*(.+?)\*/g, "<em>$1</em>");
      str = str.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
      str = str.replace(/!\[(.+?)\]\((.+?)\)/g, '<div class="broken-image">[IMAGE: $1]</div>');
      return str;
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (/^#{1,6}\s/.test(line)) {
        if (inList) { out.push("</ul>"); inList = false; }
        var level = line.match(/^#{1,6}/)[0].length;
        var text = inline(line.slice(level + 1));
        out.push("<h" + level + ">" + text + "</h" + level + ">");
      } else if (/^- /.test(line)) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + inline(line.slice(2)) + "</li>");
      } else if (line.trim() === "") {
        if (inList) { out.push("</ul>"); inList = false; }
        out.push("<br>");
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        out.push("<p>" + inline(line) + "</p>");
      }
    }
    if (inList) out.push("</ul>");
    return out.join("");
  }

  function closeModal() {
    elModal.classList.add("hidden");
    elLiveResult.innerHTML = "";
    setProgressValue(null);
  }

  function init() {
    try { pageCount = parseInt(localStorage.getItem(STORAGE_COUNT), 10) || 0; } catch (e) { pageCount = 0; }
    history = getHistory();
    if (history.length) { historyIdx = history.length - 1; } else {
      history = [{ url: "/", title: "Welcome to the World-Wide Web!" }];
      historyIdx = 0;
    }
    var start = findPage(history[historyIdx].url) ? history[historyIdx].url : "/";
    elLocation.value = start;
    setProgressValue(null);
    elStatusPagecount.textContent = pageCount + " pagine";
    elBtnClose.addEventListener("click", closeModal);
    $("btn-home").addEventListener("click", function () { navigate("/", { load: true }); });
    $("btn-back").addEventListener("click", goBack);
    $("btn-fwd").addEventListener("click", goForward);
    $("btn-reload").addEventListener("click", function () { navigate(history[historyIdx].url, { load: true }); });
    $("btn-live").addEventListener("click", function () { elModal.classList.remove("hidden"); elLiveUrl.focus(); });
    $("btn-go").addEventListener("click", goToLocation);
    $("btn-fav").addEventListener("click", toggleFavorite);
    elLocation.addEventListener("keydown", function (e) { if (e.key === "Enter") goToLocation(); });
    $("live-go").addEventListener("click", function () { var u = elLiveUrl.value.trim(); if (u) modemLive(u); });
    elLiveUrl.addEventListener("keydown", function (e) { if (e.key === "Enter") { var u = elLiveUrl.value.trim(); if (u) modemLive(u); } });
    $("live-close").addEventListener("click", closeModal);
    elModal.addEventListener("click", function (e) { if (e.target === elModal) closeModal(); });
    $("mob-back").addEventListener("click", goBack);
    $("mob-fwd").addEventListener("click", goForward);
    $("mob-home").addEventListener("click", function () { navigate("/", { load: true }); });
    $("mob-live").addEventListener("click", function () { elModal.classList.remove("hidden"); elLiveUrl.focus(); });
    if (history.length) navigate(history[historyIdx].url, { load: false, replace: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}(window));