/* Snake Neon — interfaccia, rendering Canvas, input */
(function () {
    'use strict';

    const DICT = {
        it: {
            score: 'Punteggio', best: 'Record', length: 'Lunghezza', mode: 'Modalità',
            play: 'Gioca', daily: 'Sfida giornaliera', skins: 'Skin', stats: 'Statistiche',
            settings: 'Impostazioni', install: 'Installa app', pause: 'Pausa', resume: 'Riprendi',
            menu: 'Menu', retry: 'Riprova', gameOver: 'Fine partita', back: 'Portfolio',
            sound: 'Audio', reduced: 'Effetti ridotti', language: 'Lingua',
            records: 'Classifica', achievements: 'Obiettivi', noRecords: 'Nessun punteggio registrato.',
            level: 'Livello', xp: 'XP', games: 'Partite', food: 'Cibo mangiato',
            reason_muro: 'Hai urtato un muro', reason_corpo: 'Hai morso il tuo corpo',
            reason_tempo: 'Tempo scaduto!', reason_vittoria: 'Griglia piena — vittoria!',
            reason_inseguitore: 'Ti ha preso l\'inseguitore',
            reason_avversario: 'Scontro con l\'avversario',
            win: 'Hai vinto!', lose: 'La CPU ha vinto!',
            recordNew: 'Nuovo record!', tapStart: 'Scegli una modalità per iniziare',
            powerups: 'Power-up', events: 'Eventi live', off: 'Disattivati', on: 'Attivi'
        },
        en: {
            score: 'Score', best: 'Best', length: 'Length', mode: 'Mode',
            play: 'Play', daily: 'Daily challenge', skins: 'Skins', stats: 'Stats',
            settings: 'Settings', install: 'Install app', pause: 'Pause', resume: 'Resume',
            menu: 'Menu', retry: 'Retry', gameOver: 'Game Over', back: 'Portfolio',
            sound: 'Sound', reduced: 'Reduced effects', language: 'Language',
            records: 'Leaderboard', achievements: 'Achievements', noRecords: 'No scores yet.',
            level: 'Level', xp: 'XP', games: 'Games', food: 'Food eaten',
            reason_muro: 'You hit a wall', reason_corpo: 'You bit yourself',
            reason_tempo: 'Time is up!', reason_vittoria: 'Board full — you win!',
            reason_inseguitore: 'The chaser caught you',
            reason_avversario: 'Collision with the opponent',
            win: 'You win!', lose: 'CPU wins!',
            recordNew: 'New record!', tapStart: 'Pick a mode to start',
            powerups: 'Power-ups', events: 'Live events', off: 'Off', on: 'On'
        }
    };

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    const SnakeUI = {
        game: null,
        events: null,
        ctx: null,
        canvas: null,
        particles: [],
        shake: 0,
        bannerTimer: null,
        toastTimer: null,
        deferredPrompt: null,
        lang: 'it',
        lastFrame: 0,
        lastHud: {},

        init: function (game, events) {
            this.game = game;
            this.events = events;
            this.canvas = document.getElementById('board');
            this.ctx = this.canvas.getContext('2d');
            this.lang = (window.SnakeStorage.data.settings.lang === 'en') ? 'en' : 'it';
            this.buildMenu();
            this.bind();
            this.resize();
            this.applyLang();
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
            return this;
        },

        t: function (key) {
            const parts = key.split('.');
            let val = window.translations;
            for (let i = 0; i < parts.length; i++) { val = val && val[parts[i]]; }
            if (typeof val === 'string') return val;
            const sub = window.translations && window.translations.games && window.translations.games.snake;
            if (sub && typeof sub[key] === 'string') return sub[key];
            return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key;
        },

        applyLang: function () {
            document.querySelectorAll('[data-i18n]').forEach(function (el) {
                el.textContent = SnakeUI.t(el.dataset.i18n);
            });
            this.buildMenu();
        },

        el: function (id) { return document.getElementById(id); },

        buildMenu: function () {
            const grid = this.el('mode-grid');
            if (!grid) return;
            const self = this;
            grid.innerHTML = '';
            window.SnakeModes.list.forEach(function (mode) {
                const card = document.createElement('button');
                card.type = 'button';
                card.className = 'mode-card';
                card.dataset.mode = mode.id;
                card.innerHTML = '<span class="mode-icon">' + mode.icon + '</span>' +
                    '<span class="mode-name">' + mode.name + '</span>' +
                    '<span class="mode-desc">' + mode.desc + '</span>' +
                    '<span class="mode-best">🏆 ' + window.SnakeStorage.best(mode.id) + '</span>';
                card.addEventListener('click', function () { self.start(mode.id); });
                grid.appendChild(card);
            });
        },

        start: function (modeId, opts) {
            const mode = window.SnakeModes.get(modeId);
            this.particles = [];
            this.shake = 0;
            this.closeAll();
            window.SnakeAudio.init();
            window.SnakeAudio.click();
            this.game.start(mode, opts);
            this.el('hud-mode').textContent = mode.icon + ' ' + mode.name;
            this.el('board-wrap').classList.remove('blurred');
        },

        closeAll: function () {
            document.querySelectorAll('.modal').forEach(function (m) { m.classList.add('hidden'); });
        },
        openModal: function (id) {
            this.closeAll();
            this.el(id).classList.remove('hidden');
        },

        showPanel: function (kind) {
            const body = this.el('panel-body');
            const title = this.el('panel-title');
            const S = window.SnakeStorage;
            let html = '';
            if (kind === 'settings') {
                title.textContent = this.t('settings');
                html = '<label class="switch-row"><span>' + this.t('sound') + '</span><input type="checkbox" id="opt-sound" ' + (S.data.settings.sound ? 'checked' : '') + '></label>' +
                    '<label class="switch-row"><span>' + this.t('reduced') + '</span><input type="checkbox" id="opt-reduced" ' + (S.data.settings.reducedFx ? 'checked' : '') + '></label>' +
                    '<label class="switch-row"><span>' + this.t('language') + '</span><select id="opt-lang"><option value="it" ' + (this.lang === 'it' ? 'selected' : '') + '>🇮🇹 Italiano</option><option value="en" ' + (this.lang === 'en' ? 'selected' : '') + '>🇬🇧 English</option></select></label>';
            } else if (kind === 'skins') {
                title.textContent = this.t('skins');
                html = '<div class="skin-grid">';
                Object.keys(S.SKINS).forEach(function (id) {
                    const sk = S.SKINS[id];
                    const unlocked = S.data.unlockedSkins.indexOf(id) >= 0;
                    const active = S.data.settings.skin === id;
                    const need = id === 'ice' ? 100 : id === 'ember' ? 250 : id === 'gold' ? 500 : id === 'violet' ? 800 : 0;
                    html += '<button class="skin-card ' + (active ? 'active' : '') + '" data-skin="' + id + '" ' + (unlocked ? '' : 'data-locked="' + need + '"') + '>' +
                        '<span class="skin-dot" style="background:' + sk.body + ';box-shadow:0 0 12px ' + sk.glow + '"></span>' +
                        '<span>' + sk.name + '</span>' +
                        '<small>' + (unlocked ? (active ? '✓' : 'OK') : need + ' XP') + '</small></button>';
                });
                html += '</div>';
            } else if (kind === 'stats') {
                title.textContent = this.t('stats');
                const st = S.data.stats;
                html = '<div class="stat-list"><div><span>' + this.t('level') + '</span><b>' + S.level() + '</b></div>' +
                    '<div><span>' + this.t('xp') + '</span><b>' + st.xp + '</b></div>' +
                    '<div><span>' + this.t('games') + '</span><b>' + st.games + '</b></div>' +
                    '<div><span>' + this.t('food') + '</span><b>' + st.totalFood + '</b></div></div>';
                html += '<h4>' + this.t('achievements') + '</h4><div class="ach-grid">';
                Object.keys(S.ACHIEVEMENTS).forEach(function (id) {
                    const a = S.ACHIEVEMENTS[id];
                    const got = S.has(id);
                    html += '<div class="ach ' + (got ? 'got' : '') + '"><span>' + a.icon + '</span><b>' + a.name + '</b><small>' + a.desc + '</small></div>';
                });
                html += '</div>';
            } else if (kind === 'records') {
                title.textContent = this.t('records');
                const keys = Object.keys(S.data.leaderboard);
                if (!keys.length) html = '<p class="empty">' + this.t('noRecords') + '</p>';
                keys.forEach(function (key) {
                    html += '<h4>' + key + '</h4><ol class="records-list">';
                    S.leaderboard(key).forEach(function (e) {
                        html += '<li><span>' + e.name + '</span><b>' + e.score + '</b></li>';
                    });
                    html += '</ol>';
                });
            }
            body.innerHTML = html;
            this.openModal('panel-modal');

            const self = this;
            const sound = this.el('opt-sound');
            if (sound) sound.addEventListener('change', function (e) { S.set('sound', e.target.checked); window.SnakeAudio.enabled = e.target.checked; if (e.target.checked) window.SnakeAudio.click(); });
            const reduced = this.el('opt-reduced');
            if (reduced) reduced.addEventListener('change', function (e) { S.set('reducedFx', e.target.checked); });
            const lang = this.el('opt-lang');
            if (lang) lang.addEventListener('change', function (e) { S.set('lang', e.target.value); self.lang = e.target.value; self.applyLang(); });
            document.querySelectorAll('.skin-card').forEach(function (card) {
                card.addEventListener('click', function () {
                    const id = card.dataset.skin;
                    const locked = card.dataset.locked;
                    if (locked && S.data.stats.xp < Number(locked)) { self.toast('🔒 ' + locked + ' XP'); return; }
                    if (S.data.unlockedSkins.indexOf(id) < 0) S.data.unlockedSkins.push(id);
                    S.set('skin', id);
                    window.SnakeAudio.click();
                    self.showPanel('skins');
                });
            });
        },

        banner: function (text, kind) {
            const el = this.el('banner');
            el.textContent = text;
            el.className = 'banner show ' + (kind || '');
            clearTimeout(this.bannerTimer);
            this.bannerTimer = setTimeout(function () { el.className = 'banner'; }, 2200);
        },

        toast: function (text) {
            const el = this.el('toast');
            el.textContent = text;
            el.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1800);
        },

        burst: function (x, y, color, n) {
            if (window.SnakeStorage.data.settings.reducedFx) return;
            const cell = this.cellSize();
            for (let i = 0; i < (n || 12); i++) {
                const a = Math.random() * Math.PI * 2;
                const sp = 0.8 + Math.random() * 2.4;
                this.particles.push({
                    x: (x + 0.5) * cell, y: (y + 0.5) * cell,
                    vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
                    life: 1, color: color
                });
            }
        },

        cellSize: function () { return this.canvas.width / (this.game.cols || 24); },

        resize: function () {
            const wrap = this.el('board-wrap');
            if (!wrap) return;
            const size = Math.floor(Math.min(wrap.clientWidth, window.innerHeight * 0.58, 620));
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.style.width = size + 'px';
            this.canvas.style.height = size + 'px';
            this.canvas.width = Math.floor(size * dpr);
            this.canvas.height = Math.floor(size * dpr);
        },

        roundRect: function (x, y, w, h, r) {
            const c = this.ctx;
            c.beginPath();
            c.moveTo(x + r, y);
            c.arcTo(x + w, y, x + w, y + h, r);
            c.arcTo(x + w, y + h, x, y + h, r);
            c.arcTo(x, y + h, x, y, r);
            c.arcTo(x, y, x + w, y, r);
            c.closePath();
        },

        draw: function (now, dt) {
            const g = this.game, c = this.ctx, S = window.SnakeStorage, self = this;
            if (!c || !g) return;
            const size = this.canvas.width;
            const cs = size / (g.cols || 24);
            c.clearRect(0, 0, size, size);

            c.save();
            if (this.shake > 0 && !S.data.settings.reducedFx) {
                c.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
                this.shake *= 0.9;
                if (this.shake < 0.4) this.shake = 0;
            }

            // griglia
            c.strokeStyle = 'rgba(0,255,180,0.055)';
            c.lineWidth = Math.max(1, cs * 0.02);
            for (let i = 0; i <= g.cols; i++) {
                c.beginPath(); c.moveTo(i * cs, 0); c.lineTo(i * cs, size); c.stroke();
                c.beginPath(); c.moveTo(0, i * cs); c.lineTo(size, i * cs); c.stroke();
            }

            // ostacoli
            c.fillStyle = 'rgba(148,163,184,0.30)';
            (g.obstacles || []).forEach(function (o) {
                c.fillRect(o.x * cs + cs * 0.1, o.y * cs + cs * 0.1, cs * 0.8, cs * 0.8);
            });

            // cibo
            (g.food || []).forEach(function (f) {
                const pulse = 1 + Math.sin(now / 180 + f.x) * 0.08;
                const r = cs * 0.30 * pulse;
                const grad = c.createRadialGradient((f.x + 0.5) * cs, (f.y + 0.5) * cs, 0, (f.x + 0.5) * cs, (f.y + 0.5) * cs, r * 1.9);
                if (f.type === 'golden') { grad.addColorStop(0, '#fff7c2'); grad.addColorStop(0.5, '#fbbf24'); grad.addColorStop(1, 'rgba(251,191,36,0)'); }
                else { grad.addColorStop(0, '#ffe4e6'); grad.addColorStop(0.5, '#fb7185'); grad.addColorStop(1, 'rgba(251,113,133,0)'); }
                c.fillStyle = grad;
                c.beginPath(); c.arc((f.x + 0.5) * cs, (f.y + 0.5) * cs, r * 1.9, 0, Math.PI * 2); c.fill();
                c.fillStyle = f.type === 'golden' ? '#fff7c2' : '#fb7185';
                c.beginPath(); c.arc((f.x + 0.5) * cs, (f.y + 0.5) * cs, r * 0.62, 0, Math.PI * 2); c.fill();
            });

            // power-up
            (g.powerups || []).forEach(function (p) {
                const def = window.SnakeEvents.POWERUPS[p.type];
                c.save();
                c.shadowColor = def.color; c.shadowBlur = cs * 0.8;
                c.fillStyle = 'rgba(8,20,30,0.85)';
                c.beginPath(); c.arc((p.x + 0.5) * cs, (p.y + 0.5) * cs, cs * 0.36, 0, Math.PI * 2); c.fill();
                c.shadowBlur = 0;
                c.font = cs * 0.44 + 'px sans-serif';
                c.textAlign = 'center'; c.textBaseline = 'middle';
                c.fillText(def.icon, (p.x + 0.5) * cs, (p.y + 0.52) * cs);
                c.restore();
            });

            // inseguitore
            if (g.chaser) {
                c.save();
                c.shadowColor = '#a855f7'; c.shadowBlur = cs;
                c.fillStyle = '#7c3aed';
                c.beginPath(); c.arc((g.chaser.x + 0.5) * cs, (g.chaser.y + 0.5) * cs, cs * 0.34, 0, Math.PI * 2); c.fill();
                c.restore();
            }

            // serpente CPU
            if (g.ai) {
                g.ai.snake.forEach(function (s, i) {
                    c.save();
                    c.shadowColor = '#f97316'; c.shadowBlur = i === 0 ? cs * 0.9 : cs * 0.4;
                    c.fillStyle = i === 0 ? '#fdba74' : '#ea580c';
                    self.roundRect(s.x * cs + cs * 0.08, s.y * cs + cs * 0.08, cs * 0.84, cs * 0.84, cs * 0.22);
                    c.fill(); c.restore();
                });
            }

            // serpente giocatore
            const skin = S.SKINS[S.data.settings.skin] || S.SKINS.neon;
            const body = (g.snake && g.snake.length) ? g.snake : [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
            body.forEach(function (s, i) {
                c.save();
                c.shadowColor = skin.glow; c.shadowBlur = i === 0 ? cs * 1.1 : cs * 0.45;
                c.fillStyle = i === 0 ? skin.head : skin.body;
                const inset = i === 0 ? cs * 0.05 : cs * 0.11;
                self.roundRect(s.x * cs + inset, s.y * cs + inset, cs - inset * 2, cs - inset * 2, cs * 0.25);
                c.fill();
                if (i === 0 && g.dir) {
                    c.shadowBlur = 0; c.fillStyle = '#04140d';
                    const ex = s.x * cs + cs * 0.5 + g.dir.x * cs * 0.16 + (g.dir.y ? -cs * 0.13 : 0);
                    const ey = s.y * cs + cs * 0.5 + g.dir.y * cs * 0.16 + (g.dir.x ? -cs * 0.13 : 0);
                    c.beginPath(); c.arc(ex, ey, cs * 0.06, 0, Math.PI * 2); c.fill();
                    c.beginPath(); c.arc(s.x * cs + cs * 0.5 + g.dir.x * cs * 0.16 + (g.dir.y ? cs * 0.13 : 0), s.y * cs + cs * 0.5 + g.dir.y * cs * 0.16 + (g.dir.x ? cs * 0.13 : 0), cs * 0.06, 0, Math.PI * 2); c.fill();
                }
                c.restore();
            });

            // particelle
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06;
                p.vy += dt * 0.0004; p.life -= dt * 0.0016;
                if (p.life <= 0) { this.particles.splice(i, 1); continue; }
                c.globalAlpha = p.life;
                c.fillStyle = p.color;
                c.fillRect(p.x, p.y, cs * 0.12, cs * 0.12);
            }
            c.globalAlpha = 1;

            // blackout
            if (g.effects && g.effects.blackout > 0) {
                const hx = (g.snake[0].x + 0.5) * cs, hy = (g.snake[0].y + 0.5) * cs;
                const grad = c.createRadialGradient(hx, hy, cs * 1.2, hx, hy, cs * 7);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.88)');
                c.fillStyle = grad; c.fillRect(0, 0, size, size);
            }
            c.restore();
            this.updateHud();
        },

        updateHud: function () {
            const g = this.game, S = window.SnakeStorage;
            const set = function (id, val) {
                const el = document.getElementById(id);
                if (el && SnakeUI.lastHud[id] !== val) { el.textContent = String(val); SnakeUI.lastHud[id] = val; }
            };
            set('hud-score', g.score || 0);
            set('hud-best', Math.max(S.best(g.mode ? g.mode.id : 'classic'), g.score || 0));
            set('hud-length', (g.snake || []).length);
            set('hud-level', S.level());

            const wrap = this.el('timer-wrap');
            if (g.mode && g.mode.timeLimit) {
                wrap.classList.remove('hidden');
                const pct = clamp((g.timeLeft / g.mode.timeLimit) * 100, 0, 100);
                this.el('timer-fill').style.width = pct + '%';
                set('timer-text', Math.ceil(g.timeLeft || 0) + 's');
            } else wrap.classList.add('hidden');

            const eff = this.el('effects');
            let html = '';
            Object.keys(g.effects || {}).forEach(function (k) {
                if (g.effects[k] > 0) {
                    const def = window.SnakeEvents.POWERUPS[k];
                    const icon = def ? def.icon : (k === 'blackout' ? '🌑' : '✨');
                    html += '<span class="effect-chip">' + icon + ' ' + Math.ceil(g.effects[k] / 1000) + 's</span>';
                }
            });
            if (g.modifiers && g.modifiers.shield > 0) html += '<span class="effect-chip">🛡️ ×' + g.modifiers.shield + '</span>';
            if (eff.innerHTML !== html) eff.innerHTML = html;
        },

        loop: function (now) {
            const dt = Math.min(50, now - (this.lastFrame || now));
            this.lastFrame = now;
            if (this.game) this.game.tick(dt);
            this.draw(now, dt);
            requestAnimationFrame(this.loop);
        },

        hooks: function () {
            const self = this, S = window.SnakeStorage;
            return {
                onStart: function () { self.updateHud(); },
                onEat: function (g, food, gained) {
                    window.SnakeAudio.eat(g.combo);
                    self.burst(food.x, food.y, food.type === 'golden' ? '#fbbf24' : '#34d399', 10);
                    S.addFood(1);
                },
                onEffect: function (g, type) {
                    if (type === 'golden') window.SnakeAudio.golden();
                    else if (['scudo', 'avversario-out'].indexOf(type) >= 0) window.SnakeAudio.power();
                    else window.SnakeAudio.power();
                    const head = g.snake[0];
                    self.burst(head.x, head.y, '#a78bfa', 16);
                },
                onAiEat: function () { window.SnakeAudio.click(); },
                onBanner: function (text, kind) { self.banner(text, kind); },
                onPause: function () { self.el('pause-btn').textContent = self.t('resume'); },
                onResume: function () { self.el('pause-btn').textContent = self.t('pause'); },
                onOver: function (g, reason) {
                    window.SnakeAudio.hit();
                    self.shake = 14;
                    const record = S.setBest(g.mode.id, g.score);
                    S.data.stats.games++;
                    const gainedXp = Math.floor(g.score / 4) + g.foodEaten;
                    S.addXp(gainedXp);
                    const levelNow = S.level();
                    const unlocked = [];
                    if (g.foodEaten >= 1) { const a = S.unlock('first'); if (a) unlocked.push(a); }
                    if (g.score >= 50) { const a = S.unlock('fifty'); if (a) unlocked.push(a); }
                    if (g.score >= 100) { const a = S.unlock('hundred'); if (a) unlocked.push(a); }
                    if (g.combo >= 5) { const a = S.unlock('combo'); if (a) unlocked.push(a); }
                    if (g.result === 'vittoria' && g.mode.id === 'battle') { const a = S.unlock('battle'); if (a) unlocked.push(a); }
                    if (g.mode.id === 'obstacles' && reason === 'vittoria') { const a = S.unlock('puzzle'); if (a) unlocked.push(a); }
                    if (g.daily) { S.data.achievements.dailyCount = (S.data.achievements.dailyCount || 0) + 1; if (S.data.achievements.dailyCount >= 3) { const a = S.unlock('daily'); if (a) unlocked.push(a); } }
                    S.save();

                    S.addLeaderboard(g.daily ? 'daily-' + S.dailyKey() : g.mode.id, {
                        name: g.daily ? S.dailyKey() : g.mode.name, score: g.score, date: Date.now()
                    });

                    const title = self.t('gameOver');
                    let sub = self.t('reason_' + reason) || reason;
                    if (g.result === 'vittoria' && g.mode.id === 'battle') sub = self.t('win');
                    self.el('over-title').textContent = title;
                    self.el('over-sub').textContent = sub;
                    self.el('over-score').textContent = g.score;
                    self.el('over-best').textContent = S.best(g.mode.id);
                    self.el('over-xp').textContent = '+' + gainedXp + ' XP · ' + self.t('level') + ' ' + levelNow;
                    self.el('over-record').classList.toggle('hidden', !record);
                    const ach = self.el('over-achievements');
                    ach.innerHTML = unlocked.map(function (a) { return '<span class="ach-pop">' + a.icon + ' ' + a.name + '</span>'; }).join('');
                    self.el('board-wrap').classList.add('blurred');
                    self.openModal('over-modal');
                    if (record) window.SnakeAudio.win();
                },
                onMenu: function () { self.buildMenu(); }
            };
        },

        bind: function () {
            const self = this;
            const g = this.game;

            window.addEventListener('resize', function () { self.resize(); });
            document.addEventListener('visibilitychange', function () {
                if (document.hidden && g.phase === 'playing') { g.pause(); self.openModal('pause-modal'); }
            });

            document.addEventListener('keydown', function (e) {
                const key = e.key.toLowerCase();
                if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].indexOf(key) >= 0) e.preventDefault();
                if (key === 'arrowup' || key === 'w') g.setDirection(0, -1);
                else if (key === 'arrowdown' || key === 's') g.setDirection(0, 1);
                else if (key === 'arrowleft' || key === 'a') g.setDirection(-1, 0);
                else if (key === 'arrowright' || key === 'd') g.setDirection(1, 0);
                else if (key === ' ') { g.togglePause(); if (g.phase === 'paused') self.openModal('pause-modal'); else self.closeAll(); }
                else if (key === 'escape') { g.toMenu(); self.openModal('menu-modal'); }
                else if (key === 'enter' && g.phase === 'over') self.start(g.mode.id);
            });

            document.querySelectorAll('[data-dir]').forEach(function (btn) {
                btn.addEventListener('pointerdown', function (e) {
                    e.preventDefault();
                    const d = btn.dataset.dir;
                    const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
                    g.setDirection(map[d][0], map[d][1]);
                    window.SnakeAudio.init();
                });
            });

            let sx = 0, sy = 0;
            this.canvas.addEventListener('touchstart', function (e) {
                sx = e.touches[0].clientX; sy = e.touches[0].clientY;
            }, { passive: true });
            this.canvas.addEventListener('touchend', function (e) {
                const t = e.changedTouches[0];
                const dx = t.clientX - sx, dy = t.clientY - sy;
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
                if (Math.abs(dx) > Math.abs(dy)) g.setDirection(Math.sign(dx), 0);
                else g.setDirection(0, Math.sign(dy));
            }, { passive: true });

            this.el('pause-btn').addEventListener('click', function () {
                g.togglePause();
                if (g.phase === 'paused') self.openModal('pause-modal'); else self.closeAll();
            });
            this.el('menu-btn').addEventListener('click', function () { g.toMenu(); self.openModal('menu-modal'); });
            this.el('sound-btn').addEventListener('click', function () {
                const on = !window.SnakeStorage.data.settings.sound;
                window.SnakeStorage.set('sound', on);
                window.SnakeAudio.enabled = on;
                if (on) window.SnakeAudio.click();
                self.el('sound-btn').textContent = on ? '🔊' : '🔇';
            });
            this.el('sound-btn').textContent = window.SnakeStorage.data.settings.sound ? '🔊' : '🔇';
            window.SnakeAudio.enabled = window.SnakeStorage.data.settings.sound;

            this.el('settings-btn').addEventListener('click', function () { self.showPanel('settings'); });
            this.el('skins-btn').addEventListener('click', function () { self.showPanel('skins'); });
            this.el('stats-btn').addEventListener('click', function () { self.showPanel('stats'); });
            this.el('records-btn').addEventListener('click', function () { self.showPanel('records'); });
            this.el('panel-close').addEventListener('click', function () { self.closeAll(); });
            this.el('pause-resume').addEventListener('click', function () { g.resume(); self.closeAll(); });
            this.el('pause-menu').addEventListener('click', function () { g.toMenu(); self.openModal('menu-modal'); });
            this.el('over-retry').addEventListener('click', function () { self.start(g.mode.id, { daily: g.daily, seed: g.daily ? g.seedValue : null }); });
            this.el('over-menu').addEventListener('click', function () { g.toMenu(); self.openModal('menu-modal'); });
            this.el('daily-btn').addEventListener('click', function () {
                const key = window.SnakeStorage.dailyKey();
                self.start('classic', { daily: true, seed: window.SnakeEngine.hashSeed('snake-' + key) });
                self.banner('📅 ' + key, 'gold');
            });

            window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault();
                self.deferredPrompt = e;
                self.el('install-btn').classList.remove('hidden');
                self.el('menu-install').classList.remove('hidden');
            });
            const install = function () {
                if (!self.deferredPrompt) return;
                self.deferredPrompt.prompt();
                self.deferredPrompt.userChoice.then(function () { self.deferredPrompt = null; });
            };
            this.el('install-btn').addEventListener('click', install);
            this.el('menu-install').addEventListener('click', install);
        }
    };

    window.SnakeUI = SnakeUI;
})();
