/* Snake Neon — motore di gioco (Canvas-free, logica pura) */
(function () {
    'use strict';

    const DIRS = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };

    function makeRng(seed) {
        let s = (seed >>> 0) || 1;
        return function () {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function hashSeed(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < String(str).length; i++) {
            h ^= String(str).charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    class SnakeGame {
        constructor(opts) {
            this.opts = opts || {};
            this.hooks = this.opts.hooks || {};
            this.events = null;
            this.mode = null;
            this.phase = 'menu';
            this.overReason = '';
            this.result = '';
        }

        emit(name, a, b, c) {
            const fn = this.hooks[name];
            if (fn) fn(a, b, c);
        }

        start(mode, opts) {
            opts = opts || {};
            this.mode = mode;
            this.cols = mode.cols || 24;
            this.rows = mode.rows || 24;
            this.seedValue = opts.seed != null ? opts.seed : (Date.now() >>> 0);
            this.rng = makeRng(this.seedValue);
            this.daily = !!opts.daily;

            const cx = Math.floor(this.cols / 2);
            const cy = Math.floor(this.rows / 2);
            this.snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
            this.dir = DIRS.right;
            this.queue = [];
            this.food = [];
            this.obstacles = [];
            this.powerups = [];
            this.chaser = null;
            this.effects = { slow: 0, turbo: 0, shield: 0, magnet: 0, ghost: 0, blackout: 0 };
            this.modifiers = { speedFactor: 1, scoreMul: 1, shield: 0, ignoreSelf: false, magnet: false };
            this.score = 0;
            this.foodEaten = 0;
            this.combo = 0;
            this.comboTimer = 0;
            this.elapsed = 0;
            this.moveTimer = 0;
            this.baseInterval = mode.interval || 130;
            this.timeLeft = mode.timeLimit || 0;
            this.overReason = '';
            this.result = '';
            this.ai = null;

            if (mode.setup) mode.setup(this, opts);
            if (mode.ai) {
                this.ai = {
                    snake: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }],
                    dir: DIRS.right,
                    moveTimer: 0,
                    interval: (mode.aiInterval || 125),
                    score: 0,
                    alive: true
                };
            }
            this.spawnFood();
            if (this.events) this.events.reset(this);
            this.phase = 'playing';
            this.emit('onStart', this);
            return this;
        }

        pause() {
            if (this.phase === 'playing') { this.phase = 'paused'; this.emit('onPause', this); }
        }
        resume() {
            if (this.phase === 'paused') { this.phase = 'playing'; this.emit('onResume', this); }
        }
        togglePause() {
            if (this.phase === 'playing') this.pause();
            else if (this.phase === 'paused') this.resume();
        }
        toMenu() {
            this.phase = 'menu';
            this.emit('onMenu', this);
        }

        setDirection(x, y) {
            if (this.phase !== 'playing') return;
            const last = this.queue.length ? this.queue[this.queue.length - 1] : this.dir;
            if (last.x === -x && last.y === -y) return;
            if (last.x === x && last.y === y) return;
            if (this.queue.length < 2) this.queue.push({ x: x, y: y });
        }

        tick(dtMs) {
            if (this.phase !== 'playing') return;
            dtMs = Math.min(dtMs, 120);
            this.elapsed += dtMs;
            this.comboTimer = Math.max(0, this.comboTimer - dtMs);
            if (this.comboTimer === 0) this.combo = 0;

            if (this.events) this.events.update(this, dtMs);
            if (this.phase !== 'playing') return;

            if (this.mode.timeLimit) {
                this.timeLeft = Math.max(0, this.mode.timeLimit - this.elapsed / 1000);
                if (this.timeLeft <= 0) { this.finish('tempo'); return; }
            }

            const interval = this.currentInterval();
            this.moveTimer += dtMs;
            while (this.moveTimer >= interval) {
                this.moveTimer -= interval;
                this.move();
                if (this.phase !== 'playing') break;
            }
            if (this.phase === 'playing') this.updateAI(dtMs);
        }

        currentInterval() {
            let interval = this.baseInterval;
            if (this.mode.speedPerFood) interval = Math.max(55, interval * Math.pow(0.965, this.foodEaten));
            return interval / (this.modifiers.speedFactor || 1);
        }

        out(x, y) { return x < 0 || y < 0 || x >= this.cols || y >= this.rows; }

        occupied(x, y) {
            if (this.snake.some(function (s) { return s.x === x && s.y === y; })) return true;
            if (this.obstacles.some(function (o) { return o.x === x && o.y === y; })) return true;
            if (this.food.some(function (f) { return f.x === x && f.y === y; })) return true;
            if (this.powerups.some(function (p) { return p.x === x && p.y === y; })) return true;
            if (this.ai && this.ai.snake.some(function (s) { return s.x === x && s.y === y; })) return true;
            return false;
        }

        findFreeCell() {
            const cells = [];
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    if (!this.occupied(x, y)) cells.push({ x: x, y: y });
                }
            }
            if (!cells.length) return null;
            return cells[Math.floor(this.rng() * cells.length)];
        }

        spawnFood(type) {
            const cell = this.findFreeCell();
            if (!cell) { this.finish('vittoria'); return; }
            this.food.push({
                x: cell.x, y: cell.y,
                type: type || 'normal',
                value: type === 'golden' ? 50 : 10,
                ttl: type === 'golden' ? 10000 : 0
            });
        }

        fatal(reason) {
            if (this.modifiers.shield > 0) {
                this.modifiers.shield--;
                this.effects.shield = this.modifiers.shield;
                const safe = this.findFreeCell();
                if (safe) {
                    this.snake[0] = safe;
                    this.emit('onEffect', this, 'scudo');
                    return;
                }
            }
            this.finish(reason);
        }

        move() {
            const dir = this.queue.length ? this.queue.shift() : this.dir;
            this.dir = dir;
            const head = this.snake[0];
            let nx = head.x + dir.x;
            let ny = head.y + dir.y;
            if (this.mode.wrap) {
                nx = (nx + this.cols) % this.cols;
                ny = (ny + this.rows) % this.rows;
            } else if (this.out(nx, ny)) {
                this.fatal('muro');
                return;
            }

            const foodIdx = this.food.findIndex(function (f) { return f.x === nx && f.y === ny; });
            const willGrow = foodIdx >= 0;

            if (!this.modifiers.ignoreSelf) {
                const limit = willGrow ? this.snake.length : this.snake.length - 1;
                for (let i = 0; i < limit; i++) {
                    if (this.snake[i].x === nx && this.snake[i].y === ny) { this.fatal('corpo'); return; }
                }
            }
            if (this.obstacles.some(function (o) { return o.x === nx && o.y === ny; })) { this.fatal('muro'); return; }
            if (this.chaser && this.chaser.x === nx && this.chaser.y === ny) { this.fatal('inseguitore'); return; }
            if (this.ai && this.ai.alive) {
                for (let i = 0; i < this.ai.snake.length; i++) {
                    const seg = this.ai.snake[i];
                    if (seg.x === nx && seg.y === ny) {
                        if (i === 0) { this.fatal('avversario'); return; }
                    }
                }
            }

            this.snake.unshift({ x: nx, y: ny });
            if (willGrow) {
                const eaten = this.food.splice(foodIdx, 1)[0];
                this.eat(eaten);
            } else {
                this.snake.pop();
            }

            const powerIdx = this.powerups.findIndex(function (p) { return p.x === nx && p.y === ny; });
            if (powerIdx >= 0) {
                const power = this.powerups.splice(powerIdx, 1)[0];
                if (this.events) this.events.onPowerup(this, power);
            }
        }

        eat(food) {
            this.foodEaten++;
            this.combo++;
            this.comboTimer = 2200;
            let gained = food.value * (this.modifiers.scoreMul || 1);
            if (this.combo > 3) gained += Math.floor(this.combo / 3) * 5;
            this.score += gained;
            this.emit('onEat', this, food, gained);
            if (this.events) this.events.onEat(this, food);
            this.spawnFood();
        }

        updateAI(dtMs) {
            const ai = this.ai;
            if (!ai || !ai.alive || this.phase !== 'playing') return;
            ai.moveTimer += dtMs;
            if (ai.moveTimer < ai.interval) return;
            ai.moveTimer -= ai.interval;

            const head = ai.snake[0];
            let target = null, bestDist = Infinity;
            this.food.forEach(function (f) {
                const d = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
                if (d < bestDist) { bestDist = d; target = f; }
            });
            const opts = [DIRS.up, DIRS.down, DIRS.left, DIRS.right].filter(function (d) {
                return !(d.x === -ai.dir.x && d.y === -ai.dir.y);
            });
            let best = null, bestScore = -Infinity;
            const self = this;
            opts.forEach(function (d) {
                let nx = head.x + d.x, ny = head.y + d.y;
                if (self.mode.wrap) { nx = (nx + self.cols) % self.cols; ny = (ny + self.rows) % self.rows; }
                if (self.out(nx, ny)) { bestScore = Math.max(bestScore, -1000); return; }
                let sc = target ? -(Math.abs(nx - target.x) + Math.abs(ny - target.y)) : -Math.abs(nx - self.cols / 2);
                if (self.obstacles.some(function (o) { return o.x === nx && o.y === ny; })) sc -= 500;
                if (self.snake.some(function (s) { return s.x === nx && s.y === ny; })) sc -= 400;
                if (ai.snake.slice(0, -1).some(function (s) { return s.x === nx && s.y === ny; })) sc -= 300;
                if (self.chaser && self.chaser.x === nx && self.chaser.y === ny) sc -= 300;
                if (sc > bestScore) { bestScore = sc; best = d; }
            });
            if (!best) best = ai.dir;
            ai.dir = best;
            let nx = head.x + best.x, ny = head.y + best.y;
            if (this.mode.wrap) { nx = (nx + this.cols) % this.cols; ny = (ny + this.rows) % this.rows; }
            const hitPlayer = this.snake.some(function (s) { return s.x === nx && s.y === ny; });
            const hitSelf = ai.snake.slice(0, -1).some(function (s) { return s.x === nx && s.y === ny; });
            if (hitSelf || this.obstacles.some(function (o) { return o.x === nx && o.y === ny; })) {
                ai.alive = false;
                this.emit('onEffect', this, 'avversario-out');
                this.finish('vittoria');
                return;
            }
            ai.snake.unshift({ x: nx, y: ny });
            const idx = this.food.findIndex(function (f) { return f.x === nx && f.y === ny; });
            if (idx >= 0) {
                this.food.splice(idx, 1);
                ai.score += 10;
                this.spawnFood();
                this.emit('onAiEat', this);
            } else ai.snake.pop();
            if (hitPlayer) this.fatal('avversario');
        }

        finish(reason) {
            if (this.phase === 'over') return;
            this.phase = 'over';
            this.overReason = reason;
            if (this.mode && this.mode.ai) {
                this.result = (reason === 'avversario') ? 'sconfitta' : (this.ai && !this.ai.alive ? 'vittoria' : 'sconfitta');
            } else {
                this.result = 'fine';
            }
            this.emit('onOver', this, reason);
        }
    }

    window.SnakeEngine = {
        SnakeGame: SnakeGame,
        DIRS: DIRS,
        makeRng: makeRng,
        hashSeed: hashSeed
    };
})();
