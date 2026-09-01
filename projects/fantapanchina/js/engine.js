"use strict";

const Engine = (function () {

  const SAVE_KEY = "fantapanchina-save-v1";
  const TICK_MS = 100;
  const GIORNATA_MS = 180000;
  const AUTOSAVE_MS = 10000;
  const MAX_OFFLINE_H = 8;

  let state = null;
  let tickInterval = null;
  let saveInterval = null;
  let lastTick = Date.now();
  let listeners = { tick: [], giornata: [], event: [], upgrade: [], buy: [] };

  function on(evt, fn) { if (listeners[evt]) listeners[evt].push(fn); }
  function emit(evt, data) { (listeners[evt] || []).forEach(function (fn) { fn(data); }); }

  function initPlayer(role, name, quotazione, skill) {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name,
      role: role,
      quotazione: quotazione,
      skill: skill,
      costanza: 0.4 + Math.random() * 0.5,
      votoStorico: [],
      infortunio: 0,
      titolare: true
    };
  }

  function generateStarterSquad() {
    var players = [];
    var roles = [
      { role: "P", count: 1 },
      { role: "D", count: 4 },
      { role: "C", count: 3 },
      { role: "A", count: 2 }
    ];
    roles.forEach(function (r) {
      for (var i = 0; i < r.count; i++) {
        var name = FP.pickRandom(FP.NAMES) + " " + FP.pickRandom(FP.SURNAMES);
        var skill = 1 + Math.random() * 2;
        var quot = Math.max(1, Math.floor(skill * 0.5));
        players.push(initPlayer(r.role, name, quot, skill));
      }
    });
    return players;
  }

  function createDefaultState() {
    return {
      fc: 0,
      totalFc: 0,
      fp: 0,
      totalFp: 0,
      giornata: 0,
      lastGiornataTime: Date.now(),
      players: generateStarterSquad(),
      mercato: [],
      upgrades: {},
      scudetti: 0,
      scudettiDoro: 0,
      classifica: buildClassifica(),
      format: "4-3-3",
      feed: [],
      tapCombo: 0,
      lastTap: 0,
      notifications: [],
      formationUnlocked: false
    };
  }

  function buildClassifica() {
    var teams = [{ id: "user", name: "La Mia Squadra", emoji: "🛋️", fp: 0 }];
    FP.TEAMS_AI.forEach(function (t) {
      teams.push({ id: t.id, name: t.name, emoji: t.emoji, fp: 0 });
    });
    return teams;
  }

  function init() {
    var saved = load();
    if (saved) {
      state = saved;
      state.feed = state.feed || [];
      state.notifications = state.notifications || [];
      state.classifica = state.classifica || buildClassifica();
      state.classifica[0].fp = state.fp;
    } else {
      state = createDefaultState();
    }
    state.lastGiornataTime = state.lastGiornataTime || Date.now();
    var elapsed = Date.now() - state.lastGiornataTime;
    var giornateMancanti = Math.floor(elapsed / GIORNATA_MS);
    if (giornateMancanti > 0 && giornateMancanti < 50) {
      offlineGiornate(giornateMancanti);
    }
    lastTick = Date.now();
    startLoops();
  }

  function startLoops() {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(function () { tick(); }, TICK_MS);
    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(function () { save(); }, AUTOSAVE_MS);
  }

  function tick() {
    var now = Date.now();
    var dt = (now - lastTick) / 1000;
    lastTick = now;

    var ips = calcFCPerSec();
    var gained = ips * dt;
    if (gained > 0) {
      state.fc += gained;
      state.totalFc += gained;
    }

    var timeToNext = GIORNATA_MS - (Date.now() - state.lastGiornataTime);
    if (timeToNext <= 0) {
      runGiornata();
    }

    emit("tick", { fc: state.fc, ips: ips, timeToNext: Math.max(0, timeToNext) });
  }

  function calcFCPerSec() {
    var base = 0;
    state.players.forEach(function (p) {
      if (p.titolare && p.infortunio <= 0) {
        base += p.quotazione * 0.5;
      }
    });
    var mult = getUpgradesMult("fcPerSec");
    var flat = getUpgradesFlat("fcPerSec");
    return (base + flat) * (1 + mult) * Math.pow(1.25, state.scudettiDoro);
  }

  function getUpgradesMult(stat) {
    var total = 0;
    FP.UPGRADES.forEach(function (u) {
      if (u.effect.type === "mult" && u.effect.stat === stat) {
        var lvl = state.upgrades[u.id] || 0;
        total += u.effect.pct * lvl;
      }
    });
    return total;
  }

  function getUpgradesFlat(stat) {
    var total = 0;
    FP.UPGRADES.forEach(function (u) {
      if (u.effect.type === "flat" && u.effect.stat === stat) {
        var lvl = state.upgrades[u.id] || 0;
        total += u.effect.val * lvl;
      }
    });
    return total;
  }

  function getVotoBonus() {
    return getUpgradesFlat("votoBonus") * (1 + getUpgradesMult("votoBonus"));
  }

  function getAwayBonus() {
    return getUpgradesMult("awayBonus");
  }

  function getFreePlayerChance() {
    var chance = 0;
    FP.UPGRADES.forEach(function (u) {
      if (u.effect.type === "chance" && u.effect.stat === "freePlayer") {
        var lvl = state.upgrades[u.id] || 0;
        chance += u.effect.pct * lvl;
      }
    });
    return Math.min(chance, 0.5);
  }

  function simVoto(player) {
    var base = player.skill + getVotoBonus();
    if (player.infortunio > 0) base *= 0.5;
    var variance = (Math.random() - 0.5) * 4;
    var voto = Math.round((base + variance) * 10) / 10;
    voto = Math.max(4, Math.min(10, voto));
    return voto;
  }

  function generateMercato() {
    var mercato = [];
    var numPlayers = 5 + Math.floor(Math.random() * 3);
    for (var i = 0; i < numPlayers; i++) {
      var roleWeights = [
        { role: "P", w: 0.12 },
        { role: "D", w: 0.30 },
        { role: "C", w: 0.35 },
        { role: "A", w: 0.23 }
      ];
      var r = Math.random();
      var cum = 0;
      var role = "C";
      for (var j = 0; j < roleWeights.length; j++) {
        cum += roleWeights[j].w;
        if (r < cum) { role = roleWeights[j].role; break; }
      }
      var skill = 1 + Math.random() * 8;
      var quot = Math.max(1, Math.floor(skill * 1.2));
      var costanza = 0.3 + Math.random() * 0.7;
      var isBidone = costanza < 0.35;
      mercato.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: FP.generatePlayerName(),
        role: role,
        quotazione: quot,
        skill: skill,
        costanza: costanza,
        revealed: false,
        cost: Math.floor(quot * quot * 100 * (0.8 + Math.random() * 0.4)),
        isBidone: isBidone
      });
    }
    state.mercato = mercato;
    emit("mercato", mercato);
  }

  function revealBidoni() {
    var ossLvl = state.upgrades["osservatore"] || 0;
    if (ossLvl <= 0) return;
    state.mercato.forEach(function (p) {
      p.revealed = ossLvl >= 3 || (Math.random() < ossLvl * 0.3);
    });
  }

  function buyPlayerFromMercato(mercatoId) {
    var idx = -1;
    for (var i = 0; i < state.mercato.length; i++) {
      if (state.mercato[i].id === mercatoId) { idx = i; break; }
    }
    if (idx < 0) return { ok: false, msg: "Giocatore non trovato nel mercato" };
    var player = state.mercato[idx];
    if (state.fc < player.cost) return { ok: false, msg: "Fondi insufficienti!" };

    var worstIdx = -1;
    var worstSkill = Infinity;
    state.players.forEach(function (p, i) {
      if (p.titolare && p.role === player.role && p.skill < worstSkill) {
        worstSkill = p.skill;
        worstIdx = i;
      }
    });
    if (worstIdx < 0) {
      for (var j = 0; j < state.players.length; j++) {
        if (state.players[j].role === player.role && !state.players[j].titolare) {
          worstIdx = j;
          break;
        }
      }
    }

    if (worstIdx < 0 && state.players.length < 25) {
      var newPlayer = initPlayer(player.role, player.name, player.quotazione, player.skill);
      newPlayer.costanza = player.costanza;
      state.players.push(newPlayer);
    } else if (worstIdx >= 0) {
      var old = state.players[worstIdx];
      state.players[worstIdx] = initPlayer(player.role, player.name, player.quotazione, player.skill);
      state.players[worstIdx].costanza = player.costanza;
    } else {
      return { ok: false, msg: "Rosa piena (25 giocatori max)!" };
    }

    state.fc -= player.cost;
    state.mercato.splice(idx, 1);
    var comment = FP.pickRandom(FP.BIDONE_COMMENTS);
    emit("buy", { player: player, comment: comment });
    addFeed("💰 Acquisto: " + player.name + " (" + FP.ROLE_NAMES[player.role] + ") — " + comment, "buy");
    return { ok: true, player: player, comment: comment };
  }

  function runGiornata() {
    state.giornata++;
    state.lastGiornataTime = Date.now();
    var giornataEvents = [];

    var homeTeam = FP.pickRandom(FP.TEAMS_AI);
    addFeed(FP.pickRandom(FP.MATCH_COMMENTARY) + " 🏟️ vs " + homeTeam.name + " " + homeTeam.emoji, "match");

    state.players.forEach(function (p) {
      if (p.infortunio > 0) {
        p.infortunio--;
        addFeed("🏥 " + p.name + " è infortunato, salta questa giornata.", "info");
        return;
      }
      var voto = simVoto(p);
      p.votoStorico.push(voto);
      if (p.votoStorico.length > 20) p.votoStorico.shift();

      var fpGain = 0;
      var eventMsg = "";

      if (voto >= 8 && Math.random() < 0.5) {
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.goal).replace("{name}", "<b>" + p.name + "</b>");
        fpGain += 3;
        giornataEvents.push({ type: "goal", player: p.name, msg: eventMsg });
      } else if (voto >= 7 && Math.random() < 0.4) {
        var target = FP.pickRandom(FP.NAMES) + " " + FP.pickRandom(FP.SURNAMES);
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.assist)
          .replace("{name}", "<b>" + p.name + "</b>")
          .replace("{target}", target);
        fpGain += 1;
        giornataEvents.push({ type: "assist", player: p.name, msg: eventMsg });
      }

      if (voto <= 5 && Math.random() < 0.15) {
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.miss).replace("{name}", "<b>" + p.name + "</b>");
        giornataEvents.push({ type: "miss", player: p.name, msg: eventMsg });
      }

      if (Math.random() < 0.08) {
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.yellow).replace("{name}", "<b>" + p.name + "</b>");
        fpGain -= 0.5;
        giornataEvents.push({ type: "yellow", player: p.name, msg: eventMsg });
      }

      if (Math.random() < 0.02) {
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.red).replace("{name}", "<b>" + p.name + "</b>");
        fpGain -= 2;
        giornataEvents.push({ type: "red", player: p.name, msg: eventMsg });
      }

      if (Math.random() < 0.06) {
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.injury).replace("{name}", "<b>" + p.name + "</b>");
        p.infortunio = 1 + Math.floor(Math.random() * 3);
        giornataEvents.push({ type: "injury", player: p.name, msg: eventMsg });
      }

      if (p.role === "P" && voto >= 6 && Math.random() < 0.5) {
        eventMsg = FP.pickRandom(FP.EVENT_TEMPLATES.save).replace("{name}", "<b>" + p.name + "</b>");
        fpGain += 1;
        giornataEvents.push({ type: "save", player: p.name, msg: eventMsg });
      }

      fpGain += Math.max(0, (voto - 6) * 0.5);
      state.fp += Math.max(0, fpGain);
      state.totalFp += Math.max(0, fpGain);
    });

    state.classifica[0].fp = state.fp;
    FP.TEAMS_AI.forEach(function (t) {
      var teamGain = 0;
      for (var i = 0; i < 11; i++) {
        var v = 4 + Math.random() * 6;
        teamGain += Math.max(0, (v - 6) * 0.5 + (v >= 8 && Math.random() < 0.3 ? 3 : 0));
      }
      teamGain *= (t.skill / 2);
      var teamEntry = state.classifica.find(function (c) { return c.id === t.id; });
      if (teamEntry) teamEntry.fp += teamGain;
    });

    var fcBonus = Math.floor(state.fp * 10);
    state.fc += fcBonus;
    state.totalFc += fcBonus;

    var coachReaction = FP.pickRandom(FP.COACH_REACTIONS);
    addFeed(coachReaction, "coach");

    if (Math.random() < 0.3) {
      addFeed("📰 " + FP.pickRandom(FP.FANTANOTIZIE), "news");
    }

    if (Math.random() < 0.4) {
      var momentEv = FP.pickRandom(FP.EVENT_TEMPLATES.moment);
      addFeed(momentEv, "moment");
    }

    if (getFreePlayerChance() > 0 && Math.random() < getFreePlayerChance()) {
      var young = FP.generatePlayerName();
      var youngRole = FP.pickRandom(["P", "D", "C", "A"]);
      var youngSkill = 1 + Math.random() * 3;
      var youngQuot = Math.max(1, Math.floor(youngSkill * 0.5));
      if (state.players.length < 25) {
        state.players.push(initPlayer(youngRole, young, youngQuot, youngSkill));
        addFeed("🧒 GIOVANISSIMO! " + young + " arriva dal settore giovanile!", "free");
      }
    }

    generateMercato();
    revealBidoni();

    giornataEvents.forEach(function (ev) {
      addFeed(ev.msg, ev.type);
    });

    addFeed("📊 Giornata " + state.giornata + " — FP totale: " + Math.floor(state.fp) + " | FC bonus: +" + fcBonus, "summary");

    if (state.fp >= 1000000 && state.scudettiDoro < 8) {
      state.notifications.push({
        type: "prestige",
        msg: "🏆 VINCITI LO SCUDETTO D'ORO! Vuoi resettagiare la stagione?"
      });
    }

    emit("giornata", {
      giornata: state.giornata,
      events: giornataEvents,
      fcBonus: fcBonus
    });
  }

  function offlineGiornate(n) {
    var oldCount = state.giornata;
    var oldFp = state.fp;
    for (var i = 0; i < Math.min(n, 50); i++) {
      state.giornata++;
      state.players.forEach(function (p) {
        if (p.infortunio > 0) { p.infortunio--; return; }
        var voto = simVoto(p);
        p.votoStorico.push(voto);
        if (p.votoStorico.length > 20) p.votoStorico.shift();
        var fpGain = Math.max(0, (voto - 6) * 0.5);
        if (voto >= 8 && Math.random() < 0.4) fpGain += 3;
        if (voto <= 5 && Math.random() < 0.08) p.infortunio = 1 + Math.floor(Math.random() * 2);
        state.fp += fpGain;
        state.totalFp += fpGain;
      });
      state.classifica[0].fp = state.fp;
      FP.TEAMS_AI.forEach(function (t) {
        var teamGain = 0;
        for (var j = 0; j < 11; j++) {
          var v = 4 + Math.random() * 6;
          teamGain += Math.max(0, (v - 6) * 0.5 + (v >= 8 && Math.random() < 0.3 ? 3 : 0));
        }
        teamGain *= (t.skill / 2);
        var teamEntry = state.classifica.find(function (c) { return c.id === t.id; });
        if (teamEntry) teamEntry.fp += teamGain;
      });
      var fcBonus = Math.floor(state.fp * 10);
      state.fc += fcBonus;
      state.totalFc += fcBonus;
      generateMercato();
      revealBidoni();
    }
    var newFp = state.fp - oldFp;
    var newGiornate = state.giornata - oldCount;
    state.notifications.push({
      type: "offline",
      msg: "Mentre eri via: " + newGiornate + " giornate giocate, +" + Math.floor(newFp) + " FP, +" + Math.floor(state.fc) + " FC totali!"
    });
    emit("offline", { giornate: newGiornate, fp: newFp, fc: state.fc });
  }

  function doPrestige() {
    if (state.fp < 1000000 || state.scudettiDoro >= 8) return false;
    state.scudettiDoro++;
    state.fp = 0;
    state.totalFp = 0;
    state.giornata = 0;
    state.classifica = buildClassifica();
    state.classifica[0].fp = 0;
    state.fc = 0;
    state.totalFc = 0;
    state.mercato = [];
    state.feed = [];
    state.notifications = [];
    state.players = generateStarterSquad();
    state.upgrades = {};
    addFeed("🏆 SCUDETTO D'ORO #" + state.scudettiDoro + "! Nuova stagione! +25% income permanente.", "prestige");
    emit("prestige", { scudetti: state.scudettiDoro });
    save();
    return true;
  }

  function upgrade(id) {
    var def = FP.UPGRADES.find(function (u) { return u.id === id; });
    if (!def) return { ok: false };
    var lvl = state.upgrades[id] || 0;
    if (lvl >= def.maxLevel) return { ok: false, msg: "Livello massimo!" };
    var cost = Math.floor(def.baseCost * Math.pow(def.costMul, lvl));
    if (state.fc < cost) return { ok: false, msg: "Fondi insufficienti!" };
    state.fc -= cost;
    state.upgrades[id] = lvl + 1;
    addFeed(def.emoji + " " + def.name + " → Livello " + (lvl + 1), "upgrade");
    emit("upgrade", { id: id, level: lvl + 1 });
    return { ok: true, level: lvl + 1, cost: cost };
  }

  function tapMister() {
    var now = Date.now();
    if (now - state.lastTap < 200) {
      state.tapCombo++;
    } else {
      state.tapCombo = 1;
    }
    state.lastTap = now;
    var base = Math.max(1, calcFCPerSec() * 0.5);
    var comboMult = 1 + Math.min(state.tapCombo, 50) * 0.05;
    var gained = Math.floor(base * comboMult * (1 + Math.random() * 0.3));
    state.fc += gained;
    state.totalFc += gained;
    emit("tap", { gained: gained, combo: state.tapCombo });
    return gained;
  }

  function addFeed(msg, type) {
    state.feed.unshift({
      msg: msg,
      type: type || "info",
      time: Date.now(),
      giornata: state.giornata
    });
    if (state.feed.length > 150) state.feed.pop();
    emit("event", { msg: msg, type: type });
  }

  function save() {
    try {
      state.lastSaveTime = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) { }
  }

  function load() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    state = createDefaultState();
    emit("reset", {});
  }

  function getState() { return state; }

  function getUpgradeCost(id) {
    var def = FP.UPGRADES.find(function (u) { return u.id === id; });
    if (!def) return Infinity;
    var lvl = state.upgrades[id] || 0;
    if (lvl >= def.maxLevel) return Infinity;
    return Math.floor(def.baseCost * Math.pow(def.costMul, lvl));
  }

  function getUpgradeLevel(id) {
    return state.upgrades[id] || 0;
  }

  function getSortClassifica() {
    var sorted = state.classifica.slice().sort(function (a, b) { return b.fp - a.fp; });
    return sorted;
  }

  return {
    init: init,
    on: on,
    getState: getState,
    tick: tick,
    tapMister: tapMister,
    runGiornata: runGiornata,
    buyPlayerFromMercato: buyPlayerFromMercato,
    upgrade: upgrade,
    doPrestige: doPrestige,
    getUpgradeCost: getUpgradeCost,
    getUpgradeLevel: getUpgradeLevel,
    calcFCPerSec: calcFCPerSec,
    getSortClassifica: getSortClassifica,
    getVotoBonus: getVotoBonus,
    getAwayBonus: getAwayBonus,
    save: save,
    reset: reset,
    GIORNATA_MS: GIORNATA_MS,
    TICK_MS: TICK_MS
  };

})();
