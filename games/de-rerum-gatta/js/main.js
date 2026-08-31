/* De Rerum Gatta — gioco principale: giardino, storia, erbario, biblioteca, quaderno */
'use strict';

(() => {
  let S = SaveSys.load();
  let currentSeason = 'primavera';

  const $ = id => document.getElementById(id);
  const el = (tag, cls, parent) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  };

  /* ---------- stato ---------- */
  function save() { SaveSys.store(S); }
  function bloomed(id) { return !!S.flowers[id]; }
  function isAvailable(id) {
    const idx = FLOWERS.findIndex(f => f.id === id);
    if (idx <= 0) return true;
    return bloomed(FLOWERS[idx - 1].id);
  }
  function purrLevel() {
    const n = Object.keys(S.flowers).length;
    let lvl = PURR_LEVELS[0];
    for (const l of PURR_LEVELS) if (n >= l.min) lvl = l;
    return lvl;
  }
  function seasonBloomed(seasonId) {
    return FLOWERS.filter(f => f.season === seasonId).every(f => bloomed(f.id));
  }

  /* ---------- navigazione ---------- */
  function show(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
    $(id).classList.add('on');
    window.scrollTo(0, 0);
  }

  /* ---------- menu ---------- */
  function renderMenu() {
    const actions = $('menu-actions');
    actions.innerHTML = '';
    const btn = el('button', 'btn primary big', actions);
    btn.textContent = S.seenIntro ? '🌷 Torna nel giardino' : '🌷 Entra nel giardino';
    btn.addEventListener('click', () => {
      if (!S.seenIntro) {
        S.seenIntro = true; save();
        showStory(LETTERS.prologo, 'start');
      } else {
        openGarden();
      }
    });
    const walk = el('button', 'btn green', actions);
    walk.textContent = '🚶 Modalità Passeggiata';
    walk.addEventListener('click', () => showWalk());
    const sub = el('button', 'btn', actions);
    sub.textContent = '📖 La storia delle lettere';
    sub.addEventListener('click', () => showLetters());
    const chap = el('button', 'btn', actions);
    chap.textContent = '📕 I Capitoli';
    chap.addEventListener('click', () => showChapters());
    const faq = el('button', 'btn', actions);
    faq.textContent = '❓ Domande Frequenti (FAQ)';
    faq.addEventListener('click', () => showFaq());
    const lib = el('button', 'btn', actions);
    lib.textContent = '📚 Biblioteca dei Versi (' + Object.keys(S.flowers).length + '/' + FLOWERS.length + ')';
    lib.addEventListener('click', () => showLibrary());
    const erb = el('button', 'btn', actions);
    erb.textContent = '🌿 L\'Erbario (' + Object.keys(S.flowers).length + '/' + FLOWERS.length + ')';
    erb.addEventListener('click', () => showErbario());
    const quad = el('button', 'btn', actions);
    quad.textContent = '🪶 Il Quaderno dei Pensieri';
    quad.addEventListener('click', () => showQuaderno());
    const sky = el('button', 'btn', actions);
    sky.textContent = '🌌 Il Cielo (costellazioni)';
    sky.addEventListener('click', () => showSky());
    const cal = el('button', 'btn', actions);
    cal.textContent = '📅 Il Calendario del Giardiniere';
    cal.addEventListener('click', () => showCalendar());
    const serra = el('button', 'btn', actions);
    const serraCount = CALENDAR_FLOWERS.filter(f => calendarFlowerLit(f)).length;
    serra.textContent = '🏡 La Serra (' + serraCount + '/' + CALENDAR_FLOWERS.length + ')';
    serra.addEventListener('click', () => showSerra());
    const night = el('button', 'btn small', actions);
    night.textContent = S.night ? '☀️ Modalità giorno' : '🌙 Modalità notturna';
    night.addEventListener('click', () => {
      S.night = !S.night; save(); setNight(S.night); renderMenu();
    });
    const mute = el('button', 'btn small', actions);
    mute.textContent = S.muted ? '🔇 Suoni spenti' : '🔊 Suoni accesi';
    mute.addEventListener('click', () => {
      S.muted = !S.muted; AudioSys.setMuted(S.muted); save(); renderMenu();
    });
  }

  /* ---------- notte / giorno ---------- */
  function setNight(on) {
    document.body.classList.toggle('night', !!on);
    ['sky-toggle', 'sky-toggle-2', 'sky-toggle-3', 'sky-toggle-4'].forEach(id => {
      const b = $(id);
      if (b) b.textContent = on ? '☀️' : '🌙';
    });
  }

  /* ---------- giardino ---------- */
  function openGarden() {
    show('screen-garden');
    renderGarden();
  }

  function renderGarden() {
    // purrometro
    const n = Object.keys(S.flowers).length;
    const lvl = purrLevel();
    $('purr-name').textContent = lvl.emoji + ' ' + lvl.name;
    $('purr-bar').style.width = Math.min(100, (n / FLOWERS.length) * 100) + '%';
    $('purr-count').textContent = n + ' / ' + FLOWERS.length + ' fiori';

    // stagioni
    const tabs = $('season-tabs');
    tabs.innerHTML = '';
    SEASONS.forEach(se => {
      const b = el('button', 'season-tab' + (se.id === currentSeason ? ' on' : ''), tabs);
      b.innerHTML = '<span class="s-emoji">' + se.emoji + '</span><span class="s-name">' + se.name + '</span>';
      if (se.id === currentSeason) b.classList.add('on');
      b.addEventListener('click', () => { currentSeason = se.id; renderGarden(); });
    });

    // fiori della stagione
    const beds = $('flower-beds');
    beds.innerHTML = '';
    const flowers = FLOWERS.filter(f => f.season === currentSeason);
    flowers.forEach(f => {
      const card = el('button', 'flower-card', beds);
      const state = bloomed(f.id) ? 'fiore' : (isAvailable(f.id) ? 'germoglio' : 'seme');
      card.classList.add('st-' + state);
      card.innerHTML = '<div class="f-emoji">' + (state === 'fiore' ? f.emoji : state === 'germoglio' ? '🌱' : '🌰') + '</div>' +
        '<div class="f-name">' + f.name + '</div>' +
        '<div class="f-cat">' + (state === 'fiore' ? '🌸 in fiore' : state === 'germoglio' ? '🐾 da curare' : '🔒 chiuso') + '</div>';
      if (state !== 'seme') {
        card.addEventListener('click', () => {
          AudioSys.click();
          if (state === 'fiore') showConcept(f.id);
          else openFlower(f);
        });
      }
    });

    // lettera della stagione
    const letterBtn = $('season-letter');
    letterBtn.style.display = 'none';
    if (seasonBloomed(currentSeason) && LETTERS[currentSeason]) {
      letterBtn.style.display = 'block';
      letterBtn.onclick = () => showStory(LETTERS[currentSeason], 'garden');
    }

    // finale
    const finaleBtn = $('finale-letter');
    finaleBtn.style.display = 'none';
    if (Object.keys(S.flowers).length >= FLOWERS.length) {
      finaleBtn.style.display = 'block';
      finaleBtn.onclick = () => showStory(LETTERS.finale, 'garden');
    }
  }

  /* ---------- storia ---------- */
  function showStory(story, back) {
    $('story-portrait').textContent = story.emoji || '🐱';
    $('story-speaker').textContent = story.from;
    $('story-text').textContent = story.text;
    const acts = $('story-acts');
    acts.innerHTML = '';
    const ok = el('button', 'btn primary', acts);
    ok.textContent = 'Continua';
    ok.addEventListener('click', () => {
      $('story-overlay').classList.remove('on');
      if (back === 'start') openGarden();
      else if (back === 'menu' || back === 'walk-end') { renderMenu(); show('screen-menu'); }
      else if (back === 'chapters') showChapters();
    });
    $('story-overlay').classList.add('on');
    AudioSys.meow();
  }

  /* ---------- fiore: storia → minigioco → vittoria ---------- */
  function openFlower(f) {
    showStory({ emoji: f.catEmoji, from: f.cat, text: f.story }, null);
    // dopo la storia apriamo il minigioco
    const acts = $('story-acts');
    acts.innerHTML = '';
    const play = el('button', 'btn primary', acts);
    play.textContent = '🌼 Innaffia il fiore: gioca!';
    play.addEventListener('click', () => {
      $('story-overlay').classList.remove('on');
      startMinigame(f);
    });
  }

  function startMinigame(f) {
    show('screen-game');
    $('mg-title').textContent = MINIGAME_INFO[f.minigame].title;
    $('mg-sub').textContent = MINIGAME_INFO[f.minigame].sub;
    const host = $('mg-host');
    host.innerHTML = '';
    $('btn-garden').style.display = 'block';
    Minigames.run(f.minigame, host,
      () => onMinigameWin(f),
      () => onMinigameLose(f)
    );
    AudioSys.purrStart();
  }

  function onMinigameWin(f) {
    AudioSys.purrStop();
    S.flowers[f.id] = true;
    save();
    $('btn-garden').style.display = 'none';
    const host = $('mg-host');
    host.innerHTML = '';
    const box = el('div', 'win-box', host);
    box.innerHTML = '<div class="win-emoji">' + f.emoji + '</div>' +
      '<div class="win-title">' + f.name + ' è in fiore!</div>' +
      '<div class="win-quote">«' + f.quote + '»</div>' +
      '<div class="win-src">— ' + f.quoteSource + '</div>' +
      '<div class="win-fact"><b>Nella vita vera:</b> ' + f.practical + '</div>' +
      '<div class="win-philo"><b>Il Diario della Gatta:</b> ' + f.philosophy + '</div>';
    const acts = el('div', 'mg-acts', box);
    const cardBtn = el('button', 'btn primary', acts);
    cardBtn.textContent = '📗 Aggiungi all\'Erbario';
    cardBtn.addEventListener('click', () => showConcept(f));
    const cont = el('button', 'btn', acts);
    cont.textContent = '🌷 Torna al giardino';
    cont.addEventListener('click', () => openGarden());
    AudioSys.chime();
  }

  function onMinigameLose(f) {
    AudioSys.purrStop();
    $('btn-garden').style.display = 'none';
    const host = $('mg-host');
    host.innerHTML = '';
    const box = el('div', 'win-box', host);
    box.innerHTML = '<div class="win-emoji">🐾</div>' +
      '<div class="win-title">La Gatta Filosofa fa le fusa</div>' +
      '<div class="win-quote">«Non importa. La conoscenza è paziente: riprova quando vuoi.»</div>';
    const acts = el('div', 'mg-acts', box);
    const retry = el('button', 'btn primary', acts);
    retry.textContent = '🔄 Riprova';
    retry.addEventListener('click', () => startMinigame(f));
    const cont = el('button', 'btn', acts);
    cont.textContent = '🌷 Torna al giardino';
    cont.addEventListener('click', () => openGarden());
    AudioSys.wrong();
  }

  /* ---------- scheda concetto (Erbario) ---------- */
  function showConcept(f) {
    $('concept-title').textContent = f.emoji + ' ' + f.name;
    const deep = f.deep ? '<p class="c-deep"><b>📖 Approfondimento:</b> ' + f.deep + '</p>' : '';
    $('concept-body').innerHTML =
      '<p class="c-cat">' + f.catEmoji + ' <b>' + f.cat + '</b> · ' + f.concept + '</p>' +
      '<p class="c-term">' + f.formula + '</p>' +
      '<p><b>Citazione:</b> <span class="c-quote">«' + f.quote + '»</span><br><span class="c-paper">— ' + f.quoteSource + '</span></p>' +
      '<p><b>🌍 Nella vita vera:</b> ' + f.practical + '</p>' +
      '<p><b>🪶 Filosofia:</b> ' + f.philosophy + '</p>' + deep;
    $('concept-overlay').classList.add('on');
    AudioSys.click();
  }

  /* ---------- biblioteca dei versi ---------- */
  function showLibrary() {
    show('screen-library');
    const list = $('lib-list');
    list.innerHTML = '';
    FLOWERS.forEach(f => {
      if (!bloomed(f.id)) return;
      const card = el('div', 'lib-card', list);
      card.innerHTML = '<div class="lib-emoji">' + f.emoji + '</div>' +
        '<div class="lib-q">«' + f.quote + '»</div>' +
        '<div class="lib-src">— ' + f.quoteSource + '</div>';
    });
    if (list.children.length === 0) {
      list.innerHTML = '<p class="empty">Fai sbocciare i fiori per raccogliere i versi. 📖</p>';
    }
  }

  /* ---------- erbario ---------- */
  function showErbario() {
    show('screen-erbario');
    const list = $('erb-list');
    list.innerHTML = '';
    FLOWERS.forEach(f => {
      if (!bloomed(f.id)) return;
      const card = el('button', 'erb-card', list);
      card.innerHTML = '<div class="erb-emoji">' + f.emoji + '</div><div class="erb-name">' + f.name + '</div>';
      card.addEventListener('click', () => showConcept(f));
    });
    if (list.children.length === 0) {
      list.innerHTML = '<p class="empty">Nessun fiore nell\'erbario, ancora. 🌱</p>';
    }
  }

  /* ---------- quaderno dei pensieri ---------- */
  function showQuaderno() {
    show('screen-quaderno');
    const list = $('quad-list');
    list.innerHTML = '';
    QUESTIONS.forEach((q, i) => {
      const card = el('div', 'quad-card', list);
      const qEl = el('div', 'quad-q', card);
      qEl.textContent = (i + 1) + '. ' + q.q;
      const hint = el('div', 'quad-hint', card);
      hint.textContent = '🌱 ' + q.hint;
      const ta = el('textarea', 'quad-ta', card);
      ta.placeholder = 'Scrivi qui il tuo pensiero…';
      ta.value = S.notes[i] || '';
      ta.addEventListener('input', () => { S.notes[i] = ta.value; save(); });
    });
    if (QUESTIONS.length === 0) list.innerHTML = '<p class="empty">Ancora nessuna domanda.</p>';
  }

  /* ---------- esportazione del quaderno ---------- */
  function quadernoText() {
    const lines = [];
    lines.push('DE RERUM GATTA — Il Quaderno del Giardiniere');
    lines.push('Generato il ' + new Date().toLocaleString('it-IT'));
    lines.push('Fiori sbocciati: ' + Object.keys(S.flowers).length + ' / ' + FLOWERS.length);
    lines.push('Purrometro: ' + purrLevel().name);
    lines.push('Modalità notturna: ' + (S.night ? 'sì 🌙' : 'no ☀️'));
    lines.push('');
    QUESTIONS.forEach((q, i) => {
      lines.push((i + 1) + '. ' + q.q);
      lines.push('   Risposta: ' + ((S.notes[i] && S.notes[i].trim()) ? S.notes[i].trim() : '(nessuna risposta)'));
      lines.push('');
    });
    lines.push('«Il grande libro dell\'universo è scritto in lingua matematica.» — Galileo Galilei');
    return lines.join('\n');
  }

  function exportQuaderno() {
    const text = quadernoText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'quaderno-de-rerum-gatta.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    $('quad-export').textContent = '✅ Esportato!';
    setTimeout(() => { $('quad-export').textContent = '📤 Esporta il Quaderno (.txt)'; }, 2000);
    AudioSys.click();
  }

  /* ---------- cielo notturno e costellazioni ---------- */
  let currentConstellation = 'primavera';

  function constellationLit(id) {
    if (SKY_CONSTELLATIONS[id].kind === 'season') {
      const flowers = FLOWERS.filter(f => f.season === id);
      return flowers.map(f => bloomed(f.id));
    }
    if (id === 'gatta') {
      const n = Object.keys(S.flowers).length;
      return PURR_LEVELS.map(l => n >= l.min);
    }
    if (id === 'lettere') {
      const letters = [LETTERS.prologo, ...SEASONS.map(s => LETTERS[s.id]).filter(Boolean), LETTERS.finale];
      return letters.map((l, i) => {
        if (l === LETTERS.prologo) return S.seenIntro || S.walkDone;
        if (l === LETTERS.finale) return Object.keys(S.flowers).length >= FLOWERS.length || S.walkDone;
        const se = SEASONS.find(s => LETTERS[s.id] === l);
        return se ? (seasonBloomed(se.id) || S.walkDone) : false;
      });
    }
    if (id === 'pensieri') {
      return QUESTIONS.map((q, i) => !!(S.notes[i] && S.notes[i].trim()));
    }
    return [];
  }

  function constellationLabel(id) {
    if (id === 'gatta') return ['Fusa timide', 'Fusa contente', 'Motore acceso', 'Sisma d\'amore', 'Purrfection'];
    if (id === 'lettere') return ['Prologo', 'Primavera', 'Estate', 'Autunno', 'Inverno', 'Finale'];
    if (id === 'pensieri') return ['1', '2', '3', '4', '5', '6', '7', '8'];
    return FLOWERS.filter(f => f.season === id).map(f => f.name.split('di ')[1] || f.name);
  }

  function renderSkyConstellation() {
    const canvas = $('sky-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // sfondo notte
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#0d0d22');
    grad.addColorStop(1, '#1c1c3d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // stelle di fondo
    for (let i = 0; i < 90; i++) {
      const x = (i * 73.7) % W, y = (i * 37.3) % H;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.15 + ((i * 13) % 5) / 20) + ')';
      ctx.fillRect(x, y, 1.5, 1.5);
    }

    const constel = SKY_CONSTELLATIONS[currentConstellation];
    const pts = constel.pts;
    const lit = constellationLit(currentConstellation);
    const labels = constellationLabel(currentConstellation);
    let litCount = 0;

    // unisci le stelle accese
    ctx.strokeStyle = 'rgba(212,168,83,.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    let started = false;
    pts.forEach((p, i) => {
      if (lit[i]) {
        const [x, y] = p;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
        litCount++;
      }
    });
    ctx.stroke();

    pts.forEach((p, i) => {
      const [x, y] = p;
      const on = !!lit[i];
      // alone
      ctx.beginPath();
      ctx.arc(x, y, on ? 9 : 5, 0, Math.PI * 2);
      ctx.fillStyle = on ? 'rgba(232,160,180,.25)' : 'rgba(255,255,255,.05)';
      ctx.fill();
      // stella
      ctx.beginPath();
      ctx.arc(x, y, on ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = on ? '#e8a0b4' : '#5a5a7a';
      ctx.fill();
      // nome
      ctx.font = '9px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = on ? '#f3c0cf' : '#55556f';
      ctx.fillText(on ? labels[i] : '?', x, y + 16);
    });

    const hint = constel.kind === 'season'
      ? 'ogni fiore della stagione sbocciato accende una stella.'
      : constel.kind === 'goal' && currentConstellation === 'gatta'
        ? 'ogni livello di fusa raggiunto accende una stella.'
        : currentConstellation === 'lettere'
          ? 'ogni lettera sbloccata accende una stella.'
          : 'ogni pensiero scritto accende una stella.';
    $('sky-stats').textContent = constel.name + ' — stelle accese: ' + litCount + ' / ' + pts.length + ' · ' + hint;
    AudioSys.meow();
  }

  function showSky(id) {
    show('screen-sky');
    const tabs = $('sky-tabs');
    tabs.innerHTML = '';
    Object.keys(SKY_CONSTELLATIONS).forEach(key => {
      const c = SKY_CONSTELLATIONS[key];
      const b = el('button', 'sky-tab' + (key === (id || currentConstellation) ? ' on' : ''), tabs);
      b.innerHTML = '<span class="st-emoji">' + c.emoji + '</span><span class="st-name">' + c.name.replace('La Costellazione ', '').replace(' della ', ' ') + '</span>';
      b.addEventListener('click', () => {
        currentConstellation = key;
        renderSkyConstellation();
        showSky(key);
      });
    });
    currentConstellation = id || currentConstellation;
    renderSkyConstellation();
  }

  /* ---------- calendario del giardiniere ---------- */
  const MONTH_NAMES = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
  let calMonth = new Date().getMonth();

  function calendarFlowerLit(f) { return !!S.calendar[f.id]; }

  function renderCalendar() {
    $('cal-title').textContent = MONTH_NAMES[calMonth] + ' ' + new Date().getFullYear();
    const now = new Date();
    const today = now.getDate();
    const thisMonth = now.getMonth();

    // frecce
    $('cal-prev').disabled = false;
    $('cal-next').disabled = false;

    // griglia
    const grid = $('cal-grid');
    grid.innerHTML = '';
    const daysInMonth = new Date(now.getFullYear(), calMonth + 1, 0).getDate();
    const firstDay = new Date(now.getFullYear(), calMonth, 1).getDay(); // 0=domenica
    const dayNames = ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'];
    dayNames.forEach(d => {
      const h = el('div', 'cal-day cal-head', grid);
      h.textContent = d;
    });
    for (let i = 0; i < firstDay; i++) {
      el('div', 'cal-day cal-empty', grid);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = el('div', 'cal-day', grid);
      cell.textContent = d;
      if (calMonth === thisMonth && d === today) cell.classList.add('cal-today');
      // fiore del mese in questo giorno?
      const f = CALENDAR_FLOWERS.find(cf => cf.month === calMonth && cf.day === d);
      if (f) {
        const lit = calendarFlowerLit(f);
        const unlocked = new Date(now.getFullYear(), f.month, f.day) <= now;
        cell.classList.add('cal-flower');
        if (lit) cell.classList.add('cal-lit');
        const badge = el('span', 'cal-flower-emoji', cell);
        badge.textContent = lit ? f.emoji : (unlocked ? f.emoji : '🔒');
        cell.addEventListener('click', () => openCalendarFlower(f));
      }
    }

    // riepilogo
    const collected = CALENDAR_FLOWERS.filter(f => calendarFlowerLit(f)).length;
    $('cal-count').textContent = 'Fiori del calendario: ' + collected + ' / ' + CALENDAR_FLOWERS.length;
  }

  function openCalendarFlower(f) {
    const now = new Date();
    const unlocked = new Date(now.getFullYear(), f.month, f.day) <= now;
    $('cal-flower-emoji').textContent = f.emoji;
    $('cal-flower-name').textContent = f.name;
    const body = $('cal-flower-body');
    body.innerHTML = '';
    if (!unlocked) {
      const p = el('p', 'mg-hint', body);
      p.textContent = '🌙 Non è ancora sbocciato. Torna il ' + f.day + ' ' + MONTH_NAMES[f.month] + '!';
    } else if (calendarFlowerLit(f)) {
      const p = el('p', 'mg-hint', body);
      p.textContent = f.blurb;
      const q = el('p', 'cal-quote', body);
      q.textContent = '«' + f.quote + '» — ' + f.quoteSource;
      const p2 = el('p', 'mg-tips', body);
      p2.textContent = '✅ Già raccolto: è nel tuo calendario per sempre.';
    } else {
      const p = el('p', 'mg-hint', body);
      p.textContent = f.blurb;
      const q = el('p', 'mg-hint', body);
      q.textContent = f.q;
      const opts = el('div', 'mg-grid three', body);
      f.opts.forEach((o, i) => {
        const b = el('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (i === f.correct) {
            b.classList.add('correct');
            AudioSys.chime();
            S.calendar = S.calendar || {};
            S.calendar[f.id] = true;
            save();
            body.innerHTML = '';
            const ok = el('p', 'cal-quote', body);
            ok.textContent = '«' + f.quote + '» — ' + f.quoteSource;
            const expl = el('p', 'mg-tips', body);
            expl.textContent = '🌸 ' + f.expl + ' Il fiore è nel tuo calendario!';
            renderCalendar();
          } else {
            AudioSys.wrong(); shake(b);
            const t = el('p', 'mg-tips', body);
            t.textContent = 'Riprova: pensa al concetto del fiore.';
          }
        });
      });
    }
    $('cal-flower-panel').classList.add('on');
  }

  /* ---------- modalità passeggiata ---------- */
  function walkEntry(step) {
    const s = STORY_PATH[step];
    if (!s) return null;
    if (s.type === 'letter') return { emoji: LETTERS[s.key].emoji, from: LETTERS[s.key].from, text: LETTERS[s.key].text };
    const f = FLOWERS.find(x => x.id === s.id);
    return { emoji: f.catEmoji, from: f.cat + ' · ' + f.name, text: f.story + '\n\n«' + f.quote + '» — ' + f.quoteSource };
  }

  function showWalk() {
    const total = STORY_PATH.length;
    let idx = S.walkIdx || 0;
    if (idx >= total) idx = total - 1;
    show('screen-walk');
    $('walk-progress').textContent = 'Passo ' + (idx + 1) + ' di ' + total;
    const e = walkEntry(idx);
    $('walk-portrait').textContent = e.emoji;
    $('walk-speaker').textContent = e.from;
    $('walk-text').textContent = e.text;
    $('walk-prev').style.visibility = idx > 0 ? 'visible' : 'hidden';
    $('walk-next').textContent = idx >= total - 1 ? '🏁 Concludi la passeggiata' : 'Avanti →';
    if (idx >= total - 1) $('walk-next').classList.add('primary'); else $('walk-next').classList.remove('primary');
  }

  /* ---------- capitoli ---------- */
  function chapterDone(ch) {
    if (ch.letter === 'prologo') return S.seenIntro || S.walkDone;
    if (ch.letter === 'finale') return Object.keys(S.flowers).length >= FLOWERS.length || S.walkDone;
    const se = SEASONS.find(s => LETTERS[s.id] === LETTERS[ch.letter]);
    return se ? seasonBloomed(se.id) : false;
  }

  function showChapters() {
    show('screen-chapters');
    const list = $('chapters-list');
    list.innerHTML = '';
    CHAPTERS.forEach(ch => {
      const done = chapterDone(ch);
      const card = el('button', 'chapter-card' + (done ? ' done' : ''), list);
      card.innerHTML = '<div class="ch-emoji">' + ch.emoji + '</div>' +
        '<div class="ch-body"><div class="ch-num">' + ch.num + (done ? ' ✅' : '') + '</div>' +
        '<div class="ch-name">' + ch.name + '</div><div class="ch-desc">' + ch.desc + '</div></div>';
      card.addEventListener('click', () => showStory(LETTERS[ch.letter], 'chapters'));
    });
  }

  /* ---------- FAQ ---------- */
  function showFaq() {
    show('screen-faq');
    const list = $('faq-list');
    list.innerHTML = '';
    FAQ.forEach((f, i) => {
      const card = el('div', 'faq-card', list);
      const qEl = el('div', 'faq-q', card);
      qEl.textContent = (i + 1) + '. ' + f.q;
      const aEl = el('div', 'faq-a', card);
      aEl.textContent = f.a;
      const refEl = el('div', 'faq-ref', card);
      refEl.textContent = f.ref;
    });
  }

  /* ---------- lettere ---------- */
  function showLetters() {
    const list = [
      LETTERS.prologo,
      ...SEASONS.map(s => LETTERS[s.id]).filter(Boolean),
      LETTERS.finale,
    ].filter(l => l);
    show('screen-letters');
    const wrap = $('letters-list');
    wrap.innerHTML = '';
    list.forEach((l, i) => {
      const isFinale = l === LETTERS.finale;
      const unlocked = i === 0 || S.walkDone ||
        (isFinale ? Object.keys(S.flowers).length >= FLOWERS.length
                  : seasonBloomed(SEASONS[i - 1] ? SEASONS[i - 1].id : ''));
      const card = el('button', 'letter-card' + (unlocked ? '' : ' locked'), wrap);
      card.innerHTML = '<div class="letter-emoji">' + l.emoji + '</div><div class="letter-from">' + l.from + '</div>' +
        '<div class="letter-preview">' + (unlocked ? l.text.split('\n')[0] + '…' : '🔒 Si sblocca con la stagione') + '</div>';
      if (unlocked) card.addEventListener('click', () => showStory(l, 'letters'));
    });
  }

  /* ---------- calendario ---------- */
  function showCalendar() {
    show('screen-calendar');
    calMonth = new Date().getMonth();
    renderCalendar();
  }

  /* ---------- serra ---------- */
  function calendarDateStr(f) {
    return f.day + ' ' + MONTH_NAMES[f.month];
  }

  function showSerra() {
    show('screen-serra');
    const now = new Date();
    const grid = $('serra-grid');
    grid.innerHTML = '';
    const byMonth = {};
    CALENDAR_FLOWERS.forEach(f => { (byMonth[f.month] = byMonth[f.month] || []).push(f); });
    Object.keys(byMonth).sort((a, b) => a - b).forEach(m => {
      const monthGroup = el('div', 'serra-month', grid);
      const head = el('div', 'serra-month-name', monthGroup);
      head.textContent = MONTH_NAMES[parseInt(m)];
      const inner = el('div', 'serra-grid-inner', monthGroup);
      byMonth[m].forEach(f => {
        const lit = calendarFlowerLit(f);
        const unlocked = new Date(now.getFullYear(), f.month, f.day) <= now;
        const card = el('button', 'serra-card' + (lit ? ' lit' : unlocked ? ' ready' : ' locked'), inner);
        card.innerHTML = '<div class="serra-emoji">' + (lit ? f.emoji : '🌱') + '</div>' +
          '<div class="serra-name">' + f.name + '</div>' +
          '<div class="serra-date">' + (lit ? '🌸 in fiore' : unlocked ? '📥 da raccogliere' : '🔒 ' + calendarDateStr(f)) + '</div>';
        if (!lit && !unlocked) {
          card.disabled = true;
        } else {
          card.addEventListener('click', () => openCalendarFlower(f));
        }
      });
    });
    const collected = CALENDAR_FLOWERS.filter(f => calendarFlowerLit(f)).length;
    $('serra-count').textContent = 'Fiori nella serra: ' + collected + ' / ' + CALENDAR_FLOWERS.length +
      ' — tocca un fiore pronto per raccoglierlo.';
    AudioSys.meow();
  }

  /* ---------- eventi globali ---------- */
  $('btn-garden').addEventListener('click', () => { AudioSys.purrStop(); openGarden(); });
  $('btn-home').addEventListener('click', () => { AudioSys.purrStop(); show('screen-menu'); renderMenu(); });
  $('concept-close').addEventListener('click', () => $('concept-overlay').classList.remove('on'));
  $('btn-back-library').addEventListener('click', () => openGarden());
  $('btn-back-erbario').addEventListener('click', () => openGarden());
  $('btn-back-quaderno').addEventListener('click', () => openGarden());
  $('btn-back-letters').addEventListener('click', () => openGarden());
  $('btn-back-chapters').addEventListener('click', () => openGarden());
  $('btn-back-faq').addEventListener('click', () => openGarden());
  $('btn-back-walk').addEventListener('click', () => openGarden());
  $('btn-back-sky').addEventListener('click', () => openGarden());
  $('btn-back-calendar').addEventListener('click', () => openGarden());
  $('btn-back-serra').addEventListener('click', () => openGarden());
  $('cal-prev').addEventListener('click', () => { calMonth = (calMonth + 11) % 12; renderCalendar(); });
  $('cal-next').addEventListener('click', () => { calMonth = (calMonth + 1) % 12; renderCalendar(); });
  $('cal-flower-close').addEventListener('click', () => $('cal-flower-panel').classList.remove('on'));
  $('sky-toggle').addEventListener('click', () => {
    S.night = !S.night; save(); setNight(S.night);
  });
  $('sky-toggle-2').addEventListener('click', () => {
    S.night = !S.night; save(); setNight(S.night);
  });
  $('sky-toggle-3').addEventListener('click', () => {
    S.night = !S.night; save(); setNight(S.night);
  });
  $('sky-toggle-4').addEventListener('click', () => {
    S.night = !S.night; save(); setNight(S.night);
  });
  $('quad-export').addEventListener('click', () => exportQuaderno());
  $('walk-prev').addEventListener('click', () => {
    const idx = (S.walkIdx || 0) - 1;
    if (idx < 0) return;
    S.walkIdx = idx; save(); showWalk();
  });
  $('walk-next').addEventListener('click', () => {
    const idx = (S.walkIdx || 0) + 1;
    if (idx >= STORY_PATH.length) {
      S.walkDone = true; save();
      showStory(LETTERS.finale, 'walk-end');
      return;
    }
    S.walkIdx = idx; save(); showWalk();
  });

  document.addEventListener('pointerdown', () => AudioSys.unlock(), { once: true });

  /* ---------- avvio ---------- */
  AudioSys.setMuted(S.muted);
  setNight(S.night);
  renderMenu();
  show('screen-menu');
})();
