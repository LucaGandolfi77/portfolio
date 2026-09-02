/* ═══════════════════════════════════════════════════
   Book Writer v2.0 — Application Logic
   Home screen · FAQ modal · Mobile nav · Stats
   ═══════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── Localization ──────────────────────────────
  const LOCALES = {
    English: {
      generate: "Generate 5 Ideas",
      write: "Write Selected Chapter",
      options: "Writing Options",
      auto: "Auto Finish",
      loadJson: "Load books.json",
      export: "Export Book (.txt)",
      books: "Books",
      context: "Book Context",
      ideas: "Generated Ideas",
      log: "Log / Preview",
      promptExtras: "Prompt Extras (optional)",
      ideasPlaceholder: "Ideas will appear here after generation.",
      optionsTitle: "Writing Options",
      optDialogue: "Include dialogue",
      optSensory: "Sensory detail",
      optMetaphor: "Allow metaphor",
      optMonologue: "Interior monologue",
      cancel: "Cancel",
      save: "Save",
      close: "Close",
      delete: "Delete",
      addBook: "Add Book",
      editBook: "Edit Book",
      selectBook: "Select or add a book to begin.",
      noIdea: "Choose one of the 5 ideas first.",
      ready: "Ready.",
      generating: "Generating ideas…",
      writing: "Writing chapter…",
      autoMode: "Auto mode: chapter",
      done: "Done.",
      error: "Error",
      bookAdded: "Book added.",
      bookDeleted: "Book deleted.",
      exported: "Book exported.",
      ideasReady: "Ideas generated — choose one and write the chapter.",
      chapterDone: "Chapter {n} completed.",
      bookFinished: "Book finished: {title}",
    },
    Italian: {
      generate: "Genera 5 idee",
      write: "Scrivi capitolo selezionato",
      options: "Opzioni di scrittura",
      auto: "Completa automatico",
      loadJson: "Carica books.json",
      export: "Esporta libro (.txt)",
      books: "Libri",
      context: "Contesto del libro",
      ideas: "Idee generate",
      log: "Log / Anteprima",
      promptExtras: "Istruzioni extra (opzionale)",
      ideasPlaceholder: "Le idee appariranno qui dopo la generazione.",
      optionsTitle: "Opzioni di scrittura",
      optDialogue: "Includi dialoghi",
      optSensory: "Dettagli sensoriali",
      optMetaphor: "Consenti metafore",
      optMonologue: "Monologo interiore",
      cancel: "Annulla",
      save: "Salva",
      close: "Chiudi",
      delete: "Elimina",
      addBook: "Aggiungi libro",
      editBook: "Modifica libro",
      selectBook: "Seleziona o aggiungi un libro per iniziare.",
      noIdea: "Scegli prima una delle 5 idee.",
      ready: "Pronto.",
      generating: "Generazione idee…",
      writing: "Scrittura capitolo…",
      autoMode: "Auto: capitolo",
      done: "Finito.",
      error: "Errore",
      bookAdded: "Libro aggiunto.",
      bookDeleted: "Libro eliminato.",
      exported: "Libro esportato.",
      ideasReady: "Idee generate — scegline una e scrivi il capitolo.",
      chapterDone: "Capitolo {n} completato.",
      bookFinished: "Libro finito: {title}",
    },
  };

  let uiLang = "English";
  function t(key) {
    return (LOCALES[uiLang] || LOCALES.English)[key] || key;
  }
  function applyLang() {
    document.querySelectorAll("[data-t]").forEach((el) => {
      const k = el.getAttribute("data-t");
      if (LOCALES[uiLang] && LOCALES[uiLang][k]) el.textContent = LOCALES[uiLang][k];
    });
    const langBtn = document.getElementById("btnLang");
    if (langBtn) langBtn.textContent = "🌐 " + (uiLang === "English" ? "EN" : "IT");
    const homeBtn = document.getElementById("btnLangHome");
    if (homeBtn) homeBtn.textContent = uiLang === "English" ? "EN" : "IT";
    // update ideas placeholder
    const ph = document.getElementById("ideasGrid");
    if (ph && ph.children.length === 1 && ph.children[0].hasAttribute("data-t")) {
      ph.children[0].textContent = t("ideasPlaceholder");
    }
  }

  // ─── State ─────────────────────────────────────
  let books = [];
  let selectedIdx = -1;
  let selectedIdea = -1;
  let busy = false;
  const logHistory = [];

  // Persistent stats
  let stats = { chaptersWritten: 0, ideasGenerated: 0, sessions: 0 };
  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem("bookwriter_stats"));
      if (s) stats = s;
    } catch (_) {}
  }
  function saveStats() {
    try { localStorage.setItem("bookwriter_stats", JSON.stringify(stats)); } catch (_) {}
  }
  function recordChapter() { stats.chaptersWritten++; saveStats(); updateNerdStats(); }
  function recordIdea() { stats.ideasGenerated++; saveStats(); updateNerdStats(); }

  const writeOptions = {
    include_dialogue: true,
    sensory_detail: true,
    use_metaphor: false,
    interior_monologue: false,
  };

  // ─── DOM refs ──────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const selModel = $("selModel");
  const inpChapters = $("inpChapters");
  const inpWords = $("inpWords");
  const inpOllamaUrl = $("inpOllamaUrl");
  const inpOpenaiKey = $("inpOpenaiKey");
  const inpGoogleKey = $("inpGoogleKey");
  const bookListEl = $("bookList");
  const contextBox = $("contextBox");
  const promptExtras = $("promptExtras");
  const ideasGrid = $("ideasGrid");
  const logBox = $("logBox");
  const statusDot = $("statusDot");
  const statusText = $("statusText");
  const btnGenerate = $("btnGenerate");
  const btnWrite = $("btnWrite");
  const btnAuto = $("btnAuto");

  // ─── Home screen ───────────────────────────────
  const homeScreen = $("homeScreen");
  const appScreen = $("appScreen");
  let homeVisible = true;

  function enterApp() {
    if (!homeVisible) return;
    homeVisible = false;
    homeScreen.classList.add("fade-out");
    setTimeout(() => {
      homeScreen.classList.add("hidden");
      homeScreen.classList.remove("fade-out");
      appScreen.classList.remove("hidden");
      // Force reflow then animate in
      void appScreen.offsetWidth;
      appScreen.style.opacity = "0";
      appScreen.style.transform = "translateY(12px)";
      requestAnimationFrame(() => {
        appScreen.style.transition = "opacity .5s ease, transform .5s ease";
        appScreen.style.opacity = "1";
        appScreen.style.transform = "translateY(0)";
      });
    }, 500);
  }

  function goHome() {
    appScreen.style.opacity = "0";
    appScreen.style.transform = "translateY(12px)";
    setTimeout(() => {
      appScreen.classList.add("hidden");
      homeScreen.classList.remove("hidden");
      void homeScreen.offsetWidth; /* force reflow */
      homeScreen.classList.remove("fade-out");
      homeVisible = true;
      // Animate in
      requestAnimationFrame(() => {
        homeScreen.style.opacity = "1";
      });
    }, 400);
  }

  // ─── Hero canvas particles ─────────────────────
  function initHeroCanvas() {
    const canvas = $("heroCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      canvas.style.width = canvas.offsetWidth + "px";
      canvas.style.height = canvas.offsetHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 1.8 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.15,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,200,${p.alpha})`;
        ctx.fill();
      });
      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0,229,200,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ─── FAQ modal ─────────────────────────────────
  const faqModal = $("faqModal");
  let activeFaqTab = "desc";

  function openFAQ() {
    updateNerdStatsFromFiles();
    faqModal.classList.add("show");
    switchFaqTab("desc");
  }
  function closeFAQ() {
    faqModal.classList.remove("show");
  }

  function switchFaqTab(tabId) {
    activeFaqTab = tabId;
    document.querySelectorAll(".faq-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tabId));
    document.querySelectorAll(".faq-panel").forEach((p) => p.classList.toggle("active", p.id === "faq-" + tabId));
    // move indicator
    const activeTab = document.querySelector(`.faq-tab[data-tab="${tabId}"]`);
    const indicator = $(".faq-indicator");
    if (activeTab && indicator) {
      indicator.style.width = activeTab.offsetWidth + "px";
      indicator.style.left = (activeTab.offsetLeft - activeTab.parentElement.offsetLeft) + 'px';
    }
  }

  function updateNerdStats() {
    const linesCSS = countLines("style.css");
    const linesJS = countLines("app.js");
    const linesHTML = countLines("index.html");
    const totalKB = ((linesCSS + linesJS + linesHTML) * 0.06).toFixed(1); // approx bytes per line
    const els = {
      statLines: linesCSS,
      statJS: linesJS,
      statHTML: linesHTML,
      statKB: totalKB,
      statBooks: books.length,
      statChapters: stats.chaptersWritten,
      statIdeas: stats.ideasGenerated,
      statSessions: stats.sessions,
    };
    Object.entries(els).forEach(([id, val]) => {
      const el = $(id);
      if (el) el.textContent = val;
    });
  }
  function countLines(path) {
    try {
      const el = document.createElement("link");
      // We can't actually read local files from browser easily
      // Use an estimate based on the actual loaded file
      return "—";
    } catch (_) { return "—"; }
  }

  // Count actual lines from loaded content (via fetch)
  async function countLinesFromFile(path) {
    try {
      const res = await fetch(path);
      const text = await res.text();
      return text.split("\n").length;
    } catch (_) { return "—"; }
  }
  async function updateNerdStatsFromFiles() {
    const [css, js, html] = await Promise.all([
      countLinesFromFile("style.css"),
      countLinesFromFile("app.js"),
      countLinesFromFile("index.html"),
    ]);
    const totalLines = (typeof css === "number" ? css : 0) + (typeof js === "number" ? js : 0) + (typeof html === "number" ? html : 0);
    const totalKB = ((totalLines * 80) / 1024).toFixed(1); // approx
    const els = { statLines: css, statJS: js, statHTML: html, statKB: totalKB };
    Object.entries(els).forEach(([id, val]) => {
      const el = $(id);
      if (el) el.textContent = val;
    });
  }

  // ─── Mobile bottom nav ─────────────────────────
  const bottomNav = $("bottomNav");
  if (bottomNav) {
    bottomNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".bottom-nav-btn");
      if (!btn) return;
      const tab = btn.dataset.tab;
      bottomNav.querySelectorAll(".bottom-nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      scrollToPanel(tab);
    });
  }

  function scrollToPanel(tab) {
    const panels = {
      books: $(".panel-books"),
      center: $(".panel-center"),
      log: $(".panel-log"),
    };
    const panel = panels[tab];
    if (!panel) return;
    const parent = panel.parentElement;
    // On mobile we scroll the panel into view by changing grid behavior
    if (window.innerWidth < 1024) {
      parent.style.gridTemplateRows = "0fr 1fr 1fr";
      // Highlight active panel
      Object.values(panels).forEach((p) => {
        p.style.opacity = "0.4";
        p.style.transition = "opacity .25s";
      });
      panel.style.opacity = "1";
      setTimeout(() => panel.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } else {
      panel.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // ─── Helpers ───────────────────────────────────
  function log(msg) {
    const ts = new Date().toLocaleTimeString();
    const entry = `[${ts}] ${msg}`;
    logHistory.push(entry);
    if (logBox) logBox.textContent += entry + "\n";
    if (logBox) logBox.scrollTop = logBox.scrollHeight;
  }

  function setStatus(text, isBusy) {
    if (statusText) statusText.textContent = text;
    if (statusDot) statusDot.classList.toggle("busy", !!isBusy);
    busy = !!isBusy;
    if (btnGenerate) btnGenerate.disabled = busy || selectedIdx < 0;
    if (btnWrite) btnWrite.disabled = busy || selectedIdx < 0;
    if (btnAuto) btnAuto.disabled = busy || selectedIdx < 0;
  }

  function toast(msg, type) {
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = msg;
    const container = $("toasts");
    if (container) {
      container.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // ─── Book model ────────────────────────────────
  function createBook(data) {
    return {
      title: data.title || "Untitled",
      description: data.description || "",
      genre: data.genre || "",
      audience: data.audience || "",
      tone: data.tone || "",
      language: data.language || "English",
      chapter_target: parseInt(inpChapters.value) || 20,
      words_per_chapter: parseInt(inpWords.value) || 2500,
      current_chapter: 0,
      chosen_ideas: [],
      chapter_summaries: [],
      chapter_titles: [],
      chapter_texts: [],
    };
  }

  // ─── Render book list ──────────────────────────
  function renderBooks() {
    if (!bookListEl) return;
    bookListEl.innerHTML = "";
    books.forEach((b, i) => {
      const li = document.createElement("li");
      li.className = "book-item" + (i === selectedIdx ? " active" : "");
      li.innerHTML = `<span class="bi-title">${escapeHtml(b.title)}</span><span class="bi-badge">${b.current_chapter}/${b.chapter_target}</span>`;
      li.addEventListener("click", () => selectBook(i));
      li.addEventListener("dblclick", () => openEditBook(i));
      bookListEl.appendChild(li);
    });
    updateNerdStats();
  }

  function selectBook(idx) {
    selectedIdx = idx;
    const b = books[idx];
    if (b.language && b.language.toLowerCase().startsWith("it")) {
      uiLang = "Italian";
    } else {
      uiLang = "English";
    }
    applyLang();
    renderBooks();
    showContext();
    setStatus(t("ready"), false);
    // On mobile, switch to books tab
    if (bottomNav && window.innerWidth < 1024) {
      bottomNav.querySelectorAll(".bottom-nav-btn").forEach((b) => b.classList.remove("active"));
      const booksBtn = bottomNav.querySelector('[data-tab="books"]');
      if (booksBtn) booksBtn.classList.add("active");
    }
  }

  function showContext() {
    if (!contextBox) return;
    if (selectedIdx < 0) {
      contextBox.textContent = t("selectBook");
      return;
    }
    const b = books[selectedIdx];
    const isIt = uiLang === "Italian";
    let lines = [];
    lines.push((isIt ? "Titolo" : "Title") + ": " + b.title);
    lines.push((isIt ? "Genere" : "Genre") + ": " + b.genre);
    lines.push((isIt ? "Pubblico" : "Audience") + ": " + b.audience);
    lines.push((isIt ? "Tono" : "Tone") + ": " + b.tone);
    lines.push((isIt ? "Lingua" : "Language") + ": " + b.language);
    lines.push((isIt ? "Capitoli target" : "Target chapters") + ": " + b.chapter_target);
    lines.push((isIt ? "Parole per capitolo" : "Words per chapter") + ": " + b.words_per_chapter);
    lines.push("");
    lines.push((isIt ? "Descrizione:" : "Description:"));
    lines.push(b.description);
    if (b.chosen_ideas.length) {
      lines.push("");
      lines.push(isIt ? "Idee scelte:" : "Chosen ideas:");
      b.chosen_ideas.forEach((idea, i) => lines.push(`${i + 1}. ${idea}`));
    }
    if (b.chapter_summaries.length) {
      lines.push("");
      lines.push(isIt ? "Riassunti capitoli:" : "Chapter summaries:");
      b.chapter_summaries.forEach((s, i) => {
        const title = b.chapter_titles[i] || `Chapter ${i + 1}`;
        lines.push(`${title}: ${s}`);
      });
    }
    contextBox.textContent = lines.join("\n");
  }

  // ─── Ideas rendering ──────────────────────────
  function renderIdeas(ideas) {
    if (!ideasGrid) return;
    ideasGrid.innerHTML = "";
    selectedIdea = -1;
    ideas.forEach((text, i) => {
      const card = document.createElement("div");
      card.className = "idea-card";
      card.innerHTML = `<div class="idea-label">Idea ${i + 1}</div><div class="idea-text">${escapeHtml(text)}</div>`;
      card.addEventListener("click", () => {
        document.querySelectorAll(".idea-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedIdea = i;
      });
      ideasGrid.appendChild(card);
    });
  }

  function clearIdeas() {
    if (!ideasGrid) return;
    ideasGrid.innerHTML = `<div style="color:var(--muted);font-size:.82rem;padding:12px" data-t="ideasPlaceholder">${t("ideasPlaceholder")}</div>`;
    selectedIdea = -1;
  }

  // ─── AI communication ──────────────────────────
  async function aiChat(messages, temperature) {
    const model = selModel ? selModel.value : "ollama";
    if (model === "ollama") return ollamaChat(messages, temperature);
    else if (model === "google") return googleChat(messages, temperature);
    else return openaiChat(model, messages, temperature);
  }

  async function ollamaChat(messages, temperature) {
    const url = inpOllamaUrl ? inpOllamaUrl.value.trim() || "http://localhost:11434/api/chat" : "http://localhost:11434/api/chat";
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "qwen3.5:9b", messages, stream: false, options: { temperature } }),
    });
    if (!resp.ok) throw new Error(`Ollama error ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    return data.message?.content || "";
  }

  async function openaiChat(model, messages, temperature) {
    const key = inpOpenaiKey ? inpOpenaiKey.value.trim() : "";
    if (!key) throw new Error("OpenAI API key not set.");
    const bodyObj = { model, messages, temperature };
    try {
      if (model && model.toLowerCase().includes("gpt-5")) {
        bodyObj.max_completion_tokens = 4096;
      } else {
        bodyObj.max_tokens = 4096;
      }
    } catch (e) { bodyObj.max_tokens = 4096; }
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj),
    });
    if (!resp.ok) throw new Error(`OpenAI error ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
  }

  async function googleChat(messages, temperature) {
    const key = inpGoogleKey ? inpGoogleKey.value.trim() : "";
    if (!key) throw new Error("Google AI key not set.");
    const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${key}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: { text: prompt }, temperature, candidate_count: 1 }),
    });
    if (!resp.ok) throw new Error(`Google AI error ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    if (data.candidates?.[0]?.content) return data.candidates[0].content;
    throw new Error("Empty response from Google AI.");
  }

  // ─── Prompt builders ───────────────────────────
  function buildSystemPrompt(book) {
    return `You are a professional ${book.language}-language novelist and long-form fiction ghostwriter.

You are writing ONE SPECIFIC BOOK and must maintain absolute consistency for:
- title, genre, tone, target audience
- plot logic, worldbuilding, character motivations
- names, timeline, chapter continuity

Book title: ${book.title}
Genre: ${book.genre}
Audience: ${book.audience}
Tone: ${book.tone}
Language: ${book.language}

Core book description:
${book.description}

Rules:
1. Write only in fluent, natural ${book.language}.
2. Keep continuity with previous chapters and summaries.
3. Do not restart the story from scratch.
4. Do not contradict previous events unless explicitly requested.
5. Each chapter must feel like part of the same novel.
6. Prefer concrete scenes, dialogue, sensory detail, and narrative momentum.
7. Avoid generic filler.
8. The book should grow toward a complete ${book.chapter_target}-chapter novel.
9. When asked for ideas, provide exactly 5 distinct strong plot directions.
10. When asked for a chapter, return only the chapter content unless explicitly asked otherwise.`;
  }

  function buildContextMessages(book) {
    const msgs = [{ role: "system", content: buildSystemPrompt(book) }];
    if (book.current_chapter === 0) {
      msgs.push({
        role: "user",
        content: `We are starting a new book.\n\nBook title: ${book.title}\nBook description:\n${book.description}\n\nWrite with strong continuity from this concept.`,
      });
    } else {
      const history = book.chapter_summaries
        .map((s, i) => `${book.chapter_titles[i] || "Chapter " + (i + 1)}: ${s}`)
        .join("\n");
      msgs.push({ role: "user", content: "Story so far:\n" + history });
    }
    return msgs;
  }

  function writeOptionsSnippet() {
    const isIt = uiLang === "Italian";
    const parts = [];
    if (isIt) {
      parts.push(writeOptions.include_dialogue ? "Includi dialoghi naturali quando appropriato." : "Riduci i dialoghi; concentrati su descrizione e azione.");
      parts.push(writeOptions.sensory_detail ? "Usa dettagli sensoriali vividi." : "Mantieni i dettagli sensoriali minimi.");
      parts.push(writeOptions.use_metaphor ? "Usa metafore misurate e linguaggio figurato." : "Preferisci prosa letterale e chiara.");
      parts.push(writeOptions.interior_monologue ? "Includi monologhi interiori per rivelare i pensieri dei personaggi." : "Evita lunghi monologhi interiori.");
    } else {
      parts.push(writeOptions.include_dialogue ? "Include natural, character-driven dialogue when appropriate." : "Minimize dialogue; focus on description and action.");
      parts.push(writeOptions.sensory_detail ? "Use vivid sensory detail (sight, sound, smell, touch, taste)." : "Keep sensory detail minimal and understated.");
      parts.push(writeOptions.use_metaphor ? "Feel free to use tasteful metaphors and figurative language." : "Prefer literal, clear prose over extended metaphor.");
      parts.push(writeOptions.interior_monologue ? "Include occasional interior monologue to reveal character thoughts." : "Avoid long interior monologues; show character through action.");
    }
    return parts.join("\n");
  }

  function appendExtras(prompt) {
    const snippet = writeOptionsSnippet();
    if (snippet) prompt += "\n\nPreferences:\n" + snippet;
    const extras = promptExtras ? promptExtras.value.trim() : "";
    if (extras) prompt += "\n\nAdditional instructions:\n" + extras;
    return prompt;
  }

  // ─── Generate ideas ────────────────────────────
  async function generateIdeas() {
    if (busy || selectedIdx < 0) return;
    const b = books[selectedIdx];
    const chNum = b.current_chapter + 1;
    setStatus(t("generating"), true);
    log(`Generating 5 ideas for chapter ${chNum} of "${b.title}"…`);

    try {
      const msgs = buildContextMessages(b);
      const isIt = (b.language || "English").toLowerCase().startsWith("it");
      let prompt;
      if (isIt) {
        prompt = `Proponi esattamente 5 idee forti e distinte per il Capitolo ${chNum} di questo romanzo.\n\nRequisiti:\n- Ogni idea deve essere coerente con la descrizione del libro e i riassunti dei capitoli precedenti.\n- Ogni idea deve far avanzare la trama in modo significativo.\n- Rendi le 5 opzioni chiaramente diverse per tensione, rivelazione, ritmo o conflitto.\n- Ogni idea deve essere di 90-160 parole.\n- Restituisci SOLO JSON valido nel formato:\n\n{"ideas":["idea 1","idea 2","idea 3","idea 4","idea 5"]}`;
      } else {
        prompt = `Propose exactly 5 different strong ideas for Chapter ${chNum} of this novel.\n\nRequirements:\n- Each idea must be consistent with the book description and previous chapter summaries.\n- Each idea must move the plot forward in a meaningful way.\n- Make the 5 options clearly different in tension, revelation, pacing, or conflict.\n- Each idea must be 90-160 words.\n- Return ONLY valid JSON in this exact format:\n\n{"ideas":["idea 1","idea 2","idea 3","idea 4","idea 5"]}`;
      }
      prompt = appendExtras(prompt);
      msgs.push({ role: "user", content: prompt });

      const raw = await aiChat(msgs, 1.0);
      const ideas = extractIdeasJson(raw);
      renderIdeas(ideas);
      stats.ideasGenerated += ideas.length;
      saveStats();
      log("Ideas ready.");
      setStatus(t("ideasReady"), false);
      updateNerdStats();
    } catch (e) {
      log("ERROR generating ideas: " + e.message);
      setStatus(t("error"), false);
      toast(e.message, "error");
    }
  }

  function extractIdeasJson(raw) {
    raw = raw.trim();
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fence && fence[1]) raw = fence[1].trim();
    try {
      const d = JSON.parse(raw);
      if (d.ideas && d.ideas.length === 5) return d.ideas;
    } catch (_) {}
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === '{') {
        let depth = 1;
        for (let j = i + 1; j < raw.length; j++) {
          if (raw[j] === '{') depth++;
          else if (raw[j] === '}') depth--;
          if (depth === 0) {
            const candidate = raw.substring(i, j + 1);
            try {
              const d = JSON.parse(candidate);
              if (d.ideas && d.ideas.length === 5) return d.ideas;
            } catch (_) {}
            break;
          }
        }
      }
    }
    const arrMatch = raw.match(/\[\s*(?:".*?"(?:\s*,\s*".*?")+)\s*\]/s);
    if (arrMatch) {
      try {
        const d = JSON.parse('{"ideas":' + arrMatch[0] + '}');
        if (d.ideas && d.ideas.length === 5) return d.ideas;
      } catch (_) {}
    }
    try {
      const normalized = raw.replace(/(\')/g, "'").replace(/(^|\W)'(\w)/g, '$1"$2').replace(/(\w)'(\W|$)/g, '$1"$2').replace(/"\s*,\s*"/g, '","');
      const d = JSON.parse(normalized);
      if (d.ideas && d.ideas.length === 5) return d.ideas;
    } catch (_) {}
    throw new Error("Could not parse ideas JSON from model output.");
  }

  // ─── Write chapter ─────────────────────────────
  async function writeChapter(chosenIdea) {
    const b = books[selectedIdx];
    const chNum = b.current_chapter + 1;
    setStatus(t("writing") + ` ${chNum}`, true);
    log(`Writing chapter ${chNum} using selected idea…`);

    const msgs = buildContextMessages(b);
    const isIt = (b.language || "English").toLowerCase().startsWith("it");
    let prompt;
    if (isIt) {
      prompt = `Write Chapter ${chNum} of the novel.\n\nSelected plot direction for this chapter:\n${chosenIdea}\n\nRequirements:\n- Scrivi solo in italiano.\n- Length target: about ${b.words_per_chapter} words.\n- Make the prose polished, readable, and novel-like.\n- Include dialogue when useful.\n- Build on the previous chapters and keep continuity.\n- The chapter must end in a way that invites the next chapter.\n- Do not summarize the whole story.\n- Output format (keep labels in English for parsing):\n\nTITLE: <chapter title>\n\nCHAPTER_TEXT:\n<full chapter text>\n\nSUMMARY:\n<120-180 word summary of this chapter for continuity memory>`;
    } else {
      prompt = `Write Chapter ${chNum} of the novel.\n\nSelected plot direction for this chapter:\n${chosenIdea}\n\nRequirements:\n- Write in English only.\n- Length target: about ${b.words_per_chapter} words.\n- Make the prose polished, readable, and novel-like.\n- Include dialogue when useful.\n- Build on the previous chapters and keep continuity.\n- The chapter must end in a way that invites the next chapter.\n- Do not summarize the whole story.\n- Output format:\n\nTITLE: <chapter title>\n\nCHAPTER_TEXT:\n<full chapter text>\n\nSUMMARY:\n<120-180 word summary of this chapter for continuity memory>`;
    }
    prompt = appendExtras(prompt);
    msgs.push({ role: "user", content: prompt });

    const raw = await aiChat(msgs, 0.85);
    const { title, text, summary } = extractChapterParts(raw, chNum);

    b.current_chapter++;
    b.chosen_ideas.push(chosenIdea);
    b.chapter_titles.push(title);
    b.chapter_summaries.push(summary);
    b.chapter_texts.push(text);
    recordChapter();
    renderBooks();
    showContext();
    clearIdeas();
    log(`Saved chapter ${b.current_chapter}: ${title}`);
    saveState();
    updateNerdStats();
  }

  function extractChapterParts(raw, chNum) {
    let title = `Chapter ${chNum}`;
    let text = raw.trim();
    let summary = "No summary extracted.";
    if (raw.includes("TITLE:") && raw.includes("CHAPTER_TEXT:") && raw.includes("SUMMARY:")) {
      try {
        title = raw.split("TITLE:")[1].split("CHAPTER_TEXT:")[0].trim() || title;
        text = raw.split("CHAPTER_TEXT:")[1].split("SUMMARY:")[0].trim() || text;
        summary = raw.split("SUMMARY:")[1].trim() || summary;
      } catch (_) {}
    }
    return { title, text, summary };
  }

  // ─── Auto finish ───────────────────────────────
  async function autoFinish() {
    if (busy || selectedIdx < 0) return;
    const b = books[selectedIdx];
    if (b.current_chapter >= b.chapter_target) {
      toast(t("bookFinished").replace("{title}", b.title), "success");
      return;
    }
    if (!confirm("Auto-generate all remaining chapters? The AI will choose idea 1 each time.")) return;

    setStatus(t("autoMode"), true);
    try {
      while (b.current_chapter < b.chapter_target) {
        const chNum = b.current_chapter + 1;
        setStatus(`${t("autoMode")} ${chNum}/${b.chapter_target}`, true);
        log(`Auto mode: generating ideas for chapter ${chNum}`);

        const msgs = buildContextMessages(b);
        const isIt = (b.language || "English").toLowerCase().startsWith("it");
        let ideaPrompt;
        if (isIt) {
          ideaPrompt = `Proponi esattamente 5 idee forti e distinte per il Capitolo ${chNum}.\nReturn SOLO JSON valido nel formato:\n{"ideas":["idea 1","idea 2","idea 3","idea 4","idea 5"]}`;
        } else {
          ideaPrompt = `Propose exactly 5 different strong ideas for Chapter ${chNum}.\nReturn ONLY valid JSON:\n{"ideas":["idea 1","idea 2","idea 3","idea 4","idea 5"]}`;
        }
        ideaPrompt = appendExtras(ideaPrompt);
        msgs.push({ role: "user", content: ideaPrompt });

        const rawIdeas = await aiChat(msgs, 1.0);
        const ideas = extractIdeasJson(rawIdeas);
        renderIdeas(ideas);
        log(`Auto-selected idea 1 for chapter ${chNum}`);

        await writeChapter(ideas[0]);
        log(`Auto mode saved chapter ${b.current_chapter}`);
      }
      setStatus(t("bookFinished").replace("{title}", b.title), false);
      toast(t("bookFinished").replace("{title}", b.title), "success");
    } catch (e) {
      log("AUTO MODE ERROR: " + e.message);
      setStatus(t("error"), false);
      toast(e.message, "error");
    }
  }

  // ─── Export ────────────────────────────────────
  function exportBook() {
    if (selectedIdx < 0) return;
    const b = books[selectedIdx];
    let out = [];
    out.push(`BOOK TITLE: ${b.title}`);
    out.push(`GENRE: ${b.genre}`);
    out.push(`AUDIENCE: ${b.audience}`);
    out.push(`TONE: ${b.tone}`);
    out.push("");
    out.push("DESCRIPTION:");
    out.push(b.description);
    out.push("");
    out.push("=".repeat(80));
    out.push("");
    b.chapter_texts.forEach((txt, i) => {
      out.push(`CHAPTER ${i + 1}: ${b.chapter_titles[i] || "Chapter " + (i + 1)}`);
      out.push("-".repeat(80));
      out.push(txt);
      out.push("");
      out.push("[SUMMARY MEMORY]");
      out.push(b.chapter_summaries[i] || "");
      out.push("");
      out.push("=".repeat(80));
      out.push("");
    });
    const blob = new Blob([out.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const safe = b.title.replace(/[^a-zA-Z0-9 _-]/g, "_").replace(/\s+/g, "_");
    a.download = safe + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
    toast(t("exported"), "success");
    log(`Exported "${b.title}" as ${safe}.txt`);
  }

  // ─── Persist to localStorage ───────────────────
  const STORAGE_KEY = "bookwriter_state";
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ books, writeOptions, uiLang, stats }));
    } catch (_) {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.books) books = data.books;
      if (data.writeOptions) Object.assign(writeOptions, data.writeOptions);
      if (data.uiLang) uiLang = data.uiLang;
      if (data.stats) stats = data.stats;
    } catch (_) {}
  }

  // ─── Book modal ────────────────────────────────
  let editingBookIdx = -1;

  function openAddBook() {
    editingBookIdx = -1;
    $("bookModalTitle").textContent = t("addBook");
    $("bmTitle").value = "";
    $("bmDesc").value = "";
    $("bmGenre").value = "";
    $("bmAudience").value = "";
    $("bmTone").value = "";
    $("bmLang").value = "English";
    $("bmDelete").style.display = "none";
    $("bookModal").classList.add("show");
  }

  function openEditBook(idx) {
    editingBookIdx = idx;
    const b = books[idx];
    $("bookModalTitle").textContent = t("editBook");
    $("bmTitle").value = b.title;
    $("bmDesc").value = b.description;
    $("bmGenre").value = b.genre;
    $("bmAudience").value = b.audience;
    $("bmTone").value = b.tone;
    $("bmLang").value = b.language;
    $("bmDelete").style.display = "";
    $("bookModal").classList.add("show");
  }

  function saveBookModal() {
    const title = $("bmTitle").value.trim();
    const desc = $("bmDesc").value.trim();
    if (!title || !desc) {
      toast("Title and description are required.", "error");
      return;
    }
    const data = {
      title, description: desc,
      genre: $("bmGenre").value.trim(),
      audience: $("bmAudience").value.trim(),
      tone: $("bmTone").value.trim(),
      language: $("bmLang").value,
    };
    if (editingBookIdx >= 0) {
      Object.assign(books[editingBookIdx], data);
    } else {
      books.push(createBook(data));
      toast(t("bookAdded"), "success");
    }
    $("bookModal").classList.remove("show");
    renderBooks();
    saveState();
    if (editingBookIdx >= 0) selectBook(editingBookIdx);
  }

  function deleteBook() {
    if (editingBookIdx < 0) return;
    books.splice(editingBookIdx, 1);
    if (selectedIdx === editingBookIdx) selectedIdx = -1;
    else if (selectedIdx > editingBookIdx) selectedIdx--;
    $("bookModal").classList.remove("show");
    renderBooks();
    showContext();
    saveState();
    toast(t("bookDeleted"));
  }

  // ─── Load JSON file ────────────────────────────
  function handleFileLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("Expected JSON array");
        data.forEach((item) => {
          if (!books.some((b) => b.title === item.title)) {
            books.push(createBook(item));
          }
        });
        renderBooks();
        saveState();
        log(`Loaded ${data.length} books from file.`);
        toast(`Loaded ${data.length} books.`, "success");
      } catch (err) {
        toast("Invalid JSON: " + err.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ─── Wire up events ────────────────────────────
  function init() {
    loadStats();
    loadState();
    applyLang();
    renderBooks();
    showContext();
    updateNerdStats();

    // increment session count
    stats.sessions = (stats.sessions || 0) + 1;
    saveStats();
    updateNerdStats();

    // sync write-options checkboxes
    const optDialogue = $("optDialogue");
    const optSensory = $("optSensory");
    const optMetaphor = $("optMetaphor");
    const optMonologue = $("optMonologue");
    if (optDialogue) optDialogue.checked = writeOptions.include_dialogue;
    if (optSensory) optSensory.checked = writeOptions.sensory_detail;
    if (optMetaphor) optMetaphor.checked = writeOptions.use_metaphor;
    if (optMonologue) optMonologue.checked = writeOptions.interior_monologue;

    // hero canvas
    initHeroCanvas();

    // CTA button — enter app
    const ctaStart = $("ctaStart");
    if (ctaStart) ctaStart.addEventListener("click", () => {
      enterApp();
      log("Book Writer UI initialized.");
    });

    // Home button in header
    const btnHome = $("btnHome");
    if (btnHome) btnHome.addEventListener("click", goHome);

    // FAQ buttons
    const btnFAQHome = $("btnFAQHome");
    const btnFAQApp = $("btnFAQApp");
    if (btnFAQHome) btnFAQHome.addEventListener("click", openFAQ);
    if (btnFAQApp) btnFAQApp.addEventListener("click", openFAQ);
    const faqClose = $("faqClose");
    if (faqClose) faqClose.addEventListener("click", closeFAQ);

    // FAQ tabs
    document.querySelectorAll(".faq-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchFaqTab(tab.dataset.tab));
    });
    // Update indicator on resize
    window.addEventListener("resize", () => {
      const activeTab = document.querySelector(`.faq-tab[data-tab="${activeFaqTab}"]`);
      const indicator = $(".faq-indicator");
      if (activeTab && indicator) {
        indicator.style.width = activeTab.offsetWidth + "px";
        indicator.style.left = (activeTab.offsetLeft - activeTab.parentElement.offsetLeft) + 'px';
      }
    });

    // close FAQ on overlay click
    if (faqModal) {
      faqModal.addEventListener("click", (e) => {
        if (e.target === faqModal) closeFAQ();
      });
    }

    // close modals on overlay click
    document.querySelectorAll(".modal-overlay").forEach((ov) => {
      ov.addEventListener("click", (e) => {
        if (e.target === ov && ov.id !== "faqModal") ov.classList.remove("show");
      });
    });

    // keyboard: Escape to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.show").forEach((ov) => ov.classList.remove("show"));
      }
    });

    // language toggle
    const btnLang = $("btnLang");
    if (btnLang) {
      btnLang.addEventListener("click", () => {
        uiLang = uiLang === "English" ? "Italian" : "English";
        applyLang();
        saveState();
      });
    }

    // generate
    if (btnGenerate) btnGenerate.addEventListener("click", generateIdeas);

    // write
    if (btnWrite) {
      btnWrite.addEventListener("click", async () => {
        if (selectedIdx < 0 || selectedIdea < 0) {
          toast(t("noIdea"), "error");
          return;
        }
        const ideaText = ideasGrid?.children[selectedIdea]?.querySelector(".idea-text")?.textContent;
        if (!ideaText) return;
        setStatus(t("writing"), true);
        try {
          await writeChapter(ideaText);
          setStatus(t("chapterDone").replace("{n}", books[selectedIdx].current_chapter), false);
          toast(t("chapterDone").replace("{n}", books[selectedIdx].current_chapter), "success");
          const b = books[selectedIdx];
          if (b.current_chapter >= b.chapter_target) {
            toast(t("bookFinished").replace("{title}", b.title), "success");
          }
        } catch (e) {
          log("ERROR writing chapter: " + e.message);
          setStatus(t("error"), false);
          toast(e.message, "error");
        }
      });
    }

    // auto
    if (btnAuto) btnAuto.addEventListener("click", autoFinish);

    // export
    const btnExport = $("btnExport");
    if (btnExport) btnExport.addEventListener("click", exportBook);

    // file input
    const fileInput = $("fileInput");
    if (fileInput) fileInput.addEventListener("change", handleFileLoad);

    // add book
    const btnAddBook = $("btnAddBook");
    if (btnAddBook) btnAddBook.addEventListener("click", openAddBook);
    const bmSave = $("bmSave");
    if (bmSave) bmSave.addEventListener("click", saveBookModal);
    const bmCancel = $("bmCancel");
    if (bmCancel) bmCancel.addEventListener("click", () => $("bookModal").classList.remove("show"));
    const bmDelete = $("bmDelete");
    if (bmDelete) bmDelete.addEventListener("click", deleteBook);

    // options modal
    const btnOptions = $("btnOptions");
    if (btnOptions) {
      btnOptions.addEventListener("click", () => {
        if (optDialogue) optDialogue.checked = writeOptions.include_dialogue;
        if (optSensory) optSensory.checked = writeOptions.sensory_detail;
        if (optMetaphor) optMetaphor.checked = writeOptions.use_metaphor;
        if (optMonologue) optMonologue.checked = writeOptions.interior_monologue;
        $("optionsModal").classList.add("show");
      });
    }
    const optSave = $("optSave");
    if (optSave) optSave.addEventListener("click", () => {
      if (optDialogue) writeOptions.include_dialogue = optDialogue.checked;
      if (optSensory) writeOptions.sensory_detail = optSensory.checked;
      if (optMetaphor) writeOptions.use_metaphor = optMetaphor.checked;
      if (optMonologue) writeOptions.interior_monologue = optMonologue.checked;
      $("optionsModal").classList.remove("show");
      saveState();
      log("Write options saved.");
    });
    const optCancel = $("optCancel");
    if (optCancel) optCancel.addEventListener("click", () => $("optionsModal").classList.remove("show"));

    // logs modal
    const btnThemeLogs = $("btnThemeLogs");
    if (btnThemeLogs) {
      btnThemeLogs.addEventListener("click", () => {
        const fullLogsBox = $("fullLogsBox");
        if (fullLogsBox) fullLogsBox.textContent = logHistory.join("\n");
        $("logsModal").classList.add("show");
      });
    }
    const logsClose = $("logsClose");
    if (logsClose) logsClose.addEventListener("click", () => $("logsModal").classList.remove("show"));
    const logsCopy = $("logsCopy");
    if (logsCopy) {
      logsCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(logHistory.join("\n")).then(() => toast("Logs copied!", "success"));
      });
    }

    // auto-save settings on change
    [inpChapters, inpWords, inpOllamaUrl, promptExtras].forEach((el) => {
      if (el) el.addEventListener("change", saveState);
    });

    setStatus(t("ready"), false);
    log("Book Writer v2.0 initialized.");

    // load sample books if empty
    if (books.length === 0) loadSampleBooks();
  }

  function loadSampleBooks() {
    const samples = [
      {
        title: "The Last Observatory",
        description: "A young atmospheric physicist discovers that a remote coastal observatory has been tracking not weather, but impossible signals tied to missing ships, vanished researchers, and a storm that returns every nineteen years.",
        genre: "Science mystery / speculative thriller",
        audience: "Adult",
        tone: "Atmospheric, intelligent, emotionally tense",
        language: "English",
      },
      {
        title: "Ashes of the Glass Empire",
        description: "In a declining fantasy empire built on living crystal technology, an apprentice archivist and a disgraced military engineer uncover a conspiracy that could collapse the capital.",
        genre: "Epic fantasy",
        audience: "Young adult / adult crossover",
        tone: "Vivid, adventurous, emotionally rich",
        language: "English",
      },
    ];
    samples.forEach((s) => books.push(createBook(s)));
    renderBooks();
    saveState();
    log("Loaded 2 sample books.");
  }

  // Boot — start with home screen visible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
