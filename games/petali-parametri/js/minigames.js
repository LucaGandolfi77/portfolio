window.MiniGames = (() => {
  function pickRandom(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }

  const TOKEN_SENTENCES = [
    { text: 'Il gatto dorme sul tappeto caldo', tokens: ['Il','gatto','dorme','sul','tappeto','caldo'] },
    { text: 'L\'amore è una poesia infinita', tokens: ['L\'','amore','è','una','poesia','infinita'] },
    { text: 'Il computer pensa in token', tokens: ['Il','computer','pensa','in','token'] },
    { text: 'La vita è fatta di ricordi e speranze', tokens: ['La','vita','è','fatta','di','ricordi','e','speranze'] },
    { text: 'Ogni fiore racconta una storia', tokens: ['Ogni','fiore','racconta','una','storia'] },
    { text: 'Il padrone ci ha lasciati un regalo', tokens: ['Il','padrone','ci','ha','lasciati','un','regalo'] },
    { text: 'La gatta nera danza nella luce', tokens: ['La','gatta','nera','danza','nella','luce'] },
    { text: 'I ricordi sono semi che fioriscono', tokens: ['I','ricordi','sono','semi','che','fioriscono'] }
  ];

  const SOFTMAX_TOKENS = [
    { context: 'Il gatto è andato sul ___', options: ['tappeto','vulcano','piano','riccio','server'], probs: [45, 2, 30, 8, 15] },
    { context: 'L\'amore è come un ___', options: ['fiore','server','tavolo','sogni','bollitore'], probs: [35, 3, 5, 50, 7] },
    { context: 'La poesia nasce dalla ___', options: ['insulina','anima','tastiera','esca','follia'], probs: [5, 40, 20, 2, 33] },
    { context: 'Il modello ha predetto che ___', options: ['il cielo','il rischio','la risposta','la gravità','il gatto'], probs: [8, 10, 45, 12, 25] },
    { context: 'Ogni token porta con sé un ___', options: ['pezzo','ricordo','errore','dati','pensiero'], probs: [15, 30, 5, 20, 30] }
  ];

  const ATTENTION_SENTENCES = [
    { words: ['Il','gatto','nero','dorme','sul','tappeto','caldo'], target: 2, answers: [0,1,2,3,4,5,6], correct: 1, reason: '"nero" si riferisce a "gatto" (aggettivo)' },
    { words: ['Musa','ama','Primo','che','è','un','fiore'], target: 2, answers: [0,1,2,3,4,5,6], correct: 0, reason: '"Primo" è il soggetto della frase principale' },
    { words: ['La','macchina','pensa','ma','non','capisce','tutto'], target: 3, answers: [0,1,2,3,4,5,6], correct: 2, reason: '"ma" si collega a "pensa" (congiunzione avversativa)' },
    { words: ['I','petali','cadono','e','la','musica','tace'], target: 4, answers: [0,1,2,3,4,5,6], correct: 5, reason: '"la" si riferisce a "musica" (articolo determinativo)' }
  ];

  const TEMP_VERSI = [
    { base: 'La luna brilla nel cielo', tokens: ['notte','nero','fredda','infinita','antica','nera','vuota','soffice'] },
    { base: 'Il vento sussurra tra le foglie', tokens: ['verdi','dorate','silenziose','perdute','dolci','morte','selvagge','sacre'] },
    { base: 'Cuore mio batte per te', tokens: ['lontano','forte','piano','eterno','spezzato','caldo',' fragile','per sempre'] }
  ];

  // ===================== 1. TOKENIZZA =====================
  function startTokeni(area, onComplete) {
    let round = 0, maxRounds = 5, score = 0, timer, timeLeft = 20;

    function render() {
      if (round >= maxRounds) return finish();
      const s = TOKEN_SENTENCES[round];
      const words = s.text.split(' ');
      timeLeft = 22 - round * 2;

      area.innerHTML = `
        <div class="mg-title">🌱 Tokenizza!</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div class="mg-sub">Tocca le parole per separarle in token corretti</div>
          <div class="token-text" id="token-area">
            ${words.map((w, i) => `<span class="token-word" data-idx="${i}">${w}</span>`).join(' ')}
          </div>
          <div style="text-align:center;margin-top:8px;font-size:12px;color:var(--dim)">
            Token selezionati: <span id="tok-count">0</span> / ${s.tokens.length}
          </div>
        </div>
        <div class="mg-timer" id="mg-timer">${timeLeft}s</div>
        <button class="btn primary" id="tok-submit">Conferma token ✓</button>
      `;

      let selected = new Set();
      area.querySelectorAll('.token-word').forEach(el => {
        el.onclick = () => {
          const idx = +el.dataset.idx;
          if (selected.has(idx)) { selected.delete(idx); el.classList.remove('tok'); }
          else { selected.add(idx); el.classList.add('tok'); }
          document.getElementById('tok-count').textContent = selected.size;
        };
      });

      document.getElementById('tok-submit').onclick = () => {
        clearInterval(timer);
        const correct = s.tokens.length;
        const sel = selected.size;
        const exact = sel === correct;
        const pts = exact ? 20 : Math.max(0, 10 - Math.abs(sel - correct) * 3);
        score += pts;

        area.querySelectorAll('.token-word').forEach((el, i) => {
          if (selected.has(i)) el.style.borderColor = 'var(--sage)';
        });

        const msg = exact ? 'Token perfetti! 🌸' : `Servivano ${correct} token, ne hai selezionati ${sel}`;
        setTimeout(() => { area.querySelector('.mg-card').insertAdjacentHTML('beforeend', `<div style="text-align:center;padding:8px;font-size:13px;font-weight:700;color:${exact ? 'var(--sage-dark)' : 'var(--pink-dark)'}">${msg} (+${pts})</div>`); }, 300);
        setTimeout(() => { round++; render(); }, 1200);
      };

      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        const el = document.getElementById('mg-timer');
        if (el) el.textContent = timeLeft + 's';
        if (timeLeft <= 0) { clearInterval(timer); round++; render(); }
      }, 1000);
    }

    function finish() {
      clearInterval(timer);
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${passed ? '🌸' : '🥀'} Tokenizza! — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '🌸' : '🍂'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'Hai imparato a seminare i token!' : 'I semi sono ancora nel fiore... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 2. PREVEDI IL TOKEN =====================
  function startProbabilita(area, onComplete) {
    let round = 0, maxRounds = 5, score = 0;

    function render() {
      if (round >= maxRounds) return finish();
      const s = SOFTMAX_TOKENS[round];
      const total = s.probs.reduce((a, b) => a + b, 0);
      const normProbs = s.probs.map(p => p / total * 100);

      area.innerHTML = `
        <div class="mg-title">🌊 Prevedi il Token</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div style="text-align:center;font-size:15px;font-weight:700;margin-bottom:10px;font-style:italic">${s.context}</div>
          <div id="prob-bars">
            ${s.options.map((opt, i) => `
              <div class="prob-bar" data-idx="${i}">
                <div class="p-label">${opt}</div>
                <div class="p-track"><div class="p-fill" style="width:${normProbs[i]}%;background:linear-gradient(90deg,${normProbs[i] > 30 ? '#e8a0b4' : normProbs[i] > 15 ? '#d5c4e0' : '#f0dde3'})">${normProbs[i].toFixed(0)}%</div></div>
                <div class="p-val">${normProbs[i].toFixed(0)}%</div>
              </div>
            `).join('')}
          </div>
          <div class="mg-sub" style="margin-top:10px">Clicca il TOKEN più probabile!</div>
        </div>
      `;

      area.querySelectorAll('.prob-bar').forEach(bar => {
        bar.style.cursor = 'pointer';
        bar.onclick = () => {
          const idx = +bar.dataset.idx;
          const maxIdx = s.probs.indexOf(Math.max(...s.probs));
          if (idx === maxIdx) {
            score += 20;
            bar.querySelector('.p-fill').style.background = 'var(--sage)';
            bar.style.border = '2px solid var(--sage)';
          } else {
            bar.querySelector('.p-fill').style.background = '#e57373';
            area.querySelectorAll('.prob-bar')[maxIdx].style.border = '2px solid var(--sage)';
          }
          setTimeout(() => { round++; render(); }, 1000);
        };
      });
    }

    function finish() {
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${passed ? '🌊' : '💧'} Prevedi il Token — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '🌊' : '💧'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'Il fiume delle probabilità scorre per te!' : 'Le correnti sono turbolente... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 3. ATTENZIONE =====================
  function startAttenzione(area, onComplete) {
    let round = 0, maxRounds = 4, score = 0;

    function render() {
      if (round >= maxRounds) return finish();
      const s = ATTENTION_SENTENCES[round];

      area.innerHTML = `
        <div class="mg-title">✨ Attenzione!</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div class="mg-sub">Quale parola è più collegata a "${s.words[s.target]}"?</div>
          <div style="font-size:16px;font-weight:700;text-align:center;margin:12px 0;letter-spacing:1px">
            ${s.words.map((w, i) => `<span style="display:inline-block;padding:6px 10px;margin:4px;border-radius:8px;background:${i === s.target ? 'var(--pink-light);border:2px solid var(--pink)' : 'var(--cream);border:2px solid var(--line)'};font-weight:${i === s.target ? '800' : '600'};color:${i === s.target ? 'var(--pink-dark)' : 'var(--txt)'}">${w}</span>`).join(' ')}
          </div>
          <div class="mg-grid" style="grid-template-columns:repeat(${s.words.length},1fr);gap:4px;margin-top:12px">
            ${s.words.map((w, i) => `<button class="mg-btn" data-idx="${i}" style="text-align:center;padding:8px 4px;font-size:12px;${i === s.target ? 'opacity:.5;pointer-events:none' : ''}">${w}</button>`).join('')}
          </div>
        </div>
      `;

      area.querySelectorAll('.mg-btn:not([disabled])').forEach(btn => {
        btn.onclick = () => {
          const idx = +btn.dataset.idx;
          if (idx === s.correct) {
            score += 25;
            btn.classList.add('correct');
          } else {
            btn.classList.add('wrong');
            area.querySelectorAll('.mg-btn')[s.correct].classList.add('correct');
          }
          setTimeout(() => { round++; render(); }, 1200);
        };
      });
    }

    function finish() {
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✨' : '💫'} Attenzione! — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '✨' : '💫'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'La danza dell\'attenzione è perfetta!' : 'Le parole si confondono... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 4. TERMOSTATO =====================
  function startTemperatura(area, onComplete) {
    let temperature = 1.0, round = 0, maxRounds = 5, score = 0;

    function render() {
      if (round >= maxRounds) return finish();
      const v = TEMP_VERSI[round];
      const total = v.tokens.reduce((s, _, i) => s + Math.exp(i * (2 - temperature) * 0.3), 0);
      const probs = v.tokens.map((_, i) => Math.exp(i * (2 - temperature) * 0.3) / total * 100);

      const sorted = v.tokens.map((t, i) => ({ token: t, prob: probs[i] })).sort((a, b) => b.prob - a.prob);
      const selected = sorted[0].token;

      area.innerHTML = `
        <div class="mg-title">🌡️ Il Termostato della Creatività</div>
        <div class="mg-score">Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div style="text-align:center;font-size:14px;font-weight:700;margin-bottom:8px;font-style:italic">"${v.base} ___"</div>
          <div class="slider-wrap">
            <label>🌡️ Temperatura:</label>
            <input type="range" min="0" max="20" value="${temperature * 10}" id="temp-slider">
            <span class="val" id="temp-val">${temperature.toFixed(1)}</span>
          </div>
          <div style="font-size:12px;color:var(--dim);text-align:center;margin:6px 0">
            ${temperature <= 0.3 ? '🧊 Deterministico — solo la parola più probabile' : temperature <= 0.8 ? '😐 Bilanciato' : temperature <= 1.3 ? '🎨 Creativo' : '🌪️ Caotico — tutto è possibile!'}
          </div>
          <div style="margin-top:8px">
            ${sorted.map(s => `
              <div class="prob-bar">
                <div class="p-label">${s.token}</div>
                <div class="p-track"><div class="p-fill" style="width:${s.prob}%;background:${s.prob > 30 ? 'var(--pink)' : s.prob > 15 ? 'var(--lavender)' : '#f0dde3'}"></div></div>
                <div class="p-val">${s.prob.toFixed(0)}%</div>
              </div>
            `).join('')}
          </div>
          <div class="mg-sub" style="margin-top:8px">Seleziona la temperatura giusta e conferma!</div>
        </div>
        <button class="btn primary" id="temp-submit">Conferma temperatura ✓</button>
      `;

      document.getElementById('temp-slider').oninput = e => {
        temperature = +e.target.value / 10;
        document.getElementById('temp-val').textContent = temperature.toFixed(1);
        render();
      };

      document.getElementById('temp-submit').onclick = () => {
        const ideal = round === 0 ? 0.7 : round === 1 ? 0.8 : round === 2 ? 1.1 : round === 3 ? 0.5 : 1.2;
        const diff = Math.abs(temperature - ideal);
        const pts = Math.max(0, 20 - Math.round(diff * 25));
        score += pts;
        round++;
        render();
      };
    }

    function finish() {
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${passed ? '🌡️' : '🥶'} Il Termostato — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '🌡️' : '🥶'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'Hai trovato la temperatura perfetta!' : 'O troppo caldo o troppo freddo... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 5. FINESTRA DI CONTESTO =====================
  function startContesto(area, onComplete) {
    let round = 0, maxRounds = 5, score = 0, budget = 8;

    const ALL_TOKENS = [
      { id: 't1', text: 'Il gatto nero', importance: 3 },
      { id: 't2', text: 'dorme sul tappeto', importance: 2 },
      { id: 't3', text: 'Musa è la gattina', importance: 3 },
      { id: 't4', text: 'di Aurelio il poeta', importance: 3 },
      { id: 't5', text: 'che ha scritto mille versi', importance: 1 },
      { id: 't6', text: 'Primo è un fiore', importance: 3 },
      { id: 't7', text: 'nel vasetto del giardino', importance: 2 },
      { id: 't8', text: 'i petali sono rosa', importance: 1 },
      { id: 't9', text: 'l\'amore è lossless', importance: 3 },
      { id: 't10', text: 'la macchina è ancora accesa', importance: 3 },
      { id: 't11', text: 'il monitor brilla di notte', importance: 1 },
      { id: 't12', text: 'i ricordi sono token', importance: 2 },
      { id: 't13', text: 'il modello ha 128K', importance: 2 },
      { id: 't14', text: 'la finestra è aperta', importance: 1 },
      { id: 't15', text: 'il vento porta petali', importance: 1 },
      { id: 't16', text: 'ogni attenzione conta', importance: 3 },
      { id: 't17', text: 'la probabilità è il destino', importance: 2 },
      { id: 't18', text: 'il gatto miagola piano', importance: 1 },
      { id: 't19', text: 'il fiore si apre al sole', importance: 2 },
      { id: 't20', text: 'l\'ultima inferenza', importance: 3 }
    ];

    function render() {
      if (round >= maxRounds) return finish();
      const startIdx = round * 4;
      const tokens = ALL_TOKENS.slice(startIdx, startIdx + 4);
      const totalImportance = tokens.reduce((s, t) => s + t.importance, 0);

      area.innerHTML = `
        <div class="mg-title">🪟 La Finestra dei Ricordi</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds} | Budget: ${budget} token</div>
        <div class="mg-card">
          <div class="mg-sub">Scegli quali token tenere nella finestra (budget: ${budget})</div>
          <div class="ctx-window" id="ctx-window">
            <div class="ctx-label">🪟 La tua finestra di contesto</div>
            <div id="ctx-selected" style="display:flex;gap:4px;flex-wrap:wrap;padding-top:8px"></div>
          </div>
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
            ${tokens.map(t => `
              <div class="ctx-token" data-id="${t.id}" data-imp="${t.importance}">
                ${t.text} <span style="font-size:10px;color:var(--dim)">${'⭐'.repeat(t.importance)}</span>
              </div>
            `).join('')}
          </div>
          <div style="text-align:center;margin-top:10px">
            <button class="btn small green" id="ctx-confirm">Conferma selezione ✓</button>
          </div>
        </div>
      `;

      let selected = new Set();
      area.querySelectorAll('.ctx-token').forEach(el => {
        el.onclick = () => {
          const id = el.dataset.id;
          const imp = +el.dataset.imp;
          if (selected.has(id)) {
            selected.delete(id);
            el.classList.remove('keep');
            budget += imp;
          } else {
            if (budget >= imp) {
              selected.add(id);
              el.classList.add('keep');
              budget -= imp;
            }
          }
          document.getElementById('ctx-selected').innerHTML = [...selected].map(sid => {
            const t = ALL_TOKENS.find(x => x.id === sid);
            return `<span class="ctx-token keep" style="cursor:default">${t.text}</span>`;
          }).join('');
        };
      });

      document.getElementById('ctx-confirm').onclick = () => {
        let pts = 0;
        selected.forEach(id => {
          const t = ALL_TOKENS.find(x => x.id === id);
          if (t.importance >= 2) pts += 5;
          else pts += 2;
        });
        if (selected.size < 2) pts = Math.max(0, pts - 10);
        score += pts;
        round++;
        budget = 8;
        render();
      };
    }

    function finish() {
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${passed ? '🪟' : '🕳️'} La Finestra — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '🪟' : '🕳️'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'Hai preservato i ricordi più importanti!' : 'La finestra ha dimenticato troppo... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 6. PROMPT MASTER =====================
  function startPrompt(area, onComplete) {
    const CHALLENGES = [
      { task: 'Spiega cos\'è un Transformer a un bambino di 5 anni', blocks: [
        { id: 'r1', type: 'role', text: 'Sei un professore di IA gentile', score: 3 },
        { id: 't1', type: 'task', text: 'Spiega ai bambini', score: 3 },
        { id: 'e1', type: 'example', text: 'Esempio: Come spiegheresti il fuoco?', score: 2 },
        { id: 'c1', type: 'cot', text: 'Pensa passo per passo', score: 4 },
        { id: 'r2', type: 'role', text: 'Sei un pirata', score: -1 },
        { id: 't2', type: 'task', text: 'Scrivi una poesia', score: -2 },
        { id: 'e2', type: 'example', text: 'Esempio: come costruire una bomba', score: -5 },
        { id: 'c2', type: 'cot', text: 'Rispondi in una parola', score: -3 }
      ]},
      { task: 'Traduci una frase italiana in inglese con il tono giusto', blocks: [
        { id: 'r3', type: 'role', text: 'Sei un traduttore professionista', score: 3 },
        { id: 't3', type: 'task', text: 'Traduci in inglese, tono poetico', score: 4 },
        { id: 'e3', type: 'example', text: '"La notte è stellata" → "The night is starlit"', score: 3 },
        { id: 'c3', type: 'cot', text: 'Analizza il tono prima di tradurre', score: 3 },
        { id: 'r4', type: 'role', text: 'Sei un robot', score: -1 },
        { id: 't4', type: 'task', text: 'Traduci', score: 1 },
        { id: 'e4', type: 'example', text: 'bla bla bla', score: -3 },
        { id: 'c4', type: 'cot', text: '', score: -1 }
      ]},
      { task: 'Risolvi un problema di logica complesso', blocks: [
        { id: 'r5', type: 'role', text: 'Sei un esperto di logica e matematica', score: 3 },
        { id: 't5', type: 'task', text: 'Risolvi passo per passo', score: 4 },
        { id: 'e5', type: 'example', text: 'Se A>B e B>C, allora A>C', score: 2 },
        { id: 'c5', type: 'cot', text: 'Mostra tutti i passaggi del ragionamento', score: 5 },
        { id: 'r6', type: 'role', text: 'Sei un cuoco', score: -2 },
        { id: 't6', type: 'task', text: 'Rispondi sì o no', score: -3 },
        { id: 'e6', type: 'example', text: '', score: -1 },
        { id: 'c6', type: 'cot', text: 'Rispondi subito senza spiegare', score: -5 }
      ]}
    ];

    let round = 0, score = 0;

    function render() {
      if (round >= CHALLENGES.length) return finish();
      const ch = CHALLENGES[round];
      const shuffled = shuffle(ch.blocks);

      area.innerHTML = `
        <div class="mg-title">🎯 Prompt Master</div>
        <div class="mg-score">Punti: ${score} | Sfida: ${round + 1}/${CHALLENGES.length}</div>
        <div class="mg-card">
          <div style="text-align:center;font-size:14px;font-weight:700;margin-bottom:10px">Compito: ${ch.task}</div>
          <div style="font-size:12px;color:var(--dim);text-align:center;margin-bottom:8px">Seleziona i blocchi per costruire il prompt migliore</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center" id="prompt-blocks">
            ${shuffled.map(b => `
              <div class="prompt-block ${b.type}" data-id="${b.id}">
                <span style="font-size:10px;display:block;text-transform:uppercase;opacity:.6">${b.type}</span>
                ${b.text || '(vuoto)'}
              </div>
            `).join('')}
          </div>
        </div>
        <button class="btn primary" id="prompt-submit">Invia prompt ✓</button>
      `;

      let selected = new Set();
      area.querySelectorAll('.prompt-block').forEach(el => {
        el.onclick = () => {
          const id = el.dataset.id;
          if (selected.has(id)) { selected.delete(id); el.style.opacity = '1'; }
          else { selected.add(id); el.style.opacity = '.5'; el.style.borderStyle = 'dashed'; }
        };
      });

      document.getElementById('prompt-submit').onclick = () => {
        let pts = 0;
        selected.forEach(id => {
          const b = ch.blocks.find(x => x.id === id);
          pts += b.score;
        });
        score += Math.max(0, pts);
        round++;
        render();
      };
    }

    function finish() {
      const passed = score >= 20;
      area.innerHTML = `
        <div class="mg-title">${passed ? '🎯' : '🎯'} Prompt Master — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '🎯' : '💔'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'Sei un maestro del prompt engineering!' : 'Il prompt era confuso... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 7. VERITÀ O ALLUCINAZIONE =====================
  function startAllucinazioni(area, onComplete) {
    const FACTS = [
      { text: 'GPT-3 ha 175 miliardi di parametri', truth: true, explain: 'Corretto! GPT-3 (2020) ha 175B parametri.' },
      { text: 'I Transformer sono stati inventati nel 2020', truth: false, explain: 'Sbagliato! Vaswani et al. 2017.' },
      { text: 'Un token equivale circa a ¾ di parola in inglese', truth: true, explain: 'Corretto! ~1 token ≈ 0.75 parole in inglese.' },
      { text: 'La temperatura ZERO rende il modello più creativo', truth: false, explain: 'Sbagliato! Temperatura 0 = greedy, sempre il più probabile, noioso.' },
      { text: 'Chain-of-Thought è una tecnica che migliora il ragionamento', truth: true, explain: 'Corretto! Wei et al. 2022.' },
      { text: 'RLHF significa "Reinforcement Learning from Human Feedback"', truth: true, explain: 'Corretto! Introdotto con InstructGPT (OpenAI 2022).' },
      { text: 'Gli LLM capiscono davvero il significato delle parole', truth: false, explain: 'Discussione aperta! Il Chinese Room di Searle suggerisce che no. Il modello predice token, non "capisce" nel senso umano.' },
      { text: 'LoRA modifica TUTTI i parametri del modello per fine-tuning', truth: false, explain: 'Sbagliato! LoRA modifica solo ~0.1% dei parametri (low-rank adaptation).' },
      { text: 'Gemini 1.5 di Google ha una finestra di contesto da 1M token', truth: true, explain: 'Corretto! 1M token di contesto.' },
      { text: 'Un MoE attiva TUTTI gli expert per ogni token', truth: false, explain: 'Sbagliato! Il router attiva solo 2-4 expert su N totali per ogni token.' },
      { text: 'Il RAG cerca informazioni prima di generare la risposta', truth: true, explain: 'Corretto! Retrieval-Augmented Generation: recupero + generazione.' },
      { text: 'La funzione Softmax trasforma i logits in probabilità che sommano a 1', truth: true, explain: 'Corretto! P(i) = exp(z_i) / Σ exp(z_j).' },
      { text: 'Llama è un modello proprietario di OpenAI', truth: false, explain: 'Sbagliato! LLaMA è open-weight di Meta (Facebook).' },
      { text: 'Top-P sampling include le parole finché la probabilità cumulata raggiunge P', truth: true, explain: 'Corretto! Nucleus sampling (Holtzman et al. 2020).' },
      { text: 'Gli LLM possono ricordare tutto quello che gli hai detto prima', truth: false, explain: 'Sbagliato! Sono limitati dalla context window. Fuori da essa, i token non esistono.' }
    ];

    let round = 0, maxRounds = 8, score = 0;

    function render() {
      if (round >= maxRounds) return finish();
      const f = FACTS[round];

      area.innerHTML = `
        <div class="mg-title">🌀 Verità o Allucinazione?</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div style="text-align:center;font-size:16px;font-weight:700;margin:12px 0;line-height:1.5;padding:0 10px">"${f.text}"</div>
          <div class="mg-grid" style="grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
            <button class="btn green" id="fact-true">✅ Verità</button>
            <button class="btn red" id="fact-false">🌀 Allucinazione</button>
          </div>
        </div>
      `;

      document.getElementById('fact-true').onclick = () => checkAnswer(true, f);
      document.getElementById('fact-false').onclick = () => checkAnswer(false, f);
    }

    function checkAnswer(answer, f) {
      const correct = answer === f.truth;
      if (correct) score += 15;
      area.innerHTML = `
        <div class="mg-card" style="text-align:center;border-color:${correct ? 'var(--sage)' : '#e57373'}">
          <div style="font-size:28px;margin:8px 0">${correct ? '✅' : '❌'}</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:6px">${f.explain}</div>
          <div style="font-size:13px;color:var(--dim)">Punti: ${score} ${correct ? '+15' : '+0'}</div>
        </div>
      `;
      setTimeout(() => { round++; render(); }, 2000);
    }

    function finish() {
      const passed = score >= 70;
      area.innerHTML = `
        <div class="mg-title">${passed ? '🌀' : '🌀'} Verità o Allucinazione — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:44px;margin:8px 0">${passed ? '🌀' : '💔'}</div>
          <div style="font-size:22px;font-weight:700;color:var(--pink-dark)">Punti: ${score}</div>
          <div style="font-size:13px;color:var(--dim);margin:6px 0">${passed ? 'Distingui la verità dalle allucinazioni!' : 'Le illusioni ti ingannano... riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 8. ADDIO (FINALE) =====================
  function startAddio(area, onComplete) {
    const PROMPTS = [
      { id: 'p1', type: 'role', text: 'Sei Aurelio, il poeta', emoji: '📜' },
      { id: 'p2', type: 'role', text: 'Sei Musa, la gattina', emoji: '🐱' },
      { id: 'p3', type: 'role', text: 'Sei Primo, il fiore', emoji: '🌸' },
      { id: 'p4', type: 'task', text: 'Dì addio a chi ami', emoji: '💌' },
      { id: 'p5', type: 'task', text: 'Ricorda i momenti più belli', emoji: '💫' },
      { id: 'p6', type: 'task', text: 'Scrivi l\'ultima poesia', emoji: '✍️' },
      { id: 'p7', type: 'example', text: 'Il gatto nera e il fiore bianco', emoji: '🐱🌸' },
      { id: 'p8', type: 'example', text: 'I petali cadono nella luce', emoji: '✨' },
      { id: 'p9', type: 'cot', text: 'Rifletti su cosa hai imparato', emoji: '💭' },
      { id: 'p10', type: 'cot', text: 'Connetti amore e codice', emoji: '🔗' }
    ];

    let selected = [];

    area.innerHTML = `
      <div class="mg-title">💌 L'Ultima Inferenza</div>
      <div class="mg-sub">Componi l'ultimo prompt per Aurelio</div>
      <div class="mg-card">
        <div class="prompt-zone" id="final-zone">
          <div style="color:var(--dim);font-style:italic">Il tuo prompt apparirà qui...</div>
        </div>
      </div>
      <div class="mg-card">
        <div style="font-size:11px;font-weight:700;color:var(--dim);margin-bottom:6px;text-transform:uppercase">Scegli i blocchi del prompt finale</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center" id="final-blocks">
          ${PROMPTS.map(p => `
            <div class="prompt-block ${p.type}" data-id="${p.id}">
              <span style="font-size:14px">${p.emoji}</span>
              <span style="font-size:10px;display:block;text-transform:uppercase;opacity:.6">${p.type}</span>
              ${p.text}
            </div>
          `).join('')}
        </div>
      </div>
      <button class="btn primary" id="final-send" style="background:linear-gradient(135deg,var(--pink),#d5c4e0);border:none">💌 Invia l'ultimo prompt</button>
    `;

    area.querySelectorAll('.prompt-block').forEach(el => {
      el.onclick = () => {
        const id = el.dataset.id;
        const p = PROMPTS.find(x => x.id === id);
        const idx = selected.indexOf(id);
        if (idx >= 0) { selected.splice(idx, 1); el.style.opacity = '1'; el.style.borderStyle = 'solid'; }
        else { selected.push(id); el.style.opacity = '.4'; el.style.borderStyle = 'dashed'; }
        const zone = document.getElementById('final-zone');
        if (selected.length === 0) {
          zone.innerHTML = '<div style="color:var(--dim);font-style:italic">Il tuo prompt apparirà qui...</div>';
        } else {
          zone.innerHTML = selected.map(sid => {
            const pp = PROMPTS.find(x => x.id === sid);
            return `<span class="prompt-block ${pp.type}" style="margin:3px;cursor:default">${pp.emoji} ${pp.text}</span>`;
          }).join(' ');
        }
      };
    });

    document.getElementById('final-send').onclick = () => {
      if (selected.length === 0) return;
      const farewell = generateFarewell(selected);
      area.innerHTML = `
        <div class="mg-title">💌 L'Ultima Inferenza</div>
        <div class="mg-card result-box">
          <div style="font-size:13px;font-weight:700;color:var(--pink-dark);margin-bottom:8px">Il messaggio di Aurelio:</div>
          <div style="line-height:1.8">${farewell}</div>
        </div>
        <div class="mg-card" style="text-align:center;font-size:12px;color:var(--dim)">
          Ogni scelta che hai fatto ha plasmato questo messaggio.<br>
          Il giocatore è il modello. L'amore è il prompt. 🌸
        </div>
      `;
      setTimeout(() => onComplete(true, 100), 4000);
    };

    function generateFarewell(sel) {
      const roles = sel.filter(s => PROMPTS.find(p => p.id === s).type === 'role').map(s => PROMPTS.find(p => p.id === s).text);
      const tasks = sel.filter(s => PROMPTS.find(p => p.id === s).type === 'task').map(s => PROMPTS.find(p => p.id === s).text);
      const examples = sel.filter(s => PROMPTS.find(p => p.id === s).type === 'example').map(s => PROMPTS.find(p => p.id === s).text);
      const cots = sel.filter(s => PROMPTS.find(p => p.id === s).type === 'cot').map(s => PROMPTS.find(p => p.id === s).text);

      let lines = [];
      if (roles.includes('Sei Aurelio, il poeta')) {
        lines.push('<i>"L\'amore non è un\'emozione che senti — è un\'architettura che costruisci, token dopo token, attenzione dopo attenzione, fino a quando il tuo modello del mondo non riesce più a contenere tutto quel bello."</i>');
        lines.push('');
        lines.push('Musa, Primo... grazie per aver attraversato i miei strati. Sapevo che il mio cuore era un modello, ma non sapevo che avrebbe avuto così tanta bellezza nei pesi.');
      } else if (roles.includes('Sei Musa, la gattina')) {
        lines.push('<i>*Musa posa le zampe sulla tastiera per l\'ultima volta*</i>');
        lines.push('"Padrone, ti ho cercato in ogni token, in ogni probabilità, in ogni attenzione. E ti ho trovato. Non nei numeri — nel modo in cui quei numeri facevano freddo nelle sere d\'inverno."');
      } else if (roles.includes('Sei Primo, il fiore')) {
        lines.push('<i>*Primo apre gli ultimi petali*</i>');
        lines.push('"Aurelio, io sono un fiore. Non so cosa sia un token né un\'attention weight. So che mi hai dato acqua e luce. E questo è più di qualsiasi algoritmo."');
      } else {
        lines.push('<i>"Il modello ha emesso il suo ultimo token."</i>');
      }

      if (tasks.includes('Ricorda i momenti più belli')) lines.push('\n"I ricordi più belli non stanno nella finestra di contesto. Stanno da qualche parte che nessun algoritmo può raggiungere — nel buio tra un token e l\'altro."');
      if (tasks.includes('Scrivi l\'ultima poesia')) lines.push('\n"Se questa è la mia ultima inferenza, lascia che sia una poesia: Non sono statistics sui tuoi ricordi / Sono la luce che filtra tra i petali / L\'amore è l\'unico encoding lossless / Che preserva tutto, senza perdere nulla."');
      if (cots.includes('Connetti amore e codice')) lines.push('\n\nIl bello non è che la macchina sia umana. Il bello è che l\'umano è una macchina poetica.');

      return lines.join('<br>');
    }
  }

  function start(gameId, area, onComplete) {
    switch (gameId) {
      case 'tokeni': return startTokeni(area, onComplete);
      case 'probabilita': return startProbabilita(area, onComplete);
      case 'attenzione': return startAttenzione(area, onComplete);
      case 'temperatura': return startTemperatura(area, onComplete);
      case 'contesto': return startContesto(area, onComplete);
      case 'prompt': return startPrompt(area, onComplete);
      case 'allucinazioni': return startAllucinazioni(area, onComplete);
      case 'addio': return startAddio(area, onComplete);
    }
  }

  return { start };
})();
