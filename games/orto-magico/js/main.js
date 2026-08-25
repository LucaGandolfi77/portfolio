// ==== ORTO MAGICO - Gioco Giardinaggio Statico ====
// Tutto il gioco funziona in frontend, nessun backend richiesto.
// Stato persistito su localStorage. Ottimizzato iPhone + GitHub Pages.

const STORAGE_KEY = 'orto-magico-state-v1';

// Seed definitions (12 varieties, matching original)
const SEEDS = {
  lettuce: {
    id: 'lettuce',
    name: 'Lattuga',
    emoji: '🥬',
    cost: 5,
    growTime: 30, // secondi (original: 3 ticks = ~9s ma rallentato per giocabilità)
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
  lettuce2: {  // variety 2
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

// 8 Achievements (matching original)
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

// Initial state
const DEFAULT_STATE = {
  coins: 500,
  gems: 5,
  level: 1,
  xp: 0,
  xpNext: 100,
  plots: [],  // array of plot objects
  nextPlotCost: 30,
  maxPlots: 2,
  selectedSeed: null,
  collectionKnown: 0,
  collectionTotal: 0,
  actionsThisSession: 0,
  lastTick: 0,
  timerInterval: null
};

// Seed emoji mapping for display
const SEED_EMOJIS = {
  lettuce: '🥬', carrot: '🥕', strawberry: '🍓', tomato: '🍅',
  sunflower: '🌻', rose: '🌹', mushroom: '🍄', cactus: '🌵',
  orchid: '🧡', pepper: '🌶️', lettuce2: '🥬'
};

// Initialize state from localStorage or default
let gameState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { ...DEFAULT_STATE };
let gameTickInterval = null;

// Helper: format number with Italian locale
function fmt(n) { return n.toLocaleString('it-IT'); }

// Helper: random element from array
function randElem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Render all UI
function render() {
  const app = document.getElementById('app');
  if (!gameState) { app.innerHTML = '<div class="loading">Errore stato gioco</div>'; return; }

  // Update header
  const pct = gameState.xp_next ? Math.min(100, (gameState.xp / gameState.xpNext) * 100) : 0;
  const header = document.querySelector('.app-header');
  if (header) {
    header.innerHTML = `
      <div class="header">
        <div class="header-left">
          <span class="header-logo">Orto Magico</span>
        </div>
        <div class="header-stats">
          <span class="stat" title="Monete">💰 ${fmt(gameState.coins)}</span>
          <span class="stat gems" title="Gemme">💎 ${fmt(gameState.gems)}</span>
          <span class="stat" title="Album">📚 ${fmt(gameState.collectionKnown)}/${fmt(gameState.collectionTotal)}</span>
        </div>
        <div class="header-level">
          <div class="lvl-badge">Liv. ${fmt(gameState.level)}</div>
          <div class="lvl-bar"><div class="lvl-fill" style="width: ${pct}%"></div></div>
        </div>
      </div>
    `;
  }

  // Main content based on tab
  const tab = document.getElementById('tab-seeds') ? 'seeds' : 'garden';  // simplified
  const garden = document.getElementById('garden-section');
  if (garden) {
    renderGarden(garden);
  }

  // Render goals
  renderGoals();

  // Render album
  renderAlbum();
}

// Render garden plots
function renderGarden(container) {
  if (!container || !gameState.plots) return;
  
  container.innerHTML = '';
  
  // Plot buy button
  if (gameState.coins >= gameState.nextPlotCost && gameState.plots.length < gameState.maxPlots) {
    const buyBtn = document.createElement('button');
    buyBtn.className = 'plot plot-buy';
    buyBtn.innerHTML = `
      <span class="plot-buy-emoji">🌱</span>
      <span class="plot-buy-label">Nuovo campo</span>
      <span class="plot-buy-cost">${fmt(gameState.nextPlotCost)} 💰</span>
    `;
    buyBtn.onclick = () => buyNewPlot();
    container.appendChild(buyBtn);
  }

  // Render each plot
  gameState.plots.forEach((plot, pIdx) => {
    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot';
    
    // Fertilized class
    if (plot.fertilized) plotDiv.classList.add('f-fertilized');
    
    const thirstPct = plot.water / plot.maxWater * 100;
    const isReady = plot.progress >= (plot.fertilized ? gameState.selectedSeed?.growTime / 2 : gameState.selectedSeed?.growTime) && plot.water > 0;
    const isEmpty = plot.seedId === null;
    const isThirsty = plot.water <= plot.minWater;
    
    // Action buttons
    let actions = '';
    if (!isEmpty && !plot.harvested) {
      actions = `
        <div class="plot-actions">
          ${!plot.fertilized ? '<button class="btn-harvest" title="Raccogli senza fertilizzante">Raccogli</button>' : ''}
          <button class="btn-clear" title="Rimuovi pianta">X</button>
        </div>
      `;
    } else if (isEmpty) {
      actions = `
        <div class="plot-actions">
          <select onchange="selectSeed('${plot.id}')">
            <option value="">Seleziona seme</option>
            ${Object.keys(SEEDS).map(sid => `<option value="${sid}" ${gameState.selectedSeed === sid ? 'selected' : ''}>${SEEDS[sid].emoji} ${SEEDS[sid].name} (${fmt(SEEDS[sid].cost)} 💰)</option>`).join('')}
          </select>
        </div>
      `;
    } else if (isReady) {
      actions = `
        <div class="plot-actions">
          <button class="btn-harvest" onclick="harvestPlot(${pIdx})">Raccogli</button>
        </div>
      `;
    } else if (isThirsty) {
      actions = `
        <div class="plot-actions">
          <button onclick="waterPlot(${pIdx})">Annaffia</button>
        </div>
      `;
    }

    plotDiv.innerHTML = `
      <div class="plot-emoji">${SEED_EMOJIS[plot.seedId] || '🌱'}</div>
      <div class="plot-bars">
        <div class="bar"><div class="bar-fill" style="width: ${thirstPct}%"></div></div>
        ${thirstPct < 30 ? '<div class="plot-thirsty-label">Sete!</div>' : ''}
        ${isReady ? '<div class="plot-ready-label">Pronto!</div>' : ''}
        ${isThirsty ? '<div class="plot-thirsty-label">Troppo poca acqua</div>' : ''}
      </div>
      ${isReady ? '<div class="plot-ready-label">Raccolta disponibile</div>' : ''}
      ${actions}
    `;
    
    // Click handlers
    plotDiv.onclick = (e) => {
      if (isEmpty) return;  // select seed instead
      if (isReady) harvestPlot(pIdx);
      if (isThirsty) waterPlot(pIdx);
    };
    
    container.appendChild(plotDiv);
  });
}

// Render goals
function renderGoals() {
  const container = document.getElementById('goals-section');
  if (!container) return;
  
  container.innerHTML = `
    <div class="goals">
      <p class="panel-hint">Obiettivi a lungo termine. Riscuoti i premi quando completi!</p>
    `;
  
  ACHIEVEMENTS.forEach(ach => {
    let progress = 0;
    let done = false;
    
    switch (ach.id) {
      case 'first-sprout': progress = gameState.plots.some(p => p.harvested) ? 1 : 0; done = progress >= 1; break;
      case 'green-thumb': progress = gameState.actionsThisSession; done = progress >= ach.goal; break;
      case 'watering-can': progress = (gameState.actionsThisSession % 50) || 0; done = progress >= ach.goal; break;
      case 'pumpkin-mania': progress = gameState.plots.filter(p => p.seedId === 'pumpkin').length; done = progress >= ach.goal; break;
      case 'christmas': progress = gameState.plots.filter(p => p.seedId === 'christmas-tree').length; done = progress >= ach.goal; break;
      case 'latifondista': done = gameState.maxPlots >= 8; break;
      case 'botanist': progress = Object.keys(gameState.collection || {}).length; done = progress >= ach.goal; break;
      case 'hero-gardener': 
        // Special: check if rainbow rose grown after 7 days
        const rainbowRose = gameState.plots.find(p => p.seedId === 'rainbow-rose');
        done = rainbowRose && rainbowRose.plantedAt && (Date.now() - rainbowRose.plantedAt) >= 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    const reward = `${fmt(ach.rewardCoins)} 💰 ${ach.rewardGems > 0 ? `+ ${fmt(ach.rewardGems)} 💎` : ''}`;
    const claimBtn = done && !ach.claimed 
      ? `<button class="goal-claim" onclick="claimAchievement('${ach.id}')">Riscuoti!</button>` 
      : (ach.claimed ? 'Riscosso' : 'In corso');
    
    container.innerHTML += `
      <div class="goal ${ach.final ? 'goal-final' : ''}">
        <span class="goal-emoji">${ach.emoji}</span>
        <div class="goal-body">
          <div class="goal-name">${ach.name} ${ach.final && '<span class="final-tag">FINALE</span>'}</div>
          <div class="goal-desc">${ach.desc}</div>
          <div class="goal-prog">
            <div class="goal-bar"><div class="goal-fill" style="width: ${Math.min(100, (progress / ach.goal) * 100)}%"></div></div>
            <span class="goal-count">${fmt(progress)}/${fmt(ach.goal)}</span>
          </div>
          <div class="goal-reward">Premio: ${reward}</div>
          <button class="goal-claim ${ach.claimed ? 'disabled' : ''}" ${ach.claimed ? 'disabled' : ''}>${claimBtn}</button>
        </div>
      </div>
    `;
  });
}

// Render album
function renderAlbum() {
  const container = document.getElementById('album-section');
  if (!container) return;
  
  const collected = Object.keys(gameState.collection || {}).length;
  container.innerHTML = `
    <div class="album-grid">
      ${Object.entries(SEEDS).map(([sid, seed]) => `
        <div class="album-card ${gameState.collection && gameState.collection[sid] ? 'album-found' : 'album-locked'}">
          <span class="album-emoji">${seed.emoji}</span>
          <span class="album-name">${seed.name}</span>
          <span class="album-collected">${gameState.collection && gameState.collection[sid] ? 'Riscoperto' : 'Bloccato'}</span>
        </div>
      `).join('')}
    </div>
    <div style="text-align:center;margin-top:10px;">
      <span>Varietà scoperte: ${collected}/${Object.keys(SEEDS).length}</span>
    </div>
  `;
}

// Game actions
function buyNewPlot() {
  if (gameState.coins < gameState.nextPlotCost || gameState.plots.length >= gameState.maxPlots) return;
  
  gameState.coins -= gameState.nextPlotCost;
  gameState.plots.push({
    id: `plot-${Date.now()}`,
    seedId: null,
    water: 100,
    maxWater: 100,
    progress: 0,
    fertilized: false,
    harvested: false,
    plantedAt: null
  });
  
  // Increase max plots every 2 new plots
  if (gameState.plots.length % 2 === 0) {
    gameState.maxPlots += 1;
    // Increase next cost exponentially
    gameState.nextPlotCost = Math.round(30 * Math.pow(1.5, Math.floor(gameState.plots.length / 2)));
  }
  
  saveState();
  render();
  showToast('Nuovo campo sbloccato!');
}

function selectSeed(seedId) {
  gameState.selectedSeed = seedId;
  saveState();
  render();
}

function waterPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot || plot.water <= 0 || plot.harvested) return;
  
  const seed = SEEDS[plot.seedId];
  if (seed) {
    plot.water = Math.max(0, plot.water - seed.thirstPerTick);
    plot.actionsThisSession = (gameState.actionsThisSession || 0) + 1;
  }
  saveState();
  render();
  showToast('Pianta annaffiata');
}

function harvestPlot(plotIdx) {
  const plot = gameState.plots[plotIdx];
  if (!plot || plot.harvested) return;
  
  const seed = SEEDS[plot.seedId];
  if (!seed) return;
  
  // Grant rewards
  gameState.coins += seed.rewardCoins;
  if (seed.rewardGems > 0 && Math.random() > 0.5) {
    gameState.gems += seed.rewardGems;
  }
  
  // Mark harvested
  plot.harvested = true;
  plot.progress = 0;
  
  // Add to collection if new variety
  if (gameState.collection) {
    if (!gameState.collection[plot.seedId]) {
      gameState.collection[plot.seedId] = true;
      gameState.collectionKnown = Object.keys(gameState.collection).length;
      if (gameState.collectionKnown > gameState.collectionTotal) {
        gameState.collectionTotal = gameState.collectionKnown;
      }
    }
  }
  
  // XP gain
  const xpGain = 10;
  gameState.xp += xpGain;
  if (gameState.xp >= gameState.xpNext) {
    gameState.level += 1;
    gameState.xp -= gameState.xpNext;
    gameState.xpNext = Math.round(100 * Math.pow(1.5, gameState.level));
  }
  
  saveState();
  render();
  showToast(`Raccolto ${seed.name}! +${fmt(seed.rewardCoins)} monete`);
}

function claimAchievement(achId) {
  const ach = ACHIEVEMENTS.find(a => a.id === achId);
  if (!ach || ach.claimed) return;
  
  // Grant rewards
  gameState.coins += ach.rewardCoins;
  gameState.gems += ach.rewardGems;
  
  // Mark claimed
  ach.claimed = true;
  
  saveState();
  render();
  showToast(`Premio riscosso: ${fmt(ach.rewardCoins)} monete + ${fmt(ach.rewardGems)} gemme!`);
}

// Show toast
function showToast(msg) {
  const container = document.getElementById('toasts');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Start game loop (tick-based growth)
function startGameLoop() {
  if (gameTickInterval) clearInterval(gameTickInterval);
  
  gameTickInterval = setInterval(() => {
    if (!gameState || !gameState.plots) return;
    
    const now = Date.now();
    const delta = now - (gameState.lastTick || now);
    gameState.lastTick = now;
    
    // Water decay per tick
    gameState.plots.forEach(plot => {
      if (plot.seedId && !plot.harvested && !plot.fertilized) {
        const seed = SEEDS[plot.seedId];
        if (seed) {
          plot.water = Math.max(0, plot.water - seed.thirstPerTick * (delta / 1000));
        }
      }
    });
    
    // Check readiness
    gameState.plots.forEach(plot => {
      if (plot.harvested || !plot.seedId) return;
      
      const seed = SEEDS[plot.seedId];
      if (!seed) return;
      
      const growthPerTick = seed.growTime / 100;  // scaled for playability
      plot.progress = Math.min(seed.growTime, plot.progress + growthPerTick);
      plot.water = Math.min(plot.maxWater, plot.water + 1);  // tiny refill
      
      // Level up effect
      if (plot.progress >= seed.growTime && !plot.harvested) {
        // Already harvested in click handler
      }
    });
    
    // Level up check
    if (gameState.xp < gameState.xpNext) {
      const tinyXp = 1;
      gameState.xp += tinyXp;
      if (gameState.xp >= gameState.xpNext) {
        gameState.level += 1;
        gameState.xp -= gameState.xpNext;
        gameState.xpNext = Math.round(100 * Math.pow(1.5, gameState.level));
        showToast('Livello up! Sei ora al Livello ' + gameState.level);
      }
    }
    
    saveState();
    render();
  }, 1000); // 1 second tick
}

// Save state to localStorage
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('Salvataggio fallito', e);
  }
}

// Initialize game
function init() {
  render();
  startGameLoop();
}

// Auto-save every 30 seconds
setInterval(saveState, 30000);

// Initial render
render();