// Player class for Fantasy Management Game
// Browser-compatible - no module system required

class Player {
  constructor() {
    this.id = 'player_1';
    this.name = 'Lord';
    this.resources = {
      gold: 10,
      wood: 5,
      food: 5,
      stone: 0
    };
    this.buildings = [];
    this.population = {
      count: 1,
      max: 5,
      happiness: 100
    };
  }

  canAfford(cost) {
    return Object.entries(cost).every(([type, amount]) => this.resources[type] >= amount);
  }

  pay(cost) {
    Object.entries(cost).forEach(([type, amount]) => {
      this.resources[type] -= amount;
    });
  }

  gainResources(amount) {
    Object.keys(amount).forEach(type => {
      this.resources[type] = (this.resources[type] || 0) + amount[type];
    });
  }

  save() {
    return {
      id: this.id,
      name: this.name,
      resources: { ...this.resources },
      buildings: this.buildings.map(b => ({ ...b }))
    };
  }

  load(data) {
    this.resources = { ...data.resources };
    this.buildings = data.buildings.map(b => ({
      id: b.id,
      type: b.type,
      level: b.level,
      position: b.position
    }));
  }
}

// Make available globally
window.Player = Player;