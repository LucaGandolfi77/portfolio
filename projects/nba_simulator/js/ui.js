/* NBA Sim — interfaccia app */
(function () {
    'use strict';

    const $ = function (id) { return document.getElementById(id); };
    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    const NBAUI = {
        lang: 'it',
        sim: null,
        summary: null,
        running: false,
        paused: false,
        speed: 1,
        over: false,
        resume: null,
        view: 'match',
        court: null,
        lastFrame: 0,
        deferredPrompt: null,
        toastTimer: null,

        init: function () {
            window.NBAStorage.load();
            this.lang = window.NBAStorage.data.settings.lang || 'it';
            window.NBAAudio.enabled = window.NBAStorage.data.settings.sound;
            this.court = new window.NBACourt($('court'));
            this.court.resize();
            this.buildTeams();
            this.bind();
            this.setLang(this.lang, true);
            this.renderAllViews();
            this.frame = this.frame.bind(this);
            requestAnimationFrame(this.frame);
            return this;
        },

        t: function (key, vars) { return window.NBAData.commentary(this.lang, key, vars || {}); },
        label: function (it, en) { return this.lang === 'it' ? it : en; },

        buildTeams: function () {
            const self = this;
            const keys = Object.keys(window.NBAData.TEAMS);
            ['home-select', 'away-select', 'pred-home', 'pred-away', 'editor-select'].forEach(function (id) {
                const el = $(id);
                if (!el) return;
                el.innerHTML = '';
                keys.forEach(function (k) {
                    const o = document.createElement('option');
                    o.value = k; o.textContent = window.NBAData.TEAMS[k].name + ' (' + k + ')';
                    el.appendChild(o);
                });
            });
            const m = window.NBAStorage.data.matchup;
            $('home-select').value = m.home || 'LAL';
            $('away-select').value = m.away || 'BOS';
            if (m.prediction) $('pred-home').value = m.prediction;
            self.syncColors();
        },

        bind: function () {
            const self = this;
            document.querySelectorAll('.nav-btn').forEach(function (b) {
                b.addEventListener('click', function () { self.switchView(b.dataset.view); });
            });
            $('btn-random').addEventListener('click', function () {
                const keys = window.NBAData.keys;
                let h, a;
                do { h = keys[Math.floor(Math.random() * keys.length)]; a = keys[Math.floor(Math.random() * keys.length)]; } while (h === a);
                $('home-select').value = h; $('away-select').value = a;
                self.syncColors();
                window.NBAAudio.click();
            });
            ['home-select', 'away-select'].forEach(function (id) {
                $(id).addEventListener('change', function () { self.syncColors(); });
            });
            $('btn-tipoff').addEventListener('click', function () { self.startMatch(); });
            $('btn-pause').addEventListener('click', function () { self.togglePause(); });
            $('btn-speed').addEventListener('click', function () { self.cycleSpeed(); });
            $('btn-sound').addEventListener('click', function () {
                const d = window.NBAStorage.data;
                d.settings.sound = !d.settings.sound;
                window.NBAStorage.set('sound', d.settings.sound);
                window.NBAAudio.enabled = d.settings.sound;
                $('btn-sound').textContent = d.settings.sound ? '🔊 Sound' : '🔇 Muted';
                if (d.settings.sound) window.NBAAudio.click();
            });
            $('btn-sound').textContent = window.NBAStorage.data.settings.sound ? '🔊 Sound' : '🔇 Muted';
            $('btn-reset').addEventListener('click', function () { self.resetToSetup(); });
            $('btn-rematch').addEventListener('click', function () { self.startMatch(); });
            $('btn-newmatch').addEventListener('click', function () { self.resetToSetup(); });
            $('tab-box').addEventListener('click', function () { self.showStatTab('box'); });
            $('tab-team').addEventListener('click', function () { self.showStatTab('team'); });

            $('lang-it').addEventListener('click', function () { self.setLang('it'); });
            $('lang-en').addEventListener('click', function () { self.setLang('en'); });
            $('sound-btn').addEventListener('click', function () { $('btn-sound').click(); });

            $('btn-new-season').addEventListener('click', function () { self.newSeason(); });
            $('btn-play-week').addEventListener('click', function () { self.playWeek(); });
            $('btn-create-playoffs').addEventListener('click', function () { self.createPlayoffs(); });
            $('btn-play-round').addEventListener('click', function () { self.playRound(); });

            $('editor-select').addEventListener('change', function () { self.renderRosterEditor(); });
            $('btn-save-team').addEventListener('click', function () { self.saveTeam(); });
            $('btn-create-team').addEventListener('click', function () { self.createTeam(); });

            $('replay-close').addEventListener('click', function () { $('replay-modal').classList.add('hidden'); });

            window.addEventListener('resize', function () { self.court.resize(); });
            document.addEventListener('visibilitychange', function () {
                if (document.hidden && self.running && !self.paused) self.pause();
            });
            document.addEventListener('keydown', function (e) {
                const tag = (e.target.tagName || '').toLowerCase();
                if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
                if (e.code === 'Space' && self.running) { e.preventDefault(); self.togglePause(); }
                else if (e.code === 'Digit1') self.setSpeed(1);
                else if (e.code === 'Digit2') self.setSpeed(5);
                else if (e.code === 'Digit3') self.setSpeed(20);
            });
            window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault(); self.deferredPrompt = e; $('install-btn').classList.remove('hidden');
            });
            $('install-btn').addEventListener('click', function () {
                if (!self.deferredPrompt) return;
                self.deferredPrompt.prompt();
                self.deferredPrompt.userChoice.then(function () { self.deferredPrompt = null; });
            });
        },

        setLang: function (lang, silent) {
            this.lang = lang;
            window.NBAStorage.set('lang', lang);
            $('lang-it').classList.toggle('on', lang === 'it');
            $('lang-en').classList.toggle('on', lang === 'en');
            if (!silent) {
                this.toast(this.label('Lingua aggiornata', 'Language updated'));
                this.renderAllViews();
            }
        },

        switchView: function (name) {
            this.view = name;
            document.querySelectorAll('.view').forEach(function (v) { v.classList.add('hidden'); });
            $('view-' + name).classList.remove('hidden');
            document.querySelectorAll('.nav-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.view === name); });
            if (name === 'season') this.renderSeason();
            if (name === 'playoffs') this.renderPlayoffs();
            if (name === 'teams') this.renderRosterEditor();
            if (name === 'stats') this.renderStats();
            if (name === 'history') this.renderHistory();
            if (name === 'match') this.court.resize();
            window.NBAAudio.click();
        },

        renderAllViews: function () {
            this.renderSeason(); this.renderPlayoffs(); this.renderRosterEditor();
            this.renderStats(); this.renderHistory();
        },

        toast: function (msg) {
            const el = $('toast');
            el.textContent = msg; el.classList.add('show');
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
        },

        syncColors: function () {
            const h = window.NBAData.TEAMS[$('home-select').value];
            const a = window.NBAData.TEAMS[$('away-select').value];
            if (h) document.documentElement.style.setProperty('--home-c', h.color);
            if (a) document.documentElement.style.setProperty('--away-c', a.color);
            const m = window.NBAStorage.data.matchup;
            m.home = $('home-select').value; m.away = $('away-select').value;
            m.prediction = $('pred-home').value || null;
            window.NBAStorage.save();
        },

        /* ---------------- partita ---------------- */
        startMatch: function () {
            const hk = $('home-select').value, ak = $('away-select').value;
            if (hk === ak) { this.toast(this.label('Scegli due squadre diverse', 'Pick two different teams')); return; }
            const T = Object.assign({}, window.NBAData.TEAMS, this.customTeamMap());
            this.sim = new window.NBAEngine.Sim(T[hk], T[ak]);
            this.summary = null;
            this.over = false; this.paused = false; this.running = true;
            this.court.setPlayers(Object.keys(this.sim.players).map(function (n) { return this.sim.players[n]; }, this));
            this.court.ball = null; this.court.flash = 0;
            $('game-feed').innerHTML = ''; $('feed-count').textContent = '0 ' + this.label('eventi', 'events');
            $('lower-third').textContent = this.t('intro', { arena: this.sim.arena, home: this.sim.home.name, away: this.sim.away.name });
            $('home-name').textContent = this.sim.home.short;
            $('away-name').textContent = this.sim.away.short;
            $('setup-card').classList.add('hidden');
            $('match-card').classList.remove('hidden');
            $('final-card').classList.add('hidden');
            $('controls').classList.remove('hidden');
            const pred = $('pred-home').value || null;
            if (pred) {
                const pname = pred === 'home' ? T[hk].short : pred === 'away' ? T[ak].short : this.label('Pareggio', 'Draw');
                this.toast(this.t('prediction', { team: pname }));
            }
            this.sim.log('tipoff', {});
            this.pushFeed(this.sim.events[0]);
            this.updateLive();
            window.NBAAudio.init(); window.NBAAudio.click();
            this.loop();
        },

        async loop() {
            while (this.running && !this.over) {
                if (this.paused) await new Promise(function (r) { NBAUI.resume = r; });
                await sleep(820 / this.speed);
                if (!this.running || this.over) break;
                const ev = this.sim.step();
                if (ev) { this.pushFeed(ev); this.animateEvent(ev); }
                this.updateLive();
                if (this.sim.over) { this.finishMatch(); break; }
            }
        },

        animateEvent: function (ev) {
            const shooter = this.sim.players[ev.player];
            if (ev.kind === 'make3' || ev.kind === 'dunk' || ev.kind === 'make2' || ev.kind === 'buzzer') {
                const shot = this.sim.shots[this.sim.shots.length - 1];
                this.court.shot(ev.player, ev.kind === 'make3', true, ev.side === 'home' ? this.sim.home.color : this.sim.away.color);
                if (ev.kind === 'make3') window.NBAAudio.three();
                else if (ev.kind === 'dunk') window.NBAAudio.dunk();
                $('lower-third').textContent = ev[this.lang];
            } else if (ev.kind === 'miss' || ev.kind === 'block' || ev.kind === 'steal') {
                $('lower-third').textContent = ev[this.lang];
            }
        },

        pushFeed: function (ev) {
            if (!ev) return;
            const feed = $('game-feed');
            const div = document.createElement('div');
            div.className = 'feed-item ' + this.feedClass(ev.kind);
            div.innerHTML = '<span class="stamp">' + this.fmtClock(ev.clock) + '</span><span>' + ev[this.lang] + '</span>';
            feed.prepend(div);
            $('feed-count').textContent = this.sim.events.length + ' ' + this.label('eventi', 'events');
            while (feed.children.length > 400) feed.removeChild(feed.lastChild);
            feed.scrollTop = 0;
        },

        feedClass: function (kind) {
            if (kind === 'make3') return 'three';
            if (kind === 'dunk' || kind === 'buzzer') return 'dunk';
            if (kind === 'miss' || kind === 'block' || kind === 'turnover' || kind === 'foulout' || kind === 'injury') return 'bad';
            if (kind === 'orb' || kind === 'foul' || kind === 'ftMake' || kind === 'ftMiss' || kind === 'sub') return 'stat';
            if (kind === 'milestone20' || kind === 'milestone30' || kind === 'milestone5x3' || kind === 'milestoneDD' || kind === 'lead' || kind === 'clutch' || kind === 'hot') return 'milestone';
            if (kind === 'quarter' || kind === 'halftime' || kind === 'win') return 'quarter';
            if (kind === 'intro' || kind === 'tipoff' || kind === 'aside' || kind === 'prediction') return 'intro';
            return 'score';
        },

        fmtClock: function (s) {
            s = Math.max(0, Math.round(s));
            return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
        },

        updateLive: function () {
            const s = this.sim;
            $('sb-home-score').textContent = s.score.home;
            $('sb-away-score').textContent = s.score.away;
            $('sb-quarter').textContent = 'Q' + s.quarter;
            $('sb-clock').textContent = this.fmtClock(s.clock);
            $('sb-poss').textContent = '● ' + (s.possession === 'home' ? s.home.short : s.away.short) + ' BALL';
            const m = Math.round(s.momentum);
            $('sb-momentum').textContent = (m > 0 ? '▲ ' : m < 0 ? '▼ ' : '') + Math.abs(m);
            $('sb-momentum').style.color = m > 10 ? '#34d399' : m < -10 ? '#fb7185' : '#93a0c0';
            $('sb-clutch').classList.toggle('hidden', !s.isClutch());
            const diff = s.score.home - s.score.away;
            $('sb-home-lead').textContent = diff > 0 ? '▲ +' + diff : '';
            $('sb-away-lead').textContent = diff < 0 ? '▲ +' + (-diff) : '';
            this.renderBox();
            this.renderTeamStats();
        },

        renderBox: function () {
            if (!this.sim) return;
            const s = this.sim;
            let rows = '<tr><th>PLAYER</th><th>PTS</th><th>REB</th><th>AST</th><th>FG</th><th>3PT</th><th>FT</th><th>ST</th><th>BK</th><th>TO</th><th>PF</th></tr>';
            const top = s.topScorer().name;
            ['home', 'away'].forEach(function (side) {
                const team = s.team(side);
                rows += '<tr class="team-row"><td colspan="11" style="color:' + team.color + '">' + team.short + ' — ' + team.name + '</td></tr>';
                team.players.forEach(function (p) {
                    const st = s.players[p.name];
                    rows += '<tr class="' + (p.name === top ? 'top' : '') + '"><td class="pname">' + (st.injured ? '🚑 ' : p.name === top ? '⭐ ' : '') + p.name +
                        '</td><td><b>' + st.pts + '</b></td><td>' + (st.orb + st.drb) + '</td><td>' + st.ast + '</td><td>' + st.fgm + '-' + st.fga +
                        '</td><td>' + st.tpm + '-' + st.tpa + '</td><td>' + st.ftm + '-' + st.fta + '</td><td>' + st.stl + '</td><td>' + st.blk + '</td><td>' + st.to + '</td><td>' + st.pf + '</td></tr>';
                });
            });
            $('box-score').innerHTML = '<div class="table-wrap"><table class="stat-table">' + rows + '</table></div>';
            const le = window.NBAStats.leaders(this.fakeSummary(s), 2);
            $('leaders').innerHTML = le.map(function (p) {
                const col = p.side === 'home' ? s.home.color : s.away.color;
                return '<div class="leader-chip"><div class="pts" style="color:' + col + '">' + p.pts + '</div><div class="who">' + p.name + '</div></div>';
            }).join('');
        },

        fakeSummary: function (s) {
            return { players: s.players, score: s.score, home: s.home.short, away: s.away.short };
        },

        renderTeamStats: function () {
            if (!this.sim) return;
            const rows = window.NBAStats.comparison(this.fakeSummary(this.sim));
            $('team-stats').innerHTML = rows.map(function (r) {
                const max = Math.max(1, r.h, r.a);
                return '<div class="cmp-row"><span class="v home">' + r.h + '</span><div class="cmp-bar"><div class="away" style="width:' + (r.a / max * 100) + '%"></div></div>' +
                    '<span class="label">' + r.label + '</span><div class="cmp-bar"><div class="home" style="width:' + (r.h / max * 100) + '%"></div></div><span class="v away">' + r.a + '</span></div>';
            }).join('');
        },

        showStatTab: function (which) {
            $('tab-box').classList.toggle('on', which === 'box');
            $('tab-team').classList.toggle('on', which === 'team');
            $('box-score').classList.toggle('hidden', which !== 'box');
            $('team-stats').classList.toggle('hidden', which !== 'team');
        },

        togglePause: function () {
            if (!this.running || this.over) return;
            this.paused = !this.paused;
            $('btn-pause').textContent = this.paused ? '▶ Resume' : '⏸ Pause';
            if (!this.paused && this.resume) { const r = this.resume; this.resume = null; r(); }
        },
        pause: function () { if (this.running && !this.paused) this.togglePause(); },
        cycleSpeed: function () { this.setSpeed(this.speed === 1 ? 5 : this.speed === 5 ? 20 : 1); },
        setSpeed: function (v) {
            this.speed = v;
            $('btn-speed').textContent = 'Speed ' + v + 'x';
        },

        finishMatch: function () {
            this.over = true; this.running = false;
            this.summary = this.sim.summary();
            window.NBAAudio.buzzer();
            window.NBAAudio.win();
            const s = this.summary;
            const win = s.winner === 'home' ? s.homeName : s.winner === 'away' ? s.awayName : this.label('Pareggio', 'Draw');
            $('final-score').textContent = s.score.home + ' - ' + s.score.away;
            $('final-score').style.color = s.winner === 'home' ? s.homeColor : s.winner === 'away' ? s.awayColor : '#eef2ff';
            $('final-mvp').textContent = '🏅 MVP: ' + s.top.name + ' — ' + s.top.pts + ' ' + this.label('punti', 'pts');
            $('final-extra').textContent = this.label('Cambi di leadership', 'Lead changes') + ': ' + s.leadChanges + ' · ' + this.label('Massimo vantaggio', 'Biggest lead') + ': ' + s.biggestLead;
            $('final-card').classList.remove('hidden');
            $('controls').classList.add('hidden');
            $('lower-third').textContent = this.t('win', { team: win, hs: s.score.home, as: s.score.away });
            const pred = $('pred-home').value || null;
            window.NBAStorage.recordPrediction(pred, s.winner);
            window.NBAStorage.addHistory({
                id: Date.now(), home: s.home, away: s.away, hs: s.score.home, as: s.score.away,
                winner: s.winner, top: s.top.name, date: Date.now(),
                replay: s.events.slice(-80).map(function (e) { return { it: e.it, en: e.en, clock: e.clock, kind: e.kind }; }),
                summary: { score: s.score, quarters: s.quarters, players: s.players, shots: s.shots, winProb: s.winProb, leadChanges: s.leadChanges, biggestLead: s.biggestLead }
            });
            this.renderHistory();
            this.renderStats();
            if (window.confetti) {
                const colors = [s.homeColor, s.awayColor, '#fbbf24'];
                window.confetti({ particleCount: 120, spread: 85, origin: { y: .55 }, colors: colors });
            }
        },

        resetToSetup: function () {
            this.running = false; this.paused = false; this.over = false;
            if (this.resume) { const r = this.resume; this.resume = null; r(); }
            $('setup-card').classList.remove('hidden');
            $('match-card').classList.add('hidden');
            $('final-card').classList.add('hidden');
            $('controls').classList.add('hidden');
        },

        frame: function (now) {
            const dt = Math.min(50, now - (this.lastFrame || now));
            this.lastFrame = now;
            if (this.sim && this.view === 'match') {
                this.court.setPlayers(Object.keys(this.sim.players).map(function (n) { return this.sim.players[n]; }, this));
                this.court.render(dt, { home: this.sim.home.color, away: this.sim.away.color });
            }
            requestAnimationFrame(this.frame);
        },

        /* ---------------- stagione ---------------- */
        newSeason: function () {
            const keys = window.NBAData.keys;
            window.NBAStorage.data.season = window.NBASeason.newSeason(keys);
            window.NBAStorage.data.playoffs = null;
            window.NBAStorage.save();
            this.renderSeason();
            this.toast(this.label('Nuova stagione creata', 'New season created'));
        },

        playWeek: function () {
            const d = window.NBAStorage.data;
            if (!d.season) this.newSeason();
            const season = window.NBAStorage.data.season;
            if (season.week >= season.weeks.length) { this.toast(this.label('Stagione finita', 'Season over')); return; }
            const T = Object.assign({}, window.NBAData.TEAMS, this.customTeamMap());
            const res = window.NBASeason.playWeek(season, window.NBAEngine.simulateGame, T);
            window.NBAStorage.save();
            this.renderSeason();
            this.toast(this.label('Settimana', 'Week') + ' ' + season.week + ' ' + this.label('completata', 'completed'));
        },

        renderSeason: function () {
            const season = window.NBAStorage.data.season;
            if (!season) {
                $('standings').innerHTML = '<p class="empty">' + this.label('Nessuna stagione. Creane una per iniziare.', 'No season. Create one to start.') + '</p>';
                $('week-label').textContent = '—';
                $('week-results').innerHTML = '';
                return;
            }
            const rows = window.NBASeason.standingsSorted(season);
            $('week-label').textContent = this.label('Settimana', 'Week') + ' ' + season.week + ' / ' + season.weeks.length;
            $('standings').innerHTML = '<table class="stat-table"><tr><th>#</th><th>TEAM</th><th>W</th><th>L</th><th>DIFF</th></tr>' +
                rows.map(function (r, i) {
                    return '<tr><td>' + (i + 1) + '</td><td class="pname">' + r.team + '</td><td><b>' + r.w + '</b></td><td>' + r.l + '</td><td>' + (r.diff > 0 ? '+' : '') + r.diff + '</td></tr>';
                }).join('') + '</table>';
            const last = season.results.slice(-7).reverse();
            $('week-results').innerHTML = last.map(function (r) {
                return '<div class="mini-result"><b>' + r.home + '</b> ' + r.hs + ' – ' + r.as + ' <b>' + r.away + '</b></div>';
            }).join('');
        },

        /* ---------------- playoff ---------------- */
        createPlayoffs: function () {
            const d = window.NBAStorage.data;
            if (!d.season) { this.toast(this.label('Crea prima una stagione', 'Create a season first')); return; }
            const seeds = window.NBASeason.standingsSorted(d.season).slice(0, 8).map(function (r) { return r.team; });
            d.playoffs = window.NBAPlayoffs.createBracket(seeds, 8);
            window.NBAStorage.save();
            this.renderPlayoffs();
        },

        playRound: function () {
            const d = window.NBAStorage.data;
            if (!d.playoffs) { this.createPlayoffs(); if (!d.playoffs) return; }
            const T = Object.assign({}, window.NBAData.TEAMS, this.customTeamMap());
            window.NBAPlayoffs.playRound(d.playoffs, window.NBAEngine.simulateGame, T);
            window.NBAStorage.save();
            this.renderPlayoffs();
            window.NBAAudio.click();
        },

        renderPlayoffs: function () {
            const p = window.NBAStorage.data.playoffs;
            if (!p) { $('bracket').innerHTML = '<p class="empty">' + this.label('Nessun playoff. Crea il bracket dalla classifica.', 'No playoffs. Create the bracket from the standings.') + '</p>'; $('champion').textContent = ''; return; }
            let html = '';
            p.rounds.forEach(function (r) {
                html += '<div class="bracket-round"><h4>' + r.name + '</h4>';
                r.matchups.forEach(function (m) {
                    html += '<div class="bracket-match ' + (m.winner ? 'done' : '') + '"><span class="' + (m.winner === m.a ? 'win' : '') + '">' + m.a + ' <b>' + m.wins[0] + '</b></span>' +
                        '<span class="sep">vs</span><span class="' + (m.winner === m.b ? 'win' : '') + '"><b>' + m.wins[1] + '</b> ' + m.b + '</span></div>';
                });
                html += '</div>';
            });
            $('bracket').innerHTML = html;
            $('champion').textContent = p.champion ? '🏆 ' + this.label('Campione', 'Champion') + ': ' + p.champion : '';
        },

        /* ---------------- squadre ---------------- */
        customTeamMap: function () {
            const map = {};
            window.NBAStorage.data.customTeams.forEach(function (t) { map[t.short] = window.NBAData.expandTeam(t); });
            return map;
        },

        renderRosterEditor: function () {
            const key = $('editor-select').value;
            const T = Object.assign({}, window.NBAData.TEAMS, this.customTeamMap());
            const team = T[key];
            if (!team) return;
            const self = this;
            $('roster-editor').innerHTML = '<table class="stat-table"><tr><th>PLAYER</th><th>POS</th><th>OVR</th><th>OFF</th><th>DEF</th></tr>' +
                team.players.map(function (p, i) {
                    return '<tr><td class="pname">' + p.name + '</td><td>' + p.pos + '</td>' +
                        '<td><input type="number" min="50" max="99" value="' + p.ovr + '" data-i="' + i + '" data-k="ovr" class="ovr-input"></td>' +
                        '<td><input type="number" min="50" max="99" value="' + p.off + '" data-i="' + i + '" data-k="off" class="ovr-input"></td>' +
                        '<td><input type="number" min="50" max="99" value="' + p.def + '" data-i="' + i + '" data-k="def" class="ovr-input"></td></tr>';
                }).join('') + '</table>';
            $('strat-pace').value = team.strategy.pace;
            $('strat-three').value = team.strategy.threeRate;
            $('strat-defense').value = team.strategy.defense;
            $('strat-rotation').value = team.strategy.rotation;
            this._editorTeam = team;
        },

        saveTeam: function () {
            const team = JSON.parse(JSON.stringify(this._editorTeam));
            document.querySelectorAll('.ovr-input').forEach(function (inp) {
                const p = team.players[Number(inp.dataset.i)];
                if (p) p[inp.dataset.k] = Math.max(50, Math.min(99, Number(inp.value) || p[inp.dataset.k]));
            });
            team.strategy = {
                pace: Number($('strat-pace').value), threeRate: Number($('strat-three').value),
                defense: Number($('strat-defense').value), rotation: Number($('strat-rotation').value)
            };
            window.NBAStorage.addCustomTeam(team);
            this.buildTeams();
            this.toast(this.label('Squadra salvata', 'Team saved'));
        },

        createTeam: function () {
            const name = ($('new-team-name').value || '').trim();
            if (!name) { this.toast(this.label('Inserisci un nome', 'Enter a name')); return; }
            const short = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'CUS';
            const base = window.NBAData.TEAMS.LAL;
            const team = { name: name, short: short, color: '#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'), players: JSON.parse(JSON.stringify(base.players)), strategy: Object.assign({}, window.NBAData.DEFAULT_STRATEGY) };
            window.NBAStorage.addCustomTeam(team);
            this.buildTeams();
            $('editor-select').value = short;
            this.renderRosterEditor();
            this.toast(this.label('Squadra creata', 'Team created'));
        },

        /* ---------------- statistiche ---------------- */
        renderStats: function () {
            const hist = window.NBAStorage.data.history;
            if (!hist.length || !hist[0].summary) {
                $('chart-quarters').getContext('2d').clearRect(0, 0, 800, 150);
                $('stats-leaders').innerHTML = '<p class="empty">' + this.label('Gioca una partita per vedere i grafici.', 'Play a game to see charts.') + '</p>';
                return;
            }
            const s = hist[0].summary;
            window.NBACharts.bars($('chart-quarters'), s.quarters.map(function (q) { return q.home; }), ['#fbbf24', '#22d3ee', '#a78bfa', '#e879f9']);
            window.NBACharts.line($('chart-prob'), s.winProb, '#a78bfa');
            window.NBACharts.shotChart($('chart-shots'), s.shots);
            const T = Object.assign({}, window.NBAData.TEAMS, this.customTeamMap());
            const fake = { players: s.players, score: s.score, home: hist[0].home, away: hist[0].away };
            const cmp = window.NBAStats.comparison(fake);
            window.NBACharts.comparison($('chart-compare'), cmp);
            const le = window.NBAStats.leaders(fake, 8);
            $('stats-leaders').innerHTML = '<table class="stat-table"><tr><th>PLAYER</th><th>PTS</th><th>REB</th><th>AST</th><th>EFF</th></tr>' +
                le.map(function (p) { return '<tr><td class="pname">' + p.name + '</td><td><b>' + p.pts + '</b></td><td>' + p.reb + '</td><td>' + p.ast + '</td><td>' + p.eff + '</td></tr>'; }).join('') + '</table>';
            const zones = window.NBAStats.shotZones(s.shots);
            $('shot-zones').innerHTML = Object.keys(zones).map(function (z) {
                const v = zones[z];
                return '<div class="zone-pill">' + z + ' ' + (v.a ? Math.round(v.m / v.a * 100) : 0) + '% <small>' + v.m + '/' + v.a + '</small></div>';
            }).join('');
        },

        /* ---------------- storico ---------------- */
        renderHistory: function () {
            const hist = window.NBAStorage.data.history;
            if (!hist.length) { $('history-list').innerHTML = '<p class="empty">' + this.label('Nessuna partita giocata.', 'No games played.') + '</p>'; return; }
            $('history-list').innerHTML = hist.map(function (g) {
                return '<button class="history-card" data-id="' + g.id + '"><b>' + g.home + ' ' + g.hs + ' – ' + g.as + ' ' + g.away + '</b>' +
                    '<small>MVP: ' + g.top + ' · ' + new Date(g.date).toLocaleDateString() + '</small></button>';
            }).join('');
            const self = this;
            document.querySelectorAll('.history-card').forEach(function (b) {
                b.addEventListener('click', function () { self.showReplay(Number(b.dataset.id)); });
            });
        },

        showReplay: function (id) {
            const g = window.NBAStorage.data.history.find(function (x) { return x.id === id; });
            if (!g) return;
            const replays = g.replay || [];
            $('replay-feed').innerHTML = '<h3>' + g.home + ' ' + g.hs + ' – ' + g.as + ' ' + g.away + '</h3>' +
                replays.map(function (e) {
                    return '<div class="feed-item ' + NBAUI.feedClass(e.kind) + '"><span class="stamp">' + NBAUI.fmtClock(e.clock) + '</span><span>' + e[NBAUI.lang] + '</span></div>';
                }).join('');
            $('replay-modal').classList.remove('hidden');
        }
    };

    window.NBAUI = NBAUI;
})();
