// main.js — Router, UI, e integrazioni VOTOPOLI
(function() {
  const $ = id => document.getElementById(id);
  let state, currentView = 'menu', electionData = null, eventTimer = null;

  // === NEWS FEED ===
  function addNews(text, emoji) {
    state = Save.get();
    state.newsFeed.unshift({ text, emoji, ts: Date.now() });
    if (state.newsFeed.length > 20) state.newsFeed = state.newsFeed.slice(0, 20);
    Save.save(state);
  }

  function renderNewsFeed(max) {
    state = Save.get();
    if (!state.newsFeed.length) return '<div style="font-size:11px;color:var(--dim);text-align:center;padding:12px">Nessuna novità ancora!</div>';
    return state.newsFeed.slice(0, max || 5).map(n =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line)">
        <span style="font-size:16px">${n.emoji}</span>
        <span style="font-size:11px;flex:1">${n.text}</span>
      </div>`
    ).join('');
  }

  // === INIT ===
  Save.save(); // ensure key exists
  state = Save.get();
  if (state.settings.darkMode) document.body.classList.add('dark-mode');
  renderMenu();
  Onboarding.start();

  // === HAPTICS (using Haptic module) ===

  // === FORMAT ===
  function fmt(n) { return Save.formatMoney(n); }

  // === MENU ===
  function renderMenu() {
    const saved = Save.get();
    currentView = 'menu';
    $('game-view').style.display = 'none';
    $('menu-view').style.display = '';

    const city = World.getCity(saved.city);
    const country = World.getCountry(saved.country);
    const home = World.getHome(saved.home);
    const hasProgress = saved.totalEarned > 0;

    $('menu-view').innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="font-size:64px;margin:8px 0">🗳️</div>
        <h1 style="font-size:28px;font-weight:900;color:var(--gold);margin:0">VOTOPOLI</h1>
        <div style="font-size:11px;color:var(--dim);margin:4px 0 16px">La Democrazia è un Gioco</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-width:280px;margin:0 auto">
          <button class="btn primary" id="btn-new">🆕 Nuova Partita</button>
          ${hasProgress ? `<button class="btn" id="btn-continue" style="border-color:var(--gold)">▶️ Continua a ${city ? country.flag + ' ' + city.name : 'giocare'}</button>` : ''}
          <button class="btn" id="btn-map" style="border-color:var(--blue)">🌍 Mappa del Mondo</button>
          <button class="btn" id="btn-store" style="border-color:var(--green)">🛒 Negozio</button>
        </div>
        <div style="display:flex;gap:8px;max-width:280px;margin:12px auto 0">
          <button class="btn small ghost" id="btn-settings" style="flex:1">⚙️ Impostazioni</button>
          <button class="btn small ghost" id="btn-news-menu" style="flex:1">📰 Novità</button>
        </div>
        <div style="margin-top:20px;font-size:10px;color:var(--dim)">
          ${hasProgress ? `💰 ${fmt(saved.money)} | 🗳️ ${saved.influence} influenza | 🏠 ${home.emoji} ${home.name}` : ''}
          ${window.Achievements ? `<br>🏆 Obiettivi: ${Achievements.count()}/${Achievements.total()}` : ''}
        </div>
      </div>`;

    $('btn-new').onclick = () => {
      Sounds.play('click'); Haptic.tap();
      if (hasProgress && !confirm('Ricominciare? Il progresso attuale verrà cancellato.')) return;
      state = Save.reset();
      startNewGame();
    };

    if (hasProgress) {
      $('btn-continue').onclick = () => {
        Sounds.play('click'); Haptic.tap();
        state = Save.get();
        enterCity();
      };
    }

    $('btn-map').onclick = () => {
      Sounds.play('click'); Haptic.tap();
      showWorldMap();
    };

    $('btn-store').onclick = () => {
      Sounds.play('click'); Haptic.tap();
      showStore();
    };

    $('btn-settings').onclick = () => {
      Sounds.play('click'); Haptic.tap();
      showSettings();
    };

    $('btn-news-menu').onclick = () => {
      Sounds.play('click'); Haptic.tap();
      showNewsFeed();
    };
  }

  // === NEW GAME ===
  function startNewGame() {
    state = Save.get();
    state.name = 'Cittadino';
    showCityPicker();
  }

  function showCityPicker() {
    currentView = 'citypicker';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';

    const citiesHtml = Object.entries(World.CITIES).map(([id, c]) => {
      const country = World.getCountry(c.country);
      const affordable = state.money >= 100;
      return `<div class="city-card ${affordable ? '' : 'locked'}" data-city="${id}">
        <div style="font-size:20px">${country.flag}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700">${c.name}</div>
          <div style="font-size:10px;color:var(--dim)">${c.desc}</div>
          <div style="font-size:9px;color:var(--dim)">Tier ${c.tier} · ${country.name}</div>
        </div>
      </div>`;
    }).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">🌍 Scegli la tua città iniziale</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Inizi con €100 e una tenda. Scegli saggiamente!</div>
        <div style="max-height:60vh;overflow-y:auto">${citiesHtml}</div>
      </div>`;

    $('game-area').querySelectorAll('.city-card').forEach(el => {
      el.onclick = () => {
        const cityId = el.dataset.city;
        Sounds.play('vote'); Haptic.select();
        state.city = cityId;
        const city = World.getCity(cityId);
        state.country = city.country;
        state.money = 100;
        state.home = 0;
        state.businesses = {};
        state.lastTick = Date.now();
        Save.save(state);
        enterCity();
      };
    });
  }

  // === ENTER CITY ===
  function enterCity() {
    currentView = 'city';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';

    state = Save.get();
    Housing.applyHomeBonus(state);
    // Apply party offline bonus
    if (window.Party) {
      const extraHours = Party.getExtraOfflineHours(state);
      if (extraHours > 0) state.homeOfflineHours = (state.homeOfflineHours || 2) + extraHours;
    }
    // Apply city service energy bonus
    if (window.CityServices) {
      const svcEnergy = CityServices.getEnergyBonus(state);
      if (svcEnergy > 0) state.maxEnergy = Math.max(state.maxEnergy, 50 + svcEnergy);
    }
    Challenges.generate(state);
    Challenges.checkProgress(state);

    // Seasonal event chance (10% on enter)
    if (window.Seasons && Math.random() < 0.1) {
      const seasonEvent = Seasons.applySeasonalBonus(state);
      if (seasonEvent) {
        Save.save(state);
        setTimeout(() => {
          const evDiv = document.createElement('div');
          evDiv.className = 'event-toast';
          evDiv.innerHTML = `
            <div style="font-size:24px;margin-bottom:8px">${seasonEvent.emoji}</div>
            <div style="font-size:13px;font-weight:700">${seasonEvent.title}</div>
            <div style="font-size:11px;color:var(--dim)">${seasonEvent.msg}</div>`;
          document.body.appendChild(evDiv);
          setTimeout(() => evDiv.remove(), 4000);
        }, 1500);
      }
    }

    const idle = Economy.applyIdleEarnings(state);
    if (idle.earned > 0) {
      Save.save(state);
      if (window.Achievements) Achievements.checkAndNotify();
      const elapsed = Date.now() - (state.lastTick || Date.now());
      showOfflineEarnings(idle.earned, idle.tax, idle.influence || 0, elapsed, idle.offline);
    }

    if (eventTimer) clearInterval(eventTimer);
    eventTimer = setInterval(() => {
      if (currentView !== 'city') return;
      state = Save.get();
      updateCityUI();
    }, 2000);

    updateCityUI();
  }

  function updateCityUI() {
    const city = World.getCity(state.city);
    const country = World.getCountry(state.country);
    const home = World.getHome(state.home);
    const taxRate = Economy.calcTaxRate(state);
    const gross = Economy.totalRate(state);
    const net = Economy.netIncome(state);
    const infRate = Economy.calcInfluenceRate(state.businesses);

    const canLocalVote = Elections.canVoteLocal(state.lastElection);
    const canNationalVote = Elections.canVoteNational(state.lastNationalElection);
    const pollsOpen = Elections.isPollsOpen();
    const nextLocal = Elections.formatCountdown(Elections.getTimeUntilNextLocal());
    const nextNational = Elections.formatCountdown(Elections.getTimeUntilNextNational());

    let electionBadge = '';
    if (pollsOpen && canLocalVote) electionBadge = '<span class="badge pulse">🗳️ ELEZIONI LOCALI APERT!</span>';
    if (canNationalVote) electionBadge = '<span class="badge pulse" style="background:var(--purple)">🏛️ ELEZIONI NAZIONALI!</span>';

    const seasonHtml = window.Seasons ? Seasons.render() : '';
    const party = window.Party ? Party.getCurrent(state) : null;
    const partyBadge = party ? `<span style="font-size:11px;margin-left:8px">${party.emoji} ${party.name}</span>` : '';
    const prestigeBadge = (state.prestigeCount || 0) > 0 ? `<span style="font-size:11px;color:var(--gold);margin-left:8px">📜 x${(state.prestigeMultiplier || 1).toFixed(2)}</span>` : '';

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div class="city-header">
          <div style="font-size:32px">${country.flag}</div>
          <div style="flex:1">
            <div style="font-size:18px;font-weight:800">${city.name}</div>
            <div style="font-size:10px;color:var(--dim)">${home.emoji} ${home.name} · Tier ${city.tier}${partyBadge}${prestigeBadge}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:14px;font-weight:700;color:var(--gold)">${fmt(state.money)}</div>
            <div style="font-size:10px;color:var(--dim)">⚡ ${state.energy}/${state.maxEnergy}</div>
          </div>
        </div>

        ${electionBadge}

        <div style="margin:6px 0">${seasonHtml}</div>

        <div class="stat-row"><span>📈 Income</span><span class="stat-val">+${fmt(gross)}/s (${fmt(net)} netti)</span></div>
        <div class="stat-row"><span>🏛️ Tasse</span><span class="stat-val">${taxRate}%</span></div>
        <div class="stat-row"><span>🗳️ Influenza</span><span class="stat-val">${state.influence} (+${infRate}/s)</span></div>
        <div class="stat-row"><span>📰 Scandali</span><span class="stat-val">${state.scandals}</span></div>

        ${Challenges.render(state)}

        <div class="nav-grid">
          <button class="nav-btn" id="nav-home">🏠 Casa</button>
          <button class="nav-btn" id="nav-biz">💼 Business</button>
          <button class="nav-btn ${pollsOpen && canLocalVote ? 'pulse' : ''}" id="nav-election">🗳️ Elezioni</button>
          <button class="nav-btn" id="nav-minigames">🎮 Minigiochi</button>
          <button class="nav-btn" id="nav-citizens">👥 Cittadini</button>
          <button class="nav-btn" id="nav-move">🗺️ Trasferisci</button>
        </div>

        <div style="display:flex;justify-content:center;gap:16px;margin:4px 0 8px">
          <button id="nav-settings" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--dim)">⚙️</button>
          <button id="nav-news" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--dim)">📰</button>
          <button id="nav-party" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--dim)">🏛️</button>
          <button id="nav-services" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--dim)">🏗️</button>
          <button id="nav-prestige" style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--dim)">📜</button>
        </div>

        <div style="font-size:10px;color:var(--dim);text-align:center;margin-top:12px">
          ${pollsOpen ? `🗳️ Prossima elezione locale: ${nextLocal}` : `🗳️ Locali tra: ${nextLocal}`}
          <br>🏛️ Prossime nazionali: ${nextNational}
        </div>
      </div>`;

    $('nav-home').onclick = () => { Sounds.play('click'); showHome(); };
    $('nav-biz').onclick = () => { Sounds.play('click'); showBusinesses(); };
    $('nav-election').onclick = () => { Sounds.play('click'); showElections(); };
    $('nav-minigames').onclick = () => { Sounds.play('click'); showMinigames(); };
    $('nav-citizens').onclick = () => { Sounds.play('click'); showCitizens(); };
    $('nav-move').onclick = () => { Sounds.play('click'); showMove(); };
    $('nav-settings').onclick = () => { Sounds.play('click'); showSettings(); };
    $('nav-news').onclick = () => { Sounds.play('click'); showNewsFeed(); };
    $('nav-party').onclick = () => { Sounds.play('click'); showParty(); };
    $('nav-services').onclick = () => { Sounds.play('click'); showCityServices(); };
    $('nav-prestige').onclick = () => { Sounds.play('click'); showPrestige(); };
  }

  function showOfflineEarnings(earned, tax, influence, elapsed, wasOffline) {
    if (!wasOffline) return;

    function formatDuration(ms) {
      const sec = Math.floor(ms / 1000);
      const min = Math.floor(sec / 60);
      const hr = Math.floor(min / 60);
      if (hr > 0) return `${hr}h ${min % 60}m`;
      if (min > 0) return `${min}m ${sec % 60}s`;
      return `${sec}s`;
    }

    const timeAway = formatDuration(elapsed);
    const net = earned;
    const perMin = elapsed > 60000 ? Math.round((earned / (elapsed / 1000)) * 60) : earned;

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s';
    overlay.innerHTML = `
      <div style="background:var(--card);border-radius:16px;padding:20px;max-width:300px;width:90%;text-align:center;transform:translateY(20px);transition:transform 0.3s">
        <div style="font-size:48px;margin:8px 0">🌙</div>
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">Bentornato!</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Assente per ${timeAway}</div>

        <div style="background:var(--card2);border-radius:10px;padding:10px;margin-bottom:12px">
          <div class="stat-row"><span>💰 Guadagni lordi</span><span class="stat-val">${fmt(earned + tax)}</span></div>
          <div class="stat-row"><span>🏛️ Tasse</span><span class="stat-val" style="color:var(--red)">-${fmt(tax)}</span></div>
          <div class="stat-row" style="border:none"><span>✅ Netto</span><span class="stat-val" style="color:var(--green);font-size:14px">${fmt(net)}</span></div>
          ${influence > 0 ? `<div class="stat-row" style="border:none"><span>🗳️ Influenza</span><span class="stat-val" style="color:var(--blue)">+${influence}</span></div>` : ''}
          <div style="font-size:9px;color:var(--dim);margin-top:4px">${fmt(perMin)}/min</div>
        </div>

        <button class="btn primary" id="offline-collect" style="width:100%">💰 Raccogli</button>
      </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('div:last-child').style.transform = 'translateY(0)';
    });

    document.getElementById('offline-collect').onclick = () => {
      Haptic.success();
      overlay.style.opacity = '0';
      overlay.querySelector('div:last-child').style.transform = 'translateY(20px)';
      setTimeout(() => overlay.remove(), 300);
    };
  }

  // === HOME ===
  function showHome() {
    state = Save.get();
    const home = World.getHome(state.home);
    const nextHome = World.getHome(state.home + 1);
    const upgradeCost = Housing.getHomeUpgradeCost(state.home, state.city);
    const canUpgrade = Housing.canUpgrade(state.home, state.city, state.money);

    $('game-area').innerHTML = `
      <div style="padding:12px;text-align:center">
        <div style="font-size:64px;margin:16px 0">${home.emoji}</div>
        <div style="font-size:20px;font-weight:800">${home.name}</div>
        <div style="font-size:11px;color:var(--dim);margin:4px 0 16px">${home.desc}</div>
        <div class="stat-row"><span>⚡ Energia max</span><span class="stat-val">${state.maxEnergy}</span></div>
        <div class="stat-row"><span>🌙 Offline</span><span class="stat-val">${home.offlineHours}h</span></div>
        ${nextHome ? `
          <div class="stat-row"><span>Prossimo: ${nextHome.emoji} ${nextHome.name}</span><span class="stat-val">${fmt(upgradeCost)}</span></div>
          <button class="btn primary" id="btn-upgrade" ${canUpgrade ? '' : 'disabled'} style="margin-top:12px">
            ⬆️ Migliora a ${nextHome.name} (${fmt(upgradeCost)})
          </button>
        ` : '<div style="font-size:14px;color:var(--gold);margin-top:16px">🏆 Massimo livello raggiunto!</div>'}
        <button class="btn ghost" id="btn-back" style="margin-top:8px">← Indietro</button>
      </div>`;

    const upgradeBtn = document.getElementById('btn-upgrade');
    if (upgradeBtn) upgradeBtn.onclick = () => {
      Sounds.play('levelup'); Haptic.heavy();
      Housing.upgrade(state);
      Save.save(state);
      if (window.Achievements) Achievements.checkAndNotify();
      showHome();
    };
    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === BUSINESSES ===
  function showBusinesses() {
    state = Save.get();
    const businessesHtml = Economy.BUSINESSES.map(b => {
      const level = state.businesses[b.id] || 0;
      const cost = Economy.calcBuildingCost(b, level);
      const rate = Economy.calcBuildingRate(b, level + 1, state.country);
      const canAfford = state.money >= cost;

      return `<div class="bld-row">
        <div style="font-size:24px">${b.emoji}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${b.name}</div>
          <div style="font-size:10px;color:var(--dim)">Livello ${level}${b.type === 'political' ? ' (genera influenza)' : ` · +${fmt(rate)}/s`}</div>
        </div>
        <button class="btn small ${canAfford ? 'primary' : ''}" id="buy-${b.id}" ${canAfford ? '' : 'disabled'}>${fmt(cost)}</button>
      </div>`;
    }).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">💼 Business</div>
        <div style="max-height:60vh;overflow-y:auto">${businessesHtml}</div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    Economy.BUSINESSES.forEach(b => {
      const btn = document.getElementById('buy-' + b.id);
      if (btn) btn.onclick = () => {
        const level = state.businesses[b.id] || 0;
        const cost = Economy.calcBuildingCost(b, level);
        if (state.money >= cost) {
          state.money -= cost;
          state.businesses[b.id] = level + 1;
          state.totalBusinessLevels++;
          Sounds.play('buy'); Haptic.tap();
          Save.save(state);
          addNews(`Hai comprato ${b.name} per ${fmt(cost)}!`, b.emoji);
          if (window.Achievements) Achievements.checkAndNotify();
          showBusinesses();
        }
      };
    });
    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === ELECTIONS ===
  function showElections() {
    state = Save.get();
    const canLocal = Elections.canVoteLocal(state.lastElection);
    const canNational = Elections.canVoteNational(state.lastNationalElection);
    const pollsOpen = Elections.isPollsOpen();

    let html = '<div style="padding:12px">';
    html += '<div style="font-size:18px;font-weight:800;margin-bottom:12px">🗳️ Elezioni</div>';

    if (pollsOpen && canLocal) {
      html += `<div class="election-card" id="start-local">
        <div style="font-size:24px">🗳️</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:700">Elezioni Locali</div>
        <div style="font-size:10px;color:var(--dim)">Vota per il prossimo sindaco della tua città</div></div>
        <div style="color:var(--green);font-size:12px;font-weight:700">APERTO</div>
      </div>`;
    } else if (!pollsOpen) {
      html += `<div class="election-card disabled">
        <div style="font-size:24px">🗳️</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:700">Elezioni Locali</div>
        <div style="font-size:10px;color:var(--dim)">Seggi chiusi. Prossime: ${Elections.formatCountdown(Elections.getTimeUntilNextLocal())}</div></div>
      </div>`;
    } else {
      html += `<div class="election-card disabled">
        <div style="font-size:24px">🗳️</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:700">Elezioni Locali</div>
        <div style="font-size:10px;color:var(--dim)">Hai già votato oggi!</div></div>
      </div>`;
    }

    if (canNational) {
      html += `<div class="election-card" id="start-national" style="border-color:var(--purple)">
        <div style="font-size:24px">🏛️</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:700">Elezioni Nazionali</div>
        <div style="font-size:10px;color:var(--dim)">Vota per il prossimo presidente</div></div>
        <div style="color:var(--purple);font-size:12px;font-weight:700">APERTO</div>
      </div>`;
    } else {
      html += `<div class="election-card disabled">
        <div style="font-size:24px">🏛️</div>
        <div style="flex:1"><div style="font-size:14px;font-weight:700">Elezioni Nazionali</div>
        <div style="font-size:10px;color:var(--dim)">Prossime: ${Elections.formatCountdown(Elections.getTimeUntilNextNational())}</div></div>
      </div>`;
    }

    html += '<button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>';
    html += '</div>';
    $('game-area').innerHTML = html;

    const localBtn = document.getElementById('start-local');
    if (localBtn) localBtn.onclick = () => startLocalElection();
    const nationalBtn = document.getElementById('start-national');
    if (nationalBtn) nationalBtn.onclick = () => startNationalElection();
    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  function startLocalElection() {
    electionData = Elections.setupLocalElection(state.city);
    showVotingBooth(electionData, 'local');
  }

  function startNationalElection() {
    electionData = Elections.setupNationalElection();
    showVotingBooth(electionData, 'national');
  }

  function showVotingBooth(data, type) {
    let playerVote = null, donationAmount = 0;

    function render() {
      const candidatesHtml = data.candidates.map(c => `
        <div class="candidate-card ${playerVote === c.id ? 'selected' : ''}" data-id="${c.id}">
          <div style="font-size:28px">${c.partyEmoji}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700">${c.name}</div>
            <div style="font-size:10px;color:${c.partyColor}">${c.party}</div>
            <div style="font-size:9px;color:var(--dim)">Tasse: ${c.taxRate}% · Favore: ${c.favor.emoji} ${c.favor.name}</div>
          </div>
          <div style="font-size:10px;color:var(--dim)">${c.votes?.toFixed(1) || '0'} voti</div>
        </div>`).join('');

      $('game-area').innerHTML = `
        <div style="padding:12px">
          <div style="font-size:18px;font-weight:800;margin-bottom:8px">${type === 'national' ? '🏛️ Elezioni Nazionali' : '🗳️ Elezioni Locali'}</div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Scegli il tuo candidato e dona per aumentare le sue possibilità!</div>
          ${candidatesHtml}
          <div style="margin-top:12px;padding:10px;background:var(--card);border-radius:8px">
            <div style="font-size:11px;color:var(--dim);margin-bottom:6px">💰 Dona alla campagna (influenza): ${state.influence}</div>
            <div style="display:flex;gap:6px">
              <button class="btn small" id="donate-10">+10</button>
              <button class="btn small" id="donate-25">+25</button>
              <button class="btn small" id="donate-50">+50</button>
            </div>
          </div>
          <button class="btn primary" id="btn-vote" ${playerVote ? '' : 'disabled'} style="margin-top:12px;width:100%">
            🗳️ Vota ${playerVote ? '' : '(scegli un candidato)'}
          </button>
        <button class="btn ghost" id="btn-share-ach" style="margin-top:6px;width:100%">📤 Condividi Progressi</button>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
        </div>`;

      document.querySelectorAll('.candidate-card').forEach(el => {
        el.onclick = () => {
          playerVote = el.dataset.id;
          Sounds.play('click'); Haptic.light();
          render();
        };
      });

      const donateBtn = document.getElementById('btn-vote');
      if (donateBtn) donateBtn.onclick = () => {
        if (!playerVote) return;
        Sounds.play('vote'); Haptic.heavy();
        state.influence -= donationAmount;
        state.votesCast++;
        state.lastElection = new Date().toISOString();
        if (type === 'national') state.lastNationalElection = new Date().toISOString();
        Save.save(state);
        if (window.Achievements) Achievements.checkAndNotify();
        resolveAndShow(data, playerVote, donationAmount, type);
      };

      ['10', '25', '50'].forEach(amt => {
        const btn = document.getElementById('donate-' + amt);
        if (btn) btn.onclick = () => {
          const a = parseInt(amt);
          if (state.influence >= a) {
            donationAmount += a;
            state.influence -= a;
            Sounds.play('coin'); Haptic.light();
            render();
          }
        };
      });

      document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
    }

    render();
  }

  function resolveAndShow(data, playerVote, donationAmount, type) {
    const result = Elections.resolveElection(data, playerVote, donationAmount);
    const scandals = Elections.applyScandalChance(data.candidates);
    const favor = Elections.applyFavor(result.winner, donationAmount, true);

    let html = '<div style="padding:12px;text-align:center">';
    html += `<div style="font-size:48px;margin:16px 0">${result.winner.partyEmoji}</div>`;
    html += `<div style="font-size:18px;font-weight:800">Vincitore: ${result.winner.name}</div>`;
    html += `<div style="font-size:12px;color:${result.winner.partyColor}">${result.winner.party}</div>`;
    html += `<div style="font-size:11px;color:var(--dim);margin:8px 0">Tasse: ${result.winner.taxRate}% · Affluenza: ${(result.turnout * 100).toFixed(0)}%</div>`;

    result.results.forEach(c => {
      const pct = result.totalVotes > 0 ? ((c.votes / result.totalVotes) * 100).toFixed(1) : 0;
      html += `<div class="stat-row"><span>${c.partyEmoji} ${c.name}</span><span class="stat-val">${pct}%</span></div>`;
    });

    if (favor) {
      state.favorCount++;
      applyFavorEffect(favor);
      html += `<div style="margin-top:12px;padding:10px;background:var(--green-light);border-radius:8px;font-size:12px">
        ✅ ${favor.message}
      </div>`;
    }

    // Check if player's candidate won
    const playerWon = result.winner.id === playerVote;
    if (playerWon) state.electionsWon++;

    // Party free favor
    if (window.Party && Party.hasFreeFavor(state) && playerWon) {
      state.favorCount++;
      html += `<div style="margin-top:8px;padding:10px;background:var(--green-light);border-radius:8px;font-size:12px">
        🎁 Favore gratuito dal tuo partito!
      </div>`;
    }

    scandals.forEach(s => {
      state.money -= s.value;
      state.scandals++;
      addNews(s.title, '📰');
      html += `<div style="margin-top:8px;padding:10px;background:var(--red-light);border-radius:8px;font-size:12px">
        📰 ${s.title}
      </div>`;
    });

    if (type === 'local') {
      state.mayorTax = result.winner.taxRate;
    }

    Save.save(state);
    Sounds.play('election');
    addNews(`${result.winner.name} vince le elezioni ${type === 'national' ? 'nazionali' : 'locali'} con il ${result.winner.party}`, result.winner.partyEmoji);
    if (window.Achievements) Achievements.checkAndNotify();

    html += `<button class="btn primary" id="btn-ok" style="margin-top:12px;width:100%">Continua</button>`;
    html += `<button class="btn ghost" id="btn-share-election" style="margin-top:6px;width:100%">📤 Condividi Risultato</button>`;
    html += '</div>';
    $('game-area').innerHTML = html;
    document.getElementById('btn-ok').onclick = () => { Sounds.play('click'); enterCity(); };
    document.getElementById('btn-share-election').onclick = () => {
      Haptic.tap();
      Share.shareElection(result, World.getCity(state.city).name);
    };
  }

  function applyFavorEffect(favor) {
    switch (favor.type) {
      case 'tax_holiday': state.mayorTax = 0; break;
      case 'income_boost': break; // temporary, apply in economy
      case 'money_bonus': state.money += favor.value; break;
      case 'discount': break;
      case 'home_upgrade':
        if (state.home < 7) state.home++;
        Housing.applyHomeBonus(state);
        break;
      case 'free_upgrade':
        if (state.home < 7) state.home++;
        Housing.applyHomeBonus(state);
        break;
    }
  }

  // === MINIGAMES ===
  function showMinigames() {
    state = Save.get();
    const gamesHtml = Minigames.getGames().map(g => {
      const canPlay = state.energy >= g.cost;
      return `<div class="mg-select-card ${canPlay ? '' : 'locked'}" data-game="${g.id}">
        <div style="font-size:28px">${g.emoji}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700">${g.name}</div>
          <div style="font-size:10px;color:var(--dim)">${g.desc}</div>
        </div>
        <div style="font-size:10px;color:var(--gold)">⚡${g.cost}</div>
      </div>`;
    }).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">🎮 Minigiochi</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">⚡ Energia: ${state.energy}/${state.maxEnergy}</div>
        ${gamesHtml}
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    Minigames.getGames().forEach(g => {
      const el = document.querySelector(`[data-game="${g.id}"]`);
      if (el) el.onclick = () => {
        if (state.energy < g.cost) return;
        state.energy -= g.cost;
        Save.save(state);
        Sounds.play('click'); Haptic.tap();
        startMinigame(g);
      };
    });
    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  function startMinigame(game) {
    const area = $('game-area');
    Minigames.start(game.id, area, (passed, score) => {
      const baseReward = passed ? score : Math.round(score * 0.3);
      const partyMgBonus = window.Party ? Party.getMinigameBonus(state) : 0;
      const reward = Math.round(baseReward * (1 + partyMgBonus / 100) * Monetization.getMultiplier());
      state.money += reward;
      if (passed) {
        state.minigameWins = (state.minigameWins || 0) + 1;
        Sounds.play('coin'); Haptic.select();
        addNews(`Hai completato ${game.name}! +${fmt(reward)}€`, '🎮');
      } else {
        Sounds.play('wrong'); Haptic.error();
      }
      Save.save(state);
      if (window.Achievements) Achievements.checkAndNotify();
      setTimeout(() => {
        area.innerHTML = `
          <div class="mg-card" style="text-align:center">
            <div style="font-size:48px;margin:16px 0">${passed ? '🎉' : '😔'}</div>
            <div style="font-size:16px;font-weight:800">${passed ? 'Completato!' : 'Non ce l\'hai fatta!'}</div>
            <div style="font-size:12px;color:var(--dim);margin:8px 0">Punti: ${score} · Premio: ${fmt(reward)}</div>
            <button class="btn primary" id="mg-ok">Continua</button>
          </div>`;
        document.getElementById('mg-ok').onclick = () => { Sounds.play('click'); showMinigames(); };
      }, 1500);
    });
  }

  // === CITIZENS ===
  function showCitizens() {
    state = Save.get();
    const bots = Bots.generateBots(state.city, 12);
    const citizensHtml = bots.map(b => `
      <div class="citizen-row">
        <div style="font-size:20px">🧑</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${b.name}</div>
          <div style="font-size:9px;color:var(--dim)">${World.getHome(b.home).emoji} ${World.getHome(b.home).name}</div>
        </div>
        <div style="font-size:10px;color:var(--dim)">${fmt(b.money)}</div>
      </div>`).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">👥 Cittadini</div>
        <div style="max-height:55vh;overflow-y:auto">${citizensHtml}</div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === MOVE ===
  function showMove() {
    state = Save.get();
    const citiesHtml = Object.entries(World.CITIES).map(([id, c]) => {
      if (id === state.city) return '';
      const country = World.getCountry(c.country);
      const cost = World.getMoveCost(state.city, id);
      const canAfford = state.money >= cost;
      return `<div class="city-card ${canAfford ? '' : 'locked'}" data-city="${id}">
        <div style="font-size:20px">${country.flag}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${c.name}</div>
          <div style="font-size:10px;color:var(--dim)">Tier ${c.tier} · ${country.name}</div>
        </div>
        <div style="font-size:11px;color:${canAfford ? 'var(--green)' : 'var(--red)'}">${fmt(cost)}</div>
      </div>`;
    }).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">🗺️ Trasferisciti</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">💰 ${fmt(state.money)}</div>
        <div style="max-height:55vh;overflow-y:auto">${citiesHtml}</div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.querySelectorAll('.city-card').forEach(el => {
      el.onclick = () => {
        const cityId = el.dataset.city;
        const cost = World.getMoveCost(state.city, cityId);
        if (state.money < cost) return;
        Sounds.play('move'); Haptic.select();
        state.money -= cost;
        state.city = cityId;
        const city = World.getCity(cityId);
        state.country = city.country;
        state.moveCount++;
        Save.save(state);
        addNews(`Ti sei trasferito a ${World.getCity(cityId).name}!`, '🗺️');
        if (window.Achievements) Achievements.checkAndNotify();
        enterCity();
      };
    });
    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === WORLD MAP ===
  function showWorldMap() {
    currentView = 'map';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';

    const dots = Object.entries(World.MAP_DOTS).map(([id, pos]) => {
      const c = World.getCountry(id);
      return `<circle cx="${pos[0]}" cy="${pos[1]}" r="2.5" fill="var(--gold)" opacity="0.8" class="map-dot" data-country="${id}" style="cursor:pointer"/>
        <text x="${pos[0]}" y="${pos[1] - 3.5}" text-anchor="middle" font-size="3.5" fill="var(--txt)" style="pointer-events:none">${c.flag}</text>`;
    }).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">🌍 Mappa del Mondo</div>
        <div style="font-size:10px;color:var(--dim);margin-bottom:12px">Tocca un paese per vedere le città</div>
        <div style="text-align:center;margin-bottom:12px">
          <svg viewBox="0 0 100 80" style="width:100%;max-width:360px;background:var(--card);border-radius:12px;padding:8px">
            <rect x="0" y="0" width="100" height="80" fill="var(--bg)" rx="4"/>
            <path d="M10,25 Q15,20 25,22 Q30,18 35,20 L38,22 Q42,18 48,22 Q52,20 58,18 Q62,22 68,20 Q75,18 82,22 L85,25 Q88,30 85,35 Q82,40 78,38 Q75,42 72,40 Q68,45 65,42 Q60,45 55,42 Q50,45 45,42 Q40,45 35,42 Q30,45 25,42 Q20,40 15,38 Q10,35 10,25Z" fill="var(--line)" opacity="0.3"/>
            <path d="M55,50 Q60,48 65,50 Q70,52 75,50 Q80,52 85,55 Q82,60 78,62 Q75,65 70,62 Q65,65 60,62 Q55,60 55,50Z" fill="var(--line)" opacity="0.3"/>
            ${dots}
          </svg>
        </div>
        <div id="country-detail"></div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.querySelectorAll('.map-dot').forEach(dot => {
      dot.onclick = () => {
        Sounds.play('click'); Haptic.light();
        showCountryDetail(dot.dataset.country);
      };
    });

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); renderMenu(); };
  }

  function showCountryDetail(countryId) {
    const country = World.getCountry(countryId);
    const cities = World.getCitiesByCountry(countryId);

    const citiesHtml = cities.map(c => {
      const saved = Save.get();
      const isCurrent = saved.city === c.id;
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px;border-radius:8px;background:${isCurrent ? 'var(--gold-light)' : 'var(--card2)'}">
        <span style="font-size:14px">${isCurrent ? '📍' : ''}</span>
        <div style="flex:1"><div style="font-size:12px;font-weight:700">${c.name}</div>
        <div style="font-size:9px;color:var(--dim)">${c.desc}</div></div>
        <div style="font-size:10px;color:var(--dim)">T${c.tier}</div>
      </div>`;
    }).join('');

    $('country-detail').innerHTML = `
      <div style="padding:10px;background:var(--card);border-radius:12px;margin-top:8px">
        <div style="font-size:16px;font-weight:800;margin-bottom:4px">${country.flag} ${country.name}</div>
        <div style="font-size:10px;color:var(--dim);margin-bottom:8px">${country.bonusDesc} · Tasse base: ${country.taxBase}%</div>
        <div style="font-size:12px;font-weight:700;margin-bottom:4px">Città</div>
        <div style="display:flex;flex-direction:column;gap:4px">${citiesHtml}</div>
      </div>`;
  }

  // === SETTINGS ===
  function showSettings() {
    state = Save.get();
    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:12px">⚙️ Impostazioni</div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)">
          <div><div style="font-size:13px;font-weight:700">🔊 Effetti Sonori</div>
          <div style="font-size:10px;color:var(--dim)">Suoni di voto, acquisto, ecc.</div></div>
          <label class="toggle"><input type="checkbox" id="opt-sound" ${state.settings.sound ? 'checked' : ''}><span class="toggle-slider"></span></label>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)">
          <div><div style="font-size:13px;font-weight:700">🌙 Modalità Scura</div>
          <div style="font-size:10px;color:var(--dim)">Tema scuro per gli occhi</div></div>
          <label class="toggle"><input type="checkbox" id="opt-dark" ${state.settings.darkMode ? 'checked' : ''}><span class="toggle-slider"></span></label>
        </div>

        <div style="padding:12px 0;border-bottom:1px solid var(--line)">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">🏆 Obiettivi</div>
          <div style="font-size:11px;color:var(--dim);margin-bottom:6px">${window.Achievements ? Achievements.count() + '/' + Achievements.total() + ' completati (' + Achievements.pct() + '%)' : 'Non disponibili'}</div>
          <button class="btn small ghost" id="btn-show-ach" ${window.Achievements ? '' : 'disabled'}>📋 Vedi tutti</button>
        </div>

        <div style="padding:12px 0;border-bottom:1px solid var(--line)">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">📊 Statistiche</div>
          <div style="font-size:11px;color:var(--dim)">💰 Totale guadagnato: ${fmt(state.totalEarned)}</div>
          <div style="font-size:11px;color:var(--dim)">🗳️ Voti espressi: ${state.votesCast}</div>
          <div style="font-size:11px;color:var(--dim)">🏛️ Elezioni vinte: ${state.electionsWon}</div>
          <div style="font-size:11px;color:var(--dim)">🏙️ Trasferimenti: ${state.moveCount}</div>
          <div style="font-size:11px;color:var(--dim)">📰 Scandali: ${state.scandals}</div>
          <div style="font-size:11px;color:var(--dim)">🎮 Minigiochi vinti: ${state.minigameWins || 0}</div>
        </div>

        <div style="padding:12px 0">
          <button class="btn small ghost" id="btn-reset-tutorial">🔄 Mostra tutorial di nuovo</button>
        </div>

        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.getElementById('opt-sound').onchange = (e) => {
      state.settings.sound = e.target.checked;
      Save.save(state);
      if (window.Sounds) Sounds.setEnabled(e.target.checked);
    };

    document.getElementById('opt-dark').onchange = (e) => {
      state.settings.darkMode = e.target.checked;
      Save.save(state);
      document.body.classList.toggle('dark-mode', e.target.checked);
    };

    const achBtn = document.getElementById('btn-show-ach');
    if (achBtn) achBtn.onclick = () => { Sounds.play('click'); showAchievements(); };

    document.getElementById('btn-reset-tutorial').onclick = () => {
      Onboarding.reset();
      Sounds.play('click');
      Onboarding.start(() => { renderMenu(); });
    };

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); if (currentView === 'city') enterCity(); else renderMenu(); };
  }

  // === ACHIEVEMENTS LIST ===
  function showAchievements() {
    if (!window.Achievements) return;
    const all = Achievements.getAll();
    const html = all.map(a => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid var(--line);${a.unlocked ? '' : 'opacity:0.4'}">
        <div style="font-size:24px">${a.unlocked ? a.icon : '🔒'}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700">${a.title}</div>
          <div style="font-size:10px;color:var(--dim)">${a.desc}</div>
        </div>
        ${a.unlocked ? '<div style="font-size:10px;color:var(--green)">✅</div>' : ''}
      </div>`).join('');

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:4px">🏆 Obiettivi</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">${Achievements.count()}/${Achievements.total()} completati (${Achievements.pct()}%)</div>
        <div style="max-height:65vh;overflow-y:auto">${html}</div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.getElementById('btn-share-ach').onclick = () => { Haptic.tap(); Share.shareProgress(state); };
    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); showSettings(); };
  }

  // === NEWS FEED ===
  function showNewsFeed() {
    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:12px">📰 Novità</div>
        <div style="max-height:65vh;overflow-y:auto">${renderNewsFeed(20)}</div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); if (currentView === 'city') enterCity(); else renderMenu(); };
  }

  // === PRESTIGE ===
  function showPrestige() {
    state = Save.get();
    $('game-area').innerHTML = Prestige.render(state);

    const prestigeBtn = document.getElementById('btn-prestige');
    if (prestigeBtn) prestigeBtn.onclick = () => {
      if (!confirm('Sei sicuro? Perderai soldi, business, casa e influenza. Guadagnerai un moltiplicatore permanente!')) return;
      Haptic.heavy();
      const success = Prestige.doPrestige(state);
      if (success) {
        Save.save(state);
        Sounds.play('levelup');
        addNews('Democrazia Totale! Prestige x' + state.prestigeCount + '!', '📜');
        enterCity();
      }
    };

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === CITY SERVICES ===
  function showCityServices() {
    state = Save.get();
    const city = World.getCity(state.city);

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:8px">🏗️ Servizi Civici</div>
        <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Investi le tasse per migliorare la città</div>
        ${CityServices.render(state, city.tier)}
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    CityServices.SERVICES.forEach(s => {
      const btn = document.getElementById('svc-' + s.id);
      if (btn) btn.onclick = () => {
        if (CityServices.buy(state, s.id)) {
          Sounds.play('levelup'); Haptic.heavy();
          Save.save(state);
          addNews(`Servizio cittadino costruito: ${s.emoji} ${s.name}!`, s.emoji);
          showCityServices();
        }
      };
    });

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === PARTY ===
  function showParty() {
    state = Save.get();
    $('game-area').innerHTML = Party.render(state);

    document.querySelectorAll('[data-party]').forEach(el => {
      el.onclick = () => {
        const partyId = el.dataset.party;
        Haptic.tap();
        if (state.party === partyId) return;
        Party.join(state, partyId);
        Save.save(state);
        Sounds.play('vote');
        const p = Party.get(partyId);
        addNews(`Ti sei unito al ${p.emoji} ${p.name}!`, p.emoji);
        showParty();
      };
    });

    const leaveBtn = document.getElementById('btn-leave-party');
    if (leaveBtn) leaveBtn.onclick = () => {
      Haptic.tap();
      Party.leave(state);
      Save.save(state);
      Sounds.play('click');
      showParty();
    };

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); enterCity(); };
  }

  // === STORE ===
  function showStore() {
    currentView = 'store';
    $('menu-view').style.display = 'none';
    $('game-view').style.display = '';

    $('game-area').innerHTML = `
      <div style="padding:12px">
        <div style="font-size:18px;font-weight:800;margin-bottom:12px">🛒 Negozio</div>
        <div class="store-panel">${Monetization.renderStore()}</div>
        <button class="btn ghost" id="btn-back" style="margin-top:8px;width:100%">← Indietro</button>
      </div>`;

    document.getElementById('btn-back').onclick = () => { Sounds.play('click'); renderMenu(); };
  }

})();
