/* Slot Neon — interfaccia, rulli Canvas, gacha, storia, modalità */
(function () {
    'use strict';

    const DICT = {
        it: {
            credits: 'Crediti', gems: 'Gemme', level: 'Livello', energy: 'Energia', spin: 'GIRA!',
            bet: 'Puntata', machines: 'Macchine', paytable: 'Tabella pagamenti', win: 'VINCITA!',
            lose: 'Nessuna vincita — riprova', free: 'Giri gratis', jackpot: 'JACKPOT!',
            pull1: 'Pull ×1 · 80 💎', pull10: 'Pull ×10 · 800 💎', pity: 'Pity SSR', pityUr: 'Pity UR',
            shards: 'Shard', upgrade: 'Potenzia', new: 'NUOVO', dup: 'Duplicato',
            chapters: 'Capitoli', locked: 'Bloccato', completed: 'Completato', upgradeCost: 'Costo',
            settings: 'Impostazioni', sound: 'Audio', reduced: 'Effetti ridotti', lang: 'Lingua',
            records: 'Classifiche', daily: 'Bonus giornaliero', collect: 'Collezione',
            back: 'Portfolio', install: 'Installa app', noGems: 'Gemme insufficienti',
            noCredits: 'Crediti insufficienti', noEnergy: 'Energia insufficiente',
            login: 'Benvenuto! +100 crediti e +20 gemme', start: 'Inizia', close: 'Chiudi',
            affinity: 'Affinità', order: 'Ordine', chaos: 'Caos', balance: 'Equilibrio'
        },
        en: {
            credits: 'Credits', gems: 'Gems', level: 'Level', energy: 'Energy', spin: 'SPIN!',
            bet: 'Bet', machines: 'Machines', paytable: 'Paytable', win: 'WIN!',
            lose: 'No win — try again', free: 'Free spins', jackpot: 'JACKPOT!',
            pull1: 'Pull ×1 · 80 💎', pull10: 'Pull ×10 · 800 💎', pity: 'SSR pity', pityUr: 'UR pity',
            shards: 'Shards', upgrade: 'Upgrade', new: 'NEW', dup: 'Duplicate',
            chapters: 'Chapters', locked: 'Locked', completed: 'Completed', upgradeCost: 'Cost',
            settings: 'Settings', sound: 'Sound', reduced: 'Reduced effects', lang: 'Language',
            records: 'Leaderboard', daily: 'Daily bonus', collect: 'Collection',
            back: 'Portfolio', install: 'Install app', noGems: 'Not enough gems',
            noCredits: 'Not enough credits', noEnergy: 'Not enough energy',
            login: 'Welcome! +100 credits and +20 gems', start: 'Start', close: 'Close',
            affinity: 'Affinity', order: 'Order', chaos: 'Chaos', balance: 'Balance'
        }
    };

    const SlotUI = {
        storage: null,
        lang: 'it',
        view: 'slots',
        machine: null,
        bet: 10,
        mode: null,
        run: null,
        spinning: false,
        pending: null,
        reels: [],
        lastFrame: 0,
        toastTimer: null,
        deferredPrompt: null,
        activeChapter: 0,
        activeNode: 0,
        revealResults: [],

        el: function (id) { return document.getElementById(id); },

        t: function (key) {
            const parts = key.split('.');
            let v = window.translations;
            for (let i = 0; i < parts.length; i++) { v = v && v[parts[i]]; }
            if (typeof v === 'string') return v;
            const sub = window.translations && window.translations.games && window.translations.games.slot;
            if (sub && typeof sub[key] === 'string') return sub[key];
            return (DICT[this.lang] && DICT[this.lang][key]) || DICT.en[key] || key;
        },

        init: function () {
            const S = window.SlotStorage;
            S.load();
            this.storage = S;
            this.lang = S.data.settings.lang === 'en' ? 'en' : 'it';
            window.SlotAudio.enabled = S.data.settings.sound;
            this.machine = window.SlotMachines.list[0];
            this.mode = window.SlotModes.get('classic');
            this.run = this.freshRun();
            this.canvas = this.el('reels');
            this.ctx = this.canvas.getContext('2d');
            this.build();
            this.bind();
            this.resetReels();
            this.resize();
            this.renderHud();
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
            const login = S.dailyLogin();
            if (login) this.toast(this.t('login'));
            this.renderAll();
            return this;
        },

        freshRun: function () {
            return { active: false, spins: 0, win: 0, hp: 0, bossHp: 0, multiplier: 1, rem: 0, seed: 0 };
        },

        build: function () {
            const self = this;
            const tabs = this.el('machine-tabs');
            tabs.innerHTML = '';
            window.SlotMachines.list.forEach(function (m) {
                const b = document.createElement('button');
                b.className = 'machine-tab';
                b.dataset.machine = m.id;
                b.innerHTML = m.icon + ' <span>' + m.name + '</span>';
                b.addEventListener('click', function () { self.selectMachine(m.id); });
                tabs.appendChild(b);
            });

            const bets = this.el('bet-row');
            bets.innerHTML = '';
            [5, 10, 25, 50, 100].forEach(function (v) {
                const b = document.createElement('button');
                b.className = 'bet-btn' + (v === self.bet ? ' active' : '');
                b.dataset.bet = v;
                b.textContent = '$' + v;
                b.addEventListener('click', function () { self.bet = v; self.renderBets(); window.SlotAudio.click(); });
                bets.appendChild(b);
            });

            const modes = this.el('mode-list');
            modes.innerHTML = '';
            window.SlotModes.list.forEach(function (m) {
                const card = document.createElement('button');
                card.className = 'mode-card';
                card.innerHTML = '<span class="mode-icon">' + m.icon + '</span><b>' + m.name + '</b><small>' + m.desc + '</small>' +
                    '<span class="mode-record">🏆 ' + (self.storage.records(m.id)[0] ? self.storage.records(m.id)[0].score : 0) + '</span>';
                card.addEventListener('click', function () { self.startMode(m.id); });
                modes.appendChild(card);
            });
            this.renderChapters();
            this.renderCollection();
        },

        renderAll: function () {
            this.renderHud();
            this.renderMachines();
            this.renderBets();
            this.renderPaytable();
            this.renderGacha();
            this.renderChapters();
            this.renderModes();
            this.renderCollection();
        },

        renderHud: function () {
            const d = this.storage.data;
            this.el('hud-credits').textContent = Math.floor(d.player.credits);
            this.el('hud-gems').textContent = d.player.gems;
            this.el('hud-level').textContent = d.player.level;
            this.el('hud-energy').textContent = d.player.energy;
            this.el('hud-shards').textContent = d.gacha.shards;
            this.el('mode-badge').textContent = this.mode.icon + ' ' + this.mode.name;
        },

        renderMachines: function () {
            const self = this;
            const unlocked = this.storage.data.progress.machines;
            document.querySelectorAll('.machine-tab').forEach(function (b) {
                const m = window.SlotMachines.get(b.dataset.machine);
                const ok = unlocked.indexOf(m.id) >= 0;
                b.classList.toggle('active', m.id === self.machine.id);
                b.classList.toggle('locked', !ok);
                b.title = ok ? m.tagline : ('Livello ' + m.unlockLevel);
            });
            const m = this.machine;
            const ok = unlocked.indexOf(m.id) >= 0;
            this.el('machine-name').textContent = m.icon + ' ' + m.name;
            this.el('machine-sub').textContent = ok ? m.tagline + ' · volatilità ' + m.volatility : '🔒 Sblocco al livello ' + m.unlockLevel;
            this.el('machine-panel').style.setProperty('--m1', m.colors[0]);
            this.el('machine-panel').style.setProperty('--m2', m.colors[1]);
            this.el('spin-btn').disabled = this.spinning || !ok;
        },

        renderBets: function () {
            document.querySelectorAll('.bet-btn').forEach(function (b) {
                b.classList.toggle('active', Number(b.dataset.bet) === SlotUI.bet);
            });
        },

        renderPaytable: function () {
            const m = this.machine;
            const rows = m.symbols.filter(function (s) { return s.kind === 'normal' && s.mult > 0; })
                .sort(function (a, b) { return b.mult - a.mult; })
                .map(function (s) {
                    return '<div class="pay-row"><span>' + s.glyph + ' ' + s.name + '</span><b>×' + s.mult + '</b></div>';
                }).join('');
            this.el('paytable').innerHTML = '<div class="pay-title">' + this.t('paytable') + '</div>' + rows +
                '<div class="pay-row"><span>🌟 Jolly</span><b>WILD</b></div>' +
                '<div class="pay-row"><span>🎁 Scatter ×' + m.scatterCount + '</span><b>+' + m.freeSpins + ' free</b></div>';
        },

        renderModes: function () {
            const self = this;
            this.el('mode-list').innerHTML = '';
            window.SlotModes.list.forEach(function (m) {
                const card = document.createElement('button');
                card.className = 'mode-card';
                const rec = self.storage.records(m.id)[0];
                card.innerHTML = '<span class="mode-icon">' + m.icon + '</span><b>' + m.name + '</b><small>' + m.desc + '</small>' +
                    '<span class="mode-record">🏆 ' + (rec ? rec.score : 0) + '</span>';
                card.addEventListener('click', function () { self.startMode(m.id); });
                self.el('mode-list').appendChild(card);
            });
        },

        renderGacha: function () {
            const d = this.storage.data;
            this.el('gacha-pity').textContent = this.t('pity') + ' ' + d.gacha.pitySSR + '/40 · ' + this.t('pityUr') + ' ' + d.gacha.pityUR + '/120';
            this.el('gacha-shards').textContent = this.t('shards') + ': ' + d.gacha.shards;
            const fam = d.gacha.rateUp;
            const m = window.SlotMachines.get(fam);
            this.el('gacha-banner').textContent = '✨ Banner: ' + m.icon + ' ' + m.name + ' (rate-up 50%)';
        },

        renderChapters: function () {
            const self = this;
            const list = this.el('chapter-list');
            list.innerHTML = '';
            window.SlotStory.CHAPTERS.forEach(function (ch, i) {
                const done = self.storage.data.progress.completed.indexOf(ch.id) >= 0;
                const unlocked = self.storage.data.progress.chapter >= i;
                const card = document.createElement('button');
                card.className = 'chapter-card' + (done ? ' done' : '') + (unlocked ? '' : ' locked');
                card.innerHTML = '<span class="chapter-num">' + (i + 1) + '</span><b>' + ch.title + '</b>' +
                    '<small>' + ch.subtitle + ' · ' + window.SlotMachines.get(ch.machine).icon + '</small>' +
                    '<span class="chapter-status">' + (done ? '✓ ' + self.t('completed') : (unlocked ? self.t('start') : '🔒 ' + self.t('locked'))) + '</span>';
                if (unlocked) card.addEventListener('click', function () { self.openStory(i, done ? 0 : self.activeNodeFor(i)); });
                list.appendChild(card);
            });
        },

        activeNodeFor: function (i) {
            // I capitoli già completati vengono rivissuti dal primo nodo.
            return 0;
        },

        renderCollection: function () {
            const self = this;
            const grid = this.el('collection-grid');
            grid.innerHTML = '';
            window.SlotGacha.ECHOES.forEach(function (e) {
                const owned = self.storage.data.collection[e.id];
                const card = document.createElement('button');
                card.className = 'echo-card ' + (owned ? '' : 'locked') + ' rarity-' + e.rarity.toLowerCase();
                card.style.setProperty('--rare', e.color);
                card.innerHTML = '<span class="echo-glyph">' + (owned ? e.glyph : '❔') + '</span>' +
                    '<b>' + (owned ? e.name : '???') + '</b>' +
                    '<small>' + e.rarity + (owned ? ' · ★' + owned.star : '') + '</small>';
                if (owned) card.addEventListener('click', function () { self.upgradeEcho(e.id); });
                grid.appendChild(card);
            });
        },

        switchView: function (name) {
            this.view = name;
            document.querySelectorAll('.view').forEach(function (v) { v.classList.add('hidden'); });
            this.el('view-' + name).classList.remove('hidden');
            document.querySelectorAll('.tabbar button').forEach(function (b) {
                b.classList.toggle('active', b.dataset.view === name);
            });
            if (name === 'gacha') this.renderGacha();
            if (name === 'story') this.renderChapters();
            if (name === 'modes') this.renderModes();
            if (name === 'collection') this.renderCollection();
            if (name === 'slots') { this.renderMachines(); this.resize(); }
            window.SlotAudio.click();
        },

        selectMachine: function (id) {
            const m = window.SlotMachines.get(id);
            if (this.storage.data.progress.machines.indexOf(id) < 0) {
                this.toast('🔒 Livello ' + m.unlockLevel + ' richiesto');
                return;
            }
            this.machine = m;
            this.renderMachines();
            this.renderPaytable();
            this.resetReels();
            window.SlotAudio.click();
        },

        resetReels: function () {
            const self = this;
            this.reels = [];
            for (let c = 0; c < this.machine.cols; c++) {
                const col = [];
                for (let r = 0; r < this.machine.rows; r++) col.push(this.randomSymbol());
                this.reels.push({ symbols: col, offset: 0, spinning: false, settling: false, settleT: 0, target: col.slice() });
            }
        },

        randomSymbol: function () {
            return window.SlotRng.weightedPick(Math.random, this.machine.symbols);
        },

        rngForSpin: function () {
            if (this.mode.seed) {
                const seed = (window.SlotRng.dailySeed() ^ Math.imul(this.run.spins + 1, 2654435761)) >>> 0;
                return window.SlotRng.makeRng(seed);
            }
            return Math.random;
        },

        startSpin: function () {
            if (this.spinning) return;
            const d = this.storage.data;
            const m = this.machine;
            if (d.progress.machines.indexOf(m.id) < 0) { this.toast('🔒 Macchina bloccata'); return; }
            if (this.mode.energy && d.player.energy < this.mode.energy) { this.toast(this.t('noEnergy')); return; }
            const cost = this.bet * (this.mode.cost || 1);
            if (!this.run.free && d.player.credits < cost) { this.toast(this.t('noCredits')); return; }
            if (this.run.free <= 0) d.player.credits -= cost;
            else this.run.free--;
            if (this.mode.energy) d.player.energy -= this.mode.energy;
            d.stats.spins++;
            d.quests.dailySpins++;
            this.run.spins++;

            const rng = this.rngForSpin();
            const luck = window.SlotGacha.luckBonus(d);
            const effBet = Math.round(this.bet * (this.run.multiplier || 1));
            this.pending = window.SlotMachines.spin(m, effBet, rng, { luck: luck });
            this.spinning = true;
            this.el('spin-btn').disabled = true;
            this.el('message').textContent = '…';
            this.el('message').className = 'message';
            window.SlotAudio.init();
            window.SlotAudio.spin();

            const self = this;
            this.reels.forEach(function (reel, i) {
                reel.spinning = true;
                reel.settling = false;
                reel.offset = 0;
                setTimeout(function () {
                    reel.spinning = false;
                    reel.settling = true;
                    reel.settleT = 0;
                    reel.target = self.pending.grid[i].slice();
                    window.SlotAudio.stop(i);
                }, 620 + i * 180);
            });
            setTimeout(function () { self.finishSpin(); }, 620 + (m.cols - 1) * 180 + 520);
            this.storage.save();
            this.renderHud();
        },

        finishSpin: function () {
            this.spinning = false;
            const res = this.pending;
            const d = this.storage.data;
            if (!res) return;
            if (res.win > 0) {
                d.player.credits += res.win;
                d.stats.wins++;
                d.stats.totalWin += res.win;
                if (res.win > d.stats.biggestWin) d.stats.biggestWin = res.win;
                this.el('message').textContent = this.t('win') + ' +$' + res.win;
                this.el('message').className = 'message win';
                window.SlotAudio[res.win >= this.bet * 30 ? 'bigWin' : 'win']();
                this.celebrate(res.jackpot ? 90 : Math.min(50, 12 + res.win / 10));
            } else {
                this.el('message').textContent = this.t('lose');
                this.el('message').className = 'message lose';
            }
            if (res.jackpot) {
                d.stats.jackpots++;
                this.toast('🏆 ' + this.t('jackpot') + ' +$' + res.jackpot);
                this.celebrate(120);
            }
            if (res.freeSpins > 0) {
                this.run.free += res.freeSpins;
                this.toast('🎁 ' + res.freeSpins + ' ' + this.t('free'));
            }
            if (this.mode.id === 'jackpot' && res.jackpot) {
                d.player.gems += 30;
                this.storage.pushRecord('jackpot', { score: this.run.spins, date: Date.now() });
                this.toast('🏆 Record: ' + this.run.spins + ' giri!');
            }
            if (this.mode.id === 'boss') {
                const dmg = Math.round(res.win / 2);
                this.run.bossHp -= dmg;
                if (res.win === 0) this.run.hp -= this.mode.bossDamage;
                this.toast('⚔️ ' + dmg + ' danni · Boss ' + Math.max(0, this.run.bossHp) + ' HP');
                if (this.run.bossHp <= 0) {
                    d.player.gems += 40;
                    this.storage.pushRecord('boss', { score: dmg, date: Date.now() });
                    this.toast('🎉 Boss sconfitto! +40 gemme');
                    this.run.bossHp = this.mode.hp;
                }
            }
            if (this.mode.id === 'marathon') {
                this.run.rem--;
                this.el('timer-text').textContent = this.run.rem + ' giri';
                this.run.multiplier = 1 + (this.mode.spins - this.run.rem) * (this.mode.multiplierStep || 0.25);
                if (this.run.rem <= 0) { this.toast('🌀 Marathon finito!'); this.run.active = false; }
            }
            if (this.run.hp <= 0) {
                this.toast('💀 Sconfitto — battaglia terminata');
                this.run = this.freshRun();
            }
            const leveled = window.SlotStorage.addXp(Math.max(1, Math.round(res.win / 20)));
            if (leveled) {
                this.toast('⭐ Livello ' + window.SlotStorage.level());
                this.checkUnlocks();
            }
            this.storage.save();
            this.renderHud();
            this.renderMachines();
            this.el('spin-btn').disabled = false;
        },

        checkUnlocks: function () {
            const lv = window.SlotStorage.level();
            window.SlotMachines.list.forEach(function (m) {
                if (lv >= m.unlockLevel && window.SlotStorage.unlockMachine(m.id)) {
                    SlotUI.toast('🔓 Nuova macchina: ' + m.name);
                }
            });
            this.renderMachines();
        },

        celebrate: function (n) {
            if (this.storage.data.settings.reducedFx) return;
            const layer = this.el('fx-layer');
            const colors = ['#fbbf24', '#fb7185', '#34d399', '#38bdf8', '#c084fc'];
            for (let i = 0; i < n; i++) {
                const bit = document.createElement('i');
                bit.className = 'confetti';
                bit.style.left = Math.random() * 100 + 'vw';
                bit.style.background = colors[i % colors.length];
                bit.style.animationDelay = Math.random() * 0.2 + 's';
                bit.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
                layer.appendChild(bit);
                (function (b) { setTimeout(function () { b.remove(); }, 2200); })(bit);
            }
        },

        doPull: function (count) {
            const cost = count * 80;
            const d = this.storage.data;
            if (d.player.gems < cost) { this.toast(this.t('noGems')); return; }
            d.player.gems -= cost;
            d.quests.dailyPulls += count;
            const rng = window.SlotRng.makeRng((Date.now() ^ Math.imul(d.gacha.pulls + count, 2246822519)) >>> 0);
            const results = window.SlotGacha.pull(d, rng, count, { rateUp: d.gacha.rateUp });
            this.storage.save();
            this.renderHud();
            this.renderGacha();
            this.renderCollection();
            window.SlotAudio.pull();
            if (results.some(function (r) { return r.rarity === 'SSR' || r.rarity === 'UR'; })) window.SlotAudio.rare();
            this.showReveal(results);
        },

        showReveal: function (results) {
            this.revealResults = results;
            const grid = this.el('reveal-grid');
            grid.innerHTML = '';
            const self = this;
            results.forEach(function (r, i) {
                const card = document.createElement('div');
                card.className = 'reveal-card rarity-' + r.rarity.toLowerCase();
                card.style.setProperty('--rare', window.SlotGacha.COLOR[r.rarity]);
                card.style.animationDelay = (i * 0.08) + 's';
                card.innerHTML = '<span class="reveal-glyph">' + r.echo.glyph + '</span>' +
                    '<b>' + r.echo.name + '</b><span class="reveal-rarity">' + r.rarity + '</span>' +
                    '<small>' + (r.isNew ? self.t('new') : self.t('dup') + ' +' + r.shards) + '</small>';
                grid.appendChild(card);
            });
            this.openModal('reveal-modal');
        },

        upgradeEcho: function (id) {
            const ok = window.SlotGacha.upgrade(this.storage.data, id);
            if (ok) {
                window.SlotAudio.click();
                this.toast('⭐ ' + this.t('upgrade'));
                this.storage.save();
                this.renderCollection();
                this.renderGacha();
            } else this.toast('🔒 ' + this.t('shards'));
        },

        startMode: function (id) {
            const mode = window.SlotModes.get(id);
            this.mode = mode;
            this.run = this.freshRun();
            this.run.active = true;
            this.run.seed = mode.seed ? window.SlotRng.dailySeed() : (Date.now() >>> 0);
            if (mode.spins) this.run.rem = mode.spins;
            if (mode.hp) this.run.bossHp = mode.hp;
            if (mode.timer) this.run.rem = mode.timer;
            this.el('timer-text').classList.toggle('hidden', !mode.timer && !mode.spins);
            if (mode.spins) this.el('timer-text').textContent = mode.spins + ' giri';
            this.switchView(id === 'story' ? 'story' : 'slots');
            this.toast(mode.icon + ' ' + mode.name);
            this.renderHud();
            if (id === 'story') this.openStory(this.storage.data.progress.chapter, 0);
        },

        loop: function (now) {
            const dt = Math.min(50, now - (this.lastFrame || now));
            this.lastFrame = now;
            this.updateReels(dt);
            if (this.run.active && this.mode && this.mode.timer && !this.spinning) {
                this.run.rem = Math.max(0, this.run.rem - dt / 1000);
                this.el('timer-text').textContent = Math.ceil(this.run.rem) + 's';
                if (this.run.rem <= 0) { this.run.active = false; this.toast('⏱️ Tempo scaduto!'); }
            }
            this.drawReels(now);
            requestAnimationFrame(this.loop);
        },

        updateReels: function (dt) {
            const self = this;
            this.reels.forEach(function (reel) {
                if (reel.spinning) {
                    reel.offset = (reel.offset + dt * 0.55) % 1000;
                    if (Math.random() < 0.25) {
                        reel.symbols[Math.floor(Math.random() * reel.symbols.length)] = self.randomSymbol();
                    }
                } else if (reel.settling) {
                    reel.settleT = Math.min(1, reel.settleT + dt / 420);
                    if (reel.settleT >= 1) { reel.settling = false; reel.symbols = reel.target.slice(); }
                }
            });
        },

        drawReels: function (now) {
            const c = this.ctx;
            if (!c) return;
            const size = this.canvas.width;
            const m = this.machine;
            const cols = m.cols, rows = m.rows;
            const cw = size / cols, ch = size / rows;
            c.clearRect(0, 0, size, size);
            for (let col = 0; col < cols; col++) {
                const reel = this.reels[col];
                if (!reel) continue;
                for (let r = 0; r < rows; r++) {
                    let sym = reel.symbols[r];
                    let shift = 0;
                    if (reel.spinning) shift = (reel.offset % ch);
                    else if (reel.settling) {
                        sym = reel.target[r];
                        shift = ch * (1 - this.easeOut(reel.settleT)) * (1 + col * 0.15);
                    }
                    const x = col * cw + cw * 0.06;
                    const y = r * ch + ch * 0.06 + shift;
                    const w = cw * 0.88, h = ch * 0.88;
                    if (y > size || y + h < 0) continue;
                    const grad = c.createLinearGradient(x, y, x + w, y + h);
                    grad.addColorStop(0, 'rgba(255,255,255,0.09)');
                    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
                    c.fillStyle = grad;
                    this.roundRect(c, x, y, w, h, cw * 0.12);
                    c.fill();
                    c.strokeStyle = 'rgba(251,191,36,0.22)';
                    c.lineWidth = Math.max(1, cw * 0.02);
                    c.stroke();
                    c.font = Math.floor(cw * 0.52) + 'px sans-serif';
                    c.textAlign = 'center'; c.textBaseline = 'middle';
                    c.fillText(sym.glyph, x + w / 2, y + h / 2);
                }
            }
            // linee di vincita
            if (this.pending && !this.spinning) {
                c.lineWidth = Math.max(2, cw * 0.05);
                this.pending.lines.forEach(function (line) {
                    c.strokeStyle = line.cascade ? '#38bdf8' : '#34d399';
                    c.shadowColor = c.strokeStyle; c.shadowBlur = 14;
                    c.beginPath();
                    c.moveTo(line.start * cw + cw / 2, line.row * ch + ch / 2);
                    c.lineTo((line.start + line.count - 1) * cw + cw / 2, line.row * ch + ch / 2);
                    c.stroke();
                });
                c.shadowBlur = 0;
            }
        },

        easeOut: function (t) { return 1 - Math.pow(1 - t, 3); },

        roundRect: function (c, x, y, w, h, r) {
            c.beginPath();
            c.moveTo(x + r, y);
            c.arcTo(x + w, y, x + w, y + h, r);
            c.arcTo(x + w, y + h, x, y + h, r);
            c.arcTo(x, y + h, x, y, r);
            c.arcTo(x, y, x + w, y, r);
            c.closePath();
        },

        resize: function () {
            const wrap = this.el('board-wrap');
            if (!wrap || !this.canvas) return;
            const size = Math.floor(Math.min(wrap.clientWidth, 480));
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.style.width = size + 'px';
            this.canvas.style.height = size + 'px';
            this.canvas.width = Math.floor(size * dpr);
            this.canvas.height = Math.floor(size * dpr);
        },

        openStory: function (chapterIdx, nodeIdx) {
            const ch = window.SlotStory.CHAPTERS[chapterIdx];
            if (!ch) return;
            if (this.storage.data.progress.chapter < chapterIdx) { this.toast('🔒 ' + this.t('locked')); return; }
            this.activeChapter = chapterIdx;
            this.activeNode = nodeIdx || 0;
            this.renderStoryNode();
            this.openModal('story-modal');
        },

        renderStoryNode: function () {
            const ch = window.SlotStory.CHAPTERS[this.activeChapter];
            const node = ch.nodes[this.activeNode];
            if (!node) { this.closeModal('story-modal'); return; }
            this.el('story-title').textContent = ch.subtitle + ' · ' + ch.title;
            this.el('story-speaker').textContent = node.speaker;
            this.el('story-text').textContent = node.text;
            const wrap = this.el('story-choices');
            wrap.innerHTML = '';
            const self = this;
            node.choices.forEach(function (choice, i) {
                const b = document.createElement('button');
                b.className = 'story-choice';
                b.textContent = '➤ ' + choice.text;
                b.addEventListener('click', function () { self.choose(i); });
                wrap.appendChild(b);
            });
        },

        choose: function (i) {
            const res = window.SlotStory.applyChoice(this.storage.data, this.activeChapter, this.activeNode, i);
            if (!res.ok) return;
            this.storage.save();
            window.SlotAudio.click();
            this.renderHud();
            this.renderCollection();
            if (res.done) {
                if (res.ending) {
                    this.el('story-title').textContent = '🏁 Finale';
                    this.el('story-speaker').textContent = 'L\'Archivista';
                    this.el('story-text').textContent = window.SlotStory.ending(this.storage.data);
                    this.el('story-choices').innerHTML = '<button class="story-choice" id="story-finish">' + this.t('close') + '</button>';
                    this.el('story-finish').addEventListener('click', function () { SlotUI.closeModal('story-modal'); });
                } else {
                    this.toast('✓ ' + this.t('completed'));
                    this.closeModal('story-modal');
                }
                this.checkUnlocks();
                this.renderChapters();
                this.renderMachines();
            } else {
                this.activeNode = res.next;
                this.renderStoryNode();
            }
        },

        showPanel: function (kind) {
            const body = this.el('panel-body');
            const title = this.el('panel-title');
            const S = this.storage.data;
            if (kind === 'settings') {
                title.textContent = this.t('settings');
                body.innerHTML = '<label class="switch-row"><span>' + this.t('sound') + '</span><input type="checkbox" id="opt-sound" ' + (S.settings.sound ? 'checked' : '') + '></label>' +
                    '<label class="switch-row"><span>' + this.t('reduced') + '</span><input type="checkbox" id="opt-reduced" ' + (S.settings.reducedFx ? 'checked' : '') + '></label>' +
                    '<label class="switch-row"><span>' + this.t('lang') + '</span><select id="opt-lang"><option value="it" ' + (this.lang === 'it' ? 'selected' : '') + '>🇮🇹 IT</option><option value="en" ' + (this.lang === 'en' ? 'selected' : '') + '>🇬🇧 EN</option></select></label>';
                const self = this;
                this.el('opt-sound').addEventListener('change', function (e) { window.SlotStorage.set('sound', e.target.checked); window.SlotAudio.enabled = e.target.checked; if (e.target.checked) window.SlotAudio.click(); });
                this.el('opt-reduced').addEventListener('change', function (e) { window.SlotStorage.set('reducedFx', e.target.checked); });
                this.el('opt-lang').addEventListener('change', function (e) { window.SlotStorage.set('lang', e.target.value); self.lang = e.target.value; self.applyLang(); });
            } else if (kind === 'records') {
                title.textContent = this.t('records');
                let html = '';
                Object.keys(S.records).forEach(function (key) {
                    html += '<h4>' + key + '</h4><ol class="rec-list">';
                    window.SlotStorage.records(key).forEach(function (e) { html += '<li><span>' + new Date(e.date).toLocaleDateString() + '</span><b>' + e.score + '</b></li>'; });
                    html += '</ol>';
                });
                body.innerHTML = html || '<p class="empty">—</p>';
            } else if (kind === 'daily') {
                title.textContent = this.t('daily');
                body.innerHTML = '<p>' + this.t('login') + '</p><p>🎯 ' + (S.quests.dailySpins || 0) + ' spin · ✨ ' + (S.quests.dailyPulls || 0) + ' pull</p>' +
                    '<p>' + this.t('affinity') + ': ⚖️' + S.player.affinity.ordine + ' · 🌪️' + S.player.affinity.caos + ' · ⚖️' + S.player.affinity.equilibrio + '</p>';
            }
            this.openModal('panel-modal');
        },

        applyLang: function () {
            document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = SlotUI.t(el.dataset.i18n); });
            this.renderPaytable();
            this.renderGacha();
        },

        toast: function (msg) {
            const el = this.el('toast');
            el.textContent = msg;
            el.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2000);
        },

        openModal: function (id) { this.el(id).classList.remove('hidden'); },
        closeModal: function (id) { this.el(id).classList.add('hidden'); },

        bind: function () {
            const self = this;
            document.querySelectorAll('.tabbar button').forEach(function (b) {
                b.addEventListener('click', function () { self.switchView(b.dataset.view); });
            });
            this.el('spin-btn').addEventListener('click', function () { self.startSpin(); });
            this.el('pull1').addEventListener('click', function () { self.doPull(1); });
            this.el('pull10').addEventListener('click', function () { self.doPull(10); });
            this.el('sound-btn').addEventListener('click', function () {
                const S = window.SlotStorage.data;
                S.settings.sound = !S.settings.sound;
                window.SlotStorage.set('sound', S.settings.sound);
                window.SlotAudio.enabled = S.settings.sound;
                self.el('sound-btn').textContent = S.settings.sound ? '🔊' : '🔇';
                if (S.settings.sound) window.SlotAudio.click();
            });
            this.el('sound-btn').textContent = window.SlotStorage.data.settings.sound ? '🔊' : '🔇';
            this.el('settings-btn').addEventListener('click', function () { self.showPanel('settings'); });
            this.el('daily-btn').addEventListener('click', function () { self.showPanel('daily'); });
            this.el('records-btn').addEventListener('click', function () { self.showPanel('records'); });
            this.el('panel-close').addEventListener('click', function () { self.closeModal('panel-modal'); });
            this.el('reveal-close').addEventListener('click', function () { self.closeModal('reveal-modal'); });
            this.el('story-close').addEventListener('click', function () { self.closeModal('story-modal'); });
            document.addEventListener('keydown', function (e) {
                if (e.key === ' ' && self.view === 'slots') { e.preventDefault(); self.startSpin(); }
                if (e.key === 'Escape') { self.closeModal('reveal-modal'); self.closeModal('story-modal'); self.closeModal('panel-modal'); }
            });
            window.addEventListener('resize', function () { self.resize(); });
            window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault(); self.deferredPrompt = e; self.el('install-btn').classList.remove('hidden');
            });
            this.el('install-btn').addEventListener('click', function () {
                if (!self.deferredPrompt) return;
                self.deferredPrompt.prompt();
                self.deferredPrompt.userChoice.then(function () { self.deferredPrompt = null; });
            });
        }
    };

    window.SlotUI = SlotUI;
})();
