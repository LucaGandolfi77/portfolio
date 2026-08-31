window.MinigamesData = {};
window.Minigames = {
  run(id, area, onDone) {
    const fn = {
      esposizione: this._esposizione, composizione: this._composizione,
      luce: this._luce, momento: this._momento, algoritmo: this._algoritmo,
      contenuto: this._contenuto, community: this._community, analytics: this._analytics,
      marketing_mix: this._marketingMix, funnel: this._funnel,
      brand: this._brand, persuasione: this._persuasione, esame: this._esame
    }[id];
    if (fn) fn.call(this, area, onDone);
  },

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  _showResult(area, score, total, onDone, msg) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '🔄';
    area.innerHTML = `
      <div class="mg-card fade-in" style="text-align:center">
        <div style="font-size:48px;margin-bottom:8px">${emoji}</div>
        <div class="mg-title">Completato!</div>
        <div class="mg-score">${score}/${total} — ${pct}%</div>
        <div style="font-size:12px;color:var(--dim);margin:8px 0;font-style:italic">${msg||''}</div>
        <button class="btn primary" id="mg-continue">Avanti →</button>
      </div>`;
    document.getElementById('mg-continue').onclick = () => onDone(score, total);
  },

  // === 1. ESPPOSIZIONE: Triangolo sliders ===
  _esposizione(area, onDone) {
    const target = { iso: 200, aperture: 5.6, shutter: 125 };
    let score = 0;
    const render = () => {
      const iso = +document.getElementById('sl-iso').value;
      const ap = +document.getElementById('sl-ap').value;
      const sh = +document.getElementById('sl-sh').value;
      const evCalc = Math.log2((ap * ap) / (sh / 1000));
      const evTarget = Math.log2((5.6 * 5.6) / (125 / 1000));
      const diff = Math.abs(evCalc - evTarget);
      const brightness = Math.max(0, Math.min(1, 0.5 + (evCalc - evTarget) * 0.15));
      const noise = iso > 1600 ? 'Alto rumore' : iso > 400 ? 'Rumore moderato' : 'Pulito';
      const depth = ap < 2.8 ? 'Bokeh estremo' : ap < 5.6 ? 'Media' : 'Tutto a fuoco';
      const freeze = sh > 500 ? 'Congelato' : sh > 60 ? 'Fermo' : 'Scia/mosso';
      document.getElementById('exp-preview').style.filter = `brightness(${brightness}) saturate(0.3) sepia(${0.6 + brightness * 0.3})`;
      document.getElementById('exp-label').textContent = `${noise} · ${depth} · ${freeze}`;
      document.getElementById('exp-ev').textContent = `EV ${evCalc.toFixed(1)}`;
    };
    area.innerHTML = `
      <div class="mg-title">Sviluppa il Negativo</div>
      <div class="mg-sub">Regola i tre sliders per ottenere l'esposizione corretta!</div>
      <div class="mg-card">
        <div class="exp-preview" id="exp-preview">🎞️</div>
        <div class="exp-label" id="exp-label">Pulito · Media · Fermo</div>
        <div class="mg-score">EV target: 4.2 | EV tuo: <span id="exp-ev">3.5</span></div>
      </div>
      <div class="mg-card">
        <div class="slider-wrap"><label>ISO</label><input type="range" id="sl-iso" min="50" max="6400" step="50" value="200"><span class="val" id="v-iso">200</span></div>
        <div class="slider-wrap"><label>f/ Apertura</label><input type="range" id="sl-ap" min="14" max="220" step="1" value="56"><span class="val" id="v-ap">f/5.6</span></div>
        <div class="slider-wrap"><label>Tempo (ms)</label><input type="range" id="sl-sh" min="1" max="4000" step="1" value="125"><span class="val" id="v-sh">1/125s</span></div>
      </div>
      <button class="btn primary" id="exp-btn">Svilupa!</button>`;
    const apertures = [14,20,28,40,56,80,110,160,220];
    const upd = () => {
      const iso = +document.getElementById('sl-iso').value;
      const ap = apertures[+document.getElementById('sl-ap').value] || 56;
      const sh = +document.getElementById('sl-sh').value;
      document.getElementById('v-iso').textContent = iso;
      document.getElementById('v-ap').textContent = 'f/' + (ap/10).toFixed(1);
      document.getElementById('v-sh').textContent = sh >= 1000 ? (sh/1000)+'s' : '1/'+sh+'s';
      render();
    };
    ['sl-iso','sl-ap','sl-sh'].forEach(id => document.getElementById(id).oninput = upd);
    render();
    document.getElementById('exp-btn').onclick = () => {
      const evCalc = Math.log2((5.6*5.6)/(125/1000));
      const evUser = Math.log2((apertures[+document.getElementById('sl-ap').value]/10)**2 / (+document.getElementById('sl-sh').value/1000));
      const diff = Math.abs(evCalc - evUser);
      score = diff < 0.3 ? 10 : diff < 0.7 ? 8 : diff < 1.2 ? 6 : diff < 2 ? 4 : 2;
      this._showResult(area, score, 10, onDone, score >= 8 ? 'Esposizione perfetta! Il negativo è perfetto.' : 'Il negativo è un po\' bruciato/scuro. Riprova!');
    };
  },

  // === 2. COMPOSIZIONE: drag subject onto thirds ===
  _composizione(area, onDone) {
    const targets = [
      { x: 33, y: 33, name: 'Terzo sinistro-alto' },
      { x: 67, y: 33, name: 'Terzo destro-alto' },
      { x: 33, y: 67, name: 'Terzo sinistro-basso' },
      { x: 67, y: 67, name: 'Terzo destro-basso' }
    ];
    const subjects = ['👤','🐱','🌳','☕'];
    let round = 0, score = 0, total = 4;
    const render = () => {
      if (round >= total) { this._showResult(area, score, total, onDone, score >= 3 ? 'Composizione naturale!' : 'Prova a posizionare il soggetto sui punti d\'intersezione.'); return; }
      const t = targets[round];
      area.innerHTML = `
        <div class="mg-title">Componi la Scena</div>
        <div class="mg-sub">Trascina il soggetto sul PUNTO d'intersezione della regola dei terzi (${round+1}/${total})</div>
        <div class="mg-card">
          <div class="comp-canvas" id="comp-canvas">
            <div class="comp-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <div class="comp-subject" id="comp-subj">${subjects[round]}</div>
          </div>
        </div>
        <button class="btn small ghost" id="comp-hint">💡 ${t.name}</button>`;
      const canvas = document.getElementById('comp-canvas');
      const subj = document.getElementById('comp-subj');
      let dragging = false, ox = 0, oy = 0;
      const start = (ex, ey) => {
        const r = canvas.getBoundingClientRect();
        dragging = true;
        ox = ex - r.left - subj.offsetLeft;
        oy = ey - r.top - subj.offsetTop;
      };
      const move = (ex, ey) => {
        if (!dragging) return;
        const r = canvas.getBoundingClientRect();
        let x = ex - r.left - ox;
        let y = ey - r.top - oy;
        x = Math.max(0, Math.min(r.width - 28, x));
        y = Math.max(0, Math.min(r.height - 28, y));
        subj.style.left = x + 'px';
        subj.style.top = y + 'px';
      };
      const end = () => {
        if (!dragging) return;
        dragging = false;
        const r = canvas.getBoundingClientRect();
        const sx = subj.offsetLeft + 14;
        const sy = subj.offsetTop + 14;
        const tx = (t.x / 100) * r.width;
        const ty = (t.y / 100) * r.height;
        const dist = Math.sqrt((sx - tx) ** 2 + (sy - ty) ** 2);
        const hit = dist < r.width * 0.12;
        if (hit) score++;
        round++;
        render();
      };
      subj.ontouchstart = (e) => { e.preventDefault(); start(e.touches[0].clientX, e.touches[0].clientY); };
      subj.ontouchmove = (e) => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
      subj.ontouchend = end;
      subj.onmousedown = (e) => start(e.clientX, e.clientY);
      document.onmousemove = (e) => move(e.clientX, e.clientY);
      document.onmouseup = end;
    };
    render();
  },

  // === 3. LUCE: match scenario ===
  _luce(area, onDone) {
    const scenarios = [
      { scenario: '🌞 Mezzogiosto d\'estate, spiaggia', correct: 'Dura, laterale alta, 5500K', opts: ['Dura, laterale alta, 5500K', 'Morbida, frontale, 3200K', 'Controluce, 7000K', 'Rim light, 4500K'] },
      { scenario: '🌅 Tramonto sul mare', correct: 'Calda, laterale bassa, 2800K', opts: ['Calda, laterale bassa, 2800K', 'Fredda, frontale, 7500K', 'Neutra, controluce, 5500K', 'Dura, rim light, 9000K'] },
      { scenario: '☁️ Giorno coperto, parco', correct: 'Morbida, diffusa, 6500K', opts: ['Morbida, diffusa, 6500K', 'Dura, laterale, 3000K', 'Controluce, 4000K', 'Rim light, 8000K'] },
      { scenario: '🕯️ Ristorante con candele', correct: 'Calda, laterale bassa, 1800K', opts: ['Calda, laterale bassa, 1800K', 'Neutra, frontale, 5500K', 'Fredda, diffusa, 7000K', 'Dura, controluce, 2500K'] },
      { scenario: '👰 Matrimonio in chiesa', correct: 'Morbida, laterale 45°, 4000K', opts: ['Morbida, laterale 45°, 4000K', 'Dura, controluce, 6000K', 'Neutra, frontale, 5500K', 'Fredda, rim light, 8000K'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= scenarios.length) { this._showResult(area, score, scenarios.length, onDone, score >= 4 ? 'Hai l\'occhio per la luce!' : 'La luce è una questione di pratica.'); return; }
      const s = scenarios[idx];
      const shuff = this._shuffle(s.opts);
      area.innerHTML = `
        <div class="mg-title">Caccia alla Luce</div>
        <div class="mg-sub">Scegli la luce giusta per ogni scena (${idx+1}/${scenarios.length})</div>
        <div class="mg-card"><div style="font-size:13px;font-weight:600;color:var(--gold)">${s.scenario}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const chosen = shuff[+btn.dataset.opt];
          const correct = chosen === s.correct;
          if (correct) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); area.querySelector(`.mg-btn[data-opt="${shuff.indexOf(s.correct)}"]`)?.classList.add('correct'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 4. MOMENTO: timing click ===
  _momento(area, onDone) {
    let score = 0, round = 0, total = 5, zonePos, zoneW, cursorPos, animId;
    const startRound = () => {
      if (round >= total) { this._showResult(area, score, total, onDone, score >= 4 ? 'Hai colto il momento decisivo!' : 'L\'istante giusto richiede pratica.'); return; }
      zonePos = Math.random() * 70 + 10;
      zoneW = 10 + Math.random() * 8;
      cursorPos = 0;
      const speed = 1.5 + round * 0.3;
      area.innerHTML = `
        <div class="mg-title">Scatta al Momento Giusto</div>
        <div class="mg-sub">Premi SCATTA quando il cursore è nella zona dorata (${round+1}/${total})</div>
        <div class="mg-card">
          <div class="timing-zone" id="tz">
            <div class="timing-target" id="tt" style="left:${zonePos}%;width:${zoneW}%"></div>
            <div class="timing-cursor" id="tc" style="left:0%"></div>
          </div>
        </div>
        <button class="btn primary" id="snap-btn">📸 SCATTA</button>`;
      const cursor = document.getElementById('tc');
      const animate = () => {
        cursorPos += speed;
        if (cursorPos > 100) cursorPos = 0;
        cursor.style.left = cursorPos + '%';
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
      document.getElementById('snap-btn').onclick = () => {
        cancelAnimationFrame(animId);
        const inZone = cursorPos >= zonePos && cursorPos <= zonePos + zoneW;
        const near = Math.abs(cursorPos - (zonePos + zoneW / 2)) < zoneW;
        if (inZone) score += 2;
        else if (near) score++;
        if (inZone) document.getElementById('tc').style.background = 'var(--green)';
        else document.getElementById('tc').style.background = 'var(--red)';
        setTimeout(() => { round++; startRound(); }, 600);
      };
    };
    startRound();
  },

  // === 5. ALGORITMO: build ranking post ===
  _algoritmo(area, onDone) {
    const factors = [
      { label: '📸 Contenuto visivo', weight: 3, opts: ['Foto professionale alta qualità', 'Selfie sfocato', 'Screenshot di testo', 'Meme generico'] },
      { label: '📝 Caption', weight: 3, opts: ['Domanda che invita al commento', '"Liked and shared"', 'Solo hashtag (#amore #vita)', 'Nessuna caption'] },
      { label: '⏰ Timing', weight: 2, opts: ['Ora di picco (19-21)', '3:00 di notte', 'Lunedì 8:00', 'Non importa'] },
      { label: '💬 Engagement bait', weight: 2, opts: ['"Salva per dopo!" (utile)', '"Scrivi AMEN"', '"Tagga 10 amici"', '"Like = fortuna"'] },
      { label: '🏷️ Hashtag', weight: 1, opts: ['5-8 hashtag pertinenti', '30 hashtag random', 'Nessun hashtag', '#like4like #follow4follow'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= factors.length) { this._showResult(area, score, factors.length, onDone, score >= 4 ? 'L\'algoritmo ti ama!' : 'Il feed ti seppellisce...'); return; }
      const f = factors[idx];
      const shuff = this._shuffle(f.opts);
      area.innerHTML = `
        <div class="mg-title">Sfida l'Algoritmo</div>
        <div class="mg-sub">Scegli l'opzione che l'algoritmo premia di più (${idx+1}/${factors.length})</div>
        <div class="mg-card"><div style="font-size:12px;font-weight:700;color:var(--gold)">${f.label}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === f.opts[0];
          if (isCorrect) { btn.classList.add('correct'); score += f.weight; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 6. CONTENUTO: hook builder ===
  _contenuto(area, onDone) {
    const hooks = [
      { scenario: 'Post per uno studio fotografico — B&W portraits', correct: 'Domanda provocatoria', opts: ['Domanda provocatoria', 'Cifra generica', 'Solo emoji', 'Titolo lungo e tecnico'] },
      { scenario: 'Reel Instagram — Dietro le quinte di un servizio', correct: 'Visual hook nel primo frame', opts: ['Visual hook nel primo frame', 'Testo scritto tutto', 'Logo dell\'azienda', 'Niente di particolare'] },
      { scenario: 'TikTok — Tutorial fotografia', correct: 'Promise in 3 secondi', opts: ['Promise in 3 secondi', 'Spiegazione tecnica lunga', 'Grafica complessa', 'Saluto lungo'] },
      { scenario: 'Post LinkedIn — Caso studio marketing', correct: 'Affermazione shock', opts: ['Affermazione shock', 'Foto di gruppo', 'Testo generico', 'Link esterno'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= hooks.length) { this._showResult(area, score, hooks.length, onDone, score >= 3 ? 'Hai il ninja dell\'hook!' : 'L\'hook è la prima cosa che conta.'); return; }
      const h = hooks[idx];
      const shuff = this._shuffle(h.opts);
      area.innerHTML = `
        <div class="mg-title">Hook in 3 Secondi</div>
        <div class="mg-sub">Quale hook funziona meglio? (${idx+1}/${hooks.length})</div>
        <div class="mg-card"><div style="font-size:12px;color:var(--cream)">${h.scenario}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === h.correct;
          if (isCorrect) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 7. COMMUNITY: gestione crisi ===
  _community(area, onDone) {
    const crises = [
      { crisis: 'Un cliente pubblica una recensione negativa: "Servizio pessimo, foto sfocate, mai più"', correct: 'Rispondi subito con empatia, offri soluzione privata', opts: ['Rispondi subito con empatia, offri soluzione privata', 'Ignora la recensione', 'Rispondi in modo difensivo', 'Cancella la recensione (se possibile)'] },
      { crisis: 'Un post viene accusato di essere "tone-deaf" su un tema sociale', correct: 'Riconosci l\'errore, scusa pubblicamente, impara', opts: ['Riconosci l\'errore, scusa pubblicamente, impara', 'Difendi il post con argomentazioni', 'Cancella tutto e fai finta di niente', 'Blinda i commenti'] },
      { crisis: 'Un competitor copia il tuo contenuto originale', correct: 'Documenta, confronta privatamente, poi legalmente se necessario', opts: ['Documenta, confronta privatamente, poi legalmente se necessario', 'Pubblica un post accusatorio', 'Fai finta di niente', 'Copi il contenuto del competitor'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= crises.length) { this._showResult(area, score, crises.length, onDone, score >= 2 ? 'Gestore crisi esperto!' : 'Le crisi si gestiscono con calma e strategia.'); return; }
      const c = crises[idx];
      const shuff = this._shuffle(c.opts);
      area.innerHTML = `
        <div class="mg-title">Gestione Crisi</div>
        <div class="mg-sub">Cosa fai? (${idx+1}/${crises.length})</div>
        <div class="mg-card"><div style="font-size:12px;color:var(--cream);line-height:1.5">${c.crisis}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === c.correct;
          if (isCorrect) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 8. ANALYTICS: dashboard interpretation ===
  _analytics(area, onDone) {
    const questions = [
      { q: 'Reach: 10.000 | Impressions: 50.000. Cosa significa?', correct: 'Ogni persona ha visto il post in media 5 volte', opts: ['Ogni persona ha visto il post in media 5 volte', '10.000 persone hanno condiviso', 'Il post è stato visto 50.000 volte in totale', 'La campagna ha avuto 50K click'] },
      { q: 'CTR della campagna: 0.5%. È buono?', correct: 'No, è basso (2-5% è buono per ads)', opts: ['No, è basso (2-5% è buono per ads)', 'Sì, è ottimo', 'Dipende solo dal settore', 'Non si può dire senza il ROAS'] },
      { q: 'Spesa: €1000 | Ricavi: €4000. Qual è il ROAS?', correct: '4:1', opts: ['4:1', '2:1', '0.25:1', '4000:1'] },
      { q: 'Un post ha ER 8% con 1000 follower. È meglio di uno con ER 2% e 100K follower?', correct: 'No: il secondo raggiunge più persone in termini assoluti', opts: ['No: il secondo raggiunge più persone in termini assoluti', 'Sì: l\'ER è più alto', 'Dipende dagli obiettivi', 'Sì, sempre'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= questions.length) { this._showResult(area, score, questions.length, onDone, score >= 3 ? 'Analista esperto!' : 'Le numeri raccontano storie, se sai leggerle.'); return; }
      const q = questions[idx];
      const shuff = this._shuffle(q.opts);
      area.innerHTML = `
        <div class="mg-title">Leggi il Dashboard</div>
        <div class="mg-sub">Interpreta le metriche (${idx+1}/${questions.length})</div>
        <div class="mg-card"><div style="font-size:13px;font-weight:600;color:var(--cream)">${q.q}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === q.correct;
          if (isCorrect) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 9. MARKETING MIX: 7P ===
  _marketingMix(area, onDone) {
    const ps = [
      { p: '📦 Product', correct: 'La trasformazione che offri al cliente, non il prodotto fisico', opts: ['La trasformazione che offri al cliente, non il prodotto fisico', 'Solo il prodotto fisico', 'Il nome del brand', 'Il logo'] },
      { p: '💰 Price', correct: 'Il segnale di valore, non solo un numero', opts: ['Il segnale di valore, non solo un numero', 'Il costo di produzione', 'Il prezzo più basso possibile', 'Lo sconto'] },
      { p: '🏪 Place', correct: 'Omnicanale: dove il cliente ti incontra', opts: ['Omnicanale: dove il cliente ti incontra', 'Solo il negozio fisico', 'Solo online', 'Il magazzino'] },
      { p: '📢 Promotion', correct: 'Come comunichi il valore al cliente', opts: ['Come comunichi il valore al cliente', 'Solo la pubblicità a pagamento', 'Solo gli sconti', 'Il passaparola'] },
      { p: '👥 People', correct: 'Il volto del brand: chi rappresenta il valore', opts: ['Il volto del brand: chi rappresenta il valore', 'Solo i dipendenti', 'Il CEO', 'I fornitori'] },
      { p: '⚙️ Process', correct: 'Il percorso del cliente dall\'acquisto alla consegna', opts: ['Il percorso del cliente dall\'acquisto alla consegna', 'Solo la logistica', 'Il processo di produzione', 'L\'organigramma'] },
      { p: '📋 Physical Evidence', correct: 'Le prove tangibili del valore (portfolio, recensioni)', opts: ['Le prove tangibili del valore (portfolio, recensioni)', 'Solo il negozio', 'I biglietti da visita', 'Le fatture'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= ps.length) { this._showResult(area, score, ps.length, onDone, score >= 5 ? 'Master del Marketing Mix!' : 'Le 7P richiedono una visione olistica.'); return; }
      const p = ps[idx];
      const shuff = this._shuffle(p.opts);
      area.innerHTML = `
        <div class="mg-title">Il Mix Perfetto</div>
        <div class="mg-sub">Cosa rappresenta questa P? (${idx+1}/${ps.length})</div>
        <div class="mg-card"><div style="font-size:15px;font-weight:700;color:var(--gold)">${p.p}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === p.correct;
          if (isCorrect) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 10. FUNNEL: drag stages ===
  _funnel(area, onDone) {
    const stages = ['TOFU: Awareness','MOFU: Consideration','BOFU: Decision','Retention'];
    const contents = [
      ['Blog post educativo','Video YouTube','Social post'],
      ['Newsletter','Case study','Webinar'],
      ['Offerta speciale','Testimonianze','Call-to-action'],
      ['Email follow-up','Community','Programma fedeltà']
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= stages.length) { this._showResult(area, score, stages.length, onDone, score >= 3 ? 'Funnel master!' : 'Il funnel è un percorso, non una cassa.'); return; }
      const correct = contents[idx];
      const allOpts = this._shuffle([...contents[0], ...contents[1], ...contents[2], ...contents[3]]);
      const opts = this._shuffle([...correct, ...allOpts.filter(o => !correct.includes(o)).slice(0, 3)]);
      area.innerHTML = `
        <div class="mg-title">Costruisci il Funnel</div>
        <div class="mg-sub">Quali contenuti vanno in <b>${stages[idx]}</b>? Scegli 3. (${idx+1}/${stages.length})</div>
        <div class="mg-grid" style="grid-template-columns:1fr">${opts.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>
        <button class="btn primary" id="funnel-ok">Conferma</button>`;
      const selected = new Set();
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const v = btn.textContent;
          if (selected.has(v)) { selected.delete(v); btn.style.border = '1px solid var(--line)'; }
          else if (selected.size < 3) { selected.add(v); btn.style.border = '2px solid var(--gold)'; }
        };
      });
      document.getElementById('funnel-ok').onclick = () => {
        const correctCount = [...selected].filter(s => correct.includes(s)).length;
        score += Math.round(correctCount / 3 * 2);
        idx++;
        render();
      };
    };
    render();
  },

  // === 11. BRAND: positioning map ===
  _brand(area, onDone) {
    const brands = [
      { name: 'Scatto Low-Cost', correct: 'Bassa qualità / Bassissimo prezzo', opts: ['Bassa qualità / Bassissimo prezzo', 'Alta qualità / Prezzo alto', 'Media qualità / Medio prezzo', 'Alta qualità / Bassissimo prezzo'] },
      { name: 'Studio Leica', correct: 'Altissima qualità / Prezzo premium', opts: ['Altissima qualità / Prezzo premium', 'Bassa qualità / Medio prezzo', 'Media qualità / Bassissimo prezzo', 'Alta qualità / Medio prezzo'] },
      { name: 'Fotoritocco AI', correct: 'Media qualità / Bassissimo prezzo', opts: ['Media qualità / Bassissimo prezzo', 'Alta qualità / Prezzo alto', 'Bassa qualità / Bassissimo prezzo', 'Media qualità / Medio prezzo'] },
      { name: 'Lo Studio Olga', correct: 'Alta qualità / Prezzo medio', opts: ['Alta qualità / Prezzo medio', 'Bassa qualità / Prezzo alto', 'Media qualità / Bassissimo prezzo', 'Alta qualità / Prezzo premium'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= brands.length) { this._showResult(area, score, brands.length, onDone, score >= 3 ? 'Stratega del positioning!' : 'Il positioning è la battaglia per la mente.'); return; }
      const b = brands[idx];
      const shuff = this._shuffle(b.opts);
      area.innerHTML = `
        <div class="mg-title">Posiziona il Brand</div>
        <div class="mg-sub">Dove si posiziona questo brand nella mappa percettiva? (${idx+1}/${brands.length})</div>
        <div class="mg-card"><div style="font-size:14px;font-weight:700;color:var(--gold)">${b.name}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === b.correct;
          if (isCorrect) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === 12. PERSUASIONE: copy converter ===
  _persuasione(area, onDone) {
    const copies = [
      { q: 'Quale copy usa la RECIPROCITÀ di Cialdini?', correct: 'Ti regalo una mini-guida: i 5 errori da non fare', opts: ['Ti regalo una mini-guida: i 5 errori da non fare', 'Ultimi 3 posti disponibili!', '92% dei clienti è soddisfatto', 'Prenota ora'] },
      { q: 'Quale copy usa la PROVA SOCIALE?', correct: '500+ clienti hanno scelto lo Studio Olga', opts: ['500+ clienti hanno scelto lo Studio Olga', 'Prenota prima che sia tardi', 'Scopri il tuo potenziale', 'Ti guido passo dopo passo'] },
      { q: 'Quale copy usa la SCARSITÀ?', correct: 'Solo 5 slot rimasti per il mese di giugno', opts: ['Solo 5 slot rimasti per il mese di giugno', 'Ecco cosa dicono di noi', 'Ti regalo un consiglio gratuito', 'Scopri il metodo'] },
      { q: 'Quale copy è adatto a chi è CONSAPEVOLE DEL PROBLEMA?', correct: 'Sai che le tue foto non hanno impatto? Ecco perché.', opts: ['Sai che le tue foto non hanno impatto? Ecco perché.', 'Scatta come un pro con questo tutorial avanzato', 'Il nostro pacchetto premium includes...', 'Acquista ora'] }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= copies.length) { this._showResult(area, score, copies.length, onDone, score >= 3 ? 'Copy persuasivo!' : 'Le parole sono armi: impara a sceglierle.'); return; }
      const c = copies[idx];
      const shuff = this._shuffle(c.opts);
      area.innerHTML = `
        <div class="mg-title">Il Copy che Converte</div>
        <div class="mg-sub">Identifica il copy giusto (${idx+1}/${copies.length})</div>
        <div class="mg-card"><div style="font-size:13px;font-weight:600;color:var(--cream)">${c.q}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${shuff.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const isCorrect = btn.textContent === c.correct;
          if (isCorrect) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  },

  // === ESAME DEL FEED: quiz finale 18 domande ===
  _esame(area, onDone) {
    const qs = [
      { q:'Il diaframma f/1.4 rispetto a f/22 produce:', o:['Molto bokeh, poca profondità di campo','Tutto a fuoco, poca luce','Nessuna differenza','Più granulosità'], a:0 },
      { q:'La regola dei terzi suggerisce di posizionare il soggetto:', o:['Sempre al centro','Sui punti d\'intersezione delle linee','In alto a sinistra sempre','Sul bordo inferiore'], a:1 },
      { q:'La temperatura colore di un tramonto è circa:', o:['9000K','5500K','2800K','1800K'], a:2 },
      { q:'Il "punctum" di Barthes è:', o:['La tecnica fotografica','Il dettaglio che trafigge emotivamente','Il contesto culturale','Il prezzo della foto'], a:1 },
      { q:'L\'algoritmo Instagram nel 2025 premia di più:', o:['I likes','I salvataggi e le condivisioni','Gli hashtag','La frequenza di posting'], a:1 },
      { q:'Il "momento decisivo" è un concetto di:', o:['Susan Sontag','Roland Barthes','Henri Cartier-Bresson','David Ogilvy'], a:2 },
      { q:'L\'engagement rate si calcola come:', o:['Followers / posts','(Interazioni / reach) × 100','Vendite / spesa','Likes / followers'], a:1 },
      { q:'Il coefficiente K della viralità > 1 significa:', o:['Il contenuto muore','Crescita esponenziale','Nessun effetto','Il post è shadowbanned'], a:1 },
      { q:'I 7P del Marketing Mix includono anche:', o:['People, Process, Physical Evidence','Profit, Production, Planning','Passion, Purpose, Platform','Portfolio, Pricing, Packaging'], a:0 },
      { q:'Il modello AIDA include:', o:['Attention, Interest, Desire, Action','Awareness, Implementation, Data, Analysis','Acquisition, Integration, Development, Automation','Analysis, Insight, Design, Application'], a:0 },
      { q:'Il ROAS di una campagna con spesa €500 e ricavi €2000 è:', o:['1:4','4:1','2:1','0.5:1'], a:1 },
      { q:'Per Cialdini, la "reciprocità" funziona perché:', o:['Le persone amano i regali','Il cervello sente il bisogno di restituire','È obbligo legale','La gente ha paura di perdere'], a:1 },
      { q:'Eugene Schwartz\'s 5 livelli di consapevolezza iniziano con:', o:['Il prodotto','Il problema','La soluzione','L\'azione'], a:1 },
      { q:'La golden hour è:', o:['Le ore di mezzogiorno','I 30 min prima del tramonto','L\'intera notte','Le ore 12-14'], a:1 },
      { q:'L\'UGC (User Generated Content) è più efficace del contenuto del brand perché:', o:['È gratis','È percepito come autentico e credibile','Ha più risoluzione','È sempre in HD'], a:1 },
      { q:'Per gestire una crisi sui social, la prima regola è:', o:['Cancella il post','Rispondi subito con empetia','Ignora i commenti','Blinda il profilo'], a:1 },
      { q:'Il positioning (Ries & Trout) è:', o:['La posizione del produto sullo scaffale','La posizione nella mente del cliente','Il prezzo rispetto ai concorrenti','La distribuzione geografica'], a:1 },
      { q:'Byron Sharp dimostra che la crescita dei brand dipende da:', o:['La fedeltà assoluta dei clienti','Mental e Physical Availability','Solo la pubblicità a pagamento','Il budget del marketing'], a:1 }
    ];
    let idx = 0, score = 0;
    const render = () => {
      if (idx >= qs.length) {
        const pct = Math.round((score / qs.length) * 100);
        const passed = pct >= 70;
        area.innerHTML = `
          <div class="mg-card fade-in" style="text-align:center">
            <div style="font-size:48px;margin-bottom:8px">${passed ? '📸🏆' : '📖'}</div>
            <div class="mg-title">${passed ? 'Esame Superato!' : 'Studio necessario'}</div>
            <div class="mg-score">${score}/${qs.length} — ${pct}%</div>
            <div style="font-size:12px;color:var(--dim);margin:8px 0;font-style:italic">${passed ? 'Sei pronta per aprire l\'agenzia!' : 'Ripassa i capitoli e riprova.'}</div>
            <button class="btn primary" id="esame-done">${passed ? 'Entra nell\'Agenzia 🏢' : 'Riprova 📖'}</button>
          </div>`;
        document.getElementById('esame-done').onclick = () => onDone(score, qs.length);
        return;
      }
      const q = qs[idx];
      area.innerHTML = `
        <div class="mg-title">Esame del Feed</div>
        <div class="mg-sub">${idx+1}/${qs.length}</div>
        <div class="mg-card"><div style="font-size:13px;font-weight:600;color:var(--cream)">${q.q}</div></div>
        <div class="mg-grid" style="grid-template-columns:1fr">${q.o.map((o,i) =>
          `<button class="mg-btn" data-opt="${i}">${o}</button>`
        ).join('')}</div>`;
      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const chosen = +btn.dataset.opt;
          const correct = chosen === q.a;
          if (correct) { btn.classList.add('correct'); score++; }
          else { btn.classList.add('wrong'); area.querySelector(`.mg-btn[data-opt="${q.a}"]`)?.classList.add('correct'); }
          area.querySelectorAll('.mg-btn').forEach(b => b.style.pointerEvents = 'none');
          setTimeout(() => { idx++; render(); }, 800);
        };
      });
    };
    render();
  }
};
