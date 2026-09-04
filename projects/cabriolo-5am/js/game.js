/* =============================================
   Cabriolo, 5:00 — game.js
   Engine: scene, dialogue, stats, save, endings
   ============================================= */
"use strict";

const CabrioloGame = (() => {
  const SAVE_KEY = "cabriolo-5am-save";
  const ENDINGS_KEY = "cabriolo-5am-endings";

  let state = {
    chapter: 0,
    scene: 0,
    stats: { luce: 0, malinconia: 0, legame: 0 },
    sceneOverride: null,
    minigameScores: {},
    endingsUnlocked: []
  };

  const story = CABRIOLO_STORY;

  // DOM refs
  const $ = (id) => document.getElementById(id);

  function init() {
    // canvas
    const skyCanvas = $("sky-canvas");
    const skyCtx = skyCanvas.getContext("2d");
    function resizeSky() {
      skyCanvas.width = window.innerWidth;
      skyCanvas.height = window.innerHeight;
    }
    resizeSky();
    window.addEventListener("resize", resizeSky);

    // draw initial sky
    drawSky(skyCtx, skyCanvas.width, skyCanvas.height, 0, "summer");

    // load saved progress
    loadSave();
    loadEndings();

    // show continue if progress exists
    if (state.chapter > 0 || state.scene > 0) {
      $("btn-continue").style.display = "";
    }

    // button bindings
    $("btn-start").addEventListener("click", startGame);
    $("btn-continue").addEventListener("click", continueGame);
    $("btn-gallery").addEventListener("click", showGallery);
    $("btn-gallery-back").addEventListener("click", () => showScreen("title-screen"));
    $("dialogue-next").addEventListener("click", nextScene);
    $("minigame-skip").addEventListener("click", skipMinigame);
    $("btn-replay").addEventListener("click", startGame);
    $("btn-home").addEventListener("click", () => showScreen("title-screen"));
    $("audio-toggle").addEventListener("click", toggleAudio);

    // audio toggle state
    if (CabrioloAudio.isMuted()) {
      $("audio-toggle").classList.add("muted");
      $("audio-toggle").textContent = "♪̸";
    }
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    $(id).classList.add("active");
  }

  // ===================== SKY =====================
  function drawSky(ctx, w, h, progress, palette) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (palette === "autumn") {
      grad.addColorStop(0, lerpColor("#1a1018", "#2a1828", progress));
      grad.addColorStop(0.4, lerpColor("#1a1018", "#c07845", progress));
      grad.addColorStop(1, lerpColor("#1a1018", "#e8b87a", progress));
    } else {
      grad.addColorStop(0, lerpColor("#1a0e2e", "#4a8ab5", progress));
      grad.addColorStop(0.4, lerpColor("#1a0e2e", "#e8963c", progress));
      grad.addColorStop(1, lerpColor("#1a0e2e", "#f5d49c", progress));
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // stars (fading with progress)
    if (progress < 0.5) {
      const starAlpha = 0.6 - progress * 1.2;
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, starAlpha)})`;
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5 + 50) % w;
        const sy = (i * 97.3 + 20) % (h * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // sun
    const sunY = h * (0.85 - progress * 0.45);
    ctx.fillStyle = palette === "autumn" ? "#e8b87a" : "#f5d49c";
    ctx.globalAlpha = 0.3 + progress * 0.7;
    ctx.beginPath();
    ctx.arc(w / 2, sunY, 15 + progress * 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // hills silhouette
    ctx.fillStyle = palette === "autumn" ? "#2a1a18" : "#1a3a2a";
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.quadraticCurveTo(w * 0.3, h * 0.55, w * 0.5, h * 0.58);
    ctx.quadraticCurveTo(w * 0.7, h * 0.62, w, h * 0.6);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }

  // ===================== START / CONTINUE =====================
  function startGame() {
    CabrioloAudio.start();
    state = {
      chapter: 0,
      scene: 0,
      stats: { luce: 0, malinconia: 0, legame: 0 },
      sceneOverride: null,
      minigameScores: {},
      endingsUnlocked: state.endingsUnlocked || []
    };
    save();
    showChapterIntro(0);
  }

  function continueGame() {
    CabrioloAudio.start();
    showChapterIntro(state.chapter);
  }

  // ===================== CHAPTER INTRO =====================
  function showChapterIntro(chIdx) {
    const ch = story.chapters[chIdx];
    if (!ch) {
      resolveEnding();
      return;
    }
    state.chapter = chIdx;
    state.scene = 0;
    state.sceneOverride = null;

    // set palette
    if (ch.palette === "autumn") {
      document.body.classList.add("autumn");
    } else {
      document.body.classList.remove("autumn");
    }

    CabrioloAudio.setMood(chIdx + 1);

    $("chapter-number").textContent = `Capitolo ${ch.id}`;
    $("chapter-title").textContent = ch.title;
    $("chapter-subtitle").textContent = ch.subtitle;
    $("chapter-song").textContent = ch.song;

    showScreen("chapter-screen");

    // animate sky
    const skyCanvas = $("sky-canvas");
    const skyCtx = skyCanvas.getContext("2d");
    let t = 0;
    function animateIntro() {
      t += 0.008;
      if (t > 1) t = 1;
      drawSky(skyCtx, skyCanvas.width, skyCanvas.height, t * 0.3, ch.palette);
      if (t < 1) requestAnimationFrame(animateIntro);
    }
    animateIntro();

    // auto-advance to first scene
    setTimeout(() => {
      showScene();
    }, 2500);
  }

  // ===================== SCENE =====================
  function showScene() {
    const ch = story.chapters[state.chapter];
    if (!ch) return;

    // check if we have an override (from choices)
    let sceneIdx = state.sceneOverride || state.scene;
    state.sceneOverride = null;

    if (sceneIdx >= ch.scenes.length) {
      // end of chapter — check if there's a minigame
      if (ch.minigame && !state.minigameScores[ch.minigame]) {
        startMinigame(ch.minigame, ch.title);
      } else {
        // next chapter
        showChapterIntro(state.chapter + 1);
      }
      return;
    }

    const scene = ch.scenes[sceneIdx];
    state.scene = sceneIdx;

    if (scene.type === "narration") {
      showNarration(scene.text, () => {
        state.scene++;
        save();
        showScene();
      });
    } else if (scene.type === "dialogue") {
      showDialogue(scene.speaker, scene.text, scene.choices, () => {
        state.scene++;
        save();
        showScene();
      });
    } else if (scene.type === "choice") {
      showChoice(scene.text, scene.choices);
    }
  }

  // ===================== NARRATION =====================
  function showNarration(text, onDone) {
    showScreen("dialogue-screen");
    $("dialogue-speaker").textContent = "";
    $("dialogue-text").innerHTML = formatText(text);
    $("dialogue-choices").innerHTML = "";
    $("dialogue-next").style.display = "";
    $("dialogue-next").onclick = () => {
      $("dialogue-next").style.display = "none";
      onDone();
    };
    updateStats();
  }

  // ===================== DIALOGUE =====================
  function showDialogue(speaker, text, choices, onDone) {
    showScreen("dialogue-screen");
    $("dialogue-speaker").textContent = speaker;
    $("dialogue-text").innerHTML = formatText(text);
    $("dialogue-choices").innerHTML = "";

    if (choices && choices.length) {
      $("dialogue-next").style.display = "none";
      choices.forEach((c, i) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = c.text;
        btn.addEventListener("click", () => {
          applyEffect(c.effect);
          $("dialogue-choices").innerHTML = "";
          if (c.next) {
            state.sceneOverride = findSceneIndex(c.next);
          }
          onDone();
        });
        $("dialogue-choices").appendChild(btn);
      });
    } else {
      $("dialogue-next").style.display = "";
      $("dialogue-next").onclick = () => {
        $("dialogue-next").style.display = "none";
        onDone();
      };
    }
    updateStats();
  }

  // ===================== CHOICE =====================
  function showChoice(text, choices) {
    showScreen("dialogue-screen");
    $("dialogue-speaker").textContent = "";
    $("dialogue-text").textContent = text;
    $("dialogue-choices").innerHTML = "";
    $("dialogue-next").style.display = "none";

    choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = c.text;
      btn.addEventListener("click", () => {
        applyEffect(c.effect);
        $("dialogue-choices").innerHTML = "";
        if (c.next) {
          state.sceneOverride = findSceneIndex(c.next);
        } else {
          state.scene++;
        }
        save();
        showScene();
      });
      $("dialogue-choices").appendChild(btn);
    });
    updateStats();
  }

  // ===================== HELPERS =====================
  function findSceneIndex(id) {
    const ch = story.chapters[state.chapter];
    if (!ch) return 0;
    const idx = ch.scenes.findIndex(s => s.id === id);
    return idx >= 0 ? idx : 0;
  }

  function applyEffect(effect) {
    if (!effect) return;
    for (const [k, v] of Object.entries(effect)) {
      if (state.stats[k] !== undefined) {
        state.stats[k] += v;
      }
    }
    updateStats();
    animateStatPop();
  }

  function updateStats() {
    const s = state.stats;
    $("stat-luce").textContent = "☀️ " + Math.max(0, s.luce);
    $("stat-malinconia").textContent = "🌧️ " + Math.max(0, s.malinconia);
    $("stat-legame").textContent = "🧵 " + Math.max(0, s.legame);
  }

  function animateStatPop() {
    document.querySelectorAll(".stat").forEach(el => {
      el.classList.remove("pop");
      void el.offsetWidth; // reflow
      el.classList.add("pop");
    });
  }

  function formatText(text) {
    return text
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>")
      .replace(/\* \* \*/g, "<em>• • •</em>");
  }

  // ===================== MINIGAME =====================
  function startMinigame(gameId, chapterTitle) {
    showScreen("minigame-screen");
    $("minigame-title").textContent = chapterTitle + " — Minigioco";
    $("minigame-score").textContent = "0";
    $("minigame-instruction").textContent = getMinigameInstruction(gameId);

    const canvas = $("minigame-canvas");
    CabrioloMinigames.init(canvas);
    CabrioloMinigames.start(gameId, (finalScore) => {
      state.minigameScores[gameId] = finalScore;
      save();
      // next chapter
      showChapterIntro(state.chapter + 1);
    });
  }

  function skipMinigame() {
    CabrioloMinigames.skip();
  }

  function getMinigameInstruction(id) {
    const map = {
      salita: "Tocca per camminare — schiva i sassi sulla stradina",
      playlist: "Tocca le note quando arrivano sulla linea — il sole sale con te",
      sassolini: "Tocca per lanciare e tenere a galla il sassolino",
      lucciole: "Trascina la cestina per raccogliere lucciole e foglie",
      parole: "Tocca le parole per metterle nel posto giusto"
    };
    return map[id] || "";
  }

  // ===================== ENDING =====================
  function resolveEnding() {
    const s = state.stats;
    let best = null;
    let bestScore = -1;

    for (const ending of story.endings) {
      const r = ending.req;
      if (r.secret) {
        // secret ending: need high stats on all
        if (s.luce >= r.luce && s.malinconia <= r.malinconia && s.legame >= r.legame) {
          best = ending;
          break;
        }
        continue;
      }
      let match = true;
      if (r.luce !== undefined && s.luce < r.luce) match = false;
      if (r.malinconia !== undefined && s.malinconia < r.malinconia) match = false;
      if (r.legame !== undefined && s.legame < r.legame) match = false;
      if (match) {
        const score = s.luce + s.legame - s.malinconia;
        if (score > bestScore) {
          bestScore = score;
          best = ending;
        }
      }
    }

    // fallback: pick by dominant stat
    if (!best) {
      if (s.luce >= s.legame && s.luce >= s.malinconia) {
        best = story.endings.find(e => e.id === "orizzonte");
      } else if (s.legame >= s.luce && s.legame >= s.malinconia) {
        best = story.endings.find(e => e.id === "radio");
      } else {
        best = story.endings.find(e => e.id === "ogni5");
      }
    }

    // unlock ending
    if (!state.endingsUnlocked.includes(best.id)) {
      state.endingsUnlocked.push(best.id);
      saveEndings();
    }

    showEnding(best);
  }

  function showEnding(ending) {
    $("ending-label").textContent = ending.label;
    $("ending-title").textContent = ending.name;
    $("ending-text").innerHTML = formatText(ending.text);
    showScreen("ending-screen");

    // sky animation
    const skyCanvas = $("sky-canvas");
    const skyCtx = skyCanvas.getContext("2d");
    let t = 0;
    const palette = state.stats.malinconia > state.stats.luce ? "autumn" : "summer";
    function animateEnding() {
      t += 0.005;
      if (t > 1) t = 1;
      drawSky(skyCtx, skyCanvas.width, skyCanvas.height, t, palette);
      if (t < 1) requestAnimationFrame(animateEnding);
    }
    animateEnding();
  }

  // ===================== GALLERY =====================
  function showGallery() {
    showScreen("gallery-screen");
    const grid = $("gallery-grid");
    grid.innerHTML = "";

    story.endings.forEach(ending => {
      const unlocked = state.endingsUnlocked.includes(ending.id);
      const card = document.createElement("div");
      card.className = "gallery-card" + (unlocked ? "" : " locked");
      card.innerHTML = `
        <div class="gallery-card-name">
          ${unlocked ? ending.name : '<span class="lock-icon">🔒</span>???'}</div>
        <div class="gallery-card-desc">
          ${unlocked ? ending.desc : "Completa la storia per sbloccare questo finale."}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ===================== AUDIO =====================
  function toggleAudio() {
    CabrioloAudio.start();
    const muted = CabrioloAudio.toggleMute();
    const btn = $("audio-toggle");
    btn.classList.toggle("muted", muted);
    btn.textContent = muted ? "♪̸" : "♪";
  }

  // ===================== SAVE =====================
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        chapter: state.chapter,
        scene: state.scene,
        stats: state.stats,
        minigameScores: state.minigameScores
      }));
    } catch (e) { /* ignore */ }
  }

  function loadSave() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (data) {
        state.chapter = data.chapter || 0;
        state.scene = data.scene || 0;
        state.stats = data.stats || { luce: 0, malinconia: 0, legame: 0 };
        state.minigameScores = data.minigameScores || {};
      }
    } catch (e) { /* ignore */ }
  }

  function saveEndings() {
    try {
      localStorage.setItem(ENDINGS_KEY, JSON.stringify(state.endingsUnlocked));
    } catch (e) { /* ignore */ }
  }

  function loadEndings() {
    try {
      const data = JSON.parse(localStorage.getItem(ENDINGS_KEY));
      if (Array.isArray(data)) {
        state.endingsUnlocked = data;
      }
    } catch (e) { /* ignore */ }
  }

  // ===================== UTILS =====================
  function lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16);
    const bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);
    return `rgb(${rr},${rg},${rb})`;
  }

  return { init };
})();

// ===================== BOOT =====================
document.addEventListener("DOMContentLoaded", () => {
  CabrioloGame.init();

  // register SW
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
