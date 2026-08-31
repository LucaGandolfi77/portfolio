// empire.js — Impero di Soldania: idle game infinito
window.Empire = (() => {
  const BUILDINGS = [
    { id: 'limonata', name: 'Limonata', emoji: '🍋', desc: 'La tua prima fonte di reddito', baseCost: 15, baseRate: 0.5, costMult: 1.15 },
    { id: 'panificio', name: 'Panificio', emoji: '🍞', desc: 'Pane fresco ogni mattina', baseCost: 100, baseRate: 3, costMult: 1.15 },
    { id: 'bottega', name: 'Bottega', emoji: '🧵', desc: 'Tessuti e merci varie', baseCost: 500, baseRate: 12, costMult: 1.14 },
    { id: 'banca', name: 'Banca', emoji: '🏦', desc: 'Il denaro genera denaro', baseCost: 3000, baseRate: 50, costMult: 1.13 },
    { id: 'fondo', name: 'Fondo Investimenti', emoji: '📈', desc: 'Portafoglio diversificato', baseCost: 15000, baseRate: 200, costMult: 1.12 },
    { id: 'borsa', name: 'Borsa Valori', emoji: '💹', desc: 'Alta finanza, alti guadagni', baseCost: 80000, baseRate: 1000, costMult: 1.11 },
    { id: 'palazzo', name: 'Palazzo Reale', emoji: '🏰', desc: 'Il cuore del regno', baseCost: 500000, baseRate: 5000, costMult: 1.10 },
    { id: 'sovranofondo', name: 'Fondo Sovrano', emoji: '👑', desc: 'La ricchezza suprema della nazione', baseCost: 5000000, baseRate: 30000, costMult: 1.09 }
  ];

  const UPGRADES = [
    { id: 'u_limonata', name: 'Spremifrutta', desc: 'Limonata ×2', cost: 200, effect: { building: 'limonata', mult: 2 }, req: { limonata: 5 } },
    { id: 'u_panificio', name: 'Forno a Legna', desc: 'Panificio ×2', cost: 1500, effect: { building: 'panificio', mult: 2 }, req: { panificio: 5 } },
    { id: 'u_bottega', name: 'Telaio Meccanico', desc: 'Bottega ×2', cost: 8000, effect: { building: 'bottega', mult: 2 }, req: { bottega: 5 } },
    { id: 'u_banca', name: 'Prestiti Strategic', desc: 'Banca ×2', cost: 40000, effect: { building: 'banca', mult: 2 }, req: { banca: 5 } },
    { id: 'u_fondo', name: 'Algoritmo Quantistico', desc: 'Fondo ×2', cost: 200000, effect: { building: 'fondo', mult: 2 }, req: { fondo: 5 } },
    { id: 'u_borsa', name: 'IPO Esclusivo', desc: 'Borsa ×2', cost: 1000000, effect: { building: 'borsa', mult: 2 }, req: { borsa: 5 } },
    { id: 'u_palazzo', name: 'Corona Dimenticata', desc: 'Palazzo ×3', cost: 5000000, effect: { building: 'palazzo', mult: 3 }, req: { palazzo: 3 } },
    { id: 'u_sovrano', name: 'Oro della Corona', desc: 'Sovrano ×3', cost: 50000000, effect: { building: 'sovranofondo', mult: 3 }, req: { sovranofondo: 3 } },
    { id: 'u_all1', name: 'Educazione Finanziaria', desc: 'Tutti ×1.5', cost: 100000, effect: { all: true, mult: 1.5 }, req: { totalLevels: 30 } },
    { id: 'u_all2', name: 'Interesse Composto', desc: 'Tutti ×2', cost: 5000000, effect: { all: true, mult: 2 }, req: { totalLevels: 80 } },
    { id: 'u_all3', name: 'Alchimista Finanziario', desc: 'Tutti ×3', cost: 100000000, effect: { all: true, mult: 3 }, req: { totalLevels: 200 } }
  ];

  const EVENTS = [
    { id: 'crisi', title: '📉 Crisi di Mercato!', desc: 'Tutti i guadagni dimezzati per 15 secondi!', duration: 15000, effect: { type: 'multiplier', value: 0.5 } },
    { id: 'boom', title: '📈 Boom Economico!', desc: 'Tutti i guadagni raddoppiati per 15 secondi!', duration: 15000, effect: { type: 'multiplier', value: 2 } },
    { id: 'truffa', title: '🦹 Truffa!', desc: 'Perdi il 20% dei soldi!', duration: 0, effect: { type: 'losePercent', value: 0.2 } },
    { id: 'scoperta', title: '💎 Scoperta di un Tesoro!', desc: 'Guadagni €1000 × il tuo prestige!', duration: 0, effect: { type: 'bonus', value: 1000 } },
    { id: 'tasse', title: '🏛️ Rimborso Tasse!', desc: 'Hai ricevuto soldi dal regno!', duration: 0, effect: { type: 'bonus', value: 500 } },
    { id: 'albero', title: '🌳 Albero della Fortuna!', desc: 'I guadagni x3 per 20 secondi!', duration: 20000, effect: { type: 'multiplier', value: 3 } },
    { id: 'goccia', title: '💧 Goccia d\'Oro!', desc: '+500永久 bonus permanente!', duration: 0, effect: { type: 'permanentBonus', value: 500 } },
    { id: 'draghi', title: '🐉 Draghi Nemici!', desc: 'Niente guadagni per 10 secondi!', duration: 10000, effect: { type: 'multiplier', value: 0 } }
  ];

  let state, intervalId, eventTimeout, activeMultiplier = 1;
  let lastRender = 0;

  function calcBuildingCost(b, level) {
    return Math.round(b.baseCost * Math.pow(b.costMult, level));
  }

  function calcBuildingRate(b, level, upgrades) {
    let rate = b.baseRate * level;
    // Apply building-specific upgrade
    UPGRADES.filter(u => u.effect.building === b.id && upgrades[u.id]).forEach(u => {
      rate *= u.effect.mult;
    });
    // Apply global upgrades
    UPGRADES.filter(u => u.effect.all && upgrades[u.id]).forEach(u => {
      rate *= u.effect.mult;
    });
    return rate;
  }

  function totalRate() {
    let total = 0;
    BUILDINGS.forEach(b => {
      const level = state.buildings[b.id] || 0;
      total += calcBuildingRate(b, level, state.upgrades);
    });
    return total * state.prestigeMultiplier * activeMultiplier;
  }

  function totalLevels() {
    return Object.values(state.buildings).reduce((a, b) => a + b, 0);
  }

  function formatMoney(n) {
    if (n < 1000) return '€' + Math.round(n);
    if (n < 1e6) return '€' + (n / 1e3).toFixed(1) + 'K';
    if (n < 1e9) return '€' + (n / 1e6).toFixed(2) + 'M';
    if (n < 1e12) return '€' + (n / 1e9).toFixed(2) + 'B';
    if (n < 1e15) return '€' + (n / 1e12).toFixed(2) + 'T';
    if (n < 1e18) return '€' + (n / 1e15).toFixed(2) + 'Qa';
    return '€' + n.toExponential(1);
  }

  function updateBuildingCosts() {
    BUILDINGS.forEach(b => {
      const btn = document.getElementById('buy-' + b.id);
      if (!btn) return;
      const level = state.buildings[b.id] || 0;
      const cost = calcBuildingCost(b, level);
      const canAfford = state.money >= cost;
      btn.textContent = formatMoney(cost);
      btn.disabled = !canAfford;
    });
  }

  function buyBuilding(id) {
    const b = BUILDINGS.find(x => x.id === id);
    const level = state.buildings[b.id] || 0;
    const cost = calcBuildingCost(b, level);
    if (state.money >= cost) {
      state.money -= cost;
      state.buildings[b.id] = level + 1;
      Save.save();
      renderEmpire();
    }
  }

  function buyUpgrade(id) {
    const u = UPGRADES.find(x => x.id === id);
    if (state.money >= u.cost && !state.upgrades[id]) {
      state.money -= u.cost;
      state.upgrades[id] = true;
      Save.save();
      renderEmpire();
    }
  }

  function checkUpgradeAvailability(u) {
    if (u.req.totalLevels) return totalLevels() >= u.req.totalLevels;
    for (const [bid, lvl] of Object.entries(u.req)) {
      if ((state.buildings[bid] || 0) < lvl) return false;
    }
    return true;
  }

  function triggerEvent() {
    if (!state || !Save.get().empireUnlocked) return;
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    switch (ev.effect.type) {
      case 'multiplier':
        activeMultiplier = ev.effect.value;
        setTimeout(() => { activeMultiplier = 1; }, ev.duration);
        break;
      case 'losePercent':
        state.money = Math.max(0, state.money * (1 - ev.effect.value));
        break;
      case 'bonus':
        state.money += ev.effect.value * (state.prestigeMultiplier || 1);
        break;
      case 'permanentBonus':
        state.permanentBonus = (state.permanentBonus || 0) + ev.effect.value;
        break;
    }
    state.eventsDone = (state.eventsDone || 0) + 1;
    Save.save();

    const evDiv = document.getElementById('emp-event');
    if (evDiv) {
      evDiv.innerHTML = `<div class="emp-event"><div class="ev-title">${ev.title}</div><div class="ev-desc">${ev.desc}</div></div>`;
      setTimeout(() => { evDiv.innerHTML = ''; }, ev.duration || 3000);
    }
  }

  function doPrestige() {
    const levels = totalLevels();
    if (levels < 10) return;
    const newMult = 1 + Math.floor(levels / 10) * 0.25;
    state.money = 0;
    state.buildings = {};
    state.upgrades = {};
    state.prestigeCount = (state.prestigeCount || 0) + 1;
    state.prestigeMultiplier = newMult;
    Save.save();
    renderEmpire();
  }

  function renderEmpire() {
    const area = document.getElementById('game-area');
    if (!area) return;

    const rate = totalRate();
    const levels = totalLevels();
    const maxMult = 1 + Math.floor(levels / 10) * 0.25;

    let buildingsHtml = '';
    BUILDINGS.forEach(b => {
      const level = state.buildings[b.id] || 0;
      const cost = calcBuildingCost(b, level);
      const bRate = calcBuildingRate(b, level, state.upgrades);
      const canAfford = state.money >= cost;
      buildingsHtml += `
        <div class="emp-bld">
          <div class="bld-icon">${b.emoji}</div>
          <div class="bld-info">
            <div class="bld-name">${b.name}</div>
            <div class="bld-desc">${b.desc}</div>
            <div class="bld-level">Livello ${level}${bRate > 0 ? ` · ${formatMoney(bRate)}/s` : ''}</div>
          </div>
          <button class="bld-btn" id="buy-${b.id}" ${canAfford ? '' : 'disabled'}>${formatMoney(cost)}</button>
        </div>`;
    });

    let upgradesHtml = '';
    UPGRADES.forEach(u => {
      if (state.upgrades[u.id]) return;
      const available = checkUpgradeAvailability(u);
      if (!available) return;
      const canAfford = state.money >= u.cost;
      upgradesHtml += `
        <div class="emp-bld">
          <div class="bld-icon">⬆️</div>
          <div class="bld-info">
            <div class="bld-name">${u.name}</div>
            <div class="bld-desc">${u.desc}</div>
          </div>
          <button class="bld-btn" onclick="Empire.buyUpgrade('${u.id}')" ${canAfford ? '' : 'disabled'}>${formatMoney(u.cost)}</button>
        </div>`;
    });

    const prestigeGain = Math.floor(levels / 10) * 0.25;
    const canPrestige = levels >= 10;

    area.innerHTML = `
      <div class="emp-hdr">
        <div class="emp-money">${formatMoney(state.money)}</div>
        <div class="emp-rate">${formatMoney(rate)}/s${state.prestigeMultiplier > 1 ? ` ×${state.prestigeMultiplier.toFixed(2)}` : ''}</div>
      </div>
      <div class="emp-nav">
        <button class="emp-tab on" data-tab="buildings">🏗️ Edifici</button>
        <button class="emp-tab" data-tab="upgrades">⬆️ Miglioramenti</button>
        <button class="emp-tab" data-tab="prestige">👑 Prestige</button>
        <button class="emp-tab" data-tab="stats">📊 Statistiche</button>
      </div>
      <div id="emp-event"></div>
      <div class="emp-scroll" id="emp-content">
        <div class="emp-tab-content" data-tc="buildings">${buildingsHtml || '<div style="text-align:center;color:var(--dim);padding:20px">Nessun edificio disponibile</div>'}</div>
        <div class="emp-tab-content" data-tc="upgrades" style="display:none">${upgradesHtml || '<div style="text-align:center;color:var(--dim);padding:20px">Nessun miglioramento disponibile</div>'}</div>
        <div class="emp-tab-content" data-tc="prestige" style="display:none">
          <div class="emp-prestige">
            <div style="font-size:48px;margin:12px 0">👑</div>
            <div style="font-size:18px;font-weight:800;margin-bottom:8px">Rifonda il Regno</div>
            <div style="font-size:13px;color:var(--dim);margin-bottom:12px">
              Resetta tutti gli edifici e i miglioramenti.<br>
              Guadagni un moltiplicatore permanente:<br>
              <b style="color:var(--purple)">+${prestigeGain.toFixed(2)}x</b> (attuale: ×${state.prestigeMultiplier.toFixed(2)})
            </div>
            <button class="prestige-btn" ${canPrestige ? '' : 'disabled'} onclick="Empire.prestige()">
              👑 Rifonda (${canPrestige ? '+' + prestigeGain.toFixed(2) + 'x' : 'min 10 livelli'})
            </button>
            <div class="emp-prestige-info">Rifondate: ${state.prestigeCount || 0} volte</div>
          </div>
        </div>
        <div class="emp-tab-content" data-tc="stats" style="display:none">
          <div class="emp-stats">
            <div class="stat-row"><span>💰 Soldi totali guadagnati</span><span class="stat-val">${formatMoney(state.totalEarned || 0)}</span></div>
            <div class="stat-row"><span>🏗️ Edifici totali</span><span class="stat-val">${levels}</span></div>
            <div class="stat-row"><span>📈 Guadagno/secondo</span><span class="stat-val">${formatMoney(rate)}/s</span></div>
            <div class="stat-row"><span>👑 Prestige</span><span class="stat-val">×${state.prestigeMultiplier.toFixed(2)} (${state.prestigeCount || 0}x)</span></div>
            <div class="stat-row"><span>⚡ Eventi subiti</span><span class="stat-val">${state.eventsDone || 0}</span></div>
            <div class="stat-row"><span>⬆️ Miglioramenti</span><span class="stat-val">${Object.keys(state.upgrades).length}/${UPGRADES.length}</span></div>
            <div class="stat-row"><span>🎮 Sessioni Impero</span><span class="stat-val">${state.prestigeCount || 0}</span></div>
          </div>
        </div>
      </div>
    `;

    // Tab switching
    area.querySelectorAll('.emp-tab').forEach(tab => {
      tab.onclick = () => {
        area.querySelectorAll('.emp-tab').forEach(t => t.classList.remove('on'));
        area.querySelectorAll('.emp-tab-content').forEach(c => c.style.display = 'none');
        tab.classList.add('on');
        area.querySelector(`[data-tc="${tab.dataset.tab}"]`).style.display = '';
      };
    });

    // Buy buttons
    BUILDINGS.forEach(b => {
      const btn = document.getElementById('buy-' + b.id);
      if (btn) btn.onclick = () => buyBuilding(b.id);
    });

    updateBuildingCosts();
  }

  function gameLoop() {
    if (!state || !Save.get().empireUnlocked) return;
    const rate = totalRate();
    const now = Date.now();
    const dt = (now - lastRender) / 1000;
    state.money += rate * dt;
    state.totalEarned = (state.totalEarned || 0) + rate * dt;
    lastRender = now;
    updateBuildingCosts();
    const moneyEl = document.getElementById('hdr-money');
    if (moneyEl) moneyEl.textContent = formatMoney(state.money);
  }

  function startEmpire(area) {
    const saved = Save.get();
    state = saved.empire;

    // Calculate offline earnings
    const now = Date.now();
    const offlineSec = (now - state.lastTick) / 1000;
    if (offlineSec > 10 && offlineSec < 86400) {
      const rate = totalRate();
      const offlineEarnings = Math.round(rate * offlineSec * 0.5); // 50% efficiency offline
      if (offlineEarnings > 0) {
        state.money += offlineEarnings;
        state.totalEarned += offlineEarnings;
        setTimeout(() => {
          const evDiv = document.getElementById('emp-event');
          if (evDiv) {
            evDiv.innerHTML = `<div class="emp-event"><div class="ev-title">🌙 Guadagni Offline!</div><div class="ev-desc">Hai guagnato ${formatMoney(offlineEarnings)} mentre eri assente (${Math.round(offlineSec / 60)} min)</div></div>`;
            setTimeout(() => { evDiv.innerHTML = ''; }, 5000);
          }
        }, 1000);
      }
    }

    state.lastTick = now;
    lastRender = now;
    Save.save();
    renderEmpire();

    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, 100);

    // Random events every 30-90 seconds
    clearTimeout(eventTimeout);
    function scheduleEvent() {
      const delay = 30000 + Math.random() * 60000;
      eventTimeout = setTimeout(() => {
        triggerEvent();
        scheduleEvent();
      }, delay);
    }
    scheduleEvent();
  }

  function stopEmpire() {
    clearInterval(intervalId);
    clearTimeout(eventTimeout);
    Save.save();
  }

  return { startEmpire, stopEmpire, renderEmpire, buyUpgrade, prestige: doPrestige, formatMoney };
})();
