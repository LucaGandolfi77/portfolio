/* ============================================================================
   SIM — motore deterministico del gioco. Nessun DOM, nessun timer.
   Tutte le funzioni ricevono lo stato e ritornano descrittori di eventi.
   ============================================================================ */
import * as CFG from './config.js';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function initPlayer(role, name, quotazione, skill) {
  return {
    id: uid(), name, role, quotazione, skill,
    costanza: 0.4 + Math.random() * 0.5,
    votoStorico: [], infortunio: 0, titolare: true
  };
}

function starterSquad() {
  const players = [];
  [{ role:'P', count:1 }, { role:'D', count:4 }, { role:'C', count:3 }, { role:'A', count:2 }]
    .forEach(r => {
      for (let i = 0; i < r.count; i++) {
        const name = CFG.pickRandom(CFG.NAMES) + ' ' + CFG.pickRandom(CFG.SURNAMES);
        const skill = 1 + Math.random() * 2;
        players.push(initPlayer(r.role, name, Math.max(1, Math.floor(skill * 0.5)), skill));
      }
    });
  return players;
}

function buildClassifica() {
  const teams = [{ id:'user', name:'La Mia Squadra', emoji:'🛋️', fp:0, color:'#3ee6ff', form:[] }];
  CFG.TEAMS_AI.forEach(t => teams.push({ id:t.id, name:t.name, emoji:t.emoji, fp:0, color:t.color, form:[] }));
  return teams;
}

export function createInitialState() {
  return {
    version: CFG.SAVE_VERSION,
    fc: 0, totalFc: 0, fp: 0, totalFp: 0,
    giornata: 0, lastGiornataTime: Date.now(),
    players: starterSquad(),
    mercato: [],
    upgrades: {},
    scudetti: 0, scudettiDoro: 0,
    classifica: buildClassifica(),
    formation: '4-3-3',
    feed: [],
    tapCombo: 0, lastTap: 0,
    stats: { taps:0, goals:0, wins:0, buys:0, upgrades:0, prestiges:0 },
    quests: {}, achievements: [],
    settings: { sound:true, motion:true, theme:'neon' }
  };
}

/* ----------------------------------------------------------------- helpers */
function totalFor(stat, type) {
  return (state) => {
    let v = 0;
    CFG.UPGRADES.forEach(u => {
      if (u.effect.type !== type || u.effect.stat !== stat) return;
      const lvl = state.upgrades[u.id] || 0;
      v += type === 'mult' ? u.effect.pct * lvl : u.effect.val * lvl;
    });
    return v;
  };
}
const multFC = totalFor('fcPerSec', 'mult');
const flatFC = totalFor('fcPerSec', 'flat');
const flatVoto = totalFor('votoBonus', 'flat');
const multVoto = totalFor('votoBonus', 'mult');
const multAway = totalFor('awayBonus', 'mult');
const chanceFree = totalFor('freePlayer', 'chance');

export function calcFCPerSec(state) {
  let base = 0;
  state.players.forEach(p => { if (p.titolare && p.infortunio <= 0) base += p.quotazione * 0.5; });
  return (base + flatFC(state)) * (1 + multFC(state)) * Math.pow(1.25, state.scudettiDoro);
}

export function getUpgradeCost(state, id) {
  const u = CFG.UPGRADES.find(x => x.id === id);
  if (!u) return Infinity;
  const lvl = state.upgrades[id] || 0;
  if (lvl >= u.maxLevel) return Infinity;
  return Math.floor(u.baseCost * Math.pow(u.costMul, lvl));
}

export function getVotoBonus(state) { return flatVoto(state) * (1 + multVoto(state)); }
export function getAwayBonus(state) { return multAway(state); }

export function simVoto(state, player, home = true) {
  let base = player.skill + getVotoBonus(state);
  if (!home) base *= 1 + getAwayBonus(state);
  if (player.infortunio > 0) base *= 0.5;
  const voto = Math.round((base + (Math.random() - 0.5) * 4) * 10) / 10;
  return Math.max(4, Math.min(10, voto));
}

/* ------------------------------------------------------------------- events */
export function addFeed(state, msg, type = 'info') {
  state.feed.unshift({ id: uid(), msg, type, at: Date.now() });
  if (state.feed.length > 120) state.feed.length = 120;
}

export function checkQuests(state) {
  const done = [];
  CFG.QUESTS.forEach(q => {
    if (state.quests[q.id]) return;
    if ((state.stats[q.stat] || 0) >= q.target) {
      state.quests[q.id] = true;
      state.fc += q.reward;
      state.totalFc += q.reward;
      addFeed(state, `🎯 Obiettivo completato: ${q.name} → +${q.reward} FC`, 'quest');
      done.push(q);
    }
  });
  return done;
}

export function checkAchievements(state) {
  const got = [];
  const unlock = (id, cond) => {
    if (cond && !state.achievements.includes(id)) { state.achievements.push(id); got.push(id); }
  };
  unlock('first_goal', state.stats.goals >= 1);
  unlock('bidone', state.achievements.includes('bidone'));
  unlock('prestige', state.scudettiDoro >= 1);
  unlock('rich', state.totalFc >= 10000);
  unlock('quests', Object.keys(state.quests).length >= 3);
  return got;
}

/* --------------------------------------------------------------------- tap */
export function tapMister(state) {
  const now = Date.now();
  const window = 1200;
  state.tapCombo = (now - state.lastTap < window) ? state.tapCombo + 1 : 1;
  state.lastTap = now;
  const gain = 1 + Math.min(50, state.tapCombo) * 0.6 + state.scudettiDoro;
  state.fc += gain;
  state.totalFc += gain;
  state.stats.taps++;
  return { gain, combo: state.tapCombo };
}

/* ----------------------------------------------------------------- mercato */
export function generateMercato(state) {
  const list = [];
  const n = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const weights = [['P',0.12],['D',0.30],['C',0.35],['A',0.23]];
    let r = Math.random(), acc = 0, role = 'C';
    for (const [k, w] of weights) { acc += w; if (r < acc) { role = k; break; } }
    const skill = 1 + Math.random() * 8;
    const quot = Math.max(1, Math.floor(skill * 1.2));
    const costanza = 0.3 + Math.random() * 0.7;
    list.push({
      id: uid(), name: CFG.generatePlayerName(), role, quotazione: quot, skill,
      costanza, revealed: false,
      cost: Math.floor(quot * quot * 100 * (0.8 + Math.random() * 0.4)),
      isBidone: costanza < 0.35
    });
  }
  state.mercato = list;
  revealBidoni(state);
  return list;
}

export function revealBidoni(state) {
  const lvl = state.upgrades.osservatore || 0;
  if (!lvl) { state.mercato.forEach(p => { p.revealed = false; }); return; }
  state.mercato.forEach(p => { p.revealed = lvl >= 3 || Math.random() < lvl * 0.3; });
}

export function buyPlayer(state, id) {
  const idx = state.mercato.findIndex(p => p.id === id);
  if (idx < 0) return { ok:false, msg:'Giocatore non trovato' };
  const p = state.mercato[idx];
  if (state.fc < p.cost) return { ok:false, msg:'Fondi insufficienti!' };
  if (state.players.length >= 26) return { ok:false, msg:'Rosa al completo' };

  let worstIdx = -1, worstSkill = Infinity;
  state.players.forEach((pl, i) => {
    if (pl.titolare && pl.role === p.role && pl.skill < worstSkill) { worstSkill = pl.skill; worstIdx = i; }
  });
  if (worstIdx < 0) worstIdx = state.players.findIndex(pl => pl.role === p.role && !pl.titolare);
  if (worstIdx < 0) return { ok:false, msg:'Nessun sostituto disponibile' };

  state.fc -= p.cost;
  const old = state.players[worstIdx];
  state.players[worstIdx] = initPlayer(p.role, p.name, p.quotazione, p.skill);
  state.mercato.splice(idx, 1);
  state.stats.buys++;
  const comment = CFG.pickRandom(CFG.BIDONE_COMMENTS);
  addFeed(state, `🛒 Acquistato ${p.name} per ${CFG.formatNum(p.cost)} FC. ${comment}`, 'buy');
  if (p.isBidone && !state.achievements.includes('bidone')) state.achievements.push('bidone');
  checkQuests(state);
  return { ok:true, player:p, replaced:old, comment, free:false };
}

export function upgrade(state, id) {
  const u = CFG.UPGRADES.find(x => x.id === id);
  if (!u) return { ok:false, msg:'Struttura sconosciuta' };
  const cost = getUpgradeCost(state, id);
  if (!isFinite(cost)) return { ok:false, msg:'Livello massimo' };
  if (state.fc < cost) return { ok:false, msg:'Fondi insufficienti!' };
  state.fc -= cost;
  state.upgrades[id] = (state.upgrades[id] || 0) + 1;
  state.stats.upgrades++;
  if (u.effect.type === 'reveal') revealBidoni(state);
  addFeed(state, `🏗️ ${u.name} potenziata al livello ${state.upgrades[id]}`, 'upgrade');
  checkQuests(state);
  return { ok:true, level:state.upgrades[id], cost };
}

export function doPrestige(state) {
  if (state.scudetti < 1) return { ok:false, msg:'Serve almeno uno scudetto' };
  state.scudettiDoro++;
  const keep = state.scudettiDoro;
  const fresh = createInitialState();
  fresh.scudettiDoro = keep;
  fresh.stats = Object.assign({}, state.stats, { prestiges: state.stats.prestiges + 1 });
  fresh.achievements = state.achievements.slice();
  fresh.quests = {};
  addFeed(fresh, `🏆 Nuova stagione! Scudetto d’oro #${keep}: +25% income permanente`, 'prestige');
  return { ok:true, state:fresh };
}

/* ---------------------------------------------------------------- giornata */
function teamStrengthAI(team, giornata) {
  return team.skill * (0.85 + Math.random() * 0.45) + Math.sin(giornata * 0.7 + team.skill) * 0.25;
}

export function runGiornata(state) {
  state.giornata++;
  const events = [];
  const commentary = [];
  const titolari = state.players.filter(p => p.titolare);

  const voti = titolari.map(p => ({ player:p, voto:simVoto(state, p) }));
  voti.forEach(v => {
    v.player.votoStorico.push(v.voto);
    if (v.player.votoStorico.length > 10) v.player.votoStorico.shift();
    if (v.player.infortunio > 0) v.player.infortunio--;
  });

  const media = voti.reduce((a, b) => a + b.voto, 0) / Math.max(1, voti.length);
  const opp = CFG.pickRandom(CFG.TEAMS_AI);
  const myForza = media + state.scudettiDoro * 0.3;
  const aiForza = teamStrengthAI(opp, state.giornata);
  const goalsUs = Math.max(0, Math.round((myForza - aiForza + 3.2) / 1.6 + (Math.random() - 0.5) * 1.4));
  const goalsAi = Math.max(0, Math.round((aiForza - myForza + 3.2) / 1.6 + (Math.random() - 0.5) * 1.4));

  const fpGain = Math.round(media * 8 + goalsUs * 25 - goalsAi * 6);
  state.fp += Math.max(1, fpGain);
  state.totalFp += Math.max(1, fpGain);

  const win = goalsUs > goalsAi;
  if (win) state.stats.wins++;
  state.scudetti += win ? 1 : 0;

  const scorers = voti.filter(v => v.voto >= 7).map(v => v.player);
  for (let i = 0; i < goalsUs; i++) {
    const scorer = scorers.length ? CFG.pickRandom(scorers) : CFG.pickRandom(titolari);
    if (!scorer) break;
    state.stats.goals++;
    const msg = CFG.pickRandom(CFG.EVENT_TEMPLATES.goal).replace('{name}', scorer.name);
    events.push({ type:'goal', minute: 12 + Math.floor(Math.random() * 75), msg, team:'us' });
    commentary.push(msg);
  }
  for (let i = 0; i < goalsAi; i++) {
    events.push({ type:'goal', minute: 10 + Math.floor(Math.random() * 78),
      msg:`⚽ ${opp.name} segna. Il portiere era distratto.`, team:'ai' });
  }

  if (Math.random() < 0.35) {
    const p = CFG.pickRandom(titolari);
    if (p) {
      const msg = CFG.pickRandom(CFG.EVENT_TEMPLATES.yellow).replace('{name}', p.name);
      events.push({ type:'yellow', minute: 20 + Math.floor(Math.random() * 65), msg });
    }
  }
  if (Math.random() < 0.09) {
    const p = CFG.pickRandom(titolari);
    if (p) {
      p.infortunio = 2;
      const msg = CFG.pickRandom(CFG.EVENT_TEMPLATES.injury).replace('{name}', p.name);
      events.push({ type:'injury', minute: 30 + Math.floor(Math.random() * 55), msg });
      commentary.push(msg);
    }
  }
  if (Math.random() < 0.25) {
    events.push({ type:'random', minute: 15 + Math.floor(Math.random() * 70), msg:CFG.pickRandom(CFG.EVENT_TEMPLATES.random) });
  }
  events.sort((a, b) => a.minute - b.minute);

  // classifica
  state.classifica[0].fp = state.fp;
  state.classifica[0].form.unshift(win ? 'W' : goalsUs === goalsAi ? 'D' : 'L');
  state.classifica[0].form = state.classifica[0].form.slice(0, 5);
  state.classifica.forEach(t => {
    if (t.id === 'user') return;
    t.fp = Math.round(t.fp + 120 + Math.random() * 260 + t.fp * 0.02);
    t.form = t.form || [];
    t.form.unshift(Math.random() < 0.5 ? 'W' : 'L');
    t.form = t.form.slice(0, 5);
  });

  addFeed(state, `📣 Giornata #${state.giornata}: La Mia Squadra ${goalsUs}-${goalsAi} ${opp.name} · +${Math.max(1, fpGain)} FP`,
    win ? 'win' : 'match');

  const quests = checkQuests(state);
  const achievements = checkAchievements(state);

  return {
    giornata: state.giornata, goalsUs, goalsAi, opponent:opp, fpGain:Math.max(1, fpGain),
    win, media:Math.round(media * 10) / 10, events, commentary,
    voti, quests, achievements,
    match: { us:goalsUs, ai:goalsAi, opponent:opp, events, duration:13000 }
  };
}

export function offlineGiornate(state, n) {
  const reports = [];
  for (let i = 0; i < n; i++) reports.push(runGiornata(state));
  return reports;
}

export function randomNews(state) {
  if (Math.random() < 0.12) addFeed(state, CFG.pickRandom(CFG.FANTANOTIZIE), 'news');
}

export function randomCoach(state) {
  if (Math.random() < 0.08) addFeed(state, CFG.pickRandom(CFG.COACH_REACTIONS), 'coach');
}
