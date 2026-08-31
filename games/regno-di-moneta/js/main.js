// main.js — Router, dialoghi e UI
(function() {
  const chapters = StoryData.chapters;
  const $ = id => document.getElementById(id);

  let currentView = 'menu'; // menu | game | empire
  let currentChapter = 0;
  let dialogueIdx = 0;
  let skipping = false;

  // === INIT ===
  Save.load();
  renderMenu();

  // === MENU ===
  function renderMenu() {
    currentView = 'menu';
    Empire.stopEmpire();
    $('menu-view').style.display = '';
    $('game-view').style.display = 'none';

    const saved = Save.get();
    const btns = $('menu-actions');
    let html = '';

    if (saved.completedChapters.length > 0 && saved.empireUnlocked) {
      html += `
        <div class="continue-banner" id="continue-banner">
          <div class="cb-text">
            🏰 Continua il Regno
            <small>Progresso: ${Save.progress(chapters.length)}%</small>
          </div>
          <button class="btn small green" id="btn-continue">Continua →</button>
        </div>`;
    }

    html += `<button class="btn primary" id="btn-new">⚔️ Nuova Avventura</button>`;

    if (saved.empireUnlocked) {
      html += `<button class="btn" id="btn-empire-menu" style="border-color:var(--purple);background:linear-gradient(135deg,#F3E5F5,#E1BEE7)">👑 Impero di Soldania</button>`;
    }

    btns.innerHTML = html;

    $('btn-new').onclick = () => {
      const hasProgress = Save.get().completedChapters.length > 0;
      if (hasProgress && !confirm('Vuoi ricominciare da capo? Il progresso attuale verrà cancellato.')) return;
      Save.reset();
      Save.load();
      startChapter(0);
    };

    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) continueBtn.onclick = () => startChapter(saved.currentChapter || 0);

    const empireBtn = document.getElementById('btn-empire-menu');
    if (empireBtn) empireBtn.onclick = startEmpireView;
  }

  // === START CHAPTER ===
  function startChapter(idx) {
    if (idx >= chapters.length) {
      if (Save.get().empireUnlocked) return startEmpireView();
      return renderMenu();
    }

    currentChapter = idx;
    currentView = 'game';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';

    const ch = chapters[idx];
    $('chapter-title').textContent = ch.icon + ' ' + ch.title;
    renderChapterBar();
    updateProgress();

    // Start dialogue
    dialogueIdx = 0;
    showDialogue(ch);
  }

  // === CHAPTER BAR ===
  function renderChapterBar() {
    const bar = $('chbar');
    bar.innerHTML = chapters.map((ch, i) => {
      let cls = 'chap';
      if (i === currentChapter) cls += ' on';
      else if (Save.isChapterDone(i)) cls += ' done';
      else if (!Save.isChapterUnlocked(i)) cls += ' locked';
      return `<div class="${cls}" data-ch="${i}"><span class="emoji">${ch.icon}</span>${i + 1}</div>`;
    }).join('');

    bar.querySelectorAll('.chap:not(.locked)').forEach(el => {
      el.onclick = () => {
        const idx = +el.dataset.ch;
        if (Save.isChapterUnlocked(idx)) startChapter(idx);
      };
    });
    // Auto-scroll to current chapter
    const active = bar.querySelector('.chap.on');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  function updateProgress() {
    const p = Save.progress(chapters.length);
    $('prog-bar').style.width = Math.min(100, p) + '%';
    $('prog-pct').textContent = p + '%';
    const saved = Save.get();
    $('hdr-money').textContent = '💰 €' + saved.money;
    $('hdr-money').classList.toggle('broke', saved.money <= 0);
  }

  // === DIALOGUE ===
  function showDialogue(ch) {
    const overlay = $('story-overlay');
    const d = ch.dialogue[dialogueIdx];

    if (!d) {
      overlay.classList.remove('on');
      startMinigame(ch);
      return;
    }

    overlay.classList.add('on');
    const portraits = { lia: '🧑‍🌾', bartolo: '👴', contabilia: '🧙', inflazion: '🐉', tizio: '🦹' };
    $('story-portrait').textContent = portraits[d.who] || '💬';
    $('story-speaker').textContent = d.who.charAt(0).toUpperCase() + d.who.slice(1);
    $('story-speaker').className = 'speaker ' + d.who;
    $('story-text').textContent = '';
    $('story-lesson').style.display = 'none';

    // Typewriter effect
    let ti = 0;
    const typeTimer = setInterval(() => {
      if (ti < d.text.length) {
        $('story-text').textContent += d.text[ti];
        ti++;
      } else {
        clearInterval(typeTimer);
      }
    }, 18);

    const isLast = dialogueIdx >= ch.dialogue.length - 1;
    $('story-acts').innerHTML = `
      <button class="btn small ghost" id="story-skip">⏭️ Salta storia</button>
      <button class="btn primary" id="story-next">${isLast ? '🎮 Gioca!' : '→ Prossimo'}</button>
    `;

    document.getElementById('story-next').onclick = () => {
      clearInterval(typeTimer);
      dialogueIdx++;
      showDialogue(ch);
    };

    document.getElementById('story-skip').onclick = () => {
      clearInterval(typeTimer);
      dialogueIdx = ch.dialogue.length;
      skipping = true;
      // Show lesson before skipping to minigame
      if (ch.lesson) {
        $('story-text').textContent = ch.lesson;
        $('story-lesson').style.display = 'none';
        $('story-speaker').textContent = 'Contabilia';
        $('story-speaker').className = 'speaker contabilia';
        $('story-portrait').textContent = '🧙';
        $('story-acts').innerHTML = `<button class="btn primary" id="story-skip2">🎮 Inizia il minigioco!</button>`;
        document.getElementById('story-skip2').onclick = () => {
          $('story-overlay').classList.remove('on');
          skipping = false;
          startMinigame(ch);
        };
      } else {
        $('story-overlay').classList.remove('on');
        skipping = false;
        startMinigame(ch);
      }
    };
  }

  // === MINIGAME ===
  function startMinigame(ch) {
    const area = $('game-area');
    MiniGames.start(ch.minigame, area, (passed, score) => {
      // Show lesson after minigame
      if (ch.lesson && !skipping) {
        $('story-overlay').classList.add('on');
        $('story-portrait').textContent = '🧙';
        $('story-speaker').textContent = 'Contabilia';
        $('story-speaker').className = 'speaker contabilia';
        $('story-text').textContent = ch.lesson;
        $('story-lesson').style.display = 'none';
        $('story-acts').innerHTML = `<button class="btn primary" id="lesson-ok">${passed ? '✅ Prossimo capitolo' : '🔄 Riprova'}</button>`;
        document.getElementById('lesson-ok').onclick = () => {
          $('story-overlay').classList.remove('on');
          if (passed) {
            Save.completeChapter(currentChapter);
            Save.addMoney(score);
            updateProgress();
            renderChapterBar();
            startChapter(currentChapter + 1);
          } else {
            startChapter(currentChapter);
          }
        };
      } else if (passed) {
        Save.completeChapter(currentChapter);
        Save.addMoney(score);
        updateProgress();
        renderChapterBar();
        startChapter(currentChapter + 1);
      } else {
        startChapter(currentChapter);
      }
    });
  }

  // === EMPIRE VIEW ===
  function startEmpireView() {
    currentView = 'empire';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    $('chapter-title').textContent = '👑 Impero di Soldania';
    $('chbar').innerHTML = '<div class="chap on" style="background:var(--purple);border-color:var(--purple)"><span class="emoji">👑</span>IMPERO</div>';
    $('prog-bar').style.width = '100%';
    $('prog-pct').textContent = '∞';
    Empire.startEmpire($('game-area'));
  }

  // === BACK TO MENU ===
  $('btn-menu').onclick = () => {
    Empire.stopEmpire();
    renderMenu();
  };

  // === HEADER MONEY UPDATE ===
  setInterval(() => {
    if (currentView === 'game' || currentView === 'empire') {
      const saved = Save.get();
      $('hdr-money').textContent = '💰 €' + (currentView === 'empire' ? Empire.formatMoney(saved.empire.money) : saved.money);
      $('hdr-money').classList.toggle('broke', (currentView === 'empire' ? saved.empire.money : saved.money) <= 0);
    }
  }, 500);

})();
