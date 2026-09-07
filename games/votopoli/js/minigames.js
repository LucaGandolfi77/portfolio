// minigames.js — 5 minigiochi satirici
window.Minigames = (() => {
  function formatMoney(n) { return Save.formatMoney(n); }

  // === 1. DIBATTO TV — quiz satirici ===
  function startDibattito(area, onComplete) {
    let score = 0, round = 0;
    const total = 5;

    const QUESTIONS = [
      { q: 'Quanto costano i conti degli italiani al mese?', a: ['€50', '€150', '€300', 'Non lo sa nessuno'], c: 3 },
      { q: 'Cosa fa un politico quando non sa rispondere?', a: ['Dimette', 'Cambia discorso', 'Blinda il computer', 'Comincia a piangere'], c: 1 },
      { q: 'Quale partido ha promesso la moneta finta?', a: ['Movimento 5 Pizze', 'Lega dei Pigri', 'Fratelli di Moneta', 'Nessuno (per ora)'], c: 2 },
      { q: 'Cosa succede se il sindaco alza le tasse?', a: ['La gente applaude', 'Nessuno nota', 'La gente scappa', 'I ristoranti fanno sconto'], c: 2 },
      { q: 'Quale è la professione più redditizia in Italia?', a: ['Medico', 'Influencer', 'Politicante', 'Cassiere'], c: 2 },
      { q: 'Perché i politici vanno al mare?', a: ['Per studiare', 'Per la brezza marina', 'Per fare le foto', 'Per sopravvivere al caldo'], c: 2 },
      { q: 'Quanto costa un ponte che non si costruisce?', a: ['€0', '€100M', '€1B', '€10B ma non lo fai'], c: 3 },
      { q: 'Cosa dice il politico alle elezioni?', a: ['Vi prometto tutto', 'Non ho capito la domanda', 'Il mio avversario è pazzo', 'Tutte le precedenti'], c: 3 },
      { q: 'Quale evento ha fatto cadere il governo?', a: ['Una mozione di sfiducia', 'Un tweet sbagliato', 'Una pizza non pagata', 'Nessuno sa'], c: 3 },
      { q: 'Cos\'è la "flat tax" secondo il cittadino medio?', a: ['Una tassa piatta', 'Un\'imposta piatta', 'Una tassa per piatti sporchi', 'Una cosa che non capisco'], c: 2 }
    ];

    function render() {
      if (round >= total) {
        const passed = score >= total * 4;
        onComplete(passed, score * 10);
        return;
      }

      const q = QUESTIONS[round % QUESTIONS.length];
      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">🎤 Dibattito TV — Round ${round + 1}/${total}</div>
          <div class="mg-sub">Punti: ${score}/${total}</div>
          <div style="font-size:14px;font-weight:700;margin:16px 0 12px">${q.q}</div>
          <div id="dib-answers"></div>
        </div>`;

      const ansEl = document.getElementById('dib-answers');
      q.a.forEach((txt, i) => {
        const btn = document.createElement('button');
        btn.className = 'mg-btn';
        btn.textContent = txt;
        btn.onclick = () => {
          if (i === q.c) {
            btn.classList.add('correct');
            if (window.Sounds) window.Sounds.play('correct');
            Haptic.select();
            score++;
          } else {
            btn.classList.add('wrong');
            if (window.Sounds) window.Sounds.play('wrong');
            Haptic.heavy();
            ansEl.children[q.c].classList.add('correct');
          }
          setTimeout(() => { round++; render(); }, 800);
        };
        ansEl.appendChild(btn);
      });
    }
    render();
  }

  // === 2. SCHIVA LA BUROCRAZIA — runner ===
  function startBurocrazia(area, onComplete) {
    let score = 0, hp = 3, pos = 1;
    const W = 5, H = 5;
    const obstacles = ['📋', '印章', '📝', '🏛️', '⚖️'];
    let grid = [], spawnTimer = 0, gameInterval;

    function initGrid() {
      grid = [];
      for (let y = 0; y < H; y++) {
        grid[y] = [];
        for (let x = 0; x < W; x++) grid[y][x] = null;
      }
      grid[0][pos] = '🧑';
    }

    function renderGrid() {
      let html = '<div style="display:grid;grid-template-columns:repeat(5,48px);gap:4px;justify-content:center">';
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const cell = grid[y][x];
          html += `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;font-size:24px;border-radius:8px;background:var(--card2);${cell === '🧑' ? 'box-shadow:0 0 8px var(--gold)' : ''}">${cell || ''}</div>`;
        }
      }
      html += '</div>';
      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">📋 Schiva la Burocrazia</div>
          <div class="mg-sub">HP: ${'❤️'.repeat(hp)} | Punti: ${score}</div>
          <div style="margin:12px 0">${html}</div>
          <div class="mg-sub">⬅️ ➡️ Muoviti per evitare la burocrazia!</div>
        </div>`;

      area.querySelector('.mg-card').onclick = (e) => {
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) move(-1); else move(1);
      };

      const controls = document.createElement('div');
      controls.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:8px';
      controls.innerHTML = `
        <button class="mg-btn" style="flex:1" onclick="window._buroMove(-1)">⬅️</button>
        <button class="mg-btn" style="flex:1" onclick="window._buroMove(1)">➡️</button>`;
      area.appendChild(controls);
    }

    window._buroMove = (d) => move(d);

    function move(d) {
      grid[0][pos] = null;
      pos = Math.max(0, Math.min(W - 1, pos + d));
      grid[0][pos] = '🧑';
    }

    function tick() {
      for (let y = H - 1; y > 0; y--) {
        for (let x = 0; x < W; x++) {
          if (grid[y][x] && grid[y][x] !== '🧑') {
            if (y === H - 1) {
              grid[y][x] = null;
              score++;
            } else {
              grid[y + 1][x] = grid[y][x];
              grid[y][x] = null;
              if (y + 1 === H - 1 && x === pos) {
                hp--;
                if (hp <= 0) { clearInterval(gameInterval); onComplete(false, score); return; }
              }
            }
          }
        }
      }

      spawnTimer++;
      if (spawnTimer >= 2) {
        spawnTimer = 0;
        const x = Math.floor(Math.random() * W);
        if (!grid[0][x]) grid[0][x] = obstacles[Math.floor(Math.random() * obstacles.length)];
      }

      renderGrid();
    }

    initGrid();
    renderGrid();
    gameInterval = setInterval(tick, 400);
  }

  // === 3. CAMPAGNA ELETTORALE — timing ===
  function startCampagna(area, onComplete) {
    let score = 0, round = 0, total = 10;
    let active = false, timer;

    const ACTIONS = [
      { emoji: '🤝', text: 'Stringi la mano!', points: 10, time: 1500 },
      { emoji: '👶', text: 'Bacia un bambino!', points: 15, time: 1200 },
      { emoji: '🎤', text: 'Discorso pubblico!', points: 20, time: 1000 },
      { emoji: '📸', text: 'Foto col sindaco!', points: 12, time: 1300 },
      { emoji: '🥖', text: 'Distribuisci pane!', points: 8, time: 1600 },
      { emoji: '📺', text: 'Apparso in TV!', points: 25, time: 800 },
      { emoji: '🐕', text: 'Abbraccia un cane!', points: 18, time: 1100 },
      { emoji: '🎪', text: 'Fai il giocoliere!', points: 30, time: 700 }
    ];

    function render() {
      if (round >= total) {
        onComplete(score >= 80, score);
        return;
      }

      const action = ACTIONS[round % ACTIONS.length];
      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">🤝 Campagna Elettorale</div>
          <div class="mg-sub">Punti: ${score} | Round: ${round + 1}/${total}</div>
          <div style="font-size:64px;margin:20px 0">${action.emoji}</div>
          <div style="font-size:16px;font-weight:700;margin:8px 0">${action.text}</div>
          <div id="camp-bar" style="width:80%;height:12px;background:var(--line);border-radius:6px;margin:16px auto;overflow:hidden">
            <div id="camp-fill" style="height:100%;background:var(--green);width:0%;border-radius:6px;transition:width 0.05s linear"></div>
          </div>
          <div id="camp-msg" style="font-size:12px;color:var(--dim)">Premi quando la barra è nel punto giusto!</div>
        </div>`;

      const bar = document.getElementById('camp-bar');
      const fill = document.getElementById('camp-fill');
      const msg = document.getElementById('camp-msg');
      let pct = 0;
      let dir = 1;
      active = true;

      timer = setInterval(() => {
        pct += dir * 3;
        if (pct >= 100) { pct = 100; dir = -1; }
        if (pct <= 0) { pct = 0; dir = 1; }
        fill.style.width = pct + '%';
      }, 30);

      bar.onclick = () => {
        if (!active) return;
        active = false;
        clearInterval(timer);

        const sweet = pct >= 40 && pct <= 60;
        const good = pct >= 25 && pct <= 75;
        if (sweet) {
          score += action.points;
          msg.textContent = '🎯 PERFETTO! +' + action.points;
          msg.style.color = 'var(--green)';
          Haptic.select();
        } else if (good) {
          score += Math.round(action.points / 2);
          msg.textContent = '👍 Bene! +' + Math.round(action.points / 2);
          msg.style.color = 'var(--gold)';
          Haptic.tap();
        } else {
          msg.textContent = '❌ Errore! 0 punti';
          msg.style.color = 'var(--red)';
          Haptic.heavy();
        }

        setTimeout(() => { round++; render(); }, 1000);
      };
    }
    render();
  }

  // === 4. BUSTA PAGA — catch falling money ===
  function startBustaPaga(area, onComplete) {
    let score = 0, lives = 3, round = 0, total = 30;
    const W = 5;
    let items = [], pos = 2, gameInterval;

    function render() {
      let html = '<div style="display:grid;grid-template-columns:repeat(5,52px);gap:4px;justify-content:center">';
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < W; x++) {
          const item = items.find(i => i.x === x && i.y === y);
          const isPlayer = y === 5 && x === pos;
          html += `<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:28px;border-radius:8px;background:${isPlayer ? 'var(--gold-light)' : 'var(--card2)'}">${isPlayer ? '🧤' : (item ? item.emoji : '')}</div>`;
        }
      }
      html += '</div>';

      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">💸 Busta Paga</div>
          <div class="mg-sub">${'❤️'.repeat(lives)} | Punti: ${score}</div>
          <div style="margin:12px 0">${html}</div>
        </div>`;

      area.onclick = (e) => {
        const rect = area.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) move(-1); else move(1);
      };

      const controls = document.createElement('div');
      controls.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:8px';
      controls.innerHTML = `
        <button class="mg-btn" style="flex:1" onclick="window._bustaMove(-1)">⬅️</button>
        <button class="mg-btn" style="flex:1" onclick="window._bustaMove(1)">➡️</button>`;
      area.appendChild(controls);
    }

    window._bustaMove = (d) => { pos = Math.max(0, Math.min(W - 1, pos + d)); };

    function tick() {
      items = items.filter(i => i.y < 6);

      items.forEach(i => i.y++);

      items.forEach(i => {
        if (i.y === 5 && i.x === pos) {
          if (i.type === 'money') {
            score += i.value;
            Haptic.light();
          } else if (i.type === 'tax') {
            lives--;
            Haptic.error();
          }
          i.y = 10;
        }
      });

      if (Math.random() < 0.35) {
        const x = Math.floor(Math.random() * W);
        const isTax = Math.random() < 0.3;
        items.push({
          x, y: 0,
          emoji: isTax ? '📋' : '💰',
          type: isTax ? 'tax' : 'money',
          value: isTax ? 0 : (5 + Math.floor(Math.random() * 20))
        });
      }

      round++;
      if (round >= total || lives <= 0) {
        clearInterval(gameInterval);
        onComplete(lives > 0, score);
        return;
      }

      render();
    }

    render();
    gameInterval = setInterval(tick, 350);
  }

  // === 5. PROMESSE DA MARINAIO — memory ===
  function startMemoria(area, onComplete) {
    let score = 0, round = 0, total = 5;
    let cards = [], flipped = [], matched = [], pairs = 0;

    const PROMISES = [
      { emoji: '🍕', text: 'Pizza gratis' },
      { emoji: '🏖️', text: 'Vacanza fiscale' },
      { emoji: '🏗️', text: 'Nuovi ponti' },
      { emoji: '🏫', text: 'Scuole免费' },
      { emoji: '💊', text: 'Farmaci gratis' },
      { emoji: '📺', text: 'TV digitale' },
      { emoji: '🚌', text: 'Transporte gratis' },
      { emoji: '💰', text: 'Bonus 1000€' }
    ];

    function setupRound() {
      const n = Math.min(4 + round, 8);
      const selected = PROMISES.slice(0, n);
      cards = [];
      selected.forEach(p => {
        cards.push({ ...p, id: p.emoji + '_1' });
        cards.push({ ...p, id: p.emoji + '_2' });
      });
      cards.sort(() => Math.random() - 0.5);
      flipped = [];
      matched = [];
      pairs = 0;
    }

    function render() {
      if (round >= total) {
        onComplete(score >= 20, score);
        return;
      }

      const cols = cards.length <= 6 ? 3 : 4;
      let html = `<div style="display:grid;grid-template-columns:repeat(${cols},64px);gap:6px;justify-content:center">`;
      cards.forEach((c, i) => {
        const isFlipped = flipped.includes(i) || matched.includes(i);
        const isMatched = matched.includes(i);
        html += `<div class="mem-card" data-idx="${i}" style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:28px;border-radius:10px;cursor:pointer;
          background:${isMatched ? 'var(--green-light)' : isFlipped ? 'var(--gold-light)' : 'var(--card)'};
          border:2px solid ${isMatched ? 'var(--green)' : isFlipped ? 'var(--gold)' : 'var(--line)'};
          opacity:${isMatched ? 0.6 : 1}">${isFlipped ? c.emoji : '❓'}</div>`;
      });
      html += '</div>';

      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">🧠 Promesse da Marinaio</div>
          <div class="mg-sub">Punti: ${score} | Round: ${round + 1}/${total}</div>
          <div style="margin:16px 0">${html}</div>
          <div class="mg-sub">Trova le coppie di promesse!</div>
        </div>`;

      area.querySelectorAll('.mem-card').forEach(el => {
        el.onclick = () => flipCard(+el.dataset.idx);
      });
    }

    function flipCard(idx) {
      if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx)) return;
      flipped.push(idx);
      Haptic.light();

      if (flipped.length === 2) {
        const [a, b] = flipped;
        if (cards[a].emoji === cards[b].emoji) {
          matched.push(a, b);
          pairs++;
          score += 5;
          Haptic.select();
          if (pairs === cards.length / 2) {
            score += 10;
            setTimeout(() => { round++; setupRound(); render(); }, 600);
            return;
          }
        } else {
          Haptic.error();
        }
        setTimeout(() => { flipped = []; render(); }, 600);
      } else {
        render();
      }
    }

    setupRound();
    render();
  }

  // === 6. DEBATE BINGO — griglia 4x4 di frasi politiche ===
  function startDebateBingo(area, onComplete) {
    let score = 0, timeLeft = 60;
    const phrases = [
      'Cambierò le cose', 'Per il popolo', 'Basta con la corruzione',
      'Lavoreremo insieme', 'Un futuro migliore', 'Le donne prima',
      'I giovani', 'Ridurre le tasse', 'Più servizi',
      'Trasparenza totale', 'Democrazia vera', 'Per la famiglia',
      'Stop alla burocrazia', 'Innovazione', 'Sviluppo sostenibile',
      'Pace e lavoro'
    ];
    const grid = phrases.sort(() => Math.random() - 0.5).slice(0, 16);
    let marked = new Set();

    function render() {
      const cells = grid.map((p, i) => {
        const isMarked = marked.has(i);
        const row = Math.floor(i / 4);
        const col = i % 4;
        return `<div class="bingo-cell ${isMarked ? 'marked' : ''}" data-idx="${i}" style="width:23%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:${isMarked ? 'var(--gold-light)' : 'var(--card)'};border:1px solid ${isMarked ? 'var(--gold)' : 'var(--line)'};border-radius:6px;font-size:8px;text-align:center;padding:2px;cursor:pointer">${p}</div>`;
      }).join('');

      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">🗣️ Debate Bingo</div>
          <div class="mg-sub">⚡⏱️ ${timeLeft}s · Punti: ${score}</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;margin:8px 0">${cells}</div>
          <div style="font-size:10px;color:var(--dim);text-align:center">Tocca le frasi che senti nel dibattito!</div>
        </div>`;

      area.querySelectorAll('.bingo-cell').forEach(el => {
        el.onclick = () => {
          const idx = parseInt(el.dataset.idx);
          if (marked.has(idx)) { marked.delete(idx); score -= 2; }
          else { marked.add(idx); score += 5; Haptic.light(); }
          if (score < 0) score = 0;
          render();
        };
      });
    }

    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) { clearInterval(timer); onComplete(score >= 2, score); return; }
      render();
    }, 1000);

    render();
  }

  // === 7. TAX FRAUD DODGE — runner: schiva i controllori ===
  function startTaxDodge(area, onComplete) {
    let score = 0, timeLeft = 30, playerPos = 1;
    const lanes = 3;
    let obstacles = [], coins = [];

    function spawn() {
      if (Math.random() < 0.4) obstacles.push({ lane: Math.floor(Math.random() * lanes), y: 0 });
      if (Math.random() < 0.3) coins.push({ lane: Math.floor(Math.random() * lanes), y: 0 });
    }

    function render() {
      let road = '';
      for (let row = 0; row < 6; row++) {
        let cells = '';
        for (let lane = 0; lane < lanes; lane++) {
          const isPlayer = row === 4 && lane === playerPos;
          const isObs = obstacles.some(o => o.lane === lane && o.y === row);
          const isCoin = coins.some(c => c.lane === lane && c.y === row);
          cells += `<div style="width:60px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);border-radius:4px;font-size:16px;background:${isPlayer ? 'var(--gold-light)' : 'var(--card)'}">${isPlayer ? '🏃' : isObs ? '👮' : isCoin ? '💰' : ''}</div>`;
        }
        road += `<div style="display:flex;gap:4px;justify-content:center;margin:2px 0">${cells}</div>`;
      }

      area.innerHTML = `
        <div class="mg-card">
          <div class="mg-title">🏃 Tax Fraud Dodge</div>
          <div class="mg-sub">⏱️ ${timeLeft}s · Punti: ${score}</div>
          ${road}
          <div style="display:flex;gap:8px;justify-content:center;margin-top:8px">
            <button class="mg-btn" id="td-left" style="width:auto;padding:8px 16px">⬅️</button>
            <button class="mg-btn" id="td-up" style="width:auto;padding:8px 16px">⬆️</button>
            <button class="mg-btn" id="td-right" style="width:auto;padding:8px 16px">➡️</button>
          </div>
        </div>`;

      document.getElementById('td-left').onclick = () => { if (playerPos > 0) { playerPos--; Haptic.light(); } render(); };
      document.getElementById('td-right').onclick = () => { if (playerPos < lanes - 1) { playerPos++; Haptic.light(); } render(); };
      document.getElementById('td-up').onclick = () => { score += 2; Haptic.tap(); render(); };
    }

    const gameLoop = setInterval(() => {
      spawn();
      obstacles.forEach(o => o.y++);
      coins.forEach(c => c.y++);
      obstacles = obstacles.filter(o => o.y < 7);
      coins = coins.filter(c => c.y < 7);

      obstacles.forEach(o => { if (o.y === 4 && o.lane === playerPos) { score -= 5; Haptic.error(); } });
      coins = coins.filter(c => { if (c.y === 4 && c.lane === playerPos) { score += 8; Haptic.tap(); return false; } return true; });
      if (score < 0) score = 0;

      timeLeft--;
      if (timeLeft <= 0) { clearInterval(gameLoop); onComplete(score >= 20, score); return; }
      render();
    }, 400);

    render();
  }

  const GAMES = [
    { id: 'dibattito',   name: 'Dibattito TV',      emoji: '🎤', desc: 'Quiz satirici sul mondo politico',      fn: startDibattito,   minScore: 20, cost: 10 },
    { id: 'burocrazia',  name: 'Schiva la Burocrazia', emoji: '📋', desc: 'Schiva bollette, moduli e timbri', fn: startBurocrazia,  minScore: 15, cost: 10 },
    { id: 'campagna',    name: 'Campagna Elettorale', emoji: '🤝', desc: 'Stringi mani e bacia bambini',         fn: startCampagna,    minScore: 80, cost: 15 },
    { id: 'bustapaga',   name: 'Busta Paga',         emoji: '💸', desc: 'Cattura i soldi, evita le tasse',      fn: startBustaPaga,   minScore: 30, cost: 10 },
    { id: 'memoria',     name: 'Promesse da Marinaio', emoji: '🧠', desc: 'Memorizza le promesse elettorali', fn: startMemoria,     minScore: 20, cost: 15 },
    { id: 'debatebingo', name: 'Debate Bingo',        emoji: '🗣️', desc: 'Bingo delle frasi politiche',       fn: startDebateBingo, minScore: 2,  cost: 15 },
    { id: 'taxdodge',    name: 'Tax Fraud Dodge',     emoji: '🏃', desc: 'Schiva i controllori del fisco',    fn: startTaxDodge,    minScore: 20, cost: 10 }
  ];

  function start(gameId, area, onComplete) {
    const game = GAMES.find(g => g.id === gameId);
    if (!game) { onComplete(true, 0); return; }
    game.fn(area, onComplete);
  }

  function getGames() { return GAMES; }

  return { start, getGames };
})();
