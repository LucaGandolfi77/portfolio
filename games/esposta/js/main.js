(function(){
  const STORY = window.StoryData.chapters;
  const CONCEPTS = window.ConceptsData;
  const CASES = window.CasesData;

  let state = {
    current: 0,
    done: [],
    scores: {},
    agency_done: false,
    total_score: 0
  };

  const $ = id => document.getElementById(id);
  const save = () => localStorage.setItem('esposta_state', JSON.stringify(state));
  const load = () => { try { const s = JSON.parse(localStorage.getItem('esposta_state')); if(s) state = {...state, ...s}; } catch(e){} };

  // === RENDER MENU ===
  function renderMenu() {
    $('menu-view').style.display = '';
    $('game-view').style.display = 'none';
    const hasProgress = state.done.length > 0;
    let html = '';
    if(hasProgress) {
      html += `
        <div class="continue-banner fade-in">
          <div class="cb-text">
            Continua dal Cap. ${state.done.length}/${STORY.length}
            <small>${STORY[state.done.length]?.title || 'Prossimo capitolo'}</small>
          </div>
          <button class="btn small primary" id="btn-continue">Continua</button>
        </div>`;
    }
    html += `<button class="btn primary" id="btn-start">${hasProgress ? 'Ricomincia da Capitolo 1' : 'Inizia l\'Archivio 📸'}</button>`;
    if(state.done.length >= STORY.length) {
      html += `<button class="btn green" id="btn-agency">🏢 L'Agenzia Infinita</button>`;
      html += `<button class="btn ghost" id="btn-reset">🗑️ Reset Totale</button>`;
    }
    $('menu-actions').innerHTML = html;
    if($('btn-continue')) $('btn-continue').onclick = () => startGame(Math.min(state.done.length, STORY.length - 1));
    if($('btn-start')) $('btn-start').onclick = () => { state.done = []; state.scores = {}; save(); startGame(0); };
    if($('btn-agency')) $('btn-agency').onclick = startAgency;
    if($('btn-reset')) $('btn-reset').onclick = () => { if(confirm('Vuoi davvero resettare?')) { localStorage.removeItem('esposta_state'); localStorage.removeItem('esposta_agency'); state = {current:0,done:[],scores:{},agency_done:false,total_score:0}; renderMenu(); } };
  }

  // === START GAME ===
  function startGame(idx) {
    state.current = idx;
    save();
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    renderChapters();
    playStory(idx);
  }

  // === CHAPTER BAR ===
  function renderChapters() {
    const bar = $('chbar');
    bar.innerHTML = STORY.map((ch, i) => {
      const cls = state.done.includes(i) ? 'chap done' : i === state.current ? 'chap on' : 'chap locked';
      return `<div class="${cls}" data-i="${i}"><span class="emoji">${ch.icon}</span>${i+1}</div>`;
    }).join('');
    bar.querySelectorAll('.chap').forEach(el => {
      el.onclick = () => {
        const i = +el.dataset.i;
        if(state.done.includes(i) || i === state.current) startGame(i);
      };
    });
    const done = state.done.length;
    const pct = Math.round((done / STORY.length) * 100);
    $('prog-bar').style.width = pct + '%';
    $('prog-pct').textContent = pct + '%';
    $('chapter-title').textContent = STORY[state.current]?.title || '';
  }

  // === STORY DIALOGUE ===
  function playStory(chIdx) {
    const ch = STORY[chIdx];
    const dlg = ch.dialogue;
    let dIdx = 0;
    const overlay = $('story-overlay');

    const show = () => {
      if(dIdx >= dlg.length) { overlay.classList.remove('on'); afterStory(chIdx); return; }
      const d = dlg[dIdx];
      const portraits = { zio:'🧑‍🔧', nonna:'📖', filtro:'🤳', narratore:'🎬' };
      const names = { zio:'Zio Peppe', nonna:'Note di Nonna Olga', filtro:'Filtro Verde', narratore:'Narratore' };
      $('story-portrait').textContent = portraits[d.who] || '📸';
      $('story-speaker').textContent = names[d.who] || d.who;
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
        ? `<button class="btn small" id="dlg-next">Avanti</button>
           <button class="btn small ghost" id="dlg-skip">⏭️ Salta</button>`
        : `<button class="btn small primary" id="dlg-next">Inizia il Capitolo!</button>`;
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

    // Show concepts for this chapter
    if(conceptList.length > 0) {
      showConceptOverlay(conceptList, 0, () => {
        showCaseIfAny(chIdx, () => renderMinigame(chIdx));
      });
    } else {
      showCaseIfAny(chIdx, () => renderMinigame(chIdx));
    }
  }

  function showConceptOverlay(list, idx, onDone) {
    if(idx >= list.length) { onDone(); return; }
    const c = list[idx];
    const overlay = $('concept-overlay');
    $('concept-title').textContent = '📚 ' + c.title;
    $('concept-body').innerHTML = c.body;
    overlay.classList.add('on');
    $('concept-close').textContent = idx < list.length - 1 ? 'Avanti →' : 'Chiudi ✕';
    $('concept-close').onclick = () => {
      overlay.classList.remove('on');
      showConceptOverlay(list, idx + 1, onDone);
    };
  }

  function showCaseIfAny(chIdx, onDone) {
    const caseKeys = Object.keys(CASES);
    if(chIdx < caseKeys.length) {
      const k = caseKeys[chIdx];
      const cs = CASES[k];
      const overlay = $('concept-overlay');
      $('concept-title').textContent = '📋 Caso Reale: ' + cs.brand;
      $('concept-body').innerHTML = `
        <div style="font-size:11px;color:var(--sepia);margin-bottom:6px">${cs.year} · ${cs.title}</div>
        <div style="font-size:12px;line-height:1.6;color:var(--cream);margin-bottom:8px">${cs.story}</div>
        <div class="c-case">
          <div class="c-case-title">Lezione</div>
          <div style="font-size:11px;color:var(--cream)">${cs.lesson}</div>
        </div>
        <div class="c-case" style="margin-top:6px">
          <div class="c-case-title">Metriche</div>
          <div style="font-size:11px;color:var(--cream)">${cs.metrics}</div>
        </div>
        <div style="font-size:10px;color:var(--dim);margin-top:6px;font-style:italic">Fonte: ${cs.source}</div>`;
      overlay.classList.add('on');
      $('concept-close').textContent = 'Chiudi ✕';
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
        state.done.push(chIdx);
        save();
        if(score / total >= 0.7) {
          showModal('📸', 'Esame Superato!', 'Sei pronta per aprire l\'agenzia!', [
            { label: '🏢 Apri l\'Agenzia', cls: 'primary', fn: () => { $('modal').classList.remove('on'); startAgency(); } }
          ]);
        } else {
          showModal('📖', 'Studio necessario', `Hai preso ${score}/${total}. Riprova!`, [
            { label: '🔄 Riprova', cls: 'primary', fn: () => { $('modal').classList.remove('on'); renderMinigame(chIdx); } },
            { label: '🏠 Menu', cls: '', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
          ]);
        }
      });
    } else {
      Minigames.run(ch.minigame, area, (score, total) => {
        state.scores[ch.id] = { score, total };
        state.done.push(chIdx);
        save();
        const nextIdx = chIdx + 1;
        if(nextIdx < STORY.length) {
          showModal('📸', STORY[chIdx].title + ' — Completato!', `Punteggio: ${score}/${total}`, [
            { label: 'Capitolo Successivo →', cls: 'primary', fn: () => { $('modal').classList.remove('on'); startGame(nextIdx); } },
            { label: '🏠 Menu', cls: 'ghost', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
          ]);
        } else {
          showModal('🏆', 'Archivio Completo!', 'Hai completato tutti i capitoli! Ora puoi aprire l\'Agenzia.', [
            { label: '🏢 L\'Agenzia Infinita', cls: 'green', fn: () => { $('modal').classList.remove('on'); startAgency(); } },
            { label: '🏠 Menu', cls: 'ghost', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
          ]);
        }
      });
    }
  }

  // === AGENCY MODE ===
  function startAgency() {
    Agency.init();
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';
    $('chbar').innerHTML = '';
    $('prog-bar').style.width = '100%';
    $('prog-pct').textContent = '∞';
    $('chapter-title').textContent = 'L\'Agenzia Infinita';
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
      showModal('🏢', 'Agenzia Completata!', `Reputazione: ${s.reputation}/10 · Clienti: ${s.clients_served} · Guadagni: €${s.total_earned.toLocaleString()}\nGrado: ${grade}`, [
        { label: '🏠 Menu', cls: 'primary', fn: () => { $('modal').classList.remove('on'); renderMenu(); } }
      ]);
    };
  }

  function renderAgencyBrief(brief) {
    const area = $('game-area');
    const s = Agency._state;
    area.innerHTML = `
      <div class="mg-title">📸 L'Agenzia Infinita</div>
      <div class="ag-header">
        <div class="ag-money">€${s.money.toLocaleString()}</div>
        <div class="ag-rate">⭐ ${s.reputation}/10 · Clienti: ${s.clients_served}</div>
      </div>
      <div class="mg-card">
        <div class="ag-brief">
          <div class="ab-title">${brief.client.emoji} ${brief.client.name}</div>
          <div class="ab-client">Settore: ${brief.client.type} · Budget: €${s.current_budget.toLocaleString()} · Difficoltà: <span style="color:${brief.diff.color}">${brief.diff.name}</span></div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:4px">Tono: <i>${brief.client.tone}</i></div>
          <div style="font-size:11px;color:var(--dim)">Servizi richiesti: ${brief.client.needs.join(', ')}</div>
        </div>
        <div class="mg-score">Budget rimasto: €${s.current_budget.toLocaleString()}</div>
        <div class="mg-grid" style="grid-template-columns:1fr 1fr;margin-top:8px" id="svc-grid">
          ${brief.services.map(sv => `
            <button class="mg-btn ag-svc" data-svc="${sv.name}" data-cost="${sv.cost}">
              ${sv.name} — €${sv.cost}<br><span style="font-size:9px;color:var(--dim)">${sv.effort}</span>
            </button>
          `).join('')}
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn primary" id="agency-go">Esegui Campagna ✅</button>
          <button class="btn red" id="agency-reject">Rifiuta ❌</button>
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
        area.querySelector('.mg-score').textContent = `Budget rimasto: €${rem.toLocaleString()} / €${s.current_budget.toLocaleString()}`;
        if(rem < 0) area.querySelector('.mg-score').style.color = 'var(--red)';
        else area.querySelector('.mg-score').style.color = 'var(--gold)';
        document.getElementById('agency-go').disabled = selected.size === 0;
      };
    });

    document.getElementById('agency-go').onclick = () => {
      const result = Agency.completeCampaign();
      area.innerHTML = Agency._renderResult(result);
      document.getElementById('agency-continue').onclick = () => renderAgencyMenu();
    };
    document.getElementById('agency-reject').onclick = () => {
      Agency._state.current_client = null;
      Agency._state.current_services = [];
      Agency._state.current_spent = 0;
      Agency._state.current_budget = 0;
      Agency.save();
      renderAgencyMenu();
    };
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
  load();
  renderMenu();

  // Register SW
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
})();
