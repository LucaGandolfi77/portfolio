/* NBA Sim — motore di simulazione evoluto */
(function () {
    'use strict';

    const Q_LEN = 720;
    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    function winProbability(diff, secondsLeft) {
        const scale = Math.max(6, Math.sqrt(Math.max(0, secondsLeft) / 60 + 1) * 6);
        return 1 / (1 + Math.exp(-diff / scale));
    }

    class Sim {
        constructor(home, away, opts) {
            this.opts = opts || {};
            this.home = clone(home);
            this.away = clone(away);
            this.players = {};
            const self = this;
            [['home', this.home], ['away', this.away]].forEach(function (pair) {
                const side = pair[0], team = pair[1];
                team.players.forEach(function (p, i) {
                    self.players[p.name] = {
                        name: p.name, side: side, pos: p.pos, ovr: p.ovr, off: p.off, def: p.def,
                        starter: i < 5, onCourt: i < 5, injured: false,
                        pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0,
                        orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0,
                        stamina: 100, streak: 0, ms: {}
                    };
                });
            });
            this.score = { home: 0, away: 0 };
            this.quarter = 1;
            this.clock = Q_LEN;
            this.possession = 'home';
            this.momentum = 0;
            this.leadChanges = 0;
            this.biggestLead = 0;
            this.lastLeader = null;
            this.quarters = [{ home: 0, away: 0 }, { home: 0, away: 0 }, { home: 0, away: 0 }, { home: 0, away: 0 }];
            this.events = [];
            this.shots = [];
            this.winProb = [];
            this.stepCount = 0;
            this.over = false;
            this.clutchAnnounced = false;
            this.arena = (home.name.split(' ').pop() || 'City') + ' Arena';
        }

        team(side) { return side === 'home' ? this.home : this.away; }
        opp(side) { return side === 'home' ? 'away' : 'home'; }
        onCourt(side) {
            const self = this;
            return this.team(side).players.filter(function (p) { return self.players[p.name].onCourt && !self.players[p.name].injured; })
                .map(function (p) { return self.players[p.name]; });
        }
        bench(side) {
            const self = this;
            return this.team(side).players.filter(function (p) { return !self.players[p.name].onCourt && !self.players[p.name].injured; })
                .map(function (p) { return self.players[p.name]; });
        }

        log(kind, extra) {
            extra = extra || {};
            const data = {
                kind: kind, clock: this.clock, quarter: this.quarter,
                score: { home: this.score.home, away: this.score.away },
                side: extra.side || null, player: extra.player || null,
                defender: extra.defender || null, points: extra.points || 0,
                it: window.NBAData.commentary('it', kind, extra.vars || {}),
                en: window.NBAData.commentary('en', kind, extra.vars || {})
            };
            this.events.push(data);
            return data;
        }

        pick(side) {
            const pool = this.onCourt(side);
            if (!pool.length) return null;
            const entries = pool.map(function (p) { return { p: p, weight: 1 + Math.max(0, p.ovr - 70) * 0.35 + p.stamina * 0.012 }; });
            let total = 0; entries.forEach(function (e) { total += e.weight; });
            let roll = Math.random() * total;
            for (let i = 0; i < entries.length; i++) { roll -= entries[i].weight; if (roll <= 0) return entries[i].p; }
            return entries[entries.length - 1].p;
        }

        isClutch() {
            return this.quarter === 4 && this.clock <= 120 && Math.abs(this.score.home - this.score.away) <= 6;
        }

        makeChance(shooter, defender, isThree, side) {
            let c = isThree ? 33 : 47;
            c += (shooter.off - 80) * 0.62 - (defender.def - 80) * 0.26;
            c += (shooter.ovr - 80) * 0.15;
            c *= 0.78 + shooter.stamina / 100 * 0.32;
            c *= 1 + this.momentum / 280;
            c *= 1 - (this.team(this.opp(side)).strategy.defense - 50) / 420;
            if (shooter.pf >= 5) c *= 0.92;
            if (this.isClutch()) c *= 0.95;
            return clamp(c, 8, 84);
        }

        addPoints(side, pts) {
            const prev = this.score.home - this.score.away;
            this.score[side] += pts;
            this.quarters[this.quarter - 1][side] += pts;
            const now = this.score.home - this.score.away;
            if (now !== 0 && (now > 0) !== (prev > 0)) {
                this.leadChanges++;
                if (Math.abs(now) >= 2) this.log('lead', { side: side, vars: { team: this.team(side).short } });
            }
            if (Math.abs(now) > this.biggestLead) this.biggestLead = Math.abs(now);
        }

        milestones(p) {
            if (p.pts >= 20 && !p.ms['20']) { p.ms['20'] = 1; this.log('milestone20', { side: p.side, vars: { p: p.name } }); }
            if (p.pts >= 30 && !p.ms['30']) { p.ms['30'] = 1; this.log('milestone30', { side: p.side, vars: { p: p.name } }); }
            if (p.tpm >= 5 && !p.ms['5x3']) { p.ms['5x3'] = 1; this.log('milestone5x3', { side: p.side, vars: { p: p.name } }); }
            const dd = (p.pts >= 10 && p.orb + p.drb >= 10) || (p.pts >= 10 && p.ast >= 10);
            if (dd && !p.ms['dd']) { p.ms['dd'] = 1; this.log('milestoneDD', { side: p.side, vars: { p: p.name } }); }
        }

        substitutions() {
            const self = this;
            ['home', 'away'].forEach(function (side) {
                const on = self.onCourt(side);
                on.forEach(function (p) {
                    p.stamina = Math.max(0, p.stamina - 0.55);
                    if (p.stamina < 34 || p.pf >= 5) {
                        const options = self.bench(side).filter(function (b) { return b.stamina > 45; })
                            .sort(function (a, b) { return b.ovr - a.ovr; });
                        if (options.length) {
                            p.onCourt = false;
                            options[0].onCourt = true;
                            self.log('sub', { side: side, vars: { p: options[0].name } });
                        }
                    }
                });
                self.bench(side).forEach(function (b) { b.stamina = Math.min(100, b.stamina + 0.7); });
            });
        }

        maybeInjury(p) {
            if (Math.random() < 0.0012 && !p.injured) {
                p.injured = true;
                p.onCourt = false;
                this.log('injury', { side: p.side, vars: { p: p.name } });
                return true;
            }
            return false;
        }

        shotCoords(isThree, side) {
            const x = 50 + (Math.random() - 0.5) * (isThree ? 58 : 30);
            const y = isThree ? 18 + Math.random() * 26 : 40 + Math.random() * 22;
            return { x: x, y: y, made: false, value: isThree ? 3 : 2, side: side, team: this.team(side).short };
        }

        tickClock(extra) {
            const paceH = this.home.strategy.pace, paceA = this.away.strategy.pace;
            const pace = (paceH + paceA) / 2;
            let t = (12 + Math.random() * 11) * (1 - (pace - 50) / 300) + (extra || 0);
            this.clock -= clamp(t, 4, 26);
            if (this.clock <= 0) this.endQuarter();
        }

        step() {
            if (this.over) return null;
            this.stepCount++;
            const side = this.possession;
            const other = this.opp(side);
            const shooter = this.pick(side);
            const defender = this.pick(other);
            if (!shooter || !defender) { this.tickClock(2); return null; }

            this.substitutions();
            if (this.maybeInjury(shooter)) { this.tickClock(3); return this.events[this.events.length - 1]; }

            if (this.isClutch() && !this.clutchAnnounced) {
                this.clutchAnnounced = true;
                this.log('clutch', {});
            }

            const roll = Math.random();
            let ev = null;

            if (roll < 0.07) {
                shooter.to++;
                shooter.streak = 0;
                this.momentum -= 5;
                ev = this.log('turnover', { side: side, vars: { p: shooter.name } });
                if (Math.random() < 0.55) {
                    defender.stl++;
                    ev = this.log('steal', { side: other, vars: { d: defender.name, p: shooter.name } });
                }
                this.possession = other;
                this.tickClock(6 + Math.random() * 7);
            } else if (roll < 0.105) {
                shooter.fta += 2;
                shooter.pf++;
                defender.pf++;
                ev = this.log('foul', { side: other, vars: { p: shooter.name } });
                let made = 0;
                const base = clamp(0.74 + (shooter.off - 80) * 0.004, 0.55, 0.95);
                for (let i = 0; i < 2; i++) {
                    if (Math.random() < base) {
                        made++; shooter.ftm++; shooter.pts++;
                        ev = this.log('ftMake', { side: side, vars: { p: shooter.name } });
                    } else {
                        ev = this.log('ftMiss', { side: side, vars: { p: shooter.name } });
                        if (Math.random() < 0.5) {
                            const rb = this.pick(other);
                            if (rb) rb.drb++;
                        }
                    }
                }
                if (made) {
                    this.addPoints(side, made);
                    this.milestones(shooter);
                    this.momentum += made * 2;
                }
                if (shooter.pf >= 6) {
                    shooter.onCourt = false;
                    this.log('foulout', { side: side, vars: { p: shooter.name } });
                }
                this.possession = other;
                this.tickClock(3 + Math.random() * 4);
            } else {
                const threeRate = this.team(side).strategy.threeRate;
                const isThree = Math.random() < clamp(0.22 + (threeRate - 50) / 180 + (shooter.off >= 92 ? 0.12 : 0), 0.08, 0.62);
                shooter.fga++;
                if (isThree) shooter.tpa++;
                const chance = this.makeChance(shooter, defender, isThree, side);
                const made = Math.random() * 100 < chance;
                const shot = this.shotCoords(isThree, side);
                shot.made = made;
                shot.player = shooter.name;
                this.shots.push(shot);

                if (made) {
                    const pts = isThree ? 3 : 2;
                    shooter.fgm++; shooter.pts += pts; shooter.streak++;
                    if (isThree) shooter.tpm++;
                    if (!isThree && Math.random() < 0.38) {
                        const mates = this.onCourt(side).filter(function (p) { return p.name !== shooter.name; });
                        if (mates.length) mates[Math.floor(Math.random() * mates.length)].ast++;
                    }
                    const isDunk = !isThree && Math.random() < 0.17;
                    const isBuzzer = this.clock <= 3.5;
                    const kind = isBuzzer ? 'buzzer' : isThree ? 'make3' : isDunk ? 'dunk' : 'make2';
                    ev = this.log(kind, { side: side, vars: { p: shooter.name } });
                    this.addPoints(side, pts);
                    this.milestones(shooter);
                    this.momentum += isThree ? 6 : isDunk ? 9 : 4;
                    if (shooter.streak >= 3 && Math.random() < 0.35) this.log('hot', { side: side, vars: { p: shooter.name } });
                    this.possession = other;
                    this.tickClock(isDunk ? 2 : 3);
                } else {
                    shooter.streak = 0;
                    this.momentum -= 3;
                    if (Math.random() < 0.11) {
                        defender.blk++;
                        ev = this.log('block', { side: other, vars: { d: defender.name, p: shooter.name } });
                        const rb = this.pick(other); if (rb) rb.drb++;
                        this.possession = other;
                        this.tickClock(4);
                    } else if (Math.random() < 0.14) {
                        const rb = this.pick(side);
                        if (rb) rb.orb++;
                        ev = this.log('orb', { side: side, vars: { p: rb ? rb.name : shooter.name } });
                        this.possession = side;
                        this.tickClock(2);
                    } else {
                        const rb = this.pick(other); if (rb) rb.drb++;
                        ev = this.log('miss', { side: other, vars: { p: shooter.name } });
                        this.possession = other;
                        this.tickClock(2);
                    }
                }
            }

            this.momentum = clamp(this.momentum, -100, 100);
            if (this.stepCount % 4 === 0) {
                this.winProb.push({ t: this.stepCount, p: winProbability(this.score.home - this.score.away, (4 - this.quarter) * Q_LEN + this.clock) });
            }
            return ev;
        }

        endQuarter() {
            if (this.over) return;
            const ended = this.quarter;
            if (ended === 4) { this.finish(); return; }
            this.quarter++;
            this.clock = Q_LEN;
            this.log('quarter', { vars: { num: ended, home: this.home.short, away: this.away.short, hs: this.score.home, as: this.score.away } });
            if (ended === 2) {
                const top = this.topScorer();
                this.log('halftime', { vars: { home: this.home.short, away: this.away.short, hs: this.score.home, as: this.score.away, top: top.name, pts: top.pts } });
            }
        }

        topScorer() {
            let best = null;
            const self = this;
            Object.keys(this.players).forEach(function (n) {
                if (!best || self.players[n].pts > self.players[best].pts) best = n;
            });
            return best ? { name: best, pts: this.players[best].pts, side: this.players[best].side } : { name: '-', pts: 0, side: 'home' };
        }

        finish() {
            if (this.over) return;
            this.over = true;
            const winner = this.score.home > this.score.away ? 'home' : this.score.away > this.score.home ? 'away' : 'tie';
            this.log('win', { side: winner === 'tie' ? null : winner, vars: { team: winner === 'tie' ? 'Nobody' : this.team(winner).name, hs: this.score.home, as: this.score.away } });
        }

        summary() {
            return {
                home: this.home.short, away: this.away.short,
                homeName: this.home.name, awayName: this.away.name,
                homeColor: this.home.color, awayColor: this.away.color,
                score: Object.assign({}, this.score),
                quarters: this.quarters.map(function (q) { return Object.assign({}, q); }),
                players: clone(this.players),
                events: this.events, shots: this.shots, winProb: this.winProb,
                leadChanges: this.leadChanges, biggestLead: this.biggestLead,
                top: this.topScorer(), winner: this.score.home > this.score.away ? 'home' : this.score.away > this.score.home ? 'away' : 'tie',
                steps: this.stepCount
            };
        }
    }

    function simulateGame(home, away, opts) {
        const sim = new Sim(home, away, opts);
        let guard = 0;
        while (!sim.over && guard++ < 4000) sim.step();
        return sim.summary();
    }

    window.NBAEngine = { Sim: Sim, simulateGame: simulateGame, winProbability: winProbability, Q_LEN: Q_LEN };
})();
