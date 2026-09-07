// ==== ORTO MAGICO - Idle Garden Game ====
// Plants grow autonomously. Watering is optional (speed boost).
// Auto-harvest and auto-replant keep your garden running.
// Stato persistito su localStorage. Ottimizzato iPhone + GitHub Pages.

const STORAGE_KEY = 'orto-magico-state-v2';

// ── Seed definitions ──
const SEEDS = {
  lettuce:   { id:'lettuce',   name:'Lattuga',      emoji:'🥬', cost:5,   growTime:30,  thirstPerTick:8,  minWater:20, maxWater:100, rewardCoins:15,  rewardGems:1, description:'Cresce veloce, ha sete leggera' },
  carrot:    { id:'carrot',    name:'Carota',       emoji:'🥕', cost:8,   growTime:45,  thirstPerTick:10, minWater:25, maxWater:100, rewardCoins:20,  rewardGems:1, description:'Radice paziente, sete media' },
  strawberry:{ id:'strawberry',name:'Fragola',      emoji:'🍓', cost:15,  growTime:60,  thirstPerTick:12, minWater:30, maxWater:100, rewardCoins:35,  rewardGems:2, description:'Dolce e reddastra, sete media-alta' },
  tomato:    { id:'tomato',    name:'Pomodoro',     emoji:'🍅', cost:15,  growTime:60,  thirstPerTick:11, minWater:30, maxWater:100, rewardCoins:35,  rewardGems:2, description:'Classico estivo, sete media' },
  sunflower: { id:'sunflower', name:'Girasole',     emoji:'🌻', cost:25,  growTime:90,  thirstPerTick:15, minWater:40, maxWater:100, rewardCoins:55,  rewardGems:3, description:'Alta crescita, sete importante' },
  rose:      { id:'rose',      name:'Rosa',         emoji:'🌹', cost:35,  growTime:120, thirstPerTick:18, minWater:50, maxWater:100, rewardCoins:80,  rewardGems:5, description:'Ornamentale, sete alta' },
  mushroom:  { id:'mushroom',  name:'Funghi',       emoji:'🍄', cost:20,  growTime:40,  thirstPerTick:8,  minWater:15, maxWater:80,  rewardCoins:25,  rewardGems:1, description:'Cresce al buio, sete bassa' },
  cactus:    { id:'cactus',    name:'Cactus',       emoji:'🌵', cost:30,  growTime:100, thirstPerTick:3,  minWater:10, maxWater:50,  rewardCoins:60,  rewardGems:3, description:'Bassa manutenzione, sete minima' },
  orchid:    { id:'orchid',    name:'Orchidea',     emoji:'🧡', cost:45,  growTime:150, thirstPerTick:20, minWater:60, maxWater:100, rewardCoins:100, rewardGems:8, description:'Esotica, sete molto alta' },
  pepper:    { id:'pepper',    name:'Peperoncino',  emoji:'🌶️', cost:20,  growTime:50,  thirstPerTick:13, minWater:25, maxWater:100, rewardCoins:45,  rewardGems:2, description:'Piccante, sete media-alta' },
  lettuce2:  { id:'lettuce2',  name:'Lattuga Rossa', emoji:'🥬', cost:10,  growTime:35,  thirstPerTick:9,  minWater:20, maxWater:100, rewardCoins:18,  rewardGems:1, description:'Varietà rossa, crescita media' },
};

// ── Shop upgrades ──
const SHOP = [
  { id:'auto-harvest',  name:'Mietitrice',        emoji:'🤖', desc:'Raccoglie automaticamente quando pronto', cost:200,  costGem:0,  tier:1 },
  { id:'auto-replant',  name:'Seminatrice',       emoji:'🌱', desc:'Ripianta automaticamente dopo la raccolta', cost:400,  costGem:0,  tier:1 },
  { id:'water-rate-1',  name:'Irrigatore Base',   emoji:'💧', desc:'Rifornisce acqua passivamente (+2/s)',     cost:150,  costGem:0,  tier:1 },
  { id:'water-rate-2',  name:'Irrigatore Pro',    emoji:'💦', desc:'Rifornisce acqua passivamente (+5/s)',     cost:600,  costGem:3,  tier:2 },
  { id:'water-full',    name:'Sistema Completo',  emoji:'🚰', desc:'Acqua sempre piena automaticamente',       cost:1500, costGem:10, tier:2 },
  { id:'speed-1',       name:'Fertilizzante',     emoji:'🧪', desc:'Crescita +25% più veloce',                 cost:300,  costGem:0,  tier:1 },
  { id:'speed-2',       name:'Concime Magico',    emoji:'✨', desc:'Crescita +50% più veloce',                 cost:1000, costGem:5,  tier:2 },
  { id:'speed-3',       name:'Elioforo',          emoji:'☀️', desc:'Crescita doppia (x2)',                     cost:3000, costGem:15, tier:3 },
  { id:'offline-1',     name:'Ombra Fresca',      emoji:'⛱️', desc:'Progresso offline fino a 1 ora',           cost:250,  costGem:0,  tier:1 },
  { id:'offline-2',     name:'Cella Frigorifera', emoji:'❄️', desc:'Progresso offline fino a 6 ore',           cost:800,  costGem:5,  tier:2 },
  { id:'offline-3',     name:'Criostasi',         emoji:'🧊', desc:'Progresso offline fino a 24 ore',          cost:2500, costGem:12, tier:3 },
];

// ── Achievements (fixed: removed dead seeds) ──
const ACHIEVEMENTS = [
  { id:'first-sprout',  name:'Primo Germoglio',  desc:'Raccogli la tua prima pianta',       goal:1,    rewardCoins:50,  rewardGems:0,  emoji:'🌱' },
  { id:'green-thumb',   name:'Mani di Terra',    desc:'Pianta 10 semi totali',              goal:10,   rewardCoins:100, rewardGems:1,  emoji:'🌿' },
  { id:'watering-can',  name:'Innaffiatoio Doc', desc:'Annaffia 50 volte',                  goal:50,   rewardCoins:150, rewardGems:2,  emoji:'💧' },
  { id:'auto-harvest',  name:'Mietitore',        desc:'Raccogli 100 piante automaticamente',goal:100,  rewardCoins:300, rewardGems:5,  emoji:'🤖' },
  { id:'latifondista',  name:'Latifondista',     desc:'Possiedi 8 campi',                   goal:8,    rewardCoins:300, rewardGems:8,  emoji:'🏞️' },
  { id:'botanist',      name:'Collezionista',    desc:'Scopri tutte le 11 varietà',         goal:11,   rewardCoins:500, rewardGems:15, emoji:'📚' },
  { id:'idle-master',   name:'Maestro Idle',     desc:'Raccogli 500 piante totali',         goal:500,  rewardCoins:1000,rewardGems:20, emoji:'👑' },
  { id:'coin-hoarder',  name:'Tesoriere',        desc:'Accumula 50.000 monete totali',      goal:50000,rewardCoins:2000,rewardGems:30, emoji:'💰' },
];

// ── Default state ──
const DEFAULT_STATE = {
  coins: 500, gems: 5,
  level: 1, xp: 0, xpNext: 100,
  plots: [],
  nextPlotCost: 30, maxPlots: 12,
  selectedSeed: null,
  collection: {}, collectionKnown: 0, collectionTotal: 0,
  achievements: {},
  upgrades: [],
  totalPlanted: 0, totalHarvests: 0, autoHarvests: 0,
  totalCoinsEarned: 0,
  actionsThisSession: 0,
  lastTick: 0,
};

// ── State ──
let gameState;
try { gameState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { gameState = {}; }
gameState = Object.assign({}, DEFAULT_STATE, gameState);
if (!gameState.collection) gameState.collection = {};
if (!gameState.achievements) gameState.achievements = {};
if (!gameState.upgrades) gameState.upgrades = [];

let gameTickInterval = null;
let gardenSelectOpen = false;

// ── Helpers ──
function fmt(n) { return (n||0).toLocaleString('it-IT'); }
function hasUpgrade(id) { return gameState.upgrades.includes(id); }

// ── Header ──
function renderHeader() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  const pct = gameState.xpNext ? Math.min(100, (gameState.xp / gameState.xpNext) * 100) : 0;
  header.innerHTML = `
    <div class="header">
      <div class="header-left"><span class="header-logo">🌿 Orto Magico</span></div>
      <div class="header-stats">
        <span class="stat" title="Monete">💰 ${fmt(gameState.coins)}</span>
        <span class="stat gems" title="Gemme">💎 ${fmt(gameState.gems)}</span>
        <span class="stat" title="Raccolte">🌾 ${fmt(gameState.totalHarvests)}</span>
      </div>
      <div class="header-level">
        <div class="lvl-badge">Liv. ${fmt(gameState.level)}</div>
        <div class="lvl-bar"><div class="lvl-fill" style="width:${pct}%"></div></div>
      </div>
    </div>
  `;
}

// ── Garden ──
function renderGarden(container) {
  if (!container || !gameState.plots) return;
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'garden-soil';
  container.appendChild(grid);

  // Buy new plot button - always show if there are plots left to unlock
  if (gameState.plots.length < gameState.maxPlots) {
    const canAfford = gameState.coins >= gameState.nextPlotCost;
    const buyBtn = document.createElement('button');
    buyBtn.className = 'plot plot-buy';
    if (!canAfford) buyBtn.style.opacity = '0.5';
    buyBtn.innerHTML = `
      <span class="plot-buy-emoji">${canAfford ? '🌱' : '🔒'}</span>
      <span class="plot-buy-label">Nuovo campo</span>
      <span class="plot-buy-cost">${fmt(gameState.nextPlotCost)} 💰</span>
    `;
    buyBtn.onclick = () => { if (canAfford) buyNewPlot(); else showToast(`Servono ${fmt(gameState.nextPlotCost)}💰 per il prossimo campo`); };
    grid.appendChild(buyBtn);
  }

  gameState.plots.forEach((plot, pIdx) => {
    const seed = plot.seedId ? SEEDS[plot.seedId] : null;
    const isEmpty = !plot.seedId;
    const thirstPct = plot.maxWater ? Math.max(0, Math.min(100, (plot.water / plot.maxWater) * 100)) : 100;
    const isReady = !!seed && plot.progress >= seed.growTime;
    const isThirsty = !!seed && plot.water <= seed.minWater && !isReady;

    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot';

    let actions = '';
    if (isEmpty) {
      actions = `
        <div class="plot-actions">
          <select class="plot-seed-select"
            onchange="plantSeed('${plot.id}', this.value); gardenSelectOpen = false;"
            onfocus="gardenSelectOpen = true;"
            onblur="setTimeout(() => { gardenSelectOpen = false; }, 300);">
            <option value="">Scegli seme...</option>
            ${Object.keys(SEEDS).map(sid => `<option value="${sid}">${SEEDS[sid].emoji} ${SEEDS[sid].name} (${fmt(SEEDS[sid].cost)}💰)</option>`).join('')}
          </select>
        </div>
      `;
    } else if (seed) {
      const pctDone = Math.min(100, (plot.progress / seed.growTime) * 100);
      actions = `
        <div class="plot-actions">
          ${isReady
            ? `<button class="btn-harvest" onclick="harvestPlot(${pIdx})">Raccogli 🌾</button>`
            : `<button onclick="waterPlot(${pIdx})">Annaffia 💧</button>`}
        </div>
      `;
    }

    plotDiv.innerHTML = `
      <div class="plot-emoji ${isReady ? 'plot-ready-glow' : ''}">${seed ? seed.emoji : '🌱'}</div>
      <div class="plot-bars">
        <div class="bar"><div class="bar-fill" style="width:${seed ? Math.min(100, (plot.progress / seed.growTime) * 100) : 0}%"></div></div>
        ${!isEmpty && !isReady ? `<div class="plot-timer">${Math.max(0, Math.ceil(seed.growTime - plot.progress))}s</div>` : ''}
        ${seed ? `<div class="bar bar-water"><div class="bar-fill water-fill" style="width:${thirstPct}%"></div></div>` : ''}
      </div>
      ${isReady ? '<div class="plot-ready-label">Pronto! 🌾</div>' : ''}
      ${isThirsty ? '<div class="plot-thirsty-label">Sete — annaffia per +25% velocità</div>' : ''}
      ${actions}
    `;

    plotDiv.onclick = (e) => {
      if (gardenSelectOpen) return;
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
      if (isEmpty) return;
      if (isReady) harvestPlot(pIdx);
      else waterPlot(pIdx);
    };

    grid.appendChild(plotDiv);
  });
}

// ── Shop ──
function renderShop() {
  const container = document.getElementById('shop-section');
  if (!container) return;

  const grouped = {1:[], 2:[], 3:[]};
  SHOP.forEach(item => { (grouped[item.tier] || grouped[1]).push(item); });

  const tiers = [
    { level:1, name:'Base',   emoji:'🪴' },
    { level:2, name:'Avanzato',emoji:'⚡' },
    { level:3, name:'Premium', emoji:'💎' },
  ];

  container.innerHTML = `
    <p class="panel-hint">Potenzia il tuo giardino. Gli upgrade persistono tra le sessioni.</p>
    <div class="shop-list">
      ${tiers.map(t => {
        const items = grouped[t.level] || [];
        if (!items.length) return '';
        return `
          <div class="shop-tier">
            <div class="shop-tier-title">${t.emoji} ${t.name}</div>
            ${items.map(item => {
              const owned = hasUpgrade(item.id);
              const canAfford = gameState.coins >= item.cost && gameState.gems >= item.costGem;
              return `
                <div class="shop-item ${owned ? 'shop-owned' : ''}">
                  <span class="shop-emoji">${item.emoji}</span>
                  <div class="shop-info">
                    <div class="shop-name">${item.name} ${owned ? '<span class="shop-tag">Posseduto</span>' : ''}</div>
                    <div class="shop-desc">${item.desc}</div>
                    <div class="shop-stats">
                      ${owned ? '' : `${fmt(item.cost)} 💰${item.costGem > 0 ? ` + ${item.costGem} 💎` : ''}`}
                    </div>
                  </div>
                  <div class="shop-buy">
                    ${owned
                      ? '<button disabled>✓</button>'
                      : `<button ${canAfford ? '' : 'disabled'} onclick="buyUpgrade('${item.id}')">Compra</button>`}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── Goals ──
function renderGoals() {
  const container = document.getElementById('goals-section');
  if (!container) return;

  const goalsHtml = ACHIEVEMENTS.map(ach => {
    const claimed = !!(gameState.achievements && gameState.achievements[ach.id]);
    let progress = 0;

    switch (ach.id) {
      case 'first-sprout':  progress = Math.min(1, gameState.totalHarvests || 0); break;
      case 'green-thumb':   progress = gameState.totalPlanted || 0; break;
      case 'watering-can':  progress = gameState.actionsThisSession || 0; break;
      case 'auto-harvest':  progress = gameState.autoHarvests || 0; break;
      case 'latifondista':  progress = gameState.plots.length; break;
      case 'botanist':      progress = Object.keys(gameState.collection || {}).length; break;
      case 'idle-master':   progress = gameState.totalHarvests || 0; break;
      case 'coin-hoarder':  progress = gameState.totalCoinsEarned || 0; break;
    }

    const goal = ach.goal > 0 ? ach.goal : 1;
    const done = progress >= goal;
    const pct = Math.min(100, (progress / goal) * 100);

    return `
      <div class="goal">
        <span class="goal-emoji">${ach.emoji}</span>
        <div class="goal-body">
          <div class="goal-name">${ach.name}</div>
          <div class="goal-desc">${ach.desc}</div>
          <div class="goal-prog">
            <div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div>
            <span class="goal-count">${fmt(progress)}/${fmt(goal)}</span>
          </div>
          <div class="goal-reward">Premio: ${fmt(ach.rewardCoins)} 💰${ach.rewardGems > 0 ? ` + ${fmt(ach.rewardGems)} 💎` : ''}</div>
          ${done && !claimed
            ? `<button class="goal-claim" onclick="claimAchievement('${ach.id}')">Riscuoti!</button>`
            : `<button class="goal-claim" disabled>${claimed ? '✅ Riscosso' : 'In corso'}</button>`}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <p class="panel-hint">Obiettivi a lungo termine. Riscuoti i premi quando completi!</p>
    <div class="goals">${goalsHtml}</div>
  `;
}

// ── Album ──
function renderAlbum() {
  const container = document.getElementById('album-section');
  if (!container) return;
  const collected = Object.keys(gameState.collection || {}).length;
  container.innerHTML = `
    <div class="album-grid">
      ${Object.entries(SEEDS).map(([sid, seed]) => `
        <div class="album-card ${gameState.collection[sid] ? 'album-found' : 'album-locked'}">
          <span class="album-emoji">${seed.emoji}</span>
          <span class="album-name">${seed.name}</span>
          <span class="album-collected">${gameState.collection[sid] ? 'Scoperto' : '🔒'}</span>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;margin-top:10px;font-size:12px;color:var(--fg-soft);">
      Varietà scoperte: ${collected}/${Object.keys(SEEDS).length}
    </div>
  `;
}

// ── Full render ──
function render() {
  renderHeader();
  renderGarden(document.getElementById('garden-section'));
  renderShop();
  renderGoals();
  renderAlbum();
}

// ═══════════════ ACTIONS ═══════════════

function buyNewPlot() {
  if (gameState.coins < gameState.nextPlotCost || gameState.plots.length >= gameState.maxPlots) return;
  gameState.coins -= gameState.nextPlotCost;
  gameState.plots.push({
    id: `plot-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    seedId: null, water: 100, maxWater: 100, progress: 0,
    fertilized: false, harvested: false, plantedAt: null,
  });
  gameState.maxPlots += 1;
  gameState.nextPlotCost = Math.round(30 * Math.pow(1.6, gameState.plots.length));
  saveState(); render();
  showToast('Nuovo campo sbloccato! 🏞️');
}

function plantSeed(plotId, seedId) {
  const plot = gameState.plots.find(p => p.id === plotId);
  if (!plot || !seedId) return;
  const seed = SEEDS[seedId];
  if (!seed) return;
  if (gameState.coins < seed.cost) { showToast('Monete insufficienti!'); return; }

  gameState.coins -= seed.cost;
  plot.seedId = seedId;
  plot.water = plot.maxWater;
  plot.progress = 0;
  plot.harvested = false;
  plot.plantedAt = Date.now();
  gameState.selectedSeed = seedId;
  gameState.totalPlanted = (gameState.totalPlanted || 0) + 1;

  saveState(); render();
  showToast(`Piantato ${seed.name} 🌱`);
}

function waterPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot || !plot.seedId || plot.harvested) return;
  plot.water = Math.min(plot.maxWater, plot.water + 30);
  gameState.actionsThisSession = (gameState.actionsThisSession || 0) + 1;
  saveState(); render();
}

function harvestPlot(plotIdx, isAuto) {
  const plot = gameState.plots[plotIdx];
  if (!plot || !plot.seedId || plot.harvested) return;
  const seed = SEEDS[plot.seedId];
  if (!seed) return;
  if (plot.progress < seed.growTime) return;

  const harvestedSeedId = plot.seedId;

  // Rewards
  gameState.coins += seed.rewardCoins;
  gameState.totalCoinsEarned = (gameState.totalCoinsEarned || 0) + seed.rewardCoins;
  if (seed.rewardGems > 0 && Math.random() > 0.5) {
    gameState.gems += seed.rewardGems;
  }
  gameState.totalHarvests = (gameState.totalHarvests || 0) + 1;
  if (isAuto) gameState.autoHarvests = (gameState.autoHarvests || 0) + 1;

  // Collection
  if (!gameState.collection[harvestedSeedId]) {
    gameState.collection[harvestedSeedId] = true;
    gameState.collectionKnown = Object.keys(gameState.collection).length;
    if (gameState.collectionKnown > gameState.collectionTotal) {
      gameState.collectionTotal = gameState.collectionKnown;
    }
  }

  // XP
  gameState.xp += 10;
  while (gameState.xp >= gameState.xpNext) {
    gameState.xp -= gameState.xpNext;
    gameState.level += 1;
    gameState.xpNext = Math.round(100 * Math.pow(1.5, gameState.level));
  }

  // Auto-replant if upgrade owned
  if (hasUpgrade('auto-replant') && gameState.coins >= seed.cost) {
    gameState.coins -= seed.cost;
    plot.seedId = harvestedSeedId;
    plot.progress = 0;
    plot.water = plot.maxWater;
    plot.harvested = false;
    plot.plantedAt = Date.now();
    gameState.totalPlanted = (gameState.totalPlanted || 0) + 1;
  } else {
    plot.seedId = null;
    plot.harvested = false;
    plot.progress = 0;
    plot.water = plot.maxWater;
    plot.plantedAt = null;
  }

  saveState();
  if (!isAuto) { render(); showToast(`Raccolto ${seed.name}! +${fmt(seed.rewardCoins)}💰`); }
}

function clearPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot) return;
  plot.seedId = null; plot.progress = 0; plot.water = plot.maxWater;
  plot.harvested = false; plot.plantedAt = null;
  saveState(); render();
}

function buyUpgrade(upgradeId) {
  const item = SHOP.find(i => i.id === upgradeId);
  if (!item || hasUpgrade(upgradeId)) return;
  if (gameState.coins < item.cost || gameState.gems < item.costGem) return;

  gameState.coins -= item.cost;
  gameState.gems -= item.costGem;
  gameState.upgrades.push(upgradeId);

  saveState(); render();
  showToast(`${item.name} acquistato! ${item.emoji}`);
}

function claimAchievement(achId) {
  const ach = ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach || (gameState.achievements && gameState.achievements[achId])) return;
  gameState.coins += ach.rewardCoins;
  gameState.gems += ach.rewardGems;
  gameState.achievements[achId] = true;
  saveState(); render();
  showToast(`Premio: ${fmt(ach.rewardCoins)}💰 + ${fmt(ach.rewardGems)}💎!`);
}

// ── Toast ──
let toastTimer = null;
function showToast(msg) {
  const container = document.getElementById('toasts');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
}

// ═══════════════ GAME LOOP ═══════════════

function startGameLoop() {
  if (gameTickInterval) clearInterval(gameTickInterval);

  gameTickInterval = setInterval(() => {
    if (!gameState || !gameState.plots) return;

    const now = Date.now();
    const rawDelta = now - (gameState.lastTick || now);
    gameState.lastTick = now;

    // Offline cap based on upgrades
    let maxDelta = 60000; // default 60s
    if (hasUpgrade('offline-3'))      maxDelta = 86400000; // 24h
    else if (hasUpgrade('offline-2')) maxDelta = 21600000; // 6h
    else if (hasUpgrade('offline-1')) maxDelta = 3600000;  // 1h
    const delta = Math.min(maxDelta, rawDelta);

    // Speed multiplier from upgrades
    let speedMul = 1;
    if (hasUpgrade('speed-3'))      speedMul = 2;
    else if (hasUpgrade('speed-2')) speedMul = 1.5;
    else if (hasUpgrade('speed-1')) speedMul = 1.25;

    // Water passive rate from upgrades
    let waterPassive = 0.2; // default negligible
    if (hasUpgrade('water-full'))      waterPassive = 999; // instant full
    else if (hasUpgrade('water-rate-2')) waterPassive = 5;
    else if (hasUpgrade('water-rate-1')) waterPassive = 2;

    // Per-plot processing
    gameState.plots.forEach((plot, pIdx) => {
      if (!plot.seedId || plot.harvested) return;
      const seed = SEEDS[plot.seedId];
      if (!seed) return;

      // Water drain
      plot.water = Math.max(0, plot.water - seed.thirstPerTick * (delta / 1000));

      // Water passive regen
      if (hasUpgrade('water-full')) {
        plot.water = plot.maxWater;
      } else {
        plot.water = Math.min(plot.maxWater, plot.water + waterPassive * (delta / 1000));
      }

      // Growth: base + water bonus (+25% if water > minWater)
      const waterBonus = plot.water > seed.minWater ? 1.25 : 1;
      const growRate = speedMul * waterBonus; // 1.0 base = 1 progress/sec = growTime seconds total
      plot.progress = Math.min(seed.growTime, plot.progress + growRate * (delta / 1000));

      // Auto-harvest when ready
      if (hasUpgrade('auto-harvest') && plot.progress >= seed.growTime) {
        harvestPlot(pIdx, true);
      }
    });

    // Passive XP
    if (gameState.xp < gameState.xpNext) {
      gameState.xp += 1;
      if (gameState.xp >= gameState.xpNext) {
        gameState.xp -= gameState.xpNext;
        gameState.level += 1;
        gameState.xpNext = Math.round(100 * Math.pow(1.5, gameState.level));
        showToast('Livello up! Livello ' + gameState.level + ' 🎉');
      }
    }

    saveState();
    if (!gardenSelectOpen) {
      render();
    } else {
      renderHeader();
    }
  }, 1000);
}

// ── Save ──
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState)); } catch(e) {}
}

// ── Welcome back (offline earnings) ──
function showWelcomeBack() {
  if (!gameState.lastTick) return;
  const elapsed = Date.now() - gameState.lastTick;
  if (elapsed < 10000) return; // less than 10s, skip

  let maxDelta = 60000;
  if (hasUpgrade('offline-3'))      maxDelta = 86400000;
  else if (hasUpgrade('offline-2')) maxDelta = 21600000;
  else if (hasUpgrade('offline-1')) maxDelta = 3600000;

  const simMs = Math.min(maxDelta, elapsed);
  const mins = Math.floor(simMs / 60000);
  if (mins < 1) return;

  let earnings = 0;
  gameState.plots.forEach(plot => {
    if (!plot.seedId) return;
    const seed = SEEDS[plot.seedId];
    if (!seed) return;
    const cycles = Math.floor(simMs / (seed.growTime * 1000));
    earnings += cycles * seed.rewardCoins;
  });

  if (earnings > 0) {
    setTimeout(() => showToast(`Bentornato! Hai guadagnato ${fmt(earnings)}💰 in ${mins}min offline`), 500);
  }
}

// ── Init ──
function init() {
  const app = document.getElementById('app');
  if (app) {
    app.style.display = 'block';
    app.innerHTML = `
      <div id="garden-section" class="garden"></div>
      <div id="shop-section" class="panel"></div>
      <div id="goals-section" class="panel"></div>
      <div id="album-section" class="panel"></div>
      <div id="toasts" class="toasts"></div>
    `;
  }

  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
  const error = document.getElementById('error');
  if (error) error.style.display = 'none';

  showWelcomeBack();
  render();
  startGameLoop();
}

init();
