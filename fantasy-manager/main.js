// Fantasy Management Game - Main Script
// Browser-compatible, no module system required

// Initialize game when window loads
window.addEventListener('load', () => {
  // Global game state
  let gameState = {
    gold: 10,
    wood: 5,
    food: 5,
    stone: 0,
    population: 1,
    maxPopulation: 5,
    happiness: 100,
    buildings: []
  };

  let lastTick = 0;
  const tickInterval = 1000; // 1 second tick for testing

  // Player entity
  const player = {
    id: 'player_1',
    name: 'Lord',
    resources: { gold: 10, wood: 5, food: 5, stone: 0 },
    buildings: [],
    population: { count: 1, max: 5, happiness: 100 },
    
    canAfford(cost) {
      return Object.entries(cost).every(([type, amount]) => this.resources[type] >= amount);
    },
    
    pay(cost) {
      Object.entries(cost).forEach(([type, amount]) => {
        this.resources[type] -= amount;
      });
    },
    
    gainResources(amount) {
      Object.keys(amount).forEach(type => {
        this.resources[type] = (this.resources[type] || 0) + amount[type];
      });
    },
    
    save() {
      return {
        resources: { ...this.resources },
        buildings: this.buildings.map(b => ({ ...b }))
      };
    },
    
    load(data) {
      this.resources = { ...data.resources };
      this.buildings = data.buildings.map(b => ({
        id: b.id,
        type: b.type,
        level: b.level,
        position: b.position
      }));
    }
  };

  // Resource system
  const resourceSystem = {
    tickInterval: 1000,
    lastTick: 0,
    generationRates: {
      gold_mine: 1,
      lumber_camp: 1,
      farm: 1,
      quarry: 1
    },
    
    init() {
      this.lastTick = performance.now();
      this.gameLoop();
    },
    
    tick() {
      // Calculate production rates from buildings
      const rates = this.calculateRates();
      
      // Apply academy resource multiplier
      const academyLevel = player.buildings.filter(b => b.type === 'academy').reduce((sum, b) => sum + b.level, 0);
      const resourceMultiplier = 1 + (academyLevel * 0.1);
      
      // Apply resource generation with multiplier
      const finalRates = { gold: 0, wood: 0, food: 0, stone: 0 };
      Object.keys(rates).forEach(key => {
        const rate = rates[key] * resourceMultiplier;
        finalRates[key] += rate;
      });
      
      player.gainResources(finalRates);
      this.checkConsumption();
      
      // Update happiness from taverns
      this.updateHappiness();
    },
    
    const ResourceTypeMap = {
    gold_mine: 'gold',
    lumber_camp: 'wood',
    farm: 'food',
    quarry: 'stone'
  };
  
  // Building costs configuration
  const BuildingCosts = {
    gold_mine: 50,
    lumber_camp: 30,
    farm: 40,
    quarry: 60,
    tavern: 100,
    academy: 80,
    barracks: 70
  };
  
  calculateRates() {
    const total = { gold: 0, wood: 0, food: 0, stone: 0 };
    
    player.buildings.forEach(b => {
      const resourceKey = ResourceTypeMap[b.type] || b.type;
      const baseRate = this.generationRates[b.type] || 0;
      const levelMultiplier = Math.pow(b.level, 1.5);
      const rate = baseRate * levelMultiplier;
      total[resourceKey] += rate;
    });
    
    return total;
  },
    
    checkConsumption() {
      const consumption = player.population.count * 2;
      
      if (player.resources.food < consumption) {
        player.resources.gold = Math.max(0, player.resources.gold - 1);
      }
    },
    
    updateHappiness() {
      // Calculate happiness from taverns
      const tavernLevel = player.buildings.filter(b => b.type === 'tavern').reduce((sum, b) => sum + b.level, 0);
      const academyLevel = player.buildings.filter(b => b.type === 'academy').reduce((sum, b) => sum + b.level, 0);
      const barracksLevel = player.buildings.filter(b => b.type === 'barracks').reduce((sum, b) => sum + b.level, 0);
      
      // Base happiness change
      let happinessChange = tavernLevel * 5; // +5 happiness per tavern level
      
      // Academy gives resource multiplier happiness bonus
      happinessChange += academyLevel * 2;
      
      // Barracks give small happiness
      happinessChange += barracksLevel * 1;
      
      // Apply happiness change (capped at 0-100)
      player.population.happiness = Math.min(100, Math.max(0, player.population.happiness + happinessChange));
      
      // Unhappy penalty: reduce production if happiness < 50
      if (player.population.happiness < 50) {
        const penalty = Math.floor((50 - player.population.happiness) / 10);
        // Reduce all resource production by penalty amount
        player.resources.gold = Math.max(0, player.resources.gold - penalty);
        player.resources.wood = Math.max(0, player.resources.wood - penalty);
        player.resources.food = Math.max(0, player.resources.food - penalty);
        player.resources.stone = Math.max(0, player.resources.stone - penalty);
      }
    },
    
    gameLoop(timestamp) {
      const delta = timestamp - this.lastTick;
      
      if (delta >= this.tickInterval) {
        this.tick();
        lastTick = timestamp;
        updateUI();
      }
      
      requestAnimationFrame((t) => this.gameLoop(t));
    }
  };

  // Update UI
  function updateUI() {
    document.getElementById('gold').textContent = player.resources.gold;
    document.getElementById('wood').textContent = player.resources.wood;
    document.getElementById('food').textContent = player.resources.food;
    document.getElementById('stone').textContent = player.resources.stone;
    
    document.getElementById('population').textContent = player.population.count;
    document.getElementById('max-pop').textContent = player.population.max;
    
    // Update happiness display
    const happinessEl = document.getElementById('happiness');
    if (happinessEl) {
      happinessEl.textContent = player.population.happiness;
    }
  }

  // Render buildings
  function renderBuildings() {
    const container = document.getElementById('game-area');
    container.innerHTML = '';
    
    player.buildings.forEach(b => {
      const el = document.createElement('div');
      el.className = 'building';
      el.style.left = `${Math.max(0, Math.min(500, b.position.x))}px`;
      el.style.top = `${Math.max(0, Math.min(500, b.position.y))}px`;
      el.innerHTML = `
        <div class="building-header">
          <span>${getBuildingName(b.type)} Lvl ${b.level}</span>
          <span class="close-btn" data-id="${b.id}">&times;</span>
        </div>
        <div class="building-progress">
          Production: +${getProductionRate(b)} res/tick
        </div>
      `;
      container.appendChild(el);
    });
  }

  const BuildingData = {
    gold_mine: { name: 'Gold Mine', produces: 'gold', populationBonus: 2 },
    lumber_camp: { name: 'Lumber Camp', produces: 'wood', populationBonus: 2 },
    farm: { name: 'Farm', produces: 'food', populationBonus: 0 },
    quarry: { name: 'Quarry', produces: 'stone', populationBonus: 0 },
    tavern: { name: 'Tavern', produces: 'happiness', populationBonus: 5 },
    academy: { name: 'Academy', produces: 'resourceMultiplier', populationBonus: 0 },
    barracks: { name: 'Barracks', produces: 'populationCapBonus', populationBonus: 3 }
  };
  
  function getBuildingName(type) {
    return BuildingData[type] ? BuildingData[type].name : 'Building';
  }

  function getProductionRate(building) {
    const baseRates = { gold_mine: 1, lumber_camp: 1, farm: 1, quarry: 1 };
    const resourceKey = ResourceTypeMap[building.type] || building.type;
    const baseRate = baseRates[building.type] || 0;
    
    // Special building effects
    if (building.type === 'tavern') {
      return Math.floor(1 * Math.pow(building.level, 1.5)); // produces happiness indirectly
    }
    if (building.type === 'academy') {
      return Math.floor(0.5 * Math.pow(building.level, 1.5)); // resource multiplier applied elsewhere
    }
    if (building.type === 'barracks') {
      return 0; // no direct production, affects population cap
    }
    
    return Math.floor(baseRate * Math.pow(building.level, 1.5));
  }

  // Purchase building
  function purchaseBuilding(type) {
    const level = player.buildings.filter(b => b.type === type).length + 1;
    const bd = BuildingData[type];
    const baseCost = BuildingCosts[type];
    const costMultiplier = Math.pow(1.3, level - 1);
    
    if (!baseCost) {
      console.log('Unknown building type:', type);
      return;
    }
    
    // Different cost structures for different building types
    let cost;
    if (bd.produces === 'happiness') {
      // Tavern costs only gold
      cost = { gold: Math.floor(baseCost * costMultiplier) };
    } else if (bd.produces === 'resourceMultiplier') {
      // Academy costs only gold
      cost = { gold: Math.floor(baseCost * costMultiplier) };
    } else if (bd.produces === 'populationCapBonus') {
      // Barracks costs only wood
      cost = { wood: Math.floor(baseCost * costMultiplier) };
    } else {
      // Standard resource buildings - full cost structure
      cost = {
        gold: Math.floor(baseCost * costMultiplier),
        wood: Math.floor((baseCost * 0.6) * costMultiplier),
        food: Math.floor((baseCost * 0.8) * costMultiplier),
        stone: Math.floor(baseCost * costMultiplier)
      };
    }
    
    if (player.canAfford(cost)) {
      player.pay(cost);
      player.buildings.push({
        id: `${type}_${level}`,
        type: type,
        level: level,
        position: {
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 400
        }
      });
      
      updateMaxPopulation();
      updateUI();
      renderBuildings();
    }
  }

  function updateMaxPopulation() {
    const mineCount = player.buildings.filter(b => b.type === 'gold_mine').length;
    const campCount = player.buildings.filter(b => b.type === 'lumber_camp').length;
    player.population.max = 5 + mineCount * 2 + campCount * 2;
  }

  // Remove building
  function removeBuilding(id) {
    const index = player.buildings.findIndex(b => b.id === id);
    if (index > -1) {
      player.resources.gold = Math.floor(player.resources.gold + 25);
      player.buildings.splice(index, 1);
      updateUI();
      renderBuildings();
    }
  }

  // Save game
  function saveGame() {
    localStorage.setItem('fantasy_manager_save', JSON.stringify({
      ...gameState,
      gold: player.resources.gold,
      wood: player.resources.wood,
      food: player.resources.food,
      stone: player.resources.stone,
      population: player.population.count,
      maxPopulation: player.population.max,
      happiness: player.population.happiness,
      buildings: player.buildings
    }));
    alert('Game saved!');
  }

  // Load game
  function loadGame() {
    const data = JSON.parse(localStorage.getItem('fantasy_manager_save'));
    if (data) {
      player.load(data);
      updateMaxPopulation();
      updateUI();
      renderBuildings();
      alert('Game loaded!');
    } else {
      alert('No save file found!');
    }
  }

  // Initialize event listeners
  function initEventListeners() {
    // Building purchase
    document.querySelectorAll('.build-btn').forEach(btn => {
      btn.addEventListener('click', (e) => purchaseBuilding(e.target.dataset.type));
    });
    
    // Save/Load
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);
    
    // Building close buttons (delegated)
    document.getElementById('game-area').addEventListener('click', (e) => {
      if (e.target.classList.contains('close-btn')) {
        const id = e.target.dataset.id;
        removeBuilding(id);
      }
    });
  }

  // Start game
  resourceSystem.init();
  initEventListeners();
  updateUI();
  renderBuildings();
});