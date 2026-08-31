(function() {
  const chapters = StoryData.chapters;
  const $ = id => document.getElementById(id);
  let currentView = 'menu', currentChapter = 0, dialogueIdx = 0, skipping = false;

  // PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Falling petals
  function createPetals() {
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = pickRandom(['🌸','🌺','🌷','🌼','💮','🏵️']);
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.fontSize = (10 + Math.random() * 10) + 'px';
      document.body.appendChild(p);
    }
  }
  function pickRandom(a) { return a[Math.floor(Math.random() * a.length)]; }
  createPetals();

  // Save system
  const SAVE_KEY = 'pp_save_v1';
  function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : { completedChapters: [], money: 0 }; } catch(e) { return { completedChapters: [], money: 0 }; } }
  function saveSave(d) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch(e) {} }
  function addMoney(d, m) { d.money = (d.money || 0) + m; saveSave(d); }
  function completeChapter(d, idx) { if (!d.completedChapters.includes(idx)) { d.completedChapters.push(idx); saveSave(d); } }
  function isChapterDone(d, idx) { return d.completedChapters.includes(idx); }
  function isChapterUnlocked(d, idx) { return idx === 0 || d.completedChapters.includes(idx - 1) || d.completedChapters.includes(idx); }
  function progress(d) { return Math.round((d.completedChapters.length / chapters.length) * 100); }

  // Menu
  function renderMenu() {
    currentView = 'menu';
    $('menu-view').style.display = '';
    $('game-view').style.display = 'none';
    const d = loadSave();
    let html = '';
    if (d.completedChapters.length > 0) {
      html += `<div class="continue-banner"><div class="cb-text">🌸 Continua il viaggio<small>Progresso: ${progress(d)}%</small></div><button class="btn small green" id="btn-continue">Continua →</button></div>`;
    }
    html += `<button class="btn primary" id="btn-new">🐱 Nuovo Viaggio</button>`;
    if (d.completedChapters.length >= chapters.length) {
      html += `<button class="btn" id="btn-garden-menu" style="border-color:var(--sage);background:linear-gradient(135deg,#e8f5e9,#c8e6c9)">🌸 Giardino Infinito</button>`;
    }
    $('menu-actions').innerHTML = html;
    $('btn-new').onclick = () => {
      const hasProgress = d.completedChapters.length > 0;
      if (hasProgress && !confirm('Vuoi ricominciare da capo? Il progresso attuale verrà cancellato.')) return;
      saveSave({ completedChapters: [], money: 0 });
      startChapter(0);
    };
    const cb = document.getElementById('btn-continue');
    if (cb) cb.onclick = () => startChapter(d.completedChapters.length > 0 ? Math.min(d.completedChapters.length, chapters.length - 1) : 0);
    const gb = document.getElementById('btn-garden-menu');
    if (gb) gb.onclick = startGarden;
  }

  // Chapter bar
  function renderChapterBar() {
    const d = loadSave();
    $('chbar').innerHTML = chapters.map((ch, i) => {
      let cls = 'chap';
      if (i === currentChapter) cls += ' on';
      else if (isChapterDone(d, i)) cls += ' done';
      else if (!isChapterUnlocked(d, i)) cls += ' locked';
      return `<div class="${cls}" data-ch="${i}"><span class="emoji">${ch.icon}</span>${i + 1}</div>`;
    }).join('');
    $('chbar').querySelectorAll('.chap:not(.locked)').forEach(el => {
      el.onclick = () => { const idx = +el.dataset.ch; if (isChapterUnlocked(loadSave(), idx)) startChapter(idx); };
    });
    const active = $('chbar').querySelector('.chap.on');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  function updateProgress() {
    const d = loadSave();
    const p = progress(d);
    $('prog-bar').style.width = Math.min(100, p) + '%';
    $('prog-pct').textContent = p + '%';
  }

  // Start chapter
  function startChapter(idx) {
    if (idx >= chapters.length) { renderMenu(); return; }
    currentChapter = idx;
    currentView = 'game';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    $('chapter-title').textContent = chapters[idx].icon + ' ' + chapters[idx].title;
    renderChapterBar();
    updateProgress();
    dialogueIdx = 0;
    skipping = false;
    showDialogue(chapters[idx]);
  }

  // Dialogue
  function showDialogue(ch) {
    const overlay = $('story-overlay');
    const d = ch.dialogue[dialogueIdx];
    if (!d) { overlay.classList.remove('on'); startMinigame(ch); return; }
    overlay.classList.add('on');
    const portraits = { musa: '🐱', primo: '🌼', aurelio: '📜', narratore: '📖' };
    $('story-portrait').textContent = portraits[d.who] || '💬';
    $('story-speaker').textContent = d.who.charAt(0).toUpperCase() + d.who.slice(1);
    $('story-speaker').className = 'speaker ' + d.who;
    $('story-text').textContent = '';
    let ti = 0;
    const timer = setInterval(() => { if (ti < d.text.length) { $('story-text').textContent += d.text[ti]; ti++; } else clearInterval(timer); }, 18);
    const isLast = dialogueIdx >= ch.dialogue.length - 1;
    $('story-acts').innerHTML = `
      <button class="btn small ghost" id="story-skip">⏭️ Salta</button>
      <button class="btn primary" id="story-next">${isLast ? '🎮 Gioca!' : '→ Avanti'}</button>
    `;
    document.getElementById('story-next').onclick = () => { clearInterval(timer); dialogueIdx++; showDialogue(ch); };
    document.getElementById('story-skip').onclick = () => {
      clearInterval(timer); skipping = true; dialogueIdx = ch.dialogue.length;
      $('story-overlay').classList.remove('on');
      startMinigame(ch);
    };
  }

  // Minigame
  function startMinigame(ch) {
    const area = $('game-area');
    MiniGames.start(ch.minigame, area, (passed, score) => {
      if (ch.lesson && !skipping) {
        $('story-overlay').classList.add('on');
        $('story-portrait').textContent = '📖';
        $('story-speaker').textContent = 'Il Sapere di Aurelio';
        $('story-speaker').className = 'speaker aurelio';
        $('story-text').textContent = ch.lesson;
        $('story-acts').innerHTML = `<button class="btn primary" id="lesson-ok">${passed ? '✅ Prossimo capitolo' : '🔄 Riprova'}</button>`;
        document.getElementById('lesson-ok').onclick = () => {
          $('story-overlay').classList.remove('on');
          if (passed) {
            const d = loadSave(); completeChapter(d, currentChapter); addMoney(d, score);
            updateProgress(); renderChapterBar();
            if (currentChapter < chapters.length - 1) startChapter(currentChapter + 1);
            else renderMenu();
          } else startChapter(currentChapter);
        };
      } else if (passed) {
        const d = loadSave(); completeChapter(d, currentChapter); addMoney(d, score);
        updateProgress(); renderChapterBar();
        if (currentChapter < chapters.length - 1) startChapter(currentChapter + 1);
        else renderMenu();
      } else startChapter(currentChapter);
    });
  }

  // Concept overlay
  function showConcept(key) {
    const c = Concepts[key];
    if (!c) return;
    $('concept-title').textContent = c.title;
    $('concept-body').innerHTML = c.body;
    $('concept-overlay').classList.add('on');
  }
  $('concept-close').onclick = () => $('concept-overlay').classList.remove('on');

  // Garden
  function startGarden() {
    currentView = 'garden';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    $('chapter-title').textContent = '🌸 Giardino Infinito';
    $('chbar').innerHTML = '<div class="chap on" style="background:var(--sage);border-color:var(--sage)"><span class="emoji">🌸</span>GIARDINO</div>';
    $('prog-bar').style.width = '100%';
    $('prog-pct').textContent = '∞';
    Garden.start($('game-area'));
  }

  // Back
  $('btn-menu').onclick = renderMenu;

  // Init
  renderMenu();
})();
