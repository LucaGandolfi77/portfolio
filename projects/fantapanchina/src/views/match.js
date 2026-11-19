/* Campo LIVE: mini partita animata su canvas durante la giornata. */
const COL_US = '#3ee6ff', COL_AI = '#ff5f6d';

function makePlayers() {
  const base = [
    [0.07,0.50],[0.18,0.18],[0.18,0.40],[0.18,0.60],[0.18,0.82],
    [0.40,0.25],[0.42,0.50],[0.40,0.75],[0.66,0.20],[0.66,0.50],[0.66,0.80]
  ];
  const out = [];
  for (let team = 0; team < 2; team++) {
    base.forEach((p, i) => {
      out.push({
        team, n:i + 1,
        x: team === 0 ? p[0] : 1 - p[0],
        y: p[1],
        tx: team === 0 ? p[0] : 1 - p[0],
        ty: p[1],
        phase: Math.random() * 6.28
      });
    });
  }
  return out;
}

export function createMatchView({ onGoal, onEvent, onDone }) {
  let canvas = null, ctx = null, raf = null;
  let data = null, active = false, start = 0, elapsed = 0, speed = 1;
  let players = makePlayers();
  let ball = { x:0.5, y:0.5, tx:0.5, ty:0.5 };
  let particles = [], fired = new Set(), scoreUs = 0, scoreAi = 0;
  let lastFrame = 0, comment = 'La partita inizia!';

  function mount(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
  }

  function size() {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 340;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas._w = w; canvas._h = h;
  }

  function startMatch(match) {
    if (!canvas) return;
    size();
    data = match;
    active = true; elapsed = 0; start = performance.now(); lastFrame = start;
    players = makePlayers(); particles = []; fired = new Set();
    scoreUs = 0; scoreAi = 0; speed = 1;
    comment = 'La partita inizia!';
    ball = { x:0.5, y:0.5, tx:0.5, ty:0.5 };
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }

  function setSpeed(s) { speed = s; }
  function skip() { if (active) { elapsed = data.duration; } }

  function frame(now) {
    if (!active) return;
    const dt = Math.min(60, now - lastFrame) * speed;
    lastFrame = now;
    elapsed += dt;
    const p = Math.min(1, elapsed / data.duration);
    const minute = Math.round(p * 90);

    // Eventi temporizzati
    data.events.forEach((e, i) => {
      if (!fired.has(i) && minute >= e.minute) {
        fired.add(i);
        comment = e.msg || comment;
        if (e.type === 'goal') {
          if (e.team === 'us') scoreUs++; else scoreAi++;
          burst(e.team === 'us' ? 0.72 : 0.28, 0.5, e.team === 'us' ? COL_US : COL_AI, 26);
          onGoal && onGoal(e.team);
        } else {
          onEvent && onEvent(e);
        }
      }
    });

    // Movimento
    const attack = 0.5 + Math.sin(elapsed / 900) * 0.22;
    ball.tx = attack + Math.sin(elapsed / 430) * 0.14;
    ball.ty = 0.5 + Math.cos(elapsed / 530) * 0.28;
    ball.x += (ball.tx - ball.x) * 0.045;
    ball.y += (ball.ty - ball.y) * 0.045;
    players.forEach((pl, i) => {
      const homeX = pl.team === 0 ? 0.30 : 0.70;
      pl.tx = clamp(homeX + (ball.x - 0.5) * 0.55 + Math.sin(elapsed / (700 + i * 37) + pl.phase) * 0.055, 0.04, 0.96);
      pl.ty = clamp(0.5 + (ball.y - 0.5) * 0.75 + Math.cos(elapsed / (620 + i * 41) + pl.phase) * 0.06, 0.06, 0.94);
      pl.x += (pl.tx - pl.x) * 0.06;
      pl.y += (pl.ty - pl.y) * 0.06;
    });
    particles.forEach(q => { q.x += q.vx; q.y += q.vy; q.vy += 0.002; q.life -= 0.02; });
    particles = particles.filter(q => q.life > 0);

    draw(minute);
    if (elapsed >= data.duration) {
      active = false;
      comment = 'Fischio finale!';
      draw(90);
      setTimeout(() => { onDone && onDone({ scoreUs, scoreAi }); }, 700);
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, s = 0.003 + Math.random() * 0.012;
      particles.push({ x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s, life:1, color });
    }
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function draw(minute) {
    if (!canvas || !canvas._w) return;
    const w = canvas._w, h = canvas._h, pad = 34;
    const x0 = pad, y0 = pad, pw = w - pad * 2, ph = h - pad * 2 - 26;
    ctx.clearRect(0, 0, w, h);

    // sfondo stadio
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a1524'); bg.addColorStop(1, '#07101c');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // campo
    ctx.save();
    rr(x0, y0, pw, ph, 12); ctx.clip();
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(22,92,58,.92)' : 'rgba(18,78,50,.92)';
      ctx.fillRect(x0 + i * pw / 10, y0, pw / 10 + 1, ph);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x0 + 6, y0 + 6, pw - 12, ph - 12);
    ctx.beginPath(); ctx.moveTo(x0 + pw / 2, y0); ctx.lineTo(x0 + pw / 2, y0 + ph); ctx.stroke();
    ctx.beginPath(); ctx.arc(x0 + pw / 2, y0 + ph / 2, Math.min(pw, ph) * 0.13, 0, 6.3); ctx.stroke();
    ctx.strokeRect(x0 + 6, y0 + ph * 0.28, pw * 0.07, ph * 0.44);
    ctx.strokeRect(x0 + pw * 0.93, y0 + ph * 0.28, pw * 0.07, ph * 0.44);
    ctx.restore();

    // giocatori
    players.forEach(pl => {
      const x = x0 + pl.x * pw, y = y0 + pl.y * ph;
      const col = pl.team === 0 ? COL_US : COL_AI;
      ctx.beginPath(); ctx.arc(x + 1, y + 2, 8, 0, 6.3); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 7.5, 0, 6.3); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#04121c'; ctx.font = '800 8px Inter,sans-serif'; ctx.textAlign = 'center';
      ctx.textBaseline = 'middle'; ctx.fillText(pl.n, x, y + 0.5);
    });

    // pallone
    const bx = x0 + ball.x * pw, by = y0 + ball.y * ph;
    ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, 6.3); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();

    // particelle
    particles.forEach(q => {
      ctx.globalAlpha = Math.max(0, q.life);
      ctx.fillStyle = q.color; ctx.beginPath();
      ctx.arc(x0 + q.x * pw, y0 + q.y * ph, 2.5, 0, 6.3); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // scoreboard
    ctx.fillStyle = 'rgba(4,10,20,.82)';
    rr(w / 2 - 96, 8, 192, 26, 9); ctx.fill();
    ctx.textBaseline = 'alphabetic';
    ctx.font = '800 13px Inter,sans-serif'; ctx.textAlign = 'right'; ctx.fillStyle = COL_US;
    ctx.fillText(String(scoreUs), w / 2 - 10, 26);
    ctx.textAlign = 'center'; ctx.fillStyle = '#dce8ff'; ctx.fillText("'", w / 2, 25);
    ctx.textAlign = 'left'; ctx.fillStyle = COL_AI; ctx.fillText(String(scoreAi), w / 2 + 10, 26);
    ctx.textAlign = 'left'; ctx.fillStyle = '#8fa3c4'; ctx.font = '700 10px Inter,sans-serif';
    ctx.fillText(minute + "'", 12, 25);

    // commento
    ctx.fillStyle = 'rgba(4,10,20,.78)'; rr(x0, h - 22, pw, 20, 7); ctx.fill();
    ctx.fillStyle = '#cfe0f5'; ctx.font = '600 10px Inter,sans-serif';
    let text = comment;
    if (ctx.measureText(text).width > pw - 16) text = text.slice(0, Math.max(8, Math.floor((pw - 16) / 5))) + '…';
    ctx.fillText(text, x0 + 8, h - 8);
  }

  function stop() { active = false; cancelAnimationFrame(raf); raf = null; }

  return { mount, start:startMatch, setSpeed, skip, stop, isActive:() => active };
}
