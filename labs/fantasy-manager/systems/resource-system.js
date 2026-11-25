// Resource System for Fantasy Management Game
// Browser-compatible

function ResourceSystem(player) {
  this.player = player;
  this.tickInterval = 1000; // 1 second for testing
  this.lastTick = 0;
  this.generationRates = {
    gold_mine: 1,
    lumber_camp: 1,
    farm: 1,
    quarry: 1
  };
}

ResourceSystem.prototype.updateTickInterval = function(interval) {
  this.tickInterval = interval;
};

ResourceSystem.prototype.tick = function() {
  const rates = this.calculateRates();
  this.player.gainResources(rates);
  this.checkConsumption();
};

ResourceSystem.prototype.calculateRates = function() {
  const total = { gold: 0, wood: 0, food: 0, stone: 0 };

  this.player.buildings.forEach(b => {
    const baseRate = this.generationRates[b.type] || 0;
    const levelMultiplier = Math.pow(b.level, 1.5);
    const rate = baseRate * levelMultiplier;

    total[b.type] += rate;
  });

  return total;
};

ResourceSystem.prototype.checkConsumption = function() {
  const consumption = this.player.population.count * 2;

  if (this.player.resources.food < consumption) {
    this.player.resources.gold = Math.max(0, this.player.resources.gold - 1);
  }
};

ResourceSystem.prototype.startGameLoop = function() {
  this.lastTick = performance.now();
  this.gameLoop();
};

ResourceSystem.prototype.gameLoop = function(timestamp) {
  const delta = timestamp - this.lastTick;

  if (delta >= this.tickInterval) {
    this.tick();
    this.lastTick = timestamp;
  }

  requestAnimationFrame((t) => this.gameLoop(t));
};

// Make available globally
window.ResourceSystem = ResourceSystem;