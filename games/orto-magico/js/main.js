// ==== ORTO MAGICO - Gioco Giardinaggio Statico ====
// Tutto il gioco funziona in frontend, nessun backend richiesto.
// Stato persistito su localStorage. Ottimizzato iPhone + GitHub Pages.
//
// NOTE: il gioco costruisce da solo le sue sezioni dentro #app, quindi
// index.html resta uno shell minimale (loader + contenitore).

const STORAGE_KEY = 'orto-magico-state-v1';

// Seed definitions (11 varietà disponibili)
const SEEDS = {
  lettuce: {
    id: 'lettuce',
    name: 'Lattuga',
    emoji: '🥬',
    cost: 5,
    growTime: 30, // secondi
    thirstPerTick: 8,
    minWater: 20,
    maxWater: 100,
    rewardCoins: 15,
    rewardGems: 1,
    description: 'Cresce veloce, ha sete leggera'
  },
  carrot: {
    id: 'carrot',
    name: 'Carota',
    emoji: '🥕',
    cost: 8,
    growTime: 45,
    thirstPerTick: 10,
    minWater: 25,
    maxWater: 100,
    rewardCoins: 20,
    rewardGems: 1,
    description: 'Radice paziente, sete media'
  },
  strawberry: {
    id: 'strawberry',
    name: 'Fragola',
    emoji: '🍓',
    cost: 15,
    growTime: 60,
    thirstPerTick: 12,
    minWater: 30,
    maxWater: 100,
    rewardCoins: 35,
    rewardGems: 2,
    description: 'Dolce e reddastra, sete media-alta'
  },
  tomato: {
    id: 'tomato',
    name: 'Pomodoro',
    emoji: '🍅',
    cost: 15,
    growTime: 60,
    thirstPerTick: 11,
    minWater: 30,
    maxWater: 100,
    rewardCoins: 35,
    rewardGems: 2,
    description: 'Classico estivo, sete media'
  },
  sunflower: {
    id: 'sunflower',
    name: 'Girasole',
    emoji: '🌻',
    cost: 25,
    growTime: 90,
    thirstPerTick: 15,
    minWater: 40,
    maxWater: 100,
    rewardCoins: 55,
    rewardGems: 3,
    description: 'Alta crescita, sete importante'
  },
  rose: {
    id: 'rose',
    name: 'Rosa',
    emoji: '🌹',
    cost: 35,
    growTime: 120,
    thirstPerTick: 18,
    minWater: 50,
    maxWater: 100,
    rewardCoins: 80,
    rewardGems: 5,
    description: 'Ornamentale, sete alta'
  },
  mushroom: {
    id: 'mushroom',
    name: 'Funghi',
    emoji: '🍄',
    cost: 20,
    growTime: 40,
    thirstPerTick: 8,
    minWater: 15,
    maxWater: 80,
    rewardCoins: 25,
    rewardGems: 1,
    description: 'Cresce al buio, sete bassa'
  },
  cactus: {
    id: 'cactus',
    name: 'Cactus',
    emoji: '🌵',
    cost: 30,
    growTime: 100,
    thirstPerTick: 3,
    minWater: 10,
    maxWater: 50,
    rewardCoins: 60,
    rewardGems: 3,
    description: 'Bassa manutenzione, sete minima'
  },
  orchid: {
    id: 'orchid',
    name: 'Orchidea',
    emoji: '🧡',
    cost: 45,
    growTime: 150,
    thirstPerTick: 20,
    minWater: 60,
    maxWater: 100,
    rewardCoins: 100,
    rewardGems: 8,
    description: 'Esotica, sete molto alta'
  },
  pepper: {
    id: 'pepper',
    name: 'Peperoncino',
    emoji: '🌶️',
    cost: 20,
    growTime: 50,
    thirstPerTick: 13,
    minWater: 25,
    maxWater: 100,
    rewardCoins: 45,
    rewardGems: 2,
    description: 'Piccante, sete media-alta'
  },
  lettuce2: {  // varietà 2
    id: 'lettuce2',
    name: 'Lattuga Rossa',
    emoji: '🥬',
    cost: 10,
    growTime: 35,
    thirstPerTick: 9,
    minWater: 20,
    maxWater: 100,
    rewardCoins: 18,
    rewardGems: 1,
    description: 'Varietà rossa, crescita media'
  }
};

// 8 Achievements
const ACHIEVEMENTS = [
  { id: 'first-sprout', name: 'Primo Germoglio', desc: 'Raccogli la tua prima carota', goal: 1, rewardCoins: 50, rewardGems: 0, final: false, emoji: '🥕' },
  { id: 'green-thumb', name: 'Mani di Terra', desc: 'Pianta 10 semi totali', goal: 10, rewardCoins: 100, rewardGems: 1, final: false, emoji: '🌱' },
  { id: 'watering-can', name: 'Innaffiatoio Doc', desc: 'Annaffia 50 volte', goal: 50, rewardCoins: 150, rewardGems: 2, final: false, emoji: '💧' },
  { id: 'pumpkin-mania', name: 'Zucca-mania', desc: 'Raccogli 5 Zucche di Halloween', goal: 5, rewardCoins: 200, rewardGems: 3, final: false, emoji: '🎃' },
  { id: 'christmas', name: 'Bianco Natale', desc: 'Cresci 3 Alberi di Natale', goal: 3, rewardCoins: 250, rewardGems: 5, final: false, emoji: '🎄' },
  { id: 'latifondista', name: 'Latifondista', desc: 'Possiedi 8 campi', goal: 8, rewardCoins: 300, rewardGems: 8, final: false, emoji: '🏞️' },
  { id: 'botanist', name: 'Collezionista Botanico', desc: 'Scopri 8 varietà di semi', goal: 8, rewardCoins: 350, rewardGems: 10, final: false, emoji: '📚' },
  { id: 'hero-gardener', name: 'Giardiniere Eroico', desc: 'Cresci la leggendaria Rosa Arcobaleno (7 giorni)', goal: -1, rewardCoins: 500, rewardGems: 15, final: true, emoji: '👑' }
];

// Stato iniziale
const DEFAULT_STATE = {
  coins: 500,
  gems: 5,
  level: 1,
  xp: 0,
  xpNext: 100,
  plots: [],  // array di appezzamenti
  nextPlotCost: 30,
  maxPlots: 2,
  selectedSeed: null,
  collection: {},
  collectionKnown: 0,
  collectionTotal: 0,
  achievements: {},
  totalPlanted: 0,
  totalHarvests: 0,
  actionsThisSession: 0,
  lastTick: 0
};

// Emoji per seme (display)
const SEED_EMOJIS = {
  lettuce: '🥬', carrot: '🥕', strawberry: '🍓', tomato: '🍅',
  sunflower: '🌻', rose: '🌹', mushroom: '🍄', cactus: '🌵',
  orchid: '🧡', pepper: '🌶️', lettuce2: '🥬'
};

// Inizializza stato da localStorage (con migrazione sicura)
let gameState;
try {
  gameState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
} catch (e) {
  gameState = {};
}
gameState = Object.assign({}, DEFAULT_STATE, gameState);
if (!gameState.collection) gameState.collection = {};
if (!gameState.achievements) gameState.achievements = {};

let gameTickInterval = null;

// Helper: formatta numero con locale italiano
function fmt(n) { return (n || 0).toLocaleString('it-IT'); }

// Helper: elemento casuale da array
function randElem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ---- Header ----
function renderHeader() {
  const header = document.querySelector('.app-header');
  if (!header) return;

  const pct = gameState.xpNext ? Math.min(100, (gameState.xp / gameState.xpNext) * 100) : 0;
  header.innerHTML = `
    <div class="header">
      <div class="header-left">
        <span class="header-logo">🌿 Orto Magico</span>
      </div>
      <div class="header-stats">
        <span class="stat" title="Monete">💰 ${fmt(gameState.coins)}</span>
        <span class="stat gems" title="Gemme">💎 ${fmt(gameState.gems)}</span>
        <span class="stat" title="Album">📚 ${fmt(gameState.collectionKnown)}/${fmt(gameState.collectionTotal)}</span>
      </div>
      <div class="header-level">
        <div class="lvl-badge">Liv. ${fmt(gameState.level)}</div>
        <div class="lvl-bar"><div class="lvl-fill" style="width:${pct}%"></div></div>
      </div>
    </div>
  `;
}

// ---- Giardino ----
function renderGarden(container) {
  if (!container || !gameState.plots) return;

  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'garden-soil';
  container.appendChild(grid);

  // Bottone per comprare un nuovo campo
  if (gameState.coins >= gameState.nextPlotCost && gameState.plots.length < gameState.maxPlots) {
    const buyBtn = document.createElement('button');
    buyBtn.className = 'plot plot-buy';
    buyBtn.innerHTML = `
      <span class="plot-buy-emoji">🌱</span>
      <span class="plot-buy-label">Nuovo campo</span>
      <span class="plot-buy-cost">${fmt(gameState.nextPlotCost)} 💰</span>
    `;
    buyBtn.onclick = () => buyNewPlot();
    grid.appendChild(buyBtn);
  }

  // Ogni appezzamento
  gameState.plots.forEach((plot, pIdx) => {
    const seed = plot.seedId ? SEEDS[plot.seedId] : null;
    const isEmpty = !plot.seedId;
    const thirstPct = plot.maxWater ? Math.max(0, Math.min(100, (plot.water / plot.maxWater) * 100)) : 100;
    const isReady = !!seed && plot.progress >= seed.growTime && plot.water > 0;
    const isThirsty = !!seed && plot.water <= seed.minWater;

    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot' + (plot.fertilized ? ' f-fertilized' : '');

    // Azioni
    let actions = '';
    if (isEmpty) {
      actions = `
        <div class="plot-actions">
          <select class="plot-seed-select" onchange="plantSeed('${plot.id}', this.value)">
            <option value="">Scegli seme...</option>
            ${Object.keys(SEEDS).map(sid => `<option value="${sid}">${SEEDS[sid].emoji} ${SEEDS[sid].name} (${fmt(SEEDS[sid].cost)}💰)</option>`).join('')}
          </select>
        </div>
      `;
    } else if (seed) {
      actions = `
        <div class="plot-actions">
          ${isReady
            ? `<button class="btn-harvest" onclick="harvestPlot(${pIdx})">Raccogli</button>`
            : `<button onclick="waterPlot(${pIdx})">Annaffia 💧</button>`}
          <button class="btn-clear" onclick="clearPlot(${pIdx})">X</button>
        </div>
      `;
    }

    plotDiv.innerHTML = `
      <div class="plot-emoji ${isReady ? 'plot-ready-glow' : ''}">${seed ? seed.emoji : '🌱'}</div>
      <div class="plot-bars">
        <div class="bar"><div class="bar-fill" style="width:${thirstPct}%"></div></div>
        ${seed ? `<div class="plot-timer">${Math.max(0, Math.ceil(seed.growTime - plot.progress))}s</div>` : ''}
      </div>
      ${isReady ? '<div class="plot-ready-label">Pronto!</div>' : ''}
      ${isThirsty && !isReady ? '<div class="plot-thirsty-label">Sete! Annaffia</div>' : ''}
      ${actions}
    `;

    // Click sull'appezzamento (ignora click su bottoni/select)
    plotDiv.onclick = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION') return;
      if (isEmpty) return;
      if (isReady) harvestPlot(pIdx);
      else if (isThirsty || plot.water < plot.maxWater) waterPlot(pIdx);
    };

    grid.appendChild(plotDiv);
  });
}

// ---- Obiettivi ----
function renderGoals() {
  const container = document.getElementById('goals-section');
  if (!container) return;

  const goalsHtml = ACHIEVEMENTS.map(ach => {
    const claimed = !!(gameState.achievements && gameState.achievements[ach.id]);
    const goal = ach.goal > 0 ? ach.goal : 1;
    let progress = 0;

    switch (ach.id) {
      case 'first-sprout': progress = Math.min(1, gameState.totalHarvests || 0); break;
      case 'green-thumb': progress = gameState.totalPlanted || 0; break;
      case 'watering-can': progress = gameState.actionsThisSession || 0; break;
      case 'pumpkin-mania': progress = gameState.plots.filter(p => p.seedId === 'pumpkin').length; break;
      case 'christmas': progress = gameState.plots.filter(p => p.seedId === 'christmas-tree').length; break;
      case 'latifondista': progress = Math.min(goal, gameState.maxPlots); break;
      case 'botanist': progress = Object.keys(gameState.collection || {}).length; break;
      case 'hero-gardener': {
        const rainbowRose = gameState.plots.find(p => p.seedId === 'rainbow-rose');
        progress = (rainbowRose && rainbowRose.plantedAt && (Date.now() - rainbowRose.plantedAt) >= 7 * 24 * 60 * 60 * 1000) ? 1 : 0;
        break;
      }
    }

    const done = progress >= goal;
    const pct = Math.min(100, (progress / goal) * 100);

    return `
      <div class="goal ${ach.final ? 'goal-final' : ''}">
        <span class="goal-emoji">${ach.emoji}</span>
        <div class="goal-body">
          <div class="goal-name">${ach.name} ${ach.final ? '<span class="final-tag">FINALE</span>' : ''}</div>
          <div class="goal-desc">${ach.desc}</div>
          <div class="goal-prog">
            <div class="goal-bar"><div class="goal-fill" style="width:${pct}%"></div></div>
            <span class="goal-count">${fmt(progress)}/${fmt(goal)}</span>
          </div>
          <div class="goal-reward">Premio: ${fmt(ach.rewardCoins)} 💰${ach.rewardGems > 0 ? ` + ${fmt(ach.rewardGems)} 💎` : ''}</div>
          ${done && !claimed
            ? `<button class="goal-claim" onclick="claimAchievement('${ach.id}')">Riscuoti!</button>`
            : `<button class="goal-claim" disabled>${claimed ? 'Riscosso' : 'In corso'}</button>`}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <p class="panel-hint">Obiettivi a lungo termine. Riscuoti i premi quando completi!</p>
    <div class="goals">${goalsHtml}</div>
  `;
}

// ---- Album ----
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
          <span class="album-collected">${gameState.collection[sid] ? 'Scoperto' : 'Bloccato'}</span>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;margin-top:10px;">
      <span>Varietà scoperte: ${collected}/${Object.keys(SEEDS).length}</span>
    </div>
  `;
}

// Render completo
function render() {
  renderHeader();
  renderGarden(document.getElementById('garden-section'));
  renderGoals();
  renderAlbum();
}

// ---- Azioni di gioco ----

// Compra un nuovo appezzamento
function buyNewPlot() {
  if (gameState.coins < gameState.nextPlotCost || gameState.plots.length >= gameState.maxPlots) return;

  gameState.coins -= gameState.nextPlotCost;
  gameState.plots.push({
    id: `plot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    seedId: null,
    water: 100,
    maxWater: 100,
    progress: 0,
    fertilized: false,
    harvested: false,
    plantedAt: null
  });

  // Ogni 2 campi aumenta il limite e il costo
  if (gameState.plots.length % 2 === 0) {
    gameState.maxPlots += 1;
    gameState.nextPlotCost = Math.round(30 * Math.pow(1.5, Math.floor(gameState.plots.length / 2)));
  }

  saveState();
  render();
  showToast('Nuovo campo sbloccato!');
}

// Pianta un seme in un appezzamento vuoto
function plantSeed(plotId, seedId) {
  const plot = gameState.plots.find(p => p.id === plotId);
  if (!plot || !seedId) return;
  const seed = SEEDS[seedId];
  if (!seed) return;

  if (gameState.coins < seed.cost) {
    showToast('Monete insufficienti!');
    return;
  }

  gameState.coins -= seed.cost;
  plot.seedId = seedId;
  plot.water = plot.maxWater;
  plot.progress = 0;
  plot.harvested = false;
  plot.plantedAt = Date.now();
  gameState.selectedSeed = seedId;
  gameState.totalPlanted = (gameState.totalPlanted || 0) + 1;

  saveState();
  render();
  showToast(`Piantato ${seed.name} 🌱`);
}

// Annaffia (aumenta l'acqua dell'appezzamento)
function waterPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot || !plot.seedId || plot.harvested) return;
  const seed = SEEDS[plot.seedId];
  if (!seed) return;

  plot.water = Math.min(plot.maxWater, plot.water + 30);
  gameState.actionsThisSession = (gameState.actionsThisSession || 0) + 1;

  saveState();
  render();
  showToast('Pianta annaffiata 💧');
}

// Raccogli (sblocca ricompense e libera il campo)
function harvestPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot || !plot.seedId || plot.harvested) return;
  const seed = SEEDS[plot.seedId];
  if (!seed) return;

  const harvestedSeedId = plot.seedId;

  // Ricompense
  gameState.coins += seed.rewardCoins;
  if (seed.rewardGems > 0 && Math.random() > 0.5) {
    gameState.gems += seed.rewardGems;
  }
  gameState.totalHarvests = (gameState.totalHarvests || 0) + 1;

  // Collezione (nuova varietà)
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

  // Libera il campo per ripiantare
  plot.seedId = null;
  plot.harvested = false;
  plot.progress = 0;
  plot.water = plot.maxWater;
  plot.plantedAt = null;

  saveState();
  render();
  showToast(`Raccolto ${seed.name}! +${fmt(seed.rewardCoins)} monete`);
}

// Rimuovi la pianta da un campo
function clearPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot) return;
  plot.seedId = null;
  plot.progress = 0;
  plot.water = plot.maxWater;
  plot.harvested = false;
  plot.plantedAt = null;
  saveState();
  render();
}

// Riscuoti un obiettivo completato
function claimAchievement(achId) {
  const ach = ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach || (gameState.achievements && gameState.achievements[achId])) return;

  gameState.coins += ach.rewardCoins;
  gameState.gems += ach.rewardGems;
  gameState.achievements[achId] = true;

  saveState();
  render();
  showToast(`Premio riscosso: ${fmt(ach.rewardCoins)} monete + ${fmt(ach.rewardGems)} gemme!`);
}

// ---- Toast ----
function showToast(msg) {
  const container = document.getElementById('toasts');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ---- Game loop (crescita a tick) ----
function startGameLoop() {
  if (gameTickInterval) clearInterval(gameTickInterval);

  gameTickInterval = setInterval(() => {
    if (!gameState || !gameState.plots) return;

    const now = Date.now();
    const delta = Math.min(60000, now - (gameState.lastTick || now));
    gameState.lastTick = now;

    // Crescita + sete per ogni campo
    gameState.plots.forEach(plot => {
      if (!plot.seedId || plot.harvested) return;
      const seed = SEEDS[plot.seedId];
      if (!seed) return;

      // L'acqua scende nel tempo
      plot.water = Math.max(0, plot.water - seed.thirstPerTick * (delta / 1000));
      // Crescita
      plot.progress = Math.min(seed.growTime, plot.progress + (seed.growTime / 100) * (delta / 1000));
      // Piccolo rifornimento passivo
      plot.water = Math.min(plot.maxWater, plot.water + 0.2 * (delta / 1000));
    });

    // XP passiva
    if (gameState.xp < gameState.xpNext) {
      gameState.xp += 1;
      if (gameState.xp >= gameState.xpNext) {
        gameState.xp -= gameState.xpNext;
        gameState.level += 1;
        gameState.xpNext = Math.round(100 * Math.pow(1.5, gameState.level));
        showToast('Livello up! Sei ora al Livello ' + gameState.level);
      }
    }

    saveState();
    render();
  }, 1000); // tick ogni secondo
}

// ---- Salvataggio ----
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('Salvataggio fallito', e);
  }
}

// ---- Avvio ----
function init() {
  const app = document.getElementById('app');
  if (app) {
    app.style.display = 'block';
    // Costruisce le sezioni una sola volta; render() ne aggiorna solo il contenuto
    app.innerHTML = `
      <div id="garden-section" class="garden"></div>
      <div id="goals-section" class="panel"></div>
      <div id="album-section" class="panel"></div>
      <div id="toasts" class="toasts"></div>
    `;
  }

  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';

  const error = document.getElementById('error');
  if (error) error.style.display = 'none';

  render();
  startGameLoop();
}

init();
