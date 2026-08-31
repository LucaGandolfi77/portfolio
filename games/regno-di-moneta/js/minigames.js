// minigames.js — 6 minigiochi educativi
window.MiniGames = (() => {
  const COINS = [
    { val: 1,   label: '€1',   cls: '' },
    { val: 2,   label: '€2',   cls: '' },
    { val: 5,   label: '€5',   cls: '' },
    { val: 10,  label: '€10',  cls: '' },
    { val: 20,  label: '€20',  cls: '' },
    { val: 50,  label: '€50',  cls: '' },
    { val: 100, label: '€100', cls: 'b200' },
    { val: 200, label: '€200', cls: 'b200' },
    { val: 500, label: '€500', cls: 'b500' }
  ];

  const CUSTOMERS = [
    { name: 'Nonna Rosa', emoji: '👵', items: ['Pane €3', 'Marmellata €4'] },
    { name: 'Babbo Marco', emoji: '👨', items: ['Latte €2', 'Biscotti €3'] },
    { name: 'Fanciulla', emoji: '👧', items: ['Fiori €5', 'Cioccolata €7'] },
    { name: 'Contadino', emoji: '🧑‍🌾', items: ['Verdure €6', 'Frutta €4'] },
    { name: 'Mercante', emoji: '🧑‍💻', items: ['Stoffa €8', 'Filo €2'] },
    { name: 'Vagabondo', emoji: '🧔', items: ['Pasta €1', 'Olio €3'] }
  ];

  const MARKET_ITEMS = [
    { id: 'mele', name: 'Mele', emoji: '🍎', basePrice: 5 },
    { id: 'pane', name: 'Pane', emoji: '🍞', basePrice: 8 },
    { id: 'tessuti', name: 'Tessuti', emoji: '🧵', basePrice: 15 },
    { id: 'oro', name: 'Oro', emoji: '🥇', basePrice: 50 },
    { id: 'gemme', name: 'Gemme', emoji: '💎', basePrice: 80 }
  ];

  const QUIZ_QUESTIONS = [
    { q: 'Cosa succede se spendi più di quanto guadagni?', a: ['Perdi risparmi', 'Diventi ricco', 'Niente', 'Paghi meno tasse'], c: 0 },
    { q: 'L\'interesse composto è:', a: ['Interesse su interessi', 'Interesse fisso', 'Una tassa', 'Un debito'], c: 0 },
    { q: 'Diversificare significa:', a: ['Mettere tutto insieme', 'Spargere i rischi', 'Rischiare di più', 'Spendere tutto'], c: 1 },
    { q: 'L\'inflazione fa:', a: ['Crescere i prezzi', 'Abbassare i prezzi', 'Non cambia nulla', 'Aumenta i risparmi'], c: 0 },
    { q: 'Un debito con tasso alto è:', a: ['Un investimento', 'Pericoloso', 'Conveniente', 'Obbligatorio'], c: 1 },
    { q: 'Il budget serve a:', a: ['Spendere di più', 'Pianificare le spese', 'Guadagnare di meno', 'Pagare tasse'], c: 1 },
    { q: 'Se compri a €10 e vendi a €15, il guadagno è:', a: ['€5', '€15', '€10', '€25'], c: 0 },
    { q: 'Cosa è un risparmio?', a: ['Una spesa', 'La differenza tra entrate e uscite', 'Un prestito', 'Un debito'], c: 1 },
    { q: 'Per investire bene devi:', a: ['Rischiarla tutta', 'Diversificare', 'Mettere tutto in oro', 'Non risparmiare'], c: 1 },
    { q: 'L\'interesse al 10% su €100 dopo 2 anni (composto) fa:', a: ['€121', '€120', '€110', '€130'], c: 0 },
    { q: 'Cosa fa un inflazionista?', a: ['Sale i prezzi', 'Abbassa i valori', 'Stampa moneta', 'Tutte le precedenti'], c: 3 },
    { q: 'Quale è un investimento sicuro?', a: ['Criptovalute', 'Mattone casa', 'Slot machine', 'Scommesse'], c: 1 },
    { q: 'Un Mutuo è:', a: ['Un regalo', 'Un debito per la casa', 'Un investimento azionario', 'Una tassa'], c: 1 },
    { q: 'Perché l\'inflazione è cattiva?', a: ['Aumenta i prezzi, diminuisce il potere d\'acquisto', 'Aumenta i risparmi', 'Rende i soldi più forti', 'Non fa niente'], c: 0 },
    { q: 'La regola d\'oro del risparmio:', a: ['Spendi tutto', 'Risparmia almeno il 10% delle entrate', 'Non risparmiare', 'Investi in cripto'], c: 1 },
    { q: 'Cosa succede con l\'interesse composto nel tempo?', a: ['Cresce esponenzialmente', 'Resta uguale', 'Diminuisce', 'Nasce un albero'], c: 0 },
    { q: 'L\'usuraio ti fa:', a: ['Un favore', 'Un prestito a tasso altissimo', 'Un regalo', 'Una donazione'], c: 1 },
    { q: 'Se hai €200 e li dividi in 3 investimenti, stai:', a: ['Rischiano troppo', 'Diversificando', 'Spreccando', 'Risparmiando male'], c: 1 },
    { q: 'Il potere d\'acquisto è:', a: ['Quanto puoi comprare con i soldi', 'Quanto pesano le monete', 'Quanti soldi hai', 'Il peso del drago'], c: 0 },
    { q: 'La melhores strategia finanziaria è:', a: ['Tutto in una cosa', 'Pianificare e diversificare', 'Spendere tutto subito', 'Nascondere i soldi'], c: 1 }
  ];

  function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ===================== 1. BANCO DI LIA =====================
  function startBanco(area, onComplete) {
    let score = 0, round = 0, maxRounds = 8, timer, timeLeft = 12;

    function render() {
      if (round >= maxRounds) return finish();
      const cust = pickRandom(CUSTOMERS);
      const prices = cust.items.map(i => parseInt(i.match(/€(\d+)/)[1]));
      const total = prices.reduce((a, b) => a + b, 0);
      const paymentOptions = [total, total + 5, total + 10, total + 20].filter(p => p <= 500);
      const payment = paymentOptions[Math.floor(Math.random() * paymentOptions.length)];
      const change = payment - total;
      timeLeft = 14 - round;

      area.innerHTML = `
        <div class="mg-title">🏦 Banco di Lia</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div style="text-align:center;font-size:36px;margin:8px 0">${cust.emoji}</div>
          <div style="text-align:center;font-weight:700;margin-bottom:6px">${cust.name}</div>
          <div style="text-align:center;font-size:14px;color:#555">${cust.items.join(' + ')}</div>
          <div style="text-align:center;font-size:18px;font-weight:800;color:var(--gold);margin:8px 0">TOTALE: €${total}</div>
          <div style="text-align:center;font-size:13px;color:var(--dim)">Paga con: <b style="color:var(--green)">€${payment}</b></div>
          <div style="text-align:center;margin:4px 0;color:var(--dim);font-size:12px">Resto da dare: <b id="change-amount">???</b></div>
        </div>
        <div class="mg-card">
          <div style="font-size:11px;font-weight:700;color:var(--dim);margin-bottom:6px;text-transform:uppercase">Seleziona le monete per il resto (€${change}):</div>
          <div class="coin-row" id="coin-row"></div>
          <div style="display:flex;gap:8px;margin-top:8px;justify-content:center;flex-wrap:wrap">
            <div style="font-size:13px;font-weight:700">Selezionato: <span id="sel-total">€0</span></div>
            <button class="btn small green" id="btn-confirm">Conferma ✓</button>
            <button class="btn small ghost" id="btn-reset">Reset ↺</button>
          </div>
        </div>
        <div class="mg-timer" id="mg-timer">${timeLeft}s</div>
      `;

      const coinRow = document.getElementById('coin-row');
      let selected = [];
      const available = COINS.filter(c => c.val <= payment);

      available.forEach(c => {
        const el = document.createElement('div');
        el.className = 'coin ' + c.cls;
        el.textContent = c.label;
        el.onclick = () => {
          const idx = selected.indexOf(c.val);
          if (idx >= 0) { selected.splice(idx, 1); el.classList.remove('selected'); }
          else { selected.push(c.val); el.classList.add('selected'); }
          document.getElementById('sel-total').textContent = '€' + selected.reduce((a, b) => a + b, 0);
        };
        coinRow.appendChild(el);
      });

      document.getElementById('btn-confirm').onclick = () => {
        const totalSel = selected.reduce((a, b) => a + b, 0);
        if (totalSel === change) {
          score += 10 + timeLeft;
          area.querySelectorAll('.mg-card')[1].style.borderColor = 'var(--green)';
          setTimeout(() => { round++; render(); }, 600);
        } else {
          area.querySelectorAll('.mg-card')[1].style.borderColor = 'var(--red)';
          selected = [];
          coinRow.querySelectorAll('.coin').forEach(c => c.classList.remove('selected'));
          document.getElementById('sel-total').textContent = '€0';
        }
      };

      document.getElementById('btn-reset').onclick = () => {
        selected = [];
        coinRow.querySelectorAll('.coin').forEach(c => c.classList.remove('selected'));
        document.getElementById('sel-total').textContent = '€0';
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
      const passed = score >= 60;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Banco di Lia — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '🏆' : '😢'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">Punti: ${score}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Ottimo lavoro! Hai servito bene i clienti!' : 'Ci vuole più pratica! Riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }

    render();
  }

  // ===================== 2. MERCATO =====================
  function startMercato(area, onComplete) {
    let money = 100, inventory = {}, round = 0, maxRounds = 10;
    const prices = {};
    MARKET_ITEMS.forEach(i => prices[i.id] = i.basePrice);

    function fluctuate() {
      MARKET_ITEMS.forEach(i => {
        const change = (Math.random() - 0.5) * i.basePrice * 0.6;
        prices[i.id] = Math.max(2, Math.round(prices[i.id] + change));
      });
    }

    function render() {
      if (round >= maxRounds) return finish();
      fluctuate();
      const invStr = Object.entries(inventory).map(([k, v]) => {
        const item = MARKET_ITEMS.find(i => i.id === k);
        return v > 0 ? `${item.emoji}×${v}` : '';
      }).filter(Boolean).join(' ') || 'Vuoto';

      let itemsHtml = '';
      MARKET_ITEMS.forEach(item => {
        const p = prices[item.id];
        const trend = p > item.basePrice ? 'high' : p < item.basePrice ? 'low' : '';
        const stock = inventory[item.id] || 0;
        itemsHtml += `
          <div class="market-row">
            <div class="item-icon">${item.emoji}</div>
            <div class="item-name">${item.name}${stock > 0 ? `<div class="item-stock">Possiedi: ${stock}</div>` : ''}</div>
            <div class="item-price ${trend}">€${p}</div>
            <div style="display:flex;gap:4px">
              <button class="btn small" onclick="window._mktBuy('${item.id}')">Acquista</button>
              <button class="btn small green" onclick="window._mktSell('${item.id}')" ${stock <= 0 ? 'disabled' : ''}>Vendi</button>
            </div>
          </div>`;
      });

      area.innerHTML = `
        <div class="mg-title">🏪 Contrattazione</div>
        <div class="mg-score">💰 €${money} | Round: ${round + 1}/${maxRounds} | Oggetti: ${invStr}</div>
        <div class="mg-card"><div style="font-size:13px;color:var(--dim);text-align:center;margin-bottom:6px">Compra basso, vendi alto! Obiettivo: €${money + 80}</div>${itemsHtml}</div>
        <div style="text-align:center"><button class="btn primary" id="btn-next-round">Prossimo giorno →</button></div>
      `;

      document.getElementById('btn-next-round').onclick = () => { round++; render(); };
    }

    window._mktBuy = (id) => {
      const p = prices[id];
      if (money >= p) {
        money -= p;
        inventory[id] = (inventory[id] || 0) + 1;
        render();
      }
    };
    window._mktSell = (id) => {
      if (inventory[id] > 0) {
        money += prices[id];
        inventory[id]--;
        render();
      }
    };

    function finish() {
      const totalVal = money + Object.entries(inventory).reduce((s, [k, v]) => {
        const item = MARKET_ITEMS.find(i => i.id === k);
        return s + (item ? item.basePrice * v : 0);
      }, 0);
      const passed = totalVal >= 180;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Mercato — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '📈' : '📉'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">Valore totale: €${totalVal}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Hai fatto buoni affari!' : 'Il mercato ti ha fregato! Riprova!'}</div>
        </div>
      `;
      delete window._mktBuy;
      delete window._mktSell;
      setTimeout(() => onComplete(passed, totalVal), 1500);
    }

    render();
  }

  // ===================== 3. ALBERO (COMPOUND INTEREST) =====================
  function startAlbero(area, onComplete) {
    let invested = 100, rate = 10, years = 10;

    function calcTree(h, r, y) {
      let vals = [h];
      for (let i = 1; i <= y; i++) vals.push(Math.round(vals[i - 1] * (1 + r / 100)));
      return vals;
    }

    function render() {
      const values = calcTree(invested, rate, years);
      const finalVal = values[values.length - 1];
      const simpleVal = invested + (invested * rate / 100 * years);
      const gain = finalVal - invested;
      const simpleGain = simpleVal - invested;

      let fruits = '';
      const treeH = Math.min(160, 40 + (finalVal / invested - 1) * 30);
      for (let i = 0; i < Math.min(values.length, 12); i++) {
        const x = 30 + Math.sin(i * 0.8) * 35;
        const y = 30 + (i / values.length) * treeH;
        const size = 20 + (i / values.length) * 10;
        fruits += `<div class="tree-fruit" style="left:${x}%;top:${y}px;width:${size}px;height:${size}px;font-size:${size * 0.6}px;background:${i === values.length - 1 ? '#FFD700' : '#FF8A65'}">🪙</div>`;
      }

      area.innerHTML = `
        <div class="mg-title">🌳 Il Salvadanaio Magico</div>
        <div class="mg-card">
          <div class="tree-wrap">
            <div class="tree-trunk" style="height:${treeH + 20}px"></div>
            ${fruits}
          </div>
          <div class="tree-controls">
            <label>💰 Investi: <span class="val">€${invested}</span></label>
            <input type="range" min="10" max="500" step="10" value="${invested}" id="tr-invest">
          </div>
          <div class="tree-controls">
            <label>📈 Tasso: <span class="val">${rate}%</span></label>
            <input type="range" min="1" max="30" value="${rate}" id="tr-rate">
          </div>
          <div class="tree-controls">
            <label>📅 Anni: <span class="val">${years}</span></label>
            <input type="range" min="1" max="30" value="${years}" id="tr-years">
          </div>
          <div class="tree-result">
            <div>💰 Investito: <b>€${invested}</b> → Dopo ${years} anni: <b style="color:var(--green-dark)">€${finalVal}</b></div>
            <div style="font-size:12px;color:var(--dim);margin-top:4px">
              Interesse composto: +€${gain} 🌳 | Interesse semplice: +€${simpleGain} 📊
            </div>
            <div style="font-size:12px;color:var(--gold);margin-top:4px">
              L'albero composto fa guadagnare €${gain - simpleGain} in più! ✨
            </div>
          </div>
        </div>
        <button class="btn primary" id="btn-albero-ok">Ho capito! Continua →</button>
      `;

      document.getElementById('tr-invest').oninput = e => { invested = +e.target.value; render(); };
      document.getElementById('tr-rate').oninput = e => { rate = +e.target.value; render(); };
      document.getElementById('tr-years').oninput = e => { years = +e.target.value; render(); };
      document.getElementById('btn-albero-ok').onclick = () => onComplete(true, gain);
    }

    render();
  }

  // ===================== 4. RUNNER =====================
  function startRunner(area, onComplete) {
    let running = false, hp = 3, score = 0, speed = 3, frame, obstacles = [], collectibles = [];
    const W = 400;

    function render() {
      area.innerHTML = `
        <div class="mg-title">⛓️ Schiva le Cambiali</div>
        <div class="mg-card">
          <div class="runner-wrap" id="runner-field">
            <div class="runner-hp" id="r-hp">❤️ ×${hp}</div>
            <div class="runner-score" id="r-score">💰 €${score}</div>
            <div class="runner-char" id="r-char" style="left:20px">🧑‍🌾</div>
          </div>
          <button class="runner-jump" id="r-jump">⬆️ SALTA</button>
        </div>
        <div class="mg-sub">Tocca SALTA per schivare i debiti e raccogliere monete!</div>
      `;

      const field = document.getElementById('runner-field');
      const char = document.getElementById('r-char');
      const jumpBtn = document.getElementById('r-jump');
      let charY = 0, jumping = false, jumpTimer;

      function jump() {
        if (jumping) return;
        jumping = true;
        charY = -50;
        char.style.bottom = (30 + charY) + 'px';
        jumpTimer = setTimeout(() => {
          charY = 0;
          char.style.bottom = '30px';
          jumping = false;
        }, 400);
      }

      jumpBtn.onclick = jump;
      document.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });

      running = true;
      let spawnTimer = 0;

      function tick() {
        if (!running) return;
        spawnTimer++;
        if (spawnTimer > 50 - speed * 3) {
          spawnTimer = 0;
          if (Math.random() < 0.4) {
            obstacles.push({ x: W, y: 30, el: null });
          } else {
            collectibles.push({ x: W, y: 50 + Math.random() * 30, el: null });
          }
        }

        obstacles.forEach(o => {
          o.x -= speed;
          if (!o.el) {
            o.el = document.createElement('div');
            o.el.className = 'runner-obj';
            o.el.textContent = '📄';
            o.el.style.filter = 'hue-rotate(0deg) saturate(3)';
            field.appendChild(o.el);
          }
          o.el.style.left = o.x + 'px';

          if (o.x < 50 && o.x > 20 && charY === 0) {
            hp--;
            o.x = -100;
            const hpEl = document.getElementById('r-hp');
            if (hpEl) hpEl.textContent = '❤️ ×' + hp;
            if (hp <= 0) { running = false; finish(); return; }
          }
          if (o.x < -30) { o.el.remove(); }
        });

        collectibles.forEach(c => {
          c.x -= speed;
          if (!c.el) {
            c.el = document.createElement('div');
            c.el.className = 'runner-obj';
            c.el.textContent = '🪙';
            field.appendChild(c.el);
          }
          c.el.style.left = c.x + 'px';

          if (c.x < 50 && c.x > 20 && charY === 0) {
            score += 5;
            c.x = -100;
            const sEl = document.getElementById('r-score');
            if (sEl) sEl.textContent = '💰 €' + score;
          }
          if (c.x < -30) { c.el.remove(); }
        });

        obstacles = obstacles.filter(o => o.x > -50);
        collectibles = collectibles.filter(c => c.x > -50);
        if (speed < 8 && score % 20 === 0 && score > 0) speed += 0.2;
        frame = requestAnimationFrame(tick);
      }

      tick();
    }

    function finish() {
      cancelAnimationFrame(frame);
      const passed = score >= 40;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Schiva le Cambiali — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '🏃' : '💸'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">€${score}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Bravo! Hai evitato i debiti!' : 'I debiti ti hanno preso! Riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }

    render();
  }

  // ===================== 5. TRE CESTI =====================
  function startCesti(area, onComplete) {
    const baskets = [
      { name: 'Sicuro', emoji: '🏦', icon: '🏠', desc: 'Basso rischio, basso rendimento', risk: 0.1, returnRange: [0.02, 0.08] },
      { name: 'Equilibrato', emoji: '⚖️', icon: '🏢', desc: 'Rischio medio, rendimento medio', risk: 0.3, returnRange: [-0.05, 0.15] },
      { name: 'Audace', emoji: '🚀', icon: '🎰', desc: 'Alto rischio, alto rendimento', risk: 0.5, returnRange: [-0.15, 0.30] }
    ];

    let money = 100, round = 0, maxRounds = 10, allocation = [33, 33, 34];

    function render() {
      if (round >= maxRounds) return finish();
      const totalAlloc = allocation[0] + allocation[1] + allocation[2];
      const colors = ['#4CAF50', '#FF9500', '#E53935'];
      const barHtml = allocation.map((a, i) => `<div style="width:${a / totalAlloc * 100}%;background:${colors[i]}"></div>`).join('');

      let basksHtml = '';
      baskets.forEach((b, i) => {
        basksHtml += `
          <div class="basket ${allocation[i] > 0 ? 'selected' : ''}" onclick="window._cestiAlloc(${i})">
            <div class="b-icon">${b.emoji}</div>
            <div class="b-name">${b.name}</div>
            <div class="b-desc">${b.desc}</div>
            <div class="b-alloc">${allocation[i]}%</div>
          </div>`;
      });

      area.innerHTML = `
        <div class="mg-title">🧺 Tre Cesti</div>
        <div class="mg-score">💰 €${money} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div class="mg-sub">Alloca i tuoi soldi tra i tre cesti</div>
          <div class="basket-row">${basksHtml}</div>
          <div class="allocation-bar">${barHtml}</div>
          <div style="text-align:center;margin-top:8px">
            <button class="btn small" onclick="window._cestiAdj(0,-10)">🏦 −</button>
            <button class="btn small" onclick="window._cestiAdj(0,10)">🏦 +</button>
            <button class="btn small" onclick="window._cestiAdj(1,-10)">⚖️ −</button>
            <button class="btn small" onclick="window._cestiAdj(1,10)">⚖️ +</button>
            <button class="btn small" onclick="window._cestiAdj(2,-10)">🚀 −</button>
            <button class="btn small" onclick="window._cestiAdj(2,10)">🚀 +</button>
          </div>
        </div>
        <button class="btn primary" id="cesti-go">Investi! →</button>
      `;

      document.getElementById('cesti-go').onclick = investRound;
    }

    window._cestiAdj = (idx, delta) => {
      allocation[idx] = Math.max(0, Math.min(100, allocation[idx] + delta));
      const total = allocation[0] + allocation[1] + allocation[2];
      if (total === 0) allocation[idx] -= delta;
      render();
    };

    window._cestiAlloc = (idx) => {};

    function investRound() {
      const total = allocation[0] + allocation[1] + allocation[2];
      let totalReturn = 0;
      baskets.forEach((b, i) => {
        const portion = (allocation[i] / total) * money;
        const lost = Math.random() < b.risk;
        const ret = lost
          ? portion * (b.returnRange[0] + Math.random() * b.returnRange[0] * 0.5)
          : portion * (b.returnRange[0] + Math.random() * (b.returnRange[1] - b.returnRange[0]));
        totalReturn += portion + ret;
      });
      money = Math.max(1, Math.round(totalReturn));
      round++;
      render();
    }

    function finish() {
      const passed = money >= 130;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Tre Cesti — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '🏆' : '📉'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">€${money}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Ottima diversificazione!' : 'Il rischio ti ha penalizzato! Riprova!'}</div>
        </div>
      `;
      delete window._cestiAdj;
      delete window._cestiAlloc;
      setTimeout(() => onComplete(passed, money), 1500);
    }

    render();
  }

  // ===================== 6. BOSS QUIZ =====================
  function startBoss(area, onComplete) {
    let hp = 100, qIdx = 0, score = 0;
    const questions = shuffle(QUIZ_QUESTIONS).slice(0, 10);

    function render() {
      if (qIdx >= questions.length || hp <= 0) return finish();
      const q = questions[qIdx];
      let ansHtml = '';
      q.a.forEach((a, i) => {
        ansHtml += `<button class="mg-btn" data-idx="${i}">${a}</button>`;
      });

      area.innerHTML = `
        <div class="mg-title">⚔️ Battaglia Finale!</div>
        <div class="boss-wrap">
          <div class="boss-dragon">🐉</div>
          <div class="boss-hp-bar"><i id="boss-hp" style="width:${hp}%"></i></div>
          <div class="boss-timer">❤️ Inflazion: ${hp}% | Domanda ${qIdx + 1}/${questions.length}</div>
        </div>
        <div class="mg-card">
          <div class="boss-q">${q.q}</div>
          <div class="boss-answers">${ansHtml}</div>
        </div>
      `;

      area.querySelectorAll('.mg-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = +btn.dataset.idx;
          if (idx === q.c) {
            btn.classList.add('correct');
            hp = Math.max(0, hp - 15);
            score += 10;
            const hpEl = document.getElementById('boss-hp');
            if (hpEl) hpEl.style.width = hp + '%';
          } else {
            btn.classList.add('wrong');
            area.querySelectorAll('.mg-btn')[q.c].classList.add('correct');
          }
          setTimeout(() => { qIdx++; render(); }, 800);
        };
      });
    }

    function finish() {
      const victory = hp <= 0;
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${victory ? '🎉 HAI VINTO!' : '💔 Sconfitta...'}</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:64px;margin:12px 0">${victory ? '🏆' : '😢'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">${victory ? 'Il drago è stato sconfitto!' : 'Inflazion è troppo forte!'}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">Punteggio: ${score} | HP drago: ${hp}%</div>
          <div style="font-size:13px;color:var(--dim)">${passed ? 'Il Regno è salvo!' : 'Studia di più e riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed || victory, score), 2000);
    }

    render();
  }

  // ===================== 7. AZIONI =====================
  function startAzioni(area, onComplete) {
    const COMPANIES = [
      { id: 'pane', name: 'Panificio Reale', emoji: '🍞', sector: 'Food', basePrice: 50 },
      { id: 'tech', name: 'SoldaTech', emoji: '💻', sector: 'Tech', basePrice: 120 },
      { id: 'farm', name: 'Farmacia Vita', emoji: '💊', sector: 'Health', basePrice: 80 },
      { id: 'ener', name: 'EnergiaSol', emoji: '☀️', sector: 'Energy', basePrice: 65 },
      { id: 'mode', name: 'SoldaFashion', emoji: '👗', sector: 'Fashion', basePrice: 95 },
      { id: 'banca', name: 'Banca del Regno', emoji: '🏦', sector: 'Finance', basePrice: 150 }
    ];
    let money = 500, portfolio = {}, prices = {}, round = 0, maxRounds = 8;

    COMPANIES.forEach(c => prices[c.id] = c.basePrice);

    function fluctuate() {
      COMPANIES.forEach(c => {
        const vol = c.basePrice * 0.15;
        const news = Math.random();
        let change = (Math.random() - 0.48) * vol; // slight upward bias
        if (news < 0.1) change = -vol * 1.5; // bad news crash
        if (news > 0.92) change = vol * 1.5; // good news boom
        prices[c.id] = Math.max(10, Math.round(prices[c.id] + change));
      });
    }

    function render() {
      if (round >= maxRounds) return finish();
      fluctuate();
      let stocksHtml = '';
      COMPANIES.forEach(c => {
        const p = prices[c.id];
        const trend = p > c.basePrice ? 'high' : p < c.basePrice ? 'low' : '';
        const owned = portfolio[c.id] || 0;
        const profit = owned > 0 ? (p - (portfolio[c.id + '_avg'] || p)) * owned : 0;
        stocksHtml += `
          <div class="market-row">
            <div class="item-icon">${c.emoji}</div>
            <div class="item-name">${c.name}<div class="item-stock">${c.stock}${owned > 0 ? ` · Possiedi: ${owned}${profit !== 0 ? ` (P/L: ${profit >= 0 ? '+' : ''}€${Math.round(profit)})` : ''}` : ''}</div></div>
            <div class="item-price ${trend}">€${p}</div>
            <div style="display:flex;gap:4px">
              <button class="btn small" onclick="window._azioniBuy('${c.id}')" ${money < p ? 'disabled' : ''}>Compra</button>
              <button class="btn small green" onclick="window._azioniSell('${c.id}')" ${owned <= 0 ? 'disabled' : ''}>Vendi</button>
            </div>
          </div>`;
      });

      const totalVal = money + Object.entries(portfolio).filter(([k]) => !k.endsWith('_avg')).reduce((s, [k, v]) => s + v * prices[k], 0);

      area.innerHTML = `
        <div class="mg-title">📊 Borsa Virtuale</div>
        <div class="mg-score">💰 €${Math.round(money)} | Valore portfolio: €${Math.round(totalVal)} | Giorno ${round + 1}/${maxRounds}</div>
        <div class="mg-card">${stocksHtml}</div>
        <div style="text-align:center"><button class="btn primary" id="azioni-next">Prossimo giorno →</button></div>
      `;
      document.getElementById('azioni-next').onclick = () => { round++; render(); };
    }

    window._azioniBuy = (id) => {
      const p = prices[id];
      if (money >= p) {
        money -= p;
        portfolio[id] = (portfolio[id] || 0) + 1;
        const avgKey = id + '_avg';
        const oldAvg = portfolio[avgKey] || p;
        portfolio[avgKey] = ((oldAvg * ((portfolio[id] || 1) - 1)) + p) / portfolio[id];
        render();
      }
    };
    window._azioniSell = (id) => {
      if ((portfolio[id] || 0) > 0) {
        money += prices[id];
        portfolio[id]--;
        render();
      }
    };

    function finish() {
      const totalVal = money + Object.entries(portfolio).filter(([k]) => !k.endsWith('_avg')).reduce((s, [k, v]) => s + v * prices[k], 0);
      const passed = totalVal >= 600;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Borsa Virtuale — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '📈' : '📉'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">€${Math.round(totalVal)}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Ottimi investimenti!' : 'Il mercato ti ha superato! Riprova!'}</div>
        </div>
      `;
      delete window._azioniBuy;
      delete window._azioniSell;
      setTimeout(() => onComplete(passed, totalVal), 1500);
    }
    render();
  }

  // ===================== 8. ETF =====================
  function startETF(area, onComplete) {
    const SECTORS = [
      { id: 'tech', name: 'Tecnologia', emoji: '💻', stocks: ['SoldaTech', 'ByteKing', 'CloudNet'], risk: 0.4, avgReturn: 0.12 },
      { id: 'health', name: 'Salute', emoji: '💊', stocks: ['FarmVita', 'MedCorp', 'BioGen'], risk: 0.25, avgReturn: 0.08 },
      { id: 'finance', name: 'Finanza', emoji: '🏦', stocks: ['BancaRegno', 'Assicurano', 'FondoItalia'], risk: 0.3, avgReturn: 0.09 },
      { id: 'energy', name: 'Energia', emoji: '☀️', stocks: ['SolarSol', 'WindForce', 'EcoPower'], risk: 0.35, avgReturn: 0.10 },
      { id: 'consumer', name: 'Consumo', emoji: '🛒', stocks: ['ShopKing', 'FoodChain', 'ModeLux'], risk: 0.2, avgReturn: 0.07 }
    ];

    let selected = [0, 1]; // start with tech + health
    let etfReturns = [];
    let rounds = 0, maxRounds = 8;
    let money = 1000;

    function calcETFReturn() {
      let totalRet = 0;
      selected.forEach(si => {
        const s = SECTORS[si];
        const ret = s.avgReturn + (Math.random() - 0.5) * s.risk * 2;
        totalRet += ret;
      });
      return totalRet / selected.length;
    }

    function render() {
      if (rounds >= maxRounds) return finish();
      let sectorsHtml = '';
      SECTORS.forEach((s, i) => {
        const isSelected = selected.includes(i);
        sectorsHtml += `
          <div class="basket ${isSelected ? 'selected' : ''}" onclick="window._etfToggle(${i})">
            <div class="b-icon">${s.emoji}</div>
            <div class="b-name">${s.name}</div>
            <div class="b-desc">Rischio: ${Math.round(s.risk * 100)}%</div>
            <div class="b-alloc">${isSelected ? '✅' : '➕'}</div>
          </div>`;
      });

      const history = etfReturns.map((r, i) => `<span style="color:${r >= 0 ? 'var(--green)' : 'var(--red)'};font-weight:700">G${i + 1}: ${r >= 0 ? '+' : ''}${(r * 100).toFixed(1)}%</span>`).join(' → ');

      area.innerHTML = `
        <div class="mg-title">🧩 Costruisci il tuo ETF</div>
        <div class="mg-score">💰 €${Math.round(money)} | Round: ${rounds + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div class="mg-sub">Seleziona i settori per il tuo ETF (min 2, max 5)</div>
          <div class="basket-row">${sectorsHtml}</div>
          <div style="text-align:center;font-size:12px;color:var(--dim);margin-top:6px">
            Settori selezionati: ${selected.length}/5 · Media rischio: ${selected.length > 0 ? Math.round(selected.reduce((s, i) => s + SECTORS[i].risk, 0) / selected.length * 100) : 0}%
          </div>
          ${history ? `<div style="margin-top:8px;font-size:11px;line-height:1.6">${history}</div>` : ''}
        </div>
        <button class="btn primary" id="etf-invest" ${selected.length < 2 ? 'disabled' : ''}>Investi nel tuo ETF! →</button>
      `;
      document.getElementById('etf-invest').onclick = investRound;
    }

    window._etfToggle = (i) => {
      const idx = selected.indexOf(i);
      if (idx >= 0) selected.splice(idx, 1);
      else if (selected.length < 5) selected.push(i);
      render();
    };

    function investRound() {
      const ret = calcETFReturn();
      etfReturns.push(ret);
      money = Math.max(1, Math.round(money * (1 + ret)));
      rounds++;
      render();
    }

    function finish() {
      const totalReturn = (money - 1000) / 1000 * 100;
      const passed = money >= 1200;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Il tuo ETF — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '🧩' : '📊'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">€${Math.round(money)}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">Rendimento: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(1)}%</div>
          <div style="font-size:13px;color:var(--dim)">${passed ? 'Il tuo ETF ha battuto il mercato!' : 'Diversifica meglio il tuo ETF! Riprova!'}</div>
        </div>
      `;
      delete window._etfToggle;
      setTimeout(() => onComplete(passed, money), 1500);
    }
    render();
  }

  // ===================== 9. TASSE =====================
  function startTasse(area, onComplete) {
    const SCAGLIONI = [
      { from: 0, to: 15000, rate: 0.23 },
      { from: 15000, to: 28000, rate: 0.27 },
      { from: 28000, to: 50000, rate: 0.38 },
      { from: 50000, to: Infinity, rate: 0.43 }
    ];
    const DETRAZIONI = [
      { id: 'figli', name: 'Figli a carico', emoji: '👶', value: 800, desc: '€800 per figlio' },
      { id: 'casa', name: 'Mutuo prima casa', emoji: '🏠', value: 500, desc: '€500 detrazione' },
      { id: 'studio', name: 'Spese studio', emoji: '📚', value: 300, desc: '€300 detrazione' },
      { id: 'medico', name: 'Spese mediche', emoji: '🏥', value: 200, desc: '€200 detrazione' }
    ];

    let reddito = 32000 + Math.floor(Math.random() * 20000);
    let detrazioni = [];
    let round = 0, maxRounds = 5, score = 0;
    const scenarios = [
      { reddito: 18000, desc: 'Hai un lavoro da impiegato' },
      { reddito: 35000, desc: 'Sei un professionista' },
      { reddito: 55000, desc: 'Hai un\'azienda di successo' },
      { reddito: 22000, desc: 'Sei un artigiano' },
      { reddito: 42000, desc: 'Sei un libero professionista' }
    ];

    function calcTasse(reddito, detrazioni) {
      let totDetrazioni = detrazioni.reduce((s, d) => s + DETRAZIONI.find(x => x.id === d).value, 0);
      let imponibile = Math.max(0, reddito - totDetrazioni);
      let tasse = 0;
      for (const sc of SCAGLIONI) {
        if (imponibile > sc.from) {
          const taxable = Math.min(imponibile, sc.to) - sc.from;
          tasse += taxable * sc.rate;
        }
      }
      return { tasse: Math.round(tasse), imponibile, totDetrazioni };
    }

    function render() {
      if (round >= maxRounds) return finish();
      const s = scenarios[round];
      reddito = s.reddito;
      detrazioni = [];

      let detHtml = '';
      DETRAZIONI.forEach(d => {
        detHtml += `
          <div class="basket" onclick="window._tasseDet('${d.id}')" id="tasse-det-${d.id}">
            <div class="b-icon">${d.emoji}</div>
            <div class="b-name">${d.name}</div>
            <div class="b-desc">${d.desc}</div>
            <div class="b-alloc">➕</div>
          </div>`;
      });

      area.innerHTML = `
        <div class="mg-title">🏛️ Compila la Dichiarazione</div>
        <div class="mg-score">Punti: ${score} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div style="text-align:center;font-weight:700;margin-bottom:4px">${s.desc}</div>
          <div style="text-align:center;font-size:18px;font-weight:800;color:var(--gold)">Reddito annuo: €${reddito}</div>
          <div style="text-align:center;font-size:12px;color:var(--dim);margin:4px 0">Seleziona le detrazioni applicabili:</div>
          <div class="basket-row" style="flex-wrap:wrap">${detHtml}</div>
        </div>
        <button class="btn primary" id="tasse-submit">Calcola tasse →</button>
      `;

      document.getElementById('tasse-submit').onclick = () => {
        const { tasse, imponibile, totDetrazioni } = calcTasse(reddito, detrazioni);
        const expected = calcTasse(reddito, DETRAZIONI.filter(d => {
          if (reddito < 25000 && d.id === 'figli') return true;
          if (reddito < 40000 && d.id === 'casa') return true;
          if (d.id === 'studio' || d.id === 'medico') return true;
          return false;
        }).map(d => d.id));
        const diff = Math.abs(tasse - expected.tasse);
        const points = Math.max(0, 20 - Math.round(diff / 100));
        score += points;

        area.innerHTML = `
          <div class="mg-title">🏛️ Risultato Dichiarazione</div>
          <div class="mg-card" style="text-align:center">
            <div style="font-size:14px;margin-bottom:8px">Reddito: €${reddito}</div>
            <div style="font-size:13px">Detrazioni applicate: -€${totDetrazioni}</div>
            <div style="font-size:13px">Imponibile: €${imponibile}</div>
            <div style="font-size:22px;font-weight:800;color:var(--gold);margin:8px 0">Tasse: €${tasse}</div>
            <div style="font-size:13px;color:${points >= 15 ? 'var(--green)' : 'var(--red)'}">Punti: +${points}/20</div>
            <div style="font-size:12px;color:var(--dim);margin-top:4px">Tasse "corrette": ~€${expected.tasse}</div>
          </div>
        `;
        setTimeout(() => { round++; render(); }, 1500);
      };
    }

    window._tasseDet = (id) => {
      const idx = detrazioni.indexOf(id);
      if (idx >= 0) detrazioni.splice(idx, 1);
      else detrazioni.push(id);
      const el = document.getElementById('tasse-det-' + id);
      if (el) el.classList.toggle('selected');
    };

    function finish() {
      const passed = score >= 60;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Dichiarazione dei Redditi — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '🏛️' : '📋'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">Punti: ${score}/${maxRounds * 20}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Conosci bene il sistema fiscale!' : 'Le tasse sono complesse, ma ci puoi riuscire! Riprova!'}</div>
        </div>
      `;
      delete window._tasseDet;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 10. ASSICURAZIONI =====================
  function startAssicurazioni(area, onComplete) {
    const SCENARIOS = [
      { event: '🏠 Incendio in casa', cost: 8000, insurance: 'casa', premium: 300, desc: 'Un cortocircuito ha danneggiato il tetto' },
      { event: '🏥 Operazione urgente', cost: 15000, insurance: 'salute', premium: 200, desc: 'Ti serve un intervento non previsto' },
      { event: '🚗 Incidente stradale', cost: 5000, insurance: 'auto', premium: 150, desc: 'Hai tamponato un\'auto parcheggiata' },
      { event: '📱 Telefono rubato', cost: 800, insurance: 'telefono', premium: 20, desc: 'Ti hanno rubato il cellulare' },
      { event: '👴 Pensione mancante', cost: 20000, insurance: 'pensione', premium: 250, desc: 'Non hai risparmiato abbastanza' },
      { event: '🌊 Allagamento garage', cost: 6000, insurance: 'casa', premium: 300, desc: 'Una tubatura è scoppiata' },
      { event: '💼 Licenziamento', cost: 12000, insurance: 'disoccupazione', premium: 100, desc: 'Hai perso il lavoro' },
      { event: '🦷 Problema dentistico', cost: 2000, insurance: 'salute', premium: 200, desc: 'Ti serve un impianto' }
    ];

    let round = 0, maxRounds = 6, score = 0;
    let availableBudget = 500;

    function render() {
      if (round >= maxRounds) return finish();
      const s = SCENARIOS[round];
      const worthIt = s.cost > s.premium * 10; // insurance worth if event cost > 10x annual premium
      const canAfford = availableBudget >= s.premium;

      area.innerHTML = `
        <div class="mg-title">🛡️ Scegli l'Assicurazione</div>
        <div class="mg-score">Punti: ${score} | Budget: €${availableBudget} | Round: ${round + 1}/${maxRounds}</div>
        <div class="mg-card">
          <div style="text-align:center;font-size:32px;margin:8px 0">${s.event.split(' ')[0]}</div>
          <div style="text-align:center;font-weight:700;margin-bottom:4px">${s.event}</div>
          <div style="text-align:center;font-size:13px;color:var(--dim);margin-bottom:8px">${s.desc}</div>
          <div style="text-align:center;font-size:14px">Costo evento: <b style="color:var(--red)">€${s.cost}</b></div>
          <div style="text-align:center;font-size:14px">Premio annuo assicurazione: <b>€${s.premium}</b></div>
          <div style="text-align:center;font-size:12px;color:var(--dim);margin:4px 0">Rapporto costo/premio: ${(s.cost / s.premium).toFixed(0)}:1</div>
        </div>
        <div class="mg-grid" style="grid-template-columns:1fr 1fr;gap:8px">
          <button class="btn green" id="ass-yes" ${!canAfford ? 'disabled' : ''}>🛡️ Assicurati (-€${s.premium})</button>
          <button class="btn red" id="ass-no">❌ Non assicurarti</button>
          <button class="btn ghost" id="ass-skip" style="grid-column:1/-1">⏭️ Salta scenario</button>
        </div>
      `;

      document.getElementById('ass-yes').onclick = () => {
        availableBudget -= s.premium;
        const pts = worthIt ? 15 : 5;
        score += pts;
        showResult(worthIt, pts, `Hai assicurato: risparmi €${s.cost - s.premium}!`);
      };
      document.getElementById('ass-no').onclick = () => {
        const pts = worthIt ? 5 : 15;
        score += pts;
        showResult(!worthIt, pts, worthIt ? `Oh no! Dovevi assicurarti! Perso €${s.cost}` : `Ottima scelta! Hai risparmiato €${s.premium}`);
      };
      document.getElementById('ass-skip').onclick = () => { round++; render(); };
    }

    function showResult(correct, pts, msg) {
      area.innerHTML = `
        <div class="mg-title">${correct ? '✅' : '⚠️'} Scenario assicurativo</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:20px;font-weight:700;margin:8px 0">${msg}</div>
          <div style="font-size:14px;color:var(--gold)">+${pts} punti</div>
        </div>
      `;
      setTimeout(() => { round++; render(); }, 1500);
    }

    function finish() {
      const passed = score >= 50;
      area.innerHTML = `
        <div class="mg-title">${passed ? '✅' : '❌'} Assicurazioni — Risultato</div>
        <div class="mg-card" style="text-align:center">
          <div style="font-size:48px;margin:12px 0">${passed ? '🛡️' : '💔'}</div>
          <div style="font-size:24px;font-weight:800;color:var(--gold)">Punti: ${score}</div>
          <div style="font-size:14px;color:var(--dim);margin:8px 0">${passed ? 'Sai gestire i rischi!' : 'Le assicurazioni sono importanti! Riprova!'}</div>
        </div>
      `;
      setTimeout(() => onComplete(passed, score), 1500);
    }
    render();
  }

  // ===================== 11. PENSIONI =====================
  function startPensioni(area, onComplete) {
    let etaInizio = 25, contributo = 200, tasso = 7, etaPensione = 65;

    function calcPension(etaIni, contrib, rate, etaP) {
      let total = 0;
      const years = etaP - etaIni;
      for (let i = 0; i < years; i++) {
        total = (total + contrib * 12) * (1 + rate / 100);
      }
      return Math.round(total);
    }

    function calcMonthly(etaIni, contrib, rate, etaP) {
      const total = calcPension(etaIni, contrib, rate, etaP);
      return Math.round(total / ((etaP - etaIni) * 12 * 0.04));
    }

    function render() {
      const total = calcPension(etaInizio, contributo, tasso, etaPensione);
      const monthly = calcMonthly(etaInizio, contributo, tasso, etaPensione);
      const invested = contributo * 12 * (etaPensione - etaInizio);
      const interests = total - invested;

      const scenarios = [
        { label: 'Vecchiaia', eta: 65, desc: 'Pensione a 65 anni' },
        { label: 'Media', eta: 60, desc: 'Pensione a 60 anni' },
        { label: 'Precoce', eta: 55, desc: 'Pensione a 55 anni' }
      ];

      area.innerHTML = `
        <div class="mg-title">🏖️ Calcola la Pensione</div>
        <div class="mg-card">
          <div class="tree-controls">
            <label>📅 Inizi a: <span class="val">${etaInizio} anni</span></label>
            <input type="range" min="18" max="45" value="${etaInizio}" id="p-eta">
          </div>
          <div class="tree-controls">
            <label>💰 Contributo/mese: <span class="val">€${contributo}</span></label>
            <input type="range" min="50" max="1000" step="50" value="${contributo}" id="p-contrib">
          </div>
          <div class="tree-controls">
            <label>📈 Rendimento: <span class="val">${tasso}%</span></label>
            <input type="range" min="2" max="12" value="${tasso}" id="p-rate">
          </div>
          <div class="tree-controls">
            <label>🏖️ Pensione a: <span class="val">${etaPensione} anni</span></label>
            <input type="range" min="55" max="75" value="${etaPensione}" id="p-retire">
          </div>
          <div class="tree-result">
            <div style="font-size:20px;font-weight:800;color:var(--gold);margin-bottom:8px">💰 €${total.toLocaleString('it-IT')}</div>
            <div style="font-size:13px">Hai investito: €${invested.toLocaleString('it-IT')}</div>
            <div style="font-size:13px;color:var(--green)">Interessi guadagnati: +€${interests.toLocaleString('it-IT')} ✨</div>
            <div style="font-size:13px;margin-top:4px">Pensione mensile stimata: <b>€${monthly.toLocaleString('it-IT')}/mese</b></div>
          </div>
        </div>
        <div class="mg-card">
          <div style="font-size:12px;font-weight:700;color:var(--dim);margin-bottom:8px;text-transform:uppercase">Confronto: quando iniziare?</div>
          ${scenarios.map(s => {
            const t = calcPension(s.eta, contributo, tasso, etaPensione);
            const inv = contributo * 12 * (etaPensione - s.eta);
            return `<div class="market-row">
              <div class="item-icon">${s.eta <= 30 ? '🌱' : s.eta <= 35 ? '🌿' : '🌳'}</div>
              <div class="item-name">${s.desc}<div class="item-stock">Investito: €${inv.toLocaleString('it-IT')}</div></div>
              <div class="item-price ${t >= 500000 ? 'low' : t >= 200000 ? '' : 'high'}">€${t.toLocaleString('it-IT')}</div>
            </div>`;
          }).join('')}
        </div>
        <button class="btn primary" id="p-ok">Ho capito! Continua →</button>
      `;

      document.getElementById('p-eta').oninput = e => { etaInizio = +e.target.value; render(); };
      document.getElementById('p-contrib').oninput = e => { contributo = +e.target.value; render(); };
      document.getElementById('p-rate').oninput = e => { tasso = +e.target.value; render(); };
      document.getElementById('p-retire').oninput = e => { etaPensione = +e.target.value; render(); };
      document.getElementById('p-ok').onclick = () => onComplete(true, total);
    }
    render();
  }

  // ===================== SIMULATORE COMPOUND INTEREST =====================
  function startSimulatore(area, onComplete) {
    let initial = 1000, monthly = 200, rate = 7, years = 20, freq = 12, inflation = 2;

    function calcCompound(pv, pmt, r, t, n) {
      const periods = n * t;
      const ratePerPeriod = r / 100 / n;
      let values = [pv];
      let totalContributed = pv;
      for (let i = 1; i <= periods; i++) {
        const prev = values[i - 1];
        const interest = prev * ratePerPeriod;
        const contrib = pmt / (n / 12);
        values.push(prev + interest + contrib);
        totalContributed += contrib;
      }
      // Downsample to yearly for chart
      let yearly = [values[0]];
      for (let y = 1; y <= t; y++) {
        const idx = Math.min(y * n, values.length - 1);
        yearly.push(values[idx]);
      }
      return { values, yearly, totalContributed };
    }

    function calcSimple(pv, pmt, r, t) {
      let yearly = [pv];
      let total = pv;
      const monthlyRate = r / 100;
      for (let y = 1; y <= t; y++) {
        yearly.push(pv + (pv * monthlyRate * y) + (pmt * 12 * y));
      }
      return yearly;
    }

    function render() {
      const compound = calcCompound(initial, monthly, rate, years, freq);
      const simple = calcSimple(initial, monthly, rate, years);
      const finalCompound = compound.yearly[compound.yearly.length - 1];
      const finalSimple = simple[simple.length - 1];
      const totalContrib = compound.totalContributed;
      const totalInterest = finalCompound - totalContrib;
      const realValue = finalCompound / Math.pow(1 + inflation / 100, years);

      // SVG Chart
      const W = 400, H = 180, PAD = 30;
      const maxVal = Math.max(finalCompound, finalSimple) * 1.1;
      const toX = i => PAD + (i / years) * (W - PAD * 2);
      const toY = v => PAD + (1 - v / maxVal) * (H - PAD * 2);

      let compoundPath = compound.yearly.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
      let simplePath = simple.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
      let contribPath = compound.yearly.map((v, i) => {
        const c = initial + monthly * 12 * i;
        return `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(c).toFixed(1)}`;
      }).join(' ');

      // Grid lines
      let gridLines = '';
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        const val = (maxVal / steps) * i;
        const y = toY(val);
        gridLines += `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" stroke="#E8DCC8" stroke-width="0.5"/>`;
        gridLines += `<text x="${PAD - 4}" y="${y + 3}" text-anchor="end" font-size="8" fill="#9E8E78">${val >= 1e6 ? (val/1e6).toFixed(1)+'M' : val >= 1e3 ? (val/1e3).toFixed(0)+'K' : Math.round(val)}</text>`;
      }

      // X axis labels
      let xLabels = '';
      const xStep = years <= 10 ? 1 : years <= 20 ? 5 : 10;
      for (let i = 0; i <= years; i += xStep) {
        xLabels += `<text x="${toX(i)}" y="${H - 4}" text-anchor="middle" font-size="8" fill="#9E8E78">${i}a</text>`;
      }

      // Legend dots
      const legend = `
        <circle cx="${PAD}" cy="6" r="4" fill="var(--gold)"/><text x="${PAD + 8}" y="9" font-size="8" fill="#555">Composto</text>
        <circle cx="${PAD + 80}" cy="6" r="4" fill="var(--dim)"/><text x="${PAD + 88}" y="9" font-size="8" fill="#555">Semplice</text>
        <circle cx="${PAD + 160}" cy="6" r="4" fill="var(--green)"/><text x="${PAD + 168}" y="9" font-size="8" fill="#555">Contributi</text>
      `;

      const chartSvg = `
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:var(--card);border-radius:12px;border:2px solid var(--line)">
          ${gridLines}
          ${xLabels}
          <path d="${contribPath}" fill="none" stroke="var(--green)" stroke-width="2" stroke-dasharray="4,3"/>
          <path d="${simplePath}" fill="none" stroke="var(--dim)" stroke-width="2" stroke-dasharray="6,3"/>
          <path d="${compoundPath}" fill="none" stroke="var(--gold)" stroke-width="2.5"/>
          <circle cx="${toX(years)}" cy="${toY(finalCompound)}" r="5" fill="var(--gold)"/>
          <circle cx="${toX(years)}" cy="${toY(finalSimple)}" r="4" fill="var(--dim)"/>
          ${legend}
        </svg>`;

      const freqNames = { 1: 'Annuale', 4: 'Trimestrale', 12: 'Mensile', 365: 'Giornaliero' };
      const compoundMore = finalCompound - finalSimple;

      area.innerHTML = `
        <div class="mg-title">🧮 Simulatore Compound Interest</div>
        <div class="mg-card" style="padding:8px">
          ${chartSvg}
        </div>
        <div class="mg-card">
          <div class="tree-controls">
            <label>💰 Investimento iniziale: <span class="val">€${initial.toLocaleString('it-IT')}</span></label>
            <input type="range" min="0" max="50000" step="500" value="${initial}" id="s-initial">
          </div>
          <div class="tree-controls">
            <label>📅 Contributo mensile: <span class="val">€${monthly.toLocaleString('it-IT')}</span></label>
            <input type="range" min="0" max="2000" step="50" value="${monthly}" id="s-monthly">
          </div>
          <div class="tree-controls">
            <label>📈 Tasso annuo: <span class="val">${rate}%</span></label>
            <input type="range" min="1" max="15" value="${rate}" id="s-rate">
          </div>
          <div class="tree-controls">
            <label>⏱️ Anni: <span class="val">${years}</span></label>
            <input type="range" min="1" max="40" value="${years}" id="s-years">
          </div>
          <div class="tree-controls">
            <label>🔄 Frequenza: <span class="val">${freqNames[freq]}</span></label>
            <input type="range" min="0" max="3" value={[1,4,12,365].indexOf(freq)} id="s-freq">
          </div>
          <div class="tree-controls">
            <label>📉 Inflazione: <span class="val">${inflation}%</span></label>
            <input type="range" min="0" max="8" value="${inflation}" id="s-inflation">
          </div>
        </div>
        <div class="mg-card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:center">
            <div>
              <div style="font-size:11px;color:var(--dim)">💰 Investito</div>
              <div style="font-size:16px;font-weight:800;color:var(--green)">€${Math.round(totalContrib).toLocaleString('it-IT')}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--dim)">✨ Interessi guadagnati</div>
              <div style="font-size:16px;font-weight:800;color:var(--gold)">€${Math.round(totalInterest).toLocaleString('it-IT')}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--dim)">📈 Valore finale composto</div>
              <div style="font-size:18px;font-weight:800;color:var(--txt)">€${Math.round(finalCompound).toLocaleString('it-IT')}</div>
            </div>
            <div>
              <div style="font-size:11px;color:var(--dim)">📊 Valore semplice</div>
              <div style="font-size:16px;font-weight:700;color:var(--dim)">€${Math.round(finalSimple).toLocaleString('it-IT')}</div>
            </div>
            <div style="grid-column:1/-1;padding:6px;background:var(--card2);border-radius:10px">
              <div style="font-size:11px;color:var(--dim)">🏆 Il composto batte il semplice di</div>
              <div style="font-size:20px;font-weight:800;color:var(--green)">€${Math.round(compoundMore).toLocaleString('it-IT')} (+${((compoundMore/finalSimple)*100).toFixed(0)}%)</div>
            </div>
            <div style="grid-column:1/-1;padding:6px;background:#FFF3E0;border-radius:10px">
              <div style="font-size:11px;color:var(--dim)">📉 Valore reale (dopo inflazione ${inflation}%)</div>
              <div style="font-size:16px;font-weight:700;color:#E65100">€${Math.round(realValue).toLocaleString('it-IT')}</div>
            </div>
          </div>
        </div>
        <button class="btn primary" id="s-ok">Ho capito! Continua →</button>
      `;

      const freqValues = [1, 4, 12, 365];
      document.getElementById('s-initial').oninput = e => { initial = +e.target.value; render(); };
      document.getElementById('s-monthly').oninput = e => { monthly = +e.target.value; render(); };
      document.getElementById('s-rate').oninput = e => { rate = +e.target.value; render(); };
      document.getElementById('s-years').oninput = e => { years = +e.target.value; render(); };
      document.getElementById('s-freq').oninput = e => { freq = freqValues[+e.target.value]; render(); };
      document.getElementById('s-inflation').oninput = e => { inflation = +e.target.value; render(); };
      document.getElementById('s-ok').onclick = () => onComplete(true, Math.round(finalCompound));
    }

    render();
  }

  function start(gameId, area, onComplete) {
    switch (gameId) {
      case 'banco': return startBanco(area, onComplete);
      case 'mercato': return startMercato(area, onComplete);
      case 'albero': return startAlbero(area, onComplete);
      case 'runner': return startRunner(area, onComplete);
      case 'cesti': return startCesti(area, onComplete);
      case 'boss': return startBoss(area, onComplete);
      case 'azioni': return startAzioni(area, onComplete);
      case 'etf': return startETF(area, onComplete);
      case 'tasse': return startTasse(area, onComplete);
      case 'assicurazioni': return startAssicurazioni(area, onComplete);
      case 'pensioni': return startPensioni(area, onComplete);
      case 'simulatore': return startSimulatore(area, onComplete);
    }
  }

  return { start };
})();
