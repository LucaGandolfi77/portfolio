/* De Rerum Gatta — minigiochi. Ognuno è un mini-gioco reale e giocabile.
   API: Minigames.run(id, container, onWin, onLose) */
'use strict';

const Minigames = (() => {
  let current = null;

  function run(id, el, onWin, onLose) {
    destroy();
    const def = {
      petali, lira, forme, crescita, media, pendolo, mele, orbita, prisma, calamita,
      scatola, crivello, scommessa, stati, vasca, farfalla, collina, viaggio,
    }[id];
    if (!def) return;
    current = def(el, () => { destroy(); onWin(); }, () => { destroy(); onLose(); });
  }

  function destroy() {
    if (current && current.destroy) { try { current.destroy(); } catch (e) {} }
    current = null;
  }

  /* ---------- utility ---------- */
  function mk(tag, cls, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }
  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }
  function fmt(x, digits = 0) {
    return x.toLocaleString('it-IT', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  }

  /* ================================================================
     1. I PETALI DI FIBONACCI — tocca i petali in ordine di sequenza
     ================================================================ */
  function petali(el, win, lose) {
    const seq = [1, 1, 2, 3, 5, 8, 13, 21];
    const shuffled = [...seq].sort(() => Math.random() - 0.5);
    let idx = 0;
    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Tocca i petali uno dopo l\'altro, in ordine di sequenza.';
    const need = mk('div', 'mg-need', box);
    const garden = mk('div', 'mg-petals', box);
    const tips = mk('div', 'mg-tips', box);
    const ref = mk('div', 'mg-ref', box);
    ref.textContent = 'Sequenza: 1 · 1 · 2 · 3 · 5 · 8 · 13 · 21';

    function renderNeed() {
      need.textContent = idx < seq.length
        ? `Ora tocca il petalo con il numero: ${seq[idx]}`
        : 'Completato!';
    }
    renderNeed();

    shuffled.forEach((n, i) => {
      const p = mk('button', 'petal', garden);
      p.textContent = n;
      const angle = (i / shuffled.length) * 360;
      p.style.setProperty('--rot', angle + 'deg');
      p.addEventListener('click', () => {
        AudioSys.click();
        if (n === seq[idx]) {
          p.classList.add('ok');
          p.disabled = true;
          idx++;
          renderNeed();
          tips.textContent = n + ' = ' + (seq[idx - 2] ?? 0) + ' + ' + (seq[idx - 3] ?? 0);
          if (idx === seq.length) { AudioSys.chime(); setTimeout(win, 450); }
        } else {
          AudioSys.wrong();
          shake(p);
          tips.textContent = 'No: il prossimo petalo è ' + seq[idx] + '. Riprova.';
        }
      });
    });
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     2. LA LIRA DEL GATTO — rapporti musicali di Pitagora
     ================================================================ */
  function lira(el, win, lose) {
    // stringhe con rapporto di frequenza: base * ratio
    const strings = [
      { ratio: 2,   name: 'Ottava (2:1)',   label: 'corda corta' },
      { ratio: 1.5, name: 'Quinta (3:2)',   label: 'corda media' },
      { ratio: 4/3, name: 'Quarta (4:3)',   label: 'corda lunga' },
      { ratio: 1,   name: 'Fondamentale (1:1)', label: 'corda lunghissima' },
    ];
    const base = 220;
    let round = 0;
    const targets = [
      { text: 'Trova la corda che suona un\'OTTava (il doppio della nota base)', ratio: 2, hint: 'OTTava = 2:1' },
      { text: 'Trova la corda che suona una QUINTA (tre mezzi della base)', ratio: 1.5, hint: 'QUINTA = 3:2' },
      { text: 'Trova la corda che suona una QUARTA (quattro terzi della base)', ratio: 4/3, hint: 'QUARTA = 4:3' },
    ];

    const box = mk('div', 'mg-box', el);
    const task = mk('div', 'mg-hint', box); task.textContent = targets[0].text;
    const hint = mk('div', 'mg-sub2', box); hint.textContent = targets[0].hint;
    mk('div', 'mg-sub2', box).textContent = 'Tocca una corda per ascoltarla: poi scegli quella giusta.';
    const stage = mk('div', 'mg-stage', box);
    const prog = mk('div', 'mg-tips', box);

    function nextRound() {
      round++;
      if (round >= targets.length) { AudioSys.chime(); setTimeout(win, 300); return; }
      task.textContent = targets[round].text;
      hint.textContent = targets[round].hint;
      prog.textContent = 'Rapporti trovati: ' + round + ' / 3';
    }

    strings.forEach((s, i) => {
      const st = mk('button', 'mg-string', stage);
      st.style.height = (30 + i * 22) + 'px';
      st.innerHTML = '<span class="str-note">♪</span><span class="str-name">' + s.label + '</span>';
      st.addEventListener('click', () => {
        AudioSys.tone(base * s.ratio, 0.9, 'triangle', 0.14);
        if (s.ratio === targets[round].ratio) {
          st.classList.add('ok'); st.disabled = true;
          AudioSys.meow();
          setTimeout(nextRound, 600);
        } else {
          st.classList.add('try');
          setTimeout(() => st.classList.remove('try'), 300);
        }
      });
    });
    prog.textContent = 'Rapporti trovati: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     3. IL GIARDINO GEOMETRICO (Euclide) — riconosci le figure
     ================================================================ */
  function forme(el, win, lose) {
    const rounds = [
      {
        q: 'Quale figura è un triangolo EQUILATERO (tutti i lati uguali)?',
        shapes: ['scaleno', 'equilatero', 'isoscele'], correct: 'equilatero',
      },
      {
        q: 'Quale triangolo è RETTANGOLO (ha un angolo di 90°)?',
        shapes: ['acutangolo', 'rettangolo', 'ottusangolo'], correct: 'rettangolo',
      },
      {
        q: 'Quale figura ha tutti i punti a uguale distanza dal centro?',
        shapes: ['quadrato', 'cerchio', 'triangolo'], correct: 'cerchio',
      },
    ];
    let round = 0;
    let done = false;
    // mescola la posizione della figura corretta per ogni round
    rounds.forEach(r => {
      const i = r.shapes.indexOf(r.correct);
      const j = Math.floor(Math.random() * 3);
      [r.shapes[i], r.shapes[j]] = [r.shapes[j], r.shapes[i]];
    });

    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const canvas = mk('canvas', 'mg-canvas', box);
    canvas.width = 300; canvas.height = 130;
    const ctx = canvas.getContext('2d');
    const opts = mk('div', 'mg-grid three', box);
    const prog = mk('div', 'mg-tips', box);

    function finish() {
      if (done) return;
      done = true;
      AudioSys.chime();
      setTimeout(win, 450);
    }

    function drawShape(kind, x, y, label) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = '#eef4ec';
      ctx.strokeStyle = '#5f7d5c';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (kind === 'equilatero') {
        ctx.moveTo(0, -34); ctx.lineTo(30, 26); ctx.lineTo(-30, 26); ctx.closePath();
      } else if (kind === 'isoscele') {
        ctx.moveTo(0, -38); ctx.lineTo(26, 28); ctx.lineTo(-26, 28); ctx.closePath();
      } else if (kind === 'scaleno') {
        ctx.moveTo(-30, 24); ctx.lineTo(24, -28); ctx.lineTo(32, 24); ctx.closePath();
      } else if (kind === 'rettangolo') {
        ctx.moveTo(-28, 26); ctx.lineTo(20, -30); ctx.lineTo(34, 22); ctx.closePath();
        // segno dell'angolo retto
        ctx.strokeStyle = '#b05268';
        ctx.beginPath(); ctx.moveTo(18, -18); ctx.lineTo(32, -6); ctx.lineTo(20, 10); ctx.stroke();
      } else if (kind === 'acutangolo') {
        ctx.moveTo(-26, 26); ctx.lineTo(0, -34); ctx.lineTo(30, 26); ctx.closePath();
      } else if (kind === 'ottusangolo') {
        ctx.moveTo(-32, 26); ctx.lineTo(-2, -20); ctx.lineTo(26, 26); ctx.closePath();
      } else if (kind === 'quadrato') {
        ctx.rect(-26, -26, 52, 52);
      } else if (kind === 'cerchio') {
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
      } else if (kind === 'triangolo') {
        ctx.moveTo(0, -32); ctx.lineTo(28, 26); ctx.lineTo(-28, 26); ctx.closePath();
      }
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#b05268'; ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(label, 0, 40);
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const labels = ['A', 'B', 'C'];
      rounds[round].shapes.forEach((k, i) => drawShape(k, 50 + i * 100, 55, labels[i]));
    }

    function renderOpts() {
      draw();
      opts.innerHTML = '';
      rounds[round].shapes.forEach((k, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = ['A', 'B', 'C'][i];
        b.addEventListener('click', () => {
          if (done) return;
          if (k === rounds[round].correct) {
            b.classList.add('correct');
            AudioSys.meow();
            round++;
            prog.textContent = 'Figure riconosciute: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            renderOpts();
          } else {
            AudioSys.wrong(); shake(b);
            prog.textContent = 'No: osserva bene le proprietà. Riprova.';
          }
        });
      });
    }
    renderOpts();
    prog.textContent = 'Figure riconosciute: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     4. LA CRESCITA DELLA VIOLETTA (Leibniz) — derivate e integrali
     ================================================================ */
  function crescita(el, win, lose) {
    const rounds = [
      {
        q: '🌱 Una violetta cresce 3 cm al giorno per 5 giorni. Quanto è alta in totale?',
        opts: ['8 cm', '15 cm', '35 cm'], correct: 1,
        expl: 'Integrale = somma delle crescite: 3×5 = 15 cm.',
      },
      {
        q: '🌱 Cresce 2 cm/giorno per 3 giorni, poi 4 cm per 1 giorno. Totale?',
        opts: ['9 cm', '10 cm', '24 cm'], correct: 1,
        expl: 'Somma: 2×3 + 4×1 = 10 cm.',
      },
      {
        q: '🌱 Velocità di crescita: 1, 2, 4, 8 cm/giorno nei quattro giorni. Totale?',
        opts: ['15 cm', '8 cm', '24 cm'], correct: 0,
        expl: 'Somma delle velocità (integrale): 1+2+4+8 = 15 cm.',
      },
    ];
    let round = 0;
    let done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const opts = mk('div', 'mg-grid three', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() {
      if (done) return;
      done = true;
      AudioSys.chime();
      setTimeout(win, 500);
    }

    function render() {
      opts.innerHTML = '';
      rounds[round].opts.forEach((o, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (done) return;
          if (i === rounds[round].correct) {
            b.classList.add('correct');
            AudioSys.meow();
            expl.textContent = rounds[round].expl;
            round++;
            prog.textContent = 'Crescite sommate: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            render();
          } else {
            AudioSys.wrong(); shake(b);
            expl.textContent = 'Suggerimento: somma le crescite di ogni giorno (è l\'integrale!).';
          }
        });
      });
    }
    render();
    prog.textContent = 'Crescite sommate: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     5. L'ORBITA DI KEPLERO — lancia la palla di lana in orbita
     ================================================================ */
  function orbita(el, win, lose) {
    const W = 320, H = 320;
    const cx = W / 2, cy = H / 2;
    const GM = 62000;              // px³/s²
    const R_STAR = 16;
    const START_X = cx + 130, START_Y = cy;
    const vCirc = Math.sqrt(GM / 130); // ≈ 21.8 px/s
    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Trascina dal cerchietto per dare la spinta alla palla di lana: la velocità per un\'orbita circolare è ≈ ' + vCirc.toFixed(1) + ' px/s. Completa un giro!';
    const canvas = mk('canvas', 'mg-canvas', box);
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const prog = mk('div', 'mg-tips', box);

    let state = 'aim'; // aim | fly | win | lost
    let ball = { x: START_X, y: START_Y, vx: 0, vy: 0 };
    let drag = null;    // {sx, sy, ex, ey}
    let trail = [];
    let angleAcc = 0, prevAngle = null;
    let raf = null, alive = true;
    let lastT = performance.now();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // stella
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, R_STAR * 2.2);
      grad.addColorStop(0, '#ffe9a8'); grad.addColorStop(1, '#d4a853');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, R_STAR * 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a87d2c';
      ctx.beginPath(); ctx.arc(cx, cy, R_STAR, 0, Math.PI * 2); ctx.fill();
      // orbita circolare di riferimento (traiettoria ideale)
      ctx.strokeStyle = 'rgba(212,168,83,.35)'; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      // trail
      trail.forEach((p, i) => {
        ctx.fillStyle = 'rgba(157,184,155,' + (i / trail.length * 0.5 + 0.1) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2); ctx.fill();
      });
      // palla di lana
      ctx.fillStyle = '#b8a7d8';
      ctx.beginPath(); ctx.arc(ball.x, ball.y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7b5ea7'; ctx.lineWidth = 2;
      ctx.stroke();
      // freccia di lancio
      if (state === 'aim' && drag) {
        const dx = drag.ex - drag.sx, dy = drag.ey - drag.sy;
        ctx.strokeStyle = '#b05268'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ball.x + dx, ball.y + dy); ctx.stroke();
        const sp = Math.hypot(dx, dy) * 1.6;
        ctx.fillStyle = '#b05268'; ctx.font = 'bold 12px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(sp.toFixed(0) + ' px/s', ball.x + dx / 2, ball.y + dy / 2 - 10);
      }
    }

    function physics(dt) {
      const dx = cx - ball.x, dy = cy - ball.y;
      const r = Math.hypot(dx, dy);
      if (r < R_STAR + 6) { endGame(false, '💥 La palla è caduta nella stella!'); return; }
      if (r > W) { endGame(false, '🚀 La palla è fuggita nello spazio! Troppo veloce.'); return; }
      const a = GM / (r * r);
      ball.vx += (dx / r) * a * dt;
      ball.vy += (dy / r) * a * dt;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 400) trail.shift();
      // accumula l'angolo percorso
      const ang = Math.atan2(ball.y - cy, ball.x - cx);
      if (prevAngle !== null) {
        let d = ang - prevAngle;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        angleAcc += Math.abs(d);
      }
      prevAngle = ang;
      const sp = Math.hypot(ball.vx, ball.vy);
      if (angleAcc >= Math.PI * 2) { endGame(true, '🪐 ORBITA COMPLETATA! La gravità è un abbraccio.'); return; }
      prog.textContent = 'Velocità: ' + sp.toFixed(0) + ' px/s · giro: ' + Math.min(100, (angleAcc / (Math.PI * 2) * 100)).toFixed(0) + '%' +
        (sp < vCirc * 0.7 ? ' — troppo lenta: cadrà!' : sp > vCirc * 1.7 ? ' — troppo veloce: fuggirà!' : ' — ben calibrata');
    }

    function endGame(ok, msg) {
      if (state !== 'fly') return;
      state = ok ? 'win' : 'lost';
      cancelAnimationFrame(raf);
      prog.textContent = msg;
      if (ok) { AudioSys.chime(); setTimeout(win, 500); }
      else {
        AudioSys.wrong();
        const retry = mk('button', 'btn primary small', box);
        retry.textContent = '🔄 Riprova il lancio';
        retry.addEventListener('click', () => { box.remove(); orbita(el, win, lose); });
      }
    }

    function loop(t) {
      if (!alive) return;
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      if (state === 'fly') physics(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function pt(e) {
      const r = canvas.getBoundingClientRect();
      return { x: (e.touches ? e.touches[0].clientX : e.clientX) - r.left, y: (e.touches ? e.touches[0].clientY : e.clientY) - r.top };
    }
    function down(e) {
      e.preventDefault();
      if (state !== 'aim') return;
      drag = { sx: pt(e).x, sy: pt(e).y, ex: pt(e).x, ey: pt(e).y };
    }
    function move(e) {
      e.preventDefault();
      if (state !== 'aim' || !drag) return;
      drag.ex = pt(e).x; drag.ey = pt(e).y;
    }
    function up(e) {
      e.preventDefault();
      if (state !== 'aim' || !drag) return;
      const dx = drag.ex - drag.sx, dy = drag.ey - drag.sy;
      ball.vx = dx * 1.6; ball.vy = dy * 1.6;
      state = 'fly';
      drag = null;
      AudioSys.click();
    }
    canvas.addEventListener('touchstart', down, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', up, { passive: false });
    canvas.addEventListener('mousedown', down);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', up);

    prog.textContent = 'Trascina per lanciare. Velocità circolare: ' + vCirc.toFixed(1) + ' px/s';
    lastT = performance.now();
    raf = requestAnimationFrame(loop);
    return { destroy() { alive = false; cancelAnimationFrame(raf); box.remove(); } };
  }

  /* ================================================================
     6. IL PRISMA ARCOBALENO (Maxwell) — ordina i colori
     ================================================================ */
  function prisma(el, win, lose) {
    const order = ['rosso', 'arancione', 'giallo', 'verde', 'azzurro', 'indaco', 'violetto'];
    const colors = {
      rosso: '#e05b4d', arancione: '#f0913c', giallo: '#ecc53b', verde: '#6b9e5e',
      azzurro: '#5aa7c9', indaco: '#5b6bb5', violetto: '#8b5aa8',
    };
    const shuffled = [...order].sort(() => Math.random() - 0.5);
    let idx = 0;

    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'La luce bianca si scompone nel prisma. Tocca i colori dal ROSSO (lunghezza d\'onda più lunga) al VIOLETTO (la più corta).';
    const chips = mk('div', 'mg-chips', box);
    const prog = mk('div', 'mg-tips', box);

    shuffled.forEach(c => {
      const b = mk('button', 'chip', chips);
      b.textContent = c;
      b.style.background = colors[c];
      b.addEventListener('click', () => {
        if (b.classList.contains('ok')) return;
        if (c === order[idx]) {
          b.classList.add('ok');
          AudioSys.tone(440 + idx * 60, 0.15, 'sine', 0.08);
          idx++;
          prog.textContent = 'Colori ordinati: ' + idx + ' / 7';
          if (idx >= order.length) { AudioSys.chime(); setTimeout(win, 450); }
        } else {
          AudioSys.wrong(); shake(b);
          prog.textContent = 'Non è il prossimo colore. Riprova: dal più "lento" (rosso) al più "veloce" (violetto).';
        }
      });
    });
    prog.textContent = 'Colori ordinati: 0 / 7';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     7. LA SCOMMESSA DI PASCAL — probabilità
     ================================================================ */
  function scommessa(el, win, lose) {
    const rounds = [
      {
        q: '🪙 Lanci una moneta. Qual è la probabilità di TESTA?',
        opts: ['1/3', '1/2', '2/3'], correct: 1,
        expl: 'Casi favorevoli: 1 (testa). Casi possibili: 2. P = 1/2.',
      },
      {
        q: '🎲 Lanci un dado. Qual è la probabilità di ottenere 6?',
        opts: ['1/6', '1/2', '1/3'], correct: 0,
        expl: 'Casi favorevoli: 1. Casi possibili: 6. P = 1/6.',
      },
      {
        q: '🃏 Da un mazzo di 52 carte estrai un asso. Probabilità?',
        opts: ['4/52 = 1/13', '1/52', '4/13'], correct: 0,
        expl: 'Ci sono 4 assi su 52 carte: P = 4/52 = 1/13.',
      },
    ];
    let round = 0;
    let done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const opts = mk('div', 'mg-grid three', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() {
      if (done) return;
      done = true;
      AudioSys.chime();
      setTimeout(win, 500);
    }

    function render() {
      opts.innerHTML = '';
      rounds[round].opts.forEach((o, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (done) return;
          if (i === rounds[round].correct) {
            b.classList.add('correct');
            AudioSys.meow();
            expl.textContent = rounds[round].expl;
            round++;
            prog.textContent = 'Probabilità azzeccate: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            render();
          } else {
            AudioSys.wrong(); shake(b);
            expl.textContent = 'Suggerimento: conta i casi favorevoli e dividi per i casi possibili.';
          }
        });
      });
    }
    render();
    prog.textContent = 'Probabilità azzeccate: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     8. IL GHIACCIOLO DI CLAUSIUS — entropia e freccia del tempo
     ================================================================ */
  function stati(el, win, lose) {
    const rounds = [
      {
        type: 'order',
        q: '❄️ Ordina gli stati della materia per ENERGIA crescente: solido, liquido, gas.',
        order: ['🧊 solido', '💧 liquido', '♨️ gas'],
        correct: ['🧊 solido', '💧 liquido', '♨️ gas'],
      },
      {
        type: 'pick',
        q: '🔥 Quale trasformazione richiede PIÙ energia?',
        opts: ['Fusione (ghiaccio → acqua)', 'Evaporazione (acqua → vapore)'], correct: 1,
        expl: 'L\'evaporazione richiede il calore latente maggiore: rompe del tutto i legami molecolari.',
      },
      {
        type: 'pick',
        q: '🍳 Quale processo è IRREVERSIBILE (l\'entropia cresce)?',
        opts: ['Sciogliere un cubetto di ghiaccio', 'Sbriciolare una frittata'], correct: 1,
        expl: 'Puoi ricongelare l\'acqua, ma non ricomporre la frittata: la freccia del tempo è una sola.',
      },
    ];
    let round = 0;
    let done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const area = mk('div', 'mg-opt-area', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() {
      if (done) return;
      done = true;
      AudioSys.chime();
      setTimeout(win, 500);
    }

    function render() {
      area.innerHTML = '';
      expl.textContent = '';
      const r = rounds[round];
      if (r.type === 'order') {
        const order = [...r.order].sort(() => Math.random() - 0.5);
        let idx = 0;
        order.forEach(o => {
          const b = mk('button', 'mg-btn', area);
          b.textContent = o;
          b.addEventListener('click', () => {
            if (done) return;
            if (o === r.correct[idx]) {
              b.classList.add('correct');
              AudioSys.tone(500 + idx * 100, 0.15, 'sine', 0.08);
              idx++;
              prog.textContent = 'Ordine: ' + idx + ' / 3';
              if (idx >= 3) {
                expl.textContent = 'Solido < liquido < gas: l\'energia interna cresce, l\'ordine diminuisce.';
                AudioSys.meow();
                round++;
                prog.textContent = 'Sfide superate: ' + round + ' / 3';
                if (round >= rounds.length) { finish(); return; }
                qEl.textContent = rounds[round].q;
                render();
              }
            } else {
              AudioSys.wrong(); shake(b);
              prog.textContent = 'No: da meno energia a più energia. Riprova.';
            }
          });
        });
      } else {
        r.opts.forEach((o, i) => {
          const b = mk('button', 'mg-btn', area);
          b.textContent = o;
          b.addEventListener('click', () => {
            if (done) return;
            if (i === r.correct) {
              b.classList.add('correct');
              AudioSys.meow();
              expl.textContent = r.expl;
              round++;
              prog.textContent = 'Sfide superate: ' + round + ' / 3';
              if (round >= rounds.length) { finish(); return; }
              qEl.textContent = rounds[round].q;
              render();
            } else {
              AudioSys.wrong(); shake(b);
              expl.textContent = 'Suggerimento: pensa a ciò che non puoi disfare.';
            }
          });
        });
      }
    }
    render();
    prog.textContent = 'Sfide superate: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     8b. LA MARGHERITA DEI DATI (Gauss) — la media aritmetica
     ================================================================ */
  function media(el, win, lose) {
    const rounds = [
      { q: '🌼 3 margherite, 5 girasoli e 4 rose: quanti fiori in MEDIA per tipo?', opts: ['3', '4', '12'], correct: 1, expl: 'Media = (3+5+4)/3 = 12/3 = 4.' },
      { q: '🌼 Petali raccolti: 2, 6, 8, 4. Quanti petali in media?', opts: ['5', '20', '4'], correct: 0, expl: 'Media = (2+6+8+4)/4 = 20/4 = 5.' },
      { q: '🌼 Gattini in 5 case: 1, 2, 2, 3, 2. Media?', opts: ['1', '2', '3'], correct: 1, expl: 'Media = (1+2+2+3+2)/5 = 10/5 = 2. (La moda è anch\'essa 2!)' },
    ];
    let round = 0, done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const opts = mk('div', 'mg-grid three', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() { if (done) return; done = true; AudioSys.chime(); setTimeout(win, 500); }
    function render() {
      opts.innerHTML = '';
      rounds[round].opts.forEach((o, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (done) return;
          if (i === rounds[round].correct) {
            b.classList.add('correct'); AudioSys.meow();
            expl.textContent = rounds[round].expl;
            round++;
            prog.textContent = 'Medie calcolate: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            render();
          } else {
            AudioSys.wrong(); shake(b);
            expl.textContent = 'Suggerimento: somma tutti i valori, poi dividi per quanti sono.';
          }
        });
      });
    }
    render();
    prog.textContent = 'Medie calcolate: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     8c. LA CALAMITA DI FARADAY — materiali ferromagnetici
     ================================================================ */
  function calamita(el, win, lose) {
    const rounds = [
      { q: '🧲 Quale oggetto è attratto dalla calamita?', opts: ['🍴 Forchetta d\'acciaio', '✏️ Matita', '🍞 Pane'], correct: 0, expl: 'L\'acciaio contiene ferro (Fe), materiale ferromagnetico: la calamita lo attrae.' },
      { q: '🧲 Quale oggetto è attratto dalla calamita?', opts: ['🪶 Piuma', '🧷 Graffetta', '🧻 Fazzoletto'], correct: 1, expl: 'La graffetta è d\'acciaio: il ferro si allinea ai domini magnetici.' },
      { q: '🧲 Quale oggetto è attratto dalla calamita?', opts: ['🍊 Arancia', '🧦 Calzino', '🔩 Vite'], correct: 2, expl: 'La vite è di ferro o acciaio: i materiali ferromagnetici (Fe, Co, Ni) rispondono al campo.' },
    ];
    let round = 0, done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const opts = mk('div', 'mg-grid three', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() { if (done) return; done = true; AudioSys.chime(); setTimeout(win, 500); }
    function render() {
      opts.innerHTML = '';
      rounds[round].opts.forEach((o, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (done) return;
          if (i === rounds[round].correct) {
            b.classList.add('correct'); AudioSys.meow();
            expl.textContent = rounds[round].expl;
            round++;
            prog.textContent = 'Oggetti trovati: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            render();
          } else {
            AudioSys.wrong(); shake(b);
            expl.textContent = 'Suggerimento: solo i materiali ferromagnetici (ferro, acciaio, cobalto, nichel) sono attratti.';
          }
        });
      });
    }
    render();
    prog.textContent = 'Oggetti trovati: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     8d. LA VASCA DI ARCHIMEDE — galleggiamento e densità
     ================================================================ */
  function vasca(el, win, lose) {
    const rounds = [
      { q: '🛁 Un tronco di legno nell\'acqua: galleggia o affonda?', opts: ['Galleggia', 'Affonda'], correct: 0, expl: 'Il legno ha densità < 1 g/cm³: la spinta di Archimede lo sostiene.' },
      { q: '🛁 Una pietra nell\'acqua: galleggia o affonda?', opts: ['Galleggia', 'Affonda'], correct: 1, expl: 'La pietra ha densità maggiore dell\'acqua: il suo peso vince la spinta.' },
      { q: '🛁 Una nave d\'acciaio piena d\'aria: galleggia o affonda?', opts: ['Galleggia', 'Affonda'], correct: 0, expl: 'La densità media (acciaio + aria) è minore di quella dell\'acqua: Eureka!' },
    ];
    let round = 0, done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const opts = mk('div', 'mg-grid two', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() { if (done) return; done = true; AudioSys.chime(); setTimeout(win, 500); }
    function render() {
      opts.innerHTML = '';
      rounds[round].opts.forEach((o, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (done) return;
          if (i === rounds[round].correct) {
            b.classList.add('correct'); AudioSys.meow();
            expl.textContent = rounds[round].expl;
            round++;
            prog.textContent = 'Previsioni giuste: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            render();
          } else {
            AudioSys.wrong(); shake(b);
            expl.textContent = 'Suggerimento: confronta la densità dell\'oggetto con quella dell\'acqua (1 g/cm³).';
          }
        });
      });
    }
    render();
    prog.textContent = 'Previsioni giuste: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     8e. LA FARFALLA DI LORENZ — caos deterministico
     ================================================================ */
  function farfalla(el, win, lose) {
    const rounds = [
      {
        q: '🦋 Un battito d\'ali in Brasile può cambiare il tempo a migliaia di km? L\'atmosfera è un sistema…',
        opts: ['Caotico: sensibile alle condizioni iniziali', 'Del tutto casuale', 'Prevedibile per sempre'], correct: 0,
        expl: 'È l\'effetto farfalla di Lorenz (1963): dipendenza sensibile dalle condizioni iniziali.',
      },
      {
        q: '🦋 Nel caos deterministico, la differenza tra due previsioni molto vicine…',
        opts: ['Resta piccola per sempre', 'Cresce esponenzialmente nel tempo', 'Scompare da sola'], correct: 1,
        expl: 'Piccole differenze iniziali si amplificano: ecco perché il tempo a lungo termine è imprevedibile.',
      },
      {
        q: '🦋 Per prevedere a lungo termine un sistema caotico servirebbe…',
        opts: ['Un supercomputer qualunque', 'Conoscere le condizioni iniziali con precisione infinita', 'Non serve nulla'], correct: 1,
        expl: 'La precisione infinita è impossibile per principio: il caos pone un limite fondamentale alla previsione.',
      },
    ];
    let round = 0, done = false;
    const box = mk('div', 'mg-box', el);
    const qEl = mk('div', 'mg-hint', box); qEl.textContent = rounds[0].q;
    const opts = mk('div', 'mg-grid three', box);
    const prog = mk('div', 'mg-tips', box);
    const expl = mk('div', 'mg-sub2', box);

    function finish() { if (done) return; done = true; AudioSys.chime(); setTimeout(win, 500); }
    function render() {
      opts.innerHTML = '';
      rounds[round].opts.forEach((o, i) => {
        const b = mk('button', 'mg-btn', opts);
        b.textContent = o;
        b.addEventListener('click', () => {
          if (done) return;
          if (i === rounds[round].correct) {
            b.classList.add('correct'); AudioSys.meow();
            expl.textContent = rounds[round].expl;
            round++;
            prog.textContent = 'Battiti compresi: ' + round + ' / 3';
            if (round >= rounds.length) { finish(); return; }
            qEl.textContent = rounds[round].q;
            render();
          } else {
            AudioSys.wrong(); shake(b);
            expl.textContent = 'Suggerimento: pensa a come una minima differenza iniziale possa cambiare tutto.';
          }
        });
      });
    }
    render();
    prog.textContent = 'Battiti compresi: 0 / 3';
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     9. L'ALTALENA DI GALILEA — pendolo: tocca quando è al centro
     ================================================================ */
  function pendolo(el, win, lose) {
    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Tocca quando il gattino passa dal CENTRO. 8 colpi giusti e il pendolo si sblocca.';
    const canvas = mk('canvas', 'mg-canvas', box);
    canvas.width = 300; canvas.height = 220;
    const ctx = canvas.getContext('2d');
    const prog = mk('div', 'mg-tips', box);

    const L = 120, cx = 150, cy = 40;
    let theta = 0.9, omega = 0, hits = 0, wrongs = 0, raf = null, alive = true;
    const g = 980;
    const zone = 0.12; // rad entro cui vale "centro"

    function tick() {
      if (!alive) return;
      const dt = 0.016;
      const alpha = -(g / L) * Math.sin(theta);
      omega += alpha * dt;
      theta += omega * dt;
      omega *= 0.997;
      draw();
      raf = requestAnimationFrame(tick);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // zona centrale
      ctx.fillStyle = 'rgba(232,160,180,.25)';
      ctx.fillRect(0, cy + 6, canvas.width, 16);
      ctx.fillStyle = 'rgba(232,160,180,.5)';
      ctx.fillRect(cx - 3, cy, 6, 12);
      // filo
      const x = cx + L * Math.sin(theta), y = cy + L * Math.cos(theta);
      ctx.strokeStyle = '#a8b5a0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      // gattino
      ctx.font = '26px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.abs(theta) < zone ? '😺' : '🐱', x, y);
    }

    function tap(e) {
      e.preventDefault();
      if (!alive) return;
      if (Math.abs(theta) < zone) {
        hits++;
        AudioSys.tone(600 + hits * 20, 0.12, 'sine', 0.08);
        prog.textContent = 'Colpi al centro: ' + hits + ' / 8' + (hits >= 4 ? ' — il ritmo si sente!' : '');
        if (hits >= 8) { alive = false; AudioSys.chime(); setTimeout(win, 400); }
      } else {
        wrongs++;
        AudioSys.wrong();
        prog.textContent = 'Troppo presto o troppo tardi (' + wrongs + '). Il periodo non dipende dall\'ampiezza: aspetta il centro!';
      }
    }
    canvas.addEventListener('pointerdown', tap);
    tick();
    return { destroy() { alive = false; cancelAnimationFrame(raf); box.remove(); } };
  }

  /* ================================================================
     4. LE MELE DI NEWTON — cattura le mele: la parabola
     ================================================================ */
  function mele(el, win, lose) {
    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Trascina il cesto e cattura 8 mele. Ogni mela segue una parabola.';
    const wrap = mk('div', 'mg-mele-wrap', box);
    const canvas = mk('canvas', 'mg-canvas', wrap);
    const W = 300, H = 320;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const prog = mk('div', 'mg-tips', box);

    let caught = 0, missed = 0, raf = null, alive = true;
    const apples = [];
    let basketX = W / 2;
    let spawnTimer = 0;
    const basketW = 54, basketY = H - 30;

    function spawn() {
      apples.push({
        x: 20 + Math.random() * (W - 60),
        y: -20,
        vx: (Math.random() - 0.5) * 90,   // spinta orizzontale: la parabola!
        vy: 40 + Math.random() * 60,
        r: 10,
      });
    }

    function tick(dt) {
      if (!alive) return;
      spawnTimer -= dt;
      if (spawnTimer <= 0 && apples.length < 4) { spawn(); spawnTimer = 0.7 + Math.random() * 0.9; }
      for (let i = apples.length - 1; i >= 0; i--) {
        const a = apples[i];
        a.vy += 320 * dt;
        a.x += a.vx * dt; a.y += a.vy * dt;
        if (a.y > basketY - 12 && Math.abs(a.x - basketX) < basketW / 2 + a.r) {
          apples.splice(i, 1); caught++;
          AudioSys.tone(700 + caught * 30, 0.15, 'sine', 0.1);
          prog.textContent = 'Mele catturate: ' + caught + ' / 8';
          if (caught >= 8) { alive = false; AudioSys.chime(); setTimeout(win, 400); }
        } else if (a.y > H + 20) {
          apples.splice(i, 1); missed++;
          AudioSys.wrong();
          prog.textContent = 'Persa una mela! (' + missed + ' su 3)';
          if (missed >= 3) { alive = false; lose(); }
        }
      }
      draw();
      raf = requestAnimationFrame(() => tick(1 / 60));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // albero
      ctx.fillStyle = '#8d6e63'; ctx.fillRect(30, 60, 16, 120);
      ctx.fillStyle = '#6b8e5a';
      ctx.beginPath(); ctx.arc(38, 40, 34, 0, Math.PI * 2); ctx.fill();
      // mele
      apples.forEach(a => {
        ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('🍎', a.x, a.y);
        // parabola tratteggiata (didattica)
        ctx.strokeStyle = 'rgba(212,168,83,.35)'; ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + a.vx * 0.4, a.y + 30); ctx.stroke();
        ctx.setLineDash([]);
      });
      // cesto
      ctx.fillStyle = '#b8895b';
      ctx.fillRect(basketX - basketW / 2, basketY, basketW, 18);
      ctx.strokeStyle = '#7c5a3a'; ctx.strokeRect(basketX - basketW / 2, basketY, basketW, 18);
    }

    function move(e) {
      const r = canvas.getBoundingClientRect();
      const px = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      basketX = Math.max(basketW / 2, Math.min(W - basketW / 2, px));
      e.preventDefault();
    }
    canvas.addEventListener('touchstart', move, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('mousemove', move);
    prog.textContent = 'Mele catturate: 0 / 8';
    tick(1 / 60);
    return { destroy() { alive = false; cancelAnimationFrame(raf); box.remove(); } };
  }

  /* ================================================================
     5. LA SCATOLA DI SCHRÖDINGER — ricorda i gattini svegli
     ================================================================ */
  function scatola(el, win, lose) {
    const N = 6, AWAKE = 3, TRIES = 5;
    const states = [];
    for (let i = 0; i < N; i++) states.push(i < AWAKE);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [states[i], states[j]] = [states[j], states[i]]; }

    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Guarda: tutti i gattini sono addormentati E svegli insieme (sovrapposizione!).';
    const preview = mk('div', 'mg-preview', box);
    for (let i = 0; i < N; i++) {
      const c = mk('div', 'preview-card', preview);
      c.textContent = states[i] ? '😺' : '😴';
    }
    const after = mk('div', 'mg-hint', box);
    after.textContent = 'Ora si sono addormentati davvero… o no? Trova i 3 gattini SVEGLI in ' + TRIES + ' osservazioni.';
    const grid = mk('div', 'mg-grid cards', box);
    const prog = mk('div', 'mg-tips', box);
    let found = 0, tries = 0;

    for (let i = 0; i < N; i++) {
      const card = mk('button', 'mg-card-box', grid);
      card.textContent = '🎁';
      card.addEventListener('click', () => {
        if (card.classList.contains('open')) return;
        tries++;
        card.classList.add('open');
        card.textContent = states[i] ? '😺' : '😴';
        if (states[i]) {
          found++;
          AudioSys.tone(700, 0.15, 'sine', 0.1);
          prog.textContent = 'Svegli trovati: ' + found + ' / 3 (osservazioni: ' + tries + ')';
          if (found >= AWAKE) { AudioSys.chime(); setTimeout(win, 400); }
        } else {
          AudioSys.wrong();
          prog.textContent = 'Addormentato! L\'osservazione ha deciso. Svegli trovati: ' + found + ' / 3 (osservazioni: ' + tries + ')';
          if (tries >= TRIES) { setTimeout(lose, 400); }
        }
      });
    }
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     6. IL CRIVELLO DI ERATOSTENE — numeri primi
     ================================================================ */
  function crivello(el, win, lose) {
    const MAX = 40;
    const nums = [];
    for (let n = 2; n <= MAX; n++) nums.push(n);
    const isPrime = n => { for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
    const primes = nums.filter(isPrime);
    let sieveIdx = 0; // prossimo primo da crivellare
    let crossed = 0;
    const total = nums.length - primes.length;
    const m_el = {};

    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Tocca il prossimo numero primo: i suoi multipli cadranno da soli. È il crivello!';
    const need = mk('div', 'mg-need', box);
    const grid = mk('div', 'mg-grid sieve', box);
    const prog = mk('div', 'mg-tips', box);

    function updateNeed() {
      if (sieveIdx < primes.length) need.textContent = 'Tocca il prossimo primo: ' + primes[sieveIdx];
      else need.textContent = 'Hai crivellato tutto!';
    }
    updateNeed();

    nums.forEach(n => {
      const b = mk('button', 'sieve-num', grid);
      b.textContent = n;
      m_el[n] = b;
      b.addEventListener('click', () => {
        if (b.classList.contains('crossed')) { shake(b); return; }
        if (n === primes[sieveIdx]) {
          // crivella i multipli
          nums.forEach(m => {
            if (m % n === 0 && !m_el[m].classList.contains('crossed')) {
              m_el[m].classList.add('crossed');
              crossed++;
            }
          });
          b.classList.add('prime-glow');
          AudioSys.meow();
          sieveIdx++;
          updateNeed();
          prog.textContent = 'Composti eliminati: ' + crossed + ' / ' + total;
          if (crossed >= total) { AudioSys.chime(); setTimeout(win, 400); }
        } else if (!isPrime(n)) {
          b.classList.add('crossed');
          crossed++;
          AudioSys.click();
          prog.textContent = 'Composto! Anche questo cade. Composti eliminati: ' + crossed + ' / ' + total;
          if (crossed >= total) { AudioSys.chime(); setTimeout(win, 400); }
        } else {
          AudioSys.wrong(); shake(b);
          prog.textContent = 'Quello è un primo, ma non è il prossimo da crivellare. Riprova.';
        }
      });
    });

    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     7. LA COLLINA DI LEOPARDI — serie convergenti e limiti
     ================================================================ */
  function collina(el, win, lose) {
    let total = 0, remaining = 1, steps = 0;
    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'La farfalla è a 100 passi. Ogni passo del gatto copre METÀ della distanza che resta. Tocca per avanzare.';
    const barWrap = mk('div', 'mg-bar', box);
    const bar = mk('div', 'mg-bar-fill', barWrap);
    const dist = mk('div', 'mg-need', box);
    const sumFrac = mk('div', 'mg-tips', box);
    const questionBox = mk('div', 'mg-question', box);

    function update() {
      const pct = total * 100;
      bar.style.width = Math.min(100, pct) + '%';
      dist.textContent = 'Distanza percorsa: ' + (total * 100).toFixed(1) + ' su 100 · passi: ' + steps;
      const parts = [];
      let acc = 0;
      for (let i = 1; i <= steps; i++) { const p = 1 / Math.pow(2, i); acc += p; parts.push(pctFrac(p)); }
      sumFrac.textContent = 'Somma: ' + parts.join(' + ') + (steps ? ' = ' + (acc * 100).toFixed(1) + ' %' : '');
    }
    function pctFrac(p) {
      if (p === 0.5) return '½';
      if (p === 0.25) return '¼';
      if (p === 0.125) return '⅛';
      if (p === 0.0625) return '1/16';
      return '1/' + Math.round(1 / p);
    }

    const stepBtn = mk('button', 'btn primary small', box);
    stepBtn.textContent = '🐾 Fai un passo (metà della strada che resta)';
    stepBtn.addEventListener('click', () => {
      if (steps >= 10) return;
      AudioSys.tone(440 + steps * 60, 0.12, 'sine', 0.07);
      const step = remaining / 2;
      total += step; remaining -= step; steps++;
      update();
      if (steps === 10) {
        stepBtn.disabled = true;
        const qNo = mk('button', 'btn', questionBox);
        qNo.textContent = 'Non arriva mai';
        const qSi = mk('button', 'btn primary', questionBox);
        qSi.textContent = 'Arriva: la somma tende a 1';
        qNo.addEventListener('click', () => {
          AudioSys.wrong();
          questionBox.innerHTML = '';
          mk('div', 'mg-hint', questionBox).textContent = 'Hmm… pensaci: ogni passo copre metà di quel che resta. La somma ½+¼+⅛+… continua ad avvicinarsi a 1. Il limite esiste!';
          const retry = mk('button', 'btn primary', questionBox);
          retry.textContent = 'Riprova';
          retry.addEventListener('click', () => {
            steps = 0; total = 0; remaining = 1;
            questionBox.innerHTML = '';
            stepBtn.disabled = false;
            update();
          });
        });
        qSi.addEventListener('click', () => {
          AudioSys.chime();
          questionBox.innerHTML = '';
          mk('div', 'mg-hint', questionBox).textContent = 'Esatto! La somma infinita ½+¼+⅛+… converge a 1: infinite tappe, ma una distanza finita. Il paradosso di Zenone si scioglie nel limite. 🐱✨';
          const doneBtn = mk('button', 'btn primary', questionBox);
          doneBtn.textContent = 'Meraviglioso!';
          doneBtn.addEventListener('click', win);
        });
      }
    });
    update();
    return { destroy() { box.remove(); } };
  }

  /* ================================================================
     8. IL VIAGGIO DI EINSTEIN — dilatazione del tempo
     ================================================================ */
  function viaggio(el, win, lose) {
    const box = mk('div', 'mg-box', el);
    mk('div', 'mg-hint', box).textContent = 'Regola la velocità della navicella (in frazione di c) finché un anno a bordo vale 10 anni sulla Terra.';
    const sliderWrap = mk('div', 'slider-wrap', box);
    const label = mk('label', '', sliderWrap); label.textContent = 'Velocità';
    const slider = mk('input', '', sliderWrap);
    slider.type = 'range'; slider.min = 0; slider.max = 0.9995; slider.step = 0.0005; slider.value = 0;
    const val = mk('div', 'val', sliderWrap);
    const readout = mk('div', 'mg-tips', box);
    const status = mk('div', 'mg-need', box);
    let done = false;

    function gamma(beta) { return 1 / Math.sqrt(1 - beta * beta); }

    function update() {
      const beta = parseFloat(slider.value);
      const g = gamma(beta);
      const earthYears = g * 1;
      val.textContent = (beta * 100).toFixed(1) + '% c';
      readout.textContent = 'γ = ' + g.toFixed(2) + ' → 1 anno a bordo = ' + earthYears.toFixed(2) + ' anni sulla Terra';
      if (Math.abs(g - 10) < 0.35 && !done) {
        done = true;
        status.textContent = '✨ Perfetto: γ ≈ 10! Il tempo a bordo scorre 10 volte più lento.';
        AudioSys.chime();
        const ok = mk('button', 'btn primary', box);
        ok.textContent = 'Capito! Il tempo è relativo';
        ok.addEventListener('click', win);
      } else if (!done) {
        status.textContent = Math.abs(g - 10) < 1.5
          ? 'Vicino! Ancora un filo di velocità in più.'
          : 'Cerca γ = 10: spingi la navicella più vicina a c.';
      }
    }
    slider.addEventListener('input', () => { AudioSys.click(); update(); });
    update();
    return { destroy() { box.remove(); } };
  }

  return { run, destroy };
})();
