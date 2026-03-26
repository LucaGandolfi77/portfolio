/* ═══════════════════════════════════════════════════
   Book Writer — Web UI  (app.js)
   Port of book-writer-gui.py to a browser-based SPA
   ═══════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── Localization ────────────────────────────────
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
    document.getElementById("btnLang").textContent = "🌐 " + (uiLang === "English" ? "EN" : "IT");
    // re-set placeholder
    const ph = document.getElementById("ideasGrid");
    if (ph && ph.children.length === 1 && ph.children[0].hasAttribute("data-t")) {
      ph.children[0].textContent = t("ideasPlaceholder");
    }
  }

  // ─── State ───────────────────────────────────────
  let books = [];
  let selectedIdx = -1;
  let selectedIdea = -1;
  let busy = false;
  const logHistory = [];

  const writeOptions = {
    include_dialogue: true,
    sensory_detail: true,
    use_metaphor: false,
    interior_monologue: false,
  };

  // ─── DOM refs ────────────────────────────────────
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

  // ─── Helpers ─────────────────────────────────────
  function log(msg) {
    const ts = new Date().toLocaleTimeString();
    const entry = `[${ts}] ${msg}`;
    logHistory.push(entry);
    logBox.textContent += entry + "\n";
    logBox.scrollTop = logBox.scrollHeight;
  }

  function setStatus(text, isBusy) {
    statusText.textContent = text;
    statusDot.classList.toggle("busy", !!isBusy);
    busy = !!isBusy;
    btnGenerate.disabled = busy || selectedIdx < 0;
    btnWrite.disabled = busy || selectedIdx < 0;
    btnAuto.disabled = busy || selectedIdx < 0;
  }

  function toast(msg, type) {
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.textContent = msg;
    $("toasts").appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  // ─── Book model ──────────────────────────────────
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

  // ─── Render book list ────────────────────────────
  function renderBooks() {
    bookListEl.innerHTML = "";
    books.forEach((b, i) => {
      const li = document.createElement("li");
      li.className = "book-item" + (i === selectedIdx ? " active" : "");
      li.innerHTML = `<span class="bi-title">${escapeHtml(b.title)}</span><span class="bi-badge">${b.current_chapter}/${b.chapter_target}</span>`;
      li.addEventListener("click", () => selectBook(i));
      li.addEventListener("dblclick", () => openEditBook(i));
      bookListEl.appendChild(li);
    });
  }

  function selectBook(idx) {
    selectedIdx = idx;
    const b = books[idx];
    // set UI lang from book language
    if (b.language && b.language.toLowerCase().startsWith("it")) {
      uiLang = "Italian";
    } else {
      uiLang = "English";
    }
    applyLang();
    renderBooks();
    showContext();
    setStatus(t("ready"), false);
  }

  function showContext() {
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

  // ─── Ideas rendering ────────────────────────────
  function renderIdeas(ideas) {
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
    ideasGrid.innerHTML = `<div style="color:var(--muted);font-size:.82rem;padding:12px" data-t="ideasPlaceholder">${t("ideasPlaceholder")}</div>`;
    selectedIdea = -1;
  }

  // ─── AI communication ───────────────────────────
  async function aiChat(messages, temperature) {
    const model = selModel.value;

    if (model === "ollama") {
      return ollamaChat(messages, temperature);
    } else if (model === "google") {
      return googleChat(messages, temperature);
    } else {
      return openaiChat(model, messages, temperature);
    }
  }

  async function ollamaChat(messages, temperature) {
    const url = inpOllamaUrl.value.trim() || "http://localhost:11434/api/chat";
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
    const key = inpOpenaiKey.value.trim();
    if (!key) throw new Error("OpenAI API key not set.");
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, temperature, max_tokens: 4096 }),
    });
    if (!resp.ok) throw new Error(`OpenAI error ${resp.status}: ${await resp.text()}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "";
  }

  async function googleChat(messages, temperature) {
    const key = inpGoogleKey.value.trim();
    if (!key) throw new Error("Google API key not set.");
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

  // ─── Prompt builders ────────────────────────────
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
    const extras = promptExtras.value.trim();
    if (extras) prompt += "\n\nAdditional instructions:\n" + extras;
    return prompt;
  }

  // ─── Generate ideas ─────────────────────────────
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
      log("Ideas ready.");
      setStatus(t("ideasReady"), false);
    } catch (e) {
      log("ERROR generating ideas: " + e.message);
      setStatus(t("error"), false);
      toast(e.message, "error");
    }
  }

  function extractIdeasJson(raw) {
    raw = raw.trim();
    try {
      const d = JSON.parse(raw);
      if (d.ideas && d.ideas.length === 5) return d.ideas;
    } catch (_) {}
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end > start) {
      const d = JSON.parse(raw.substring(start, end + 1));
      if (d.ideas && d.ideas.length === 5) return d.ideas;
    }
    throw new Error("Could not parse ideas JSON from model output.");
  }

  // ─── Write chapter ──────────────────────────────
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
    renderBooks();
    showContext();
    clearIdeas();
    log(`Saved chapter ${b.current_chapter}: ${title}`);
    saveState();
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

  // ─── Auto finish ────────────────────────────────
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

        // generate ideas
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

  // ─── Export ──────────────────────────────────────
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

  // ─── Persist to localStorage ────────────────────
  const STORAGE_KEY = "bookwriter_state";
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ books, writeOptions, uiLang }));
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
    } catch (_) {}
  }

  // ─── Book modal ─────────────────────────────────
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
      title,
      description: desc,
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

  // ─── Load JSON file ─────────────────────────────
  function handleFileLoad(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) throw new Error("Expected JSON array");
        data.forEach((item) => {
          // prevent duplicates by title
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

  // ─── Wire up events ─────────────────────────────
  function init() {
    loadState();
    applyLang();
    renderBooks();
    showContext();

    // sync write-options checkboxes
    $("optDialogue").checked = writeOptions.include_dialogue;
    $("optSensory").checked = writeOptions.sensory_detail;
    $("optMetaphor").checked = writeOptions.use_metaphor;
    $("optMonologue").checked = writeOptions.interior_monologue;

    // language toggle
    $("btnLang").addEventListener("click", () => {
      uiLang = uiLang === "English" ? "Italian" : "English";
      applyLang();
      saveState();
    });

    // generate
    btnGenerate.addEventListener("click", generateIdeas);

    // write
    btnWrite.addEventListener("click", async () => {
      if (selectedIdx < 0 || selectedIdea < 0) {
        toast(t("noIdea"), "error");
        return;
      }
      const ideaText = ideasGrid.children[selectedIdea]?.querySelector(".idea-text")?.textContent;
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

    // auto
    btnAuto.addEventListener("click", autoFinish);

    // export
    $("btnExport").addEventListener("click", exportBook);

    // file input
    $("fileInput").addEventListener("change", handleFileLoad);

    // add book
    $("btnAddBook").addEventListener("click", openAddBook);
    $("bmSave").addEventListener("click", saveBookModal);
    $("bmCancel").addEventListener("click", () => $("bookModal").classList.remove("show"));
    $("bmDelete").addEventListener("click", deleteBook);

    // options modal
    $("btnOptions").addEventListener("click", () => {
      $("optDialogue").checked = writeOptions.include_dialogue;
      $("optSensory").checked = writeOptions.sensory_detail;
      $("optMetaphor").checked = writeOptions.use_metaphor;
      $("optMonologue").checked = writeOptions.interior_monologue;
      $("optionsModal").classList.add("show");
    });
    $("optSave").addEventListener("click", () => {
      writeOptions.include_dialogue = $("optDialogue").checked;
      writeOptions.sensory_detail = $("optSensory").checked;
      writeOptions.use_metaphor = $("optMetaphor").checked;
      writeOptions.interior_monologue = $("optMonologue").checked;
      $("optionsModal").classList.remove("show");
      saveState();
      log("Write options saved.");
    });
    $("optCancel").addEventListener("click", () => $("optionsModal").classList.remove("show"));

    // logs modal
    $("btnThemeLogs").addEventListener("click", () => {
      $("fullLogsBox").textContent = logHistory.join("\n");
      $("logsModal").classList.add("show");
    });
    $("logsClose").addEventListener("click", () => $("logsModal").classList.remove("show"));
    $("logsCopy").addEventListener("click", () => {
      navigator.clipboard.writeText(logHistory.join("\n")).then(() => toast("Logs copied!", "success"));
    });

    // close modals on overlay click
    document.querySelectorAll(".modal-overlay").forEach((ov) => {
      ov.addEventListener("click", (e) => {
        if (e.target === ov) ov.classList.remove("show");
      });
    });

    // keyboard: Escape to close modals
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.show").forEach((ov) => ov.classList.remove("show"));
      }
    });

    // auto-save settings on change
    [inpChapters, inpWords, inpOllamaUrl, promptExtras].forEach((el) => {
      el.addEventListener("change", saveState);
    });

    setStatus(t("ready"), false);
    log("Book Writer UI initialized.");

    // load sample books if empty
    if (books.length === 0) {
      loadSampleBooks();
    }
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

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
