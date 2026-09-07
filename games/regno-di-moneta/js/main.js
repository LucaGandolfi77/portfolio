// main.js — Router, dialoghi e UI + Sound + Streak + Achievements + Onboarding + Haptics
(function() {
  const chapters = StoryData.chapters;
  const $ = id => document.getElementById(id);

  // Haptic feedback (Vibration API)
  function haptic(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
  }

  let currentView = 'menu'; // menu | game | empire
  let currentChapter = 0;
  let dialogueIdx = 0;
  let skipping = false;

  // === INIT ===
  Save.load();
  updateStreakDisplay();
  renderMenu();
  setupSoundToggle();

  // Onboarding per nuovi giocatori
  Onboarding.start(() => {
    // callback dopo onboarding (o subito se già visto)
  });

  // Check achievements all'avvio
  setTimeout(() => Achievements.checkAndNotify(), 1000);

  // === SOUND TOGGLE ===
  function setupSoundToggle() {
    const btn = $('btn-sound');
    if (!btn) return;
    btn.textContent = Sounds.isMuted() ? '🔇' : '🔊';
    btn.onclick = () => {
      const on = Sounds.toggle();
      btn.textContent = on ? '🔊' : '🔇';
      if (on) Sounds.play('click');
    };
  }

  // === STREAK DISPLAY ===
  function updateStreakDisplay() {
    const el = $('streak-display');
    if (!el) return;
    const streak = Save.getStreak();
    if (streak && streak.count > 0) {
      el.innerHTML = `<div class="streak-badge ${streak.count >= 3 ? 'fire' : ''}">🔥 ${streak.count}g</div>`;
    } else {
      el.innerHTML = '';
    }
  }

  // === MENU ===
  function renderMenu() {
    currentView = 'menu';
    Empire.stopEmpire();
    $('menu-view').style.display = '';
    $('game-view').style.display = 'none';

    updateStreakDisplay();

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

    // Achievements button
    html += `<button class="btn" id="btn-achievements" style="border-color:var(--gold);background:linear-gradient(135deg,#FFF8E1,#FFE082)">🏆 Achievements (${Achievements.count()}/${Achievements.total()})</button>`;

    // Leagues button
    const leagueScore = Leagues.getPlayerScore(saved);
    const league = Leagues.getLeagueForScore(leagueScore);
    html += `<button class="btn" id="btn-leagues" style="border-color:${league.color};background:linear-gradient(135deg,${league.color}22,${league.color}44)">${league.emoji} Leagues — ${league.name}</button>`;

    // Store button
    if (!Monetization.isPremium()) {
      html += `<button class="btn" id="btn-store" style="border-color:var(--green);background:linear-gradient(135deg,#E8F5E9,#C8E6C9)">🛒 Negozio</button>`;
    }

    // Language selector
    const currentLang = I18n.getLanguage();
    const langInfo = I18n.LANGUAGES[currentLang];
    html += `<button class="btn small" id="btn-lang" style="border-color:var(--dim);font-size:11px;padding:6px 12px">${langInfo.flag} ${langInfo.nativeName}</button>`;

    btns.innerHTML = html;

    $('btn-new').onclick = () => {
      Sounds.play('click');
      haptic(10);
      const hasProgress = Save.get().completedChapters.length > 0;
      if (hasProgress && !confirm('Vuoi ricominciare da capo? Il progresso attuale verrà cancellato.')) return;
      Save.reset();
      Save.load();
      startChapter(0);
    };

    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) continueBtn.onclick = () => {
      Sounds.play('click');
      startChapter(saved.currentChapter || 0);
    };

    const empireBtn = document.getElementById('btn-empire-menu');
    if (empireBtn) empireBtn.onclick = () => {
      Sounds.play('click');
      startEmpireView();
    };

    const achBtn = document.getElementById('btn-achievements');
    if (achBtn) achBtn.onclick = () => {
      Sounds.play('click');
      showAchievementsPanel();
    };

    const leaguesBtn = document.getElementById('btn-leagues');
    if (leaguesBtn) leaguesBtn.onclick = () => {
      Sounds.play('click');
      showLeaguesPanel();
    };

    const storeBtn = document.getElementById('btn-store');
    if (storeBtn) storeBtn.onclick = () => {
      Sounds.play('click');
      showStorePanel();
    };

    const langBtn = document.getElementById('btn-lang');
    if (langBtn) langBtn.onclick = () => {
      Sounds.play('click');
      showLanguagePanel();
    };
  }

  // === ACHIEVEMENTS PANEL ===
  function showAchievementsPanel() {
    const all = Achievements.getAll();
    const pct = Achievements.pct();
    const grid = all.map(a => `
      <div class="ach-item ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-emoji">${a.icon}</div>
        <div class="ach-name">${a.title}</div>
        <div class="ach-d">${a.desc}</div>
      </div>
    `).join('');

    $('modal-icon').textContent = '🏆';
    $('modal-title').textContent = 'Achievements';
    $('modal-txt').innerHTML = `<div class="ach-progress">${pct}% completato (${Achievements.count()}/${Achievements.total()})</div><div class="ach-grid">${grid}</div>`;
    $('modal-acts').innerHTML = `
      <button class="btn small" id="modal-share" style="border-color:var(--gold);background:linear-gradient(135deg,#FFF8E1,#FFE082)">📤 Condividi</button>
      <button class="btn primary" id="modal-close">Chiudi</button>
    `;
    $('modal').classList.add('on');

    document.getElementById('modal-close').onclick = () => {
      $('modal').classList.remove('on');
    };
    document.getElementById('modal-share').onclick = () => {
      Sounds.play('click');
      Share.shareProgress();
    };
  }

  // === LEAGUES PANEL ===
  function showLeaguesPanel() {
    const saved = Save.get();
    const leaguesHtml = Leagues.renderLeaguesPanel(saved);

    $('modal-icon').textContent = '⚔️';
    $('modal-title').textContent = 'Leagues';
    $('modal-txt').innerHTML = leaguesHtml;
    $('modal-acts').innerHTML = `
      <button class="btn primary" id="modal-close">Chiudi</button>
    `;
    $('modal').classList.add('on');

    document.getElementById('modal-close').onclick = () => {
      $('modal').classList.remove('on');
    };
  }

  function checkLeaguePromotion() {
    const saved = Save.get();
    const result = Leagues.checkPromotion(saved);
    if (result) {
      saved.league = result.to.id;
      Save.save();
      setTimeout(() => {
        $('modal-icon').textContent = result.promoted ? '🎉' : '📉';
        $('modal-title').textContent = result.promoted ? 'Promozione!' : 'Retrocessione';
        $('modal-txt').innerHTML = `
          <div style="text-align:center">
            <div style="font-size:48px;margin:12px 0">${result.to.emoji}</div>
            <div style="font-size:16px;font-weight:800;color:${result.to.color}">
              ${result.from.emoji} ${result.from.name} → ${result.to.emoji} ${result.to.name}
            </div>
            ${result.reward > 0 ? `<div style="font-size:12px;color:var(--green);margin-top:8px">+€${result.reward} bonus!</div>` : ''}
          </div>`;
        $('modal-acts').innerHTML = `<button class="btn primary" id="modal-close">Continua</button>`;
        $('modal').classList.add('on');
        document.getElementById('modal-close').onclick = () => {
          $('modal').classList.remove('on');
        };
        if (result.promoted) {
          Sounds.play('levelup');
          haptic([10, 50, 10, 50, 10]);
          Save.addMoney(result.reward);
        } else {
          Sounds.play('wrong');
          haptic([30, 50, 30]);
        }
      }, 500);
    }
  }

  // === STORE PANEL ===
  function showStorePanel() {
    const storeHtml = Monetization.renderStorePanel();

    $('modal-icon').textContent = '🛒';
    $('modal-title').textContent = 'Negozio';
    $('modal-txt').innerHTML = storeHtml;
    $('modal-acts').innerHTML = `
      <button class="btn primary" id="modal-close">Chiudi</button>
    `;
    $('modal').classList.add('on');

    document.getElementById('modal-close').onclick = () => {
      $('modal').classList.remove('on');
    };
  }

  // === LANGUAGE PANEL ===
  function showLanguagePanel() {
    const langHtml = I18n.renderLanguageSelector();

    $('modal-icon').textContent = '🌍';
    $('modal-title').textContent = 'Lingua / Language';
    $('modal-txt').innerHTML = `<div style="padding:8px">${langHtml}</div>`;
    $('modal-acts').innerHTML = `
      <button class="btn primary" id="modal-close">Chiudi</button>
    `;
    $('modal').classList.add('on');

    document.getElementById('modal-close').onclick = () => {
      $('modal').classList.remove('on');
    };
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

    Save.setCurrentChapter(idx);
    Sounds.play('chapter');

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
        if (Save.isChapterUnlocked(idx)) {
          Sounds.play('click');
          startChapter(idx);
        }
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

    // Typewriter effect with skip-on-tap
    let ti = 0;
    let typeComplete = false;
    const typeTimer = setInterval(() => {
      if (ti < d.text.length) {
        $('story-text').textContent += d.text[ti];
        ti++;
      } else {
        clearInterval(typeTimer);
        typeComplete = true;
      }
    }, 18);

    // Tap to complete typewriter instantly
    $('story-text').onclick = () => {
      if (!typeComplete) {
        clearInterval(typeTimer);
        $('story-text').textContent = d.text;
        typeComplete = true;
      }
    };

    const isLast = dialogueIdx >= ch.dialogue.length - 1;
    $('story-acts').innerHTML = `
      <button class="btn small ghost" id="story-skip">⏭️ Salta storia</button>
      <button class="btn primary" id="story-next">${isLast ? '🎮 Gioca!' : '→ Prossimo'}</button>
    `;

    document.getElementById('story-next').onclick = () => {
      clearInterval(typeTimer);
      Sounds.play('click');
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
            Sounds.play('coin');
            haptic([10, 30, 10]);
            Save.completeChapter(currentChapter);
            const multiplier = Monetization.getMoneyMultiplier();
            Save.addMoney(Math.round(score * multiplier));
            updateProgress();
            renderChapterBar();
            Achievements.checkAndNotify();
            checkLeaguePromotion();
            Monetization.showInterstitial();
            startChapter(currentChapter + 1);
          } else {
            Sounds.play('wrong');
            haptic([30, 50, 30]);
            startChapter(currentChapter);
          }
        };
      } else if (passed) {
        Sounds.play('coin');
        haptic([10, 30, 10]);
        Save.completeChapter(currentChapter);
        const multiplier = Monetization.getMoneyMultiplier();
        Save.addMoney(Math.round(score * multiplier));
        updateProgress();
        renderChapterBar();
        Achievements.checkAndNotify();
        checkLeaguePromotion();
        Monetization.showInterstitial();
        startChapter(currentChapter + 1);
      } else {
        Sounds.play('wrong');
        haptic([30, 50, 30]);
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
    Sounds.play('click');
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
