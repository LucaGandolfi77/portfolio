/* Deterministic basketball simulation engine (DOM-free) */

import { PLAYBOOKS, DEFENSES, choosePlay, counterDefense, adjustments } from './ai.js';
import { pair } from './commentary.js';
import { effectiveFG, trueShooting } from './stats.js';

export const Q_LEN = 720;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length) % arr.length];

function makePlayer(p) {
  return {
    ...p,
    pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0,
    orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0,
    stamina: 100, minutes: 0, plusMinus: 0, injury: p.injury || null
  };
}

export class Sim {
  constructor(home, away, options = {}) {
    this.rng = options.rng || Math.random;
    this.lang = options.lang || 'it';
    this.teams = {
      home: { ...home, strategy: { ...home.strategy } },
      away: { ...away, strategy: { ...away.strategy } }
    };
    this.players = {};
    for (const side of ['home', 'away']) {
      this.teams[side].players.forEach(p => { this.players[p.id] = makePlayer(p); });
    }
    this.onCourt = {
      home: this.teams.home.players.slice(0, 5).map(p => p.id),
      away: this.teams.away.players.slice(0, 5).map(p => p.id)
    };
    this.quarter = 1;
    this.overtime = 0;
    this.clock = Q_LEN;
    this.possession = 'home';
    this.score = { home: 0, away: 0 };
    this.quarters = [];
    this.qStart = { home: 0, away: 0 };
    this.events = [];
    this.shots = [];
    this.winProb = [];
    this.momentum = 0;
    this.leadChanges = 0;
    this.biggestLead = 0;
    this.lastLeader = null;
    this.possessions = 0;
    this.finished = false;
    this.play = null;
    this.defense = null;
    this.cfg = { fouls: true, injuries: true, overtime: true, ...options.config };
    this.log('tipoff', { t: this.teams.home.abbr });
  }

  get leader() { return this.score.home === this.score.away ? 'tie' : this.score.home > this.score.away ? 'home' : 'away'; }
  get gap() { return Math.abs(this.score.home - this.score.away); }
  get clutch() { return this.quarter >= 4 && this.clock <= 120 && this.gap <= 6; }
  get opponent() { return this.possession === 'home' ? 'away' : 'home'; }

  log(kind, vars = {}) {
    this.events.push({
      kind, q: this.quarter + this.overtime, clock: Math.round(this.clock),
      ...pair(kind, vars, this.rng),
      score: { ...this.score }
    });
    if (this.events.length > 800) this.events.splice(0, this.events.length - 800);
  }

  onCourtPlayers(side) { return this.onCourt[side].map(id => this.players[id]).filter(Boolean); }

  activePlayer(side, position) {
    const list = this.onCourtPlayers(side);
    return list.find(p => p.pos === position) || list[0];
  }

  addPoints(side, points, shooter, assister) {
    this.score[side] += points;
    shooter.pts += points;
    if (assister) assister.ast += 1;
    for (const p of this.onCourtPlayers(this.opponent)) p.plusMinus -= points;
    for (const p of this.onCourtPlayers(side)) p.plusMinus += points;
    const leader = this.leader;
    if (leader !== this.lastLeader && leader !== 'tie') { this.leadChanges += 1; this.lastLeader = leader; }
    this.biggestLead = Math.max(this.biggestLead, this.gap);
  }

  maybeSubstitute(side) {
    const team = this.teams[side];
    const rotation = team.strategy.rotation || 50;
    const threshold = 46 - rotation * 0.22;
    const on = this.onCourtPlayers(side);
    const bench = team.players.filter(p => !this.onCourt[side].includes(p.id) && !p.injury);
    for (const p of on) {
      if (p.stamina < threshold || p.pf >= 5) {
        const sub = bench.filter(b => b.stamina > 55).sort((a, b) => b.ovr - a.ovr)[0];
        if (!sub) continue;
        const idx = this.onCourt[side].indexOf(p.id);
        this.onCourt[side][idx] = sub.id;
        this.log('substitution', { p: sub.name });
        break;
      }
    }
  }

  maybeInjury(side) {
    if (!this.cfg.injuries || this.rng() > 0.0009) return false;
    const p = pick(this.onCourtPlayers(side), this.rng);
    p.injury = 'day-to-day';
    this.log('injury', { p: p.name });
    return true;
  }

  chooseShot(side) {
    const team = this.teams[side];
    const play = choosePlay(team, this.rng, this.quarter >= 4 ? 2 : 0);
    this.play = play;
    const defense = counterDefense(play, null, this.rng);
    this.defense = defense;
    if (this.rng() < 0.35) this.log('play', { t: team.abbr, play: PLAYBOOKS[play].name });
    const book = PLAYBOOKS[play];
    const def = DEFENSES[defense];
    const shooter = pick(this.onCourtPlayers(side), this.rng);
    const defender = pick(this.onCourtPlayers(this.opponent), this.rng);
    const threeRate = clamp((team.strategy.threeRate + book.three * 100 + def.three * 100) / 100, 0.08, 0.65);
    const three = this.rng() < threeRate;
    const base = three ? 0.32 : 0.47;
    let chance = base
      + 0.0062 * (shooter.off + book.assist * 40 - 80)
      - 0.0026 * (defender.def - 80)
      + 0.0015 * (shooter.ovr - 80)
      + (shooter.stamina - 80) * 0.0018
      + this.momentum * 0.0007
      + (this.clutch ? -0.025 : 0)
      + def.fg;
    chance = clamp(chance, 0.08, 0.84);
    return { shooter, defender, three, chance, book, def, play };
  }

  step() {
    if (this.finished) return false;
    const team = this.teams[this.possession];
    const stepTime = clamp((12 + this.rng() * 11) * (1 - (team.strategy.pace - 50) / 300), 4, 26);
    this.clock -= stepTime;
    this.possessions += 1;
    this.momentum = clamp(this.momentum + (this.rng() - 0.5) * 8, -100, 100);

    for (const side of ['home', 'away']) {
      for (const p of this.onCourtPlayers(side)) {
        p.stamina = clamp(p.stamina - 0.55, 0, 100);
        p.minutes += stepTime / 60;
      }
      for (const p of this.teams[side].players) {
        if (!this.onCourt[side].includes(p.id)) p.stamina = clamp(p.stamina + 0.7, 0, 100);
      }
    }

    const roll = this.rng();
    if (roll < 0.068) {
      const p = pick(this.onCourtPlayers(this.possession), this.rng);
      p.to += 1;
      this.momentum -= 4;
      if (this.rng() < 0.55) {
        const d = pick(this.onCourtPlayers(this.opponent), this.rng);
        d.stl += 1;
        this.log('steal', { p: d.name });
      } else this.log('turnover', { p: p.name });
      this.possession = this.opponent;
    } else if (roll < 0.105 && this.cfg.fouls) {
      const p = pick(this.onCourtPlayers(this.possession), this.rng);
      const foul = pick(this.onCourtPlayers(this.opponent), this.rng);
      foul.pf += 1;
      if (foul.pf >= 6) {
        this.log('foul', { p: foul.name });
        this.maybeSubstitute(this.opponent);
      }
      for (let i = 0; i < 2; i++) {
        const pct = clamp(0.74 + (p.off - 80) * 0.004, 0.55, 0.96);
        if (this.rng() < pct) { p.ftm += 1; p.fta += 1; this.addPoints(this.possession, 1, p); }
        else p.fta += 1;
      }
      this.log('ft', { p: p.name });
    } else {
      const shot = this.chooseShot(this.possession);
      const made = this.rng() < shot.chance;
      const value = shot.three ? 3 : 2;
      shot.shooter.fga += 1;
      shot.shooter.tpa += shot.three ? 1 : 0;
      const x = 60 + this.rng() * 380;
      const y = shot.three ? 40 + this.rng() * 90 : 200 + this.rng() * 150;
      this.shots.push({ x, y, made, value, side: this.possession, player: shot.shooter.id });
      if (made) {
        shot.shooter.fgm += 1;
        if (shot.three) shot.shooter.tpm += 1;
        const dunk = !shot.three && this.rng() < 0.17;
        const assist = !dunk && this.rng() < (0.3 + shot.book.assist);
        const assister = assist ? pick(this.onCourtPlayers(this.possession).filter(p => p !== shot.shooter), this.rng) : null;
        this.addPoints(this.possession, value, shot.shooter, assister);
        this.log(dunk ? 'dunk' : shot.three ? 'shot3' : 'shot2', { p: shot.shooter.name });
        this.momentum += 5;
        if (shot.shooter.pts === 20 || shot.shooter.pts === 30) this.log('milestone', { p: shot.shooter.name });
      } else {
        if (this.rng() < 0.12) {
          const b = pick(this.onCourtPlayers(this.opponent), this.rng);
          b.blk += 1;
          this.log('block', { p: b.name });
        } else {
          const r = pick(this.onCourtPlayers(this.rng() < 0.14 ? this.possession : this.opponent), this.rng);
          if (this.onCourt[this.possession].includes(r.id)) r.orb += 1; else r.drb += 1;
          if (this.rng() >= 0.14) this.possession = this.opponent;
        }
        this.log('miss', { p: shot.shooter.name });
        this.momentum -= 3;
      }
    }

    this.maybeInjury(this.possession);
    this.maybeSubstitute(this.possession);
    this.maybeSubstitute(this.opponent);

    if (this.events.length % 6 === 0 || this.possessions % 6 === 0) {
      this.winProb.push(clamp(1 / (1 + Math.exp(-(this.score.home - this.score.away) / Math.max(6, Math.sqrt(this.clock / 60 + 1) * 6))), 0.01, 0.99));
    }
    if (this.clock <= 0) this.endQuarter();
    return true;
  }

  endQuarter() {
    this.quarters.push({ home: this.score.home - this.qStart.home, away: this.score.away - this.qStart.away });
    this.qStart = { ...this.score };
    this.log('quarter', { q: this.quarter + this.overtime });
    const adj = adjustments(this.teams.home, this.score.home - this.score.away, this.quarter);
    this.teams.home.strategy.pace = adj.pace;
    if (this.quarter < 4) {
      this.quarter += 1;
      this.clock = Q_LEN;
      this.possession = this.quarter % 2 ? 'home' : 'away';
      return;
    }
    if (this.cfg.overtime && this.score.home === this.score.away) {
      this.overtime += 1;
      this.clock = 300;
      this.log('overtime', {});
      return;
    }
    this.finish();
  }

  finish() {
    this.finished = true;
    this.log('end', {});
  }

  summary() {
    return {
      home: this.teams.home.code, away: this.teams.away.code,
      score: { ...this.score }, winner: this.leader,
      quarters: this.quarters.slice(), overtime: this.overtime,
      events: this.events.slice(), shots: this.shots.slice(),
      winProb: this.winProb.slice(), leadChanges: this.leadChanges,
      biggestLead: this.biggestLead, possessions: this.possessions,
      players: Object.values(this.players).map(p => ({
        ...p, efg: effectiveFG(p), ts: trueShooting(p)
      })),
      play: this.play, defense: this.defense
    };
  }
}

export function simulateGame(home, away, options = {}) {
  const sim = new Sim(home, away, options);
  let guard = 0;
  while (!sim.finished && guard < 6000) { sim.step(); guard += 1; }
  if (!sim.finished) sim.finish();
  return sim.summary();
}

export function winProbability(diff, secondsLeft) {
  return clamp(1 / (1 + Math.exp(-diff / Math.max(6, Math.sqrt(secondsLeft / 60 + 1) * 6))), 0.01, 0.99);
}
