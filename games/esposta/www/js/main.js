(function(){
  const STORY = window.StoryData.chapters;
  const CONCEPTS = window.ConceptsData;
  const CASES = window.CasesData;
  const t = (k) => window.I18n.t(k);
  const lang = () => window.I18n.getLang();

  let state = Save.load();
  let playTimer = null;

  const $ = id => document.getElementById(id);

  function persistState() {
    state.lastPlayed = new Date().toISOString();
    Save.save(state);
  }

  // === PLAY TIME TRACKING ===
  function startPlayTimer() {
    if (playTimer) clearInterval(playTimer);
    playTimer = setInterval(() => {
      state.totalPlayTime++;
    }, 1000);
  }

  function stopPlayTimer() {
    if (playTimer) { clearInterval(playTimer); playTimer = null; }
    persistState();
  }

  // === LANGUAGE TOGGLE ===
  function initLang() {
    const btn = $('btn-lang');
    const l = lang();
    btn.textContent = l === 'en' ? '🇬🇧 EN' : '🇮🇹 IT';
    document.getElementById('meta-desc').content = t('meta_description');
    btn.onclick = () => {
      const oldLang = lang();
      const newLang = oldLang === 'it' ? 'en' : 'it';
      window.I18n.setLang(newLang);
      state.language = newLang;
      persistState();
      btn.textContent = newLang === 'en' ? '🇬🇧 EN' : '🇮🇹 IT';
      document.getElementById('meta-desc').content = t('meta_description');
      window.Analytics && window.Analytics.trackEvent('language_changed', { from: oldLang, to: newLang });
      renderMenu();
    };
    document.addEventListener('langchange', () => {
      renderMenu();
    });
  }

  // === RENDER MENU ===
  function renderMenu() {
    stopPlayTimer();
    $('menu-view').style.display = '';
    $('game-view').style.display = 'none';
    $('menu-subtitle').textContent = t('menu_subtitle');
    const hasProgress = state.completedChapters.length > 0;
    let html = '';
    if(hasProgress) {
      const savedDate = Save.formatSaveDate(state.lastPlayed);
      const playTime = Save.formatPlayTime(state.totalPlayTime);
      html += `
        <div class="continue-banner fade-in">
          <div class="cb-text">
            ${t('menu_continue_from')} ${state.completedChapters.length}/${STORY.length}
            <small>${STORY[state.currentChapter]?.title || t('next_chapter')} · ${playTime} · ${savedDate}</small>
          </div>
          <button class="btn small primary" id="btn-continue">${t('menu_continue')}</button>
        </div>`;
    }
    html += `<button class="btn primary" id="btn-start">${hasProgress ? t('menu_restart') : t('menu_start')}</button>`;
    if(state.completedChapters.length >= STORY.length) {
      html += `<button class="btn green" id="btn-agency">${t('menu_agency')}</button>`;
      html += `<button class="btn ghost" id="btn-reset">${t('menu_reset')}</button>`;
    }
    $('menu-actions').innerHTML = html;
    if($('btn-continue')) $('btn-continue').onclick = () => startGame(Math.min(state.currentChapter, STORY.length - 1));
    if($('btn-start')) $('btn-start').onclick = () => {
      state.completedChapters = [];
      state.scores = {};
      state.currentChapter = 0;
      state.examScore = null;
      state.examCompleted = false;
      persistState();
      startGame(0);
    };
    if($('btn-agency')) $('btn-agency').onclick = startAgency;
    if($('btn-reset')) $('btn-reset').onclick = () => {
      if(confirm(t('menu_reset_confirm'))) {
        state = Save.reset();
        renderMenu();
      }
    };
  }

  // === START GAME ===
  function startGame(idx) {
    state.currentChapter = idx;
    persistState();
    window.Analytics && window.Analytics.trackEvent('chapter_started', { chapterId: STORY[idx]?.id || idx });
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    renderChapters();
    playStory(idx);
    startPlayTimer();
  }

  // === CHAPTER BAR ===
  function renderChapters() {
    const bar = $('chbar');
    bar.innerHTML = STORY.map((ch, i) => {
      const cls = state.completedChapters.includes(i) ? 'chap done' : i === state.currentChapter ? 'chap on' : 'chap locked';
      return `<div class="${cls}" data-i="${i}"><span class="emoji">${ch.icon}</span>${i+1}</div>`;
    }).join('');
    bar.querySelectorAll('.chap').forEach(el => {
      el.onclick = () => {
        const i = +el.dataset.i;
        if(state.completedChapters.includes(i) || i === state.currentChapter) startGame(i);
      };
    });
    const done = state.completedChapters.length;
    const pct = Math.round((done / STORY.length) * 100);
    $('prog-bar').style.width = pct + '%';
    $('prog-pct').textContent = pct + '%';
    $('chapter-title').textContent = STORY[state.currentChapter]?.title || '';
  }

  // === STORY DIALOGUE ===
  function playStory(chIdx) {
    const ch = STORY[chIdx];
    const l = lang();
    const dlg = (l === 'en' && window.STORYTranslations?.en?.[ch.id]) ? window.STORYTranslations.en[ch.id] : ch.dialogue;
    let dIdx = 0;
    const overlay = $('story-overlay');

    const show = () => {
      if(dIdx >= dlg.length) { overlay.classList.remove('on'); afterStory(chIdx); return; }
      const d = dlg[dIdx];
      const portraits = { zio:'🧑‍🔧', nonna:'📖', filtro:'🤳', narratore:'🎬' };
      const nameKeys = { zio:'story_speaker_zio', nonna:'story_speaker_nonna', filtro:'story_speaker_filtro', narratore:'story_speaker_narratore' };
      $('story-portrait').textContent = portraits[d.who] || '📸';
      $('story-speaker').textContent = t(nameKeys[d.who]) || d.who;
      $('story-speaker').className = 'speaker ' + d.who;
      $('story-text').textContent = '';
      overlay.classList.add('on');

      // Typewriter
      let tIdx = 0;
      const txt = d.text;
      const typeInterval = setInterval(() => {
        tIdx += 2;
        $('story-text').textContent = txt.slice(0, tIdx);
        if(tIdx >= txt.length) clearInterval(typeInterval);
      }, 18);

      $('story-acts').innerHTML = dIdx < dlg.length - 1
        ? `<button class="btn small" id="dlg-next">${t('story_next')}</button>
           <button class="btn small ghost" id="dlg-skip">${t('story_skip')}</button>`
        : `<button class="btn small primary" id="dlg-next">${t('story_start_chapter')}</button>`;
      $('dlg-next').onclick = () => { clearInterval(typeInterval); dIdx++; show(); };
      if($('dlg-skip')) $('dlg-skip').onclick = () => { clearInterval(typeInterval); dIdx = dlg.length; show(); };
    };
    overlay.onclick = (e) => { if(e.target === overlay) { clearInterval(window._typeInterval); dIdx = dlg.length; show(); } };
    show();
  }

  // === AFTER STORY: show concepts + cases, then minigame ===
  function afterStory(chIdx) {
    const ch = STORY[chIdx];
    const conceptList = CONCEPTS[ch.id] || [];
    const caseKeys = Object.keys(CASES);

    if(conceptList.length > 0) {
      showConceptOverlay(conceptList, 0, ch.id, () => {
        showCaseIfAny(chIdx, () => renderMinigame(chIdx));
      });
    } else {
      showCaseIfAny(chIdx, () => renderMinigame(chIdx));
    }
  }

  function showConceptOverlay(list, idx, chapterId, onDone) {
    if(idx >= list.length) { onDone(); return; }
    const l = lang();
    const enList = l === 'en' ? (window.CONCEPTSTranslations?.en?.[chapterId] || list) : list;
    const c = enList[idx];
    const overlay = $('concept-overlay');
    $('concept-title').textContent = t('concept_prefix') + c.title;
    $('concept-body').innerHTML = c.body;
    overlay.classList.add('on');
    $('concept-close').textContent = idx < list.length - 1 ? t('concept_next') : t('concept_close');
    $('concept-close').onclick = () => {
      overlay.classList.remove('on');
      showConceptOverlay(list, idx + 1, chapterId, onDone);
    };
  }

  function showCaseIfAny(chIdx, onDone) {
    const caseKeys = Object.keys(CASES);
    if(chIdx < caseKeys.length) {
      const k = caseKeys[chIdx];
      const l = lang();
      const cs = (l === 'en' && window.CASESTranslations?.en?.[k]) ? window.CASESTranslations.en[k] : CASES[k];
      const overlay = $('concept-overlay');
      $('concept-title').textContent = t('case_prefix') + cs.brand;
      $('concept-body').innerHTML = `
        <div style="font-size:11px;color:var(--sepia);margin-bottom:6px">${cs.year} · ${cs.title}</div>
        <div style="font-size:12px;line-height:1.6;color:var(--cream);margin-bottom:8px">${cs.story}</div>
        <div class="c-case">
          <div class="c-case-title">${t('case_lesson')}</div>
          <div style="font-size:11px;color:var(--cream)">${cs.lesson}</div>
        </div>
        <div class="c-case" style="margin-top:6px">
          <div class="c-case-title">${t('case_metrics')}</div>
          <div style="font-size:11px;color:var(--cream)">${cs.metrics}</div>
        </div>
        <div style="font-size:10px;color:var(--dim);margin-top:6px;font-style:italic">${t('case_source')} ${cs.source}</div>`;
      overlay.classList.add('on');
      $('concept-close').textContent = t('concept_close');
      $('concept-close').onclick = () => { overlay.classList.remove('on'); onDone(); };
    } else {
      onDone();
    }
  }

  // === MINIGAME ===
  function renderMinigame(chIdx) {
    const ch = STORY[chIdx];
    const area = $('game-area');
    area.innerHTML = '';
    if(ch.minigame === 'esame') {
      Minigames.run('esame', area, (score, total) => {
        state.scores[ch.id] = { score, total };
        state.completedChapters.push(chIdx);
        state.examScore = score;
        state.examCompleted = true;
        persistState();
        window.Analytics && window.Analytics.trackEvent('chapter_completed', { chapterId: ch.id, score, timeSpent: state.totalPlayTime || 0 });
        if(score / total >= 0.7) {
          showModal('📸', t('modal_exam_passed'), t('modal_exam_passed_msg'), [
            { label: t('modal_exam_open_agency'), cls: 'primary', fn: () => { $('modal').classList.remove('on'); startAgency(); } }
          ]);
        } else {
          showModal('📖', t('modal_exam_study'), `${t('modal_score')} ${score}/${total}. ${t('modal_exam_retry_msg')}`, [
            { label: t('modal_exam_retry'), cls: 'primary', fn: () => { $('modal').classList.remove('on'); renderMinigame(chIdx); } },
            { label: t('modal_menu'), cls: '', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
          ]);
        }
      });
    } else {
      Minigames.run(ch.minigame, area, (score, total) => {
        state.scores[ch.id] = { score, total };
        state.completedChapters.push(chIdx);
        persistState();
        window.Analytics && window.Analytics.trackEvent('chapter_completed', { chapterId: ch.id, score, timeSpent: state.totalPlayTime || 0 });
        const nextIdx = chIdx + 1;
        if(nextIdx < STORY.length) {
          showModal('📸', STORY[chIdx].title + ' — ' + t('modal_chapter_done'), `${t('modal_score')} ${score}/${total}`, [
            { label: t('modal_next_chapter'), cls: 'primary', fn: () => { $('modal').classList.remove('on'); startGame(nextIdx); } },
            { label: t('modal_menu'), cls: 'ghost', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
          ]);
        } else {
          showModal('🏆', t('modal_all_done'), t('modal_all_done_msg'), [
            { label: t('modal_open_agency'), cls: 'green', fn: () => { $('modal').classList.remove('on'); startAgency(); } },
            { label: t('modal_menu'), cls: 'ghost', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
          ]);
        }
      });
    }
  }

  // === AGENCY MODE ===
  function startAgency() {
    stopPlayTimer();
    Agency.init();
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    $('chbar').innerHTML = '';
    $('prog-bar').style.width = '100%';
    $('prog-pct').textContent = '∞';
    $('chapter-title').textContent = t('agency_title');
    renderAgencyMenu();
  }

  function renderAgencyMenu() {
    const area = $('game-area');
    Agency.renderMenu(area);

    const newBtn = document.getElementById('agency-new');
    if(newBtn) newBtn.onclick = () => {
      const brief = Agency.startCampaign();
      renderAgencyBrief(brief);
    };

    const retireBtn = document.getElementById('agency-retire');
    if(retireBtn) retireBtn.onclick = () => {
      const s = Agency._state;
      const grade = s.reputation >= 8 ? 'S' : s.reputation >= 6 ? 'A' : s.reputation >= 4 ? 'B' : s.reputation >= 2 ? 'C' : 'D';
      showModal('🏢', t('agency_completed'), `${t('agency_reputation')} ${s.reputation}/10 · ${t('agency_clients_served')} ${s.clients_served} · ${t('agency_total_earned')} €${s.total_earned.toLocaleString()}\n${t('agency_grade')} ${grade}`, [
        { label: t('modal_menu'), cls: 'primary', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
      ]);
    };
  }

  function renderAgencyBrief(brief) {
    const area = $('game-area');
    const s = Agency._state;
    area.innerHTML = `
      <div class="mg-title">${t('agency_title')}</div>
      <div class="ag-header">
        <div class="ag-money">€${s.money.toLocaleString()}</div>
        <div class="ag-rate">⭐ ${t('agency_reputation')} ${s.reputation}/10 · ${t('agency_clients_served')} ${s.clients_served}</div>
      </div>
      <div class="mg-card">
        <div class="ag-brief">
          <div class="ab-title">${brief.client.emoji} ${brief.client.name}</div>
          <div class="ab-client">${t('agency_sector')} ${brief.client.type} · ${t('agency_budget')} €${s.current_budget.toLocaleString()} · ${t('agency_difficulty')} <span style="color:${brief.diff.color}">${brief.diff.name}</span></div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:4px">${t('agency_tone')} <i>${brief.client.tone}</i></div>
          <div style="font-size:11px;color:var(--dim)">${t('agency_needs')} ${brief.client.needs.join(', ')}</div>
        </div>
        <div class="mg-score">${t('agency_budget_left')} €${s.current_budget.toLocaleString()}</div>
        <div class="mg-grid" style="grid-template-columns:1fr 1fr;margin-top:8px" id="svc-grid">
          ${brief.services.map(sv => `
            <button class="mg-btn ag-svc" data-svc="${sv.name}" data-cost="${sv.cost}">
              ${sv.name} — €${sv.cost}<br><span style="font-size:9px;color:var(--dim)">${sv.effort}</span>
            </button>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn primary" id="agency-go">${t('agency_execute')}</button>
          <button class="btn red" id="agency-reject">${t('agency_reject')}</button>
        </div>
      </div>`;

    let spent = 0;
    const selected = new Set();
    area.querySelectorAll('.ag-svc').forEach(btn => {
      btn.onclick = () => {
        const svc = btn.dataset.svc;
        const cost = +btn.dataset.cost;
        if(selected.has(svc)) {
          selected.delete(svc);
          btn.style.border = '1px solid var(--line)';
          btn.style.background = 'var(--card2)';
          spent -= cost;
          Agency.spendOnService(svc, -cost);
        } else {
          selected.add(svc);
          btn.style.border = '2px solid var(--gold)';
          btn.style.background = 'var(--card)';
          spent += cost;
          Agency.spendOnService(svc, cost);
        }
        const rem = s.current_budget - s.current_spent;
        area.querySelector('.mg-score').textContent = `${t('agency_budget_left')} €${rem.toLocaleString()} / €${s.current_budget.toLocaleString()}`;
        if(rem < 0) area.querySelector('.mg-score').style.color = 'var(--red)';
        else area.querySelector('.mg-score').style.color = 'var(--gold)';
        document.getElementById('agency-go').disabled = selected.size === 0;
      };
    });

    document.getElementById('agency-go').onclick = () => {
      const result = Agency.completeCampaign();
      syncAgencyToSave();
      area.innerHTML = Agency._renderResult(result);
      document.getElementById('agency-continue').onclick = () => renderAgencyMenu();
    };
    document.getElementById('agency-reject').onclick = () => {
      Agency._state.current_client = null;
      Agency._state.current_services = [];
      Agency._state.current_spent = 0;
      Agency._state.current_budget = 0;
      Agency.save();
      syncAgencyToSave();
      renderAgencyMenu();
    };
  }

  function syncAgencyToSave() {
    const s = Agency._state;
    state.agencyState.money = s.money;
    state.agencyState.reputation = s.reputation;
    state.agencyState.clientsServed = s.clients_served;
    state.agencyState.totalEarned = s.total_earned;
    persistState();
  }

  // === MODAL ===
  function showModal(icon, title, txt, buttons) {
    $('modal-icon').textContent = icon;
    $('modal-title').textContent = title;
    $('modal-txt').textContent = txt;
    $('modal-acts').innerHTML = buttons.map((b, i) => `<button class="btn ${b.cls||''}" data-bi="${i}">${b.label}</button>`).join('');
    $('modal-acts').querySelectorAll('button').forEach(btn => {
      btn.onclick = () => buttons[+btn.dataset.bi].fn();
    });
    $('modal').classList.add('on');
  }

  // === INIT ===
  if (state.language) {
    window.I18n.setLang(state.language);
  }
  initLang();
  renderMenu();
  window.Analytics && window.Analytics.trackEvent('app_open');

  // Register SW
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
})();
