/* NBA Sim — visualizzazione campo Canvas */
(function () {
    'use strict';

    const POS = {
        PG: [0.24, 0.50], SG: [0.34, 0.24], SF: [0.34, 0.76], PF: [0.46, 0.40], C: [0.50, 0.60]
    };

    class Court {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.ball = null;
            this.flash = 0;
            this.t = 0;
        }

        resize() {
            const wrap = this.canvas.parentElement;
            const w = Math.max(280, Math.min(wrap ? wrap.clientWidth : 480, 640));
            const h = Math.round(w * 0.62);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = h + 'px';
            this.canvas.width = Math.floor(w * dpr);
            this.canvas.height = Math.floor(h * dpr);
            this.w = w; this.h = h; this.dpr = dpr;
        }

        shot(shooterName, isThree, made, color) {
            const shooter = this.players && this.players.find(function (p) { return p.name === shooterName; });
            if (!shooter) return;
            this.ball = {
                x0: shooter.nx, y0: shooter.ny, x1: 0.93, y1: 0.5,
                t: 0, dur: 520, arc: isThree ? 0.22 : 0.13, made: made, color: color
            };
            if (made) this.flash = 1;
        }

        setPlayers(players) { this.players = players; }

        render(dt, colors) {
            const c = this.ctx;
            if (!c || !this.w) return;
            this.t += dt;
            const W = this.canvas.width, H = this.canvas.height;
            const PAD = W * 0.045;
            const x0 = PAD, y0 = H * 0.07, x1 = W - PAD, y1 = H * 0.93;
            const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
            c.clearRect(0, 0, W, H);

            // parquet
            const g = c.createLinearGradient(0, 0, W, H);
            g.addColorStop(0, '#5a3218'); g.addColorStop(0.5, '#8a4f22'); g.addColorStop(1, '#4a2913');
            c.fillStyle = g; c.fillRect(0, 0, W, H);
            c.strokeStyle = 'rgba(0,0,0,.08)'; c.lineWidth = 1;
            for (let x = 0; x < W; x += W / 18) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }

            // linee
            c.strokeStyle = 'rgba(255,255,255,.72)'; c.lineWidth = Math.max(1.5, W * 0.003);
            c.strokeRect(x0, y0, x1 - x0, y1 - y0);
            c.beginPath(); c.moveTo(cx, y0); c.lineTo(cx, y1); c.stroke();
            c.beginPath(); c.arc(cx, cy, (y1 - y0) * 0.17, 0, Math.PI * 2); c.stroke();
            // area sinistra/destra
            [x0, x1].forEach(function (bx) {
                const dir = bx === x0 ? 1 : -1;
                const keyW = (x1 - x0) * 0.19, keyH = (y1 - y0) * 0.48;
                c.strokeRect(dir > 0 ? bx : bx - keyW, cy - keyH / 2, keyW, keyH);
                c.beginPath();
                c.arc(dir > 0 ? bx + keyW : bx - keyW, cy, keyH * 0.62, -Math.PI / 2, Math.PI / 2, dir < 0);
                c.stroke();
                // canestro
                const hx = dir > 0 ? bx + keyW * 0.22 : bx - keyW * 0.22;
                c.beginPath(); c.arc(hx, cy, keyH * 0.055, 0, Math.PI * 2); c.stroke();
                c.fillStyle = '#fb923c'; c.fill();
            });

            // giocatori
            const self = this;
            (this.players || []).forEach(function (p, i) {
                if (!p.onCourt || p.injured) return;
                const base = POS[p.pos] || POS.SF;
                const nx = p.side === 'home' ? base[0] : 1 - base[0];
                const ny = p.side === 'home' ? base[1] : 1 - base[1];
                p.nx = nx; p.ny = ny;
                const px = x0 + nx * (x1 - x0) + Math.sin(self.t / 700 + i) * W * 0.004;
                const py = y0 + ny * (y1 - y0) + Math.cos(self.t / 800 + i) * H * 0.006;
                const r = W * 0.026;
                const color = p.side === 'home' ? (colors && colors.home) || '#fbbf24' : (colors && colors.away) || '#60a5fa';
                c.save();
                c.shadowColor = color; c.shadowBlur = W * 0.02;
                c.fillStyle = color;
                c.beginPath(); c.arc(px, py, r, 0, Math.PI * 2); c.fill();
                c.restore();
                c.fillStyle = '#071018'; c.font = 'bold ' + Math.round(r * 0.85) + 'px Inter, sans-serif';
                c.textAlign = 'center'; c.textBaseline = 'middle';
                c.fillText(String((i % 5) + 1), px, py);
                // nome breve
                c.fillStyle = 'rgba(255,255,255,.85)'; c.font = Math.round(W * 0.016) + 'px Inter, sans-serif';
                const nm = p.name.split(' ').pop().slice(0, 10);
                c.fillText(nm, px, py + r + W * 0.017);
                // stamina ring
                c.strokeStyle = p.stamina > 45 ? '#34d399' : '#fb7185';
                c.lineWidth = Math.max(1.5, W * 0.004);
                c.beginPath(); c.arc(px, py, r + W * 0.008, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.stamina / 100); c.stroke();
            });

            // palla
            if (this.ball) {
                const b = this.ball;
                b.t += dt;
                const k = Math.min(1, b.t / b.dur);
                const bx = x0 + (b.x0 + (b.x1 - b.x0) * k) * (x1 - x0);
                const by = y0 + (b.y0 + (b.y1 - b.y0) * k) * (y1 - y0) - Math.sin(k * Math.PI) * H * b.arc;
                c.fillStyle = '#fb923c'; c.shadowColor = '#fb923c'; c.shadowBlur = W * 0.02;
                c.beginPath(); c.arc(bx, by, W * 0.011, 0, Math.PI * 2); c.fill();
                c.shadowBlur = 0;
                if (k >= 1) this.ball = null;
            }
            if (this.flash > 0) {
                c.strokeStyle = 'rgba(253,230,138,' + this.flash + ')';
                c.lineWidth = W * 0.01;
                c.beginPath(); c.arc(x1 - (x1 - x0) * 0.16, cy, W * 0.05 * (2 - this.flash), 0, Math.PI * 2); c.stroke();
                this.flash = Math.max(0, this.flash - dt / 500);
            }
        }
    }

    window.NBACourt = Court;
})();
