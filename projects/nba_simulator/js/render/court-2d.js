/* Canvas2D court fallback */

export function createCourt2D(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  let w = 1, h = 1;
  const POS = { PG: [0.24, 0.5], SG: [0.34, 0.24], SF: [0.34, 0.76], PF: [0.46, 0.38], C: [0.5, 0.6] };

  function resize(width, height, dpr) {
    w = width; h = height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(state, now) {
    const X = v => v * w, Y = v => v * h;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#6b3b18'); g.addColorStop(1, '#3b1f0d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.78)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(X(0.04), Y(0.06), X(0.92), Y(0.88));
    ctx.beginPath(); ctx.moveTo(X(0.5), Y(0.06)); ctx.lineTo(X(0.5), Y(0.94)); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(0.5), Y(0.5), Math.min(w, h) * 0.08, 0, Math.PI * 2); ctx.stroke();
    for (const cx of [0.18, 0.82]) {
      ctx.strokeRect(X(cx - 0.09), Y(0.3), X(0.18), Y(0.4));
      ctx.beginPath(); ctx.arc(X(cx === 0.18 ? 0.27 : 0.73), Y(0.5), Math.min(w, h) * 0.11, 0, Math.PI * 2); ctx.stroke();
    }
    const t = now / 1000;
    (state.players || []).forEach((p, i) => {
      const base = POS[p.pos] || POS.SF;
      const x = p.side === 'away' ? 1 - base[0] : base[0];
      const y = p.side === 'away' ? 1 - base[1] : base[1];
      ctx.fillStyle = p.side === 'home' ? state.homeColor : state.awayColor;
      ctx.beginPath();
      ctx.arc(X(x + Math.sin(t * 2 + i) * 0.006), Y(y), 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke();
    });
    const ball = state.ball || { x: 0.5, y: 0.5 };
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath(); ctx.arc(X(ball.x), Y(ball.y), 5, 0, Math.PI * 2); ctx.fill();
  }

  return { kind: '2d', resize, draw, dispose() {} };
}

