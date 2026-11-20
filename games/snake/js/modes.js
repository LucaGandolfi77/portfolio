/* Snake Neon — modalità di gioco */
(function () {
    'use strict';

    function obstacleLayout(game, level) {
        const lv = Math.max(1, level || 1);
        const count = Math.min(60, 8 + lv * 5);
        const cx = Math.floor(game.cols / 2);
        const cy = Math.floor(game.rows / 2);
        let placed = 0, guard = 0;
        while (placed < count && guard++ < 500) {
            const x = Math.floor(game.rng() * game.cols);
            const y = Math.floor(game.rng() * game.rows);
            if (Math.abs(x - cx) <= 3 && Math.abs(y - cy) <= 3) continue;
            if (game.obstacles.some(function (o) { return o.x === x && o.y === y; })) continue;
            game.obstacles.push({ x: x, y: y });
            placed++;
        }
    }

    const MODES = [
        {
            id: 'classic', name: 'Classica', icon: '🟢',
            desc: 'I muri avvolgono: esci da un lato e rientri dall\'altro.',
            cols: 24, rows: 24, wrap: true, selfCollision: true,
            interval: 130, timeLimit: 0, speedPerFood: false, ai: false
        },
        {
            id: 'arcade', name: 'Arcade', icon: '🧱',
            desc: 'I muri uccidono. Pochi errori e finisce.',
            cols: 24, rows: 24, wrap: false, selfCollision: true,
            interval: 120, timeLimit: 0, speedPerFood: false, ai: false
        },
        {
            id: 'sprint', name: 'Sprint 60s', icon: '⏱️',
            desc: 'Sessanta secondi per mangiare più cibo possibile.',
            cols: 24, rows: 24, wrap: false, selfCollision: true,
            interval: 105, timeLimit: 60, speedPerFood: false, ai: false
        },
        {
            id: 'metro', name: 'Metro', icon: '🚀',
            desc: 'Ogni pasto aumenta la velocità. Fino al limite.',
            cols: 24, rows: 24, wrap: true, selfCollision: true,
            interval: 145, timeLimit: 0, speedPerFood: true, ai: false
        },
        {
            id: 'zen', name: 'Zen', icon: '🧘',
            desc: 'Nessuna collisione: solo il piacere di scivolare.',
            cols: 24, rows: 24, wrap: true, selfCollision: false,
            interval: 175, timeLimit: 0, speedPerFood: false, ai: false,
            disableEvents: true
        },
        {
            id: 'battle', name: 'Battle', icon: '⚔️',
            desc: 'Un serpente CPU ruba il tuo cibo. Chi mangia di più vince.',
            cols: 24, rows: 24, wrap: true, selfCollision: true,
            interval: 118, timeLimit: 0, speedPerFood: false, ai: true,
            aiInterval: 125
        },
        {
            id: 'obstacles', name: 'Ostacoli', icon: '🧩',
            desc: 'Livelli con muri fissi sempre più densi.',
            cols: 24, rows: 24, wrap: false, selfCollision: true,
            interval: 120, timeLimit: 0, speedPerFood: false, ai: false,
            setup: function (game, opts) { obstacleLayout(game, opts.level || 1); }
        }
    ];

    const byId = {};
    MODES.forEach(function (m) { byId[m.id] = m; });

    window.SnakeModes = {
        list: MODES,
        get: function (id) { return byId[id] || MODES[0]; },
        has: function (id) { return !!byId[id]; }
    };
})();
