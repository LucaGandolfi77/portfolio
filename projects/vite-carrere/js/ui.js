"use strict";

var UI = (function () {

  var audioCtx = null;
  var typewriterTimer = null;
  var typewriterCallback = null;

  function init() {
    Engine.on("stateChange", render);
    Engine.on("narrativeAdvance", renderNarrative);
    Engine.on("narrativeComplete", showMinigameOrQuote);
    Engine.on("quoteCollected", showQuotePopup);
    Engine.on("minigameComplete", onMinigameComplete);
    setupButtons();
    render();
  }

  function initAudio() {
    if (audioCtx) return;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { }
  }

  function playTone(freq, dur, vol) {
    if (!audioCtx) return;
    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      osc.frequency.setValueAtTime(freq, t);
      osc.type = "sine";
      gain.gain.setValueAtTime(vol || 0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    } catch (e) { }
  }

  function playPageTurn() {
    playTone(800, 0.08, 0.04);
    setTimeout(function () { playTone(1200, 0.06, 0.03); }, 30);
  }

  function playCollect() {
    playTone(523, 0.15, 0.06);
    setTimeout(function () { playTone(659, 0.15, 0.05); }, 100);
    setTimeout(function () { playTone(784, 0.2, 0.05); }, 200);
  }

  function playFinale() {
    playTone(523, 0.3, 0.07);
    setTimeout(function () { playTone(659, 0.3, 0.06); }, 300);
    setTimeout(function () { playTone(784, 0.3, 0.06); }, 600);
    setTimeout(function () { playTone(1047, 0.5, 0.07); }, 900);
  }

  function setupButtons() {
    document.addEventListener("click", initAudio, { once: true });

    var skipBtn = document.getElementById("skip-btn");
    if (skipBtn) {
      skipBtn.addEventListener("click", function () {
        if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
        Engine.skipNarrative();
      });
    }
  }

  function render() {
    var s = Engine.getState();
    hideAll();
    switch (s.screen) {
      case "title": showTitle(); break;
      case "map": showMap(); break;
      case "chapter": showChapter(s); break;
      case "quaderno": showQuaderno(); break;
      case "finale": showFinale(); break;
    }
  }

  function hideAll() {
    ["title-screen", "map-screen", "chapter-screen", "quaderno-screen", "finale-screen"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
  }

  function showTitle() {
    var el = document.getElementById("title-screen");
    if (el) el.classList.remove("hidden");
  }

  function showMap() {
    var el = document.getElementById("map-screen");
    if (!el) return;
    var s = Engine.getState();
    var html = '<div class="map-header">';
    html += '<h2 class="map-title">Le opere</h2>';
    html += '<div class="map-progress">' + s.completedChapters.length + '/' + DATA.CHAPTERS.length + ' capitoli</div>';
    html += '</div><div class="map-chapters">';
    DATA.CHAPTERS.forEach(function (ch, i) {
      var unlocked = s.unlockedChapters.includes(i);
      var done = s.completedChapters.includes(i);
      var cls = "map-chapter" + (done ? " done" : "") + (unlocked ? "" : " locked");
      html += '<button class="' + cls + '" data-chapter="' + i + '" ' + (unlocked ? '' : 'disabled') + '>';
      html += '<div class="mc-year">' + ch.year + '</div>';
      html += '<div class="mc-title">' + ch.title + '</div>';
      html += '<div class="mc-book">' + ch.book + '</div>';
      if (done) html += '<div class="mc-check">✓</div>';
      if (!unlocked) html += '<div class="mc-lock">🔒</div>';
      html += '</button>';
    });
    html += '</div>';
    if (Engine.allChaptersDone()) {
      html += '<button class="map-finale-btn" id="go-finale">📖 Apri il finale</button>';
    }
    html += '<button class="map-quaderno-btn" id="go-quaderno">📓 Il Quaderno (' + s.collectedQuotes.length + '/' + DATA.CHAPTERS.length + ')</button>';
    el.innerHTML = html;
    el.classList.remove("hidden");

    el.querySelectorAll(".map-chapter:not(.locked)").forEach(function (btn) {
      btn.addEventListener("click", function () {
        playPageTurn();
        Engine.openChapter(parseInt(this.dataset.chapter));
      });
    });
    var finBtn = el.querySelector("#go-finale");
    if (finBtn) finBtn.addEventListener("click", function () { playFinale(); Engine.showFinale(); });
    var qBtn = el.querySelector("#go-quaderno");
    if (qBtn) qBtn.addEventListener("click", function () { Engine.showQuaderno(); });
  }

  function showChapter(s) {
    var el = document.getElementById("chapter-screen");
    if (!el) return;
    var ch = DATA.CHAPTERS[s.currentChapter];
    if (!ch) return;

    var html = '<div class="ch-header">';
    html += '<button class="ch-back" id="ch-back">← Mappa</button>';
    html += '<div class="ch-book-info"><span class="ch-year">' + ch.year + '</span> · ' + ch.book + '</div>';
    html += '</div>';
    html += '<h2 class="ch-title">' + ch.title + '</h2>';
    html += '<div class="ch-subtitle">' + ch.subtitle + '</div>';

    html += '<div class="ch-narrative" id="ch-narrative"></div>';
    html += '<button class="ch-advance" id="ch-advance">Continua →</button>';
    html += '<button class="ch-skip" id="skip-btn">Salta →</button>';

    html += '<div class="ch-minigame hidden" id="ch-minigame"></div>';
    html += '<div class="ch-quote hidden" id="ch-quote"></div>';

    el.innerHTML = html;
    el.classList.remove("hidden");

    el.querySelector("#ch-back").addEventListener("click", function () {
      if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }
      Engine.finishChapter();
    });
    el.querySelector("#ch-advance").addEventListener("click", function () {
      playPageTurn();
      Engine.advanceNarrative();
    });

    renderNarrative();
  }

  function renderNarrative() {
    var s = Engine.getState();
    var ch = DATA.CHAPTERS[s.currentChapter];
    if (!ch) return;
    var el = document.getElementById("ch-narrative");
    var advBtn = document.getElementById("ch-advance");
    if (!el) return;

    if (typewriterTimer) { clearInterval(typewriterTimer); typewriterTimer = null; }

    var text = ch.narrative[s.narrativeIndex];
    el.innerHTML = '<p class="narrative-text"></p>';
    var p = el.querySelector(".narrative-text");
    var i = 0;
    typewriterTimer = setInterval(function () {
      if (i < text.length) {
        p.textContent += text[i];
        i++;
      } else {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
      }
    }, 22);

    if (advBtn) {
      var isLast = s.narrativeIndex >= ch.narrative.length - 1;
      advBtn.textContent = isLast ? "Ascolta la citazione →" : "Continua →";
    }
  }

  function showMinigameOrQuote() {
    var s = Engine.getState();
    var ch = DATA.CHAPTERS[s.currentChapter];
    if (!ch) return;
    var narrativeEl = document.getElementById("ch-narrative");
    var advBtn = document.getElementById("ch-advance");
    var skipBtn = document.getElementById("skip-btn");
    var minigameEl = document.getElementById("ch-minigame");
    var quoteEl = document.getElementById("ch-quote");

    if (narrativeEl) narrativeEl.classList.add("hidden");
    if (advBtn) advBtn.classList.add("hidden");
    if (skipBtn) skipBtn.classList.add("hidden");

    if (s.minigameDone) {
      showQuoteOnly(ch, quoteEl);
      return;
    }

    quoteEl.classList.remove("hidden");
    quoteEl.innerHTML = '<div class="quote-box">';
    quoteEl.innerHTML += '<div class="quote-text">"' + ch.quote.text + '"</div>';
    quoteEl.innerHTML += '<div class="quote-source">— ' + ch.quote.source;
    if (ch.quote.page) quoteEl.innerHTML += ', ' + ch.quote.page;
    quoteEl.innerHTML += '</div>';
    quoteEl.innerHTML += '</div>';
    quoteEl.innerHTML += '<button class="quote-continue" id="quote-start-mg">Prosegui al gioco →</button>';
    quoteEl.classList.remove("hidden");

    document.getElementById("quote-start-mg").addEventListener("click", function () {
      playPageTurn();
      quoteEl.classList.add("hidden");
      minigameEl.classList.remove("hidden");
      Minigames.launch("ch-minigame", ch.minigame, function (result) {
        Engine.completeMinigame(result);
      });
    });
  }

  function showQuoteOnly(ch, quoteEl) {
    if (!quoteEl) return;
    quoteEl.innerHTML = '<div class="quote-box">';
    quoteEl.innerHTML += '<div class="quote-text">"' + ch.quote.text + '"</div>';
    quoteEl.innerHTML += '<div class="quote-source">— ' + ch.quote.source;
    if (ch.quote.page) quoteEl.innerHTML += ', ' + ch.quote.page;
    quoteEl.innerHTML += '</div>';
    quoteEl.innerHTML += '</div>';
    quoteEl.innerHTML += '<button class="quote-continue" id="quote-done">Torna alla mappa →</button>';
    quoteEl.classList.remove("hidden");
    document.getElementById("quote-done").addEventListener("click", function () {
      playPageTurn();
      Engine.finishChapter();
    });
  }

  function showQuotePopup(ch) {
    playCollect();
    var popup = document.getElementById("quote-popup");
    if (!popup) return;
    popup.innerHTML = '<div class="qp-inner">📓 Citazione raccolta!<br><span class="qp-title">' + ch.title + '</span></div>';
    popup.classList.add("show");
    setTimeout(function () { popup.classList.remove("show"); }, 2000);
  }

  function onMinigameComplete(data) {
    var s = Engine.getState();
    var ch = DATA.CHAPTERS[s.currentChapter];
    if (!ch) return;
    var minigameEl = document.getElementById("ch-minigame");
    var quoteEl = document.getElementById("ch-quote");
    if (minigameEl) minigameEl.classList.add("hidden");
    showQuoteOnly(ch, quoteEl);
  }

  function showQuaderno() {
    var el = document.getElementById("quaderno-screen");
    if (!el) return;
    var s = Engine.getState();
    var html = '<div class="q-header">';
    html += '<button class="q-back" id="q-back">← Mappa</button>';
    html += '<h2 class="q-title">📓 Il Quaderno</h2>';
    html += '</div>';

    DATA.CHAPTERS.forEach(function (ch) {
      var collected = s.collectedQuotes.includes(ch.id);
      html += '<div class="q-entry' + (collected ? '' : ' locked') + '">';
      if (collected) {
        html += '<div class="q-book">' + ch.book + ' (' + ch.year + ')</div>';
        html += '<div class="q-quote">"' + ch.quote.text + '"</div>';
        html += '<div class="q-page">' + ch.quote.page + '</div>';
      } else {
        html += '<div class="q-locked">🔒 Citazione non ancora raccolta</div>';
      }
      html += '</div>';
    });

    html += '<div class="q-moral">';
    html += '<div class="q-moral-text">La letteratura non è dottrina. È narrazione.';
    html += '«La fede è un mistero della persona, la religione è una narrazione collettiva.»</div>';
    html += '<div class="q-moral-attr">— Emmanuel Carrère</div>';
    html += '</div>';

    el.innerHTML = html;
    el.classList.remove("hidden");

    el.querySelector("#q-back").addEventListener("click", function () { Engine.setScreen("map"); });
  }

  function showFinale() {
    var el = document.getElementById("finale-screen");
    if (!el) return;
    var f = DATA.FINALE;
    var html = '<div class="finale-container">';
    html += '<div class="finale-book" id="finale-book">';
    html += '<div class="finale-lines" id="finale-lines"></div>';
    html += '<div class="finale-source">' + f.source + '</div>';
    html += '</div>';
    html += '<div class="finale-moral hidden" id="finale-moral">';
    html += '<div class="finale-moral-text">' + f.moral + '</div>';
    html += '<div class="finale-final">' + f.final + '</div>';
    html += '<div class="finale-cta">' + f.callToAction + '</div>';
    html += '<button class="finale-share" id="finale-share">📤 Condividi</button>';
    html += '<button class="finale-restart" id="finale-restart">📖 Ricomincia</button>';
    html += '</div></div>';
    el.innerHTML = html;
    el.classList.remove("hidden");

    var linesEl = el.querySelector("#finale-lines");
    var lineIdx = 0;
    var typeInterval = setInterval(function () {
      if (lineIdx >= f.lines.length) {
        clearInterval(typeInterval);
        setTimeout(function () {
          el.querySelector("#finale-moral").classList.remove("hidden");
          playFinale();
        }, 800);
        return;
      }
      var div = document.createElement("div");
      div.className = "finale-line";
      div.textContent = f.lines[lineIdx];
      linesEl.appendChild(div);
      lineIdx++;
    }, 1500);

    setTimeout(function () {
      var shareBtn = el.querySelector("#finale-share");
      if (shareBtn) {
        shareBtn.addEventListener("click", function () {
          if (navigator.share) {
            navigator.share({ title: "VITE — Emmanuel Carrère", text: f.shareText }).catch(function () { });
          } else if (navigator.clipboard) {
            navigator.clipboard.writeText(f.shareText).then(function () { alert("Copiato!"); });
          }
        });
      }
      var restartBtn = el.querySelector("#finale-restart");
      if (restartBtn) {
        restartBtn.addEventListener("click", function () { Engine.reset(); });
      }
    }, f.lines.length * 1500 + 1000);
  }

  return { init: init };

})();

document.addEventListener("DOMContentLoaded", function () {
  Engine.init();
  UI.init();
});
