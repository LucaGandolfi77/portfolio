/* NBA Sim — grafici Canvas */
(function () {
    'use strict';

    function setup(canvas) {
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        const w = canvas.clientWidth || canvas.parentElement.clientWidth || 320;
        const h = 150;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.style.height = h + 'px';
        canvas.width = w * dpr; canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        return { ctx: ctx, w: w, h: h };
    }

    function bars(canvas, values, colors) {
        const s = setup(canvas); if (!s) return;
        const c = s.ctx, n = values.length;
        const max = Math.max(1, Math.max.apply(null, values));
        const bw = (s.w - 20) / n;
        values.forEach(function (v, i) {
            const bh = (v / max) * (s.h - 34);
            const x = 10 + i * bw + bw * 0.18;
            const y = s.h - 20 - bh;
            c.fillStyle = colors ? colors[i % colors.length] : '#22d3ee';
            c.fillRect(x, y, bw * 0.64, bh);
            c.fillStyle = '#93a0c0'; c.font = '10px Inter, sans-serif'; c.textAlign = 'center';
            c.fillText(String(v), x + bw * 0.32, y - 4);
            c.fillText('Q' + (i + 1), x + bw * 0.32, s.h - 5);
        });
    }

    function line(canvas, series, color) {
        const s = setup(canvas); if (!s || !series || series.length < 2) return;
        const c = s.ctx;
        c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(8, s.h / 2); c.lineTo(s.w - 8, s.h / 2); c.stroke();
        c.strokeStyle = color || '#a78bfa'; c.lineWidth = 2.5;
        c.beginPath();
        series.forEach(function (p, i) {
            const x = 8 + i / (series.length - 1) * (s.w - 16);
            const y = s.h - 12 - p.p * (s.h - 24);
            if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
        });
        c.stroke();
    }

    function shotChart(canvas, shots) {
        const s = setup(canvas); if (!s) return;
        const c = s.ctx;
        c.save();
        c.beginPath(); c.arc(s.w / 2, s.h * 0.78, s.h * 0.42, -Math.PI / 2, Math.PI / 2); c.strokeStyle = 'rgba(255,255,255,.2)'; c.stroke();
        c.beginPath(); c.arc(s.w / 2, s.h * 0.78, s.h * 0.2, -Math.PI / 2, Math.PI / 2); c.stroke();
        shots.forEach(function (sh) {
            const x = (sh.x / 100) * s.w;
            const y = (sh.y / 100) * s.h * 1.5;
            c.fillStyle = sh.made ? 'rgba(52,211,153,.75)' : 'rgba(251,113,133,.75)';
            c.beginPath(); c.arc(x, y, sh.value === 3 ? 4 : 3, 0, Math.PI * 2); c.fill();
        });
        c.restore();
    }

    function comparison(canvas, rows) {
        const s = setup(canvas); if (!s) return;
        const c = s.ctx;
        const rowH = (s.h - 16) / rows.length;
        rows.forEach(function (r, i) {
            const max = Math.max(1, r.h, r.a);
            const y = 8 + i * rowH;
            c.fillStyle = '#93a0c0'; c.font = '10px Inter, sans-serif'; c.textAlign = 'center';
            c.fillText(r.label, s.w / 2, y + 9);
            c.fillStyle = '#fbbf24'; c.fillRect(s.w / 2 - 4 - (r.h / max) * (s.w / 2 - 12), y, (r.h / max) * (s.w / 2 - 12), 7);
            c.fillStyle = '#60a5fa'; c.fillRect(s.w / 2 + 4, y, (r.a / max) * (s.w / 2 - 12), 7);
            c.fillStyle = '#eef2ff'; c.fillText(r.h + ' · ' + r.a, s.w / 2, y + 21);
        });
    }

    window.NBACharts = { bars: bars, line: line, shotChart: shotChart, comparison: comparison };
})();
