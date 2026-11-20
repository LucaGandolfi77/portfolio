/* Slot Neon — macchine, simboli, payline */
(function () {
    'use strict';

    const S = function (id, glyph, name, mult, weight, kind) {
        return { id: id, glyph: glyph, name: name, mult: mult, weight: weight, kind: kind || 'normal' };
    };

    const MACHINES = [
        {
            id: 'fruit', name: 'Frutta Arcana', icon: '🍒', tagline: 'Il primo varco verso la Sorte',
            colors: ['#fb7185', '#facc15'], cols: 5, rows: 3, volatility: 'bassa',
            unlockLevel: 1, multiplier: 1, scatterCount: 3, freeSpins: 8,
            cascade: false, expandingWild: false,
            symbols: [
                S('cherry', '🍒', 'Ciliegia', 2, 22), S('lemon', '🍋', 'Limone', 2, 20),
                S('orange', '🍊', 'Arancia', 3, 16), S('strawberry', '🍓', 'Fragola', 4, 12),
                S('grape', '🍇', 'Uva', 5, 9), S('diamond', '💎', 'Diamante', 8, 5),
                S('wild', '🌟', 'Jolly', 6, 6, 'wild'), S('scatter', '🎁', 'Regalo', 0, 4, 'scatter')
            ]
        },
        {
            id: 'gems', name: 'Gioielli Stellari', icon: '💠', tagline: 'Le stelle si cristallizzano',
            colors: ['#38bdf8', '#a78bfa'], cols: 5, rows: 3, volatility: 'media',
            unlockLevel: 3, multiplier: 2, scatterCount: 3, freeSpins: 10,
            cascade: false, expandingWild: true,
            symbols: [
                S('topaz', '🔶', 'Topazio', 2, 21), S('emerald', '🟩', 'Smeraldo', 3, 17),
                S('sapphire', '🔷', 'Zaffiro', 4, 13), S('amethyst', '🟣', 'Ametista', 5, 10),
                S('ruby', '🔴', 'Rubino', 7, 6), S('prism', '💠', 'Prisma', 10, 4),
                S('wild', '✨', 'Jolly', 8, 6, 'wild'), S('scatter', '🌌', 'Nebulosa', 0, 4, 'scatter')
            ]
        },
        {
            id: 'tarot', name: 'Tarocchi del Fato', icon: '🔮', tagline: 'Ogni carta è una scelta',
            colors: ['#c084fc', '#f0abfc'], cols: 5, rows: 3, volatility: 'alta',
            unlockLevel: 5, multiplier: 3, scatterCount: 3, freeSpins: 12,
            cascade: false, expandingWild: false,
            symbols: [
                S('fool', '🃏', 'Matto', 2, 22), S('moon', '🌙', 'Luna', 3, 17),
                S('sun', '☀️', 'Sole', 4, 13), S('star', '⭐', 'Stella', 5, 10),
                S('tower', '🗼', 'Torre', 7, 6), S('world', '🌍', 'Mondo', 11, 4),
                S('wild', '🔮', 'Jolly', 9, 6, 'wild'), S('scatter', '🍀', 'Fortuna', 0, 4, 'scatter')
            ]
        },
        {
            id: 'casino', name: 'Catene di Casino', icon: '7️⃣', tagline: 'Dove il rischio è tutto',
            colors: ['#ef4444', '#fbbf24'], cols: 5, rows: 3, volatility: 'altissima',
            unlockLevel: 8, multiplier: 5, scatterCount: 3, freeSpins: 12,
            cascade: false, expandingWild: true,
            symbols: [
                S('bell', '🔔', 'Campanella', 2, 22), S('coin', '🪙', 'Moneta', 3, 18),
                S('card', '♠️', 'Picca', 4, 14), S('chip', '🎰', 'Fiche', 5, 10),
                S('cash', '💵', 'Banconota', 8, 6), S('seven', '7️⃣', 'Sette', 15, 3),
                S('wild', '💰', 'Jolly', 10, 6, 'wild'), S('scatter', '🍀', 'Portafortuna', 0, 4, 'scatter')
            ]
        },
        {
            id: 'garden', name: 'Giardino Incantato', icon: '🌸', tagline: 'Le fate riscrivono i fiori',
            colors: ['#4ade80', '#f9a8d4'], cols: 5, rows: 3, volatility: 'media',
            unlockLevel: 11, multiplier: 2, scatterCount: 3, freeSpins: 10,
            cascade: true, expandingWild: false,
            symbols: [
                S('leaf', '🍃', 'Foglia', 2, 22), S('flower', '🌸', 'Fiore', 3, 18),
                S('butterfly', '🦋', 'Farfalla', 4, 13), S('moonflower', '🌼', 'Fiore Luna', 5, 10),
                S('fairy', '🧚', 'Fata', 8, 6), S('unicorn', '🦄', 'Unicorno', 12, 3),
                S('wild', '✨', 'Jolly', 8, 6, 'wild'), S('scatter', '🌙', 'Luna', 0, 4, 'scatter')
            ]
        },
        {
            id: 'heart', name: 'Cuore della Sorte', icon: '👑', tagline: 'Il centro di ogni destino',
            colors: ['#fbbf24', '#f472b6'], cols: 5, rows: 3, volatility: 'ultra',
            unlockLevel: 16, multiplier: 10, scatterCount: 3, freeSpins: 15,
            cascade: true, expandingWild: true,
            symbols: [
                S('spark', '💫', 'Scintilla', 2, 21), S('heart', '💖', 'Cuore', 3, 17),
                S('crown', '👑', 'Corona', 5, 12), S('phoenix', '🔥', 'Fenice', 7, 9),
                S('oracle', '🔮', 'Oracolo', 10, 6), S('infinity', '♾️', 'Infinito', 20, 2),
                S('wild', '🌟', 'Jolly', 12, 6, 'wild'), S('scatter', '🎁', 'Scrigno', 0, 4, 'scatter')
            ]
        }
    ];

    const byId = {};
    MACHINES.forEach(function (m) { byId[m.id] = m; });

    function randomSymbol(machine, rng) {
        return window.SlotRng.weightedPick(rng, machine.symbols);
    }

    function makeGrid(machine, rng) {
        const grid = [];
        for (let c = 0; c < machine.cols; c++) {
            const col = [];
            for (let r = 0; r < machine.rows; r++) col.push(randomSymbol(machine, rng));
            grid.push(col);
        }
        return grid;
    }

    function evaluateGrid(grid, machine, bet) {
        const lines = [];
        let total = 0;
        const wild = machine.symbols.find(function (s) { return s.kind === 'wild'; }) || machine.symbols[0];
        for (let r = 0; r < machine.rows; r++) {
            let base = null, count = 0, start = 0, best = { count: 0, start: 0, symbol: wild };
            for (let c = 0; c <= machine.cols; c++) {
                const s = c < machine.cols ? grid[c][r] : null;
                const isWild = !!(s && s.kind === 'wild');
                const ok = !!s && s.kind !== 'scatter' && (isWild || !base || s.id === base.id);
                if (ok) {
                    if (!base && !isWild) base = s;
                    if (count === 0) start = c;
                    count++;
                } else {
                    if (count >= 3 && count > best.count) best = { count: count, start: start, symbol: base || wild };
                    base = null; count = 0;
                }
            }
            if (best.count >= 3) {
                const payout = Math.round(bet * (best.symbol.mult || 2) * (best.count - 2) * (machine.multiplier || 1));
                lines.push({ row: r, start: best.start, count: best.count, symbol: best.symbol.id, glyph: best.symbol.glyph, payout: payout });
                total += payout;
            }
        }
        return { lines: lines, total: total };
    }

    function scatterCount(grid) {
        let n = 0;
        grid.forEach(function (col) { col.forEach(function (s) { if (s.kind === 'scatter') n++; }); });
        return n;
    }

    function jackpotCheck(grid, machine, bet) {
        const top = machine.symbols.filter(function (s) { return s.kind === 'normal'; }).sort(function (a, b) { return b.mult - a.mult; })[0];
        if (!top) return 0;
        let all = true;
        grid.forEach(function (col) {
            col.forEach(function (s) {
                if (s.id !== top.id && s.kind !== 'wild') all = false;
            });
        });
        return all ? Math.round(bet * 100 * (machine.multiplier || 1)) : 0;
    }

    function replaceCells(grid, lines, machine, rng) {
        lines.forEach(function (line) {
            for (let k = 0; k < line.count; k++) {
                const c = (line.start + k) % machine.cols;
                grid[c][line.row] = randomSymbol(machine, rng);
            }
        });
    }

    function spin(machine, bet, rng, opts) {
        opts = opts || {};
        const grid = makeGrid(machine, rng);
        let result = evaluateGrid(grid, machine, bet);
        let lines = result.lines.slice();
        let win = result.total;
        let cascades = 0;

        if (machine.cascade) {
            for (let i = 0; i < 3; i++) {
                if (!result.lines.length) break;
                replaceCells(grid, result.lines, machine, rng);
                result = evaluateGrid(grid, machine, bet);
                if (!result.lines.length) break;
                cascades++;
                const factor = 1 + cascades * 0.5;
                result.lines.forEach(function (l) { l.payout = Math.round(l.payout * factor); l.cascade = cascades; });
                lines = lines.concat(result.lines);
                win += result.total;
            }
        }

        const scatters = scatterCount(grid);
        const freeSpins = scatters >= machine.scatterCount ? machine.freeSpins : 0;
        const jackpot = jackpotCheck(grid, machine, bet);
        win += jackpot;
        win = Math.round(win * (opts.luck || 1));

        return {
            machine: machine.id, grid: grid, lines: lines, win: win,
            scatters: scatters, freeSpins: freeSpins, jackpot: jackpot,
            cascades: cascades, bet: bet
        };
    }

    window.SlotMachines = {
        list: MACHINES,
        get: function (id) { return byId[id] || MACHINES[0]; },
        has: function (id) { return !!byId[id]; },
        spin: spin,
        evaluateGrid: evaluateGrid,
        makeGrid: makeGrid
    };
})();
