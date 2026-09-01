"use strict";

const UI = (function () {

  var audioCtx = null;
  var currentTab = "squadra";
  var feedVisible = true;
  var lastRender = 0;
  var pendingOffline = null;

  function init() {
    Engine.on("tick", onTick);
    Engine.on("giornata", onGiornata);
    Engine.on("event", onEvent);
    Engine.on("buy", onBuy);
    Engine.on("upgrade", onUpgrade);
    Engine.on("tap", onTap);
    Engine.on("prestige", onPrestige);
    Engine.on("offline", onOffline);
    document.addEventListener("click", initAudio, { once: true });
    setupTabs();
    setupTap();
    setupReset();
    setupFeedToggle();
    render();
    if (Engine.getState().notifications.length > 0) {
      showNotifications();
    }
  }

  function initAudio() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { }
  }

  function playSound(type) {
    if (!audioCtx) return;
    try {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      var t = audioCtx.currentTime;
      switch (type) {
        case "tap":
          osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
          osc.start(t); osc.stop(t + 0.08);
          break;
        case "goal":
          osc.frequency.setValueAtTime(523, t);
          osc.frequency.setValueAtTime(659, t + 0.12);
          osc.frequency.setValueAtTime(784, t + 0.24);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.start(t); osc.stop(t + 0.5);
          break;
        case "buy":
          osc.frequency.setValueAtTime(400, t);
          osc.frequency.linearRampToValueAtTime(800, t + 0.15);
          osc.type = "triangle";
          gain.gain.setValueAtTime(0.07, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          osc.start(t); osc.stop(t + 0.2);
          break;
        case "whistle":
          osc.frequency.setValueAtTime(2000, t);
          osc.frequency.setValueAtTime(2400, t + 0.1);
          osc.frequency.setValueAtTime(2000, t + 0.2);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.start(t); osc.stop(t + 0.35);
          break;
        case "prestige":
          osc.frequency.setValueAtTime(523, t);
          osc.frequency.setValueAtTime(659, t + 0.15);
          osc.frequency.setValueAtTime(784, t + 0.3);
          osc.frequency.setValueAtTime(1047, t + 0.45);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          osc.start(t); osc.stop(t + 0.8);
          break;
      }
    } catch (e) { }
  }

  function vibrate(ms) {
    try { navigator.vibrate(ms); } catch (e) { }
  }

  function setupTabs() {
    var btns = document.querySelectorAll(".tab-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentTab = this.dataset.tab;
        btns.forEach(function (b) { b.classList.remove("on"); });
        this.classList.add("on");
        render();
      });
    });
  }

  function setupTap() {
    var tapArea = document.getElementById("tap-mister");
    if (!tapArea) return;
    tapArea.addEventListener("click", function (e) {
      e.preventDefault();
      var gained = Engine.tapMister();
      vibrate(15);
      playSound("tap");
      var el = document.getElementById("tap-popup");
      if (el) {
        el.textContent = "+" + formatNum(gained) + " FC";
        el.classList.add("show");
        setTimeout(function () { el.classList.remove("show"); }, 600);
      }
    });
  }

  function setupFeedToggle() {
    var toggle = document.getElementById("feed-toggle");
    var section = document.querySelector(".feed-section");
    if (toggle && section) {
      toggle.addEventListener("click", function () {
        section.classList.toggle("collapsed");
      });
    }
  }

  function setupReset() {
    var btn = document.getElementById("reset-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        if (confirm("Vuoi davvero resetta TUTTO? I progressi verranno persi!")) {
          Engine.reset();
          location.reload();
        }
      });
    }
  }

  function onTick(data) {
    if (Date.now() - lastRender < 250) return;
    lastRender = Date.now();
    renderTopBar(data);
    renderTimer(data.timeToNext);
  }

  function onGiornata(data) {
    playSound("whistle");
    vibrate(50);
    render();
  }

  function onEvent(data) {
    if (data.type === "goal") {
      vibrate(30);
      playSound("goal");
    }
  }

  function onBuy(data) {
    playSound("buy");
    vibrate(20);
  }

  function onUpgrade(data) {
    vibrate(10);
    render();
  }

  function onTap(data) {
    var comboEl = document.getElementById("combo-counter");
    if (comboEl) {
      comboEl.textContent = data.combo > 1 ? "x" + data.combo : "";
    }
  }

  function onPrestige(data) {
    playSound("prestige");
    vibrate(100);
    showPrestigeModal(data.scudetti);
  }

  function onOffline(data) {
    pendingOffline = data;
    showOfflineModal(data);
  }

  function formatNum(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return Math.floor(n).toString();
  }

  function renderTopBar(data) {
    var fcEl = document.getElementById("fc-display");
    var fpEl = document.getElementById("fp-display");
    var ipsEl = document.getElementById("ips-display");
    if (fcEl) fcEl.textContent = formatNum(data.fc) + " FC";
    if (fpEl) fpEl.textContent = formatNum(Engine.getState().fp) + " FP";
    if (ipsEl) ipsEl.textContent = formatNum(data.ips) + "/s";
  }

  function renderTimer(timeToNext) {
    var bar = document.getElementById("timer-fill");
    var txt = document.getElementById("timer-text");
    if (!bar || !txt) return;
    var pct = Math.max(0, Math.min(100, (timeToNext / Engine.GIORNATA_MS) * 100));
    bar.style.width = (100 - pct) + "%";
    var secs = Math.ceil(timeToNext / 1000);
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    txt.textContent = "Giornata tra " + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function render() {
    var panel = document.getElementById("panel-content");
    if (!panel) return;
    switch (currentTab) {
      case "squadra": renderSquadra(panel); break;
      case "mercato": renderMercato(panel); break;
      case "strutture": renderStrutture(panel); break;
      case "classifica": renderClassifica(panel); break;
    }
    renderFeed();
  }

  function renderSquadra(el) {
    var s = Engine.getState();
    var html = '<div class="squad-header">';
    html += '<div class="squad-info"><span class="squad-name">🛋️ La Mia Squadra</span>';
    html += '<span class="squad-formation">' + s.format + '</span></div>';
    html += '<div class="squad-stats">';
    html += '<span class="stat-pill">⚽ ' + s.players.filter(function (p) { return p.titolare; }).length + ' titolari</span>';
    html += '<span class="stat-pill">📊 ' + formatNum(Engine.calcFCPerSec()) + '/s</span>';
    html += '</div></div>';

    var groups = { P: [], D: [], C: [], A: [] };
    s.players.forEach(function (p) {
      if (groups[p.role]) groups[p.role].push(p);
    });

    var order = ["P", "D", "C", "A"];
    order.forEach(function (role) {
      var players = groups[role];
      if (!players || players.length === 0) return;
      html += '<div class="role-group">';
      html += '<div class="role-header">' + FP.ROLE_EMOJI[role] + ' ' + FP.ROLE_NAMES[role] + 's</div>';
      players.forEach(function (p) {
        var avgVoto = p.votoStorico.length > 0
          ? (p.votoStorico.reduce(function (a, b) { return a + b; }, 0) / p.votoStorico.length).toFixed(1)
          : "—";
        var injured = p.infortunio > 0;
        var cls = "player-card" + (injured ? " injured" : "") + (p.titolare ? "" : " bench");
        html += '<div class="' + cls + '">';
        html += '<div class="player-name">' + p.name + '</div>';
        html += '<div class="player-meta">';
        html += '<span class="player-quot">Q' + p.quotazione + '</span>';
        html += '<span class="player-voto"> Media: ' + avgVoto + '</span>';
        if (injured) html += '<span class="player-injury">🏥 ' + p.infortunio + 'g</span>';
        html += '</div></div>';
      });
      html += '</div>';
    });

    el.innerHTML = html;
  }

  function renderMercato(el) {
    var s = Engine.getState();
    var mercato = s.mercato;
    var html = '<div class="mercato-header">';
    html += '<div class="mercato-title">🏷️ Asta Svincolati</div>';
    html += '<div class="mercato-info">Prossimo mercato: giornata ' + (s.giornata + 1) + '</div>';
    html += '</div>';

    if (mercato.length === 0) {
      html += '<div class="empty-state">Nessun giocatore disponibile.<br>Aspetta la prossima giornata!</div>';
      el.innerHTML = html;
      return;
    }

    mercato.forEach(function (p) {
      var canBuy = s.fc >= p.cost;
      var bidoneInfo = p.revealed ? (p.isBidone ? '<span class="bidone-tag">⚠️ BIDONE!</span>' : '<span class="bidone-tag good">✅ Sembra OK</span>') : "";
      html += '<div class="mercato-card' + (canBuy ? "" : " too-expensive") + '">';
      html += '<div class="mercato-player">';
      html += '<div class="mercato-role">' + FP.ROLE_EMOJI[p.role] + '</div>';
      html += '<div class="mercato-details">';
      html += '<div class="mercato-name">' + p.name + '</div>';
      html += '<div class="mercato-meta">Q' + p.quotazione + ' · ' + FP.ROLE_NAMES[p.role] + '</div>';
      html += bidoneInfo;
      html += '</div>';
      html += '<div class="mercato-action">';
      html += '<div class="mercato-cost">' + formatNum(p.cost) + ' FC</div>';
      html += '<button class="btn-buy' + (canBuy ? "" : " disabled") + '" data-mercato-id="' + p.id + '">';
      html += canBuy ? 'ACQUISTA' : 'NON BASTA';
      html += '</button></div></div></div>';
    });

    el.innerHTML = html;

    el.querySelectorAll(".btn-buy:not(.disabled)").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.dataset.mercatoId;
        var result = Engine.buyPlayerFromMercato(id);
        if (result.ok) {
          showBuyModal(result.player, result.comment);
          render();
        } else {
          alert(result.msg);
        }
      });
    });
  }

  function renderStrutture(el) {
    var s = Engine.getState();
    var html = '<div class="strutture-header">';
    html += '<div class="strutture-title">🏗️ Strutture del Club</div>';
    html += '<div class="strutture-info">Potenzia la tua squadra</div>';
    html += '</div>';

    FP.UPGRADES.forEach(function (u) {
      var lvl = Engine.getUpgradeLevel(u.id);
      var cost = Engine.getUpgradeCost(u.id);
      var maxed = cost === Infinity;
      var canBuy = s.fc >= cost && !maxed;

      var effectDesc = "";
      if (u.effect.type === "mult") effectDesc = "+" + (u.effect.pct * 100).toFixed(0) + "% " + u.effect.stat;
      else if (u.effect.type === "flat") effectDesc = "+" + u.effect.val + " " + u.effect.stat;
      else if (u.effect.type === "reveal") effectDesc = "Rivela bidoni";
      else if (u.effect.type === "chance") effectDesc = "+" + (u.effect.pct * 100).toFixed(0) + "% chance";

      html += '<div class="upgrade-card">';
      html += '<div class="upgrade-icon">' + u.emoji + '</div>';
      html += '<div class="upgrade-info">';
      html += '<div class="upgrade-name">' + u.name + '</div>';
      html += '<div class="upgrade-desc">' + u.desc + '</div>';
      html += '<div class="upgrade-effect">' + effectDesc + '</div>';
      html += '<div class="upgrade-level">Lv. ' + lvl + (maxed ? ' MAX' : '') + '</div>';
      html += '</div>';
      html += '<div class="upgrade-action">';
      if (!maxed) {
        html += '<div class="upgrade-cost">' + formatNum(cost) + ' FC</div>';
        html += '<button class="btn-upgrade' + (canBuy ? "" : " disabled") + '" data-upgrade-id="' + u.id + '">';
        html += canBuy ? 'UPGRADE' : 'NON BASTA';
        html += '</button>';
      } else {
        html += '<div class="upgrade-maxed">MAXED</div>';
      }
      html += '</div></div>';
    });

    html += '<div class="prestige-section">';
    if (s.scudettiDoro > 0) {
      html += '<div class="scudetti-display">🏆 Scudetti d\'Oro: ' + s.scudettiDoro + ' (+' + (s.scudettiDoro * 25) + '% income)</div>';
    }
    if (s.fp >= 1000000 && s.scudettiDoro < 8) {
      html += '<button class="btn-prestige" id="btn-do-prestige">🏆 ALZA LA COPPA! (1M FP → reset)</button>';
    } else {
      var nextPrestige = s.scudettiDoro >= 8 ? "Completato!" : "Prossimo a " + formatNum(1000000) + " FP";
      html += '<div class="prestige-info">Prestige: ' + nextPrestige + '</div>';
    }
    html += '</div>';

    el.innerHTML = html;

    el.querySelectorAll(".btn-upgrade:not(.disabled)").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.dataset.upgradeId;
        var result = Engine.upgrade(id);
        if (result.ok) render();
        else if (result.msg) alert(result.msg);
      });
    });

    var prestigeBtn = el.querySelector("#btn-do-prestige");
    if (prestigeBtn) {
      prestigeBtn.addEventListener("click", function () {
        if (confirm("VINCI LO SCUDETTO D'ORO?\nPerderai tutti i giocatori, FC, FP e upgrade.\nRiceverai un +25% income permanente!")) {
          Engine.doPrestige();
        }
      });
    }
  }

  function renderClassifica(el) {
    var classifica = Engine.getSortClassifica();
    var html = '<div class="classifica-header">';
    html += '<div class="classifica-title">🏆 Classifica Fanta</div>';
    html += '<div class="classifica-info">Giornata ' + Engine.getState().giornata + '</div>';
    html += '</div>';

    html += '<div class="classifica-table">';
    html += '<div class="classifica-row header"><span class="cf-pos">#</span><span class="cf-team">Squadra</span><span class="cf-fp">FP</span></div>';
    classifica.forEach(function (team, i) {
      var pos = i + 1;
      var isUser = team.id === "user";
      var cls = "classifica-row" + (isUser ? " user-row" : "") + (pos <= 3 ? " top3" : "");
      html += '<div class="' + cls + '">';
      html += '<span class="cf-pos">' + pos + '</span>';
      html += '<span class="cf-team">' + team.emoji + ' ' + team.name + '</span>';
      html += '<span class="cf-fp">' + formatNum(team.fp) + '</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '<button class="btn-share" id="btn-share">📤 CONDIVIDI SQUADRA</button>';

    el.innerHTML = html;

    var shareBtn = el.querySelector("#btn-share");
    if (shareBtn) {
      shareBtn.addEventListener("click", shareTeam);
    }
  }

  function renderFeed() {
    var el = document.getElementById("feed-list");
    if (!el) return;
    var s = Engine.getState();
    var items = s.feed.slice(0, 30);
    var html = "";
    items.forEach(function (item) {
      var cls = "feed-item " + (item.type || "info");
      html += '<div class="' + cls + '">';
      html += '<span class="feed-msg">' + item.msg + '</span>';
      html += '<span class="feed-g">G' + item.giornata + '</span>';
      html += '</div>';
    });
    if (items.length === 0) {
      html = '<div class="feed-empty">Nessun evento ancora. La prima giornata sta per iniziare...</div>';
    }
    el.innerHTML = html;
  }

  function showBuyModal(player, comment) {
    var modal = document.getElementById("modal-overlay");
    var content = document.getElementById("modal-body");
    if (!modal || !content) return;
    content.innerHTML = '<div class="modal-buy">';
    content.innerHTML += '<div class="modal-icon">🎉</div>';
    content.innerHTML += '<div class="modal-title">ACQUISTO!</div>';
    content.innerHTML += '<div class="modal-player">' + player.name + '</div>';
    content.innerHTML += '<div class="modal-role">' + FP.ROLE_EMOJI[player.role] + ' ' + FP.ROLE_NAMES[player.role] + ' · Q' + player.quotazione + '</div>';
    content.innerHTML += '<div class="modal-comment">' + comment + '</div>';
    content.innerHTML += '<button class="btn-modal-close" id="modal-close">CONTINUA</button>';
    content.innerHTML += '</div>';
    modal.classList.add("on");
    document.getElementById("modal-close").addEventListener("click", function () {
      modal.classList.remove("on");
    });
  }

  function showOfflineModal(data) {
    var modal = document.getElementById("modal-overlay");
    var content = document.getElementById("modal-body");
    if (!modal || !content) return;
    content.innerHTML = '<div class="modal-offline">';
    content.innerHTML += '<div class="modal-icon">🌙</div>';
    content.innerHTML += '<div class="modal-title">BENTORNATO!</div>';
    content.innerHTML += '<div class="modal-offline-text">Mentre eri via la squadra ha giocato <b>' + data.giornate + ' giornate</b></div>';
    content.innerHTML += '<div class="modal-offline-rewards">+' + formatNum(data.fp) + ' FP · +' + formatNum(data.fc) + ' FC</div>';
    content.innerHTML += '<button class="btn-modal-close" id="modal-close">INCASSA!</button>';
    content.innerHTML += '</div>';
    modal.classList.add("on");
    document.getElementById("modal-close").addEventListener("click", function () {
      modal.classList.remove("on");
    });
  }

  function showPrestigeModal(scudetti) {
    var modal = document.getElementById("modal-overlay");
    var content = document.getElementById("modal-body");
    if (!modal || !content) return;
    var prestigeName = FP.PRESTIGE_NAMES[Math.min(scudetti - 1, FP.PRESTIGE_NAMES.length - 1)];
    content.innerHTML = '<div class="modal-prestige">';
    content.innerHTML += '<div class="modal-icon">🏆</div>';
    content.innerHTML += '<div class="modal-title">SCUDETTO D\'ORO #' + scudetti + '</div>';
    content.innerHTML += '<div class="modal-prestige-name">' + prestigeName + '</div>';
    content.innerHTML += '<div class="modal-prestige-bonus">+25% income permanente!</div>';
    content.innerHTML += '<button class="btn-modal-close" id="modal-close">NUOVA STAGIONE!</button>';
    content.innerHTML += '</div>';
    modal.classList.add("on");
    document.getElementById("modal-close").addEventListener("click", function () {
      modal.classList.remove("on");
    });
  }

  function showNotifications() {
    var s = Engine.getState();
    while (s.notifications.length > 0) {
      var n = s.notifications.shift();
      if (n.type === "offline") {
        showOfflineModal({ giornate: 0, fp: 0, fc: 0 });
        break;
      }
    }
  }

  function shareTeam() {
    var s = Engine.getState();
    var text = "🛋️⚽ FANTAPANCHINA\n";
    text += "La mia squadra:\n";
    text += "💰 " + formatNum(s.fc) + " FC\n";
    text += "⭐ " + formatNum(s.fp) + " FP\n";
    text += "📊 Giornata " + s.giornata + "\n";
    if (s.scudettiDoro > 0) text += "🏆 Scudetti: " + s.scudettiDoro + "\n";
    text += "\nIl fantacalcio che gioca da solo!";

    if (navigator.share) {
      navigator.share({ title: "FantaPanchina", text: text }).catch(function () { });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        alert("Squadra copiata negli appunti!");
      }).catch(function () { });
    }
  }

  return {
    init: init,
    formatNum: formatNum
  };

})();

document.addEventListener("DOMContentLoaded", function () {
  Engine.init();
  UI.init();
});
