/* Snake Neon — power-up ed eventi live */
(function () {
    'use strict';

    const POWERUPS = {
        slow:     { icon: '🐢', name: 'Slow-mo', color: '#38bdf8', ms: 6000 },
        turbo:    { icon: '⚡', name: 'Turbo ×2', color: '#facc15', ms: 8000 },
        shield:   { icon: '🛡️', name: 'Scudo', color: '#60a5fa', ms: 0 },
        magnet:   { icon: '🧲', name: 'Magnete', color: '#f472b6', ms: 7000 },
        grow:     { icon: '📈', name: 'Crescita', color: '#4ade80', ms: 0 },
        ghost:    { icon: '👻', name: 'Fantasma', color: '#c084fc', ms: 6000 },
        teleport: { icon: '🌀', name: 'Teleport', color: '#22d3ee', ms: 0 }
    };

    function recompute(game) {
        const e = game.effects, m = game.modifiers;
        m.speedFactor = e.slow > 0 ? 0.68 : (e.turbo > 0 ? 1.22 : 1);
        m.scoreMul = e.turbo > 0 ? 2 : 1;
        m.shield = e.shield;
        m.ignoreSelf = game.mode.selfCollision === false || e.ghost > 0;
        m.magnet = e.magnet > 0;
    }

    function spawnPowerup(game) {
        const cell = game.findFreeCell();
        if (!cell) return;
        const keys = Object.keys(POWERUPS);
        const type = keys[Math.floor(game.rng() * keys.length)];
        game.powerups.push({ x: cell.x, y: cell.y, type: type });
    }

    function moveChaser(game) {
        const c = game.chaser, head = game.snake[0];
        const dx = head.x - c.x, dy = head.y - c.y;
        if (dx === 0 && dy === 0) { game.fatal('inseguitore'); return; }
        if (Math.abs(dx) >= Math.abs(dy)) c.x += Math.sign(dx);
        else c.y += Math.sign(dy);
        if (game.mode.wrap) {
            c.x = (c.x + game.cols) % game.cols;
            c.y = (c.y + game.rows) % game.rows;
        } else if (game.out(c.x, c.y)) {
            c.x = Math.max(0, Math.min(game.cols - 1, c.x));
            c.y = Math.max(0, Math.min(game.rows - 1, c.y));
        }
        if (c.x === head.x && c.y === head.y) game.fatal('inseguitore');
    }

    function pullFood(game) {
        const head = game.snake[0];
        let best = null, bestDist = Infinity;
        game.food.forEach(function (f) {
            const d = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
            if (d > 1 && d < bestDist) { bestDist = d; best = f; }
        });
        if (!best) return;
        const dx = Math.sign(head.x - best.x), dy = Math.sign(head.y - best.y);
        const options = dx ? [{ x: best.x + dx, y: best.y }, { x: best.x, y: best.y + dy }]
                           : [{ x: best.x, y: best.y + dy }, { x: best.x + dx, y: best.y }];
        options.forEach(function (p) {
            if (best.moved) return;
            if (game.mode.wrap) { p.x = (p.x + game.cols) % game.cols; p.y = (p.y + game.rows) % game.rows; }
            if (!game.out(p.x, p.y) && !game.occupied(p.x, p.y)) {
                best.x = p.x; best.y = p.y; best.moved = true;
            }
        });
    }

    function triggerEvent(game) {
        const roll = game.rng();
        if (roll < 0.30) {
            game.spawnFood('golden');
            game.spawnFood('golden');
            game.emit('onBanner', '🪙 GOLD RUSH — cibo ×5!', 'gold');
        } else if (roll < 0.55) {
            game.effects.blackout = 8000;
            game.emit('onBanner', '🌑 BLACKOUT — visione ridotta', 'dark');
        } else if (roll < 0.80) {
            let placed = 0, guard = 0;
            while (placed < 5 && guard++ < 120) {
                const cell = game.findFreeCell();
                if (!cell) break;
                game.obstacles.push(cell);
                placed++;
            }
            game.emit('onBanner', '🌋 TERREMOTO — nuovi muri!', 'quake');
        } else {
            let far = null, farDist = -1;
            for (let y = 0; y < game.rows; y++) {
                for (let x = 0; x < game.cols; x++) {
                    const d = Math.abs(x - game.snake[0].x) + Math.abs(y - game.snake[0].y);
                    if (d > farDist && !game.occupied(x, y)) { farDist = d; far = { x: x, y: y }; }
                }
            }
            if (far) { game.chaser = { x: far.x, y: far.y, moveTimer: 0 }; }
            game.emit('onBanner', '👾 INSEGUITORE — scappa!', 'chase');
        }
        recompute(game);
    }

    const SnakeEvents = {
        POWERUPS: POWERUPS,
        reset: function (game) {
            game.eventTimer = 12000 + game.rng() * 6000;
            game.powerTimer = 7000 + game.rng() * 5000;
            game.magnetTimer = 0;
            recompute(game);
        },
        update: function (game, dtMs) {
            let changed = false;
            Object.keys(game.effects).forEach(function (k) {
                if (game.effects[k] > 0) {
                    game.effects[k] = Math.max(0, game.effects[k] - dtMs);
                    if (game.effects[k] === 0) changed = true;
                }
            });
            if (game.chaser) {
                game.chaser.moveTimer += dtMs;
                if (game.chaser.moveTimer >= 320) { game.chaser.moveTimer = 0; moveChaser(game); }
            }
            for (let i = game.food.length - 1; i >= 0; i--) {
                const f = game.food[i];
                if (f.ttl > 0) {
                    f.ttl -= dtMs;
                    if (f.ttl <= 0) { game.food.splice(i, 1); game.emit('onBanner', '🕐 Cibo dorato scaduto', 'gold'); }
                }
            }
            if (game.effects.magnet > 0) {
                game.magnetTimer += dtMs;
                if (game.magnetTimer >= 240) { game.magnetTimer = 0; pullFood(game); }
            }
            if (changed) recompute(game);
            if (game.phase !== 'playing') return;
            if (!game.mode.disableEvents && game.elapsed >= game.eventTimer) {
                triggerEvent(game);
                game.eventTimer = game.elapsed + 15000 + game.rng() * 8000;
            }
            if (!game.mode.disableEvents && game.powerups.length < 2 && game.elapsed >= game.powerTimer) {
                spawnPowerup(game);
                game.powerTimer = game.elapsed + 9000 + game.rng() * 6000;
            }
        },
        onEat: function (game, food) {
            if (food.type === 'golden') {
                game.score += 40;
                game.emit('onEffect', game, 'golden');
                game.emit('onBanner', '🪙 +50 BONUS!', 'gold');
            }
        },
        onPowerup: function (game, power) {
            const def = POWERUPS[power.type];
            if (!def) return;
            switch (power.type) {
                case 'shield': game.effects.shield = Math.min(2, game.effects.shield + 1); break;
                case 'grow':
                    for (let i = 0; i < 3; i++) {
                        const tail = game.snake[game.snake.length - 1];
                        game.snake.push({ x: tail.x, y: tail.y });
                    }
                    break;
                case 'teleport': {
                    const cell = game.findFreeCell();
                    if (cell) game.snake[0] = cell;
                    break;
                }
                default: game.effects[power.type] = def.ms;
            }
            recompute(game);
            game.emit('onEffect', game, power.type);
            game.emit('onBanner', def.icon + ' ' + def.name + '!', 'power');
        },
        recompute: recompute
    };

    window.SnakeEvents = SnakeEvents;
})();
